# Studio v2 full kit — M0/M1 author report

15 November 2026. Claude (actual), task `task_e764ee6e591c`, dispatch `ctx_e505418a28c6`. Profile `studio-full-kit-v1`.

This is the author's own account. It is not a look verdict and I do not approve my own work. The stage stops here for root's M1 decision on P1 (phone lens and home), P2 (scale tiers) and P3 (monitor setback and border gaps), and the source is held for an independent Claude critique.

## What exists

M1 is a blockout. The room enclosure and the pilot door and lamp are modelled. Every node whose name contains `__proxy` is a grey or flat-coloured stand-in box or cylinder, not a finished asset.

| Stage | Baseline | Proposal |
| --- | --- | --- |
| Placement | Exact current `build-studio.ts` (`e23588e2…`) positions and sizes | 60 mm central-monitor setback, tier-sized gear, moved controller, headphones on a stand, taller snowboard |
| Border | 2.5 mm behind the face, 13.75 mm overhang per side | 4 mm behind the face, 10 mm overhang per side, 17.5 mm bezel lip |
| Mesh leaves / triangles | 122 / 7,272 | 138 / 7,464 |
| Proxy leaves | 72 | 88 |
| GLB size, gzip estimate (validator) | 667,520 B, 399,240 B | 673,348 B, 399,953 B |

Both variants: root `studio_full_kit`, depth 1, 10 materials, 5 embedded PNGs (largest 1024×256), one extension (`KHR_materials_emissive_strength`), no cameras, lights, animation, tangents or vertex colour. 325,195 B of each file is the three pilot textures.

Seven binding quads (three targets, three borders, `display_studio`) and `rt_window_dusk` are each four vertices and two triangles. Read back from the v02 bytes, the baseline dissertation face is at runtime x −2.55…−0.67, y 1.85…2.91, z −0.216, which matches the current matrices; the proposal face is at z −0.336.

### Current candidates (v02)

All paths are under `design/studio-v2/asset-pipeline/full-kit/`.

| File | sha256 |
| --- | --- |
| `exports/studio-full-kit-m1-baseline-v02.glb` | `04994845f62236c6230dce1ba8af7d9811e21fc1e45c0fff6a89be7f06777093` |
| `manifests/studio-full-kit-m1-baseline-v02.manifest.json` | `fab5ed35086773ee380103014a7c05760953fcea3437f71b0e20da9d1d858b3f` |
| `manifests/studio-full-kit-m1-baseline-v02.validator-report.json` | `70de87093817da4ac93f49f636148e78c093f04569af1a7629ffe9306798404e` |
| `source/fk-10-arch-blockout-baseline-v02.blend` | `7d1b72fd45f776e0bf237eb65fb305afdf33b06b970f065a19034ed05e67da12` |
| `exports/studio-full-kit-m1-proposal-v02.glb` | `bdc997b45917be0c72480af9738362e9940e5159b07781eac2bfa6b86b01fe76` |
| `manifests/studio-full-kit-m1-proposal-v02.manifest.json` | `8c290bbe555b8d0737e07639b2b34ee289a0b6d903c91380e13f133b074773aa` |
| `manifests/studio-full-kit-m1-proposal-v02.validator-report.json` | `a78281aed5fcc2c6e79d4359cafdf4c98875f75d4c15652dd3aa55dd58684939` |
| `source/fk-10-arch-blockout-proposal-v02.blend` | `4f70d7bbf1d547593b48e74cdfb876cf2506d6413cd7395369455ccc6c73d008` |
| `source/fk-00-library-v01.blend` (M0: 12 library materials, palette atlas) | `6832ddd5227d0a543d67bdf61357441dba9107ac6812af835113bac573a1d6e4` |
| `source/build_fullkit.py` (as used for v02) | `1a66c8be156c8ef7208f8ccba8c0fee7130f962ba2ba280a98f8aa450404d3a5` |
| `source/render_cam.py` | `d417c68f93481fc731c38f11c36bb774045984eba0fd5eb1d575b9d6d54d2780` |
| `asset-inventory.json` (unchanged) | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |
| `components/studio/scene/build-full-studio.ts` | `5a4e8296e04d66cfeaedf59bedee8c633b378c84126de52b78eaabe421c0f02f` |

The v02 manifests were written by Codex's `technical/export-manifest.mjs`. `manifests/*-v02.author-readback.json` are my own readbacks from the exported bytes, kept for the camera arithmetic and the proxy and inventory lists.

### Superseded, kept (v01)

Rejected by Codex's byte preflight: the reserved quads had V flipped (bottom-left UV `[0,1]`). v02 changes only those eight UV layouts. v01 GLBs `d0875582…` (baseline) and `3d5194e0…` (proposal), manifests `52e24bfa…` and `5855959d…`, blends `138db1fa…` and `be8b705b…`, built with the script at `1786eea4…`.

## Commands and results

Every Blender run was one hidden process: `blender.exe --background --factory-startup --disable-autoexec --python-exit-code 1`, Blender 5.2.3.

