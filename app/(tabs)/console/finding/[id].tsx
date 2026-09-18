import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space, severityColors } from '@/theme/tokens';
import { Icon, productIcon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, ListRow, ProductTag, Row, Screen, SectionHeader, SeverityPill, Skeleton, Tag, cap } from '@/components/Primitives';
import { Sheet, TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { moduleName, productBySlug, tutorials, type Finding } from '@/data/sample';
import { apiFor } from '@/lib/instanceApi';

const SNOOZE = [{ key: 1, label: '1 h' }, { key: 24, label: '24 h' }, { key: 168, label: '7 d' }];

/** 12 Finding detail — evidence, fix steps, related; Acknowledge / Snooze / More. */
export default function FindingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { current, findingStatus, setFindingStatus } = useApp();
  const { toast, openExternal } = useToast();
  const [data, setData] = useState<{ item: Finding | undefined; all: Finding[] } | null>(null);
  const [snooze, setSnooze] = useState(false);
  const [more, setMore] = useState(false);
  const fid = id ?? '';

  useEffect(() => {
    let on = true; setData(null);
    const api = apiFor(current, 'sample-token');
    Promise.all([api.finding(fid), api.findings()]).then(([item, all]) => { if (on) setData({ item, all }); });
    return () => { on = false; };
  }, [current, fid]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/console'));
  const item = data?.item;
  const statusOf = (id: string): 'open' | 'acknowledged' | 'snoozed' | 'resolved' => findingStatus[id] ?? 'open';
  const status = statusOf(fid);
  const related = (data?.all ?? []).filter((f) => item && f.id !== item.id && f.module === item.module && !findingStatus[f.id]).slice(0, 3);
  const product = item ? productBySlug(item.module) : undefined;
  const tutorial = product?.tutorial ? tutorials.find((t) => t.slug === product.tutorial) : undefined;

  const acknowledge = () => { setFindingStatus(fid, 'acknowledged'); toast('Acknowledged'); goBack(); };
  const doSnooze = (label: string) => { setFindingStatus(fid, 'snoozed'); setSnooze(false); toast(`Snoozed for ${label}`); };
  const dashboardUrl = `${current?.url ?? 'https://hexward.corp.example.net'}/findings/${fid}`;

  return (
    <Screen scroll={false} padded={false}>
      <TopBar back="Findings" title="Finding" actions={item ? [{ icon: 'more', label: 'More', onPress: () => setMore(true) }] : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.lg }}>
        {data === null ? (
          <View style={{ gap: 10, marginTop: 8 }}><Skeleton h={24} w="45%" /><Skeleton h={28} /><Skeleton h={16} w="70%" /><Skeleton h={96} r={12} style={{ marginTop: 8 }} /><Skeleton h={120} r={12} /></View>
        ) : !item ? (
          <EmptyState icon="search" title="Finding not found" body="It may have been resolved, or it belongs to another instance." action="Back to findings" onAction={goBack} />
        ) : (
          <>
            <Row gap={10} style={{ marginTop: 4 }}>
              <SeverityPill s={item.severity} />
              <ProductTag icon={productIcon[item.module] ?? 'products'} name={moduleName(item.module)} />
              {status !== 'open' ? <Tag label={cap(status)} tone={status === 'acknowledged' ? 'ok' : 'text2'} /> : null}
            </Row>
            <Text v="title" style={{ marginTop: 10 }}>{item.title}</Text>
            <Text v="callout" tone="text2" style={{ marginTop: 4 }}>{item.host} · {current?.nickname ?? item.instanceId}</Text>
            <Text v="caption" tone="text3" num>First seen {item.when} · {cap(status)}</Text>

            <SectionHeader title="What we found" />
            <Text>{item.summary}</Text>

            <SectionHeader title="Evidence" />
            <Card style={{ backgroundColor: p.surface2 }}>
              {item.evidence.map((line, i) => <Text key={i} v="mono" selectable style={{ marginTop: i ? 4 : 0 }}>{line}</Text>)}
            </Card>

            <SectionHeader title="Fix" />
            <Card>
              {item.remediation.map((step, i) => (
                <Row key={i} gap={12} style={{ alignItems: 'flex-start', marginTop: i ? 12 : 0 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Text v="caption" tone="accent" semibold num>{i + 1}</Text>
                  </View>
                  <Text style={{ flex: 1 }}>{step}</Text>
                </Row>
              ))}
            </Card>

            {tutorial ? (
              <>
                <SectionHeader title="Learn more" />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  <ListRow title={tutorial.title} subtitle={`Tutorial · ${moduleName(tutorial.product)} · ${tutorial.minutes} min`} last
                    left={<Icon name="book" color={p.accent} />}
                    onPress={() => router.push({ pathname: '/(tabs)/learn/tutorial/[slug]', params: { slug: tutorial.slug } })} />
                </Card>
              </>
            ) : null}

            {related.length ? (
              <>
                <SectionHeader title="Related findings" />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {related.map((f, i) => (
                    <ListRow key={f.id} title={f.title} subtitle={`${cap(f.severity)} · ${moduleName(f.module)} · ${f.host}`} last={i === related.length - 1}
                      left={<Icon name={severityIcon[f.severity]} color={severityColors(p, f.severity).fg} strokeWidth={2} />}
                      onPress={() => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id: f.id } })} />
                  ))}
                </Card>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      {item ? (
        <View style={{ paddingHorizontal: space.md, paddingTop: 10, paddingBottom: space.md, borderTopWidth: 1, borderTopColor: p.border, backgroundColor: p.bg }}>
          <Row gap={8}>
            <Button title={status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'} icon="check" onPress={acknowledge} disabled={status === 'acknowledged'} style={{ flex: 1 }} />
            <Button title="Snooze" icon="clock" kind="secondary" onPress={() => setSnooze(true)} />
            <Button title="More" icon="more" kind="secondary" onPress={() => setMore(true)} />
          </Row>
        </View>
      ) : null}

      <Sheet open={snooze} onClose={() => setSnooze(false)} title="Snooze" actions={<Button title="Cancel" kind="secondary" onPress={() => setSnooze(false)} />}>
        <Text v="callout" tone="text2" style={{ marginBottom: 8 }}>Hide this finding from the open list. It comes back if it is still present.</Text>
        {SNOOZE.map((o, i) => <ListRow key={o.key} title={o.label} left={<Icon name="clock" color={p.text2} />} last={i === SNOOZE.length - 1} chevron={false} onPress={() => doSnooze(o.label)} />)}
      </Sheet>

      <Sheet open={more} onClose={() => setMore(false)} title="More" actions={<Button title="Cancel" kind="secondary" onPress={() => setMore(false)} />}>
        <ListRow title="False positive" subtitle="Mark and hide; the module stops reporting it" left={<Icon name="x" color={p.text2} />} chevron={false} onPress={() => { setMore(false); setFindingStatus(fid, 'resolved'); toast('Marked as false positive'); goBack(); }} />
        <ListRow title="Assign to me" left={<Icon name="star" color={p.text2} />} chevron={false} onPress={() => { setMore(false); toast('Assigned to you'); }} />
        <ListRow title="Open in dashboard" subtitle={dashboardUrl.replace(/^https?:\/\//, '')} left={<Icon name="external" color={p.text2} />} chevron={false} last onPress={() => { setMore(false); openExternal(dashboardUrl, 'Dashboard'); }} />
      </Sheet>
    </Screen>
  );
}
