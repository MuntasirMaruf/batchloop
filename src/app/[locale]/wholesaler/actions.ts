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
  shopOwnerId: string;
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
    const shopOwnerIds = rawConnections.map((c) => c.shop_owner_id);

    // Fetch matching profiles and shop_owner details
    const { data: shopProfiles } = await supabase
      .from("profiles")
      .select("id, business_name, phone_number")
      .in("id", shopOwnerIds);

    const { data: shopDetails } = await supabase
      .from("shop_owners")
      .select("id, delivery_address, shop_category")
      .in("id", shopOwnerIds);

    const profileMap = new Map(
      (shopProfiles || []).map((p) => [p.id, p])
    );
    const detailsMap = new Map(
      (shopDetails || []).map((d) => [d.id, d])
    );

    for (const conn of rawConnections) {
      const p = profileMap.get(conn.shop_owner_id);
      const d = detailsMap.get(conn.shop_owner_id);

      connectedShops.push({
        connectionId: conn.id,
        shopOwnerId: conn.shop_owner_id,
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
