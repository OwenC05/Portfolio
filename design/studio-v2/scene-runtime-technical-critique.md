# Independent runtime technical critique

**APPROVE — bounded async pilot integration. No blocking technical finding.** This verdict covers the exact controller, loader, model, public GLB and tests below. It does not grant artistic, performance, production, device or final product acceptance.

Reviewed 15 November 2026 by the independent Codex reviewer, task `task_73fa4e160358`, dispatch `ctx_e14be999996e`. Current-task ACK was sent as `msg_3a740aaea350`. No helpers, product edits, browser, server or build were used. Earlier S-T1/S-T2/S-T3 findings and repair evidence remain historical records, unchanged. Repairs, if subsequently needed, belong to S and the original owning performer.

## Ranked assessment

1. **PASS: partial allocation ownership and late settlement.** `components/studio/scene/load-pilot.ts:18–77,139–184,246–283` covers resources before a successful scene exists. Geometry and source textures are registered at allocation; dependency results and final material clones enter the same private owner. Parse, accessor and image promises keep that owner pending. Failure closes it, but actual release waits for outstanding work, then releases each unique geometry/material/texture before its owned bitmap. Independent throwing releases cannot prevent the remaining releases. The reviewer observed allocations, material clones and real disposal events, rather than treating a returned scene traversal as the inventory. A deliberately rejected sibling material plus a gated shared decode produced **zero early releases**, then 27 unique resource disposals and one bitmap close after the gate. The successful positive produced 28 unique disposals and exactly one shared bitmap close; repeated asset disposal was inert. Abort after decode began rejected with `AbortError` and released all three late decoded images. A post-parse zero-width image rejected and released all allocations. Evidence: `scene-coordination/runtime-technical-critique-probes.json` and the separate final-model repeat `runtime-technical-critique-probes-model-final.json`.

2. **PASS: installed r187 hooks and decode failure semantics.** The review checked the installed `node_modules/three/examples/jsm/loaders/GLTFLoader.js`, not a remembered upstream API: parser concurrency at 2750–2813, cached dependencies at 2986–3115, texture completion/error handling at 3347–3397, source-image loading at 3401 onward, final-material clones at 3574–3660, and geometry allocation at 3865–3930. In particular, `loadTextureImage` catches decode failure and can yield `null`; parse success alone is insufficient. `load-pilot.ts:187–241` independently requires decoded oak base and linen base/emissive maps, valid dimensions, loaded material/geometry properties and baked placement. The custom plain-triangle path keeps installed accessor/material processing and preserves the tested UV/normal data. Its private image path leaves r187 sampler, `flipY=false` and sRGB slot handling in place. The real-GLB positive verified those texture settings and the imported bulb's original double side/emission before art tuning. `decodeImage` at 116–136 acquires bitmap ownership before checking a late abort; modeled HTML-image success, error and abort left no object URLs, handlers or abort listeners. These hooks are deliberately specific to installed r187 and this frozen profile; a Three upgrade or new asset profile needs a new review.

3. **PASS: asynchronous state and controller lifecycle.** `controller.ts:72–105,121–163,421–450` invalidates the controller before aborting, rejects stale attachment, independently releases owners, and publishes ready only after the first successful visible nonzero render. Five selected new author tests passed under independent execution: hidden/zero/offscreen readiness with visible positive controls; latest selection and command consumption while disabled/loading; unmount followed by late success; load/assembly/render failure without fallback; and separate remount generations. The state test observes the resulting camera yaw and selected border, then proves a duplicate sequence does not replay. The stale-success test observes no assembly, render or extra callback. **Sensitivity control:** changing only the stale-success guard to `if (false)` in memory makes that test fail with one model assembly where zero is required; the unmodified test passes. No source was mutated. Evidence: `runtime-technical-critique-controller-probes.mjs/.json`. The author's two remaining new cases cover pending-load context loss/late rejection and throwing pilot disposal. Existing input/picking tests remain in the suite; this review does not repeat their entire earlier acceptance.

