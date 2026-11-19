# Studio interface independent review

14 November 2026. Task `task_4b40fcb6897f`, dispatch `ctx_170e1d36c593`.

**Current verdict: APPROVE for interface integration. No blocking interface findings remain after the independent P2 retest appended below.** Final integrated scene/build verification remains with root.

Initial verdict: REQUEST CHANGES for P2 history focus restoration. The following original review and failure screenshots are retained as historical evidence; the parent-reported fallback-link correction was verified, and no implementation edits were made.

## Blocking finding

### P2 — Back to the initial bare route leaves keyboard focus in the evidence

Location: `components/studio/StudioExperience.tsx:46-55`, `:86-92`, and history synchronization at `:100-113`.

`hashTarget('')` returns null. After Back from a project to the initial `/studio` entry, `applyLocation` clears project selection and returns before moving focus. Native history eventually restores the landing scroll position, but the previously focused project heading remains active and offscreen. The next Tab skips the visible landing controls and jumps deep into the evidence.

Fresh reproduction in separate Chromium contexts, reduced motion enabled before navigation:

1. Open `http://127.0.0.1:4180/studio` without a fragment and wait for the actual scene.
2. Activate the dissertation link in Selected projects.
3. Go Back and allow native scroll restoration to settle (400 ms).
4. Press Tab.

At 1440x900, initial `scrollY=0`; selection set `#project-dissertation`, focused `project-dissertation-heading`, and scrolled to 1173. Back restored bare `/studio`, `scrollY=0`, and null selection, **but focus remained on `project-dissertation-heading`**. Forward and reload correctly restored the project.

At 390x844, Back restored bare `/studio` and `scrollY=32`, with the focused heading at viewport y1402.94. The next Tab moved to the dissertation's **Back to studio** link and scrolled to **3994**, despite the visitor having just returned to the landing view. This is a concrete keyboard/history regression, separate from the now-fixed fallback tab-order issue.

Recommended parent fix: handle the empty-fragment history destination explicitly. When synchronizing a transition back to the bare route, restore focus to the originating landing control or `#studio` with `preventScroll: true`, preserving native scroll restoration where appropriate. Keep a fresh initial no-fragment load from unnecessarily stealing focus. Do not add a history entry or a positive tabindex. A bounded alternative is to map the bare route to the landing target while distinguishing initial synchronization from history navigation.

Retest bare-route project selection → Back → Tab at desktop/mobile, then explicit `#studio`, project-to-project Back/Forward, repeated identical links and reload. Evidence: [landing after Back](critique-back-empty-hash-1440.png), [next Tab jumps into evidence](critique-back-focus-jump-390.png). The first image shows the restored landing view; active-element evidence above establishes its invisible stale focus.

## Fresh browser checks

Used only the existing development server at `http://127.0.0.1:4180`, isolated Chromium **157.0.8103.52**. Viewports are emulation, not physical devices. All temporary contexts and modifier-click tabs were closed.

| Check | Actual result |
| --- | --- |
| No-JavaScript SSR at 320x844 | Separate `javaScriptEnabled: false` context. Compared current `lib/studio-content.ts` exports against rendered HTML: **53 checks, zero failures**, all **16 substantive paragraphs**, **9 facts**, 13 subsection headings and 3 projects retained; no hidden evidence, one h1, zero canvases, no horizontal overflow. Supplied repository/contact anchors remain ordinary links. |
| Corrected no-JS keyboard order | Fallback contains **zero links**. Tab order: skip, identity, Work, Email, GitHub, LinkedIn, dissertation, Copilot, TypeForge, first evidence return. Project links are at document y840.91, 914.22, 974.08; the next stop is y4777.20. No jump back into the visually earlier fallback. |
| No-JS Work and return | Keyboard Enter on header Work produced `#work`, focused `main#work`, and placed it approximately 16px below the viewport top. Next Tab reached the first return link; Enter produced `#studio`, focused the landing section and restored scrollY=0. Plain `#project-typeforge` loaded at section top approximately 32px. |
| Direct project/repeated identical link | Fresh `/studio#project-dissertation` focused the existing h2 approximately 40px below the top. Activating the same direct link focused that same heading, kept selection dissertation and left history length **2 → 2**. |
| Explicit-fragment history | Dissertation → Copilot → return `#studio` gave history **2 → 3 → 4**. Back, Back, Forward restored Copilot, dissertation, Copilot with matching heading focus and selection; history stayed 4. Reload on Copilot preserved its hash and heading focus. Bare-route Back has the separate blocker above. |
| Modified clicks | Actual Ctrl-click and middle-click each opened the expected dissertation hash in a new tab while the original hash and history length remained unchanged. Closed both tabs. |
| Loaded keyboard navigation | At 320px, Tab reached the project link with a 3px visible focus outline; Enter focused the existing dissertation h2, next Tab reached its return link, and Enter focused `#studio`. Reduced-motion history tests separately verified settled destination positions. |
| Reduced motion before hydration | No-JS context configured with reduce before load computed root `scroll-behavior: auto`. Separate JS context configured with reduce before load recorded initial heading synchronization and all deliberate navigation as `scrollIntoView({behavior: 'instant'})`; history/reload also used instant. Toggling to no-preference enabled deliberate smooth navigation; toggling back restored instant navigation and CSS auto. Scene animation/performance is not claimed from these interface checks. |
| Actual layout and target dimensions | 390px scene starts at y203.625; 320px at y197.047. Fresh 1440px, 390px and 320px page checks had no horizontal overflow. All rendered anchors at 390px measured at least 44x44px; the no-JS 320px keyboard sample also met 44px. |
| Visible focus and sampled contrast | Inspected actual Work, project-link and heading-focus screenshots. Computed intro/personal text against dark background: **8.70:1**; evidence label **6.03:1**, fact text **8.40:1**, h3 **13.05:1** against paper. Focus colors against their surrounding backgrounds are approximately **12.38:1** dark and **5.98:1** paper. These are sampled computed colors, not a whole-page contrast audit. |

