/**
 * Sample data — KIT §6 only: example.* domains, RFC 5737 IPs, fictional hostnames.
 * Used by the mock instance adapter and by catalog/learn content until the real feeds exist.
 */
import type { Severity } from '@/theme/tokens';

export interface Instance { id: string; nickname: string; tenant: string; url: string; version: string; modules: string[]; status: 'healthy' | 'attention' | 'offline'; lastSynced: string; }
export interface Finding { id: string; title: string; severity: Severity; module: string; host: string; instanceId: string; age: string; when: string; status: 'open' | 'acknowledged' | 'snoozed' | 'resolved'; summary: string; evidence: string[]; remediation: string[]; }
export interface Alert { id: string; findingId: string; title: string; severity: Severity; module: string; instanceId: string; age: string; when: string; read: boolean; source?: string; }
export interface Product { slug: string; name: string; tagline: string; version: string; released: string; what: string; who: string[]; features: { name: string; free: boolean; pro: boolean; team: boolean }[]; github: string; web: string; category: 'firewall' | 'network' | 'exposure' | 'identity' | 'bundle'; tutorial?: string; video?: string; launch?: string; priceV2?: { pro: string; team: string; trial: string }; }
export interface Campaign { id: string; kind: 'Coming' | 'Release notes' | 'Founding' | 'Challenge' | 'Promo'; title: string; product?: string; date: string; body: string; cta?: { label: string; url?: string; toast?: string }; code?: string; }
export interface Video { id: string; title: string; duration: string; short: boolean; product?: string; series: string; transcript: string[]; }
export interface Tutorial { slug: string; title: string; product: string; minutes: number; steps: { heading: string; body: string; code?: string }[]; }

export const instances: Instance[] = [
  { id: 'hq-lab', nickname: 'hq-lab', tenant: 'Head office', url: 'https://hexward.corp.example.net', version: 'Core 0.4.2', modules: ['rulehawk', 'loglight', 'topolight', 'certlight', 'decoy', 'patchlight', 'asm', 'dmarcwatch', 'tenantwatch'], status: 'attention', lastSynced: '2 min ago' },
  { id: 'client-alpha', nickname: 'client-alpha', tenant: 'Alpha Retail', url: 'https://sec.alpha.example.com', version: 'Core 0.4.1', modules: ['rulehawk', 'certlight', 'asm'], status: 'healthy', lastSynced: '12 min ago' },
  { id: 'client-beta', nickname: 'client-beta', tenant: 'Beta Clinic', url: 'https://sec.beta.example.com', version: 'Core 0.4.0', modules: ['rulehawk', 'dmarcwatch', 'tenantwatch'], status: 'offline', lastSynced: 'Yesterday' },
];

