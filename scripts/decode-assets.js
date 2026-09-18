// Binary assets are committed as base64 text (the repo is maintained through the GitHub web UI).
// This restores the PNGs and the testing keystore before `expo prebuild` / `expo start`.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const jobs = [
  ['assets/b64', 'assets'],
  ['android-keystore/b64', 'android-keystore'],
];
let n = 0;
for (const [src, dst] of jobs) {
  const dir = path.join(root, src);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.b64')) continue;
    const out = path.join(root, dst, f.replace(/\.b64$/, ''));
    const b64 = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\s+/g, '');
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    n++;
  }
}
console.log(`decode-assets: restored ${n} binary file(s)`);
