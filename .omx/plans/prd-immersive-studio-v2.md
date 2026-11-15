# Immersive Studio v2 — execution plan

Draft for sequential Architect then Critic review.14November2026. Requirements: `.omx/specs/deep-interview-immersive-studio-v2.md`. Root owns planning/coordination; implementation remains user-requested Orca secondary orchestrators.

## Result

Replace `/studio`'s fixed externally viewed vignette with a viewport-filling eye-level warm stylised interior. Look around from a fixed point; no walking, pointer-lock or game mechanics. Clicking a monitor opens readable project content immediately over the room, no camera travel/delay. Close preserves viewing direction. Keep all three projects truthful and accessible with direct HTML alternatives and without JS/WebGL. Preserve `/`, earlier drafts and v1 records.

## RALPLAN-DR

Principles: (1) inhabit the studio rather than display a model; (2) reading wins over spectacle; (3) tactile authored geometry/light, not detail-free primitives; (4) accessible progressive HTML and explicit resource ownership; (5) bounded local changes with preserved truthful evidence.

Drivers: fulfill the user's corrected immersion intent, keep projects fast to read, use the current stack/resources without paid assets or a migration.

Options: **A—direct perspective camera, bounded yaw/pitch and procedural authored interior**, selected: reuses explicit controller/resource ownership, no new dependency and predictable look constraints; costs careful input/math and room detailing. **B—Three OrbitControls with locked radius/pan**, viable but rejected for this intent: excellent object inspection tooling, yet pivot-based orbit is the wrong default model for a fixed interior eye point and requires constraining unused behavior. **C—full walkable scene** invalid under user's explicit portfolio-not-game boundary. Camera/room assets remain original; no copied reference geometry.

ADR: keep direct Three0.187/React18/Next14, use PerspectiveCamera from fixed eye position with controlled bounded yaw/pitch. Room fills available viewport; restrained header/project shortcuts replace competing large editorial column. Retain demand rendering. Native HTML dialog is the preferred enhanced reading surface, with immediately rendered existing data and ordinary server HTML fallback. Verify installed/browser support rather than assuming focus semantics.

## Grounding and design source

Current controller.ts orthographic framing and shallow open build-studio.ts were intentionally v1; they are inadequate for the new view. UI currently scrolls to HTML evidence; that changes only in enhanced mode. lib/studio-content.ts stays the single content source. Shared ProjectId/SceneStatus and existing cleanup/failure code remain valuable. Detailed composition guidance: `.omx/plans/immersive-v2-art-direction.md`, informed by actual v1/Jesse images. Proposed camera/angle values are tuning seeds, not verified framing; implement and prove its inside-room, minimum monitor-size and reachable-corner visual gates. Official-doc and version-limit handoff: `.omx/plans/immersive-v2-technical-evidence.md`; Context7 lacks a pinnedr187entry, so implementation checks installedsource. OrbitControls is a bundledaddon; the rejected option concerns orbit behavior, not adding a package.

## Frozen cross-lane interface

Retain current PROJECT_IDS, ProjectId, SceneStatus, StudioProject, projectAnchor and projectIdFromHash. Add:

```ts
export type StudioViewAction = 'reset' | 'left' | 'right' | 'up' | 'down';
export interface StudioViewCommand { action: StudioViewAction; sequence: number; }
```

Add optional `viewCommand?: StudioViewCommand | null` and `interactionEnabled?: boolean` to StudioSceneProps. Defaults null/true preserve assembly compatibility with old UI while separate lanes land. Each new sequence applies once; reset restores initial yaw/pitch without moving the eye point. UI owns buttons/accessible labels and sends commands; scene owns orientation/clamping/picking. Disabled interaction cancels active gestures and candidates immediately; reenable must not replay stale commands. Selection updates only monitor styling, never camera orientation. No view callback/React state frame loop is needed. S owns `lib/studio-contract.ts` and freezes those additive fields before its performers consume them; U must not edit that file. S reports any necessary interface change upward before edits.

## Interaction contract

