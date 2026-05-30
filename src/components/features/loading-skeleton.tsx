// ===== 跃动智体 — 加载骨架屏组件 =====
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-32 rounded-2xl", className)} />;
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-2xl bg-muted/30", height)}>
      <div className="text-center">
        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">加载图表中...</p>
      </div>
    </div>
  );
}
