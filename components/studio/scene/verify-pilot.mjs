// Actual installed GLTFLoader + exact GLB, with CPU-only decoded-image stubs.
// These checks do not claim browser PNG/JPEG decoding or WebGL/GPU reclamation.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const profile = JSON.parse(readFileSync(new URL('../../../design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json', import.meta.url)));
const candidate = readFileSync(new URL('../../../public/studio/pilot-right-limit-v03.glb', import.meta.url));
function loadTs(file, modules, globals = {}) {
  const exports = {};
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  vm.runInNewContext(outputText, { exports, require(name) { assert.ok(name in modules, name); return modules[name]; }, ...globals }, { filename: file });
  return exports;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

function fixture(options = {}) {
  const images = [];
  const decodeStarted = deferred();
  const owned = { geometry: new Set(), material: new Set(), texture: new Set() };
  const disposed = new Map();
  const released = [];
  let calls = 0;
  let parser;
  const hooks = [];
  const imageUrls = { created: [], revoked: [] };
  const htmlImages = [];
  const observe = (kind, resource) => {
    if (owned[kind].has(resource)) return;
    owned[kind].add(resource);
    resource.addEventListener('dispose', () => { disposed.set(resource, (disposed.get(resource) ?? 0) + 1); released.push(resource); });
  };
  class Loader extends GLTFLoader {
    register(callback) {
      return super.register((value) => {
        const plugin = callback(value);
        if (plugin.name !== 'STUDIO_PRIVATE_PILOT') return plugin;
        parser = value;
        const definitions = plugin.beforeRoot;
        plugin.beforeRoot = async () => { options.mutateDefinitions?.(parser.json); await definitions(); };
        const material = parser.loadMaterial.bind(parser);
        parser.loadMaterial = (index) => material(index).then((result) => { observe('material', result); return result; });
        const images = parser.loadImageSource.bind(parser);
        parser.loadImageSource = (index, loader) => images(index, loader).then((result) => { observe('texture', result); return result; });
        const geometries = parser.loadGeometries.bind(parser);
        parser.loadGeometries = (items) => geometries(items).then((results) => { results.forEach((result) => observe('geometry', result)); return results; });
        const dependency = parser.getDependency.bind(parser);
        parser.getDependency = (type, index) => {
          if (type === 'accessor' && options.accessorFailure && index === 4) return Promise.reject(new Error('Injected accessor failure'));
          return dependency(type, index).then((result) => {
            if (type === 'material' && options.materialFailure && index === 1) throw new Error('Injected failure after material allocation');
            return result;
          });
        };
        if (options.afterRoot) plugin.afterRoot = options.afterRoot;
        return plugin;
      });
    }
  }
  const trackedThree = {
    ...THREE,
    BufferGeometry: class extends THREE.BufferGeometry {
      constructor(...args) { super(...args); observe('geometry', this); }
      static [Symbol.hasInstance](value) { return value instanceof THREE.BufferGeometry; }
    },
    Texture: class extends THREE.Texture {
      constructor(...args) { super(...args); observe('texture', this); }
      static [Symbol.hasInstance](value) { return value instanceof THREE.Texture; }
    },
  };
  // Allocation-level observation catches objects that never reach a parsed scene.
  // The registered parser creates these geometries/textures through its private
  // Three facade; the installed GLTFLoader and accessors remain real.
  for (const [Type, kind] of [[THREE.BufferGeometry, 'geometry'], [THREE.Material, 'material'], [THREE.Texture, 'texture']]) {
    const original = Type.prototype.dispose;
    Type.prototype.dispose = function () { observe(kind, this); original.call(this); if (options.throwDispose && kind === 'geometry') throw new Error('Injected cleanup failure'); };
    hooks.push(() => { Type.prototype.dispose = original; });
  }
  const pilotModule = loadTs('./load-pilot.ts', {
    three: trackedThree, 'three/addons/loaders/GLTFLoader.js': { GLTFLoader: Loader },
    '@/design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json': profile,
  }, {
    AbortController, DOMException, Blob,
    URL: options.htmlImage ? {
      createObjectURL() { const url = `blob:studio-test-${imageUrls.created.length}`; imageUrls.created.push(url); return url; },
      revokeObjectURL(url) { imageUrls.revoked.push(url); },
    } : URL,
    Image: class {
      width = 256; height = 256; onload = null; onerror = null;
      constructor() { htmlImages.push(this); }
      set src(value) {
        if (!value) return;
        const index = htmlImages.indexOf(this);
        decodeStarted.resolve();
        Promise.resolve().then(async () => {
          if (options.decodeGate && index === 0) await options.decodeGate.promise;
          if (options.htmlFailure && index === 1) this.onerror?.(new Error('HTML image decode failed'));
          else this.onload?.();
        });
      }
    },
    fetch: async (url, init) => {
      calls++;
      assert.equal(url, '/studio/pilot-right-limit-v03.glb');
      assert.ok(init.signal instanceof AbortSignal);
      if (options.fetchGate) await options.fetchGate.promise;
      return { ok: !options.httpFailure, status: options.httpFailure ? 503 : 200, arrayBuffer: async () => Uint8Array.from(candidate).buffer };
    },
    createImageBitmap: options.htmlImage ? undefined : async (blob) => {
      const bytes = new DataView(await blob.arrayBuffer());
      const index = images.length;
      const image = options.sharedBitmap && images[0] ? images[0] : { width: bytes.getUint32(16), height: bytes.getUint32(20), closes: 0, close() { this.closes++; released.push(this); } };
      images.push(image);
      decodeStarted.resolve();
      if (options.decodeGate && index === 0) await options.decodeGate.promise;
      if (options.decodeFailure && index === 1) throw new Error('Injected image decode failure');
      return image;
    },
  });
  return {
    load: pilotModule.loadStudioPilot, images, owned, disposed, released, imageUrls, htmlImages, decodeStarted: decodeStarted.promise,
    get calls() { return calls; }, get parser() { return parser; },
    restore() { hooks.forEach((restore) => restore()); },
    assertReleased() {
      for (const set of Object.values(owned)) for (const value of set) assert.equal(disposed.get(value), 1, `Unique ${value.type ?? 'resource'} release`);
      for (const image of images) if (!(options.decodeFailure && image === images[1])) assert.equal(image.closes, 1, 'Each successfully decoded bitmap closes once');
      for (const image of images) if (image.closes) {
        const consumers = [...owned.texture].filter((texture) => texture.image === image);
        const lastTexture = Math.max(-1, ...consumers.map((texture) => released.indexOf(texture)));
        assert.ok(released.indexOf(image) > lastTexture, 'Bitmap closes after its last texture consumer releases');
      }
    },
  };
}

test('exact approved public bytes parse, retain authored values, place once, and integrate nine live opaque blockers', async () => {
  assert.equal(createHash('sha256').update(candidate).digest('hex'), '2b9a4182c3024485680c1e066c8a22ef0dc0f541acca4bd958486bced2c4063e');
  const h = fixture();
  try {
    const asset = await h.load(new AbortController().signal);
    assert.equal(h.calls, 1);
    assert.deepEqual(asset.root.position.toArray(), [0, 0.11, 0]);
    assert.deepEqual(asset.root.scale.toArray(), [2, 2, 2]);
    assert.deepEqual(asset.root.quaternion.toArray(), [0, 0, 0, 1]);
    const meshes = [];
    asset.root.traverse((object) => { if (object.isMesh) meshes.push(object); });
    assert.equal(meshes.length, 9);
    assert.deepEqual(meshes.map((mesh) => mesh.name).sort(), Object.keys(profile.nodes).sort());
    const bulb = meshes.find((mesh) => mesh.name === 'pilot_lamp_bulb');
    assert.equal(bulb.castShadow, false);
    assert.equal(bulb.material.emissiveIntensity, 6);
    assert.equal(bulb.material.side, THREE.DoubleSide);
    assert.ok(meshes.every((mesh) => mesh.receiveShadow && mesh.userData.occluder));
    const brass = meshes.filter((mesh) => mesh.material.name === 'lib_brass');
    assert.equal(brass[0].material, brass[1].material, 'Authored material sharing is preserved');
    assert.equal(new Set(meshes.map((mesh) => `${mesh.geometry.uuid}:${mesh.material.uuid}`)).size, 9, 'Actual import cannot enter a repeated geometry/material batch');
    const point = new THREE.Vector3().fromBufferAttribute(bulb.geometry.getAttribute('position'), 0);
    const expected = point.clone().multiplyScalar(2).add(new THREE.Vector3(0, 0.11, 0));
    assert.ok(point.applyMatrix4(bulb.matrixWorld).distanceTo(expected) < 1e-10);
    const resourceModule = loadTs('./resources.ts', { three: THREE, 'three/addons/geometries/RoundedBoxGeometry.js': { RoundedBoxGeometry } });
    const gradient = { addColorStop() {} };
    const context = new Proxy({ createLinearGradient: () => gradient, createRadialGradient: () => gradient }, { get: (target, key) => target[key] ?? (() => {}) });
    const textures = loadTs('./textures.ts', { three: THREE }, { document: { createElement: () => ({ getContext: () => context }) } });
    const builder = loadTs('./build-studio.ts', { three: THREE, './resources': resourceModule, './textures': textures });
    const resources = new resourceModule.SceneResources();
    const model = builder.createStudio(resources, asset.root);
    assert.ok(meshes.every((mesh) => model.occluders.includes(mesh) && mesh.parent), 'All nine, including bulb, remain attached blockers after real batching');
    assert.equal(asset.root.parent, model.scene);
    assert.ok(meshes.every((mesh) => !resources.geometries.has(mesh.geometry) && !resources.materials.has(mesh.material)), 'Ownership remains separate');
    const imported = new Set([...h.owned.geometry, ...h.owned.material, ...h.owned.texture]);
    resources.dispose();
    assert.ok([...imported].every((resource) => !h.disposed.has(resource)), 'Procedural disposal never releases the pilot resources');
    asset.dispose(); asset.dispose();
    h.assertReleased();
  } finally { h.restore(); }
});

for (const mode of ['metadata', 'map', 'oakMap', 'emissiveMap', 'emptyImage', 'transform', 'http', 'decode', 'accessor', 'material']) {
  test(`loader rejects ${mode} failure and releases partial imported resources`, async () => {
    const h = fixture({
      httpFailure: mode === 'http', decodeFailure: mode === 'decode', accessorFailure: mode === 'accessor', materialFailure: mode === 'material',
      mutateDefinitions: mode === 'metadata' ? (json) => { json.nodes[0].extras.occluder = false; } : undefined,
      afterRoot: ['map', 'oakMap', 'emissiveMap', 'emptyImage', 'transform'].includes(mode) ? async (gltf) => {
        if (mode === 'transform') gltf.scene.children[0].scale.setScalar(2);
        else gltf.scene.traverse((object) => {
          if (!object.isMesh) return;
          if (mode === 'oakMap' && object.material.name === 'lib_oak') object.material.map = null;
          else if (mode === 'emptyImage' && object.material.map) object.material.map.image.width = 0;
          else if (object.material.name === 'lib_linen_shade') object.material[mode] = null;
        });
      } : undefined,
    });
    try {
      const expected = { metadata: /occlusion metadata/, oakMap: /decode missing/, emptyImage: /missing or invalid decoded image/, map: /decode missing/, emissiveMap: /decode missing/, transform: /invalid loaded node/, http: /HTTP 503/, decode: /decode missing/, accessor: /Injected accessor failure/, material: /Injected failure after material allocation/ };
      await assert.rejects(h.load(new AbortController().signal), expected[mode]);
      await settle();
      if (['map', 'oakMap', 'emissiveMap', 'emptyImage', 'transform', 'decode', 'accessor', 'material'].includes(mode)) {
        assert.equal(h.owned.geometry.size, 9, 'All nine geometry allocations are observed even when the scene never resolves');
        assert.ok(h.owned.texture.size >= 3, 'Texture allocation precedes possible decode failure');
      }
      h.assertReleased();
    } finally { h.restore(); }
  });
}

test('abort during non-cancellable image decode waits for late owned bitmaps then releases them without returning an asset', async () => {
  const gate = deferred(); const h = fixture({ decodeGate: gate }); const abort = new AbortController();
  try {
    const pending = h.load(abort.signal);
    await h.decodeStarted;
    assert.ok(h.images.length > 0, 'Decode started before abort');
    abort.abort(); gate.resolve();
    await assert.rejects(pending, { name: 'AbortError' });
    await settle(); h.assertReleased();
  } finally { h.restore(); }
});

test('abort while fetch is delayed never starts parsing or decoding when fetch eventually resolves', async () => {
  const gate = deferred(); const h = fixture({ fetchGate: gate }); const abort = new AbortController();
  try {
    const pending = h.load(abort.signal);
    abort.abort(); gate.resolve();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(h.images.length, 0); assert.equal(h.parser, undefined);
    h.assertReleased();
  } finally { h.restore(); }
});

test('throwing geometry cleanup still releases shared materials, every texture and decoded bitmap once', async () => {
  const h = fixture({ throwDispose: true });
  try {
    const asset = await h.load(new AbortController().signal);
    assert.doesNotThrow(() => asset.dispose()); asset.dispose();
    h.assertReleased();
  } finally { h.restore(); }
});

test('partial parse rejection disposes every allocation only after an already-started sibling decode settles', async () => {
  const gate = deferred(); const h = fixture({ materialFailure: true, decodeGate: gate });
  try {
    const outcome = h.load(new AbortController().signal).then(() => { throw new Error('Unexpected success'); }, (error) => error);
    await h.decodeStarted;
    const error = await outcome;
    assert.match(error.message, /Injected failure after material allocation/);
    assert.equal(h.owned.geometry.size, 9);
    assert.ok(h.owned.material.size > 0 && h.owned.texture.size >= 3);
    assert.equal(h.images[0].closes, 0, 'In-flight decoder has not yielded its bitmap to the owner');
    assert.equal(h.disposed.size, 0, 'Pending consumers keep the shared resource owner alive until quiescence');
    gate.resolve(); await settle();
    h.assertReleased();
  } finally { gate.resolve(); await settle(); h.restore(); }
});

test('all texture slots, shared textures and shared decoded bitmap identities release once; borrowed image stays open', async () => {
  const borrowed = { width: 32, height: 32, closes: 0, close() { this.closes++; } };
  const h = fixture({ sharedBitmap: true, afterRoot: async (gltf) => {
    const oak = gltf.scene.children.find((mesh) => mesh.material.name === 'lib_oak').material;
    oak.normalMap = oak.map.clone();
    oak.roughnessMap = oak.map;
    oak.aoMap = oak.normalMap;
    oak.specularColorMap = new THREE.Texture(borrowed);
  } });
  try {
    const asset = await h.load(new AbortController().signal);
    assert.equal(new Set(h.images).size, 1, 'Three texture decodes deliberately share one owned bitmap in this fixture');
    const oak = asset.root.children[0].children.find((mesh) => mesh.material.name === 'lib_oak').material;
    const extra = [oak.normalMap, oak.specularColorMap];
    asset.dispose(); asset.dispose();
    extra.forEach((texture) => assert.equal(h.disposed.get(texture), 1, 'Additional material slots are owned'));
    assert.equal(h.images[0].closes, 1);
    assert.equal(borrowed.closes, 0, 'Only this decoder acquired owned bitmaps; image references alone never grant ownership');
    h.assertReleased();
  } finally { h.restore(); }
});

test('separate pilot requests never borrow another mount material, geometry, texture or decoded image', async () => {
  const h = fixture();
  try {
    const first = await h.load(new AbortController().signal);
    const firstGeometry = new Set(h.owned.geometry);
    const firstMaterial = new Set(h.owned.material);
    const firstTexture = new Set(h.owned.texture);
    const second = await h.load(new AbortController().signal);
    assert.equal(h.calls, 2);
    const secondMeshes = second.root.children[0].children;
    assert.ok(secondMeshes.every((mesh) => !firstGeometry.has(mesh.geometry) && !firstMaterial.has(mesh.material)));
    secondMeshes.forEach((mesh) => Object.values(mesh.material).forEach((value) => { if (value?.isTexture) assert.ok(!firstTexture.has(value)); }));
    assert.equal(new Set(h.images).size, 6);
    first.dispose();
    assert.ok(h.images.slice(0, 3).every((image) => image.closes === 1));
    assert.ok(h.images.slice(3).every((image) => image.closes === 0));
    second.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

for (const mode of ['success', 'failure', 'abort']) {
  test(`HTMLImage fallback ${mode} releases each private object URL and removes image handlers`, async () => {
    const gate = mode === 'abort' ? deferred() : undefined;
    const h = fixture({ htmlImage: true, htmlFailure: mode === 'failure', decodeGate: gate });
    const abort = new AbortController();
    try {
      const pending = h.load(abort.signal);
      if (mode === 'abort') { await h.decodeStarted; abort.abort(); gate.resolve(); }
      if (mode === 'success') { const asset = await pending; asset.dispose(); }
      else await assert.rejects(pending, mode === 'abort' ? { name: 'AbortError' } : /decode missing/);
      await settle();
      assert.ok(h.imageUrls.created.length > 0, 'Fallback decoder path was exercised');
      assert.deepEqual([...h.imageUrls.created].sort(), [...h.imageUrls.revoked].sort());
      assert.ok(h.htmlImages.every((image) => image.onload === null && image.onerror === null));
      h.assertReleased();
    } finally { gate?.resolve(); await settle(); h.restore(); }
  });
}
