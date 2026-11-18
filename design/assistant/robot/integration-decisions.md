# Apprentice integration decisions, checkpoint D1

15 November 2026. Coordinator reconciliation of A v02, B draft 0 and C. This is an implementation-plan checkpoint, not a production asset freeze, user appearance approval or runtime acceptance.

## Inputs

- Design: [A v02](apprentice/README.md), [pose and geometry specification](apprentice/design-spec.md), [UI/state specification](apprentice/ui-and-state-spec.md). Source `.blend` SHA-256 `ac48061fa08e53008be541e14f9e970c1bef9710089804c9fac17a683e1d7e1c`; script `2fd5ecdf58dd9d0298eddee2beea5af613189bbe2836dbe87f1b73b26fc6709b`. [Independent v02 recheck](review/blockout-v02/review.md): PASS for isolated concept only, with text alignment and explicit deferred conditions. v01 remains preserved in `apprentice/blockout/` and `apprentice/v01-docs/`.
- Asset: [B draft contract](asset-pipeline/asset-contract.md), [readiness](asset-pipeline/readiness.md), [budget evidence](asset-pipeline/budget-and-validation.md). B transcribed v01 parts; it does not yet certify v02 dimensions or node counts.
- Integration: [C state contract](integration/state-contract.md), [implementation ownership](integration/implementation-plan.md), [36-case verification matrix](integration/verification-matrix.md), [handoff](integration/integration-handoff.md). C is proposed engineering, not executed runtime evidence.

All three packages are now present in this checkout. A's statement that Codex directories were unavailable describes its earlier inspection and is no longer a current blocker. C's old M3 budget paragraph is historical; use B's newer M4 forecast, still not measured robot capacity.

## Technical decisions adopted for the plan

1. **One request lifecycle and one current-run snapshot.** Extract the existing Workbench transport into the smallest shared hook/reducer needed. Both HTML and robot derive their hits, selection and status from that snapshot. Preserve the API and source-only behavior; no duplicate fetch/parser, global store, retrieval expansion or new generation path.
2. **Result data changes together.** Submit, supersession, cancel, close and failure clear obsolete markers/chips/list/answer/selection/timing together. The next visible rendered frame contains no stale markers. All N new current markers appear together. Only robot pose transforms may ease; data does not wait for animation. A hidden canvas need not render, but its first resumed frame must use current state.
3. **No-match is a validated result, not a failure or waiting cue.** Zero retrieval remains pending until the matching source-only abstention arrives. Contradictory order/count/answer/citations are recoverable protocol errors, not silently repaired display data. Maintain C's explicit clean-answer/missing-done warning compatibility; do not conflate it with malformed trailing data. Verify these rules against actual server fixtures before coding assumptions into the reducer.
4. **Separate identities.** Current request, panel session and controller/motion lifetime each fence stale callbacks. Selection uses the current request and source/chunk identity, not a persistent slot number. Close invalidates before abort. Late asset load and hidden/offscreen return take the latest settled pose without replay.
5. **Finite runtime poses for the first implementation.** Plan a neutral articulated GLB with authored numeric pose targets, not baked demonstration clips. Source marks are generated from current hits and excluded from the GLB. Imported resources belong to the loader; generated markers and pose scheduling belong to the presentation owner. No permanent idle render loop, extra lights or animation framework is needed.
6. **Live reduced motion.** Turning the preference on cancels remaining beats and settles the latest pose on the next visible rendered frame. Turning it off starts nothing. This is a runtime requirement; still renders and the demonstration timeline do not prove it.
7. **One modal owner.** Root's `StudioExperience.tsx` owns panel arbitration, native dialog lifecycle, history precedence, focus and scroll locking. Claude supplies controlled panel/dock views. Propose display-only scene source cards with selection through HTML chips/list while the modal is open; do not bypass background inertness to make WebGL cards clickable. Heading focus on both screen sizes avoids unexpectedly opening the phone keyboard. Claude's v02 recheck will assess consistency with the visual plan.
8. **Studio failure boundaries.** Optional robot load failure leaves a healthy room usable. WebGL/scene failure leaves HTML source search/contact usable. Request and asset status are independent. No global robot widget or asset request outside Studio.

## Exclusive planned file ownership

Use C's [G1-G4 file table](integration/implementation-plan.md) for implementation dispatches, with these root decisions:

- G1 Codex owns shared assistant state, Workbench extraction and its focused tests.
- G2 Codex owns scene/controller/picking/loader/presentation and `lib/studio-contract.ts`.
- G3 actual Claude owns the controlled assistant panel, entry, `StudioShell.tsx` and relevant styles.
- G4 root alone owns `StudioExperience.tsx`, assembly, browser helpers, build slots, Git and preview publication. This supersedes the master's earlier provisional G3 lease on `StudioExperience.tsx`.

No worker changes a second lane's files without a recorded handoff. New paths remain planned until created. The main Studio checkout remains read-only to this run.

## Still pending before the relevant dependent work

| Input | Concrete remaining decision/evidence | Dependent work |
| --- | --- | --- |
| Independent v02 visual recheck | Completed: PASS for isolated concept. Author completed text-only D1 alignment; no further render/review loop is required for that correction | User appearance review and later in-room proof |
| Exact v02 asset/pose table | Upper lid removed; eight moving nodes; eye spacing changed; tray lowered. Held-pose clearance is 0.42 x 0.28 x 0.52 m, centred at authoring Y=-0.012 m and Z=-0.04 m relative to the hover root. A full swept envelope remains unmeasured. B is assigned a versioned v02 alignment; do not reuse its v01 table blindly | Final export and runtime binding |
| Root facing and composition | A assumes robot faces the fixed eye. At an uncorrected 35-degree angle, cards 3/4 overlap. Validate the wrapper orientation, clearance, screen occlusion and HTML panel relationship in the actual room/camera | Placement acceptance and trustworthy marker readability |
| Room/build baseline | Current assistant branch's pilot camera is a development reference (58-degree desktop, 64-degree phone). No final full-room import/merge is selected by this checkpoint | Final in-room proof and combined acceptance |
| Measured allocation | B's M4 point forecast 1,462,612 gzip B and sensitivity 1,559,302 B are not robot capacity. Include GLB, dynamic eyes/marks and assistant JS with remaining room work and reserve | Final asset size/profile limits and performance acceptance |
| User appearance review and selected production request | Show the reviewed concrete concept; then prepare the exact chosen Meshy input/settings/cost if following that route. No paid job has run | Final Meshy production, not further independent review |

The planning deliverables A, B and C have been received. D1 resolves technical ownership and state behavior; remaining appearance, composition and allocation inputs are explicit. No application tests, asset export, real-room rendering or product acceptance is claimed here.

Text alignment receipt: author task `task_1570c9c22e81` completed the no-match/protocol/modal/focus corrections and removed stale directory notes. Geometry and renders were not regenerated. The selected-card lift remains a proposed display-only mirror of HTML selection, not a WebGL input target. Held tray-depth extrema reported from the script are -0.142 to +0.118 m in Blender Y (forward=-Y), which fit the 0.28 m box centred at -0.012 m; the reviewer's tentative -0.03 m centre would exclude the carried rear edge. This does not certify all transition extrema.
