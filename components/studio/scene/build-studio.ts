import * as THREE from 'three';
import { SceneResources, makePrimitives, instanceStaticMeshes } from './resources';
import {
  contactTexture, duskTexture, fabricTexture, floorTexture, plasterTexture, screenTexture, woodTexture,
} from './textures';
import type { StudioModel, StudioTarget } from './types';

type XYZ = readonly [number, number, number];

/** Flat-faced tapered cap with a unit footprint: a sculpted keycap rather than a cube. */
function keycapGeometry() {
  const geometry = new THREE.CylinderGeometry(0.56, Math.SQRT1_2, 1, 4, 1).toNonIndexed();
  geometry.rotateY(Math.PI / 4);
  geometry.computeVertexNormals();
  return geometry;
}

/** True-radius bevelled slab; UVs span the top once so timber grain follows the long edge. */
function slabGeometry(width: number, thickness: number, depth: number, corner: number, bevel: number) {
  const w = width / 2 - bevel;
  const d = depth / 2 - bevel;
  const shape = new THREE.Shape();
  shape.moveTo(-w + corner, -d);
  shape.lineTo(w - corner, -d);
  shape.quadraticCurveTo(w, -d, w, -d + corner);
  shape.lineTo(w, d - corner);
  shape.quadraticCurveTo(w, d, w - corner, d);
  shape.lineTo(-w + corner, d);
  shape.quadraticCurveTo(-w, d, -w, d - corner);
  shape.lineTo(-w, -d + corner);
  shape.quadraticCurveTo(-w, -d, -w + corner, -d);
  const core = thickness - bevel * 2;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: core, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 5,
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, core / 2, 0);
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let index = 0; index < position.count; index++) {
    uv.setXY(index, position.getX(index) / width + 0.5, position.getZ(index) / depth + 0.5);
  }
  return geometry;
}

/**
 * Runtime response of the imported door and lamp, set on the loader's own material objects
 * (found by profile name, absolute values, so repeating it changes nothing). Authored against
 * the real renderer: one shadow sun, no bounce, no environment map, ACES at exposure 1.2.
 */
function tunePilotMaterials(pilotRoot: THREE.Group) {
  const seen = new Set<THREE.Material>();
  pilotRoot.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = object.material;
    if (!(material instanceof THREE.MeshStandardMaterial) || seen.has(material)) return;
    seen.add(material);
    switch (material.name) {
      case 'lib_linen_shade':
        // The glow carries the shade: less surface response, a lower and creamier emissive,
        // so the map's warm core and darker head and foot show without clipping.
        material.color.setRGB(0.62, 0.62, 0.62);
        material.emissive.setRGB(0.8, 1, 1.5);
        material.emissiveIntensity = 1.25;
        break;
      case 'lib_linen_trim':
        // Bands and seam sit a step below the linen so they read against it.
        material.emissiveIntensity = 0.2;
        break;
      case 'lib_dark_oak':
        // Twice the exported value: the architrave separates from the wall, still below the leaf.
        material.color.setRGB(0.2045, 0.1225, 0.0687);
        break;
      case 'lib_brass':
        // Fully metallic brass is black with no environment to reflect; match the room's brass.
        material.metalness = 0.6;
        break;
    }
  });
}

/**
 * Original, deliberately stylised studio; no imported models or product claims.
 * The room is a closed box seen from one fixed eye (see view-config.ts), so every
 * prop is placed by its sightline from that point and no exterior face can show.
 *
 * Without `pilotRoot` the whole room is procedural. With it, the imported door and floor
 * lamp stand in for the procedural pair and everything else is built exactly as before.
 */
