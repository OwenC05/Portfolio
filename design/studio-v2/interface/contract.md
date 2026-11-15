# U frozen interface contract

14 November 2026. Run `run_9e2c28f2f96d`; coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. Governing source: approved v2 PRD, common.md and immersive-v2-agent-routing.md. S has published the exact additive viewCommand / interactionEnabled contract; U consumes it only.

Root verification receipt `msg_00d57a2fc24e` confirms public contract SHA256 `64F88FD30B896C88C87A5631349BBB2BB9A3BC8676C0A1A816F1E5720902C84D`; optional fields match the PRD. Browser/build/preview remain root-owned pending assembled-ready.

## Exclusive ownership

- Claude visual performer: `app/studio/page.tsx`, `app/studio/StudioShell.tsx` (new), `app/studio/studio.module.css`, `design/studio-v2/interface/visual-performer.md` only. Owns all visual shell markup, styling, typography and responsive decisions.
- Codex behavior performer: `components/studio/StudioExperience.tsx`, `components/studio/ProjectEvidence.tsx`, optional nonvisual helpers named `app/studio/panel-*.ts`, `design/studio-v2/interface/verify-*.mjs`, `design/studio-v2/interface/behavior-performer.md` only. ProjectEvidence has exactly this owner. Do not restyle. Consume shell props and wire behavior.
- U coordinator: contracts/specs/receipts and final `design/studio-v2/interface-report.md`; no independent visual authorship.
- Independent Claude visual critic and independent Codex technical critic: distinct report files, read-only product review. Root owns preview/build/browser until explicit release. No performer launches servers/builds or browser.

## Component boundary (frozen before parallel dispatch)

`StudioExperience` default client export props: `{ evidence: ReactNode; children: ReactNode }`. Server page passes full project evidence in `evidence`, and About/contact sections as `children`. Preserve Next metadata and all existing content strings from studio-content. Evidence maps the shared ProjectEvidence with its default IDs; enhanced dialog uses that same component with `idPrefix="panel-"`.

New `StudioShell` client presentational default export is owned by Claude. Props (import types from React and studio-contract):

```ts
interface StudioShellProps {
  enhanced: boolean;
  selectedProjectId: ProjectId | null;
  sceneStatus: SceneStatus;
  scene: ReactNode;
  evidence: ReactNode;
  children: ReactNode;
  projectContent: ReactNode;
  dialogRef: RefObject<HTMLDialogElement>;
  dialogTitleId: string | undefined;
  onNavigate: MouseEventHandler<HTMLDivElement>;
  onViewCommand: (action: StudioViewAction) => void;
  onRequestClose: () => void;
  onDialogCancel: ReactEventHandler<HTMLDialogElement>;
  onDialogClose: ReactEventHandler<HTMLDialogElement>;
}
```

Shell root `div` owns `onClick={onNavigate}`, `data-enhanced` and `data-selected-project`. Room section `id="studio"`, `tabIndex={-1}`, labelled by identity h1 `id="studio-title"`. Scene viewport carries `data-scene-status`, scene layer stays mounted regardless of panel state. Shell imports existing profile/projects to generate identity and HTML project anchors; no copied strings. Compact Work/About/Contact anchors use `#work`, `#about`, `#contact`; About/contact point to server content that remains available when enhanced.

HTML project navigation `id="studio-projects"`, `tabIndex={-1}`, `aria-label="Selected projects"`; each project anchor has stable `id="studio-shortcut-<id>"`, href `projectAnchor(id)`. Work and skip-to-work enhance to focus this navigation without scrolling away; no-JS Work resolves full evidence `id="work"`. Render full evidence inside a wrapper with native `hidden={enhanced}` (explicit CSS [hidden] rule so layout does not override). SSR enhanced=false exposes full evidence, identity, role, About and contact. One accessible project reading surface only when enhanced.

Look controls: shell owns named group and 44px HTML buttons for left/right/up/down/reset, calls `onViewCommand`; no document-wide arrow/swipe hooks. Disable look buttons while panel selected or before enhancement. A native dialog stays in shell with `ref={dialogRef}`, `aria-labelledby={dialogTitleId}`, `onCancel`, `onClose`, visible button calling `onRequestClose`, then `{projectContent}`. Do not conditionally mount the scene. Codex controls showModal/close and article focus on React commit; no render/camera/timer wait.

