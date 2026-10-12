import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Building2, Store, LogOut } from "lucide-react";
import { UserRole } from "@/types/auth";

/**
 * ============================================================================
 * UNIFIED REUSABLE PORTAL HEADER
 * ============================================================================
 * Single, shared top navigation bar for all authenticated portal pages
 * (both Wholesalers and Shop Owners).
 *
 * Automatically adapts based on the user's profile:
 * - Wholesaler: Blue badge, links to /wholesaler/dashboard
 * - Shop Owner: Emerald badge, links to /shop/catalog
 * - Displays brand logo, ThemeToggle, user business name, email, and Sign Out.
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
  const isWholesaler = profile.role === "WHOLESALER";
  const homeHref = isWholesaler ? "/wholesaler/dashboard" : "/shop/catalog";

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand & Role-Specific Portal Badge */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href={homeHref}
            className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-sm shrink-0">
              BL
            </span>
            <span className="hidden xs:inline sm:inline">BatchLoop</span>
          </Link>

          {isWholesaler ? (
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
              <Building2 className="w-3 h-3 shrink-0" />
              <span>Wholesaler</span>
              <span className="hidden md:inline"> Portal</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
              <Store className="w-3 h-3 shrink-0" />
              <span>Shop Owner</span>
              <span className="hidden md:inline"> Portal</span>
            </span>
          )}
        </div>

        {/* Right: Theme Toggle, Profile Info & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <div className="text-right hidden sm:block max-w-[130px] md:max-w-[200px] truncate">
            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {profile.business_name}
            </div>
            {profile.email && (
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {profile.email}
              </div>
            )}
          </div>

          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 px-2.5 sm:px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
              title="Sign out of platform"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
