// ===== 跃动智体 — 体质画像总览页 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessRadarChart } from "@/components/charts/fitness-radar-chart";
import { PortraitTrendSection } from "@/components/features/portrait-trend-section";
import { PortraitBatchSelector } from "@/components/features/portrait-batch-selector";
import { EmptyState } from "@/components/features/empty-state";
import { getFitnessRecords, getStudentProfile, getClassAverages } from "@/lib/server/data-service";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import type { RadarChartDataPoint } from "@/lib/types";
import { Activity, TrendingUp, Target, PlusCircle, Sparkles, FileText, ShieldCheck, Dumbbell } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string { try { const store = cookies(); return store.get("demo_student_id")?.value || ""; } catch { return ""; } }
function bmiRef(bmi: number): number { if (bmi >= 18.5 && bmi < 24) return 85; if (bmi >= 17 && bmi < 18.5) return 65; if (bmi >= 24 && bmi < 28) return 60; return 50; }
function getLatestPerItem(records: { items: { itemId: string; score: number; value: number; grade: string }[] }[]) {
  const map = new Map<string, { itemId: string; score: number; value: number; grade: string }>();
  for (const r of records) for (const i of r.items) { if (!map.has(i.itemId)) map.set(i.itemId, i); }
  return Array.from(map.values());
}
function gradeLabel(s: number) { if (s >= 90) return "优秀"; if (s >= 80) return "良好"; if (s >= 60) return "及格"; return "待提升"; }

