# TC-01 / TC-02 repair follow-up

14 November 2026. **Repair delivered; 18 CPU/history/SSR/commit-harness groups, nonincremental typecheck and supplemental lint pass. Independent re-review and browser acceptance remain pending.** This section supersedes the original performer result below only for the two assigned technical findings; the earlier evidence and failure records remain preserved.

Actual Orca Codex worker `term_7f3e1d35-c31b-4b82-9b7f-15b00f8b2068`, task `task_1028a39cc004`, dispatch `ctx_64f321e54538`, coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. Solo execution, no helpers. Only four files were edited in this follow-up: `components/studio/StudioExperience.tsx`, `app/studio/panel-navigation.ts`, `design/studio-v2/interface/verify-behavior.mjs`, and this report. No shell, page, CSS, scene, content, package/config, root steering or asset changes. No browser, server, build, screenshot, Next-generated or incremental output was produced. Root's prototype preservation and asset-pipeline direction remain intact.

## Starting evidence and repairs

Read the independent technical critique and its reproduction probes, frozen ownership/behavior contract, approved PRD/test specification, clarified brief and technical handoff. Task-specific AgentMemory recall timed out; current source and review artifacts supplied the evidence. At first inspection the source already contained a partial removal of mount-long manual restoration and two new regression groups, but the focus-retaining toggle test failed. The starting SHA256 values were `1dac93dd924a63ba4238bd207db43291502548fb86fd5b7a73e6caa415dc5107` for StudioExperience and `6b90950352682eafd6b9c178771b5fb2e2fdc6111e70ef76a619b511b090c7d1` for verify-behavior; those pre-existing edits were retained and completed, not attributed to this follow-up.

**TC-01:** navigation now assigns manual restoration only to the active project entry, after the project push, leaving the ordinary base automatic. Ordinary room/About/Contact reads and safe replacement closes select automatic restoration. Project switching/repeated selection, fresh fragments, Forward and rapid reopen retain the same navigation ownership rules and metadata; cleanup/failure restores the initial restoration setting on the active entry. The modal lock still owns its saved background coordinates. On traversal out of a panel, its lock is released synchronously in the history handler, before browser restoration, so a deferred React commit cannot overwrite a different section's saved coordinates.

