// Independent review evidence only; does not edit validator, profile, product or assets.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fixture, encodeGlb } from '../asset-pipeline/integration-contract/synthetic-fixture.mjs';
import { validateGlb } from '../asset-pipeline/integration-contract/validate-glb.mjs';

const base = new URL('../asset-pipeline/integration-contract/', import.meta.url);
const output = (name, value) => writeFileSync(new URL(`asset-contract-review-${name}.json`, import.meta.url), `${JSON.stringify(value, null, 2)}\n`);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const core = ['validate-glb.mjs', 'synthetic-fixture.mjs', 'verify-validator.mjs', 'pilot-profile.json'];
const before = Object.fromEntries(core.map((name) => [name, hash(readFileSync(new URL(name, base)))]));
const expected = {
  'validate-glb.mjs': 'fb3d6bee77fda20f89553a01bd24c70c70713f94ae7c543b894426a14f41ec7c',
  'synthetic-fixture.mjs': '55632b3f3d758a5fd0fb03b8dd891b2e6ea55d37dbf155021017b45cb01ab465',
  'verify-validator.mjs': '341365e141e9ea1f457161446d8d3b102b2a3452dfc5ef560152137844c38390',
  'pilot-profile.json': '02a9b364ed42127988747660ac61d6efca8bc3af9f151a0e41eb0d50bc0baa08',
};
if (JSON.stringify(before) !== JSON.stringify(expected)) throw new Error('Frozen source mismatch; do not review a silently changed validator');
const manifest = JSON.parse(readFileSync(new URL('evidence/source-hashes.json', base)));
const repo = new URL('../../../', import.meta.url);
const manifestChecks = Object.entries(manifest.files).map(([path, expectedHash]) => {
  const actual = hash(readFileSync(new URL(path, repo)));
  return { path, expected: expectedHash, actual, matches: actual === expectedHash };
});
const probes = [];
function probe(id, expectedCode, edit = () => {}, scope = 'required guard') {
  const f = fixture();
  edit(f);
  const result = validateGlb(encodeGlb(f.document, f.binary));
  const actual = result.valid ? 'PASS' : result.errors[0]?.code;
  probes.push({ id, scope, expected: expectedCode, actual, passed: actual === expectedCode, result });
}
function append(f, data, extra = {}) {
  const padding = Buffer.alloc((4 - f.binary.length % 4) % 4);
  const index = f.document.bufferViews.length;
  f.document.bufferViews.push({ buffer: 0, byteOffset: f.binary.length + padding.length, byteLength: data.length, ...extra });
  f.binary = Buffer.concat([f.binary, padding, data]);
  f.document.buffers[0].byteLength = f.binary.length;
  return index;
}
function png(f, width, height) {
  const view = f.document.bufferViews[f.document.images[0].bufferView];
  const bytes = Buffer.from(f.binary.subarray(view.byteOffset, view.byteOffset + view.byteLength));
  // Header-only fixture: CRCs intentionally not recalculated; pixel decoding is deferred.
  bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return bytes;
}
function jpeg(f, hex) {
  f.document.images[0].mimeType = 'image/jpeg';
  f.document.images[0].bufferView = append(f, Buffer.from(hex, 'hex'));
}

