// ===== 跃动智体 — 教师端学生画像列表 =====
import { PageHeader } from "@/components/layout/page-header";
import { StudentSearchList } from "@/components/features/student-search-list";
import { getStudentListItems } from "@/lib/server/data-service";

export default async function StudentsPage() {
  const students = await getStudentListItems();

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="学生画像"
        description={`共 ${students.length} 名学生`}
        backHref="/teacher"
      />

      <StudentSearchList students={students} />
    </div>
  );
}

export const dynamic = "force-dynamic";
