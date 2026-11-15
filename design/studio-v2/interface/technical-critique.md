# Independent Studio v2 interface technical critique

**Verdict: FAIL — two P2 source-mechanic findings remain.** Review deliverable complete; interface technical acceptance withheld. No P0/P1 finding identified. This verdict covers bounded source/CPU/SSR review, not browser, visual, production-build or device acceptance.

Reviewed 14 November 2026 by the independent Orca Codex critic, task `task_04013a2c4f28`, dispatch `ctx_03cb188aa6c1`, terminal `term_c7cd1ef2-f168-4373-bd6b-876bd096dde3`, reporting to U `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. No helpers. Product source and performer tests remained read-only. The only authored artifacts are this report, `technical-critique-probes.mjs`, and `technical-critique-hashes.json` in this directory.

Read the shared execution contract, approved PRD/test specification, clarified brief, provider-routing addendum, technical handoff, frozen U contract and serial wiring release, both performer reports, and their validation scripts. Current reviewed source hashes match the behavior performer's final hashes and the visual performer's page/CSS hashes. Task-specific AgentMemory retrieval located the current performer-validation observations; conclusions below use the actual files and commands.

## Findings requiring performer repair

### TC-01 — P2: manual restoration also suppresses ordinary section-history restoration

**Location:** `components/studio/StudioExperience.tsx:121-154`, especially the whole-mount `history.scrollRestoration = 'manual'` at line 131; `onNavigate` at lines 269-287 deliberately leaves About/Contact navigation native.

The enhancement takes ownership of scroll restoration for every same-document entry until unmount or enhancement failure. Its history listener only reads the project hash and updates selection; it has no corresponding restoration path for ordinary section navigation. Reproduction sequence: begin at `/studio` at the room, follow About, then Back to the no-fragment entry. The browser has been told not to restore the saved position, and the application neither restores it nor scrolls to the room. The same omission affects Back/Forward among ordinary sections. This is distinct from the correctly implemented `lockPanelScroll` release path: no panel need be opened.

**Evidence:** the added CPU probe runs the real component handlers through the performer's explicit ports. Starting at scroll Y=65, it models native About navigation to Y=900, traverses back, and delivers both history notifications. Result: empty hash, `scrollRestoration: "manual"`, Y still 900, zero application scroll calls. The CPU model does not implement browser scrolling; it proves the application takes restoration ownership without implementing the ordinary-entry branch. The predicted visible failure still needs root's browser confirmation.

**Requested repair, Codex behavior owner:** limit manual restoration to the panel traversal that needs it, or explicitly preserve and restore ordinary same-document positions as well. Preserve the immediate panel, no forced opening scroll, safe close, and mounted controller contracts. Add a targeted room → About → Back and About ↔ Contact history case, including a panel round trip, rather than relying only on project-entry tests. Do not solve this by making all section navigation scroll to the room.

**Confidence:** high in the source omission; native timing/viewport consequence unmeasured here. This blocks bounded navigation acceptance pending repair or root evidence that invalidates the stated path.

### TC-02 — P2: collapsing with retained navigation focus contradicts visible state

**Location:** `components/studio/StudioExperience.tsx:372`; `app/studio/StudioShell.tsx:153-183`; `app/studio/studio.module.css:511-528`.

The toggle callback only flips `projectsOpen`. The compact-layout folding selector explicitly requires `.projects:not(:focus-within)`. If activation does not move DOM focus away from the navigation, toggling from open to closed leaves focus inside it, so the folding rule cannot apply: the list remains visibly expanded while `aria-expanded` and `data-projects-open` say false. This path matters for focus-retaining activation; default button focusing must not be assumed across input/browser/AT combinations. The Escape handler already moves focus to the toggle and avoids this mismatch.

**Evidence:** the additional CPU probe focuses `#studio-projects`, runs the real focus callback, then the real toggle callback without manufacturing a focus change. Result: `projectsOpen === false` while `document` focus in the port remains on `#studio-projects`. The inspected CSS necessarily leaves that focused navigation unfolded. This is a deterministic source-state contradiction under the stated input condition, not a claim that root's Chromium pointer click or a physical iPhone reproduced it.

**Requested repair, Codex behavior owner:** when closing this disclosure, move focus out of the navigation to its toggle with `preventScroll` before committing the collapsed state. Preserve Work, Tab and panel-return expansion and Claude's visual rules. Add a focus-retaining activation regression. U should obtain the existing serial mechanical-shell authorization if its chosen fix changes shell wiring; no visual redesign is requested.

