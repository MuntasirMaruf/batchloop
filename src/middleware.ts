/**
 * ============================================================================
 * ROOT MIDDLEWARE PIPELINE: NEXT-INTL + SUPABASE SSR
 * ============================================================================
 * HOW THIS WORKS:
 * 1. Every incoming HTTP request passes through this middleware before reaching
 *    any page or layout.
 *
 * 2. STAGE 1: NEXT-INTL LANGUAGE ROUTING
 *    - 'handleIntlRouting(request)' inspects:
 *        a) URL pathname (e.g. does it start with /bn or /ja?)
 *        b) NEXT_LOCALE cookie (saved user preference)
 *        c) Accept-Language browser header (user's OS language)
 *    - If next-intl detects that a redirect is necessary (e.g., normalising
 *      a path or language prefix), it sets 'x-middleware-redirect'. We return
 *      that redirect immediately.
 *
 * 3. STAGE 2: SUPABASE AUTH & SESSION REFRESH
 *    - If no immediate redirect is needed, we pass the 'intlResponse' into
 *      'createClient(request, intlResponse)'.
 *    - This refreshes Supabase JWT tokens, applies RBAC route guards
 *      (/wholesaler/*, /shop/*), and preserves both language cookies and auth
 *      cookies together in a single merged response.
 * ============================================================================
 */
import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/middleware";

// Initialize next-intl middleware with our routing configuration
const handleIntlRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Run next-intl routing middleware to resolve active language
  const intlResponse = handleIntlRouting(request);

  // If next-intl determined a redirect is required, issue it immediately
  if (intlResponse.headers.has("x-middleware-redirect")) {
    return intlResponse;
  }

  // Step 2: Pass intlResponse down to Supabase to update auth session and verify route guards
  return await createClient(request, intlResponse);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static build assets)
     * - _next/image (image optimization files)
     * - favicon.ico, images, icons (.svg, .png, .jpg, etc.)
     * - /api/* (API endpoints)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
