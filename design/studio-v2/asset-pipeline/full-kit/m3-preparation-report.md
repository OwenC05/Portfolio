# M3 nearfield: source preparation report (v01, prepared, not run)

Task: task_d31f70e55a5d / ctx_5abdce20e965, Part B. Owned files: `source/build_fullkit_m3.py` and this report.

**Status.** This is source preparation only.
- `build_fullkit_m3.py` has not been executed, and no Blender process was started for M3.
- No M3 GLB, saved assembled blend or measurement file exists.
- The parent is `exports/studio-full-kit-m2-proposal-v05.glb` (sha256 `4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735`). Fable's bounded PC verdict on it is APPROVE (msg_8a07d41cbc85).
- Root's parent disposition and the next frozen-parent handoff are still pending.
- M3 export, root capture, and root visual and budget acceptance all belong to the next gate.

Script: `source/build_fullkit_m3.py`, 54,142 bytes, sha256 `7138fed965bb145febec3865d704a3cce80d394a23687972ff9cd1c536814ec2`. Its only check so far is a Python AST syntax parse.

**Frozen and handed off (root msg_0b32ff62c6db).**
- Root adopted PC v05 in `m2-v05-root-disposition-and-m3-release.md`.
- The technical preflight (`m3-export-preflight-review.md`) found a known guard failure. The paired check compares raw node JSON other than `mesh`. The intended swap of 11 proxies for 9 leaves changes the root node's `children` from 117 to 115 entries, so that comparison cannot pass for `studio_full_kit`.
- The script is frozen at the SHA above. Only its technical readback guards (§7) pass to S, who is to implement:
  - semantic expected-child-name and hierarchy substitution that preserves the other retained fields and bindings;
  - exact T2 RGBA and image-reference validation, where needed.
- S's change involves no art choice and no change to geometry or material values. There is no blanket exclusion of the hierarchy and no new numeric tolerance.
- I will not edit the file until the lease returns.
- **No Blender run and no M3 export happen until the guards are corrected and preflighted.**

## 1. Guards built into the script

| Guard | Behaviour |
| --- | --- |
| Pinned inputs | Asserts the SHA-256 of `build_fullkit_m2_pc_v04.py` (`62d0733e…`), the v05 byte step `build_fullkit_m2_pc_v05.py` (`27a6112a…`) and the v05 GLB (`4b2f7b8f…`). |
| Editable parent | Runs the v04 builder dry (argv `--`, writes nothing). That is the editable state of both v04 and v05, because v05 adds no editable change. |
| Export / save hold | The `blend` and `glb` flags are refused unless the environment variable `FK_M3_PARENT_RELEASE` equals the v05 SHA-256. Root or the export handoff sets it once v05 is the released frozen parent. With no flags it is a dry run that writes nothing. |
| No overwrite | Every deliverable path is checked as fresh. The GLB is opened with `'xb'`. |
| Proxy removal | Removes exactly the eleven `__proxy` leaves of the eight M3 assets, and asserts that list. |
| Row ceilings | Each leaf's triangle count is asserted against its root-binding ceiling before anything is written. Stage totals are asserted against 10 main / 18 refresh / 15,500 placed. |
| Exact counts | Every M3 mesh is explicit bmesh geometry, with no modifiers, curves or bevels, so authored and exported triangles are equal. |
| Accepted geometry | A BVH overlap of each M3 leaf against all M1/M2 leaves, architecture and targets must be empty (assert). Overlaps with later-stage proxies and contacts are recorded only. |
| Targets | 81 rays per project target from the fixed eye must all hit the target plane (assert). |

## 2. Nine rows: analytic triangle counts against ceilings

The counts are derived from the authored topology. They are exact for the code as written, and the script re-asserts them at run time.
- A quad is 2 triangles and an n-gon cap is n − 2 triangles.
- `create_cone` uses n-gon caps (`cap_tris=False`).

