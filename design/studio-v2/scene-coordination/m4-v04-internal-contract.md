# M4 v04 preparation: internal ownership and producer boundary

S publishes this technical boundary under root's `m4-v04-combined-repair-disposition.md` (16 November 2026). It changes no public studio or glTF contract. The root disposition and final Claude review `4157A176701D2697E44CD39CC3DE0B0B3A4D2101D36A46BF8212FF01361401AF` own the artistic decisions. Report required interface changes to S before dependent work; do not silently edit another owner's file.

## Exclusive files

Actual Claude owns only these new v04 preparation files:

- `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py`
- `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` (held builder)
- `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json`
- `scene-m4-v04-preparation-report.md`

Actual Codex owns only these new measurement/producer files:

- `asset-pipeline/full-kit/source/measure_fullkit_m4_v04.py`
- `asset-pipeline/full-kit/source/produce_fullkit_m4_v04.py`
- `scene-coordination/m4-v04-producer-tests.py`
- `scene-coordination/m4-v04-producer-tests.json`
- `asset-pipeline/full-kit/manifests/m4-v04-pose-comparison.json`
- `asset-pipeline/full-kit/manifests/m4-v04-rows.json`
- `asset-pipeline/full-kit/manifests/m4-v04-verifier-declaration.json`
- `asset-pipeline/full-kit/manifests/m4-v04-cpu-measurements.json`
- `scene-m4-v04-producer-report.md`

Paths above are relative to `design/studio-v2/`. S owns this boundary, task handoffs and coordination reports. Root's critic owns independent verifier review. No v01-v03 source, asset, receipt, report, snapshot, verifier or contract is writable in either preparation lane. No helper workers.

## Author-to-producer interface

Source coordinates remain Blender metres, +Z up; the runtime mapping remains scale 2 and +Y 0.11. Planning eye is Blender `[-0.35, -1.70, 1.345]`, corresponding to fixed runtime eye `[-0.7, 2.8, 3.4]`. No camera, project-target, size or azimuth waiver is introduced.

The v04 geometry helper preserves the v03 `Part` representation: `row`, `asset`, `mat`, `ceiling`, `casts`, `v`, `f` as `(indices, uvRule)` pairs, `groups` as `(label, v0, v1, f0, f1)` primitive records, `cls`, `tris` and `triangles()`. It exposes:

- `build_all(pose=None) -> (parts, meta)`, where parts is keyed by the same 18 row IDs. A supplied pose contains exactly `cx`, `cy`, `yaw`; missing pose uses the author's currently selected pose. A call must restore any temporary pose state before returning and repeated calls must reproduce geometry irrespective of previous calls.
- `corner_normals(part) -> {(face_index, vertex_index): (nx, ny, nz)}`, authored by Claude with the released continuous-round-run correction.
- `ledger(parts) -> (row_records, totals)`, retaining the row/caster/triangle ceilings.

The held builder consumes those same authored normals/smooth-run meanings, refuses Blender/export execution under the existing hold, and does not introduce an independent shading rule.

Claude's JSON declares semantic intent and explicit stable identities, with row/group ranges and full face-class coverage compatible with current contract `m4-v03-verifier-declaration-contract-v3.json` SHA256 `5632CA4A42214EDC89776C05F6B8F80835C22DDC8FCBEB0429EA3C39F2670E97`. Include explicit support primitives and receiving surfaces, attachment pairs/geometry intent, continuous round runs, exact four indicator-panel seating pairs, and each edge set's status/reason. No support identity or class is inferred by Codex from positions or the normals being tested. The raw `Part.groups` tuples are locators; Claude declares their stable semantic IDs and any reason for out-of-scope faces. Missing semantic coverage remains a failure, not permission to invent it.

The author also supplies an explicit `poseOptions` list and `selectedPose` in that JSON. The artist chooses the four x samples, three yaw samples and two y samples within root's exact ranges, with no more than 24 combinations and the old pose included. This document does not select samples or a final artistic pose. Codex reads the explicit list, never expands it or chooses the winner.

Codex's producer converts authored arrays to the finite JSON-native complete rows payload and copies the authored scope faithfully into a separate verifier-ready declaration. It may add technical source pins and the rows digest, but may not alter semantic meanings or claim independently frozen approval. Root/S reviews and freezes expected digests separately before any approved candidate verification. Pin the actual producer source and entrypoint, input helper/declaration bytes and invocation; demonstrate exact payload reproduction after author source settles. Current verifier implementation is under independent review, so no source-integrated pass may be claimed yet.

## Occlusion and evidence

Measurement must preserve retained runtime eligibility as implemented in `components/studio/scene/bind-full-kit.ts`: project target surfaces/borders are excluded from blocker candidates, remaining meshes require `userData.transparent === false`, and the picker checks live ancestor visibility. Read the loader/certificate/profile metadata as needed to map imported leaves faithfully. Transparent/contact decals are not solid blockers. Keep semantic metadata distinct from actual runtime eligibility; do not assume an `occluder` label alone reproduces the binder.

Report labeled target hits, opaque blockers, transparent exclusions and no-hit cases separately. Report uniform throne-top area samples alongside vertex fractions. Neither no-hit nor vertex-weighted/envelope statistics establish visible pixels, contiguous visible span or image approval. Scope approved inlay intersections to the four declared primitives and panel; do not exempt all same-asset/within-row pairs. Attachment checks are separate from floor contact and cannot be satisfied by the support minimum-Z predicate.

## CPU sequence

Claude prepares geometry and declarations, publishes their interface-ready hashes and the explicit pose table, and yields before heavy measurement. Codex may prepare code and synthetic tests meanwhile but must not consume partially written author files.

Codex owns the single heavy CPU lane. After an exact author handoff, perform one coarse comparison of at most 24 explicit poses. Return diagnostics to Claude via S; Claude selects and records the pose. Only after that selection and a new source hash handoff may Codex run the full combined selected-pose geometry/support/cable/target measurement once. No simultaneous heavy author search, repeated broad search or duplicate numerical reproduction. Targeted quick count/shape checks are allowed. Any necessary rerun after a demonstrated defect requires a specific bounded rationale to S.

No candidate freeze, integration pass, Blender, export, browser, image, build/server, dependency or paid work is released. All fourteen later image gates remain. Opus geometry authorship and Codex measurement ownership remain separate through fixes and later independent review.
