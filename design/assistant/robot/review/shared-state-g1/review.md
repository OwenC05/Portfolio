**G1 independent review — REQUEST CHANGES for one bounded contract mismatch.** Reviewed on 16 November 2026 by the dispatched Codex reviewer for `task_e27e663f927e`, independently of author task `task_acb7be875957`. No critical/high defect found. Findings: **1 medium, 1 low**, plus a separate low-priority focus observation. The shared transport/reducer passes the inspected and exercised lifecycle/protocol cases; this is not approval of final Studio integration.

**1. MEDIUM — “Try again” submits the previous question even after the draft is edited.**

- Anchor: [AssistantWorkbench.tsx:468](C:/Users/Owenc/orca/Portfolio-assistant/components/assistant/AssistantWorkbench.tsx:468). The editable draft is `question` at line 293 and textarea line 389; normal form submission uses it at line 348, but Retry calls `ask(run.question)`.
- Trigger/repro: submit `Previous submitted question`; receive an HTTP 503 (cancellation also exposes this button); edit the textarea to `Edited current draft`; press **Try again**. The actual component handler sends `Previous submitted question` again while the textarea still displays `Edited current draft`. The new run identity is correct, but it searches the wrong text for the adopted retry contract.
- Evidence: `probe-results.json`, result `retry-current-draft`, records the two identical request bodies and the different current draft. `probes.cjs` executes the actual component/modules using the existing simulated hook host; this is a deterministic handler repro, not a new browser claim. The existing 28 tests do not exercise edit-then-Retry.
- Requirement: [state-contract.md:9](C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/state-contract.md:9) defines Retry as a new explicit submission of the retained draft. [shared-state-implementation.md:52](C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/shared-state-implementation.md:52) likewise demonstrates Submit/Retry as `actions.submit(draft)`.
- Repair: submit the current `question` through the same normalization path as Ask, disable Retry for a blank draft, and add an edit-after-error/cancel regression that checks the outgoing body and new run ID. This is an observed current contract mismatch; without an original source checkout I do **not** claim G1 introduced it. If repeating the previous submission is deliberately retained compatibility, root should explicitly reconcile that behavior with the adopted draft contract rather than treating both as satisfied.

**2. LOW — Zero-hit pending graph caption contains a literal question mark.**

- Anchor: [AssistantWorkbench.tsx:189](C:/Users/Owenc/orca/Portfolio-assistant/components/assistant/AssistantWorkbench.tsx:189), rendered at line 281.
- Trigger/repro: receive a valid start and zero-hit retrieval, then hold the stream before answer. The actual `Constellation` function emits `0 passages ? response pending`. The probe records character code **63** at the separator: this is source content, not terminal Unicode rendering.
- Evidence: `probe-results.json`, result `zero-hit-svg-caption`. This probe executes the nested function because the existing JSX walker does not render nested function components.
- Requirement: `state-contract.md:113` requires clear zero-passages/pending copy. The text remains truthful and the list/status correctly say the response is pending, so this is a copy defect, not a no-match/protocol failure.
- Repair: use `0 passages; response pending` (or the intended separator) and check the actual nested graph caption. No transport changes are needed.

**Focus observation — LOW, nonblocking product follow-up.**

At [AssistantWorkbench.tsx:407](C:/Users/Owenc/orca/Portfolio-assistant/components/assistant/AssistantWorkbench.tsx:407), Cancel becomes disabled when `busy` becomes false; its handler at line 406 does not choose a replacement focus target. The independent QA receipt `integration/verification-g1/ask/focused-checks.json:358` records keyboard cancellation with `focusTag: BODY` at line 368, no focused source row, and all result data cleared. Its script at `ask-focused.mjs:92` asserts absence of obsolete row focus and an aborted signal, not a useful new focus destination. I inspected that evidence and the source; I did not repeat the browser session.

