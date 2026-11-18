# In-room apprentice prototype: subtask breakdown

Coordinator plan, updated 16 November 2026. Owen asked to put Higgsfield character refinement before asset production and in-room integration. Reviewed v02 is a structural reference, not the chosen final appearance. This plan does not authorize paid generation or claim implementation has started. The prior sequence that postponed visual refinement until after P9 is superseded.

## Target result

A distinctive apprentice character, refined visually in Higgsfield first, followed by a local/feature-branch Studio preview where it fits the room, can be opened with mouse/touch/keyboard, and presents the existing assistant's real sources through matching tray markers and readable HTML. The current Blender blockout supplies lessons about articulation and expression. Its cream/cyan palette, surface finish and exact proportions remain revisable. Confirm the selected concept's readability with a simple composition check before Meshy production; full interactive integration follows asset preparation.

The main Studio checkout stays under its existing owner's control. The assistant branch is the implementation workspace. Text generation stays disabled. No new persona claims, retrieval expansion, ambient animation loop, camera redesign or global widget is included.

## Inputs already ready

- Reviewed character and poses: `design/assistant/robot/apprentice/README.md`, `design-spec.md`, and `review/blockout-v02/review.md` (isolated concept PASS).
- Versioned source binding and export plan: `asset-pipeline/v02/alignment.md:5-43`; 15 card-free source bindings, eight moving nodes, held clearance and axis conversion. Actual GLB/export costs and swept bounds are still unmeasured.
- Runtime/state decisions: `integration-decisions.md:17-34` and `integration/state-contract.md` (one snapshot, immediate source clearing, finite pose motion, accessible modal).
- Exact future file ownership: `integration/implementation-plan.md:30-39`; root owns `StudioExperience.tsx`, Claude owns controlled panel/dock/styles, Codex owns state and scene mechanics.
- Verification coverage: `integration/verification-matrix.md` (36 planned scenarios, not executed tests).

## Subtasks

### Character refinement comes first

| ID | Owner | Work and deliverable | Depends on | Done when |
| --- | --- | --- | --- | --- |
| H0 | Claude visual designer | Prepare a small set of distinct Higgsfield character directions using Owen's uploaded inspiration and useful v02 renders. Retain the apprentice personality, expressive face, separate articulating parts and source tray. Explore silhouette, proportions, materials and distinctive details without treating the blockout palette as approved. | Existing reference and v02 lessons | Concrete visual briefs and generation inputs are ready; concept alternatives differ meaningfully rather than only recolouring the same robot. |
| H1 | Claude; root coordinates production | Produce the bounded Higgsfield concept set through the available workflow once the concrete job and any unresolved cost authority are established. Show the actual images together for Owen's collaborative character choice, then refine the selected direction. | H0 | A chosen visual direction is recorded against actual generated images. A prompt pack or an isolated blockout PASS is not substituted for appearance selection. |
| H2 | Claude visual designer; Codex mechanical support | Produce consistent front, side, back and three-quarter references of the chosen character. Check expression, separable parts and small-screen silhouette against the room baseline using an isolated proxy/composition study. Revise the asset bindings only where the new design requires it. | H1, P0 | One coherent character reference set and a practical moving-parts handoff are ready for Meshy/Blender; no old v02 measurements are silently presented as measurements of the new design. |
| H3 | Codex asset worker; Claude visual review | Use the selected references for one versioned Meshy candidate after concrete settings/cost authority are resolved. Inspect it, then clean and separate parts, repair materials/topology, and establish pivots in a dedicated Blender file. Preserve expression-critical geometry for native cleanup where appropriate. | H2 | An editable candidate matches the chosen design and is ready for export. Provenance and any necessary repairs are recorded; shared Studio authoring is untouched. |

### Asset and interactive Studio work

