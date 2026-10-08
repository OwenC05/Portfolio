# Design

## Source of truth

**Status: Active — Alpine design implemented in Next.js; verified and deployed to the existing Vercel production project.** Updated 2026-10-08. The user authorized critique, refinement, implementation and Vercel deployment. The approved OpenDesign Alpine prototype remains the visual reference; the application is now the maintained product surface.

The latest user direction is authoritative: **the About/Work design and layout are approved; now make their styling match the Alpine hero so the portfolio reads as one.** Preserve the ruled About sections, three Work rows, distinct case-study destinations and content. Use the Alpine homepage's cool palette, Hanken Grotesk/Inter typography, chrome and visual scale throughout. This supersedes the prior cream/sage/serif interior styling, not the approved composition. Keep exactly Applied AI, ML and TypeForge; no blog, additional projects, game, full 3D or unrelated application rewrite. Deployment is authorized in the current integration pass.

Evidence reviewed:
- `.omx/artifacts/about-work-refinement/generated/index.html` is the Alpine visual master; `refined/editorial.css` and final QA screenshots show the approved interior layouts to preserve. Fresh OpenDesign source is saved before changes under `.omx/artifacts/alpine-unification/before/`.
- Live `https://owencdev.info/about` and `/projects`, inspected 2026-10-08 in Chromium at desktop/mobile widths. Actual captures, DOM text and computed style facts are in `.omx/artifacts/about-work-refinement/references/`; these—not local app parity—are the visual reference for this pass.
- `lib/content.ts:41–140`, `lib/projects.ts:47–104`, `lib/publicPortfolio.ts:43–86,211–244`: curated About facts and distinct Applied AI/ML boundaries.
- `.omx/artifacts/opendesign-round2/generated/round-2/alpine-fragment.html` and its 1440/390 screenshots: approved directional inspiration, not an exact implementation reference.
- `.omx/artifacts/opendesign-round2/review.md`: Alpine's calm palette/terrain is useful; narrow-screen imagery arrives too late in the prototype.
- `app/page.tsx:23–83`, `app/globals.css:208–370`: existing bitmap, SVG piste, HTML identity and three skill links.
- `lib/publicPortfolio.ts:211–244`: authoritative capability names, labels and evidence.
- `components/portfolio/SiteChrome.tsx:5–45`, `app/layout.tsx:56–70`: active conventional site chrome; no active Run/game scene.
- `lib/offPisteHero.test.ts:10–44`, `scripts/verify-browser.mjs:190–195`: existing SSR, anchor and browser checks; JS-driven motion needs additional coverage.
- Installed Next.js server/client guide at `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.

Supporting plan: `.omx/plans/alpine-reactive-hero.md`. Focused OpenDesign handoff: `.omx/artifacts/alpine-reactive/opendesign-brief.md`. Prototype result, source-sync evidence and verification limits: `.omx/artifacts/alpine-reactive/review.md`. The previous contract is preserved at `.omx/artifacts/alpine-reactive/design-before.md`. Prototype evidence does not establish production integration or user approval.

About/Work follow-on: `.omx/artifacts/about-work-refinement/opendesign-brief.md` and `review.md`; live references, before/after source, screenshots and independent QA are preserved alongside them. The Alpine hero, root styles and motion script were verified byte-identical after the interior-page refinement.

Current unification result: `.omx/artifacts/alpine-unification/review.md`, exact brief, before/after files and fresh QA. All active pages share the Alpine tokens/fonts/chrome; whole homepage remains byte-identical. Layout/content preservation, computed styles, loaded fonts, 35 renders, navigation and sampled contrast were independently checked.

## Brand

**Alpine / applied intelligence.** Calm, exploratory, technically precise and human. The mountain is an atmospheric setting, not the interface's main task. A single piste connects three areas of real expertise.

Use Alpine's pale snow, navy text, restrained clay accents, sans-serif typography and negative space throughout. Interior pages retain the deployed-inspired editorial structure and thin rules, not its former warm cream/olive/sage/serif theme. Avoid the previous huge red identity, ski-resort language, a game HUD, dashboard widgets, fake metrics, neon and floating badges. Terrain stays distinctive to the homepage, not repeated behind every section. Work illustrations remain restrained conceptual schematics with explicit captions, never purported internal diagrams or measured charts.

## Product goals

- A visitor immediately understands Owen's AI-engineering focus and can reach work/contact.
- Terrain visibly spans the full opening section rather than appearing as a framed image or a separate mobile strip.
- The piste gives the three capability groups a memorable, legible relationship; each leads to actual evidence.
- Reaction adds a quiet sense of depth without making text or controls difficult to read/use.
- Reading, navigation and public facts remain usable without JavaScript, motion, the terrain image or a custom font.

Non-goals for this pass: reworking the approved page structures, skiing simulation, drag-to-navigate site, terrain editor, WebGL/game revival, custom cursor, sensor permission, scroll interception, new dependencies or unrelated functionality. Vercel publication is part of the current integration pass.

Success is one coherent Alpine visual identity across the active application, retaining the approved layouts and requested project selection, not an award claim or an arbitrary visual score.

## Personas and jobs

- **Hiring manager:** identify role, contribution and contact quickly, often on a phone.
- **Technical reviewer:** follow a capability or project link to ownership, approach and honest evidence.
- **Motion-sensitive/keyboard visitor:** read the same content and operate all links without background motion or pointer-only disclosure.
- **Agent consumer:** curated JSON/Markdown/read-only interfaces expose the same approved three-project set.

## Information architecture

Application navigation: home `/`, Work `/projects`, About `/about`, Contact `/contact`; cases `/projects/lexisnexis-applied-ai`, `/projects/lexisnexis-ml`, `/projects/typeforge`. `/agents`, JSON, Markdown and MCP remain available. Removed case HTML/Markdown URLs return 404 and are absent from sitemap/discovery. Prototype/baseline/round comparison links never ship.

Current Work selection is exactly three entries, in order: **LexisNexis — Applied AI**, **LexisNexis — ML**, **TypeForge**. Update homepage project links, Work counts/metadata and active case-study cross-links together. Remove Knowtrients, Sortify and Dish'D from the showcased project set; historical comparison/baseline artifacts remain archived. Dish'D employment in About is distinct from a showcased case and can remain.

About: brief editorial introduction → numbered Experience, Education, Toolkit and Off-screen sections → contact. Replace skill-chip clouds and a separate terrain image with readable grouped text. No blog, research-notes page, empty project slots or coming-soon cards.

Case studies: Applied AI owns orchestration, recoverable workflows and human review; ML owns placement-based financial-data analysis, fraud-model optimisation and representation-learning research. Provide separate working destinations using only existing public facts; detailed future content belongs to the user and must not be fabricated.

Opening sequence: small site identity/navigation → concise professional introduction → work/contact actions → three capability waypoints within the terrain → clear transition into selected work. A short flagship contribution/status line at the lower edge is optional only if it does not compete with the skill route; it must not become another dark project rail.

Skill links remain ordinary anchors:
- `#research`: **ML Research** — PyTorch; Multimodal contrastive learning **(study)**.
- `#ai-systems`: **AI Systems** — Python; Agent orchestration; Human review.
- `#data-modelling`: **Data & Modelling** — SQL; GPU compute; Batch training.

