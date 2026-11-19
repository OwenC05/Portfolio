import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, relative, isAbsolute } from 'node:path';

const directory = dirname(fileURLToPath(import.meta.url));
const profileBytes = readFileSync(new URL('./pilot-profile.json', import.meta.url));
export const profile = JSON.parse(profileBytes);
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sizes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const dimensions = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const readers = { 5120: 'readInt8', 5121: 'readUInt8', 5122: 'readInt16LE', 5123: 'readUInt16LE', 5125: 'readUInt32LE', 5126: 'readFloatLE' };

class Invalid extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
function check(condition, code, message) { if (!condition) throw new Invalid(code, message); }
function integer(value, minimum = 0) { return Number.isSafeInteger(value) && value >= minimum; }
function vector(value, length) { return Array.isArray(value) && value.length === length && value.every(Number.isFinite); }
function unit(value) { return Number.isFinite(value) && value >= 0 && value <= 1; }
function ref(list, index, context) {
  check(integer(index) && index < list.length, 'REFERENCE', `${context}: invalid index ${index}`);
  return list[index];
}

// This is a deliberately narrow static pilot preflight, not the Khronos conformance validator.
export function validateGlb(input) {
  const bytes = Buffer.from(input);
  const report = {
    profile: profile.id, sha256: sha256(bytes), profileSha256: sha256(profileBytes),
    valid: false, errors: [], metrics: { bytes: bytes.length },
    limits: profile.limits,
    deferred: ['Image decode and browser GLTFLoader parsing', 'GPU/material/normal appearance and artistic placement',
      'Live target/occlusion adapter, cancellation and disposal', 'Actual renderer/network/frame budgets and independent critique'],
  };
  try {
    inspect(bytes, report.metrics);
    report.valid = true;
  } catch (error) {
    if (!(error instanceof Invalid) && !(error instanceof TypeError) && !(error instanceof RangeError)) throw error;
    report.errors.push({ code: error.code ?? 'SCHEMA', message: error.message });
  }
  return report;
}

