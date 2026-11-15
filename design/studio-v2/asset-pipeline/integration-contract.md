# Studio v2 GLB integration boundary and offline evidence

Status: **bounded contract/validator task complete with independent APPROVE**. S froze profile v1; author-final real **v03 passes offline validation (exit 0)**. Historical v02 failure is retained below. This is technical preparation only, with no product change or runtime/GPU/visual acceptance. Independent Codex critique `ctx_41b4a64b4d66` is complete; closure authorized by S message `msg_88053ec96857`. Author: actual Codex, task `task_618f1b843a91`, dispatch `ctx_bf0dc81aabed`, terminal `term_9be0fbcf-c28c-4059-acf5-f12ab4b80be3`; S coordinator `term_d778dd3c-3d00-45ad-b8a3-c9fdcaee8e94`. No model/effort override or helper workers. Claude author: task `task_a8910075c00f` / dispatch `ctx_dacb90594fdc`.

## Frozen export interface: right-limit-pilot-v1

The machine-readable export boundary is [pilot-profile.json](integration-contract/pilot-profile.json). Names follow Claude's existing `build_pilot.py`, inspected read-only. Export precisely these nine static mesh nodes, directly under the single default scene; no wrapper node, shell/context, lights, cameras, skin, morph targets or animations. Node names are unique and exact; mesh datablock names are not adapter keys. Each node uses the single named material below (multiple primitives with that same material are allowed). No new public scene fields.

| Node | Material |
| --- | --- |
| pilot_door_leaf | lib_oak |
| pilot_door_architrave | lib_dark_oak |
| pilot_door_hardware | lib_brass |
| pilot_lamp_base | lib_black_metal |
| pilot_lamp_pole | lib_brushed_metal |
| pilot_lamp_fittings | lib_brass |
| pilot_lamp_shade | lib_linen_shade |
| pilot_lamp_shade_trim | lib_linen_trim |
| pilot_lamp_bulb | lib_bulb |

Author Blender metres, Z up. Prototype world `(x,y,z)` maps to Blender `(x/2,-z/2,(y-0.11)/2)`. Blender's `export_yup=True` maps Blender `(X,Y,Z)` to glTF `(X,Z,-Y)`. Thus glTF positions are `(x/2,(y-0.11)/2,z/2)`; the eventual runtime adapter applies **exactly once** `world = 2 * gltf + (0,0.11,0)`, with no extra axis rotation, recentering, fit-to-view or auto-scale. This is a proposed future adapter, not implemented here.

Bake the pilot's world placement into mesh positions. All nine exported node transforms must be identity (omitted defaults or explicit identity matrix/TRS), with no hierarchy. This matches the current pilot script's world-authored vertices; apply export modifiers without changing its editable source. The scene object created by GLTFLoader is identity; the future importer wraps it in one adapter group with scale `(2,2,2)` and translation `(0,0.11,0)`. Do not also bake that adapter into vertices or node scale. The profile's generous metre bounds and door/lamp height ranges catch double conversion and lost placement without judging modelling style.

The fixed eye remains world `(-0.7,2.8,3.4)`, equivalent to Blender `(-0.35,-1.70,1.345)` and glTF `(-0.35,1.345,1.70)`. Import/resize/selection/panel changes must never move it. Runtime yaw/pitch/FOV remain controlled by the current art-owned view configuration; no exported camera drives the app.

## Materials, textures and metadata

Use glTF metallic-roughness materials, embedded PNG/JPEG, normals and UV0; no external URI or data URI. `lib_oak` requires base colour texture; `lib_linen_shade` requires base colour and emissive textures. Image filenames are descriptive, not lookup keys; actual material slots establish presence. Share `lib_brass` and other identical resources by identity. All eight pilot materials are OPAQUE with alpha 1. Preserve authored roughness, metalness, emission and sidedness: this contract does not tune their appearance.

Allowed optional extensions are `KHR_materials_emissive_strength`, `KHR_materials_ior`, and `KHR_materials_specular`, supported by installed Three r187. All other extensions, including Draco, Meshopt, KTX2/Basis, WebP/AVIF, quantization, instancing and punctual lights, fail this deliberately narrow pilot profile even when optional. No decoders or dependencies are added. Extension factors must be finite and in their defined ranges. Custom Blender nodes/procedural shading are not transferable materials: bake intended texture channels before export. Colour/emissive maps load with loader-assigned sRGB; data maps stay linear. Do not double-convert texture colour or apply Blender exposure into the base colour. Runtime ACES exposure 1.2 and Blender AgX/Cycles differences require later actual rendering.