export const findings: Finding[] = [
  { id: 'f-001', title: 'any/any permit on OUTSIDE_IN', severity: 'critical', module: 'rulehawk', host: 'fw-edge-01', instanceId: 'hq-lab', age: '12 min ago', when: '2026-09-18 14:02 +07', status: 'open', summary: 'Rule 3 in OUTSIDE_IN permits any source to any destination on any service. It precedes every deny in the chain, so the chain is effectively open.', evidence: ['access-list OUTSIDE_IN extended permit ip any any', 'hits (7 d): 1,284,331', 'first seen: 2026-08-30 03:11 +07'], remediation: ['Replace with explicit object-groups for the three published services.', 'Move the rule below the geo-deny block.', 'Re-run the audit; expect 0 any/any permits.'] },
  { id: 'f-002', title: 'Rule 47 shadowed by rule 12', severity: 'high', module: 'rulehawk', host: 'fw-edge-01', instanceId: 'hq-lab', age: '3 h ago', when: '2026-09-18 11:20 +07', status: 'open', summary: 'Rule 47 can never match: rule 12 already permits the same 5-tuple. Dead rules hide intent and slow reviews.', evidence: ['rule 12: permit tcp 192.0.2.0/24 → 203.0.113.0/24 eq 443', 'rule 47: permit tcp 192.0.2.10 → 203.0.113.7 eq 443', 'hits rule 47 (90 d): 0'], remediation: ['Delete rule 47 or tighten rule 12.', 'Add a change note referencing ticket CHG-2231.'] },
  { id: 'f-003', title: 'Certificate expires in 9 days — vpn.example.com', severity: 'high', module: 'certlight', host: 'vpn.example.com', instanceId: 'hq-lab', age: '1 h ago', when: '2026-09-18 13:05 +07', status: 'open', summary: 'Leaf certificate for vpn.example.com expires 2026-09-27. No renewal observed on the ACME schedule.', evidence: ['notAfter: 2026-09-27 08:00 UTC', 'issuer: Example CA R3', 'SANs: vpn.example.com, vpn2.example.com'], remediation: ['Trigger renewal on the ACME client.', 'Verify the chain after rotation (Cert Check tool).'] },
  { id: 'f-004', title: 'Port 3389 exposed — 203.0.113.7', severity: 'critical', module: 'asm', host: '203.0.113.7', instanceId: 'hq-lab', age: '25 min ago', when: '2026-09-18 13:49 +07', status: 'open', summary: 'RDP reachable from the internet on 203.0.113.7. No NLA banner detected.', evidence: ['tcp/3389 open, banner: RDP 10.x', 'first seen: 2026-09-18 13:40 +07', 'owner tag: srv-db-03 (NAT)'], remediation: ['Close 3389 on fw-edge-02 NAT policy.', 'Require VPN or a bastion for admin access.'] },
  { id: 'f-005', title: 'Decoy tripped: SMB share touched from 198.51.100.23', severity: 'critical', module: 'decoy', host: 'srv-db-03', instanceId: 'hq-lab', age: '40 min ago', when: '2026-09-18 13:34 +07', status: 'open', summary: 'A canary share on srv-db-03 was enumerated and one file opened. No legitimate process reads this share.', evidence: ['source: 198.51.100.23 (dist-sw-01 VLAN 30)', 'file: payroll_2026.xlsx (decoy)', 'user: svc-backup (unexpected)'], remediation: ['Isolate 198.51.100.23 at dist-sw-01.', 'Rotate svc-backup credentials.', 'Pull Loglight timeline for 13:20–13:40.'] },
  { id: 'f-006', title: 'CVE-2026-1234 KEV, 3 hosts', severity: 'high', module: 'patchlight', host: 'web-01', instanceId: 'hq-lab', age: '6 h ago', when: '2026-09-18 08:10 +07', status: 'open', summary: 'Known-exploited vulnerability present on web-01, srv-db-03, dist-sw-01. Vendor fix available.', evidence: ['web-01: openssl 3.0.13 (fixed in 3.0.16)', 'srv-db-03: openssl 3.0.13', 'dist-sw-01: firmware 16.9.4 (fixed in 16.9.6)'], remediation: ['Patch web-01 first (internet-facing).', 'Schedule dist-sw-01 firmware in the Friday window.'] },
  { id: 'f-007', title: 'DMARC p=none on example.com', severity: 'medium', module: 'dmarcwatch', host: 'example.com', instanceId: 'hq-lab', age: 'Yesterday', when: '2026-09-17 09:30 +07', status: 'open', summary: 'Policy is monitor-only. 3.2% of mail claiming example.com fails alignment.', evidence: ['v=DMARC1; p=none; rua=mailto:dmarc@example.com', 'aligned: 96.8% (7 d)', 'top failing source: 198.51.100.40'], remediation: ['Move to p=quarantine; pct=25.', 'Add SPF include for the newsletter sender or drop it.'] },
  { id: 'f-008', title: 'core-sw-02 down 6 min', severity: 'critical', module: 'topolight', host: 'core-sw-02', instanceId: 'hq-lab', age: '6 min ago', when: '2026-09-18 14:08 +07', status: 'open', summary: 'ICMP and SNMP unreachable since 14:02. Upstream dist-sw-01 still sees the LLDP neighbor as stale.', evidence: ['last SNMP: 2026-09-18 14:01:52 +07', 'LLDP neighbor age: 6 min', 'uplink Te1/1/1: down'], remediation: ['Check power and uplink on core-sw-02.', 'If replaced, re-discover from TopoLight.'] },
  { id: 'f-009', title: 'MFA not enforced for 4 admins', severity: 'high', module: 'tenantwatch', host: 'corp.example.net', instanceId: 'hq-lab', age: '2 h ago', when: '2026-09-18 12:15 +07', status: 'open', summary: 'Four Global Administrator accounts have no MFA registration.', evidence: ['admin-backup@corp.example.net', 'it-oncall@corp.example.net', '+2 more'], remediation: ['Enforce a conditional-access policy for admin roles.', 'Register FIDO2 keys for the on-call account.'] },
];