Required stable CSS exports used by article/controller: existing ProjectEvidence classes `project`, `projectHeader`, `projectIndex`, `projectEyebrow`, `projectTitle`, `projectSummary`, `projectBody`, `projectFacts`, `projectFact`, `projectSections`, `projectSection`, `projectLinks`, `returnLink`; preserve them. Shell/page class names are Claude-owned internal choices. Codex must request visual/class changes through U instead of styling independently.

### Serial mechanical wiring handoff

Claude released `StudioShell.tsx` at SHA256 `54cd010c7c0d62d7970d885535624b3bcb1504f78cb842945a8e95d2af1c775f` in `msg_993e2e5beda2`; follow-up `ctx_46aeb1400f90` settled succeeded. No pending visual edits. Codex behavior performer now has temporary exclusive permission to edit only nonvisual props/handler/ref wiring in that file. Preserve Claude's DOM, CSS/class names, design, content and SVG. Lift disclosure state/ref, nav focus/Escape, scene pointer fold and group keyboard commands into StudioExperience. Add these frozen shell props:

```ts
projectsOpen: boolean;
projectsToggleRef: RefObject<HTMLButtonElement>;
panelScrollRef: RefObject<HTMLDivElement>;
onToggleProjects: () => void;
onFocusProjects: () => void;
onProjectsKeyDown: KeyboardEventHandler<HTMLElement>;
onScenePointerDown: PointerEventHandler<HTMLDivElement>;
onLookKeyDown: KeyboardEventHandler<HTMLDivElement>;
```

The real scrolling element is the shell's existing `.panelScroll` div, not the dialog; use the supplied ref to reset article scroll on changed/opened project. Keep `data-projects-open`, `aria-expanded`, `data-room-state`, clipped focusable folded navigation and all visuals unchanged. This is provider-correct wiring, not Codex visual authorship. Return shell ownership to Claude after the pass.

ProjectEvidence optional `idPrefix?: string` defaults empty. Every article/heading/section ID and aria-labelledby uses the prefix; article back link remains `#studio`. Main substantial h2 ID in panel is `panel-project-<id>-heading`, tabindex=-1, focus target and dialog label.

## Navigation state table

| Input | URL/history | UI/focus |
| --- | --- | --- |
| Ordinary project shortcut or qualified scene selection from closed | Push project hash once, preserve all Next state fields; record positive in-memory ownership of created entry and return state | Immediate matching full article; showModal and focus substantive heading with preventScroll; HTML invoker or matching shortcut is return target |
| Repeat selected project | No duplicate entry | Retain/open matching panel; heading focus if appropriate |
| Select different project while panel open | Replace current panel entry preserving its ownership and Next metadata | Replace content immediately; focus new heading |
| Close/Escape/article #studio on own same-document entry | Back only with positive matching in-memory ownership proof of that entry and safe known base; otherwise replace with safe studio hash | Close on React commit, restore invoker/equivalent shortcut without document scroll; controller retained |
| Fresh/reloaded project fragment (no ownership proof) | Read hash; close replaces with #studio and preserves Next fields; never blind back | Open immediately after hydration; same panel and focus |
| Back/Forward/hashchange | Read URL; do not create entry | Synchronize open/closed project; coalesce only if necessary without intentional opening delays |
| Modified/nonprimary/download/external/new-context links | Leave native | Do not preventDefault |
| Work/skip | JS focuses #studio-projects; no-JS #work normal anchor | No camera dependency |

Use exact optional scene fields `viewCommand` and `interactionEnabled={!selectedProjectId}`; new view sequence per button action, keep mounted scene. Scroll-lock must restore previous styles/position and not reset orientation. Reduced motion has no animation gate. Graphics failure retains project shortcuts/dialog and explicit reload guidance; unsupported dialog must leave usable evidence rather than hide it.

## Validation boundaries

Targeted CPU/source/SSR checks may run without `.next` writes. Do not run build, server, tsc incremental writes, browser or performance collection. Record exact commands/exits/hashes, provider/task/dispatch receipts, and runtime gaps. Send source assembly readiness to U as soon as usable, then finish bounded checks. Root/I later provide actual render, browser and integrated build evidence.
