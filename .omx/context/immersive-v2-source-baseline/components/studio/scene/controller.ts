import * as THREE from 'three';
import { PROJECT_IDS, type ProjectId, type StudioSceneProps } from '@/lib/studio-contract';
import { createStudio } from './build-studio';
import { SceneResources } from './resources';
import type { StudioModel } from './types';

type SceneState = Pick<StudioSceneProps, 'selectedProjectId' | 'reducedMotion'>;

export interface StudioController {
  update(state: SceneState): void;
  dispose(): void;
}

// Bounds include the desk, wall lights and the whole right-hand music corner.
const CONTENT_MIN = [-4.6, 0, -2.3] as const;
const CONTENT_MAX = [5.2, 4.6, 2.5] as const;
const DRAG_THRESHOLD = 8;
const MIN_TOUCH_TARGET = 44;

function fitCamera(camera: THREE.OrthographicCamera, width: number, height: number, mobile: boolean) {
  if (mobile) camera.position.set(-4, 7, 12);
  else camera.position.set(-8, 6.5, 11.5);
  camera.lookAt(0.3, 1.8, 0);
  camera.updateMatrixWorld(true);
  const projected = new THREE.Box3();
  for (const x of [CONTENT_MIN[0], CONTENT_MAX[0]]) {
    for (const y of [CONTENT_MIN[1], CONTENT_MAX[1]]) {
      for (const z of [CONTENT_MIN[2], CONTENT_MAX[2]]) {
        projected.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
      }
    }
  }
  const center = projected.getCenter(new THREE.Vector3());
  const size = projected.getSize(new THREE.Vector3());
  const aspect = width / height;
  const halfHeight = Math.max(size.y, size.x / aspect) * 0.5 * 1.06;
  camera.left = center.x - halfHeight * aspect;
  camera.right = center.x + halfHeight * aspect;
  camera.top = center.y + halfHeight;
  camera.bottom = center.y - halfHeight;
  camera.updateProjectionMatrix();
}

