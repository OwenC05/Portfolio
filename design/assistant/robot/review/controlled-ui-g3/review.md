# Controlled Studio assistant UI: independent G3 review

Candidate evidence captured 17 November 2026. Independent review of Claude's `task_7ab9eaee385b`, for dispatch `task_1d6af5b11a5b`. **Bounded verdict: REVISE for wiring readiness.** One required keyboard behavior is absent; the handoff also gives a conflicting project-takeover focus instruction. No application repairs were made. Aesthetics and final Studio acceptance remain with their assigned owners.

## Findings

### 1. MEDIUM — source chips omit the contracted arrow navigation

**Anchor:** `components/studio/assistant/StudioAssistantPanel.tsx:328`–340, particularly the button's `onClick` at line 337. `onChip` at line 196 handles selection, but neither the chip nor its ancestors attach keyboard navigation. The only panel `onKeyDown` is on the textarea at line 240.

**Trigger and observed evidence:** complete a valid four-hit run, focus source chip 1, and press ArrowRight or ArrowLeft. The probe walks the actual rendered JSX ancestor path and invokes attached key handlers. Both keys encounter **zero handlers**, make no action call, and leave the simulated focus/selection unchanged. See [chip-keyboard-probe.json](chip-keyboard-probe.json); reproduce with `node design/assistant/robot/review/controlled-ui-g3/review-probes.cjs`. Static inspection establishes the absent application handler; the focus value in this probe is a stub, not a browser observation.

**Requirement:** `design/assistant/robot/integration/state-contract.md:145` explicitly requires chip arrow navigation while retaining ordinary Tab access. The newer P2 decisions accept the passage-disclosure design but do not remove that keyboard requirement. Native button Tab and Enter/Space activation are retained; this finding is a missing agreed feature, not a claim that ordinary buttons violate WCAG.

**Recommended repair:** Claude should add ArrowLeft/ArrowRight navigation over the current ordered hit list, keep ordinary Tab access, and preserve the run/key/revision guards when the action selects or focuses a source. Cover list edges and supersession between keypress and commit; arrow navigation must not submit a request. If root intends to change this requirement, record an explicit contract disposition before treating it as fulfilled.

### 2. LOW — the wiring handoff returns focus to Ask during project takeover

**Anchor:** `design/assistant/robot/integration/controlled-ui-implementation.md:100` groups Close, Escape and project takeover, then tells root to return focus to `askEntryRef`.

**Trigger and evidence:** following that instruction when an assistant panel is replaced by a project would introduce an Ask focus return into project navigation. This is a concrete contradiction in the handoff, **not an observed runtime focus defect**: `StudioExperience.tsx` is unchanged and no Ask entry is currently wired. The panel itself performs no root-close focus return.

**Requirement:** `integration/state-contract.md:141` requires project takeover with no intermediate return to Ask; line 143 reserves invoker return for an ordinary assistant close and lets navigation receive focus. P2 `placement-selected-a/ask-interface.md:124` likewise gives focus to the project heading.

**Recommended repair:** split the handoff instruction into ordinary Close/Escape (return to valid invoker/Ask fallback) and source navigation/project takeover (clear/abort, then let the destination receive focus). Keep the canvas-origin Ask fallback for an ordinary close. Root should implement and browser-test this distinction rather than copy the combined instruction.

## Inspected behavior and limits

