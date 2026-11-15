# Studio v2 — independent S visual critique (Claude)

14 November 2026. Task `task_f22b9f34a63c`, dispatch `ctx_415196bb96df`, actual `--agent claude`, no model/effort override, no helpers. Reviewer is distinct from the Claude art author (`task_db6c9a1e00a2`).

**Status: review complete. Verdict on the current procedural scene: REQUEST CHANGES (two gates), as a prototype baseline only.**

Per coordinator steering `msg_e8383217ef4d`, the user now wants Higgsfield/Blender/Meshy asset authoring before further Three.js refinement. This report therefore records the current scene as the **prototype baseline** and lists what the next phase must improve. No PASS below is product acceptance, and I am not requesting source changes from any current worker. Report only: I edited no source, ran no browser, server or build, and started no asset tools.

## Source binding

Current files hashed by me (SHA256) match the snapshot under review; no drift.

| File | Hash | Match |
| --- | --- | --- |
| `scene/build-studio.ts` | `364DA680…FB1EC3` | yes |
| `scene/textures.ts` | `09F6FF6C…9C63AA6` | yes |
| `scene/view-config.ts` | `1FEA7ADB…11F1A450` | yes |

Root's `early/source-hashes.json` lists the same model and texture hashes. Model file mtime 22:51:00 UTC precedes every capture (22:53:05–22:57:01). I did not observe the capture process, so pose values (eye, yaw, pitch) are root's reported values, not my measurement.

## Images actually inspected

All opened with the image reader at native pixel size. Pixel statistics were computed from the same PNGs; enlarged crops were used only to confirm details already visible at normal size.

| Image | Size | Scope |
| --- | --- | --- |
| `early/initial-1440.png` | 1440×900 | Desktop home |
| `early/right-1440.png` | 1440×900 | Desktop music look (root: yaw 36) |
| `early/panel-1440.png` | 1440×900 | Desktop open project |
| `early/top-390.png` | 390×844 | Mobile home |
| `early/right-390.png` | 390×844 | Mobile right look, project list open |
| `early/panel-390.png` | 390×844 | Mobile open project |
| `early/top-320.png` | 320×844 | Narrow home — **hazed capture, see below** |
| `early/panel-320.png` | 320×844 | Narrow open project |
| `early/left-up-1440.png`, `left-down-1440.png`, `right-up-1440.png`, `right-down-1440.png` | 1440×900 | Four look-cone corners (root: yaw −38/58, pitch −16/12) |
| `early/left-up-320.png`, `left-down-320.png`, `right-up-320.png`, `right-down-320.png` | 320×844 | Four corners, narrow |
| `early/initial-390.png` | 390×844 | Opened only to confirm it is the retained earlier attempt; hazed, not used for any verdict |
| `portfolio-after-hours-v1/final-first-1440.png`, `final-first-390.png` | 1440×900, 390×844 | v1 comparison |
| `.omx/context/jesse-reference-entry-20261114.png`, `jesse-reference-look-20261114.png` | 1280×720 | Depth/light reference only |

## Evidence not available

- No corner captures at 390 wide; corners exist only at 1440 and 320.
- No mid-edge extremes (yaw limit at home pitch on the left, pitch limits at home yaw) and no intermediate poses. Corners bound the cone but do not show everything inside it.
- No 1024×768, landscape phone, or 320×568 captures. The art report's 226 px central-screen figure is for 320×568; the capture is 320×844, which frames differently.
- No clean 320 home capture (see haze).
- All captures are dev-server, desktop-browser responsive viewports at DPR 1. Nothing here is production, touch-emulated, physical-device or GPU evidence.

## Gate verdicts (prototype baseline)

| Gate | Verdict |
| --- | --- |
| 1. True interior at human eye level; no miniature, slab or void | PASS |
| 2. Close desk and keycap construction; large useful monitors; near/mid/far depth | PASS |
| 3. Right white keyboard and drum geometry; distinct surfaces and supports | PASS |
| 4. Warm atmosphere; ivory/timber/rubber/metal distinction; readable equipment | PASS, with weaknesses carried to the next phase |
| 5. No clipped-hot fixtures, no featureless dark gear | **REQUEST CHANGES** |
| 6. Mobile 390/320 commitment rather than whole-room fit | 390 PASS; 320 **REQUEST CHANGES** |
| 7. Normal-size detail and current framing | PASS for the scene; interface overlap notes routed below |
| 8. Complete finished look cone | Left half PASS; right limit **REQUEST CHANGES**; interior of the cone unverified |

