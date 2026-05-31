"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import { Clock, GraduationCap, Dumbbell, Sparkles, BarChart3, PlusCircle } from "lucide-react";
import Link from "next/link";
import type { FitnessRecord } from "@/lib/types";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "official_test", label: "正式体测" },
  { key: "daily_training", label: "日常训练" },
] as const;

export function RecordsList({ records, gender }: { records: FitnessRecord[]; gender: "male" | "female" }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? records : records.filter(r => r.recordType === filter);

  return (
    <>
      {/* 筛选标签 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
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

          return (
            <Card key={record.id} className="rounded-xl shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />{formatTime(record.date)}
                  </div>
                  <Badge variant={record.recordType === "daily_training" ? "secondary" : "excellent"} className="text-[10px] gap-1">
                    {record.recordType === "daily_training" ? <Dumbbell className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                    {record.recordType === "daily_training" ? "日常训练" : "正式体测"}
                  </Badge>
                </div>
                {(record.batchName || record.semester) && (
                  <p className="text-xs text-muted-foreground">{record.batchName ?? record.semester}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {topItems.map(item => (
                    <Badge key={item.itemId} variant="outline" className="text-[10px]">
                      {FITNESS_ITEMS.find(d => d.id === item.itemId)?.name ?? item.itemId} {item.score}分
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>已录 {completeness.recordedCount}/{completeness.expectedCount} 项</span>
                  <span>完整度 {completeness.completionRate}%</span>
                  <span className="font-medium">均分 {avgScore}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link href="/portrait"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" />查看画像</Button></Link>
                  <Link href="/ai-guide"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><Sparkles className="h-3.5 w-3.5" />AI分析</Button></Link>
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
