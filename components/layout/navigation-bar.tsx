import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationLinks } from "@/components/layout/nav-links";
import { ThemeControls } from "@/components/layout/theme-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4 px-3 py-3 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {navigationLinks.map((nav) => {
            const isActive =
              pathname === nav.href ||
              (nav.href !== "/" && pathname?.startsWith(nav.href));
            return (
              <Button
                key={nav.href}
                asChild
                variant={isActive ? "accent" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full text-sm sm:text-xs",
                  isActive ? "shadow-sm" : "text-muted-foreground",
                )}
              >
                <Link href={nav.href}>{nav.label}</Link>
              </Button>
            );
          })}
        </div>
        <ThemeControls showNavigationPlacement className="hidden md:flex" />
      </div>
    </div>
  );
}
