# Studio v2 full-room kit — art direction and Blender production handoff

15 November 2026. Claude (actual), task `task_069e146abc59`, dispatch `ctx_8446c84f0a28`. No helpers, no overrides.

**Status: plan only.** Nothing was modelled, rendered, exported, generated, uploaded or spent. No Blender process, server or browser was started. No product, source or asset file was edited. This is not permission to build the kit: authoring waits for root's recorded pilot runtime approval. Nothing here is a visual approval or a product claim.

Companion files (mine): `asset-inventory.json` (machine-readable assets, materials, targets, budgets, stages) and `render-gates.md` (image gates). Not mine and not edited: `technical-plan.md`, `export-contract-proposal.json` (Codex).

## 1. What I read and looked at

Read: `.omx/specs/studio-v2/common.md` and `scene.md`, `.omx/plans/immersive-v2-agent-routing.md`, `.omx/plans/asset-authoring-addendum.md`, `.omx/context/immersive-v2-acceptance-checklist.md`, `.omx/context/studio-full-kit-technical-handoff.md`, `scene-art-direction.md`, `scene-runtime-art-report.md`, `asset-pipeline/art-production-plan.md`, `pilot-right-limit/pilot-report.md` with its provenance note, `scene-pilot-visual-critique.md`, `scene-generation-visual-critique.md`, `generation-execution-report.md`, `scene-coordination/contracts.md` and `runtime-contract.md`, `asset-pipeline/integration-contract.md`, and current `view-config.ts` and `build-studio.ts` in full. The PRD was only searched for gear and budget terms, not read end to end.

Images opened at normal size in this task (sha256 prefix, computed now):

| Image | Hash |
| --- | --- |
| `pilot-runtime-v01/home-1440.png` | `cc1d6a2a` |
| `pilot-runtime-v01/home-390.png` | `6efbbf62` |
| `pilot-runtime-v01/home-320.png` | `2867e36a` |
| `pilot-runtime-v01/music-1440.png` | `7f3b97fa` |
| `pilot-runtime-v01/music-390.png` | `b64aa8ec` |
| `pilot-runtime-v01/music-320.png` | `bfe2f969` |
| `pilot-runtime-v01/right-up-1440.png` | `9a881ae9` |
| `pilot-runtime-v01/right-up-390.png` | `a838e707` |
| `pilot-runtime-v01/right-up-320.png` | `dd0dc441` |
| `pilot-runtime-v01/right-down-1440.png` | `6161ce67` |
| `pilot-runtime-v01/right-down-390.png` | `dff7a2cf` |
| `pilot-runtime-v01/right-down-320.png` | `841bb3c0` |
| `pilot-right-limit/look-frames/frame-c-right-limit.png` | `cb203101` |
| `pilot-right-limit/meshy-raw/mouse-base-preview.png` | `fac5af23` |
| `pilot-right-limit/renders/v03-right-down.png` | `724aad5c` |

Not opened: the three `project-open-*` captures, the failure captures, the other v03 stills, any `early/` capture, the raw mouse GLB (hashed only, `6a92281b`).

**Snapshot binding.** The runtime captures are root's development-browser evidence at `build-studio.ts` `d8abf67f…`. The file on disk is now `e23588e2…` (runtime artist's first tuning pass, not yet recaptured). `view-config.ts` `1fea7adb…`, `textures.ts` `09f6ff6c…`, public GLB `2b9a4182…`. Lighting may change again. Every lighting number in this plan is therefore a reference to reconcile at milestone M6, not a value to copy now.

## 2. What the captures show (my own reading)

Works and is kept: the three screens wrapping the seat; warm timber against olive walls; pastel keycaps as the one saturated accent; hard rack shadows on the back wall grounding the kit; the tall phone crop of the music corner (drums, keys, lamp stack well at 390).

Problems the kit must solve, in the order I would fix them:

