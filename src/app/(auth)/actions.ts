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
 * ============================================================================
 * SIGN UP PROCESS (STEP-BY-STEP FLOW):
 * ============================================================================
 * 1. USER SUBMITS (/register):
 *    User provides business type (Role), business name, phone, email, and password.
 * 
 * 2. CREDENTIALS TO SUPABASE AUTH (auth.users):
 *    supabase.auth.signUp() saves email and encrypted (hashed) password to Supabase's
 *    vault (auth.users). It passes business_name, phone_number, and role in metadata,
 *    and issues secure HTTP-only session cookies in the user's browser.
 * 
 * 3. DATABASE TRIGGER AUTO-CREATES PROFILE (public.profiles):
 *    In the exact same millisecond, the PostgreSQL trigger `on_auth_user_created`
 *    fires automatically, copying metadata into `public.profiles` with the same UUID.
 * 
 * 4. DUPLICATE ACCOUNT SAFEGUARD:
 *    If the email already exists, returns `USER_ALREADY_EXISTS` so the UI shows
 *    a 1-click button to sign in and resume onboarding.
 * 
 * 5. SCENARIO 1: INVITE LINK AUTO-CONNECTION:
 *    If registered with ?ref=INV-xxxx, looks up invitation_tokens, validates limits,
 *    and creates an ACTIVE connection in `connections` immediately (bypassing manual KYC).
 * 
 * 6. REDIRECT TO ONBOARDING (/onboarding):
 *    Returns redirectUrl: "/onboarding". User is already authenticated and lands
 *    directly on Step 2 of 2 (business address & category setup).
 * ============================================================================
 */
export async function signUpAction(formData: FormData): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract form fields
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as UserRole) || "SHOP_OWNER";
  const businessName = (formData.get("business_name") as string)?.trim();
  const phoneNumber = (formData.get("phone_number") as string)?.trim();
  const inviteToken = (formData.get("invite_token") as string)?.trim() || null;

  // 1. Basic validation
  if (!email || !password || !businessName || !phoneNumber) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // 2. Sign up via Supabase Auth:
  //    HOW DATA REACHES public.profiles WITHOUT A DIRECT INSERT CALL:
  //    - `email` & `password` are saved into Supabase's private vault (`auth.users`).
  //    - The `options.data` object below acts as a "metadata backpack" stored in `auth.users.raw_user_meta_data`.
  //    - In the exact same millisecond, the PostgreSQL trigger `on_auth_user_created` fires in the database.
  //    - The trigger function `handle_new_user()` unpacks `options.data` and executes:
  //        INSERT INTO public.profiles (id, role, business_name, phone_number) VALUES (...)
  //    - Doing this in PostgreSQL guarantees zero "ghost accounts" if a user closes their tab mid-registration.
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

  // 3. Handle errors and duplicate account detection
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

  // Supabase Auth duplicate check when confirmation emails are enabled or duplicate protection flags empty identities
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

  // 4. Scenario 1: If registered via an Invite Link (?ref=...), link to Wholesaler immediately
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
          // Initialize shop_owner stub row to satisfy foreign key constraint
          await supabase.from("shop_owners").upsert({
            id: userId,
            delivery_address: "",
          });

          // Create ACTIVE connection immediately (bypasses manual KYC approval)
          await supabase.from("connections").insert({
            wholesaler_id: tokenRecord.wholesaler_id,
            shop_owner_id: userId,
            status: "ACTIVE",
            connected_via: "INVITE",
            invitation_token_id: tokenRecord.id,
            connected_at: new Date().toISOString(),
          });

          // Increment invitation token usage count
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

  // 5. Send authenticated user to Step 2 (/onboarding)
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
 * ============================================================================
 * ONBOARDING PROCESS (STEP-BY-STEP FLOW):
 * ============================================================================
 * 1. USER SUBMITS (/onboarding):
 *    User provides operational details (Warehouse address for Wholesaler,
 *    or Delivery address & category for Shop Owner).
 * 
 * 2. AUTHENTICATION VERIFICATION:
 *    supabase.auth.getUser() reads the HTTP-only cookie to identify who is submitting.
 * 
 * 3. ROLE DISCOVERY:
 *    Queries `public.profiles` using user.id to verify whether this user is a
 *    `WHOLESALER` or a `SHOP_OWNER`.
 * 
 * 4. DIRECT DATABASE UPSERT (wholesalers OR shop_owners):
 *    Unlike Step 1 (which used a database trigger), this step writes DIRECTLY from
 *    Next.js via `supabase.from(...).upsert(...)`:
 *    - If WHOLESALER -> writes to `public.wholesalers` table.
 *    - If SHOP_OWNER  -> writes to `public.shop_owners` table.
 * 
 *    WHY UPSERT INSTEAD OF INSERT?
 *    If a Shop Owner registered via an invite link (Scenario 1), signUpAction already
 *    created an empty stub row. `upsert` safely updates that stub row with their actual
 *    delivery address. If no row exists, it inserts a new one.
 * 
 * 5. REDIRECT TO STARTER DASHBOARD:
 *    - Wholesalers -> redirectUrl: "/wholesaler/dashboard"
 *    - Shop Owners -> redirectUrl: "/shop/catalog"
 * ============================================================================
 */
export async function completeOnboardingAction(
  formData: FormData
): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Identify the authenticated user from session cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to complete onboarding." };
  }

  // 2. Fetch the user's role from base profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "User profile not found." };
  }

  // 3A. If WHOLESALER -> Validate and save directly to `public.wholesalers`
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

    // Direct upsert into `public.wholesalers` (Row Level Security ensures id = auth.uid())
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

  // 3B. If SHOP_OWNER -> Validate and save directly to `public.shop_owners`
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

    // Direct upsert into `public.shop_owners` (updates stub row if registered via invite link)
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
