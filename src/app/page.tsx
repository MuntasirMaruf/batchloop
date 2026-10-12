import Link from "next/link";
import { getCurrentUserProfile } from "./(auth)/actions";
import { Building2, Store, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";

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
      <HomeHeader profile={profile} />

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Modern B2B Wholesale Marketplace
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 max-w-3xl leading-tight">
          Direct Trade Between Wholesalers & Retail Stores
        </h1>

        <p className="mt-4 text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Connect with trusted suppliers, order in bulk with transparent tier pricing,
          and streamline delivery logistics with zero friction.
        </p>

        {/* Action Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full mt-8 sm:mt-12 text-left">
          <Link
            href="/register?role=wholesaler"
            className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs group"
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
            href="/register?role=shop_owner"
            className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs group"
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

      <Footer />
    </div>
  );
}
