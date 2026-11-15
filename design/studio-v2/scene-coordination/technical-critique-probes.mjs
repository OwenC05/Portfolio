// Independent CPU review probes. Real installed Three geometry; no renderer or browser.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const root = new URL('../../../', import.meta.url);
function load(file, modules = {}, globals = {}) {
  const source = readFileSync(new URL(file, root), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(id) { assert.ok(id in modules, id); return modules[id]; }, ...globals }, { filename: file });
  return exports;
}
const contract = load('lib/studio-contract.ts');
const { pickProject } = load('components/studio/scene/picking.ts', { three: THREE, '@/lib/studio-contract': contract });
const resourcesModule = load('components/studio/scene/resources.ts', { three: THREE, 'three/addons/geometries/RoundedBoxGeometry.js': { RoundedBoxGeometry } });
const { STUDIO_VIEW: view } = load('components/studio/scene/view-config.ts');
const gradient = { addColorStop() {} };
const context = new Proxy({ createLinearGradient: () => gradient, createRadialGradient: () => gradient }, { get: (target, key) => target[key] ?? (() => {}) });
const textures = load('components/studio/scene/textures.ts', { three: THREE }, { document: { createElement: () => ({ getContext: () => context }) } });
const { createStudio } = load('components/studio/scene/build-studio.ts', { three: THREE, './resources': resourcesModule, './textures': textures });
const results = { scope: 'Independent CPU geometry probes; no WebGL, Canvas2D paint, browser trust or device proof', cwd: fileURLToPath(root), probes: [] };

function cast(camera, x, y, width, height, objects) {
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(2 * x / width - 1, 1 - 2 * y / height), camera);
  return { ray, hits: ray.intersectObjects(objects, false) };
}

// Cross-product absent from the suite: foreground belongs to another target,
// its rendered back is only under the finger, and the rear target has a clear sample.
{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20);
  camera.updateMatrixWorld(true);
  const rear = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial());
  rear.position.z = -5;
  const front = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.2), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  front.rotation.y = Math.PI;
  front.position.set(0.08 * Math.tan(Math.PI / 6) * 3, 0, -3);
  scene.add(rear, front); scene.updateMatrixWorld(true);
  const model = { scene, targets: [{ id: 'dissertation', surface: rear }, { id: 'copilot', surface: front }], occluders: [] };
  const finger = cast(camera, 270, 250, 500, 500, [rear, front]);
  const center = cast(camera, 250, 250, 500, 500, [rear, front]);
  assert.equal(finger.hits[0].object, front);
  assert.equal(center.hits[0].object, rear);
  assert.ok(finger.hits[0].face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(front.matrixWorld)).dot(finger.ray.ray.direction) > 0);
  const depth = finger.hits[0].point.clone().applyMatrix4(camera.matrixWorldInverse).z;
  assert.ok(-depth > camera.near && -depth < camera.far);
  const expanded = pickProject(model, camera, 270, 250, 500, 500, true);
  const exact = pickProject(model, camera, 270, 250, 500, 500, false);
  const positive = pickProject(model, camera, 250, 250, 500, 500, false);
  const includedAsOpaqueBlocker = pickProject({ ...model, occluders: [front] }, camera, 270, 250, 500, 500, true);
  front.visible = false;
  const unobstructed = pickProject(model, camera, 270, 250, 500, 500, true);
  assert.equal(positive, 'dissertation'); assert.equal(unobstructed, 'dissertation'); assert.equal(exact, null); assert.equal(includedAsOpaqueBlocker, null);
  results.probes.push({ name: 'other-target-back-under-expanded-finger', expected: null, actual: expanded, defectReproduced: expanded !== null, foregroundDistance: finger.hits[0].distance, foregroundCameraDepth: -depth, clearRearDistance: center.hits[0].distance, exact, positive, unobstructed, includedAsOpaqueBlocker });
  rear.geometry.dispose(); rear.material.dispose(); front.geometry.dispose(); front.material.dispose();
}

