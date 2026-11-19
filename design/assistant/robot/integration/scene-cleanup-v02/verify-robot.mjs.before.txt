import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { bytes, profile, loaderModule, realAsset, input, presentationModule, resources, loadTs, cardsModule } from './test-support.mjs';

const definitions = () => JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)));
const localPose = (asset, name) => profile.bindings.filter((b) => b.moving).forEach((binding) => {
  const node = asset.bindings.get(binding.name), expected = profile.poses[name][binding.name];
  assert.ok(node.position.distanceTo(new THREE.Vector3().fromArray(expected.translation)) < 1e-8, binding.name);
  assert.ok(node.quaternion.angleTo(new THREE.Quaternion().fromArray(expected.rotationXyzw).normalize()) < 1e-6, binding.name);
});
const visible = (presentation) => presentation.cards.filter((card) => card.visible);
function trackAsset(asset) {
  const counts = new Map();
  for (const mesh of asset.occluders) for (const resource of [mesh.geometry, mesh.material]) if (!counts.has(resource)) {
    counts.set(resource, 0); resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
  }
  return counts;
}

test('actual pinned payload imports with 22 bindings, unchanged materials, one placement and private disposal', async () => {
  const a = await realAsset(), b = await realAsset();
  assert.equal(a.bindings.size, 22); assert.equal(a.occluders.length, 21);
  assert.deepEqual(a.root.position.toArray(), [0.8, 2.8, -0.2]);
  assert.deepEqual(a.root.scale.toArray(), [1.6, 1.6, 1.6]);
  assert.equal(a.bindings.get('APA_eye_L').material.emissiveIntensity, 1);
  assert.ok(Math.abs(a.bindings.get('APA_tray_glow').material.emissive.r - 0.05647115195499586) < 1e-12);
  assert.notEqual(a.occluders[0].geometry, b.occluders[0].geometry);
  const counts = trackAsset(a); assert.equal(counts.size, 28);
  a.dispose(); a.dispose(); assert.ok([...counts.values()].every((n) => n === 1)); b.dispose();
});

test('format mutations reject by real guards, including both independent reviewer gaps', () => {
  const validator = loaderModule().validateDefinitions;
  assert.doesNotThrow(() => validator(definitions()));
  const cases = [
    ['skin presence', (j) => { j.nodes[0].skin = 0; }, /unsupported node/],
    ['POSITION bounds', (j) => { const a = j.accessors[j.meshes[0].primitives[0].attributes.POSITION]; delete a.min; delete a.max; }, /POSITION bounds/],
    ['nonfinite bounds', (j) => { j.accessors[j.meshes[0].primitives[0].attributes.POSITION].min[0] = NaN; }, /POSITION bounds/],
    ['binding', (j) => { j.nodes[0].name = 'foreign'; }, /unique binding/],
    ['neutral', (j) => { j.nodes[0].translation = [NaN, 0, 0]; }, /transform/],
    ['external', (j) => { j.buffers[0].uri = 'https://example.test/foreign.bin'; }, /embedded/],
    ['texture', (j) => { j.textures = []; }, /unsupported format/],
    ['material', (j) => { j.materials[5].emissiveFactor[0] = 4; }, /material definitions/],
    ['shadow', (j) => { j.nodes[0].extras.castShadow = true; }, /policy/],
  ];
  for (const [name, mutate, message] of cases) { const j = definitions(); mutate(j); assert.throws(() => validator(j), message, name); }
  // Sensitivity: deleting each intended guard admits its otherwise-valid mutant.
  const skin = definitions(); skin.nodes[0].skin = 0;
  assert.doesNotThrow(() => loaderModule({}, (source) => source.replace('node.skin === undefined', 'true')).validateDefinitions(skin));
  const bounds = definitions(); delete bounds.accessors[bounds.meshes[0].primitives[0].attributes.POSITION].min;
  const noBounds = loaderModule({}, (source) => source.replace(/requireRobot\(position\?\.type[\s\S]*?'POSITION bounds required'\);/, ''));
  assert.doesNotThrow(() => noBounds.validateDefinitions(bounds));
});

test('wrong candidate size/hash and preaborted request fail before decoding', async () => {
  let requests = 0;
  const loader = loaderModule({ fetch: async () => { requests++; return { ok: true, arrayBuffer: async () => new ArrayBuffer(5) }; } });
  const abort = new AbortController(); abort.abort();
  await assert.rejects(loader.loadRobot(abort.signal), /aborted/); assert.equal(requests, 0);
  await assert.rejects(loader.loadRobot(new AbortController().signal), /size differs/);
  const changed = Uint8Array.from(bytes); changed[changed.length - 1] ^= 1;
  await assert.rejects(loaderModule({ fetch: async () => ({ ok: true, arrayBuffer: async () => changed.buffer }) }).loadRobot(new AbortController().signal), /hash differs/);
});

