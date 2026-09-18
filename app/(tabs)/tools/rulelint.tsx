import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space, severityColors, type Severity } from '@/theme/tokens';
import { Icon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, Row, Screen, SectionHeader, Segmented, SeverityPill, StatTile } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { RAN_CAPTION, RanOn, ResultSkeleton, ToolInput, useCopyReport, useToolRun } from '@/components/Tools';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { ruleLintResult } from '@/data/sample';

type Vendor = 'auto' | 'asa' | 'iptables' | 'panos';
const VENDORS: { key: Vendor; label: string }[] = [
  { key: 'auto', label: 'Auto' }, { key: 'asa', label: 'ASA' }, { key: 'iptables', label: 'iptables' }, { key: 'panos', label: 'PAN-OS' },
];
const vendorLabel = (v: Vendor) => VENDORS.find((x) => x.key === v)?.label ?? v;

/** A ruleset is recognisable when at least one line carries a rule keyword. */
const RULE_RE = /\b(permit|deny|accept|drop|reject)\b|(^|\s)-A\s/im;
const parseable = (s: string) => s.trim().length > 0 && RULE_RE.test(s);
const detectVendor = (s: string): Exclude<Vendor, 'auto'> | null => {
  if (/^\s*access-list\b/m.test(s)) return 'asa';
  if (/(^|\s)-A\s/m.test(s)) return 'iptables';
  if (/\bset (rulebase|security rules)\b|\bfrom\s+\S+\s+to\s+\S+/m.test(s)) return 'panos';
  return null;
};
const ruleLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

type Issue = (typeof ruleLintResult.issues)[number];
interface LintOutcome { ok: boolean; vendor: Exclude<Vendor, 'auto'> | null; rules: number; issues: Issue[]; }

