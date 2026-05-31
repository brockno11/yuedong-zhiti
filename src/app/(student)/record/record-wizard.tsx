"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FITNESS_ITEMS } from "@/lib/constants";
import { RecordProjectSelect } from "@/components/features/record-project-select";
import { RecordScoreInput } from "@/components/features/record-score-input";
import { RecordFeelingStep } from "@/components/features/record-feeling-step";
import { RecordComplete } from "@/components/features/record-complete";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { FitnessItemId, BodyFeeling } from "@/lib/types";

const PHYSICAL_CATEGORIES = ["speed", "strength", "endurance"];

export function RecordWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<FitnessItemId[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  // 逐项体感
  const [feelings, setFeelings] = useState<Partial<Record<FitnessItemId, BodyFeeling>>>({});
  const [overallDiscomfort, setOverallDiscomfort] = useState({
    hasDiscomfort: false,
    discomfortNotes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const hasPhysicalItems = selectedItems.some((id) => {
    const item = FITNESS_ITEMS.find((i) => i.id === id);
    return item && PHYSICAL_CATEGORIES.includes(item.category);
  });

  const STEPS = hasPhysicalItems
    ? ["选择项目", "输入成绩", "逐项体感", "完成"]
    : ["选择项目", "输入成绩", "完成"];

  const toggleItem = useCallback((itemId: FitnessItemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleScoreChange = useCallback((itemId: string, value: number) => {
    setScores((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleFeelingChange = useCallback((itemId: FitnessItemId, feeling: BodyFeeling) => {
    setFeelings((prev) => ({ ...prev, [itemId]: feeling }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0: return selectedItems.length > 0;
      case 1: return selectedItems.every((id) => scores[id] && scores[id] > 0);
      default: return true;
    }
  };

  const handleNext = () => {
    if (!hasPhysicalItems && step === 1) {
      setStep(2);
    } else if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (!hasPhysicalItems && step === 2) setStep(1);
      else setStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    const rawLogin = localStorage.getItem("demo_login");
    const login = rawLogin ? JSON.parse(rawLogin) as { studentId?: string; username?: string } : null;
    const firstFeeling = Object.values(feelings)[0];

    const response = await fetch("/api/fitness-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: login?.studentId ?? login?.username,
        items: selectedItems.map((itemId) => ({
          itemId,
          value: scores[itemId],
        })),
        bodyFeeling: {
          fatigueLevel: firstFeeling?.fatigueLevel ?? 3,
          recoveryStatus: firstFeeling?.recoveryStatus ?? "normal",
          hasSoreness: firstFeeling?.hasSoreness ?? false,
          sorenessAreas: firstFeeling?.sorenessAreas ?? [],
          hasDiscomfort: overallDiscomfort.hasDiscomfort || (firstFeeling?.hasDiscomfort ?? false),
          discomfortNotes: overallDiscomfort.discomfortNotes || firstFeeling?.discomfortNotes || "",
        },
      }),
    });

    if (!response.ok) {
      setIsSaving(false);
      return;
    }

    localStorage.removeItem("ai_analysis_cache");
    router.push("/dashboard");
  };

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">体测记录</h1>
        <p className="mt-1 text-sm text-muted-foreground">{STEPS[step]}</p>
        <div className="mt-3 flex items-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
      </div>

      <Card className="rounded-xl shadow-sm">
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">选择体测项目</CardTitle>
              <CardDescription>选择要记录的项目，可多选</CardDescription>
            </CardHeader>
            <CardContent>
              <RecordProjectSelect selected={selectedItems} onToggle={toggleItem} />
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">输入成绩</CardTitle>
              <CardDescription>滑动滚轮或点击快捷选项输入每项成绩</CardDescription>
            </CardHeader>
            <CardContent>
              <RecordScoreInput selectedItems={selectedItems} scores={scores} onChange={handleScoreChange} />
            </CardContent>
          </>
        )}

        {step === 2 && hasPhysicalItems && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">逐项运动体感</CardTitle>
              <CardDescription>每个项目的感受不同，请逐一反馈</CardDescription>
            </CardHeader>
            <CardContent>
              <RecordFeelingStep
                selectedItems={selectedItems}
                feelings={feelings}
                overallDiscomfort={overallDiscomfort}
                onChangeItem={handleFeelingChange}
                onChangeDiscomfort={setOverallDiscomfort}
              />
            </CardContent>
          </>
        )}

        {(step === 2 && !hasPhysicalItems) || step === 3 ? (
          <CardContent>
            <RecordComplete
              itemCount={selectedItems.length}
              hasPhysicalItems={hasPhysicalItems}
              onViewDashboard={handleComplete}
            />
            {isSaving && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                正在保存到本地数据库...
              </p>
            )}
          </CardContent>
        ) : null}
      </Card>

      {step < STEPS.length - 1 && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={step === 0} className="gap-1 h-11">
            <ChevronLeft className="h-4 w-4" />
            上一步
          </Button>
          <span className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</span>
          <Button onClick={handleNext} disabled={!canProceed()} className="gap-1 h-11">
            下一步
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