1. **Scale is inconsistent.** Measured from `build-studio.ts` at two units per metre: desk keyboard 0.815 m wide (2.6 times real), music controller 1.485 m (1.9 times), mug and mouse about 1.3 times, snowboard about 0.75 times, door and room true. In `home-1440` the mouse is two keycaps wide and the mug a little over two; real ones span three to four. In `right-down-1440` the 49-key controller reads as a stage piano. This is the main reason the gear looks like toy blocks in a real room.
2. **Required gear is hidden or absent at home.** At 1440 the headphones lie entirely under the project list; the white PC shows only as fan slivers along the bottom edge; the mic is a stack of dark blobs cut by the left edge. At 390 and 320 the home frame holds screens and keyboard only.
3. **320 crop.** The central bezel is cut on both sides and the screen's text touches the left edge. The keyboard is cut on the left at both phone widths.
4. **Forms are primitives.** Mouse is a slit cube; speaker a box with two flat rings; cymbals flat discs; pads plain cylinders; keys flat slabs; stools cylinders; monitor bezels thick and tablet-like; books cropped blocks.
5. **Flat surfaces.** Walls are one tone. Wall triangles are white cards with no core or falloff. In `right-up` at every width half the frame is near-black ceiling, and the beam undersides carry a saturated orange streak that matches neither door nor window frame.
6. **Three timbers.** Orange window frame, red beams, cooler brown door. The architrave merges with the wall and the knob is a black ball (both already addressed in the unrecaptured tuning).
7. **Lamp shade** has a burnt white disc (cause and fix are in the runtime artist's report; not re-litigated here).

Phones never see the door: yaw 58 plus half the phone frustum stops at the window. The right limit on phones is lamp and window.

The look frame teaches four things only: a light edge and a dark edge on every moulding, one dark trim timber with a lighter leaf, dark shade trims around a graded glow, and a soft pool on the wall behind a fixture. Its amber grade, photographic grain, glossy floor and layout are not followed. Walls stay olive and the cool dusk counterpoint stays.

## 3. Fixed and not reopened

Warm stylised eye-level interior. One fixed eye, bounded yaw and pitch, no walking, no camera response to selection. Three truthful project screens (`dissertation`, `copilot`, `typeforge`) plus one subordinate decorative screen. Immediate HTML reading. Orientation and input contract as frozen. Music rig on the right. No brands, logos, readable text, people, media, new hobbies or interactive props. Project content on screens comes from the runtime's existing content source, never from Blender.

## 4. Composition

### 4.1 Scale policy (proposed, pending choice P2)

Three tiers, each consistent inside itself:

| Tier | Factor | Applies to |
| --- | --- | --- |
| A | 1.0 | Architecture, door, window, furniture heights, stands, lamp, snowboard |
| F | 1.25 | Floor gear and instruments: PC tower, subwoofer, controller, pads, cymbals, pedals |
| D | 1.6 | Everything on the desk top |

Why 1.6 on the desk: the eye sits 1.14 m behind the desk edge, further than a seated person. The screens already equal 27-inch-class panels enlarged about 1.57 times. If keyboard, mouse, mug, notebook, mic, headphones and speaker share that factor, the whole desk reads as an ordinary triple-monitor setup seen from a normal seat. The keyboard drops from 0.815 m to 0.52 m and the mouse and mug grow slightly to match it.

Cost, stated plainly: keycap pitch on screen falls from about 29 px to about 18 px at 1440, and to about 12 px on phones. Caps stay readable as coloured sculpted caps; individual cap profiles are no longer legible on phones. Gain: the full keyboard, mouse and mug edge fit a 320 frame, and nothing looks like a toy. The controller at tier F is 0.99 m wide, two thirds of today.

### 4.2 Camera (proposed, pending choice P1; `view-config.ts` stays as is until agreed)

Pinhole arithmetic from the frozen eye, pitch keystone ignored; figures are in `asset-inventory.json` under `camera.arithmetic` and must be confirmed with the M1 blockout cameras before anyone changes a config value.

| Case | Bezel margin each side | Screen width |
| --- | --- | --- |
| Now, 320×844, FOV 64 | −28 px (cut) | 351 px |
| Now, 390×844, FOV 64 | 7 px | 351 px |
| FOV 70 only, 320×844 | −8 px (cut) | 313 px |
| FOV 76 only, 320×844 | 10 px | 281 px |
| **Proposed, 320×844, FOV 74** | **14 px** | 282 px |
| Proposed, 390×844, FOV 74 | 49 px | 282 px |
| Proposed, 320×568, FOV 74 | 62 px | 190 px |
| Proposed, 1440×900, FOV 58 | unchanged framing | 409 px (now 422) |

Any solution that shows the whole bezel at 320×844 gives a screen about 280 px wide; that is geometry, not a choice. The earlier idea of FOV 70 alone does not clear the bezel. The proposal splits the work between geometry and lens so neither is extreme:

- **Geometry (Blender):** central monitor set back 60 mm (group z −0.27 → −0.39 world) on its own stand; bezel lip 32.5 mm → 17.5 mm per side on all four monitors. Screen sizes and the other three screen positions unchanged. Desktop loses 3% of central screen width.
- **Lens (art-owned config):** `mobileFov` 64 → 74; `mobileHome` yaw −13 → −14 (monitor azimuth is −13.7°), pitch −8 → −7.
- Unchanged: eye, `desktopFov`, `desktopHome`, both bounds, near, far.

This is not whole-room fitting: one lens value for all phones, no per-viewport solve. The wider lens also lifts the pendant, cornice and first beam into the empty top third of the phone frame.

Alternative that needs S and Codex, not me: a horizontal-FOV floor in the controller so only very tall narrow viewports widen and 390 keeps 64. I am not defining a field for it. If P1 chooses it, the geometry half of my proposal still applies.

### 4.3 Reachable frusta

From the bounds and lenses, with margin for a 21:9 desktop and FOV 76 phones, everything inside **azimuth −95° to +115°, elevation −55° to +50°** from the eye must be finished. On the walls that means: left wall from the back corner to z = 3.4 world; right wall from the back corner to z = 5.6 (the strip past the door, reached only by ultrawide desktops, gets skirting, cornice, plaster light falloff and a switch plate, nothing more); ceiling from the back wall to z = 1.3 with two beams, cornice and the pendant canopy; floor from under the desk to z = 1.4, including the under-desk bay, which is in frame whenever the view tilts down. The shell stays a closed box, so no angle can show a void; the envelope decides where detail is spent.

Proof is one image: an equirectangular render from the eye with the envelope drawn on it (gate G1).

### 4.4 Required gear: where each must read

Chrome at 1440 covers top-left 24–307 × 24–82, top-right 1184–1416 × 24–78, bottom-left 24–390 × 682–876, bottom-right 1125–1416 × 730–876. Nothing required may have its only appearance under those rectangles.

| Gear | Change | Must read in |
| --- | --- | --- |
| Timber desk | Top 40 mm thick with eased edge and end grain | Every home pose |
| Compact frosted pastel keyboard | Tier D; whole board inside the 320 frame | Home at 1440, 390, 320 |
| White PC | Under the right bay, front 50 mm proud of the desk edge, glass side toward the seat, soft warm-white interior | Home 1440 bottom band; right-down |
| Mic | Sprung boom from a rear-left clamp, pale grille band; capsule clear of the copilot screen and above the project list | Home 1440; left look on phones |
| Headphones | On a small stand at the desk's right, between the typeforge stand and the speaker | Home 1440; music 1440 |
| Coffee | Mug right of the mouse, inside the 390 home frame if tier D is accepted | Home 1440 and 390; music |
| Mouse | 40 cm right of the keyboard centre line so it enters the 320 frame | Home at all three widths |
| Snowboard | True 1.5 m, leaning on the left wall near z = 0.3 world so its upper metre shows above the desk end; shelf raised to 1.75 m | Left look at 1440 and 390 |
| White 49-key controller | Tier F, brought to about 1.7 m from the eye and angled to the seat; should span at least 30° of azimuth in the music view | Music at all widths; right-down |
| Electronic drums | Sizes about as now; real pad, cymbal, rack, kick and hi-hat pedal forms | Music at all widths; home 1440 right edge |

These are blockout seeds. M1 places grey proxies and proves or changes them before any detailed modelling.

## 5. Asset language

**Not a copy of the primitives.** Each asset is designed as the object, then reduced: silhouette first, then the two or three features that identify it (binding straps, cymbal bell and edge lip, key fronts and gaps, fan rings behind a mesh front, shock-mount ring), then contact.

**One bevel family**, live as modifiers in the editable files and applied only on export, with weighted normals so bevels shade without doubling vertices:

| Class | Real radius | Segments |
| --- | --- | --- |
| Architecture and timber trim | 6 mm | 2 |
| Furniture and cabinets | 4 mm | 2 |
| Equipment casings | 2.5 mm | 2 |
| Hand-scale parts (before tier factor) | 1.2 mm | 1–2 |

Only screen faces and paper have sharp edges.

**Detail floor.** One pixel at the desk is about 1.9 mm of real size at 1440 and about 2.7 mm on phones. Features under 5 mm real at desk distance, or under 12 mm across the room, are omitted or exaggerated to that size. Round sections: 8 sides under 12 px on screen, 12 to 40 px, 16–20 to 120 px, 24–32 above.

**Contact.** Every supported object has feet, pads or a visible gap, plus a soft decal. Cables sag and have a tie point; no straight rods.

**Reuse.** Repeated parts are linked duplicates of one mesh: keycaps, piano keys, blind and panel slats, beams, rack clamps, pads, cymbals, bindings, leaves, wall lights, the two side monitors. Arrays, curves, bevels and mirrors stay live in the stage files.

**Native mouse.** Modelled from scratch: a symmetric pebble from a small subdivision cage, two button splits, wheel, glide feet, under 900 triangles. `meshy-raw/mouse-base.glb` may be linked read-only for its 10 : 6 : 3.5 profile; nothing of its shape or topology is adopted. The raw file, its preview and all provenance stay untouched. No further paid job is planned for any asset; headphones, bindings and plant are hand-modelled too.

**Pilot door and lamp** are carried into the kit by re-pointing their existing geometry to the shared library, adding hinges and a threshold. The pilot directory is read-only history.

## 6. Material, UV and texture library

Eleven materials for the whole room, defined once in `fk-00-library` and linked everywhere. Full table with images and byte budgets is in `asset-inventory.json`.

- `lib_palette` carries every flat-colour surface: plastics, rubber, ceramic, pastel caps, paper, and all metals. A 128 px colour atlas and a matching metallic-roughness atlas; each surface's UVs collapse onto a swatch centre. A swatch table in the library file is the single place a colour is changed. Metals are authored at metalness 0.6 or less because the runtime has no environment map (the pilot's fully metallic knob rendered black).
- `lib_oak` and `lib_dark_oak` share one grain strip with an end-grain block; the factor sets the tone. Dark oak is the only trim timber: beams, skirting, architrave, window frame, sill.
- `lib_plaster` and `lib_floor` use small tiling images multiplied by vertex colour. The vertex colour holds the room's light memory: pools behind fixtures, corner and ceiling darkening, the lit lower faces of beams.
- `lib_weave` is one greyscale cloth tinted per object by vertex colour: rug, mat, panel fabric, seats, speaker cloth.
- `lib_linen_shade` and `lib_glow` are the emitters. Every diffuser has a ramp with a core and a falloff, set so no face clips in the real renderer.
- `lib_frost`, `lib_glass`, `lib_contact` are the only blended materials.

