# Runtime pilot substitution — art author report (Claude)

15 November 2026. Task `task_2e77d7178fc2`, dispatch `ctx_e9252d77d8d0`. Bounded door and floor-lamp substitution under the frozen `scene-coordination/runtime-contract.md`.

**Status: first tuning pass applied and inspected by me in root's v02 recapture; independent Claude verdict pending.** Current `build-studio.ts` sha256 `e23588e2702ece52c5b8a2ed25adb2debac366fdf90c66609a5ef4299ffc11ae`. Not claimed: art acceptance, the independent verdict, or anything about the loader or controller. I ran no build, server, browser, Blender or generation.

## Initial assembly (captured by root as `d8abf67f…`)

One file: `components/studio/scene/build-studio.ts`.

| | sha256 |
| --- | --- |
| Before | `364da680f5111138207a03a72579d7e6491a5e4fc09f8786b5de794d69fb1ec3` |
| After | `d8abf67f6c25ddadb0eba3a1b43df372eb132f5b35aa6867a3a0f573701e2dd6` |

- `createStudio(resources: SceneResources, pilotRoot: THREE.Group | null = null): StudioModel`, as frozen.
- With `pilotRoot` null or omitted, the room is built exactly as before.
- With `pilotRoot` supplied, the `Music corner floor lamp` and `Closed studio door` groups and their 12 meshes are never created. Nothing is removed after batching and nothing is looked up by group name.
- `pilotRoot` is attached to the scene once, as received, just before the matrix update, batching and blocker collection. This file applies no scale, offset or rotation to it; placement is the loader's.
- Nothing else changed: no camera, light, material, texture or other scenery value.

Two things deliberately kept on the pilot path:

- The lamp's floor contact decal. It is attached to the room, not to the lamp group, and the imported lamp stands on the same spot.
- The lamp's point light (`[4.4, 3.35, 0.1]`, intensity 9). It is lighting, so it waits for captures.

## Geometry ownership

| Geometry | Owner | Disposed by |
| --- | --- | --- |
| Room, gear, targets, borders, decals, lights | `createStudio` through `SceneResources` | procedural resource owner |
| Procedural lamp and door (null path only) | `createStudio` through `SceneResources` | procedural resource owner |
| Imported door and lamp: nine meshes, their geometry, materials, textures | Codex loader (`StudioPilotAsset`) | the asset's own `dispose()` |

`createStudio` registers nothing from `pilotRoot` in `SceneResources`, so the two owners stay independent.

Batching and identity: `instanceStaticMeshes` only merges meshes that share geometry, material and shadow flags. Each imported mesh has its own geometry, so none is merged and all nine stay as the loader's original objects under `pilotRoot`. This depends on the loader not giving two imported meshes the same geometry object with the same material; if it ever did, the pair would be folded into an `InstancedMesh` owned by the procedural side. That is not the case for the nine-node profile, and I changed no helper.

Blockers: the existing collection is unchanged. It takes every non-interactive mesh whose material is opaque and writes depth, so the imported meshes are included, the bulb among them regardless of `nocast`. Target faces are excluded as interactive and the three border planes by their material, as before.

## Checks run

Static and CPU-only. No WebGL, no real GLB.

- `npx tsc --noEmit --incremental false`: exit 0, no errors, with the controller as it stood at the time (`controller.ts` `f04f7e9f…`, still calling `createStudio(resources)`).
- ESLint could not run: the repo's config names `@typescript-eslint/eslint-plugin`, which is not installed. Not something I changed or fixed.
- A throwaway Node script (kept outside the repo) built the model four ways with real geometry and batching and inert canvas painting: the pre-change source, the new default, explicit `null`, and a stand-in pilot root. The stand-in is nine small boxes with the profile's names, scale 2, offset `(0, 0.11, 0)`; it is not the real asset. All assertions passed:

| | Loose meshes | Instanced batches | Drawn parts | Lights | Blockers | Targets |
| --- | --- | --- | --- | --- | --- | --- |
| Pre-change source | 31 | 56 | 498 | 6 | 78 | 3 |
| New, no pilot | 31 | 56 | 498 | 6 | 78 | 3 |
| New, stand-in pilot | 38 | 55 | 495 | 6 | 84 | 3 |