export const alerts: Alert[] = [
  { id: 'a-001', findingId: 'f-001', title: 'any/any permit on OUTSIDE_IN', severity: 'critical', module: 'rulehawk', instanceId: 'hq-lab', age: '12 min ago', when: '2026-09-18 14:02 +07', read: false },
  { id: 'a-002', findingId: 'f-008', title: 'core-sw-02 down 6 min', severity: 'critical', module: 'topolight', instanceId: 'hq-lab', age: '6 min ago', when: '2026-09-18 14:08 +07', read: false },
  { id: 'a-003', findingId: 'f-004', title: 'Port 3389 exposed — 203.0.113.7', severity: 'critical', module: 'asm', instanceId: 'hq-lab', age: '25 min ago', when: '2026-09-18 13:49 +07', read: false, source: '203.0.113.7' },
  { id: 'a-004', findingId: 'f-005', title: 'Decoy tripped: SMB share touched from 198.51.100.23', severity: 'critical', module: 'decoy', instanceId: 'hq-lab', age: '40 min ago', when: '2026-09-18 13:34 +07', read: false, source: '198.51.100.23' },
  { id: 'a-005', findingId: 'f-003', title: 'Certificate expires in 9 days — vpn.example.com', severity: 'high', module: 'certlight', instanceId: 'hq-lab', age: '1 h ago', when: '2026-09-18 13:05 +07', read: true },
  { id: 'a-006', findingId: 'f-006', title: 'CVE-2026-1234 KEV, 3 hosts', severity: 'high', module: 'patchlight', instanceId: 'hq-lab', age: '6 h ago', when: '2026-09-18 08:10 +07', read: true },
  { id: 'a-007', findingId: 'f-009', title: 'MFA not enforced for 4 admins', severity: 'high', module: 'tenantwatch', instanceId: 'hq-lab', age: '2 h ago', when: '2026-09-18 12:15 +07', read: true },
  { id: 'a-008', findingId: 'f-007', title: 'DMARC p=none on example.com', severity: 'medium', module: 'dmarcwatch', instanceId: 'hq-lab', age: 'Yesterday', when: '2026-09-17 09:30 +07', read: true },
];

export const GITHUB = 'https://github.com/nizartuanku';
export const WEB = 'https://hexwardlabs.com';

const std = (extra: Product['features'] = []): Product['features'] => [
  { name: 'Core audit / monitor', free: true, pro: true, team: true },
  { name: 'Scheduled runs & alerts', free: false, pro: true, team: true },
  { name: 'Workspace per client', free: false, pro: false, team: true },
  ...extra,
];