The entry-specific choice follows the [HTML History interface](https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-history-scroll-restoration): the restoration setting belongs to the active entry. The [persisted-state algorithm](https://html.spec.whatwg.org/multipage/browsing-the-web.html#restore-persisted-state) restores scroll data for automatic entries. The CPU model deliberately permits a fixed body's panel entry to save zero; skipping that saved panel offset on Forward is the intended application behavior, not a browser measurement. Inactive project entries retain their manual mode until revisited; ordinary entries are automatic, and disposal restores the active entry's original mount setting.

**TC-02:** toggle, compact Escape and scene-pointer folding all use `collapseProjects`. When DOM focus is on the navigation or any descendant, it focuses the visible toggle with `preventScroll` before setting collapsed state. When that toggle is absent from layout, it uses the existing focusable studio section. If focus does not leave navigation, it keeps the disclosure expanded, consistent with Claude's `:focus-within` styling. Unrelated focus is preserved. Work, Tab/focus reveal and panel-return expansion continue to work. No new shell props, markup or CSS were needed.

## Targeted regression evidence

- Room at Y=65, About at Y=900 and Contact at Y=1350 restore their individual positions through Back/Forward, including a no-fragment room return and a panel round trip. No application scroll is issued for ordinary-only navigation.
- The ordinary base remains automatic when a panel opens. Browser Back saves a modeled zero panel offset; Forward opens immediately at the current background position instead of replaying zero. Substantive heading focus and fixed-body offset remain correct.
- The history case runs with React commits both before and after the modeled native restoration phase. A two-entry Back across the original panel base initially failed with `900 !== 65` (exit 1); synchronous unlock repaired it, and both timing variants now pass.
- Focus-retaining toggle, Escape and scene fold test both the nav itself and a project-link descendant. Tests cover focus-before-collapse ordering, no document scrolling, hidden-toggle fallback, failed focus retaining expansion, unrelated focus, Work re-expansion, panel-return re-expansion and Tab/focus reveal.
- The original 15 groups still pass: source-backed navigation ownership/metadata, repeat/switch/rapid reopen, real React SSR/content/IDs, immediate modal opening while scene loading, shared close/focus paths, fresh fragments, native link guards, motion/failure fallbacks and simulated cleanup/replay.

## Commands and results

All commands ran from `C:\Users\Owenc\orca\Portfolio`, Node `v24.21.0`.

| Command | Exit | Result |
| --- | --- | --- |
| `node design/studio-v2/interface/verify-behavior.mjs` (final source) | 0 | 18 groups pass, including both restoration/commit orderings and the multi-entry Back regression. |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` (final source) | 0 | Available project typecheck; no emit or incremental cache. Existing `.next` types are read, not regenerated. |
| `node design/studio-v2/interface/verify-lint.mjs` (final source) | 0 | Five product files, zero installed Next/React-hooks findings. |
| `node node_modules/eslint/bin/eslint.js components/studio/StudioExperience.tsx components/studio/ProjectEvidence.tsx app/studio/panel-navigation.ts app/studio/panel-scroll.ts app/studio/StudioShell.tsx` | 1 | Configured lint still unavailable: missing `@typescript-eslint/eslint-plugin`, ESLint 8.57.1. No package/config changes. |
| `node node_modules/prettier/bin/prettier.cjs --write components/studio/StudioExperience.tsx app/studio/panel-navigation.ts design/studio-v2/interface/verify-behavior.mjs` | 0 | Scoped formatting; only the owned check required formatting. |
| `node node_modules/prettier/bin/prettier.cjs --check components/studio/StudioExperience.tsx app/studio/panel-navigation.ts design/studio-v2/interface/verify-behavior.mjs` | 0 | Final changed source/check formatting passes. |
| `node design/studio-v2/interface/technical-critique-probes.mjs` | 1 | All 18 imported performer groups passed, then the historical defect assertion failed at line 49: actual `auto`, expected `manual`. This probe asserts the former defect and is not a post-repair acceptance test; it stops before its TC-02 observation. Critic-owned files remain unchanged for independent re-review. This run preceded the final synchronous-unlock addition; final behavior tests were rerun after that addition. |
| `Get-FileHash -Algorithm SHA256` for the files below | 0 | Final source/test and protected shell/page/CSS digests captured. |

The initial disclosure assertion failure and the multi-entry Back `900 !== 65` failure are retained here as negative evidence. Supplemental lint does not replace the missing configured TypeScript lint plugin.

## Final SHA256 values

| File | SHA256 | Disposition |
| --- | --- | --- |
| `components/studio/StudioExperience.tsx` | `4e8628d8b91c840a494174d559e30b7967bc062f773aa37d74f53f3094891e16` | Changed mechanics only |
| `app/studio/panel-navigation.ts` | `e67abf654d6fd286edc536ec3f29290ca5a6f2e67daeb91ca596ae3fd976e347` | Changed restoration scope |
| `design/studio-v2/interface/verify-behavior.mjs` | `0a213d7f9bca63594b60ee3d39a83eb7d37ef76829ec8f3f7655ff2c973c4bd9` | Changed targeted regressions/ports |
| `components/studio/ProjectEvidence.tsx` | `7242983f72892b81591848fbb5d81d39d61a4e6ae8f9ee3a7333e0a4b54b4e91` | Unchanged |
| `app/studio/panel-scroll.ts` | `ef13a9d34aec31eb245232ada5675bc1cf010dd41bdd352ecbefc72fe0daa188` | Unchanged |
| `app/studio/StudioShell.tsx` | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` | Unchanged from starting and critic hashes |
| `app/studio/studio.module.css` | `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a` | Unchanged from starting and critic hashes |
| `app/studio/page.tsx` | `f811dc5eca892e911650eb61cf3f859fe9ceba2b725cd95d3ac39a546f4d7314` | Unchanged from starting and critic hashes |
| `design/studio-v2/interface/verify-lint.mjs` | `0ad5d73cd235946f4cadcfdafce52fc0ae087e2562e9e7466520cfb53991f636` | Unchanged |

This report's own hash is supplied in the completion receipt rather than embedded in itself.

## Remaining limits and handoff

These are CPU ports and real server-rendered React evidence, not native browser acceptance. The history model explicitly represents per-entry restoration and saved positions, with two commit-order cases; it does not implement CSSOM/fixed-body layout, Next App Router history patching, native dialog event scheduling/focus trapping/inertness, bfcache or all engine restoration retries. The DOM port verifies requested focus behavior, not actual browser/AT focusability. Root still owns browser checks for room/About/Contact Back/Forward, panel reopen/reclose and multi-entry traversal, focus-retaining activation/scene folding, real scrolling, native focus, physical inputs and mobile presentation. No device, visual, performance or production-build claim is made.

Independent Codex re-review follows this completion; the critic's earlier FAIL verdict is not silently replaced by performer evidence. Claude-owned visual findings and the root's asset work remain outside this repair. No further technical edits are in progress after handoff.

---

# Studio v2 behavior performer (original delivery, preserved)

Result: source assembled and bounded technical checks passed. Independent Codex critique and actual browser/build evidence are pending with U/root; this report is not integrated visual or browser acceptance.

Provider: actual Orca `codex`, task `task_af20e209be36`, dispatch `ctx_6def74944874`, worker `term_b76bf898-e0e8-4bec-b037-1df3e6087df3`, U coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`, child Run `run_9e2c28f2f96d`. No helpers, model/effort overrides, browser, server, production build, package/config edits, or Next-generated/incremental writes were used.

## Delivered behavior

- StudioExperience consumes Claude's frozen shell; the scene component remains in the same mounted slot. Project selection does not issue a view command or wait for scene loading, camera motion, animation, network, requestAnimationFrame, or a timer.
- Native showModal and substantial article-heading focus run in a React layout commit. The shared ProjectEvidence supplies every existing project string and link; dialog IDs and label references use `panel-`. Enhanced shell hides the server evidence with native hidden; unsupported/failed native modality leaves complete ordinary evidence usable.
- A new same-document project entry preserves Next and unrelated state fields and adds an opaque ownership token. Only the live navigation instance's matching token/URL/base record permits Back. Repeat selection adds no entry; switching projects replaces the panel entry. Fresh/reloaded/forged entries close by replacement with #studio. Back/Forward/hashchange read URL state without new entries. Rapid reopen during pending Back is rendered immediately and its URL commits after that traversal settles.
- Close, Escape, and article #studio use one close path; native close events cannot dismiss an already-reopened dialog. Focus returns without scroll to the actual HTML invoker or equivalent project shortcut. The native scrolling content div resets to its top on a changed/opened project.
- Body/root scroll locking preserves and restores owned inline properties, priorities and document coordinates; listeners, media subscriptions, scroll restoration and locks clean up. Fresh fragment hydration compensates for the pre-hydration SSR-article anchor position so the room is the modal's background. Ordinary shortcut/scene selection does not scroll the document.
- Modified, nonprimary, download, external, new-context and different-query/path links stay native. Work/skip focuses and unfolds project navigation without scrolling. Disclosure state, toggle/nav focus, nav Escape, scene folding and scoped look keyboard commands are in Codex-owned behavior.
- Reduced-motion preference updates live, including legacy MediaQueryList listeners. Graphics failure keeps the reading path available and shell reload guidance intact. A showModal failure restores native history scrolling and reveals/focuses the corresponding ordinary article.

## Serial StudioShell wiring and release

U explicitly authorized temporary exclusive nonvisual edits via `msg_40563b699153` after Claude's complete release at SHA256 `54cd010c7c0d62d7970d885535624b3bcb1504f78cb842945a8e95d2af1c775f`. Consumed the added frozen props in contract.md: projectsOpen, projectsToggleRef, panelScrollRef, onToggleProjects, onFocusProjects, onProjectsKeyDown, onScenePointerDown, onLookKeyDown. Lifted the existing mechanical handlers/state into StudioExperience and connected those props. Preserved Claude's DOM structure, CSS/class names, text and SVG. Shell ownership is released back to U/Claude with this report; no further shell edits are in progress.

Concrete integration inspection: mobile folded navigation uses clipping and :focus-within, not display:none; Work explicitly sets disclosure open and focuses it. The actual scrollbar is .panelScroll, so the new panelScrollRef resets that element. These are source/CPU findings; actual 320/390px focus visibility and scrolling remain browser checks.

## Validation commands and exits

All commands ran from `C:\Users\Owenc\orca\Portfolio` with Node v24.21.0.

| Command | Exit | Evidence |
| --- | --- | --- |
| `node design\studio-v2\interface\verify-behavior.mjs` (final) | 0 | 15 CPU/history/SSR/simulated commit groups passed. |
| `node node_modules\typescript\bin\tsc --noEmit --incremental false` (final) | 0 | Full available project typecheck; no emit/incremental output. |
| `node design\studio-v2\interface\verify-lint.mjs` (final) | 0 | Installed supplemental Next recommended + React hooks rules: 5 product files, 0 findings; includes useCommitEffect dependency checking. |
| `node node_modules\eslint\bin\eslint.js components\studio\StudioExperience.tsx components\studio\ProjectEvidence.tsx app\studio\panel-navigation.ts app\studio\panel-scroll.ts app\studio\StudioShell.tsx` | 1 | Configured lint unavailable: missing @typescript-eslint/eslint-plugin from .eslintrc.json. No dependencies/config changed. |
| `node node_modules\prettier\bin\prettier.cjs --write components\studio\StudioExperience.tsx components\studio\ProjectEvidence.tsx app\studio\panel-navigation.ts app\studio\panel-scroll.ts design\studio-v2\interface\verify-behavior.mjs` | 0 | Formatting confined to owned behavior files/check. No shell/page/CSS formatting. |

Useful earlier failures preserved:
1. Initial typecheck exit 1 during sibling assembly: `components/studio/scene/build-studio.ts(347,3): error TS2741: Property 'occluders' is missing in type '{ scene: THREE.Scene<THREE.Object3DEventMap>; targets: StudioTarget[]; }' but required in type 'StudioModel'.` Later full checks passed after S assembled; this performer did not edit that file.
2. First behavior test invocation exit 1 after seven passing groups: `AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal` at the test comparing project objects loaded through two isolated transpilation caches. Corrected the assertion to deep equality, keeping all content checks; no product workaround. Subsequent final 15-group run passed.
3. Configured ESLint exit 1: `ESLint couldn't find the plugin "@typescript-eslint/eslint-plugin"` (ESLint 8.57.1). Supplemental checks are explicitly not a replacement for this missing configured tool.

## Test scope and remaining evidence

The behavior check executes real source via TypeScript transpilation entirely in memory. Real ReactDOM server rendering checks full page evidence, every project paragraph/fact/link, profile/About/contact, original Next metadata, unique IDs and valid aria-labelledby references. History uses a structured-cloning in-memory browser port with asynchronous traversal modeled separately. Event/focus/scroll/media/effect checks call the actual StudioExperience component and its handlers through a deterministic simulated hook/commit runner with DOM ports, including one simulated StrictMode cleanup/replay. Supplemental lint runs on in-memory transpiled source with installed rules and reports transpiled line numbers.

These checks do not prove actual Next hydration, browser focus trapping/inertness/Escape defaults, native trusted gestures, real React StrictMode resource cycles, physical-device behavior, mobile layouts, real scroll positions, camera invariance, WebGL/lazy-chunk/context-loss integration, or rendering/performance. Dynamic scene is stubbed for CPU SSR. Root/I must verify those against the current integrated preview/build and capture actual desktop/mobile/open-panel frames. No integrated build claim is made. Independent Codex critique is explicitly pending after performer completion, as dispatched; no independent approval is claimed.

Assembled-ready was sent early via `msg_7b0fd3475eb6`. Final performer completion releases the source to U for that independent review.

## Final edited-source hashes (SHA256)

| File | SHA256 |
| --- | --- |
| `components/studio/StudioExperience.tsx` | `e4a2207e8664a1f755d81fbf00442223f99c55bf5b93ca22cb0063a9a7a30ed6` |
| `components/studio/ProjectEvidence.tsx` | `7242983f72892b81591848fbb5d81d39d61a4e6ae8f9ee3a7333e0a4b54b4e91` |
| `app/studio/panel-navigation.ts` | `e0d78f392b3b68ee115c56fe2e3c4c662e424b7a6629e88f8cebdf48b9a2733b` |
| `app/studio/panel-scroll.ts` | `ef13a9d34aec31eb245232ada5675bc1cf010dd41bdd352ecbefc72fe0daa188` |
| `app/studio/StudioShell.tsx` | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |
| `design/studio-v2/interface/verify-behavior.mjs` | `904116dbee8f5ec21262fda9faa053b4b5366a51ca684ca06b031fd9dfea3837` |
| `design/studio-v2/interface/verify-lint.mjs` | `0ad5d73cd235946f4cadcfdafce52fc0ae087e2562e9e7466520cfb53991f636` |

The report itself is the eighth edited artifact, `design/studio-v2/interface/behavior-performer.md`; its own hash is excluded to avoid a self-referential digest. No files outside these seven source/check files plus this report were edited by this performer.

