import * as THREE from 'three';
import { GLTFLoader, type GLTF, type GLTFParser } from 'three/addons/loaders/GLTFLoader.js';
import profile from './runtime-profile.json';
import { RobotResources, ownParser } from './resources';
import type { RobotAsset } from './types';

export const ROBOT_URL = '/studio/assistant-apprentice-v03.glb';
export const ROBOT_PLACEMENT = { position: [0.80, 2.80, -0.20], quaternion: [0, -0.19612, 0, 0.98058], scale: 1.6 } as const;
function requireRobot(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Studio robot: ${message}`);
}
function checkAbort(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Studio robot aborted', 'AbortError');
}
function near(actual: number[], expected: number[]) {
  return actual.length === expected.length && actual.every((value, i) => Number.isFinite(value) && Math.abs(value - expected[i]) < 1e-6);
}

/** Exact bytes are checked before parsing; this also fences loader/schema drift. */
export function validateDefinitions(json: GLTFParser['json']) {
  requireRobot(Object.keys(json).every((key) => ['asset', 'scene', 'scenes', 'nodes', 'materials', 'meshes', 'accessors', 'bufferViews', 'buffers'].includes(key)), 'unsupported format');
  requireRobot(json.asset?.version === '2.0' && json.scene === 0 && json.scenes?.length === 1 && json.scenes[0].nodes?.length === 1, 'single scene/root required');
  requireRobot(json.buffers?.length === 1 && !json.buffers[0].uri, 'embedded buffer required');
  requireRobot(json.nodes?.length === 22 && json.meshes?.length === 21 && json.materials?.length === 7, 'candidate counts differ');
  requireRobot(JSON.stringify(json.materials) === JSON.stringify(profile.materials), 'material definitions differ');
  const seen = new Set<string>();
  for (const node of json.nodes) {
    const binding = profile.bindings.find((item) => item.name === node.name);
    requireRobot(binding && !seen.has(node.name), 'required unique binding missing');
    seen.add(node.name);
    requireRobot(node.matrix === undefined && node.skin === undefined && node.camera === undefined && node.extensions === undefined, 'unsupported node');
    requireRobot(near(node.translation ?? [0, 0, 0], binding.neutral.translation)
      && near(node.rotation ?? [0, 0, 0, 1], binding.neutral.rotationXyzw)
      && near(node.scale ?? [1, 1, 1], [1, 1, 1]), 'neutral transform differs');
    const parents = json.nodes.filter((parent: { children?: number[] }) => parent.children?.includes(json.nodes.indexOf(node)));
    requireRobot(binding.parent ? parents.length === 1 && parents[0].name === binding.parent : parents.length === 0 && json.nodes[json.scenes[0].nodes[0]] === node, 'binding hierarchy differs');
    requireRobot(node.extras?.semanticBinding === node.name && node.extras.movingBinding === binding.moving
      && node.extras.castShadow === false && node.extras.receiveShadow === false
      && node.extras.opaquePickingBlocker === Boolean(binding.material), 'binding policy differs');
    if (!binding.material) { requireRobot(node.mesh === undefined, 'root must be empty'); continue; }
    const primitives = json.meshes[node.mesh]?.primitives;
    requireRobot(primitives?.length === 1, 'single primitive required');
    const primitive = primitives[0];
    requireRobot((primitive.mode ?? 4) === 4 && !primitive.targets && !primitive.extensions, 'plain triangles required');
    requireRobot(Object.keys(primitive.attributes).sort().join(',') === 'NORMAL,POSITION', 'position/normal only');
    const position = json.accessors?.[primitive.attributes.POSITION];
    requireRobot(position?.type === 'VEC3' && position.componentType === 5126
      && Array.isArray(position.min) && Array.isArray(position.max) && position.min.length === 3 && position.max.length === 3
      && position.min.every((value: number, i: number) => Number.isFinite(value) && Number.isFinite(position.max[i]) && value <= position.max[i]), 'POSITION bounds required');
    requireRobot(json.materials[primitive.material]?.name === binding.material, 'material binding differs');
  }
}

export function validateLoaded(gltf: GLTF): Omit<RobotAsset, 'root' | 'dispose'> {
  requireRobot(gltf.scenes.length === 1 && !gltf.animations.length && !gltf.cameras.length, 'unexpected decoded scene');
  const bindings = new Map<string, THREE.Object3D>();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const occluders: THREE.Mesh[] = [];
  let triangles = 0;
  gltf.scene.traverse((node) => {
    if (node === gltf.scene) return;
    const binding = profile.bindings.find((item) => item.name === node.name);
    requireRobot(binding && !bindings.has(node.name), 'unexpected decoded binding');
    bindings.set(node.name, node);
    requireRobot(node.visible && node.layers.mask === 1 && node.matrixAutoUpdate && !node.castShadow && !node.receiveShadow, 'decoded visibility/shadow policy');
    requireRobot((binding.parent ? node.parent?.name === binding.parent : node.parent === gltf.scene)
      && near(node.position.toArray(), binding.neutral.translation)
      && near(node.quaternion.toArray(), binding.neutral.rotationXyzw)
      && near(node.scale.toArray(), [1, 1, 1]), 'decoded transform/hierarchy differs');
    if (!binding.material) { requireRobot(!(node instanceof THREE.Mesh), 'unexpected root mesh'); return; }
    requireRobot(node instanceof THREE.Mesh && !(node instanceof THREE.SkinnedMesh) && !(node instanceof THREE.InstancedMesh), 'plain mesh required');
    requireRobot(!Array.isArray(node.material) && node.material instanceof THREE.MeshStandardMaterial, 'standard single material required');
    const material = node.material;
    const definition = profile.materials.find((item) => item.name === binding.material)!;
    requireRobot(material.name === binding.material && material.visible && !material.transparent && material.opacity === 1
      && material.side === THREE.FrontSide && material.depthTest && material.depthWrite && material.alphaTest === 0
      && material.emissiveIntensity === 1 && material.toneMapped, 'opaque material policy differs');
    requireRobot(!Object.values(material).some((value) => value instanceof THREE.Texture), 'textures forbidden');
    requireRobot(near(material.color.toArray(), definition.pbrMetallicRoughness.baseColorFactor.slice(0, 3))
      && near(material.emissive.toArray(), definition.emissiveFactor ?? [0, 0, 0])
      && near([material.metalness, material.roughness], [definition.pbrMetallicRoughness.metallicFactor, definition.pbrMetallicRoughness.roughnessFactor]), 'appearance differs');
    const geometry = node.geometry;
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    requireRobot(positions?.itemSize === 3 && normals?.count === positions.count && Object.keys(geometry.attributes).sort().join(',') === 'normal,position'
      && !Object.keys(geometry.morphAttributes).length && geometry.index && geometry.index.count % 3 === 0, 'geometry format differs');
    for (let i = 0; i < positions.count; i++) {
      requireRobot([positions.getX(i), positions.getY(i), positions.getZ(i), normals.getX(i), normals.getY(i), normals.getZ(i)].every(Number.isFinite), 'nonfinite geometry');
    }
    for (let i = 0; i < geometry.index.count; i++) requireRobot(geometry.index.getX(i) < positions.count, 'index outside geometry');
    triangles += geometry.index.count / 3;
    geometries.add(geometry); materials.add(material); occluders.push(node);
  });
  requireRobot(bindings.size === 22 && geometries.size === 21 && materials.size === 7 && triangles === profile.triangles, 'decoded counts differ');
  // Surface pieces of the head/body are eligible; tray, hands and bookmark only block.
  const activationNames = ['APA_head', 'APA_face', 'APA_face_rim', 'APA_seam', 'APA_eye_L', 'APA_eye_R', 'APA_pupil_L', 'APA_pupil_R', 'APA_highlight_L', 'APA_highlight_R', 'APA_lid_lower_L', 'APA_lid_lower_R', 'APA_body', 'APA_body_cap', 'APA_collar'];
  return { bindings, occluders, activationSurfaces: occluders.filter((mesh) => activationNames.includes(mesh.name)) };
}

export async function loadRobot(signal: AbortSignal): Promise<RobotAsset> {
  const owner = new RobotResources();
  try {
    checkAbort(signal);
    const response = await fetch(ROBOT_URL, { signal });
    requireRobot(response.ok, 'asset request failed');
    const bytes = await response.arrayBuffer();
    checkAbort(signal);
    requireRobot(bytes.byteLength === profile.bytes, 'candidate size differs');
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (value) => value.toString(16).padStart(2, '0')).join('');
    requireRobot(hash === profile.sha256, 'candidate hash differs');
    checkAbort(signal);
    const loader = new GLTFLoader();
    loader.register((parser) => {
      ownParser(parser, owner);
      return { name: 'studio-robot-owner', beforeRoot() { checkAbort(signal); validateDefinitions(parser.json); return null; } };
    });
    const gltf = await loader.parseAsync(bytes, '');
    owner.collect(gltf.scene);
    checkAbort(signal);
    const validated = validateLoaded(gltf);
    const root = new THREE.Group();
    root.name = 'StudioAssistantPlacement';
    root.position.fromArray(ROBOT_PLACEMENT.position);
    root.quaternion.fromArray(ROBOT_PLACEMENT.quaternion).normalize();
    root.scale.setScalar(ROBOT_PLACEMENT.scale);
    root.add(gltf.scene);
    root.updateMatrixWorld(true);
    return { root, ...validated, dispose() {
      try { root.removeFromParent(); } finally { owner.dispose(); }
    } };
  } catch (error) {
    owner.dispose();
    throw error;
  }
}
