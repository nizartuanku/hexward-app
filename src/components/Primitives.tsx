import React from 'react';
import { Pressable, View, ScrollView, ActivityIndicator, type ViewProps, type ViewStyle, type StyleProp, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space, severityColors, type Severity } from '@/theme/tokens';
import { Icon, severityIcon, type IconName } from '@/icons/Icon';
import { Text } from './Text';

// ---------- Screen ----------
/** Full-bleed screen background with top safe area. Tabs screens should pass `tabbed` so content clears the tab bar. */
export function Screen({ children, scroll = true, tabbed = false, padded = true, style, contentStyle, ...rest }: {
  children: React.ReactNode; scroll?: boolean; tabbed?: boolean; padded?: boolean; contentStyle?: StyleProp<ViewStyle>;
} & ScrollViewProps) {
  const { p } = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = tabbed ? 0 : insets.bottom;
  const pad: ViewStyle = padded ? { paddingHorizontal: space.md } : {};
  if (!scroll) {
    return <View style={[{ flex: 1, backgroundColor: p.bg, paddingBottom: bottom }, pad, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: p.bg }, style]}
      contentContainerStyle={[{ paddingBottom: bottom + (tabbed ? TAB_CLEARANCE : space.lg) }, pad, contentStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
export const TAB_CLEARANCE = 112;

// ---------- Button ----------
export type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'destructive';
export function Button({ title, onPress, kind = 'primary', icon, disabled, loading, small, style, accessibilityLabel }: {
  title: string; onPress?: () => void; kind?: ButtonKind; icon?: IconName; disabled?: boolean; loading?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}) {
  const { p } = useTheme();
  const bg = kind === 'primary' ? p.accent : kind === 'ghost' ? 'transparent' : p.surface2;
  const fg = kind === 'primary' ? p.onAccent : kind === 'destructive' ? p.critical : kind === 'ghost' ? p.accent : p.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        { minHeight: small ? 36 : 48, borderRadius: radius.card, backgroundColor: bg, paddingHorizontal: small ? 14 : 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={small ? 18 : 20} color={fg} /> : null}
      <Text v={small ? 'callout' : 'headline'} semibold style={{ color: fg }}>{title}</Text>
    </Pressable>
  );
}

// ---------- IconButton (44/48 target) ----------
export function IconButton({ name, onPress, label, color, badge }: { name: IconName; onPress?: () => void; label: string; color?: string; badge?: number }) {
  const { p, touch } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4}
      style={({ pressed }) => ({ width: touch, height: touch, alignItems: 'center', justifyContent: 'center', borderRadius: touch / 2, backgroundColor: pressed ? p.surface2 : 'transparent' })}>
      <Icon name={name} color={color ?? p.text} />
      {badge ? (
        <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: p.critical, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
          <Text v="caption" style={{ color: '#FFFFFF', fontSize: 10, lineHeight: 12 }} semibold>{badge > 9 ? '9+' : String(badge)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// ---------- Card ----------
export function Card({ children, onPress, style, padded = true, accessibilityLabel }: { children: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; padded?: boolean; accessibilityLabel?: string }) {
  const { p } = useTheme();
  const base: ViewStyle = { backgroundColor: p.surface, borderWidth: 1, borderColor: p.border, borderRadius: radius.card, padding: padded ? space.md : 0, overflow: 'hidden' };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

// ---------- Section header ----------
export function SectionHeader({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space.lg, marginBottom: space.sm }, style]}>
      <Text v="headline">{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}><Text v="callout" tone="accent" semibold>{action}</Text></Pressable>
      ) : null}
    </View>
  );
}

// ---------- List row ----------
export function ListRow({ title, subtitle, left, right, onPress, chevron = true, last, meta, titleTone }: {
  title: string; subtitle?: string; left?: React.ReactNode; right?: React.ReactNode; onPress?: () => void; chevron?: boolean; last?: boolean; meta?: string; titleTone?: 'text' | 'critical';
}) {
  const { p } = useTheme();
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} disabled={!onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: p.border, backgroundColor: pressed ? p.surface2 : 'transparent' })}>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text tone={titleTone ?? 'text'} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text v="callout" tone="text2" numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text v="caption" tone="text3" num>{meta}</Text> : null}
      {right}
      {onPress && chevron ? <Icon name="chevronRight" size={20} color={p.text3} /> : null}
    </Pressable>
  );
}

