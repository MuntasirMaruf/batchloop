/**
 * ============================================================================
 * LOCALIZED ROOT LAYOUT: src/app/[locale]/layout.tsx
 * ============================================================================
 * HOW THIS WORKS:
 * 1. DYNAMIC LOCALE PARAMETER:
 *    Because this file is inside the '[locale]' directory, Next.js passes the
 *    current language as an asynchronous route parameter: 'params.locale'.
 *
 * 2. STATIC ROUTE PRE-GENERATION:
 *    'generateStaticParams()' tells Next.js to pre-render pages for ['en', 'bn', 'ja']
 *    at build time, ensuring fast production performance.
 *
 * 3. VALIDATION & SAFETY:
 *    If an unsupported locale is accessed (e.g. '/xyz/shop'), 'notFound()' renders
 *    the 404 page immediately.
 *
 * 4. SERVER-SIDE STATIC RENDERING:
 *    'setRequestLocale(locale)' tells next-intl which locale this server component
 *    is rendering, enabling Static Site Generation (SSG).
 *
 * 5. CLIENT PROVIDER:
 *    '<NextIntlClientProvider messages={messages} locale={locale}>' sends the
 *    loaded translations down to all Client Components ('use client'), allowing
 *    them to call 'useTranslations()' instantly with zero network delay.
 *
 * 6. HTML ACCESSIBILITY & SEO:
 *    Renders '<html lang={locale}>' so browsers, screen readers, and Google Search
 *    know exactly which language this page is in.
 *
 * 7. [THEME SSR ZERO-FLASH ARCHITECTURE]:
 *    Reads the persisted `theme` cookie on the server before HTML is sent,
 *    outputting `<html class="dark">` immediately to eliminate FOUC.
 * ============================================================================
 */
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cookieConfig } from "@/config";

// Pre-render static pages for all configured locales at build time
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the route parameter in Next.js 16
  const { locale } = await params;

  // Validate that the requested locale is in our supported list
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  // Fetch the dictionary messages for this locale on the server
  const messages = await getMessages();

  // ==========================================================================
  // [THEME SSR PRE-RENDERING - COOKIE READ ON SERVER]
  // Reads persisted theme preference from the HTTP request cookies.
  // Because this executes on the server before sending HTML to the browser,
  // we know whether the user wants light or dark mode prior to first paint!
  // ==========================================================================
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(cookieConfig.theme)?.value;
  const isDark = themeCookie === "dark";

  return (
    // ========================================================================
    // [THEME SSR PRE-RENDERING - PRE-APPLIED CLASS ON <html>]
    // If themeCookie === 'dark', we immediately output `className="dark"`.
    // The browser parses this directly from raw HTML with ZERO JavaScript delay,
    // avoiding the dreaded white flash (FOUC).
    // `suppressHydrationWarning` prevents warnings if client OS preference differs.
    // ========================================================================
    <html
      lang={locale}
      className={isDark ? "dark" : ""}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* ====================================================================
            [THEME SSR PRE-RENDERING - INITIAL THEME HYDRATION]
            Passes `initialTheme` (from server cookie) into ThemeProvider so the
            React 19 client store hydrates matching the server HTML exactly.
            ==================================================================== */}
        <ThemeProvider initialTheme={(themeCookie as any) || "system"}>
          {/* Provide loaded translation messages to all client-side child components */}
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
