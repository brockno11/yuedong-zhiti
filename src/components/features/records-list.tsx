"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import { Clock, GraduationCap, Dumbbell, Sparkles, BarChart3, PlusCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { FitnessRecord } from "@/lib/types";

function itemName(id: string) { return FITNESS_ITEMS.find(f => f.id === id)?.name ?? id; }
function formatTime(dateStr: string): string {
  const d = new Date(dateStr); if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

// 正式体测按 batchId 分组
function groupOfficialRecords(records: FitnessRecord[]) {
  const groups: Record<string, { batchId: string; batchName: string; entries: FitnessRecord[]; allItems: FitnessRecord["items"] }> = {};
  const batchItemMap = new Map<string, Set<string>>();
  for (const r of records) {
    if (r.recordType !== "official_test") continue;
    const key = r.batchId || r.semester || "__unknown__";
    if (!groups[key]) { groups[key] = { batchId: key, batchName: r.batchName || r.semester || "正式体测", entries: [], allItems: [] }; batchItemMap.set(key, new Set()); }
    groups[key].entries.push(r);
    for (const i of r.items) { if (!batchItemMap.get(key)!.has(i.itemId)) { batchItemMap.get(key)!.add(i.itemId); groups[key].allItems.push(i); } }
  }
  return Object.values(groups);
}

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "official_test", label: "正式体测" },
  { key: "daily_training", label: "日常训练" },
] as const;

export function RecordsList({ records, gender }: { records: FitnessRecord[]; gender: "male" | "female" }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [expandedDaily, setExpandedDaily] = useState<Set<string>>(new Set());
  const [localRecords, setLocalRecords] = useState(records);

  // 分组正式体测
  const officialGroups = useMemo(() => groupOfficialRecords(localRecords), [localRecords]);
  const dailyRecords = useMemo(() => localRecords.filter(r => r.recordType === "daily_training"), [localRecords]);

  const handleDelete = useCallback(async (recordId: string) => {
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/fitness-records/${recordId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "student" }) });
      if (res.ok) { setLocalRecords(prev => prev.filter(r => r.id !== recordId)); setConfirmId(null); router.refresh(); }
    } catch { /* ignore */ }
    setDeletingId(null);
  }, [router]);

  const toggleBatch = (key: string) => { setExpandedBatches(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; }); };
  const toggleDaily = (id: string) => { setExpandedDaily(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const showBatches = filter === "all" || filter === "official_test";
  const showDaily = filter === "all" || filter === "daily_training";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== 正式体测批次 ===== */}
      {showBatches && officialGroups.length === 0 && (filter !== "daily_training" as string) && (
        <div className="py-6 text-center text-sm text-muted-foreground">暂无正式体测记录</div>
      )}
      {showBatches && officialGroups.map(group => {
        const completeness = calculateRecordCompleteness(group.allItems.map(i => i.itemId), gender);
        const avgScore = Math.round(group.allItems.reduce((sum, i) => sum + i.score, 0) / group.allItems.length);
        const isExpanded = expandedBatches.has(group.batchId);

        return (
          <Card key={`batch-${group.batchId}`} className="rounded-xl shadow-sm">
            <CardContent className="p-0">
              <button type="button" onClick={() => toggleBatch(group.batchId)} className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{group.batchName}</span>
                    <Badge variant="excellent" className="text-[10px]">正式体测</Badge>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{group.entries.length} 次录入</span>
                  <span>已录 {completeness.recordedCount}/{completeness.expectedCount} 项</span>
                  <span>完整度 {completeness.completionRate}%</span>
                  <span className="font-medium">均分 {avgScore}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {group.allItems.slice(0, 5).map(i => (
                    <Badge key={i.itemId} variant="outline" className="text-[10px]">{itemName(i.itemId)} {i.score}分</Badge>
                  ))}
                  {group.allItems.length > 5 && <span className="text-[10px] text-muted-foreground self-center">+{group.allItems.length - 5}</span>}
                </div>
                {completeness.missingItems.length > 0 && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">未录入：{completeness.missingItems.map(id => itemName(id)).join("、")}</p>
                )}
              </button>

              {isExpanded && (
                <div className="border-t px-4 py-3 space-y-3">
                  {/* 各次录入明细 */}
                  {group.entries.map(entry => (
                    <div key={entry.id} className="rounded-lg border p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(entry.date)}</span>
                        <span>{entry.items.length} 个项目</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.items.map(i => (
                          <Badge key={i.itemId} variant="outline" className="text-[10px]">{itemName(i.itemId)} {i.score}分</Badge>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* 操作 */}
                  <div className="flex gap-2 pt-1">
                    <Link href="/portrait"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" />查看画像</Button></Link>
                    <Link href="/ai-guide"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><Sparkles className="h-3.5 w-3.5" />AI分析</Button></Link>
                    {completeness.missingItems.length > 0 && (
                      <Link href="/record"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><PlusCircle className="h-3.5 w-3.5" />补充项目</Button></Link>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* ===== 日常训练 ===== */}
      {showDaily && dailyRecords.length === 0 && (filter !== "official_test" as string) && (
        <div className="py-6 text-center text-sm text-muted-foreground">暂无日常训练记录</div>
      )}
      {showDaily && dailyRecords.map(record => {
        const completeness = calculateRecordCompleteness(record.items.map(i => i.itemId), gender);
        const topItems = record.items.slice(0, 4);
        const avgScore = Math.round(record.items.reduce((sum, i) => sum + i.score, 0) / record.items.length);
        const isExpanded = expandedDaily.has(record.id);

        return (
          <Card key={record.id} className="rounded-xl shadow-sm">
            <CardContent className="p-0">
              <button type="button" onClick={() => toggleDaily(record.id)} className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />{formatTime(record.date)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] gap-1"><Dumbbell className="h-3 w-3" />日常训练</Badge>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {topItems.map(i => <Badge key={i.itemId} variant="outline" className="text-[10px]">{itemName(i.itemId)} {i.score}分</Badge>)}
                  {record.items.length > 4 && <span className="text-[10px] text-muted-foreground self-center">+{record.items.length - 4}</span>}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>已录 {completeness.recordedCount}/{completeness.expectedCount} 项</span>
                  <span>完整度 {completeness.completionRate}%</span>
                  <span className="font-medium">均分 {avgScore}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t px-4 py-3 space-y-2">
                  {record.items.map(i => (
                    <div key={i.itemId} className="flex items-center justify-between text-sm">
                      <span>{itemName(i.itemId)}</span>
                      <Badge variant={i.grade === "excellent" || i.grade === "good" ? "excellent" : "pass"} className="text-[10px]">{i.score}分 · {i.grade === "excellent" ? "优秀" : i.grade === "good" ? "良好" : i.grade === "pass" ? "及格" : "待提升"}</Badge>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <Link href="/portrait"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" />画像</Button></Link>
                    <Link href="/ai-guide"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><Sparkles className="h-3.5 w-3.5" />AI分析</Button></Link>

                    {confirmId === record.id ? (
                      <div className="flex gap-1 ml-auto">
                        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDelete(record.id)} disabled={deletingId === record.id}>
                          {deletingId === record.id ? "删除中..." : "确认删除"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setConfirmId(null)}>取消</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 ml-auto text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmId(record.id)} aria-label="删除这条日常训练记录">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-center pt-2">
        <Link href="/record"><Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-4 w-4" />新增记录</Button></Link>
      </div>
    </div>
  );
}