This satisfies the stale-source-focus requirement. The current G1 contract does not specify Cancel's return destination, so I do not elevate it to a lifecycle blocker or infer a keyboard trap. Recommend choosing a stable local target such as Ask or the retained question field, moving focus only when cancellation actually displaced it, and verifying the chosen target with keyboard input. Do not borrow Studio Close/Escape invoker-return rules for page-level Cancel or move focus after route takeover.

**Inspected behavior and fresh verification.**

The full implementation handoff, state contract and integration decisions were read, along with all six G1 code/test files. Compatibility was checked against the retained original browser scenarios (`verification-g1/verify-assistant-browser.before.mjs`), current behavior-lock cases, actual parser and source-only/provider handler implementations and fixtures. [browser-scenario-comparison.json](browser-scenario-comparison.json) confirms that only line 83 of the 101-line browser script changed: the stale-response fixture now echoes the submitted canonical question instead of the invalid literal `fixture`; its timing and result assertions remain intact. The real server emits start/retrieval/answer/done (`handler.ts:158`, `:181`); `sourcesAnswer` emits exact ordered citations or empty abstention (`generation.ts:13`); retrieval caps at four (`retrieval.ts:5`). I did not use the author's report as implementation evidence.

| Concern | Evidence and bounded result |
| --- | --- |
| One request/reader/parser owner | Workbench mounts one hook at `AssistantWorkbench.tsx:294`. `useAssistantRun.ts:20` creates the local owner in a layout effect; cleanup at `:34` nulls/disposes it. Only `run-transport.ts:79`, `:108`, `:118` perform this surface's fetch/getReader/parse. No additional event bus, hit store or parser was introduced. |
| Mount/replay and queued updates | `useAssistantRun.ts:25` checks owner identity and latest snapshot when applying updates. Cleanup/new setup produces a new owner namespace. Existing queued-update/effect-replay tests pass. This remains simulated-host evidence, not a real React StrictMode test. |
| Late work after stop/replacement | `run-transport.ts:35`, `:38`, `:73`, `:85`, `:132`, `:169` fence fetch resolution, HTTP-body continuation, reads, errors, timers and finalization. The independent **16-case** matrix covers delayed fetch and HTTP JSON, resolve and reject, after cancel/close/dispose/supersession: none restored data, notified after disposal, acquired a stale reader or changed the replacement snapshot. |
| Atomic immutable data | `run-state.ts:111`, `:128`, `:208`, `:218`, `:242`, `:290`, `:346` clear/copy/freeze the complete result and derive count from the same hit array. Existing tests prove 0–4 ordered hits, defensive copies, nested freezing, selection/timing clearing and no independent count. |
| Identity/focus | `run-state.ts:104`, `:226` use collision-free source/chunk keys plus run IDs. `AssistantWorkbench.tsx:305` validates run/revision/key and current row data before synchronous layout focus; there is no queued rank-only RAF. Tests reject stale selections and same-task reveal/resubmit. QA separately records real selection focus and no obsolete-row restoration; Cancel caveat is above. |
| Normalization | `run-transport.ts:182` preserves `raw.trim().slice(0, 600)` on the wire. `:199` uses the server's additional trim for echoed-question validation (`handler.ts:96`). Empty input, capped programmatic input, trailing whitespace exposed by truncation and repeated-question new identities pass. Retry's choice of draft is the distinct finding above. |
| Strict source protocol | `run-state.ts:150`, `:253`, `:275` reject wrong echo/order, duplicate/over-four hits, foreign/missing/reordered/altered citations, source-only generated events and contradictory abstention. Zero hits remain pending until a valid abstention. `done` retains a live EOF cursor; malformed/nonblank trailing events and truncated EOF clear everything. A complete validated answer at clean EOF without done remains explicitly incomplete with warning and no total timing. |
| Resource cleanup | `run-transport.ts:38`, `:45`, `:167` clear timers and cancel/release acquired readers; failure/cancel/close invalidate before abort. Existing timeout, stale-timer, delayed-read/error and cancel-rejection tests pass. Three extra probes using **native Node ReadableStream/Response**, not a fake reader, show cancel/close/dispose each call cancel once and leave `body.locked === false`. |
| Public/source-only and opt-in compatibility | Default hook/Workbench remain source-only; `app/ask/page.tsx:22` retains the existing explicit environment prop. The 17 public fixtures run through the actual handler/owner and exact citations in the focused suite. Three extra actual-handler fixtures exercise opt-in generated substring citations, provider abstention with hits, and provider-error source fallback; all complete. Provider transports are local fakes, with zero network/provider calls and no configuration change. |

