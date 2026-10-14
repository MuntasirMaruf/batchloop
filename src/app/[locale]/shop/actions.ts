"use server";

/**
 * ============================================================================
 * RETAILER PORTAL SERVER ACTIONS
 * ============================================================================
 * This file contains server-side actions for the Retailer Portal:
 * 1. getShopPortalData: Fetches the retailer's profile, store details, and
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
 * Retrieves the authenticated retailer's profile and all connected wholesale suppliers.
 */
export async function getShopPortalData() {
  // [COOKIE USAGE - READ SESSION IN SERVER ACTION]:
  // Reads the `sb-<project-id>-auth-token` HTTP-only cookie from the browser request
  // and passes its JWT to Supabase so all subsequent `.from(...)` queries pass RLS checks.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [COOKIE USAGE - EXTRACT USER ID]:
  // Decrypts and validates the JWT stored in the cookie to identify the logged-in retailer.
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

  // B. Fetch Retailer Extension Details (with fallback to legacy shop_owners table)
  let retailerData = null;
  const { data: retailer } = await supabase
    .from("retailers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  retailerData = retailer;
  if (!retailerData) {
    const { data: legacyShopOwner } = await supabase
      .from("shop_owners")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    retailerData = legacyShopOwner;
  }

  // C. Fetch Connected Wholesalers (with fallback to legacy shop_owner_id column)
  let rawConnections: any[] | null = null;
  const { data: connByRetailer, error: connRetailerErr } = await supabase
    .from("connections")
    .select("*")
    .eq("retailer_id", user.id)
    .order("created_at", { ascending: false });

  if (!connRetailerErr && connByRetailer) {
    rawConnections = connByRetailer;
  } else {
    const { data: connByShopOwner } = await supabase
      .from("connections")
      .select("*")
      .eq("shop_owner_id", user.id)
      .order("created_at", { ascending: false });
    rawConnections = connByShopOwner || [];
  }

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
    retailer: retailerData,
    retailer: retailerData,
    connectedWholesalers,
  };
}
