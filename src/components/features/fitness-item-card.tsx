// ===== 跃动智体 — 体测项目卡片 =====
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { FitnessItemDef, GradeTier } from "@/lib/types";
import { GRADE_STANDARDS } from "@/lib/constants";

interface FitnessItemCardProps {
  item: FitnessItemDef;
  value?: number;
  grade?: GradeTier;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FitnessItemCard({
  item,
  value,
  grade,
  isSelected,
  onClick,
  className,
}: FitnessItemCardProps) {
  const gradeInfo = grade ? GRADE_STANDARDS[grade] : null;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* 图标 */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
          {item.icon}
        </div>

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{item.name}</h4>
            {gradeInfo && (
              <Badge variant={grade} className="text-[10px]">
                {gradeInfo.label}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.description}
          </p>
          {value !== undefined && (
            <p className="mt-1 text-lg font-bold tabular-nums">
              {value}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                {item.unit}
              </span>
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
