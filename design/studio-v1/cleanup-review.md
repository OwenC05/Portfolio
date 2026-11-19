# AI SLOP CLEANUP REPORT — Studio v1

14 November 2026. Bounded read-only source cleanup review; parent task `task_45a523e2caa0`, dispatch `ctx_dbddaf729052`.

**Result: review complete, no runtime changes. No justified source simplification was found.** The separate critic approved the inventory/plan with qualifications. Root accepted the no-op outcome and explicitly deferred optional FND-1 P3 teardown diagnostics in message `msg_d7fea9edcd86`: do not implement or widen that recommendation in v1. This completes this source-cleanup assignment only. Configured lint remains nonzero, and I/root's integrated fallback, lifecycle and portfolio acceptance remain separate.

## Scope and ownership

Reviewed the 14 files in `app/studio/**`, `components/studio/**`, `lib/studio-contract.ts`, `lib/studio-content.ts`, and the container `app/globals.css`, with globals review confined to its six-line reduced-motion addition at lines 14–19. Runtime belongs to S/U; contract/content belongs to F/C. This coordinator and its leaves authored only this report and records beneath `design/studio-v1/cleanup-coordination/`.

Preserved all shared work. No runtime/package edits, root goals/ledger/planning writes, source-log/private-photo access, homepage/draft changes, browser/preview operations, deployment or commits were performed. No new dependency or test was added. No build was repeated while root's preview was running.

Inputs: assigned common/cleanup briefs, installed ai-slop-cleaner and version-matched Orca orchestration workflow, approved studio PRD/test-spec, current F/C/S/U reports and final S/U independent dispositions. Task-specific memory lookup returned no relevant project matches; current artifacts supply the evidence. The earlier pending-U-review statement and initial StudioExperience hash in coordinator records are historical: the inventory and critic include U's approved bare-route history-focus fix.

## Source fingerprints

