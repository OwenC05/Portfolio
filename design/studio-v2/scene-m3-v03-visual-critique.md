# M3 v03 nearfield: independent visual review

15 November 2026. Reviewer: Claude (actual), retained independent session, task_3921b5029044 / ctx_c6e8f878d9d4, under `scene-coordination/m3-v03-visual-review-task.md`. I did not author M3.

## Verdict

**APPROVE the M3 nearfield appearance. One numeric gate is not met and goes back to root: phone key pitch.**

- **Appearance: approve.** The keyboard, mouse, mug, notebook, microphone, headphones and speaker each read as the object they are. They sit on the desk without floating or intersecting, and they share one scale. I found no M3 art defect that needs a new export.
- **Desktop key pitch: met.** 16.05 to 17.02 px by row at `home-1440`, against 16 px.
- **Phone key pitch: not met as written.** 10.49 to 11.06 px by row at tall 320 and at 390, against 11 px. Three of the four measurable rows are below 11; the nearest one is at 11 within the measurement error. The mean is 10.76. I am not passing this gate and I am not waiving it. R5 says P2 reopens for the keyboard alone if the gate fails, so root has to record a decision. My recommendation is in "The phone key-pitch decision".
- **Mouse: the width reading is the right one, and it passes.** 56 px wide at `home-1440`, which is 3.37 key pitches.
- **Cymbal: readable.** The speaker now hides about 3 to 7% of the left cymbal's width in the four desktop views that show it; the M2 proxy hid about 55%.
- **Targets and M2: no regression.** No pixel inside any project target, the pendant lens or the visible PC differs from the M2 captures.

This is not transfer-budget acceptance, T1 credit, an M4 release, or room, camera or product approval. Root owns the stage disposition.

## What I looked at

**Session.** Process argv: `claude.exe --model claude-fable-5-2 --effort high` (PID 49980). The harness reports model id `claude-fable-5-2`. `ANTHROPIC_MODEL`, `CLAUDE_CODE_EFFORT_LEVEL`, `ANTHROPIC_BASE_URL`, `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX` and `MAX_THINKING_TOKENS` are unset. I cannot see which model or effort the server applied; the effort flag is a request. No override, no helper.

**Evidence.** Capture receipt `.omx/context/full-kit-m3-v03-runtime-capture-v01.json`, sha256 `641328d4…2098b0`, matches. All 26 PNGs in `.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m3-v03/` match the receipt's size and hash. Candidate `dc9c6a78…`, manifest `060bab9a…`, as the receipt records. I opened all 26 at native size and enlarged the parts I cite.

| Raw render | sha256 | UI composite(s) | sha256 |
| --- | --- | --- | --- |
| `scene-home-1440x900-f58` | `d7a99c4b` | `chrome-home-default-1440x900` | `955f09de` |
| `scene-left-down-1440x900-f58` | `371021a4` | `chrome-left-down-default-1440x900` | `ca211501` |
| `scene-right-down-1440x900-f58` | `cca91971` | `chrome-right-down-default-1440x900` | `0ae61bcb` |
| `scene-music-1440x900-f58` | `8dd3710e` | `chrome-music-default-1440x900` | `353dac14` |
| `scene-mid-right-1440x900-f58` | `2505ac00` | `chrome-mid-right-default-1440x900` | `64c6dbd2` |
| `scene-home-1024x768-f58` | `62da4d52` | `chrome-home-default-1024x768` | `1631076e` |
| `scene-home-390x844-f74` | `fc370298` | `chrome-home-closed-390x844`, `-open-` | `950dba16`, `5c6940a1` |
| `scene-music-390x844-f74` | `f3fbfacd` | `chrome-music-closed-390x844` | `5481a58d` |
| `scene-left-down-390x844-f74` | `5c4f1c10` | `chrome-left-down-closed-390x844` | `df667b41` |
| `scene-home-320x844-f74` | `48a97844` | `chrome-home-closed-320x844`, `-open-` | `0537eb93`, `bc02d724` |
| `scene-music-320x844-f74` | `2f848afa` | `chrome-music-closed-320x844` | `8ede9ccb` |
| `scene-left-down-320x844-f74` | `bfa2a61b` | `chrome-left-down-closed-320x844` | `efce6adf` |

