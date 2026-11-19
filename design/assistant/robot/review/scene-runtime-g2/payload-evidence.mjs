import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { profile, resources, cardsModule } from '../../../../../components/studio/scene/robot/test-support.mjs';

const root = new URL('../../../../../', import.meta.url);
const sha = (value) => createHash('sha256').update(value).digest('hex');
function glb(path) {
  const bytes = readFileSync(new URL(path, root));
  assert.equal(bytes.readUInt32LE(0), 0x46546c67); assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const jsonLength = bytes.readUInt32LE(12), binOffset = 20 + jsonLength;
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a); assert.equal(bytes.readUInt32LE(binOffset + 4), 0x004e4942);
  const binary = bytes.subarray(binOffset + 8, binOffset + 8 + bytes.readUInt32LE(binOffset));
  return { bytes, json: JSON.parse(bytes.subarray(20, 20 + jsonLength)), binary };
}
const v03 = glb('public/studio/assistant-apprentice-v03.glb');
const v02 = glb('design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v02/selected-a.glb');
assert.equal(sha(v03.bytes), profile.sha256);
assert.equal(sha(v02.bytes), 'bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270');
assert.ok(v03.binary.equals(v02.binary), 'geometry BIN is byte-identical');
for (const key of ['nodes', 'meshes', 'accessors', 'bufferViews', 'buffers', 'scenes', 'scene']) assert.deepEqual(v03.json[key], v02.json[key], key);
const changedMaterials = v03.json.materials.flatMap((material, i) => JSON.stringify(material) === JSON.stringify(v02.json.materials[i]) ? [] : [{ name: material.name, before: v02.json.materials[i], after: material }]);
assert.equal(changedMaterials.length, 1); assert.equal(changedMaterials[0].name, 'MAT_APA_eye_emit');
const gltf = await new GLTFLoader().parseAsync(v03.bytes.buffer.slice(v03.bytes.byteOffset, v03.bytes.byteOffset + v03.bytes.byteLength), '');
const owner = new resources.RobotResources(); owner.collect(gltf.scene);
const meshRecords = [], mats = new Set(), geometries = new Set();
gltf.scene.traverse((mesh) => {
  if (!mesh.isMesh) return;
  const position = mesh.geometry.getAttribute('position'), normal = mesh.geometry.getAttribute('normal'), index = mesh.geometry.index;
  assert.equal(position.count, normal.count); assert.equal(index.count % 3, 0);
  assert.ok(Array.from(position.array).every(Number.isFinite)); assert.ok(Array.from(normal.array).every(Number.isFinite));
  assert.ok(Array.from(index.array).every((i) => Number.isInteger(i) && i >= 0 && i < position.count));
  meshRecords.push({ node: mesh.name, vertices: position.count, triangles: index.count / 3 });
  mats.add(mesh.material); geometries.add(mesh.geometry);
});
assert.equal(meshRecords.length, 21); assert.equal(geometries.size, 21); assert.equal(mats.size, 7);
assert.equal(meshRecords.reduce((sum, mesh) => sum + mesh.triangles, 0), 37676);
const emissions = [...mats].map((mat) => ({ name: mat.name, rgb: mat.emissive.toArray(), intensity: mat.emissiveIntensity,
  product: mat.emissive.toArray().map((c) => c * mat.emissiveIntensity) }));
const eye = gltf.scene.getObjectByName('APA_eye_L'), tray = gltf.scene.getObjectByName('APA_tray_glow');
assert.notEqual(eye.material, tray.material);
const cards = cardsModule.createCards(new THREE.Group());
let radius = 0;
for (const card of cards.cards) for (const scale of [1, 1.15]) {
  card.scale.setScalar(scale); card.updateMatrix();
  const position = card.geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    const point = new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(card.matrix);
    radius = Math.max(radius, Math.hypot(point.x, point.z));
  }
}
assert.ok(radius < 0.11755819618701935);
const bounds = new THREE.Box3().setFromObject(gltf.scene, true);
const report = {
  node: process.version, three: THREE.REVISION,
  v03: { sha256: sha(v03.bytes), rawBytes: v03.bytes.length, gzip9: gzipSync(v03.bytes, { level: 9 }).length,
    brotli11: brotliCompressSync(v03.bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length },
  v02: { sha256: sha(v02.bytes), rawBytes: v02.bytes.length },
  binarySha256: sha(v03.binary), binaryIdenticalToV02: true,
  unchangedFromV02: ['nodes', 'meshes', 'accessors', 'bufferViews', 'buffers', 'scenes', 'scene'],
  changedMaterials, emissions, meshes: meshRecords, triangles: 37676, geometries: 21, materials: 7,
  finitePositionsNormalsAndValidUnsignedIndices: true,
  gltfNeutralBoundsMetres: { min: bounds.min.toArray(), max: bounds.max.toArray() },
  fourCardRadialSupportMetres: radius, radialMarginMetres: 0.11755819618701935 - radius,
  limits: ['geometry/CPU evidence only', 'compression is asset-only with explicit encoder settings', 'no total room budget or browser draw/appearance claim'],
};
cards.dispose(); owner.dispose();
writeFileSync(new URL('./payload-evidence.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ v03: report.v03, triangles: report.triangles, binaryIdenticalToV02: true, changedMaterials: changedMaterials.map((m) => m.name), fourCardRadialSupportMetres: radius }, null, 2));
