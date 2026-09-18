import React from 'react';
import { ScrollView, Share, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, ListRow, Row, Screen, SectionHeader, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { CheckRow, FeatureTable, FollowButton, MockScreen, isBundle } from '@/components/Products';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { STORE_SAFE_PRICING } from '@/config';
import { campaigns, productBySlug, tutorials, videos } from '@/data/sample';

/**
 * 39 Product detail V1 (Store-safe): free on GitHub, editions "available on the web", no prices.
 * 40 V2 (full) lives behind `!STORE_SAFE_PRICING`: price row + "Get on Whop".
 */
export default function ProductDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { paired, current } = useApp();
  const { openExternal, toast } = useToast();
  const product = productBySlug(String(slug));

  if (product && isBundle(product.slug)) {
    return <Redirect href={{ pathname: '/(tabs)/products/bundle/[slug]', params: { slug: product.slug } }} />;
  }
  if (!product) {
    return (
      <Screen tabbed>
        <TopBar back="Products" title="Product" />
        <EmptyState icon="products" title="Product not found" body="This link points to a product that is not in the catalog." action="Browse products" onAction={() => router.replace('/(tabs)/products')} />
      </Screen>
    );
  }

  const installed = paired && !!current && current.modules.includes(product.slug);
  const tutorial = product.tutorial ? tutorials.find((t) => t.slug === product.tutorial) : undefined;
  const video = product.video ? videos.find((v) => v.id === product.video) : undefined;
  const related = campaigns.filter((c) => c.product === product.slug);
  const fullPricing = !STORE_SAFE_PRICING && !!product.priceV2;

  const share = async () => {
    try { await Share.share({ message: `${product.name} — ${product.web}` }); } catch { toast('Could not open the share sheet'); }
  };

  return (
    <Screen tabbed padded={false}>
      <TopBar back="Products" title={product.name} actions={[{ icon: 'share', label: 'Share', onPress: share }]} />
      <View style={{ paddingHorizontal: space.md }}>
        <Row gap={14} style={{ alignItems: 'flex-start' }}>
          <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={productIcon[product.slug] ?? 'products'} size={32} color={p.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              <Text v="caption" tone="text2" num>v{product.version} · {product.released}</Text>
              {__DEV__ ? <Tag label={fullPricing ? 'V2 · Full' : 'V1 · Store-safe'} /> : null}
            </Row>
            <Text v="title" style={{ marginTop: 2 }}>{product.name}</Text>
            {product.launch ? <View style={{ marginTop: 6 }}><Tag label={`Launches ${product.launch.replace('Tue ', '')}`} tone="accent" /></View> : null}
          </View>
        </Row>
        <Text tone="text2" style={{ marginTop: 10 }}>{product.tagline}</Text>
        {installed ? (
          <Row gap={10} style={{ marginTop: 12, flexWrap: 'wrap' }}>
            <Tag label={`Installed on ${current?.nickname ?? 'your instance'}`} tone="ok" />
            <Button small kind="secondary" title="Open in Console" icon="console" onPress={() => router.push({ pathname: '/(tabs)/console/module/[slug]', params: { slug: product.slug } })} />
          </Row>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md }} contentContainerStyle={{ paddingHorizontal: space.md, gap: 10 }}>
        <MockScreen variant={0} />
        <MockScreen variant={1} />
      </ScrollView>

      <View style={{ paddingHorizontal: space.md }}>
        <SectionHeader title="Free vs Pro vs Team" />
        <Card>
          <FeatureTable features={product.features} priceV2={product.priceV2} />
        </Card>

        <View style={{ gap: 8, marginTop: space.md }}>
          {fullPricing ? (
            // V2 only — compiled, never rendered while STORE_SAFE_PRICING is on.
            <Button title="Get on Whop" icon="external" onPress={() => openExternal(product.web + '/pricing', 'Whop checkout')} />
          ) : null}
          <Button title="Free on GitHub" icon="github" kind={fullPricing ? 'secondary' : 'primary'} onPress={() => openExternal(product.github, 'GitHub')} />
          <Row gap={8}>
            <Button title="Available on the web" icon="external" kind="secondary" onPress={() => openExternal(product.web, 'Hexward Labs website')} style={{ flex: 1 }} />
            <FollowButton slug={product.slug} name={product.name} small={false} />
          </Row>
        </View>

        <SectionHeader title="What it does" />
        <Text tone="text2">{product.what}</Text>

        <SectionHeader title="Who it's for" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          {product.who.map((w, i) => <CheckRow key={w} text={w} last={i === product.who.length - 1} />)}
        </Card>

        {tutorial || video ? (
          <>
            <SectionHeader title="Learn" />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              {tutorial ? (
                <ListRow title={tutorial.title} subtitle={`Tutorial · ${tutorial.minutes} min`} last={!video}
                  left={<Icon name="book" color={p.accent} />}
                  onPress={() => router.push({ pathname: '/(tabs)/learn/tutorial/[slug]', params: { slug: tutorial.slug } })} />
              ) : null}
              {video ? (
                <ListRow title={video.title} subtitle={`Video · ${video.duration}`} last
                  left={<Icon name="video" color={p.accent} />}
                  onPress={() => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id: video.id } })} />
              ) : null}
            </Card>
          </>
        ) : null}

        {related.length ? (
          <>
            <SectionHeader title="Related campaigns" action="All campaigns" onAction={() => router.push('/(tabs)/products/campaigns')} />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              {related.map((c, i) => (
                <ListRow key={c.id} title={c.title} subtitle={c.date} last={i === related.length - 1}
                  left={<Tag label={c.kind} tone={c.kind === 'Coming' ? 'accent' : 'text2'} />}
                  onPress={() => router.push({ pathname: '/(tabs)/products/campaign/[id]', params: { id: c.id } })} />
              ))}
            </Card>
          </>
        ) : null}

        <SectionHeader title="Bundles" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          <ListRow title="Part of Hexward Suite" subtitle="All modules on one self-hosted core" last
            left={<Icon name="nibble" color={p.accent} />}
            onPress={() => router.push({ pathname: '/(tabs)/products/bundle/[slug]', params: { slug: 'suite' } })} />
        </Card>

        <Text v="caption" tone="text3" center style={{ marginTop: space.lg }}>Free edition on GitHub. Pro and Team editions are available on the web.</Text>
      </View>
    </Screen>
  );
}
