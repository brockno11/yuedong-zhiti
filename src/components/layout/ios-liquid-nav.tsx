"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface IosLiquidNavProps {
  items: readonly NavItem[];
  className?: string;
}

export function IosLiquidNav({ items, className }: IosLiquidNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "mx-auto w-full max-w-[480px]",
        "flex items-center rounded-full px-1.5 py-1.5",
        "bg-card/82 backdrop-blur-xl",
        "dark:bg-zinc-900/70 dark:backdrop-blur-xl",
        "border border-border/70 dark:border-white/10",
        "shadow-[0_2px_16px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_0_0_0.5px_rgba(255,255,255,0.06)]",
        "pb-safe",
        className
      )}
      aria-label="主导航"
      style={{
        paddingBottom: "max(0.375rem, env(safe-area-inset-bottom, 0px) * 0.6)",
      }}
    >
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-full py-2",
              "min-h-[56px]",
              "text-xs font-medium leading-none",
              "transition-all duration-200 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
              isActive
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-foreground",
              isActive && "bg-primary/10 dark:bg-primary/15"
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <NavIcon name={item.icon} isActive={isActive} />
            <span className="select-none whitespace-nowrap leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function NavIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const sw = isActive ? 2.5 : 1.75;
  const icons: Record<string, React.ReactNode> = {
    Home: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        {isActive && <path d="M9 21V12h6v9"/>}
      </svg>
    ),
    PlusCircle: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    ),
    BarChart3: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="M7 16v-3M11 16V8M15 16v-5M19 16v-2"/>
      </svg>
    ),
    Sparkles: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
        <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5zM18 17l.3 1 1 .3-1 .3-.3 1-.3-1-1-.3 1-.3z"/>
      </svg>
    ),
    User: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M20 21a8 8 0 1 0-16 0"/>
      </svg>
    ),
    LayoutDashboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    Users: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/>
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <circle cx="17" cy="7" r="3"/>
        <path d="M21 21v-2a3 3 0 0 0-3-3"/>
      </svg>
    ),
    FileText: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    CheckSquare: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M8 12l3 3 5-5"/>
      </svg>
    ),
  };
  return <>{icons[name] || <div className="h-5 w-5" />}</>;
}
