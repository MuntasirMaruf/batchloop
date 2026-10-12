import Link from "next/link";
import { getCurrentUserProfile, signOutAction } from "@/app/(auth)/actions";
import { redirect } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * ============================================================================
 * WHOLESALER PORTAL LAYOUT
 * ============================================================================
 * Wraps all wholesaler pages (/wholesaler/*) with a top navigation bar,
 * business identification badge, and secure sign-out functionality.
 * ============================================================================
 */
export default async function WholesalerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  // Defense in depth: Verify authenticated wholesaler
  if (!profile || profile.role !== "WHOLESALER") {
    redirect("/login");
  }

  async function handleLogout() {
    "use server";
    await signOutAction();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Top Portal Navigation Bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/wholesaler/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-sm">
                BL
              </span>
              <span>BatchLoop</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Building2 className="w-3 h-3" />
              Wholesaler Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {profile.business_name}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {profile.email}
              </div>
            </div>

            <form action={handleLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Sign out of platform"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
