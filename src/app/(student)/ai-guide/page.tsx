// ===== 跃动智体 — AI 智能指导页面 =====
import { PageHeader } from "@/components/layout/page-header";
import { AIStudentReportView } from "@/components/features/ai-student-report";

// 默认展示学生 S001
const DEMO_STUDENT_ID = "S001";

export default function AIGuidePage() {
  return (
    <div className="content-breathing-room max-w-5xl space-y-5">
      <PageHeader
        title="AI 智能指导"
        description="基于你的体测数据生成个性化分析与训练参考"
        backHref="/dashboard"
      />

      <AIStudentReportView studentId={DEMO_STUDENT_ID} />
    </div>
  );
}
