# Portfolio refinement plan

Review status is recorded in `portfolio-refinement-consensus-receipt.json`; this document is planning-only. Date: 2026-11-14. Execution and publication are not authorized by this document.

## Outcome and success

Present Owen as a software and applied AI engineer who can build useful products, evaluate their behavior, and explain delivery decisions. The portfolio should support the user's target roles at Sierra, OpenAI and Bending Spoons through inspectable work and a memorable, restrained visual identity.

A successful first release has a clear introduction, two strong verified case studies, working contact/CV/project destinations, consistent mobile/desktop presentation, and no unsupported claims. Aim for three complementary flagship studies over time; a third project is not a prerequisite for releasing the improved site. Stop this planning run after durable plan/test artifacts and sequential review evidence. A later execution request is required to start implementation.

Evidence inputs: `.omx/context/portfolio-refinement-20261114T153100Z.md`, `.omx/context/portfolio-target-roles-20261114.md`, `.omx/context/portfolio-refinement-research-20261114.md`. Local source was inspected; rendered appearance, live links, builds and external project tests were not verified in this run.

## RALPLAN-DR

Principles:
1. Show the work: every capability claim leads to an artifact, decision or observed result.
2. Make depth optional: a recruiter can scan quickly; an engineer can inspect details.
3. Preserve scientific and delivery honesty: distinguish experiments, prototypes, deployment and adoption.
4. Let the work supply the identity: product images, evaluation graphics and clear writing carry the visual design.
5. Ship a bounded improvement before adding a new project or elaborate interaction.

Decision drivers: relevance to the four target roles; strength and readiness of available evidence; memorable presentation with low maintenance and good accessibility/performance.

| Option | Advantages | Costs and tradeoffs | Decision |
|---|---|---|---|
| A. Incremental polish of the existing page | Fastest; small diff; can repair routes and add images without reorganizing everything | Existing equal cards and text-first order provide weak hierarchy; needs deeper case studies anyway | Viable minimum if time is under 3 focused days |
| B. Editorial portfolio with selected case studies | Makes engineering judgment and outcomes prominent; uses existing stack; supports both quick scan and technical depth | Requires accurate copy, artifact preparation and a reusable case-study layout | **Recommended** |
| C. Interactive engineering lab | Can demonstrate curiosity and memorable interaction directly | More UI work, validation and maintenance; may distract from delivery evidence or require unnecessary runtime services | Viable later experiment once B passes; not a first-release dependency |

ADR-001: choose B, retain A as the reduced-scope release, and defer C's interaction layer. Keep one shared professional identity and tailor outbound case-study links for different roles. Do not create four versions of the homepage. Preserve the existing Next.js/TypeScript/Tailwind stack and both themes. Consequence: time goes first into proof and editorial design; more advanced project development is separately scoped.

## What changes this plan is responding to

- `app/page.tsx`: About and Skills precede projects. Move selected work immediately after the introduction.
- `components/ProjectsTeaser.tsx`: three text-only cards all point to missing `/projects`. Give each selected project its own detail destination and direct evidence links.
- `components/Hero.tsx`: the CV destination has no asset in `public`. Supply the current approved CV, or omit the download CTA until it exists.
- `lib/site.config.ts`: older role description and TypeForge stack conflict with more recent public project/profile documentation. Refresh from verified evidence; do not copy the old React/Node description into the new TypeForge case study.
- `app/layout.tsx`: generic metadata misses the richer identity and work. Use accurate title, description, canonical domain and social preview after the domain is verified.
- `app/globals.css`, `tailwind.config.ts`: default blue/gray styling lacks a project-specific visual language. Introduce a small token set and purposeful composition.
- `components/Skills.tsx`, `Navbar.tsx`, `ThemeToggle.tsx`, `lib/utils.ts`: keyboard stops, fixed-header navigation, motion preferences and theme behavior need scoped checks. Suspected runtime issues remain inspection items until reproduced.

The repository homepage points to `owencdev.info`; local config uses `owencheung.dev`. Neither live deployment was inspected successfully. Resolve the canonical target before changing URLs or publishing metadata.

## Role-to-evidence strategy

These mappings are planning judgments informed by the linked job descriptions, not employer endorsements or predicted hiring outcomes.

