"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/features/empty-state";
import { BatchReviewBar } from "@/components/features/batch-review-bar";
import type { ReviewWithReport } from "@/lib/server/db-mappers";
import {
  CheckCircle2,
  Pencil,
  X,
  Clock,
  Sparkles,
  AlertTriangle,
  Users,
  ClipboardCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import type { AIClassReport, AIStudentReport, TeacherReview } from "@/lib/types";

function getOriginalAIText(report: AIStudentReport | AIClassReport | null, reportType: "student" | "class"): string {
  if (!report) return "暂无报告内容";
  if (reportType === "student") {
    return (report as AIStudentReport).fitnessProfile.summary;
  }
  return (report as AIClassReport).overallAnalysis.summary;
}

interface ReviewWorkflowProps {
  initialItems: ReviewWithReport[];
}

export function ReviewWorkflow({ initialItems }: ReviewWorkflowProps) {
  const [items, setItems] = useState<ReviewWithReport[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [rejectionErrorId, setRejectionErrorId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Batch delete
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const showFeedback = (reviewId: string, message: string) => {
    // Clear any existing timer for this review
    if (timersRef.current[reviewId]) {
      clearTimeout(timersRef.current[reviewId]);
    }
    setFeedbackMap((prev) => ({ ...prev, [reviewId]: message }));
    timersRef.current[reviewId] = setTimeout(() => {
      setFeedbackMap((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
      delete timersRef.current[reviewId];
    }, 2000);
  };

  const pendingItems = items.filter((item) => item.review.status === "pending");
  const processedItems = items.filter((item) => item.review.status !== "pending");

  const handleAction = async (
    reviewId: string,
    action: "approved" | "modified" | "rejected",
    notes?: string
  ) => {
    // Clear rejection error when performing any action
    setRejectionErrorId(null);

    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: action,
        teacherNotes: notes ?? "",
      }),
    });

    if (!response.ok) {
      showFeedback(reviewId, "审核状态保存失败，请稍后重试");
      return;
    }

    const payload = await response.json() as { data: TeacherReview };
    setItems((prev) =>
      prev.map((item) =>
        item.review.id === reviewId
          ? {
              ...item,
              review: payload.data,
            }
          : item
      )
    );
    setEditingId(null);
    setEditNotes("");

    const messages: Record<string, string> = {
      approved: "✓ 报告已通过审核",
      modified: "✓ 报告已修改并通过",
      rejected: "✓ 报告已退回",
    };
    showFeedback(reviewId, messages[action]);
  };

  const handleRejectClick = (reviewId: string) => {
    if (editingId === reviewId) {
      if (!editNotes.trim()) {
        setRejectionErrorId(reviewId);
        return;
      }
      handleAction(reviewId, "rejected", editNotes);
    } else {
      setRejectionErrorId(null);
      setEditingId(reviewId);
      setEditNotes("");
    }
  };

  const handleModifyClick = (reviewId: string) => {
    if (editingId === reviewId) {
      handleAction(reviewId, "modified", editNotes);
    } else {
      setRejectionErrorId(null);
      setEditingId(reviewId);
      setEditNotes("");
    }
  };

  const handleEditNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditNotes(e.target.value);
    // Clear rejection error when user starts typing
    if (rejectionErrorId) {
      setRejectionErrorId(null);
    }
  };

  // --- Batch selection handlers ---
  const handleToggleSelect = (reviewId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const handleSelectAllPending = () => {
    setSelectedIds((prev) => {
      if (prev.size === pendingItems.length && pendingItems.length > 0) {
        return new Set(); // Deselect all
      }
      return new Set(pendingItems.map((item) => item.review.id));
    });
  };

  // Batch delete reports (teacher side)
  const handleBatchDelete = useCallback(async () => {
    setBatchDeleting(true);
    const selectedItems = pendingItems.filter(item => selectedIds.has(item.review.id));
    const reportIds = selectedItems.map(item => item.review.reportId);
    try {
      let allOk = true;
      for (const id of reportIds) {
        const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
        if (!res.ok) allOk = false;
      }
      if (allOk) {
        setSelectedIds(new Set());
        setConfirmBatchDelete(false);
        // Refresh list
        const response = await fetch("/api/reviews");
        if (response.ok) {
          const payload = await response.json() as { data: ReviewWithReport[] };
          setItems(payload.data);
        }
      }
    } finally {
      setBatchDeleting(false);
    }
  }, [selectedIds, pendingItems]);

  const handleBatchSuccess = async () => {
    // Clear selection
    setSelectedIds(new Set());
    // Refresh the list from server
    try {
      const response = await fetch("/api/reviews");
      if (response.ok) {
        const payload = (await response.json()) as { data: ReviewWithReport[] };
        setItems(payload.data);
      }
    } catch {
      // Silently fail — the batch bar already showed success
    }
  };

  const isAllPendingSelected =
    pendingItems.length > 0 && selectedIds.size === pendingItems.length;

  const selectedPendingIds = pendingItems
    .filter((item) => selectedIds.has(item.review.id))
    .map((item) => item.review.id);

  return (
    <>
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="w-full max-w-xs">
        <TabsTrigger value="pending" className="flex-1 gap-1.5">
          <Clock className="h-4 w-4" />
          待审核
          {pendingItems.length > 0 && (
            <Badge variant="pass" className="ml-1 h-4 px-1 text-[10px]">
              {pendingItems.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="processed" className="flex-1 gap-1.5">
          <ClipboardCheck className="h-4 w-4" />
          已处理
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
            {processedItems.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* 待审核 */}
      <TabsContent value="pending" className="mt-4 space-y-4">
        {pendingItems.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-8 w-8 text-muted-foreground" />}
            title="没有待审核的报告"
            description="所有 AI 报告已处理完毕"
          />
        ) : (
          <>
            {/* Selection controls */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-pending"
                checked={isAllPendingSelected}
                onCheckedChange={handleSelectAllPending}
                aria-label="全选待审核报告"
              />
              <label
                htmlFor="select-all-pending"
                className="text-sm font-medium cursor-pointer select-none"
              >
                全选
              </label>
            </div>
            <BatchReviewBar
              selectedCount={selectedIds.size}
              selectedIds={selectedPendingIds}
              onSuccess={handleBatchSuccess}
            />
            {/* Batch delete — teacher can delete reports */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmBatchDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  批量删除报告
                </Button>
              </div>
            )}
            {pendingItems.map(({ review, report }) => {
            const reportTitle =
              review.reportType === "student"
                ? "学生个人 AI 体质报告"
                : "AI 班级报告";

            const reportTypeLabel =
              review.reportType === "student" ? "学生个人报告" : "班级报告";

            const feedbackMessage = feedbackMap[review.id];

            return (
              <Card key={review.id} className="rounded-xl border shadow-sm">
                {/* AI annotation strip */}
                <div className="flex items-center justify-between rounded-t-xl border-b bg-muted/50 px-4 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-level-pass" />
                    <span>
                      <span className="font-medium text-foreground/80">AI生成</span>
                      <span className="mx-1.5 text-border">·</span>
                      需教师审核
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {reportTypeLabel}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(review.id)}
                        onCheckedChange={() => handleToggleSelect(review.id)}
                        aria-label={`选择 ${reportTitle}`}
                      />
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
                    </div>
                    <Badge variant="pass" className="gap-1">
                      <Clock className="h-3 w-3" />
                      待审核
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* AI 报告预览 */}
                  <div className="rounded-xl border bg-muted/30 p-4 max-h-64 overflow-y-auto">
                    {review.reportType === "student" ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <p className="text-sm">
                          {getOriginalAIText(report, review.reportType)}
                        </p>
                        <div className="flex flex-wrap gap-1 content-start">
                          {((report as AIStudentReport | null)?.fitnessProfile.strengths ?? []).map(
                            (s) => (
                              <Badge key={s} variant="excellent" className="text-[10px]">
                                {s}
                              </Badge>
                            )
                          )}
                          {((report as AIStudentReport | null)?.fitnessProfile.improvements ?? []).map(
                            (s) => (
                              <Badge key={s} variant="pass" className="text-[10px]">
                                {s}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <p className="text-sm">
                          {getOriginalAIText(report, review.reportType)}
                        </p>
                        <div className="flex flex-wrap gap-1 content-start">
                          {((report as AIClassReport | null)?.commonWeaknesses ?? []).map((w) => (
                            <Badge
                              key={w.itemId}
                              variant="pass"
                              className="text-[10px]"
                            >
                              {w.itemName} {w.passRate}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 编辑备注 */}
                  {editingId === review.id && (
                    <div className="space-y-2">
                      {/* Original AI text preview when modifying */}
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1">
                          AI 原文参考
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getOriginalAIText(report, review.reportType)}
                        </p>
                      </div>

                      <label className="text-sm font-medium">
                        教师备注 / 修改说明
                      </label>
                      <Textarea
                        placeholder="输入审核意见、修改建议或退回原因..."
                        value={editNotes}
                        onChange={handleEditNotesChange}
                        rows={4}
                      />

                      {/* Rejection validation error */}
                      {rejectionErrorId === review.id && (
                        <p className="text-sm text-destructive font-medium">
                          请填写退回原因
                        </p>
                      )}
                    </div>
                  )}

                  {/* Operation feedback */}
                  {feedbackMessage && (
                    <div className="rounded-lg bg-level-excellent/10 px-3 py-2 text-sm font-medium text-level-excellent animate-in fade-in">
                      {feedbackMessage}
                    </div>
                  )}

                  <Separator />

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAction(review.id, "approved")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      通过，推送给学生
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => handleModifyClick(review.id)}
                    >
                      <Pencil className="h-4 w-4" />
                      {editingId === review.id ? "确认修改" : "修改后通过"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => handleRejectClick(review.id)}
                    >
                      <X className="h-4 w-4" />
                      {editingId === review.id ? "确认退回" : "退回，暂不推送"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </>
        )}
      </TabsContent>

      {/* 已处理 */}
      <TabsContent value="processed" className="mt-4 space-y-3">
        {processedItems.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-8 w-8 text-muted-foreground" />}
            title="暂无已处理的报告"
            description="审核完成后会显示在这里"
          />
        ) : (
          processedItems.map(({ review }) => {
            const statusConfig = {
              approved: {
                label: "已通过",
                variant: "excellent" as const,
                icon: CheckCircle2,
              },
              modified: {
                label: "已修改",
                variant: "good" as const,
                icon: Pencil,
              },
              rejected: {
                label: "已退回",
                variant: "improve" as const,
                icon: X,
              },
            };
            const info =
              statusConfig[review.status as keyof typeof statusConfig];
            const StatusIcon = info?.icon;
            const feedbackMessage = feedbackMap[review.id];

            return (
              <Card key={review.id} className="rounded-xl border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
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
                  </div>

                  {/* Operation feedback in processed card */}
                  {feedbackMessage && (
                    <div className="rounded-lg bg-level-excellent/10 px-3 py-2 text-sm font-medium text-level-excellent animate-in fade-in">
                      {feedbackMessage}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>
    </Tabs>

      {/* Batch delete confirmation dialog */}
      {confirmBatchDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmBatchDelete(false)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">确定删除选中的 {selectedIds.size} 份报告吗？</p>
            <p className="mt-2 text-sm text-muted-foreground">
              此操作将永久删除 AI 报告及其审核记录，原始体测数据不受影响。此操作不可撤销。
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="h-11 flex-1" onClick={() => setConfirmBatchDelete(false)} disabled={batchDeleting}>取消</Button>
              <Button variant="destructive" className="h-11 flex-1" onClick={handleBatchDelete} disabled={batchDeleting}>
                {batchDeleting ? <><Loader2 className="h-4 w-4 animate-spin" />删除中...</> : `删除 ${selectedIds.size} 份`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
