"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Sprout, Carrot, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ThemeControls } from "@/components/layout/theme-controls";

const navItems = [
  {
    href: "/",
    label: "Overview",
    description: "Monitoring pulse",
    icon: LayoutDashboard,
  },
  {
    href: "/corn",
    label: "Corn",
    description: "Fields & insights",
    icon: Sprout,
  },
  {
    href: "/onion",
    label: "Onion",
    description: "Irrigation health",
    icon: Carrot,
  },
];

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function AppSidebar({
  className,
  onNavigate,
  collapsed = false,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isSettingsOpen = !collapsed && settingsOpen;

  return (
    <aside
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-sidebar/70 backdrop-blur supports-[backdrop-filter]:bg-sidebar/50 transition-colors",
        collapsed ? "max-w-[88px] px-2" : "max-w-[260px] px-0",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between pb-6 pt-6",
          collapsed ? "px-2" : "px-5",
        )}
      >
        <div className="flex items-center gap-2">
          <Image 
            src="/crop-logo.png"
            alt="Crop Monitor Logo"
            width={collapsed ? 50 : 60}
            height={collapsed ? 50 : 60}
          />
          <div
            className={cn(
              "transition-opacity duration-200",
              collapsed ? "opacity-0 pointer-events-none hidden" : "opacity-100",
            )}
          >
            <p className="text-sm font-semibold text-sidebar-foreground">
              Crop Monitor
            </p>
            <p className="text-xs text-muted-foreground">
              Early season beta
            </p>
          </div>
        </div>
        {!collapsed ? <Badge variant="accent">Live</Badge> : null}
      </div>

      <nav
        className={cn(
          "flex flex-1 flex-col gap-4 pb-4",
          collapsed ? "px-1" : "px-3",
        )}
      >
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm transition-all hover:border-border/60 hover:bg-sidebar-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
                  isActive
                    ? "border-sidebar-primary/40 bg-sidebar-primary/15 text-sidebar-primary-foreground shadow-sm"
                    : "text-muted-foreground",
                  collapsed && "justify-center px-2",
                )}
                data-active={isActive ? "true" : undefined}
                data-collapsed={collapsed ? "true" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-colors group-data-[active=true]:text-sidebar-primary",
                    isActive && "text-sidebar-primary",
                  )}
                />
                {!collapsed ? (
                  <div className="flex flex-1 flex-col leading-tight">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                ) : null}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className={cn(
                      "pointer-events-none absolute inset-0 -z-10 rounded-xl border border-sidebar-primary/35 bg-sidebar-primary/20 shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                      collapsed && "inset-1 rounded-full border-sidebar-primary/40 bg-sidebar-primary/30"
                    )}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div
          className={cn(
            "mt-auto space-y-3 border-t border-border/60 pt-4 text-xs transition-opacity duration-200",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          <button
            type="button"
            onClick={() =>
              setSettingsOpen((open) => (collapsed ? open : !open))
            }
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground transition hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
          >
            <span className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Settings</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isSettingsOpen ? "rotate-180" : undefined,
              )}
            />
          </button>
          {isSettingsOpen ? (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                Theme presets
              </p>
              <ThemeControls variant="stacked" className="mt-3" />
            </div>
          ) : null}
        </div>
      </nav>
    </aside>
  );
}
