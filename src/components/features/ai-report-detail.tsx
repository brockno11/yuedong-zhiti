"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FITNESS_ITEMS } from "@/lib/constants";
import { computeDimensionsFromItems, type DimensionInput } from "@/lib/scoring";
import type { AIStudentReport, FitnessItemId, GradeTier } from "@/lib/types";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";

type ReportMode = "ai" | "mock" | "fallback";

interface ReportDetailProps {
  report: AIStudentReport;
  mode?: ReportMode;
  viewingItemId: FitnessItemId | null;
  formalBatches: Array<{ id: string; name: string }>;
  selectedBatchId: string | null;
  batchReportMap?: Map<string, StudentReportHistoryItem | null>;
  allBatchReports?: StudentReportHistoryItem[];
  onBack: () => void;
  onGenerateForBatch?: (_batchId: string) => void;
  onView?: (_report: StudentReportHistoryItem) => void;
  onDeleteReport?: (_reportId: string) => void;
}

function itemName(id: string): string {
  return FITNESS_ITEMS.find((item) => item.id === id)?.name ?? id;
}

function replaceAllText(value: string, search: string, replacement: string): string {
  return value.split(search).join(replacement);
}

function normalizeReportText(value: string): string {
  let result = value;
  for (const item of FITNESS_ITEMS) {
    result = replaceAllText(result, item.id, item.name);
  }
  const gradeEntries: Array<[string, string]> = [
    ["excellent", "优秀"], ["good", "良好"], ["pass", "及格"], ["improve", "有提升空间"],
  ];
  for (const [raw, label] of gradeEntries) {
    result = replaceAllText(result, raw, label);
  }
  return result;
}

function gradeLabel(grade?: GradeTier | null): string {
  if (grade === "excellent") return "优秀";
  if (grade === "good") return "良好";
  if (grade === "pass") return "及格";
  if (grade === "improve") return "有提升空间";
  return "暂无";
}

function reportTypeLabel(type?: string): string {
  if (type === "item_report") return "专项分析";
  if (type === "record_report") return "本次反馈";
  if (type === "batch_report") return "正式体测分析";
  return "AI 分析";
}

function reviewBadge(status: string) {
  if (status === "approved") return { label: "已审核", variant: "excellent" as const };
  if (status === "rejected") return { label: "已退回", variant: "improve" as const };
  return { label: "待审核", variant: "pass" as const };
}

// ===== Main Component =====

