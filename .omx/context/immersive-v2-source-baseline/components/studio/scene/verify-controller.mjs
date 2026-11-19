// CPU-only lifecycle/picking checks. This deliberately supplies no WebGL context.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function loadTs(path, modules, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
    ...globals,
  }, { filename: path });
  return exports;
}

const contract = loadTs('../../../lib/studio-contract.ts', {});
const resourceModule = loadTs('./resources.ts', { three: THREE, 'three/addons/geometries/RoundedBoxGeometry.js': { RoundedBoxGeometry } });

class TrackedTarget extends EventTarget {
  listeners = new Map();
  listenerOptions = new Map();
  addEventListener(type, callback, options) {
    const handlers = this.listeners.get(type) ?? new Set();
    handlers.add(callback);
    this.listeners.set(type, handlers);
    this.listenerOptions.set(type, options);
    super.addEventListener(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    this.listeners.get(type)?.delete(callback);
    super.removeEventListener(type, callback, options);
  }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, handlers) => sum + handlers.size, 0); }
}

function harness(options = {}) {
  const frames = new Map();
  let nextFrame = 0;
  const window = new TrackedTarget();
  Object.assign(window, {
    innerWidth: options.mobile ? 390 : 1440,
    devicePixelRatio: 3,
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  const document = new TrackedTarget();
  Object.assign(document, { hidden: false, defaultView: window });
  const rect = { left: 113, top: 79, width: options.mobile ? 390 : 900, height: 620 };
  const host = { ownerDocument: document, children: [], getBoundingClientRect: () => ({ ...rect }), appendChild(canvas) { this.children.push(canvas); } };
  let canvas;
  document.createElement = (tag) => {
    assert.equal(tag, 'canvas');
    canvas = new TrackedTarget();
    Object.assign(canvas, {
      style: {}, dataset: {}, attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; },
      getBoundingClientRect: () => ({ ...rect }),
      remove() { host.children = host.children.filter((child) => child !== canvas); },
    });
    return canvas;
  };
  const observers = [];
  class Observer {
    disconnected = false;
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  }
  const disposedResources = [];
  const ownedResources = [];
  function track(resource) {
    ownedResources.push(resource);
    resource.addEventListener('dispose', () => disposedResources.push(resource));
    return resource;
  }
  let builtModel;
  let buildCount = 0;
  let ledger;
  const createStudio = (resources) => {
    ledger = resources;
    buildCount++;
    if (options.realModel) {
      // Geometry and instancing are real; Canvas2D painting is intentionally inert.
      const gradient = { addColorStop() {} };
      const context = new Proxy({ createLinearGradient: () => gradient, createRadialGradient: () => gradient }, {
        get(target, key) { return target[key] ?? (() => {}); },
      });
      const textures = loadTs('./textures.ts', { three: THREE }, {
        document: { createElement: () => ({ getContext: () => context }) },
      });
      const builder = loadTs('./build-studio.ts', { three: THREE, './resources': resourceModule, './textures': textures });
      builtModel = builder.createStudio(resources);
      for (const ledger of [resources.geometries, resources.materials, resources.textures, resources.instances]) ledger.forEach(track);
      builtModel.scene.traverse((object) => { if (object instanceof THREE.DirectionalLight) builtModel.light = object; });
      return builtModel;
    }
    const geometry = resources.geometry(track(new THREE.PlaneGeometry(1.2, 1.2)));
    const material = resources.material(track(new THREE.MeshBasicMaterial()));
    resources.texture(track(new THREE.Texture()));
    const instance = track(new THREE.InstancedMesh(geometry, material, 1));
    resources.instances.add(instance);
    if (options.ledgerFailure) {
      resources.geometry(track(new THREE.BoxGeometry()));
      const failing = options.ledgerFailure === 'instances' ? instance : geometry;
      failing.addEventListener('dispose', () => { throw new Error('Injected ledger release failure'); });
    }
    if (options.modelFailure) throw new Error('Injected partial model failure');
    const scene = new THREE.Scene();
    const targets = contract.PROJECT_IDS.map((id, index) => {
      const surface = new THREE.Mesh(geometry, material);
      surface.position.set(index * 2 - 2, 2, 0);
      surface.userData.projectId = id;
      scene.add(surface);
      return { id, surface, border: resources.material(track(new THREE.MeshBasicMaterial())) };
    });
    const light = new THREE.DirectionalLight();
    light.castShadow = true;
    scene.add(light);
    // A closer unrelated mesh must not steal picks from the explicit target list.
    scene.add(new THREE.Mesh(geometry, material));
    builtModel = { scene, targets, light };
    return builtModel;
  };
  const renderers = [];
  class Renderer {
    shadowMap = {};
    info = { render: { calls: 0, triangles: 0 }, memory: { geometries: 0, textures: 0 } };
    renderCount = 0;
    shadowPasses = 0;
    disposeCount = 0;
    lossCount = 0;
    constructor() {
      if (options.rendererFailure) throw new Error('Injected constructor failure');
      renderers.push(this);
    }
    setClearColor() {}
    setPixelRatio(value) { this.dpr = value; }
    setSize(width, height) { this.size = [width, height]; }
    render(scene, camera) {
      if (options.renderFailure) throw new Error('Injected render failure');
      this.camera = camera;
      this.renderCount++;
      scene.updateMatrixWorld(true);
      if (this.shadowMap.needsUpdate) {
        this.shadowPasses++;
        builtModel.light.shadow.map = track(new THREE.WebGLRenderTarget(8, 8));
        builtModel.light.shadow.mapPass = track(new THREE.WebGLRenderTarget(8, 8));
        this.shadowMap.needsUpdate = false;
      }
      if (options.lossDuringRender) canvas.dispatchEvent(new Event('webglcontextlost'));
    }
    dispose() {
      this.disposeCount++;
      if (options.disposeFailure) throw new Error('Injected dispose failure');
    }
    forceContextLoss() { this.lossCount++; canvas.dispatchEvent(new Event('webglcontextlost')); }
  }
  const { createStudioController } = loadTs('./controller.ts', {
    three: { ...THREE, WebGLRenderer: Renderer },
    '@/lib/studio-contract': contract,
    './build-studio': { createStudio },
    './resources': resourceModule,
  }, { ResizeObserver: Observer, IntersectionObserver: Observer });
  const statuses = [];
  const selections = [];
  let controller;
  const mount = () => {
    controller = createStudioController(host, {
      selectedProjectId: null,
      reducedMotion: options.reducedMotion ?? false,
      onStatusChange: (status) => statuses.push(status),
      onSelectProject: (id) => { selections.push(id); options.onSelectProject?.(id); },
    });
    return controller;
  };
  const flush = () => {
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach((callback) => callback(0));
  };
  const event = (type, point, overrides = {}, target = canvas) => {
    const value = new Event(type, { cancelable: true });
    const { isTrusted = true, ...fields } = overrides;
    Object.assign(value, { clientX: point.x, clientY: point.y, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, buttons: 0, detail: 1 }, fields);
    // CPU fixture only: synthetic trust and propagation model the browser trace,
    // without claiming that dispatchEvent creates trusted browser input.
    Object.defineProperties(value, { isTrusted: { value: isTrusted }, target: { value: target } });
    target.dispatchEvent(value);
    if (target !== document && !['pointerleave', 'pointerenter'].includes(type)) document.dispatchEvent(value);
    assert.equal(value.defaultPrevented, false, 'Pointer handlers must preserve normal scrolling');
  };
  const pointFor = (index) => {
    const position = builtModel.targets[index].surface.getWorldPosition(new THREE.Vector3()).project(renderers.at(-1).camera);
    return { x: rect.left + (position.x + 1) * rect.width / 2, y: rect.top + (1 - position.y) * rect.height / 2 };
  };
  const assertReleased = () => {
    assert.equal(frames.size, 0);
    assert.equal(host.children.length, 0);
    assert.equal(document.listenerCount + window.listenerCount + canvas.listenerCount, 0);
    assert.ok(observers.every((observer) => observer.disconnected));
    assert.equal(disposedResources.length, ownedResources.length);
    assert.equal(new Set(disposedResources).size, ownedResources.length, 'Each resource disposed once');
    for (const renderer of renderers) {
      assert.equal(renderer.disposeCount, 1);
      assert.equal(renderer.lossCount, 1);
    }
  };
  return {
    mount, flush, event, pointFor, assertReleased, rect, host, document, window, frames, observers, statuses, selections, renderers,
    get canvas() { return canvas; }, get model() { return builtModel; }, get buildCount() { return buildCount; },
    get ledger() { return ledger; },
  };
}

function mobileLayout(h, viewportWidth) {
  const gutter = viewportWidth <= 360 ? 16 : 20;
  h.window.innerWidth = viewportWidth;
  // Current page padding plus the scene frame's 1px border on each side.
  Object.assign(h.rect, { left: gutter + 1, top: 364, width: viewportWidth - 2 * gutter - 2, height: 352 });
}

function surfaceBox(h, target) {
  const positions = target.surface.geometry.getAttribute('position');
  const bounds = new THREE.Box2();
  for (let index = 0; index < positions.count; index++) {
    const point = new THREE.Vector3().fromBufferAttribute(positions, index)
      .applyMatrix4(target.surface.matrixWorld).project(h.renderers.at(-1).camera);
    bounds.expandByPoint(new THREE.Vector2(h.rect.left + (point.x + 1) * h.rect.width / 2, h.rect.top + (1 - point.y) * h.rect.height / 2));
  }
  return { center: bounds.getCenter(new THREE.Vector2()), width: bounds.max.x - bounds.min.x, height: bounds.max.y - bounds.min.y };
}

function exactTargetAt(h, point) {
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2((point.x - h.rect.left) / h.rect.width * 2 - 1, 1 - (point.y - h.rect.top) / h.rect.height * 2), h.renderers.at(-1).camera);
  const hit = ray.intersectObjects(h.model.targets.map((target) => target.surface), false)[0];
  return h.model.targets.find((target) => target.surface === hit?.object)?.id ?? null;
}

