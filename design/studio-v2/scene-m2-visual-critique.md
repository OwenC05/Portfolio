# M2 workstation and P1 phone framing — independent actual-image critique (Claude)

15 November 2026. Task `task_5437cd5dfec3`, dispatch `ctx_a9a533c5bf49`, per root `msg_0e3903046d68`. Reviewer is separate from the M2 author (`task_faeb10e3a287`). No helpers, no overrides.

Model and effort. Observed: process argv `--model claude-fable-5-2 --effort high`, and the session identifies itself as `claude-fable-5-2`. `CLAUDE_CODE_EFFORT_LEVEL` is unset in the process environment. The effort level is therefore a request I can see, not an effective value I can prove. ACK sent as `msg_0e143915442b` before inspection; early findings sent as `msg_9051ddbf2f63`.

I wrote only this report and `scene-coordination/m2-visual-review-*`. I started no browser, server, build, Blender, capture or Git operation, and edited no source, asset, art report, profile or interface file.

## Verdict

| Subject | Verdict |
| --- | --- |
| **P1 phone framing** | **APPROVE the captured candidate: FOV 74, home yaw −13.5, pitch −7**, for root to record. It is a `view-config.ts` change and I am not approving it silently. One definition point is left for root (see "The 265 px threshold"). |
| **M2 workstation** | **REQUEST CHANGES, bounded.** One blocking material repair (pendant lens clipping) and one recommended material repair (PC front and interior glow). No re-model, no camera move, no new asset. Everything else is approved as captured, as stage direction. |

Neither repair blocks M3 from starting. Nothing here approves final gear identity, lighting, the interface, budgets, the room or the product.

## Evidence I inspected

- Capture record `.omx/context/full-kit-m2-runtime-capture-v01.json`: SHA256 `1DA664B9…6ADD49B2`, re-hashed by me, matches the brief. Zero recorded failures; no source drift after capture.
- All 33 PNG hashes match the record: 23 scene renders and 10 chrome composites, DPR 1. I opened all 33 at native size, then 3× to 10× nearest-neighbour crops of the PC, pendant, monitors, stands, cables, desk, subwoofer, power lead and the phone monitor band.
- Composites are a static M2 image under the real authored DOM and CSS at 1:1. They show occlusion. They do not show M2 integration, input, picking or focus, and I claim none.
- Eight scene records (every 1440×900 render) and the three 1440 composites carry one console "404 (Not Found)" with no recorded request. Cause unknown; I do not explain it.
- Like-for-like check: I re-read one M1 image, `full-kit-m1-v02/proposal-home-320x844-f74.png` (`8a9ad0e0…`), with today's method.
- Read, not opened as images: `full-kit-m1-root-decisions.md`, `art-direction.md`, `render-gates.md`, `asset-inventory.json` (M2 entries), `m2-author-report.md`, `scene-full-kit-m1-visual-critique.md`, `scene-m2-technical-check.md`, the M2 manifest, and `build-full-studio.ts` (lights only).
- Reproducible numbers: `scene-coordination/m2-visual-review-measure.py` writes `m2-visual-review-measurements.json` (full hashes, per-row readings) and `m2-visual-review-crops.png` (twelve labelled crops).

| Scene render (`full-kit-m2-v02/`) | Pose yaw/pitch, FOV | SHA256 prefix |
| --- | --- | --- |
| `scene-home-1440x900-f58` | −4/−6, 58 | `ea34b26d` |
| `scene-music-1440x900-f58` | 44/−8, 58 | `7afe44cc` |
| `scene-left-up-1440x900-f58` | −38/12, 58 | `3b46aad2` |
| `scene-left-down-1440x900-f58` | −38/−16, 58 | `4de90324` |
| `scene-right-up-1440x900-f58` | 58/12, 58 | `d0e153e4` |
| `scene-right-down-1440x900-f58` | 58/−16, 58 | `66928b61` |
| `scene-mid-left-1440x900-f58` | −20/−6, 58 | `c70b3820` |
| `scene-mid-right-1440x900-f58` | 30/−6, 58 | `208dd03d` |
| `scene-home-1024x768-f58` | −4/−6, 58 | `460255a7` |
| `scene-home-390x844-f74` | −13.5/−7, 74 | `6a6bf54a` |
| `scene-music-390x844-f74` | 44/−8, 74 | `e3c5270e` |
| `scene-left-up-390x844-f74` | −38/12, 74 | `2b86f729` |
| `scene-left-down-390x844-f74` | −38/−16, 74 | `73097cb8` |
| `scene-right-up-390x844-f74` | 58/12, 74 | `352a4ee3` |
| `scene-right-down-390x844-f74` | 58/−16, 74 | `e19661a9` |
| `scene-home-320x844-f74` | −13.5/−7, 74 | `04d0c489` |
| `scene-home-previous-yaw-320x844-f74` | −14/−7, 74 | `e18861a7` |
| `scene-music-320x844-f74` | 44/−8, 74 | `36b1fc5a` |
| `scene-left-up-320x844-f74` | −38/12, 74 | `5b7fb2c5` |
| `scene-left-down-320x844-f74` | −38/−16, 74 | `9445653b` |
| `scene-right-up-320x844-f74` | 58/12, 74 | `e63bc68d` |
| `scene-right-down-320x844-f74` | 58/−16, 74 | `eacfea7f` |
| `scene-home-320x568-f74` | −13.5/−7, 74 | `02423e8c` |

