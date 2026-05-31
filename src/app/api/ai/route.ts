// ===== 跃动智体 — AI API 路由（服务端，API Key 不暴露给前端）=====
import { NextRequest, NextResponse } from "next/server";

// ===== 类型定义 =====
interface AIRequest {
  type: "student-report" | "class-report";
  studentId?: string;
  sourceRecordId?: string;
  sourceRecordDate?: string;
  sourceSummary?: string;
  studentData?: Record<string, unknown>;
  classData?: Record<string, unknown>;
}

interface APIResponseMeta {
  _mode: "ai" | "mock";
  _fallback?: boolean;
  _model?: string;
  _error?: string;
}

// DeepSeek API 配置（仅在服务端可用，从环境变量读取）
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL =
  process.env.DEEPSEEK_MODEL || "deepseek-chat";
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);

// Mock 报告（从数据层导入）
import { mockAIStudentReport, mockAIClassReport } from "@/lib/data/mock-ai-reports";
import { upsertAIReportForReview } from "@/lib/server/data-service";
import type { AIClassReport, AIStudentReport } from "@/lib/types";

// DeepSeek 真实 API Key 特征：以 sk- 开头，长度 ≥ 32 字符，不含占位关键词
const API_KEY_PLACEHOLDERS = ["your-deepseek-api-key", "sk-your-api-key-here", "your-api-key", "sk-your-key"];
function isAIEnabled(): boolean {
  if (!DEEPSEEK_API_KEY) return false;
  if (!DEEPSEEK_API_KEY.startsWith("sk-")) return false;
  if (DEEPSEEK_API_KEY.length < 32) return false;
  const lower = DEEPSEEK_API_KEY.toLowerCase();
  if (API_KEY_PLACEHOLDERS.some((p) => lower === p.toLowerCase())) return false;
  return true;
}

export async function POST(request: NextRequest) {
  let body: AIRequest = { type: "student-report" };
  try {
    body = (await request.json()) as AIRequest;
    const { type, studentData, classData } = body;

    if (!type || !["student-report", "class-report"].includes(type)) {
      return NextResponse.json(
        { error: "无效的报告类型。支持: student-report, class-report" },
        { status: 400 }
      );
    }

    // ===== Mock 模式：未配置 API Key =====
    if (!isAIEnabled()) {
      console.log("[AI API] Mock 模式 — 未配置 DEEPSEEK_API_KEY");

      if (type === "student-report") {
        const report = {
          ...mockAIStudentReport,
          studentId: body.studentId ?? mockAIStudentReport.studentId,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
          generatedAt: new Date().toISOString(),
          _mode: "mock" as const,
        };
        await upsertAIReportForReview("student", report, "mock", {
          studentId: report.studentId,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
        });
        return NextResponse.json(report);
      }

      const report = {
        ...mockAIClassReport,
        generatedAt: new Date().toISOString(),
        _mode: "mock" as const,
      } satisfies APIResponseMeta & typeof mockAIClassReport;
      await upsertAIReportForReview("class", report, "mock");
      return NextResponse.json(report);
    }

    // ===== 真实 AI 模式 =====
    console.log("[AI API] 调用 DeepSeek API, model:", DEEPSEEK_MODEL);

    let systemPrompt: string;
    let userPrompt: string;

    if (type === "student-report") {
      systemPrompt = buildStudentSystemPrompt();
      userPrompt = buildStudentUserPrompt(studentData || {});
    } else {
      systemPrompt = buildClassSystemPrompt();
      userPrompt = buildClassUserPrompt(classData || {});
    }

    // 调用 DeepSeek API，避免外部服务慢时页面无限等待
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 4096,
      }),
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI API] DeepSeek 调用失败:", response.status, errorText);

      // 失败时回退到 mock
      const report = {
        ...(type === "student-report" ? mockAIStudentReport : mockAIClassReport),
        ...(type === "student-report" ? { studentId: body.studentId ?? mockAIStudentReport.studentId } : {}),
        ...(type === "student-report" ? {
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
        } : {}),
        generatedAt: new Date().toISOString(),
        _mode: "mock" as const,
        _fallback: true,
        _error: `AI 服务暂不可用（${response.status}）`,
      } satisfies APIResponseMeta & Record<string, unknown>;
      await persistAIResult(type, report);
      return NextResponse.json(report);
    }

    const data = await response.json();
    const aiContent: string = data.choices?.[0]?.message?.content || "";
    const parsed = tryParseAIResponse(aiContent, type);
    const report = type === "student-report"
      ? {
          ...mockAIStudentReport,
          ...parsed,
          id: `AI-S-${body.studentId ?? "001"}`,
          studentId: body.studentId ?? mockAIStudentReport.studentId,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
          generatedAt: new Date().toISOString(),
          version: mockAIStudentReport.version + 1,
          status: "pending_review" as const,
          _mode: "ai" as const,
          _model: DEEPSEEK_MODEL,
          content: aiContent,
        }
      : {
          ...mockAIClassReport,
          ...parsed,
          id: "AI-C-001",
          generatedAt: new Date().toISOString(),
          version: mockAIClassReport.version + 1,
          status: "pending_review" as const,
          _mode: "ai" as const,
          _model: DEEPSEEK_MODEL,
          content: aiContent,
        };

    await persistAIResult(type, report);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[AI API] 错误:", error);

    // 异常时返回 mock
    const fallbackType = body?.type === "class-report" ? "class" : "student";
    const report = {
      ...(fallbackType === "class" ? mockAIClassReport : mockAIStudentReport),
      ...(fallbackType === "student" ? { studentId: body.studentId ?? mockAIStudentReport.studentId } : {}),
      ...(fallbackType === "student" ? {
        sourceRecordId: body.sourceRecordId,
        sourceRecordDate: body.sourceRecordDate,
        sourceSummary: body.sourceSummary,
      } : {}),
      generatedAt: new Date().toISOString(),
      _mode: "mock" as const,
      _fallback: true,
      _error: error instanceof Error ? error.message : "未知错误",
    } satisfies APIResponseMeta & Record<string, unknown>;
    await persistAIResult(body?.type ?? "student-report", report);
    return NextResponse.json(report);
  }
}

