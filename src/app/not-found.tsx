// ===== 跃动智体 — 全局 404 =====
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-bold">页面未找到</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          你访问的页面不存在或已被移除。
        </p>
        <div className="mt-5 flex gap-3 justify-center">
          <Link href="/">
            <Button variant="default">返回首页</Button>
          </Link>
          <Link href="/teacher">
            <Button variant="outline">教师工作台</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