function expectedTouchTarget(h, point) {
  const exact = exactTargetAt(h, point);
  if (exact) return exact;
  const candidates = h.model.targets.map((target) => {
    const box = surfaceBox(h, target);
    const dx = point.x - box.center.x;
    const dy = point.y - box.center.y;
    return { id: target.id, distance: dx * dx + dy * dy, eligible: Math.abs(dx) <= Math.max(44, box.width) / 2 + 1e-6 && Math.abs(dy) <= Math.max(44, box.height) / 2 + 1e-6 };
  }).filter((target) => target.eligible);
  candidates.sort((a, b) => a.distance - b.distance || contract.PROJECT_IDS.indexOf(a.id) - contract.PROJECT_IDS.indexOf(b.id));
  return candidates[0]?.id ?? null;
}

function finishClick(h, point, pointerType = 'touch', overrides = {}) {
  if (pointerType === 'touch') {
    h.event('touchend', point, { pointerType, ...overrides });
    h.event('pointerout', point, { pointerType, ...overrides });
    h.event('pointerleave', point, { pointerType, ...overrides });
    h.event('mousedown', point);
  }
  h.event('mouseup', point);
  // PointerEvent click need not be primary; identity comes from the completed gesture.
  h.event('click', point, { pointerType, isPrimary: false, ...overrides });
}

