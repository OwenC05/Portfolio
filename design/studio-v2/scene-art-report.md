# Studio v2 — S art performer report (Claude)

14 November 2026. Task `task_db6c9a1e00a2`, dispatch `ctx_a8d22de16f2f`, coordinator `term_d778dd3c-3d00-45ad-b8a3-c9fdcaee8e94`.

**Status: bounded assembled prototype, frozen by user steering. Not visually approved.** Root relayed a user request to author assets in Higgsfield, Blender and Meshy before further Three.js refinement, so the repairs below are proposed and deliberately not applied. Independent Claude visual acceptance and independent Codex correctness review are both outstanding.

## What changed

| File | sha256 | Change |
| --- | --- | --- |
| `components/studio/scene/build-studio.ts` | `364da680f5111138207a03a72579d7e6491a5e4fc09f8786b5de794d69fb1ec3` | Open diorama replaced by a closed six-sided room with dressed walls, rebuilt desk foreground, turned side screens, music corner kept right, `occluders` gathered from the live scene after batching |
| `components/studio/scene/textures.ts` | `09f6ff6cc7bb8910f09838566dfcf840d85a0d2ce1be8d064deafb0989c63aa6` | New floorboard, plaster, rug and dusk-window textures; richer desk timber; screen diagrams unchanged apart from anisotropy |
| `components/studio/scene/view-config.ts` (new) | `1fea7adbcfd730a56920389c8ac4ecf8323c9739fd4882c15f3e134a11f1a450` | `STUDIO_VIEW` |
| `design/studio-v2/scene-art-direction.md` | — | Seed review, numeric camera, enclosure and light direction |

`STUDIO_VIEW`: eye `[-0.7, 2.8, 3.4]`; desktopFov 58; mobileFov 64; desktopHome yaw −4 pitch −6; mobileHome yaw −13 pitch −8; yawBounds `[-38, 58]`; pitchBounds `[-16, 12]`; near 0.1; far 30.

Hashes re-read after the final captures; they match the assembled-ready message. No other owner's file was edited. No dependency, external asset, build, server or browser use.

## Checks I ran

- `npx tsc --noEmit --incremental false`: exit 0.
- Scratch Node probe, synthetic and not render evidence: 87 meshes after batching, 46 casters, estimated first-frame peak 133 draw calls and about 100k triangles including the shadow pass; 78 occluders, none detached; zero misses over 25,350 rays across the reachable look range; all three project faces unoccluded at home. Browser `renderer.info` numbers were not measured by me.
- I did not run `verify-controller.mjs`; it is Codex-owned.

## Actual images inspected

All under `.omx/artifacts/visual-ralph/portfolio-immersive-v2/early/`:
`initial-1440.png`, `right-1440.png`, `top-390.png`, `right-390.png`, `top-320.png`, `left-up-1440.png`, `left-down-1440.png`, `right-up-1440.png`, `right-down-1440.png`.

Not inspected: `panel-1440.png`, `panel-390.png`, `panel-320.png`, `initial-390.png` (superseded per root), and the four `*-320` corner captures.

Baseline and reference inspected earlier: `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/final-first-1440.png`, `.omx/context/jesse-reference-look-20261114.png`.

## Concrete feedback from the captures

Holds in the inspected frames:

- Eye-level interior; walls, floor, ceiling beams and cornice close every frame including all four desktop corners. No slab edge, cutaway or void.
- At 1440 home the three project screens are fully in frame and unoccluded; desk, keycaps, frosted case, mug and notebook resolve at normal size.
- Right view separates white keys, black keys, controller pads, drum pads, cymbals, rack, lamp and window. Timber, ivory and rubber stay distinct.
- Left view shows shelf, print, snowboard bindings, microphone and subwoofer under the desk.

Proposed repairs, not applied:

1. **Emissive clipping.** Wall triangles, pendant strip and the lamp shade's lower rim burn to featureless white. Roughly halve `glow`/`shade` emissive and darken their base colour.
2. **Mouse.** Reads as a white cube with a black slot in `initial-1440` and `left-down-1440`. Needs a low rounded body.
3. **Door.** In `right-up-1440` and `right-down-1440` the two inset panels are large near-black slabs with stretched corners, and the door is the darkest, least finished surface in the room. Needs shallower panels in the door's own timber and some light.
4. **Narrow portrait.** In `top-320.png` (320×844) the central screen is cropped on both sides: `mobileFov` 64 only fits aspects of about 0.42 and wider. Either raise `mobileFov` to 70 (stronger portrait perspective) or have the controller enforce a horizontal-FOV floor (Codex-owned).
5. **Microphone at desktop home.** A dark shape on a dark wall, cropped by the frame and under the identity chip. Move slightly or accept as a crop.
6. **Stretched bevels.** Scaled rounded boxes give uneven corner radii on the acoustic panels and screen bezels, visible in the corner views.
7. **Dark upper right.** In `right-up-1440` the ceiling and right wall above the door fall close to black.
8. **Left shelf at home.** Books are cut by the frame and chip; low priority.

Outside my files: `top-320.png` looks hazed and low-contrast compared with `top-390.png` of the same scene; likely an overlay or capture state.

## Limits

- No visual self-approval. The independent Claude critic's verdict on this snapshot is the baseline evidence.
- Light balance and exposure were set once without iteration against captures.
- Left-limit and pitch-limit views at mobile widths, and the open-panel states, were not judged by me.
- Asset authoring in Higgsfield, Blender or Meshy is pending root's revised plan and tool preflight; nothing was started, generated, uploaded or purchased. If authored assets replace procedural props, the camera values and the fixed-eye sightline placement in `scene-art-direction.md` still apply, and the draw-call/triangle estimate above no longer does.
