// ===== 跃动智体 — 历史记录页 =====
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/features/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFitnessRecords, getStudentProfile } from "@/lib/server/data-service";
import { FITNESS_ITEMS } from "@/lib/constants";
import { calculateRecordCompleteness } from "@/lib/scoring";
import { Clock, GraduationCap, Dumbbell, Sparkles, BarChart3, PlusCircle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try { const store = cookies(); return store.get("demo_student_id")?.value || ""; }
  catch { return ""; }
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

function recordTypeLabel(t: string): string {
  if (t === "daily_training") return "日常训练";
  if (t === "official_test") return "正式体测";
  return t;
}

export default async function RecordsPage() {
  const studentId = getDemoStudentId();
  const student = studentId ? await getStudentProfile(studentId) : null;
  const allRecords = studentId ? await getFitnessRecords(studentId) : [];

  if (!student) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <EmptyState title="请先登录" description="需要登录后才能查看历史记录" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <PageHeader title="历史记录" description={`共 ${allRecords.length} 次体测记录`} />

      {allRecords.length === 0 ? (
        <EmptyState title="暂无记录" description="你还没有体测记录"
          action={<Link href="/record"><span className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">开始首次记录</span></Link>}
        />
      ) : (
        <>
          {allRecords.map((record) => {
            const completeness = calculateRecordCompleteness(record.items.map(i => i.itemId), student.gender);
            const topItems = record.items.slice(0, 4);
            const avgScore = Math.round(record.items.reduce((sum, i) => sum + i.score, 0) / record.items.length);

            return (
              <Card key={record.id} className="rounded-xl shadow-sm">
                <CardContent className="p-4 space-y-2">
                  {/* 记录时间 + 类型 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(record.date)}
                    </div>
                    <Badge variant={record.recordType === "daily_training" ? "secondary" : "excellent"} className="text-[10px] gap-1">
                      {record.recordType === "daily_training" ? <Dumbbell className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                      {recordTypeLabel(record.recordType)}
                    </Badge>
                  </div>

                  {/* 批次 */}
                  {(record.batchName || record.semester) && (
                    <p className="text-xs text-muted-foreground">{record.batchName ?? record.semester}</p>
                  )}

                  {/* 项目成绩 */}
                  <div className="flex flex-wrap gap-1.5">
                    {topItems.map(item => (
                      <Badge key={item.itemId} variant="outline" className="text-[10px]">
                        {FITNESS_ITEMS.find(d => d.id === item.itemId)?.name ?? item.itemId} {item.score}分
                      </Badge>
                    ))}
                  </div>

                  {/* 完整度 + 均分 */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>已录 {completeness.recordedCount}/{completeness.expectedCount} 项</span>
                    <span>完整度 {completeness.completionRate}%</span>
                    <span className="font-medium">均分 {avgScore}</span>
                  </div>

                  {/* 操作 */}
                  <div className="flex gap-2 pt-1">
                    <Link href={`/portrait`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                        <BarChart3 className="h-3.5 w-3.5" />查看画像
                      </Button>
                    </Link>
                    <Link href={`/ai-guide`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                        <Sparkles className="h-3.5 w-3.5" />AI分析
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-center pt-2">
            <Link href="/record">
              <Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-4 w-4" />新增记录</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