| ID | Owner | Work and deliverable | Depends on | Done when |
| --- | --- | --- | --- | --- |
| P0 | Root / Codex | Pin the exact room, camera and source revision for this preview; confirm file ownership and reserve one build/browser slot. Record a baseline capture and current transfer/render evidence. Coordinate a read-only handoff of the current Studio if it differs materially from the assistant checkout; do not merge or copy the evolving main room implicitly. | None | A named baseline receipt identifies actual source hashes, origin/build mode, viewport/DPR, camera and available measurements. No staged 74-degree screenshot is presented as the 64-degree production camera. |
| P1 | Codex asset worker | Export the cleaned H3 candidate as a robot-only GLB. Preserve the selected character's agreed moving parts, strip illustration cards/review scene/cameras/lights/timeline, consolidate material roles and extract settled pose values in the agreed axes. Version the candidate profile if it differs from v02; write export script, manifest and validation. | H3, P0 | Export reimports with correct scale/pivots and neutral pose; exact node/material/bounds/raw/encoded-size values are recorded. Historical v02 sources remain unchanged. |
| P2 | Claude composition/UI designer | Define placement and presentation of the selected character against the pinned room: anchor, fixed orientation toward the eye, scale, clearance and panel side. Set Ask entry placement at 320/390/desktop. Specify the intended actual-room shots and the cue for the selected HTML source. | H2, P0 | Concrete placement/transform and UI proposal is ready for P3/P6. It preserves project screens and acknowledges the fixed eye; no screenshot alone is claimed to prove picking or focus. |
| P3 | Codex scene worker; root assembly | Load the P1 model into a scoped Studio preview and apply P2's placement. Add separate robot asset ownership and failure fallback, with no motion yet. Root owns assembly and the capture/build slot. | P1, P2 | Actual room captures show intact eyes, countable fixture markers and body/tray clearance at required sizes/poses. No project target is obscured. Any fixture markers are visibly labelled as a preview, not real retrieval. Record the incremental asset/render cost. |
| P4 | Codex assistant-state worker | Extract the existing request lifecycle into one reusable hook/reducer and expose current-run state/actions for Studio. Preserve valid `/ask` behavior; add the agreed ordering, cancellation, stale-response and terminal clearing checks. | P0 | Existing assistant regressions and focused transport/state tests pass; one request/parser owns each submission. A stable typed interface is handed to P5/P6. Independent Codex review checks this interface and request lifetime before dependent integration. |
| P5 | Codex scene worker | Implement finite attention, source presentation, no-match and dismissal poses; runtime source markers and selection display; robot activation and depth/occlusion; reduced-motion and hidden/offscreen handling. | P3, P4 interface | 0/1/4 markers correspond to the current snapshot; old markers never survive its clearing frame; motion settles and stops; late asset load adopts current state without replay. Focused scene/lifecycle tests pass. |
| P6 | Claude UI worker | Implement the Studio-only Ask entry and controlled accessible panel using P2's design and P4's interface. Include question input, source chips/excerpts/links, real timing, cancellation/retry and contact/no-match behavior. | P2, P4 interface | View works from supplied state/actions with no private fetch/stream. Desktop and 320/390 layouts fit; all information has an HTML path. Root controls modal/focus/history lifecycle. |
| P7 | Root / Codex integration | Connect the one snapshot to the real room, marker presentation and panel. Wire opening, heading focus, return focus, Escape, project takeover, scroll locking and source navigation. Replace fixture results with the actual existing API. | P5, P6 | Visitors can open the robot, ask a real question, inspect matching sources and close it without losing room/project state. Cancel/error/rapid resubmit/close-reopen cannot display stale sources. Robot or WebGL failure preserves usable HTML access. |
| P8 | Independent Claude reviewer + independent Codex QA worker | Review actual-room appearance and interaction; run targeted checks from the existing 36-scenario matrix and measure baseline-to-prototype cost. Keep visual judgment and technical validation independent of their authors. | P7 | Findings include exact build/asset/camera identities. All six inherited concept repairs still hold in-room; keyboard/touch/reduced-motion/error paths work; measured constraints and any untested physical-device/screen-reader gaps are explicit. |
| P9 | Owning workers; root final verification | Fix concrete review failures, recheck affected evidence, run required typecheck/lint/tests/build in the reserved slot and save a feature-branch preview checkpoint. | P8 | A reproducible working prototype and concise report identify what works, what remains provisional and the final asset's measured target. No production promotion or unrun performance claim. |

### Parallel execution and ownership

