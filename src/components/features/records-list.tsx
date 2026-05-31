"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import { Clock, GraduationCap, Dumbbell, Sparkles, BarChart3, PlusCircle, Trash2, AlertTriangle } from "lucide-react";
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

export function RecordsList({ records, gender }: { records: FitnessRecord[]; gender: "male" | "female" }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [localRecords, setLocalRecords] = useState(records);
  const filtered = filter === "all" ? localRecords : localRecords.filter(r => r.recordType === filter);

  const handleDelete = useCallback(async (recordId: string) => {
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/fitness-records/${recordId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student" }),
      });
      if (res.ok) {
        setLocalRecords(prev => prev.filter(r => r.id !== recordId));
        setConfirmId(null);
        router.refresh();
      }
    } catch { /* ignore */ }
    setDeletingId(null);
  }, [router]);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">暂无该类记录</div>
      ) : (
        filtered.map((record) => {
          const completeness = calculateRecordCompleteness(record.items.map(i => i.itemId), gender);
          const topItems = record.items.slice(0, 4);
          const avgScore = Math.round(record.items.reduce((sum, i) => sum + i.score, 0) / record.items.length);
          const isOfficial = record.recordType === "official_test";
          const isDaily = record.recordType === "daily_training";

          return (
            <Card key={record.id} className="rounded-xl shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />{formatTime(record.date)}
                  </div>
                  <Badge variant={isDaily ? "secondary" : "excellent"} className="text-[10px] gap-1">
                    {isDaily ? <Dumbbell className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                    {isDaily ? "日常训练" : "正式体测"}
                  </Badge>
                </div>
                {(record.batchName || record.semester) && <p className="text-xs text-muted-foreground">{record.batchName ?? record.semester}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {topItems.map(item => (
                    <Badge key={item.itemId} variant="outline" className="text-[10px]">{itemName(item.itemId)} {item.score}分</Badge>
                  ))}
                  {record.items.length > 4 && <span className="text-[10px] text-muted-foreground self-center">+{record.items.length - 4}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>已录 {completeness.recordedCount}/{completeness.expectedCount} 项</span>
                  <span>完整度 {completeness.completionRate}%</span>
                  <span className="font-medium">均分 {avgScore}</span>
                </div>

                {isOfficial && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />正式体测数据如需更正，请联系体育教师
                  </div>
                )}

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
              </CardContent>
            </Card>
          );
        })
      )}

      <div className="flex justify-center pt-2">
        <Link href="/record"><Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-4 w-4" />新增记录</Button></Link>
      </div>
    </>
  );
}
