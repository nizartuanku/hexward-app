# Testing the app on a phone

## Android — install the APK (no developer account needed)
1. Open the repository's **Actions** tab → workflow **android-apk** → latest green run → download the
   `hexward-android-apk` artifact and unzip it.
2. Copy the `.apk` to the phone (or download it there), open it, allow installing from this source once.
3. Later builds install over the earlier one (same testing key). Uninstall only if you switch to a Play build.

## iOS — Expo Go (no developer account needed)
1. Install **Expo Go** from the App Store.
2. On a computer on the same Wi-Fi: `npm ci` then `npx expo start`.
3. Scan the QR code with the iPhone camera. The app loads inside Expo Go with live reload.
   Limits: push notifications are not available in Expo Go; camera pairing works.

## iOS — TestFlight (once the Apple Developer account exists)
An `ios-testflight` workflow will build a signed archive on the macOS runner and upload it with an
App Store Connect API key stored in repository secrets. Testers get an invite by e-mail.

## Web preview
`npm run export:web` then serve `./dist` with any static server (routes need SPA fallback to `index.html`).

## What to test first
Five walkthrough tasks from the design review, target tap counts in brackets:
1. Welcome → a product page (2)
2. Welcome → play a video (2)
3. Welcome → a pocket tool (2)
4. Alert detail → Acknowledge (1)
5. Tools hub → Cert Check result for vpn.example.com (2)
