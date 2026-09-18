import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useTheme } from '@/theme/ThemeContext';
import { radius, space } from '@/theme/tokens';
import { Icon } from '@/icons/Icon';
import { Text } from '@/components/Text';
import { Button, Row, Screen } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { parsePairPayload } from '@/lib/instanceApi';

const WEB = Platform.OS === 'web';

/** 03 Pair — scan QR. The code carries URL + one-time token + TLS fingerprint; nothing is sent to Hexward. */
export default function PairScan() {
  const { p } = useTheme();
  const router = useRouter();
  const { pairSample } = useApp();
  const { toast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);

  const finish = async (nickname?: string) => {
    if (locked.current) return;
    locked.current = true; setBusy(true);
    try { await pairSample(nickname); router.replace('/pair/success'); } finally { setBusy(false); locked.current = false; }
  };
  const onScanned = ({ data }: BarcodeScanningResult) => {
    if (locked.current) return;
    const payload = parsePairPayload(data);
    if (!payload) { toast('Not a Hexward pairing code'); return; }
    void finish(payload.nickname);
  };

  const granted = !!permission?.granted;
  const denied = !!permission && !permission.granted && !permission.canAskAgain;
  const cameraOk = !WEB && granted;
  useEffect(() => { if (!WEB && permission && !permission.granted && permission.canAskAgain) void requestPermission(); }, [permission, requestPermission]);

  return (
    <Screen padded={false}>
      <TopBar title="Scan QR code" back />
      <View style={{ paddingHorizontal: space.md, gap: space.md }}>
        <Pressable accessibilityRole="link" accessibilityLabel="Enter manually" onPress={() => router.push('/pair/manual')} hitSlop={8} style={{ alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' }}>
          <Text v="callout" tone="accent" semibold>Enter manually</Text>
        </Pressable>
        <Text v="callout" tone="text2" style={{ marginTop: -space.sm }}>On the instance dashboard open Settings → Mobile. Point the camera at the pairing code.</Text>

        <View accessibilityLabel="Viewfinder" style={{ aspectRatio: 1, borderRadius: radius.card, overflow: 'hidden', backgroundColor: '#0B0F14', borderWidth: 1, borderColor: p.border, alignItems: 'center', justifyContent: 'center' }}>
          {cameraOk ? (
            <CameraView style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={busy ? undefined : onScanned} />
          ) : (
            <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: space.lg }}>
              <Icon name="camera" size={32} color="#7C8795" />
              <Text v="callout" center style={{ color: '#9AA6B5' }}>
                {WEB ? 'Camera not available on web — use manual entry or the demo instance.' : denied ? 'Camera access is off. Allow it in system Settings, or enter the details manually.' : 'Camera access is needed to scan the pairing code.'}
              </Text>
              {!WEB && !denied ? <Button small kind="secondary" title="Allow camera" onPress={() => { void requestPermission(); }} /> : null}
            </View>
          )}
          <Frame color={cameraOk ? p.accent : p.text3} />
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Looking for a Hexward pairing code" onPress={() => { void finish(); }} disabled={busy}>
          <Row gap={8} style={{ justifyContent: 'center' }}>
            <Icon name="qr" size={18} color={p.text2} />
            <Text v="callout" tone="text2">{busy ? 'Pairing…' : 'Looking for a Hexward pairing code'}</Text>
          </Row>
        </Pressable>

        <Row gap={10} style={{ alignItems: 'flex-start' }}>
          <Icon name="lock" size={18} color={p.text3} />
          <Text v="caption" tone="text3" style={{ flex: 1 }}>The code contains the instance URL, a one-time pairing token and the TLS fingerprint. Nothing is sent to Hexward.</Text>
        </Row>

        <View style={{ gap: 8, marginTop: space.sm }}>
          <Button title="Enter details manually" kind="secondary" icon="keyboard" onPress={() => router.push('/pair/manual')} />
          {!cameraOk ? <Button title="Use demo instance (hq-lab)" kind="secondary" icon="server" loading={busy} onPress={() => { void finish(); }} /> : null}
        </View>
      </View>
    </Screen>
  );
}

/** Four corner brackets over the viewfinder. */
function Frame({ color }: { color: string }) {
  const c = { position: 'absolute' as const, width: 28, height: 28, borderColor: color };
  const w = 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 36, top: 36, right: 36, bottom: 36 }}>
      <View style={[c, { left: 0, top: 0, borderLeftWidth: w, borderTopWidth: w, borderTopLeftRadius: 8 }]} />
      <View style={[c, { right: 0, top: 0, borderRightWidth: w, borderTopWidth: w, borderTopRightRadius: 8 }]} />
      <View style={[c, { left: 0, bottom: 0, borderLeftWidth: w, borderBottomWidth: w, borderBottomLeftRadius: 8 }]} />
      <View style={[c, { right: 0, bottom: 0, borderRightWidth: w, borderBottomWidth: w, borderBottomRightRadius: 8 }]} />
    </View>
  );
}
