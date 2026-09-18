import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, KV, Row, Screen, SectionHeader, SeverityPill } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { OkMark, RAN_CAPTION, RanOn, ResultSkeleton, StatusPill, ToolActions, ToolInput, useToolRun } from '@/components/Tools';
import { exposureResult } from '@/data/sample';

const SUGGESTIONS = ['api.example.com', '203.0.113.7', 'vpn.example.com'];
const cleanTarget = (s: string) => s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/].*$/, '');
const isIp = (s: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(s);

/** Sample result re-targeted to what was typed. An IP target resolves to itself. */
function buildResult(target: string) {
  return { ...exposureResult, target, ip: isIp(target) ? target : exposureResult.ip, scannedAt: exposureResult.scannedAt };
}
type ExposureResult = ReturnType<typeof buildResult>;

/** 31 Exposure Check — reachability and open services for a host or IP, computed on the phone from sample data. */
export default function ExposureCheck() {
  const { p } = useTheme();
  const params = useLocalSearchParams<{ target?: string }>();
  const [target, setTarget] = useState(typeof params.target === 'string' ? params.target : '');
  const [result, setResult] = useState<ExposureResult | null>(null);
  const { phase, run, reset } = useToolRun();

  const check = (value?: string) => {
    const t = cleanTarget(value ?? target);
    if (!t) return;
    setTarget(t);
    run(() => setResult(buildResult(t)));
  };
  const again = () => { setResult(null); reset(); };

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Exposure Check" back="Tools" />
      <View style={{ paddingHorizontal: space.md }}>
        {phase === 'input' ? (
          <>
            <ToolInput label="Host or IP" value={target} onChangeText={setTarget} placeholder="api.example.com or 203.0.113.7" keyboardType="url" returnKeyType="go" onSubmitEditing={() => check()} hint="Top 1,000 TCP ports. Runs on this phone; nothing is sent to Hexward Labs." />
            <SectionHeader title="Recent targets" />
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {SUGGESTIONS.map((s) => <Chip key={s} label={s} selected={target === s} onPress={() => check(s)} />)}
            </Row>
            <Row gap={8} style={{ marginTop: space.lg, alignItems: 'flex-start' }}>
              <Icon name="shield" size={18} color={p.text2} />
              <Text v="callout" tone="text2" style={{ flex: 1 }}>Only check hosts you own or are authorised to test.</Text>
            </Row>
            <Button title="Check" icon="globe" disabled={!cleanTarget(target)} onPress={() => check()} style={{ marginTop: space.md }} />
          </>
        ) : null}

        {phase === 'loading' ? (
          <>
            <Text v="callout" tone="text2" style={{ marginTop: space.md }}>Scanning {cleanTarget(target)} …</Text>
            <ResultSkeleton />
          </>
        ) : null}

        {phase === 'result' && result ? <ExposureResultView r={result} onReset={again} /> : null}
      </View>
    </Screen>
  );
}

function ExposureResultView({ r, onReset }: { r: ExposureResult; onReset: () => void }) {
  const { p } = useTheme();
  const attention = r.ports.filter((x) => !x.ok);
  const headline = attention.length ? `${attention.length} of ${r.ports.length} open ports need attention.` : `${r.ports.length} open ports, nothing unexpected.`;
  const report = [
    `Exposure Check — ${r.target}`, RAN_CAPTION, '',
    `Resolved: ${r.ip}`, headline, '',
    ...r.ports.map((x) => `${x.port}/tcp ${x.service} · ${x.banner} · ${x.ok ? 'OK' : `Attention: ${x.note ?? ''}`}`),
    `${r.closed} ports closed`, `Scanned at ${r.scannedAt}`,
  ].join('\n');

  return (
    <>
      <Card style={{ marginTop: space.md, borderColor: attention.length ? p.medium : p.border }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text v="mono" tone="text2">{r.target}</Text>
          {attention.length ? <SeverityPill s="medium" /> : <StatusPill status="ok" label="OK" />}
        </Row>
        <Text v="title" style={{ marginTop: 8 }}>{headline}</Text>
        <KV k="Resolved IP" v={r.ip} mono />
        <RanOn style={{ marginTop: 0 }} />
      </Card>

      <SectionHeader title={`Open ports · ${r.ports.length}`} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {r.ports.map((x, i) => (
          <View key={x.port} style={{ paddingVertical: 10, gap: 4, borderBottomWidth: i === r.ports.length - 1 ? 0 : 1, borderBottomColor: p.border }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row gap={10}>
                <Text v="mono" semibold style={{ minWidth: 48 }}>{x.port}</Text>
                <Text>{x.service}</Text>
              </Row>
              <OkMark ok={x.ok} />
            </Row>
            <Text v="mono" tone="text2">{x.banner}</Text>
            {x.note ? <Text v="callout" tone="high">{x.note}</Text> : null}
          </View>
        ))}
      </Card>
      <Row gap={6} style={{ marginTop: space.sm }}>
        <Icon name="check" size={14} color={p.text3} strokeWidth={2} />
        <Text v="caption" tone="text3" num>{r.closed} ports closed</Text>
      </Row>

      <SectionHeader title="Scan" />
      <Card>
        <KV k="Scanned at" v={r.scannedAt} mono />
        <KV k="Ports probed" v="1,000 (top TCP)" mono />
        <KV k="Method" v="TCP connect, no payload" />
      </Card>

      <ToolActions module="ASM" pairLabel="Pair to monitor" report={report} onReset={onReset} />
    </>
  );
}
