# Studio scene implementation and handoff

14 November 2026. Parent task `task_31ebbeeae6d6`, dispatch `ctx_6cd982d90d83`, coordinator `term_b88192fc-c4ce-4672-ab48-dea5c8dc205b`.

**Scene lane complete and independently approved for root integration.** The authored scene and frozen component contract are implemented, source/lifecycle checks pass, and all scene critique findings are resolved. This is not final `/studio` acceptance: root owns remaining browser, accessibility, GPU, performance and production-build evidence.

## Result

`StudioScene` accepts the exact frozen props and owns one controller, canvas and renderer per mount. Its original warm procedural studio contains a timber workstation, central/portrait/elevated monitors with stands, triangular wall lights, frosted-looking compact cream/pastel keyboard, white computer tower, microphone arm, headphones, mug and restrained snowboard. On the right, the white controller has 29 white and 20 black keys, pads, knobs and an X stand; the drum kit has pads, cymbals, rack and kick pedal. Geometry is stylised, without manufacturer-fidelity claims.

Three actual monitor faces map to `dissertation`, `copilot` and `typeforge`. The upper screen is decorative. The scene invokes callbacks and never changes document navigation, hash, history, focus or scroll. Independent HTML remains owned by the interface lane. Hover/selection borders update without rebuilding the model, camera travel or ambient motion. Both reduced-motion states use immediate changes.

The controller uses canvas-relative raycasting, distinct desktop/mobile orthographic framing, render-on-demand, hidden/offscreen suspension, coalesced RAF and DPR caps of 2 desktop / 1.5 mobile. Exactly one light casts a static shadow. Touch receives projected regions at least 44 by 44 CSS pixels; exact screen hits take priority, expanded overlaps use nearest center and canonical ID tie-breaking. Mouse/pen stay precise. Passive input, same-target down/up, the 8px drag threshold and scroll cancellation preserve normal page scrolling.

Renderer construction, model construction, rendering and context-loss failures report unavailable and dispose owned work. Teardown cancels RAF, removes listeners/observers, clears the canvas, disposes light shadow targets, instance buffers, geometries, materials, textures and the renderer, and requests context loss. Queued callbacks check disposal. The resource ledger attempts every release even if an earlier resource throws, clears ownership, and preserves the first error for its caller. There are no asynchronous asset fetches or completion callbacks.

## Changed files and boundaries

Runtime and verification:

- `components/studio/StudioScene.tsx` — React adapter and stable current callbacks.
- `components/studio/scene/controller.ts` — rendering, framing, selection, input and lifecycle.
- `components/studio/scene/build-studio.ts` — authored room, equipment and lighting.
- `components/studio/scene/resources.ts` — ownership ledger, primitive helpers and static instancing.
- `components/studio/scene/textures.ts` — original local canvas grain, contact shading and screen diagrams.
- `components/studio/scene/types.ts` — private scene/model types consuming the frozen project ID.
- `components/studio/scene/verify-controller.mjs` — CPU-only regression harness using already installed TypeScript/Three and Node's test runner.

Evidence: this report, `scene-asset-provenance.md`, and the bounded briefs/reports under `design/studio-v1/scene-coordination/`. No public asset directory was needed. No packages, shared contract, content, page, interface, global styles, parent planning or parent runtime state were edited by this lane. Concurrent workspace changes were preserved. No commit, deployment, paid generation, browser session, preview restart or production build was performed by this lane.

## Validation and critique disposition

| Check | Fresh result and limit |
| --- | --- |
| Full `.\\node_modules\\.bin\\tsc.cmd --noEmit --incremental false` | Passed after assembly; passed again after final touch/cleanup fixes and in independent re-review. Earlier missing sibling UI import no longer reproduces. |
| `node components/studio/scene/verify-controller.mjs` | **20/20 passed**, rerun independently on the final controller/resources. Real Three geometry/projection/rays; stub renderer, DOM/observers, Canvas2D and React hook scheduling. |
| Final scoped Next lint over six runtime files | Could not load existing `@typescript-eslint/eslint-plugin`, exit 1. Baseline tooling gap; no package/config repair attempted. |
| Final scoped ESLint API fallback using `useEslintrc:false`, `extends:['next/core-web-vitals']` on the six runtime files | **6 files, 0 errors, 0 warnings**, exit 0. This does not claim the missing root TypeScript ESLint rules ran. |
| Model construction/resource/target checks | Model child verified three distinct IDs, ledger coverage, normal and partial-construction disposal, 49 controller keys, bounds and nominal center rays. See `models-report.md` for method and limits. |
| Independent critique | Initial P2 mobile hit-area finding and P3 release-failure isolation finding both fixed. Final verdict **APPROVE for root integration**, no remaining scene-source change requested; see `critique-report.md`. |
| Real first desktop image | Root rendered at 1440x900; scene lead inspected `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/first-desktop-1440.png`. Warm room, workstation, tower, lights, keyboard and full right-side instrument arrangement are visible. This is early image evidence, not all visual acceptance checks. |
| Corrected desktop/mobile composition | Root subsequently reported inspecting U's corrected 1440px/390px screenshots with full right-side instruments and clear direct links. This lane did not take those screenshots or independently measure their interactions. |
| Deprecated shadow constant | First browser preview exposed removed `PCFSoftShadowMap`; controller changed to supported `PCFShadowMap`, matching r187's prior effective fallback. CPU/type checks passed afterward; root retains real-console confirmation. |

