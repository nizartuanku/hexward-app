import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, ListRow, ProductTag, Row, Screen, SectionHeader, Tag } from '@/components/Primitives';
import { VideoThumb } from '@/components/Blocks';
import { TopBar } from '@/components/Chrome';
import { useToast } from '@/state/Toast';
import { moduleName, tutorials, videos } from '@/data/sample';

type Section = 'all' | 'tutorials' | 'guides' | 'videos' | 'shorts';
const SECTIONS: { key: Section; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tutorials', label: 'Tutorials' },
  { key: 'guides', label: 'Guides' },
  { key: 'videos', label: 'Videos' },
  { key: 'shorts', label: 'Shorts' },
];
const BY_PRODUCT = ['rulehawk', 'certlight', 'asm', 'dmarcwatch'];
const GUIDE_SLUGS = ['migrate-asa-ftd', 'read-dmarc-report'];
const GUIDE_LEVEL: Record<string, string> = { 'migrate-asa-ftd': 'Advanced', 'read-dmarc-report': 'Start' };
/** Items available offline (48d): saved tutorials and downloaded videos. Sample only. */
const SAVED_TUTORIALS = ['rulehawk-first-audit'];
const SAVED_VIDEOS = ['v-001', 'v-003'];
const CONTINUE_ID = 'v-003';

