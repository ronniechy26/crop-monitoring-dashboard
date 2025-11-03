"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Sprout, Carrot, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

const secondaryItems = [
  {
    label: "Settings",
    icon: Settings,
    href: "#",
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
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-1 to-chart-3 shadow-inner" />
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
                  "relative flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm transition-all hover:border-border/60 hover:bg-sidebar-accent/60 hover:text-foreground",
                  isActive && "text-sidebar-primary-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition",
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
                    className="absolute inset-0 -z-10 rounded-xl bg-sidebar-primary/15 shadow-inner"
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div
          className={cn(
            "mt-auto space-y-2 border-t border-border/60 pt-4 text-xs transition-opacity duration-200",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
