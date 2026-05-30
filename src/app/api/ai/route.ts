// ===== 跃动智体 — AI API 路由（服务端，API Key 不暴露给前端）=====
import { NextRequest, NextResponse } from "next/server";

// ===== 类型定义 =====
interface AIRequest {
  type: "student-report" | "class-report";
  studentId?: string;
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

// Mock 报告（从数据层导入）
import { mockAIStudentReport, mockAIClassReport } from "@/lib/data/mock-ai-reports";

function isAIEnabled(): boolean {
  return !!DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.startsWith("sk-");
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
        return NextResponse.json({
          ...mockAIStudentReport,
          generatedAt: new Date().toISOString(),
          _mode: "mock" as const,
        } satisfies APIResponseMeta & typeof mockAIStudentReport);
      }

      return NextResponse.json({
        ...mockAIClassReport,
        generatedAt: new Date().toISOString(),
        _mode: "mock" as const,
      } satisfies APIResponseMeta & typeof mockAIClassReport);
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

    // 调用 DeepSeek API
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI API] DeepSeek 调用失败:", response.status, errorText);

      // 失败时回退到 mock
      return NextResponse.json({
        ...(type === "student-report" ? mockAIStudentReport : mockAIClassReport),
        generatedAt: new Date().toISOString(),
        _mode: "mock" as const,
        _fallback: true,
        _error: `AI 服务暂不可用（${response.status}）`,
      } satisfies APIResponseMeta & Record<string, unknown>);
    }

    const data = await response.json();
    const aiContent: string = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      id: `AI-${Date.now()}`,
      type,
      generatedAt: new Date().toISOString(),
      _mode: "ai" as const,
      _model: DEEPSEEK_MODEL,
      content: aiContent,
      ...tryParseAIResponse(aiContent, type),
    });
  } catch (error) {
    console.error("[AI API] 错误:", error);

    // 异常时返回 mock
    const fallbackType = body?.type === "class-report" ? "class" : "student";
    return NextResponse.json({
      ...(fallbackType === "class" ? mockAIClassReport : mockAIStudentReport),
      generatedAt: new Date().toISOString(),
      _mode: "mock" as const,
      _fallback: true,
      _error: error instanceof Error ? error.message : "未知错误",
    } satisfies APIResponseMeta & Record<string, unknown>);
  }
}

// ===== 提示词构建 =====

function buildStudentSystemPrompt(): string {
  return `你是中学体育教师助手。你只提供体育锻炼建议，不进行任何医学诊断。
语言要积极、鼓励、保护学生自尊。不要使用"诊断""治疗""处方""肥胖""差""不行""排名"等表达。
使用"有提升空间""待提升""值得关注""锻炼建议""训练参考"等积极表达。
分析优势项目、待提升项目、可能原因、个性化训练建议、恢复建议。
训练计划要循序渐进，适合校园体育锻炼场景。
如果学生体感疲劳较高（≥7/10），必须在训练建议中明确提醒降低强度，并建议告知体育教师。
如果学生有身体不适状况，训练计划中必须避免可能加重不适的动作。
所有训练建议必须标注"需经体育教师审核授权后实施"。
输出结构化JSON，不要输出任何其他内容。`;
}

function buildStudentUserPrompt(data: Record<string, unknown>): string {
  return `请分析以下学生体测数据并生成个人体质报告：
${JSON.stringify(data, null, 2)}

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
  return `你是中学体育教研助手。根据班级体测数据生成班级体质健康分析报告。
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
