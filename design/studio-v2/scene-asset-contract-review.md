# Independent review: pilot GLB contract and offline validator

**APPROVE the bounded offline validator and proposed integration interface.** No blocking technical correction was found in the reviewed revision. The exact author-final v03 candidate passes this offline preflight; historical v02 remains rejected. This verdict grants no application, runtime, image-decoder, browser, device, GPU, performance or visual acceptance, and does not authorize integration.

Reviewer: actual Codex, task `task_e50fb788098e`, dispatch `ctx_41b4a64b4d66`, terminal `term_41cf1611-869f-4027-b9a5-7bb108a204a7`; separate from validator author and Claude artist, with no override/helpers. Review performed on 2026-11-15 Europe/London; exact UTC capture is in the evidence. Only this report and `scene-coordination/asset-contract-review-*` evidence were authored. No implementation, profile, product, author asset/report, package or configuration was changed. No browser, build, server, Blender, paid generation or rendering was run.

## Ranked result

| Rank | Result | Finding / disposition |
| --- | --- | --- |
| Blocking | **APPROVE** | No P1/P2 defect found against the deliberately narrow offline requirements. No implementation repair is requested. |
| Interface | **APPROVE as proposed requirements** | One coordinate conversion, unchanged public types, explicit material-aware occlusion, unique resource ownership and late-result disposal are coherent requirements. They remain future implementation and verification work. |
| P3, optional test maintenance | **Nonblocking** | The author's 61-case suite lacks direct positive JPEG-header and aggregate-image-budget coverage (`verify-validator.mjs:121-125` exercises PNG/MIME cases). Independent probes below cover those branches, including the exact pixel ceiling and its violation. The validator owner may promote those cases into its maintained suite through S; this is not a present enforcement failure or an approval condition. |

Art decisions, including bulb/shade transparency, emission, material tuning and detail reduction, remain Claude-owned. S/root owns profile changes and integration decisions. No artistic value or budget was redesigned during review.

## Exact reviewed state

SHA-256 values are case-insensitive. The core validator/profile/fixture/tests matched the supplied frozen hashes before and after independent execution. Every entry in the author's final manifest also matched its file at capture.

| Source / candidate | SHA-256 |
| --- | --- |
| `asset-pipeline/integration-contract/pilot-profile.json` | `02a9b364ed42127988747660ac61d6efca8bc3af9f151a0e41eb0d50bc0baa08` |
| `asset-pipeline/integration-contract/validate-glb.mjs` | `fb3d6bee77fda20f89553a01bd24c70c70713f94ae7c543b894426a14f41ec7c` |
| `asset-pipeline/integration-contract/synthetic-fixture.mjs` | `55632b3f3d758a5fd0fb03b8dd891b2e6ea55d37dbf155021017b45cb01ab465` |
| `asset-pipeline/integration-contract/verify-validator.mjs` | `341365e141e9ea1f457161446d8d3b102b2a3452dfc5ef560152137844c38390` |
| Final `asset-pipeline/integration-contract.md` | `da27ce20f1ddb92dd2ac80845b20dde212048b063e7675b8434bd188ceaf3edf` |
| Final author `integration-contract/evidence/source-hashes.json` | `09c98ded4148ac37eca06dd8bfd20afa0775c83fd87d1a10433c10c3abf0ba21` |
| `pilot-right-limit/exports/pilot-right-limit-v02.glb` | `a4e2e741389bee33eec6eb705b89646490cb89fa34dba479fad9f756a1c0c4b8` |
| `pilot-right-limit/exports/pilot-right-limit-v03.glb` | `2b9a4182c3024485680c1e066c8a22ef0dc0f541acca4bd958486bced2c4063e` |

Coordinator message `msg_11d5ddefaaf1` preceded the final v03 appendix: its report/manifest hashes were `4f18e1...` / `a6190c...`. Message `msg_1da193d29e23` supplied v03. During review the author appended the v03 result and updated the manifest/verification receipt; the four frozen core files did not change. This verdict binds the final report/manifest hashes above, not the superseded pending-candidate status. The retained v02 evidence hash stayed `78468d981901bff3b8bdb12ca5c5d8eeca55f2662d4e72b0049583470d8c9516`.

## Enforcement review

Line references below are to the reviewed `asset-pipeline/integration-contract/validate-glb.mjs` unless otherwise stated.

