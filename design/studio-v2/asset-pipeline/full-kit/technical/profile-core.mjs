// Shared byte preflight. Browser-safe; no decoder, filesystem, cache, or manifest trust.
import * as THREE from 'three';

export function requireFullKit(condition, message) {
  if (!condition) throw new Error(`Studio full kit: ${message}`);
}
const check = requireFullKit;
// Frozen source identity: raw bytes remain the manifest contract. The canonical
// pin also binds the parsed JSON bundled by Next, where source whitespace is lost.
// Both pins must be verified against asset-inventory.json when it is revised.
export const artInventorySha256 = 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87';
export const artInventoryCanonicalSha256 = '4c654f241a29a3ce83229132bdbf085798690af56beaca388e1b5fb3e361b8d2';
export function checkInventoryIdentity(canonicalSha256) {
  check(canonicalSha256 === artInventoryCanonicalSha256, 'bundled art inventory identity mismatch');
}
const finite = (value, size) => Array.isArray(value) && value.length === size && value.every(Number.isFinite);
const integer = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
const unit = (value) => Number.isFinite(value) && value >= 0 && value <= 1;
const equal = (a, b, tolerance = 1e-6) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= tolerance);
const dimensions = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const readers = { 5121: ['getUint8', 1], 5123: ['getUint16', 2], 5125: ['getUint32', 4], 5126: ['getFloat32', 4] };

export function parseGlb(input, profile) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  check(bytes.length >= 28 && bytes.length <= profile.guards.maxRawGlbBytes, 'invalid GLB size');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  check(view.getUint32(0, true) === 0x46546c67 && view.getUint32(4, true) === 2 && view.getUint32(8, true) === bytes.length, 'invalid GLB header');
  const chunks = [];
  for (let offset = 12; offset < bytes.length;) {
    check(offset + 8 <= bytes.length, 'truncated chunk');
    const length = view.getUint32(offset, true);
    check(length % 4 === 0 && offset + 8 + length <= bytes.length, 'invalid chunk bounds');
    chunks.push({ type: view.getUint32(offset + 4, true), data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += length + 8;
  }
  check(chunks.length === 2 && chunks[0].type === 0x4e4f534a && chunks[1].type === 0x004e4942, 'JSON then BIN required');
  const doc = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(chunks[0].data));
  return { doc, binary: chunks[1].data };
}

export function imageDimensions(data, mime) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const ascii = (offset, count) => String.fromCharCode(...data.subarray(offset, offset + count));
  if (mime === 'image/png') {
    check(data.length >= 45 && equal([...data.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 0), 'PNG signature');
    let size, idat = false, end = false;
    for (let offset = 8; offset < data.length;) {
      check(offset + 12 <= data.length, 'PNG chunk header');
      const length = view.getUint32(offset), type = ascii(offset + 4, 4);
      check(offset + 12 + length <= data.length, 'PNG chunk bounds');
      if (offset === 8) {
        check(type === 'IHDR' && length === 13, 'PNG IHDR');
        size = [view.getUint32(offset + 8), view.getUint32(offset + 12)];
      } else check(type !== 'IHDR', 'duplicate PNG IHDR');
      if (type === 'IDAT') idat = true;
      if (type === 'IEND') { check(length === 0 && offset + 12 === data.length, 'PNG end'); end = true; }
      offset += length + 12;
    }
    check(size && idat && end, 'PNG incomplete');
    return size;
  }
  check(mime === 'image/jpeg' && data.length >= 4 && view.getUint16(0) === 0xffd8 && view.getUint16(data.length - 2) === 0xffd9, 'JPEG signature');
  let size;
  for (let offset = 2; offset < data.length - 2;) {
    check(data[offset++] === 0xff, 'JPEG marker');
    while (data[offset] === 0xff) offset++;
    const marker = data[offset++];
    if (marker === 0xda) break;
    check(offset + 2 <= data.length, 'JPEG header');
    const length = view.getUint16(offset);
    check(length >= 2 && offset + length <= data.length - 2, 'JPEG bounds');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      check(length >= 8, 'JPEG frame');
      size = [view.getUint16(offset + 5), view.getUint16(offset + 3)];
    }
    offset += length;
  }
  check(size, 'JPEG dimensions');
  return size;
}

