"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar, Activity } from "lucide-react";
import { FITNESS_ITEMS } from "@/lib/constants";
import type { FitnessRecord } from "@/lib/types";

interface TrainingObservationProps {
  dailyRecords: FitnessRecord[];
  daily7d: number;
  daily30d: number;
}

function itemName(id: string): string {
  return FITNESS_ITEMS.find((item) => item.id === id)?.name ?? id;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function getTrainingRhythm(daily30d: number, _daily7d: number): { label: string; description: string } {
  if (daily30d >= 8) return { label: "稳定", description: "近30天训练频率良好，已建立较稳定的训练习惯" };
  if (daily30d >= 5) return { label: "适中", description: "训练频率适中，保持当前节奏可逐步提升体能" };
  if (daily30d >= 3) return { label: "偏少", description: "训练频率偏低，建议逐步增加至每周至少3次" };
  if (daily30d > 0) return { label: "待加强", description: "训练尚不规律，建议从每周2-3次轻量训练开始建立习惯" };
  return { label: "待建立", description: "近30天暂无训练记录，建议尽快开始规律锻炼" };
}

function getItemDistribution(records: FitnessRecord[]): { trained: string[]; untrained: string[] } {
  const itemCounts = new Map<string, number>();
  for (const record of records) {
    for (const item of record.items) {
      itemCounts.set(item.itemId, (itemCounts.get(item.itemId) ?? 0) + 1);
    }
  }
  // Items from records that are standard fitness items
  const standardIds = records.flatMap(r => r.items.map(i => i.itemId));
  const uniqueStandard = Array.from(new Set(standardIds));

  const trained = uniqueStandard
    .filter(id => (itemCounts.get(id) ?? 0) >= 2)
    .map(itemName);
  const untrained = uniqueStandard
    .filter(id => (itemCounts.get(id) ?? 0) < 2)
    .map(itemName);

  return { trained, untrained };
}

function getLightAdvice(daily7d: number, daily30d: number, rhythm: { label: string; description: string }, distribution: { trained: string[]; untrained: string[] }, latestFatigue: number | null): string {
  if (daily30d === 0) return "建议从每周2-3次轻量训练开始，建立训练习惯。可以从慢跑、跳绳等低门槛项目入手。";
  if (rhythm.label === "待加强" || rhythm.label === "待建立") return "建议逐步增加训练频率，目标是每周至少3次、每次15-20分钟。";
  if (distribution.untrained.length > 0) {
    const advice = `近期训练集中在${distribution.trained.slice(0, 2).join("、")}，建议也关注${distribution.untrained.slice(0, 2).join("、")}等项目的训练，保持全面发展。`;
    if (latestFatigue !== null && latestFatigue >= 7) {
      return advice + " 最近训练后疲劳感较高，建议适当降低强度，待恢复后再增加新项目。";
    }
    return advice;
  }
  if (daily7d === 0) return "本周暂无训练记录，建议尽早恢复训练节奏以保持体能状态。";
  if (latestFatigue !== null && latestFatigue >= 7) {
    return "训练节奏稳定，但最近疲劳感较高（≥7/10），建议关注恢复质量，可适当降低强度或增加休息日。";
  }
  return "训练节奏稳定，各项目发展较均衡。继续保持并关注动作质量与渐进负荷。";
}

export function AITrainingObservation({ dailyRecords, daily7d, daily30d }: TrainingObservationProps) {
  const rhythm = getTrainingRhythm(daily30d, daily7d);
  const latestDaily = dailyRecords[0] ?? null;
  const latestFatigue = latestDaily?.bodyFeeling?.fatigueLevel ?? null;
  const distribution = getItemDistribution(dailyRecords);
  const advice = getLightAdvice(daily7d, daily30d, rhythm, distribution, latestFatigue);
  // Count unique training days in last 7 days
  const activeDays7d = new Set(dailyRecords.filter(r => {
    const d = new Date(r.date).getTime();
    const now = Date.now();
    return (now - d) / 86400000 < 7;
  }).map(r => r.date.split("T")[0])).size;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Dumbbell className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">训练情况</h2>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-4 p-4">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">近7天训练</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{daily7d} <span className="text-sm font-normal text-muted-foreground">次</span></p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">近30天训练</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{daily30d} <span className="text-sm font-normal text-muted-foreground">次</span></p>
            </div>
          </div>

          {/* Latest training */}
          {latestDaily ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>最近训练：{formatDate(latestDaily.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>{latestDaily.items.map((item) => itemName(item.itemId)).join("、")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>活跃天数：{activeDays7d} 天</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">暂无日常训练记录。</p>
          )}

          {/* Training rhythm & fatigue */}
          <div className="rounded-lg bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">训练节奏</span>
              <Badge variant={
                rhythm.label === "稳定" ? "excellent"
                : rhythm.label === "适中" ? "pass"
                : "secondary"
              } className="text-[9px]">{rhythm.label}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">{rhythm.description}</p>
            {latestFatigue !== null && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>最近疲劳感：</span>
                <span className="font-semibold tabular-nums">{latestFatigue}/10</span>
                <span>
                  {latestFatigue <= 3 ? "（轻松）" : latestFatigue <= 5 ? "（适中）" : latestFatigue <= 7 ? "（偏累）" : "（需关注恢复）"}
                </span>
              </div>
            )}
          </div>

          {/* Project distribution */}
          {distribution.trained.length > 0 && (
            <div className="rounded-lg bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">训练项目分布</p>
              <p className="mt-1">训练较多：{distribution.trained.length > 0 ? distribution.trained.join("、") : "暂无"}</p>
              {distribution.untrained.length > 0 && (
                <p>近期较少：{distribution.untrained.join("、")}</p>
              )}
            </div>
          )}

          {/* Light advice */}
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs leading-5 text-muted-foreground">
              {advice}
            </p>
          </div>

          {/* Disclaimer footer */}
          <p className="text-[10px] text-muted-foreground">
            日常训练数据用于观察训练过程，不参与正式体测评分。
            AI 生成的建议需经体育教师审核后使用。
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