4. **PASS: actual GLB placement, batching and separate owners.** The probe parses the exact 585536-byte public v03 with the installed loader, not nine stand-in boxes. All nine meshes and 5528 triangles are present; independently computed sample vertices satisfy `world = 2 * local + (0, 0.11, 0)`. `load-pilot.ts:266–271` supplies the sole adapter; `build-studio.ts:603–612` attaches that root unchanged once. The two procedural groups are skipped before batching at 261 and 270. With the actual model/batching, all nine imported objects remain attached live occluders, including the non-shadow-casting bulb, and none of their geometry/material identities enters `SceneResources`. Procedural disposal releases none of the imported allocations; asset disposal releases them once. The final E23588E model delta only adjusts existing material values and practical lighting; it adds no geometry/material/texture ownership, changes no imported transform or opaque blocker property, and adds no shadow caster. The controller still enforces exactly one static shadow light at 434–443. Loader preservation of authored values is distinct from Claude's authorized subsequent material tuning; no aesthetic verdict is made here.

No high, medium or low actionable defect was reproduced within this bounded review. The version/profile coupling and remaining external gates below are explicit limits, not requests for a generic importer or a new validation framework.

## Executed evidence and author verification

Reviewer commands ran under Node `v24.21.0`, Three revision `187`. Each probe verifies its source hashes remain unchanged during execution. File reads and SHA-256 inspections completed with exit 0.

| Provenance / command | Result and scope |
| --- | --- |
| Reviewer: `node design/studio-v2/scene-coordination/runtime-technical-critique-probes.mjs` | Exit 0; seven independent scenarios. Initial evidence retained in `runtime-technical-critique-probes.json` against model D8ABF67F. Real parser/geometry/materials; image decoding and DOM modeled. |
| Reviewer: `node design/studio-v2/scene-coordination/runtime-technical-critique-controller-probes.mjs` | Exit 0; five positive baseline tests and the expected failing stale-guard mutant. Evidence in matching JSON; controller CC76055E / suite 3E312881. |
| Reviewer: `node design/studio-v2/scene-coordination/runtime-technical-critique-probes.mjs > design/studio-v2/scene-coordination/runtime-technical-critique-probes-model-final.json` | Exit 0; seven scenarios pass again against model E23588E, sources stable. This bounded repeat was required by the concurrent model change. |
| Author: `node --test components/studio/scene/verify-controller.mjs components/studio/scene/verify-pilot.mjs` | Retained final log: exit 0, 81/81 tests, no skipped tests, 7621 ms. This full run used model D8ABF67F; it is not a full run on E23588E. |
| Author: `node --test --test-name-pattern 'exact approved public bytes\|sibling model integrates\|A1 actual art\|S-T3 actual' components/studio/scene/verify-controller.mjs components/studio/scene/verify-pilot.mjs` | Retained art-delta log: exit 0, four selected checks pass with matching before/after E23588E hashes. |
| Author: `node components/studio/scene/verify-types.mjs` | Initial and art-delta logs: exit 0, zero scene/import-root diagnostics, no emit. |
| Author: `node node_modules/eslint/bin/eslint.js components/studio/scene/controller.ts components/studio/scene/load-pilot.ts` | Exit 2 before linting: existing missing `@typescript-eslint/eslint-plugin`. This remains a validation gap. |
| Author: installed ESLint API with `useEslintrc:false`, `cache:false`, `next/core-web-vitals` and installed TypeScript parser | Retained four-file supplemental log: exit 0, zero errors/warnings. This does not supply the missing configured rules. Exact invocation is recorded in the technical report. |

The current author suite contains 61 controller and 20 loader cases. Its loader tests now observe geometry/texture construction before result publication and check per-bitmap last-consumer ordering across independent mounts. Error assertions distinguish the intended failure causes. The independent reviewer additionally observes material cloning and demonstrates a guard-sensitive negative with positive controls. Earlier failed fixture/type/lint runs remain preserved and explained in `scene-runtime-technical-report.md:57–63`; they are not counted as passing evidence. No redundant full-suite rerun was performed by the reviewer.

## Root browser evidence and limits