export const products: Product[] = [
  { slug: 'rulehawk', name: 'RuleHawk', tagline: 'Firewall rule audit: duplicates, shadowed and overly permissive rules', version: '0.1.1', released: '2026-09-10', category: 'firewall', what: 'Parses iptables, ASA/FTD, PAN-OS, FortiGate and pfSense rulesets and reports duplicate, shadowed and any/any rules per chain or ACL.', who: ['Network and security engineers', 'MSSPs reviewing client firewalls', 'Auditors who need evidence, not opinions'], features: std([{ name: 'Rule audit, 5 vendors', free: true, pro: true, team: true }, { name: 'Multi-firewall, schedules', free: false, pro: true, team: true }]), github: GITHUB + '/rulehawk', web: WEB + '/rulehawk', tutorial: 'rulehawk-first-audit', video: 'v-003', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'ruleforge', name: 'RuleForge', tagline: 'Convert and migrate firewall configurations between vendors', version: '0.1.2', released: '2026-09-12', category: 'firewall', what: 'Reads one vendor’s policy and emits another’s, with a diff you can review before you paste.', who: ['Teams migrating ASA to FTD or PAN-OS', 'Consultants doing repeat migrations'], features: std([{ name: 'ASA → FTD / PAN-OS', free: true, pro: true, team: true }]), github: GITHUB + '/ruleforge', web: WEB + '/ruleforge', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'loglight', name: 'Loglight', tagline: 'SIEM-lite: syslog and NetFlow timeline with a 3D traffic map', version: '0.2.0', released: '2026-09-05', category: 'network', what: 'Ingests syslog and NetFlow/IPFIX, builds a timeline and a traffic map without a data lake.', who: ['Small SOCs', 'Engineers who need “what talked to what” fast'], features: std([{ name: 'Traffic Map (NetFlow/IPFIX)', free: true, pro: true, team: true }]), github: GITHUB + '/loglight', web: WEB + '/loglight', video: 'v-001', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'topolight', name: 'TopoLight', tagline: 'Self-hosted NMS: discovery, SNMP/ICMP, LLDP topology', version: '0.1.0', released: '2026-10-06', category: 'network', what: 'Discovers a /24 in 90 seconds, polls SNMP and ICMP, and draws the LLDP topology.', who: ['Network engineers replacing spreadsheets', 'MSPs monitoring many small sites'], features: std([{ name: 'Discovery + topology', free: true, pro: true, team: true }]), github: GITHUB + '/topolight', web: WEB + '/topolight', video: 'v-005', launch: 'Tue 6 Oct', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'certlight', name: 'CertLight', tagline: 'TLS certificate monitor with expiry and chain checks', version: '0.1.2', released: '2026-09-08', category: 'exposure', what: 'Watches certificates on hosts you list, alerts on expiry, weak chains and CT log surprises.', who: ['Anyone who has been paged by an expired cert'], features: std([{ name: 'Expiry + chain checks', free: true, pro: true, team: true }]), github: GITHUB + '/certlight', web: WEB + '/certlight', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'asm', name: 'Attack Surface Monitor', tagline: 'External exposure: open ports, services and drift', version: '0.1.2', released: '2026-09-09', category: 'exposure', what: 'Scans your public ranges on a schedule and reports new ports, services and TLS drift.', who: ['Teams with a handful of public IPs and no time'], features: std([{ name: 'Exposure scan, drift alerts', free: true, pro: true, team: true }]), github: GITHUB + '/attack-surface-monitor', web: WEB + '/asm', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'decoy', name: 'Decoy', tagline: 'Canary tokens and shares that actually get tripped', version: '0.1.2', released: '2026-09-07', category: 'exposure', what: 'Drops decoy files, shares and credentials; any touch is a high-signal alert.', who: ['Blue teams that want early warning without a SIEM'], features: std([{ name: 'File, share and credential decoys', free: true, pro: true, team: true }]), github: GITHUB + '/decoy', web: WEB + '/decoy', video: 'v-004', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'patchlight', name: 'Patchlight', tagline: 'Vulnerability and KEV inventory over SSH', version: '0.1.3', released: '2026-09-11', category: 'exposure', what: 'Inventories packages and firmware over read-only SSH and matches them to CVE and KEV feeds.', who: ['Ops teams patching a mixed Linux and network estate'], features: std([{ name: 'KEV matching', free: true, pro: true, team: true }]), github: GITHUB + '/patchlight', web: WEB + '/patchlight', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'dmarcwatch', name: 'DmarcWatch', tagline: 'DMARC RUA monitor, self-hosted', version: '0.1.0', released: '2026-09-03', category: 'identity', what: 'Receives RUA reports and shows who sends as your domain and what fails alignment.', who: ['Anyone moving from p=none to p=reject'], features: std([{ name: 'RUA parsing, alignment view', free: true, pro: true, team: true }]), github: GITHUB + '/dmarcwatch', web: WEB + '/dmarcwatch', video: 'v-002', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'tenantwatch', name: 'TenantWatch', tagline: 'Read-only Microsoft 365 / Google Workspace posture auditor', version: '0.1.0', released: '2026-09-04', category: 'identity', what: 'Audits admin MFA, legacy auth, sharing and mailbox rules with read-only scopes.', who: ['SMB IT leads', 'MSPs auditing many tenants'], features: std([{ name: 'M365 + Workspace checks', free: true, pro: true, team: true }]), github: GITHUB + '/tenantwatch', web: WEB + '/tenantwatch', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'auditlight', name: 'AuditLight', tagline: 'Configuration audit against CIS-style baselines', version: '0.3.1', released: '2026-08-28', category: 'firewall', what: 'Checks device configs against baselines and produces an evidence-backed report.', who: ['Auditors and the engineers who answer them'], features: std([{ name: 'Baseline checks', free: true, pro: true, team: true }]), github: GITHUB + '/auditlight', web: WEB + '/auditlight', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
  { slug: 'posture-report', name: 'Posture Report', tagline: 'One report from every Hexward module: executive + technical', version: '0.1.0', released: '2026-09-06', category: 'bundle', what: 'Aggregates findings from all installed modules into an executive and a technical report, HTML and PDF.', who: ['MSPs reporting to clients', 'IT leads reporting upward'], features: std([{ name: 'Executive + technical PDF', free: true, pro: true, team: true }]), github: GITHUB + '/posture-report', web: WEB + '/posture-report', priceV2: { pro: '$29 / mo', team: '$99 / mo', trial: '14-day trial' } },
];

export const bundles: Product[] = [
  { slug: 'suite', name: 'Hexward Suite', tagline: 'All modules on one self-hosted core', version: 'Core 0.4.2', released: '2026-09-10', category: 'bundle', what: 'RuleHawk, Loglight, TopoLight, CertLight, ASM, Decoy, Patchlight, DmarcWatch, TenantWatch, AuditLight and Posture Report on one core, one login, one report.', who: ['Teams that want the whole toolbox', 'MSPs standardising on one stack'], features: std([{ name: 'All 11 modules', free: true, pro: true, team: true }]), github: GITHUB, web: WEB + '/suite', priceV2: { pro: '$65 / mo', team: '$199 / mo', trial: '14-day trial' } },
  { slug: 'essentials', name: 'Hexward Essentials (SMB)', tagline: 'The five checks every small business needs', version: 'Core 0.4.2', released: '2026-09-10', category: 'bundle', what: 'CertLight, ASM, DmarcWatch, TenantWatch and Posture Report for organisations under 200 people.', who: ['SMBs without a security team', 'MSPs with an SMB book'], features: std([{ name: '5 modules', free: true, pro: true, team: true }]), github: GITHUB, web: WEB + '/essentials', priceV2: { pro: '$39 / mo', team: '$119 / mo', trial: '14-day trial' } },
];

export const allProducts = [...products, ...bundles];
export const productBySlug = (slug: string) => allProducts.find((p) => p.slug === slug);
export const moduleName = (slug: string) => productBySlug(slug)?.name ?? (slug === 'asm' ? 'ASM' : slug);

export const campaigns: Campaign[] = [
  { id: 'c-001', kind: 'Coming', title: 'TopoLight launch — Tue 6 Oct', product: 'topolight', date: '2026-10-06', body: 'Discovery, SNMP/ICMP polling and LLDP topology, self-hosted. Free edition on GitHub at launch.', cta: { label: 'Remind me at launch', toast: 'Reminder set for Tue 6 Oct' } },
  { id: 'c-002', kind: 'Release notes', title: 'RuleHawk 0.1.1 — parser fixes, per-chain numbering', product: 'rulehawk', date: '2026-09-10', body: 'Fixes FortiGate nested groups, adds per-chain rule numbers in the report, and prints hit counts when the export includes them.', cta: { label: 'Free on GitHub', url: GITHUB + '/rulehawk/releases' } },
  { id: 'c-003', kind: 'Founding', title: 'Founding 10 — Team plan, 6 months', date: '2026-09-04', body: 'Ten teams get the Team plan for six months in exchange for one honest write-up. Managed onboarding, direct line to the maintainer.', cta: { label: 'Available on the web', url: WEB + '/founding' } },
  { id: 'c-004', kind: 'Challenge', title: 'Prove It: bring your worst ruleset', product: 'rulehawk', date: '2026-09-04', body: 'Send an anonymised ruleset; RuleHawk returns the audit in 24 hours. If it finds nothing, we say so publicly.', cta: { label: 'Available on the web', url: WEB + '/prove-it' } },
  { id: 'c-005', kind: 'Promo', title: 'HEXLAUNCH', date: '2026-09-15', body: 'Launch code for the web checkout. Sample only.', code: 'HEXLAUNCH', cta: { label: 'Copy code', toast: 'Code copied — paste it at checkout on the web' } },
];

export const videos: Video[] = [
  { id: 'v-001', title: 'Why your firewall has 40% dead rules', duration: '0:58', short: true, product: 'rulehawk', series: 'Shorts', transcript: ['Most rulesets grow by addition only.', 'Shadowed rules never match; duplicates double the review time.', 'RuleHawk counts both per chain.'] },
  { id: 'v-002', title: 'Reading a DMARC report in 3 minutes', duration: '3:12', short: false, product: 'dmarcwatch', series: 'Explainers', transcript: ['RUA reports arrive as XML, once a day, per receiver.', 'The two columns that matter: SPF alignment and DKIM alignment.', 'Move to p=quarantine when aligned mail is above 98%.'] },
  { id: 'v-003', title: 'RuleHawk walkthrough: first audit', duration: '6:40', short: false, product: 'rulehawk', series: 'Walkthroughs', transcript: ['Export the running config.', 'Run rulehawk audit --vendor asa export.txt.', 'Read the report top-down: any/any first, shadowed second.'] },
  { id: 'v-004', title: 'Canary tokens that actually get tripped', duration: '0:45', short: true, product: 'decoy', series: 'Shorts', transcript: ['A decoy nobody would open is a decoy nobody trips.', 'Name it like the real thing; put it where people look.'] },
  { id: 'v-005', title: 'TopoLight: discover a /24 in 90 seconds', duration: '1:30', short: false, product: 'topolight', series: 'Walkthroughs', transcript: ['Add the range, pick SNMP v3 credentials.', 'Discovery, then LLDP walk, then the map.'] },
];

export const tutorials: Tutorial[] = [
  { slug: 'rulehawk-first-audit', title: 'RuleHawk: your first audit', product: 'rulehawk', minutes: 8, steps: [
    { heading: 'Export the ruleset', body: 'On ASA/FTD: show running-config access-list. On PAN-OS: export the security policy as XML. Keep the export unedited.', code: 'show running-config access-list > fw-edge-01.txt' },
    { heading: 'Run the audit', body: 'RuleHawk reads the file and prints one report per chain or ACL.', code: 'rulehawk audit --vendor asa fw-edge-01.txt --out report.html' },
    { heading: 'Read top-down', body: 'Any/any permits first, then shadowed rules, then duplicates. Each row cites the rule numbers involved.' },
    { heading: 'Fix and re-run', body: 'Change one chain at a time and re-run. The diff view shows what the change removed.' },
  ] },
  { slug: 'migrate-asa-ftd', title: 'Migrate ASA to FTD without losing intent', product: 'ruleforge', minutes: 12, steps: [
    { heading: 'Baseline with RuleHawk', body: 'Audit the ASA first; migrating dead rules costs twice.' },
    { heading: 'Convert', body: 'RuleForge emits FTD objects and access-control rules with a review diff.', code: 'ruleforge convert --from asa --to ftd asa.cfg --out ftd/' },
    { heading: 'Review the diff', body: 'Every unmapped keyword is listed with a suggested equivalent. Nothing is silently dropped.' },
  ] },
  { slug: 'read-dmarc-report', title: 'Read a DMARC report', product: 'dmarcwatch', minutes: 5, steps: [
    { heading: 'Where reports come from', body: 'Receivers send RUA XML daily to the address in your DMARC record.' },
    { heading: 'Alignment, not pass/fail', body: 'A message can pass SPF and still fail DMARC if the domains do not align.' },
    { heading: 'When to tighten', body: 'Above 98% aligned for two weeks: p=quarantine; pct=25, then raise.' },
  ] },
];

export const toolHistory = [
  { id: 't-001', tool: 'cert', target: 'vpn.example.com', result: 'Expires in 9 days', tone: 'high' as const, age: '1 h ago' },
  { id: 't-002', tool: 'mail', target: 'example.com', result: 'SPF ok · DKIM ok · DMARC p=none', tone: 'medium' as const, age: '3 h ago' },
  { id: 't-003', tool: 'exposure', target: 'api.example.com', result: '2 open ports', tone: 'ok' as const, age: 'Yesterday' },
];

export const certResult = {
  host: 'vpn.example.com', port: 443, subject: 'CN=vpn.example.com', issuer: 'Example CA R3', notBefore: '2025-12-29 08:00 UTC', notAfter: '2026-09-27 08:00 UTC', daysLeft: 9,
  sans: ['vpn.example.com', 'vpn2.example.com'], sigAlg: 'ecdsa-with-SHA384', keyBits: 'EC P-384', tls: ['TLS 1.3', 'TLS 1.2'], chain: ['vpn.example.com', 'Example CA R3', 'Example Root X1'], chainOk: true, hsts: true, ocsp: 'good',
};
export const mailResult = {
  domain: 'example.com', spf: { status: 'ok' as const, record: 'v=spf1 include:_spf.example.com -all', lookups: 4 }, dkim: { status: 'ok' as const, selectors: ['mail', 's2'] }, dmarc: { status: 'warn' as const, record: 'v=DMARC1; p=none; rua=mailto:dmarc@example.com', policy: 'none' }, mx: ['mail.example.com (10)'], mtaSts: false, tlsRpt: false,
};
export const exposureResult = {
  target: 'api.example.com', ip: '203.0.113.7', ports: [{ port: 443, service: 'https', banner: 'nginx', ok: true }, { port: 22, service: 'ssh', banner: 'OpenSSH 9.6', ok: false, note: 'Admin service exposed' }], closed: 998, scannedAt: '2026-09-18 14:02 +07',
};
export const ruleLintResult = {
  input: 'access-list OUTSIDE_IN extended permit ip any any\naccess-list OUTSIDE_IN extended permit tcp 192.0.2.0 255.255.255.0 host 203.0.113.7 eq 443\naccess-list OUTSIDE_IN extended deny ip any any',
  issues: [{ line: 1, severity: 'critical' as const, msg: 'any/any permit precedes all denies' }, { line: 2, severity: 'low' as const, msg: 'Shadowed by line 1' }],
};