**Baselines.** For regression I compared each render with the newest earlier capture of the same pose: M2 v05 for `home-1440`, `home-1024`, `mid-right-1440`, `music-1440` and `music-390`; M2 v03 for `home-390`, `home-320` and `right-down-1440`; M2 v02 for the three left-down frames and `music-320`. Their hashes are in the measurements file.

**Reviewer evidence (new files, read-only method):**

- `scene-coordination/m3-v03-visual-review-measure.py`
- `scene-coordination/m3-v03-visual-review-measurements.json`
- `scene-coordination/m3-v03-visual-review-crops.png`

**Limits.** These are still frames under provisional lights, with 40 proxies still in the room. The composites are a saved render beneath the real page at 1:1; they show overlap, not integration, picking or focus. I ran no browser, capture, build, Blender or Git change, and edited no source, asset, camera or threshold.

## 1. Keyboard

**It reads as intended: a compact frosted board with cream caps and pastel modifiers.**

- **Silhouette and caps.** A 65% layout with five rows, a long spacebar, a separate right column and an arrow cluster. Caps are separate sculpted blocks with dark gaps between them, not a textured slab. Spacing is even.
- **Colours** (median RGB at `home-1440`): cream letters (228, 212, 180), sage modifiers (181, 173, 127), yellow Esc (237, 214, 159), pink Enter (237, 202, 172). All four are distinguishable at desktop size, and sage and pink still are at 320. The arrow keys, authored blue, render grey (182, 177, 157). See finding F4.
- **Frost.** The case shows as a pale translucent band around the plate: front lip (143, 132, 104) and left rim (164, 153, 123) over a mat of (121, 107, 71). Two dark fixings near the front corners are visible through it, which is what shows it as see-through rather than painted. The white plate edge shows as a bright line behind the lip.
- **Ordering.** I found no ordering fault in any of the eight frames that show the keyboard (four home, three left-down, part of mid-right): no cap drawn behind the shell, no shell patch missing, no dark halo.
- **Cable.** A coiled lead leaves the back left, crosses the desk and rises into the grommet beside the monitor cables. It reads as a keyboard cable. The straight run has two visible corners (F5).
- **What I cannot confirm.** The specific Think6.5 traits (side profile, badge) are too small to judge at these sizes. "Milkshake-inspired" holds as cream plus pastel modifiers. Shimmer or sorting changes while the camera moves cannot be judged from stills.

## 2. Key pitch, measured

**Method.** Pitch is the distance between the centres of neighbouring 1u caps in one row, measured along the row. Between two neighbouring caps there is a dark gap; I located each gap's luminance minimum to sub-pixel precision along a scan line parallel to the row, and fitted gap position against gap index by least squares. The slope is the pitch. Gap-to-gap equals centre-to-centre for equal caps. The scan direction comes from the receipt's keycap box edges; every position comes from the pixels. Each row was measured on several scan lines about 0.3 px apart; the table gives their mean and range, and the standard error of the best line. Row 1 is the number row (furthest); row 4 is the lower letter row. The bottom row has only three 1u caps and cannot be measured this way.

**Desktop, `scene-home-1440x900-f58.png`, gate 16 px:**

| Row | Pitch (mean of lines) | Range over lines | Intervals | Std. error | From → to (px) |
| --- | ---: | --- | ---: | ---: | --- |
| 1 | **16.053** | 16.024 – 16.106 | 12 | 0.020 | (423.0, 663.8) → (616.6, 668.9) |
| 2 | **16.323** | 16.293 – 16.333 | 11 | 0.020 | (422.4, 669.7) → (602.3, 674.5) |
| 3 | **16.623** | 16.578 – 16.662 | 11 | 0.029 | (419.5, 679.3) → (602.7, 684.4) |
| 4 | **17.021** | 17.017 – 17.031 | 10 | 0.014 | (420.1, 684.9) → (590.5, 689.7) |

