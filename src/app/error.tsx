"use client";

// ===== 跃动智体 — 全局错误边界 =====
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error; // used for logging in production
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h2 className="text-xl font-bold">页面出错了</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          抱歉，加载页面时出现了问题。请尝试刷新页面。
        </p>
        <Button onClick={reset} className="mt-5">
          重试
        </Button>
      </div>
    </div>
  );
}