export function textureSlots(material) {
  const pbr = material.pbrMetallicRoughness ?? {}, ext = material.extensions ?? {};
  return Object.entries({
    map: pbr.baseColorTexture, metalnessMap: pbr.metallicRoughnessTexture, roughnessMap: pbr.metallicRoughnessTexture,
    normalMap: material.normalTexture, aoMap: material.occlusionTexture, emissiveMap: material.emissiveTexture,
    specularIntensityMap: ext.KHR_materials_specular?.specularTexture,
    specularColorMap: ext.KHR_materials_specular?.specularColorTexture,
  }).filter(([, value]) => value !== undefined).map(([slot, value]) => ({ slot, textureIndex: value.index, texCoord: value.texCoord ?? 0 }));
}

function matrixFor(node) {
  check(!(node.matrix && ['translation', 'rotation', 'scale'].some((key) => node[key] !== undefined)), 'matrix XOR TRS');
  let matrix;
  if (node.matrix) {
    check(finite(node.matrix, 16), 'finite matrix');
    matrix = new THREE.Matrix4().fromArray(node.matrix);
  } else {
    const t = node.translation ?? [0, 0, 0], r = node.rotation ?? [0, 0, 0, 1], s = node.scale ?? [1, 1, 1];
    check(finite(t, 3) && finite(r, 4) && finite(s, 3) && s.every((v) => v > 0) && Math.abs(Math.hypot(...r) - 1) < 1e-5, 'finite positive TRS');
    matrix = new THREE.Matrix4().compose(new THREE.Vector3(...t), new THREE.Quaternion(...r), new THREE.Vector3(...s));
  }
  const t = new THREE.Vector3(), r = new THREE.Quaternion(), s = new THREE.Vector3();
  matrix.decompose(t, r, s);
  check(s.toArray().every((v) => v > 0) && equal(matrix.elements, new THREE.Matrix4().compose(t, r, s).elements), 'shear/reflection/non-affine matrix');
  return { matrix, scale: s.toArray() };
}

// Baseline is exact source math, including the yaw-rotated local face offset.
export function expectedBindings(inventory, variant) {
  check(['baseline', 'proposal'].includes(variant), 'explicit baseline/proposal required');
  const source = {
    dissertation: { p: [-1.61, 2.38, -0.27], yaw: 0 },
    copilot: { p: [-3.11, 2.44, -0.13], yaw: 0.3 },
    typeforge: { p: [-0.11, 2.44, -0.13], yaw: -0.3 },
    studio: { p: [-1.61, 3.52, -0.64], yaw: 0 },
  };
  const result = {};
  for (const face of [...inventory.targets.faces, { ...inventory.targets.decorativeDisplay, projectId: 'studio' }]) {
    const { p, yaw } = source[face.projectId];
    const normal = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const centre = new THREE.Vector3(...p).addScaledVector(normal, 0.054).sub(new THREE.Vector3(0, 0.11, 0)).multiplyScalar(0.5);
    if (variant === 'proposal' && face.proposedPlacement) {
      const [x, y, z] = face.proposedPlacement.centreBlenderM;
      centre.set(x, z, -y);
    }
    const entries = [[face.node, face.faceSizeM, centre]];
    if (face.borderNode) entries.push([face.borderNode, face[variant === 'baseline' ? 'borderSizeM_current' : 'borderSizeM_proposed'], centre.clone().addScaledVector(normal, variant === 'baseline' ? -0.0025 : -0.004)]);
    for (const [name, size, position] of entries) {
      const matrix = new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1));
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => new THREE.Vector3(x * size[0] / 2, y * size[1] / 2, 0).applyMatrix4(matrix).multiplyScalar(2).add(new THREE.Vector3(0, 0.11, 0)).toArray());
      result[name] = { matrix: matrix.toArray(), size, corners };
    }
  }
  return result;
}

