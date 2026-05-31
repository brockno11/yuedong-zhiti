// ===== 跃动智体 — 教师审核中心 =====
import { PageHeader } from "@/components/layout/page-header";
import { ReviewWorkflow } from "@/components/features/review-workflow";
import { getReviewsWithReports } from "@/lib/server/data-service";

export default async function ReviewPage() {
  const reviews = await getReviewsWithReports();

  return (
    <div className="content-breathing-room max-w-6xl space-y-5">
      <PageHeader
        title="审核中心"
        description="审核 AI 生成的报告和建议，确认后推送给学生"
        backHref="/teacher"
      />

      <ReviewWorkflow initialItems={reviews} />
    </div>
  );
}

export const dynamic = "force-dynamic";