| Chrome composite | Scene beneath | Projects list | SHA256 prefix |
| --- | --- | --- | --- |
| `chrome-home-default-1440x900` | home-1440 | always shown | `caea1b9a` |
| `chrome-music-default-1440x900` | music-1440 | always shown | `fb4dae71` |
| `chrome-right-down-default-1440x900` | right-down-1440 | always shown | `25df1061` |
| `chrome-home-default-1024x768` | home-1024 | always shown | `5eb28980` |
| `chrome-home-closed-390x844` / `-open-` | home-390 | closed / open | `538c8b18` / `4d33687b` |
| `chrome-home-closed-320x844` / `-open-` | home-320×844 | closed / open | `ba82378b` / `f2faf0fe` |
| `chrome-home-closed-320x568` / `-open-` | home-320×568 | closed / open | `091b4374` / `92de95eb` |

## P1 — phone lens and home pose

### Bezel margins

Clear pixels from the frame edge to the central monitor's outer bezel edge, read from pixel rows where the wall beside the bezel is lit. Ranges run from the top corner to the bottom corner.

| Capture | Left | Right | ≥12 px (320 tall), ≥20 px (390) |
| --- | --- | --- | --- |
| 320×844, yaw **−13.5** (candidate) | 26–30 | **14–18** | Passes on every row |
| 320×844, yaw −14 (comparison) | 32–34 | **8–13** | Fails at the top-right corner (8) |
| 390×844, yaw −13.5 | 61–65 | 49–53 | Passes |
| 320×568, yaw −13.5 | 70–74 | 62–66 | Not the tall-phone gate; ample |

The half degree moved the monitor 5–6 px left, as the M1 arithmetic predicted (about 14 right, 28 left). The script's minima agree with my hand reading (26 and 14). Its maxima read up to 3 px high on rows where the anti-aliased bezel is too pale for its threshold; the minima are the binding figures.

Two things the M1 prediction did not say:

- **A 1–3 px dark sliver of the TypeForge monitor's bezel now sits on the right frame edge**, rows 430–521, in `scene-home-320x844-f74` only. The −14 frame has none. M1 predicted "no right-hand sliver"; that was wrong. I did not notice it at normal size until I measured. It shows bezel only, no border or screen. No chrome covers it in the closed state. I judge it acceptable.
- On the left, the copilot monitor's edge shows for 8–12 px (bezel, border and a few pixels of screen) at −13.5, against 14–17 at −14.

The monitor is 5–6 px right of centre at −13.5 and 11 px at −14.

### The 265 px threshold — what passes and what does not

Root gives the projected central-face span at 320 tall as 269.852 px at the top edge (x 30.93 to 300.78) and 260.938 at the lower edge. My pixel rows agree: the face is a keystoned trapezoid, wider at the top.

| Span definition | Tall 320 and 390, FOV 74 | Against 265 |
| --- | --- | --- |
| Projected bounding span (root) | 269.85 | Passes |
| Widest visible row, between the border lines | 270 (rows 340–355) | Passes |
| Mid-height row (y 415) and median over all rows | 266 | Passes by 1 px |
| Narrowest row that spans the full face (y ≈ 480) | 262–263 | **Fails by 2–3 px** |
| Projected lower edge (root) | 260.94 | **Fails by 4 px** |

