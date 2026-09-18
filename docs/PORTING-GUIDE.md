# Porting guide — artboards (canvas v4) → Expo Router screens

You are porting one group of screens of the Hexward mobile app from the design artboards to React Native (Expo SDK 57, expo-router 57, TypeScript strict). Read this whole file first.

## Sources
- Artboards: `/home/claude/hexward-app/artboards/iOS-NN-*.dc.html` and `Android-NN-*.dc.html` (static HTML+CSS with `{{c.xxx}}` palette holes). Read the **iOS** artboard for content and hierarchy, glance at the Android one for Material differences. Do not copy pixel values blindly — use the tokens.
- Navigation targets: `/home/claude/hexward-app/proto/hotspots-clean.json` — per screen, `{label, to}` where `to` is a screen number, `back:NN`, `tab:home`, `toast:<message>`, `ext:<message>`, `ack:NN`. Reproduce every hotspot as a real interaction.
- Design tokens & rules: `/home/claude/hexward-app/KIT.md` (§2 tokens, §4 platform chrome, §6 sample data).
- Brief (product rules): `/mnt/user-data/outputs/PROMPT-DESIGN-hexward-mobile-app.md` — §9 funnel rules, §12 decisions. Key rules: **no prices, no Buy/Upgrade/Subscribe anywhere (STORE_SAFE_PRICING=true)**; every external link goes through `openExternal()` (system browser after a "Leaving Hexward" sheet); marketing notifications separate from security alerts; no account, no cloud; About shows "Hexward Labs" only; copy tone calm, no exclamation marks, no emoji; sample data only from `src/data/sample.ts` (RFC 5737 IPs, example.* domains).

## Foundation (READ these files; do not modify them — if you need a change, add a note to `docs/FOUNDATION-REQUESTS.md` and work around it locally)
- `src/theme/tokens.ts`, `src/theme/ThemeContext.tsx` — `const { p, ios, scheme } = useTheme()`; `p.accent`, `p.surface`, etc. Never hard-code `#5EB3F6`.
- `src/components/Text.tsx` — `<Text v="largeTitle|title|headline|body|callout|caption|label|mono" tone="text|text2|text3|accent|critical|…" semibold num center>`.
- `src/components/Primitives.tsx` — `Screen` (pass `tabbed` for tab screens so content clears the tab bar; `scroll={false}` for fixed layouts; `padded={false}` if you manage horizontal padding), `Button` (`kind` primary/secondary/ghost/destructive, `small`, `icon`), `IconButton`, `Card`, `SectionHeader`, `ListRow`, `SeverityPill`, `Chip`, `Tag`, `ProductTag`, `Segmented`, `Divider`, `Spacer`, `Row`, `LastSynced`, `EmptyState`, `Skeleton`, `StatTile`, `KV`.
- `src/components/Chrome.tsx` — `TopBar` (`title`, `back` = true or back label, `actions=[{icon,label,onPress,badge}]`, `subtitle`), `Sheet` (bottom sheet), `LeavingSheet`.
- `src/components/Blocks.tsx` — `QuickTools`, `VideoThumb`.
- `src/icons/Icon.tsx` — `<Icon name=… size color strokeWidth/>`, `productIcon[slug]`, `severityIcon[sev]`, `NibbleMark`.
- `src/state/AppState.tsx` — `useApp()`: `paired`, `current`, `instances`, `followed`, `toggleFollow(slug)`, `findingStatus`, `setFindingStatus(id, 'acknowledged'|'snoozed'|null)`, `alertsRead`, `markAlertsRead(ids)`, `muteSource(src)`, `reminders`, `toggleReminder(id)`, `notif`, `set('notif', …)`, `license`, `pair(inst, token)`, `pairSample()`, `unpair(id)`, `switchInstance(id)`, `reset()`.
- `src/state/Toast.tsx` — `const { toast, openExternal } = useToast()`; `toast('Snoozed for 24 h')`; `openExternal(url, 'GitHub')`.
- `src/data/sample.ts` — instances, findings, alerts, products, bundles, campaigns, videos, tutorials, toolHistory, certResult, mailResult, exposureResult, ruleLintResult, `productBySlug`, `moduleName`.
- `src/lib/instanceApi.ts` — `apiFor(current, 'sample-token')` returns the mock adapter (250 ms delay) → show a `Skeleton` while loading.
- `src/config.ts` — `STORE_SAFE_PRICING`, `LINKS`.
- Exemplar screens: `app/welcome.tsx` (01) and `app/(tabs)/home/index.tsx` (06/07/08). Match their style exactly: hooks at top, `Screen` + `TopBar`, sections with `SectionHeader`, cards, list rows, accessibility labels on every pressable.

## Routing (expo-router, file = route). Use `useRouter()`; push with object form for dynamic routes: `router.push({ pathname: '/(tabs)/console/finding/[id]', params: { id } })`. Static: `router.push('/(tabs)/tools/cert')`. Back = `TopBar back`. Params: `useLocalSearchParams<{ id: string }>()`.