### 1. Interior at eye level — PASS

`initial-1440`: the desk edge runs off the bottom of the frame, monitors sit at eye height, and wall, shelf and fixtures surround the view. All eight corner captures show continuous walls, skirting, cornice, ceiling beams and floor; none shows an exterior, a floor slab edge or an unmodelled gap. Against `final-first-1440` (a small diorama inside a bordered card beside an editorial column) the change in kind is unambiguous.

### 2. Desk, keycaps, monitors, depth — PASS

- Keyboard: individually separated tapered caps in staggered rows, a long spacebar, pastel accent caps, and a translucent case lip, all legible at normal size in `initial-1440` and `left-down-1440`.
- Monitors: the central screen is about 430 px wide at 1440 with its title and three diagram boxes readable; the side screens are angled inward and their headings read.
- Depth: microphone and mug in the foreground, screens in the midground, wall lights, acoustic panels and kit behind.
- Weak points (not blocking): the mouse reads as a white box with a notch rather than a mouse; desk timber grain is a uniform horizontal streak with no end grain or wear.

### 3. Music corner — PASS

`right-1440` and `right-down-1440`: ivory white keys with grouped black keys, timber end cheeks, an X-stand with a centre pivot and floor feet, a tripod stool, drum pads with pale rims on a metal rack with clamps, crossed sticks on the snare pad, three cymbals on stands. Each object stands on a visible support and casts a contact shadow on the rug. Weak points: cymbals are flat black discs; no kick pad or pedals are visible; the kit's wall shadow merges with the lower pads in `right-1440`.

### 4. Atmosphere and materials — PASS with weaknesses

Warm key light with a cool window counterpoint is clear. Timber (desk, beams, window frame), ivory (keys, caps, mug), dark rubber (pads, mat) and pale metal (rack, lamp pole) are distinguishable. Weaknesses:

- Walls are one flat olive tone over large areas. In `top-390` roughly the top third of the frame is undifferentiated wall.
- Metals have no reflections and read as matte grey paint.
- Light does not visibly colour nearby surfaces beyond a soft glow on the wall behind the triangles and lamp. The Jesse reference gets its authored look from strong local colour spill; this scene has little.

### 5. Fixtures and dark gear — REQUEST CHANGES

Measured from the PNGs (luminance 0–255):

| Region | Image | Finding |
| --- | --- | --- |
| Floor-lamp shade | `right-1440`, `right-up-1440` | 21% of the shade crop has all channels ≥250: a flat white patch with no shade form |
| Wall triangles | `initial-1440`, `right-1440` | 18–22% of the crop has the red channel at 255; faces are uniform cream cards with no falloff from centre to edge. Not white-clipped (0.03% all-channel ≥250), but featureless — unchanged in character from v1 |
| Pendant strip | `initial-1440` | 9% all-channel ≥250 on the tube itself; acceptable for a bare emitter |
| Door and right wall | `right-up-1440` | Mean luminance 5.7; 84% of pixels below 10 |
| Door inset panels | `right-up-1440`, `right-down-1440` | Mean 3.3–3.5; 94% below 10. Brightening the crop ×8 reveals timber grain on the door stiles but **nothing** in the panels — they are black surfaces, not merely underlit |
| Ceiling, right side | `right-up-1440` | 78% below 10 |
| Whole frame | `right-up-1440` / `right-down-1440` | 23% / 18% of all pixels below 10, against 2–4% in the home and left views |

The door panels read as two black screens or holes in the wall. The speaker, subwoofer and cymbals are dark but keep readable edges and are acceptable.

### 6. Mobile — 390 PASS, 320 REQUEST CHANGES

