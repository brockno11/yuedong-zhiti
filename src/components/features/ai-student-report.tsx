"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  History,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FITNESS_ITEMS } from "@/lib/constants";
import { mockAIStudentReport } from "@/lib/data/mock-ai-reports";
import { calculateRecordCompleteness, computeDimensionsFromItems, type DimensionInput } from "@/lib/scoring";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import type { AIStudentReport, FitnessItemId, FitnessRecord, FitnessRecordItem, StudentProfile } from "@/lib/types";
import { AIFormalAnalysis } from "./ai-formal-analysis";
import { AIItemCards, type ItemCardData } from "./ai-item-cards";
import { AITrainingObservation } from "./ai-training-observation";
import { AIReportDetail } from "./ai-report-detail";

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
  const sourceTime = report.sourceRecordDate ? new Date(report.sourceRecordDate).getTime() : 0;
  const officialTime = officialRecord ? new Date(officialRecord.date).getTime() : 0;
  const newDailyCount = dailyRecords.filter((record) => new Date(record.date).getTime() > sourceTime).length;

  if (officialTime > sourceTime || newDailyCount >= 2) return "suggest_update";
  if (newDailyCount > 0) return "new_data";
  return "current";
}

function computeNewDataCount(report: StudentReportHistoryItem | null, officialRecords: FitnessRecord[], dailyRecords: FitnessRecord[], itemId?: FitnessItemId): number {
  if (!report || !report.sourceRecordDate) return 0;
  const sourceTime = new Date(report.sourceRecordDate).getTime();
  let count = 0;

  // Count new official records for this item (or all items for batch)
  for (const record of officialRecords) {
    if (new Date(record.date).getTime() > sourceTime) {
      if (itemId) {
        if (getRecordItem(record, itemId)) count++;
      } else {
        count++;
      }
    }
  }

  // Count new daily training records for this item
  for (const record of dailyRecords) {
    if (new Date(record.date).getTime() > sourceTime) {
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
  officialRecords: FitnessRecord[],
): Map<string, StudentReportHistoryItem | null> {
  // Build a map: sourceRecordId → batchId from official records
  const recordBatchMap = new Map<string, string>();
  for (const record of officialRecords) {
    if (record.batchId) {
      recordBatchMap.set(record.id, record.batchId);
    }
  }

  const map = new Map<string, StudentReportHistoryItem | null>();
  for (const batch of batches) {
    // Find report whose sourceRecordId maps to this batch
    const match = batchReports.find((r) => {
      if (!r.sourceRecordId) return false;
      const reportBatchId = recordBatchMap.get(r.sourceRecordId);
      return reportBatchId === batch.id;
    }) ?? null;
    map.set(batch.id, match);
  }
  return map;
}

function findItemReport(history: StudentReportHistoryItem[], itemId: FitnessItemId): StudentReportHistoryItem | null {
  const name = itemName(itemId);
  return history.find((item) => {
    if (item.report.reportType !== "item_report") return false;
    const summary = item.sourceSummary ?? "";
    return summary.includes(name) || summary.includes(itemId);
  }) ?? null;
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

export function AIStudentReportView({ studentId, student, records, reportHistory, batches }: AIStudentReportProps) {
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

  // Records grouped by batch for data preview
  const recordsByBatch = useMemo(() => {
    const map = new Map<string, FitnessRecord[]>();
    for (const r of officialRecords) {
      if (r.batchId) {
        const existing = map.get(r.batchId) ?? [];
        existing.push(r);
        map.set(r.batchId, existing);
      }
    }
    return map;
  }, [officialRecords]);
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
      const report = findItemReport(reportHistory, itemId);
      const scores = getItemScores(records, itemId);
      const newDataCount = computeNewDataCount(report, officialRecords, dailyRecords, itemId);

      cards.push({
        itemId,
        def,
        officialItem,
        dailyCount: itemDailyRecords.length,
        latestDailyDate: itemDailyRecords[0]?.date ?? null,
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
  const mountedRef = useRef(true);

  // 监听底部导航 re-click 事件，重置报告详情视图
  useEffect(() => {
    const handler = () => {
      setViewingReport(null);
      setViewingItemId(null);
      setSelectedBatchId(null);
    };
    window.addEventListener("tab-reclick", handler);
    return () => window.removeEventListener("tab-reclick", handler);
  }, []);

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

    setStatus("analyzing");
    setGeneratingLabel(targetId ? `正在生成 ${itemName(targetId)} 专项分析` : "正在生成正式体测分析");
    mountedRef.current = true;

    const cacheKey = [studentId, reportType ?? "overall", targetId ?? "all", sourceRecord.id, itemDailyRecords.length].join("-");
    const existing = inFlightRequests.get(cacheKey);
    if (existing) {
      try {
        const result = await existing;
        if (mountedRef.current) {
          setViewingReport(result.data);
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
        setViewingReport(result.data);
        setViewingItemId(targetId);
        setMode(result.fallback ? "fallback" : result.mode);
        setStatus("complete");
      }
    } catch {
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) {
        setViewingReport({ ...mockAIStudentReport, reportType });
        setViewingItemId(targetId);
        setMode("fallback");
        setStatus("fallback");
      }
    }
  }, [completeness, dailyRecords, latestOfficialRecord, latestRecord, officialRecords, records, student, studentId]);

  // Open existing report from history
  const openReport = useCallback((report: StudentReportHistoryItem, itemId?: FitnessItemId) => {
    setViewingReport(report.report);
    setViewingItemId(itemId ?? null);
    setMode(report.mode === "ai" ? "ai" : "mock");
    setStatus("complete");
  }, []);

  // Build a computed "preview" report from actual batch records (when no AI report exists)
  const buildBatchPreview = useCallback((batchId: string): AIStudentReport => {
    const batchRecords = recordsByBatch.get(batchId) ?? [];
    const allItems = batchRecords.flatMap(r => r.items);
    // Deduplicate by itemId, keeping the latest score
    const itemMap = new Map<string, FitnessRecordItem>();
    for (const item of allItems) {
      if (!itemMap.has(item.itemId)) itemMap.set(item.itemId, item);
    }
    const uniqueItems = Array.from(itemMap.values());
    const overallScore = uniqueItems.length > 0
      ? Math.round(uniqueItems.reduce((s, i) => s + i.score, 0) / uniqueItems.length)
      : 0;

    const dimInputs: DimensionInput[] = uniqueItems.map(i => ({
      itemId: i.itemId,
      itemName: itemName(i.itemId),
      score: i.score,
      grade: i.grade,
    }));
    const computedDims = computeDimensionsFromItems(dimInputs, student?.bmi ?? null, student?.gender ?? "male");
    const dimsForProfile = computedDims.map(d => ({
      key: d.key,
      label: d.label,
      score: d.score ?? 0,
      grade: (d.grade ?? "pass") as "excellent" | "good" | "pass" | "improve",
      classAverage: 70,
      relatedItems: d.relatedItems,
      analysis: d.analysis,
      suggestion: d.suggestion,
    }));

    return {
      id: `preview-${batchId}`,
      studentId: studentId ?? "",
      generatedAt: new Date().toISOString(),
      version: 0,
      status: "draft",
      reportType: "batch_report",
      fitnessProfile: {
        summary: `基于该批次 ${uniqueItems.length} 个已测项目计算的体质预览。此为数据预览，非 AI 分析报告。`,
        bmiStatus: student?.bmi ? `${student.bmi}，BMI 数据` : "暂无 BMI 数据",
        overallScore,
        overallGrade: overallScore >= 90 ? "excellent" : overallScore >= 80 ? "good" : overallScore >= 60 ? "pass" : "improve",
        dimensions: dimsForProfile,
        strengths: uniqueItems.filter(i => i.grade === "excellent" || i.grade === "good").map(i => itemName(i.itemId)),
        improvements: uniqueItems.filter(i => i.grade === "pass" || i.grade === "improve").map(i => itemName(i.itemId)),
      },
      itemScores: uniqueItems.map(i => ({
        itemId: i.itemId as FitnessItemId,
        itemName: itemName(i.itemId),
        valueText: `${i.value}`,
        score: i.score,
        grade: i.grade,
        statusLabel: i.grade === "excellent" || i.grade === "good" ? "优势项" : i.grade === "pass" ? "稳定项" : "需关注项",
        analysis: "",
        suggestion: "",
      })),
      weaknessAnalysis: uniqueItems.filter(i => i.grade === "pass" || i.grade === "improve").map(i => ({
        item: itemName(i.itemId),
        currentLevel: i.grade === "pass" ? "及格" : "有提升空间",
        possibleCauses: [],
        improvementPotential: "建议生成 AI 分析获取详细建议",
      })),
      trainingPlan: [],
      safetyReminders: ["请生成 AI 分析获取完整的恢复与安全提醒"],
    };
  }, [recordsByBatch, studentId, student]);

  // View report for specific batch
  const handleViewBatch = useCallback((batchId: string) => {
    const reportItem = batchReportMap.get(batchId);
    if (reportItem) {
      setViewingReport(reportItem.report);
      setViewingItemId(null);
      setSelectedBatchId(batchId);
      setMode(reportItem.mode === "ai" ? "ai" : "mock");
      setStatus("complete");
    } else {
      // No report for this batch — show computed data preview
      setViewingReport(buildBatchPreview(batchId));
      setViewingItemId(null);
      setSelectedBatchId(batchId);
      setMode(undefined);
      setStatus("complete");
    }
  }, [batchReportMap, buildBatchPreview]);

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
    return (
      <AIReportDetail
        report={viewingReport}
        mode={mode}
        viewingItemId={viewingItemId}
        formalBatches={formalBatches}
        selectedBatchId={selectedBatchId}
        batchReportMap={batchReportMap}
        onBack={() => {
          setViewingReport(null);
          setViewingItemId(null);
          setSelectedBatchId(null);
        }}
        onBatchChange={handleViewBatch}
        onGenerateForBatch={(batchId) => {
          setSelectedBatchId(batchId);
          generateReport({ reportType: "batch_report" });
        }}
      />
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
        batches={batches}
        batchReportMap={batchReportMap}
        onGenerate={() => generateReport({ reportType: "batch_report" })}
        onView={(report) => openReport(report)}
        onViewBatch={handleViewBatch}
      />

      {/* 2. Item Analysis */}
      <AIItemCards
        items={itemCards}
        onGenerate={(itemId) => generateReport({ itemId, reportType: "item_report" })}
        onView={(report, itemId) => openReport(report, itemId)}
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
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openReport(item)}
                          className="w-full rounded-xl border p-3 text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
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
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Bottom spacer for floating nav */}
      <div className="pb-28" />
    </div>
  );
}
