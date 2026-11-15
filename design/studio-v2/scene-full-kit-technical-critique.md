# Independent full-kit technical review

**REQUEST CHANGES — one medium blocking finding, FKT-1.** The isolated runtime loader does not enforce the inventory hash and final-stage completeness rules that the offline validator enforces. Both exact artist v02 candidates otherwise passed this review's bounded validation, installed-loader, binder, full-builder and cleanup probes. This is not approval of production integration, framing, whole-room completeness, browser performance or final appearance.

Reviewer: actual Codex, task `task_b2b62a79af12`, dispatch `ctx_70b616d3a242`, terminal `term_d8314a49-4e0d-4818-9b86-b41605724ba4`, ACK `msg_40a3bdcb013f`. No helpers or overrides. This reviewer authored the earlier planning proposal but did not write the implementation under review. The previous independent-review launch failure remains historical; this verdict belongs only to the current successful assignment.

## FKT-1 — runtime and offline manifest validation disagree (P2, blocking)

At reviewed `components/studio/scene/load-full-kit.ts:235`, the loader verifies the GLB SHA256, then calls `inspectFullKit` and `checkManifest`. `technical/profile-core.mjs:324` validates the syntax of `artInventorySha256`, not its equality with the bound inventory. It also accepts `stage: final` without checking final inventory/proxy rules. Those additional checks exist only in `technical/validate-full-kit.mjs:25` and lines 28–32.

Two independent cases preserve the valid synthetic GLB and its correct byte hash, changing only one manifest field:

| Change | Offline result | Actual installed-loader result |
| --- | --- | --- |
| `artInventorySha256 = '0'.repeat(64)` | Rejected: `art inventory hash mismatch` | Returns an attachable asset |
| `stage = 'final'` for the deliberately incomplete synthetic kit | Rejected: `final inventory incomplete` | Returns an attachable asset |

Reproduction: `node design/studio-v2/scene-coordination/full-kit-review-probes.mjs`, the two `runtime/offline manifest parity` cases. The fixture passes its normal preflight; these failures are not caused by malformed geometry, stale GLB hashes or an image stub error. Runtime parsing uses the installed r187 loader; the only candidate substitution is the explicitly paired bytes/manifest harness boundary. A stale or wrongly labelled candidate can therefore pass runtime admission after failing the stated offline contract. This is an integration correctness defect, not a remote exploit claim, and it does not establish that either current v02 manifest is wrong.

Repair through the original Codex owner: enforce the same inventory identity and stage rules on both paths, with browser-safe handling of the expected inventory identity. Retain the raw inventory hash contract and the profile; do not merely permit any hash-shaped string or drop final-stage enforcement. Add sensitive runtime negatives for stale inventory, incomplete final inventory and final proxies, with normal synthetic/M1 positives and complete-final fixtures as appropriate. Re-review the repaired source and both real candidates before closing FKT-1.

Early finding sent to S as `msg_0cf4aa8c3bcb`; S acknowledged repair routing in `msg_8eb0cae1aeec`. No repair was present in this review's captured source snapshot. The reviewer made no implementation or schema edits.

## Other bounded observations

The current certificate rejects a fresh unvalidated Group, a second bind, changed metadata, and invalid placement/structure. It is an internal coordination mechanism, not a security boundary: its WeakMap is exported and trusted application code can mutate the returned root. An additional hardening probe replaced both linked geometries or materials with the same equivalent clone before binding. `assertIntact` accepted these equivalent resources because it rebuilds its identity comparison from the current tree; the original imported owner does not own the new clones. A target `drawRange.count=0` modification also survived revalidation.

These are **nonblocking API-use limits** for the current `load -> bind first -> art appearance replacement` flow: the full builder binds first, and reviewer-created clones are outside the original owner's allocation contract. Do not claim `assertIntact` proves original allocation identity or every render-state property after arbitrary trusted mutation. If later pre-bind customization is supported, require explicit replacement ownership or retain exact original object/geometry/material references and relevant draw-state checks. The reviewer explicitly released injected clones; no source fix or general rescan of rebound runtime materials is requested here.

Changing a reserved target's `assetId` to another valid inventory ID also passes structural inspection. Reserved node names still determine selection and the frozen profile currently requires membership in the inventory, rather than a reserved-name-to-asset-ID map. This is recorded as a diagnostic limitation, not an additional blocking finding or a claim that current artist manifests contain it.

## Fresh evidence

Read the frozen profile and contract, completed art inventory, isolated types/loader/binder/builder, validator/helper/fixture sources, author test and implementation evidence, and root's capture receipt. Only this report and `scene-coordination/full-kit-review-*` files were written. No browser/server/build/Blender/dependency/product/art/profile changes were made.

| Command | Result |
| --- | --- |
| `node design/studio-v2/scene-coordination/full-kit-review-probes.mjs` | Exit0; 18 reviewer-authored cases executed, with adverse results explicitly retained, source hashes stable |
| `node --test --test-reporter=tap components/studio/scene/verify-full-kit.mjs` | Exit0; fresh 44/44 author regression tests; [TAP](scene-coordination/full-kit-review-author-suite.tap) |
| `python design/studio-v2/asset-pipeline/full-kit/technical/decode-images.py <baseline-v02.glb> <proposal-v02.glb>` | Exit0; actual Pillow12.3 decoding and RGBA materialization of all five PNGs in each candidate; [receipt](scene-coordination/full-kit-review-native-decode.json) |

