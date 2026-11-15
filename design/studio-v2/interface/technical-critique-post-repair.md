# Independent technical re-review: TC-01 and TC-02

**PASS within the bounded source/CPU/SSR scope. Both P2 findings are resolved on the hashes below; no blocking technical finding remains in the reviewed repair.** This supersedes only TC-01/TC-02's unresolved disposition in the historical technical critique. It does not grant production, full browser/device, performance or visual acceptance. The separate **320px visual FAIL remains deferred**.

15 November 2026. Independent Orca Codex critic, task `task_c55e30985f95`, dispatch `ctx_3aa540fbbb15`, sender `term_b88bfab534be285c7992929c4a956d15`, coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. No helpers. Read the replacement performer's actual report for task `task_1028a39cc004`, dispatch `ctx_64f321e54538`, current product source and tests, original critique, and root's supplied browser record. Product files/tests remained read-only; no shell, CSS, design or asset work was done.

## Finding dispositions

### TC-01 — RESOLVED: ordinary section restoration

`panel-navigation.ts:29-35` selects automatic restoration for ordinary entries and manual restoration for project entries. Crucially, `open` changes the mode **after** pushing the panel at lines 73-79, so the ordinary base retains automatic restoration. Repeated selection and project switches retain manual mode; reads and safe replacement closes synchronize the active entry at lines 84-109. `dispose` restores the captured initial setting on the active entry at lines 112-114. Inactive project entries remain manual until revisited; this is an explicit entry policy, not a claim that disposal rewrites every historical entry.

`StudioExperience.tsx:121-134` releases the panel lock synchronously when a history event resolves to an ordinary entry, clearing its release ref before the later React commit. Consequently the commit's close effect at lines 204-208 cannot restore the old panel background over the browser's newly restored section position. The former mount-long manual assignment is gone. About/Contact remain native links; ordinary-only navigation issues no application scroll call.

Evidence covers the original room → About → Back failure, section Back/Forward, panel round trips, multi-entry Back, and modeled React commits before and after restoration. The added critic case verifies both X and Y restoration, and separately challenges a root-observed Next ownership-marker loss: reclose replaces with `#studio`, preserves remaining Next/custom metadata, restores automatic mode, keeps focus/interaction correct, and permits a subsequent ordinary Contact round trip. It does not assume an empty fragment when ownership is absent.

**Assessment:** high confidence that the original source defect is repaired. Browser-native ordering has supporting root Chromium observations, with the limits below.

### TC-02 — RESOLVED: every collapse path uses focus-safe state

`StudioExperience.tsx:325-339` implements the common collapse function. It checks focus on the navigation **or any descendant**, moves it with `preventScroll` to the visible toggle or existing studio-section fallback, and leaves expansion intact if focus remains inside the navigation. Only after focus leaves does it set collapsed state. Unrelated focus is preserved.

Compact Escape calls that function at lines 340-345; toggle close and scene-pointer folding call it at lines 392-398. There is no separate direct `setProjectsOpen(false)` path bypassing this check. Work/focus/panel-return expansion is retained. Claude's frozen shell and `:focus-within` CSS are unchanged.

The performer tests cover nav/descendant focus, successful focus-before-collapse, fallback when the toggle is hidden, unrelated focus, Work/Tab/panel return, and failed focus. The additional critic matrix checks **failed focus followed by successful recovery for toggle, Escape and scene folding**, for both nav and descendant focus. It also removes the hidden-toggle fallback target and verifies toggle/scene activation keeps the focused navigation expanded instead of advertising a false collapse. These are CPU focus-port assertions, not native AT/device measurements.

**Assessment:** high confidence that the original state/visibility contradiction and its sibling collapse paths are repaired. Initial clipped-but-AT-exposed navigation remains the intentional contract; its presence in role queries alone is not a new failure.

## Fresh validation

All commands ran in `C:\Users\Owenc\orca\Portfolio`.

| Command/check | Exit | Result |
| --- | --- | --- |
| `node design/studio-v2/interface/technical-critique-post-repair-probes.mjs` | 0 | Executes all **18** current performer CPU/history/real-React-SSR/simulated-commit groups, then **4 additional critic groups**; all pass. |
| `Get-FileHash -Algorithm SHA256` for reviewed source/evidence, with explicit comparison against root's browser `sourceHashes` and original critic digests | 0 | All four browser bindings match live files; original report and defect probe match their historical digests. Companion manifest contains all 15 current source/evidence hashes. |

The new probe imports the performer's source/fixture through an in-memory TypeScript wrapper. It reuses the explicit hook, DOM and history ports; independent case selection is not an independently implemented browser or React scheduler. Real server rendering remains real ReactDOM SSR; native hydration is not executed.

