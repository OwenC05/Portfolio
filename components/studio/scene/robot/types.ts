import type * as THREE from 'three';
import type { StudioAssistantInput } from '@/lib/studio-contract';

export type RobotPose = 'neutral' | 'attention' | 'sources' | 'no-match' | 'dismissal';
export interface RobotAsset {
  root: THREE.Group;
  bindings: ReadonlyMap<string, THREE.Object3D>;
  occluders: THREE.Mesh[];
  activationSurfaces: THREE.Mesh[];
  dispose(): void;
}
export interface RobotPresentation {
  readonly asset: RobotAsset;
  readonly cards: readonly THREE.Mesh[];
  apply(input: StudioAssistantInput, reducedMotion: boolean, settle?: boolean): void;
  settle(): void;
  advance(now: number): boolean;
  dispose(): void;
}
