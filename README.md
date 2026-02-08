# MatchFlow Mobile APK

You asked for a simple APK workflow (no Play Store/App Store setup). This repo now supports that directly.

## Build APK in one command
```bash
npm install
npm run apk:build
```

When complete, your APK will be at:
- `release/MatchFlowMobile-debug.apk`

## Install on your phone
1. Copy `release/MatchFlowMobile-debug.apk` to your Android phone.
2. Open it and allow installation from this source (if prompted).
3. Install the app.

## Notes
- This builds a **debug APK** for easy sideloading.
- If your machine is missing Android SDK/JDK, install:
  - Android SDK (set `ANDROID_SDK_ROOT` if not in default location)
  - JDK 21
