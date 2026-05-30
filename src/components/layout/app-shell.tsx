"use client";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  floatingNav?: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function AppShell({
  children,
  floatingNav,
  sidebar,
  header,
  className,
}: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-surface-subtle">
      {header && (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          {header}
        </header>
      )}

      <div className="flex flex-1">
        {/* 桌面端侧边栏 */}
        {sidebar && (
          <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:border-border/50">
            {sidebar}
          </aside>
        )}

        {/* 主内容区 — 按角色自适应宽度 */}
        <main
          className={cn(
            "min-w-0 flex-1",
            floatingNav && "pb-28 sm:pb-32",
            className
          )}
        >
          <div className="page-enter mx-auto w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* 浮动导航：学生端始终显示；教师端仅移动端 */}
      {floatingNav && (
        <nav className={cn(
          "fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3 sm:bottom-4 sm:px-4",
          sidebar && "lg:hidden"
        )}>
          {floatingNav}
        </nav>
      )}
    </div>
  );
}
