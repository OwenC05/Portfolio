# Assistant stream event repair

Implemented 15 November 2026. Malformed event payloads are now rejected before component state updates, using the existing recoverable message: "The assistant sent a response this page could not read."

## Change

- `lib/assistant/events.ts`: small pure parser for the five existing event variants. It validates required fields, nested hits/citations, answer modes, optional model/fallback fields, and finite nonnegative scores/durations. Unknown variants and malformed JSON are rejected. Additional metadata fields remain allowed.
- `components/assistant/AssistantWorkbench.tsx`: uses that parser at the existing complete-line boundary. Stream buffering, final unterminated-line handling, cancellation, stale-run checks, error recovery and rendering are unchanged.
- `tests/assistant/events.test.cjs`: malformed-event regression, valid variant coverage, nested invalid values and actual source-only handler/parser integration.
- `scripts/verify-assistant-browser.mjs`: one controlled valid-JSON/missing-hits case, after cancellation and before the existing successful replacement-response case.
- This report. The shared event types, generation configuration, retrieval implementation and historical audit/evidence files were not changed by this task.

## Regression and fresh verification

The original parser was first extracted unchanged as a test seam. Running `node --test tests/assistant/events.test.cjs` then exited 1: the missing-hits regression failed with **Missing expected exception**, while the valid-empty-retrieval/malformed-JSON control passed. Validation was implemented only after recording that failure.

Final checks:

| Check | Result |
| --- | --- |
| `node --test tests/assistant/events.test.cjs` | 9 passed, 0 failed |
| Selected source-only/cancellation backend tests below | 4 passed, 0 failed |
| Scoped ESLint below | Passed, no warnings/errors |
| `node --check scripts/verify-assistant-browser.mjs` | Passed |
| `git diff --check` | Passed; Git printed only line-ending conversion notices |

```sh
node --test --test-name-pattern='sources-only NDJSON|provider timeout and caller cancellation|configured generation emits|request disconnect aborts' tests/assistant/backend.test.cjs
node node_modules/eslint/bin/eslint.js components/assistant/AssistantWorkbench.tsx lib/assistant/events.ts tests/assistant/events.test.cjs scripts/verify-assistant-browser.mjs --max-warnings 0
```

The initial scoped lint run flagged four CommonJS `require` imports in the new `.cjs` test. A documented file-local exception for `@typescript-eslint/no-require-imports` preserves the requested existing CommonJS test-loader format; the final lint run passed. No global lint configuration changed.

All provider behavior exercised by these tests uses injected fakes. The source-only integration test also asserts zero provider calls for both matching and unmatched questions. No live generation was enabled or called. No build, type generation, typecheck, server operation or browser automation was run by this worker; final integration belongs to root.

## Browser case for root

The added runner case makes its fake transport return this one complete NDJSON event and close:

```json
{"type":"retrieval","durationMs":1}
```

Submit "Who is Owen?". Expected: the existing "could not read" error appears, the textarea remains mounted, and a **Try again** button is present. There must be no render crash. The following existing replacement-response case must still reach **FRESH RESULT**, proving that the page remains usable after the error. The new check is named **Valid JSON with missing hits shows a recoverable error**; the runner now contains fifteen checks. Its placement after the cancellation state avoids mistaking the earlier malformed-JSON error for this case's result.

Root should run the updated runner against the rebuilt source-only application using its owned browser session, preserving prior reports/screenshots before the runner writes to its existing `design/assistant` output paths. This worker did not overwrite those artifacts.

## Contract limit

This is payload validation, not a new stream state machine: event ordering and cross-event citation membership are not checked here. String fields, including link destinations, retain the existing contract; server-created citations still derive their links from the published catalog. The parser does not establish semantic grounding, provider quality or a total stream-size guarantee. Generation remains deferred.
