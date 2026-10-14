import { getCurrentUserProfile } from "@/app/[locale]/(auth)/actions";
import { redirect } from "next/navigation";
import { PortalHeader } from "@/components/layout/portal-header";

/**
 * ============================================================================
 * RETAILER PORTAL LAYOUT
 * ============================================================================
 * Wraps all retailer pages (/shop/*) with the shared PortalHeader
 * and ensures role-based authentication.
 * ============================================================================
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // [COOKIE USAGE - SERVER LAYOUT GUARD]:
  // Reads the HTTP-only cookie via `getCurrentUserProfile()` to verify the user is an authenticated RETAILER.
  const profile = await getCurrentUserProfile();

  // Defense in depth: Verify authenticated retailer
  if (!profile || (profile.role !== "RETAILER" && (profile.role as string) !== "SHOP_OWNER")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <PortalHeader profile={profile} />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
