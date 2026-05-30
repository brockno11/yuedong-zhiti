"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getReviewByReportId, type StoredReview } from "@/lib/demo-store";
import { Sparkles } from "lucide-react";

interface StudentReviewStatusProps {
  studentId: string;
}

export function StudentReviewStatus({ studentId }: StudentReviewStatusProps) {
  const [reviewStatus, setReviewStatus] = useState<StoredReview | null>(null);

  useEffect(() => {
    setReviewStatus(getReviewByReportId(`report-${studentId}`));
  }, [studentId]);

  const reviewLabel = reviewStatus?.status === "approved" ? "已审核通过"
    : reviewStatus?.status === "modified" ? "已修改"
    : reviewStatus?.status === "rejected" ? "已退回"
    : "待审核";

  const reviewVariant = reviewStatus?.status === "approved" ? "excellent" as const
    : reviewStatus?.status === "rejected" ? "improve" as const
    : "pass" as const;

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">AI 建议状态</p>
        </div>
        <Badge variant={reviewVariant} className="mb-2 text-[11px]">
          {reviewLabel}
        </Badge>
        <p className="text-xs text-muted-foreground">
          AI 生成，需经体育教师审核后使用。训练计划须经体育教师审核授权后实施。
        </p>
        {reviewStatus?.teacherNotes && (
          <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
            教师备注：{reviewStatus.teacherNotes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
