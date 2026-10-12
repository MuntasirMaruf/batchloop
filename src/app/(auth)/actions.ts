"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { UserRole } from "@/types/auth";

export interface AuthResponse {
  success?: boolean;
  error?: string;
  errorCode?: string;
  redirectUrl?: string;
}

/**
 * Signs up a new user with email and password, storing their role and business
 * metadata which automatically triggers profile creation in PostgreSQL.
 * If an invite token is provided (Scenario 1), auto-links to the Wholesaler.
 */
export async function signUpAction(formData: FormData): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as UserRole) || "SHOP_OWNER";
  const businessName = (formData.get("business_name") as string)?.trim();
  const phoneNumber = (formData.get("phone_number") as string)?.trim();
  const inviteToken = (formData.get("invite_token") as string)?.trim() || null;

  if (!email || !password || !businessName || !phoneNumber) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // 1. Sign up user via Supabase Auth with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        business_name: businessName,
        phone_number: phoneNumber,
      },
    },
  });

  if (authError) {
    const errorLower = authError.message.toLowerCase();
    if (
      errorLower.includes("already registered") ||
      errorLower.includes("already exists") ||
      errorLower.includes("user already")
    ) {
      return {
        error:
          "An account with this email already exists. You can sign in to continue where you left off.",
        errorCode: "USER_ALREADY_EXISTS",
      };
    }
    return { error: authError.message };
  }

  // Supabase Auth identity duplicate check (when email confirmation is enabled or duplicate prevention applies)
  if (
    authData.user &&
    Array.isArray(authData.user.identities) &&
    authData.user.identities.length === 0
  ) {
    return {
      error:
        "An account with this email already exists. You can sign in to continue where you left off.",
      errorCode: "USER_ALREADY_EXISTS",
    };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Failed to initialize user session." };
  }

  // 2. Scenario 1: If registered with an invite link, establish instant connection
  if (inviteToken) {
    try {
      const { data: tokenRecord } = await supabase
        .from("invitation_tokens")
        .select("id, wholesaler_id, max_uses, uses_count, is_revoked, expires_at")
        .eq("token", inviteToken)
        .single();

      if (tokenRecord && !tokenRecord.is_revoked) {
        const isNotExpired =
          !tokenRecord.expires_at || new Date(tokenRecord.expires_at) > new Date();
        const hasUsesLeft =
          tokenRecord.max_uses === null ||
          tokenRecord.uses_count < tokenRecord.max_uses;

        if (isNotExpired && hasUsesLeft) {
          // Initialize shop_owner stub to satisfy foreign key constraint
          await supabase.from("shop_owners").upsert({
            id: userId,
            delivery_address: "",
          });

          // Create ACTIVE connection immediately
          await supabase.from("connections").insert({
            wholesaler_id: tokenRecord.wholesaler_id,
            shop_owner_id: userId,
            status: "ACTIVE",
            connected_via: "INVITE",
            invitation_token_id: tokenRecord.id,
            connected_at: new Date().toISOString(),
          });

          // Increment usage count
          await supabase
            .from("invitation_tokens")
            .update({ uses_count: tokenRecord.uses_count + 1 })
            .eq("id", tokenRecord.id);
        }
      }
    } catch (err) {
      console.error("Non-fatal: Failed to link invite token during registration:", err);
    }
  }

  return { success: true, redirectUrl: "/onboarding" };
}

/**
 * Signs in a user and redirects them according to their role and profile completeness.
 */
export async function signInAction(formData: FormData): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "User session not found." };
  }

  // Fetch user role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { success: true, redirectUrl: "/onboarding" };
  }

  // Check onboarding completeness based on role
  if (profile.role === "WHOLESALER") {
    const { data: wholesaler } = await supabase
      .from("wholesalers")
      .select("warehouse_address")
      .eq("id", userId)
      .single();

    if (!wholesaler || !wholesaler.warehouse_address) {
      return { success: true, redirectUrl: "/onboarding" };
    }
    return { success: true, redirectUrl: "/wholesaler/dashboard" };
  }

  if (profile.role === "SHOP_OWNER") {
    const { data: shopOwner } = await supabase
      .from("shop_owners")
      .select("delivery_address")
      .eq("id", userId)
      .single();

    if (!shopOwner || !shopOwner.delivery_address) {
      return { success: true, redirectUrl: "/onboarding" };
    }
    return { success: true, redirectUrl: "/shop/catalog" };
  }

  return { success: true, redirectUrl: "/" };
}

/**
 * Signs out the current user and clears session cookies.
 */
export async function signOutAction(): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut();
  return { success: true, redirectUrl: "/login" };
}

/**
 * Completes the onboarding process by storing role-specific attributes.
 */
export async function completeOnboardingAction(
  formData: FormData
): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to complete onboarding." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "User profile not found." };
  }

  if (profile.role === "WHOLESALER") {
    const warehouseAddress = (
      formData.get("warehouse_address") as string
    )?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const tradeLicense =
      (formData.get("trade_license_number") as string)?.trim() || "";

    if (!warehouseAddress) {
      return { error: "Warehouse address is required for Wholesalers." };
    }

    const { error: upsertError } = await supabase.from("wholesalers").upsert({
      id: user.id,
      warehouse_address: warehouseAddress,
      description,
      trade_license_number: tradeLicense,
    });

    if (upsertError) {
      return { error: upsertError.message };
    }

    return { success: true, redirectUrl: "/wholesaler/dashboard" };
  }

  if (profile.role === "SHOP_OWNER") {
    const deliveryAddress = (
      formData.get("delivery_address") as string
    )?.trim();
    const shopCategory =
      (formData.get("shop_category") as string)?.trim() || "";
    const tradeLicense =
      (formData.get("trade_license_number") as string)?.trim() || "";

    if (!deliveryAddress) {
      return { error: "Delivery address is required for Shop Owners." };
    }

    const { error: upsertError } = await supabase.from("shop_owners").upsert({
      id: user.id,
      delivery_address: deliveryAddress,
      shop_category: shopCategory,
      trade_license_number: tradeLicense,
    });

    if (upsertError) {
      return { error: upsertError.message };
    }

    return { success: true, redirectUrl: "/shop/catalog" };
  }

  return { success: true, redirectUrl: "/" };
}

/**
 * Helper to fetch the current authenticated user's profile on the server.
 */
export async function getCurrentUserProfile() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    ...profile,
    email: user.email,
  };
}
