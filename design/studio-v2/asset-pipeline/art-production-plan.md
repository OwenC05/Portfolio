# Studio v2 — art production plan (Claude art performer)

14 November 2026. Task `task_c30114efce0d`, dispatch `ctx_273c4f631d3a`. Design-only plan. Nothing was generated, uploaded, purchased, rendered or executed, and no source file was edited. This is not asset approval or product acceptance; root owns the revised durable plan and tool preflight.

## 0. Inputs and what I actually inspected

- Read: `scene-coordination/asset-production-task.md`, `scene-visual-critique.md` (independent, REQUEST CHANGES), `asset-pipeline/runtime-audit.md` (Codex), my own `scene-art-report.md` and `scene-art-direction.md`.
- Images I opened in the previous task and rely on here: `.omx/artifacts/visual-ralph/portfolio-immersive-v2/early/` `initial-1440`, `right-1440`, `top-390`, `right-390`, `top-320`, `left-up-1440`, `left-down-1440`, `right-up-1440`, `right-down-1440`. I have still not opened the three `panel-*` or four `*-320` corner captures; for those I rely on the critic's written findings.
- **Private room photo: not inspected.** I did not locate it and did not search for it; `.omx/context/references-after-hours-v1/` holds only third-party site screenshots. This plan does not depend on it.
- Prototype rollback point (unchanged): `build-studio.ts` `364da680…fb1ec3`, `textures.ts` `09f6ff6c…9c63aa6`, `view-config.ts` `1fea7adb…f1a450`.

Fixed and not reopened: warm stylised personal studio, fixed eye with bounded look, no camera movement on selection, immediate HTML project reading, white music keyboard and electronic drums on the right, three project screens plus one subordinate decorative screen, no invented personal claims or new hobby props.

## 1. Prioritised deficiencies

Sources: **R** = seen by me in root captures, **C** = independent critique measurement.

| # | Deficiency | Kind | Source | Blocking |
| --- | --- | --- | --- | --- |
| 1 | Right limit reads near-black: door and right wall mean luminance about 5 against about 25 on the left wall; right ceiling 78% of pixels below 10 | Light | R, C | Yes |
| 2 | Door inset panels are black surfaces with stretched corners, reading as holes or screens | Model + material | R, C | Yes |
| 3 | Floor-lamp shade clips to a flat white patch (21% of crop); wall triangles are featureless cream cards | Material + light | R, C | Yes |
| 4 | 320×844: central screen bezel cut on both sides; under 20 px margin at 390 | Framing | R, C | Yes |
| 5 | No clean 320 home capture (veil over canvas), no 390 corners, no mid-edge extremes, no 4:3 desktop | Missing evidence | C | Yes, for any look-cone claim |
| 6 | Walls are one flat olive tone; top third of mobile home is empty wall | Material + light | C | Should |
| 7 | Metals read as grey paint (no reflection source) | Material | R, C | Should |
| 8 | Mouse is a notched box; cymbals flat discs; kick and pedals not readable | Model | R, C | Should |
| 9 | Desk timber is a uniform streak, no end grain; scaled rounded boxes give uneven bevels on bezels and acoustic panels | Material + model | R, C | Should |
| 10 | Little local colour spill from fixtures onto nearby surfaces | Light | C | Should |
| 11 | Project list covers the keyboard and mic base at desktop home, and the white keyboard at 390 right view; Projects button under look controls at 320; hint pill on door knob | UI (U lane, not mine) | C | Route to root |

Items 4 and 5 are not solved by assets. Item 4 needs either `mobileFov` 70 (mine) or a controller-side horizontal-FOV floor (Codex); the Blender cameras in section 4 let that be judged before integration. Item 5 is root's capture work.

Keep, per critique: fixed eye and bounds, wrapped three-screen arrangement, keycap construction, controller-on-stand silhouette, left-wall vignette, warm/cool split with the dusk window. I am not proposing further procedural Three.js polish.

## 2. Higgsfield look frames (drafts, not run)

