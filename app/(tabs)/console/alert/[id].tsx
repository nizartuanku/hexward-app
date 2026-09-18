import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';
import { productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, EmptyState, ProductTag, Row, Screen, SectionHeader, SeverityPill, Skeleton, Tag, cap } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { instances, moduleName, type Alert, type Finding } from '@/data/sample';
import { apiFor } from '@/lib/instanceApi';

/** 15 Alert detail — where a push notification lands. Marks itself read on mount. */
export default function AlertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { p } = useTheme();
  const router = useRouter();
  const { current, findingStatus, setFindingStatus, markAlertsRead, muteSource, mutedSources } = useApp();
  const { toast } = useToast();
  const [data, setData] = useState<{ alert: Alert | undefined; finding: Finding | undefined } | null>(null);
  const aid = id ?? '';

  useEffect(() => { if (aid) markAlertsRead([aid]); }, [aid, markAlertsRead]);
  useEffect(() => {
    let on = true; setData(null);
    const api = apiFor(current, 'sample-token');
    api.alerts().then(async (list) => {
      const alert = list.find((a) => a.id === aid);
      const finding = alert ? await api.finding(alert.findingId) : undefined;
      if (on) setData({ alert, finding });
    });
    return () => { on = false; };
  }, [current, aid]);

  const alert = data?.alert;
  const finding = data?.finding;
  const nickname = alert ? (instances.find((i) => i.id === alert.instanceId)?.nickname ?? current?.nickname ?? alert.instanceId) : '';
  const status: 'open' | 'acknowledged' | 'snoozed' | 'resolved' = alert ? (findingStatus[alert.findingId] ?? 'open') : 'open';
  const muted = !!alert?.source && mutedSources.includes(alert.source);

  const acknowledge = () => { if (!alert) return; setFindingStatus(alert.findingId, 'acknowledged'); toast('Acknowledged'); router.replace('/(tabs)/console/alerts'); };
  const mute = () => { if (!alert?.source) return; muteSource(alert.source); toast(`${alert.source} muted for 24 h`); };

  return (
    <Screen tabbed padded={false}>
      <TopBar back="Alerts" title="Alert" />
      <View style={{ paddingHorizontal: space.md }}>
        {data === null ? (
          <View style={{ gap: 10, marginTop: 8 }}><Skeleton h={24} w="45%" /><Skeleton h={28} /><Skeleton h={16} w="70%" /><Skeleton h={120} r={12} style={{ marginTop: 8 }} /></View>
        ) : !alert ? (
          <EmptyState icon="bell" title="Alert not found" body="It may have been cleared on the instance." action="Back to alerts" onAction={() => router.replace('/(tabs)/console/alerts')} />
        ) : (
          <>
            <Row gap={10} style={{ marginTop: 4 }}>
              <SeverityPill s={alert.severity} />
              <ProductTag icon={productIcon[alert.module] ?? 'products'} name={moduleName(alert.module)} />
              {status !== 'open' ? <Tag label={cap(status)} tone={status === 'acknowledged' ? 'ok' : 'text2'} /> : null}
            </Row>
            <Text v="title" style={{ marginTop: 10 }}>{alert.title}</Text>
            <Text v="callout" tone="text2" style={{ marginTop: 4 }}>{moduleName(alert.module)} · {nickname}</Text>
            {alert.source ? <Text v="callout" tone="text2">Source {alert.source}{finding ? ` · ${finding.host}` : ''}</Text> : null}
            <Text v="caption" tone="text3" num>{alert.when}</Text>

            <SectionHeader title="What happened" />
            <Text>{finding?.summary ?? 'The finding behind this alert is no longer available on the instance.'}</Text>

            {finding && finding.evidence.length ? (
              <>
                <SectionHeader title="Evidence" />
                <Card style={{ backgroundColor: p.surface2 }}>
                  {finding.evidence.slice(0, 3).map((line, i) => <Text key={i} v="mono" selectable style={{ marginTop: i ? 4 : 0 }}>{line}</Text>)}
                </Card>
              </>
            ) : null}

            <View style={{ gap: 10, marginTop: space.lg }}>
              <Button title={status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'} icon="check" onPress={acknowledge} disabled={status === 'acknowledged'} />
              <Button title="Open finding" kind="secondary" icon="arrowRight" onPress={() => router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id: alert.findingId } })} />
              {alert.source ? <Button title={muted ? `${alert.source} muted` : 'Mute source for 24 h'} kind="ghost" icon="bell" onPress={mute} disabled={muted} /> : null}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
