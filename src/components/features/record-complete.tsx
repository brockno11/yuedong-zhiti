"use client";

import { CheckCircle2, Sparkles, BarChart3, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { FitnessItemId, RecordType } from "@/lib/types";

interface RecordCompleteProps {
  itemCount: number;
  hasPhysicalItems: boolean;
  selectedItems: FitnessItemId[];
  recordType: RecordType;
  savedRecordId: string | null;
  isSaving: boolean;
  hasSaveError: boolean;
}

export function RecordComplete({
  itemCount,
  hasPhysicalItems,
  selectedItems,
  recordType,
  savedRecordId,
  isSaving,
  hasSaveError,
}: RecordCompleteProps) {
  const firstItemId = selectedItems[0];
  const canGenerate = hasPhysicalItems && Boolean(savedRecordId) && !isSaving && !hasSaveError;
  const reportType = selectedItems.length === 1 ? "item_report" : "record_report";
  const aiHref = canGenerate
    ? `/ai-guide?generate=1&recordId=${encodeURIComponent(savedRecordId ?? "")}&recordType=${recordType}&reportType=${reportType}${firstItemId ? `&itemId=${firstItemId}` : ""}`
    : "/ai-guide";

  return (
    <div className="text-center space-y-5">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-level-excellent/10">
          <CheckCircle2 className="h-12 w-12 text-level-excellent" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold">记录完成</h3>
        <p className="text-sm text-muted-foreground mt-1">
          已完成 {itemCount} 个体测项目的成绩记录
        </p>
      </div>

      {hasPhysicalItems && (
        <div className="rounded-xl bg-primary/5 p-3.5 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm text-primary font-medium">
              AI 可基于最新数据生成个性化训练建议
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            AI 生成内容需经体育教师审核后使用
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Link href="/portrait">
          <Button className="h-11 w-full gap-1.5">
            <BarChart3 className="h-4 w-4" />
            查看体质画像
          </Button>
        </Link>
        {canGenerate ? (
          <Link href={aiHref}>
            <Button variant="outline" className="h-11 w-full gap-1.5">
              <Sparkles className="h-4 w-4" />
              生成 AI 分析
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="h-11 w-full gap-1.5" disabled>
            <Sparkles className="h-4 w-4" />
            {isSaving ? "正在保存记录..." : hasSaveError ? "保存失败，暂不能生成" : "生成 AI 分析"}
          </Button>
        )}
        <div className="flex gap-2">
          <Link href="/record" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full gap-1">
              继续记录
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full gap-1">
              <Home className="h-3.5 w-3.5" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
