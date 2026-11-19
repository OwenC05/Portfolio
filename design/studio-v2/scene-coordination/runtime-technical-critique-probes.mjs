// Independent runtime review: installed r187 parser and exact public GLB;
// decoder and DOM events are modeled, never browser/GPU evidence.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const root = new URL('../../../', import.meta.url);
const path = (file) => new URL(file, root);
const sha = (file) => createHash('sha256').update(readFileSync(path(file))).digest('hex').toUpperCase();
const candidate = readFileSync(path('public/studio/pilot-right-limit-v03.glb'));
const profile = JSON.parse(readFileSync(path('design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json'), 'utf8'));
const inputs = ['components/studio/scene/load-pilot.ts', 'components/studio/scene/controller.ts', 'components/studio/scene/build-studio.ts', 'components/studio/scene/resources.ts', 'components/studio/scene/types.ts', 'components/studio/scene/textures.ts', 'components/studio/scene/view-config.ts', 'public/studio/pilot-right-limit-v03.glb', 'design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json', 'node_modules/three/examples/jsm/loaders/GLTFLoader.js'];
const result = { atUtc: new Date().toISOString(), node: process.version, three: THREE.REVISION, task: 'task_73fa4e160358', dispatch: 'ctx_e14be999996e', sourceHashes: inputs.map((file) => ({ file, sha256: sha(file) })), cases: [] };
assert.equal(sha('public/studio/pilot-right-limit-v03.glb'), '2B9A4182C3024485680C1E066C8A22EF0DC0F541ACCA4BD958486BCED2C4063E');
function module(file, modules, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path(file), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(id) { assert.ok(id in modules, id); return modules[id]; }, ...globals }, { filename: file });
  return exports;
}
function deferred() { let resolve; const promise = new Promise((yes) => { resolve = yes; }); return { promise, resolve }; }
const settle = () => new Promise((resolve) => setImmediate(resolve));
async function bounded(promise) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Probe did not settle within 3 seconds')), 3000); })]); }
  finally { clearTimeout(timer); }
}