- Default and explicit-null builds match the pre-change source on every count and on the named-group list.
- Pilot build: both procedural groups absent, every other named group present; root attached to the scene exactly once with scale, position and rotation untouched; world scale of each imported mesh is 2, so not doubled; all nine imported meshes still parented to the root, none instanced, all nine in the blocker list; light colours, intensities and positions identical; same three target ids; no target face or border in the blocker list; contact decal count unchanged.
- 498 − 12 procedural + 9 imported = 495.

Not checked by me: the real GLB, the real loader's output, material response, shadows, picking against the real door, performance, and any lifecycle behaviour. Those are root's and Codex's gates.

## What I expect to need after captures

Predictions only, from the Blender stills and the generation critique; none is applied.

- The door end gets no key light in this renderer, so the imported oak will probably still read dark and need a fill near the door or a longer-reaching lamp light.
- Shade and bulb emissive strengths were tuned under a different tone curve and may clip here.
- Brass and brushed metal are fully metallic and may look dark without an environment.
- The adjacent wall between window and door was the dimmest area in Blender.

## Runtime captures and first tuning pass

Root captured the assembled build (`d8abf67f…`) with the real GLB at `.omx/artifacts/visual-ralph/portfolio-immersive-v2/pilot-runtime-v01`, receipt `.omx/context/studio-pilot-runtime-capture-v01.json`, and released bounded door and lamp tuning (msg_17d26c57e71d).

### What I saw

Opened at full size: `right-up-1440.png`, `right-down-1440.png`, `music-1440.png`, plus enlarged crops of the lamp and door from `right-up`. Not opened: `home`, `project-open`, and the 390 and 320 sizes. Luminance figures are 0–255 means over hand-placed crops, so treat them as magnitudes.

| Area | Measured | Reading |
| --- | --- | --- |
| Shade, whole | mean 213–220, 12–13% of pixels at ≥250 on all channels | A white disc about half the shade's width is burnt into the side facing the room. The rest is a flat pale cream with no core-to-rim gradient. Fails my plan's 2% clipping limit. |
| Shade, disc only | 52% clipped | |
| Lamp pole under the shade | white | Same cause as the disc. |
| Door leaf, upper and lower panel | 40 and 35 | Reads as a panelled oak door: grain, both fields and the mouldings are visible. Even, with little light gradient. |
| Door architrave | 18–22 | Same value as the wall beside it (23), so the frame disappears into the wall. |
| Knob | mean 25–29, mostly black | A black ball with one small highlight. |
| Wall between window and door | 23 | About half the left wall's level (43). |
| Wall below the sill | 21 | Dim, unchanged from the prototype. |
| Wall beside the lamp, music view | 92 | Healthy pool. |

Cause of the disc: the lamp's point light was authored for the smaller procedural shade. Against the imported shade it sits within a few millimetres of the linen surface. The emissive map is a plain vertical gradient and is not the source.

Compared with my predictions: the knob and the dim adjacent wall came out as expected. The door leaf is better than I expected and already sits at the left wall's level. The shade problem is real but its cause is the light's position, not the emissive strength I had suspected.

### Changes, pilot path only

All inside `build-studio.ts`; the no-pilot build is unchanged. sha256 now `e23588e2702ece52c5b8a2ed25adb2debac366fdf90c66609a5ef4299ffc11ae`.

| Change | From | To | Why |
| --- | --- | --- | --- |
| Lamp point light position | `[4.4, 3.35, 0.1]` | `[4.56, 3.5, -0.02]` | Inside the shade on the room side of the bulb, so the outer linen faces away from it. Removes the disc; also 0.16 nearer the wall, which enlarges the wall pool. Colour, intensity 9 and range unchanged. |
| Door-end fill, new point light | none | `0xffdeb2`, intensity 3, `[3.3, 3.3, 3.2]`, range 5, no shadows | Only ambient reaches the door end. Lifts the door, its frame and the wall strip beside it, and gives the door a top-to-bottom falloff. |
| `lib_linen_shade` colour | 1, 1, 1 | 0.62, 0.62, 0.62 | Less surface response so the glow carries the shade. |
| `lib_linen_shade` emissive | tint 1, 1, 1 at 2.2 | tint 0.8, 1, 1.5 at 1.25 | Lower so the map's core-to-rim gradient survives tone mapping; shifted from orange toward cream. |
| `lib_linen_trim` emissive intensity | 1 | 0.2 | Bands and seam a step darker than the linen. |
| `lib_dark_oak` colour (linear) | 0.102, 0.061, 0.034 | 0.2045, 0.1225, 0.0687 | Twice as light, so the architrave separates from the wall while staying darker than the leaf. |
| `lib_brass` metalness | 1 | 0.6 | No environment map exists, so fully metallic brass is black. 0.6 is near the room's own brass (0.65). Affects the knob and the lamp fittings. |

