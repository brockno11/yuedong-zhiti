// ===== 跃动智体 — AI 报告卡片（含标注）=====
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIReportCardProps {
  title: string;
  children: React.ReactNode;
  status?: "draft" | "pending_review" | "approved" | "rejected";
  className?: string;
  hideDisclaimer?: boolean;
}

const statusConfig = {
  draft: { label: "草稿", variant: "outline" as const },
  pending_review: { label: "待审核", variant: "pass" as const },
  approved: { label: "已通过", variant: "excellent" as const },
  rejected: { label: "已退回", variant: "improve" as const },
};

export function AIReportCard({
  title,
  children,
  status,
  className,
  hideDisclaimer = false,
}: AIReportCardProps) {
  const statusInfo = status ? statusConfig[status] : null;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* AI 标识条 */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary/40" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {statusInfo && (
            <Badge variant={statusInfo.variant} className="text-[10px]">
              {statusInfo.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>

      {/* AI 免责声明 */}
      {!hideDisclaimer && (
        <div className="flex items-start gap-2 border-t bg-muted/30 px-5 py-3">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            AI生成内容，需经体育教师审核后使用
          </p>
        </div>
      )}
    </Card>
  );
}
