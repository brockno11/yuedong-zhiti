"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { FITNESS_ITEMS } from "@/lib/constants";
import type { FitnessItemId, Gender } from "@/lib/types";

interface RecordProjectSelectProps {
  selected: FitnessItemId[];
  onToggle: (_id: FitnessItemId) => void;
  gender?: Gender;
}

export function RecordProjectSelect({ selected, onToggle, gender }: RecordProjectSelectProps) {
  // 按性别过滤：男生不显示800m/仰卧起坐，女生不显示1000m/引体向上
  const filteredItems = FITNESS_ITEMS.filter((item) => {
    if (item.category === "body" || item.id === "height_weight") return false;
    if (item.genderSpecific && gender) {
      return item.applicableGender === gender;
    }
    return true;
  });

  if (filteredItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        暂无可记录的项目，请先完成信息填写
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {filteredItems.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all min-h-[52px]",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30 hover:bg-accent"
            )}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
            {isSelected && (
              <Check className="h-5 w-5 text-primary shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