107 of the 150 rows that cross both border lines are 265 px or wider (rows 338–444). The lower 43 rows are 254–264; the last few are corner rows where the slanted bottom edge cuts in. On the screen, the title sits on a 268 px row, the three pipeline boxes on 265–266 px rows, and the footer label on a 263 px row.

**Which definition the M1 threshold used.** The M1 critique defined "visible screen" as "the widest unbroken screen run inside the border" and reported 266 for FOV 74. I re-read that M1 image with today's method. Its widest row is 270, its mid-height row is 266 and its lower rows are 262–263 — the same as the M2 frame at the same pose. So the M1 number reproduces only as the **mid-height row (equally, the median row)**. It is not the projected bounding span (269.85) and not a minimum over rows. The M1 wording and the M1 number disagree; I cannot say what that reviewer intended, only what the number reproduces as.

**My P1 pass rests on:** bezel margins of at least 12 px on both sides at every row, a readable title, and the screen criterion in the sense the M1 number actually measured (mid-height row 266 against 265). It also passes on the projected span and the widest row. It does **not** pass if root reads 265 as a minimum over rows: the lower quarter of the screen is 262–264 px. I am not treating the median as a minimum. That choice is root's.

If root wants a minimum-row criterion, it cannot be met by yaw, which does not change size. A narrower lens would be needed, and by arithmetic alone FOV 73 would bring the lower edge to about 266 while cutting the right margin to about 11–12 px. That is uncaptured and I do not recommend it. My recommendation is to record the threshold as "mid-height row at least 265 px, lower edge at least 260 px" and keep FOV 74.

### Legibility

- **320×844 and 390×844.** The project title reads at native size on all three truthful screens that are in frame. The small mono labels ("PLAIN / RETRIEVAL-AUGMENTED", the box labels, the footer) are smudges at DPR 1. No capture above DPR 1 exists.
- **320×568.** Screen run 171–182 px, median 180: about two thirds of the tall frame, far below 265 as expected. The title still reads, small. The labels do not. All three monitors, keyboard, mouse and mug are in frame, and the composition is better balanced than the tall one. This is a separate result; it does not meet the tall threshold and I do not claim it does.
- No aspect-dependent lens is proposed. The HTML project list remains the reading path on short phones.

### Phone look limits at FOV 74

The ten phone frames at left-up, left-down, right-up, right-down and music (390 and 320) show no void, backface, exterior, floating object or z-fighting. These poses were arithmetic only in M1; they are now captured.

## M2 — ranked findings

### 1. Blocking: the pendant lens is clipped

`fix_pendant__lens`, owner M2 artist.

- **Measured.** 24.1–26.7% of lens pixels have all three channels at 250 or above in `home-1440` (26.0), `home-1024` (25.8), `mid-left-1440` (25.6), `left-up-1440` (24.1), `home-320×844` (26.7), `home-390` (25.2) and `home-320×568` (24.8). `left-up-390` is 22.3%. The gate in `render-gates.md` is under 2%.
- **Where.** The central third only. On the lens centre line in `home-1440`, x 490–610 is pure white; the ends are cream (248, 235, 204 at x 330; 249, 237, 208 at x 730). In `left-up-320` and `left-down-390`, where only the left end is in frame, clipping is 0%.
- **Not shared by other emitters.** The wall-triangle proxies (peak 247) and the lamp shade (peak about 233) are at 0–0.1%.
- **What it looks like.** A dark body with a recessed bright strip, end caps, two fine cables and a canopy: the form is right and reads as a linear pendant. But the middle of the strip is a flat white bar with no core or rim. It is the brightest object in every home frame at every width, and the first thing below the header on phones.
- **Cause — inferred, not proven.** `build-full-studio.ts` places a provisional point light of intensity 12 at the fixture (world −1.6, 3.85, 0.3). A centre-peaked falloff along a uniformly emissive strip is what a nearby point light adding to a lens with a non-black base colour would produce. I read this from the images and the source; no capture isolates it. The author separately reports that the lens has no core-to-rim ramp because the planned ramp image does not exist yet.
- **Why not deferred to lighting.** The light values are provisional, but how the lens material responds to a light at its own fixture is an M2 asset property, and a practical will always sit at this fixture.

Repair, bounded to the existing two pendant leaves:

