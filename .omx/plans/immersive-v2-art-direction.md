# Immersive studio v2: interior art direction

Planning-only handoff, 14 November 2026. Governing brief: `.omx/specs/deep-interview-immersive-studio-v2.md`. This document proposes implementation defaults; the user's accepted choices remain authoritative. No source, preview, browser, build or runtime state changed in this slice.

## Direction and observed constraints

**A warm studio viewed from a visitor's seat near the workstation.** The memorable composition is a large tactile keyboard and timber desk in the foreground, three distinct project monitors at eye height, and a deeper music corner revealed by looking right. Equipment overlaps, light falls locally, and the architecture extends beyond the image. A visitor should feel surrounded by a room, while work stays one click away.

Inspected evidence:

- `final-first-1440.png`: v1 devotes a large left column to introduction and displays the entire floor slab in a separate bordered scene card. Equipment is recognisable, but distant and uniformly small. `final-first-390.png`: the whole-room fit makes the equipment and screen text smaller still, with substantial unused space around the model.
- Jesse reference entry and alternate screenshots: useful precedents are atmospheric lighting, authored depth, coherent silhouettes, full viewport presentation, and detailed newly revealed surfaces. These screenshots depict an external building, not evidence for an interior camera. Do not reproduce its exterior orbit, neon palette, or black void.
- `controller.ts`: orthographic whole-bounds fitting at `(-8, 6.5, 11.5)` desktop and `(-4, 7, 12)` mobile explains the miniature view. `build-studio.ts`: a 9.6 by 4.5 floor slab, one tall back wall and one low side wall cannot support an interior look cone without enclosure changes.
- The existing scene already models keycaps, PC fans, microphone joints, drum rack, cymbals and 49-key controller. Preserve useful authored parts; judge their visible quality after moving close. More object count alone will not solve the rejected appearance.
- `package.json`: Next 14.0.4, React 18, direct Three 0.187.0, TypeScript; studio styling is a CSS module. Existing local cream/amber/focus variables, Arial/Georgia/Courier type roles, resource ownership, instancing and procedural textures are appropriate foundations. No framework, paid asset or dependency change is proposed.

## Camera and room composition

Use perspective projection and a fixed eye position; look input changes orientation only. Do not retain scene-bounds fitting, orbiting, zoom-to-monitor, or automatic camera travel.

Starting values below use the current scene coordinates, where desk height is 1.5, the back wall is around z=-2.2, and positive z is toward the visitor. Treat roughly two units as one metre for proportions. Values are tuning seeds, not proof of final composition.

| Property | Proposed seed | Intended visual result |
| --- | --- | --- |
| Eye position | `(-0.6, 2.85, 4.2)` | Inside the room, approximately 1.4 m above the floor; neither overhead nor floor-level |
| Desktop vertical field of view | 54 degrees | Natural perspective with room for desk and a glimpse of music corner; no fisheye |
| Heading convention | 0 faces -Z; positive looks right | Explicit controller/model agreement |
| Desktop home | yaw 0, pitch -5 degrees | Main screen left of centre, three project displays clear, near desktop below |
| Mobile home | yaw approximately -13, pitch -5 degrees; vertical FOV 58–62 degrees | Central screen and keyboard dominate a portrait crop |
| Reachable heading | absolute yaw -40 to +64 degrees | Left snowboard/detail view through right music wall |
| Reachable elevation | absolute pitch -18 to +12 degrees | Desktop detail below; lights and upper wall above |
| Music composition | yaw approximately +35, pitch -7 degrees | Controller across lower midground, drum rack and cymbals behind |

At home, allow the near desk edge and equipment to crop naturally. Keep all three project screen faces fully inside the desktop viewport with no microphone or navigation overlap. The fourth decorative screen must stay visually subordinate and should not imply an unavailable project. The instruments need only establish a readable right-side silhouette initially; their complete arrangement belongs to the rightward view. Never shrink everything just to show every object at once.

