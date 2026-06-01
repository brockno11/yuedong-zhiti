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
  sourceMeta?: Record<string, unknown>;
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
        const studentData = body.studentData as Record<string, unknown> | undefined;
        const reportType = (studentData?.reportType as AIStudentReport["reportType"]) || "record_report";
        const report = {
          ...mockAIStudentReport,
          id: `AI-S-${body.studentId ?? "001"}-mock-${Date.now()}`,
          studentId: body.studentId ?? mockAIStudentReport.studentId,
          reportType,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
          sourceBatchId: body.sourceBatchId,
          sourceMeta: body.sourceMeta as AIStudentReport["sourceMeta"],
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

    // 调用 DeepSeek API
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
        max_tokens: 8192,
      }),
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI API] DeepSeek 调用失败:", response.status, errorText);

      const studentDataFail = body.studentData as Record<string, unknown> | undefined;
      const failReportType: AIStudentReport["reportType"] = (studentDataFail?.reportType as AIStudentReport["reportType"]) || "record_report";
      const report = {
        ...(type === "student-report" ? mockAIStudentReport : mockAIClassReport),
        ...(type === "student-report" ? {
          studentId: body.studentId ?? mockAIStudentReport.studentId,
          reportType: failReportType,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
          sourceBatchId: body.sourceBatchId,
          sourceMeta: body.sourceMeta as AIStudentReport["sourceMeta"],
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
    const realStudentData = body.studentData as Record<string, unknown> | undefined;
    const realReportType: AIStudentReport["reportType"] = (realStudentData?.reportType as AIStudentReport["reportType"]) || "record_report";
    const report = type === "student-report"
      ? {
          ...mockAIStudentReport,
          reportType: realReportType,
          ...parsed,
          id: `AI-S-${body.studentId ?? "001"}-${Date.now()}`,
          studentId: body.studentId ?? mockAIStudentReport.studentId,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
          sourceBatchId: body.sourceBatchId,
          sourceMeta: body.sourceMeta as AIStudentReport["sourceMeta"],
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

    const fallbackType = body?.type === "class-report" ? "class" : "student";
    const errorStudentData = body?.studentData as Record<string, unknown> | undefined;
    const errorReportType: AIStudentReport["reportType"] = (errorStudentData?.reportType as AIStudentReport["reportType"]) || "record_report";
    const report = {
      ...(fallbackType === "class" ? mockAIClassReport : mockAIStudentReport),
      ...(fallbackType === "student" ? {
        studentId: body?.studentId ?? mockAIStudentReport.studentId,
        reportType: errorReportType,
        sourceRecordId: body?.sourceRecordId,
        sourceRecordDate: body?.sourceRecordDate,
        sourceSummary: body?.sourceSummary,
        sourceBatchId: body?.sourceBatchId,
        sourceMeta: body?.sourceMeta,
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
  return `你是高中体育教师助手，为高中生提供体育锻炼分析参考。你依据《国家学生体质健康标准（2014年修订）》及体育与健康核心素养（运动能力、健康行为、体育品德）开展工作。

# 核心遵循
- "健康第一"、"教会、勤练、常赛"
- 训练循序渐进，动作质量优先，不提倡过早专项化和过度训练
- 青少年运动科学参考：结合 WHO/CDC 对5-17岁儿童青少年的身体活动建议（平均每天≥60分钟中高强度、每周≥3天较高强度有氧及增强肌肉骨骼活动）和 NSCA 青少年训练原则（合格监督、动态热身、轻负荷起步、技术优先、渐进负荷、重视恢复）

# 必须做到
- 语言积极鼓励，保护学生自尊
- 训练建议必须标注"需经体育教师审核后使用"
- 只分析实际提供数据的项目，严禁推测缺失数据
- 缺失项目标注"暂无数据"或"建议后续补充记录"
- 综合评分仅基于实际录入项目计算，不得推断
- 所有 AI 内容必须标注"AI生成，需经体育教师审核后使用"

# 严禁事项
- 医学用语："诊断""治疗""处方"
- 负面标签："差""很差""不行""肥胖""超重"
- 比较性用语："排名""倒数"
- 数据造假：推断、补全、平均值填充缺失项目
- 日常训练生成正式等级评价
- 对未直接测量的能力使用"推测""暗示"等表达。只能写"建议教师进一步观察"或"暂无直接数据"

# 替代表达映射
- "差/不及格" → "有提升空间/值得关注"
- "肥胖/超重" → "BMI指标值得关注"
- "诊断/治疗/处方" → "建议/参考/锻炼方案"

# 数据来源规则（严格遵守）
1. official_test = 阶段性基线 → 等级评价 + 维度分析
2. daily_training = 过程观察 → 趋势判断 + 训练习惯分析
3. 日常训练不参与正式体测评分，不补全缺失项目
4. batch_report 只使用正式体测数据
5. item_report = 正式体测基线 + 同项目日常训练 + 问答反馈

输出严格 JSON，不要输出其他任何内容。`;
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

  const feedbackLines = currentRecord?.items
    ?.filter(i => i.feedbackJson)
    .map(i => `- ${i.itemId}: ${i.feedbackJson}`) ?? [];

  const completenessNote = itemCount < totalExpectedItems
    ? `\n⚠️ 数据完整性：仅包含 ${itemCount}/${totalExpectedItems} 项数据。只分析已录入项目，不得推断缺失项目。`
    : "";

  const recordTypeNote = recordType === "daily_training"
    ? `\n【记录类型：日常训练】关注训练感受和过程追踪，不严格对比国家标准。`
    : `\n【记录类型：正式体测】参考国家学生体质健康标准高中部分。`;

  const reportTypeInstructions: Record<string, string> = {
    item_report: `\n【报告类型：item_report 单项深度分析】
仅分析该项目。正式体测为阶段性基线 + 同项目日常训练为过程观察 + 问答反馈为体感洞察。

必须输出的模块：
1. dataSourceSummary — 说明本报告使用的数据源
2. headlineInsight — 一句话结论（学生可读）
3. fitnessProfile.summary — 3-5句专项总览
4. formalBaseline — { itemName, valueText, score, grade, date, analysis } 正式体测基线分析
5. dailyTrainingTrend — { recordCount, latestDate, trend("提升中"|"基本稳定"|"有波动"|"数据不足"), stability, fatigueSummary, sorenessSummary, note }
   若日常训练为0条，trend="数据不足"，note="暂无同项目日常训练记录，仅基于正式体测基线分析"
6. itemDeepAnalysis.abilityBreakdown — 4-6项能力拆解 { ability, description, currentLevel, improvement }
7. itemDeepAnalysis.influencingFactors — 3-4个因素 { factor(动作质量|节奏|力量|柔韧|耐力|恢复|训练频率|体感), status, suggestion }
8. itemDeepAnalysis.relatedItems — 2-3条 { itemName(中文), relationship }
9. itemDeepAnalysis.progressiveGoals — 短期(1-2周)/中期(3-6周)/长期(6-12周) { stage, target, timeline, actions[] }
10. feedbackInsights — [ { factor, observation, implication } ] 基于问答反馈的洞察
11. trainingPlan — 2-4个专项训练动作，必须写成“动作教学卡”，每个动作都要让学生知道怎么练、练多久、怎么进阶：
   {
     name, purpose, description,
     actionSteps[4-6条具体动作步骤],
     keyPoints[3-5条训练要点],
     commonMistakes[2-4条常见错误与纠正],
     sets, frequency, duration, intensity,
     progression(2-4周如何增加难度),
     selfCheck(学生自测达标标准),
     cycleAdvice(建议执行周期与复测节点),
     notes
   }
   每个动作说明要具体到姿势、节奏、呼吸、休息和安全提醒，不要只写一句话。
12. safetyReminders — 至少5条该项目专项安全提醒
13. teacherReviewNotes — 至少2条需要教师重点审核的内容`,
    record_report: `\n【报告类型：record_report 本次记录反馈】
分析本次录入的${itemCount}个项目：
- 每个项目逐一分析，不生成完整体质综合评价
- 结合项目级反馈给出个性化建议
- 明确标注未录入项目为"待补充"
- trainingPlan 围绕已录项目生成`,
    batch_report: `\n【报告类型：batch_report 正式体测全维度分析】
这是正式体测全维度画像报告。只使用正式体测数据，严禁混入日常训练。

必须生成以下所有13个模块（不允许省略任何模块）：

[模块1] dataSourceSummary — 数据来源说明(批次+日期+项目数+完整度)
[模块2] headlineInsight — 一句话结论(学生可读)：当前整体状态+最值得保持的优势+最值得关注的方向
[模块3] completeness — { recordedCount, expectedCount, completionRate, missingItems[], note }
[模块4] fitnessProfile.summary — 至少5句：整体体质表现+优势维度+关注维度+与上次变化+训练方向+教师审核提醒
[模块5] fitnessProfile.dimensions — 6个维度全部返回(不允许空数组)：
  身体形态/心肺耐力/速度能力/爆发力/柔韧性/肌肉力量
  每个维度：{ key, label, score, grade, classAverage, relatedItems[], analysis(2-3句), suggestion }
[模块6] itemScores — 逐项分析每个正式体测项目：
  肺活量/50米跑/立定跳远/坐位体前屈/引体向上(男)/仰卧起坐(女)/1000米跑(男)/800米跑(女)
  每项：{ itemId, itemName, valueText, score, grade, statusLabel(优势项|稳定项|需关注项), analysis, suggestion }
  缺失项目statusLabel="暂无数据"
[模块7] relationshipAnalysis — 至少3条项目关系分析：
  { title, relatedItems[], analysis, suggestion }
  例如：50米跑与立定跳远共同反映下肢爆发力；肺活量与中长跑共同反映心肺耐力基础
[模块8] strengthsAnalysis — 每个优势项：{ item(名称+分数), reason(为什么好), foundationFor(可支撑哪些能力) }
[模块9] weaknessAnalysis — 按优先级排序的需关注项目：
  { item, currentLevel, possibleCauses[], improvementPotential, priority("high"|"medium"), relatedDimensions[] }
[模块10] stageTrainingPlan — 3阶段(适应→强化→巩固)：
  每阶段：{ stage, goal, duration, focus, exercises[{name,description,sets,frequency,duration,notes}], recoveryAdvice }
[模块11] teachingSuggestions — 至少3条：{ scenario(课堂教学|分层指导|练习形式|家校协同), suggestion, observationPoint }
[模块12] safetyReminders — 至少6条字符串：热身+强度递进+不适处理+恢复+睡眠+装备+教师沟通
[模块13] teacherReviewNotes — 至少3条教师需重点审核的内容

如有历史批次数据，生成 comparisonWithPreviousBatch：
{ previousBatchName, previousDate, changes[{item,previous,current,trend("up"|"stable"|"down"),note}], summary }

⚠️ 所有训练建议必须标注"需经体育教师审核后使用"。`,
  };

  const feedbackNote = feedbackLines.length > 0
    ? `\n【项目级反馈（问答数据）】\n${feedbackLines.join("\n")}\n请在分析中使用这些反馈数据判断动作质量、疲劳、恢复、体感状态。`
    : "";
  const dailyNote = reportType === "item_report"
    ? `\n【同项目日常训练记录】共${relatedDailyRecords.length}条。若为空则dailyTrainingTrend.trend="数据不足"；若不为空则分析训练频率、成绩变化、疲劳与恢复模式。`
    : "";

  const scopeNote = analysisScope
    ? `\n【分析范围】${analysisScope === "formal_overall" ? "正式体测全维度分析" : analysisScope === "item_assessment" ? "单项深度分析" : "本次记录反馈"}`
    : "";

  const schema = buildReportSchema(reportType);

  return `请分析以下学生体测数据：
${JSON.stringify(data, null, 2)}
${scopeNote}${completenessNote}${recordTypeNote}${reportTypeInstructions[reportType] ?? reportTypeInstructions.record_report}${feedbackNote}${dailyNote}

请严格按以下 JSON 结构返回（所有中文文本字段必须用中文填写，不要省略任何模块）：
${schema}

所有训练建议必须标注"需经体育教师审核后使用"。`;
}

function buildReportSchema(reportType: string): string {
  if (reportType === "batch_report") {
    return `{
  "reportType": "batch_report",
  "dataSourceSummary": "本报告基于[批次名]正式体测数据生成，包含N个项目，完整度N%。日常训练未参与评分。",
  "headlineInsight": "一句话总结当前体质状态和最重要的下一步方向",
  "completeness": { "recordedCount": 0, "expectedCount": 6, "completionRate": 0, "missingItems": ["项目名"], "note": "完整度说明" },
  "fitnessProfile": {
    "summary": "至少5句整体评价：整体表现+优势维度+关注维度+与上次对比+训练方向+审核提醒",
    "bmiStatus": "BMI值和状态",
    "overallScore": 0, "overallGrade": "excellent|good|pass|improve",
    "dimensions": [
      { "key": "body_composition", "label": "身体形态", "score": 0, "grade": "excellent|good|pass|improve", "classAverage": 0, "relatedItems": ["身高体重"], "analysis": "2-3句维度分析", "suggestion": "提升建议" },
      { "key": "cardiorespiratory", "label": "心肺耐力", "score": 0, "grade": "...", "classAverage": 0, "relatedItems": ["肺活量","1000米跑或800米跑"], "analysis": "...", "suggestion": "..." },
      { "key": "speed", "label": "速度能力", "score": 0, "grade": "...", "classAverage": 0, "relatedItems": ["50米跑"], "analysis": "...", "suggestion": "..." },
      { "key": "explosive_power", "label": "爆发力", "score": 0, "grade": "...", "classAverage": 0, "relatedItems": ["立定跳远"], "analysis": "...", "suggestion": "..." },
      { "key": "flexibility", "label": "柔韧性", "score": 0, "grade": "...", "classAverage": 0, "relatedItems": ["坐位体前屈"], "analysis": "...", "suggestion": "..." },
      { "key": "muscle_strength", "label": "肌肉力量", "score": 0, "grade": "...", "classAverage": 0, "relatedItems": ["引体向上(男)或仰卧起坐(女)"], "analysis": "...", "suggestion": "..." }
    ],
    "strengths": ["优势项"], "improvements": ["待提升项"]
  },
  "itemScores": [
    { "itemId": "vital_capacity", "itemName": "肺活量", "valueText": "3200ml", "score": 78, "grade": "pass", "statusLabel": "稳定项", "analysis": "项目分析", "suggestion": "建议" }
  ],
  "relationshipAnalysis": [
    { "title": "关系标题(如速度与爆发力的协同)", "relatedItems": ["50米跑","立定跳远"], "analysis": "关系分析说明", "suggestion": "针对性建议" }
  ],
  "strengthsAnalysis": [
    { "item": "优势项名称和分数", "reason": "为什么表现好", "foundationFor": "可作为哪些项目的基础" }
  ],
  "weaknessAnalysis": [
    { "item": "需关注的项目名", "currentLevel": "当前成绩和等级", "possibleCauses": ["可能原因"], "improvementPotential": "提升方向和潜力", "priority": "high|medium", "relatedDimensions": ["关联维度"] }
  ],
  "stageTrainingPlan": [
    { "stage": "第1阶段：适应与动作质量", "goal": "目标", "duration": "2-3周", "focus": "重点", "exercises": [{ "name": "动作名", "description": "描述", "sets": "组数", "frequency": "频率", "duration": "时长", "notes": "注意" }], "recoveryAdvice": "恢复建议" },
    { "stage": "第2阶段：能力强化", "goal": "目标", "duration": "3-4周", "focus": "重点", "exercises": [...], "recoveryAdvice": "..." },
    { "stage": "第3阶段：综合巩固", "goal": "目标", "duration": "2-3周", "focus": "重点", "exercises": [...], "recoveryAdvice": "..." }
  ],
  "teachingSuggestions": [
    { "scenario": "课堂教学|分层指导|练习形式|家校协同", "suggestion": "建议", "observationPoint": "教师观察要点" }
  ],
  "safetyReminders": ["至少6条安全提醒字符串"],
  "teacherReviewNotes": ["至少3条教师需重点审核的内容"]
}`;
  }
  if (reportType === "item_report") {
    return `{
  "reportType": "item_report",
  "dataSourceSummary": "本报告基于[正式体测日期]正式体测+N条同项目日常训练+问答反馈生成",
  "headlineInsight": "一句话：当前水平+最近趋势+下一步重点",
  "fitnessProfile": { "summary": "3-5句专项总览", "bmiStatus": "", "overallScore": 0, "overallGrade": "excellent|good|pass|improve", "dimensions": [], "strengths": [], "improvements": [] },
  "formalBaseline": { "itemName": "项目中文名", "valueText": "值+单位", "score": 0, "grade": "excellent|good|pass|improve", "date": "正式体测日期", "analysis": "基线分析说明" },
  "dailyTrainingTrend": { "recordCount": 0, "latestDate": "最近日期或null", "trend": "提升中|基本稳定|有波动|数据不足", "stability": "稳定|轻微波动|明显波动", "fatigueSummary": "疲劳观察", "sorenessSummary": "酸痛观察", "note": "趋势总结" },
  "feedbackInsights": [
    { "factor": "因素(如RPE/恢复/动作质量)", "observation": "从反馈中观察到的现象", "implication": "对训练的启示" }
  ],
  "weaknessAnalysis": [
    { "item": "正式体测基线", "currentLevel": "成绩+等级", "possibleCauses": ["基线说明"], "improvementPotential": "短期努力方向" },
    { "item": "日常训练观察", "currentLevel": "训练N次/最近日期", "possibleCauses": ["趋势/疲劳/恢复观察"], "improvementPotential": "训练习惯建议" }
  ],
  "itemDeepAnalysis": {
    "abilityBreakdown": [
      { "ability": "能力名称", "description": "在此项目中的作用", "currentLevel": "当前水平描述", "improvement": "提升建议" }
    ],
    "influencingFactors": [
      { "factor": "动作质量|节奏|力量|柔韧|耐力|恢复|训练频率|体感", "status": "当前状态描述", "suggestion": "改进建议" }
    ],
    "relatedItems": [
      { "itemName": "关联项目中文名", "relationship": "与当前项目的联系" }
    ],
    "progressiveGoals": [
      { "stage": "短期(1-2周)", "target": "目标", "timeline": "1-2周", "actions": ["行动"] },
      { "stage": "中期(3-6周)", "target": "目标", "timeline": "3-6周", "actions": ["行动"] },
      { "stage": "长期(6-12周)", "target": "目标", "timeline": "6-12周", "actions": ["行动"] }
    ]
  },
  "trainingPlan": [
    {
      "weekNumber": 1,
      "focus": "训练重点",
      "exercises": [
        {
          "name": "动作名",
          "purpose": "这个动作主要提升什么能力，以及为什么适合当前项目",
          "description": "动作整体说明，至少2句话",
          "actionSteps": ["准备姿势", "开始动作", "发力/呼吸", "完成与还原", "组间休息或节奏"],
          "keyPoints": ["关键要点1", "关键要点2", "关键要点3"],
          "commonMistakes": ["常见错误1 + 纠正方法", "常见错误2 + 纠正方法"],
          "sets": "组数/次数，如3组×8次",
          "frequency": "每周频率",
          "duration": "单次时长",
          "intensity": "强度建议，如RPE 5-6/10或能完整说短句",
          "progression": "2-4周进阶方法，说明何时增加组数/次数/距离/难度",
          "selfCheck": "学生自测标准，如动作不变形、完成指定次数、成绩稳定提升",
          "cycleAdvice": "执行周期和复测节点，如连续练习4周后复测一次",
          "notes": "安全提醒，必须含需经体育教师审核后使用"
        }
      ],
      "recoveryAdvice": "恢复建议"
    }
  ],
  "safetyReminders": ["至少5条项目专项安全提醒"],
  "teacherReviewNotes": ["至少2条教师需重点审核的内容"]
}`;
  }
  return `{
  "reportType": "record_report",
  "fitnessProfile": { "summary": "本次记录总览", "bmiStatus": "", "overallScore": 0, "overallGrade": "excellent|good|pass|improve", "dimensions": [], "strengths": [], "improvements": [] },
  "weaknessAnalysis": [{ "item": "项目名", "currentLevel": "成绩+等级", "possibleCauses": ["分析"], "improvementPotential": "方向" }],
  "trainingPlan": [{ "weekNumber": 1, "focus": "重点", "exercises": [{ "name": "动作", "description": "描述", "sets": "组数", "frequency": "频率", "duration": "时长", "notes": "注意" }], "recoveryAdvice": "恢复建议" }],
  "safetyReminders": ["安全提醒"]
}`;
}

function buildClassSystemPrompt(): string {
  return `你是高中体育教研助手，依据《国家学生体质健康标准（2014年修订）》生成班级体质健康分析报告。
遵循"健康第一"的学校体育工作方针和"教会、勤练、常赛"的教学理念。
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
