"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import { mockAIStudentReport } from "@/lib/data/mock-ai-reports";
import { calculateRecordCompleteness } from "@/lib/scoring";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import { FITNESS_ITEMS } from "@/lib/constants";
import {
  Brain, Sparkles, Target, ShieldCheck, Clock, CheckCircle2,
  AlertTriangle, History, ChevronDown, ChevronUp, PlusCircle, BarChart3, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import Link from "next/link";
import type { AIStudentReport, FitnessRecord, StudentProfile } from "@/lib/types";

const inFlightRequests = new Map<string, Promise<{ data: unknown; mode: string; fallback: boolean }>>();
const CLIENT_AI_TIMEOUT_MS = 35000;

interface AIStudentReportProps {
  studentId?: string;
  student: StudentProfile | null;
  records: FitnessRecord[];
  reportHistory: StudentReportHistoryItem[];
}

const MALE_ITEMS = ["vital_capacity", "50m_run", "standing_long_jump", "sit_and_reach", "pull_up", "1000m_run"];
const FEMALE_ITEMS = ["vital_capacity", "50m_run", "standing_long_jump", "sit_and_reach", "sit_up", "800m_run"];

function itemName(id: string) { return FITNESS_ITEMS.find(f => f.id === id)?.name ?? id; }

function findLatestItemReport(history: StudentReportHistoryItem[], itemId: string) {
  return history.find(h => {
    if (!h.sourceSummary) return false;
    return h.sourceSummary.includes(itemName(itemId)) || h.sourceSummary.includes(itemId);
  }) ?? null;
}

function findLastNItemRecords(records: FitnessRecord[], itemId: string, n: number) {
  return records.filter(r => r.items.some(i => i.itemId === itemId)).slice(0, n);
}

function itemTrendLabel(values: number[], higherIsBetter: boolean) {
  if (values.length < 2) return null;
  const [latest, prev] = values;
  if (latest === prev) return { label: "基本稳定", icon: Minus };
  const improved = higherIsBetter ? latest > prev : latest < prev;
  return improved ? { label: "提升中", icon: TrendingUp } : { label: "需关注", icon: TrendingDown };
}

function reportTypeLabel(t?: string) {
  if (t === "item_report") return "单项专项";
  if (t === "record_report") return "本次记录分析";
  if (t === "batch_report") return "综合体质画像";
  return "";
}

function formatDisplayTime(value: string | null): string {
  if (!value) return "";
  const d = new Date(value); if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// ===== 主组件 =====
export function AIStudentReportView({ studentId, student, records, reportHistory }: AIStudentReportProps) {
  const latestRecord = records[0] ?? null;
  const genderItems: readonly string[] = student?.gender === "female" ? FEMALE_ITEMS : MALE_ITEMS;

  // 所有已录项目的聚合（同一批次所有记录的去重合并）
  const batchItems = useMemo(() => {
    const seen = new Set<string>();
    const allItemIds: string[] = [];
    for (const r of records) for (const i of r.items) { if (!seen.has(i.itemId)) { seen.add(i.itemId); allItemIds.push(i.itemId); } }
    return allItemIds;
  }, [records]);
  const batchCompleteness = useMemo(() =>
    calculateRecordCompleteness(batchItems, student?.gender ?? "male"),
    [batchItems, student?.gender]);
  const canGenBatch = batchCompleteness.completionRate >= 70;

  // 状态
  const [viewingReport, setViewingReport] = useState<AIStudentReport | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [mode, setMode] = useState<"ai" | "mock" | "fallback" | undefined>();
  const [generatingItemId, setGeneratingItemId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const mountedRef = useRef(true);

  // ===== 生成报告 =====
  const generateReport = useCallback(async (opts: { itemId?: string; reportType?: string }) => {
    if (!student || !latestRecord) return;
    const targetId = opts.itemId ?? null;
    setStatus("analyzing");
    setGeneratingItemId(targetId);
    mountedRef.current = true;

    const cacheKeyParts = [studentId, opts.reportType ?? "overall"];
    if (targetId) cacheKeyParts.push(targetId);
    const cacheKey = cacheKeyParts.join("-");

    if (inFlightRequests.has(cacheKey)) {
      try {
        const result = await inFlightRequests.get(cacheKey)!;
        if (mountedRef.current) { setViewingReport(result.data as AIStudentReport); setViewingItemId(targetId); setStatus("complete"); }
      } catch { if (mountedRef.current) setStatus("fallback"); }
      setGeneratingItemId(null);
      return;
    }

    const requestPromise = (async () => {
      const sourceSummary = buildRecordSummary(latestRecord, targetId);
      const ctrl = new AbortController();
      const tid = window.setTimeout(() => ctrl.abort(), CLIENT_AI_TIMEOUT_MS);
      const body: Record<string, unknown> = {
        type: "student-report", studentId,
        sourceRecordId: latestRecord.id, sourceRecordDate: latestRecord.date, sourceSummary,
        studentData: {
          student, currentRecord: latestRecord, previousRecords: records.slice(1, 4),
          reportType: opts.reportType ?? (latestRecord.items.length <= 1 ? "item_report" : "record_report"),
          targetItemId: targetId,
          completeness: batchCompleteness ? { recordedCount: batchCompleteness.recordedCount, expectedCount: batchCompleteness.expectedCount, completionRate: batchCompleteness.completionRate } : undefined,
        },
      };
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal, body: JSON.stringify(body) }).finally(() => window.clearTimeout(tid));
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return { data: await res.json() as AIStudentReport, mode: "ai" as const, fallback: false };
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    try {
      const result = await requestPromise;
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) { setViewingReport(result.data); setViewingItemId(targetId); setMode(result.mode); setStatus("complete"); }
    } catch {
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) { setViewingReport(mockAIStudentReport); setMode("fallback"); setStatus("fallback"); }
    }
    setGeneratingItemId(null);
  }, [studentId, student, latestRecord, records, batchCompleteness]);

  // ===== 点击项目卡片 =====
  const handleItemClick = useCallback((itemId: string) => {
    const existing = findLatestItemReport(reportHistory, itemId);
    if (existing) {
      // 已有报告 → 直接查看，不调用 AI
      setViewingReport(existing.report);
      setViewingItemId(itemId);
      setMode(existing.mode === "ai" ? "ai" : "mock");
      setStatus("complete");
      return;
    }
    // 无报告 → 生成
    generateReport({ itemId, reportType: "item_report" });
  }, [reportHistory, generateReport]);

  // ===== 生成中 =====
  if (status === "analyzing") {
    const genLabel = generatingItemId ? `正在生成 ${itemName(generatingItemId)} 专项报告` : "正在分析体测数据";
    return <AIGenerationStatus status="analyzing" mode={mode} subjectLabel={genLabel} />;
  }

  // ===== 无记录 =====
  if (!latestRecord) {
    return (
      <Card className="rounded-xl shadow-sm"><CardContent className="p-8 text-center space-y-3">
        <Brain className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="text-base font-semibold">暂无可分析数据</p>
        <p className="text-sm text-muted-foreground">请先完成一次体测记录，再使用 AI 运动指导。</p>
        <Link href="/record"><Button className="gap-1.5"><PlusCircle className="h-4 w-4" />去记录体测</Button></Link>
      </CardContent></Card>
    );
  }

  // ===== 报告详情 =====
  if (viewingReport) {
    const detailLabel = viewingItemId ? `${itemName(viewingItemId)} 专项报告` : (viewingReport.reportType ? reportTypeLabel(viewingReport.reportType) : "AI 报告");
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => { setViewingReport(null); setViewingItemId(null); }}>
            ← 返回指导中心
          </Button>
          <Badge variant="excellent" className="text-[10px]">{detailLabel}</Badge>
          {mode && <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px]">{mode === "ai" ? "AI 生成" : "示例数据"}</Badge>}
        </div>
        <ReportHero report={viewingReport} mode={mode} />
        {batchCompleteness.isPartial && (
          <Card className="rounded-xl border-amber-200 bg-amber-50/50 shadow-sm"><CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-amber-800">局部分析</p>
            <p className="text-xs text-amber-700">本报告基于已录入的 {batchCompleteness.recordedCount} 个项目生成，未录入项目暂不评价。</p>
          </CardContent></Card>
        )}
        <ReportContent report={viewingReport} />
        <div className="h-4" />
      </div>
    );
  }

  // ===== 指导中心 =====
  const centerLabel = batchCompleteness.isPartial ? `已录 ${batchCompleteness.recordedCount}/${batchCompleteness.expectedCount} 项` : "数据完整";

  return (
    <div className="space-y-5">
      {/* ===== 1. 整体体质分析卡 ===== */}
      <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold">整体体质分析</span>
            <Badge variant={canGenBatch ? "excellent" : "pass"} className="text-[10px] ml-auto">{centerLabel}</Badge>
          </div>
          {!canGenBatch ? (
            <>
              <p className="text-sm text-muted-foreground">当前批次数据完整度 {batchCompleteness.recordedCount}/{batchCompleteness.expectedCount}，尚不足以生成完整综合体质画像。建议先查看已录项目专项分析或补充体测数据。</p>
              <Link href="/record"><Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-3.5 w-3.5" />补充体测项目</Button></Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">数据完整度达到 {batchCompleteness.completionRate}%，可生成综合体质画像。</p>
              <Button size="sm" className="gap-1" onClick={() => generateReport({ reportType: "batch_report" })}><Sparkles className="h-3.5 w-3.5" />生成整体分析</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ===== 2. 专项提升卡片网格 ===== */}
      <div>
        <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Target className="h-4 w-4 text-primary" />专项提升</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {genderItems.map(itemId => {
            const def = FITNESS_ITEMS.find(f => f.id === itemId);
            if (!def) return null;
            const latestItemRecord = records.find(r => r.items.some(i => i.itemId === itemId));
            const latestItem = latestItemRecord?.items.find(i => i.itemId === itemId);
            const existingReport = findLatestItemReport(reportHistory, itemId);
            const hasReport = !!existingReport;
            const generating = generatingItemId === itemId;

            // 最近几次该项目的成绩趋势
            const itemRecords = findLastNItemRecords(records, itemId, 3);
            const itemValues = itemRecords.map(r => r.items.find(i => i.itemId === itemId)!.value);
            const trend = itemTrendLabel(itemValues, def.higherIsBetter ?? true);

            return (
              <Card key={itemId} className="rounded-xl shadow-sm">
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{def.icon}</span>
                    <p className="text-xs font-semibold truncate">{def.name}</p>
                  </div>

                  {!latestItem ? (
                    <>
                      <p className="text-[11px] text-muted-foreground">暂无数据</p>
                      <Link href="/record"><Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1"><PlusCircle className="h-3 w-3" />去记录</Button></Link>
                    </>
                  ) : generating ? (
                    <div className="text-center py-2"><p className="text-[11px] text-muted-foreground animate-pulse">生成中...</p></div>
                  ) : hasReport ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={latestItem.grade === "excellent" || latestItem.grade === "good" ? "excellent" : "pass"} className="text-[10px]">{latestItem.score}分</Badge>
                        {existingReport.status === "approved" && <Badge variant="excellent" className="text-[9px] py-0">已审核</Badge>}
                      </div>
                      {trend && <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><trend.icon className="h-3 w-3" />{trend.label}</p>}
                      <Button size="sm" className="w-full h-7 text-xs gap-1" onClick={() => { setViewingReport(existingReport.report); setViewingItemId(itemId); setMode(existingReport.mode === "ai" ? "ai" : "mock"); setStatus("complete"); }}>
                        <BarChart3 className="h-3 w-3" />查看专项报告
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge variant={latestItem.grade === "excellent" || latestItem.grade === "good" ? "excellent" : "pass"} className="text-[10px]">{latestItem.score}分</Badge>
                      {trend && <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><trend.icon className="h-3 w-3" />{trend.label}</p>}
                      <Button size="sm" className="w-full h-7 text-xs gap-1" onClick={() => handleItemClick(itemId)} disabled={generating}>
                        <Sparkles className="h-3 w-3" />生成专项报告
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ===== 3. 本次记录分析 ===== */}
      {latestRecord.items.length >= 2 && (
        <Card className="rounded-xl shadow-sm"><CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">本次记录分析</span>
            <Badge variant="secondary" className="text-[10px] ml-auto">{latestRecord.items.length} 项</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{latestRecord.batchName ?? latestRecord.semester} · {formatDisplayTime(latestRecord.date)}</p>
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            {latestRecord.items.map(i => <span key={i.itemId}>{itemName(i.itemId)}</span>).reduce((acc, el) => acc.length === 0 ? [el] : [...acc, <span key="sep" className="mx-0.5">·</span>, el] as React.ReactNode[], [] as React.ReactNode[])}
          </div>
          <Button size="sm" className="w-full gap-1 h-8" onClick={() => generateReport({ reportType: "record_report" })}><Sparkles className="h-3.5 w-3.5" />生成本次记录分析</Button>
        </CardContent></Card>
      )}

      {/* ===== 4. 历史报告 ===== */}
      {reportHistory.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <button type="button" onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-2"><History className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">历史报告</span><Badge variant="secondary" className="text-[10px]">{reportHistory.length} 份</Badge></div>
            {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {historyOpen && (
            <CardContent className="pt-0 space-y-2">
              {reportHistory.map((item) => {
                const rType = (item.report as AIStudentReport)?.reportType;
                return (
                  <button key={item.id} type="button" onClick={() => { setViewingReport(item.report); setViewingItemId(null); }}
                    className="w-full rounded-xl border p-3 text-left hover:bg-accent">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate">{item.sourceSummary ?? "AI 报告"}</p>
                          {rType && <Badge variant="outline" className="text-[9px]">{reportTypeLabel(rType)}</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatDisplayTime(item.generatedAt)}</p>
                      </div>
                      <Badge variant={item.status === "approved" ? "excellent" : item.status === "rejected" ? "improve" : "pass"} className="text-[9px] shrink-0">
                        {item.status === "approved" ? "已审核" : item.status === "rejected" ? "已退回" : "待审核"}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      <div className="h-4" />
    </div>
  );
}

// ===== 报告详情子组件 =====
function ReportHero({ report, mode }: { report: AIStudentReport; mode?: string }) {
  const profile = report.fitnessProfile;
  const reviewStatus = report.status || "pending_review";
  const ReviewIcon = reviewStatus === "approved" ? CheckCircle2 : reviewStatus === "rejected" ? AlertTriangle : Clock;
  const topGoal = report.trainingPlan[0]?.exercises[0];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <ReviewIcon className={`h-5 w-5 ${reviewStatus === "approved" ? "text-level-excellent" : "text-muted-foreground"}`} />
        <span className="text-sm font-semibold">{reviewStatus === "approved" ? "教师已审核" : reviewStatus === "rejected" ? "已退回" : "待教师审核"}</span>
        {report.reportType && <Badge variant="excellent" className="text-[10px] ml-auto">{reportTypeLabel(report.reportType)}</Badge>}
        {mode && <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px]">{mode === "ai" ? "AI 生成" : "示例数据"}</Badge>}
      </div>
      <p className="text-base font-semibold leading-relaxed">{profile.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-background/60 p-3 text-center"><p className="text-2xl font-bold tabular-nums">{profile.overallScore}</p><p className="text-xs text-muted-foreground">参考评分</p></div>
        {topGoal && <div className="rounded-xl bg-background/60 p-3 sm:col-span-2"><p className="text-xs text-muted-foreground">优先目标</p><p className="text-sm font-semibold mt-0.5">{topGoal.name}</p><p className="text-xs text-muted-foreground mt-0.5">{topGoal.frequency} · {topGoal.duration}</p></div>}
      </div>
    </div>
  );
}

function ReportContent({ report }: { report: AIStudentReport }) {
  const reviewStatus = report.status || "pending_review";
  const ReviewIcon = reviewStatus === "approved" ? CheckCircle2 : reviewStatus === "rejected" ? AlertTriangle : Clock;
  return (
    <>
      {report.trainingPlan.length > 0 && (
        <Card className="rounded-xl shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base">本周训练计划</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {report.trainingPlan.slice(0, 1).map((week) => (
              <div key={week.weekNumber}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">第 {week.weekNumber} 周 · {week.focus}</p>
                <div className="grid gap-2 sm:grid-cols-2">{week.exercises.slice(0, 4).map((ex, j) => (
                  <div key={j} className="rounded-xl border p-3"><p className="text-xs font-semibold">{ex.name}</p><p className="text-[10px] text-muted-foreground mt-1">{ex.frequency} · {ex.duration}</p>{ex.notes && <p className="text-[10px] text-muted-foreground mt-1">⚠ {ex.notes}</p>}</div>
                ))}</div>
                {week.recoveryAdvice && <p className="text-[11px] text-muted-foreground mt-3">{week.recoveryAdvice}</p>}
              </div>
            ))}
            <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-level-pass" />
              <p className="text-xs text-muted-foreground">AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。</p>
            </div>
          </CardContent></Card>
      )}
      {report.weaknessAnalysis.length > 0 && (
        <Card className="rounded-xl shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="h-5 w-5 text-primary" />已录项目分析</CardTitle></CardHeader>
          <CardContent className="space-y-3">{report.weaknessAnalysis.slice(0, 3).map((w, i) => (
            <div key={i} className="rounded-xl border p-3.5"><div className="flex items-center gap-2 mb-1"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span><p className="text-sm font-semibold">{w.item}</p><Badge variant="outline" className="text-[10px]">{w.currentLevel}</Badge></div><p className="text-xs text-muted-foreground">{w.possibleCauses[0]}</p><p className="text-xs text-primary mt-1"><Sparkles className="h-3 w-3 inline" /> {w.improvementPotential}</p></div>
          ))}</CardContent></Card>
      )}
      {report.safetyReminders.length > 0 && (
        <Card className="rounded-xl shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-level-good" />恢复与安全提醒</CardTitle></CardHeader>
          <CardContent className="space-y-2">{report.safetyReminders.slice(0, 4).map((r, i) => <div key={i} className="flex items-start gap-2"><span className="text-xs text-muted-foreground mt-0.5">{i + 1}.</span><p className="text-sm text-muted-foreground">{r}</p></div>)}</CardContent></Card>
      )}
      <Card className="rounded-xl shadow-sm"><CardContent className="flex items-center gap-3 p-4">
        <ReviewIcon className={`h-5 w-5 shrink-0 ${reviewStatus === "approved" ? "text-level-excellent" : "text-muted-foreground"}`} />
        <div><p className="text-sm font-medium">{reviewStatus === "approved" ? "体育教师已审核通过，可在教师指导下实施" : reviewStatus === "rejected" ? "该报告暂未通过教师审核" : "等待体育教师审核"}</p><p className="text-xs text-muted-foreground mt-0.5">AI 生成，需经体育教师审核后使用。</p></div>
      </CardContent></Card>
    </>
  );
}

function buildRecordSummary(record: FitnessRecord, targetItemId?: string | null): string {
  const items = targetItemId ? record.items.filter(i => i.itemId === targetItemId) : record.items;
  const names = items.slice(0, 3).map(i => itemName(i.itemId)).join("、");
  const more = items.length > 3 ? "等" : "";
  return `${formatDisplayTime(record.date)} · ${names}${more}`;
}
