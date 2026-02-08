# Store Release Checklist (Android + iOS)

Use this checklist before publishing.

## 1) Identity and versioning
- [ ] Confirm app id: `com.matchflow.mobile` (Android `applicationId`, iOS `PRODUCT_BUNDLE_IDENTIFIER`).
- [ ] Increment Android `versionCode` and `versionName` in `android/app/build.gradle`.
- [ ] Increment iOS `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in Xcode (`ios/App/App.xcodeproj`).

## 2) Legal and policy requirements
- [ ] Create a public **Privacy Policy URL**.
- [ ] Create **Terms of Service URL**.
- [ ] Complete Data Safety form in Google Play Console.
- [ ] Complete App Privacy section in App Store Connect.

## 3) Branding and assets
- [ ] Replace default app icons/splash with production artwork.
- [ ] Prepare app screenshots (phone + tablet where required).
- [ ] Provide store listing copy using `store-listing/` templates.

## 4) Android release
- [ ] Configure release signing in Android Studio (keystore).
- [ ] Build signed AAB (`Build > Generate Signed Bundle/APK`).
- [ ] Upload `.aab` to Play Console.
- [ ] Resolve Play pre-launch report findings.

## 5) iOS release
- [ ] Set Apple Team and signing in Xcode.
- [ ] Archive app (`Product > Archive`).
- [ ] Upload archive to App Store Connect.
- [ ] Pass TestFlight checks and submit for review.

## 6) Quality checks
- [ ] Smoke test offline launch and tab navigation.
- [ ] Verify no debug logs or placeholder content.
- [ ] Verify performance and startup on real device.
