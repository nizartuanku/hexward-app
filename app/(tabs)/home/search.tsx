import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { fonts, radius, space, severityColors } from '@/theme/tokens';
import { Icon, productIcon, severityIcon, type IconName } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Card, Chip, EmptyState, ListRow, Row, Screen, SectionHeader } from '@/components/Primitives';
import { VideoThumb } from '@/components/Blocks';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { allProducts, findings, moduleName, tutorials, videos } from '@/data/sample';

const RECENT = ['dmarc', 'any/any', 'vpn.example.com', 'TopoLight', 'cert'];

type ToolKey = 'cert' | 'mail' | 'exposure' | 'rulelint';
const TOOLS: { key: ToolKey; name: string; desc: string; icon: IconName; href: `/(tabs)/tools/${ToolKey}` }[] = [
  { key: 'cert', name: 'Cert Check', desc: 'TLS certificate, chain and expiry', icon: 'lock', href: '/(tabs)/tools/cert' },
  { key: 'mail', name: 'Mail Auth', desc: 'SPF, DKIM and DMARC for a domain', icon: 'mail', href: '/(tabs)/tools/mail' },
  { key: 'exposure', name: 'Exposure', desc: 'Open ports on a public host', icon: 'globe', href: '/(tabs)/tools/exposure' },
  { key: 'rulelint', name: 'Rule Lint', desc: 'Paste a ruleset, get shadowed and any/any rules', icon: 'sliders', href: '/(tabs)/tools/rulelint' },
];

const has = (q: string, ...fields: (string | undefined)[]) => fields.some((f) => (f ?? '').toLowerCase().includes(q));

/** 10 Global search — one field over the paired instance, the catalog, tutorials, videos and tools. */
export default function Search() {
  const { p, body } = useTheme();
  const router = useRouter();
  const { current, paired } = useApp();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const res = useMemo(() => {
    if (!q) return null;
    return {
      findings: paired ? findings.filter((f) => has(q, f.title, f.module, moduleName(f.module), f.host, f.summary)).slice(0, 6) : [],
      products: allProducts.filter((pr) => has(q, pr.name, pr.slug, pr.tagline, pr.category)).slice(0, 6),
      tutorials: tutorials.filter((t) => has(q, t.title, t.product, moduleName(t.product))).slice(0, 6),
      videos: videos.filter((v) => has(q, v.title, v.product, v.series, ...v.transcript)).slice(0, 6),
      tools: TOOLS.filter((t) => has(q, t.name, t.key, t.desc)),
    };
  }, [q, paired]);
  const total = res ? res.findings.length + res.products.length + res.tutorials.length + res.videos.length + res.tools.length : 0;

  return (
    <Screen tabbed padded={false} keyboardDismissMode="on-drag">
      <TopBar title="Search" back="Cancel" />
      <View style={{ paddingHorizontal: space.md }}>
        <Row gap={8} style={{ height: 44, borderRadius: radius.card, backgroundColor: p.surface2, paddingHorizontal: 12, borderWidth: 1, borderColor: p.border }}>
          <Icon name="search" size={18} color={p.text3} />
          <TextInput
            accessibilityLabel="Search"
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Findings, products, tutorials, videos, tools"
            placeholderTextColor={p.text3}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, height: 44, color: p.text, fontSize: body, fontFamily: fonts.regular }}
          />
          {query ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={16} color={p.text3} />
            </Pressable>
          ) : null}
        </Row>

        {!res ? (
          <>
            <SectionHeader title="Recent" />
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {RECENT.map((r) => <Chip key={r} label={r} icon="clock" onPress={() => setQuery(r)} />)}
            </Row>
            <Text v="caption" tone="text3" style={{ marginTop: space.lg }}>
              Searches stay on this phone. {paired ? `Findings come from ${current?.nickname ?? 'your instance'}.` : 'Pair an instance to search its findings too.'}
            </Text>
          </>
        ) : total === 0 ? (
          <EmptyState icon="search" title="No results" body={`Nothing matches “${query.trim()}” across ${paired ? `${current?.nickname ?? 'your instance'}, ` : ''}the catalog, tutorials, videos and tools.`} action="Clear search" onAction={() => setQuery('')} />
        ) : (
          <>
            <Text v="caption" tone="text3" style={{ marginTop: space.sm }}>{total} {total === 1 ? 'result' : 'results'} across {paired ? `${current?.nickname ?? 'your instance'}, ` : ''}docs, videos and the catalog</Text>

            {res.findings.length ? (
              <>
                <SectionHeader title={`Findings · ${res.findings.length}`} />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {res.findings.map((f, i) => (
                    <ListRow key={f.id} title={f.title} subtitle={`${f.severity.charAt(0).toUpperCase() + f.severity.slice(1)} · ${moduleName(f.module)} · ${f.age}`} last={i === res.findings.length - 1}
                      left={<Icon name={severityIcon[f.severity]} color={severityColors(p, f.severity).fg} strokeWidth={2} />}
                      onPress={() => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id: f.id } })} />
                  ))}
                </Card>
              </>
            ) : null}

            {res.products.length ? (
              <>
                <SectionHeader title={`Products · ${res.products.length}`} />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {res.products.map((pr, i) => (
                    <ListRow key={pr.slug} title={pr.name} subtitle={`${pr.tagline} · ${pr.version}`} last={i === res.products.length - 1}
                      left={<Icon name={productIcon[pr.slug] ?? 'nibble'} size={22} color={p.text} />}
                      onPress={() => router.push({ pathname: '/(tabs)/products/[slug]', params: { slug: pr.slug } })} />
                  ))}
                </Card>
              </>
            ) : null}

            {res.tutorials.length ? (
              <>
                <SectionHeader title={`Tutorials · ${res.tutorials.length}`} />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {res.tutorials.map((t, i) => (
                    <ListRow key={t.slug} title={t.title} subtitle={`Tutorial · ${moduleName(t.product)} · ${t.minutes} min`} last={i === res.tutorials.length - 1}
                      left={<Icon name="book" size={22} color={p.accent} />}
                      onPress={() => router.push({ pathname: '/(tabs)/learn/tutorial/[slug]', params: { slug: t.slug } })} />
                  ))}
                </Card>
              </>
            ) : null}

            {res.videos.length ? (
              <>
                <SectionHeader title={`Videos · ${res.videos.length}`} />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {res.videos.map((v, i) => (
                    <ListRow key={v.id} title={v.title} subtitle={`${v.series} · ${v.duration}${v.product ? ` · ${moduleName(v.product)}` : ''}`} last={i === res.videos.length - 1}
                      left={<VideoThumb duration={v.duration} small />}
                      onPress={() => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id: v.id } })} />
                  ))}
                </Card>
              </>
            ) : null}

            {res.tools.length ? (
              <>
                <SectionHeader title={`Tools · ${res.tools.length}`} />
                <Card padded={false} style={{ paddingHorizontal: space.md }}>
                  {res.tools.map((t, i) => (
                    <ListRow key={t.key} title={t.name} subtitle={t.desc} last={i === res.tools.length - 1}
                      left={<Icon name={t.icon} size={22} color={p.accent} />}
                      onPress={() => router.push(t.href)} />
                  ))}
                </Card>
              </>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}
