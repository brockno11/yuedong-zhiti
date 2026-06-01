// ===== 跃动智体 — 本阶段训练重点（轻量概览） =====
// 首页只负责"告诉学生现在该关注什么"，细节放在专项分析详情里
"use client";

import { cn } from "@/lib/utils";
import { Zap, Clock, Target, ArrowRight, Heart } from "lucide-react";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import type { FitnessItemId } from "@/lib/types";
import { FITNESS_ITEMS } from "@/lib/constants";

interface TrainingFocusHintProps {
  /** 最新的 batch_report */
  batchReport: StudentReportHistoryItem | null;
  /** 有新数据的项目 ID 列表 */
  attentionItemIds: FitnessItemId[];
  /** 点击专项分析的回调 */
  onViewItem?: (_itemId: FitnessItemId) => void;
  className?: string;
}

function itemName(id: FitnessItemId): string {
  return FITNESS_ITEMS.find((i) => i.id === id)?.name ?? id;
}

export function TrainingFocusHint({
  batchReport,
  attentionItemIds,
  onViewItem,
  className,
}: TrainingFocusHintProps) {
  // 从 batch report 中提取训练重点
  const report = batchReport?.report;
  const stagePlan = report?.itemStagePlan;
  const stageTraining = report?.stageTrainingPlan;
  const weakness = report?.weaknessAnalysis ?? [];

  // 确定当前阶段
  const currentStage = stagePlan?.[0] ?? stageTraining?.[0] ?? null;

  // 推荐动作（最多显示2个）
  const recommendedActions = (currentStage && "recommendedActions" in currentStage)
    ? (currentStage.recommendedActions as string[]).slice(0, 2)
    : [];

  // 需要关注的项目
  const attentionItems = attentionItemIds.slice(0, 3);

  // 如果没有任何数据，不显示
  if (!report && attentionItems.length === 0) return null;

  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3", className)}>
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">本阶段训练重点</span>
      </div>

      {/* 当前阶段 */}
      {currentStage && (
        <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
          <p className="text-xs font-medium text-primary">{currentStage.stage}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{currentStage.goal}</p>
        </div>
      )}

      {/* 推荐频率 + 重点动作 */}
      {currentStage && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{currentStage.duration ?? "每周 2-3 次"}</span>
            </div>
          </div>
          {recommendedActions.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              重点动作：{recommendedActions.join("、")}
            </p>
          )}
        </div>
      )}

      {/* 需要关注的项目 */}
      {attentionItems.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <Target className="h-3 w-3 text-primary" />
            <span>优先关注</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attentionItems.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onViewItem?.(id)}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {itemName(id)}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 弱项提示 */}
      {weakness.length > 0 && (
        <div className="space-y-1">
          {weakness.slice(0, 2).map((w, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">
              · {w.item}：{w.improvementPotential}
            </p>
          ))}
        </div>
      )}

      {/* 人性化提示 */}
      <div className="flex items-start gap-1.5 rounded-lg bg-muted/30 px-3 py-2">
        <Heart className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          如果学习任务较重，本周优先完成 1-2 个核心动作即可，坚持比强度更重要。
        </p>
      </div>
    </div>
  );
}
