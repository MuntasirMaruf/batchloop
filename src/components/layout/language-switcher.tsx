"use client";

/**
 * ============================================================================
 * LANGUAGE SWITCHER COMPONENT: src/components/layout/language-switcher.tsx
 * ============================================================================
 * HOW THIS WORKS:
 * 1. 'useLocale()':
 *    Retrieves the currently active language code (e.g. 'en', 'bn', 'ja').
 *
 * 2. 'usePathname()':
 *    Retrieves the current pathname stripped of any locale prefix.
 *    For example: if the user is on '/bn/shop/catalog', 'usePathname()' returns
 *    '/shop/catalog'.
 *
 * 3. 'useTransition()':
 *    React 19 hook that wraps the language navigation in a low-priority transition.
 *    This prevents the page from freezing or stuttering while Server Components
 *    re-fetch and render in the new language.
 *
 * 4. 'router.replace(pathname, { locale: newLocale })':
 *    - Updates the browser URL (e.g. switching from '/shop' to '/bn/shop').
 *    - Sets the 'NEXT_LOCALE' cookie so future visits remember this language.
 *    - Preserves any active search parameters (e.g. '?role=wholesaler&ref=INV-123').
 * ============================================================================
 */
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useTransition } from "react";

// List of available language options with labels and short abbreviations
const languages = [
  { code: "en", label: "English", short: "EN" },
  { code: "bn", label: "বাংলা", short: "বাং" },
  { code: "ja", label: "日本語", short: "JP" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    // Wrap route change in React transition for smooth, non-blocking UI update
    startTransition(() => {
      // Replaces current route with new language version (e.g. /shop -> /bn/shop)
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 text-xs">
      <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={isPending}
        className="bg-transparent font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none cursor-pointer py-1 pr-1 border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-xs"
        aria-label="Select Language"
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
          >
            {lang.label} ({lang.short})
          </option>
        ))}
      </select>
    </div>
  );
}
