# M4 v04 independent producer and measurement review

**OKAY — APPROVE for root to freeze the exact expected digests below. No material technical blocker found in this bounded handoff.** This approves source/payload reproducibility and the reviewed measurement interpretation. It does not adopt the digests, call `audit_m4_v3`, accept a candidate, release Blender/export, or close image gates.

Reviewed 16 November 2026 by the independent retained Codex critic, separate from the producer writer and actual-Claude author. Read the current producer report, lines 1–527; historical sections were not treated as current evidence. Root reports technical commit `8a6addb9c9e16074f1106ca51b26d41830add71a` and author commit `e684190b6c19af4b664f2d32e1f3d097ab00d25f`. No Git command was used here; the local bytes were independently checked against root's exact supplied pins.

## Identity and reproducibility

All 13 supplied report/source/artifact file pins matched and remained unchanged after the probes. The original author report remains `6b2a62a31ab086a5a72c880ecad04332576a5ae14c31ab882f6421aa6f51c6be`; no prose drift was observed. The complete file-pin table is preserved in [independent evidence](m4-v04-independent-technical-probes.json). Key implementation identities are:

| Input | SHA256 of file bytes |
| --- | --- |
| Author helper | `8d814874ee0ac1317827297d2a729b34f4789fffd891212ae03e2c440a73b792` |
| Author declarations | `8ce8db34b40a3ce053d037c5152fec8c8ed19d586b0968439abf64e3308f32bb` |
| Held builder | `0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826` |
| Producer | `3c9fe150d859087050fed73d3fed54d3a97a5998774c455203e6a00462dc08d1` |
| Measurement | `d56efb031e843320625b610181885ff9110f1789b8bced9bef475f75f50ccf1b` |
| CPU receipt | `be6c205db283f86ce8a8048c0dde58ae11e0cdb38ff326e1a4c62d26a9265bea` |

The named `produce_selected` invocation was independently run in memory once. Its complete rows and declaration canonically equal the saved artifacts. Separate direct comparison against `build_all(selectedPose)` confirms all 18 rows, 332 primitive groups, 7,714 vertices, 6,200 polygons and 26,368 corners, including raw classes, roles, round-run identities, group identities/ranges and UV rules. No sampled or rounded payload substitution was used.

`produce_fullkit_m4_v04.py:60–85,117–201,204–276` checks captured helper/author bytes before execution, checks exact complete group coverage and class correspondence, obtains the complete source corner-normal field, and binds the resulting payload to source digests and the named pose invocation. `build_fullkit_m4_geometry_v04.py:1104–1121` restores controller globals after building. Its normal implementation at 1353–1445 uses the authored winding and smoothing/class rules; the producer copies that result rather than inventing semantic classes. The held builder still refuses execution at line 64.

The following are **canonical JSON payload** hashes, independently compared with literal expected values supplied before execution; they are not the indented artifact byte hashes:

| Proposed expected identity | SHA256 |
| --- | --- |
| Complete rows | `cfac1013f686bb7790bc2f5e9ed5acc518009ab7e2bc27d09ad09629c429533e` |
| Complete declaration | `a737d402307d0aa056e375934beab94c7696c1f5a14f0fe7d028893d5c30db7d` |
| Producer invocation | `5128d2a61205f9e4262814ca5bdd96ff661a5e613259c7af852ad9fe9c38f5c6` |

Rows file bytes are `1fa5fdd3f267896a76743aca986af9cadd1dd84610395e6049fc799009489992`; declaration file bytes are `5d04a051398e09c9b2aeb309e2893efe09ed286a18e27113785ff487a7074d42`. [Expected-pin proposal](m4-v04-independent-expected-pins-proposal.json) explicitly remains non-authoritative. Root must adopt these values separately before the candidate audit. A hash establishes exact identity, not the truth or completeness of artistic intent; the supplied actual-Claude source-intent approval remains a separate dependency.

## Measurement findings

