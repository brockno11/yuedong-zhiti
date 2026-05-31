"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FITNESS_ITEMS, ITEM_FEEDBACK_CONFIG } from "@/lib/constants";
import type { FitnessItemId } from "@/lib/types";

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

export function RecordFeelingStep({
  selectedItems, itemFeedbacks, overallDiscomfort, onChangeItem, onChangeDiscomfort,
}: RecordFeelingStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">每个项目的问题不同，请逐一反馈</p>

      {selectedItems.map((itemId, idx) => {
        const item = FITNESS_ITEMS.find(i => i.id === itemId);
        if (!item) return null;
        const questions = ITEM_FEEDBACK_CONFIG[itemId] ?? [];
        if (questions.length === 0) return null;

        const feedback = itemFeedbacks.find(f => f.itemId === itemId);
        const answers = feedback?.answers ?? {};

        return (
          <div key={itemId} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <p className="text-sm font-semibold">{idx + 1}. {item.name}</p>
            </div>

            {questions.map(q => {
              const value = answers[q.key];
              return (
                <div key={q.key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{q.label}</Label>
                  {q.type === "slider" && (
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
                  )}
                  {q.type === "choice" && q.options && (
                    <div className={cn("grid gap-1.5", q.options.length <= 3 ? "grid-cols-3" : "grid-cols-2")}>
                      {q.options.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onChangeItem(itemId, { ...answers, [q.key]: opt.value })}
                          className={cn(
                            "min-h-10 rounded-lg border px-2 py-1.5 text-center text-xs transition-all",
                            value === opt.value ? "border-primary bg-primary/5 font-semibold" : "border-border hover:border-primary/30 hover:bg-accent"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "boolean" && (
                    <div className="flex gap-2">
                      <Button type="button" variant={value === true ? "default" : "outline"} size="sm"
                        onClick={() => onChangeItem(itemId, { ...answers, [q.key]: true })}>是</Button>
                      <Button type="button" variant={value === false ? "default" : "outline"} size="sm"
                        onClick={() => onChangeItem(itemId, { ...answers, [q.key]: false })}>否</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 整体不适 */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold">整体身体状况</p>
        <div className="flex gap-2">
          <Button type="button" variant={overallDiscomfort.hasDiscomfort ? "default" : "outline"} size="sm"
            onClick={() => onChangeDiscomfort({ ...overallDiscomfort, hasDiscomfort: true })}>有不适</Button>
          <Button type="button" variant={!overallDiscomfort.hasDiscomfort ? "default" : "outline"} size="sm"
            onClick={() => onChangeDiscomfort({ hasDiscomfort: false, discomfortNotes: "" })}>无不适</Button>
        </div>
        {overallDiscomfort.hasDiscomfort && (
          <Input placeholder="请描述不适情况" value={overallDiscomfort.discomfortNotes}
            onChange={e => onChangeDiscomfort({ ...overallDiscomfort, discomfortNotes: e.target.value })} className="h-11" />
        )}
      </div>
    </div>
  );
}