1. M2 artist: make the lens emissive-only so scene light adds nothing to it (base colour black or near-black for the lens), and set its emissive level so the peak stays below clipping in the real renderer.
2. M2 artist, library file: author the `fk_glow_ramps` image the inventory already plans (8 kB budget) and map the lens to a centre line with falloff. This is the planned library texture, not a new asset.
3. Runtime artist, only if clipping survives step 1: adjust the pendant practical, recorded in the override table and reconciled at M6.

Accept when the lens is under 2% clipped in the seven views listed above, the ends stay clearly luminous (they are about 225 now), and the body-to-lens edge still reads. Root may instead record an explicit deferral to the runtime artist, but only after one diagnostic capture shows the lens material is not the cause.

### 2. Recommended, not blocking: the PC front is mostly black and its glow is not visible

`pc_tower__case`, `pc_tower__glow`, owner M2 artist.

**C2 is closed in the images.** In the eight views that show any of the PC (`home-1440`, `home-1024`, `mid-right-1440`, `music-1440`, `right-down-1440`, `music-390`, `music-320`, and a glass-side sliver in the bottom-right corner of `mid-left-1440`) I see no top face. What shows above the dark panel is a band the same width as the side stiles, in desk shadow: the front frame's top rail. This is what I see, not a restatement of the author's 0 of 121 samples.

**Identity where it is seen whole.** In `mid-right-1440` (490–705 × 755–900), raw `right-down-1440` (60–350 × 660–900), `music-1440` (280–520 × 745–900) and `music-390` (0–60 × 620–840) it reads as a white PC: off-white frame, dark front panel, three thin fan rings with hubs and blades, a glass side with a white interior shelf. I would not mistake it for a speaker in those views.

**The weakness.**

- In `home-1440` the visible front is x 1040–1219, y 818–900: two cream stiles about 18 px wide, a top rail greyed by desk shadow, and a 143 px near-black panel (18, 17, 9) with part of one ring. 63% of that area is below luminance 60 and 13.5% above 140. The rings are a dull khaki (about 90, 77, 52), 4–5 px thick. Lighting will not turn a near-black panel white.
- I find no emissive pixels in the PC in any frame: nothing above luminance 205 in the 1440 views, and the brightest pixels are the cream frame. The interior glow the inventory asks for ("soft warm-white interior glow") is not visible from the eye. Root's bounding box for the glow leaf lies behind the front panel in screen space; that is a box, not proof, but it agrees with what I see.

**Under actual chrome.** Rectangles are the recorded DOM rectangles; PC extents are read from pixels, not from root's bounding boxes.

| Composite | Chrome over the PC front | What stays visible |
| --- | --- | --- |
| `chrome-home-default-1440x900` | Look bar (1124–1417 × 819–877) covers the right 53% of the front's width on rows 819–877 | Glass side (963–1038), left stile, the left arc of one ring, and a 23 px strip below the bar |
| `chrome-home-default-1024x768` | Look bar (715–1008 × 694–752) covers the whole front on rows 697–752 | A 16 px strip at the bottom edge; rings show faintly through the bar |
| `chrome-music-default-1440x900` | Project list (to x 391) covers the glass side only | The whole front, about one and a half rings |
| `chrome-right-down-default-1440x900` | Project list (23–391 × 681–877) covers the whole front | The top rail above the list and a strip below it |

`mid-right-1440` has no composite; by the same rectangles the PC there is clear of chrome. On phones the PC is absent from home and right-down at both widths, is a recognisable three-ring front in `music-390`, and is a frame sliver in `music-320`. Phone poses are not listed for the PC in the art direction.

**Decision: not a stage blocker.** The top is hidden, the front is discoverable clear of chrome in two desktop look poses, and part of it shows at `home-1440`. But "white PC" at home currently rests on two thin stiles, so I recommend the repair in the same revision as the pendant fix.

Repair, bounded to the existing three leaves, with no change to size or position (so C2 and the M4 clearances hold) and no new material, swatch, texture or leaf:

1. Move the front panel's palette UVs from the near-black swatch to an existing lighter swatch (ivory or a light warm grey). Keep hubs and blades dark so the rings still read against it.
2. Re-site the existing glow strip inside the case so it faces the glass side and is seen from the eye. At `home-1440` the glass side is at x 963–1038, outside every chrome rectangle. Keep it under 2% clipped.

Check in `home-1440`, `home-1024`, `mid-right-1440`, `music-1440` and `music-390`, with their composites.

For root's interface gate, not for the M2 artist: the look bar hides the PC at 1024 home and the project list hides it in right-down at 1440.

### 3. Low: the under-desk lead is three straight segments