probe('baseline fixture', 'PASS');
probe('unused accessor cannot hide binary NaN', 'NONFINITE_ATTRIBUTE', (f) => {
  const data = Buffer.alloc(4); data.writeFloatLE(NaN);
  f.document.accessors.push({ bufferView: append(f, data), componentType: 5126, type: 'SCALAR', count: 1 });
});
probe('UV data Infinity is inspected', 'NONFINITE_ATTRIBUTE', (f) => {
  const accessor = f.document.accessors[f.document.meshes[0].primitives[0].attributes.TEXCOORD_0];
  f.binary.writeFloatLE(Infinity, f.document.bufferViews[accessor.bufferView].byteOffset);
});
probe('view alignment cannot bypass accessor alignment', 'ACCESSOR_BOUNDS', (f) => { f.document.bufferViews[0].byteOffset += 2; });
probe('stride smaller than tuple rejects before reads', 'ACCESSOR_BOUNDS', (f) => { f.document.bufferViews[0].byteStride = 8; });
probe('in-bounds strided indices reach INDICES guard', 'INDICES', (f) => {
  const data = Buffer.alloc(12); [0, 1, 2].forEach((v, i) => data.writeUInt16LE(v, i * 4));
  f.document.accessors[f.document.meshes[0].primitives[0].indices].bufferView = append(f, data, { byteStride: 4 });
});
probe('unit normal check reaches NORMAL', 'NORMAL', (f) => {
  f.binary.writeFloatLE(0, f.document.bufferViews[f.document.accessors[1].bufferView].byteOffset);
});
probe('all roots must be unique indices', 'SCENE_ROOTS', (f) => { f.document.scenes[0].nodes[8] = 0; });
probe('unused mesh rejects after normal geometry pass', 'UNUSED_MESH', (f) => { f.document.meshes.push(structuredClone(f.document.meshes[0])); });
probe('no extra material slot allowed', 'MATERIAL_SET', (f) => { f.document.materials.push({ name: 'surprise' }); });
probe('node camera field rejects without camera list', 'NODE_STRUCTURE', (f) => { f.document.nodes[0].camera = 0; });
probe('hidden light extension rejects without declaration', 'EXTENSION', (f) => { f.document.nodes[0].extensions = { KHR_lights_punctual: { light: 0 } }; });
probe('missing explicit occluder rejects', 'OCCLUSION_METADATA', (f) => { delete f.document.nodes[0].extras.occluder; });
probe('shadow flag type cannot bypass metadata', 'OCCLUSION_METADATA', (f) => { f.document.nodes[0].extras.nocast = 'true'; });
probe('matrix translation cannot duplicate baked placement', 'TRANSFORM', (f) => {
  f.document.nodes[0].matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.11, 0, 1];
});
probe('declared specular texture must exist', 'REFERENCE', (f) => {
  f.document.extensionsUsed = ['KHR_materials_specular'];
  f.document.materials[0].extensions = { KHR_materials_specular: { specularTexture: { index: 99 } } };
});
probe('declared IOR must meet finite range', 'MATERIAL_EXTENSION', (f) => {
  f.document.extensionsUsed = ['KHR_materials_ior'];
  f.document.materials[0].extensions = { KHR_materials_ior: { ior: 0.5 } };
});
probe('embedded JPEG header dimensions accepted', 'PASS', (f) => {
  jpeg(f, 'ffd8ffc0000b080001000101011100ffda0008010100003f0000ffd9');
}, 'header-only JPEG fixture, no decoder proof');
probe('JPEG frame dimensions reach budget', 'IMAGE_DIMENSION', (f) => {
  jpeg(f, 'ffd8ffc0000b080001100001011100ffda0008010100003f0000ffd9');
});
probe('JPEG segment overrun reaches IMAGE_BOUNDS', 'IMAGE_BOUNDS', (f) => { jpeg(f, 'ffd8ffe1ffff0000ffd9'); });
probe('JPEG without supported frame rejects', 'IMAGE_SIGNATURE', (f) => { jpeg(f, 'ffd8ffd9'); });
probe('aggregate image pixels rejects valid-sized individual headers', 'IMAGE_BUDGET', (f) => {
  const data = png(f, 2048, 2048);
  f.document.images = Array.from({ length: 4 }, () => ({ bufferView: append(f, data), mimeType: 'image/png' }));
  f.document.textures = f.document.images.map((_, source) => ({ source }));
  f.document.materials[0].normalTexture = { index: 1 };
  f.document.materials[0].occlusionTexture = { index: 2 };
  f.document.materials[1].emissiveTexture = { index: 3 };
});
probe('exact aggregate image ceiling is accepted', 'PASS', (f) => {
  const data = png(f, 2048, 2048);
  f.document.images = Array.from({ length: 3 }, () => ({ bufferView: append(f, data), mimeType: 'image/png' }));
  f.document.textures = f.document.images.map((_, source) => ({ source }));
  f.document.materials[0].normalTexture = { index: 1 };
  f.document.materials[0].occlusionTexture = { index: 2 };
}, 'header-level budget boundary, no decoded pixel allocation');
probe('PNG CRC corruption is intentionally outside scope', 'PASS', (f) => {
  const view = f.document.bufferViews[f.document.images[0].bufferView];
  f.binary[view.byteOffset + 29] ^= 255;
}, 'documented decoder/conformance limitation');
probe('JPEG frame without scan is intentionally outside decode scope', 'PASS', (f) => {
  jpeg(f, 'ffd8ffc0000b080001000101011100ffd9');
}, 'documented decoder/conformance limitation');

