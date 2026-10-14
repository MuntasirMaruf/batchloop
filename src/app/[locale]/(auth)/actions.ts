"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  // [COOKIE INITIALIZATION - STEP 1]:
  // Grab Next.js's server-side cookie store for the current HTTP request
  // and connect it to our Supabase Server Client (`src/utils/supabase/server.ts`).
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [TAKING DATA FROM USER]:
  // Extract the named fields packaged into FormData by `register/page.tsx`.
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as UserRole) || "RETAILER";
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

  // [SENDING DATA TO SUPABASE & INITIALIZING HTTP-ONLY COOKIE - STEP 2]:
  // 1. Sends `email` and `password` to Supabase Auth (`auth.users`).
  // 2. Sends `role`, `business_name`, and `phone_number` inside `options.data` (`raw_user_meta_data`),
  //    which immediately fires the PostgreSQL trigger `on_auth_user_created` (`handle_new_user()`)
  //    to insert a matching row into `public.profiles`.
  // 3. [COOKIE INITIALIZED HERE]: When `signUp()` succeeds, Supabase returns a JWT session
  //    (`access_token` + `refresh_token`). Internally, `@supabase/ssr` immediately invokes
  //    `cookies.setAll()` in `src/utils/supabase/server.ts`, which calls `cookieStore.set()`
  //    to write the `sb-<project-id>-auth-token` HTTP-only cookie to the user's browser!
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

  // 4. [INVITATION LINK BACKEND HANDLING (Scenario 1: ?ref=INV-xxxx)]:
  //    Note: The queries below automatically use the newly initialized session JWT!
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
          // Initialize retailer stub row to satisfy foreign key constraint (`connections.retailer_id -> retailers.id`)
          const { error: stubError } = await supabase.from("retailers").upsert({
            id: userId,
            delivery_address: "",
          });
          // Fallback if DB table has not yet been renamed from shop_owners
          if (stubError) {
            await supabase.from("shop_owners").upsert({
              id: userId,
              delivery_address: "",
            });
          }

          // Create ACTIVE connection immediately (bypasses manual KYC approval)
          const { error: connError } = await supabase.from("connections").insert({
            wholesaler_id: tokenRecord.wholesaler_id,
            retailer_id: userId,
            status: "ACTIVE",
            connected_via: "INVITE",
            invitation_token_id: tokenRecord.id,
            connected_at: new Date().toISOString(),
          });
          // Fallback if connections table column has not yet been renamed to retailer_id
          if (connError) {
            await supabase.from("connections").insert({
              wholesaler_id: tokenRecord.wholesaler_id,
              shop_owner_id: userId,
              status: "ACTIVE",
              connected_via: "INVITE",
              invitation_token_id: tokenRecord.id,
              connected_at: new Date().toISOString(),
            });
          }

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

  // 5. Send authenticated user (now holding the HTTP-only cookie) to Step 2 (/onboarding)
  return { success: true, redirectUrl: "/onboarding" };
}

/**
 * Signs in a user and redirects them according to their role and profile completeness.
 */
export async function signInAction(formData: FormData): Promise<AuthResponse> {
  // [COOKIE INITIALIZATION - STEP 1]:
  // Grab Next.js's server-side cookie store and connect it to `src/utils/supabase/server.ts`.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [TAKING DATA FROM USER]:
  // Extract email and password submitted by `login/page.tsx`.
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  // [SENDING DATA TO SUPABASE & INITIALIZING HTTP-ONLY COOKIE - STEP 2]:
  // Verifies email & password against `auth.users`.
  // [COOKIE INITIALIZED HERE]: When `signInWithPassword()` succeeds, Supabase returns a fresh
  // JWT session (`access_token` + `refresh_token`). Internally, `@supabase/ssr` immediately calls
  // `cookies.setAll()` in `src/utils/supabase/server.ts`, which executes `cookieStore.set()`
  // to write the `sb-<project-id>-auth-token` HTTP-only cookie to the user's browser!
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

  // Fetch user role from profiles (authenticated using the newly initialized session)
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

  if (profile.role === "RETAILER" || (profile.role as string) === "SHOP_OWNER") {
    let retailerData = null;
    const { data: retailer } = await supabase
      .from("retailers")
      .select("delivery_address")
      .eq("id", userId)
      .maybeSingle();

    retailerData = retailer;
    if (!retailerData) {
      const { data: legacyShopOwner } = await supabase
        .from("shop_owners")
        .select("delivery_address")
        .eq("id", userId)
        .maybeSingle();
      retailerData = legacyShopOwner;
    }

    if (!retailerData || !retailerData.delivery_address) {
      return { success: true, redirectUrl: "/onboarding" };
    }
    return { success: true, redirectUrl: "/shop/catalog" };
  }

  return { success: true, redirectUrl: "/" };
}

/**
 * [LOGOUT METHOD 1 - CLIENT HANDLER]:
 * Called by `handleSignOut()` in `src/app/[locale]/(auth)/onboarding/onboarding-form.tsx`
 * when the user clicks "Sign out and finish later".
 */
export async function signOutAction(): Promise<AuthResponse> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [COOKIE DELETION / CLEARING]:
  // Revokes the session in Supabase Auth AND triggers `cookies.setAll()` in `server.ts`
  // with an empty value and `Max-Age=0`, deleting the `sb-<project-id>-auth-token` cookie from the browser.
  await supabase.auth.signOut();
  return { success: true, redirectUrl: "/login" };
}

