"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeelingSlider } from "@/components/forms/feeling-slider";
import { RECOVERY_OPTIONS } from "@/lib/constants";
import type { BodyFeeling } from "@/lib/types";

interface RecordFeelingStepProps {
  feeling: BodyFeeling;
  onChange: (_feeling: BodyFeeling) => void;
}

export function RecordFeelingStep({ feeling, onChange }: RecordFeelingStepProps) {
  const update = (partial: Partial<BodyFeeling>) => {
    onChange({ ...feeling, ...partial });
  };

  return (
    <div className="space-y-5">
      {/* 疲劳程度 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          运动后疲劳程度（1=轻松，10=很累）
        </Label>
        <FeelingSlider
          label="疲劳程度"
          value={feeling.fatigueLevel}
          onChange={(v) => update({ fatigueLevel: v })}
        />
      </div>

      {/* 恢复情况 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">恢复感觉</Label>
        <div className="grid grid-cols-3 gap-2">
          {RECOVERY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ recoveryStatus: opt.value })}
              className={cn(
                "rounded-xl border-2 px-3 py-3 text-center transition-all min-h-[48px]",
                feeling.recoveryStatus === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-accent"
              )}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 酸痛 + 不适 合并 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">身体感觉</Label>

        {/* 酸痛 */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={feeling.hasSoreness ? "default" : "outline"}
            size="sm"
            onClick={() => update({ hasSoreness: true })}
          >
            有酸痛
          </Button>
          <Button
            type="button"
            variant={!feeling.hasSoreness ? "default" : "outline"}
            size="sm"
            onClick={() => update({ hasSoreness: false, sorenessAreas: [] })}
          >
            无酸痛
          </Button>
        </div>

        {/* 不适 */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={feeling.hasDiscomfort ? "default" : "outline"}
            size="sm"
            onClick={() => update({ hasDiscomfort: true })}
          >
            有不适
          </Button>
          <Button
            type="button"
            variant={!feeling.hasDiscomfort ? "default" : "outline"}
            size="sm"
            onClick={() => update({ hasDiscomfort: false, discomfortNotes: "" })}
          >
            无不适
          </Button>
        </div>

        {feeling.hasDiscomfort && (
          <Input
            placeholder="请描述不适情况，例如：跑步后膝盖轻微不适"
            value={feeling.discomfortNotes}
            onChange={(e) => update({ discomfortNotes: e.target.value })}
            className="h-10"
          />
        )}
      </div>
    </div>
  );
}
