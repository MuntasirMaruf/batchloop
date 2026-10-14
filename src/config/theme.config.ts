/**
 * ============================================================================
 * THEME CONFIGURATION: src/config/theme.config.ts
 * ============================================================================
 * Single source of truth for the BatchLoop design system tokens:
 * - Color palettes matching BatchLoop's signature high-contrast aesthetic
 * - Light: Neutral-50 (#fafafa) canvas, pure white cards, crisp #171717 text
 * - Dark: Deep #0a0a0a canvas, Neutral-900 (#171717) cards, crisp #ededed text
 * - Typography scales with classic B2B clean sans-serif (Arial / Helvetica)
 * - Standardized Radii (sm: 4px, md: 6px, lg: 8px, xl: 12px, 2xl: 16px, full)
 * ============================================================================
 */

export const colorTokens = {
  light: {
    // Core Brand / Action (Register button, primary actions)
    primary: "#171717", // Neutral 900
    primaryForeground: "#ffffff",
    primaryHover: "#262626", // Neutral 800
    primaryActive: "#404040", // Neutral 700

    // Secondary / Muted Action
    secondary: "#f5f5f5", // Neutral 100
    secondaryForeground: "#171717",
    secondaryHover: "#e5e5e5", // Neutral 200

    // Accent / Highlight
    accent: "#ffffff",
    accentForeground: "#171717",

    // Canvas & Neutral Layers
    background: "#fafafa", // Neutral 50 (clean soft background from screenshot)
    foreground: "#171717", // Neutral 900 (crisp high-contrast text)
    card: "#ffffff", // Pure white card
    cardForeground: "#171717",
    popover: "#ffffff",
    popoverForeground: "#171717",

    // Muted & Inactive Elements
    muted: "rgba(229, 229, 229, 0.8)", // Neutral 200/80 badge background
    mutedForeground: "#525252", // Neutral 600 body / subtitle
    mutedSubtle: "#737373", // Neutral 500 metadata

    // Borders & Focus Rings
    border: "#e5e5e5", // Neutral 200 card border
    borderHover: "#a3a3a3", // Neutral 400 card border on hover
    borderSubtle: "#f5f5f5", // Neutral 100
    input: "#e5e5e5",
    ring: "#171717",

    // Badge specific
    badgeBg: "rgba(229, 229, 229, 0.8)",
    badgeText: "#404040", // Neutral 700

    // Status / Feedback Tokens
    success: "#10b981", // Emerald 500
    successForeground: "#ffffff",
    successSubtle: "#ecfdf5", // Emerald 50
    successBorder: "#a7f3d0", // Emerald 200
    successText: "#047857", // Emerald 700

    warning: "#f59e0b", // Amber 500
    warningForeground: "#ffffff",
    warningSubtle: "#fffbeb", // Amber 50
    warningBorder: "#fde68a", // Amber 200
    warningText: "#b45309", // Amber 700

    destructive: "#ef4444", // Red 500
    destructiveForeground: "#ffffff",
    destructiveSubtle: "#fef2f2", // Red 50
    destructiveBorder: "#fecaca", // Red 200
    destructiveText: "#b91c1c", // Red 700

    info: "#0284c7", // Sky 600
    infoForeground: "#ffffff",
    infoSubtle: "#f0f9ff", // Sky 50
    infoBorder: "#bae6fd", // Sky 200
    infoText: "#0369a1", // Sky 700

    // B2B Domain Role Tokens (Exact values from screenshot)
    wholesaler: {
      primary: "#2563eb", // Blue 600
      subtle: "#eff6ff", // Blue 50 icon container
      border: "#bfdbfe", // Blue 200
      text: "#1d4ed8", // Blue 700 icon & badge
      badge: "#dbeafe", // Blue 100
    },
    retailer: {
      primary: "#059669", // Emerald 600
      subtle: "#ecfdf5", // Emerald 50 icon container
      border: "#a7f3d0", // Emerald 200
      text: "#047857", // Emerald 700 icon & badge
      badge: "#d1fae5", // Emerald 100
    },
    purple: {
      primary: "#9333ea", // Purple 600
      subtle: "#faf5ff", // Purple 50
      border: "#e9d5ff", // Purple 200
      text: "#7e22ce", // Purple 700
      badge: "#f3e8ff", // Purple 100
    },
  },

  dark: {
    // Core Brand / Action (Register button in dark mode)
    primary: "#ededed", // Neutral 100 (white button with dark text)
    primaryForeground: "#171717", // Neutral 900
    primaryHover: "#f5f5f5",
    primaryActive: "#e5e5e5",

    // Secondary / Muted Action
    secondary: "#262626", // Neutral 800
    secondaryForeground: "#ededed",
    secondaryHover: "#404040",

    // Accent / Highlight
    accent: "#171717",
    accentForeground: "#ededed",

    // Canvas & Neutral Layers
    background: "#0a0a0a", // Neutral 950 (deep black from screenshot)
    foreground: "#ededed", // Neutral 100 (crisp high-contrast text)
    card: "#171717", // Neutral 900 (elevated dark card)
    cardForeground: "#ededed",
    popover: "#171717",
    popoverForeground: "#ededed",

    // Muted / Inactive Elements
    muted: "rgba(38, 38, 38, 0.8)", // Neutral 800/80 badge background
    mutedForeground: "#a3a3a3", // Neutral 400 subtitle & text
    mutedSubtle: "#737373", // Neutral 500 metadata

    // Borders & Focus Rings
    border: "#262626", // Neutral 800 card border
    borderHover: "#525252", // Neutral 600 card border on hover
    borderSubtle: "#1f1f1f",
    input: "#262626",
    ring: "#ededed",

    // Badge specific
    badgeBg: "rgba(38, 38, 38, 0.8)",
    badgeText: "#d4d4d4", // Neutral 300

    // Status / Feedback Tokens (Dark Adapted)
    success: "#34d399", // Emerald 400
    successForeground: "#064e3b",
    successSubtle: "rgba(2, 44, 34, 0.6)", // Emerald 950/60
    successBorder: "#065f46", // Emerald 800
    successText: "#6ee7b7", // Emerald 300

    warning: "#fbbf24", // Amber 400
    warningForeground: "#78350f",
    warningSubtle: "rgba(120, 53, 15, 0.6)",
    warningBorder: "#92400e",
    warningText: "#fcd34d",

    destructive: "#f87171", // Red 400
    destructiveForeground: "#450a0a",
    destructiveSubtle: "rgba(127, 29, 29, 0.6)",
    destructiveBorder: "#991b1b",
    destructiveText: "#fca5a5",

    info: "#38bdf8", // Sky 400
    infoForeground: "#082f49",
    infoSubtle: "rgba(12, 74, 110, 0.6)",
    infoBorder: "#075985",
    infoText: "#7dd3fc",

    // B2B Domain Role Tokens (Exact values from screenshot)
    wholesaler: {
      primary: "#60a5fa", // Blue 400
      subtle: "rgba(23, 37, 84, 0.6)", // Blue 950/60 icon container
      border: "#1e3a8a", // Blue 800
      text: "#93c5fd", // Blue 300 icon & badge
      badge: "rgba(30, 58, 138, 0.4)",
    },
    retailer: {
      primary: "#34d399", // Emerald 400
      subtle: "rgba(2, 44, 34, 0.6)", // Emerald 950/60 icon container
      border: "#065f46", // Emerald 800
      text: "#6ee7b7", // Emerald 300 icon & badge
      badge: "rgba(6, 78, 59, 0.4)",
    },
    purple: {
      primary: "#c084fc", // Purple 400
      subtle: "rgba(88, 28, 135, 0.6)", // Purple 950/60
      border: "#6b21a8", // Purple 800
      text: "#d8b4fe", // Purple 300
      badge: "rgba(88, 28, 135, 0.4)",
    },
  },
} as const;

