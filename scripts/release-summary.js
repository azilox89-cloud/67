const fs = require('fs');

const required = [
  'android/app/build.gradle',
  'ios/App/App/Info.plist',
  'store-listing/google-play-listing-template.md',
  'store-listing/app-store-listing-template.md',
  'STORE_RELEASE_CHECKLIST.md',
];

const missing = required.filter((path) => !fs.existsSync(path));

if (missing.length) {
  console.error('Missing required release files:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

const androidGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const versionCode = androidGradle.match(/versionCode\s+(\d+)/)?.[1] || 'unknown';
const versionName = androidGradle.match(/versionName\s+"([^"]+)"/)?.[1] || 'unknown';

console.log('Release readiness snapshot');
console.log('--------------------------');
console.log(`Android versionCode: ${versionCode}`);
console.log(`Android versionName: ${versionName}`);
console.log('Store templates: present');
console.log('Checklist: present');