- **Controlled ownership:** the panel consumes `PresentationSnapshot` and `AssistantActions`; its only extra state is a pending focus request. It adds no fetch, parser, run store, timer, dialog, history or scroll-lock owner. Source rows and chips map the same ordered `run.hits`; selection passes the current run ID and hit key. The existing G1 owner remains outside the panel. Root must mount that owner once when wiring.
- **Focus guards:** `StudioAssistantPanel.tsx:138`–162 checks pending run ID, key and exact revision, resolves the current row by key/rank, and checks the row's DOM run/key before focus and scroll. Independent cases reject stale work after cancel, close, failure, replacement, a later revision, missing rows and mismatched DOM identities. These are fake-host checks of callback decisions, not React commit scheduling, real DOM focus, native dialog containment or StrictMode proof.
- **Source truth and clearing:** inherited cases cover 0–4 rows/chips, exact order/full excerpts, valid zero-hit pending then abstention, source selection and disclosure. Independent assertions add same-source/different-chunk identities, adversarial scores/order, long Unicode excerpts and exact hrefs. Cancel, close, failure and new submit clear chips/rows/selection and old timing together without losing the controlled draft. The full passage stays in the DOM; CSS alone clamps its visual preview. The panel does not render generated answer text. Unchanged G1 protocol validation was carried forward by hash, not re-audited here.
- **Submission and Retry:** blank/whitespace drafts do nothing; edited Retry submits the current draft. The independent real-transport case covers repeated Ctrl/Cmd+Enter, two distinct run identities, supersession abort, normalized 600-unit wire questions, error/cancel blank guards and edited retries. Plain Enter does not submit. Textarea input is capped at 600 units; the transport is still the final normalization boundary. Persistent Search/Cancel controls enforce `aria-disabled` in their handlers. Studio Cancel requests focus on Search; this review does not reopen `/ask`'s separately deferred Cancel-to-BODY observation.
- **Status and accessibility source:** measured retrieval/total times, zero milliseconds and the missing-done warning are retained without invented totals. Error renders one alert and an empty status line. Buttons have native semantics, heading/textarea IDs and labels are linked, chip and disclosure controls expose their shared selection/expanded state, source links retain their hrefs, and the substantive heading has `tabIndex={-1}` for root's opening focus. Audible announcement quality and real keyboard behavior remain untested.
- **Shell defaults:** optional props default to the project variant; the one existing native dialog, root close/cancel handlers, scroll element, project URLs and look-button disable rules remain. No default Ask slot is rendered. [shell-delta.json](shell-delta.json) records the concrete Shell/CSS changes: the original project dialog rules remain, assistant dialog rules are variant-scoped, and dock grid tracks gain an Ask area at each breakpoint. Default DOM/project semantics pass the focused test. The unconditional grid changes still require actual layout checks with Ask absent/present and Projects open/closed; no layout regression is claimed from source arithmetic.

The Shell delta uses the other local checkout as a read-only baseline. Its CSS exactly matches the pinned pre-G3 SHA-256. For Shell, only the already-existing nullable ref annotations were restored in memory to recover the exact pinned pre-G3 bytes; the probe asserts that hash before comparing. Neither checkout was modified by that comparison.

## Fresh validation

| Command | Independent result and evidence |
| --- | --- |
| `node --test tests/assistant/studio-panel.test.cjs` | **20/20 pass**, exit 0; [panel-tests.log](panel-tests.log). The first 13 cases and host foundation are adapted from Claude; seven cases are independent extensions. |
| `node --test design/assistant/robot/review/controlled-ui-g3/author-panel-check.cjs` | Preserved author probe **13/13 pass**, exit 0; [author-probe-rerun.log](author-probe-rerun.log). These overlap the durable suite and are not 13 additional distinct coverage cases. |
| `node design/assistant/robot/review/controlled-ui-g3/review-probes.cjs` | Exit 0; reproduces finding 1 and captures hash-checked Shell/CSS deltas in [review-probes.log](review-probes.log). A successful probe execution does not mean the missing keyboard feature passed. |
| `node design/assistant/robot/review/controlled-ui-g3/static-check.cjs` | Exit 0, **zero diagnostics** for the three G3 TSX roots plus unchanged `StudioExperience.tsx` and their imports; [typescript-result.json](typescript-result.json). Uses installed Next CSS ambient declarations, `noEmit: true`, `incremental: false`; no generated routes/typegen or build output. |
| `node node_modules/eslint/bin/eslint.js app/studio/StudioShell.tsx components/studio/assistant/AssistantEntry.tsx components/studio/assistant/StudioAssistantPanel.tsx tests/assistant/studio-panel.test.cjs --max-warnings 0` | Exit 0, zero diagnostics; [scoped-lint.log](scoped-lint.log) is empty. |

The first scoped TypeScript probe omitted Next's ambient CSS declarations and produced four TS2307 diagnostics. That probe setup error is preserved in `typescript-initial-missing-ambient.*`; adding the installed ambient declaration to the review-only program resolved it without any application/dependency/configuration change. This is a scoped source check, not a full Next build/typegen claim.

