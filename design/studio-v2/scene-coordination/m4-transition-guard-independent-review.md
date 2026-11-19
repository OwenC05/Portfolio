# Independent M4 transition-guard review

**REQUEST CHANGES for the frozen helper before first M4 export acceptance.** Two bounded corrections are required: the known, author-approved provenance amendment and malformed-record handling that preserves the public receipt contract. No other blocking issue was found in the reviewed transition behavior. This is a writer-separated technical review of a synthetic transition, not an M4 artifact, art or stage approval.

15 November 2026. Read the [root M4 release](m3-v03-stage-disposition-and-m4-release.md), [technical task](m4-technical-guard-task.md), complete [mapping](m4-model-contract.json), [helper](m4-transition-guard.py), [writer tests](m4-transition-guard-tests.py), original receipt and implementation report, and the previously reviewed M3 hierarchy/restoration evidence and actual pinned hierarchy source. The helper and mapping remained frozen at the supplied hashes throughout this review. No Blender, browser, server, build, package, source/art/helper edit, Git mutation or additional worker was used.

## Blocking findings and smallest corrections

### 1. Honest M4 scene provenance is currently rejected

`m4-transition-guard.py:189–197` compares every scene field other than remapped root indices exactly against M3. An otherwise passing synthetic candidate with updated `fk_stage`/stage tags is therefore invalid with `sceneMetadata`. The writer disclosed this limitation; the guard should not be bypassed by retaining stale M3 labels.

**Required correction:** obtain actual Claude's exact intended scene-provenance delta through root/S, record it in a newly hash-pinned contract amendment, and validate precisely that transition. Preserve every other scene/document field, retained node, transform, flag, reference and byte check. Do not exempt all `extras`, accept arbitrary tag patterns, relabel the frozen corrected M3 parent, or inherit a numeric-noise exception. Add one positive for the approved exact new metadata and negatives for stale M3 metadata, wrong/missing approved values and unrelated metadata changes. A focused independent rereview of the new contract/helper identities is required before this blocker clears. The illustrative tag mutation in this review's test is a rejection probe, not an approved tag specification.

### 2. Some malformed records escape the promised result/receipt API

`audit_m4_transition` at `m4-transition-guard.py:352–364` promises a result with `valid` and `errors`, but its exception boundary omits `AttributeError`. Three independently constructed malformed GLBs, each differing from the synthetic baseline only in a JSON record shape, escape instead of returning `valid: false`:

| Candidate mutation | Observed escape | Relevant code |
| --- | --- | --- |
| `scenes[0] = null` | `AttributeError: 'NoneType' object has no attribute 'get'` | Extracted M3 hierarchy source `build_fullkit_m3.py:764–766`, then helper `:182`, `:361` |
| `images[0] = null` | `AttributeError: 'NoneType' object has no attribute 'get'` | Helper `:82–86`, `:142`, `:361` |
| `textures[0] = null` | `AttributeError: 'NoneType' object has no attribute 'items'` | Helper `:73–74`, `:150–151`, `:361` |

These inputs do **not** obtain a false pass or alter a GLB. They break the structured failure contract and would abort the CLI before it writes the requested fresh invalid receipt (`:375–381`). This is a bounded API robustness issue, not a request to duplicate the structural validator.

**Required correction:** add appropriate record-type checks or narrowly convert these malformed-record `AttributeError`s into the existing `malformedInput` result. Test the three actual shapes against the public API, with `valid: false`, a JSON-safe error list and unchanged inputs; add a bounded fresh-receipt CLI rejection check if needed. No change to the frozen M3 source or any art/profile/budget rule is necessary.

## Reviewed behavior that passes