- `top-390`: committed crop on the central screen, raised fourth screen and keyboard; side screens are intentional slivers. The central bezel clears each edge by under 20 px, so there is little margin.
- `top-320`: the central screen is wider than the viewport. Its bezel is cut on both sides and the "SELECTED WORK" label starts at the left pixel column. Without a visible frame it reads as a dark band of text rather than a monitor. The crop commits, but it has lost the object.
- **Haze in `top-320` is a capture/interface artefact, not model lighting.** The image contains no pixel below luminance 20 and its 95th percentile is 109, whereas the clean `top-390` and all four 320 corner captures (taken later, same source) have blacks at 9–19 and highlights at 120–211. The header and control chrome are crisp while everything in the canvas is uniformly veiled, which is what a translucent layer over the canvas or a canvas mid-fade produces. `initial-390` shows the same veil. Consequence: `top-320` is usable for framing only; there is no valid 320 home evidence for light or material.

### 7. Detail and framing — PASS (scene)

Desktop home is well composed: screens centred, triangles and kit leading right, microphone cropped on the left as a foreground element (works). `left-up-1440` and `left-down-1440` are finished compositions in their own right (print, shelf with speaker, plant and books, snowboard, wall socket, desk leg, subwoofer).

### 8. Look cone — left PASS, right limit REQUEST CHANGES

- Left corners at 1440 and 320: finished, lit, no clipping or holes.
- Right corners: enclosed and modelled, but dominated by the dark door, wall and ceiling described under gate 5. At 320 the right corners frame the lamp, window and keyboard and avoid the door, so they pass; the defect is a wide-viewport one.
- I do not claim the full cone passes: only corners and two interior poses were evidenced.

## Interface observations (for S to route to root/U; not scene defects, not my authorship)

1. Desktop home: the project list covers the left third of the keyboard and the microphone base — the closest crafted objects in the frame.
2. `right-390`: the open project list covers the white keyboard entirely, so the music view's subject is hidden.
3. `top-320` and all 320 corners: the Projects button runs under the look-control group; its chevron is hidden.
4. `right-up-1440`: the hint pill sits on the door knob.
5. The veil in `top-320`/`initial-390` should be identified (transition, scrim or loading layer) so captures wait for it.
6. Panels (`panel-1440`, `panel-390`, `panel-320`): heading and body text are readable and nothing overflows in these three stills. I did not test behaviour.

## Comparison

- Versus v1: decisively more immersive and more detailed. v1's whole room fitted in a card at about 700 px; here single objects (keyboard, central screen) are that size. This clears the test spec's "similarly basic scene fails" line.
- Versus the Jesse reference (depth and light only): the reference has stronger local light colour, glow and surface variation per object. This scene's forms are cleaner than its surfaces: geometry is ahead of materials and lighting.

## Requirements for the asset-authoring phase

Blocking for any future visual acceptance:

1. **Right limit must be lit and finished.** Door, right wall and right ceiling need to sit in the same tonal range as the left wall (left-wall low region measures about 25 mean luminance; the door measures about 5). The door panels need real surface: timber, mouldings or glazing, not black.
2. **Light fixtures need form.** The lamp shade should show a gradient and fabric or seam detail instead of a clipped patch; the wall triangles need falloff, a diffuser texture or a visible edge profile.
3. **Narrow-phone framing.** At 320 wide the central monitor's bezel must be inside the frame at home, with more than the current sub-20 px margin at 390.
4. **Clean recaptures** at 320 home, plus 390 corners, mid-edge extremes and at least one 4:3 desktop, before any look-cone claim.

Should improve, since authored assets make these cheap:

5. Wall surface variation (plaster, panel seams, light pooling) so large wall areas are not one flat tone, especially the top third of the mobile home view.
6. Metal response: an environment or baked reflections for rack, lamp pole, stands and monitor feet.
7. Mouse, cymbals and kick/pedal area of the kit are the least convincing objects; the snowboard reads better in context than alone at top of `left-up-1440`.
8. Timber: grain variation, end grain on the desk edge and beam ends.
9. Keep what works: the fixed eye and bounds, the wrapped three-screen arrangement, keycap construction, keyboard-on-stand silhouette, the left-wall vignette, and the warm/cool split with the dusk window.

Optional polish: keycap legends, cable slack on the desk, a warmer spill from the pendant onto the keyboard.

## Limits of this review

Still images only. I made no judgement on input, picking, panel behaviour, performance or accessibility, and none on technical correctness. Review completion is not product approval; root owns acceptance and the revised plan.
