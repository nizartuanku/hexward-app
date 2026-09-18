import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { NibbleMark } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, Row, Screen, SectionHeader, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { CheckRow, FeatureTable, FollowButton, ProductRow, bundleMembers } from '@/components/Products';
import { useToast } from '@/state/Toast';
import { STORE_SAFE_PRICING } from '@/config';
import { GITHUB, bundles } from '@/data/sample';

/**
 * 41a Bundle detail V1 (Store-safe): included tools, free editions on GitHub, "available on the web".
 * 41b V2 (full) behind `!STORE_SAFE_PRICING`: bundle price + "Get on Whop".
 */
export default function BundleDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { openExternal } = useToast();
  const bundle = bundles.find((b) => b.slug === String(slug));

  if (!bundle) {
    return (
      <Screen tabbed>
        <TopBar back="Products" title="Bundle" />
        <EmptyState icon="nibble" title="Bundle not found" body="This link points to a bundle that is not in the catalog." action="Browse products" onAction={() => router.replace('/(tabs)/products')} />
      </Screen>
    );
  }

  const members = bundleMembers(bundle.slug);
  const fullPricing = !STORE_SAFE_PRICING && !!bundle.priceV2;

  return (
    <Screen tabbed>
      <TopBar back="Products" title={bundle.name} />
      <Row gap={14} style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <NibbleMark size={34} color={p.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <Text v="caption" tone="text2" num>Bundle · {members.length} tools · {bundle.version}</Text>
            {__DEV__ ? <Tag label={fullPricing ? 'V2 · Full' : 'V1 · Store-safe'} /> : null}
          </Row>
          <Text v="title" style={{ marginTop: 2 }}>{bundle.name}</Text>
        </View>
      </Row>
      <Text tone="text2" style={{ marginTop: 10 }}>{bundle.tagline}</Text>
      <FollowButton slug={bundle.slug} name={bundle.name} style={{ marginTop: 12, alignSelf: 'flex-start' }} />

      <SectionHeader title={`Includes · ${members.length} tools`} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {members.map((m, i) => (
          <ProductRow key={m.slug} product={m} last={i === members.length - 1} onPress={() => router.push({ pathname: '/(tabs)/products/[slug]', params: { slug: m.slug } })} />
        ))}
      </Card>

      <Card style={{ marginTop: space.md, borderColor: p.accent, backgroundColor: p.accentSoft }}>
        <Row gap={10}><NibbleMark size={22} color={p.accent} /><Text v="headline">One core, one login, one report</Text></Row>
        <Text v="callout" tone="text2" style={{ marginTop: 6 }}>{bundle.what}</Text>
        <Row gap={8} style={{ marginTop: 10, flexWrap: 'wrap' }}>
          <Tag label="Self-hosted" />
          <Tag label="One license key" />
          <Tag label="Verified offline" />
        </Row>
      </Card>

      <SectionHeader title="Free vs Pro vs Team" />
      <Card>
        <FeatureTable features={bundle.features} priceV2={bundle.priceV2} />
      </Card>

      <SectionHeader title="Who it's for" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {bundle.who.map((w, i) => <CheckRow key={w} text={w} last={i === bundle.who.length - 1} />)}
      </Card>

      <View style={{ gap: 8, marginTop: space.lg }}>
        {fullPricing && bundle.priceV2 ? (
          // V2 only — compiled, never rendered while STORE_SAFE_PRICING is on.
          <>
            <Text v="callout" tone="text2" center num>{bundle.priceV2.pro} · {bundle.priceV2.team} · {bundle.priceV2.trial}</Text>
            <Button title="Get on Whop" icon="external" onPress={() => openExternal(bundle.web + '/pricing', 'Whop checkout')} />
          </>
        ) : null}
        <Button title="Free editions on GitHub" icon="github" kind={fullPricing ? 'secondary' : 'primary'} onPress={() => openExternal(GITHUB, 'GitHub')} />
        <Button title="Available on the web" icon="external" kind="secondary" onPress={() => openExternal(bundle.web, 'Hexward Labs website')} />
        <Text v="caption" tone="text3" center style={{ marginTop: 4 }}>One key, verified offline. Nothing from this app is sent along.</Text>
      </View>
    </Screen>
  );
}
