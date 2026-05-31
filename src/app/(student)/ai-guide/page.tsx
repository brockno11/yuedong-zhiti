// ===== 跃动智体 — AI 智能指导页面 =====
import { PageHeader } from "@/components/layout/page-header";
import { AIStudentReportView } from "@/components/features/ai-student-report";
import { getFitnessRecords, getStudentProfile, getStudentReportHistory } from "@/lib/server/data-service";
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
  const [student, records, reportHistory] = await Promise.all([
    studentId ? getStudentProfile(studentId) : Promise.resolve(null),
    studentId ? getFitnessRecords(studentId) : Promise.resolve([]),
    studentId ? getStudentReportHistory(studentId) : Promise.resolve([]),
  ]);

  return (
    <div className="content-breathing-room max-w-5xl space-y-5">
      <PageHeader
        title="AI 智能指导"
        description="基于你的体测数据生成个性化分析与训练参考"
      />

      <AIStudentReportView
        studentId={studentId}
        student={student}
        records={records}
        reportHistory={reportHistory}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