function tap(h, point, pointerType = 'touch', overrides = {}) {
  const previous = h.selections.length;
  h.event('pointerdown', point, { pointerType, ...overrides });
  h.event(pointerType === 'touch' ? 'touchstart' : 'mousedown', point, { pointerType, ...overrides });
  h.event('pointerup', point, { pointerType, ...overrides });
  finishClick(h, point, pointerType, overrides);
  return h.selections.length > previous ? h.selections.at(-1) : null;
}

for (const width of [320, 390]) for (const reducedMotion of [true, false]) {
  test(`CPU event-order fixture: ${width}px ${reducedMotion ? 'reduced' : 'ordinary'} motion ends on heading after compatibility focus`, () => {
    let active = 'BODY';
    let hash = '';
    let historyWrites = 0;
    let stage = '';
    const selectionsAt = [];
    const h = harness({ mobile: true, reducedMotion, onSelectProject(id) {
      selectionsAt.push(stage);
      const next = `#project-${id}`;
      if (hash !== next) historyWrites++;
      hash = next;
      active = `project-${id}-heading`;
    } });
    mobileLayout(h, width);
    const controller = h.mount();
    h.flush();
    const point = h.pointFor(0);
    const trace = [];
    for (const type of ['pointerdown', 'touchstart', 'pointerup', 'touchend', 'pointerout', 'pointerleave', 'mousedown', 'mouseup', 'click']) {
      stage = type;
      h.event(type, point, { pointerType: 'touch', isPrimary: type !== 'click' });
      // Simulate the observed browser default focus action. Early selection +
      // instant scroll retargets to work; otherwise mousedown focuses canvas.
      if (type === 'mousedown') active = hash && reducedMotion ? 'work' : 'CANVAS';
      trace.push({ type, active, count: h.selections.length });
    }
    assert.equal(active, 'project-dissertation-heading', JSON.stringify(trace));
    assert.deepEqual(selectionsAt, ['click'], 'No callback before compatibility focus has completed');
    assert.deepEqual(h.selections, ['dissertation']);
    assert.equal(historyWrites, 1, 'One synthetic navigation/history write');
    h.event('click', point, { pointerType: 'touch' });
    assert.equal(h.selections.length, 1, 'Repeated click without a fresh gesture cannot select');
    assert.equal(historyWrites, 1);
    controller.dispose();
    h.assertReleased();
  });
}

test('mouse, pen and touch commit once per complete gesture; repeated/double activation needs a new gesture', () => {
  for (const pointerType of ['mouse', 'pen', 'touch']) {
    const h = harness();
    const controller = h.mount();
    h.flush();
    const point = h.pointFor(0);
    h.event('pointerdown', point, { pointerType });
    h.event('pointerup', point, { pointerType });
    assert.equal(h.selections.length, 0, 'Pointerup only qualifies the gesture');
    finishClick(h, point, pointerType);
    assert.deepEqual(h.selections, ['dissertation']);
    finishClick(h, point, pointerType, { detail: 2 });
    assert.equal(h.selections.length, 1, 'A duplicate click is consumed');
    assert.equal(tap(h, point, pointerType, { detail: 2 }), 'dissertation');
    assert.equal(h.selections.length, 2, 'A second complete gesture selects once');
    h.event('dblclick', point, { pointerType, detail: 2 });
    assert.equal(h.selections.length, 2);
    controller.dispose();
    h.assertReleased();
  }
});

