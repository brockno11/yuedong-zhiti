// ===== 跃动智体 — 教师端班级总览 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/charts/stat-card";
import { ClassBarChart } from "@/components/charts/class-bar-chart";
import { LevelDonutChart } from "@/components/charts/level-donut-chart";
import { Badge } from "@/components/ui/badge";
import { mockClassSummary, mockTeacherReviews } from "@/lib/data/mock-ai-reports";
import {
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  ChevronRight,
  Activity,
  Target,
  Lightbulb,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { DonutChartSegment } from "@/lib/types";

export default function TeacherOverviewPage() {
  const summary = mockClassSummary;
  const pendingReviewCount = mockTeacherReviews.filter(
    (r) => r.status === "pending"
  ).length;

  // 等级分布数据
  const levelData: DonutChartSegment[] = [
    { grade: "excellent", label: "优秀", count: 3, percentage: 15 },
    { grade: "good", label: "良好", count: 7, percentage: 35 },
    { grade: "pass", label: "及格", count: 7, percentage: 35 },
    { grade: "improve", label: "待提升", count: 3, percentage: 15 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader title="初二(3)班" description="2025年春季学期" />

      {/* ===== 今日教学建议 — 页面核心价值 ===== */}
      <Card className="rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">今日教学建议</h2>
            <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
              AI生成 · 待审核
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">
            本周重点加强耐力训练，建议安排2次中长跑练习。班级50米跑及格率偏低，可融入短跑技术教学。引体向上及格率仅55%，建议每节课安排上肢力量训练环节。课堂可采用分层教学模式，将学生按能力分组进行差异化训练。
          </p>
        </CardContent>
      </Card>

      {/* ===== 快速统计卡片行 ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="班级人数"
          value={summary.totalStudents}
          unit="人"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="已记录"
          value={summary.recordedStudents}
          unit="人"
          icon={<UserCheck className="h-5 w-5 text-level-good" />}
        />
        <StatCard
          title="平均BMI"
          value={summary.averageBmi}
          icon={<Activity className="h-5 w-5 text-level-pass" />}
        />
        <StatCard
          title="及格率"
          value={`${summary.passRate}%`}
          trend="up"
          trendValue="vs 上学期"
          icon={<TrendingUp className="h-5 w-5 text-level-excellent" />}
          color="excellent"
        />
      </div>

      {/* ===== 待审核提醒 ===== */}
      {pendingReviewCount > 0 && (
        <Link href="/teacher/review">
          <Card className="cursor-pointer rounded-xl border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-level-improve/10">
                <Clock className="h-5 w-5 text-level-improve" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-level-improve opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-level-improve" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">待审核报告</p>
                <p className="truncate text-xs text-muted-foreground">
                  共有 {pendingReviewCount} 份AI报告等待您的审核确认
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                前往审核
                <ChevronRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* ===== 图表区 ===== */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 薄弱项排行 */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-level-pass" />
              班级薄弱项排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClassBarChart data={summary.weakItemRanking} height={300} />
          </CardContent>
        </Card>

        {/* 等级分布 */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">体测等级分布</CardTitle>
          </CardHeader>
          <CardContent>
            <LevelDonutChart data={levelData} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* ===== 重点关注学生 ===== */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-level-improve" />
            重点关注学生
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.attentionStudents.map((s) => (
              <Link
                key={s.studentId}
                href="/teacher/students"
                className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {s.reason}
                  </p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 self-center text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== 快捷入口 ===== */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/teacher/report">
          <Card className="cursor-pointer rounded-xl border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">AI 班级报告</p>
                <p className="truncate text-xs text-muted-foreground">
                  查看班级体质分析与教学建议
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/students">
          <Card className="cursor-pointer rounded-xl border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">学生列表</p>
                <p className="truncate text-xs text-muted-foreground">
                  查看全部学生体测数据与管理
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
