# Scene activation timing repair

14 November 2026. Leaf performer task `task_5078bcca7bcc`, dispatch `ctx_b8afe52fa717`.

**Source/test deliverable complete; integration acceptance remains open.** The controller qualifies a gesture at pointerup and invokes the existing selection callback exactly once at its matching trusted canvas click. The new CPU ordering fixtures reproduce the original heading-focus loss before the fix and pass afterward. No browser, preview, server, production build, or helper worker was run by this performer.

## Scope and evidence

Only these files were edited:

- `components/studio/scene/controller.ts`
- `components/studio/scene/verify-controller.mjs`
- This report.

Read the current `touch-focus-defect.json`, `touch-focus-validation.mjs`, `verification.md`, controller/harness, `StudioScene.tsx`, and `StudioExperience.tsx` navigation callback. Task-specific AgentMemory recall corroborated the current defect report; current source and integration evidence governed the repair. The four existing production traces show selection/focus at pointerup followed by touchend and compatibility mousedown stealing focus. The replay currently uses 390px; 320px is additionally covered by the new CPU fixtures and still requires I's fresh browser rerun.

The adapter and UI callback remain unchanged. Exact surface picking, 44px CSS touch bounds, nearest-center overlap resolution, canonical ties, and exact-surface priority are unchanged. There were no visual/model/content/contract/dependency/resource-ledger or optional disposal-diagnostic edits.

## Activation boundary

The controller now follows:

1. A trusted primary left-button canvas pointerdown starts a gesture and invalidates any older completed candidate.
2. Pointerup must match pointer ID and type, remain within the existing 8px drag threshold, and resolve to the same project as pointerdown. It stores a completed candidate; it does not select, focus, scroll, or alter history.
3. Matching touch pointerout/pointerleave with no buttons after release preserves that completed candidate. An active leave, a different pointer's leave, or a mouse/pen leave cancels. This handles touch's implicit post-release leave without allowing an active drag/leave to activate.
4. Compatibility mousedown can apply its browser focus action before the canvas click. The matching trusted click consumes the candidate before invoking `onSelectProject` once. The existing UI callback then owns selection, history, heading focus, and scrolling.

Mouse and pen use the same click commit boundary with their unchanged exact-surface picks. This keeps one activation path and avoids a separate touch-only dispatch mechanism. Click must have the same pointer ID/type, button zero, positive detail, and coordinates within 8px of the qualified pointerup. Click does not require `isPrimary`, which is not the gesture-identity check. The qualified target is retained rather than re-picked at rounded click coordinates, preserving expanded-touch boundary eligibility.

Both active and completed state are invalidated by cancellation, scrolling, window/host resize, hidden/offscreen transitions, context loss, disposal, new pointer sequences, and outside pointerdown/click. Pending completion is invalidated by mismatched/excessive subsequent pointer movement. Any attempted canvas click consumes pending state, including rejected untrusted, mismatched, zero-detail, or unrelated clicks. Duplicate click/dblclick events without a new qualifying gesture cannot select again; a second full gesture can select once.

The two document listeners only cancel this controller's local gesture state on outside input. They neither control UI focus nor prevent event defaults. All subscriptions remain passive and owned by the existing cleanup list. The repair adds four subscriptions (canvas click/out and document pointerdown/click), no timers, no continuous animation, no pointer capture, and no default prevention. I's old listener-count evidence must be refreshed against this version.

## Regression before implementation

Ran the original harness before any edit:

```text
node components/studio/scene/verify-controller.mjs
exit 0: tests 20, pass 20, fail 0
```

Then wrote the regression tests and complete click-sequence helpers before modifying the controller. With the controller still at its original SHA256, ran the same command:

```text
exit 1: tests 30, pass 19, fail 11
```

All four new focus-order fixtures failed at their final-heading assertion:

