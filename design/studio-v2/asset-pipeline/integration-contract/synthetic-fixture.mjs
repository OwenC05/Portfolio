// Tiny in-memory mechanism fixture, NOT an authored asset or visual reference.
import { profile } from './validate-glb.mjs';

export function fixture({ indexed = true, interleaved = false } = {}) {
  const binaryParts = [], bufferViews = [], accessors = [];
  let length = 0;
  function append(bytes, extra = {}) {
    const padding = (4 - length % 4) % 4;
    binaryParts.push(Buffer.alloc(padding), bytes);
    length += padding;
    bufferViews.push({ buffer: 0, byteOffset: length, byteLength: bytes.length, ...extra });
    length += bytes.length;
    return bufferViews.length - 1;
  }
  function attribute(values, type, extra = {}) {
    const bytes = Buffer.alloc(values.length * 4);
    values.forEach((value, index) => bytes.writeFloatLE(value, index * 4));
    accessors.push({ bufferView: append(bytes), componentType: 5126, count: 3, type, ...extra });
    return accessors.length - 1;
  }
  const materialNames = [...new Set(Object.values(profile.nodes))];
  const materials = materialNames.map((name) => ({ name, pbrMetallicRoughness: { metallicFactor: 0, roughnessFactor: 0.5 } }));
  for (const material of materials) {
    if (['lib_oak', 'lib_linen_shade'].includes(material.name)) material.pbrMetallicRoughness.baseColorTexture = { index: 0 };
    if (material.name === 'lib_linen_shade') { material.emissiveTexture = { index: 0 }; material.emissiveFactor = [1, 1, 1]; }
  }
  const nodes = [], meshes = [];
  for (const [name, material] of Object.entries(profile.nodes)) {
    const door = name.startsWith('pilot_door_'), y = door ? 2 : 1.85, z = door ? 1.5 : 0;
    const positions = [2.4, 0, z, 2.4, y, z, 2.4, y / 2, z + 0.1];
    const extrema = { min: [2.4, 0, z], max: [2.4, y, z + 0.1] };
    let POSITION, NORMAL, TEXCOORD_0;
    if (interleaved) {
      const data = Buffer.alloc(3 * 32);
      for (let i = 0; i < 3; i++) {
        const row = [...positions.slice(i * 3, i * 3 + 3), 1, 0, 0, i / 2, i / 2];
        row.forEach((value, col) => data.writeFloatLE(value, i * 32 + col * 4));
      }
      const bufferView = append(data, { byteStride: 32, target: 34962 });
      POSITION = accessors.length;
      accessors.push({ bufferView, componentType: 5126, count: 3, type: 'VEC3', ...extrema });
      NORMAL = accessors.length;
      accessors.push({ bufferView, byteOffset: 12, componentType: 5126, count: 3, type: 'VEC3' });
      TEXCOORD_0 = accessors.length;
      accessors.push({ bufferView, byteOffset: 24, componentType: 5126, count: 3, type: 'VEC2' });
    } else {
      POSITION = attribute(positions, 'VEC3', extrema);
      NORMAL = attribute([1, 0, 0, 1, 0, 0, 1, 0, 0], 'VEC3');
      TEXCOORD_0 = attribute([0, 0, 1, 1, 0, 1], 'VEC2');
    }
    const primitive = { attributes: { POSITION, NORMAL, TEXCOORD_0 }, material: materialNames.indexOf(material) };
    if (indexed) {
      primitive.indices = accessors.length;
      accessors.push({ bufferView: append(Buffer.from([0, 0, 1, 0, 2, 0]), { target: 34963 }), componentType: 5123, count: 3, type: 'SCALAR' });
    }
    nodes.push({ name, mesh: meshes.length, extras: { pilot: 'right-limit', occluder: true } });
    meshes.push({ primitives: [primitive] });
  }
  const imageView = append(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=', 'base64'));
  return {
    document: { asset: { version: '2.0', generator: 'SYNTHETIC VALIDATOR TEST ONLY' }, scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }],
      nodes, meshes, materials, buffers: [{ byteLength: length }], bufferViews, accessors,
      images: [{ name: 'synthetic-one-pixel', bufferView: imageView, mimeType: 'image/png' }], textures: [{ source: 0 }] },
    binary: Buffer.concat(binaryParts),
  };
}

export function encodeGlb(document, binary) {
  const json = Buffer.from(JSON.stringify(document));
  const jsonPadded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
  const binPadded = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + binPadded.length, 8);
  jh.writeUInt32LE(jsonPadded.length); jh.writeUInt32LE(0x4e4f534a, 4);
  bh.writeUInt32LE(binPadded.length); bh.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jh, jsonPadded, bh, binPadded]);
}
