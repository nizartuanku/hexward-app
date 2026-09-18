import React, { useRef, useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, IconButton, ProductTag, Row, Screen, Tag } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { moduleName, productBySlug, tutorials } from '@/data/sample';
import { LINKS } from '@/config';

/** Product → the in-app tool that lets you try the tutorial without an instance. */
const TRY_TOOL: Record<string, { href: '/(tabs)/tools/rulelint' | '/(tabs)/tools/mail' | '/(tabs)/tools/cert'; label: string }> = {
  rulehawk: { href: '/(tabs)/tools/rulelint', label: 'Open Rule Lint' },
  dmarcwatch: { href: '/(tabs)/tools/mail', label: 'Open Mail Auth' },
  certlight: { href: '/(tabs)/tools/cert', label: 'Open Cert Check' },
};

/** 34 Tutorial reader — numbered steps with copyable commands, a sticky Next/Done bar and a "Try it" card. */
export default function TutorialReader() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { current } = useApp();
  const { toast, openExternal } = useToast();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const offsets = useRef<number[]>([]);

  const tutorial = tutorials.find((t) => t.slug === slug);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/learn'));

  if (!tutorial) {
    return (
      <Screen scroll={false} padded={false}>
        <TopBar back="Learn" title="Tutorial" />
        <EmptyState icon="book" title="Tutorial not found" body="This tutorial may have moved. Browse the Learn tab for the current list." action="Back to Learn" onAction={goBack} />
      </Screen>
    );
  }

  const total = tutorial.steps.length;
  const product = productBySlug(tutorial.product);
  const tryTool = TRY_TOOL[tutorial.product];
  const last = step >= total - 1;

  const scrollToStep = (i: number) => {
    const y = offsets.current[i];
    if (typeof y === 'number') scroller.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };
  const goTo = (i: number) => { setStep(i); scrollToStep(i); };
  const next = () => {
    if (last) { setDone(true); toast('Tutorial complete'); scroller.current?.scrollToEnd({ animated: true }); return; }
    goTo(step + 1);
  };
  const toggleSave = () => { const on = !saved; setSaved(on); toast(on ? 'Saved for offline' : 'Removed'); };
  const share = () => { Share.share({ message: `${tutorial.title} — ${LINKS.web}/learn/${tutorial.slug}` }).catch(() => toast('Could not open the share sheet')); };
  const copy = async (code: string) => { try { await Clipboard.setStringAsync(code); toast('Copied'); } catch { toast('Could not copy'); } };
  const tryIt = () => {
    if (tryTool) router.push(tryTool.href);
    else router.push({ pathname: '/(tabs)/products/[slug]', params: { slug: tutorial.product } });
  };
  const dashboardUrl = current ? `${current.url}/${tutorial.product}` : (product?.web ?? LINKS.web);

  return (
    <Screen scroll={false} padded={false}>
      <TopBar back="Learn" title="Tutorial" actions={[
        { icon: 'bookmark', label: saved ? 'Remove from offline' : 'Save for offline', onPress: toggleSave },
        { icon: 'share', label: 'Share tutorial', onPress: share },
      ]} />
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.lg }}>
        <Row gap={10} style={{ marginTop: 4 }}>
          <ProductTag icon={productIcon[tutorial.product] ?? 'products'} name={moduleName(tutorial.product)} />
          <Text v="caption" tone="text3">·</Text>
          <Text v="caption" tone="text2" num>{tutorial.minutes} min</Text>
          {saved ? <Tag label="Saved" tone="ok" /> : null}
        </Row>
        <Text v="title" style={{ marginTop: 8 }}>{tutorial.title}</Text>
        <Row gap={8} style={{ marginTop: 12 }}>
          <Text v="caption" tone="text2" num>{done ? 'Complete' : `Step ${step + 1} of ${total}`}</Text>
          <View style={{ flex: 1, flexDirection: 'row', gap: 4 }} accessibilityLabel={`Step ${step + 1} of ${total}`}>
            {tutorial.steps.map((_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step || done ? p.accent : p.surface2 }} />)}
          </View>
        </Row>

        {tutorial.steps.map((s, i) => {
          const active = i === step && !done;
          const complete = i < step || done;
          return (
            <View key={s.heading} onLayout={(e) => { offsets.current[i] = e.nativeEvent.layout.y; }} style={{ marginTop: space.md }}>
              <Card onPress={() => goTo(i)} accessibilityLabel={`Step ${i + 1}: ${s.heading}`} style={{ borderColor: active ? p.accent : p.border, backgroundColor: active ? p.surface : p.bg }}>
                <Row gap={10} style={{ alignItems: 'flex-start' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? p.accent : complete ? p.lowSoft : p.surface2 }}>
                    {complete ? <Icon name="check" size={16} color={p.ok} strokeWidth={2} /> : <Text v="caption" semibold num style={{ color: active ? p.onAccent : p.text2 }}>{i + 1}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text v="headline">{s.heading}</Text>
                    <Text v="callout" tone={active ? 'text' : 'text2'} style={{ marginTop: 4 }}>{s.body}</Text>
                  </View>
                </Row>
                {s.code ? (
                  <View style={{ marginTop: 12, backgroundColor: p.surface2, borderRadius: radius.tag, borderWidth: 1, borderColor: p.border, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 2 }}>
                    <Text v="mono" selectable style={{ flex: 1, paddingVertical: 10 }}>{s.code}</Text>
                    <IconButton name="copy" label={`Copy command for step ${i + 1}`} color={p.accent} onPress={() => { void copy(s.code ?? ''); }} />
                  </View>
                ) : null}
              </Card>
            </View>
          );
        })}

        <Card style={{ marginTop: space.lg, borderColor: done ? p.accent : p.border }}>
          <Row gap={8}><Icon name="tools" color={p.accent} /><Text v="headline">Try it</Text></Row>
          <Text v="callout" tone="text2" style={{ marginTop: 6 }}>
            {tryTool ? `Run the same check on a sample without pairing an instance. ${moduleName(tutorial.product)} does the full audit on your own server.` : `See what ${moduleName(tutorial.product)} does and where to get it.`}
          </Text>
          <Button title={tryTool ? tryTool.label : `About ${moduleName(tutorial.product)}`} icon="arrowRight" onPress={tryIt} style={{ marginTop: 12 }} accessibilityLabel={tryTool ? tryTool.label : `Open ${moduleName(tutorial.product)} product page`} />
          <Button title="Open in dashboard" kind="secondary" icon="external" onPress={() => openExternal(dashboardUrl, `${moduleName(tutorial.product)} dashboard`)} style={{ marginTop: 8 }} />
        </Card>
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: space.md, paddingVertical: 10, borderTopWidth: 1, borderTopColor: p.border, backgroundColor: p.bg }}>
        <Button title="Previous" kind="secondary" disabled={step === 0 && !done} onPress={() => { if (done) { setDone(false); goTo(total - 1); } else goTo(step - 1); }} style={{ flex: 1 }} />
        <Button title={done ? 'Back to Learn' : last ? 'Done' : 'Next step'} icon={done ? undefined : last ? 'check' : 'arrowRight'} onPress={done ? goBack : next} style={{ flex: 2 }} />
      </View>
    </Screen>
  );
}
