// ===== 跃动智体 — 学生首页 =====
import { EmptyState } from "@/components/features/empty-state";
import { RecentRecordCard } from "@/components/features/recent-record-card";
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
  const avgScore = batchItems.length > 0 ? Math.round(batchItems.reduce((sum, i) => sum + i.score, 0) / batchItems.length) : 0;
  const bmiLabel = student.bmi >= 18.5 && student.bmi < 24 ? "正常范围" : "BMI 指标值得关注";
  const missingNames = completeness.missingItems.map(id => FITNESS_ITEMS.find(f => f.id === id)?.name ?? id).slice(0, 3);

  const greeting = (() => { const h = new Date().getHours(); return h < 11 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好"; })();
  const statusLine = completeness.isComplete
    ? `当前批次已完整记录 ${completeness.recordedCount}/${completeness.expectedCount} 项`
    : `还有 ${completeness.missingItems.length} 项待补充，建议继续完成记录`;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      {/* ===== 1. 状态 Hero ===== */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium opacity-85">{greeting}，{student.name}</p>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium ml-auto">
            {completeness.isComplete ? `完整 ${completeness.recordedCount}/${completeness.expectedCount}` : `已录 ${completeness.recordedCount}/${completeness.expectedCount}`}
          </span>
        </div>
        <p className="mt-2 text-sm opacity-80 leading-relaxed">{statusLine}</p>
        {completeness.isPartial && missingNames.length > 0 && (
          <p className="mt-1 text-xs opacity-65">待补充：{missingNames.join("、")}{completeness.missingItems.length > 3 ? ` 等${completeness.missingItems.length}项` : ""}</p>
        )}

        <Link href="/record" className="block mt-4">
          <Button className="w-full gap-2 h-14 text-[15px] font-semibold bg-white text-primary hover:bg-white/95 shadow-md">
            <PlusCircle className="h-5 w-5" />开始记录
          </Button>
        </Link>
        <p className="mt-2 text-center text-[11px] opacity-50">支持正式体测、补录项目与日常训练</p>
      </div>

      {/* ===== 1b. 快捷入口行 ===== */}
      <div className="flex gap-2">
        <Link href="/ai-guide" className="flex-1 rounded-xl border bg-card p-3 text-center hover:bg-accent transition-colors">
          <Sparkles className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-xs font-medium">AI 指导</p>
        </Link>
        <Link href="/portrait" className="flex-1 rounded-xl border bg-card p-3 text-center hover:bg-accent transition-colors">
          <BarChart3 className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-xs font-medium">体质画像</p>
        </Link>
        <Link href="/records" className="flex-1 rounded-xl border bg-card p-3 text-center hover:bg-accent transition-colors">
          <FileText className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-xs font-medium">历史记录</p>
        </Link>
      </div>

      {/* ===== 1c. 今日建议（轻量提示）===== */}
      {!completeness.isComplete && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>建议补充 {completeness.missingItems.length} 个未录项目，完成全部体测后可获取完整综合体质画像</span>
        </div>
      )}
      {latestRecord.recordType === "official_test" && (
        <p className="text-[11px] text-muted-foreground text-center">正式体测数据已提交，如需更正请联系体育教师</p>
      )}

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
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">最近记录</p>
          <Link href="/records" className="text-xs text-primary flex items-center gap-0.5">查看全部 <ChevronRight className="h-3 w-3" /></Link>
        </div>
        <RecentRecordCard record={latestRecord} gender={student.gender} />
      </div>

    </div>
  );
}

export const dynamic = "force-dynamic";
