// Independent CPU review: production TS + installed Three; no WebGL/browser.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as robotTest from '../../../../../components/studio/scene/robot/test-support.mjs';

// Reuse only the established host, never its test cases or assertions as our
// oracle. This fixture mocks renderer/DOM/events, not the production controller,
// parser, presentation, resource owner, geometry, picker or G1 reducer.
const fixtureUrl = new URL('../../../../../components/studio/scene/verify-controller.mjs', import.meta.url);
const fixture = readFileSync(fixtureUrl, 'utf8');
const fixturePrefix = fixture.slice(fixture.indexOf('function loadTs('), fixture.indexOf('for (const width of [320, 390])'));
assert.ok(fixturePrefix.length > 10000 && fixturePrefix.length < 20000, 'bounded host extraction');
const hostExports = {};
vm.runInNewContext(fixturePrefix.replaceAll('import.meta.url', JSON.stringify(fixtureUrl.href))
  + '\nObject.assign(hostExports, { harness, tap, picking, loadTs });', {
  assert, readFileSync, existsSync, vm, ts, THREE, RoundedBoxGeometry, robotTest,
  URL, EventTarget, Event, AbortController, hostExports,
});
const { harness, picking } = hostExports;
const state = (assistant, extra = {}) => ({ selectedProjectId: null, reducedMotion: false, assistant, ...extra });
const g1 = robotTest.loadTs('../../../../lib/assistant/run-state.ts', {});
const identities = (h) => h.model.assistant?.occluders.filter((o) => o.visible && o.userData.identity).map((o) => o.userData.identity) ?? [];

async function attached(assistant = robotTest.input({ count: 4 })) {
  const h = harness({ assistant });
  const controller = h.mount(); await h.flush();
  const asset = await robotTest.realAsset();
  h.robotLoads[0].resolve(asset); await h.flush();
  return { h, controller, asset };
}
function watch(resources) {
  const counts = new Map();
  for (const resource of resources) if (!counts.has(resource)) {
    counts.set(resource, 0);
    resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
  }
  return counts;
}

test('independent real guard controls reject skin zero and missing POSITION min/max', async () => {
  const definition = () => JSON.parse(robotTest.bytes.subarray(20, 20 + robotTest.bytes.readUInt32LE(12)));
  const guard = robotTest.loaderModule().validateDefinitions;
  assert.doesNotThrow(() => guard(definition()));
  const skin = definition(); skin.nodes.find((node) => node.mesh !== undefined).skin = 0;
  assert.throws(() => guard(skin), /unsupported node/);
  for (const keys of [['min'], ['max'], ['min', 'max']]) {
    const json = definition();
    const position = json.accessors[json.meshes[1].primitives[0].attributes.POSITION];
    for (const key of keys) delete position[key];
    assert.throws(() => guard(json), /POSITION bounds required/);
  }
  const valid = await robotTest.realAsset();
  assert.equal(valid.bindings.size, 22); assert.equal(valid.occluders.length, 21);
  valid.dispose();
});

test('abort during a real asynchronous parser continuation releases all 28 imported identities', async () => {
  let continueParse, allocationReached;
  const gate = new Promise((resolve) => { continueParse = resolve; });
  const reached = new Promise((resolve) => { allocationReached = resolve; });
  let counts;
  class DelayedLoader extends GLTFLoader {
    constructor() {
      super();
      this.register(() => ({ name: 'independent-delayed-after-root', async afterRoot(gltf) {
        const resources = [];
        gltf.scene.traverse((node) => { if (node.isMesh) resources.push(node.geometry, node.material); });
        counts = watch(resources); allocationReached(); await gate;
      } }));
    }
  }
  const abort = new AbortController();
  const pending = robotTest.loaderModule({}, undefined, DelayedLoader).loadRobot(abort.signal);
  await reached; abort.abort(); continueParse();
  await assert.rejects(pending, /aborted/);
  assert.equal(counts.size, 28); assert.deepEqual([...counts.values()], Array(28).fill(1));
});

for (const late of ['resolve', 'reject']) test(`remove/readd fences old ${late} after replacement is already ready`, async () => {
  const h = harness({ assistant: robotTest.input({ count: 4, runId: 'old' }) });
  const controller = h.mount(); await h.flush();
  const oldLoad = h.robotLoads[0];
  controller.update(state(undefined));
  const replacement = robotTest.input({ count: 1, runId: 'replacement' });
  controller.update(state(replacement)); await h.flush();
  assert.equal(oldLoad.signal.aborted, true); assert.equal(h.robotLoads.length, 2);
  const currentAsset = await robotTest.realAsset();
  h.robotLoads[1].resolve(currentAsset); await h.flush();
  const root = currentAsset.root, statuses = [...h.robotStatuses], renders = h.renderers[0].renderCount;
  if (late === 'resolve') {
    const staleAsset = await robotTest.realAsset(), counts = watch(staleAsset.occluders.flatMap((mesh) => [mesh.geometry, mesh.material]));
    oldLoad.resolve(staleAsset); await h.flush();
    assert.ok([...counts.values()].every((n) => n === 1)); assert.equal(staleAsset.root.parent, null);
  } else { oldLoad.reject(new Error('obsolete parser rejection')); await h.flush(); }
  assert.equal(h.model.scene.getObjectByName('StudioAssistantPlacement'), root);
  assert.deepEqual([...identities(h)], ['["replacement","key-0"]']);
  assert.deepEqual([...h.robotStatuses], statuses); assert.equal(h.renderers[0].renderCount, renders);
  controller.dispose(); h.assertReleased();
});

