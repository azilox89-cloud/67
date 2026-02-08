const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const wrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');
const gradleWrapperUrl = 'https://raw.githubusercontent.com/gradle/gradle/v8.14.3/gradle/wrapper/gradle-wrapper.jar';
const sdkDir = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || '/usr/lib/android-sdk';

const releaseDir = path.join(rootDir, 'release');
const releasesDir = path.join(rootDir, 'releases');

function run(command, opts = {}) {
  execSync(command, {
    stdio: 'inherit',
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
    ...opts,
  });
}

function tryRun(command, opts = {}) {
  try {
    run(command, opts);
    return true;
  } catch {
    return false;
  }
}

function downloadWrapperJar(destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  // Most reliable across environments where Node HTTPS may be restricted behind proxy.
  if (tryRun(`curl -fsSL -o "${destination}" "${gradleWrapperUrl}"`)) return;

  if (process.platform === 'win32') {
    const ps = `Invoke-WebRequest -Uri '${gradleWrapperUrl}' -OutFile '${destination.replace(/\\/g, '\\\\')}'`;
    if (tryRun(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${ps}"`)) return;
  }

  throw new Error('Failed to download gradle-wrapper.jar. Install curl or place the file at android/gradle/wrapper/gradle-wrapper.jar');
}

function main() {
  process.chdir(rootDir);

  // Create output folders early so users can find them even if build fails later.
  fs.mkdirSync(releaseDir, { recursive: true });
  fs.mkdirSync(releasesDir, { recursive: true });

  run('npm run cap:sync');

  if (!fs.existsSync(wrapperJar)) {
    console.log('Gradle wrapper JAR missing; downloading...');
    downloadWrapperJar(wrapperJar);
  }

  if (fs.existsSync(sdkDir)) {
    fs.writeFileSync(path.join(androidDir, 'local.properties'), `sdk.dir=${sdkDir}\n`, 'utf8');
  }

  const env = { ...process.env };
  run(process.platform === 'win32' ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug', { cwd: androidDir, env });

  const apkSrc = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const releaseApk = path.join(releaseDir, 'MatchFlowMobile-debug.apk');
  const releasesApk = path.join(releasesDir, 'MatchFlowMobile-debug.apk');

  fs.copyFileSync(apkSrc, releaseApk);
  fs.copyFileSync(apkSrc, releasesApk);

  console.log(`APK ready: ${releaseApk}`);
  console.log(`APK mirror: ${releasesApk}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
