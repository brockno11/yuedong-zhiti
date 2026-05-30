// ===== 跃动智体 — 教师审核中心 =====
import { PageHeader } from "@/components/layout/page-header";
import { ReviewWorkflow } from "@/components/features/review-workflow";

export default function ReviewPage() {
  return (
    <div className="content-breathing-room max-w-6xl space-y-5">
      <PageHeader
        title="审核中心"
        description="审核 AI 生成的报告和建议，确认后推送给学生"
        backHref="/teacher"
      />

      <ReviewWorkflow />
    </div>
  );
}
