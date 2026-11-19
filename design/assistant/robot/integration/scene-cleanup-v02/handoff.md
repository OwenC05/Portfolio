# G2 activation and cleanup repair — source handoff

18 November 2026. New implementation lease, distinct from the frozen independent G2 review. Root must independently verify this repair. All earlier review files/probes and scene-implementation pins remain read-only.

## Local repair plan before implementation

1. Pin the transferred sources and root's read-only source/tests; record the two independently supplied failing cleanup controls unchanged.
2. Reproduce the trusted activation failure with actual controller/Three objects and root-style hover feedback committed between native input events. Lock that failure and preserve rejected-gesture/not-yet-rendered controls before modifying controller logic.
3. Make the smallest gesture/hover lifetime correction supported by that reproduction; retain geometry readiness, trust, pointer identity, modal and lifetime guards.
4. Add durable actual-object cleanup cases: root detachment, card detachment, each card resource throwing, and repeated disposal. Guard independent cleanup attempts using the existing local ownership pattern; change no model/material/pose/geometry configuration.
5. Run focused new regressions and the frozen independent probes, scoped lint and direct nonincremental TypeScript. Record source deltas, untouched evidence hashes and remaining browser/GPU gates.

The separate read-only G4 root recheck is recorded under review/root-assembly-g4/recheck-v02, with its own authorship and bounded verdict.

## Delivered behavior

The transferred repair changes three production files and two durable test files. No root component, asset, profile, pose, material, card geometry, request generation or cancellation contract changed. Root's existing build `XH_oOqBftWO8em8L7m4E6` predates this repair and cannot validate it.

**Trusted activation:** `controller.ts:327` now resets the previous gesture/capture without clearing the hover already under the pointer. The new local `resetPointer()` contains the three state-reset operations formerly inside `cancelPointer()`; cancellation still additionally clears hover. Leave, blur, resize, modal disable and disposal retain that cancellation path, and drag retains its explicit hover clear. `canInteract`, `robotPendingFrame`, trusted-event qualification, pointer identity, compatibility-mousedown requirement and picking are unchanged.

The supplied native diagnostic records a trusted mouse sequence on CANVAS at CSS `(1130,310)`, including exactly one compatibility mousedown and an approximately 815 ms hold. The supplied failure screenshot shows the intended visible head, and HTML Ask remains usable. Inspection of actual `StudioExperience.tsx:498–504` and `StudioScene.tsx:12–14` confirms the callback feedback path: `onAssistantHoverChange` updates root state, which commits `attentionRequested` back into the controller.

The new durable CPU reproduction starts from settled visible hover, fires pointerdown, commits that root-style hover feedback, then delivers the **single** native mouse mousedown. Before repair, `cancelPointer → setHover(false)` produces hover trace `[true,false]`; the commit marks robot geometry pending and mousedown cannot qualify. Both zero-paint and paint-during-hold variants fail, even though the independent real picker still finds the head before pointerup. After repair, starting the press leaves hover unchanged and both sequences activate once. A separate negative control still rejects a genuinely pending presentation and cannot resurrect its gesture after the next render.

This confirms the feedback failure in the actual controller with actual Three geometry under the stated event/commit ordering. It does not claim a new browser run: root must verify the visible-head click against a fresh build. No root change is requested by this repair.

**R1 imported owner:** `load-robot.ts:129` now drains `owner.dispose()` in `finally` around root detachment. A throwing `removed` listener still propagates to the existing caller boundary, but cannot bypass any of the 28 private imported resource-release attempts. Existing owner idempotence remains authoritative.

**R2 card owner:** `cards.ts:45` guards each card detachment and each of its three distinct geometry/material disposals independently. The disposed flag still precedes cleanup, so repeated calls cannot duplicate notifications. A card detachment or resource-release exception no longer prevents the other owned objects from receiving their cleanup attempt. The existing two geometries and one material are retained; there is no new owner abstraction.

## Regression and command evidence

The immutable review probes were run before production edits. Both independently supplied P2 assertions fail on the original source, then pass unchanged after repair. Their outputs are stored here, not in the frozen review directory.