// Inspect the assembled model using all live opaque non-target meshes as an
// independent collection, rather than trusting the collector being reviewed.
{
  const resources = new resourcesModule.SceneResources();
  const model = createStudio(resources);
  const targetObjects = new Set(model.targets.map((t) => t.surface));
  const all = [];
  model.scene.traverse((object) => {
    if (!object.isMesh || targetObjects.has(object)) return;
    const material = object.material;
    if (!Array.isArray(material) && material.visible && !material.transparent && material.opacity >= 1) all.push(object);
  });
  const missing = all.filter((object) => !model.occluders.includes(object));
  const live = new Set(); model.scene.traverse((object) => live.add(object));
  assert.ok(model.occluders.every((object) => live.has(object)));
  assert.equal(missing.length, 3);
  assert.ok(missing.every((object) => model.targets.some((t) => t.border === object.material)));
  const camera = new THREE.PerspectiveCamera(); camera.position.fromArray(view.eye); camera.near = view.near; camera.far = view.far;
  let samples = 0; let changes = 0; let exactPositives = 0; let expandedOnly = 0; let physicalOcclusionViolations = 0;
  const firstChanges = []; const firstPhysicalViolations = []; const expansions = [];
  for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
    camera.aspect = width / height; camera.fov = width <= 640 ? view.mobileFov : view.desktopFov; camera.updateProjectionMatrix();
    for (const yaw of [view.yawBounds[0], -13, -4, 20, 44, view.yawBounds[1]]) for (const pitch of [view.pitchBounds[0], -8, view.pitchBounds[1]]) {
      const ya = THREE.MathUtils.degToRad(yaw), pi = THREE.MathUtils.degToRad(pitch);
      camera.lookAt(camera.position.clone().add(new THREE.Vector3(Math.sin(ya) * Math.cos(pi), Math.sin(pi), -Math.cos(ya) * Math.cos(pi))));
      camera.updateMatrixWorld(true);
      for (const target of model.targets) {
        // Independent samples on and near every border edge of the actual rotated faces.
        for (const a of [-0.505, -0.5, -0.49, 0, 0.49, 0.5, 0.505]) for (const b of [-0.505, -0.5, -0.49, 0, 0.49, 0.5, 0.505]) {
          const point = new THREE.Vector3(a, b, 0).applyMatrix4(target.surface.matrixWorld).project(camera);
          if (point.z < -1 || point.z > 1 || Math.abs(point.x) > 1 || Math.abs(point.y) > 1) continue;
          const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
          samples++;
          const actual = pickProject(model, camera, x, y, width, height, true);
          const complete = pickProject({ ...model, occluders: all }, camera, x, y, width, height, true);
          const exact = pickProject(model, camera, x, y, width, height, false);
          if (exact) exactPositives++;
          if (actual && !exact) {
            expandedOnly++;
            if (expansions.length < 3) expansions.push({ width, height, yaw, pitch, x, y, actual });
          }
          if (actual !== complete) { changes++; if (firstChanges.length < 3) firstChanges.push({ width, height, yaw, pitch, x, y, actual, complete }); }
          if (exact) {
            const hits = cast(camera, x, y, width, height, [...all, ...targetObjects]).hits;
            const front = hits.find((hit) => { const depth = -hit.point.clone().applyMatrix4(camera.matrixWorldInverse).z; return depth >= camera.near && depth <= camera.far; });
            const selected = model.targets.find((t) => t.id === exact);
            if (front && front.object !== selected.surface && front.distance + 1e-6 < hits.find((hit) => hit.object === selected.surface)?.distance) {
              physicalOcclusionViolations++; if (firstPhysicalViolations.length < 3) firstPhysicalViolations.push({ width, height, yaw, pitch, x, y, exact });
            }
          }
        }
      }
    }
  }
  results.probes.push({ name: 'real-art-border-collection-and-edge-differential', liveOccluders: model.occluders.length, instancedOccluders: model.occluders.filter((o) => o.isInstancedMesh).length, omittedOpaqueMeshes: missing.map((o) => ({ parent: o.parent.name, localPosition: o.position.toArray(), scale: o.scale.toArray(), side: o.material.side })), samples, changes, exactPositives, expandedOnly, firstChanges, expansions, physicalOcclusionViolations, firstPhysicalViolations, limits: 'Finite selected yaw/pitch and edge samples, not exhaustive projection or browser coverage' });
  resources.dispose();
}

// Run only the named existing test with in-memory guard removal. This is a
// test-sensitivity check: neither product source nor the performer suite is edited.
{
  const suiteURL = new URL('components/studio/scene/verify-controller.mjs', root);
  const targetName = 'unrelated, programmatic and stale clicks consume no selection and cannot be retried';
  const suite = readFileSync(suiteURL, 'utf8').replace(/^import .*;\r?\n/gm, '').replaceAll('import.meta.url', JSON.stringify(suiteURL.href));
  const identity = 'if (event.pointerId !== completed.pointerId || event.pointerType !== completed.pointerType) return;';
  const displacement = 'if (Math.hypot(event.clientX - completed.x, event.clientY - completed.y) > DRAG_THRESHOLD) return;';
  function execute(qualifyMouseDown) {
    let selectedTests = 0, removedGuards = 0, error = null;
    const body = qualifyMouseDown ? suite.replace("h.event('pointerup', point, touch);", "h.event('pointerup', point, touch); h.event('mousedown', point);") : suite;
    try {
      vm.runInNewContext(body, {
        assert, ts, THREE, RoundedBoxGeometry, vm, URL, EventTarget, Event,
        existsSync() { return true; },
        readFileSync(url, encoding) {
          const source = readFileSync(url, encoding);
          if (!url.href.endsWith('/controller.ts')) return source;
          assert.ok(source.includes(identity) && source.includes(displacement));
          removedGuards += 2;
          return source.replace(identity, '').replace(displacement, '');
        },
        test(name, options, callback) { if (name === targetName) { selectedTests++; (typeof options === 'function' ? options : callback)(); } },
      }, { filename: suiteURL.pathname });
    } catch (failure) { error = { message: failure.message, operator: failure.operator }; }
    assert.equal(selectedTests, 1, JSON.stringify(error)); assert.ok(removedGuards >= 2);
    return { selectedTests, removedGuards, passed: !error, error };
  }
  const unqualified = execute(false), qualified = execute(true);
  assert.equal(unqualified.passed, true); assert.equal(qualified.passed, false);
  results.probes.push({ name: 'click-negative-test-guard-sensitivity', targetName, mutation: 'Remove click pointer identity and displacement rejection only, in memory', existingTest: unqualified, withTrustedMousedownBeforeClick: qualified, defectReproduced: unqualified.passed && !qualified.passed });
}
console.log(JSON.stringify(results, null, 2));
// Exit 0 means probe completed and its geometric preconditions held; findings
// are explicit result fields, not silently represented as a passing product test.
