"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIGenerationStatus, type AIStatus } from "@/components/features/ai-generation-status";
import {
  Target,
  Users,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  Layers,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { AIClassReport } from "@/lib/types";

// ===== 主组件 =====
interface AIClassReportViewProps {
  initialReport: AIClassReport | null;
  pendingReviewCount: number;
}

export function AIClassReportView({ initialReport, pendingReviewCount }: AIClassReportViewProps) {
  const [report] = useState<AIClassReport | null>(initialReport);
  const [status] = useState<AIStatus>(initialReport ? "complete" : "fallback");
  const [mode] = useState<"ai" | "mock" | "fallback" | undefined>(initialReport ? "mock" : "fallback");
  const errorMsg = initialReport ? "" : "数据库中暂无班级报告，请先运行 seed 或生成报告。";

  // ---- 生成中 ----
  if (status === "analyzing" || status === "generating_profile" || status === "generating_plan") {
    return <AIGenerationStatus status={status} mode={mode} subjectLabel="班级体测数据" />;
  }

  // ---- 错误 / 回退 ----
  if (status === "error" || status === "fallback") {
    return (
      <div className="space-y-4">
        <AIGenerationStatus status={status} mode={mode} errorMessage={errorMsg} />
        {report && <ReportContent report={report} mode={mode} />}
      </div>
    );
  }

  // ---- 暂无报告 ----
  if (!report) return null;

  return (
    <div className="space-y-5">
      {/* 生成完成状态条 */}
      <AIGenerationStatus status="complete" mode={mode} />

      {/* 前往审核 CTA — 始终可见 */}
      <Link href="/teacher/review" className="block">
        <Button
          size="default"
          className="w-full gap-2 shadow-sm"
        >
          <ClipboardCheck className="h-4 w-4" />
          前往审核中心 · 教师审核后推送
          {pendingReviewCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {pendingReviewCount} 份待审
            </Badge>
          )}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>

      <ReportContent report={report} mode={mode} />
    </div>
  );
}

// ===== 报告内容渲染 =====
function ReportContent({ report }: { report: AIClassReport; mode?: string }) {
  const overall = report.overallAnalysis;

  return (
    <>
      {/* ============ 桌面布局网格 ============ */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-5 space-y-5 lg:space-y-0">

        {/* ── 一、整体分析 ── col-span-12 ── */}
        <section className="lg:col-span-12 space-y-0">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">一、班级整体体质分析</CardTitle>
              </div>
              <CardDescription className="text-xs">
                基于全班体测数据的综合评估，涵盖平均分、及格率、优秀率等核心指标
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 一节总结 */}
              <p className="text-sm font-semibold leading-relaxed">{overall.summary}</p>

              {/* 核心指标 */}
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
        </section>

        {/* ── 二、共性薄弱项 ── col-span-6 ── */}
        {report.commonWeaknesses.length > 0 && (
          <section className="lg:col-span-6 space-y-0">
            <Card className="rounded-xl border shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">二、共性薄弱项目</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  全班集中暴露的体能短板，需在课堂教学中重点关注
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold">
                  共识别 {report.commonWeaknesses.length} 个班级共性薄弱项目，{report.commonWeaknesses[0]?.itemName}为最突出问题。
                </p>
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
          </section>
        )}

        {/* ── 三、分层指导 ── col-span-6 ── */}
        {report.studentTiers.length > 0 && (
          <section className="lg:col-span-6 space-y-0">
            <Card className="rounded-xl border shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">三、学生分层指导建议</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  根据体质水平将全班分为不同层级，实施差异化教学策略
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold">
                  全班共 {report.studentTiers.length} 个层级，{report.studentTiers.find((t) => t.tier === "C" || t.tier === "D")?.label ?? "部分学生"}需重点关注。
                </p>
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
          </section>
        )}

        {/* ── 四、课堂训练重点 ── col-span-6 ── */}
        {report.classTrainingFocus.length > 0 && (
          <section className="lg:col-span-6 space-y-0">
            <Card className="rounded-xl border shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">四、课堂训练重点</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  针对班级薄弱环节制定的专项训练方案与预期效果
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold">
                  制定 {report.classTrainingFocus.length} 项专项训练计划，优先提升{report.classTrainingFocus[0]?.focus ?? "耐力素质"}。
                </p>
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
          </section>
        )}

        {/* ── 五、教学改进建议 ── col-span-6 ── */}
        {report.teachingSuggestions.length > 0 && (
          <section className="lg:col-span-6 space-y-0">
            <Card className="rounded-xl border shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">五、教学改进建议</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  基于数据分析得出的教学方法与策略优化方向
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold">
                  基于班级数据分析，提出 {report.teachingSuggestions.length} 条教学改进建议。
                </p>
                {report.teachingSuggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

      </div>

      {/* ── AI 免责声明 ── */}
      <Card className="rounded-xl border border-muted bg-muted/20 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">重要提示</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
              </p>
              <p className="text-xs text-muted-foreground">
                以上分析仅供参考，最终教学决策由体育教师根据实际情况确定。AI 生成内容可能存在偏差，请务必以专业判断为准。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
