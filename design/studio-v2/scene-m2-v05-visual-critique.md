# Corrected PC repair v05 — independent actual-image review (Claude)

15 November 2026. Task `task_69d2bdabad59`, dispatch `ctx_a8a774ce3d8a`, root release `msg_23aa0bb512b9`, governed by `scene-coordination/m2-v05-visual-review-task.md`. Same retained reviewer session as the v02 and v03 reviews, separate from the v04/v05 author (`task_d31f70e55a5d`). No helpers, no overrides.

Model and effort. Observed: process PID 49980, argv `--model claude-fable-5-2 --effort high`; the session identifies itself as `claude-fable-5-2`. `CLAUDE_CODE_EFFORT_LEVEL` and `ANTHROPIC_MODEL` are unset. The effort level is a request I can see, not an effective value I can prove. ACK sent as `msg_c342335ef9db` before inspection.

I wrote only this report and `scene-coordination/m2-v05-visual-review-*`. I started no browser, server, build, Blender or capture, and changed no source, asset, report, package or Git state. The v02 and v03 reviews and the preserved v04 failure evidence are untouched.

## Verdict

**APPROVE, bounded: the v05 PC repair.**

- **White front: fixed.** The front now reads as a white tower with dark fans in every view that shows it. The share of near-black pixels on the front fell from 60–72% to 10–25%.
- **Glow: visible where intended, not clipped, and very faint.** It shows in four of the five raw renders as a pale line 3 pixels thick and 42–54 pixels long. No pixel of it clips. At actual size it reads as a light edge on the shroud, not as a light. I accept that as restrained; I state the limit plainly below.
- **C2 placement: unchanged.** Outside the front panel and the glow line, all five frames are pixel-identical to v03. The top stays hidden, and nothing floats or intersects.
- **Author's pose mismatch: resolved against the author's projection.** Root's captures frame the PC fully at mid-right and partly at music-390.

