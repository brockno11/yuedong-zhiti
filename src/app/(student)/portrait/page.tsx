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
import type { RadarChartDataPoint, TrendChartDataPoint } from "@/lib/types";
import {
  Activity,
  TrendingUp,
  Target,
  Lightbulb,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try {
    const store = cookies();
    return store.get("demo_student_id")?.value || "";
  } catch {
    return "";
  }
}

export default async function PortraitPage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const latestRecord = studentId ? await getLatestFitnessRecord(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];

  if (!student || !latestRecord) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <EmptyState
          title="暂无体质数据"
          description="完成首次体测记录后，这里将展示完整的体质画像"
          action={
            <Link href="/record">
              <span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                开始记录
              </span>
            </Link>
          }
        />
      </div>
    );
  }

  // 雷达图数据
  const radarData: RadarChartDataPoint[] = [
    { dimension: "速度", score: latestRecord.items.find(i => i.itemId === "50m_run")?.score ?? 0, classAverage: 70, fullMark: 100 },
    { dimension: "力量", score: latestRecord.items.find(i => i.itemId === "pull_up" || i.itemId === "sit_up")?.score ?? 0, classAverage: 65, fullMark: 100 },
    { dimension: "耐力", score: latestRecord.items.find(i => i.itemId === "1000m_run" || i.itemId === "800m_run")?.score ?? 0, classAverage: 66, fullMark: 100 },
    { dimension: "柔韧", score: latestRecord.items.find(i => i.itemId === "sit_and_reach")?.score ?? 0, classAverage: 72, fullMark: 100 },
    { dimension: "身体形态", score: 82, classAverage: 74, fullMark: 100 },
  ];

  // 趋势数据
  const trendData: TrendChartDataPoint[] = allRecords
    .filter(r => r.items.some(i => i.itemId === "50m_run"))
    .slice(0, 3)
    .reverse()
    .map(r => {
      const runItem = r.items.find(i => i.itemId === "50m_run")!;
      return { date: r.semester, value: runItem.value, grade: runItem.grade };
    });

  const avgScore = Math.round(
    latestRecord.items.reduce((sum, i) => sum + i.score, 0) / latestRecord.items.length
  );

  const strengths = latestRecord.items
    .filter(i => i.grade === "excellent" || i.grade === "good")
    .map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId);

  const improvements = latestRecord.items
    .filter(i => i.grade === "improve" || i.grade === "pass")
    .map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId);

  const radarWithData = radarData.filter(d => d.score !== null);
  const lowestDimension = radarWithData.length > 0
    ? radarWithData.reduce((a, b) => (a.score! < b.score!) ? a : b)
    : null;
  const scoreForInsight = lowestDimension?.score ?? 0;
  const insightText = scoreForInsight < 60
    ? `${lowestDimension!.dimension}维度有提升空间，建议从低强度训练开始逐步改善`
    : "各维度表现较为均衡，继续保持当前训练节奏";

  const bmiLabel = student.bmi < 18.5 ? "BMI 指标值得关注"
    : student.bmi < 24 ? "正常范围"
    : "BMI 指标值得关注";

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-0">
      <PageHeader
        title="体质画像"
        description={`${student.name} · ${student.grade} · ${latestRecord.semester}`}
      />

      {/* ===== 核心指标 + 洞察 ===== */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="rounded-xl border shadow-sm lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              综合评分
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tabular-nums">{avgScore}</span>
              <span className="text-sm text-muted-foreground">分</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> BMI {student.bmi} · {bmiLabel}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">本期洞察</p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{insightText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {strengths.length > 0 && (
                <Badge variant="excellent" className="text-[11px]">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  优势：{strengths.slice(0, 2).join("、")}
                </Badge>
              )}
              {improvements.length > 0 && (
                <Badge variant="pass" className="text-[11px]">
                  <Target className="mr-1 h-3 w-3" />
                  待提升：{improvements.slice(0, 2).join("、")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== 雷达图 ===== */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">体质雷达图</CardTitle>
        </CardHeader>
        <CardContent>
          <FitnessRadarChart data={radarData} height={300} showComparison />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {lowestDimension
              ? `虚线为班级均值，实线为你的表现。${lowestDimension.dimension}维度的提升空间最大`
              : "虚线为班级均值，实线为你的表现"}
          </p>
        </CardContent>
      </Card>

      {/* ===== 趋势图 ===== */}
      {trendData.length >= 2 && (
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">50米跑趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <FitnessTrendChart data={trendData} height={200} unit="秒" />
          </CardContent>
        </Card>
      )}

      {/* ===== 优势 / 待提升 ===== */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-level-excellent" />
              优势项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-1.5">
                {strengths.map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-level-excellent" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">各方面均衡发展</p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Target className="h-4 w-4 text-level-pass" />
              待提升项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvements.length > 0 ? (
              <ul className="space-y-1.5">
                {improvements.map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-level-pass" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">各项表现均衡</p>
            )}
            {improvements.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                建议优先从低强度训练开始，逐步提升
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== 记录新数据入口 ===== */}
      <div className="flex justify-center">
        <Link href="/record">
          <Button variant="outline" size="sm" className="gap-1.5 h-10">
            <PlusCircle className="h-4 w-4" />
            记录新数据
          </Button>
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