The destinations and evidence remain present below the hero. Do not replace real links with modal-only or hover-only content. This pass does not delete unrelated below-fold evidence.

## Design principles

1. **Background first:** a continuous landscape, not a mountain card beside the introduction.
2. **One foreground hierarchy:** quiet identity, concise intro, two useful actions. No giant identity plus competing slogans.
3. **Three stops, one piste:** no extra decorative routes or framework-tag cloud.
4. **Movement is optional:** enhance an already complete static composition.
5. **Registered layers:** terrain, piste and map markers share one coordinate mapping and move together. Foreground text stays fixed.
6. **Small-screen redesign, not shrinkage:** keep the background full-bleed but let skill labels flow when map placement would overlap.
7. **Reuse public facts and existing assets:** avoid inventing a new content or styling framework.

## Visual language

### Color

The prototype's exact shared visual master is the homepage: paper `oklch(97.5% 0.004 235)`, ink `oklch(24% 0.02 248)`, muted `oklch(45% 0.02 245)`, rules `oklch(86% 0.012 235)`, clay `oklch(58% 0.078 47)` and clay-deep `oklch(50% 0.08 44)`. Interior layouts remain flat, ruled and spacious. Replace cream/olive/sage surfaces and the dark-green contact band with cold pale surfaces/navy text; use clay sparingly for eyebrows and diagram accents, not paragraphs.

