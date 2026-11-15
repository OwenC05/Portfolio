# Studio v1 interface report

Interface lane U, 14 November 2026. Parent task `task_26384c2e4f5a`, dispatch `ctx_73cee9d71b51`; child run `run_53939232ffb2`.

**Complete for interface scope. Independent review APPROVE; no blocking interface findings remain. Browser ownership is released to root.** Production build and integrated scene acceptance remain root/integration work, as scoped below.

## Result and ownership

Implemented `/studio` as independent server-rendered identity, navigation and substantive project evidence, enhanced with the real lazily loaded scene. The scene remains a substantial warm visual subject; all projects and contact destinations are normal HTML links. Root homepage source and existing global styles were preserved except for the specifically assigned reduced-motion media query.

Owned implementation files:

- `app/studio/page.tsx`: profile, route metadata, header Work/contact navigation, three project links, all evidence and contact footer.
- `components/studio/ProjectEvidence.tsx`: each exact project section and focusable heading, supplied summary/facts/paragraphs/links, plain return anchor.
- `components/studio/StudioExperience.tsx`: SSR slots outside scene boundary, `next/dynamic` with `ssr:false`, stable fallback, scene error boundary, hash/focus navigation and reduced-motion subscription.
- `app/studio/studio.module.css`: scoped warm studio composition, responsive layout, focus and target styling, readable cream evidence sections.
- `app/globals.css`: only `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`, applying before hydration and with JavaScript disabled.
- `design/studio-v1/interface-asset-provenance.md` and this report; evidence and child coordination records under `design/studio-v1/interface-coordination/`.

No package, contract, source content or scene changes; no scene stub, added dependency, server, commit or deployment. System fonts only; no font binaries or third-party image/audio assets shipped by this lane.

## Delegation and integration

| Child slice | Task | Dispatch | Result |
| --- | --- | --- | --- |
| Server identity and evidence | `task_0070b4c6488b` | `ctx_581cbe7fd6e0` | Succeeded; isolated SSR checks cover 3 projects, 9 facts, 16 paragraphs and unique/labelled headings. |
| Client interaction and styling | `task_bf0ceac63e9b` | `ctx_7b8f33a7405f` | Succeeded; real imports typecheck, available Next lint and CSS/source contrast checks passed. |
| Header Work followup | `task_d2837027fc06` | `ctx_a33ad72a6be3` | Succeeded; SSR anchor order/content and formatting passed. |
| Mobile composition followup | `task_0af9bd518b68` | `ctx_9043c34622ef` | Succeeded; exclusive browser checks at 390 and 320 with screenshots and documented focus-order caveat. |
| Independent interface review | `task_4b40fcb6897f` | `ctx_170e1d36c593` | Review succeeded; found one P2 history-focus issue, subsequently fixed and independently retested. |
| Independent history-focus retest | `task_2f64bee30040` | `ctx_16c817463f30` | Succeeded; APPROVE, 24 targeted assertions and eight explicit-fragment states passed. |

Server and client children worked on disjoint files under the internal contract in `interface-coordination/shared.md`. Parent applied the assigned global fix and integrated the fallback and history-focus corrections after children settled. The independent reviewer performed a separate read-only browser/source pass and retest. All six child assignments settled successfully; the initial review correctly requested a fix rather than approval. Its delivery initially showed a draft despite runtime input acceptance; one supported dispatch reminder resolved that discrepancy without replacement, direct terminal input or duplicated workers.

## Responsive correction and evidence

Root first-render feedback showed the scene starting near y794 on 390px mobile. The corrected CSS puts compact identity and visible Work/contact access before the room, and the longer introduction/project rows afterward. The scene starts at y203.625 on 390x844 and y197.047 on 320x844. The 352px scene frame retains the entire room, including right-side controller and drum kit. Both widths have no document overflow; all visible links measured at least 44x44 CSS pixels. These are emulated browser observations, not physical-device results.

Parent visually inspected:

- `interface-coordination/corrected-mobile-first-390.png`
- `interface-coordination/corrected-mobile-first-320.png`
- `interface-coordination/corrected-desktop-1440.png`

Additional child evidence: `corrected-mobile-scene-390.png`, `corrected-mobile-scene-320.png`, and `corrected-mobile-nojs-320.png` in the same folder. Desktop retains the two-column composition and substantial scene. The earlier no-JS screenshot precedes the fallback-link integration adjustment described below.

Child browser checks confirmed header Work focuses `main#work`, return focuses `section#studio`, visible keyboard outlines and ordinary page scrolling. Fresh navigation console capture contained only the React DevTools informational message: no page error, warning or removed `PCFSoftShadowMap` warning.

