# After-hours Studio v1 — verification specification

Status: Planner draft. Paired plan: `prd-after-hours-studio-v1.md`. Verification owner records fresh evidence in `design/studio-v1/verification.md` and screenshots under `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/`. Do not mark an unrun check passed. No approved raster exists; assess named visual criteria rather than pixel matching.

## Build and change boundary

1. Inspect `git diff --stat` and `git status --short` before/after. Changes stay within assigned studio/package resources; old homepage/drafts and private photo remain intact.
2. Foundation records `npm ls three @types/three react next typescript`; expected exact Three/types0.187.0 and existing React18/Next14 baseline. No new adapter, audio, animation or test dependency without a concrete authorized need.
3. Run `npm run lint`, `.\node_modules\.bin\tsc.cmd --noEmit`, `npm run build`. Lint must be noninteractive. Do not run broad formatter/fix commands. Classify existing errors with baseline evidence; new code must pass. Build first if Next-generated route types are needed, then repeat the targeted check once.
4. Start one local preview on a verified free port with hidden background process. Prefer production preview after build for final timings; record URL, mode, browser, viewport and machine limitations. Smoke `/` and `/studio`; no new runtime/console errors, no 404 studio assets, no accidental global CSS regression.

## Visual identity gate

Capture loaded desktop **1440×900** and mobile **390×844**, including full-page evidence and an inspected project state. Inspect actual images, not only DOM assertions.

- The studio is the substantial visual subject; warm amber/cream light, dark neutral environment, material contrast and contact shadows read clearly. Cool screen accents do not dominate.
- Multi-monitor workstation, triangular wall lights, white PC, microphone arm and compact translucent/pastel keyboard are distinguishable. Keycaps and stands have authored detail rather than generic identical blocks.
- White keyboard controller and identifiable drum-pad/cymbal/rack silhouette sit on the **right** of the computer desk; they remain visible in the chosen mobile composition or its intentional alternate framing. Do not silently crop away the user's defining detail.
- Name, engineering purpose, direct work navigation and contact are legible as HTML. No tiny in-scene text is required to identify/open a project. No generic equal-weight card grid dominates the entry composition.
- Listening/making are represented without fabricated audio; coffee/snowboarding accents remain secondary and make no autobiographical claims.
- No clipped controls, horizontal page overflow or overlapping evidence text at 390px; inspect 320px as a layout edge case. Desktop and mobile screenshots must show a deliberate composition, not a scaled-down desktop canvas.

Any missing required feature, unreadable project entry or generic unfinished blockout is a blocking visual failure. Record subjective refinements separately from these concrete checks. Stylised geometry is acceptable; exact manufacturer fidelity is not claimed.

## Functional and accessibility journeys

1. Directly visit `/studio#project-dissertation` and reload: substantive dissertation section remains the destination. Test browser back/forward after selecting another project and returning to `#studio`.
2. Pointer: activate a designated scene project surface, confirm hash/selected state and focus on the matching **existing HTML** heading; inspect sections/facts/limitations; activate return link. Repeat another project and after canvas resize. Raycasting must use canvas-relative coordinates, not viewport coordinates.
3. Keyboard: Tab to visible project navigation, Enter to inspect, follow return link; visible focus, sensible order and no trap. Repeat with screen-reader-oriented DOM inspection: semantic nav/headings/links, accessible names, no canvas-only evidence. If canvas is presentation-only, hide it from assistive tech and supply equivalent HTML controls.
4. Mobile/touch emulation: perform the same project journey without hover. Controls have at least a 44×44 CSS-pixel intended hit area; the browser's normal page scroll is not captured by the scene. Check orientation/resize.
5. Text contrast: body text at least4.5:1, large text3:1, controls/focus indicators visibly distinguishable against their backgrounds. Verify actual computed colours; exempt purely decorative scene surfaces, not labels.
6. JavaScript disabled: name, profile, all project summaries and substantive evidence, anchor navigation and contact/repository links remain in server-rendered HTML and work. Do not hide the only evidence with client-state CSS. No unusable fake canvas interaction is the sole route to content.
7. Reduced motion: emulate before load and toggle while mounted. No ambient camera movement, entrance travel, interpolation or smooth scrolling; selected state still communicates immediately. Override the existing global `html { scroll-behavior:smooth }` for this condition and restore any route-owned mutation on unmount.
8. No sound plays on load, hover, focus, typing or selection; no fake sound toggle or fabricated music player appears. Validate no unintended AudioContext/media playback.

