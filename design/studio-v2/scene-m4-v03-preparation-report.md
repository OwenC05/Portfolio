# Studio v2 M4 v03: CPU source preparation report

Author: actual Claude Opus 5.5 (`claude-opus-5-5`), effort high (inherited from dispatch). Task `task_23314c669e03`, dispatch `ctx_569e786e8807`.

Sources: root `msg_aa0755bf7a28`, `scene-coordination/m4-v03-preparation-task.md`, `m4-correction-plan-root-disposition.md`, `scene-coordination/m4-v03-design-correction-disposition.md` (`msg_b411821111ac`), `m4-v03-normal-check-contract-review.md` (`msg_787eacbf2096`), and critique `scene-m4-correction-plan-critique.md` (`msg_0d2146c535a5`).

**Status.** This is prepared source plus author CPU measurements only. The work is not complete, frozen, exported, rendered or visually approved.

- The builder has not been run.
- No Blender, browser, render, image, export, Git, dependency or paid action was used.
- S/Codex verifies the numbers. Root decides before any freeze, provenance or guard amendment, Blender run or export.

## Files (the five exclusive v03 paths, relative to `design/studio-v2`)

| File | Role | SHA-256 |
|---|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py` | Pure geometry helper (no bpy) | `3b220b1d4614a8111247270b21771c5f2280493c16e3ab986603a24efcffaf37` |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v03.py` | Blender builder (held, never run) | `53fa310f1144c46916b0ce63f05188818861e63fe9c32abbf4fb3f1596872b84` |
| `asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py` | Bounded pure-CPU measure | `9a3a098195e99b889ecee8b2213c9acc6a9dc50af68e1ae35e507e09b1b0bff5` |
| `asset-pipeline/full-kit/manifests/m4-v03-cpu-preparation.json` | Author receipt (exclusive create) | `d7196145a8665abefdf41b3235f3be8ec91aa7474b3c71fed2186d7537e20253` |
| `scene-m4-v03-preparation-report.md` | This report | reported in the handoff message |

**Receipt command:** `python asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py --write`, run from `design/studio-v2` (any working directory works).

- Environment: Python 3.11.9, numpy 2.4.6, Windows. It took 156 s on one core.
- `--print` repeats the run and prints the JSON without writing anything.
- The script asserts the pinned hashes of:
  - helper v01 `c7ce9d8e…`
  - parent GLB `dc9c6a78…`
  - mapping `8f0474aa…`
  - inventory `eddc33b5…`
- It records the hashes of the v03 helper, the builder and itself.
- It checks that the builder's `HELPER_SHA` equals the measured helper (`builderPinsMeasuredHelper: true`).

**Retained geometry** is the parent v03 GLB minus the 23 contract `retiredParentLeaves`: 92 mesh nodes, 33,492 triangles.

**Builder derivation.** The builder comes from the frozen `build_fullkit_m4.py` (`aa9724dc…`, CRLF), rewritten in LF. The v03 changes are:

- `TAG v03`, with the v03 helper pinned by hash.
- Every `blend`/`glb` flag is refused before anything runs (HELD), even with `FK_M4_PARENT_RELEASE` set.
- N1 custom normals, plus an in-memory readback.
- One extra resting-gap pair (rug | under-desk decal).

The scene provenance values (`m4-v03`) are a proposal only. No v03 amendment exists, and creating one is not my job.

## Chosen parameters