The material values are set on the loader's existing material objects, found by profile name, with absolute values, so applying them twice changes nothing. No new geometry, material or texture is created. Opacity, transparency and depth writing are untouched, so blocker status is unchanged. Still one shadow-casting light.

Left alone on purpose: door leaf oak, lamp base, pole, bulb, every texture, camera, the other lights, all other scenery.

### Expected result, not yet seen

These are estimates from a hand calculation of this renderer's tone curve, ambient light only. On the two values I could compare with the captures (oak leaf and architrave) the calculation ran roughly 15–25% bright.

- Shade: core about 232, 215, 186; foot about 173, 150, 117; head about 148, 129, 100. No all-channel clipping expected.
- Trim: about 140, 117, 82.
- Architrave: about 59, 40, 25 before the fill light, against a leaf near 63, 36, 15.

Risks I could not check without a render:

- The wall directly behind the lamp receives about 1.7 times its previous peak and may be too hot at the shade's edge.
- The inside of the shade is now strongly lit and a bright sliver may show through the bottom opening from the seated eye.
- The fill light also reaches the blind, stool and nearby floor; it adds a fifth point light to every lit material's shader.
- Linen weave is too fine to resolve at the shade's on-screen size (about 85 px wide) and I have not tried to force it.
- The wall below the sill is not addressed.

### Checks after tuning

- `npx tsc --noEmit --incremental false`: exit 0 with `controller.ts` `cc76055e…` and `load-pilot.ts` `b5cd61c6…`.
- The CPU script, extended and rerun with a stand-in root carrying the profile's material names: all assertions passed. No-pilot build still matches the pre-change source (31 loose meshes, 56 batches, 498 parts, 6 lights, 78 blockers). Pilot build: 7 lights with exactly one shadow caster, the lamp light moved and one fill added and no other light changed; the five material values set as tabled; oak, black metal, brushed metal and bulb untouched; every imported material still opaque and depth-writing; a second application leaves all values identical; 84 blockers including all nine imported meshes; three targets.
- Other owners' files re-hashed unchanged; public GLB still `2b9a4182…`.
- No build, server, browser, render or generation by me.

## Author inspection of the tuned recapture (`pilot-runtime-v02`)

Root recaptured `e23588e2…` as `.omx/artifacts/visual-ralph/portfolio-immersive-v2/pilot-runtime-v02`, manifest `.omx/context/studio-pilot-runtime-capture-v02.json` (msg_66ff1475db4a). Source is unchanged since; I made no edit after seeing these. This is the author's own reading, not the independent verdict.

Opened at full size: `right-up-1440`, `right-down-1440`, `music-1440`, `home-1440`; enlarged crops of the lamp and door from `right-up-1440`; and `right-up`, `right-down` and `music` at 390 and 320 side by side. Not opened: `home` at 390 and 320, and the three `project-open` views. Figures are 0–255 means over the same crops as the first pass, v01 then v02.

