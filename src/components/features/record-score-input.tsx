"use client";

import { WheelPicker } from "@/components/forms/wheel-picker";
import { FITNESS_ITEMS } from "@/lib/constants";
import type { FitnessItemId } from "@/lib/types";

interface RecordScoreInputProps {
  selectedItems: FitnessItemId[];
  scores: Record<string, number>;
  onChange: (_itemId: string, _value: number) => void;
}

const PICKER_CONFIGS: Record<string, { min: number; max: number; step: number; unit: string }> = {
  vital_capacity: { min: 1000, max: 6000, step: 50, unit: "ml" },
  "50m_run": { min: 6.0, max: 12.0, step: 0.1, unit: "秒" },
  standing_long_jump: { min: 100, max: 280, step: 1, unit: "cm" },
  sit_and_reach: { min: -10, max: 30, step: 0.5, unit: "cm" },
  pull_up: { min: 0, max: 30, step: 1, unit: "次" },
  sit_up: { min: 0, max: 60, step: 1, unit: "次/分钟" },
  "800m_run": { min: 180, max: 360, step: 1, unit: "秒" },
  "1000m_run": { min: 180, max: 420, step: 1, unit: "秒" },
};

export function RecordScoreInput({ selectedItems, scores, onChange }: RecordScoreInputProps) {
  return (
    <div className="space-y-4">
      {selectedItems.map((itemId) => {
        const item = FITNESS_ITEMS.find((i) => i.id === itemId);
        if (!item) return null;

        const config = PICKER_CONFIGS[itemId] || { min: 0, max: 300, step: 1, unit: "" };

        return (
          <WheelPicker
            key={itemId}
            label={`${item.icon} ${item.name}`}
            value={scores[itemId] || config.min + (config.max - config.min) / 2}
            onChange={(v) => onChange(itemId, v)}
            min={config.min}
            max={config.max}
            step={config.step}
            unit={config.unit}
          />
        );
      })}
    </div>
  );
}