export function inspectFullKit(input, profile, inventory, variant) {
  const { doc, binary } = parseGlb(input, profile);
  const ref = (list, index, context) => { check(Array.isArray(list) && integer(index) && index < list.length, `invalid ${context} reference`); return list[index]; };
  const actualExtensions = new Set();
  const walk = (value, path = '') => {
    if (typeof value === 'number') check(Number.isFinite(value), 'nonfinite JSON');
    if (!value || typeof value !== 'object') return;
    if (value.extensions !== undefined) {
      check(!Array.isArray(value.extensions) && value.extensions && typeof value.extensions === 'object', 'invalid extensions');
      for (const [name, payload] of Object.entries(value.extensions)) {
        check(profile.geometry.allowedExtensions.includes(name) && /^\/materials\/\d+$/.test(path) && payload && typeof payload === 'object', 'unsupported extension/location');
        actualExtensions.add(name);
      }
    }
    for (const [key, child] of Object.entries(value)) walk(child, `${path}/${key}`);
  };
  walk(doc);
  check(doc.asset?.version === '2.0' && (!doc.asset.minVersion || doc.asset.minVersion === '2.0'), 'glTF version');
  for (const key of ['nodes', 'scenes', 'meshes', 'materials', 'buffers', 'bufferViews', 'accessors']) check(Array.isArray(doc[key]) && doc[key].length > 0, `missing ${key}`);
  for (const key of ['images', 'textures', 'samplers']) { check(doc[key] === undefined || Array.isArray(doc[key]), `invalid ${key}`); doc[key] ??= []; }
  for (const key of ['animations', 'skins', 'cameras']) check(doc[key] === undefined || (Array.isArray(doc[key]) && !doc[key].length), `forbidden ${key}`);
  for (const key of ['extensionsUsed', 'extensionsRequired']) check(doc[key] === undefined || (Array.isArray(doc[key]) && new Set(doc[key]).size === doc[key].length && doc[key].every((name) => actualExtensions.has(name))), 'extension declaration');
  check([...actualExtensions].every((name) => doc.extensionsUsed?.includes(name)), 'undeclared extension');
  check(doc.buffers.length === 1 && !('uri' in doc.buffers[0]) && integer(doc.buffers[0].byteLength, 1), 'embedded buffer');
  const length = doc.buffers[0].byteLength;
  check(length <= binary.length && binary.length - length <= 3 && binary.subarray(length).every((v) => v === 0), 'buffer length/padding');
  doc.bufferViews.forEach((view) => {
    check(view.buffer === 0 && integer(view.byteOffset ?? 0) && integer(view.byteLength, 1) && (view.byteOffset ?? 0) + view.byteLength <= length, 'bufferView bounds');
    check(view.byteStride === undefined || (integer(view.byteStride, 4) && view.byteStride <= 252 && view.byteStride % 4 === 0), 'byte stride');
    check(view.target === undefined || [34962, 34963].includes(view.target), 'buffer target');
  });
  const dataView = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  const accessors = doc.accessors.map((a) => {
    check(a.sparse === undefined, 'sparse accessor');
    const view = ref(doc.bufferViews, a.bufferView, 'accessor bufferView');
    const width = dimensions[a.type], [reader, size] = readers[a.componentType] ?? [];
    check(width && size && integer(a.count, 1) && integer(a.byteOffset ?? 0), 'accessor format');
    check(a.normalized === undefined || (typeof a.normalized === 'boolean' && (!a.normalized || [5121, 5123].includes(a.componentType))), 'accessor normalization');
    const offset = a.byteOffset ?? 0, start = (view.byteOffset ?? 0) + offset, stride = view.byteStride ?? width * size;
    check(offset % size === 0 && start % size === 0 && stride >= width * size && offset + (a.count - 1) * stride + width * size <= view.byteLength, 'accessor bounds/alignment');
    const min = Array(width).fill(Infinity), max = Array(width).fill(-Infinity);
    const values = Array.from({ length: a.count }, (_, row) => Array.from({ length: width }, (_, col) => {
      const v = dataView[reader](start + row * stride + col * size, true);
      check(Number.isFinite(v), 'nonfinite binary attribute');
      min[col] = Math.min(min[col], v); max[col] = Math.max(max[col], v);
      return a.normalized ? v / (a.componentType === 5121 ? 255 : 65535) : v;
    }));
    for (const [key, actual] of [['min', min], ['max', max]]) if (a[key] !== undefined) check(finite(a[key], width) && equal(a[key], actual, 1e-5), 'accessor extrema');
    return { ...a, view, values };
  });
  let imagePixels = 0;
  const images = doc.images.map((image, index) => {
    check(!('uri' in image) && ['image/png', 'image/jpeg'].includes(image.mimeType), 'embedded image required');
    const view = ref(doc.bufferViews, image.bufferView, 'image');
    check(view.target === undefined && view.byteStride === undefined, 'image view');
    const bytes = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    const [width, height] = imageDimensions(bytes, image.mimeType);
    check(width > 0 && height > 0 && Math.max(width, height) <= profile.materials.maxImageDimension, 'image dimensions');
    imagePixels += width * height;
    return { index, mimeType: image.mimeType, width, height, bytes: bytes.length };
  });
  check(imagePixels <= profile.materials.maxUniqueImagePixels, 'image pixel budget');
  doc.samplers.forEach((s) => check((s.magFilter === undefined || [9728, 9729].includes(s.magFilter)) && (s.minFilter === undefined || [9728, 9729, 9984, 9985, 9986, 9987].includes(s.minFilter)) && [s.wrapS, s.wrapT].every((v) => v === undefined || [33071, 33648, 10497].includes(v)), 'sampler'));
  const textures = doc.textures.map((t, index) => { ref(doc.images, t.source, 'texture image'); if (t.sampler !== undefined) ref(doc.samplers, t.sampler, 'sampler'); return { index, source: t.source, sampler: t.sampler === undefined ? null : doc.samplers[t.sampler] }; });
  check(new Set(doc.materials.map((m) => m.name)).size === doc.materials.length, 'duplicate material names');
  const materials = doc.materials.map((m, index) => {
    check(profile.materials.names.includes(m.name), 'unknown material');
    const p = m.pbrMetallicRoughness ?? {}, blend = profile.materials.blendNames.includes(m.name);
    check((m.alphaMode ?? 'OPAQUE') === (blend ? 'BLEND' : 'OPAQUE') && (blend || (p.baseColorFactor ?? [1, 1, 1, 1])[3] === 1) && m.alphaCutoff === undefined, 'material alpha');
    check((p.baseColorFactor === undefined || (finite(p.baseColorFactor, 4) && p.baseColorFactor.every(unit))) && unit(p.roughnessFactor ?? 1) && unit(p.metallicFactor ?? 1) && (m.emissiveFactor === undefined || (finite(m.emissiveFactor, 3) && m.emissiveFactor.every(unit))) && (m.doubleSided === undefined || typeof m.doubleSided === 'boolean'), 'material factors');
    const e = m.extensions ?? {};
    check((e.KHR_materials_emissive_strength === undefined || (Number.isFinite(e.KHR_materials_emissive_strength.emissiveStrength) && e.KHR_materials_emissive_strength.emissiveStrength >= 0)) && (e.KHR_materials_ior === undefined || (Number.isFinite(e.KHR_materials_ior.ior) && e.KHR_materials_ior.ior >= 1)), 'material extension factors');
    const specular = e.KHR_materials_specular;
    check(!specular || (unit(specular.specularFactor ?? 1) && (specular.specularColorFactor === undefined || (finite(specular.specularColorFactor, 3) && specular.specularColorFactor.every(unit)))), 'specular factors');
    const slots = textureSlots(m);
    slots.forEach((s) => { ref(doc.textures, s.textureIndex, 'material texture'); check(s.texCoord === 0, 'only UV0 textures'); });
    return { index, name: m.name, definition: m, slots };
  });
  const meshes = doc.meshes.map((mesh) => {
    check(!mesh.weights && mesh.primitives?.length === 1, 'single primitive mesh');
    const primitive = mesh.primitives[0], attributes = primitive.attributes;
    check((primitive.mode ?? 4) === 4 && !primitive.targets && !primitive.extensions && attributes && Object.keys(attributes).every((key) => [...profile.geometry.attributesRequired, 'COLOR_0'].includes(key)), 'plain triangles/attributes');
    const material = ref(doc.materials, primitive.material, 'primitive material');
    const position = ref(accessors, attributes.POSITION, 'position');
    for (const [semantic, type] of [['POSITION', 'VEC3'], ['NORMAL', 'VEC3'], ['TEXCOORD_0', 'VEC2']]) {
      const a = ref(accessors, attributes[semantic], semantic);
      check(a.type === type && a.componentType === 5126 && !a.normalized && a.count === position.count && (a.view.target === undefined || a.view.target === 34962), 'attribute layout');
    }
    check(position.min && position.max, 'position extrema required');
    check(accessors[attributes.NORMAL].values.every((v) => Math.abs(Math.hypot(...v) - 1) < 0.01), 'unit normals');
    if (attributes.COLOR_0 !== undefined) {
      const color = ref(accessors, attributes.COLOR_0, 'COLOR_0');
      check(color.type === 'VEC3' && color.count === position.count && ((color.componentType === 5126 && !color.normalized) || ([5121, 5123].includes(color.componentType) && color.normalized === true)) && (color.view.target === undefined || color.view.target === 34962) && color.values.flat().every(unit) && profile.geometry.color0.materials.includes(material.name), 'COLOR_0 requires permitted material and finite unit RGB');
    }
    let indices = Array.from({ length: position.count }, (_, i) => i);
    if (primitive.indices !== undefined) {
      const a = ref(accessors, primitive.indices, 'indices');
      check(a.type === 'SCALAR' && [5121, 5123, 5125].includes(a.componentType) && !a.normalized && a.view.byteStride === undefined && (a.view.target === undefined || a.view.target === 34963), 'index format');
      indices = a.values.flat();
      check(indices.every((v) => v < position.count), 'index bounds');
    }
    check(indices.length > 0 && indices.length % 3 === 0, 'triangle count');
    return { primitive, position, indices, triangles: indices.length / 3 };
  });
  check(doc.scenes.length === 1 && (doc.scene ?? 0) === 0 && doc.scenes[0].nodes?.length === 1 && doc.nodes.length <= profile.root.maxNodes, 'single bounded scene/root');
  const rootIndex = doc.scenes[0].nodes[0];
  check(ref(doc.nodes, rootIndex, 'root').name === profile.root.name, 'root name');
  const ids = new Set(inventory.assets.map((a) => a.id)), seen = new Set(), names = new Set(), meshRefs = new Set();
  const bounds = new THREE.Box3(), nodes = [], targetWorldCorners = {}, binding = expectedBindings(inventory, variant);
  const reserved = new Set([...Object.keys(binding), profile.bindings.dusk]);
  let placedTriangles = 0, shadowTriangles = 0, primitiveInstances = 0, shadowInstances = 0;
  const visit = (index, parent, parentMatrix, depth, ancestorUnit) => {
    check(!seen.has(index) && depth <= profile.root.maxDepth, 'cycle/multiple parent/depth'); seen.add(index);
    const node = ref(doc.nodes, index, 'node');
    check(typeof node.name === 'string' && !names.has(node.name), 'unique exact node name'); names.add(node.name);
    const { matrix, scale } = matrixFor(node), world = parentMatrix.clone().multiply(matrix);
    const unitChain = ancestorUnit && equal(scale, [1, 1, 1]);
    if (index === rootIndex) check(matrix.equals(new THREE.Matrix4()) && node.mesh === undefined, 'identity group root');
    else check(reserved.has(node.name) || (/^[a-z0-9_]+__[A-Za-z0-9_]+$/.test(node.name) && ids.has(node.name.split('__')[0])), 'node naming policy');
    check(node.skin === undefined && node.camera === undefined && node.weights === undefined && node.extras?.interactive === undefined, 'unsupported node data');
    const children = node.children ?? [];
    check(Array.isArray(children) && new Set(children).size === children.length, 'children');
    let materialIndex = null, renderOrder = null;
    if (node.mesh !== undefined) {
      check(!children.length, 'mesh leaf required');
      const mesh = ref(meshes, node.mesh, 'mesh'); meshRefs.add(node.mesh);
      const e = node.extras ?? {}, material = doc.materials[mesh.primitive.material]; materialIndex = mesh.primitive.material;
      check(ids.has(e.assetId) && profile.leafMetadata.roles.includes(e.role) && ['occluder', 'transparent', 'nocast', 'receiveShadow'].every((key) => typeof e[key] === 'boolean'), 'leaf metadata');
      if (!reserved.has(node.name)) check(node.name.startsWith(`${e.assetId}__`), 'assetId/name mismatch');
      const target = profile.bindings.surfaces.includes(node.name), border = profile.bindings.borders.includes(node.name);
      const expectedRole = target ? 'target' : border ? 'border' : node.name === profile.bindings.decorative ? 'decorative-screen' : node.name === profile.bindings.dusk ? 'runtime-dusk' : e.transparent ? 'transparent' : 'opaque';
      check(e.role === expectedRole && e.transparent === profile.materials.blendNames.includes(material.name), 'role/material mismatch');
      check(e.occluder === (!e.transparent && !target && !border), 'opaque blocker omission');
      if (e.transparent) {
        // Contacts have a frozen order; other blends require an authored order.
        renderOrder = material.name === 'lib_contact' ? 1 : e.renderOrder;
        check(e.nocast && !e.receiveShadow && Number.isFinite(renderOrder) && (e.renderOrder === undefined || e.renderOrder === renderOrder), 'blend order/shadow flags');
      }
      if (reserved.has(node.name)) check(material.name === 'rt_placeholder' && e.nocast && !e.receiveShadow && unitChain, 'binding material/shadow/ancestor scale');
      const points = mesh.position.values.map((v) => new THREE.Vector3(...v).applyMatrix4(world));
      points.forEach((v) => { check(v.toArray().every((n) => Number.isFinite(n) && Math.abs(n) <= profile.coordinates.maxAbsoluteGltfCoordinateMetres), 'coordinate guard'); bounds.expandByPoint(v); });
      if (reserved.has(node.name)) {
        const p = mesh.position.values, uv = accessors[mesh.primitive.attributes.TEXCOORD_0].values, normal = accessors[mesh.primitive.attributes.NORMAL].values;
        const xs = p.map((v) => v[0]), ys = p.map((v) => v[1]), lo = [Math.min(...xs), Math.min(...ys)], hi = [Math.max(...xs), Math.max(...ys)];
        check([4, 6].includes(p.length) && mesh.indices.length === 6 && hi[0] > lo[0] && hi[1] > lo[1], 'binding rectangle vertex count');
        const corners = new Map(), vertexCorners = [];
        p.forEach((v, i) => {
          const u = (v[0] - lo[0]) / (hi[0] - lo[0]), w = (v[1] - lo[1]) / (hi[1] - lo[1]);
          check(Math.abs(v[2]) < 1e-6 && [u, w].every((x) => Math.min(Math.abs(x), Math.abs(1 - x)) < 1e-6) && equal(uv[i], [u, w]) && equal(normal[i], [0, 0, 1]), 'binding planar local +Z/upright UV');
          const key = `${Math.round(u)},${Math.round(w)}`;
          vertexCorners.push(['0,0', '1,0', '1,1', '0,1'].indexOf(key));
          corners.set(key, points[i].clone().multiplyScalar(2).add(new THREE.Vector3(0, 0.11, 0)).toArray());
        });
        check(corners.size === 4, 'four unique binding corners');
        let area = 0;
        for (let i = 0; i < 6; i += 3) {
          const [a, b, c] = mesh.indices.slice(i, i + 3).map((n) => new THREE.Vector3(...p[n]));
          const cross = b.sub(a).cross(c.sub(a)); check(cross.z > 0, 'binding CCW winding'); area += cross.z / 2;
        }
        check(Math.abs(area - (hi[0] - lo[0]) * (hi[1] - lo[1])) < 1e-6 && new Set(mesh.indices).size === p.length, 'binding rectangle coverage');
        const triangulation = [0, 3].map((start) => mesh.indices.slice(start, start + 3).map((i) => vertexCorners[i]).sort().join('')).sort().join('/');
        check(['012/023', '013/123'].includes(triangulation), 'binding triangles overlap or leave a hole');
        const result = ['0,0', '1,0', '1,1', '0,1'].map((key) => corners.get(key));
        targetWorldCorners[node.name] = result;
        if (binding[node.name]) check(result.every((v, i) => equal(v, binding[node.name].corners[i], profile.coordinates.anchorToleranceMetres * 2)), `binding ${node.name} ${variant} coordinates`);
        const eye = new THREE.Vector3(...profile.coordinates.fixedEyeWorld), centre = new THREE.Vector3(...result[0]);
        const front = new THREE.Vector3(0, 0, 1).transformDirection(world);
        if (target) check(front.dot(eye.sub(centre)) > 0.1, 'target front/near precondition');
      }
      primitiveInstances++; placedTriangles += mesh.triangles;
      if (!e.nocast) { shadowInstances++; shadowTriangles += mesh.triangles; }
    } else check(!reserved.has(node.name) && children.length > 0, 'empty/reserved group');
    nodes.push({ index, name: node.name, parent, meshIndex: node.mesh ?? null, materialIndex, renderOrder, transform: matrix.toArray(), extras: node.extras ?? {} });
    for (const child of children) visit(child, node.name, world, depth + 1, unitChain);
  };
  visit(rootIndex, null, new THREE.Matrix4(), 0, true);
  check(seen.size === doc.nodes.length && meshRefs.size === doc.meshes.length, 'unreachable nodes/meshes');
  check([...reserved].every((name) => names.has(name)), 'missing binding');
  check(placedTriangles <= profile.guards.maxPlacedTriangles && primitiveInstances <= profile.guards.maxPrimitiveInstances, 'geometry guard');
  nodes.sort((a, b) => a.index - b.index);
  return { doc, binary, accessors, meshes, images, snapshot: {
    boundsGltfMetres: { min: bounds.min.toArray(), max: bounds.max.toArray() }, nodes, materials,
    textures: { images, textures }, targetWorldCorners,
    counts: { uniqueGeometryTriangles: meshes.reduce((sum, m) => sum + m.triangles, 0), placedTriangles, shadowTriangles, primitiveInstances, shadowInstances, imagePixels, materialCount: materials.length, textureCount: textures.length },
  } };
}

// Order-insensitive object keys; array order and every value remain exact.
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

export function checkManifest(manifest, inspection, profile, inventory) {
  check(manifest.profileId === profile.profileId && ['baseline', 'proposal'].includes(manifest.variant) && ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'final', 'synthetic'].includes(manifest.stage), 'manifest identity/stage');
  const isHash = (value) => typeof value === 'string' && value.length === 64 && /^[a-f0-9]{64}$/.test(value);
  check(isHash(manifest.glbSha256) && isHash(manifest.artInventorySha256), 'manifest hashes');
  check(manifest.artInventorySha256 === artInventorySha256, 'art inventory hash mismatch');
  for (const [key, value] of Object.entries(inspection.snapshot)) check(canonical(manifest[key]) === canonical(value), `manifest ${key} differs from bytes`);
  if (manifest.stage === 'final') {
    const ids = new Set(inspection.snapshot.nodes.map((n) => n.extras.assetId));
    check(inventory.assets.every((a) => ids.has(a.id)), 'final inventory incomplete');
    check(inspection.snapshot.nodes.every((n) => !n.extras.proxy && !n.name.includes('__proxy')), 'final contains proxy');
  }
}
