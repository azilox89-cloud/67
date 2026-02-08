const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const wrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');
const gradleWrapperUrl = 'https://raw.githubusercontent.com/gradle/gradle/v8.14.3/gradle/wrapper/gradle-wrapper.jar';
const sdkDir = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || '/usr/lib/android-sdk';

function executableFor(command) {
  if (process.platform === 'win32' && command === 'npm') {
    return 'npm.cmd';
  }
  return command;
}

function run(command, args, opts = {}) {
  const result = spawnSync(executableFor(command), args, { stdio: 'inherit', shell: false, ...opts });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
}

function tryRun(command, args, opts = {}) {
  const result = spawnSync(executableFor(command), args, { stdio: 'inherit', shell: false, ...opts });
  return !result.error && result.status === 0;
}

function downloadWrapperJar(destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  // Most reliable across environments where Node HTTPS may be restricted behind proxy.
  if (tryRun('curl', ['-fsSL', '-o', destination, gradleWrapperUrl])) return;

  if (process.platform === 'win32') {
    const ps = `Invoke-WebRequest -Uri '${gradleWrapperUrl}' -OutFile '${destination.replace(/\\/g, '\\\\')}'`;
    if (tryRun('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps])) return;
  }

  throw new Error('Failed to download gradle-wrapper.jar. Install curl or place the file at android/gradle/wrapper/gradle-wrapper.jar');
}

function main() {
  process.chdir(rootDir);

  run('npm', ['run', 'cap:sync']);

  if (!fs.existsSync(wrapperJar)) {
    console.log('Gradle wrapper JAR missing; downloading...');
    downloadWrapperJar(wrapperJar);
  }

  if (fs.existsSync(sdkDir)) {
    fs.writeFileSync(path.join(androidDir, 'local.properties'), `sdk.dir=${sdkDir}\n`, 'utf8');
  }

  const env = { ...process.env };
  run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['assembleDebug'], { cwd: androidDir, env });

  const apkSrc = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

  const releaseDir = path.join(rootDir, 'release');
  const releaseApk = path.join(releaseDir, 'MatchFlowMobile-debug.apk');
  fs.mkdirSync(releaseDir, { recursive: true });
  fs.copyFileSync(apkSrc, releaseApk);

  const releasesDir = path.join(rootDir, 'releases');
  const releasesApk = path.join(releasesDir, 'MatchFlowMobile-debug.apk');
  fs.mkdirSync(releasesDir, { recursive: true });
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