Purpose: fix the target look for materials and light before modelling. These are paintings of intent, not geometry sources; the room layout stays as built.

Shared style anchor, appended to every prompt:

> Stylised 3D illustration, clean hand-modelled forms with soft bevels, matte painted materials with gentle roughness variation, warm tungsten practical lighting with one cool dusk-blue counterpoint, olive-charcoal plaster walls, honey oak timber, ivory plastic, dark rubber, brushed pale metal, smoked floorboards. Cosy after-hours home studio, lived-in but tidy. Soft contact shadows, light pooling on walls, no bloom blowout. No people, no logos, no brand names, no readable text, no neon, no cyberpunk, no photorealism, no fisheye, no exterior view, no cutaway or dollhouse, no extra instruments, no posters of real artwork.

| Frame | Aspect | Prompt body |
| --- | --- | --- |
| A. Desk home | 16:10 | Eye-level seated view about one metre from a honey oak desk whose front edge runs off the bottom of the frame. A wide landscape monitor centred slightly left with a portrait monitor angled inward on each side and a smaller monitor raised above the centre one; dark screens with faint warm UI glow. Foreground: compact keyboard with tapered ivory keycaps and a few pastel pink, sage, blue and yellow caps in a frosted translucent case, on a dark felt desk mat; ivory mouse; ceramic mug on a round timber coaster; notebook with pen. Left edge: black boom microphone with shock mount, cropped. Above: slim black linear pendant with a warm diffused strip. Right background: five triangular warm wall lights with visible diffuser texture and soft falloff, slatted acoustic panels, the edge of an electronic drum kit. |
| B. Music corner | 16:10 | Same room, looking about 45 degrees right. Lower midground: white 49-key keyboard controller with timber end cheeks on a black X-stand, round stool in front. Behind it: compact electronic drum kit with mesh pads with pale rims on a metal tube rack, three dark rubber cymbals with visible bells and edges, kick pad and pedal. Three slatted acoustic panels on the back wall. Right: floor lamp with a linen drum shade showing fabric weave and a gradient from warm core to darker rim; window with timber frame and half-drawn ivory blind over a deep blue dusk skyline with a few lit windows. Rug under the instruments. |
| C. Right limit | 16:10 | Same room, looking right and slightly up at the corner where the right wall meets the ceiling. A closed timber panel door with two recessed moulded panels and a brass knob, lit by the floor lamp so grain and mouldings read; dusk window to its left; exposed dark timber ceiling beams catching warm light; plaster wall with soft light pooling. Nothing in this view falls to black. |
| D. Portrait home | 9:19.5 | As frame A, cropped to a tall phone view centred on the landscape monitor with its whole bezel inside the frame and clear margin each side; raised small monitor above, keyboard and desk edge below; wall above shows plaster variation and pendant glow rather than a flat tone. |
| E. Prop sheet (per Meshy asset) | 1:1 | Single object, three-quarter view, centred on a plain mid-grey seamless background, soft even studio light, no shadow clutter, whole object in frame. Object description from section 3. Same style anchor. |

References needed: none are required for A–D as text prompts. If image conditioning is wanted for layout fidelity, the only suitable references are **chrome-free canvas renders of the current prototype**. Root's existing captures show the owner's name and project titles in the interface, so sending them to an external service needs explicit user approval or a chrome-free recapture. **The private room photo must not be used as a reference unless the user explicitly permits that specific upload**; I have not seen it and have assumed it is unavailable.

Acceptance of look frames is by eye against section 1: does C show a finished, lit door; do the fixtures in A and B show form. Generated frames that add instruments, text, brands or change the screen count are discarded, not adapted.

## 3. Asset allocation

Rule: anything whose dimensions are shared with code, repeats on a grid, or must stay planar is modelled precisely in Blender. Meshy is for organic or fiddly single props where a base mesh saves time and exactness does not matter. Every Meshy mesh is cleaned in Blender and wears the shared Blender materials, so I plan **untextured base meshes** rather than Meshy textures: mixed generated textures are the fastest way to lose a consistent look.

