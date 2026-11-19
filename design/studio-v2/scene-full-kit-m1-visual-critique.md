# Full-kit M1 blockout in the real renderer — independent visual critique (Claude)

15 November 2026. Task `task_ea1fb9efaade`, dispatch `ctx_89b398f86848`, actual Claude, no overrides or helpers. ACK sent as `msg_03d24ceaa65e` before inspection. Reviewer is separate from the M1 author (`task_e764ee6e591c`). Report only: no source, asset, config, browser, server, build, render or generation.

**Verdict: APPROVE M1 CHOICES FOR NEXT ASSET STAGES, with the exact choices and three geometry conditions below.**

This is a composition decision on a grey blockout. It is not approval of materials, lighting, equipment detail, interface layout, the full room, or the product. Two of the choices change `view-config.ts` (phone lens and phone home pose); they are stated for root to record, not approved silently. Nothing here changes the eye position, the desktop pose, or the look bounds.

## Recommended choices

| Decision | Choice | Status |
| --- | --- | --- |
| P1 phone lens | `mobileFov` 74 (from 64) | Config change for root to record |
| P1 phone home | Yaw −13.5, pitch −7 (from −13/−8). Captured −14/−7 is acceptable if root does not recapture | Config change for root to record; −13.5 is predicted, not captured |
| P1 monitor | 60 mm central setback, 17.5 mm bezel lip, border 4 mm behind the face with 10 mm overhang | Approve as captured |
| P2 scale | Architecture ×1.0, floor gear ×1.25, desk gear ×1.6, **except** the dark cabinet right of the TypeForge monitor | Approve with conditions C1–C3 |
| P3 dependencies | C1 right cabinet size, C2 PC tower under the desk, C3 controller, stool and desk corner clearance | Fix in the stage that owns each; none blocks release of M2 |
| Desktop pose, bounds, eye | Unchanged | No proposal made |

## Evidence binding

- Capture manifest `.omx/context/full-kit-m1-runtime-capture-v01.json`, SHA256 `61174FF2…0ECA5C`, re-hashed by me. All 22 image hashes match it. Every listed source is unchanged, including `build-full-studio.ts` `5a4e8296…`, `view-config.ts` `1fea7adb…`, baseline GLB `04994845…` and proposal GLB `bdc997b4…`. Zero recorded errors, warnings or failures; DPR 1.
- I opened all 22 PNGs at native size, plus 3× crops of the monitor band for the two 320×844 candidates. Full hashes and my pixel measurements are in `scene-coordination/full-kit-m1-visual-review-measurements.json`.
- Not re-opened: the pilot-runtime-v02 captures. Comparisons to them rest on my earlier critique.

| Image (`full-kit-m1-v02/`) | SHA256 prefix |
| --- | --- |
| `baseline-home-1440x900-f58` / `proposal-…` | `71d1df57` / `ab9cdc67` |
| `baseline-home-1024x768-f58` / `proposal-…` | `54d95714` / `b88c762f` |
| `baseline-music-1440x900-f58` / `proposal-…` | `708953ae` / `74cad307` |
| `baseline-right-up-1440x900-f58` / `proposal-…` | `cdb6c12d` / `4bc534e4` |
| `baseline-right-down-1440x900-f58` / `proposal-…` | `7b887e8f` / `f63c4711` |
| `baseline-left-down-1440x900-f58` / `proposal-…` | `71a8297c` / `c4c6e9e6` |
| `baseline-home-320x844-f64` | `8ccc9627` |
| `proposal-home-320x844-f70` / `-f74` / `-f76` | `e6d7a1f1` / `8a9ad0e0` / `a50c4e50` |
| `baseline-home-390x844-f64` | `22b17155` |
| `proposal-home-390x844-f74` / `-f76` | `3314088b` / `72018f57` |
| `baseline-home-320x568-f64` | `ac67e50e` |
| `proposal-home-320x568-f74` / `-f76` | `0ad23ab3` / `35e2b6a3` |

