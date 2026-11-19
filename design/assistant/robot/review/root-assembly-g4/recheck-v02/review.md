# Independent G4 repair recheck — bounded PASS

18 November 2026. This recheck evaluates root's two focus/attention repairs, which I did not author. It is separate from my concurrent G2 controller/cleanup implementation, whose independent verification remains root's responsibility. No root application/test or original review evidence was edited.

## Findings disposition

| Original finding | Recheck verdict and evidence |
| --- | --- |
| P2: navigation close leaves native Ask restoration active | **Closed for this pinned root repair.** `StudioExperience.tsx:255–263` blurs the active HTML element before a new assistant `showModal()` and focuses the substantive heading in the same commit. Ordinary Close still explicitly returns to Ask; navigation suppresses that explicit return; assistant-to-project takeover leaves the existing dialog open and focuses its project heading. The policy is scoped to a newly opened assistant modal and does not alter project-only opening. |
| P2: project modality leaves a retained attention request active | **Closed for this pinned root repair.** `StudioExperience.tsx:498–499` masks the attention hint whenever `panel.kind === 'project'`, independently of stale Ask focus or robot hover feedback. The original qualified-hover regression now observes `attentionRequested=false` alongside disabled interaction. |

No new blocking defect was identified in these two changes. This PASS does not approve all Studio assembly behavior, my G2 repair, deployment, appearance or device performance.

## Exact reviewed source

- Root: `components/studio/StudioExperience.tsx`, SHA256 **`1c1af8cc3bd9a77a108d9ff21cd9cad09056c0c31755db61db887bf6b97923ca`**.
- Durable test: `tests/assistant/studio-experience.test.cjs`, SHA256 **`4678443279847c541c63a163461b106a58cf524f73c5f71561f1ccda79c70812`**.

[source-before.json](source-before.json) and [source-after.json](source-after.json) confirm both remain unchanged. The latter also pins the supplied root receipts read for this recheck. The prior source is preserved by root at SHA256 `d65b4aeb2f00af40700ebb90e42087a267d6135c520c37582a12f4ffc39f3403`.

## Fresh independent evidence

The unchanged durable test runs against the actual transpiled root, G1 request helpers and existing navigation/scroll helpers in its established hook/DOM host. Eight relevant cases pass: both original defects, ordinary close/stale native-close handling, assistant-to-project takeover, history navigation, native-restoration ordinary return/takeover, native history close/reuse and ordinary return when another room control was focused. [Captured output](targeted-current.txt).

```powershell
node --test --test-reporter=tap --test-name-pattern='project modality|source navigation must|native focus-restoration|native history close|Ask owns|ordinary close aborts|assistant-to-project takeover|history navigation clears' tests/assistant/studio-experience.test.cjs
```

**8/8 pass, exit 0.** Scoped ESLint over root, its unchanged test and the private sensitivity launcher also exits 0. [checks.json](checks.json) records exact argv/results. The direct nonincremental TypeScript run captured in the separate G2 handoff also passed against this unchanged current root; no fresh Next build was run here.

The private [old-source-sensitivity.cjs](old-source-sensitivity.cjs) executes the exact unchanged current durable test text and assertions while substituting only the preserved pre-repair root bytes through a process-local read port. It modifies no file or shared module cache. Selecting the two original scenarios produces **the same two expected assertion failures, exit 1**: retained project attention and intermediate Ask return. [Output](old-source-sensitivity.txt). This is a sensitivity control, not a regression in the current candidate.

Root's before/port/after receipts were also inspected: original tests failed both cases; adding HTMLElement/blur and a nonfocusable body to the host still failed both cases before application edits; after the application repair all 18 root integration cases passed in root's run. The fresh sensitivity control confirms that the expanded host did not waive the original assertions.

## Root-supplied native evidence and remaining limits

Root's `integration/root-repair-v02/native-dialog-probe.json` separately records the native positive control restoring its invoker, the blur-before-show policy producing no invoker return/intermediate focus event, and an explicit ordinary return succeeding. That was a browser primitive probe, not this worker's execution.

More recent root evidence in `integration/verification-g4-v02/lifecycle-history/checks.json`, build **`XH_oOqBftWO8em8L7m4E6`**, reports:

- Native hash navigation closes Ask with no Ask focus event; cards clear and scroll unlocks.
- Keyboard Ask focuses its heading.
- Assistant-to-project takeover aborts the request, reuses the same native dialog, clears cards, disables interaction and records only `panel-project-typeforge-heading` focus.
- Keyboard source-route navigation reaches `/work/lexisnexis#lexisnexis-role` without an intermediate Ask return. Its recorded destination active element is BODY; this receipt does not claim destination article-heading focus.

Those are **root's actual-browser observations**, not my browser rerun. They provide the previously missing native evidence for the specific no-intermediate-return/takeover concerns. The historical handoff's “fresh build still required” text predates these supplied receipts; the newer evidence is authoritative for those scoped checks.

The same built application separately exhibited the robot-head activation failure assigned to my G2 implementation lane. That does not reopen these two root-source findings and is not certified fixed by this G4 recheck. A fresh build is still required for the newly authored G2 changes. Physical touch/pen, full focus/accessibility coverage, screen readers, actual React StrictMode, GPU lifetime, placement, performance and actual-Claude appearance acceptance retain their separate gates.

Only this new recheck directory was written for the independent G4 subtask: report, unchanged-assertion sensitivity launcher, source/evidence pins, exact command records and output logs. Root and its durable tests remain read-only and byte-identical.
