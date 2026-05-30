"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeelingSlider } from "@/components/forms/feeling-slider";
import { FITNESS_ITEMS, RECOVERY_OPTIONS } from "@/lib/constants";
import type { FitnessItemId, BodyFeeling } from "@/lib/types";

interface RecordFeelingStepProps {
  selectedItems: FitnessItemId[];
  feelings: Partial<Record<FitnessItemId, BodyFeeling>>;
  overallDiscomfort: { hasDiscomfort: boolean; discomfortNotes: string };
  onChangeItem: (_itemId: FitnessItemId, _feeling: BodyFeeling) => void;
  onChangeDiscomfort: (_data: { hasDiscomfort: boolean; discomfortNotes: string }) => void;
}

const defaultFeeling = (): BodyFeeling => ({
  fatigueLevel: 5,
  recoveryStatus: "normal",
  hasSoreness: false,
  sorenessAreas: [],
  hasDiscomfort: false,
  discomfortNotes: "",
});

export function RecordFeelingStep({
  selectedItems,
  feelings,
  overallDiscomfort,
  onChangeItem,
  onChangeDiscomfort,
}: RecordFeelingStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        每个项目的运动感受可能不同，请逐一反馈
      </p>

      {/* 逐项体感 */}
      {selectedItems.map((itemId, idx) => {
        const item = FITNESS_ITEMS.find((i) => i.id === itemId);
        if (!item) return null;
        const feeling = feelings[itemId] || defaultFeeling();

        return (
          <div key={itemId} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <p className="text-sm font-semibold">
                {idx + 1}. {item.name}
              </p>
            </div>

            {/* 疲劳 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                疲劳程度（1=轻松，10=很累）
              </Label>
              <FeelingSlider
                label=""
                value={feeling.fatigueLevel}
                onChange={(v) =>
                  onChangeItem(itemId, { ...feeling, fatigueLevel: v })
                }
              />
            </div>

            {/* 恢复 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">恢复感觉</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {RECOVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChangeItem(itemId, { ...feeling, recoveryStatus: opt.value })
                    }
                    className={cn(
                      "min-h-11 rounded-lg border px-2 py-2 text-center transition-all",
                      feeling.recoveryStatus === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-accent"
                    )}
                  >
                    <p className="text-xs font-semibold">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 酸痛 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">该项目的肌肉酸痛</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={feeling.hasSoreness ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onChangeItem(itemId, { ...feeling, hasSoreness: true })
                  }
                >
                  有酸痛
                </Button>
                <Button
                  type="button"
                  variant={!feeling.hasSoreness ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onChangeItem(itemId, { ...feeling, hasSoreness: false, sorenessAreas: [] })
                  }
                >
                  无酸痛
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* 整体不适（共享） */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold">整体身体状况</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={overallDiscomfort.hasDiscomfort ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onChangeDiscomfort({ ...overallDiscomfort, hasDiscomfort: true })
            }
          >
            有不适
          </Button>
          <Button
            type="button"
            variant={!overallDiscomfort.hasDiscomfort ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onChangeDiscomfort({ hasDiscomfort: false, discomfortNotes: "" })
            }
          >
            无不适
          </Button>
        </div>
        {overallDiscomfort.hasDiscomfort && (
          <Input
            placeholder="请描述不适情况，例如：跑步后膝盖轻微不适"
            value={overallDiscomfort.discomfortNotes}
            onChange={(e) =>
              onChangeDiscomfort({ ...overallDiscomfort, discomfortNotes: e.target.value })
            }
            className="h-11"
          />
        )}
      </div>
    </div>
  );
}
