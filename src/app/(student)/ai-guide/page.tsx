// ===== 跃动智体 — AI 智能指导页面 =====
import { PageHeader } from "@/components/layout/page-header";
import { AIStudentReportView } from "@/components/features/ai-student-report";
import { getFitnessRecords, getStudentProfile, getStudentReportHistory } from "@/lib/server/data-service";

// 默认展示学生 S001
const DEMO_STUDENT_ID = "S001";

export default async function AIGuidePage() {
  const [student, records, reportHistory] = await Promise.all([
    getStudentProfile(DEMO_STUDENT_ID),
    getFitnessRecords(DEMO_STUDENT_ID),
    getStudentReportHistory(DEMO_STUDENT_ID),
  ]);

  return (
    <div className="content-breathing-room max-w-5xl space-y-5">
      <PageHeader
        title="AI 智能指导"
        description="基于你的体测数据生成个性化分析与训练参考"
        backHref="/dashboard"
      />

      <AIStudentReportView
        studentId={DEMO_STUDENT_ID}
        student={student}
        records={records}
        reportHistory={reportHistory}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
