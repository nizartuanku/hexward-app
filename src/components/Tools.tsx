import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { fonts, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from '@/icons/Icon';
import { Text } from './Text';
import { Button, Row, Skeleton } from './Primitives';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';

/** Shared bits for the pocket tools (27–32). Everything runs on the phone from sample data; nothing is sent anywhere. */
export const RAN_AT = '2026-09-18 14:02 +07';
export const RAN_CAPTION = `Ran on this phone · ${RAN_AT}`;

export type ToolPhase = 'input' | 'loading' | 'result';

/** Input → 400 ms skeleton → result. `run` accepts a callback fired when the result phase begins. */
export function useToolRun() {
  const [phase, setPhase] = useState<ToolPhase>('input');
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const run = useCallback((onDone?: () => void) => {
    setPhase('loading');
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => { setPhase('result'); onDone?.(); }, 400);
  }, []);
  const reset = useCallback(() => { if (t.current) clearTimeout(t.current); setPhase('input'); }, []);
  return { phase, run, reset };
}

/** "Ran on this phone · <timestamp>" caption, required on every result. */
export function RanOn({ style }: { style?: StyleProp<ViewStyle> }) {
  const { p } = useTheme();
  return (
    <Row gap={6} style={[{ marginTop: space.sm }, style]}>
      <Icon name="clock" size={14} color={p.text3} />
      <Text v="caption" tone="text3" num>{RAN_CAPTION}</Text>
    </Row>
  );
}

/** Labelled text field in the app's surface style. */
export function ToolInput({ label, hint, mono, style, ...rest }: { label: string; hint?: string; mono?: boolean } & TextInputProps) {
  const { p, body } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text v="callout" tone="text2" semibold>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={p.text3}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
        style={[{ minHeight: 48, borderRadius: radius.card, borderWidth: 1, borderColor: p.border, backgroundColor: p.surface, paddingHorizontal: 14, paddingVertical: 12, color: p.text, fontSize: mono ? 14 : body, lineHeight: mono ? 20 : Math.round(body * 1.3), fontFamily: mono ? fonts.mono : fonts.regular }, style]}
      />
      {hint ? <Text v="caption" tone="text3">{hint}</Text> : null}
    </View>
  );
}

export type CheckStatus = 'ok' | 'warn' | 'fail';

/** Status pill — icon + label, never colour alone. ok = check on the low/ok tone; warn = medium; fail = critical. */
export function StatusPill({ status, label }: { status: CheckStatus; label?: string }) {
  const { p } = useTheme();
  const fg = status === 'ok' ? p.ok : status === 'warn' ? p.medium : p.critical;
  const bg = status === 'ok' ? p.lowSoft : status === 'warn' ? p.mediumSoft : p.criticalSoft;
  const icon: IconName = status === 'ok' ? 'check' : status === 'warn' ? 'sevMedium' : 'sevCritical';
  const text = label ?? (status === 'ok' ? 'Pass' : status === 'warn' ? 'Warning' : 'Fail');
  return (
    <View accessibilityLabel={`Status ${text}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: bg, alignSelf: 'flex-start' }}>
      <Icon name={icon} size={14} color={fg} strokeWidth={2} />
      <Text v="caption" semibold style={{ color: fg }}>{text}</Text>
    </View>
  );
}

/** Inline ok / attention marker (icon + label). */
export function OkMark({ ok, okLabel = 'OK', attentionLabel = 'Attention' }: { ok: boolean; okLabel?: string; attentionLabel?: string }) {
  const { p } = useTheme();
  return (
    <Row gap={4}>
      <Icon name={ok ? 'check' : 'sevHigh'} size={16} color={ok ? p.ok : p.high} strokeWidth={2} />
      <Text v="caption" semibold style={{ color: ok ? p.ok : p.high }}>{ok ? okLabel : attentionLabel}</Text>
    </Row>
  );
}

/** Key / value row with a status marker on the right. */
export function StatusRow({ k, v, ok, last }: { k: string; v: string; ok: boolean; last?: boolean }) {
  const { p } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: p.border }}>
      <Text v="callout" tone="text2" style={{ flex: 1 }}>{k}</Text>
      <Text v="mono" style={{ flexShrink: 1 }}>{v}</Text>
      <OkMark ok={ok} />
    </View>
  );
}

/** Placeholder blocks while the check "runs" (~400 ms). */
export function ResultSkeleton() {
  return (
    <View style={{ gap: 10, marginTop: space.md }} accessibilityLabel="Checking">
      <Skeleton h={96} r={12} />
      <Skeleton h={20} w="45%" />
      <Skeleton h={120} r={12} />
      <Skeleton h={20} w="30%" />
      <Skeleton h={80} r={12} />
    </View>
  );
}

/** Copy a plain-text report to the clipboard and confirm with a toast. */
export function useCopyReport() {
  const { toast } = useToast();
  return useCallback(async (report: string) => {
    try { await Clipboard.setStringAsync(report); toast('Copied'); } catch { toast('Could not copy'); }
  }, [toast]);
}

/**
 * Result actions. Paired: "Send to <module>" creates a target on the current instance (toast).
 * Not paired: "Pair to monitor…" → pairing scan (funnel §9: the tool works first, pairing comes after).
 */
export function ToolActions({ module, pairLabel = 'Pair to monitor', report, onReset, verb = 'Target created' }: { module: string; pairLabel?: string; report: string; onReset: () => void; verb?: string }) {
  const router = useRouter();
  const { paired, current } = useApp();
  const { toast } = useToast();
  const copy = useCopyReport();
  return (
    <View style={{ gap: 10, marginTop: space.lg }}>
      {paired ? (
        <Button title={`Send to ${module}`} icon="arrowRight" onPress={() => toast(`${verb} on ${current?.nickname ?? 'hq-lab'} · ${module}`)} />
      ) : (
        <Button title={pairLabel} icon="qr" onPress={() => router.push('/pair/scan')} />
      )}
      <Button title="Copy report" kind="secondary" icon="copy" onPress={() => { void copy(report); }} />
      <Button title="Check another" kind="ghost" onPress={onReset} />
    </View>
  );
}