Mean of the four rows: 16.505. Every row is at or above 16. Row 1 clears it by only 0.02 to 0.11 px, so I call that row "at the gate", not comfortably over it.

**Phone, `scene-home-320x844-f74.png`, gate 11 px.** `scene-home-390x844-f74.png` gives the same values to 0.001 px, 35 px further right.

| Row | Pitch (mean of lines) | Range over lines | Intervals | Std. error | From → to (px, at 320) | Against 11 |
| --- | ---: | --- | ---: | ---: | --- | --- |
| 1 | **10.493** | 10.460 – 10.545 | 12 | 0.043 | (52.2, 549.9) → (178.4, 561.0) | 0.51 short |
| 2 | **10.653** | 10.645 – 10.661 | 11 | 0.043 | (52.0, 554.3) → (169.1, 564.8) | 0.35 short |
| 3 | **10.847** | 10.822 – 10.884 | 11 | 0.039 | (49.7, 560.3) → (169.3, 571.4) | 0.15 short |
| 4 | **11.055** | one line | 11 | 0.040 | (38.9, 563.4) → (160.8, 574.9) | 0.06 over |

Mean of the four rows: 10.762.

**Uncertainty.** About ±0.05 px per row on desktop and ±0.08 px on phone, from the line-to-line range and the fit error. Row 4 on phone cannot be told apart from 11.

**Other figures.** `home-1024` (no gate): 13.703, 13.926, 14.216, 14.533; mean 14.095. The bottom row, by extending the row-to-row step (my extrapolation, not a measurement), would be about 17.4 px on desktop and 11.2 to 11.3 px on phone.

**Against the author's estimates.** The author's 16.6 px and 10.7 px agree with my four-row means (16.51 and 10.76). They are whole-keyboard averages; the rows differ by about 1 px on desktop and 0.56 px on phone because the far rows are further from the eye.

### The phone key-pitch decision

**The criterion is ambiguous, and it fails under the two natural readings.** `render-gates.md` R2 says "Pitch at least 16 px and 11 px" and does not name a row.

| Reading | Phone value | Result |
| --- | ---: | --- |
| Every row at least 11 | 10.46 minimum | Not met, 0.54 short |
| Keyboard average at least 11 | 10.76 | Not met, 0.24 short |
| Nearest full letter row at least 11 | 11.06 ± 0.08 | Met only within error |

**What it looks like.** At native size on both phone frames the keyboard is the largest thing on the desk, 207 px of the 320 px width. Single caps are still separable, and the sage, pink and yellow accents are visible. The risk R5 guards against, losing the keycap hero read, has not happened in these frames. A 0.2 to 0.5 px change in pitch would not be visible.

**The smallest decision.** Root records one of:

1. **Accept as measured and fix the wording** (my recommendation). For example: "tall-phone pitch as captured, 10.49 to 11.06 px by row, mean 10.76; criterion read as the nearest full letter row at 11 px". This is an explicit, recorded exception by root, not a pass I am granting.
2. **Reopen P2 for the keyboard alone.** Reaching 11 px on every row needs the far row to grow about 5%. The smallest art change is a uniform 1.05 scale of the keyboard about its centre (pitch 30.5 → about 32.0 mm). That costs a new Blender export, a new byte restoration and check, and a recapture. It would put the mouse at about 3.1 key pitches wide (still inside three to four) and add a few pixels of project-list overlap at 1440.

I recommend option 1 because the gain from option 2 is not visible and its cost is a full candidate cycle. Moving the keyboard toward the eye instead is worse: the author's own estimate reaches only about 11.0 on average and pushes the board further under the project list at 1440. A lens change is outside this review.

## 3. Mouse

**Proportions.** Silhouette measured from the pixels (ivory against the mat):

