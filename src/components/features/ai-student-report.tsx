"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  History,
  PlusCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FITNESS_ITEMS } from "@/lib/constants";
import { formatItemValue as formatItemValueUtil } from "@/lib/utils";
import { mockAIStudentReport, mockDeepItemReport } from "@/lib/data/mock-ai-reports";
import { calculateRecordCompleteness } from "@/lib/scoring";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import type { AIStudentReport, FitnessItemId, FitnessRecord, FitnessRecordItem, StudentProfile } from "@/lib/types";
import { AIFormalAnalysis } from "./ai-formal-analysis";
import { AIItemCards, type ItemCardData } from "./ai-item-cards";
import { AITrainingObservation } from "./ai-training-observation";
import { AIReportDetail } from "./ai-report-detail";
import { FloatingBackBar } from "@/components/layout/floating-back-bar";
import { TrainingFocusHint } from "./training-focus-hint";

const inFlightRequests = new Map<string, Promise<{ data: AIStudentReport; mode: "ai" | "mock"; fallback: boolean }>>();
const CLIENT_AI_TIMEOUT_MS = 35000;

const MALE_ITEMS: FitnessItemId[] = ["vital_capacity", "50m_run", "standing_long_jump", "sit_and_reach", "pull_up", "1000m_run"];
const FEMALE_ITEMS: FitnessItemId[] = ["vital_capacity", "50m_run", "standing_long_jump", "sit_and_reach", "sit_up", "800m_run"];

type ReportMode = "ai" | "mock" | "fallback";
type FreshnessState = "current" | "new_data" | "suggest_update";
type ItemTrend = { label: "提升中" | "基本稳定" | "需关注"; icon: typeof Sparkles; variant: "excellent" | "secondary" | "pass" };

interface AIStudentReportProps {
  studentId?: string;
  student: StudentProfile | null;
  records: FitnessRecord[];
  reportHistory: StudentReportHistoryItem[];
  batches: Array<{ id: string; name: string; type: string; status: string }>;
  /** 进入/退出详情视图时通知父组件，用于隐藏/显示页面标题区 */
  onViewingChange?: (_viewing: boolean) => void;
}

// ---- Helpers ----

function itemName(id: string): string {
  return FITNESS_ITEMS.find((item) => item.id === id)?.name ?? id;
}

function reportTypeLabel(type?: string): string {
  if (type === "item_report") return "专项分析";
  if (type === "record_report") return "本次反馈";
  if (type === "batch_report") return "正式体测分析";
  return "AI 分析";
}

function formatDate(value: string | null): string {
  if (!value) return "暂无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function formatTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getReportSourceSnapshot(report: StudentReportHistoryItem): { includedIds: Set<string>; cutoffTime: number; generatedTime: number; hasSourceMeta: boolean } {
  const meta = report.report.sourceMeta;
  const includedIds = new Set(meta?.includedRecordIds ?? []);
  if (report.sourceRecordId) includedIds.add(report.sourceRecordId);

  const sourceTime = report.sourceRecordDate ? new Date(report.sourceRecordDate).getTime() : Number.NaN;
  const metaTime = meta?.latestDataDate ? new Date(meta.latestDataDate).getTime() : Number.NaN;
  const generatedTime = new Date(report.generatedAt).getTime();
  const validTimes = [metaTime, sourceTime, generatedTime].filter((time) => Number.isFinite(time));

  return {
    includedIds,
    cutoffTime: validTimes.length > 0 ? Math.max(...validTimes) : Number.NaN,
    generatedTime,
    hasSourceMeta: Boolean(meta?.includedRecordIds?.length),
  };
}

function getRecordCreatedTime(record: FitnessRecord): number {
  const createdTime = record.createdAt ? new Date(record.createdAt).getTime() : Number.NaN;
  if (Number.isFinite(createdTime)) return createdTime;
  return new Date(record.date).getTime();
}

function isRecordNewForReport(record: FitnessRecord, snapshot: ReturnType<typeof getReportSourceSnapshot>): boolean {
  if (snapshot.includedIds.has(record.id)) return false;
  const recordDateTime = new Date(record.date).getTime();
  const recordCreatedTime = getRecordCreatedTime(record);
  return (
    (Number.isFinite(recordDateTime) && Number.isFinite(snapshot.cutoffTime) && recordDateTime >= snapshot.cutoffTime) ||
    (Number.isFinite(recordCreatedTime) && Number.isFinite(snapshot.generatedTime) && recordCreatedTime > snapshot.generatedTime)
  );
}

