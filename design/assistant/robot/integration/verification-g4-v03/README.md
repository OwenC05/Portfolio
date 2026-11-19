# G4 v03: runtime repair integration verification

18 November 2026. Root independently reviewed Codex's G2 runtime repair and tested a fresh production build. **The trusted robot-head activation failure and both identified cleanup failures are closed for these pinned sources.** This is bounded integration acceptance, not final deployment, physical-device, motion-clearance or performance certification.

## Independent runtime review

Root read the exact before/after copies and source delta in [scene-cleanup-v02](../scene-cleanup-v02/handoff.md), including the new controller feedback and actual-object cleanup regressions. The three production changes are small and preserve the existing ownership/input contracts:

- Starting a pointer press resets gesture/capture state without clearing established hover. Actual cancellation still clears hover. Trust, pointer identity, compatibility mousedown, modality, drag and unrendered-geometry guards remain unchanged.
- Imported root detachment drains its existing resource owner in `finally`. The existing owner marks identities before attempted disposal and isolates release exceptions.
- Generated cards attempt every detachment and each of their three independent resource releases even when another attempt throws. The existing disposed flag preserves idempotence.

No new blocking defect was found in that delta. The feedback tests model the root commit between actual controller input handlers and include a genuinely pending-geometry negative control. The cleanup tests use actual installed Three objects/parser and count resource-release attempts. Such counters do not prove GPU memory reclamation.

## Build and test evidence

Build ID: `cFKSWm6Bayf__QstZY2CC`. `source-before.json` verifies all supplied repair pins, the original 24 owned runtime pins with explicit repair overrides, and the previous build's application inputs. `source-after.json` confirms all 83 current application/config/public inputs remained unchanged across verification.

`checks.json` and its logs record:

- 105/105 controller, robot, cleanup and frozen independent runtime probes passed. This includes the two original independently supplied cleanup regressions, unchanged.
- Repository lint passed.
- Production build passed, including its TypeScript check.

The earlier broad assistant/retrieval suites remain recorded under v02; they were not rerun without an affected behavior. The build emits the existing stale Browserslist-data advisory; no dependency change was made.

## Actual browser evidence

`lifecycle/checks.json` records **15/15 passing checks** against the new build. A calibrated native trusted click landed on CANVAS at CSS `(1130,310)` over the visible robot head and opened Ask with heading focus. The previously failing activation now succeeds through the real root/scene feedback path.

The same uninterrupted run verified keyboard containment, real four-passage LexisNexis retrieval with matching tray cards, arrow focus and source selection, clearing stale content during a new request, cancellation/abort/focus, a controlled error, a real unsupported-topic result, hash navigation without Ask focus restoration, same-dialog project takeover with request abort and project-heading focus, and source-route navigation without an intermediate Ask return. Pending/error transport is deliberately controlled; no model-generation quality is inferred. Generation remains off.

Root inspected the new selected-source screenshot. Appearance inputs remain unchanged from the v02 Claude visual PASS. The browser console query after the run returned no entries; it is not a comprehensive lifetime console audit. The page was returned to the Studio at 1440 by 900.

Observed selected-source frame: 98 draws, 94,816 triangles, 40 geometries, 12 textures. The settled idle render count stayed at 2 over the 500 ms check. These are observations of one state, not peak allocation, FPS, transfer or mobile budget acceptance.

## Preview ownership and remaining work

Root verified the old preview's exact PID, creation time, executable and command before stopping it. `preview-process.json` identifies the new hidden, root-owned preview on `http://127.0.0.1:4193/studio`. Main Portfolio and port 4181 were untouched.

The separate independent G4 recheck passed both root focus/attention findings in [its report](../../review/root-assembly-g4/recheck-v02/review.md). Claude's [v02 visual recheck](../../review/integrated-visual-g4/recheck-v02/review.md) closed both medium UI findings.

Still separate: independent export-validator review, broader interruption/pose/camera clearance, combined performance/transfer measurements, physical pen/touch and assistive-technology checks, and Git delivery. No deployment, merge, paid call, asset edit or final all-gates acceptance occurred here.
