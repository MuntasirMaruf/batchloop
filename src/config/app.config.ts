/**
 * ============================================================================
 * APPLICATION CONFIGURATION: src/config/app.config.ts
 * ============================================================================
 * Centralized registry for non-style application configurations:
 * - Brand metadata & legal constants
 * - Navigation routing matrix & role-based redirects
 * - Localization (i18n) metadata matching routing.ts
 * - Business domain values (categories, payment terms, order limits)
 * - Platform constraints (pagination, upload limits, cookie names)
 * ============================================================================
 */

import { UserRole } from "@/types/auth";

export const siteConfig = {
  name: "BatchLoop",
  shortName: "BL",
  tagline: "Modern B2B Wholesale Marketplace",
  description: "Direct Trade Between Wholesalers & Retail Stores",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://batchloop.com",
  author: "BatchLoop Technologies",
  contactEmail: "support@batchloop.com",
  version: "0.1.0",

  copyright: (year = new Date().getFullYear()) =>
    `© ${year} BatchLoop. All rights reserved.`,

  metadata: {
    title: {
      default: "BatchLoop - Modern B2B Wholesale Marketplace",
      template: "%s | BatchLoop",
    },
    description:
      "Connect with trusted suppliers, order in bulk with transparent tier pricing, and streamline delivery logistics with zero friction.",
    keywords: [
      "B2B Wholesale",
      "Retail Supply",
      "Direct Supplier Marketplace",
      "Bulk Ordering",
      "Wholesale Catalog",
      "FMCG Distribution",
    ],
  },
} as const;

/**
 * Navigation Routes Matrix
 */
export const routes = {
  public: {
    home: "/",
    about: "/about",
    terms: "/terms",
    privacy: "/privacy",
  },
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    onboarding: "/onboarding",
  },
  wholesaler: {
    dashboard: "/wholesaler/dashboard",
    catalog: "/wholesaler/catalog",
    customers: "/wholesaler/customers",
    orders: "/wholesaler/orders",
    invites: "/wholesaler/invites",
    settings: "/wholesaler/settings",
  },
  shop: {
    catalog: "/shop/catalog",
    suppliers: "/shop/suppliers",
    orders: "/shop/orders",
    settings: "/shop/settings",
  },
} as const;

/**
 * Role-Based Default Redirect Targets
 */
export const roleRedirects: Record<UserRole, string> = {
  WHOLESALER: routes.wholesaler.dashboard,
  RETAILER: routes.shop.catalog,
  SHOP_OWNER: routes.shop.catalog,
  ADMIN: "/admin/dashboard",
  USER: routes.public.home,
} as const;

/**
 * Supported Languages and i18n Metadata
 * Aligns strictly with src/i18n/routing.ts
 */
export const supportedLanguages = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    subtitle: "English",
    short: "EN",
    direction: "ltr",
  },
  {
    code: "bn",
    label: "Bengali",
    nativeLabel: "বাংলা",
    subtitle: "Bengali",
    short: "বাং",
    direction: "ltr",
  },
  {
    code: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    subtitle: "Japanese",
    short: "JP",
    direction: "ltr",
  },
] as const;

/**
 * Business Domain Constants
 */
export const businessConfig = {
  // Standard Retail Shop Categories
  shopCategories: [
    "Grocery & Supermarket",
    "Pharmacy & Healthcare",
    "Consumer Electronics",
    "Fashion & Apparel",
    "Hardware & Construction",
    "Stationery & Books",
    "Cosmetics & Personal Care",
    "General Retail",
  ] as const,

  // Wholesale Product Categories
  wholesalerCategories: [
    "Grains & Rice",
    "Commodities",
    "Oils & Ghee",
    "Beverages",
    "Spices & Seasoning",
    "Snacks & Confectionery",
    "Household & Cleaning",
    "Personal Care",
  ] as const,

  // Payment Terms
  paymentTerms: [
    {
      id: "PAY_UPFRONT",
      label: "Pay Upfront",
      description: "Immediate settlement upon order placement",
    },
    {
      id: "CASH_ON_DELIVERY",
      label: "Cash On Delivery (COD)",
      description: "Payment upon physical delivery at retailer store",
    },
    {
      id: "NET_30",
      label: "Net 30 Days",
      description: "Invoiced credit line with 30 days settlement window",
    },
  ] as const,

  // Platform Data Limits
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    maxPageSize: 100,
  },

  // Document & Image Upload Limits
  fileUpload: {
    maxFileSizeMB: 5,
    maxFileSizeBytes: 5 * 1024 * 1024,
    acceptedDocumentTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ],
    acceptedImageTypes: ["image/png", "image/jpeg", "image/webp"],
  },
} as const;

/**
 * Storage & HTTP Cookie Key Names
 */
export const cookieConfig = {
  theme: "theme",
  locale: "NEXT_LOCALE",
  authPrefix: "sb-",
  maxAge: 31536000, // 1 year in seconds
  path: "/",
  sameSite: "lax" as const,
} as const;

/**
 * Feature Flags
 */
export const featureFlags = {
  enableInvites: true,
  enableThemeToggle: true,
  enableLanguageSwitcher: true,
  enableOrderPlacement: true,
  enableLiveCatalogTiers: true,
} as const;

export const appConfig = {
  site: siteConfig,
  routes,
  roleRedirects,
  languages: supportedLanguages,
  business: businessConfig,
  cookies: cookieConfig,
  features: featureFlags,
};

export type AppConfig = typeof appConfig;
export type SiteConfig = typeof siteConfig;
export type SupportedLanguage = (typeof supportedLanguages)[number];