export default async function PortraitPage({ searchParams }: { searchParams?: { batchId?: string } }) {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];
  const classAvgs = await getClassAverages();
  const batchId = searchParams?.batchId;

  // 按批次过滤
  const filteredRecords = batchId ? allRecords.filter(r => r.batchId === batchId) : allRecords;
  const latestRecord = filteredRecords[0] ?? allRecords[0] ?? null;

  if (!student || !latestRecord) {
    return (<div className="mx-auto max-w-lg px-4"><EmptyState title="暂无体质数据" description="完成首次体测记录后，这里将展示完整的体质画像" action={<Link href="/record"><span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">开始记录</span></Link>} /></div>);
  }

  // 分离正式体测和日常训练
  const officialRecords = allRecords.filter(r => r.recordType !== "daily_training");
  const dailyRecords = allRecords.filter(r => r.recordType === "daily_training");
  const hasOfficial = officialRecords.length > 0;

  // 正式体测画像数据
  const officialItems = getLatestPerItem(officialRecords);
  const completeness = calculateRecordCompleteness(officialItems.map(i => i.itemId), student.gender);
  const bodyScore = bmiRef(student.bmi);
  const avgScore = officialItems.length > 0 ? Math.round(officialItems.reduce((sum, i) => sum + i.score, 0) / officialItems.length) : 0;
  const bmiLabel = student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注";

  // 日常训练摘要
  const lastDaily = dailyRecords[0];
  const daily7d = dailyRecords.filter(r => (Date.now() - new Date(r.date).getTime()) < 7 * 86400000).length;
  const daily30d = dailyRecords.filter(r => (Date.now() - new Date(r.date).getTime()) < 30 * 86400000).length;
  const dailyRhythm = daily30d >= 8 ? "稳定" : daily30d >= 3 ? "适中" : dailyRecords.length > 0 ? "偏少" : "暂无记录";

  // 五维
  const dimDefs = [
    { dimension: "速度", itemId: "50m_run", desc: "反映短跑和爆发力", sourceName: "50米跑" },
    { dimension: "力量", itemId: student.gender === "male" ? "pull_up" : "sit_up", desc: student.gender === "male" ? "上肢拉力" : "核心力量", sourceName: student.gender === "male" ? "引体向上" : "仰卧起坐" },
    { dimension: "耐力", itemId: student.gender === "male" ? "1000m_run" : "800m_run", desc: "心肺有氧能力", sourceName: student.gender === "male" ? "1000米跑" : "800米跑" },
    { dimension: "柔韧", itemId: "sit_and_reach", desc: "身体柔韧程度", sourceName: "坐位体前屈" },
    { dimension: "身体形态", itemId: "__body_ref__", desc: "BMI 参考维度", sourceName: "身高体重/BMI" },
  ];

  const allRadarData: RadarChartDataPoint[] = dimDefs.map(d => {
    const ca = classAvgs[d.itemId];
    const classAvg = ca?.hasData ? ca.avgScore : null;
    if (d.itemId === "__body_ref__") return { dimension: d.dimension, score: bodyScore, classAverage: classAvg ?? 74, fullMark: 100 };
    const item = officialItems.find(i => i.itemId === d.itemId);
    return { dimension: d.dimension, score: item?.score ?? null, classAverage: classAvg ?? 0, fullMark: 100 };
  });
  const radarWithData = allRadarData.filter(d => d.score !== null);
  const sportDimsWithData = allRadarData.filter(d => d.score !== null && d.dimension !== "身体形态");

  // 趋势（真实日期，正式体测按批次聚合，日常训练按日期估算）
  function fmtLabel(d: Date) { return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}`; }
  function fmtFull(d: Date) { return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; }

  const trendOptions: { key: string; label: string; data: { date: string; fullDate: string; value: number; grade: string }[]; unit: string }[] = [];

  // 正式体测：按批次聚合，每批次 = 1个数据点（取该批次全项目录入完成日）
  const batchGroups = new Map<string, { records: typeof officialRecords; latestDate: Date }>();
  for (const r of officialRecords) {
    const key = r.batchId || r.semester || "__unknown__";
    const existing = batchGroups.get(key);
    if (!existing) batchGroups.set(key, { records: [r], latestDate: new Date(r.date) });
    else { existing.records.push(r); if (new Date(r.date) > existing.latestDate) existing.latestDate = new Date(r.date); }
  }
  const batchGroupEntries = Array.from(batchGroups.entries());
  const batchPoints: { date: Date; value: number }[] = [];
  for (const [, g] of batchGroupEntries) {
    const allItems = new Map<string, { score: number }>();
    for (const r of g.records) for (const i of r.items) { if (!allItems.has(i.itemId)) allItems.set(i.itemId, i); }
    const itemValues = Array.from(allItems.values());
    if (itemValues.length > 0) {
      batchPoints.push({ date: g.latestDate, value: Math.round(itemValues.reduce((s: number, i: { score: number }) => s + i.score, 0) / itemValues.length) });
    }
  }
  batchPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
  const compositeData = batchPoints.map(bp => ({ date: fmtLabel(bp.date), fullDate: fmtFull(bp.date), value: bp.value, grade: "" }));
  if (compositeData.length >= 1) trendOptions.push({ key: "__comp__", label: "综合", data: compositeData, unit: "分" });

  // 专项维度：按批次取该项目最新得分
  for (const d of dimDefs.filter(d => d.itemId !== "__body_ref__")) {
    const pts: { date: string; fullDate: string; value: number; grade: string }[] = [];
    for (const [, g] of batchGroupEntries) {
      let best: { score: number } | null = null;
      for (const r of g.records) { const it = r.items.find(i => i.itemId === d.itemId); if (it && (!best || it.score > best.score)) best = it; }
      if (best) pts.push({ date: fmtLabel(g.latestDate), fullDate: fmtFull(g.latestDate), value: best.score, grade: "" });
    }
    pts.sort((a, b) => a.date.localeCompare(b.date));
    if (pts.length >= 1) trendOptions.push({ key: d.itemId, label: d.dimension, data: pts, unit: "分" });
  }

  // 日常训练：按天聚合估算（当天所有项目均分）
  const dailyByDay = new Map<string, { scores: number[]; date: Date }>();
  for (const r of dailyRecords) {
    const day = new Date(r.date).toISOString().slice(0, 10);
    const existing = dailyByDay.get(day);
    if (!existing) dailyByDay.set(day, { scores: r.items.map(i => i.score), date: new Date(r.date) });
    else { existing.scores.push(...r.items.map(i => i.score)); }
  }
  const dailyTrendData = Array.from(dailyByDay.values()).sort((a, b) => a.date.getTime() - b.date.getTime()).map(d => ({
    date: fmtLabel(d.date), fullDate: fmtFull(d.date), value: Math.round(d.scores.reduce((s: number, v: number) => s + v, 0) / d.scores.length), grade: "",
  }));

  // 优势/待提升
  const strengths = officialItems.filter(i => i.grade === "excellent" || i.grade === "good").sort((a, b) => b.score - a.score).slice(0, 3);
  const improvements = officialItems.filter(i => i.grade === "improve" || i.grade === "pass").sort((a, b) => a.score - b.score).slice(0, 3);

  // AI 摘要
  const aiSummary: string[] = [];
  if (completeness.isComplete) aiSummary.push(`本次正式体测已完成全部 ${completeness.expectedCount} 个项目，综合评分为 ${avgScore} 分（${gradeLabel(avgScore)}）`);
  else if (officialItems.length > 0) aiSummary.push(`当前正式体测已录入 ${completeness.recordedCount}/${completeness.expectedCount} 个项目，基于已录入项目计算的均分为 ${avgScore} 分`);
  else aiSummary.push(`暂无正式体测数据，请先完成一次正式体测记录`);
  const bestDim = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! > b.score!) ? a : b) : null;
  const worstDim = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! < b.score!) ? a : b) : null;
  if (bestDim && bestDim.score! >= 80) aiSummary.push(`${bestDim.dimension}维度表现良好，继续保持当前训练节奏`);
  if (worstDim && worstDim.score! < 60) aiSummary.push(`${worstDim.dimension}维度有提升空间，建议从低强度训练开始逐步改善`);
  if (completeness.isPartial) aiSummary.push(`部分维度因暂未录入数据而无法评价，建议尽快补充以获取完整画像`);
  if (dailyRhythm === "稳定") aiSummary.push(`近30天日常训练节奏稳定，有助于体质维持和习惯养成`);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <PageHeader title="体质画像" description={`${student.name} · ${student.grade}`} />

      {/* 批次选择器 */}
      <div className="flex items-center gap-2">
        <PortraitBatchSelector currentBatchId={batchId} />
        <Badge variant="outline" className="text-[10px]">体质画像</Badge>
        <Badge variant={completeness.isComplete ? "excellent" : "pass"} className="text-[10px]">
          完整度 {completeness.recordedCount}/{completeness.expectedCount} 项
        </Badge>
        {batchId && (
          <span className="text-[10px] text-muted-foreground ml-auto">已筛选</span>
        )}
      </div>

      {!hasOfficial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          暂无正式体测数据，以下展示基于日常训练记录的参考观察。请尽快完成一次正式体测记录。
        </div>
      )}
      {completeness.isPartial && hasOfficial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          ⚠ 当前画像基于已录入正式体测项目生成，{completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).join("、")}暂未评价
        </div>
      )}

      {/* 综合评分卡（仅正式体测） */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{completeness.isComplete ? "综合评分" : "已录项目平均分"}</p>
          {officialItems.length > 0 && <Badge variant="excellent" className="text-[10px]">{gradeLabel(avgScore)}</Badge>}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tabular-nums">{officialItems.length > 0 ? avgScore : "-"}</span>
          <span className="text-sm text-muted-foreground">分</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />BMI {student.bmi} · {bmiLabel}</span>
          <span>正式体测完整度 {completeness.completionRate}%</span>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">来源：正式体测 · 日常训练不参与综合评分</p>
      </div>

      {/* AI 画像摘要 */}
      <Card className="rounded-xl border-indigo-200 bg-indigo-50/50 shadow-sm"><CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-indigo-800">AI 画像摘要</p></div>
        <ul className="space-y-1">{aiSummary.map((s, i) => <li key={i} className="text-xs text-indigo-700">• {s}</li>)}</ul>
        <p className="text-[10px] text-indigo-400">AI 生成，需经体育教师审核后使用</p>
      </CardContent></Card>

      {/* 五维能力结构（正式体测） */}
      <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">五维能力结构</CardTitle></CardHeader>
        <CardContent>
          {sportDimsWithData.length >= 3 ? <FitnessRadarChart data={allRadarData} height={280} showComparison /> : (
            <div className="py-6 text-center"><p className="text-sm text-muted-foreground">已录数据不足以形成雷达图，请至少补充 3 个维度</p><Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-2"><PlusCircle className="h-3.5 w-3.5" />补充体测项目</Button></Link></div>
          )}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dimDefs.map(d => {
              const scoreVal = allRadarData.find(r => r.dimension === d.dimension)?.score ?? null;
              const ca = classAvgs[d.itemId]; const clsAvg = ca?.hasData ? ca.avgScore : null;
              const diff = scoreVal !== null && clsAvg !== null ? scoreVal - clsAvg : null;
              return (
                <div key={d.dimension} className="rounded-lg border p-2.5 space-y-1">
                  <p className="text-[11px] font-medium">{d.dimension}</p>
                  <p className="text-lg font-bold tabular-nums">{scoreVal !== null ? scoreVal : "-"}</p>
                  {clsAvg !== null ? (<p className="text-[10px] text-muted-foreground">班均 {clsAvg}{diff !== null ? (diff >= 0 ? ` · 高于 +${diff}` : ` · 低于 ${diff}`) : ""}</p>) : (<p className="text-[10px] text-muted-foreground">班级样本不足</p>)}
                  <p className="text-[10px] text-muted-foreground">来源：{d.sourceName}</p>
                  <Badge variant={scoreVal != null && scoreVal >= 80 ? "excellent" : scoreVal != null && scoreVal >= 60 ? "pass" : "secondary"} className="text-[9px]">{scoreVal != null ? (scoreVal >= 80 ? "优势" : scoreVal >= 60 ? "稳定" : "待关注") : "暂无数据"}</Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">来源：正式体测项目映射 · 实线=个人 · 虚线=班级均值</p>
        </CardContent></Card>

      {/* 趋势图（正式体测 + 日常训练） */}
      <PortraitTrendSection options={trendOptions} dailyData={dailyTrendData} />

      {/* 优势/待提升 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-level-excellent" />优势项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {strengths.length > 0 ? strengths.map(s => {
              const def = FITNESS_ITEMS.find(d => d.id === s.itemId);
              const ca = classAvgs[s.itemId]; const diff = ca?.hasData ? s.score - ca.avgScore : null;
              return (<div key={s.itemId} className="rounded-lg border p-2.5"><div className="flex items-center justify-between"><span className="text-sm font-medium">{def?.name ?? s.itemId}</span><Badge variant="excellent" className="text-[10px]">{s.score}分</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">{def?.name ?? ""}表现良好{diff !== null && diff > 0 ? `，高于班均 +${diff}` : ""}，继续保持</p></div>);
            }) : <p className="text-sm text-muted-foreground">整体表现均衡，来源：正式体测</p>}
          </CardContent></Card>
        <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Target className="h-4 w-4 text-level-pass" />待提升项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {improvements.length > 0 ? improvements.map(s => {
              const def = FITNESS_ITEMS.find(d => d.id === s.itemId);
              return (<div key={s.itemId} className="rounded-lg border p-2.5"><div className="flex items-center justify-between"><span className="text-sm font-medium">{def?.name ?? s.itemId}</span><Badge variant="pass" className="text-[10px]">{s.score}分</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">有提升空间，建议逐步改善{def?.name ?? "该项目"}</p></div>);
            }) : <p className="text-sm text-muted-foreground">各项表现均衡，来源：正式体测</p>}
          </CardContent></Card>
      </div>

      {/* 日常训练观察 */}
      <Card className="rounded-xl border-blue-200 bg-blue-50/30 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Dumbbell className="h-4 w-4 text-blue-500" />日常训练观察</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {dailyRecords.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/60 p-2"><p className="text-lg font-bold">{daily7d}</p><p className="text-[10px] text-muted-foreground">近7天</p></div>
                <div className="rounded-lg bg-white/60 p-2"><p className="text-lg font-bold">{daily30d}</p><p className="text-[10px] text-muted-foreground">近30天</p></div>
                <div className="rounded-lg bg-white/60 p-2"><p className="text-sm font-semibold">{dailyRhythm}</p><p className="text-[10px] text-muted-foreground">训练节奏</p></div>
              </div>
              {lastDaily && (
                <div className="text-xs text-muted-foreground">
                  <p>最近训练：{new Date(lastDaily.date).toLocaleDateString("zh-CN")} · {lastDaily.items.map(i => FITNESS_ITEMS.find(f => f.id === i.itemId)?.name ?? i.itemId).join("、")}</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground">暂无日常训练记录。完成一次训练记录后，可生成训练节奏观察。</p>
              <Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-2 h-7 text-xs"><PlusCircle className="h-3 w-3" />开始记录</Button></Link>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">日常训练数据用于辅助观察训练习惯，不参与正式体测综合评分</p>
        </CardContent></Card>

      {/* 评分标准与数据来源 */}
      <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-muted-foreground" />评分标准与数据来源</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <p>• 当前画像基于 {student.name} · {student.grade} · 正式体测批次</p>
          <p>• 已录入 {completeness.recordedCount}/{completeness.expectedCount} 项正式体测项目</p>
          <p>• 评分参考《国家学生体质健康标准（2014年修订）》高中阶段相关项目</p>
          <p>• 五维能力为平台画像维度整合</p>
          <p>• 班级均值来自真实数据（≥3 样本），不足时标注"样本不足"</p>
          <p>• 日常训练不参与正式体测综合评分</p>
          <p className="text-indigo-500">• AI 生成，需经体育教师审核后使用</p>
        </CardContent></Card>

      {/* 下一步 */}
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
