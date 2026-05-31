// ===== 跃动智体 — 学生详情页 =====
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FitnessRadarChart } from "@/components/charts/fitness-radar-chart";
import { StudentReviewStatus } from "@/components/features/student-review-status";
import { getFitnessRecords, getLatestFitnessRecord, getStudentProfile } from "@/lib/server/data-service";
import { FITNESS_ITEMS, GRADE_STANDARDS } from "@/lib/constants";
import {
  User,
  Activity,
  Weight,
  Ruler,
  TrendingUp,
  Target,
  AlertTriangle,
} from "lucide-react";
import type { RadarChartDataPoint } from "@/lib/types";

interface StudentDetailPageProps {
  params: { id: string };
}

function formatDisplayDate(date: string) {
  const [day] = date.split("T");
  return day || date;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const student = await getStudentProfile(params.id);

  if (!student) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <PageHeader title="学生详情" backHref="/teacher/students" />
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">未找到该学生</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestRecord = await getLatestFitnessRecord(student.id);
  const allRecords = await getFitnessRecords(student.id);

  // 雷达图
  const radarData: RadarChartDataPoint[] = latestRecord ? [
    { dimension: "速度", score: latestRecord.items.find(i => i.itemId === "50m_run")?.score ?? 0, classAverage: 70, fullMark: 100 },
    { dimension: "力量", score: latestRecord.items.find(i => i.itemId === "pull_up" || i.itemId === "sit_up")?.score ?? 0, classAverage: 65, fullMark: 100 },
    { dimension: "耐力", score: latestRecord.items.find(i => i.itemId === "1000m_run" || i.itemId === "800m_run")?.score ?? 0, classAverage: 66, fullMark: 100 },
    { dimension: "柔韧", score: latestRecord.items.find(i => i.itemId === "sit_and_reach")?.score ?? 0, classAverage: 72, fullMark: 100 },
    { dimension: "身体形态", score: 82, classAverage: 74, fullMark: 100 },
  ] : [];

  const avgScore = latestRecord
    ? Math.round(latestRecord.items.reduce((sum, i) => sum + i.score, 0) / latestRecord.items.length)
    : null;

  const gradeTier = avgScore
    ? Object.values(GRADE_STANDARDS).find(g => avgScore >= g.minScore)
    : null;

  const strengths = latestRecord
    ? latestRecord.items.filter(i => i.grade === "excellent" || i.grade === "good")
        .map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId)
    : [];

  const improvements = latestRecord
    ? latestRecord.items.filter(i => i.grade === "improve" || i.grade === "pass")
        .map(i => FITNESS_ITEMS.find(d => d.id === i.itemId)?.name ?? i.itemId)
    : [];

  const needsAttention = student.discomforts.filter(d => d !== "none").length > 0
    || (avgScore !== null && avgScore < 60);

  const bmiLabel = student.bmi < 18.5 ? "BMI 指标值得关注"
    : student.bmi < 24 ? "正常范围"
    : "BMI 指标值得关注";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title={`${student.name} · ${student.id}`}
        description={`${student.grade} · ${student.gender === "male" ? "男生" : "女生"} · ${student.age}岁`}
        backHref="/teacher/students"
      />

      {/* 基础信息 + 审核状态 */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="rounded-xl shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
                needsAttention ? "bg-level-improve/10" : "bg-muted"
              }`}>
                <User className={`h-7 w-7 ${
                  needsAttention ? "text-level-improve" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <CardTitle className="text-base">{student.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[11px]">{student.id}</Badge>
                  {needsAttention && <Badge variant="improve" className="text-[11px]">需要关注</Badge>}
                  {avgScore && gradeTier && (
                    <Badge variant={
                      gradeTier.label === "优秀" ? "excellent"
                      : gradeTier.label === "良好" ? "good"
                      : gradeTier.label === "及格" ? "pass"
                      : "improve"
                    } className="text-[11px]">{gradeTier.label} · {avgScore}分</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <Ruler className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-lg font-bold tabular-nums">{student.height}</p>
                <p className="text-[11px] text-muted-foreground">身高 cm</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <Weight className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-lg font-bold tabular-nums">{student.weight}</p>
                <p className="text-[11px] text-muted-foreground">体重 kg</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <Activity className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-lg font-bold tabular-nums">{student.bmi}</p>
                <p className="text-[11px] text-muted-foreground">{bmiLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 审核状态卡 */}
        <StudentReviewStatus studentId={student.id} />
      </div>

      {/* 体质雷达图 */}
      {radarData.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">体质雷达图</CardTitle>
          </CardHeader>
          <CardContent>
            <FitnessRadarChart data={radarData} height={300} showComparison />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              虚线为班级均值，实线为该生表现
            </p>
          </CardContent>
        </Card>
      )}

      {/* 优弱势 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-level-excellent" />
              优势项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {strengths.map(s => (
                  <Badge key={s} variant="excellent" className="text-[11px]">{s}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无特别突出项目</p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Target className="h-4 w-4 text-level-pass" />
              待提升项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvements.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {improvements.map(s => (
                  <Badge key={s} variant="pass" className="text-[11px]">{s}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">各项较为均衡</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 体测记录列表 */}
      {allRecords.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">体测记录 ({allRecords.length}次)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allRecords.map((r) => (
                <div key={r.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{r.semester}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDisplayDate(r.date)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.items.map((item) => {
                      const def = FITNESS_ITEMS.find(d => d.id === item.itemId);
                      return (
                        <Badge key={item.itemId} variant="outline" className="text-[11px]">
                          {def?.name ?? item.itemId}: {item.value}{def?.unit ?? ""} ({item.grade === "excellent" ? "优秀" : item.grade === "good" ? "良好" : item.grade === "pass" ? "及格" : "待提升"})
                        </Badge>
                      );
                    })}
                  </div>
                  {r.bodyFeeling && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      体感：疲劳 {r.bodyFeeling.fatigueLevel}/10 · 恢复 {r.bodyFeeling.recoveryStatus === "quick" ? "很快" : r.bodyFeeling.recoveryStatus === "normal" ? "正常" : "较慢"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 无记录 */}
      {!latestRecord && (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-8 text-center space-y-3">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">该学生暂无体测记录</p>
            <p className="text-xs text-muted-foreground">
              记录将通过学生端 App 录入
            </p>
          </CardContent>
        </Card>
      )}

      {/* 安全提醒 */}
      {student.discomforts.filter(d => d !== "none").length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-level-pass" />
              需要关注的健康信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              此信息仅教师可见，用于确保运动安全
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {student.discomforts.filter(d => d !== "none").map(d => (
                <Badge key={d} variant="outline" className="text-[11px]">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 强制动态渲染（因为使用了 params）
export const dynamic = "force-dynamic";