for (const phase of ['active', 'completed']) {
  test(`${phase} gestures cannot select after scroll, resize, hiding, offscreen, cancellation, loss or disposal`, () => {
    for (const pointerType of ['touch', 'pen']) for (const cancellation of ['scroll', 'resize', 'host-resize', 'hidden', 'offscreen', 'pointercancel', 'outside-down', 'outside-click', 'context-loss', 'dispose']) {
      const h = harness();
      const controller = h.mount();
      h.flush();
      const point = h.pointFor(0);
      const input = { pointerType };
      h.event('pointerdown', point, input);
      if (phase === 'completed') h.event('pointerup', point, input);
      switch (cancellation) {
        case 'scroll': h.window.dispatchEvent(new Event('scroll')); break;
        case 'resize': h.window.dispatchEvent(new Event('resize')); break;
        case 'host-resize': h.observers[0].callback([]); break;
        case 'hidden':
          h.document.hidden = true;
          h.document.dispatchEvent(new Event('visibilitychange'));
          h.document.hidden = false;
          h.document.dispatchEvent(new Event('visibilitychange'));
          break;
        case 'offscreen':
          h.observers[1].callback([{ target: h.host, isIntersecting: false }]);
          h.observers[1].callback([{ target: h.host, isIntersecting: true }]);
          break;
        case 'pointercancel': h.event('pointercancel', point, input); break;
        case 'outside-down': h.event('pointerdown', point, input, h.document); break;
        case 'outside-click': h.event('click', point, input, h.document); break;
        case 'context-loss': h.canvas.dispatchEvent(new Event('webglcontextlost')); break;
        case 'dispose': controller.dispose(); break;
      }
      if (phase === 'active') h.event('pointerup', point, input);
      finishClick(h, point, pointerType);
      assert.deepEqual(h.selections, [], `${pointerType} ${phase}: ${cancellation} must invalidate the sequence`);
      controller.dispose();
      h.assertReleased();
    }
  });
}

test('active leaves, drag excursions, mismatched up and second pointers cannot become completed clicks', () => {
  for (const pointerType of ['touch', 'pen']) for (const change of ['pointerout', 'pointerleave', 'drag-return', 'up-drag', 'wrong-id', 'wrong-type', 'secondary', 'right-button', 'second-pointer', 'untrusted-down', 'untrusted-up']) {
    const h = harness();
    const controller = h.mount();
    h.flush();
    const point = h.pointFor(0);
    const input = { pointerType };
    h.event('pointerdown', point, { ...input, isTrusted: change !== 'untrusted-down' });
    if (['pointerout', 'pointerleave'].includes(change)) h.event(change, point, input);
    if (change === 'drag-return') h.event('pointermove', { x: point.x + 8.01, y: point.y }, input);
    if (change === 'second-pointer') h.event('pointerdown', point, { ...input, pointerId: 2, isPrimary: false });
    h.event('pointerup', change === 'up-drag' ? { x: point.x + 8.01, y: point.y } : point, {
      ...input, pointerId: change === 'wrong-id' ? 2 : 1, pointerType: change === 'wrong-type' ? (pointerType === 'touch' ? 'pen' : 'touch') : pointerType,
      isPrimary: change !== 'secondary', button: change === 'right-button' ? 2 : 0, isTrusted: change !== 'untrusted-up',
    });
    finishClick(h, point, pointerType);
    assert.deepEqual(h.selections, [], `${pointerType}: ${change}`);
    controller.dispose();
    h.assertReleased();
  }
});

test('unrelated, programmatic and stale clicks consume no selection and cannot be retried', () => {
  for (const change of ['wrong-id', 'wrong-type', 'wrong-position', 'untrusted', 'no-detail', 'no-pointer', 'right-button', 'new-down', 'new-invalid-down', 'other-up']) {
    const h = harness();
    const controller = h.mount();
    h.flush();
    const point = h.pointFor(0);
    const touch = { pointerType: 'touch' };
    h.event('click', point, touch);
    assert.deepEqual(h.selections, [], 'Click requires a completed gesture');
    h.event('pointerdown', point, touch);
    h.event('pointerup', point, touch);
    if (change === 'new-down') h.event('pointerdown', point, { ...touch, pointerId: 2 });
    if (change === 'new-invalid-down') h.event('pointerdown', point, { ...touch, pointerId: 2, isPrimary: false });
    if (change === 'other-up') h.event('pointerup', point, { ...touch, pointerId: 2 });
    h.event('click', change === 'wrong-position' ? { x: point.x + 9, y: point.y } : point, {
      ...touch, pointerId: change === 'wrong-id' ? 2 : change === 'no-pointer' ? undefined : 1,
      pointerType: change === 'wrong-type' ? 'mouse' : change === 'no-pointer' ? undefined : 'touch',
      isTrusted: change !== 'untrusted', detail: change === 'no-detail' ? 0 : 1, button: change === 'right-button' ? 2 : 0,
    });
    h.event('click', point, touch);
    assert.deepEqual(h.selections, [], change);
    controller.dispose();
    h.assertReleased();
  }
});

test('completed touch and pen tolerate click coordinate rounding and release leaves, but mouse leaving cancels', () => {
  for (const pointerType of ['touch', 'mouse', 'pen']) {
    const h = harness();
    const controller = h.mount();
    h.flush();
    const point = h.pointFor(0);
    h.event('pointerdown', point, { pointerType });
    h.event('pointerup', point, { pointerType });
    h.event('pointerout', point, { pointerType });
    h.event('pointerleave', point, { pointerType });
    h.event('click', { x: Math.floor(point.x), y: Math.floor(point.y) }, { pointerType, isPrimary: false });
    assert.deepEqual(h.selections, pointerType === 'mouse' ? [] : ['dissertation']);
    controller.dispose();
    h.assertReleased();
  }
});