/**
 * ============================================================================
 * TYPOGRAPHY TOKENS
 * ============================================================================
 * Preserves the exact typography from the screenshot:
 * Clean, bold, punchy sans-serif (Arial, Helvetica, sans-serif)
 * ============================================================================
 */
export const typography = {
  fonts: {
    sans: "Arial, Helvetica, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  scale: {
    "display-2xl": {
      fontSize: "4.5rem", // 72px
      lineHeight: "1.1",
      letterSpacing: "-0.025em",
      fontWeight: "800",
    },
    "display-xl": {
      fontSize: "3.75rem", // 60px
      lineHeight: "1.15",
      letterSpacing: "-0.025em",
      fontWeight: "800",
    },
    "display-lg": {
      fontSize: "3rem", // 48px
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
      fontWeight: "700",
    },
    h1: {
      fontSize: "2.25rem", // 36px
      lineHeight: "1.25",
      letterSpacing: "-0.02em",
      fontWeight: "700",
    },
    h2: {
      fontSize: "1.875rem", // 30px
      lineHeight: "1.3",
      letterSpacing: "-0.015em",
      fontWeight: "700",
    },
    h3: {
      fontSize: "1.5rem", // 24px
      lineHeight: "1.35",
      letterSpacing: "-0.01em",
      fontWeight: "600",
    },
    h4: {
      fontSize: "1.25rem", // 20px
      lineHeight: "1.4",
      letterSpacing: "-0.005em",
      fontWeight: "600",
    },
    body: {
      fontSize: "1rem", // 16px
      lineHeight: "1.5",
      letterSpacing: "0",
      fontWeight: "400",
    },
    "body-sm": {
      fontSize: "0.875rem", // 14px
      lineHeight: "1.45",
      letterSpacing: "0",
      fontWeight: "400",
    },
    "body-xs": {
      fontSize: "0.75rem", // 12px
      lineHeight: "1.4",
      letterSpacing: "0.01em",
      fontWeight: "400",
    },
    micro: {
      fontSize: "0.6875rem", // 11px
      lineHeight: "1.35",
      letterSpacing: "0.02em",
      fontWeight: "500",
    },
    nano: {
      fontSize: "0.625rem", // 10px
      lineHeight: "1.3",
      letterSpacing: "0.03em",
      fontWeight: "600",
    },
  },
} as const;

