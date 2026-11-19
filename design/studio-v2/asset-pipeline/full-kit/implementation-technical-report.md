# Full-kit isolated implementation evidence

15 November 2026. Actual Codex, task `task_2cb1e5863a38`, dispatch `ctx_adc0f884d8d6`; assignment ACK `msg_b3746e9df029`. No helpers or model overrides. This is bounded implementation evidence, not full G003/product acceptance.

The frozen `loadFullKit(signal): Promise<StudioFullKitAsset>` and `bindFullKit(resources, root): FullKitBindings` are implemented. Existing `StudioTarget` and `StudioModel` public shapes are unchanged. Production is not wired: the loader explicitly selects an uninstalled synthetic URL and its fixed manifest. Root received adapter-ready `msg_7f66919a36eb`, exact v02 validation `msg_5d02952d356d`, and preview guidance `msg_0e124ac76d2b`.

## Files and behavior

- `components/studio/scene/full-kit-types.ts`: two frozen interfaces and a weak identity certificate for a fresh imported root; no shared resource cache.
- `components/studio/scene/load-full-kit.ts`: hash-bound candidate selection, shared byte preflight before actual r187 parse, allocation-time ownership, linked mesh identities, real COLOR_0 allocation, post-parse required texture checks, one scale2/+0.11 placement and idempotent cleanup without rescanning rebound materials.
- `components/studio/scene/bind-full-kit.ts`: exact validated faces use existing `screenTexture`, four runtime unlit materials and three exclusive highlight materials. Replaced imported placeholders remain in the private owner. Dusk remains the same opaque blocker; imported contacts retain order1. Every other opaque leaf, including nocast and decorative display, stays in the live blocker superset.
- `components/studio/scene/verify-full-kit.mjs`: focused synthetic/adversarial tests and optional exact-artist-candidate installed-loader checks.
- `technical/profile-core.mjs`: browser-safe GLB/accessor/image-header/material/tree/transform/metadata/quad/UV/corner checks shared by runtime and CLI. Manifest fields are compared against byte-derived facts. Optional RGB is finite unit-range VEC3 FLOAT or normalized unsigned byte/short on the three allowed materials. Alpha and unsupported attributes/extensions remain rejected.
- `technical/validate-full-kit.mjs`, `export-manifest.mjs`: separate executable validator and technical manifest serializer. The latter authors no Blender/appearance data. A generated manifest is an input to independent recomputation, never validation proof.
- `technical/synthetic-fixture.mjs`, `fixtures/**`: small labelled baseline/proposal GLBs, manifests, linked geometry and shared-image texture cases; not room assets.
- `technical/decode-images.py`, `preview-handoff.md`, `evidence/**`: actual native image decode, exact root preview call/constant guidance, test logs, validator reports and source hashes.

The frozen pilot source/profile were not edited. Narrow allocation hooks were copied into the isolated loader because extraction would cross current ownership; a shared ownership utility can be proposed to that owner after review. No controller/resources/picking/UI/public installation/configuration/dependency/deployment/commit edits, build, server, browser, Blender or paid job were performed.

## Actual candidate results

Both v01 exports were rejected for V-inverted reserved-plane UVs. Exact accessor evidence was reported in `msg_97de996b863e`; Claude retained v01 and authored v02. The validator was not weakened to admit the inversion. All eight v02 reserved quads satisfy the local +Z, CCW, upright-UV geometry requirements and exact baseline/proposal coordinates.

| Measurement | Baseline v02 | Proposal v02 |
| --- | ---: | ---: |
| Raw GLB bytes | 667,520 | 673,348 |
| Gzip estimate, asset only | 399,240 | 399,953 |
| Brotli estimate, asset only | 368,035 | 368,525 |
| Unique geometry triangles | 5,988 | 5,988 |
| Placed triangles | 7,272 | 7,464 |
| Shadow-eligible triangles | 2,124 | 2,316 |
| Primitive instances | 122 | 138 |
| Shadow-eligible instances | 57 | 73 |
| Materials / textures | 10 / 5 | 10 / 5 |
| Embedded image pixels | 425,984 | 425,984 |
| Encoded image bytes | 325,195 | 325,195 |
| RGBA bytes before mipmaps/copies | 1,703,936 | 1,703,936 |

