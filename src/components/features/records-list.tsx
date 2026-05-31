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

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "official_test", label: "正式体测" },
  { key: "daily_training", label: "日常训练" },
] as const;

// 正式体测按学期分组筛选
const SEMESTER_KEYS = ["全部学期", "2026春季", "2025秋季"] as const;

export function RecordsList({ records, gender }: { records: FitnessRecord[]; gender: "male" | "female" }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("全部学期");
  const [dailyMonthFilter, setDailyMonthFilter] = useState<string>("全部月份");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [localRecords, setLocalRecords] = useState(records);

  // 提取可用的月份
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const r of localRecords) {
      if (r.recordType === "daily_training") {
        const d = new Date(r.date);
        months.add(`${d.getFullYear()}年${d.getMonth() + 1}月`);
      }
    }
    return ["全部月份", ...Array.from(months).sort().reverse()];
  }, [localRecords]);

  const handleDelete = useCallback(async (recordId: string) => {
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/fitness-records/${recordId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "student" }) });
      if (res.ok) { setLocalRecords(prev => prev.filter(r => r.id !== recordId)); setConfirmId(null); router.refresh(); }
    } catch { /* ignore */ }
    setDeletingId(null);
  }, [router]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // 筛选
  const filtered = useMemo(() => {
    let items = filter === "all" ? localRecords : localRecords.filter(r => r.recordType === filter);
    if (filter === "official_test" || filter === "all") {
      items = items.filter(r => {
        if (r.recordType !== "official_test") return filter !== "official_test";
        if (semesterFilter === "全部学期") return true;
        return r.semester?.includes(semesterFilter) || r.batchName?.includes(semesterFilter);
      });
    }
    if (filter === "daily_training" || filter === "all") {
      items = items.filter(r => {
        if (r.recordType !== "daily_training") return filter !== "daily_training";
        if (dailyMonthFilter === "全部月份") return true;
        const d = new Date(r.date);
        return `${d.getFullYear()}年${d.getMonth() + 1}月` === dailyMonthFilter;
      });
    }
    return items;
  }, [localRecords, filter, semesterFilter, dailyMonthFilter]);

  return (
    <div className="space-y-4">
      {/* 类型筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 正式体测：学期筛选 */}
      {(filter === "all" || filter === "official_test") && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {SEMESTER_KEYS.map(s => (
            <button key={s} type="button" onClick={() => setSemesterFilter(s)}
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${semesterFilter === s ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 日常训练：月份筛选 */}
      {(filter === "all" || filter === "daily_training") && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {availableMonths.map(m => (
            <button key={m} type="button" onClick={() => setDailyMonthFilter(m)}
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${dailyMonthFilter === m ? "bg-blue-500/10 text-blue-600 font-medium" : "text-muted-foreground hover:bg-accent"}`}>
              {m}
            </button>
          ))}
        </div>
      )}

      {/* 记录列表 */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">暂无该类记录</div>
      ) : (
        filtered.map((record) => {
          const completeness = calculateRecordCompleteness(record.items.map(i => i.itemId), gender);
          const topItems = record.items.slice(0, 4);
          const avgScore = Math.round(record.items.reduce((sum, i) => sum + i.score, 0) / record.items.length);
          const isDaily = record.recordType === "daily_training";
          const isExpanded = expandedIds.has(record.id);

          return (
            <Card key={record.id} className="rounded-xl shadow-sm">
              <CardContent className="p-0">
                <button type="button" onClick={() => toggleExpand(record.id)} className="w-full p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />{formatTime(record.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isDaily ? (
                        <Badge className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 border-blue-200"><Dumbbell className="h-3 w-3" />日常训练</Badge>
                      ) : (
                        <Badge className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200"><GraduationCap className="h-3 w-3" />正式体测</Badge>
                      )}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {(record.batchName || record.semester) && (
                    <p className="text-xs text-muted-foreground mt-1">{record.batchName ?? record.semester}</p>
                  )}

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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{i.value}{FITNESS_ITEMS.find(f => f.id === i.itemId)?.unit ?? ""}</span>
                          <Badge variant={i.grade === "excellent" || i.grade === "good" ? "excellent" : "pass"} className="text-[10px]">{i.score}分 · {i.grade === "excellent" ? "优秀" : i.grade === "good" ? "良好" : i.grade === "pass" ? "及格" : "待提升"}</Badge>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                      <Link href="/portrait"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" />画像</Button></Link>
                      <Link href="/ai-guide"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><Sparkles className="h-3.5 w-3.5" />AI分析</Button></Link>

                      {isDaily && confirmId === record.id ? (
                        <div className="flex gap-1 ml-auto">
                          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDelete(record.id)} disabled={deletingId === record.id}>
                            {deletingId === record.id ? "删除中..." : "确认删除"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setConfirmId(null)}>取消</Button>
                        </div>
                      ) : isDaily ? (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmId(record.id)} aria-label="删除这条日常训练记录">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <div className="flex justify-center pt-2">
        <Link href="/record"><Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-4 w-4" />新增记录</Button></Link>
      </div>
    </div>
  );
}