test('decoded binding/material/finite-transform policy is independently enforced', async () => {
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const validate = loaderModule().validateLoaded;
  assert.doesNotThrow(() => validate(gltf));
  const node = gltf.scene.getObjectByName('APA_head');
  node.position.x = NaN; assert.throws(() => validate(gltf), /transform/); node.position.x = profile.bindings.find((b) => b.name === node.name).neutral.translation[0];
  node.material.transparent = true; assert.throws(() => validate(gltf), /material policy/); node.material.transparent = false;
  const eye = gltf.scene.getObjectByName('APA_eye_L'); eye.material.emissiveIntensity = 4;
  assert.throws(() => validate(gltf), /material policy/); eye.material.emissiveIntensity = 1;
  const owner = new resources.RobotResources(); owner.collect(gltf.scene); owner.dispose();
});

test('request owner releases late and shared geometry/material identities exactly once', async () => {
  const owner = new resources.RobotResources();
  const geometry = new THREE.BoxGeometry(), material = new THREE.MeshStandardMaterial();
  let g = 0, m = 0; geometry.addEventListener('dispose', () => g++); material.addEventListener('dispose', () => m++);
  let resolve; const pending = owner.track(new Promise((yes) => { resolve = yes; }));
  owner.collect(material); owner.dispose(); owner.dispose();
  resolve([new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, material)]); await pending;
  owner.collect(geometry); assert.equal(g, 1); assert.equal(m, 1);
});

test('real installed parser failure or abort after allocation releases all private resources', async () => {
  for (const reason of ['abort', 'failure', 'material-policy']) {
    const controller = new AbortController(), counts = new Map();
    class FaultLoader extends GLTFLoader {
      constructor() {
        super();
        this.register(() => ({ name: 'test-after-allocation', afterRoot(gltf) {
          gltf.scene.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            for (const value of [node.geometry, node.material]) if (!counts.has(value)) {
              counts.set(value, 0); value.addEventListener('dispose', () => counts.set(value, counts.get(value) + 1));
            }
          });
          if (reason === 'abort') controller.abort();
          if (reason === 'failure') throw new Error('injected post-allocation failure');
          if (reason === 'material-policy') gltf.scene.getObjectByName('APA_head').material.transparent = true;
          return null;
        } }));
      }
    }
    await assert.rejects(loaderModule({}, undefined, FaultLoader).loadRobot(controller.signal), reason === 'abort' ? /aborted/ : reason === 'failure' ? /injected/ : /material policy/);
    assert.equal(counts.size, 28); assert.ok([...counts.values()].every((n) => n === 1), reason);
  }
});

test('all 0..4 current hits appear/replace/clear together, preserve order, selection identity and emission', async () => {
  const asset = await realAsset(), p = presentationModule.createPresentation(asset);
  const emission = asset.occluders.map((mesh) => mesh.material.emissive.toArray());
  for (let count = 0; count <= 4; count++) {
    p.apply(input({ count }), false);
    assert.equal(visible(p).length, count);
    assert.deepEqual(Array.from(visible(p), (card) => card.userData.key), Array.from({ length: count }, (_, i) => `key-${i}`));
    assert.ok(visible(p).every((card, i, all) => i === 0 || card.position.x > all[i - 1].position.x), 'rank 1 is viewer-left');
  }
  p.apply(input({ count: 4, selected: 'foreign' }), false); p.settle();
  assert.ok(p.cards.every((card) => card.scale.x === 1));
  p.apply(input({ count: 4, selected: 'key-2' }), false); p.advance(0); p.advance(120);
  assert.equal(p.cards[2].scale.x, 1.15); assert.equal(p.cards[2].position.y, 0.004);
  p.apply(input({ count: 1, runId: 'run-b' }), false);
  assert.equal(visible(p).length, 1); assert.equal(visible(p)[0].userData.runId, 'run-b');
  for (const phase of ['requesting', 'cancelled', 'error', 'idle']) {
    p.apply(input({ count: 4 }), false); p.apply(input({ phase }), false); assert.equal(visible(p).length, 0, phase);
  }
  p.apply(input({ count: 4 }), false); p.apply(input({ count: 4, panelOpen: false }), false); assert.equal(visible(p).length, 0);
  assert.deepEqual(asset.occluders.map((mesh) => mesh.material.emissive.toArray()), emission);
  const imported = trackAsset(asset); p.dispose(); p.dispose(); assert.ok([...imported.values()].every((n) => n === 0)); asset.dispose();
});