function inspect(bytes, metrics) {
  check(bytes.length <= profile.limits.fileBytes, 'FILE_BUDGET', 'Raw pilot GLB exceeds file ceiling');
  check(bytes.length >= 28 && bytes.readUInt32LE(0) === 0x46546c67, 'GLB_HEADER', 'Expected GLB magic and complete header/chunks');
  check(bytes.readUInt32LE(4) === 2, 'GLB_VERSION', 'Only GLB version 2 is allowed');
  check(bytes.readUInt32LE(8) === bytes.length, 'GLB_LENGTH', 'Declared GLB length differs from file length');
  const chunks = [];
  for (let offset = 12; offset < bytes.length;) {
    check(offset + 8 <= bytes.length, 'CHUNK_BOUNDS', 'Truncated chunk header');
    const length = bytes.readUInt32LE(offset);
    check(length % 4 === 0 && offset + 8 + length <= bytes.length, 'CHUNK_BOUNDS', 'Unaligned or truncated chunk payload');
    chunks.push({ type: bytes.readUInt32LE(offset + 4), data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += 8 + length;
  }
  check(chunks.length === 2 && chunks[0].type === 0x4e4f534a && chunks[1].type === 0x004e4942,
    'CHUNK_LAYOUT', 'Expected exactly JSON then BIN; unknown, duplicate and external chunks are forbidden');
  let doc;
  try { doc = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(chunks[0].data)); }
  catch { throw new Invalid('JSON', 'Invalid UTF-8 or JSON chunk'); }
  check(doc && typeof doc === 'object' && !Array.isArray(doc), 'JSON', 'Expected glTF object');
  const actualExtensions = new Set();
  function walk(value, path = '') {
    if (typeof value === 'number') check(Number.isFinite(value), 'NONFINITE_JSON', `Nonfinite value at ${path}`);
    if (!value || typeof value !== 'object') return;
    if (value.extensions !== undefined) {
      check(value.extensions && typeof value.extensions === 'object' && !Array.isArray(value.extensions), 'EXTENSION', `Bad extension object ${path}`);
      for (const name of Object.keys(value.extensions)) {
        check(profile.allowedExtensions.includes(name), 'EXTENSION', `Unsupported extension ${name} at ${path}`);
        check(/^\/materials\/\d+$/.test(path), 'EXTENSION_LOCATION', `${name} is allowed only on materials`);
        check(value.extensions[name] && typeof value.extensions[name] === 'object' && !Array.isArray(value.extensions[name]), 'EXTENSION', `Bad ${name} payload`);
        actualExtensions.add(name);
      }
    }
    for (const [key, child] of Object.entries(value)) walk(child, `${path}/${key}`);
  }
  walk(doc);
  check(doc.asset?.version === '2.0' && (!doc.asset.minVersion || doc.asset.minVersion === '2.0'), 'ASSET_VERSION', 'Expected glTF 2.0 asset');
  for (const key of ['extensionsUsed', 'extensionsRequired']) {
    check(doc[key] === undefined || (Array.isArray(doc[key]) && doc[key].every((name) => profile.allowedExtensions.includes(name))
      && new Set(doc[key]).size === doc[key].length), 'EXTENSION', `Unsupported/duplicate ${key}`);
  }
  const used = doc.extensionsUsed ?? [];
  check([...actualExtensions].every((name) => used.includes(name)) && used.every((name) => actualExtensions.has(name))
    && (doc.extensionsRequired ?? []).every((name) => used.includes(name)), 'EXTENSION_DECLARATION', 'Extension declarations and actual use disagree');
  for (const key of ['nodes', 'scenes', 'meshes', 'materials', 'buffers', 'bufferViews', 'accessors', 'images', 'textures']) {
    check(Array.isArray(doc[key]) && doc[key].length > 0 && doc[key].every((item) => item && typeof item === 'object' && !Array.isArray(item)), 'SCHEMA', `Missing/invalid ${key}`);
  }
  for (const key of ['cameras', 'animations', 'skins']) {
    check(doc[key] === undefined || (Array.isArray(doc[key]) && doc[key].length === 0), 'NONSTATIC', `Pilot forbids ${key}`);
  }
  check(doc.samplers === undefined || (Array.isArray(doc.samplers) && doc.samplers.every((s) => s && typeof s === 'object')), 'SAMPLER', 'Invalid sampler list');
  const binary = chunks[1].data;
  check(doc.buffers.length === 1 && !('uri' in doc.buffers[0]) && integer(doc.buffers[0].byteLength, 1), 'BUFFER', 'Expected one embedded buffer');
  const bufferLength = doc.buffers[0].byteLength;
  check(bufferLength <= binary.length && binary.length - bufferLength <= 3 && binary.subarray(bufferLength).every((v) => v === 0), 'BUFFER_BOUNDS', 'BIN length/padding disagrees with buffer');
  doc.bufferViews.forEach((view, i) => {
    const offset = view.byteOffset ?? 0;
    check(view.buffer === 0 && integer(offset) && integer(view.byteLength, 1) && offset + view.byteLength <= bufferLength,
      'BUFFER_VIEW_BOUNDS', `bufferView ${i} exceeds embedded buffer`);
    check(view.byteStride === undefined || (integer(view.byteStride, 4) && view.byteStride <= 252 && view.byteStride % 4 === 0), 'STRIDE', `Invalid stride in bufferView ${i}`);
    check(view.target === undefined || [34962, 34963].includes(view.target), 'BUFFER_TARGET', `Invalid target in bufferView ${i}`);
  });
  const accessorCache = new Map();
  function accessor(index) {
    if (accessorCache.has(index)) return accessorCache.get(index);
    const a = ref(doc.accessors, index, 'accessor');
    check(a.sparse === undefined, 'SPARSE', 'Sparse accessors are outside the pilot profile');
    const view = ref(doc.bufferViews, a.bufferView, `accessor ${index} bufferView`);
    const size = sizes[a.componentType], width = dimensions[a.type], offset = a.byteOffset ?? 0;
    check(size && width && integer(a.count, 1) && integer(offset), 'ACCESSOR', `Invalid accessor ${index}`);
    check(a.normalized === undefined || (typeof a.normalized === 'boolean' && (!a.normalized || [5120, 5121, 5122, 5123].includes(a.componentType))), 'ACCESSOR', `Invalid normalization ${index}`);
    const stride = view.byteStride ?? size * width;
    check(offset % size === 0 && ((view.byteOffset ?? 0) + offset) % size === 0 && stride >= size * width
      && offset + (a.count - 1) * stride + size * width <= view.byteLength, 'ACCESSOR_BOUNDS', `Accessor ${index} exceeds/alignment disagrees with view`);
    for (const key of ['min', 'max']) check(a[key] === undefined || vector(a[key], width), 'ACCESSOR_EXTREMA', `Invalid ${key} at accessor ${index}`);
    const values = [], min = Array(width).fill(Infinity), max = Array(width).fill(-Infinity);
    for (let row = 0; row < a.count; row++) {
      const tuple = [];
      for (let col = 0; col < width; col++) {
        const value = binary[readers[a.componentType]]((view.byteOffset ?? 0) + offset + row * stride + col * size);
        check(Number.isFinite(value), 'NONFINITE_ATTRIBUTE', `Accessor ${index} contains nonfinite binary data`);
        tuple.push(value); min[col] = Math.min(min[col], value); max[col] = Math.max(max[col], value);
      }
      values.push(tuple);
    }
    for (const [key, actual] of [['min', min], ['max', max]]) {
      if (a[key]) check(actual.every((value, i) => Math.abs(value - a[key][i]) <= 1e-5 * Math.max(1, Math.abs(value))), 'ACCESSOR_EXTREMA', `Accessor ${index} ${key} disagrees with binary data`);
    }
    const result = { definition: a, view, values, min, max };
    accessorCache.set(index, result);
    return result;
  }
  // Inspect unused accessor data too: the candidate must not hide bad binary values.
  doc.accessors.forEach((_, index) => accessor(index));

  let totalPixels = 0;
  metrics.images = doc.images.map((image, index) => {
    check(!('uri' in image) && profile.imageMimeTypes.includes(image.mimeType), 'IMAGE_FORMAT', `Image ${index} must be embedded PNG/JPEG`);
    const view = ref(doc.bufferViews, image.bufferView, `image ${index}`);
    check(view.byteStride === undefined && view.target === undefined, 'IMAGE_VIEW', 'Image bufferView must not have target/stride');
    const data = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    const [width, height] = imageSize(data, image.mimeType);
    check(width > 0 && height > 0 && width <= profile.limits.imageDimension && height <= profile.limits.imageDimension, 'IMAGE_DIMENSION', `Image ${index} exceeds dimension limit`);
    totalPixels += width * height;
    return { index, name: image.name ?? null, mimeType: image.mimeType, bytes: data.length, width, height, sha256: sha256(data) };
  });
  check(totalPixels <= profile.limits.totalImagePixels, 'IMAGE_BUDGET', 'Combined image pixels exceed pilot ceiling');
  metrics.imagePixels = totalPixels;
  (doc.samplers ?? []).forEach((s, i) => {
    check((s.magFilter === undefined || [9728, 9729].includes(s.magFilter))
      && (s.minFilter === undefined || [9728, 9729, 9984, 9985, 9986, 9987].includes(s.minFilter))
      && [s.wrapS, s.wrapT].every((v) => v === undefined || [33071, 33648, 10497].includes(v)), 'SAMPLER', `Invalid sampler ${i}`);
  });
  doc.textures.forEach((texture, i) => {
    ref(doc.images, texture.source, `texture ${i} source`);
    if (texture.sampler !== undefined) ref(doc.samplers ?? [], texture.sampler, `texture ${i} sampler`);
  });
  const usedTextures = new Set();
  function textureSlot(slot, context) {
    check(slot && typeof slot === 'object', 'TEXTURE_SLOT', `Missing ${context}`);
    ref(doc.textures, slot.index, context); usedTextures.add(slot.index);
    check((slot.texCoord ?? 0) === 0, 'TEXCOORD', `Only UV0 is allowed: ${context}`);
  }
  const expectedMaterials = new Set(Object.values(profile.nodes));
  check(doc.materials.length === expectedMaterials.size && new Set(doc.materials.map((m) => m.name)).size === doc.materials.length
    && doc.materials.every((m) => expectedMaterials.has(m.name)), 'MATERIAL_SET', 'Expected exact eight uniquely named pilot materials');
  doc.materials.forEach((m) => {
    const pbr = m.pbrMetallicRoughness ?? {};
    check((m.alphaMode ?? 'OPAQUE') === 'OPAQUE' && (pbr.baseColorFactor ?? [1, 1, 1, 1])[3] === 1, 'MATERIAL_ALPHA', `${m.name} must be opaque with alpha 1`);
    check((pbr.baseColorFactor === undefined || (vector(pbr.baseColorFactor, 4) && pbr.baseColorFactor.every(unit)))
      && unit(pbr.metallicFactor ?? 1) && unit(pbr.roughnessFactor ?? 1)
      && (m.emissiveFactor === undefined || (vector(m.emissiveFactor, 3) && m.emissiveFactor.every(unit)))
      && (m.doubleSided === undefined || typeof m.doubleSided === 'boolean'), 'MATERIAL_FACTOR', `Invalid PBR factor ${m.name}`);
    const slots = { baseColorTexture: pbr.baseColorTexture, metallicRoughnessTexture: pbr.metallicRoughnessTexture,
      normalTexture: m.normalTexture, occlusionTexture: m.occlusionTexture, emissiveTexture: m.emissiveTexture };
    for (const required of profile.requiredTextureSlots[m.name] ?? []) check(slots[required] !== undefined, 'REQUIRED_TEXTURE', `${m.name} requires ${required}`);
    for (const [name, slot] of Object.entries(slots)) if (slot !== undefined) textureSlot(slot, `${m.name}.${name}`);
    check(m.normalTexture?.scale === undefined || Number.isFinite(m.normalTexture.scale), 'MATERIAL_FACTOR', 'Invalid normal scale');
    check(unit(m.occlusionTexture?.strength ?? 1), 'MATERIAL_FACTOR', 'Invalid occlusion strength');
    for (const [name, extension] of Object.entries(m.extensions ?? {})) {
      if (name === 'KHR_materials_emissive_strength') check(Number.isFinite(extension.emissiveStrength ?? 1) && (extension.emissiveStrength ?? 1) >= 0, 'MATERIAL_EXTENSION', 'Invalid emissive strength');
      if (name === 'KHR_materials_ior') check((extension.ior ?? 1.5) === 0 || (Number.isFinite(extension.ior ?? 1.5) && (extension.ior ?? 1.5) >= 1), 'MATERIAL_EXTENSION', 'Invalid IOR');
      if (name === 'KHR_materials_specular') {
        check(unit(extension.specularFactor ?? 1) && (extension.specularColorFactor === undefined
          || (vector(extension.specularColorFactor, 3) && extension.specularColorFactor.every(unit))), 'MATERIAL_EXTENSION', 'Invalid specular factor');
        for (const key of ['specularTexture', 'specularColorTexture']) if (extension[key] !== undefined) textureSlot(extension[key], key);
      }
    }
  });
  check(usedTextures.size === doc.textures.length && new Set([...usedTextures].map((i) => doc.textures[i].source)).size === doc.images.length,
    'UNUSED_TEXTURE', 'Unreferenced textures/images are outside pilot scope');

  const expectedNames = Object.keys(profile.nodes);
  check(doc.nodes.length === expectedNames.length && new Set(doc.nodes.map((n) => n.name)).size === expectedNames.length
    && doc.nodes.every((n) => expectedNames.includes(n.name)), 'NODE_SET', 'Expected exact nine unique pilot node names');
  check(doc.scene === 0 && doc.scenes.length === 1 && Array.isArray(doc.scenes[0].nodes)
    && doc.scenes[0].nodes.length === expectedNames.length && new Set(doc.scenes[0].nodes).size === expectedNames.length
    && doc.scenes[0].nodes.every((i) => integer(i) && i < doc.nodes.length), 'SCENE_ROOTS', 'All nine nodes must be direct roots of the single default scene');
  const groupBounds = {};
  const meshRefs = new Set(), geometryKeys = new Map();
  let triangles = 0, primitives = 0;
  metrics.nodes = doc.nodes.map((node) => {
    check(!('camera' in node) && !('skin' in node) && !('weights' in node) && (!node.children || node.children.length === 0), 'NODE_STRUCTURE', `${node.name} must be a static root mesh`);
    const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    check(!(node.matrix && ['translation', 'rotation', 'scale'].some((key) => node[key] !== undefined)), 'TRANSFORM', `${node.name} cannot combine matrix and TRS`);
    for (const [key, expected] of [['matrix', identity], ['translation', [0, 0, 0]], ['rotation', [0, 0, 0, 1]], ['scale', [1, 1, 1]]]) {
      check(node[key] === undefined || (vector(node[key], expected.length) && node[key].every((v, i) => Math.abs(v - expected[i]) < 1e-6)), 'TRANSFORM', `${node.name} requires identity ${key}; positions already carry metre world placement`);
    }
    check(node.extras?.pilot === 'right-limit' && node.extras?.occluder === true
      && (node.extras.transparent === undefined || node.extras.transparent === false)
      && (node.extras.nocast === undefined || typeof node.extras.nocast === 'boolean'), 'OCCLUSION_METADATA', `${node.name}: opaque pilot needs occluder=true; nocast is independent`);
    const mesh = ref(doc.meshes, node.mesh, `${node.name} mesh`); meshRefs.add(node.mesh);
    check(mesh.weights === undefined && Array.isArray(mesh.primitives) && mesh.primitives.length > 0, 'MESH', `Invalid static mesh ${node.name}`);
    let nodeTriangles = 0;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    mesh.primitives.forEach((primitive) => {
      check((primitive.mode ?? 4) === 4 && primitive.targets === undefined, 'PRIMITIVE', 'Pilot permits only static TRIANGLES');
      check(primitive.attributes && typeof primitive.attributes === 'object'
        && Object.keys(primitive.attributes).every((name) => ['POSITION', 'NORMAL', 'TEXCOORD_0', 'TANGENT'].includes(name)), 'ATTRIBUTES', 'Unsupported vertex semantic');
      const position = accessor(primitive.attributes.POSITION);
      check(position.definition.type === 'VEC3' && position.definition.componentType === 5126 && !position.definition.normalized
        && position.definition.min && position.definition.max, 'POSITION', 'POSITION requires float VEC3 and exact min/max');
      check(position.view.target === undefined || position.view.target === 34962, 'BUFFER_TARGET', 'POSITION has index-buffer target');
      for (const [semantic, width] of [['NORMAL', 'VEC3'], ['TEXCOORD_0', 'VEC2'], ['TANGENT', 'VEC4']]) {
        if (semantic === 'TANGENT' && primitive.attributes[semantic] === undefined) continue;
        const attribute = accessor(primitive.attributes[semantic]);
        check(attribute.definition.type === width && attribute.definition.componentType === 5126 && !attribute.definition.normalized
          && attribute.definition.count === position.definition.count, 'ATTRIBUTE_LAYOUT', `${semantic} must be matching float ${width}`);
        check(attribute.view.target === undefined || attribute.view.target === 34962, 'BUFFER_TARGET', `${semantic} has index-buffer target`);
        if (semantic === 'NORMAL') check(attribute.values.every((v) => Math.abs(Math.hypot(...v) - 1) < 0.01), 'NORMAL', 'Normals must be unit vectors');
      }
      const material = ref(doc.materials, primitive.material, 'primitive material');
      check(material.name === profile.nodes[node.name], 'NODE_MATERIAL', `${node.name} requires ${profile.nodes[node.name]}`);
      let count = position.definition.count;
      if (primitive.indices !== undefined) {
        const indices = accessor(primitive.indices);
        check(indices.definition.type === 'SCALAR' && [5121, 5123, 5125].includes(indices.definition.componentType)
          && !indices.definition.normalized && indices.view.byteStride === undefined
          && (indices.view.target === undefined || indices.view.target === 34963), 'INDICES', 'Expected unsigned unstrided index accessor');
        check(indices.values.every(([value]) => value < position.definition.count), 'INDEX_BOUNDS', 'Index exceeds vertex count');
        count = indices.definition.count;
      }
      check(count % 3 === 0, 'TRIANGLES', 'TRIANGLES count must be divisible by three');
      nodeTriangles += count / 3; primitives++;
      const key = JSON.stringify([primitive.attributes.POSITION, primitive.indices ?? null, primitive.attributes.NORMAL, primitive.attributes.TEXCOORD_0, primitive.attributes.TANGENT ?? null]);
      geometryKeys.set(key, count / 3);
      for (let axis = 0; axis < 3; axis++) { min[axis] = Math.min(min[axis], position.min[axis]); max[axis] = Math.max(max[axis], position.max[axis]); }
    });
    triangles += nodeTriangles;
    const group = node.name.startsWith('pilot_door_') ? 'door' : 'lamp', bound = profile.boundsMetres[group];
    check(min.every((value, axis) => value >= bound.min[axis]) && max.every((value, axis) => value <= bound.max[axis]), 'PLACEMENT', `${node.name} outside agreed metre world envelope`);
    groupBounds[group] ??= { min: [...min], max: [...max] };
    for (let axis = 0; axis < 3; axis++) {
      groupBounds[group].min[axis] = Math.min(groupBounds[group].min[axis], min[axis]);
      groupBounds[group].max[axis] = Math.max(groupBounds[group].max[axis], max[axis]);
    }
    return { name: node.name, material: profile.nodes[node.name], triangles: nodeTriangles, primitives: mesh.primitives.length,
      boundsMetres: { min, max }, occluder: true, nocast: node.extras.nocast ?? false };
  });
  check(meshRefs.size === doc.meshes.length, 'UNUSED_MESH', 'Pilot contains unused mesh definitions');
  for (const [group, bounds] of Object.entries(groupBounds)) {
    const height = bounds.max[1] - bounds.min[1];
    check(height >= profile.boundsMetres[group].minHeight && height <= profile.boundsMetres[group].maxHeight, 'SCALE', `${group} height ${height}m disagrees with metre placement`);
  }
  check(triangles <= profile.limits.triangles, 'TRIANGLE_BUDGET', 'Instantiated pilot triangles exceed ceiling');
  check(primitives <= profile.limits.primitives, 'PRIMITIVE_BUDGET', 'Instantiated pilot primitives exceed ceiling');
  Object.assign(metrics, { instantiatedTriangles: triangles, uniqueGeometryTriangles: [...geometryKeys.values()].reduce((a, b) => a + b, 0),
    primitiveInstances: primitives, materials: doc.materials.length, textures: doc.textures.length,
    groupBoundsMetres: groupBounds, extensions: used,
    gzipBytesEstimate: gzipSync(bytes).length, brotliBytesEstimate: brotliCompressSync(bytes).length });
}

// Header/chunk checks only. A browser decoder must still prove image decode success.
function imageSize(data, mime) {
  if (mime === 'image/png') {
    check(data.length >= 45 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'IMAGE_SIGNATURE', 'PNG signature missing');
    let width, height, idat = false, end = false;
    for (let offset = 8; offset < data.length;) {
      check(offset + 12 <= data.length, 'IMAGE_BOUNDS', 'Truncated PNG chunk header');
      const length = data.readUInt32BE(offset), type = data.toString('ascii', offset + 4, offset + 8);
      check(offset + 12 + length <= data.length, 'IMAGE_BOUNDS', 'Truncated PNG chunk');
      if (offset === 8) {
        check(type === 'IHDR' && length === 13, 'IMAGE_SIGNATURE', 'PNG must start with IHDR');
        width = data.readUInt32BE(offset + 8); height = data.readUInt32BE(offset + 12);
      } else check(type !== 'IHDR', 'IMAGE_SIGNATURE', 'Duplicate PNG IHDR');
      if (type === 'IDAT') idat = true;
      if (type === 'IEND') { check(length === 0 && offset + 12 === data.length, 'IMAGE_BOUNDS', 'Bad PNG IEND'); end = true; }
      offset += 12 + length;
    }
    check(idat && end, 'IMAGE_SIGNATURE', 'PNG lacks IDAT/IEND');
    return [width, height];
  }
  check(data.length >= 4 && data.readUInt16BE(0) === 0xffd8 && data.readUInt16BE(data.length - 2) === 0xffd9, 'IMAGE_SIGNATURE', 'JPEG SOI/EOI missing');
  let dimensions;
  for (let offset = 2; offset < data.length - 2;) {
    check(data[offset++] === 0xff, 'IMAGE_SIGNATURE', 'Invalid JPEG marker');
    while (data[offset] === 0xff) offset++;
    const marker = data[offset++];
    if (marker === 0xda) break; // Entropy stream decoding is intentionally deferred.
    check(offset + 2 <= data.length, 'IMAGE_BOUNDS', 'Truncated JPEG segment');
    const length = data.readUInt16BE(offset);
    check(length >= 2 && offset + length <= data.length - 2, 'IMAGE_BOUNDS', 'JPEG segment exceeds image');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      check(length >= 8, 'IMAGE_BOUNDS', 'Truncated JPEG frame');
      dimensions = [data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3)];
    }
    offset += length;
  }
  check(dimensions, 'IMAGE_SIGNATURE', 'JPEG requires baseline/extended/progressive frame dimensions');
  return dimensions;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (!(args.length === 1 || (args.length === 3 && args[1] === '--report'))) throw new Error('Usage: node validate-glb.mjs <candidate.glb> [--report <path-under-integration-contract>]');
    const candidate = resolve(args[0]);
    const result = { candidate, ...validateGlb(readFileSync(candidate)) };
    const output = `${JSON.stringify(result, null, 2)}\n`;
    if (args[2]) {
      const destination = resolve(args[2]), child = relative(directory, destination);
      if (!child || child.startsWith('..') || isAbsolute(child)) throw new Error('Reports must stay under integration-contract/');
      writeFileSync(destination, output);
    }
    process.stdout.write(output);
    process.exitCode = result.valid ? 0 : 1;
  } catch (error) {
    process.stderr.write(`${error.stack ?? error}\n`);
    process.exitCode = 2;
  }
}
