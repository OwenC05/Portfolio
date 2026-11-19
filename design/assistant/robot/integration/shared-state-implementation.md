# G1 shared assistant state implementation

16 November 2026. Codex engineering lane, original task `task_acb7be875957`, bounded repair task `task_af270e1fc134`. Implementation and author verification only; independent review belongs to root. No Studio/robot assembly, appearance, server, configuration, dependency, Git or build-slot changes are authorized here.

## Current candidate: independent G1 findings repaired

The two findings in [the independent review](../review/shared-state-g1/review.md) are repaired. Root accepted the current-draft Retry contract. Only `components/assistant/AssistantWorkbench.tsx`, `tests/assistant/run-transport.test.cjs` and this handoff were written in this repair dispatch.

- **Retry uses the current editable draft.** Its actual button handler now calls `ask(question)`, the same shared submit action as Ask and the keyboard shortcut. `disabled={!question.trim()}` matches Ask's blank-draft rule. No new normalization, transport, reducer or hook path was added.
- **The actual graph caption is corrected.** The nested `Constellation` now renders `0 passages; response pending` while zero-hit retrieval waits for an answer. The separate list caption was already correct and is unchanged.
- **Focus policy is unchanged.** Cancel-to-BODY remains the known nonblocking product follow-up. Claude's P2 panel design owns future policy; this repair adds no `/ask` focus behavior. Public generation remains off by default.

### Reproduction and regression evidence

Before modifying the component, five new regressions were run through the existing simulated React host executing the real Workbench, hook and transport. The command below exited **1: 0/5 passed, 5/5 failed**, reproducing the intended failures:

```text
node --test --test-name-pattern='Workbench Retry|Workbench zero-hit' tests/assistant/run-transport.test.cjs
```

Both error and cancellation cases sent `Python benchmark` again after editing instead of the expected current draft. The new run IDs were already distinct. Both blank-draft cases exposed an absent `disabled` prop (`undefined` rather than `true`). Executing the real nested `Constellation` function with the pending run produced `0 passages ? response pending`, rather than the required semicolon caption. The reviewer probe script was read, not run, because it writes reviewer evidence; all reviewer files remain immutable.

After the three-line component repair, that same command passed **5/5**, exit **0**. The retry tests inspect actual JSON fetch bodies and run IDs after HTTP error and cancellation, preserve the textarea value, and compare Retry with the actual form handler on the same draft. Error coverage includes surrounding whitespace; cancellation coverage includes a programmatic draft above the 600-unit textarea limit, with an explicit expected 600-unit wire value. Blank and whitespace-only drafts disable Retry after either outcome; even a direct programmatic handler invocation makes no request or new run. The caption regression holds the stream after zero-hit retrieval, checks `answer === undefined`, executes `Constellation` and inspects its SVG `<text>` caption separately from the list text, then completes the valid abstention stream.

### Fresh repair verification