| Leaf | Composition | Triangles | Ceiling | Casts | Main | Refresh |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| kb_case__frost_shell | 6 rounded-rect rings × 24 + 2 caps | 284 | 700 | no | 1 | 1 |
| kb_case__plate_cable | plate 60, 4 feet 96, USB-C plug + boot 24, 4-sided coiled lead (58 points) 460 | 640 | 700 | yes | 1 | 2 |
| kb_keycaps__caps | 67 caps × 40 (skirt, top, dish, centre) | 2,680 | 4,700 | no | 1 | 1 |
| mouse_native__body | 25 × 13 loft + 2 poles 650, wheel 48, 2 glide feet 56 | 754 | 900 | yes | 1 | 2 |
| mug_coaster__mug_coaster | coaster 192, mug lathe 384, handle 144 | 720 | 800 | yes | 1 | 2 |
| notebook_pen__set | covers 56, pages/spine/band 60, pen 100, clip 12 | 228 | 400 | yes | 1 | 2 |
| mic_boom__assembly | clamp 36 + 160, 3 joints 192, 2 arms with springs 836, capsule 280, shock ring 160, struts 24, cable 76 | 1,764 | 2,600 | yes | 1 | 2 |
| headphones__on_stand | base 256, post 48, cradle 12, band 272, 2 × (yoke 152, cup 288, pad ring 192) | 1,852 | 2,200 | yes | 1 | 2 |
| speaker_nearfield__cabinet | pad 28, cabinet 60, woofer ring + cone 456, tweeter ring + waveguide 340 | 884 | 1,100 | yes | 1 | 2 |
| **Stage** | | **9,806** | 14,100 forecast / 15,500 limit | 7 casters | **9** | **16** |

- Refresh triangles = Σ placed × (p + s) = 9,806 + 6,842 = **16,648**, against the 22,800 forecast.
- The frost shell is single-sided, so p = 1 rather than the double-sided p = 2.
- Every row is under its ceiling. The 25,000-triangle reserve is untouched.

## 3. Placements and reasons

All positions are in Blender metres. Desk top 0.735, mat pocket floor 0.7437, EPS 0.3 mm.

| Asset | Placement | Reason |
| --- | --- | --- |
| Keyboard | Centre (−0.795, −0.33) on the mat. 0.52 × 0.18 case, 20 → 30 mm sheared typing angle, 3 mm feet. | 30 mm right of the proxy, to reduce overlap with the project list in home-1440 (planning estimate). |
| Keycaps | 65%-class, 67 caps, 5 × 16 u rows, pitch 30.5 mm. Sculpted rows (+10 / +5 / 0 / −3 / −7°), dished octagonal tops. Cream alphas, sage modifiers, yellow Esc, pink Enter, blue arrows. | Art gate: a coherent frosted compact pastel keyboard with 67 caps. |
| Cable | 6-turn coil on the mat, over the mat rim, across the desk to the grommet (−0.60, 0.22), down into the tray, ending on the tray floor. | Uses the M2 grommet and tray, with no new hole. |
| Mouse | Centre (−0.395, −0.34) on the mat, yaw 0. 160 × 99 × 56 mm symmetric superellipse loft. Two button splits (a 3° black groove for t ≥ 0.53), a rear-of-buttons seam and a wheel. No cable, disc or facets. | 160 / 30.5 = 5.2 key pitches long and 3.2 wide. **Risk:** the gate says "three to four key pitches long". Width is 3.2; length is 5.2. See §8. |
| Mug | (0.04, −0.44) on an oak coaster, handle at −35°. | Clear of the TypeForge stand foot (critique). The script measures the projected overlap. Discoverable; it does not have to fit the tall-phone home. |
| Notebook + pen | (−1.45, −0.30), yaw 6°, left of the keyboard. | Moved off the keyboard's right, where the mouse and mug sit. |
| Headphones | Stand at (0.30, −0.22), yaw 45°. Dark-oak base, black post, band zc 0.94. | A separate object from the monitor stand, right of the TypeForge stand. Outside the project list (planning estimate). |
| Mic | End clamp on the left desk end at y 0.17. The lower jaw stays outside the side rail (x ≤ −1.850 against the rail at −1.835). Boom pivot (−1.875, 0.17, 0.835), elbow (−1.95, −0.02, 1.38), capsule centre (−1.60, −0.36, 1.10) tilted toward the seat. | Recognizable broadcast-mic silhouette, separate from the monitor stand. Clear of the copilot screen (planning estimate; the target-ray assert proves it). |
| Speaker | (0.36, 0.12), yaw −22°, at tier ×1.25: 231 × 263 × 356 mm on a 19 mm fabric pad. White cabinet, black-metal woofer and tweeter bezels. | Critic's C1 suggestion of ×1.25, to reveal more of the left cymbal. **Honest estimate:** the left cymbal is still partly covered (about 20% bounding-rect overlap, against about 60% for the ×1.6 proxy). The script measures the fixed-eye ray result. |