| Area (view) | v01 | v02 | Reading |
| --- | --- | --- | --- |
| Shade, share clipped on all channels (`right-up`, `right-down`, `music`) | 12.2%, 12.8%, 12.7% | 0.1%, 0.0%, 0.1% | The white disc is gone. Under the plan's 2% limit. |
| Shade core, head, foot (`right-up`) | 242, 206, 214 | 216, 179, 168 | A warm cream shade with a gentle core-to-rim gradient. Present but mild. |
| Trim bands and seam (`right-up` crop) | barely distinct | visible | Top and bottom bands and the seam read as darker linen. |
| Wall just right of the shade (`right-up`) | 138 | 161 | Brighter pool, no clipping. My hot-wall worry did not materialise. |
| Wall beside the lamp (`music`) | 92 | 75 | Dimmer on this side, because the light moved toward the wall and away from this patch. Wall above the lamp rose 58 to 75. |
| Door upper panel (`right-up`, `right-down`) | 40, 40 | 79, 79 | Doubled. Brighter than I aimed for (about 55) and now nearly twice the left wall (44). |
| Door lower panel (`right-down`) | 35 | 45 | Clear top-to-bottom falloff, which gives the door form. |
| Architrave left and head (`right-up`) | 22, 18 | 46, 51 | Now separates from the wall beside it (33). |
| Architrave left, lower run (`right-down`) | 18 | 28 | Still slightly below the wall (33) near the floor; the frame fades out there. |
| Knob (`right-up`) | 25, a black ball | 67 | Reads as a brass knob with a highlight. |
| Wall between window and door (`right-up`, `right-down`) | 23, 23 | 33, 33 | Improved, still under the left wall's 44. |
| Wall below the sill | 21 | 21–22 | Unchanged, still dim. |
| Lamp pole under the shade (`right-up`) | mean 138, peak 243 | mean 110, peak 218 | Less blown but still a pale, bright rod. |

Checks on the risks I listed:

- **Fill spill:** none visible. Blind (123 to 124), stool top (69 to 73), floor by the door (51 to 53), rug (41 to 41) and keyboard keys (135 to 136) are within a few levels of v01. `home-1440` has the same frame mean (66) and looks unchanged.
- **Sliver inside the shade:** a thin bright ellipse shows at the shade's bottom opening in all three 1440 views. It reads as a lit interior and I think it is acceptable; a critic may disagree.
- **Hot wall:** not clipped; see above.

Narrow widths (390 and 320, `right-up`, `right-down`, `music`): the lamp and window are in frame and the shade reads the same as at 1440, with no white disc. **The door does not appear in any of these six frames**, so the door, frame, knob and fill are judged at 1440 only. That is the existing framing, not something this pass changed.

My own open points, none applied:

1. The door's upper half is a little strong and orange against the rest of the right wall. If the critic agrees, lowering the fill from 3 to about 2 is the one-number change I would make; it would also give back some of the wall-strip gain.
2. The shade gradient is mild. More contrast would need a lower emissive at the rims, which only the texture can give.
3. The lower architrave and the wall below the sill are still dim.
4. Linen weave is not visible at this size.
5. The pole under the shade is still bright.

## Root runtime feedback

1. msg_17d26c57e71d: 15 captures taken, real GLB returned 200 and reached render-ready at 1440, 390 and 320; tuning released. Findings and response above.
2. msg_d8fad9bfec82: acknowledgement requested for the same task; root's decode and corrupt-PNG fallback checks passed and do not judge appearance.

3. msg_e267ace05b1a and msg_66ff1475db4a: hold `e23588e2…` unchanged; v02 recapture supplied, hashes unchanged, ready, one canvas, no errors, no overflow. Author findings above.

Source held at `e23588e2…` for the independent Claude critic.

## Restoring earlier versions

The file is not tracked by git. Reverse the second diff to get the assembled version (`d8abf67f…2dd6`), then the first to get the original (`364da680…fb1ec3`). Both reversals were verified by hash.

First diff, original to assembled:

