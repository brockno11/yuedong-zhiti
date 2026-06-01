// ===== 跃动智体 — 国家体质健康标准导读板块 =====
// batch_report 详情页中展示的总体标准科普
// 权重、等级规则来自本地静态配置
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, Scale, Info } from "lucide-react";
import {
  FITNESS_STANDARD_EDUCATION,
  FITNESS_ITEM_EDUCATION,
} from "@/lib/fitness-education";
import { FITNESS_ITEMS } from "@/lib/constants";
import type { FitnessItemId, Gender } from "@/lib/types";

interface StandardEducationOverviewProps {
  /** 学生性别（用于过滤适用项目） */
  gender?: Gender;
  /** 已记录的项目 ID 列表 */
  recordedItemIds?: FitnessItemId[];
  /** 缺失的项目 ID 列表 */
  missingItemIds?: FitnessItemId[];
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  body: "bg-level-pass/15 text-level-pass",
  function: "bg-primary/10 text-primary",
  speed: "bg-level-excellent/15 text-level-excellent",
  strength: "bg-level-good/15 text-level-good",
  flexibility: "bg-primary/10 text-primary",
  endurance: "bg-level-improve/15 text-level-improve",
};

function WeightBar({
  item,
  weight,
  isMissing,
}: {
  item: (typeof FITNESS_ITEMS)[number];
  weight: number;
  isMissing: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "text-xs w-20 shrink-0 truncate",
        isMissing ? "text-muted-foreground/50" : "text-foreground"
      )}>
        {item.name}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isMissing ? "bg-muted-foreground/20" : "bg-primary/70"
          )}
          style={{ width: `${weight * 2.5}%` }} // 20%权重 → 50%宽度，视觉更明显
        />
      </div>
      <span className={cn(
        "text-[10px] w-8 text-right tabular-nums",
        isMissing ? "text-muted-foreground/40" : "text-muted-foreground"
      )}>
        {weight}%
      </span>
    </div>
  );
}

export function StandardEducationOverview({
  gender,
  recordedItemIds = [],
  missingItemIds = [],
  className,
}: StandardEducationOverviewProps) {
  const edu = FITNESS_STANDARD_EDUCATION;
  const applicableWeights = gender
    ? edu.highSchoolWeights.filter((w) => {
        const def = FITNESS_ITEMS.find((i) => i.id === w.itemId);
        if (!def) return false;
        if (def.genderSpecific) return def.applicableGender === gender;
        return true;
      })
    : edu.highSchoolWeights;

  const recordedSet = new Set(recordedItemIds);

  return (
    <Card className={cn("rounded-xl shadow-sm border-primary/10", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-primary" />
          {edu.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 标准说明 */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {edu.purpose}
          </p>
        </div>

        {/* 六维能力说明 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">六类测试能力</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {edu.dimensions.map((dim) => {
              // 检查该维度下是否有数据
              const isBodyShape = dim.items.includes("height_weight");
              const hasData = isBodyShape || dim.items.some((id) => recordedSet.has(id));
              const category = FITNESS_ITEM_EDUCATION[dim.items[0]]?.category ?? "body";
              return (
                <div
                  key={dim.name}
                  className={cn(
                    "rounded-lg border px-3 py-2 space-y-1",
                    hasData
                      ? "bg-card border-border/50"
                      : "bg-muted/20 border-muted/30"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground"
                    )}>
                      {dim.name}
                    </span>
                    {isBodyShape && (
                      <span className="text-[10px] text-muted-foreground/60">BMI参考维度</span>
                    )}
                    {!hasData && !isBodyShape && (
                      <span className="text-[10px] text-muted-foreground/60">暂无数据</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {dim.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 权重构成条形图 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">高中阶段权重构成</span>
          </div>
          <div className="space-y-1.5">
            {applicableWeights.map((w) => {
              const def = FITNESS_ITEMS.find((i) => i.id === w.itemId);
              if (!def) return null;
              return (
                <WeightBar
                  key={w.itemId}
                  item={def}
                  weight={w.weight}
                  isMissing={missingItemIds.includes(w.itemId)}
                />
              );
            })}
          </div>
        </div>

        {/* 等级规则 */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold">评分等级说明</span>
          <div className="grid grid-cols-2 gap-1.5">
            {(["excellent", "good", "pass", "improve"] as const).map((g) => (
              <div key={g} className="flex items-center gap-1.5 text-[11px]">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  g === "excellent" && "bg-level-excellent",
                  g === "good" && "bg-level-good",
                  g === "pass" && "bg-level-pass",
                  g === "improve" && "bg-level-improve",
                )} />
                <span className="text-muted-foreground">{edu.gradeRules[g]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 缺失项目提示 */}
        {missingItemIds.length > 0 && (
          <div className="rounded-lg bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">未记录项目：</span>
              {missingItemIds.map((id) => {
                const def = FITNESS_ITEMS.find((i) => i.id === id);
                return def?.name ?? id;
              }).join("、")}
              。缺失项目不影响已记录项目的评分，但会影响总分完整度。
            </p>
          </div>
        )}

        {/* 来源标注 */}
        <p className="text-[10px] text-muted-foreground/70 border-t pt-2">
          依据现行{edu.sourceName}进行项目解读；AI 仅提供体育锻炼参考，具体训练安排需结合体育教师指导。
        </p>
      </CardContent>
    </Card>
  );
}
