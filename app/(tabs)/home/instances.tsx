import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, ListRow, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { findings, type Instance } from '@/data/sample';

function statusLabel(s: Instance['status']) { return s === 'healthy' ? 'Healthy' : s === 'attention' ? 'Needs attention' : 'Offline'; }

/** 09 Instance switcher — paired instances with status, current one checked. Sheet on the artboard; a pushed screen here. */
export default function Instances() {
  const { p } = useTheme();
  const router = useRouter();
  const { instances, current, switchInstance, findingStatus } = useApp();
  const { toast } = useToast();

  const openCritical = (id: string) => findings.filter((f) => f.instanceId === id && f.severity === 'critical' && !findingStatus[f.id]).length;
  const summary = (i: Instance) => {
    const n = openCritical(i.id);
    return `Last synced ${i.lastSynced} · ${n === 0 ? 'nothing open' : `${n} critical open`}`;
  };
  const statusColor = (s: Instance['status']) => (s === 'healthy' ? p.ok : s === 'attention' ? p.high : p.text3);
  const choose = (i: Instance) => {
    if (i.id !== current?.id) { switchInstance(i.id); toast(`Switched to ${i.nickname}`); }
    if (router.canGoBack()) router.back(); else router.replace('/(tabs)/home');
  };

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Instances" back actions={[{ icon: 'gear', label: 'Manage', onPress: () => router.push('/settings/instances') }]} />
      <View style={{ paddingHorizontal: space.md }}>
        {instances.length === 0 ? (
          <EmptyState icon="server" title="No instances yet" body="Pair your self-hosted Hexward instance to see its findings here." action="Add instance" onAction={() => router.push('/pair/scan')} />
        ) : (
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            {instances.map((i, idx) => {
              const on = i.id === current?.id;
              return (
                <ListRow key={i.id} title={i.nickname} subtitle={`${i.tenant}\n${summary(i)}`} last={idx === instances.length - 1} chevron={false} onPress={() => choose(i)}
                  left={
                    <View accessibilityLabel={statusLabel(i.status)} style={{ width: 28, alignItems: 'center' }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor(i.status) }} />
                      <Text v="caption" tone="text3" style={{ fontSize: 9, lineHeight: 12, marginTop: 4 }}>{i.status === 'healthy' ? 'OK' : i.status === 'attention' ? 'ATTN' : 'OFF'}</Text>
                    </View>
                  }
                  right={on ? <Icon name="check" size={20} color={p.accent} strokeWidth={2.2} /> : <View style={{ width: 20 }} />} />
              );
            })}
          </Card>
        )}
        <Button title="Add instance" kind="secondary" icon="plus" onPress={() => router.push('/pair/scan')} style={{ marginTop: space.md }} />
        <Button title="Manage instances" kind="ghost" onPress={() => router.push('/settings/instances')} />
        <Text v="caption" tone="text3" style={{ marginTop: space.sm }}>Each instance keeps its own pairing token in the secure keystore. Switching does not contact the others.</Text>
      </View>
    </Screen>
  );
}