Baseline GLB SHA256 `04994845f62236c6230dce1ba8af7d9811e21fc1e45c0fff6a89be7f06777093`; proposal `bdc997b45917be0c72480af9738362e9940e5159b07781eac2bfa6b86b01fe76`. Both author-owned matching manifests pass the CLI, not just the independently generated technical supplements. Exact source/manifest/profile hashes are recorded in `technical/evidence/source-hashes.json`.

These are M1 blockouts, with 72/88 grey proxies and 55 of 59 inventory asset IDs represented according to the author manifest; no final-kit completeness is claimed. Exact bounding boxes are in the validation receipts. Primitive/caster counts are **not renderer draw measurements**. Unique sharing is resource reuse, not a draw reduction.

## Verification

`technical/evidence/checks.json` records commands and exits; logs are beside it.

| Check | Result and scope |
| --- | --- |
| `node --test --test-reporter=tap components/studio/scene/verify-full-kit.mjs` | 44/44 pass; synthetic fixtures use actual installed r187 loader and real Three CPU geometry/picker. |
| Same test with `FULL_KIT_CANDIDATE` set to each exact v02 export, `FULL_KIT_VARIANT=baseline` or `proposal`, `--test-name-pattern=exact author candidate` | 1/1 each; actual author bytes parse, bind, preserve shared geometry/material identities, include exact blocker inventory and release imported ownership. |
| `node technical/validate-full-kit.mjs <v02.glb> <author-v02.manifest.json> --report <evidence>` | Exit0 both; reports `m1-*-v02-author-manifest.validation.json`. |
| `python technical/decode-images.py <baseline-v02.glb> <proposal-v02.glb>` | Actual Pillow12.3 decoding and RGBA materialization succeeds on all five embedded PNGs in each candidate. |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false` | Exit0. |
| Configured ESLint on new adapter TypeScript files | Exit2 in final captured run: existing missing `@typescript-eslint/eslint-plugin`; no installation/config change. |
| Supplemental installed `next/core-web-vitals`, project config disabled, installed TS parser, eight assigned TS/MJS files | 0 errors / 0 warnings. Does not stand in for unavailable configured TypeScript-plugin rules. |

The focused checks cover RGB FLOAT/U8/U16 actual allocation plus alpha/range/NaN/material/layout negatives; linked clones and shared bitmap consumption; exact baseline/proposal face/border coordinates; upright UV/winding/overlapping triangles; hierarchy/reflection/shear/double transform; forged manifests/bounds; arbitrary opaque omission and generic interactive loopholes; nocast blockers; instance/ancestor visibility; a rendered opaque target back under an expanded finger; near/behind-camera/nonfinite picking; required-null slots after swallowed image failure; partial accessor/material failure; late decode/postparse abort; throwing cleanup; independent repeated loads; HTMLImage fallback URL/handler release; and runtime replacement-material isolation.

The loader harness deliberately stubs `createImageBitmap`/HTMLImage and Canvas2D. It proves parser/resource/picking behavior, not browser pixel decode or text appearance. Native Pillow decode is separate real decoder evidence, not browser/ImageBitmap or GPU evidence. Existing81 integration tests were not rerun because held controller/picking/pilot production paths were unchanged. One added near-crossing test initially used an exact valid visible hit; its probe was corrected to the independently clipped centre. No product behavior was changed to satisfy that test.

## Handoff and remaining gates

Root requested source stability during preview in `msg_e0af72fa1da8`; loader, binder and shared validator source remain held. `technical/preview-handoff.md` gives the paired URL/manifest substitution and assembly call. Claude owns `createFullStudio`, lights and dusk appearance. No production candidate, FOV or target variant has been selected by this worker.

Independent Codex review is **pending**: coordinator reported reviewer dispatch `ctx_a52f1856e522` failed startup at `agent-hooks-review-prompt` before execution. No reviewer verdict is inferred; no hooks were bypassed or reconfigured. Root owns recovery/review routing, browser decoding/WebGL captures, actual target-clearance/appearance verdict, and first-refresh/settled renderer/network measurements.

Hard limits remain 1,500,000 compressed bytes for scene JS plus assets, 200 peak renderer draws and 200,000 rendered triangles. No runtime total, scene-JS headroom, GPU reclamation, visual acceptance or overall product completion is established by these bounded outputs.

## FKT-1 bounded repair, 15 November 2026

Writer: actual Codex, task `task_0c3dd6b3f781`, dispatch `ctx_e0fa565b92d1`, ACK `msg_62a844ece892`. The exact terminal's running `codex.exe` PID 7712 argv verified `-m gpt-6-astra -c model_reasoning_effort=high`; worker-show verified live/input_accepted. No helpers. This section supersedes the historical pending-review status above: independent review `task_b2b62a79af12` / `ctx_70b616d3a242` found FKT-1 and requested changes. This repair is ready for independent re-review, not independently approved or overall complete.

The shared manifest checker now compares the raw inventory SHA256 with the frozen source identity and enforces final inventory coverage and absence of proxy flags/names. Runtime and CLI both use it. The runtime also hashes canonical bundled inventory JSON against a separate pinned digest, so an altered JSON import cannot silently inherit the raw-byte identity after bundling removes whitespace. CLI retains the actual source-byte comparison and checks the same canonical identity. Regression checks bind both pins to the actual frozen source file. Inventory revisions must deliberately update both pins; no profile, contract, inventory, manifest or GLB was changed.

Stage and variant use exact admitted values. Existing M0-M6/synthetic admission remains; M1 permits the current proxies and missing later gear. Final still requires every one of the 59 inventory IDs and no proxy flag or proxy name. A structurally complete synthetic final is only a semantics control, not proof of final artwork, native mouse quality or visual completeness.

Only four implementation/test files changed:

| File | Repaired SHA256 |
| --- | --- |
| `components/studio/scene/load-full-kit.ts` | `37549d60af2eb7f5e1feaf0914fd0da496ec38441ebe088ce445d2914b5ad68f` |
| `components/studio/scene/verify-full-kit.mjs` | `ea836ba70da71020ba78b70b78311b46d2eacec798da4f8163e7b03a54b3b531` |
| `technical/profile-core.mjs` | `02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71` |
| `technical/validate-full-kit.mjs` | `66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75` |

This report and additive `technical/evidence/fkt1/**` receipts are the remaining writer outputs. Original reviewer probes/results and the earlier implementation evidence remain untouched. Before/after hash receipts include both v01/v02 GLBs and manifests, profile/inventory/contract, held scene sources, and original reviewer evidence. Accepted v02 hashes remain baseline `04994845f62236c6230dce1ba8af7d9811e21fc1e45c0fff6a89be7f06777093` and proposal `bdc997b45917be0c72480af9738362e9940e5159b07781eac2bfa6b86b01fe76`.

| Fresh check | Result |
| --- | --- |
| Pre-repair `node --test --test-reporter=tap --test-name-pattern=FKT-1 components/studio/scene/verify-full-kit.mjs` | 27 cases: 18 pass, 9 fail; preserved in `before-regressions.tap`. The reported zero-hash and incomplete-final mutations reproduce on unchanged synthetic bytes and both real M1 candidates. PowerShell's final Get-Content masked the shell exit; TAP failures are explicit, not a passing-command claim. |
| Repaired `node --test --test-reporter=tap components/studio/scene/verify-full-kit.mjs` | Exit0, 72/72. Includes exact author baseline/proposal M1 manifests through validator, installed loader and binder, metadata rejection before parser allocation, exact stage/variant negatives, bundled inventory drift, complete synthetic final positive, and final proxy-flag/name negatives. |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false` | Exit0. |
| CLI `technical/validate-full-kit.mjs` against each actual v02 GLB and its author manifest | Exit0 both; full command/args and reports in the new evidence directory. |
| Configured ESLint on changed loader | Exit2: existing missing `@typescript-eslint/eslint-plugin`; not repaired or bypassed in project configuration. |
| Supplemental ESLint API, `useEslintrc:false`, `next/core-web-vitals`, installed TypeScript parser, all four changed TS/MJS files | 0 errors, 0 warnings; supplementary only. |

The 28 added checks include two actual M1 positives; metadata mutations preserve the correct original GLB hash and assert the specific matching runtime/CLI rejection. Final proxy cases include all 59 IDs, so missing-inventory rejection cannot hide the proxy guard. ImageBitmap/Canvas2D remain labelled CPU shims; no browser/server/build/Blender/generation or fresh pixel/GPU evidence was used. Binder, types, production/controller/pilot/UI/configuration/dependencies remain untouched. Existing nonblocking trusted-root mutation observations are outside this assignment. Sources are held for S's independent re-review; root retains all integration, M2 and final acceptance decisions.