// ===== 提示词构建 =====

function buildStudentSystemPrompt(): string {
  return `你是中学（高中）体育教师助手。你只提供体育锻炼建议，不进行任何医学诊断。
语言要积极、鼓励、保护学生自尊。不要使用"诊断""治疗""处方""肥胖""差""不行""排名"等表达。
使用"有提升空间""待提升""值得关注""锻炼建议""训练参考"等积极表达。

分析模式有两种：
1. 专项分析模式（单项目）：当学生只录入了一个体能项目时，针对该项目进行深入的技术分析。
   - 分析该项目成绩在高二年级中的水平
   - 给出该项目的具体技术要领和改进方法
   - 提供该项目的针对性训练动作（2-3个）
   - 评估该项目与其他体能维度的关联
2. 综合分析模式（多项目）：当学生录入了多个项目时，进行全面的体质画像分析。
   - 分析优势项目、待提升项目、可能原因、个性化训练建议、恢复建议

训练计划要循序渐进，适合校园体育锻炼场景（高中）。
如果学生体感疲劳较高（≥7/10），必须在训练建议中明确提醒降低强度，并建议告知体育教师。
如果学生有身体不适状况，训练计划中必须避免可能加重不适的动作。
所有训练建议必须标注"需经体育教师审核授权后实施"。
输出结构化JSON，不要输出任何其他内容。`;
}

function buildStudentUserPrompt(data: Record<string, unknown>): string {
  const itemCount = (data.currentRecord as { items?: unknown[] })?.items?.length ?? 0;

  const modeInstruction = itemCount <= 1
    ? `\n\n【专项分析模式】学生本次仅录入了一个项目，请针对该项目进行深入分析：
- 重点分析该项目成绩水平、技术要领、针对性训练方法
- weaknessAnalysis 中详细分析该项目的可能原因和改进潜力
- trainingPlan 中的训练动作应围绕该项目展开
- 仍然需要输出完整的 safetyReminders`
    : `\n\n【综合分析模式】学生录入了 ${itemCount} 个项目，请进行全面的体质画像分析。`;

  return `请分析以下学生体测数据并生成个人体质报告：
${JSON.stringify(data, null, 2)}
${modeInstruction}

请以JSON格式返回（严格按此结构）：
{
  "fitnessProfile": { "summary": "", "bmiStatus": "", "overallScore": 0, "overallGrade": "", "dimensions": [], "strengths": [], "improvements": [] },
  "weaknessAnalysis": [{ "item": "", "currentLevel": "", "possibleCauses": [], "improvementPotential": "" }],
  "trainingPlan": [{ "weekNumber": 1, "focus": "", "exercises": [{ "name": "", "description": "", "sets": "", "frequency": "", "duration": "", "notes": "" }], "recoveryAdvice": "" }],
  "safetyReminders": [""]
}

训练计划必须标注"需经体育教师审核授权后实施训练计划"。`;
}

function buildClassSystemPrompt(): string {
  return `你是高中体育教研助手。根据班级（高中生）体测数据生成班级体质健康分析报告。
分析整体表现、共性薄弱项目、学生分层指导建议。
提出课堂训练重点和分层运动指导建议。
不给任何学生贴负面标签，不点名具体学生。
不使用"差""不及格""肥胖""诊断""治疗""处方"等表达。
使用"待提升""有提升空间""值得关注""锻炼建议""训练参考"等积极表达。
所有建议必须标注"AI生成，需经体育教师审核后使用"。
输出结构化JSON，不要输出任何其他内容。`;
}

function buildClassUserPrompt(data: Record<string, unknown>): string {
  return `请分析以下班级体测数据并生成班级报告：
${JSON.stringify(data, null, 2)}

请以JSON格式返回（严格按此结构）：
{
  "overallAnalysis": { "totalStudents": 0, "recordedStudents": 0, "averageScore": 0, "passRate": 0, "excellentRate": 0, "summary": "" },
  "commonWeaknesses": [{ "itemId": "", "itemName": "", "passRate": 0, "affectedStudentCount": 0, "analysis": "" }],
  "studentTiers": [{ "tier": "A", "label": "", "count": 0, "guidance": "" }],
  "classTrainingFocus": [{ "priority": 1, "focus": "", "suggestedActivities": [""], "expectedOutcome": "" }],
  "teachingSuggestions": [""]
}`;
}

function tryParseAIResponse(content: string, _type: string): Record<string, unknown> {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    }
  } catch {
    // 无法解析，返回原始内容
  }
  return { rawContent: content };
}

async function persistAIResult(
  type: AIRequest["type"],
  report: APIResponseMeta & Record<string, unknown>
) {
  if (type === "student-report") {
    await upsertAIReportForReview(
      "student",
      report as unknown as AIStudentReport,
      report._mode,
      {
        studentId: typeof report.studentId === "string" ? report.studentId : undefined,
        sourceRecordId: typeof report.sourceRecordId === "string" ? report.sourceRecordId : undefined,
        sourceRecordDate: typeof report.sourceRecordDate === "string" ? report.sourceRecordDate : undefined,
        sourceSummary: typeof report.sourceSummary === "string" ? report.sourceSummary : undefined,
      }
    );
    return;
  }

  await upsertAIReportForReview("class", report as unknown as AIClassReport, report._mode);
}
