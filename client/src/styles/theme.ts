/**
 * 🎨 Comprehensive Theme System
 * Modern, Professional, RTL-Ready Design System for ERP
 */

export const theme = {
  // ==========================================
  // 🌈 Color Palette
  // ==========================================
  colors: {
    // Primary
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c3d66",
    },

    // Accent
    accent: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },

    // Success
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#145231",
    },

    // Warning
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },

    // Danger
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },

    // Neutral
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },

    // Semantic
    background: "#ffffff",
    foreground: "#171717",
    muted: "#f5f5f5",
    "muted-foreground": "#737373",
    border: "#e5e5e5",
    ring: "#0ea5e9",
  },

  // ==========================================
  // 🔤 Typography
  // ==========================================
  typography: {
    // Font Families
    fontFamily: {
      sans: '"Cairo", "Segoe UI", system-ui, -apple-system, sans-serif',
      mono: '"Monaco", "Courier New", monospace',
      arabic: '"Cairo", "Traditional Arabic", sans-serif',
    },

    // Font Sizes
    fontSize: {
      xs: { size: "0.75rem", lineHeight: "1rem", weight: 400 }, // 12px
      sm: { size: "0.875rem", lineHeight: "1.25rem", weight: 400 }, // 14px
      base: { size: "1rem", lineHeight: "1.5rem", weight: 400 }, // 16px
      lg: { size: "1.125rem", lineHeight: "1.75rem", weight: 400 }, // 18px
      xl: { size: "1.25rem", lineHeight: "1.75rem", weight: 500 }, // 20px
      "2xl": { size: "1.5rem", lineHeight: "2rem", weight: 600 }, // 24px
      "3xl": { size: "1.875rem", lineHeight: "2.25rem", weight: 700 }, // 30px
      "4xl": { size: "2.25rem", lineHeight: "2.5rem", weight: 700 }, // 36px
    },

    // Letter Spacing
    letterSpacing: {
      tight: "-0.02em",
      normal: "0em",
      wide: "0.02em",
      wider: "0.05em",
    },
  },

  // ==========================================
  // 📦 Spacing Scale
  // ==========================================
  spacing: {
    0: "0px",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  // ==========================================
  // 🎭 Shadows & Depths
  // ==========================================
  shadows: {
    none: "none",
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },

  // ==========================================
  // 🔲 Border Radius
  // ==========================================
  borderRadius: {
    none: "0px",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  },

  // ==========================================
  // ⚡ Transitions & Animations
  // ==========================================
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slower: "500ms cubic-bezier(0.4, 0, 0.2, 1)",

    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // ==========================================
  // 📱 Breakpoints (Mobile First)
  // ==========================================
  breakpoints: {
    xs: "0px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // ==========================================
  // 🎯 Component Tokens
  // ==========================================
  components: {
    button: {
      height: {
        xs: "1.75rem", // 28px
        sm: "2rem", // 32px
        md: "2.5rem", // 40px
        lg: "3rem", // 48px
      },
      padding: {
        xs: "0.25rem 0.75rem",
        sm: "0.5rem 1rem",
        md: "0.75rem 1.5rem",
        lg: "1rem 2rem",
      },
    },

    input: {
      height: "2.5rem", // 40px
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem", // 8px
    },

    card: {
      padding: "1.5rem", // 24px
      borderRadius: "0.75rem", // 12px
      border: "1px solid",
    },

    modal: {
      maxWidth: "28rem", // 448px
      borderRadius: "0.75rem",
      padding: "1.5rem",
    },

    sidebar: {
      width: "16rem", // 256px
      "width-collapsed": "4rem", // 64px
    },
  },

  // ==========================================
  // 🌐 RTL Support
  // ==========================================
  rtl: {
    direction: "rtl",
    textAlign: "right",
    marginStart: "marginRight",
    marginEnd: "marginLeft",
    paddingStart: "paddingRight",
    paddingEnd: "paddingLeft",
  },

  // ==========================================
  // 🌙 Dark Mode
  // ==========================================
  darkMode: {
    background: "#0f172a",
    foreground: "#f8fafc",
    surface: "#1e293b",
    border: "#334155",
    muted: "#334155",
    "muted-foreground": "#cbd5e1",
  },
} as const;

export type Theme = typeof theme;
