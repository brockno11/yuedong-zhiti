// ===== 跃动智体 — 体质画像页 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessRadarChart } from "@/components/charts/fitness-radar-chart";
import { FitnessTrendChart } from "@/components/charts/fitness-trend-chart";
import { EmptyState } from "@/components/features/empty-state";
import { getFitnessRecords, getLatestFitnessRecord, getStudentProfile } from "@/lib/server/data-service";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import type { RadarChartDataPoint, TrendChartDataPoint } from "@/lib/types";
import { Activity, TrendingUp, Target, Lightbulb, PlusCircle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try { const store = cookies(); return store.get("demo_student_id")?.value || ""; }
  catch { return ""; }
}

function bmiReferenceScore(bmi: number): number {
  if (bmi >= 18.5 && bmi < 24) return 85;
  if (bmi >= 17 && bmi < 18.5) return 65;
  if (bmi >= 24 && bmi < 28) return 60;
  return 50;
}

// 聚合同一批次下所有记录，取每个 itemId 最新值
function getBatchLatestItems(records: { items: { itemId: string; score: number; value: number; grade: string }[] }[]) {
  const map = new Map<string, { itemId: string; score: number; value: number; grade: string }>();
  for (const r of records) {
    for (const i of r.items) {
      if (!map.has(i.itemId)) map.set(i.itemId, i);
    }
  }
  return Array.from(map.values());
}