for (const exactHit of [true, false]) {
  test(`non-hover pen release ${exactHit ? 'commits an exact hit once at click' : 'rejects a nearby touch-only hit'}`, () => {
    let stage = '';
    const selectionsAt = [];
    const h = harness({ mobile: true, onSelectProject() { selectionsAt.push(stage); } });
    mobileLayout(h, 320);
    const controller = h.mount();
    h.flush();
    const x = h.rect.left + 100;
    const y = h.rect.top + 150;
    placeSurface(h, 0, x, y, 4, 4);
    placeSurface(h, 1, x + 80, y, 4, 4);
    placeSurface(h, 2, x + 130, y, 4, 4);
    const point = { x, y: exactHit ? y : y + 20 };
    assert.equal(exactTargetAt(h, point), exactHit ? 'dissertation' : null);
    assert.equal(tap(h, point), 'dissertation', 'Touch accepts both the exact surface and its nearby expanded region');
    h.selections.length = 0;
    selectionsAt.length = 0;
    for (const type of ['pointerdown', 'pointerup', 'pointerout', 'pointerleave', 'mousedown', 'mouseup', 'click']) {
      stage = type;
      h.event(type, point, { pointerType: 'pen', isPrimary: type !== 'click', buttons: type === 'pointerdown' ? 1 : 0 });
      if (type !== 'click') assert.deepEqual(h.selections, [], `${type} must not commit`);
    }
    assert.deepEqual(h.selections, exactHit ? ['dissertation'] : []);
    assert.deepEqual(selectionsAt, exactHit ? ['click'] : []);
    h.event('click', point, { pointerType: 'pen', isPrimary: false, detail: 2 });
    h.event('dblclick', point, { pointerType: 'pen', detail: 2 });
    assert.deepEqual(h.selections, exactHit ? ['dissertation'] : [], 'Release cannot commit twice');
    controller.dispose();
    h.assertReleased();
  });
}

test('released pen boundaries with wrong identity, type or held buttons cancel the pending click', () => {
  for (const type of ['pointerout', 'pointerleave']) for (const mismatch of [{ pointerId: 2 }, { pointerType: 'touch' }, { pointerType: 'mouse' }, { buttons: 1 }]) {
    const h = harness();
    const controller = h.mount();
    h.flush();
    const point = h.pointFor(0);
    const pen = { pointerType: 'pen' };
    h.event('pointerdown', point, pen);
    h.event('pointerup', point, pen);
    h.event(type, point, { ...pen, ...mismatch });
    h.event('pointerout', point, pen);
    h.event('pointerleave', point, pen);
    finishClick(h, point, 'pen');
    h.event('click', point, pen);
    assert.deepEqual(h.selections, [], `${type}: ${JSON.stringify(mismatch)}`);
    controller.dispose();
    h.assertReleased();
  }
});

function placeSurface(h, index, x, y, width, height) {
  // Explicit CSS-pixel fixture, independent of the production bounds algorithm.
  const camera = h.renderers.at(-1).camera;
  const surface = h.model.targets[index].surface;
  surface.position.copy(new THREE.Vector3((x - h.rect.left) / h.rect.width * 2 - 1, 1 - (y - h.rect.top) / h.rect.height * 2, 0).unproject(camera));
  surface.quaternion.copy(camera.quaternion);
  surface.scale.set(width * (camera.right - camera.left) / h.rect.width / 1.2, height * (camera.top - camera.bottom) / h.rect.height / 1.2, 1);
  h.model.scene.updateMatrixWorld(true);
}

test('guttered 390px and 320px portraits accept 44px touch corners and edges before and after resize', () => {
  for (const initialWidth of [390, 320]) {
    const h = harness({ mobile: true, realModel: true });
    mobileLayout(h, initialWidth);
    const controller = h.mount();
    h.flush();
    for (const width of [initialWidth, initialWidth === 390 ? 320 : 390]) {
      mobileLayout(h, width);
      h.observers[0].callback([]);
      h.flush();
      for (const target of h.model.targets.filter((target) => target.id !== 'dissertation')) {
        const box = surfaceBox(h, target);
        assert.ok(box.width < 44 && box.height < 44, 'The real portrait needs enlargement on both axes');
        for (const [dx, dy] of [[-22, -22], [22, -22], [-22, 22], [22, 22], [-22, 0], [22, 0], [0, -22], [0, 22]]) {
          const point = { x: box.center.x + dx, y: box.center.y + dy };
          assert.notEqual(exactTargetAt(h, point), target.id, 'Probe must be outside the portrait surface');
          const expected = expectedTouchTarget(h, point);
          assert.ok(expected, 'Every nominal 44px edge/corner has an eligible project');
          assert.equal(tap(h, point), expected, `${width}px ${target.id} edge (${dx}, ${dy})`);
          assert.equal(tap(h, point, 'mouse'), exactTargetAt(h, point), 'Mouse keeps exact-surface picking');
          assert.equal(tap(h, point, 'pen'), exactTargetAt(h, point), 'Pen keeps exact-surface picking');
        }
      }
    }
    assert.equal(h.buildCount, 1);
    controller.dispose();
    h.assertReleased();
  }
});

