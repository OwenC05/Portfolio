# Claude independent review: final browser captures v01 (visual and clearance)

18 November 2026. Claude visual reviewer, `task_2c904aac644d`. Written under `design/assistant/robot/review/final-motion-visual-v01/` only. Saved artifacts only: no live browser, source, asset, test, build, server, Git or paid action. Candidate build `cFKSWm6Bayf__QstZY2CC`; robot GLB `65f1dea3…578a12` (hash taken from the handoff, not recomputed by me).

## Verdict: PASS for the frames actually viewed

No visible silhouette clash, intersection, misleading tray state or unreadable phone state appears in any frame I viewed. The approved character holds at every view where it is in frame.

This is not a pass for performance, continuous motion, every intermediate pose, physical devices, the software keyboard or assistive technology. The motion frames are too sparse and too loosely tied to app state to support any claim about what happens between endpoints.

## 1. Tray states against the UI

Evidence: `evidence/tray-one-selected-deselected-four-native2x.png` (native-resolution crops).

| Image | Sheet says | Tray shows | Agree |
| --- | --- | --- | --- |
| `desktop-one-source.png` | 1 chip, 1 row | One card, at the viewer-left slot | Yes |
| `desktop-one-selected.png` | Chip 1 filled dark, row 01 highlighted and expanded | Same card, visibly larger and higher | Yes |
| `desktop-one-deselected.png` | Chip 1 outlined with focus ring, row collapsed | Card back to its first size | Yes |
| `desktop-four-sources.png` | 4 chips, rows from 01 | Four cards, first taller by design | Yes |
| `desktop-home-no-match-settled.png` | "No matching sources" | Tilted tray, nothing on it | Yes |

The count is legible in every case and nothing on the tray claims more than the sheet. The selection change is clear when the selected and unselected frames are compared side by side. In a single frame, a selected ordinary card and the taller first card are hard to tell apart, as noted before; the sheet is the authority and shows selection plainly, so this stays a deferred low item. Card tint under the backdrop also stays deferred.

## 2. Phone states

| Image | Finding |
| --- | --- |
| `phone-home.png` | Robot off-frame, as accepted. "Ask about Owen's work" is a clear labelled button above the look controls, with no focus ring this time. Discoverable |
| `phone-pending.png` | "Searching portfolio sources…" and the echoed question are readable; Cancel is live; Close is at top right |
| `phone-no-match.png` | "No matching sources" panel and its sentence are readable. A contact line follows. Close present |
| `phone-error.png` | Red-barred message, "Nothing is shown from the earlier search.", "Try again", three suggestions. Readable. Close present |

One low defect, `phone-no-match.png`: the contact sentence breaks after "For anything not covered here," and the rest starts as what looks like a separate paragraph with a full gap. It reads as two fragments. Smallest fix: let the sentence wrap naturally, keeping only the address unbroken. Not blocking.

Fixture wording ("Phone pending source-only fixture", "Controlled temporary error") is test content and not judged.

## 3. Character and clearance at the tested views

Evidence: `evidence/robot-stable-home-righthigh-neighbour.png`, `evidence/look-views-overview.png`.

| View | Idle PNG | No-match PNG |
| --- | --- | --- |
| Home | Robot whole and clear. Eyes, pupils, lid cut, mittens, bookmark and level tray all as approved | Head turned toward the sheet, viewer-left mitten raised outward, tray tilted and empty. The mitten gesture is visible at this resolution |
| Left-low | Robot is not in frame | Robot is not in frame |
| Right-high | Head and upper body clear at lower left. Tray and lower body are behind the HTML Selected Work panel | Same; head turned. The empty tray cannot be seen here |
| Robot-neighbour | Robot whole and clear, centre frame | Robot is completely behind the Ask sheet |

Observed clearance in these stable frames:

- **Wall lights.** Clear wall between the nearest light tip and the head and bookmark at home, right-high and neighbour. No overlap.
- **TypeForge screen.** Home idle and home no-match: clear gap between the screen edge and the nearer mitten, including with the mitten raised.
- **Speaker.** Tray sits above the speaker top with a visible gap in every frame where both show.
- **Cymbal.** In home no-match the tilted tray's lower right rim sits in front of the cymbal in the picture. It reads as one object in front of another, with no clipping or shape breaking through. A still cannot measure depth, so this is "no visible intersection", not a clearance figure.
- **Face.** Pupils stay inside the eyes and above the lids; no gap closes.

The negative angular margins in `scene-implementation/envelope.md` are box warnings. Nothing in these frames turns any of them into a visible collision.

Two things for root to know, neither a defect under the agreed rule that the sheet is authoritative:

1. At the neighbour view the Ask sheet hides the robot entirely, and at right-high the Selected Work panel hides its tray. The robot's result presentation is only dependably visible from the home view.
2. Left-low contributes no robot evidence at all.

## Motion frames

Evidence: the four `evidence/motion-*-six-requested-phases.png` sheets. Phase names below are the requested labels only.

| Set | What the six frames show |
| --- | --- |
| Home, DPR2 | Three distinct frames, then one frame repeated for all three no-match labels. Robot with level empty tray; the third frame shows four cards on a near-level tray. The repeated frame is brighter, with no backdrop |
| Home, DPR1 | Six distinct frames. Same content: neutral-like, then four cards on a near-level tray, then empty tray |
| Neighbour, DPR2 | Two frames with no sheet and a level tray; one with the sheet covering the robot; then one frame repeated three times showing a tilted empty tray and no sheet over the robot |
| Neighbour, DPR1 | All six are covered by the sheet. No robot evidence |

What I can say: in every motion frame where the robot is visible, its silhouette is clean, parts are separate, and nothing touches the lights, screen or speaker.

