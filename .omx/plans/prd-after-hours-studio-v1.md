# After-hours Studio v1 — execution plan

Status: Planner draft, 14 November 2026. Requires sequential Architect then Critic review and the leader's recorded Ralplan handoff before implementation. The user explicitly requested the subsequent Orca build; no additional generic permission gate is needed. This is a local preview, not public deployment or replacement of the homepage.

## Result and scope

Build `/studio`: an atmospheric, warm, interactive **Three.js** studio portfolio that feels like Owen's space and makes his engineering evidence easy to read. The user has explicitly selected Three.js. The first version must complete **studio → select dissertation → inspect substantive evidence → return**, with equivalent direct navigation and usable content without JavaScript/WebGL. Include Application Copilot and TypeForge with truthful summaries and evidence. The prototype is the next reviewable visual artifact; there is no approved raster to pixel-match.

Preserve `/`, `design/portfolio-draft`, previous design artifacts and unrelated work. No framework migration, backend AI calls, walking simulation, autoplay, invented recordings, paid generation, personal-photo publication, commit, or deployment. Keep all new runtime dependencies confined to Three.js and its matching development types.

## Grounding

- Task/context: `.omx/context/after-hours-studio-v1-20261114.md`.
- Personal direction: `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/brief.md`; the user's new build request supersedes its earlier discussion-only stage. Warmth overrides the cyan photograph; the Launchkey and drums are on the **right**.
- Research synthesis: `.omx/research/portfolio-personality-20261114/synthesis.md` and its five reports. Personal details and useful project interactions matter more than extra ornamental controls.
- Inspected root `package.json`, `app/layout.tsx`, `app/globals.css`, `tsconfig.json`: Next14.0.4/React18/TypeScript5/Tailwind3; no existing 3D layer; global smooth scrolling needs a reduced-motion override. The root layout does not impose homepage navigation on `/studio`.
- `design/portfolio-draft/index.html` supplies current evidence wording and working contact/repository destinations. Do not reuse stale project entries or nonexistent CV destinations from the old homepage.
- Dependency specialist reports `three@0.187.0` and `@types/three@0.187.0`; current lockfile TS5.9.2 satisfies the types baseline. Foundation verifies the final specialist report and lockfile before installation, pins these versions, and avoids unrelated upgrades.
- New user references: [Matthis Garnier](https://www.matthisgarnier.com/) and [Hanusek](https://www.hanusek.com/), inspected live on 14 November 2026. Completed findings and desktop/mobile screenshots: `.omx/context/references-after-hours-v1/findings.md`. Matthis's loaded 3D room combines specific physical content containers, material contrast, a persistent toolbar and direct experiment shortcuts; a 2D alternative remains available while loading and appeared at narrow width. Hanusek combines strong cream/orange typography and a dark atmospheric laptop backdrop with direct Work links. Apply object specificity, material/light richness, readable identity and parallel navigation. Their underlying library, camera-transition contract and performance were not verified; no assets or layouts are to be cloned.

## RALPLAN-DR

### Principles

1. Recognisable personal specificity: owned equipment and confirmed interests, with honest stylisation.
2. A committed warm visual composition: lighting, material, scale and typography form one identity.
3. Evidence remains readable and reachable independently of graphics or motion.
4. Small, reversible integration with clear ownership and resource cleanup.
5. No invented professional results or personal media to make the prototype seem finished.

### Top decision drivers

1. Escape the basic editorial/card-page result the user already rejected.
2. Make one complete, enjoyable spatial-to-evidence journey work reliably.
3. Deliver a local first version on the current React18/Next14 baseline with bounded asset and integration cost.

### Viable options

| Option | Advantages | Costs / limitations | Decision |
| --- | --- | --- | --- |
| Direct Three.js procedural studio + independent HTML evidence | Real depth, authored light/material relationships, selectable objects, no React adapter migration; readily inspectable local implementation | Manual lifecycle/picking/disposal; procedural modelling needs deliberate art direction to avoid generic blocks | **Select for v1**, with a fixed composition and limited interaction |
| React Three Fiber v8 on React18 + HTML | Declarative scene composition and established React integration | Another adapter/version surface for a small scene; current v9 entails React19, outside scope | Viable, but no sufficient benefit for this bounded scene to justify extra dependencies |

A rendered-only 2.5D site is no longer a candidate for the primary implementation because the user explicitly chose Three.js. A still/CSS fallback remains appropriate for unavailable graphics; it is resilience, not a replacement of the requested scene.

### ADR

Choose additive `/studio`, direct Three.js, a fixed front-left three-quarter composition and progressive HTML enhancement. Scene selection navigates to the **same** server-rendered project section as ordinary links; v1 does not duplicate evidence inside a canvas or modal. Keep small camera/selection responses optional; no orbit or exploration controls are necessary for success. Consequence: a visitor can inspect every project without discovering a hotspot, and scene failure does not remove content. Revisit the Three.js integration approach only on demonstrated quality/performance problems, not preference drift during implementation.

## Visual and content direction

Desktop composition: a designed title/navigation margin and a substantial studio vignette, not three floating cards over a generic room. Warm cream typography, dark ink/charcoal surroundings, amber task light, restrained timber and off-white equipment. Small cool screen accents may contrast but must not dominate. Use deliberate negative space, soft contact shadows, bevels/material variation and layered silhouettes. Local Manrope/Bodoni assets may be reused with their OFL records if they improve this composition; no remote font dependency is necessary.

Required recognisable scene features: multi-monitor desk silhouette (central landscape, portrait sides and elevated screen), triangular warm wall lights, microphone arm, white PC, a translucent-looking compact keyboard with cream/pastel Milkshake-inspired keycaps, and the white Launchkey49 plus electronic drum kit **to the right**. Procedural models are stylised approximations, not exact manufacturer geometry. Model keys/pads, monitor stands, drum pads/cymbals/rack and keyboard profile deliberately; a cluster of undifferentiated boxes is not visual completion. Exact controller revision and drum model remain unspecified.

Personal accents: a coffee cup and a restrained generic snowboard silhouette/graphic can acknowledge confirmed interests; headphones distinguish listening from the music-making corner. Do not invent trips, brands, favourite tracks, recipes or releases. No audio controls without actual playable, approved audio. The photograph remains a private reference, not a copied public asset. Each nonprocedural asset needs a provenance record; retain license files for copied fonts.

Project copy must preserve these boundaries:

- **Dissertation engineering:** self-hosted Qwen inference on a university GPU, custom TF-IDF retrieval and a reproducible plain-versus-RAG comparison. Explain problem, personal work, plain/RAG architecture, protocol/provenance and limitations. Twenty questions/forty primary outputs/one GPU describe scope, not quality or general superiority; fictional fixture, exploratory work, not a completed thesis. Do not manufacture paired outputs or benchmark metrics. An accurately labelled architecture comparison is sufficient for v1; actual output excerpts require source verification first.
- **Application Copilot:** in-development evidence-drafting workflow, recorded stages, durable jobs and human review. Synthetic workflow tests are not live model quality or a proven production deployment.
- **TypeForge:** local-first browser product, Python ML evaluation/versioned artifact; no claimed typing or learning improvement.
- **LNRS:** developer enablement using instructions, scripts, skills and context management; no invented ownership of a production autonomous agent service or unverified job title/dates.

## Frozen integration contract

Foundation owns `lib/studio-contract.ts`. The other lanes consume it; they request changes through the leader instead of editing it.

```ts
export const PROJECT_IDS = ['dissertation', 'copilot', 'typeforge'] as const;
export type ProjectId = typeof PROJECT_IDS[number];
export type SceneStatus = 'loading' | 'ready' | 'unavailable';
export interface StudioSceneProps {
  selectedProjectId: ProjectId | null;
  reducedMotion: boolean;
  onSelectProject: (id: ProjectId) => void;
  onStatusChange: (status: SceneStatus) => void;
}
export interface StudioProject {
  id: ProjectId;
  title: string;
  eyebrow: string;
  summary: string;
  sections: ReadonlyArray<{ heading: string; paragraphs: ReadonlyArray<string> }>;
  facts: ReadonlyArray<{ label: string; value: string }>;
  links: ReadonlyArray<{ label: string; href: string }>;
}
export function projectAnchor(id: ProjectId): string; // '#project-' + id
export function projectIdFromHash(hash: string): ProjectId | null;
```

Content exports `studioProjects: readonly StudioProject[]` and `studioProfile` from `lib/studio-content.ts`; `studioProfile` has `name`, `role`, `intro`, `personalNote`, and `links: readonly {label:string; href:string}[]`. Use `satisfies`/imports for the contract; no runtime Three imports in content or contract.

Scene exports default `StudioScene(props: StudioSceneProps)` from `components/studio/StudioScene.tsx`. It owns only rendering, scene resources, picking and status; it never edits location/history, scrolls the document or renders project prose. Mount one canvas; catch renderer/context failures, report `unavailable`, stop work and preserve fallback. Stop animation/listeners/observers and dispose owned GPU resources on unmount; guard asynchronous completion after unmount. Rebuilding the scene on every selection is not required: use refs or updates.

UI owns `StudioExperience`, lazy-loads the scene with `next/dynamic` and `ssr:false`, and catches lazy-load/render failure. It preserves a stable, useful CSS/HTML fallback while loading or unavailable. `page.tsx` server-renders the name, ordinary anchor navigation and **all project sections** through `ProjectEvidence`; these are never inside the scene lazy boundary. Section IDs are `project-dissertation`, `project-copilot`, `project-typeforge`; the scene return target is `studio`. `StudioExperience` receives the server-rendered children as a slot. Its shared selection handler updates the hash and focuses/scrolls the existing project heading; it is used by scene selection and enhanced direct links. Hash navigation, reloads and back/forward resolve the same section. With JS disabled, plain anchors still work. The return link targets `#studio`; no focus trap or duplicated modal is introduced.

Reduced motion removes camera interpolation/ambient movement and smooth scroll, including the global `html` rule while on this route. Use a scoped route lifecycle override with restoration or a narrow global media-query fix only if the leader assigns ownership explicitly. No scroll-jacking, automatic camera entrance or fake live agent activity.

## Work packages, dependencies and ownership

All performers are **Orca workers in the current workspace**, not native substitutes. They are not alone in the codebase; no resets/reverts, broad formatting, commits, deployment or edits outside owned files. Workers report evidence/blockers through Orca. Only the leader edits planning/runtime records and integrates ownership changes.

| ID / owner | Dependencies | Owned resources and deliverable | Completion evidence |
| --- | --- | --- | --- |
| F — foundation | Approved Ralplan handoff | `package.json`, `package-lock.json`, `lib/studio-contract.ts`; pin Three/types, install root dependencies, freeze contract. Add noninteractive ESLint config only if absent and required; report baseline errors without broad repairs | Exact installed versions, contract typecheck, baseline lint/build outcome and clearly classified existing failures |
| C — content | Approved handoff; contract specified above (does not require F's file to exist yet) | `lib/studio-content.ts`, `design/studio-v1/content-evidence.md`; substantive three-project content and profile with source/claim traceability. No private raw logs/photo publication | Every numeric/professional claim traced; working supplied destinations; no dummy/CV links or invented outputs |
| S — scene | F | `components/studio/StudioScene.tsx`, `components/studio/scene/**`; procedural warm scene, picking, resource/failure handling. Scene-only assets under `public/studio/scene/**` and their provenance record | Typecheck of integrated contract; recognizable layout, selection events, cleanup and graceful renderer failure; scene screenshots when host exists |
| U — interface | F and C | `app/studio/page.tsx`, `app/studio/studio.module.css`, `components/studio/StudioExperience.tsx`, `components/studio/ProjectEvidence.tsx`, optional `public/studio/fonts/**` with licenses; SSR evidence, responsive shell, direct links, hash/focus journey, fallback | Keyboard/no-JS content path; no evidence hidden behind WebGL; contract-compatible scene import. Do not claim integrated build until S lands |
| I — integration and browser verification | S and U | Leader or bounded Orca integrator owns `design/studio-v1/verification.md`, `design/studio-v1/asset-provenance.md`, browser test artifacts/scripts under `design/studio-v1/`; coordinates any fixes back to S/U/F owners | Full test-spec results, desktop/mobile/fallback/reduced-motion screenshots, production build, performance observations and scoped regression evidence |
| R — independent final review | I and fixes | Native role-specific reviewers inspect the changed implementation and evidence read-only; leader reconciles | No unresolved blocking correctness/accessibility/visual-identity issues; explicit residual limitations |

Dependency graph:

```text
Sequential planning reviews → authorized handoff
                              ├── F ──┬── S ─────────┐
                              └── C ──┴── U ─────────┤
                                                     I → fixes → R → local v1 report
```

Start F and C together. After F, S can start even if C is finishing; U starts after F+C. S and U may develop concurrently against the frozen interface. Temporary unresolved imports while both write are expected; only integration runs the authoritative final build. Never have two workers edit package files or the same renderer/UI source. Browser/preview control has one owner at a time.

## Acceptance and risks

Acceptance is defined in `test-spec-after-hours-studio-v1.md`: actual scene and content at `/studio`, visual personal fidelity, complete accessible journey, failure resilience, cleanup and bounded runtime cost. Visual review is a human-readable assessment against named features, not an invented pixel score. If v1 still looks like a generic primitive desk, revise material/composition/detail before declaring success.

Main risks: procedural model quality (review early integrated render before polish); costly shadows/transparency (one shadow-casting light, limited geometry, DPR cap, render on demand); lifecycle leaks (Strict Mode/remount checks); evidence overclaiming (content traceability); shared-workspace races (frozen contract and disjoint ownership); old framework baseline (local only, no broad upgrades, report existing issues); absent actual mobile hardware (label emulation as emulation).

## Handoff and stop condition

Leader must obtain sequential Architect and Critic approvals, configured gate results and durable Ralplan completion/handoff before code work. Use Ultragoal for leader-owned durable tracking and the user's requested **Orca implementation workers**; do not substitute OMX Team or native implementation workers. Execute ready tasks and follow Orca wake-up/report lifecycle rather than polling workers.

Completion means a local URL and verified v1 whose visual composition and end-to-end journey satisfy the test spec, with screenshots, changed-file summary and honest limitations. Do not equate worker success, build success or an attractive screenshot alone with completion. Public adoption/deployment and richer original audio/media remain later work.
