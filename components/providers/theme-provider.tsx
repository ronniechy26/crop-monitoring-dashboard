"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark" | "system";
export type SidebarPosition = "sidebar" | "navbar";

export const themePalettes = [
  { value: "classic", label: "Classic Neutral" },
  { value: "emerald", label: "Emerald Fields" },
  { value: "indigo", label: "Indigo Orbit" },
  { value: "sunrise", label: "Sunrise Horizon" },
  { value: "oceanic", label: "Oceanic Depths" },
] as const;

export type ThemePalette = (typeof themePalettes)[number]["value"];

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  palette: ThemePalette;
  sidebarPosition: SidebarPosition;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPalette: (palette: ThemePalette) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
}

const MODE_STORAGE_KEY = "cmd-theme-mode";
const PALETTE_STORAGE_KEY = "cmd-theme-palette";
const SIDEBAR_POSITION_KEY = "cmd-sidebar-position";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getStoredMode = (): ThemeMode => {
  if (typeof window === "undefined") return "system";
  return (
    (window.localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode | null) ?? "system"
  );
};

const getStoredPalette = (): ThemePalette => {
  if (typeof window === "undefined") return "classic";
  return (
    (window.localStorage.getItem(PALETTE_STORAGE_KEY) as ThemePalette | null) ??
    "classic"
  );
};

const getStoredSidebarPosition = (): SidebarPosition => {
  if (typeof window === "undefined") return "sidebar";
  return (
    (window.localStorage.getItem(SIDEBAR_POSITION_KEY) as SidebarPosition | null) ??
    "sidebar"
  );
};

function useSystemColorScheme(): "light" | "dark" {
  return useSyncExternalStore(
    (listener) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    () => {
      if (typeof window === "undefined") {
        return "light";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },
    () => "light",
  );
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [palette, setPaletteState] = useState<ThemePalette>("classic");
  const [sidebarPosition, setSidebarPositionState] = useState<SidebarPosition>("sidebar");
  const [, startTransition] = useTransition();
  const systemPreference = useSystemColorScheme();
  const resolvedMode = mode === "system" ? systemPreference : mode;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedMode = getStoredMode();
    const storedPalette = getStoredPalette();
    const storedSidebarPosition = getStoredSidebarPosition();
    startTransition(() => {
      setModeState(storedMode);
      setPaletteState(storedPalette);
      setSidebarPositionState(storedSidebarPosition);
    });
  }, [startTransition]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset.theme = palette;
    root.dataset.navigation = sidebarPosition;
    root.style.colorScheme = resolvedMode === "dark" ? "dark" : "light";
  }, [resolvedMode, palette, sidebarPosition]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [palette]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_POSITION_KEY, sidebarPosition);
  }, [sidebarPosition]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      if (current === "system") {
        return systemPreference === "dark" ? "light" : "dark";
      }
      return current === "dark" ? "light" : "dark";
    });
  }, [systemPreference]);

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette);
  }, []);

  const setSidebarPosition = useCallback((nextPosition: SidebarPosition) => {
    setSidebarPositionState(nextPosition);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      palette,
      sidebarPosition,
      setMode,
      toggleMode,
      setPalette,
      setSidebarPosition,
    }),
    [mode, resolvedMode, palette, sidebarPosition, setMode, toggleMode, setPalette, setSidebarPosition],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
