// Reproduce only the shipped subset. No authoring or review inputs are modified.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('../../../../', import.meta.url);
const base = 'design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/';
const read = (path) => readFileSync(new URL(path, root));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const glb = read(base + 'build-v03/selected-a.glb');
assert.equal(sha(glb), '65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12');
const profile = JSON.parse(read(base + 'build-v03/profile.json'));
const poses = JSON.parse(read(base + 'build-v03/poses.json'));
const json = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)));
const pins = ['build-v03/selected-a.glb', 'build-v03/profile.json', 'build-v03/poses.json', 'build-v02/validation.json', 'build-v02/README.md'].map((file) => {
  const path = base + file, bytes = read(path);
  return { path, sha256: sha(bytes), bytes: bytes.length };
});
const bindings = profile.bindings.map((binding) => {
  const node = json.nodes.find((node) => node.name === binding.name);
  const primitive = node.mesh === undefined ? null : json.meshes[node.mesh].primitives[0];
  return { name: binding.name, parent: binding.parent, moving: binding.moving,
    neutral: binding.neutralGltfTRS,
    material: primitive ? json.materials[primitive.material].name : null };
});
const subset = {
  candidate: profile.profileId, productionAccepted: false, pins,
  bytes: glb.length, sha256: sha(glb), triangles: 37676, geometries: 21,
  bindings, materials: json.materials,
  poses: Object.fromEntries(poses.poses.map((pose) => [pose.name, Object.fromEntries(profile.requiredMovingNodes.map((name) => [name, pose.localGltfTRS[name]]))])),
};
const text = JSON.stringify(subset) + '\n';
const out = new URL('./runtime-profile.json', import.meta.url);
if (process.argv.includes('--check')) assert.equal(readFileSync(out, 'utf8'), text);
else writeFileSync(out, text);
console.log(`Runtime profile ${process.argv.includes('--check') ? 'verified' : 'derived'}: ${Buffer.byteLength(text)} bytes, ${sha(text)}`);
