// ===== 跃动智体 — 教师端学生画像列表 =====
import { PageHeader } from "@/components/layout/page-header";
import { StudentSearchList } from "@/components/features/student-search-list";
import { mockStudents } from "@/lib/data/mock-students";

export default function StudentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="学生画像"
        description={`共 ${mockStudents.length} 名学生`}
        backHref="/teacher"
      />

      <StudentSearchList />
    </div>
  );
}
