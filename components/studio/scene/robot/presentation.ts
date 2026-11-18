import * as THREE from 'three';
import type { StudioAssistantInput } from '@/lib/studio-contract';
import profile from './runtime-profile.json';
import { CARD_LAYOUT, createCards } from './cards';
import type { RobotAsset, RobotPose, RobotPresentation } from './types';

const POSE_MS = 250;
const SELECTION_MS = 120;
type Transform = { position: THREE.Vector3; rotation: THREE.Quaternion };
const moving = profile.bindings.filter((binding) => binding.moving);
const poses = Object.fromEntries(Object.entries(profile.poses).map(([name, nodes]) => [name,
  moving.map((binding) => {
    const trs = nodes[binding.name as keyof typeof nodes];
    if (!trs || ![...trs.translation, ...trs.rotationXyzw, ...trs.scale].every(Number.isFinite)
      || trs.scale.some((value) => value !== 1) || Math.abs(Math.hypot(...trs.rotationXyzw) - 1) > 1e-6) throw new Error('Invalid robot pose subset');
    return { position: new THREE.Vector3().fromArray(trs.translation), rotation: new THREE.Quaternion().fromArray(trs.rotationXyzw).normalize() };
  }),
])) as Record<RobotPose, Transform[]>;

/** Transform-only animator. No timer, transport, source text, material writes or RAF. */
export function createPresentation(asset: RobotAsset): RobotPresentation {
  const owned = createCards(asset.bindings.get('APA_tray')!);
  const nodes = moving.map((binding) => asset.bindings.get(binding.name)!);
  let latest: StudioAssistantInput | null = null;
  let reduced = false;
  let disposed = false;
  let settledTarget: RobotPose = 'neutral';
  let target: RobotPose = 'neutral';
  let from: Transform[] | null = null;
  let started: number | null = null;
  let dismissEpoch: number | null = null;
  let selectionFrom: number[] | null = null;
  let selectionStarted: number | null = null;
  let selectionTarget = [0, 0, 0, 0];
  let selection = [0, 0, 0, 0];

  function writePose(values: Transform[]) {
    nodes.forEach((node, i) => { node.position.copy(values[i].position); node.quaternion.copy(values[i].rotation); });
  }
  function begin(pose: RobotPose) {
    target = pose;
    from = nodes.map((node) => ({ position: node.position.clone(), rotation: node.quaternion.clone().normalize() }));
    started = null;
  }
  function writeSelection() {
    owned.cards.forEach((card, i) => {
      card.position.y = CARD_LAYOUT.baseY + selection[i] * CARD_LAYOUT.lift;
      card.scale.setScalar(1 + selection[i] * (CARD_LAYOUT.selectedScale - 1));
    });
  }
  function settle() {
    if (disposed) return;
    target = settledTarget;
    dismissEpoch = null; from = null; started = null;
    selectionFrom = null; selectionStarted = null;
    selection = [...selectionTarget];
    writePose(poses[target]); writeSelection();
  }
  return {
    asset, cards: owned.cards,
    apply(input, reducedMotion, forceSettle = false) {
      if (disposed) return;
      const previous = latest;
      const { snapshot } = input;
      const hits = snapshot.run.hits;
      if (hits.length > 4 || snapshot.count !== hits.length || new Set(hits.map((hit) => hit.key)).size !== hits.length
        || hits.some((hit, i) => hit.rank !== i + 1) || (hits.length > 0 && !snapshot.run.runId)) throw new Error('Invalid assistant marker snapshot');
      const show = input.panelOpen && snapshot.tray === 'hits'
        && !['idle', 'requesting', 'retrieving', 'cancelled', 'error'].includes(snapshot.run.phase);
      let replaced = false;
      owned.cards.forEach((card, i) => {
        const hit = show ? hits[i] : undefined;
        const identity = hit ? JSON.stringify([snapshot.run.runId, hit.key]) : null;
        if (card.userData.identity !== identity) replaced = true;
        card.visible = Boolean(hit);
        // Never retain passage text, score or source records in WebGL.
        card.userData = hit ? { identity, runId: snapshot.run.runId, key: hit.key, rank: hit.rank } : { identity: null };
      });
      const nextSelection = owned.cards.map((card) => Number(card.visible && card.userData.key === snapshot.run.selectedKey));
      if (nextSelection.some((value, i) => value !== selectionTarget[i])) {
        selectionFrom = [...selection]; selectionStarted = null; selectionTarget = nextSelection;
      }
      if (replaced) { selection = [...selectionTarget]; selectionFrom = null; writeSelection(); }
      const previousTarget = settledTarget;
      settledTarget = input.panelOpen ? (snapshot.pose === 'idle' || snapshot.pose === 'dismissal' ? 'neutral' : snapshot.pose)
        : input.attentionRequested ? 'attention' : 'neutral';
      const semanticChange = !previous || previous.panelOpen !== input.panelOpen
        || (dismissEpoch !== null && previous.presentationEpoch !== input.presentationEpoch)
        || previous.snapshot.run.runId !== snapshot.run.runId || previousTarget !== settledTarget;
      latest = input;
      if (semanticChange) {
        dismissEpoch = previous?.panelOpen && !input.panelOpen && settledTarget === 'neutral' ? input.presentationEpoch : null;
        begin(dismissEpoch === null ? settledTarget : 'dismissal');
      }
      // OFF is deliberately inert. Initial/late attachment and suspension adopt data settled.
      if (!previous || forceSettle || reducedMotion || (reduced && !reducedMotion)) settle();
      reduced = reducedMotion;
    },
    settle,
    advance(now) {
      if (disposed) return false;
      if (!Number.isFinite(now)) { settle(); return false; }
      if (from) {
        started ??= now;
        const t = THREE.MathUtils.clamp((now - started) / POSE_MS, 0, 1);
        const eased = t * t * (3 - 2 * t);
        nodes.forEach((node, i) => {
          node.position.lerpVectors(from![i].position, poses[target][i].position, eased);
          node.quaternion.slerpQuaternions(from![i].rotation, poses[target][i].rotation, eased).normalize();
        });
        if (t === 1) {
          from = null; started = null;
          if (target === 'dismissal' && dismissEpoch !== null && latest?.presentationEpoch === dismissEpoch && !latest.panelOpen) {
            dismissEpoch = null; begin(settledTarget); started = now;
          }
        }
      }
      if (selectionFrom) {
        selectionStarted ??= now;
        const t = THREE.MathUtils.clamp((now - selectionStarted) / SELECTION_MS, 0, 1);
        selection = selectionFrom.map((value, i) => THREE.MathUtils.lerp(value, selectionTarget[i], t));
        writeSelection();
        if (t === 1) { selectionFrom = null; selectionStarted = null; }
      }
      return Boolean(from || selectionFrom);
    },
    dispose() { if (disposed) return; disposed = true; from = null; selectionFrom = null; owned.dispose(); },
  };
}
