"use client";

/**
 * ============================================================================
 * PREMIUM CUSTOM LANGUAGE SWITCHER COMPONENT
 * ============================================================================
 * Features:
 * - Custom styled dropdown matching BatchLoop's dark/light modern UI.
 * - Compact pill on mobile (Globe + EN/বাং/JP), full label on desktop.
 * - Smooth outside-click detection and transition animations.
 * - Displays active language with a checkmark indicator.
 * ============================================================================
 */
import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";

// List of available language options with labels and subtitles
const languages = [
  { code: "en", label: "English", subtitle: "English", short: "EN" },
  { code: "bn", label: "বাংলা", subtitle: "Bengali", short: "বাং" },
  { code: "ja", label: "日本語", subtitle: "Japanese", short: "JP" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    startTransition(() => {
      // Replaces current route with new language version (e.g. /shop -> /bn/shop)
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 transition-all cursor-pointer shadow-2xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
        <span className="sm:hidden text-[11px] font-bold">{currentLang.short}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-400 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Styled Custom Floating Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Select Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {lang.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {lang.subtitle}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
