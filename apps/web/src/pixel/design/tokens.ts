/*
 * Wealth Wars Design Tokens (Neo-Pixel)
 * Source of truth for colors, spacing, radii, motion, easing, z-index, and effect IDs.
 * Sync with ART_MOTION_BIBLE.md.
 */

export const colors = {
  background: '#0A0F1A',
  foreground: '#E6EDF5',
  card: '#0F172A',
  cardForeground: '#E6EDF5',
  popover: '#0F172A',
  popoverForeground: '#E6EDF5',
  primary: '#22C55E',
  primaryForeground: '#FFFFFF',
  secondary: '#1E293B',
  secondaryForeground: '#E6EDF5',
  muted: '#374151',
  mutedForeground: '#9CA3AF',
  accent: '#1E293B',
  accentForeground: '#E6EDF5',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  warning: '#F59E0B',
  warningForeground: '#FFFFFF',
  success: '#22C55E',
  successForeground: '#FFFFFF',
  border: '#374151',
  input: '#374151',
  ring: '#22C55E',
  // Extended / planned
  xpGlow: '#3B82F6',
  creditFlux: '#C084FC',
  rareArtifact: '#F472B6',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const radii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const motion = {
  duration: {
    fast: 80,
    base: 200,
    medium: 320,
    slow: 480,
    long: 800,
  },
  easing: {
    instant: 'cubic-bezier(.17,.67,.45,1)',
    standard: 'cubic-bezier(.25,.8,.25,1)',
    outBack: 'cubic-bezier(.34,1.56,.64,1)',
    elasticMicro: 'cubic-bezier(.3,1.4,.4,1)',
  },
} as const;

export const zIndex = {
  base: 0,
  overlay: 10,
  panel: 20,
  modal: 30,
  toast: 40,
  fx: 50,
  devOverlay: 90,
} as const;

export const effects = {
  levelUp: 'fx.levelUp',
  creditGain: 'fx.creditGain',
  shieldBreak: 'fx.shieldBreak',
  workPulse: 'fx.workPulse',
  attackSlash: 'fx.attackSlash',
  rareDrop: 'fx.rareDrop',
} as const;

export type EffectId = typeof effects[keyof typeof effects];

export const tokens = {
  colors,
  spacing,
  radii,
  motion,
  zIndex,
  effects,
};

export type DesignTokens = typeof tokens;

// Utility: map colors to CSS vars (optional usage)
export const toCSSVariables = () => {
  const entries = Object.entries(colors).map(([k, v]) => `--${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v};`);
  return `:root{${entries.join('')}}`;
};

export default tokens;
