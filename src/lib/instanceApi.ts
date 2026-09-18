/**
 * Instance adapter. The app talks ONLY to the user's own self-hosted Hexward instance (brief §2/§12).
 *
 * Contract the instance must expose (documented for Hexward Core; see docs/MOBILE-API.md):
 *   GET  /api/mobile/v1/status                       → { nickname, tenant, version, modules[], health }
 *   GET  /api/mobile/v1/findings?status=open&limit=  → Finding[]
 *   GET  /api/mobile/v1/findings/:id                 → Finding
 *   POST /api/mobile/v1/findings/:id/ack             → { ok }
 *   POST /api/mobile/v1/findings/:id/snooze {hours}  → { ok }
 *   GET  /api/mobile/v1/alerts                       → Alert[]
 *   GET  /api/mobile/v1/modules/:slug/summary        → module-specific summary
 *   POST /api/mobile/v1/pair {code}                  → { token, instance }   (pairing code from the dashboard QR)
 * Auth: Bearer <token> from pairing. TLS required; self-signed allowed only after the user confirms the fingerprint (screen 04).
 */
import { alerts as sampleAlerts, findings as sampleFindings, instances as sampleInstances, type Alert, type Finding, type Instance } from '@/data/sample';

export interface InstanceApi {
  status(): Promise<Instance>;
  findings(): Promise<Finding[]>;
  finding(id: string): Promise<Finding | undefined>;
  ack(id: string): Promise<void>;
  snooze(id: string, hours: number): Promise<void>;
  alerts(): Promise<Alert[]>;
}

export interface PairPayload { url: string; code: string; fingerprint?: string; nickname?: string }

/** Parses the pairing QR / manual entry. Format: hexward://pair?u=<base url>&c=<code>&f=<sha256:...>&n=<nickname> */
export function parsePairPayload(text: string): PairPayload | null {
  try {
    const t = text.trim();
    if (t.startsWith('hexward://pair')) {
      const q = new URL(t.replace('hexward://', 'https://x/'));
      const url = q.searchParams.get('u'); const code = q.searchParams.get('c');
      if (!url || !code) return null;
      return { url, code, fingerprint: q.searchParams.get('f') ?? undefined, nickname: q.searchParams.get('n') ?? undefined };
    }
    if (/^https?:\/\//.test(t)) return { url: t, code: '' };
  } catch {}
  return null;
}

export class MockInstanceApi implements InstanceApi {
  constructor(private id: string = 'hq-lab', private delay = 250) {}
  private wait<T>(v: T): Promise<T> { return new Promise((r) => setTimeout(() => r(v), this.delay)); }
  status() { return this.wait(sampleInstances.find((i) => i.id === this.id) ?? sampleInstances[0]); }
  findings() { return this.wait(sampleFindings.filter((f) => f.instanceId === this.id || this.id !== 'hq-lab' && f.severity !== 'critical')); }
  finding(id: string) { return this.wait(sampleFindings.find((f) => f.id === id)); }
  ack() { return this.wait(undefined); }
  snooze() { return this.wait(undefined); }
  alerts() { return this.wait(sampleAlerts); }
}

export class HttpInstanceApi implements InstanceApi {
  constructor(private base: string, private token: string) {}
  private async get<T>(path: string): Promise<T> {
    const r = await fetch(this.base.replace(/\/$/, '') + '/api/mobile/v1' + path, { headers: { Authorization: 'Bearer ' + this.token, Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return (await r.json()) as T;
  }
  private async post(path: string, body?: unknown): Promise<void> {
    const r = await fetch(this.base.replace(/\/$/, '') + '/api/mobile/v1' + path, { method: 'POST', headers: { Authorization: 'Bearer ' + this.token, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  }
  status() { return this.get<Instance>('/status'); }
  findings() { return this.get<Finding[]>('/findings?status=open&limit=200'); }
  finding(id: string) { return this.get<Finding>('/findings/' + encodeURIComponent(id)); }
  ack(id: string) { return this.post('/findings/' + encodeURIComponent(id) + '/ack'); }
  snooze(id: string, hours: number) { return this.post('/findings/' + encodeURIComponent(id) + '/snooze', { hours }); }
  alerts() { return this.get<Alert[]>('/alerts'); }
}

/** Until Hexward Core ships /api/mobile/v1, every paired instance is served by the mock (pairing token 'sample-token'). */
export function apiFor(instance: { id: string; url: string } | null, token?: string): InstanceApi {
  if (instance && token && token !== 'sample-token') return new HttpInstanceApi(instance.url, token);
  return new MockInstanceApi(instance?.id ?? 'hq-lab');
}