// ---------- Severity pill (icon + label, never color alone) ----------
export function SeverityPill({ s, label }: { s: Severity; label?: string }) {
  const { p } = useTheme();
  const c = severityColors(p, s);
  return (
    <View accessibilityLabel={`Severity ${s}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: c.bg, alignSelf: 'flex-start' }}>
      <Icon name={severityIcon[s]} size={14} color={c.fg} strokeWidth={2} />
      <Text v="caption" semibold style={{ color: c.fg }}>{label ?? cap(s)}</Text>
    </View>
  );
}

// ---------- Chip ----------
export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  const { p, ios } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 12, borderRadius: ios ? radius.pill : radius.tag, borderWidth: 1, borderColor: selected ? 'transparent' : p.border, backgroundColor: selected ? p.accentSoft : 'transparent' }}>
      {icon ? <Icon name={icon} size={16} color={selected ? p.accent : p.text2} /> : null}
      <Text v="caption" semibold style={{ color: selected ? p.accent : p.text2 }}>{label}</Text>
    </Pressable>
  );
}

// ---------- Tag (small, 8px radius) ----------
export function Tag({ label, tone = 'text2' }: { label: string; tone?: 'text2' | 'accent' | 'ok' | 'critical' }) {
  const { p } = useTheme();
  const fg = tone === 'accent' ? p.accent : tone === 'ok' ? p.ok : tone === 'critical' ? p.critical : p.text2;
  const bg = tone === 'accent' ? p.accentSoft : tone === 'ok' ? p.lowSoft : tone === 'critical' ? p.criticalSoft : p.surface2;
  return (
    <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.tag, backgroundColor: bg, alignSelf: 'flex-start' }}>
      <Text v="label" style={{ color: fg }}>{label}</Text>
    </View>
  );
}

// ---------- Product tag (icon + name) ----------
export function ProductTag({ icon, name }: { icon: IconName; name: string }) {
  const { p } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={16} color={p.text2} />
      <Text v="caption" tone="text2">{name}</Text>
    </View>
  );
}

// ---------- Segmented control ----------
export function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (k: T) => void }) {
  const { p } = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: p.surface2, borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.key)}
            style={{ flex: 1, minHeight: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? p.surface : 'transparent' }}>
            <Text v="callout" semibold={on} tone={on ? 'text' : 'text2'}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Divider / Spacer ----------
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) { const { p } = useTheme(); return <View style={[{ height: 1, backgroundColor: p.border }, style]} />; }
export const Spacer = ({ h = space.md }: { h?: number }) => <View style={{ height: h }} />;
export const Row = ({ children, style, gap = 8, ...rest }: ViewProps & { gap?: number }) => <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;

// ---------- Last synced ----------
export function LastSynced({ when = '2 min ago' }: { when?: string }) {
  const { p } = useTheme();
  return (
    <Row gap={6} style={{ marginTop: space.sm }}>
      <Icon name="clock" size={14} color={p.text3} />
      <Text v="caption" tone="text3">Last synced {when}</Text>
    </Row>
  );
}

// ---------- Empty state ----------
export function EmptyState({ icon, title, body, action, onAction, secondary, onSecondary }: { icon: IconName; title: string; body?: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void }) {
  const { p } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.md, gap: space.sm }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm }}>
        <Icon name={icon} size={30} color={p.text2} />
      </View>
      <Text v="title" center>{title}</Text>
      {body ? <Text v="callout" tone="text2" center>{body}</Text> : null}
      {action ? <Button title={action} onPress={onAction} style={{ marginTop: space.md, alignSelf: 'stretch' }} /> : null}
      {secondary ? <Button title={secondary} kind="ghost" onPress={onSecondary} /> : null}
    </View>
  );
}

// ---------- Skeleton ----------
export function Skeleton({ w = '100%', h = 16, r = 8, style }: { w?: number | `${number}%`; h?: number; r?: number; style?: StyleProp<ViewStyle> }) {
  const { p } = useTheme();
  return <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: p.surface2 }, style]} />;
}

// ---------- Stat tile ----------
export function StatTile({ label, value, tone = 'text', onPress }: { label: string; value: string | number; tone?: 'text' | 'critical' | 'high' | 'ok'; onPress?: () => void }) {
  return (
    <Card onPress={onPress} style={{ flex: 1, paddingVertical: 12 }}>
      <Text v="title" num tone={tone}>{String(value)}</Text>
      <Text v="caption" tone="text2">{label}</Text>
    </Card>
  );
}

// ---------- Key/value ----------
export function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8 }}>
      <Text v="callout" tone="text2">{k}</Text>
      <Text v={mono ? 'mono' : 'callout'} style={{ flexShrink: 1, textAlign: 'right' }} selectable>{v}</Text>
    </View>
  );
}

export function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
