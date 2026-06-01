"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FITNESS_ITEMS, ITEM_FEEDBACK_CONFIG, type FeedbackQuestion } from "@/lib/constants";
import type { FitnessItemId } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

export interface ItemFeedbackAnswer {
  itemId: FitnessItemId;
  answers: Record<string, string | number | boolean>;
}

interface RecordFeelingStepProps {
  selectedItems: FitnessItemId[];
  itemFeedbacks: ItemFeedbackAnswer[];
  overallDiscomfort: { hasDiscomfort: boolean; discomfortNotes: string };
  onChangeItem: (_itemId: FitnessItemId, _answers: Record<string, string | number | boolean>) => void;
  onChangeDiscomfort: (_data: { hasDiscomfort: boolean; discomfortNotes: string }) => void;
}

// RPE 描述映射
const RPE_LABELS: Record<number, string> = {
  1: "很轻松", 2: "轻松", 3: "中等偏轻", 4: "中等偏轻", 5: "中等",
  6: "中等偏强", 7: "较吃力", 8: "吃力", 9: "很吃力", 10: "竭尽全力",
};

function groupQuestions(questions: FeedbackQuestion[]): Map<string, FeedbackQuestion[]> {
  const groups = new Map<string, FeedbackQuestion[]>();
  for (const q of questions) {
    const g = q.group ?? "其他";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(q);
  }
  return groups;
}

export function RecordFeelingStep({
  selectedItems, itemFeedbacks, overallDiscomfort, onChangeItem, onChangeDiscomfort,
}: RecordFeelingStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">请根据每项运动的实际感受如实反馈</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          反馈越详细，AI 分析越有针对性。若出现明显不适，建议停止训练并告知体育教师。
        </p>
      </div>

      {selectedItems.map((itemId, idx) => {
        const item = FITNESS_ITEMS.find(i => i.id === itemId);
        if (!item) return null;
        const questions = ITEM_FEEDBACK_CONFIG[itemId] ?? [];
        if (questions.length === 0) return null;

        const feedback = itemFeedbacks.find(f => f.itemId === itemId);
        const answers = feedback?.answers ?? {};
        const groups = groupQuestions(questions);

        // Check for high-risk feedback
        const hasHighDiscomfort = answers.hasDiscomfort === true;
        const hasHighRPE = typeof answers.rpe === "number" && answers.rpe >= 8;
        const hasModerateSoreness = answers.hasSoreness === "moderate";

        return (
          <div key={itemId} className="rounded-xl border p-4 space-y-4">
            {/* Item header */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <p className="text-sm font-semibold">{idx + 1}. {item.name}</p>
              {item.category !== "body" && item.category !== "flexibility" && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {questions.length} 项反馈
                </span>
              )}
            </div>

            {/* High-risk warning */}
            {(hasHighDiscomfort || hasHighRPE || hasModerateSoreness) && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-700 border border-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {hasHighDiscomfort && "你反馈了身体不适，建议停止当前训练并告知体育教师。"}
                  {!hasHighDiscomfort && hasHighRPE && "训练强度较高，请注意充分恢复。"}
                  {!hasHighDiscomfort && !hasHighRPE && hasModerateSoreness && "明显酸痛需关注，建议适当降低下次强度。"}
                </span>
              </div>
            )}

            {/* Question groups */}
            {Array.from(groups.entries()).map(([groupName, qs]) => (
              <div key={groupName} className="space-y-3">
                <p className="text-[11px] font-medium text-muted-foreground border-b pb-1">
                  {groupName}
                </p>
                {qs.map(q => {
                  const value = answers[q.key];
                  return (
                    <div key={q.key} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{q.label}</Label>
                      {q.type === "slider" && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={q.min ?? 1}
                              max={q.max ?? 10}
                              value={(value as number) ?? Math.round(((q.max ?? 10) - (q.min ?? 1)) / 2 + (q.min ?? 1))}
                              onChange={e => onChangeItem(itemId, { ...answers, [q.key]: Number(e.target.value) })}
                              className="flex-1 h-2 accent-primary"
                            />
                            <span className="text-xs font-bold tabular-nums w-6 text-center">
                              {value ?? "-"}
                            </span>
                          </div>
                          {q.key === "rpe" && typeof value === "number" && (
                            <p className="text-[10px] text-muted-foreground">
                              {RPE_LABELS[value] ?? ""}
                            </p>
                          )}
                        </div>
                      )}
                      {q.type === "choice" && q.options && (
                        <div className={cn(
                          "grid gap-1.5",
                          q.options.length <= 3 ? "grid-cols-3" : q.options.length <= 4 ? "grid-cols-2" : "grid-cols-2"
                        )}>
                          {q.options.map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => onChangeItem(itemId, { ...answers, [q.key]: opt.value })}
                              className={cn(
                                "min-h-10 rounded-lg border px-2 py-1.5 text-center text-xs transition-all",
                                value === opt.value
                                  ? "border-primary bg-primary/5 font-semibold text-primary"
                                  : "border-border hover:border-primary/30 hover:bg-accent"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === "boolean" && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={value === true ? "default" : "outline"}
                            size="sm"
                            className="h-9 min-w-14"
                            onClick={() => onChangeItem(itemId, { ...answers, [q.key]: true })}
                          >
                            是
                          </Button>
                          <Button
                            type="button"
                            variant={value === false ? "default" : "outline"}
                            size="sm"
                            className="h-9 min-w-14"
                            onClick={() => onChangeItem(itemId, { ...answers, [q.key]: false })}
                          >
                            否
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

      {/* 整体备注 */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold">整体备注</p>
        <p className="text-[11px] text-muted-foreground">
          如有其他需要说明的身体情况或训练感受，可以在此补充。
        </p>
        <Input
          placeholder="可选：补充说明（如睡眠、饮食、天气等）"
          value={overallDiscomfort.discomfortNotes}
          onChange={e => onChangeDiscomfort({ ...overallDiscomfort, discomfortNotes: e.target.value })}
          className="h-11"
        />
      </div>
    </div>
  );
}