## 4. T2 palette cells

| Index | Cell (row, col) | Name | sRGB | Roughness | Metallic | Consumers |
| ---: | --- | --- | --- | ---: | ---: | --- |
| 19 | (2, 3) | oak_tone | #a47c55 | 0.62 | 0 | M3 coaster; later M4/M5 oak trims |
| 20 | (2, 4) | dark_oak | #5e4130 | 0.55 | 0 | M3 headphone base; later dark-wood parts |

How the cells are written and checked:
- Both were unused (black colour, ORM 1/1/1).
- The script writes 2 × 256 pixels into the in-memory `fk_palette_colour` and `fk_palette_orm`, using M1's bottom-up row order and display-sRGB encoding.
- It calls `update()` and `pack()`, but never `image.save()`, so `textures/` is not touched.
- It asserts that every other pixel is unchanged.
- After export, it decodes both PNGs (a pure-Python decoder) and fails on any changed pixel outside the two T2 cells.

Consumer impact:
- Existing swatch UVs and cells keep their meaning.
- Existing leaves sample only their own cell centres, so their appearance is unchanged.
- Runtime consumers of the palette must accept the re-encoded PNG (new bytes, same size). The texture byte change is part of the M3 GLB delta.

## 5. Frost material

`lib_frost` is first consumed in M3 (asserted unconsumed before), by `kb_case__frost_shell`:
- `use_backface_culling = True`, which exports glTF `doubleSided: false` and needs one main pass.
- Alpha 0.42 BLEND, from M1.
- Node extras: `role: transparent`, `transparent: true`, `occluder: false`, `nocast: true`, `receiveShadow: false`, and an explicit `renderOrder: 1.5`.
- The renderOrder sorts after contact decals (1) and before PC glass (2), which is what profile-core requires for BLEND nodes.
- The runtime loader disables depth writing; no loader change is needed.
- The paired check fails if the exported material or the extras differ from these values.

## 6. Budget

| Item | M3 | Allocation |
| --- | ---: | --- |
| Main calls | 9 | stage limit 10 |
| Refresh calls | 16 | stage limit 18 |
| Placed triangles | 9,806 | forecast 14,100 / limit 15,500 |
| Refresh triangles | 16,648 | forecast 22,800 |

- Global budget: 120 main / 165 refresh / 140,000 weighted triangles. The adopted stage plan totals 148 refresh plus the 17-call root reserve.
- M3 stays inside its stage share, so it draws on neither the reserve nor the 25,000-triangle overrun reserve.
- C1, C2, R1 and R2 stay held. T1 is later.
- Hosted JS is unaffected (391,334 gzip / 333,289 Brotli). M3 changes only the GLB.

