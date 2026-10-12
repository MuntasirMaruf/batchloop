# BatchLoop Internationalization (i18n) Complete Guide

This document is the definitive guide to how internationalization (i18n) works in **BatchLoop**, why it is built this way, and the exact code differences with and without multi-language support.

---

## 1. Code Differences: With vs. Without Multi-language Support

Here is a side-by-side comparison showing how you write code in a standard single-language Next.js app versus our multi-language `next-intl` architecture:

### 1.1 Directory Structure

| Feature              | WITHOUT Multi-language (English Only)                                            | WITH Multi-language (`next-intl`)                                                                           |
| :------------------- | :------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Folder Paths**     | `src/app/page.tsx`<br>`src/app/(auth)/login/page.tsx`<br>`src/app/shop/page.tsx` | `src/app/[locale]/page.tsx`<br>`src/app/[locale]/(auth)/login/page.tsx`<br>`src/app/[locale]/shop/page.tsx` |
| **Dictionary Files** | ❌ None (Text hardcoded in `.tsx`)                                               | ✅ `messages/en.json`<br>✅ `messages/bn.json`<br>✅ `messages/ja.json`                                     |
| **Config Files**     | ❌ None                                                                          | ✅ `src/i18n/routing.ts`<br>✅ `src/i18n/request.ts`<br>✅ `src/i18n/navigation.ts`                         |

---

### 1.2 Rendering Text in Server Components

```tsx
// ❌ WITHOUT Multi-language (Hardcoded text)
export default async function HomePage() {
  return (
    <div>
      <h1>Direct Trade Between Wholesalers & Retail Stores</h1>
      <p>Connect with trusted suppliers and order in bulk.</p>
    </div>
  );
}
```

```tsx
// ✅ WITH Multi-language (next-intl Server Component)
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  // 1. Fetch translation namespace on the server
  const t = await getTranslations("home");

  return (
    <div>
      {/* 2. Referenced by dictionary key */}
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
    </div>
  );
}
```

---

### 1.3 Rendering Text in Client Components ("use client")

```tsx
// ❌ WITHOUT Multi-language (Hardcoded text)
"use client";

export function LoginForm() {
  return (
    <form>
      <label>Email Address</label>
      <input placeholder="orders@business.com" />
      <button>Sign In</button>
    </form>
  );
}
```

```tsx
// ✅ WITH Multi-language (next-intl Client Component)
"use client";

import { useTranslations } from "next-intl";

export function LoginForm() {
  // 1. React hook reads active messages from NextIntlClientProvider
  const t = useTranslations("auth");

  return (
    <form>
      {/* 2. Dynamically rendered in English, Bengali, or Japanese */}
      <label>{t("email")}</label>
      <input placeholder={t("emailPlaceholder")} />
      <button>{t("signInBtn")}</button>
    </form>
  );
}
```

---

### 1.4 Navigation Links

```tsx
// ❌ WITHOUT Multi-language (Standard Next.js Link)
import Link from "next/link";

export function Header() {
  // PROBLEM: If a user is on Bengali (e.g. /bn), clicking this
  // drops the prefix and navigates back to English (/shop)!
  return <Link href="/shop">Shop</Link>;
}
```

```tsx
// ✅ WITH Multi-language (Localized next-intl Link)
import { Link } from "@/i18n/navigation";

export function Header() {
  // SOLUTION: Automatically preserves the user's active language!
  // - On English: renders <a href="/shop">
  // - On Bengali: renders <a href="/bn/shop">
  // - On Japanese: renders <a href="/ja/shop">
  return <Link href="/shop">Shop</Link>;
}
```

---

### 1.5 Programmatic Navigation (`router.push`)

```tsx
// ❌ WITHOUT Multi-language
import { useRouter } from "next/navigation";

function onSubmit() {
  const router = useRouter();
  // Navigates strictly to English route
  router.push("/wholesaler/dashboard");
}
```

```tsx
// ✅ WITH Multi-language
import { useRouter } from "@/i18n/navigation";

function onSubmit() {
  const router = useRouter();
  // Automatically navigates to:
  // - "/wholesaler/dashboard" if in English
  // - "/bn/wholesaler/dashboard" if in Bengali
  // - "/ja/wholesaler/dashboard" if in Japanese
  router.push("/wholesaler/dashboard");
}
```

---

### 1.6 Getting Current URL Path (`usePathname`)

```tsx
// ❌ WITHOUT Multi-language
import { usePathname } from "next/navigation";

function NavItem() {
  const pathname = usePathname();
  // On Bengali, pathname would be "/bn/shop" instead of "/shop",
  // so this equality check breaks!
  const isActive = pathname === "/shop";
}
```

```tsx
// ✅ WITH Multi-language
import { usePathname } from "@/i18n/navigation";

function NavItem() {
  const pathname = usePathname();
  // 'usePathname' strips any /bn or /ja prefix automatically!
  // It returns "/shop" on all languages, keeping active checks clean:
  const isActive = pathname === "/shop";
}
```