| CPU fixture | Before fix final focus | After fix final focus |
| --- | --- | --- |
| 320px, reduced motion | `work` | `project-dissertation-heading` |
| 320px, ordinary motion | `CANVAS` | `project-dissertation-heading` |
| 390px, reduced motion | `work` | `project-dissertation-heading` |
| 390px, ordinary motion | `CANVAS` | `project-dissertation-heading` |

The failing trace had selection count 1 at pointerup, then final focus `work`/`CANVAS` after mousedown, mouseup, click. The fixed fixture requires the callback stage to be exactly `['click']`, one selection, one synthetic history write, and final heading focus. A repeated click without a fresh gesture produces no additional callback or synthetic history write.

These are explicitly **CPU event-order fixtures**, not browser focus/history evidence. The harness supplies synthetic trust, limited bubbling, and a callback/default-focus model. It models pointerdown/touchstart -> pointerup/touchend -> post-up touch pointerout/leave -> compatibility mousedown focus -> mouseup -> click. Its reduced-motion model reproduces the observed early-scroll retargeting to work; its ordinary-motion model reproduces canvas focus. It does not execute React navigation, browser default actions, scrolling, or real history.

Other new regressions cover active/completed cancellation across ten invalidation paths; drag excursion and return; mismatched ID/type/up; secondary/right-button and second-pointer input; untrusted start/up/click; zero-detail and identity-less clicks; different-position and stale clicks; coordinate rounding; post-up touch leaves versus mouse/pen leaves; fresh repeat/double gestures; and retained click callbacks after disposal. Existing picking, overlap, resize, lifecycle, adapter, resource release, and failure-path assertions were retained. Pointer-only success helpers now emit the complete sequence; cancellation tests also attempt the subsequent click.

## Final validation