These are inspected **root-owned receipts**, not browser actions performed by this reviewer:

- `.omx/context/studio-pilot-runtime-capture-v01.json`: 15 development Chromium records at 1440/390/320, GLB 200 and ready, bound to D8ABF67F.
- `.omx/context/studio-pilot-runtime-capture-v02.json`: 15 ready records bound to current E23588E, loader B5CD61C6 and controller CC76055E. Receipt inspection does not judge the rendered appearance.
- `.omx/context/studio-pilot-png-failure-v01.json`: actual corrupted embedded PNG IDAT with retained GLB bounds/header and repaired CRC reaches unavailable with zero canvases, while Dissertation reading, focus, Escape and shortcut behavior remain available; no recorded page errors. This supplies real browser decode rejection evidence absent from the CPU decoder stubs.
- `.omx/context/studio-pilot-lifecycle-failures-v01.json`: delayed response released after same-document unmount leaves no canvas or late scene; actual `WEBGL_lose_context` preserves the open panel and recovery interaction. No recorded failures. The delayed-response DOM result does not prove parsing completed or resources were reclaimed.

The failure receipts identify controller/loader/GLB hashes, not a model hash; no broader model claim is inferred from them. They are development-browser evidence, not production/device coverage. CPU disposal events and bitmap-close observations do not prove GPU memory or heap reclamation. No sustained performance, hardware, native-touch, production bundle or full React integration claim is made by these reviewer probes. Artist and root acceptance remain outside this verdict.

## Exact reviewed snapshot (SHA-256)

| File | SHA-256 |
| --- | --- |
| `components/studio/scene/controller.ts` | `CC76055EA4BFE596E0D3AB49C84CA55C55B8A9BAD3B33627E08ADEB78F0969F0` |
| `components/studio/scene/load-pilot.ts` | `B5CD61C682DD69D2336B10B508B516999E72D73A00EDBD6E2CEBCF0323D39D11` |
| `components/studio/scene/build-studio.ts` | `E23588E2702ECE52C5B8A2ED25ADB2DEBAC366FDF90C66609A5EF4299FFC11AE` |
| `components/studio/scene/verify-controller.mjs` | `3E31288159AFDF35C3E17CF6E75446ADDD64011A839CC366BA86B247B37891F3` |
| `components/studio/scene/verify-pilot.mjs` | `8B0E9B33EF874DDD412CD92FD99B60420F8F8263FD32CDB7C9D96C3E9C3AD295` |
| `components/studio/scene/resources.ts` | `756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509` |
| `components/studio/scene/types.ts` | `5AA65F769BD2077BD6A16CC5834EF1B47DB5C76B6A4E0FF1ABDA226892178364` |
| `components/studio/scene/picking.ts` | `C427B0553DD2403500F7AC0E306A42C5B1476A6A8AB3175186704261D638261C` |
| `components/studio/scene/view-config.ts` | `1FEA7ADBCFD730A56920389C8AC4ECF8323C9739FD4882C15F3E134A11F1A450` |
| `components/studio/scene/textures.ts` | `09F6FF6CC7BB8910F09838566DFCF840D85A0D2CE1BE8D064DEAFB0989C63AA6` |
| `components/studio/StudioScene.tsx` | `29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC` |
| `public/studio/pilot-right-limit-v03.glb` | `2B9A4182C3024485680C1E066C8A22EF0DC0F541ACCA4BD958486BCED2C4063E` |
| `design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json` | `02A9B364ED42127988747660AC61D6EFCA8BC3AF9F151A0E41EB0D50BC0BAA08` |
| `node_modules/three/examples/jsm/loaders/GLTFLoader.js` | `532AC726E120039ACBCD6CF54328C57ACBF7B438176AFAA6951257126D11BFF1` |

`scene-coordination/runtime-technical-critique-hashes.json` records the final source, report, reviewer evidence and inspected receipt hashes. Historical D8ABF67F probe output is retained alongside the final-model result. Any later source/profile change requires binding fresh evidence to that change; this review does not silently cover future revisions.
