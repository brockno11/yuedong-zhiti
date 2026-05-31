"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FITNESS_ITEMS } from "@/lib/constants";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {isOfficial ? "申请修改正式体测" : "编辑日常训练记录"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-muted text-muted-foreground" aria-label="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {isOfficial && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">
            修改正式体测数据需经体育教师审批。提交后将生成审批通知，教师审批通过后数据生效。
          </div>
        )}

        <div className="space-y-2.5">
          {record.items.map(item => {
            const def = FITNESS_ITEMS.find(f => f.id === item.itemId);
            return (
              <div key={item.itemId} className="flex items-center gap-2">
                <span className="text-sm min-w-[72px]">{def?.name ?? item.itemId}</span>
                <input
                  type="number"
                  className="h-9 w-full rounded-lg border px-2.5 text-sm"
                  value={scores[item.itemId] ?? item.value}
                  step={item.itemId.includes("run") || item.itemId === "sit_and_reach" ? 0.1 : 1}
                  onChange={e => setScores(prev => ({ ...prev, [item.itemId]: Number(e.target.value) }))}
                />
                <span className="text-xs text-muted-foreground w-8 text-right">{def?.unit ?? ""}</span>
              </div>
            );
          })}
        </div>

        {error && <p className="text-xs text-level-improve">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button className="flex-1 h-10 text-sm" onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : isOfficial ? "提交审批申请" : "保存修改"}
          </Button>
          <Button variant="ghost" className="h-10 text-sm" onClick={onClose}>取消</Button>
        </div>
      </div>
    </div>
  );
}