## P1 — phone lens and home

### Measured outer bezel, not face

Clear pixels between the central monitor's outer bezel edge and the frame edge, read from the images. Ranges run from the bezel's top corner to its bottom corner. "Visible screen" is the widest unbroken screen run inside the border; it is 3–4 px less than the manifest's face projection because the border overlaps the face edge.

| Capture | Left | Right | Visible screen | Side monitors in frame |
| --- | --- | --- | --- | --- |
| 320×844 baseline, FOV 64 | clipped | clipped | fills the frame | none |
| 320×844 proposal, FOV 70 | 24 | 0–2 | 286 | left bezel sliver |
| 320×844 proposal, FOV 74 | 33 | **9–13** | 266 | left 17 px, right none |
| 320×844 proposal, FOV 76 | 38 | **15–19** | 257 | left 22 px, right 2–3 px dark sliver |
| 390×844 baseline, FOV 64 | 16 | 21–25 | 330 | slivers both sides |
| 390×844 proposal, FOV 74 | 67–68 | 46–48 | 266 | both partly visible |
| 390×844 proposal, FOV 76 | 71–73 | 51–54 | 257 | both partly visible |
| 320×568 baseline, FOV 64 | 38–40 | 43–45 | 222 | both partly visible |
| 320×568 proposal, FOV 74 | 75 | 60–61 | 179 | both about half visible |
| 320×568 proposal, FOV 76 | 77–78 | 63–65 | 172 | both about half visible |

The author's corrected arithmetic (FOV 74: 31.5 / 8.1; FOV 76: 36.1 / 13.5) agrees with the images to within about 2 px. The earlier claim that FOV 74 gives 12 px each side was wrong, as the author already said.

### What the images show

- **Baseline at 320×844 fails.** The screen fills the frame and no bezel is visible on either side. The keyboard is cut on the left and the mouse on the right.
- **FOV 70 fails.** The right bezel sits on the frame edge.
- **FOV 74 and 76 both show the whole monitor.** The difference at normal size is small: 76 is 3.4% smaller. The project title reads in both. The small mono labels are unreadable in both at DPR 1, and were barely readable in the baseline. No capture above DPR 1 exists.
- **The frame is off-centre.** At −14 yaw the monitor sits about 11 px right of centre on a 320 screen, so the left has 33 px and the right 9–13.
- **Tall and short 320 are different problems.** At 320×568 the baseline already had 38 px or more on each side. The wider lens is not needed there and costs a fifth of the screen width (222 to 179). At 320×844 the wider lens is the only thing that gets the bezel into frame.
- **Room, not cut-out.** At FOV 74 the tall frames gain the beam and the full pendant above the top display. This reads as a room with a ceiling. The bottom 250 px is the dark underside of the desk in every tall frame.

### The thresholds contradict each other only slightly

| Threshold (proposed) | FOV 74, −14 | FOV 76, −14 | FOV 74, −13.5 (predicted) |
| --- | --- | --- | --- |
| Bezel ≥12 px each side at 320×844 | Fails right: 9 px at the top corner | Passes: 15 | About 14 right, 28 left |
| Bezel ≥20 px at 390 | Passes: 46 | Passes: 51 | Passes |
| Screen ≥270 px at 320×844 | 269.9 projected, 266 visible | 260.3 projected, 257 visible | Same as FOV 74 |
| Enclosure envelope, +50° up | 49° at the pitch limit | 50°, no margin | 49° |

### Recommendation

**FOV 74, home yaw −13.5, pitch −7.**

