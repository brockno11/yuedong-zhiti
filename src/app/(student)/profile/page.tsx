// ===== 跃动智体 — 个人中心 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFitnessRecords, getStudentProfile, getStudentReportHistory } from "@/lib/server/data-service";
import { SPORT_GOAL_OPTIONS, SPORT_BASE_OPTIONS, DISCOMFORT_OPTIONS } from "@/lib/constants";
import {
  User,
  Target,
  Activity,
  Heart,
  Shield,
  Sparkles,
  FileText,
  ChevronRight,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/features/logout-button";
import { ProfileBodyEditor } from "@/components/features/profile-body-editor";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try {
    const store = cookies();
    return store.get("demo_student_id")?.value || "";
  } catch {
    return "";
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "暂无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export default async function ProfilePage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const records = studentId ? await getFitnessRecords(studentId) : [];
  const reportHistory = studentId ? await getStudentReportHistory(studentId) : [];

  if (!student) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="个人中心" />
        <p className="text-sm text-muted-foreground">请先完成首次引导</p>
      </div>
    );
  }

  const sportGoalLabel =
    SPORT_GOAL_OPTIONS.find((o) => o.value === student.sportGoal)?.label ?? "";
  const sportBaseLabel =
    SPORT_BASE_OPTIONS.find((o) => o.value === student.sportBase)?.label ?? "";
  const discomfortLabels = student.discomforts
    .filter((d) => d !== "none")
    .map(
      (d) => DISCOMFORT_OPTIONS.find((o) => o.value === d)?.label ?? d
    );

  // Context stats
  const officialRecords = records.filter((r) => r.recordType === "official_test");
  const latestOfficial = officialRecords[0] ?? null;
  const dailyRecords = records.filter((r) => r.recordType === "daily_training");
  const latestDaily = dailyRecords[0] ?? null;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <PageHeader title="个人中心" />

      {/* 基础信息卡片 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle>{student.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {student.grade} · {student.gender === "male" ? "男生" : "女生"} ·{" "}
                {student.age}岁
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 身体数据 — editable */}
      <ProfileBodyEditor
        studentId={studentId}
        height={student.height}
        weight={student.weight}
        bmi={student.bmi}
        age={student.age}
      />

      {/* 体测与训练概况 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">体测与训练概况</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">正式体测</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{officialRecords.length}</p>
              <p className="text-[10px] text-muted-foreground">
                {latestOfficial ? `最近：${formatDate(latestOfficial.date)}` : "暂无记录"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">日常训练</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{dailyRecords.length}</p>
              <p className="text-[10px] text-muted-foreground">
                {latestDaily ? `最近：${formatDate(latestDaily.date)}` : "暂无记录"}
              </p>
            </div>
          </div>

          {/* Clickable entries — AI报告 + 历史记录 */}
          <div className="space-y-2">
            <Link href="/ai-reports">
              <div className="flex items-center justify-between rounded-lg bg-muted/20 p-3 cursor-pointer transition-colors hover:bg-muted/40 active:scale-[0.98]">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">AI 报告</p>
                    <p className="text-[10px] text-muted-foreground">查看所有 AI 生成的分析报告</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tabular-nums">{reportHistory.length} 份</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>

            <Link href="/records">
              <div className="flex items-center justify-between rounded-lg bg-muted/20 p-3 cursor-pointer transition-colors hover:bg-muted/40 active:scale-[0.98]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">历史记录</p>
                    <p className="text-[10px] text-muted-foreground">查看所有体测与训练记录</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tabular-nums">{records.length} 次</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 目标与基础 */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              运动目标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{sportGoalLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-level-good" />
              运动基础
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{sportBaseLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* 需要关注的身体情况 */}
      {discomfortLabels.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-level-improve" />
              需关注的身体情况
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {discomfortLabels.map((label) => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <AlertCircle className="inline h-3 w-3 mr-0.5" />
              此信息仅你与体育教师可见，用于确保运动安全
            </p>
          </CardContent>
        </Card>
      )}

      {/* 隐私说明 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            隐私与安全
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            • 你的体测数据仅你和你的体育教师可以查看
          </p>
          <p className="text-xs text-muted-foreground">
            • 身体不适信息严格保密，仅用于运动安全指导
          </p>
          <p className="text-xs text-muted-foreground">
            • 数据不会公开显示，不会用于横向比较
          </p>
        </CardContent>
      </Card>

      {/* AI 使用说明 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            • AI 分析仅提供体育锻炼参考建议
          </p>
          <p className="text-xs text-muted-foreground">
            • AI 不替代专业判断，不提供健康结论
          </p>
          <p className="text-xs text-muted-foreground">
            • AI 生成内容需经体育教师审核后使用
          </p>
          <p className="text-xs text-muted-foreground">
            • 如有身体不适，请及时告知体育教师
          </p>
        </CardContent>
      </Card>

      {/* 退出登录 */}
      <LogoutButton />
    </div>
  );
}