| Requirement | Evidence and bounded conclusion |
| --- | --- |
| GLB and embedded buffer bounds | Lines 48-65 require version 2, exact file length, aligned bounded chunks and exactly JSON then BIN. Lines 98-106 require one URI-free embedded buffer, matching BIN length with at most three zero padding bytes, safe integer view offsets/lengths within that buffer and supported target/stride values. |
| Accessor bounds and finite values | Lines 109-139 check references, component/type/count/offset, component alignment, tuple versus stride width and last-element range before reads. Sparse data is rejected. Every accessor is decoded, including unused accessors, and every binary number must be finite; declared extrema must match within tolerance. Lines 223-248 require matching float POSITION/NORMAL/UV0 layouts, optional float TANGENT, near-unit normals, unsigned unstrided in-range indices and TRIANGLES counts divisible by three. JSON number overflow is also rejected by lines 67-81. |
| Exact scene, roots and materials | Lines 169-195 require the exact eight unique material names, required oak base-colour and shade base-colour/emissive slots, valid texture/image references, UV0 and bounded finite factors. Lines 198-218 require all nine exact unique names as unique direct roots of one default scene, and prohibit hierarchy/camera/skin/weights. Lines 237-238 enforce each node's assigned named material; lines 265-268 reject unused meshes and wrong group scale. Multiple same-material primitives remain intentionally allowed. |
| Embedded PNG/JPEG | Lines 142-152 require supported MIME types, no image URI, valid image views, dimensions and aggregate pixels. Lines 278-315 inspect PNG signature/chunk lengths/IHDR/IDAT/IEND and JPEG SOI/EOI, pre-scan marker segment bounds and supported frame dimensions. This is header/container screening, not decode success. |
| No decoder or dynamic surprises | Lines 67-95 recursively restrict actual extensions to the three allowed material extensions at material locations and reconcile used/required declarations. Unsupported optional extensions also reject. Cameras, animation and skins are forbidden; node/primitive guards forbid morphing and non-triangle modes. Punctual-light/decoder extension probes reach the extension guard. |
| Explicit opaque metadata | Lines 174-178 enforce OPAQUE/alpha 1. Lines 214-216 require `pilot: right-limit`, `occluder: true`, optional false `transparent`, and optional boolean `nocast`. Shadow exemption cannot exempt an opaque bulb from occlusion. |
| Metres and one adapter transform | Lines 209-212 reject nonidentity exported transforms; positions supply world placement. Lines 255-268 check each node against the frozen door/lamp metre envelope and combined group height. `integration-contract.md:21-25` proposes exactly `world = 2 * gltf + (0, 0.11, 0)`. This catches gross conversion, translation and scale errors; it does not prove artistic placement, that every vertex contributes to rendered geometry, or an unimplemented adapter's behavior. |
| Meaningful pilot budgets | Lines 48, 148-152 and 270-275 enforce raw bytes, image dimensions/pixels, placed triangles and placed primitives. Shared geometry is counted separately from each placement. Compression values are local estimates. These limits neither measure actual draw calls nor reserve the whole-scene transfer/GPU budget. |

“Identity” and extrema are numerical checks, not bitwise equality: transforms use `1e-6`, extrema use relative/absolute `1e-5`, and normals use `0.01` length tolerance. These tolerances do not permit the proposed scale-two/0.11 translation to be applied twice. Full schema certification, degenerate/winding/appearance checks and runtime success are explicitly outside this preflight.

## Independent probes and test-branch assessment

Evidence: [probe source](scene-coordination/asset-contract-review-probes.mjs), [captured probe results](scene-coordination/asset-contract-review-probes.json), [v02 result](scene-coordination/asset-contract-review-v02.json), [v03 result](scene-coordination/asset-contract-review-v03.json), [source/evidence manifest](scene-coordination/asset-contract-review-hashes.json).

Executed from the repository root on Node `v24.21.0`:

```powershell
node --check design/studio-v2/scene-coordination/asset-contract-review-probes.mjs
node design/studio-v2/scene-coordination/asset-contract-review-probes.mjs
```

Both exited 0. **26/26 independent probe expectations matched**, with core-source stability and all author-manifest hashes confirmed. The script captures the exact candidate CLI arguments and exits, writing exclusively to reviewer evidence paths. Synthetic cases are in memory; none are passed off as authored assets. Expected rejection results, including their partial metrics/errors, are retained rather than discarded.

Additional guard coverage includes unused-accessor NaN, nonfinite UV data, view-component misalignment, tuple/stride overlap, in-bounds strided indices, nonunit normals, repeated scene-root indices, unused mesh, extra material, node camera without a camera array, hidden light extension, missing occluder, mistyped shadow flag, duplicate matrix translation, invalid extension texture reference/IOR, JPEG dimensions/segment truncation/missing frame, aggregate image budget and raw JSON numeric overflow. The raw overflow fixture deliberately inserts `1e400` after serialization; it does not incorrectly rely on `JSON.stringify(Infinity)`, which would become null.

