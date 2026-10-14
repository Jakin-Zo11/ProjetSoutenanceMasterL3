/**
 * Design tokens & color palette for the EMIT Soutenances dashboard.
 * Respects the EMIT Fianarantsoa visual chart.
 *
 * Color proportions (dashboard-wide):
 * - White (#FFFFFF) + Light Blue-Grey (#F5F8FF) ~ 45% → backgrounds, cards, content zones
 * - Navy (#0B1F4B) ~ 20% → sidebar, header, titles, primary text
 * - Solid Blue (#2563EB) ~ 20% → primary buttons, links, active elements, charts
 * - Sky Blue (#7DD3FC / #E0F2FE) ~ 10% → hovers, badges, secondary backgrounds, illustrations
 * - Red (#E11D48) ≤ 5% → discrete accents only: alerts, errors, deletion, notification badges
 */

import { Platform } from 'react-native';

const tintColorLight = '#0B1F4B';
const tintColorDark = '#0B1F4B';

export const Colors = {
  light: {
    navy: '#0B1F4B',
    white: '#FFFFFF',
    black: '#000000',
    text: '#0B1F4B',
    background: '#FFFFFF',
    surface: '#F5F8FF',
    tint: tintColorLight,
    icon: '#475569',
    muted: '#64748B',
    primary: '#2563EB',
    sky: '#7DD3FC',
    skyLight: '#E0F2FE',
    border: '#E5EAF5',
    error: '#E11D48',
    success: '#16A34A',
    warning: '#F59E0B',
    placeholder: '#9CA3AF',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F1F5F9',
    background: '#0B1F3A',
    surface: '#0F1E3A',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#7DD3FC',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter-Regular',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    mono: 'SFMono-Regular',
  },
  default: {
    sans: 'normal',
    semiBold: 'normal',
    bold: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    semiBold: "Inter-SemiBold, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    bold: "Inter-Bold, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  sm: '0px 1px 3px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.03)',
  md: '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.03)',
  lg: '0px 10px 15px -3px rgba(0,0,0,0.05), 0px 4px 6px -4px rgba(0,0,0,0.03)',
  xl: '0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.02)',
};

export const Transitions = {
  fast: '150ms',
  normal: '250ms',
};

export default Colors;
