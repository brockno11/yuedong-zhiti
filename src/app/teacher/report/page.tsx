// ===== 跃动智体 — AI 班级报告页面 =====
import { PageHeader } from "@/components/layout/page-header";
import { AIClassReportView } from "@/components/features/ai-class-report-view";

export default function ClassReportPage() {
  return (
    <div className="content-breathing-room max-w-6xl space-y-5">
      <PageHeader
        title="AI 班级报告"
        description="由 AI 生成的班级体测分析与教学建议"
        backHref="/teacher"
      />

      <AIClassReportView />
    </div>
  );
}
