/**
 * ============================================================================
 * I18N ROUTING CONFIGURATION (next-intl)
 * ============================================================================
 * HOW THIS WORKS:
 * 1. This file is the single source of truth for all supported languages in BatchLoop.
 * 2. 'defineRouting' configures how next-intl should recognize, validate, and format
 *    localized URLs across the application.
 *
 * URL ROUTING STRATEGY: 'as-needed'
 * - Default Language (English / 'en'):
 *     Uses clean, root-level URLs without any language prefix:
 *     Examples: '/', '/shop', '/wholesaler/dashboard', '/login'
 *
 * - Secondary Languages (Bengali / 'bn', Japanese / 'ja'):
 *     Uses explicit language sub-paths in the URL:
 *     Examples: '/bn', '/bn/shop', '/ja/wholesaler/dashboard', '/ja/login'
 *
 * - Benefits of 'as-needed':
 *     a) Backwards compatibility: existing links and bookmarks never break.
 *     b) Clean, professional URLs for your primary audience.
 *     c) Full Google SEO compliance for secondary languages (distinct URLs).
 * ============================================================================
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Array of all ISO 639-1 language codes supported by the platform
  locales: ["en", "bn", "ja"],

  // Fallback language when no language is detected or specified
  defaultLocale: "en",

  // 'as-needed' hides the default locale ('en') from URLs, but displays '/bn' and '/ja'
  localePrefix: "as-needed",
});

// TypeScript type representing any valid locale ('en' | 'bn' | 'ja')
export type Locale = (typeof routing.locales)[number];