Use the existing snow/mist/navy family as the starting palette (`app/globals.css` owns tokens). Prototype a restrained clay/red piste accent, limited to the path, selected marker and focus states. Accent values must be verified against their actual backgrounds before implementation; decorative stroke color need not become body-text color.

The terrain remains visible across the full hero, including behind the copy area at lower contrast. A soft pale legibility wash is allowed; the current opaque 46.5%-wide mask is not the intended composition. This is functional contrast protection, not decorative gradient styling. Avoid a visibly boxed text panel.

### Typography

Prototype-wide display/heading font: **Hanken Grotesk**; body/navigation: **Inter**, matching the actual Alpine homepage with the same system fallbacks. Remove serif/italic and visible monospace styling from active interiors. Heading weight 500; h1 follows `clamp(2.15rem,1.35rem + 3.6vw,3.9rem)` and 1.05 line-height; h2 is approximately 1.6–2.4rem. Metadata uses modest tracked Inter. Keep body text readable and naturally wrapped. Production font loading remains a later integration decision; no package is added by this prototype pass.

### Spacing, shape and elevation

One edge-to-edge hero with text in the existing bounded shell. Desktop copy uses roughly the left 35–42%; visible terrain/route concentrate toward the right without ending at a hard column boundary. Use generous but purposeful spacing, no heavy shadows or new card grid.

All active pages share the homepage's 82rem maximum container and `clamp(1.25rem,5vw,4.5rem)` gutters. Match its title-case `Owen Cheung — AI Engineer` wordmark, muted role, relative (not sticky) header, nav typography, thin border and 1.25rem vertical header padding. Retain 44px nav height and current-page semantics. Exact master parity currently includes its 43.8125px-wide Work link and approximately 26.42px-high wordmark hitbox; do not claim every header target is 44×44. A later shared integration improvement should address the whole header consistently, not only interiors. Preserve About's 2:3 ruled grid and Work's three 3:2 text/figure rows with mobile stacking. Keep existing footer/contact compositions while matching the pale palette and shared typography.

Size the opening near one viewport on spacious desktop screens, but use content-driven minimum height rather than a fixed clipping `100vh`. The section may grow at zoom, in landscape orientation or on small screens. Navigation shares the pale visual field; literal artwork behind the shared header is an optional prototype detail, not authority to restructure all routes.

### Motion

**Authorized prototype scope:** fine-pointer terrain drift of approximately 4–8px per axis, paired with waypoint hover/focus emphasis. This is a lightweight 2D/2.5D image/SVG treatment, not claimed 3D geometry.

- Move the terrain/piste/marker scene together; never independently pan the route over the bitmap.
- Keep identity, introduction, navigation and CTA text stationary.
- On skill hover/focus, cancel queued writes and freeze the currently rendered shared scene offset (including any in-progress transition). Hold it while a skill retains focus or the pointer remains within the skill-navigation safe region; resume/reset only after disengagement. Never jump an engaged target back to neutral. Reduced-motion changes take precedence and immediately cancel/reset spatial motion.
- Pointer exit resets to neutral only when no skill interaction is held. No idle animation, auto-travelling skier, particles or continuous idle render loop.
- Disable spatial motion for reduced motion, coarse pointers and no-JavaScript sessions. CSS reduced-motion rules alone are insufficient for JS transforms: the controller must also stop/cancel pending work and reset state.
- Normal page scrolling remains native. No scroll-linked camera or device-tilt control in this first pass.

### Imagery and iconography

Reuse `public/art/off-piste-terrain.webp` (184,778 bytes) as the initial full-bleed asset. Its ability to cover desktop/mobile crops must be judged in the focused prototype; do not invent a depth map or claim a flat bitmap is a true 3D model.

Use a single thin SVG piste with three restrained markers. Native HTML supplies labels and anchor targets. Provide a subtle conceptual-terrain caption. Foreground labels need stable contrast at every permitted camera offset; a small quiet backing is preferable to unreadable text over detail. No image-based text or essential meaning hidden in decoration.

## Components

Existing sources remain authoritative:
- `publicPortfolio.capabilities` for skill names/labels/evidence; profile for identity/contact.
- `app/page.tsx` for homepage orchestration and evidence destinations.
- `SiteChrome`/`NavLinks` for conventional navigation.
- `app/globals.css` for shared tokens/interiors; `components/portfolio/alpine-hero.css` for scoped homepage styling.

