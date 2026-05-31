"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import { Clock, Dumbbell, GraduationCap, BarChart3, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { FitnessRecord } from "@/lib/types";

function itemName(id: string) { return FITNESS_ITEMS.find(f => f.id === id)?.name ?? id; }

function formatRecordTime(dateStr: string): string {
  const d = new Date(dateStr); if (Number.isNaN(d.getTime())) return dateStr;
  const now = new Date(); const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return isToday ? `今天 ${time}` : `${d.getMonth() + 1}月${d.getDate()}日 ${time}`;
}

export function RecentRecordCard({ record, gender }: { record: FitnessRecord; gender: "male" | "female" }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const completeness = calculateRecordCompleteness(record.items.map(i => i.itemId), gender);
  const topItems = record.items.slice(0, 4);
  const isDaily = record.recordType === "daily_training";

  if (deleted) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          记录已删除。<button type="button" className="text-primary underline ml-1" onClick={() => router.refresh()}>刷新</button>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/fitness-records/${record.id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student" }),
      });
      if (res.ok) { setDeleted(true); router.refresh(); }
    } catch { /* ignore */ }
    setDeleting(false);
    setConfirm(false);
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />最近记录 · {formatRecordTime(record.date)}
          </div>
          <Badge variant={isDaily ? "secondary" : "excellent"} className="text-[10px] gap-1">
            {isDaily ? <Dumbbell className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
            {isDaily ? "日常训练" : "正式体测"}
          </Badge>
        </div>

        {(record.batchName || record.semester) && (
          <p className="text-xs text-muted-foreground">{record.batchName ?? record.semester}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {topItems.map(item => (
            <Badge key={item.itemId} variant="outline" className="text-[10px]">{itemName(item.itemId)} {item.score}分</Badge>
          ))}
          {record.items.length > 4 && <span className="text-[10px] text-muted-foreground self-center">+{record.items.length - 4}</span>}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>已录 {completeness.recordedCount}/{completeness.expectedCount} 项</span>
          <span>完整度 {completeness.completionRate}%</span>
        </div>

        {/* 正式体测提示 */}
        {!isDaily && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />正式体测数据如需更正，请联系体育教师
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Link href="/portrait"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" />画像</Button></Link>
          <Link href="/ai-guide"><Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><Sparkles className="h-3.5 w-3.5" />AI分析</Button></Link>

          {isDaily && !confirm && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => setConfirm(true)} aria-label="删除这条日常训练记录">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {isDaily && confirm && (
            <div className="flex gap-1 ml-auto">
              <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={handleDelete} disabled={deleting}>
                {deleting ? "删除中..." : "确认删除"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setConfirm(false)}>取消</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