```diff
--- build-studio.ts@364da680
+++ build-studio.ts@d8abf67f
@@ -47,8 +47,11 @@
  * Original, deliberately stylised studio; no imported models or product claims.
  * The room is a closed box seen from one fixed eye (see view-config.ts), so every
  * prop is placed by its sightline from that point and no exterior face can show.
+ *
+ * Without `pilotRoot` the whole room is procedural. With it, the imported door and floor
+ * lamp stand in for the procedural pair and everything else is built exactly as before.
  */
-export function createStudio(resources: SceneResources): StudioModel {
+export function createStudio(resources: SceneResources, pilotRoot: THREE.Group | null = null): StudioModel {
   const scene = new THREE.Scene();
   scene.name = 'After-hours studio';
   const p = makePrimitives(resources);
@@ -217,19 +220,26 @@
   for (let slat = 0; slat < 9; slat++) {
     fixed(windowBay, m.ivory, [-0.075, 0.87 - slat * 0.085, 0], [0.07, 0.012, 1.98]).rotation.z = 0.6;
   }
-  const lamp = group('Music corner floor lamp', [4.72, 0, -0.02]);
-  p.mesh(lamp, p.cylinder, m.black, [0, 0.135, 0], [0.24, 0.05, 0.24]);
-  p.rod(lamp, m.metal, [0, 0.15, 0], [0, 3.3, 0], 0.022);
-  p.mesh(lamp, p.cylinder, m.shade, [0, 3.5, 0], [0.3, 0.46, 0.3], [0, 0, 0], false);
-  p.mesh(lamp, p.cylinder, m.brass, [0, 3.75, 0], [0.04, 0.05, 0.04], [0, 0, 0], false);
+  // Geometry ownership: the procedural lamp and door exist only without a pilot. With one,
+  // they are never created, so nothing has to be found and removed after batching.
+  if (!pilotRoot) {
+    const lamp = group('Music corner floor lamp', [4.72, 0, -0.02]);
+    p.mesh(lamp, p.cylinder, m.black, [0, 0.135, 0], [0.24, 0.05, 0.24]);
+    p.rod(lamp, m.metal, [0, 0.15, 0], [0, 3.3, 0], 0.022);
+    p.mesh(lamp, p.cylinder, m.shade, [0, 3.5, 0], [0.3, 0.46, 0.3], [0, 0, 0], false);
+    p.mesh(lamp, p.cylinder, m.brass, [0, 3.75, 0], [0.04, 0.05, 0.04], [0, 0, 0], false);
+  }
+  // The lamp's floor contact decal belongs to the room and serves either lamp.
   contact(scene, [4.72, 0.118, -0.02], 0.9, 0.9);
-  const door = group('Closed studio door', [5.1, 0, 3.7]);
-  fixed(door, m.darkTimber, [-0.035, 2.2, 0], [0.07, 4.18, 1.4]);
-  for (const y of [1.2, 3.1]) fixed(door, m.black, [-0.075, y, 0], [0.012, 1.5, 1], true);
-  for (const z of [-0.76, 0.76]) fixed(door, m.black, [-0.05, 2.25, z], [0.1, 4.3, 0.12]);
-  fixed(door, m.black, [-0.05, 4.35, 0], [0.1, 0.12, 1.64]);
-  p.rod(door, m.brass, [-0.08, 2.1, -0.55], [-0.17, 2.1, -0.55], 0.018);
-  p.mesh(door, p.sphere, m.brass, [-0.19, 2.1, -0.55], [0.045, 0.045, 0.045], [0, 0, 0], false);
+  if (!pilotRoot) {
+    const door = group('Closed studio door', [5.1, 0, 3.7]);
+    fixed(door, m.darkTimber, [-0.035, 2.2, 0], [0.07, 4.18, 1.4]);
+    for (const y of [1.2, 3.1]) fixed(door, m.black, [-0.075, y, 0], [0.012, 1.5, 1], true);
+    for (const z of [-0.76, 0.76]) fixed(door, m.black, [-0.05, 2.25, z], [0.1, 4.3, 0.12]);
+    fixed(door, m.black, [-0.05, 4.35, 0], [0.1, 0.12, 1.64]);
+    p.rod(door, m.brass, [-0.08, 2.1, -0.55], [-0.17, 2.1, -0.55], 0.018);
+    p.mesh(door, p.sphere, m.brass, [-0.19, 2.1, -0.55], [0.045, 0.045, 0.045], [0, 0, 0], false);
+  }
 
   // Linear pendant above the keyboard: the visible source of the dominant warm pool.
   const pendant = group('Linear desk pendant', [-1.6, 4.02, 0.3]);
@@ -547,6 +557,11 @@
     scene.add(light);
   }
 
+  // The imported door and lamp arrive validated and already placed by the loader, which also
+  // owns their geometry, materials and textures. Attach as-is, once: no scale, no offset here.
+  // Each imported mesh has its own geometry, so batching below leaves all of them in place.
+  if (pilotRoot) scene.add(pilotRoot);
+
   scene.updateMatrixWorld(true);
   instanceStaticMeshes(scene, resources);
   scene.updateMatrixWorld(true);
```