- The pinned contract names the exact **23 retired proxies → 18 new leaves total**, including `music_cables__runs`. Result counts are **110 leaves, 58 asset IDs, 17 proxies and three provisional contacts**, with only `wall_cable_run` still absent. Import-time pins protect the mapping, M3 source, profile, inventory and accepted parent manifest; every audit checks the complete corrected-parent GLB hash (`:18–49`, `:177`).
- The reviewed M3 hierarchy function is AST-extracted alone; no authoring module or Blender import executes. Named substitution, direct root leaves, retained parentage/children, reachability and scene roots remain protected. The additional token comparison catches numeric/boolean substitutions that Python equality alone could overlook (`:198–199`).
- Retained mesh/primitive definitions, material assignments, attribute sets, normalized accessor metadata and exact logical component/index bytes are compared (`:222–276`). Forward/reverse maps reject changed retained mesh/accessor sharing. Storage indices, BIN origins and packed versus strided placement may change without creating a false content difference. Independent positive UV repacking and negative accessor splitting/collapse checks behaved correctly. Full retained bytes include the eight reserved geometries; old UV-noise words have no exemption. Diagnostic tests verify both accessor identities, vertex/component, BIN/file offsets and actual word bytes.
- Material names/definitions and texture slots, all image names/metadata/encoded bytes, sampler definitions and normalized texture relationships are protected (`:141–168`, `:201–220`). Both palettes are byte-frozen for M4; prior T2 permission does not carry forward. Material-slot rewiring without changing the texture collection is rejected, as is an additional duplicate texture record. Preserving encoded bytes also preserves the accepted palette RGBA and cell meanings without re-decoding them here.
- Each new row must have its exact name/asset/material, one opaque primitive, sidedness and exact boolean flags. Opaque `nocast` rows still occlude. Per-row triangle/pass ceilings bind before the outer **20 main / 30 refresh / 22,500 placed** ceilings (`:278–343`). Contract forecasts remain **18 main / 9 shadow / 27 refresh, 19,270 placed / 33,560 weighted triangles**. No cap or value was changed by this review, and no whole-room reforecast was duplicated.
- The CLI has no GLB-write operation and uses exclusive receipt creation (`:367–383`). Its source and original successful exclusive-path tests were inspected. No arbitrary GLB repair, epsilon or automatic restoration is present.

## Independent evidence

| Frozen artifact | Verified SHA256 |
| --- | --- |
| M4 helper | `32673405c0f07e248899e3b4a855081cfb8a98b0ef2077e00e558892481e1b6a` |
| M4 mapping | `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98` |
| Writer test source | `48cf26cee1c47a451bf90e5f42db6b842afddc2f9f0cdeead95daa71cb3cd108` |
| Original 51-check receipt | `6a90cc5c69c79ec676ebdd08db96b5ac80be97cee6b0e2154692ff9f7afc3134` |
| Accepted corrected M3 parent | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| Accepted parent manifest | `060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405` |
| AST hierarchy source | `dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209` |

Ran `python -B design/studio-v2/scene-coordination/m4-independent-review-probes.py`. The [independent runner](m4-independent-review-probes.py) executes the writer's **50 in-memory checks**, all passing, through an AST adaptation that removes only the CLI fixture-writing/cleanup call and redirects the receipt to the review's owned path. The original 51st CLI check was reviewed from source and its frozen receipt, **not** counted as independently rerun. The [separate rerun receipt](m4-independent-review-rerun.json) preserves before/after dependency hashes and the synthetic positive's **92 retained leaves / 368 accessor comparisons / zero component differences**. Its 216 M4 triangles are copied proxy test geometry, not a candidate forecast.

The [additional independent receipt](m4-independent-review-probes.json) records **21 probes: 18 expected outcomes and the three API-contract failures above**. Additional successful cases cover strided UV relocation, retained accessor sharing, boolean type drift, frost order, image identity, material texture-slot rewiring, target normal bytes, exact reference relocation, the known provenance blocker, invalid references/bounds/sparse accessors, malformed accessor shape, truncated GLB and invalid UTF-8 JSON. The runner exits 0 after recording review observations; that exit is **not** a clean-approval signal. The explicit failures in the receipt and this verdict govern.

The [first-attempt record](m4-independent-review-first-attempt.json) honestly preserves a reviewer fixture mistake: an incorrect frost leaf name stopped the added-probe run after the original 50 checks had passed. Correcting the fixture to actual `kb_case__frost_shell` did not change the helper; the passing original rerun receipt was retained and those checks were not unnecessarily repeated. No temporary candidate GLB or deletion operation was needed. Original writer receipts and all protected files remain unchanged.

## Stop condition and remaining gates

This bounded review is complete. Route the precise provenance values to the actual Claude/root contract owner and the two narrow helper fixes to its technical writer; return the new pinned identities for focused independent rereview. No helper approval is granted for the current snapshot.

The unchanged full-kit validator remains mandatory for actual M4 glTF structure, attribute layouts/finite values, normals, transforms and supported profile data; this transition guard does not replace it. Actual M4 retained-byte audit, paired manifest, per-row/weighted/global/transfer reconciliation, root captures and independent Claude visual review are still future gates. No actual M4 artifact exists in this review, and neither stage acceptance nor M5 release is implied.
