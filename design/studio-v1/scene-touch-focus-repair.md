# Studio scene activation repair handoff

14 November 2026. Parent task `task_cd5a9fa75de0`, dispatch `ctx_f7f0cf84fb47`; scene secondary coordinator `term_ac91c37166d21970cbd34c775420129b`. Child Run `run_bf28692ea960`.

**Source repair complete and independently approved.** The scene now commits a qualified gesture at its matching trusted canvas click, after compatibility mouse focus, rather than at pointerup. The existing UI callback then owns heading focus, scrolling and history. The final revision also preserves the release-boundary sequence of a non-hover pen while retaining exact pen picking. All 33 CPU regressions and full TypeScript pass. Integration I owns the affected authoritative browser/build rerun; this source handoff does not replace it.

## Defect and correction

The real Chromium traces in `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/touch-focus-defect.json` showed four failures: pointerup selected the project and focused its existing h2, then touchend and compatibility mousedown stole focus. Instant scrolling retargeted that mousedown to evidence content and focus ended on `main#work`; ordinary motion left it on the hidden canvas. The prior center-tap CPU checks did not model those browser default actions.

The controller retains the qualified pointer ID/type, up coordinates and project until click. Matching trusted click consumes that state before its one callback. Click coordinate rounding cannot change the already qualified exact/expanded target. Scroll, drag, cancellation, mismatched/new/outside input, resize, hidden/offscreen changes, failure and teardown invalidate the gesture. Listeners remain passive and cleanup-owned; no timer, global focus retry, pointer capture, default prevention or scene-owned document navigation was introduced.

Independent review found a regression in the first repair: the completed release exception allowed touch only and canceled non-hover pen out/leave before click. Its original test mirrored that incorrect expectation. The accepted follow-up changes one executable predicate and its comment to preserve a matching released **touch or pen**, with no active gesture and no held buttons. Active/mismatched pen events still cancel; a pen outside the actual plane remains rejected even inside the touch-expanded region. Mouse leave behavior is unchanged.

