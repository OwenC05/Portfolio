import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as THREE from 'three';
import { expectedBindings } from './profile-core.mjs';
import { profile, inventory, candidateManifest } from './validate-full-kit.mjs';

export function encodeGlb(doc, binary) {
  const json = Buffer.from(JSON.stringify(doc)), padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32);
  json.copy(padded);
  const bin = Buffer.alloc(Math.ceil(binary.length / 4) * 4); Buffer.from(binary).copy(bin);
  const bytes = Buffer.alloc(28 + padded.length + bin.length);
  bytes.writeUInt32LE(0x46546c67, 0); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(bytes.length, 8);
  bytes.writeUInt32LE(padded.length, 12); bytes.writeUInt32LE(0x4e4f534a, 16); padded.copy(bytes, 20);
  bytes.writeUInt32LE(bin.length, 20 + padded.length); bytes.writeUInt32LE(0x004e4942, 24 + padded.length); bin.copy(bytes, 28 + padded.length);
  return bytes;
}

export function fixture({ variant = 'baseline', colorType = 5126, textures = true } = {}) {
  const doc = { asset: { version: '2.0', generator: 'technical synthetic fixture; not authored art' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: profile.root.name, children: [] }], meshes: [], materials: [{ name: 'rt_placeholder', pbrMetallicRoughness: { metallicFactor: 0, roughnessFactor: 1 } }, { name: 'lib_plaster', pbrMetallicRoughness: { metallicFactor: 0, roughnessFactor: 1 } }, { name: 'lib_contact', alphaMode: 'BLEND', pbrMetallicRoughness: { baseColorFactor: [0, 0, 0, 0.3], metallicFactor: 0, roughnessFactor: 1 } }], buffers: [{ byteLength: 0 }], bufferViews: [], accessors: [] };
  const parts = []; let length = 0;
  const bufferView = (bytes, target) => {
    const pad = (4 - length % 4) % 4;
    if (pad) { parts.push(Buffer.alloc(pad)); length += pad; }
    const index = doc.bufferViews.length;
    doc.bufferViews.push({ buffer: 0, byteOffset: length, byteLength: bytes.length, ...(target ? { target } : {}) });
    parts.push(bytes); length += bytes.length; return index;
  };
  const accessor = (values, type, componentType = 5126, normalized = false, target = 34962) => {
    const flat = values.flat(), size = { 5126: 4, 5123: 2, 5121: 1 }[componentType], bytes = Buffer.alloc(flat.length * size);
    flat.forEach((v, i) => { if (componentType === 5126) bytes.writeFloatLE(v, i * size); else if (componentType === 5123) bytes.writeUInt16LE(v, i * size); else bytes.writeUInt8(v, i); });
    const index = doc.accessors.length, width = { VEC3: 3, VEC2: 2, SCALAR: 1 }[type];
    const rows = Array.from({ length: flat.length / width }, (_, i) => flat.slice(i * width, (i + 1) * width));
    doc.accessors.push({ bufferView: bufferView(bytes, target), componentType, count: rows.length, type, ...(normalized ? { normalized } : {}), min: Array.from({ length: width }, (_, i) => Math.min(...rows.map((r) => r[i]))), max: Array.from({ length: width }, (_, i) => Math.max(...rows.map((r) => r[i]))) });
    return index;
  };
  const quad = (size, material, color = false) => {
    const p = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => [x * size[0] / 2, y * size[1] / 2, 0]);
    const attributes = { POSITION: accessor(p, 'VEC3'), NORMAL: accessor(p.map(() => [0, 0, 1]), 'VEC3'), TEXCOORD_0: accessor([[0, 0], [1, 0], [1, 1], [0, 1]], 'VEC2') };
    if (color) attributes.COLOR_0 = accessor(p.map(() => colorType === 5126 ? [0.2, 0.5, 1] : colorType === 5121 ? [51, 128, 255] : [13107, 32768, 65535]), 'VEC3', colorType, colorType !== 5126);
    const index = doc.meshes.length;
    doc.meshes.push({ primitives: [{ attributes, indices: accessor([0, 1, 2, 0, 2, 3], 'SCALAR', 5123, false, 34963), material }] }); return index;
  };
  const addNode = (name, mesh, matrix, extras, parent = 0) => {
    const index = doc.nodes.length;
    doc.nodes.push({ name, mesh, matrix, extras }); doc.nodes[parent].children ??= []; doc.nodes[parent].children.push(index); return index;
  };
  for (const [name, spec] of Object.entries(expectedBindings(inventory, variant))) {
    const role = name.startsWith('target_') ? 'target' : name.startsWith('border_') ? 'border' : 'decorative-screen';
    addNode(name, quad(spec.size, 0), spec.matrix, { assetId: role === 'target' ? 'target_faces' : role === 'border' ? 'target_borders' : 'display_studio', role, occluder: role === 'decorative-screen', transparent: false, nocast: true, receiveShadow: false });
  }
  addNode('rt_window_dusk', quad([0.3, 0.3], 0), new THREE.Matrix4().makeTranslation(2, 1.5, -1).toArray(), { assetId: 'rt_window_dusk', role: 'runtime-dusk', occluder: true, transparent: false, nocast: true, receiveShadow: false });
  const shared = quad([0.1, 0.1], 1, true);
  const group = doc.nodes.length; doc.nodes.push({ name: 'arch_shell__group', children: [] }); doc.nodes[0].children.push(group);
  for (let i = 0; i < 2; i++) addNode(`arch_shell__linked${i}`, shared, new THREE.Matrix4().makeTranslation(2 + i * 0.1, 0, 0).toArray(), { assetId: 'arch_shell', role: 'opaque', occluder: true, transparent: false, nocast: i === 0, receiveShadow: true }, group);
  addNode('contact_decals__test', quad([0.1, 0.1], 2), new THREE.Matrix4().makeTranslation(2, 0, -1).toArray(), { assetId: 'contact_decals', role: 'transparent', occluder: false, transparent: true, nocast: true, receiveShadow: false, renderOrder: 1 });
  if (textures) {
    // Real 1x1 PNG payload; CPU harness deliberately stubs decode separately.
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP9sAAAAASUVORK5CYII=', 'base64');
    doc.images = [{ bufferView: bufferView(png), mimeType: 'image/png' }, { bufferView: bufferView(png), mimeType: 'image/png' }];
    doc.samplers = [{ wrapS: 10497 }, { wrapS: 33071 }];
    doc.textures = [{ source: 0, sampler: 0 }, { source: 0, sampler: 1 }, { source: 1 }];
    doc.materials[1].pbrMetallicRoughness.baseColorTexture = { index: 0 };
    doc.materials[1].emissiveTexture = { index: 1 };
    doc.materials[2].pbrMetallicRoughness.baseColorTexture = { index: 2 };
  }
  doc.buffers[0].byteLength = length;
  const binary = Buffer.concat(parts), bytes = encodeGlb(doc, binary);
  return { doc, binary, bytes, manifest: candidateManifest(bytes, variant, 'synthetic') };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  mkdirSync(new URL('./fixtures/', import.meta.url), { recursive: true });
  for (const variant of ['baseline', 'proposal']) {
    const result = fixture({ variant });
    writeFileSync(new URL(`./fixtures/${variant}.glb`, import.meta.url), result.bytes);
    writeFileSync(new URL(`./fixtures/${variant}.manifest.json`, import.meta.url), `${JSON.stringify(result.manifest, null, 2)}\n`);
  }
}
