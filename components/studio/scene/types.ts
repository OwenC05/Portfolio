import type * as THREE from 'three';
import type { ProjectId } from '@/lib/studio-contract';

export interface StudioTarget {
  id: ProjectId;
  surface: THREE.Mesh;
  /** Dedicated unlit border material, excluded from static instancing. */
  border: THREE.MeshBasicMaterial;
}

export interface StudioModel {
  scene: THREE.Scene;
  targets: StudioTarget[];
  /** Live opaque blockers after batching; excludes target faces and dedicated highlight planes. */
  occluders: THREE.Mesh[];
}

/** A validated, placed pilot with its own idempotent imported-resource owner. */
export interface StudioPilotAsset {
  root: THREE.Group;
  dispose(): void;
}

/** Artistic framing is authored by the room owner; angles are degrees. */
export interface StudioViewConfiguration {
  eye: readonly [number, number, number];
  desktopFov: number;
  mobileFov: number;
  desktopHome: { yaw: number; pitch: number };
  mobileHome: { yaw: number; pitch: number };
  yawBounds: readonly [number, number];
  pitchBounds: readonly [number, number];
  near: number;
  far: number;
}