What I cannot say: which pose or moment any frame shows. Sheet presence and tray state disagree between adjacent frames (for example the neighbour DPR2 no-match frame shows the no-match tray with no sheet), which fits the handoff's warning that frames lag the app. I saw no frame I could identify as mid-gesture. I did not view the left-low or right-high motion frames.

## Limits

- Continuous and interrupted motion clearance is not established by these stills.
- Attention, the pose that lifts the head toward the lights, has no stable PNG in this set. I last saw it in the G4 v01 closed capture, at home only.
- Sources and selection were captured at home only. One-source frames were taken with reduced motion on.
- No sources, pending or error PNG at phone with the robot (it is covered), and no phone sources frame in this set.
- No software keyboard, physical device, screen reader or forced-colours view.
- Desktop frame-time failure is open with Codex. Nothing here approves performance, and no art change is suggested to offset it.
- The GLB and JSON receipts were not opened; engineering checks are not recertified.

## Smallest additional capture

Only one material question is left open by this set, and it is cheap: two stable PNGs with exact before/after receipts, sheet closed, Ask button focused so the robot holds attention, at **home** and at **robot-neighbour**. That shows the highest head and bookmark position against the wall lights from the two views that matter. Nothing else is required for a still-image judgment; continuous clearance would need a different kind of evidence than screenshots.

## Files viewed

Paths under `integration/final-browser-v01/`. I recomputed SHA-256 for every file in `capture-manifest.json`; all 52 match the manifest. Full hashes are in that manifest; prefixes here identify what I looked at.

Viewed whole, downscaled by the viewer from 2880x1800 where applicable:

| File | SHA-256 prefix |
| --- | --- |
| `desktop-one-source.png` | `fc7f7b24d6c4` |
| `desktop-one-selected.png` | `1348b6a4551e` |
| `desktop-one-deselected.png` | `9a4d13ad0399` |
| `desktop-four-sources.png` | `de8d601ab845` |
| `phone-home.png` | `4c4000f8763d` |
| `phone-pending.png` | `1b7f9cb80019` |
| `phone-no-match.png` | `6d3edc3aaefe` |
| `phone-error.png` | `e0022ee1fc9a` |

Viewed as a reduced overview of the whole frame plus a full-resolution robot crop (home, right-high, neighbour) or overview only (left-low):

| File | SHA-256 prefix |
| --- | --- |
| `desktop-home-idle.png` | `55337a6afac7` |
| `desktop-home-no-match-settled.png` | `de39a709f134` |
| `desktop-left-low-idle.png` | `7b5ec1ee0740` |
| `desktop-left-low-no-match-settled.png` | `7c2d5d7d4624` |
| `desktop-right-high-idle.png` | `f04fc185222b` |
| `desktop-right-high-no-match-settled.png` | `a6b17bb34b2a` |
| `desktop-robot-neighbour-idle.png` | `43a2249193da` |
| `desktop-robot-neighbour-no-match-settled.png` | `1d1c06a84b3d` |

Viewed as robot-region crops only (not the whole frame):

| File | SHA-256 prefix |
| --- | --- |
| `desktop-home-motion-gathering.jpg` | `455dcabb3f35` |
| `desktop-home-motion-presenting.jpg` | `1a2b5a240f0c` |
| `desktop-home-motion-dismiss-interruption.jpg` | `6da4b3793591` |
| `desktop-home-motion-no-match-early.jpg`, `-middle`, `-settled` (one image) | `c890b1ae7fa5` |
| `desktop-robot-neighbour-motion-gathering.jpg` | `6d2a4db98b08` |
| `desktop-robot-neighbour-motion-presenting.jpg` | `0f823dc1e2e5` |
| `desktop-robot-neighbour-motion-dismiss-interruption.jpg` | `af8d073c1d09` |
| `desktop-robot-neighbour-motion-no-match-early.jpg`, `-middle`, `-settled` (one image) | `d3d166960e5c` |
| `desktop-dpr1-home-motion-gathering.jpg` | `a78d5f13e2db` |
| `desktop-dpr1-home-motion-presenting.jpg` | `659d2ba4eab7` |
| `desktop-dpr1-home-motion-dismiss-interruption.jpg` | `67a7d3e4d849` |
| `desktop-dpr1-home-motion-no-match-early.jpg` | `add0da07d9e8` |
| `desktop-dpr1-home-motion-no-match-middle.jpg` | `03b5b224a91b` |
| `desktop-dpr1-home-motion-no-match-settled.jpg` | `c796ab3afa6d` |
| `desktop-dpr1-robot-neighbour-motion-*.jpg` (six files, five images) | `e1b93bb23638`, `d64d389518b2`, `cb9d3cc6ec82`, `63f7bb82272f`, `b1fb843da0a1` |

Not viewed: the twelve `desktop-left-low-motion-*` and `desktop-right-high-motion-*` frames, the four `desktop-dpr1-*-idle` and `-no-match-settled` PNGs, `context-loss-reopened.png`, the `robot-*` fault images and `lifecycle-failure.png`.

Read: `handoff.md` (to the capture handoff section), `capture-manifest.json` (per-file fields and the precision limit), `scene-implementation/envelope.md` (first sections), and my `review/integrated-visual-g4/recheck-v02/review.md`.

Evidence made here, in `evidence/`: `tray-one-selected-deselected-four-native2x.png`; `look-views-overview.png`; `robot-stable-home-righthigh-neighbour.png`; `motion-home-dpr2-six-requested-phases.png`; `motion-home-dpr1-six-requested-phases.png`; `motion-neighbour-dpr2-six-requested-phases.png`; `motion-neighbour-dpr1-six-requested-phases.png`. All are crops or reductions of the files above.
