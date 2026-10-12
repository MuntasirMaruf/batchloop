# BatchLoop Internationalization (i18n) Complete Guide

This document is the definitive guide to how internationalization (i18n) works in **BatchLoop**, why it is built this way, and how to maintain or extend it.

---

## 1. Quick FAQ: The Fundamentals

### Q1: Is it normal to have `/bn` or `/ja` in the URL?
**Yes, it is the worldwide industry standard for global websites and marketplaces.** You encounter this every day across major technology platforms, though English is usually the default (which hides the prefix):

| Company | Default English URL | Localized URL |
| :--- | :--- | :--- |
| **Apple** | `apple.com/iphone` | `apple.com/jp/iphone` *(Japan)*<br>`apple.com/de/iphone` *(Germany)* |
| **Stripe** | `stripe.com` | `stripe.com/ja` *(Japan)*<br>`stripe.com/fr` *(France)* |
| **Microsoft** | `microsoft.com/en-us/` | `microsoft.com/ja-jp/` |
| **PlayStation** | `playstation.com/en-us/` | `playstation.com/ja-jp/` |
| **Nintendo** | `nintendo.com` | `nintendo.com/jp/` |
| **Wikipedia** | `en.wikipedia.org` | `bn.wikipedia.org` *(Bengali)*<br>`ja.wikipedia.org` *(Japanese)* |

#### Why websites put language in the URL:
1. **Google & Search Engine SEO**:
   Googlebot cannot click a language dropdown. If your Bengali and English pages share the exact same URL (`batchloop.com/shop`), Google will **only index the English version**. Having `/bn/shop` ensures Google indexes your store for Bengali search queries.
2. **Shareable Links**:
   If a retailer in Bangladesh shares a link on WhatsApp (`batchloop.com/bn/shop/catalog`), it opens directly in Bengali for the recipient instead of defaulting to English.

---

### Q2: Why three helper files (`routing.ts`, `request.ts`, `navigation.ts`)? Why not just `[locale]` and `.json` files?

Without these three files, you would have to manually code three complex systems from scratch:

```
src/i18n/
├── 1. routing.ts      👉 The "Rulebook" (Defines valid languages and URL rules)
├── 2. request.ts      👉 The "Server Loader" (Loads the right JSON file per request)
└── 3. navigation.ts   👉 The "Smart Link" (Auto-prefixes links so users stay in their language)
```

1. **`routing.ts` (The Rulebook)**:
   - Tells Next.js what languages exist (`['en', 'bn', 'ja']`), what the default is (`'en'`), and that English doesn't need a `/en` prefix (`localePrefix: 'as-needed'`).
   - Both your middleware and your router read this single file so they never go out of sync.
2. **`request.ts` (The Server Loader)**:
   - When a request hits `/bn/shop`, Next.js Server Components need to load `messages/bn.json` before generating the HTML.
   - Dynamically imports **only** the active language file so users don't waste memory downloading languages they didn't request.
3. **`navigation.ts` (The Smart Link)**:
   - Solves the link problem. If you use standard Next.js `next/link`:
     ```tsx
     <Link href="/shop">Shop</Link>
     ```
     A user on Bengali (`/bn`) who clicks this would be kicked back to English (`/shop`)!
   - `navigation.ts` exports a smart `<Link>` that inspects the current language and automatically renders `<a href="/bn/shop">` when on Bengali.

---

