import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, Row } from '@/components/Primitives';

export const QUICK_TOOLS = [
  { key: 'cert', label: 'Cert Check', icon: 'lock' as const, href: '/(tabs)/tools/cert' as const },
  { key: 'mail', label: 'Mail Auth', icon: 'mail' as const, href: '/(tabs)/tools/mail' as const },
  { key: 'exposure', label: 'Exposure', icon: 'globe' as const, href: '/(tabs)/tools/exposure' as const },
  { key: 'rulelint', label: 'Rule Lint', icon: 'sliders' as const, href: '/(tabs)/tools/rulelint' as const },
];

export function QuickTools() {
  const { p } = useTheme();
  const router = useRouter();
  return (
    <Row gap={8} style={{ alignItems: 'stretch' }}>
      {QUICK_TOOLS.map((t) => (
        <Card key={t.key} onPress={() => router.push(t.href)} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 6 }} accessibilityLabel={t.label}>
          <Icon name={t.icon} color={p.accent} />
          <Text v="caption" semibold center numberOfLines={1}>{t.label}</Text>
        </Card>
      ))}
    </Row>
  );
}

/** Abstract dark gradient block with a duration badge — never people (KIT §6). */
export function VideoThumb({ duration, small, wide }: { duration: string; small?: boolean; wide?: boolean }) {
  const { p } = useTheme();
  const w = small ? 96 : undefined; const h = small ? 60 : wide ? 190 : 96;
  return (
    <View style={{ width: w, height: h, borderRadius: 10, backgroundColor: '#1C2430', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: '55%', backgroundColor: '#243044', transform: [{ skewY: '-8deg' }] }} />
      <View style={{ width: small ? 26 : 36, height: small ? 26 : 36, borderRadius: 999, backgroundColor: 'rgba(11,15,20,0.7)', alignItems: 'center', justifyContent: 'center' }}><Icon name="play" size={small ? 14 : 18} color="#E8ECF1" /></View>
      <View style={{ position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(11,15,20,0.8)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}><Text v="caption" num style={{ color: '#E8ECF1', fontSize: 11, lineHeight: 14 }} semibold>{duration}</Text></View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: p.border, borderRadius: 10 }} />
    </View>
  );
}


