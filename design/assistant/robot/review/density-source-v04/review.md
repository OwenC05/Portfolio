# Claude review: source-build render density (G4 v04)

18 November 2026. Claude visual reviewer, `task_789f7ce2d4d9`. Written under `design/assistant/robot/review/density-source-v04/` only. Saved images only: no browser, source, asset, test, build, server, Git or paid action. Build `KEhdfJ0NJBO2q0ASaHcHN`, renderer capped at 1.5 on a native-2 display, canvas buffer 2160x1350 shown at 1440x900 CSS.

## Verdict: visual PASS for these two stills. The preliminary density gap is closed.

This is the combination I asked for in `density-attention-v01`: the real source policy, native HTML density, canvas stretched by the browser. I found no visual defect. Sharp HTML over the slightly softer canvas looks natural, and the character and the four source cards are intact.

Scope: these two frames only. Not performance, not motion or interruption, not devices, phones or accessibility.

## What I checked

| Item | Image | Finding |
| --- | --- | --- |
| HTML over canvas | `native-dpr2-neutral.png` | Name plate, nav, Selected Work list, Ask button and hint are crisp at full native density. The 3D scene behind them is a touch softer. The contrast reads as depth, not as a fault. Evidence: `evidence/html-chrome-over-canvas-actual-pixels.png` |
| Eyes, pupils, highlights, lid cut | Neutral | Clean round edges, highlights distinct, lids clear. Marginally softer than the old density-2 frame at actual pixels; the same at normal viewing size |
| Brass rim and seam | Neutral | Both remain continuous thin lines. No breaks, no stair-stepping, no shimmer pattern |
| Bookmark, mittens, tray rim | Neutral | Unchanged in character |
| Other thin lines | Neutral | Slatted wall panels, monitor outlines and panel boxes are even. I see no moire on the slats |
| Small monitor labels | Neutral | "PLAIN / RETRIEVAL-AUGMENTED", "QUESTION / RETRIEVAL / QWEN" and "01 DISSERTATION ENGINEERING" are softer than at 2 and fully readable. Titles are effectively unchanged. Evidence: `evidence/centre-screen-old-dpr2-vs-source-cap15-actual-pixels.png` |
| Four source cards | `native-dpr2-four-sources.png` | Four separate rounded cards on the tilted tray, first one taller by design, matching four chips and the first row in the sheet. Edges are clean and the count is unmistakable. Evidence: `evidence/four-cards-tray-3x-nearest.png` |
| Sheet with results | Four sources | Sheet text is native-sharp. Robot is fully visible beside it under the backdrop |

The browser's stretch of the 1.5 canvas onto the native-2 display did not add the extra softness or shimmer I flagged as a possibility. What I see matches the earlier experiment image, with the HTML now correctly sharp.

Comparison note: the old density-2 frame was captured with a narrower canvas (scrollbar space in that browser), so the scene sits about 15 px further right in the new frames. That is a capture difference stated in the brief, not a layout change, and I did not treat it as one.

## Limits

- Two settled stills at the home view: neutral and four sources. No attention, no-match, other views or phone at this build.
- No judgment of frame timing. The repeat desktop sample failing its limit is open and belongs to root and Codex; nothing here supports or disputes a speed claim.
- No continuous or interrupted motion, physical device, software keyboard or assistive-technology evidence.
- Attention clearance was passed on the previous build's stills; this policy does not change geometry or placement, so I did not re-ask for those frames.
- Deferred low items (phone contact line wrapping, card selection cue, card tint) are unchanged and stay deferred.
- No further capture is requested.

## Files viewed

Under `integration/verification-g4-v04/`. SHA-256 recomputed by me; both match the brief.

| File | Pixels | SHA-256 |
| --- | --- | --- |
| `native-dpr2-neutral.png` | 2880x1800 | `71005badb402115218ccf38a81852dfc3210876928a7ddcd8ce19926541790e1` |
| `native-dpr2-four-sources.png` | 2880x1800 | `469df3963c38ada14bc56d6fafb5c25f3d3b1ecef4f69fdc211ba2b023dbcbf5` |

Both were viewed whole (reduced by the viewer) and as actual-pixel crops. For comparison I reused `integration/performance-diagnosis-v01/normal-dpr2.png` (`1543c611…4b4a`), viewed as crops only.

Read: the opening sections of `README.md` and the neutral capture's receipt in `capture-manifest.json` (native ratio 2, renderer 1.5, buffer 2160x1350, render count 194 before and after). I did not read `browser-results.json`, and I took the four-sources receipt values from the brief.

Evidence made here, in `evidence/`, all crops of the files above: `robot-old-dpr2-vs-source-cap15-actual-pixels.png`, `centre-screen-old-dpr2-vs-source-cap15-actual-pixels.png`, `html-chrome-over-canvas-actual-pixels.png`, `four-sources-robot-actual-pixels.png`, `four-cards-tray-3x-nearest.png`.
