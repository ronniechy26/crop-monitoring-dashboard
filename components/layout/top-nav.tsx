"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pageMeta: Record<
  string,
  { title: string; subtitle: string; accent: string }
> = {
  "/": {
    title: "Field Overview",
    subtitle: "Real-time satellite & sensor snapshots",
    accent: "Corn & Onion",
  },
  "/corn": {
    title: "Corn Pulse",
    subtitle: "Growth-stage insights & yield signals",
    accent: "V10 Growth Phase",
  },
  "/onion": {
    title: "Onion Health",
    subtitle: "Irrigation balance & disease watch",
    accent: "Phase 2 Bulbing",
  },
};

const seasons = ["2024", "2023", "2022"];
const metrics = ["Yield", "NDVI", "Soil Moisture"];

interface TopNavProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function TopNav({
  onToggleSidebar,
  sidebarCollapsed = false,
}: TopNavProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [metricIndex, setMetricIndex] = useState(0);

  const page = useMemo(() => {
    return pageMeta[pathname ?? "/"] ?? pageMeta["/"];
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-background/80 px-3 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4 lg:flex-nowrap lg:justify-between lg:px-6">
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {onToggleSidebar ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden h-10 w-10 flex-shrink-0 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/60 lg:inline-flex",
                sidebarCollapsed && "bg-muted/60",
              )}
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold text-foreground">
                {page.title}
              </h1>
              <Badge variant="success" className="flex-shrink-0">
                {page.accent}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{page.subtitle}</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground/80">
              {seasons[seasonIndex]} Season
            </span>
          </div>
          <Button
            variant="subtle"
            size="sm"
            className="rounded-full"
            onClick={() =>
              setSeasonIndex((index) => (index + 1) % seasons.length)
            }
          >
            <Filter className="mr-2 h-4 w-4" />
            Season
          </Button>
          <Button
            variant="subtle"
            size="sm"
            className="rounded-full"
            onClick={() =>
              setMetricIndex((index) => (index + 1) % metrics.length)
            }
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Focus {metrics[metricIndex]}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="absolute left-4 right-4 top-6 sm:right-14"
            >
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-3 -top-3 h-8 w-8 rounded-full border border-border/60 bg-background"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </Button>
                <AppSidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
