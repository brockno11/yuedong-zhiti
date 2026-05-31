// ===== 跃动智体 — 学生首页 =====
import { EmptyState } from "@/components/features/empty-state";
import { RecentRecordCard } from "@/components/features/recent-record-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFitnessRecords, getLatestFitnessRecord, getStudentProfile } from "@/lib/server/data-service";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import { Target, ChevronRight, BarChart3, Sparkles, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try { const store = cookies(); return store.get("demo_student_id")?.value || ""; }
  catch { return ""; }
}

// 批次聚合
function getBatchLatestItems(records: { items: { itemId: string; score: number; value: number; grade: string }[] }[]) {
  const map = new Map<string, { itemId: string; score: number; value: number; grade: string }>();
  for (const r of records) for (const i of r.items) { if (!map.has(i.itemId)) map.set(i.itemId, i); }
  return Array.from(map.values());
}

export default async function DashboardPage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const latestRecord = studentId ? await getLatestFitnessRecord(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];

  if (!student || !latestRecord) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <EmptyState title="欢迎使用跃动智体" description="完成首次体测记录后，这里将展示你的体质概况"
          action={<Link href="/record"><span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">开始首次记录</span></Link>}
        />
      </div>
    );
  }

  const batchItems = getBatchLatestItems(allRecords);
  const batchItemIds = batchItems.map(i => i.itemId);
  const completeness = calculateRecordCompleteness(batchItemIds, student.gender);
  const avgScore = Math.round(batchItems.reduce((sum, i) => sum + i.score, 0) / batchItems.length);
  const bmiLabel = student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注";
  const missingNames = completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).slice(0, 3);

  const greeting = (() => { const h = new Date().getHours(); return h < 11 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好"; })();
  const statusLine = completeness.isComplete
    ? `当前批次已完整记录 ${completeness.recordedCount}/${completeness.expectedCount} 项`
    : `还有 ${completeness.missingItems.length} 项待补充，建议继续完成记录`;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      {/* ===== 1. 今日行动 Hero ===== */}
      <div className="rounded-2xl bg-primary p-5 sm:p-6 text-primary-foreground shadow-sm">
        <p className="text-sm opacity-80">{greeting}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{student.name}</h1>
        <p className="mt-1.5 text-sm opacity-90">{statusLine}</p>

        {completeness.isPartial && missingNames.length > 0 && (
          <p className="mt-1.5 text-xs opacity-70">待补充：{missingNames.join("、")}{completeness.missingItems.length > 3 ? ` 等${completeness.missingItems.length}项` : ""}</p>
        )}

        <Link href="/record">
          <Button size="lg" className="mt-4 w-full gap-2 h-12 text-base bg-white text-primary hover:bg-white/90 shadow-sm">
            <PlusCircle className="h-5 w-5" />
            {completeness.isPartial ? "继续补录" : completeness.isComplete ? "记录日常训练" : "开始记录"}
          </Button>
        </Link>

        <div className="mt-3 flex gap-3 text-xs opacity-80">
          <Link href="/ai-guide" className="flex items-center gap-1 hover:opacity-100"><Sparkles className="h-3.5 w-3.5" />AI 指导</Link>
          <Link href="/records" className="flex items-center gap-1 hover:opacity-100"><FileText className="h-3.5 w-3.5" />历史记录</Link>
        </div>
      </div>

      {/* ===== 2. 数据摘要条 ===== */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <p className="text-lg font-bold tabular-nums">{avgScore}</p>
          <p className="text-[10px] text-muted-foreground">{completeness.isComplete ? "综合评分" : "均分"}</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <p className="text-lg font-bold tabular-nums">{completeness.recordedCount}/{completeness.expectedCount}</p>
          <p className="text-[10px] text-muted-foreground">完整度</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <p className="text-xs font-semibold">{bmiLabel}</p>
          <p className="text-[10px] text-muted-foreground">BMI</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <p className="text-lg font-bold tabular-nums">{allRecords.length}</p>
          <p className="text-[10px] text-muted-foreground">总记录</p>
        </div>
      </div>

      {/* ===== 3. 最近记录 ===== */}
      <RecentRecordCard record={latestRecord} gender={student.gender} />

      {/* ===== 4. 下一步建议 ===== */}
      {completeness.isPartial && (
        <Card className="rounded-xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">建议补充项目</p>
              <p className="text-xs text-amber-700 mt-0.5">
                完成全部 {completeness.expectedCount} 项正式体测后，可获取完整综合体质画像和AI训练方案
              </p>
              <Link href="/record"><Button variant="outline" size="sm" className="gap-1 mt-2 h-7 text-xs">补充体测项目</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}

      {completeness.isComplete && (
        <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">全部项目已录入</p>
              <p className="text-xs text-muted-foreground mt-0.5">可查看体质画像或生成AI指导报告</p>
              <div className="flex gap-2 mt-2">
                <Link href="/portrait"><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><BarChart3 className="h-3 w-3" />查看画像</Button></Link>
                <Link href="/ai-guide"><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Sparkles className="h-3 w-3" />AI 指导</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== 5. 快捷入口 ===== */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/portrait"><Card className="cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"><BarChart3 className="h-4 w-4 text-primary" /></div>
            <div className="min-w-0"><p className="text-sm font-semibold">体质画像</p><p className="text-[11px] text-muted-foreground">雷达图与趋势</p></div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent></Card>
        </Link>
        <Link href="/ai-guide"><Card className="cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></div>
            <div className="min-w-0"><p className="text-sm font-semibold">AI 指导</p><p className="text-[11px] text-muted-foreground">专项训练方案</p></div>
            <Badge variant="secondary" className="text-[9px] ml-auto">AI</Badge>
          </CardContent></Card>
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
