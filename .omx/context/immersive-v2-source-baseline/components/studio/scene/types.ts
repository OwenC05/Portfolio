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
}