- FOV 74 keeps every real phone's screen larger than FOV 76 would (266 against 257 at 390; 179 against 172 at 320×568), and keeps one degree inside the enclosure envelope at the upper pitch limit.
- Half a degree less yaw moves the monitor about 5 px left. Predicted from the captured frame: right margin about 14–18, left about 28, keyboard still inside (left end near 3 px), no right-hand sliver. This is arithmetic on a captured frame, not a capture. One 320×844 frame at −13.5 would confirm it. It does not need to hold up asset work, because no asset depends on half a degree of phone yaw.
- If root prefers a captured pose only: FOV 74 at −14/−7 is acceptable. The 320×844 viewport is taller than any 320-wide device, and the whole bezel is visibly inside the frame with wall beside it. In that case restate the 320 threshold as "whole bezel inside, at least 8 px".
- I do not recommend FOV 76. It buys 6 px of margin on a viewport no device has, for a smaller screen everywhere and a stray dark sliver of the right monitor on the frame edge.
- Restate the 320 screen threshold as at least 265 px visible. 270 is met only as a projection, by 0.1 px.

Not decided here, for root if wanted later: a lens that depends on aspect ratio, so short phones keep a narrower view. It would recover the screen size lost at 320×568. It is new behaviour, has no capture, and is not needed for M2–M6.

### Monitor setback, bezel and border

Approve as captured.

- **Separation.** In `baseline-home-1440` both side monitors touch or overlap the central bezel (left edge 355 against 360; right 808 against 798). In the proposal there is wall between them (350 to 378; 790 to 815). The same holds at 1024.
- **Bezel.** The baseline's thick dark frame becomes a thin one. The tan border is continuous on all four sides at 3× in the phone crops.
- **No z-fighting or gap** between face, border and bezel in any of the 22 frames, including the oblique `left-down` view.
- **Cost.** The central screen at 1440 goes from 413 to 400 px projected. That meets the proposed 400 px threshold by 0.4 px. Visible width is a few pixels less. I recommend accepting it and restating the threshold as 390.

## P2 — scale tiers

Approve the tiers, with one exception (C1).

| Check | Baseline (prototype sizes) | Proposal (tiers) |
| --- | --- | --- |
| Keyboard to mouse width, `home-1440` | About 470 to 58 px: the mouse is an eighth of the keyboard | About 305 to 62: a fifth, plausible |
| Keyboard to central monitor width | Wider than the monitor | About 70% of it |
| Mug | Small, far right, beside the notebook | Larger, beside the mouse; reads as the same scale as keyboard and mouse |
| Desk depth | Keyboard fills the foreground | Clear desk between monitor stands and mat; monitors sit back |
| Project-list rectangle (24–390 × 682–876) | Covers the left third of the keyboard | Touches only the keyboard's left 35 px |
| 320×844: keyboard, mouse, mug | Keyboard and mouse cut, no mug | Keyboard and mouse whole, **no mug** |
| 320×568 | All three in frame | All three in frame |

- The baseline desk reads as oversized toy gear in front of small monitors. The proposal reads as one desk at one scale. This is the main gain of M1 and I support it.
- **The mug criterion in G1 is not met at 320×844** at any captured lens; at 390 the mug is cut by the right edge. I recommend dropping the mug from the 320 criterion, not widening the lens further for it.
- **Keycap pitch is an estimate.** The keyboard is a slab. Assuming 15 columns: about 20 px at 1440, 12–13 px at 320×844 (FOV 74), about 9 px at 320×568. So the proposed 11 px threshold can hold on tall phones and cannot hold on short ones under any candidate lens. Keycap detail is a final-asset gate.
- The mug's top now touches the TypeForge monitor stand in `proposal-home-1440` (mug at 820–898, stand from about 850). Minor; move it 30–40 mm when the real asset goes in.

## P3 — geometry and spacing to fix before the owning stage finishes

None of these blocks releasing M2. Each should be closed by the stage named.