- **25 supports:** `measure_fullkit_m4_v04.py:1302–1335` uses complete primitive vertices and the actual rounded rug polygon. An independent calculation directly from the frozen rows confirmed every footprint inside the convex field, minimum finite-boundary clearance **0.03393781130762874 m** and maximum absolute signed gap error **1.6805133673525319e-18 m**. This is declared-support coverage, not a claim that every primitive is intended to touch the floor.
- **13 attachments and four inlays:** reviewed the complete primitive/face adapters at 456–560, 630–903 and the preflight at 1569–1635. Root/tip cap and lengthwise-edge coverage, whole board/base/heel/housing locators, exact hi-hat pairs, actual convex planes and signed distances are enforced along the selected-measurement path. All eight explicit attachment criteria rejected independently shortened locators. The five plain rests use signed perpendicular distance to the unique most-upward receiver face and the actual minimum-contact footprint. This adapter is not a universal attachment solver; the frozen receivers fit its stated selection rule. Hi-hat C's whole-housing separating-plane test is stronger than a sampled overlap check; A's reported vertex-to-heel distance is correctly limited to vertices. Four inlays are exact strip/panel pairs, with depth/proud and finite footprint checks—not a same-row exemption.
- **Normals:** independent row reduction confirmed **1,112 planar triangles**, **26,368 unit corners**, no degenerate source fan triangles, and maximum oriented planar deviation **0.0000012074182697257333°**. The implementation at 905–956 additionally checks all declared round runs against raw source run coverage and shared corner continuity. Small planar fixtures at 1.9°, 2.1° and 178.1° prove the oriented two-degree predicate is reached without an area exemption. Final exported NORMAL correspondence remains a later requirement.
- **Edges:** 959–1020 measures topology, angles, lengths and winding; 563–585 applies the author's exact optional sorted role pairs and discloses every match while selecting the first. The receipt's **7,375 hard edges / 44 matched sets / zero undeclared hard edges** reconciles. Independent mismatched-role and overlapping-rule controls preserve scope and priority disclosure. Counts and classifications are source diagnostics, not independent approval of the author's edge treatment. Open primitives and same-class bevel seam lengths remain labelled honestly.
- **Budgets:** independent reduction from actual frozen polygons/flags confirms **18 main + 9 shadow = 27 refresh contributions**, **13,968 placed / 24,836 refresh-weighted M4 triangles**, and every actual row below its declared ceiling. The retained-parent addition in 1151–1182 yields the reported **110 leaves / 114 main / 31 shadow / 145 refresh**, **47,460 placed / 29,366 shadow triangles** under the stated one-primitive/one-shadow assumptions. These are source estimates, not GPU counters or a compressed-transfer pass; the uncompressed geometry range does not prove the unchanged 1.5 MB combined transfer gate.

## Evidence quality and remaining limits

Fresh free-memory checks preceded CPU work: 1,868,720 KiB before the writer suite and 1,213,472 KiB before the bounded producer/probes. CPU work was sequential. The writer's 42-case suite ran **once without `--write`: 42/42 pass, 0.438 s**. Its controls reach geometric predicates—including inward normals, true convex receivers, incorrect depth/escape, incomplete source locators, role-pair mismatch and inclined rests—rather than merely failing source hashes. The independent probe file adds 12 grouped checks, including eight candidate-specific locator omissions, a new inclined rest with penetration and finite-footprint escape, and the oriented-normal boundary controls. Separate direct support/normal reductions above used the frozen JSON without invoking the producer's measurement functions. No 67-case old-verifier suite, 24-pose search, full selected measurement, ray/contact sweep or candidate audit was repeated.

The **299 unclassified opaque primitive contact pairs** reconcile with the receipt and are all within their respective rows. `full_surface_contacts` at 1076–1122 distinguishes these from transparent retained pairs and exact declared attachment/inlay pairs. Surface touching, crossing and coplanar overlap are not penetration-volume measurements; enclosed solids, within-primitive self-intersection and minimum pairwise distance are not proven. The disclosed degenerate retained triangles are excluded. These limits prevent both blanket defect claims and blanket exemptions; actual Claude owns intent interpretation.

The phone projection was independently recomputed using camera-basis/pinhole equations: **10/29 white-key centres inside 320×844 at yaw 44°, pitch −8°, vertical FOV 74°**. It agrees with `project_points`/`coarse_views` at 1353–1361 and 1413–1424. Adjacent pitch across all 28 centre pairs is not evidence that all keys are visible. H1 explicitly requires 29 white and 20 black keys countable in music-1440 and music-320/390 (`scene-m4-v03-focused-art-closure.md:301`). Thus this exact proposed phone framing conditionally conflicts with H1; it is not an observed image failure, and 390 px was not projected. Root/Claude must retain that unresolved image requirement when arranging the preview; this review changes no camera, geometry or art gate. Uniform surface-area visibility and angular envelopes likewise remain source diagnostics, not projected image area or contiguous visible-span acceptance.

**Stop condition met:** source-to-payload derivation and exact proposed expected identities are reviewable and ready for root adoption. Root retains the candidate-audit, exact export/provenance release and image-gate decisions. No source, implementation, author, prior evidence or contract file was changed.

Review evidence identities: probes `.py` `9738112e855ca9f4f89d7cc624bb80a9d4d7ca589afccb6117d292b353ba4ed3`; probes `.json` `eb14411f26d13b0f85ca68deb9eb0d5befc1d90331323e7b12862658f5911cfa`; expected-pin proposal `.json` `ab4d82e3e6e16a806c134a0ab555456942d9fc38fbdeb1f1241c4c60a24bb19d`.
