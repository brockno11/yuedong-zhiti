"use client";

import { useState, useCallback, useRef } from "react";
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
  AlertTriangle, History, ChevronDown, ChevronUp, PlusCircle,
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

// ===== 报告状态机 =====
type ReportState = "noRecord" | "hasRecordNoReport" | "hasCurrentReport" | "hasNewerRecord" | "viewingHistorical";

function findReportForLatestRecord(
  history: StudentReportHistoryItem[],
  latestRecord: FitnessRecord | null
): StudentReportHistoryItem | null {
  if (!latestRecord || history.length === 0) return null;
  const match = history.find(h => h.sourceRecordId === latestRecord.id);
  if (match) return match;
  // fallback: 最新记录日期匹配
  if (latestRecord.date) {
    const dateMatch = history.find(h => h.sourceRecordDate === latestRecord.date);
    if (dateMatch) return dateMatch;
  }
  return null;
}

function getReportState(
  latestRecord: FitnessRecord | null,
  history: StudentReportHistoryItem[],
  selectedHistoryId: string | null
): ReportState {
  if (!latestRecord && history.length === 0) return "noRecord";
  if (selectedHistoryId) return "viewingHistorical";
  if (history.length === 0 && latestRecord) return "hasRecordNoReport";
  const currentReport = findReportForLatestRecord(history, latestRecord);
  if (currentReport) return "hasCurrentReport";
  if (!currentReport && history.length > 0 && latestRecord) return "hasNewerRecord";
  if (!latestRecord) return "noRecord";
  return "hasRecordNoReport";
}

