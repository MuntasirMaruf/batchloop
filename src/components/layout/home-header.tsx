import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ArrowRight } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useTranslations } from "next-intl";

/**
 * ============================================================================
 * HOME HEADER COMPONENT
 * ============================================================================
 * Top navigation bar for the public landing page with i18n support.
 * - Displays brand logo, LanguageSwitcher, and ThemeToggle.
 * - Displays role-based action buttons (Sign in, Register, or Enter Portal).
 * ============================================================================
 */

export interface HomeHeaderProps {
  profile?: {
    role: UserRole;
  } | null;
}

export function HomeHeader({ profile }: HomeHeaderProps) {
  const t = useTranslations("common");

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-base sm:text-lg tracking-tight shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-sm shrink-0">
            BL
          </span>
          <span className="inline">BatchLoop</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          {profile ? (
            <Link
              href={
                profile.role === "WHOLESALER"
                  ? "/wholesaler/dashboard"
                  : "/shop/catalog"
              }
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span>{t("portal")}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors whitespace-nowrap"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/register"
                className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
