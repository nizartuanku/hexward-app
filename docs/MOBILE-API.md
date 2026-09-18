# Hexward Core — mobile API contract (`/api/mobile/v1`)

The mobile app talks **only** to instances the user pairs with it. Every request carries
`Authorization: Bearer <token>` obtained during pairing. TLS is required; a self-signed
certificate is accepted only after the user confirms its fingerprint on the pairing screen.

## Pairing

The dashboard (Settings › Mobile) shows a QR code with this payload:

```
hexward://pair?u=https://hexward.corp.example.net&c=<one-time code>&f=sha256:<fingerprint>&n=hq-lab
```

`POST /api/mobile/v1/pair` `{ "code": "<one-time code>", "device": "<model>" }`
→ `200 { "token": "<bearer>", "instance": { "id", "nickname", "tenant", "version", "modules": [] } }`

The one-time code expires after 10 minutes and is single-use. Tokens are revocable from the dashboard.

## Read endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/status` | `{ nickname, tenant, version, modules[], health: "healthy"\|"attention"\|"offline", lastSynced }` |
| GET | `/findings?status=open&severity=&module=&limit=` | `Finding[]` |
| GET | `/findings/:id` | `Finding` |
| GET | `/alerts?since=` | `Alert[]` |
| GET | `/modules/:slug/summary` | module-specific summary (see below) |

`Finding`:
```json
{ "id": "f-001", "title": "any/any permit on OUTSIDE_IN", "severity": "critical",
  "module": "rulehawk", "host": "fw-edge-01", "when": "2026-09-18T07:02:00Z",
  "status": "open", "summary": "…", "evidence": ["…"], "remediation": ["…"] }
```
Severity is one of `critical | high | medium | low | info`.

## Write endpoints

| Method | Path | Body |
|---|---|---|
| POST | `/findings/:id/ack` | — |
| POST | `/findings/:id/snooze` | `{ "hours": 24 }` |
| POST | `/findings/:id/false-positive` | `{ "note": "" }` |
| POST | `/alerts/mute` | `{ "source": "198.51.100.23", "hours": 24 }` |
| POST | `/push/register` | `{ "platform": "ios"\|"android", "token": "<APNs/FCM>" }` (only when the user opted in) |

## Module summaries (`/modules/:slug/summary`)

- `rulehawk`: `{ firewalls: [{ name, rules, anyAny, shadowed, duplicates, lastAudit }] }`
- `topolight`: `{ devices: [{ host, status, latencyMs, neighbors }] }`
- `certlight`: `{ certs: [{ host, notAfter, daysLeft, chainOk }] }`
- `asm`: `{ exposures: [{ ip, port, service, firstSeen, new }] }`
- `decoy`: `{ traps: [{ name, kind, armed, lastTrip }], trips: [] }`
- `patchlight`: `{ hosts: [{ host, kev, cves }] }`
- `dmarcwatch`: `{ domains: [{ domain, policy, aligned, failing: [] }] }`
- `tenantwatch`: `{ score, controls: [{ id, title, pass }] }`
- `loglight`: `{ events: [{ at, host, message, severity }] }`
- `reports`: `{ reports: [{ id, kind: "executive"\|"technical", generatedAt, url }] }`

## Errors

`401` invalid or revoked token · `404` unknown id · `429` rate-limited (the app backs off 60 s) · `503` instance busy.
All responses are JSON; `Content-Type: application/json`.
