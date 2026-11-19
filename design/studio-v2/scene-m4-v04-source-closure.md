# M4 v04 final applied-delta source closure (independent critic)

**Reviewer:** actual Claude Fable 5.2 (`claude-fable-5-2`, `--effort high`), the retained independent critic session, PID 11168, under Orca. Task `task_fbd556b80f9b`, dispatch `ctx_d57e5b350d04`, ACK `msg_b1e050f629b6`. Coordinator S `term_34bea5af…`. 16 November 2026.

## Verdict

**Source intent: the applied delta fits the released scope, and I found no true source blocker.** Every root decision 1–8, the hi-hat remedy A/B/C, the explicit index lists and the P14 selection are applied in the four pinned files as decided.

This verdict covers source intent only. It is not a numerical result, an export result, an image result or candidate approval:

- **Numerical evidence is pending.** Codex's one full P14 measurement has not run on these pins. My figures below are small spot checks, not measurement of record.
- **Export evidence is pending.** The held builder has never run and still refuses to run.
- **Image evidence is pending.** All fourteen image gates stay open: N1a, N1b, H1, K1, T1, HH1, SP1, AZ1, RUG1, RK1, E1a, E1b, F1, M6.

Three non-blocking notes are in section 5. None needs a new permission round.

Evidence tags: **[S]** read in the pinned source, **[M]** my own small check, **[A]** author claim I did not verify, **[R]** my recommendation.

## 1. Pins

Reviewed inputs (paths relative to `design/studio-v2/`). I hashed each file before reading it, and all four equal S's pins. The same bytes are in commit `e684190b6c19af4b664f2d32e1f3d097ab00d25f` ("Preserve coherent M4 hi-hat source repair handoff for full P14 verification"), which was HEAD when I finished, with none of the four modified in the working tree.

| File | SHA-256 |
|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` (helper) | `8d814874ee0ac1317827297d2a729b34f4789fffd891212ae03e2c440a73b792` |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` (author declaration) | `8ce8db34b40a3ce053d037c5152fec8c8ed19d586b0968439abf64e3308f32bb` |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` (held builder) | `0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826` |
| `scene-m4-v04-preparation-report.md` (author report) | `6b2a62a31ab086a5a72c880ecad04332576a5ae14c31ab882f6421aa6f51c6be` |

Authorities the delta was checked against:

| Authority | SHA-256 |
|---|---|
| `scene-coordination/m4-v04-bounded-art-disposition.md` (root decisions 1–8) | `7705f590de09dd20c213bb2598f2fd977ee811f402da7fc1f5f3e436fedd9c6f` |
| `scene-m4-v04-bounded-art-review.md` (my review, adopted by root) | `1af11ba58ed0892851baa352deddcd9663e6fd330805c58bd84e2a65d39e1381` |
| `scene-coordination/m4-v04-hihat-repair-release.md` (root hi-hat release) | `038dc8afe9ab795539c57c3dba120f7f33232909a48f5d846d5f22db1498dc68` |
| `scene-m4-v04-hihat-repair-review.md` (my remedy A/B/C) | `5bc3d79f802894763f66a877516a9c1f6827821a998d82b4fbc9d5d8306e39ad` |
| Commit `98eed1e` (selected P14 checkpoint; helper `4bb4094672fd762e622f9187690941b88f8677ec463eb09b38f691d0e7effbaf`) | comparison base |

Evidence for this closure: `scene-coordination/m4-v04-source-closure.json` (pins, verdicts, the three check scripts and their full output).

## 2. What I did

1. Read the applied delta from the P14 checkpoint to the final pins (`git diff 98eed1e e684190`, read-only): every changed helper line, the builder's change, and the final author report in full.
2. Ran three small read-only scripts on hash-verified copies in my session scratchpad, with plain CPython and `-B`. Together they build the kit four times at P14 (twice from the final helper, twice from the checkpoint helper) and serialise the declaration once. The largest took 17 seconds.

I did no pose search, no full measurement, no design exploration, and no Blender, browser, render or export action. Git use was read-only (`diff`, `show`, `rev-parse`, `status`). I wrote only this report and its JSON.

## 3. Scope fit

**Geometry changed in exactly two rows, both released [M].** Against the P14 checkpoint, 16 of the 18 rows are identical in every vertex, face, material, class, role, run and group identity. The two that changed:

| Row | Changed groups | Triangles | Ceiling | Bounds |
|---|---|---|---|---|
| `ctl_body__shell` | `ctl.cheeks#0`, `ctl.cheeks#1` only | 1,260 → 1,292 | 2,500 | identical |
| `drum_hihat_pedal__pedal` | `hihat.footboard`, `hihat.hinge` only | 300 → 300 | 600 | top z 0.08842 → 0.08963; otherwise identical |

