import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Icon, productIcon, type IconName } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Chip, EmptyState, ListRow, ProductTag, Row, Screen, SectionHeader, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useToast } from '@/state/Toast';
import { moduleName, tutorials } from '@/data/sample';
import { LINKS } from '@/config';

/** Guides are long-form reads built from the sample tutorials (KIT §6). */
const GUIDES: Record<string, { title: string; level: string; intro: string; related: string; callouts: Record<number, { kind: 'Note' | 'Warning'; text: string }> }> = {
  'migrate-asa-ftd': {
    title: 'Migrate ASA to FTD without losing intent',
    level: 'Advanced',
    intro: 'A cut-over fails when the converted policy behaves differently from the ASA it replaces. This guide keeps both firewalls live, converts with RuleForge, and proves parity with RuleHawk before you move traffic.',
    related: 'rulehawk-first-audit',
    callouts: {
      0: { kind: 'Note', text: 'Migrating dead rules costs twice: once to convert, once to review. Audit first.' },
      2: { kind: 'Warning', text: 'Keep the ASA live until RuleHawk shows parity between both policies. The audit is the evidence you move traffic on.' },
    },
  },
  'read-dmarc-report': {
    title: 'Read a DMARC report',
    level: 'Start',
    intro: 'Receivers send RUA XML daily to the address in your DMARC record. This guide shows what to read in it and when the numbers say you can tighten the policy.',
    related: 'rulehawk-first-audit',
    callouts: {
      1: { kind: 'Note', text: 'The two columns that matter are SPF alignment and DKIM alignment, not the raw pass/fail.' },
      2: { kind: 'Warning', text: 'Move to p=quarantine only after two weeks above 98% aligned. Start with pct=25, then raise.' },
    },
  },
};

/** 35 Guide detail — long-form reading layout with contents chips, callouts and a related tutorial. */
export default function GuideDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { openExternal } = useToast();
  const [active, setActive] = useState(0);
  const scroller = useRef<ScrollView>(null);
  const offsets = useRef<number[]>([]);

  const key = slug ?? '';
  const tutorial = tutorials.find((t) => t.slug === key);
  const guide = GUIDES[key];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/learn'));

  if (!tutorial || !guide) {
    return (
      <Screen scroll={false} padded={false}>
        <TopBar back="Learn" title="Guide" />
        <EmptyState icon="book" title="Guide not found" body="This guide may have moved. Browse the Learn tab for the current list." action="Back to Learn" onAction={goBack} />
      </Screen>
    );
  }

  const sections = tutorial.steps;
  const related = tutorials.find((t) => t.slug === guide.related && t.slug !== tutorial.slug) ?? tutorials.find((t) => t.slug !== tutorial.slug);
  const jump = (i: number) => {
    setActive(i);
    const y = offsets.current[i];
    if (typeof y === 'number') scroller.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };
  const webUrl = `${LINKS.web}/guides/${tutorial.slug}`;

  return (
    <Screen scroll={false} padded={false}>
      <TopBar back="Learn" title="Guide" actions={[{ icon: 'external', label: 'Open on the web', onPress: () => openExternal(webUrl, 'Hexward Labs website') }]} />
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.lg }}>
        <Row gap={10} style={{ marginTop: 4 }}>
          <Tag label={guide.level} tone="accent" />
          <ProductTag icon={productIcon[tutorial.product] ?? 'products'} name={moduleName(tutorial.product)} />
        </Row>
        <Text v="title" style={{ marginTop: 10 }}>{guide.title}</Text>
        <Text v="caption" tone="text2" style={{ marginTop: 4 }} num>{tutorial.minutes} min read · {sections.length} sections</Text>

        <SectionHeader title={`Contents · ${sections.length} sections`} style={{ marginTop: space.md }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: space.md }}>
          {sections.map((s, i) => <Chip key={s.heading} label={`${i + 1}. ${s.heading}`} selected={active === i} onPress={() => jump(i)} />)}
        </ScrollView>

        <Text style={{ marginTop: space.lg }}>{guide.intro}</Text>

        {sections.map((s, i) => {
          const callout = guide.callouts[i];
          return (
            <View key={s.heading} onLayout={(e) => { offsets.current[i] = e.nativeEvent.layout.y; }} style={{ marginTop: space.lg }}>
              <Text v="headline" style={{ color: active === i ? p.accent : p.text }}>{i + 1}. {s.heading}</Text>
              <Text style={{ marginTop: 8 }}>{s.body}</Text>
              {s.code ? (
                <View style={{ marginTop: 10, backgroundColor: p.surface2, borderRadius: radius.tag, borderWidth: 1, borderColor: p.border, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text v="mono" selectable>{s.code}</Text>
                </View>
              ) : null}
              {callout ? <Callout kind={callout.kind} text={callout.text} /> : null}
            </View>
          );
        })}

        {related ? (
          <>
            <SectionHeader title="Related tutorial" />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              <ListRow title={related.title} subtitle={`${moduleName(related.product)} · ${related.minutes} min · ${related.steps.length} steps`} last
                left={<Icon name={productIcon[related.product] ?? 'book'} color={p.text2} />}
                onPress={() => router.push({ pathname: '/(tabs)/learn/tutorial/[slug]', params: { slug: related.slug } })} />
            </Card>
          </>
        ) : null}

        <Button title="Open on the web" kind="secondary" icon="external" onPress={() => openExternal(webUrl, 'Hexward Labs website')} style={{ marginTop: space.lg }} />
      </ScrollView>
    </Screen>
  );
}

function Callout({ kind, text }: { kind: 'Note' | 'Warning'; text: string }) {
  const { p } = useTheme();
  const warn = kind === 'Warning';
  const icon: IconName = warn ? 'sevHigh' : 'sevInfo';
  const fg = warn ? p.high : p.text2;
  return (
    <View accessibilityLabel={`${kind}: ${text}`} style={{ marginTop: 12, flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.card, backgroundColor: warn ? p.highSoft : p.surface2, borderWidth: 1, borderColor: warn ? p.high : p.border }}>
      <Icon name={icon} size={18} color={fg} strokeWidth={2} />
      <View style={{ flex: 1 }}>
        <Text v="label" style={{ color: fg }}>{kind}</Text>
        <Text v="callout" style={{ marginTop: 2 }}>{text}</Text>
      </View>
    </View>
  );
}
