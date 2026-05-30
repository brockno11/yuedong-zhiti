// ===== 跃动智体 — 统计数字卡片 =====
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  description?: string;
  icon?: React.ReactNode;
  color?: "default" | "excellent" | "good" | "pass" | "improve";
  onClick?: () => void;
  className?: string;
}

const colorMap = {
  default: "text-foreground",
  excellent: "text-level-excellent",
  good: "text-level-good",
  pass: "text-level-pass",
  improve: "text-level-improve",
};

const bgColorMap = {
  default: "bg-muted",
  excellent: "bg-level-excellent/10",
  good: "bg-level-good/10",
  pass: "bg-level-pass/10",
  improve: "bg-level-improve/10",
};

export function StatCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  description,
  icon,
  color = "default",
  onClick,
  className,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-level-excellent"
      : trend === "down"
        ? "text-level-improve"
        : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  colorMap[color]
                )}
              >
                {value}
              </span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
                <span className={cn("text-xs font-medium", trendColor)}>
                  {trendValue}
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                bgColorMap[color]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