test('overlapping touch regions use nearest centers, canonical ties, then exact-surface priority', () => {
  for (const width of [390, 320]) {
    const h = harness({ mobile: true });
    mobileLayout(h, width);
    const controller = h.mount();
    h.flush();
    const x = h.rect.left + 100;
    const y = h.rect.top + 150;
    placeSurface(h, 0, x, y, 4, 4);
    placeSurface(h, 1, x + 20, y, 4, 4);
    placeSurface(h, 2, x + 90, y, 4, 4);
    assert.equal(exactTargetAt(h, { x: x + 7, y: y + 15 }), null);
    assert.equal(tap(h, { x: x + 7, y: y + 15 }), 'dissertation');
    assert.equal(tap(h, { x: x + 13, y: y + 15 }), 'copilot');
    // Coincident centers produce an exact distance tie, even with reversed model ordering.
    placeSurface(h, 1, x, y, 4, 4);
    h.model.targets.reverse();
    assert.equal(tap(h, { x, y: y + 20 }), 'dissertation');
    h.model.targets.reverse();
    // A wide surface covers the probe while a different (missed) tiny surface is nearer.
    placeSurface(h, 0, x, y, 4, 4);
    placeSurface(h, 1, x + 20, y, 40, 20);
    const exact = { x: x + 3, y: y + 3 };
    assert.equal(exactTargetAt(h, exact), 'copilot');
    assert.equal(tap(h, exact), 'copilot', 'An exact visual hit must win over the nearer center');
    controller.dispose();
    h.assertReleased();
  }
});

test('enlarged regions stay bounded and cancel touches on page scroll, drag, or pointer cancellation', () => {
  const h = harness({ mobile: true });
  mobileLayout(h, 320);
  const controller = h.mount();
  h.flush();
  const x = h.rect.left + 100;
  const y = h.rect.top + 150;
  placeSurface(h, 0, x, y, 4, 4);
  placeSurface(h, 1, x + 80, y, 4, 4);
  placeSurface(h, 2, x + 130, y, 4, 4);
  const point = { x, y: y + 20 };
  assert.equal(tap(h, point), 'dissertation');
  for (const offset of [{ x: 22.01, y: 0 }, { x: 0, y: 22.01 }]) {
    assert.equal(tap(h, { x: x + offset.x, y: y + offset.y }), null, 'Outside the minimum footprint must miss');
  }
  const previous = h.selections.length;
  h.event('pointerdown', point, { pointerType: 'touch' });
  h.window.dispatchEvent(new Event('scroll'));
  h.event('pointerup', point, { pointerType: 'touch' });
  finishClick(h, point);
  assert.equal(h.selections.length, previous, 'Page scrolling cancels a pending tap');
  h.event('pointerdown', point, { pointerType: 'touch' });
  h.event('pointermove', { x: point.x + 8.01, y: point.y }, { pointerType: 'touch' });
  h.event('pointerup', point, { pointerType: 'touch' });
  finishClick(h, point);
  h.event('pointerdown', point, { pointerType: 'touch' });
  h.event('pointercancel', point, { pointerType: 'touch' });
  h.event('pointerup', point, { pointerType: 'touch' });
  finishClick(h, point);
  assert.equal(h.selections.length, previous, 'Returning after a drag or cancellation must not select');
  assert.equal(h.window.listenerOptions.get('scroll').passive, true);
  for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click']) assert.equal(h.canvas.listenerOptions.get(type)?.passive, true);
  assert.equal(tap(h, { x: h.rect.left - 1, y }), null, 'No picking outside the canvas');
  controller.dispose();
  h.assertReleased();
});

for (const failingKind of ['instances', 'geometries']) {
  test(`ledger ${failingKind} failure attempts all later disposals, clears sets, and rethrows the first error`, () => {
    const resources = new resourceModule.SceneResources();
    const disposed = [];
    const owned = {};
    const firstError = new Error('First ledger failure');
    for (const [kind, factory] of Object.entries({
      instances: () => new THREE.InstancedMesh(), geometries: () => new THREE.BufferGeometry(),
      materials: () => new THREE.MeshBasicMaterial(), textures: () => new THREE.Texture(),
    })) {
      owned[kind] = [factory(), factory()];
      owned[kind].forEach((resource, index) => {
        resources[kind].add(resource);
        resource.addEventListener('dispose', () => disposed.push(`${kind}:${index}`));
      });
    }
    owned[failingKind][0].addEventListener('dispose', () => { throw firstError; });
    owned.materials[0].addEventListener('dispose', () => { throw new Error('Later failure'); });
    assert.throws(() => resources.dispose(), (error) => error === firstError);
    assert.deepEqual(disposed, ['instances:0', 'instances:1', 'geometries:0', 'geometries:1', 'materials:0', 'materials:1', 'textures:0', 'textures:1']);
    for (const kind of Object.keys(owned)) assert.equal(resources[kind].size, 0);
    assert.doesNotThrow(() => resources.dispose());
    assert.equal(disposed.length, 8, 'A repeated disposal is inert');
  });

  test(`controller releases renderer/canvas after an early ${failingKind} disposal throws`, () => {
    const h = harness({ ledgerFailure: failingKind });
    const controller = h.mount();
    h.flush();
    assert.doesNotThrow(() => controller.dispose());
    assert.doesNotThrow(() => h.ledger.dispose());
    controller.dispose();
    h.assertReleased();
  });
}

