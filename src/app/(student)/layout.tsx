// ===== 跃动智体 — 学生端布局 =====
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { IosLiquidNav } from "@/components/layout/ios-liquid-nav";
import { AuthGuard } from "@/components/features/auth-guard";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: "跃动智体",
    template: "%s | 跃动智体",
  },
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell floatingNav={<IosLiquidNav items={STUDENT_NAV_ITEMS} />}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
