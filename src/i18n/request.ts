/**
 * ============================================================================
 * SERVER-SIDE I18N REQUEST CONFIGURATION (next-intl)
 * ============================================================================
 * HOW THIS WORKS:
 * 1. Called on every incoming request when rendering Server Components.
 * 2. It receives 'requestLocale' (the locale resolved from the URL path or headers).
 * 3. In Next.js 15 and 16, route parameters are asynchronous Promises, so
 *    we 'await requestLocale' before using it.
 * 4. Safety Fallback:
 *    If a user manually types an invalid URL (e.g. '/xyz/shop'), it safely
 *    falls back to the 'defaultLocale' ('en').
 * 5. Dynamic Message Loading:
 *    Uses dynamic 'import(`../../messages/${locale}.json`)' to load ONLY the
 *    dictionary required for the active language. This prevents unnecessary
 *    memory usage and keeps JavaScript bundles lightweight.
 * ============================================================================
 */
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale resolved by Next.js App Router for this request
  let locale = await requestLocale;

  // If missing or unsupported, fall back to defaultLocale ('en')
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Dynamically import only the JSON translation catalog for this language
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
