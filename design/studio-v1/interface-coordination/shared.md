# Interface child contract

Parent run: `run_53939232ffb2`; parent task `task_26384c2e4f5a`, parent dispatch `ctx_73cee9d71b51`. Parent reports through actual terminal `term_63176d1f-b59f-4bfa-9cb9-4eb03f0f5df0`. Root retains preview/browser ownership. No child launches browsers/servers or further workers.

Read `.omx/specs/studio-v1/common.md`, approved PRD/test spec, `lib/studio-contract.ts` and `lib/studio-content.ts`. Use existing dependencies, truthful copy, real anchors, no content duplication, no scene stub or scene edits. You are not alone: do not overwrite another lane's files. Send conflicts/recommended handoffs upward. Leaf tasks explicitly do not recursively delegate.

## Fixed server/client structure

Client module exports default `StudioExperience({ introduction, children }: { introduction: ReactNode; children: ReactNode })`.

Client renders a root `div.studioPage` with delegated anchor enhancement, then `section#studio.studioLanding` with `tabIndex={-1}` and `aria-labelledby="studio-title"`. Inside the landing section: `{introduction}` followed by `.sceneFrame` containing the lazy actual scene, error boundary, stable fallback and honest caption. After landing: `{children}` (all evidence and footer). No aria-hidden ancestor covers either slot.

Server `page.tsx` passes a fragment as introduction: `header.topbar` (studio identity + contact navigation) and `div.introduction` (role eyebrow, h1#studio-title name, short supplied intro, obvious nav.projectNavigation links to the three exact section anchors, supplied personal note). Server children: skip-target `main#work.evidence` (tabIndex -1), introductory work heading, ALL ProjectEvidence sections, then contact footer. Client may render a visible-on-focus skip link to #work.

`ProjectEvidence` default export takes `{ project: StudioProject; index: number }`. Each project is `section#project-{id}.project` labelled by `h2#project-{id}-heading.projectTitle` with tabIndex -1, then supplied summary, facts dl, every supplied section/paragraph, all supplied links and a plain `href="#studio"` return link. Use original content without altering evidence or claims.

Server-owned class names (client worker defines them in module CSS): `topbar`, `wordmark`, `contactNavigation`, `introduction`, `eyebrow`, `name`, `intro`, `projectNavigation`, `projectLink`, `projectNumber`, `projectLinkLabel`, `personalNote`, `evidence`, `workIntroduction`, `sectionLabel`, `workTitle`, `project`, `projectHeader`, `projectIndex`, `projectEyebrow`, `projectTitle`, `projectSummary`, `projectBody`, `projectFacts`, `projectFact`, `projectSections`, `projectSection`, `projectLinks`, `returnLink`, `footer`, `footerTitle`, `footerLinks`. Worker may style element descendants for smaller details. No new CSS class names in server files without coordinating.

Client selection resolves project ID with frozen helpers; both enhanced direct anchors and scene callback focus matching existing h2 and scroll it into view. Plain no-JS anchors remain intact. Preserve ctrl/meta/shift/alt/middle click, downloads and non-self targets. Hash is source of truth, no duplicated identical history entry, hashchange/popstate/reload work. Return #studio restores landing focus; #work skip target works. Reduced motion defaults conservative until media query is read, tracks changes, no scroll smooth when reduced. Lazy `next/dynamic` ssr:false and render failures never remove SSR evidence.

Visual: warm charcoal/cream/amber, strong expressive readable name, substantial right scene area on desktop; distinct work rows, no equal card grid. Mobile 390/320 composition keeps scene height adequate for instruments on right; no clipped controls/overflow. Visible focus and intended 44px targets, ordinary page scroll. Use system font stacks (no external assets required) unless parent specifically adds fonts later. No fake player/loading percent/activity/debug UI.

Ownership: server child owns ONLY app/studio/page.tsx + components/studio/ProjectEvidence.tsx + its server report under this coordination folder. Client child owns ONLY components/studio/StudioExperience.tsx + app/studio/studio.module.css + its client report under this folder. Parent owns ONLY global reduced-motion fix, parent interface reports and integration edits after children settle. Root/scene lane owns real StudioScene and all scene files. No package/contract/content edits. Temporary unresolved scene imports are expected; do not claim integrated build before actual scene lands; no stub. Typecheck without incremental writes may be used. No independent Next build while root may be building/serving.

Report implementation, exact verification commands/results and honest pending integration checks. Completion requires authored files; baseline lint blocker is missing @typescript-eslint/eslint-plugin. No broad repairs.