No blocking defect and no required remedy. One optional item is recorded for M6 (the glow's legibility). No blocker was found, so I sent no early blocker message.

This covers the v05 PC delta only. It does not approve the room, the product, lighting, the interface, a camera or any budget.

## Evidence I inspected

- Capture receipt `.omx/context/full-kit-m2-v05-runtime-capture-v01.json`: SHA256 `c490cef4…67feb77b`, re-hashed by me, matches the task. Zero recorded failures and page errors; 26 input files checked with no drift.
- All 10 PNG hashes match the receipt: 5 scene renders and 5 static UI comparisons, DPR 1. I opened all 10 at native size, then 2× to 10× nearest-neighbour crops of the PC and the glow, each beside the same crop from v03.
- Before images: the 10 same-named v03 files. All 10 still match the v03 receipt (`6ba13644…0994bb8c`).
- Poses: yaw, pitch, FOV, eye, viewport and DPR in the five v05 scene records equal the v03 records exactly.
- Candidate: GLB `4b2f7b8f…e7ccc735` and manifest `aaa0c262…5f3ba5e7`, both re-hashed by me and both named as the selected v05 pair in the receipt. The embedded build tag still says v04; the receipt records the selected revision separately.
- Builder `build-full-studio.ts` is `5a4e8296…21c0f02f` and `view-config.ts` is `1fea7adb…11f1a450`, both the same hashes as at the v03 capture.
- Console: the three 1440×900 scene records and their three comparisons each carry one "404 (Not Found)" located at `http://127.0.0.1:4182/favicon.ico`.
- Network: all five comparison records carry one `net::ERR_ABORTED` fetch of the product's `pilot-right-limit-v03.glb`. The product reached ready each time. I make no zero-network-error claim and infer no cause.
- The comparisons are a v05 image beneath the real product DOM and CSS at 1:1. They show overlap. They do not show v05 integration, input, picking or focus.
- Read, not opened as images: the capture handoff, `scene-m2-v05-delta-check.md` and `.json` (`681bf10b…ec15ddc7`), `m2-pc-repair-scope.md`, `m2-pc-repair-report.md`, and my v02 and v03 reviews.
- Reproducible numbers: `scene-coordination/m2-v05-visual-review-measure.py` writes `m2-v05-visual-review-measurements.json` (full hashes and every reading below) and `m2-v05-visual-review-crops.png` (eight rows; each row is v03, v05, v05 beneath the UI).

| Image (`full-kit-m2-v05/`) | Pose yaw/pitch, FOV | v05 SHA256 prefix | v03 baseline prefix |
| --- | --- | --- | --- |
| `scene-home-1440x900-f58` | −4/−6, 58 | `489e74d2` | `a89bdf6a` |
| `scene-home-1024x768-f58` | −4/−6, 58 | `da1b2aa5` | `770e221c` |
| `scene-mid-right-1440x900-f58` | 30/−6, 58 | `4788bd14` | `7c9454d3` |
| `scene-music-1440x900-f58` | 44/−8, 58 | `618adc9c` | `031c02c6` |
| `scene-music-390x844-f74` | 44/−8, 74 | `5f171854` | `e3c5270e` |
| `chrome-home-default-1440x900` | home-1440 beneath | `82c8f9cb` | `4f993f1e` |
| `chrome-home-default-1024x768` | home-1024 beneath | `401b5afc` | `511c018a` |
| `chrome-mid-right-default-1440x900` | mid-right-1440 beneath | `e72bfd89` | `ce720121` |
| `chrome-music-default-1440x900` | music-1440 beneath | `14209e8a` | `2b721aeb` |
| `chrome-music-closed-390x844` | music-390 beneath, Projects closed | `cb1ceebd` | `84b64b03` |

## Method

v03 and v05 were captured at the same poses through the same builder, and the renders are deterministic. So the pixel difference between a v03 frame and its v05 frame is exactly what the PC repair changed on screen.

- I grouped the changed pixels into regions and assigned each to the front panel or the glow line by position, checked by eye. No changed region is left unassigned in any frame.
- "Clipped" means all three channels at or above 250, as in `render-gates.md`. The gate is under 2% of an emitter's pixels.
- "Free of UI" means the comparison pixel equals the scene pixel. Translucent UI and its shadow count as covering, so these figures are strict.
- Everything below is read from rendered pixels. The receipt's projected mesh boxes are quoted only to show how far they overstate what is visible.

## White front and fans

The UV change turns the front panel from near-black to a pale matte tone. The panel now reads (213, 197, 167), luminance 192, just under the white frame beside it at (216, 202, 176). A thin darker line marks the recess. The upper part of the panel sits in the desk's shadow, which reads naturally.

The fans now have something to read against. Blades and hubs are (5, 4, 2) to (29, 24, 15) and the rings (90, 77, 52), on a panel at luminance 192. In v03 they sat on a panel at luminance about 13 and only the rings showed.

| View | Front panel changed pixels | Panel mean, v03 → v05 | Front, near-black share v03 → v05 | Front, light share v03 → v05 | Front free of UI |
| --- | ---: | --- | --- | --- | ---: |
| `home-1440` | 7,516 | (16, 15, 9) → (180, 166, 141) | 61.9% → 14.5% | 12.8% → 46.0% | 36% |
| `home-1024` | 5,511 | (16, 15, 9) → (179, 166, 140) | 61.7% → 15.0% | 12.5% → 45.1% | 0.5% |
| `mid-right-1440` | 10,726 | (18, 17, 10) → (194, 179, 152) | 60.1% → 10.2% | 13.3% → 55.6% | 100% |
| `music-1440` | 12,543 | (18, 17, 9) → (195, 180, 152) | 61.4% → 13.7% | 12.2% → 52.7% | 70% |
| `music-390` | 7,280 | (20, 18, 10) → (200, 185, 156) | 72.5% → 24.6% | 11.7% → 55.8% | 63% |

"Near-black" is luminance under 60 and "light" is 140 or more, measured over a hand-read box around the visible front. On the first review's own boxes the near-black share goes from 63.5% to 13.6% at `home-1440`, 63.1% to 14.4% at `home-1024` and 67.7% to 11.9% at `music-1440`.

No front-panel pixel clips. The brightest is (215, 201, 173), or (225, 212, 191) at `music-390`.

View by view, at actual size:

- **`mid-right-1440`: clear.** The whole visible front is free of UI. One full fan and most of a second read at once. This is the best view of the PC.
- **`music-1440`: clear.** Two fans, clear of the project list. The list covers the glass side and the left edge of the front.
- **`music-390`: a readable sliver.** The front is a strip 52 pixels wide at the left edge, showing three fan halves. The Projects button covers its lowest part.
- **`home-1440`: partly readable.** The front is 147 by 72 pixels at the bottom edge of the frame. The look bar and its shadow touch about two-thirds of it, including the right half of the fan. The white left stile, the left of the panel and half a fan stay clear.
- **`home-1024`: obscured by the UI, as before.** The look bar lies over the entire front; the PC shows only dimly through it. The repair cannot change that. It is the interface follow-up root already recorded.

So the PC is recognisable as a white PC in the discoverable look views, and improved but still crowded by the look bar at home. That matches what the first review asked of the front.

## Glow

### Where it is visible

| View | Visible glow, raw render | Size | Free of UI | Receipt's projected box, for contrast |
| --- | --- | --- | ---: | --- |
| `home-1440` | x 965–1013, y 870–875 | 166 px; 49 long, 3 thick | 100% | x 965–1069, y 871–878 |
| `mid-right-1440` | x 498–543, y 853–868 | 149 px; 46 long, 3 thick | 100% | x 498–593, y 838–869 |
| `music-1440` | x 287–340, y 859–883 | 183 px; 54 long, 3 thick | 0% | x 287–395, y 836–884 |
| `home-1024` | x 721–762, y 743–746 | 125 px; 42 long, 3 thick | 0% | x 721–810, y 743–749 |
| `music-390` | not in frame | — | — | x −104 to −29, left of the frame |

- The glow is seen through the glass side, low in the case, along the back of the PSU shroud. That is where the author intended it.
- About half its projected length is visible. The front frame hides the rest, as the author expected. The projected boxes are roughly twice as long as the visible line, so they must not be read as visibility.
- With the product UI over the render, the glow is uncovered at `home-1440` and `mid-right-1440`. The look bar covers it at `home-1024` and the project list covers it at `music-1440`.
- At `music-390` the glass side is off the left edge of the frame. The glow is unobservable there because of framing, not because of the UI.

### Clipping

Zero clipped pixels in all four views that show it, against the under-2% gate. No channel reaches 250. The brightest glow pixel is (207, 197, 173) and the commonest is (206, 195, 172). That is below the unlit `lib_glow` value of (237, 225, 201) measured in v03. I attribute the difference to the glass in front of the strip; I did not test that.

### How it reads

Faint. This is the one thing in v05 that falls short of what the words "visible glow" suggest, so I set it out plainly.

- The line is at luminance about 190. The interior wall above it is at 101, so it does separate from the wall.
- The shroud top directly below it is at 165, only about 25 levels darker. The line reads as the lit back edge of the shroud.
- The white frame beside the glass is at 198 and the new front panel at 192. The glow is no brighter than the lit white case around it, so nothing tells the eye it is emitting.
- It is 3 pixels thick. At native size I did not notice it in the full frames until I looked for it in the crops.

I accept this as "restrained". The alternative risk I raised in the v03 review, a bar at full brightness in the darkest corner, did not happen. The PC's identity now rests on the white front and fans, which is where it should rest. The glow adds a small correct detail and no harm.

**Optional, low severity, for M6 and the M2 author.** If a glow that reads as a light is wanted later, the smallest change is another pure translation of the same strip a few centimetres up the back wall. It would then have the dark wall on both sides in place of the pale shroud top beneath it. That keeps the material, counts and flags. It needs a new candidate, delta check and capture. I do not request it now, and it should be decided after M6 fixes the lighting, since the shroud's brightness may change.

## C2 placement, glass and interior

- **Top hidden.** In all five frames every changed pixel lies in the front panel or the glow line: 7,682, 5,636, 10,875, 12,726 and 7,280 changed pixels, none unassigned. Everything else, including the case outline under the desk, is pixel-identical to v03, where the top was hidden. I see no top face in any v05 image.
- **Glass and interior.** Through the glass the back wall, shroud top and shadow wedge are unchanged from v03 and read as one coherent interior. The glow line is the only new thing behind the glass.
- **No float or intersection.** The glow line meets the shroud's back edge with no gap or overlap visible at 10×. The front panel sits inside its frame with an even recess line.
- **Not judged from these images.** The author's 0.3 mm gaps and BVH test are below what a capture can show. I report only that nothing looks wrong.

## The author's reconstruction mismatch

The author's report says its reconstructed mid-right and music-phone poses "do not frame the PC at all" and defers to root's captures. Root's receipt records those two captures at the same stated numbers the author used: yaw 30, pitch −6, FOV 58 at 1440×900, and yaw 44, pitch −8, FOV 74 at 390×844, eye (−0.7, 2.8, 3.4).

| View | Author's projection | Root's actual capture |
| --- | --- | --- |
| `mid-right-1440` | PC and glow not in frame | Front at x 582–695, y 766–899; glow at x 498–543, y 853–868. Both fully in frame and free of UI. |
| `music-390` | PC and glow not in frame | Front strip at x 0–52, y 627–838 is in frame. The glass side and glow are off the left edge. |
| `home-1440` | glow x 968–1011, y 871–875 | x 965–1013, y 870–875 |
| `home-1024` | glow x 723–760, y 743–747 | x 721–762, y 743–746 |
| `music-1440` | glow x 290–338, y 860–883 | x 287–340, y 859–883 |

The author's three other projections agree with the captures to within 3 pixels. So the error is confined to the author's reconstruction of those two views, not to the placement or to root's camera. The actual camera frames the PC in both. I did not determine what was wrong in the reconstruction.

## What carries from v03

- The v03 pendant evidence carries. `lib_glow` is byte-identical per the delta check, and the builder hash is unchanged in the receipt.
- I can add direct evidence for two views: in `home-1440` and `home-1024` the pendant lens and all five wall proxies are pixel-identical between v03 and v05.
- The floor-lamp bulb is still unobserved. Nothing here changes that.

## Remaining conditions, by owner

Nothing below blocks v05.

1. **Root.** v05 is approved for the bounded PC repair and may be the reviewed parent for the M3 assembled export, subject to root's own disposition. This verdict makes no budget, camera or room decision.
2. **M6.** Re-measure the emitters after lighting changes, as already planned, and decide then whether the glow should read as a light (optional item above).
3. **Interface.** The look bar covers the whole PC front at `home-1024` and most of it at `home-1440`. That is the product-test item root already recorded; the asset cannot fix it.
4. **M2 author.** No change requested. Correcting the two "not in frame" rows in the report is optional.

## Limits

- All images are DPR 1 with provisional lighting, reduced motion and the remaining proxies. Higher-DPR and device rendering are not covered.
- Five poses were captured. "Not in frame" and "visible" refer to those poses only.
- The front-share figures use hand-read boxes around the visible front, so they include some frame and fan pixels. They are comparable between v03 and v05, not absolute.
- "How it reads" is my judgement at native size. The luminance figures beside it are measured.
- Geometry, bindings, counts and bytes rest on the separate Codex delta check and are not re-verified here.