Enclose the space before polishing materials. Extend the floor toward/past the camera, provisionally to z=6.5; keep the back at approximately -2.2. Extend full-height side walls near x=-4.5 and x=5.1 and supply ceiling/back-facing architecture wherever reachable frusta reveal it. Ceiling near y=5.3 is a reasonable first scale. Use continuous skirting, wall/ceiling joins and corners. Verify the entire frustum at all pitch/yaw combinations; the camera's centre ray alone is insufficient. No visible slab perimeter, cutaway wall top, missing reverse face or outside void is acceptable.

The left view can reveal snowboard bindings, a short shelf and cable route. The right view should reveal the music rig's support geometry and a grounded stool or storage detail, subject to visual space. These are ordinary room dressing, not invented biographical claims. Do not add interactive hobby promises or audio.

## Detail, materials and light

Author three readable scales of detail rather than a scatter of tiny props:

1. **Architecture and silhouette:** wall corners, desk thickness/underside, keyboard controller wedge, distinct drum pads and cymbals, monitor bodies and supports. Use convincing connection points and ground contact. Keep the music controller far enough forward of the drums that both can be read in the rightward view.
2. **Hand-scale construction:** visible desk bevel/end grain, keycap profile and spaces, translucent keyboard case around an opaque insert, mouse wheel/seam, monitor stand hinge and descending cables, microphone grille/mount, mug lip/handle, drum rims/clamps/pedals, controller pitch wheels/pads/knobs. At least these foreground details must survive at ordinary screenshot scale, not only zoomed inspection.
3. **Material response:** low-contrast timber grain along the desk, rough fabric/rubber, softer ivory plastic highlights, limited metallic edge response, frosted shell translucency, warm ceramic. Reuse procedural textures and shared geometry/materials. Avoid uniform glossy plastic, excessive noisy grain, emissive white plastic, or uniformly rounded cubes masquerading as finished equipment.

Keep olive-charcoal architecture, honey timber, cream equipment and restrained pastel key accents. The room should not become uniformly brown under a warm wash. Use a warm practical as the dominant local light, with restrained cooler/neutral fill to separate ivory, rubber and metal. Monitors carry the second visual emphasis; their faces should be luminous and individually identifiable without a white bloom. The music corner is a quieter third emphasis but must retain visible rack/pad separation.

Place visible practical fixtures where their illumination plausibly originates. Prioritise soft contact beneath monitor stands, keyboard, mug, desk feet and drum rack. Reuse the one static shadow-light strategy initially; adjust its coverage for the enclosed room, and add non-shadowing fill only where needed. No new postprocessing dependency or continuous animation is required. Tune exposure against actual captures; numerical light intensity is not a visual acceptance criterion.

## HTML chrome, reading and mobile

The enhanced room occupies the viewport behind a compact navigation layer. Retain existing type families and palette tokens: restrained sans-serif navigation, a small name/role identification, monospace numbering only where it helps. Reserve large Georgia titles for the reading surface. Remove the large hero column and the scene card/caption border in the enhanced layout.

Use a quiet top bar with identity and visible Work, About, Contact controls, and a compact bottom control area for look/reset/help. Keep controls legible on opaque or sufficiently solid dark backing; do not depend on whatever bright object happens to be underneath. Persistent text should be brief, for example “Drag to look · Select a screen”. A Work control opens an obvious text list of all three projects; this is the equivalent route when a screen is outside the current crop. Keep look buttons and Reset available to keyboard and touch users without a gaming HUD.

Monitor click opens the project's existing HTML evidence immediately over the retained room. There is no camera response. On desktop, use a comfortably readable panel around 40–46rem wide and a modest backdrop so the room remains recognisable around it; generous internal spacing matters more than decorative glass. Keep close visible and the panel independently scrollable. On mobile, prioritise a near-full-height reading sheet, 16px or larger body text, safe-area clearance and a minimum 44px close target. The preserved room may be only a small surrounding margin at 320px; do not compromise reading to expose more canvas.

