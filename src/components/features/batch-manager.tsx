"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, GraduationCap, Dumbbell, RefreshCw, Archive, Check, ChevronDown, ChevronUp } from "lucide-react";

interface BatchItem {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  round: number;
  type: string;
  status: string;
  recordCount?: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: "进行中",
  completed: "已完成",
  archived: "已归档",
  draft: "草稿",
};

const STATUS_VARIANTS: Record<string, "excellent" | "pass" | "secondary" | "outline"> = {
  active: "excellent",
  completed: "pass",
  archived: "secondary",
  draft: "outline",
};

const emptyForm = { name: "", academicYear: "2024-2025", semester: "春季", round: 1, type: "official" };

export function BatchManager() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch("/api/batches");
      if (res.ok) setBatches(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const createNew = async () => {
    if (!form.name || !form.academicYear || !form.semester) return;
    setSaving(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg({ type: "success", text: `批次"${form.name}"创建成功` });
        setForm(emptyForm);
        setShowForm(false);
        fetchBatches();
      } else {
        const err = await res.json();
        setMsg({ type: "error", text: err.error || "创建失败" });
      }
    } catch {
      setMsg({ type: "error", text: "网络错误" });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (batchId: string, status: string) => {
    try {
      const res = await fetch(`/api/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMsg({ type: "success", text: "状态更新成功" });
        fetchBatches();
      }
    } catch {
      setMsg({ type: "error", text: "操作失败" });
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">批次管理</span>
          <Badge variant="secondary" className="text-[10px]">{batches.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {msg && (
            <div className={`rounded-lg p-2.5 text-xs ${msg.type === "success" ? "bg-level-excellent/10 text-level-excellent" : "bg-level-improve/10 text-level-improve"}`}>
              {msg.text}
            </div>
          )}

          {/* 批次列表 */}
          {batches.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{b.name}</span>
                  {b.type === "daily" ? <Dumbbell className="h-3 w-3 text-blue-500" /> : <GraduationCap className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {b.academicYear} · {b.semester} · 第{b.round}次
                  {b.recordCount !== undefined && <span className="ml-2">· {b.recordCount} 条记录</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={STATUS_VARIANTS[b.status] ?? "outline"} className="text-[10px]">{STATUS_LABELS[b.status] ?? b.status}</Badge>
                {b.status !== "active" && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-0.5" onClick={() => changeStatus(b.id, "active")} title="激活">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                {b.status === "active" && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-0.5" onClick={() => changeStatus(b.id, "completed")} title="完成">
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {(b.status === "completed" || b.status === "active") && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-0.5" onClick={() => changeStatus(b.id, "archived")} title="归档">
                    <Archive className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* 创建表单 */}
          {showForm ? (
            <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
              <p className="text-sm font-semibold">新建批次</p>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">批次名称 *</Label><Input className="h-8 text-xs" placeholder="如 2025春季第2次体测" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">学年 *</Label><Input className="h-8 text-xs" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} /></div>
                <div><Label className="text-xs">学期 *</Label>
                  <select className="h-8 w-full rounded-md border text-xs px-2 bg-background" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                    <option value="春季">春季</option><option value="秋季">秋季</option><option value="上学期">上学期</option><option value="下学期">下学期</option>
                  </select>
                </div>
                <div><Label className="text-xs">轮次</Label><Input className="h-8 text-xs" type="number" min={1} value={form.round} onChange={e => setForm({ ...form, round: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">类型</Label>
                  <select className="h-8 w-full rounded-md border text-xs px-2 bg-background" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="official">正式体测</option><option value="makeup">补测</option><option value="daily">日常训练</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="h-8 text-xs gap-1" onClick={createNew} disabled={saving}><Plus className="h-3 w-3" />{saving ? "创建中..." : "创建"}</Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowForm(false)}>取消</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1" onClick={() => setShowForm(true)}><Plus className="h-3 w-3" />新建批次</Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
