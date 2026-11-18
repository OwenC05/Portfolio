# Independent G4 root assembly review

18 November 2026. Task `task_0e01b49e2ed2`, dispatch `ctx_78ea89e8b3da`. **REVISE for source integration readiness.** Two bounded root defects remain. Fourteen integration cases pass and two regression cases fail; scoped TypeScript and ESLint pass. I did not author or repair the assembly.

Reviewed `components/studio/StudioExperience.tsx` SHA-256 **`d65b4aeb2f00af40700ebb90e42087a267d6135c520c37582a12f4ffc39f3403`**, unchanged before/after this review. Application files, previous tests/evidence and active G2 work were not edited. G2 implementation was not treated as an immutable input or independently approved.

## Prioritized findings

### P2 — Navigation close suppresses the explicit focus call, but leaves native Ask restoration active

**Anchors:** `components/studio/StudioExperience.tsx:134`–141 (`closeNativeDialog`), `:276`–292 (close then optional explicit return), `:379` (navigation passes `restoreFocus=false`). Contract: `integration/state-contract.md:143`; corrected G3 handoff `controlled-ui-implementation.md:103`.

**Trigger:** open Ask from its keyboard-focused HTML entry, then activate an ordinary same-tab source route such as `/work/typeforge`. Root correctly aborts/clears and leaves the link's default action unprevented. During the resulting close commit it calls `dialog.close()`, even though `returnFocusOnClose` is false.

