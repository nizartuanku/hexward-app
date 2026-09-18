import React, { createContext, useContext, useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { palettes, type Palette, type Scheme } from './tokens';

export interface Theme {
  scheme: Scheme;
  p: Palette;
  /** true on iOS: HIG chrome (large title, tab bar). false: Material 3 chrome. */
  ios: boolean;
  /** Body size: 17 on iOS, 16 on Android (KIT §2). */
  body: number;
  /** Minimum touch target. */
  touch: number;
}

const ThemeCtx = createContext<Theme | null>(null);

export function ThemeProvider({
  children,
  forceScheme,
  forceIos,
}: {
  children: React.ReactNode;
  forceScheme?: Scheme;
  forceIos?: boolean;
}) {
  const system = useColorScheme();
  const scheme: Scheme = forceScheme ?? (system === 'light' ? 'light' : 'dark');
  const ios = forceIos ?? Platform.OS === 'ios';
  const value = useMemo<Theme>(
    () => ({ scheme, p: palettes[scheme], ios, body: ios ? 17 : 16, touch: ios ? 44 : 48 }),
    [scheme, ios],
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeCtx);
  if (!t) throw new Error('useTheme must be used inside ThemeProvider');
  return t;
}
