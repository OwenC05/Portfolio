# Studio v2 — scene art direction (S art performer, Claude)

14 November 2026. Owner of `scene/build-studio.ts`, `scene/textures.ts`, `scene/view-config.ts`.
Status: **assembled, visual gate pending.** Nothing here is approved until root's actual captures are inspected.

## Review of the seed proposal

Inspected: `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/final-first-1440.png` (v1: small external diorama in a bordered card, gear uniformly distant) and `.omx/context/jesse-reference-look-20261114.png` (reference for authored depth and local light only; its exterior object and neon palette are not followed).

I keep the seed's direction (visitor's seat, timber desk foreground, three screens, music corner on the right, warm practicals with a cooler counterpoint) and change these points:

| Seed | Decision | Reason |
| --- | --- | --- |
| Eye `(-0.6, 2.85, 4.2)`, FOV 54 | Eye `(-0.7, 2.8, 3.4)`, FOV 58 | 1.5 m from the desk edge still shows floor in front of the desk, which reads as standing back. At about 1 m the desk edge sits near the bottom of the frame and perspective convergence is stronger, while the kit's left third still shows at home. |
| Yaw −40…+64 | −38…+58 | +64 on a 16:10 desktop ends on bare wall near the viewer. +58 ends on window and door. |
| Pitch −18…+12 | −16…+12 | −16 already puts the desk's front edge at the bottom of the frame; further down is only floor. |
| Wall lights behind the desk | Moved to the right of the screens | The eye never translates, so the raised fourth screen would hide them permanently. |
| Snowboard in the back-left corner | Leans on the left wall beside the desk | Same reason: the corner is permanently behind the left screen. |
| Flat row of three screens | Side screens turned 0.3 rad toward the seat; all about 8% larger | Wraps the viewer and improves the projected width of the side faces. |

Because the eye is fixed, the room is composed as one panorama: every prop is placed by azimuth and elevation from the eye, and anything that could never be seen is not built.

## Camera (`STUDIO_VIEW`)

Heading zero faces −Z, positive yaw right, positive pitch up, degrees. Two units are about one metre.

| Field | Value |
| --- | --- |
| eye | `[-0.7, 2.8, 3.4]` (about 1.35 m above the floor) |
| desktopFov / mobileFov | 58 / 64 vertical |
| desktopHome | yaw −4, pitch −6 |
| mobileHome | yaw −13, pitch −8 |
| yawBounds | −38 … +58 |
| pitchBounds | −16 … +12 |
| near / far | 0.1 / 30 |

Intended music composition: about yaw +44, pitch −8. No mathematical impossibility found: the nearest opaque surface on any reachable ray is 2.6 units away, far beyond the near plane.

## Geometry and enclosure

Closed six-sided shell, inner faces at x −4.5/5.1, z −2.12/6.6, floor 0.11, ceiling 5.3, with continuous skirting, cornice and four ceiling beams. A closed box cannot show an exterior or void at any yaw, pitch or aspect; the open question is only whether each visible surface is finished.

- Back wall: acoustic slat panels behind the kit, triangular wall lights.
- Left wall: timber shelf (books, plant, small speaker), snowboard with bindings toward the room, framed abstract print, cable run to a socket.
- Right wall: dusk window with half-drawn blind, floor lamp, closed door at the far limit.
- Desk: true-bevel timber slab, fabric mat, staggered 62-key board with tapered caps in a frosted case, mouse, notebook, mug, nearfield speaker, boom microphone, headphones; tower and subwoofer beneath.
- Screens: hinge, weighted foot and descending cable under each project display; the raised fourth screen stays decorative with no border or target.
- Music corner (right): white 49-key controller with timber cheeks forward of the electronic kit, drum throne and keyboard stool, rug.

## Light

Neutral-cool hemisphere ambient; one warm directional shadow caster (2048 map) from behind the seat's right shoulder; four non-shadowing point lights tied to visible fixtures: linear pendant over the keyboard (dominant), wall triangles, floor lamp, and a low cool light at the window. Architecture receives shadows but does not cast. No animation, no post-processing.

## Occluders

Collected after `instanceStaticMeshes` by traversing the live scene: every `Mesh`/`InstancedMesh` that is not `userData.interactive` and whose material is opaque with depth write. Contact planes, frosted case and tower glass are excluded; the unlit border planes directly behind each target are excluded with the targets.

## Synthetic CPU checks (not render evidence)

A scratch Node probe built the real model with inert canvas painting.

- 87 meshes after batching, 46 shadow casters: estimated first-frame peak 133 draw calls and about 100k triangles including the shadow pass (budget 200 / 200k). Browser `renderer.info` is the authority.
- 25,350 rays over every reachable yaw/pitch at aspects 0.4 and 3.6: zero misses.
- Home projections, all three faces 81/81 sample rays unoccluded:

| Viewport | Central width | Copilot width | TypeForge width |
| --- | --- | --- | --- |
| 1440×900 | 413 px | 215 px | 200 px |
| 1024×768 | 353 px | 184 px (left edge 9 px inside) | 171 px |
| 390×844 | 336 px | cropped by design | cropped by design |
| 320×568 | 226 px | cropped | cropped |

- `tsc --noEmit --incremental false` exits 0 with all three files in place.

## Tradeoffs and open issues

- 4:3 desktop leaves the left screen only 9 px inside the frame at home. If root's chrome or a narrower desktop clips it, the fix is home yaw −6, not a wider FOV.
- At 16:10 home the microphone sits on the left frame edge and is cropped; intended as a foreground crop, to be judged in capture.
- Exposure, light balance, texture contrast and emissive strength were set without a real render. Expect tuning after the first captures; the room may be too dark or the fixtures too hot.
- Metals have no environment map, so they rely on light highlights only.
- The existing CPU test loader stubs Canvas 2D; textures therefore use only fill/stroke/gradient calls and `build-studio.ts` adds no new imports.
