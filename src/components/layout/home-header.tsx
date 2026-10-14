import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ArrowRight } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useTranslations } from "next-intl";
import { siteConfig, routes, roleRedirects } from "@/config";

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
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        <Link
          href={routes.public.home}
          className="flex items-center gap-1.5 sm:gap-2 font-black text-sm sm:text-lg tracking-tight shrink-0 text-foreground"
        >
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
            {siteConfig.shortName}
          </span>
          <span className="inline">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2.5 text-xs font-semibold shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          {profile ? (
            <Link
              href={roleRedirects[profile.role] || routes.wholesaler.dashboard}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap text-xs"
            >
              <span>{t("portal")}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          ) : (
            <>
              <Link
                href={routes.auth.login}
                className="px-2 sm:px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap text-xs"
              >
                {t("signIn")}
              </Link>
              <Link
                href={routes.auth.register}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap text-xs"
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
