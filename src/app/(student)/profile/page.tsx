// ===== 跃动智体 — 个人中心 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStudentById } from "@/lib/data/mock-students";
import { getRecordsByStudentId } from "@/lib/data/mock-fitness-records";
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
  Weight,
  Ruler,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const DEMO_STUDENT_ID = "S001";

export default function ProfilePage() {
  const student = getStudentById(DEMO_STUDENT_ID);
  const records = getRecordsByStudentId(DEMO_STUDENT_ID);

  if (!student) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="个人中心" backHref="/" />
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
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {student.height}
                </p>
                <p className="text-xs text-muted-foreground">身高 (cm)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {student.weight}
                </p>
                <p className="text-xs text-muted-foreground">体重 (kg)</p>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-lg font-bold tabular-nums">{student.bmi}</p>
            <p className="text-xs text-muted-foreground">BMI (kg/m²)</p>
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

      {/* 历史记录入口 */}
      <Link href="/record">
        <Card className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">历史记录</p>
                <p className="text-xs text-muted-foreground">
                  共 {records.length} 次体测记录
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <Separator />

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
    </div>
  );
}
