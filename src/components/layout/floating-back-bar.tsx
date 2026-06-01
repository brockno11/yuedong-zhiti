// ===== 跃动智体 — 悬浮返回栏 =====
// 二级及以上页面复用的 sticky 返回栏，移动端优先设计
"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface FloatingBackBarProps {
  /** 点击返回按钮的回调 */
  onBack: () => void;
  /** 当前页面标题，支持动态切换 */
  title?: string;
  /** 右侧操作插槽 */
  action?: React.ReactNode;
  className?: string;
}

export function FloatingBackBar({ onBack, title, action, className }: FloatingBackBarProps) {
  return (
    <div
      className={cn(
        // 定位：sticky 顶部，安全区域适配
        "sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8",
        // 视觉：毛玻璃背景 + 底部分割线
        "border-b border-border/40 bg-background/80 backdrop-blur-xl",
        // 暗色适配
        "dark:bg-background/70 dark:border-white/[0.06]",
        className
      )}
      style={{ paddingTop: "max(0px, env(safe-area-inset-top, 0px))" }}
    >
      <div className="flex h-11 items-center gap-1.5 px-2">
        {/* 返回按钮 — 44px 触控目标 */}
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            "text-muted-foreground transition-colors",
            "hover:bg-muted/60 hover:text-foreground",
            "active:scale-95 transition-transform duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          )}
          aria-label="返回"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>

        {/* 标题 — 单行截断，淡入动画 */}
        {title && (
          <h1
            key={title}
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-semibold text-foreground",
              "animate-in fade-in slide-in-from-left-1 duration-200"
            )}
          >
            {title}
          </h1>
        )}

        {/* 右侧操作插槽 */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
