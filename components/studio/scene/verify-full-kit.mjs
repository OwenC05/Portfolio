// Actual installed GLTFLoader + exact GLB, with CPU-only decoded-image stubs.
// These checks do not claim browser PNG/JPEG decoding or WebGL/GPU reclamation.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import ts from 'typescript';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import * as core from '../../../design/studio-v2/asset-pipeline/full-kit/technical/profile-core.mjs';
import { profile, inventory, candidateManifest, validateFullKit } from '../../../design/studio-v2/asset-pipeline/full-kit/technical/validate-full-kit.mjs';
import { fixture as makeFixture, encodeGlb } from '../../../design/studio-v2/asset-pipeline/full-kit/technical/synthetic-fixture.mjs';
const candidate = makeFixture().bytes;
const state = loadTs('./full-kit-types.ts', {});
const resourcesModule = loadTs('./resources.ts', {three: THREE, 'three/addons/geometries/RoundedBoxGeometry.js': {RoundedBoxGeometry}});
const gradient = {addColorStop(){}};
const context = new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient}, {get:(target,key)=>target[key]??(()=>{})});
const texturesModule = loadTs('./textures.ts', {three:THREE}, {document:{createElement:()=>({getContext:()=>context})}});
const ids = {PROJECT_IDS:['dissertation','copilot','typeforge']};
const binder = loadTs('./bind-full-kit.ts', {three:THREE, '@/lib/studio-contract':ids, './textures':texturesModule, './full-kit-types':state});
const picker = loadTs('./picking.ts', {three:THREE, '@/lib/studio-contract':ids});
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
        if (plugin.name !== 'STUDIO_PRIVATE_FULL_KIT') return plugin;
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
  const pilotModule = loadTs('./load-full-kit.ts', {
    three: trackedThree, 'three/addons/loaders/GLTFLoader.js': { GLTFLoader: Loader },
    '@/design/studio-v2/asset-pipeline/full-kit/full-kit-profile-v1.json': profile,
    '@/design/studio-v2/asset-pipeline/full-kit/asset-inventory.json': inventory,
    '@/design/studio-v2/asset-pipeline/full-kit/technical/fixtures/baseline.manifest.json': options.manifest ?? candidateManifest(options.bytes ?? candidate, options.variant ?? 'baseline', 'synthetic'),
    '@/design/studio-v2/asset-pipeline/full-kit/technical/profile-core.mjs': core,
    './full-kit-types': state,
  }, {
    AbortController, DOMException, Blob, crypto: webcrypto,
    URL: options.htmlImage ? {
      createObjectURL() { const url = `blob:studio-test-${imageUrls.created.length}`; imageUrls.created.push(url); return url; },
      revokeObjectURL(url) { imageUrls.revoked.push(url); },
    } : URL,
    Image: class {
      width = 1; height = 1; onload = null; onerror = null;
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
      assert.equal(url, '/studio/full-kit-uninstalled-synthetic-baseline.glb');
      assert.ok(init.signal instanceof AbortSignal);
      if (options.fetchGate) await options.fetchGate.promise;
      return { ok: !options.httpFailure, status: options.httpFailure ? 503 : 200, arrayBuffer: async () => Uint8Array.from(options.bytes ?? candidate).buffer };
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
    load: pilotModule.loadFullKit, images, owned, disposed, released, imageUrls, htmlImages, decodeStarted: decodeStarted.promise,
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

test('synthetic bytes: actual installed loader, linked identities, COLOR_0 and one placement', async () => {
  const h = fixture();
  try {
    const asset = await h.load(new AbortController().signal);
    const a = asset.root.getObjectByName('arch_shell__linked0'), b = asset.root.getObjectByName('arch_shell__linked1');
    assert.equal(a.geometry, b.geometry);
    assert.equal(a.material, b.material);
    assert.ok(a.material.vertexColors);
    assert.equal(a.geometry.getAttribute('color').itemSize, 3);
    assert.deepEqual(asset.root.scale.toArray(), [2, 2, 2]);
    assert.deepEqual(asset.root.position.toArray(), [0, 0.11, 0]);
    assert.notEqual(a.material.map, a.material.emissiveMap);
    assert.equal(a.material.map.image, a.material.emissiveMap.image);
    assert.equal(asset.root.getObjectByName('contact_decals__test').renderOrder, 1);
    assert.equal(asset.root.getObjectByName('contact_decals__test').material.depthWrite, false);
    asset.dispose(); asset.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

for (const variant of ['baseline', 'proposal']) test(`${variant}: binder exact targets/borders, truthful canvases, blocker coverage and replacement isolation`, async () => {
  const input = makeFixture({ variant });
  const h = fixture({ bytes: input.bytes, manifest: input.manifest });
  const runtime = new resourcesModule.SceneResources();
  try {
    const asset = await h.load(new AbortController().signal);
    const dusk = asset.root.getObjectByName('rt_window_dusk');
    const placeholder = asset.root.getObjectByName('target_dissertation').material;
    const result = binder.bindFullKit(runtime, asset.root);
    assert.equal(result.targets.length, 3);
    assert.equal(new Set(result.targets.map((t) => t.border)).size, 3);
    assert.equal(runtime.textures.size, 4);
    assert.ok(result.targets.every((t) => t.surface.material.map?.isCanvasTexture && !t.surface.material.toneMapped));
    assert.ok(result.occluders.includes(dusk));
    assert.ok(result.occluders.includes(asset.root.getObjectByName('display_studio')));
    assert.ok(result.occluders.includes(asset.root.getObjectByName('arch_shell__linked0')), 'nocast opaque stays blocker');
    assert.ok(result.occluders.includes(asset.root.getObjectByName('arch_shell__linked1')));
    assert.equal(result.occluders.length, 4);
    assert.throws(() => binder.bindFullKit(runtime, asset.root), /unbound validated/);
    const expected = core.expectedBindings(inventory, variant);
    for (const [name, spec] of Object.entries(expected)) {
      const mesh = asset.root.getObjectByName(name), p = mesh.geometry.getAttribute('position');
      const points = Array.from({ length: p.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld));
      assert.ok(spec.corners.every((corner) => points.some((p) => p.distanceTo(new THREE.Vector3(...corner)) < 0.0002)), name);
    }
    const releasedRuntime = new Set();
    for (const resource of [...runtime.materials, ...runtime.textures]) resource.addEventListener('dispose', () => releasedRuntime.add(resource));
    asset.dispose();
    assert.equal(h.disposed.get(placeholder), 1, 'replaced placeholder retained by imported owner');
    assert.equal(releasedRuntime.size, 0, 'import disposal never rescans runtime replacements');
    h.assertReleased();
    runtime.dispose();
    assert.equal(releasedRuntime.size, 11);
  } finally { runtime.dispose(); h.restore(); }
});

for (const colorType of [5126, 5121, 5123]) test(`COLOR_0 real allocation path ${colorType}`, async () => {
  const f = makeFixture({ colorType }), h = fixture({ bytes: f.bytes, manifest: f.manifest });
  try {
    const asset = await h.load(new AbortController().signal);
    const c = asset.root.getObjectByName('arch_shell__linked0').geometry.getAttribute('color');
    assert.equal(c.itemSize, 3); assert.equal(c.normalized, colorType !== 5126);
    assert.ok(Math.abs(c.getX(0) - 0.2) < 1e-6 && c.getZ(0) === 1);
    asset.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

function negative(label, mutate, pattern) {
  test(`validator rejects ${label} even with recomputed candidate hash`, () => {
    const f = makeFixture(); mutate(f.doc, f.binary);
    const bytes = encodeGlb(f.doc, f.binary);
    const manifest = { ...f.manifest, glbSha256: createHash('sha256').update(bytes).digest('hex') };
    const report = validateFullKit(bytes, manifest);
    assert.equal(report.valid, false); assert.match(report.errors.join(), pattern);
  });
}
const linked = (doc) => doc.nodes.find((n) => n.name === 'arch_shell__linked0');
const colorAccessor = (doc) => doc.accessors[doc.meshes[linked(doc).mesh].primitives[0].attributes.COLOR_0];
negative('COLOR_0 alpha VEC4', (d) => { colorAccessor(d).type = 'VEC4'; }, /accessor bounds|extrema|COLOR_0/);
negative('COLOR_0 forbidden material', (d) => { d.materials[1].name = 'lib_oak'; }, /COLOR_0/);
negative('COLOR_0 outside unit range', (d, b) => { const a = colorAccessor(d); b.writeFloatLE(1.1, d.bufferViews[a.bufferView].byteOffset); delete a.min; delete a.max; }, /COLOR_0/);
negative('COLOR_0 NaN', (d, b) => { b.writeFloatLE(NaN, d.bufferViews[colorAccessor(d).bufferView].byteOffset); }, /nonfinite binary/);
negative('COLOR_0 unnormalized bytes', (d) => { const a = colorAccessor(d); a.componentType = 5121; delete a.min; delete a.max; }, /COLOR_0/);
negative('unknown attribute', (d) => { d.meshes[0].primitives[0].attributes.TANGENT = 0; }, /attributes/);
negative('cycle', (d) => { d.nodes[0].children.push(0); }, /cycle/);
negative('duplicate node', (d) => { d.nodes[2].name = d.nodes[1].name; }, /unique exact/);
negative('missing reserved target', (d) => { d.nodes[1].name = 'target_faces__fake'; }, /role\/material|missing binding/);
negative('matrix and TRS', (d) => { d.nodes[1].translation = [0, 0, 0]; }, /XOR/);
negative('double root transform', (d) => { d.nodes[0].scale = [2, 2, 2]; }, /identity group/);
negative('reflection', (d) => { delete d.nodes[1].matrix; d.nodes[1].scale = [-1, 1, 1]; }, /positive TRS/);
negative('shear', (d) => { d.nodes[1].matrix[4] = 0.1; }, /shear/);
negative('arbitrary opaque omission', (d) => { linked(d).extras.occluder = false; }, /opaque blocker omission/);
negative('interactive loophole', (d) => { linked(d).extras.interactive = true; }, /unsupported node data/);
negative('generic target-role exception', (d) => { linked(d).extras.role = 'target'; linked(d).extras.occluder = false; }, /role\/material/);
negative('transparent caster', (d) => { d.nodes.find((n) => n.extras?.transparent).extras.nocast = false; }, /blend order/);
negative('external URI', (d) => { d.images[0].uri = 'https://invalid/image.png'; }, /embedded image/);
negative('forged declared bounds', (d) => { d.accessors[0].min[0] -= 1; }, /extrema/);
negative('reversed target UV', (d, b) => { const a = d.accessors[d.meshes[0].primitives[0].attributes.TEXCOORD_0], v = d.bufferViews[a.bufferView]; for (let i = 0; i < 4; i++) b.writeFloatLE(1 - b.readFloatLE(v.byteOffset + i * 8 + 4), v.byteOffset + i * 8 + 4); }, /upright UV/);
negative('target front winding', (d, b) => { const a = d.accessors[d.meshes[0].primitives[0].indices], v = d.bufferViews[a.bufferView]; b.writeUInt16LE(2, v.byteOffset + 2); b.writeUInt16LE(1, v.byteOffset + 4); }, /winding/);
negative('overlapping binding triangles with equal summed area', (d, b) => { const a = d.accessors[d.meshes[0].primitives[0].indices], v = d.bufferViews[a.bufferView]; b.writeUInt16LE(1, v.byteOffset + 8); }, /overlap/);
negative('rounded or displaced exact binding', (d) => { d.nodes[1].matrix[12] += 0.01; }, /coordinates/);

test('manifest is evidence to compare, never proof: forged counts and hashes rejected', () => {
  const f = makeFixture();
  for (const key of ['counts', 'boundsGltfMetres', 'nodes', 'materials', 'textures', 'targetWorldCorners']) {
    const m = structuredClone(f.manifest); m[key] = {};
    assert.match(validateFullKit(f.bytes, m).errors.join(), new RegExp(`manifest ${key}`));
  }
  assert.equal(validateFullKit(f.bytes, { ...f.manifest, glbSha256: '0'.repeat(64) }).valid, false);
  assert.equal(validateFullKit(f.bytes, { ...f.manifest, artInventorySha256: '0'.repeat(64) }).valid, false);
});

test('actual picker retains linked leaf and ancestor visibility plus nocast blocking', async () => {
  const h = fixture(), runtime = new resourcesModule.SceneResources();
  try {
    const asset = await h.load(new AbortController().signal), binding = binder.bindFullKit(runtime, asset.root);
    const scene = new THREE.Scene(); scene.add(asset.root);
    const model = { scene, ...binding }, camera = new THREE.PerspectiveCamera(58, 1440 / 900, 0.1, 100);
    camera.position.set(-0.7, 2.8, 3.4);
    const target = binding.targets[0].surface, centre = target.getWorldPosition(new THREE.Vector3());
    camera.lookAt(centre); camera.updateMatrixWorld(true);
    const pick = () => picker.pickProject(model, camera, 720, 450, 1440, 900, true);
    assert.equal(pick(), 'dissertation');
    const blocker = asset.root.getObjectByName('arch_shell__linked0');
    const parent = blocker.parent;
    blocker.position.copy(parent.worldToLocal(centre.clone().lerp(camera.position, 0.2))); blocker.scale.setScalar(20);
    assert.equal(pick(), null);
    parent.visible = false; assert.equal(pick(), 'dissertation');
    parent.visible = true; blocker.visible = false; assert.equal(pick(), 'dissertation');
    target.parent.visible = false; assert.equal(pick(), null);
    asset.dispose(); runtime.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

test('bound target opaque back blocks expanded finger; near, behind-camera and nonfinite input reject', async () => {
  const f = makeFixture(); f.doc.materials[0].doubleSided = true;
  const bytes = encodeGlb(f.doc, f.binary), h = fixture({ bytes });
  const runtime = new resourcesModule.SceneResources();
  try {
    const asset = await h.load(new AbortController().signal), bindings = binder.bindFullKit(runtime, asset.root);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, 0.1, 40);
    const [rear, front] = bindings.targets.map((t) => t.surface);
    // Controlled hostile placement AFTER binding, using the imported quad resources.
    scene.add(rear, front); rear.position.set(0, 0, -5); rear.quaternion.identity(); rear.scale.set(0.2 / 0.94, 0.2 / 0.53, 1);
    front.position.set(0.08 * Math.tan(Math.PI / 6) * 3, 0, -3); front.rotation.set(0, Math.PI, 0); front.scale.set(0.04 / 0.4, 0.2 / 0.67, 1);
    const model = { scene, targets: bindings.targets.slice(0, 2), occluders: [] };
    const pick = (x = 250, touch = false) => picker.pickProject(model, camera, x, 250, 500, 500, touch);
    assert.equal(front.material.side, THREE.DoubleSide, 'binder preserves authored rendered-back identity');
    assert.equal(pick(), 'dissertation');
    assert.equal(pick(270), null);
    front.visible = false; assert.equal(pick(270, true), 'dissertation');
    front.visible = true; assert.equal(pick(270, true), null, 'opaque back under finger blocks rear target');
    front.visible = false;
    for (const z of [5, -0.05]) { rear.position.z = z; assert.equal(pick(270, true), null); }
    rear.position.z = -0.09; rear.rotation.y = Math.PI / 4;
    assert.equal(pick(250), null, 'centre probe is clipped before near plane');
    assert.equal(pick(250, true), null, 'near-crossing quad cannot grow touch region');
    assert.equal(pick(NaN, true), null);
    scene.clear(); asset.dispose(); runtime.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

test('imported-geometry instanced blocker obeys instance depth and ancestor visibility in existing picker', async () => {
  const h = fixture(), runtime = new resourcesModule.SceneResources();
  try {
    const asset = await h.load(new AbortController().signal), bindings = binder.bindFullKit(runtime, asset.root);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, 0.1, 40), rear = bindings.targets[0].surface;
    scene.add(rear); rear.position.set(0, 0, -5); rear.quaternion.identity(); rear.scale.set(0.2 / 0.94, 0.2 / 0.53, 1);
    const imported = asset.root.getObjectByName('arch_shell__linked0');
    const blocker = new THREE.InstancedMesh(imported.geometry, imported.material, 1), parent = new THREE.Group();
    blocker.setMatrixAt(0, new THREE.Matrix4().compose(new THREE.Vector3(0, 0, -3), new THREE.Quaternion(), new THREE.Vector3(10, 10, 10)));
    parent.add(blocker); scene.add(parent);
    const model = {scene, targets: [bindings.targets[0]], occluders: [blocker]};
    const pick = () => picker.pickProject(model, camera, 250, 250, 500, 500, true);
    assert.equal(pick(), null); parent.visible = false; assert.equal(pick(), 'dissertation');
    parent.visible = true; blocker.visible = false; assert.equal(pick(), 'dissertation');
    blocker.visible = true; blocker.setMatrixAt(0, new THREE.Matrix4().makeTranslation(0, 0, -0.05)); blocker.computeBoundingSphere();
    assert.equal(pick(), 'dissertation', 'near-clipped instance does not block');
    blocker.dispose(); scene.clear(); asset.dispose(); runtime.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

test('binder rejects postparse arbitrary opaque omission before allocating replacements', async () => {
  const h = fixture(), runtime = new resourcesModule.SceneResources();
  try {
    const asset = await h.load(new AbortController().signal);
    asset.root.getObjectByName('arch_shell__linked0').userData.occluder = false;
    assert.throws(() => binder.bindFullKit(runtime, asset.root), /loaded metadata/);
    assert.equal(runtime.materials.size, 0); asset.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

test('null slot from swallowed decode failure rejects; late sibling drains after pending decode', async () => {
  const gate = deferred(), h = fixture({ decodeGate: gate, decodeFailure: true });
  try {
    const pending = h.load(new AbortController().signal);
    await h.decodeStarted; await settle(); gate.resolve();
    await assert.rejects(pending, /required decoded slot/); await settle(); h.assertReleased();
  } finally { gate.resolve(); await settle(); h.restore(); }
});

test('late abort during decode closes all allocations once after last sharing texture', async () => {
  const gate = deferred(), h = fixture({ decodeGate: gate }), abort = new AbortController();
  try {
    const pending = h.load(abort.signal); await h.decodeStarted; abort.abort(); gate.resolve();
    await assert.rejects(pending, { name: 'AbortError' }); await settle(); h.assertReleased();
  } finally { gate.resolve(); await settle(); h.restore(); }
});

for (const option of ['accessorFailure', 'materialFailure', 'throwDispose']) test(`${option}: independent allocation cleanup`, async () => {
  const h = fixture({ [option]: true });
  try {
    if (option === 'throwDispose') { const asset = await h.load(new AbortController().signal); asset.dispose(); }
    else await assert.rejects(h.load(new AbortController().signal), /Injected/);
    await settle(); h.assertReleased();
  } finally { h.restore(); }
});

test('late postparse abort never returns an attachable root', async () => {
  const abort = new AbortController(), h = fixture({ afterRoot: () => { abort.abort(); } });
  try { await assert.rejects(h.load(abort.signal), { name: 'AbortError' }); await settle(); h.assertReleased(); }
  finally { h.restore(); }
});

test('repeated load has independent resources, no global cache', async () => {
  const h = fixture();
  try {
    const first = await h.load(new AbortController().signal), second = await h.load(new AbortController().signal);
    const a = first.root.getObjectByName('arch_shell__linked0'), b = second.root.getObjectByName('arch_shell__linked0');
    assert.notEqual(a.geometry, b.geometry); assert.notEqual(a.material, b.material); assert.notEqual(a.material.map.image, b.material.map.image);
    first.dispose(); assert.equal(b.material.map.image.closes, 0); second.dispose(); h.assertReleased();
  } finally { h.restore(); }
});

for (const mode of ['success', 'failure', 'abort']) test(`HTMLImage fallback ${mode}: URLs and handlers cleaned`, async () => {
  const gate = mode === 'abort' ? deferred() : undefined;
  const h = fixture({ htmlImage: true, htmlFailure: mode === 'failure', decodeGate: gate });
  const abort = new AbortController();
  try {
    const pending = h.load(abort.signal);
    if (mode === 'abort') { await h.decodeStarted; abort.abort(); gate.resolve(); }
    if (mode === 'success') { const asset = await pending; asset.dispose(); }
    else await assert.rejects(pending, mode === 'abort' ? { name: 'AbortError' } : /required decoded slot/);
    await settle(); assert.ok(h.imageUrls.created.length); assert.deepEqual([...h.imageUrls.created].sort(), [...h.imageUrls.revoked].sort());
    assert.ok(h.htmlImages.every((image) => image.onload === null && image.onerror === null)); h.assertReleased();
  } finally { gate?.resolve(); await settle(); h.restore(); }
});

// Optional exact author candidate; decoding remains a labelled CPU boundary stub.
if (process.env.FULL_KIT_CANDIDATE) test('exact author candidate bytes and real installed loader allocation path', async () => {
  const bytes = readFileSync(process.env.FULL_KIT_CANDIDATE), variant = process.env.FULL_KIT_VARIANT ?? 'baseline';
  const manifest = candidateManifest(bytes, variant, 'M1');
  assert.equal(validateFullKit(bytes, manifest).valid, true);
  const h = fixture({ bytes, manifest });
  try {
    const asset = await h.load(new AbortController().signal), runtime = new resourcesModule.SceneResources();
    const result = binder.bindFullKit(runtime, asset.root);
    assert.equal(result.targets.length, 3);
    assert.equal(result.occluders.length, manifest.nodes.filter((n) => n.extras.occluder).length);
    asset.dispose(); h.assertReleased(); runtime.dispose();
  } finally { h.restore(); }
});

