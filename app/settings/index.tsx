import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, ListRow, Screen, SectionHeader, Segmented } from '@/components/Primitives';
import { Sheet, TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { moduleName } from '@/data/sample';
import { APP_VERSION, LINKS } from '@/config';

type Appearance = 'system' | 'dark' | 'light';
type AutoLock = 'never' | '1m' | '5m';
type VideoQuality = 'auto' | '720p' | '1080p';
type OpenSheet = 'autoLock' | 'video' | 'reset' | null;

const AUTO_LOCK: { key: AutoLock; label: string }[] = [
  { key: 'never', label: 'Never' },
  { key: '1m', label: '1 min' },
  { key: '5m', label: '5 min' },
];
const VIDEO: { key: VideoQuality; label: string }[] = [
  { key: 'auto', label: 'Auto' },
  { key: '720p', label: '720p' },
  { key: '1080p', label: '1080p' },
];
const labelOf = <T extends string>(opts: { key: T; label: string }[], k: T) => opts.find((o) => o.key === k)?.label ?? k;

/** 45 Settings — grouped rows. Appearance follows the system in this build; everything else persists on the device. */
export default function Settings() {
  const { p } = useTheme();
  const router = useRouter();
  const { instances, notif, license, autoLock, videoQuality, set, reset } = useApp();
  const { toast, openExternal } = useToast();
  const [appearance, setAppearance] = useState<Appearance>('system');
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [resetting, setResetting] = useState(false);

  const securityOn = notif.securityCritical || notif.securityHigh || notif.digest;
  const notifSubtitle = `${securityOn ? 'Security on' : 'Security off'} · ${notif.marketing ? 'Marketing on' : 'Marketing off'}`;
  const licenseSubtitle =
    license.status === 'valid' ? `${license.module ? moduleName(license.module) : 'Licensed'}${license.plan ? ` ${license.plan}` : ''}`
      : license.status === 'expired' ? 'Expired'
        : license.status === 'invalid' ? 'Invalid key'
          : 'Free edition';

  const onAppearance = (k: Appearance) => { setAppearance(k); toast('Follows the system in this build'); };
  const onReset = async () => {
    setResetting(true);
    try { await reset(); } finally { setResetting(false); }
    setSheet(null);
    toast('App data cleared');
    router.replace('/welcome');
  };

  return (
    <Screen padded={false}>
      <TopBar title="Settings" back="Home" />
      <View style={{ paddingHorizontal: space.md }}>
        <SectionHeader title="Instance" style={{ marginTop: space.sm }} />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Instances" subtitle={`${instances.length} paired`} left={<Icon name="server" color={p.text2} />} onPress={() => router.push('/settings/instances')} />
          <ListRow title="Notifications" subtitle={notifSubtitle} left={<Icon name="bell" color={p.text2} />} onPress={() => router.push('/settings/notifications')} />
          <ListRow title="License" subtitle={licenseSubtitle} left={<Icon name="key" color={p.text2} />} onPress={() => router.push('/settings/license')} last />
        </Card>

        <SectionHeader title="Appearance" />
        <Card>
          <Text v="callout" tone="text2" style={{ marginBottom: 10 }}>Theme</Text>
          <Segmented<Appearance> options={[{ key: 'system', label: 'System' }, { key: 'dark', label: 'Dark' }, { key: 'light', label: 'Light' }]} value={appearance} onChange={onAppearance} />
        </Card>

        <SectionHeader title="Security" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Auto-lock" subtitle={autoLock === 'never' ? 'Never' : `After ${labelOf(AUTO_LOCK, autoLock)}`} left={<Icon name="lock" color={p.text2} />} onPress={() => setSheet('autoLock')} last />
        </Card>

        <SectionHeader title="Content" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Video quality" subtitle={labelOf(VIDEO, videoQuality)} left={<Icon name="video" color={p.text2} />} onPress={() => setSheet('video')} last />
        </Card>

        <SectionHeader title="About" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Privacy statement" left={<Icon name="shield" color={p.text2} />} onPress={() => openExternal(LINKS.privacy, 'Privacy statement')} />
          <ListRow title="Open-source notices" left={<Icon name="book" color={p.text2} />} onPress={() => openExternal(LINKS.notices, 'Open-source notices')} />
          <ListRow title="About" subtitle="Hexward Labs" left={<Icon name="nibble" color={p.text2} />} onPress={() => router.push('/settings/about')} last />
        </Card>

        <SectionHeader title="Data" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Reset app data" subtitle="Removes paired instances, keys and preferences from this device" titleTone="critical" left={<Icon name="trash" color={p.critical} />} onPress={() => setSheet('reset')} last />
        </Card>

        <Text v="caption" tone="text3" center style={{ marginTop: space.lg }}>Hexward {APP_VERSION} (1)</Text>
        <Text v="caption" tone="text3" center>No account. No cloud. No trackers.</Text>
      </View>

      <Sheet open={sheet === 'autoLock'} onClose={() => setSheet(null)} title="Auto-lock">
        <Text v="callout" tone="text2" style={{ marginBottom: 8 }}>Require Face ID or passcode after the app has been in the background for this long.</Text>
        {AUTO_LOCK.map((o, i) => (
          <ListRow key={o.key} title={o.label} chevron={false} last={i === AUTO_LOCK.length - 1}
            right={autoLock === o.key ? <Icon name="check" color={p.accent} strokeWidth={2} /> : null}
            onPress={() => { set('autoLock', o.key); setSheet(null); }} />
        ))}
      </Sheet>

      <Sheet open={sheet === 'video'} onClose={() => setSheet(null)} title="Video quality">
        <Text v="callout" tone="text2" style={{ marginBottom: 8 }}>Auto picks the best quality for your connection.</Text>
        {VIDEO.map((o, i) => (
          <ListRow key={o.key} title={o.label} chevron={false} last={i === VIDEO.length - 1}
            right={videoQuality === o.key ? <Icon name="check" color={p.accent} strokeWidth={2} /> : null}
            onPress={() => { set('videoQuality', o.key); setSheet(null); }} />
        ))}
      </Sheet>

      <Sheet open={sheet === 'reset'} onClose={() => setSheet(null)} title="Reset app data?"
        actions={<><Button title="Reset app data" kind="destructive" icon="trash" loading={resetting} onPress={() => { void onReset(); }} /><Button title="Cancel" kind="secondary" onPress={() => setSheet(null)} /></>}>
        <Text v="callout" tone="text2">This removes every paired instance, its pairing token from the keychain, your license key and all preferences from this device. Your servers are not affected.</Text>
      </Sheet>
    </Screen>
  );
}
