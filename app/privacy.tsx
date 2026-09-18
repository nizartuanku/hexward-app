import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Row, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';

type Delivery = 'poll' | 'relay';

/** 02 Privacy & notifications — two separate opt-ins (brief §12: security alerts never mixed with marketing). */
export default function Privacy() {
  const { p, ios } = useTheme();
  const router = useRouter();
  const { notif, set } = useApp();
  const [security, setSecurity] = useState(notif.securityCritical || notif.securityHigh);
  const [delivery, setDelivery] = useState<Delivery>('poll');
  const [launches, setLaunches] = useState(notif.marketing || notif.launches);

  const save = () => set('notif', { ...notif, securityCritical: security, securityHigh: security, marketing: launches, launches });
  const onContinue = () => { save(); router.push('/pair/scan'); };
  const onNotNow = () => { set('notif', { ...notif, securityCritical: false, securityHigh: false, marketing: false, launches: false }); router.replace('/(tabs)/home'); };

  return (
    <Screen padded={false}>
      <TopBar title="Notifications" back="Welcome" />
      <View style={{ paddingHorizontal: space.md, gap: 10 }}>
        <Text v="caption" tone="text3" style={{ alignSelf: 'flex-end' }}>Step 2 of 2</Text>
        <Text v="callout" tone="text2">Hexward talks only to your own instances and Hexward's public content endpoints. Choose how security alerts reach you.</Text>

        <Card>
          <Row gap={12}>
            <Icon name="shield" size={20} color={p.accent} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text v="headline">No account. No cloud. No trackers.</Text>
              <Text v="callout" tone="text2" style={{ marginTop: 2 }}>Nothing you do in this app is sent to Hexward. Your findings stay on your servers and on this phone.</Text>
            </View>
          </Row>
        </Card>

        <Text v="label" tone="text3" style={{ marginTop: 6 }}>Security alerts</Text>
        <Card>
          <Row gap={12}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text v="headline">Critical and high findings</Text>
              <Text v="callout" tone="text2" style={{ marginTop: 2 }}>Local notifications for critical and high findings on your paired instances.</Text>
            </View>
            <Switch accessibilityRole="switch" accessibilityLabel="Security alerts" value={security} onValueChange={setSecurity} trackColor={{ true: p.accent, false: p.surface2 }} thumbColor={ios ? undefined : security ? p.onAccent : p.text3} />
          </Row>
        </Card>
        {security ? (
          <>
            <RadioCard selected={delivery === 'poll'} onPress={() => setDelivery('poll')} title="Poll" hint="Private, delayed" body="Checks your instances in the background, local notifications only. Nothing leaves your network." />
            <RadioCard selected={delivery === 'relay'} onPress={() => setDelivery('relay')} title="Relay" hint="Instant, requires relay" body="Push through a Hexward Relay you host or Hexward hosts. Only alert metadata is relayed." />
          </>
        ) : null}

        <Text v="label" tone="text3" style={{ marginTop: 6 }}>Product launches & updates</Text>
        <Card>
          <Row gap={12}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text v="headline">Launches and release notes</Text>
              <Text v="callout" tone="text2" style={{ marginTop: 2 }}>A separate channel. Never mixed with security alerts.</Text>
            </View>
            <Switch accessibilityRole="switch" accessibilityLabel="Launches and release notes" value={launches} onValueChange={setLaunches} trackColor={{ true: p.accent, false: p.surface2 }} thumbColor={ios ? undefined : launches ? p.onAccent : p.text3} />
          </Row>
        </Card>

        <View style={{ borderRadius: radius.card, backgroundColor: p.accentSoft, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="bell" size={20} color={p.accent} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text v="callout" semibold>{ios ? 'iOS' : 'Android'} will ask for permission next</Text>
            <Text v="caption" tone="text2">One system prompt. You can change it later in Settings.</Text>
          </View>
        </View>

        <View style={{ gap: 4, marginTop: space.md }}>
          <Button title="Continue" onPress={onContinue} />
          <Button title="Not now" kind="ghost" onPress={onNotNow} />
        </View>
      </View>
    </Screen>
  );
}

function RadioCard({ selected, onPress, title, hint, body }: { selected: boolean; onPress: () => void; title: string; hint: string; body: string }) {
  const { p } = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityLabel={`${title} — ${hint}`} accessibilityState={{ selected, checked: selected }} onPress={onPress}
      style={({ pressed }) => ({ borderRadius: radius.card, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: p.surface, borderWidth: selected ? 1.5 : 1, borderColor: selected ? p.accent : p.border, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: selected ? p.accent : p.text3, alignItems: 'center', justifyContent: 'center' }}>
        {selected ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: p.accent }} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Row gap={8} style={{ alignItems: 'baseline' }}>
          <Text v="headline">{title}</Text>
          <Text v="caption" tone="text2">{hint}</Text>
        </Row>
        <Text v="callout" tone="text2">{body}</Text>
      </View>
    </Pressable>
  );
}
