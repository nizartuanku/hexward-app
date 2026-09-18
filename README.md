# Hexward — mobile app

Self-hosted security tools, now in your pocket. The companion app for the Hexward Labs toolset
(RuleHawk, Loglight, TopoLight, CertLight, Attack Surface Monitor, Decoy, Patchlight, DmarcWatch,
TenantWatch, AuditLight, Posture Report) for iOS and Android.

- **Console** — pair the app with your own self-hosted Hexward instance and see findings, alerts and
  module summaries. Acknowledge and snooze from the phone.
- **Tools** — pocket checks that run on the phone with no instance: Cert Check, Mail Auth, Exposure, Rule Lint.
- **Learn** — tutorials, guides and short videos.
- **Products** — the catalog, release notes and launch campaigns. Every product is free on GitHub.

No account. No cloud. No trackers. The app talks only to the instances you pair with it.

## Status

Release 1 target: **V1 Store-safe** — no prices and no purchase flows inside the app.
Current build ships with a mock instance adapter (`sample-token`) until Hexward Core exposes
`/api/mobile/v1` (see [docs/MOBILE-API.md](docs/MOBILE-API.md)).

## Stack

Expo SDK 57 · React Native 0.86 · expo-router · TypeScript (strict) · react-native-svg.
Design system: HDS v1 (Inter 400/600, 8-pt grid, Signal blue on dark only).

## Run it

```bash
npm ci
npx expo start          # scan the QR with Expo Go (iOS/Android) on the same Wi-Fi
npm run typecheck       # tsc --noEmit
npm run export:web      # static web preview in ./dist
```

## Builds

GitHub Actions builds an installable Android APK on every push to `main`
(**Actions → android-apk → artifact `hexward-android-apk`**) and a compile-check iOS Simulator
build on macOS runners. Store builds (Play App Signing, TestFlight) are added once the developer
accounts exist — see [docs/TESTING.md](docs/TESTING.md).

## Layout

```
app/                 expo-router routes (file = screen)
  welcome.tsx        01 Welcome (shown once)
  privacy.tsx        02 Privacy & notifications
  pair/              03 scan · 04 manual · 05 success · 51a error
  (tabs)/home        06/07/08 Home · 09 instances · 10 search
  (tabs)/console     11–16 findings, alerts, 17–26 module views
  (tabs)/tools       27–32 pocket tools
  (tabs)/learn       33–37 tutorials, guides, videos
  (tabs)/products    38–44 catalog, product, bundle, campaigns
  settings/          45 settings · 46 instances · 47 license · 16 notifications · about
src/theme            HDS tokens (dark/light palettes, type scale)
src/components       Text, Primitives, Chrome (TopBar/Sheet), TabBar, Blocks
src/icons            line icon set incl. product icons
src/data/sample.ts   sample data (RFC 5737 / example.* only)
src/state            AppState (device-only persistence), Toast + "Leaving Hexward" sheet
src/lib/instanceApi  mock + HTTP adapters for /api/mobile/v1
```

## License

MIT — see [LICENSE](LICENSE). © Hexward Labs.
