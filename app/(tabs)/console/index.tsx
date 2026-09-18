import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space, severityColors, type Severity } from '@/theme/tokens';
import { Icon, productIcon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, EmptyState, LastSynced, ListRow, Row, Screen, SectionHeader, Segmented, Skeleton, Tag, cap } from '@/components/Primitives';
import { Sheet, TopBar } from '@/components/Chrome';
import { useApp, type PairedInstance } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { alerts as sampleAlerts, moduleName, type Finding } from '@/data/sample';
import { apiFor } from '@/lib/instanceApi';

const SEVS: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
type StatusFilter = 'open' | 'acknowledged' | 'snoozed' | 'all';
interface Filters { sev: Severity[]; modules: string[]; status: StatusFilter }
const NO_FILTERS: Filters = { sev: [], modules: [], status: 'open' };
const isSeverity = (s: string | undefined): s is Severity => !!s && (SEVS as string[]).includes(s);
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** 11 Findings list (+13 filter sheet, 48a/48b empty, 49b skeleton, 50 offline) — the paired console. */
export default function Console() {
  const { paired, current } = useApp();
  return paired && current ? <Findings current={current} /> : <EmptyConsole />;
}

/** 48a Empty console — not paired. Pair, or use tools / learn meanwhile. */
function EmptyConsole() {
  const { p } = useTheme();
  const router = useRouter();
  return (
    <Screen tabbed padded={false}>
      <TopBar title="Findings" />
      <View style={{ paddingHorizontal: space.md }}>
        <EmptyState icon="qr" title="Pair an instance to see findings" body="Open your dashboard, go to Settings › Mobile and scan the code it shows." action="Scan QR" onAction={() => router.push('/pair/scan')} />
        <SectionHeader title="Meanwhile" />
        <Card onPress={() => router.push('/(tabs)/tools')} accessibilityLabel="Use tools without an instance">
          <Row gap={12}>
            <Icon name="tools" color={p.accent} />
            <View style={{ flex: 1 }}>
              <Text v="headline">Use tools without an instance</Text>
              <Text v="caption" tone="text2">Cert Check, Mail Auth, Exposure and Rule Lint run on this phone.</Text>
            </View>
            <Icon name="chevronRight" size={20} color={p.text3} />
          </Row>
        </Card>
        <Card onPress={() => router.push('/(tabs)/learn')} accessibilityLabel="Learn the tools first" style={{ marginTop: 10 }}>
          <Row gap={12}>
            <Icon name="learn" color={p.accent} />
            <View style={{ flex: 1 }}>
              <Text v="headline">Learn the tools first</Text>
              <Text v="caption" tone="text2">Tutorials, guides and short videos. No instance needed.</Text>
            </View>
            <Icon name="chevronRight" size={20} color={p.text3} />
          </Row>
        </Card>
      </View>
    </Screen>
  );
}

