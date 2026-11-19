// Independent candidate/paired-manifest check through the unchanged existing validator.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { candidateManifest, validateFullKit } from '../asset-pipeline/full-kit/technical/validate-full-kit.mjs';
const kit = new URL('../asset-pipeline/full-kit/', import.meta.url);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const pinned = {
  'technical/validate-full-kit.mjs': '66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75',
  'technical/profile-core.mjs': '02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71',
  'full-kit-profile-v1.json': '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052',
  'asset-inventory.json': 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87',
};
for (const [file, expected] of Object.entries(pinned)) if (hash(fs.readFileSync(new URL(file, kit))) !== expected) throw new Error('Pinned validator/input differs: ' + file);
const bytes = fs.readFileSync(new URL('exports/studio-full-kit-m3-proposal-v03.glb', kit));
const manifestBytes = fs.readFileSync(new URL('manifests/studio-full-kit-m3-proposal-v03.manifest.json', kit));
const manifest = JSON.parse(manifestBytes);
if (hash(bytes) !== 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf' || hash(manifestBytes) !== '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405') throw new Error('Candidate identity');
const report = validateFullKit(bytes, manifest);
if (!report.valid) throw new Error(JSON.stringify(report.errors));
const rebuilt = Buffer.from(JSON.stringify(candidateManifest(bytes, 'proposal', 'M3'), null, 2) + '\n');
if (!rebuilt.equals(manifestBytes)) throw new Error('Paired manifest is not exact recomputation');
const parent = JSON.parse(fs.readFileSync(new URL('manifests/studio-full-kit-m2-proposal-v05.manifest.json', kit)));
if (parent.glbSha256 !== '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735' || JSON.stringify(manifest.targetWorldCorners) !== JSON.stringify(parent.targetWorldCorners)) throw new Error('Parent/target corner invariant');
const wrongHash = structuredClone(manifest); wrongHash.glbSha256 = '0'.repeat(64);
const wrongCorner = structuredClone(manifest); wrongCorner.targetWorldCorners.target_dissertation[0][0] += 0.01;
const negative = [wrongHash, wrongCorner].map(m => validateFullKit(bytes, m));
if (negative.some(r => r.valid)) throw new Error('Manifest guard sensitivity');
const evidence = { scope: 'Paired manifest/unchanged validator check; no budget or visual acceptance.', valid: report.valid, errors: report.errors, glbSha256: hash(bytes), manifestSha256: hash(manifestBytes), recomputedManifestByteIdentical: true, allEightReservedWorldCornerArraysEqualParent: true, pinnedInputs: pinned, negativeManifestMutationsRejected: negative.map(r => r.errors), deferred: report.deferred };
fs.writeFileSync(new URL('m3-v03-review-manifest.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(evidence));