Placed triangles total 13,968, and no row exceeds its ceiling [M]. The kick row is unchanged, so decisions 1, 2 and 8 are declaration changes only, as intended.

**Everything else that changed is declaration, classification or wording [S]:** the edge sets for decisions 4–7, the attachment criteria, the optional `rolePairs` match field, and the report. The helper's changed lines fall in the cheek profile, the hi-hat pedal, the edge sets, the attachment criteria and the declaration writer, and nowhere else.

**Held and preserved [S][M]:**
- **Pose.** `SELECTED_POSE` is P14 (1.375, −0.825, −0.95), and the 24 pose options are the same as at the checkpoint.
- **Builder.** Its only change since the checkpoint is the `HELPER_SHA` line, which now pins the final helper. The unconditional `raise SystemExit('M4 v04 builder is HELD…')` still comes before any flag handling.
- **Interface.** The schema string is still `m4-source-declaration/3`, and `build_all` is unchanged. The additions are extra fields: `criterion` on attachments, `rolePairs` and `source` on edge sets, and `roles` from `edge_records()`.
- **Declaration.** The helper reproduces the pinned declaration byte for byte (302,196 bytes). Its `sources` entry carries the final helper hash.

## 4. Decision by decision

| Item | Applied as decided? | Basis |
|---|---|---|
| **1. Spur roots** | Yes | Criterion `rod_root_embedded_through_flat_face` on exactly `kick.spur_arm.L` and `.R` into `kick.base`. It requires each root-ring vertex at least 1.0 mm inside the own-side flat face, and each lengthwise edge to cross only through that face. It says it is not a same-row overlap allowance [S]. Author's source figures: burial 1.34–10.66 mm; crossings at least 3.69 mm inside the face outline [A]. |
| **2. Inset, depth and heights** | Yes | `depthM` is gone from every attachment [M]. `rootCentreInsetM` 0.006 is stated as the disc centre's inset and "not a penetration depth", separate from `minRingBurialM` and from the footboard's 4 mm seat. Root 18 → 22 mm and tip 12 → 14 mm are stated [S]. |
| **3. Cheek-nose bevel and round run** | Yes | Each cheek 68 → 84 triangles; the shell gains 32, as estimated. The run is declared explicitly as the four top faces between the two bevels, and the helper asserts the count [S][M]. No edge inside a run is hard; the largest turn inside a run is 22.7° [M]. See note 5.2. |
| **4. Underside mitres** | Yes | `ctl.cheeks.front_corner` is removed. The only hard lengthwise 40–80° cheek edges are eight mitres (four at 75.5°, four at 41.4°, 0.0223 m in all), and they sit in `ctl.cheeks.contact` with an underside reason. The helper asserts this [S][M]. |
| **5. Cymbal edge band** | Yes | `cymbal.edge` is `named` with source "decision 5". It holds 72 edges at 70.0° and 72 at 108.5° on the three cymbals, pinned to strips `b5/b6` and `b6/b7`. The bell-to-bow reason is removed [S][M]. |
| **6. Pad lower rim split** | Yes | `pad.rim_lower_outer` (`named`, decision 6): 96 edges at 71.4°, strips `b4/b5`. `pad.shell_bottom.contact` (`contact`): 96 edges at 52.8°, strips `b1/b2`, with a hidden-edge reason. The pad row stays at 2,312 of 2,600. The reason text says the 384-triangle fallback is not authorised [S][M]. |
| **7. Rug binding shoulder** | Yes | `rug.binding_shoulder` is `named` with source "decision 7": 16 edges at 62.3° and 61.5°, 7.74 m. The rug row is unchanged [S][M]. |
| **8. Kick footboard heel seat** | Yes | Criterion `board_end_seated_through_top_face`, exactly `kick.footboard` into `kick.heel`, with root's four conditions. Limits: depth at most 4.0 mm and at most half the 8 mm board; corners at least 3.8 mm proud [S]. Author's source figures: 4.000 mm deep, 3.82 mm proud [A]. |
| **Hi-hat geometry** | Yes | Hinge axis at pedal-frame z 0.016. The pitch is derived from the pivot and the housing lip, giving 13.9813°. Topology, indices, classes and runs are unchanged; base, housing and heel rubber are untouched [S][M]. |
| **Hi-hat A (barrel seated in base)** | Yes | Recomputed from the built vertices: seated vertices exactly [133, 134, 135, 145, 146, 147]; depth 3.000 mm at 134 and 146, 1.794 mm at the others; unseated vertices at least 1.5 mm above; 16.9 mm inside the top-cap outline; 7.0 mm above the underside; axis ends 6.000 mm up; 3.0 mm from the heel rubber [M]. Thresholds are as I specified, plus `deepestVertices` [S]. |
| **Hi-hat B (board on barrel)** | Yes | Axis vertices 107 and 108 on the axis; 107, 108, 123 and 124 inside the barrel at 8.000 mm against the 8.693 mm inscribed radius; board 6.0 mm above the base top [M]. `barrelMountingNote` and both hi-hat ranges are gone [M]. |
| **Hi-hat C (toe rests on lip)** | Yes | Lip vertices 86 and 87 at 0.300 mm; next housing vertex 0.374 mm; no housing vertex inside the board; no board vertex below its own underside plane [M]. Relation `rests_on`, `gapM` 0.0003 [S]. |
| **Explicit index lists** | Yes | No key containing "range" remains inside any criterion; each criterion states its index convention [M][S]. |
| **Edge coverage** | Yes | 0 undeclared hard edges, 44 sets, none empty, no `proposed` set [M]. |
| **Throne wording** | Yes | The report says 292/384 is "a sampled-area improvement. It is not a T1 result" [S]. |
| **All gates open** | Yes | Report section 9 lists all fourteen as open; the declaration status says "NOT frozen, NOT verified, NOT candidate acceptance" [S]. |

