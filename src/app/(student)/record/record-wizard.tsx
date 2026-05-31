"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FITNESS_ITEMS } from "@/lib/constants";
import { RecordProjectSelect } from "@/components/features/record-project-select";
import { RecordScoreInput } from "@/components/features/record-score-input";
import { RecordFeelingStep, type ItemFeedbackAnswer } from "@/components/features/record-feeling-step";
import { RecordComplete } from "@/components/features/record-complete";
import { ChevronRight, ChevronLeft, GraduationCap, Dumbbell } from "lucide-react";
import type { FitnessItemId } from "@/lib/types";

const PHYSICAL_CATEGORIES = ["speed", "strength", "endurance"];

interface BatchOption {
  id: string;
  name: string;
  type: string;
  status: string;
}

export function RecordWizard() {
  const [step, setStep] = useState(0);
  // 批次选择
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [recordType, setRecordType] = useState<"official_test" | "daily_training">("official_test");
  // 项目选择
  const [selectedItems, setSelectedItems] = useState<FitnessItemId[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [itemFeedbacks, setItemFeedbacks] = useState<ItemFeedbackAnswer[]>([]);
  const [overallDiscomfort, setOverallDiscomfort] = useState({
    hasDiscomfort: false,
    discomfortNotes: "",
  });
  const [studentGender, setStudentGender] = useState<"male" | "female">("male");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const savedRef = useRef(false);

  // 读取当前学生性别
  useEffect(() => {
    const rawLogin = localStorage.getItem("demo_login");
    if (rawLogin) {
      const login = JSON.parse(rawLogin) as { gender?: string };
      if (login.gender === "male" || login.gender === "female") {
        setStudentGender(login.gender);
      }
    }
  }, []);

  // 加载批次列表
  useEffect(() => {
    fetch("/api/batches")
      .then(r => r.json())
      .then((data: BatchOption[]) => {
        setBatches(data);
        const active = data.find(b => b.status === "active");
        if (active) setSelectedBatchId(active.id);
      })
      .catch(() => {});
  }, []);

  const hasPhysicalItems = selectedItems.some((id) => {
    const item = FITNESS_ITEMS.find((i) => i.id === id);
    return item && PHYSICAL_CATEGORIES.includes(item.category);
  });

  // 步骤：batch(0) → items(1) → scores(2) → feeling(3?) → complete
  const STEPS = hasPhysicalItems
    ? ["选择批次", "选择项目", "输入成绩", "逐项体感", "完成"]
    : ["选择批次", "选择项目", "输入成绩", "完成"];

  const toggleItem = useCallback((itemId: FitnessItemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleScoreChange = useCallback((itemId: string, value: number) => {
    setScores((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleFeelingChange = useCallback((itemId: FitnessItemId, answers: Record<string, string | number | boolean>) => {
    setItemFeedbacks((prev) => {
      const existing = prev.findIndex(f => f.itemId === itemId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { itemId, answers };
        return next;
      }
      return [...prev, { itemId, answers }];
    });
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0: return selectedBatchId !== "" || recordType === "daily_training";
      case 1: return selectedItems.length > 0;
      case 2: return selectedItems.every((id) => scores[id] && scores[id] > 0);
      default: return true;
    }
  };

  const handleNext = () => {
    if (!hasPhysicalItems && step === 2) {
      setStep(3); // skip feeling, go to complete
    } else if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (!hasPhysicalItems && step === 3) setStep(2);
      else setStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    const rawLogin = localStorage.getItem("demo_login");
    const login = rawLogin ? JSON.parse(rawLogin) as { studentId?: string; username?: string } : null;

    const response = await fetch("/api/fitness-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: login?.studentId ?? login?.username,
        batchId: selectedBatchId || undefined,
        recordType: recordType,
        items: selectedItems.map((itemId) => ({
          itemId,
          value: scores[itemId],
          feedbackJson: JSON.stringify(itemFeedbacks.find(f => f.itemId === itemId)?.answers ?? {}),
        })),
        bodyFeeling: {
          fatigueLevel: 3,
          recoveryStatus: "normal" as const,
          hasSoreness: false,
          sorenessAreas: [] as string[],
          hasDiscomfort: overallDiscomfort.hasDiscomfort,
          discomfortNotes: overallDiscomfort.discomfortNotes,
        },
      }),
    });

    if (!response.ok) {
      setIsSaving(false);
      savedRef.current = true;
      setSaveError("保存失败，请检查网络后重试。");
      return;
    }

    localStorage.removeItem("ai_analysis_cache");
    setIsSaving(false);
    savedRef.current = true;
    setSaveError("");
  };

  const completionStep = hasPhysicalItems ? 4 : 3;
  useEffect(() => {
    if (step === completionStep && !savedRef.current && !isSaving) {
      handleComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, completionStep, isSaving]);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  return (
    <>
      <Link
        href="/dashboard"
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
        {/* Step 0: 选择批次 */}
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">选择体测批次</CardTitle>
              <CardDescription>请选择本次记录所属的体测批次</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => { setSelectedBatchId(batch.id); setRecordType("official_test"); }}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all",
                      selectedBatchId === batch.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/30 hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        batch.type === "daily" ? "bg-blue-500/10" : "bg-primary/10"
                      )}>
                        {batch.type === "daily" ? (
                          <Dumbbell className="h-5 w-5 text-blue-500" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{batch.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {batch.type === "daily" ? "日常训练" : batch.status === "archived" ? "正式体测 · 已归档" : "正式体测"}
                        </p>
                      </div>
                      <Badge variant={batch.status === "active" ? "excellent" : "secondary"} className="text-[10px]">
                        {batch.status === "active" ? "进行中" : batch.status === "archived" ? "已归档" : batch.status}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">暂无可用批次，将以独立记录方式保存</p>
              )}

              {/* 日常训练快捷入口 */}
              <button
                type="button"
                onClick={() => { setSelectedBatchId(""); setRecordType("daily_training"); }}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  recordType === "daily_training"
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-dashed border-muted-foreground/30 hover:border-blue-300 hover:bg-blue-50/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <Dumbbell className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">日常训练记录</p>
                    <p className="text-xs text-muted-foreground">不绑定正式体测批次，用于训练过程追踪</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </>
        )}

        {/* Step 1: 选择项目 */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">选择体测项目</CardTitle>
              <CardDescription>
                {recordType === "daily_training"
                  ? "日常训练 — 选择要记录的项目"
                  : `批次：${selectedBatch?.name ?? "—"} — 选择项目，可多选`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordProjectSelect selected={selectedItems} onToggle={toggleItem} gender={studentGender} />
            </CardContent>
          </>
        )}

        {/* Step 2: 输入成绩 */}
        {step === 2 && (
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

        {/* Step 3: 体感 */}
        {step === 3 && hasPhysicalItems && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">逐项运动体感</CardTitle>
              <CardDescription>每个项目的感受不同，请逐一反馈</CardDescription>
            </CardHeader>
            <CardContent>
              <RecordFeelingStep
                selectedItems={selectedItems}
                itemFeedbacks={itemFeedbacks}
                overallDiscomfort={overallDiscomfort}
                onChangeItem={handleFeelingChange}
                onChangeDiscomfort={setOverallDiscomfort}
              />
            </CardContent>
          </>
        )}

        {/* 完成 */}
        {(step === 3 && !hasPhysicalItems) || step === 4 ? (
          <CardContent>
            {saveError && (
              <div className="mb-4 rounded-xl border border-level-improve/30 bg-level-improve/5 p-3 text-sm text-level-improve">
                {saveError}
              </div>
            )}
            <RecordComplete
              itemCount={selectedItems.length}
              hasPhysicalItems={hasPhysicalItems}
            />
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
