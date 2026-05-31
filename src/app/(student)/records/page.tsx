// ===== 跃动智体 — 历史记录页 =====
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/features/empty-state";
import { RecordsList } from "@/components/features/records-list";
import { getFitnessRecords, getStudentProfile } from "@/lib/server/data-service";
import Link from "next/link";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try { const store = cookies(); return store.get("demo_student_id")?.value || ""; }
  catch { return ""; }
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
        <RecordsList records={JSON.parse(JSON.stringify(allRecords))} gender={student.gender} />
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
