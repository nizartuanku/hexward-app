import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/theme/ThemeContext';
import { fonts, radius, space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Card, KV, Row, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { moduleName } from '@/data/sample';
import { LINKS } from '@/config';

/** One key format everywhere: hxw1.<module>.<plan>.<id> */
const KEY_RE = /^hxw1\.([a-z-]+)\.(pro|team)\.([A-Za-z0-9]{6,})$/;
const KEY_HINT = 'Key format: hxw1.<module>.<plan>.<id>';
const SAMPLE_EXPIRES = '2027-09-18';

function planLabel(plan?: string) { return plan === 'team' ? 'Team' : plan === 'pro' ? 'Pro' : plan ?? ''; }

/** 47 License — keys are validated on the device and unlock features on the instance, never in this app. No purchase path here. */
export default function License() {
  const { p, body } = useTheme();
  const { license, current, set } = useApp();
  const { toast, openExternal } = useToast();
  const [key, setKey] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  const validate = (raw: string) => {
    const k = raw.trim();
    if (!k) { setHint('Paste a key first.'); return; }
    const parts = k.split('.');
    const m = KEY_RE.exec(k);
    if (k.toLowerCase().includes('expired')) {
      set('license', { key: k, status: 'expired', module: parts[1], plan: parts[2] });
      setHint(null);
      toast('License expired');
      return;
    }
    if (m) {
      set('license', { key: k, status: 'valid', module: m[1], plan: m[2], expires: SAMPLE_EXPIRES });
      setHint(null);
      setKey('');
      toast('License valid');
      return;
    }
    set('license', { key: k, status: 'invalid' });
    setHint(KEY_HINT);
  };
  const paste = async () => {
    try { const t = await Clipboard.getStringAsync(); if (t) { setKey(t.trim()); toast('Key pasted from clipboard'); } else toast('Clipboard is empty'); } catch { toast('Could not read the clipboard'); }
  };
  const remove = () => { set('license', { key: null, status: 'none' }); setKey(''); setHint(null); toast('Key removed'); };

  const appliesTo = current?.nickname ?? 'hq-lab';

  return (
    <Screen padded={false} keyboardDismissMode="on-drag">
      <TopBar title="License" back="Settings" />
      <View style={{ paddingHorizontal: space.md, gap: space.md }}>
        {license.status === 'valid' ? (
          <Card>
            <Row gap={8}><Icon name="check" color={p.ok} strokeWidth={2} /><Text v="headline" style={{ color: p.ok }}>Valid</Text></Row>
            <Text v="callout" tone="text2" style={{ marginTop: 4 }}>Verified on this device. Nothing was sent.</Text>
            <View style={{ marginTop: 8 }}>
              <KV k="Module" v={license.module ? moduleName(license.module) : '—'} />
              <KV k="Plan" v={planLabel(license.plan)} />
              <KV k="Expires" v={license.expires ?? '—'} mono />
              <KV k="Applies to" v={appliesTo} mono />
              <KV k="Key" v={license.key ? `${license.key.slice(0, 22)}…` : '—'} mono />
            </View>
            <Button title="Remove key" kind="ghost" icon="trash" onPress={remove} style={{ marginTop: 8 }} />
          </Card>
        ) : null}

        {license.status === 'expired' ? (
          <Card style={{ borderColor: p.critical }}>
            <Row gap={8}><Icon name="sevCritical" color={p.critical} strokeWidth={2} /><Text v="headline" tone="critical">Expired</Text></Row>
            <Text v="callout" tone="text2" style={{ marginTop: 4 }}>{license.module ? `${moduleName(license.module)} ${planLabel(license.plan)}`.trim() : 'This key'} is no longer active. Features on your instance fall back to the Free edition.</Text>
            <Button title="Renew on the web" kind="secondary" icon="external" onPress={() => openExternal(LINKS.web + '/license', 'License')} style={{ marginTop: 12 }} />
            <Button title="Remove key" kind="ghost" icon="trash" onPress={remove} style={{ marginTop: 4 }} />
          </Card>
        ) : null}

        {license.status === 'invalid' ? (
          <Card style={{ borderColor: p.critical }}>
            <Row gap={8}><Icon name="sevCritical" color={p.critical} strokeWidth={2} /><Text v="headline" tone="critical">Invalid</Text></Row>
            <Text v="callout" tone="text2" style={{ marginTop: 4 }}>Wrong module or tampered key.</Text>
            <Text v="mono" tone="text3" style={{ marginTop: 6 }}>{KEY_HINT}</Text>
            <Button title="Remove key" kind="ghost" icon="trash" onPress={remove} style={{ marginTop: 8 }} />
          </Card>
        ) : null}

        {license.status === 'none' ? (
          <Card>
            <Row gap={8}><Icon name="key" color={p.text2} /><Text v="headline">No license — Free edition</Text></Row>
            <Text v="callout" tone="text2" style={{ marginTop: 4 }}>Pro and Team keys unlock features on your instance, not in this app.</Text>
          </Card>
        ) : null}

        {license.status !== 'valid' ? (
          <Card>
            <Text v="caption" tone="text2" semibold style={{ marginBottom: 6 }}>{license.status === 'none' ? 'Paste license key' : 'Try another key'}</Text>
            <Row gap={8}>
              <TextInput
                accessibilityLabel="Paste license key"
                value={key}
                onChangeText={(t) => { setKey(t); if (hint) setHint(null); }}
                placeholder="hxw1.rulehawk.pro.9f3a2c718b"
                placeholderTextColor={p.text3}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => validate(key)}
                returnKeyType="done"
                style={{ flex: 1, height: 48, borderRadius: radius.card, backgroundColor: p.surface2, paddingHorizontal: 14, color: p.text, fontSize: body - 2, fontFamily: fonts.mono, borderWidth: 1, borderColor: hint ? p.critical : p.border }}
              />
              <Button title="Paste" kind="secondary" icon="copy" onPress={() => { void paste(); }} accessibilityLabel="Paste from clipboard" />
            </Row>
            {hint ? <Text v="caption" tone="critical" style={{ marginTop: 6 }}>{hint}</Text> : <Text v="caption" tone="text3" style={{ marginTop: 6 }}>{KEY_HINT}</Text>}
            <Button title="Validate" icon="check" onPress={() => validate(key)} disabled={!key.trim()} style={{ marginTop: 12 }} />
            <Text v="caption" tone="text3" style={{ marginTop: 8 }}>Verified offline. Nothing is sent.</Text>
          </Card>
        ) : null}

        <Card>
          <Text v="headline">Get a key</Text>
          <Text v="callout" tone="text2" style={{ marginTop: 4 }}>Keys are issued on the web after purchase. The app never processes payment and never gates its own features.</Text>
        </Card>
      </View>
    </Screen>
  );
}
