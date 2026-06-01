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
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [batchItemCounts, setBatchItemCounts] = useState<Record<string, number>>({});
  const EXPECTED_COUNT = 6;
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

  // 加载批次列表 + 已有记录项目数（判断批次是否已完成）
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("demo_login") || "{}") as { studentId?: string; username?: string };
    const sid = login.studentId ?? login.username;
    if (sid) {
      fetch(`/api/fitness-records?studentId=${sid}`)
        .then(r => r.ok ? r.json() : null)
        .then((data: { data?: { batchId?: string; items?: { itemId: string }[] }[] } | null) => {
          if (data?.data) {
            const counts: Record<string, Set<string>> = {};
            for (const r of data.data) {
              if (r.batchId && r.items) {
                if (!counts[r.batchId]) counts[r.batchId] = new Set();
                for (const i of r.items) counts[r.batchId].add(i.itemId);
              }
            }
            const result: Record<string, number> = {};
            for (const [k, v] of Object.entries(counts)) result[k] = v.size;
            setBatchItemCounts(result);
          }
        }).catch(() => {});
    }
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

  // 进入成绩输入步骤时自动初始化默认值
  const scoreInitRef = useRef(false);
  const handleNextWithInit = () => {
    if (step === 1 && !scoreInitRef.current) {
      const pickerConfigs: Record<string, { min: number; max: number }> = {
        vital_capacity: { min: 2000, max: 5000 }, "50m_run": { min: 7, max: 10 },
        standing_long_jump: { min: 150, max: 250 }, sit_and_reach: { min: 0, max: 20 },
        pull_up: { min: 0, max: 15 }, sit_up: { min: 20, max: 50 },
        "800m_run": { min: 200, max: 300 }, "1000m_run": { min: 200, max: 350 },
      };
      setScores(prev => {
        const defaults: Record<string, number> = {};
        for (const id of selectedItems) {
          if (!prev[id] && pickerConfigs[id]) {
            defaults[id] = Math.round((pickerConfigs[id].min + pickerConfigs[id].max) / 2);
          }
        }
        return Object.keys(defaults).length > 0 ? { ...prev, ...defaults } : prev;
      });
      scoreInitRef.current = true;
    }
    handleNext();
  };

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
      case 0: return recordType === "daily_training" || (selectedBatchId !== "" && (batchItemCounts[selectedBatchId] ?? 0) < EXPECTED_COUNT);
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
      if (step === 2) scoreInitRef.current = false;
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
      setSaveError("保存失败，请检查网络后重试。");
      return;
    }

    const payload = await response.json() as { data?: { id?: string } };
    setSavedRecordId(payload.data?.id ?? null);
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
        {/* Step 0: 选择记录类型 */}
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">选择记录类型</CardTitle>
              <CardDescription>请选择本次记录的用途</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 正式体测入口 */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setRecordType("official_test"); setSelectedBatchId(""); }}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    recordType === "official_test"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/30 hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        正式体测数据
                        {recordType === "official_test" && <Badge variant="pass" className="text-[9px] py-0">需谨慎确认</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">用于录入学校统一体测成绩</p>
                      <p className="text-[11px] text-muted-foreground mt-1">请确认成绩无误后提交。提交后如需修改请联系体育教师更正。</p>
                    </div>
                  </div>
                </button>

                {/* 已选批次完成提示 */}
                {recordType === "official_test" && selectedBatchId && (batchItemCounts[selectedBatchId] ?? 0) >= EXPECTED_COUNT && (
                  <div className="rounded-xl border border-level-excellent/30 bg-level-excellent/5 p-3 text-sm text-level-excellent">
                    该批次已完整记录 {batchItemCounts[selectedBatchId]}/{EXPECTED_COUNT} 项。
                    如需修改数据，请联系体育教师在教师端操作。
                  </div>
                )}

                {/* 正式批次选择 */}
                {recordType === "official_test" && (
                  <div className="ml-2 pl-4 border-l-2 border-primary/20 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">选择体测批次</p>
                    {batches.filter(b => b.type !== "daily").length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">暂无可录入的正式体测批次</p>
                    )}
                    {batches.filter(b => b.type !== "daily").map((batch) => {
                      const complete = (batchItemCounts[batch.id] ?? 0) >= EXPECTED_COUNT;
                      return (
                        <button key={batch.id} type="button"
                          onClick={() => !complete && setSelectedBatchId(batch.id)}
                          disabled={complete}
                          className={cn("w-full rounded-lg border p-2.5 text-left text-xs transition-colors",
                            complete ? "border-muted bg-muted/30 opacity-60 cursor-not-allowed" :
                            selectedBatchId === batch.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent")}>
                          <span className="font-medium">{batch.name}</span>
                          <Badge variant={complete ? "excellent" : batch.status === "active" ? "excellent" : "secondary"} className="text-[9px] ml-2">
                            {complete ? "已完成" : batch.status === "active" ? "进行中" : "已归档"}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 分隔 */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground">或</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* 日常训练入口 */}
              <button
                type="button"
                onClick={() => { setRecordType("daily_training"); setSelectedBatchId(""); }}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  recordType === "daily_training"
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-border hover:border-blue-300 hover:bg-blue-50/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <Dumbbell className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      日常训练记录
                      {recordType === "daily_training" && <Badge variant="excellent" className="text-[9px] py-0">可随时更新</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">用于记录平时练习和阶段变化</p>
                    <p className="text-[11px] text-muted-foreground mt-1">练习数据可随时补充或更新，体育教师也可协助调整。</p>
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
              <CardTitle className="text-lg">
                {recordType === "daily_training" ? "选择训练记录项目" : "选择正式体测项目"}
              </CardTitle>
              <CardDescription>
                {recordType === "daily_training"
                  ? "可记录阶段性练习表现"
                  : "请按实际测试成绩录入，确认无误后提交"}
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
              selectedItems={selectedItems}
              recordType={recordType}
              savedRecordId={savedRecordId}
              isSaving={isSaving}
              hasSaveError={Boolean(saveError)}
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
          <Button onClick={handleNextWithInit} disabled={!canProceed()} className="gap-1 h-11">
            下一步
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
