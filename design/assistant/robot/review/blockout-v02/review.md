# Independent recheck: apprentice blockout v02

15 November 2026. Claude visual reviewer, `task_0192c4dcce53`. I reviewed v01 and did not author either version. Written under `design/assistant/robot/review/blockout-v02/` only. The v01 report and evidence, the author's files and the root and Codex files are unchanged. No scene, app, server, Git or paid work.

## Verdict: PASS

This applies to the isolated v02 concept only. All six v01 findings are repaired in the images and documents I checked, and I found no new blocker.

The pass does not cover three things:

- **Appearance approval.** That is Owen's. The closer-set eyes are the main thing for Owen to look at.
- **The room.** Nothing here shows the robot in the Studio, under its lighting, or at its real viewing angle.
- **Runtime behaviour.** The stills cannot show timing, one-frame clearing or reduced motion working.

Four places in the author's UI and design text still state rules that root's checkpoint D1 has since decided differently. These are text alignments, listed below. They do not change the character or need new renders, and they do not need another review round.

## Six-item recheck

Render paths are under `apprentice/blockout-v02/renders/`. "4x aid" means my unsmoothed enlargements in [evidence/](evidence/).

| # | v01 finding | Result | What I saw | Files viewed |
| --- | --- | --- | --- | --- |
| 1 | Idle read as a glare; far eye cut off | **Repaired** | Two whole rings in idle from the front, three-quarter and 35 degrees. No lid edge or brow line. The far ring in three-quarter is a narrow oval, not cut. Idle reads as calm and attentive at phone size | `pose-idle.png`, `three-quarter-idle.png`, `oblique35-close-idle.png`, `proxy-phone-…-idle`, `oblique35-phone-…-idle`, state sheet |
| 2 | No-match fin pointed away from the panel | **Repaired, on the stated assumption** | The fin points to the viewer's left in close-up, state sheet, phone proxy and oblique proxy. Design-spec section 6 and UI spec section 2 now name the same side. This holds only if the robot faces the eye | `pose-no-match.png`, `proxy-phone-…-no-match`, `oblique35-phone-…-no-match`, state sheet |
| 3 | Stale cards: "at once" against a 130 ms drop; staggered entry | **Repaired in text** | One rule in design-spec sections 7, 8 and 10 and UI spec section 3: no old cards on the first frame after the change, all new cards together, no tween. It matches root decision 2. `timeline-f101.png` shows the cards gone while the pose is still in sources | Both specs, `timeline-f101.png` |
| 4 | Reduced motion applied only to the next state | **Repaired in text** | Design-spec section 9 and UI spec section 7: turning it on settles on the next frame, turning it off starts nothing. It matches root decision 6. No still can show this | Both specs |
| 5 | Empty lit tray meant both waiting and no match; resubmit had no pose | **Repaired** | With the fins hidden at phone size, waiting is a thin flat hoop close under the body and no match is an open oval sitting lower. They are easy to tell apart, and the head tilt differs too. The difference survives at 35 degrees. Every state-map row has a robot entry, and resubmit uses attention | `diag-fins-hidden-phone-attention`, `diag-fins-hidden-phone-no-match`, `proxy-phone-…-attention`, `oblique35-phone-…-attention` and `-no-match` |
| 6 | Body tip touched the tray | **Repaired** | Backdrop shows between the body tip and the tray in the sources and no-match phone proxies and in the three-quarter sources view. In my 4x aid the gap is about 7 to 8 phone pixels, in line with the author's 7.7 | `proxy-phone-…-sources`, `-no-match`, `three-quarter-sources.png`, `pose-sources.png` |

The other v01 items are also answered:

- **Smile at phone size.** The goodbye arches read clearly in `proxy-phone-…-dismissal`. Warmth does survive at real size.
- **Cards.** They are now matte and darker than the eyes, and no longer merge with the glow. Four can be counted head-on at phone size.
- **Lid seam.** Gone with the upper lid.
- **Document mistakes.** The material count, rigid-eye rationale, head percentage, eye spacing, timing sums and "on axis" wording are corrected. The moving-node count of eight matches the part table.

## Alignment with root's decisions

**Compatible.** Same-snapshot clearing with no stagger, reduced motion on and off, cards generated at runtime and kept out of the GLB, finite pose targets instead of clips, and heading focus on open are all consistent with the visual plan. The two tray positions give root's states a clear picture: waiting, failure and resubmit are carried; only a real result is presented.

**Mismatches in the author's text.** Root's decisions stand; these lines need to follow them.

| Where | Author's text | Root or Codex decision | Effect on the design |
| --- | --- | --- | --- |
| UI spec section 4 and section 10; design-spec section 7 | No match starts on `retrieval` with 0 hits | Decision 3 and state-contract rows 113 and 115: zero retrieval stays pending and waiting until the abstained `answer` arrives | None visually. The waiting pose already exists. Change the trigger and add the "zero retrieved, response pending" row |
| UI spec section 10 | Abstained with hits: show the hits. More than four hits: show four and say "4 of 6" | Decision 3: contradictory count or answer is a protocol error and clears. The server cap is four | Remove both rows; they describe cases the contract rejects |
| UI spec section 3; design-spec section 7 "Card selected" | Clicking a 3D card selects it | Decision 7: scene cards are display-only while the modal is open; selection is through chips and list | Drop the click. Whether the selected card still lifts as a display-only mirror of the chip selection is undecided; nothing in the stills depends on it |
| UI spec section 6 | Phone focus "differs from desktop and needs agreement" | Decision 7: heading focus on both sizes | Already what section 5 says. Delete the stale sentence |

