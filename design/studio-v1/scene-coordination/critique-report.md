# Independent scene critique

## Final re-review — approved for integration

14 November 2026. Re-review task `task_eb382ca961dd`, dispatch `ctx_78fb87432c28`.

**Current verdict: APPROVE the reviewed scene code for root integration. P2 and P3 are resolved; no outstanding code blocker was found in this review.** Fresh independent execution passed **20/20 controller checks** and the **full TypeScript check**, both exit 0. This closes the earlier request for changes; it does not claim browser, visual, GPU, physical-mobile or final integrated acceptance.

Read the latest controller-report follow-up and independently inspected the updated controller, resource ledger and regression assertions. Only this existing report was edited. No source/test changes, additional tests, browser, preview/server, build, package or runtime/planning action was performed. The React adapter and model fingerprints remain identical to the initial review.

### Disposition of findings

| Finding | Final disposition and evidence |
| --- | --- |
| P2: undersized mobile scene hit regions | **Resolved in source and CPU regression evidence.** `controller.ts:172-216` first honors exact raycast hits, then expands touch eligibility to projected CSS bounds with both dimensions at least 44px. It uses the live canvas rectangle and current camera/world transforms, selects the nearest eligible center, and resolves exact distance ties in frozen project-ID order. Mouse/pen remain exact. The unchanged model need not become larger to make touch selection easier. |
| P3: one ledger disposal failure prevents later releases | **Resolved in source and CPU throw-path evidence.** `resources.ts:28-46` snapshots and clears each ownership set, attempts every entry, continues through all four resource classes, and rethrows the first captured failure only after those attempts. Repeated disposal is inert. The controller still catches that ledger error and proceeds to renderer/context/canvas cleanup (`controller.ts:80-100`). This establishes that all independent releases are attempted; it cannot promise successful GPU release for a resource whose own disposer fails. |
| Removed PCFSoftShadowMap mode | **Remains resolved in code.** `controller.ts:279` uses `THREE.PCFShadowMap`. No fresh browser reload was performed by this critic, so absence of the original runtime warning remains root-owned evidence. |

### Independent assessment of the new tests

- **Real-model mobile edges:** `verify-controller.mjs:221-236,276-303` uses the actual model with 348px/286px canvas widths representing 390px/320px pages with gutters and borders. It probes all four corners and four edge midpoints of the portrait targets' nominal 44px bounds, verifies those probes are outside the original portrait planes, exercises both resize directions, and checks that the model is built once. Mouse and pen are checked against exact picking.
- **Overlap policy is tested, not hidden:** The real-model expected-result helper at lines 246-256 intentionally follows the specified exact-hit/nearest-center/canonical-tie policy. Consequently, an overlapping edge may correctly select a neighboring project; these tests do **not** assert a separate exclusive 44px square for every target. Independent explicit pixel fixtures at lines 266-273 and hard-coded expected IDs at 306-333 separately verify nearest-center selection, exact ties after reversing the model array, and exact-surface precedence over a nearer center. This adequately supports the documented overlap policy rather than relying only on a duplicated production oracle. Root should still assess whether the real overlap feels predictable to touch users.
- **Scroll and cancellation:** Lines 336-367 test a valid enlarged tap, just-outside misses, off-canvas rejection, page scroll between down/up, an 8.01px drag returning to its start, pointer cancellation, passive listeners and teardown. `controller.ts:219-256,300-307` retains matching down/up and drag checks and adds a passive window-scroll cancellation listener. These checks show control flow; actual browser scrolling and touch arbitration are not simulated by Node.
- **Disposal exceptions:** Lines 370-403 inject the first instance or first geometry failure plus a later material failure. Assertions require the complete ordered release-attempt sequence, cleared sets, the original error identity, inert repeat disposal and completed controller cleanup. The existing renderer-disposal-failure case also remains. These regressions substantively close the prior ledger-isolation gap.
- **Unchanged safeguards:** The original 13 tests still pass, including loading/ready order, controlled selection without construction, camera/real-model center picks, demand rendering, visibility/zero-size behavior, constructor/model/render/context-loss paths, retained callbacks after repeated disposal and callback-ref forwarding. React hooks, renderer, DOM and observers remain stubs; real React StrictMode and GPU behavior remain outside their proof.

### Fresh commands and reviewed revisions

Commands ran through the current PowerShell execution tool in `C:/Users/Owenc/orca/Portfolio`:

