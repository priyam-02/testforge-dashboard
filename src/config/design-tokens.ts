// TestForge Design System - Color & Typography Tokens
// Based on the TestForge Design System specification

// ============================================================================
// PRIMITIVE COLORS (Base Tokens)
// ============================================================================

export const COLOR_PRIMITIVES = {
  base: {
    bgDeep: '#050711',       // rgb(5, 7, 17) - Deepest background
    bgSurface: '#101421',    // rgb(16, 20, 33) - Surface/card background
    bgElevated: '#181D2B',   // rgb(24, 29, 43) - Elevated elements
    borderSubtle: '#222736', // rgb(34, 39, 54) - Borders and dividers
    textMuted: '#A6AEC8',    // rgb(166, 174, 200) - Secondary text
    textPrimary: '#F7F8FF',  // rgb(247, 248, 255) - Primary text
  },
  brand: {
    forge: '#F7931E',        // rgb(247, 147, 30) - Brand orange
  },
  outcome: {
    O1: '#FF4D4F',           // rgb(255, 77, 79) - Fails to compile (red)
    O2: '#FAAD14',           // rgb(250, 173, 20) - Runtime failure (orange)
    O3: '#9254DE',           // rgb(146, 84, 222) - Semantically invalid (purple)
    O4: '#36CFC9',           // rgb(54, 207, 201) - Valid suite (teal)
  },
  model: {
    llama: '#40A9FF',        // rgb(64, 169, 255) - Llama 3.3:70B (blue)
    qwenCoder: '#73D13D',    // rgb(115, 209, 61) - Qwen2.5-coder:14B (green)
    qwen32b: '#597EF7',      // rgb(89, 126, 247) - Qwen3:32B (indigo)
    qwen4b: '#FF85C0',       // rgb(255, 133, 192) - Qwen3:4B (pink)
  },
} as const;

// ============================================================================
// SEMANTIC COLOR TOKENS (Mapped from Primitives)
// ============================================================================

export const COLOR_SEMANTIC = {
  bg: {
    app: COLOR_PRIMITIVES.base.bgDeep,
    surface: COLOR_PRIMITIVES.base.bgSurface,
    elevated: COLOR_PRIMITIVES.base.bgElevated,
    chart: '#0C1020',        // Slightly lighter than app bg for charts
  },
  text: {
    primary: COLOR_PRIMITIVES.base.textPrimary,
    secondary: COLOR_PRIMITIVES.base.textMuted,
    inverted: COLOR_PRIMITIVES.base.bgDeep,
    accent: COLOR_PRIMITIVES.brand.forge,
    danger: COLOR_PRIMITIVES.outcome.O1,
  },
  border: {
    subtle: COLOR_PRIMITIVES.base.borderSubtle,
    focus: COLOR_PRIMITIVES.brand.forge,
    error: COLOR_PRIMITIVES.outcome.O1,
  },
  status: {
    success: COLOR_PRIMITIVES.outcome.O4,
    warning: COLOR_PRIMITIVES.outcome.O2,
    error: COLOR_PRIMITIVES.outcome.O1,
    info: COLOR_PRIMITIVES.model.llama,
  },
  chart: {
    outcome: COLOR_PRIMITIVES.outcome,
    model: COLOR_PRIMITIVES.model,
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    mono: '"IBM Plex Mono", "JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  scale: {
    h1: { size: '32px', weight: 600, lineHeight: '1.2' },
    h2: { size: '24px', weight: 600, lineHeight: '1.3' },
    h3: { size: '18px', weight: 600, lineHeight: '1.3' },
    bodyLg: { size: '16px', weight: 400, lineHeight: '1.5' },
    body: { size: '14px', weight: 400, lineHeight: '1.5' },
    caption: { size: '12px', weight: 400, lineHeight: '1.4' },
    metricLg: { size: '28px', weight: 600, lineHeight: '1.2', fontFamily: 'mono' },
    metricSm: { size: '14px', weight: 500, lineHeight: '1.3', fontFamily: 'mono' },
    code: { size: '13px', weight: 400, lineHeight: '1.5', fontFamily: 'mono' },
  },
} as const;

// ============================================================================
// SPACING TOKENS (4px base unit)
// ============================================================================

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const RADII = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '999px',
} as const;

// ============================================================================
// ELEVATION/SHADOW TOKENS
// ============================================================================

export const ELEVATION = {
  none: 'none',
  sm: '0 4px 12px rgba(0, 0, 0, 0.35)',
  md: '0 8px 24px rgba(0, 0, 0, 0.45)',
} as const;

// ============================================================================
// MOTION TOKENS
// ============================================================================

export const MOTION = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  easing: {
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;