Also stale: three statements that Codex's directories were absent (README "Open tradeoffs", design-spec section 11, UI spec intro and section 10). I checked the filesystem. `asset-pipeline/` holds 11 files and `integration/` holds 6. The UI spec's "second native `<dialog>`" should be read as a controlled panel view inside root's single modal owner.

One point for root, not the author: root already notes that B's asset contract transcribes the v01 part list. v02 has no upper lid and eight moving nodes.

## Residuals, and where each belongs

| Residual | Decision | Why |
| --- | --- | --- |
| Visor highlight | Deferred to the in-room and finish proof | It comes from the review lights. It no longer exposes a seam or a brow line, which was the v01 harm. It is a soft patch near the eyes at phone size and does not hide either ring |
| Slightly ragged visor edge | Not a blocker, no repair loop | Primitive blockout roughness, not visible at proxy size. Carry one line into the asset requirements: a clean visor outline at close-up |
| Cards 3 and 4 overlap at 35 degrees | Deferred, with an exact condition below | Confirmed in `oblique35-close-sources.png` and the oblique phone proxy, where I cannot count four. Head-on the count is clear. This is a placement question, not a character defect |
| Closer-set eyes | Owen's appearance choice | The rings now sit 22 mm apart with blank visor either side. I read it as slightly more toy-like and still friendly. It is the price of keeping both eyes whole |
| Idle and attention share the same open eyes | Taste | They differ by head turn, fins and tray glow, which reads at phone size. Idle lost its "busy with the desk" look and gained a neutral one. I think that is the right trade |
| Clearance depth | Small text repair | By my arithmetic from the stated tray values, the presented tray's front edge reaches about 0.142 m forward of the root. A 0.28 m box centred on the root in depth is exceeded by about 2 mm. The total depth of about 0.22 m fits if the box is centred about 0.03 m forward. The spec gives the vertical offset but not the depth offset |

## Deferred conditions

These are not met by v02 and are not claimed by this pass.

1. **Facing.** The author's R1, that the placement wrapper turns the robot to face the fixed eye, is an assumption. A fixed turn is a workable placement option because the eye does not move, but nothing has implemented or shown it. The in-room proof must show, at the real anchor and camera, that four cards are separately countable and both eye rings are whole at phone and desktop size. If they are not, the remedy is the wrapper turn or a wider card spread.
2. **Pointing direction.** The no-match fin must be seen pointing toward the panel that actually opens, in the real layout. If the panel side or placement changes, the pose mirrors.
3. **Clearance.** The 0.42 x 0.28 x 0.52 m volume, with its depth offset stated, must be checked against room objects and screen occlusion at the chosen anchor.
4. **Lighting.** Eye and glow strength, card brightness and the visor highlight need a browser check under the room's lighting.
5. **Phone framing.** The robot is out of frame on phone home, so phone proxies describe the view after a visitor turns to it.
6. **Runtime rules.** One-frame clearing, same-frame cards and chips, reduced motion both ways, late load and hidden-tab return need implementation tests. The timeline frames are stills.
7. **Budgets.** No size or frame-time claim is made or reviewed here.

## Smallest useful next step

1. The author makes one text-only edit: the four alignment rows, the three stale "directories absent" notes, and the clearance depth offset. No new renders.
2. Show Owen the v02 state sheet and the phone proxies for the appearance decision, pointing out the closer-set eyes.

Neither step needs another independent review. The next review that adds information is the in-room composition proof.

## What I viewed

All opened as images. Paths under `apprentice/blockout-v02/renders/` unless noted.

| Group | Files |
| --- | --- |
| State sheet | `state-sheet-five-poses.png` |
| Close poses | `pose-idle.png`, `pose-no-match.png`, `pose-sources.png` |
| Three-quarter | `three-quarter-idle.png`, `three-quarter-sources.png` |
| Oblique close | `oblique35-close-idle.png`, `oblique35-close-sources.png` |
| Phone head-on, native size | All five directly: idle, attention, sources, no match, dismissal |
| Phone oblique, native size | Sources directly. All five (idle, attention, sources, no match, dismissal) through my 4x aid |
| Fins hidden | Both, through my 4x aid |
| Timeline | `timeline-f101.png` |
| My aids | [phone-head-on-4x-nearest.png](evidence/phone-head-on-4x-nearest.png), [phone-oblique35-4x-nearest.png](evidence/phone-oblique35-4x-nearest.png), [phone-fins-hidden-4x-nearest.png](evidence/phone-fins-hidden-4x-nearest.png). Cropped and enlarged 4x without smoothing from the author's renders; derived, not source renders |

Not viewed: turnarounds, `front-*`, desktop proxies, `pose-attention`, `pose-dismissal`, `pose-sources-1`, `pose-sources-glance`, three-quarter and oblique-close views of attention, dismissal and no match, and the other five timeline frames. Of the 13 images the author also did not view, I opened none, because no finding here relies on them.

Documents read: `apprentice/README.md`, `design-spec.md`, `ui-and-state-spec.md`, `blockout-v02/README.md`, `integration-decisions.md`, my v01 review, and state-contract rows 108 to 117 and integration-handoff lines 11 and 21 for the contradictions above. I did not re-audit Codex's packages.
