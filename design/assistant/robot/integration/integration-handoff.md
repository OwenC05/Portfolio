# Integration handoff to A, B and root

15 November 2026. Package C delivered an [ordered implementation plan](implementation-plan.md), [state/type contract](state-contract.md) and [36-case verification matrix](verification-matrix.md). No production code, application configuration, server, browser, Blender, paid job, Git branch or package was changed. Only `design/assistant/robot/integration/` was written.

## Decisions ready for root reconciliation

- Extract one existing request lifecycle; pass one immutable validated current-run snapshot to HTML and robot. Immediate clearing covers cards, chips, list, answer/citations, selection and timings together. Next rendered frame contains no old markers; N new markers appear together. Motion only interpolates poses.
- Enforce actual source-only order and semantics after the existing shape parser. Four is the existing server cap; five/duplicate hits or contradictory answer/citation combinations fail visibly rather than being silently corrected. Zero retrieval waits for valid abstention before the no-match pose. Keep the complete-answer/missing-done warning behavior explicit and distinct from malformed/incomplete-answer failure.
- Use separate run, panel and controller/animation identities. Close/cancel/failure invalidate before abort; no stale stream, focus callback, native close event or animation may mutate a newer session. Late asset adoption and return from hidden/offscreen use the latest settled state with no replay.
- Live reduced-motion ON settles next rendered frame; OFF starts nothing. No permanent idle loop. Robot-only failure preserves a healthy room and the full HTML search interface; scene/context failure still leaves HTML usable.
- Use heading focus on desktop and phone. The assistant has no URL/history entry; project navigation takes precedence. 3D cards are display-only, with HTML chips/disclosures sharing selection. This resolves A v01's conflict between clickable background cards and a native modal that disables room input.
- Proposed exclusive leases: G1 shared hook/Workbench/reducer; G2 scene/controller/picker/public scene contract; G3 actual Claude controlled panel/dock/styles; G4 root `StudioExperience` assembly and browser/build evidence. The master plan's provisional G3 `StudioExperience` lease must be reconciled before dispatch; two owners must not edit it simultaneously.

The [eleven-item independent review](../review/blockout-v01/review.md) is mapped H1–H11 in `state-contract.md`. These runtime guarantees incorporate root's explicit steering. Claude's v01 poses, dimensions, count animation, material counts and panel position are evolving proposals, not code contracts or final acceptance. Preserve v01 evidence and independently review v02; implementation must consume a named version, not whichever file changed most recently.

## Small unresolved inputs (not blockers to this document package)

| Owner | Concrete decision/input needed | When it blocks |
| --- | --- | --- |
| A, Claude | Name the v02/reviewed pose-data version; settle friendly eyes, correct panel-pointing side, visible body/tray gap, waiting vs no-match and scene-facing root orientation. Supply settled transforms/durations in agreed axes; distinguish optional gesture beats from data arrival. | Final motion/appearance binding. Runtime can use labelled neutral proxy before final art. |
| A + root | Acknowledge display-only cards and heading focus on every viewport; finalize Ask dock placement and panel side from actual 320/390 room views. A v01 offers card clicking as optional; keep chips fully usable. | G3 layout acceptance and D contract freeze; no need to invent a second interaction mode. |
| B + A | Pin node names/parents/pivots, coordinate conversion, source/export/profile hashes, whether poses are authored numeric transforms or baked clips, exact material/texture slots and exclusion of `APR_card_1..4` stand-ins. Nine provisional moving nodes in A are not yet a certified export. | G2 load/bind and pose implementation. Prefer the already proposed transform poses; no stack replacement. |
| B + root | Supply real robot/profile/manifest installation paths, required image validation policy and separate ownership ledger; reconcile runtime marker allocation with imported parts. Confirm noncasting proposal or account for shadow refresh. | Production loader and actual asset checks. Parser safety caps are not a budget allocation. |
| Root + separate Studio owner | Pin final integrated room revision, target camera and framework baseline; confirm file leases and source-only configuration. Resolve final-room/robot combined allocation from measured bytes/costs. | D final contract, combined performance/product acceptance. Does not block isolated mechanics specifications. |
| Root | Assign build/preview/browser sessions and independent H1/H2 reviewers. Name physical device and screen-reader coverage if desired; leave unrun otherwise. | Integration evidence and final verdict, not authoring. |

## Target refresh and budget boundary

Starting engineering snapshot was 17:16 UTC on 15 November. The [refreshed source evidence](source-evidence.json) records A HEAD `c0348b77adbfe09034e82a9e1a3cee34052d4735` and S HEAD `8b565b23290c1faa5a47e2bd62586ac4b25e09df` plus actual file hashes. The ten relevant S seams checked against the starting snapshot are unchanged despite S HEAD advancing. Nine match A; `app/studio/StudioShell.tsx` differs. Read-only checks did not establish a new final-room build. Current controller still loads `loadStudioPilot` and calls `createStudio`; staged full-room/M3 evidence must not be described as this production room.

