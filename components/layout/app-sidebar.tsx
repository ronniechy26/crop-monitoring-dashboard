"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sprout,
  Carrot,
  Globe2,
  Settings,
} from "lucide-react";
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
    label: "Global layers soon",
    icon: Globe2,
    href: "#",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "#",
  },
];

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "group flex w-full max-w-[260px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-sidebar/70 backdrop-blur supports-[backdrop-filter]:bg-sidebar/50",
        className,
      )}
    >
      <div className="flex items-center justify-between px-5 pb-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-1 to-chart-3 shadow-inner" />
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">
              Crop Monitor
            </p>
            <p className="text-xs text-muted-foreground">
              Early season beta
            </p>
          </div>
        </div>
        <Badge variant="accent">Live</Badge>
      </div>

      <nav className="flex flex-1 flex-col gap-4 px-3 pb-4">
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
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition",
                    isActive && "text-sidebar-primary",
                  )}
                />
                <div className="flex flex-1 flex-col leading-tight">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
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

        <div className="mt-auto rounded-xl border border-dashed border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground/80">
            Leaflet Layers
          </p>
          <p className="mt-1 leading-relaxed">
            Map overlays are in progress. Drop your geo layers here to preview
            soil and canopy health soon.
          </p>
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4 text-xs">
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
