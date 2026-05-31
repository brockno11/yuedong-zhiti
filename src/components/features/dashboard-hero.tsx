"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DashboardHeroProps {
  studentName: string;
  avgScore: number;
  semester: string;
}

const gradeConfig: Record<string, { label: string; color: string }> = {
  excellent: { label: "优秀", color: "text-level-excellent" },
  good: { label: "良好", color: "text-level-good" },
  pass: { label: "及格", color: "text-level-pass" },
  improve: { label: "待提升", color: "text-level-improve" },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function getGradeLabel(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 60) return "pass";
  return "improve";
}

export function DashboardHero({
  studentName,
  avgScore,
  semester,
}: DashboardHeroProps) {
  const greeting = getGreeting();
  const grade = getGradeLabel(avgScore);
  const info = gradeConfig[grade];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {studentName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{semester}</span>
            <span className={info.color}>
              综合评分 {avgScore} 分 · {info.label}
            </span>
          </div>
        </div>

        <Link href="/record" className="shrink-0">
          <Button size="lg" className="h-12 gap-2 px-6 text-base shadow-sm">
            <PlusCircle className="h-5 w-5" />
            开始记录
          </Button>
        </Link>
      </div>
    </div>
  );
}