// Unlike JSON.stringify(Infinity), a raw JSON exponent can actually reach the finite-number guard.
{
  const f = fixture(); f.document.extras = { reviewNumber: 'RAW_NUMBER' };
  const json = Buffer.from(JSON.stringify(f.document).replace('"RAW_NUMBER"', '1e400'));
  const padded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const bin = Buffer.concat([f.binary, Buffer.alloc((4 - f.binary.length % 4) % 4)]);
  const header = Buffer.alloc(20), binHeader = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + padded.length + bin.length, 8);
  header.writeUInt32LE(padded.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  binHeader.writeUInt32LE(bin.length); binHeader.writeUInt32LE(0x004e4942, 4);
  const result = validateGlb(Buffer.concat([header, padded, binHeader, bin]));
  probes.push({ id: 'raw JSON overflow reaches NONFINITE_JSON', scope: 'required guard', expected: 'NONFINITE_JSON',
    actual: result.errors[0]?.code, passed: result.errors[0]?.code === 'NONFINITE_JSON', result });
}

// Capture CLI exit/result for each exact real candidate without writing in the author's directory.
const candidates = [];
for (const [version, expectedHash, expectedExit] of [
  ['v02', 'a4e2e741389bee33eec6eb705b89646490cb89fa34dba479fad9f756a1c0c4b8', 1],
  ['v03', '2b9a4182c3024485680c1e066c8a22ef0dc0f541acca4bd958486bced2c4063e', 0],
]) {
  const path = fileURLToPath(new URL(`../asset-pipeline/pilot-right-limit/exports/pilot-right-limit-${version}.glb`, import.meta.url));
  const bytes = readFileSync(path), actualHash = hash(bytes);
  if (actualHash !== expectedHash) throw new Error(`Candidate changed: ${version}`);
  const args = [fileURLToPath(new URL('validate-glb.mjs', base)), path];
  const cli = spawnSync(process.execPath, args, { encoding: 'utf8', windowsHide: true, timeout: 30000 });
  const result = JSON.parse(cli.stdout);
  output(version, result);
  const jsonLength = bytes.readUInt32LE(12);
  const doc = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const summary = {
    roots: doc.scenes[doc.scene].nodes.map((index) => doc.nodes[index].name),
    meshes: doc.meshes.length, materials: doc.materials.map((m) => m.name),
    declaredPrimitiveInstances: doc.nodes.reduce((n, node) => n + doc.meshes[node.mesh].primitives.length, 0),
    declaredTriangleInstances: doc.nodes.reduce((n, node) => n + doc.meshes[node.mesh].primitives.reduce((sum, p) =>
      sum + doc.accessors[p.indices ?? p.attributes.POSITION].count / 3, 0), 0),
    explicitTransforms: doc.nodes.filter((n) => ['matrix', 'translation', 'rotation', 'scale'].some((k) => n[k] !== undefined)),
    bulb: doc.nodes.find((n) => n.name === 'pilot_lamp_bulb'),
  };
  candidates.push({ version, path, expectedHash, actualHash, bytes: bytes.length,
    command: [process.execPath, ...args], exit: cli.status, expectedExit, stderr: cli.stderr,
    passed: cli.status === expectedExit && result.sha256 === actualHash,
    summary, report: `asset-contract-review-${version}.json` });
}
const after = Object.fromEntries(core.map((name) => [name, hash(readFileSync(new URL(name, base)))]));
const evidence = {
  timestamp: new Date().toISOString(), node: process.version,
  task: 'task_e50fb788098e', dispatch: 'ctx_41b4a64b4d66',
  scope: 'Offline review only; no browser/server/build/Blender/GPU or product mutation',
  before, after, sourceStable: JSON.stringify(before) === JSON.stringify(after),
  authorManifestSha256: hash(readFileSync(new URL('evidence/source-hashes.json', base))), manifestChecks,
  contractSha256: hash(readFileSync(new URL('../integration-contract.md', base))),
  authorSuite: { evidence: 'integration-contract/evidence/validator-tests.tap', count: 61, rerun: false },
  probes, candidates,
};
output('probes', evidence);
const failures = probes.filter((p) => !p.passed);
console.log(JSON.stringify({ probes: probes.length, failures: failures.map((p) => ({ id: p.id, expected: p.expected, actual: p.actual })),
  sourceStable: evidence.sourceStable, authorManifestMatches: manifestChecks.every((c) => c.matches),
  candidates: candidates.map(({ version, exit, bytes, actualHash, summary }) => ({ version, exit, bytes, actualHash, triangles: summary.declaredTriangleInstances })) }, null, 2));
process.exitCode = failures.length || !evidence.sourceStable || manifestChecks.some((c) => !c.matches) || candidates.some((c) => !c.passed) ? 1 : 0;
