# Claude review: attention clearance stills and proposed render density

18 November 2026. Claude visual reviewer, `task_3751b6ef898e`. Written under `design/assistant/robot/review/density-attention-v01/` only. Saved images only: no browser, source, asset, test, build, server, Git or paid action. Build `cFKSWm6Bayf__QstZY2CC`, approved v03 robot unchanged. Two separate verdicts follow. Neither approves performance, continuous motion or a deployed source change.

## Verdict 1: attention stills — PASS, still-image gap closed

These are the two frames I asked for in `final-motion-visual-v01`. Both show the settled attention pose with the sheet closed, Ask focused, no run and no cards, and render counts unchanged before and after (11 and 28).

Evidence: `evidence/attention-home-neighbour-native2x.png` (full-resolution crops, home left, neighbour right).

| Check | `attention-home-dpr2.png` | `attention-neighbour-dpr2.png` |
| --- | --- | --- |
| Wall lights vs head | Clear wall between the nearest light tip and the head's upper left; roughly 30 CSS px | Lights sit up and to the left; clear by a wider margin |
| Wall lights vs bookmark | Ball top and ribbon are right of and below the light edges; no contact | Same; no contact |
| TypeForge screen vs nearer mitten | About 30 CSS px of wall between screen edge and raised mitten | About 30 CSS px |
| Speaker | Tray is well above the speaker top | Same |
| Cymbal | Tray's right end sits just above the cymbal's near edge, about 10 CSS px apart in the picture. Separate, no overlap | Same relationship |
| Face | Pupils raised and inside the eyes, lids below them, no gap closed | Same |
| Mittens, body, tray | All separate; tray level and empty | Same |

Attention is the pose that lifts the head and bookmark highest. In both views nothing touches or overlaps the lights, the screen or the speaker. The specific gap I recorded is closed.

The tray-to-cymbal spacing is the tightest thing in the scene. It is clear in these stills and was clear in the no-match stills, but it is the place to look first if motion evidence is ever gathered.

Not covered: movement into or out of attention, interruptions, other views, phones or devices.

## Verdict 2: desktop WebGL at 1.5 — preliminary ACCEPTABLE, no concrete defect

Compared `normal-dpr2.png`, `normal-dpr1.5.png` and `normal-dpr1.png` at equal CSS size. Same settled neutral home view; hashes match `image-manifest.json`; buffers 2849x1800, 2137x1350 and 1424x900.

Evidence: `evidence/density-robot-equal-css-4x.png`, `evidence/density-centre-screen-equal-css-2x.png`, `evidence/density-eyes-actual-pixels.png`.

| Feature | 2 | 1.5 (candidate) | 1 (context only) |
| --- | --- | --- | --- |
| Eyes, pupils, highlights | Crisp | Slightly softer edge; highlights and lid cut fully intact | Stair-stepped eye edges, highlight reduced to a few pixels |
| Brass rim and seam | Thin clean lines | Still continuous thin lines | Broken, shimmering look |
| Ribbon, post, mittens, tray rim | Clean | No visible change at normal size | Soft |
| In-scene monitor text, large titles | Sharp | Marginally softer, fully readable | Readable but blurred |
| In-scene monitor text, small labels | Sharp | Softer, still readable | Smeared; at the edge of readable |
| Thin panel outlines on screens | Even | Even | Uneven weight |

At 1.5 the character reads the same. The only difference I can find without enlarging is a little softness in the smallest text on the in-scene monitors, which stays readable. At 1 the loss is plain, and I would not accept it; it is not what is proposed.

So, on these experiment images, the 1.5 tradeoff costs very little visually and nothing in character. I found no defect to raise against it.

Why this is only preliminary:

- The experiments changed the whole browser's scale, so the HTML in `normal-dpr1.5.png` is softer too. The real policy keeps HTML at the display's native density. I have not seen that combination: sharp HTML chrome over a slightly softer canvas.
- A 1.5 canvas shown on a native-2 display is stretched by the browser. That resampling is not in these images and could soften or shimmer thin lines (seam, rim, monitor label text) a little more than shown here.
- One neutral home frame only. No attention, cards, other views or motion at 1.5.

### Smallest fresh-build capture needed

One PNG from the built source candidate: display at native device pixel ratio 2, viewport 1440x900 CSS, home view [-4,-6], settled neutral, sheet closed, with the usual before/after receipt showing `devicePixelRatio` 2 and a canvas buffer of about 2137x1350.

That single frame carries everything I need: the robot's eyes, rim and seam, the small monitor labels, and the HTML name plate and Ask button beside them for the sharp-over-soft comparison. If it matches what I see here, I would expect to confirm. If root wants a second frame, the most useful is the same view with four sources presented, to check the small cards.

## Limits

- Stills only. No continuous or interrupted clearance, no every-pose approval.
- No performance judgment. The frame-time figures are Codex's and are not recertified here.
- No physical device, phone, software keyboard or assistive-technology evidence.
- The density verdict rests on browser-scale experiments, not the source policy.
- Deferred low items (contact line wrapping on phone, card selection cue, card tint) are untouched and stay deferred.
- No art, placement or scale change is suggested.

## Files viewed

Under `integration/performance-diagnosis-v01/`. SHA-256 recomputed by me; all five match `image-manifest.json`, and the two attention hashes match the brief.

| File | Pixels | SHA-256 |
| --- | --- | --- |
| `attention-home-dpr2.png` | 2880x1800 | `59d5a502c263cdb4ab73f1ee43938563c5129d4c1e28075491857c785bffab2b` |
| `attention-neighbour-dpr2.png` | 2880x1800 | `ce1db3418ad08936ee273feb4a2048a23e0f507a169224a81a708963a021ac78` |
| `normal-dpr2.png` | 2880x1800 | `1543c611bf998e7170113954f435e040c9a644ce154697892a7f0d51b6654b4a` |
| `normal-dpr1.5.png` | 2160x1350 | `86ead9fee7a2c6f6c0877fb5b5e0107042c8efc02cc8ed799a1824e56595771b` |
| `normal-dpr1.png` | 1440x900 | `3e247c76756dddec687a53f54bcbea5557bd029a49ae00fecec52928352d555d` |

The two attention images were viewed whole (reduced by the viewer) and as full-resolution robot crops. The three density images were viewed only as matched crops of the robot, the centre monitor and the eyes; I did not view them whole.

Read: the image, recommendation and limits parts of `handoff.md`, the per-image receipts in `image-manifest.json`, and the first capture record of `attention.json`. I did not read the performance matrices.

Evidence made here, in `evidence/`: `attention-home-neighbour-native2x.png`; `density-robot-equal-css-4x.png` and `density-centre-screen-equal-css-2x.png` (each density resampled to the same CSS size, bicubic, so enlargement softness is shared by all three); `density-eyes-actual-pixels.png` (unscaled pixels).
