/**
 * ============================================================================
 * PHASE 7: ROUTE GUARD & SESSION REFRESH MIDDLEWARE
 * ============================================================================
 * HOW THIS WORKS:
 * 1. SESSION REFRESH:
 *    On every request, supabase.auth.getUser() is called. This forces Supabase to
 *    refresh any expiring JWT tokens and keep browser session cookies alive.
 * 
 * 2. ROLE-BASED ACCESS CONTROL (RBAC):
 *    - /wholesaler/*: Restricted to authenticated users with role === 'WHOLESALER'.
 *      - If logged out -> Redirects to /login?redirectTo=...
 *      - If Shop Owner -> Redirects to /shop/catalog (prevents cross-portal access).
 * 
 *    - /shop/*: Restricted to authenticated users with role === 'SHOP_OWNER'.
 *      - If logged out -> Redirects to /login?redirectTo=...
 *      - If Wholesaler -> Redirects to /wholesaler/dashboard.
 * 
 *    - /onboarding: Requires authenticated user.
 *      - If logged out -> Redirects to /login.
 * 
 *    - /login & /register:
 *      - If already logged in, automatically routes user to their dashboard.
 * 
 * 3. PRESERVING COOKIES ON REDIRECT:
 *    Whenever Next.js redirects, refreshed Supabase cookies must be copied onto
 *    the redirect response to prevent authentication loss or infinite redirect loops.
 * ============================================================================
 */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = async (request: NextRequest, response?: NextResponse) => {
  // Use passed-in response or create an unmodified default response
  let supabaseResponse =
    response ||
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1. Refresh auth token and identify user from request cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  /**
   * I18N ROUTE NORMALIZATION:
   * When a user visits a localized route like '/bn/wholesaler/dashboard' or '/ja/shop/catalog':
   * 1. 'localeMatch' captures the language prefix ('/bn', '/ja', etc.).
   * 2. 'normalizedPathname' strips that prefix ('/wholesaler/dashboard').
   * This allows the route guard checks below (startsWith('/wholesaler')) to match
   * consistently regardless of whether the user is viewing English, Bengali, or Japanese.
   * 3. When issuing any redirect, '${localePrefix}/login' ensures the user stays in
   * their chosen language without getting forced back to English.
   */
  const localeMatch = pathname.match(/^\/(bn|ja|en)(?=\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  const normalizedPathname = pathname.replace(/^\/(?:bn|ja|en)(?=\/|$)/, "") || "/";

  // Helper to preserve refreshed cookies when issuing redirects
  const createRedirectResponse = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  // Determine user role (from JWT metadata first, or fallback to profiles table)
  let userRole = user?.user_metadata?.role;
  if (user && !userRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role;
  }

  // ==========================================================================
  // ROUTE GUARD 1: Wholesaler Portal (/wholesaler/*)
  // ==========================================================================
  if (normalizedPathname.startsWith("/wholesaler")) {
    // If not logged in -> redirect to login with return path
    if (!user) {
      const loginUrl = new URL(`${localePrefix}/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirectResponse(loginUrl);
    }

    // If logged in as Shop Owner -> block access and redirect to Shop Catalog
    if (userRole === "SHOP_OWNER") {
      return createRedirectResponse(new URL(`${localePrefix}/shop/catalog`, request.url));
    }
  }

  // ==========================================================================
  // ROUTE GUARD 2: Shop Owner Portal (/shop/*)
  // ==========================================================================
  if (normalizedPathname.startsWith("/shop")) {
    // If not logged in -> redirect to login with return path
    if (!user) {
      const loginUrl = new URL(`${localePrefix}/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirectResponse(loginUrl);
    }

    // If logged in as Wholesaler -> block access and redirect to Wholesaler Dashboard
    if (userRole === "WHOLESALER") {
      return createRedirectResponse(new URL(`${localePrefix}/wholesaler/dashboard`, request.url));
    }
  }

  // ==========================================================================
  // ROUTE GUARD 3: Onboarding Page (/onboarding)
  // ==========================================================================
  if (normalizedPathname.startsWith("/onboarding")) {
    if (!user) {
      return createRedirectResponse(new URL(`${localePrefix}/login`, request.url));
    }
  }

  // ==========================================================================
  // ROUTE GUARD 4: Public Auth Pages (/login, /register)
  // If already logged in, redirect straight to their role dashboard
  // ==========================================================================
  if (normalizedPathname === "/login" || (normalizedPathname === "/register" && !request.nextUrl.searchParams.get("ref"))) {
    if (user) {
      if (userRole === "WHOLESALER") {
        return createRedirectResponse(new URL(`${localePrefix}/wholesaler/dashboard`, request.url));
      }
      if (userRole === "SHOP_OWNER") {
        return createRedirectResponse(new URL(`${localePrefix}/shop/catalog`, request.url));
      }
    }
  }

  return supabaseResponse;
};