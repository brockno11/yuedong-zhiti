// ===== 跃动智体 — 体质画像总览页 =====
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
import { Activity, TrendingUp, Target, PlusCircle, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try { const store = cookies(); return store.get("demo_student_id")?.value || ""; }
  catch { return ""; }
}
function bmiRef(bmi: number): number {
  if (bmi >= 18.5 && bmi < 24) return 85; if (bmi >= 17 && bmi < 18.5) return 65; if (bmi >= 24 && bmi < 28) return 60; return 50;
}
function getBatchLatestItems(records: { items: { itemId: string; score: number; value: number; grade: string }[] }[]) {
  const map = new Map<string, { itemId: string; score: number; value: number; grade: string }>();
  for (const r of records) for (const i of r.items) { if (!map.has(i.itemId)) map.set(i.itemId, i); }
  return Array.from(map.values());
}
function gradeLabel(score: number) {
  if (score >= 90) return "优秀"; if (score >= 80) return "良好"; if (score >= 60) return "及格"; return "待提升";
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
          action={<Link href="/record"><span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">开始记录</span></Link>} />
      </div>
    );
  }

  const batchItems = getBatchLatestItems(allRecords);
  const completeness = calculateRecordCompleteness(batchItems.map(i => i.itemId), student.gender);
  const bodyScore = bmiRef(student.bmi);
  const avgScore = Math.round(batchItems.reduce((sum, i) => sum + i.score, 0) / batchItems.length);
  const bmiLabel = student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注";
  const scoreGrade = gradeLabel(avgScore);

  // 雷达维度
  const dims = [
    { dimension: "速度", itemId: "50m_run", classAvg: 70, desc: "反映短跑和爆发力" },
    { dimension: "力量", itemId: student.gender === "male" ? "pull_up" : "sit_up", classAvg: 65, desc: student.gender === "male" ? "上肢拉力" : "核心力量" },
    { dimension: "耐力", itemId: student.gender === "male" ? "1000m_run" : "800m_run", classAvg: 66, desc: "心肺有氧能力" },
    { dimension: "柔韧", itemId: "sit_and_reach", classAvg: 72, desc: "身体柔韧程度" },
    { dimension: "身体形态", itemId: "__body_ref__", classAvg: 74, desc: "BMI 参考维度" },
  ];

  const allRadarData: RadarChartDataPoint[] = dims.map(d => ({
    dimension: d.dimension,
    score: d.itemId === "__body_ref__" ? bodyScore : (batchItems.find(i => i.itemId === d.itemId)?.score ?? null),
    classAverage: d.classAvg, fullMark: 100,
  }));
  const radarWithData = allRadarData.filter(d => d.score !== null);
  const sportDimsWithData = allRadarData.filter(d => d.score !== null && d.dimension !== "身体形态");

  // 趋势：默认综合评分趋势，不够则选最多记录的项目
  type TrendItem = { itemId: string; dimension: string; records: { date: string; score: number; value: number; grade: string }[] };
  const trendOptions: TrendItem[] = [];
  for (const r of allRecords) {
    const rAvg = Math.round(r.items.reduce((s, i) => s + i.score, 0) / r.items.length);
    if (trendOptions.length === 0 || trendOptions[0].itemId !== "__composite__") {
      trendOptions.push({ itemId: "__composite__", dimension: "综合", records: [] });
    }
    trendOptions[0].records.push({ date: r.semester, score: rAvg, value: rAvg, grade: gradeLabel(rAvg) });
  }
  for (const d of dims.filter(d => d.itemId !== "__body_ref__")) {
    const itemRecords = allRecords.filter(r => r.items.some(i => i.itemId === d.itemId));
    if (itemRecords.length >= 2) {
      trendOptions.push({
        itemId: d.itemId, dimension: d.dimension,
        records: itemRecords.slice(0, 5).reverse().map(r => {
          const it = r.items.find(i => i.itemId === d.itemId)!;
          return { date: r.semester, score: it.score, value: it.value, grade: it.grade };
        }),
      });
    }
  }
  // 默认选综合；如果综合不足 2 条，选第一条有 >=2 条的项目
  const defaultTrend = trendOptions.find(t => t.records.length >= 2 && t.itemId === "__composite__")
    || trendOptions.find(t => t.records.length >= 2) || trendOptions[0];
  const trendData: TrendChartDataPoint[] = (defaultTrend?.records ?? []).map(t => ({ date: t.date, value: t.score, grade: t.grade }));
  const showTrend = trendData.length >= 2;

  // 优势/待提升
  const strengths = batchItems.filter(i => i.grade === "excellent" || i.grade === "good");
  const improvements = batchItems.filter(i => i.grade === "improve" || i.grade === "pass");

  // AI 摘要
  const aiSummary: string[] = [];
  if (completeness.isComplete) aiSummary.push(`本次正式体测已完成全部 ${completeness.expectedCount} 个项目，综合评分为 ${avgScore} 分`);
  else aiSummary.push(`当前已录入 ${completeness.recordedCount}/${completeness.expectedCount} 个项目，数据完整度为 ${completeness.completionRate}%`);
  const bestDim = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! > b.score!) ? a : b) : null;
  const worstDim = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! < b.score!) ? a : b) : null;
  if (bestDim && bestDim.score! >= 80) aiSummary.push(`${bestDim.dimension}维度表现良好，继续保持当前训练节奏`);
  if (worstDim && worstDim.score! < 60) aiSummary.push(`${worstDim.dimension}维度有提升空间，建议从低强度训练开始逐步改善`);
  if (completeness.isPartial) aiSummary.push(`部分维度因暂未录入数据而无法评价，建议尽快补充以获取完整画像`);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      {/* 顶部 */}
      <PageHeader title="体质画像" description={`${student.name} · ${student.grade}`} />
      <div className="flex flex-wrap items-center gap-1.5">
        {latestRecord.batchName && <Badge variant="secondary" className="text-[10px]">{latestRecord.batchName}</Badge>}
        <Badge variant="outline" className="text-[10px]">{latestRecord.recordType === "daily_training" ? "日常训练观察" : "正式体测画像"}</Badge>
        <Badge variant={completeness.isComplete ? "excellent" : "pass"} className="text-[10px]">{completeness.recordedCount}/{completeness.expectedCount} 项</Badge>
      </div>

      {/* 完整度提示 */}
      {completeness.isPartial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          ⚠ 当前画像基于已录入项目生成，{completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).join("、")}暂未评价
        </div>
      )}

      {/* 综合评分卡 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{completeness.isComplete ? "综合评分" : "已录项目平均分"}</p>
          <Badge variant="excellent" className="text-[10px]">{scoreGrade}</Badge>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tabular-nums">{avgScore}</span>
          <span className="text-sm text-muted-foreground">分</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />BMI {student.bmi} · {bmiLabel}</span>
          <span>完整度 {completeness.completionRate}%</span>
        </div>
        {!completeness.isComplete && (
          <p className="mt-2 text-[11px] text-muted-foreground">基于已录入的 {completeness.recordedCount} 个项目计算，非完整体质评价</p>
        )}
      </div>

      {/* AI 画像摘要 */}
      <Card className="rounded-xl border-indigo-200 bg-indigo-50/50 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-indigo-800">AI 画像摘要</p></div>
          <ul className="space-y-1">
            {aiSummary.map((s, i) => <li key={i} className="text-xs text-indigo-700">• {s}</li>)}
          </ul>
          <p className="text-[10px] text-indigo-400">AI 生成，需经体育教师审核后使用</p>
        </CardContent>
      </Card>

      {/* 五维能力结构 */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">五维能力结构</CardTitle></CardHeader>
        <CardContent>
          {sportDimsWithData.length >= 3 ? (
            <FitnessRadarChart data={allRadarData} height={280} showComparison />
          ) : (
            <div className="py-6 text-center"><p className="text-sm text-muted-foreground">已录数据不足以形成雷达图，请至少补充 3 个维度</p></div>
          )}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allRadarData.slice(0, 5).map(d => (
              <div key={d.dimension} className="rounded-lg border p-2 text-center">
                <p className="text-[11px] font-medium">{d.dimension}</p>
                <p className="text-lg font-bold tabular-nums">{d.score !== null ? d.score : "-"}</p>
                <p className="text-[10px] text-muted-foreground">{d.score !== null ? (d.score >= 80 ? "良好" : d.score >= 60 ? "及格" : "待提升") : "暂无数据"}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">虚线为班级均值，实线为你的表现</p>
        </CardContent>
      </Card>

      {/* 趋势图 */}
      {showTrend && (
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">体质变化趋势</CardTitle>
              {trendOptions.length > 1 && (
                <span className="text-[11px] text-muted-foreground">{defaultTrend?.dimension ?? "综合"}趋势</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <FitnessTrendChart data={trendData} height={200} unit="分" />
            {trendOptions.length > 1 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                {trendOptions.filter(t => t.records.length >= 2).map(t => (
                  <span key={t.itemId} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] ${t.itemId === (defaultTrend?.itemId ?? "") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>
                    {t.dimension}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 优势与待提升 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-level-excellent" />优势项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {strengths.length > 0 ? strengths.map(s => {
              const def = FITNESS_ITEMS.find(d => d.id === s.itemId);
              return (
                <div key={s.itemId} className="rounded-lg border p-2.5">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">{def?.name ?? s.itemId}</span><Badge variant="excellent" className="text-[10px]">{s.score}分</Badge></div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{def?.name ?? ""}表现良好，继续保持当前训练方法</p>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">各方面均衡发展</p>}
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Target className="h-4 w-4 text-level-pass" />待提升项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {improvements.length > 0 ? improvements.map(s => {
              const def = FITNESS_ITEMS.find(d => d.id === s.itemId);
              return (
                <div key={s.itemId} className="rounded-lg border p-2.5">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">{def?.name ?? s.itemId}</span><Badge variant="pass" className="text-[10px]">{s.score}分</Badge></div>
                  <p className="mt-1 text-[11px] text-muted-foreground">建议从低强度训练开始，逐步提升{def?.name ?? "该项目"}</p>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">各项表现均衡</p>}
            {improvements.length > 0 && <p className="text-[11px] text-muted-foreground">建议优先从低强度训练开始，逐步提升</p>}
          </CardContent>
        </Card>
      </div>

      {/* 下一步行动 */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/ai-guide"><Button variant="outline" size="sm" className="w-full h-10 text-xs gap-1"><Sparkles className="h-3.5 w-3.5" />AI 指导方案</Button></Link>
        <Link href="/record"><Button variant="outline" size="sm" className="w-full h-10 text-xs gap-1"><PlusCircle className="h-3.5 w-3.5" />补充记录</Button></Link>
        <Link href="/records"><Button variant="outline" size="sm" className="w-full h-10 text-xs gap-1"><FileText className="h-3.5 w-3.5" />历史记录</Button></Link>
      </div>
      <div className="h-4" />
    </div>
  );
}
export const dynamic = "force-dynamic";
