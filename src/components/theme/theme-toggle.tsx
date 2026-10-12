"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

/**
 * ============================================================================
 * GLOBAL THEME TOGGLE BUTTON
 * ============================================================================
 * Accessible, animated header switch for toggling between Light and Dark mode.
 * - Prevents hydration mismatch via mounted check.
 * - Accessible aria-labels and smooth icon transitions.
 * ============================================================================
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50 animate-pulse shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-xs cursor-pointer shrink-0 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
