// ===== 跃动智体 — 教师端布局（桌面侧边栏 + iOS 26 浮动导航）=====
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { IosLiquidNav } from "@/components/layout/ios-liquid-nav";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: "教师工作台 | 跃动智体",
    template: "%s | 跃动智体",
  },
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      sidebar={<DesktopSidebar items={TEACHER_NAV_ITEMS} />}
      floatingNav={<IosLiquidNav items={TEACHER_NAV_ITEMS} />}
    >
      {children}
    </AppShell>
  );
}
