# M4 v04 inspection export: author preparation

**Author:** actual Claude Opus 5.5 (`claude-opus-5-5`, high effort; same retained session and settings as the v04 source preparation). Task `task_628d8018364c`, dispatch `ctx_ac363aeda352`. 18 November 2026. ACK `msg_d6e76c358f8f`; early interface `msg_976bf26d2872`; guard consumed `msg_34af09805aa6`. Final: both Codex pins consumed.

**Status: preparation only, held.** Nothing was built, run or exported, including no dry run. Root still owns the single inspection build release. This report is not an export release, a candidate acceptance or an image-gate result, and all fourteen image gates stay open.

**Authorities read** (all paths below are relative to `design/studio-v2/`):
- S boundary `scene-coordination/m4-v04-inspection-export-contract.md` (`baa9dad0…`);
- S provenance proposal `scene-coordination/m4-v04-inspection-provenance-proposal.json` (`8004a150…`);
- root inspection disposition `scene-coordination/m4-v04-inspection-disposition.md` (`434d3404…`);
- root expected pins `scene-coordination/m4-v04-root-expected-pins.json` (`48d79254…`);
- the M3 v03 and M4 v02 restoration receipts.

## 1. Files

| File | SHA256 | Owner / state |
|---|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04_inspection.py` | `2f887453a928020eb9c0ce701afaa97d75ca47ae866b2c986c49576522b6c7f9` | NEW, mine; final, held, never executed |
| `scene-m4-v04-inspection-author-preparation.md` | this file; hash in the final handoff | NEW, mine |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` | `0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826` | frozen; unchanged |
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` | `8d814874ee0ac1317827297d2a729b34f4789fffd891212ae03e2c440a73b792` | frozen; unchanged |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` | `8ce8db34b40a3ce053d037c5152fec8c8ed19d586b0968439abf64e3308f32bb` | frozen; unchanged |

## 2. Derivation: what is carried over and what changed

The successor is generated from the frozen builder by counted exact-text replacements; the generator checks the frozen file's hash first. By section hash, these blocks are **byte-identical** to `0d01536c`:
- the editable parent chain (frozen M3 script, run dry);
- every M4 leaf, UV, smoothing and custom-normal line, the in-memory N1 readback, and the ray-cast, camera-projection, intersection and resting-gap measurements;
- the save, bake and join steps and the glTF export settings.

The only line that differs inside the geometry span is `meas['sourceScript']`. Geometry, materials, normal intent, cameras and P14 are therefore unchanged.

Changes, all marked `inspection` in the source:

1. **Outputs:** the boundary's reserved fresh names (section 3). One process writes both the `.blend` and the raw export (flags exactly `blend glb`).
2. **Pins checked before any work:**
   - frozen builder `0d01536c`, declaration `8ce8db34`, rows artifact `manifests/m4-v04-rows.json` `1fa5fdd3`, producer `3c9fe150`, proposal `8004a150`;
   - mapping `8f0474aa`, parent `dc9c6a78`, M3 script `dccfa288` and helper `8d814874`, as in the frozen builder;
   - Codex's guard and correspondence checker by their final SHA256 (section 6).

   The canonical rows digest `cfac1013` and the parent manifest `060bab9a` are recorded in the provenance record. The proposal's own parent, mapping and manifest pins must equal the builder's.
3. **Exporter identity:** before building, the glTF add-on version must equal the parent's generator, `Khronos glTF Blender I/O v5.2.41`, which is also the proposal's `assetMetadata`. The raw readback asserts `asset` equals the proposal's `assetMetadata`.
4. **Exact provenance:** the scene extras must equal the proposal's complete `before` object before the unchanged three-key delta, and its complete `after` object afterwards. The raw readback asserts `scenes[0].extras` equals `after`. The after object is `fk_tag` `m4-v04`, `fk_stage` `M4` and `fk_m4_tag` `v04`, with the inherited `fk_variant`, `fk_profile`, `fk_m2_tag` and `fk_m3_tag`. There is no wildcard, version range or epsilon.
5. **Inspection record** in the author measurements: pins, reserved outputs, coordinate statement, and per-row source/mesh identity for the correspondence check (section 5).
6. **Refusal:** the unconditional `raise SystemExit` stays in place (line 95). After it, the script refuses to run while either Codex pin is still missing, without `FK_M4_PARENT_RELEASE` equal to the parent SHA-256, or if any reserved output already exists.

## 3. Outputs (reserved, fresh-exclusive; none created)

| Path (`asset-pipeline/full-kit/`) | Written by |
|---|---|
| `source/fk-40-music-proposal-v04-inspection.blend` | this builder |
| `exports/studio-full-kit-m4-proposal-v04-inspection.raw-export.glb` | this builder |
| `manifests/m4-v04-inspection-author-measurements.json` | this builder (`open(..., 'x')`) |
| `manifests/m4-v04-inspection-transition-receipt.json` | Codex guard CLI |
| `manifests/m4-v04-inspection-correspondence-receipt.json` | Codex correspondence CLI |
| `exports/studio-full-kit-m4-proposal-v04-inspection.glb` | nobody yet: final packaging, and any exact restoration, need explicit root scope |

