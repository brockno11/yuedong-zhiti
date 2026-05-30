"use client";

import { useAuthGuard } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const ready = useAuthGuard();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-3 w-24" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
