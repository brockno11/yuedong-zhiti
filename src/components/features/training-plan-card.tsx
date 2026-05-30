// ===== 跃动智体 — 训练计划卡片 =====
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Repeat, Heart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  name: string;
  description: string;
  sets: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface TrainingPlanCardProps {
  weekNumber: number;
  focus: string;
  exercises: Exercise[];
  recoveryAdvice: string;
  className?: string;
}

export function TrainingPlanCard({
  weekNumber,
  focus,
  exercises,
  recoveryAdvice,
  className,
}: TrainingPlanCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">第{weekNumber}周</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {focus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercises.map((exercise, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Dumbbell className="h-4 w-4 text-primary shrink-0" />
              <h5 className="text-sm font-semibold">{exercise.name}</h5>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{exercise.description}</p>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                <Repeat className="h-3 w-3" />
                {exercise.sets}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                <Clock className="h-3 w-3" />
                {exercise.frequency} · {exercise.duration}
              </span>
            </div>
            {exercise.notes && (
              <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                注意：{exercise.notes}
              </p>
            )}
          </div>
        ))}

        {/* 恢复建议 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Heart className="mt-0.5 h-4 w-4 shrink-0 text-level-improve" />
          <p className="text-xs text-muted-foreground">{recoveryAdvice}</p>
        </div>

        {/* AI 内容标注 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