| Command                                                                                                                                                                                                    | Result                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Focused five regressions above, after repair                                                                                                                                                               | PASS, **5/5**, exit 0.                                  |
| `node --test tests/assistant/run-state.test.cjs tests/assistant/run-transport.test.cjs`                                                                                                                    | PASS, **33/33**, zero failures/skips, exit 0.           |
| `npm run test:assistant`                                                                                                                                                                                   | PASS, **67/67**, zero failures/skips, exit 0.           |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false`                                                                                                                                        | PASS, exit 0; no type generation or incremental output. |
| `node node_modules/eslint/bin/eslint.js components/assistant/AssistantWorkbench.tsx tests/assistant/run-transport.test.cjs`                                                                                | PASS, exit 0, no warnings.                              |
| `node node_modules/prettier/bin/prettier.cjs --check components/assistant/AssistantWorkbench.tsx tests/assistant/run-transport.test.cjs design/assistant/robot/integration/shared-state-implementation.md` | PASS, all three modified files formatted, exit 0.       |

### Exact repair candidate hashes

SHA-256 values identify the final code/test bytes verified above. This handoff is the third modified file; its final hash is supplied in the Orca completion message rather than self-embedded.

| File                                          | Before repair                                                      | After repair                                                       |
| --------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `components/assistant/AssistantWorkbench.tsx` | `6DB017BDC1C252F5DB0CBAE59A16FE844ED71B1F553E580557CEAE2037E1C989` | `F1769CAA1EF1BC97B1902E9B9294B0DBDF3CD73A17C184213F641DCF364B43FE` |
| `tests/assistant/run-transport.test.cjs`      | `18A73F6019AE5CBB94324DF550C8B97AB5BB0D31117757D51926CE771F2C1107` | `E1E0DBFA149CA78A56A58685251EFC5BE220E6C374F17949C111DF03B319412F` |

Before/after SHA-256 comparison confirms the hook, reducer, transport and reducer tests retain the original hashes listed below. All eight files under `review/shared-state-g1/`, including its probes and receipts, also retain their pre-repair hashes. No scene/style/design implementation, dependency/configuration, provider, Git or main-checkout changes were made.

**Acceptance boundary:** these are author-level handler/render regressions, not React DOM, real StrictMode, accessibility or browser proof. The prior production build/browser receipt in [verification-g1/report.md](verification-g1/report.md), build `O1RTOH0qRVqxRHQExjvm4`, applies to **pre-fix bytes** and does not verify this new candidate. Root owns the independent recheck of these two findings, a targeted browser recheck and a new build before Studio integration. This dispatch did not start or alter a server, run a build/browser/room check, write `.next`, or run `next typegen`. Offline evaluation data and retrieval are unchanged; the separate offline evaluation command was not repeated. No implementation blocker remains for these two bounded fixes.

## Original extraction record (pre-repair)

The remaining sections preserve the original implementation report and its historical verification/hashes. The current repair candidate and acceptance boundary above supersede its Workbench/test pins and test totals.

## Cleanup plan recorded before implementation

1. Lock valid Workbench behavior with focused Node regression coverage using the existing TypeScript toolchain: actual component submission, chunked Unicode source replies, complete final lines without newline, clean missing-done receipt, abstention and the existing generation-enabled branch. Run these against the original component before extracting it.
2. Move the existing fetch/reader/parser lifecycle to one per-hook owner. Add the permitted `lib/assistant/run-transport.ts` seam because deterministic delayed fetch/read/HTTP-body/cancellation tests need to exercise that real owner without React or a browser. It is local to one mounted hook, not an event bus or global store.
3. Add the pure run reducer, immutable snapshot, stable run/hit identities, strict source-only order/content checks and synchronous invalidation before abort. Keep the existing parser unchanged unless a shape defect is demonstrated. Replace Workbench's independent run/selection state with the hook and remove stale rank-based queued focus.
4. Test stale completions, late/trailing events, ordering, overflow, error clearing, cancellation, timeout, EOF and reader disposal. Run the new tests, full assistant suite, offline evaluation, direct lint and direct nonincremental TypeScript checking. Root owns build/browser checks and independent review.

Fallback inventory: clean validated answer at EOF without `done` is a grounded compatibility behavior and remains explicitly incomplete with a notice; HTTP JSON parsing failure falls back to the HTTP status; reader-cancel rejection must not prevent lock release. Retained results after cancellation/error and acceptance of contradictory event order are masking behavior to remove. Zero hits before answer is pending, never a no-match result. Generation compatibility is preserved behind the existing opt-in prop; public generation remains off.

Memory lookup found no assistant-specific registry entry; connected AgentMemory retrieval is unavailable in this lane. Current checked-in contracts, actual server fixtures and fresh tests are the evidence.

## Delivered interface

G1a/G1b are implemented. `/ask` uses the extracted hook; no Studio mounting or robot code was added. The hook creates one local transport owner in its layout effect and disposes it in layout cleanup, including effect replay. The owner alone creates each request, reader, decoder and parser path. Every accepted reducer transition or selection produces an immutable snapshot; nested hits, citations and arrays are defensively copied and frozen.

| Export                                                                                              | Location / consumer contract                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAssistantRun({ generationEnabled?: boolean } = {})`                                             | `components/assistant/useAssistantRun.ts`; returns `AssistantSession`. Default is source-only. Mount once in the owning surface.                                                        |
| `AssistantSession`, `AssistantActions`, `PresentationSnapshot`, `RunState`, `HitView`, `AnswerView` | `lib/assistant/run-state.ts`; types for HTML and future scene consumers. `AnswerView.citations` is deeply readonly rather than the shallow `Readonly<AssistantAnswer>` from the sketch. |
| `RunId`, `HitKey`, `Phase`, `Cursor`, `Completion`, `FailureKind`, `StopReason`, `Pose`, `Count`    | Same module. `received`/`generated` flags and the `generating` phase preserve Workbench compatibility; default source-only sessions reject generation events.                           |
| `hitKey({ sourceId, chunkId })`                                                                     | Canonical `JSON.stringify([sourceId, chunkId])`, with no delimiter collisions. Ranks are display-only.                                                                                  |
| `reduceAssistantRun`, `presentAssistantRun`, `INITIAL_RUN`, `INITIAL_SNAPSHOT`, `RunAction`         | Pure state/presentation operations for the owner and tests. UI should use actions, not inject events. Reducer inputs have already passed `parseAssistantEvent`.                         |
| `createAssistantRunOwner`, `ASSISTANT_TIMEOUT_MS`                                                   | `lib/assistant/run-transport.ts`; local lifecycle/test seam, not an additional consumer to mount alongside the hook. It returns `actions`, `getSnapshot()` and `dispose()`.             |