`under_desk_power__strip_loom`, owner M2 artist. The one visible lead drops from the desk underside to the floor and runs to the PC: `home-1440` (838–1000 × 808–890), `left-down-1440` (1355–1440 × 772–890), also `home-1024` and `home-390`. It has two hard kinks and no curve. The inventory rule is sag and no straight rods; the monitor cables follow it and this lead does not. Add length segments on the visible span and pay for them with fewer sides (the lead is 2 px wide on screen).

### 4. Low, for S's budget reconciliation: most of the cable and power geometry is not seen

In none of the 23 frames can I see the cable tray, power strip, sockets, plugs or switch, or the cable runs behind the monitors and under the back beam. What shows of `under_desk_power__strip_loom` is the one lead above. What shows of `mon_cables__runs` is the central pair into the grommet, the pair on the pole, and a short stub at the copilot stand. These two leaves and the frame with its tray are the three assets the author reports over plan. This is an observation from 23 poses, not proof for every reachable pose. It suggests trimming before any waiver. I grant no budget waiver; root's note that the 70-primitive forecast is unresolved stands.

### 5. Observation: the top-display pole

The pole between the central and top screens is a pale cream metal (about 207, 188, 149) among black stands. It reads as a metal post and is coherent enough. A darker steel swatch would stop it drawing the eye between two screens. Optional.

## M2 — approved as captured

Stage direction only, under provisional lights.

| Asset | What I see | Views |
| --- | --- | --- |
| `desk_top` | A solid timber slab. Front edge 21–22 px tall at `home-1440`, darker than the top, with grain streaks; eased-edge highlight along the left end. The end face reads as timber but I cannot tell end grain from long grain at this size. Grommet present | `home-1440`, `home-1024`, `left-down-1440`, `mid-left`, all phone homes |
| `desk_frame` | Thin black legs, inset; nothing floats. Rails and tray are not noticeable | `left-down` (all widths), `mid-left`, `music` |
| `desk_mat` | Olive-grey felt with a fine stitched line near the edge | `home-1440`, `left-down-1440` |
| `mon_central`, `mon_side`, `mon_top` | Thin dark bezel of 2–4 px with a continuous tan border inside it on all four screens; no z-fighting or gap in any of the 23 frames, including the oblique `left-down` and `music`. Wall shows between the central and each side monitor. Rounded feet, necks and hinge sit on the desk. Top display on a pole and arm | `home` at all sizes, `mid-left`, `mid-right`, `left-down`, `left-up`, `music-1440` |
| `mon_cables` | The central pair drapes with sag from behind the neck into the grommet ring; the pole pair kinks at a tie | `home-1440`, `left-down-1440`, `home-320×844` |
| `sub_woofer` | Dark cabinet with a recessed olive cloth grille. Reads as a speaker box under the desk; the upper half of the grille is in desk shadow | `left-down` (1440, 390, 320), `mid-left`, phone homes (bottom-left) |
| `fix_pendant` | Form approved; lens fails finding 1 | `home` at all sizes, `left-up`, `mid-left` |
| `pc_tower` | Geometry and placement approved (C2); material per finding 2 | As finding 2 |

Monitor recess, bezel lip and border match the M1 decision in appearance. Target and border planes are exact-geometry matters for the validator, not for me.

## What the chrome composites show

Occlusion only.

| Composite | Finding |
| --- | --- |
| `home-1440` | All three target screens and the top display are clear. The project list covers the keyboard proxy's left 50 px. The header's left pill covers the pendant's left 30 px. Mug, mouse and notebook proxies are clear |
| `home-1024` | Screens clear. The project list (16–384 × 556–752) covers about 70% of the keyboard proxy. PC per finding 2 |
| `music-1440` | TypeForge screen clear. The list covers the mug and notebook proxies and the PC's glass side |
| `right-down-1440` | The list covers the PC front and the notebook proxy |
| `home-390` closed / open | Closed: screens, keyboard and mouse clear; controls sit over the dark under-desk area. Open: the list (566–770) covers the lower keyboard and the mouse; the hint moves up to 529–558, over the monitor foot. The central screen stays whole |
| `home-320×844` closed / open | Closed: as 390. Open: the list (510–714) starts about 7 px below the central monitor's lowest corner and covers the foot, keyboard and mouse. The screen stays whole |
| `home-320×568` closed / open | Closed: the screen is clear; the header overlaps the upper part of the pendant. **Open: the list (234–438) covers the central screen completely** and the middle of both side screens. Only the top display and pendant remain |

