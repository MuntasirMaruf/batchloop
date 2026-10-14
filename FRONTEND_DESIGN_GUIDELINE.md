# BatchLoop Frontend Design & Configuration Guideline

This document is the official developer guideline for **BatchLoop** frontend development. It defines the visual identity, token architecture, and coding standards that **must be followed across all existing and future pages** so the entire platform maintains the clean, high-contrast, modern B2B aesthetic.

---

## 1. Core Visual Identity

BatchLoop uses a signature **monochrome base with purposeful domain role accents**:

- **Dark Mode**: Pitch-black canvas (`#0a0a0a`), elevated dark cards (`#171717`), subtle borders (`#262626`), and crisp off-white text (`#ededed`).
- **Light Mode**: Clean soft canvas (`#fafafa`), pure white cards (`#ffffff`), crisp dark text (`#171717`), and subtle borders (`#e5e5e5`).
- **Domain Accents**:
  - **Wholesaler (B2B Supply)**: Royal Blue (`#2563eb` light / `#60a5fa` dark)
  - **Retailer (Shop Owner)**: Commerce Emerald (`#059669` light / `#34d399` dark)
  - **Platform & System**: Violet / Purple (`#9333ea` light / `#c084fc` dark)
- **Typography**: Clean, bold, punchy `Arial, Helvetica, sans-serif` for instant native rendering with zero layout shift.

---

## 2. Configuration System Architecture (`@/config`)

All configuration is centralized under `src/config/`. **Never hardcode styles, routes, categories, or magic strings directly in components.**

```
src/config/
├── index.ts          # Unified entry point (export * from './theme.config', etc.)
├── theme.config.ts   # Design tokens: colors, typography, radii, shadows, z-index
├── app.config.ts     # Metadata, route matrix, role redirects, business rules, limits
└── fonts.ts          # Font configuration
```

### Import Convention
Always import tokens, routes, and configs from the `@/config` alias:
```tsx
import { routes, siteConfig, roleRedirects, businessConfig } from "@/config";
```

---

## 3. Color Tokens Reference & Utility Classes

Tailwind CSS v4 is bound directly to our CSS variables in `src/app/globals.css`. Always use these semantic classes instead of arbitrary color shades:

| UI Layer | Tailwind Class | Light Value | Dark Value | Where to Use |
| :--- | :--- | :--- | :--- | :--- |
| **Page Canvas** | `bg-background` | `#fafafa` | `#0a0a0a` | Page wrapper `min-h-screen` |
| **Card / Panel** | `bg-card` | `#ffffff` | `#171717` | Cards, dashboard widgets, modal dialogs |
| **Card Text** | `text-card-foreground` | `#171717` | `#ededed` | Headers & primary text inside cards |
| **Primary Text** | `text-foreground` | `#171717` | `#ededed` | Page titles, labels, headlines |
| **Muted Text** | `text-muted-foreground` | `#525252` | `#a3a3a3` | Subtitles, helper text, descriptions |
| **Subtle Text** | `text-muted-subtle` | `#737373` | `#737373` | Metadata, timestamps, footnote text |
| **Card Border** | `border-border` | `#e5e5e5` | `#262626` | Card outlines, dividers, headers |
| **Border Hover** | `hover:border-border-hover` | `#a3a3a3` | `#525252` | Card interactive hover state |
| **Primary Action** | `bg-primary text-primary-foreground` | `#171717` (white text) | `#ededed` (black text) | Main CTA buttons (Register, Confirm, Submit) |
| **Secondary Action** | `bg-secondary text-secondary-foreground` | `#f5f5f5` | `#262626` | Secondary buttons, cancel buttons |
| **Badge Background**| `bg-muted` | `rgba(229,229,229,0.8)` | `rgba(38,38,38,0.8)` | Pill badges, tag containers |

### Domain Role & Status Tokens

| Role / Status | Background Pill | Text / Icon | Border | Example Component |
| :--- | :--- | :--- | :--- | :--- |
| **Wholesaler** | `bg-wholesaler-subtle` | `text-wholesaler-text dark:text-wholesaler` | `border-wholesaler-border` | Wholesaler cards, portal badge, invite links |
| **Retailer** | `bg-retailer-subtle` | `text-retailer-text dark:text-retailer` | `border-retailer-border` | Retailer cards, shop badges, catalog status |
| **Purple Highlight** | `text-accent-purple` | `text-accent-purple` | — | Payment terms, multi-tier badges |
| **Success** | `bg-success-subtle` | `text-success` | `border-success-border` | "Active", "Verified", "Delivered" pills |
| **Warning** | `bg-warning-subtle` | `text-warning` | `border-warning-border` | "Pending Review", "Low Stock" |
| **Destructive** | `bg-destructive-subtle` | `text-destructive` | `border-destructive-border` | Error banners, "Rejected", "Cancel Order" |

---

## 4. Typography Scale & Hierarchy

- **Font Family**: Standard `Arial, Helvetica, sans-serif` across all elements.

