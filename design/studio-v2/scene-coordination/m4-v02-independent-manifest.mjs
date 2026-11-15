// Independent actual candidate/manifest validation; writes only this review's receipt.
import fs from 'node:fs';
import crypto from 'node:crypto';
const kit = new URL('../asset-pipeline/full-kit/', import.meta.url);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const pins = {
  'technical/validate-full-kit.mjs': '66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75',
  'technical/profile-core.mjs': '02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71',
  'full-kit-profile-v1.json': '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052',
  'asset-inventory.json': 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87',
  'exports/studio-full-kit-m4-proposal-v02.glb': 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f',
  'manifests/studio-full-kit-m4-proposal-v02.manifest.json': '42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82',
  'manifests/studio-full-kit-m3-proposal-v03.manifest.json': '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405',
};
function verifyPins() {
  for (const [file, expected] of Object.entries(pins)) {
    if (hash(fs.readFileSync(new URL(file,kit))) !== expected) throw Error('Changed pinned input: '+file);
  }
}
verifyPins();
const {candidateManifest, validateFullKit} = await import('../asset-pipeline/full-kit/technical/validate-full-kit.mjs');
const bytes = fs.readFileSync(new URL('exports/studio-full-kit-m4-proposal-v02.glb',kit));
const manifestBytes = fs.readFileSync(new URL('manifests/studio-full-kit-m4-proposal-v02.manifest.json',kit));
const manifest = JSON.parse(manifestBytes);
const validation = validateFullKit(bytes,manifest);
if (!validation.valid) throw Error(JSON.stringify(validation.errors));
const recomputed = Buffer.from(JSON.stringify(candidateManifest(bytes,'proposal','M4'),null,2)+'\n');
if (!recomputed.equals(manifestBytes)) throw Error('Paired manifest differs from exact recomputation');
const parent = JSON.parse(fs.readFileSync(new URL('manifests/studio-full-kit-m3-proposal-v03.manifest.json',kit)));
if (parent.glbSha256 !== 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf') throw Error('Parent manifest identity');
if (Object.keys(manifest.targetWorldCorners).length !== 8 || JSON.stringify(parent.targetWorldCorners) !== JSON.stringify(manifest.targetWorldCorners)) throw Error('Reserved target corners differ');
const wrongHash=structuredClone(manifest);wrongHash.glbSha256='0'.repeat(64);
const wrongCorner=structuredClone(manifest);wrongCorner.targetWorldCorners.target_dissertation[0][0]+=0.01;
const negative=[wrongHash,wrongCorner].map(m=>validateFullKit(bytes,m));
if(negative.some(r=>r.valid)) throw Error('Manifest sensitivity failed');
verifyPins();
const report={scope:'Independent unchanged-validator/paired-manifest evidence only; no stage or performance acceptance',
  valid:validation.valid,errors:validation.errors,pins,recomputedManifestByteIdentical:true,
  allEightReservedWorldCornerArraysExact:true,negativeManifestMutationsRejected:negative.map(r=>r.errors),
  protectedHashesUnchanged:true,deferred:validation.deferred};
fs.writeFileSync(new URL('m4-v02-independent-manifest.json',import.meta.url),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({valid:true,recomputedManifestByteIdentical:true,reservedCornerArrays:8,negativeChecks:2}));
