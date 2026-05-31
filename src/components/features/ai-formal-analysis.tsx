"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, FileText, Sparkles, AlertCircle } from "lucide-react";
import type { StudentReportHistoryItem } from "@/lib/server/db-mappers";
import { FITNESS_ITEMS } from "@/lib/constants";

interface FormalAnalysisProps {
  completenessText: string;
  completionRate: number;
  latestOfficialDate: string | null;
  batchReport: StudentReportHistoryItem | null;
  batchFreshness: "current" | "suggest_update";
  missingItems: string[];
  onGenerate: () => void;
  onView: (_report: StudentReportHistoryItem) => void;
}

function itemName(id: string): string {
  return FITNESS_ITEMS.find((item) => item.id === id)?.name ?? id;
}

function reviewBadge(status: string) {
  if (status === "approved") return { label: "已审核", variant: "excellent" as const };
  if (status === "rejected") return { label: "已退回", variant: "improve" as const };
  return { label: "待审核", variant: "pass" as const };
}

export function AIFormalAnalysis({
  completenessText,
  completionRate,
  latestOfficialDate,
  batchReport,
  batchFreshness,
  missingItems,
  onGenerate,
  onView,
}: FormalAnalysisProps) {
  const statusBadge = batchFreshness === "suggest_update"
    ? { label: "建议更新", variant: "pass" as const }
    : batchReport
      ? { label: "已生成", variant: "excellent" as const }
      : { label: "待生成", variant: "secondary" as const };

  const review = batchReport ? reviewBadge(batchReport.status) : null;
  const canAnalyze = completionRate > 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">正式体测分析</h2>
        <Badge variant={statusBadge.variant} className="text-[10px]">{statusBadge.label}</Badge>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-4 p-4">
          {/* 数据状态 */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">完成度</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{completenessText}</p>
              <p className="text-[10px] text-muted-foreground">
                {completionRate >= 100 ? "全部完成" : completionRate >= 70 ? "可综合分析" : "仅局部参考"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">最新体测</p>
              <p className="mt-1 text-sm font-semibold">{latestOfficialDate ?? "暂无"}</p>
              <p className="text-[10px] text-muted-foreground">
                {review ? review.label : "未生成报告"}
              </p>
            </div>
          </div>

          {/* 缺失项目提示 */}
          {missingItems.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">待补充项目</p>
                <p className="mt-0.5">{missingItems.map(itemName).join("、")}</p>
                <p className="mt-1 text-[10px]">缺失项目不会用日常训练或班级均值补全。</p>
              </div>
            </div>
          )}

          {/* 数据来源说明 */}
          <p className="text-[11px] leading-5 text-muted-foreground">
            正式体测分析只基于正式体测数据。日常训练不参与正式体测评分，也不能补全缺失项目。
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-2">
            {batchReport && batchFreshness === "current" ? (
              <Button
                className="h-11 gap-1.5"
                onClick={() => onView(batchReport)}
              >
                <FileText className="h-4 w-4" />
                查看已有分析
              </Button>
            ) : (
              <Button
                className="h-11 gap-1.5"
                onClick={onGenerate}
                disabled={!canAnalyze}
              >
                <Sparkles className="h-4 w-4" />
                {batchReport ? "更新正式体测分析" : "生成正式体测分析"}
              </Button>
            )}
          </div>

          {/* 免责声明 */}
          <p className="text-[10px] text-muted-foreground">
            AI 生成内容需经体育教师审核后使用。报告仅基于正式体测数据生成。
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
