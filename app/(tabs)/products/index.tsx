import React, { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, Chip, Row, Screen, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { FollowButton, useProductNav } from '@/components/Products';
import { allProducts, type Product } from '@/data/sample';

type Cat = 'all' | Product['category'];
const CATS: { key: Cat; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'firewall', label: 'Firewall' },
  { key: 'network', label: 'Network' },
  { key: 'exposure', label: 'Exposure' },
  { key: 'identity', label: 'Identity' },
  { key: 'bundle', label: 'Bundles' },
];

/** 38 Catalog — every product and bundle, free on GitHub. Store-safe: no prices, no buy buttons. */
export default function Catalog() {
  const { p } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const open = useProductNav();
  const [cat, setCat] = useState<Cat>('all');
  const list = cat === 'all' ? allProducts : allProducts.filter((x) => x.category === cat);
  const gap = 10;
  const cardW = Math.floor((width - space.md * 2 - gap) / 2);
  return (
    <Screen tabbed padded={false}>
      <TopBar title="Products" actions={[
        { icon: 'star', label: 'Campaigns', onPress: () => router.push('/(tabs)/products/campaigns') },
        { icon: 'bookmark', label: 'Following', onPress: () => router.push('/(tabs)/products/followed') },
      ]} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8, paddingBottom: space.sm }}>
        {CATS.map((c) => <Chip key={c.key} label={c.label} selected={cat === c.key} onPress={() => setCat(c.key)} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: space.md, flexDirection: 'row', flexWrap: 'wrap', gap, marginTop: space.sm }}>
        {list.map((pr) => (
          <Card key={pr.slug} onPress={() => open(pr.slug)} accessibilityLabel={`${pr.name}, ${pr.tagline}`} style={{ width: cardW, minHeight: 176 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={productIcon[pr.slug] ?? 'products'} size={22} color={p.text} />
              </View>
              <Icon name="chevronRight" size={18} color={p.text3} />
            </Row>
            <Text v="headline" numberOfLines={1} style={{ marginTop: 10 }}>{pr.name}</Text>
            <Text v="caption" tone="text2" numberOfLines={2} style={{ minHeight: 34 }}>{pr.tagline}</Text>
            <View style={{ marginTop: 8 }}>
              {pr.launch ? <Tag label={`Launches ${pr.launch.replace('Tue ', '')}`} tone="accent" /> : <Tag label="Free · Pro · Team" />}
            </View>
            <FollowButton slug={pr.slug} name={pr.name} style={{ marginTop: 10, alignSelf: 'stretch' }} />
          </Card>
        ))}
      </View>
      <View style={{ paddingHorizontal: space.md, marginTop: space.lg }}>
        <Text v="caption" tone="text3" center>All products are free on GitHub. Pro and Team editions are available on the web.</Text>
      </View>
    </Screen>
  );
}