Implemented bounded components:
- `components/portfolio/AlpineHero.tsx`: server-rendered identity, scene artwork, HTML skill navigation and fallback reading order.
- `components/portfolio/HeroReactivity.tsx`: a small client enhancement around server-rendered scene children; scoped pointer/visibility/media handling, CSS custom properties and cleanup. No animation dependency or global app provider.
- `components/portfolio/alpineMotion.ts`: bounded pointer/focus/media/visibility lifecycle controller; deterministic regression tests in `lib/alpineMotion.test.ts`. Terrain, SVG and HTML share one scene transform. No generic scene engine.

Accessibility boundary: only artwork/SVG decoration is `aria-hidden`. Never put the semantic skill navigation inside an `aria-hidden` ancestor. Keep the active legacy `Run*`, steering, store and postprocessing code disconnected.

## Accessibility

Target WCAG 2.2 AA where applicable, without claiming conformance before verification. Retain one h1, semantic landmarks, the site skip link, descriptive links, visible focus and primary 44px targets.

Essential capability names and evidence access are visible by default. Hover/focus may strengthen an already visible marker/line, not reveal otherwise inaccessible qualifications. Focused controls remain stationary. Ensure copy and focus contrast against worst-case terrain/camera positions, not just the neutral screenshot.

Reduced motion must stop JS spatial updates as well as CSS motion. No drag requirement, touch interception, flashing, autoplay or sensor permissions. Blocked-image/font/no-JS cases keep a complete readable page.

## Responsive behavior

- **Desktop, initially ≥1100px:** continuous full hero artwork; copy protected on the left, three separated waypoints around the right-hand piste. Header and intro remain visually quiet. Max motion stays within the checked overscan/contrast envelope.
- **Intermediate widths:** reduce separation/scale before labels collide. Switch to a readable flow legend as soon as necessary; do not preserve map labels at the cost of overlap.
- **Mobile/coarse pointer:** terrain remains the full opening background, not a 240/310px standalone artwork block. Copy precedes a short readable skill-link group over a calm lower area. Use a portrait crop/route composition where needed, but retain the three semantic destinations. No pointer/tilt motion.
- **Reduced motion/no JS:** neutral static terrain/piste plus all visible skill links; fall back to a flow layout if coordinate enhancement is unavailable.

Verify 320/390/768/1100/1440/1536, a short landscape viewport, and native 200% zoom where available. No horizontal overflow, clipped labels, hidden focus ring or excessive empty first screen. Work/contact must be immediately discoverable. At 390×844 and default zoom, all three capability links should be reachable by `scrollY <= 844px`; allow natural content growth at zoom and in short landscape viewports.

## Interaction states

- **Initial/loading:** server-rendered copy/links and pale background appear without waiting for image or client code. Reserve a stable hero scene area.
- **Idle:** static neutral composition, no ongoing frame loop.
- **Fine-pointer move:** gently bounded shared scene offset; no rerender of the entire homepage per event.
- **Waypoint hover/focus:** freeze the currently rendered shared offset and cancel queued spatial writes; keep it held while pointer/focus engages the skill navigation. The target remains stable, with visible marker/segment emphasis and unchanged destination.
- **Pointer exit:** reset only after skill engagement ends. **Offscreen/hidden tab:** no scheduled animation work; do not recenter an engaged visible target. **Reduced-motion change:** cancel/reset takes precedence over any held pose.
- **Reduced-motion preference changes:** cancel spatial updates and reset immediately; the inverse change does not start autoplay.
- **Coarse pointer/no JS:** complete static experience with native scrolling and links.
- **Image/font failure:** pale fallback and readable ordinary text; no broken-layout dependency.
- **Error/404/other routes:** retain existing recovery and navigation; the new enhancement is homepage-only.

## Content voice

Use concise, human and specific copy. Preserve Owen Cheung's actual AI-engineering role and final-year CS/AI study at Bath. Contributions precede tool lists. The terrain does not turn the portfolio into a ski brand or a design studio persona.

Keep the funded LexisNexis internal pilot/toward-production qualification; intended organisation-wide architecture is not deployed scale. TypeForge remains in development with implemented adaptive drills and analytics developing; the public demo does not establish measured learning uplift. Preserve the multimodal **study** qualifier and separate financial-data/GPU/batch-compute claims. No fabricated adoption, awards, testimonials or public employer screenshots. No raw CV, private phone/referee data, internal topology/code or deferred foundation-model/day-zero narrative.