| # | Where | Finding | Repair, owner |
| --- | --- | --- | --- |
| C1 | `proposal-home-1440` (1020–1225 × 430–665), `proposal-music-1440` (300–495 × 400–630), `proposal-right-up-1440` (0–235 × 700–900) | The dark cabinet right of the TypeForge monitor more than doubles in area. It becomes a black block two-thirds the height of the portrait monitor, hides the left cymbal and the foot of two acoustic panels in the music view, and no longer matches the smaller grey cabinet on the left | Hold it at ×1.25 or reduce its footprint; keep the left cymbal clear in `music-1440`. M3 nearfield, artist |
| C2 | `proposal-home-1440` (990–1290 × 815–900), `proposal-right-down-1440` (85–420 × 655–900), `proposal-music-1440` (310–585 × 740–900) | The white PC tower now shows its top face in front of the desk edge. In the baseline it sat flush under the desk. In the music view it is a large white mass directly beside the white controller | Push it back under the desk or reduce it until the top face is hidden from the eye; confirm clearance under the desk top. M2 workstation, artist |
| C3 | `proposal-right-down-1440`, `proposal-music-1440` | The controller's left end meets the desk corner above the PC, and the larger stool overlaps the controller's legs. I cannot tell contact from intersection in these views | Plan-view clearance check of desk, PC, controller stand and stool; state the gaps. M4 music, artist |

Smaller regressions, baseline to proposal:

- **Shelf books cropped.** In `baseline-left-down` the shelf and three books are whole (390–715 × 40–165). In the proposal the shelf is higher and the books are cut by the top of the frame.
- **Snowboard.** The taller deck is still more than 40% visible in `left-down`, but only one binding shows; the lower one is behind the desk and the cabinet on its stand. The baseline showed both.
- **Headphones.** In the baseline a flat dark slab sits on the desk's left end. In the proposal that slab is gone and I can find one grey box on a dark post at the desk's left, nothing else. I cannot tell from a grey proxy whether that is the headphones on a stand, the speaker, or the microphone. One of the three is not separately visible in `home` or `left-down`.

## Other checks asked for

- **Enclosed frusta.** No void, backface, exterior, floating object or z-fighting in any of the 22 frames. Walls, ceiling, beams, cornice, skirting, floor, window and door close every captured view. `right-up` is the same in both variants apart from C1.
- **Music side.** White 49-key controller, stool, drum discs, lamp, blind, window and switch are all right of the desk and read in both variants. The controller spans about 455–470 px of 1440, close to the 30° asked of the final asset; that is a G4 check.
- **Proxy against finished.** Door, lamp, window, blind, beams and screens look finished and match the accepted pilot. Everything grey, white or flat-coloured on and around the desk is a stand-in: keyboard, mouse, mug, notebook, cabinets, PC, controller, stool, drums, snowboard, books, wall print. The five wall triangles are flat clipped white squares in both variants; known, deferred to the final asset.
- **Lighting.** Copied pilot rig. The floor under the desk is near black and the right cabinet has no form. Deferred, not judged.

## Needs real product chrome, not judged here

The harness has no interface. These cannot be inferred from an empty frame:

1. Phone home at the chosen lens with the real header, hint and look controls: whether they cover the top display, the pendant, or the keyboard and mouse.
2. The dark lower third of tall phone frames: whether a sheet or controls occupy it or it stays empty.
3. Desktop project list against the keyboard, and the bottom-right panel (1125–1416 × 730–876) against the notebook and the PC tower, whose visible part is mostly inside that rectangle.
4. Required-gear visibility outside chrome for headphones, microphone and PC at 1440, 1024, 390 and 320.
5. An open project panel at each width.

## Not evidenced

- Desktop `left-up`, and every look limit and the music view at phone sizes with the new lens. Enclosure at FOV 74 on a phone is arithmetic only.
- Home yaw −13.5 at FOV 74.
- DPR above 1, a production build, touch, physical devices, performance.
- The four cable and power groups, which have no geometry.
- The first load timed out and a reload succeeded, by root's account. I have no image of it.

## What this settles and what it does not

Settled, for root to record: tier sizes with the C1 exception, the monitor setback, bezel and border, and a phone lens of 74 with a home near −13.5/−7.

Not settled: C1–C3, the −13.5 confirmation frame, every interface check, lighting, materials, equipment detail, and product acceptance.
