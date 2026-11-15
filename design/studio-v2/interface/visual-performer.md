# U visual performer report (Claude)

14 November 2026. Provider: Claude (Claude Code worker). Task `task_00060a30659b`, dispatch `ctx_508665017830`, worker terminal `term_072fcd55-70a0-414e-b39f-de0641912268`, coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. No helpers or subagents. No browser, build, server or `.next` writes. Everything below is source-level; nothing here has been rendered.

## Files changed (exclusive ownership only)

| File | SHA-256 |
| --- | --- |
| `app/studio/page.tsx` | `f811dc5eca892e911650eb61cf3f859fe9ceba2b725cd95d3ac39a546f4d7314` |
| `app/studio/StudioShell.tsx` (new) | `54cd010c7c0d62d7970d885535624b3bcb1504f78cb842945a8e95d2af1c775f` |
| `app/studio/studio.module.css` (rewritten) | `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a` |
| `design/studio-v2/interface/visual-performer.md` | this file |

No other file was edited. Metadata export in `page.tsx` is unchanged.

## Design decisions

The root art direction was read as a proposal. Adopted: existing palette and Arial/Georgia/Courier roles, room behind compact chrome, paper reading sheet. Changed or decided:

- **Room.** `section#studio` is exactly one viewport (`100svh`, `100vh` fallback) in every state, so hydration does not move the first screen. The scene viewport is `inset: 0` behind everything; no card, border, caption or hero column. Until the canvas reports ready it shows a still CSS dusk (lamp glow, wall, desk line), which is also the no-JS and failure backdrop. The v1 CSS sketch and its copy are removed.
- **Chrome as plates, not a frame.** Solid dark plates (92% opaque, no blur over WebGL) sit on the room: identity (h1 name in small Georgia, role in mono) top left, Work/About/Contact top right, project list bottom left, status pill and look controls bottom right. Estimated closed chrome is under 10% of 1440×900.
- **Project shortcuts.** `nav#studio-projects` is an ordered list of the three titles from `studioProjects`, each a ≥44px row with stable `studio-shortcut-<id>` ID and `aria-current` when selected.
- **Phones (≤ 47.99rem wide or ≤ 34rem tall).** One top bar (name, section links, role beneath) and one 58px bottom row: a `Projects` toggle and the five look buttons. The project list is folded by default so the room stays dominant; estimated closed chrome is about 20% of 390×844. Folded means visually clipped, not `display: none`: links stay focusable and in the accessibility tree, and the list unfolds on toggle, on any focus arriving (Work link, focus return to a shortcut, Tab) and via a `:focus-within` CSS safety net. Escape in the list or a pointer press on the room folds it. This fold state is the only state the shell holds.
- **Look controls.** Named group `Look around the studio`; left, up, down, right, reset as 44×44 native buttons with `aria-label`/`title`; disabled exactly per contract (`!enhanced || selectedProjectId`). Hidden by CSS before enhancement and after graphics failure. While focus is inside the group, arrow keys and Home send the same commands; nothing is bound outside the group.
- **Status line** (`role="status"`): shell-owned copy per state. Ready: "Drag to look · Select a screen". On failure it becomes a centred notice with reload guidance and the phone list is forced open.
- **Reading sheet.** Native `dialog` on paper: 46rem wide on desktop with a 56% backdrop so the room stays recognisable; on phones a full-width bottom sheet leaving a ~20px strip of room. Fixed bar with a visible text `Close` button (≥44px) above an independently scrolling body (`overscroll-behavior: contain`). Body text 17px at 1.75 line height, 66ch measure. The focused heading gets a visible 2px outline.
- **Article styles** are single-column by default (what the sheet uses); the two-column layout applies only inside the no-JS `.evidence` page at ≥ 64rem. All 13 frozen ProjectEvidence class exports are preserved.
- **About and contact** are server-rendered `section#about` and `footer#contact` below the room, present in both modes. All facts come from `studioProfile`; the only labels added are "About", "Projects", "Close", "Reset" and status copy.
- **Hidden safety.** `.studioPage [hidden] { display: none !important }`, and the dialog only gets `display: flex` under `[open]`, with an explicit `:not([open])` hide.

## Interface notes for the behaviour owner

- `id="work"` lives on the section passed in `evidence`; the shell wraps it in `div[hidden={enhanced}]` inside `main`.
- `#about` and `#contact` have `tabIndex={-1}` and scroll natively.
- The shell sets `data-room-state` (`still | loading | ready | unavailable`) on `#studio` and `data-projects-open` on the dock for styling only.
- Checked against the assembled `StudioExperience.tsx` call site: props match the frozen interface.

## Validation (source only)

| Command | Exit | Result |
| --- | --- | --- |
| `npx --no-install tsc --noEmit --incremental false -p tsconfig.json` | 2 | Zero errors in `app/studio/**`. One error remains in S lane: `components/studio/scene/build-studio.ts(347,3)` TS2741 missing `occluders`. Not mine to fix. |
| `npx --no-install prettier --check` on the three source files | 0 | Formatted. |
| Inline `node -e` class check: every `styles.X` in page, shell, ProjectEvidence and StudioExperience exists in the CSS; 13 contract classes present; braces balanced (143/143) | 0 | First run exited 1 on a missing `projectList` class; added and rerun clean. |

Not run: build, lint, server, browser, SSR render, any screenshot.

## Known runtime gaps for the root browser gate

All layout figures above are estimates from CSS arithmetic. To confirm in a real render:

1. 320px bottom row: toggle plus five buttons is computed to fit with roughly 10px spare; verify no overflow or clipped target.
2. 320px top bar: name and three section links are computed to fit on one row; verify, and that the role line does not wrap awkwardly.
3. Bottom-left project plate and bottom-right controls against the actual home framing: no overlap with the central project screen; keyboard and desk still recognisable on phones.
4. Phone list unfold on tapping Work, the toggle, and on focus return after closing a project; iOS Safari in particular, since it does not focus buttons on tap.
5. Dialog sizing and bottom-sheet anchoring with real `dvh` and safe-area insets; backdrop density; scroll containment.
6. Plate contrast over the brightest parts of the lit room, and focus ring visibility on plates and paper.
7. Pre-hydration to enhanced swap: on phones the list visibly folds at hydration; judge whether that flash is acceptable.
8. No-JS page: still room, open list, then full evidence, About and contact in order.
9. The 0.3s canvas fade-in on ready (removed under reduced motion) does not gate reading; confirm it reads well.

Independent Claude visual critique of actual screenshots is still owed and may return corrections to these three files.