The builder refuses to start if **any** of the six exists, so a partial earlier attempt cannot be silently reused.

## 4. Retained-parent preservation and the minimum blocker

**Preservation plan.** The builder regenerates the editable M3 v02 chain dry, removes exactly the 23 mapped proxies, adds the 18 M4 rows and exports raw. It never writes retained bytes by hand. The Codex transition guard then audits the raw export against the accepted parent `dc9c6a78`, mapping `8f0474aa` and proposal `8004a150`: scene, hierarchy, materials, images, accessors, payloads and row limits, with no epsilon and no UV exception.

**Minimum blocker (expected risk, reported, not patched).** The frozen editable chain has never reproduced the accepted parent's retained bytes exactly. The receipts are authoritative; this summary does not generalise them:
- **M3 v03:** `manifests/m3-v03-restoration-receipt.json` restored 4 words in `desk_top__top_mesh.002` `TEXCOORD_0`, parent accessor 64, vertices 197, 199, 258 and 274.
- **M4 v02:** `manifests/m4-v02-restoration-receipt.json` restored 3 words in the same accessor, vertices 199, 258 and 274. That raw export came from the same chain plus the M4 v01 builder. The differences are not all one float step: vertex 199 is raw `5d8f72bf` against parent `5b8f72bf`, two float steps (root correction, `msg_8151d57ae4b5`).

The same chain may export retained `TEXCOORD_0` words that differ from the parent again, and an exact guard would then reject the raw inspection export. Neither this builder nor its outputs restore anything.

**Root disposition (`msg_8151d57ae4b5`): RAW EVIDENCE FIRST.** The predicted drift is a diagnostic risk, not a source-repair prerequisite. Order after the single release:
1. keep the raw export unchanged;
2. run the exact Codex transition guard on it;
3. only if the guard fails does root decide, from the measured words, on an exact receipted restoration and final `.glb` packaging.

There is no automatic patch and no epsilon. I make no restoration choice.

## 5. Source POSITION/NORMAL correspondence: author handoff to Codex

- **Rows and identity:** the 18 rows named in `MG.ROWS`, exported as mesh nodes of the same names under `studio_full_kit`. Codex matches by node name, never by index.
- **Coordinates:** helper vertices are Blender world metres, +Z up. Every M4 leaf is parented to the `studio_full_kit` empty with identity transforms, and the root has no transform. With `export_yup=True` and `export_apply=True`, the glTF `POSITION` and `NORMAL` are (x, z, −y) of the Blender values. The runtime's ×2 and +0.11 Y are applied at runtime, not in the file.
- **Face order and winding:** polygons are created in helper face order, and `bmesh.to_mesh` keeps that order; a per-polygon vertex-set assert covers every row. `bmesh.ops.recalc_face_normals` may reverse a polygon's winding (the inherited lathe windings, for example the pad shells). Codex cannot replay that without Blender, so the measurements record, per row, the exact `flippedPolygonIndices`: helper faces whose authored Newell normal opposes Blender's polygon normal. A polygon's loops list the helper face's vertices, cyclically reversed when it is flipped, and the vertex index equals the helper vertex index. This was added after Codex asked for missing correspondence data. It is measurement output only.
- **Normals:** where a row has N1 classes, each corner's custom split normal is `MG.corner_normals(part)[(face, vertex)]` multiplied by ±1. The sign is fixed so that it agrees with the recalculated polygon normal (a Newell normal in authored winding, compared with Blender's polygon normal). Edge smoothing is `MG.smooth_edges(part)`. Rows without classes (screens, the rug, cables and similar) use Blender's smooth shading with 40° sharp edges from `MG.smooth_edges`. Their exported normals are Blender-computed, not authored. Codex's final checker compares exact float32 `POSITION`, topology and corners, and exact float32 source `NORMAL` oriented by the witness; any automatic-normal or quantisation difference fails strict correspondence with angle diagnostics, to be reported, not waived. No normal-witness extension and no geometry change were requested.
- **Triangulation and splitting:** the exporter triangulates each polygon with Blender's loop triangulation and splits vertices wherever a corner's normal or UV differs. Exported vertex counts therefore exceed the helper's, and corner identity must be matched as (helper vertex, polygon) rather than by index.
- **Quantisation:** no compression, Draco or quantisation is enabled, so `POSITION` and `NORMAL` are float32 (`export_draco_mesh_compression_enable=False`, with no meshopt or quantise options). Blender's export can still move normals by float32 rounding and normalisation.
- **Per-row counts** for a pre-check are in the measurements' `inspection.rows`: helper vertices and faces, mesh vertices, polygons and loops, triangles, and whether custom normals are present.

These are author statements about the unexecuted script. Codex owns the checker's exact mapping and its limits.

## 6. Codex pins

