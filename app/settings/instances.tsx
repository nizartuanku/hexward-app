import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, type IconName } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, ListRow, Row, Screen, Tag } from '@/components/Primitives';
import { Sheet, TopBar } from '@/components/Chrome';
import { useApp, type PairedInstance } from '@/state/AppState';
import { useToast } from '@/state/Toast';

type Status = PairedInstance['status'];
const STATUS: Record<Status, { icon: IconName; label: string }> = {
  healthy: { icon: 'check', label: 'Healthy' },
  attention: { icon: 'sevHigh', label: 'Needs attention' },
  offline: { icon: 'wifiOff', label: 'Offline' },
};

function pairedOn(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** 46 Instances manager — every paired instance, its status, and a per-instance action sheet. Tokens never leave the keychain. */
export default function Instances() {
  const { p } = useTheme();
  const router = useRouter();
  const { instances, current, switchInstance, unpair } = useApp();
  const { toast, openExternal } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [busy, setBusy] = useState(false);

  const selected = instances.find((i) => i.id === selectedId) ?? null;
  const close = () => { setSelectedId(null); setConfirmRemove(false); };
  const statusColor = (s: Status) => (s === 'healthy' ? p.ok : s === 'attention' ? p.high : p.critical);

  const onSetCurrent = () => { if (!selected) return; switchInstance(selected.id); close(); toast(`Now showing ${selected.nickname}`); };
  const onRepair = () => { close(); router.push('/pair/scan'); };
  const onOpenDashboard = () => { if (!selected) return; const { url, nickname } = selected; close(); openExternal(url, nickname); };
  const onRemove = async () => {
    if (!selected) return;
    setBusy(true);
    try { await unpair(selected.id); } finally { setBusy(false); }
    close();
    toast('Removed');
  };

  return (
    <Screen padded={false}>
      <TopBar title="Instances" back="Settings" />
      <View style={{ paddingHorizontal: space.md, gap: space.md }}>
        {instances.length === 0 ? (
          <EmptyState icon="server" title="No instances paired" body="Scan the code from your dashboard. Nothing leaves your servers." action="Scan QR" onAction={() => router.push('/pair/scan')} />
        ) : (
          <>
            <Text v="callout" tone="text2">Tap an instance to switch, re-pair or remove it. Removing asks for confirmation.</Text>
            {instances.map((inst) => {
              const st = STATUS[inst.status];
              const c = statusColor(inst.status);
              const isCurrent = current?.id === inst.id;
              return (
                <Card key={inst.id} onPress={() => setSelectedId(inst.id)} accessibilityLabel={`${inst.nickname}, ${st.label}${isCurrent ? ', current' : ''}. Options`}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row gap={8} style={{ flex: 1, minWidth: 0 }}>
                      <Icon name="server" size={20} color={p.text2} />
                      <Text v="headline" numberOfLines={1} style={{ flexShrink: 1 }}>{inst.nickname}</Text>
                      {isCurrent ? <Tag label="Current" tone="accent" /> : null}
                    </Row>
                    <Icon name="chevronRight" size={20} color={p.text3} />
                  </Row>
                  <Row gap={6} style={{ marginTop: 6 }}><Icon name={st.icon} size={16} color={c} strokeWidth={2} /><Text v="caption" semibold style={{ color: c }}>{st.label}</Text><Text v="caption" tone="text3">· Last synced {inst.lastSynced}</Text></Row>
                  <Text v="callout" tone="text2" style={{ marginTop: 6 }}>{inst.tenant}</Text>
                  <Text v="mono" tone="text2" numberOfLines={1} style={{ marginTop: 4 }}>{inst.url}</Text>
                  <Text v="caption" tone="text3" style={{ marginTop: 6 }}>{inst.version} · Paired {pairedOn(inst.pairedAt)}</Text>
                </Card>
              );
            })}
            <Button title="Add instance" icon="plus" kind="secondary" onPress={() => router.push('/pair/scan')} />
          </>
        )}
        <Row gap={8} style={{ alignItems: 'flex-start' }}>
          <Icon name="lock" size={16} color={p.text3} />
          <Text v="caption" tone="text3" style={{ flex: 1 }}>Pairing tokens are stored in the device keychain. The first instance is the default on Home.</Text>
        </Row>
      </View>

      <Sheet open={!!selected} onClose={close} title={selected?.nickname}>
        {selected ? (
          confirmRemove ? (
            <>
              <Text v="callout" tone="text2">Remove {selected.nickname} from this phone? Its pairing token is deleted from the keychain. The instance itself is not changed.</Text>
              <View style={{ marginTop: space.md, gap: 10 }}>
                <Button title="Remove" kind="destructive" icon="trash" loading={busy} onPress={() => { void onRemove(); }} />
                <Button title="Keep" kind="secondary" onPress={() => setConfirmRemove(false)} />
              </View>
            </>
          ) : (
            <>
              <Text v="callout" tone="text2" style={{ marginBottom: 4 }}>{selected.tenant} · {selected.version}</Text>
              <ListRow title="Set as current" subtitle={current?.id === selected.id ? 'Already shown on Home' : 'Show this instance on Home and Console'} left={<Icon name="home" color={p.text2} />} chevron={false} onPress={current?.id === selected.id ? undefined : onSetCurrent} />
              <ListRow title="Re-pair" subtitle="Scan a fresh code from the dashboard" left={<Icon name="qr" color={p.text2} />} chevron={false} onPress={onRepair} />
              <ListRow title="Open dashboard" subtitle={selected.url} left={<Icon name="external" color={p.text2} />} chevron={false} onPress={onOpenDashboard} />
              <ListRow title="Remove" subtitle="Forget this instance on this phone" titleTone="critical" left={<Icon name="trash" color={p.critical} />} chevron={false} last onPress={() => setConfirmRemove(true)} />
            </>
          )
        ) : null}
      </Sheet>
    </Screen>
  );
}
