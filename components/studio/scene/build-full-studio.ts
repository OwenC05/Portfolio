import * as THREE from 'three';
import { bindFullKit } from './bind-full-kit';
import type { SceneResources } from './resources';
import { duskTexture } from './textures';
import type { StudioModel } from './types';

type XYZ = readonly [number, number, number];

/**
 * Scene and light rig for the imported full-room kit (profile studio-full-kit-v1).
 *
 * The validated root arrives already placed by the loader (scale 2, +0.11 lift, applied once
 * there), so nothing here scales, offsets or re-parents its meshes, and the procedural room is
 * never built beside it. Imported geometry, materials and textures stay owned by the loader;
 * `resources` owns only what this file and the binder allocate.
 *
 * M1 status: the light values are the accepted pilot-v02 rig carried over unchanged, as a
 * starting point for the first runtime capture of the blockout. They are not tuned for the
 * imported room and are not accepted art values. Nothing in production imports this file.
 */
export function createFullStudio(resources: SceneResources, root: THREE.Group): StudioModel {
  // Bind first: it throws for an unvalidated or already-bound root before anything is allocated.
  const { targets, occluders } = bindFullKit(resources, root);

  const scene = new THREE.Scene();
  scene.name = 'After-hours studio (full kit)';
  // The shell closes the whole view envelope, so the background shows only through a fault.
  // Dark olive keeps such a fault from reading as a black or white hole. No fog: the room is
  // under nine metres deep and fog would only flatten the far wall.
  scene.background = new THREE.Color(0x14160f);

  // Dusk is the imported opaque quad; only its appearance is authored here. Same mesh, same
  // geometry, still an occluder. Front side only, matching the exported winding.
  const dusk = root.getObjectByName('rt_window_dusk');
  if (!(dusk instanceof THREE.Mesh)) throw new Error('Studio full kit: rt_window_dusk is missing');
  const duskMaterial = new THREE.MeshBasicMaterial({ map: duskTexture(resources), toneMapped: false });
  duskMaterial.name = 'dusk';
  dusk.material = resources.material(duskMaterial);
  dusk.castShadow = false;
  dusk.receiveShadow = false;

  // Neutral-cool ambient separates ivory, rubber and metal; warmth comes from fixtures.
  scene.add(new THREE.HemisphereLight(0xdcdad0, 0x3a352d, 1.15));

  // The single shadow caster: a ceiling wash from behind the seat's right shoulder. The frustum
  // covers the room footprint (x -4.5..5.1, z -2.12..6.6) as seen along the light.
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

  // Practicals sit at the fixtures the kit models. None casts a shadow.
  const practicals: Array<readonly [number, number, XYZ, number]> = [
    [0xffd2a0, 12, [-1.6, 3.85, 0.3], 7], // linear pendant over the desk
    [0xffb15c, 8, [0.55, 3.8, -1.45], 6], // triangular wall lights
    [0xffdeb2, 9, [4.56, 3.5, -0.02], 6.5], // floor lamp, inside the shade on the room side of the bulb
    [0x9db4cc, 4, [4.35, 3, 1.5], 6], // dusk window, cool counterpoint
    [0xffdeb2, 3, [3.3, 3.3, 3.2], 5], // stands in for bounce on the door and the wall beside it
  ];
  for (const [colour, intensity, position, distance] of practicals) {
    const light = new THREE.PointLight(colour, intensity, distance, 2);
    light.position.set(...position);
    scene.add(light);
  }

  // Attach as-is, once. The imported root bypasses the static batcher: its nodes keep their
  // identity for picking and for the loader's certificate.
  scene.add(root);
  scene.updateMatrixWorld(true);
  return { scene, targets, occluders };
}
