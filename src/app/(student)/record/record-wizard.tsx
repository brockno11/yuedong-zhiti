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
import {
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { FitnessItemId, BodyFeeling } from "@/lib/types";

// 体力项目类别
const PHYSICAL_CATEGORIES = ["speed", "strength", "endurance"];

export function RecordWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<FitnessItemId[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feeling, setFeeling] = useState<BodyFeeling>({
    fatigueLevel: 5,
    recoveryStatus: "normal",
    hasSoreness: false,
    sorenessAreas: [],
    hasDiscomfort: false,
    discomfortNotes: "",
  });

  // 是否选择了体力项目
  const hasPhysicalItems = selectedItems.some((id) => {
    const item = FITNESS_ITEMS.find((i) => i.id === id);
    return item && PHYSICAL_CATEGORIES.includes(item.category);
  });

  // 动态步骤
  const STEPS = hasPhysicalItems
    ? ["选择项目", "输入成绩", "运动体感", "完成"]
    : ["选择项目", "输入成绩", "完成"];

  const toggleItem = useCallback((itemId: FitnessItemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((i) => i !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleScoreChange = useCallback((itemId: string, value: number) => {
    setScores((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleFeelingChange = useCallback((newFeeling: BodyFeeling) => {
    setFeeling(newFeeling);
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
      setStep(2); // 跳过体感，直接完成
    } else if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (!hasPhysicalItems && step === 2) {
        setStep(1);
      } else {
        setStep((s) => s - 1);
      }
    }
  };

  const currentStepLabel = STEPS[step];

  return (
    <>
      {/* 顶部导航 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      {/* 标题 + 进度 */}
      <div>
        <h1 className="text-2xl font-bold">体测记录</h1>
        <p className="mt-1 text-sm text-muted-foreground">{currentStepLabel}</p>
        <div className="mt-3 flex items-center gap-1">
          {STEPS.map((_s, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* 步骤卡片 */}
      <Card className="rounded-xl shadow-sm">
        {/* Step 0: 选择项目 */}
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">选择体测项目</CardTitle>
              <CardDescription>
                选择要记录的项目，可多选
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordProjectSelect
                selected={selectedItems}
                onToggle={toggleItem}
              />
            </CardContent>
          </>
        )}

        {/* Step 1: 输入成绩 */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">输入成绩</CardTitle>
              <CardDescription>
                滑动滚轮或点击快捷选项输入每项成绩
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordScoreInput
                selectedItems={selectedItems}
                scores={scores}
                onChange={handleScoreChange}
              />
            </CardContent>
          </>
        )}

        {/* Step 2: 运动体感（仅体力项目） */}
        {step === 2 && hasPhysicalItems && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">运动后体感</CardTitle>
              <CardDescription>
                记录运动后的身体感受，帮助 AI 了解你的恢复能力
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordFeelingStep
                feeling={feeling}
                onChange={handleFeelingChange}
              />
            </CardContent>
          </>
        )}

        {/* 完成步骤 */}
        {(step === 2 && !hasPhysicalItems) || step === 3 ? (
          <CardContent>
            <RecordComplete
              itemCount={selectedItems.length}
              hasPhysicalItems={hasPhysicalItems}
              onViewDashboard={() => router.push("/dashboard")}
            />
          </CardContent>
        ) : null}
      </Card>

      {/* 底部导航按钮 */}
      {step < STEPS.length - 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1 h-11"
          >
            <ChevronLeft className="h-4 w-4" />
            上一步
          </Button>

          <span className="text-xs text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>

          <Button onClick={handleNext} disabled={!canProceed()} className="gap-1 h-11">
            下一步
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