The image-budget rejection uses four separately referenced 2048x2048 header fixtures. Each image satisfies its dimension gate, so failure reaches `IMAGE_BUDGET` rather than `IMAGE_DIMENSION` or an unused-resource check. A three-image fixture at exactly 12,582,912 pixels passes. The strided-index fixture appends enough valid binary data to pass accessor bounds and reach `INDICES`. These constructions avoid earlier guards masking the intended branch.

The author's retained TAP reports **61/61**, not the older 59 count; its source and TAP hashes match the final manifest. I inspected the test source and evidence rather than rerunning the whole suite without a gap. `rejects()` at lines 11-16 asserts the exact first error code. The triangle-budget fixture at lines 67-75 adds valid indices and sufficient embedded bytes, reaching `TRIANGLE_BUDGET`; the primitive fixture at lines 142-145 makes 19 valid instances while staying far below the triangle ceiling. The coordinate test at lines 77-83 checks proposed conversion algebra only. The generic truncation assertion at lines 61-62 proves rejection, not specifically a chunk-parser branch; the more specific header/chunk cases assert their actual codes. Scoped author lint/syntax/CLI 0/1/2 evidence was read and hash-verified, not represented as a fresh app build.

Three probe categories deliberately show limits rather than defects: altered PNG CRCs pass; a header-only JPEG fixture passes; a JPEG frame without a scan passes. Those results agree with `integration-contract.md:69` and the validator's deferred-image message. They prove why an offline pass must not be described as valid decoded image pixels. Requiring a complete PNG/JPEG decoder or Khronos conformance implementation here would exceed this agreed scope. Browser/decoder failure remains an explicit later rejection path.

## Actual candidate results

| Check | v02 | Final v03 |
| --- | --- | --- |
| Exact-byte CLI exit | **1, rejected** | **0, offline pass** |
| Raw bytes | 582,280 | 585,536 |
| Error | `OCCLUSION_METADATA`, `pilot_lamp_bulb` | None |
| Bulb metadata | `occluder: false` | `occluder: true`, `nocast: true` |
| Completed validated triangles | Not reported: first-error stop | 5,528 placed / 5,528 unique |
| Validated primitive instances / materials / textures | Not a completed inventory | 9 / 8 / 3 |
| Embedded PNG headers | 1024x256, 256x256, 256x256 | Same dimensions and image-content hashes |
| Combined image pixels | 393,216 checked before failure | 393,216 |
| Gzip / Brotli estimates | Not claimed | 392,354 / 362,825 bytes |

The independent v03 JSON inventory also confirms nine direct roots, no explicit exported transforms, nine primitives and 5,528 declared triangles. The same inventory sees 4,644 declared triangles in v02, but that is a raw JSON count, **not** successful validation beyond its metadata failure. Therefore v03 is a whole new candidate, not described here as a metadata-only byte delta. The final file was reviewed in full by the offline validator. Image bytes are unchanged; artistic geometry differences remain for Claude's visual review.

V03 door/lamp measured heights are approximately 2.146m / 1.892m, inside the frozen ranges. The only extension is `KHR_materials_emissive_strength`. No gate/profile/source was weakened to obtain this result. The v02 failure stays valid historical evidence and is not reclassified as passed because v03 exists.

## Proposed interface and remaining acceptance

`integration-contract.md:39-49` preserves the current `StudioModel` / `StudioTarget` shape and the concrete `MeshBasicMaterial` border expectation (`components/studio/scene/types.ts:4-15`, `controller.ts:153-158`). The future importer must validate loaded materials and collect attached opaque blockers after placement/batching, including instances; current picking checks material opacity independently (`picking.ts:123-127`). The contract correctly treats the pilot as having no target integration.

The resource requirements match the current Set-based ledger and its attempt-all disposal behavior (`resources.ts:7-47`), while explicitly recognizing that loader resources are not automatically registered. Unique owned geometries/materials/textures, shared ImageBitmap consumers, borrowed resources, parser rejection before a result, and late resolved assets all receive separate ownership requirements. The document does **not** claim that these future loader-specific paths already exist or that traversal proves partial-load cleanup. The generation-token/abort ordering, stale no-attach/no-callback requirement, zero-size loading state, first successful render before ready, and failure teardown wording are appropriate acceptance criteria, not executed lifecycle or GPU tests.

S/root must still authorize and implement any adapter/replacement, avoiding duplicate procedural door/lamp geometry. Required later evidence includes real image decode and GLTFLoader load, material appearance and normals/winding, fixed-eye/framing approval, actual picking, resource/partial-load/late-load/Strict Mode tests, and whole-scene network/render/timing/device measurements. Claude retains visual and artistic acceptance. No further work is required from this bounded review lane; any later code/candidate delta needs a correspondingly scoped re-review.