| Screen | Route file |
|---|---|
| 02 Privacy & notifications | `app/privacy.tsx` |
| 03 Pair scan QR | `app/pair/scan.tsx` |
| 04 Pair manual | `app/pair/manual.tsx` |
| 05 Pairing success | `app/pair/success.tsx` |
| 51a Error pairing | `app/pair/error.tsx` |
| 09 Instance switcher | `app/(tabs)/home/instances.tsx` |
| 10 Global search | `app/(tabs)/home/search.tsx` |
| 11 Findings list / 13 filter sheet / 48a empty console / 48b empty findings / 49b skeleton / 50 offline | `app/(tabs)/console/index.tsx` (+ `filter` as a Sheet inside; states by `useApp().paired`, `current.status==='offline'`, and a `?sev=` param) |
| 12 Finding detail | `app/(tabs)/console/finding/[id].tsx` |
| 14 Alerts inbox | `app/(tabs)/console/alerts.tsx` |
| 15 Alert detail | `app/(tabs)/console/alert/[id].tsx` |
| 17–26 module screens (rulehawk, loglight, topolight, certlight, decoy, patchlight, asm, dmarcwatch, tenantwatch, reports) | `app/(tabs)/console/module/[slug].tsx` (one file, switch on slug; shared header/summary; module-specific body) |
| 16 Notification settings | `app/settings/notifications.tsx` |
| 27 Tools hub / 48c empty history | `app/(tabs)/tools/index.tsx` |
| 28 Cert Check input → 29 result | `app/(tabs)/tools/cert.tsx` (input state → result state with a `Skeleton` in between; `?host=` param prefill) |
| 30 Mail Auth result | `app/(tabs)/tools/mail.tsx` (input then result) |
| 31 Exposure result | `app/(tabs)/tools/exposure.tsx` |
| 32 Rule Lint / 51b error tool | `app/(tabs)/tools/rulelint.tsx` (paste box → result; an "Unparseable input" error state) |
| 33 Learn home / 48d offline | `app/(tabs)/learn/index.tsx` |
| 34 Tutorial reader | `app/(tabs)/learn/tutorial/[slug].tsx` |
| 35 Guide detail | `app/(tabs)/learn/guide/[slug].tsx` |
| 36 Video library | `app/(tabs)/learn/videos.tsx` |
| 37 Video player / 51 video unavailable | `app/(tabs)/learn/video/[id].tsx` (a dark 16:9 player box with controls, transcript toggle, related product tag → product page; Share = system share sheet via `Share.share`) |
| 38 Catalog | `app/(tabs)/products/index.tsx` |
| 39 Product detail V1 (40 V2 behind `!STORE_SAFE_PRICING`) | `app/(tabs)/products/[slug].tsx` |
| 41a Bundle detail V1 (41b V2 behind flag) | `app/(tabs)/products/bundle/[slug].tsx` |
| 42 Campaigns feed | `app/(tabs)/products/campaigns.tsx` |
| 43 Campaign detail | `app/(tabs)/products/campaign/[id].tsx` |
| 44 Followed products | `app/(tabs)/products/followed.tsx` |
| 45 Settings | `app/settings/index.tsx` |
| 46 Instances manager | `app/settings/instances.tsx` |
| 47 License | `app/settings/license.tsx` |
| About | `app/settings/about.tsx` |

## Rules
1. TypeScript strict, no `any`, no unused imports. Run `npx tsc --noEmit` in `/home/claude/hexward-mobile` before you finish; it must print nothing.
2. Every pressable: `accessibilityRole` + `accessibilityLabel` (Card/ListRow/Button already handle it when given labels). Touch targets ≥44.
3. Severity always icon + label (`SeverityPill` or `severityIcon`), never color alone.
4. Platform: use `ios` from `useTheme()` for chrome differences (already inside TopBar/Sheet/Chip/TabBar). Do not import Platform directly unless needed for a native API.
5. Loading: any screen that reads instance data shows `Skeleton` blocks for the first ~250 ms (mock delay). Empty and error states from the artboards must exist (48x, 49x, 50, 51x).
6. No new dependencies. Native modules available: expo-camera (`CameraView`, `useCameraPermissions`), expo-clipboard, expo-haptics, expo-web-browser (only via `openExternal`), expo-secure-store, `Share` from react-native.
7. Web must still bundle (Playwright verification runs on `expo export --platform web`): guard native-only APIs with `Platform.OS !== 'web'` where they would crash on web (camera → show a "Camera not available on web — use manual entry / Demo pair" fallback).
8. Do not touch files outside your assignment. Do not edit foundation files. If a foundation change is required, note it in `docs/FOUNDATION-REQUESTS.md` (append) and keep your screen compiling.
9. Copy text from the artboards verbatim where present; where the artboard has placeholder text, use `src/data/sample.ts`.
10. Route files export exactly one default component. Helper components go in the same file (not exported) or in `src/components/<Group>.tsx` if shared inside your group only.
