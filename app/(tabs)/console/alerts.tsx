import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space, severityColors } from '@/theme/tokens';
import { Icon, severityIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, LastSynced, Screen, SectionHeader, Segmented, Skeleton, cap } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { moduleName, type Alert } from '@/data/sample';
import { apiFor } from '@/lib/instanceApi';

type Tab = 'all' | 'unread';

/** 14 Alerts inbox — security alerts only (marketing lives in Products). */
export default function Alerts() {
  const { p } = useTheme();
  const router = useRouter();
  const { current, alertsRead, markAlertsRead } = useApp();
  const { toast } = useToast();
  const [items, setItems] = useState<Alert[] | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  useEffect(() => { let on = true; setItems(null); apiFor(current, 'sample-token').alerts().then((a) => { if (on) setItems(a); }); return () => { on = false; }; }, [current]);

  const isUnread = (a: Alert) => !a.read && !alertsRead.includes(a.id);
  const all = items ?? [];
  const unread = all.filter(isUnread);
  const list = tab === 'unread' ? unread : all;
  const today = list.filter((a) => a.age !== 'Yesterday');
  const yesterday = list.filter((a) => a.age === 'Yesterday');

  const markAll = () => { markAlertsRead(all.map((a) => a.id)); toast('All alerts marked read'); };
  const open = (a: Alert) => { markAlertsRead([a.id]); router.push({ pathname: '/(tabs)/console/alert/[id]', params: { id: a.id } }); };

  const group = (title: string, rows: Alert[]) => rows.length ? (
    <>
      <SectionHeader title={title} />
      <Card padded={false} style={{ paddingHorizontal: space.md }}>
        {rows.map((a, i) => {
          const un = isUnread(a);
          return (
            <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={`${un ? 'Unread. ' : ''}${a.title}`} onPress={() => open(a)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: p.border, backgroundColor: pressed ? p.surface2 : 'transparent' })}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: un ? p.accent : 'transparent' }} />
              <Icon name={severityIcon[a.severity]} color={severityColors(p, a.severity).fg} strokeWidth={2} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text semibold={un} numberOfLines={2}>{a.title}</Text>
                <Text v="callout" tone="text2" numberOfLines={1}>{cap(a.severity)} · {moduleName(a.module)} · {a.age}</Text>
              </View>
              <Icon name="chevronRight" size={20} color={p.text3} />
            </Pressable>
          );
        })}
      </Card>
    </>
  ) : null;

  return (
    <Screen tabbed padded={false}>
      <TopBar back title="Alerts" actions={[{ icon: 'check', label: 'Mark all read', onPress: markAll }]} />
      <View style={{ paddingHorizontal: space.md }}>
        <Segmented<Tab> value={tab} onChange={setTab} options={[{ key: 'all', label: 'All' }, { key: 'unread', label: unread.length ? `Unread · ${unread.length}` : 'Unread' }]} />
        <LastSynced when={`${current?.lastSynced ?? '2 min ago'} · ${unread.length} unread`} />

        {items === null ? (
          <View style={{ gap: 10, marginTop: space.lg }}>
            {[0, 1, 2, 3].map((i) => <Card key={i} style={{ paddingVertical: 14 }}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Skeleton w={24} h={24} r={12} /><View style={{ flex: 1, gap: 8 }}><Skeleton h={16} w="75%" /><Skeleton h={12} w="50%" /></View></View></Card>)}
          </View>
        ) : list.length === 0 ? (
          <EmptyState icon="bell" title={tab === 'unread' ? 'All caught up' : 'No alerts'} body={tab === 'unread' ? `No unread alerts on ${current?.nickname ?? 'this instance'}.` : 'Security alerts from your instance land here.'}
            action="Findings" onAction={() => router.push('/(tabs)/console')} />
        ) : (
          <>
            {group('Today', today)}
            {group('Yesterday', yesterday)}
            <Button title="Findings" kind="ghost" icon="console" onPress={() => router.push('/(tabs)/console')} style={{ marginTop: space.md }} />
          </>
        )}
      </View>
    </Screen>
  );
}