The 20 checks cover one model/canvas, callback updates without reconstruction, coalescing, hidden/offscreen/zero-size behavior, all three project rays, responsive fit, guttered 390px/320px touch corners and edges, overlap priority/ties, both resize directions, precise mouse/pen behavior, drag/scroll cancellation, startup/render/context loss, five simulated mount/dispose cycles with retained late callbacks, and early instance/geometry/material release failures followed by continued cleanup. They do not prove browser graphics, actual React StrictMode scheduling or GPU release.

The unchanged model's conservative CPU estimate is **60 main + 40 shadow draws = 100**, and **65,542 main + 55,876 shadow triangles = 121,418**, before culling. It has 37 instanced batches and six procedural canvas textures. This is below the 200-draw/200k-triangle budget on the documented counting method, but **is not renderer.info or GPU timing evidence**. No HDRI, video, external model or image transfer is introduced.

## Child coordination

The user's updated delegation direction was followed using Orca Codex performers, not substitute native workers. Child Run: **`run_720213432ef0`**. All children settled successfully; no child remains running or failed. Writer and critic passes were separate.

| Slice | Task | Dispatch | Outcome |
| --- | --- | --- | --- |
| Model assembly | `task_eb90d847412a` | `ctx_d613764139d9` | Succeeded; model/report delivered |
| Controller/adapter/tests | `task_7daba0479028` | `ctx_247b3786643e` | Succeeded; initial 13 CPU checks |
| Independent initial critique | `task_b9e6c7b5f15f` | `ctx_be5fab3d0b20` | Review completed; requested mobile fix |
| Supported shadow mode fix | `task_7da2c865a6fe` | `ctx_a6abbe10785f` | Succeeded |
| Touch region fix and cleanup regressions | `task_91023a3c3cf5` | `ctx_c69ac972a312` | Succeeded; 20 CPU checks |
| Independent final re-review | `task_eb382ca961dd` | `ctx_78fb87432c28` | Approved; P2/P3 resolved |

## Integration handoff

Root retains the preview at `http://127.0.0.1:4180` and browser scheduling; this lane did not claim browser ownership. Finish the approved integrated test specification, especially:

- Real 390px/320px near-edge touch taps and overlap usability after resize, ordinary scroll, and the scene-to-existing-HTML hash/focus/return journey.
- Actual selected/hover appearance, desktop/mobile/320px screenshots and full evidence, no-JS path, failed lazy chunk/WebGL creation, context loss and fallback.
- Five real React StrictMode route mount/unmount cycles with instrumented canvas/listener/observer/RAF ownership; hidden/show/resize recovery.
- First-frame and subsequent renderer counts (static shadows disappear from later-frame cost), compressed scene transfer, requested 10-second interaction/resize sample, p95 and attributable tasks over 100ms. Canvas `data-studio-*` attributes expose last-frame counters without a global renderer/debug panel.
- Integrated lint after the baseline plugin issue is resolved by its owner, and production build when it will not race the active preview's `.next` files.

Physical-device performance remains untested. No pixel-match score, actual GPU budget, transfer budget or physical-mobile FPS is claimed. The provenance manifest records all scene assets as original procedural work apart from the already authorized Three.js dependency.

## Later required activation repair

The original lane evidence above is historical. Integration subsequently demonstrated that trusted-touch compatibility mousedown stole heading focus after pointerup selection. The bounded repair now qualifies pointerup and commits its matching trusted click; independent review also identified and closed the non-hover pen release case. Final controller SHA256 `728C12AFFD53A069FD684A725C53CEB39A046AD569A43314A9AC2DD5348222B0` and harness SHA256 `D26A7F4EB94678F1DBA7C32922F1FF35F3019231E71A712117E5E3D1AB49E2C4` pass 33 CPU regressions, full TypeScript and independent exact-delta/cleaner review. Configured lint retains its baseline missing-plugin failure. See [scene-touch-focus-repair.md](scene-touch-focus-repair.md) for scope, exact hashes, child records and the I-owned authoritative browser/build handoff; do not treat the earlier 20-test result as proof of the repaired event ordering.
