import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space, severityColors, type Severity } from '@/theme/tokens';
import { Icon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, KV, Row, Screen, SectionHeader, SeverityPill, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { RAN_CAPTION, RanOn, ResultSkeleton, StatusRow, ToolActions, ToolInput, useToolRun } from '@/components/Tools';
import { certResult } from '@/data/sample';

const SUGGESTIONS = ['vpn.example.com', 'example.com', 'api.example.com'];

/** Build the result from the sample, adapted to the host that was typed. Only vpn.example.com is the "9 days" case. */
function buildResult(host: string) {
  const sample = host === certResult.host;
  const daysLeft = sample ? certResult.daysLeft : 74;
  return {
    ...certResult,
    host,
    subject: `CN=${host}`,
    notAfter: sample ? certResult.notAfter : '2026-12-01 08:00 UTC',
    daysLeft,
    sans: sample ? certResult.sans : [host, `www.${host}`],
    chain: [host, ...certResult.chain.slice(1)],
  };
}
type CertResult = ReturnType<typeof buildResult>;

const cleanHost = (s: string) => s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/:].*$/, '');

/** 28 Cert Check input → 29 result. TLS certificate and chain for a host, computed on the phone from sample data. */
export default function CertCheck() {
  const params = useLocalSearchParams<{ host?: string }>();
  const [host, setHost] = useState(typeof params.host === 'string' ? params.host : '');
  const [result, setResult] = useState<CertResult | null>(null);
  const { phase, run, reset } = useToolRun();

  const check = (value?: string) => {
    const h = cleanHost(value ?? host);
    if (!h) return;
    setHost(h);
    run(() => setResult(buildResult(h)));
  };
  const again = () => { setResult(null); reset(); };

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Cert Check" back="Tools" />
      <View style={{ paddingHorizontal: space.md }}>
        {phase === 'input' ? (
          <>
            <ToolInput label="Host" value={host} onChangeText={setHost} placeholder="vpn.example.com" keyboardType="url" returnKeyType="go" onSubmitEditing={() => check()} hint="Port 443. Runs on this phone; nothing is sent to Hexward Labs." />
            <SectionHeader title="Recent hosts" />
            <Text v="caption" tone="text3" style={{ marginTop: -4, marginBottom: 6 }}>Tap a host to run the check again.</Text>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {SUGGESTIONS.map((s) => <Chip key={s} label={s} selected={host === s} onPress={() => check(s)} />)}
            </Row>
            <Button title="Check" icon="lock" disabled={!cleanHost(host)} onPress={() => check()} style={{ marginTop: space.lg }} />
          </>
        ) : null}

        {phase === 'loading' ? (
          <>
            <Text v="callout" tone="text2" style={{ marginTop: space.md }}>Checking {cleanHost(host)}:443 …</Text>
            <ResultSkeleton />
          </>
        ) : null}

        {phase === 'result' && result ? <CertResultView r={result} onReset={again} /> : null}
      </View>
    </Screen>
  );
}

function CertResultView({ r, onReset }: { r: CertResult; onReset: () => void }) {
  const { p } = useTheme();
  const sev: Severity = r.daysLeft < 7 ? 'critical' : r.daysLeft < 30 ? 'high' : 'low';
  const ok = sev === 'low';
  const tone = ok ? p.ok : severityColors(p, sev).fg;
  const report = [
    `Cert Check — ${r.host}:${r.port}`, RAN_CAPTION, '',
    `Expires in ${r.daysLeft} days (${r.notAfter})`,
    `Subject: ${r.subject}`, `Issuer: ${r.issuer}`, `Valid: ${r.notBefore} → ${r.notAfter}`,
    `SANs: ${r.sans.join(', ')}`, `Chain: ${r.chain.join(' → ')} (${r.chainOk ? 'valid' : 'broken'})`,
    `Signature: ${r.sigAlg}`, `Key: ${r.keyBits}`, `TLS: ${r.tls.join(', ')}`,
    `HSTS: ${r.hsts ? 'enabled' : 'missing'}`, `OCSP: ${r.ocsp}`,
  ].join('\n');

  return (
    <>
      <Card style={{ marginTop: space.md, borderColor: ok ? p.border : tone, backgroundColor: ok ? p.surface : severityColors(p, sev).bg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text v="mono" tone="text2">{r.host}:{r.port}</Text>
          {ok ? (
            <Row gap={6}><Icon name="check" size={16} color={p.ok} strokeWidth={2} /><Text v="caption" semibold style={{ color: p.ok }}>OK</Text></Row>
          ) : <SeverityPill s={sev} />}
        </Row>
        <Row gap={10} style={{ marginTop: 10, alignItems: 'baseline' }}>
          <Text v="largeTitle" num style={{ color: tone, fontSize: 40, lineHeight: 46 }}>{r.daysLeft}</Text>
          <Text v="title" style={{ color: tone }}>days left</Text>
        </Row>
        <Text v="callout" tone="text2" style={{ marginTop: 4 }}>{ok ? 'Certificate is valid and the chain is complete.' : `Expires ${r.notAfter}. No renewal observed yet.`}</Text>
        <RanOn />
      </Card>

      <SectionHeader title="Certificate" />
      <Card>
        <KV k="Subject" v={r.subject} mono />
        <KV k="Issuer" v={r.issuer} mono />
        <KV k="Not before" v={r.notBefore} mono />
        <KV k="Not after" v={r.notAfter} mono />
        <KV k="Signature" v={r.sigAlg} mono />
        <KV k="Key" v={r.keyBits} mono />
      </Card>

      <SectionHeader title="Subject alternative names" />
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        {r.sans.map((s) => <Tag key={s} label={s} tone="accent" />)}
      </Row>

      <SectionHeader title={`Chain · ${r.chain.length} certificates`} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {r.chain.map((c, i) => (
          <View key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 8, borderBottomWidth: i === r.chain.length - 1 ? 0 : 1, borderBottomColor: p.border }}>
            <Icon name="check" size={18} color={p.ok} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text v="mono">{c}</Text>
              <Text v="caption" tone="text2">{i === 0 ? 'Leaf' : i === r.chain.length - 1 ? 'Root · self-signed' : 'Intermediate'}</Text>
            </View>
            {i === 0 && !ok ? <Icon name={severityIcon[sev]} size={18} color={tone} strokeWidth={2} /> : null}
          </View>
        ))}
      </Card>
      <Row gap={6} style={{ marginTop: space.sm }}>
        <Icon name={r.chainOk ? 'check' : 'sevHigh'} size={14} color={r.chainOk ? p.ok : p.high} strokeWidth={2} />
        <Text v="caption" tone="text2">{r.chainOk ? 'Chain valid to a trusted root' : 'Chain incomplete'}</Text>
      </Row>

      <SectionHeader title="Transport" />
      <Card>
        <Text v="callout" tone="text2">TLS versions</Text>
        <Row gap={8} style={{ marginTop: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {r.tls.map((t) => <Tag key={t} label={t} tone={t === 'TLS 1.3' ? 'ok' : 'text2'} />)}
        </Row>
        <StatusRow k="HSTS" v={r.hsts ? 'enabled' : 'missing'} ok={r.hsts} />
        <StatusRow k="OCSP" v={r.ocsp} ok={r.ocsp === 'good'} last />
      </Card>

      <ToolActions module="CertLight" pairLabel="Pair to monitor this host" report={report} onReset={onReset} />
    </>
  );
}
