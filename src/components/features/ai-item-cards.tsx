"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import type { FitnessItemDef, FitnessItemId, FitnessRecordItem, GradeTier } from "@/lib/types";

type ItemTrend = {
  label: "提升中" | "基本稳定" | "需关注";
  icon: typeof TrendingUp;
  variant: "excellent" | "secondary" | "pass";
};

export interface ItemCardData {
  itemId: FitnessItemId;
  def: FitnessItemDef;
  officialItem: FitnessRecordItem | null;
  dailyCount: number;
  latestDailyDate: string | null;
  trend: ItemTrend | null;
  report: StudentReportHistoryItem | null;
  freshness: "current" | "new_data" | "suggest_update";
  newDataCount: number;
}

function gradeLabel(grade?: GradeTier): string {
  if (grade === "excellent") return "优秀";
  if (grade === "good") return "良好";
  if (grade === "pass") return "及格";
  if (grade === "improve") return "有提升空间";
  return "暂无";
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function reviewBadge(status: string) {
  if (status === "approved") return { label: "已审核", variant: "excellent" as const };
  if (status === "rejected") return { label: "已退回", variant: "improve" as const };
  return { label: "待审核", variant: "pass" as const };
}

function ItemCard({ item, onGenerate, onView }: { item: ItemCardData; onGenerate: (_itemId: FitnessItemId) => void; onView: (_report: StudentReportHistoryItem, _itemId: FitnessItemId) => void }) {
  const review = item.report ? reviewBadge(item.report.status) : null;
  const scoreVariant: "excellent" | "pass" | "secondary" =
    item.officialItem?.grade === "excellent" || item.officialItem?.grade === "good" ? "excellent"
    : item.officialItem ? "pass"
    : "secondary";

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="space-y-3 p-3.5">
        {/* Header */}
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none">{item.def.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{item.def.name}</p>
            <p className="text-[10px] text-muted-foreground">{item.def.description}</p>
          </div>
          {item.newDataCount > 0 && (
            <Badge variant="pass" className="shrink-0 text-[10px]">
              +{item.newDataCount}
            </Badge>
          )}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-[10px] text-muted-foreground">正式体测</p>
            <p className="mt-1 font-semibold tabular-nums">
              {item.officialItem ? `${item.officialItem.score}分` : "暂无"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-[10px] text-muted-foreground">日常训练</p>
            <p className="mt-1 font-semibold tabular-nums">{item.dailyCount} 次</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={scoreVariant} className="text-[9px]">
            {item.officialItem ? gradeLabel(item.officialItem.grade) : "数据不足"}
          </Badge>
          {item.trend && (
            <Badge variant={item.trend.variant} className="gap-1 text-[9px]">
              <item.trend.icon className="h-2.5 w-2.5" />
              {item.trend.label}
            </Badge>
          )}
          {review && <Badge variant={review.variant} className="text-[9px]">{review.label}</Badge>}
        </div>

        {/* Last training date */}
        {item.latestDailyDate && (
          <p className="text-[10px] text-muted-foreground">最近训练：{formatDate(item.latestDailyDate)}</p>
        )}

        {/* Action button */}
        {item.officialItem ? (
          <Button
            size="sm"
            className="h-11 w-full gap-1.5"
            onClick={() => {
              if (item.report && item.freshness === "current") {
                onView(item.report, item.itemId);
              } else {
                onGenerate(item.itemId);
              }
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {item.report && item.freshness === "current"
              ? "查看专项分析"
              : item.report
                ? "更新专项分析"
                : "生成专项分析"}
          </Button>
        ) : (
          <Link href="/record">
            <Button size="sm" variant="outline" className="h-11 w-full gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              补充正式数据
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function AIItemCards({ items, onGenerate, onView }: { items: ItemCardData[]; onGenerate: (_itemId: FitnessItemId) => void; onView: (_report: StudentReportHistoryItem, _itemId: FitnessItemId) => void }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">单项分析</h2>
        <Badge variant="secondary" className="text-[10px]">{items.length} 项</Badge>
      </div>

      <p className="px-1 text-xs text-muted-foreground">
        每项可融合正式体测与日常训练数据生成专项分析。日常训练仅用于过程观察，不参与正式评分。
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <ItemCard
            key={item.itemId}
            item={item}
            onGenerate={onGenerate}
            onView={onView}
          />
        ))}
      </div>
    </section>
  );
}