Each mesh has extras `pilot: "right-limit"`, `occluder: true`; optional boolean `nocast` and `transparent` default false. All pilot materials are opaque, so `transparent: true` or `occluder: false` is a validation failure, **including the opaque bulb**. The script's initial bulb exemption must be corrected by Claude. `nocast: true` is an independent shadow choice and is permitted; it never exempts picking occlusion. The importer must validate metadata against the loaded material, not blindly trust extras or `userData.interactive`.

For future assets, transparent BLEND/contact meshes are excluded from opaque picking blockers and explicitly marked `transparent: true, occluder: false`; an opaque decoration stays a blocker even if emissive or non-shadow-casting. MASK/alpha-cutout assets require a separately reviewed picking policy because the current raycaster does not test texel alpha. Mixed transparent/opaque materials must be split into separate meshes before deriving the live occluder list. No new transparency material decision is made here.

## Eventual monitor and model adaptation (not part of this pilot)

Reserve `target_dissertation`, `target_copilot`, `target_typeforge` for the three single planar, two-triangle project faces; `border_dissertation`, `border_copilot`, `border_typeforge` for their dedicated highlight geometry. Pilot files must contain none of these. Future importer validates exactly one of each and maps names to the existing `StudioTarget { id, surface, border }`, using only the existing ProjectId values. Face local +Z is the visible/front side; a later monitor contract must lock geometry/winding and separation with its artist before export. No guessed camera-relative facing adjustment.

The adapter creates/owns a distinct `THREE.MeshBasicMaterial` for each target border so selection cannot recolour another object through a shared material. The current controller expects that concrete border type. No other geometry may share those mutable highlight materials. Target faces and exact dedicated border planes are excluded from `model.occluders`; the existing procedural three-border exception does not exempt arbitrary imported objects. After final placement and any approved batching, update world matrices and collect **live attached opaque meshes**, including InstancedMesh; reject arbitrary opaque omissions. Preserve target and border object identities from batching. Return the existing `StudioModel { scene, targets, occluders }`, with no new public fields. This pilot validates no target integration.

## Ownership, disposal and async integration requirements

Current `SceneResources` is a Set-based ownership ledger for geometry, material, texture and InstancedMesh; its disposal clears each set and attempts all releases even if one throws. GLTFLoader does not register any imported resource in it. Future integration must create a private pending asset owner, traverse the entire parsed result once, and register each unique geometry/material/texture (all material texture slots, not only map), plus any replacement border material. Multiple nodes/primitives may share these resources: dispose by identity exactly once, not once per mesh. Do not dispose borrowed procedural resources or share an owned GPU resource across independently disposed scene controllers. Any future shared asset cache requires explicit retain/release ownership before use; there is no such cache here.

Textures may share a source image or ImageBitmap while being distinct Texture objects. Dispose every owned Texture once, and close each unique exclusively owned ImageBitmap once **after its last texture consumer releases**; `texture.dispose()` does not close it. Never close a borrowed bitmap. Imported mesh clones do not independently own their shared geometry/material. Transfer ownership only after full validation; release the pending owner on any validation/attachment/render failure. Drop parsed caches/references after cancellation/disposal. Parser rejection before a result is returned requires an explicit tracked-image/loader cleanup strategy and a failure test; successful traversal alone cannot prove partial-load cleanup. Current source is unchanged and does not implement this requirement.

Future controller state remains public `loading -> ready | unavailable`, with private generation/liveness token. Start one candidate fetch per live generation; use AbortController for network where practical, invalidate the token before abort/dispose, and tolerate parsing completion after abort (GLTFLoader.parseAsync is not cancellable). Stale completion attaches nothing, fires no ready/error callback, and disposes the entire newly resolved asset. A valid result is checked against names/materials/metadata, registered, adapted, attached and first successfully rendered at nonzero visible size before `ready`. Hidden/zero-size hosts stay loading. Failure of fetch/decode/validation/attachment/first render reports unavailable once through the current fallback and releases resources; do not claim ready because a promise resolved. Disposal/unmount prevents every late callback. Current queued view commands, latest selected id and interactionEnabled must still be honoured without moving the fixed eye; readiness/failure/abort races, Strict Mode remount and late completion need separate integration tests. Do not mount the pilot over duplicate procedural door/lamp geometry; replacement policy remains a later S/root-owned change.

## Budgets and evidence responsibilities

