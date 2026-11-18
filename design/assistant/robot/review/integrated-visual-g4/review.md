# Claude review: the apprentice in the actual Studio app (G4, browser smoke v02)

18 November 2026. Claude visual/UX reviewer, `task_e295f4aae534`. Written under `design/assistant/robot/review/integrated-visual-g4/` only. No app, art, design-source, config, Git, server, browser or paid action. I judged saved screenshots; I did not run the app.

## Verdict: PASS for the five states actually viewed

Bounded to: desktop closed (Ask focused), desktop sheet open, desktop sources with four real cards, and the source sheet at 390 and 320 px. The approved character survives integration, the sheet leaves it visible on desktop, the wording is honest, and nothing overflows.

Two medium items should be fixed before final acceptance; neither needs a new asset, a room edit or a placement change. The closed v03 art findings stay closed and I propose no change to anchor or scale.

No-match, error, pending, closed-phone, pose sweep, keyboard and screen-reader behaviour were not shown and are not passed or failed here.

## Ranked findings

| # | Severity | Image | Finding | Narrow remediation |
| --- | --- | --- | --- | --- |
| 1 | Medium | `desktop-open.png` | The focused heading "Ask about Owen's work" gets a full brown rounded box, the same shape and colour as the focused question field in `desktop-sources.png`. Directly above the real field, it reads as a second text input | Keep heading focus (root's decision) but do not draw an input-like box on it: remove the outline on the programmatically focused heading, or use a short left bar. Leave the field's ring as is |
| 2 | Medium | `mobile-390-sources.png`, `mobile-320-sources.png` | After a finished search, no passage text is visible without scrolling. The first source title starts at about y=762 of 844 (390) and y=800 (320). The intro, a tall question field, the buttons, the counter, the status line and a repeat of the question come first. The chips and the caveat do signal that results exist | On phone widths, once results are present, shrink the question field to its content (one or two lines) and drop the "You asked" repeat when it equals the field text. Either alone brings the first passage into view. Do not change focus or scroll ownership |
| 3 | Low to medium | `desktop-sources.png` | The four cards on the tray are small dull grey tiles, about 13 px wide, on gold, under the backdrop. The count of four is readable and matches the four chips, which is the truthful part. They do not read as paper or as sources, and nothing ties a tile to a chip. The leftmost tile looks taller than the others; I cannot tell whether that is a selection cue | Lighten the card colour toward the porcelain cream so they read as paper under the 0.32 backdrop. No numbering needed; cards stay display-only. Confirm what the taller first tile means |
| 4 | Low | `desktop-closed.png` vs `desktop-open.png` | A page scrollbar is present when closed and gone when open, so the whole scene and the nav shift about 15 px right on open | Reserve the scrollbar gutter, or remove the Studio page's vertical scroll if it is unintended |
| 5 | Low | `desktop-sources.png`, both phone images | Source-row dividers run wider than the text column above them (about 10 px each side), so the result list looks slightly misaligned with the form | Align row inset with the form column |
| 6 | Low | `desktop-sources.png` | Chips "1 2 3 4" look like pagination. The "SOURCES" label rescues it. No chip appears selected in any capture | Optional. Judge after seeing a selected state |
| 7 | Low | `desktop-open.png` | The sheet cuts the name plate and the Selected Work list mid-word at its left edge | Acceptable under a modal backdrop; optional |

Taste only, deferred: "Finished in 5 ms" is honest but technical for visitors.

## What works

**Character in the room** (`desktop-closed.png`). Head about 115 px wide, eyes about 25 px, pupils and lid cut clear, red ribbon distinct against the dark slatted panel. Ivory eyes hold up in the real app. No overlap with the wall lights. In this capture the Ask button has focus and the robot shows its attention pose (head up, mittens raised), which reads clearly as a response. There is therefore no plain idle capture in this set.

**Sheet and character** (`desktop-open.png`, `desktop-sources.png`). The sheet spans about x=272 to 880. The whole robot stays visible to its right, dimmed but legible, and the tray tilt between open and sources is noticeable. The left-of-centre decision does its job.

**Wording.** "This searches Owen's published portfolio sources and shows the matching passages. It does not write an answer." and "These are matching published passages. They do not confirm a premise in your question; check what each source establishes." are plain, accurate and placed before the results. "sources only" in the status line agrees. Nothing implies a generated answer. The stream's fallback sentence ("A generated answer is unavailable… please contact Owen") is not visible in any capture, so I cannot say whether or how it is shown.

**Disclosure.** "SHOW PASSAGE 1" is visible under a three-line preview with an ellipsis, in the accent colour and underlined. It is discoverable. Its click height looks small; that needs measuring, not guessing.

**Narrow screens.** No horizontal overflow at 390 or 320. Close stays reachable, the four chips fit at 320 with a little room, and the keyboard hint is correctly dropped. The robot is fully covered by the sheet on phones, which is the stated prototype constraint and not a defect.

## Source versus no-match

Only the sources state was captured. In it the result is carried by four tiles, four chips and four rows from one run, which is the right evidence. Whether an empty presented tray plus the mitten gesture reads as "nothing found" and not "still waiting" cannot be judged from these images.

## Additional evidence needed

Not defects; these are simply unseen.

1. Desktop no-match after a validated abstained answer, at the fixed camera, with the sheet text.
2. Desktop pending and error states, and an idle capture with nothing focused.
3. One chip selected: the chip, its row and the tray cue in the same frame.
4. Source list scrolled: rows 2 to 4, an expanded passage, and where the link to the source page sits.
5. Measured hit height of "Show passage" and of the chips at 320 px.
6. Phone closed state at 390 and 320: is the HTML Ask entry obvious without the robot in frame.
7. Phone sheet with the software keyboard up.
8. The other four poses and interruptions in the real app, plus card clearance against the cymbal and speaker when the tray is presented.
9. Keyboard-only pass (Tab order, Escape, focus return) and a screen-reader read of the status line, caveat and chips.
10. Whether clicking the robot itself opens Ask.

Root's two engineering repairs (attention during project modality; native Ask focus return on source navigation) are not reviewed or duplicated here. The earlier click-coordinate tooling failure is not treated as an app defect.

## Viewed

Images under `integration/verification-g4-v01/browser-smoke-v02/`, all opened at full size.

| File | SHA-256 |
| --- | --- |
| `desktop-closed.png` | `13625b2ee40cee0260979616ecdb808f442a81f94ce1d4f9b3f73d2f7de1850e` |
| `desktop-open.png` | `5196411e5ddfa1267c25382f6ac5ae6b069a99f2f63a8c1f7061dd157d612fbd` |
| `desktop-sources.png` | `e646511370669341036c4f2641d13bbf9905bb689e43bdc2da7aea17d88201b2` |
| `mobile-390-sources.png` | `47bc1382a8638f0476decdac0512639b05c7bcd6a6cc8315344360ec1e4bd351` |
| `mobile-320-sources.png` | `78169c0a1c1cac067402679d0c8c7e690fcce3d682d1f360436149d3d553e7e3` |

Read: `smoke-checks.json`, `real-sources.json` (first part), `mobile-390.json`, `mobile-320.json`, `../browser-verification.md`, and the sheet, phone, no-match and tray lines of `placement-selected-a/coordinator-decisions.md`. I did not read `ask-interface.md` or `placement.md` in full, and did not open the screenshots in the two earlier browser folders.

Evidence made here, in `evidence/`: `robot-closed-open-sources-4x-nearest.png`, `tray-cards-8x-nearest.png` (unsmoothed enlargements), `sheet-results-native.png` (native crop, not separately inspected).