/**
 * [LOGOUT METHOD 2 - SERVER FORM ACTION]:
 * Called by `<form action={logoutAction}>` in `src/components/layout/portal-header.tsx`
 * when a Wholesaler or Retailer clicks "Sign Out" in the top navigation bar.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [COOKIE DELETION / CLEARING]:
  // Revokes the session in Supabase Auth AND triggers `cookies.setAll()` in `server.ts`
  // with `Max-Age=0` to delete the HTTP-only cookie from the browser, then redirects to `/login`.
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * ============================================================================
 * ONBOARDING PROCESS (STEP-BY-STEP FLOW):
 * ============================================================================
 * 1. USER SUBMITS (/onboarding):
 *    User provides operational details (Warehouse address for Wholesaler,
 *    or Delivery address & category for Retailer).
 * 
 * 2. AUTHENTICATION VERIFICATION:
 *    supabase.auth.getUser() reads the HTTP-only cookie to identify who is submitting.
 * 
 * 3. ROLE DISCOVERY:
 *    Queries `public.profiles` using user.id to verify whether this user is a
 *    `WHOLESALER` or a `RETAILER`.
 * 
 * 4. DIRECT DATABASE UPSERT (wholesalers OR retailers):
 *    Unlike Step 1 (which used a database trigger), this step writes DIRECTLY from
 *    Next.js via `supabase.from(...).upsert(...)`:
 *    - If WHOLESALER -> writes to `public.wholesalers` table.
 *    - If RETAILER   -> writes to `public.retailers` table.
 * 
 *    WHY UPSERT INSTEAD OF INSERT?
 *    If a Retailer registered via an invite link (Scenario 1), signUpAction already
 *    created an empty stub row. `upsert` safely updates that stub row with their actual
 *    delivery address. If no row exists, it inserts a new one.
 * 
 * 5. REDIRECT TO STARTER DASHBOARD:
 *    - Wholesalers -> redirectUrl: "/wholesaler/dashboard"
 *    - Retailers   -> redirectUrl: "/shop/catalog"
 * ============================================================================
 */
export async function completeOnboardingAction(
  formData: FormData
): Promise<AuthResponse> {
  // [COOKIE USAGE - READ SESSION IN SERVER ACTION]:
  // Connect Next.js `cookies()` to `server.ts` so `cookieStore.getAll()` reads the browser's auth cookie.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [COOKIE USAGE - IDENTIFY LOGGED-IN USER]:
  // Decrypts and verifies the JWT stored in the `sb-<project-id>-auth-token` cookie to get `user.id`.
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

    // [COOKIE USAGE - AUTHORIZE DATABASE WRITE WITH RLS]:
    // `@supabase/ssr` automatically attaches the cookie's JWT in `Authorization: Bearer <jwt>`
    // so PostgreSQL Row Level Security (`WITH CHECK (auth.uid() = id)`) permits this upsert!
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

  // 3B. If RETAILER -> Validate and save directly to `public.retailers`
  if (profile.role === "RETAILER" || (profile.role as string) === "SHOP_OWNER") {
    const deliveryAddress = (
      formData.get("delivery_address") as string
    )?.trim();
    const shopCategory =
      (formData.get("shop_category") as string)?.trim() || "";
    const tradeLicense =
      (formData.get("trade_license_number") as string)?.trim() || "";

    if (!deliveryAddress) {
      return { error: "Delivery address is required for Retailers." };
    }

    // [COOKIE USAGE - AUTHORIZE DATABASE WRITE WITH RLS]:
    // Forwards the cookie's JWT to PostgreSQL RLS (`auth.uid() = id`) and updates the stub row
    // if the retailer registered via a Scenario 1 invite link.
    const payload = {
      id: user.id,
      delivery_address: deliveryAddress,
      shop_category: shopCategory,
      trade_license_number: tradeLicense,
    };

    let { error: upsertError } = await supabase.from("retailers").upsert(payload);

    // Fallback if database table has not yet been renamed from shop_owners
    if (upsertError) {
      const fallback = await supabase.from("shop_owners").upsert(payload);
      upsertError = fallback.error;
    }

    if (upsertError) {
      return { error: upsertError.message };
    }

    return { success: true, redirectUrl: "/shop/catalog" };
  }

  return { success: true, redirectUrl: "/" };
}

/**
 * ============================================================================
 * HOW THE APP READS WHO IS LOGGED IN (SERVER COMPONENT HELPER):
 * ============================================================================
 * Used across:
 *   1. `src/app/[locale]/page.tsx` (Landing page)
 *   2. `src/app/[locale]/(auth)/onboarding/page.tsx` (Onboarding route guard)
 *   3. `src/app/[locale]/wholesaler/layout.tsx` (Wholesaler portal layout)
 *   4. `src/app/[locale]/shop/layout.tsx` (Retailer portal layout)
 * ============================================================================
 */
export async function getCurrentUserProfile() {
  // [COOKIE USAGE - STEP 1: READ BROWSER REQUEST COOKIES]:
  // Reads incoming HTTP-only cookies from the browser request headers via `cookieStore.getAll()`.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // [COOKIE USAGE - STEP 2: DECRYPT & VERIFY JWT]:
  // Validates the JWT inside `sb-<project-id>-auth-token`. Returns `null` if missing or expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // [COOKIE USAGE - STEP 3: QUERY PROFILE USING COOKIE USER ID]:
  // Uses `user.id` extracted from the cookie JWT to fetch the user's business profile.
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