function daysSince(value: string): number {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - date) / 86400000));
}

function reviewBadge(status: string) {
  if (status === "approved") return { label: "已审核", variant: "excellent" as const };
  if (status === "rejected") return { label: "已退回", variant: "improve" as const };
  return { label: "待审核", variant: "pass" as const };
}

// ---- Data computation helpers ----

function getRecordItem(record: FitnessRecord, itemId: FitnessItemId): FitnessRecordItem | null {
  return record.items.find((item) => item.itemId === itemId) ?? null;
}

function getItemScores(records: FitnessRecord[], itemId: FitnessItemId): number[] {
  return records
    .map((record) => getRecordItem(record, itemId)?.score)
    .filter((score): score is number => typeof score === "number");
}

function itemTrendLabel(scores: number[], higherIsBetter: boolean): ItemTrend | null {
  if (scores.length < 2) return null;
  const [latest, previous] = scores;
  if (latest === previous) {
    return { label: "基本稳定", icon: Sparkles, variant: "secondary" };
  }
  // Re-use Sparkles icon as placeholder since Minus doesn't exist in our import
  const isImproving = higherIsBetter ? latest > previous : latest < previous;
  return isImproving
    ? { label: "提升中", icon: Sparkles, variant: "excellent" }
    : { label: "需关注", icon: Sparkles, variant: "pass" };
}

function computeFreshness(report: StudentReportHistoryItem | null, officialRecord: FitnessRecord | null, dailyRecords: FitnessRecord[]): FreshnessState {
  if (!report) return "current";
  const snapshot = getReportSourceSnapshot(report);
  if (!Number.isFinite(snapshot.cutoffTime) && !Number.isFinite(snapshot.generatedTime)) return "current";

  const hasNewOfficial = officialRecord ? isRecordNewForReport(officialRecord, snapshot) : false;
  const newDailyCount = dailyRecords.filter((record) => isRecordNewForReport(record, snapshot)).length;

  if (hasNewOfficial || newDailyCount >= 2) return "suggest_update";
  if (newDailyCount > 0) return "new_data";
  return "current";
}

function computeNewDataCount(report: StudentReportHistoryItem | null, officialRecords: FitnessRecord[], dailyRecords: FitnessRecord[], itemId?: FitnessItemId): number {
  if (!report) return 0;
  const snapshot = getReportSourceSnapshot(report);
  if (!Number.isFinite(snapshot.cutoffTime) && !Number.isFinite(snapshot.generatedTime)) return 0;
  let count = 0;

  for (const record of officialRecords) {
    if (isRecordNewForReport(record, snapshot)) {
      if (itemId) {
        if (getRecordItem(record, itemId)) count++;
      } else {
        count++;
      }
    }
  }

  for (const record of dailyRecords) {
    if (isRecordNewForReport(record, snapshot)) {
      if (itemId) {
        if (getRecordItem(record, itemId)) count++;
      } else {
        count++;
      }
    }
  }

  return count;
}

function findAllBatchReports(history: StudentReportHistoryItem[]): StudentReportHistoryItem[] {
  return history.filter((item) => item.report.reportType === "batch_report");
}

function getBatchReportMap(
  batchReports: StudentReportHistoryItem[],
  batches: Array<{ id: string; name: string }>,
  _officialRecords: FitnessRecord[], // kept for signature compatibility, unused with sourceBatchId
): Map<string, StudentReportHistoryItem | null> {
  const map = new Map<string, StudentReportHistoryItem | null>();
  for (const batch of batches) {
    // Direct match by sourceBatchId (v0.9.2+)
    const match = batchReports.find((r) => r.sourceBatchId === batch.id) ?? null;
    // Fallback: match by sourceRecordId via official records (legacy reports without sourceBatchId)
    if (!match) {
      const legacy = batchReports.find((r) => {
        if (!r.sourceRecordId || r.sourceBatchId) return false; // skip if already has sourceBatchId
        return _officialRecords.some((rec) => rec.id === r.sourceRecordId && rec.batchId === batch.id);
      }) ?? null;
      map.set(batch.id, legacy);
    } else {
      map.set(batch.id, match);
    }
  }
  return map;
}