async function scenario(name, options, run) {
  const allocated = new Map(), releases = new Map(), events = [], bitmaps = [], htmlImages = [], urls = new Set(), activeAbortListeners = new Set();
  const started = deferred(), gate = deferred();
  const abort = new AbortController();
  const add = abort.signal.addEventListener.bind(abort.signal), remove = abort.signal.removeEventListener.bind(abort.signal);
  abort.signal.addEventListener = (type, handler, opts) => { if (type === 'abort') activeAbortListeners.add(handler); add(type, handler, opts); };
  abort.signal.removeEventListener = (type, handler, opts) => { if (type === 'abort') activeAbortListeners.delete(handler); remove(type, handler, opts); };
  let decodeCount = 0, fetches = 0;
  function observe(value, kind) {
    if (!value || allocated.has(value)) return value;
    allocated.set(value, kind);
    value.addEventListener('dispose', () => { releases.set(value, (releases.get(value) ?? 0) + 1); events.push({ kind: 'release', value }); });
    return value;
  }
  const originalClone = THREE.Material.prototype.clone;
  THREE.Material.prototype.clone = function () { return observe(originalClone.call(this), 'material'); };
  class Loader extends GLTFLoader {
    register(callback) {
      return super.register((parser) => {
        const plugin = callback(parser);
        if (plugin.name !== 'STUDIO_PRIVATE_PILOT') return plugin;
        const material = parser.loadMaterial.bind(parser);
        parser.loadMaterial = (index) => material(index).then((value) => observe(value, 'material'));
        if (options.rejectSibling) {
          const dep = parser.getDependency.bind(parser);
          parser.getDependency = (type, index) => dep(type, index).then((value) => {
            if (type === 'material' && index === 1) throw new Error('Independent sibling material failure');
            return value;
          });
        }
        return plugin;
      });
    }
  }
  const facade = {
    ...THREE,
    BufferGeometry: class extends THREE.BufferGeometry {
      constructor(...args) { super(...args); observe(this, 'geometry'); }
      static [Symbol.hasInstance](value) { return value instanceof THREE.BufferGeometry; }
    },
    Texture: class extends THREE.Texture {
      constructor(...args) { super(...args); observe(this, 'texture'); }
      static [Symbol.hasInstance](value) { return value instanceof THREE.Texture; }
    },
  };
  const globals = {
    AbortController, DOMException, Blob,
    URL: { createObjectURL() { const url = `blob:review-${urls.size}-${htmlImages.length}`; urls.add(url); return url; }, revokeObjectURL(url) { assert.ok(urls.delete(url)); } },
    Image: class {
      constructor() { this.width = 1024; this.height = 1024; this.onload = null; this.onerror = null; htmlImages.push(this); }
      set src(value) {
        this.source = value;
        if (!value) return;
        started.resolve();
        if (!options.gated) queueMicrotask(() => options.imageError ? this.onerror?.() : this.onload?.());
      }
      get src() { return this.source; }
    },
    fetch: async (url, init) => { fetches++; assert.equal(url, '/studio/pilot-right-limit-v03.glb'); assert.equal(init.signal, abort.signal); return { ok: true, arrayBuffer: async () => Uint8Array.from(candidate).buffer }; },
  };
  if (!options.html) globals.createImageBitmap = async (blob, decodeOptions) => {
    assert.equal(decodeOptions.premultiplyAlpha, 'none'); assert.equal(decodeOptions.colorSpaceConversion, 'none');
    const index = decodeCount++;
    const bytes = new DataView(await blob.arrayBuffer());
    const bitmap = options.shared && bitmaps[0] ? bitmaps[0] : { width: options.invalidDimensions ? 0 : bytes.getUint32(16), height: bytes.getUint32(20), closes: 0, close() { this.closes++; events.push({ kind: 'close', value: this }); } };
    bitmaps.push(bitmap); started.resolve();
    if (options.gated && index === 0) await gate.promise;
    return bitmap;
  };
  const { loadStudioPilot } = module('components/studio/scene/load-pilot.ts', { three: facade, 'three/addons/loaders/GLTFLoader.js': { GLTFLoader: Loader }, '@/design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json': profile }, globals);
  function assertReleased() {
    assert.ok(allocated.size > 0);
    for (const [value, kind] of allocated) assert.equal(releases.get(value), 1, `${kind} must emit exactly one dispose event`);
    const lastTexture = Math.max(-1, ...events.map((event, index) => event.kind === 'release' && allocated.get(event.value) === 'texture' ? index : -1));
    for (const bitmap of new Set(bitmaps)) { assert.equal(bitmap.closes, 1); assert.ok(events.findIndex((e) => e.kind === 'close' && e.value === bitmap) > lastTexture); }
    assert.equal(urls.size, 0); assert.equal(activeAbortListeners.size, 0);
    for (const img of htmlImages) { assert.equal(img.onload, null); assert.equal(img.onerror, null); }
  }
  try {
    const details = await run({ load: () => loadStudioPilot(abort.signal), abort, started: started.promise, gate, allocated, releases, events, bitmaps, htmlImages, assertReleased });
    result.cases.push({ name, fetches, allocations: Object.fromEntries(['geometry', 'material', 'texture'].map((kind) => [kind, [...allocated.values()].filter((value) => value === kind).length])), disposeEvents: [...releases.values()].reduce((a, b) => a + b, 0), uniqueBitmaps: new Set(bitmaps).size, bitmapCloses: [...new Set(bitmaps)].map((image) => image.closes), htmlImages: htmlImages.length, remainingUrls: urls.size, remainingAbortListeners: activeAbortListeners.size, ...details, passed: true });
  } finally { gate.resolve(); THREE.Material.prototype.clone = originalClone; }
}

