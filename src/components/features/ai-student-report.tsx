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
  Brain, Sparkles, Target, ShieldCheck, Clock, CheckCircle2, AlertTriangle,
  History, ChevronDown, ChevronUp, PlusCircle, TrendingUp, TrendingDown, Minus, Dumbbell, GraduationCap,
} from "lucide-react";
import Link from "next/link";
import type { AIStudentReport, FitnessRecord, StudentProfile } from "@/lib/types";

const inFlightRequests = new Map<string, Promise<{ data: unknown; mode: string; fallback: boolean }>>();
const CLIENT_AI_TIMEOUT_MS = 35000;

interface AIStudentReportProps { studentId?: string; student: StudentProfile | null; records: FitnessRecord[]; reportHistory: StudentReportHistoryItem[]; }

const MALE_ITEMS = ["vital_capacity","50m_run","standing_long_jump","sit_and_reach","pull_up","1000m_run"];
const FEMALE_ITEMS = ["vital_capacity","50m_run","standing_long_jump","sit_and_reach","sit_up","800m_run"];

function itemName(id: string) { return FITNESS_ITEMS.find(f => f.id === id)?.name ?? id; }
function findLatestItemReport(history: StudentReportHistoryItem[], itemId: string) { return history.find(h => h.sourceSummary?.includes(itemName(itemId)) || h.sourceSummary?.includes(itemId)) ?? null; }
function reportTypeLabel(t?: string) { if (t === "item_report") return "专项评估"; if (t === "record_report") return "记录分析"; if (t === "batch_report") return "正式体测分析"; return ""; }
function formatTime(v: string | null): string { if (!v) return ""; const d = new Date(v); if (Number.isNaN(d.getTime())) return v; return d.toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}); }
function itemTrendLabel(values: number[], higher: boolean) { if (values.length < 2) return null; const [l,p] = values; if (l===p) return {label:"基本稳定",icon:Minus}; return higher ? (l>p?{label:"提升中",icon:TrendingUp}:{label:"需关注",icon:TrendingDown}) : (l<p?{label:"提升中",icon:TrendingUp}:{label:"需关注",icon:TrendingDown}); }

