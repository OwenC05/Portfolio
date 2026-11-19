# M3 v03 phone discoverability addendum (F8)

15 November 2026. Independent review addendum for task_d8237267e26c / ctx_735e5fbe050c, by the same retained reviewer that wrote [the M3 v03 review](scene-m3-v03-visual-critique.md). I did not author the art and did not capture the images.

## Verdict

**APPROVE, bounded to F8. F8 is closed at both phone widths.**

In the phone mid-right view at 320x844 and 390x844, the mug with its coffee and coaster, the headphones on their stand, and the nearfield speaker are all in frame, recognisable at native size, and clear of the interface. Not one pixel of any of the three is changed by the closed-Projects UI. No art change, new export, or new exception is needed for F8.

This verdict covers only what the four new images show. It does not change any earlier finding:

- The original 11 px phone key-pitch gate remains unmet. It stands under root's recorded candidate-and-pose-specific exception and is not relabelled as a pass here.
- I do not release M4, grant T1 credit, or approve transfer or the final room. Those stay with root.
- F2 to F5 and F7 from the first review remain open as recorded there.

## What I inspected

Only the four new images, at native size, after checking each hash and byte size against root's receipt.

| Item | SHA256 |
|---|---|
| Receipt `.omx/context/full-kit-m3-v03-phone-mid-right-capture-v02.json` | `cb9524663b7e30e47d1e5529cd8f591a8d78cf6d8c02ddf8956fc17a2246ad4f` (matches the task) |
| `scene-mid-right-320x844-f74.png` (raw) | `197d0d45c7e5bddc327a3f99e64c547e83d22b936cfb2c65979e8f9527cb7088` |
| `scene-mid-right-390x844-f74.png` (raw) | `53f38d71a7d395fb1f19030ec8a2cf1cea22aabd80346c1db8270bc3b32f8998` |
| `chrome-mid-right-closed-320x844.png` (UI composite) | `2ab7bc800904880a970e86bae83bfc0c367d78c652c7e13fb0fd63a8e893bdd5` |
| `chrome-mid-right-closed-390x844.png` (UI composite) | `58acbba34a3d188cb6884b178cbead0f08d1c0e712acc05fecf22f3df66fce7f` |

The images are in `.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m3-v03-phone-mid-right-v02/`.

The receipt records the same candidate as the first review (revision v03, GLB `dc9c6a78…f36baf`, manifest `060bab9a…26405`), eye [-0.7, 2.8, 3.4], FOV 74, yaw 30, pitch -6, device pixel ratio 1, Projects closed, 27 checked inputs, no source drift and no capture failures.

The two raw frames are the same view. The 320 frame equals columns 35 to 354 of the 390 frame except for edge antialiasing: 2.0% of pixels differ at all, 0.02% differ by more than 8 levels, and the largest difference is 25. So every object sits 35 px further right at 390 and is otherwise the same size and shape.

## What is visible

Positions are pixel columns and rows in the raw frames. Where I give a receipt box, it is root's projected bounding box and is only a diagnostic. The visibility judgments come from the rendered silhouettes.

| Item | 320x844 | 390x844 |
|---|---|---|
| Mug, coffee, coaster | Whole mug in frame. Wall and handle span x 9 to 80, rim to base about y 535 to 625. The dark coffee surface shows inside the cream inner wall. The handle is on the right and fully visible. The coaster's shaded rim starts at x 7. | Same, at x 44 to 115. Coaster rim starts at x 42. |
| Headphones on stand | Both ear cups, the band, the stand pole and the round base are in frame. The receipt box is x 37 to 165, y 451 to 597. The right cup's pale outer plate (x 127 to 148, y 513 to 553) is the brightest shape in the group. | Same, 35 px right. Plate at x 162 to 183. |
| Speaker | White cabinet in frame from top (y 428) to desk (y 556), top edge spanning x 33 to 100. The tweeter is fully visible. The woofer is about half hidden behind the left ear cup. | Same, top edge x 68 to 135. |

At both widths the group reads at a glance as a mug in front of headphones hung in front of a speaker. The mug is the largest and clearest of the three, about 72 px wide and 90 px tall. The dark headphone band crosses the white cabinet, which gives it a strong outline.

The view also shows the edge of the central monitor at the far left and the drum kit and controller on the right. I did not review those here.

## Clipping and UI overlap

**Nothing is clipped by the frame.** The tightest margin is at 320, where the coaster rim is 7 px and the mug wall 9 px from the left edge. Root's projected box for the mug and coaster reaches x -1.75 at 320, but that is a corner of a bounding box. The rendered coaster and mug are fully inside the frame. At 390 the mug is 44 px from the edge.