test('loading precedes a successful render; demand updates coalesce and reuse the model', () => {
  const h = harness();
  const controller = h.mount();
  assert.deepEqual(h.statuses, ['loading']);
  assert.equal(h.host.children.length, 1);
  assert.equal(h.canvas.attributes['aria-hidden'], 'true');
  assert.equal(h.canvas.tabIndex, -1);
  assert.equal(h.frames.size, 1);
  h.flush();
  assert.deepEqual(h.statuses, ['loading', 'ready']);
  assert.equal(h.frames.size, 0);
  controller.update({ selectedProjectId: 'copilot', reducedMotion: false });
  controller.update({ selectedProjectId: 'typeforge', reducedMotion: true });
  assert.equal(h.frames.size, 1);
  h.flush();
  controller.update({ selectedProjectId: 'typeforge', reducedMotion: false });
  assert.equal(h.frames.size, 0, 'Motion preference changes need no animated work');
  assert.equal(h.buildCount, 1);
  assert.equal(h.renderers[0].shadowPasses, 1);
  assert.equal(h.renderers[0].dpr, 2);
  controller.dispose();
  controller.dispose();
  h.assertReleased();
});

test('real Three raycasting uses the offset canvas, supports touch, and ignores drags', () => {
  const h = harness();
  const controller = h.mount();
  h.flush();
  for (let index = 0; index < 3; index++) {
    const point = h.pointFor(index);
    tap(h, point);
  }
  assert.deepEqual(h.selections, ['dissertation', 'copilot', 'typeforge']);
  const point = h.pointFor(1);
  h.event('pointerdown', point);
  h.event('pointermove', { x: point.x + 20, y: point.y });
  h.event('pointerup', point);
  finishClick(h, point, 'mouse');
  h.event('pointerdown', point);
  h.event('pointercancel', point);
  h.event('pointerup', point);
  finishClick(h, point, 'mouse');
  assert.equal(h.selections.length, 3);
  h.event('pointermove', point);
  assert.equal(h.canvas.style.cursor, 'pointer');
  controller.update({ selectedProjectId: 'copilot', reducedMotion: false });
  h.event('pointerleave', point);
  assert.equal(h.canvas.style.cursor, '');
  assert.equal(h.model.targets[1].border.color.getHexString(), 'ffc779');
  h.rect.width = 390;
  h.rect.height = 520;
  h.window.innerWidth = 390;
  h.observers[0].callback([]);
  h.flush();
  const resized = h.pointFor(0);
  tap(h, resized, 'mouse');
  assert.equal(h.selections.at(-1), 'dissertation');
  assert.equal(h.renderers[0].dpr, 1.5);
  controller.dispose();
  h.assertReleased();
});

test('desktop and mobile camera projection contains all supplied room bounds', () => {
  for (const mobile of [false, true]) {
    const h = harness({ mobile });
    const controller = h.mount();
    h.flush();
    const camera = h.renderers[0].camera;
    for (const x of [-4.6, 5.2]) for (const y of [0, 4.6]) for (const z of [-2.3, 2.5]) {
      const projected = new THREE.Vector3(x, y, z).project(camera);
      assert.ok(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && Math.abs(projected.z) < 1);
    }
    assert.equal(camera.position.x, mobile ? -4 : -8);
    controller.dispose();
    h.assertReleased();
  }
});

test('sibling model integrates: three real surfaces pick after instancing at both viewport sizes', () => {
  for (const mobile of [false, true]) {
    const h = harness({ mobile, realModel: true });
    const controller = h.mount();
    h.flush();
    assert.deepEqual(h.statuses, ['loading', 'ready']);
    for (let index = 0; index < 3; index++) {
      assert.equal(h.model.targets[index].surface.userData.projectId, h.model.targets[index].id);
      const point = h.pointFor(index);
      tap(h, point);
      assert.equal(h.selections.at(-1), h.model.targets[index].id);
    }
    const bounds = new THREE.Box3().setFromObject(h.model.scene);
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const projected = new THREE.Vector3(x, y, z).project(h.renderers[0].camera);
      assert.ok(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1, 'Actual geometry stays inside the frame');
    }
    controller.dispose();
    h.assertReleased();
  }
});