---

### 1.7 Middleware & Route Guards (Supabase)

```typescript
// ❌ WITHOUT Multi-language
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only matches English paths!
  // If someone goes to "/bn/wholesaler", this check FAILS and leaks access!
  if (pathname.startsWith("/wholesaler")) {
    if (!user) return NextResponse.redirect("/login");
  }
}
```

```typescript
// ✅ WITH Multi-language (Chained & Normalized)
export async function middleware(request: NextRequest) {
  // Step 1: Resolve language first
  const intlResponse = handleIntlRouting(request);
  if (intlResponse.headers.has("x-middleware-redirect")) return intlResponse;

  // Step 2: In Supabase guard, normalize localized path:
  const localeMatch = pathname.match(/^\/(bn|ja|en)(?=\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  const normalizedPathname =
    pathname.replace(/^\/(?:bn|ja|en)(?=\/|$)/, "") || "/";

  // Now "/bn/wholesaler" is normalized to "/wholesaler":
  if (normalizedPathname.startsWith("/wholesaler")) {
    if (!user) {
      // Redirect maintains user's active language!
      return NextResponse.redirect(`${localePrefix}/login`);
    }
  }
}
```

---

## 2. Quick FAQ: The Fundamentals

### Q1: Is it normal to have `/bn` or `/ja` in the URL?

**Yes, it is the worldwide industry standard for global websites and marketplaces.** You encounter this every day across major technology platforms, though English is usually the default (which hides the prefix):

| Company         | Default English URL      | Localized URL                                                        |
| :-------------- | :----------------------- | :------------------------------------------------------------------- |
| **Apple**       | `apple.com/iphone`       | `apple.com/jp/iphone` _(Japan)_<br>`apple.com/de/iphone` _(Germany)_ |
| **Stripe**      | `stripe.com`             | `stripe.com/ja` _(Japan)_<br>`stripe.com/fr` _(France)_              |
| **Microsoft**   | `microsoft.com/en-us/`   | `microsoft.com/ja-jp/`                                               |
| **PlayStation** | `playstation.com/en-us/` | `playstation.com/ja-jp/`                                             |
| **Nintendo**    | `nintendo.com`           | `nintendo.com/jp/`                                                   |
| **Wikipedia**   | `en.wikipedia.org`       | `bn.wikipedia.org` _(Bengali)_<br>`ja.wikipedia.org` _(Japanese)_    |

#### Why websites put language in the URL:

1. **Google & Search Engine SEO**:
   Googlebot cannot click a language dropdown. If your Bengali and English pages share the exact same URL (`batchloop.com/shop`), Google will **only index the English version**. Having `/bn/shop` ensures Google indexes your store for Bengali search queries.
2. **Shareable Links**:
   If a retailer in Bangladesh shares a link on WhatsApp (`batchloop.com/bn/shop/catalog`), it opens directly in Bengali for the recipient instead of defaulting to English.

---

### Q2: Why three helper files (`routing.ts`, `request.ts`, `navigation.ts`)?

```
src/i18n/
├── 1. routing.ts      👉 The "Rulebook" (Defines valid languages and URL rules)
├── 2. request.ts      👉 The "Server Loader" (Loads the right JSON file per request)
└── 3. navigation.ts   👉 The "Smart Link" (Auto-prefixes links so users stay in their language)
```

1. **`routing.ts`**: The single configuration source of truth for locales (`['en', 'bn', 'ja']`) and prefix rules.
2. **`request.ts`**: Next.js server configuration that dynamically loads `messages/${locale}.json` without bundling all languages into the client bundle.
3. **`navigation.ts`**: Exports localized `Link`, `useRouter`, and `usePathname` so developers write standard paths like `/shop` and the library automatically handles language prefixes.

---

### Q3: What if I prefer clean URLs everywhere without `/bn` or `/ja`?

If you prefer the web-app style used by **GitHub, Slack, or Linear** (where URLs stay `/shop` in every language, and the language is tracked purely via cookies), you can switch with a **1-line change** in [`src/i18n/routing.ts`](file:///d:/Projects/WebDevelopment/BatchLoop/batchloop/src/i18n/routing.ts):

```typescript
// Change from:
localePrefix: "as-needed";

// To:
localePrefix: "never";
```

---

## 3. Request Lifecycle (Under the Hood)

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

## 4. Directory Map

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

## 5. How to Add New Translation Keys

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
<span>{t("statusPending")}</span>;
```

---

## 6. How to Add a New Language (e.g. Spanish `es`)

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
   const normalizedPathname =
     pathname.replace(/^\/(?:en|bn|ja|es)(?=\/|$)/, "") || "/";
   ```

---

## 7. Verifying Changes

Before committing or pushing code, run:

```bash
npm run build
```

This verifies TypeScript types, ensures all translation keys match, and compiles all 27 static and dynamic localized routes with exit code 0.


