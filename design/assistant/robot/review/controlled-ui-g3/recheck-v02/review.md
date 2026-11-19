# G3 repair recheck

18 November 2026. Independent Codex review, task `task_4f41633ed783`, dispatch `ctx_22b48f7f32c1`. **PASS for the two repairs and bounded wiring readiness; both original findings close.** No application file was changed by this review. This is not approval of the unwired Studio integration or a real-browser focus result.

## Findings closed

**1. MEDIUM — missing source-chip arrow navigation: CLOSED.** `components/studio/assistant/StudioAssistantPanel.tsx:210` handles unmodified ArrowLeft/ArrowRight over the current ordered hits; `:224` resolves the target by chip ID and `:227`–228 checks its DOM run ID and hit key. Buttons attach the handler at `:369`, retain native `type="button"`, and have no roving or negative `tabIndex`. One-hit arrows prevent default and retain focus. The handler does not select, expand, submit, scroll a row or queue work.

Eight new durable tests in [studio-panel.test.cjs](../../../../../../tests/assistant/studio-panel.test.cjs), beginning at line 875, independently exercise actual transpiled component handlers:

- All eight adjacent moves across four chips, including wrap in both directions, with deliberately reversed source order; focus changes before any simulated commit, while state identity, selection, actions and queued work remain unchanged.
- One hit, both arrows, no extra focus call or action; existing selected passage preserved while arrows move chip focus.
- Each Alt/Ctrl/Meta/Shift modifier with either arrow; Tab/Shift+Tab, Enter/Space, vertical arrows, Home/End/Escape and Ctrl/Meta+Enter remain unhandled on chips.
- Missing target, missing DOM identity, wrong run ID, and another current hit's key at the target DOM ID. Recreating matching DOM on a later simulated commit does not resume rejected work.
- Old handlers invoked after committed supersession, cancel, close and failure, first with no chips and again with replacement chips reusing the exact ranks, IDs and hit keys under a new run ID. No focus/action occurs; the new current handler succeeds as a positive control.
- An earlier handler after a same-run selection revision still performs valid synchronous arrow focus without changing selection. **No extra revision guard is required for this synchronous operation.** The existing deferred chip-to-row selection focus keeps its run/key/revision guard.
- Native button attributes and unprevented Tab/Enter/Space, followed by an explicitly simulated button click, preserve select-and-reveal and guarded row focus without submission.

All 20 original tests are retained. Their deferred row-focus cases still reject stale requests after replacement, cancel, close, failure, later revision and missing/mismatched row DOM. Existing selection, disclosure, clearing, submission and Shell defaults continue to pass.

The host uses actual component logic plus the real reducer/presenter, but substitutes hooks and DOM lookup/focus methods. It does not dispatch the browser's native Enter/Space click defaults, traverse a real Tab sequence, mount React DOM, prove commit scheduling or exercise StrictMode. Stale-handler checks occur after simulated DOM replacement/removal; they do not claim that a not-yet-committed old DOM has already vanished. Real React/native-dialog/browser checks remain root's gates.

**2. LOW — handoff returns to Ask during takeover: CLOSED as a document repair.** `design/assistant/robot/integration/controlled-ui-implementation.md:102` now assigns ordinary Close/Escape to clear/abort and return to a valid invoker or HTML Ask fallback. Line 103 separately assigns source navigation/project takeover to clear/abort and let the destination receive focus, explicitly forbidding an intermediate Ask return. This agrees with `state-contract.md:141` and `:143`. It is not an implemented `StudioExperience` claim: that file retains its original hash and no root wiring exists.

## Evidence and sensitivity

| Command from repository root | Result |
| --- | --- |
| `node --test tests/assistant/studio-panel.test.cjs` before adding tests | 20/20 pass; [baseline-tests.log](baseline-tests.log) |
| Same command after adding tests | **28/28 pass**, exit 0; [panel-tests.log](panel-tests.log) |
| `node design/assistant/robot/review/controlled-ui-g3/recheck-v02/counterfactual.cjs` | Exit 0; all expected negative controls detected; [counterfactual-results.json](counterfactual-results.json) |
| `node design/assistant/robot/review/controlled-ui-g3/recheck-v02/static-check.cjs` | Zero TypeScript diagnostics for the repaired panel and imports; no emit, incremental output or typegen; [typescript-result.json](typescript-result.json) |
| `node node_modules/eslint/bin/eslint.js components/studio/assistant/StudioAssistantPanel.tsx tests/assistant/studio-panel.test.cjs --max-warnings 0` | Exit 0, zero diagnostics; [scoped-lint.log](scoped-lint.log) |

