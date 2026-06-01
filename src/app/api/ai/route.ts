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
import { mockAIStudentReport, mockDeepItemReport, mockAIClassReport } from "@/lib/data/mock-ai-reports";
import { FITNESS_ITEMS } from "@/lib/constants";
import { upsertAIReportForReview } from "@/lib/server/data-service";
import type { AIClassReport, AIStudentReport } from "@/lib/types";

function getMockStudentReport(reportType: AIStudentReport["reportType"], studentData?: Record<string, unknown>): AIStudentReport {
  if (reportType === "item_report") {
    const targetItemId = typeof studentData?.targetItemId === "string" ? studentData.targetItemId : null;
    const itemDef = FITNESS_ITEMS.find((item) => item.id === targetItemId);
    if (itemDef) return buildServerItemFallbackReport(itemDef.id, studentData);
  }
  return reportType === "item_report" ? mockDeepItemReport : mockAIStudentReport;
}

function buildServerItemFallbackReport(itemId: (typeof FITNESS_ITEMS)[number]["id"], studentData?: Record<string, unknown>): AIStudentReport {
  const itemDef = FITNESS_ITEMS.find((item) => item.id === itemId);
  const itemName = itemDef?.name ?? "该项目";
  const currentRecord = studentData?.currentRecord as { date?: string; items?: { itemId?: string; value?: number | string; score?: number; grade?: string }[] } | undefined;
  const currentItem = currentRecord?.items?.find((item) => item.itemId === itemId);
  const valueText = currentItem?.value !== undefined ? `${currentItem.value}${itemDef?.unit ?? ""}` : "暂无数据";
  const score = typeof currentItem?.score === "number" ? currentItem.score : 0;
  const grade = typeof currentItem?.grade === "string" ? currentItem.grade : "improve";
  const actionNames = [`${itemName}技术分解练习`, `${itemName}基础能力练习`, `${itemName}节奏与稳定练习`];

  return {
    ...mockDeepItemReport,
    headlineInsight: `${itemName}专项分析暂时使用本地回退模板：当前基线为${valueText}，${score}分。AI 服务恢复后可重新生成完整分析。`,
    dataSourceSummary: `${itemName}专项 · 本地回退模板`,
    formalBaseline: {
      itemName,
      valueText,
      score,
      grade,
      date: currentRecord?.date?.slice(0, 10) ?? "暂无数据",
      analysis: "本卡片基于已录入的正式体测项目展示评分定位；缺失数据不推测、不补全。",
    },
    dailyTrainingTrend: {
      recordCount: 0,
      latestDate: null,
      trend: "数据不足",
      stability: "数据不足",
      fatigueSummary: "暂无足够训练反馈用于判断疲劳变化。",
      sorenessSummary: "暂无足够训练反馈用于判断酸痛变化。",
      note: "本地回退模板仅用于避免页面空白；完整趋势请在 AI 服务可用后重新生成。",
    },
    feedbackInsights: [],
    itemDeepAnalysis: {
      abilityBreakdown: [
        {
          ability: "动作质量",
          description: `${itemName}提升首先依赖动作稳定和技术细节。`,
          currentLevel: `${valueText}，${score}分`,
          improvement: "先掌握动作节奏，再逐步提高训练量或难度。",
        },
        {
          ability: "专项基础能力",
          description: `${itemName}需要相应的力量、速度、柔韧或心肺基础共同支撑。`,
          currentLevel: "需结合训练记录继续观察",
          improvement: "使用下方动作库中的基础练习建立稳定能力。",
        },
      ],
      influencingFactors: [
        { factor: "动作质量", status: "需教师观察", suggestion: "训练时优先让体育教师确认动作是否规范。" },
        { factor: "训练节奏", status: "循序渐进", suggestion: "每次训练保留余力，动作变形时先降阶。" },
      ],
      relatedItems: [],
      progressiveGoals: [],
    },
    trainingActionLibrary: actionNames.map((actionName, index) => ({
      name: actionName,
      purpose: index === 0 ? `学习并稳定${itemName}的关键技术` : index === 1 ? `提升支撑${itemName}表现的基础能力` : `提升${itemName}练习中的节奏控制和稳定输出`,
      suitableStage: index === 2 ? ["巩固期", "强化期"] : ["适应期", "巩固期"],
      steps: ["确认场地安全后开始练习", "先用较低强度完成动作", "保持呼吸自然，不憋气", "每组结束后记录体感和动作质量"],
      volume: index === 0 ? "3组×6-8次" : "3组×8-10次",
      duration: "每次约5-8分钟",
      intensity: "中等强度，动作质量优先",
      keyPoints: ["动作过程保持稳定", "疲劳时先减少次数", "每组之间充分休息"],
      commonMistakes: ["一开始强度过高：先降低次数或距离", "只追求数量忽视动作：每组都以不变形为标准"],
      progression: "动作稳定后，小幅增加次数、距离或持续时间。",
      regression: "如果动作变形或体感疲劳，减少组数并延长休息。",
      selfCheck: "完成后动作不明显变形，主观用力可控，第二天无明显不适。",
      safetyNote: "AI 生成内容需经体育教师审核后使用。",
    })),
    itemStagePlan: [
      {
        stage: "适应期",
        goal: "熟悉动作并建立稳定练习习惯",
        duration: "第1-2周",
        studentFitReason: `先用低风险动作确认${itemName}的技术基础，避免一开始过度加量。`,
        recommendedActions: actionNames.slice(0, 2),
        weeklyFrequency: "每周2次",
        sessionLength: "每次10-15分钟",
        minimumVersion: `只做${actionNames[0]}，完成2组即可。`,
        normalVersion: `${actionNames[0]} + ${actionNames[1]}，各3组。`,
        recoveryVersion: "疲劳偏高时减少为2组，并延长组间休息。",
        progressCriteria: ["动作稳定不变形", "训练后无明显不适"],
      },
      {
        stage: "巩固期",
        goal: "组合动作库中的练习，提高专项稳定性",
        duration: "第3-4周",
        studentFitReason: "在动作质量稳定后，再逐步提高训练完整度。",
        recommendedActions: actionNames,
        weeklyFrequency: "每周2-3次",
        sessionLength: "每次15-20分钟",
        minimumVersion: `选择${actionNames[0]}和${actionNames[2]}各2组。`,
        normalVersion: "三个动作按顺序完成，各3组。",
        recoveryVersion: "保留技术动作，减少高强度或快速动作。",
        progressCriteria: ["能连续完成正常版本", "主观用力保持在可控范围"],
      },
    ],
    safetyReminders: [
      "训练前确认场地安全并充分热身。",
      "动作出现明显变形时先停止，不硬撑完成数量。",
      "如出现疼痛、头晕或明显不适，应立即停止并告知教师。",
      "AI 建议仅作锻炼参考，需经体育教师审核后使用。",
    ],
    teacherReviewNotes: [
      `请教师结合${itemName}正式体测成绩确认训练重点。`,
      "本报告为本地回退模板，建议 AI 服务恢复后重新生成完整专项分析。",
    ],
  };
}

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
        const mockReport = getMockStudentReport(reportType, studentData);
        const report = {
          ...mockReport,
          id: `AI-S-${body.studentId ?? "001"}-mock-${Date.now()}`,
          studentId: body.studentId ?? mockReport.studentId,
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
      const failMockReport = getMockStudentReport(failReportType, studentDataFail);
      const report = {
        ...(type === "student-report" ? failMockReport : mockAIClassReport),
        ...(type === "student-report" ? {
          studentId: body.studentId ?? failMockReport.studentId,
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
    const realMockReport = getMockStudentReport(realReportType, realStudentData);
    const report = type === "student-report"
      ? {
          ...realMockReport,
          reportType: realReportType,
          ...parsed,
          id: `AI-S-${body.studentId ?? "001"}-${Date.now()}`,
          studentId: body.studentId ?? realMockReport.studentId,
          sourceRecordId: body.sourceRecordId,
          sourceRecordDate: body.sourceRecordDate,
          sourceSummary: body.sourceSummary,
          sourceBatchId: body.sourceBatchId,
          sourceMeta: body.sourceMeta as AIStudentReport["sourceMeta"],
          generatedAt: new Date().toISOString(),
          version: realMockReport.version + 1,
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
    const errorMockReport = getMockStudentReport(errorReportType, errorStudentData);
    const report = {
      ...(fallbackType === "class" ? mockAIClassReport : errorMockReport),
      ...(fallbackType === "student" ? {
        studentId: body?.studentId ?? errorMockReport.studentId,
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
6. 不要在报告中大段编写国家标准科普（如《国家学生体质健康标准》全文介绍、权重表、等级规则），前端已有独立的"项目科普与评分解读"静态模块展示。AI 只需在 headlineInsight 或 formalBaseline.analysis 中简要引用学生本次表现与等级即可。
7. 缺失项目只显示"暂无数据"，不得推测、补全或用平均值替代

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
10. feedbackInsights — [ { factor, observation, implication } ] 基于问答反馈的洞察，每条对应学生提交的一个问答字段。
   factor格式："问卷题目中文名：学生填写的具体答案"，用冒号连接，体现学生本次记录时的实际状态。
     将JSON字段key转为中文问卷题目，将英文值转为中文：
     - boolean: true→"是" / false→"否"
     - choice值: middle→"中段"、start→"启动阶段"、quick→"恢复很快"、slight→"轻微"等（参考问卷选项label）
     - slider/数值: 直接写数值如"7/10"
     正确示例："最吃力阶段：中段"、"动作是否变形：是"、"主观用力程度：7/10"、"肩背不适：否"、"恢复速度：恢复很快"
     错误示例："动作完成阶段（hardestPhase: middle）"、"疲劳度较高"
   observation：针对学生的具体回答，结合运动科学原理和中学生体育训练特点进行细致分析，说明该回答反映的运动状态、潜在原因、身体机能表现。
   implication：基于该分析给出针对性的训练建议和改进方向。
11. trainingActionLibrary — 3-5个专项训练动作，写成”动作教学库”（不按周拆分，是该项目的标准化动作参考）：
   每个动作包含：
   {
     name(动作名称),
     purpose(训练目的：提升什么能力),
     suitableStage[“适应期”,”巩固期”,”强化期”,”维持期”],
     steps[4-6条具体动作步骤，写清姿势、节奏、呼吸],
     volume(训练量，如”3组×8次”或”30秒×4组”),
     duration(单次时长),
     intensity(强度建议，如”中等强度，能完整说短句”),
     keyPoints[3-5条训练要点],
     commonMistakes[2-4条常见错误+纠正方法],
     progression(只写动作难度如何提高，如增加组数/次数/距离，禁止写”第X周”或”连续X周”),
     regression(降低难度的替代方式，适合零基础或疲劳偏高时),
     selfCheck(学生自测达标标准),
     safetyNote(安全提醒)
   }
   严禁在此字段中出现”第1周””第2周””1-2周””3-6周””连续X周””周期””阶段安排”等计划性表达。
   此字段只讲”一个动作怎么做”，不讲”什么时候练、练几周”。阶段规划由 itemStagePlan 负责。
   动作内容要细致具体，适合中学生阅读，不要写成专业运动队训练计划。
12. itemStagePlan — 4阶段训练安排，必须引用trainingActionLibrary中已有的动作名称：
   每个阶段包含：
   {
     stage(阶段名称，如”适应期”),
     goal(阶段目标),
     duration(预计周期，如”第1-2周”),
     studentFitReason(为什么适合当前学生，需结合其成绩/等级/训练积累/体感数据),
     recommendedActions[“引用动作库中的动作名称”],
     weeklyFrequency(每周建议频率),
     sessionLength(每次建议时长),
     minimumVersion(时间不足版本：只做1-2个核心动作),
     normalVersion(正常训练版本),
     recoveryVersion(疲劳偏高或恢复较慢版本),
     progressCriteria[“进入下一阶段的条件”]
   }
   阶段划分参考：适应期(1-2周)→巩固期(3-4周)→强化期(5-8周)→维持与测试准备期(9周+)。
   如果学生已有较多训练积累，不要默认从适应期开始，应根据数据判断当前阶段。
   必须包含minimumVersion和recoveryVersion，人性化考虑中学生时间有限。
13. safetyReminders — 至少5条该项目专项安全提醒。数组元素直接写提醒内容，不要自带"1."、"2."、"（1）"等编号。
14. teacherReviewNotes — 至少2条需要教师重点审核的内容。数组元素直接写审核要点，不要自带"1."、"2."、"（1）"等编号。`,
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
[模块12] safetyReminders — 至少6条字符串：热身+强度递进+不适处理+恢复+睡眠+装备+教师沟通。数组元素不要自带编号。
[模块13] teacherReviewNotes — 至少3条教师需重点审核的内容。数组元素不要自带编号。

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
    { "factor": "问卷题目：学生答案，如'最吃力阶段：中段''动作是否变形：是''主观用力程度：7/10'", "observation": "结合运动科学对该回答进行细致分析", "implication": "针对性训练建议" }
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
  "trainingActionLibrary": [
    {
      "name": "动作名称",
      "purpose": "训练目的：提升什么能力",
      "suitableStage": ["适应期", "强化期"],
      "steps": ["步骤1：准备姿势", "步骤2：开始动作", "步骤3：发力与呼吸", "步骤4：完成与还原"],
      "volume": "3组×8次",
      "duration": "每次约5分钟",
      "intensity": "中等强度，能完整说短句",
      "keyPoints": ["要点1", "要点2", "要点3"],
      "commonMistakes": ["错误1 + 纠正方法", "错误2 + 纠正方法"],
      "progression": "如何增加难度",
      "regression": "降低难度的替代方式",
      "selfCheck": "学生自测达标标准",
      "safetyNote": "安全提醒"
    }
  ],
  "itemStagePlan": [
    {
      "stage": "适应期",
      "goal": "学习动作、建立习惯",
      "duration": "第1-2周",
      "studentFitReason": "为什么适合当前学生",
      "recommendedActions": ["引用动作库中的动作名称"],
      "weeklyFrequency": "每周2次",
      "sessionLength": "每次15-20分钟",
      "minimumVersion": "时间不足时只做1-2个核心动作",
      "normalVersion": "正常训练安排",
      "recoveryVersion": "疲劳偏高时的降阶安排",
      "progressCriteria": ["进入下一阶段的条件"]
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
