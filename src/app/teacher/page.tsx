// ===== 跃动智体 — 教师端班级总览 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/charts/stat-card";
import { ClassBarChart } from "@/components/charts/class-bar-chart";
import { LevelDonutChart } from "@/components/charts/level-donut-chart";
import { Badge } from "@/components/ui/badge";
import { getClassSummary } from "@/lib/server/data-service";
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

export default async function TeacherOverviewPage() {
  const summary = await getClassSummary();

  return (
    <div className="mx-auto max-w-6xl space-y-5 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
      {/* ===== 页面标题 — 全宽 ===== */}
      <div className="lg:col-span-12">
        <PageHeader title="初二(3)班" description="2025年春季学期" />
      </div>

      {/* ===== 今日教学建议 — 全宽 ===== */}
      <div className="lg:col-span-12">
        <Card className="rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">今日教学建议</h2>
              <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                数据库统计 · 演示模式
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">
              本周重点加强耐力训练，建议安排2次中长跑练习。班级50米跑及格率偏低，可融入短跑技术教学。引体向上及格率仅55%，建议每节课安排上肢力量训练环节。课堂可采用分层教学模式，将学生按能力分组进行差异化训练。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== 快速统计卡片行 — 全宽 ===== */}
      <div className="lg:col-span-12">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          数据概览
        </p>
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
      </div>

      {/* ===== 待审核提醒 — 全宽 ===== */}
      {summary.pendingReviewCount > 0 && (
        <div className="lg:col-span-12">
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
                    共有 {summary.pendingReviewCount} 份AI报告等待您的审核确认
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                  前往审核
                  <ChevronRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* ===== 图表区 — 8 列 ===== */}
      <div className="lg:col-span-8">
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
              <LevelDonutChart data={summary.levelData} height={300} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== 侧边栏 — 4 列 ===== */}
      <div className="lg:col-span-4 space-y-5">
        {/* 重点关注学生 */}
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
                  href={`/teacher/students/${s.studentId}`}
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

        {/* 快捷入口 */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
    </div>
  );
}

export const dynamic = "force-dynamic";
