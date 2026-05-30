// ===== 跃动智体 — 移动端底部导航 =====
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  PlusCircle,
  BarChart3,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  PlusCircle,
  BarChart3,
  Sparkles,
  User,
};

interface MobileBottomNavProps {
  items: readonly NavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center justify-around px-2 pb-safe">
      {items.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            {Icon && <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />}
            <span className="text-[11px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