| View | Width × height (px) | Width in row-3 key pitches |
| --- | --- | ---: |
| `home-1440` | 56 × 52 | 3.37 |
| `home-1024` | 47 × 44 | 3.31 |
| `home-390`, `home-320` | 40 × 36 | 3.69 |

The authored size is 99 × 160 × 56 mm, which is 3.25 pitches wide and 5.25 long. The author's projected figure of 56.9 px and 3.43 pitches at `home-1440` matches mine (56 px, 3.37 against row 3, 3.39 against the four-row mean). The phone ratio is higher, most likely because the mouse sits near the right edge of a 74° lens, where the image stretches.

**Which reading of G3.** G3 says "mouse spans three to four key pitches". I read this as width, and I agree with the author:

- The source sentence in `art-direction.md` is about width: "the mouse is two keycaps *wide* … real ones span three to four."
- A real mouse is about 3.3 real key pitches wide and 6 or more long. A mouse only three to four pitches long would be a toy beside this keyboard.
- From the fixed eye the mouse is seen from behind, so its width is the span the viewer actually sees.

On that reading it passes at every measured view. On the length reading it would fail (5.25). I am stating the disagreement between the readings; I am not rewriting G3. If root prefers the length reading, the author's stated remedy (0.12 × 0.075 m) applies, and I would expect it to look undersized.

**One proportion note.** At 160 mm the mouse is about 100 mm in real-desk terms after the 1.6 desk tier, which is a short mouse; its width is exactly typical. It reads slightly plump. That is within stylisation and I am not asking for a change.

**Form.** It reads as a mouse by position, size and pebble shape. It is symmetric. There is no cable, side disc or faceting. The wheel shows as a black nub about 3 px wide on the top edge, with a thin seam line beside it. The two button splits face the monitors and are **not visible from the fixed eye in any capture**, so I cannot confirm them from runtime images. That is how a real mouse looks from the seat, not a defect.

## 4. Other gear

| Item | Reads as | Contact and scale | Notes |
| --- | --- | --- | --- |
| Mug and coaster | A mug of coffee on a thin wooden coaster: cream inner wall, dark coffee, handle | Seated on the coaster, coaster on the desk. Body 88 px wide at `home-1440`, about 4.5 key pitches by my estimate after allowing for its nearer position, a normal mug at this scale | Clear of the TypeForge stand, as root asked. The body renders grey (152, 148, 128), not blue (F4). It leans slightly at the frame edges; that is lens perspective |
| Notebook and pen | A kraft notebook with cream page edges, an elastic band and a white pen | Flat on the desk at the left of the mat | Clean. Best seen in left-down |
| Microphone | A studio mic in a ring mount on a sprung two-part boom arm, clamped at the back left of the desk | Clamp meets the desk edge; arm passes left of the Copilot monitor | No longer stacked dark blobs: the capsule is pale, the ring and springs are legible. The capsule top is a plain disc with no grille, which is acceptable stylisation |
| Headphones | Over-ear headphones hung on a stand with a round dark-oak base | Base flat on the desk; band rests on the stand top | The clearest of the new items. A thin bright line down the pole reads as a metal highlight |
| Speaker | A white two-way nearfield speaker with black tweeter and woofer | On its pad at the back right, clear of the TypeForge monitor | See F3 and F6 |

I saw nothing floating, sunk or intersecting in any of the 12 renders. The dark brown plane under the mat is the provisional contact layer inherited from M2, not M3 geometry.

## 5. Cymbal

**The speaker leaves the left cymbal readable.** I measured the cymbal's lit top face, which has one flat colour, in M3 and in the same-pose M2 capture.

