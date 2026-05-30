"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface RecordCompleteProps {
  itemCount: number;
  hasPhysicalItems: boolean;
  onViewDashboard: () => void;
}

export function RecordComplete({ itemCount, hasPhysicalItems, onViewDashboard }: RecordCompleteProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleViewDashboard = () => {
    setIsTransitioning(true);
    // 模拟 AI 分析进度
    let p = 0;
    const timer = setInterval(() => {
      p += 15;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        onViewDashboard();
      }
    }, 200);
  };

  if (isTransitioning) {
    return (
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-bold">AI 正在更新体质画像</h3>
          <p className="text-sm text-muted-foreground mt-1">
            正在根据最新数据进行分析...
          </p>
        </div>
        <Progress value={progress} className="h-2 w-3/4 mx-auto" />
        <p className="text-xs text-muted-foreground">
          AI生成内容需经体育教师审核后使用
        </p>
      </div>
    );
  }

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
              AI 正在根据你的最新数据更新体质画像和训练建议
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            AI 生成内容需经体育教师审核后使用
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={handleViewDashboard} className="gap-1.5 h-11">
          AI 生成体质分析
          <Sparkles className="h-4 w-4" />
        </Button>
        <Link href="/ai-guide">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            查看 AI 指导
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full">
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