| Command | Result |
| --- | --- |
| `node components/studio/scene/verify-controller.mjs` | **20 passed, 0 failed, exit 0**; independently rerun for this re-review. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` | **Exit 0**, no diagnostics; independently rerun for this re-review. |
| Numbered `Get-Content` reads and `rg` | Inspected changed runtime logic, follow-up report and new assertions. |
| `Get-FileHash -Algorithm SHA256` | Captured final reviewed fingerprints below; adapter and model unchanged from the initial review. |

| File | SHA-256 |
| --- | --- |
| `components/studio/scene/controller.ts` | `BD46EDE4D8CD0525AC89A8A491866BBC065554918D663A4830D5DB51FFC9FB63` |
| `components/studio/scene/resources.ts` | `756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509` |
| `components/studio/scene/verify-controller.mjs` | `7F9F21EE10458B676D548AFEDCEFFCEF84A21892CE42DE80D6677310EB325A6F` |
| `components/studio/StudioScene.tsx` | `29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC` |
| `components/studio/scene/build-studio.ts` | `DBAF86527A207C09DB45F19125316FD8C929B97CFE16B14E52CC25B6D386DDEE` |

### Remaining integration evidence

Root retains the preview and browser. It should verify real 390px/320px edge taps and overlap behavior after resize, normal scroll cancellation, desktop/mobile visual identity and gear visibility, the scene-to-existing-HTML hash/focus/return journey, no-JS and lazy/WebGL/context-loss fallbacks, real StrictMode route cycles, and hidden/show/resize behavior. These are integration checks, not newly discovered code regressions.

The earlier static model budget estimates remain child-reported and the model is unchanged. Actual first-render versus subsequent-frame counters, compressed transfer size, the 10-second interaction/resize sample, p95 and attributable long tasks still require root's measurements; no GPU or physical-mobile performance claim is made. Integrated lint/build and the known lint-tooling baseline remain outside this critic's execution scope. No further scene-source change is requested by this re-review.

---

## Historical initial review — superseded by the approval above

The following records the original findings and evidence before the fixes. Its line references, fingerprints and requests for action describe that earlier revision, not outstanding work in the final reviewed code.

14 November 2026. Initial task `task_b9e6c7b5f15f`, dispatch `ctx_be5fab3d0b20`.

**Initial verdict: REQUEST CHANGES for the mobile scene hit areas (P2 below); now resolved by the final re-review above.** No critical lifecycle or contract regression was found in the initial source and permitted CPU checks. Neither review approves the visual result or completes root integration.

Only this report was written. No source, tests, packages, UI, content, contract, planning/runtime state, browser, preview, server or build was changed or started by this critic. The shared brief, approved PRD/test specification, context/reference findings, frozen contract, seven scene implementation/verification files and both scene child reports were read.

## Ranked findings

### 1. P2 — Mobile scene targets do not meet the specified 44 by 44 CSS-pixel hit area

**Evidence:** `controller.ts:171-179` raycasts only the exact monitor surfaces, with no touch tolerance or enlarged picking region. `build-studio.ts:124` sizes those planes to the visible faces; lines 143-145 make the portrait faces 0.74 by 1.24 world units and the main face 1.74 by 0.98. `controller.ts:15-40` fits the entire room into the orthographic camera with padding. The acceptance requirement is `.omx/plans/test-spec-after-hours-studio-v1.md:30`.

**Source-derived result, not browser measurement:** Even granting a full 390 CSS-pixel canvas width, the mobile camera's projected room width is approximately 10.8448 world units before the 1.06 padding, so scale is at most 33.9265 CSS pixels per world unit. Projecting the monitor corners gives bounding boxes no larger than **23.64 by 42.16 pixels** for each portrait target and **55.58 by 38.31 pixels** for the central target. Actual mobile page gutters reduce these further. Increasing only canvas height cannot remove the width constraint. These are conservative geometric upper bounds, independent of whether the eventual screenshot looks good.

**Impact:** A center tap can pass while the intended hit region remains substantially smaller than the agreed mobile control target. The HTML alternatives preserve access to the evidence but do not enlarge the canvas interaction being tested.

**Action:** Give touch selection a screen-space hit region of at least 44 by 44 CSS pixels, with deterministic overlap resolution, or provide equivalent visible scene-local controls meeting that size. Preserve the existing drag cancellation and passive scrolling. The scene lead should resolve this before approving the mobile interaction requirement; root should then verify taps near the intended region boundaries at 390px and 320px, after resize and during normal scroll.

**Validation gap explaining the passing tests:** `verify-controller.mjs:189-191,290-301` computes each surface center and taps that exact point. It never measures or probes a minimum target footprint. The 13 passing checks therefore do not refute this finding. No new tests were written in this critique pass.

### 2. P3 — Cleanup isolation stops at the resource-ledger boundary

**Conditional code inference; nonblocking hardening:** `controller.ts:84-92` isolates independent release functions, but `resources.ts:28-36` calls all instance, geometry, material and texture disposers without individual protection. If one resource's disposal/listener throws, later resources are skipped and the sets are not cleared. The controller has already marked itself disposed, so another controller disposal does not retry them. No such throw was observed in the current normal-path tests, and no ordinary leak is claimed.

**Action:** If the advertised continue-after-release-failure guarantee is intended to cover all owned resources, isolate each ledger entry and clear ownership in a finally-safe manner. Otherwise narrow that guarantee in the handoff. `verify-controller.mjs:154-156,364-372` injects a renderer-disposal failure only; it does not establish resilience to a ledger-resource failure.

### Resolved during review — Removed shadow mode

The initial `controller.ts:242` used `PCFSoftShadowMap`. The installed `three@0.187.0` source, `node_modules/three/src/renderers/webgl/WebGLShadowMap.js:99-103`, explicitly warns and substitutes `PCFShadowMap`. The coordinator reported this known first-render warning and assigned its fix. A later source read confirmed `THREE.PCFShadowMap` at the same line; the CPU checks were rerun successfully. This is **not an outstanding finding**. Root owns confirmation that the real-render warning is gone.

## Contract, lifecycle and failure assessment

| Area | Evidence and conclusion |
| --- | --- |
| Frozen props and IDs | `StudioScene.tsx:4-7` imports and exposes the exact frozen props. `controller.ts:247-250` enforces exactly one of each frozen project ID. `build-studio.ts:135-145` keeps three distinct borders/surfaces outside batching. No scene-owned URL, history, document focus, scroll or project-prose path was found. |
| React 18 update/remount behavior | `StudioScene.tsx:12-29` commits current callback refs, updates the existing controller, creates it in a mount-only effect and disposes its matching instance. Selection does not reconstruct the model. The ordinary effect order and StrictMode setup/cleanup/setup pattern are consistent by source inspection; **real React StrictMode was not run here**. |
| Stale callbacks and queued RAF | Controller callbacks guard `disposed`; disposal cancels RAF and removes subscriptions. The five CPU mount/dispose cycles deliberately invoke retained RAF, pointer and observer callbacks and pass. There is no asynchronous asset-fetch completion to guard. This does not measure browser subscription retention. |
| On-demand rendering and visibility | `controller.ts:108-153,212-215,275-285` coalesces invalidations, pauses hidden/offscreen work and resumes with sizing. Zero-size hosts stay loading without a loop. CPU checks pass. A real IntersectionObserver's delivery timing can still allow an initial frame before its first offscreen notification; no continuous background loop is present in source. |
| Resize, picking and touch scroll | `controller.ts:124-136,171-219` uses host size and canvas-relative client coordinates, caps DPR at 2/1.5, and requires a matching down/up target within the 8px drag threshold. Handlers are passive, with no pointer capture or preventDefault. Real Three CPU raycasting passes before/after resize; physical scrolling and the hit-size issue remain separate. |
| Motion | Selection/hover borders change immediately; there is no camera interpolation, ambient animation or entrance movement for either reduced-motion value. Ignoring a reduced-motion-only update is consistent with that implementation. Global smooth-scroll behavior is UI-owned. |
| Startup/render/context loss | `controller.ts:102-106,139-152,232-288` reports loading, reports ready only after a successful render, and reports unavailable plus disposal on caught startup/render/context loss. The synchronous loss-during-render guard prevents late ready. Constructor/model/render/loss CPU cases pass. The installed renderer itself removes its constructor event listeners on initialization failure (`WebGLRenderer.js:433-440`); genuine context creation/loss still needs browser evidence. |
| Normal disposal | `controller.ts:79-100` removes subscriptions/canvas, disposes light shadows, ledger resources, renderer, and requests context loss. The ledger includes geometry, material, texture and instance resources; normal disposal events pass. `LightShadow.dispose()` in the installed dependency releases map and mapPass (`LightShadow.js:297-308`). Construction is synchronous and ledger registration occurs before the first GPU render; partially built-model CPU cleanup passes. See conditional exception-path note above. |

## Model and composition assessment from source

The requested objects are authored rather than omitted: central/portrait/elevated monitors and stands (`build-studio.ts:117-146`), triangular warm panels (94-101), frosted/pastel compact keyboard (148-165), white tower/fans/side detail (171-198), microphone boom (200-216), headphones and coffee (218-231), and snowboard/bindings (314-325). The music controller has the 29-white/20-black-key construction, pads, knobs and X stand (233-268); pads, cymbals, rack and pedal form the electronic kit (270-312).

The workstation is centered at x=-1.35; controller x=2.95 and drums x=3.05 put the instruments on its right. Dark neutral, timber, cream, pastel, metal and translucent material parameters are present (15-51); warm lighting uses one casting directional light and two unshadowed point lights (327-343). Textures are original procedural canvas graphics, with no external image/model fetch or audio path. The current real-model CPU test verifies overall geometry bounds fit the camera at both tested sizes.

These facts establish intent and structural coverage only. They do **not** establish recognizability at final pixel sizes, warm light balance, good contact shadows, transparency order, legibility, unobscured screen areas or mobile artistic quality. In particular, picking intersects only designated surfaces rather than all opaque scene geometry; the fake-model fixture explicitly permits unrelated nearer meshes (`verify-controller.mjs:121-122`). Root should inspect whether any real visible object obscures a selectable screen region before relying on that fixture as evidence about actual visible picking.

## Budget and validation adequacy

The model child reports a conservative uncullled estimate of 60 main draws/65,542 triangles plus 40 shadow draws/55,876 triangles, totaling **100 draws and 121,418 triangles** against 200/200,000. Single-pass materials, static instancing, one shadow light and the now-explicit PCF mode make that accounting approach reasonable by source inspection. These exact counts are **child-reported**, not independently remeasured GPU values. The existing controller suite does not assert scene budgets.

`controller.ts:142-146` publishes actual renderer counts when a real render happens. Root should record first-render and subsequent-frame values: with static shadows the latest frame can omit the initial shadow cost. The installed renderer resets counters before its shadow pass (`WebGLRenderer.js:1744-1750`). Transfer size, 10-second interaction/resize p95, >100ms tasks and physical-device performance remain unmeasured here.

The test suite meaningfully exercises actual Three geometry/raycasting and owned disposal events. Its WebGL renderer, DOM, observers, canvas painting and React hooks are substitutes (`verify-controller.mjs:45-165,393-455`). Thus it cannot prove real GPU release, shader/render output, browser scroll arbitration, React scheduling/StrictMode replay, shadow appearance or frame timings. Disposal checks track ledger entries; they are not an independent GPU-allocation inventory. Both child reports appropriately disclose these limits. Their historical full-TypeScript UI-import blocker no longer reproduced in this critique.

## Commands and results

All commands used the current PowerShell execution tool in `C:/Users/Owenc/orca/Portfolio`.

| Command/check | Result |
| --- | --- |
| `orca skills get orchestration` | Loaded the installed guide; no worker/subagent was started. |
| `rg`, `Get-Content`, numbered source reads | Read required specs, implementation, child reports and relevant installed Three source; no source edits. |
| `node components/studio/scene/verify-controller.mjs` | **13/13 passed, exit 0**; repeated after the coordinator-owned PCF change, again 13/13 and exit 0. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` | **Passed, exit 0**, no diagnostics. Rechecked after the shadow-mode change. |
| Projection arithmetic from the source camera/bounds/surface dimensions | Computed conservative mobile hit-area upper bounds stated in finding 1; no browser, new test file or implementation instrumentation. |
| `git status --short`, `git diff --stat`, `Get-FileHash` | Shared workspace already contains concurrent/untracked studio work. The tracked diff summary cannot inventory these untracked sources; it is not proof of overall cleanliness. |
| `orca orchestration check` | Run once in response to the injected message; received the known warning/fix status. |

Lint was not rerun: the dispatch and both children identify the baseline missing `@typescript-eslint/eslint-plugin`; no package repair was authorized to this critic. No build was run against the active `.next` server. No browser, GPU, screenshot, network, performance or physical-mobile result is claimed. The coordinator's desktop-render message was treated as a coordinator report, not independently inspected evidence.

Final reviewed implementation fingerprints: controller SHA-256 `16545BEC436E264AB9832F56A09BA9D19E1FDCC3191128B2DE0DC1C919F6D6BB`; model SHA-256 `DBAF86527A207C09DB45F19125316FD8C929B97CFE16B14E52CC25B6D386DDEE`.

## Handoff

Scene lead: resolve finding 1, decide whether to include finding 2's hardening, and verify the affected behavior. Root: retain ownership of actual desktop/mobile/320px visual review, touch/scroll and hash/focus journeys, no-JS/lazy-chunk/WebGL failure fallbacks, real context loss, five React StrictMode route cycles, hidden/resize recovery, renderer/transfer/timing evidence, and integrated lint/build when safe. None of those integration checks is replaced by this successful critique task or the CPU suite.
