# M4 v03 bounded CPU verification

**REQUEST CHANGES.** The author receipt reproduces exactly except elapsed time, and the current counts, dimensions and authored planar normals pass the independent source checks. K1 nevertheless fails on two actual kick-spur contacts. The support/class checks also miss meaningful negative fixtures, and one edge-reason category misidentifies substantial side edges as end caps. No export, runtime or image acceptance follows.

15 November 2026; actual Codex, task `task_570136a24c70` / dispatch `ctx_02c7ee2da124`. Startup ACK `msg_c80c2da8fa12`; initial findings sent to S in `msg_00801b87c3f6`. Retained executable observed as `C:/Users/Owenc/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe`; local inherited configuration `gpt-6-astra` / `xhigh`, no argv model/effort override. Server-effective routing is not observable. No restart or helpers.

Evidence: [probe](scene-coordination/m4-v03-cpu-verification.py) and [JSON receipt](scene-coordination/m4-v03-cpu-verification.json). Only these new files and this report were written. All 22 final pinned inputs match, including protected v01/v02 artifacts, mapping, profile, ledger, parent and guard. No artist/source/asset/guard/provenance edits, Blender, browser, render, build, Git, dependency or process intervention occurred.

## Findings requiring owner action

**G1 — actual geometry failure: kick spurs float.** Each anti-creep rod's lowest vertex is **5.325064731 mm above the rug field**, or **+5.025064731 mm** relative to the required 0.3 mm gap. Locators: helper `kick()` lines755–757, `kick.hardware`, primitive ordinals2/3. The author's subsequent clarification explicitly confirms these are support contacts and this is a geometry error, inherited from v01; they are not decorative exceptions. See [S's durable clarification](scene-coordination/m4-v03-author-clarifications.md), author message `msg_b4e298729fac`, relayed in `msg_918ac13adbfe`. This resolves the earlier intent question without changing the source or rerunning the grid. Actual Claude owns the eventual geometry remedy; none was performed here.

**V1 — support coverage failure.** `measure_fullkit_m4_v03.py:480` selects only vertices within0.5 mm of the whole row minimum. Raising rack rubber-foot primitive2 by5 mm removes it from that set; the author result remains `pass:true`, gap error0, while the independent primitive check fails at+5 mm. The current kick spurs demonstrate the corresponding real omission. Require an explicit complete support inventory, stable primitive identity and per-support signed gap/receiving-surface checks; do not regenerate the inventory from lowest vertices. Preserve the actual positive controls and raised-foot negative. Geometry/semantic declarations remain the author's; verification ownership awaits root's repair release.

**V2 — rounded-field coverage failure.** The helper's `rug_support` and measurement `classify_point` use rectangles. At `(0.606,-1.314)`, the rectangle's20 mm inner clearance is only **19.318516526 mm** against the actual rounded field polygon. Rounding removes field area, contrary to the preserved report's assertion. Require actual inner-field polygon clearance for rug footprints and outer-outline clearance for floor footprints, across the complete footprint. Current ordinary supports have ample clearance, so this fixture establishes a predicate defect rather than another actual misplaced foot. The author acknowledges both the predicate and wording errors.

**V3 — N1 coverage failure.** Current intended groups have complete, unique source coverage and valid normals. But deleting the class on actual shell face0 reduces the author's checked planar triangles from112 to108 with zero reported failures; duplicating its group range leaves112 and zero failures. `normal_check` tests whichever faces still say `planar` and does not enforce expected coverage. Require fixed authored group scope/counts, valid full-length classes, exactly-one group membership, rejection of missing/duplicate/null/unknown coverage, and hash-bound class correspondence; relabelling cannot cure a failed panel. Our missing/duplicate negatives reject, the actual positive passes, and a3-degree tilt on a real planar corner fails. Degenerate actual planar geometry also rejects. No area selector or absolute dot product is used.

**V4 — A1 edge reasons are not yet accurate per edge set.** `SHARP_REASONS` assigns `cable.*` the reason “cable end caps at the jacks and the wall.” The controller cable has **four non-cap side edges totalling0.928921527 m**, included in its reported0.9642 m hard-edge total. One is0.647449523 m long at80.0071 degrees, vertices234/239, faces215/216; neither adjacent face is an end cap. This is a concrete semantic accounting defect, not permission to remove bevels or approve a new exception. Correct the edge-set classification/reasons and seek root disposition of remaining unnamed edges. Several `named` labels also explicitly include unapproved “ALSO” parts; those labels are not blanket exemptions.

## Positive source evidence and limits

The single full reproduction ran in208.9 seconds and matched **every JSON field except `elapsedSeconds`**, including environment, topology, normals, intersections, visibility and the selected placement search. It used `--print`, never `--write`, and never imported the Blender builder. One heavy CPU process ran at a time.

Independent face triangulation and mapping checks cover **all18 rows**:18 main contributions,9 casters,27 shadow-refresh contributions,13,752 placed triangles and24,404 weighted refresh triangles. Every row's asset/material/cast flag and triangle ceiling matches the frozen mapping; its opaque/double-sided/receive flags also agree. These are source/ledger quantities, not measured renderer calls, GPU performance or compressed transfer.

Independent dimensions from actual vertices:

| Item | Measured result |
| --- | --- |
| Controller envelope | 0.990 × 0.320 × 0.094910751 m |
| Stand own height | 0.680 m |
| Keys | 29 white,20 black;29 front lips each3.125 mm in both directions,2 facets |
| Key pitch / width / gap | 29.4 / 26.0 / 3.4 mm; keys fit inside±0.473 m cheek inner faces; bed gap0.3 mm |
| Rack frame including clamps | 1.170 m wide,0.750 m tall; width+0.862% against1.16 m |
| Rack with booms / whole row | Width1.190682798 / 1.198084396 m; separately accounted |
| Pad rims | Toms0.282 m; snare0.306 m |
| Cymbals | 0.380 m diameters |
| Hi-hat base / module case | 0.130 × 0.330 m / 0.200 × 0.150 × 0.050 m |
| Eight music cables | 6.0 mm measured circumdiameter of authored five-sided rings |

Twenty-three ordinary support primitives across seven rows pass independent complete projected-footprint checks against the actual flat-field polygon atZ0.0083 m, with0.3 mm resting gap. Minimum clearances by row: stand146.295, sustain49.901, stool102.072, rack129.000, kick bases324.000, hi-hat331.391, throne572.795 mm. This positive control **excludes the two failing spurs**, so it is not an all-support K1 pass. The rug itself has0.3 mm floor gap. Cables are explicitly draped geometry, not undisclosed support exemptions.

Rack support-tube/rubber footprint margins are269/244/1740/155 mm left/right/front/back. The author's255/230 mm side margins include low clamp geometry in its30 mm selection band; both readings exceed150 mm. The old report's124 mm rack binding clearance is an acknowledged erratum; its frozen receipt and this check give129 mm. The under-desk decal has10 mm actual separation, not50 mm; root must reconcile that wording. The retained music decal overhang/height stays an M6 dependency and was not edited.

All source triangles are nondegenerate and generated corner normals finite/unit. The seven intended N1 rows contain **1,060 planar triangles**:112 shell,464 keys,56 sustain,288 pad shells,56 kick,56 hi-hat,28 module. Every planar corner passes the oriented2-degree predicate, regardless of area. A0.85 m ×1.5 mm smooth bevel strip (6.375 cm² per triangle) passes under its bevel class and fails if incorrectly forced planar. Authored classes originate in primitives/declared lathe strips, independently of normals. These are source normals, not exported accessors or rendered shading.

Centralized `BEVEL_CLASSES` specifies3.125 mm/two-segment casing and white-lip treatment. The receipt reproduces per-row bounds, counts, topology and hard/bevel lengths. Its bevel metric is the sum of shared same-class bevel-face edges, labelled “middle seam”; it is not a general reconstruction of original treated edge length. Independent topology agrees: pad shells have96 boundary edges and kick48; all rows have zero non-manifold edges. Open lathe rings and negative-volume winding are disclosed inherited facts, not a watertight-solid certification.

## Geometry, rays and export correspondence

The author cross-asset edge/triangle test reproduces no non-decal hits. A real crossing control returns1 and a separated control0. However, coplanar overlapping triangles and a fully enclosed tetrahedron both return0: “exact triangle tests” does not establish collision-free solid geometry. Same-asset and within-row intersections are skipped wholesale. Checking the three skipped cross-row pairs finds32 shell/indicator triangle hits,0 pad-shell/head hits and0 module/display hits. Embedded indicators may be intentional; require an explicit scoped resting/embedding explanation instead of treating an asset ID as a universal exception. No art repair was made.

Eight music-decal intersection entries remain recorded separately, not silently erased. They cannot establish final contact appearance. Vertex-to-triangle `gap` is unsigned, can overestimate edge-to-edge separation, and is not a support-height check; the5.7 mm shell/stand estimate does not by itself prove a floating controller.

All three target meshes independently satisfy two-triangle/four-corner rectangle, coplanarity, area coverage and front-facing-eye preconditions. Each yields81/81 actual own-target first hits. Their positive control is stronger than accepting a missing hit. Feature rays retain the author's policy that `None` counts unobstructed; actual no-hit contributions are25/210 kick-pedal samples,20/192 upper kick,3/160 hi-hat,14/116 sustain,7/73 throne,18/110 stool and0/8 module. These are endpoint line-of-sight heuristics, not proof of visible pixels or a runtime picking test.

Selected fractions reproduce: kick188/210, sustain103/116, throne45/73, hi-hat73/160. Fractions still depend on changed tessellation/sample sets, so they do not establish like-for-like perceptual improvement. The30.6701-degree controller result is the angular envelope of visible samples (354/358), not a contiguous unobscured span. Sampling can exceed the comment's150 cap. Rays include transparent/decal retained geometry, unlike the runtime opaque-occluder contract. Final images and production picking remain root's gates.

Static builder review: the unconditional flag hold atlines69–73 precedes parent building/saving/exporting. `set_custom_normals` asserts each polygon's vertex-index set against its source face and maps by polygon/vertex identity, correcting winding after recalc. This catches many ordering changes but is not exported triangle/corner provenance. Builder triangulation can differ from source fans; later glTF seam splits and evaluated topology still require the adopted hash-bound sidecar and actual POSITION/NORMAL/accessor checks. A final degenerate/unmapped/ambiguous triangle must reject. The inherited `join` rebuilds only retained monitor/power meshes and drops their custom normals; it does not currently touch M4 rows, but exact retained-byte guards remain necessary. No arbitrary Blender-export compatibility is claimed.

Installed Three0.187.0 `BufferGeometry.js:997` resets/recomputes normals; that would replace the authored normal field, so it is not a repair or acceptance substitute. The loaded geometry skill's r186 examples were treated as guidance; version-sensitive behavior was checked against installed r187. No API, runtime, dependency, schema or material change is proposed here.

## Reproduction and handoff

Commands from repository root, all `python -B design/studio-v2/scene-coordination/m4-v03-cpu-verification.py`:

- `--reproduce`: exit0, one full measurement/search, exact receipt parity excluding elapsed.
- `--checks`: initial exit1 due to the review probe assuming six cable-ring vertices; source actually uses five. Corrected only this new probe to measure circumdiameter; focused rerun exit0. The failure is preserved in JSON and is not an artist failure.
- `--adequacy`: exit0; bounded selected rays, topology, dimensions and degenerate control; no search.
- `--edge-reasons`: exit0; bounded follow-up to the observed cable reason/length discrepancy.
- `--finalize`: exit0; hashes and categorized findings only, including author's support-intent clarification; no further geometry run.

Exact reviewed SHA256s:

| Input | SHA256 |
| --- | --- |
| Geometry helper v03 | `3b220b1d4614a8111247270b21771c5f2280493c16e3ab986603a24efcffaf37` |
| Held builder v03 | `53fa310f1144c46916b0ce63f05188818861e63fe9c32abbf4fb3f1596872b84` |
| Author measurement | `9a3a098195e99b889ecee8b2213c9acc6a9dc50af68e1ae35e507e09b1b0bff5` |
| Author receipt | `d7196145a8665abefdf41b3235f3be8ec91aa7474b3c71fed2186d7537e20253` |
| Author report | `b21b6f2b7b6b97786b4da8a34d59b114e2daf6fe5ffb5ae7d49c4117ecc3abc3` |

Probe SHA256 `11b1356d5afcfe9260b2e28e22b498279d1c33450aa5f4a82e9319fa324f5dd6`; receipt SHA256 `c0fcce453614ff08e0facb5517fb4ed6fc430217ac455a2bbcf1e6dd325b6927`. JSON contains all22 exact input hashes, original reproduction, positive/negative receipts and failure history. Root reports the five author files preserved at checkpoint `906b7d61332379d7374b559be267a95742dc32bb`; this worker did not run Git or independently verify that remote claim.

The bounded verification is complete. Root/S must release and assign the single repair pass, with actual Claude owning geometry/semantic declarations and actual Codex verification logic only after explicit ownership assignment. Preserve these regressions and earlier failed artifacts, then independently review the repair. Exported normals/correspondence, retained data/profile/texture guards, actual images and production/lifecycle budgets remain downstream; no Blender/export release or candidate acceptance is implied.