| Scale Token | Utility Class | Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `text-3xl sm:text-5xl lg:text-6xl` | `font-extrabold` | `tracking-tight` | Landing page hero headlines |
| **Page Heading** | `text-xl sm:text-2xl` | `font-bold` | `tracking-tight` | Dashboard titles, section headings |
| **Card Heading** | `text-base` | `font-bold` | `tracking-tight` | Feature card titles, modal titles |
| **Subtitle** | `text-sm sm:text-base` | `font-normal` | `normal` | Hero subtitles, section descriptions |
| **Body Text** | `text-sm` | `font-normal` | `normal` | Form inputs, standard table rows |
| **Helper / Caption** | `text-xs` | `font-normal` / `font-medium` | `normal` | Card descriptions, footer links, form hints |
| **Micro / Data** | `text-[11px]` | `font-semibold` | `tracking-wide` | Status pills, badge text |
| **Nano / Table Label** | `text-[10px]` | `font-bold` | `uppercase tracking-wider` | Table header columns, role tags |

---

## 5. Radii Scale (Corner Rounding)

To maintain geometric harmony across screens, always use the standardized radii rules:

- **`rounded-2xl` (16px / `1rem`)**: Top-level cards, dashboard widget containers, hero action pathways.
- **`rounded-xl` (12px / `0.75rem`)**: Icon highlight containers, floating dropdown menus, modal dialogs.
- **`rounded-lg` (8px / `0.5rem`)**: Buttons, input fields, header brand logo box (`BL`), select dropdown triggers.
- **`rounded-md` (6px / `0.375rem`)**: Form check boxes, small action buttons.
- **`rounded-full` (9999px)**: Top product badges, status indicators, avatar circles.

---

## 6. Layout & Spacing Rules

- **Header**:
  - Always `sticky top-0 z-40`.
  - Always use `border-b border-border bg-background/80 backdrop-blur-sm` for seamless canvas blending.
  - Height is standard `h-16` (64px).
- **Page Container Widths**:
  - Landing & Auth Pages: `max-w-6xl mx-auto px-4 sm:px-6`
  - Portal & Dashboard Pages: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Card Spacing**:
  - Standard card padding: `p-5 sm:p-6`
  - Gap between grid cards: `gap-4 sm:gap-6`
- **Footer**:
  - Always `w-full border-t border-border bg-background/80 backdrop-blur-sm py-5`.

---

## 7. Developer Recipes & Code Snippets

### Recipe A: Creating a Feature / Role Card
```tsx
import { Link } from "@/i18n/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { routes } from "@/config";

export function WholesalerCard() {
  return (
    <Link
      href={`${routes.auth.register}?role=wholesaler`}
      className="p-5 sm:p-6 rounded-2xl border border-border bg-card hover:border-border-hover transition-all shadow-xs group"
    >
      <div className="p-3 rounded-xl bg-wholesaler-subtle text-wholesaler-text dark:text-wholesaler w-fit mb-3">
        <Building2 className="w-6 h-6" />
      </div>
      <h2 className="text-base font-bold text-foreground flex items-center justify-between">
        <span>For Wholesalers</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </h2>
      <p className="text-xs text-muted-subtle dark:text-muted-foreground mt-1">
        Publish catalogs, invite existing buyers with 1-click links, and manage bulk trade orders.
      </p>
    </Link>
  );
}
```

### Recipe B: Creating a Primary Button (Black in Light, White in Dark)
```tsx
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs sm:text-sm font-semibold cursor-pointer shadow-xs disabled:opacity-50"
    >
      {children}
    </button>
  );
}
```

### Recipe C: Creating a Status Badge / Chip
```tsx
import { CheckCircle2 } from "lucide-react";

export function ActiveStatusBadge({ label = "Active Retailer" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-retailer-subtle text-retailer-text dark:text-retailer border border-retailer-border">
      <CheckCircle2 className="w-3 h-3" />
      {label}
    </span>
  );
}
```

### Recipe D: Form Input Field
```tsx
export function FormInput({ id, label, placeholder, type = "text" }: { id: string; label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
```

---

## 8. Anti-Patterns ("Never Do" List)

1. ❌ **Never hardcode hex codes or arbitrary shades**: Do not write `bg-zinc-900`, `bg-[#121212]`, or `text-blue-500`. Always write `bg-card`, `bg-background`, `text-foreground`, `text-wholesaler`.
2. ❌ **Never hardcode route paths**: Do not write `href="/login"` or `href="/wholesaler/dashboard"`. Use `routes.auth.login` or `routes.wholesaler.dashboard`.
3. ❌ **Never override the font family**: Do not import foreign web fonts into individual components. The platform uses the global `Arial, Helvetica, sans-serif` stack for maximum visual consistency.
4. ❌ **Never mix arbitrary corner radiuses**: Avoid `rounded-sm` or `rounded-3xl` on standard cards — cards must always be `rounded-2xl` and buttons must always be `rounded-lg`.
5. ❌ **Never hardcode business lists**: Business categories, payment options, and language metadata belong in `src/config/app.config.ts`.
