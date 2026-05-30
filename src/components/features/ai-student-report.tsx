"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import { mockAIStudentReport } from "@/lib/data/mock-ai-reports";
import { mockStudents } from "@/lib/data/mock-students";
import { getLatestRecord } from "@/lib/data/mock-fitness-records";
import { getCachedAnalysis, saveCachedAnalysis } from "@/lib/demo-store";
import {
  Brain,
  Sparkles,
  Target,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { AIStudentReport } from "@/lib/types";

// 模块级缓存：跨页面导航不中断 AI 请求
const inFlightRequests = new Map<string, Promise<{ data: unknown; mode: string; fallback: boolean }>>();

interface AIStudentReportProps {
  studentId?: string;
}

export function AIStudentReportView({ studentId = "S001" }: AIStudentReportProps) {
  const [report, setReport] = useState<AIStudentReport | null>(null);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [mode, setMode] = useState<"ai" | "mock" | "fallback" | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const mountedRef = useRef(true);

  const student = mockStudents.find((s) => s.id === studentId) || mockStudents[0];
  const latestRecord = getLatestRecord(studentId);
  const cacheKey = `student-${studentId}`;

  const fetchReport = useCallback(async () => {
    // 检查本地缓存
    const cached = getCachedAnalysis();
    if (cached?.studentReport) {
      setReport(cached.studentReport as unknown as AIStudentReport);
      setMode(cached.mode as "ai" | "mock" | "fallback");
      setStatus("complete");
      return;
    }

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

    setStatus("analyzing");
    setErrorMsg("");

    // 创建持久化请求
    const requestPromise = (async () => {
      const studentData = { student, currentRecord: latestRecord, previousRecords: [] };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "student-report", studentId, studentData }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const responseMode = data._mode as string;
      const isFallback = !!data._fallback;
      const parsed = data.content ? { ...mockAIStudentReport, ...safeMerge(data) } : data;

      // 存入 localStorage 缓存
      saveCachedAnalysis({
        studentReport: parsed as unknown as Record<string, unknown>,
        classReport: null,
        lastUpdated: new Date().toISOString(),
        mode: isFallback ? "fallback" : (responseMode as "ai" | "mock"),
      });

      return { data: parsed, mode: responseMode, fallback: isFallback };
    })();

    inFlightRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      inFlightRequests.delete(cacheKey);
      if (mountedRef.current) {
        setReport(result.data as unknown as AIStudentReport);
        setMode(result.fallback ? "fallback" : (result.mode as "ai" | "mock"));
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
  }, [studentId, student, latestRecord, cacheKey]);

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
        {report && <ReportContent report={report} mode={mode} />}
      </div>
    );
  }

  // 无报告
  if (!report) return null;

  return (
    <div className="space-y-5">
      {/* 生成状态标签 */}
      <AIGenerationStatus status="complete" mode={mode} />

      <ReportContent report={report} mode={mode} />
    </div>
  );
}

// ===== 报告内容渲染（纯展示） =====
function ReportContent({ report, mode }: { report: AIStudentReport; mode?: string }) {
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