/** 32 Rule Lint / 51b unparseable input. Paste a firewall snippet; dead and dangerous rules are found on the phone. */
export default function RuleLint() {
  const { p } = useTheme();
  const router = useRouter();
  const { paired, current } = useApp();
  const { toast } = useToast();
  const copy = useCopyReport();
  const [input, setInput] = useState('');
  const [vendor, setVendor] = useState<Vendor>('auto');
  const [outcome, setOutcome] = useState<LintOutcome | null>(null);
  const { phase, run, reset } = useToolRun();

  const lint = (text = input) => {
    if (!parseable(text)) { run(() => setOutcome({ ok: false, vendor: null, rules: 0, issues: [] })); return; }
    const rules = ruleLines(text).length;
    const detected = vendor === 'auto' ? detectVendor(text) : vendor;
    // Results come from the sample; issues beyond the pasted line count are dropped.
    const issues = ruleLintResult.issues.filter((i) => i.line <= rules);
    run(() => setOutcome({ ok: true, vendor: detected, rules, issues }));
  };
  const trySample = () => { setInput(ruleLintResult.input); setVendor('auto'); lint(ruleLintResult.input); };
  const again = () => { setOutcome(null); reset(); };
  const openRuleHawk = () => {
    if (paired) toast(`Uploaded to ${current?.nickname ?? 'hq-lab'} · RuleHawk`);
    else router.push({ pathname: '/(tabs)/products/[slug]', params: { slug: 'rulehawk' } });
  };

  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  outcome?.issues.forEach((i) => { counts[i.severity]++; });
  const report = outcome?.ok ? [
    `Rule Lint — ${outcome.vendor ? vendorLabel(outcome.vendor) : 'unknown vendor'} · ${outcome.rules} rules`, RAN_CAPTION, '',
    `${outcome.issues.length} findings`, ...outcome.issues.map((i) => `line ${i.line} · ${i.severity} · ${i.msg}`),
  ].join('\n') : '';

  return (
    <Screen tabbed padded={false}>
      <TopBar title="Rule Lint" back="Tools" />
      <View style={{ paddingHorizontal: space.md }}>
        {phase === 'input' ? (
          <>
            <Segmented options={VENDORS} value={vendor} onChange={setVendor} />
            <View style={{ marginTop: space.md }}>
              <ToolInput label="Ruleset" mono multiline value={input} onChangeText={setInput} placeholder={'access-list OUTSIDE_IN extended permit ip any any\n-A INPUT -p tcp --dport 22 -j ACCEPT'} textAlignVertical="top" style={{ minHeight: 180 }}
                hint={vendor === 'auto' ? `Detected automatically${detectVendor(input) ? ` · ${vendorLabel(detectVendor(input)!)}` : ''}. Runs on this phone; nothing is sent to Hexward Labs.` : `Parsed as ${vendorLabel(vendor)}. Runs on this phone; nothing is sent to Hexward Labs.`} />
            </View>
            <Row gap={8} style={{ marginTop: space.sm, flexWrap: 'wrap' }}>
              <Chip label="Paste sample" icon="copy" onPress={() => setInput(ruleLintResult.input)} />
              {input ? <Chip label="Clear" icon="x" onPress={() => setInput('')} /> : null}
            </Row>
            <Button title="Lint" icon="sliders" disabled={!input.trim()} onPress={() => lint()} style={{ marginTop: space.lg }} />
          </>
        ) : null}

        {phase === 'loading' ? (
          <>
            <Text v="callout" tone="text2" style={{ marginTop: space.md }}>Linting {ruleLines(input).length} lines …</Text>
            <ResultSkeleton />
          </>
        ) : null}

        {phase === 'result' && outcome && !outcome.ok ? (
          <>
            <Card style={{ marginTop: space.md, borderColor: p.critical }}>
              <Row gap={8}><Icon name={severityIcon.critical} color={p.critical} strokeWidth={2} /><Text v="title" style={{ flex: 1 }}>Unparseable input</Text></Row>
              <Text v="callout" tone="text2" style={{ marginTop: 8 }}>Paste a ruleset exported from the firewall, not a screenshot or a summary.</Text>
              <Text v="caption" tone="text3" style={{ marginTop: 8 }}>Nothing was sent to an instance.</Text>
              <Button title="Try sample" icon="copy" onPress={trySample} style={{ marginTop: space.md }} />
              <Button title="Edit input" kind="secondary" onPress={again} style={{ marginTop: 8 }} />
            </Card>
            <RanOn />
          </>
        ) : null}

        {phase === 'result' && outcome && outcome.ok ? (
          <>
            <Card style={{ marginTop: space.md }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text v="mono" tone="text2">{outcome.vendor ? vendorLabel(outcome.vendor) : 'Unknown vendor'} · {outcome.rules} rules</Text>
                {outcome.issues.length ? <SeverityPill s={worstOf(outcome.issues)} /> : <Row gap={6}><Icon name="check" size={16} color={p.ok} strokeWidth={2} /><Text v="caption" semibold style={{ color: p.ok }}>Clean</Text></Row>}
              </Row>
              <Text v="title" style={{ marginTop: 8 }}>{outcome.issues.length ? `${outcome.issues.length} findings` : 'No dead or dangerous rules found'}</Text>
              <RanOn />
            </Card>

            <Row gap={8} style={{ marginTop: space.md, alignItems: 'stretch' }}>
              <StatTile label="Rules" value={outcome.rules} />
              <StatTile label="Critical" value={counts.critical} tone={counts.critical ? 'critical' : 'text'} />
              <StatTile label="High" value={counts.high} tone={counts.high ? 'high' : 'text'} />
              <StatTile label="Other" value={counts.medium + counts.low + counts.info} />
            </Row>

            {outcome.issues.length ? (
              <>
                <SectionHeader title="Findings" />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {outcome.issues.map((i, idx) => (
                    <View key={`${i.line}-${idx}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderBottomWidth: idx === outcome.issues.length - 1 ? 0 : 1, borderBottomColor: p.border }}>
                      <Text v="mono" tone="text3" style={{ minWidth: 28, textAlign: 'right' }}>{i.line}</Text>
                      <View style={{ flex: 1, gap: 6 }}>
                        <Text>{i.msg}</Text>
                        <Text v="mono" tone="text2" numberOfLines={2}>{ruleLines(input)[i.line - 1] ?? ''}</Text>
                        <Row gap={6}>
                          <Icon name={severityIcon[i.severity]} size={14} color={severityColors(p, i.severity).fg} strokeWidth={2} />
                          <Text v="caption" semibold style={{ color: severityColors(p, i.severity).fg }}>{i.severity.charAt(0).toUpperCase() + i.severity.slice(1)}</Text>
                        </Row>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            <View style={{ gap: 10, marginTop: space.lg }}>
              <Button title="Open in RuleHawk" icon="rulehawk" onPress={openRuleHawk} />
              <Button title="Copy report" kind="secondary" icon="copy" onPress={() => { void copy(report); }} />
              <Button title="Lint another" kind="ghost" onPress={again} />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
function worstOf(issues: Issue[]): Severity {
  return ORDER.find((s) => issues.some((i) => i.severity === s)) ?? 'info';
}
