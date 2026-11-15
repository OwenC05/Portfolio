// Independent bounded S-T1/S-T2/S-T3 repair review. No source or historical evidence writes.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const root = new URL('../../../', import.meta.url);
const hash = (file) => createHash('sha256').update(readFileSync(new URL(file, root))).digest('hex').toUpperCase();
function load(file, modules = {}, rewrite = (s) => s, globals = {}) {
  const source = rewrite(readFileSync(new URL(file, root), 'utf8'));
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(id) { assert.ok(id in modules, id); return modules[id]; }, ...globals }, { filename: file });
  return exports;
}
const fileNames = [
  'components/studio/scene/picking.ts', 'components/studio/scene/verify-controller.mjs',
  'components/studio/scene/types.ts', 'components/studio/scene/controller.ts',
  'components/studio/scene/build-studio.ts', 'components/studio/scene/resources.ts',
  'components/studio/scene/view-config.ts', 'components/studio/scene/textures.ts',
  'components/studio/StudioScene.tsx', 'lib/studio-contract.ts',
  'design/studio-v2/scene-coordination/contracts.md', 'design/studio-v2/scene-technical-report.md',
  'design/studio-v2/scene-technical-repair-tests.md', 'design/studio-v2/scene-technical-repair-types.md',
  'design/studio-v2/scene-technical-repair-lint.md',
];
const historicalNames = [
  'design/studio-v2/scene-technical-critique.md',
  'design/studio-v2/scene-coordination/technical-critique-probes.mjs',
  'design/studio-v2/scene-coordination/technical-critique-probes.json',
  'design/studio-v2/scene-coordination/technical-critique-hashes.json',
];
const result = {
  atUtc: new Date().toISOString(), task: 'task_1707db15bd3d', dispatch: 'ctx_b7c401f35669', node: process.version,
  scope: 'S-T1/S-T2/S-T3 only; CPU Three geometry, modeled events, no browser/GPU/render evidence',
  reviewedFiles: fileNames.map((path) => ({ path, sha256: hash(path) })),
  preservedHistoricalFiles: historicalNames.map((path) => ({ path, sha256: hash(path) })), probes: [],
};
const contract = load('lib/studio-contract.ts');
const modules = { three: THREE, '@/lib/studio-contract': contract };
const { pickProject } = load('components/studio/scene/picking.ts', modules);
const repairedBlocker = 'const inputBlocker = opaqueHits([...occluders, ...targets.map((target) => target.surface)])[0];';
const { pickProject: revertedPicker } = load('components/studio/scene/picking.ts', modules, (source) => {
  assert.equal(source.split(repairedBlocker).length, 2);
  return source.replace(repairedBlocker, 'const inputBlocker = opaqueHits()[0];');
});

for (const x of [270, 230]) {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20);
  camera.updateMatrixWorld(true);
  const scene = new THREE.Scene();
  const rear = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial());
  rear.position.z = -5;
  const foreground = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.2), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  foreground.rotation.y = Math.PI;
  foreground.position.set((x / 250 - 1) * Math.tan(Math.PI / 6) * 3, 0, -3);
  const foregroundGroup = new THREE.Group(); foregroundGroup.add(foreground);
  scene.add(rear, foregroundGroup); scene.updateMatrixWorld(true);
  const model = { scene, targets: [{ id: 'dissertation', surface: rear }, { id: 'copilot', surface: foreground }], occluders: [] };
  function raw(px) {
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(px / 250 - 1, 0), camera);
    return { ray, hits: ray.intersectObjects([rear, foreground], false) };
  }
  function pick(px = x, expand = true, picker = pickProject) { return picker(model, camera, px, 250, 500, 500, expand); }
  const finger = raw(x), center = raw(250);
  assert.equal(finger.hits[0].object, foreground);
  assert.ok(finger.hits.every((hit) => hit.object !== rear), 'Finger genuinely misses the rear plane');
  assert.equal(center.hits[0].object, rear);
  const normalDot = finger.hits[0].face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(foreground.matrixWorld)).dot(finger.ray.ray.direction);
  const cameraDepth = -finger.hits[0].point.clone().applyMatrix4(camera.matrixWorldInverse).z;
  assert.ok(normalDot > 0); assert.ok(Math.abs(cameraDepth - 3) < 1e-12);
  assert.ok(cameraDepth > camera.near && cameraDepth < camera.far);
  const actual = pick(), exactBack = pick(x, false), exactRear = pick(250, false);
  const reverted = pick(x, true, revertedPicker);
  assert.equal(actual, null); assert.equal(exactBack, null); assert.equal(exactRear, 'dissertation');
  assert.equal(reverted, 'dissertation', 'Reverting only repaired blocker scope must recreate S-T1');
  foregroundGroup.visible = false;
  const hiddenPositive = pick(); assert.equal(hiddenPositive, 'dissertation');
  foregroundGroup.visible = true;
  foreground.material.transparent = true; foreground.material.opacity = 0.2;
  const translucentPositive = pick(); assert.equal(translucentPositive, 'dissertation');
  foreground.material.transparent = false; foreground.material.opacity = 1; foreground.rotation.y = 0;
  const exactForegroundPositive = pick(x, false); assert.equal(exactForegroundPositive, 'copilot');
  result.probes.push({ finding: 'S-T1', x, foregroundDistance: finger.hits[0].distance, cameraDepth, normalDot, clearRearDistance: center.hits[0].distance, repairedExpanded: actual, exactBack, exactRear, revertedExpanded: reverted, hiddenPositive, translucentPositive, exactForegroundPositive });
  rear.geometry.dispose(); rear.material.dispose(); foreground.geometry.dispose(); foreground.material.dispose();
}

