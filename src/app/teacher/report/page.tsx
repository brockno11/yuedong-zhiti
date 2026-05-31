// ===== 跃动智体 — AI 班级报告页面 =====
import { PageHeader } from "@/components/layout/page-header";
import { AIClassReportView } from "@/components/features/ai-class-report-view";
import { getClassSummary, getLatestClassReport } from "@/lib/server/data-service";
import type { AIClassReport } from "@/lib/types";

export default async function ClassReportPage() {
  const [report, summary] = await Promise.all([
    getLatestClassReport(),
    getClassSummary(),
  ]);

  return (
    <div className="content-breathing-room max-w-6xl space-y-5">
      <PageHeader
        title="AI 班级报告"
        description="由 AI 生成的班级体测分析与教学建议"
        backHref="/teacher"
      />

      <AIClassReportView
        initialReport={report as AIClassReport | null}
        pendingReviewCount={summary.pendingReviewCount}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
