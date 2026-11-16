# M4 v04 preparation: author report (interface-ready; pose selection pending)

**Author:** actual Claude Opus 5.5 (`claude-opus-5-5`, `--effort high`, observed in my own process argv, PID 28952, under Orca). Task `task_23314c669e03`, dispatch `ctx_2d83d120ad37`, retry of stopped `ctx_5996dc215cff`. Current S: `term_34bea5af…`; scope message `msg_3215a56a133b`, my ACK `msg_e060e25d1bf1`. 16 November 2026.

**State: interface-ready handoff, not completion.** The geometry helper, the held builder and the semantic declaration are written and self-consistent. The pose is still the provisional v03 reference P00 until I choose from Codex's single coarse comparison. No Blender, export, browser, render, image, Git, dependency, helper, paid or process action was taken. The builder was never run and refuses to run. Nothing here is visual, export or candidate approval; all fourteen image gates (section 9) stay open.

Authorities: root `m4-v04-combined-repair-disposition.md` (`24E9B32C`), S boundary `m4-v04-internal-contract.md` (`A2AFC8A3`), author task `m4-v04-author-task.md`, recovery `m4-v04-coordinator-recovery-2026-11-16.md`, final art review `scene-m4-v03-focused-art-closure.md` (`4157A176`), declaration interface `m4-v03-verifier-declaration-contract-v3.json` (`5632CA4A`). v01-v03 sources, receipts, reviews and snapshots were only read. The stale original M4 export brief in the restart paste was **not** executed.

## 1. Files and hashes (interface-ready pins)

