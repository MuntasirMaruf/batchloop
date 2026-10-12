"use server";

/**
 * ============================================================================
 * SHOP OWNER PORTAL SERVER ACTIONS
 * ============================================================================
 * This file contains server-side actions for the Shop Owner Portal:
 * 1. getShopPortalData: Fetches the shop owner's profile, store details, and
 *    list of connected wholesalers (including those connected via Scenario 1 invites).
 * ============================================================================
 */

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface ConnectedWholesalerRecord {
  connectionId: string;
  wholesalerId: string;
  businessName: string;
  phoneNumber: string;
  warehouseAddress: string;
  rating: number;
  status: string;
  connectedVia: string;
  connectedAt: string | null;
}

/**
 * GET SHOP PORTAL DATA
 * Retrieves the authenticated shop owner's profile and all connected wholesale suppliers.
 */
export async function getShopPortalData() {
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

  // B. Fetch Shop Owner Extension Details
  const { data: shopOwner } = await supabase
    .from("shop_owners")
    .select("*")
    .eq("id", user.id)
    .single();

  // C. Fetch Connected Wholesalers
  const { data: rawConnections } = await supabase
    .from("connections")
    .select("*")
    .eq("shop_owner_id", user.id)
    .order("created_at", { ascending: false });

  const connectedWholesalers: ConnectedWholesalerRecord[] = [];

  if (rawConnections && rawConnections.length > 0) {
    const wholesalerIds = rawConnections.map((c) => c.wholesaler_id);

    // Fetch wholesaler base profiles and warehouse details
    const { data: wholesalerProfiles } = await supabase
      .from("profiles")
      .select("id, business_name, phone_number")
      .in("id", wholesalerIds);

    const { data: wholesalerDetails } = await supabase
      .from("wholesalers")
      .select("id, warehouse_address, rating")
      .in("id", wholesalerIds);

    const profileMap = new Map(
      (wholesalerProfiles || []).map((p) => [p.id, p])
    );
    const detailsMap = new Map(
      (wholesalerDetails || []).map((d) => [d.id, d])
    );

    for (const conn of rawConnections) {
      const p = profileMap.get(conn.wholesaler_id);
      const d = detailsMap.get(conn.wholesaler_id);

      connectedWholesalers.push({
        connectionId: conn.id,
        wholesalerId: conn.wholesaler_id,
        businessName: p?.business_name || "Wholesale Supplier",
        phoneNumber: p?.phone_number || "N/A",
        warehouseAddress: d?.warehouse_address || "Warehouse address on file",
        rating: d?.rating || 5.0,
        status: conn.status,
        connectedVia: conn.connected_via,
        connectedAt: conn.connected_at,
      });
    }
  }

  return {
    profile: profile ? { ...profile, email: user.email } : null,
    shopOwner,
    connectedWholesalers,
  };
}