### Precise editable Blender modelling

| Piece | Why precise | Notes |
| --- | --- | --- |
| Room shell, skirting, cornice, beams | Must enclose every reachable ray; dimensions are in the controller's world | Inward-facing single-sided faces; lightmap-friendly UVs for wall light pooling |
| Door, frame, knob | Blocker 2; needs true moulding profiles | Recessed panels with bevelled mouldings in the door's own timber |
| Window, blind, sill | Emissive dusk plane and slat array | Array modifier for slats |
| Desk slab, legs, mat | Hero foreground; true bevel and end grain | UVs aligned to grain; separate end-grain island |
| Four monitors with stands | Screen faces are the selectable targets and must remain flat, front-facing quads of known size | Faces exported as separately named single quads; bezels with true-radius bevels |
| Desk keyboard | Keycap grid and case are the best-reading detail; keep | One keycap mesh instanced; legends optional |
| Music controller keys, pads, knobs, X-stand | Key grid must be regular; "white keyboard" is a requirement | Instanced white and black keys |
| Drum rack tubes, clamps, pad shells | Tube rack is straight parametric geometry | Curves with bevel, converted on export |
| Pendant, wall triangles, floor lamp | Blocker 3; shade form, diffuser and edge profile are the point | Shade as a thin shell with seam; emissive kept below clip |
| Shelf, books, print, speaker, subwoofer, tower | Simple boxes with true bevels | Tower fans instanced |

### Meshy base mesh, then Blender cleanup

| Piece | Why Meshy | Cleanup |
| --- | --- | --- |
| Mouse | Organic shell; weakest desk object | Retopo to under 1.5k tris, add wheel, scale to 0.10 m long |
| Headphones | Curved band and cups | Symmetrise, under 3k tris |
| Microphone capsule with shock mount | Fiddly basket and elastic cradle | Keep boom arm as Blender tubes; under 3k tris |
| Cymbal (one, instanced three times) | Bell and edge curvature | Lathe-clean; under 800 tris |
| Kick pad with pedal | Mechanical clutter the prototype lacks | Under 3k tris |
| Plant | Organic | Under 2k tris; single leaf material |
| Snowboard bindings (pair) | Straps and highbacks; board deck itself stays Blender | Under 2k tris each |

Cleanup common to all Meshy output: apply scale in metres, origin at ground contact, +Y forward in Blender before export; remove internal faces and floaters; quad-dominant retopology or decimate with normals preserved; one UV set; no baked lighting in base colour; replace generated materials with the shared library. Any mesh that needs more than about an hour of repair is remodelled by hand instead.

Root's handoff figures, not verified by me: Meshy balance 75 credits, 5 per smart-topology mesh, 15 textured. On those figures seven untextured meshes cost 35 with room for retries; textured generation would exhaust the balance after five. Any run needs a current quote and explicit approval.

Root also reports the hosted `/3d-jutsu` blocking tool imports only catalogue GLBs. I therefore plan the **local Blender file as assembly master** and assume nothing about custom uploads to hosted tools.

## 4. Editable Blender workflow

File and paths follow the Codex audit: master `design/studio-v2/asset-pipeline/studio-v2.blend`, review export `asset-pipeline/exports/`, approved web artifact under `public/studio/` only after the gates in section 7.