Fresh commands from the repository root:

```text
node --test tests/assistant/run-state.test.cjs tests/assistant/run-transport.test.cjs
node design/assistant/robot/review/shared-state-g1/probes.cjs
```

The first passed **28/28** (exit 0; [focused-tests.tap](focused-tests.tap)). The second exited 0 and preserved [probe-results.json](probe-results.json) and [probes.log](probes.log): two successfully reproduced findings, 16 late-callback cases, three generation fixtures and three native stream cleanup cases. Its zero exit means the stated observations were reproduced, **not** that the two defects are fixed.

**Evidence boundaries.** No application code, dependency/configuration, Git, `.next`, server, browser or asset write was performed. The installed code-review guidance was read; this explicitly solo worker dispatch overrides its generic Git/child-review steps. No two-child code-review workflow approval is asserted. QA owns the separate full typecheck/lint/build/browser evidence; those checks were not repeated. The author's claimed pre-extraction test run cannot be independently replayed without an original source snapshot; this review checks the concrete current source against the preserved valid behavior scenarios and server fixtures, not a fresh original-vs-new Git diff.

The test host at `run-transport.test.cjs:51` replaces React, aliases layout effects to its simulated effect mechanism (`:100`), manually replays setup/cleanup (`:168`), and stubs DOM focus (`:797`). It does not establish React concurrent scheduling, real StrictMode replay, browser unmount timing, screen-reader behavior or a performance bound. QA's production-browser evidence narrows ordinary hydration/focus gaps but is not development StrictMode proof. Pending cancellation that never settles is not covered by the reader-release claim. Studio snapshot-to-canvas delivery, modal arbitration, hidden/offscreen rendering, robot lifetime and performance remain later integration work. No speculative defect in those unimplemented consumers is reported here.

**Reviewed source pins.** [source-before.json](source-before.json) and [source-after.json](source-after.json) bind the inspected files and comparison evidence. All six G1 hashes match the author's candidate; the final recheck at 14:19:56 UTC confirms all 24 pinned paths unchanged. This verdict applies only to those bytes.

| File | SHA-256 |
| --- | --- |
| `components/assistant/AssistantWorkbench.tsx` | `6db017bdc1c252f5db0cbae59a16fe844ed71b1f553e580557ceae2037e1c989` |
| `components/assistant/useAssistantRun.ts` | `b6149c54687f02605f7f5448641f34741482e10527df4ecbd9736e510bad96c7` |
| `lib/assistant/run-state.ts` | `1b804c6b9e0f528ef197e5a01efd5f39dafe8176f9dadb4a36268c96e69e5df7` |
| `lib/assistant/run-transport.ts` | `932db03394adddf2d568a1ea002bbaaf142da4151b1f70a9733e7b7f8a33283e` |
| `tests/assistant/run-state.test.cjs` | `14176ec86517e879b43a668363dbf2e3fb4bbdfc107c2c31682130c18dc36e15` |
| `tests/assistant/run-transport.test.cjs` | `18a73f6019ae5cbb94324df550c8b97ab5bb0d31117757d51926ce771f2c1107` |

Root owns disposition of the Retry contract mismatch, the small copy repair and any desired Cancel focus follow-up. This reviewer has not taken a repair lease or approved Studio assembly.
