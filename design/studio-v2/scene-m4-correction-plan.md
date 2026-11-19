# M4 correction plan (CPU-only proposal)

**Status:** this is a proposal for a root decision. Nothing in it is approved: no correction, variance or waiver. No source, asset, report, ledger, mapping, guard or pair was changed. There was no Blender, browser, render, export, Git, dependency, paid action, process change or wait loop.

**Authority:** `scene-coordination/m4-correction-plan-task.md` (root msg_aee326c1fb5d via coordinator msg_164779cb41e3).
**Author:** actual Claude Opus 5.5/high, task_23314c669e03 / ctx_569e786e8807, 2026-11-15.
**Machine-readable matrix:** `scene-coordination/m4-correction-matrix.json` (sha256 `59fa954fdc61df8f1f9343dc93c384ed681666ce482d044d4f5986ddcffa2d77`). Rows C1–C13 below have the same IDs as the matrix rows.

## 1. Method and frozen inputs

**Units and gate.** Units are Blender metres, which equal glTF metres. Deviation is strict and signed: (measured − target) / target. The target is the stated value, or the violated bound of a range. The gate is |dev| ≤ 3.000% (`render-gates.md:65`), so −3.077% fails.

**Measurement.** Measurements are pure CPython/numpy on the frozen helper `c7ce9d8e`. Every vertex range is tagged by the helper source line that authored it, so each sub-part can be measured separately. I cross-checked all 18 v02 GLB rows (`baa1a43b`): triangle counts are equal and AABBs agree to within 1e‑7 m.

**Projections.** Projections come from a parameter-patched copy of the helper in the scratchpad, never in the repo. I checked tri-tri intersections against the frozen M3 v03 parent triangles, cast eye rays from Blender (−0.35, −1.70, 1.345), and used pinhole projections with the M1 cameras. These are planning numbers, not rendered pixels.

**Frozen inputs.** Re-hashed before and after this work; all unchanged:

| Input | sha256 prefix |
|---|---|
| source `build_fullkit_m4.py` | aa9724dc |
| helper `build_fullkit_m4_geometry.py` | c7ce9d8e |
| editable `fk-40-music-proposal-v01.blend` | 0ae40460 |
| raw export v01 | c10e6453 |
| pair GLB v02 / manifest | baa1a43b / 42597f1b |
| author report `m4-author-report.md` | 93d7c5c1 |
| tier ledger `m4-v01-tier-ledger.json` | 63848642 |
| evidence script `render_m4_v01_evidence.py` | bfa6fc9b |
| mapping `m4-model-contract.json` / guard `m4-transition-guard.py` | 8f0474aa / ad62627f |
| inventory / render-gates / art-direction | eddc33b5 / 15f10d9d / fd1c6d0e |
| render_cam.py / M1 baseline v02 GLB | d417c68f / 04994845 |

The full hashes, and the hashes of the scratch scripts and their outputs (non-durable), are in the matrix under `frozenInputs` and `method`.

## 2. Corrections to my own tier ledger (63848642)

The ledger stays frozen. These corrections supersede it for planning only.

- **Hi-hat pedal width:** 0.126 vs 0.13 is **−3.077%**. That is outside the gate, but the ledger misclassified it as within 3%.
- **Rack width:** the ledger reported "1.16", which is the upright centre spacing, not a width. The outer tube width is 1.202 m (+3.62%) and the frame including clamps is 1.232 m (+6.21%). This failure was not disclosed before.
- **Rack height:** there is no top bar. The uprights end 0.80 m above the floor; the frame's own height is 0.7914 m; booms reach 1.0024 m.
- **Pad heads:** the heads measure 0.2488 / 0.2988 m. The ledger's 0.27 / 0.32 were twice the shell radius.
- **Controller height:** there is no 0.095 slab. The white shell is 0.092 (−3.16%), the cheeks 0.099 (+4.21%) and the envelope 0.10389 (+9.36%), so every reading fails.

## 3. Size rows