## Failure, lifecycle and rendering

Exercise these separately; a successful first render does not prove resilience:

Use browser instrumentation or opt-in development-only test hooks for failure/statistics checks. Do not ship a visible debug panel, implementation metrics or forced-failure controls in the normal visitor flow.

- Block the lazy scene chunk/import: retained fallback plus full HTML project path, no page-level crash.
- Force renderer creation failure (test browser WebGL2 context unavailable): scene status becomes unavailable; useful fallback and normal links persist.
- Simulate `WEBGL_lose_context` where available: renderer stops safely, fallback appears, evidence remains usable. Either controlled restoration or a reload instruction is acceptable; endless retry/spinner is not.
- Under React development Strict Mode, enter/leave `/studio` at least5times. One mounted canvas, no growing listeners/observers or active loops after teardown, no late callback state updates or leaked resources. Record how observed; absence of console errors alone is insufficient. Review explicit disposal of geometries/materials/textures/renderer and async cancellation.
- Hide/show document and resize canvas: rendering pauses when hidden/unneeded; dimensions and hit testing recover correctly. Cap effective DPR at2 (lower on small screens if needed); use no more than one shadow-casting light for this first version unless measurements justify a documented exception.
- Prefer render-on-demand. After a stationary scene settles, there should be no continuously advancing scene animation; a loop may remain only if a deliberate bounded motion is documented and disabled for reduced motion/hidden pages.

## Performance evidence

Record browser/preview mode and renderer `info` counts plus transferred scene JavaScript/assets. Initial engineering budgets: scene-related transfer at most1.5MB compressed; at most200 draw calls and200k triangles; no bundled room HDRI/video or undocumented large texture. These are project budgets, not universal standards. Exceedance requires reducing cost or an explicit recorded visual/measurement justification before completion.

For a 10-second scripted interaction/resize sample on the available desktop browser, record requestAnimationFrame interval p95 and any tasks over100ms attributable to scene work. Target p95 <=33ms where frames are requested; do not call idle render-on-demand gaps slow frames. If the environment cannot yield trustworthy GPU/frame measures, report that limit, record counts/transfer/interaction responsiveness, and do not claim physical-mobile FPS. Keep physical mobile verification as an explicit gap if no real device is available.

## Truth and assets

Content reviewer compares every project to `design/portfolio-draft/index.html` and contextual evidence. Confirm dissertation scope numbers are not presented as accuracy; no invented outputs, production users, deployment qualification, CV or job dates. Check Copilot and TypeForge qualifications remain adjacent to relevant claims. Verify only supplied real destinations are linked; do not submit contact forms or send messages.

Asset manifest lists each shipped nonprocedural file, source, reuse permission/license and modifications. Private room photo is not shipped. Procedural gear is labelled internally as stylised; no brand specification or exact-model fidelity claims. Fonts retain OFL/license files. No paid generation is needed for this scope.

## Final review and completion evidence

After fixes: rerun checks affected by changes, then final lint/typecheck/build and core browser journey once. Independent code/architecture review examines lifecycle, progressive enhancement, shared contracts, claim boundaries and maintainability. Complete only with no unresolved blocking findings and a truthful report containing local URL, desktop/mobile screenshots, file changes, observed checks and remaining limitations. A worker's completion message alone is not verification.