export function createStudio(resources: SceneResources, pilotRoot: THREE.Group | null = null): StudioModel {
  const scene = new THREE.Scene();
  scene.name = 'After-hours studio';
  const p = makePrimitives(resources);
  const targets: StudioTarget[] = [];
  const named = <T extends THREE.Material>(name: string, material: T) => {
    material.name = name;
    return resources.material(material);
  };
  const standard = (name: string, colour: number, roughness = 0.65, metalness = 0) =>
    named(name, new THREE.MeshStandardMaterial({ color: colour, roughness, metalness }));
  const timberMap = woodTexture(resources);
  const m = {
    wall: named('wall', new THREE.MeshStandardMaterial({ map: plasterTexture(resources), color: 0x454a40, roughness: 0.96 })),
    ceiling: standard('ceiling', 0x30332d, 0.98),
    floor: named('floor', new THREE.MeshStandardMaterial({ map: floorTexture(resources), roughness: 0.72 })),
    timber: named('timber', new THREE.MeshStandardMaterial({ map: timberMap, roughness: 0.56 })),
    darkTimber: named('dark timber', new THREE.MeshStandardMaterial({ map: timberMap, color: 0x8a7663, roughness: 0.7 })),
    rug: named('rug', new THREE.MeshStandardMaterial({ map: fabricTexture(resources), color: 0x525850, roughness: 1 })),
    fabric: standard('fabric', 0x454b47, 0.98),
    seam: standard('seam', 0x727365, 0.97),
    black: standard('black', 0x202725, 0.54),
    rubber: standard('rubber', 0x151a19, 0.98),
    metal: standard('metal', 0x969a91, 0.32, 0.7),
    brass: standard('brass', 0xb69b68, 0.38, 0.65),
    ivory: standard('ivory', 0xe3e1d2, 0.37),
    cream: standard('cream', 0xf0e5cc, 0.55),
    pink: standard('pink', 0xd2a69e, 0.62),
    sage: standard('sage', 0x9eaf99, 0.62),
    blue: standard('blue', 0x9eafb8, 0.62),
    yellow: standard('yellow', 0xd8bd83, 0.62),
    leaf: standard('leaf', 0x5d7758, 0.8),
    coffee: standard('coffee', 0x382117, 0.25),
    glow: named('glow', new THREE.MeshStandardMaterial({
      color: 0xffdb9e, emissive: 0xffae52, emissiveIntensity: 1.1, roughness: 0.6,
    })),
    shade: named('shade', new THREE.MeshStandardMaterial({
      color: 0xf1e0bd, emissive: 0xffb866, emissiveIntensity: 0.7, roughness: 0.9,
    })),
    dusk: named('dusk', new THREE.MeshBasicMaterial({ map: duskTexture(resources), toneMapped: false })),
    frost: named('frost', new THREE.MeshStandardMaterial({
      color: 0xe4ede3, roughness: 0.9, transparent: true, opacity: 0.42,
      depthWrite: false, side: THREE.FrontSide,
    })),
    glass: named('glass', new THREE.MeshStandardMaterial({
      color: 0xb1bbb2, roughness: 0.53, transparent: true, opacity: 0.23,
      depthWrite: false, side: THREE.FrontSide,
    })),
  };
  const disc = resources.geometry(new THREE.CircleGeometry(1, 24));
  const triangle = resources.geometry(new THREE.CylinderGeometry(1, 1, 1, 3));
  const headband = resources.geometry(new THREE.TorusGeometry(1, 0.075, 6, 24, Math.PI));
  const keycap = resources.geometry(keycapGeometry());
  const shadowMaterial = named('contact', new THREE.MeshBasicMaterial({
    map: contactTexture(resources), transparent: true, depthWrite: false,
    color: 0x100d0a, opacity: 0.75, side: THREE.FrontSide, toneMapped: false,
  }));

  function group(name: string, position: XYZ, parent: THREE.Object3D = scene) {
    const result = new THREE.Group();
    result.name = name;
    result.position.set(...position);
    parent.add(result);
    return result;
  }
  function block(parent: THREE.Object3D, material: THREE.Material, position: XYZ, scale: XYZ, round = false, shadow = true) {
    return p.mesh(parent, round ? p.rounded : p.box, material, position, scale, [0, 0, 0], shadow);
  }
  /** Architecture and wall dressing receive the key light's shadows but never cast them. */
  function fixed(parent: THREE.Object3D, material: THREE.Material, position: XYZ, scale: XYZ, round = false) {
    return block(parent, material, position, scale, round, false);
  }
  function contact(parent: THREE.Object3D, position: XYZ, width: number, depth: number) {
    const shadow = p.mesh(parent, p.plane, shadowMaterial, position, [width, depth, 1], [-Math.PI / 2, 0, 0], false);
    shadow.receiveShadow = false;
    shadow.renderOrder = 1;
  }
  function foot(parent: THREE.Object3D, x: number, z: number) {
    block(parent, m.rubber, [x, 0.105, z], [0.22, 0.09, 0.3], true);
  }

  // Closed shell: inner faces at x -4.5/5.1, z -2.12/6.6, floor 0.11, ceiling 5.3.
  const room = group('Enclosed studio shell', [0, 0, 0]);
  fixed(room, m.floor, [0.3, 0.055, 2.2], [9.9, 0.11, 9]);
  fixed(room, m.ceiling, [0.3, 5.4, 2.2], [9.9, 0.2, 9]);
  fixed(room, m.wall, [0.3, 2.7, -2.22], [9.9, 5.4, 0.2]);
  fixed(room, m.wall, [0.3, 2.7, 6.7], [9.9, 5.4, 0.2]);
  fixed(room, m.wall, [-4.6, 2.7, 2.2], [0.2, 5.4, 9]);
  fixed(room, m.wall, [5.2, 2.7, 2.2], [0.2, 5.4, 9]);
  // Continuous skirting and cornice close every wall join.
  for (const [y, height, depth, material] of [[0.22, 0.22, 0.05, m.black], [5.24, 0.12, 0.08, m.ceiling]] as const) {
    fixed(room, material, [0.3, y, -2.12 + depth / 2], [9.6, height, depth]);
    fixed(room, material, [0.3, y, 6.6 - depth / 2], [9.6, height, depth]);
    fixed(room, material, [-4.5 + depth / 2, y, 2.24], [depth, height, 8.72]);
    fixed(room, material, [5.1 - depth / 2, y, 2.24], [depth, height, 8.72]);
  }
  for (const z of [-0.9, 1.1, 3.1, 5.1]) {
    fixed(room, m.darkTimber, [0.3, 5.19, z], [9.6, 0.22, 0.24]);
  }

  const rug = fixed(room, m.rug, [2.75, 0.13, 0.3], [3.7, 0.035, 4.5], true);
  rug.name = 'Music corner rug';
  for (const z of [-1.84, 2.44]) {
    fixed(room, m.seam, [2.75, 0.15, z], [3.44, 0.008, 0.018]);
  }
  // Slatted acoustic panels use real depth and restrained seams rather than flat blocks.
  for (const x of [1.8, 2.92, 4.04]) {
    fixed(room, m.black, [x, 2.85, -2.075], [0.87, 1.78, 0.07], true);
    for (let slat = 0; slat < 7; slat++) {
      fixed(room, m.fabric, [x - 0.33 + slat * 0.11, 2.85, -2.02], [0.075, 1.65, 0.07], true);
    }
  }
  // Moved clear of the raised fourth screen, which would hide them from the fixed eye.
  const wallLights = group('Triangular warm wall lights', [-0.15, 3.85, -2.01]);
  for (let i = 0; i < 5; i++) {
    const x = i * 0.34;
    const y = i % 2 === 0 ? 0 : 0.26;
    const rotation: XYZ = [Math.PI / 2, 0, i % 2 === 0 ? 0 : Math.PI];
    p.mesh(wallLights, triangle, m.brass, [x, y, 0], [0.3, 0.07, 0.3], rotation, false);
    p.mesh(wallLights, triangle, m.glow, [x, y, 0.047], [0.265, 0.025, 0.265], rotation, false);
  }

  // Left wall: a dressed shelf, a framed print and the cable run to a socket.
  const shelf = group('Left wall shelf', [-4.5, 3.1, 0.1]);
  block(shelf, m.timber, [0.21, 0, 0], [0.42, 0.06, 2.3]);
  for (const z of [-0.8, 0.8]) {
    fixed(shelf, m.black, [0.17, -0.13, z], [0.3, 0.035, 0.04]);
    fixed(shelf, m.black, [0.03, -0.2, z], [0.035, 0.3, 0.04]);
  }
  const spines = [m.sage, m.cream, m.pink, m.blue, m.black, m.yellow, m.ivory, m.sage];
  let bookZ = -1.02;
  spines.forEach((material, index) => {
    const thickness = 0.07 + (index % 3) * 0.02;
    const height = 0.4 + ((index * 7) % 4) * 0.04;
    block(shelf, material, [0.2, 0.03 + height / 2, bookZ + thickness / 2], [0.28, height, thickness]);
    bookZ += thickness + 0.006;
  });
  const leaning = block(shelf, m.cream, [0.2, 0.235, bookZ + 0.1], [0.28, 0.42, 0.07]);
  leaning.rotation.x = -0.3;
  p.mesh(shelf, p.cylinder, m.cream, [0.21, 0.13, 0.42], [0.11, 0.2, 0.11]);
  for (const [x, y, z, size] of [[0.21, 0.36, 0.42, 0.15], [0.26, 0.47, 0.5, 0.11], [0.17, 0.5, 0.35, 0.1]] as const) {
    p.mesh(shelf, p.sphere, m.leaf, [x, y, z], [size, size * 1.15, size]);
  }
  block(shelf, m.black, [0.2, 0.22, 0.88], [0.28, 0.38, 0.26], true);
  p.mesh(shelf, p.torus, m.metal, [0.345, 0.19, 0.88], [0.085, 0.085, 0.085], [0, Math.PI / 2, 0], false);
  p.mesh(shelf, disc, m.fabric, [0.343, 0.19, 0.88], [0.078, 0.078, 1], [0, Math.PI / 2, 0], false);
  p.mesh(shelf, disc, m.brass, [0.343, 0.335, 0.88], [0.03, 0.03, 1], [0, Math.PI / 2, 0], false);
  const print = group('Framed abstract print', [-4.5, 3.05, 2]);
  fixed(print, m.black, [0.025, 0, 0], [0.05, 1.24, 0.92]);
  fixed(print, m.cream, [0.052, 0, 0], [0.012, 1.12, 0.8]);
  p.mesh(print, disc, m.sage, [0.061, 0.16, -0.06], [0.24, 0.24, 1], [0, Math.PI / 2, 0], false);
  p.mesh(print, disc, m.brass, [0.063, -0.08, 0.12], [0.13, 0.13, 1], [0, Math.PI / 2, 0], false);
  fixed(print, m.black, [0.06, -0.36, 0], [0.006, 0.014, 0.52]);
  fixed(room, m.ivory, [-4.485, 0.62, 0.2], [0.03, 0.2, 0.16], true);
  p.rod(room, m.rubber, [-3.76, 1.46, 0.3], [-3.86, 0.14, 0.2], 0.014);
  p.rod(room, m.rubber, [-3.86, 0.14, 0.2], [-4.42, 0.14, 0.2], 0.014);
  p.rod(room, m.rubber, [-4.42, 0.14, 0.2], [-4.47, 0.6, 0.2], 0.014);

  // Right wall: night window with a half-drawn blind, floor lamp and a closed door.
  const windowBay = group('Dusk window', [5.1, 3, 1.5]);
  p.mesh(windowBay, p.plane, m.dusk, [-0.015, 0, 0], [2, 2, 1], [0, -Math.PI / 2, 0], false).receiveShadow = false;
  for (const y of [-1.04, 1.04]) fixed(windowBay, m.darkTimber, [-0.05, y, 0], [0.1, 0.09, 2.17]);
  for (const z of [-1.04, 1.04]) fixed(windowBay, m.darkTimber, [-0.05, 0, z], [0.1, 2.17, 0.09]);
  fixed(windowBay, m.darkTimber, [-0.035, 0, 0], [0.05, 2, 0.05]);
  fixed(windowBay, m.timber, [-0.12, -1.11, 0], [0.24, 0.05, 2.3]);
  fixed(windowBay, m.ivory, [-0.08, 0.96, 0], [0.09, 0.07, 2.02], true);
  for (let slat = 0; slat < 9; slat++) {
    fixed(windowBay, m.ivory, [-0.075, 0.87 - slat * 0.085, 0], [0.07, 0.012, 1.98]).rotation.z = 0.6;
  }
  // Geometry ownership: the procedural lamp and door exist only without a pilot. With one,
  // they are never created, so nothing has to be found and removed after batching.
  if (!pilotRoot) {
    const lamp = group('Music corner floor lamp', [4.72, 0, -0.02]);
    p.mesh(lamp, p.cylinder, m.black, [0, 0.135, 0], [0.24, 0.05, 0.24]);
    p.rod(lamp, m.metal, [0, 0.15, 0], [0, 3.3, 0], 0.022);
    p.mesh(lamp, p.cylinder, m.shade, [0, 3.5, 0], [0.3, 0.46, 0.3], [0, 0, 0], false);
    p.mesh(lamp, p.cylinder, m.brass, [0, 3.75, 0], [0.04, 0.05, 0.04], [0, 0, 0], false);
  }
  // The lamp's floor contact decal belongs to the room and serves either lamp.
  contact(scene, [4.72, 0.118, -0.02], 0.9, 0.9);
  if (!pilotRoot) {
    const door = group('Closed studio door', [5.1, 0, 3.7]);
    fixed(door, m.darkTimber, [-0.035, 2.2, 0], [0.07, 4.18, 1.4]);
    for (const y of [1.2, 3.1]) fixed(door, m.black, [-0.075, y, 0], [0.012, 1.5, 1], true);
    for (const z of [-0.76, 0.76]) fixed(door, m.black, [-0.05, 2.25, z], [0.1, 4.3, 0.12]);
    fixed(door, m.black, [-0.05, 4.35, 0], [0.1, 0.12, 1.64]);
    p.rod(door, m.brass, [-0.08, 2.1, -0.55], [-0.17, 2.1, -0.55], 0.018);
    p.mesh(door, p.sphere, m.brass, [-0.19, 2.1, -0.55], [0.045, 0.045, 0.045], [0, 0, 0], false);
  }

  // Linear pendant above the keyboard: the visible source of the dominant warm pool.
  const pendant = group('Linear desk pendant', [-1.6, 4.02, 0.3]);
  fixed(pendant, m.black, [0, 0, 0], [1.9, 0.08, 0.17], true);
  fixed(pendant, m.glow, [0, -0.045, 0], [1.78, 0.02, 0.1]);
  for (const x of [-0.8, 0.8]) p.rod(pendant, m.rubber, [x, 0.03, 0], [x, 1.28, 0], 0.008).castShadow = false;

  const desk = group('Timber workstation', [-1.35, 0, 0.25]);
  const top = p.mesh(desk, resources.geometry(slabGeometry(4.9, 0.16, 1.75, 0.07, 0.028)), m.timber, [0, 1.5, 0], [1, 1, 1]);
  top.name = 'Bevelled timber desktop';
  block(desk, m.black, [0, 1.395, 0], [4.56, 0.06, 1.47]);
  for (const x of [-2.16, 2.16]) {
    for (const z of [-0.6, 0.6]) {
      block(desk, m.black, [x, 0.76, z], [0.1, 1.23, 0.1]);
      foot(desk, x, z);
    }
    block(desk, m.black, [x, 0.22, 0], [0.1, 0.08, 1.28]);
    contact(desk, [x, 0.115, 0], 0.65, 1.8);
  }
  const mat = block(desk, m.fabric, [-0.25, 1.59, 0.35], [2.6, 0.018, 0.92], true);
  mat.castShadow = false;

  function monitor(id: StudioTarget['id'] | 'studio', position: XYZ, width: number, height: number, yaw = 0) {
    const screen = group(`${id} monitor`, position);
    // Side displays turn toward the seat; the face stays a plain front-facing plane.
    screen.rotation.y = yaw;
    block(screen, m.black, [0, 0, -0.005], [width + 0.13, height + 0.13, 0.1], true);
    block(screen, m.metal, [0, -height / 2 - 0.035, 0.047], [width * 0.7, 0.013, 0.012]);
    const face = resources.material(new THREE.MeshBasicMaterial({
      map: screenTexture(resources, id), toneMapped: false,
    }));
    const surface = p.mesh(screen, p.plane, face, [0, 0, 0.054], [width, height, 1], [0, 0, 0], false);
    surface.receiveShadow = false;
    const postBottom = 1.6 - position[1];
    p.rod(screen, m.metal, [0, postBottom, -0.075], [0, -0.08, -0.075], 0.035);
    if (id === 'studio') {
      // The raised fourth display is decorative and has no selection border or target.
      p.rod(screen, m.black, [0, -0.08, -0.075], [0.3, -0.08, -0.31], 0.035);
      return;
    }
    // Hinge, weighted foot and a descending cable are visible in the gap under each panel.
    block(screen, m.black, [0, -height / 2 - 0.13, -0.07], [0.17, 0.11, 0.08], true);
    block(screen, m.black, [0, postBottom, 0], [0.53, 0.035, 0.37], true);
    p.rod(screen, m.rubber, [0.11, -height / 2 - 0.05, -0.09], [0.2, postBottom, -0.24], 0.012);
    contact(screen, [0, postBottom - 0.014, 0], 0.78, 0.6);
    const border = resources.material(new THREE.MeshBasicMaterial({ color: 0x75654b, toneMapped: false }));
    const borderMesh = p.mesh(screen, p.plane, border, [0, 0, 0.049], [width + 0.055, height + 0.055, 1], [0, 0, 0], false);
    borderMesh.receiveShadow = false;
    borderMesh.userData.interactive = true;
    surface.userData.interactive = true;
    surface.userData.projectId = id;
    targets.push({ id, surface, border });
  }
  monitor('dissertation', [-1.61, 2.38, -0.27], 1.88, 1.06);
  monitor('copilot', [-3.11, 2.44, -0.13], 0.8, 1.34, 0.3);
  monitor('typeforge', [-0.11, 2.44, -0.13], 0.8, 1.34, -0.3);
  monitor('studio', [-1.61, 3.52, -0.64], 1.29, 0.73);

  // Frosted compact board: a translucent case around an opaque plate, with tapered
  // caps on a staggered five-row layout. It pivots on its front edge for a typing angle.
  const keyboard = group('Compact frosted pastel keyboard', [-1.65, 1.618, 0.62]);
  keyboard.rotation.x = 0.06;
  block(keyboard, m.sage, [0, 0.036, 0], [1.55, 0.05, 0.55], true);
  block(keyboard, m.frost, [0, 0.045, 0], [1.63, 0.085, 0.63], true, false);
  const unit = 0.1;
  const rows: ReadonlyArray<ReadonlyArray<readonly [number, THREE.Material]>> = [
    [[1, m.pink], ...Array.from({ length: 12 }, () => [1, m.cream] as const), [2, m.sage]],
    [[1.5, m.blue], ...Array.from({ length: 12 }, () => [1, m.cream] as const), [1.5, m.cream]],
    [[1.75, m.sage], ...Array.from({ length: 11 }, () => [1, m.cream] as const), [2.25, m.pink]],
    [[2.25, m.yellow], ...Array.from({ length: 10 }, () => [1, m.cream] as const), [1.75, m.blue], [1, m.sage]],
    [[1.25, m.blue], [1.25, m.cream], [1.25, m.cream], [6.25, m.cream], [1, m.pink], [1, m.cream], [1, m.yellow], [1, m.sage], [1, m.blue]],
  ];
  rows.forEach((row, rowIndex) => {
    let x = -7.5 * unit;
    for (const [width, material] of row) {
      p.mesh(keyboard, keycap, material, [x + width * unit / 2, 0.104, (rowIndex - 2) * unit], [width * unit - 0.013, 0.062, unit - 0.013]);
      x += width * unit;
    }
  });
  p.rod(keyboard, m.pink, [-0.6, 0.04, -0.3], [-0.78, 0.0, -0.62], 0.012);
  contact(desk, [-0.3, 1.602, 0.38], 2.05, 0.9);
  const mouse = group('Ivory mouse', [0.8, 1.6, 0.41], desk);
  mouse.rotation.y = -0.13;
  block(mouse, m.ivory, [0, 0.05, 0], [0.19, 0.1, 0.3], true);
  block(mouse, m.black, [0, 0.094, -0.035], [0.006, 0.012, 0.17]);
  p.mesh(mouse, p.cylinder, m.rubber, [0, 0.098, -0.07], [0.017, 0.014, 0.017], [0, 0, Math.PI / 2]);
  contact(desk, [0.8, 1.602, 0.41], 0.42, 0.5);

  // Notebook and pen, then one nearfield speaker on isolation foam at the desk's right end.
  const notebook = group('Notebook and pen', [1.42, 1.582, 0.53], desk);
  notebook.rotation.y = -0.22;
  block(notebook, m.cream, [0, 0.016, 0], [0.4, 0.026, 0.54]);
  block(notebook, m.sage, [-0.004, 0.034, 0], [0.41, 0.01, 0.55]);
  block(notebook, m.pink, [0.1, 0.036, 0], [0.03, 0.012, 0.552]);
  p.rod(notebook, m.brass, [-0.1, 0.052, -0.16], [-0.04, 0.052, 0.18], 0.011);
  const speaker = group('Nearfield speaker', [2.07, 1.58, -0.45], desk);
  block(speaker, m.fabric, [0, 0.02, 0], [0.42, 0.04, 0.4]);
  block(speaker, m.black, [0, 0.36, 0], [0.44, 0.64, 0.42], true);
  p.mesh(speaker, p.torus, m.metal, [0, 0.27, 0.213], [0.135, 0.135, 0.135], [0, 0, 0], false);
  p.mesh(speaker, disc, m.fabric, [0, 0.27, 0.212], [0.125, 0.125, 1], [0, 0, 0], false);
  p.mesh(speaker, p.sphere, m.black, [0, 0.27, 0.212], [0.045, 0.045, 0.02], [0, 0, 0], false);
  p.mesh(speaker, p.torus, m.metal, [0, 0.54, 0.213], [0.05, 0.05, 0.05], [0, 0, 0], false);
  p.mesh(speaker, disc, m.brass, [0, 0.54, 0.212], [0.045, 0.045, 1], [0, 0, 0], false);
  contact(desk, [2.07, 1.583, -0.4], 0.75, 0.75);

  // White tower under the right edge, with front fans and a left-facing side panel.
  const tower = group('White computer tower', [0.42, 0.78, 0.38]);
  block(tower, m.ivory, [0, 0, 0], [0.77, 1.24, 1.09], true);
  block(tower, m.black, [0, 0.03, 0.552], [0.6, 1.03, 0.018], true);
  for (const y of [-0.31, 0, 0.31]) {
    p.mesh(tower, p.torus, m.ivory, [0, y, 0.568], [0.12, 0.12, 0.12]);
    p.mesh(tower, disc, m.fabric, [0, y, 0.573], [0.1, 0.1, 1], [0, 0, 0], false);
    for (let blade = 0; blade < 5; blade++) {
      const angle = blade * Math.PI * 2 / 5;
      const fin = block(tower, m.metal, [Math.sin(angle) * 0.055, y + Math.cos(angle) * 0.055, 0.579], [0.035, 0.079, 0.008], true);
      fin.rotation.z = -angle + 0.5;
      fin.castShadow = false;
    }
    p.mesh(tower, p.sphere, m.black, [0, y, 0.585], [0.03, 0.03, 0.008], [0, 0, 0], false);
  }
  block(tower, m.black, [-0.391, 0.015, 0], [0.008, 1.02, 0.85]);
  block(tower, m.metal, [-0.4, 0.13, -0.13], [0.01, 0.42, 0.34]);
  block(tower, m.ivory, [-0.411, -0.2, 0.03], [0.01, 0.12, 0.67]);
  p.mesh(tower, p.torus, m.brass, [-0.419, 0.14, -0.13], [0.13, 0.13, 0.13], [0, -Math.PI / 2, 0], false);
  p.mesh(tower, p.plane, m.glass, [-0.429, 0.015, 0], [0.85, 1.02, 1], [0, -Math.PI / 2, 0], false);
  for (const z of [-0.4, 0.4]) for (const y of [-0.46, 0.49]) {
    p.mesh(tower, p.sphere, m.metal, [-0.435, y, z], [0.018, 0.018, 0.018], [0, 0, 0], false);
  }
  p.mesh(tower, p.sphere, m.glow, [0.24, 0.48, 0.569], [0.015, 0.015, 0.006], [0, 0, 0], false);
  contact(scene, [0.42, 0.116, 0.38], 1.35, 1.6);
  // Subwoofer under the left half fills the sightline beneath the desk edge.
  const sub = group('Under-desk subwoofer', [-2.7, 0, -0.05]);
  block(sub, m.black, [0, 0.54, 0], [0.74, 0.78, 0.72], true);
  p.mesh(sub, p.torus, m.metal, [0, 0.54, 0.363], [0.23, 0.23, 0.23], [0, 0, 0], false);
  p.mesh(sub, disc, m.fabric, [0, 0.54, 0.362], [0.21, 0.21, 1], [0, 0, 0], false);
  p.mesh(sub, p.sphere, m.black, [0, 0.54, 0.362], [0.08, 0.08, 0.03], [0, 0, 0], false);
  contact(scene, [-2.7, 0.116, -0.05], 1.2, 1.2);

  const boom = group('Microphone articulated boom', [-3.58, 1.6, 0.51]);
  block(boom, m.black, [0, -0.055, 0], [0.12, 0.24, 0.2], true);
  p.rod(boom, m.black, [0, 0, 0], [0.04, 0.88, -0.07], 0.025);
  p.rod(boom, m.black, [0.04, 0.88, -0.07], [0.5, 0.55, 0.45], 0.025);
  p.rod(boom, m.metal, [-0.035, 0.11, 0], [-0.005, 0.83, -0.07], 0.008);
  p.rod(boom, m.metal, [0.1, 0.9, -0.07], [0.53, 0.59, 0.45], 0.008);
  for (const position of [[0, 0.08, 0], [0.04, 0.88, -0.07], [0.5, 0.55, 0.45]] as const) {
    p.mesh(boom, p.sphere, m.black, position, [0.065, 0.065, 0.065]);
  }
  const mic = group('Microphone grille and shock mount', [0.5, 0.4, 0.45], boom);
  mic.rotation.z = -0.2;
  p.mesh(mic, p.cylinder, m.black, [0, 0, 0], [0.065, 0.28, 0.065]);
  p.mesh(mic, p.sphere, m.fabric, [0, 0.14, 0], [0.068, 0.09, 0.068]);
  for (const y of [-0.12, 0, 0.08]) {
    p.mesh(mic, p.torus, m.metal, [0, y, 0], [0.074, 0.074, 0.074], [Math.PI / 2, 0, 0], false);
  }
  p.rod(mic, m.rubber, [0, -0.14, 0], [-0.08, -0.29, -0.04], 0.014);

  const headphones = group('Listening headphones on desk', [-3, 1.63, 0.82]);
  headphones.rotation.x = -Math.PI / 2;
  p.mesh(headphones, headband, m.black, [0, 0, 0], [0.23, 0.27, 0.23]);
  for (const x of [-0.23, 0.23]) {
    block(headphones, m.metal, [x, 0.01, 0], [0.03, 0.16, 0.025], true);
    block(headphones, m.fabric, [x, -0.035, 0], [0.12, 0.22, 0.12], true);
    block(headphones, m.rubber, [x + (x < 0 ? 0.04 : -0.04), -0.035, 0], [0.065, 0.18, 0.14], true);
  }
  contact(scene, [-3, 1.584, 0.86], 0.75, 0.5);
  const mug = group('Coffee on coaster', [0.62, 1.582, 0.6]);
  p.mesh(mug, p.cylinder, m.timber, [0, 0.012, 0], [0.17, 0.023, 0.17]);
  p.mesh(mug, p.cylinder, m.cream, [0, 0.14, 0], [0.115, 0.25, 0.115]);
  p.mesh(mug, disc, m.coffee, [0, 0.267, 0], [0.094, 0.094, 1], [-Math.PI / 2, 0, 0], false);
  p.mesh(mug, p.torus, m.cream, [0, 0.268, 0], [0.104, 0.104, 0.104], [Math.PI / 2, 0, 0]);
  p.mesh(mug, p.torus, m.cream, [0.135, 0.16, 0], [0.08, 0.09, 0.08]);
  contact(scene, [0.62, 1.584, 0.6], 0.5, 0.5);

  // Music corner stays on the right. The controller sits forward of the kit so both
  // read from the fixed eye: keys across the lower midground, pads and cymbals behind.
  const controller = group('White 49-key music controller', [2.7, 1.35, 0.83]);
  block(controller, m.ivory, [0, 0, 0], [2.97, 0.16, 0.9], true);
  block(controller, m.black, [0, 0.085, 0.125], [2.76, 0.014, 0.56]);
  for (const x of [-1.5, 1.5]) block(controller, m.timber, [x, 0.005, 0], [0.06, 0.2, 0.92]);
  for (let key = 0; key < 29; key++) {
    const white = block(controller, m.cream, [-1.3 + key * 0.09, 0.108, 0.15], [0.084, 0.04, 0.52]);
    white.name = `Controller white key ${key + 1}`;
    if (key < 28 && [0, 1, 3, 4, 5].includes(key % 7)) {
      const black = block(controller, m.rubber, [-1.255 + key * 0.09, 0.151, 0.025], [0.052, 0.068, 0.28]);
      black.name = `Controller black key after ${key + 1}`;
    }
  }
  for (let pad = 0; pad < 8; pad++) {
    block(controller, pad % 3 === 0 ? m.pink : m.sage, [-1.05 + (pad % 4) * 0.18, 0.105, -0.31 + Math.floor(pad / 4) * 0.12], [0.13, 0.035, 0.082], true);
  }
  block(controller, m.black, [-0.08, 0.092, -0.27], [0.34, 0.018, 0.19], true);
  block(controller, m.glow, [-0.08, 0.104, -0.27], [0.25, 0.005, 0.1]);
  for (let knob = 0; knob < 8; knob++) {
    p.mesh(controller, p.cylinder, m.black, [0.25 + knob * 0.145, 0.127, -0.27], [0.035, 0.07, 0.035]);
    block(controller, m.ivory, [0.25 + knob * 0.145, 0.164, -0.282], [0.009, 0.004, 0.025]);
  }
  for (const x of [-1.41, -1.31]) {
    p.mesh(controller, p.cylinder, m.rubber, [x, 0.085, -0.22], [0.075, 0.04, 0.075], [0, 0, Math.PI / 2]);
  }
  const stand = group('Controller double X stand', [2.7, 0, 0.83]);
  for (const z of [-0.25, 0.25]) {
    p.rod(stand, m.black, [-1.03, 0.2, z], [0.93, 1.255, z], 0.037);
    p.rod(stand, m.black, [1.03, 0.2, z], [-0.93, 1.255, z], 0.037);
    p.mesh(stand, p.sphere, m.metal, [0, 0.74, z], [0.065, 0.065, 0.065]);
  }
  for (const x of [-1.03, 1.03]) {
    p.rod(stand, m.black, [x, 0.2, -0.44], [x, 0.2, 0.44], 0.047);
    foot(stand, x, -0.38);
    foot(stand, x, 0.38);
  }
  contact(scene, [2.7, 0.157, 0.83], 3.2, 1.55);

  // Pads and cymbals sit behind the controller, on a visibly jointed tubular rack.
  const drums = group('Electronic drum kit', [2.8, 0, -1.12]);
  for (const x of [-1.16, 1.16]) {
    p.rod(drums, m.metal, [x, 0.21, 0], [x, 1.6, 0], 0.035);
    p.rod(drums, m.black, [x, 0.23, -0.48], [x, 0.23, 0.49], 0.046);
    foot(drums, x, -0.43);
    foot(drums, x, 0.44);
    p.mesh(drums, p.cylinder, m.black, [x, 1.42, 0], [0.07, 0.15, 0.07]);
  }
  p.rod(drums, m.metal, [-1.16, 1.43, 0], [1.16, 1.43, 0], 0.035);
  function pad(name: string, position: XYZ, radius: number, tilt: number) {
    const drum = group(name, position, drums);
    drum.rotation.x = tilt;
    p.mesh(drum, p.cylinder, m.black, [0, 0, 0], [radius, 0.09, radius]);
    p.mesh(drum, p.cylinder, m.fabric, [0, 0.05, 0], [radius * 0.88, 0.014, radius * 0.88]);
    p.mesh(drum, p.torus, m.metal, [0, 0.059, 0], [radius * 0.94, radius * 0.94, radius * 0.94], [Math.PI / 2, 0, 0]);
    p.rod(drums, m.metal, [position[0], 1.43, 0], position, 0.023);
    p.mesh(drums, p.cylinder, m.black, [position[0], 1.43, 0], [0.055, 0.1, 0.055], [0, 0, Math.PI / 2]);
  }
  pad('Left tom pad', [-0.56, 1.7, 0], 0.29, 0.25);
  pad('Right tom pad', [0.24, 1.73, 0], 0.3, 0.28);
  pad('Snare pad', [-0.7, 1.2, 0.66], 0.34, 0.14);
  pad('Floor tom pad', [0.84, 1.26, 0.59], 0.34, 0.12);
  for (const [x, y, z, radius] of [[-1.06, 2.15, -0.18, 0.4], [0.56, 2.23, -0.22, 0.44], [1.16, 1.98, 0.23, 0.37]] as const) {
    p.rod(drums, m.metal, [x, 1.43, 0], [x, y, z], 0.018);
    const cymbal = group('Rubber electronic cymbal', [x, y, z], drums);
    cymbal.rotation.x = 0.12;
    cymbal.rotation.z = x < 0 ? -0.12 : 0.11;
    p.mesh(cymbal, p.cylinder, m.rubber, [0, 0, 0], [radius, 0.026, radius]);
    p.mesh(cymbal, p.sphere, m.black, [0, 0.023, 0], [radius * 0.26, 0.065, radius * 0.26]);
    p.mesh(cymbal, p.cylinder, m.metal, [0, 0.078, 0], [0.026, 0.04, 0.026]);
  }
  const kick = group('Kick trigger and pedal', [0.03, 0.49, 0.53], drums);
  p.mesh(kick, p.cylinder, m.black, [0, 0, 0], [0.22, 0.12, 0.22], [Math.PI / 2, 0, 0]);
  p.mesh(kick, disc, m.fabric, [0, 0, 0.064], [0.18, 0.18, 1], [0, 0, 0], false);
  p.rod(kick, m.black, [0, -0.32, 0.1], [0, -0.03, -0.02], 0.04);
  block(kick, m.metal, [0, -0.3, 0.27], [0.15, 0.045, 0.32], true);
  p.rod(kick, m.metal, [0, -0.25, 0.14], [0, 0.05, 0.13], 0.012);
  p.mesh(kick, p.sphere, m.cream, [0, 0.05, 0.1], [0.042, 0.042, 0.042]);
  block(drums, m.black, [-1.29, 1.54, 0.3], [0.24, 0.07, 0.32], true);
  block(drums, m.blue, [-1.29, 1.58, 0.24], [0.15, 0.01, 0.1]);
  contact(scene, [2.8, 0.157, -1.12], 3.2, 1.9);
  p.rod(drums, m.timber, [-0.87, 1.29, 0.52], [-0.43, 1.31, 0.81], 0.009);
  p.rod(drums, m.timber, [-0.91, 1.31, 0.76], [-0.44, 1.32, 0.48], 0.009);

  // One throne behind the kit and one stool at the keys ground the corner for a player.
  function seat(name: string, x: number, z: number, height: number) {
    const stool = group(name, [x, 0, z]);
    p.mesh(stool, p.cylinder, m.fabric, [0, height, 0], [0.31, 0.11, 0.31]);
    p.mesh(stool, p.cylinder, m.black, [0, height - 0.07, 0], [0.29, 0.03, 0.29]);
    p.rod(stool, m.metal, [0, 0.42, 0], [0, height - 0.08, 0], 0.035);
    for (let leg = 0; leg < 3; leg++) {
      const angle = leg * Math.PI * 2 / 3 + 0.5;
      const end: XYZ = [Math.cos(angle) * 0.36, 0.17, Math.sin(angle) * 0.36];
      p.rod(stool, m.black, [0, 0.48, 0], end, 0.026);
      p.mesh(stool, p.sphere, m.rubber, end, [0.045, 0.04, 0.045]);
    }
    contact(scene, [x, 0.158, z], 1, 1);
  }
  seat('Drum throne', 2.85, 0, 1);
  seat('Keyboard stool', 3.1, 2.05, 1.08);

  // The board leans on the left wall beside the desk, bindings toward the room.
  const boardLean = group('Small unbranded snowboard', [-4.3, 1.27, 0.95]);
  boardLean.rotation.z = 0.1;
  const board = group('Snowboard deck', [0, 0, 0], boardLean);
  board.rotation.y = Math.PI / 2;
  block(board, m.ivory, [0, 0, 0], [0.36, 1.95, 0.075], true);
  p.mesh(board, p.sphere, m.ivory, [0, 0.94, 0], [0.18, 0.21, 0.0375]);
  p.mesh(board, p.sphere, m.ivory, [0, -0.94, 0], [0.18, 0.21, 0.0375]);
  block(board, m.sage, [0, 0.56, 0.042], [0.3, 0.3, 0.007]);
  block(board, m.brass, [0, -0.66, 0.042], [0.3, 0.08, 0.007]);
  for (const y of [-0.35, 0.32]) {
    const binding = block(board, m.black, [0, y, 0.082], [0.25, 0.17, 0.09], true);
    binding.rotation.z = y < 0 ? -0.18 : 0.18;
    p.mesh(board, p.torus, m.rubber, [0, y, 0.13], [0.11, 0.07, 0.12]);
  }
  contact(scene, [-4.18, 0.118, 0.95], 0.6, 0.8);

  // Neutral-cool ambient separates ivory, rubber and metal; warmth comes from fixtures.
  scene.add(new THREE.HemisphereLight(0xdcdad0, 0x3a352d, 1.15));
  // The single shadow caster reads as the ceiling wash from behind the seat's right shoulder,
  // so the back and left walls catch it while the music corner keeps its own lamp.
  const key = new THREE.DirectionalLight(0xffd9a8, 2.6);
  key.position.set(2.4, 7.6, 6.4);
  key.target.position.set(-0.6, 1.2, -0.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 7, top: 4.6, bottom: -5.2, near: 2, far: 15 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  // The imported shade is larger than the procedural one, and the old lamp position sits on
  // its surface and burns a white disc into it. Inside the shade, on the room side of the
  // bulb, the outer linen faces away from the light and the wall pool grows instead.
  const lampLight: XYZ = pilotRoot ? [4.56, 3.5, -0.02] : [4.4, 3.35, 0.1];
  const practicals: Array<readonly [number, number, XYZ, number]> = [
    [0xffd2a0, 12, [-1.6, 3.85, 0.3], 7], // linear pendant over the desk
    [0xffb15c, 8, [0.55, 3.8, -1.45], 6], // triangular wall lights
    [0xffdeb2, 9, lampLight, 6.5], // music corner floor lamp
    [0x9db4cc, 4, [4.35, 3, 1.5], 6], // dusk window, cool counterpoint
  ];
  // Nothing but ambient reaches the door end: the sun travels away from it and the lamp only
  // grazes it. A low lamp-coloured fill stands in for bounce on the door and the wall beside it.
  if (pilotRoot) practicals.push([0xffdeb2, 3, [3.3, 3.3, 3.2], 5]);
  for (const [colour, intensity, position, distance] of practicals) {
    const light = new THREE.PointLight(colour, intensity, distance, 2);
    light.position.set(...position);
    scene.add(light);
  }

  // The imported door and lamp arrive validated and already placed by the loader, which also
  // owns their geometry, materials and textures. Attach as-is, once: no scale, no offset here.
  // Each imported mesh has its own geometry, so batching below leaves all of them in place.
  if (pilotRoot) {
    tunePilotMaterials(pilotRoot);
    scene.add(pilotRoot);
  }

  scene.updateMatrixWorld(true);
  instanceStaticMeshes(scene, resources);
  scene.updateMatrixWorld(true);
  // Gather blockers only now: batching detaches the source meshes it replaces.
  const occluders: THREE.Mesh[] = [];
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || object.userData.interactive) return;
    const material = object.material;
    if (Array.isArray(material) || material.transparent || material.opacity < 1 || !material.depthWrite) return;
    occluders.push(object);
  });
  return { scene, targets, occluders };
}
