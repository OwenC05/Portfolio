# Studio v2 bounded pilot runtime technical report

Status: assembled implementation and targeted verification complete; independent runtime review pending. **81/81 CPU tests pass**, scene-rooted TypeScript passes, and supplemental Next lint passes. Configured lint still fails before linting because the existing TypeScript ESLint plugin is missing. This is not final visual, browser/device, performance or product acceptance.

## Assignment and scope

Actual provider Codex, no model/effort override or helpers. New task task_04f40fdd7d24 / dispatch ctx_339118fd265b; worker term_987fbf3a38c29c74e7bad4e6357f881e; S coordinator term_d778dd3c-3d00-45ad-b8a3-c9fdcaee8e94. Earlier task task_e9f6c6456600 is settled; this report uses only the new dispatch.

Read the released runtime-technical-task.md/runtime-contract.md, frozen pilot profile/integration contract and offline independent approval, current StudioPilotAsset interface and installed Three r187 loader implementation. Changed controller.ts and verify-controller.mjs; added load-pilot.ts and verify-pilot.mjs; copied the exact approved v03 bytes to public/studio/pilot-right-limit-v03.glb. All other writes are scene-runtime-technical*.md evidence/report files. resources.ts and StudioScene.tsx required no changes. No model/art/types/lib/UI/CSS/content/package/configuration changes; no build, server, browser, generation, helper or deployment.

The public candidate and source both hash to 2B9A4182C3024485680C1E066C8A22EF0DC0F541ACCA4BD958486BCED2C4063E. The copy command checked the source and refused a differing existing destination; no conflict occurred. Source/v02/offline profile and validator were preserved.

## Runtime behavior

The controller creates the renderer, canvas and subscription owner immediately, reports loading, and starts one loader request per controller. A private generation plus disposed guard fences asynchronous success/failure. Disposal invalidates that guard before aborting fetch; a stale success disposes its asset without model attachment, render or status callback. A load, assembly, first-render or context failure uses the existing unavailable path exactly once and independently releases procedural and imported ownership. There is no procedural fallback after a pilot error. The adapter, camera/input/selection/trusted-click semantics and HTML contract are unchanged.

After the valid pilot resolves, createStudio receives its already-placed root. Only a successful visible nonzero render publishes ready. Hidden/offscreen/zero-size hosts stay loading. Current selection and queued commands are applied from current controller state, including disabled consumption and high-water sequence behavior during loading. Selection after ready remains synchronous at trusted click; no network or animation is inserted into reading-panel activation.

loadStudioPilot fetches exactly /studio/pilot-right-limit-v03.glb and creates a private installed GLTFLoader/parser. The frozen JSON profile is imported without editing it. Pre-root checks require the nine exact direct named nodes, expected named materials, baked identity placement, static triangle attributes, embedded PNG/JPEG, allowed extensions and valid occlusion/shadow metadata. Loaded checks enforce the actual root/mesh structure, opaque expected materials, finite geometry/material values, geometry/image limits and profile metre envelopes. Required decoded slots are checked explicitly: oak map, linen map and linen emissiveMap. Every present texture slot must have a nonempty bounded image. This handles the installed r187 behavior where loadTextureImage catches image failure and resolves null rather than rejecting parseAsync.

The returned private Group applies scale(2,2,2) and translation(0,0.11,0) exactly once, with no rotation/recentering/camera fitting. Imported roughness, metallic factors, sidedness, colours, emission, UVs and normals remain authored data. castShadow comes from nocast independently of opaque occlusion; receiveShadow is true. The actual candidate keeps nine distinct geometry/material pairs after model batching, and all nine meshes, including its non-shadow-casting bulb, remain live opaque blockers. The model owner handles pre-batch procedural omission; this performer did not edit the model.

## Partial ownership strategy and installed-source boundary

Installed GLTFLoader.js observations: parser.parse starts concurrent dependency work; loadGeometries allocates BufferGeometry before asynchronous accessors settle; loadMaterial allocates after its material parameters resolve; assignFinalMaterial can create another material; loadImageSource caches/clones textures and only revokes its object URL on success; loadTextureImage catches image rejection and returns null. A successful-result traversal alone cannot cover these failure paths.

The bounded per-parser hooks therefore:

- register each geometry before waiting on the original loader's accessors, using the pilot's plain indexed/nonindexed position/normal/UV triangle path;
- register dependency results and final mesh materials, including shared material identities and all material texture-valued slots;
- allocate/own source textures before image decode, clone and register textures when the source is reused, and avoid global image caches;
- acquire decoded ImageBitmaps privately with colourSpaceConversion none and premultiplyAlpha none, preserving loader texture colour/sampler handling;
- use private object URLs with finally-revocation and abort/listener cleanup for the HTMLImage fallback;
- close only bitmaps actually acquired by this decoder, never an image merely referenced by a texture.

