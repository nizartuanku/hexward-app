import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Text } from '@/components/Text';
import { LeavingSheet } from '@/components/Chrome';

interface ToastCtx {
  toast: (msg: string) => void;
  /** Open an external URL through the "Leaving Hexward" sheet, then the system browser. */
  openExternal: (url: string, label?: string) => void;
}
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { p, ios } = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string | null>(null);
  const [ext, setExt] = useState<{ url: string; label?: string } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((m: string) => { setMsg(m); if (t.current) clearTimeout(t.current); t.current = setTimeout(() => setMsg(null), 2400); }, []);
  const openExternal = useCallback((url: string, label?: string) => setExt({ url, label }), []);
  const value = useMemo(() => ({ toast, openExternal }), [toast, openExternal]);
  const doOpen = async () => {
    const url = ext?.url; setExt(null);
    if (!url) return;
    try { await WebBrowser.openBrowserAsync(url); } catch { toast('Could not open the browser'); }
  };
  return (
    <Ctx.Provider value={value}>
      {children}
      {msg ? (
        <View pointerEvents="none" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: space.md, right: space.md, bottom: insets.bottom + (ios ? 96 : 100) }}>
          <View style={{ backgroundColor: ios ? p.surface2 : p.text, borderRadius: ios ? radius.card : 4, paddingVertical: 12, paddingHorizontal: 16, borderWidth: ios ? 1 : 0, borderColor: p.border }}>
            <Text v="callout" style={{ color: ios ? p.text : p.bg }}>{msg}</Text>
          </View>
        </View>
      ) : null}
      <LeavingSheet open={!!ext} url={ext?.url ?? null} label={ext?.label} onClose={() => setExt(null)} onOpen={doOpen} />
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside ToastProvider');
  return c;
}
