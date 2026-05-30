"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Brain,
  Activity,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type AIStatus = "idle" | "analyzing" | "generating_profile" | "generating_plan" | "complete" | "error" | "fallback";

interface AIGenerationStatusProps {
  status: AIStatus;
  mode?: "ai" | "mock" | "fallback";
  subjectLabel?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

const STATUS_STEPS = [
  { key: "analyzing" as const, label: "分析体测数据", icon: Activity },
  { key: "generating_profile" as const, label: "生成体质画像", icon: Brain },
  { key: "generating_plan" as const, label: "生成训练建议", icon: Target },
];

const MODE_LABELS: Record<string, { label: string; variant: "excellent" | "secondary" | "pass" }> = {
  ai: { label: "AI 生成", variant: "excellent" },
  mock: { label: "示例数据", variant: "secondary" },
  fallback: { label: "AI 回退", variant: "pass" },
};

export function AIGenerationStatus({
  status,
  mode,
  subjectLabel = "你的体测数据",
  errorMessage,
  onRetry,
  className,
}: AIGenerationStatusProps) {
  if (status === "idle") return null;

  // Error state
  if (status === "error") {
    return (
      <div className={cn("rounded-xl border border-destructive/30 bg-destructive/5 p-5", className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">AI 服务暂不可用</p>
            <p className="text-xs text-muted-foreground mt-1">
              {errorMessage || "已为你展示示例报告，可稍后重新生成"}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重新生成
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback state
  if (status === "fallback") {
    return (
      <div className={cn("rounded-xl border border-muted bg-muted/30 p-4", className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">AI 响应较慢，已展示示例报告</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              页面不会继续卡住，可稍后重新生成真实 AI 分析
            </p>
          </div>
          {mode && (
            <Badge variant={MODE_LABELS[mode]?.variant || "secondary"} className="shrink-0 text-[10px]">
              {MODE_LABELS[mode]?.label || mode}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Complete state
  if (status === "complete") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <CheckCircle2 className="h-4 w-4 text-level-excellent" />
        <span className="text-sm text-muted-foreground">分析完成</span>
        {mode && (
          <Badge variant={MODE_LABELS[mode]?.variant || "secondary"} className="text-[10px]">
            {MODE_LABELS[mode]?.label || mode}
          </Badge>
        )}
      </div>
    );
  }

  // Generating states
  const currentStepIndex = status === "analyzing" ? 0 : status === "generating_profile" ? 1 : 2;
  const progressValue = ((currentStepIndex + 0.5) / STATUS_STEPS.length) * 100;

  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <p className="text-sm font-semibold">AI 正在分析{subjectLabel}</p>
        {mode && (
          <Badge variant={MODE_LABELS[mode]?.variant || "secondary"} className="ml-auto text-[10px]">
            {MODE_LABELS[mode]?.label || mode}
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <Progress value={progressValue} className="h-1.5" />

      {/* Step list */}
      <div className="space-y-2">
        {STATUS_STEPS.map((step, i) => {
          const isActive = i <= currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isCurrent ? (
                <Skeleton className="h-5 w-5 rounded-full" />
              ) : isActive ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{step.label}</span>
              {isCurrent && (
                <span className="text-xs text-muted-foreground animate-pulse ml-auto">处理中...</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Skeleton preview */}
      <div className="space-y-2 pt-2 border-t">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