function findItemReport(history: StudentReportHistoryItem[], itemId: FitnessItemId): StudentReportHistoryItem | null {
  const name = itemName(itemId);
  return history.find((item) => {
    if (item.report.reportType !== "item_report") return false;
    // 优先精确匹配：报告的 formalBaseline.itemName 或 sourceMeta 中的目标项目
    const baselineName = item.report.formalBaseline?.itemName ?? "";
    if (baselineName === name) return true;
    // fallback：sourceSummary 字符串匹配
    const summary = item.sourceSummary ?? "";
    return summary.includes(name) || summary.includes(itemId);
  }) ?? null;
}

function inferItemIdFromReport(report: AIStudentReport, sourceSummary?: string | null): FitnessItemId | null {
  const candidates = [
    report.formalBaseline?.itemName,
    (report as { sourceSummary?: string }).sourceSummary,
    sourceSummary,
    report.dataSourceSummary,
    report.headlineInsight,
  ].filter((value): value is string => Boolean(value));

  for (const item of FITNESS_ITEMS) {
    if (candidates.some((text) => text.includes(item.id) || text.includes(item.name))) {
      return item.id;
    }
  }
  return null;
}

function formatItemValue(item: FitnessRecordItem, itemId: FitnessItemId): string {
  const def = FITNESS_ITEMS.find((fitnessItem) => fitnessItem.id === itemId);
  return formatItemValueUtil(itemId, item.value, def?.unit ?? "");
}

function isReportMatchedToItem(report: AIStudentReport, itemId: FitnessItemId): boolean {
  const name = itemName(itemId);
  const baselineName = report.formalBaseline?.itemName;
  if (baselineName) return baselineName === name;
  return inferItemIdFromReport(report) === itemId;
}

