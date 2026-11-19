# Trusted-touch repair critique and bounded cleaner delta

14 November 2026. Independent leaf critic, task `task_3a8940e6d196`, dispatch `ctx_b7eb19cd95a7`.

**Verdict: REQUEST CHANGES.** The click-commit repair addresses the observed touch focus ordering, but its touch-only release exception rejects a valid completed pen gesture when release boundary events precede click. The existing 30 tests pass while explicitly expecting that incorrect pen rejection. One P2 source/test correction is required; this review task is complete, not implementation acceptance.

Only this report was written. Controller, tests, UI, contracts, resources, other reports and runtime state remained read-only. No workers, browser, preview, server, build, dependency changes or optional FND-1 disposal diagnostics were run or changed. Writer/reviewer separation is preserved.

## Ranked finding

### R1 — P2: completed non-hover pen release loses activation

**Location:** `components/studio/scene/controller.ts:269-277`, especially the two touch-only checks at line 273; incorrect expectation in `components/studio/scene/verify-controller.mjs:433-444`.

A primary pen press and release at the same exact monitor surface produces a valid `activation` at controller lines 246-250. If that pen then emits `pointerout` / `pointerleave` with the same ID, unchanged coordinates and `buttons: 0` before its matching trusted click, line 273 rejects the pen type and line 277 clears the candidate. The click at line 259 therefore cannot invoke the callback. Selection, hash and heading focus never change. Before the timing repair, selection was already committed at pointerup; this newly deferred path needs to preserve this legitimate release.