The first broad no-JS paragraph selector also counted each project's eyebrow and summary; the subsequent content-equality check used the nested evidence sections and confirmed the correct **16** substantive paragraphs. One screenshot wait required an unnecessary 6px bottom clearance and timed out because native focus scroll placed the project's box at viewport y770.91–844.22; the corrected capture used the actual settled focus state without changing the application.

## Source review

- `app/studio/page.tsx:15-100` supplies introduction and evidence as server-rendered slots. `ProjectEvidence.tsx:15-75` retains all supplied summaries, facts, sections, links and normal return anchors. No project evidence is duplicated in the canvas, hidden by selected state, or dependent on the lazy scene.
- `StudioExperience.tsx:22-44,190-239` confines lazy/render failure handling and `aria-hidden` to the scene. Both server slots remain outside the error boundary. The useful still sketch, guidance and caption exist before hydration. **Lazy-import rejection, renderer failure and context loss were source-reviewed here, not injected in this review.** Root retains those integrated failure checks.
- `StudioExperience.tsx:141-170` preserves already-prevented, non-primary, ctrl/meta/shift/alt, download, non-self-target, different-origin/path/query and unsupported-hash navigation. Ctrl and middle were tested live; other branches are source-reviewed only. External links were inspected, not followed or used to contact anyone.
- `StudioExperience.tsx:121-138` routes scene selection and HTML links through the same project/hash/heading logic and avoids identical pushes. The scene callback wiring is source-reviewed; actual hotspot selection and scene picking belong to root.
- `StudioExperience.tsx:69-84,93-96` starts motion conservatively and cleans up its media-query listener. `app/globals.css:14-18` provides the pre-hydration root override; `studio.module.css:802-809` disables scoped animation/transition/smooth scrolling under reduce.
- The replacement at `StudioExperience.tsx:207-214` is a noninteractive span. Mobile CSS ordering (`studio.module.css:668-703`) still puts the decorative figure before prose visually while DOM reading order places it after the introduction. With no scene/fallback tab stops, the ordinary keyboard sequence is coherent. Actual screen-reader testing was not performed; the static figure/caption reading-order difference is not treated as a blocker.
- Shared content/contract boundaries are preserved. Dissertation scope/limitations, Copilot's in-development/synthetic-test qualification and TypeForge's unestablished user benefit are retained. This is retention verification, not a new audit of their underlying research sources.

## Visual assessment and optional refinement

Inspected the corrected 1440/390/320 images and fresh desktop/no-JS/focus captures. The interface gives the warm room substantial space, keeps identity and Work/contact legible, shows the right-side controller and drum silhouette at both mobile widths, and avoids a generic project-card grid. Evidence is readable on the contrasting paper surface. Detailed geometry, touch regions and render quality remain the scene/root lane's assessment.

Optional polish: the native keyboard scroll can leave the first project link's bottom focus-outline edge at the viewport boundary on 320px. Its top and both side edges remain strongly visible, with legible link text, so this is not the blocking history issue. The parent may consider a small scroll-margin if it improves this without breaking native behavior. No invented pixel score or physical-mobile result is asserted.

Fresh artifacts, all in this folder:

- [Updated no-JS 320px fallback](critique-nojs-320.png)
- [No-JS Work keyboard focus](critique-nojs-work-focus-320.png)
- [Existing HTML heading focus at 390px](critique-heading-focus-390.png)
- [Loaded project-link keyboard focus at 320px](critique-project-link-focus-320.png)
- [Fresh desktop composition](critique-desktop-1440.png)
- [Bare-route Back landing view](critique-back-empty-hash-1440.png)
- [Bare-route Back then Tab failure](critique-back-focus-jump-390.png)

