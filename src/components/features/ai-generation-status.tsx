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
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

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
  { key: "analyzing" as const, label: "分析体测数据", icon: Activity, duration: 5 },
  { key: "generating_profile" as const, label: "生成体质画像", icon: Brain, duration: 12 },
  { key: "generating_plan" as const, label: "生成训练建议", icon: Target, duration: 20 },
];

const MODE_LABELS: Record<string, { label: string; variant: "excellent" | "secondary" | "pass" }> = {
  ai: { label: "AI 生成", variant: "excellent" },
  mock: { label: "示例数据", variant: "secondary" },
  fallback: { label: "AI 回退", variant: "pass" },
};

/** Rotating motivational messages shown during generation */
const MOTIVATIONAL_MESSAGES = [
  "正在深度分析体测数据...",
  "AI 正在为你量身定制分析...",
  "数据模型运转中，请稍候...",
  "正在比对历史数据趋势...",
  "智能分析引擎全力运转中...",
  "即将为你呈现专属报告...",
];

/** Asymptotic progress curve: fast start, slow finish, never reaches 100% */
function simulatedProgress(elapsedSec: number): number {
  // Reaches ~60% at 5s, ~80% at 12s, ~90% at 20s, ~95% at 30s
  return 95 * (1 - Math.exp(-elapsedSec / 10));
}

/** Determine which step index based on elapsed time */
function currentStepFromTime(elapsedSec: number): number {
  if (elapsedSec < 5) return 0;
  if (elapsedSec < 12) return 1;
  return 2;
}

export function AIGenerationStatus({
  status,
  mode,
  subjectLabel = "你的体测数据",
  errorMessage,
  onRetry,
  className,
}: AIGenerationStatusProps) {
  const [elapsed, setElapsed] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when status changes to "analyzing"
  useEffect(() => {
    if (status === "analyzing") {
      startTimeRef.current = Date.now();
      setElapsed(0);
      setDisplayProgress(0);
      setCompleting(false);
    }
  }, [status]);

  // Tick elapsed time every 200ms while generating
  useEffect(() => {
    const isGenerating = status === "analyzing" || status === "generating_profile" || status === "generating_plan";
    if (!isGenerating) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const sec = (now - startTimeRef.current) / 1000;
      setElapsed(sec);
      setDisplayProgress(simulatedProgress(sec));
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // Rotate motivational messages every 3 seconds
  useEffect(() => {
    const isGenerating = status === "analyzing" || status === "generating_profile" || status === "generating_plan";
    if (!isGenerating) return;

    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 3000);

    return () => clearInterval(msgInterval);
  }, [status]);

  // When status becomes "complete", animate to 100% then hold briefly
  useEffect(() => {
    if (status === "complete" && !completing) {
      setCompleting(true);
      setDisplayProgress(100);
    }
  }, [status, completing]);

  if (status === "idle") return null;

  // ---- Error state ----
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

  // ---- Fallback state ----
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

  // ---- Complete state (brief flash) ----
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

  // ---- Generating states (main animated UI) ----
  const stepIndex = currentStepFromTime(elapsed);
  const clampedProgress = Math.min(displayProgress, 99.5); // Never show 100% until truly complete
  const elapsedSec = Math.floor(elapsed);
  const currentMessage = MOTIVATIONAL_MESSAGES[messageIndex];

  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-4", className)}>
      {/* Header with animated sparkles */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <div className="absolute inset-0 h-5 w-5 text-primary animate-ping opacity-20">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm font-semibold">AI 正在分析{subjectLabel}</p>
        {mode && (
          <Badge variant={MODE_LABELS[mode]?.variant || "secondary"} className="ml-auto text-[10px]">
            {MODE_LABELS[mode]?.label || mode}
          </Badge>
        )}
      </div>

      {/* Progress bar with percentage */}
      <div className="space-y-1.5">
        <Progress
          value={clampedProgress}
          className="h-2 transition-all duration-300 ease-out"
          indicatorClassName="bg-gradient-to-r from-primary/80 to-primary"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>已用时 {elapsedSec}s</span>
          </div>
          <span className="font-mono tabular-nums">{Math.round(clampedProgress)}%</span>
        </div>
      </div>

      {/* Step list with auto-advancement */}
      <div className="space-y-2">
        {STATUS_STEPS.map((step, i) => {
          const isCompleted = i < stepIndex;
          const isCurrent = i === stepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-3 text-sm transition-all duration-500",
                isCompleted ? "text-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              {isCompleted ? (
                <div className="relative">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div className="absolute -inset-0.5 rounded-full bg-primary/10 animate-ping opacity-0" />
                </div>
              ) : isCurrent ? (
                <div className="relative">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                </div>
              ) : (
                <Icon className="h-5 w-5 opacity-40" />
              )}
              <span className={cn(isCurrent && "font-medium")}>{step.label}</span>
              {isCurrent && (
                <span className="text-xs text-primary animate-pulse ml-auto flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  处理中...
                </span>
              )}
              {isCompleted && (
                <span className="text-xs text-muted-foreground ml-auto">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational message */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground animate-pulse" key={messageIndex}>
          {currentMessage}
        </p>
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
