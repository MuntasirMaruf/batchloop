import { getCurrentUserProfile } from "@/app/[locale]/(auth)/actions";
import { redirect } from "next/navigation";
import { PortalHeader } from "@/components/layout/portal-header";

/**
 * ============================================================================
 * WHOLESALER PORTAL LAYOUT
 * ============================================================================
 * Wraps all wholesaler pages (/wholesaler/*) with the shared PortalHeader
 * and ensures role-based authentication.
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