The tall frames' dark lower third is used well by the controls. On the short phone, opening Projects hides the screens the list refers to. That is an interface condition for root, not an M2 or lens defect, and a static composite cannot show how the layout behaves in use.

Required gear across the supplied views:

- **Desk:** every home pose.
- **White PC:** finding 2.
- **Coffee (proxy):** whole and clear of chrome in `home-1440`, `home-1024`, `home-320×568`, `mid-left` and `mid-right`. Cut by the right edge in `home-390` (33 px shows). Absent in `home-320×844`, which root's decision allows. Present in `music-1440` but under the project list except its top 26 px.
- **Keyboard and mouse (proxies):** whole in every home frame, including `home-320×844`.
- **Microphone, headphones, nearfield speaker (proxies):** still not separately recognisable.
- **Snowboard (proxy):** deck and one binding box in `left-down` and `left-up` at 1440, 390 and 320.
- **Controller and drums (proxies):** `music` and `right-down` at all widths.

## Proxies and downstream dependencies

51 leaves are still `__proxy` and belong to M3–M5. I approve no gear identity from them. Still proxies in these images: keyboard slab and accent cap, mouse block, mug cylinder, notebook, microphone parts, headphones, both speakers and the dark cabinet, controller, stand, stool, pedal, drum kit, rug, snowboard and bindings, shelf, books, plant, wall print, acoustic panels, wall triangles, door switch.

| Stage owner | Dependency, with the views that show it |
| --- | --- |
| M3 nearfield | The headphones proxy is a grey block against the TypeForge monitor's right edge (`home-1440`, about 1020–1055 × 490–650). The author reports it intersects the stand and cables; I cannot read it as headphones. Place it clear of the real stand foot (860–965 × 610–660) |
| M3 | C1 stands: the dark cabinet right of TypeForge is still a black block (`home-1440` 1020–1230 × 430–665) and still hides the left cymbal in `music-1440` |
| M3 | The mug overlaps the TypeForge stand's real foot in `home-1440` (mug 820–898, foot from 860). Move it 30–40 mm |
| M3 | Re-seat mug, notebook, mouse, keyboard, microphone clamp and speaker on the real desk and mat. The author reports sub-millimetre sinking and a clamp-to-rail intersection; none is visible at these sizes |
| M4 music | C3 stands: the controller's left end meets the desk's right corner and leg above the PC in `right-down-1440` and `music-1440`. Plan-view gaps for desk leg, PC right face, controller stand and stool. Plus `music_cables` |
| M5 walls | `wall_cable_run` from the loom's end. Shelf books, snowboard bindings |
| M6 contact decals | `contact_decals__desk_gear` is a hard-edged dark-brown rectangle of 1.2 × 0.5 m under the 0.90 × 0.40 m felt mat. It reads as a second, larger desk pad with sharp corners, not as a soft shadow (`home-1440` 135–910 × 645–782, and every home frame). Re-cut it to the real footprints with a soft edge |
| M6 lighting | The under-desk bay is near black; the subwoofer and PC depend on it. Reconcile the pendant practical with finding 1 |
| Interface, through root | PC under the look bar at 1024 home and under the project list in right-down; keyboard under the list at 1024; the open list covering the central screen at 320×568 |

## Not evidenced

- DPR above 1, a production build, physical devices, touch, performance.
- M2 inside the product; picking, focus, input.
- Chrome over music and look-limit poses on phones, and over anything but home at 1024.
- A selected project's reading panel at any width. The "open" composites show the project list open, not a project open.
- Home yaw between −13.5 and −14, or any lens other than 74 on phones.
- Root's sample maximum of 101 draws and 21,876 triangles is a sample, not production, device or final-budget proof. S reconciles the 23 static primitive instances against the ceiling of 20. I give no waiver.

## Remaining conditions

1. Root records the P1 config change (FOV 74, −13.5/−7) and chooses the wording of the 265 px criterion.
2. M2 artist: pendant lens repair (finding 1), re-captured in the seven listed views. Blocking for M2 acceptance.
3. M2 artist, same revision: PC front and glow (finding 2) and the lead (finding 3). Recommended.
4. S and root: budget and draw reconciliation, with finding 4 as input.
5. Stage owners close the dependencies in the table above.

No claim is made about the whole room or the product. Failed and superseded images are untouched.
