import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export function AuthHeader() {
  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-xs shrink-0">
            BL
          </span>
          <span>BatchLoop</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