/**
 * ============================================================================
 * RADII TOKENS (Border Radius)
 * ============================================================================
 * Matches the exact geometry of the screenshot:
 * - Cards: rounded-2xl (1rem / 16px)
 * - Icon Containers: rounded-xl (0.75rem / 12px)
 * - Buttons & Logo: rounded-lg (0.5rem / 8px)
 * - Badges: rounded-full (9999px)
 * ============================================================================
 */
export const radii = {
  none: "0px",
  xs: "0.125rem", // 2px
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px (Buttons, Logo, Menu triggers)
  xl: "0.75rem", // 12px (Icon containers)
  "2xl": "1rem", // 16px (Cards & Main Panels)
  "3xl": "1.5rem", // 24px
  full: "9999px", // Pill Badges
} as const;

/**
 * ============================================================================
 * SHADOW TOKENS
 * ============================================================================
 */
export const shadows = {
  none: "none",
  "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

export const layout = {
  headerHeight: "4rem", // 64px
  mobileHeaderHeight: "3.5rem", // 56px
  containerMaxWidth: {
    xl: "1152px", // 6xl
    "2xl": "1280px", // 7xl
  },
} as const;

export const themeConfig = {
  colors: colorTokens,
  typography,
  radii,
  shadows,
  zIndex,
  layout,
  defaultTheme: "system" as const,
};

export type ThemeConfig = typeof themeConfig;
export type ColorTokens = typeof colorTokens;
export type RadiiTokens = typeof radii;
