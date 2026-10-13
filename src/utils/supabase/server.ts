/**
 * ============================================================================
 * HOW NEXT.JS KNOWS WHICH USER IS LOGGED IN (SERVER CLIENT):
 * ============================================================================
 * 1. THE COOKIE: When a user signs in, Supabase sets an encrypted HTTP-only
 *    cookie (e.g. `sb-<project-id>-auth-token`) containing their session JWT.
 * 
 * 2. AUTOMATIC BROWSER ATTACHMENT: On EVERY request to Next.js (page loads,
 *    Server Actions, API routes), the user's browser automatically sends this cookie.
 * 
 * 3. NEXT.JS COOKIE STORE: This helper connects Next.js `cookies()` to `@supabase/ssr`:
 *    - `cookieStore.getAll()` reads the incoming session cookies.
 *    - `cookieStore.set()` writes refreshed auth tokens back to the browser.
 * 
 * Whenever any server component or server action calls `supabase.auth.getUser()`,
 * Supabase decrypts this cookie to identify the exact user ID (`user.id`).
 * ============================================================================
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
    return createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
            // [COOKIE USAGE - READ]:
            // Reads all incoming HTTP-only cookies (e.g., `sb-<project-id>-auth-token`)
            // sent automatically by the user's browser on every Server Component / Server Action request.
            getAll() {
                return cookieStore.getAll();
            },
            // [COOKIE INITIALIZATION, REFRESH & DELETION - WRITE]:
            // Automatically invoked by `@supabase/ssr` whenever:
            //   1. A user registers (`supabase.auth.signUp()`) -> INITIALIZES the HTTP-only cookie
            //   2. A user logs in (`supabase.auth.signInWithPassword()`) -> INITIALIZES the HTTP-only cookie
            //   3. A user logs out (`supabase.auth.signOut()`) -> DELETES the cookie (sets Max-Age=0)
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        // Writes `Set-Cookie: sb-<project-id>-auth-token=...; Path=/; HttpOnly; SameSite=Lax`
                        // onto the outgoing HTTP response header so the browser stores the session cookie.
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored because Edge Middleware (`src/utils/supabase/middleware.ts`)
                    // automatically refreshes expiring user sessions before Server Components render.
                }
            },
        },
    });
};