This is a platform contract issue, not a proposal to enlarge pen picking. Pointer Events 3 requires post-up `pointerout` then `pointerleave` for **devices without hover**, rather than limiting that behavior to touch. The standard does not guarantee that these boundary events occur after click. The relevant primary reference is [W3C Pointer Events 3, section 4.2.6](https://www.w3.org/TR/pointerevents3/#the-pointerup-event), with boundary conditions also in [sections 4.2.8 and 4.2.9](https://www.w3.org/TR/pointerevents3/#the-pointerout-event). This establishes the supported event-order case; it is not a claim that a physical pen was tested here.

**Independent reproduction:** ran the current harness setup in memory, without modifying its file, at an exact-surface center. Sequence: primary down -> up -> out -> leave -> mousedown -> mouseup -> matching click. The last click has `isPrimary: false`, the same pointer ID/type and unchanged coordinates. Touch selects `dissertation`; pen selects nothing. The probe exits 0 because its assertion confirms the regression, while its pen behavior result is explicitly `pass: false`. The existing test at lines 433-444 exercises the same important boundary but hard-codes `[]` for pen, so green tests currently lock in the wrong outcome.

**Additional I-owned evidence, inspected rather than rerun:** [pen-release-before-correction.json](../../../.omx/artifacts/visual-ralph/portfolio-after-hours-v1/pen-release-before-correction.json), replay [pen-release-validation.mjs](../pen-release-validation.mjs). Trusted CDP pen down/up/click without injected boundaries succeeds in both motion settings. Document-bubble pointerup instrumentation inserts explicitly **untrusted** same-ID pen out/leave before the trusted click; both cases then retain empty hash, canvas focus and zero history pushes. The controller's boundary handler does not inspect trust, so this supports the identified branch failure. It remains browser boundary instrumentation, **not real non-hover pen hardware evidence**.

**Required correction:** preserve the matching completed released pen boundary sequence, retain exact-surface pen picking and active-gesture cancellation, and replace the incorrect pen expectation with a focused regression. Keep mouse leave cancellation, mismatched/active/drag cancellation and single click consumption. No timer, global focus handler, new public prop, navigation rewrite or speculative guard is needed. S must coordinate the source/hash change with I and obtain a separate review of the resulting delta.

Escalated immediately as `msg_2f33881d6333`. S accepted the finding in `msg_2f1ffb6fd6da`, reopened acceptance and confirmed that the writer will start only after this review settles. Message `msg_56e76bd7ed7c` confirms I's safe edit window and the narrow repair scope. No source change was made during this review.

## Repair correctness outside R1

- **Activation and UI ownership:** controller lines 241-250 only qualify a gesture; lines 254-266 consume it before one callback. There is no controller focus, URL/history or scroll mutation. The read-only adapter at `StudioScene.tsx:19-27` forwards current callbacks and disposes the mount. `StudioExperience.tsx:46-55,100-107,131-148` resolves the existing HTML heading, avoids identical history pushes, focuses it and scrolls through the existing callback. Its wrapper click handler only enhances actual anchors, so a canvas click does not create a second navigation route.
- **Touch ordering:** delaying the callback until click leaves compatibility mousedown's focus action before heading focus in the observed browser sequence. Original traces in `touch-focus-defect.json` demonstrate the early pointerup failure; I's newer original reproduction traces demonstrate empty hash through mousedown/click capture, then heading focus inside the click callback. The CPU fixtures establish callback order, not native focus semantics.
- **Picking:** controller lines 175-219 keep exact raycast priority, mouse/pen exactness, 44 CSS-pixel minimum touch bounds, nearest-center choice and canonical ID ties. The completed target is retained at lines 250/266 rather than being re-picked using rounded click coordinates. The 8px click-distance check is bounded by the existing gesture threshold. An eligible overlap remains policy-selected, not an exclusive 44px square for every monitor.
- **Single use and cancellation:** click clears both states before validation/callback; rejected clicks cannot replay the candidate, and duplicates/dblclick cannot select without a new gesture. New down/up, invalid identity/type, excursions, pointercancel, outside input, scrolling, resize, hidden/offscreen changes, context loss and disposal either clear or reject stale activation. No wall-clock expiry is needed to create selection: a matching trusted click is still required, and subsequent input invalidates the candidate.
- **Lifecycle and passive behavior:** subscriptions use the existing passive cleanup helper at lines 296-299. Disposal clears activation before releasing listeners. The callback runs after state consumption, so synchronous callback-driven disposal leaves no pending commit. No pointer capture, default prevention, propagation suppression, timer, continuous loop or global focus retry was added. The fake adapter/lifecycle tests do not establish actual React StrictMode or GPU release.

The click identity rule is grounded in [Pointer Events 3 section 4.2.12](https://www.w3.org/TR/pointerevents3/#the-click-auxclick-and-contextmenu-events): pointer-origin clicks carry the initiating pointer ID/type, other pointer-specific attributes use defaults, and click coordinates may be floored. Therefore not requiring click `isPrimary` is correct. Identity-less legacy clicks fail closed; the standard does not prove every browser/version implements that contract. Native focus ordering and cross-platform support still need measured evidence.

## AI SLOP CLEANUP REPORT — delta only

**Skill:** loaded and announced [ai-slop-cleaner](C:/Users/Owenc/.codex/skills/ai-slop-cleaner/SKILL.md). Applied as a read-only helper under this task, not an implementation workflow or permission request. [Orca orchestration](C:/Users/Owenc/.agents/skills/orchestration/SKILL.md) was loaded with its installed version-matched guide for acknowledgements, escalation and completion.

**Scope / review plan:** compare the two frozen changed files with the prior cleanup's behavior/fingerprint baseline; inventory new pending-state guards and subscriptions; assess fallback-like behavior, dead code, duplication, naming/boundaries and test adequacy; report required changes without editing source. The prior 14-file review and deferred FND-1 diagnostics were not repeated. Historical files are untracked in this checkout, so the manifests and performer record establish baseline identity/behavior; this is not a claimed Git byte diff against an available original revision.

**Behavior lock:** fresh 30/30 CPU tests and full nonincremental TypeScript pass. The writer records 20/20 baseline and a test-first 19/30 failure before implementation; those earlier executions are adopted from the performer report, not independently re-executed against historical source. The fresh independent R1 probe identifies the missing correct expectation.

| Delta / concrete location | Necessary versus speculative; disposition |
| --- | --- |
| Completed `activation` record, line 70; retain pointer ID/type/up coordinates/target, line 250 | **Necessary.** Carries the qualified result across the real pointerup-to-click interval. No generic state machine, new public abstraction or duplicated navigation state. |
| Clear activation and active gesture on every new down, lines 224-225 | **Necessary.** Invalid input must not leave an older candidate available to a later click. |
| Trusted, primary, left-button and current-size start guards, line 226 | **Necessary fail-closed checks.** Prevent programmatic/secondary/stale-size starts. Trust is an input contract, not an application security boundary. |
| Up identity/type/trust/primary/button, latched drag and final distance; same project, lines 243-250 | **Necessary.** Qualification must still belong to the original exact/expanded target before dispatch is delayed. These preserve the intended gesture rather than add alternate activation. |
| Existing drag excursion latch, lines 235-236 | **Necessary retained behavior.** Returning inside the threshold does not undo an earlier drag. |
| New pending-candidate move invalidation for changed ID/type or distance, lines 232-234 | **Grounded cancellation, retain.** Restricts what can happen between up and click. This precise post-up branch lacks a dedicated fixture; coverage limitation below, not justification for another guard. |
| Consume candidate and active gesture before any click checks/callback, lines 256-258 | **Necessary.** Prevents duplicate/reentrant selection and retries after a rejected click. |
| Trusted canvas target, button/detail, visibility/offscreen/size click checks, line 259 | **Necessary boundary checks overall.** `target === canvas` is locally redundant for a childless canvas's directly attached handler, but states the intended event boundary cheaply; no separate abstraction/removal required. Positive detail excludes non-pointer activation on this aria-hidden surface; equivalent HTML access remains outside it. |
| Same ID/type; no click `isPrimary` requirement, line 260 | **Necessary and standards-grounded.** No guess based solely on coordinates or a touch timer. Legacy identity-less clicks intentionally fail closed; no broad fallback introduced. |
| Retain qualified target and tolerate bounded rounded coordinates, lines 261-266 | **Grounded compatibility handling.** Prevents a valid expanded-boundary target being changed by rounded click pixels. Reuses the existing threshold rather than another magic timing window. |
| Release-leave predicate: no active gesture, same completed ID, released buttons, lines 269-278 | **Necessary distinction, incorrect type restriction.** The touch-only assumption is speculative and causes **R1**. Retain completion versus active-gesture separation, correct the pen case. |
| Canvas `click` subscription, line 345 | **Necessary.** The single commit event directly repairs the observed focus timing. |
| Added canvas `pointerout`, line 347, plus retained `pointerleave`, line 348 | **Defensive overlap, not essential duplication to expand.** A childless canvas normally delivers both for a boundary exit; the shared handler makes repeated cancellation inert. No demonstrated product defect or mandatory removal from retaining both, but no need for more boundary subscriptions. R1 applies to their shared predicate. |
| Document outside `pointerdown` / `click`, lines 280-282,349-350 | **Necessary to the stated stale/outside-input contract.** Only clear controller-local state. They do not implement global focus/navigation handling or prevent scrolling. |
| Clear activation during cancel/dispose, lines 85-86,284-288; existing resize/scroll/visibility/intersection/failure paths | **Necessary lifecycle extension.** Both active and completed phases must be invalidated. Uses existing helpers/cleanup ownership; no new timer, observer family or fallback. |
| Harness trust/target fields and limited document propagation, lines 192-201 | **Grounded test seam.** Explicitly synthetic; enables CPU control-flow assertions. It would be misleading only if claimed as browser trust/default-action proof. |
| `finishClick` / complete `tap`, lines 264-282 | **Necessary shared test setup.** Success helpers must deliver the new completion event. No new general event framework. Only the touch branch emits release leaves, which contributes to the missed pen case. |
| Four focus-order fixtures and one-per-gesture assertions, lines 285-343 | **Necessary behavioral regression.** They assert callback stage, count and final modeled focus; viewport/motion cases preserve the original defect scenarios. Synthetic history increment is an oracle, not actual UI/history verification. |
| Cancellation/rejected-click tables, lines 346-431; retained late-click callback, lines 756-773 | **Necessary affected-path regression coverage.** Successful setup then cancellation and attempted click avoids vacuous negative tests. Table reuse is proportionate. |
| Release/rounding fixture, lines 433-444 | **Mirrored incorrect policy: required correction under R1.** Its touch-versus-pen expected result follows the implementation restriction rather than valid platform behavior. Do not delete the test; correct and focus its expectations. |

**Fallback findings:** no new masking fallback, swallowed-error path, alternate navigation implementation or speculative timer. The retained-target click path is grounded compatibility handling; rejection of invalid/identity-less clicks is deliberate fail-closed behavior. The release handling has a platform assumption requiring R1, not an architectural rewrite. Existing disposal diagnostic catches are outside this delta and remain explicitly deferred.

**Pass outcomes:** fallback inventory/disposition complete; dead-code review no justified deletion; duplication review found only bounded overlapping boundary subscriptions, no required refactor; naming/error/boundary review found R1; test reinforcement assessment requires the pen regression. No UI/design changes were evaluated beyond the callback boundary. Runtime simplifications performed: **none**. Changed file: **this report only**.

## Test adequacy and integration evidence

Fresh suite coverage includes the four 320/390 motion-order fixtures, one-per-gesture mouse/pen/touch completion, both active/completed cancellation phases, invalid input/click consumption, complete-sequence picking, 44px footprint/overlap/resize, lifecycle release attempts and adapter callback forwarding. Real Three geometry/projection is used; renderer, DOM, observers, trust, bubbling, default focus, history and hook scheduling are modeled.

R1 is the blocking gap. Other bounded limitations are not additional source-change requests: the rounded-click test uses a surface center rather than a combined fractional expanded-edge/overlap case; post-up changed-pointer/excessive-move invalidation and mismatched/buttons-held release-leave guards are source-reviewed but not individually exercised by the new fixtures. Callback-driven synchronous disposal/throw is safe by inspection of pre-callback consumption, while tests exercise disposal and retained handlers separately. The test name at line 490 mentions exact priority last, but its assertions and production implementation correctly give exact hits priority.

The current `verification.md` changed during this review from the original touch-blocked report to I's repaired integration report. Its line 25 explains the separately authorized unavailable-caption correction and current `StudioExperience.tsx` hash; that file is therefore not falsely described as byte-identical to the old cleanup snapshot. The shared props, adapter and scene types still match that snapshot. Review of the caption delta itself belongs to I's independent evidence critic.

Inspected I-owned results, without starting any browser or rerunning those scripts:

| Artifact | Adopted observation and boundary |
| --- | --- |
| `touch-original-repro-after-repair.json` | All four original 390px mobile-flag/motion combinations finish on the existing heading; traces place compatibility mousedown focus before click callback focus. |
| `browser-after-repair.json` | 51 checks, zero reported failures/page errors. Actual CDP pen gesture lacks the non-hover release-boundary sequence; it does not disprove R1. |
| `touch-after-repair-settled.json` | 48 checks, zero reported failures/errors, including 320/390, motion, expanded touch, repeat history, scroll and orientation. I documents the earlier unsettled resize-fixture failure separately. |
| `lifecycle-after-repair.json` | Five cycles show 1 canvas / 19 tracked listeners / 2 observers / 0 pending owned RAF mounted, then all four counts zero unmounted; all recorded unmounted contexts report lost. Instrumentation is I-owned and does not prove heap collection or physical GPU memory release. |
| `failure-after-repair.json` | Three failure checks pass; no reported failures. This does not test non-hover pen input. |
| `pen-release-before-correction.json` | Two ordinary trusted CDP pen cases pass; two explicitly instrumented release-boundary cases fail. Not physical non-hover hardware evidence. |

These observations support the repaired **touch** path and retained lifecycle. They do not close R1 or authorize broader acceptance of the frozen implementation. Browser rebuild/rerun and physical-device, cross-browser and assistive-technology claims remain I/root-owned. S has already reopened acceptance for the required narrow pen correction.

## Actual commands and results

All checks ran from `C:\Users\Owenc\orca\Portfolio`.

| Command/check | Fresh result |
| --- | --- |
| `Get-FileHash components/studio/scene/controller.ts,components/studio/scene/verify-controller.mjs -Algorithm SHA256` plus final Node SHA256 comparison | Both files match the exact supplied freeze before and after review; values below. |
| `node components/studio/scene/verify-controller.mjs` | Exit 0: **30 tests, 30 passed, 0 failed**. Includes the incorrect pen oracle identified in R1. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false` | Exit 0, no diagnostics. No generated-type race; targeted fallback check was unnecessary. |
| Installed ESLint API via PowerShell stdin, `cache: false`, scoped to controller/harness; exact code below | Wrapper exit 0 after explicitly capturing configured-lint failure. Root configuration cannot load missing `@typescript-eslint/eslint-plugin`; **configured lint did not pass**. Supplemental in-memory `next/core-web-vitals`: 0 errors / 0 warnings for both files. |
| Read-only in-memory pen probe via `node --input-type=module`; exact code below | Exit 0 confirming the defect: touch expected/actual `['dissertation']`; pen expected `['dissertation']`, actual `[]`, behavior `pass: false`. |
| Numbered source reads, targeted `rg`, manifest/hash comparison, JSON trace inspection | Completed; current contract/adapter/type fingerprints verified. No blanket security/static-analysis pass claimed. |
| Browser, preview/server, production build, dependency repair | **Not run.** Owned by I or explicitly outside this assignment. |

Configured/supplemental lint invocation:

```powershell
@'
const { ESLint } = require('eslint');
(async () => {
  const files = ['components/studio/scene/controller.ts', 'components/studio/scene/verify-controller.mjs'];
  for (const [name, options] of [['configured', {}], ['supplemental-next', { useEslintrc: false, overrideConfig: { extends: ['next/core-web-vitals'] } }]]) {
    try {
      const results = await new ESLint({ ...options, cache: false }).lintFiles(files);
      console.log(JSON.stringify({ name, results: results.map(({ filePath, errorCount, warningCount, messages }) => ({ filePath, errorCount, warningCount, messages })) }));
    } catch (error) {
      console.log(JSON.stringify({ name, failed: true, error: error.message }));
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
'@ | node
```

Independent reproduction, importing only the current harness setup into memory:

```powershell
@'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const sourcePath='components/studio/scene/verify-controller.mjs';
const source=readFileSync(sourcePath,'utf8');
const fixture=source.slice(source.indexOf('function loadTs('),source.indexOf('for (const width of [320, 390])')).replaceAll('import.meta.url','sourceUrl');
const {harness}=new Function('assert','readFileSync','vm','ts','THREE','RoundedBoxGeometry','sourceUrl',fixture+'\nreturn {harness};')(assert,readFileSync,vm,ts,THREE,RoundedBoxGeometry,pathToFileURL(process.cwd()+'/'+sourcePath).href);
let regressionObserved=false;
for(const pointerType of ['touch','pen']){
 const h=harness(); const controller=h.mount(); h.flush(); const point=h.pointFor(0);
 for(const type of ['pointerdown','pointerup','pointerout','pointerleave','mousedown','mouseup','click'])h.event(type,point,{pointerType,isPrimary:type!=='click',buttons:type==='pointerdown'?1:0});
 const expected=['dissertation'];
 console.log(JSON.stringify({scenario:'completed non-hover release at unchanged exact-surface coordinates',pointerType,expected,actual:h.selections,pass:JSON.stringify(h.selections)===JSON.stringify(expected)}));
 if(pointerType==='pen')regressionObserved=h.selections.length===0;
 controller.dispose();h.assertReleased();
}
assert.ok(regressionObserved,'Frozen pen release regression must reproduce');
'@ | node --input-type=module
```

## Fingerprints and handoff

Both initial and closing review hashes equal the supplied freeze. Closing source read: `2026-11-14T20:59:15.373Z`; a final comparison is performed again before the completion receipt.

| File | SHA256 |
| --- | --- |
| Current controller, before/after | `65BE133FC5B2E7D6716AC9C262883FF40D6A9FCDA71360A1E13852BD4E99BE79` |
| Current harness, before/after | `ABE8CBCAD65121F3BACB72C0B680FA9E5267E39F4D44598982DCF62092565077` |
| Historical cleanup controller | `BD46EDE4D8CD0525AC89A8A491866BBC065554918D663A4830D5DB51FFC9FB63` |
| Historical cleanup harness | `7F9F21EE10458B676D548AFEDCEFFCEF84A21892CE42DE80D6677310EB325A6F` |
| Current StudioScene; matches cleanup | `29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC` |
| Current shared contract; matches cleanup | `7F00624980E4E89ECFF7E90ABF371595FE8A0DDF3CDC0401DB4B679A872A9097` |
| Current scene types; matches cleanup | `F5A0A0F6F174124FF6C0ABBFD6C9BEF46E6FB6BCC4900404719B4928C4FEF5C6` |
| Current StudioExperience; separate caption correction recorded by I | `E186AC78ACFC51583BE852B115046E28CFD20779F23AF5F6EAA2F0C83E6D15D1` |
| Historical cleanup StudioExperience | `75B57B83F0D8F93EDFFBDDC5F2CB26457F227F6D7A9643A8167487C62C2CB3E3` |

No implementation approval attaches to these frozen hashes. The remaining action is S's narrow R1 source/test correction, separate pen-delta critique and I-owned affected integration validation. Configured lint remains the explicit baseline limitation. No other required source cleanup was identified, and optional FND-1 remains deferred. This report completes the assigned independent review with a blocking verdict.

## Pen-delta re-review — final verdict APPROVE

14 November 2026. Independent critic task `task_3934d6c1fb6a`, dispatch `ctx_903fc39a4b0c`.

**APPROVE the narrow pen correction at the replacement hashes below. R1 is closed for source correctness and CPU regression coverage.** This supersedes the earlier REQUEST CHANGES verdict only for the corrected source/test revision. The historical finding, failing evidence and old hashes above remain intact. It does not certify I's production rebuild, browser reruns or physical non-hover pen hardware.

This re-review read the performer's appended follow-up and only the affected controller/harness regions. Only this report was updated. No source, test, UI, contract, state or other report was edited; no browser/build/preview/server or helper worker was used. The writer's settled implementation and this independent review remain separate.

### Exact delta and R1 closure

The current controller's comment at line 271 correctly says touch and non-hover pen **can** leave after release before click. Its single changed executable predicate at line 273 now permits a completed touch **or pen** candidate while requiring no active gesture, matching event/candidate type, matching pointer ID and zero buttons. The callback still occurs only through the existing matching trusted click handler, after candidate consumption. Mouse leaves still cancel. Active pen leaves, wrong identity/type, held buttons, drag and lifecycle cancellation still clear or reject the candidate.

This removes the incorrect touch-only assumption without guessing device hover capability. A pen's exact target was already qualified at pointerup; retaining that candidate across its matching release boundaries does not enlarge pen picking. All picking, click validation, callbacks, subscriptions, cancellation paths, thresholds, props and resource ownership outside the two changed lines are byte-identical to the reviewed controller.

**Independent byte evidence:** read the corrected controller into memory, replaced only the new comment and predicate with their recorded old forms, and computed SHA256. The result is exactly `65BE133FC5B2E7D6716AC9C262883FF40D6A9FCDA71360A1E13852BD4E99BE79`. This proves the implementation delta is limited to those two lines, without writing or checking out old source.

The official event-order basis remains [W3C Pointer Events 3 section 4.2.6](https://www.w3.org/TR/pointerevents3/#the-pointerup-event), inspected during the initial review: devices without hover emit out/leave after pointerup, and the rule is not touch-only. The matching click identity contract remains [section 4.2.12](https://www.w3.org/TR/pointerevents3/#the-click-auxclick-and-contextmenu-events). The corrected predicate supports the identified permitted ordering. Neither specification review nor fake trusted events establish physical hardware behavior.

### Focused harness assessment

| Current references | Assessment |
| --- | --- |
| `verify-controller.mjs:433-444` | Corrects the former mirrored expectation: completed touch/pen releases survive boundary events and rounded click coordinates; mouse leaving still cancels. |
| `verify-controller.mjs:450-480` | Two meaningful exact-hit/miss cases use a 4px projected plane at 320px. Independent real Three raycasting establishes the hit/miss, and a touch gesture verifies that the nearby miss is inside touch eligibility. Pen success must occur at click only, once; duplicate click/dblclick cannot select again. The miss preserves exact pen policy rather than copying the production predicate into an oracle. |
| `verify-controller.mjs:483-501` | Both out and leave are tested with wrong ID, touch/mouse type and held buttons. Subsequent matching boundaries and repeated clicks cannot revive the rejected pen candidate. These directly exercise the retained restrictions of the changed predicate. |
| `verify-controller.mjs:346-405` | Existing active/completed cancellation and invalid-gesture tables now include pen as well as touch. Coverage includes scroll, window/host resize, hidden/offscreen changes, cancel, outside input, context loss, disposal, active boundary exit, excursion/return, mismatched up, secondary/right-button, second-pointer and untrusted input. |

Independently reversed those focused harness changes in memory: removed the added test block, restored the old release test title/expectation, and restored the two existing touch-only cancellation tables. SHA256 exactly reproduced the old harness `ABE8CBCAD65121F3BACB72C0B680FA9E5267E39F4D44598982DCF62092565077`. Thus the helpers, original touch-focus fixtures and unrelated tests are unchanged; no broader test weakening is hidden in this delta.

The performer records the new harness failing two cases on the old controller (31/33 pass), then passing 33/33 after the correction. That historical test-first execution is adopted from the performer report. This critic independently ran the full corrected suite and inspected the changed oracles. CPU trust, default focus/history and hook scheduling remain modeled. The earlier nonblocking coverage limitations outside this pen delta remain unchanged and do not justify expanding this repair.

### Bounded ai-slop-cleaner disposition

The installed skill and review-only constraints loaded for the initial review remain in force. This pass assessed only the accepted pen delta; it did not repeat the prior 14-file review or reopen optional FND-1 diagnostics.

- **Necessary behavior:** the widened completed-device predicate directly repairs R1; the existing no-active-gesture, matching-type/ID and released-button restrictions remain necessary. No additional speculative guard or hover-detection heuristic was added.
- **Necessary tests:** corrected release expectation, paired precise hit/touch-only miss, boundary mismatches, and reuse of existing cancellation tables protect the changed behavior and its limits. These are observable output assertions with explicit geometric preconditions, not a second implementation of the release predicate.
- **Fallback/dead-code/duplication/boundary passes:** no new fallback, swallowed error, timer, retry, subscription, abstraction, duplicate activation path or navigation/focus coupling. Existing helpers are reused. No justified cleanup or deletion is required in this delta.
- **Result:** read-only cleanup delta **APPROVE / no additional source cleanup**. No runtime simplification was made by the critic. Broader UI/design and optional disposal diagnostics remain outside scope.

### Fresh checks and exact replacement freeze

| Command/check | Independent result |
| --- | --- |
| `Get-FileHash components/studio/scene/controller.ts,components/studio/scene/verify-controller.mjs -Algorithm SHA256` | Both files matched the supplied replacement freeze on entry. Closing comparison uses the same expected values below. |
| `node components/studio/scene/verify-controller.mjs` | Exit 0: **33 tests, 33 passed, 0 failed**, including all three new pen tests and the corrected release expectation. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false` | Exit 0, no diagnostics. No generated-type race occurred; a second targeted TypeScript run was unnecessary. |
| `node` via PowerShell stdin, installed ESLint API, `cache: false`, controller/harness only | Wrapper exit 0 after explicit error capture; configured lint still fails to load missing `@typescript-eslint/eslint-plugin`. Supplemental `useEslintrc: false`, `overrideConfig: { extends: ['next/core-web-vitals'] }`: **0 errors / 0 warnings** on both files. Same configurations and evidence limits as the initial invocation recorded above. |
| Read-only in-memory reverse-delta SHA256 probes via PowerShell stdin to Node | Exit 0 for each; reconstructed controller and harness exactly match their respective prior freezes. No filesystem writes. |
| Browser/build/preview, dependencies and broader cleanup | Not run. I owns affected production and browser verification. |

| File / current review state | SHA256 |
| --- | --- |
| Corrected controller, entry and closing comparison | `728C12AFFD53A069FD684A725C53CEB39A046AD569A43314A9AC2DD5348222B0` |
| Corrected harness, entry and closing comparison | `D26A7F4EB94678F1DBA7C32922F1FF35F3019231E71A712117E5E3D1AB49E2C4` |

**Final disposition:** no blocking source/test finding remains in the assigned pen delta. I must bind its affected rebuild/browser evidence to these replacement hashes; the old controller's passing CDP pen checks and failing injected-boundary cases remain historical evidence, not proof of the corrected production build. Browser boundary instrumentation must still be labelled separately from real non-hover hardware. Configured lint, physical-device/cross-browser/assistive-technology and exact GPU-memory evidence retain their stated limitations. This independent re-review is complete with **APPROVE**.