test('real G1 replacement/cancel/failure/close erase card identity synchronously before a pending frame', async () => {
  let run = g1.INITIAL_RUN;
  let sequence = 0;
  function retrieval() {
    run = g1.reduceAssistantRun(run, { type: 'submit', runId: `independent:${++sequence}`, question: 'Python' });
    run = g1.reduceAssistantRun(run, { type: 'event', runId: run.runId, event: { type: 'retrieval-start', question: 'Python' } });
    run = g1.reduceAssistantRun(run, { type: 'event', runId: run.runId, event: { type: 'retrieval', durationMs: 1,
      hits: Array.from({ length: 4 }, (_, i) => ({ sourceId: 's', chunkId: `c${i}`, title: 'T', heading: 'H', text: 'Exact passage', href: '/work/source', score: 4 - i })) } });
    run = g1.reduceAssistantRun(run, { type: 'select', runId: run.runId, key: run.hits[2].key });
  }
  const input = (panelOpen = true) => ({ snapshot: g1.presentAssistantRun(run), panelOpen, presentationEpoch: sequence });
  retrieval(); const { h, controller } = await attached(input());
  for (const mode of ['submit', 'cancel', 'failure', 'close']) {
    retrieval(); controller.update(state(input())); await h.flush(sequence * 100);
    const cards = h.model.assistant.occluders.filter((o) => o.name.startsWith('AssistantSourceMark'));
    assert.equal(cards.length, 4);
    assert.deepEqual(Array.from(cards, (card) => card.userData.key), Array.from(run.hits, (hit) => hit.key));
    const snapshot = input(); const frozenBefore = JSON.stringify(snapshot);
    if (mode === 'submit') run = g1.reduceAssistantRun(run, { type: 'submit', runId: `new:${sequence}`, question: 'new' });
    if (mode === 'cancel') run = g1.reduceAssistantRun(run, { type: 'cancel', runId: run.runId });
    if (mode === 'failure') run = g1.reduceAssistantRun(run, { type: 'fail', runId: run.runId, failure: 'network', notice: 'failed' });
    controller.update(state(input(mode !== 'close')));
    assert.ok(cards.every((card) => !card.visible && Object.keys(card.userData).join(',') === 'identity' && card.userData.identity === null), mode);
    assert.equal(JSON.stringify(snapshot), frozenBefore, 'old immutable snapshot was not mutated');
  }
  controller.dispose(); h.assertReleased();
});

test('all imported opaque meshes and four real card meshes are registered as direct and expanded blockers', async () => {
  const { h, controller, asset } = await attached();
  const registered = h.model.assistant.occluders;
  assert.equal(registered.length, 25); assert.equal(new Set(registered).size, 25);
  assert.ok(asset.occluders.every((mesh) => registered.includes(mesh)));
  assert.equal(asset.activationSurfaces.some((mesh) => /mitten|tray|bookmark/.test(mesh.name)), false);
  for (const source of registered) {
    const scene = new THREE.Scene(), blocker = new THREE.Mesh(source.geometry, source.material);
    scene.add(blocker);
    const pos = source.geometry.getAttribute('position'), idx = source.geometry.index;
    let center, normal;
    for (let i = 0; i + 2 < (idx?.count ?? pos.count); i += 3) {
      const tri = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, idx ? idx.getX(i + k) : i + k));
      normal = tri[1].clone().sub(tri[0]).cross(tri[2].clone().sub(tri[0]));
      if (normal.length() < 1e-10) continue;
      normal.normalize(); center = tri[0].clone().add(tri[1]).add(tri[2]).multiplyScalar(1 / 3); break;
    }
    assert.ok(center, source.name);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.001, 10);
    camera.position.copy(center).addScaledVector(normal, 0.3);
    if (Math.abs(normal.y) > 0.9) camera.up.set(1, 0, 0);
    camera.lookAt(center); camera.updateMatrixWorld(true);
    const project = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), new THREE.MeshBasicMaterial());
    project.position.copy(center).addScaledVector(normal, -0.05); project.quaternion.copy(camera.quaternion); scene.add(project);
    const model = { scene, targets: [{ id: 'dissertation', surface: project }], occluders: [], assistant: { activationSurfaces: [], occluders: [blocker] } };
    for (const expanded of [false, true]) {
      blocker.visible = false;
      assert.equal(picking.pickScene(model, camera, 250, 250, 500, 500, expanded)?.projectId, 'dissertation', `${source.name} control`);
      blocker.visible = true;
      assert.equal(picking.pickScene(model, camera, 250, 250, 500, 500, expanded), null, source.name);
    }
    project.geometry.dispose(); project.material.dispose();
  }
  controller.dispose(); h.assertReleased();
});

