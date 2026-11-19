import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateFullKit } from '../asset-pipeline/full-kit/technical/validate-full-kit.mjs';

const kit = new URL('../asset-pipeline/full-kit/', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => readFileSync(new URL(name, kit));
function parse(bytes) {
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const chunks = [];
  for (let offset = 12; offset < bytes.length;) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    assert.ok(offset + 8 + length <= bytes.length);
    chunks.push({ type, bytes: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += 8 + length;
  }
  assert.deepEqual(chunks.map(chunk => chunk.type), [0x4e4f534a, 0x004e4942]);
  return { json: JSON.parse(chunks[0].bytes.toString('utf8')), bin: chunks[1].bytes };
}
function differences(a, b, path = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key =>
      differences(a[key], b[key], path ? `${path}.${key}` : key));
  }
  return [{ path, before: a ?? null, after: b ?? null }];
}

const beforeBytes = read('exports/studio-full-kit-m2-proposal-v02.glb');
const afterBytes = read('exports/studio-full-kit-m2-proposal-v03.glb');
assert.equal(sha(beforeBytes), '2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411');
assert.equal(sha(afterBytes), '7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752');
const before = parse(beforeBytes), after = parse(afterBytes);
assert.ok(before.bin.equals(after.bin), 'Geometry, UV and embedded image bytes must be identical');
const jsonDifferences = differences(before.json, after.json);
const allowedMaterialPath = /^materials\.8\.(emissiveFactor\.[012]|pbrMetallicRoughness\.(baseColorFactor\.[012]|metallicFactor|roughnessFactor)|extensions\.KHR_materials_emissive_strength\.emissiveStrength)$/;
const allowedProvenancePath = /^scenes\.0\.extras\.(fk_tag|fk_m2_tag)$/;
assert.ok(jsonDifferences.length > 0);
for (const delta of jsonDifferences) {
  assert.ok(allowedMaterialPath.test(delta.path) || allowedProvenancePath.test(delta.path), `Unreleased change: ${delta.path}`);
}
assert.equal(after.json.materials[8].name, 'lib_glow');
const oldManifestBytes = read('manifests/studio-full-kit-m2-proposal-v02.manifest.json');
const newManifestBytes = read('manifests/studio-full-kit-m2-proposal-v03.manifest.json');
const oldManifest = JSON.parse(oldManifestBytes), newManifest = JSON.parse(newManifestBytes);
assert.equal(sha(newManifestBytes), '5e1cb075b377c3ce3d7656601eef55afdd5d59aeef5be6d3c4b28500f83228d9');
const manifestDifferences = differences(oldManifest, newManifest);
for (const delta of manifestDifferences) {
  const rawMaterialPath = delta.path.replace('materials.8.definition.', 'materials.8.');
  assert.ok(delta.path === 'glbSha256' || allowedMaterialPath.test(rawMaterialPath), `Unexpected manifest change: ${delta.path}`);
}
const validation = validateFullKit(afterBytes, newManifest);
assert.equal(validation.valid, true, validation.errors.join('; '));
assert.deepEqual(newManifest.counts, oldManifest.counts);
const affectedNodes = after.json.nodes.filter(node => node.mesh !== undefined &&
  after.json.meshes[node.mesh].primitives.some(primitive => primitive.material === 8)).map(node => node.name).sort();
const sourcePaths = [
  'components/studio/scene/load-full-kit.ts', 'components/studio/scene/bind-full-kit.ts',
  'components/studio/scene/build-full-studio.ts', 'components/studio/scene/view-config.ts',
  'design/studio-v2/asset-pipeline/full-kit/full-kit-profile-v1.json',
  'design/studio-v2/asset-pipeline/full-kit/asset-inventory.json',
  'design/studio-v2/asset-pipeline/full-kit/technical/validate-full-kit.mjs',
  'design/studio-v2/asset-pipeline/full-kit/technical/profile-core.mjs',
];
const receipt = {
  checkedAt: new Date().toISOString(), status: 'pass', checker: 'S actual Codex, independent of Claude author',
  nodeVersion: process.version,
  beforeGlbSha256: sha(beforeBytes), afterGlbSha256: sha(afterBytes),
  beforeManifestSha256: sha(oldManifestBytes), afterManifestSha256: sha(newManifestBytes),
  binByteIdentical: true, binBytes: after.bin.length, binSha256: sha(after.bin),
  jsonDifferences, manifestDifferences, affectedNodes, validation,
  sources: Object.fromEntries(sourcePaths.map(path => [path, sha(readFileSync(path))])),
  scope: 'Paired byte/manifest/material delta and existing validator only; no suite, Blender, browser, loader rebuild or appearance judgment.',
  preserved: 'Exact geometry/UV/images/nodes/placement/bindings/material assignments, all alpha/sidedness/shadow/sort flags, 117 leaves, 48 casters, 11 materials and 5 images.',
  deferred: 'Root actual rendering, shared-material collateral, independent Claude clip/readability verdict, final forecast/transfer/device/product gates.',
};
writeFileSync(new URL('m2-v03-delta-check.json', import.meta.url), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify({ status: receipt.status, glb: receipt.afterGlbSha256, binBytes: receipt.binBytes, jsonDifferences, affectedNodes, metrics: validation.metrics }, null, 2));