The critic grounds that pen sequence in [W3C Pointer Events 3, pointerup](https://www.w3.org/TR/pointerevents3/#the-pointerup-event) and the click identity/coordinate handling in [the click event section](https://www.w3.org/TR/pointerevents3/#the-click-auxclick-and-contextmenu-events). This is a source/specification conclusion plus CPU evidence, not a physical-device claim.

## Scope and final freeze

Runtime/test changes are limited to:

- `components/studio/scene/controller.ts`
- `components/studio/scene/verify-controller.mjs`

The private report/brief artifacts are under `design/studio-v1/scene-coordination/`; this report and the scene-report follow-up are S evidence only. No visual/model/content/dependency/contract/UI/resource-ledger edit was made by this repair. Optional disposal diagnostics remained deferred. I's separately authorized unavailable-caption change belongs to I and is not claimed as S work.

| Final source | SHA256 |
| --- | --- |
| `controller.ts` | `728C12AFFD53A069FD684A725C53CEB39A046AD569A43314A9AC2DD5348222B0` |
| `verify-controller.mjs` | `D26A7F4EB94678F1DBA7C32922F1FF35F3019231E71A712117E5E3D1AB49E2C4` |

S explicitly froze this revision to I in message `msg_1ef083082da5` after the writer settled. The final independent critic verified both hashes before/after review and reverse-delta hashed the controller back to its previous freeze to substantiate the two-line pen scope. Scene lead freshly reconfirmed the same final hashes before this handoff. No further source mutation is planned; any new required edit must explicitly invalidate I's freeze first.

Preserved source checks include resources SHA256 `756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509` and adapter SHA256 `29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC`. The pen performer additionally compared 12 boundary files before/after; details are in its report. These checks preserve current concurrent work rather than claiming a clean Git checkout.

## Verification and review

| Evidence | Result and limit |
| --- | --- |
| Initial touch tests written before the first fix | Original controller produced 11 failures in the expanded 30-test suite, including all four synthetic 320/390 ordinary/reduced focus-order fixtures. |
| First click-boundary repair | 30/30 CPU tests and TypeScript passed, but independent critique found the wrong non-hover pen expectation; that green result did not close the pen path. |
| Focused pen regressions before the correction | 33 tests: 31 passed, 2 failed on old controller `65BE133F...`; exact-hit completed pen expected selection but received none. |
| Final CPU harness | `node components/studio/scene/verify-controller.mjs`: **33 passed / 0 failed**, independently rerun at the final freeze. Actual Three geometry/rays with synthetic trust, DOM, focus/default-action, renderer and hook fixtures. |
| Final full TypeScript | `tsc.cmd --noEmit --incremental false --pretty false`: **passed**, independently rerun. Targeted source/transitive check also passed for the performer. |
| Supplemental installed Next lint | **0 errors / 0 warnings** on controller and harness under an in-memory Next config. This does not apply the absent root TypeScript-plugin rules. |
| Configured lint | **Still failed** because `@typescript-eslint/eslint-plugin` is absent. No config/dependency bypass or repair was made. |
| Initial independent repair/cleaner critique | REQUEST CHANGES for R1 non-hover pen; no other mandatory source cleanup. Guard/candidate/listener purposes classified; no speculative timer, fallback layer or navigation abstraction added. |
| Final independent exact-delta re-review | **APPROVE, R1 closed**. Historical report bytes retained, exact delta and current hashes verified; no remaining source blocker or further cleanup requested. |

The final tests retain touch expanded bounds and overlap policy, exact mouse/pen picking, passive scroll/drag cancellation, once-only matching click, cancellation of stale candidates and lifecycle cleanup. Added pen fixtures positively test exact hits through release out/leave, reject a nearby point independently shown to be touch-eligible, and exercise wrong ID/type/held-buttons plus active/canceled/dragged pen sequences. The modeled history increment and final focus assertions are CPU oracles, not actual browser history/focus measurements.

The independent reviewer applied the installed `ai-slop-cleaner` skill as the requested **read-only delta** against `cleanup-review.md`. It did not redo the 14-file no-op review or optional FND-1 diagnostics. Writer and reviewer passes were separate; only the assigned source performer edited runtime/tests. The final pen predicate was a required correction to an invalid platform assumption, not a new speculative guard family.

## Orca records

| Slice | Task | Dispatch | Outcome |
| --- | --- | --- | --- |
| Initial click repair writer | `task_5078bcca7bcc` | `ctx_b8afe52fa717` | Succeeded; source/tests/report delivered |
| Independent repair and cleaner-delta critique | `task_3a8940e6d196` | `ctx_b7eb19cd95a7` | Review completed; R1 required correction |
| Narrow pen correction writer | `task_1b0b148c9021` | `ctx_19314e21f039` | Succeeded; 33 tests and replacement freeze |
| Independent pen-delta re-review | `task_3934d6c1fb6a` | `ctx_903fc39a4b0c` | Approved; R1 closed |

All four children settled; no helper failed or remains active. Existing assignments were retained through acknowledgement delays without duplicate worker starts or identity bypasses. I confirmed a safe source-edit window before the pen correction, and received explicit replacement hashes afterward.

Detailed evidence: `scene-coordination/touch-focus-performer-report.md` (final receipt hash `8FE2C7F1EA8265DD8EB5871652C481380F6DF8CBCF2064353309F3F819210BDA`) and `scene-coordination/touch-focus-critique-report.md` (final receipt hash `A986E7585D7188C27C6129628EF2CA692CCA6226A61F3D939C047726E330EB63`). The critique's initial REQUEST CHANGES is historical; its appended final re-review approves the corrected hashes above.

## Integration boundary

No S worker operated the browser, preview or production build. I received the final freeze and owns affected trusted 320/390 touch, both motion settings, exact mouse/pen, expanded edges/overlaps, duplicate-history, native scrolling, pen release-boundary and teardown evidence. Root reported real touch focus and broader trusted checks passing for the **earlier** click repair; those observations are not silently relabelled as measurements against this pen-corrected freeze.

I's `pen-release-validation.mjs` distinguishes ordinary trusted CDP pen gestures from explicitly labelled injected release-boundary events. Its pre-correction instrumented failures support R1; the corrected rerun belongs to I. Neither CDP nor injected boundary events prove behavior of physical non-hover pen hardware. Cross-browser/device and assistive-technology limits remain explicit. Unchanged rendering/content evidence may be carried forward by I with its source/hash justification; no full visual or performance rerun was performed in this lane.
