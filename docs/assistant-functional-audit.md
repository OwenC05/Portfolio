# Assistant functional boundary audit

Audited 15 November 2026 at `f08605b8d5ae1dd234bba286ebcd2f543c1e8693`. The requested application and test files had no diff from that commit. Scope: server configuration, input, events, citations/links, cancellation and generation readiness; no visual review or retrieval-quality challenge. Only this report was written.

**Verdict:** generation stays off without the required configuration, and the present source-only path has no blocking defect identified by this audit. Seven targeted existing tests passed. Generation is not ready to claim source-grounded answers: semantic support and public usage controls remain open. One client event-validation gap is actionable without enabling generation.

## Ranked gaps

### 1. High before generation: valid references do not establish a supported answer

**Code-confirmed limitation, not an observed live-model failure.** `lib/assistant/generation.ts:46–103` checks answer shape, selected chunk IDs and exact quote membership. It never compares the answer's claims with the quote. The comment correctly calls this mechanical validation.

**Exact counterexample for reproduction:** using the existing `reply`, `hits` and `config` fixtures in `tests/assistant/backend.test.cjs:20–45`, evaluate:

```js
validateReply(JSON.stringify({
  ...reply,
  answer: 'The Python model doubled typing speed.'
}), hits, config.model)
```

Inspection shows this satisfies every predicate and returns `mode: 'generated'`, although its only quote says a benchmark compares models and the supplied passage says user benefit remains unestablished. This counterexample was not executed as a new test; the existing validator test was rerun and passed. The hostile-passage test at `backend.test.cjs:191–225` supplies a fake abstention; it cannot establish injection resistance.

**Smallest safe action:** retain the disabled gate. Add this unsupported-answer negative control to the separately authorized evaluation, then record actual model outputs and independent claim/citation judgments before considering enablement. A stricter JSON schema alone cannot close this gap; an absolute content guarantee would require restricting output to supported extracts or another explicitly validated design.

### 2. Medium before public generation: throttling is local, not a total usage limit

**Code-confirmed and already documented.** `lib/assistant/handler.ts:41–56,112,123–132` creates one in-memory map per handler/process. Separate instances, restarts and different client keys have independent allowances. Origin checking is a browser restriction, not authentication; a direct client can send the expected Origin.

**Exact reproduction:** construct two `createThrottle()` instances at the same synthetic time; each permits twelve calls for the same key, even after the other instance refuses its thirteenth call. The existing test at `backend.test.cjs:471–478` covers only one instance. This audit did not send traffic to any server.

**Smallest fix before public inference:** enforce a shared usage limit at the existing deployment/provider boundary and verify the intended account budget cutoff. The current map can remain a local throttle. No deployment/account control was inspected, so this is a missing application guarantee, not a claim that the hosting account has no controls. It does not block the source-search preview.

### 3. Medium robustness: valid JSON with an invalid event shape bypasses client error handling

**Static finding; browser reproduction remains with root.** `components/assistant/AssistantWorkbench.tsx:103–108` casts parsed JSON to `AssistantEvent` without validation. At lines 397–404 it stores `hits` unchecked; lines 495–498 then call `run.hits.map` during rendering, outside the request's `try/catch`.

**Exact reproduction for root's controlled transport fixture:** return a successful response containing `{"type":"retrieval","durationMs":1}\n` and close the stream. Missing `hits` is accepted into state, so the next render throws instead of showing the recoverable malformed-response message. This is a response-contract failure, not a demonstrated attack through the current question endpoint: the inspected server constructs correctly shaped events. The retained browser runner checks `not-json\n`, not this valid-JSON case (`scripts/verify-assistant-browser.mjs:67–70`).

**Smallest fix:** validate the event discriminator and required payload types before applying state; reject malformed events through the existing request error path. Add one controlled malformed-shape regression. No new package is necessary. Root owns that implementation and browser check.

## Verified boundaries

| Boundary | Evidence and result |
| --- | --- |
| Generation defaults off | `generation.ts:109–132` requires exact `true`, an allowlisted model and a credential; `handler.ts:166–179` also requires hits. Fresh configuration and source-only tests passed. Request JSON cannot supply model/configuration overrides. No actual environment credentials were read. |
| Published sources only | `app/api/assistant/route.ts:1–6` supplies the explicit catalog; `retrieval.ts:79–95` filters publication and reads record sections only. No filesystem scan, private-source import or remote retrieval exists in this path. This verifies the implemented source boundary, not independent truth of owner-authored claims. |
| Input limits | `handler.ts:59–103` measures streamed bytes, uses fatal UTF-8 decoding, requires one question field, trims and bounds it to 600 UTF-16 units, and rejects disallowed controls. Fresh tests passed for oversized bodies/questions, extra fields, bad JSON, media type and origin rejection. No new slow-upload or malformed-UTF-8 test was run. |
| Event transport | Source-only responses emit retrieval-start, retrieval, answer and done, with no generation stage. The fresh test passed. Client code buffers split NDJSON, processes a final unterminated line and handles missing completion events (`AssistantWorkbench.tsx:388–459`). Its 100000-character guard bounds the pending buffer, not total response bytes. Current server events are bounded; no arbitrary-stream total-size guarantee is claimed. |
| Citations and links | `generation.ts:81–101` rejects unknown/duplicate IDs and invented quotes, and derives href/title from server-selected hits. `retrieval.ts:115–119` builds section links from the catalog; public pages render those section IDs. Answers/quotes render as React text, with no HTML/Markdown execution. The fresh citation-validation test passed. Live route navigation was not rerun. |
| Cancellation | Fresh tests passed for provider timeout/caller abort, response-body cancellation and request disconnect. `handler.ts:143–191` propagates abort and suppresses later events. Client code aborts on replacement/unmount and checks a run ID before applying stale results (`AssistantWorkbench.tsx:336–368,461–483`). Browser behavior was inspected, not rerun. |
| Provider failure containment | Inspection of `generation.ts:135–225` confirms a fixed endpoint, 700-token request, 12-second abort, 32000-byte response cap, no retry, and source fallback without raw provider errors. The selected timeout test exercised fake transport only. |

## Checks and remaining evidence

Executed once, exit 0: **7 passed, 0 failed**:

```sh
node --test --test-name-pattern='generation is disabled by default|sources-only NDJSON|configured generation emits|request disconnect aborts|provider timeout and caller cancellation|citation validation rejects|request boundary rejects' tests/assistant/backend.test.cjs
```

The loader transpiles in memory; every selected provider path uses an injected fake. No model was called or enabled. No new test files, builds, type-generation, browser automation, server operations or credential reads were performed. Read-only diff checks confirmed the audited code matches the requested commit. Unrelated changes to `docs/assistant-delivery.md` were preserved.

The existing browser runner/report and evaluation documents were inspected as prior evidence, not fresh verification. Actual hosted environment state, platform buffering/disconnect behavior, cancellation after real provider response headers, account/model eligibility, live grounding and injection resistance remain untested here. Retrieval challenge findings belong to the other worker. No production-readiness or semantic-quality conclusion follows from the passing fake-provider tests.

Inspection commands also encountered absent optional Orca environment variables/no local AGENTS matches, a nonexistent optional `components/knowledge` search path, and a PowerShell glob passed literally to `rg`; these were lookup issues, not application/test failures. Relevant files were subsequently inspected by explicit paths.
