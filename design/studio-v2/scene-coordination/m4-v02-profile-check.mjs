// Generate a paired manifest only after the existing validator accepts the actual bytes.
import fs from 'node:fs';
import crypto from 'node:crypto';
const here = new URL('./', import.meta.url);
const kit = new URL('../asset-pipeline/full-kit/', here);
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function pinned(name, expected) {
  const bytes = fs.readFileSync(new URL(name, kit));
  if (sha(bytes) !== expected) throw Error('Input hash: ' + name);
  return bytes;
}
pinned('technical/validate-full-kit.mjs', '66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75');
pinned('technical/profile-core.mjs', '02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71');
pinned('full-kit-profile-v1.json', '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052');
pinned('asset-inventory.json', 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87');
const { candidateManifest, validateFullKit } = await import(new URL('technical/validate-full-kit.mjs', kit));
const bytes = pinned('exports/studio-full-kit-m4-proposal-v02.glb', 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f');
const manifest = candidateManifest(bytes, 'proposal', 'M4');
const report = validateFullKit(bytes, manifest);
if (!report.valid) throw Error(JSON.stringify(report.errors));
const manifestPath = new URL('manifests/studio-full-kit-m4-proposal-v02.manifest.json', kit);
const reportPath = new URL('m4-v02-profile-check.json', here);
for (const file of [manifestPath, reportPath]) if (fs.existsSync(file)) throw Error('Refusing overwrite: ' + file);
const text = JSON.stringify(manifest, null, 2) + '\n';
fs.writeFileSync(manifestPath, text, {flag:'wx'});
fs.writeFileSync(reportPath, JSON.stringify({...report, pairedManifestSha256:sha(text)}, null, 2) + '\n', {flag:'wx'});
console.log(JSON.stringify({valid:report.valid, glbSha256:sha(bytes), manifestSha256:sha(text), metrics:report.metrics}));
