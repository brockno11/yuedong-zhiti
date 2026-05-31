"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DashboardHeroProps {
  studentName: string;
  avgScore: number;
  semester: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function getGradeLabel(score: number): string {
  if (score >= 90) return "优秀";
  if (score >= 80) return "良好";
  if (score >= 60) return "及格";
  return "待提升";
}

export function DashboardHero({ studentName, avgScore }: DashboardHeroProps) {
  const greeting = getGreeting();
  const gradeLabel = getGradeLabel(avgScore);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5 sm:p-6">
      <p className="text-sm text-muted-foreground">{greeting}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{studentName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        综合评分 {avgScore} 分 · {gradeLabel} · 今天可以记录一次体测
      </p>

      <Link href="/record" className="mt-4 inline-block w-full sm:w-auto">
        <Button size="lg" className="h-12 w-full gap-2 text-base shadow-sm sm:w-auto">
          <PlusCircle className="h-5 w-5" />
          开始记录
        </Button>
      </Link>
    </div>
  );
}
