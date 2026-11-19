import * as THREE from 'three';
import { SceneResources, makePrimitives, instanceStaticMeshes } from './resources';
import { contactTexture, screenTexture, woodTexture } from './textures';
import type { StudioModel, StudioTarget } from './types';

type XYZ = readonly [number, number, number];

/** Original, deliberately stylised studio equipment; no imported models or product claims. */
export function createStudio(resources: SceneResources): StudioModel {
  const scene = new THREE.Scene();
  scene.name = 'After-hours studio';
  // Leave the background transparent so the surrounding interface supplies the vignette.
  const p = makePrimitives(resources);
  const targets: StudioTarget[] = [];
  const standard = (colour: number, roughness = 0.65, metalness = 0) =>
    resources.material(new THREE.MeshStandardMaterial({ color: colour, roughness, metalness }));
  const m = {
    wall: standard(0x353832, 0.98),
    floor: standard(0x393731, 0.88),
    timber: resources.material(new THREE.MeshStandardMaterial({ map: woodTexture(resources), roughness: 0.62 })),
    fabric: standard(0x454b47, 0.98),
    seam: standard(0x727365, 0.97),
    black: standard(0x202725, 0.54),
    rubber: standard(0x151a19, 0.98),
    metal: standard(0x969a91, 0.32, 0.7),
    brass: standard(0xb69b68, 0.38, 0.65),
    ivory: standard(0xe3e1d2, 0.37),
    cream: standard(0xf0e5cc, 0.55),
    pink: standard(0xd2a69e, 0.62),
    sage: standard(0x9eaf99, 0.62),
    blue: standard(0x9eafb8, 0.62),
    yellow: standard(0xd8bd83, 0.62),
    coffee: standard(0x382117, 0.25),
    glow: resources.material(new THREE.MeshStandardMaterial({
      color: 0xffdb9e, emissive: 0xffae52, emissiveIntensity: 1.1, roughness: 0.6,
    })),
    frost: resources.material(new THREE.MeshStandardMaterial({
      color: 0xe4ede3, roughness: 0.9, transparent: true, opacity: 0.42,
      depthWrite: false, side: THREE.FrontSide,
    })),
    glass: resources.material(new THREE.MeshStandardMaterial({
      color: 0xb1bbb2, roughness: 0.53, transparent: true, opacity: 0.23,
      depthWrite: false, side: THREE.FrontSide,
    })),
  };
  const disc = resources.geometry(new THREE.CircleGeometry(1, 24));
  const triangle = resources.geometry(new THREE.CylinderGeometry(1, 1, 1, 3));
  const headband = resources.geometry(new THREE.TorusGeometry(1, 0.075, 6, 24, Math.PI));
  const shadowMaterial = resources.material(new THREE.MeshBasicMaterial({
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
  function block(parent: THREE.Object3D, material: THREE.Material, position: XYZ, scale: XYZ, round = false) {
    return p.mesh(parent, round ? p.rounded : p.box, material, position, scale);
  }
  function contact(parent: THREE.Object3D, position: XYZ, width: number, depth: number) {
    const shadow = p.mesh(parent, p.plane, shadowMaterial, position, [width, depth, 1], [-Math.PI / 2, 0, 0], false);
    shadow.receiveShadow = false;
    shadow.renderOrder = 1;
  }
  function foot(parent: THREE.Object3D, x: number, z: number) {
    block(parent, m.rubber, [x, 0.105, z], [0.22, 0.09, 0.3], true);
  }

  // A shallow open room keeps the equipment visible from the front-left camera.
  const room = group('Warm open room', [0, 0, 0]);
  block(room, m.floor, [0.3, 0.055, 0], [9.6, 0.11, 4.5], true);
  block(room, m.wall, [0.3, 2.25, -2.19], [9.6, 4.28, 0.14]);
  block(room, m.wall, [-4.43, 0.62, -0.25], [0.14, 1.02, 3.9]);
  block(room, m.black, [0.3, 0.22, -2.1], [9.45, 0.18, 0.05]);
  for (let x = -4; x < 5; x += 0.62) {
    block(room, m.black, [x, 0.112, 0], [0.012, 0.004, 4.27]);
  }
  const rug = block(room, m.fabric, [2.85, 0.13, -0.05], [3.9, 0.035, 3.75], true);
  rug.castShadow = false;
  for (const z of [-1.83, 1.73]) {
    block(room, m.seam, [2.85, 0.15, z], [3.62, 0.008, 0.018]);
  }
  // Slatted acoustic panels use real depth and restrained seams rather than flat blocks.
  for (const x of [2.05, 3.17, 4.29]) {
    block(room, m.black, [x, 2.85, -2.075], [0.87, 1.78, 0.07], true);
    for (let slat = 0; slat < 7; slat++) {
      block(room, m.fabric, [x - 0.33 + slat * 0.11, 2.85, -2.02], [0.075, 1.65, 0.07], true);
    }
  }
  const wallLights = group('Triangular warm wall lights', [-2.75, 3.69, -2.01]);
  for (let i = 0; i < 5; i++) {
    const x = i * 0.49;
    const y = i % 2 === 0 ? 0 : 0.29;
    const rotation: XYZ = [Math.PI / 2, 0, i % 2 === 0 ? 0 : Math.PI];
    p.mesh(wallLights, triangle, m.brass, [x, y, 0], [0.34, 0.07, 0.34], rotation);
    p.mesh(wallLights, triangle, m.glow, [x, y, 0.047], [0.301, 0.025, 0.301], rotation, false);
  }

  const desk = group('Timber workstation', [-1.35, 0, 0.25]);
  block(desk, m.timber, [0, 1.5, 0], [4.9, 0.16, 1.75], true);
  block(desk, m.black, [0, 1.395, 0], [4.56, 0.06, 1.47]);
  for (const x of [-2.16, 2.16]) {
    for (const z of [-0.6, 0.6]) {
      block(desk, m.black, [x, 0.76, z], [0.085, 1.23, 0.085]);
      foot(desk, x, z);
    }
    block(desk, m.black, [x, 0.22, 0], [0.085, 0.08, 1.28]);
    contact(desk, [x, 0.115, 0], 0.65, 1.8);
  }
  block(desk, m.black, [0, 1.15, -0.58], [4.35, 0.075, 0.06]);
  block(desk, m.fabric, [-0.25, 1.59, 0.29], [2.55, 0.018, 0.9], true);

  function monitor(id: StudioTarget['id'] | 'studio', position: XYZ, width: number, height: number) {
    const screen = group(`${id} monitor`, position);
    block(screen, m.black, [0, 0, -0.015], [width + 0.13, height + 0.13, 0.095], true);
    block(screen, m.metal, [0, -height / 2 - 0.035, 0.036], [width * 0.7, 0.013, 0.012]);
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
    block(screen, m.black, [0, postBottom, 0], [0.53, 0.035, 0.37], true);
    contact(screen, [0, postBottom - 0.014, 0], 0.78, 0.6);
    const border = resources.material(new THREE.MeshBasicMaterial({ color: 0x75654b, toneMapped: false }));
    const borderMesh = p.mesh(screen, p.plane, border, [0, 0, 0.049], [width + 0.055, height + 0.055, 1], [0, 0, 0], false);
    borderMesh.receiveShadow = false;
    borderMesh.userData.interactive = true;
    surface.userData.interactive = true;
    surface.userData.projectId = id;
    targets.push({ id, surface, border });
  }
  monitor('dissertation', [-1.61, 2.35, -0.27], 1.74, 0.98);
  monitor('copilot', [-3.03, 2.41, -0.17], 0.74, 1.24);
  monitor('typeforge', [-0.19, 2.41, -0.17], 0.74, 1.24);
  monitor('studio', [-1.61, 3.46, -0.64], 1.29, 0.73);

  // Frosted compact board: one translucent shell over a visible opaque insert.
  const keyboard = group('Compact frosted pastel keyboard', [-1.78, 1.62, 0.7]);
  block(keyboard, m.sage, [0, 0.031, 0], [1.27, 0.055, 0.43], true);
  block(keyboard, m.frost, [0, 0.044, 0], [1.34, 0.088, 0.49], true).castShadow = false;
  const accents = [m.pink, m.blue, m.sage, m.yellow];
  for (let row = 0; row < 4; row++) {
    for (let key = 0; key < 13; key++) {
      const colour = key === 0 ? accents[row] : key === 12 ? m.sage : m.cream;
      block(keyboard, colour, [-0.59 + key * 0.098, 0.1, -0.18 + row * 0.083], [0.084, 0.045, 0.068], true);
    }
  }
  for (const [x, width, material] of [
    [-0.55, 0.16, m.blue], [-0.36, 0.16, m.cream], [-0.02, 0.48, m.cream],
    [0.33, 0.16, m.pink], [0.53, 0.16, m.yellow],
  ] as const) {
    block(keyboard, material, [x, 0.1, 0.16], [width, 0.045, 0.07], true);
  }
  p.rod(keyboard, m.rubber, [-0.55, 0.025, -0.25], [-0.66, 0.025, -0.42], 0.011);
  contact(desk, [-0.43, 1.605, 0.45], 1.8, 0.73);
  const mouse = block(desk, m.ivory, [0.87, 1.66, 0.45], [0.18, 0.1, 0.29], true);
  mouse.rotation.y = -0.13;
  block(desk, m.black, [0.87, 1.713, 0.4], [0.018, 0.008, 0.065]);

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
  for (let vent = 0; vent < 9; vent++) {
    block(tower, m.black, [-0.25 + vent * 0.062, 0.626, -0.12], [0.023, 0.008, 0.55]);
  }
  p.mesh(tower, p.sphere, m.glow, [0.24, 0.48, 0.569], [0.015, 0.015, 0.006], [0, 0, 0], false);
  contact(scene, [0.42, 0.116, 0.38], 1.35, 1.6);

  const boom = group('Microphone articulated boom', [-3.58, 1.6, 0.51]);
  block(boom, m.black, [0, -0.055, 0], [0.12, 0.24, 0.2], true);
  p.rod(boom, m.black, [0, 0, 0], [0.04, 0.88, -0.07], 0.025);
  p.rod(boom, m.black, [0.04, 0.88, -0.07], [0.64, 0.55, 0.45], 0.025);
  p.rod(boom, m.metal, [-0.035, 0.11, 0], [-0.005, 0.83, -0.07], 0.008);
  p.rod(boom, m.metal, [0.1, 0.9, -0.07], [0.67, 0.59, 0.45], 0.008);
  for (const position of [[0, 0.08, 0], [0.04, 0.88, -0.07], [0.64, 0.55, 0.45]] as const) {
    p.mesh(boom, p.sphere, m.black, position, [0.065, 0.065, 0.065]);
  }
  const mic = group('Microphone grille and shock mount', [0.64, 0.4, 0.45], boom);
  mic.rotation.z = -0.2;
  p.mesh(mic, p.cylinder, m.black, [0, 0, 0], [0.065, 0.28, 0.065]);
  p.mesh(mic, p.sphere, m.fabric, [0, 0.14, 0], [0.068, 0.09, 0.068]);
  for (const y of [-0.12, 0, 0.08]) {
    p.mesh(mic, p.torus, m.metal, [0, y, 0], [0.074, 0.074, 0.074], [Math.PI / 2, 0, 0], false);
  }
  p.rod(mic, m.rubber, [0, -0.14, 0], [-0.08, -0.29, -0.04], 0.014);

  const headphones = group('Listening headphones on desk', [-3.12, 1.64, 0.88]);
  headphones.rotation.x = -Math.PI / 2;
  p.mesh(headphones, headband, m.black, [0, 0, 0], [0.23, 0.27, 0.23]);
  for (const x of [-0.23, 0.23]) {
    block(headphones, m.metal, [x, 0.01, 0], [0.03, 0.16, 0.025], true);
    block(headphones, m.fabric, [x, -0.035, 0], [0.12, 0.22, 0.12], true);
    block(headphones, m.rubber, [x + (x < 0 ? 0.04 : -0.04), -0.035, 0], [0.065, 0.18, 0.14], true);
  }
  const mug = group('Coffee on coaster', [0.45, 1.59, 0.83]);
  p.mesh(mug, p.cylinder, m.timber, [0, 0.012, 0], [0.17, 0.023, 0.17]);
  p.mesh(mug, p.cylinder, m.cream, [0, 0.14, 0], [0.115, 0.25, 0.115]);
  p.mesh(mug, disc, m.coffee, [0, 0.267, 0], [0.094, 0.094, 1], [-Math.PI / 2, 0, 0], false);
  p.mesh(mug, p.torus, m.cream, [0, 0.268, 0], [0.104, 0.104, 0.104], [Math.PI / 2, 0, 0]);
  p.mesh(mug, p.torus, m.cream, [0.135, 0.16, 0], [0.08, 0.09, 0.08]);

  // Music controller: four full octaves plus the final C, with the 2/3 black-key pattern.
  const controller = group('White 49-key music controller', [2.95, 1.35, 0.83]);
  block(controller, m.ivory, [0, 0, 0], [2.97, 0.16, 0.9], true);
  block(controller, m.black, [0, 0.085, 0.125], [2.76, 0.014, 0.56]);
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
    block(controller, m.black, [x, 0.105, -0.22], [0.045, 0.065, 0.17], true);
  }
  const stand = group('Controller double X stand', [2.95, 0, 0.83]);
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
  contact(scene, [2.95, 0.157, 0.83], 3.2, 1.55);

  // Pads and cymbals sit behind the controller, on a visibly jointed tubular rack.
  const drums = group('Electronic drum kit', [3.05, 0, -1.12]);
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
  contact(scene, [3.05, 0.157, -1.12], 3.2, 1.9);
  p.rod(drums, m.timber, [-0.87, 1.29, 0.52], [-0.43, 1.31, 0.81], 0.009);
  p.rod(drums, m.timber, [-0.91, 1.31, 0.76], [-0.44, 1.32, 0.48], 0.009);

  const board = group('Small unbranded snowboard', [-3.94, 1.24, -1.71]);
  board.rotation.z = -0.13;
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

  const hemi = new THREE.HemisphereLight(0xf1dec1, 0x353a35, 1.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd7a0, 3.3);
  key.position.set(-3.4, 6.2, 5.4);
  key.target.position.set(0.2, 1.4, -0.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5.7, right: 5.7, top: 4.3, bottom: -4.3, near: 0.5, far: 17 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const wallFill = new THREE.PointLight(0xffb15c, 8, 6, 2);
  wallFill.position.set(-2.2, 3.5, -1.35);
  const musicFill = new THREE.PointLight(0xffdeb2, 7, 6, 2);
  musicFill.position.set(3.9, 3.2, 1.15);
  scene.add(wallFill, musicFill);

  scene.updateMatrixWorld(true);
  instanceStaticMeshes(scene, resources);
  return { scene, targets };
}
