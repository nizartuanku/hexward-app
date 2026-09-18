import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space, severityColors, type Severity } from '@/theme/tokens';
import { Icon, productIcon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, EmptyState, KV, LastSynced, ListRow, ProductTag, Row, Screen, SectionHeader, Segmented, SeverityPill, Skeleton, StatTile, Tag, cap } from '@/components/Primitives';
import { Sheet, TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { moduleName, productBySlug, type Finding } from '@/data/sample';
import { apiFor } from '@/lib/instanceApi';

const SLUGS = ['rulehawk', 'loglight', 'topolight', 'certlight', 'decoy', 'patchlight', 'asm', 'dmarcwatch', 'tenantwatch', 'reports'] as const;
type Slug = (typeof SLUGS)[number];
const isSlug = (s: string | undefined): s is Slug => !!s && (SLUGS as readonly string[]).includes(s);
const TITLE: Record<Slug, string> = { rulehawk: 'RuleHawk', loglight: 'Loglight', topolight: 'TopoLight', certlight: 'CertLight', decoy: 'Decoy', patchlight: 'Patchlight', asm: 'Attack Surface', dmarcwatch: 'DmarcWatch', tenantwatch: 'TenantWatch', reports: 'Reports' };

interface Stat { label: string; value: string | number; tone?: 'text' | 'critical' | 'high' | 'ok' }
interface Ctx { p: ReturnType<typeof useTheme>['p']; nickname: string; goFinding: (id: string) => void; toast: (m: string) => void; openExternal: (url: string, label?: string) => void; url: string; goCert: (host: string) => void }

/** 17–26 Module screens: one shared frame (product line, sync, stat tiles), a module-specific body, then the module's open findings. */
export default function ModuleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { current, findingStatus } = useApp();
  const { toast, openExternal } = useToast();
  const [items, setItems] = useState<Finding[] | null>(null);
  useEffect(() => { let on = true; setItems(null); apiFor(current, 'sample-token').findings().then((f) => { if (on) setItems(f); }); return () => { on = false; }; }, [current]);

  if (!isSlug(slug)) {
    return (
      <Screen tabbed padded={false}>
        <TopBar back="Console" title="Module" />
        <EmptyState icon="console" title="Module not found" body={`${slug ?? 'This module'} is not installed on ${current?.nickname ?? 'this instance'}.`} action="Back to console" onAction={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/console'))} />
      </Screen>
    );
  }
  const product = productBySlug(slug === 'reports' ? 'posture-report' : slug);
  const nickname = current?.nickname ?? 'hq-lab';
  const ctx: Ctx = { p, nickname, toast, openExternal, url: current?.url ?? 'https://hexward.corp.example.net', goFinding: (id) => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id } }), goCert: (host) => router.push({ pathname: '/(tabs)/tools/cert', params: { host } }) };
  const open = (items ?? []).filter((f) => f.module === slug && !findingStatus[f.id]);
  const stats = statsFor(slug);

  return (
    <Screen tabbed padded={false}>
      <TopBar back="Console" title={TITLE[slug]} />
      <View style={{ paddingHorizontal: space.md }}>
        <ProductTag icon={productIcon[product?.slug ?? slug] ?? 'products'} name={`${product?.name ?? TITLE[slug]} · ${product?.version ?? ''} · ${nickname}`} />
        <LastSynced when={current?.lastSynced} />

        <Row gap={8} style={{ marginTop: space.md, alignItems: 'stretch' }}>
          {stats.map((s) => <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} />)}
        </Row>

        {items === null ? (
          <View style={{ gap: 10, marginTop: space.lg }}><Skeleton h={20} w="40%" /><Skeleton h={72} r={12} /><Skeleton h={72} r={12} /><Skeleton h={72} r={12} /></View>
        ) : (
          <>
            {renderBody(slug, ctx)}
            {slug !== 'reports' ? (
              <>
                <SectionHeader title="Findings" action={open.length ? 'All findings' : undefined} onAction={() => router.push('/(tabs)/console')} />
                {open.length ? (
                  <Card padded={false} style={{ paddingHorizontal: space.md }}>
                    {open.map((f, i) => (
                      <ListRow key={f.id} title={f.title} subtitle={`${cap(f.severity)} · ${f.host} · ${f.age}`} last={i === open.length - 1}
                        left={<Icon name={severityIcon[f.severity]} color={severityColors(p, f.severity).fg} strokeWidth={2} />} onPress={() => ctx.goFinding(f.id)} />
                    ))}
                  </Card>
                ) : (
                  <Card><Row gap={10}><Icon name="check" color={p.ok} /><Text v="callout" tone="text2">No open findings from {moduleName(slug)} on {nickname}.</Text></Row></Card>
                )}
              </>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

function statsFor(slug: Slug): Stat[] {
  switch (slug) {
    case 'rulehawk': return [{ label: 'any/any', value: 1, tone: 'critical' }, { label: 'shadowed', value: 2, tone: 'high' }, { label: 'duplicates', value: 2 }, { label: 'rules', value: 68 }];
    case 'loglight': return [{ label: 'incident', value: 1, tone: 'critical' }, { label: 'events', value: 4 }, { label: 'source', value: 1 }, { label: 'NetFlow', value: '30 min' }];
    case 'topolight': return [{ label: 'down', value: 1, tone: 'critical' }, { label: 'up', value: 5, tone: 'ok' }, { label: 'interfaces', value: 92 }];
    case 'certlight': return [{ label: 'expired', value: 1, tone: 'critical' }, { label: 'under 30 d', value: 2, tone: 'high' }, { label: 'endpoints', value: 5 }];
    case 'decoy': return [{ label: 'trips today', value: 2, tone: 'critical' }, { label: 'traps armed', value: 6, tone: 'ok' }, { label: 'trips · 7 d', value: 4 }];
    case 'patchlight': return [{ label: 'KEV', value: 1, tone: 'critical' }, { label: 'patch tonight', value: 2, tone: 'high' }, { label: 'CVEs', value: 5 }, { label: 'hosts', value: 6 }];
    case 'asm': return [{ label: 'new', value: 2, tone: 'critical' }, { label: 'exposures', value: 5 }, { label: 'assets', value: 5 }, { label: 'last scan', value: '2 h' }];
    case 'dmarcwatch': return [{ label: 'aligned · 7 d', value: '96.8%', tone: 'high' }, { label: 'domains', value: 3 }, { label: 'messages', value: '63.5k' }];
    case 'tenantwatch': return [{ label: 'passed', value: 12, tone: 'ok' }, { label: 'failed', value: 5, tone: 'critical' }, { label: 'controls', value: 17 }];
    case 'reports': return [{ label: 'reports', value: 2 }, { label: 'open findings', value: 23, tone: 'high' }, { label: 'products', value: 9 }];
  }
}

function renderBody(slug: Slug, c: Ctx) {
  switch (slug) {
    case 'rulehawk': return <RuleHawkBody c={c} />;
    case 'loglight': return <LoglightBody c={c} />;
    case 'topolight': return <TopoLightBody c={c} />;
    case 'certlight': return <CertLightBody c={c} />;
    case 'decoy': return <DecoyBody c={c} />;
    case 'patchlight': return <PatchlightBody c={c} />;
    case 'asm': return <AsmBody c={c} />;
    case 'dmarcwatch': return <DmarcBody c={c} />;
    case 'tenantwatch': return <TenantBody c={c} />;
    case 'reports': return <ReportsBody c={c} />;
  }
}

/** Section title with a right-aligned meta (artboard pattern "OUTSIDE_IN · 3 findings · 41 rules"). */
function Head({ title, meta, mono }: { title: string; meta?: string; mono?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: space.lg, marginBottom: space.sm }}>
      <Text v={mono ? 'mono' : 'headline'} semibold>{title}</Text>
      {meta ? <Text v="caption" tone="text3" num>{meta}</Text> : null}
    </Row>
  );
}

function SevIcon({ s, p }: { s: Severity; p: Ctx['p'] }) { return <Icon name={severityIcon[s]} color={severityColors(p, s).fg} strokeWidth={2} />; }

// ---------- 17 RuleHawk ----------
interface Rule { title: string; sev: Severity; rule: string; hits: string; findingId?: string }
const RULEHAWK: { fw: string; acl: string; rules: number; items: Rule[] }[] = [
  { fw: 'fw-edge-01', acl: 'OUTSIDE_IN', rules: 41, items: [
    { title: 'any/any permit on OUTSIDE_IN', sev: 'critical', rule: 'Rule 1', hits: '18.2k hits / 30 d', findingId: 'f-001' },
    { title: 'Rule 47 shadowed by rule 12', sev: 'high', rule: 'Rule 47', hits: '0 hits / 30 d', findingId: 'f-002' },
    { title: 'Rule 31 duplicates rule 18', sev: 'low', rule: 'Rule 31', hits: '62 hits / 30 d' },
  ] },
  { fw: 'fw-edge-02', acl: 'INSIDE_OUT', rules: 27, items: [
    { title: 'Permit any destination on TCP/445', sev: 'medium', rule: 'Rule 9', hits: '4.1k hits / 30 d' },
    { title: 'Rule 22 never matched since import', sev: 'low', rule: 'Rule 22', hits: '0 hits / 30 d' },
    { title: 'Rule 15 duplicates rule 4', sev: 'low', rule: 'Rule 15', hits: '9 hits / 30 d' },
  ] },
];
function RuleHawkBody({ c }: { c: Ctx }) {
  const [fw, setFw] = useState<string | null>(null);
  const groups = RULEHAWK.filter((g) => !fw || g.fw === fw);
  return (
    <>
      <Row gap={8} style={{ marginTop: space.lg }}>
        {RULEHAWK.map((g) => <Chip key={g.fw} label={`${g.fw} · ${g.items.length}`} icon="shield" selected={fw === g.fw} onPress={() => setFw(fw === g.fw ? null : g.fw)} />)}
      </Row>
      {groups.map((g) => (
        <View key={g.acl}>
          <Head title={g.acl} mono meta={`${g.items.length} findings · ${g.rules} rules`} />
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            {g.items.map((r, i) => (
              <ListRow key={r.rule} title={r.title} subtitle={`${cap(r.sev)} · ${r.rule} · ${r.hits}`} last={i === g.items.length - 1} left={<SevIcon s={r.sev} p={c.p} />}
                onPress={() => (r.findingId ? c.goFinding(r.findingId) : c.toast('Rule detail opens in the dashboard'))} />
            ))}
          </Card>
        </View>
      ))}
    </>
  );
}

// ---------- 18 Loglight timeline ----------
const TIMELINE: { time: string; module: string; sev?: Severity; title: string; findingId?: string }[] = [
  { time: '14:02', module: 'decoy', sev: 'critical', title: 'Decoy tripped: SMB share touched from 198.51.100.23', findingId: 'f-005' },
  { time: '14:09', module: 'asm', sev: 'critical', title: 'Port 3389 exposed — 203.0.113.7', findingId: 'f-004' },
  { time: '14:17', module: 'rulehawk', sev: 'critical', title: 'any/any permit on OUTSIDE_IN', findingId: 'f-001' },
  { time: '14:31', module: 'loglight', title: 'Events merged into INC-0042' },
];
function LoglightBody({ c }: { c: Ctx }) {
  const { p } = c;
  return (
    <>
      <Card style={{ marginTop: space.lg, borderColor: p.critical }}>
        <Row style={{ justifyContent: 'space-between' }}><Text v="mono" semibold>INC-0042</Text><SeverityPill s="critical" /></Row>
        <Text v="headline" style={{ marginTop: 8 }}>Lateral movement attempt</Text>
        <Text v="callout" tone="text2">Source 198.51.100.23 · 4 correlated events</Text>
        <Text v="caption" tone="text3" num>First 2026-09-18 14:02 +07 · Last 14:31 +07</Text>
      </Card>
      <Head title="Timeline" meta="Correlated by Loglight" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {TIMELINE.map((e, i) => (
          <ListRow key={e.time} title={e.title} subtitle={`${moduleName(e.module)} · ${e.sev ? cap(e.sev) : 'Correlated'}`} last={i === TIMELINE.length - 1}
            left={<View style={{ width: 52 }}><Text v="mono" tone="text2">{e.time}</Text></View>}
            right={e.sev ? undefined : <Tag label="Correlated" tone="accent" />}
            onPress={e.findingId ? () => c.goFinding(e.findingId as string) : undefined} />
        ))}
      </Card>
      <Head title="Traffic map" meta="NetFlow · last 30 min" />
      <Card padded={false}>
        <View style={{ height: 140, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Traffic map preview">
          {[0, 1, 2].map((i) => <View key={i} style={{ position: 'absolute', width: 260 - i * 70, height: 260 - i * 70, borderRadius: 999, borderWidth: 1, borderColor: p.border }} />)}
          {[[-80, -30], [40, 20], [-20, 40], [90, -40]].map(([x, y], i) => <View key={i} style={{ position: 'absolute', width: i === 0 ? 12 : 8, height: i === 0 ? 12 : 8, borderRadius: 6, backgroundColor: i === 0 ? p.critical : p.accent, transform: [{ translateX: x }, { translateY: y }] }} />)}
          <Text v="caption" tone="text3" num>203.0.113.0/24 ↔ 198.51.100.0/24 · 4 flows</Text>
        </View>
        <View style={{ padding: space.md }}><Button title="Open map" kind="secondary" icon="globe" onPress={() => c.toast('Traffic map opens in the dashboard')} /></View>
      </Card>
    </>
  );
}

// ---------- 19 TopoLight devices ----------
interface Device { name: string; ip: string; os: string; up: boolean; detail: string; ifaces: number; latency: string; lldp: number; lastUp?: string; findingId?: string }
const DEVICES: Device[] = [
  { name: 'core-sw-02', ip: '192.0.2.2', os: 'Cisco IOS', up: false, detail: 'Down 6 min', ifaces: 48, latency: 'no reply', lldp: 3, lastUp: '2026-09-18 13:56 +07', findingId: 'f-008' },
  { name: 'fw-edge-01', ip: '192.0.2.1', os: 'Cisco ASA', up: true, detail: 'Up', ifaces: 8, latency: '2 ms', lldp: 1 },
  { name: 'fw-edge-02', ip: '192.0.2.3', os: 'Cisco ASA', up: true, detail: 'Up', ifaces: 8, latency: '3 ms', lldp: 1 },
  { name: 'dist-sw-01', ip: '192.0.2.10', os: 'Cisco IOS', up: true, detail: 'Up', ifaces: 24, latency: '4 ms', lldp: 4 },
  { name: 'srv-db-03', ip: '192.0.2.30', os: 'Linux', up: true, detail: 'Up', ifaces: 2, latency: '1 ms', lldp: 1 },
  { name: 'web-01', ip: '192.0.2.40', os: 'Linux', up: true, detail: 'Up', ifaces: 2, latency: '1 ms', lldp: 1 },
];
function TopoLightBody({ c }: { c: Ctx }) {
  const { p } = c;
  const [sel, setSel] = useState<Device | null>(null);
  return (
    <>
      <Head title="Devices" meta="Sorted by status" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {DEVICES.map((d, i) => (
          <ListRow key={d.name} title={d.name} subtitle={`${d.detail} · ${d.ifaces} interfaces · ${d.lldp} LLDP ${d.lldp === 1 ? 'neighbor' : 'neighbors'}`} last={i === DEVICES.length - 1} meta={d.latency}
            titleTone={d.up ? 'text' : 'critical'}
            left={<Icon name={d.up ? 'check' : 'sevCritical'} color={d.up ? p.ok : p.critical} strokeWidth={2} />}
            onPress={() => setSel(d)} />
        ))}
      </Card>
      <Sheet open={!!sel} onClose={() => setSel(null)} title={sel?.name}
        actions={sel ? (
          <>
            {sel.findingId ? <Button title="Open finding" icon="arrowRight" onPress={() => { const id = sel.findingId as string; setSel(null); c.goFinding(id); }} /> : null}
            <Button title="Re-run check" kind={sel.findingId ? 'secondary' : 'primary'} icon="refresh" onPress={() => { setSel(null); c.toast(`Re-run queued on ${c.nickname}`); }} />
            <Button title="Open dashboard" kind="secondary" icon="external" onPress={() => { const n = sel.name; setSel(null); c.openExternal(`${c.url}/topolight/devices/${n}`, 'Dashboard'); }} />
          </>
        ) : null}>
        {sel ? (
          <>
            <Row gap={8}><Icon name={sel.up ? 'check' : 'sevCritical'} color={sel.up ? p.ok : p.critical} strokeWidth={2} /><Text v="callout" semibold tone={sel.up ? 'ok' : 'critical'}>{sel.detail}</Text></Row>
            <Text v="callout" tone="text2" style={{ marginTop: 6 }}>{sel.ip} · {sel.os} · {sel.ifaces} interfaces</Text>
            <KV k="ICMP" v={sel.up ? sel.latency : 'no reply 6 min'} />
            <KV k="SNMP" v={sel.up ? 'ok' : 'timeout'} />
            <KV k="LLDP neighbors" v={String(sel.lldp)} />
            {sel.lastUp ? <KV k="Last seen up" v={sel.lastUp} mono /> : null}
          </>
        ) : null}
      </Sheet>
    </>
  );
}

// ---------- 20 CertLight ----------
const CERTS: { host: string; sev: Severity; days: number; label: string; key: string; findingId?: string }[] = [
  { host: 'api.example.com', sev: 'critical', days: -3, label: 'Expired 3 days ago', key: 'RSA 2048' },
  { host: 'vpn.example.com', sev: 'high', days: 9, label: '9 days · 2026-09-27', key: 'ECDSA P-256', findingId: 'f-003' },
  { host: 'mail.example.com', sev: 'medium', days: 27, label: '27 days · 2026-10-15', key: 'RSA 2048' },
  { host: 'corp.example.net', sev: 'low', days: 61, label: '61 days · 2026-11-18', key: 'ECDSA P-256' },
  { host: 'example.com', sev: 'info', days: 88, label: '88 days · 2026-12-15', key: 'ECDSA P-256' },
];
function CertLightBody({ c }: { c: Ctx }) {
  const { p } = c;
  return (
    <>
      <Head title="Endpoints" meta={`Sorted by days to expiry · ${CERTS.length}`} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {CERTS.map((x, i) => {
          const col = severityColors(p, x.sev).fg;
          const pct = Math.max(0, Math.min(1, x.days / 90));
          return (
            <ListRow key={x.host} title={x.host} subtitle={`${x.label} · ${x.key}`} last={i === CERTS.length - 1}
              left={<SevIcon s={x.sev} p={p} />}
              right={<View style={{ width: 56, height: 6, borderRadius: 3, backgroundColor: p.surface2, overflow: 'hidden' }} accessibilityLabel={`${Math.round(pct * 100)} percent of validity left`}><View style={{ width: `${pct * 100}%`, height: 6, backgroundColor: col }} /></View>}
              onPress={() => (x.findingId ? c.goFinding(x.findingId) : c.goCert(x.host))} />
          );
        })}
      </Card>
      <Text v="caption" tone="text3" style={{ marginTop: 8 }}>Bar shows remaining validity over a 90-day window. Endpoints without a finding open in Cert Check.</Text>
    </>
  );
}

// ---------- 21 Decoy ----------
const TRIPS: { day: 'Today' | 'Yesterday'; src: string; age: string; title: string; sev: Severity; trap: string; findingId?: string }[] = [
  { day: 'Today', src: '198.51.100.23', age: '12 min ago', title: 'SMB share touched on srv-db-03', sev: 'critical', trap: 'finance-share', findingId: 'f-005' },
  { day: 'Today', src: '198.51.100.23', age: '3 h ago', title: 'Canary credential used, planted on web-01', sev: 'high', trap: 'aws-key-token' },
  { day: 'Yesterday', src: '192.0.2.44', age: 'Yesterday', title: 'SSH login attempt on decoy host', sev: 'medium', trap: 'ssh-decoy-01' },
  { day: 'Yesterday', src: '203.0.113.55', age: 'Yesterday', title: 'Hidden admin page requested', sev: 'low', trap: 'web-admin-decoy' },
];
const TRAPS: { name: string; kind: string; where: string; last: string }[] = [
  { name: 'finance-share', kind: 'SMB share', where: 'srv-db-03', last: '12 min ago' },
  { name: 'aws-key-token', kind: 'Credential', where: 'web-01', last: '3 h ago' },
  { name: 'ssh-decoy-01', kind: 'Host', where: '192.0.2.250', last: 'Yesterday' },
  { name: 'web-admin-decoy', kind: 'Web page', where: 'web-01', last: 'Yesterday' },
  { name: 'payroll_2026.xlsx', kind: 'File', where: 'srv-db-03', last: 'Never' },
  { name: 'dmz-token', kind: 'Credential', where: 'fw-edge-02', last: 'Never' },
];
function DecoyBody({ c }: { c: Ctx }) {
  const { p } = c;
  const [tab, setTab] = useState<'trips' | 'traps'>('trips');
  const group = (day: 'Today' | 'Yesterday') => {
    const rows = TRIPS.filter((t) => t.day === day);
    return (
      <View key={day}>
        <Head title={day} meta={day === 'Today' ? `${rows.length} trips · ${TRAPS.length} traps armed` : `${rows.length} trips`} />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          {rows.map((t, i) => (
            <ListRow key={t.trap + t.age} title={t.title} subtitle={`${cap(t.sev)} · ${t.src} · ${t.age} · Trap: ${t.trap}`} last={i === rows.length - 1} left={<SevIcon s={t.sev} p={p} />}
              onPress={() => (t.findingId ? c.goFinding(t.findingId) : c.toast('Trip detail opens in the dashboard'))} />
          ))}
        </Card>
      </View>
    );
  };
  return (
    <>
      <View style={{ marginTop: space.lg }}><Segmented value={tab} onChange={setTab} options={[{ key: 'trips', label: 'Trips' }, { key: 'traps', label: 'Traps' }]} /></View>
      {tab === 'trips' ? (
        <>{group('Today')}{group('Yesterday')}</>
      ) : (
        <>
          <Head title="Armed traps" meta={`${TRAPS.length} armed`} />
          <Card padded={false} style={{ paddingHorizontal: space.md }}>
            {TRAPS.map((t, i) => (
              <ListRow key={t.name} title={t.name} subtitle={`${t.kind} · ${t.where}`} meta={t.last === 'Never' ? 'Never tripped' : `Last trip ${t.last}`} last={i === TRAPS.length - 1} chevron={false}
                left={<Icon name="decoy" color={t.last === 'Never' ? p.text3 : p.high} />} />
            ))}
          </Card>
        </>
      )}
    </>
  );
}

// ---------- 22 Patchlight ----------
interface Cve { id: string; sev: Severity; title: string; kev?: boolean; epss: string; hosts: string[]; findingId?: string }
const TONIGHT: Cve[] = [
  { id: 'CVE-2026-1234', sev: 'high', title: 'Remote code execution in sshd', kev: true, epss: '0.94', hosts: ['srv-db-03', 'web-01', 'fw-edge-01'], findingId: 'f-006' },
  { id: 'CVE-2026-2287', sev: 'high', title: 'Privilege escalation in kernel module', epss: '0.81', hosts: ['dist-sw-01'] },
];
const OTHERS: Cve[] = [
  { id: 'CVE-2026-3110', sev: 'medium', title: 'nginx info disclosure', epss: '0.32', hosts: ['web-01', 'srv-db-03'] },
  { id: 'CVE-2026-0458', sev: 'medium', title: 'OpenSSL denial of service', epss: '0.18', hosts: ['web-01', 'srv-db-03', 'fw-edge-01', 'fw-edge-02'] },
  { id: 'CVE-2025-9902', sev: 'low', title: 'curl, local only', epss: '0.04', hosts: ['web-01'] },
];
const HOSTS: { name: string; kev: number; cves: number }[] = [
  { name: 'web-01', kev: 1, cves: 4 }, { name: 'srv-db-03', kev: 1, cves: 3 }, { name: 'fw-edge-01', kev: 1, cves: 2 }, { name: 'dist-sw-01', kev: 0, cves: 1 }, { name: 'fw-edge-02', kev: 0, cves: 1 }, { name: 'core-sw-02', kev: 0, cves: 0 },
];
function PatchlightBody({ c }: { c: Ctx }) {
  const { p } = c;
  const row = (x: Cve, last: boolean) => (
    <ListRow key={x.id} title={`${x.id} — ${x.title}`} subtitle={`${cap(x.sev)} · EPSS ${x.epss} · ${x.hosts.length} ${x.hosts.length === 1 ? 'host' : 'hosts'} · ${x.hosts.join(', ')}`} last={last}
      left={<SevIcon s={x.sev} p={p} />} right={x.kev ? <Tag label="KEV" tone="critical" /> : undefined}
      onPress={() => (x.findingId ? c.goFinding(x.findingId) : c.toast('CVE detail opens in the dashboard'))} />
  );
  return (
    <>
      <Head title="Patch tonight" meta="KEV or EPSS above 0.7" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>{TONIGHT.map((x, i) => row(x, i === TONIGHT.length - 1))}</Card>
      <Head title="Everything else" meta={`${OTHERS.length} CVEs · by priority`} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>{OTHERS.map((x, i) => row(x, i === OTHERS.length - 1))}</Card>
      <Head title="Hosts" meta="KEV count" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {HOSTS.map((h, i) => (
          <ListRow key={h.name} title={h.name} subtitle={h.cves ? `${h.cves} ${h.cves === 1 ? 'CVE' : 'CVEs'}` : 'Clean'} last={i === HOSTS.length - 1} chevron={false}
            left={<Icon name="server" color={h.kev ? p.critical : p.text2} />} right={h.kev ? <Tag label={`${h.kev} KEV`} tone="critical" /> : <Tag label="0 KEV" tone="ok" />} />
        ))}
      </Card>
    </>
  );
}

// ---------- 23 ASM ----------
const EXPOSURES: { asset: string; port: string; what: string; sev: Severity; first: string; isNew?: boolean; findingId?: string }[] = [
  { asset: '203.0.113.7', port: '3389/tcp', what: 'RDP exposed', sev: 'critical', first: '2 h ago', isNew: true, findingId: 'f-004' },
  { asset: 'vpn.example.com', port: '443/tcp', what: 'HSTS header missing', sev: 'low', first: '2 h ago', isNew: true },
  { asset: 'api.example.com', port: '443/tcp', what: 'TLS 1.0 still enabled', sev: 'medium', first: '12 days ago' },
  { asset: '203.0.113.12', port: '22/tcp', what: 'SSH, key auth only', sev: 'low', first: '30 days ago' },
  { asset: 'mail.example.com', port: '25/tcp', what: 'SMTP, STARTTLS', sev: 'info', first: '30 days ago' },
];
function AsmBody({ c }: { c: Ctx }) {
  const { p } = c;
  const table = (rows: typeof EXPOSURES) => (
    <Card padded={false}>
      <Row style={{ paddingHorizontal: space.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: p.border }}>
        <Text v="label" tone="text3" style={{ flex: 1.4 }}>Asset</Text><Text v="label" tone="text3" style={{ flex: 1 }}>Port</Text><Text v="label" tone="text3" style={{ width: 88 }}>Severity</Text>
      </Row>
      {rows.map((x, i) => (
        <ListRow key={x.asset + x.port} title={x.asset} subtitle={`${x.what} · First seen ${x.first}`} last={i === rows.length - 1}
          left={<View style={{ width: 8 }} />}
          right={<Row gap={8}><Text v="mono" tone="text2">{x.port}</Text><View style={{ width: 88 }}><SeverityPill s={x.sev} /></View></Row>}
          onPress={() => (x.findingId ? c.goFinding(x.findingId) : c.toast('Exposure detail opens in the dashboard'))} />
      ))}
    </Card>
  );
  return (
    <>
      <Head title="New since last scan" meta="Scan finished 2 h ago" />
      {table(EXPOSURES.filter((x) => x.isNew))}
      <Head title="Known exposures" meta="3 exposures · 3 assets" />
      {table(EXPOSURES.filter((x) => !x.isNew))}
    </>
  );
}

// ---------- 24 DmarcWatch ----------
const DOMAINS: { domain: string; policy: string; msgs: string; aligned: number; tag: string; tone: 'ok' | 'critical' | 'text2'; findingId?: string }[] = [
  { domain: 'example.com', policy: 'p=none', msgs: '12.4k msgs', aligned: 96.8, tag: 'DMARC p=none', tone: 'text2', findingId: 'f-007' },
  { domain: 'corp.example.net', policy: 'p=quarantine', msgs: '3.1k msgs', aligned: 71, tag: '29% failing', tone: 'critical' },
  { domain: 'mail.example.com', policy: 'p=reject', msgs: '48.0k msgs', aligned: 99.6, tag: 'Aligned', tone: 'ok' },
];
const FAILING = [{ src: '198.51.100.40', n: 312 }, { src: '203.0.113.55', n: 128 }, { src: '192.0.2.9', n: 41 }];
function DmarcBody({ c }: { c: Ctx }) {
  const { p } = c;
  return (
    <>
      <Head title="Domains" meta="Pass rate · last 7 days" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {DOMAINS.map((d, i) => (
          <ListRow key={d.domain} title={d.domain} subtitle={`${d.policy} · ${d.msgs} · ${d.aligned}% aligned`} last={i === DOMAINS.length - 1}
            left={<View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: d.tone === 'critical' ? p.critical : d.tone === 'ok' ? p.ok : p.medium, alignItems: 'center', justifyContent: 'center' }}><Text v="caption" num semibold style={{ fontSize: 10, lineHeight: 12 }}>{Math.round(d.aligned)}</Text></View>}
            right={<Tag label={d.tag} tone={d.tone} />}
            onPress={() => (d.findingId ? c.goFinding(d.findingId) : c.toast('Domain detail opens in the dashboard'))} />
        ))}
      </Card>
      <Head title="Top failing sources" meta="example.com · 7 days" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {FAILING.map((f, i) => (
          <ListRow key={f.src} title={f.src} meta={`${f.n} fail`} last={i === FAILING.length - 1} left={<Icon name="mail" color={p.text2} />} onPress={() => c.toast('Source detail opens in the dashboard')} />
        ))}
      </Card>
    </>
  );
}

// ---------- 25 TenantWatch ----------
const FAILED: { title: string; sev: Severity; code: string; findingId?: string }[] = [
  { title: 'MFA not enforced for 4 admins', sev: 'high', code: 'CA-01', findingId: 'f-009' },
  { title: 'Legacy authentication still allowed', sev: 'high', code: 'CA-04' },
  { title: 'Guest users can invite guests', sev: 'medium', code: 'EXT-02' },
  { title: 'Audit log retention under 90 days', sev: 'low', code: 'LOG-03' },
  { title: 'Self-service password reset disabled', sev: 'low', code: 'ID-07' },
];
const PASSED: { title: string; code: string }[] = [
  { title: 'Security defaults or conditional access present', code: 'CA-02' }, { title: 'Admin consent workflow enabled', code: 'APP-01' }, { title: 'Mailbox auditing on', code: 'LOG-01' }, { title: 'External sharing limited to allowed domains', code: 'EXT-01' },
];
function TenantBody({ c }: { c: Ctx }) {
  const { p } = c;
  return (
    <>
      <Card style={{ marginTop: space.lg }}>
        <Row gap={14}>
          <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 5, borderColor: p.high, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Posture score 71 percent"><Text v="callout" semibold num>71</Text></View>
          <View style={{ flex: 1 }}>
            <Text v="headline">Posture score</Text>
            <Text v="callout" tone="text2">Microsoft 365 · Head office</Text>
            <Text v="caption" tone="text3" num>12 of 17 controls passed</Text>
          </View>
        </Row>
      </Card>
      <Head title="Failed controls" meta={`${FAILED.length} · sorted by severity`} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {FAILED.map((f, i) => (
          <ListRow key={f.code} title={f.title} subtitle={`${cap(f.sev)} · ${f.code}`} last={i === FAILED.length - 1} left={<SevIcon s={f.sev} p={p} />}
            right={<Button small kind="ghost" title="Remediation" onPress={() => c.toast('Opens remediation guide')} />}
            chevron={!!f.findingId} onPress={f.findingId ? () => c.goFinding(f.findingId as string) : undefined} />
        ))}
      </Card>
      <Head title="Passed controls" meta="12 · showing 4" />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {PASSED.map((x, i) => <ListRow key={x.code} title={x.title} subtitle={x.code} last={i === PASSED.length - 1} chevron={false} left={<Icon name="check" color={p.ok} strokeWidth={2} />} />)}
      </Card>
      <Button title="All 12 passed controls" kind="ghost" onPress={() => c.toast('Full control list opens in the dashboard')} style={{ marginTop: 6 }} />
    </>
  );
}

// ---------- 26 Reports ----------
function ReportsBody({ c }: { c: Ctx }) {
  const { p } = c;
  const gen = () => c.toast(`Generating on ${c.nickname} — ready in ~2 min`);
  return (
    <>
      <Head title="Posture Report · 0.1.0" meta="PDF · HTML" />
      <Card padded={false}>
        <View style={{ padding: space.md }}>
          <Row gap={12}>
            <View style={{ width: 44, height: 44, borderRadius: radius.tag, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="posture" color={p.accent} /></View>
            <View style={{ flex: 1 }}>
              <Text v="headline">Posture Report</Text>
              <Text v="caption" tone="text2" num>2026-09-18 06:00 +07 · 9 products · 23 open findings</Text>
            </View>
          </Row>
        </View>
        <View style={{ paddingHorizontal: space.md }}>
          <ListRow title="Executive" subtitle="Two pages, no jargon" left={<Icon name="book" color={p.text2} />} onPress={() => c.toast('Opens in the dashboard')} />
          <ListRow title="Technical" subtitle="Every finding with evidence" left={<Icon name="console" color={p.text2} />} onPress={() => c.toast('Opens in the dashboard')} />
        </View>
        <Row gap={8} style={{ padding: space.md }}>
          <Button title="Share PDF" kind="secondary" icon="share" onPress={() => c.toast('Share sheet: Posture Report.pdf')} style={{ flex: 1 }} />
          <Button title="Generate now" icon="refresh" onPress={gen} style={{ flex: 1 }} />
        </Row>
      </Card>
      <Head title="AuditLight · 0.3.1" meta="PDF" />
      <Card padded={false}>
        <View style={{ padding: space.md }}>
          <Row gap={12}>
            <View style={{ width: 44, height: 44, borderRadius: radius.tag, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name="auditlight" color={p.text} /></View>
            <View style={{ flex: 1 }}>
              <Text v="headline">Executive report</Text>
              <Text v="caption" tone="text2" num>2026-09-17 21:10 +07 · Non-exploit run · 6 hosts</Text>
            </View>
          </Row>
        </View>
        <Row gap={8} style={{ paddingHorizontal: space.md, paddingBottom: space.md }}>
          <Button title="Share PDF" kind="secondary" icon="share" onPress={() => c.toast('Share sheet: AuditLight executive.pdf')} style={{ flex: 1 }} />
          <Button title="Generate now" icon="refresh" onPress={gen} style={{ flex: 1 }} />
        </Row>
      </Card>
    </>
  );
}
