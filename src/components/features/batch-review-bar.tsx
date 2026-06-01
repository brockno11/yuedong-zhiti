"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, X, AlertTriangle, Loader2 } from "lucide-react";

interface BatchReviewBarProps {
  selectedCount: number;
  selectedIds: string[];
  onSuccess: () => void;
}

type BatchAction = "approve" | "reject";

export function BatchReviewBar({
  selectedCount,
  selectedIds,
  onSuccess,
}: BatchReviewBarProps) {
  const [pendingAction, setPendingAction] = useState<BatchAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenApprove = useCallback(() => setPendingAction("approve"), []);
  const handleOpenReject = useCallback(() => {
    setRejectReason("");
    setErrorMessage(null);
    setPendingAction("reject");
  }, []);
  const handleCloseDialog = useCallback(() => {
    if (!isSubmitting) {
      setPendingAction(null);
      setRejectReason("");
      setErrorMessage(null);
    }
  }, [isSubmitting]);

  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return;

    if (pendingAction === "reject" && !rejectReason.trim()) {
      setErrorMessage("请填写批量退回的原因");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: true,
          ids: selectedIds,
          action: pendingAction,
          notes: pendingAction === "reject" ? rejectReason.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData as { error?: string })?.error ??
            "批量操作失败，请稍后重试"
        );
      }

      // Success
      const actionLabel =
        pendingAction === "approve" ? "通过" : "退回";
      setSuccessMessage(`已批量${actionLabel} ${selectedCount} 份报告`);

      // Clear dialog state
      setPendingAction(null);
      setRejectReason("");

      // Clear success message after 3s, then trigger refresh
      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess();
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "批量操作失败，请稍后重试"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingAction, rejectReason, selectedIds, selectedCount, onSuccess]);

  const isDisabled = selectedCount === 0 || isSubmitting;

  return (
    <>
      {/* Batch toolbar */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            已选{" "}
            <span className="text-foreground font-semibold tabular-nums">
              {selectedCount}
            </span>{" "}
            项
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={isDisabled}
              onClick={handleOpenApprove}
            >
              <CheckCircle2 className="h-4 w-4" />
              批量通过
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              disabled={isDisabled}
              onClick={handleOpenReject}
            >
              <X className="h-4 w-4" />
              批量退回
            </Button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary font-medium animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "approve" ? "批量通过报告" : "批量退回报告"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              确定批量{pendingAction === "approve" ? "通过" : "退回"}{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {selectedCount}
              </span>{" "}
              份报告吗？AI 内容仍需教师负责审核。
            </DialogDescription>
          </DialogHeader>

          {/* Reject reason textarea */}
          {pendingAction === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                退回原因
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <Textarea
                placeholder="请填写批量退回的原因，学生将看到此说明..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : pendingAction === "approve" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  确认通过
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  确认退回
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
