import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { GLTFParser } from 'three/addons/loaders/GLTFLoader.js';
import profile from '@/design/studio-v2/asset-pipeline/full-kit/full-kit-profile-v1.json';
import inventory from '@/design/studio-v2/asset-pipeline/full-kit/asset-inventory.json';
import fixtureManifest from '@/design/studio-v2/asset-pipeline/full-kit/technical/fixtures/baseline.manifest.json';
import { inspectFullKit, checkManifest, textureSlots, requireFullKit } from '@/design/studio-v2/asset-pipeline/full-kit/technical/profile-core.mjs';
import { fullKitCertificates, type StudioFullKitAsset } from './full-kit-types';

// Explicit internal CPU fixture selection. Not installed or wired into production.
// Root integration replaces BOTH the URL and its hash-bound manifest after M1.
const candidate = { url: '/studio/full-kit-uninstalled-synthetic-baseline.glb', manifest: fixtureManifest };
const identity = new THREE.Matrix4();
const requireKit: (condition: unknown, message: string) => asserts condition = requireFullKit;
function checkAbort(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Studio full kit aborted', 'AbortError');
}

/** Private per-request owner; never closes images borrowed from another loader/cache. */
class FullKitResources {
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

async function decodeImage(blob: Blob, signal: AbortSignal, owner: FullKitResources): Promise<ImageBitmap | HTMLImageElement> {
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
      image.onerror = () => { cleanup(); reject(new Error('Studio full kit image decode failed')); };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort(); else image.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

/** r187-specific bounded hooks: own allocations before promises can reject. */
function trackParser(parser: GLTFParser, owner: FullKitResources, signal: AbortSignal) {
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
    const attributes: Record<string, string> = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', COLOR_0: 'color' };
    const pending = Object.entries(attributes).filter(([key]) => primitive.attributes[key] !== undefined).map(([key, name]) => parser.getDependency('accessor', primitive.attributes[key]).then((attribute) => geometry.setAttribute(name, attribute)));
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

type Inspection = ReturnType<typeof inspectFullKit>;

function validateLoaded(gltf: GLTF, inspection: Inspection) {
  const { doc, accessors } = inspection;
  requireKit(gltf.scenes.length === 1 && !gltf.animations.length && !gltf.cameras.length && gltf.scene.matrix.equals(identity), 'loaded scene identity');
  const objects = new Map<number, THREE.Object3D>();
  const meshes = new Map<string, THREE.Mesh>();
  gltf.scene.traverse((object) => {
    if (object === gltf.scene) return;
    const index = gltf.parser.associations.get(object)?.nodes;
    requireKit(index !== undefined && !objects.has(index), 'loaded node association');
    objects.set(index, object);
  });
  requireKit(objects.size === doc.nodes.length, 'loaded node inventory');
  const images = new Set<{ width: number; height: number }>();
  const meshIdentities = new Map<number, { geometry: THREE.BufferGeometry; material: THREE.Material }>();
  for (const definition of inspection.snapshot.nodes) {
    const object = objects.get(definition.index)!;
    object.updateMatrix();
    requireKit(object.name === definition.name && object.matrix.elements.every((v, i) => Math.abs(v - definition.transform[i]) < 1e-6), 'loaded name/transform');
    requireKit(object.parent === (definition.parent === null ? gltf.scene : gltf.scene.getObjectByName(definition.parent)), 'loaded hierarchy');
    for (const [key, value] of Object.entries(definition.extras)) requireKit(object.userData[key] === value || JSON.stringify(object.userData[key]) === JSON.stringify(value), 'loaded metadata');
    if (definition.meshIndex === null) { requireKit(!(object instanceof THREE.Mesh), 'loaded group'); continue; }
    requireKit(object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && object.children.length === 0, 'loaded single mesh leaf');
    const material = object.material;
    const rawMaterial = doc.materials[definition.materialIndex!];
    requireKit(material instanceof THREE.MeshStandardMaterial && material.name === rawMaterial.name && material.visible && material.alphaTest === 0, 'loaded material');
    requireKit(material.transparent === object.userData.transparent && (material.transparent || material.opacity === 1), 'loaded opacity');
    requireKit(material.side === (rawMaterial.doubleSided ? THREE.DoubleSide : THREE.FrontSide), 'loaded material side');
    requireKit([material.roughness, material.metalness, material.emissiveIntensity, ...material.color.toArray(), ...material.emissive.toArray()].every(Number.isFinite), 'loaded material finite');
    const record = material as unknown as Record<string, unknown>;
    for (const { slot, textureIndex } of textureSlots(rawMaterial)) {
      const texture = record[slot];
      requireKit(texture instanceof THREE.Texture && texture.image, `required decoded slot ${material.name}.${slot} missing`);
      const image = texture.image;
      const expected = inspection.images[doc.textures[textureIndex].source];
      requireKit(image.width === expected.width && image.height === expected.height, 'decoded image dimensions differ from bytes');
      images.add(image);
    }
    const primitive = doc.meshes[definition.meshIndex].primitives[0];
    const names: Record<string, string> = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', COLOR_0: 'color' };
    requireKit(Object.keys(object.geometry.attributes).length === Object.keys(primitive.attributes).length, 'loaded attribute set');
    for (const [semantic, name] of Object.entries(names)) {
      const rawIndex = primitive.attributes[semantic];
      if (rawIndex === undefined) continue;
      const expected = accessors[rawIndex], attribute = object.geometry.getAttribute(name);
      requireKit(attribute && attribute.count === expected.count && attribute.itemSize === expected.values[0].length, 'loaded attribute layout');
      for (let i = 0; i < attribute.count; i++) for (let c = 0; c < attribute.itemSize; c++) {
        const value = attribute.getComponent(i, c);
        requireKit(Number.isFinite(value) && Math.abs(value - expected.values[i][c]) < 1e-6, `loaded ${semantic} differs from bytes`);
      }
    }
    requireKit(material.vertexColors === (primitive.attributes.COLOR_0 !== undefined), 'loaded COLOR_0 material path');
    const expectedIndices = inspection.meshes[definition.meshIndex].indices, index = object.geometry.index;
    requireKit((index?.count ?? object.geometry.getAttribute('position').count) === expectedIndices.length, 'loaded triangle count');
    expectedIndices.forEach((value: number, i: number) => requireKit((index ? index.getX(i) : i) === value, 'loaded indices'));
    const shared = meshIdentities.get(definition.meshIndex);
    if (shared) requireKit(shared.geometry === object.geometry && shared.material === material, 'linked mesh identity lost');
    else meshIdentities.set(definition.meshIndex, { geometry: object.geometry, material });
    material.depthWrite = !material.transparent;
    object.castShadow = !object.userData.nocast;
    object.receiveShadow = object.userData.receiveShadow;
    if (material.transparent) object.renderOrder = definition.renderOrder!;
    meshes.set(object.name, object);
  }
  requireKit(Array.from(images).reduce((sum, image) => sum + image.width * image.height, 0) <= profile.materials.maxUniqueImagePixels, 'decoded pixel budget');
  return meshes;
}

/** One byte-bound candidate, private parser and allocation owner per request. */
export async function loadFullKit(signal: AbortSignal): Promise<StudioFullKitAsset> {
  const owner = new FullKitResources();
  const abort = () => owner.dispose();
  signal.addEventListener('abort', abort, { once: true });
  try {
    checkAbort(signal);
    const response = await fetch(candidate.url, { signal });
    requireKit(response.ok, `HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    checkAbort(signal);
    requireKit(bytes.byteLength <= profile.guards.maxRawGlbBytes, 'raw byte guard');
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    requireKit(Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('') === candidate.manifest.glbSha256, 'candidate byte hash');
    const inspection = inspectFullKit(bytes, profile, inventory, candidate.manifest.variant);
    checkManifest(candidate.manifest, inspection, profile);
    checkAbort(signal);
    const loader = new GLTFLoader();
    loader.register((parser) => {
      trackParser(parser, owner, signal);
      return { name: 'STUDIO_PRIVATE_FULL_KIT', beforeRoot: async () => { checkAbort(signal); } };
    });
    const gltf = await owner.track(loader.parseAsync(bytes, ''));
    owner.collect(gltf.scene);
    checkAbort(signal);
    const meshes = validateLoaded(gltf, inspection);
    const root = new THREE.Group();
    root.name = profile.coordinates.placementNode;
    root.position.fromArray(profile.coordinates.translation);
    root.scale.fromArray(profile.coordinates.scale);
    root.add(gltf.scene);
    root.updateMatrixWorld(true);
    fullKitCertificates.set(root, { meshes, bound: false, assertIntact() {
      requireKit(root.children.length === 1 && root.children[0] === gltf.scene && root.position.toArray().every((v, i) => v === profile.coordinates.translation[i]) && root.scale.toArray().every((v, i) => v === profile.coordinates.scale[i]) && root.quaternion.equals(new THREE.Quaternion()), 'placement changed before binding');
      validateLoaded(gltf, inspection);
    } });
    let disposed = false;
    return { root, dispose() {
      if (disposed) return;
      disposed = true;
      fullKitCertificates.delete(root);
      root.removeFromParent();
      root.clear();
      // Never collect/traverse the rebound tree here: runtime replacements are borrowed.
      owner.dispose();
    } };
  } catch (error) { owner.dispose(); throw error; }
  finally { signal.removeEventListener('abort', abort); }
}