**Confidence:** high in the source-state contradiction; frequency on each real input/AT combination unmeasured. This blocks disclosure-mechanics acceptance.

## Root's mobile disclosure observation

U forwarded root's 390px observation in `msg_13c831acc0da`: the initially clipped navigation remains exposed to role queries while the toggle says collapsed. The frozen contract and Claude report intentionally keep these links accessible and focusable, with focus revealing them. Therefore `hidden=false`, `inert=false`, role-query presence, and a failed click on a clipped link do **not** independently prove an inaccessible control or a product defect. A pointer test must expand the list first; keyboard tests should exercise its focus-driven reveal.

The initial AT exposure alone is not an additional blocker in this review. It is an unconventional visual disclosure and warrants actual screen-reader/virtual-cursor review, since virtual browsing can expose the links without firing DOM focus. TC-02 is narrower and concrete: the program reports collapsed even while its own focused-state CSS keeps the list visibly expanded. Do not add `aria-hidden` to focusable descendants as a quick repair.

## Reviewed behavior and evidence

| Area | Bounded result and source evidence |
| --- | --- |
| Immediate full reading | PASS. Selection sets state directly at `StudioExperience.tsx:225-239`; the layout-commit effect shows the dialog, resets the real panel scroller and focuses the substantive heading at 171-195. No timer, scene-readiness, network or camera-motion gate. The CPU opening case passes while scene status is loading. |
| Native dialog races | PASS within modeled scope. Cancel prevents native default and uses the shared close path at 290-293. Queued close checks actual `dialog.open` at 294-297, so an already-reopened panel is not dismissed. The tests model handlers, not browser queued-event scheduling or native focus trapping. |
| Retained scene and suspension | PASS at the U boundary. The same unkeyed scene slot remains mounted at 338-349, receives `interactionEnabled={!selectedProjectId}`, and selection does not issue view commands. `StudioScene.tsx` updates the retained controller rather than recreating it for selection. Real renderer/controller lifecycle is S/root evidence. |
| Project history and safe close | PASS within the history-port model. `panel-navigation.ts:21-37` requires a live ownership map plus matching token and URL. Fresh/reloaded/unowned entries replace with `#studio`; owned entries only Back to a recorded same-document non-project base at 78-93. Repeat selection adds no entry; project switches replace; pending Back queues a rapid reopen. Ordinary-section restoration fails separately as TC-01. |
| History metadata | PASS for this module's writes: spread existing state on push and retain state on replacement at `panel-navigation.ts:55-64,91-92`. Actual Next 14 integration is not proven by the plain history port. Installed App Router has its own history updater/restore listener; its configured window-history support defaults off, and it can rewrite custom fields on restoration. Root must test Forward/reclose and rapid reopen against the real router, including ownership loss falling back safely. No package/config change requested. |
| Modified and other links | PASS. Existing prevention, button/modifiers, download, non-self target, origin/path/query checks at `StudioExperience.tsx:249-275` keep other link behavior native. CPU guards pass. |
| Heading and focus return | PASS within modeled scope. Prefixed heading is programmatically focusable; scroller resets on opened/changed project. Close returns to connected invoker, equivalent shortcut or navigation with `preventScroll` at 160-166, then expands disclosure. Native modal inertness/focus restoration and visibility remain browser gates. |
| Scroll lock and cleanup | PASS for tested inline properties and priorities. `panel-scroll.ts` snapshots/restores styles and exact coordinates, release is idempotent, and component cleanup releases lock/listeners/restoration state. CSS shorthand/longhand priority combinations are not modeled by the simple style port; no claim of all possible pre-existing styles. |
| No-JS and single enhanced surface | PASS source/SSR. `page.tsx:15-32` renders all three complete data-driven articles. `StudioShell.tsx:254-256` applies native hidden only after enhancement, and CSS 66-69 enforces it. Closed/unsupported dialog is hidden by CSS 591-598. The current enhanced panel is the only exposed project reading surface. Actual accessibility-tree verification remains root-owned. |
| IDs and truth preservation | PASS real React server rendering. `ProjectEvidence.tsx:13-50` prefixes every generated ID and matching label reference; default server IDs remain stable. Full content/profile/link checks, uniqueness and label-reference checks pass. Both surfaces use the shared data/component. |
| Failure and reduced motion | PASS source/CPU. Missing dialog support retains native evidence; failed `showModal` reveals/focuses the ordinary article and stops enhanced navigation. Scene failure leaves shortcuts/panel independent. Live motion-query listener cleanup and conservative initial preference pass; global and scoped CSS remove smooth motion under reduced motion. Real lazy-chunk/context-loss injection and live media-query behavior remain root-owned. |

