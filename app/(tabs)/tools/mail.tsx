import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, KV, Row, Screen, SectionHeader, SeverityPill } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { RAN_CAPTION, RanOn, ResultSkeleton, StatusPill, StatusRow, ToolActions, ToolInput, useToolRun, type CheckStatus } from '@/components/Tools';
import { mailResult } from '@/data/sample';

const SUGGESTIONS = ['example.com', 'example.org', 'example.net'];
const cleanDomain = (s: string) => s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^@/, '').replace(/[/:].*$/, '');

/** Sample result re-targeted to the typed domain (records keep their shape). */
function buildResult(domain: string) {
  const swap = (s: string) => s.replace(/example\.com/g, domain);
  return {
    domain,
    spf: { ...mailResult.spf, record: swap(mailResult.spf.record) },
    dkim: { ...mailResult.dkim },
    dmarc: { ...mailResult.dmarc, record: swap(mailResult.dmarc.record) },
    mx: mailResult.mx.map(swap),
    mtaSts: mailResult.mtaSts,
    tlsRpt: mailResult.tlsRpt,
  };
}
type MailResult = ReturnType<typeof buildResult>;

/** 30 Mail Auth Check — SPF, DKIM and DMARC for a domain, computed on the phone from sample data. */
export default function MailAuthCheck() {
  const params = useLocalSearchParams<{ domain?: string }>();
  const [domain, setDomain] = useState(typeof params.domain === 'string' ? params.domain : '');
  const [result, setResult] = useState<MailResult | null>(null);
  const { phase, run, reset } = useToolRun();

  const check = (value?: string) => {
    const d = cleanDomain(value ?? domain);
    if (!d) return;
    setDomain(d);
    run(() => setResult(buildResult(d)));
  };
  const again = () => { setResult(null); reset(); };

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Mail Auth Check" back="Tools" />
      <View style={{ paddingHorizontal: space.md }}>
        {phase === 'input' ? (
          <>
            <ToolInput label="Domain" value={domain} onChangeText={setDomain} placeholder="example.com" keyboardType="url" returnKeyType="go" onSubmitEditing={() => check()} hint="DNS lookups run from this phone; nothing is sent to Hexward Labs." />
            <SectionHeader title="Recent domains" />
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {SUGGESTIONS.map((s) => <Chip key={s} label={s} selected={domain === s} onPress={() => check(s)} />)}
            </Row>
            <Button title="Check" icon="mail" disabled={!cleanDomain(domain)} onPress={() => check()} style={{ marginTop: space.lg }} />
          </>
        ) : null}

        {phase === 'loading' ? (
          <>
            <Text v="callout" tone="text2" style={{ marginTop: space.md }}>Looking up {cleanDomain(domain)} …</Text>
            <ResultSkeleton />
          </>
        ) : null}

        {phase === 'result' && result ? <MailResultView r={result} onReset={again} /> : null}
      </View>
    </Screen>
  );
}

const statusWord = (s: CheckStatus) => (s === 'ok' ? 'ok' : s === 'warn' ? 'warn' : 'fail');

