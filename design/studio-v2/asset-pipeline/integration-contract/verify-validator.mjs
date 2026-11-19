import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, encodeGlb } from './synthetic-fixture.mjs';
import { validateGlb, profile } from './validate-glb.mjs';

function validate(edit = () => {}, options) {
  const { document, binary } = fixture(options);
  edit(document, binary);
  return validateGlb(encodeGlb(document, binary));
}
function rejects(name, code, edit) {
  test(name, () => {
    const result = validate(edit);
    assert.equal(result.valid, false);
    assert.equal(result.errors[0].code, code, JSON.stringify(result.errors));
  });
}

test('synthetic indexed fixture measures nine placed triangles, not an authored asset', () => {
  const result = validate();
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.metrics.instantiatedTriangles, 9);
  assert.equal(result.metrics.primitiveInstances, 9);
  assert.equal(result.metrics.materials, 8);
  assert.equal(result.metrics.imagePixels, 1);
  assert.equal(result.sha256.length, 64);
  assert.ok(result.deferred.length > 0);
});
test('unindexed triangles and interleaved vertex strides are supported', () => {
  for (const options of [{ indexed: false }, { interleaved: true }]) {
    const result = validate(() => {}, options);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  }
});
test('identity matrix and independent shadow flag are accepted', () => {
  const result = validate((d) => {
    d.nodes[0].matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    d.nodes[8].extras.nocast = true;
  });
  assert.equal(result.valid, true);
});
test('allowed emissive-strength extension preserves finite authored strength', () => {
  const result = validate((d) => {
    d.extensionsUsed = ['KHR_materials_emissive_strength'];
    d.materials[0].extensions = { KHR_materials_emissive_strength: { emissiveStrength: 2.2 } };
  });
  assert.equal(result.valid, true);
});
test('shared primitive geometry is counted once uniquely and for every placement', () => {
  const result = validate((d) => { d.meshes[0].primitives.push(structuredClone(d.meshes[0].primitives[0])); });
  assert.equal(result.valid, true);
  assert.equal(result.metrics.instantiatedTriangles, 10);
  assert.equal(result.metrics.uniqueGeometryTriangles, 9);
});
test('bad magic, version, length, chunk alignment and truncation reject', () => {
  const f = fixture(), good = encodeGlb(f.document, f.binary);
  for (const [offset, value, code] of [[0, 0, 'GLB_HEADER'], [4, 1, 'GLB_VERSION'], [8, 0, 'GLB_LENGTH'], [12, 3, 'CHUNK_BOUNDS'], [16, 0, 'CHUNK_LAYOUT']]) {
    const bytes = Buffer.from(good); bytes.writeUInt32LE(value, offset);
    assert.equal(validateGlb(bytes).errors[0].code, code);
  }
  const short = good.subarray(0, good.length - 1);
  assert.equal(validateGlb(short).valid, false);
});
test('raw file ceiling rejects without parsing', () => {
  assert.equal(validateGlb(Buffer.alloc(profile.limits.fileBytes + 1)).errors[0].code, 'FILE_BUDGET');
});
test('triangle budget rejects valid index data above the placed triangle ceiling', () => {
  const f = fixture(), d = f.document;
  const padding = Buffer.alloc((4 - f.binary.length % 4) % 4), data = Buffer.alloc(60003 * 2);
  for (let i = 0; i < 60003; i++) data.writeUInt16LE(i % 3, i * 2);
  const indexAccessor = d.accessors[d.meshes[0].primitives[0].indices];
  indexAccessor.bufferView = d.bufferViews.length; indexAccessor.count = 60003;
  d.bufferViews.push({ buffer: 0, byteOffset: f.binary.length + padding.length, byteLength: data.length, target: 34963 });
  const binary = Buffer.concat([f.binary, padding, data]); d.buffers[0].byteLength = binary.length;
  assert.equal(validateGlb(encodeGlb(d, binary)).errors[0].code, 'TRIANGLE_BUDGET');
});
test('documented Blender-to-glTF adapter round trips fixed eye and floor once', () => {
  for (const world of [[-0.7, 2.8, 3.4], [0, 0.11, 0], [4.72, 3.81, -0.02]]) {
    const blender = [world[0] / 2, -world[2] / 2, (world[1] - 0.11) / 2];
    const gltf = [blender[0], blender[2], -blender[1]];
    const restored = gltf.map((v, i) => v * profile.adapter.scale[i] + profile.adapter.translation[i]);
    restored.forEach((v, i) => assert.ok(Math.abs(v - world[i]) < 1e-12));
  }
});
rejects('embedded buffer cannot point to network', 'BUFFER', (d) => { d.buffers[0].uri = 'https://example.invalid/data'; });
rejects('declared buffer cannot exceed BIN chunk', 'BUFFER_BOUNDS', (d) => { d.buffers[0].byteLength += 8; });
rejects('bufferView cannot overrun declared buffer', 'BUFFER_VIEW_BOUNDS', (d) => { d.bufferViews[0].byteLength = d.buffers[0].byteLength + 1; });
rejects('accessor count cannot overrun bufferView', 'ACCESSOR_BOUNDS', (d) => { d.accessors[0].count = 999999; });
rejects('accessor offset must be aligned', 'ACCESSOR_BOUNDS', (d) => { d.accessors[0].byteOffset = 1; });
rejects('invalid stride is rejected', 'STRIDE', (d) => { d.bufferViews[0].byteStride = 3; });
rejects('sparse accessor is not silently skipped', 'SPARSE', (d) => { d.accessors[0].sparse = {}; });
rejects('finite JSON bounds cannot conceal binary NaN', 'NONFINITE_ATTRIBUTE', (d, b) => { b.writeFloatLE(NaN, d.bufferViews[0].byteOffset); });
rejects('non-position attribute Infinity also rejects', 'NONFINITE_ATTRIBUTE', (d, b) => { b.writeFloatLE(Infinity, d.bufferViews[1].byteOffset); });
rejects('lying position extrema reject', 'ACCESSOR_EXTREMA', (d) => { d.accessors[0].max[1] = 2.1; });
rejects('indices cannot reference missing vertices', 'INDEX_BOUNDS', (d, b) => { b.writeUInt16LE(3, d.bufferViews[3].byteOffset); });
rejects('nontriangle counts reject', 'TRIANGLES', (d) => { d.accessors[3].count = 2; });
rejects('nontriangle primitive modes reject', 'PRIMITIVE', (d) => { d.meshes[0].primitives[0].mode = 1; });
rejects('morph targets reject', 'PRIMITIVE', (d) => { d.meshes[0].primitives[0].targets = []; });
rejects('missing normal is not accepted', 'REFERENCE', (d) => { delete d.meshes[0].primitives[0].attributes.NORMAL; });
rejects('missing UV0 is not accepted', 'REFERENCE', (d) => { delete d.meshes[0].primitives[0].attributes.TEXCOORD_0; });
rejects('missing and duplicate pilot names reject', 'NODE_SET', (d) => { d.nodes[0].name = d.nodes[1].name; });
rejects('extra wrapper root rejects', 'NODE_SET', (d) => { d.nodes.push({ name: 'root', children: [0] }); });
rejects('multiple scenes reject', 'SCENE_ROOTS', (d) => { d.scenes.push({ nodes: [] }); });
rejects('nested pilot transform rejects', 'NODE_STRUCTURE', (d) => { d.nodes[0].children = [1]; });
rejects('premature scale2 adapter rejects', 'TRANSFORM', (d) => { d.nodes[0].scale = [2, 2, 2]; });
rejects('null transform rejects', 'TRANSFORM', (d) => { d.nodes[0].translation = [null, 0, 0]; });
rejects('conflicting matrix and TRS reject', 'TRANSFORM', (d) => { d.nodes[0].matrix = Array(16).fill(0); d.nodes[0].scale = [1, 1, 1]; });
rejects('camera export rejects', 'NONSTATIC', (d) => { d.cameras = [{}]; });
rejects('animation export rejects', 'NONSTATIC', (d) => { d.animations = [{}]; });
rejects('skin export rejects', 'NONSTATIC', (d) => { d.skins = [{}]; });
for (const extension of ['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_meshopt_compression', 'KHR_texture_basisu', 'KHR_lights_punctual', 'UNKNOWN_optional']) {
  rejects(`decoder/light/unknown declaration rejects: ${extension}`, 'EXTENSION', (d) => { d.extensionsUsed = [extension]; });
}
rejects('undeclared hidden decoder rejects', 'EXTENSION', (d) => { d.meshes[0].primitives[0].extensions = { KHR_draco_mesh_compression: {} }; });
rejects('allowed extension in wrong location rejects', 'EXTENSION_LOCATION', (d) => { d.nodes[0].extensions = { KHR_materials_ior: {} }; });
rejects('used extension needs declaration', 'EXTENSION_DECLARATION', (d) => { d.materials[0].extensions = { KHR_materials_ior: { ior: 1.5 } }; });
rejects('missing required base texture rejects', 'REQUIRED_TEXTURE', (d) => { delete d.materials.find((m) => m.name === 'lib_oak').pbrMetallicRoughness.baseColorTexture; });
rejects('missing required emissive texture rejects', 'REQUIRED_TEXTURE', (d) => { delete d.materials.find((m) => m.name === 'lib_linen_shade').emissiveTexture; });
rejects('material names are adapter keys', 'MATERIAL_SET', (d) => { d.materials[0].name = 'renamed'; });
rejects('wrong named material assignment rejects', 'NODE_MATERIAL', (d) => { d.meshes[0].primitives[0].material = 1; });
rejects('external image rejects', 'IMAGE_FORMAT', (d) => { d.images[0].uri = 'data:image/png;base64,AAAA'; });
rejects('WebP image rejects', 'IMAGE_FORMAT', (d) => { d.images[0].mimeType = 'image/webp'; });
rejects('MIME/signature mismatch rejects', 'IMAGE_SIGNATURE', (d) => { d.images[0].mimeType = 'image/jpeg'; });
rejects('PNG truncation rejects', 'IMAGE_BOUNDS', (d) => { d.bufferViews[d.images[0].bufferView].byteLength -= 1; });
rejects('oversized PNG dimensions reject', 'IMAGE_DIMENSION', (d, b) => { b.writeUInt32BE(4096, d.bufferViews[d.images[0].bufferView].byteOffset + 16); });
rejects('material factor range rejects', 'MATERIAL_FACTOR', (d) => { d.materials[0].pbrMetallicRoughness.roughnessFactor = -1; });
rejects('BLEND material rejects opaque profile', 'MATERIAL_ALPHA', (d) => { d.materials[0].alphaMode = 'BLEND'; });
rejects('opaque bulb exemption rejects even with nocast', 'OCCLUSION_METADATA', (d) => { d.nodes[8].extras.occluder = false; d.nodes[8].extras.nocast = true; });
rejects('transparent metadata cannot exempt opaque material', 'OCCLUSION_METADATA', (d) => { d.nodes[0].extras.transparent = true; });
rejects('wrong axis/baked scale fails placement', 'PLACEMENT', (d, b) => {
  const a = d.accessors[0], view = d.bufferViews[a.bufferView];
  for (let i = 0; i < a.count; i++) b.writeFloatLE(4.8, view.byteOffset + i * 12);
  a.min[0] = 4.8; a.max[0] = 4.8;
});
rejects('unintended metre miniaturisation fails height', 'SCALE', (d, b) => {
  for (let node = 0; node < 3; node++) {
    const a = d.accessors[node * 4], start = d.bufferViews[a.bufferView].byteOffset;
    for (let i = 0; i < a.count; i++) b.writeFloatLE(b.readFloatLE(start + i * 12 + 4) / 2, start + i * 12 + 4);
    a.max[1] /= 2;
  }
});
rejects('primitive budget is separate from triangle budget', 'PRIMITIVE_BUDGET', (d) => {
  const p = d.meshes[0].primitives[0];
  d.meshes[0].primitives = Array.from({ length: 11 }, () => structuredClone(p));
});
test('malformed primitive schema returns a failing report, not a crash', () => {
  const result = validate((d) => { d.meshes[0].primitives[0] = null; });
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].code, 'SCHEMA');
});
