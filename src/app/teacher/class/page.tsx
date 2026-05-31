// ===== 跃动智体 — 班级管理页面 =====
import { PageHeader } from "@/components/layout/page-header";
import { ClassManager } from "@/components/features/class-manager";
import { getClasses } from "@/lib/server/data-service";
import { DemoBanner } from "@/components/features/demo-banner";

export default async function ClassManagementPage() {
  const classes = await getClasses();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <DemoBanner />
      <PageHeader
        title="班级管理"
        description="管理班级信息、添加/编辑学生、查看账号"
      />
      <ClassManager
        initialClasses={JSON.parse(JSON.stringify(classes))}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