Existing whole-scene gates remain: compressed scene-related JS/assets <=1,500,000 bytes, peak draw calls <=200, rendered triangles <=200,000, DPR <=2 desktop /1.5 small, <=1 shadow-casting light. The current map is 2048x2048 and manually invalidated PCF; imported files contain zero lights. Root/I owns actual renderer.info at initial/settled views and a 10-second look/resize sample, requested-frame p95 target <=33 ms and attributable long tasks; measure network transfer with cache/encoding context. These offline counts do not include culling, shadow passes, duplication with the prototype, JS, scheduling or GPU memory.

Provisional **pilot-only** hard preflight ceilings: <=20,000 instantiated triangles, <=18 primitives, raw GLB <=1,500,000 bytes, images <=2048 per dimension and combined <=12,582,912 pixels. They leave geometry room for the full scene and catch obvious cost regressions, but grant no full-scene transfer reservation. Report unique geometry triangles separately from placed instance triangles and primitive count separately from actual draw calls. Offline gzip/Brotli sizes are estimates only; even a pilot below its file ceiling can fail the whole-scene compressed budget. Claude owns complexity/material reduction choices; S/root must review any requested ceiling change, never silently loosen the validator to fit an export.

## Verification and remaining gates

Inputs read: common/routing and asset-authoring addenda, scene-coordination/contracts.md, scene-report.md, art-production-plan.md, runtime-audit.md, current resources/picking/types/controller/model, pilot script, installed Three loader source. Installed `three` and `@types/three`: 0.187.0. Runtime audit's Blender 5.2.3 is prior evidence; this worker does not run Blender. No package, scene or product source is edited.

The dependency-free Node validator and focused in-memory synthetic fixtures are implemented under integration-contract/. A synthetic valid fixture proves only validator mechanics, never completion of the real asset. Required later integration checks: actual PNG/JPEG decoder/browser load, shading/alpha/emission and normals/winding visual inspection, artist-approved transforms/framing, live picking, late-load cancellation/disposal and render/transfer/timing/GPU checks. Independent Codex critique of this bounded offline deliverable is complete, as recorded below. No self-approval.

Unresolved art choices remain with Claude: visual shade emission, material response under runtime lighting, any proposed transparent bulb/shade, and acceptable texture/detail reductions if over budget. No artistic values were retuned here.

## Implementation receipt and exact evidence

S freeze is message `msg_a6eb90fd05fa`; the profile SHA256 remains `02a9b364ed42127988747660ac61d6efca8bc3af9f151a0e41eb0d50bc0baa08`. Early contract-ready messages were `msg_b12f353c4115` and `msg_6690b84f90de`, binding initial report SHA256 `1480ed59ac146558784dee7ce379791e650673bab0e19a0da33c3e95b238c3d8`. Later edits to this report append implementation/evidence and status; they do not change the frozen profile. S/Claude reconciliation is required before profile semantic changes.

The validator deliberately checks this bounded pilot rather than implementing a generic glTF system. It fails at the first contract violation and reports JSON with exact input/profile hashes; a partial metrics object on failure is not a successful whole-file inventory. Exit 0 is offline pass, 1 is rejected candidate, 2 is usage/I/O/tool failure. It checks JSON/BIN layout and bounds, all accessor binary values, alignment/strides/indices/extrema, exact names/root transforms/material associations, PBR ranges/texture references/embedded image signatures and dimensions, metadata, extension allowlist and static geometry/placement/budgets. PNG chunk lengths/IHDR/IDAT/IEND and JPEG marker dimensions are inspected; compressed image pixels, PNG CRCs and JPEG entropy data are **not decoded or validated**. This is not Khronos conformance certification or a browser GLTFLoader smoke test.

Commands below ran from the repository root on Node **v24.21.0**. Installed packages read directly: Three **0.187.0**, @types/three **0.187.0**, Next **14.0.4**, React **18.3.1**, ESLint **8.57.1**. Exact executed commands/exits, inspected loader/package hashes and timestamps are in [verification.json](integration-contract/evidence/verification.json). No TypeScript/product build/server/browser was needed for these standalone `.mjs` files.

