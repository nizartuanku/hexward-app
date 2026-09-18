import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { space } from '@/theme/tokens';
import { productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, ProductTag, Row, Screen, SectionHeader, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { CampaignCTA, CheckRow, FollowButton, ProductRow, useProductNav } from '@/components/Products';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { campaigns, productBySlug } from '@/data/sample';

const FOUNDING_INCLUDES = ['Team plan for six months', 'Managed onboarding', 'Direct line to the maintainer', 'One honest write-up in return'];

/** 43 Campaign detail — full body, kind-specific CTA, links for the attached product. Store-safe: no prices. */
export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { reminders } = useApp();
  const { openExternal } = useToast();
  const openProduct = useProductNav();
  const campaign = campaigns.find((c) => c.id === String(id));

  if (!campaign) {
    return (
      <Screen tabbed>
        <TopBar back="Campaigns" title="Campaign" />
        <EmptyState icon="star" title="Campaign not found" body="This campaign has ended or the link is out of date." action="All campaigns" onAction={() => router.replace('/(tabs)/products/campaigns')} />
      </Screen>
    );
  }

  const product = campaign.product ? productBySlug(campaign.product) : undefined;
  const reminderOn = reminders.includes(campaign.id);
  const when = product?.launch ?? campaign.date;

  return (
    <Screen tabbed>
      <TopBar back="Campaigns" title={campaign.kind} />
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        <Tag label={campaign.kind} tone={campaign.kind === 'Coming' ? 'accent' : 'text2'} />
        {product ? <ProductTag icon={productIcon[product.slug] ?? 'products'} name={product.name} /> : null}
      </Row>
      <Text v="title" style={{ marginTop: 10 }}>{campaign.title}</Text>
      <Text v="caption" tone="text3" num style={{ marginTop: 4 }}>
        {campaign.kind === 'Coming' && product?.launch ? `Launches ${product.launch} · ` : ''}Posted {campaign.date}
      </Text>
      <Text style={{ marginTop: space.md }}>{campaign.body}</Text>

      {campaign.kind === 'Founding' ? (
        <>
          <SectionHeader title="What's included" />
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            {FOUNDING_INCLUDES.map((t, i) => <CheckRow key={t} text={t} last={i === FOUNDING_INCLUDES.length - 1} />)}
          </Card>
        </>
      ) : null}

      {campaign.kind === 'Coming' && product ? (
        <>
          <SectionHeader title="At launch" />
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            <CheckRow text="Free edition on GitHub from launch day" />
            <CheckRow text={product.what} />
            <CheckRow text="Pro and Team editions available on the web" last />
          </Card>
        </>
      ) : null}

      <View style={{ marginTop: space.lg, gap: 8 }}>
        <CampaignCTA campaign={campaign} full />
        {campaign.kind === 'Coming' ? (
          <Text v="caption" tone="text3" center>{reminderOn ? `Local notification on ${when}. Nothing leaves the phone.` : 'A local notification on launch day. Nothing leaves the phone.'}</Text>
        ) : null}
        {campaign.kind === 'Promo' ? (
          <Text v="caption" tone="text3" center>Applies on the web. Codes cannot be redeemed in this app.</Text>
        ) : null}
      </View>

      {product ? (
        <>
          <SectionHeader title="Product" />
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            <ProductRow product={product} last onPress={() => openProduct(product.slug)} />
          </Card>
          <View style={{ marginTop: space.md, gap: 8 }}>
            <Row gap={8}>
              <Button title="Free on GitHub" icon="github" kind="secondary" onPress={() => openExternal(product.github, 'GitHub')} style={{ flex: 1 }} />
              <FollowButton slug={product.slug} name={product.name} small={false} />
            </Row>
            <Button title="Available on the web" icon="external" kind="secondary" onPress={() => openExternal(product.web, 'Hexward Labs website')} />
          </View>
        </>
      ) : null}

      <Text v="caption" tone="text3" center style={{ marginTop: space.lg }}>Launch and release notifications are separate from security alerts.</Text>
    </Screen>
  );
}
