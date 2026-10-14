/**
 * ============================================================================
 * LOCALIZED LAYOUT: src/app/[locale]/layout.tsx
 * ============================================================================
 * HOW THIS WORKS:
 * 1. DYNAMIC LOCALE PARAMETER:
 *    Next.js passes the current language as route parameter 'params.locale'.
 *
 * 2. STATIC ROUTE PRE-GENERATION:
 *    'generateStaticParams()' pre-renders pages for ['en', 'bn', 'ja'] at build time.
 *
 * 3. VALIDATION:
 *    If an unsupported locale is accessed, 'notFound()' renders the 404 page.
 *
 * 4. CLIENT PROVIDER:
 *    '<NextIntlClientProvider messages={messages} locale={locale}>' sends loaded
 *    translations to all client-side child components.
 *
 * NOTE: The root <html>, <body>, and <ThemeProvider> are rendered in the top-level
 * src/app/layout.tsx to guarantee full Next.js App Router 404 compliance.
 * ============================================================================
 */
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

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

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
