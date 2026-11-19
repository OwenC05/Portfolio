// Continuous positional enclosure plus explicitly discrete interruption probes.
// Does not certify room clearance, collision freedom or browser appearance.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { profile, realAsset, input, presentationModule, cardsModule, loadTs } from './test-support.mjs';

const asset = await realAsset();
const p = presentationModule.createPresentation(asset);
const names = Object.keys(profile.poses);
const bindings = new Map(profile.bindings.map((b) => [b.name, b]));
const serializeBox = (box) => ({ min: box.min.toArray(), max: box.max.toArray() });
const maxAngles = {};

// A quaternion ball about identity of SO(3) radius < pi/2 is geodesically
// convex. Each current-to-target shortest slerp stays in that same ball,
// inductively under arbitrarily many interruptions. Translations stay in
// their endpoint coordinate intervals; scales remain exactly one.
function bound(name) {
  const binding = bindings.get(name), node = asset.bindings.get(name);
  const box = new THREE.Box3();
  if (node instanceof THREE.Mesh) { node.geometry.computeBoundingBox(); box.copy(node.geometry.boundingBox); }
  for (const child of profile.bindings.filter((child) => child.parent === name)) box.union(bound(child.name));
  if (name === 'APA_tray') {
    for (const card of p.cards) {
      card.geometry.computeBoundingBox();
      // x/z and y extrema are affine in positive scale and lift; all four
      // combinations conservatively include even independent selection clocks.
      for (const scale of [1, cardsModule.CARD_LAYOUT.selectedScale]) for (const lift of [0, cardsModule.CARD_LAYOUT.lift]) {
        const matrix = new THREE.Matrix4().compose(card.position.clone().setY(cardsModule.CARD_LAYOUT.baseY + lift), card.quaternion, new THREE.Vector3().setScalar(scale));
        box.union(card.geometry.boundingBox.clone().applyMatrix4(matrix));
      }
    }
  }
  const values = binding.moving ? names.map((pose) => profile.poses[pose][name]) : [binding.neutral];
  const translations = new THREE.Box3().setFromPoints(values.map((trs) => new THREE.Vector3().fromArray(trs.translation)));
  const theta = Math.max(...values.map((trs) => new THREE.Quaternion().fromArray(trs.rotationXyzw).normalize().angleTo(new THREE.Quaternion())));
  assert.ok(theta < Math.PI / 2); assert.ok(values.every((trs) => trs.scale.every((v) => v === 1)));
  maxAngles[name] = theta;
  // For every vector in this child enclosure, |Rv-v| <= 2 sin(theta/2)|v|.
  // Expanding each axis by that radius loses correlation but is continuous,
  // not an empirical padding around samples.
  const radius = new THREE.Vector3(Math.max(Math.abs(box.min.x), Math.abs(box.max.x)), Math.max(Math.abs(box.min.y), Math.abs(box.max.y)), Math.max(Math.abs(box.min.z), Math.abs(box.max.z))).length();
  box.expandByScalar(2 * Math.sin(theta / 2) * radius + 1e-7);
  box.min.add(translations.min); box.max.add(translations.max);
  return box;
}
const local = bound('APA_root');
asset.root.updateMatrix();
const world = local.clone().applyMatrix4(asset.root.matrix);
const view = loadTs('../view-config.ts', {}).STUDIO_VIEW;
const eye = new THREE.Vector3().fromArray(view.eye);
const nearestHorizontal = Math.hypot(eye.x - THREE.MathUtils.clamp(eye.x, world.min.x, world.max.x), eye.z - THREE.MathUtils.clamp(eye.z, world.min.z, world.max.z));
const azimuths = [];
for (const x of [world.min.x, world.max.x]) for (const z of [world.min.z, world.max.z]) azimuths.push(THREE.MathUtils.radToDeg(Math.atan2(x - eye.x, eye.z - z)));
const angles = { azimuth: [Math.min(...azimuths), Math.max(...azimuths)], elevation: [THREE.MathUtils.radToDeg(Math.atan2(world.min.y - eye.y, nearestHorizontal)), THREE.MathUtils.radToDeg(Math.atan2(world.max.y - eye.y, nearestHorizontal))] };
const sampled = new THREE.Box3();
let samples = 0, maxQuaternionError = 0;

function observe() {
  asset.root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  for (const mesh of [...asset.occluders, ...p.cards.filter((card) => card.visible)]) {
    mesh.geometry.computeBoundingBox();
    box.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
  }
  assert.ok(world.containsBox(box), 'implemented retarget trajectory must remain inside continuous enclosure');
  for (const binding of profile.bindings.filter((b) => b.moving)) {
    const node = asset.bindings.get(binding.name);
    const angle = node.quaternion.angleTo(new THREE.Quaternion());
    assert.ok(angle <= maxAngles[binding.name] + 1e-6);
    maxQuaternionError = Math.max(maxQuaternionError, Math.abs(node.quaternion.length() - 1));
  }
  sampled.union(box); samples++;
}
let epoch = 0, clock = 0;
const poseInput = (name, selected = 'key-0') => input({ count: 4, pose: name === 'neutral' ? 'idle' : name, selected, epoch: ++epoch });
// All 125 ordered endpoint -> partial second -> third scenarios. The real
// runtime is sampled; the pair/interruption fractions are labelled discrete.
for (const a of names) for (const b of names) for (const c of names) for (const interruption of [0.17, 0.49, 0.83]) {
  // Dismissal is a close action in runtime, so drive it through that path.
  const apply = (name, settle = false) => {
    if (name === 'dismissal') {
      p.apply(poseInput('attention'), false, settle);
      p.apply(input({ panelOpen: false, epoch: ++epoch }), false, settle);
    } else p.apply(poseInput(name), false, settle);
  };
  apply(a, true);
  if (a === 'dismissal') {
    p.apply(poseInput('attention'), false, true);
    p.apply(input({ panelOpen: false, epoch: ++epoch }), false);
    p.advance(clock); clock += 250; p.advance(clock);
  }
  observe();
  apply(b); p.advance(clock); clock += 250 * interruption; p.advance(clock); observe();
  apply(c); p.advance(clock);
  for (let step = 0; step < 9; step++) { clock += 35; p.advance(clock); observe(); }
  clock += 300; p.advance(clock); observe();
}
// Long deterministic repeated-interruption chain exercises reachable states
// beyond one interrupted pair, selection changes and dismissal invalidation.
let seed = 0x674a07a5;
for (let i = 0; i < 500; i++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const pose = names[seed % 4];
  p.apply(poseInput(pose, `key-${seed % 4}`), false);
  p.advance(clock); clock += 5 + seed % 160; p.advance(clock); observe();
}

