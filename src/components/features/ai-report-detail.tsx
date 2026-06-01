"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  History,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FITNESS_ITEMS } from "@/lib/constants";
import { computeDimensionsFromItems, type DimensionInput } from "@/lib/scoring";
import type { AIStudentReport, FitnessItemId, GradeTier } from "@/lib/types";
import { ItemEducationCard } from "./item-education-card";
import { StandardEducationOverview } from "./standard-education-overview";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";

type ReportMode = "ai" | "mock" | "fallback";
type TrainingAction = NonNullable<AIStudentReport["trainingActionLibrary"]>[number];

interface ReportDetailProps {
  report: AIStudentReport;
  mode?: ReportMode;
  viewingItemId: FitnessItemId | null;
  formalBatches: Array<{ id: string; name: string }>;
  selectedBatchId: string | null;
  batchReportMap?: Map<string, StudentReportHistoryItem | null>;
  allBatchReports?: StudentReportHistoryItem[];
  /** 学生性别，用于过滤适用项目 */
  gender?: "male" | "female";
  /** 已记录的项目 ID 列表 */
  recordedItemIds?: FitnessItemId[];
  /** 缺失的项目 ID 列表 */
  missingItemIds?: FitnessItemId[];
  onBack: () => void;
  onGenerateForBatch?: (_batchId: string) => void;
  onView?: (_report: StudentReportHistoryItem) => void;
  onDeleteReport?: (_reportId: string) => void;
  onRegenerate?: () => void;
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

function normalizeListItemText(value: string): string {
  return normalizeReportText(value).replace(/^\s*(?:\d+[\.\)、]|[（(]\d+[）)])\s*/, "");
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

function formatDateTime(value: string): string {
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

function reviewBadge(status: string) {
  if (status === "approved") return { label: "已审核", variant: "excellent" as const };
  if (status === "rejected") return { label: "已退回", variant: "improve" as const };
  return { label: "待审核", variant: "pass" as const };
}

// ---- 动作教学卡（折叠式） ----

const STAGE_BADGE_VARIANT: Record<string, "excellent" | "good" | "pass" | "secondary"> = {
  "适应期": "secondary",
  "巩固期": "pass",
  "强化期": "good",
  "维持期": "excellent",
};

function ActionCard({ action }: { action: TrainingAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-3.5">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{normalizeReportText(action.name)}</p>
            <p className="mt-0.5 text-[11px] text-primary">{normalizeReportText(action.purpose)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {action.suitableStage.map((s) => (
              <Badge key={s} variant={STAGE_BADGE_VARIANT[s] ?? "secondary"} className="text-[9px]">{s}</Badge>
            ))}
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg bg-muted/30 p-1.5">
            <p className="text-[10px] text-muted-foreground">训练量</p>
            <p className="font-medium">{normalizeReportText(action.volume)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-1.5">
            <p className="text-[10px] text-muted-foreground">时长</p>
            <p className="font-medium">{normalizeReportText(action.duration)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-1.5">
            <p className="text-[10px] text-muted-foreground">强度</p>
            <p className="font-medium">{normalizeReportText(action.intensity)}</p>
          </div>
        </div>
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t pt-3">
          <ExerciseList title="动作步骤" items={action.steps} />
          <ExerciseList title="训练要点" items={action.keyPoints} />
          <ExerciseList title="常见错误与纠正" items={action.commonMistakes} />
          <div className="space-y-2 rounded-lg bg-primary/5 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">进阶方式：</span>{normalizeReportText(action.progression)}
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">降阶方式：</span>{normalizeReportText(action.regression)}
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">自测标准：</span>{normalizeReportText(action.selfCheck)}
            </p>
          </div>
          {action.safetyNote && (
            <p className="text-[11px] text-muted-foreground">{normalizeReportText(action.safetyNote)}</p>
          )}
        </div>
      )}
    </div>
  );
}

function StageCard({ stage, isFirst }: { stage: NonNullable<AIStudentReport["itemStagePlan"]>[number]; isFirst: boolean }) {
  const [open, setOpen] = useState(isFirst);
  return (
    <div className="rounded-xl border p-3.5">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={STAGE_BADGE_VARIANT[stage.stage] ?? "secondary"} className="text-[10px]">{stage.stage}</Badge>
            <span className="text-[11px] text-muted-foreground">{stage.duration}</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="mt-2 text-xs font-semibold">{stage.goal}</p>
        {stage.studentFitReason && (
          <p className="mt-1 text-[11px] text-primary">{normalizeReportText(stage.studentFitReason)}</p>
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t pt-3">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-[10px] text-muted-foreground">每周频率</p>
              <p className="font-medium">{stage.weeklyFrequency}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-[10px] text-muted-foreground">每次时长</p>
              <p className="font-medium">{stage.sessionLength}</p>
            </div>
          </div>
          {stage.recommendedActions.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold mb-1">推荐动作</p>
              <div className="flex flex-wrap gap-1.5">
                {stage.recommendedActions.map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-[10px] font-semibold text-foreground">⏱ 时间不足版本</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{normalizeReportText(stage.minimumVersion)}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-[10px] font-semibold text-foreground">💪 正常训练版本</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{normalizeReportText(stage.normalVersion)}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-[10px] font-semibold text-foreground">🔄 疲劳偏高版本</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{normalizeReportText(stage.recoveryVersion)}</p>
            </div>
          </div>
          {stage.progressCriteria.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold mb-1">进入下一阶段的条件</p>
              <div className="space-y-1">
                {stage.progressCriteria.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-[10px] text-muted-foreground">{i + 1}.</span>
                    <span className="text-[11px] text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildActionLibraryFromTrainingPlan(trainingPlan: AIStudentReport["trainingPlan"]): TrainingAction[] {
  const actionMap = new Map<string, TrainingAction>();
  for (const week of trainingPlan) {
    for (const exercise of week.exercises) {
      if (actionMap.has(exercise.name)) continue;
      actionMap.set(exercise.name, {
        name: exercise.name,
        purpose: exercise.purpose ?? exercise.description,
        suitableStage: ["动作库"],
        steps: exercise.actionSteps ?? fallbackActionSteps(exercise),
        volume: exercise.sets,
        duration: exercise.duration,
        intensity: exercise.intensity ?? "中等强度，动作质量优先",
        keyPoints: exercise.keyPoints ?? fallbackKeyPoints(),
        commonMistakes: exercise.commonMistakes ?? fallbackCommonMistakes(),
        progression: exercise.progression ?? "先保证动作稳定，再小幅增加次数、距离或持续时间。",
        regression: "如果疲劳较高或动作变形，先减少组数、缩短距离，保留动作质量。",
        selfCheck: exercise.selfCheck ?? "完成后动作不明显变形，主观用力可控，第二天无明显不适。",
        safetyNote: exercise.notes,
      });
    }
  }
  return Array.from(actionMap.values());
}

// ===== Main Component =====

export function AIReportDetail({
  report,
  mode,
  viewingItemId,
  formalBatches,
  selectedBatchId,
  batchReportMap,
  onBack: _onBack,
  onGenerateForBatch,
  allBatchReports,
  onView: onViewHistory,
  onDeleteReport,
  onRegenerate,
  gender,
  recordedItemIds,
  missingItemIds,
}: ReportDetailProps) {
  const status = report.status || "pending_review";
  const StatusIcon = status === "approved" ? CheckCircle2 : status === "rejected" ? AlertTriangle : Clock;
  const review = reviewBadge(status);
  const profile = report.fitnessProfile;
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const actionLibrary = report.trainingActionLibrary?.length
    ? report.trainingActionLibrary
    : buildActionLibraryFromTrainingPlan(report.trainingPlan);

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
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="good" className="text-[10px]">正式体测分析</Badge>
            {mode && (
              <Badge variant={mode === "ai" ? "excellent" : "secondary"} className="text-[10px]">
                {mode === "ai" ? "AI 生成" : "示例数据"}
              </Badge>
            )}
            <Badge variant={review.variant} className="text-[10px]">{review.label}</Badge>
          </div>
          <div className="rounded-xl border bg-muted/20 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">本次生成时间</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatDateTime(report.generatedAt)}</p>
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

            {/* 2. Data Source & Completeness */}
            {report.dataSourceSummary && (
              <Card className="rounded-xl border border-primary/10 bg-primary/5 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">报告来源</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">{report.headlineInsight || profile.summary.slice(0, 80) + "…"}</p>
                  <p className="text-xs text-muted-foreground">{report.dataSourceSummary}</p>
                  {report.completeness && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={report.completeness.completionRate >= 100 ? "excellent" : "pass"} className="text-[9px]">
                        完整度 {report.completeness.completionRate}%
                      </Badge>
                      <span className="text-muted-foreground">
                        {report.completeness.recordedCount}/{report.completeness.expectedCount} 项已录入
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 国家体质健康标准导读 */}
            <StandardEducationOverview
              gender={gender}
              recordedItemIds={recordedItemIds}
              missingItemIds={missingItemIds}
            />

            {/* 3. Overview Card */}
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

            {/* 7.5 Comparison with Previous Batch */}
            {report.comparisonWithPreviousBatch && report.comparisonWithPreviousBatch.changes.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <History className="h-4 w-4 text-primary" />
                    与上次体测对比
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    对比批次：{report.comparisonWithPreviousBatch.previousBatchName}（{report.comparisonWithPreviousBatch.previousDate}）
                  </p>
                  <div className="space-y-2">
                    {report.comparisonWithPreviousBatch.changes.map((change, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
                        <span className="text-xs font-medium">{change.item}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{change.previous}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className={change.trend === "up" ? "text-level-excellent font-semibold" : change.trend === "down" ? "text-level-improve font-semibold" : "text-muted-foreground"}>
                            {change.current}
                          </span>
                          <Badge variant={change.trend === "up" ? "excellent" : change.trend === "down" ? "improve" : "secondary"} className="text-[9px]">
                            {change.trend === "up" ? "↑提升" : change.trend === "down" ? "↓下降" : "→持平"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{report.comparisonWithPreviousBatch.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* 8. Stage Training Plan */}
            {(report.stageTrainingPlan && report.stageTrainingPlan.length > 0) || report.trainingPlan.length > 0 ? (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">阶段训练规划指导</CardTitle>
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

            {/* 9.5 Teacher Review Notes */}
            {report.teacherReviewNotes && report.teacherReviewNotes.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    教师审核须知
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.teacherReviewNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-muted-foreground">{i + 1}.</span>
                      <p className="text-xs text-muted-foreground">{normalizeListItemText(note)}</p>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground pt-1">
                    AI 生成的审核建议，供体育教师参考。
                  </p>
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
                      <p className="text-xs text-muted-foreground">{normalizeListItemText(reminder)}</p>
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

            {/* Regenerate button — update old reports to new format */}
            <div className="rounded-xl border border-dashed p-4 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                如果当前报告是旧版格式，可以重新生成以获取最新的全维度分析内容。
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1.5"
                onClick={() => setConfirmRegenerate(true)}
                disabled={regenerating}
              >
                {regenerating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />重新生成中...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" />重新生成报告</>
                )}
              </Button>
              <p className="text-[10px] text-muted-foreground">
                将使用相同的体测数据生成新报告，生成过程会停留在当前页面。
              </p>
            </div>

            {/* Regenerate confirmation dialog */}
            {confirmRegenerate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmRegenerate(false)}>
                <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <p className="text-base font-semibold">确定重新生成报告吗？</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    将使用相同的正式体测数据调用最新的 AI 分析引擎生成新报告，当前页面会直接进入生成进度。
                  </p>
                  <div className="mt-5 flex gap-3">
                    <Button variant="outline" className="h-11 flex-1" onClick={() => setConfirmRegenerate(false)} disabled={regenerating}>取消</Button>
                    <Button className="h-11 flex-1 gap-1.5" onClick={() => { setConfirmRegenerate(false); setRegenerating(true); onRegenerate?.(); }}
                      disabled={regenerating}>
                      <Sparkles className="h-4 w-4" />确认重新生成
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
        <div className="rounded-xl border bg-muted/20 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">本次生成时间</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatDateTime(report.generatedAt)}</p>
        </div>
      </div>

      {/* Data Source Summary Card (item_report) */}
      {report.dataSourceSummary && (
        <Card className="rounded-xl border border-primary/10 bg-primary/5 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">报告来源</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">{report.headlineInsight || profile.summary}</p>
            <p className="text-xs text-muted-foreground">{report.dataSourceSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* 项目科普与评分解读 */}
      {viewingItemId && (
        <ItemEducationCard
          itemId={viewingItemId}
          valueText={report.formalBaseline?.valueText}
          grade={report.formalBaseline?.grade as GradeTier | undefined}
          score={report.formalBaseline?.score}
          formalBaseline={report.formalBaseline ? {
            valueText: report.formalBaseline.valueText,
            score: report.formalBaseline.score,
            grade: report.formalBaseline.grade,
            date: report.formalBaseline.date,
            analysis: normalizeReportText(report.formalBaseline.analysis),
          } : null}
        />
      )}

      {/* Summary */}
      <Card className="rounded-xl border border-primary/10 bg-primary/5 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">{review.label}</span>
          </div>
          <p className="text-sm leading-relaxed">{normalizeReportText(profile.summary)}</p>
          <p className="text-xs text-muted-foreground">
            来源：{viewingItemId ? `正式体测 · ${itemName(viewingItemId)} + 同项目日常训练` : reportTypeLabel(report.reportType)}
            。日常训练用于辅助观察，不参与正式评分。
          </p>
        </CardContent>
      </Card>

      {/* Daily Training Trend Card (item_report) */}
      {report.dailyTrainingTrend && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              日常训练趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground">训练次数</p>
                <p className="mt-1 font-semibold tabular-nums">{report.dailyTrainingTrend.recordCount} 次</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground">趋势</p>
                <p className="mt-1 font-semibold">{report.dailyTrainingTrend.trend}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground">稳定性</p>
                <p className="mt-1 font-semibold">{report.dailyTrainingTrend.stability}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground">最近训练</p>
                <p className="mt-1 font-semibold">{report.dailyTrainingTrend.latestDate || "暂无"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{report.dailyTrainingTrend.note}</p>
            {report.dailyTrainingTrend.fatigueSummary && (
              <p className="text-[11px] text-muted-foreground">疲劳：{report.dailyTrainingTrend.fatigueSummary}</p>
            )}
            {report.dailyTrainingTrend.sorenessSummary && (
              <p className="text-[11px] text-muted-foreground">酸痛：{report.dailyTrainingTrend.sorenessSummary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback Insights Card (item_report) */}
      {report.feedbackInsights && report.feedbackInsights.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              问答反馈洞察
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.feedbackInsights.map((fi, i) => (
              <div key={i} className="rounded-lg bg-muted/20 p-3">
                <p className="text-xs font-semibold">{normalizeReportText(fi.factor)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{fi.observation}</p>
                <p className="mt-0.5 text-[11px] text-primary">{fi.implication}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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

      {/* Deep Item Analysis — 能力拆解 + 影响因素 + 项目关系 */}
      {report.itemDeepAnalysis && (
        <>
          {/* Ability Breakdown */}
          {report.itemDeepAnalysis.abilityBreakdown.length > 0 && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  能力拆解
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  {viewingItemId ? `${itemName(viewingItemId)}` : "该项目"}依赖以下能力维度，每项能力的提升都可能直接改善整体表现。
                </p>
                {report.itemDeepAnalysis.abilityBreakdown.map((ab, i) => (
                  <div key={ab.ability} className="rounded-xl border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold">{ab.ability}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{ab.description}</p>
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-muted/20 p-2">
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">当前：</span>
                      <span className="text-[10px] text-muted-foreground">{ab.currentLevel}</span>
                    </div>
                    <div className="mt-1 flex items-start gap-2 rounded-lg bg-primary/5 p-2">
                      <span className="shrink-0 text-[10px] font-medium text-primary">提升：</span>
                      <span className="text-[10px] text-primary">{ab.improvement}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Influencing Factors */}
          {report.itemDeepAnalysis.influencingFactors.length > 0 && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-primary" />
                  影响因素分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.itemDeepAnalysis.influencingFactors.map((f) => (
                  <div key={f.factor} className="rounded-lg bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{f.factor}</span>
                      <Badge variant="outline" className="text-[9px]">{f.status.slice(0, 4)}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{f.status}</p>
                    <p className="mt-1 text-[11px] text-primary">{f.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Related Items */}
          {report.itemDeepAnalysis.relatedItems.length > 0 && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  与其他项目关系
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.itemDeepAnalysis.relatedItems.map((ri) => (
                  <div key={ri.itemName} className="rounded-lg bg-muted/20 p-3">
                    <p className="text-xs font-semibold">{ri.itemName}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{ri.relationship}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Training Action Library (v0.9.5+ 新格式) */}
      {actionLibrary.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              专项动作训练指导
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">以下动作是该项目的标准化训练参考，可按阶段灵活组合</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionLibrary.map((action) => (
              <ActionCard key={action.name} action={action} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 阶段训练规划指导（item_report v0.9.5+ 新格式） */}
      {report.itemStagePlan && report.itemStagePlan.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              阶段训练规划指导
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">根据你的训练积累和当前水平，按阶段组合上方动作</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.itemStagePlan.map((stage, i) => (
              <StageCard key={stage.stage} stage={stage} isFirst={i === 0} />
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

      {/* 旧格式 trainingPlan → 归入阶段训练规划指导（历史格式） */}
      {!report.itemStagePlan && report.trainingPlan.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              阶段训练规划指导
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">以下为历史报告格式的训练规划，按周展示</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.trainingPlan.map((week) => (
              <div key={week.weekNumber}>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  第 {week.weekNumber} 周 · {week.focus}
                </p>
                <div className="grid gap-3">
                  {week.exercises.map((exercise) => (
                    <div key={exercise.name} className="rounded-xl border p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{normalizeReportText(exercise.name)}</p>
                          {exercise.purpose && (
                            <p className="mt-1 text-[11px] text-primary">{normalizeReportText(exercise.purpose)}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {normalizeReportText(exercise.frequency)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {normalizeReportText(exercise.description)}
                      </p>
                      <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
                        <div className="rounded-lg bg-muted/30 p-2">
                          <p className="text-[10px] text-muted-foreground">训练量</p>
                          <p className="mt-1 font-medium">{normalizeReportText(exercise.sets)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-2">
                          <p className="text-[10px] text-muted-foreground">单次时长</p>
                          <p className="mt-1 font-medium">{normalizeReportText(exercise.duration)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-2">
                          <p className="text-[10px] text-muted-foreground">强度</p>
                          <p className="mt-1 font-medium">{normalizeReportText(exercise.intensity ?? "中等强度，动作不变形")}</p>
                        </div>
                      </div>
                      <ExerciseList title="动作步骤" items={exercise.actionSteps ?? fallbackActionSteps(exercise)} />
                      <ExerciseList title="训练要点" items={exercise.keyPoints ?? fallbackKeyPoints()} />
                      <ExerciseList title="常见错误与纠正" items={exercise.commonMistakes ?? fallbackCommonMistakes()} />
                      {(exercise.progression || exercise.selfCheck) && (
                        <div className="mt-3 space-y-2 rounded-lg bg-primary/5 p-3">
                          {exercise.progression && (
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              <span className="font-semibold text-foreground">进阶方式：</span>{normalizeReportText(exercise.progression)}
                            </p>
                          )}
                          {exercise.selfCheck && (
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              <span className="font-semibold text-foreground">自测标准：</span>{normalizeReportText(exercise.selfCheck)}
                            </p>
                          )}
                        </div>
                      )}
                      {exercise.notes && (
                        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{normalizeReportText(exercise.notes)}</p>
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

      {/* Progressive Goals — 进阶目标（旧格式 fallback，itemStagePlan 存在时隐藏）*/}
      {!report.itemStagePlan && report.itemDeepAnalysis?.progressiveGoals && report.itemDeepAnalysis.progressiveGoals.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              进阶目标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.itemDeepAnalysis.progressiveGoals.map((goal) => (
              <div key={goal.stage} className="rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    goal.stage.includes("短期") ? "excellent"
                    : goal.stage.includes("中期") ? "pass"
                    : "secondary"
                  } className="text-[10px]">{goal.stage}</Badge>
                  <span className="text-[10px] text-muted-foreground">{goal.timeline}</span>
                </div>
                <p className="mt-2 text-xs font-semibold">{goal.target}</p>
                {goal.actions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {goal.actions.map((action, j) => (
                      <div key={j} className="flex items-start gap-1.5">
                        <span className="mt-0.5 text-[10px] text-muted-foreground">{j + 1}.</span>
                        <span className="text-[11px] text-muted-foreground">{action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Teacher Review Notes (item_report) */}
      {report.teacherReviewNotes && report.teacherReviewNotes.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary" />
              教师审核须知
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.teacherReviewNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs text-muted-foreground">{i + 1}.</span>
                <p className="text-xs text-muted-foreground">{normalizeListItemText(note)}</p>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-1">
              AI 生成的审核建议，供体育教师参考。
            </p>
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
                <p className="text-xs text-muted-foreground">{normalizeListItemText(reminder)}</p>
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

      {/* Regenerate button for item_report */}
      <div className="rounded-xl border border-dashed p-4 text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          如果当前报告是旧版格式，可以重新生成以获取最新的深度分析内容。
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-1.5"
          onClick={() => setConfirmRegenerate(true)}
          disabled={regenerating}
        >
          {regenerating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />重新生成中...</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" />重新生成报告</>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground">
          将使用相同的体测与训练数据生成新报告，生成过程会停留在当前页面。
        </p>
      </div>

      {/* Regenerate confirmation dialog */}
      {confirmRegenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmRegenerate(false)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">确定重新生成报告吗？</p>
            <p className="mt-2 text-sm text-muted-foreground">
              将使用相同的体测和训练数据调用最新的 AI 分析引擎生成新报告，当前页面会直接进入生成进度。
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="h-11 flex-1" onClick={() => setConfirmRegenerate(false)} disabled={regenerating}>取消</Button>
              <Button className="h-11 flex-1 gap-1.5" onClick={() => { setConfirmRegenerate(false); setRegenerating(true); onRegenerate?.(); }}
                disabled={regenerating}>
                <Sparkles className="h-4 w-4" />确认重新生成
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Sub-components =====

function ExerciseList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold">{title}</p>
      <div className="mt-1.5 space-y-1">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] text-muted-foreground">
              {index + 1}
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{normalizeReportText(item)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function fallbackActionSteps(exercise: { description: string; sets: string; frequency: string; duration: string; notes: string }): string[] {
  return [
    `先用 5-8 分钟完成热身，再进入 ${normalizeReportText(exercise.description)}。`,
    `按 ${normalizeReportText(exercise.sets)} 完成训练，组间保持充分休息，动作质量优先于速度和数量。`,
    `训练频率控制为 ${normalizeReportText(exercise.frequency)}，单次约 ${normalizeReportText(exercise.duration)}。`,
    exercise.notes ? normalizeReportText(exercise.notes) : "训练过程中保持呼吸自然，出现明显不适时立即停止并告知体育教师。",
  ];
}

function fallbackKeyPoints(): string[] {
  return [
    "每次先做动态热身，训练中保持动作路线稳定，不为了追求次数牺牲姿势。",
    "强度以能完成全程且动作不变形为准，主观用力程度建议控制在 5-7/10。",
    "训练后记录成绩、疲劳感和恢复情况，下一次训练根据体感小幅调整。",
  ];
}

function fallbackCommonMistakes(): string[] {
  return [
    "一开始强度过大：改为先降低次数或距离，等动作稳定后再增加训练量。",
    "只看成绩不看动作：请让同学或教师观察动作质量，优先纠正姿势和节奏。",
    "恢复不足仍连续加练：出现明显酸痛或疲劳时，改做轻松活动和拉伸。",
  ];
}

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