## Implementation constraints

Use the existing Next.js/React/TypeScript stack and installed framework docs. Server-first content plus one isolated interaction enhancement; no new package, global state provider, canvas/WebGL import. Deployment targets the existing Vercel portfolio project. Existing Three.js dependencies are not a reason to use them.

Current SSR/no-canvas/content/anchor tests remain meaningful. Update tests tied to the old huge two-span name or obsolete presentation intentionally; do not weaken evidence/privacy/no-JS invariants to make a redesign pass. Add motion-specific browser assertions: `document.getAnimations()` alone does not detect JS-driven transforms.

Carry forward provisional production ceilings of ≤200KiB cold initial first-party JS and ≤750KiB initial first-party transfer; remeasure in production after integration, and record the incremental hero cost. Do not treat prior Off-Piste measurements or round-two static prototype tests as evidence for the new reactive implementation.

## Open questions

- [x] **About/Work reference:** live deployed pages inspected and captured. User requested similar editorial composition rather than another unrelated theme.
- [x] **Work selection:** Applied AI, ML, TypeForge only. No blog. Preserve employment history separately from project selection.
- [x] **About/Work layout review:** user approved the design and layout; preserve the editorial structure and three-project navigation.
- [x] **Alpine-wide verification:** active pages share the homepage system; fresh computed-style, responsive, navigation, no-JS and contrast checks passed. Designer review found no blocker.
- [x] **Implementation authorization:** the user requested critique, refinement, build-out and Vercel deployment. The approved Alpine direction and editorial structures are implemented; deployment evidence is tracked separately.
- [ ] **Detailed ML case narrative:** use a short public-fact foundation now; user will provide deeper case-study detail later. No invented results or unapproved internal material. Owner: content/user.
- [x] **Prototype scope:** user authorized the proposed focused prototype with subtle cursor response and interactive skill links. The later build-out request authorizes application integration, but not a draggable 3D mountain.
- [x] **Exact composition:** full-bleed crop, route registration, density and stationary text protection passed production-browser and independent designer review.
- [x] **Piste emphasis:** restrained clay carried through from the approved visual reference; no unrelated theme generation.
- [ ] **Native 200% zoom:** retain the prior environment limitation until a native-browser check is available; CSS zoom alone is supplemental. Owner: verification lead.

## Production refinement and verification — 2026-10-08

Critique resolved: shortened the hero introduction; unified Alpine typography, pale surfaces, nav and footer; enlarged standalone targets to at least 44px; removed prototype navigation; replaced the ML chart-like artwork with a visibly conceptual feature/representation/evaluation process; suppressed the duplicate contact pitch on Contact.

The detailed implementation plan is `.omx/plans/alpine-production.md`. Local evidence is `.omx/artifacts/alpine-production/`: 118 tests, build/typecheck, publication/privacy crawl 606 assertions, official MCP interoperability, 40 browser renders/59 checks, 60 solid-background contrast samples and independent visual PASS. Tests also cover no-JS, blocked art, touch, reduced motion and focus/pointer holds. Transfer observations are local, unthrottled lab measurements—not field Web Vitals or a Lighthouse score. CSS 200% zoom is supplemental, not a native browser-zoom conformance claim.

Keep the shared palette tokens above as the source of truth. Header/footer controls are ordinary links. Footer is pale and shared; only its large pitch is hidden on Contact with a presentational selector. No runtime content depends on that selector.

Production deployment: [owencdev.info](https://owencdev.info), Vercel `dpl_CQe3BUwbwgt39ofaA45UYS279otV`, READY on 2026-10-08. Live checks verified all pages, canonical URLs, exactly three projects, six removed-route 404s, assets and official MCP client interoperability. The later source/security maintenance pass publishes this implementation on the existing `new-layout` branch. Detailed evidence: `.omx/artifacts/alpine-production/deployment.json` and `live-smoke.json`.

## Source and tooling maintenance

The Alpine interface is unchanged by the security follow-up. Vitest 4.1.11 and a narrowly patched, licensed Next ESLint plugin remove all known development-tool audit findings without discarding Next rules. Root-directory compatibility and filesystem failure behavior are regression tested. See README and `vendor/next-eslint-plugin/README.md` for versions, provenance and maintenance/removal conditions. All `.omx/` paths referenced here are local evidence only, deliberately excluded from public source and deployments.
