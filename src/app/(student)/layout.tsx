// ===== 跃动智体 — 学生端布局（iOS 26 Liquid Glass 导航）=====
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { IosLiquidNav } from "@/components/layout/ios-liquid-nav";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: "跃动智体",
    template: "%s | 跃动智体",
  },
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell floatingNav={<IosLiquidNav items={STUDENT_NAV_ITEMS} />}>
      {children}
    </AppShell>
  );
}
