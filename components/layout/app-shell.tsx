"use client";

import { useCallback, useTransition, useState, Suspense } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";

import { AppNavbar } from "./app-navbar";
import { AppSidebar } from "./app-sidebar";
import { AppFooter } from "./app-footer";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <ShellInner>{children}</ShellInner>
    </ThemeProvider>
  );
}

function ShellInner({ children }: AppShellProps) {
  const { sidebarPosition } = useTheme();
  const showSidebar = sidebarPosition === "sidebar";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [, startTransition] = useTransition();

  const handleToggleSidebar = useCallback(() => {
    if (!showSidebar) return;
    startTransition(() => {
      setSidebarCollapsed((state) => !state);
    });
  }, [showSidebar]);

  const effectiveCollapsed = showSidebar ? sidebarCollapsed : false;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/60">
      {!showSidebar ? <AppNavbar /> : null}
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1920px] flex-col gap-5 px-3 py-5 sm:gap-6 sm:px-6 sm:py-6",
          showSidebar ? "lg:flex-row lg:px-8 2xl:px-12" : "lg:px-10 2xl:px-16",
        )}
      >
        {showSidebar ? (
          <div
            className={cn(
              "hidden flex-shrink-0 transition-[width] duration-150 ease-out will-change-[width] lg:block",
              effectiveCollapsed ? "w-[88px]" : "w-[260px]",
            )}
          >
            <div className="sticky top-6">
              <AppSidebar collapsed={effectiveCollapsed} />
            </div>
          </div>
        ) : null}
        <div
          className={cn(
            "flex-1",
            showSidebar ? "lg:pl-4 2xl:pl-6" : "",
          )}
        >
          {showSidebar ? (
            <div className="mb-6 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/60"
                onClick={handleToggleSidebar}
                aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {effectiveCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
          ) : null}
          <main className="space-y-6">{children}</main>
        </div>
      </div>
      <AppFooter className="mt-12" />
    </div>
  );
}