Full SHA-256 values for every scoped file, byte sizes, exact source set, six-line globals substring and comparisons are in [final-source-verification.json](cleanup-coordination/final-source-verification.json). At **20:26:10.232 UTC**, all **14/14** current files matched both the [inventory manifest](cleanup-coordination/inventory-hashes.json) and the [critic's closing manifest](cleanup-coordination/critique-hashes-after.json), with no added or missing scoped files. This is fresh coordinator verification; tests were not unnecessarily rerun.

| Key reviewed source | SHA-256 |
| --- | --- |
| `components/studio/scene/controller.ts` | `BD46EDE4D8CD0525AC89A8A491866BBC065554918D663A4830D5DB51FFC9FB63` |
| `components/studio/scene/resources.ts` | `756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509` |
| `components/studio/StudioExperience.tsx` | `75B57B83F0D8F93EDFFBDDC5F2CB26457F227F6D7A9643A8167487C62C2CB3E3` |
| `components/studio/scene/verify-controller.mjs` | `7F9F21EE10458B676D548AFEDCEFFCEF84A21892CE42DE80D6677310EB325A6F` |
| Exact `app/globals.css:14–19`, including original CRLF and blank sixth line | `AE9CFD1E017A63A058E98FD3F56CC6A6C3B1421B76A32E989BE29D1AD15DE4A8` |

Whole globals.css fingerprinting establishes identity, not authority to review or change its other rules. Future source changes require reassessing affected conclusions rather than treating this snapshot as permanent approval.

## Behavior lock and actual checks

The inventory performer ran the existing checks once; the critic inspected their raw output and independently verified source identity. The coordinator adopted that evidence after the final hash comparison. [inventory-checks.json](cleanup-coordination/inventory-checks.json) contains complete commands/output/timestamps; [critique-checks.json](cleanup-coordination/critique-checks.json) distinguishes reviewer execution from adopted results.

| Check / actual command | Result | Valid scope and limits |
| --- | --- | --- |
| `node components/studio/scene/verify-controller.mjs` | **PASS**, exit 0; 20 passed, 0 failed; inventory run started 20:10:10.550 UTC | Real Three geometry/projection/rays, controller control flow, modeled statuses and teardown attempts, mocked adapter. DOM, renderer, observers, painting and hook scheduling are substitutes. This is not actual browser, React StrictMode or GPU verification. |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false` | **PASS**, exit 0; no diagnostics; inventory run started 20:10:10.570 UTC | Full project type compatibility with actual scene imports at the matched revision. No behavioral or visual proof. |
| `npm.cmd run lint -- --no-cache` | **FAIL / existing baseline tooling gap**, exit 1; inventory run started 20:10:10.570 UTC | Cannot load `@typescript-eslint/eslint-plugin` referenced by existing `.eslintrc.json`; configured lint did not successfully lint source. F's earlier baseline corroborates it. No rules removed, alternate config substituted or package installed. |
| Inventory/critic fingerprint scripts and coordinator Node comparison via PowerShell stdin | **PASS**, exit 0 | Inventory and independent before/after snapshots match; final coordinator comparison matches all 14 files and the exact globals addition. Helpers write only owned review evidence. |
| Numbered source reads, targeted `rg`, `git status --short`, `git diff -- app/globals.css` | Source review complete | Imports, fallbacks, catch behavior, dead-code candidates, coupling and CSS/content reviewed. Existing dirty/untracked work retained; globals diff remains the assigned six lines. A text scan is not a security audit. |
| Exact `orca orchestration worker-show --dispatch ...` for both leaves | Both **succeeded / settled** | Confirms inventory and independent critique completed; not evidence of product correctness. |
| Build, browser/GPU/failure/lifecycle/performance tests, security/dependency scan | **NOT RUN by this lane** | Root/I owns integrated checks. F's successful pre-studio build is not an integrated build. No additional test or build was warranted for a read-only review. |

Prior evidence retained within its recorded scope: F's exact IDs/hash tests; C's shape/claim/destination checks; S's model/source review; U's SSR/no-JS/keyboard/reduced-motion and final history retest. U reports 53 no-JS content checks, 24 targeted history assertions and eight explicit-fragment states after the history fix. These are prior U reviewer observations, not fresh browser execution or image inspection by this lane. They do not close lazy-import/WebGL/context-loss or full route-remount evidence.

## Cleanup plan and fallback classification

The [cleanup plan](cleanup-coordination/plan.md) existed before recommendations. Order: establish preserved behavior and ownership; inventory/classify fallbacks; review dead code; review duplication; review naming/error handling, abstraction and coupling; assess test gaps; obtain an independent critique; reconcile without source edits. The [inventory](cleanup-coordination/inventory.md) places all fallback families before its proposed repair. The [independent critique](cleanup-coordination/critique.md) verifies them against source and qualifies the conclusions below.

**“Grounded” means the design purpose is justified, not that every primary/fallback path is fully tested or every error cause retained.** Incomplete test/diagnostic evidence remains explicit. F15/F16 include ordinary authored branches; F18 is test isolation, not a production fallback.

| ID / source | Reconciled classification and disposition | Evidence boundary |
| --- | --- | --- |
| F01 — `app/studio/page.tsx:15–100`, `ProjectEvidence.tsx:15–75`, `StudioExperience.tsx:194–249` | **Grounded fail-safe: retain** server HTML, ordinary anchors and scene selection into the same sections. | Prior U SSR/no-JS evidence; root still owns actual hotspot-to-HTML journey. No duplicate evidence store. |
| F02 — `StudioExperience.tsx:22–44,227–245` | **Grounded fail-safe: retain** lazy boundary and independent sketch. | Unavailable occurrence reaches UI; cause details are not retained by componentDidCatch. Lazy rejection/render-boundary injection remains integrated verification. |
| F03 — `StudioExperience.tsx:202–245`, `studio.module.css:242–269` | **Grounded fail-safe: retain** loading/ready/unavailable gating and explicit hidden override. | No false success or retry loop. CPU status checks do not prove React/CSS failure transitions. |
| F04 — `studio-contract.ts:23–29`, `StudioExperience.tsx:46–55,100–108,131–180` | **Grounded compatibility: retain** strict hashes, existing-target checks and native-link escape. | Prior accepted/rejected hash and modified-click tests cover part of the surface; missing-target/other escape branches are source-reviewed only. |
| F05 — `StudioExperience.tsx:69–84,103–107`, `controller.ts:259–265`, globals addition | **Grounded accessibility fail-safe: retain** conservative motion preference and instant response. | Prior U preference checks and CPU updates; missing matchMedia is untested. Frozen reducedMotion input is intentional even though both scene states are immediate. |
| F06 — `StudioExperience.tsx:86–129,133–138` | **Grounded navigation compatibility: retain** event coalescing and transition-only bare-route focus restoration. | Current U retest approves the fix. Same-document hash/history movement does not prove route unmount/remount. |
| F07 — `StudioScene.tsx:18`, `controller.ts:47,109–130,173–177,271` | **Grounded fail-safe: retain** host/window/readiness/zero-size guards. | CPU covers zero-size recovery; null host/defaultView branches are unexercised. A hidden host waiting for invalidation is not itself a defect. |
| F08 — `controller.ts:60,132,305–323` | **Grounded capability degradation: retain**, with limits. | Missing observers retain window resize/document visibility, not equivalent element-resize/offscreen guarantees. Missing observers/default DPR branches lack dedicated tests. No new browser-support mandate inferred. |
| F09 — `controller.ts:75–83,109–123,142,219–267,314–322`, `StudioScene.tsx:8–29` | **Grounded lifecycle fail-safe: retain** disposed/visibility guards and current callbacks. | CPU modeled teardown/late callbacks pass; actual React/browser/GPU ownership remains unverified here. |
| F10 — `controller.ts:269–299,325–326`, `textures.ts:5–14` | **Grounded terminal fail-safe: retain** construction/texture/invariant failures. | Unavailable reports occurrence; cause details are discarded. CPU covers constructor/partial-model failure, not all Canvas2D/target/light guards. No mandatory new logging architecture. |
| F11 — `controller.ts:103–106,121–154,272` | **Grounded terminal fail-safe: retain** render/context-loss disposal. | CPU failure/event cases pass; real GL loss, throwing status callback and retained HTML usability require integration. |
| F12 — `resources.ts:28–46` | **Grounded release isolation: retain** attempt-all behavior and first-error rethrow. | CPU confirms ordering, first-error identity, cleared sets and repeat disposal. Error preservation is local to this ledger, not end-to-end GPU proof. |
| F13 — `controller.ts:85–94`, especially 86/89 | **Mixed: grounded cleanup continuation plus masking of diagnostic detail.** Optional P3 repair **explicitly deferred by root**. | Blanket catch suppresses the ledger's error and other release errors. No demonstrated leak or visitor failure. Preserve nonthrowing teardown; do not implement or widen in v1. |
| F14 — `controller.ts:172–240`, harness 276–367 | **Grounded touch accessibility path: retain** exact-first picking and expanded touch eligibility. | CPU covers policy, resize and cancellations. Overlap-corner cases may select the policy-chosen neighbor; they do not prove each project has an exclusive usable 44px square. Real touch/scroll/overlap usability belongs to I/root. |
| F15 — `resources.ts:59–115`, `build-studio.ts:128–141`, `textures.ts:47–117` | **Grounded batching exclusions / ordinary authored defaults: retain**. No masking found. | Interactive/multi-material/singleton mesh paths and explicit decorative display have purposes. Some exclusion combinations lack dedicated tests; no new registry or deletion justified. |
| F16 — `ProjectEvidence.tsx:59–70`, `studio-content.ts:95`, `StudioExperience.tsx:188` | **Ordinary truthful rendering, not masking:** retain empty-link and optional selected-attribute branches. | Avoids fabricated dissertation downloads or default selection; C/U checks provide limited provenance/markup evidence. |
| F17 — `studio.module.css:11,130,149,217–405,617–809`, `StudioExperience.tsx:207–224` | **Grounded presentation compatibility: retain** system fonts, responsive layout and warm sketch. | One content tree, useful no-JS path. Source review does not certify final visual composition or every font/browser combination. |
| F18 — `verify-controller.mjs:10–24,47–174,246–273,588–651` | **Grounded test isolation, not production fallback.** | Real Three maths with fake renderer/DOM/painting/hooks. These would mask evidence only if reported as actual browser/React/GPU tests; this report does not do so. |

## Concrete finding and disposition

**FND-1 — P3 diagnostic loss, accepted and explicitly deferred. Owner: S, under root's scope decision.** `controller.ts:86` catches every release exception, including the first error deliberately rethrown by `resources.ts:35–46` through the call at controller line 89. A normal unmount can therefore lose failure detail without unavailable status. This is a source-proven observability gap; it does not demonstrate resource retention, a GPU leak or visitor-visible failure.

The smallest candidate repair, if separately assigned later, is local first-error capture and one development-only diagnostic after remaining cleanup attempts. Preserve nonthrowing/idempotent teardown and late-callback guards; use an error-present flag independent of the thrown value. Existing S-owned failure tests could then check one diagnostic, first-error identity and unchanged release behavior. No shared contract, reusable logger, dependency, production telemetry or visible debug UI is warranted. **This is recorded for ownership, not implementation authorization: root explicitly deferred it for v1.** Startup/render/error-boundary paths already expose unavailable occurrence; the review does not widen the diagnostic request to those paths.

**FND-2 — integrated evidence requirements, not invented source defects. Owner: root/I with S/U.** Missing actual lazy-import/WebGL/context-loss and real React route-lifecycle evidence cannot be replaced by the CPU harness or silent console. No source change is requested merely because evidence is missing.

**FND-3 — configured lint baseline gap. Owner: root/F tooling scope.** The fresh nonzero lint result reproduces the existing missing plugin before successful source linting. It remains an explicit quality-gate limitation; no dependency installation, rule removal or broad repair was requested or performed.

## Pass outcomes and design assessment

| Pass | Disposition | Reason |
| --- | --- | --- |
| Fallback resolution | **Completed inventory and disposition** | All 18 families independently reviewed. Required fail-safes retained; diagnostic-only P3 deferred by root. No unresolved cleanup decision remains. |
| 1 — dead code | **Completed / no-op** | No justified unused/unreachable deletion. Frozen motion input, decorative fourth display, project metadata and measurement counters have stated uses. |
| 2 — duplication | **Completed / no-op** | Authored repeated keys/pads/rack geometry already uses shared primitives/batching. HTML/canvas routes and return/contact links serve distinct required access points. No harmful divergence established. |
| 3 — naming/error handling, abstraction, boundaries | **Completed review / optional repair deferred** | Resource ledger, imperative controller, React adapter and semantic evidence each own real responsibilities. Navigation remains in U, scene callbacks/IDs in S, prose in C. No naming rewrite or generic registry justified. |
| 4 — test reinforcement | **Completed assessment / integration deferred** | Existing targeted tests ran. No runtime change requires new tests. Actual failure/lifecycle evidence and any future diagnostic regression belong to their owners. |
| Independent critique | **Completed: APPROVE WITH QUALIFICATIONS** | Separate reviewer inspected source and accepted the no-op outcome, with diagnostic-loss and touch-overlap evidence limits retained here. |

Warm amber/timber/cream materials, contact shading, authored equipment and right-side instruments are deliberate personal design choices. Repeated eyebrow/title/summary/facts communicate distinct evidence; each project's qualification section preserves truth boundaries. Equivalent navigation is required accessibility behavior. No generic emoji grid, fake media controls, harmful copy duplication or speculative layer was established. Source-based design review warrants no cosmetic rewrite; final recognizability, hierarchy, contrast and mobile layout require the actual visual evidence owned by integration.

## Writer/reviewer separation and records

| Slice | Task / dispatch / Run | Outcome |
| --- | --- | --- |
| Inventory writer | `task_14c05c77fdfa` / `ctx_ea463018d508` / root Run `run_2cf070275e3e` | Succeeded, settled; [inventory.md](cleanup-coordination/inventory.md), raw checks and fingerprints. Initial unobserved turn resolved on the same assignment; no duplicate/retry/abandonment. |
| Independent critic | `task_c545eea9eae3` / `ctx_a6cc31db2a1d` / separate child Run `run_79156e303efb` | Succeeded, settled; [critique.md](cleanup-coordination/critique.md), independent before/after fingerprints and scan evidence. |
| Cleanup coordinator | Parent task `task_45a523e2caa0` / `ctx_dbddaf729052` | Reconciled both reports, verified source identity and recorded root's explicit disposition in this report. |

Both leaves were bounded Orca performers without children. The writer did not approve its own report; the critic did not edit source, inventory or plan. The separate child Run prevented consuming root's Run mailbox. [coordination.md](cleanup-coordination/coordination.md) retains routing and outcome details. No helper failed or remains unsettled.

Changed artifacts: this report; coordinator plan/briefs/coordination/initial and final source snapshots; inventory report/checks/fingerprint helper/manifest; critique report/checks/fingerprint helper/before-and-after manifests. All are beneath this report's assigned paths. **Runtime simplifications: none.**

## Remaining integration requirements

Root/I must reconcile current evidence and complete the approved test-spec, rather than treating this review as its acceptance:

- Actual lazy-import rejection, WebGL2 construction failure and context loss, with useful fallback and ordinary HTML navigation retained.
- At least five actual development StrictMode enter/leave cycles, distinguishing real remounts from hash-only navigation; instrument canvas/listener/observer/RAF/resource ownership and late callbacks. CPU release attempts or requested context loss are not GPU release proof.
- Real scene-to-existing-heading/hash/focus/return, touch/resize/scroll/overlap usability, named desktop/mobile/320px visual criteria and homepage regression. Retain U's approved no-JS/history evidence within its scope.
- Renderer counts, compressed transfer and the specified interaction/resize timing observations with environment limits; no physical-mobile FPS or GPU claim without measurements.
- Final integrated build/checks when compatible with preview ownership, explicit disposition of baseline lint, and final provenance/claim review. Physical-device and actual screen-reader evidence remain limited to what is actually collected.

Observer/matchMedia/Canvas2D/invariant-branch gaps remain disclosed coverage limits; this review creates no new compatibility mandate. The optional diagnostic recommendation is deferred, not a remaining task for this lane. The bounded source-cleanup review is complete; the integrated portfolio quality gate is not claimed complete.
