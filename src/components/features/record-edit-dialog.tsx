"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FITNESS_ITEMS } from "@/lib/constants";
import { isEnduranceRun, formatRunTime, parseRunTime } from "@/lib/utils";
import type { FitnessRecord } from "@/lib/types";

interface RecordEditDialogProps {
  record: FitnessRecord;
  onClose: () => void;
  onSaved: () => void;
}

export function RecordEditDialog({ record, onClose, onSaved }: RecordEditDialogProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isOfficial = record.recordType === "official_test";

  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const i of record.items) initial[i.itemId] = i.value;
    setScores(initial);
  }, [record]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        role: isOfficial ? "teacher" : "student",
        items: record.items.map(i => ({ itemId: i.itemId, value: scores[i.itemId] || i.value })),
      };
      if (isOfficial) {
        // 正式体测：创建修改申请
        body._requestModification = true;
        body._originalRecordId = record.id;
      }
      const res = await fetch(`/api/fitness-records/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "保存失败" }));
        setError(err.error || "保存失败");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("网络错误");
    }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isOfficial ? "申请修改正式体测" : "编辑日常训练记录"}</DialogTitle>
        </DialogHeader>

        {isOfficial && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">
            修改正式体测数据需经体育教师审批。提交后将生成审批通知，教师审批通过后数据生效。
          </div>
        )}

        <div className="space-y-2.5">
          {record.items.map(item => {
            const def = FITNESS_ITEMS.find(f => f.id === item.itemId);
            const isRun = isEnduranceRun(item.itemId);
            const currentVal = scores[item.itemId] ?? item.value;

            return (
              <div key={item.itemId} className="flex items-center gap-2">
                <span className="text-sm min-w-[72px]">{def?.name ?? item.itemId}</span>
                {isRun ? (
                  <RunTimeInput
                    value={currentVal}
                    onChange={(v) => setScores(prev => ({ ...prev, [item.itemId]: v }))}
                  />
                ) : (
                  <>
                    <input
                      type="number"
                      className="h-9 w-full rounded-lg border px-2.5 text-sm"
                      value={currentVal}
                      step={item.itemId.includes("run") || item.itemId === "sit_and_reach" ? 0.1 : 1}
                      onChange={e => setScores(prev => ({ ...prev, [item.itemId]: Number(e.target.value) }))}
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">{def?.unit ?? ""}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-xs text-level-improve">{error}</p>}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : isOfficial ? "提交审批申请" : "保存修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 耐力跑时间输入组件（M:SS 格式） */
function RunTimeInput({ value, onChange }: { value: number; onChange: (_v: number) => void }) {
  const [text, setText] = useState(formatRunTime(value));
  const [error, setError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    // 支持 "3:50" 或纯数字（视为秒数）
    const parsed = parseRunTime(raw);
    if (parsed !== null) {
      onChange(parsed);
      setError(false);
    } else if (/^\d+$/.test(raw)) {
      // 纯数字视为秒数
      const sec = parseInt(raw, 10);
      if (sec >= 60 && sec < 600) {
        onChange(sec);
        setError(false);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-1 items-center gap-1.5">
      <input
        type="text"
        className={`h-9 w-full rounded-lg border px-2.5 text-sm tabular-nums ${error ? "border-destructive" : ""}`}
        value={text}
        placeholder="3:50"
        onChange={handleChange}
        onBlur={() => { setText(formatRunTime(value)); setError(false); }}
      />
      <span className="text-xs text-muted-foreground whitespace-nowrap">分:秒</span>
    </div>
  );
}
