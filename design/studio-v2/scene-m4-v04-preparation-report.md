# M4 v04 preparation: author report (bounded pass and hi-hat repair applied at P14; ready for the one full P14 measurement)

**Author:** actual Claude Opus 5.5 (`claude-opus-5-5`, `--effort high`, observed in my own process argv, PID 28952, under Orca). Task `task_23314c669e03`, dispatch `ctx_2d83d120ad37`, retry of stopped `ctx_5996dc215cff`. Current S: `term_34bea5af…`; scope message `msg_3215a56a133b`, my ACK `msg_e060e25d1bf1`. 16 November 2026.

**State: hi-hat repair applied on top of the bounded pass, not completion.** Root's hi-hat release `scene-coordination/m4-v04-hihat-repair-release.md` (`038dc8af…`) delegated the remedy to the independent critic. The critic's `scene-m4-v04-hihat-repair-review.md` (`5bc3d79f…`, evidence JSON `780363ca…`) selected one construction, and S relayed it in `msg_66baf41d5d4c`. I implemented that section 3 exactly (section 3c). The two hi-hat defects recorded in the pre-repair checkpoint `005955c6` are now repaired by construction, pending Codex's measurement; their history stays in section 7. The bounded-pass text follows.

**Bounded final pass (earlier, kept for history).** Root adopted P14 (`msg_3426c4122a7b`), and its bounded disposition `scene-coordination/m4-v04-bounded-art-disposition.md` (`7705f590…`, adopting the independent review `scene-m4-v04-bounded-art-review.md` `1af11ba5…`) released one final pass in these same four files, after checkpoint `4432edde`. This report covers that pass (section 3b): decisions 1–8, the hi-hat hinge declaration, and the metadata S approved for Codex (`msg_404c585797e4`, `msg_63a12bb6ae48`). P14 is unchanged. That pass reported one hi-hat finding to root before the full run; the hi-hat repair answers it.

Earlier pins, all superseded:
- **Interface-ready** (`msg_d12ca7bbbbc0`, root checkpoint `191a4c90`): helper `83e1445f…`, builder `eb0af482…`, declaration `f62a5850…`, report `1af15373…`.
- **Pose-selected** (`msg_1becf8e43691`, checkpoint `4432edde`): helper `4bb40946…`, builder `f65ff919…`, declaration `71171111…`, report `84853714…`.
- **Bounded pass, pre-repair** (`msg_103b9d7f17b2`, checkpoint `005955c6`): helper `5d01ed7c…`, builder `74476be0…`, declaration `476a17e3…`, report `f8f5342c…`.
- **Hi-hat repair, first handoff** (`msg_6bd22517f3a0`, never released: S read it mid-edit): helper `370b4adc…`, builder `fa2db253…`, declaration `c955f30b…`, report `50169877…`. The settled pins in section 1 add only the declared `deepestVertices` field in criterion A.

No Blender, export, browser, render, image, Git, dependency, helper, paid or process action was taken. The builder was never run and refuses to run. Nothing here is visual, export or candidate approval; all fourteen image gates (section 9) stay open.

Authorities: root `m4-v04-combined-repair-disposition.md` (`24E9B32C`), S boundary `m4-v04-internal-contract.md` (`A2AFC8A3`), author task `m4-v04-author-task.md`, recovery `m4-v04-coordinator-recovery-2026-11-16.md`, final art review `scene-m4-v03-focused-art-closure.md` (`4157A176`), declaration interface `m4-v03-verifier-declaration-contract-v3.json` (`5632CA4A`). v01-v03 sources, receipts, reviews and snapshots were only read. The stale original M4 export brief in the restart paste was **not** executed.

## 1. Files and hashes (repair-ready pins)