| Pin | SHA256 | State |
|---|---|---|
| `scene-coordination/m4-v04-inspection-transition-guard.py` | `b79fca8ae91c97a8d817154a948e4b7388664e1ddbc5b11c1ffc744de513524c` | consumed after Codex's final handoff (S `msg_9674c6c4b4d2`); file hash checked |
| `scene-coordination/m4-v04-export-correspondence.py` | `a343bd2e8764bd26d8d1060ed78bb300922a3f620554316c738d4401dc17b378` | consumed after Codex's final handoff (S `msg_37d5909d04f5`); file hash checked |

The guard's API is `audit_m4_transition(parent_bytes, candidate_bytes) -> dict`; its CLI takes the candidate positionally and `--report` for an exclusive receipt. The checker's API is `audit_export_correspondence(candidate_bytes, rows_bytes, witness_bytes, *, expected_candidate_sha256, expected_witness_sha256, expected_builder_sha256) -> dict`; its CLI is `candidate --witness PATH --candidate-sha SHA --witness-sha SHA --builder-sha SHA --report FRESH`. The witness is this builder's author measurements: `inspection.rows` (counts, `flippedPolygonIndices`, `loopVertexOrder`, `customNormals`), `sourceScriptSha256`, `exportReadback.rawSha256`, the inspection pins and the pose. The caller supplies independently captured raw, witness and released-builder pins later. Neither CLI was invoked. I did not edit Codex's files.

## 7. Future invocation, receipt capture and resources

**Invocation** (only after root edits the RELEASE line under review). Run from `asset-pipeline/full-kit/` as one hidden process, with nothing else heavy running:

```
set FK_M4_PARENT_RELEASE=dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --factory-startup --disable-autoexec --python-exit-code 1 --python source/build_fullkit_m4_v04_inspection.py -- blend glb
```

The releaser captures stdout and stderr, the exit code, wall time and the process's peak working set into its run receipt. Then Codex runs the guard CLI on the raw export, for example `python scene-coordination/m4-v04-inspection-transition-guard.py asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v04-inspection.raw-export.glb --report asset-pipeline/full-kit/manifests/m4-v04-inspection-transition-receipt.json` (Codex owns the exact form). After that comes the correspondence CLI: `python scene-coordination/m4-v04-export-correspondence.py <raw export> --witness asset-pipeline/full-kit/manifests/m4-v04-inspection-author-measurements.json --candidate-sha <raw sha> --witness-sha <witness sha> --builder-sha <released builder sha> --report asset-pipeline/full-kit/manifests/m4-v04-inspection-correspondence-receipt.json`. The released builder hash differs from `2f887453` because root's release edits the RELEASE line. Both receipts are fresh-exclusive. The Blender install was observed as a directory listing only; the executable was not started.

**Resources.**
- The expected workload is a single Blender process: factory startup, the dry M3 chain, 18 M4 rows (13,968 placed triangles), one BVH set, raw export.
- **No measured Blender peak exists.** The recorded peaks (60–110 MB) are CPython measurement processes, not Blender, and I did not launch anything to estimate one.
- The governing rule is `art-direction.md` §10: one hidden Blender process, factory startup, at least 5 GB free, never stopping another process.
- Root's fresh check at 2026-11-18T17:52:21Z saw 0.81 GiB free of 15.73 GiB, far below that rule; the rule stands with no waiver and no process shutdown. A fresh memory check must pass before the release, and if it does not the build waits. **This is the current resource blocker.**

## 8. Validation performed (static, CPython only)

- The generator verified the frozen builder hash before deriving.
- The successor parses (`ast.parse`).
- Section-hash comparisons: the editable-chain block, the geometry/normal/measurement span (sole difference `sourceScript`) and the save/bake/join/export block are byte-identical to `0d01536c`.
- The parent GLB's `asset` (`Khronos glTF Blender I/O v5.2.41`, `2.0`) and `scenes[0].extras` were read: the extras equal the proposal's `before` object exactly, and `asset` equals its `assetMetadata`.
- The rows artifact (`1fa5fdd3`), producer (`3c9fe150`) and M3 script (`dccfa288`) hashes were checked.
- The guard (`b79fca8a`) and checker (`a343bd2e`) file hashes were checked before each pin was set. After the final regeneration the frozen builder, helper and declaration still hash `0d01536c`, `8d814874` and `8ce8db34`, and the combined chain, geometry/normal/measurement and export blocks hash identically in both builders.
- No Blender, dry run, export, browser, render, build server, Git, dependency or helper was used.

Not verified, because nothing executes: the add-on lookup through `addon_utils`, the exact export split and winding in practice, and the retained-word outcome. These are recorded as dependencies of the later held run, not hidden.

## 9. Open items

Preparation is complete; this is not an export release.

1. Root's single inspection build release, which edits the RELEASE line under review and records the released builder hash.
2. A fresh memory check that meets the ≥5 GB rule (last 0.81 GiB).
3. After the run, raw evidence first: the exact guard, then the correspondence check, then root's measured restoration/packaging decision only if the guard fails.
4. Later inspection scope is unchanged: five free views, the fixed-eye music and right-down views at 320 and 390, music-1440, viewport and device/renderer DPR recorded separately, H1's full key count, and all fourteen gates open.
