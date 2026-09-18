import React from 'react';
import { Modal, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Icon, type IconName } from '@/icons/Icon';
import { Text } from './Text';
import { IconButton, Button } from './Primitives';

/**
 * Platform header. iOS: large title (34/600) in the gutter with actions on the same row.
 * Android: Material top app bar 64px, title 22/400. Pass `back` for a pushed screen (iOS then uses a 17pt inline title).
 */
export function TopBar({ title, back, actions, subtitle, style, inline }: {
  title: string; back?: boolean | string; actions?: { icon: IconName; label: string; onPress?: () => void; badge?: number }[]; subtitle?: string; style?: StyleProp<ViewStyle>; inline?: boolean;
}) {
  const { p, ios } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const backLabel = typeof back === 'string' ? back : 'Back';
  if (ios) {
    const isInline = !!back || inline;
    return (
      <View style={[{ paddingTop: insets.top, backgroundColor: p.bg }, style]}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm }}>
          {back ? (
            <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={goBack} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 8 }}>
              <Icon name="chevronLeft" color={p.accent} strokeWidth={2} />
              <Text tone="accent" numberOfLines={1}>{backLabel}</Text>
            </Pressable>
          ) : <View style={{ width: space.sm }} />}
          {isInline ? <Text v="headline" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{title}</Text> : <View style={{ flex: 1 }} />}
          <View style={{ flexDirection: 'row' }}>
            {(actions ?? []).map((a) => <IconButton key={a.label} name={a.icon} label={a.label} onPress={a.onPress} badge={a.badge} />)}
          </View>
          {isInline && !actions?.length ? <View style={{ width: 60 }} /> : null}
        </View>
        {!isInline ? (
          <View style={{ paddingHorizontal: space.md, paddingBottom: 8 }}>
            <Text v="largeTitle">{title}</Text>
            {subtitle ? <Text v="callout" tone="text2">{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>
    );
  }
  return (
    <View style={[{ paddingTop: insets.top, backgroundColor: p.bg }, style]}>
      <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: back ? 4 : space.md, gap: 4 }}>
        {back ? <IconButton name="chevronLeft" label={backLabel} onPress={goBack} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text v="largeTitle" numberOfLines={1}>{title}</Text>
          {subtitle ? <Text v="caption" tone="text2" numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {(actions ?? []).map((a) => <IconButton key={a.label} name={a.icon} label={a.label} onPress={a.onPress} badge={a.badge} />)}
      </View>
    </View>
  );
}

/** Bottom sheet over a dimmed screen. iOS: 12px top radius + grabber; Android: 28px + drag handle. */
export function Sheet({ open, onClose, title, children, actions }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  const { p, ios } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1, backgroundColor: p.scrim }} />
      <View style={{ backgroundColor: p.surface, borderTopLeftRadius: ios ? radius.card : radius.sheetAndroid, borderTopRightRadius: ios ? radius.card : radius.sheetAndroid, paddingHorizontal: space.md, paddingBottom: insets.bottom + space.md, paddingTop: 8 }}>
        <View style={{ width: ios ? 36 : 32, height: ios ? 5 : 4, borderRadius: 999, backgroundColor: p.text3, alignSelf: 'center', marginBottom: 12 }} />
        {title ? <Text v="title" style={{ marginBottom: 8 }}>{title}</Text> : null}
        {children}
        {actions ? <View style={{ marginTop: space.md, gap: 10 }}>{actions}</View> : null}
      </View>
    </Modal>
  );
}

/** "Leaving Hexward" confirm before any external link (funnel rule §9: system browser, nothing sent along). */
export function LeavingSheet({ open, url, label, onClose, onOpen }: { open: boolean; url: string | null; label?: string; onClose: () => void; onOpen: () => void }) {
  const host = url ? url.replace(/^https?:\/\//, '').split('/')[0] : '';
  return (
    <Sheet open={open} onClose={onClose} title="Leaving Hexward" actions={<><Button title="Open in browser" icon="external" onPress={onOpen} /><Button title="Cancel" kind="secondary" onPress={onClose} /></>}>
      <Text v="callout" tone="text2">Opens {host || 'a link'}{label ? ` — ${label}` : ''} in your system browser. Nothing from this app is sent along.</Text>
      {url ? <Text v="mono" tone="text3" style={{ marginTop: 8 }} numberOfLines={2}>{url}</Text> : null}
    </Sheet>
  );
}
