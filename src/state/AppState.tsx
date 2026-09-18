import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { instances as sampleInstances, type Instance } from '@/data/sample';

/**
 * App-wide state. No cloud account, no trackers (brief §12): everything lives on the device.
 * Pairing tokens go to SecureStore; the rest to AsyncStorage.
 */
export interface NotifPrefs { securityCritical: boolean; securityHigh: boolean; digest: boolean; marketing: boolean; launches: boolean; }
export interface PairedInstance extends Instance { pairedAt: string; }
interface Persisted {
  welcomeSeen: boolean;
  instances: PairedInstance[];
  currentInstanceId: string | null;
  followed: string[];
  notif: NotifPrefs;
  findingStatus: Record<string, 'acknowledged' | 'snoozed' | 'resolved'>;
  alertsRead: string[];
  mutedSources: string[];
  reminders: string[];
  license: { key: string | null; status: 'valid' | 'expired' | 'invalid' | 'none'; module?: string; plan?: string; expires?: string };
  videoQuality: 'auto' | '720p' | '1080p';
  autoLock: 'never' | '1m' | '5m';
}
const DEFAULTS: Persisted = {
  welcomeSeen: false, instances: [], currentInstanceId: null, followed: ['rulehawk'],
  notif: { securityCritical: true, securityHigh: true, digest: false, marketing: false, launches: false },
  findingStatus: {}, alertsRead: [], mutedSources: [], reminders: [],
  license: { key: null, status: 'none' }, videoQuality: 'auto', autoLock: '5m',
};
const KEY = 'hexward.state.v1';

interface Ctx extends Persisted {
  ready: boolean;
  paired: boolean;
  current: PairedInstance | null;
  set: <K extends keyof Persisted>(k: K, v: Persisted[K]) => void;
  pair: (inst: Instance, token: string) => Promise<void>;
  unpair: (id: string) => Promise<void>;
  switchInstance: (id: string) => void;
  toggleFollow: (slug: string) => boolean;
  setFindingStatus: (id: string, s: 'acknowledged' | 'snoozed' | 'resolved' | null) => void;
  markAlertsRead: (ids: string[]) => void;
  muteSource: (src: string) => void;
  toggleReminder: (id: string) => boolean;
  reset: () => Promise<void>;
  /** Demo helper used by the pairing screens: pairs the sample hq-lab instance. */
  pairSample: (id?: string) => Promise<void>;
}
const AppCtx = createContext<Ctx | null>(null);

async function secureSet(k: string, v: string) { if (Platform.OS === 'web') { try { localStorage.setItem(k, v); } catch {} return; } await SecureStore.setItemAsync(k, v); }
async function secureDel(k: string) { if (Platform.OS === 'web') { try { localStorage.removeItem(k); } catch {} return; } await SecureStore.deleteItemAsync(k); }

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    (async () => {
      try { const raw = await AsyncStorage.getItem(KEY); if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {}
      loaded.current = true; setReady(true);
    })();
  }, []);
  useEffect(() => { if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, [s]);

  const set = useCallback(<K extends keyof Persisted>(k: K, v: Persisted[K]) => setS((prev) => ({ ...prev, [k]: v })), []);
  const pair = useCallback(async (inst: Instance, token: string) => {
    await secureSet('hexward.token.' + inst.id, token);
    setS((prev) => ({ ...prev, instances: [...prev.instances.filter((i) => i.id !== inst.id), { ...inst, pairedAt: new Date().toISOString() }], currentInstanceId: inst.id }));
  }, []);
  const unpair = useCallback(async (id: string) => {
    await secureDel('hexward.token.' + id);
    setS((prev) => { const rest = prev.instances.filter((i) => i.id !== id); return { ...prev, instances: rest, currentInstanceId: prev.currentInstanceId === id ? (rest[0]?.id ?? null) : prev.currentInstanceId }; });
  }, []);
  const pairSample = useCallback(async (id = 'hq-lab') => { const inst = sampleInstances.find((i) => i.id === id) ?? sampleInstances[0]; await pair(inst, 'sample-token'); }, [pair]);
  const switchInstance = useCallback((id: string) => set('currentInstanceId', id), [set]);
  const toggleFollow = useCallback((slug: string) => { let now = false; setS((prev) => { const has = prev.followed.includes(slug); now = !has; return { ...prev, followed: has ? prev.followed.filter((x) => x !== slug) : [...prev.followed, slug] }; }); return now; }, []);
  const setFindingStatus = useCallback((id: string, st: 'acknowledged' | 'snoozed' | 'resolved' | null) => setS((prev) => { const n = { ...prev.findingStatus }; if (st) n[id] = st; else delete n[id]; return { ...prev, findingStatus: n }; }), []);
  const markAlertsRead = useCallback((ids: string[]) => setS((prev) => ({ ...prev, alertsRead: Array.from(new Set([...prev.alertsRead, ...ids])) })), []);
  const muteSource = useCallback((src: string) => setS((prev) => ({ ...prev, mutedSources: Array.from(new Set([...prev.mutedSources, src])) })), []);
  const toggleReminder = useCallback((id: string) => { let now = false; setS((prev) => { const has = prev.reminders.includes(id); now = !has; return { ...prev, reminders: has ? prev.reminders.filter((x) => x !== id) : [...prev.reminders, id] }; }); return now; }, []);
  const reset = useCallback(async () => { for (const i of s.instances) await secureDel('hexward.token.' + i.id); setS(DEFAULTS); await AsyncStorage.removeItem(KEY); }, [s.instances]);

  const value = useMemo<Ctx>(() => {
    const current = s.instances.find((i) => i.id === s.currentInstanceId) ?? s.instances[0] ?? null;
    return { ...s, ready, paired: s.instances.length > 0, current, set, pair, unpair, switchInstance, toggleFollow, setFindingStatus, markAlertsRead, muteSource, toggleReminder, reset, pairSample };
  }, [s, ready, set, pair, unpair, switchInstance, toggleFollow, setFindingStatus, markAlertsRead, muteSource, toggleReminder, reset, pairSample]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside AppStateProvider');
  return c;
}