| Owned file (relative to `design/studio-v2/`) | SHA256 | Note |
|---|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` | `83e1445f324159935571a350ea0b501a62f8286be3cee0a0903c11046225e0a3` | pure helper (math, fnmatch, numpy); writes nothing |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` | `eb0af482fed07fa8f3c9383019dbd982b3259d0ed25048fb45e118b9ba5c2333` | held builder, pins the helper hash above; refuses execution |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` | `f62a5850d8f3071011fc51c568801e0a8b02294e9ac8a2b5a789eeec70aa9abd` | 278,345 bytes; byte-exact output of the helper's `--declaration` |
| `scene-m4-v04-preparation-report.md` | (this file; hash sent with the handoff) | |

Reproduce the declaration with `python -B source/build_fullkit_m4_geometry_v04.py --declaration > manifests/m4-v04-author-declarations.json`, run from `asset-pipeline/full-kit/`. That writes UTF-8, one-space indent, insertion order, LF and a final newline; `declaration_bytes()` returns the same bytes. Its `sources` entry carries the helper hash. Any helper edit, including the later pose selection, changes both pins. The builder's `HELPER_SHA` must then be updated and all three re-handed off.

## 2. Producer interface (unchanged API, v3-compatible JSON)

Helper API, as the internal contract specifies: `build_all(pose=None) -> (parts, meta)` keyed by the same 18 rows. A pose has exactly `cx`, `cy`, `yaw`; anything else raises `ValueError`. Controller globals and `MOUNTS` are restored in `finally`. `corner_normals(part)`, `ledger(parts)`, and `Part` with `row/asset/mat/ceiling/casts/v/f/groups/cls/tris/triangles()`. New: `Part.ids` (stable group identities), `Part.roles` and `Part.runs` (per face, authored), plus `smooth_edges(part)`, `edge_records(part)`, `edge_set()`, `edge_tally(parts)`, `author_declaration()`, `declaration_bytes()`, `EDGE_SETS`, `POSE_OPTIONS`, `SELECTED_POSE`, `SELECTED_POSE_STATUS`.

Declaration top-level keys, in order: `schema` (`m4-source-declaration/3`), `scope` (`candidate`), `status`, `author`, `sources`, `interface`, then:

- `rows`: interface-3 fields, one per leaf. Each row has `id`, `vertexCount`, `faceCount`, `normalsRequired` and `faceClasses`; classes are `planar`, `round`, `bevel:casing`, `bevel:white_key_lip` or `out_of_scope` for a raw `None`. Its `groups` list follows `Part.groups` order, each with `id`, `label`, `vertexRange`, `faceRange`, `triangleCount`, `n1` and `reason`. `label` is the raw locator label, an extra field the v3r1 verifier accepts because it compares the whole group dict. Seven rows are `normalsRequired: true`: shell, keys, sustain, pad shells, kick, hi-hat, module body. Every group is wholly in or out of scope, which the helper asserts.
- `surfaces`: one entry, `{id: rug_field, kind: rug_field, boundaryRow: rug__rug, boundaryFace: <last rug face, the inner field at RT>}`.
- `supports`: 25 entries, `{id: '<row>/<group>', row, group, surface: rug_field}`.
  - stand: 2 foot tubes and 4 rubber foot ends
  - sustain base
  - 4 stool feet
  - rack: 2 foot tubes and 4 rubber ends
  - kick: base frame, `kick.spur_foot.L`, `kick.spur_foot.R` and the pedal plate
  - hi-hat base
  - 3 throne feet
- `attachments`: 10 entries `{id, row, group, ontoRow, ontoGroup, relation: rests_on | embedded, gapM | depthM, intent}`. These are the K1 pairs. The spring, both posts and the heel block rest on `kick.pedal_plate` with gap 0. Each spur arm is embedded in its own foot and 6 mm into `kick.base`. Two more are recorded: the inherited footboard heel seat in the heel block (≤4 mm, v01, unchanged) and the display face resting on `ctl.bezel` with gap 0.0003.
- `seatings`: exactly the four I1 pairs, `ctl_body__indicators/ctl.indicator_strip#0..3` into `ctl_body__shell/ctl.panel`, `seatDepthM` 0.001, `proudM` 0.0025.
- `roundRuns`: 18 entries `{id, row, group, faces}`: 4 corner runs each in `module.case`, `sustain.base`, `sustain.plate` and `hihat.base`, plus the top run of each `ctl.cheeks`.
- `edgeClassification`: the rule texts.
- `edgeSets`: 44 entries `{id, status, reason, match: [{label, kinds, bands}], reconsider?, source?}`.
- `poseOptionIds`, `poseOptions` (24 plain `{cx, cy, yaw}`, accepted by the producer's `validate_pose_options`), `selectedPose`, `selectedPoseStatus`, `restingRuns`.

`rowsSha256` is deliberately absent. It belongs to the producer and the root/S freeze, and is never self-pinned. A read-only import of Codex's checkpoint `produce_fullkit_m4_v04.py` (`e302a953…`) accepts this JSON: `snapshot_rows()` passes all 18 rows and `validate_pose_options()` passes. That is a compatibility smoke check, not producer evidence or a frozen digest.

## 3. What changed (root's bounded list only)

**K1 kick** (`kick()`, `SPUR`, `PEDAL_PLATE`):
- Each spur is now a rod arm ending inside its own flat-bottomed foot (r 8.5 mm, 22 mm tall, 8 sides). The foot's underside sits at the resting height: minimum z − rug field − 0.3 mm = 0.0000 mm for both. The foot is dark rubber, so the granted round-member-ends condition about bright-metal ends over 12 mm does not arise.
- I also moved each arm root 6 mm inside the base frame's side face. The arm leaves at 45° in plan, so in v03 its root disc straddled the face, with half of it up to 4.9 mm proud: a visible wedge gap of the same kind as the reviewer's spring finding. It is the same arm and the same kick spur, so I treated it as part of the K1 attachment remedy. **Root should confirm this reading.**
- The pedal plate is widened from half-width 0.045 to 0.068 (the reviewer suggested about 0.066) and extended 20 mm at the heel. The spring (x 1.472–1.484), both posts (1.367–1.383, 1.457–1.473) and the heel block (y 0.06–0.12) now stand flush on the plate top and wholly inside it (x 1.352–1.488, y 0.06–0.36). Measured offset: 0.0 mm.
- The kick pad ring's outer front corner now carries the shared `casing` 2-segment bevel. Its classes are `round`, `round`, `bevel:casing`, `bevel:casing`, `planar`, like the rack pad rims.
- Kick triangles: 856 → **1,040** of 1,500. The ring adds 96, as the reviewer estimated. The two spur feet add 88.

**N1 round runs:** `prism()` gives every face built from a run of consecutive round plan edges a run id: rrect arcs and the cheek top chain. `smooth_edges()` keeps an edge between two faces of one run smooth at any angle; otherwise the 40° split applies. Both `corner_normals()` and the held builder's edge marking use this one rule. The builder asserts that every non-run edge still agrees with Blender's own 40° angle. Effect: exactly 16 edges that were over 40° become smooth, the mid-arc edges of `module.case`, `sustain.base`, `sustain.plate` and `hihat.base`, at zero triangles. Planar corners keep their own normals; my quick check finds a maximum deviation of 1e-6°.

The reviewer's "cheek profile 12 edges, 0.065 m" is **not** a mid-run break. It is the genuine corner where the round top run meets the flat cheek front, at 51°. It stays hard and is declared as `proposed` (section 6).

**A1 / E1 edge sets:** labels are split by kind of part, for example `kick.spur_arm.L`, `kick.pad_ring`, `ctl.wheel`, `ctl.bezel`, `stand.knob` and `pad.<name>.block`. Every hard edge belongs to exactly one `EDGE_SETS` entry, which gives it one status and one reason. Matching is by label, kind and band:
- **Kind** comes from the authored face roles: `cap`, `along` (lengthwise facets), `ring` (profile corners and bends), `block` or `open`.
- **Band** is `convex>=80`, `convex40-80` or `concave`.

Lengthwise cable facets are `faceted-round`, never end caps. Sticks and heads no longer carry `casing`. The bevel figure is reported as **middle-seam length**: `bevel:casing` 17.08 m and `bevel:white_key_lip` 0.75 m. That is not the treated original edge length. `SHARP_REASONS` is retired. My tally finds **no undeclared hard edge**.

**I1:** the four strips are declared exactly as root accepted: seated 1.0 mm into `ctl.panel` and 2.5 mm proud. The display face rests on the bezel. This is not a same-asset or within-row exemption.

**R2 / B1 wording (no geometry):** rug unchanged. Clearances are 20 mm to the lamp base, 70 mm to the desk-frame runner and 10 mm to the under-desk decal. The extra 50 mm is width surrendered inside the 70 mm separation, not a gap to the decal. Reconsider if that decal grows or moves more than 10 mm toward +x. The 150 mm rug margin applies left and right; the shortened rack back foot is accepted at source level under gate RK1. The music-corner decal's height and overhang remain an M6 dependency.

**Unchanged:** every other placement, material, row, caster, ceiling and retained-data contract. Rows 18 main, 9 casters, 27 refresh; placed 13,752 → **13,936** (limit 22,500); refresh-weighted 24,404 → 24,772. White keys 29, black 20, at all 24 poses.

## 4. P1 pose table (author's explicit bounded options)

Root's ranges are cx 1.325–1.40, cy −0.825 or −0.80, yaw −0.95 to −0.85. I chose 4 × 2 × 3 = 24 samples:
- x at 25 mm steps across the whole range: 1.325, 1.35, 1.375, 1.40
- both permitted y values: −0.825, −0.80
- yaw −0.85, −0.90, −0.95 (root's cap; the reviewer's art guard)

`P00` = (1.325, −0.825, −0.85) is the v03 reference. Ids run x-major, then y, then yaw. For example, P03 = (1.325, −0.80, −0.85), P07 = (1.35, −0.825, −0.90) and P23 = (1.40, −0.80, −0.95). Every option builds; the stool support rule raises on mixed or binding support and passes at all 24.

**Selection: pending.** `SELECTED_POSE` stays at P00, marked `provisional`, until Codex's one coarse comparison comes back through S. I will choose on the uniform throne-top area and the azimuth envelope together, not on a vertex count alone. I will also weigh the targets, supports, the sustain and hi-hat labels with decals excluded, and the smallest phone key pitch. Then I edit `SELECTED_POSE` only, and send new helper, declaration and builder hashes for the single full selected-pose measurement.

My expectation, from the reviewer's probe, is that a +x step of 25–50 mm with yaw −0.90 or −0.95 opens the throne while keeping the azimuth above 30°. Codex's figures decide; I will not search further.

## 5. Per-row counts and bounds (provisional pose P00; Blender metres)

| Row | Casts | v03 tris | v04 tris | Ceiling | min | max |
|---|---|---|---|---|---|---|
| `ctl_body__shell` | yes | 1260 | 1260 | 2500 | [0.88, -1.301, 0.689] | [1.77, -0.349, 0.784] |
| `ctl_body__indicators` | no | 60 | 60 | 60 | [1.045, -0.979, 0.76] | [1.583, -0.462, 0.772] |
| `ctl_keys__keys` | no | 1168 | 1168 | 1540 | [0.945, -1.269, 0.719] | [1.634, -0.519, 0.754] |
| `ctl_stand__frame` | yes | 776 | 776 | 1300 | [0.975, -1.188, 0.009] | [1.675, -0.462, 0.689] |
| `ctl_sustain_pedal__pedal` | no | 312 | 312 | 500 | [1.448, -1.284, 0.009] | [1.81, -0.931, 0.732] |
| `stool_keys__stool` | yes | 548 | 548 | 700 | [0.859, -1.254, 0.009] | [1.189, -0.924, 0.5] |
| `drum_rack__rack` | yes | 2084 | 2084 | 2400 | [0.807, 0.188, 0.009] | [2.005, 0.735, 1.002] |
| `drum_pads__shells` | yes | 2312 | 2312 | 2600 | [0.883, 0.096, 0.438] | [1.936, 0.621, 0.846] |
| `drum_pads__heads` | no | 384 | 384 | 900 | [0.924, 0.114, 0.536] | [1.908, 0.592, 0.833] |
| `drum_cymbals__cymbals` | yes | 1812 | 1812 | 1950 | [0.66, 0.258, 0.888] | [2.169, 0.857, 1.11] |
| `drum_hihat_pedal__pedal` | no | 300 | 300 | 600 | [0.917, -0.07, 0.009] | [1.083, 0.27, 0.088] |
| `drum_kick__tower` | yes | 856 | **1040** | 1500 | [1.236, 0.06, 0.009] | [1.604, 0.568, 0.459] |
| `drum_module__body` | yes | 416 | 416 | 640 | [0.739, 0.317, 0.567] | [0.993, 0.53, 0.854] |
| `drum_module__display` | no | 12 | 12 | 60 | [0.796, 0.37, 0.803] | [0.878, 0.411, 0.832] |
| `drum_sticks__pair` | no | 120 | 120 | 120 | [0.866, -0.011, 0.558] | [1.204, 0.451, 0.586] |
| `drum_throne__throne` | yes | 588 | 588 | 700 | [1.234, -0.217, 0.009] | [1.616, 0.175, 0.482] |
| `rug__rug` | no | 156 | 156 | 400 | [0.56, -1.36, 0.0] | [2.215, 0.89, 0.011] |
| `music_cables__runs` | no | 588 | 588 | 800 | [0.617, -0.494, 0.0] | [1.933, 1.031, 0.76] |

Controller-dependent rows (shell, indicators, keys, stand, sustain, stool and the controller cable) move with the selected pose. Their counts do not change.

## 6. Edge sets: author tally (provisional pose; metres; Codex measures independently)

| Status | Sets (length by band) |
|---|---|
| named (C13; knobs and hinges by kind of part) | keys.white 29.15 (≥80); keys.black 11.68 / 0.22 (40-80); rack.clamps 8.21 / 7.17; rug.inner_step 7.57 + 7.57 concave; pad.lugs 4.03; pad.rim_inner 3.21 + 3.46 concave; ctl.panel_pads 2.25 / 0.24; stand.pivot 1.98; pad.blocks 1.86; cymbal.nuts 1.35; ctl.knobs 1.15; ctl.transport_keys 0.90; stand.knob 0.27; pedal.hinges 0.25; module.knob 0.20 |
| granted (root 5d, exactly as enumerated) | round_member_ends 14.59; thin_plates 6.37 / 0.03; small_dark_blocks 1.84; controller_wheels 0.52 |
| contact (reason, not exception) | rug.underside 7.74; pad.head 6.39; ctl.slab 4.23; pad.rim_skirt 3.21 (open); ctl.panel 2.65; ctl.bays 1.84; ctl.cheeks 1.66; kick.head 0.98; kick.pad_ring.open 0.96 (open); hihat.base 0.89; kick.base 0.89; sustain.base 0.69; kick.tower 0.63; kick.pad_ring.seat 0.55 (40-80); sustain.plate 0.54; hihat.housing 0.35 |
| screen | ctl.glow 1.19; module.glow 0.46 |
| faceted-round | members 68.95 (40-80) / 0.02 / 0.17 concave; cables 41.09 (40-80) / 2.47 (≥80 skewed bends) / 0.17 concave; profiles 9.72 (40-80) |
| **proposed (awaiting root; no exemption assumed)** | **rug.binding_shoulder 7.74 (40-80); pad.rim_lower 6.97 (40-80); cymbal.edge 3.57 (≥80); ctl.cheeks.front_corner 0.065 (40-80)** |

Totals: 134.6 m convex ≥80, 142.7 m convex 40-80, 11.4 m concave, 4.2 m open-lathe boundary. The 139.10 m v03 review figure is evidence on v03, not a target. Convexity is taken per primitive after orienting its winding outward. Open lathes are flagged as `open` rather than guessed.

## 7. Honest unresolved findings

1. **Four `proposed` edge sets** are outside every root decision. The tallies are unchanged since v01 or v03; they are newly visible because the 40-80 band and the label split are now reported.
   - **Cymbal edge rim**: the identifying silhouette, about 110° across 11 mm.
   - **Pad rim lower outer corner and shell bottom chamfer**: C13 names only the inner corners.
   - **Rug binding shoulder**: a 2.6 mm chamfer facet.
   - **Oak cheek front-top corner**: 51°, 22 mm wide, an exposed casing-family edge.

   I recommend a casing bevel for the cheek corner in a later bounded pass, and image-gate decisions for the other three. I did not bevel the cheek here, because root's release lists no cheek geometry change.
2. **Spur arm root moved 6 mm into the base frame** (section 3). This goes beyond the reviewer's literal tip/spring/plate list, though it is the same K1 attachment class. It is declared as an embedded attachment.
3. **Inherited footboard-in-heel-block overlap**, ≤4 mm, unchanged since v01. Declared, not newly fixed, and outside the released list.
4. **Open lathes** (pad shell inner skirt, kick pad ring ends) are surfaces, not closed solids, with double-sided material. Their boundaries are declared as contact/hidden. A ray or intersection tool should treat them as surfaces.
5. **Cables** rest on both the rug and the bare floor. They are deliberately **not** supports: interface 3 requires one surface per row, and a resting run is not a standing primitive. They need Codex's cable checks.
6. **Pose provisional.** The azimuth margin was thin in every v03 option (0.67° by vertex envelope) and is not continuous visible span. Gates AZ1 and T1 decide.
7. The **music-corner decal** sits above the pedal plates, hi-hat base, cables and lower rubber feet. That is M6's dependency; M4 does not edit retained decals.
8. **Builder never executed.** The `smooth_edges` ↔ Blender angle assert and the custom-normal readback are unproven until a released run. The exported NORMAL accessors decide.

## 8. Author quick checks performed (targeted CPU, no heavy search)

These used plain CPython with `-B`, run from the repository, with throwaway check scripts kept in my session scratchpad. No owned or other-owner file was written by them.
- Ledger and triangle counts.
- Per-group class purity.
- Support minimum heights (all 25 at +0.0000 mm).
- K1 attachment extents.
- Repeat-stable `build_all()` across poses (same geometry digest before and after a foreign pose).
- All 24 poses build, with 29 + 20 keys.
- Edge tally with no undeclared edge.
- N1 planar corner deviation.
- Declaration byte reproduction.
- The read-only producer compatibility smoke check.

None of these is Codex's measurement, the verifier or image evidence. The approved v3r1 verifier does not approve this candidate.

## 9. Image gates (all fourteen remain open)

| Gate | Passes when (from the pinned review) | v04 note |
|---|---|---|
| N1a | casing faces shade evenly; highlight stays in the bevel band | |
| N1b | module case and pedal-base rounded corners: no mid-corner crease | run fix applied at source |
| H1 | continuous key lips; 29 + 20 countable | |
| K1 | contact under every support, **both spur feet**, no gap under the spring | plate, spurs and arm root at source |
| T1 (throne) | round seat behind the controller, at most about a third hidden, no near-tangent | depends on the selected pose |
| HH1 | hi-hat footboard and heel identifiable beside the desk leg | |
| SP1 | sustain pedal identifiable, not merged with the stool leg | |
| AZ1 | controller azimuth from the capture ≥ 30° (continuous span) | |
| RUG1 | rug clear of lamp base and desk frame, reads as carrying the kit | |
| RK1 | rack feet read as feet front and back | |
| E1a | kick pad ring not cheaper than the tom rims | now bevelled; checks the bevel reads alike |
| E1b | no allowed sharp set reads unfinished; strips read as lit inlays | plus the four `proposed` sets |
| F1 | stand tubes and sticks not faceted; cables do not sparkle | |
| M6 | music-corner decal does not veil pedal bases | carried |

## 10. Next

1. Codex's single coarse comparison of the 24 explicit poses, via S.
2. My pose choice: an edit to `SELECTED_POSE` and its status, a regenerated declaration, an updated builder pin, then new hashes to S.
3. Codex's one full selected-pose measurement.
4. My final author handoff.

worker_done follows only after that, and reports source preparation only.