| View | Visible width, M3 | Visible width, M2 parent | Top-face pixels, M3 / parent | Hidden by the speaker, M3 (estimate) | Hidden by the old proxy |
| --- | ---: | ---: | --- | ---: | ---: |
| `home-1440` | 150 px (x 1147–1296) | 72 px | 2,148 / 1,015 | about 7% of width | about 55% |
| `home-1024` | 129 px | 62 px | 1,553 / 728 | about 5% | about 54% |
| `music-1440` | 119 px (x 425–543) | 53 px | 1,478 / 618 | about 3% | about 57% |
| `mid-right-1440` | 110 px | 50 px | 1,307 / 575 | about 4% | about 57% |

- The hidden share is my estimate by symmetry: the left end disappears behind the speaker where the face is still 5 to 9 px thick, and the free right end takes 4 to 11 px to taper from that thickness to nothing.
- This agrees in size with the author's ray figure (3 of 64 samples, about 5%), but my figure comes from the rendered pixels.
- **Phones.** At `music-390` the cymbal is not touched by the speaker at all; it is cut by the left frame edge, with 74 px showing where the old proxy left 37. At `music-320` only 39 px show, again cut by the frame, not the speaker. The other two cymbals are fully in frame at both widths.
- **Residual uncertainty.** The cymbal is still a flat proxy disc. The M4 cymbal will have a bell, a lip, a tilt and a stand, so its silhouette and its overlap with the speaker will change. Recheck at M4.

## 6. Targets, obstruction and UI overlap

**No M3 gear obstructs a project target.** In every render, the pixels inside each in-frame target quad (dissertation, Copilot, TypeForge) are identical to the M2 capture: zero changed pixels. The boom arm passes beside the Copilot bezel and the speaker stands beside the TypeForge bezel without crossing either face. No target pixel is under UI in any of the 14 composites.

**Tall-320 central screen: unchanged, criterion still met as adopted.** No pixel of the central monitor in `home-320` differs from the M2 v02 or v03 capture, so the earlier 266 px mid-height figure carries. The projected lower edge is 260.94 px. The border box leaves 28.8 px on the left and 15.9 px on the right. The first row that differs from M2 v03 is y 526, on the desk.

**UI overlap of the new gear.** Shares are of each item's projected box, which is larger than its silhouette.

| Composite | Under UI | Clear |
| --- | --- | --- |
| `home-default-1440` | Notebook 77%; keyboard 12% (front left corner under the project list) | Mouse, mug, speaker, cymbal 0%; headphones 3%; mic capsule clear |
| `home-default-1024` | Keyboard 79%; notebook 99%; mug 26%; headphones 20% (hint pill) | Mouse, speaker |
| `left-down-default-1440` | Nothing | Keyboard, mouse, notebook, mic all 0% |
| `mid-right-default-1440` | Mouse 100%; the visible corner of the keyboard | Mug, headphones, speaker, cymbal 0% |
| `music-default-1440` | Mug 68% | Headphones 6%; speaker and cymbal 0% |
| `right-down-default-1440` | Mug 30% | Headphones, speaker, cymbal 0% |
| Phone home, Projects closed (390, 320) | Nothing | Keyboard and mouse 0% |
| Phone home, Projects open | Keyboard and mouse 99–100% | Screens stay clear; the list is the reading path |
| Phone left-down (390, 320) | Nothing | Notebook, mic, the visible part of the keyboard |

- **G3 "headphones visible outside the project-list rectangle": met** at `home-1440`, `mid-right`, `music-1440` and `right-down`.
- **Each new item has at least one desktop view where it is clear of UI.**
- **At 1024×768 the home view hides 79% of the keyboard** under the project list. The pitch gate names only 1440 and 320, and the list rectangle is not M3's. This is an interface layout item, like the look-bar and PC overlap recorded earlier.
- **Phone discoverability is not captured for three items.** The mug, speaker and most of the headphones fall outside all six phone frames (home, music, left-down). They sit between the home and music yaws. Root already ruled that coffee need not share the phone home frame; a phone mid-right capture is still needed to show where it is seen.

## 7. M2 regression

**None found in what these views show.**