| Command/check | Fresh result |
| --- | --- |
| `node components/studio/scene/verify-controller.mjs` | Exit 0; **30 tests, 30 pass, 0 fail**, including all original test cases and the new regressions. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false` | Exit 0, no diagnostics. Generated `.next/types` was available; no source or artifact failure occurred. |
| `npm.cmd run lint -- --file components/studio/scene/controller.ts --file components/studio/scene/verify-controller.mjs` | **Exit 1**: failed to load `@typescript-eslint` because `@typescript-eslint/eslint-plugin` is absent. This is the recorded configured-lint baseline failure, not a pass. |
| Installed ESLint API, in-memory Next configuration, both owned source/test files | Exit 0, **0 errors / 0 warnings** per file. Limited supplemental check; it does not apply the unavailable root TypeScript-plugin rules. |
| `git diff --check -- components/studio/scene/controller.ts components/studio/scene/verify-controller.mjs` | Exit 0. These files are currently untracked in this shared checkout, so this command alone is not a content-diff or whitespace proof. |

Exact supplemental lint invocation (PowerShell; no configuration file written):

```powershell
@'
const { ESLint } = require('eslint');
(async () => {
  const eslint = new ESLint({ useEslintrc: false, overrideConfig: { extends: ['next/core-web-vitals'] } });
  const results = await eslint.lintFiles(['components/studio/scene/controller.ts', 'components/studio/scene/verify-controller.mjs']);
  console.log(JSON.stringify(results.map(({ filePath, errorCount, warningCount, messages }) => ({ filePath, errorCount, warningCount, messages })), null, 2));
  process.exitCode = results.some(({ errorCount, warningCount }) => errorCount || warningCount) ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
'@ | node
```

## SHA256 receipts

| File/state | SHA256 |
| --- | --- |
| Original controller, including the failing regression run | `BD46EDE4D8CD0525AC89A8A491866BBC065554918D663A4830D5DB51FFC9FB63` |
| Original harness, 20-test baseline | `7F9F21EE10458B676D548AFEDCEFFCEF84A21892CE42DE80D6677310EB325A6F` |
| Final controller | `65BE133FC5B2E7D6716AC9C262883FF40D6A9FCDA71360A1E13852BD4E99BE79` |
| Final harness, identical for the before/after repair runs | `ABE8CBCAD65121F3BACB72C0B680FA9E5267E39F4D44598982DCF62092565077` |

The report's own SHA256 is delivered outside the report in the completion receipt to avoid a self-referential hash.

## Remaining acceptance

Independent critique and I's authoritative rebuild/browser rerun remain outstanding. Verify trusted touch at 320/390 in ordinary/reduced motion (and mobile/non-mobile touch contexts), final heading focus after compatibility events, one selection/history transition, repeated gestures, expanded boundary/overlap touches, native scroll cancellation, actual mouse/pen clicks, and lifecycle subscription release. The pending-candidate match deliberately requires a trusted click carrying pointer identity; identity-less legacy MouseEvent clicks and script-dispatched clicks fail closed, with no speculative timer fallback. Cross-browser/physical-device and real assistive-technology behavior remain untested here.

No new production, GPU, visual, React lifecycle, native scrolling, actual history, or actual focus evidence is claimed by this report. The earlier integrated failure remains the authoritative browser status until I reruns the repaired source. Configured lint remains an explicit limitation.

## Follow-up: non-hover pen release correction

14 November 2026. Leaf performer task `task_1b0b148c9021`, dispatch `ctx_19314e21f039`.

**Narrow source/test correction complete; independent exact-delta review and integration acceptance remain open.** This append-only follow-up addresses R1 in `touch-focus-critique-report.md` and supersedes the original report's statement that a completed pen leave should cancel. The prior 30/30 result included that incorrect expectation and did not validate non-hover pen release. Read both reports before editing; acknowledged this existing dispatch as `msg_df1659e4c013`. The assigned source-edit window was already confirmed by I in `msg_f79a23d1d8de`.

### Exact implementation delta and boundaries

Against controller freeze `65BE133FC5B2E7D6716AC9C262883FF40D6A9FCDA71360A1E13852BD4E99BE79`, exactly two lines changed: the explanatory comment at line 271 and the condition at line 273. The executable change is:

```diff
-    if (!gesture && activation?.pointerType === 'touch' && event.pointerType === 'touch' && activation.pointerId === event.pointerId && event.buttons === 0) {
+    if (!gesture && (activation?.pointerType === 'touch' || activation?.pointerType === 'pen') && event.pointerType === activation.pointerType && activation.pointerId === event.pointerId && event.buttons === 0) {
```

A qualified completed touch or pen release now survives its matching no-buttons boundary events until the matching trusted canvas click. There must still be no active gesture, and pointer type and ID must still match. Mouse leaves, active leaves, wrong identities/types, held buttons, cancellation and dragged gestures retain cancellation. The same click handler consumes the candidate before the callback, so duplicate clicks cannot recommit it. This implements the non-hover event ordering identified by the independent critique without adding a device-detection heuristic.

The controller's picking, 44px touch expansion, exact pen/mouse raycasting, click validation, callback ownership, props, listeners, lifecycle, thresholds and resource handling are byte-unchanged outside those two lines. No timers, retries, capture, prevention, dependencies, visual/content/UI/contract changes, or optional disposal diagnostics were added. No helper workers, browser, build, preview or server were run.

Start/end SHA256 comparisons also matched for all 12 checked boundaries: `build-studio.ts`, `resources.ts`, `textures.ts`, `types.ts`, `StudioScene.tsx`, `StudioExperience.tsx`, `lib/studio-contract.ts`, `lib/studio-content.ts`, `app/globals.css`, `package.json`, `package-lock.json`, and the independent critique report. Other contributors' existing edits remain in the shared checkout. Only the controller, harness and this append-only report were edited by this task.

### Test-first regression and final validation

Before changing the controller, updated the formerly incorrect pen expectation, added explicit non-hover pen exact-hit/miss and boundary-mismatch tests, and extended the existing cancellation cases to pen. The harness helpers and all unrelated test cases remain unchanged.

- The exact-hit fixture uses a 4px projected plane in a 320px viewport and runs primary pen down -> up -> out -> leave -> mousedown -> mouseup -> matching click. It requires no early selection, callback only at click, one selection, and no second selection from duplicate click/dblclick.
- The paired miss uses the identical sequence 20px off the plane, within the touch-expanded region. Independent real Three raycasting verifies the miss, and an actual harness touch gesture confirms the nearby point remains touch-eligible; pen must still select nothing.
- Boundary mismatches cover both pointerout and pointerleave with a different ID, touch/mouse type, or held buttons, followed by matching boundary events and two attempted clicks. They cannot revive the rejected candidate.
- Existing active/completed lifecycle cancellation cases now run for touch and pen: scroll, window/host resize, hiding, offscreen transition, pointercancel, outside down/click, context loss and disposal. Active leave/out, drag excursion/return, release beyond threshold, mismatched up, second pointer and untrusted input cases also now run for pen. Existing touch/mouse behavior, focus-order fixtures and repeated-gesture tests remain covered.

| Command/check | Result |
| --- | --- |
| `node components/studio/scene/verify-controller.mjs`, original supplied freeze | Exit 0; **30 tests, 30 pass, 0 fail**; includes the known incorrect pen expectation. |
| Same command, new regressions with old controller still at `65BE133F...` | Exit 1; **33 tests, 31 pass, 2 fail**. Both failures expected `['dissertation']` and received `[]`: corrected completed-release/rounding expectation, and focused exact-hit non-hover pen sequence. Nearby touch-only miss and cancellation cases passed. |
| Same command, narrow corrected controller, identical regression harness | Exit 0; **33 tests, 33 pass, 0 fail**. |
| Targeted TypeScript API check below, using current tsconfig and controller/transitive imports | Exit 0; **0 diagnostics**. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false` | Exit 0; no diagnostics. No build or TypeScript cache write. |
| `npm.cmd run lint -- --no-cache --file components/studio/scene/controller.ts --file components/studio/scene/verify-controller.mjs` | **Exit 1**; unchanged configured-lint baseline: cannot load `@typescript-eslint/eslint-plugin` declared by `.eslintrc.json`. |
| Installed ESLint API with the same in-memory `next/core-web-vitals` configuration shown earlier in this report | Exit 0; **0 errors / 0 warnings** on each owned source/test file. Supplemental only; does not apply the missing root TypeScript-plugin rules. |
| `git diff --check -- components/studio/scene/controller.ts components/studio/scene/verify-controller.mjs` | Exit 0; files remain untracked, so baseline/current content comparison, rather than Git diff, establishes the exact source delta. |

Targeted TypeScript invocation (PowerShell; no configuration file written):

```powershell
@'
const ts = require('typescript');
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram(['components/studio/scene/controller.ts'], { ...parsed.options, incremental: false, noEmit: true });
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: name => name, getCurrentDirectory: ts.sys.getCurrentDirectory, getNewLine: () => '\n' }));
console.log('Targeted controller and transitive imports: ' + diagnostics.length + ' diagnostics');
process.exitCode = diagnostics.length ? 1 : 0;
'@ | node
```

### Replacement freeze and remaining acceptance

| File/state | SHA256 |
| --- | --- |
| Supplied controller, retained during failing regression run | `65BE133FC5B2E7D6716AC9C262883FF40D6A9FCDA71360A1E13852BD4E99BE79` |
| Supplied harness before new regressions | `ABE8CBCAD65121F3BACB72C0B680FA9E5267E39F4D44598982DCF62092565077` |
| **Corrected controller** | `728C12AFFD53A069FD684A725C53CEB39A046AD569A43314A9AC2DD5348222B0` |
| **Corrected harness, identical in failing and passing regression runs** | `D26A7F4EB94678F1DBA7C32922F1FF35F3019231E71A712117E5E3D1AB49E2C4` |

The report's updated hash is provided in the completion receipt. All new event-order evidence is CPU-only, using the harness's synthetic trust and propagation model; it is not browser or physical non-hover pen hardware evidence. The independent critic must re-review this exact source/test delta, and I must refresh the affected production/browser evidence against this replacement freeze. Configured lint remains the recorded baseline limitation; no integration or final acceptance is claimed here.