**Bytes forecast.**
- At about 11.0 gzip bytes per unique triangle (±15%), 9,806 new triangles add about **108 KB gzip** (92–124 KB).
- Removing the 11 proxies and re-encoding the two PNGs shifts that only slightly.
- The v05 GLB is 586,955 gzip, so the forecast M3 GLB is about 680–710 KB gzip.

These numbers are a forecast. Measured sizes come only from the released export.

## 7. Export path, paired check and noise rule (for root's decision)

Export runs only when it is released, and it follows the v02–v04 path verbatim:
1. Bake, join `mon_cables` and `under_desk_power`, then the same exporter settings.
2. Keep the raw export as `exports/studio-full-kit-m3-proposal-v01.raw-export.glb`.
3. Run the paired check against v05, by node name:
   - The node set must equal v05 minus the 11 removed proxies, plus the 9 M3 rows.
   - Every retained leaf must match exactly: node JSON, mesh name, material, accessor JSON (except the bufferView index) and accessor bytes.
   - The frost material and extras must be as in §5.
   - Palette pixels outside the T2 cells must be identical.
4. If anything fails, the measurements are written and no candidate GLB is produced.

**Noise restoration.**
- The only deviation the script handles is the four named exporter-noise words that v05 already restored. Each is identified by mesh, attribute, vertex and component, and only when it holds the exact recorded v04 value: `desk_top__top_mesh.002` TEXCOORD_0 (197, 1), (199, 0), (274, 1), and `sub_woofer__cabinet_mesh.001` TEXCOORD_0 (85, 1).
- If the export reproduces these words, they are restored byte for byte to v05's value, and each restoration is listed in `exportReadback.namedNoiseRestorations`.
- No tolerance is applied. Any other difference fails.
- **Root decides** whether this named, value-pinned restoration is acceptable in the M3 export, or whether it should be removed so that any recurrence fails outright.

Outputs once released:
- `exports/studio-full-kit-m3-proposal-v01.glb`
- `source/fk-30-nearfield-proposal-v01.blend`
- `manifests/m3-v01-author-measurements.json`

## 8. Risks and unknowns

- **Projection claims.** Any pixel figure in this report or in the measurement file is a builder-camera planning estimate (home-1440, home-1024, music-1440, home-390-f74, home-320-f74, left-down, right-down).
  - Root capture showed that my v04 reconstructed mid-right and music-390 projections were wrong: root's real views do frame the PC.
  - So this preparation makes **no mid-right or music-390 claim**, and the script defines no such cameras.
  - Root captures the true views after export.
- **Mouse length.** At 5.2 key pitches it exceeds the gate's "three to four key pitches long" if that gate means length. If root reads the gate as length, change `MS['L']` to about 0.12 (3.9 pitches) and `MS['W']` to about 0.075, keeping the 0.62 aspect ratio. The triangle count does not change.
- **Cymbal.** The ×1.25 speaker still covers part of the left cymbal. A full reveal needs a move, not just the scale.
- **Run-time only.** These checks need the first dry run:
  - normals on open shells (keycaps with no bottom, the woofer lathe open at its rim);
  - `pack()` behaviour after a pixel edit in Blender 5.2.3;
  - the exact exporter image re-encode.
- **Not yet proven.** Clearances such as the mug against the headphone base and the speaker against the TypeForge stand are measured by the script but unproven until a run. The BVH and target asserts would stop a failing build.

## 9. Remaining gates

1. Root adopted v05. Still open:
   - S's guard correction in `build_fullkit_m3.py`: root-children substitution and exact T2 RGBA / image-reference checks;
   - its preflight;
   - the export handoff, including `FK_M3_PARENT_RELEASE`.
2. A single hidden Blender dry run of `build_fullkit_m3.py` when root allows it, then a released `blend glb` run.
3. Validator: `export-manifest.mjs` (proposal M3) and `validate-full-kit.mjs`, unchanged.
4. Root capture of the true views, then independent visual review against the art gates.
5. Root visual and budget acceptance. There is no self-approval.
