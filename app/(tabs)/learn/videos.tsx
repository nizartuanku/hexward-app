import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Chip, ProductTag, Screen, SectionHeader } from '@/components/Primitives';
import { VideoThumb } from '@/components/Blocks';
import { TopBar } from '@/components/Chrome';
import { moduleName, videos, type Video } from '@/data/sample';

const SERIES = ['All', ...Array.from(new Set(videos.map((v) => v.series)))];
const WATCHED = ['v-003'];

/** 36 Video library — series chips, a shorts row and a two-column grid. Thumbs are abstract (never people). */
export default function VideoLibrary() {
  const router = useRouter();
  const [series, setSeries] = useState('All');
  const list = series === 'All' ? videos : videos.filter((v) => v.series === series);
  const shorts = videos.filter((v) => v.short);
  const grid = series === 'All' ? list.filter((v) => !v.short) : list;
  const open = (id: string) => router.push({ pathname: '/(tabs)/learn/video/[id]', params: { id } });

  return (
    <Screen padded={false}>
      <TopBar back="Learn" title="Videos" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 8 }}>
        {SERIES.map((s) => <Chip key={s} label={s} selected={series === s} onPress={() => setSeries(s)} />)}
      </ScrollView>

      {series === 'All' && shorts.length > 0 ? (
        <>
          <View style={{ paddingHorizontal: space.md }}>
            <SectionHeader title="Shorts" action="See all" onAction={() => setSeries('Shorts')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: 10 }}>
            {shorts.map((v) => <ShortTile key={v.id} v={v} onPress={() => open(v.id)} />)}
          </ScrollView>
        </>
      ) : null}

      <View style={{ paddingHorizontal: space.md }}>
        <SectionHeader title={series === 'All' ? 'All videos' : series} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {grid.map((v) => (
            <Pressable key={v.id} accessibilityRole="button" accessibilityLabel={`Play ${v.title}, ${v.duration}`} onPress={() => open(v.id)} style={{ width: '48%', flexGrow: 1, maxWidth: '48.5%' }}>
              {v.short ? <ShortThumb duration={v.duration} fill /> : <VideoThumb duration={v.duration} />}
              {WATCHED.includes(v.id) ? <WatchedBadge /> : null}
              <Text v="callout" semibold numberOfLines={2} style={{ marginTop: 6 }}>{v.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Text v="caption" tone="text2">{v.short ? 'Short' : v.series.replace(/s$/, '')}</Text>
                {v.product ? <><Text v="caption" tone="text3">·</Text><ProductTag icon={productIcon[v.product] ?? 'products'} name={moduleName(v.product)} /></> : null}
              </View>
            </Pressable>
          ))}
        </View>
        {grid.length === 0 ? <Text v="callout" tone="text2" center style={{ marginTop: space.lg }}>No videos in this series yet.</Text> : null}
      </View>
    </Screen>
  );
}

/** 9:16 abstract thumb for shorts. */
function ShortThumb({ duration, fill }: { duration: string; fill?: boolean }) {
  const { p } = useTheme();
  return (
    <View style={{ width: fill ? '100%' : 120, aspectRatio: 9 / 16, borderRadius: 10, backgroundColor: '#1C2430', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: '45%', backgroundColor: '#243044', transform: [{ skewY: '-12deg' }] }} />
      <View style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: 'rgba(11,15,20,0.7)', alignItems: 'center', justifyContent: 'center' }}><Icon name="play" size={16} color="#E8ECF1" /></View>
      <View style={{ position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(11,15,20,0.8)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}><Text v="caption" num style={{ color: '#E8ECF1', fontSize: 11, lineHeight: 14 }} semibold>{duration}</Text></View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: p.border, borderRadius: 10 }} />
    </View>
  );
}

function ShortTile({ v, onPress }: { v: Video; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Play short ${v.title}, ${v.duration}`} onPress={onPress} style={{ width: 120 }}>
      <ShortThumb duration={v.duration} />
      <Text v="caption" semibold numberOfLines={2} style={{ marginTop: 6 }}>{v.title}</Text>
      {v.product ? <Text v="caption" tone="text2" numberOfLines={1}>{moduleName(v.product)}</Text> : null}
    </Pressable>
  );
}

function WatchedBadge() {
  const { p } = useTheme();
  return (
    <View style={{ position: 'absolute', left: 6, top: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(11,15,20,0.8)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
      <Icon name="check" size={12} color={p.ok} strokeWidth={2} />
      <Text v="caption" style={{ color: '#E8ECF1', fontSize: 11, lineHeight: 14 }} semibold>Watched</Text>
    </View>
  );
}