The run identity is an owner-unique UUID plus an increasing submission ordinal. Revisions increase on accepted state and selection changes within that owner; a new effect lifetime has a new identity namespace. Selection with an obsolete run ID or unknown key is ignored. `close()` clears the run to idle and retains its last question; the caller owns and retains its editable draft. It does not reopen or refetch. `cancel()` clears immediately even if external fetch/read completion ignores abort. Dispose invalidates and clears without notifications.

Consumer example using the actual exported interface:

```tsx
import { useState } from 'react'
import { useAssistantRun } from '@/components/assistant/useAssistantRun'
import type {
  AssistantActions,
  PresentationSnapshot,
} from '@/lib/assistant/run-state'

type ControlledPanelProps = {
  snapshot: PresentationSnapshot
  actions: AssistantActions
  draft: string
  setDraft(value: string): void
}

// Inside the future owning component:
const [draft, setDraft] = useState('')
const { snapshot, actions } = useAssistantRun()
const panelProps: ControlledPanelProps = { snapshot, actions, draft, setDraft }
// Submit/Retry: actions.submit(draft)
// Close/Escape/project takeover: actions.close(), then root changes its panel state.
// Pass this exact `snapshot` object to both panelProps and the future scene adapter.
// Root/G2 must deliver it to the controller in the same commit, before paint.

// Inside a controlled list/chip view, never infer identity from rank:
const { run } = snapshot
function selectFirst() {
  const first = run.hits[0]
  if (run.runId && first) actions.select(run.runId, first.key)
}
function clearSelection() {
  if (run.runId) actions.select(run.runId, null)
}
```

Bind `selectFirst` and `clearSelection` to controlled UI handlers. Consumers render `run.hits` in returned order, use `view.key` for identity and `view.rank` for display, and read `snapshot.count`, `tray`, `result` and `pose`. Zero retrieval is `result: pending`, `tray: waiting`, `pose: attention` until a valid abstention arrives. `done` advances to `cursor: eof`: trailing content is still checked and can fail the run. Only clean EOF seals it. Clean EOF after a validated answer but without `done` yields `completion: missing-done`, a warning and no `totalMs`.

Panel epochs, modal state, source focus in Studio, robot readiness, motion policy and commit-phase scene delivery remain root/G2/G3 responsibilities. Workbench now focuses a selected row synchronously in its layout effect with run/key/revision and DOM identity checks; it no longer queues a rank-capturing RAF. Its mounted lifetime is the `/ask` panel identity, so no independent panel state was added there.

## Intentional behavior changes

- Cancel, close, supersession, timeout and failure clear hits, answer/citations, selection and both timings together. Old callbacks cannot restore them or detach a newer request. React updater application also checks owner lifetime and current snapshot identity.
- Strict source-only order is start → retrieval → answer → done → EOF. Duplicate, out-of-order, mismatched-question, malformed, overflow and nonblank post-done events fail and clear. More than four hits and duplicate keys are rejected, never truncated or deduplicated.
- Nonempty source-only answers require exactly one citation per hit in retrieval order with matching source/chunk key, title, href and full passage text. Empty retrieval requires abstained/no citations and absent or `no-sources` fallback reason. Generated events, abstention with hits, sources without hits and contradictory `no-sources` with hits fail in source-only mode.
- Zero-hit waiting text is explicitly pending rather than prematurely saying no match. A failure is never displayed as no match. Existing source caution, contacts and citation content remain intact.
- HTTP errors use a nonempty string error from the server or the HTTP-status fallback; malformed object-valued errors cannot become rendered notices. The 429 message is preserved without a client countdown.
- The exact outgoing normalization remains `raw.trim().slice(0, 600)`. A new real-handler regression exposed that truncation can leave trailing whitespace on programmatic input over 600 units; the server trims that capped value again. The reducer's question is therefore the server-canonical `question.trim()` while the outgoing body is unchanged, so valid echoed questions are not rejected. The existing textarea limit is unchanged.

The clean validated answer/missing-done warning, the 60-second timeout, the 100000 UTF-16-unit pending-buffer guard before newline extraction, decoder flush, final complete line without newline, cancellation/release and same-origin endpoint are preserved. The guard is not a cumulative response-byte cap. The generation-enabled Workbench compatibility path accepts the existing optional generation stage, exact substring citation subsets, provider source fallback and provider abstention; it does not configure or enable generation. `events.ts` required no shape repair and was not edited.

## Author verification, 16 November 2026