The owner tracks pending dependency/image work. Failure marks it closed immediately, while release waits for already-started sibling promises to settle. This prevents a bitmap from closing before its last owned texture consumer is released. Then every unique geometry, material and texture is released once, followed by every unique owned bitmap once; throwing releases cannot prevent other releases. A non-cancellable bitmap decode can finish after abort, and its returned image still enters that owner and is released. The controller need not wait for late parsing to suppress attachment/callbacks. Cache references are private to the request/parser and become unreachable after pending work settles; there is no shared asset/cache framework.

These hooks are deliberately tied to the installed Three 0.187 loader and frozen pilot, not a generic glTF importer or replacement offline validator. An upgrade or new asset profile needs re-review. No GPU/heap reclamation is inferred from disposal event counts.

## Targeted verification

| Command | Result | Evidence |
| --- | --- | --- |
| node --test components/studio/scene/verify-controller.mjs components/studio/scene/verify-pilot.mjs | Exit 0; 81 tests, all pass, zero fail/skip | scene-runtime-technical-tests-final.md |
| node components/studio/scene/verify-types.mjs | Exit 0; zero scene/import-root diagnostics, no emit/incremental files | scene-runtime-technical-types.md |
| node node_modules/eslint/bin/eslint.js components/studio/scene/controller.ts components/studio/scene/load-pilot.ts | Exit 2; existing missing @typescript-eslint/eslint-plugin | scene-runtime-technical-lint-configured.md |
| Installed ESLint API, in-memory next/core-web-vitals and installed TypeScript parser, four owned source/test files | Exit 0; zero errors/warnings | scene-runtime-technical-lint-supplemental.md |

The supplemental invocation uses new ESLint({useEslintrc:false,cache:false,overrideConfig:{extends:['next/core-web-vitals'],parser:require.resolve('@typescript-eslint/parser')}}). It lints controller.ts, load-pilot.ts, verify-controller.mjs and verify-pilot.mjs, prints each file's messages/counts, and exits nonzero for any warning/error. It edits no config and does not replace the missing configured rules. All retained shell test/lint wrappers append and return the actual node LASTEXITCODE.

The controller suite retains the previous 54 regressions, now awaiting real Promise completion in its fixture rather than assuming synchronous model construction. Seven additional cases cover loading/first-render visibility, latest pre-ready state, unmount/late resolution, context loss/late rejection, explicit load/attach/render failure, separate remount generations and throwing pilot cleanup. Its loader is a controllable Promise fixture; it does not claim actual asset decode. Existing input, pen compatibility-focus, command, picking and resource assertions remain intact, including the prior in-memory click-guard sensitivity check adapted to await the selected async test.

The 20 loader checks use **the exact public GLB and real installed GLTFLoader/accessors/material parsing/raycastable geometry**, with explicitly synthetic decoded images. They prove original material emission/sides, one coordinate adapter, nine live post-batch blockers, procedural/imported separation, shared brass identity, HTTP/metadata/map/emissive/empty-image/transform/accessor/material failures, late decode after abort, delayed fetch, independent throwing releases, and no sharing between separate mounts. Additional tests observe geometry/texture allocations at construction, including resources that never enter a parsed result, and prove cleanup of a partial parse failure while a sibling decoder is still pending. Another case shares one bitmap across textures and extra material slots, then verifies single disposal after its last consumer and that a borrowed image remains open. HTML-image success/failure/abort fixtures verify every object URL is revoked and all handlers removed.

Image stubs are not PNG/JPEG decoding evidence. They read the real PNG dimensions (or provide controlled HTML-image dimensions) so actual parser/resource behavior can be tested without a browser. The allocation-observation facade and prototype dispose hooks exist only in the isolated CPU test process; production uses ordinary Three objects and private parser hooks. Event trust/propagation and React effects in controller fixtures remain modeled; browser/device and real StrictMode proof stay with root/I.

## Retained failures and repairs

- Initial scene typecheck, tool chunk 1b18ec, exit 1: three ES5-target Set/iterator iteration errors and two resulting indexing errors. Replaced those iterations with Array.from/array forEach; subsequent typecheck exits 0. This was before assembled-ready/capture.
- scene-runtime-technical-loader-first.md, exit 1: test VM omitted esModuleInterop for the profile's default JSON import. Initial rejection assertions were too broad; the test now uses the project's interop semantics and checks each expected error cause. Those early apparent negative passes are not used as evidence.
- scene-runtime-technical-loader-second.md, exit 1: the transform fixture edited matrix directly, which the actual loader overwrote from unchanged TRS. The fixture now changes scale, independently producing the intended nonidentity node and rejection.
- scene-runtime-technical-loader-partial.md, exit 1: the two-mount ownership assertion incorrectly required a first mount's bitmap to outlive unrelated second-mount textures. It now checks the last consumer of each particular bitmap; the corrected ownership test passes.
- scene-runtime-technical-lint-supplemental-first.md, exit 1: a test-local variable named module violated the installed Next rule. Renamed it pilotModule; final lint and 81-test run pass. No runtime source changed for that repair.

