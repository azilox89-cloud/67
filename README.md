# MatchFlow Mobile APK

You asked for a simple APK workflow (no Play Store/App Store setup). This repo now supports that directly.

## Build APK in one command
```bash
npm install
npm run apk:build
```

> Windows PowerShell is supported. `apk:build` now runs a Node.js script (no Bash requirement).

When complete, your APK will be at:
- `release/MatchFlowMobile-debug.apk`
- `releases/MatchFlowMobile-debug.apk`

If build fails before Gradle finishes, the folders may still exist without an APK file inside yet.

## Install on your phone
1. Copy `release/MatchFlowMobile-debug.apk` (or `releases/MatchFlowMobile-debug.apk`) to your Android phone.
2. Open it and allow installation from this source (if prompted).
3. Install the app.

## Notes
- This builds a **debug APK** for easy sideloading.
- Required build tools:
  - Android SDK (`ANDROID_SDK_ROOT` or `ANDROID_HOME` should point to it)
  - JDK 21 (recommended for Gradle/Android plugin compatibility)


## Troubleshooting
- If you see `JAVA_HOME is not set` or `java command could not be found`, install **JDK 21**, reopen PowerShell, and set `JAVA_HOME` to your JDK path.
- If `release/` and `releases/` are present but empty, Gradle did not finish successfully yet, so no APK was produced. Read the first error in the terminal output and fix it, then run `npm run apk:build` again.
- Use `npm run apk:path` to quickly confirm where the APK was written.
