// ===== 跃动智体 — 学生首页 =====
import { DashboardHero } from "@/components/features/dashboard-hero";
import { EmptyState } from "@/components/features/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFitnessRecords, getLatestFitnessRecord, getStudentProfile } from "@/lib/server/data-service";
import { FITNESS_ITEMS } from "@/lib/constants";
import {
  Target,
  ChevronRight,
  Clock,
  BarChart3,
  Sparkles,
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

export default async function DashboardPage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const latestRecord = studentId ? await getLatestFitnessRecord(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];

  if (!student || !latestRecord) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <EmptyState
          title="欢迎使用跃动智体"
          description="完成首次体测记录后，这里将展示你的体质概况和 AI 建议"
          action={
            <Link href="/record">
              <span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                开始首次记录
              </span>
            </Link>
          }
        />
      </div>
    );
  }

  const avgScore = Math.round(
    latestRecord.items.reduce((sum, i) => sum + i.score, 0) / latestRecord.items.length
  );

  const improvements = latestRecord.items
    .filter((i) => i.grade === "improve" || i.grade === "pass")
    .map((i) => FITNESS_ITEMS.find((d) => d.id === i.itemId)?.name ?? i.itemId);

  const bmiLabel =
    student.bmi < 18.5 ? "BMI 指标值得关注"
    : student.bmi < 24 ? "正常范围"
    : "BMI 指标值得关注";

  const lastRecordItems = latestRecord.items.slice(0, 3).map((i) => ({
    name: FITNESS_ITEMS.find((d) => d.id === i.itemId)?.name ?? i.itemId,
    score: i.score,
    grade: i.grade,
  }));

  // 获取得分最低的项目作为本周关注方向
  const worstItem = latestRecord.items.reduce((a, b) => (a.score < b.score ? a : b));

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      {/* ==== 问候 + CTA ==== */}
      <DashboardHero
        studentName={student.name}
        avgScore={avgScore}
        semester={latestRecord.semester}
      />

      {/* ==== 状态简卡 ==== */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{avgScore}</p>
            <p className="text-[11px] text-muted-foreground">综合评分</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-sm font-semibold">{bmiLabel}</p>
            <p className="text-[11px] text-muted-foreground">BMI</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{improvements.length}</p>
            <p className="text-[11px] text-muted-foreground">待提升</p>
          </CardContent>
        </Card>
      </div>

      {/* ==== 最近记录摘要 ==== */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">最近记录</p>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {latestRecord.semester}
            </span>
          </div>
          <div className="space-y-1.5">
            {lastRecordItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <Badge
                  variant={item.grade === "excellent" || item.grade === "good" ? "excellent" : "pass"}
                  className="text-[10px]"
                >
                  {item.score}分
                </Badge>
              </div>
            ))}
          </div>
          {allRecords.length > 1 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              共 {allRecords.length} 次记录
            </p>
          )}
        </CardContent>
      </Card>

      {/* ==== 今日小洞察 ==== */}
      {improvements.length > 0 && worstItem && (
        <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">本周关注</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {FITNESS_ITEMS.find((d) => d.id === worstItem.itemId)?.name ?? ""}
                {" "}维度有提升空间，可以从低强度训练开始改善
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==== 快捷入口 ==== */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/portrait">
          <Card className="cursor-pointer rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">体质画像</p>
                <p className="text-xs text-muted-foreground">雷达图、趋势与项目详情</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/ai-guide">
          <Card className="cursor-pointer rounded-xl shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">AI 指导</p>
                <p className="text-xs text-muted-foreground">个性化训练建议与安全提醒</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">AI</Badge>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