export function AIReportDetail({
  report,
  mode,
  viewingItemId,
  formalBatches,
  selectedBatchId,
  batchReportMap,
  onBack,
  onGenerateForBatch,
  allBatchReports,
  onView: onViewHistory,
  onDeleteReport,
}: ReportDetailProps) {
  const status = report.status || "pending_review";
  const StatusIcon = status === "approved" ? CheckCircle2 : status === "rejected" ? AlertTriangle : Clock;
  const review = reviewBadge(status);
  const profile = report.fitnessProfile;

  // ===== BATCH REPORT — 全维度正式体测分析 =====
  if (report.reportType === "batch_report") {
    // Check report type: AI-generated (has real ID), preview (computed from records), or empty
    const isPreviewReport = report.id.startsWith("preview-");
    const isAIReport = !isPreviewReport && report.fitnessProfile.dimensions.length > 0;
    const batchHasReport = isAIReport || isPreviewReport;

    return (
      <div className="space-y-5 pb-28">
        {/* 1. Top Operation Area */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="h-11 gap-1.5"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            返回报告中心
          </Button>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="good" className="text-[10px]">正式体测分析</Badge>
            {mode && (
              <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px]">
                {mode === "ai" ? "AI 生成" : "示例数据"}
              </Badge>
            )}
            <Badge variant={review.variant} className="text-[10px]">{review.label}</Badge>
          </div>
        </div>

        {/* Empty state for batch without report */}
        {!batchHasReport && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="space-y-4 p-6 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-semibold">该批次暂无分析报告</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  尚未为该正式体测批次生成 AI 分析。可基于最新体测数据生成。
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                AI 生成内容需经体育教师审核后使用。
              </p>
            </CardContent>
          </Card>
        )}

        {batchHasReport && (
          <>
            {/* Preview notice */}
            {isPreviewReport && (
              <Card className="rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">数据预览</p>
                      <p className="mt-1 text-xs text-amber-700">
                        以下内容基于该批次的正式体测记录自动计算，非 AI 分析报告。各维度表现和成绩表可直接查看。
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600">
                    建议点击下方按钮生成完整的 AI 全维度分析报告，获取项目关系分析、阶段训练方案和教学参考。
                  </p>
                  <Button size="sm" className="h-9 gap-1.5" onClick={() => onGenerateForBatch?.(selectedBatchId ?? "")}>
                    <Sparkles className="h-3.5 w-3.5" />
                    生成 AI 正式体测分析
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 2. Overview Card */}
            <Card className="rounded-xl shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{review.label}</span>
                </div>
                <p className="text-sm leading-relaxed">{normalizeReportText(profile.summary)}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>综合评分：<strong className="tabular-nums text-foreground">{profile.overallScore}</strong> 分</span>
                  <Badge variant="outline" className="text-[10px]">{gradeLabel(profile.overallGrade)}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  基于正式体测数据生成，日常训练不参与评分。
                </p>
              </CardContent>
            </Card>

            {/* 3. Item Scores Table */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">各项目成绩</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.itemScores && report.itemScores.length > 0 ? (
                  report.itemScores.map((item) => (
                    <div key={item.itemId} className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2.5">
                      <span className="text-sm font-medium min-w-[60px]">{item.itemName}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{item.valueText}</span>
                      <span className="text-xs tabular-nums font-semibold ml-auto">{item.score}分</span>
                      <Badge variant={
                        item.grade === "excellent" || item.grade === "good" ? "excellent"
                        : item.grade === "pass" ? "pass" : "improve"
                      } className="text-[9px]">{gradeLabel(item.grade)}</Badge>
                      <Badge variant="outline" className="text-[9px] shrink-0">{item.statusLabel}</Badge>
                    </div>
                  ))
                ) : (
                  <FallbackItemScores report={report} />
                )}
                {/* Show analysis & suggestion for items with content */}
                {report.itemScores && report.itemScores.length > 0 && (
                  <ItemAnalysisAccordion items={report.itemScores} />
                )}
              </CardContent>
            </Card>

            {/* 4. Dimensions */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">各维度表现</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DimensionList dimensions={profile.dimensions} report={report} />
              </CardContent>
            </Card>

            {/* 5. Relationship Analysis */}
            {report.relationshipAnalysis && report.relationshipAnalysis.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    项目关系分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.relationshipAnalysis.map((rel, i) => (
                    <div key={i} className="rounded-xl border p-3">
                      <p className="text-xs font-semibold">{normalizeReportText(rel.title)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        关联项目：{rel.relatedItems.join("、")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{normalizeReportText(rel.analysis)}</p>
                      <p className="mt-1 text-xs text-primary">{normalizeReportText(rel.suggestion)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 6. Weakness/Key Focus */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  重点关注项目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.weaknessAnalysis.length > 0 ? (
                  report.weaknessAnalysis.map((item, i) => (
                    <div key={`${item.item}-${i}`} className="rounded-xl border p-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <p className="text-sm font-semibold">{normalizeReportText(item.item)}</p>
                        <Badge variant="outline" className="text-[10px]">{normalizeReportText(item.currentLevel)}</Badge>
                        {"priority" in item && typeof item.priority === "string" && (
                          <Badge variant={item.priority === "high" ? "improve" : "pass"} className="text-[9px]">
                            {item.priority === "high" ? "高优先" : "中优先"}
                          </Badge>
                        )}
                      </div>
                      {item.possibleCauses.length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">可能原因：</span>
                          {item.possibleCauses.map((c, j) => (
                            <span key={j}>{normalizeReportText(c)}{j < item.possibleCauses.length - 1 ? "；" : ""}</span>
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-primary">{normalizeReportText(item.improvementPotential)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">当前所有已测项目都达到了良好及以上水平。</p>
                )}
              </CardContent>
            </Card>

            {/* 7. Strengths & Improvements */}
            <Card className="rounded-xl shadow-sm">
              <CardContent className="space-y-3 p-4">
                {profile.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-level-excellent">优势项目</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile.strengths.map(normalizeReportText).join("、")}
                    </p>
                  </div>
                )}
                {report.strengthsAnalysis && report.strengthsAnalysis.length > 0 && (
                  <div className="space-y-2">
                    {report.strengthsAnalysis.map((s, i) => (
                      <div key={i} className="rounded-lg bg-muted/20 p-2.5 text-xs">
                        <p className="font-medium">{normalizeReportText(s.item)}</p>
                        <p className="mt-0.5 text-muted-foreground">{normalizeReportText(s.reason)}</p>
                        <p className="mt-0.5">训练基础：{normalizeReportText(s.foundationFor)}</p>
                      </div>
                    ))}
                  </div>
                )}
                {profile.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-level-improve">有提升空间</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile.improvements.map(normalizeReportText).join("、")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 8. Stage Training Plan */}
            {(report.stageTrainingPlan && report.stageTrainingPlan.length > 0) || report.trainingPlan.length > 0 ? (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">阶段训练参考</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prefer stageTrainingPlan if available */}
                  {report.stageTrainingPlan && report.stageTrainingPlan.length > 0 ? (
                    report.stageTrainingPlan.map((stage, i) => (
                      <CollapsibleStage key={i} stage={stage} defaultOpen={i === 0} />
                    ))
                  ) : (
                    report.trainingPlan.map((week) => (
                      <div key={week.weekNumber}>
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">
                          第 {week.weekNumber} 周 · {week.focus}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {week.exercises.map((exercise) => (
                            <div key={exercise.name} className="rounded-xl border p-3">
                              <p className="text-xs font-semibold">{normalizeReportText(exercise.name)}</p>
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {normalizeReportText(exercise.frequency)} · {normalizeReportText(exercise.duration)}
                              </p>
                              {exercise.notes && (
                                <p className="mt-1 text-[10px] text-muted-foreground">{normalizeReportText(exercise.notes)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {week.recoveryAdvice && (
                          <p className="mt-3 text-[11px] text-muted-foreground">
                            {normalizeReportText(week.recoveryAdvice)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                  <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* 9. Teaching Suggestions */}
            {report.teachingSuggestions && report.teachingSuggestions.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">教学参考</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.teachingSuggestions.map((ts, i) => (
                    <div key={i} className="rounded-xl border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px]">{ts.scenario}</Badge>
                        <span className="text-xs font-semibold text-muted-foreground">教师参考 {i + 1}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{normalizeReportText(ts.suggestion)}</p>
                      {ts.observationPoint && (
                        <p className="mt-1 text-[11px] text-primary">
                          观察要点：{normalizeReportText(ts.observationPoint)}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 10. Safety Reminders */}
            {report.safetyReminders.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    恢复与安全提醒
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.safetyReminders.map((reminder, i) => (
                    <div key={`${reminder}-${i}`} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-muted-foreground">{i + 1}.</span>
                      <p className="text-xs text-muted-foreground">{normalizeReportText(reminder)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 11. Historical batch reports */}
            {allBatchReports && allBatchReports.length > 1 && (
              <BatchHistorySection
                allBatchReports={allBatchReports}
                currentReportId={report.id}
                onView={onViewHistory}
                onDelete={onDeleteReport}
                batchReportMap={batchReportMap}
                formalBatches={formalBatches}
              />
            )}

            {/* 12. Review status & Disclaimer */}
            <Card className="rounded-xl shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <StatusIcon className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {status === "approved"
                      ? "体育教师已审核通过"
                      : status === "rejected"
                        ? "该报告暂未通过教师审核"
                        : "等待体育教师审核"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  // ===== ITEM REPORT — 专项分析 =====
  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="h-11 gap-1.5"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          返回报告中心
        </Button>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="good" className="text-[10px]">
            {viewingItemId ? `${itemName(viewingItemId)} 专项分析` : reportTypeLabel(report.reportType)}
          </Badge>
          {mode && (
            <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px]">
              {mode === "ai" ? "AI 生成" : "示例数据"}
            </Badge>
          )}
          <Badge variant={review.variant} className="text-[10px]">{review.label}</Badge>
        </div>
      </div>

      {/* Summary */}
      <Card className="rounded-xl border border-primary/10 bg-primary/5 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">{review.label}</span>
          </div>
          <p className="text-base font-semibold leading-relaxed">{normalizeReportText(profile.summary)}</p>
          <p className="text-xs text-muted-foreground">
            来源：{viewingItemId ? `正式体测 · ${itemName(viewingItemId)} + 同项目日常训练` : reportTypeLabel(report.reportType)}
            。日常训练用于辅助观察，不参与正式评分。
          </p>
        </CardContent>
      </Card>

      {/* Analysis */}
      {report.weaknessAnalysis.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              {viewingItemId ? `${itemName(viewingItemId)} 专项分析` : "体测分析"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.weaknessAnalysis.map((item, i) => (
              <div key={`${item.item}-${i}`} className="rounded-xl border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold">{normalizeReportText(item.item)}</p>
                  <Badge variant="outline" className="text-[10px]">{normalizeReportText(item.currentLevel)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{normalizeReportText(item.possibleCauses[0] ?? "")}</p>
                <p className="mt-1 text-xs text-primary">{normalizeReportText(item.improvementPotential)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Training plan */}
      {report.trainingPlan.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">训练建议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.trainingPlan.map((week) => (
              <div key={week.weekNumber}>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  第 {week.weekNumber} 周 · {week.focus}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {week.exercises.map((exercise) => (
                    <div key={exercise.name} className="rounded-xl border p-3">
                      <p className="text-xs font-semibold">{normalizeReportText(exercise.name)}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {normalizeReportText(exercise.frequency)} · {normalizeReportText(exercise.duration)}
                      </p>
                      {exercise.notes && (
                        <p className="mt-1 text-[10px] text-muted-foreground">{normalizeReportText(exercise.notes)}</p>
                      )}
                    </div>
                  ))}
                </div>
                {week.recoveryAdvice && (
                  <p className="mt-3 text-[11px] text-muted-foreground">{normalizeReportText(week.recoveryAdvice)}</p>
                )}
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety reminders */}
      {report.safetyReminders.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              恢复与安全提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.safetyReminders.map((reminder, i) => (
              <div key={`${reminder}-${i}`} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs text-muted-foreground">{i + 1}.</span>
                <p className="text-xs text-muted-foreground">{normalizeReportText(reminder)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <StatusIcon className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">
              {status === "approved" ? "体育教师已审核通过" : status === "rejected" ? "该报告暂未通过教师审核" : "等待体育教师审核"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">AI 生成，需经体育教师审核后使用。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Sub-components =====

function CollapsibleStage({
  stage,
  defaultOpen,
}: {
  stage: {
    stage: string;
    goal: string;
    duration: string;
    focus: string;
    exercises: Array<{ name: string; description: string; sets: string; frequency: string; duration: string; notes: string }>;
    recoveryAdvice: string;
  };
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div>
          <p className="text-xs font-semibold">{normalizeReportText(stage.stage)}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {stage.duration} · {stage.goal}
          </p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {open && (
        <div className="space-y-2 border-t px-3 pb-3 pt-2">
          <p className="text-[11px] text-muted-foreground">重点：{stage.focus}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {stage.exercises.map((ex) => (
              <div key={ex.name} className="rounded-lg bg-muted/20 p-2.5">
                <p className="text-xs font-semibold">{normalizeReportText(ex.name)}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{ex.description}</p>
                <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                  <span>{ex.sets}</span>
                  <span>·</span>
                  <span>{ex.frequency}</span>
                  <span>·</span>
                  <span>{ex.duration}</span>
                </div>
                {ex.notes && <p className="mt-0.5 text-[10px] text-muted-foreground">{normalizeReportText(ex.notes)}</p>}
              </div>
            ))}
          </div>
          {stage.recoveryAdvice && (
            <p className="text-[11px] text-muted-foreground">{normalizeReportText(stage.recoveryAdvice)}</p>
          )}
        </div>
      )}
    </div>
  );
}

function ItemAnalysisAccordion({
  items,
}: {
  items: Array<{ itemName: string; analysis: string; suggestion: string }>;
}) {
  const [open, setOpen] = useState(false);
  const hasContent = items.some(i => i.analysis || i.suggestion);
  if (!hasContent) return null;
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 text-[11px] text-muted-foreground"
      >
        查看逐项分析说明
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.filter(i => i.analysis || i.suggestion).map((item) => (
            <div key={item.itemName} className="rounded-lg bg-muted/20 p-2.5 text-xs">
              <p className="font-medium">{item.itemName}</p>
              {item.analysis && <p className="mt-0.5 text-muted-foreground">{normalizeReportText(item.analysis)}</p>}
              {item.suggestion && <p className="mt-0.5 text-primary">{normalizeReportText(item.suggestion)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DimensionList({
  dimensions,
  report,
}: {
  dimensions: AIStudentReport["fitnessProfile"]["dimensions"];
  report: AIStudentReport;
}) {
  // If dimensions are empty, compute fallback from itemScores
  const dims = dimensions.length > 0 ? dimensions : computeFallbackDimensions(report);

  if (dims.length === 0) {
    return <p className="text-xs text-muted-foreground">暂无维度数据。</p>;
  }

  return (
    <div className="space-y-2">
      {dims.map((dim) => (
        <div key={dim.key} className="rounded-lg bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{dim.label}</span>
            <div className="flex items-center gap-2">
              {dim.score !== null && dim.score !== undefined ? (
                <>
                  <span className="text-xs tabular-nums">{dim.score}分</span>
                  <Badge variant="outline" className="text-[9px]">{gradeLabel(dim.grade)}</Badge>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground">暂无数据</span>
              )}
            </div>
          </div>
          {dim.relatedItems && dim.relatedItems.length > 0 && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              关联项目：{dim.relatedItems.join("、")}
            </p>
          )}
          {dim.analysis && <p className="mt-1 text-[11px] text-muted-foreground">{normalizeReportText(dim.analysis)}</p>}
          {dim.suggestion && <p className="mt-1 text-[11px] text-primary">{normalizeReportText(dim.suggestion)}</p>}
        </div>
      ))}
    </div>
  );
}

function computeFallbackDimensions(report: AIStudentReport) {
  if (!report.itemScores || report.itemScores.length === 0) return [];
  const inputs: DimensionInput[] = report.itemScores
    .filter(item => item.score > 0)
    .map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      score: item.score,
      grade: item.grade,
    }));
  // Extract BMI from bmiStatus string (e.g., "19.5，属于正常范围")
  const bmiMatch = report.fitnessProfile.bmiStatus.match(/([\d.]+)/);
  const bmi = bmiMatch ? parseFloat(bmiMatch[1]) : null;
  return computeDimensionsFromItems(inputs, bmi, "male") as Array<{
    key: string; label: string; score: number | null; grade: GradeTier | null;
    relatedItems: string[]; analysis: string; suggestion: string;
  }>;
}

function FallbackItemScores({ report }: { report: AIStudentReport }) {
  // Simple fallback: show items from weaknessAnalysis
  const items = report.weaknessAnalysis.map(w => ({
    itemName: normalizeReportText(w.item),
    valueText: normalizeReportText(w.currentLevel),
  }));
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">暂无逐项成绩数据。</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.itemName} className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2">
          <span className="text-sm font-medium">{item.itemName}</span>
          <span className="text-xs tabular-nums text-muted-foreground ml-auto">{item.valueText}</span>
        </div>
      ))}
    </div>
  );
}

// ===== Batch History Section =====

function BatchHistorySection({
  allBatchReports,
  currentReportId,
  onView,
  onDelete,
  formalBatches,
}: {
  allBatchReports: StudentReportHistoryItem[];
  currentReportId: string;
  onView?: (_report: StudentReportHistoryItem) => void;
  onDelete?: (_reportId: string) => void;
  batchReportMap?: Map<string, StudentReportHistoryItem | null>;
  formalBatches: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const olderReports = allBatchReports.filter((r) => r.id !== currentReportId);
  if (olderReports.length === 0) return null;

  const batchNameForReport = (report: StudentReportHistoryItem): string => {
    if (report.sourceBatchId) {
      const batch = formalBatches.find((b) => b.id === report.sourceBatchId);
      if (batch) return batch.name;
    }
    return report.sourceSummary ?? "未知批次";
  };

  const reviewBadge = (status: string) => {
    if (status === "approved") return { label: "已审核", variant: "excellent" as const };
    if (status === "rejected") return { label: "已退回", variant: "improve" as const };
    return { label: "待审核", variant: "pass" as const };
  };

  const handleDelete = async (reportId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDeleteId(null);
        onDelete?.(reportId);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between p-3 text-left"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">历史正式体测报告</span>
            <Badge variant="secondary" className="text-[10px]">{olderReports.length} 份</Badge>
          </div>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {open && (
          <div className="space-y-2 border-t px-3 pb-3 pt-2">
            {olderReports.map((item) => {
              const rv = reviewBadge(item.status);
              return (
                <div key={item.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onView?.(item)}
                    className="flex-1 rounded-lg bg-muted/20 p-2.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{batchNameForReport(item)}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {new Date(item.generatedAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <Badge variant={rv.variant} className="shrink-0 text-[9px]">{rv.label}</Badge>
                    </div>
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="删除报告"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDeleteId(null)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">确定删除这份 AI 报告吗？</p>
            <p className="mt-2 text-sm text-muted-foreground">
              此操作不会删除原始体测或训练记录，但删除后无法从历史报告中查看。
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="h-11 flex-1" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>取消</Button>
              <Button variant="destructive" className="h-11 flex-1" onClick={() => handleDelete(confirmDeleteId)} disabled={deleting}>
                {deleting ? "删除中..." : "确认删除"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
