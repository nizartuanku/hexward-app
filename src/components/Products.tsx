import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/tokens';
import { Icon, productIcon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, ListRow, Row } from '@/components/Primitives';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { STORE_SAFE_PRICING } from '@/config';
import { GITHUB, WEB, bundles, productBySlug, products, type Campaign, type Product } from '@/data/sample';

/** Shared pieces for the Products & Campaigns group (38–44). Not exported outside the group. */

export const isBundle = (slug: string) => bundles.some((b) => b.slug === slug);

/** Bundle membership (brief §6): Suite = all 11 non-bundle products; Essentials = the five SMB checks. */
export function bundleMembers(slug: string): Product[] {
  if (slug === 'essentials') {
    const order = ['certlight', 'asm', 'dmarcwatch', 'tenantwatch', 'posture-report'];
    return order.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => !!p);
  }
  return products;
}

/** Route for a catalog entry: bundles go to the bundle page, everything else to the product page. */
export function useProductNav() {
  const router = useRouter();
  return (slug: string) => {
    if (isBundle(slug)) router.push({ pathname: '/(tabs)/products/bundle/[slug]', params: { slug } });
    else router.push({ pathname: '/(tabs)/products/[slug]', params: { slug } });
  };
}

/** Follow / Following toggle with the standard toasts. */
export function FollowButton({ slug, name, small = true, style }: { slug: string; name: string; small?: boolean; style?: React.ComponentProps<typeof Button>['style'] }) {
  const { followed, toggleFollow } = useApp();
  const { toast } = useToast();
  const on = followed.includes(slug);
  return (
    <Button
      small={small}
      kind={on ? 'secondary' : 'primary'}
      title={on ? 'Following' : 'Follow'}
      accessibilityLabel={on ? `Unfollow ${name}` : `Follow ${name}`}
      onPress={() => { const now = toggleFollow(slug); toast(now ? `Following ${name}` : `Unfollowed ${name}`); }}
      style={style}
    />
  );
}

/** Feature | Free | Pro | Team table. Store-safe: no prices. The V2 price row compiles but is gated by the flag. */
export function FeatureTable({ features, priceV2 }: { features: Product['features']; priceV2?: Product['priceV2'] }) {
  const { p } = useTheme();
  const showPrices = !STORE_SAFE_PRICING && !!priceV2;
  const col = 56;
  const Cell = ({ on }: { on: boolean }) => (
    <View style={{ width: col, alignItems: 'center' }} accessibilityLabel={on ? 'Included' : 'Not included'}>
      {on ? <Icon name="check" size={18} color={p.ok} strokeWidth={2} /> : <Text v="callout" tone="text3">—</Text>}
    </View>
  );
  return (
    <View>
      <Row style={{ height: 28, borderBottomWidth: 1, borderBottomColor: p.border }} gap={0}>
        <Text v="caption" tone="text2" style={{ flex: 1 }}>Feature</Text>
        {['Free', 'Pro', 'Team'].map((h) => <Text key={h} v="caption" semibold center style={{ width: col }}>{h}</Text>)}
      </Row>
      {showPrices && priceV2 ? (
        <Row style={{ height: 32, borderBottomWidth: 1, borderBottomColor: p.border }} gap={0}>
          <Text v="callout" tone="text2" style={{ flex: 1 }}>{priceV2.trial}</Text>
          <Text v="caption" num center style={{ width: col }}>$0</Text>
          <Text v="caption" num center style={{ width: col }}>{priceV2.pro}</Text>
          <Text v="caption" num center style={{ width: col }}>{priceV2.team}</Text>
        </Row>
      ) : null}
      {features.map((f, i) => (
        <Row key={f.name} gap={0} style={{ minHeight: 36, borderBottomWidth: i === features.length - 1 ? 0 : 1, borderBottomColor: p.border }}
          accessibilityLabel={`${f.name}: Free ${f.free ? 'yes' : 'no'}, Pro ${f.pro ? 'yes' : 'no'}, Team ${f.team ? 'yes' : 'no'}`}>
          <Text v="callout" style={{ flex: 1 }} numberOfLines={1}>{f.name}</Text>
          <Cell on={f.free} /><Cell on={f.pro} /><Cell on={f.team} />
        </Row>
      ))}
    </View>
  );
}

/** Product row for "Includes" / followed lists: icon + name + tagline. */
export function ProductRow({ product, subtitle, last, onPress, right, chevron }: { product: Product; subtitle?: string; last?: boolean; onPress?: () => void; right?: React.ReactNode; chevron?: boolean }) {
  const { p } = useTheme();
  return (
    <ListRow
      title={product.name}
      subtitle={subtitle ?? product.tagline}
      last={last}
      onPress={onPress}
      chevron={chevron}
      right={right}
      left={
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={productIcon[product.slug] ?? 'products'} size={22} color={p.text} />
        </View>
      }
    />
  );
}

