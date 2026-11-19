# Immersive studio critique and clarification

14 November 2026. Discussion/requirements only; no new implementation authorized during this clarification pass.

## Prompt-safe current context

User's immediate v1 review: Three.js feels undercommitted; wants immersion like Jesse's Ramen, being in the room, clicking objects and looking around. Explicitly retain projects on monitors. User invites clarifications. Known prior preferences: warm after-hours studio, music keyboard/drums to right, personal audio/coffee/keyboards/snowboarding. Preserve truthful AI/engineering evidence and reliable direct access.

## Grounding

- Supplied AGENTS instructions govern; explorer found no on-disk ancestor AGENTS. README gives Next14/TypeScript/Tailwind baseline.
- Prior PRD `.omx/plans/prd-after-hours-studio-v1.md` explicitly chose fixed front-left external camera/no exploration and excluded walking. New user feedback supersedes the fixed-view/no-exploration assumption; literal walking remains a decision, not assumed.
- Actual controller.ts uses orthographic fixed positions, whole-room fit; pointer drag only cancels click. build-studio.ts creates shallow open room and three project targets; fourth elevated screen decorative. No other objects interactive.
- Keep reusable scene/UI/content/resource boundaries; navigation currently focuses/scrolls existing server-rendered HTML. Whether project reading should stay spatial/in-monitor is unresolved.
- Live https://www.jesse-zhou.com/ loaded after START. Full1280x720canvas, atmospheric ramen exterior and spatial signs; screenshot `jesse-reference-entry-20261114.png`. Drag observation saved `jesse-reference-look-20261114.png`. Do not equate user's phrase inside-room with verified free-walking controls; first question distinguishes desired viewpoint/movement.
- Source lookup by actual native explore `/root/immersive_studio_context`; no product edits.
- Memory registry quick keyword lookup found no Portfolio/studio match. No memory files relied upon or updated.

## Unknowns and decision boundaries

Highest leverage: interior eye-level guided looking/moving between stations, free first-person walking, or exterior orbiting room. Next: monitor click should zoom in/place reading or leave scene; hobby interactions depth; graphical fidelity/material/lighting target; mobile/reduced-motion counterpart. No commitment to dependencies, asset generation or implementation until meaningful experience choices settle. Existing paid-generation/public-photo/deployment restrictions remain unless explicitly changed.

Initial context size: not_needed (concise task context fits). Quick clarification profile, maximum5rounds, target ambiguity<=0.30; hard mandatory closure gates non-goals/decision boundaries and one follow-up pressure pass. Estimated initial clarity: intent0.95,outcome0.55,scope0.40,constraints0.80,success0.50,context0.95; weighted ambiguity0.3075 (~31%). Round1targets outcome/scope: viewpoint and navigation.

