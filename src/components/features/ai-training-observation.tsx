"use client";

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

function getTrainingRhythm(daily30d: number): string {
  if (daily30d >= 8) return "稳定";
  if (daily30d >= 3) return "适中";
  if (daily30d > 0) return "偏少";
  return "待建立";
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

function getLightAdvice(daily7d: number, daily30d: number, rhythm: string, distribution: { trained: string[]; untrained: string[] }): string {
  if (daily30d === 0) return "建议从每周2-3次轻量记录开始，建立训练习惯。";
  if (rhythm === "偏少" || rhythm === "待建立") return "建议逐步增加训练频率，保持每周至少3次。";
  if (distribution.untrained.length > 0) {
    return `近期训练集中在${distribution.trained.slice(0, 2).join("、")}，建议也关注${distribution.untrained.slice(0, 2).join("、")}等项目的训练。`;
  }
  if (daily7d === 0) return "本周暂无训练记录，建议尽早恢复训练节奏。";
  return "训练节奏稳定，继续保持并关注动作质量与恢复。";
}

export function AITrainingObservation({ dailyRecords, daily7d, daily30d }: TrainingObservationProps) {
  const rhythm = getTrainingRhythm(daily30d);
  const latestDaily = dailyRecords[0] ?? null;
  const distribution = getItemDistribution(dailyRecords);
  const advice = getLightAdvice(daily7d, daily30d, rhythm, distribution);

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
                <Dumbbell className="h-3.5 w-3.5" />
                <span>训练节奏：{rhythm}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">暂无日常训练记录。</p>
          )}

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