**Nothing is covered by the UI.** I compared each composite with its raw frame pixel by pixel.

| | 320x844 | 390x844 |
|---|---|---|
| Rows where the UI changes no pixel | 116 to 699 (584 rows) | 116 to 717 (602 rows) |
| First row below the middle that the UI changes | 700 | 718 |
| UI-changed pixels inside the mug, headphones and speaker boxes | 0, 0, 0 | 0, 0, 0 |
| Clear rows between each box's bottom and the first UI row | mug 61, headphones 104, speaker 144 | mug 79, headphones 122, speaker 162 |

The header ends above row 116 and the lower controls (Projects toggle, hint, look buttons) start at row 700 or lower. All three items sit between y 424 and y 639, well inside the untouched band. The long run of identical rows also confirms the composites are aligned 1:1 with the raw frames.

## Observations that do not block F8

These are for owners who already hold the related follow-ups. None needs a new M3 export.

1. **The left ear cup and the woofer merge.** Both are dark, and the cup sits directly over the woofer, so at phone size they read as one dark mass (about x 45 to 95, y 475 to 555 at 320). The headphones still read because of the band and the pale right cup. Lighting owner, M6: a rim or accent on the cups would separate them. This sits beside F4.
2. **The mug still renders grey, not blue.** This is F4 from the first review, unchanged, and remains an M6 item.
3. **The coaster is low in contrast.** It is a thin cork-coloured rim on an orange desk and is easy to miss. It does no harm, because the mug carries the read.
4. **The 320 margin is small.** If the phone pose, eye or look step later changes so that this view shifts right by more than about 7 px, the coaster starts to clip, and the mug after 9 px. Integration owner: recheck only if the pose changes.

## Limits of this evidence

- The composites are saved renders placed under the real page at 1:1. They show overlap. They do not show product integration, picking, focus, or touch behaviour.
- The images show that the items are visible when the camera is at yaw 30, pitch -6. They do not show that a phone user reaches that pose with the look controls. That needs the integrated product.
- Only the Projects-closed state was captured. I make no claim about the open project list in this view.
- Lighting is still provisional until M6, so contrast and colour may change.
- The receipt lists one favicon 404 at 320 and an aborted pilot-GLB request on both composites. Neither affects the rendered scene, but I do not claim a clean network log.
- Capture provenance: the earlier v01 attempt used a non-isolated browser and hit a 15.2 px mismatch between the scrollbar and the scene layer width. Root rejected hiding the scrollbar with CSS. This v02 set uses the isolated browser (157.0.8103.52) with full-viewport alignment (offset 0, 0, and page width equal to scene width at both sizes) and no product, source or CSS change. Scrollbar-mode coverage therefore stays a later final-integration item. It is not a proven source regression, and it is not shown to be solved in every browser.

## Recommended handoffs

| Item | Owner | When |
|---|---|---|
| F8 closed, no action | Root | Now |
| Confirm on a phone that the look controls reach this view and that the open project list does not hide the group | Integration | Final integration |
| Scrollbar-mode coverage (v01 mismatch) | Integration | Final integration |
| Separate left ear cup from woofer; mug accent colour (F4) | Lighting | M6 |

## Session and configuration

I acknowledged the task before inspecting anything (msg_f5f782f76658). The observable launch is `claude.exe` with `--model claude-fable-5-2 --effort high`, with no model, effort, provider or base-URL override in the environment. I cannot observe which model or effort the server actually applied. I used no helpers, browser, Blender or server, and I changed no source, capture, or earlier review file. I ran no Git operation that changes anything. I did run one read-only `git status` to list my own new files, which the task's no-Git rule did not ask for.

## Files

| File | SHA256 |
|---|---|
| `design/studio-v2/scene-coordination/m3-v03-phone-discoverability-measure.py` | `61385cef9e587e708c58bcfff3e83ec2b5acc47276462a2262daf243ac3997d8` |
| `design/studio-v2/scene-coordination/m3-v03-phone-discoverability-measurements.json` | `b479c8419fc9d34b4196cc7ca6cabb558ab3aaedb841f68f3cd564bf947baec5` |
| `design/studio-v2/scene-coordination/m3-v03-phone-discoverability-crops.png` (1210x2918) | `4a8c6f8311245844b4f97035ed78be261da79c6f19c2ae104344a7fd4fe66ee7` |

The script checks the receipt and image hashes before it measures, and reads only. The contact sheet shows, for each width, the raw and composite crops of x 0 to 300, y 380 to 680 at twice size, then the whole composite at 1:1.

The first review's files are unchanged: report `b981f63f…4d6619`, script `d5d36e2c…ba47782d`, measurements `5478dcb8…924672`, crops `c8ca05aa…a9492c`.
