"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { cookieConfig, themeConfig } from "@/config";

/**
 * ============================================================================
 * [THEME ARCHITECTURE - DUAL-STORAGE PATTERN (COOKIE + LOCALSTORAGE)]
 * ============================================================================
 * In Next.js App Router (SSR) and React 19, standard client-only theme approaches
 * (using localStorage alone) result in a visible White Flash of Unstyled Content
 * (FOUC) because the server cannot read localStorage before sending HTML.
 *
 * To solve this with 0ms flicker and zero hydration errors:
 * 1. PERSISTENCE IN LOCALSTORAGE: Saves user manual selection ('light', 'dark', 'system')
 *    for client-side speed and cross-tab synchronisation.
 * 2. PERSISTENCE IN HTTP COOKIE: Whenever theme changes, writes `theme=dark` or
 *    `theme=light` to `document.cookie` (1-year expiry). Next.js Server Components
 *    read this cookie on incoming HTTP requests (`cookies().get('theme')`) and
 *    pre-render `<html class="dark">` directly on the server before sending HTML to browser!
 * 3. ZERO-CASCADE RENDERING: Uses React 18/19's `useSyncExternalStore` to subscribe
 *    directly to browser storage events without layout shift cascades.
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

// In-memory subscriber registry for same-tab instant theme notifications
const listeners = new Set<() => void>();

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

// ============================================================================
// [THEME STORAGE - CROSS-TAB SUBSCRIPTION]
// Listens to same-window mutations (via `listeners` Set) AND cross-tab changes
// (via window "storage" event) so all tabs stay in sync automatically.
// ============================================================================
function subscribeToTheme(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// ============================================================================
// [THEME STORAGE - CLIENT SNAPSHOT READER]
// Reads active mode ('light', 'dark', or 'system') from localStorage.
// ============================================================================
function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return themeConfig.defaultTheme;
  try {
    const saved = localStorage.getItem(cookieConfig.theme);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {}
  return themeConfig.defaultTheme;
}

function getServerThemeSnapshot(): ThemeMode {
  return themeConfig.defaultTheme;
}

// ============================================================================
// [THEME STORAGE - COOKIE WRITER]
// Writes resolved theme to an HTTP cookie (`theme=dark` or `theme=light`).
// Next.js RootLayout reads this cookie on the server via `next/headers -> cookies()`.
// ============================================================================
function setCookieTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.cookie = `${cookieConfig.theme}=${theme}; path=${cookieConfig.path}; max-age=${cookieConfig.maxAge}; SameSite=${cookieConfig.sameSite}`;
}

// Hook to detect whether client hydration has completed
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// ============================================================================
// [THEME RESOLUTION - SYSTEM MEDIA QUERY DETECTION]
// Listens for operating system dark mode changes via (prefers-color-scheme: dark).
// ============================================================================
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

export function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}) {
  const mounted = useIsMounted();

  // Subscribes to localStorage theme changes using React 19 external store
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => initialTheme
  );
  const systemDark = useSystemPrefersDark();

  // ==========================================================================
  // [THEME RESOLUTION LOGIC]
  // Resolves effective 'light' or 'dark' theme based on:
  // 1. Explicit user selection ('dark' or 'light')
  // 2. OS preference if user chose 'system'
  // 3. SSR fallback passed from server cookie (`initialTheme`)
  // ==========================================================================
  const resolvedTheme: ResolvedTheme =
    theme === "dark"
      ? "dark"
      : theme === "light"
      ? "light"
      : mounted
      ? systemDark
        ? "dark"
        : "light"
      : initialTheme === "dark"
      ? "dark"
      : initialTheme === "light"
      ? "light"
      : "light";

  // ==========================================================================
  // [THEME DOM SYNCHRONIZATION & COOKIE WRITE]
  // 1. Adds or removes `.dark` class on <html> so Tailwind v4 dark:* styles activate
  // 2. Writes resolvedTheme to document.cookie so subsequent page reloads stay in sync
  // ==========================================================================
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Persist to cookie for SSR zero-flicker on reload
    setCookieTheme(resolvedTheme);
  }, [resolvedTheme]);

  // On first mount, ensure cookie is initialized if missing
  useEffect(() => {
    if (typeof document !== "undefined" && !document.cookie.includes(`${cookieConfig.theme}=`)) {
      const saved = localStorage.getItem(cookieConfig.theme);
      const initial: ResolvedTheme =
        saved === "dark"
          ? "dark"
          : saved === "light"
          ? "light"
          : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      setCookieTheme(initial);
      if (initial === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  // ==========================================================================
  // [THEME MUTATION - SET EXPLICIT THEME]
  // Updates localStorage, writes cookie, and dispatches listener updates.
  // ==========================================================================
  const setTheme = (newTheme: ThemeMode) => {
    try {
      localStorage.setItem(cookieConfig.theme, newTheme);
    } catch {}

    const resolved: ResolvedTheme =
      newTheme === "dark"
        ? "dark"
        : newTheme === "light"
        ? "light"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    setCookieTheme(resolved);
    notifyThemeListeners();
  };

  // ==========================================================================
  // [THEME MUTATION - 1-CLICK TOGGLE (LIGHT <-> DARK)]
  // Toggles opposite of current resolved theme when user clicks <ThemeToggle />.
  // ==========================================================================
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

// Hook for consuming theme state and actions anywhere in client components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
