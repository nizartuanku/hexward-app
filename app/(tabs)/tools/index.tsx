import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space, severityColors } from '@/theme/tokens';
import { Icon, severityIcon, type IconName } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, EmptyState, ListRow, Row, Screen, SectionHeader } from '@/components/Primitives';
import { Sheet, TopBar } from '@/components/Chrome';
import { toolHistory } from '@/data/sample';

type ToolKey = 'cert' | 'mail' | 'exposure' | 'rulelint';
const TOOLS: { key: ToolKey; name: string; desc: string; icon: IconName; href: '/(tabs)/tools/cert' | '/(tabs)/tools/mail' | '/(tabs)/tools/exposure' | '/(tabs)/tools/rulelint' }[] = [
  { key: 'cert', name: 'Cert Check', desc: 'TLS certificate and chain for a host', icon: 'lock', href: '/(tabs)/tools/cert' },
  { key: 'mail', name: 'Mail Auth Check', desc: 'SPF, DKIM and DMARC for a domain', icon: 'mail', href: '/(tabs)/tools/mail' },
  { key: 'exposure', name: 'Exposure Check', desc: 'Reachability and security headers', icon: 'globe', href: '/(tabs)/tools/exposure' },
  { key: 'rulelint', name: 'Rule Lint', desc: 'Paste a firewall snippet, find dead rules', icon: 'sliders', href: '/(tabs)/tools/rulelint' },
];
const toolName = (key: string) => TOOLS.find((t) => t.key === key)?.name ?? key;

type HistoryItem = (typeof toolHistory)[number];

/** 27 Tools hub / 48c empty history. Pocket tools run on the phone; no instance needed (brief §9). */
export default function ToolsHub() {
  const { p, ios } = useTheme();
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(true);
  const [newCheck, setNewCheck] = useState(false);
  const history: HistoryItem[] = showHistory ? toolHistory : [];

  const openTool = (key: ToolKey) => { const t = TOOLS.find((x) => x.key === key)!; router.push(t.href); };
  const reopen = (h: HistoryItem) => {
    if (h.tool === 'cert') router.push({ pathname: '/(tabs)/tools/cert', params: { host: h.target } });
    else if (h.tool === 'mail') router.push({ pathname: '/(tabs)/tools/mail', params: { domain: h.target } });
    else if (h.tool === 'exposure') router.push({ pathname: '/(tabs)/tools/exposure', params: { target: h.target } });
    else router.push('/(tabs)/tools/rulelint');
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Screen tabbed padded={false}>
        <TopBar title="Tools" subtitle="Runs on this phone. No instance needed." />
        <View style={{ paddingHorizontal: space.md, gap: 10 }}>
          {TOOLS.map((t) => (
            <Card key={t.key} onPress={() => openTool(t.key)} accessibilityLabel={`${t.name} — ${t.desc}`}>
              <Row gap={12}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={t.icon} size={22} color={p.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text v="headline">{t.name}</Text>
                  <Text v="callout" tone="text2" numberOfLines={2}>{t.desc}</Text>
                </View>
                <Icon name="chevronRight" size={20} color={p.text3} />
              </Row>
            </Card>
          ))}
        </View>

        <View style={{ paddingHorizontal: space.md }}>
          <SectionHeader title="Recent checks" action={history.length ? 'Clear history' : undefined} onAction={() => setShowHistory(false)} />
          {history.length ? (
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              {history.map((h, i) => (
                <ListRow key={h.id} title={h.target} subtitle={`${toolName(h.tool)} · ${h.result}`} meta={h.age} last={i === history.length - 1}
                  left={<ToneIcon tone={h.tone} />} right={<ToneLabel tone={h.tone} />}
                  onPress={() => reopen(h)} />
              ))}
            </Card>
          ) : (
            <Card>
              <EmptyState icon="tools" title="No checks yet" body="Run your first check. Results stay on this phone." action="Run your first check" onAction={() => openTool('cert')} />
            </Card>
          )}
          <Text v="caption" tone="text3" center style={{ marginTop: space.lg }}>Runs on this phone. Nothing is sent to Hexward Labs.</Text>
        </View>
      </Screen>

      {!ios ? (
        <Pressable accessibilityRole="button" accessibilityLabel="New check" onPress={() => setNewCheck(true)}
          style={({ pressed }) => ({ position: 'absolute', right: space.md, bottom: space.md, width: 56, height: 56, borderRadius: radius.fab, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1, elevation: 4 })}>
          <Icon name="plus" color={p.onAccent} strokeWidth={2} />
        </Pressable>
      ) : null}
      <Sheet open={newCheck} onClose={() => setNewCheck(false)} title="New check">
        {TOOLS.map((t, i) => (
          <ListRow key={t.key} title={t.name} subtitle={t.desc} last={i === TOOLS.length - 1} left={<Icon name={t.icon} color={p.accent} />}
            onPress={() => { setNewCheck(false); openTool(t.key); }} />
        ))}
      </Sheet>
    </View>
  );
}

/** Result tone: icon + label, never colour alone. */
function ToneIcon({ tone }: { tone: HistoryItem['tone'] }) {
  const { p } = useTheme();
  if (tone === 'ok') return <Icon name="check" color={p.ok} strokeWidth={2} />;
  return <Icon name={severityIcon[tone]} color={severityColors(p, tone).fg} strokeWidth={2} />;
}
function ToneLabel({ tone }: { tone: HistoryItem['tone'] }) {
  const { p } = useTheme();
  const color = tone === 'ok' ? p.ok : severityColors(p, tone).fg;
  const label = tone === 'ok' ? 'OK' : tone === 'high' ? 'High' : 'Medium';
  return <Text v="caption" semibold style={{ color }}>{label}</Text>;
}