| Target and capability | Current evidence | Gap | Portfolio artifact |
|---|---|---|---|
| [Sierra Agent SWE](https://jobs.ashbyhq.com/Sierra/b7d1dbcd-ca72-472f-b15e-5b4b0f886be0): production agents and customer delivery; evaluation/RAG/tooling strengths | Application Copilot documents retrieval, durable execution and evidence review; TypeForge provides a product and evaluated model | No freshly verified customer deployment, live workflow or agent quality benchmark here | Copilot case study with a labelled synthetic scenario, state/recovery trace, evaluation table and explicit readiness limits |
| [OpenAI Applied AI, Startups/Codex](https://openai.com/careers/applied-ai-engineer-startups-(codex)-london-uk/): practical developer enablement, live teaching, reusable tools and startup empathy | Existing projects offer concrete engineering material and implementation decisions | Coding alone does not demonstrate a workshop, developer adoption or customer troubleshooting | A 5-8 minute recorded technical walkthrough and a reproducible 20-minute workshop exercise based on existing work; include real feedback only if collected |
| [OpenAI FDE London](https://openai.com/careers/forward-deployed-engineer-london-london-uk/): end-to-end full-stack LLM delivery with customer teams | Personal products plus publicly described employer AI work | Stated 5+ years and customer delivery cannot be supplied by a portfolio; adoption/production outcomes remain unverified | A delivery narrative: brief, constraints, alternatives, rollout/recovery and measured result; distinguish real work from a simulated brief |
| [Bending Spoons Data scientist](https://jobs.bendingspoons.com/positions/6970fa4e77f0037204dd2d6b): trustworthy data pipelines, metrics and business decisions | TypeForge's dataset/holdouts/baselines support scientific rigor | Current website contains no data-quality workflow or decision-oriented analysis | TypeForge evaluation appendix first; add a bounded independent data decision study only if existing publishable work does not fill this gap |

Sierra's content was recovered from the indexed official posting; the direct page is a JavaScript shell. The Bending Spoons posting considers early-career applicants, while the FDE listing has an explicit experience requirement. Recheck job details before applications; eligibility, travel/location and work history are separate from site design.

## Projects: feature, add, or defer

| Priority | Work | Action and evidence needed | Release treatment |
|---|---|---|---|
| P0 | **TypeForge** | Lead with a real product screen, a clear assessment-to-practice story and engineering decisions. Explain native browser/IndexedDB architecture and Python-to-browser model export. Show the documented benchmark with baseline, held-out slice and limitations; verify the exact public demo revision before recording it. | First flagship. Existing work to present well, not a new build. |
| P0 | **Application Copilot** | Add to the portfolio. Explain retrieval, cited evidence, durable workers and human review through one coherent synthetic applicant scenario. Show what currently works in the Node/Python paths separately; include failure/recovery behavior only when reproduced. | Second flagship if the selected scenario can be reproduced and honestly recorded. Otherwise label a prototype with source/architecture evidence; do not advertise a working live demo. |
| P1 | **Data decision study** | First inspect permitted existing analysis and the TypeForge pipeline. If they provide ingestion/validation, statistical comparison and a decision report, publish that evidence without a new application. | Target third flagship; never fill a slot with an unsupported project. |
| P1 | **Developer workflow walkthrough** | Explain a bounded task from requirement to implementation, evaluation and recovery; include the reusable exercise, setup, expected results and a short recording. A Codex-assisted workflow is appropriate if its exact commands and results are reproduced. | A compact “Engineering notes” item supporting the Codex role; not a fourth large app. |
| P2 | NLP study notebook | A concise supporting study of source mapping, local persistence, export and user-controlled progress; use original/publicly reusable teaching material. | Secondary project or short engineering note. Do not describe it as a trained NLP model or AI tutor. |
| P2 | Knowtrients / Sortify / FitMimic | Reassess only after source, individual contribution and a working scenario are available. FitMimic is a third-party inference integration prototype; readiness is presently lower. | Archive/secondary collection when supportable. No default equal billing with the flagships. |

Do not promote empty repositories, employer-internal implementations or unverified metrics. The user's public profile may support a concise employer experience summary after title/dates/disclosure are confirmed; it does not authorize copying internal code or imply that personal projects were deployed there.

### Conditional new project: Fraud Decision Lab

Only start this separate project if the P1 evidence review finds a genuine data-science gap and the user later selects the investment. Scope: one legally reusable public dataset (or clearly labelled synthetic dataset), deterministic ingestion and SQL transforms, data-quality checks, a leakage-aware split appropriate to the dataset, one simple baseline and one candidate, threshold/error analysis, and a short decision report with explicit cost assumptions. Provide a small view of the results rather than a general platform. Include uncertainty, failures and limitations; synthetic results establish workflow behavior, not real fraud/business gains.

Acceptance: another developer reproduces the report; schema/missingness/duplicate checks run; split rationale and baseline are explicit; the recommendation follows the measured tradeoff; dataset provenance and usage terms are documented. Estimated 5-8 focused days after dataset selection, excluding research or access delays. Cut the UI first if time grows; do not add accounts, live transactions, autonomous agents or multiple datasets. Work belongs in a separately authorized project workspace, with read-only evidence imported into Portfolio after completion.

## Content and case-study contract

Suggested positioning to refine against confirmed biography: **“Software & applied AI engineer”** with **“I build useful AI products, evaluate how they behave, and make the engineering easy to inspect.”** Keep current role, university and availability in a compact factual line. Avoid a long list of tools in the headline.

Each flagship study has:

1. A one-sentence user problem and a clear artifact/demo/source entry point.
2. Scope, dates, status, individual role and collaborators; distinguish a prototype, tested local implementation and public deployment.
3. A concise system diagram and 2-3 important decisions with rejected alternatives.
4. Actual product images or a user-controlled short recording with meaningful captions.
5. Evaluation: baseline, dataset/task, sample/split, metric, result, uncertainty where relevant, and what the result does not establish.
6. One failure or constraint and the mitigation/recovery behavior.
7. Outcomes supported by evidence, followed by remaining limitations and next work.
8. Reproduction instructions and dated evidence links. State unavailable evidence plainly.

Keep the main case-study narrative to roughly 600-900 words; move detailed reports/logs into linked technical artifacts. TypeForge timing prediction error must not become a claim of faster typing. Copilot fixture tests must not become live-provider quality, automatic submission or hiring-success claims. No synthetic customer quote or usage count.

## Visual direction

Proposal from source inspection, pending rendered review: a crisp editorial engineering portfolio with large product imagery and annotated evidence. Use one asymmetrical flagship composition, varied section density and thin rules to replace the repeated centered section/card rhythm.

```text
Name                         Work / Experience / Notes / Contact   Theme
Software & applied AI engineer        Compact current-role facts
One clear sentence                    Small product/evidence preview
View selected work    CV
---------------------------------------------------------------------
01 TypeForge       Large real product image + compact result/decision
02 Application Copilot      Scenario image / state trace + contribution
03 Data study (only when ready)       Decision chart + dataset context
---------------------------------------------------------------------
Experience / how I work     Scope, ownership, concrete lessons
Engineering notes          Walkthrough / workshop / short analysis
About                      Short personal detail, keyboard connection
Contact                    Email / CV / GitHub / LinkedIn
```

- Palette: proposed off-white `#F7F7F2`, ink `#141820`, slate secondary text and cobalt `#0064D8` for links and selected states. Dark mode uses charcoal with readable neutral text. Treat these as token proposals; measure every actual text/control pairing before acceptance.
- Typography: strong sans-serif display and readable body; monospace only for short labels, numbers or diagram annotations. Start with system stacks; add a licensed local font only if its value survives visual/performance comparison.
- Layout: 1100-1200px content width, comfortable 60-75 character prose, approximately 16-18px body, 36-64px responsive display headings, generous spacing around images but compact supporting metadata. At narrow widths, preserve story order and readable labels.
- Project treatments: TypeForge gets a real assessment screen, a labelled benchmark graphic and three clear entry points: product, source and evaluation. Copilot gets a synthetic scenario sequence from source to retrieval to reviewed draft, with a legible state/evidence diagram. Replace the prominent skill cloud with concise capability-to-project links. Avoid fabricated screenshots, stock “AI” art, pseudo-terminal decoration and numeric counters without evidence.
- Motion: restrained focus/hover feedback and short optional transitions, with content visible immediately. User-controlled media, reserved image dimensions and reduced-motion alternatives.
- Optional signature: a user-triggered recording or a fixed synthetic “follow one request” step-through in the Copilot study. Choose at most one after core acceptance; cap the experiment at one focused day. Drop it if it harms keyboard access, loading, readability or maintenance. The website must not require live model calls.

Create a later `DESIGN.md` through the design workflow before UI implementation, recording tokens, compositions, responsive behavior and approved reference captures. Preserve personal detail through real interests and project choices rather than adding a large decorative system.

## Delivery sequence and ownership

Estimates are focused working days, not commitments; assume existing project artifacts can be accessed and copied appropriately. No deadline was supplied. Typical first release: roughly 6-10 days with overlapping independent preparation; new project work is additional.

| Stage | Deliverable and affected resources | Dependency / owner | Acceptance / cut line |
|---|---|---|---|
| 1. Evidence and content baseline, 0.5-1 day | Project readiness table; verified biography/CV/contact/canonical domain; inspect live baseline when possible; asset/claim ledger in planning docs | Lead + writer/explore; starts first | Every proposed public claim has a source or is omitted. Confirm two usable studies; uncertain project remains clearly scoped. |
| 2. Content and visual specification, 1-2 days | Two case-study drafts; homepage hierarchy; later `DESIGN.md`; desktop/mobile compositions using real assets | Writer and designer can work in parallel after stage1, with distinct files | TypeForge/Copilot stories understandable without opening code; 3 lightweight reviewer scan tasks pass or documented fixes are made. |
| 3. Portfolio implementation, 2-3 days | Update `lib/site.config.ts`, Hero, ProjectsTeaser, page order, Navbar/Footer/Skills; add `app/projects/[slug]/page.tsx` and meaningful `/projects` index; reusable study presentation and assets under `public/projects` | Executor; depends on content contract/tokens; lead assigns file ownership | All selected project routes resolve; one content source drives cards/detail fields; no CMS/MDX/backend needed. Missing demo/CV controls are omitted rather than dead. |
| 4. Presentation and technical finish, 1-2 days | `app/globals.css`, `tailwind.config.ts`, metadata in `app/layout.tsx`; theme/nav corrections only where verified; approved CV/social preview; sitemap/robots aligned to canonical site | Executor/designer with shared-file edits serialized | Both themes and narrow viewports coherent; functional, accessibility and performance criteria below pass. No library additions by default. |
| 5. Independent verification and release package, 1-2 days | Test-spec evidence, screenshots, link/claim audit, build output, residual gaps and deployment-ready diff | Test-engineer/verifier after integration; lead owns final decisions | Site acceptance passes. Publishing is a separate explicit action; no waiting on a new project or optional interaction. |
| 6. Evidence expansion, optional | Workshop artifact; third data study; customer/user feedback where obtainable; one optional interaction | Separate goals after first release; distinct project ownership | Promote only verified evidence; track development vs publication scope separately. |

Implementation shape: use the existing configuration as the starting content source, with typed project summaries and one shared detail layout. Keep long case-study narratives in a server-consumed local module outside `Navbar` and other client imports of `siteConfig`; split lightweight shared navigation/project summaries when needed. This is a content boundary, not a new abstraction platform or runtime CMS. Keep primary content server-rendered and interactive components small. Preserve project repository boundaries: a portfolio task does not authorize modifying Application Copilot or TypeForge.

## Acceptance, risks and handoff

Detailed verification: `.omx/plans/test-spec-portfolio-refinement.md`.

First-release acceptance: two evidence-complete case studies; all presented internal links/assets and primary external destinations checked; no stale unsupported biography/project claims; clear route from hero to work/contact/CV; desktop/mobile and both themes reviewed; keyboard/reduced-motion checks pass; existing lint/typecheck/build pass; production performance measured with stated conditions and no unexplained regression. No full WCAG or field-CWV certification is implied.

Main risks and mitigations:
- Project completeness trails the story: publish narrower factual scope and recordings; defer unsupported feature/impact claims.
- Role targeting becomes too broad: keep one applied-AI/software identity and let case studies demonstrate distinct evidence; a data study addresses the specific science gap.
- Visual polish obscures work or expands scope: real images, static-first layout, one optional interaction after release criteria.
- Current deployment/source mismatch: record actual deployed revision/domain before comparing screenshots or changing canonical URLs.
- Existing package baseline fails or needs security maintenance: record baseline failures; route material upgrades as a separate dependency decision, not a hidden redesign requirement.
- Content or demo permissions are unclear: use original/synthetic examples and omit unavailable material. Employer summaries remain scoped to publishable facts.

After sequential Architect and Critic approval, leader persists the matching review evidence and a planning-only terminal state. No execution handoff is authorized by the present request. On a later explicit execution request, default to `$ultragoal` for durable stage tracking where runtime support exists; on this outside-tmux surface, use ordinary native bounded execution unless the user chooses a supported OMX CLI session. Do not pretend `omx team` is running here.

Future staffing: lead integrates and owns acceptance; designer reasons deeply about hierarchy/accessibility and supplies composition/tokens; writer grounds content and claims; executor implements scoped files at medium effort; test-engineer/verifier independently checks claims and behavior at high effort for ambiguous failures. Native parallel work is sufficient for this small site. If durable Team coordination becomes worthwhile in an attached tmux OMX shell, inspect `omx team --help`, then launch two bounded implementation lanes under the approved plan; Team reports evidence, and Ultragoal retains goal ownership. Never assign shared layout/config files to concurrent writers.
