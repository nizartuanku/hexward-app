import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, Row, Screen, SectionHeader } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { ProductRow, useProductNav } from '@/components/Products';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { campaigns, productBySlug, type Product } from '@/data/sample';

/** 44 Followed products — launch and release notifications, separate from security alerts. */
export default function Followed() {
  const { p } = useTheme();
  const router = useRouter();
  const { followed, toggleFollow, notif, reminders } = useApp();
  const { toast } = useToast();
  const open = useProductNav();
  const list = followed.map((s) => productBySlug(s)).filter((x): x is Product => !!x);
  const launchOn = notif.launches;

  const hint = (pr: Product) => {
    if (pr.launch) {
      const reminded = campaigns.some((c) => c.kind === 'Coming' && c.product === pr.slug && reminders.includes(c.id));
      return `Launch ${pr.launch} · ${reminded ? 'reminder set' : launchOn ? 'launch notifications on' : 'launch notifications off'}`;
    }
    if (pr.category === 'bundle' && (pr.slug === 'suite' || pr.slug === 'essentials')) return `Bundle · follows its tools · launch notifications ${launchOn ? 'on' : 'off'}`;
    return `v${pr.version} · no launch scheduled · launch notifications ${launchOn ? 'on' : 'off'}`;
  };

  return (
    <Screen tabbed>
      <TopBar back="Products" title="Following" />
      <Text v="callout" tone="text2">Launch and release notifications for followed products. Separate from security alerts.</Text>

      {list.length === 0 ? (
        <EmptyState icon="bookmark" title="You're not following anything yet" body="Follow a product to hear about its launch and release notes." action="Browse products" onAction={() => router.push('/(tabs)/products')} />
      ) : (
        <>
          <SectionHeader title={`${list.length} ${list.length === 1 ? 'product' : 'products'}`} />
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            {list.map((pr, i) => (
              <ProductRow key={pr.slug} product={pr} subtitle={hint(pr)} last={i === list.length - 1} chevron={false} onPress={() => open(pr.slug)}
                right={<Button small kind="secondary" title="Unfollow" accessibilityLabel={`Unfollow ${pr.name}`} onPress={() => { toggleFollow(pr.slug); toast(`Unfollowed ${pr.name}`); }} />} />
            ))}
          </Card>
        </>
      )}

      <Card style={{ marginTop: space.lg }}>
        <Row gap={10} style={{ alignItems: 'flex-start' }}>
          <Icon name="bell" color={p.text2} />
          <View style={{ flex: 1 }}>
            <Text v="callout" tone="text2">Launch notifications are separate from security alerts — manage them in Settings › Notifications.</Text>
            <Pressable accessibilityRole="link" accessibilityLabel="Open notification settings" onPress={() => router.push('/settings/notifications')} hitSlop={8} style={{ marginTop: 6, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}>
              <Row gap={6}><Text v="callout" tone="accent" semibold>Notification settings</Text><Icon name="chevronRight" size={16} color={p.accent} /></Row>
            </Pressable>
          </View>
        </Row>
      </Card>
      <Text v="caption" tone="text3" center style={{ marginTop: space.md }}>Unfollow from any product card or page with one tap.</Text>
    </Screen>
  );
}