| Command/check | Actual result |
| --- | --- |
| `node --check design/studio-v2/asset-pipeline/integration-contract/validate-glb.mjs` | exit 0 |
| `node --check design/studio-v2/asset-pipeline/integration-contract/synthetic-fixture.mjs` | exit 0 |
| `node --check design/studio-v2/asset-pipeline/integration-contract/verify-validator.mjs` | exit 0 |
| `node --test --test-reporter=tap design/studio-v2/asset-pipeline/integration-contract/verify-validator.mjs` | exit 0, 61/61 pass; [TAP](integration-contract/evidence/validator-tests.tap) |
| Installed ESLint Linter API, standalone JS scope: no-undef/no-unused-vars/no-unreachable/no-constant-condition | zero messages; [receipt](integration-contract/evidence/lint.json); not application configured lint |
| Validator CLI against temporary synthetic valid GLB | exit 0; [report](integration-contract/evidence/synthetic-pass.json) |
| Validator CLI against temporary synthetic opaque-bulb-exempt GLB | expected exit 1, OCCLUSION_METADATA; [report](integration-contract/evidence/synthetic-failure.json) |
| `node design/studio-v2/asset-pipeline/integration-contract/validate-glb.mjs` with no arguments | expected exit 2 (usage) |
| Real v02 command below | exit 1, OCCLUSION_METADATA |
| Author-final real v03 command below | exit 0, valid=true, no errors |

Synthetic CLI files were generated from the committed in-memory fixture and removed after execution; the reports explicitly retain the `synthetic-cli-only.glb` name and are not pilot evidence. Tests exercise indexed/unindexed/interleaved layouts, shared-geometry counts, structure/bounds/nonfinite errors, exact metadata, missing textures and unsupported extensions, identity/coordinate mapping, and actual triangle/primitive/file ceilings. Initial 59 tests passed before the two additional triangle-budget and coordinate-round-trip cases; the retained final run is 61/61. A package-version diagnostic `require('three/package.json')` exited 1 (`ERR_PACKAGE_PATH_NOT_EXPORTED`); direct filesystem JSON reads recovered the actual version without changing packages.

### Historical real candidate result: failed v02

```powershell
node design/studio-v2/asset-pipeline/integration-contract/validate-glb.mjs design/studio-v2/asset-pipeline/pilot-right-limit/exports/pilot-right-limit-v02.glb --report design/studio-v2/asset-pipeline/integration-contract/evidence/pilot-v02.json
```

Exit **1**. Candidate SHA256 `a4e2e741389bee33eec6eb705b89646490cb89fa34dba479fad9f756a1c0c4b8`, **582,280 bytes**. The real file was found in Claude's export directory before final-artifact delivery and predates the corrected v03. `pilot_lamp_bulb` has `occluder: false` despite its opaque material, so the validator rejects it. Three embedded PNG headers are present: timber 1024x256, linen emissive 256x256, linen albedo 256x256 (393,216 total pixels). Geometry/global totals are not published as a completed pass because checking stopped at that blocker. Exact result is [pilot-v02.json](integration-contract/evidence/pilot-v02.json); S was notified as `msg_edef561baf06`. This failure record is preserved unchanged. This worker did not modify any candidate bytes or Claude's script.

### Author-final real v03: independently executed offline pass

S delivered the author-final path/hash in message `msg_e8a2d1234bef`. This Codex worker independently ran the following command against that exact file; the result does not rely on the author's reported validator run:

```powershell
node design/studio-v2/asset-pipeline/integration-contract/validate-glb.mjs design/studio-v2/asset-pipeline/pilot-right-limit/exports/pilot-right-limit-v03.glb --report design/studio-v2/asset-pipeline/integration-contract/evidence/pilot-v03.json
```

Exit **0**, `valid: true`, `errors: []`. Candidate SHA256 **`2b9a4182c3024485680c1e066c8a22ef0dc0f541acca4bd958486bced2c4063e`**, matching both S's delivered hash and a separate PowerShell Get-FileHash read. Validator and frozen profile hashes are unchanged. [pilot-v03.json](integration-contract/evidence/pilot-v03.json) retains the full node inventory, image hashes, group bounds, budgets and deferred checks.

| Offline measurement | Actual v03 |
| --- | --- |
| Raw GLB | 585,536 bytes |
| Placed / unique geometry triangles | 5,528 / 5,528 |
| Mesh nodes / primitive instances / materials / textures | 9 / 9 / 8 / 3 |
| Embedded PNG dimensions | 1024x256, 256x256, 256x256 |
| Combined image pixels | 393,216 |
| Gzip / Brotli estimates | 392,354 / 362,825 bytes (local compression, not measured HTTP transfer) |
| Extension | KHR_materials_emissive_strength only |
| Door / lamp overall metre height | 2.1459999 / 1.89199996 |
| Bulb metadata | occluder=true, nocast=true |