test('normal optional removal releases all 31 robot/card identities and preserves the renderer', async () => {
  const { h, controller } = await attached();
  const counts = watch(h.model.assistant.occluders.flatMap((mesh) => [mesh.geometry, mesh.material]));
  assert.equal(counts.size, 31);
  controller.update(state(undefined)); await h.flush();
  assert.ok([...counts.values()].every((n) => n === 1));
  assert.equal(h.model.assistant, undefined); assert.equal(h.renderers[0].disposeCount, 0);
  controller.dispose(); h.assertReleased();
});

test('cleanup/remount lifetime analogue ignores old observers, RAF and robot resolution', async () => {
  const h = harness({ assistant: robotTest.input({ count: 4 }) });
  const first = h.mount(); await h.flush();
  h.window.dispatchEvent(new Event('resize'));
  const oldFrame = [...h.frames.values()][0], oldObservers = [...h.observers], oldCanvas = h.canvas;
  first.dispose();
  const second = h.mount(); await h.flush();
  const current = await robotTest.realAsset(); h.robotLoads[1].resolve(current); await h.flush();
  const statuses = [...h.robotStatuses], renders = h.renderers[1].renderCount;
  assert.notEqual(h.canvas, oldCanvas);
  oldFrame(1234);
  oldObservers[0].callback([]);
  oldObservers[1].callback([{ target: h.host, isIntersecting: false }]);
  const old = await robotTest.realAsset(), counts = watch(old.occluders.flatMap((mesh) => [mesh.geometry, mesh.material]));
  h.robotLoads[0].resolve(old); await h.flush();
  assert.ok([...counts.values()].every((n) => n === 1));
  assert.equal(h.model.scene.getObjectByName('StudioAssistantPlacement'), current.root);
  assert.equal(h.renderers[1].renderCount, renders); assert.deepEqual([...h.robotStatuses], statuses);
  assert.equal(h.frames.size, 0); assert.equal(oldCanvas.listenerCount, 0);
  second.dispose(); h.assertReleased();
});

test('P2: one generated-card release exception must not skip independent remaining resources', async () => {
  const { h, controller, asset } = await attached();
  const cards = h.model.assistant.occluders.filter((mesh) => !asset.occluders.includes(mesh));
  const cardResources = [...new Set(cards.flatMap((mesh) => [mesh.geometry, mesh.material]))];
  const counts = watch(cardResources), imported = watch(asset.occluders.flatMap((mesh) => [mesh.geometry, mesh.material]));
  const fail = () => { throw new Error('independent injected card geometry disposal failure'); };
  cards[0].geometry.addEventListener('dispose', fail);
  controller.update(state(undefined)); await h.flush();
  const observed = cardResources.map((r) => ({ type: r.type, disposals: counts.get(r) }));
  console.log('CARD_RELEASE_EVIDENCE', JSON.stringify(observed));
  assert.equal(h.renderers[0].disposeCount, 0, 'room remains live');
  assert.equal(h.model.assistant, undefined);
  assert.ok([...imported.values()].every((n) => n === 1), 'imported owner still releases');
  cards[0].geometry.removeEventListener('dispose', fail);
  // Clean up private test objects after recording the leaked identities.
  for (const resource of cardResources) if (counts.get(resource) === 0) resource.dispose();
  controller.dispose(); h.assertReleased();
  assert.deepEqual(observed.map((r) => r.disposals), [1, 1, 1]);
});

test('P2: a throwing root removal listener must not bypass the 28 imported resource releases', async () => {
  const { h, controller, asset } = await attached();
  const counts = watch(asset.occluders.flatMap((mesh) => [mesh.geometry, mesh.material]));
  const fail = () => { throw new Error('independent injected Three removed listener failure'); };
  asset.root.addEventListener('removed', fail);
  controller.update(state(undefined)); await h.flush();
  const released = [...counts.values()].filter((n) => n === 1).length;
  console.log('ROOT_RELEASE_EVIDENCE', JSON.stringify({ released, total: counts.size, detached: asset.root.parent === null, rendererDisposals: h.renderers[0].disposeCount }));
  assert.equal(asset.root.parent, null); assert.equal(h.model.assistant, undefined);
  assert.equal(h.renderers[0].disposeCount, 0);
  asset.root.removeEventListener('removed', fail); asset.dispose();
  controller.dispose(); h.assertReleased();
  assert.equal(released, 28);
});