Use the same physical eye position on mobile. Portrait framing shows a slice of the room, not a scaled-down desktop shot. Other monitors and the music corner remain reachable by bounded looking and direct HTML project selection. At 320px, use two compact control rows if needed; never squeeze text/targets below usable sizes. Vertical reading scroll must win inside the open panel. Look input belongs only to the unobscured scene; do not attach document-wide swipe interception. Architect/controller owners should define the touch gesture policy explicitly and verify vertical page scrolling in fallback states.

No idle camera motion, particles or light flicker. Direct look remains available with reduced motion; remove any optional settling/inertia. Focus visibility, modal semantics, focus return, Escape, history and direct fragments follow the accepted v2 brief and need runtime verification by the implementation owners.

## Visual acceptance gates

These are proposed review thresholds for actual renders, not claims that v2 already meets them. A failure of enclosure, basic composition or project readability blocks acceptance even if all interaction tests pass.

| Gate | Required evidence / threshold |
| --- | --- |
| Interior, not diorama | At 1440×900 and 390×844, room imagery reaches all viewport edges behind chrome. No bordered scene card, outer floor perimeter, visible cutaway, black outside void or fit-entire-room shot. No standing hero column. |
| Eye-level scale | Perspective visibly separates near desk, monitors and back wall. Home pitch is within 10 degrees of horizontal. At desktop home the central project face is at least 200 CSS px wide and each side face at least 90 CSS px wide; all three are unoccluded. Values are minimums, not a demand to distort equipment. |
| Mobile commitment | At 390px and 320px, central project face is at least 170 CSS px wide and the desk/keyboard remains recognisable. Other screens may crop. Full room fit is an automatic failure. Direct Work navigation exposes all projects without requiring a drag. |
| Authored depth | Home capture shows distinct foreground, equipment midground and architectural background. Right view clearly separates white keys, black keys, controller controls, drum pads, cymbals and connected rack; no instrument silhouette merges into an undifferentiated dark cluster. |
| Construction quality | At 1440px, visibly resolve at least five of: timber bevel/grain, keycap/case separation, monitor hinge/cabling, mic grille/mount, mug rim/handle, drum rim/clamp, controller controls. At mobile normal size, at least three remain discernible. Geometry counts do not substitute for this check. |
| Complete look cone | Capture home, left limit, right limit, up/down limits and four yaw/pitch corners at desktop and portrait ratios. Zero exposed background gaps, missing faces, floating contacts or camera intersections. Use an intermediate drag sample to catch holes between endpoints. |
| Restrained interface | Closed-state opaque chrome uses no more than about 20% of desktop viewport area or 25% on portrait. All controls remain readable and at least 44px where actionable; no overlap with the home central project screen. |
| Immediate reading | Capture before/select/open/close at a non-home orientation. Same camera pose before/after selection and close; matching project heading is visible in the next settled UI frame, with no intentional transition delay. No scroll-away from the retained room. |
| Atmosphere | Cream equipment, timber and dark rubber remain visibly different materials; monitor content and warm fixtures retain detail rather than clipping to featureless white. Both desk and music corner are legible without brightening screenshots after capture. |

Review required images at their actual CSS viewport size, not only enlarged crops: desktop home, music view and open project; 390×844 home/music/open project; 320px home/open project; enclosure boundary montage. Compare against v1 for scale and enclosure, and against Jesse for authored depth and coherent lighting only. Record a pass/fail and a short concrete reason per gate. Final artistic acceptance requires root/designer inspection of the new rendered images; this planning slice performs no runtime, performance or accessibility verification.

## Handoff and stop condition

Scene owner: camera-relative composition, enclosure, visible construction/material hierarchy. Controller owner: bounded orientation, selection/drag separation, keyboard/touch equivalents, no camera travel on project activation. HTML owner: compact chrome and accessible immediate reading, preserving one truthful content source and fallback. Preview owner: consistent screenshot matrix and measured look/idle/render/resource evidence. Resolve camera/model coordinates jointly before parallel implementation relies on them.

This bounded planning slice is complete when this document is delivered. Remaining risks are implementation-dependent: portrait cropping at extreme angles, practical-light balance in an enclosed room, foreground geometry revealed by the closer camera, and controller/UI gesture ownership. None requires changing the user's chosen experience or acquiring paid assets.
