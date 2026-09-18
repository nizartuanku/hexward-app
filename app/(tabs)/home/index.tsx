import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space, severityColors, type Severity } from '@/theme/tokens';
import { Icon, productIcon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, LastSynced, ListRow, Row, Screen, SectionHeader, Skeleton, Tag } from '@/components/Primitives';
import { QuickTools, VideoThumb } from '@/components/Blocks';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { campaigns, moduleName, products, videos, type Finding } from '@/data/sample';
import { apiFor } from '@/lib/instanceApi';


export default function Home() {
  const { paired } = useApp();
  return paired ? <HomePaired /> : <HomeNotPaired />;
}

/** 08 Home — not paired. Hub with 2-tap paths to product, video and tool (canvas v4). */
function HomeNotPaired() {
  const { p } = useTheme();
  const router = useRouter();
  const { followed, toggleFollow } = useApp();
  const { toast } = useToast();
  const popular = ['rulehawk', 'certlight', 'topolight'].map((s) => products.find((x) => x.slug === s)!);
  const latest = videos.filter((v) => ['v-002', 'v-005'].includes(v.id));
  const topo = campaigns[0];
  return (
    <Screen tabbed padded={false}>
      <TopBar title="Home" actions={[{ icon: 'bell', label: 'Alerts', onPress: () => router.push('/(tabs)/console/alerts') }, { icon: 'gear', label: 'Settings', onPress: () => router.push('/settings') }]} />
      <View style={{ paddingHorizontal: space.md }}>
        <Card>
          <Row gap={10}><Icon name="nibble" size={22} color={p.accent} /><Text v="headline">Pair your first instance</Text></Row>
          <Text v="callout" tone="text2" style={{ marginTop: 6 }}>Scan the code from your dashboard. Nothing leaves your servers.</Text>
          <Button title="Scan QR" icon="qr" onPress={() => router.push('/pair/scan')} style={{ marginTop: 14 }} />
          <Button title="Explore products" kind="secondary" onPress={() => router.push('/(tabs)/products')} style={{ marginTop: 8 }} />
        </Card>

        <SectionHeader title="Popular products" action="All products" onAction={() => router.push('/(tabs)/products')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 10 }}>
        {popular.map((pr) => (
          <Card key={pr.slug} onPress={() => router.push({ pathname: '/(tabs)/products/[slug]', params: { slug: pr.slug } })} style={{ width: 160, minHeight: 132 }} accessibilityLabel={pr.name}>
            <Row style={{ justifyContent: 'space-between' }}><Icon name={productIcon[pr.slug]} size={22} color={p.text} /><Icon name="chevronRight" size={18} color={p.text3} /></Row>
            <Text v="headline" style={{ marginTop: 10 }}>{pr.name}</Text>
            <Text v="caption" tone="text2" numberOfLines={2}>{pr.slug === 'topolight' ? 'Network monitoring' : pr.slug === 'certlight' ? 'TLS certificate monitor' : 'Firewall rule audit'}</Text>
            <View style={{ marginTop: 8 }}>{pr.launch ? <Tag label={`Launches ${pr.launch.replace('Tue ', '')}`} tone="accent" /> : <Tag label="Free · Pro · Team" />}</View>
          </Card>
        ))}
        <Card onPress={() => router.push('/(tabs)/products')} style={{ width: 96, minHeight: 132, alignItems: 'center', justifyContent: 'center', gap: 6 }} accessibilityLabel="See all 12 products">
          <Icon name="arrowRight" color={p.accent} />
          <Text v="caption" tone="accent" semibold center>See all 12</Text>
        </Card>
      </ScrollView>

      <View style={{ paddingHorizontal: space.md }}>
        <SectionHeader title="Latest videos" action="See all" onAction={() => router.push('/(tabs)/learn/videos')} />
        <Row gap={10} style={{ alignItems: 'stretch' }}>
          {latest.map((v) => (
            <Pressable key={v.id} accessibilityRole="button" accessibilityLabel={`Play ${v.title}`} onPress={() => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id: v.id } })} style={{ flex: 1 }}>
              <VideoThumb duration={v.duration} />
              <Text v="callout" semibold numberOfLines={2} style={{ marginTop: 6 }}>{v.title}</Text>
            </Pressable>
          ))}
        </Row>

        <SectionHeader title="Popular tools" action="All tools" onAction={() => router.push('/(tabs)/tools')} />
        <QuickTools />

        <SectionHeader title="What's new" action="See all" onAction={() => router.push('/(tabs)/products/campaigns')} />
        <Card onPress={() => router.push({ pathname: '/(tabs)/products/campaign/[id]', params: { id: topo.id } })} accessibilityLabel={topo.title}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Tag label={topo.kind} tone="accent" />
              <Text v="headline" style={{ marginTop: 8 }}>TopoLight launch</Text>
              <Text v="caption" tone="text2">Tue 6 Oct · Free on GitHub at launch</Text>
            </View>
            <Button small kind={followed.includes('topolight') ? 'secondary' : 'primary'} title={followed.includes('topolight') ? 'Following' : 'Follow'} onPress={() => { const on = toggleFollow('topolight'); toast(on ? 'Following TopoLight — you will get a launch notification' : 'Unfollowed TopoLight'); }} />
          </Row>
        </Card>
      </View>
    </Screen>
  );
}

