"use server";

/**
 * ============================================================================
 * WHOLESALER PORTAL SERVER ACTIONS
 * ============================================================================
 * Handles server-side read operations for the Wholesaler Portal.
 * 
 * NOTE ON SCENARIO 1 INVITE LINKS:
 * Generating and revoking customer invitation tokens (POST /invitations/generate,
 * PATCH /invitations/:id/revoke) will be handled by the NestJS backend API with
 * rate limiting and WhatsApp queue workers, as planned in the architecture blueprint.
 * ============================================================================
 */

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface ConnectedShopRecord {
  connectionId: string;
  retailerId: string;
  shopOwnerId?: string; // Backwards-compatibility alias
  businessName: string;
  phoneNumber: string;
  deliveryAddress: string;
  shopCategory: string | null;
  status: string;
  connectedVia: string;
  connectedAt: string | null;
}

/**
 * GET WHOLESALER DASHBOARD DATA (READ QUERY via Supabase)
 * Retrieves profile, warehouse settings, and connected retail stores.
 */
export async function getWholesalerDashboardData() {
  // [COOKIE USAGE - READ SESSION IN SERVER ACTION]:
  // Reads the `sb-<project-id>-auth-token` HTTP-only cookie from the browser request
  // and passes its JWT to Supabase so all subsequent `.from(...)` queries pass RLS checks.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [COOKIE USAGE - EXTRACT USER ID]:
  // Decrypts and validates the JWT stored in the cookie to identify the logged-in wholesaler.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // A. Fetch Base Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // B. Fetch Wholesaler Extension Details
  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("*")
    .eq("id", user.id)
    .single();

  // C. Fetch Connected Retail Shops
  const { data: rawConnections } = await supabase
    .from("connections")
    .select("*")
    .eq("wholesaler_id", user.id)
    .order("created_at", { ascending: false });

  const connectedShops: ConnectedShopRecord[] = [];

  if (rawConnections && rawConnections.length > 0) {
    const retailerIds = rawConnections.map((c) => c.retailer_id || c.shop_owner_id);

    // Fetch matching profiles and retailer details
    const { data: shopProfiles } = await supabase
      .from("profiles")
      .select("id, business_name, phone_number")
      .in("id", retailerIds);

    // Try retailers table first with fallback to legacy shop_owners
    let shopDetails = null;
    const { data: retDetails } = await supabase
      .from("retailers")
      .select("id, delivery_address, shop_category")
      .in("id", retailerIds);

    if (retDetails && retDetails.length > 0) {
      shopDetails = retDetails;
    } else {
      const { data: legacyShopDetails } = await supabase
        .from("shop_owners")
        .select("id, delivery_address, shop_category")
        .in("id", retailerIds);
      shopDetails = legacyShopDetails;
    }

    const profileMap = new Map(
      (shopProfiles || []).map((p) => [p.id, p])
    );
    const detailsMap = new Map(
      (shopDetails || []).map((d) => [d.id, d])
    );

    for (const conn of rawConnections) {
      const targetId = conn.retailer_id || conn.shop_owner_id;
      const p = profileMap.get(targetId);
      const d = detailsMap.get(targetId);

      connectedShops.push({
        connectionId: conn.id,
        retailerId: targetId,
        shopOwnerId: targetId,
        businessName: p?.business_name || "Unknown Store",
        phoneNumber: p?.phone_number || "N/A",
        deliveryAddress: d?.delivery_address || "Not specified",
        shopCategory: d?.shop_category || null,
        status: conn.status,
        connectedVia: conn.connected_via,
        connectedAt: conn.connected_at,
      });
    }
  }

  // D. Fetch Active Invitation Tokens Count (Pure READ query directly from Supabase)
  // Architecture Note: Reading records and metrics from Supabase directly in Next.js
  // is standard and recommended in our hybrid model (secured by Postgres RLS).
  // Creating or revoking tokens is a business workflow mutation that will be routed to NestJS.
  const { count: activeTokensCount } = await supabase
    .from("invitation_tokens")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", user.id)
    .eq("is_revoked", false);

  return {
    profile: profile ? { ...profile, email: user.email } : null,
    wholesaler,
    connectedShops,
    activeTokensCount: activeTokensCount || 0,
  };
}
