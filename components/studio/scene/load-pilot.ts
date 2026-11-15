import * as THREE from 'three';
import { GLTFLoader, type GLTF, type GLTFParser } from 'three/addons/loaders/GLTFLoader.js';
import profile from '@/design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json';
import type { StudioPilotAsset } from './types';

const URL_PATH = '/studio/pilot-right-limit-v03.glb';
const identity = new THREE.Matrix4();

function requirePilot(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Studio pilot: ${message}`);
}

function checkAbort(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Studio pilot aborted', 'AbortError');
}

/** Private per-request owner; never closes images borrowed from another loader/cache. */
class PilotResources {
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private bitmaps = new Set<ImageBitmap>();
  private pending = 0;
  private closed = false;
  private released = new WeakSet<object>();

  collect(value: unknown): void {
    if (value instanceof THREE.BufferGeometry) this.geometries.add(value);
    if (value instanceof THREE.Texture) this.textures.add(value);
    if (value instanceof THREE.Material) {
      this.materials.add(value);
      // Includes extension slots such as specularColorMap, not only map.
      Object.values(value).forEach((slot) => { if (slot instanceof THREE.Texture) this.textures.add(slot); });
    }
    if (value instanceof THREE.Object3D) value.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      this.collect(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => this.collect(material));
    });
    if (Array.isArray(value)) value.forEach((item) => this.collect(item));
  }

  bitmap(value: ImageBitmap) { this.bitmaps.add(value); }

  track<T>(promise: Promise<T>): Promise<T> {
    this.pending++;
    return promise.then((value) => {
      this.collect(value);
      this.pending--;
      this.drain();
      return value;
    }, (error: unknown) => {
      this.pending--;
      this.drain();
      throw error;
    });
  }

  dispose() { this.closed = true; this.drain(); }

  private drain() {
    // Rejected parse can leave sibling material/image promises running. Wait
    // until those settle so a shared bitmap closes after every texture release.
    if (!this.closed || this.pending) return;
    const release = <T extends object>(entries: Set<T>, cleanup: (entry: T) => void) => {
      for (const entry of Array.from(entries)) {
        if (this.released.has(entry)) continue;
        this.released.add(entry);
        try { cleanup(entry); } catch { /* Independent releases must still run. */ }
      }
      entries.clear();
    };
    release(this.geometries, (item) => item.dispose());
    release(this.materials, (item) => item.dispose());
    release(this.textures, (item) => item.dispose());
    release(this.bitmaps, (item) => item.close());
  }
}

function validateDefinitions(parser: GLTFParser) {
  const json = parser.json;
  const names = Object.keys(profile.nodes);
  requirePilot(json.scenes?.length === 1 && (json.scene ?? 0) === 0 && json.nodes?.length === names.length, 'single nine-node scene required');
  requirePilot(!json.animations?.length && !json.skins?.length && !json.cameras?.length, 'static meshes only');
  requirePilot((json.extensionsUsed ?? []).every((name: string) => profile.allowedExtensions.includes(name)), 'unsupported extension');
  requirePilot((json.extensionsRequired ?? []).every((name: string) => profile.allowedExtensions.includes(name)), 'unsupported required extension');
  requirePilot(json.buffers?.length === 1 && !json.buffers[0].uri, 'embedded binary buffer required');
  requirePilot((json.images ?? []).every((image: { uri?: string; bufferView?: number; mimeType?: string }) => !image.uri && Number.isInteger(image.bufferView) && profile.imageMimeTypes.includes(image.mimeType ?? '')), 'embedded PNG/JPEG required');
  const roots = json.scenes[0].nodes;
  requirePilot(roots?.length === names.length && new Set(roots).size === names.length, 'unique direct roots required');
  const seen = new Set<string>();
  for (const index of roots) {
    const node = json.nodes[index];
    requirePilot(node && names.includes(node.name) && !seen.has(node.name), 'unexpected or repeated node name');
    seen.add(node.name);
    requirePilot(!node.children?.length && node.skin === undefined && node.camera === undefined, 'unexpected hierarchy');
    const matrix = node.matrix ? new THREE.Matrix4().fromArray(node.matrix) : new THREE.Matrix4().compose(
      new THREE.Vector3().fromArray(node.translation ?? [0, 0, 0]),
      new THREE.Quaternion().fromArray(node.rotation ?? [0, 0, 0, 1]),
      new THREE.Vector3().fromArray(node.scale ?? [1, 1, 1]),
    );
    requirePilot(matrix.equals(identity), 'node placement must be baked');
    requirePilot(node.extras?.pilot === 'right-limit' && node.extras.occluder === true && !node.extras.transparent && !node.extras.interactive, 'invalid occlusion metadata');
    requirePilot(node.extras.nocast === undefined || typeof node.extras.nocast === 'boolean', 'invalid shadow metadata');
    const primitives = json.meshes?.[node.mesh]?.primitives;
    requirePilot(primitives?.length > 0 && primitives.length <= profile.limits.primitives, 'missing mesh primitives');
    for (const primitive of primitives) {
      requirePilot((primitive.mode ?? 4) === 4 && !primitive.targets && !primitive.extensions, 'plain triangles required');
      requirePilot(json.materials?.[primitive.material]?.name === profile.nodes[node.name as keyof typeof profile.nodes], 'wrong named material');
      requirePilot(['POSITION', 'NORMAL', 'TEXCOORD_0'].every((key) => Number.isInteger(primitive.attributes?.[key])), 'position/normal/UV required');
      requirePilot(Object.keys(primitive.attributes).every((key) => ['POSITION', 'NORMAL', 'TEXCOORD_0'].includes(key)), 'unsupported vertex attribute');
    }
  }
}

async function decodeImage(blob: Blob, signal: AbortSignal, owner: PilotResources): Promise<ImageBitmap | HTMLImageElement> {
  checkAbort(signal);
  if (typeof createImageBitmap === 'function') {
    const image = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    owner.bitmap(image);
    checkAbort(signal);
    return image;
  }
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      const cleanup = () => { image.onload = null; image.onerror = null; signal.removeEventListener('abort', abort); };
      const abort = () => { cleanup(); image.src = ''; reject(new DOMException('Studio image aborted', 'AbortError')); };
      image.onload = () => { cleanup(); resolve(image); };
      image.onerror = () => { cleanup(); reject(new Error('Studio pilot image decode failed')); };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort(); else image.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

/** r187-specific bounded hooks: own allocations before promises can reject. */
function trackParser(parser: GLTFParser, owner: PilotResources, signal: AbortSignal) {
  const dependency = parser.getDependency.bind(parser);
  parser.getDependency = (type, index) => owner.track(dependency(type, index));
  const assignMaterial = parser.assignFinalMaterial.bind(parser);
  parser.assignFinalMaterial = (mesh) => {
    try { assignMaterial(mesh); } finally { owner.collect(mesh); }
  };
  const images = new Map<number, Promise<THREE.Texture>>();
  // r187 loadTextureImage swallows decode rejection and returns null. Allocate
  // the texture here, avoid global bitmap caches/object-URL failure leaks, and
  // still validate every required loaded slot after parse resolves.
  parser.loadImageSource = (index) => {
    const cached = images.get(index);
    if (cached) return owner.track(cached.then((texture) => { const clone = texture.clone(); owner.collect(clone); return clone; }));
    const texture = new THREE.Texture();
    owner.collect(texture);
    const source = parser.json.images[index];
    const promise = owner.track(parser.getDependency('bufferView', source.bufferView).then(async (buffer: ArrayBuffer) => {
      texture.image = await decodeImage(new Blob([buffer], { type: source.mimeType }), signal, owner);
      texture.needsUpdate = true;
      texture.userData.mimeType = source.mimeType;
      return texture;
    }));
    images.set(index, promise);
    return promise;
  };
  // The stock implementation allocates before accessor promises settle but
  // exposes only a result promise. This narrow triangle path registers the
  // geometry first, retaining original accessors, normals and UV data unchanged.
  const geometries = new Map<object, Promise<THREE.BufferGeometry>>();
  parser.loadGeometries = (primitives) => Promise.all(primitives.map((primitive) => {
    const cached = geometries.get(primitive);
    if (cached) return cached;
    const geometry = new THREE.BufferGeometry();
    owner.collect(geometry);
    const attributes: Record<string, string> = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv' };
    const pending = Object.entries(attributes).map(([key, name]) => parser.getDependency('accessor', primitive.attributes[key]).then((attribute) => geometry.setAttribute(name, attribute)));
    if (primitive.indices !== undefined) pending.push(parser.getDependency('accessor', primitive.indices).then((attribute) => geometry.setIndex(attribute)));
    const promise = owner.track(Promise.all(pending).then(() => {
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      return geometry;
    }));
    geometries.set(primitive, promise);
    return promise;
  }));
}

function validateLoaded(gltf: GLTF) {
  const scene = gltf.scene;
  requirePilot(gltf.scenes.length === 1 && !gltf.animations.length && !gltf.cameras.length && scene.matrix.equals(identity), 'invalid loaded scene');
  requirePilot(scene.children.length === Object.keys(profile.nodes).length, 'invalid loaded roots');
  const seen = new Set<string>();
  const images = new Set<{ width: number; height: number }>();
  const bounds = { door: new THREE.Box3(), lamp: new THREE.Box3() };
  let triangles = 0;
  let primitives = 0;
  for (const node of scene.children) {
    const expected = profile.nodes[node.name as keyof typeof profile.nodes];
    requirePilot(expected && !seen.has(node.name) && node.matrix.equals(identity), 'invalid loaded node');
    seen.add(node.name);
    requirePilot(node.userData.pilot === 'right-limit' && node.userData.occluder === true && !node.userData.transparent && !node.userData.interactive, 'invalid loaded metadata');
    const meshes = node instanceof THREE.Mesh ? [node] : node.children;
    requirePilot(meshes.length > 0, 'empty loaded node');
    for (const object of meshes) {
      requirePilot(object instanceof THREE.Mesh && !object.children.length && object.matrix.equals(identity), 'nonstatic loaded mesh');
      const material = object.material;
      requirePilot(material instanceof THREE.MeshStandardMaterial && material.name === expected && material.visible && !material.transparent && material.opacity === 1 && material.alphaTest === 0 && material.depthWrite, 'invalid loaded material');
      requirePilot([material.roughness, material.metalness, material.emissiveIntensity, ...material.color.toArray(), ...material.emissive.toArray()].every(Number.isFinite), 'nonfinite material');
      if (expected === 'lib_oak') requirePilot(material.map, 'oak base color decode missing');
      if (expected === 'lib_linen_shade') requirePilot(material.map && material.emissiveMap, 'linen base color/emissive decode missing');
      for (const slot of Object.values(material)) if (slot instanceof THREE.Texture) {
        const image = slot.image;
        requirePilot(image && image.width > 0 && image.height > 0 && image.width <= profile.limits.imageDimension && image.height <= profile.limits.imageDimension, 'missing or invalid decoded image');
        images.add(image);
      }
      const position = object.geometry.getAttribute('position');
      for (const name of ['position', 'normal', 'uv']) {
        const attribute = object.geometry.getAttribute(name);
        requirePilot(attribute && attribute.count === position.count, 'invalid geometry attributes');
        for (let i = 0; i < attribute.count; i++) for (let c = 0; c < attribute.itemSize; c++) requirePilot(Number.isFinite(attribute.getComponent(i, c)), 'nonfinite geometry');
      }
      const index = object.geometry.index;
      const count = index?.count ?? position.count;
      requirePilot(count > 0 && count % 3 === 0, 'invalid triangle count');
      if (index) for (let i = 0; i < index.count; i++) requirePilot(index.getX(i) < position.count, 'invalid triangle index');
      triangles += count / 3;
      primitives++;
      object.castShadow = node.userData.nocast !== true;
      object.receiveShadow = true;
      // Never mark an imported decoration interactive: every opaque mesh,
      // including the non-shadow-casting bulb, belongs in the live blockers.
      bounds[node.name.startsWith('pilot_door_') ? 'door' : 'lamp'].union(new THREE.Box3().setFromObject(object));
    }
  }
  requirePilot(triangles <= profile.limits.triangles && primitives <= profile.limits.primitives, 'geometry budget exceeded');
  requirePilot(Array.from(images).reduce((sum, image) => sum + image.width * image.height, 0) <= profile.limits.totalImagePixels, 'decoded image budget exceeded');
  for (const key of ['door', 'lamp'] as const) {
    const box = bounds[key];
    const limit = profile.boundsMetres[key];
    const size = box.getSize(new THREE.Vector3());
    requirePilot(size.y >= limit.minHeight && size.y <= limit.maxHeight, 'invalid baked height');
    (['x', 'y', 'z'] as const).forEach((axis, i) => requirePilot(box.min[axis] >= limit.min[i] - 1e-5 && box.max[axis] <= limit.max[i] + 1e-5, 'invalid baked placement'));
  }
}

/** One fetch and privately owned parser per mount; no shared asset cache. */
export async function loadStudioPilot(signal: AbortSignal): Promise<StudioPilotAsset> {
  const owner = new PilotResources();
  const abort = () => owner.dispose();
  signal.addEventListener('abort', abort, { once: true });
  try {
    checkAbort(signal);
    const response = await fetch(URL_PATH, { signal });
    requirePilot(response.ok, `HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    checkAbort(signal);
    requirePilot(bytes.byteLength > 0 && bytes.byteLength <= profile.limits.fileBytes, 'invalid file size');
    const loader = new GLTFLoader();
    loader.register((parser) => {
      trackParser(parser, owner, signal);
      return { name: 'STUDIO_PRIVATE_PILOT', beforeRoot: async () => { checkAbort(signal); validateDefinitions(parser); } };
    });
    const gltf = await owner.track(loader.parseAsync(bytes, ''));
    owner.collect(gltf.scene);
    checkAbort(signal);
    validateLoaded(gltf);
    const root = new THREE.Group();
    root.name = 'studio-pilot-placement';
    root.scale.fromArray(profile.adapter.scale);
    root.position.fromArray(profile.adapter.translation);
    root.add(gltf.scene);
    root.updateMatrixWorld(true);
    let disposed = false;
    return { root, dispose() {
      if (disposed) return;
      disposed = true;
      root.removeFromParent();
      root.clear();
      owner.dispose();
    } };
  } catch (error) {
    owner.dispose();
    throw error;
  } finally { signal.removeEventListener('abort', abort); }
}