## Parent adjustment

Mobile CSS visual ordering leaves the scene after the introduction in DOM order. The loaded scene has no tab stops, so keyboard moves directly from the header to project links below the scene. The earlier no-JS fallback had a redundant Work link that appeared above those projects but followed them in source order; Tab therefore jumped backward visually. Parent replaced that redundant link with noninteractive guidance, retaining the existing header Work link, skip link and all project anchors. No positive tabindex, hidden evidence or duplicated content was introduced. Independent review verified this final fallback state and coherent keyboard sequence.

Independent review also reproduced a P2: Back from a project to the original bare `/studio` URL restored native landing scroll but retained focus on the evidence heading. Parent added a transition-only empty-hash branch that focuses `#studio` with `preventScroll: true`, updates selection, and preserves native scroll restoration. Fresh no-fragment loads do not take focus. Independent retest at 1440, 390 and 320 confirmed Back followed by Tab reaches the landing identity link, and Forward/reload/repeated destinations remain correct.

## Validation collected

- Parent `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false`: exit 0 with actual scene imports, repeated after the fallback adjustment.
- Parent `.\node_modules\.bin\prettier.cmd --check components/studio/StudioExperience.tsx app/studio/studio.module.css`: exit 0 after adjustment.
- Parent `git diff --check`: exit 0.
- Server child isolated React SSR harness verifies all supplied profile/project evidence, plain links, exact anchors, focusable headings, semantic label references and metadata. Full reproducible command is in `interface-coordination/server-report.md`.
- Client isolated installed `next/core-web-vitals` lint: zero errors/warnings. Static CSS parse/class coverage passed; source colour pairs ranged from 6.03:1 to 9.55:1. These are source calculations, not all computed browser contrast measurements.
- Parent final isolated installed `next/core-web-vitals` lint across all three owned TSX files: exit 0, zero errors/warnings; repository configuration unchanged.
- Normal configured lint is blocked by the documented pre-existing missing `@typescript-eslint/eslint-plugin`; this lane did not change package/configuration ownership.

## Independent review disposition

Detailed evidence and commands/observations: `interface-coordination/critique-report.md`, final section **Independent P2 retest — APPROVE**. The original failure evidence remains for provenance; the final section supersedes it.

- Fresh no-JS browser content comparison: 53 checks, zero failures, retaining all three projects, nine facts and sixteen substantive paragraphs; zero canvases, no hidden evidence or overflow.
- No-JS Work/return/project anchors and corrected fallback keyboard order passed.
- Actual Ctrl/middle clicks preserved native new-tab behavior and original history; identical destinations added no history entries.
- Explicit-fragment hash focus, Back/Forward/reload, reduced motion before hydration and preference toggling passed. Actual computed root scroll behavior is auto with reduced motion, including no JS.
- Final history fix: 24 targeted assertions across 1440x900, 390x844 and 320x844 passed; eight explicit-fragment states passed. Fresh bare-route loads had zero programmatic focus or scroll calls.
- Sampled computed text contrast: 6.03:1 to 13.05:1; focus contrast about 5.98:1 on paper and 12.38:1 on dark. This is sampled evidence, not a full contrast audit.
- Reviewer visually inspected the final layout, no-JS and focus captures. No blocking interface finding remains. An optional 320px bottom focus-outline clearance refinement is nonblocking; top/side outline and link text remain visible.

Current fallback image: `interface-coordination/critique-nojs-320.png`. Final history pass images: `critique-pass-back-focus-1440.png`, `critique-pass-back-focus-390.png`, `critique-pass-back-focus-320.png` in the same folder. Original failure screenshots are retained and clearly named in the reviewer report.

## Remaining integration boundaries

No production build ran in this lane because root owns the active development server at `http://127.0.0.1:4180` and prohibited concurrent `.next` builds. Final integrated build, full failure injection, scene touch-target/cleanup/performance tests and homepage regression remain root/integration responsibilities. Scene touch-region correction is independently owned by S. No integrated-build, physical-mobile, pixel-match or full-scene acceptance claim is made here.

Browser is explicitly released to root: one context, one page at `http://127.0.0.1:4180/studio`, 390x844, actual scene ready; temporary contexts and review instrumentation are removed. No further interface work is pending. Lazy import/renderer/context-loss resilience was source-reviewed here rather than failure-injected; final integrated I owns those tests, scene selection/touch boundaries, lifecycle/performance and the production build. Actual screen-reader and physical-device testing remain unperformed.