## 5. Blockers and notes

**True source blockers: none.**

Non-blocking notes:

1. **Stale field names in the author report (wording only) [S].** Report section 3b still names three kick locators as `armSideFaceRange`, `boardVertexRange` 376–400 and `boardSideFaceRange`. The pinned declaration carries explicit lists named `armSideFaces`, `boardVertices` and `boardSideFaces`. The helper and declaration are right; only the prose lags. **[R]** Correct it in the author's already-planned final handoff. That changes the report hash only.

2. **The cheek run now takes in the long rear top segment [M].** Decision 3 asked for the run to be declared, and it is. The declared run has four faces per cheek where the checkpoint had three, because it adds the 137 mm rear segment, which was `planar` and is now `round`. The shading effect is small: that face's two front corners now carry normals 3.3° off flat (they were exact), and the next face's rear corners fall from 6.7° to 3.3°. Bevels still do not pull the top's normals, because `round` outranks `bevel`. This fits "one continuous curved top" and I do not object. Gate N1a decides whether the long top still reads clean.

3. **Two declarations depend on the measurer reading the new fields [S].** These are interface dependencies, not source defects:
   - The two pad sets share label, kind and band and differ only by `rolePairs`. A consumer that ignored `rolePairs` would file the hidden black shell-bottom corner under the named rim set.
   - `hihat.footboard_on_housing` is `rests_on` across an inclined plane. It holds through its criterion, not as a vertical gap.

   Codex's uncommitted working-tree `measure_fullkit_m4_v04.py` (`d453c5fdabba22fbbeb5ea0eaf6d2594357313c8d0cddd10a63bca00166cebef` when I read it) has code for both: a `rolePairs` test and a `board_rests_on_lip_separating_plane` branch. I only searched that file for these names. I did not review or run it, and it is not a pinned input.

**Thin margins for the export gate, already listed by the author in report section 7.3:** lip gap 0.30 mm with the next housing vertex at 0.374 mm; spur ring burial 1.34 mm against 1.0; footboard corners 3.82 mm proud against 3.8; barrel seat 3.0 mm. Exported, quantised positions must confirm these. That is export evidence, not a source question.

## 6. What remains

1. Codex's single full P14 measurement on these pins (numerical gate).
2. Export under an explicit root release (export gate); the builder stays held until then.
3. All fourteen image gates on actual captures. For this delta the relevant ones are N1a (cheek nose and top), K1 (spur roots, kick heel seat, hi-hat barrel seat and toe rest), HH1 (hi-hat heel 6 mm lower, barrel 7 mm above the heel rubber), E1b (cymbal band, pad rim lower corner, rug shoulder) and RUG1.
4. The report wording fix in note 5.1, at the author's final handoff.