H0-H3 form the creative dependency chain. P0 can run alongside H0/H1, and P4 can run after P0 without depending on the final appearance. After H2, P2 can run alongside H3/P1. P3 follows the exported asset and placement; P6 can proceed alongside scene work once the P4 interface is reviewed. P5 and P6 are separate scene/UI lanes. P7 is the root integration step. P8 has independent Claude visual and Codex technical reviewers in parallel, using separate evidence surfaces or a scheduled browser slot. Parallel engineering must not bypass H1's character choice or cause a second design owner to edit Claude's outputs.

Use actual Claude for every design/art/UI lane and Codex for all engineering lanes. Keep configured provider model/effort defaults unless an explicit supported choice is made; do not invent provider provenance. Each dispatch names allowed files and evidence and tells workers they are sharing the checkout. Do not concurrently run two workers owning scene/controller files. The scene worker can continue P3 into P5 through a bounded follow-up.

Planned file boundaries follow the existing G1-G4 table. Asset authoring/export outputs get a new prototype candidate directory. Codex state owns Workbench/hook/reducer/tests; Codex scene owns loader/controller/picker/types/presentation; Claude owns controlled panel/entry/Shell/styles; root owns `StudioExperience.tsx`, assembly, browser scripts, build processes and Git. No worker owns another lane's files implicitly.

## Checks that matter before the prototype is called ready

1. **Composition:** both eyes and 0/1/4 markers separately readable at the real anchor/camera; no body/tray collision or project-screen obstruction; no-match fin points toward the actual panel.
2. **Truthfulness:** all source views reflect the same current run; no fabricated progress, extra markers, hidden truncation or result retained after cancellation/failure. Zero retrieval remains pending until valid abstention.
3. **Access and navigation:** mouse/touch/keyboard activation, heading and return focus, Escape, one modal, project history/deep links, readable source HTML and fallback without WebGL.
4. **Lifetime and motion:** finite gestures, interruption, immediate live reduced-motion settling, no replay after hidden/offscreen return, optional-asset failure isolation and cleanup after late load/unmount.
5. **Cost:** actual prototype delta for model, eyes/marks and shared assistant JS; peak/refresh/settled counters and scoped scheduling. A prior forecast's margin is not an assigned allowance. A failed combined performance gate limits deployment/acceptance; it does not prevent an isolated local measurement.

Use the relevant existing assistant/Studio tests, then required typecheck/lint/build for application changes. No repeated broad test runs for unchanged documentation. Stills and CPU shims do not prove real focus, image decode, GPU behavior or physical-device performance.

## Subsequent refinement

After P9, make only evidence-led visual, asset or performance repairs identified in the integrated preview. Initial Higgsfield character development and Meshy/Blender asset preparation now happen before that preview, through H0-H3. Repeat affected checks after changes; do not defer the character's identity until the end of engineering.

## Status

Execution authorized by Owen on 16 November 2026. Three Orca dispatches returned ready in run_4261d20ca7d6:

- H0-H1, actual Claude: task_89ee276dbf32 / ctx_f2c434fc802c reported succeeded. Three original Higgsfield stills and receipts are in higgsfield-concepts/; root read the report and viewed A, B and C. One batch, 8.25 existing credits reported, no generation retry or purchase. Owen selected A on 16 November: "yes i like A lets go for it". The porcelain clerk is now the chosen direction; refine its gaze, bookmark detail, gloss and closed body, then produce consistent reference views. These first-round stills are not multi-view, in-room or mobile evidence.
- P0, Codex: task_68ddf1006519 / ctx_a72e3502ac1c. Owns new integration/baseline-2026-11-16/; current source/camera/room receipt, with runtime measurements explicitly separated.
- P4/G1, Codex: task_acb7be875957 / ctx_d27e34c8dcdc. Owns the specified assistant Workbench/hook/reducer/transport tests and new implementation handoff; no scene/UI changes.

Root verified the assistant checkout, branch and HEAD c0348b77adbfe09034e82a9e1a3cee34052d4735 and assigned exclusive files before dispatch. This satisfies the workspace/ownership prerequisite for P4; its pure request-state work can proceed while P0 finishes room/camera evidence, which it does not consume. H2-H3 and other P tasks remain planned. Root owns integration/build/browser; no worker has a shared .next writer or main-checkout lease. Ready launch receipts establish delegation, not completed work. Independent request-state review follows P4; consistent views and Meshy follow Owen's concept choice.
