"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { WheelPicker } from "@/components/forms/wheel-picker";
import { cn } from "@/lib/utils";
import {
  SPORT_GOAL_OPTIONS,
  SPORT_BASE_OPTIONS,
  DISCOMFORT_OPTIONS,
} from "@/lib/constants";
import {
  ChevronRight,
  ChevronLeft,
  Activity,
  Heart,
  Check,
} from "lucide-react";
import type { OnboardingData, DiscomfortType, GradeLevel, Gender } from "@/lib/types";

const TOTAL_STEPS = 5;

const STEP_TITLES = ["基础信息", "身体数据", "运动目标", "运动基础", "健康状况"];

const GRADE_OPTIONS: { value: GradeLevel; label: string }[] = [
  { value: "高一", label: "高一" },
  { value: "高二", label: "高二" },
  { value: "高三", label: "高三" },
];

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: "male", label: "男生", icon: "👦" },
  { value: "female", label: "女生", icon: "👧" },
];

export function OnboardingSteps() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    grade: null,
    gender: null,
    age: null,
    height: null,
    weight: null,
    sportGoal: null,
    sportBase: null,
    discomforts: [],
  });

  const updateData = <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDiscomfort = (type: DiscomfortType) => {
    setData((prev) => {
      const current = prev.discomforts;
      if (type === "none") return { ...prev, discomforts: ["none"] };
      const filtered = current.filter((d) => d !== "none");
      if (filtered.includes(type)) {
        const newList = filtered.filter((d) => d !== type);
        return {
          ...prev,
          discomforts: newList.length === 0 ? ["none"] : newList,
        };
      }
      return { ...prev, discomforts: [...filtered, type] };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.grade && data.gender && data.age;
      case 1: return data.height && data.weight;
      case 2: return data.sportGoal;
      case 3: return data.sportBase;
      case 4: return data.discomforts.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem("onboardingData", JSON.stringify(data));
      router.push("/");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <>
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEP_TITLES.map((title, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden sm:inline text-xs font-medium",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {title}
              </span>
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-1.5" />
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{STEP_TITLES[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "请填写你的基本信息，帮助我们更好地了解你"}
            {step === 1 && "请填写你的身高和体重"}
            {step === 2 && "你想通过运动达到什么目标？"}
            {step === 3 && "你目前的运动习惯是怎样的？"}
            {step === 4 && "是否有需要老师特别关注的身体情况？"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Step 0: 基础信息 */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>年级</Label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateData("grade", opt.value)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all min-h-[48px]",
                        data.grade === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/30 hover:bg-accent"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>性别</Label>
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateData("gender", opt.value)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-4 text-center transition-all min-h-[48px]",
                        data.gender === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/30 hover:bg-accent"
                      )}
                    >
                      <span className="text-3xl block mb-1">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <WheelPicker
                  label="年龄"
                  value={data.age ?? 16}
                  onChange={(v) => updateData("age", v)}
                  min={15}
                  max={18}
                  step={1}
                  unit="岁"
                  quickOptions={[
                    { label: "15岁", value: 15 },
                    { label: "16岁", value: 16 },
                    { label: "17岁", value: 17 },
                    { label: "18岁", value: 18 },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Step 1: 身体数据 */}
          {step === 1 && (
            <div className="space-y-5">
              <WheelPicker
                label="身高"
                value={data.height ?? 165}
                onChange={(v) => updateData("height", v)}
                min={120}
                max={210}
                step={0.5}
                unit="cm"
                quickOptions={[
                  { label: "150cm", value: 150 },
                  { label: "160cm", value: 160 },
                  { label: "165cm", value: 165 },
                  { label: "170cm", value: 170 },
                  { label: "175cm", value: 175 },
                  { label: "180cm", value: 180 },
                ]}
              />
              <WheelPicker
                label="体重"
                value={data.weight ?? 55}
                onChange={(v) => updateData("weight", v)}
                min={30}
                max={120}
                step={0.5}
                unit="kg"
                quickOptions={[
                  { label: "40kg", value: 40 },
                  { label: "45kg", value: 45 },
                  { label: "50kg", value: 50 },
                  { label: "55kg", value: 55 },
                  { label: "60kg", value: 60 },
                  { label: "70kg", value: 70 },
                  { label: "80kg", value: 80 },
                ]}
              />
            </div>
          )}

          {/* Step 2: 运动目标 */}
          {step === 2 && (
            <div className="grid gap-3">
              {SPORT_GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateData("sportGoal", opt.value)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all min-h-[52px]",
                    data.sportGoal === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-accent"
                  )}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  {data.sportGoal === opt.value && (
                    <Check className="ml-auto h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: 运动基础 */}
          {step === 3 && (
            <div className="grid gap-3">
              {SPORT_BASE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateData("sportBase", opt.value)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all min-h-[52px]",
                    data.sportBase === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-accent"
                  )}
                >
                  <Activity className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>
                  {data.sportBase === opt.value && (
                    <Check className="ml-auto h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: 健康状况 */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                请告诉我们你需要老师关注的方面（可多选）。这些信息仅用于确保运动安全，不会公开显示。
              </p>
              <div className="grid gap-2">
                {DISCOMFORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDiscomfort(opt.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all min-h-[48px]",
                      data.discomforts.includes(opt.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-accent"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5 shrink-0",
                        data.discomforts.includes(opt.value)
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                    {data.discomforts.includes(opt.value) && (
                      <Check className="ml-auto h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 底部按钮 */}
      <div className="mt-6 flex items-center justify-between">
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
          {step + 1} / {TOTAL_STEPS}
        </span>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="gap-1 h-11"
        >
          {step === TOTAL_STEPS - 1 ? "完成" : "下一步"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
