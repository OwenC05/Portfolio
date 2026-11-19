# Immersive After-hours Studio v2 — clarified brief

Status: execution-ready requirements,14November2026. Brownfield refinement of `/studio`. This supersedes v1's fixed external-diorama/no-exploration premise and scene-to-page scroll behavior, while preserving truthful content and unrelated boundaries.

## User decisions

- The v1 Three.js experience felt undercommitted. Reference: Jesse's Ramen https://www.jesse-zhou.com/. Keep projects on monitors.
- Eye-level interior is the starting viewpoint. A room visitors can look around is sufficient. It must remain a portfolio, not a game.
- Clicking a project monitor should read immediately: no camera approach, forced animation, entrance sequence or delay. A readable HTML panel over the retained room is the accepted interpretation; close returns to the same viewing direction.
- Richly detailed, stylised visuals are selected over photorealism. Warm after-hours atmosphere stays. Recognisable equipment, expressive shapes, tactile materials, convincing scale and lighting must improve substantially on the basic v1.
- Earlier personal direction remains: computer desk/monitor arrangement, translucent compact Think6.5/Milkshake-inspired keyboard, white PC, mic, headphones, coffee, snowboard; white Launchkey49 and electronic drums to the right. Stylised approximations, no manufacturer-exact claims.

## Intended experience and proposed defaults

The room fills the main viewport at a comfortable eye-level perspective. Visitors drag/look around from a fixed position; no walking, WASD, pointer-lock, game objectives or required discovery puzzle. Use restrained yaw/pitch bounds and a clear reset/home view; keep direct Work/About/Contact controls visible. Model only reachable viewing directions well; avoid revealing cutaway edges, missing walls/backs, floating objects or blank geometry. Avoid automatic movement and motion sickness. Touch and keyboard users need equivalent, obvious ways to select/read work without relying on tiny 3D targets. Desktop drag must not accidentally select a monitor; mobile look gesture must coexist with page/panel scrolling. Reduced motion removes interpolation/inertia; deliberate direct look input remains under visitor control.

Monitor selection immediately opens substantive existing project content in an accessible HTML reading surface over the room, not rasterised text. Do not scroll the visitor away from the studio when JS enhancement is active. Provide heading focus, Escape/close, appropriate modal semantics/focus return, direct fragment links and coherent Back/Forward. Preserve the no-JS ordinary HTML evidence and graphics-failure path. Do not duplicate IDs or fork separate truth/claim copies.

The room should convey layered depth and tactile detail from eye level: timber grain/edge bevels, keycap/switch/case profile, monitor stand/cable details, drum pads/cymbals/rack and keyboard controller shapes, warm practical lights and soft contact shadows. Typography/navigation should feel integrated and restrained rather than a large editorial column competing with the scene. Hobby items may be personality scenery in this increment; no invented audio, media, autobiographical facts or game interactions are required.

## Scope and non-goals

- Refine local `/studio`; preserve `/`, old drafts, completed v1 evidence and unrelated work.
- Keep Next14/React18/direct Three0.187 baseline unless a concrete change is separately necessary and authorized. No new direct dependency assumed.
- Reuse content/contract and good disposal/failure/testing boundaries; change interfaces explicitly before parallel implementations consume them.
- No public deployment, commit, paid asset generation, private-photo publication, backend AI service, fabricated recordings or autoplay.
- No walking simulation, physics, pointer lock, exploration quests or long cinematic sequence.
- Do not restart exhaustive unchanged v1 tests; run new movement/panel/visual checks and affected regressions, then build/typecheck/scoped lint and independent review. Configured lint's missing-plugin baseline stays explicit.

## Acceptance

1. First loaded desktop view reads as being inside a warm stylised studio at eye level, with substantial authored depth/detail. No framed miniature diorama or huge side text column.
2. Drag/look produces useful bounded new viewpoints with complete credible geometry and right-side instruments; no navigation hijacking or accidental project activation.
3. Each of three project monitors and equivalent HTML controls opens the matching project immediately, with no camera move. Readable panel supports close/Escape/history/deep links and preserves orientation. User content stays accurate.
4. No-JS and WebGL/lazy/context failure retain usable full project evidence; keyboard/mobile/reduced-motion paths work.
5. Actual 1440x900,390x844 and320px screenshots, including alternate view and open project, demonstrate the new experience. Compare visually against v1 and Jesse for immersion, not pixel-copying. Root/designer must inspect actual renders before acceptance; passing tests alone cannot satisfy art direction.
6. Responsive performance/lifecycle stays measured and bounded. Reassess camera/material/shadow cost with actual render/transfer counts and a short intentional look sample; no continuous idle rendering, cleanup leaks or fake device/GPU claims.

## Context and evidence

- `.omx/context/immersive-studio-20261114T215500Z.md` and three clarification rounds; initialcontext not oversized.
- Actual native explore `/root/immersive_studio_context`: fixed orthographic positions/whole-room fit in controller.ts; shallow open geometry in build-studio.ts; three monitor targets; current HTML evidence/selection/lifecycle boundaries reusable.
- Jesse live reference screenshots `.omx/context/jesse-reference-entry-20261114.png` and `jesse-reference-look-20261114.png`: full-screen scene, drag changes viewpoint; no claim of actual first-person walking.
- v1 approved specs/reports remain historical evidence, not authority to retain rejected camera/reading behavior.
- Current production preview http://127.0.0.1:4181/studio restarted PID18508; verify process identity before later changing it. Assign one preview/build/browser owner.

## Closure and handoff

Quick interview completed in3rounds. Intent/eye-level scope, no-game boundary, immediate-read tradeoff and stylised visual target are explicit. Pressure pass: spatial camera approach versus immediate portfolio reading; user chose reading. Estimated residual ambiguity0.065; remaining implementation choices can be decided by Planner/Architect without more user questions. No public docs/memory promoted from answers. Next: Ralplan short consensus plan with concrete visual/movement/panel contracts, then existing user-requested Orca secondary-orchestrator implementation and independent critique. User's current refinement request and accepted clarifications authorize reversible local work; no repeated proceed question.