1. **Scale and axes.** Author in metres, Z up. Mapping from the prototype's world (two units per metre, Y up, floor top at y 0.11): Blender `(X, Y, Z) = (x/2, −z/2, (y − 0.11)/2)`. The floor is Z 0. The integration adapter applies one uniform scale of 2 and a +0.11 y offset; the glTF exporter's Y-up conversion is the only axis change. Room interior in Blender: X −2.25…2.55, Y −3.30…1.06, Z 0…2.595.
2. **Cameras as the contract.** One camera object per capture pose, all at the eye `(-0.35, -1.70, 1.345)` m, vertical sensor fit: `home-desktop` (yaw −4, pitch −6, FOV 58, 1440×900), `music` (+44, −8), `left-up`, `left-down`, `right-up`, `right-down` (±limits −38/58 and −16/12), `home-390` and `home-320` (yaw −13, pitch −8, FOV 64, 390×844 and 320×844), plus `home-320-fov70` to judge blocker 4. Yaw is rotation about Blender Z, negative Z-rotation for positive yaw. These values are copied from `view-config.ts`; if either side changes them, both change together through root.
3. **Collections.** `ARCH`, `DESK`, `SCREENS`, `MUSIC`, `LEFT_WALL`, `RIGHT_WALL`, `LIGHT_FIXTURES`, `MESHY_RAW` (untouched imports, excluded from export), `CAMERAS`, `LIGHTS`. Reused objects are linked duplicates so one edit propagates.
4. **Shared material library.** About twelve Principled materials named to match the prototype palette: plaster, ceiling, floorboard, honey oak, dark oak, ivory plastic, cream ceramic, rubber, felt, brushed metal, brass, pastel accents, plus emissive warm and dusk. No per-asset one-off materials. Roughness variation and timber end grain come from small tiling textures authored locally.
5. **Light.** Fixtures first: pendant, triangles and floor lamp each get a real emitter and a matching Blender light; the dusk window a cool area light. Add a fill for the right wall and door until they sit in the left wall's tonal range. Wall light pooling and contact darkening are baked to a lightmap or vertex colour for architecture only, so they survive export; small props rely on the runtime's one shadow light and contact planes. Emissive strengths are set so no fixture face clips in the Three.js renderer, not in Blender.
6. **Render comparison.** Viewport/EEVEE stills from every camera at the capture resolutions, saved beside the matching root capture for side-by-side review. Blender renders are direction checks only: the runtime uses ACES at exposure 1.2 with one shadow light, so Blender output is never acceptance evidence.
7. **Export boundary.** glTF 2.0 binary, Y up, PNG/JPEG textures, no Draco, Meshopt or KTX2 until decoders exist. Named nodes the adapter depends on: `target_dissertation`, `target_copilot`, `target_typeforge` (single quads), `border_*`, and `occluder`/`nocast`/`transparent` custom properties. Lights are not exported; the runtime keeps its own. Codex owns the loader, async readiness, resource ownership, picking adapter and budgets. I own what it looks like.

## 5. First pilot: the right-limit pair (door and floor lamp)

Chosen because it addresses blockers 1, 2 and 3 in one frame, exercises the whole Blender → GLB → runtime look path, and **costs no credits**.

- **Build:** in Blender only, the door (slab, two recessed moulded panels, frame, brass knob) and the floor lamp (base, pole, linen shell shade with seam, inner emitter), placed at their prototype positions inside a plain shell, with the fill light from section 4.
- **References:** none external. Prototype captures `right-up-1440.png` and `right-down-1440.png` as the before images. Higgsfield frame C would help as a look target but the pilot can proceed from this written description without it.
- **Deliverables:** `pilot-right-limit.blend`; meshes and local textures; Blender stills from `right-up`, `right-down` and `music` cameras; one isolated turnaround of each object on grey; a GLB export candidate; and, once Codex can load it, root captures of the same three poses in the real renderer beside the prototype captures.
- **Pass:** in the real renderer at `right-up` 1440×900, door and right wall mean luminance within the left wall's range (critic's figure about 25, against about 5 now); panel mouldings and grain visible at normal size without brightening; lamp shade shows a gradient and seam with under 2% of its crop at all channels ≥250; knob and frame read; nothing floats or z-fights; the independent Claude critic judges the pair an improvement over the prototype frames.
- **Fail:** door still reads as dark slabs, shade still clips, or the GLB looks materially different in the runtime from the Blender still in ways the material library cannot correct. A fail stops asset work and returns to this plan, not to more generation.
- **Stop:** after the pilot's captures are reviewed. No Meshy or Higgsfield spend, and no further modelling, until root records the result.

First paid step, only after the pilot passes and separately approved: one Higgsfield look frame (C or A) and one Meshy untextured mesh (the mouse), each with a current model and cost quote.

