"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeControls } from "@/components/layout/theme-controls";
import { navigationLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-gradient-to-r from-background/95 via-background/80 to-background/95 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Image
                src="/crop-logo.png"
                alt="Crop Monitor Logo"
                width={48}
                height={48}
              />
              <div className="flex flex-col leading-tight text-xs sm:text-sm">
                <span className="font-semibold text-foreground">
                  Crop Monitor
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Early season beta
                </span>
              </div>
            </div>
          </div>
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navigationLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium",
                    isActive ? "shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
          <div className="hidden items-center lg:flex">
            <ThemeControls
              showPalette
              className="items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1"
            />
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute left-4 right-4 top-6 sm:left-6 sm:right-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <div className="relative rounded-2xl border border-border/60 bg-background shadow-lg">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -right-3 -top-3 h-9 w-9 rounded-full border border-border/60 bg-background"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
                <AppSidebar onNavigate={() => setMenuOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
