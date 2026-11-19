import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateFullKit } from '../asset-pipeline/full-kit/technical/validate-full-kit.mjs';

const kit = new URL('../asset-pipeline/full-kit/', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(new URL(path, kit));
function parse(bytes) {
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength));
  const binLength = bytes.readUInt32LE(20 + jsonLength);
  assert.equal(bytes.readUInt32LE(24 + jsonLength), 0x004e4942);
  return { json, bin: bytes.subarray(28 + jsonLength, 28 + jsonLength + binLength) };
}
function differences(a, b, path = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object') return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key => differences(a[key], b[key], path ? `${path}.${key}` : key));
  return [{ path, before: a ?? null, after: b ?? null }];
}
function primitive(doc, name) {
  const node = doc.nodes.find(item => item.name === name);
  assert.ok(node && node.mesh !== undefined, name);
  assert.equal(doc.meshes[node.mesh].primitives.length, 1);
  return doc.meshes[node.mesh].primitives[0];
}
function components(doc, accessorIndex) {
  const acc = doc.accessors[accessorIndex], view = doc.bufferViews[acc.bufferView];
  assert.equal(acc.componentType, 5126);
  const width = { VEC2: 2, VEC3: 3 }[acc.type];
  assert.ok(width);
  return Array.from({ length: acc.count }, (_, vertex) => Array.from({ length: width }, (_, component) => ({
    accessor: accessorIndex, vertex, component,
    offset: (view.byteOffset ?? 0) + (acc.byteOffset ?? 0) + vertex * (view.byteStride ?? width * 4) + component * 4,
  }))).flat();
}

const oldBytes = read('exports/studio-full-kit-m2-proposal-v03.glb');
const newBytes = read('exports/studio-full-kit-m2-proposal-v04.glb');
assert.equal(hash(oldBytes), '7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752');
assert.equal(hash(newBytes), '560acb2f2fa1ae36598a5d63ab484f842766ad344d88b065abad82286b560ea0');
const before = parse(oldBytes), after = parse(newBytes);
assert.equal(before.bin.length, after.bin.length);
const casePrim = primitive(before.json, 'pc_tower__case');
const glowPrim = primitive(before.json, 'pc_tower__glow');
const allowedAccessors = [casePrim.attributes.TEXCOORD_0, glowPrim.attributes.POSITION, glowPrim.attributes.NORMAL];
const allowedWords = new Map(allowedAccessors.flatMap(index => components(before.json, index)).map(word => [word.offset, word]));
const allWords = new Map();
for (const node of before.json.nodes.filter(node => node.mesh !== undefined)) {
  for (const prim of before.json.meshes[node.mesh].primitives) {
    for (const [attribute, accessor] of Object.entries(prim.attributes)) {
      if (before.json.accessors[accessor].componentType !== 5126) continue;
      for (const word of components(before.json, accessor)) {
        const labels = allWords.get(word.offset)?.labels ?? [];
        allWords.set(word.offset, { ...word, labels: [...labels, `${node.name}.${attribute}`] });
      }
    }
  }
}
const changedWords = [];
for (let offset = 0; offset < before.bin.length; offset += 4) {
  if (before.bin.subarray(offset, offset + 4).equals(after.bin.subarray(offset, offset + 4))) continue;
  const info = allWords.get(offset);
  changedWords.push({ offset, ...(info ?? {}), allowed: allowedWords.has(offset),
    before: info ? before.bin.readFloatLE(offset) : null,
    after: info ? after.bin.readFloatLE(offset) : null });
}
const jsonDifferences = differences(before.json, after.json);
const allowedJson = path => /^scenes\.0\.extras\.(fk_tag|fk_m2_tag)$/.test(path) ||
  new RegExp(`^accessors\\.${glowPrim.attributes.POSITION}\\.(min|max)\\.[012]$`).test(path);
const unauthorizedJson = jsonDifferences.filter(delta => !allowedJson(delta.path));
const unauthorizedWords = changedWords.filter(delta => !delta.allowed);
const uvChanges = changedWords.filter(delta => delta.accessor === casePrim.attributes.TEXCOORD_0);
assert.equal(uvChanges.length, 4);
for (const delta of uvChanges) {
  assert.equal(delta.component, 1);
  assert.equal(delta.before, 0.0625);
  assert.equal(delta.after, 0.3125);
}
const oldManifest = JSON.parse(read('manifests/studio-full-kit-m2-proposal-v03.manifest.json'));
const newManifestBytes = read('manifests/studio-full-kit-m2-proposal-v04.manifest.json');
const newManifest = JSON.parse(newManifestBytes);
const manifestDifferences = differences(oldManifest, newManifest);
assert.deepEqual(manifestDifferences.map(delta => delta.path), ['glbSha256']);
const validation = validateFullKit(newBytes, newManifest);
assert.equal(validation.valid, true, validation.errors.join('; '));
const status = unauthorizedWords.length || unauthorizedJson.length ? 'fail-unreleased-delta' : 'pass';
const receipt = {
  checkedAt: new Date().toISOString(), status,
  scope: 'Independent S Codex exact byte/accessor/material/manifest comparison; root PC-v04 scope grants no unrelated UV tolerance.',
  beforeGlbSha256: hash(oldBytes), afterGlbSha256: hash(newBytes), afterManifestSha256: hash(newManifestBytes),
  allowedAccessors, changedWords, unauthorizedWords, jsonDifferences, unauthorizedJson, manifestDifferences, validation,
  limitations: 'This preserves the reported failed candidate; no appearance approval, runtime or full suite. A corrected candidate needs a fresh identity-bound delta check and root captures.',
};
writeFileSync(new URL('m2-v04-delta-check.json', import.meta.url), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify({ status, authorizedWordCount: changedWords.length - unauthorizedWords.length, unauthorizedWords, unauthorizedJson, validatorValid: validation.valid }, null, 2));
process.exitCode = status === 'pass' ? 0 : 1;