/** Abstract dashboard mock — dark surface with bars and lines, no text (KIT §6: never real screenshots). */
export function MockScreen({ variant = 0 }: { variant?: 0 | 1 }) {
  const { p } = useTheme();
  const bars = variant === 0 ? [0.55, 0.8, 0.35, 0.65, 0.9, 0.45, 0.7] : [0.3, 0.5, 0.75, 0.6, 0.4, 0.85, 0.55];
  return (
    <View accessibilityLabel="Dashboard preview" style={{ width: 240, height: 150, borderRadius: radius.card, backgroundColor: '#141A22', borderWidth: 1, borderColor: p.border, padding: 12, overflow: 'hidden' }}>
      <Row gap={6}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.accent }} />
        <View style={{ width: 70, height: 6, borderRadius: 3, backgroundColor: '#243044' }} />
        <View style={{ flex: 1 }} />
        <View style={{ width: 28, height: 6, borderRadius: 3, backgroundColor: '#243044' }} />
      </Row>
      <Row gap={6} style={{ marginTop: 12 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, height: 30, borderRadius: 8, backgroundColor: '#1C2430', padding: 6, gap: 5 }}>
            <View style={{ width: '40%', height: 4, borderRadius: 2, backgroundColor: '#2C3848' }} />
            <View style={{ width: '65%', height: 7, borderRadius: 3, backgroundColor: i === (variant === 0 ? 0 : 2) ? p.accent : '#3A4658' }} />
          </View>
        ))}
      </Row>
      <View style={{ flex: 1, marginTop: 12, borderRadius: 8, backgroundColor: '#1C2430', padding: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
        {bars.map((h, i) => <View key={i} style={{ flex: 1, height: `${Math.round(h * 100)}%`, borderRadius: 3, backgroundColor: i === bars.length - 2 ? p.accent : '#3A4658' }} />)}
      </View>
    </View>
  );
}

/**
 * Campaign call to action by kind (42/43). Store-safe: Coming → local reminder; Release notes → GitHub;
 * Founding / Challenge → "Available on the web"; Promo → copy the code (no checkout in the app).
 */
export function CampaignCTA({ campaign, full }: { campaign: Campaign; full?: boolean }) {
  const { p } = useTheme();
  const { reminders, toggleReminder } = useApp();
  const { toast, openExternal } = useToast();
  const product = campaign.product ? productBySlug(campaign.product) : undefined;
  const style = full ? undefined : { alignSelf: 'flex-start' as const };
  switch (campaign.kind) {
    case 'Coming': {
      const on = reminders.includes(campaign.id);
      const when = product?.launch ?? campaign.date;
      return (
        <Button small={!full} kind={on ? 'secondary' : 'primary'} icon={on ? 'check' : 'bell'} title={on ? 'Reminder set' : 'Remind me at launch'}
          accessibilityLabel={on ? 'Remove launch reminder' : 'Remind me at launch'}
          onPress={() => { const now = toggleReminder(campaign.id); toast(now ? `Reminder set for ${when}` : 'Reminder removed'); }} style={style} />
      );
    }
    case 'Release notes':
      return <Button small={!full} kind={full ? 'primary' : 'secondary'} icon="github" title="Free on GitHub" onPress={() => openExternal(campaign.cta?.url ?? GITHUB, 'GitHub')} style={style} />;
    case 'Founding':
    case 'Challenge':
      return <Button small={!full} kind={full ? 'primary' : 'secondary'} icon="external" title="Available on the web" onPress={() => openExternal(campaign.cta?.url ?? WEB, 'Hexward Labs website')} style={style} />;
    case 'Promo': {
      const code = campaign.code ?? campaign.title;
      const copy = async () => {
        try { await Clipboard.setStringAsync(code); toast(campaign.cta?.toast ?? 'Code copied — paste it at checkout on the web'); } catch { toast('Could not copy the code'); }
      };
      return (
        <Row gap={10}>
          <View accessibilityLabel={`Code ${code}`} style={{ flex: full ? 1 : undefined, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tag, backgroundColor: p.surface2, borderWidth: 1, borderColor: p.border }}>
            <Text v="mono" selectable>{code}</Text>
          </View>
          <Button small={!full} kind="secondary" icon="copy" title="Copy" accessibilityLabel={`Copy code ${code}`} onPress={copy} />
        </Row>
      );
    }
    default:
      return null;
  }
}

/** Bullet row with a check icon ("Who it's for", "What's included"). */
export function CheckRow({ text, last }: { text: string; last?: boolean }) {
  const { p } = useTheme();
  return (
    <Row gap={10} style={{ alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: last ? 0 : 1, borderBottomColor: p.border }}>
      <Icon name="check" size={18} color={p.ok} strokeWidth={2} />
      <Text v="callout" style={{ flex: 1 }}>{text}</Text>
    </Row>
  );
}
