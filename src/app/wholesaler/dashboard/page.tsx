import { redirect } from "next/navigation";
import { getWholesalerDashboardData } from "../actions";
import {
  Building2,
  Users,
  Store,
  MapPin,
  Phone,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * ============================================================================
 * WHOLESALER DASHBOARD (SERVER COMPONENT)
 * ============================================================================
 * Central hub for Wholesalers to:
 * 1. View business profile summary & warehouse location.
 * 2. Inspect connected retail shop owners.
 * 
 * NOTE: Customer invite link generation & management will be handled
 * via NestJS API endpoints (Scenario 1) in upcoming backend phases.
 * ============================================================================
 */
export default async function WholesalerDashboardPage() {
  const data = await getWholesalerDashboardData();

  if (!data || !data.profile) {
    redirect("/login");
  }

  const { profile, wholesaler, connectedShops } = data;

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shrink-0">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {profile.business_name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Supplier
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{wholesaler?.warehouse_address || "No warehouse address registered"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{profile.phone_number}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Connected Retailers
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {connectedShops.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Active Invite Links
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {data.activeTokensCount}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Supplier Rating
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              5.0 ⭐
            </div>
          </div>
        </div>
      </div>

      {/* Connected Retailers List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            Connected Retail Customers
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Retail stores that have established trading relationships with your business.
          </p>
        </div>

        {connectedShops.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
            <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No connected retail shops yet
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
              When retail store customers connect with your wholesale business, they will automatically appear here!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Store Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Connected Via</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {connectedShops.map((shop) => (
                  <tr key={shop.connectionId} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      {shop.businessName}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                      {shop.shopCategory || "General Retail"}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                      {shop.deliveryAddress}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                      {shop.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {shop.connectedVia === "INVITE" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          <LinkIcon className="w-2.5 h-2.5" />
                          Invite Link
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          Directory
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