// ===== 主组件 =====
export function AIStudentReportView({
  studentId, student, records, reportHistory,
}: AIStudentReportProps) {
  const latestRecord = records[0] ?? null;

  // 找到当前记录对应的报告
  const matchedReport = findReportForLatestRecord(reportHistory, latestRecord);

  const [report, setReport] = useState<AIStudentReport | null>(matchedReport?.report ?? null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(matchedReport?.id ?? null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(matchedReport?.generatedAt ?? null);
  const [sourceSummary, setSourceSummary] = useState<string | null>(matchedReport?.sourceSummary ?? null);
  const [status, setStatus] = useState<AIStatus>(matchedReport ? "complete" : "idle");
  const [mode, setMode] = useState<"ai" | "mock" | "fallback" | undefined>(
    matchedReport ? (matchedReport.mode === "ai" ? "ai" : "mock") : undefined
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const mountedRef = useRef(true);

  const reportState = getReportState(latestRecord, reportHistory, selectedHistoryId);
  const cacheKey = `student-${studentId}`;
  const completeness = latestRecord ? calculateRecordCompleteness(latestRecord.items.map(i => i.itemId), student?.gender ?? "male") : null;

  // ===== 主动生成（仅用户触发）=====
  const generateReport = useCallback(async () => {
    if (!student || !latestRecord) return;

    setConfirmRegen(false);
    setStatus("analyzing");
    setErrorMsg("");
    mountedRef.current = true;

    // 已有进行中的同 ID 请求
    if (inFlightRequests.has(cacheKey)) {
      try {
        const result = await inFlightRequests.get(cacheKey)!;
        if (mountedRef.current) {
          setReport(result.data as unknown as AIStudentReport);
          setMode(result.fallback ? "fallback" : (result.mode as "ai" | "mock"));
          setStatus(result.fallback ? "fallback" : "complete");
        }
      } catch {
        if (mountedRef.current) { setReport(mockAIStudentReport); setMode("fallback"); setStatus("fallback"); }
      }
      return;
    }

    const requestPromise = (async () => {
      const sourceSummaryText = buildRecordSummary(latestRecord);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_AI_TIMEOUT_MS);
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: "student-report", studentId,
          studentData: { student, currentRecord: latestRecord, previousRecords: records.slice(1, 4), analysisMode: "single_record_with_history_context" },
          sourceRecordId: latestRecord.id, sourceRecordDate: latestRecord.date, sourceSummary: sourceSummaryText,
        }),
      }).finally(() => window.clearTimeout(timeoutId));

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return { data: data as unknown as AIStudentReport, mode: (data._mode as string) || "mock", fallback: !!data._fallback };
    })();

    inFlightRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) {
        setReport(result.data as unknown as AIStudentReport);
        setMode(result.fallback ? "fallback" : (result.mode as "ai" | "mock"));
        setGeneratedAt((result.data as AIStudentReport).generatedAt);
        setSourceSummary(buildRecordSummary(latestRecord));
        setSelectedHistoryId(null);
        setStatus(result.fallback ? "fallback" : "complete");
      }
    } catch (err) {
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) {
        setReport(mockAIStudentReport);
        setMode("fallback");
        setErrorMsg(err instanceof Error ? err.message : "未知错误");
        setStatus("fallback");
      }
    }
  }, [studentId, student, latestRecord, records, cacheKey]);

  // ===== 生成中 =====
  if (status === "analyzing" || status === "generating_profile" || status === "generating_plan") {
    return <AIGenerationStatus status={status} mode={mode} />;
  }

  // ===== 无记录 =====
  if (reportState === "noRecord" && !report) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-8 text-center space-y-3">
          <Brain className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="text-base font-semibold">暂无可分析数据</p>
          <p className="text-sm text-muted-foreground">请先完成一次体测记录，再生成AI指导报告。</p>
          <Link href="/record">
            <Button className="gap-1.5 mt-2"><PlusCircle className="h-4 w-4" />去记录体测</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // ===== 有记录无报告 =====
  if (reportState === "hasRecordNoReport" && status !== "complete") {
    return (
      <div className="space-y-4">
        <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <p className="text-base font-semibold">可生成AI指导报告</p>
            </div>
            <p className="text-sm text-muted-foreground">将基于最近一次体测记录生成体质画像与训练建议。</p>
            {latestRecord && completeness && (
              <div className="rounded-xl bg-background/60 p-3 space-y-1 text-xs text-muted-foreground">
                <p>记录时间：{formatDisplayTime(latestRecord.date)}</p>
                {latestRecord.batchName && <p>批次：{latestRecord.batchName}</p>}
                <p>已录入 {completeness.recordedCount}/{completeness.expectedCount} 项 · 完整度 {completeness.completionRate}%</p>
              </div>
            )}
            <Button className="w-full gap-1.5 h-11" onClick={generateReport}>
              <Sparkles className="h-4 w-4" />生成AI报告
            </Button>
          </CardContent>
        </Card>
        {/* 错误回退 */}
        {status === "fallback" && report && (
          <AIGenerationStatus status="fallback" mode={mode} errorMessage={errorMsg} onRetry={generateReport} />
        )}
      </div>
    );
  }

  // ===== 错误/回退 =====
  if (status === "error" || status === "fallback") {
    return (
      <div className="space-y-4">
        <AIGenerationStatus status={status} mode={mode} errorMessage={errorMsg} onRetry={generateReport} />
        {report && <ReportContent report={report} />}
      </div>
    );
  }

  // ===== 发现新记录但无对应报告（优先处理）=====
  const isHistoricalView = reportState === "viewingHistorical";
  const isCurrent = reportState === "hasCurrentReport";
  const hasNewer = reportState === "hasNewerRecord";

  if (hasNewer && !report) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">发现新的体测记录</p>
          </div>
          <p className="text-xs text-amber-700">当前报告基于旧记录生成，你可以继续查看旧报告，也可以基于最新记录重新生成。</p>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1" onClick={generateReport}><Sparkles className="h-3.5 w-3.5" />基于最新记录重新生成</Button>
            {reportHistory.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => {
                const firstReport = reportHistory[0];
                setReport(firstReport.report);
                setSelectedHistoryId(firstReport.id);
                setGeneratedAt(firstReport.generatedAt);
                setSourceSummary(firstReport.sourceSummary);
                setMode(firstReport.mode === "ai" ? "ai" : "mock");
                setStatus("complete");
              }}>查看旧报告</Button>
            )}
          </div>
        </div>

        {reportHistory.length > 0 && (
          <Card className="rounded-xl shadow-sm">
            <button type="button" onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">历史报告</span>
                <Badge variant="secondary" className="text-[10px]">{reportHistory.length} 份</Badge>
              </div>
              {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {historyOpen && (
              <CardContent className="pt-0 space-y-2">
                {reportHistory.map((item, index) => {
                  const isSelected = selectedHistoryId === item.id;
                  return (
                    <button key={item.id} type="button" onClick={() => { setSelectedHistoryId(item.id); setReport(item.report); setGeneratedAt(item.generatedAt); setSourceSummary(item.sourceSummary); setMode(item.mode === "ai" ? "ai" : "mock"); setStatus("complete"); }}
                      className={`w-full rounded-xl border p-3 text-left ${isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0"><p className="text-xs font-semibold truncate">{item.sourceSummary ?? "综合体质分析"}</p><p className="text-[11px] text-muted-foreground mt-0.5">{formatDisplayTime(item.generatedAt)}</p></div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant={item.status === "approved" ? "excellent" : item.status === "rejected" ? "improve" : "pass"} className="text-[9px]">{item.status === "approved" ? "已审核" : item.status === "rejected" ? "已退回" : "待审核"}</Badge>
                          {index === 0 && !isSelected && <Badge variant="excellent" className="text-[9px]">最新</Badge>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            )}
          </Card>
        )}
      </div>
    );
  }

  if (!report) return null;

  // ===== 正常展示（有报告）=====

  return (
    <div className="space-y-5">
      {/* ===== 1. 报告状态卡 ===== */}
      {isCurrent && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-level-excellent" />
            <p className="text-sm font-semibold">当前AI报告</p>
            <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px] ml-auto">
              {mode === "ai" ? "AI 生成" : "示例数据"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">这份报告已基于最近一次体测记录生成。</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>生成时间：{formatDisplayTime(generatedAt ?? report.generatedAt)}</span>
            {sourceSummary && <span>来源：{sourceSummary}</span>}
            {completeness && <span>完整度 {completeness.completionRate}%</span>}
          </div>
          {!confirmRegen ? (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setConfirmRegen(true)}>
              <Sparkles className="h-3.5 w-3.5" />重新生成
            </Button>
          ) : (
            <div className="rounded-lg border p-3 space-y-2 bg-background">
              <p className="text-xs text-muted-foreground">重新生成将基于最新记录创建一份新的待审核报告，旧报告仍可在历史报告中查看。是否继续？</p>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1" onClick={generateReport}><Sparkles className="h-3.5 w-3.5" />确认重新生成</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmRegen(false)}>取消</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasNewer && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">发现新的体测记录</p>
          </div>
          <p className="text-xs text-amber-700">当前报告基于旧记录生成，你可以继续查看旧报告，也可以基于最新记录重新生成。</p>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1" onClick={generateReport}><Sparkles className="h-3.5 w-3.5" />基于最新记录重新生成</Button>
            <Button size="sm" variant="ghost" onClick={() => { setConfirmRegen(false); }}>继续查看旧报告</Button>
          </div>
        </div>
      )}

      {isHistoricalView && (
        <div className="rounded-xl border border-muted bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">正在查看历史报告</p>
            <Badge variant="secondary" className="text-[10px] ml-auto">{formatDisplayTime(generatedAt ?? report.generatedAt)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            这是 {reportState === "viewingHistorical" ? "一份" : ""}历史报告，不会自动更新。
            {latestRecord && (
              <button type="button" className="ml-1 text-primary underline" onClick={() => { setSelectedHistoryId(null); }}>
                返回当前报告
              </button>
            )}
          </p>
        </div>
      )}

      {/* ===== 2. 首屏摘要 ===== */}
      <ReportHero report={report} mode={mode} generatedAt={generatedAt} />

      {/* ===== 3. 数据完整度 ===== */}
      {completeness && completeness.isPartial && (
        <Card className="rounded-xl border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-amber-800">
              {completeness.completionRate < 70 ? "局部体质分析" : "综合体质分析"}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-amber-700">
              <span>数据完整度 {completeness.recordedCount}/{completeness.expectedCount}</span>
              <span>本报告基于已录入的 {completeness.recordedCount} 个项目生成</span>
            </div>
            <div className="text-xs text-amber-700 space-y-0.5">
              <p>已录入：{latestRecord?.items.map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId).join("、")}</p>
              <p>待补充：{completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).join("、")}</p>
            </div>
            <Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-1"><PlusCircle className="h-3.5 w-3.5" />补充记录</Button></Link>
          </CardContent>
        </Card>
      )}
      {completeness && completeness.isComplete && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="excellent" className="text-[10px]">综合体质分析</Badge>
          <span>基于已录入 {completeness.recordedCount}/{completeness.expectedCount} 项数据生成</span>
        </div>
      )}

      {/* ===== 3a. 生成依据 ===== */}
      {completeness && latestRecord && (
        <Card className="rounded-xl border-muted bg-muted/20 shadow-sm">
          <CardContent className="p-4 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-semibold text-sm text-foreground">📋 生成依据</p>
            <p>本计划参考了：</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>你本次录入的 {latestRecord.items.map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId).join("、")}</li>
              {latestRecord.bodyFeeling && <li>疲劳程度 {latestRecord.bodyFeeling.fatigueLevel}/10 · 恢复：{latestRecord.bodyFeeling.recoveryStatus === "quick" ? "较快" : latestRecord.bodyFeeling.recoveryStatus === "slow" ? "较慢" : "正常"}</li>}
              {student?.sportGoal && <li>运动目标：{student.sportGoal === "improve_endurance" ? "提升耐力" : student.sportGoal === "build_strength" ? "增强力量" : student.sportGoal === "overall_health" ? "全面健康提升" : student.sportGoal === "improve_flexibility" ? "提高柔韧性" : student.sportGoal === "lose_weight" ? "控制体重" : student.sportGoal === "exam_preparation" ? "体测考试准备" : student.sportGoal}</li>}
              <li>数据完整度 {completeness.recordedCount}/{completeness.expectedCount} · {completeness.completionRate >= 70 ? "综合体质分析" : "局部体质分析"}</li>
              {completeness.missingItems.length > 0 && <li>未录入项目暂不评价</li>}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ===== 4. 完整报告内容 ===== */}
      <ReportContent report={report} completeness={completeness} />

      {/* ===== 5. 历史报告（底部，默认折叠）===== */}
      {reportHistory.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">历史报告</span>
              <Badge variant="secondary" className="text-[10px]">{reportHistory.length} 份</Badge>
            </div>
            {historyOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {historyOpen && (
            <CardContent className="pt-0 space-y-2">
              {reportHistory.map((item, index) => {
                const isSelected = selectedHistoryId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedHistoryId(item.id);
                      setReport(item.report);
                      setGeneratedAt(item.generatedAt);
                      setSourceSummary(item.sourceSummary);
                      setMode(item.mode === "ai" ? "ai" : "mock");
                      setStatus("complete");
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{item.sourceSummary ?? "综合体质分析"}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatDisplayTime(item.generatedAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant={item.status === "approved" ? "excellent" : item.status === "rejected" ? "improve" : "pass"} className="text-[9px]">
                          {item.status === "approved" ? "已审核" : item.status === "rejected" ? "已退回" : "待审核"}
                        </Badge>
                        {index === 0 && !isSelected && <Badge variant="excellent" className="text-[9px]">最新</Badge>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* 底部安全间距 */}
      <div className="h-4" />
    </div>
  );
}

// ===== 首屏摘要 =====
function ReportHero({
  report, mode, generatedAt,
}: {
  report: AIStudentReport; mode?: string; generatedAt: string | null;
}) {
  const profile = report.fitnessProfile;
  const reviewStatus = report.status || "pending_review";
  const reviewLabel = reviewStatus === "approved" ? "体育教师已审核通过，可在教师指导下实施"
    : reviewStatus === "rejected" ? "已退回" : "等待体育教师审核";
  const ReviewIcon = reviewStatus === "approved" ? CheckCircle2 : reviewStatus === "rejected" ? AlertTriangle : Clock;
  const topGoal = report.trainingPlan[0]?.exercises[0];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <ReviewIcon className={`h-5 w-5 ${reviewStatus === "approved" ? "text-level-excellent" : "text-muted-foreground"}`} />
        <span className="text-sm font-semibold">{reviewLabel}</span>
        {mode && <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px] ml-auto">{mode === "ai" ? "AI 生成" : "示例数据"}</Badge>}
      </div>
      <p className="text-base font-semibold leading-relaxed">{profile.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-background/60 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums">{profile.overallScore}</p>
          <p className="text-xs text-muted-foreground">参考评分</p>
        </div>
        {topGoal && (
          <div className="rounded-xl bg-background/60 p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">本周优先目标</p>
            <p className="text-sm font-semibold mt-0.5">{topGoal.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{topGoal.frequency} · {topGoal.duration}</p>
          </div>
        )}
      </div>
      {generatedAt && <p className="text-[11px] text-muted-foreground">生成时间：{formatDisplayTime(generatedAt)}</p>}
    </div>
  );
}

// ===== 报告详情 =====
function ReportContent({
  report, completeness,
}: {
  report: AIStudentReport; completeness?: ReturnType<typeof calculateRecordCompleteness> | null;
}) {
  const reviewStatus = report.status || "pending_review";
  const reviewLabel = reviewStatus === "approved" ? "体育教师已审核通过，可在教师指导下实施"
    : reviewStatus === "rejected" ? "已退回" : "等待体育教师审核";
  const ReviewIcon = reviewStatus === "approved" ? CheckCircle2 : reviewStatus === "rejected" ? AlertTriangle : Clock;

  return (
    <>
      {/* 本周训练计划 — 前置，为核心模块 */}
      {report.trainingPlan.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">本周训练计划</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {report.trainingPlan.slice(0, 1).map((week) => (
              <div key={week.weekNumber}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">第 {week.weekNumber} 周 · {week.focus}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {week.exercises.slice(0, 4).map((ex, j) => (
                    <div key={j} className="rounded-xl border p-3">
                      <p className="text-xs font-semibold">{ex.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{ex.frequency} · {ex.duration}</p>
                      {ex.notes && <p className="text-[10px] text-muted-foreground mt-1">⚠ {ex.notes}</p>}
                    </div>
                  ))}
                </div>
                {week.recoveryAdvice && (
                  <p className="text-[11px] text-muted-foreground mt-3">{week.recoveryAdvice}</p>
                )}
              </div>
            ))}
            <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-level-pass" />
              <p className="text-xs text-muted-foreground">AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 重点提升 */}
      {report.weaknessAnalysis.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="h-5 w-5 text-primary" />已录项目分析</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {report.weaknessAnalysis.slice(0, 3).map((w, i) => (
              <div key={i} className="rounded-xl border p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <p className="text-sm font-semibold">{w.item}</p>
                  <Badge variant="outline" className="text-[10px]">{w.currentLevel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{w.possibleCauses[0]}</p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1"><Sparkles className="h-3 w-3" />{w.improvementPotential}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 待补充项目 */}
      {completeness && completeness.missingItems.length > 0 && (
        <Card className="rounded-xl border-muted bg-muted/10 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">待补充项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {completeness.missingItems.map(id => {
              const def = FITNESS_ITEMS.find(f => f.id === id);
              const reasons: Record<string, string> = {
                "50m_run": "用于分析速度素质",
                standing_long_jump: "用于分析下肢爆发力",
                pull_up: "用于分析上肢力量耐力",
                sit_up: "用于分析核心力量耐力",
                "1000m_run": "用于分析心肺耐力",
                "800m_run": "用于分析心肺耐力",
                sit_and_reach: "用于分析柔韧性",
                vital_capacity: "用于分析呼吸机能",
              };
              return (
                <div key={id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{def?.name ?? id}</span>
                    <span className="text-xs text-muted-foreground ml-2">{reasons[id] ?? "建议补充记录"}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">建议补充</Badge>
                </div>
              );
            })}
            <div className="pt-2">
              <Link href="/record">
                <Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-3.5 w-3.5" />补充本批次记录</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 安全提醒 */}
      {report.safetyReminders.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-level-good" />恢复与安全提醒</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.safetyReminders.slice(0, 4).map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-muted-foreground">{r}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 教师审核状态 */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <ReviewIcon className={`h-5 w-5 shrink-0 ${reviewStatus === "approved" ? "text-level-excellent" : "text-muted-foreground"}`} />
          <div>
            <p className="text-sm font-medium">{reviewLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {reviewStatus === "approved" ? "体育教师已审核该报告，可在教师指导下参考执行。"
                : reviewStatus === "rejected" ? "该报告暂未通过教师审核，请等待教师进一步指导。"
                : "该报告正在等待体育教师审核。请勿直接按照训练计划自行增加强度。"}
            </p>
          </div>
          {reviewStatus !== "approved" && <Badge variant="pass" className="ml-auto text-[10px]">待教师授权</Badge>}
        </CardContent>
      </Card>
    </>
  );
}

// ===== 工具函数 =====
function buildRecordSummary(record: FitnessRecord): string {
  const itemNames = record.items.map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId).slice(0, 3).join("、");
  const more = record.items.length > 3 ? `等 ${record.items.length} 项` : `${record.items.length} 项`;
  return `${formatDisplayTime(record.date)} · ${itemNames}${more}`;
}

function formatDisplayTime(value: string | null): string {
  if (!value) return "暂无时间";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}