## 6. Tool visibility in my runtime

Checked with tool search, `claude mcp list` and read-only filesystem listing.

| Tool | What I can actually reach |
| --- | --- |
| Higgsfield | **Absent.** No Higgsfield tool, skill or connector is listed in this session. |
| Meshy | **Absent.** No Meshy tool, skill or connector; no credential checked. |
| Blender | **No connector.** No `mcp__blender__*` tool exists in my session (the Codex audit's host-status call is from its runtime, not mine). `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe` exists on disk and `blender` is not on PATH; I did not execute it. I could drive it headlessly through the shell if assigned, but that is unverified here. |
| Other | A Figma connector offering paid image generation is connected; it is not part of the requested pipeline and I did not use it. Local image reading works. |

So in this runtime I can write prompts, specifications and Blender scripts, and review images. I cannot generate Higgsfield frames or Meshy meshes, cannot confirm balances or prices, and have no live Blender session. Those need root's runtime or tools granted to me.

## 7. Render gates before GLB integration

1. **Isolated asset:** grey-background turnaround per asset beside its prototype counterpoint; correct scale against a 1 m reference; shared materials only.
2. **Blender room pass:** stills from every camera in section 4; no camera shows black regions, missing faces or clipped fixtures. Direction check only.
3. **Runtime candidate pass:** the GLB loaded in the real renderer on a branch that leaves the procedural prototype intact, captured by root at 1440×900, 390×844 and 320×844 home, the music view, all four corners at each width, the mid-edge extremes and one 4:3 desktop, with any transition veil cleared before capture.
4. **Before/after:** each candidate capture beside the matching `early/` capture.
5. **Independent judgement:** a Claude critic distinct from me reviews those images at normal size against section 1; Codex separately checks picking, occlusion, lifecycle and measured draw calls and triangles from `renderer.info`.
6. **Replacement:** only after 3–5 pass does the GLB replace procedural pieces. Until then the hashes in section 0 are the rollback.

Not acceptable as evidence: polygon counts, Blender renders, source review, or my own approval of my own assets.

## 7a. Addendum: compatibility and concept-board / asset-kit methods

Added after root's follow-up `msg_8ae1b8278a94`, following `worker_done`. No new tool use.

- **Stack:** this plan assumes the existing Next 14 / React 18 / Three 0.187 app throughout. The only runtime artifact is a static GLB plus PNG/JPEG textures under `public/studio/`, loaded by the bundled `GLTFLoader`. It needs no managed site, no framework migration and no new dependency. I have not seen the Higgsfield website builder and make no claim about it; nothing here requires it.
- **Concept board, as a method:** one board per view (frames A–D in section 2), each kept as a small set: the chosen look frame, the matching prototype capture, and a three-line note on what must carry over (light direction, fixture form, material response). Geometry never comes from the board. A board is useful only if it resolves a listed deficiency; otherwise it is dropped.
- **Asset kit, as a method:** treat the room as a kit of about thirty named assets in the Blender collections of section 4, each with a one-line spec (real-world size, triangle ceiling, materials from the shared library, owner: Blender or Meshy). The kit list, not generated imagery, is what gets approved and costed. Prop sheets (frame E) are the only images that feed Meshy.
- **What a hosted builder could usefully contribute, if root finds it does:** still look frames and prop-sheet images exported as plain files. Anything it produces as a site, layout or runtime is out of scope for this plan.

## 8. Approvals and dependencies still open

- User or root approval for any Higgsfield or Meshy run, each with a current quote.
- Explicit user permission before any image showing the owner's name, or the private room photo, is sent to an external service.
- Tool access for whoever executes: none of the three tools is reachable from my session.
- Root's decision on the pilot, and on who runs Blender (script through shell, or live connector once connected).
- Decision on blocker 4 (`mobileFov` 70 versus controller-side floor) once the two 320 cameras can be compared.
- Root's clean recaptures (blocker 5) and routing of the interface overlaps to U.