Before a code/asset dispatch, refresh just the affected seams, manifest and camera again. Current `STUDIO_VIEW` is eye `[-0.7,2.8,3.4]`, 58° desktop/64° mobile, homes `(-4,-6)` / `(-13,-8)`, yaw `[-38,58]`, pitch `[-16,12]`, near/far `0.1/30`, fixed eye and two units/metre. Controller chooses mobile at width <=640 or host aspect <0.9 and caps DPR at 2/1.5. The staged phone harness's 74° is a separate camera. Zone A and the side-sheet relationship need actual composition/occlusion proof at the chosen camera, without moving accepted room objects or redesigning it.

No new robot budget is assigned here. The starting report's 1,500,351-byte combined forecast was already 351 bytes above the 1,500,000-byte scene gate; it is historical forecast evidence, not a measurement of today's final build or an available allocation. Root/B must refresh the final inventory and combined transfer before approving asset capacity. Preserve existing whole-scene limits: 200 peak draw calls, 200000 rendered triangles, 1500000 encoded scene-JS-plus-assets bytes, one shadow-casting light and the scoped 10-second requested-RAF p95 <=33ms check. Design reserves and parser limits do not increase those gates. Include robot, runtime markers, new assistant chunks and relevant dependencies in the all-interactions request inventory.

## Who runs and reviews evidence

Root owns the sole `.next` writer and any start/stop/build/preview actions. No worker in this preparation wave owns those actions. Later G1/G2 authors run focused CPU tests in their leases; root coordinates application typecheck/lint/build and browser sessions. The existing Studio browser expressions need exact origin, chunk/GLB URLs, current configuration and an isolated page/context; do not use another worker's tab or assume an old port. Main S remains separately active and read-only until root coordinates a specific later integration surface.

The [matrix](verification-matrix.md) names existing tests and adaptation gaps. The assistant helper is `/ask`-specific, and its old synthetic `retrieval-start.question='fixture'` would violate the new echo check: update fixture transport to echo the actual submitted normalized question. CPU controller/loader shims remain useful for ordering, identities and disposal ledgers. They do not establish real image decoding, native focus/gesture behavior, GPU reclamation, physical-device performance or screen-reader usability. Preserve that distinction in every receipt.

H1 is an independent Codex technical reviewer; H2 is an independent actual Claude reviewer distinct from A/G3. Authors provide reproducible evidence and respond to defects; they do not grant their own visual or product acceptance. Final visual evidence uses actual product captures at 320/390/desktop with source/asset/build/camera identity, including loading/error/empty/four-hit and reduced-motion states as applicable. Avoid duplicating screenshots or tests that add no new behavioral evidence.

## Required evidence fields for later integration

One candidate receipt should contain these fields, with `unrun`, `blocked` or `failed` where appropriate rather than invented values:

| Group | Fields |
| --- | --- |
| Candidate | checkedAt UTC; checkout/branch/HEAD; dirty relevant-file hashes; framework/Three versions; integration checkpoint; build ID and production/dev mode; preview origin and route. |
| Asset/design | design/pose version and independent verdict; editable-source/export/profile/manifest SHA-256 and paths; provenance/production receipts; local/world transform and bounds; proxy/final labels. |
| Camera | eye, FOV, yaw/pitch/home, viewport/host dimensions, DPR, camera source hash; explicit staged-vs-production distinction. |
| Behavior | matrix ID; setup/action/fixture and actual source-only event trace; run/panel/revision identity; expected/observed state and count; focus/URL/scroll; pass/fail/blocked/unrun; evidence path. |
| Resources | requested/cancelled RAF and settling evidence; observers/listeners; allocation/disposal counts; late load/StrictMode/context-loss method; CPU shim vs actual browser decoder qualification. |
| Performance | full actual request inventory and encoded sizes; missing/zero sizes; first/settled/forced-refresh peak calls/triangles; shadow caster count; scoped 10-second requested-RAF distribution; measurement hardware/browser/version. |
| Access/visual | screenshots/recording path with viewport and candidate identity; actual Claude reviewer/provider receipt; screen-reader/device name/version and actions, or explicit unrun status. |
| Checks/decision | command and exit code/log for required checks; author and independent reviewers; unresolved risks/dependencies; root disposition without broadened thresholds. |

## Preparation validation and completion boundary

[Validation receipt](validation.json) records Markdown link resolution, source-anchor existence, interface-sketch consistency and requirement-row coverage for this package. [Source evidence](source-evidence.json) records the relevant source refresh only. No application test, build, browser, asset decode or visual/device verification ran in package C. The documents are implementable inputs; final art, target-room reconciliation, measured allocation, implementation and independent product acceptance remain subsequent work.
