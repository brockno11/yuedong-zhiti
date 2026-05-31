// ===== 跃动智体 — 体质画像总览页 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessRadarChart } from "@/components/charts/fitness-radar-chart";
import { PortraitTrendSection } from "@/components/features/portrait-trend-section";
import { EmptyState } from "@/components/features/empty-state";
import { getFitnessRecords, getLatestFitnessRecord, getStudentProfile, getClassAverages } from "@/lib/server/data-service";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import type { RadarChartDataPoint } from "@/lib/types";
import { Activity, TrendingUp, Target, PlusCircle, Sparkles, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string { try { const store = cookies(); return store.get("demo_student_id")?.value || ""; } catch { return ""; } }
function bmiRef(bmi: number): number { if (bmi >= 18.5 && bmi < 24) return 85; if (bmi >= 17 && bmi < 18.5) return 65; if (bmi >= 24 && bmi < 28) return 60; return 50; }
function getBatchLatestItems(records: { items: { itemId: string; score: number; value: number; grade: string }[] }[]) {
  const map = new Map<string, { itemId: string; score: number; value: number; grade: string }>();
  for (const r of records) for (const i of r.items) { if (!map.has(i.itemId)) map.set(i.itemId, i); }
  return Array.from(map.values());
}
function gradeLabel(s: number) { if (s >= 90) return "优秀"; if (s >= 80) return "良好"; if (s >= 60) return "及格"; return "待提升"; }

export default async function PortraitPage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const latestRecord = studentId ? await getLatestFitnessRecord(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];
  const classAvgs = await getClassAverages();

  if (!student || !latestRecord) {
    return (<div className="mx-auto max-w-lg px-4"><EmptyState title="暂无体质数据" description="完成首次体测记录后，这里将展示完整的体质画像" action={<Link href="/record"><span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">开始记录</span></Link>} /></div>);
  }

  const batchItems = getBatchLatestItems(allRecords);
  const completeness = calculateRecordCompleteness(batchItems.map(i => i.itemId), student.gender);
  const bodyScore = bmiRef(student.bmi);
  const avgScore = Math.round(batchItems.reduce((sum, i) => sum + i.score, 0) / batchItems.length);
  const bmiLabel = student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注";

  // 五维：从真实班级数据取班均
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
    const item = batchItems.find(i => i.itemId === d.itemId);
    return { dimension: d.dimension, score: item?.score ?? null, classAverage: classAvg ?? 0, fullMark: 100 };
  });
  const radarWithData = allRadarData.filter(d => d.score !== null);
  const sportDimsWithData = allRadarData.filter(d => d.score !== null && d.dimension !== "身体形态");

  // 趋势选项
  const trendOptions: { key: string; label: string; data: { date: string; value: number; grade: string }[]; unit: string }[] = [];
  // 综合趋势
  const compositeData = allRecords.slice(0, 8).reverse().map(r => ({ date: r.semester, value: Math.round(r.items.reduce((s, i) => s + i.score, 0) / r.items.length), grade: gradeLabel(Math.round(r.items.reduce((s, i) => s + i.score, 0) / r.items.length)) }));
  if (compositeData.length >= 2) trendOptions.push({ key: "__composite__", label: "综合", data: compositeData, unit: "分" });
  for (const d of dimDefs.filter(d => d.itemId !== "__body_ref__")) {
    const itemRecs = allRecords.filter(r => r.items.some(i => i.itemId === d.itemId)).slice(0, 8).reverse();
    if (itemRecs.length >= 2) trendOptions.push({ key: d.itemId, label: d.dimension, data: itemRecs.map(r => { const it = r.items.find(i => i.itemId === d.itemId)!; return { date: r.semester, value: it.score, grade: it.grade }; }), unit: "分" });
  }

  // 优势/待提升
  const strengths = batchItems.filter(i => i.grade === "excellent" || i.grade === "good").sort((a, b) => b.score - a.score).slice(0, 3);
  const improvements = batchItems.filter(i => i.grade === "improve" || i.grade === "pass").sort((a, b) => a.score - b.score).slice(0, 3);

  // AI 摘要
  const aiSummary: string[] = [];
  if (completeness.isComplete) aiSummary.push(`本次正式体测已完成全部 ${completeness.expectedCount} 个项目，综合评分为 ${avgScore} 分（${gradeLabel(avgScore)}）`);
  else aiSummary.push(`当前已录入 ${completeness.recordedCount}/${completeness.expectedCount} 个项目，基于已录入项目计算的均分为 ${avgScore} 分`);
  const bestDim = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! > b.score!) ? a : b) : null;
  const worstDim = radarWithData.length > 0 ? radarWithData.reduce((a, b) => (a.score! < b.score!) ? a : b) : null;
  if (bestDim && bestDim.score! >= 80) aiSummary.push(`${bestDim.dimension}维度表现良好，继续保持当前训练节奏`);
  if (worstDim && worstDim.score! < 60) aiSummary.push(`${worstDim.dimension}维度有提升空间，建议从低强度训练开始逐步改善`);
  if (completeness.isPartial) aiSummary.push(`部分维度因暂未录入数据而无法评价，建议尽快补充以获取完整画像`);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <PageHeader title="体质画像" description={`${student.name} · ${student.grade}`} />
      <div className="flex flex-wrap items-center gap-1.5">
        {latestRecord.batchName && <Badge variant="secondary" className="text-[10px]">{latestRecord.batchName}</Badge>}
        <Badge variant="outline" className="text-[10px]">{latestRecord.recordType === "daily_training" ? "日常训练观察" : "正式体测画像"}</Badge>
        <Badge variant={completeness.isComplete ? "excellent" : "pass"} className="text-[10px]">{completeness.recordedCount}/{completeness.expectedCount} 项</Badge>
      </div>

      {completeness.isPartial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          ⚠ 当前画像基于已录入项目生成，{completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).join("、")}暂未评价
        </div>
      )}

      {/* 综合评分卡 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{completeness.isComplete ? "综合评分" : "已录项目平均分"}</p>
          <Badge variant="excellent" className="text-[10px]">{gradeLabel(avgScore)}</Badge>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tabular-nums">{avgScore}</span><span className="text-sm text-muted-foreground">分</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />BMI {student.bmi} · {bmiLabel}</span>
          <span>完整度 {completeness.completionRate}%</span>
        </div>
        {!completeness.isComplete && <p className="mt-2 text-[11px] text-muted-foreground">基于已录入的 {completeness.recordedCount} 个项目计算，非完整体质评价</p>}
      </div>

      {/* AI 画像摘要 */}
      <Card className="rounded-xl border-indigo-200 bg-indigo-50/50 shadow-sm"><CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-indigo-800">AI 画像摘要</p></div>
        <ul className="space-y-1">{aiSummary.map((s, i) => <li key={i} className="text-xs text-indigo-700">• {s}</li>)}</ul>
        <p className="text-[10px] text-indigo-400">AI 生成，需经体育教师审核后使用</p>
      </CardContent></Card>

      {/* 五维能力结构 */}
      <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">五维能力结构</CardTitle></CardHeader>
        <CardContent>
          {sportDimsWithData.length >= 3 ? <FitnessRadarChart data={allRadarData} height={280} showComparison /> : (
            <div className="py-6 text-center"><p className="text-sm text-muted-foreground">已录数据不足以形成雷达图，请至少补充 3 个维度</p><Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-2"><PlusCircle className="h-3.5 w-3.5" />补充体测项目</Button></Link></div>
          )}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dimDefs.map(d => {
              const myScoreVal = allRadarData.find(r => r.dimension === d.dimension)?.score ?? null;
              const ca = classAvgs[d.itemId];
              const clsAvg = ca?.hasData ? ca.avgScore : null;
              const diff = myScoreVal !== null && clsAvg !== null ? myScoreVal - clsAvg : null;
              return (
                <div key={d.dimension} className="rounded-lg border p-2.5 space-y-1">
                  <p className="text-[11px] font-medium">{d.dimension}</p>
                  <p className="text-lg font-bold tabular-nums">{myScoreVal !== null ? myScoreVal : "-"}</p>
                  {clsAvg !== null ? (
                    <p className="text-[10px] text-muted-foreground">班均 {clsAvg}{diff !== null && (diff >= 0 ? ` · 高于 +${diff}` : ` · 低于 ${diff}`)}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">班级样本不足</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">来源：{d.sourceName}</p>
                  <Badge variant={myScoreVal != null && myScoreVal >= 80 ? "excellent" : myScoreVal != null && myScoreVal >= 60 ? "pass" : "secondary"} className="text-[9px]">
                    {myScoreVal != null ? (myScoreVal >= 80 ? "优势" : myScoreVal >= 60 ? "稳定" : "待关注") : "暂无数据"}
                  </Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">实线=你的表现 · 虚线=班级均值 · 五维能力为平台画像维度整合，正式体测成绩参考国家学生体质健康标准</p>
        </CardContent>
      </Card>

      {/* 趋势图 */}
      {trendOptions.length > 0 && <PortraitTrendSection options={trendOptions} />}

      {/* 优势/待提升 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-level-excellent" />优势项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {strengths.length > 0 ? strengths.map(s => {
              const def = FITNESS_ITEMS.find(d => d.id === s.itemId);
              const ca = classAvgs[s.itemId]; const diff = ca?.hasData ? s.score - ca.avgScore : null;
              return (<div key={s.itemId} className="rounded-lg border p-2.5"><div className="flex items-center justify-between"><span className="text-sm font-medium">{def?.name ?? s.itemId}</span><Badge variant="excellent" className="text-[10px]">{s.score}分</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">{def?.name ?? ""}表现良好{diff !== null && diff > 0 ? `，高于班均 +${diff}` : ""}，继续保持</p></div>);
            }) : <p className="text-sm text-muted-foreground">整体表现均衡</p>}
          </CardContent></Card>
        <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Target className="h-4 w-4 text-level-pass" />待提升项目</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {improvements.length > 0 ? improvements.map(s => {
              const def = FITNESS_ITEMS.find(d => d.id === s.itemId);
              return (<div key={s.itemId} className="rounded-lg border p-2.5"><div className="flex items-center justify-between"><span className="text-sm font-medium">{def?.name ?? s.itemId}</span><Badge variant="pass" className="text-[10px]">{s.score}分</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">有提升空间，建议逐步改善{def?.name ?? "该项目"}</p></div>);
            }) : <p className="text-sm text-muted-foreground">各项表现均衡</p>}
            {improvements.length > 0 && <p className="text-[11px] text-muted-foreground">建议从低强度训练开始，逐步提升</p>}
          </CardContent></Card>
      </div>

      {/* 评分标准与数据来源 */}
      <Card className="rounded-xl border shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-muted-foreground" />评分标准与数据来源</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <p>• 当前画像基于 {student.name} · {student.grade} · {latestRecord.semester}，已录入 {completeness.recordedCount}/{completeness.expectedCount} 项</p>
          <p>• 正式体测项目评分参考《国家学生体质健康标准（2014年修订）》高中阶段相关项目</p>
          <p>• 五维能力结构是平台根据正式体测项目进行维度映射后的画像展示</p>
          <p>• 班级均值来自当前班级真实已录入数据（有效样本 ≥3 人），不足时标注"样本不足"</p>
          <p>• AI 画像摘要基于结构化体测数据生成，仅作为体育教师审核前的参考建议</p>
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