| ID | Asset / leaf | Requirement (inventory line) | Semantics | Measured | Signed dev | Recommendation |
|---|---|---|---|---|---|---|
| C1 | ctl_body / shell | 0.99×0.32×0.095 (1515) | Whole envelope incl. knobs/pads (local frame) | 0.99×0.32×0.10389; cheeks 0.099; white shell 0.092 | H **+9.358%** (cheek +4.211, shell −3.158) | **Correct:** panel z 0.080/0.092 → 0.071/0.083; cheek rear 0.099 → 0.095 → envelope exactly 0.095; tris unchanged |
| C2 | ctl_stand (+ body, keys, sustain, stool, cables) | 0.68 high (1559) | Stand own height (foot underside → arm top) | 0.5641 (top 0.5727 above floor) | **−17.044%** (−15.779%) | **Correct:** zb 0.573 → 0.6889; needs a placement change (D) + stool shift. Fallback: variance E (§5) |
| C3 | drum_rack (frame) | 0.75 high (1623) | Frame own height; booms separate (belong to cymbals' "boom arms") | 0.7914 (0.80 above floor); booms 1.0024 | **+5.52%** (+6.67) | **Correct:** top 0.80 → 0.7586; module stub 0.72 → 0.57; ride clamp 0.715 → 0.57 |
| C4 | drum_rack (frame) + tom3 | 1.16 wide (1623) | Outer frame width incl. frame clamps | tube 1.202; incl. clamps 1.232; row incl. booms 1.2572 | **+3.621% / +6.207%** (row +8.38) | **Correct:** uprights 0.82/1.98 → 0.841/1.959; clamp bolts re-pointed (+y, down, inward); tom3 x 1.80 → 1.785 → frame 1.170 (+0.86%); row incl. booms 1.198 (+3.28%) unless the ride moves to x ≤ 1.955 |
| C5 | drum_pads (snare) | 0.25–0.31 dia (1644) | Rim outer dia; head and lugs separate | snare rim 0.332, lugs 0.3405, head 0.2988; toms rim 0.282 | **+7.097%** rim (+9.839 lugs) | **Correct:** snare r 0.16 → 0.147 → rim 0.306, lugs 0.3145 (+1.45%) |
| C6 | drum_cymbals (crash) | 0.38 dia (1666) | Lip dia, individually | 0.40 | **+5.263%** | **Correct:** R 0.20 → 0.19; bell 16/16, edge 32/32 |
| C7 | drum_cymbals (ride) | 0.38 dia (1666) | Lip dia, individually | 0.40 (hi-hat 0.38 passes) | **+5.263%** | **Correct:** R 0.20 → 0.19; bell 16/16, edge 32/32 |
| C8 | drum_hihat_pedal | 0.13×0.33 (1687) | Base footprint length | 0.30 | **−9.091%** | **Correct:** l 0.30 → 0.33; eye visibility 63 → 59/96 |
| C9 | drum_hihat_pedal | 0.13×0.33 (1687) | Base width | 0.126 | **−3.077%** (misclassified) | **Correct:** w 0.11 → 0.114 → 0.130 |
| C10 | drum_module | 0.20×0.15 (1730) | Case face W×H in the face frame (normal az 165°, tilt 35°); world AABB not used | 0.20×0.13×0.05 | H **−13.333%** | **Correct:** h 0.13 → 0.15; case 131/138 clear |
| C11 | rug | 1.85×2.25 (1795) | Authored outline (binding edge) | 1.655×2.25 | W **−10.541%** | **Variance (proposed/unapproved)**: infeasible, see §5 |
| C12 | music_cables (+ sustain lead) | 6 mm round (1816) | Diameter of each of the 8 single runs; the 18 mm module snake is a multicore bundle in the module row; the sustain lead (7.0 mm) belongs to sustain and has no stated target | 6.4 mm all 8 runs | **+6.667%** | **Correct:** CABLE_R 0.0032 → 0.0030; sustain lead 0.0035 → 0.0030 optional for consistency |

**Verified within the gate (unchanged):**
- ctl_body width and depth: 0%.
- Sustain base: 0.100×0.260 (0%). The body without the cable is 0.100×0.260×0.052. The cable-inclusive 0.118×0.463×0.608 is not the target measure.
- Toms: rim 0.282 is inside the range; the head is −0.48% below the lower bound.
- Hi-hat cymbal: 0.380.
- Throne seat: 0.480 (+0.42% at the top).
- Stool seat: 0.500.
- Kick tower: 0.450.
- Sticks: −0.49%.

**Dependencies and budgets.** No size correction changes a triangle count: the projection rebuilt all 18 rows with identical counts (placed 12528, refresh 22412). Projected with variant A plus the tom3 shift:
- no intersections;
- every target 25/25;
- kick pedal 76/87, module case 131/138, hi-hat pedal 59/96, sustain body 62/92;
- cymbal edges: hi-hat 25/32 (speaker, unchanged), crash 32/32, ride 32/32.

## 4. Controller stand placement (C2 detail)

Raising the controller to the 0.68 stand puts the keyboard in front of the throne. Results from eye-ray projection:

| Variant | Controller (x, y, yaw, zb) | Throne seat clear | Azimuth span | Notes |
|---|---|---|---|---|
| Base (v01) | 1.2, −0.8, −0.6, 0.573 | 54/73 | 30.96° | stand −17% |
| A | 1.2, −0.8, −0.6, 0.6889 | 15/73 | 30.96° | throne hidden: reject |
| B | 1.3, −0.8, −0.6, 0.6889 | 35/73 | 29.5° | azimuth fails |
| C | 1.4, −0.85, −0.6, 0.6889 | 59/73 | 28.34° | azimuth fails; stool × rug |
| **D (preferred)** | 1.3, −0.9, −0.70, 0.6889 | 50/73 | 30.36° | kick 76/87; phone key pitch 9.3–9.92 px; music-1440 13.5–14.4 px; stool legs cross the rug binding (25 tri pairs). Needs stool local y ≈ +0.04 (**not projected**) |
| E (variance) | 1.2, −0.8, −0.6, 0.573 + other corrections | 56/73 | 30.96° | no intersections; fails 0.68 by −17% |

**Recommendation.** Correct the stand to 0.68 with placement D plus the stool shift, then re-measure azimuth, throne and stool/rug in Blender. The azimuth margin is thin: 0.36°. Variance E remains available to root as a **proposed, unapproved** fallback. Its invalidation conditions: any change to the controller, stool, throne or stand geometry or to camera pose/FOV, or root rejection after images.

## 5. Variance requests (all proposed, unapproved)

1. **Rug width (C11):** 1.655 × 2.25 at x 0.56–2.215, y −1.36–0.89.
   - **Reason:** physical infeasibility against frozen retained geometry. The lamp base sits at x 2.235–2.485 within the rug's y band. The desk floor runner is at x 0.45–0.49, the under-desk decal reaches x ≤ 0.55, and the PC tower x ≤ 0.376.
   - **Best rectangle:** with 20 mm clearances it is 1.655 m (−10.5%). Overlapping the decal reaches 1.705 m (−7.8%), which still fails.
   - **Rejected alternatives:** a notched rug, a shallower rug, or moving non-M4 assets.
   - **Invalidated by:** any move of the lamp, desk frame, PC tower or under-desk decal; root restating the target; any rug-bound M4 item leaving the rug.
2. **Hand-scale bevels (C13):**
   - **Scope:** keys, knobs, panel pads, transport keys, lugs and mount blocks, clamp caps and wing bolts, pivot plates and teeth, wing nuts, pedal hinges, pad-rim inner corner, rug inner binding step.
   - **Reason:** they are below the approved detail floor (`art-direction.md:140`). A 1.5 mm bevel is 0.4–0.6 px at music-1440. Full key bevels would also exceed the keys ceiling (936 + ~2496 > 1540).
   - **Invalidated by:** any closer camera, zoom or larger viewport, or a reviewer finding key fronts unreadable.
3. **Stand fallback E (C2):** only if root rejects the corrected placement.

## 6. Bevel geometry (C13)

**Grammar.** `art-direction.md` §5 (lines 129–140) sets the bevel sizes. Casings are 2.5 mm / 2 segments, which is 3.125 mm at tier F. Hand-scale parts are 1.2 mm / 1–2 segments (1.5 mm), and furniture is 4 mm. Only screen faces and paper stay sharp.

M2 used Bevel modifiers; M3 and M4 use explicit bmesh vertices. The gate asks that the bevel shape exists in the exported geometry, not that a modifier was used. A modifier is therefore **not** required.

**Actual geometry.** Dihedral audit: hard is ≥ 80°, chamfer 20–80°, profile < 20°.

- **Bevel shape already present:**
  - cymbal lathes: 0 hard edges and 216 chamfer edges;
  - pad heads, stick tips and seat lathes;
  - octagonal clamp plans;
  - the 4 mm rim bottom chamfer;
  - the rug's binding inset ring;
  - all tubes and sweeps.
- **Absent on casings** (hard convex edge length):

  | Row | Hard edge length |
  |---|---|
  | ctl_body shell | 19.6 m |
  | kick tower/base | 8.21 m |
  | pad rim top corners | 6.98 m |
  | hi-hat base/housing | 4.23 m |
  | sustain base/plate | 2.46 m |
  | module case | 1.27 m |

- **Absent on hand-scale parts:** keys 41.7 m, lugs/mounts 5.9 m, clamp caps 7.35 m.
- **Screen faces:** indicators and display are correctly sharp.

**Normal behaviour.** The M4 export splits normals above 40° (`build_fullkit_m4.py` lines 110 and 339). The runtime uses the exported NORMAL attribute, so it does not smooth anything itself. A 2-segment bevel steps at 30°/60° faces, below the split, so it shades as a rounded highlight. A 1-segment 45° chamfer would read as a faceted stripe.

**Smallest coherent remedy:**
- explicit 2-segment 3.125 mm bevels on exposed casing edges of ctl_body, kick, module, hi-hat pedal, sustain and the outer pad-rim corner;
- contact faces stay sharp;
- hand-scale parts get the variance above.

| Row | Triangles now → est. | Ceiling |
|---|---|---|
| ctl_body__shell | 1132 → 1256 (+124) | 2500 |
| drum_kick__tower | 696 → 824 (+128) | 1500 |
| drum_module__body | 320 → 416 (+96) | 640 |
| drum_hihat_pedal__pedal | 172 → 284 (+112) | 600 |
| ctl_sustain_pedal__pedal | 216 → 312 (+96) | 500 |
| drum_pads__shells | 1928 → 2312 (+384) | 2600 |

**Budget effects.**
- Stage placed: ≈ 13,468 / 22,500. Refresh triangles: ≈ 24,084. Draw calls unchanged at 18/9/27.
- Bytes: ≈ +12 KB gzip at ≈ 12.5 B per unique triangle. The full-room forecast has no margin, so **S must re-forecast**.
- Visibility: a 3.125 mm bevel is ≈ 1.3 px on the controller at music-1440, 1.0 px on the module and 0.85 px on the kick, and sub-pixel on the phone.

These are estimates; the builder must assert exact counts. With no environment map (art-direction §6), the highlights depend only on direct lights.

## 7. Provenance, mapping and guard ownership

**Source owner (actual-Claude author).** Every correction above is a source change for a later, separately authorized candidate:
- new versioned source, editable and raw outputs;
- never overwrite v01 or v02.

**Mapping (`m4-model-contract.json`, S/Codex).** No change is needed: rows, materials, flags and ceilings are unchanged, and all deltas fit the ceilings.

**Provenance and guard (S/root + Codex).**
- The frozen guard authorizes only the pinned first-M4-v01 extras transition (AMENDMENT_SHA 3b3a011d; guard lines 19, 38 and 194–209).
- A corrected export needs a **new** provenance amendment and a **Codex guard amendment**.
- Retained-word export noise must again be evidenced exactly: no v02 wildcard and no inherited UV allowance.

**Inventory.** `targetSizeM` is not edited. Root/S record any approved variance separately.

## 8. Low-memory G2–G5 evidence path (proposed, not executed)

**Measured prior Blender peak: UNKNOWN.**
- No Blender process peak has been recorded anywhere: my dry-run and export logs print no memory figures, and neither does the repo.
- The M1 and M2 reports only record system free memory while their runs completed: 0.6–1.7 GB and 0.57–0.94 GB free of 15.7 GB. That is not a peak.
- Root's latest observation is 2.43 GiB free of 15.73. Art direction §10 says: under 5 GB free, wait and report.

| Step | What | Memory gate / stop |
|---|---|---|
| L0 (no Blender) | numpy + matplotlib 3.11.2 / Pillow 12.3.0 grey orthographic turnarounds (0/90/180/270) per family from the frozen helper/GLB, 1 m rule, M1 v02 proxies; passive Python peak sampler | Shape/scale only; does not show library materials or bevel shading |
| L1 | Workbench via `render_m4_v01_evidence.py` (bfa6fc9b, untested): turn-controller, turn-drums, contact; one hidden process each; a passive sampler logs the Blender PID's WorkingSet64/PrivateMemorySize64 every 0.5 s, plus free memory before and after | Stop if there is no background GPU context (no automatic switch to Cycles) or the script fails |
| L2 | Cycles previews via frozen `render_cam.py` (d417c68f): music-1440, right-down, music-320-f74 at 50%, 16 samples, 300 s | Launch only if free memory exceeds the measured peak plus root's margin; denoiser raises memory |
| L3 | ≤ 2 full-size stills, 48 samples, 900 s | Only if previews read and memory allows |

**Stop conditions:**
- free memory below root's threshold;
- any process change would be required (never kill anything);
- the script fails on its first run;
- the peak is still unknown and root has not set a threshold.

**Receipt:** `manifests/m4-vNN-g2g5-evidence-receipt.json`, with image hashes, RenderTime, the sampled peak, free memory before and after, and the script, blend and GLB hashes.

**Sequencing.** Render once, from the corrected candidate if root adopts corrections, so the low memory is not spent twice. Root may also decide whether the R1 runtime captures substitute for the Blender hero and phone stills.

## 9. Skills consulted (`.agents/skills`; skills target r186, installed three 0.187.0)

- **threejs-geometry (ab48fbd3).**
  - **Applies:** normals drive lighting; threshold-angle edges; the segment-count trade-off. Hence 2-segment bevels below the 40° split.
  - **Conflicts:** runtime ExtrudeGeometry bevels and merging/instancing, against the frozen named leaves and the draw contract. Not adopted.
- **threejs-materials (a31247ec).**
  - **Applies:** flat vs smooth shading; roughness controls highlight width.
  - **Constraint:** library materials are frozen and there is no envMap, so no material change is proposed.
- **threejs-lighting (e99170ed).**
  - **Risk only:** shadow acne/normalBias on the thin rug and the 0.3 mm gaps (runtime-owned).
  - **Conflicts:** its fake contact-shadow recipes, against the imported-decal contract.
- **webgl-landing-steering (892ba3bc).**
  - **Conflicts:** lanes C/D (orbit cameras, postprocessing, DRACO/KTX2), against frozen contracts.
  - **Aligns:** its performance-gate principle matches the existing budgets.
- **Version:** no r186-vs-r187-sensitive API is adopted.

## 10. Missing measurements

- Variant D with the stool +0.04 shift has not been projected.
- Moving the ride to x ≤ 1.955 has not been projected.
- Bevel triangle and byte counts are estimates; no bevel geometry was built.
- There are no rendered pixels: occlusion and readability are ray estimates. G2–G5 renders are still missing, and the Blender memory peak is unknown.

**Summary.**
- **Proposed corrections:** C1, C3–C10, C12, C13 (casings), and C2 (preferred).
- **Proposed, unapproved variances:** C11 rug, C13 hand-scale bevels, and C2 fallback E.
- Root decides before any implementation. No M4 acceptance or task completion is claimed.