### Q3: What if I prefer clean URLs everywhere without `/bn` or `/ja`?
If you prefer the web-app style used by **GitHub, Slack, or Linear** (where URLs stay `/shop` or `/login` in every language, and the language is tracked purely via cookies), you can switch to it with a **1-line change** in [`src/i18n/routing.ts`](file:///d:/Projects/WebDevelopment/BatchLoop/batchloop/src/i18n/routing.ts):

```typescript
// Change from:
localePrefix: 'as-needed'

// To:
localePrefix: 'never'
```
With `'never'`, URLs will always remain `batchloop.com/shop`, and language preference will be remembered through the `NEXT_LOCALE` cookie.

---

## 2. Request Lifecycle (Under the Hood)

When a user visits a page or changes languages, here is the complete 6-stage lifecycle:

```
1. USER REQUEST
   ├── Visits '/' or '/bn/shop' or selects language in the header
   ▼
2. MIDDLEWARE (src/middleware.ts)
   ├── Stage 2A: next-intl detects language (URL prefix, NEXT_LOCALE cookie, or browser header)
   └── Stage 2B: Supabase refreshes JWT session & normalizes path for route guards
   ▼
3. SERVER REQUEST LOADER (src/i18n/request.ts)
   ├── Resolves 'requestLocale'
   └── Dynamically imports ONLY the active dictionary (messages/en.json, messages/bn.json, or messages/ja.json)
   ▼
4. LOCALIZED ROOT LAYOUT (src/app/[locale]/layout.tsx)
   ├── Sets <html lang="en|bn|ja"> for accessibility and Google SEO
   └── Injects <NextIntlClientProvider> to supply translation strings to client components
   ▼
5. COMPONENT TRANSLATIONS
   ├── Server Components: 'await getTranslations("section")' renders HTML on server (zero bundle size)
   └── Client Components: 'useTranslations("section")' translates instantly in browser
   ▼
6. NAVIGATION (src/i18n/navigation.ts)
   └── <Link href="/shop"> automatically outputs <a href="/bn/shop"> when on Bengali
```

---

## 3. Directory Map

```text
batchloop/
├── messages/
│   ├── en.json                  # English dictionary (Default)
│   ├── bn.json                  # Bengali dictionary (বাংলা)
│   └── ja.json                  # Japanese dictionary (日本語)
├── src/
│   ├── i18n/
│   │   ├── routing.ts           # Supported locales & routing strategy
│   │   ├── request.ts           # Server message loader (dynamic import)
│   │   └── navigation.ts        # Localized Link, useRouter, usePathname
│   ├── app/
│   │   ├── layout.tsx           # Outer root layout (loads globals.css)
│   │   └── [locale]/
│   │       ├── layout.tsx       # Localized layout (<html lang="...">, NextIntlClientProvider)
│   │       ├── page.tsx         # Localized home page
│   │       ├── (auth)/          # Localized login, register, onboarding
│   │       ├── shop/            # Localized shop owner portal & catalog
│   │       └── wholesaler/      # Localized wholesaler portal & dashboard
│   ├── components/
│   │   └── layout/
│   │       ├── language-switcher.tsx  # Globe dropdown component
│   │       ├── home-header.tsx        # Public header with LanguageSwitcher
│   │       ├── portal-header.tsx      # Portal header with LanguageSwitcher
│   │       └── footer.tsx             # Localized footer
│   ├── middleware.ts            # Chained next-intl & Supabase middleware
│   └── utils/
│       └── supabase/
│           └── middleware.ts    # Normalized localized route guards & auth session refresh
└── next.config.ts               # Wrapped with createNextIntlPlugin
```

---

## 4. How to Use Translations in Code

### In Server Components (Async)
Use `getTranslations`:

```tsx
import { getTranslations } from "next-intl/server";

export default async function MyServerPage() {
  const t = await getTranslations("home");

  return (
    <h1>{t("title")}</h1>
  );
}
```

### In Client Components ("use client")
Use `useTranslations`:

```tsx
"use client";

import { useTranslations } from "next-intl";

export function MyClientComponent() {
  const t = useTranslations("common");

  return (
    <button>{t("signIn")}</button>
  );
}
```

---

## 5. How to Navigate Between Pages

**Always import navigation utilities from `@/i18n/navigation` instead of `next/link` or `next/navigation`.**

```tsx
// ✅ Correct (preserves language prefix automatically)
import { Link, useRouter, usePathname } from "@/i18n/navigation";

export function Nav() {
  return <Link href="/login">Sign In</Link>;
  // Automatically renders:
  // - "/login" on English
  // - "/bn/login" on Bengali
  // - "/ja/login" on Japanese
}

// ❌ Avoid (drops active language on click)
import Link from "next/link";
```

---

## 6. How to Add New Translation Keys

1. Open all three dictionary files in `messages/`:
   - `messages/en.json`
   - `messages/bn.json`
   - `messages/ja.json`
2. Add your new key under the appropriate section:

```json
// messages/en.json
{
  "orders": {
    "title": "Recent Orders",
    "statusPending": "Pending Approval"
  }
}

// messages/bn.json
{
  "orders": {
    "title": "সাম্প্রতিক অর্ডারসমূহ",
    "statusPending": "অনুমোদনের অপেক্ষায়"
  }
}

// messages/ja.json
{
  "orders": {
    "title": "最近の注文",
    "statusPending": "承認待ち"
  }
}
```

3. Call the key in your component:
```tsx
const t = useTranslations("orders");
<span>{t("statusPending")}</span>
```

---

## 7. How to Add a New Language (e.g. Spanish `es`)

1. **Update `src/i18n/routing.ts`**:
   ```typescript
   export const routing = defineRouting({
     locales: ["en", "bn", "ja", "es"], // add 'es'
     defaultLocale: "en",
     localePrefix: "as-needed",
   });
   ```

2. **Create the dictionary**:
   Create `messages/es.json` with all corresponding keys.

3. **Update the UI Switcher (`src/components/layout/language-switcher.tsx`)**:
   Add the new option to the `languages` list:
   ```typescript
   const languages = [
     { code: "en", label: "English", short: "EN" },
     { code: "bn", label: "বাংলা", short: "বাং" },
     { code: "ja", label: "日本語", short: "JP" },
     { code: "es", label: "Español", short: "ES" },
   ] as const;
   ```

4. **Update `src/utils/supabase/middleware.ts`**:
   Add the locale code to the prefix regex:
   ```typescript
   const localeMatch = pathname.match(/^\/(bn|ja|es)(?=\/|$)/);
   const normalizedPathname = pathname.replace(/^\/(?:en|bn|ja|es)(?=\/|$)/, "") || "/";
   ```

---

## 8. Verifying Changes

Before committing or pushing code, run:

```bash
npm run build
```

This verifies TypeScript types, ensures all translation keys match, and compiles all 27 static and dynamic localized routes with exit code 0.