/** 06 Home healthy / 07 Home on fire / 49a skeleton — instance summary. */
function HomePaired() {
  const { p } = useTheme();
  const router = useRouter();
  const { current, findingStatus } = useApp();
  const [items, setItems] = useState<Finding[] | null>(null);
  useEffect(() => { let on = true; setItems(null); apiFor(current, 'sample-token').findings().then((f) => { if (on) setItems(f); }); return () => { on = false; }; }, [current]);
  const open = (items ?? []).filter((f) => !findingStatus[f.id]);
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  open.forEach((f) => { counts[f.severity]++; });
  // Fill the sample tiles like the artboard (7 medium / 12 low / 3 info beyond the listed findings)
  counts.medium += 6; counts.low += 12; counts.info += 3;
  const hot = open.find((f) => f.module === 'decoy' && f.severity === 'critical');
  const needsYou = open.filter((f) => f.severity === 'critical' || f.severity === 'high').slice(0, 3);
  const cont = videos.find((v) => v.id === 'v-003')!;
  return (
    <Screen tabbed padded={false}>
      <TopBar title={current?.nickname ?? 'Home'} subtitle={`${current?.tenant ?? ''} · Last synced ${current?.lastSynced ?? '2 min ago'}`}
        actions={[{ icon: 'search', label: 'Search', onPress: () => router.push('/(tabs)/home/search') }, { icon: 'server', label: 'Switch instance', onPress: () => router.push('/(tabs)/home/instances') }, { icon: 'bell', label: 'Alerts', onPress: () => router.push('/(tabs)/console/alerts'), badge: 4 }, { icon: 'gear', label: 'Settings', onPress: () => router.push('/settings') }]} />
      <View style={{ paddingHorizontal: space.md }}>
        {items === null ? (
          <View style={{ gap: 10 }}><Skeleton h={88} r={12} /><Skeleton h={20} w="40%" /><Skeleton h={64} r={12} /><Skeleton h={64} r={12} /></View>
        ) : (
          <>
            {hot ? (
              <Card style={{ borderColor: p.critical, backgroundColor: p.criticalSoft }} onPress={() => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id: hot.id } })} accessibilityLabel="Review critical finding">
                <Row gap={8}><Icon name={severityIcon.critical} color={p.critical} strokeWidth={2} /><Text v="headline" style={{ flex: 1 }} numberOfLines={2}>{hot.title}</Text></Row>
                <Text v="caption" tone="text2" style={{ marginTop: 4 }}>Critical · {moduleName(hot.module)} · {current?.nickname} · {hot.age}</Text>
                <Button small title="Review" style={{ marginTop: 10, alignSelf: 'flex-start' }} onPress={() => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id: hot.id } })} />
              </Card>
            ) : null}
            <Row gap={8} style={{ marginTop: hot ? space.md : 0 }}>
              {(['critical', 'high', 'medium', 'low', 'info'] as Severity[]).map((s) => {
                const c = severityColors(p, s);
                return (
                  <Pressable key={s} accessibilityRole="button" accessibilityLabel={`${counts[s]} ${s}`} onPress={() => router.push({ pathname: '/(tabs)/console', params: { sev: s } })} style={{ flex: 1, backgroundColor: c.bg, borderRadius: radius.card, paddingVertical: 10, alignItems: 'center', gap: 2 }}>
                    <Icon name={severityIcon[s]} size={16} color={c.fg} strokeWidth={2} />
                    <Text v="title" num style={{ color: c.fg }}>{counts[s]}</Text>
                    <Text v="caption" style={{ color: c.fg, fontSize: 11 }}>{s === 'critical' ? 'Critical' : s === 'high' ? 'High' : s === 'medium' ? 'Medium' : s === 'low' ? 'Low' : 'Info'}</Text>
                  </Pressable>
                );
              })}
            </Row>
            <SectionHeader title="Needs you" action="See all" onAction={() => router.push('/(tabs)/console')} />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              {needsYou.map((f, i) => (
                <ListRow key={f.id} title={f.title} subtitle={`${moduleName(f.module)} · ${f.host} · ${f.age}`} last={i === needsYou.length - 1}
                  left={<Icon name={severityIcon[f.severity]} color={severityColors(p, f.severity).fg} strokeWidth={2} />}
                  onPress={() => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id: f.id } })} />
              ))}
            </Card>
          </>
        )}

        <SectionHeader title="What's new" action="See all" onAction={() => router.push('/(tabs)/products/campaigns')} />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          {campaigns.slice(0, 2).map((c, i) => (
            <ListRow key={c.id} title={c.title.split(' — ')[0]} subtitle={c.id === 'c-001' ? 'Tue 6 Oct · Network monitoring' : 'Yesterday'} last={i === 1} left={<Tag label={c.kind} tone={c.kind === 'Coming' ? 'accent' : 'text2'} />} onPress={() => router.push({ pathname: '/(tabs)/products/campaign/[id]', params: { id: c.id } })} />
          ))}
        </Card>

        <SectionHeader title="Continue learning" action="Learn" onAction={() => router.push('/(tabs)/learn')} />
        <Card onPress={() => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id: cont.id } })} accessibilityLabel={`Continue ${cont.title}`}>
          <Row gap={12}>
            <VideoThumb duration={cont.duration} small />
            <View style={{ flex: 1 }}><Text v="callout" semibold numberOfLines={2}>{cont.title}</Text><Text v="caption" tone="text2">Video · 4:10 of 6:40 watched</Text></View>
            <Icon name="chevronRight" size={20} color={p.text3} />
          </Row>
        </Card>

        <SectionHeader title="Quick tools" action="All tools" onAction={() => router.push('/(tabs)/tools')} />
        <QuickTools />
        <LastSynced when={current?.lastSynced} />
      </View>
    </Screen>
  );
}
