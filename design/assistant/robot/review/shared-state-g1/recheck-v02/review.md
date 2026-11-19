**PASS — both G1 findings are closed for the pinned source candidate.** Independent recheck on 16 November 2026, task `task_b37d6d92bef8`, of repair `task_af270e1fc134`. This closes exactly the original Retry/draft and pending-caption findings; it does not approve a build, browser behavior or Studio integration.

| Original finding | Independent result |
| --- | --- |
| Medium: Retry ignores the current draft | **CLOSED.** [AssistantWorkbench.tsx:468](C:/Users/Owenc/orca/Portfolio-assistant/components/assistant/AssistantWorkbench.tsx:468) now submits `question`; line 469 disables Retry when `question.trim()` is empty. Actual component-handler probes after HTTP error and cancellation send the edited draft with unchanged trim/cap normalization, create a distinct run ID, preserve textarea contents and complete a valid response. Empty and whitespace-only drafts disable Retry; even direct invocation creates neither a request nor a run. |
| Low: literal question mark in zero-hit SVG caption | **CLOSED.** [AssistantWorkbench.tsx:189](C:/Users/Owenc/orca/Portfolio-assistant/components/assistant/AssistantWorkbench.tsx:189) now reads `0 passages; response pending`. The probe executes the actual nested `Constellation` function, inspects its SVG `<text>` while `answer` is absent, and then completes a valid abstention. It does not mistake the separately rendered source-list copy for the graph caption. |

**Changes inspected.** The updated implementation handoff was read. Among the previous review's 24 pinned inputs, precisely Workbench, `run-transport.test.cjs` and the handoff changed; the other **21 match**. [verified-delta.json](verified-delta.json) proves the complete code/test delta without Git: reversing the three listed Workbench edits in memory reproduces its original SHA-256 exactly; removing the new regressions and reversing the small `edit(value)` harness extraction reproduces the original test-file SHA-256 exactly. No other Workbench or test edits are hidden behind the author's report. No reconstructed application file was written.

The five new regressions at `tests/assistant/run-transport.test.cjs:303` through `:450` were inspected: two edited-draft cases (error/cancel, JSON payload, new identity, retained input, Ask equivalence), two blank-draft cases (disabled prop plus submit no-op), and one nested SVG pending-caption case. The harness helper at line 161 only extracts the existing edit/render steps and exposes them separately from submission.

**Fresh independent validation:**

```text
node --test --test-name-pattern='Workbench Retry|Workbench zero-hit' tests/assistant/run-transport.test.cjs
node design/assistant/robot/review/shared-state-g1/recheck-v02/probes.cjs
```

The first passed **5/5**, exit 0 ([five-regressions.log](five-regressions.log)). The second passed, exit 0 ([probe-results.json](probe-results.json), [probes.log](probes.log)), using the **hash-verified original simulated hook host**, current production modules and independently updated assertions. It covers four successful Retry combinations: error/cancel × whitespace-padded/over-600-unit drafts; eight blank/no-op checks; and the actual nested SVG caption followed by valid abstention. The long draft also tests a 600-unit wire value ending in whitespace and acceptance of the trimmed server echo. No network/provider call occurred.

The unchanged hook/reducer/transport hashes allow the original bounded lifecycle/protocol evidence to carry forward; that audit was not rerun. The author's broader **33 focused / 67 assistant tests, direct TypeScript and scoped lint** results remain attributed author evidence, not fresh executions by this reviewer. Final [source-after.json](source-after.json) confirms all 24 inputs stayed unchanged during this recheck and all eight original review/probe/evidence files were preserved.

**Exact candidate SHA-256 pins:**

| File | SHA-256 |
| --- | --- |
| `components/assistant/AssistantWorkbench.tsx` | `f1769caa1ef1bc97b1902e9b9294b0dbdf3cd73a17c184213f641dcf364b43fe` |
| `tests/assistant/run-transport.test.cjs` | `e1e0dbfa149ca78a56a58685251efc5be220e6c374f17949c111df03b319412f` |
| `design/assistant/robot/integration/shared-state-implementation.md` | `3c3857cbb27c2363c388412ddd7ee2ecdc47239fc82863e4c40de55e64fa62c6` |
| `components/assistant/useAssistantRun.ts` (unchanged) | `b6149c54687f02605f7f5448641f34741482e10527df4ecbd9736e510bad96c7` |
| `lib/assistant/run-state.ts` (unchanged) | `1b804c6b9e0f528ef197e5a01efd5f39dafe8176f9dadb4a36268c96e69e5df7` |
| `lib/assistant/run-transport.ts` (unchanged) | `932db03394adddf2d568a1ea002bbaaf142da4151b1f70a9733e7b7f8a33283e` |
| `tests/assistant/run-state.test.cjs` (unchanged) | `14176ec86517e879b43a668363dbf2e3fb4bbdfc107c2c31682130c18dc36e15` |

**Remaining acceptance boundary.** These are source and simulated-host checks, not React DOM, real StrictMode, keyboard/accessibility or rendered-browser proof. The production preview on **4193**, build `O1RTOH0qRVqxRHQExjvm4`, is identified by the dispatch/handoff as serving **pre-fix bytes**; it was not accessed and cannot verify these repairs. Root still needs a new build pinned to this candidate and a targeted real-browser recheck of edited/blank Retry after error and cancellation, plus the pending SVG caption. No `.next`, build/server/browser, application repair, dependency/configuration, design/scene, Git or paid-tool work was performed here.

Cancel-to-BODY remains the explicitly deferred `/ask` UX observation, not a reopened blocker. The future Claude-authored Studio panel has its own focus rule. The original review and evidence remain immutable; this file is the scoped disposition of its two repaired findings.
