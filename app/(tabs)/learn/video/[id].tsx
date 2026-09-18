import React, { useEffect, useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { palettes, radius, space } from '@/theme/tokens';
import { Icon, productIcon, type IconName } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, ListRow, Row, Screen, SectionHeader } from '@/components/Primitives';
import { VideoThumb } from '@/components/Blocks';
import { TopBar } from '@/components/Chrome';
import { useToast } from '@/state/Toast';
import { moduleName, productBySlug, videos } from '@/data/sample';
import { LINKS } from '@/config';

const toSeconds = (d: string) => d.split(':').reduce((acc, part) => acc * 60 + Number(part), 0);
/** The player is dark on both schemes, so it reads from the dark palette rather than the live one. */
const dark = palettes.dark;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** 37 Video player / 51 video unavailable — abstract player box (never people), transcript, related product, up next. */
export default function VideoPlayer() {
  const { id, unavailable } = useLocalSearchParams<{ id: string; unavailable?: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { toast, openExternal } = useToast();
  const video = videos.find((v) => v.id === id);
  const broken = !video || unavailable === '1';
  const total = video ? toSeconds(video.duration) : 0;

  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [captions, setCaptions] = useState(false);
  const [transcript, setTranscript] = useState(false);

  useEffect(() => { setPlaying(false); setPos(0); setTranscript(false); }, [id]);
  useEffect(() => {
    if (!playing || broken) return;
    const t = setInterval(() => setPos((v) => (v + 1 >= total ? total : v + 1)), 1000);
    return () => clearInterval(t);
  }, [playing, broken, total]);
  useEffect(() => { if (total > 0 && pos >= total) setPlaying(false); }, [pos, total]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/learn/videos'));
  const webUrl = `${LINKS.web}/videos/${id ?? ''}`;
  const share = () => { if (!video) return; Share.share({ message: `${video.title} — ${webUrl}` }).catch(() => toast('Could not open the share sheet')); };
  const seek = (delta: number) => setPos((v) => Math.min(total, Math.max(0, v + delta)));
  const upNext = videos.filter((v) => v.id !== id);
  const product = video?.product ? productBySlug(video.product) : undefined;
  const nextShort = video?.short ? videos.find((v) => v.short && v.id !== video.id) ?? upNext[0] : undefined;

  if (broken) {
    return (
      <Screen padded={false}>
        <TopBar back="Videos" title="Video" />
        <View style={{ paddingHorizontal: space.md }}>
          <View style={{ aspectRatio: 16 / 9, borderRadius: radius.card, backgroundColor: dark.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: p.border }}>
            <Icon name="wifiOff" size={32} color={dark.text3} />
          </View>
          <Card style={{ marginTop: space.md }}>
            <Row gap={8}><Icon name="sevMedium" color={p.medium} strokeWidth={2} /><Text v="headline">This video is unavailable</Text></Row>
            <Text v="callout" tone="text2" style={{ marginTop: 6 }}>It may have been removed or your connection is blocked. Try again or open on the web.</Text>
            <Button title="Retry" icon="refresh" onPress={() => toast('Still unavailable — try again in a moment')} style={{ marginTop: 14 }} />
            <Button title="Open on the web" kind="secondary" icon="external" onPress={() => openExternal(webUrl, 'Hexward Labs website')} style={{ marginTop: 8 }} />
            <Button title="Back to videos" kind="ghost" onPress={goBack} style={{ marginTop: 4 }} />
          </Card>
        </View>
      </Screen>
    );
  }

  const progress = total > 0 ? pos / total : 0;
  const ctrl = (name: IconName | 'pause', label: string, onPress: () => void, extra?: string, on?: boolean) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={on === undefined ? undefined : { selected: on }} onPress={onPress} hitSlop={4}
      style={({ pressed }) => ({ minWidth: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, backgroundColor: pressed ? dark.surface2 : on ? dark.accentSoft : 'transparent' })}>
      {name === 'pause' ? <PauseGlyph small /> : <Icon name={name} size={22} color={on ? dark.accent : dark.text} />}
      {extra ? <Text v="caption" style={{ color: on ? dark.accent : dark.text2, fontSize: 10, lineHeight: 12 }} semibold>{extra}</Text> : null}
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <TopBar back="Videos" title={video.short ? 'Short' : 'Video'} actions={[{ icon: 'share', label: 'Share video', onPress: share }]} />
      <View style={{ paddingHorizontal: space.md }}>
        {/* Player box — dark on both schemes, so the literal player palette is intended here. */}
        <View style={{ borderRadius: radius.card, backgroundColor: dark.bg, overflow: 'hidden', borderWidth: 1, borderColor: p.border }}>
          <Pressable accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'} onPress={() => setPlaying(!playing)}
            style={video.short ? { aspectRatio: 9 / 16, maxHeight: 420, alignSelf: 'center', width: '60%' } : { aspectRatio: 16 / 9 }}>
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: dark.surface2, justifyContent: 'center' }}>
              <VideoThumb duration={video.duration} wide />
            </View>
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,15,20,0.45)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(11,15,20,0.75)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                {playing ? <PauseGlyph /> : <Icon name="play" size={30} color={dark.text} />}
              </View>
              {captions ? (
                <View style={{ position: 'absolute', bottom: 10, backgroundColor: 'rgba(11,15,20,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '85%' }}>
                  <Text v="caption" style={{ color: dark.text }} numberOfLines={2}>{video.transcript[Math.min(video.transcript.length - 1, Math.floor(progress * video.transcript.length))]}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
          <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
            <View accessibilityLabel={`${fmt(pos)} of ${fmt(total)}`} style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
              <View style={{ width: `${Math.round(progress * 100)}%`, height: 4, backgroundColor: dark.accent }} />
            </View>
            <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <Text v="mono" style={{ color: dark.text, fontSize: 13 }}>{fmt(pos)}</Text>
              <Text v="mono" style={{ color: dark.text2, fontSize: 13 }}>{fmt(total)}</Text>
            </Row>
          </View>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 8 }}>
            {ctrl('refresh', 'Back 10 seconds', () => seek(-10), '−10 s')}
            {ctrl(playing ? 'pause' : 'play', playing ? 'Pause' : 'Play', () => setPlaying(!playing))}
            {ctrl('refresh', 'Forward 10 seconds', () => seek(10), '+10 s')}
            {ctrl('keyboard', captions ? 'Captions on' : 'Captions off', () => setCaptions(!captions), captions ? 'CC on' : 'CC off', captions)}
            {ctrl('external', 'Picture in picture', () => toast('Picture in picture is not available in this build'), 'PiP')}
            {ctrl('share', 'Share video', share)}
          </Row>
        </View>

        {video.short ? (
          <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
            <Text v="caption" tone="text3">Swipe up for the next short</Text>
            {nextShort ? <Button small kind="secondary" title="Next" icon="arrowRight" onPress={() => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id: nextShort.id } })} /> : null}
          </Row>
        ) : null}

        <Text v="title" style={{ marginTop: space.md }}>{video.title}</Text>
        <Text v="caption" tone="text2" style={{ marginTop: 4 }} num>{video.series.replace(/s$/, '')} · {video.duration}{captions ? ' · Captions on' : ''}</Text>

        {product ? (
          <>
            <SectionHeader title="Related product" />
            <Card padded={false} style={{ paddingHorizontal: space.md }}>
              <ListRow title={product.name} subtitle={product.tagline} last
                left={<Icon name={productIcon[product.slug] ?? 'products'} color={p.text} />}
                onPress={() => router.push({ pathname: '/(tabs)/products/[slug]', params: { slug: product.slug } })} />
            </Card>
          </>
        ) : null}

        <Card style={{ marginTop: space.lg }} padded={false}>
          <Pressable accessibilityRole="button" accessibilityLabel={transcript ? 'Hide transcript' : 'Show transcript'} accessibilityState={{ expanded: transcript }} onPress={() => setTranscript(!transcript)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: space.md }}>
            <Row gap={8}><Icon name="book" size={20} color={p.text2} /><Text v="headline">Transcript</Text></Row>
            <Icon name={transcript ? 'chevronDown' : 'chevronRight'} size={20} color={p.text3} />
          </Pressable>
          {transcript ? (
            <View style={{ paddingHorizontal: space.md, paddingBottom: space.md, gap: 8 }}>
              {video.transcript.map((line, i) => (
                <Row key={i} gap={10} style={{ alignItems: 'flex-start' }}>
                  <Text v="mono" tone="text3" style={{ fontSize: 13, width: 40 }}>{fmt(Math.floor((total / video.transcript.length) * i))}</Text>
                  <Text v="callout" style={{ flex: 1 }}>{line}</Text>
                </Row>
              ))}
            </View>
          ) : null}
        </Card>

        <SectionHeader title="Up next" />
        <Card padded={false} style={{ paddingHorizontal: space.md }}>
          {upNext.map((v, i) => (
            <ListRow key={v.id} title={v.title} last={i === upNext.length - 1}
              subtitle={`${v.short ? 'Short' : v.series.replace(/s$/, '')}${v.product ? ` · ${moduleName(v.product)}` : ''}`}
              left={<VideoThumb duration={v.duration} small />}
              onPress={() => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id: v.id } })} />
          ))}
        </Card>
      </View>
    </Screen>
  );
}

function PauseGlyph({ small }: { small?: boolean }) {
  const w = small ? 5 : 7; const h = small ? 18 : 26;
  return (
    <View style={{ flexDirection: 'row', gap: small ? 4 : 6 }}>
      <View style={{ width: w, height: h, borderRadius: 2, backgroundColor: dark.text }} />
      <View style={{ width: w, height: h, borderRadius: 2, backgroundColor: dark.text }} />
    </View>
  );
}
