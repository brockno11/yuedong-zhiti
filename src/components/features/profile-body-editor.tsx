"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ruler, Weight, Edit3, Check, X, AlertCircle } from "lucide-react";
import { calculateBMI, getBMIStatus } from "@/lib/validators";

interface ProfileBodyEditorProps {
  studentId: string;
  height: number;
  weight: number;
  bmi: number;
  age: number;
}

export function ProfileBodyEditor({ studentId, height, weight, bmi, age }: ProfileBodyEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editHeight, setEditHeight] = useState(String(height));
  const [editWeight, setEditWeight] = useState(String(weight));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBmi = editing ? calculateBMI(Number(editHeight) || height, Number(editWeight) || weight) : bmi;
  const currentHeight = editing ? (Number(editHeight) || height) : height;
  const currentWeight = editing ? (Number(editWeight) || weight) : weight;

  const startEdit = useCallback(() => {
    setEditHeight(String(height));
    setEditWeight(String(weight));
    setError(null);
    setEditing(true);
  }, [height, weight]);

  const cancelEdit = useCallback(() => {
    setEditHeight(String(height));
    setEditWeight(String(weight));
    setError(null);
    setEditing(false);
  }, [height, weight]);

  const saveEdit = useCallback(async () => {
    setError(null);
    const h = Number(editHeight);
    const w = Number(editWeight);

    if (!editHeight.trim() || !editWeight.trim()) {
      setError("身高和体重不能为空");
      return;
    }
    if (Number.isNaN(h) || Number.isNaN(w)) {
      setError("请输入有效数字");
      return;
    }
    if (h < 120 || h > 220) {
      setError("身高范围应在 120-220 cm 之间");
      return;
    }
    if (w < 25 || w > 150) {
      setError("体重范围应在 25-150 kg 之间");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: h, weight: w }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "保存失败，请稍后重试");
        setSaving(false);
        return;
      }
      setEditing(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError("网络请求失败，请检查网络后重试");
      setSaving(false);
    }
  }, [editHeight, editWeight, studentId, router]);

  // Height validation
  const heightOk = editHeight.trim() && !Number.isNaN(Number(editHeight)) && Number(editHeight) >= 120 && Number(editHeight) <= 220;
  const weightOk = editWeight.trim() && !Number.isNaN(Number(editWeight)) && Number(editWeight) >= 25 && Number(editWeight) <= 150;
  const canSave = heightOk && weightOk && !saving;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">基础身体数据</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={startEdit}>
            <Edit3 className="h-3 w-3" />
            编辑
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={cancelEdit} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary" onClick={saveEdit} disabled={!canSave}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Height */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              身高 (cm)
            </div>
            {editing ? (
              <Input
                type="number"
                inputMode="decimal"
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
                min={120}
                max={220}
                step={0.1}
                className="h-10 text-sm font-bold tabular-nums"
                placeholder="120-220"
              />
            ) : (
              <p className="text-lg font-bold tabular-nums">{currentHeight}</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Weight className="h-3.5 w-3.5" />
              体重 (kg)
            </div>
            {editing ? (
              <Input
                type="number"
                inputMode="decimal"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                min={25}
                max={150}
                step={0.1}
                className="h-10 text-sm font-bold tabular-nums"
                placeholder="25-150"
              />
            ) : (
              <p className="text-lg font-bold tabular-nums">{currentWeight}</p>
            )}
          </div>
        </div>

        {/* BMI */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">BMI (kg/m²)</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{currentBmi}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {currentBmi < 16.5 || currentBmi >= 28 ? "建议关注" : currentBmi >= 18.5 && currentBmi < 24 ? "常见范围" : "可关注"}
            </Badge>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {getBMIStatus(currentBmi, age)}
          </p>
        </div>

        {/* Data source note */}
        <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          学生自填数据，用于训练建议参考。正式体测中的身高体重数据不会因此变更。
        </p>
      </CardContent>
    </Card>
  );
}
