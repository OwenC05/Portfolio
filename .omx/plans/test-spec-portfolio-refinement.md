# Portfolio refinement verification specification

Date: 2026-11-14. Companion: `prd-portfolio-refinement.md`. These are future execution checks; no runtime, visual, build or project tests have been claimed as passed in this planning run.

## 1. Evidence and content

For every displayed project maintain a small evidence record: source revision/date, actual scope, owner/contribution, demo or recording revision, screenshot origin, evaluation source and limitations. A reviewer follows each numeric claim to its source and checks that the prose describes the same metric and population.

Pass conditions:
- At least two complete flagship studies at initial release, with problem, role, decisions, image/demo, result/evaluation, limitation and source/reproduction entry points.
- TypeForge benchmark values retain baseline, metric, held-out context and prediction-versus-improvement distinction. Public demo and newer implementation are labelled accurately.
- Application Copilot distinguishes Node/Python surfaces, prototype/local verification/deployment status, synthetic fixture tests and live-provider evidence. No claimed autonomous submission, hiring benefit or qualified production reliability without fresh evidence.
- Employer role/dates and CV/contact are verified with the owner; no employer-internal artifacts appear as personal project evidence.
- Third-project absence does not block first release. An unverified project is omitted or explicitly presented with a narrower supported scope.
- Original or properly reusable assets; synthetic examples are visibly labelled. No lecture screenshots or personal applicant data copied without appropriate rights/scope.
- Homepage, footer, CV and metadata agree on identity; canonical URL is verified against actual hosting before publication.

## 2. Routes, assets and interaction

Inspect production-served `/`, `/projects`, and every selected `/projects/<slug>` directly, after refresh and through internal navigation. Test a nonexistent slug for a meaningful 404. On each page check all internal anchors, project/source/demo links, CV asset, email URI, GitHub and LinkedIn. Record external failures separately from application defects; remove or repair broken primary destinations before release.

Pass conditions: no presented internal link or local asset returns 404; CV downloads/opens the intended current PDF when present; meaningful link names; no placeholder `#` project links; all content remains available without optional media/interaction. Case-study navigation to home sections works from nested routes. Fixed navigation does not cover headings/focus. Opening and closing mobile navigation retains a sensible keyboard path.

Theme scenarios: fresh browser with light and dark OS settings, explicit toggle/reload, narrow-to-wide resize, storage unavailable, and back/forward navigation. Reproduce before changing implementation. Verify icon/accessible label matches the active theme and both toggle locations stay coherent. Capture first-paint flashing only if observed.

## 3. Visual, accessibility and comprehension

Capture homepage and both flagship studies at 390x844, 768x1024 and 1440x900 in both themes; include a 320px reflow inspection and 200% text resize. Record browser/version and revision. Compare against the later `DESIGN.md` compositions; review actual image cropping, typography, whitespace and narrative hierarchy, not pixel identity to a generated reference.

Pass conditions:
- No unintended horizontal page overflow, clipped text, overlapping controls or unreadable diagram labels at required sizes.
- Core text contrast >=4.5:1, large text >=3:1; visible component/focus states checked. Principal controls target 44px; evaluate WCAG 24px target minimum and exceptions where applicable.
- Keyboard reaches useful controls in visual/story order; static skill labels do not add irrelevant stops; skip link reaches main; visible focus is not hidden by fixed header; menu and media controls are labelled.
- OS reduced-motion disables decorative movement/smooth scroll where introduced; no mandatory animation or auto-playing media needed to understand the project. Long moving content has appropriate controls.
- Images have purposeful text alternatives; complex graphs have nearby textual result/context; one coherent page heading hierarchy and landmarks.
- Three representative reviewers, when available, can identify the role focus and find a flagship within 15 seconds; after a 60-second scan they can name Owen's contribution and locate evidence/contact. This is a lightweight usability target, not proof of recruiter conversion. If reviewers are unavailable, record a provisional self-review and the missing external check.

Perform a screen-reader smoke check of header/main, menu, project links and case-study heading/image summaries using an available platform. Record gaps rather than claiming complete WCAG conformance. Relevant sources: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [interaction motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

## 4. Code and production checks

During later implementation install only locked existing dependencies through `npm.cmd ci` under normal sandbox/approval controls; record Node/npm versions. Then run:

```powershell
npm.cmd run lint
.\node_modules\.bin\tsc.cmd --noEmit
npm.cmd run build
git diff --check
```

Serve the successful production build via `npm.cmd run start -- --port <free-port>` using the normal hidden/managed tool surface, and run route, interaction and visual checks against that build. Do not claim development-server behavior proves production output. Stop only the helper created for these checks.

There is currently no test script. Do not invent `npm test` success or add a new test dependency by default. Use the available browser tooling for focused behavior checks; add automated regression coverage for meaningful navigation/theme defects if existing tooling can support it. Simple content/style changes need review and browser evidence rather than implementation-mirroring unit tests. If a command cannot run, record exact blocker and affected claims.

## 5. Performance

Compare the existing and changed production homepage under the same mobile lab/browser profile, with three runs each and median LCP/CLS/TBT plus asset sizes. Measure new case-study routes, including the heavier flagship, against the absolute targets below; they have no prior route baseline. Only make before/after comparisons for comparable existing routes. Record CPU/network settings, cache state and environment. Reserve media dimensions, deliver appropriately sized images, defer noncritical media and keep optional interaction out of the initial critical path.

Project targets for the controlled lab profile: LCP <=2.5s, CLS <=0.1 and TBT <=200ms; these are acceptance targets/proxies, not field-CWV certification. For comparable existing routes with a meaningful baseline, investigate >10% LCP or TBT regression even if targets pass; document deliberate accepted tradeoffs. Use only the absolute targets for new case-study routes until a baseline exists. A local environment that cannot model these conditions supplies diagnostic evidence only, and production measurement remains an explicit gap.

Exercise navigation, menu/theme changes and any signature interaction while recording responsiveness. Field goals, when representative traffic exists: p75 LCP <=2.5s, INP <=200ms and CLS <=0.1, separated by mobile/desktop. Lighthouse page-load checks cannot establish INP; report field data unavailable when applicable. [Google Web Vitals](https://web.dev/articles/vitals).

## 6. Optional artifact checks

- Workshop: a developer follows the clean-start exercise and reaches the documented result; recording has captions/transcript; materials list prerequisites, expected outputs, failures and limitations. Clearly distinguish a recorded tutorial from an actual delivered workshop/adoption claim.
- Data decision study: provenance/license, deterministic run, quality tests, leakage-aware split rationale, baseline/candidate comparison, error/cost assumptions and a report that follows measured results. Synthetic data is labelled and does not establish real business uplift.
- Signature interaction: keyboard and touch operable, static fallback, reduced-motion behavior, no live model key/service requirement, and no blocking of case-study content. If these fail within the one-day experiment budget, omit the interaction from release.

## Completion record

Verifier supplies a compact matrix of criterion -> command/manual scenario -> evidence path -> pass/fail/gap, including screenshots and source revisions. Lead resolves material findings and records accepted limitations. First release is ready when required content, destinations, build and core browser checks pass; optional project/interaction work remains explicitly outside its completion. Deployment is a later separately authorized action. Planning completion means sequential reviews and durable artifacts, not that these future checks have already passed.
