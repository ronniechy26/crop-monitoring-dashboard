"use client";

import { useCallback, type ChangeEvent } from "react";

import { Laptop, Moon, Sun } from "lucide-react";

import { themePalettes, useTheme, type ThemePalette } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeControlsProps {
  className?: string;
  variant?: "horizontal" | "stacked";
}

export function ThemeControls({ className, variant = "horizontal" }: ThemeControlsProps) {
  const { mode, resolvedMode, setMode, toggleMode, palette, setPalette } = useTheme();

  const handlePaletteChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setPalette(event.target.value as ThemePalette);
    },
    [setPalette],
  );

  const wrapperStyles =
    variant === "stacked"
      ? "flex-col items-stretch gap-4"
      : "flex-wrap items-center gap-2";

  return (
    <div className={cn("flex", wrapperStyles, className)}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1",
          variant === "stacked" ? "self-start" : undefined,
        )}
      >
        <Button
          type="button"
          size="icon"
          variant={resolvedMode === "light" && mode !== "system" ? "accent" : "ghost"}
          className="h-8 w-8 rounded-full"
          aria-label="Activate light mode"
          onClick={() => setMode("light")}
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={mode === "system" ? "accent" : "ghost"}
          className="h-8 w-8 rounded-full"
          aria-label="Follow system appearance"
          onClick={() => setMode("system")}
        >
          <Laptop className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={resolvedMode === "dark" && mode !== "system" ? "accent" : "ghost"}
          className="h-8 w-8 rounded-full"
          aria-label="Activate dark mode"
          onClick={() => setMode("dark")}
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor="theme-palette"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80"
        >
          Theme
        </label>
        <select
          id="theme-palette"
          value={palette}
          onChange={handlePaletteChange}
          className="h-9 rounded-full border border-border/60 bg-background px-3 text-xs font-medium text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          aria-label="Select visual theme"
        >
          {themePalettes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "rounded-full text-xs",
          variant === "stacked" ? "self-start" : "sm:hidden",
        )}
        onClick={toggleMode}
      >
        Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
      </Button>
    </div>
  );
}