Intermediate passing controller/loader logs remain beside the final evidence, including allocation and pending-sibling cases. No failed evidence was deleted or represented as a passing runtime check.

## Root handoff and independent-review state

Assembled-ready was sent before exhaustive verification as msg_7f64b9be2120. S imposed root's short capture freeze in msg_2caccf57569b; only tests/reports changed during that window. S ended the hold in msg_5472fa960ded and reported 15 actual v03 browser images plus real image decode/ready at 1440/390/320, with no page errors/overflow and full panels. Those are **coordinator-reported root results**, not browser actions or visual judgment performed by this worker. Root's corrupt-PNG check and any later artist material/light tuning remain separate evidence.

Current product controller/loader hashes still equal the initial capture hashes CC76055E... / B5CD61C6...; no technical runtime source was changed during or after that capture. Root/Claude may change the art-owned model separately; final integration evidence must bind its current hash. Independent runtime Codex review is pending through S. No final product acceptance or worker_done is asserted before the review handoff settles.

## Source snapshot after final checks (SHA256)

| File | SHA256 |
| --- | --- |
| components/studio/scene/controller.ts | CC76055EA4BFE596E0D3AB49C84CA55C55B8A9BAD3B33627E08ADEB78F0969F0 |
| components/studio/scene/load-pilot.ts | B5CD61C682DD69D2336B10B508B516999E72D73A00EDBD6E2CEBCF0323D39D11 |
| components/studio/scene/verify-controller.mjs | 3E31288159AFDF35C3E17CF6E75446ADDD64011A839CC366BA86B247B37891F3 |
| components/studio/scene/verify-pilot.mjs | 8B0E9B33EF874DDD412CD92FD99B60420F8F8263FD32CDB7C9D96C3E9C3AD295 |
| components/studio/scene/resources.ts | 756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509 |
| components/studio/scene/types.ts | 5AA65F769BD2077BD6A16CC5834EF1B47DB5C76B6A4E0FF1ABDA226892178364 |
| components/studio/scene/picking.ts | C427B0553DD2403500F7AC0E306A42C5B1476A6A8AB3175186704261D638261C |
| components/studio/scene/build-studio.ts | E23588E2702ECE52C5B8A2ED25ADB2DEBAC366FDF90C66609A5EF4299FFC11AE |
| components/studio/scene/view-config.ts | 1FEA7ADBCFD730A56920389C8AC4ECF8323C9739FD4882C15F3E134A11F1A450 |
| components/studio/StudioScene.tsx | 29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC |
| public/studio/pilot-right-limit-v03.glb | 2B9A4182C3024485680C1E066C8A22EF0DC0F541ACCA4BD958486BCED2C4063E |
| design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json | 02A9B364ED42127988747660AC61D6EFCA8BC3AF9F151A0E41EB0D50BC0BAA08 |
| node_modules/three/examples/jsm/loaders/GLTFLoader.js | 532AC726E120039ACBCD6CF54328C57ACBF7B438176AFAA6951257126D11BFF1 |

### Concurrent art-model delta bound after the full test run

The 81-test full run finished at 00:49:50 UTC against model D8ABF67F6C25DDADB0EBA3A1B43DF372EB132F5B35AA6867A3A0F573701E2DD6. Claude's authorized first tuning pass landed afterward (file modification 00:50:25 UTC), producing the E23588E2702ECE52C5B8A2ED25ADB2DEBAC366FDF90C66609A5EF4299FFC11AE model in the snapshot above. I inspected only its resource/attachment implications: existing owned materials are adjusted in place, with no new geometry/material/texture allocation or change to opaque blocker status. Artistic judgment remains Claude's.

Fresh bounded command `node --test --test-name-pattern 'exact approved public bytes|sibling model integrates|A1 actual art|S-T3 actual' components/studio/scene/verify-controller.mjs components/studio/scene/verify-pilot.mjs` exited 0, four selected checks passed. It rechecked the actual GLB attachment/ownership/live blockers, actual monitor reachability, right-limit negatives and omission inventory against the new model. `scene-runtime-technical-art-delta.md` records matching before/after E23588E hashes. A fresh scene-rooted TypeScript run also exited 0 with zero diagnostics (`scene-runtime-technical-types-art-delta.md`). Controller, loader, test scripts and copied GLB remained unchanged. The earlier 81-test result and this focused model-delta evidence are separate; the initial full run is not mislabelled as a full rerun on E23588E.
