// ===== 跃动智体 — AI API 路由（服务端，API Key 不暴露给前端）=====
import { NextRequest, NextResponse } from "next/server";

// ===== 类型定义 =====
interface AIRequest {
  type: "student-report" | "class-report";
  studentId?: string;
  sourceRecordId?: string;
  sourceRecordDate?: string;
  sourceSummary?: string;
  sourceBatchId?: string;
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
          id: `AI-S-${body.studentId ?? "001"}-mock-${Date.now()}`,
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
          sourceBatchId: body.sourceBatchId,
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
          id: `AI-S-${body.studentId ?? "001"}-${Date.now()}`,
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
          id: `AI-C-001-${Date.now()}`,
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
2. 综合分析模式（多项目）：当学生录入了多个项目时，进行全面的体质画像分析。
3. 正式体测全维度分析模式（batch_report）：生成完整、有厚度的正式体测分析报告，必须包含所有要求的板块。

【正式体测全维度报告要求 — batch_report 专用】
当 reportType 为 batch_report 时，你必须生成一份"大体量全维度报告"，而不是简单摘要：
- dimensions 必须返回全部6个维度（身体形态、心肺耐力、速度能力、爆发力、柔韧性、肌肉力量），不允许空数组。
- 每个维度必须包含 relatedItems（关联项目中文名）、analysis（2-3句分析）、suggestion（提升建议）。
- 必须逐项分析所有6个正式体测项目（itemScores），缺失项目标记"暂无数据"。
- 必须分析项目间的关系（relationshipAnalysis），至少2-3条。
- 必须输出3阶段训练方案（stageTrainingPlan），不要只给单周计划。
- 必须给出3条教学参考（teachingSuggestions），每条包含教师观察要点。
- safetyReminders 必须至少6条，覆盖热身、强度递进、身体不适处理、装备、恢复等方面。
- 摘要（summary）必须至少5句话，涵盖整体评价、优势、短板、与上次的对比变化。

【数据不完整处理规则 — 必须严格遵守】
- 只分析学生实际提供了数据的项目，严禁推测、假设或填补缺失项目的数据。
- 未录入项目必须在报告中明确标注"暂无数据"或"建议后续补充记录"。
- 数据完整度不足时，只能生成局部分析和有限的训练建议，不得生成完整的体质综合评价。
- 综合评分（overallScore）仅基于实际录入项目计算，不得推断。
- 训练计划优先围绕已录入项目和学生目标生成，可建议补充记录项目但不可假定其成绩。
- 在 fitnessProfile.summary 中，如果数据不完整，第一句话必须说明"本次分析仅基于已录入的N个项目"。
- 对于正式体测记录，对比国家标准给出等级评价；对于日常训练记录，关注进步趋势而非绝对评分。

训练计划要循序渐进，适合校园体育锻炼场景（高中）。
如果学生体感疲劳较高（≥7/10），必须在训练建议中明确提醒降低强度，并建议告知体育教师。
如果学生有身体不适状况，训练计划中必须避免可能加重不适的动作。
所有训练建议必须标注"需经体育教师审核授权后实施"。
输出结构化JSON，不要输出任何其他内容。`;
}

function buildStudentUserPrompt(data: Record<string, unknown>): string {
  const currentRecord = data.currentRecord as { items?: { itemId: string; value: number; feedbackJson?: string }[]; recordType?: string };
  const itemCount = currentRecord?.items?.length ?? 0;
  const recordType = currentRecord?.recordType ?? "official_test";
  const reportType = (data.reportType as string) || (itemCount <= 1 ? "item_report" : "record_report");
  const analysisScope = (data.analysisScope as string) || "";
  const relatedDailyRecords = Array.isArray(data.relatedDailyRecords) ? data.relatedDailyRecords : [];
  const completeness = data.completeness as { recordedCount: number; expectedCount: number; completionRate: number; missingItems: string[] } | undefined;
  const totalExpectedItems = completeness?.expectedCount ?? 6;

  // 反馈摘要
  const feedbackLines = currentRecord?.items
    ?.filter(i => i.feedbackJson)
    .map(i => `- ${i.itemId}: ${i.feedbackJson}`) ?? [];

  const completenessNote = itemCount < totalExpectedItems
    ? `\n⚠️ 数据完整性提醒：该记录仅包含 ${itemCount}/${totalExpectedItems} 项体测数据。分析时只分析已录入项目，不得推断未录入项目。`
    : "";

  const recordTypeNote = recordType === "daily_training"
    ? `\n【记录类型：日常训练】关注训练感受和过程追踪，不需严格对比国家标准。`
    : `\n【记录类型：正式体测】参考国家学生体质健康标准。`;

  const reportTypeInstructions: Record<string, string> = {
    item_report: `\n【报告类型：单项专项报告】
仅分析 ${currentRecord?.items?.[0]?.itemId ?? "该项目"} 这一个项目：
- 正式体测成绩是该项目的阶段性基线，请先说明正式体测表现
- relatedDailyRecords 是该项目的日常训练过程数据，请结合训练次数、最近训练、疲劳/恢复/酸痛等信息观察过程变化
- 可以把正式体测表现与日常训练过程分开说明，也可以综合判断下一步训练重点
- 结合项目级反馈（如下）生成针对性建议
- trainingPlan 聚焦该项目，输出2-3个专项训练动作
- weaknessAnalysis 只分析该项目
- 不要把日常训练当作正式体测评分，不要用日常训练补全其他缺失项目
- 不评价其他未录入项目`,
    record_report: `\n【报告类型：本次记录分析报告】
分析本次录入的 ${itemCount} 个项目：
- 每个项目逐一分析，不要生成完整体质综合评价
- 结合项目级反馈给出个性化建议
- 明确标注未录入项目为"待补充"
- trainingPlan 围绕已录项目生成`,
    batch_report: `\n【报告类型：正式体测全维度分析报告】

⚠️ 这是正式体测综合报告，必须生成完整的全维度分析内容。只使用正式体测数据，不要混入日常训练。

你必须做到：
1. **逐项分析**：对每个正式体测项目（肺活量、50米跑、立定跳远、坐位体前屈、引体向上/仰卧起坐、1000米/800米跑）给出成绩、得分、等级、分析、建议。缺失项目标记"暂无数据"。
2. **六维评价**：必须返回6个维度（身体形态、心肺耐力、速度能力、爆发力、柔韧性、肌肉力量），每个维度包含relatedItems、analysis、suggestion字段。不允许返回空dimensions数组。
3. **项目关系分析**：分析项目间的关联（如速度+爆发力、心肺+耐力、柔韧+跑步动作），至少给出2-3条关系分析。
4. **优势项目分析**：分析表现好的项目为什么好，以及如何作为其他训练的基础。
5. **阶段训练方案**：输出3个训练阶段（适应→强化→巩固），每阶段包含目标、时长、训练动作、恢复建议。
6. **教学参考**：给体育教师3条课堂指导建议，包含观察要点。
7. **安全提醒**：至少6条，覆盖热身、强度递进、不适处理、装备、恢复等方面。
8. 所有内容必须标注"需经体育教师审核后使用"。`,
  };

  const feedbackNote = feedbackLines.length > 0
    ? `\n【项目级反馈】\n${feedbackLines.join("\n")}\n训练建议请结合上述反馈。`
    : "";
  const dailyNote = reportType === "item_report"
    ? `\n【同项目日常训练记录】共 ${relatedDailyRecords.length} 条。若为空，请只基于正式体测和项目反馈分析；若不为空，请作为训练过程观察依据。`
    : "";

  const scopeNote = analysisScope
    ? `\n【分析范围】${analysisScope === "formal_overall" ? "正式体测全维度分析 — 仅使用正式体测数据" : analysisScope === "item_assessment" ? "单项评估 — 正式体测为基线，日常训练为过程观察" : analysisScope === "record_report" ? "本次记录反馈 — 针对当前记录局部分析" : ""}`
    : "";

  return `请分析以下学生体测数据：
${JSON.stringify(data, null, 2)}
${scopeNote}${completenessNote}${recordTypeNote}${reportTypeInstructions[reportType] ?? reportTypeInstructions.record_report}${feedbackNote}${dailyNote}

请以JSON格式返回（严格按照此结构，所有字段必须填写）：

${
  reportType === "batch_report"
    ? `{
  "reportType": "batch_report",
  "fitnessProfile": {
    "summary": "完整摘要（不少于5句话，涵盖整体表现、优势、短板、与上次对比）",
    "bmiStatus": "BMI值和状态说明",
    "overallScore": 0,
    "overallGrade": "excellent|good|pass|improve",
    "dimensions": [
      {
        "key": "body_composition|cardiorespiratory|speed|explosive_power|flexibility|muscle_strength",
        "label": "身体形态|心肺耐力|速度能力|爆发力|柔韧性|肌肉力量",
        "score": 0,
        "grade": "excellent|good|pass|improve",
        "classAverage": 0,
        "relatedItems": ["关联项目中文名"],
        "analysis": "维度分析（2-3句话）",
        "suggestion": "提升建议（1-2句话）"
      }
    ],
    "strengths": ["优势项1", "优势项2"],
    "improvements": ["待提升项1", "待提升项2"]
  },
  "itemScores": [
    {
      "itemId": "vital_capacity|50m_run|standing_long_jump|sit_and_reach|pull_up|sit_up|1000m_run|800m_run",
      "itemName": "中文项目名",
      "valueText": "成绩值和单位",
      "score": 0,
      "grade": "excellent|good|pass|improve",
      "statusLabel": "优势项|稳定项|需关注项",
      "analysis": "项目分析说明",
      "suggestion": "训练建议"
    }
  ],
  "relationshipAnalysis": [
    {
      "title": "关系分析标题",
      "relatedItems": ["项目1", "项目2"],
      "analysis": "关系分析说明",
      "suggestion": "针对性建议"
    }
  ],
  "strengthsAnalysis": [
    {
      "item": "优势项目名和分数",
      "reason": "为什么表现好",
      "foundationFor": "可作为哪些项目的训练基础"
    }
  ],
  "weaknessAnalysis": [
    {
      "item": "项目名",
      "currentLevel": "当前等级和成绩",
      "possibleCauses": ["原因1", "原因2"],
      "improvementPotential": "提升方向和潜力",
      "priority": "high|medium",
      "relatedDimensions": ["关联维度"]
    }
  ],
  "trainingPlan": [
    {
      "weekNumber": 1,
      "focus": "本周训练重点",
      "exercises": [{ "name": "", "description": "", "sets": "", "frequency": "", "duration": "", "notes": "" }],
      "recoveryAdvice": ""
    }
  ],
  "stageTrainingPlan": [
    {
      "stage": "第1阶段：适应与动作质量",
      "goal": "阶段目标",
      "duration": "2-3周",
      "focus": "训练重点",
      "exercises": [{ "name": "", "description": "", "sets": "", "frequency": "", "duration": "", "notes": "" }],
      "recoveryAdvice": ""
    },
    {
      "stage": "第2阶段：能力强化",
      "goal": "阶段目标",
      "duration": "3-4周",
      "focus": "训练重点",
      "exercises": [{ "name": "", "description": "", "sets": "", "frequency": "", "duration": "", "notes": "" }],
      "recoveryAdvice": ""
    },
    {
      "stage": "第3阶段：综合巩固",
      "goal": "阶段目标",
      "duration": "2-3周",
      "focus": "训练重点",
      "exercises": [{ "name": "", "description": "", "sets": "", "frequency": "", "duration": "", "notes": "" }],
      "recoveryAdvice": ""
    }
  ],
  "teachingSuggestions": [
    {
      "scenario": "课堂教学|分层指导|练习形式",
      "suggestion": "给教师的具体建议",
      "observationPoint": "教师需观察的要点"
    }
  ],
  "safetyReminders": ["安全提醒1", "安全提醒2", "安全提醒3", "安全提醒4", "安全提醒5", "安全提醒6"]
}`
    : `{
  "reportType": "${reportType}",
  "fitnessProfile": { "summary": "", "bmiStatus": "", "overallScore": 0, "overallGrade": "", "dimensions": [], "strengths": [], "improvements": [] },
  "weaknessAnalysis": [{ "item": "", "currentLevel": "", "possibleCauses": [], "improvementPotential": "" }],
  "trainingPlan": [{ "weekNumber": 1, "focus": "", "exercises": [{ "name": "", "description": "", "sets": "", "frequency": "", "duration": "", "notes": "" }], "recoveryAdvice": "" }],
  "safetyReminders": [""]
}`
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
        sourceBatchId: typeof (report as Record<string, unknown>).sourceBatchId === "string" ? (report as Record<string, unknown>).sourceBatchId as string : undefined,
      }
    );
    return;
  }

  await upsertAIReportForReview("class", report as unknown as AIClassReport, report._mode);
}