function Findings({ current }: { current: PairedInstance }) {
  const { p } = useTheme();
  const router = useRouter();
  const { sev: sevParam } = useLocalSearchParams<{ sev?: string }>();
  const { findingStatus, alertsRead } = useApp();
  const { toast } = useToast();
  const [items, setItems] = useState<Finding[] | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [sheet, setSheet] = useState(false);
  const offline = current.status === 'offline';

  useEffect(() => { let on = true; setItems(null); apiFor(current, 'sample-token').findings().then((f) => { if (on) setItems(f); }); return () => { on = false; }; }, [current]);
  // `?sev=` from the Home severity tiles seeds the severity filter.
  useEffect(() => { if (isSeverity(sevParam)) setFilters((f) => ({ ...f, sev: [sevParam] })); }, [sevParam]);

  const statusOf = (f: Finding): 'open' | 'acknowledged' | 'snoozed' | 'resolved' => findingStatus[f.id] ?? 'open';
  const byStatus = (list: Finding[], st: StatusFilter) => (st === 'all' ? list : list.filter((f) => statusOf(f) === st));
  const apply = (list: Finding[], fl: Filters) => byStatus(list, fl.status).filter((f) => (fl.sev.length === 0 || fl.sev.includes(f.severity)) && (fl.modules.length === 0 || fl.modules.includes(f.module)));

  const all = items ?? [];
  const visible = apply(all, filters);
  const forCounts = byStatus(all, filters.status).filter((f) => filters.modules.length === 0 || filters.modules.includes(f.module));
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  forCounts.forEach((f) => { counts[f.severity]++; });
  const openCount = byStatus(all, 'open').length;
  const unread = sampleAlerts.filter((a) => !a.read && !alertsRead.includes(a.id)).length;
  const activeCount = filters.sev.length + filters.modules.length + (filters.status !== 'open' ? 1 : 0);
  const modules = current.modules;
  const draftCount = apply(all, draft).length;

  const openSheet = () => { setDraft(filters); setSheet(true); };
  const applyDraft = () => { setFilters(draft); setSheet(false); };
  const resetAll = () => { setDraft(NO_FILTERS); setFilters(NO_FILTERS); setSheet(false); toast('Filters reset'); };
  const goFinding = (id: string) => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id } });

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Findings" actions={[
        { icon: 'filter', label: 'Filters', onPress: openSheet, badge: activeCount },
        { icon: 'bell', label: 'Alerts', onPress: () => router.push('/(tabs)/console/alerts'), badge: unread },
      ]} />

      {offline ? (
        <View style={{ paddingHorizontal: space.md, marginBottom: space.sm }}>
          <Card style={{ borderColor: p.high, backgroundColor: p.highSoft }}>
            <Row gap={12}>
              <Icon name="wifiOff" color={p.high} />
              <View style={{ flex: 1 }}>
                <Text v="headline">{current.nickname} unreachable</Text>
                <Text v="caption" tone="text2">Last synced {current.lastSynced} · showing cached findings</Text>
              </View>
              <Button small kind="secondary" title="Retry" icon="refresh" onPress={() => toast(`Retrying ${current.nickname}…`)} />
            </Row>
          </Card>
        </View>
      ) : null}

      {/* Severity chips with counts (artboard 11) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8 }}>
        <Chip label={`All · ${forCounts.length}`} selected={filters.sev.length === 0} onPress={() => setFilters((f) => ({ ...f, sev: [] }))} />
        {SEVS.map((s) => (
          <Chip key={s} label={counts[s] ? `${cap(s)} · ${counts[s]}` : cap(s)} icon={severityIcon[s]} selected={filters.sev.includes(s)}
            onPress={() => setFilters((f) => ({ ...f, sev: f.sev.length === 1 && f.sev[0] === s ? [] : [s] }))} />
        ))}
      </ScrollView>
      {/* Module chips — only modules present on this instance */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8, marginTop: 8 }}>
        <Chip label="All products" selected={filters.modules.length === 0} onPress={() => setFilters((f) => ({ ...f, modules: [] }))} />
        {modules.map((m) => (
          <Chip key={m} label={moduleName(m)} icon={productIcon[m] ?? 'products'} selected={filters.modules.includes(m)} onPress={() => setFilters((f) => ({ ...f, modules: toggle(f.modules, m) }))} />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: space.md }}>
        <Row gap={6}>
          <Text v="caption" tone="text3">{current.nickname} ·</Text>
          <LastSynced when={`${current.lastSynced} · ${openCount} open`} />
        </Row>

        <SectionHeader title="Modules" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 10 }}>
        {[...modules, 'reports'].map((m) => {
          const n = m === 'reports' ? 0 : byStatus(all, 'open').filter((f) => f.module === m).length;
          const name = m === 'reports' ? 'Reports' : moduleName(m);
          return (
            <Card key={m} onPress={() => router.push({ pathname: '/(tabs)/console/module/[slug]', params: { slug: m } })} style={{ width: 120, paddingVertical: 12 }} accessibilityLabel={`${name} module`}>
              <Icon name={m === 'reports' ? 'posture' : productIcon[m] ?? 'products'} size={22} color={p.text} />
              <Text v="callout" semibold numberOfLines={1} style={{ marginTop: 8 }}>{name}</Text>
              <Text v="caption" tone={n ? 'text2' : 'text3'} num>{m === 'reports' ? '2 reports' : n ? `${n} open` : 'Clear'}</Text>
            </Card>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: space.md, marginTop: space.lg }}>
        {items === null ? (
          <View style={{ gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Card key={i} style={{ paddingVertical: 14 }}>
                <Row gap={12}><Skeleton w={24} h={24} r={12} /><View style={{ flex: 1, gap: 8 }}><Skeleton h={16} w="80%" /><Skeleton h={12} w="55%" /></View></Row>
              </Card>
            ))}
          </View>
        ) : visible.length === 0 ? (
          <EmptyState icon="check" title="Nothing open — nice" body={activeCount ? 'No findings match these filters.' : `Last scan ${current.lastSynced}. ${current.nickname} has no open findings.`}
            action={activeCount ? 'Reset filters' : undefined} onAction={activeCount ? resetAll : undefined} />
        ) : (
          <Card padded={false} style={[{ paddingHorizontal: space.md }, offline ? { opacity: 0.55 } : null]}>
            {visible.map((f, i) => {
              const st = statusOf(f);
              return (
                <ListRow key={f.id} title={f.title} subtitle={`${moduleName(f.module)} · ${f.host} · ${f.age}`} last={i === visible.length - 1}
                  left={<Icon name={severityIcon[f.severity]} color={severityColors(p, f.severity).fg} strokeWidth={2} />}
                  right={st !== 'open' ? <Tag label={cap(st)} tone={st === 'acknowledged' ? 'ok' : 'text2'} /> : undefined}
                  onPress={() => goFinding(f.id)} />
              );
            })}
          </Card>
        )}
      </View>

      {/* 13 Filter sheet */}
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Filters"
        actions={<><Button title="Apply" onPress={applyDraft} accessibilityLabel={`Apply filters, ${draftCount} findings`} /><Button title="Reset" kind="secondary" onPress={resetAll} /></>}>
        <Text v="label" tone="text3" style={{ marginTop: 4 }}>Severity</Text>
        <Row gap={8} style={{ flexWrap: 'wrap', marginTop: 8 }}>
          {SEVS.map((s) => <Chip key={s} label={cap(s)} icon={severityIcon[s]} selected={draft.sev.includes(s)} onPress={() => setDraft((d) => ({ ...d, sev: toggle(d.sev, s) }))} />)}
        </Row>
        <Text v="label" tone="text3" style={{ marginTop: space.md }}>Product</Text>
        <Row gap={8} style={{ flexWrap: 'wrap', marginTop: 8 }}>
          {modules.map((m) => <Chip key={m} label={moduleName(m)} icon={productIcon[m] ?? 'products'} selected={draft.modules.includes(m)} onPress={() => setDraft((d) => ({ ...d, modules: toggle(d.modules, m) }))} />)}
        </Row>
        <Text v="label" tone="text3" style={{ marginTop: space.md, marginBottom: 8 }}>Status</Text>
        <Segmented<StatusFilter> value={draft.status} onChange={(k) => setDraft((d) => ({ ...d, status: k }))}
          options={[{ key: 'open', label: 'Open' }, { key: 'acknowledged', label: 'Acknowledged' }, { key: 'snoozed', label: 'Snoozed' }, { key: 'all', label: 'All' }]} />
        <Text v="caption" tone="text3" num style={{ marginTop: space.md }}>{draftCount} {draftCount === 1 ? 'finding matches' : 'findings match'}</Text>
      </Sheet>
    </Screen>
  );
}