The [review probe](scene-coordination/full-kit-review-probes.mjs) reuses the author's loader instrumentation harness, while assertions/cases and full-builder checks are reviewer-authored. It uses real Three geometry, real GLTFLoader and current TypeScript transpilation. Canvas2D and ImageBitmap/HTMLImage are explicitly stubbed there; it does not establish browser text rendering, browser image decode or GPU cleanup. Native Pillow evidence is separately labelled and was rerun, not inferred from those stubs.

Independent checks establish:

- Both exact v02 manifests validate and both files parse/bind/build with one placement, no procedural duplicate meshes, one shadow light/five point lights, exact live blocker sets, three independent borders and the same opaque dusk object after runtime material replacement. Imported cleanup leaves all thirteen runtime materials/textures for `SceneResources`; repeated disposal releases imported allocations once.
- Both actual v01 files fail specifically `binding planar local +Z/upright UV`, preserving their failed status and bytes.
- Shared-parent, non-affine transform and unsupported extension cases reach their intended rejection branches. The author suite freshly covers remaining tree/transform, RGB FLOAT/U8/U16, invalid alpha/range, quad/winding/UV, manifest, picking/visibility and failure cases.
- A decoded extension texture failure reaches `lib_plaster.specularIntensityMap missing`, despite r187's swallowed image rejection, and acquired resources drain. In a gated sibling failure, no resource or bitmap closes while a sibling decode is pending; after release, all successfully acquired resources are disposed once.
- A deliberately shared bitmap behind distinct texture consumers closes once after all texture releases. This exercises ownership deduplication without claiming a global cache is supported.
- A bound-root negative is sensitive: an in-memory mutant removing both the duplicate-bound guard and the otherwise masking intact-tree revalidation allows a second bind; original source rejects it. No mutant was written to product files.

The first exploratory run exited1 when its broad allocation assertion included a reviewer-created geometry clone as though the imported owner had allocated it. That result is preserved in [initial probe evidence](scene-coordination/full-kit-review-probes-initial.json). The final probe records the zero owner-release count, then explicitly releases the injected clone before asserting original-owner cleanup. The binding acceptance observation is unchanged. PowerShell initially encoded redirected output as UTF-16; reviewer evidence was normalized to UTF-8 after a failed JSON read. Neither issue modified product behavior or hid FKT-1.

## Actual candidate accounting

| Metric | Baseline v02 | Proposal v02 |
| --- | ---: | ---: |
| Raw bytes | 667,520 | 673,348 |
| Asset-only gzip estimate | 399,240 | 399,953 |
| Asset-only Brotli estimate | 368,035 | 368,525 |
| Unique / placed triangles | 5,988 / 7,272 | 5,988 / 7,464 |
| Shadow-eligible triangles | 2,124 | 2,316 |
| Primitive / shadow-eligible instances | 122 / 57 | 138 / 73 |
| Attached mesh / live blocker counts | 122 / 113 | 138 / 129 |
| Materials / textures | 10 / 5 | 10 / 5 |
| Encoded image bytes / pixels | 325,195 / 425,984 | 325,195 / 425,984 |

This is M1 blockout evidence. Author manifests report grey proxies and four unrepresented cable-group asset IDs; final-kit completeness/native mouse quality is not established. Geometry/primitive inventory cannot prove <=200 renderer calls, <=200,000 rendered triangles or <=1.5MB compressed scene JS plus assets. Root's separate receipt records22 development captures; this reviewer did not operate or approve those images. Root retains actual browser/GPU, first-refresh/settled shadow costs, transfer, control/lifecycle, framing and visual gates. Configured missing TypeScript ESLint-plugin remains the author's existing tool gap; fresh author tests do not replace configured lint or authorize installation.

## Reviewed identities and handoff

All full hashes, including author manifests, unchanged pilot profile, held controller/resources/picker and failed v01 assets, are in [probe evidence](scene-coordination/full-kit-review-probes.json). Principal SHA256 values:

| File | SHA256 |
| --- | --- |
| `load-full-kit.ts` | `d30e468d2b69fa08fbe1c2e1ca22380bebfd9f1323888f16153d8485a04e0ca2` |
| `bind-full-kit.ts` | `0ee8bbe6e0fb83ab4bf219343655c4260a8f5193f5624dc69fb802634a2294eb` |
| `full-kit-types.ts` | `19269dc5acf09fc9ebac3de6b5ac37157608b258a1b0ac288a85fd13021a4a56` |
| `build-full-studio.ts` | `5a4e8296e04d66cfeaedf59bedee8c633b378c84126de52b78eaabe421c0f02f` |
| `profile-core.mjs` | `b92e0ccabc6324a5f3a48b29ce9a9e075c0a1de23bb3a2f63a51dff0d800c742` |
| `validate-full-kit.mjs` | `9a502413330618de8ac126a02b2826aae76b36f46ce3f0a51d36da0f06311e5e` |
| `full-kit-profile-v1.json` | `7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052` |
| `full-kit-contract.md` | `f6749989a3fd25c224ae33ea6aa75499558719f8f713bec7effcb37d18cd9651` |
| Baseline v02 GLB | `04994845f62236c6230dce1ba8af7d9811e21fc1e45c0fff6a89be7f06777093` |
| Proposal v02 GLB | `bdc997b45917be0c72480af9738362e9940e5159b07781eac2bfa6b86b01fe76` |

S should route FKT-1 to the implementation author, then request independent re-review on repaired hashes. This assignment is a completed review with REQUEST CHANGES, not a failed-to-execute review or overall product completion.
