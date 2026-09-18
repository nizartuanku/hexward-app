import { Platform } from 'react-native';

/**
 * HDS v1 mobile tokens. Source of truth: KIT.md (design canvas v4).
 * Signal #5EB3F6 is dark-only; light scheme uses Accent-light #1668B8.
 */
export type Scheme = 'dark' | 'light';

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  critical: string;
  criticalSoft: string;
  high: string;
  highSoft: string;
  medium: string;
  mediumSoft: string;
  low: string;
  lowSoft: string;
  info: string;
  infoSoft: string;
  ok: string;
  tabBar: string;
  scrim: string;
}

export const palettes: Record<Scheme, Palette> = {
  dark: {
    bg: '#0B0F14',
    surface: '#141A22',
    surface2: '#1C2430',
    border: 'rgba(255,255,255,0.08)',
    text: '#E8ECF1',
    text2: '#9AA6B5',
    text3: '#7C8795',
    accent: '#5EB3F6',
    onAccent: '#0B0F14',
    accentSoft: 'rgba(94,179,246,0.14)',
    critical: '#F0616A',
    criticalSoft: 'rgba(229,72,77,0.18)',
    high: '#F5A25D',
    highSoft: 'rgba(240,136,62,0.18)',
    medium: '#E8C547',
    mediumSoft: 'rgba(217,164,0,0.18)',
    low: '#5CCB6E',
    lowSoft: 'rgba(63,185,80,0.18)',
    info: '#9AA6B5',
    infoSoft: 'rgba(154,166,181,0.16)',
    ok: '#5CCB6E',
    tabBar: 'rgba(11,15,20,0.92)',
    scrim: 'rgba(0,0,0,0.5)',
  },
  light: {
    bg: '#F6F7F9',
    surface: '#FFFFFF',
    surface2: '#EEF1F5',
    border: 'rgba(11,15,20,0.10)',
    text: '#0B0F14',
    text2: '#5B6675',
    text3: '#657080',
    accent: '#1668B8',
    onAccent: '#FFFFFF',
    accentSoft: 'rgba(22,104,184,0.10)',
    critical: '#C62A30',
    criticalSoft: 'rgba(198,42,48,0.10)',
    high: '#B3520A',
    highSoft: 'rgba(179,82,10,0.10)',
    medium: '#7A5E00',
    mediumSoft: 'rgba(122,94,0,0.10)',
    low: '#1F7A3A',
    lowSoft: 'rgba(31,122,58,0.10)',
    info: '#5B6675',
    infoSoft: 'rgba(91,102,117,0.10)',
    ok: '#1F7A3A',
    tabBar: 'rgba(246,247,249,0.94)',
    scrim: 'rgba(0,0,0,0.5)',
  },
};

export const type = {
  xs: 13,
  sm: 15,
  md: 17,
  lg: 22,
  xl: 28,
  xxl: 34,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  tag: 8,
  card: 12,
  pill: 999,
  sheetAndroid: 28,
  fab: 16,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, Consolas, monospace' }) as string,
} as const;

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export function severityColors(p: Palette, s: Severity): { fg: string; bg: string } {
  switch (s) {
    case 'critical':
      return { fg: p.critical, bg: p.criticalSoft };
    case 'high':
      return { fg: p.high, bg: p.highSoft };
    case 'medium':
      return { fg: p.medium, bg: p.mediumSoft };
    case 'low':
      return { fg: p.low, bg: p.lowSoft };
    default:
      return { fg: p.info, bg: p.infoSoft };
  }
}
