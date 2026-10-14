import { redirect } from "next/navigation";
import { getShopPortalData } from "../actions";
import {
  Store,
  Building2,
  MapPin,
  Phone,
  Tag,
  CheckCircle2,
  Package,
  Layers,
  Link as LinkIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Sample B2B wholesale items available from connected suppliers
const STARTER_WHOLESALE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Basmati Rice (Aromatic Long Grain)",
    unit: "25kg Bag",
    wholesalePrice: "$38.50",
    minOrderQty: 10,
    category: "Grains & Rice",
    stockStatus: "In Stock (500+ bags)",
  },
  {
    id: "prod-2",
    name: "Refined Granulated Cane Sugar",
    unit: "50kg Sack",
    wholesalePrice: "$52.00",
    minOrderQty: 5,
    category: "Commodities",
    stockStatus: "In Stock (200+ sacks)",
  },
  {
    id: "prod-3",
    name: "Pure Cooking Soybean Oil",
    unit: "5L Commercial Jar",
    wholesalePrice: "$14.20",
    minOrderQty: 20,
    category: "Oils & Ghee",
    stockStatus: "In Stock (350+ jars)",
  },
  {
    id: "prod-4",
    name: "Premium Ceylon Black Tea",
    unit: "1kg Foil Pack (Case of 12)",
    wholesalePrice: "$96.00 / case",
    minOrderQty: 4,
    category: "Beverages",
    stockStatus: "In Stock (120+ cases)",
  },
];

/**
 * ============================================================================
 * SHOP OWNER CATALOG & SUPPLIERS PAGE (SERVER COMPONENT)
 * ============================================================================
 * Central portal for retail store owners:
 * 1. View store delivery profile.
 * 2. View connected wholesale suppliers (Scenario 1 & 2).
 * 3. Browse live B2B wholesale product pricing and minimum order quantities.
 * ============================================================================
 */
export default async function ShopCatalogPage() {
  const data = await getShopPortalData();

  if (!data || !data.profile) {
    redirect("/login");
  }

  const { profile, shopOwner, connectedWholesalers } = data;

  return (
    <div className="space-y-8">
      {/* Store Profile Overview Banner */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-retailer-subtle border border-retailer-border text-retailer shrink-0">
              <Store className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {profile.business_name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-retailer-subtle text-retailer border border-retailer-border">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Retailer
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{shopOwner?.shop_category || "General Retail"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{shopOwner?.delivery_address || "No delivery address registered"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{profile.phone_number}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Wholesalers Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Connected Wholesale Suppliers ({connectedWholesalers.length})
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Suppliers with whom your store has an active trading relationship.
          </p>
        </div>

        {connectedWholesalers.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
            <Building2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No connected suppliers yet
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
              Ask your wholesaler for their direct invitation link (Scenario 1) or submit a verification request from the supplier directory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedWholesalers.map((wholesaler) => (
              <div
                key={wholesaler.connectionId}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {wholesaler.businessName}
                    </span>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                      {wholesaler.rating} ⭐
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span>{wholesaler.warehouseAddress}</span>
                  </p>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span>{wholesaler.phoneNumber}</span>
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {wholesaler.connectedVia === "INVITE" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                      <LinkIcon className="w-2.5 h-2.5" />
                      Connected via Invite
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      Directory KYC
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wholesale Product Catalog */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
              Wholesale Product Catalog
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Bulk wholesale inventory supplied by your connected suppliers.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full w-fit">
            <Layers className="w-3.5 h-3.5" />
            Wholesale Pricing Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {STARTER_WHOLESALE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                  {product.category}
                </span>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                  {product.name}
                </h3>

                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Unit Size: <span className="font-medium text-neutral-700 dark:text-neutral-300">{product.unit}</span>
                </p>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                    {product.wholesalePrice}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Min Order: {product.minOrderQty} units
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  {product.stockStatus}
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-xs"
                >
                  Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
