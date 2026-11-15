# Portfolio assistant preview

Implemented on 15 November 2026 in the isolated `feature/portfolio-assistant` branch. The preview searches published portfolio sources, displays exact excerpts and citations, and visualizes the retrieval events returned by the API. Generation is disabled at Owen's request; no live assistant inference requests were made.

## Included

- `/ask`: desktop/mobile question interface, actual retrieval map, passage disclosure, source links, cancellation and recoverable errors.
- `/work`: seven published records covering LexisNexis, the assistant, dissertation preparation, Copilot, TypeForge, reinforcement learning and Owen's background.
- `/writing`: a publishing structure with an honest empty state. The repository contains blank editorial templates, not invented personal posts.
- An optional server-side generation adapter, fixed source policy, bounded requests, citation validation, offline evaluation and a separate proposed adaptation experiment.

The sources distinguish owner accounts from artifacts and limit claims to the supplied evidence. The dissertation entry describes preparatory work; the reinforcement-learning entry awaits a publishable coursework write-up. Detailed customer case studies and personal reading notes still require Owen's material.

## Verification

| Check | Evidence |
| --- | --- |
| Assistant and catalog tests | 34 passed, including event validation and retrieval-quality regressions |
| Retrieval regression fixtures | 17/17 passed; all required passages found for 12 supported-topic questions |
| Studio CPU regressions after dependency update | 153 passed |
| Application typecheck and configured lint | Passed |
| Production build | Passed; `/ask` first-load JavaScript reported as 113 kB |
| Actual local browser checks | 15 passed on the combined repair, including malformed-event recovery, 320px/390px fit, reduced motion, real source-only events and controlled failure/cancellation cases |
| Source routes | Seven published pages and their anchors resolve; draft template routes return 404 |
| Independent visual review | Actual Claude Opus review approved the mobile repair; its small label-clipping follow-up was repaired and checked at 320px, 390px and 1440px |

Retained evidence is in [design/assistant](../design/assistant): browser results, actual retrieval events, viewport screenshots, source-route checks and separate Claude visual review/rereview reports. The original 14-check report and label repair evidence remain intact. [The combined repair browser report](../design/assistant/validation-20261115-v2/browser-checks.json) records 15 passing checks against build `y-B3AVJ4r6mRb4PDZAs-6`, including a valid-JSON event with missing hits and subsequent successful recovery. Its viewport captures and real source trace are in the same directory. Full application typecheck, configured lint and production build passed on the combined implementation. Browser transport fixtures test interface behavior, not model quality. See [evaluation](assistant-evaluation.md) for the unrun human and model checks.

The local browser runner requires Orca on PATH (or `ORCA_BIN`), the production server on `127.0.0.1:4193`, and a newly opened `/ask` tab at 1440×1100. Run `node scripts/verify-assistant-browser.mjs <page-id> <new-evidence-directory>` to preserve earlier captures. It changes only that tab; the evidence directory defaults to `design/assistant` when omitted.

## Independent follow-up

Two Codex workers completed a functional boundary audit and a separately frozen source-navigation challenge. The audit found no blocker for the current source-only preview, but identified an unchecked client event shape that can crash rendering. Seven targeted existing backend tests passed. The challenge found all required passages on 11/19 scored questions (14/22 evidence groups); ordinary paraphrases and missing limitation passages are concrete gaps. These results qualify the earlier 17/17 developer-visible fixtures rather than replacing or inflating them.

See [functional audit](assistant-functional-audit.md) and [retrieval challenge](assistant-retrieval-challenge.md). The original challenge files remain immutable. They become development/regression evidence when used to improve retrieval. Archived TypeScript snapshots are narrowly excluded from application typechecking; the live application remains checked. The integration typecheck passed after adding that exclusion. No live generation evaluation has occurred.

Both follow-ups are now integrated. The client rejects malformed event shapes before rendering, with nine parser tests and a passing browser recovery case. Shared lexical normalization and bounded limitation-context selection improve challenge coverage to 17/19 questions and 20/22 groups, preserving all previous passes and all 17 original fixtures. The two remaining misses concern numeric-output wording and an unsupported espresso preference. More context is selected (40 versus 27 passages), and broader vocabulary can create noisy hits; there is no general accuracy or precision claim. See [stream repair](assistant-stream-repair.md) and [retrieval repair](assistant-retrieval-repair.md).

## Deployment and remaining work

The branch preview is https://portfolio-git-feature-portfolio-assistant-owenc05s-projects.vercel.app/ask. The initial deployment `dpl_BkDGXAGU9AM15ncfqZbKyAZZmxrL` was verified READY for commit `f08605b8d5ae1dd234bba286ebcd2f543c1e8693`; subsequent deployments follow feature-branch pushes. Hosted verification uses deployment status for the pushed commit; browser interaction checks run locally.

The code defaults generation to disabled when the variable is absent, as on this initial build. The branch-specific preview variable `ASSISTANT_GENERATION_ENABLED=false` is also now recorded for subsequent deployments. No production promotion or payment setup belongs to this checkpoint.

Generation, model adaptation and semantic answer evaluation remain deferred. Before enabling inference, establish an approved model/budget, evaluate real outputs and injection behavior, review claim support, and verify abuse controls appropriate to a public endpoint. The current in-memory throttle is not a distributed quota or spending cap. No screen-reader audit or full WCAG conformance claim is made.

The Next.js/React update resolves the old framework baseline and configured lint dependency failure; it also requires three nullable Studio ref annotations and the stable typed-routes setting. The Studio content and scene remain under their separate branch and acceptance process.

## Final interface direction

Owen clarified that `/ask` is the functional test surface, not the final product presentation. The eventual assistant should be an interactive floating robot, similar to the reference Owen uploaded earlier. Design that experience collaboratively with Owen after the functionality is ready; recover the reference at that stage rather than inventing its appearance. No robot design is approved by this preview.

Use Orca orchestration to delegate independent tasks in parallel. Actual Claude handles design; Codex handles engineering, evaluation and other work. Preserve the source-only choice until Owen changes it. A later character interface should use the same source policy, API and actual retrieval events rather than implying generated reasoning or unsupported knowledge.
