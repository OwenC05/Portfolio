# First integrated render review

Root inspected actual /studio through isolated Playwright on 14 November 2026, development preview http://127.0.0.1:4180 (managed session40052). This is early integration evidence, not final acceptance or a production performance measurement.

## Observed

- Desktop1440x900 page loaded with correct title and one visible WebGL canvas (about759x668 CSS pixels); no horizontal page overflow. Screenshot first-desktop-1440.png inspected with local image viewer.
- Warm room composition visibly includes multi-monitor arrangement, triangular lights, microphone arm, compact light keyboard, white PC, coffee, snowboard and right-side white controller/drum kit. Detailed stands/keys/cymbals/material differences make it more than a generic blockout. Desktop HTML name, role, project links and contact are readable. This is a preliminary visual judgement, not user approval.
- Browser console initially had zero errors and a Three r187 warning: PCFSoftShadowMap has been removed, falling back to PCFShadowMap. Root sent scene lead msg_fb53504eb395 requesting the supported constant. Later Fast Refresh messages are development activity while workers edit, not a clean final console proof.
- At390x844, no horizontal overflow, but canvas top was y794 and height480: first-mobile-390.png shows virtually no room in the initial viewport. Root sent U msg_40a05f1c65b2 to bring compact identity + meaningful scene into the first screen, retain Work/contact and move longer text/project rows below.
- After scrolling, first-mobile-scene-390.png shows all key room/instrument silhouettes; much of the480px canvas is empty above/below the roughly200px room. Suggested more compact mobile framing.
- Current settled-frame canvas diagnostics reported DPR1,60draw calls,65542triangles,9geometries,9textures. These are one observed frame, not initial-shadow peak, transfer, FPS, physical-mobile or lifecycle proof.

## Still required

Correct mobile composition and obsolete shadow selection; then validate actual scene/direct-link journeys, history/focus, no-JS, reduced motion, forced failures/context loss, lifecycle cleanup, actual budgets/performance and production build. Those tests were not performed in this first visual round.

## Ownership handoff

U reported both child slices assembled/typechecked, then reopened owning children for responsive order and header Work link. Root granted U exclusive isolated-browser ownership for correction/critique validation, one child at a time, reusing4180. Root will not operate the browser until U reports release. No concurrent production build against the live dev .next tree.
