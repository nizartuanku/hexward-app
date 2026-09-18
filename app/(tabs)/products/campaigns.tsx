import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, Chip, EmptyState, ProductTag, Row, Screen, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { CampaignCTA } from '@/components/Products';
import { campaigns, productBySlug, type Campaign } from '@/data/sample';

type Kind = 'all' | Campaign['kind'];
const KINDS: { key: Kind; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Coming', label: 'Coming' },
  { key: 'Release notes', label: 'Release notes' },
  { key: 'Founding', label: 'Founding' },
  { key: 'Challenge', label: 'Challenge' },
  { key: 'Promo', label: 'Promo' },
];

const dateLabel = (c: Campaign) => {
  const product = c.product ? productBySlug(c.product) : undefined;
  if (c.kind === 'Coming') return product?.launch ? `Launches ${product.launch}` : c.date;
  if (c.kind === 'Challenge' || c.kind === 'Founding') return `${c.date} · Live now`;
  return c.date;
};

/** 42 Campaigns feed — launches, release notes, programmes and promo codes. Marketing lives here, never in Alerts. */
export default function Campaigns() {
  const { p } = useTheme();
  const router = useRouter();
  const [kind, setKind] = useState<Kind>('all');
  const list = kind === 'all' ? campaigns : campaigns.filter((c) => c.kind === kind);
  return (
    <Screen tabbed padded={false}>
      <TopBar back="Products" title="Campaigns" actions={[{ icon: 'products', label: 'Catalog', onPress: () => router.push('/(tabs)/products') }]} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8, paddingBottom: space.sm }}>
        {KINDS.map((k) => <Chip key={k.key} label={k.label} selected={kind === k.key} onPress={() => setKind(k.key)} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: space.md, gap: 10, marginTop: space.sm }}>
        {list.length === 0 ? (
          <EmptyState icon="star" title="Nothing here yet" body="No campaigns of this kind right now." action="Show all" onAction={() => setKind('all')} />
        ) : list.map((c) => {
          const product = c.product ? productBySlug(c.product) : undefined;
          return (
            <Card key={c.id} onPress={() => router.push({ pathname: '/(tabs)/products/campaign/[id]', params: { id: c.id } })} accessibilityLabel={`${c.kind}: ${c.title}`}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Tag label={c.kind} tone={c.kind === 'Coming' ? 'accent' : 'text2'} />
                <Text v="caption" tone="text3" num>{dateLabel(c)}</Text>
              </Row>
              <Text v="headline" style={{ marginTop: 8 }} numberOfLines={2}>{c.title}</Text>
              {product ? <View style={{ marginTop: 4 }}><ProductTag icon={productIcon[product.slug] ?? 'products'} name={product.name} /></View> : null}
              <Text v="callout" tone="text2" numberOfLines={2} style={{ marginTop: 6 }}>{c.body}</Text>
              <Row style={{ marginTop: 12, justifyContent: 'space-between' }}>
                <CampaignCTA campaign={c} />
                <Icon name="chevronRight" size={20} color={p.text3} />
              </Row>
            </Card>
          );
        })}
        <Text v="caption" tone="text3" center style={{ marginTop: space.md }}>Launch and release notifications are separate from security alerts.</Text>
      </View>
    </Screen>
  );
}