| Item | v01 | v03 |
|---|---|---|
| Controller placement (cx, cy, yaw rad, zb) | 1.20, −0.80, −0.60, 0.573 | **1.325, −0.825, −0.85, 0.6889** |
| Stand own height | 0.564 | **0.680** (top 0.6886; target 0.68, tolerance 0.6596–0.7004) |
| Stool (local x, y; leg phase) | (0.25, −0.40); 45° | **(0.0, −0.40); 0°** (legs on the controller axes) |
| Rug | 1.85 × 2.25 | **1.655 × 2.25**, x 0.56–2.215, y −1.36–0.89 (root conditional allowance) |
| Rack feet y | 0.40–0.78 | **0.40–0.715** (rubber end at 0.735: 155 mm inside the rug's back edge) |
| Ride x | 1.98 | 1.98 (move reverted, root S3) |
| Bevel table (`BEVEL_CLASSES`) | none | `casing` 3.125 mm × 2 segments; `white_key_lip` 3.125 mm × 2 segments |
| Sharp split | 40° | 40° (unchanged) |

The deterministic corrections C1, C3–C10, C12 (eight music runs only; the sustain lead stays 7.0 mm) and C13 are as listed in the helper docstring.

## Counts (actual, from the helper and the receipt)

Each row is listed as placed triangles over its ceiling.

**Controller**

| Row | Placed / ceiling |
|---|---|
| `ctl_body__shell` | 1260 / 2500 |
| `ctl_body__indicators` | 60 / 60 |
| `ctl_keys__keys` | **1168 / 1540** |
| `ctl_stand__frame` | 776 / 1300 |
| `ctl_sustain_pedal__pedal` | 312 / 500 |
| `stool_keys__stool` | 548 / 700 |
| `rug__rug` | 156 / 400 |

**Drums and cables**

| Row | Placed / ceiling |
|---|---|
| `drum_rack__rack` | 2084 / 2400 |
| `drum_pads__shells` | 2312 / 2600 |
| `drum_pads__heads` | 384 / 900 |
| `drum_cymbals__cymbals` | 1812 / 1950 |
| `drum_kick__tower` | 856 / 1500 |
| `drum_hihat_pedal__pedal` | 300 / 600 |
| `drum_module__body` | 416 / 640 |
| `drum_module__display` | 12 / 60 |
| `drum_sticks__pair` | 120 / 120 |
| `drum_throne__throne` | 588 / 700 |
| `music_cables__runs` | 588 / 800 |

**Stage totals (weighted):** main 18 of 20, casters 9, refresh 27 of 30, placed 13,752 of 22,500, refresh triangles 24,404. Every contract row holds (`contractRowsHold: true`). The receipt records per-row bounds under `v03Candidate.topology`.

## Combined checks (receipt `v03Candidate`)

### N1: normals

The receipt's `normalsN1` and `faceClassesN1` sections cover this.

**Classified rows.** Seven rows carry authored classes: shell, keys, sustain, pad shells, kick, hi-hat pedal and module body. The primitive that makes each face assigns its class (`planar`, `round` or `bevel:<class>`); none is derived from the normals under test.

**Test.** Each planar triangle was tested whatever its area. The test is: each authored corner normal against the triangle's oriented geometric normal, as a dot product of at least cos 2°, with no absolute value.

| Row | Planar triangles | Authored max | Fails | v01 default max |
|---|---|---|---|---|
| shell | 112 | 0.00° | 0 | 21.15° |
| keys | 464 | 0.00° | 0 | 15.00° |
| sustain | 56 | 0.00° | 0 | 18.49° |
| pad shells | 288 | 0.00° | 0 | 16.18° |
| kick | 56 | 0.00° | 0 | 20.95° |
| hi-hat pedal | 56 | 0.00° | 0 | 20.95° |
| module | 28 | 0.00° | 0 | 18.49° |

**Other results.**
- No planar triangle is degenerate.
- Every corner normal is finite and of unit length.
- The receipt publishes, per row:
  - class totals (faces, triangles, area);
  - run-length class arrays per labelled group;
  - sha256 of the class array;
  - sha256 of the canonical authored corner normals (rounded to 1e-6).

**Limit of this check.** This is CPU source evidence only. The final glTF NORMAL accessors decide, and S checks them after a released export.

**Builder mapping and readback.**
- The builder maps normals per (polygon index, vertex index).
- It orients each normal to the recalculated polygon winding, because recalc reverses the inherited lathe windings.
- It asserts the same predicate on the in-memory mesh (`corner_normals`) and records the result in its measurements.

**Join caveat.** The inherited M3 join rebuilds `mon_cables` and `under_desk_power` from_pydata, which discards custom normals. It touches no M4 row.

### H1: white-key lips

- **Lips:** 3.13 mm vertical by 3.12 mm horizontal, 2 segments, on all 29 white keys.
- **Layout:** pitch 0.0294 (min and max), gap 0.0034, front-block width 0.026.
- **Body fit:** keys lie inside the cheek inner faces (x −0.396 to 0.453 against ±0.473). Key front y is −0.157 against shell front −0.160. Key bottom is 0.0303 over the bed at 0.030.
- **Rays:** 29 of 29 white-key tops are first hit by the keys.
- **Triangles:** 1168 of 1540.

### K1: supports

The receipt's `supportsK1` section covers this. The footprint is every vertex within 0.5 mm of the row's lowest point. The surface is the rug field, at least 20 mm inside the binding.

| Row | Surface | Min binding clearance | Signed resting error |
|---|---|---|---|
| stand | rug | 0.156 | 0.0000 |
| sustain | rug | 0.050 | 0.0000 |
| stool | rug | 0.102 | 0.0000 |
| rack | rug | 0.124 | 0.0000 |
| kick | rug | 0.324 | 0.0000 |
| hi-hat pedal | rug | 0.331 | 0.0000 |
| throne | rug | 0.573 | 0.0000 |

**Stool feet.** All four feet are on the rug. Their disc clearances from the binding are 0.101, 0.341, 0.310 and 0.117 m, each with a 0.3 mm resting gap. The stool builder now refuses mixed or binding support.

**Pre-existing v01 defect.** v01 (same method) has stool feet on the rug, the binding and the floor. The foot at (1.212, −1.438) is off the rug, with its underside floating 8.6 mm above the floor. The foot at (1.013, −1.303) sits over the binding edge. v03 removes both.

**Cables** are draped, not footprints: minimum z 0.45 mm. Resting gaps:
- cables | rug: 0.43 mm
- cables | module: 0.3 mm
- cables | pad shells, kick, hi-hat pedal and shell: 3.8 mm each

**Other resting gaps** are all 0.3 mm: stand, stool, sustain, rack, kick, hi-hat pedal and throne on the rug; keys | shell; pads, cymbals and module | rack. Two exceptions:
- shell | stand: 5.7 mm (nearest-vertex estimate)
- sticks | pad shells: 1.6 mm

### C11: rug allowance record

**Spans.**
- Physical span: lamp base min x 2.235 − desk-frame floor runner max x 0.49 = **1.745 m**.
- Chosen clearances: lamp 20 mm; desk frame 70 mm (root's 20 mm desk-frame clearance plus 50 mm decal avoidance).
- 1.745 − 0.020 − 0.020 − 0.050 = 1.655.

**Rack margins** (rug beyond the outermost rack foot): left 0.255, right 0.230, front 1.740, back **0.155**. In v01 the back was 0.090; I shortened the back foot by 65 mm so every side is at least 150 mm.

**M6 dependency, recorded only (not edited).**
- The retained `contact_decals__music_corner` overhangs the rug by 35 mm left and 10 mm right.
- Its z range is 0.0205–0.0215 against the rug field at 0.0083.
- Every rug-standing M4 row therefore intersects it. The intersection counts are under `intersections.m4VersusContactDecalsRecordedOnly`.

### Intersections, views and targets

- **Intersections:** M4 against retained geometry or other M4 assets: **none**. Exact triangle tests after AABB culling, in bounded chunks.
- **Target rays:** 81/81 on dissertation, copilot and typeforge.
- **Controller azimuth (unobstructed):** **30.67°** (354/358 samples). The builder asserts ≥30.0; I used ≥30.5 as an author margin. All-vertex azimuth is 30.92°. v01: 30.96°, all-vertex 32.14°.

**White-key pitch** (pinhole estimates, not renders):

| Camera | v03 | v01 |
|---|---|---|
| music-1440 | 13.6–14.7 px | 12.3–14.3 px |
| right-down | 11.7–13.3 px | 10.1–14.1 px |
| music-320-f74 | 9.4–10.1 px, 10 keys in frame | 8.5–9.9 px, 12 keys in frame |

**Feature visibility from the eye** (unobstructed / samples). Sample sets differ between v01 and v03, so compare fractions.

| Feature | v03 | v01 |
|---|---|---|
| Kick pedal | 188/210 = 0.895 | 169/190 = 0.889 |
| Kick tower upper | 174/192 = 0.906 (pad heads block 18) | 158/160 |
| Sustain pedal | 103/116 = 0.888 | 55/80 = 0.688 |
| Throne seat | **45/73 = 0.616** (shell blocks 28) | 54/73 = 0.740 |
| Hi-hat pedal | **73/160 = 0.456** (desk frame 58, music-corner decal 29) | 63/96 = 0.656 |
| Stool seat | 110/110 | 110/110 |
| Module display | 7/8 | 7/8 |

**Cymbals.** All bells are 16/16. Crash and ride edges are 32/32. The hi-hat edge is 25/32, with the nearfield speaker blocking 7, the same as v01.

### C2/K1 placement search (receipt `c2Search`)

**Grid:**
- cx {1.25, 1.30, 1.35}
- cy {−0.90 … −0.70 by 0.05}
- yaw {−0.6, −0.7, −0.8}
- stool x {0, 0.10, 0.25}
- leg phase {0°, 45°}

That makes 270 combinations.

**Prefilter.**
- Support: stool feet, stand rubber ends and the sustain base all on the rug field, 20 mm clear of the binding.
- Azimuth: the all-vertex controller azimuth must be at least 30.5°.
- 48 combinations survived, and every survivor was ray-evaluated.

**Refinement.** ±0.025 cx/cy and ±0.05 yaw around the stage-1 best: 27 combinations, 15 passed the prefilter.

**Selection rule** (`selectionRule` in the receipt):
1. Targets 81/81.
2. Unobstructed azimuth at least 30.5°.
3. Kick-pedal fraction not below v01's.
4. Then maximise the smaller of the throne-seat and sustain-pedal fractions.

The rule picked (1.325, −0.825, −0.85) with stool (0.0, phase 0°). The receipt flags `matchesSearchSelection: true`. The selected yaw sits on the refinement's edge.

**Stand height inside tolerance** (same placement):

| Own height | Throne | Sustain |
|---|---|---|
| 0.68 | 45 | 103 |
| 0.665 | 44 | 103 |
| 0.65 (outside tolerance) | 43 | — |

Lowering does not help, so 0.68 stays.

### Dimensions (receipt `dimensions`)

- **C1** envelope 0.990 × 0.320 × 0.0949 (−0.1% height).
- **C2** own height 0.680; white-key top 0.742; key top above the stool seat 0.242.
- **C3/C4 rack**, frame plus clamps (the root target): width 1.170 (+0.86%), own height 0.750, tube outer width 1.160. Wider readings, reported separately:
  - frame + booms: 1.191 (+2.6%)
  - row including stubs: 1.198 (+3.3%)
- **C5** rims 0.282 (toms) and 0.306 (snare), inside the 0.25–0.31 range.
- **C6/C7** cymbals 0.380.
- **C8/C9** hi-hat pedal base 0.130 × 0.330.
- **C10** module case 0.200 × 0.150.
- **C12** music cables 6.0 mm; sustain lead 7.0 mm; module snake 18 mm.

### A1: edge accounting (receipt `topology`)

**Topology.**
- Per row: triangles, bounds, boundary, non-manifold and wound edges, degenerate faces, non-planarity (at most 1.6 mm, on the cable and sustain rows; 1.1 mm on the module), and sharp edges over 40°.
- **Bevelled middle-seam length by class:** casing 4.63 (shell), 1.33 (sustain), 4.02 (pads), 3.44 (kick), 1.59 (hi-hat), 1.45 (module); white_key_lip 0.754 m.
- **Hard convex edges (≥80°)** are reported by `SHARP_REASONS` status and by label, each with its declared reason. No label is `undeclared`.

**Inherited from v01, unchanged.** These appear in v01 by the same method:
- 96 boundary edges on the pad shells and 48 on the kick (open lathe rings);
- negative-volume components: 4 pad shells, 4 heads, 3 cymbals and 1 kick (lathe winding).

The builder's `recalc_face_normals` re-orients them, and the custom-normal mapping follows the recalculated winding.

### Reproducibility

A second run from the same pinned inputs (`--print`, no write) produced JSON identical to the written receipt in every field except `elapsedSeconds` (155.9 vs 160.9).

### Frozen inputs, rehashed after the work (all unchanged)

| Input | SHA-256 |
|---|---|
| v01 builder `source/build_fullkit_m4.py` | `aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22` |
| v01 helper `source/build_fullkit_m4_geometry.py` | `c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0` |
| v01 editable `source/fk-40-music-proposal-v01.blend` | `0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665` |
| v01 raw `exports/studio-full-kit-m4-proposal-v01.raw-export.glb` | `c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906` |
| v02 GLB `exports/studio-full-kit-m4-proposal-v02.glb` | `baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f` |
| v02 manifest `manifests/studio-full-kit-m4-proposal-v02.manifest.json` | `42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82` |
| `m4-author-report.md` | `93d7c5c124a846240173b0a04fed1dffd4fb9743e15971d3ea41a966feb3ee79` |
| `manifests/m4-v01-tier-ledger.json` | `63848642fde09d4d5762c9c5054129c22df51f0838bcc8f1b7c450fd80ffae63` |
| `source/render_m4_v01_evidence.py` | `bfa6fc9bf22707dc08f44f0bd4a7033e3817d54d2d142d5dea7a969fca161e18` |
| `scene-coordination/m4-model-contract.json` | `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98` |
| `scene-coordination/m4-transition-guard.py` | `ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b` |
| `asset-pipeline/full-kit/asset-inventory.json` | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |
| parent `exports/studio-full-kit-m3-proposal-v03.glb` | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| `scene-m4-correction-plan.md` | `6d249f2800f6201ccb6abab99341b3a03e493a1ba238f0047683f4ceffe37de9` |
| `scene-coordination/m4-correction-matrix.json` | `59fa954fdc61df8f1f9343dc93c384ed681666ce482d044d4f5986ddcffa2d77` |

Paths without a prefix are under `asset-pipeline/full-kit/` unless they start with `scene-`. The scratch generator scripts stayed in the session scratchpad. Nothing else in the checkout was written.

## Open decisions for root (not waived)

1. **Unnamed hard edges.** These are hard edges that root's named list does not cover. All are hand-scale caps and hardware, reported for a decision with no exemption assumed:

   | Label | Length | Edges |
   |---|---|---|
   | stool caps | 2.31 m | 200 |
   | throne caps | 2.75 m | 224 |
   | kick.hardware | 5.73 m | 268 |
   | hihat.hardware | 1.87 m | 68 |
   | module.controls | 0.97 m | 104 |
   | module.mount | 0.79 m | 32 |
   | module.snake end caps | 0.11 m | 16 |
   | sustain.cable end caps | 0.11 m | 16 |
   | eight music-cable end caps | 0.04–0.96 m each | — |

   Several "named" labels also contain edges root did not name, and their reasons say so:
   - pitch/mod wheels, wheel slots and the display bezel in `ctl.controls`;
   - tube, rubber-end and pivot-knob caps in `stand` and `rack.*`;
   - mount-arm caps;
   - cymbal rod, felt and tilter caps.
2. **Visibility trade-offs against v01.**
   - The throne seat drops from 0.740 to 0.616, because the raised controller blocks it. No search point inside the K1 constraints reached v01.
   - The hi-hat pedal drops from 0.656 to 0.456: the C8/C9 pedal is larger, and the desk frame and the M6 decal block it.
   - The sustain pedal improves (0.688 to 0.888), and the kick holds.
   - No azimuth or camera waiver is assumed. Images are needed for the art judgement.
3. **Azimuth margin.** 30.67° is 0.67° over the builder assert.
4. **Rug and decal wording.** The rug edge is 70 mm from the desk-frame runner but only **10 mm** from the under-desk decal's measured max x (0.55). Root's "50 mm avoidance of the under-desk decal" matches the frame-to-rug budget, not the measured decal distance. I recorded both and changed nothing.
5. **M6 dependency.** The music-corner decal overhangs the rug and every rug-standing row intersects it. It is recorded only and not edited.
6. **Rack back foot.** Shortened by 65 mm (v01 0.78 → 0.715) to meet the 150 mm margin on every side. This is an art choice that needs image review.
7. **Export N1 check.** This is S's job, after a released export.
8. **Provenance.** The v03 provenance and guard amendment are not mine.

## Assumptions

- I read root's "150 mm of rug beyond the outermost rack foot on each side" as including the front and back, not just left and right. It is the stricter reading.
- The footprint is every vertex within 0.5 mm of a row's lowest point. Rug support is checked against the rug rectangle (its 40 mm corner rounding only adds clearance near the corners), with a 20 mm margin inside the binding's inner edge.
- Visibility counts use the M4 builder's feature definitions and nearest-hit eye rays on CPU. Camera pitches are pinhole estimates of the M1 cameras, not renders.
- The azimuth margin (30.5°) and the selection rule are my choices, recorded in the receipt.

## Failed attempts and revisions

- **Placement D** (1.30, −0.90, −0.70; stool (0.25, −0.40), phase 45°) put stool feet on the binding and the floor. The stool builder raises an error there. **D + 0.04 is infeasible** for the same reason.
- **N1 weighting** was first area weighting, superseded by a bevel-aware rule after the critique. The bevel-aware rule was then replaced by the declared-class priority rule, after root required authored classes and no area test.
- **The ride move** inside the frame, made for the boom-inclusive width, was reverted to x 1.98 per root S3.
- **First dry-run selection rule** (throne first) chose (1.325, −0.85, −0.80), with sustain at 59/116. I replaced it with the max-min throne/sustain rule; the receipt records the revision.
- **The kick criterion** first compared absolute counts across different sample sets. It now compares fractions.
- **The stand-height variant** first set zb 0.3 mm low. That is fixed.
- **The rack back margin** was first exactly 150 mm, a floating-point borderline. It is now 155 mm.