test('hidden and offscreen scenes cancel work and resume with the latest size', () => {
  const h = harness();
  const controller = h.mount();
  h.document.hidden = true;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.frames.size, 0);
  controller.update({ selectedProjectId: 'copilot', reducedMotion: true });
  h.observers[0].callback([]);
  assert.equal(h.frames.size, 0);
  h.document.hidden = false;
  h.document.dispatchEvent(new Event('visibilitychange'));
  h.flush();
  const intersection = h.observers[1];
  intersection.callback([{ target: h.host, isIntersecting: false }]);
  h.window.dispatchEvent(new Event('resize'));
  assert.equal(h.frames.size, 0);
  h.rect.width = 800;
  intersection.callback([{ target: h.host, isIntersecting: true }]);
  assert.equal(h.frames.size, 1);
  h.flush();
  assert.deepEqual(h.renderers[0].size, [800, 620]);
  controller.dispose();
  h.assertReleased();
});

test('zero-size host waits without a loop or premature ready status', () => {
  const h = harness();
  h.rect.width = 0;
  const controller = h.mount();
  h.flush();
  assert.deepEqual(h.statuses, ['loading']);
  assert.equal(h.frames.size, 0);
  h.rect.width = 900;
  h.observers[0].callback([]);
  h.flush();
  assert.deepEqual(h.statuses, ['loading', 'ready']);
  controller.dispose();
  h.assertReleased();
});

for (const failure of ['rendererFailure', 'modelFailure', 'renderFailure', 'lossDuringRender']) {
  test(`${failure} reports unavailable and releases all acquired resources`, () => {
    const h = harness({ [failure]: true });
    const controller = h.mount();
    h.flush();
    assert.deepEqual(h.statuses, ['loading', 'unavailable']);
    controller.dispose();
    h.assertReleased();
  });
}

test('context loss after ready cleans up once even when renderer disposal throws', () => {
  const h = harness({ disposeFailure: true });
  const controller = h.mount();
  h.flush();
  controller.update({ selectedProjectId: 'copilot', reducedMotion: false });
  h.canvas.dispatchEvent(new Event('webglcontextlost'));
  assert.deepEqual(h.statuses, ['loading', 'ready', 'unavailable']);
  controller.dispose();
  h.assertReleased();
});

test('five mount/cleanup cycles guard retained RAF, observer and event callbacks', () => {
  const h = harness();
  for (let index = 0; index < 5; index++) {
    const controller = h.mount();
    const lateFrame = [...h.frames.values()][0];
    const latePointer = [...h.canvas.listeners.get('pointerup')][0];
    const lateClick = [...(h.canvas.listeners.get('click') ?? [])][0];
    h.flush();
    controller.dispose();
    const statusCount = h.statuses.length;
    lateFrame(0);
    latePointer({});
    lateClick?.({});
    for (const observer of h.observers) observer.callback([{ target: h.host, isIntersecting: true }]);
    controller.update({ selectedProjectId: 'typeforge', reducedMotion: false });
    assert.equal(h.statuses.length, statusCount);
    h.assertReleased();
  }
});

test('React adapter keeps one controller and forwards the latest callbacks and state', () => {
  // Minimal hook scheduling checks the adapter contract; this is not a React/browser StrictMode test.
  const hooks = [];
  let cursor = 0;
  let effects = [];
  const mountedControllers = [];
  const messages = [];
  const react = {
    useRef(value) {
      const slot = cursor++;
      return hooks[slot] ??= { current: value };
    },
    useEffect(effect, dependencies) {
      const slot = cursor++;
      const previous = hooks[slot];
      if (!previous || dependencies.some((value, index) => value !== previous.dependencies[index])) {
        effects.push(() => {
          previous?.cleanup?.();
          hooks[slot] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  const { default: StudioScene } = loadTs('../StudioScene.tsx', {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    './scene/controller': {
      createStudioController(host, props) {
        const instance = { host, props, updates: [], disposals: 0, update(state) { this.updates.push(state); }, dispose() { this.disposals++; } };
        mountedControllers.push(instance);
        props.onStatusChange('loading');
        return instance;
      },
    },
  });
  const host = {};
  function commit(props) {
    cursor = 0;
    const node = StudioScene(props);
    node.props.ref.current = host;
    const queued = effects;
    effects = [];
    queued.forEach((effect) => effect());
  }
  const original = {
    selectedProjectId: null, reducedMotion: false,
    onSelectProject: (id) => messages.push(`old:${id}`),
    onStatusChange: (status) => messages.push(`old:${status}`),
  };
  commit(original);
  commit({
    ...original, selectedProjectId: 'copilot', reducedMotion: true,
    onSelectProject: (id) => messages.push(`new:${id}`),
    onStatusChange: (status) => messages.push(`new:${status}`),
  });
  assert.equal(mountedControllers.length, 1);
  mountedControllers[0].props.onSelectProject('typeforge');
  mountedControllers[0].props.onStatusChange('ready');
  assert.deepEqual(messages, ['old:loading', 'new:typeforge', 'new:ready']);
  assert.equal(mountedControllers[0].updates.at(-1).selectedProjectId, 'copilot');
  assert.equal(mountedControllers[0].updates.at(-1).reducedMotion, true);
  hooks.forEach((hook) => hook.cleanup?.());
  assert.equal(mountedControllers[0].disposals, 1);
});
