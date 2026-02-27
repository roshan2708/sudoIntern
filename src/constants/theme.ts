/**
 * Centralized design tokens for sudoIntern.
 * All component styling MUST reference these tokens.
 */

export const Colors = {
    // ─── Primary palette ────────────────────────────────
    primary: '#6C5CE7',
    primaryLight: '#A29BFE',
    primaryDark: '#4A3FB5',
    primaryGhost: 'rgba(108,92,231,0.12)',

    // ─── Accent ─────────────────────────────────────────
    accent: '#00CEC9',
    accentLight: '#81ECEC',

    // ─── Backgrounds ────────────────────────────────────
    background: '#0A0E1A',
    surface: '#141929',
    surfaceLight: '#1E2438',
    card: '#1A1F35',
    cardHover: '#222842',

    // ─── Text ───────────────────────────────────────────
    text: '#FFFFFF',
    textSecondary: '#A0A4B8',
    textMuted: '#6B7084',
    textInverse: '#0A0E1A',

    // ─── Borders ────────────────────────────────────────
    border: '#2A2F45',
    borderLight: '#3A3F55',

    // ─── Status ─────────────────────────────────────────
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#FF6B6B',
    info: '#74B9FF',

    // ─── Status badge backgrounds ───────────────────────
    appliedBg: 'rgba(116,185,255,0.15)',
    interviewBg: 'rgba(253,203,110,0.15)',
    rejectedBg: 'rgba(255,107,107,0.15)',
    selectedBg: 'rgba(0,184,148,0.15)',

    // ─── Misc ───────────────────────────────────────────
    skeleton: '#242940',
    skeletonShimmer: '#2E3350',
    overlay: 'rgba(10,14,26,0.7)',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
} as const;

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
} as const;

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
} as const;

export const BorderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
} as const;

export const Shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    button: {
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
} as const;