test('real G1 immutable reducer snapshots drive markers without copying, text retention or stale selection', async () => {
  const g1 = loadTs('../../../../lib/assistant/run-state.ts', {});
  const a = await realAsset(), p = presentationModule.createPresentation(a);
  let run = g1.reduceAssistantRun(g1.INITIAL_RUN, { type: 'submit', runId: 'real:1', question: 'Python' });
  const apply = () => {
    const snapshot = g1.presentAssistantRun(run);
    const before = JSON.stringify(snapshot);
    p.apply({ snapshot, panelOpen: true, presentationEpoch: 1 }, true);
    assert.equal(JSON.stringify(snapshot), before);
    assert.equal(visible(p).length, run.hits.length);
  };
  apply();
  run = g1.reduceAssistantRun(run, { type: 'event', runId: run.runId, event: { type: 'retrieval-start', question: 'Python' } });
  const hits = Array.from({ length: 4 }, (_, i) => ({ sourceId: 'same-source', chunkId: `chunk-${i}`, title: 'Title', heading: 'Heading', text: 'Exact source passage', href: '/work/source', score: 4 - i }));
  run = g1.reduceAssistantRun(run, { type: 'event', runId: run.runId, event: { type: 'retrieval', hits, durationMs: 2 } });
  apply(); assert.equal(run.hits.length, 4);
  run = g1.reduceAssistantRun(run, { type: 'select', runId: run.runId, key: run.hits[1].key }); apply();
  assert.equal(p.cards[1].scale.x, 1.15);
  assert.ok(p.cards.every((card) => Object.keys(card.userData).sort().join(',') === 'identity,key,rank,runId'));
  run = g1.reduceAssistantRun(run, { type: 'submit', runId: 'real:2', question: 'JavaScript' }); apply();
  run = g1.reduceAssistantRun(run, { type: 'select', runId: 'real:1', key: g1.hitKey(hits[1]) }); apply();
  assert.equal(run.selectedKey, null);
  p.dispose(); a.dispose();
});

test('late-load settled adoption, semantic-only transitions, interruption, reduced-motion and dismissal epochs', async () => {
  const asset = await realAsset(), p = presentationModule.createPresentation(asset);
  p.apply(input({ count: 4 }), false); localPose(asset, 'sources'); assert.equal(p.advance(0), false);
  p.apply(input({ count: 4, phase: 'done', revision: 2, epoch: 99 }), false); assert.equal(p.advance(10), false, 'done must not replay even if epoch changed');
  p.apply(input({ count: 0, runId: 'next', epoch: 2 }), false); assert.equal(p.advance(20), true); p.advance(110);
  const before = asset.bindings.get('APA_head').quaternion.clone();
  p.apply(input({ pose: 'no-match', runId: 'next', epoch: 3 }), false);
  assert.ok(asset.bindings.get('APA_head').quaternion.angleTo(before) < 1e-6, 'retarget starts from current transform');
  p.advance(110); p.advance(360); localPose(asset, 'no-match'); assert.equal(p.advance(361), false);
  p.apply(input({ count: 3, epoch: 4 }), false); p.advance(370); p.advance(410);
  p.apply(input({ count: 3, epoch: 4 }), true); localPose(asset, 'sources'); assert.equal(p.advance(420), false);
  p.apply(input({ count: 3, epoch: 4 }), false); assert.equal(p.advance(430), false);
  p.apply(input({ panelOpen: false, epoch: 5 }), false); p.advance(440); p.advance(690); localPose(asset, 'dismissal');
  p.apply(input({ count: 2, epoch: 6 }), false); p.advance(700); p.advance(950); localPose(asset, 'sources'); assert.equal(p.advance(1200), false);
  p.apply(input({ panelOpen: false, epoch: 7 }), false); p.advance(1300); p.advance(1550); p.advance(1800); localPose(asset, 'neutral'); assert.equal(p.advance(1801), false);
  p.dispose(); asset.dispose();
});

test('waiting-zero and validated no-match are distinct; suspension settles newest data without replay', async () => {
  const a = await realAsset(), p = presentationModule.createPresentation(a);
  p.apply(input({ phase: 'retrieved', count: 0 }), false); localPose(a, 'attention');
  p.apply(input({ phase: 'answered', pose: 'no-match', epoch: 2 }), false); p.advance(0); p.advance(80);
  p.settle(); localPose(a, 'no-match'); assert.equal(p.advance(1000), false);
  p.apply(input({ count: 4, epoch: 3 }), false, true); localPose(a, 'sources'); assert.equal(visible(p).length, 4); assert.equal(p.advance(2000), false);
  p.dispose(); a.dispose();
});

