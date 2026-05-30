"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import { mockAIClassReport, mockClassSummary, mockTeacherReviews } from "@/lib/data/mock-ai-reports";
import { mockStudents } from "@/lib/data/mock-students";
import { getLatestRecord } from "@/lib/data/mock-fitness-records";
import {
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { AIClassReport } from "@/lib/types";

export function AIClassReportView() {
  const [report, setReport] = useState<AIClassReport | null>(null);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [mode, setMode] = useState<"ai" | "mock" | "fallback" | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchReport = useCallback(async () => {
    setStatus("analyzing");

    try {
      // 构建班级数据
      const records = mockStudents
        .map((s) => getLatestRecord(s.id))
        .filter(Boolean);

      const classData = {
        students: mockStudents,
        records,
        summary: mockClassSummary,
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "class-report",
          classData,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      setMode(data._fallback ? "fallback" : (data._mode as "ai" | "mock"));

      const parsed = data.content
        ? { ...mockAIClassReport, ...safeMergeClass(data) }
        : data;

      setReport(parsed as AIClassReport);
      setStatus(data._fallback ? "fallback" : "complete");
    } catch (err) {
      console.error("Class report fetch failed:", err);
      setReport(mockAIClassReport);
      setMode("fallback");
      setErrorMsg(err instanceof Error ? err.message : "未知错误");
      setStatus("fallback");
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (status === "analyzing" || status === "generating_profile" || status === "generating_plan") {
    return <AIGenerationStatus status={status} mode={mode} />;
  }

  if (status === "error" || status === "fallback") {
    return (
      <div className="space-y-4">
        <AIGenerationStatus status={status} mode={mode} errorMessage={errorMsg} onRetry={fetchReport} />
        {report && <ReportContent report={report} mode={mode} />}
      </div>
    );
  }

  if (!report) return null;

  const pendingCount = mockTeacherReviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <AIGenerationStatus status="complete" mode={mode} />

      {/* 审核按钮 */}
      {pendingCount > 0 && (
        <Link href="/teacher/review">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Clock className="h-4 w-4 text-level-pass" />
            待审核报告：{pendingCount} 份
            <ClipboardCheck className="h-4 w-4" />
          </Button>
        </Link>
      )}

      <ReportContent report={report} mode={mode} />
    </div>
  );
}

// ===== 报告内容渲染 =====
function ReportContent({ report, mode }: { report: AIClassReport; mode?: string }) {
  const overall = report.overallAnalysis;

  return (
    <>
      {/* 整体分析 */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">班级整体体质分析</CardTitle>
            {mode && (
              <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px] ml-auto">
                {mode === "ai" ? "AI 生成" : "示例数据"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{overall.summary}</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums">{overall.totalStudents}</p>
              <p className="text-xs text-muted-foreground">总人数</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums">{overall.averageScore}</p>
              <p className="text-xs text-muted-foreground">平均分</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums">{overall.passRate}%</p>
              <p className="text-xs text-muted-foreground">及格率</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xl font-bold tabular-nums">{overall.excellentRate}%</p>
              <p className="text-xs text-muted-foreground">优秀率</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 共性薄弱项 */}
      {report.commonWeaknesses.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              共性薄弱项目
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.commonWeaknesses.map((w, i) => (
              <div key={i} className="rounded-xl border p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold">{w.itemName}</p>
                  <Badge variant={w.passRate < 60 ? "improve" : "pass"} className="text-[10px]">
                    及格率 {w.passRate}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{w.analysis}</p>
                <p className="text-xs text-muted-foreground mt-1">影响 {w.affectedStudentCount} 人</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 学生分层 */}
      {report.studentTiers.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">学生分层指导建议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.studentTiers.map((tier) => (
              <div key={tier.tier} className="flex items-start gap-3 rounded-xl border p-3.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  tier.tier === "A" ? "bg-level-excellent/10 text-level-excellent"
                  : tier.tier === "B" ? "bg-level-good/10 text-level-good"
                  : tier.tier === "C" ? "bg-level-pass/10 text-level-pass"
                  : "bg-level-improve/10 text-level-improve"
                }`}>
                  {tier.tier}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{tier.label}</p>
                    <Badge variant="outline" className="text-[10px]">{tier.count}人</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{tier.guidance}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 课堂训练重点 */}
      {report.classTrainingFocus.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">课堂训练重点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.classTrainingFocus.map((f) => (
              <div key={f.priority} className="rounded-xl border p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-[10px]">优先级 {f.priority}</Badge>
                  <p className="text-sm font-semibold">{f.focus}</p>
                </div>
                <ul className="space-y-1">
                  {f.suggestedActivities.map((a, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-primary">•</span> {a}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-primary mt-2">
                  <TrendingUp className="inline h-3 w-3 mr-0.5" />
                  预期效果：{f.expectedOutcome}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 教学改进建议 */}
      {report.teachingSuggestions.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-level-pass" />
              教学改进建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.teachingSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground mt-0.5">{i + 1}.</span>
                <p className="text-sm text-muted-foreground">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI 标注 */}
      <div className="rounded-xl bg-muted/30 p-4 flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">
            AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            以上分析仅供参考，最终教学决策由体育教师根据实际情况确定
          </p>
        </div>
      </div>
    </>
  );
}

function safeMergeClass(data: Record<string, unknown>): Record<string, unknown> {
  try {
    if (data.content && typeof data.content === "string") {
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return { ...mockAIClassReport, ...parsed };
      }
    }
  } catch { /* ignore */ }
  return {};
}
