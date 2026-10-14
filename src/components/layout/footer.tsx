import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { routes } from "@/config";

/**
 * ============================================================================
 * UNIFIED FOOTER COMPONENT
 * ============================================================================
 * Single, shared footer used across public landing pages and auth pages.
 * - Displays brand copyright notice with i18n support.
 * - Displays standard legal & compliance links (Terms, Privacy).
 * ============================================================================
 */
export function Footer({ className = "" }: { className?: string }) {
  const t = useTranslations("footer");

  return (
    <footer
      className={`w-full border-t border-border bg-background/80 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-subtle dark:text-muted-foreground gap-3 text-center sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} {t("rights")}. {t("copyright")}
        </p>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href={routes.public.terms}
            className="hover:text-foreground transition-colors whitespace-nowrap"
          >
            Terms of Service
          </Link>
          <Link
            href={routes.public.privacy}
            className="hover:text-foreground transition-colors whitespace-nowrap"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