function MailResultView({ r, onReset }: { r: MailResult; onReset: () => void }) {
  const { p } = useTheme();
  const dmarcNone = r.dmarc.policy === 'none';
  const statuses: CheckStatus[] = [r.spf.status, r.dkim.status, r.dmarc.status];
  const worst: CheckStatus = statuses.includes('fail') ? 'fail' : statuses.includes('warn') ? 'warn' : 'ok';
  const headline = worst === 'fail' ? 'A mail authentication check failed.' : dmarcNone ? 'DMARC is monitoring only (p=none).' : 'SPF, DKIM and DMARC are in place.';
  const dkimHost = `${r.dkim.selectors[0]}._domainkey.${r.domain}`;
  const dkimRecord = 'v=DKIM1; k=rsa; 2048-bit';
  const suggested = `v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@${r.domain}`;
  const report = [
    `Mail Auth Check — ${r.domain}`, RAN_CAPTION, '',
    headline, '',
    `SPF (${statusWord(r.spf.status)}): ${r.spf.record} · ${r.spf.lookups} of 10 DNS lookups`,
    `DKIM (${statusWord(r.dkim.status)}): selectors ${r.dkim.selectors.join(', ')} · ${dkimHost} ${dkimRecord}`,
    `DMARC (${statusWord(r.dmarc.status)}): ${r.dmarc.record}`,
    dmarcNone ? `Recommended: ${suggested}` : '',
    `MX: ${r.mx.join(', ')}`, `MTA-STS: ${r.mtaSts ? 'found' : 'not found'}`, `TLS-RPT: ${r.tlsRpt ? 'found' : 'not found'}`,
  ].filter(Boolean).join('\n');

  return (
    <>
      <Card style={{ marginTop: space.md }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text v="mono" tone="text2">{r.domain}</Text>
          {worst === 'ok' ? <StatusPill status="ok" label="OK" /> : <SeverityPill s={worst === 'fail' ? 'critical' : 'medium'} />}
        </Row>
        <Text v="title" style={{ marginTop: 8 }}>{headline}</Text>
        <RanOn />
      </Card>

      <SectionHeader title="SPF" />
      <CheckCard status={r.spf.status} record={r.spf.record} note={`Hard fail on unlisted senders · ${r.spf.lookups} of 10 DNS lookups`} />

      <SectionHeader title="DKIM" />
      <CheckCard status={r.dkim.status} label="Key found" record={dkimRecord} recordLabel={dkimHost} note={`Selectors ${r.dkim.selectors.join(', ')} publish a key. Both are 2048-bit RSA.`} />

      <SectionHeader title="DMARC" />
      <CheckCard status={r.dmarc.status} label={`p=${r.dmarc.policy}`} record={r.dmarc.record} note={dmarcNone ? 'Policy is monitor-only. Receivers report failures but deliver the mail anyway.' : 'Receivers act on failing mail.'} />
      {dmarcNone ? (
        <Card style={{ marginTop: 10, borderColor: p.accent }}>
          <Row gap={8}><Icon name="arrowRight" size={18} color={p.accent} /><Text v="headline">Recommended next step</Text></Row>
          <Text v="callout" tone="text2" style={{ marginTop: 6 }}>Move to p=quarantine with pct=25. A quarter of failing mail is held; aligned senders are unaffected. Raise pct once reports are clean for two weeks.</Text>
          <View style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: p.surface2 }}>
            <Text v="mono" selectable>{suggested}</Text>
          </View>
        </Card>
      ) : null}

      <SectionHeader title="MX" />
      <Card>
        {r.mx.map((m, i) => <KV key={m} k={i === 0 ? 'Primary' : `Backup ${i}`} v={m} mono />)}
      </Card>

      <SectionHeader title="Transport policy" />
      <Card>
        <StatusRow k="MTA-STS" v={r.mtaSts ? 'found' : 'not found'} ok={r.mtaSts} />
        <StatusRow k="TLS-RPT" v={r.tlsRpt ? 'found' : 'not found'} ok={r.tlsRpt} last />
      </Card>

      <ToolActions module="DmarcWatch" pairLabel="Pair to monitor" report={report} onReset={onReset} />
    </>
  );
}

function CheckCard({ status, label, record, recordLabel, note }: { status: CheckStatus; label?: string; record: string; recordLabel?: string; note: string }) {
  const { p } = useTheme();
  return (
    <Card>
      <StatusPill status={status} label={label} />
      {recordLabel ? <Text v="caption" tone="text3" style={{ marginTop: 10 }}>{recordLabel}</Text> : null}
      <View style={{ marginTop: recordLabel ? 4 : 10, padding: 10, borderRadius: 8, backgroundColor: p.surface2 }}>
        <Text v="mono" selectable>{record}</Text>
      </View>
      <Text v="callout" tone="text2" style={{ marginTop: 8 }}>{note}</Text>
    </Card>
  );
}
