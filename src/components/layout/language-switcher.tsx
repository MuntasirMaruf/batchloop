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
import { supportedLanguages as languages } from "@/config";

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
        className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border bg-card transition-all cursor-pointer shadow-2xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="sm:hidden text-[11px] font-bold">{currentLang.short}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Styled Custom Floating Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 bg-popover border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {lang.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {lang.subtitle}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-wholesaler shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
