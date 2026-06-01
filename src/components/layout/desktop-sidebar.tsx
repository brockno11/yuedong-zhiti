// ===== 跃动智体 — 教师端桌面侧边栏 =====
"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  School,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  School,
};

interface DesktopSidebarProps {
  items: readonly SidebarItem[];
}

export function DesktopSidebar({ items }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-1 p-4">
      {/* Logo / 标题 */}
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <School className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight">跃动智体</h1>
          <p className="text-xs text-muted-foreground">教师工作台</p>
        </div>
      </div>

      <div className="my-3 h-px bg-border" />

      {/* 导航菜单 */}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive =
            item.href === "/teacher"
              ? pathname === "/teacher"
              : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon && <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 底部版本信息 */}
      <div className="mt-auto px-3 py-4">
        <p className="text-xs text-muted-foreground">v0.9.4</p>
        <p className="text-xs text-muted-foreground">AI 辅助 · 教师主导</p>
      </div>
    </div>
  );
}