test('marker clearing negative probe is sensitive to removing the immediate visibility clear', async () => {
  const mutant = loadTs('./presentation.ts', { three: THREE, './runtime-profile.json': profile, './cards': cardsModule }, {},
    (source) => source.replace('card.visible = Boolean(hit);', 'if (hit) card.visible = true;'));
  const a = await realAsset(), p = mutant.createPresentation(a);
  p.apply(input({ count: 4 }), false); assert.equal(visible(p).length, 4, 'positive control still works');
  p.apply(input({ phase: 'error' }), false);
  assert.equal(visible(p).length, 4, 'removing the clear breaks the required zero-marker observation');
  p.dispose(); a.dispose();
});

test('selected card geometry remains inside actual tray radius through allowed lift/scale', async () => {
  const a = await realAsset(), p = presentationModule.createPresentation(a);
  p.apply(input({ count: 4 }), true);
  let maxRadius = 0;
  for (const card of p.cards) {
    card.scale.setScalar(cardsModule.CARD_LAYOUT.selectedScale); card.position.y += cardsModule.CARD_LAYOUT.lift; card.updateMatrix();
    const attribute = card.geometry.getAttribute('position');
    for (let i = 0; i < attribute.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(attribute, i).applyMatrix4(card.matrix);
      maxRadius = Math.max(maxRadius, Math.hypot(v.x, v.z));
    }
  }
  assert.ok(maxRadius < 0.11755819618701935, `actual tray radius: ${maxRadius}`);
  p.dispose(); a.dispose();
});

test('composed picker honors visible head/body only, foreground depth, clipping and no robot expansion', () => {
  const contract = loadTs('../../../../lib/studio-contract.ts', {});
  const { pickScene } = loadTs('../picking.ts', { three: THREE, '@/lib/studio-contract': contract });
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20);
  const scene = new THREE.Scene();
  const head = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial());
  head.position.z = -4; const parent = new THREE.Group(); parent.add(head); scene.add(parent);
  const project = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial()); project.position.z = -5; scene.add(project);
  const model = { scene, targets: [{ id: 'dissertation', surface: project }], occluders: [], assistant: { activationSurfaces: [head], occluders: [head] } };
  const pick = (x = 250, touch = false) => pickScene(model, camera, x, 250, 500, 500, touch);
  assert.equal(pick()?.kind, 'assistant');
  assert.equal(pick(270, true)?.kind, 'project', 'no robot expansion');
  parent.visible = false; assert.equal(pick()?.kind, 'project'); parent.visible = true;
  head.layers.set(1); assert.equal(pick()?.kind, 'project'); head.layers.set(0);
  head.material.visible = false; assert.equal(pick()?.kind, 'project'); head.material.visible = true;
  head.position.z = -0.05; assert.equal(pick()?.kind, 'project'); head.position.z = -25; assert.equal(pick()?.kind, 'project'); head.position.z = -4;
  const foreground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial()); foreground.position.z = -3; scene.add(foreground); model.occluders.push(foreground);
  assert.equal(pick(), null); foreground.visible = false; assert.equal(pick()?.kind, 'assistant');
  // Tray/card is opaque but never an activation target, including when centered.
  model.assistant.activationSurfaces = []; assert.equal(pick(), null);
  [head, project, foreground].forEach((mesh) => { mesh.geometry.dispose(); mesh.material.dispose(); });
});

test('robot/card foreground at original finger blocks expanded project ray; sensitivity removes that protection', () => {
  const contract = loadTs('../../../../lib/studio-contract.ts', {});
  const modules = { three: THREE, '@/lib/studio-contract': contract };
  const { pickScene } = loadTs('../picking.ts', modules);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20), scene = new THREE.Scene();
  const project = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial()); project.position.z = -5; scene.add(project);
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.1), new THREE.MeshBasicMaterial());
  // Pixel270's ray, while the project edge ray remains completely clear.
  mark.position.set(20 / 250 * 3 * Math.tan(Math.PI / 6), 0, -3); scene.add(mark);
  const model = { scene, targets: [{ id: 'dissertation', surface: project }], occluders: [], assistant: { activationSurfaces: [], occluders: [mark] } };
  const pick = (picker) => picker(model, camera, 270, 250, 500, 500, true);
  assert.equal(pick(pickScene), null);
  mark.visible = false; assert.equal(pick(pickScene)?.projectId, 'dissertation'); mark.visible = true;
  const mutant = loadTs('../picking.ts', modules, {}, (source) => source.replace('...(model.assistant?.occluders ?? [])', '...[]'));
  assert.equal(pick(mutant.pickScene)?.projectId, 'dissertation', 'removing registered blockers breaks the negative case');
  const originalRayMutant = loadTs('../picking.ts', modules, {}, (source) => source.replace('if (inputBlocker) {', 'if (false) {'));
  assert.equal(pick(originalRayMutant.pickScene)?.projectId, 'dissertation', 'sample ray alone is insufficient');
  [project, mark].forEach((mesh) => { mesh.geometry.dispose(); mesh.material.dispose(); });
});