## Ownership, limits and handoff

Only this report and the seven critique screenshots were authored. No implementation, package, scene, shared content/contract, runtime state or sibling report was edited. No helpers, server, build, dependency install or broad formatter was run. Parent's fresh typecheck/Prettier/diff-check pass is dispatch-reported evidence and was not rerun or relabelled as this review's own result. Final integrated build/lint, full failure injection, scene lifecycle/StrictMode/performance, physical mobile and homepage regression remain with root integration.

**Isolated browser is explicitly released to parent/root.** Final state: one context, one page at `/studio`, viewport **390x844**, scene **ready**, no horizontal overflow; no temporary contexts/tabs or instrumentation remain. No further browser work is pending in this leaf review. Parent should fix the P2 history-focus issue and arrange the bounded retest before interface approval.

## Independent P2 retest — APPROVE

14 November 2026. Follow-up task `task_2f64bee30040`, dispatch `ctx_16c817463f30`. This section supersedes the original P2 finding and its fix/retest request above.

**P2 resolved. No blocking interface findings remain.** Source inspection confirms `components/studio/StudioExperience.tsx:86-99` now distinguishes a return from a previously applied nonempty fragment from fresh empty-fragment initialization. It updates selection, focuses `#studio` with `preventScroll: true`, and returns before programmatic scrolling. Initial bare-route initialization retains its previous focus behavior.

Fresh tests used the same existing development server and isolated Chromium, with a new temporary context for each viewport and reduced motion set before load to match the original reproduction. Browser-only instrumentation recorded `focus` and `scrollIntoView` calls; it was confined to temporary contexts and removed by closing them.

| Viewport | Initial bare route | After project → Back | Next Tab |
| --- | --- | --- | --- |
| 1440x900 | BODY active; scrollY 0 | Bare URL, `#studio` focused, null project selection; native scrollY 0 | **After-hours Studio** anchor; scrollY 0 |
| 390x844 | BODY active; scrollY 0 | Bare URL, `#studio` focused, null project selection; native scrollY 32 | **After-hours Studio** anchor; scrollY 8 |
| 320x844 | BODY active; scrollY 0 | Bare URL, `#studio` focused, null project selection; native scrollY 70 | **After-hours Studio** anchor; scrollY 0 |

All **24 targeted assertions passed**: eight per viewport covering initial focus, restored landing focus, absence of an added scrollIntoView call on Back, preventScroll on the restoration focus call, the next landing keyboard control, Forward, reload and identical-destination history. On all three fresh bare-route loads there were **zero programmatic focus calls and zero scrollIntoView calls**. On Back, focus changed to the landing section without a new scrollIntoView call; native history scroll restoration remained in control. The small mobile offsets reflect scrolling the original project link into view before activation. Tab returned to the visible identity link instead of the previous jump to the dissertation return link near scrollY 3994.

Forward and reload restored `#project-dissertation`, selected dissertation and focused its existing h2 at all three widths. Re-activating that same destination kept history length **3 → 3**, with the correct heading still focused.

A separate fresh 390px context verified the explicit-fragment sequence: direct dissertation → Copilot → `#studio` → Back to Copilot → Back to dissertation → Forward to Copilot → Forward to studio → reload studio. All **eight observed states** had the expected hash, matching heading/landing focus and project selection. History grew **2 → 3 → 4**, then remained **4** through Back/Forward/reload; explicit studio states restored scrollY 0.

New pass captures were inspected and kept separate from the original failure images:

- [Desktop Back then Tab — pass](critique-pass-back-focus-1440.png)
- [390px Back then Tab — pass](critique-pass-back-focus-390.png)
- [320px Back then Tab — pass](critique-pass-back-focus-320.png)

Each shows keyboard focus on the landing identity link with the room still visible. No original screenshot was overwritten. Only this report and these three new screenshots changed in this retest; no implementation edits, server, build or helpers. Parent's fresh typecheck/Prettier/diff-check remain parent-reported checks. Previously passed no-JS, SSR, modified-click and reduced-motion behavior checks were not unnecessarily repeated; their earlier evidence and limitations remain applicable. This approval covers the interface review, not root's outstanding integrated scene/failure/lifecycle/performance/build checks or physical-mobile acceptance.

**Isolated browser is explicitly released again to parent/root.** Final verified state: **one context, one page**, `http://127.0.0.1:4180/studio`, **390x844**, actual scene **ready**, and no review instrumentation present. All temporary test contexts were closed. No remaining interface fix or retest is requested by this reviewer.