// Execute named current tests only. Independently remove one guard at a time in
// the read adapter; the actual files and original test text remain unchanged.
const suiteURL = new URL('components/studio/scene/verify-controller.mjs', root);
const suite = readFileSync(suiteURL, 'utf8').replace(/^import .*;\r?\n/gm, '').replaceAll('import.meta.url', JSON.stringify(suiteURL.href));
function runSelected(name, mutation) {
  let selectedTests = 0, changedLoads = 0, failure = null;
  try {
    vm.runInNewContext(suite, {
      assert, ts, THREE, RoundedBoxGeometry, vm, URL, EventTarget, Event, existsSync,
      readFileSync(url, encoding) {
        const source = readFileSync(url, encoding);
        if (!mutation || !url.href.endsWith(mutation.path)) return source;
        assert.equal(source.split(mutation.from).length, 2, 'Exactly one mutation site required');
        changedLoads++; return source.replace(mutation.from, mutation.to);
      },
      test(testName, options, callback) {
        if (testName !== name) return;
        selectedTests++; (typeof options === 'function' ? options : callback)();
      },
    }, { filename: `independent-re-review-${mutation?.label ?? 'baseline'}` });
  } catch (error) {
    failure = { firstLine: error.message.split('\n')[0], operator: error.operator, actual: error.actual, expected: error.expected };
  }
  assert.equal(selectedTests, 1);
  if (mutation) assert.ok(changedLoads > 0);
  return { selectedTests, changedLoads, passed: failure === null, failure };
}
const matrixName = 'unrelated, programmatic and stale clicks consume no selection and cannot be retried';
const baseline = runSelected(matrixName);
assert.equal(baseline.passed, true);
const identity = 'if (event.pointerId !== completed.pointerId || event.pointerType !== completed.pointerType) return;';
const clickMutations = [
  { label: 'pointer-id', from: identity, to: 'if (event.pointerType !== completed.pointerType) return;', expectedCase: 'wrong-id' },
  { label: 'pointer-type', from: identity, to: 'if (event.pointerId !== completed.pointerId) return;', expectedCase: 'wrong-type' },
  { label: 'displacement', from: 'if (Math.hypot(event.clientX - completed.x, event.clientY - completed.y) > DRAG_THRESHOLD) return;', to: '', expectedCase: 'wrong-position' },
];
const sensitivity = clickMutations.map((mutation) => {
  const observed = runSelected(matrixName, { ...mutation, path: '/controller.ts' });
  assert.equal(observed.passed, false);
  assert.equal(observed.failure.operator, 'deepStrictEqual');
  assert.equal(observed.failure.firstLine, mutation.expectedCase);
  assert.deepEqual(Array.from(observed.failure.actual), ['dissertation']); assert.deepEqual(Array.from(observed.failure.expected), []);
  return { label: mutation.label, ...observed };
});
const mousedownName = 'trusted canvas click also requires compatibility mousedown and consumes an invalid attempt';
const mousedownBaseline = runSelected(mousedownName); assert.equal(mousedownBaseline.passed, true);
const mousedownRemoved = runSelected(mousedownName, { label: 'mousedown', path: '/controller.ts', from: '!completed?.mouseDown', to: '!completed' });
assert.equal(mousedownRemoved.passed, false); assert.equal(mousedownRemoved.failure.operator, 'deepStrictEqual');
assert.deepEqual(Array.from(mousedownRemoved.failure.actual), ['dissertation']); assert.deepEqual(Array.from(mousedownRemoved.failure.expected), []);
result.probes.push({ finding: 'S-T2', baseline, sensitivity, mousedownBaseline, mousedownRemoved });

const inventoryName = 'S-T3 actual model opaque omissions are exactly selectable surfaces and dedicated border materials';
const inventory = runSelected(inventoryName); assert.equal(inventory.passed, true);
const omission = runSelected(inventoryName, {
  label: 'extra-opaque-omission', path: '/build-studio.ts', from: 'return { scene, targets, occluders };',
  to: 'const unexpected = new THREE.Mesh(resources.geometry(new THREE.BoxGeometry(0.1, 0.1, 0.1)), resources.material(new THREE.MeshBasicMaterial())); unexpected.userData.interactive = true; scene.add(unexpected); return { scene, targets, occluders };',
});
assert.equal(omission.passed, false); assert.equal(omission.failure.operator, 'strictEqual');
assert.equal(omission.failure.firstLine, 'No arbitrary opaque interactive decoration may be omitted');
assert.equal(omission.failure.actual, 7); assert.equal(omission.failure.expected, 6);
result.probes.push({ finding: 'S-T3', baseline: inventory, omittedExtraInteractiveOpaqueMesh: omission });

for (const entry of [...result.reviewedFiles, ...result.preservedHistoricalFiles]) assert.equal(hash(entry.path), entry.sha256, `Changed during review: ${entry.path}`);
result.allReviewedAndHistoricalHashesUnchanged = true;
result.verdict = 'APPROVE: bounded S-T1/S-T2/S-T3 repair only';
console.log(JSON.stringify(result, null, 2));