export default async function PortraitPage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const latestRecord = studentId ? await getLatestFitnessRecord(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];

  if (!student || !latestRecord) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <EmptyState title="暂无体质数据" description="完成首次体测记录后，这里将展示完整的体质画像"
          action={<Link href="/record"><span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">开始记录</span></Link>}
        />
      </div>
    );
  }

  // 聚合当前批次所有记录的 item
  const batchLatestItems = getBatchLatestItems(allRecords);
  const batchItemIds = batchLatestItems.map(i => i.itemId);
  const completeness = calculateRecordCompleteness(batchItemIds, student.gender);

  // 身体形态参考（基于 BMI，不上场 item）
  const bodyScore = bmiReferenceScore(student.bmi);

  // 雷达图：5个运动维度（从聚合数据取最新得分）+ 身体形态参考
  const dims = [
    { dimension: "速度", itemId: "50m_run", classAvg: 70 },
    { dimension: "力量", itemId: student.gender === "male" ? "pull_up" : "sit_up", classAvg: 65 },
    { dimension: "耐力", itemId: student.gender === "male" ? "1000m_run" : "800m_run", classAvg: 66 },
    { dimension: "柔韧", itemId: "sit_and_reach", classAvg: 72 },
    { dimension: "身体形态参考", itemId: "__body_ref__", classAvg: 74 },
  ];

  const allRadarData: RadarChartDataPoint[] = dims.map(d => {
    if (d.itemId === "__body_ref__") {
      return { dimension: d.dimension, score: bodyScore, classAverage: d.classAvg, fullMark: 100 };
    }
    const item = batchLatestItems.find(i => i.itemId === d.itemId);
    return { dimension: d.dimension, score: item?.score ?? null, classAverage: d.classAvg, fullMark: 100 };
  });

  const radarWithData = allRadarData.filter(d => d.score !== null);
  const missingDims = allRadarData.filter(d => d.score === null).map(d => d.dimension);
  const sportDimsWithData = allRadarData.filter(d => d.score !== null && d.dimension !== "身体形态参考");

  // 趋势：50米跑
  const trendData: TrendChartDataPoint[] = allRecords.filter(r => r.items.some(i => i.itemId === "50m_run")).slice(0, 3).reverse().map(r => {
    const runItem = r.items.find(i => i.itemId === "50m_run")!;
    return { date: r.semester, value: runItem.value, grade: runItem.grade };
  });

  const avgScore = Math.round(batchLatestItems.reduce((sum, i) => sum + i.score, 0) / batchLatestItems.length);
  const strengths = batchLatestItems.filter(i => i.grade === "excellent" || i.grade === "good").map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId);
  const improvements = batchLatestItems.filter(i => i.grade === "improve" || i.grade === "pass").map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId);

  const lowest = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! < b.score!) ? a : b) : null;
  const insightText = lowest && lowest.score !== null && lowest.score! < 60
    ? `${lowest.dimension}维度有提升空间，建议从低强度训练开始逐步改善`
    : completeness.isPartial
      ? `已记录 ${completeness.recordedCount}/${completeness.expectedCount} 项，完整画像需补充更多数据`
      : "各维度表现较为均衡，继续保持当前训练节奏";

  const bmiLabel = student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注";

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-0">
      <PageHeader title="体质画像" description={`${student.name} · ${student.grade} · ${latestRecord.semester}`} />

      {/* 记录类型 + 批次 */}
      {(latestRecord.batchName || latestRecord.recordType) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {latestRecord.batchName && <Badge variant="secondary" className="text-[10px]">{latestRecord.batchName}</Badge>}
          <Badge variant="outline" className="text-[10px]">
            {latestRecord.recordType === "daily_training" ? "日常训练观察" : "正式体测画像"}
          </Badge>
        </div>
      )}

      {/* 数据完整度提示 */}
      {completeness.isPartial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          当前画像基于已录入的 {completeness.recordedCount}/{completeness.expectedCount} 个项目生成，部分维度因缺少数据暂不评价。
          建议补充记录：{completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).join("、")}
        </div>
      )}

      {/* 核心指标 + 洞察 */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="rounded-xl border shadow-sm lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {completeness.isComplete ? "综合评分" : "已录项目平均分"}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tabular-nums">{avgScore}</span>
              <span className="text-sm text-muted-foreground">分</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> BMI {student.bmi} · {bmiLabel}</span>
              <Badge variant={completeness.isComplete ? "excellent" : "pass"} className="text-[10px]">{completeness.recordedCount}/{completeness.expectedCount} 项</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">本期洞察</p></div>
            <p className="text-sm leading-relaxed text-muted-foreground">{insightText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {strengths.length > 0 && <Badge variant="excellent" className="text-[11px]"><TrendingUp className="mr-1 h-3 w-3" />优势：{strengths.slice(0, 2).join("、")}</Badge>}
              {improvements.length > 0 && <Badge variant="pass" className="text-[11px]"><Target className="mr-1 h-3 w-3" />待提升：{improvements.slice(0, 2).join("、")}</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 雷达图 */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">体质雷达图</CardTitle></CardHeader>
        <CardContent>
          {sportDimsWithData.length >= 3 ? (
            <>
              <FitnessRadarChart data={allRadarData} height={300} showComparison />
              {radarWithData.length > 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  虚线为班级均值，实线为你的表现·身体形态为BMI参考维度
                </p>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">已录数据不足以形成雷达图，请至少补充 3 个维度</p>
              <Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-2"><PlusCircle className="h-3.5 w-3.5" />补充体测项目</Button></Link>
            </div>
          )}
          {missingDims.length > 0 && missingDims[0] !== "身体形态参考" && (
            <p className="mt-1 text-center text-xs text-muted-foreground">暂无数据：{missingDims.join("、")}</p>
          )}
        </CardContent>
      </Card>

      {/* 趋势图 */}
      {trendData.length >= 2 && (
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">50米跑趋势</CardTitle></CardHeader>
          <CardContent><FitnessTrendChart data={trendData} height={200} unit="秒" /></CardContent>
        </Card>
      )}

      {/* 优势/待提升 */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-level-excellent" />优势项目</CardTitle></CardHeader>
          <CardContent>
            {strengths.length > 0 ? <ul className="space-y-1.5">{strengths.map(s => <li key={s} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-level-excellent" />{s}</li>)}</ul> : <p className="text-sm text-muted-foreground">各方面均衡发展</p>}
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Target className="h-4 w-4 text-level-pass" />待提升项目</CardTitle></CardHeader>
          <CardContent>
            {improvements.length > 0 ? <ul className="space-y-1.5">{improvements.map(s => <li key={s} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-level-pass" />{s}</li>)}</ul> : <p className="text-sm text-muted-foreground">各项表现均衡</p>}
            {improvements.length > 0 && <p className="mt-3 text-xs text-muted-foreground">建议优先从低强度训练开始，逐步提升</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Link href="/record"><Button variant="outline" size="sm" className="gap-1.5 h-10"><PlusCircle className="h-4 w-4" />记录新数据</Button></Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