| Step | Result |
| --- | --- |
| `build_fullkit.py -- baseline v01 library blend glb` | Two failed attempts (exit 1: missing UV layer on shared primitives; library materials removed by cleanup), both fixed, then exit 0 |
| `build_fullkit.py -- proposal v01 blend glb` | Exit 0 |
| `build_fullkit.py -- baseline v02 blend glb`, `-- proposal v02 blend glb` | Exit 0, exit 0 |
| `node technical/export-manifest.mjs …` ×2 | Exit 0, exit 0 |
| `node technical/validate-full-kit.mjs … --report …` ×2 | Exit 0, exit 0 |
| `render_cam.py`, ten runs | One exit 1 (wrong property name, fixed), then ten exit 0, 19–30 s each |
| `npx tsc --noEmit -p .` | Exit 0 |

Memory readouts during the work: 0.6, 1.1, 0.7, 0.9, 1.7 and 1.4 GB free of 15.7 GB; `vmmemWSL` held about 5.7 GB throughout. Nothing was killed. No Blender process is running.

## Previews and what I saw

Ten Cycles previews of **baseline v01** are in `renders/` (32 samples, 45 s limit, reference point lights). v01 and v02 geometry are identical apart from binding UVs. Root's hold on further previews arrived after these had finished, so there are **no proposal renders** and no `left-up` frame. These show layout direction only; they say nothing about how the room looks in the site.

I opened five at normal size: `home-320-f64_half`, `home-1440_half`, `pano-eye_full`, `home-320-f74_full`, `music-1440_half`. The other five (`home-320-f64_full`, `home-390-f64_full`, `right-up_half`, `left-down_half`, `right-down_half`) rendered with exit 0 and I have not looked at them.

- **Enclosure:** the panorama shows walls, ceiling, floor, beams, skirting, door and window closed all the way round, with no hole or backface. I did not measure the under-10 luminance share; the floor under and behind the desk is close to black in this lighting.
- **Home, desktop:** three monitors, top display, pendant, keyboard, mouse, mug, notebook, speaker and the edge of the drum proxies are all in frame. The white PC proxy is only a sliver at the bottom edge.
- **Wall triangles:** the five proxy tiles are flat clipped white squares. That is the proxy and the preview light, but it is the fault the finished asset has to avoid.
- **Music view:** controller slab, stool, drum discs, lamp, window with blind and the switch read clearly. The window frame renders a lighter honey than I expected of the dark trim timber, because I folded the pilot's runtime lightening into the source; whether it now matches the door and beams is for the critic and a runtime capture.
- **Phone, 320 at FOV 74 (baseline):** the central bezel's right edge sits at the frame edge and the left side monitor intrudes on the left, as the arithmetic below predicts.

## Framing arithmetic (candidates, not production)

Projected from the saved Blender cameras: outer bezel edge of the central monitor, in pixels from each side of the frame. This is geometry, not a render, and not a runtime measurement.

| Camera | Baseline left / right | Proposal left / right |
| --- | --- | --- |
| 320×844, FOV 64, home −13/−8 (current) | −22.7 / −17.7 | −8.0 / −11.0 |
| 390×844, FOV 64, home −13/−8 (current) | 12.3 / 17.3 | 27.0 / 24.0 |
| 320×844, FOV 70, home −14/−7 | 8.9 / −9.5 | 21.7 / −3.5 |
| 320×844, FOV 74, home −14/−7 | 19.6 / 2.5 | 31.5 / 8.1 |
| 320×844, FOV 76, home −14/−7 | 24.5 / 8.1 | 36.1 / 13.5 |
| 390×844, FOV 74, home −14/−7 | 54.6 / 37.5 | 66.5 / 43.1 |
| 320×568, FOV 74, home −14/−7 | 65.5 / 54.0 | 73.5 / 57.8 |

This goes against my earlier recommendation. FOV 74 with home −14/−7 does not give 12 px each side at 320 in either variant; the frame is off-centre to the right. Only the proposal at FOV 76 clears 12 px on both sides, or FOV 74 with roughly one degree less yaw (about −13), which I have not computed exactly. Both stay proposals for root's gate.

## Known limits

- Not represented at all: `mon_cables`, `music_cables`, `under_desk_power`, `wall_cable_run` (55 of 59 inventory assets have a node).
- `lib_frost` and `lib_glass` are in the library but unused, so absent from the GLBs. The only blended material exported is `lib_contact` (three contact planes).
- Bounds minimum is y −0.02 m: something in the migrated pilot geometry dips 20 mm below the floor plane. I have not identified which part.
- The M0 swatch board and bevel card from gate G0 were not rendered. The G1 byte ledger exists (validator report); the coverage-envelope overlay and chrome-rectangle overlays do not.
- `build-full-studio.ts` typechecks but has never run in a renderer. Its light values are the pilot-v02 rig copied unchanged, not tuned for this room.
- I ran no browser, build or capture, and changed no production file. `build-studio.ts` is still `e23588e2…`; `view-config.ts` is untouched.

## Remaining gates

1. Root's runtime capture of a v02 candidate through Codex's loader and `createFullStudio`.
2. Independent Claude critique of the blockout and those captures.
3. Root's M1 decisions P1, P2, P3. Nothing in M2–M5 starts before them.
