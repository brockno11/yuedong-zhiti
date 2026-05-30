// ===== 跃动智体 — 全局加载 =====
import { PageSkeleton } from "@/components/features/loading-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <PageSkeleton />
    </div>
  );
}
