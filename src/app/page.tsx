import Link from "next/link";
import { getCurrentUserProfile } from "./(auth)/actions";
import { Building2, Store, ArrowRight, ShieldCheck, Zap } from "lucide-react";

/**
 * ============================================================================
 * BATCHLOOP ROOT HOMEPAGE
 * ============================================================================
 * Welcome entry point for the B2B Wholesale Marketplace:
 * - Direct pathways for Wholesalers (Suppliers) & Shop Owners (Retailers).
 * - Automatic detection of logged-in users with 1-click portal entry.
 * ============================================================================
 */
export default async function Home() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-lg tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-sm">
              BL
            </span>
            <span>BatchLoop</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            {profile ? (
              <Link
                href={
                  profile.role === "WHOLESALER"
                    ? "/wholesaler/dashboard"
                    : "/shop/catalog"
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
              >
                <span>Enter {profile.role === "WHOLESALER" ? "Wholesaler Portal" : "Shop Catalog"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
                >
                  Register Business
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Modern B2B Wholesale Marketplace
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 max-w-3xl leading-tight">
          Direct Trade Between Wholesalers & Retail Stores
        </h1>

        <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Connect with trusted suppliers, order in bulk with transparent tier pricing,
          and streamline delivery logistics with zero friction.
        </p>

        {/* Action Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full mt-12 text-left">
          <Link
            href="/register"
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 w-fit mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
              <span>For Wholesalers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Publish catalogs, invite existing buyers with 1-click links, and manage bulk trade orders.
            </p>
          </Link>

          <Link
            href="/register"
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 w-fit mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
              <span>For Retail Stores</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Join via wholesaler invite, browse locked wholesale tiers, and restock store shelves.
            </p>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Verified B2B Suppliers
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Instant Invite Auto-Connect
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Custom Payment Terms
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        BatchLoop Wholesale Marketplace &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
