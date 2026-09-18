import React, { useState } from 'react';
import { TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { fonts, radius, space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, Row, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { parsePairPayload } from '@/lib/instanceApi';

/** Sample self-signed fingerprint (KIT §6 — fictional). */
const FINGERPRINT = 'sha256:3A9F1C427B0DE5A19C3E44B70F1DA2C65E88D01B7F3AC9E21B6D8A47E3F09D5C';

/** 04 Pair manually — URL + one-time token, then the TLS fingerprint to compare with Settings → Mobile on the instance. */
export default function PairManual() {
  const { p } = useTheme();
  const router = useRouter();
  const { pairSample } = useApp();
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [tenant, setTenant] = useState('');
  const [busy, setBusy] = useState(false);

  const host = (() => { try { return new URL(url.trim()).host; } catch { return ''; } })();

  const onTrust = async () => {
    const payload = parsePairPayload(url);
    if (!payload || !/^https?:\/\/[^\s/]+\.[^\s/]+/.test(payload.url)) {
      router.push({ pathname: '/pair/error', params: { reason: 'The instance URL is not valid. It should start with https:// and name your Hexward host.' } });
      return;
    }
    if (!code.trim()) {
      router.push({ pathname: '/pair/error', params: { reason: 'The pairing code was rejected. Codes expire after 10 minutes; open Settings → Mobile on the instance for a fresh one.' } });
      return;
    }
    setBusy(true);
    try { await pairSample(nickname.trim() || undefined); router.replace('/pair/success'); } finally { setBusy(false); }
  };

  return (
    <Screen padded={false} keyboardDismissMode="on-drag">
      <TopBar title="Pair manually" back="Scan instead" />
      <View style={{ paddingHorizontal: space.md, gap: space.md }}>
        <Field label="Instance URL" value={url} onChange={setUrl} placeholder="https://hq-lab.corp.example.net:8443" keyboardType="url" autoComplete="url" textContentType="URL" />
        <Field label="Pairing token" value={code} onChange={setCode} placeholder="HXW-4K7Q-9M2P-TR8D" keyboardType="numeric" mono />
        <Field label="Nickname" value={nickname} onChange={setNickname} placeholder="hq-lab" />
        <Field label="Tenant label · optional" value={tenant} onChange={setTenant} placeholder="Head office" />

        <Card>
          <Row gap={10} style={{ alignItems: 'flex-start' }}>
            <Icon name="lock" size={20} color={p.high} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text v="headline">Trust this certificate?</Text>
              <Text v="callout" tone="text2" style={{ marginTop: 4 }}>{host || 'hq-lab.corp.example.net'} presented a self-signed certificate. Compare the SHA-256 fingerprint with Settings → Mobile on the instance.</Text>
            </View>
          </Row>
          <View style={{ marginTop: 12, backgroundColor: p.surface2, borderRadius: radius.tag, padding: 10 }}>
            <Text v="caption" tone="text3" style={{ marginBottom: 4 }}>TLS fingerprint</Text>
            <Text v="mono" selectable style={{ fontSize: 13, lineHeight: 18 }}>{FINGERPRINT}</Text>
          </View>
        </Card>

        <Row gap={10} style={{ marginTop: space.sm }}>
          <Button title="Trust and continue" icon="check" onPress={() => { void onTrust(); }} loading={busy} style={{ flex: 2 }} />
          <Button title="Cancel" kind="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/pair/scan'))} style={{ flex: 1 }} />
        </Row>
        <Text v="caption" tone="text3">Nothing is sent to Hexward. The token is stored in the secure keystore of this phone only.</Text>
      </View>
    </Screen>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, mono, autoComplete, textContentType }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: KeyboardTypeOptions; mono?: boolean;
  autoComplete?: 'url' | 'off'; textContentType?: 'URL' | 'none';
}) {
  const { p, body } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text v="caption" tone="text2" semibold>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={p.text3}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={textContentType}
        style={{ height: 48, borderRadius: radius.card, backgroundColor: p.surface2, paddingHorizontal: 14, color: p.text, fontSize: body, fontFamily: mono ? fonts.mono : fonts.regular, borderWidth: 1, borderColor: p.border }}
      />
    </View>
  );
}
