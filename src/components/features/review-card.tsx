// ===== 跃动智体 — 审核卡片 =====
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Pencil, Clock, X } from "lucide-react";
import type { TeacherReview } from "@/lib/types";

interface ReviewCardProps {
  review: TeacherReview;
  reportTitle: string;
  reportType: "student" | "class";
  onApprove?: () => void;
  onModify?: () => void;
  onReject?: () => void;
  className?: string;
}

const statusConfig = {
  pending: { label: "待审核", variant: "pass" as const, icon: Clock },
  approved: { label: "已通过", variant: "excellent" as const, icon: Check },
  modified: { label: "已修改", variant: "good" as const, icon: Pencil },
  rejected: { label: "已退回", variant: "improve" as const, icon: X },
};

export function ReviewCard({
  review,
  reportTitle,
  reportType,
  onApprove,
  onModify,
  onReject,
  className,
}: ReviewCardProps) {
  const info = statusConfig[review.status];
  const StatusIcon = info.icon;

  return (
    <Card className={cn("transition-all hover:shadow-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{reportTitle}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {reportType === "student" ? "学生个人报告" : "班级报告"} ·{" "}
              {review.reviewerName}
            </p>
          </div>
          <Badge variant={info.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {info.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 教师备注 */}
        {review.teacherNotes && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              教师备注：
            </p>
            <p className="text-sm">{review.teacherNotes}</p>
          </div>
        )}

        {/* 修改记录 */}
        {review.modifications && review.modifications.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              修改记录：
            </p>
            {review.modifications.map((mod, i) => (
              <div key={i} className="rounded-lg border p-2.5 text-xs space-y-1">
                <p>
                  <span className="text-muted-foreground">章节：</span>
                  {mod.section}
                </p>
                <p>
                  <span className="text-muted-foreground">原文：</span>
                  <span className="line-through">{mod.original}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">改为：</span>
                  <span className="text-level-good">{mod.modified}</span>
                </p>
                <p className="text-muted-foreground">原因：{mod.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        {review.status === "pending" && (
          <>
            <Separator />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 gap-1"
                onClick={onApprove}
              >
                <Check className="h-4 w-4" />
                通过
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={onModify}
              >
                <Pencil className="h-4 w-4" />
                修改
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={onReject}
              >
                <X className="h-4 w-4" />
                暂不推送
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
