#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
WRAPPER_JAR="$ANDROID_DIR/gradle/wrapper/gradle-wrapper.jar"
SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-/usr/lib/android-sdk}}"
JAVA_HOME_DEFAULT="/usr/lib/jvm/java-21-openjdk-amd64"

cd "$ROOT_DIR"

npm run cap:sync

if [[ ! -f "$WRAPPER_JAR" ]]; then
  echo "Gradle wrapper JAR missing; downloading..."
  curl -fsSL -o "$WRAPPER_JAR" \
    https://raw.githubusercontent.com/gradle/gradle/v8.14.3/gradle/wrapper/gradle-wrapper.jar
fi

if [[ -d "$SDK_DIR" ]]; then
  echo "sdk.dir=$SDK_DIR" > "$ANDROID_DIR/local.properties"
fi

if [[ -d "$JAVA_HOME_DEFAULT" ]]; then
  export JAVA_HOME="$JAVA_HOME_DEFAULT"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

cd "$ANDROID_DIR"
./gradlew assembleDebug

APK_SRC="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
APK_OUT_DIR="$ROOT_DIR/release"
APK_OUT="$APK_OUT_DIR/MatchFlowMobile-debug.apk"
mkdir -p "$APK_OUT_DIR"
cp "$APK_SRC" "$APK_OUT"

echo "APK ready: $APK_OUT"
