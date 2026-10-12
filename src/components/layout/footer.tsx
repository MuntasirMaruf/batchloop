import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

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
      className={`w-full border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-3 text-center sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} {t("rights")}. {t("copyright")}
        </p>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