- Fixed interior perspective, conservative yaw/pitch bounds that expose only finished, intentional room views. Designer gives concrete initial composition; S measures actual angles in render. Eye height reads as human, not ceiling/dollhouse. No auto camera entrance, idle sway or inertia necessary.
- Perspective selection eligibility is newly owned by S, not carried from v1's orthographic projection. Behind-camera, clipped-away, back-facing and foreground-occluded monitor regions cannot activate. Exact rays account for relevant visible opaque occluders, not targets alone. Touch expansion derives only from a finite visible projection intersecting the viewport; conservatively omit expansion for problematic near-plane/camera-plane crossings and retain HTML alternatives. S freezes any internal model/occluder interface before parallel model/controller work. Add negative music-view, behind/near-plane and foreground-occlusion fixtures with independent geometric preconditions.
- Resize, visibility resume, panel opening/closing and selection updates retain yaw/pitch; resize changes projection, not orientation. View-command sequence and interactionEnabled updates are processed even when selectedProjectId is unchanged. A repeated command sequence does not reapply; disable/re-enable never replays stale input.
- Mouse/pen primary drag changes yaw/pitch with thresholded click cancellation; precise monitor click remains valid. Qualify selection at pointerup, commit only the matching trustedclick after compatibilitymousedown, preserving the proved touch-focus fix. Capture/release only where needed and correctly cancel on blur/cancel/second pointer/unmount. Preserve the non-hover pen-release boundary exception when adapting input.
- Touch: canvas horizontal drag looks; keep browser vertical page scroll available (e.g. pan-y). Vertical look has explicit HTML up/down controls. Decide gesture axis before claiming horizontal look; scroll/pinch cancels activation. Do not apply touch-action:none globally. Test rather than asserting compatibility.
- Explicit look buttons and reset are focusable HTML, at least44px intended controls; no page-wide arrow key hijack. Keyboard may drive a named look-control group while focused, with equivalent buttons. No need make decorative canvas the only keyboard surface.
- Reduced motion applies direct changes without interpolation/inertia; no autoplay/audio. Offscreen/hidden suspension, DPR limits, resize, disposal and one shadow caster remain.
- UI owns all URL/history/panel focus. Monitor and direct project shortcuts share one selection path. Open on the next React commit without waiting for camera/timers/network/asset loads. Include immediate heading and full content, close button, Escape and focus return. Preserve orientation because controller remains mounted; disable scene interaction while modal open.
- `#project-<id>` deep links and Back/Forward open/close the same project. Repeated selection adds no duplicate entry. Close returns to a safe studio state without navigating out of the site or erasing unrelated Next history metadata. Specify and test state behavior for fresh deep-link entry separately from same-document open.
- U settles the navigation state table before dividing work. Existing in-article `#studio` links use the same enhanced close/focus path as Close/Escape. Camera orientation survives panel-induced viewport resizing and history changes.
- SSR all evidence uses the existing content data/component. U may reuse ProjectEvidence for the enhanced dialog with a distinct ID prefix, or retain one DOM subtree; no duplicate IDs or independent copy strings. Only one reading surface is exposed to assistive tech when enhanced. Without JS the complete article list/anchors remains visible. When scene fails, direct project controls/reading still work, with explicit reload guidance and a helpful fallback. Keep normal modified/external links untouched.

## Ownership and dependencies

| Lane | Scope | Depends on | Evidence |
|---|---|---|---|
| S—scene secondary orchestrator | `lib/studio-contract.ts`, `components/studio/StudioScene.tsx`, `components/studio/scene/**`; art/composition, perspective look/input, resource/renders | Approved plan and frozen interface above | Separate model and controller performers with shared-helper ownership frozen by lead; independent source/visual critic; camera/model/input tests; actual first render handoff |
| U—interface secondary orchestrator | `app/studio/**`, `components/studio/StudioExperience.tsx`, `components/studio/ProjectEvidence.tsx`; minimal chrome, reading panel, history/focus/noJS/responsive | Approved plan; consumes specified S additive contract | Separate shell/server+CSS and panel/navigation performers if file boundaries permit; independent critique; scoped tests and assembled-ready message |
| I—integration secondary orchestrator | `design/studio-v2/**` reports/scripts and `.omx/artifacts/visual-ralph/portfolio-immersive-v2/**`; owns browser/build/preview after release | S and U complete, repairs handled by owners | Browser/visual checks plus independent evidence/source critic. Final production URL, manifest, screenshots and focused commands |

S and U run concurrently against the frozen contract; temporary assembly imports/type errors are not final failures. No overlapping writes to shared helpers/CSS/UI; secondary leads assign files explicitly and tell children they are not alone. User's nested-Orca request applies to S/U/I; bounded leaf performers report upward and do not recursively fan out. Root owns source freeze, coordination metadata and final acceptance, not delegated runtime files. No new dependencies, public assets, paid generation, personal-photo copying, deployment or commit.

## Delivery order and visual gate

1. Save the v1 source fingerprint/preview baseline; launch S/U. S freezes contract, scene lead owns types/resources/textures split. U assembles viewport shell and immediate panel.
2. **Early visual checkpoint:** once S/U report assembled, one nominated browser owner renders desktop + mobile initial/interior-look and open-project states. Root/designer actually inspect. Require inside-room composition, depth/material richness, credible newly visible surfaces and immediate reading. Any diorama/basic geometry regression is corrected before exhaustive verification. This gate is an engineering/design check, not an extra user-permission stop.
3. Finish targeted input/panel/accessibility tests and source critique; owners fix concrete defects. Stop unnecessary refinements when named criteria hold.
4. I runs affected integrated checks from paired test spec once on frozen source, plus build/typecheck/scoped lint. Root cleanup/delta review and independent final code-reviewer/architect examine only this changed scope. Finish when no blocking findings remain and the actual preview is reviewable.

## Risks and bounds

Perspective interior may expose missing surfaces and monitor undersizing: model all reachable angles, test at320/390, preserve direct navigation. Drag-look can break touch scroll/click or pen focus: test trusted full gesture sequences and retained cancellations. Modal enhancement can hide SSR evidence or corrupt history/focus: tests for noJS, fresh fragments, Back/Forward and failure states. More materials/lights can hurt startup: reuse/instance repeated geometry, original procedural textures, one shadowcaster, no full-screen postprocessing without measured need. Baseline configured lint remains missing-plugin failure; supplemental checks are labelled. No physical device/GPU-memory promise without actual evidence.