- **Pendant.** In `home-1440`, `home-1024`, `home-390` and `home-320`, none of the lens-material pixels changed (6,607, 4,861, 3,118 and 2,934 pixels checked). The commonest lens colour is still (237, 225, 201). Clipped pixels in the crop are the same 19, 11, 2 and 2 as in v03, all in the unchanged fixture line. In the two phone left-down frames the lens is (237, 225, 201) with zero clipped pixels.
- **PC.** In the five views with a v05 capture, none of the pixels that v05 changed (front panel and glow: 7,682, 5,636, 10,875, 12,726 and 7,280) differ in M3. At `home-1440` nothing below y 783 changed; the PC is below that.
- **PC and UI overlap.** Unchanged, so not worsened by M3.
- **Everything that did change** lies on or above the desk where gear was replaced: the new items, their shadows, and the wall and drums revealed by the smaller speaker.

## Findings

No finding blocks M3 on appearance. F1 needs a root decision before stage acceptance.

| # | Severity | Finding | Images | Owner and smallest remedy |
| --- | --- | --- | --- | --- |
| F1 | Decision required | Phone key pitch is 10.49–11.06 px by row (mean 10.76) against an 11 px gate that names no row | `scene-home-320x844-f74`, `scene-home-390x844-f74` | Root: record option 1 or 2 above. No art change unless option 2 is chosen |
| F2 | Low | A hard, curved shadow edge crosses the back of the mouse, 20 to 25 luminance levels deep, so the mouse looks two-toned. It keeps the same shape on the mouse in every view, which points to the shadow pass, not the mesh. A dark smudge 3–4 px wide sits at the rear left foot | `scene-home-1440`, `scene-left-down-1440`, `scene-mid-right-1440` | M6 lighting: soften or bias the shadow on small rounded gear, then recheck. No M3 geometry change requested |
| F3 | Low | A ragged shadow patch on the speaker's lower left front | `scene-home-1440`, `scene-right-down-1440` | M6 lighting, with F2 |
| F4 | Low | Under the warm provisional light the blue accents read grey: arrow keys (182, 177, 157), mug (152, 148, 128). Yellow Esc and pink Enter are distinguishable but faint | All home views; `scene-mid-right-1440` | M6: judge after lighting. If blue is still wanted, it is a palette change with wider reach, so root decides |
| F5 | Low | The keyboard cable's straight run shows two sharp corners | `scene-home-1440`, `scene-left-down-1440` | Author, only if M3 is re-exported for another reason: two more points on the curve. Otherwise leave |
| F6 | Note, deliberate | The speaker is on the 1.25 tier and the headphones on the 1.6 tier, so from home the headphones' projected box is taller than the speaker's (227 px against 201 px at `home-1440`). It reads as a small desktop speaker behind large headphones | `scene-home-1440`, `scene-home-1024` | None. This follows root's instruction to shrink the speaker for the cymbal |
| F7 | Interface, later | At 1024×768 home the project list covers 79% of the keyboard | `chrome-home-default-1024x768` | Interface owner, with the earlier look-bar item |
| F8 | Evidence gap | No phone capture shows the mug, the speaker or more than part of the headphones | Six phone renders | Root: add a phone mid-right pose to the next capture matrix |

## What stays with later stages

- **M4:** the real cymbals, drums and controller, and a recheck of cymbal against speaker.
- **M5:** walls, snowboard, wall cable run.
- **M6:** lighting and emitter remeasure, F2 to F4, the provisional contact layer.
- **Interface:** F7, the look bar and PC overlap, and all real integration, picking and focus behaviour on phones.
- **Not judged here:** production performance, the transfer budget and T1. S's forecast leaves no safe gzip headroom, and nothing in this review changes that.

## Reproduce

From the repository root: `python design/studio-v2/scene-coordination/m3-v03-visual-review-measure.py`. It checks the receipt and all 26 image hashes before measuring, then rewrites the measurements file and the contact sheet. It needs Python 3 with numpy and Pillow, and reads the M2 v02, v03 and v05 capture folders as baselines.
