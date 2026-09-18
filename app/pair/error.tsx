import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, type IconName } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, ListRow, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';

const SUGGESTIONS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'link', title: 'Check the URL', body: 'It should start with https:// and use the port shown in Settings → Mobile on the instance.' },
  { icon: 'globe', title: 'Are you on the VPN?', body: 'Most instances are reachable only from the office network or over a VPN.' },
  { icon: 'lock', title: 'Compare the certificate', body: 'A self-signed certificate is fine when its SHA-256 fingerprint matches the one on the dashboard.' },
];

/** 51a Error pairing — reason from the caller, three things to try, retry or scan instead. */
export default function PairError() {
  const { p } = useTheme();
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const message = typeof reason === 'string' && reason.trim() ? reason : 'Could not reach the instance';
  const tryAgain = () => (router.canGoBack() ? router.back() : router.replace('/pair/manual'));
  return (
    <Screen padded={false}>
      <TopBar title="Pairing failed" back />
      <View style={{ paddingHorizontal: space.md, gap: space.md }}>
        <Card style={{ borderColor: p.critical, backgroundColor: p.criticalSoft }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="sevCritical" size={22} color={p.critical} strokeWidth={2} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text v="headline">Error pairing</Text>
              <Text v="callout" tone="text2" style={{ marginTop: 4 }}>{message}</Text>
            </View>
          </View>
        </Card>

        <Text v="label" tone="text3">Things to try</Text>
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          {SUGGESTIONS.map((s, i) => (
            <ListRow key={s.title} title={s.title} subtitle={s.body} last={i === SUGGESTIONS.length - 1} left={<Icon name={s.icon} size={20} color={p.accent} />} />
          ))}
        </Card>

        <View style={{ gap: 8, marginTop: space.sm }}>
          <Button title="Try again" icon="refresh" onPress={tryAgain} />
          <Button title="Scan QR instead" kind="secondary" icon="qr" onPress={() => router.replace('/pair/scan')} />
        </View>
        <Text v="caption" tone="text3">Nothing was stored. Pairing only completes after the instance answers.</Text>
      </View>
    </Screen>
  );
}