The replacement performer's final typecheck (`node node_modules/typescript/bin/tsc --noEmit --incremental false`) and supplemental lint (`node design/studio-v2/interface/verify-lint.mjs`) are recorded exit 0 on these same source hashes. They were read, not redundantly rerun during this review. Configured ESLint remains the explicit exit-1 missing-`@typescript-eslint/eslint-plugin` baseline; no package/config edits were made or requested.

## Attributed native-browser evidence

Root supplied `.omx/context/immersive-v2-interface-browser-repair.json` through U message `msg_95ef9360a27d`. The record is dated 14 November and uses the Next **development** preview at `http://127.0.0.1:4181/studio`, isolated Chromium, 1440×900 and 390×844, with reduced motion enabled. Its four source hashes match this review. These are root's measurements, not browser work performed by this critic.

- Section history records About Y809, Back to the room Y0, Forward to About Y809, and an About/Contact return to the actual saved About position Y0. The Contact click had scrolled the header link into view first, so expecting the earlier About Y809 was an invalid harness expectation. Do not reinterpret this as evidence that every section always returns to Y809.
- Project open/Escape/Forward/reclose records substantive heading/shortcut focus, automatic/manual restoration, interaction disabling/enabling, and unchanged eye `-0.7,2.8,3.4`, yaw `-4`, pitch `-6`.
- The raw `projectHistory.passed` flag remains **false**, with a 5000ms timeout: that harness waited for an empty final fragment. Its preserved final record instead shows the contract-permitted `#studio` fallback after Next removed `__studioPanelEntry` on Forward, dialog closed, Y0, automatic restoration and shortcut focus. Root separately reports the safe fallback check. The raw failure is not erased or relabeled; its expectation and observed conforming state are distinguished.
- The 390px disclosure record shows click expansion, trusted Tab into the project link, and Escape returning focus to the toggle with `aria-expanded=false`, `clipPath=inset(50%)`, no focus inside navigation and Y0. It does not establish native focus-retaining toggle/scene-pointer behavior on every browser or AT; those branches have source/CPU evidence here.

## Historical evidence preserved

Neither `technical-critique.md`, `technical-critique-probes.mjs`, nor `technical-critique-hashes.json` was edited. The old probe asserts the former defect (`manual` restoration); its expected post-repair failure is **not** a regression or an acceptance check. The performer retained its exit-1 `actual auto, expected manual` run, including the fact that it preceded the final synchronous-unlock change. This critic did not rerun or rewrite those historical assertions. New acceptance evidence is separate.

| File | SHA256 |
| --- | --- |
| `components/studio/StudioExperience.tsx` | `4e8628d8b91c840a494174d559e30b7967bc062f773aa37d74f53f3094891e16` |
| `app/studio/panel-navigation.ts` | `e67abf654d6fd286edc536ec3f29290ca5a6f2e67daeb91ca596ae3fd976e347` |
| `design/studio-v2/interface/verify-behavior.mjs` | `0a213d7f9bca63594b60ee3d39a83eb7d37ef76829ec8f3f7655ff2c973c4bd9` |
| `app/studio/StudioShell.tsx` (unchanged) | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |
| `app/studio/studio.module.css` (unchanged) | `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a` |
| Original `technical-critique.md` | `2d24a613bcb24cc5eba9a6b85b5f76cf2ec682c39c825bcf9d5cd36ec17698a0` |
| Original `technical-critique-probes.mjs` | `ee925fd9eca48078bda841a2fa884c3e7210d4ba1b53cbff7e5cdd600b996f2c` |
| `technical-critique-post-repair-probes.mjs` | `9edc520ad9870914c85203aa8b64b318b371f2a709dc50cb5125839695d71292` |
| Root browser JSON | `018b241e5c57fb3c05a864fcc6accb907c8529d131e638d1bded5951ecbdebdb` |

See `technical-critique-post-repair-hashes.json` for remaining source, test and report hashes. This report is excluded from that manifest to avoid a circular digest.

## Remaining limits

No critic browser session, server, build, `.next` write, image inspection, visual edit or product/test change. Native dialog scheduling, complete Next transition/race behavior, bfcache, engine restoration retries, real StrictMode resource lifecycles, CSSOM/fixed-body layout, screen readers, physical touch/pen, full failure injection, production performance and broader browser/device support remain outside this bounded approval. Root's recorded dev Chromium subset supplements, but does not remove, those limits.

The independent Claude 320px overlap/name-wrap visual FAIL remains separate deferred prototype evidence. No aesthetic correction or asset workflow was started. Only this report, the separate post-repair probe and its hash manifest were authored for this dispatch.