| Owned file (relative to `design/studio-v2/`) | SHA256 | Note |
|---|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` | `8d814874ee0ac1317827297d2a729b34f4789fffd891212ae03e2c440a73b792` | pure helper (math, fnmatch, numpy); writes nothing |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` | `0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826` | held builder, pins the helper hash above; refuses execution |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` | `8ce8db34b40a3ce053d037c5152fec8c8ed19d586b0968439abf64e3308f32bb` | 302,196 bytes; byte-exact output of the helper's `--declaration` |
| `scene-m4-v04-preparation-report.md` | (this file; hash sent with the handoff) | prose-only successor of `6b2a62a31ab086a5a72c880ecad04332576a5ae14c31ab882f6421aa6f51c6be`, which remains the measured and reviewed evidence. Only the section 3b locator names were corrected (source-closure note 5.1); no source, test or geometry change |

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
- `attachments`: 13 entries `{id, row, group, ontoRow, ontoGroup, relation: rests_on | embedded | hinged, intent, gapM (rests_on only), criterion?}`. The spring, both posts and the heel block rest on `kick.pedal_plate` with gap 0. The display face rests on `ctl.bezel` with gap 0.0003. Eight entries carry a `criterion`:
  - both spur arms into their feet and into `kick.base`;
  - `kick.footboard_on_heel`;
  - `hihat.hinge_in_base` (embedded, A), `hihat.footboard_in_hinge` (hinged, B) and `hihat.footboard_on_housing` (rests_on, gap 0.0003, C).

  The ambiguous `depthM` field is gone (decision 2). Every criterion locator is an **explicit index list**: each criterion carries `indexConvention`, and `edgeClassification.attachmentCriteria` says so too. Row `groups[].vertexRange` / `faceRange` stay end-exclusive, as before (S `msg_b4aca287d5fa`). Layout: sections 3b and 3c.
- `seatings`: exactly the four I1 pairs, `ctl_body__indicators/ctl.indicator_strip#0..3` into `ctl_body__shell/ctl.panel`, `seatDepthM` 0.001, `proudM` 0.0025.
- `roundRuns`: 18 entries `{id, row, group, faces}`: 4 corner runs each in `module.case`, `sustain.base`, `sustain.plate` and `hihat.base`, plus the top run of each `ctl.cheeks`.
- `edgeClassification`: the rule texts, plus `rolePairs` and `attachmentCriteria` texts.
- `edgeSets`: 44 entries `{id, status, reason, match: [{label, kinds, bands, rolePairs?}], reconsider?, source?}`. `rolePairs` is optional and additive. When present, the edge's two face roles (sorted; `edge_records()` now returns them as `roles`) must be one of the listed pairs. It pins the three by-name sets and the pad hidden edge to exact profile strips.
- `poseOptionIds`, `poseOptions` (24 plain `{cx, cy, yaw}`, accepted by the producer's `validate_pose_options`), `selectedPose` (P14), `selectedPoseStatus`, `restingRuns`.

`rowsSha256` is deliberately absent. It belongs to the producer and the root/S freeze, and is never self-pinned. A read-only import of Codex's checkpoint `produce_fullkit_m4_v04.py` (`e302a953…`) accepts this JSON: `snapshot_rows()` passes all 18 rows and `validate_pose_options()` passes. That is a compatibility smoke check, not producer evidence or a frozen digest.

## 3. What changed (root's bounded list only)

**K1 kick** (`kick()`, `SPUR`, `PEDAL_PLATE`):
- Each spur is now a rod arm ending inside its own flat-bottomed foot (r 8.5 mm, 22 mm tall, 8 sides). The foot's underside sits at the resting height: minimum z − rug field − 0.3 mm = 0.0000 mm for both. The foot is dark rubber, so the granted round-member-ends condition about bright-metal ends over 12 mm does not arise.
- I also moved each arm's root centre 6 mm inside the base frame's side face. In v03 the arm left at 45° in plan, so its root disc straddled the face, with half of it up to 4.9 mm proud: a visible wedge gap, the same kind of defect as the reviewer's spring finding. The root centre also rose from 18 to 22 mm above the resting height, and the tip centre from 12 to 14 mm. The tip's plan position is unchanged. Root confirmed this for exactly the two arms (decision 1); see section 3b for the criterion.
- The pedal plate is widened from half-width 0.045 to 0.068 (the reviewer suggested about 0.066) and extended 20 mm at the heel. The spring (x 1.472–1.484), both posts (1.367–1.383, 1.457–1.473) and the heel block (y 0.06–0.12) now stand flush on the plate top and wholly inside it (x 1.352–1.488, y 0.06–0.36). Measured offset: 0.0 mm.
- The kick pad ring's outer front corner now carries the shared `casing` 2-segment bevel. Its classes are `round`, `round`, `bevel:casing`, `bevel:casing`, `planar`, like the rack pad rims.
- Kick triangles: 856 → **1,040** of 1,500. The ring adds 96, as the reviewer estimated. The two spur feet add 88.

**N1 round runs:** `prism()` gives every face built from a run of consecutive round plan edges a run id: rrect arcs and the cheek top chain. `smooth_edges()` keeps an edge between two faces of one run smooth at any angle; otherwise the 40° split applies. Both `corner_normals()` and the held builder's edge marking use this one rule. The builder asserts that every non-run edge still agrees with Blender's own 40° angle. Effect: exactly 16 edges that were over 40° become smooth, the mid-arc edges of `module.case`, `sustain.base`, `sustain.plate` and `hihat.base`, at zero triangles. Planar corners keep their own normals; my quick check finds a maximum deviation of 1e-6°.

The reviewer's "cheek profile 12 edges, 0.065 m" was not a mid-run break: four were the 51° nose and eight were underside mitres. The bounded pass bevelled the nose and moved the mitres to contact (section 3b).

**A1 / E1 edge sets:** labels are split by kind of part, for example `kick.spur_arm.L`, `kick.pad_ring`, `ctl.wheel`, `ctl.bezel`, `stand.knob` and `pad.<name>.block`. Every hard edge belongs to exactly one `EDGE_SETS` entry, which gives it one status and one reason. Matching is by label, kind and band:
- **Kind** comes from the authored face roles: `cap`, `along` (lengthwise facets), `ring` (profile corners and bends), `block` or `open`.
- **Band** is `convex>=80`, `convex40-80` or `concave`.

Lengthwise cable facets are `faceted-round`, never end caps. Sticks and heads no longer carry `casing`. The bevel figure is reported as **middle-seam length**: `bevel:casing` 17.08 m and `bevel:white_key_lip` 0.75 m. That is not the treated original edge length. `SHARP_REASONS` is retired. My tally finds **no undeclared hard edge**.

**I1:** the four strips are declared exactly as root accepted: seated 1.0 mm into `ctl.panel` and 2.5 mm proud. The display face rests on the bezel. This is not a same-asset or within-row exemption.

**R2 / B1 wording (no geometry):** rug unchanged. Clearances are 20 mm to the lamp base, 70 mm to the desk-frame runner and 10 mm to the under-desk decal. The extra 50 mm is width surrendered inside the 70 mm separation, not a gap to the decal. Reconsider if that decal grows or moves more than 10 mm toward +x. The 150 mm rug margin applies left and right; the shortened rack back foot is accepted at source level under gate RK1. The music-corner decal's height and overhang remain an M6 dependency.

**Unchanged:** every other placement, material, row, caster, ceiling and retained-data contract. Rows 18 main, 9 casters, 27 refresh; placed 13,752 → **13,968** (limit 22,500) after the bounded pass; refresh-weighted 24,404 → 24,836. White keys 29, black 20, at all 24 poses.

## 3b. Bounded final pass (root `7705f590`, decisions 1–8 and hi-hat coverage)

**Geometry: one change, decision 3.** Each cheek nose now carries the shared `casing` 2-segment bevel, the same bevel already on the back-top corner and the outer face perimeter. Its effects:
- **Counts:** each cheek goes from 68 to 84 triangles (+16), and `ctl_body__shell` from 1,260 to **1,292** of 2,500. That is +32, as the reviewer estimated.
- **Preserved:** controller height and depth, keys, the key-to-cheek fit, materials, P14 and the row ceiling. The bevel only removes material.
- **Classes per cheek (35 faces):** 26 `bevel:casing`, 5 `planar`, 4 `round`.
- **Round run, declared explicitly rather than inferred from the old top chain:** each cheek's top run is now every non-facet top edge touching an interior top profile point. That gives 4 faces, the whole sloped top between the back-top bevel and the nose bevel: the 140 mm rear segment, two middle segments and the shortened front segment. Before, it was 3 faces, because the back-top bevel had already dropped the rear segment. This keeps the v01 intent of one smooth curved top. The helper asserts the count.
- **Normals:** the run rule still smooths exactly the same 16 over-40° edges in the whole kit (sustain 8, hi-hat 4, module 4). No cheek edge needs it, because every turn along the top run and into both bevels is under 40°. Planar corner deviation is 1e-6°.
- **Edges:** no hard `along` edge in the 40–80 band remains at the nose. The helper asserts that the only such cheek edges are the eight underside mitres, 0.0223 m in total.

**Classification and wording (decisions 4–7):**

| Decision | Set (status) | What changed |
|---|---|---|
| 4 | `ctl.cheeks.contact` (contact) | `ctl.cheeks.front_corner` is removed. The eight underside bevel-band mitres (4 at 75.5°, 4 at 41.4°, within 2.2 mm of the cheek underside, facing the stand arms) are named in the contact reason. |
| 5 | `cymbal.edge` (named, source decision 5) | Covers both corners of the 8.9 mm band on the three cymbals: the 70.0° upper corner (72 edges, 3.496 m, moved from `faceted_round.profiles`) and the 108.5° lower corner (72 edges, 3.571 m), 7.067 m in all. Pinned to role pairs `b5/b6` and `b6/b7`. The wrong "bell-to-bow" reason is removed: that turn is 39.6° and smooth. The source material rule is `fabric` (the dark matte e-cymbal pad). |
| 6 | `pad.rim_lower_outer` (named, source decision 6), `pad.shell_bottom.contact` (contact) | The proposed set is split. The bright rim lower outer corner (71.4°, `b4/b5`, 3.609 m) is accepted under E1b; its bevel fallback (about 384 triangles against 288 headroom) is not authorised. The black shell bottom corner (52.8°, `b1/b2`, 3.358 m) gets a hidden-edge reason, to be reconsidered if a planned eye drops below the pad bottoms. |
| 7 | `rug.binding_shoulder` (named, source decision 7) | Accepted for the current 10.5 mm chamfered matte binding only (`b0/b1`, 16 edges, 7.739 m). The rug is unchanged. |

The `named` status text now says it also covers sets accepted by name in the bounded disposition, with a `source` field on each. **No `proposed` set remains.** There are 0 undeclared edges and still 44 sets: one was removed and one split.

**Attachment criteria (decisions 1, 2, 8; S `msg_404c585797e4`, `msg_63a12bb6ae48`).** Each `criterion` is `{kind, meaning, locators…, named metric fields, authorObserved}`. All indices are row-level (`rows[].vertexCount` / `faceCount` space). They come from the authored primitive topology:
- **rod:** root ring, tip ring, side quads, root cap, tip cap
- **extrude:** underside cap, top cap, sides
- **box:** −z, +z, −y, +x, +y, −x

`authorObserved` is my source figure, not measurement of record. The public v3 verifier schema is unchanged.

- **`kick.spur_arm_{L,R}_in_base`**, kind `rod_root_embedded_through_flat_face`.
  - **Locators:** `rootRingVertices` (8: L 96–103, R 136–143); `lengthwiseEdges` (8 pairs, root i to tip i); `rootCapFace` (L 84, R 112); `tipRingVertices`; `tipCapFace` (L 85, R 113); `armSideFaces` (L [76…83], R [104…111], explicit lists); `receivingFace` (`kick.base` own-side flat face with its `faceVertices`: L 51 [59, 48, 60, 71] with outward normal −x, R 45 [53, 54, 66, 65] with +x).
  - **Metrics:** `minRingBurialM` 0.001 (every ring vertex at least this far inside that face) is separate from `rootCentreInsetM` 0.006 (the disc centre's inset, not a penetration depth). Also `rootCentreHeightM` 0.022, `tipCentreHeightM` 0.014 and `restingHeightM` 0.0086, with the v03 → v04 height change stated.
  - **Observed:** burial 1.34–10.66 mm; crossing points at least 3.69 mm inside the flat face outline (`crossingMinInsideFaceOutlineM`), clear of the bevel bands, top and back; heights 22.0 and 14.0 mm.
- **`kick.spur_arm_{L,R}_in_foot`**, kind `rod_tip_inside_solid`: tip ring, tip cap and `footVertices` (L [112…135], R [152…175]) locators. Observed: at least 0.85 mm inside the foot's 8-sided wall (apothem) and 1.04 mm below its top.
- **`kick.footboard_on_heel`**, kind `board_end_seated_through_top_face`. The intent is now positive: an intended seat, not "inherited, reported".
  - **Heel faces:** `receivingTopFace` 299 and `receivingUndersideFace` 298; `forbiddenCrossingFaces` −y 300, +x 301, +y 302, −x 303.
  - **Board faces:** the two parallel caps, underside 284 and top 285, so Codex measures the thickness. Also `boardVertices` [376…399] (24) and `boardSideFaces` [286…297], explicit lists, and `heelVertices` [400…407].
  - **Proud locator:** `exposedUpperHeelEndCorners` [396, 397], the exposed upper corners of the heel-end edge.
  - **Metrics:** `maxDepthM` 0.004, `boardThicknessM` 0.008, `minProudM` 0.0038.
  - **Observed:** six below-top vertices (382–387), maximum depth 4.000 mm, thickness 8.000 mm, heel-end corners 3.82 mm proud, 16 mm above the heel underside.
  - **Coverage:** Codex checks all footboard vertices and all source edges, not this subset.

**Hi-hat (pre-repair state, superseded by section 3c).** `hihat.footboard_in_hinge`, relation `hinged`, kind `board_heel_captured_in_hinge_barrel`. This is a cylindrical capture, not the kick's planar seat rule.

Locators:
- **Barrel:** `hihat.hinge`, axis start [0.971485, −0.039416, 0.0306] → end [1.060838, −0.028642, 0.0306]; radius 9 mm, 12 sides, inscribed radius 8.693 mm; rings 128–139 and 140–151; side faces 94–105; end discs 106 and 107.
- **Board:** `hihat.footboard` vertices 96–127 (written then as the end-exclusive range [96, 128]); underside face 76, top face 77; heel-axis vertices 107 and 108; heel-end face 89 = (107, 108, 124, 123).

My intended criterion:
1. The two heel-axis vertices lie on the barrel axis, within 0.05 mm, between the end discs.
2. Every footboard vertex between the end discs and within the barrel radius lies inside the exact 12-gon barrel, so the heel-end face is wholly inside.
3. The board is 104 mm wide and the barrel 90 mm, so the board's rounded heel corners pass out through the end discs. No board vertex lies more than 7.0 mm (the authored width difference, not a tolerance) beyond an end disc.
4. No footboard vertex is below the base top.

Observed against that criterion:
- Axis vertices at 0.000 mm.
- The four vertices within the barrel (107, 108, 123, 124) are all inside it, with a maximum radial distance of 8.000 mm.
- Six corner vertices (105, 106, 109, 110, 122, 125) lie beyond the end discs. The whole board overhangs by at most 7.0 mm.
- The board is 12 mm above the base top.

**The pair satisfied its criterion.** The separate barrel-mounting issue was reported (section 7) and is repaired in section 3c. In this section, the ranges were written then as `sideFaceRange` (last face included) and `vertexRange` (end excluded). They are now explicit lists.

**Locator names: historical versus final.** The pins handed off in `msg_103b9d7f17b2` (helper `5d01ed7c…`, declaration `476a17e3…`) used range fields:
- `armSideFaceRange` and `barrel.sideFaceRange`, both [first, last] inclusive;
- `boardSideFaceRange`, inclusive;
- `boardVertexRange` and `board.vertexRange`, both end-exclusive.

Those descriptions are kept here as the record of those pins. The final declaration `8ce8db34…` replaces every one of them with an explicit index list: `armSideFaces`, `boardSideFaces`, `boardVertices`, `barrel.sideFaces` and `board.vertices`. Each criterion also carries an `indexConvention`. The lists above in this section are the final names and values.

## 3c. Hi-hat repair (root `038dc8af`; construction `5bc3d79f` section 3, implemented exactly)

**Construction.** Both defects are fixed by one adjustment, using authored numbers only. No part is added, removed or renamed.
- **Seated hinge.** New constant `HIHAT_HINGE = {r 0.009, seat 0.003, base_top 0.010, housing_top 0.070}`, in the pedal frame. The hinge axis is now `base_top + r − seat` = local z **0.016** (was 0.022), so the barrel is a knuckle seated 3.0 mm into the base top cap. The barrel's x extent (±0.045), y (−0.135), radius, 12 sides and material are unchanged. The base and housing now take their heights from the same constants; their values are unchanged.
- **Toe at rest.** The board origin stays on the barrel axis. The pitch is derived, not chosen:
  - lip at pedal-frame y = `l/2 − 0.085 + bev('casing')` = 0.083125, z 0.070;
  - `rise = atan2(Δz, Δy) + asin(EPS / hypot(Δy, Δz))` = **13.9813°** (was 12.2648°);
  - the plan run stays 0.23, so the toe tip is still at local y 0.095.

**Effect, against pre-repair `5d01ed7c`, by an author source comparison:**
- Only `drum_hihat_pedal__pedal` changes. Exactly 56 vertices move: the board (96–127) and the barrel (128–151). Base, housing, heel rubber and every other row are byte-identical in vertices, faces, classes, roles, runs and identities.
- The row stays at 300 of 600 triangles, 160 vertices and 114 faces. Its bounds are [0.917, −0.070, 0.009] to [1.083, 0.270, **0.090**]; the top rose from 0.0884 to 0.0896.
- The hard edges sit in the same sets. The only tally change is `granted.thin_plates` ≥80 at 6.379 m, up 6.6 mm because the board is longer.
- `HIHAT_PEDAL`, the cable jack, P14, the cheeks and all materials are unchanged.

**Criterion A: `hihat.hinge_in_base`** (embedded), kind `barrel_knuckle_seated_through_top_face`, intent: a knuckle seated in the base plate.
- **Locators:**
  - receiving top face **1**, vertices [36…47], outward normal +z;
  - underside face 0; base vertices [0…47]; base thickness 0.010;
  - barrel rings [128…139] and [140…151]; side faces [94…105]; end discs [106, 107]; radius 0.009, 12 sides; axis = the line through the two ring centroids;
  - heel vertices [152…159].
- **Required:**
  - exactly `seatedVertices` [133, 134, 135, 145, 146, 147] lie below the top-cap plane;
  - seat depth 0.003 ± 0.00005, measured as the greatest perpendicular depth and reached by exactly `deepestVertices` [134, 146] (S `msg_aa0a700e3304`);
  - every other barrel vertex at least 1.0 mm above the plane;
  - seated vertices inside the top-cap outline by at least 10 mm;
  - every barrel vertex at least 5 mm above the underside plane;
  - both axis ends 0.006 ± 0.00005 above the top plane;
  - vertex-to-box distance to the heel rubber at least 2.5 mm (a designed clearance).
- **Observed:** seated exactly [133, 134, 135, 145, 146, 147]; depth 3.000 mm (vertices 134 and 146; the others 1.794 mm); others at least 1.500 mm above; inside the outline by 16.87 mm; 7.000 mm above the underside; axis heights 6.000 and 6.000 mm; heel clearance 3.000 mm. **Satisfied.**

**Criterion B: `hihat.footboard_in_hinge`** (hinged), same kind and the same four conditions, updated for the lowered axis.
- **Locators:**
  - axis [0.971485, −0.039416, **0.0246**] → [1.060838, −0.028642, 0.0246] in world metres;
  - board vertices [96…127], underside 76, top 77, side faces [78…93], heel-axis vertices [107, 108], heel-end face 89;
  - condition 4 is now measured against the plane of an author-owned surface, `receivingBaseTop` = `hihat.base` face 1.
- `barrelMountingNote` is removed.
- **Observed:** axis vertices 0.000 mm; 107, 108, 123 and 124 inside the barrel, with a maximum radial distance of 8.000 mm against the 8.693 mm inscribed radius; the board overhangs at most 7.000 mm beyond an end disc; the board is **6.000 mm** above the base top (was 12). **Satisfied.**

**Criterion C: `hihat.footboard_on_housing`** (rests_on, `gapM` 0.0003), kind `board_rests_on_lip_separating_plane`, intent: the toe rests on the housing's front lip and does not enter it.
- **Clearance:** the signed perpendicular distance of a housing vertex from the plane of board face 76, positive on its outward (lower) side.
- **Locators:**
  - board underside 76 with its 16 vertices, top face 77, toe-tip underside vertices [99, 100];
  - housing vertices [48…95], top face 39 with vertices [84…95], lip vertices **[86, 87]**.
- **Required:**
  - every housing vertex at least 0.25 mm clear;
  - the lip at 0.30 ± 0.05 mm, with every other housing vertex further away;
  - the lip's perpendicular feet inside the face-76 outline by at least 5 mm.
- **Observed:** minimum over all housing vertices 0.300 mm; lip 0.300 and 0.300 mm; next nearest 0.374 mm; feet 5.84 mm inside. Reported only: the board overhangs 11.9 mm beyond the lip, and the toe tip stands 3.27 mm above the housing top. **Satisfied, with no overlap.**

The criterion figures match the critic's what-if to the printed precision. The one exception is the 1.5 mm unseated margin: the critic gave it from geometry, and my source check now prints it.



## 4. P1 pose table (author's explicit bounded options)

Root's ranges are cx 1.325–1.40, cy −0.825 or −0.80, yaw −0.95 to −0.85. I chose 4 × 2 × 3 = 24 samples:
- x at 25 mm steps across the whole range: 1.325, 1.35, 1.375, 1.40
- both permitted y values: −0.825, −0.80
- yaw −0.85, −0.90, −0.95 (root's cap; the reviewer's art guard)

`P00` = (1.325, −0.825, −0.85) is the v03 reference. Ids run x-major, then y, then yaw. For example, P03 = (1.325, −0.80, −0.85), P07 = (1.35, −0.825, −0.90) and P23 = (1.40, −0.80, −0.95). Every option builds; the stool support rule raises on mixed or binding support and passes at all 24.

**Selection: P14 = (1.375, −0.825, −0.95).** I read the full unranked 24-row table and its limitations. Every option keeps:
- the three project targets at 81/81 each
- all 29 white-key tops
- all 25 supports within the signed-gap and rounded-polygon limits
- the kick pedal, kick tower, hi-hat pedal, stool seat and module display figures unchanged

The options differ in four measures:
- the throne seat-top uniform surface area: 384 samples on the actual roof faces
- the controller's actual-hit azimuth envelope
- the sustain pedal: the stool blocks 12 vertices at yaw −0.85 and −0.90, and it is clear at −0.95
- phone key pitch

| Option | Pose | Azimuth env. | Throne top area | Throne verts | Sustain | music-320 pitch | Min support clearance |
|---|---|---|---|---|---|---|---|
| P00 (v03 reference) | 1.325, −0.825, −0.85 | 30.91° | 0.638 | 45/73 | 104/116 | 9.40 px | 49.9 mm |
| P08 | 1.35, −0.825, −0.95 | 31.10° | 0.680 | 52/73 | 116/116 | 9.12 | 33.9 |
| P13 | 1.375, −0.825, −0.90 | 30.43° | 0.768 | 53/73 | 104/116 | 9.15 | 41.3 |
| **P14 (selected)** | **1.375, −0.825, −0.95** | **30.70°** | **0.760** | **54/73** | **116/116** | **9.05** | **33.9** |
| P19 | 1.40, −0.825, −0.90 | 30.04° | 0.849 | 58/73 | 104/116 | 9.08 | 41.3 |
| P20 | 1.40, −0.825, −0.95 | 30.31° | 0.833 | 58/73 | 116/116 | 8.98 | 33.9 |

**Why P14:**
- **Throne.** In Codex's CPU uniform-area samples on the seat-top roof faces, 292/384 samples are visible at P14 against 245/384 at P00 (0.760 against 0.638). That is a sampled-area improvement. It is not a T1 result, and image gate T1 remains unpassed.
- **Azimuth.** The envelope keeps 0.70° above 30°, about the v03 margin the reviewer judged thin but workable. The higher-throne cx 1.40 options keep only 0.04–0.31°, and P18, P21 and P22 fall below 30°. At every x, cy −0.80 loses both throne and azimuth against −0.825.
- **Sustain pedal.** It is fully clear at yaw −0.95, so gate SP1 gains.
- **Cost.** Phone key pitch drops about 4% (9.40 → 9.05 px at music-320), and the keyboard turns to root's yaw cap. I accept this at the cap, not past it, as the reviewer's art guard requires.
- **Clearance.** 33.9 mm against the 20 mm requirement, the same at every yaw −0.95 option.

**Fallbacks for root's image review, with no new search:** P08 if the captured azimuth fails AZ1; P13 if yaw −0.95 reads too turned against the wall line. These envelopes and area samples are CPU diagnostics, not contiguous visible span or pixels. Gates T1, AZ1, SP1 and H1 decide.

## 5. Per-row counts and bounds (selected pose P14; Blender metres)

| Row | Casts | v03 tris | v04 tris | Ceiling | min | max |
|---|---|---|---|---|---|---|
| `ctl_body__shell` | yes | 1260 | **1292** | 2500 | [0.959, -1.319, 0.689] | [1.791, -0.331, 0.784] |
| `ctl_body__indicators` | no | 60 | 60 | 60 | [1.133, -1.001, 0.76] | [1.619, -0.436, 0.772] |
| `ctl_keys__keys` | no | 1168 | 1168 | 1540 | [1.017, -1.285, 0.719] | [1.649, -0.495, 0.754] |
| `ctl_stand__frame` | yes | 776 | 776 | 1300 | [1.038, -1.194, 0.009] | [1.712, -0.456, 0.689] |
| `ctl_sustain_pedal__pedal` | no | 312 | 312 | 500 | [1.458, -1.3, 0.009] | [1.847, -0.977, 0.732] |
| `stool_keys__stool` | yes | 548 | 548 | 700 | [0.885, -1.223, 0.009] | [1.215, -0.893, 0.5] |
| `drum_rack__rack` | yes | 2084 | 2084 | 2400 | [0.807, 0.188, 0.009] | [2.005, 0.735, 1.002] |
| `drum_pads__shells` | yes | 2312 | 2312 | 2600 | [0.883, 0.096, 0.438] | [1.936, 0.621, 0.846] |
| `drum_pads__heads` | no | 384 | 384 | 900 | [0.924, 0.114, 0.536] | [1.908, 0.592, 0.833] |
| `drum_cymbals__cymbals` | yes | 1812 | 1812 | 1950 | [0.66, 0.258, 0.888] | [2.169, 0.857, 1.11] |
| `drum_hihat_pedal__pedal` | no | 300 | 300 | 600 | [0.917, -0.07, 0.009] | [1.083, 0.27, **0.09**] |
| `drum_kick__tower` | yes | 856 | **1040** | 1500 | [1.236, 0.06, 0.009] | [1.604, 0.568, 0.459] |
| `drum_module__body` | yes | 416 | 416 | 640 | [0.739, 0.317, 0.567] | [0.993, 0.53, 0.854] |
| `drum_module__display` | no | 12 | 12 | 60 | [0.796, 0.37, 0.803] | [0.878, 0.411, 0.832] |
| `drum_sticks__pair` | no | 120 | 120 | 120 | [0.866, -0.011, 0.558] | [1.204, 0.451, 0.586] |
| `drum_throne__throne` | yes | 588 | 588 | 700 | [1.234, -0.217, 0.009] | [1.616, 0.175, 0.482] |
| `rug__rug` | no | 156 | 156 | 400 | [0.56, -1.36, 0.0] | [2.215, 0.89, 0.011] |
| `music_cables__runs` | no | 588 | 588 | 800 | [0.617, -0.488, 0.0] | [1.933, 1.031, 0.76] |

Controller-dependent rows (shell, indicators, keys, stand, sustain, stool and the controller cable) move with the selected pose; pose does not change their counts. The shell's 1,292 includes the 32 cheek-nose bevel triangles (decision 3), and its bounds are unchanged because the bevel only removes material.

## 6. Edge sets: author tally (metres; Codex measures independently)

| Status | Sets (length by band) |
|---|---|
| named (C13; knobs and hinges by kind of part; v04 decisions 5–7 by name) | keys.white 29.15 (≥80); keys.black 11.68 / 0.22 (40-80); rack.clamps 8.21 / 7.17; rug.binding_shoulder 7.74 (40-80, decision 7); rug.inner_step 7.57 + 7.57 concave; cymbal.edge 3.57 (≥80) + 3.50 (40-80) (decision 5); pad.rim_lower_outer 3.61 (40-80, decision 6); pad.lugs 4.03; pad.rim_inner 3.21 + 3.46 concave; ctl.panel_pads 2.25 / 0.24; stand.pivot 1.98; pad.blocks 1.86; cymbal.nuts 1.35; ctl.knobs 1.15; ctl.transport_keys 0.90; stand.knob 0.27; pedal.hinges 0.25; module.knob 0.20 |
| granted (root 5d, exactly as enumerated) | round_member_ends 14.59; thin_plates 6.38 / 0.03; small_dark_blocks 1.84; controller_wheels 0.52 |
| contact (reason, not exception) | rug.underside 7.74; pad.head 6.39; ctl.slab 4.23; pad.shell_bottom 3.36 (40-80, decision 6); pad.rim_skirt 3.21 (open); ctl.panel 2.65; ctl.bays 1.84; ctl.cheeks 1.655 + 0.022 (40-80 underside mitres, decision 4); kick.head 0.98; kick.pad_ring.open 0.96 (open); hihat.base 0.89; kick.base 0.89; sustain.base 0.69; kick.tower 0.63; kick.pad_ring.seat 0.55 (40-80); sustain.plate 0.54; hihat.housing 0.35 |
| screen | ctl.glow 1.19; module.glow 0.46 |
| faceted-round | members 68.95 (40-80) / 0.02 / 0.17 concave; cables 41.09 (40-80) / 2.47 (≥80 skewed bends) / 0.17 concave; profiles 6.23 (40-80; no cymbal edge) |
| proposed | none |

Recomputed at P14 after the bounded pass: 0 undeclared. Totals at P14: 134.16 m convex ≥80, 143.58 m convex 40-80, 11.36 m concave, 4.17 m open-lathe boundary. Lengths are pose-independent except the controller cable bends. Bevel middle seams: `bevel:casing` 17.15 m (the cheek noses add 0.07), `bevel:white_key_lip` 0.75 m. The 139.10 m v03 review figure is evidence on v03, not a target. Convexity is taken per primitive after orienting its winding outward. Open lathes are flagged as `open` rather than guessed.

## 7. Honest unresolved findings

1. **Hi-hat hinge barrel mounting: repaired by construction (section 3c), pending Codex's measurement.** History: at checkpoint `005955c6` the barrel touched only the board, 3.0 mm above the base top and 3.0 mm in front of the heel rubber (inherited v01). That checkpoint reported it to root before the full run, root released a bounded repair, and the critic selected the remedy. The barrel is now seated 3.0 mm into the base top (criterion A). The 3.0 mm to the heel rubber is now a declared designed clearance, not a defect.
2. **Hi-hat footboard toe over the sensor housing: repaired by construction (section 3c), pending Codex's measurement.** History: the housing's top front edge stood up to about 0.57 mm inside the board underside (six top-cap vertices). It was undeclared and reported. The board pitch is now derived from the pivot and the lip, so the toe rests 0.30 mm above the lip with no overlap (criterion C).
3. **Thin source margins, by design:**
   - spur ring burial 1.34 mm against 1.0;
   - spur tip 0.85 mm inside the foot wall;
   - kick footboard 0.5 mm inside the heel sides, and heel-end corners 3.82 mm proud against 3.8;
   - hi-hat heel-end top vertices at 8.000 mm against the barrel's 8.693 mm inscribed radius;
   - hi-hat toe lip rest 0.30 mm, next housing clearance 0.374 mm;
   - barrel seat 3.0 mm, unseated barrel vertices 1.5 mm above the base top.

   Exported positions must confirm all of these after quantisation (K1/E1b). In particular, the 0.30 mm lip gap must stay positive and the barrel must stay seated.
4. **Open lathes** (pad shell inner skirt, kick pad ring ends) are surfaces, not closed solids, with double-sided material. Their boundaries are declared as contact/hidden, so a ray or intersection tool should treat them as surfaces.
5. **Cables** rest on both the rug and the bare floor. They are deliberately **not** supports: interface 3 requires one surface per row, and a resting run is not a standing primitive. They need Codex's cable checks.
6. **Pose P14 sits at root's yaw cap.** The azimuth margin (0.70° by actual-hit envelope) is thin and is not continuous visible span. Phone key pitch is 9.05 px. Gates AZ1, T1 and H1 decide, with the already-measured fallbacks P08 and P13 kept for image review only.
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
- Edge tally with no undeclared edge and no proposed set; the cheek-nose assertion (only the eight underside mitres remain in the 40-80 `along` band).
- Cheek classes and runs (26/5/4 per cheek, 4-face run); 16 run-smoothed over-40° edges, none on the cheeks.
- Attachment criteria computed from source (sections 3b and 3c), every hi-hat criterion A/B/C value included.
- Hi-hat repair comparison against the pre-repair helper `5d01ed7c` (read with `git show` from `005955c6`): only the hi-hat row differs, 56 vertices move, topology is identical, and the edge tally is unchanged except the board's thin-plate length.
- N1 planar corner deviation.
- Declaration byte reproduction.
- The read-only producer compatibility smoke check.

None of these is Codex's measurement, the verifier or image evidence. The approved v3r1 verifier does not approve this candidate.

## 9. Image gates (all fourteen remain open)

| Gate | Passes when (from the pinned review) | v04 note |
|---|---|---|
| N1a | casing faces shade evenly; highlight stays in the bevel band | cheek nose now bevelled (decision 3): the nose highlight must stay in the bevel band |
| N1b | module case and pedal-base rounded corners: no mid-corner crease | run fix applied at source |
| H1 | continuous key lips; 29 + 20 countable | |
| K1 | contact under every support, **both spur feet**, no gap under the spring | plate, spurs, arm roots (decision 1), kick footboard seat (decision 8), hi-hat barrel seat and toe rest at source |
| T1 (throne) | round seat behind the controller, at most about a third hidden, no near-tangent | P14: 292/384 sampled top area against 245/384 at P00 (CPU diagnostic); unpassed |
| HH1 | hi-hat footboard and heel identifiable beside the desk leg | repaired at source: barrel seated, toe resting on the lip; heel 6 mm lower and pitch 1.7° steeper; the barrel shows 7 mm above the heel rubber (was 13) |
| SP1 | sustain pedal identifiable, not merged with the stool leg | |
| AZ1 | controller azimuth from the capture ≥ 30° (continuous span) | |
| RUG1 | rug clear of lamp base and desk frame, reads as carrying the kit | binding shoulder: no hard slab or bright outline (decision 7) |
| RK1 | rack feet read as feet front and back | |
| E1a | kick pad ring not cheaper than the tom rims | now bevelled; checks the bevel reads alike |
| E1b | no allowed sharp set reads unfinished; strips read as lit inlays | plus cymbal band (no slab, no bright line), pad rim lower corner (no bright lower line or cut strip), rug shoulder, footboards |
| F1 | stand tubes and sticks not faceted; cables do not sparkle | |
| M6 | music-corner decal does not veil pedal bases | carried |

## 10. Next

1. S checks that the repair fits root's release `038dc8af` and that both defects have concrete criteria, then releases the one full P14 CPU measurement on these pins after a fresh resource check.
2. Codex's single full P14 measurement: assembly, attachments (criteria A, B, C included), supports, normals, cables, targets, budgets and source-to-rows reproduction.
3. My final author handoff, then worker_done reporting source preparation only.
