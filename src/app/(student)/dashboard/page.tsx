// ===== 跃动智体 — 体质画像仪表盘 =====
import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, BarChart3, ChevronRight, ShieldCheck, Target, Trophy, Weight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/charts/stat-card";
import { FitnessRadarChart } from "@/components/charts/fitness-radar-chart";
import { FitnessTrendChart } from "@/components/charts/fitness-trend-chart";
import { EmptyState } from "@/components/features/empty-state";
import { getLatestRecord, getRecordsByStudentId } from "@/lib/data/mock-fitness-records";
import { getStudentById } from "@/lib/data/mock-students";
import { FITNESS_ITEMS } from "@/lib/constants";
import type { RadarChartDataPoint, TrendChartDataPoint } from "@/lib/types";

const DEMO_STUDENT_ID = "S001";

export default function DashboardPage() {
  const student = getStudentById(DEMO_STUDENT_ID);
  const latestRecord = getLatestRecord(DEMO_STUDENT_ID);
  const allRecords = getRecordsByStudentId(DEMO_STUDENT_ID);

  if (!student || !latestRecord) {
    return (
      <div className="content-breathing-room max-w-2xl">
        <PageHeader title="体质画像" description="你的体测数据可视化分析" />
        <EmptyState
          title="暂无记录"
          description="请先完成首次体测记录，体质画像将在这里展示"
          action={
            <Link href="/record">
              <Button>开始记录</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const radarData: RadarChartDataPoint[] = [
    {
      dimension: "速度",
      score: latestRecord.items.find((item) => item.itemId === "50m_run")?.score ?? 0,
      classAverage: 70,
      fullMark: 100,
    },
    {
      dimension: "力量",
      score:
        latestRecord.items.find((item) => item.itemId === "pull_up" || item.itemId === "sit_up")
          ?.score ?? 0,
      classAverage: 65,
      fullMark: 100,
    },
    {
      dimension: "耐力",
      score:
        latestRecord.items.find(
          (item) => item.itemId === "1000m_run" || item.itemId === "800m_run"
        )?.score ?? 0,
      classAverage: 66,
      fullMark: 100,
    },
    {
      dimension: "柔韧",
      score: latestRecord.items.find((item) => item.itemId === "sit_and_reach")?.score ?? 0,
      classAverage: 72,
      fullMark: 100,
    },
    {
      dimension: "身体形态",
      score: 82,
      classAverage: 74,
      fullMark: 100,
    },
  ];

  const trendData: TrendChartDataPoint[] = allRecords
    .filter((record) => record.items.some((item) => item.itemId === "50m_run"))
    .slice(0, 2)
    .reverse()
    .map((record) => {
      const runItem = record.items.find((item) => item.itemId === "50m_run");
      return {
        date: record.semester,
        value: runItem?.value ?? 0,
        grade: runItem?.grade ?? "pass",
      };
    });

  const avgScore = Math.round(
    latestRecord.items.reduce((sum, item) => sum + item.score, 0) / latestRecord.items.length
  );

  const strengths = latestRecord.items
    .filter((item) => item.grade === "excellent" || item.grade === "good")
    .map((item) => FITNESS_ITEMS.find((def) => def.id === item.itemId)?.name ?? item.itemId);

  const improvements = latestRecord.items
    .filter((item) => item.grade === "pass" || item.grade === "improve")
    .map((item) => FITNESS_ITEMS.find((def) => def.id === item.itemId)?.name ?? item.itemId);

  return (
    <div className="content-breathing-room space-y-6">
      <PageHeader
        title="体质画像"
        description={`${student.name} · ${latestRecord.semester}`}
        backHref="/"
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="app-card-elevated md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">综合评分</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold tabular-nums">{avgScore}</span>
                  <span className="pb-1 text-sm text-muted-foreground">分</span>
                </div>
                <Badge variant="excellent" className="mt-3">整体表现良好</Badge>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[9px] border-primary/15 bg-primary/10">
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <StatCard
          title="BMI"
          value={student.bmi}
          unit="kg/m²"
          icon={<Weight className="h-5 w-5 text-muted-foreground" />}
          description={student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注"}
        />
        <StatCard
          title="优势项目"
          value={strengths.length}
          unit="项"
          icon={<Trophy className="h-5 w-5 text-level-excellent" />}
          color="excellent"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-12">
        <Card className="app-card lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">体质雷达图</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  对比个人表现与班级平均，帮助定位优势和提升方向
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">五维画像</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FitnessRadarChart data={radarData} height={340} showComparison />
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-5">
          <Card className="app-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-level-pass" />
                本期洞察
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InsightRow label="优势保持" value={strengths.slice(0, 2).join("、") || "暂无突出项目"} />
              <InsightRow label="优先提升" value={improvements.slice(0, 2).join("、") || "各项表现均衡"} />
              <InsightRow label="训练建议" value="每周保持 2-3 次循序渐进练习" />
            </CardContent>
          </Card>

          <Link href="/ai-guide" className="block">
            <Card className="app-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">查看 AI 体质分析</p>
                  <p className="text-xs text-muted-foreground">
                    生成个性化训练参考，需教师审核后使用
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-12">
        {trendData.length >= 2 && (
          <Card className="app-card lg:col-span-7">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">50米跑成绩趋势</CardTitle>
              <p className="text-xs text-muted-foreground">
                趋势图用于观察阶段性变化，不用于学生之间横向比较
              </p>
            </CardHeader>
            <CardContent>
              <FitnessTrendChart data={trendData} height={260} unit="秒" />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          <ProjectListCard title="优势项目" icon={<Trophy className="h-4 w-4 text-level-excellent" />} items={strengths} tone="excellent" />
          <ProjectListCard title="待提升项目" icon={<Target className="h-4 w-4 text-level-pass" />} items={improvements} tone="pass" />
        </div>
      </section>

      <Card className="app-card">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-level-good" />
          <div>
            <p className="text-sm font-medium">AI 生成内容需教师审核</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              体质分析与训练计划仅作体育锻炼参考，须经体育教师审核授权后实施。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5">{value}</p>
    </div>
  );
}

function ProjectListCard({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone: "excellent" | "pass";
}) {
  const dotClassName = tone === "excellent" ? "bg-level-excellent" : "bg-level-pass";

  return (
    <Card className="app-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">各项表现均衡</p>
        )}
      </CardContent>
    </Card>
  );
}
