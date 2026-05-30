// ===== 跃动智体 — 运动后体感滑杆 =====
"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FeelingSliderProps {
  value: number;
  onChange: (_value: number) => void;
  label: string;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
}

export function FeelingSlider({
  value,
  onChange,
  label,
  minLabel = "轻松",
  maxLabel = "极度疲劳",
  className,
}: FeelingSliderProps) {
  const getFeelingEmoji = (val: number) => {
    if (val <= 2) return "😊";
    if (val <= 4) return "🙂";
    if (val <= 6) return "😐";
    if (val <= 8) return "😟";
    return "😫";
  };

  const getFeelingText = (v: number) => {
    if (v <= 2) return "非常轻松";
    if (v <= 4) return "比较轻松";
    if (v <= 6) return "适中";
    if (v <= 8) return "比较累";
    return "非常疲劳";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-muted-foreground tabular-nums">
          {value}/10
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-8 text-right">{minLabel}</span>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={1}
          max={10}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8">{maxLabel}</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl" role="img" aria-label={getFeelingText(value)}>
          {getFeelingEmoji(value)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {getFeelingText(value)}
        </span>
      </div>
    </div>
  );
}