// ===== 主组件 =====
export function AIStudentReportView({ studentId, student, records, reportHistory }: AIStudentReportProps) {
  const latestRecord = records[0] ?? null;
  const genderItems = student?.gender === "female" ? FEMALE_ITEMS : MALE_ITEMS;
  const officialRecords = useMemo(() => records.filter(r => r.recordType !== "daily_training"), [records]);
  const dailyRecords = useMemo(() => records.filter(r => r.recordType === "daily_training"), [records]);
  const daily7d = useMemo(() => dailyRecords.filter(r => (Date.now()-new Date(r.date).getTime()) < 7*86400000).length, [dailyRecords]);
  const daily30d = useMemo(() => dailyRecords.filter(r => (Date.now()-new Date(r.date).getTime()) < 30*86400000).length, [dailyRecords]);
  const batchItems = useMemo(() => { const s=new Set<string>(); for(const r of officialRecords) for(const i of r.items) s.add(i.itemId); return Array.from(s); }, [officialRecords]);
  const completeness = useMemo(() => calculateRecordCompleteness(batchItems, student?.gender ?? "male"), [batchItems, student?.gender]);

  const [viewingReport, setViewingReport] = useState<AIStudentReport | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [mode, setMode] = useState<"ai" | "mock" | "fallback" | undefined>();
  const [generatingItemId, setGeneratingItemId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const mountedRef = useRef(true);

  const generateReport = useCallback(async (opts: { itemId?: string; reportType?: string }) => {
    if (!student || !latestRecord) return;
    const targetId = opts.itemId ?? null;
    setStatus("analyzing"); setGeneratingItemId(targetId); mountedRef.current = true;
    const cacheKey = [studentId, opts.reportType ?? "overall", targetId].join("-");
    if (inFlightRequests.has(cacheKey)) { try { const r = await inFlightRequests.get(cacheKey)!; if (mountedRef.current) { setViewingReport(r.data as AIStudentReport); setViewingItemId(targetId); setStatus("complete"); } } catch { if (mountedRef.current) setStatus("fallback"); } setGeneratingItemId(null); return; }
    const rp = (async () => {
      const ss = `AI分析 · ${formatTime(latestRecord.date)}`;
      const ctrl = new AbortController(); const tid = window.setTimeout(() => ctrl.abort(), CLIENT_AI_TIMEOUT_MS);
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal, body: JSON.stringify({
        type: "student-report", studentId, sourceRecordId: latestRecord.id, sourceRecordDate: latestRecord.date, sourceSummary: ss,
        studentData: { student, currentRecord: latestRecord, previousRecords: records.slice(1,4), reportType: opts.reportType || (latestRecord.items.length <= 1 ? "item_report" : "record_report"), targetItemId: targetId, analysisScope: opts.reportType === "batch_report" ? "formal_overall" : targetId ? "item_assessment" : "record_report", completeness: completeness ? { recordedCount: completeness.recordedCount, expectedCount: completeness.expectedCount, completionRate: completeness.completionRate } : undefined },
      }) }).finally(() => window.clearTimeout(tid));
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return { data: await res.json() as AIStudentReport, mode: "ai" as const, fallback: false };
    })();
    inFlightRequests.set(cacheKey, rp);
    try { const r = await rp; inFlightRequests.delete(cacheKey); if (mountedRef.current) { setViewingReport(r.data); setViewingItemId(targetId); setMode(r.mode); setStatus("complete"); } }
    catch { inFlightRequests.delete(cacheKey); if (mountedRef.current) { setViewingReport(mockAIStudentReport); setMode("fallback"); setStatus("fallback"); } }
    setGeneratingItemId(null);
  }, [studentId, student, latestRecord, records, completeness]);

  const handleItemClick = useCallback((itemId: string) => { const e = findLatestItemReport(reportHistory, itemId); if (e) { setViewingReport(e.report); setViewingItemId(itemId); setMode(e.mode==="ai"?"ai":"mock"); setStatus("complete"); } else generateReport({itemId, reportType:"item_report"}); }, [reportHistory, generateReport]);

  if (status === "analyzing") return <AIGenerationStatus status="analyzing" mode={mode} subjectLabel={generatingItemId ? `正在生成 ${itemName(generatingItemId)} 专项评估` : "正在分析"} />;
  if (!latestRecord) return (<Card className="rounded-xl shadow-sm"><CardContent className="p-8 text-center space-y-3"><Brain className="mx-auto h-10 w-10 text-muted-foreground/40" /><p className="text-base font-semibold">暂无可分析数据</p><p className="text-sm text-muted-foreground">请先完成一次体测记录</p><Link href="/record"><Button className="gap-1.5"><PlusCircle className="h-4 w-4" />去记录体测</Button></Link></CardContent></Card>);
  if (viewingReport) {
    const detailLabel = viewingItemId ? `${itemName(viewingItemId)} 专项评估` : (viewingReport.reportType ? reportTypeLabel(viewingReport.reportType) : "AI 报告");
    return (<div className="space-y-5"><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => { setViewingReport(null); setViewingItemId(null); }}>← 返回指导中心</Button><Badge variant="excellent" className="text-[10px]">{detailLabel}</Badge>{mode && <Badge variant={mode==="ai"?"excellent":"secondary"} className="text-[10px]">{mode==="ai"?"AI 生成":"示例数据"}</Badge>}</div><ReportHero report={viewingReport} mode={mode} viewingItemId={viewingItemId} /><ReportContent report={viewingReport} viewingItemId={viewingItemId} dailyRecords={dailyRecords} /><div className="h-4" /></div>);
  }

  // ===== 指导中心 =====
  return (
    <div className="space-y-5">
      {/* ===== 1. 数据状态区 ===== */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /><span className="font-medium">正式体测</span><Badge variant={completeness.isComplete?"excellent":"pass"} className="text-[10px]">{completeness.recordedCount}/{completeness.expectedCount} 项</Badge></div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-blue-500" /><span className="font-medium">日常训练</span><Badge variant="secondary" className="text-[10px]">近7天 {daily7d} 次</Badge></div>
          <p className="ml-auto text-[10px] text-muted-foreground">AI 生成内容需经体育教师审核后使用</p>
        </div>
      </div>

      {/* ===== 2. 本周行动建议 ===== */}
      <Card className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><span className="text-base font-semibold">本周行动建议</span></div>
          {completeness.recordedCount > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {completeness.isComplete
                  ? "正式体测已全部完成，以保持训练节奏为主"
                  : `当前已录 ${completeness.recordedCount}/${completeness.expectedCount} 项，建议优先补充缺失项目`}
                {daily30d > 0 ? ` · 近30天训练 ${daily30d} 次，节奏${daily30d >= 8 ? "稳定" : daily30d >= 3 ? "适中" : "偏少"}` : ""}
              </p>
              {completeness.isPartial && completeness.missingItems.length > 0 && (
                <p className="text-xs text-muted-foreground">优先关注：{completeness.missingItems.slice(0, 3).map(id => itemName(id)).join("、")}</p>
              )}
              <div className="flex gap-2">
                <Link href="/record"><Button size="sm" variant="outline" className="gap-1 h-8"><PlusCircle className="h-3.5 w-3.5" />去记录</Button></Link>
                <Link href="/portrait"><Button size="sm" variant="outline" className="gap-1 h-8"><Target className="h-3.5 w-3.5" />查看画像</Button></Link>
              </div>
            </>
          ) : (
            <><p className="text-sm text-muted-foreground">完成一次正式体测后，可生成更完整的指导。也可以先记录日常训练，积累过程数据。</p><Link href="/record"><Button size="sm" className="gap-1"><PlusCircle className="h-3.5 w-3.5" />开始首次记录</Button></Link></>
          )}
        </CardContent>
      </Card>

      {/* ===== 3. 正式体测分析 ===== */}
      <Card className="rounded-xl border shadow-sm"><CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">正式体测分析</span><Badge variant={completeness.isComplete?"excellent":"pass"} className="text-[10px]">{completeness.isComplete?"完整":"不完整"}</Badge></div>
        <p className="text-xs text-muted-foreground">基于当前正式体测批次生成体质画像与薄弱项判断。日常训练不参与评分。</p>
        {completeness.recordedCount > 0 ? (
          <div className="flex gap-2">
            <Button size="sm" className="gap-1 h-8" onClick={() => generateReport({ reportType: "batch_report" })}><Sparkles className="h-3.5 w-3.5" />生成正式体测分析</Button>
          </div>
        ) : <p className="text-xs text-muted-foreground">暂无正式体测数据</p>}
      </CardContent></Card>

      {/* ===== 4. 专项评估（分组）===== */}
      <div>
        <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Target className="h-4 w-4 text-primary" />专项评估</p>
        {(() => {
          // 分组：优先关注 / 稳定保持 / 暂无数据
          const focus: { itemId: string; def: typeof FITNESS_ITEMS[0]; official: typeof officialRecords[0] extends { items: (infer I)[] } ? I : never; daily: number; trend: ReturnType<typeof itemTrendLabel>; hasReport: boolean; generating: boolean }[] = [];
          const stable: typeof focus = [];
          const nodata: typeof focus = [];
          for (const itemId of genderItems) {
            const def = FITNESS_ITEMS.find(f => f.id === itemId); if (!def) continue;
            const r = officialRecords.find(rr => rr.items.some(i => i.itemId === itemId));
            const officialItem = r?.items.find(i => i.itemId === itemId);
            const relatedDaily = dailyRecords.filter(rr => rr.items.some(i => i.itemId === itemId)).length;
            const hasReport = !!findLatestItemReport(reportHistory, itemId);
            const generating = generatingItemId === itemId;
            const vals = records.filter(rr => rr.items.some(i => i.itemId === itemId)).map(rr => rr.items.find(i => i.itemId === itemId)!.score);
            const trend = itemTrendLabel(vals, def.higherIsBetter ?? true);
            const entry = { itemId, def, official: officialItem!, daily: relatedDaily, trend, hasReport, generating };
            if (!officialItem) nodata.push(entry);
            else if (officialItem.score < 70) focus.push(entry);
            else stable.push(entry);
          }
          const groups = [
            { label: "优先关注", items: focus, color: "border-amber-200 bg-amber-50/50" },
            { label: "稳定保持", items: stable, color: "border-muted" },
            { label: "暂无正式数据", items: nodata, color: "border-muted bg-muted/10" },
          ].filter(g => g.items.length > 0);

          return groups.map(g => (
            <div key={g.label} className="mb-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">{g.label} · {g.items.length} 项</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {g.items.map(({ itemId, def, official, daily, trend, hasReport, generating }) => (
                  <Card key={itemId} className={`rounded-xl shadow-sm ${g.color}`}><CardContent className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1"><span className="text-base">{def.icon}</span><p className="text-[11px] font-semibold truncate">{def.name}</p></div>
                    {!official ? (
                      <p className="text-[10px] text-muted-foreground">暂无正式成绩</p>
                    ) : generating ? <p className="text-[10px] text-muted-foreground animate-pulse">生成中...</p> : (
                      <><div className="flex items-center gap-1"><Badge variant={official.grade==="excellent"||official.grade==="good"?"excellent":"pass"} className="text-[10px]">{official.score}分</Badge>{daily>0 && <span className="text-[10px] text-muted-foreground">训练{daily}次</span>}</div>
                        {trend && <p className="text-[9px] text-muted-foreground flex items-center gap-0.5"><trend.icon className="h-2.5 w-2.5" />{trend.label}</p>}
                        <Button size="sm" className="w-full h-6 text-[10px] gap-0.5" onClick={() => hasReport ? (setViewingReport(findLatestItemReport(reportHistory, itemId)!.report), setViewingItemId(itemId), setMode(findLatestItemReport(reportHistory, itemId)!.mode==="ai"?"ai":"mock"), setStatus("complete")) : handleItemClick(itemId)} disabled={generating}>
                          <Sparkles className="h-2.5 w-2.5" />{hasReport ? "查看" : "生成"}
                        </Button></>
                    )}
                  </CardContent></Card>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* ===== 4. 训练观察与下一步建议 ===== */}
      <Card className="rounded-xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-blue-500" /><span className="text-sm font-semibold">训练观察与下一步建议</span></div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-lg bg-muted/30 p-2"><p className="font-bold text-lg">{daily7d}</p><p className="text-muted-foreground">近7天训练</p></div>
          <div className="rounded-lg bg-muted/30 p-2"><p className="font-bold text-lg">{daily30d}</p><p className="text-muted-foreground">近30天训练</p></div>
        </div>
        {dailyRecords.length > 0 ? (
          <p className="text-xs text-muted-foreground">训练节奏：{daily30d >= 8 ? "稳定" : daily30d >= 3 ? "适中" : "偏少"} · 最近训练：{dailyRecords[0] ? new Date(dailyRecords[0].date).toLocaleDateString("zh-CN") : "—"} · {dailyRecords[0]?.items.map(i => itemName(i.itemId)).join("、") || "—"}</p>
        ) : <p className="text-xs text-muted-foreground">暂无日常训练记录</p>}
        <p className="text-[10px] text-muted-foreground">日常训练数据用于观察训练过程，不参与正式体测评分</p>
      </CardContent></Card>

      {/* ===== 5. 历史报告 ===== */}
      {reportHistory.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <button type="button" onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between p-4 text-left"><div className="flex items-center gap-2"><History className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">历史报告</span><Badge variant="secondary" className="text-[10px]">{reportHistory.length} 份</Badge></div>{historyOpen?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}</button>
          {historyOpen && <CardContent className="pt-0 space-y-2">{reportHistory.map(item => { const rType = (item.report as AIStudentReport)?.reportType; return (
            <button key={item.id} type="button" onClick={() => { setViewingReport(item.report); setViewingItemId(null); }} className="w-full rounded-xl border p-3 text-left hover:bg-accent">
              <div className="flex items-center justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-1.5"><p className="text-xs font-semibold truncate">{item.sourceSummary ?? "AI 报告"}</p>{rType && <Badge variant="outline" className="text-[9px]">{reportTypeLabel(rType)}</Badge>}</div><p className="text-[11px] text-muted-foreground mt-0.5">{formatTime(item.generatedAt)}</p></div><Badge variant={item.status==="approved"?"excellent":item.status==="rejected"?"improve":"pass"} className="text-[9px] shrink-0">{item.status==="approved"?"已审核":item.status==="rejected"?"已退回":"待审核"}</Badge></div>
            </button>
          )})}</CardContent>}
        </Card>
      )}

      <div className="h-4" />
    </div>
  );
}

// ===== 报告详情子组件 =====
function ReportHero({ report, mode, viewingItemId }: { report: AIStudentReport; mode?: string; viewingItemId: string | null; dataStatus?: unknown }) {
  const profile = report.fitnessProfile;
  const rs = report.status || "pending_review";
  const RI = rs === "approved" ? CheckCircle2 : rs === "rejected" ? AlertTriangle : Clock;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2"><RI className={`h-5 w-5 ${rs==="approved"?"text-level-excellent":"text-muted-foreground"}`} /><span className="text-sm font-semibold">{rs==="approved"?"教师已审核":rs==="rejected"?"已退回":"待教师审核"}</span>{report.reportType && <Badge variant="excellent" className="text-[10px] ml-auto">{reportTypeLabel(report.reportType)}</Badge>}{mode && <Badge variant={mode==="ai"?"excellent":"secondary"} className="text-[10px]">{mode==="ai"?"AI 生成":"示例数据"}</Badge>}</div>
      <p className="text-base font-semibold leading-relaxed">{profile.summary}</p>
      {viewingItemId && <p className="text-xs text-muted-foreground">来源：正式体测 · {itemName(viewingItemId)} | 日常训练用于辅助观察，不参与评分</p>}
    </div>
  );
}

function ReportContent({ report, viewingItemId, dailyRecords }: { report: AIStudentReport; viewingItemId: string | null; dailyRecords: FitnessRecord[] }) {
  const rs = report.status || "pending_review";
  const RI = rs === "approved" ? CheckCircle2 : rs === "rejected" ? AlertTriangle : Clock;
  const relatedDaily = viewingItemId ? dailyRecords.filter(r => r.items.some(i => i.itemId === viewingItemId)) : dailyRecords;
  return (
    <>
      {viewingItemId && (
        <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">训练观察</CardTitle></CardHeader><CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>相关日常训练：{relatedDaily.length} 次</p>
          {relatedDaily.length > 0 && <p>最近训练：{new Date(relatedDaily[0].date).toLocaleDateString("zh-CN")} · {relatedDaily[0].items.map(i => itemName(i.itemId)).join("、")}</p>}
          <p className="text-[10px]">日常训练数据用于观察训练过程，不参与正式体测评分</p>
        </CardContent></Card>
      )}
      {report.trainingPlan.length > 0 && (
        <Card className="rounded-xl shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base">训练建议</CardTitle></CardHeader><CardContent className="space-y-4">
          {report.trainingPlan.slice(0, 1).map(w => <div key={w.weekNumber}><p className="text-xs font-semibold text-muted-foreground mb-2">第 {w.weekNumber} 周 · {w.focus}</p><div className="grid gap-2 sm:grid-cols-2">{w.exercises.slice(0,4).map((ex,j) => <div key={j} className="rounded-xl border p-3"><p className="text-xs font-semibold">{ex.name}</p><p className="text-[10px] text-muted-foreground mt-1">{ex.frequency} · {ex.duration}</p>{ex.notes && <p className="text-[10px] text-muted-foreground mt-1">⚠ {ex.notes}</p>}</div>)}</div>{w.recoveryAdvice && <p className="text-[11px] text-muted-foreground mt-3">{w.recoveryAdvice}</p>}</div>)}
          <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-level-pass" /><p className="text-xs text-muted-foreground">AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。</p></div>
        </CardContent></Card>
      )}
      {report.weaknessAnalysis.length > 0 && (
        <Card className="rounded-xl shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="h-5 w-5 text-primary" />体测分析</CardTitle></CardHeader><CardContent className="space-y-3">{report.weaknessAnalysis.slice(0,3).map((w,i) => <div key={i} className="rounded-xl border p-3.5"><div className="flex items-center gap-2 mb-1"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i+1}</span><p className="text-sm font-semibold">{w.item}</p><Badge variant="outline" className="text-[10px]">{w.currentLevel}</Badge></div><p className="text-xs text-muted-foreground">{w.possibleCauses[0]}</p><p className="text-xs text-primary mt-1"><Sparkles className="h-3 w-3 inline" />{w.improvementPotential}</p></div>)}</CardContent></Card>
      )}
      {report.safetyReminders.length > 0 && (
        <Card className="rounded-xl shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-level-good" />恢复与安全提醒</CardTitle></CardHeader><CardContent className="space-y-2">{report.safetyReminders.slice(0,4).map((r,i) => <div key={i} className="flex items-start gap-2"><span className="text-xs text-muted-foreground mt-0.5">{i+1}.</span><p className="text-sm text-muted-foreground">{r}</p></div>)}</CardContent></Card>
      )}
      <Card className="rounded-xl shadow-sm"><CardContent className="flex items-center gap-3 p-4"><RI className={`h-5 w-5 shrink-0 ${rs==="approved"?"text-level-excellent":"text-muted-foreground"}`} /><div><p className="text-sm font-medium">{rs==="approved"?"体育教师已审核通过":rs==="rejected"?"该报告暂未通过教师审核":"等待体育教师审核"}</p><p className="text-xs text-muted-foreground mt-0.5">AI 生成，需经体育教师审核后使用。</p></div></CardContent></Card>
    </>
  );
}
