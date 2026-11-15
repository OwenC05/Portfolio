import * as THREE from 'three';
import { PROJECT_IDS } from '@/lib/studio-contract';
import { screenTexture } from './textures';
import type { SceneResources } from './resources';
import { fullKitCertificates, type FullKitBindings } from './full-kit-types';

/** Bind exact validated identities; imported placeholder ownership stays with the loader. */
export function bindFullKit(resources: SceneResources, root: THREE.Group): FullKitBindings {
  const certificate = fullKitCertificates.get(root);
  if (!certificate || certificate.bound) throw new Error('Studio full kit: root is not an unbound validated import');
  certificate.assertIntact();
  // Mark before allocation: a partial binding is a failed assembly, never retryable.
  certificate.bound = true;
  const targets: FullKitBindings['targets'] = [];
  const excluded = new Set<THREE.Mesh>();
  for (const id of [...PROJECT_IDS, 'studio'] as const) {
    const surface = certificate.meshes.get(id === 'studio' ? 'display_studio' : `target_${id}`)!;
    surface.material = resources.material(new THREE.MeshBasicMaterial({
      map: screenTexture(resources, id), toneMapped: false, side: (surface.material as THREE.Material).side,
    }));
    surface.castShadow = false;
    surface.receiveShadow = false;
    if (id === 'studio') continue;
    const borderMesh = certificate.meshes.get(`border_${id}`)!;
    const border = resources.material(new THREE.MeshBasicMaterial({ color: 0x75654b, toneMapped: false, side: (borderMesh.material as THREE.Material).side }));
    borderMesh.material = border;
    borderMesh.castShadow = false;
    borderMesh.receiveShadow = false;
    excluded.add(surface);
    excluded.add(borderMesh);
    targets.push({ id, surface, border });
  }
  // Superset of currently visible blockers; existing picker checks live ancestors.
  // Dusk remains the SAME opaque mesh when Claude replaces its appearance later.
  const occluders = Array.from(certificate.meshes.values()).filter((mesh) => !excluded.has(mesh) && mesh.userData.transparent === false);
  return { targets, occluders };
}
