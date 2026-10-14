import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { siteConfig, routes } from "@/config";

export function AuthHeader() {
  return (
    <header className="w-full border-b bg-card border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2">
        <Link
          href={routes.public.home}
          className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight text-foreground hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shrink-0">
            {siteConfig.shortName}
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