The native close algorithm restores the element recorded by `showModal()` when the dialog was modal, before dispatching the queued `close` event. The root flag only bypasses its own later `.focus()` call; it does not change that native restoration. [WHATWG HTML, close the dialog, step 12](https://html.spec.whatwg.org/multipage/interactive-elements.html#close-the-dialog).

**Independent evidence:** the actual component is exercised with an explicit port implementing that documented native step. It records `studio-ask-heading → ask-entry` during the close commit, with request aborted, hits cleared and navigation still unprevented. The focused test at `tests/assistant/studio-experience.test.cjs:868` fails its no-intermediate-Ask-return assertion. Positive controls show ordinary Close returns to Ask and assistant-to-project takeover keeps the same dialog open without an Ask return. [findings-evidence.json](findings-evidence.json), [integration-tests.log](integration-tests.log).

**Evidence boundary:** this is a standards-grounded source/port finding, not an observed browser focus trace. The port stops before native route navigation and does not prove React/browser default-action timing. It demonstrates the unhandled restoration path whenever the close commit runs while the original document remains active. The simpler explicit-focus-only port passes; that pass cannot establish the native no-return requirement. Root should account for native restoration when implementing the navigation close policy, then verify actual source navigation and ordinary close separately in its browser slot. No repair strategy was installed here.

### P2 — Project modality does not suppress a retained attention request

**Anchor:** `components/studio/StudioExperience.tsx:487`, `attentionRequested: askFocused || robotHovered`. Contract: `integration/state-contract.md:102` assigns suppression during a project modal to root.

**Trigger:** receive a qualified robot-hover `true`, then activate a project before a downstream hover-clear notification. In the committed root output, `selectedProjectId='copilot'`, `interactionEnabled=false`, and assistant `panelOpen=false`, but **`attentionRequested=true`**. The target project is correctly selected; the attention request itself remains live until another component sends `onAssistantHoverChange(false)`.

**Independent evidence:** `tests/assistant/studio-experience.test.cjs:857` fails the required false attention input. [findings-evidence.json](findings-evidence.json) records both the contradictory project-modal input and the positive downstream-clear control. This is an actual root prop observation, not a claim that an unseen G2 implementation visibly animates during the modal. Mask the hint for project modality at its root owner instead of relying on feedback timing; leave any G2 defense intact. No active scene code was inspected to infer a candidate change or to waive this contract.

## What independently passes

The new [studio-experience.test.cjs](../../../../../tests/assistant/studio-experience.test.cjs) loads the **actual transpiled root, `useAssistantRun`, request owner/parser/reducer/presenter, `createPanelNavigation`, `lockPanelScroll` and Shell**. It sends real NDJSON through a local `ReadableStream`/`Response`; no external network is used. Only browser primitives, hook scheduling and the dynamic scene boundary are test ports. Panel/scene child JSX is not mounted as React DOM.

- One live owner is created with generation disabled. One submission produces one request. HTML and optional scene receive the identical immutable snapshot object at every captured commit with HTML present; neither scene readiness nor modal switching creates another run owner.
- Close aborts immediately and clears the owner's hits, answer, selection and retrieval timing before the simulated React commit; the draft survives reopening. A valid answer received by the actual reader is deliberately left queued before close: that stale snapshot cannot repopulate either consumer in the clearing commit. Reopening does not submit again.
- Project activation wins **both orders of a same-batch Ask/project race**. Ask is refused while the project's Back traversal is pending. Assistant-to-project takeover keeps one open dialog and one active scroll lock, aborts/clears first, focuses only the project heading through root's explicit calls, and disables scene interaction. Assistant modality also disables scene interaction.
- Programmatic close/reopen, delayed queued `close`, an unexpected current native close and Escape/cancel take the expected state paths in the port. An old close notification cannot close the newly open assistant/project.
- Actual navigation helper behavior retains state fields, uses push then replace for project switching, returns to the owned base through Back, restores a project through Forward, and closes a fresh deep link by replacement. Root history/source-route handlers clear Ask and preserve native modified/new-tab/download behavior. Non-project source routes remain unprevented; no assistant history entry is added.
- Scene status failure and the actual error-boundary method leave HTML Ask and the root owner available. The scene JSX remains in its stable position under modals; its implementation is opaque. Missing dialog support retains SSR evidence and `/ask` fallback. A throwing `showModal()` clears Ask and routes to `/ask`, or reveals/focuses the project's SSR article while preserving its URL; locks/listeners are released.
- An explicit setup→cleanup→setup simulation leaves one live owner and one window/media listener set. Unmount aborts, releases scroll, closes the dialog and removes those listeners. This models effect replay; it is **not** actual React StrictMode certification.

The source uses a single panel intent ref updated before queued state commits, one native-dialog owner and a single retained scroll-release handle. Request clearing is delegated to the existing reviewed G1 owner, not duplicated. The root supplies the same snapshot value to both consumers; actual G2 commit delivery and rendering remain that lane's responsibility. No duplicate production controller/helper was introduced for testing.

## Fresh checks and exact scope

| Command from repository root | Result |
| --- | --- |
| `node --test tests/assistant/studio-experience.test.cjs` | **14 pass, 2 fail**, exit 1; the two findings above remain deliberately failing regressions |
| `node design/assistant/robot/review/root-assembly-g4/review-probes.cjs` | Exit 0; reproduces and records both findings rather than declaring them fixed |
| `node design/assistant/robot/review/root-assembly-g4/static-check.cjs` | Exit 0, zero diagnostics; source-only root/interface check |
| `node node_modules/eslint/bin/eslint.js components/studio/StudioExperience.tsx tests/assistant/studio-experience.test.cjs --max-warnings 0` | Exit 0, zero diagnostics |
| `node node_modules/prettier/bin/prettier.cjs --write tests/assistant/studio-experience.test.cjs` | Exit 0; formatted only the new leased test |

[run-checks.cjs](run-checks.cjs) reproduces the targeted test/type/lint commands, captures [check-results.json](check-results.json) and logs, and correctly exits **1** while the regressions remain red. The TypeScript program uses `noEmit:true`, `incremental:false` and installed Next ambient declarations; it substitutes a public-props-only `StudioScene` component **in memory** to exclude actively changing G2 implementation. It checks actual root and fixed imports against the published optional scene interface, not combined scene correctness or a full Next build. [typescript-result.json](typescript-result.json) states that boundary.

There were two corrected read-only discovery slips: a guessed `lib/studio-navigation.ts` path (the actual helper is `app/studio/panel-navigation.ts`) and PowerShell literal wildcard paths passed to `rg` (corrected to a directory plus glob). Neither altered files. The remaining nonzero test/check-runner exits are substantive review findings, not setup failures. No broad unchanged suite, `.next` writer, typegen/build/server/browser, dependency/configuration/asset/Git operation, paid call or hook-trust change was performed.

| Pinned item | SHA-256 |
| --- | --- |
| Actual root candidate | `d65b4aeb2f00af40700ebb90e42087a267d6135c520c37582a12f4ffc39f3403` |
| Read-only pre-G4 root | `4e8628d8b91c840a494174d559e30b7967bc062f773aa37d74f53f3094891e16` |
| New durable integration test | `f40a7789d001f43b52e7eaee9a58a94a9c4912a537ab22dd73adb88d09d68ecd` |
| Existing G3 test, unchanged | `2b464d963025a0f642f48cdd117bfeb484d4a358b3b7b4e411a9503c562a777a` |

[source-before.json](source-before.json) and [source-after.json](source-after.json) pin 14 root/fixed-consumer/helper/interface records and verify all stayed unchanged. `candidate-source.txt` is a review-only copy of the exact root candidate. G2 scene modules and its actively edited `lib/studio-contract.ts` implementation are expressly excluded from immutable-input claims; the frozen `scene-implementation/interface.md` is included. [review-files.json](review-files.json) inventories only this new review directory. The only additional write outside it is the new durable test named above.

## Root follow-up and unrun gates

Root retains both repairs. A bounded recheck should run the two regression cases and relevant integration cases against its next pinned source, followed by root's single fresh integrated build once G2 is stable. Neither finding authorizes this reviewer to change application files or take the browser slot.

Real React commits/StrictMode, native dialog event and focus ordering, route/default-action sequencing, history restoration, actual Tab/Enter/Space and focus containment, screen readers, phone keyboards/layouts, scene failure/remount, G2 attachment/lifetime and shared-snapshot next-frame clearing remain unexercised here. Combined scene, asset, placement, performance, appearance and deployment acceptance remain separate. The CPU port results are source evidence; no current preview was used as assembly evidence.