// Independent all-combinations eye vertical separation: pupil translations
// are convex combinations; lid local-X angles remain within endpoint range.
const eyeGaps = {};
for (const side of ['L', 'R']) {
  const pupil = asset.bindings.get(`APA_pupil_${side}`), eye = asset.bindings.get(`APA_eye_${side}`), lid = asset.bindings.get(`APA_lid_lower_${side}`);
  for (const name of names) {
    assert.deepEqual(profile.poses[name][pupil.name].rotationXyzw, [0, 0, 0, 1]);
    assert.deepEqual(profile.poses[name][lid.name].translation, bindings.get(lid.name).neutral.translation);
    assert.equal(profile.poses[name][lid.name].rotationXyzw[1], 0);
    assert.equal(profile.poses[name][lid.name].rotationXyzw[2], 0);
  }
  pupil.geometry.computeBoundingBox();
  const minPupil = Math.min(...names.map((name) => profile.poses[name][pupil.name].translation[1])) + eye.position.y + pupil.geometry.boundingBox.min.y;
  const angles = names.map((name) => { const q = profile.poses[name][lid.name].rotationXyzw; return 2 * Math.atan2(q[0], q[3]); });
  const lo = Math.min(...angles), hi = Math.max(...angles);
  const vertices = lid.geometry.getAttribute('position'); let maxLid = -Infinity;
  for (let i = 0; i < vertices.count; i++) {
    const y = vertices.getY(i), z = vertices.getZ(i), candidates = [lo, hi];
    const stationary = Math.atan2(-z, y);
    for (let k = -2; k <= 2; k++) if (stationary + k * Math.PI >= lo && stationary + k * Math.PI <= hi) candidates.push(stationary + k * Math.PI);
    for (const angle of candidates) maxLid = Math.max(maxLid, lid.position.y + y * Math.cos(angle) - z * Math.sin(angle));
  }
  eyeGaps[side] = minPupil - maxLid;
  assert.ok(eyeGaps[side] > 0, 'even decoupled pupil/lid extremes retain a vertical gap');
}

const visibleCards = cardsModule.createCards(new THREE.Group());
const cardTriangles = visibleCards.cards.reduce((sum, card) => sum + (card.geometry.index?.count ?? card.geometry.getAttribute('position').count) / 3, 0);
let cardSupportRadius = 0;
for (const card of visibleCards.cards) for (const scale of [1, cardsModule.CARD_LAYOUT.selectedScale]) {
  card.scale.setScalar(scale); card.updateMatrix();
  const vertices = card.geometry.getAttribute('position');
  for (let i = 0; i < vertices.count; i++) {
    const point = new THREE.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(card.matrix);
    cardSupportRadius = Math.max(cardSupportRadius, Math.hypot(point.x, point.z));
  }
}
assert.ok(cardSupportRadius < 0.11755819618701935);
const report = { candidate: profile.sha256, method: 'identity-centered geodesically-convex quaternion caps plus translation intervals and recursive rotational displacement bounds',
  assumptions: ['all imported scales exactly one', 'normalized shortest slerp with common nonovershooting smoothstep parameter', 'arbitrary finite retarget count', 'card layout/lift/scale exactly cards.ts', 'wrapper applied once'],
  localMetres: serializeBox(local), placedWorldUnits: serializeBox(world), maxAnglesRadians: maxAngles,
  approximateP2NeighbourComparison: { method: 'conservative world AABB angular enclosure versus approximate P2 neighbour angles; not silhouette intersection', eye: view.eye, angularDegrees: angles,
    marginsDegrees: { typeforge: angles.azimuth[0] - 16.96, wallLights: 7.88 - angles.elevation[1], speaker: angles.elevation[0] + 7.42 } },
  discreteSamples: samples, sampledWorldMeshAabbUnion: serializeBox(sampled), maxQuaternionLengthError: maxQuaternionError,
  continuousIndependentPupilLidGapMetres: eyeGaps,
  cards: { maxVisible: 4, geometries: 2, materials: 1, trianglesAtFour: cardTriangles, maxPrimaryDraws: 4,
    supportRadiusMetres: cardSupportRadius, trayInnerRadiusMetres: 0.11755819618701935, radialMarginMetres: 0.11755819618701935 - cardSupportRadius },
  imported: { primaryDraws: 21, triangles: profile.triangles, geometries: 21, materials: 7 },
  doesNotProve: ['continuous mesh nonintersection', 'room or wall-light clearance', 'final placement', 'browser draw counts', 'mobile performance', 'appearance acceptance'] };
visibleCards.dispose(); p.dispose(); asset.dispose();
if (process.argv.includes('--write')) writeFileSync(new URL('../../../../design/assistant/robot/integration/scene-implementation/envelope.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
