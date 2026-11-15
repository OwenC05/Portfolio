# Portfolio refinement context

Date: 2026-11-14. Workflow: standalone `$ralplan`, normal short mode; planning-only user request. Session routing identifier: 01a1daa7-0ca8-77a0-9bcc-da11ad109c99. Native installed role routing is available. These identifiers are workflow routing, not security authority.

## Task and outcome

User: "$ralplan plan how we are going to refine and make our portfolio stand out even more, including projects we need to add or visual aspects we should change".
User clarification: primary audience is **software engineering / AI roles**.
Later user steering: example target roles are Sierra Software Engineer, Agent; OpenAI Applied AI Engineer, Startups (Codex), London; OpenAI Forward Deployed Engineer, London; Bending Spoons Data scientist (exact position 6970fa4e77f0037204dd2d6b). These supersede generic audience assumptions. See role evidence file below.
Deliverable: a prioritized, distinctive, practical portfolio improvement plan with recommended project selection/additions, visual direction, case-study requirements, phased ownership/dependencies and measurable validation. Stop after reviewed planning artifacts; no website implementation or deployment is authorized by this planning request.

## Verified repository facts

Workspace C:\Users\Owenc\orca\Portfolio, origin https://github.com/OwenC05/Portfolio. Local HEAD e42b010d61736511e4257249dacb2954658ebe9f matches remote main inspected through GitHub connector. No tracked modifications at intake; `.omx/` untracked. No node_modules, running local preview, test script, or browser screenshots.

- Next.js 14.0.4, React18, Tailwind3, TypeScript. Keep existing stack; no dependency additions requested.
- `app/page.tsx:13`: Hero -> About -> Skills -> Projects -> Contact. About/skills precede proof.
- `lib/site.config.ts:9`: older Bath CS&AI / fraud-data-science / full-stack headline; three projects at line31: TypeForge, Knowtrients, Sortify; title/description/tags only.
- `components/ProjectsTeaser.tsx:17`: equal text-only cards; all detail links at line37 target `/projects`, absent from app routes.
- `components/Hero.tsx:33`: CV URL `/cv/Owen_Cheung_CV.pdf`; file absent. public has only favicon.ico.
- `app/layout.tsx:4`: generic title/description; richer site config metadata unused.
- `app/globals.css:19` / `tailwind.config.ts:10`: default blue/gray design, repeated rounded cards, default font/theme, class dark mode.
- `components/Skills.tsx:17`: static skill tags are keyboard-focusable.
- Fixed nav, smooth scrolling with no reduced-motion rule/scroll target margin; two independent ThemeToggle instances need runtime inspection. Do not label suspected theme issues as reproduced defects.
- GitHub and LinkedIn links exist in Footer. Local site config URL is owencheung.dev; GitHub repository homepage is owencdev.info. Canonical deployed site needs reconciliation.

## Fresh connected-source evidence (documentation claims, not independently rerun tests)

