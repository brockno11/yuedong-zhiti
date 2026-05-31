// ===== 跃动智体 — AI 智能指导页面 =====
// Server Component — 数据获取层，不添加 'use client'
import { AIStudentReportView } from "@/components/features/ai-student-report";
import { getFitnessRecords, getStudentProfile, getStudentReportHistory, getBatchesByClass } from "@/lib/server/data-service";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try {
    const store = cookies();
    return store.get("demo_student_id")?.value || "";
  } catch {
    return "";
  }
}

export default async function AIGuidePage() {
  const studentId = getDemoStudentId();

  if (!studentId) {
    return (
      <div className="content-breathing-room max-w-5xl space-y-6">
        <TitleSection />
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">请先登录以查看 AI 智能指导。</p>
        </div>
      </div>
    );
  }

  const [student, records, reportHistory, batches] = await Promise.all([
    getStudentProfile(studentId),
    getFitnessRecords(studentId),
    getStudentReportHistory(studentId),
    getBatchesByClass("class-2025-spring-02-01").catch(() => []),
  ]);

  return (
    <div className="content-breathing-room max-w-5xl space-y-6">
      <TitleSection />

      <AIStudentReportView
        studentId={studentId}
        student={student}
        records={records}
        reportHistory={reportHistory}
        batches={batches}
      />
    </div>
  );
}

function TitleSection() {
  return (
    <div className="space-y-1 px-1">
      <h1 className="text-xl font-bold tracking-tight">AI 智能指导</h1>
      <p className="text-sm text-muted-foreground">
        基于正式体测与日常训练记录生成个性化分析参考
      </p>
    </div>
  );
}

export const dynamic = "force-dynamic";
