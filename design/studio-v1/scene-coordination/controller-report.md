# Scene child L: controller and React adapter

Completed 14 November 2026 for task `task_7daba0479028`, dispatch `ctx_247b3786643e`.

## Owned deliverables

- `components/studio/StudioScene.tsx`: client adapter using the frozen `StudioSceneProps`, one controller per mounted effect, current callback refs, prop-driven selection updates and symmetric cleanup.
- `components/studio/scene/controller.ts`: host-sized decorative canvas; orthographic desktop/mobile framing; three-surface picking; passive pointer handling; immediate hover/selection borders; on-demand rendering; resource ownership and failure handling.
- `components/studio/scene/verify-controller.mjs`: executable CPU-only verification using installed TypeScript/Three and Node's built-in test runner, without new dependencies.
- This report.

Read `common.md`, the paired PRD/test specification, context/reference findings, the shared contract and scene resources/types/textures. Consumed the sibling's `createStudio(resources)` model after it landed. No package, shared contract, UI/content, sibling model, planning/runtime, preview or browser changes were made.

## Behavior and lifecycle

The camera fits the projected corners of the supplied room bounds with 6% padding. Desktop position is `[-8, 6.5, 11.5]`; mobile/narrow portrait position is `[-4, 7, 12]`, looking toward `[0.3, 1.8, 0]`. All geometry in the current sibling model also fits inside both tested projections. This is mathematical framing evidence, not visual approval.

Selection uses canvas-relative normalized coordinates and raycasts against exactly the three designated project meshes. Pointer down/up must hit the same project; movement beyond 8 CSS pixels cancels activation. Touch needs no hover. Handlers are passive and do not capture pointers, prevent default scrolling, or write history/location/focus/scroll. Selection remains controlled by props. Selected borders are amber; hover borders are cream. All motion preferences use immediate styling with no entrance, orbit, pan or ambient loop.

Rendering coalesces invalidations into one RAF and becomes idle after rendering. Hidden documents and offscreen hosts cancel pending RAF work; returning or resizing invalidates the frame. Zero-size hosts remain loading without a render loop. DPR is capped at 2 for desktop and 1.5 for mobile/portrait composition. Exactly one casting light is required; the static shadow map is invalidated once at initialization, not by hover/selection.

The controller reports loading first and ready only after a successful render. Renderer creation, partial model construction, render failure and context loss report unavailable and remove the canvas. Cleanup is idempotent, cancels RAF, removes listeners, disconnects observers, disposes every light shadow (including its render targets), releases the SceneResources ledger including instanced buffers, disposes the renderer and requests context loss. Retained event/RAF/observer callbacks guard disposal. Recovery after a real context loss is a page reload/remount; there is no restoration/retry loop.

Canvas-only instrumentation is available as `data-studio-render-count`, `data-studio-dpr`, `data-studio-draw-calls`, `data-studio-triangles`, `data-studio-geometries` and `data-studio-textures`. These expose the last real renderer info when run in a browser; no global renderer object or visible debug UI is exposed.

## Verification evidence

`node components/studio/scene/verify-controller.mjs` passed **13/13 tests**, exit 0:

1. Loading/ready order, one canvas/model, coalesced updates, static shadow scheduling and idempotent cleanup.
2. Real Three.js raycasting for all three offset-canvas targets, touch activation, drag/cancel rejection, hover/controlled selection, resize and DPR changes.
3. Supplied room bounds inside desktop/mobile camera projections.
4. Current sibling model integration: real geometry/instancing, all three surface-center picks at desktop/mobile dimensions, actual model bounds inside the frame, and resource disposal.
5. Hidden/offscreen cancellation and resize/resume.
6. Zero-size host handling.
7. Renderer-constructor failure.
8. Partial model-construction failure.
9. Render failure.
10. Context loss during render without a late ready status.
11. Context loss after ready, including continued cleanup if renderer disposal throws.
12. Five mount/dispose cycles with deliberately retained late RAF/event/observer callbacks.
13. Adapter prop/callback updates without controller reconstruction, using minimal hook scheduling.

The renderer and DOM observers are stubs. The sibling-model test also uses inert Canvas2D drawing. These checks verify CPU control flow, actual Three geometry/ray math and disposal events; they do **not** prove browser graphics, real React StrictMode behavior, visual quality, GPU counts, shadow appearance or performance.

TypeScript compiler API check, using the repository's parsed tsconfig with `noEmit: true, incremental: false` and roots `StudioScene.tsx` plus `controller.ts`, passed with **0 diagnostics**, including their sibling imports.

Required full command `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` was run after the sibling model landed. Its final result was exit 1 with only the independently owned pending UI import:

```text
app/studio/page.tsx(3,30): error TS2307: Cannot find module '@/components/studio/StudioExperience' or its corresponding type declarations.
```

An earlier full check also encountered disappearing `.next/types/app/layout.ts` and `.next/types/app/page.ts` during concurrent workspace activity; that error did not recur in the final run. The initial controller tuple/nullability errors were fixed before the passing scene-only check.

Normal targeted Next lint could not load the pre-existing root config because `@typescript-eslint/eslint-plugin` is missing. A bounded fallback using the installed ESLint API with `useEslintrc: false` and `overrideConfig: { extends: ['next/core-web-vitals'] }` on both owned runtime files passed with **0 errors and 0 warnings**. This does not claim the root TypeScript ESLint rules passed. No dependency or config repair was attempted. Initial ad hoc verification command quoting/CLI-option errors were corrected; the reported results above are from the corrected invocations.

