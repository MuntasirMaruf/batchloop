import { Link } from "@/i18n/navigation";
import { logoutAction } from "@/app/[locale]/(auth)/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Building2, Store, LogOut } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useTranslations } from "next-intl";

/**
 * ============================================================================
 * UNIFIED REUSABLE PORTAL HEADER
 * ============================================================================
 * Single, shared top navigation bar for all authenticated portal pages
 * (both Wholesalers and Shop Owners) with i18n support.
 *
 * Automatically adapts based on the user's profile:
 * - Wholesaler: Blue badge, links to /wholesaler/dashboard
 * - Shop Owner: Emerald badge, links to /shop/catalog
 * - Displays brand logo, LanguageSwitcher, ThemeToggle, and Sign Out.
 * ============================================================================
 */

export interface PortalHeaderProps {
  profile: {
    role: UserRole;
    business_name: string;
    email?: string | null;
  };
}

export function PortalHeader({ profile }: PortalHeaderProps) {
  const t = useTranslations("common");
  const isWholesaler = profile.role === "WHOLESALER";
  const homeHref = isWholesaler ? "/wholesaler/dashboard" : "/shop/catalog";

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Brand & Role-Specific Portal Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            href={homeHref}
            className="flex items-center gap-1.5 sm:gap-2 font-bold text-sm sm:text-lg tracking-tight shrink-0"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
              BL
            </span>
            <span className="hidden xs:inline sm:inline">BatchLoop</span>
          </Link>

          {isWholesaler ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="hidden xs:inline sm:inline">{t("wholesaler")}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
              <Store className="w-3 h-3 shrink-0" />
              <span className="hidden xs:inline sm:inline">{t("shopOwner")}</span>
            </span>
          )}
        </div>

        {/* Right: Language Switcher, Theme Toggle, Profile Info & Sign Out */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />

          <div className="text-right hidden sm:block max-w-32.5 md:max-w-50 truncate">
            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {profile.business_name}
            </div>
            {profile.email && (
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {profile.email}
              </div>
            )}
          </div>

          {/* [LOGOUT LOCATION 2 - PORTAL TOP NAVIGATION BAR]:
              Submits directly to `logoutAction` in `src/app/[locale]/(auth)/actions.ts`.
              On the server, `logoutAction` calls `await supabase.auth.signOut()` (which clears
              the `sb-<project-id>-auth-token` HTTP-only cookie via `server.ts`) and redirects to `/login`. */}
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 px-2 sm:px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
              title={t("signOut")}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