| Command / check                                                                                                                                                                                                                                                  | Result                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pre-extraction `node --test tests/assistant/run-transport.test.cjs tests/assistant/events.test.cjs`                                                                                                                                                              | PASS, 13/13 against the original Workbench, including four new component regressions.                                                                 |
| Final `node --test tests/assistant/run-state.test.cjs tests/assistant/run-transport.test.cjs`                                                                                                                                                                    | PASS, 28/28.                                                                                                                                          |
| Final `npm run test:assistant`                                                                                                                                                                                                                                   | PASS, 62/62, zero failures/skips.                                                                                                                     |
| `npm run eval:assistant`                                                                                                                                                                                                                                         | PASS, 17/17 fixtures, supported-topic recall@4 = 1; fixture `2026-11-15.3`, knowledge `2026-11-15.2`. No provider call or semantic entailment review. |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false`                                                                                                                                                                                              | PASS, exit 0. Existing types sufficed; no missing-generated-types gap.                                                                                |
| `node node_modules/eslint/bin/eslint.js components/assistant/AssistantWorkbench.tsx components/assistant/useAssistantRun.ts lib/assistant/run-state.ts lib/assistant/run-transport.ts tests/assistant/run-state.test.cjs tests/assistant/run-transport.test.cjs` | PASS, exit 0, no warnings. Scoped to this lane.                                                                                                       |
| `node node_modules/prettier/bin/prettier.cjs --check` with those six code/test paths                                                                                                                                                                             | PASS, all matched files formatted.                                                                                                                    |
| Source inspection                                                                                                                                                                                                                                                | One shared hook in Workbench, one transport getReader/parser site, no Workbench fetch/parser or focus RAF; no event bus/global store.                 |

Tests cover actual Workbench submission/render data, byte-at-a-time UTF-8, blank/multiple lines, final lines without newline, pending-buffer bounds versus cumulative traffic, clean and malformed EOF, delayed post-done content, all zero-to-four counts, immutable content, exact ordered citations and collision-free identities. Delayed fetch, reader, rejected reader, HTTP JSON and timer completions verify cancellation/unmount/close/supersession fences, cleanup and abort ordering. The component harness queues state updater application and replays effect teardown/setup; a guarded DOM stub exercises selection focus. All 17 public evaluation fixtures also traverse the actual handler and shared owner with exact citation equality.

Command failures encountered and fixed before handoff:

1. The initial behavior-lock invocation failed twice because recursive traversal in the new JSX harness treated `undefined` children as its default root (`RangeError: Maximum call stack size exceeded`). The harness was repaired and all original-component locks passed before application edits.
2. The first TypeScript invocation returned `TS2345` for the unknown HTTP-body expression, `TS1252` for a block function at the repository's ES5 target, and two `TS7006` errors for action parameters. Explicit narrowing, an arrow function and typed parameters fixed them; final direct TypeScript checking passes.
3. The first scoped lint invocation returned `@next/next/no-assign-module-variable` for the test loader's local `module` binding. Renaming it to `loadedModule` fixed the violation; final lint passes.
4. The new truncation/real-handler regression initially failed (`completion: none` instead of `complete`). Canonicalizing only the retained/validated question after the unchanged wire cap fixed it; all final tests pass.

## Exact changed files and candidate hashes

Only these seven leased files were written. SHA-256 values identify the final six code/test files tested above; this handoff is the seventh file.

| File                                                                | SHA-256                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `components/assistant/AssistantWorkbench.tsx`                       | `6DB017BDC1C252F5DB0CBAE59A16FE844ED71B1F553E580557CEAE2037E1C989` |
| `components/assistant/useAssistantRun.ts`                           | `B6149C54687F02605F7F5448641F34741482E10527DF4ECBD9736E510BAD96C7` |
| `lib/assistant/run-state.ts`                                        | `1B804C6B9E0F528EF197E5A01EFD5F39DAFE8176F9DADB4A36268C96E69E5DF7` |
| `lib/assistant/run-transport.ts`                                    | `932DB03394ADDDF2D568A1EA002BBAAF142DA4151B1F70A9733E7B7F8A33283E` |
| `tests/assistant/run-state.test.cjs`                                | `14176EC86517E879B43A668363DBF2E3FB4BBDFC107C2C31682130C18DC36E15` |
| `tests/assistant/run-transport.test.cjs`                            | `18A73F6019AE5CBB94324DF550C8B97AB5BB0D31117757D51926CE771F2C1107` |
| `design/assistant/robot/integration/shared-state-implementation.md` | This handoff, including the pre-edit cleanup plan.                 |

## Remaining acceptance boundary

No implementation blocker remains in G1. This is author evidence, not independent approval. Root still owns independent Codex review, the final integrated build/browser checks, and any future Studio panel/robot assembly and visual acceptance. The Node component harness is not React DOM, browser scheduling, accessibility or visual proof; the layout-focus and effect-replay probes are bounded mechanical coverage. No `npm run typecheck`, build/dev/start, browser tests or `.next` generation was run, and no Git operation was performed. The source-only public configuration and server/retrieval/generation code were not changed; no live model request was made. No memory files were written.