Second diff, assembled to tuned:

```diff
--- build-studio.ts@d8abf67f
+++ build-studio.ts@e23588e2
@@ -44,6 +44,42 @@
 }
 
 /**
+ * Runtime response of the imported door and lamp, set on the loader's own material objects
+ * (found by profile name, absolute values, so repeating it changes nothing). Authored against
+ * the real renderer: one shadow sun, no bounce, no environment map, ACES at exposure 1.2.
+ */
+function tunePilotMaterials(pilotRoot: THREE.Group) {
+  const seen = new Set<THREE.Material>();
+  pilotRoot.traverse((object) => {
+    if (!(object instanceof THREE.Mesh)) return;
+    const material = object.material;
+    if (!(material instanceof THREE.MeshStandardMaterial) || seen.has(material)) return;
+    seen.add(material);
+    switch (material.name) {
+      case 'lib_linen_shade':
+        // The glow carries the shade: less surface response, a lower and creamier emissive,
+        // so the map's warm core and darker head and foot show without clipping.
+        material.color.setRGB(0.62, 0.62, 0.62);
+        material.emissive.setRGB(0.8, 1, 1.5);
+        material.emissiveIntensity = 1.25;
+        break;
+      case 'lib_linen_trim':
+        // Bands and seam sit a step below the linen so they read against it.
+        material.emissiveIntensity = 0.2;
+        break;
+      case 'lib_dark_oak':
+        // Twice the exported value: the architrave separates from the wall, still below the leaf.
+        material.color.setRGB(0.2045, 0.1225, 0.0687);
+        break;
+      case 'lib_brass':
+        // Fully metallic brass is black with no environment to reflect; match the room's brass.
+        material.metalness = 0.6;
+        break;
+    }
+  });
+}
+
+/**
  * Original, deliberately stylised studio; no imported models or product claims.
  * The room is a closed box seen from one fixed eye (see view-config.ts), so every
  * prop is placed by its sightline from that point and no exterior face can show.
@@ -545,12 +581,19 @@
   key.shadow.normalBias = 0.025;
   key.shadow.bias = -0.0004;
   scene.add(key, key.target);
-  const practicals: ReadonlyArray<readonly [number, number, XYZ, number]> = [
+  // The imported shade is larger than the procedural one, and the old lamp position sits on
+  // its surface and burns a white disc into it. Inside the shade, on the room side of the
+  // bulb, the outer linen faces away from the light and the wall pool grows instead.
+  const lampLight: XYZ = pilotRoot ? [4.56, 3.5, -0.02] : [4.4, 3.35, 0.1];
+  const practicals: Array<readonly [number, number, XYZ, number]> = [
     [0xffd2a0, 12, [-1.6, 3.85, 0.3], 7], // linear pendant over the desk
     [0xffb15c, 8, [0.55, 3.8, -1.45], 6], // triangular wall lights
-    [0xffdeb2, 9, [4.4, 3.35, 0.1], 6.5], // music corner floor lamp
+    [0xffdeb2, 9, lampLight, 6.5], // music corner floor lamp
     [0x9db4cc, 4, [4.35, 3, 1.5], 6], // dusk window, cool counterpoint
   ];
+  // Nothing but ambient reaches the door end: the sun travels away from it and the lamp only
+  // grazes it. A low lamp-coloured fill stands in for bounce on the door and the wall beside it.
+  if (pilotRoot) practicals.push([0xffdeb2, 3, [3.3, 3.3, 3.2], 5]);
   for (const [colour, intensity, position, distance] of practicals) {
     const light = new THREE.PointLight(colour, intensity, distance, 2);
     light.position.set(...position);
@@ -560,7 +603,10 @@
   // The imported door and lamp arrive validated and already placed by the loader, which also
   // owns their geometry, materials and textures. Attach as-is, once: no scale, no offset here.
   // Each imported mesh has its own geometry, so batching below leaves all of them in place.
-  if (pilotRoot) scene.add(pilotRoot);
+  if (pilotRoot) {
+    tunePilotMaterials(pilotRoot);
+    scene.add(pilotRoot);
+  }
 
   scene.updateMatrixWorld(true);
   instanceStaticMeshes(scene, resources);
```