1. https://github.com/OwenC05/OwenC05/blob/main/README.md : current public profile describes AI engineering at LNRS and final-year Bath CS&AI; interests include recoverable orchestration, state, audit trails and human review in fraud-model optimisation. Employer work is internal; personal repos are separate. Verify dates/title with user before publishing updated biography; never imply personal projects are employer systems.
2. https://github.com/OwenC05/TypeForge/blob/main/README.md : local-first native browser typing product, versioned model artifact, Python benchmark and browser inference, baseline versus candidate, tests and explicit release limitations. Published benchmark claims 61.30ms Ridge versus 67.55ms baseline participant-macro timing MAE on a defined held-out slice; this is NOT demonstrated typing improvement. README supplies public demo https://typeforge-alpha.vercel.app but documents its earlier deployment revision separately from newer local work. No fresh live demo verification in this planning run.
3. https://github.com/OwenC05/applications/blob/main/README.md : Application Copilot, local-first application workspace, Python/FastAPI workbench, hybrid retrieval/reranking/citation inspection, durable workers, selected-data cloud drafting and evidence review. README distinguishes Node MVP from Python preview and says full workflow/recovery qualification and semantic quality qualification remain open. Tests use synthetic injected provider responses; no live model run established by the README. Strong second-case-study candidate with honest scope and a synthetic-data recording; not a fully qualified autonomous application product.
4. https://github.com/OwenC05/NLP/blob/main/README.md : study notebook with 38 lessons, source mapping, notes/export, manual self-assessment, storage safeguards. No in-app AI chat or automatic grading. Candidate compact software case study, not an NLP model project. Lecture content/assets require rights review before reusing; original/synthetic material is safer for a public demo.
5. https://github.com/OwenC05/fashion-tryon/blob/main/README.md : FitMimic third-party FASHN API prototype, async jobs; no original trained model/no working no-key demo. Public deployment hardening and personal-image controls remain open. Optional experiment, not top AI flagship by default.
6. GitHub repo list also has empty-size Digit-Identifier and RL repos; existence is not completed project evidence. Bayes README is only a title. Knowtrients/Sortify were not found in returned owner repo list; this does not prove they do not exist. Their readiness/ownership/results remain unverified.

## Constraints and unknowns

- Only `.omx/context`, `.omx/plans`, `.omx/specs`, and required `.omx/state` planning records may change during this run.
- No new dependencies, paid generation, public publishing, Git changes or execution goals.
- AgentMemory task-specific retrieval returned matched_count=0, excluded_by_budget=0; no portfolio decisions found. Historical memory registry had no portfolio hit. Use current artifacts and user answer, not fabricated history.
- Browser review unavailable so far: selected `orca` executable fails CommandNotFoundException; no fallback Orca executable used. Web retrieval of both domain candidates failed; no live-site defect claims. Local source findings are reliable for this checkout, rendering remains unverified.
- Do not prescribe a broad rebuild from a generic aesthetic. Distinguish factual defects, reasoned design proposals, and optional new project investment.
- Target role known; employer title/dates, CV/contact freshness, supported public assets, strongest third project and hiring availability require verification during later content work. These are bounded assumptions, not reasons to block this plan.

## Planning direction to evaluate

Evidence-led software/applied AI portfolio, ~3 selected projects. TypeForge flagship; Application Copilot second conditional on a clear synthetic demo and scoped evidence; choose strongest verified third rather than automatically inventing more projects. Consider a bounded independent public/synthetic-data fraud-model evaluation pipeline only if current projects leave a genuine data/backend/evaluation gap; no need to copy employer code or build multiple greenfield projects.
Visual proposal: restrained editorial engineering style, strong typographic hierarchy, real product screens and annotated evaluation graphics, asymmetric featured project, off-white/ink/slate with one controlled cobalt/cyan accent, occasional monospace labels, semantic accent colors, both themes preserved. Consider one optional lazy/user-triggered typing-related interaction; preserve instant access to evidence, keyboard and reduced-motion alternatives. Compare this fairly against incremental polish and a more expressive interactive lab direction.
Suggested information order: concise identity + what Owen builds + project/CV CTAs -> selected work -> concise experience/engineering approach -> about/personality -> contact. Detail routes provide progressive technical depth.

## Evidence wrapper

See `.omx/context/portfolio-refinement-research-20261114.md` for primary guidance, validation criteria and boundaries. Current quality-gate config via `omx quality-gates list --stage ralplan --json`: gates=[] (no custom gates).
Exact-role evidence: `.omx/context/portfolio-target-roles-20261114.md`. Researcher confirms Sierra focus is production agents/customer delivery/evals/RAG; OpenAI Codex startup role requires public technical communication and reusable developer tooling; FDE includes 5+ years customer-facing delivery and up to 50% travel; Bending Spoons is a distinct data pipeline/correctness/business-metrics lane and considers early-career applicants. Portfolio work can demonstrate capabilities but cannot substitute for required experience or invent customer adoption.