await scenario('real GLB placement, imported blocker ownership and shared bitmap disposal', { shared: true }, async (h) => {
  const asset = await bounded(h.load());
  const meshes = []; asset.root.traverse((object) => { if (object.isMesh) meshes.push(object); });
  assert.equal(meshes.length, 9);
  let triangles = 0;
  for (const mesh of meshes) {
    const positions = mesh.geometry.getAttribute('position'); triangles += (mesh.geometry.index?.count ?? positions.count) / 3;
    const vertex = new THREE.Vector3().fromBufferAttribute(positions, 0);
    assert.ok(vertex.clone().applyMatrix4(mesh.matrixWorld).distanceTo(vertex.clone().multiplyScalar(2).add(new THREE.Vector3(0, 0.11, 0))) < 1e-10);
    for (const slot of ['map', 'emissiveMap']) if (mesh.material[slot]) { assert.equal(mesh.material[slot].flipY, false); assert.equal(mesh.material[slot].colorSpace, THREE.SRGBColorSpace); }
  }
  assert.equal(triangles, 5528);
  const bulb = meshes.find((mesh) => mesh.name === 'pilot_lamp_bulb');
  assert.equal(bulb.castShadow, false); assert.equal(bulb.material.side, THREE.DoubleSide); assert.equal(bulb.material.emissiveIntensity, 6);
  const resourceModule = module('components/studio/scene/resources.ts', { three: THREE, 'three/addons/geometries/RoundedBoxGeometry.js': { RoundedBoxGeometry } });
  const gradient = { addColorStop() {} }, context = new Proxy({ createLinearGradient: () => gradient, createRadialGradient: () => gradient }, { get: (target, key) => target[key] ?? (() => {}) });
  const textures = module('components/studio/scene/textures.ts', { three: THREE }, { document: { createElement: () => ({ getContext: () => context }) } });
  const builder = module('components/studio/scene/build-studio.ts', { three: THREE, './resources': resourceModule, './textures': textures });
  const resources = new resourceModule.SceneResources();
  const model = builder.createStudio(resources, asset.root);
  assert.equal(model.scene.getObjectByName('Music corner floor lamp'), undefined); assert.equal(model.scene.getObjectByName('Closed studio door'), undefined);
  assert.ok(meshes.every((mesh) => mesh.parent && model.occluders.includes(mesh)));
  assert.equal(model.scene.children.filter((object) => object === asset.root).length, 1);
  for (const mesh of meshes) { assert.ok(!resources.geometries.has(mesh.geometry)); assert.ok(!resources.materials.has(mesh.material)); }
  resources.dispose(); assert.equal(h.releases.size, 0, 'Procedural disposal must leave imported allocations intact');
  asset.dispose(); asset.dispose(); h.assertReleased();
  return { importedMeshes: meshes.length, triangles, importedBlockers: meshes.filter((mesh) => model.occluders.includes(mesh)).length, noncastingBulbBlocks: model.occluders.includes(bulb), singleAdapterVerified: true };
});

await scenario('parse rejection with shared bitmap and still-pending sibling decode', { rejectSibling: true, gated: true, shared: true }, async (h) => {
  const outcome = h.load().then(() => assert.fail('Expected parse rejection'), (error) => error);
  await bounded(h.started); const error = await bounded(outcome);
  assert.match(error.message, /Independent sibling material failure/);
  assert.equal(h.releases.size, 0, 'No premature release while a decoder remains outstanding');
  assert.ok(h.bitmaps.every((bitmap) => bitmap.closes === 0));
  h.gate.resolve(); await settle(); h.assertReleased();
  return { error: error.message, noPrematureDisposal: true };
});

await scenario('abort after bitmap decoding starts closes late results', { gated: true }, async (h) => {
  const outcome = h.load(); await bounded(h.started); h.abort.abort();
  assert.equal(h.releases.size, 0); h.gate.resolve();
  await assert.rejects(bounded(outcome), { name: 'AbortError' }); await settle(); h.assertReleased();
  return { rejectedAs: 'AbortError' };
});

await scenario('decoded zero width rejects loaded materials and releases allocations', { invalidDimensions: true }, async (h) => {
  await assert.rejects(bounded(h.load()), /missing or invalid decoded image/); await settle(); h.assertReleased();
  return { rejectedAs: 'missing or invalid decoded image' };
});

for (const mode of ['success', 'error', 'abort']) await scenario(`HTMLImage fallback ${mode} cleans URLs and listeners`, { html: true, imageError: mode === 'error', gated: mode === 'abort' }, async (h) => {
  const outcome = h.load();
  if (mode === 'abort') { await bounded(h.started); h.abort.abort(); }
  if (mode === 'success') { const asset = await bounded(outcome); asset.dispose(); asset.dispose(); }
  else await assert.rejects(bounded(outcome), mode === 'abort' ? { name: 'AbortError' } : /decode missing/);
  await settle(); h.assertReleased();
  if (mode === 'abort') assert.ok(h.htmlImages.every((image) => image.src === ''));
  return { completion: mode };
});

for (const entry of result.sourceHashes) assert.equal(sha(entry.file), entry.sha256, `Source changed during probe: ${entry.file}`);
result.sourceStable = true;
console.log(JSON.stringify(result, null, 2));
