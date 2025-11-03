"use client";

import { useTransition, useState } from "react";

import { cn } from "@/lib/utils";

import { AppSidebar } from "./app-sidebar";
import { TopNav } from "./top-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [, startTransition] = useTransition();

  const handleToggleSidebar = () => {
    startTransition(() => {
      setSidebarCollapsed((state) => !state);
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/60">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 2xl:px-12">
        <div
          className={cn(
            "hidden flex-shrink-0 transition-[width] duration-150 ease-out will-change-[width] lg:block",
            sidebarCollapsed ? "w-[88px]" : "w-[260px]",
          )}
        >
          <div className="sticky top-6">
            <AppSidebar collapsed={sidebarCollapsed} />
          </div>
        </div>
        <div className="flex-1 space-y-6 lg:pl-4 2xl:pl-6">
          <TopNav
            onToggleSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="pb-16">{children}</main>
        </div>
      </div>
    </div>
  );
}
