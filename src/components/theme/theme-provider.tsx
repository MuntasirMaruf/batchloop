"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

/**
 * ============================================================================
 * GLOBAL THEME PROVIDER (React 19 & Next.js 16)
 * ============================================================================
 * Manages light / dark / system theme state across the entire BatchLoop app.
 * Persists user preference in localStorage under the 'theme' key.
 * Synchronizes with Tailwind v4 .dark class on the <html> root element.
 * Uses useSyncExternalStore for zero-cascade rendering and SSR safety.
 * ============================================================================
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Listeners for in-app theme changes
const listeners = new Set<() => void>();

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

function subscribeToTheme(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch { }
  return "system";
}

function getServerThemeSnapshot(): ThemeMode {
  return "system";
}

// Hook to check if component is mounted on the client
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
}

// Hook to subscribe to OS media query dark preference
function useSystemPrefersDark(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
    () => false
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mounted = useIsMounted();
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );
  const systemDark = useSystemPrefersDark();

  const resolvedTheme: ResolvedTheme =
    theme === "dark" ? "dark" : theme === "light" ? "light" : systemDark ? "dark" : "light";

  // Synchronize DOM external system with resolved theme
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    try {
      localStorage.setItem("theme", newTheme);
    } catch { }
    notifyThemeListeners();
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
