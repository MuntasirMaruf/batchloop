"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

/**
 * ============================================================================
 * [THEME TOGGLE UI COMPONENT]
 * ============================================================================
 * Accessible, animated header switch for toggling between Light and Dark mode.
 * - Consumes `useTheme()` hook from `src/components/theme/theme-provider.tsx`.
 * - Calls `toggleTheme()`, which switches the active theme, toggles `.dark`
 *   on the document root element, and updates both `localStorage` and `theme` cookie.
 * - Uses `suppressHydrationWarning` to eliminate SSR/client HTML attribute mismatch.
 * ============================================================================
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // ==========================================================================
  // [THEME STATE CONSUMPTION]
  // Reads resolvedTheme ('light' | 'dark') and toggle action from ThemeContext.
  // ==========================================================================
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      // [THEME INTERACTION - ON CLICK TOGGLE]
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-xs cursor-pointer shrink-0 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
