# MatchFlow Mobile (Capacitor)

This repository is packaged as a **publishable mobile app** with Capacitor for Android and iOS app stores.

## Included
- Mobile web app UI (`index.html`, `styles.css`, `app.js`)
- PWA files (`manifest.webmanifest`, `sw.js`)
- Capacitor config (`capacitor.config.json`)
- Native projects:
  - `android/` (Google Play pipeline)
  - `ios/` (App Store pipeline)
- Store release docs/templates:
  - `STORE_RELEASE_CHECKLIST.md`
  - `store-listing/google-play-listing-template.md`
  - `store-listing/app-store-listing-template.md`

## Setup
```bash
npm install
npm run build:web
npm run cap:sync
```

## Open native projects
```bash
npm run android:open
npm run ios:open
```

## Release helper scripts
```bash
npm run release:summary
npm run release:android:aab
npm run release:android:apk
npm run release:ios:archive
```

## Android publish flow (Play Store)
1. Ensure Java **JDK 21** is active.
2. Open Android Studio (`npm run android:open`).
3. Configure signing key / release config.
4. Build signed AAB (`npm run release:android:aab` or Android Studio GUI).
5. Upload AAB to Google Play Console.
6. Complete Data Safety + content rating forms.

## iOS publish flow (App Store)
1. Open Xcode (`npm run ios:open`).
2. Set Team, Bundle Identifier, and signing profile.
3. Increase build/version numbers.
4. Archive app (`npm run release:ios:archive` or Xcode Organizer).
5. Upload to App Store Connect and complete App Privacy info.

## Before submitting
- Replace placeholder support/privacy URLs in listing templates.
- Replace app icons/splash screens with brand assets.
- Run the checklist in `STORE_RELEASE_CHECKLIST.md`.
