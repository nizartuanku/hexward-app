import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { NibbleMark } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Screen } from '@/components/Primitives';
import { useApp } from '@/state/AppState';

/** 01 Welcome — shown once. Three doors: pair, products, tools (brief §9 funnel: prospect never blocked by pairing). */
export default function Welcome() {
  const { p } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { set } = useApp();
  const go = (href: Parameters<typeof router.replace>[0]) => { set('welcomeSeen', true); router.replace(href); };
  return (
    <Screen scroll={false} style={{ paddingTop: insets.top }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md }}>
        <NibbleMark size={72} color={p.accent} />
        <Text v="largeTitle" center style={{ fontSize: 34, lineHeight: 41 }}>Hexward</Text>
        <Text tone="text2" center style={{ maxWidth: 300 }}>Self-hosted security tools. Now in your pocket.</Text>
      </View>
      <View style={{ gap: 10, paddingBottom: space.md }}>
        <Button title="Pair an instance" icon="qr" onPress={() => go('/privacy')} />
        <Button title="Explore products" kind="secondary" onPress={() => go('/(tabs)/home')} />
        <Button title="Use tools without an instance" kind="secondary" onPress={() => go('/(tabs)/tools')} />
        <Text v="caption" tone="text3" center style={{ marginTop: 6 }}>No account. No cloud. Your data stays on your servers.</Text>
      </View>
    </Screen>
  );
}
