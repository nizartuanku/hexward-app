import React from 'react';
import { Switch, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, Divider, ListRow, Row, Screen, SectionHeader } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp, type NotifPrefs } from '@/state/AppState';
import { useToast } from '@/state/Toast';

/** 16 Notification settings — security alerts and marketing are separate channels; marketing is off by default. */
export default function Notifications() {
  const { p } = useTheme();
  const { notif, current, set } = useApp();
  const { toast } = useToast();
  const update = (patch: Partial<NotifPrefs>) => set('notif', { ...notif, ...patch });

  return (
    <Screen padded={false}>
      <TopBar title="Notifications" back="Settings" />
      <View style={{ paddingHorizontal: space.md }}>
        <SectionHeader title="Security alerts" style={{ marginTop: space.sm }} />
        <Text v="caption" tone="text2" style={{ marginBottom: space.sm }}>From {current?.nickname ?? 'your paired instances'}. Delivered even during quiet hours when critical.</Text>
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <SwitchRow title="Critical findings" subtitle="Immediate, time-sensitive" value={notif.securityCritical} onChange={(v) => update({ securityCritical: v })} />
          <SwitchRow title="High findings" subtitle="Immediate" value={notif.securityHigh} onChange={(v) => update({ securityHigh: v })} />
          <SwitchRow title="Daily digest" subtitle="One summary at 08:00" value={notif.digest} onChange={(v) => update({ digest: v })} last />
        </Card>
        <Card padded={false} style={{ paddingHorizontal: space.md, marginTop: space.sm }}>
          <ListRow title="Quiet hours" subtitle="22:00 – 07:00 · No sound or banners" left={<Icon name="clock" color={p.text2} />} onPress={() => toast('Quiet hours are not available in this build')} />
          <ListRow title="Test notification" subtitle="Send a sample alert to this phone" left={<Icon name="bell" color={p.text2} />} onPress={() => toast('Test alert sent')} chevron={false} last />
        </Card>

        <Divider style={{ marginTop: space.lg }} />

        <SectionHeader title="Marketing" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <SwitchRow title="Launch & release news" subtitle="Product launches and release notes" value={notif.marketing} onChange={(v) => update({ marketing: v, launches: v })} />
          <Row gap={8} style={{ paddingVertical: 10, alignItems: 'flex-start' }}>
            <Icon name="star" size={16} color={p.text3} />
            <Text v="caption" tone="text2" style={{ flex: 1 }}>Followed products only. Follow a product from its page to hear about its launch.</Text>
          </Row>
        </Card>
        <Text v="caption" tone="text3" style={{ marginTop: space.sm }}>Separate from security alerts. Off by default. You can change this any time.</Text>
      </View>
    </Screen>
  );
}

function SwitchRow({ title, subtitle, value, onChange, last }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  const { p, ios } = useTheme();
  return (
    <ListRow title={title} subtitle={subtitle} last={last} chevron={false}
      right={
        <Switch
          accessibilityLabel={title}
          value={value}
          onValueChange={onChange}
          trackColor={{ true: p.accent, false: p.surface2 }}
          thumbColor={ios ? p.onAccent : undefined}
          ios_backgroundColor={p.surface2}
        />
      }
    />
  );
}
