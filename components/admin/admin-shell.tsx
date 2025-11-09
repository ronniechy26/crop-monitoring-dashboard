"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  LayoutGrid,
  Menu,
  PenSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Document Manager", href: "/admin/documents", icon: FileText },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Form Builder", href: "/admin/forms", icon: PenSquare },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

interface AdminShellProps {
  children: React.ReactNode;
  onSignOut: () => Promise<void>;
}

export function AdminShell({ children, onSignOut }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileMenuOpen]);

  const desktopNav = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          CM
        </div>
        {!sidebarCollapsed ? (
          <div>
            <p className="text-sm font-semibold">Crop Monitor</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                sidebarCollapsed && "justify-center px-2",
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => setProfileMenuOpen(false)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>
      <div
        className={cn(
          "rounded-xl border border-dashed border-muted-foreground/30 p-4 text-xs text-muted-foreground",
          sidebarCollapsed && "hidden"
        )}
      >
        <p className="font-semibold text-foreground">Field Updates</p>
        <p className="mt-1">
          Last sync: <span className="font-medium text-foreground">4 minutes ago</span>
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mx-auto hidden rounded-full border border-border/60 lg:flex"
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );

  const sidebarWidth = sidebarCollapsed ? "lg:w-20" : "lg:w-72";

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-background/95 shadow-sm backdrop-blur transition-[width] duration-200 lg:flex",
          sidebarWidth
        )}
      >
        {desktopNav}
      </aside>
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-200",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}
      >
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Admin / Dashboard</span>
              <span className="text-lg font-semibold">Operations overview</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-full border border-border/60 bg-muted px-3 py-2 text-sm text-muted-foreground sm:flex">
              <Search className="mr-2 h-4 w-4" />
              <input
                className="bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="Search"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <div className="relative" ref={profileRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                SA
              </Button>
              {profileMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-border bg-background p-3 text-sm shadow-lg">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-foreground">Admin</p>
                  <Separator className="my-3" />
                  <form action={onSignOut}>
                    <Button type="submit" variant="ghost" className="w-full justify-start">
                      Sign out
                    </Button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col gap-6 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  CM
                </div>
                <div>
                  <p className="text-sm font-semibold">Crop Monitor</p>
                  <p className="text-xs text-muted-foreground">Admin Console</p>
                </div>
              </div>
              <nav className="flex flex-1 flex-col gap-1">
                {NAV_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      onClick={() => {
                        setMobileOpen(false);
                        setProfileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
