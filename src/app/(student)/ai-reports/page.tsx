// ===== 跃动智体 — AI 报告历史列表 =====
import { PageHeader } from "@/components/layout/page-header";
import { getStudentReportHistory } from "@/lib/server/data-service";
import { AIReportList } from "./report-list";
import { cookies } from "next/headers";

function getDemoStudentId(): string {
  try {
    const store = cookies();
    return store.get("demo_student_id")?.value || "";
  } catch {
    return "";
  }
}

export default async function AIReportsPage() {
  const studentId = getDemoStudentId();
  const reportHistory = studentId ? await getStudentReportHistory(studentId) : [];

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <PageHeader
        title="AI 报告"
        description="查看所有 AI 生成的分析报告"
        backHref="/profile"
      />
      <AIReportList reports={reportHistory} />
    </div>
  );
}

export const dynamic = "force-dynamic";