The counterfactual reconstructs the original panel **only in this private directory**, verifies its exact frozen SHA-256, and runs only the eight new arrow cases against that copy. All eight fail as expected because the old panel lacks the handler/identity attributes. Two further private controls remove only the new run-ID guard or only the hit-key guard: respectively **two** and **one** relevant regressions fail. The real panel remains untouched. Expected child test exits are 1; the experiment runner exits 0 only after checking those outcomes. These controls establish sensitivity to the actual missing feature and both stale-DOM protections, not exhaustive event fuzzing.

The counterfactual also checks that the original test content and host logic are preserved, allowing newline normalization and the single added `pendingWork()` observation. No test-only application seam or dependency was added. Broad unchanged suites, build/typegen, `.next` writers, servers, browsers and Git were not run.

Two preliminary review setup errors were corrected: the first read used `components/assistant/StudioAssistantPanel.tsx` instead of the frozen review's `components/studio/assistant/...` path, and parsing the old PowerShell-written JSON receipt initially failed on its UTF-8 BOM. The corrected reader strips the BOM in memory; no frozen receipt or candidate was edited. A report-link check also caught that PowerShell's empty lint pipeline had not created its log; lint was rerun with explicit output capture, exit 0, recorded in [lint-result.json](lint-result.json). All final checks above completed; no unresolved tool failure remains.

## Pinned bytes and write boundary

| File | SHA-256 |
| --- | --- |
| Repaired `components/studio/assistant/StudioAssistantPanel.tsx` | `103327ed46ee44cb7364873cd72daa7d271c086bcee75d6a5bef4446dabd5511` |
| Corrected `integration/controlled-ui-implementation.md` | `37cdcce2060d8261881e238fa7a6e81def383e41817e1b5f927bf61e8c4572cb` |
| Frozen pre-repair panel, privately reconstructed | `9af87603bfe18017e86a254457e33a3dba8064069ed94c2d90436b3162290bfa` |
| Durable tests before this recheck | `d69a3613c4679d427a650089fab8e05122d34ed82da688792e024a82d6c33a7c` |
| Durable tests after this recheck | `2b464d963025a0f642f48cdd117bfeb484d4a358b3b7b4e411a9503c562a777a` |
| Unwired `components/studio/StudioExperience.tsx` | `4e8628d8b91c840a494174d559e30b7967bc062f773aa37d74f53f3094891e16` |

[source-before.json](source-before.json) and [source-after.json](source-after.json) pin 35 source/original-evidence files. During this review only the leased durable test file changed among them; the original review and probes are immutable. The pre-repair panel reconstruction proves the application delta is limited to chip ID/identity attributes and the synchronous arrow handler. The handoff hash matches the dispatched repair and its corrected focus instructions are captured in the after receipt.

One parallel-owner change predates this recheck: `lib/studio-contract.ts` differs from the original G3 receipt (`64f88fd3…` → `08ba5af18af6c8ed41de7a74cbe6492d6974bd81ad83b7a7aea5c00b83bdd2e8`) but was unchanged throughout this review. The focused suite ran against the current dependency. I did not alter or independently approve that separate change, and do not claim that the entire checkout contains only Claude's two-file repair.

Only `tests/assistant/studio-panel.test.cjs` and new files in this `recheck-v02/` directory were written. [review-files.json](review-files.json) enumerates the new reports, scripts, private source/test controls and logs; its own file is excluded from its hash inventory.

## Remaining gates

Root still owns wiring one request owner and native dialog, fresh integrated build/type checks, and real browser/device testing: heading focus and containment; ArrowLeft/Right wrapping, Tab/Shift+Tab and Enter/Space defaults; chip-to-row focus/scroll; Cancel; ordinary Close/Escape invoker return versus navigation/takeover destination focus; stale native close events; responsive/phone keyboard layouts; accessibility announcements; fallback; React lifecycle/StrictMode; and same-snapshot scene delivery/clearing. The corrected document does not implement those flows. No aesthetic, performance, asset, placement or deployment approval is given by this recheck.