/** Owns one canvas, one renderer and every subscription for a single mount. */
export function createStudioController(host: HTMLDivElement, props: StudioSceneProps): StudioController {
  const document = host.ownerDocument;
  const window = document.defaultView;
  const resources = new SceneResources();
  const canvas = document.createElement('canvas');
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const cleanups: Array<() => void> = [];
  const shadows: THREE.LightShadow[] = [];
  let renderer: THREE.WebGLRenderer | null = null;
  let model: StudioModel | null = null;
  let surfaces: THREE.Mesh[] = [];
  let disposed = false;
  let ready = false;
  let inView = true;
  let frame: number | null = null;
  let dirty = true;
  let sizeDirty = true;
  let width = 0;
  let height = 0;
  let renderCount = 0;
  let selected = props.selectedProjectId;
  let hovered: ProjectId | null = null;
  let gesture: { pointerId: number; pointerType: string; x: number; y: number; target: ProjectId | null; dragged: boolean } | null = null;
  let activation: { pointerId: number; pointerType: string; x: number; y: number; target: ProjectId } | null = null;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = -1;
  Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', position: 'absolute', inset: '0' });

  function stopFrame() {
    if (frame !== null && window) window.cancelAnimationFrame(frame);
    frame = null;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopFrame();
    gesture = null;
    activation = null;
    // A failed release must not prevent the remaining independent releases.
    const release = (cleanup: () => void) => { try { cleanup(); } catch { /* Context may already be lost. */ } };
    cleanups.splice(0).forEach(release);
    shadows.splice(0).forEach((shadow) => release(() => shadow.dispose()));
    release(() => resources.dispose());
    if (renderer) {
      const ownedRenderer = renderer;
      release(() => ownedRenderer.dispose());
      release(() => ownedRenderer.forceContextLoss());
      renderer = null;
    }
    model?.scene.clear();
    model = null;
    surfaces = [];
    canvas.style.cursor = '';
    canvas.remove();
  }

  function fail() {
    if (disposed) return;
    // Deliver the terminal status while mounted; cleanup also runs if the host callback throws.
    try { props.onStatusChange('unavailable'); } finally { dispose(); }
  }

  function schedule() {
    if (disposed || !window || document.hidden || !inView || !dirty || frame !== null) return;
    frame = window.requestAnimationFrame(render);
  }

  function invalidate(resize = false) {
    if (disposed) return;
    if (resize) cancelPointer();
    dirty = true;
    sizeDirty = sizeDirty || resize;
    schedule();
  }

  function render() {
    frame = null;
    if (disposed || !renderer || !model || !window || document.hidden || !inView) return;
    try {
      if (sizeDirty) {
        const rect = host.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        // Keep loading until the host has an actual visible render area.
        if (width <= 0 || height <= 0) return;
        const mobile = window.innerWidth <= 640 || width / height < 0.9;
        const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        fitCamera(camera, width, height, mobile);
        canvas.dataset.studioDpr = String(dpr);
        sizeDirty = false;
      }
      dirty = false;
      renderer.render(model.scene, camera);
      // Context-loss handlers can dispose the controller synchronously during render.
      if (disposed) return;
      canvas.dataset.studioRenderCount = String(++renderCount);
      canvas.dataset.studioDrawCalls = String(renderer.info.render.calls);
      canvas.dataset.studioTriangles = String(renderer.info.render.triangles);
      canvas.dataset.studioGeometries = String(renderer.info.memory.geometries);
      canvas.dataset.studioTextures = String(renderer.info.memory.textures);
      if (!ready) {
        ready = true;
        props.onStatusChange('ready');
      }
    } catch {
      fail();
    }
  }

  function styleTargets() {
    if (!model || disposed) return;
    for (const target of model.targets) {
      target.border.color.set(target.id === selected ? '#ffc779' : target.id === hovered ? '#fff3d4' : '#6c5942');
    }
    invalidate();
  }

  function setHover(id: ProjectId | null) {
    if (disposed || id === hovered) return;
    hovered = id;
    canvas.style.cursor = id ? 'pointer' : '';
    styleTargets();
  }

  function pick(event: PointerEvent): ProjectId | null {
    if (disposed || !ready || !model || document.hidden || !inView) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    if (Math.abs(pointer.x) > 1 || Math.abs(pointer.y) > 1) return null;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(surfaces, false)[0];
    if (hit) return model.targets.find((target) => target.surface === hit.object)?.id ?? null;
    // Mouse/pen stay precise; touch gets a CSS-pixel footprint without changing visible geometry.
    if (event.pointerType !== 'touch') return null;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest: ProjectId | null = null;
    let nearestDistance = Infinity;
    // Canonical order also resolves equal-distance overlaps, independent of model array order.
    for (const id of PROJECT_IDS) {
      const surface = model.targets.find((target) => target.id === id)!.surface;
      if (!surface.visible) continue;
      if (!surface.geometry.boundingBox) surface.geometry.computeBoundingBox();
      const box = surface.geometry.boundingBox;
      if (!box || box.isEmpty()) continue;
      const bounds = new THREE.Box2();
      const projected = new THREE.Vector3();
      for (const bx of [box.min.x, box.max.x]) {
        for (const by of [box.min.y, box.max.y]) {
          for (const bz of [box.min.z, box.max.z]) {
            projected.set(bx, by, bz).applyMatrix4(surface.matrixWorld).project(camera);
            bounds.expandByPoint(new THREE.Vector2((projected.x + 1) * rect.width / 2, (1 - projected.y) * rect.height / 2));
          }
        }
      }
      const dx = x - (bounds.min.x + bounds.max.x) / 2;
      const dy = y - (bounds.min.y + bounds.max.y) / 2;
      const halfWidth = Math.max(MIN_TOUCH_TARGET, bounds.max.x - bounds.min.x) / 2;
      const halfHeight = Math.max(MIN_TOUCH_TARGET, bounds.max.y - bounds.min.y) / 2;
      // Preserve inclusive edges despite floating-point projection rounding.
      if (Math.abs(dx) > halfWidth + 1e-6 || Math.abs(dy) > halfHeight + 1e-6) continue;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearest = id;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  function pointerDown(event: PointerEvent) {
    if (disposed) return;
    activation = null;
    gesture = null;
    if (!event.isTrusted || !event.isPrimary || event.button !== 0 || sizeDirty) return;
    gesture = { pointerId: event.pointerId, pointerType: event.pointerType, x: event.clientX, y: event.clientY, target: pick(event), dragged: false };
  }

  function pointerMove(event: PointerEvent) {
    if (disposed) return;
    if (activation && (activation.pointerId !== event.pointerId || activation.pointerType !== event.pointerType || Math.hypot(event.clientX - activation.x, event.clientY - activation.y) > DRAG_THRESHOLD)) {
      activation = null;
    }
    if (gesture?.pointerId === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > DRAG_THRESHOLD) {
      gesture.dragged = true;
    }
    if (event.pointerType !== 'touch' && event.isPrimary) setHover(pick(event));
  }

  function pointerUp(event: PointerEvent) {
    if (disposed) return;
    const started = gesture;
    gesture = null;
    activation = null;
    if (!started || started.pointerId !== event.pointerId || started.pointerType !== event.pointerType || started.dragged || !event.isTrusted || !event.isPrimary || event.button !== 0) return;
    if (Math.hypot(event.clientX - started.x, event.clientY - started.y) > DRAG_THRESHOLD) return;
    const id = pick(event);
    if (id && id === started.target) {
      activation = { pointerId: event.pointerId, pointerType: event.pointerType, x: event.clientX, y: event.clientY, target: id };
    }
  }

  function click(event: PointerEvent) {
    if (disposed) return;
    const completed = activation;
    activation = null;
    gesture = null;
    if (!completed || !event.isTrusted || event.target !== canvas || event.button !== 0 || event.detail < 1 || document.hidden || !inView || sizeDirty) return;
    if (event.pointerId !== completed.pointerId || event.pointerType !== completed.pointerType) return;
    // Click coordinates can be rounded; keep the qualified pointerup target and
    // its exact/expanded picking policy rather than raycasting rounded pixels.
    if (Math.hypot(event.clientX - completed.x, event.clientY - completed.y) > DRAG_THRESHOLD) return;
    // Touch compatibility mousedown has now applied its default focus action.
    // The UI owns selection, history, heading focus and scrolling from here.
    props.onSelectProject(completed.target);
  }

  function pointerLeave(event: PointerEvent) {
    if (disposed) return;
    // Touch and non-hover pen can leave after release, before their click.
    // Preserve only that completed pointer; leaving during an active gesture cancels.
    if (!gesture && (activation?.pointerType === 'touch' || activation?.pointerType === 'pen') && event.pointerType === activation.pointerType && activation.pointerId === event.pointerId && event.buttons === 0) {
      setHover(null);
      return;
    }
    cancelPointer();
  }

  function outsideActivation(event: Event) {
    if (event.target !== canvas) cancelPointer();
  }

  function cancelPointer() {
    if (disposed) return;
    gesture = null;
    activation = null;
    setHover(null);
  }

  function visibilityChange() {
    if (disposed) return;
    if (document.hidden) { stopFrame(); cancelPointer(); } else { invalidate(true); }
  }

  function listen(target: EventTarget, type: string, handler: EventListener) {
    target.addEventListener(type, handler, { passive: true });
    cleanups.push(() => target.removeEventListener(type, handler));
  }

  const controller: StudioController = {
    update(state) {
      if (disposed || selected === state.selectedProjectId) return;
      selected = state.selectedProjectId;
      // All preferences use immediate styling: there is no camera/ambient animation to stop.
      styleTargets();
    },
    dispose,
  };

  try {
    props.onStatusChange('loading');
    if (!window) throw new Error('No browser window');
    listen(canvas, 'webglcontextlost', fail);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    const builtModel: StudioModel = createStudio(resources);
    model = builtModel;
    if (builtModel.targets.length !== PROJECT_IDS.length || PROJECT_IDS.some((id) => builtModel.targets.filter((target) => target.id === id).length !== 1)) {
      throw new Error('Studio requires one surface for each project');
    }
    surfaces = builtModel.targets.map((target) => target.surface);
    builtModel.scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight || object instanceof THREE.SpotLight || object instanceof THREE.PointLight) {
        shadows.push(object.shadow);
        object.shadow.autoUpdate = false;
        object.shadow.needsUpdate = true;
      }
    });
    let castingLights = 0;
    builtModel.scene.traverse((object) => { if (object instanceof THREE.Light && object.castShadow) castingLights++; });
    if (castingLights !== 1) throw new Error('Studio requires exactly one static shadow light');
    builtModel.scene.updateMatrixWorld(true);
    host.appendChild(canvas);
    listen(canvas, 'pointerdown', pointerDown as EventListener);
    listen(canvas, 'pointermove', pointerMove as EventListener);
    listen(canvas, 'pointerup', pointerUp as EventListener);
    listen(canvas, 'click', click as EventListener);
    listen(canvas, 'pointercancel', cancelPointer);
    listen(canvas, 'pointerout', pointerLeave as EventListener);
    listen(canvas, 'pointerleave', pointerLeave as EventListener);
    listen(document, 'pointerdown', outsideActivation);
    listen(document, 'click', outsideActivation);
    listen(document, 'visibilitychange', visibilityChange);
    listen(window, 'resize', () => invalidate(true));
    listen(window, 'scroll', cancelPointer);
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => invalidate(true));
      cleanups.push(() => observer.disconnect());
      observer.observe(host);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        if (disposed) return;
        const entry = entries.find((item) => item.target === host);
        if (!entry) return;
        inView = entry.isIntersecting;
        if (inView) invalidate(true); else { stopFrame(); cancelPointer(); }
      });
      cleanups.push(() => observer.disconnect());
      observer.observe(host);
    }
    styleTargets();
  } catch {
    fail();
  }
  return controller;
}