function buildItemSpecificFallbackReport(
  itemId: FitnessItemId,
  reportType: AIStudentReport["reportType"],
  formalBaseline: NonNullable<AIStudentReport["formalBaseline"]> | null,
  sourceSummary: string,
): AIStudentReport {
  const name = itemName(itemId);
  const baselineText = formalBaseline
    ? `${formalBaseline.valueText}，${formalBaseline.score}分`
    : "暂无正式体测基线";
  const actions = [
    `${name}技术分解练习`,
    `${name}基础能力练习`,
    `${name}节奏与稳定练习`,
  ];

  return {
    ...mockDeepItemReport,
    id: `AI-S-local-${itemId}-${Date.now()}`,
    reportType,
    generatedAt: new Date().toISOString(),
    dataSourceSummary: sourceSummary,
    headlineInsight: `${name}专项分析暂时使用本地回退模板：当前基线为${baselineText}。请优先查看动作教学卡，并等待 AI 服务恢复后重新生成更完整分析。`,
    formalBaseline: formalBaseline ?? {
      itemName: name,
      valueText: "暂无数据",
      score: 0,
      grade: "improve",
      date: "暂无数据",
      analysis: "当前缺少可用于展示的正式体测基线，不能推测或补全成绩。",
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
    weaknessAnalysis: [
      {
        item: "正式体测基线",
        currentLevel: baselineText,
        possibleCauses: ["需要结合正式体测、日常训练和问答反馈继续分析。"],
        improvementPotential: "先从动作质量和规律训练入手，避免盲目加量。",
      },
    ],
    itemDeepAnalysis: {
      abilityBreakdown: [
        {
          ability: "动作质量",
          description: `${name}提升首先依赖动作稳定和技术细节。`,
          currentLevel: formalBaseline ? baselineText : "暂无完整基线",
          improvement: "先掌握动作节奏，再逐步提高训练量或难度。",
        },
        {
          ability: "专项基础能力",
          description: `${name}需要相应的力量、速度、柔韧或心肺基础共同支撑。`,
          currentLevel: "需结合训练记录继续观察",
          improvement: "使用下方动作库中的基础练习建立稳定能力。",
        },
      ],
      influencingFactors: [
        {
          factor: "动作质量",
          status: "需教师观察",
          suggestion: "训练时优先让体育教师确认动作是否规范。",
        },
        {
          factor: "训练节奏",
          status: "循序渐进",
          suggestion: "每次训练保留余力，动作变形时先降阶。",
        },
      ],
      relatedItems: [],
      progressiveGoals: [],
    },
    trainingActionLibrary: actions.map((actionName, index) => ({
      name: actionName,
      purpose: index === 0 ? `学习并稳定${name}的关键技术` : index === 1 ? `提升支撑${name}表现的基础能力` : `提升${name}练习中的节奏控制和稳定输出`,
      suitableStage: index === 2 ? ["巩固期", "强化期"] : ["适应期", "巩固期"],
      steps: [
        "在体育教师确认场地安全后开始练习",
        "先用较低强度完成动作，注意姿势稳定",
        "练习过程中保持呼吸自然，不憋气",
        "每组结束后记录主观用力感受和动作是否变形",
      ],
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
        studentFitReason: `先用低风险动作确认${name}的技术基础，避免一开始过度加量。`,
        recommendedActions: actions.slice(0, 2),
        weeklyFrequency: "每周2次",
        sessionLength: "每次10-15分钟",
        minimumVersion: `只做${actions[0]}，完成2组即可。`,
        normalVersion: `${actions[0]} + ${actions[1]}，各3组。`,
        recoveryVersion: "疲劳偏高时减少为2组，并延长组间休息。",
        progressCriteria: ["动作稳定不变形", "训练后无明显不适"],
      },
      {
        stage: "巩固期",
        goal: "组合动作库中的练习，提高专项稳定性",
        duration: "第3-4周",
        studentFitReason: "在动作质量稳定后，再逐步提高训练完整度。",
        recommendedActions: actions,
        weeklyFrequency: "每周2-3次",
        sessionLength: "每次15-20分钟",
        minimumVersion: `选择${actions[0]}和${actions[2]}各2组。`,
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
      `请教师结合${name}正式体测成绩确认训练重点。`,
      "本报告为本地回退模板，建议 AI 服务恢复后重新生成完整专项分析。",
    ],
  };
}

function buildSourceSummary(reportType: string, sourceRecord: FitnessRecord, itemId?: FitnessItemId, dailyCount = 0): string {
  const date = formatDate(sourceRecord.date);
  if (itemId) return `${itemName(itemId)}专项 · 正式${date} · 训练${dailyCount}次`;
  if (reportType === "batch_report") return `正式体测分析 · ${date}`;
  return `本次记录反馈 · ${date}`;
}

function buildItemAnalysisRecord(record: FitnessRecord, itemId: FitnessItemId): FitnessRecord {
  const item = getRecordItem(record, itemId);
  return item ? { ...record, items: [item] } : record;
}

// ===== Main Component =====

export function AIStudentReportView({ studentId, student, records, reportHistory, batches, onViewingChange }: AIStudentReportProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const latestRecord = records[0] ?? null;
  const genderItems = student?.gender === "female" ? FEMALE_ITEMS : MALE_ITEMS;
  const officialRecords = useMemo(() => records.filter((r) => r.recordType === "official_test"), [records]);
  const dailyRecords = useMemo(() => records.filter((r) => r.recordType === "daily_training"), [records]);
  const daily7d = useMemo(() => dailyRecords.filter((r) => daysSince(r.date) < 7).length, [dailyRecords]);
  const daily30d = useMemo(() => dailyRecords.filter((r) => daysSince(r.date) < 30).length, [dailyRecords]);

  // Formal test batches (only official type)
  const formalBatches = useMemo(
    () => batches.filter(b => b.type === "official"),
    [batches]
  );

  // Find the latest official batch (has most recent official_test records)
  const latestOfficialBatchId = useMemo(() => {
    let latestBatchId: string | null = null;
    let latestDate = 0;
    for (const r of officialRecords) {
      if (r.batchId) {
        const d = new Date(r.date).getTime();
        if (d > latestDate) {
          latestDate = d;
          latestBatchId = r.batchId;
        }
      }
    }
    // Fallback to first official batch
    if (!latestBatchId) {
      latestBatchId = formalBatches[0]?.id ?? null;
    }
    return latestBatchId;
  }, [officialRecords, formalBatches]);

  // Completeness calculated for the LATEST official batch (not all records)
  const completeness = useMemo(() => {
    const batchRecords = latestOfficialBatchId
      ? officialRecords.filter((r) => r.batchId === latestOfficialBatchId)
      : officialRecords;
    const itemIds = new Set<string>();
    for (const r of batchRecords) {
      for (const item of r.items) itemIds.add(item.itemId);
    }
    return calculateRecordCompleteness(Array.from(itemIds), student?.gender ?? "male");
  }, [officialRecords, latestOfficialBatchId, student?.gender]);

  // All batch reports (for multi-batch switching)
  const allBatchReports = useMemo(() => findAllBatchReports(reportHistory), [reportHistory]);
  // Latest batch report (for outer card display)
  const batchReport = allBatchReports[0] ?? null;
  // Map batch IDs to their reports
  const batchReportMap = useMemo(
    () => getBatchReportMap(allBatchReports, formalBatches, officialRecords),
    [allBatchReports, formalBatches, officialRecords]
  );

  const latestOfficialRecord = officialRecords[0] ?? null;

  const batchFreshness: FreshnessState = useMemo(() => {
    if (!batchReport || !latestOfficialRecord || !batchReport.sourceRecordDate) return "current";
    return new Date(latestOfficialRecord.date).getTime() > new Date(batchReport.sourceRecordDate).getTime()
      ? "suggest_update" : "current";
  }, [batchReport, latestOfficialRecord]);

  // Item cards
  const itemCards = useMemo<ItemCardData[]>(() => {
    const cards: ItemCardData[] = [];
    for (const itemId of genderItems) {
      const def = FITNESS_ITEMS.find((i) => i.id === itemId);
      if (!def) continue;
      const officialRecord = officialRecords.find((r) => getRecordItem(r, itemId));
      const officialItem = officialRecord ? getRecordItem(officialRecord, itemId) : null;
      const itemDailyRecords = dailyRecords.filter((r) => getRecordItem(r, itemId));
      const latestDailyRecord = itemDailyRecords
        .slice()
        .sort((a, b) => getRecordCreatedTime(b) - getRecordCreatedTime(a))[0] ?? null;
      const report = findItemReport(reportHistory, itemId);
      const scores = getItemScores(records, itemId);
      const newDataCount = computeNewDataCount(report, officialRecords, dailyRecords, itemId);

      cards.push({
        itemId,
        def,
        officialItem,
        dailyCount: itemDailyRecords.length,
        latestDailyDate: latestDailyRecord?.date ?? null,
        trend: itemTrendLabel(scores, def.higherIsBetter),
        report,
        freshness: computeFreshness(report, officialRecord ?? null, itemDailyRecords),
        newDataCount,
      });
    }
    return cards;
  }, [dailyRecords, genderItems, officialRecords, records, reportHistory]);

  // State
  const [viewingReport, setViewingReport] = useState<AIStudentReport | null>(null);
  const [viewingItemId, setViewingItemId] = useState<FitnessItemId | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [mode, setMode] = useState<ReportMode | undefined>();
  const [generatingLabel, setGeneratingLabel] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const mountedRef = useRef(true);
  const autoGenerateKeyRef = useRef<string | null>(null);

  const buildFormalBaseline = useCallback((itemId: FitnessItemId): NonNullable<AIStudentReport["formalBaseline"]> | null => {
    const officialRecord = officialRecords.find((record) => getRecordItem(record, itemId));
    const item = officialRecord ? getRecordItem(officialRecord, itemId) : null;
    if (!officialRecord || !item) return null;
    return {
      itemName: itemName(itemId),
      valueText: formatItemValue(item, itemId),
      score: item.score,
      grade: item.grade,
      date: officialRecord.date.slice(0, 10),
      analysis: "本卡片基于正式体测成绩展示项目评分定位；日常训练记录用于观察过程变化，不参与正式评分。",
    };
  }, [officialRecords]);

  const enrichItemReport = useCallback((report: AIStudentReport, itemId: FitnessItemId | null): AIStudentReport => {
    if (!itemId) return report;
    const formalBaseline = buildFormalBaseline(itemId);
    if (!isReportMatchedToItem(report, itemId)) {
      const fallbackSummary = latestRecord
        ? buildSourceSummary(report.reportType ?? "item_report", latestOfficialRecord ?? latestRecord, itemId)
        : `${itemName(itemId)}专项`;
      return buildItemSpecificFallbackReport(itemId, report.reportType ?? "item_report", formalBaseline, fallbackSummary);
    }
    return formalBaseline ? { ...report, formalBaseline } : report;
  }, [buildFormalBaseline, latestOfficialRecord, latestRecord]);

  // 通知父组件详情视图状态变化
  useEffect(() => {
    onViewingChange?.(viewingReport !== null);
  }, [viewingReport, onViewingChange]);

  // 计算详情视图的动态标题
  const detailTitle = useMemo(() => {
    if (!viewingReport) return "";
    if (viewingReport.reportType === "batch_report") return "正式体测分析";
    if (viewingItemId) return `${itemName(viewingItemId)} 专项分析`;
    if (viewingReport.reportType === "item_report") return "专项分析";
    if (viewingReport.reportType === "record_report") return "本次反馈";
    return "AI 分析";
  }, [viewingReport, viewingItemId]);

  // Delete a report
  const handleDeleteReport = useCallback(async (reportId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirmId(null);
        // If deleting the currently viewed report, return to center
        if (viewingReport?.id === reportId) {
          setViewingReport(null);
          setViewingItemId(null);
          setSelectedBatchId(null);
        }
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }, [router, viewingReport]);

  // 监听底部导航 re-click 事件，重置报告详情视图
  useEffect(() => {
    const handler = () => {
      setViewingReport(null);
      setViewingItemId(null);
      setSelectedBatchId(null);
      router.refresh();
    };
    window.addEventListener("tab-reclick", handler);
    return () => window.removeEventListener("tab-reclick", handler);
  }, [router]);

  // Generate report
  const generateReport = useCallback(async (opts: { itemId?: FitnessItemId; reportType?: AIStudentReport["reportType"] }) => {
    if (!student || !latestRecord) return;
    const targetId = opts.itemId ?? null;
    const reportType = opts.reportType ?? (targetId ? "item_report" : latestRecord.items.length <= 1 ? "item_report" : "record_report");
    const itemDailyRecords = targetId ? dailyRecords.filter((r) => getRecordItem(r, targetId)) : [];
    // Find the official record containing this item for item-specific reports
    const itemOfficialRecord = targetId
      ? officialRecords.find((r) => getRecordItem(r, targetId)) ?? null
      : null;
    const sourceRecord = reportType === "batch_report"
      ? (latestOfficialRecord ?? latestRecord)
      : targetId && itemOfficialRecord
        ? itemOfficialRecord
        : latestRecord;
    const currentRecord = targetId ? buildItemAnalysisRecord(sourceRecord, targetId) : sourceRecord;
    const sourceSummary = buildSourceSummary(reportType ?? "record_report", sourceRecord, targetId ?? undefined, itemDailyRecords.length);

    // Build sourceMeta: records exactly which data was analyzed
    const includedOfficialIds = targetId && itemOfficialRecord ? [itemOfficialRecord.id] : reportType === "batch_report" ? officialRecords.filter(r => r.batchId === sourceRecord.batchId).map(r => r.id) : [sourceRecord.id];
    const includedDailyIds = itemDailyRecords.map(r => r.id);
    const allIncludedIds = [...includedOfficialIds, ...includedDailyIds];
    const allDates = [sourceRecord.date, ...itemDailyRecords.map(r => r.date)];
    const latestDataDate = allDates.reduce((max, d) => (d > max ? d : max), sourceRecord.date);
    const sourceMeta = {
      includedRecordIds: allIncludedIds,
      includedDailyRecordIds: includedDailyIds,
      includedOfficialRecordIds: includedOfficialIds,
      latestDataDate,
    };

    setStatus("analyzing");
    setGeneratingLabel(targetId ? `正在生成 ${itemName(targetId)} 专项分析` : "正在生成正式体测分析");
    mountedRef.current = true;

    const cacheKey = [studentId, reportType ?? "overall", targetId ?? "all", sourceRecord.id, itemDailyRecords.length].join("-");
    const existing = inFlightRequests.get(cacheKey);
    if (existing) {
      try {
        const result = await existing;
        if (mountedRef.current) {
          setViewingReport(enrichItemReport(result.data, targetId));
          setViewingItemId(targetId);
          setMode(result.mode);
          setStatus("complete");
        }
      } catch {
        if (mountedRef.current) setStatus("fallback");
      }
      return;
    }

    const request = (async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_AI_TIMEOUT_MS);
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: "student-report",
          studentId,
          sourceRecordId: sourceRecord.id,
          sourceRecordDate: sourceRecord.date,
          sourceSummary,
          sourceBatchId: sourceRecord.batchId,
          sourceMeta,
          studentData: {
            student,
            currentRecord,
            officialRecords,
            relatedDailyRecords: itemDailyRecords,
            previousRecords: records.filter((r) => r.id !== sourceRecord.id).slice(0, 4),
            reportType,
            targetItemId: targetId,
            analysisScope: reportType === "batch_report" ? "formal_overall" : targetId ? "item_assessment" : "record_report",
            completeness: {
              recordedCount: completeness.recordedCount,
              expectedCount: completeness.expectedCount,
              completionRate: completeness.completionRate,
              missingItems: completeness.missingItems,
            },
          },
        }),
      }).finally(() => window.clearTimeout(timeoutId));

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json() as AIStudentReport & { _mode?: "ai" | "mock"; _fallback?: boolean };
      return { data, mode: data._mode ?? "ai", fallback: Boolean(data._fallback) };
    })();

    inFlightRequests.set(cacheKey, request);
    try {
      const result = await request;
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) {
        setViewingReport(enrichItemReport(result.data, targetId));
        setViewingItemId(targetId);
        setMode(result.fallback ? "fallback" : result.mode);
        setStatus("complete");
      }
    } catch {
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) {
        const fallback = targetId
          ? buildItemSpecificFallbackReport(targetId, reportType, buildFormalBaseline(targetId), sourceSummary)
          : mockAIStudentReport;
        setViewingReport(enrichItemReport({ ...fallback, reportType, generatedAt: new Date().toISOString() }, targetId));
        setViewingItemId(targetId);
        setMode("fallback");
        setStatus("fallback");
      }
    }
  }, [buildFormalBaseline, completeness, dailyRecords, enrichItemReport, latestOfficialRecord, latestRecord, officialRecords, records, student, studentId]);

  useEffect(() => {
    if (searchParams.get("generate") !== "1" || status !== "idle") return;

    const recordId = searchParams.get("recordId") ?? "";
    const itemIdParam = searchParams.get("itemId");
    const reportTypeParam = searchParams.get("reportType") as AIStudentReport["reportType"] | null;
    const itemId = FITNESS_ITEMS.some((item) => item.id === itemIdParam)
      ? itemIdParam as FitnessItemId
      : null;
    const autoKey = `${recordId || "no-record"}:${itemId ?? "all"}:${reportTypeParam ?? "auto"}`;
    if (autoGenerateKeyRef.current === autoKey) return;
    autoGenerateKeyRef.current = autoKey;

    generateReport({
      itemId: itemId ?? undefined,
      reportType: reportTypeParam ?? (itemId ? "item_report" : "record_report"),
    });
    router.replace("/ai-guide", { scroll: false });
  }, [generateReport, router, searchParams, status]);

  // Open existing report from history
  const openReport = useCallback((report: StudentReportHistoryItem, itemId?: FitnessItemId) => {
    const resolvedItemId = itemId ?? inferItemIdFromReport(report.report, report.sourceSummary);
    setViewingReport(enrichItemReport(report.report, resolvedItemId));
    setViewingItemId(resolvedItemId);
    setMode(report.mode === "ai" ? "ai" : "mock");
    setStatus("complete");
  }, [enrichItemReport]);

  // ---- Empty state ----
  if (!latestRecord || !student) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-4 p-8 text-center">
          <Brain className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-base font-semibold">暂无可分析数据</p>
            <p className="mt-1 text-sm text-muted-foreground">请先完成一次体测记录，AI 指导会基于真实记录生成分析参考。</p>
          </div>
          <Link href="/record">
            <Button className="h-11 gap-1.5">
              <PlusCircle className="h-4 w-4" />
              去记录体测
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // ---- Generating state ----
  if (status === "analyzing") {
    return (
      <AIGenerationStatus
        status="analyzing"
        mode={mode}
        subjectLabel={generatingLabel}
      />
    );
  }

  // ---- Report detail view ----
  if (viewingReport) {
    const handleBack = () => {
      setViewingReport(null);
      setViewingItemId(null);
      setSelectedBatchId(null);
      router.refresh();
    };
    return (
      <div className="space-y-0">
        <FloatingBackBar onBack={handleBack} title={detailTitle} />
        <div className="pt-4">
        <AIReportDetail
        report={viewingReport}
        mode={mode}
        viewingItemId={viewingItemId}
        formalBatches={formalBatches}
        selectedBatchId={selectedBatchId}
        batchReportMap={batchReportMap}
        allBatchReports={allBatchReports}
        gender={student?.gender}
        recordedItemIds={genderItems.filter((id) => {
          const batchRecords = latestOfficialBatchId
            ? officialRecords.filter((r) => r.batchId === latestOfficialBatchId)
            : officialRecords;
          return batchRecords.some((r) => r.items.some((item) => item.itemId === id));
        })}
        missingItemIds={completeness.missingItems as FitnessItemId[]}
        onBack={handleBack}
        onGenerateForBatch={(batchId) => {
          setSelectedBatchId(batchId);
          generateReport({ reportType: "batch_report" });
        }}
        onView={(report) => openReport(report)}
        onDeleteReport={(reportId) => {
          fetch(`/api/reports/${reportId}`, { method: "DELETE" }).then(() => router.refresh());
        }}
        onRegenerate={() => {
          const reportType = viewingReport.reportType;
          const targetItemId = viewingItemId;
          setViewingReport(null);
          generateReport({
            itemId: targetItemId ?? undefined,
            reportType: reportType ?? (targetItemId ? "item_report" : "batch_report"),
          });
        }}
      />
        </div>
      </div>
    );
  }

  // ---- Main listing view ----
  return (
    <div className="space-y-6">
      {/* 1. Formal Test Analysis */}
      <AIFormalAnalysis
        completenessText={`${completeness.recordedCount}/${completeness.expectedCount} 项`}
        completionRate={completeness.completionRate}
        latestOfficialDate={latestOfficialRecord ? formatDate(latestOfficialRecord.date) : null}
        batchReport={batchReport}
        batchFreshness={batchFreshness}
        missingItems={completeness.missingItems}
        onGenerate={() => generateReport({ reportType: "batch_report" })}
        onView={(report) => openReport(report)}
      />

      {/* 2. Item Analysis */}
      <AIItemCards
        items={itemCards}
        onGenerate={(itemId) => generateReport({ itemId, reportType: "item_report" })}
        onView={(report, itemId) => openReport(report, itemId)}
      />

      {/* 2.5 Training Focus Hint */}
      <TrainingFocusHint
        batchReport={batchReport}
        attentionItemIds={itemCards
          .filter((c) => c.newDataCount > 0 || c.freshness !== "current")
          .map((c) => c.itemId)}
        onViewItem={(itemId) => {
          const card = itemCards.find((c) => c.itemId === itemId);
          if (card?.report) openReport(card.report, itemId);
          else generateReport({ itemId, reportType: "item_report" });
        }}
      />

      {/* 3. Training Observation */}
      <AITrainingObservation
        dailyRecords={dailyRecords}
        daily7d={daily7d}
        daily30d={daily30d}
      />

      {/* 4. History Reports */}
      {reportHistory.length > 0 && (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-1 text-left"
          >
            <History className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold">历史报告</span>
            <Badge variant="secondary" className="text-[10px]">{reportHistory.length} 份</Badge>
            <div className="ml-auto">
              {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {historyOpen && (
            <div className="space-y-2">
              {/* Group by type */}
              {(["batch_report", "item_report", "record_report"] as const).map((type) => {
                const items = reportHistory.filter((h) => h.report.reportType === type);
                if (items.length === 0) return null;
                return (
                  <div key={type} className="space-y-1">
                    <p className="px-1 text-[11px] font-medium text-muted-foreground">
                      {type === "batch_report" ? "正式体测分析" : type === "item_report" ? "单项分析" : "其他报告"}
                    </p>
                    {items.map((item) => {
                      const review = reviewBadge(item.status);
                      return (
                        <div key={item.id} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openReport(item)}
                            className="flex-1 rounded-xl border p-3 text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">{item.sourceSummary ?? "AI 分析"}</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatTime(item.generatedAt)}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <Badge variant="outline" className="text-[9px]">{reportTypeLabel(item.report.reportType)}</Badge>
                                <Badge variant={review.variant} className="text-[9px]">{review.label}</Badge>
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id); }}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none"
                            aria-label="删除报告"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确定删除这份 AI 报告吗？</DialogTitle>
            <DialogDescription>
              此操作不会删除原始体测或训练记录，但删除后无法从历史报告中查看。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={deleting}>取消</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDeleteReport(deleteConfirmId)} disabled={deleting}>
              {deleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom spacer for floating nav */}
      <div className="pb-28" />
    </div>
  );
}
