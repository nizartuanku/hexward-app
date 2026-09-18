import React from 'react';
import { Linking, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, NibbleMark } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, ListRow, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useToast } from '@/state/Toast';
import { APP_VERSION, LINKS } from '@/config';

const CONTACT = 'mailto:hello@hexwardlabs.com';

/** About — publisher, version and the links that leave the app. No account, no cloud, no trackers. */
export default function About() {
  const { p } = useTheme();
  const { toast, openExternal } = useToast();
  const contact = async () => {
    try { await Linking.openURL(CONTACT); } catch { toast('No mail app available'); }
  };

  return (
    <Screen padded={false}>
      <TopBar title="About" back="Settings" />
      <View style={{ paddingHorizontal: space.md, gap: space.md }}>
        <View style={{ alignItems: 'center', gap: 6, paddingVertical: space.lg }}>
          <NibbleMark size={64} color={p.accent} />
          <Text v="title" center style={{ marginTop: space.sm }}>Hexward</Text>
          <Text v="callout" tone="text2" center num>Version {APP_VERSION} (1)</Text>
          <Text v="callout" tone="text2" center>Hexward Labs</Text>
          <Text tone="text2" center style={{ marginTop: space.sm, maxWidth: 300 }}>Self-hosted security tools.</Text>
        </View>

        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Website" subtitle="hexwardlabs.com" left={<Icon name="globe" color={p.text2} />} right={<Icon name="external" size={18} color={p.text3} />} chevron={false} onPress={() => openExternal(LINKS.web, 'Website')} />
          <ListRow title="GitHub" subtitle="Source and releases" left={<Icon name="github" color={p.text2} />} right={<Icon name="external" size={18} color={p.text3} />} chevron={false} onPress={() => openExternal(LINKS.github, 'GitHub')} />
          <ListRow title="Privacy statement" left={<Icon name="shield" color={p.text2} />} right={<Icon name="external" size={18} color={p.text3} />} chevron={false} onPress={() => openExternal(LINKS.privacy, 'Privacy statement')} />
          <ListRow title="Open-source notices" left={<Icon name="book" color={p.text2} />} right={<Icon name="external" size={18} color={p.text3} />} chevron={false} onPress={() => openExternal(LINKS.notices, 'Open-source notices')} />
          <ListRow title="Contact" subtitle="hello@hexwardlabs.com" left={<Icon name="mail" color={p.text2} />} chevron={false} last onPress={() => { void contact(); }} />
        </Card>

        <Text v="caption" tone="text3" center style={{ marginTop: space.sm }}>No account. No cloud. No trackers.</Text>
      </View>
    </Screen>
  );
}