## Integration handoff

- Repeat full-project TypeScript once `StudioExperience` lands; resolve root lint through its owning lane and run the integrated production build.
- Browser owner should inspect 1440x900, 390x844 and the 320px edge case, including warm lighting, readable gear, actual framing and hover/selection borders. No screenshot or real render was obtained by this child.
- Verify all three real pointer/touch project journeys before/after resize, normal page scroll, HTML fallback, hash/focus behavior and reduced-motion toggling in the integrated interface.
- Force WebGL creation failure and `WEBGL_lose_context`, inspect unavailable fallback, and exercise at least five real React StrictMode route mount/unmount cycles with browser listener/observer/canvas instrumentation.
- Read actual renderer data attributes and network transfer, measure the requested interaction/resize sample, and confirm real hidden/offscreen behavior. CPU smoke results provide no GPU/frame-rate or physical-mobile evidence.

No remaining owned-code failure is known. Browser/preview ownership remained with integration throughout.

## Follow-up: supported shadow-map constant

14 November 2026, task `task_7da2c865a6fe`, dispatch `ctx_a6abbe10785f`.

Root reported the real-render warning that `PCFSoftShadowMap` has been removed and Three.js substitutes `PCFShadowMap`. The installed `node_modules/three/src/renderers/webgl/WebGLShadowMap.js` confirms that warning and substitution. Replaced the controller's explicit setting with `THREE.PCFShadowMap`; this selects the same effective shadow algorithm directly. No existing test assertion required a change.

Fresh verification after the one-line fix:

- `node components/studio/scene/verify-controller.mjs`: **13/13 passed**, exit 0, including static shadow scheduling, actual sibling geometry/picking, failure cleanup and adapter updates.
- Targeted TypeScript compiler API check with the repository tsconfig, roots `StudioScene.tsx` and `controller.ts`, `noEmit: true` and `incremental: false`: **0 diagnostics**, exit 0.

Changed only `components/studio/scene/controller.ts` and this report for the follow-up. No preview restart, build or browser action was performed. Root retains confirmation that the warning is absent on the next integrated browser render; no new visual or GPU claim follows from these CPU checks.

## Follow-up: mobile touch regions and resource-failure regressions

14 November 2026, task `task_91023a3c3cf5`, dispatch `ctx_c69ac972a312`.

Read the independent critique and the lead's hardened `SceneResources.dispose()`. This follow-up changes only `controller.ts`, `verify-controller.mjs` and this report; it does not edit the resource ledger or visible scene model.

Each project now has a touch-eligible screen-space rectangle centered on its projected geometry bounds, with width `max(44, projectedWidth)` and height `max(44, projectedHeight)` in CSS pixels. Exact raycast surface hits win first. When there is no exact hit, touch selects the nearest eligible projected center by squared CSS-pixel distance; equal distances use frozen `PROJECT_IDS` order, independent of model target-array ordering. Rectangles may overlap; this policy resolves their shared area deterministically. Mouse and pen deliberately retain exact surface picking and existing hover behavior.

Projection uses the current camera/world matrices and live canvas rectangle at each pick, so page offsets, gutters, DPR and completed resizes do not change the 44px minimum. Coordinates outside the canvas are rejected. No geometry, asset, camera composition or document navigation/scroll position is changed. Existing passive pointer listeners, same-project down/up matching and the 8px drag threshold remain. A new passive window scroll listener cancels pending activation, including when scrolling occurs without a matching pointermove; it is removed through the existing teardown path.

Fresh regression evidence:

- Before the controller change, the expanded suite reproduced **3 failing touch tests**, while the existing 13 checks and 4 new ledger/controller-disposal regressions passed. In particular, a tap at a 390px portrait's `(-22, -22)` corner returned no selection instead of the eligible project.
- After the fix, `node components/studio/scene/verify-controller.mjs` passed **20/20 tests**, exit 0.
- `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` passed, exit 0 with no diagnostics. This supersedes the earlier recorded missing-UI-import blocker for this check.

The touch regressions use the actual sibling model at viewport widths 390 and 320, with current page gutters of 20px and 16px plus the frame's 1px border on each side: respective canvas widths are 348 and 286 CSS pixels, with a 352px canvas height. Both portrait surfaces are probed at all four corners and all four edge midpoints of the 44px minimum, outside their actual visual planes. The checks run in both resize directions without rebuilding the model and also verify mouse/pen remain exact. Separate explicit pixel-position fixtures establish nearest-center overlap resolution, canonical ties despite reordered targets, exact visual-surface priority over a nearer missed surface, misses just beyond the footprint, no off-canvas picking, passive listeners, and suppression after page scroll, an 8.01px drag that returns to its starting point, or pointer cancellation.

The new resource regressions inject a throw from the first instance or first geometry, and a later material error. They prove all later instance/geometry/material/texture disposal events are attempted in order, all ownership sets are cleared, the first error is preserved, and repeated ledger disposal is inert. Two controller regressions inject those early ledger errors and prove renderer disposal, context-loss request, canvas removal, observer/listener cleanup and repeated controller disposal still complete. These exercise the lead's resource hardening read-only.

Verification remains CPU-only with the existing renderer/DOM stubs and real Three projection/raycast geometry. No browser, build, preview/server restart or physical-device test was performed. Root should confirm actual near-edge mobile taps, browser scroll arbitration and visual behavior during integrated review; this report does not claim those browser checks passed.