## Commands and limitations

The new probe addresses gaps in the existing test model; it reuses the performer's explicit hook/history/DOM ports in memory, without editing that test. It also executes its existing 15 groups once as part of the same run, including real ReactDOM server rendering. It is independent test-case selection, not independent implementation of React, CSSOM, native dialog or browser history.

- `node design/studio-v2/interface/technical-critique-probes.mjs`: final exit **0**, all 15 existing groups pass and both added observations reproduce. Zero means the evidence assertions pass; it does not change the FAIL acceptance verdict.
- Initial probe-wrapper invocation: exit **1**, `SyntaxError: Identifier 'require' has already been declared`. Corrected only the critic-owned in-memory module wrapper; then reran successfully. No product repair was made or implied.
- `Get-FileHash -Algorithm SHA256` over the reviewed sources, reports, fixtures and relevant installed Next source: exit **0**; full values in `technical-critique-hashes.json`.
- Performer evidence read, not redundantly rerun: final nonincremental TypeScript exit 0; supplemental installed Next/React-hooks lint exit 0; configured ESLint exit 1 for missing `@typescript-eslint/eslint-plugin`. The configured-lint gap stays explicit and authorizes no package/config edits.

No browser, server, production build, `.next` write, screenshot inspection, physical device check or visual judgment was performed. The forwarded early desktop smoke (panel heading focus and preserved camera yaw/pitch/eye) is root evidence, not this critic's fresh measurement. Real hydration, native focus/inertness/scrolling, dual history-event timing, Next transitions, trusted touch/pen, StrictMode resource cycles, mobile overflow, failure injection, performance and independent Claude visual critique remain outside this acceptance scope.

## Reviewed primary source hashes

| File | SHA256 |
| --- | --- |
| `components/studio/StudioExperience.tsx` | `e4a2207e8664a1f755d81fbf00442223f99c55bf5b93ca22cb0063a9a7a30ed6` |
| `components/studio/ProjectEvidence.tsx` | `7242983f72892b81591848fbb5d81d39d61a4e6ae8f9ee3a7333e0a4b54b4e91` |
| `app/studio/panel-navigation.ts` | `e0d78f392b3b68ee115c56fe2e3c4c662e424b7a6629e88f8cebdf48b9a2733b` |
| `app/studio/panel-scroll.ts` | `ef13a9d34aec31eb245232ada5675bc1cf010dd41bdd352ecbefc72fe0daa188` |
| `app/studio/StudioShell.tsx` | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |
| `app/studio/page.tsx` | `f811dc5eca892e911650eb61cf3f859fe9ceba2b725cd95d3ac39a546f4d7314` |
| `app/studio/studio.module.css` | `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a` |

Full supporting hashes are in the companion manifest. This report is excluded from that manifest to avoid a circular digest. Any changed source requires a scoped re-review, not silent extension of this verdict.

Actionable findings were sent early to U as `msg_2cf72b8b8f1d`. Repairs belong to U's Codex behavior performer, with Claude retaining visual ownership. Re-review after those repairs and root's reserved browser/build evidence are outstanding; no technical acceptance is granted by this report.

## Preserved-prototype baseline disposition

Follow-up task `task_1748f03826b8`, dispatch `ctx_4507761f317d`, conveyed the latest root/user scope in `msg_1442d2582891`: preserve this prototype and move toward Higgsfield/Blender/Meshy asset authoring before further Three.js refinement. This report is therefore retained as baseline evidence and repair recommendations; it does not launch those repairs or expand into asset or aesthetic work.

Rechecked all 18 entries in `technical-critique-hashes.json` after that message: exit 0, every captured source/evidence hash unchanged. Existing CPU evidence and the FAIL verdict remain applicable; no repeat CPU run was necessary. TC-01 and TC-02 remain explicit technical findings, with the disclosure interpretation above unchanged.

Read the now-settled independent Claude `visual-critique.md` as reported evidence only. It separately fails the early 320px closed interface for control overlap and name/role crowding; desktop and 390px pass their early visual gate with listed corrections. These remain Claude-owned visual findings, not Codex styling tasks or visual judgments by this critic. No product, test, CSS, package/config, server, browser, build or asset changes were made in this follow-up.
