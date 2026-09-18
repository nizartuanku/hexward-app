import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, NibbleMark, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, ListRow, Row, Screen, SectionHeader } from '@/components/Primitives';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { productBySlug, moduleName } from '@/data/sample';

/** 05 Pairing success — Nibble check hero, instance identity, modules detected, follow toggles. */
export default function PairSuccess() {
  const { p } = useTheme();
  const router = useRouter();
  const { current, followed, toggleFollow, set, welcomeSeen } = useApp();
  const { toast } = useToast();
  useEffect(() => { if (!welcomeSeen) set('welcomeSeen', true); }, [welcomeSeen, set]);

  const modules = current?.modules ?? [];
  const host = (current?.url ?? '').replace(/^https?:\/\//, '');
  const followedCount = modules.filter((m) => followed.includes(m)).length;

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: space.md }}>
        <View style={{ alignItems: 'center', paddingTop: space.xl + space.lg, paddingBottom: space.lg, gap: space.sm }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: p.lowSoft, alignItems: 'center', justifyContent: 'center' }}>
            <NibbleMark size={56} color={p.ok} />
            <View style={{ position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: p.ok, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: p.bg }}>
              <Icon name="check" size={18} color={p.bg} strokeWidth={2.4} />
            </View>
          </View>
          <Text v="title" center style={{ marginTop: space.sm }}>Paired with {current?.nickname ?? 'your instance'}</Text>
          <Text v="callout" tone="text2" center>
            {current?.tenant ?? ''} · <Text v="mono" tone="text2" style={{ fontSize: 13 }}>{host}</Text> · {modules.length} {modules.length === 1 ? 'product' : 'products'} found
          </Text>
        </View>

        <SectionHeader title="Products on this instance" action={`${followedCount} of ${modules.length} followed`} style={{ marginTop: 0 }} />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          {modules.map((slug, i) => {
            const on = followed.includes(slug);
            const prod = productBySlug(slug);
            return (
              <ListRow key={slug} title={moduleName(slug)} subtitle={prod ? `v${prod.version}` : undefined} last={i === modules.length - 1} chevron={false}
                left={<Icon name={productIcon[slug] ?? 'nibble'} size={22} color={p.text} />}
                right={<Button small kind={on ? 'secondary' : 'primary'} title={on ? 'Following' : 'Follow'} accessibilityLabel={`${on ? 'Unfollow' : 'Follow'} ${moduleName(slug)}`} onPress={() => { const now = toggleFollow(slug); toast(now ? `Following ${moduleName(slug)}` : `Unfollowed ${moduleName(slug)}`); }} />} />
            );
          })}
          {modules.length === 0 ? (
            <Row style={{ paddingVertical: 14 }}><Text v="callout" tone="text2">No products reported by this instance yet.</Text></Row>
          ) : null}
        </Card>
        <Text v="caption" tone="text3" style={{ marginTop: space.sm }}>Followed products send findings and alerts to this phone and appear in Console. Change this any time in Settings → Instances.</Text>

        <View style={{ gap: 4, marginTop: space.lg }}>
          <Button title="Go to Home" icon="arrowRight" onPress={() => router.replace('/(tabs)/home')} />
          <Button title="Pair another instance" kind="ghost" onPress={() => router.replace('/pair/scan')} />
        </View>
      </View>
    </Screen>
  );
}