The nine direct roots have identity transforms and positions inside the agreed metre envelopes. No camera, light, animation, skin, morph target or unsupported extension was exported. Required named materials and texture references are present. Counts meet the frozen pilot preflight ceilings; whole-scene renderer/network budgets remain unmeasured. No gate or source was relaxed to obtain this pass, and the 61-case fixture evidence remains applicable because validator/profile/test source hashes did not change.

Read-only author report context: `pilot-right-limit/pilot-report.md` identifies the six v03 stills and notes that the separate shade close-up was not rendered after the harness killed the earlier render process for low memory; the final `norender` export succeeded under root authorization. These are author-reported visual-production facts, not this worker's image inspection or visual judgment. Runtime material appearance, actual PNG decode, GLTFLoader/browser load, picking/lifecycle/resource integration and actual performance remain outside this offline task; independent Claude visual decisions belong to that separate lane. Independent validator critic dispatch `ctx_41b4a64b4d66` subsequently approved the exact offline deliverable, as recorded below.

### Exact files authored in this lane

All paths below are under `design/studio-v2/asset-pipeline/`; no existing product/Claude/controller/resource/type/package file was edited by this worker.

- `integration-contract.md`
- `integration-contract/pilot-profile.json`
- `integration-contract/validate-glb.mjs`
- `integration-contract/synthetic-fixture.mjs`
- `integration-contract/verify-validator.mjs`
- `integration-contract/evidence/lint.json`
- `integration-contract/evidence/pilot-v02.json`
- `integration-contract/evidence/pilot-v03.json`
- `integration-contract/evidence/synthetic-failure.json`
- `integration-contract/evidence/synthetic-pass.json`
- `integration-contract/evidence/validator-tests.tap`
- `integration-contract/evidence/verification.json`
- `integration-contract/evidence/source-hashes.json`

[source-hashes.json](integration-contract/evidence/source-hashes.json) binds every validator/profile/evidence file except itself and this mutable report. Validator SHA256 `fb3d6bee77fda20f89553a01bd24c70c70713f94ae7c543b894426a14f41ec7c`; test SHA256 `341365e141e9ea1f457161446d8d3b102b2a3452dfc5ef560152137844c38390`; fixture SHA256 `55632b3f3d758a5fd0fb03b8dd891b2e6ea55d37dbf155021017b45cb01ab465`. The final report hash is delivered separately to avoid a self-referential hash. No visual, runtime, GPU, performance or overall product completion claim is made.

## Independent approval and final closure

On 2026-11-15, actual Codex reviewer **task `task_e50fb788098e` / dispatch `ctx_41b4a64b4d66`** returned **APPROVE** in [scene-asset-contract-review.md](../scene-asset-contract-review.md), SHA256 `21c596eb46a1703c471a5e30c0836ab3dec880cd3c83bd161e9e541b6fd8d33a`. The reviewer is separate from this author and the Claude asset author, used no helpers/overrides, and found no blocking technical corrections. The proposed integration interface was approved as future requirements, not implemented behavior.

The review independently executed **26/26 successful probe expectations** and exact-candidate CLI checks: v03 exit 0 and v02 exit 1. It checked the retained author 61/61 TAP and manifest, verified core-source stability, and confirmed the final v03 hash `2b9a4182c3024485680c1e066c8a22ef0dc0f541acca4bd958486bced2c4063e`. Reviewer-owned commands/results and file hashes are linked from its report under `scene-coordination/asset-contract-review-*`; they are not files authored by this lane. Its two probe commands (`node --check design/studio-v2/scene-coordination/asset-contract-review-probes.mjs` and `node design/studio-v2/scene-coordination/asset-contract-review-probes.mjs`) both exited 0, as recorded by the independent reviewer.

The review binds pre-closeout report hash `da27ce20f1ddb92dd2ac80845b20dde212048b063e7675b8434bd188ceaf3edf` and author evidence manifest hash `09c98ded4148ac37eca06dd8bfd20afa0775c83fd87d1a10433c10c3abf0ba21`. This closeout changes only report status and approval context: validator, frozen profile, fixtures, candidate and all validation evidence remain unchanged. `evidence/verification.json` retains its historical pre-verdict pending-review state; this section is the final verdict receipt. Optional promotion of the reviewer's JPEG/aggregate-image-budget probes into maintained fixtures is explicitly **deferred by S**, not a required fix; no expanded tests were run.

S message `msg_88053ec96857` authorizes closure of task `task_618f1b843a91`. All work required for this bounded technical contract/offline-validator slice is complete. Root's separately released runtime implementation has its own ownership and gates; no product lease transfers to this worker. Browser/image-decoder/runtime/visual/performance acceptance remains outside the claim of this completed task.
