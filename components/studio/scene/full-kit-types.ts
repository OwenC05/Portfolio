import type * as THREE from 'three';
import type { StudioTarget } from './types';

export interface StudioFullKitAsset {
  root: THREE.Group;
  dispose(): void;
}

export interface FullKitBindings {
  targets: StudioTarget[];
  occluders: THREE.Mesh[];
}

/** Identity certificate, not a resource cache; only the private loader can issue it. */
export const fullKitCertificates = new WeakMap<THREE.Group, {
  meshes: Map<string, THREE.Mesh>;
  assertIntact(): void;
  bound: boolean;
}>();
