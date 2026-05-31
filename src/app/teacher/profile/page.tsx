// ===== 跃动智体 — 教师个人中心 =====
import { PageHeader } from "@/components/layout/page-header";
import { TeacherProfileClient } from "@/components/features/teacher-profile-client";

export default function TeacherProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="个人中心" description="教师工作台账号信息" backHref="/teacher" />
      <TeacherProfileClient />
    </div>
  );
}