No normal maps, no per-asset one-off materials, no baked lighting in base colour textures.

Texture plan: 177 kB and 0.74 megapixels in total, against a 300 kB texture allocation. The unallocated 123 kB is held for one of: a larger grain strip, a small ambient-occlusion sheet for the desk top, or nothing. It is not spent without a runtime capture showing the need.

## 7. What stays runtime-authored

| Runtime (Three.js) | Blender |
| --- | --- |
| Project display textures on the three targets and the fourth display | The quads they sit on, with a placeholder material |
| Border highlight materials and colours | Border quad geometry |
| Dusk pane texture (proposed) | The pane quad, frame, blind |
| All lights, the one shadow caster and its frustum | Emissive fixture geometry; a reference copy of the lights for previews only, never exported |
| Tone mapping, exposure, DPR caps, demand rendering | — |
| Occluder list, picking | `occluder`, `nocast`, `transparent` flags per mesh |
| Temporary response overrides by material name | Library base values |

The override table (today's `tunePilotMaterials`) should be empty by the end: at M6 every surviving override is folded back into the library and re-exported, so the Blender source is the truth. Light positions follow fixtures; if the kit moves a fixture, the runtime artist moves the matching light, and I supply the fixture centres in world units with each stage report. At most five point lights and one shadow caster.

## 8. Export geometry that must be exact

Art requirements for the technical mapper to freeze. Coordinates for each quad are in `asset-inventory.json` under `targets`, in Blender metres, for current and proposed placement.

- Nodes `target_dissertation`, `target_copilot`, `target_typeforge`: one planar quad each, four vertices, two triangles, UV covering the image once, upright from the front. Sizes 0.94 × 0.53 m and 0.40 × 0.67 m twice, unchanged.
- Nodes `border_dissertation`, `border_copilot`, `border_typeforge`: one quad each, parallel to its face, 4 mm behind it (now 2.5 mm), overhanging 10 mm per side (now 13.75 mm).
- The bezel lip surrounds the border and is flush with the face plane; the recess floor is 4 mm behind the border. The highlight reads as an inset line, and no opaque surface lies in front of a face. The wider gaps are for depth precision on phone GPUs.
- Fourth display: one quad, opaque blocker, no target or border. `display_studio` is my suggested name only.
- Faces and borders carry no modifiers and are excluded from blockers exactly as the existing contract says. Every other opaque mesh is a blocker, including emitters. Blended meshes (keyboard case, PC glass, contact decals) are separate nodes marked `transparent: true, occluder: false`.
- No opaque geometry other than listed foreground props crosses the pyramid from the eye to a face. Home pose stays 81 of 81 sample rays clear on all three.
- Opaque and blended parts of one object are never in one mesh.

I define no public field and change no target ID.

## 9. Budgets and tradeoffs

Whole-scene gates are unchanged: 1.5 MB compressed, 200 draws, 200k triangles, DPR caps, one shadow caster. Reference from root's pilot capture: procedural room plus pilot at home 1440 drew 125 calls and 98,876 triangles on the first frame.

| Quantity | Planned | Design ceiling | Gate |
| --- | --- | --- | --- |
| Placed triangles | 75,134 | 86,500 | — |
| Shadow-casting triangles | 50,418 | 52,000 | — |
| Peak rendered triangles (all in view plus shadow pass) | 125,552 | 138,500 | 200,000 |
| Exported mesh groups, main pass | 61 | 70 | — |
| Peak draws with shadow pass allowance of 60 | 121 | 130 | 200 |
| Unique triangles (drives bytes) | 57,144 | — | — |
| Textures | 177 kB | 300 kB | — |

Transfer allocation: scene JavaScript 330 kB reserved and **unmeasured**, geometry 720 kB, textures 300 kB, contingency 150 kB. The pilot measured about 12.7 gzip bytes per triangle once its PNGs are removed; at that rate 57k unique triangles is about 726 kB, right at the allocation. So geometry bytes, not triangles on screen, are the tight budget.

Consequences I am choosing rather than hiding:

- Linked parts should export as shared meshes so 18k repeated triangles cost no bytes. That needs adapter support Codex has not agreed. Fallback is merged copies at roughly 230 kB more, which would consume the contingency and the spare texture allowance.
- Bytes per triangle is re-measured on the first stage export at M1. If it is not under 12, stage triangle ceilings are cut pro rata, hand-scale gear last.
- Shadow-casting triangles are 2 k under the ceiling. If they exceed it, cables and under-desk parts stop casting before any hero prop does.
- Post-export geometry quantisation or compression would relieve the byte budget. Whether to allow it is Codex's and root's call; I assume it is not available.
- If the JavaScript reserve proves too small, the answer is fewer unique triangles in M4 and M5, not looser gates.

## 10. Milestones and host memory

Seven stages, each a separate editable file kept forever with a version tag and never overwritten: `fk-00-library`, `fk-10-arch`, `fk-20-workstation`, `fk-30-nearfield`, `fk-40-music`, `fk-50-walls`, `fk-90-assembly`. Stage files link the library; the assembly links the stages. Each stage also keeps its build script. Details, dependencies and outputs per stage are in `asset-inventory.json`.

Order within every stage: build → save editable file → export stage GLB → structural check → **then** optional previews → report and stop.

Rules, drawn from the pilot's low-memory kill:

- One Blender process at a time, hidden, factory startup, as in the pilot. Check free memory first; under 5 GB free, wait and report. Never stop anyone else's process, including WSL.
- Export never depends on a render.
- One camera per process. First previews 720×450 (or half-size phone frames), CPU, 16–24 samples, time limit 300 s set inside Cycles so a slow frame ends itself with fewer samples.
- At most three full-size stills per stage (1440×900 or a phone size), 48 samples, 900 s limit, each its own process, only after the previews look right.
- No all-angle batch at full size, ever. No persistent render data, bounces capped at 3, six threads.
- Vertex-colour light bake is per object, architecture only, draft at M1 and final at M6.

Blender stills show direction only. Root owns every runtime capture, and only those can pass a look gate.

## 11. Dependencies, risks and pending choices

| ID | Item | Owner | Measurable deliverable |
| --- | --- | --- | --- |
| D1 | Pilot runtime approval before any authoring | Root | Recorded verdict on the recapture of `e23588e2…` |
| D2 | Full-kit profile, validator and loader path (the pilot loader accepts nine named meshes only; `pilotRoot` would duplicate the room) | Codex, S | `technical-plan.md`, `export-contract-proposal.json`, validator exit 0 on the M1 stage GLB |
| D3 | Shared-mesh export for linked parts | Codex | Stated yes or no before M2; M1 byte ledger with both figures |
| D4 | Vertex colour accepted on imported meshes | Codex | Stated yes or no before M1 bake; else plaster falls back to runtime lights only |
| D5 | Target and border separation and naming frozen | Codex, S | Contract entry before M2 |
| P1 | Phone framing: my geometry plus FOV 74, or a controller horizontal-FOV floor | Root with S | M1 phone cameras at FOV 64, 70, 74, 76, side by side |
| P2 | Scale tiers versus prototype sizes | Root, independent Claude critic | M1 blockout pair, prototype sizes and tier sizes, at home 1440, 390, 320 |
| P3 | Dusk pane runtime-authored or embedded image | Codex, S | Contract entry before M1 export |
| P4 | Material calibration: a small swatch-board GLB captured once in the real renderer, or calibration from the pilot recapture only | Root, Codex | One runtime capture of the board, or a written decision to skip |
| P5 | Environment map for metals | Runtime artist, Codex | A/B runtime capture at home 1440; default is none |
| R1 | Geometry bytes exceed allocation | Me | M1 bytes-per-triangle figure; revised stage ceilings |
| R2 | Low memory during previews | Me | Every preview's `RenderTime` under its limit; no killed process |
| R3 | Blender look does not survive ACES 1.2 with no bounce | Me, runtime artist | Override table length at each runtime capture, zero at M6 |
| R4 | Lighting tuning on disk changes after this snapshot | Runtime artist | Reconciliation note at M6 naming the then-current hash |
| R5 | Smaller keyboard loses the keycap hero read | Me | Keycap pitch at least 16 px at 1440 and 11 px at 320 in the M3 runtime capture; else P2 reopens for the keyboard alone |
| R6 | Interface chrome covers required gear | U lane through root | Section 4.4 table checked on root captures at all three widths |

## 12. Boundaries I am reporting upward

- The camera proposal changes `mobileFov` and `mobileHome` (mine to propose) and moves one target face 60 mm (art geometry that Codex's picking tests and the technical handoff currently record as fact). Neither is applied.
- Node names `display_studio` and `rt_window_dusk`, the `transparent`/`occluder` use on blended parts, shared-mesh export and vertex colour all touch the export contract. They are requests to the Codex planner, not definitions.
- The scale policy changes how every prop sits against the interface chrome; overlap fixes in the interface itself belong to the U lane.