| Check | Before | After |
| --- | --- | --- |
| Original independent cleanup controls, selected `P2:` | 0/2 pass, exit 1 | Included in unchanged full probe: 10/10 pass, exit 0 |
| New feedback cases | 1/3 pass, exit 1; both one-mousedown positive cases fail | 3/3 pass, exit 0 |
| New durable cleanup file | 1/10 pass, exit 1 | 10/10 pass, exit 0 |
| Relevant existing controller/picker guards plus new feedback cases | Not repeated before edits | 17/17 pass, exit 0 |
| Direct `tsc --noEmit --incremental false` | Root's prior receipt supplied | Exit 0 |
| Scoped ESLint with `--max-warnings 0` | — | Exit 0 |

Exact argv, exits and log names are in [before-checks.json](before-checks.json) and [after-checks.json](after-checks.json). The focused guard run covers G2 lifetimes/modal cancellation, trusted mouse/pen/touch qualification, invalid leaves/drag/second-pointer and stale-click cases, disabled interaction, compatibility mousedown, existing input-guard sensitivity and the robot/card original-touch-ray blocker. It does not repeat the 160-scene/113-assistant suites.

New `robot/verify-cleanup.mjs` uses the actual installed Three/parser and owned objects. Its ten cases cover: root detachment throwing with all 28 releases attempted before retry; each of four card detachments throwing; each of the first geometry, shared remaining geometry and material throwing; all card detachment/resource listeners throwing together; and the normal control. Repeated disposal produces exactly one recorded attempt per private resource/card. The frozen independent probes additionally exercise both cleanup failures through actual controller removal while the room renderer remains live.

The controller fixture now exposes its hover callback to the test. The older shared `tap` helper sends an extra compatibility mousedown for mouse input; the new feedback tests intentionally use an explicit single-mousedown sequence, without weakening or rewriting that older test matrix. DOM/renderer/event trust remain CPU host simulations. Passing disposal-event counters establish attempted ownership release, not measured GPU memory reclamation.

## Exact source delta

[source-pin-delta.json](source-pin-delta.json) records old/new SHA256 and byte counts, with exact before/after source copies beside this handoff. Four existing files changed and one durable test file was added. All 20 other pinned inputs stayed unchanged, including every file in the original G2 review directory, `verify-robot.mjs`, StudioScene, root source/tests, the frozen v03 GLB and the original scene-implementation pin receipt.

| File under `components/studio/scene/` | Old SHA256 | New SHA256 |
| --- | --- | --- |
| `controller.ts` | `88f24c7ac899c1639ec2596d3545f92dbe845473d901c6d805ca28b33ebb6ffd` | `dbc91da47931fbbd592278ef5e82fe9db8c40d02fc29806b050161585f822afc` |
| `verify-controller.mjs` | `0fe3abe45e84747832b1e3a4c2e463acec1ddfeddab6020ab1392424348ed816` | `cc58de1b838a67a452481a9b9e750f578c95c570de8c04d4fe634db91a7283b0` |
| `robot/load-robot.ts` | `33d2cd75b3e146a76a744023d25d2bc80158336c5f121a40ffc4cd6656829fca` | `f237471d54e2837fab90eab6767ae9a8a70ae15ff5e97daf82dd4a30c2eeb695` |
| `robot/cards.ts` | `6c37eb87147aaf4d290dce4e5bbefe46c361c30b86c55fe4f4a7080ee9b45f58` | `4a27a76b1327a55c5a4df80124ddb0b8676eec3ae51c1d8e22e49943acd8faa2` |
| `robot/verify-cleanup.mjs` | New | `fe0c84687ca89ca4894321456bcafd3f0ab9f9e9ee4f89b5dd822d2e2a6ffd40` |

The old `scene-implementation/source-pins.json` remains a frozen historical receipt; this delta, not a rewritten old receipt, identifies the repair candidate. Public asset SHA256 remains `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12`.

## Remaining ownership and acceptance

Implementation and author verification are complete within this lease. **Independent G2 verification remains root's responsibility**, including review of these small source changes and regression adequacy, followed by a fresh build and the actual trusted robot-head click. The supplied older build still demonstrates the pre-repair failure. Real React/native event timing, physical pen/touch input, browser focus/StrictMode, GPU lifetime, appearance, placement and performance are not certified by this handoff. Actual Claude retains visual acceptance. No browser, build, server, type generation, dependency/configuration, Git, Blender, paid call or global runtime operation was performed.