The author scratch file was present and copied byte-for-byte to [author-panel-check.cjs](author-panel-check.cjs), SHA-256 `27d0de7323388e147e30a1ae8f7b8bb7c4f1717104fd840a29bd274ac2501485`. Its original path and final matching hash are in [source-after.json](source-after.json). The durable [studio-panel.test.cjs](../../../../../tests/assistant/studio-panel.test.cjs) identifies inherited versus independent assertions and restores its document stub. It transpiles actual source against the real reducer/presenter, with one independent case using the actual request owner. It does not mount React DOM, exercise browser defaults or run StrictMode.

No broad unchanged suite, `.next` writer, typegen/build/server, browser, paid call, application repair, asset edit or Git operation was used.

## Pinned candidate

All 18 inspected source/evidence entries matched between [source-before.json](source-before.json) and [source-after.json](source-after.json). Full contract/content/parser pins are in those manifests. The five G3 files match the author's handoff hashes.

| File | SHA-256 |
| --- | --- |
| `app/studio/StudioShell.tsx` | `ef637b1d61f39fd0cddc34f2697ce35546735f05219acb435d9e7d7c314c6738` |
| `app/studio/studio.module.css` | `81bd8787a6259212d7244702ffeb14ce0815aa9a1a51f5f47bb2d3ef4b0549ea` |
| `components/studio/assistant/AssistantEntry.tsx` | `065d4115428f0dc042a6a3c7e599179ddd7b5aa88495eaed90f9c546c60853a9` |
| `components/studio/assistant/StudioAssistantPanel.tsx` | `9af87603bfe18017e86a254457e33a3dba8064069ed94c2d90436b3162290bfa` |
| `components/studio/assistant/assistant.module.css` | `bd3e77104680db29d09bef5e4abd8314a6de5de33b26ee1d40dca9769c2f5452` |
| `design/assistant/robot/integration/controlled-ui-implementation.md` | `c35bba47c361a6500932f4653c1393a63fdb011f90e291c4499b5f5aa46ba1ed` |
| `components/studio/StudioExperience.tsx` — unchanged | `4e8628d8b91c840a494174d559e30b7967bc062f773aa37d74f53f3094891e16` |
| `components/assistant/useAssistantRun.ts` — unchanged G1 | `b6149c54687f02605f7f5448641f34741482e10527df4ecbd9736e510bad96c7` |
| `lib/assistant/run-state.ts` — unchanged G1 | `1b804c6b9e0f528ef197e5a01efd5f39dafe8176f9dadb4a36268c96e69e5df7` |
| `lib/assistant/run-transport.ts` — unchanged G1 | `932db03394adddf2d568a1ea002bbaaf142da4151b1f70a9733e7b7f8a33283e` |
| `tests/assistant/studio-panel.test.cjs` — new review coverage | `d69a3613c4679d427a650089fab8e05122d34ed82da688792e024a82d6c33a7c` |

The unchanged G1 pins match the [prior narrow recheck](../shared-state-g1/recheck-v02/review.md). Its transport/lifecycle evidence is carried forward only for those exact bytes; it is not proof of the future Studio wiring.

## Remaining integration gates

Root must route the concrete findings to Claude and recheck changed bytes before claiming wiring readiness. After wiring, root still needs a fresh candidate build and the matrix's real-browser/device checks: one native dialog and request owner; heading focus, containment, Escape/Close and stale close events; ordinary invoker return versus destination focus on takeover/navigation; Cancel and chip-to-row focus/scroll; preserved project history/scroll behavior; and enhanced/non-enhanced or failed-scene fallback.

Actual 1440x900, 390x844, 320x844 and short 320x568 layouts must cover Projects open/closed, empty/loading/four sources/error, full passage access and the phone keyboard. Screen-reader status/alert behavior requires a named browser/device session. Same-snapshot HTML/scene delivery, clearing before the next rendered frame, disabled background scene input, reduced motion, asset lifetime and real React lifecycle/StrictMode remain separate integration checks. This review does not approve final Studio integration, appearance or performance, and no existing preview is evidence of the unwired G3 source.
