"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/features/empty-state";
import { mockTeacherReviews, mockAIStudentReport, mockAIClassReport } from "@/lib/data/mock-ai-reports";
import {
  Check,
  Pencil,
  X,
  Clock,
  Sparkles,
  AlertTriangle,
  Users,
  ClipboardCheck,
} from "lucide-react";
import type { TeacherReview } from "@/lib/types";

export function ReviewWorkflow() {
  const [reviews, setReviews] = useState<TeacherReview[]>(mockTeacherReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const processedReviews = reviews.filter((r) => r.status !== "pending");

  const handleAction = (
    reviewId: string,
    action: "approved" | "modified" | "rejected",
    notes?: string
  ) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: action,
              reviewedAt: new Date().toISOString(),
              teacherNotes: notes || r.teacherNotes,
            }
          : r
      )
    );
    setEditingId(null);
    setEditNotes("");
  };

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="w-full max-w-xs">
        <TabsTrigger value="pending" className="flex-1 gap-1.5">
          <Clock className="h-4 w-4" />
          待审核
          {pendingReviews.length > 0 && (
            <Badge variant="default" className="ml-1 h-4 px-1 text-[10px]">
              {pendingReviews.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="processed" className="flex-1 gap-1.5">
          <ClipboardCheck className="h-4 w-4" />
          已处理
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
            {processedReviews.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* 待审核 */}
      <TabsContent value="pending" className="mt-4 space-y-4">
        {pendingReviews.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-8 w-8 text-muted-foreground" />}
            title="没有待审核的报告"
            description="所有 AI 报告已处理完毕"
          />
        ) : (
          pendingReviews.map((review) => {
            const reportTitle =
              review.reportType === "student"
                ? "学生个人 AI 体质报告"
                : "AI 班级报告";

            return (
              <Card key={review.id} className="rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {review.reportType === "student" ? (
                          <Sparkles className="h-4 w-4 text-primary" />
                        ) : (
                          <Users className="h-4 w-4 text-primary" />
                        )}
                        {reportTitle}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {review.reviewerName} · 待审核
                      </p>
                    </div>
                    <Badge variant="pass" className="gap-1">
                      <Clock className="h-3 w-3" />
                      待审核
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* AI 报告预览 */}
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-3 max-h-64 overflow-y-auto">
                    {review.reportType === "student" ? (
                      <>
                        <p className="text-sm">{mockAIStudentReport.fitnessProfile.summary}</p>
                        <div className="flex flex-wrap gap-1">
                          {mockAIStudentReport.fitnessProfile.strengths.map((s) => (
                            <Badge key={s} variant="excellent" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                          {mockAIStudentReport.fitnessProfile.improvements.map((s) => (
                            <Badge key={s} variant="pass" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">{mockAIClassReport.overallAnalysis.summary}</p>
                        <div className="flex flex-wrap gap-1">
                          {mockAIClassReport.commonWeaknesses.map((w) => (
                            <Badge key={w.itemId} variant="pass" className="text-[10px]">
                              {w.itemName} {w.passRate}%
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 编辑备注 */}
                  {editingId === review.id && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        教师备注 / 修改说明
                      </label>
                      <Textarea
                        placeholder="输入审核意见、修改建议或退回原因..."
                        value={editNotes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* AI 免责标注 */}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    AI生成，需经体育教师审核后使用
                  </div>

                  <Separator />

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5 h-10"
                      onClick={() => handleAction(review.id, "approved")}
                    >
                      <Check className="h-4 w-4" />
                      通过
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-10"
                      onClick={() => {
                        if (editingId === review.id) {
                          handleAction(review.id, "modified", editNotes);
                        } else {
                          setEditingId(review.id);
                          setEditNotes(review.teacherNotes);
                        }
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      {editingId === review.id ? "确认修改" : "修改"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 h-10 text-muted-foreground"
                      onClick={() => {
                        if (editingId === review.id) {
                          handleAction(review.id, "rejected", editNotes);
                        } else {
                          setEditingId(review.id);
                          setEditNotes("");
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                      退回
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      {/* 已处理 */}
      <TabsContent value="processed" className="mt-4 space-y-3">
        {processedReviews.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-8 w-8 text-muted-foreground" />}
            title="暂无已处理的报告"
            description="审核完成后会显示在这里"
          />
        ) : (
          processedReviews.map((review) => {
            const statusConfig = {
              approved: { label: "已通过", variant: "excellent" as const, icon: Check },
              modified: { label: "已修改", variant: "good" as const, icon: Pencil },
              rejected: { label: "已退回", variant: "improve" as const, icon: X },
            };
            const info = statusConfig[review.status as keyof typeof statusConfig];
            const StatusIcon = info?.icon;

            return (
              <Card key={review.id} className="rounded-xl shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {review.reportType === "student"
                        ? "学生个人 AI 体质报告"
                        : "AI 班级报告"}
                    </p>
                    {review.teacherNotes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        备注：{review.teacherNotes.slice(0, 50)}
                        {review.teacherNotes.length > 50 ? "..." : ""}
                      </p>
                    )}
                  </div>
                  <Badge variant={info?.variant} className="gap-1">
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {info?.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>
    </Tabs>
  );
}