/** 33 Learn home / 48d Learn offline — tutorials, guides and videos; filter by section or product. */
export default function LearnHome() {
  const { p } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>('all');
  const [product, setProduct] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const byProduct = <T extends { product?: string }>(items: T[]) => (product ? items.filter((i) => i.product === product) : items);
  const tutorialList = byProduct(tutorials);
  const guideList = byProduct(tutorials.filter((t) => GUIDE_SLUGS.includes(t.slug)));
  const videoList = byProduct(section === 'shorts' ? videos.filter((v) => v.short) : videos);
  const cont = videos.find((v) => v.id === CONTINUE_ID);
  const show = (s: Exclude<Section, 'all'>) => section === 'all' || section === s || (s === 'videos' && section === 'shorts');
  const videoAvailable = (id: string) => !offline || SAVED_VIDEOS.includes(id);
  const tutorialSaved = (slug: string) => SAVED_TUTORIALS.includes(slug);
  const nothing = tutorialList.length === 0 && guideList.length === 0 && videoList.length === 0;

  const openVideo = (id: string) => {
    if (!videoAvailable(id)) { toast('Needs connection — this video is not downloaded'); return; }
    router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id } });
  };

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Learn" />

      {offline ? (
        <View style={{ paddingHorizontal: space.md, marginBottom: space.sm }}>
          <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: p.surface2, borderRadius: radius.card, padding: 12 }}>
            <Icon name="wifiOff" size={20} color={p.text2} />
            <Text v="callout" tone="text2" style={{ flex: 1 }}>You're offline — saved tutorials and downloaded videos still work</Text>
          </View>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8 }}>
        {SECTIONS.map((s) => <Chip key={s.key} label={s.label} selected={section === s.key} onPress={() => setSection(s.key)} />)}
      </ScrollView>

      <View style={{ paddingHorizontal: space.md }}>
        {section === 'all' && cont && !product ? (
          <>
            <SectionHeader title="Continue" />
            <Card onPress={() => openVideo(cont.id)} accessibilityLabel={`Resume ${cont.title}`} style={{ opacity: videoAvailable(cont.id) ? 1 : 0.55 }}>
              <Row gap={12}>
                <VideoThumb duration={cont.duration} small />
                <View style={{ flex: 1 }}>
                  <Row gap={6}>
                    <ProductTag icon={productIcon[cont.product ?? ''] ?? 'products'} name={moduleName(cont.product ?? '')} />
                    {offline && SAVED_VIDEOS.includes(cont.id) ? <Tag label="Saved" tone="ok" /> : null}
                  </Row>
                  <Text v="callout" semibold numberOfLines={2} style={{ marginTop: 4 }}>{cont.title}</Text>
                  <Text v="caption" tone="text2">Video · 4:10 of 6:40 watched</Text>
                </View>
              </Row>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: p.surface2, marginTop: 12, overflow: 'hidden' }}>
                <View style={{ width: '62%', height: 4, backgroundColor: p.accent }} />
              </View>
              <Button small title="Resume" icon="play" style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={() => openVideo(cont.id)} />
            </Card>
          </>
        ) : null}
      </View>

      {show('videos') && videoList.length > 0 ? (
        <>
          <View style={{ paddingHorizontal: space.md }}>
            <SectionHeader title={section === 'shorts' ? 'Shorts' : 'Videos'} action="See all" onAction={() => router.push('/(tabs)/learn/videos')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 10 }}>
            {videoList.map((v) => {
              const ok = videoAvailable(v.id);
              return (
                <Pressable key={v.id} accessibilityRole="button" accessibilityLabel={ok ? `Play ${v.title}` : `${v.title} — needs connection`} onPress={() => openVideo(v.id)} style={{ width: 172, opacity: ok ? 1 : 0.5 }}>
                  <VideoThumb duration={v.duration} />
                  <Text v="callout" semibold numberOfLines={2} style={{ marginTop: 6 }}>{v.title}</Text>
                  <Row gap={6} style={{ marginTop: 2 }}>
                    <Text v="caption" tone="text2">{v.short ? 'Short' : v.series.replace(/s$/, '')}{v.product ? ` · ${moduleName(v.product)}` : ''}</Text>
                  </Row>
                  {offline ? <View style={{ marginTop: 4 }}>{ok ? <Tag label="Saved" tone="ok" /> : <Tag label="Needs connection" />}</View> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      <View style={{ paddingHorizontal: space.md }}>
        {show('tutorials') && tutorialList.length > 0 ? (
          <>
            <SectionHeader title="Tutorials" />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              {tutorialList.map((t, i) => (
                <ListRow key={t.slug} title={t.title} last={i === tutorialList.length - 1}
                  subtitle={`${moduleName(t.product)} · ${t.minutes} min · ${t.steps.length} steps`}
                  left={<Icon name={productIcon[t.product] ?? 'book'} color={p.text2} />}
                  right={offline ? (tutorialSaved(t.slug) ? <Tag label="Saved" tone="ok" /> : <Tag label="Not saved" />) : undefined}
                  onPress={() => router.push({ pathname: '/(tabs)/learn/tutorial/[slug]', params: { slug: t.slug } })} />
              ))}
            </Card>
          </>
        ) : null}

        {show('guides') && guideList.length > 0 ? (
          <>
            <SectionHeader title="Guides" />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              {guideList.map((g, i) => (
                <ListRow key={g.slug} title={g.slug === 'migrate-asa-ftd' ? 'Migrate ASA to FTD' : g.title} last={i === guideList.length - 1}
                  subtitle={`${GUIDE_LEVEL[g.slug] ?? 'Guide'} · ${g.minutes} min read · ${moduleName(g.product)}`}
                  left={<Icon name="book" color={p.text2} />}
                  right={offline ? (tutorialSaved(g.slug) ? <Tag label="Saved" tone="ok" /> : <Tag label="Not saved" />) : undefined}
                  onPress={() => router.push({ pathname: '/(tabs)/learn/guide/[slug]', params: { slug: g.slug } })} />
              ))}
            </Card>
          </>
        ) : null}

        {nothing ? (
          <View style={{ alignItems: 'center', paddingVertical: space.xl, gap: 6 }}>
            <Icon name="book" size={28} color={p.text3} />
            <Text v="callout" tone="text2" center>Nothing here yet{product ? ` for ${moduleName(product)}` : ''}.</Text>
            <Button small kind="ghost" title="Show everything" onPress={() => { setProduct(null); setSection('all'); }} />
          </View>
        ) : null}

        <SectionHeader title="By product" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8 }}>
        {BY_PRODUCT.map((slug) => (
          <Chip key={slug} label={moduleName(slug)} icon={productIcon[slug]} selected={product === slug} onPress={() => setProduct(product === slug ? null : slug)} />
        ))}
      </ScrollView>
      {product ? (
        <View style={{ paddingHorizontal: space.md, marginTop: space.sm }}>
          <Text v="caption" tone="text3">Showing {moduleName(product)} only · tap the chip again to clear</Text>
        </View>
      ) : null}

      {__DEV__ ? (
        <View style={{ paddingHorizontal: space.md, marginTop: space.lg, alignItems: 'center' }}>
          <Button small kind="ghost" title={offline ? 'Simulate online' : 'Simulate offline'} icon="wifiOff" accessibilityLabel={offline ? 'Simulate online (development only)' : 'Simulate offline (development only)'} onPress={() => setOffline(!offline)} />
        </View>
      ) : null}
    </Screen>
  );
}
