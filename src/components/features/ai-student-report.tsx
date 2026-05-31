"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import { mockAIStudentReport } from "@/lib/data/mock-ai-reports";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import { FITNESS_ITEMS } from "@/lib/constants";
import {
  Brain,
  Sparkles,
  Target,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { AIStudentReport, FitnessRecord, StudentProfile } from "@/lib/types";

// 模块级缓存：跨页面导航不中断 AI 请求
const inFlightRequests = new Map<string, Promise<{ data: unknown; mode: string; fallback: boolean }>>();
const CLIENT_AI_TIMEOUT_MS = 15000;

interface AIStudentReportProps {
  studentId?: string;
  student: StudentProfile | null;
  records: FitnessRecord[];
  reportHistory: StudentReportHistoryItem[];
}

export function AIStudentReportView({
  studentId = "S001",
  student,
  records,
  reportHistory,
}: AIStudentReportProps) {
  const initialHistory = reportHistory[0] ?? null;
  const [report, setReport] = useState<AIStudentReport | null>(initialHistory?.report ?? null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(initialHistory?.id ?? null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialHistory?.generatedAt ?? null);
  const [sourceSummary, setSourceSummary] = useState<string | null>(initialHistory?.sourceSummary ?? null);
  const [status, setStatus] = useState<AIStatus>(initialHistory ? "complete" : "idle");
  const [mode, setMode] = useState<"ai" | "mock" | "fallback" | undefined>(
    initialHistory?.mode === "ai" ? "ai" : initialHistory ? "mock" : undefined
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const mountedRef = useRef(true);

  const latestRecord = records[0] ?? null;
  const cacheKey = `student-${studentId}`;

  const fetchReport = useCallback(async () => {
    // 检查是否有正在进行的同 ID 请求（跨页面导航场景）
    if (inFlightRequests.has(cacheKey)) {
      try {
        const result = await inFlightRequests.get(cacheKey)!;
        if (mountedRef.current) {
          const parsed = result.data;
          setReport(parsed as unknown as AIStudentReport);
          setMode(result.fallback ? "fallback" : (result.mode as "ai" | "mock"));
          setStatus(result.fallback ? "fallback" : "complete");
        }
      } catch {
        if (mountedRef.current) {
          setReport(mockAIStudentReport);
          setMode("fallback");
          setStatus("fallback");
        }
      }
      return;
    }

    if (!student || !latestRecord) {
      setErrorMsg("暂无可用于分析的体测记录");
      setStatus("fallback");
      setReport(mockAIStudentReport);
      return;
    }

    setStatus("analyzing");
    setErrorMsg("");

    // 创建持久化请求
    const requestPromise = (async () => {
      const studentData = {
        student,
        currentRecord: latestRecord,
        previousRecords: records.slice(1, 4),
        analysisMode: "single_record_with_history_context",
      };
      const sourceSummaryText = buildRecordSummary(latestRecord);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_AI_TIMEOUT_MS);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: "student-report",
          studentId,
          studentData,
          sourceRecordId: latestRecord.id,
          sourceRecordDate: latestRecord.date,
          sourceSummary: sourceSummaryText,
        }),
      }).finally(() => window.clearTimeout(timeoutId));

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const responseMode = data._mode as string;
      const isFallback = !!data._fallback;
      const parsed = data.content ? { ...mockAIStudentReport, ...safeMerge(data) } : data;

      return { data: parsed, mode: responseMode, fallback: isFallback };
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

  useEffect(() => {
    mountedRef.current = true;
    fetchReport();
    return () => { mountedRef.current = false; };
  }, [fetchReport]);

  useEffect(() => {
    if (status !== "analyzing") return;

    const profileTimer = window.setTimeout(() => {
      setStatus((current) => current === "analyzing" ? "generating_profile" : current);
    }, 900);
    const planTimer = window.setTimeout(() => {
      setStatus((current) => current === "generating_profile" ? "generating_plan" : current);
    }, 1900);

    return () => {
      window.clearTimeout(profileTimer);
      window.clearTimeout(planTimer);
    };
  }, [status]);

  // 正在生成中
  if (status === "analyzing" || status === "generating_profile" || status === "generating_plan") {
    return <AIGenerationStatus status={status} mode={mode} />;
  }

  // 错误或回退
  if (status === "error" || status === "fallback") {
    return (
      <div className="space-y-4">
        <AIGenerationStatus
          status={status}
          mode={mode}
          errorMessage={errorMsg}
          onRetry={fetchReport}
        />
        {report && <ReportContent report={report} mode={mode} generatedAt={generatedAt} sourceSummary={sourceSummary} />}
      </div>
    );
  }

  // 无报告
  if (!report) return null;

  return (
    <div className="space-y-5">
      {/* 生成状态标签 */}
      <AIGenerationStatus status="complete" mode={mode} />

      <GuidanceStrategyCard recordCount={records.length} latestRecord={latestRecord} onGenerate={fetchReport} />

      {reportHistory.length > 0 && (
        <ReportHistoryList
          items={reportHistory}
          selectedId={selectedHistoryId}
          onSelect={(item) => {
            setSelectedHistoryId(item.id);
            setReport(item.report);
            setGeneratedAt(item.generatedAt);
            setSourceSummary(item.sourceSummary);
            setMode(item.mode === "ai" ? "ai" : "mock");
            setStatus("complete");
          }}
        />
      )}

      <ReportContent report={report} mode={mode} generatedAt={generatedAt} sourceSummary={sourceSummary} />
    </div>
  );
}

// ===== 报告内容渲染（纯展示） =====
function ReportContent({
  report,
  mode,
  generatedAt,
  sourceSummary,
}: {
  report: AIStudentReport;
  mode?: string;
  generatedAt: string | null;
  sourceSummary: string | null;
}) {
  const profile = report.fitnessProfile;

  // 找出审核状态
  const reviewStatus = report.status || "pending_review";
  const reviewLabel =
    reviewStatus === "approved" ? "体育教师已审核通过，可在教师指导下实施"
    : reviewStatus === "rejected" ? "已退回"
    : "等待体育教师审核";

  const reviewIcon =
    reviewStatus === "approved" ? CheckCircle2
    : reviewStatus === "rejected" ? AlertTriangle
    : Clock;

  const ReviewIcon = reviewIcon;

  return (
    <>
      {/* 体质画像 */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">体质画像</CardTitle>
            {mode && (
              <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px] ml-auto">
                {mode === "ai" ? "AI 生成" : mode === "fallback" ? "示例数据" : "示例数据"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">
              生成时间：{formatDisplayTime(generatedAt ?? report.generatedAt)}
            </Badge>
            {sourceSummary && (
              <Badge variant="secondary" className="text-[10px]">
                来源：{sourceSummary}
              </Badge>
            )}
          </div>
          <p className="text-sm font-semibold">{profile.summary}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums">{profile.overallScore}</p>
              <p className="text-xs text-muted-foreground">综合评分</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-sm font-semibold">{profile.bmiStatus}</p>
              <p className="text-xs text-muted-foreground">BMI 状态</p>
            </div>
          </div>

          {/* 优势/待提升 */}
          <div className="flex flex-wrap gap-1.5">
            {profile.strengths.map((s, i) => (
              <Badge key={i} variant="excellent" className="text-[10px]">{s}</Badge>
            ))}
            {profile.improvements.map((s, i) => (
              <Badge key={i} variant="pass" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 薄弱项分析 */}
      {report.weaknessAnalysis.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              待提升项目
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.weaknessAnalysis.map((w, i) => (
              <div key={i} className="rounded-xl border p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold">{w.item}</p>
                  <Badge variant="outline" className="text-[10px]">{w.currentLevel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {w.possibleCauses[0]}
                </p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {w.improvementPotential}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 训练计划 */}
      {report.trainingPlan.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">个性化训练计划</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {report.trainingPlan.slice(0, 1).flatMap((week) =>
                week.exercises.slice(0, 4).map((ex, j) => (
                  <div key={j} className="rounded-xl border p-3">
                    <p className="text-xs font-semibold">{ex.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{ex.frequency} · {ex.duration}</p>
                  </div>
                ))
              )}
            </div>

            {/* 授权警告 */}
            <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-level-pass" />
              <p className="text-xs text-muted-foreground">
                AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 安全提醒 */}
      {report.safetyReminders.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-level-good" />
              运动安全提醒
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.safetyReminders.slice(0, 3).map((r, i) => (
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
          <ReviewIcon className={`h-5 w-5 shrink-0 ${
            reviewStatus === "approved" ? "text-level-excellent" : "text-muted-foreground"
          }`} />
          <div>
            <p className="text-sm font-medium">{reviewLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
            </p>
          </div>
          {reviewStatus !== "approved" && (
            <Badge variant="pass" className="ml-auto text-[10px]">待教师授权</Badge>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function GuidanceStrategyCard({
  recordCount,
  latestRecord,
  onGenerate,
}: {
  recordCount: number;
  latestRecord: FitnessRecord | null;
  onGenerate: () => void;
}) {
  if (!latestRecord) return null;

  const itemCount = latestRecord.items.length;
  const isComprehensive = itemCount >= 2;
  const analysisType = getAnalysisType(itemCount);
  const TypeIcon = analysisType.icon;

  return (
    <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isComprehensive ? "bg-primary/10" : "bg-blue-500/10"}`}>
            <TypeIcon className={`h-5 w-5 ${isComprehensive ? "text-primary" : "text-blue-500"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">
                {isComprehensive ? "本次综合分析" : "本次专项分析"}
              </p>
              <Badge variant={analysisType.variant} className="text-[10px]">
                {analysisType.label}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {isComprehensive
                ? `基于 ${itemCount} 个项目的完整记录，AI 将综合评估你的体质水平，提供跨维度的训练建议`
                : `单项目专项分析：AI 将针对「${FITNESS_ITEMS.find(i => i.id === latestRecord.items[0]?.itemId)?.name ?? "该项目"}」进行深入分析，提供该项目的技术指导和提升建议`
              }
            </p>
            <p className="mt-2 text-xs text-primary">
              📋 来源记录：{buildRecordSummary(latestRecord)}
              <span className="ml-2 text-muted-foreground">· {relativeTime(latestRecord.date)}记录</span>
              {recordCount > 1 && <span className="ml-1 text-muted-foreground">· 累计 {recordCount} 次</span>}
            </p>
          </div>
        </div>
        <Button size="sm" className="h-11 w-full gap-2" onClick={onGenerate}>
          <Brain className="h-4 w-4" />
          {isComprehensive ? "生成综合体质分析报告" : "生成专项分析与指导"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ReportHistoryList({
  items,
  selectedId,
  onSelect,
}: {
  items: StudentReportHistoryItem[];
  selectedId: string | null;
  onSelect: (_item: StudentReportHistoryItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5 text-primary" />
            历史分析报告
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">{items.length} 份</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          每次体测记录都可以生成专属分析，点击查看不同时期的报告
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, index) => {
          const itemCount = item.report?.weaknessAnalysis?.length ?? item.report?.fitnessProfile?.dimensions?.length;
          const analysisType = getAnalysisType(itemCount);
          const TypeIcon = analysisType.icon;
          const isLatest = index === 0;
          const isSelected = selectedId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-accent"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {item.sourceSummary ?? "综合体质分析"}
                    </p>
                    {isLatest && (
                      <Badge variant="excellent" className="text-[10px]">最新</Badge>
                    )}
                    <Badge variant={analysisType.variant} className="text-[10px] gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {analysisType.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDisplayTime(item.generatedAt)}
                    </span>
                    <span>{relativeTime(item.generatedAt)}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {item.report.fitnessProfile.summary.slice(0, 80)}...
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant={
                      item.status === "approved" ? "excellent"
                      : item.status === "rejected" ? "improve"
                      : "pass"
                    }
                    className="text-[10px]"
                  >
                    {item.status === "approved" ? "✓ 已审核"
                    : item.status === "rejected" ? "✗ 已退回"
                    : "待审核"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {item.mode === "ai" ? "AI 生成" : "示例数据"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function buildRecordSummary(record: FitnessRecord): string {
  const itemNames = record.items
    .map((item) => FITNESS_ITEMS.find((definition) => definition.id === item.itemId)?.name ?? item.itemId)
    .slice(0, 3)
    .join("、");
  const more = record.items.length > 3 ? `等 ${record.items.length} 项` : `${record.items.length} 项`;
  return `${formatDisplayTime(record.date)} · ${itemNames}${more}`;
}

function formatDisplayTime(value: string | null): string {
  if (!value) return "暂无时间";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 相对时间显示：如"3天前""1周前""2个月前" */
function relativeTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffWeeks < 4) return `${diffWeeks}周前`;
  if (diffMonths < 12) return `${diffMonths}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

/** 判断分析类型 */
function getAnalysisType(itemCount: number | undefined): { label: string; icon: typeof Zap; variant: "excellent" | "secondary" } {
  if (!itemCount || itemCount <= 1) {
    return { label: "专项分析", icon: Zap, variant: "secondary" };
  }
  return { label: "综合分析", icon: TrendingUp, variant: "excellent" };
}

// 安全深合并：AI 返回数据深度合并到 mock 默认结构，不丢失嵌套字段
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else if (sv !== undefined && sv !== null) {
      result[key] = sv;
    }
  }
  return result;
}

function safeMerge(data: Record<string, unknown>): Record<string, unknown> {
  try {
    if (data.content && typeof data.content === "string") {
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return deepMerge(mockAIStudentReport as unknown as Record<string, unknown>, parsed);
      }
    }
  } catch { /* ignore parse errors */ }
  return {};
}
