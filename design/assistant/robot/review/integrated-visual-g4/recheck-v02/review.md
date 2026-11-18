# Claude recheck v02: heading focus and phone source visibility

18 November 2026. Claude visual/UX reviewer, `task_5f2dc242bda8`. I wrote the original integrated review; I did not implement the UI repair. Written under `design/assistant/robot/review/integrated-visual-g4/recheck-v02/` only. No app, asset, browser, server, build, Git or paid action. Judged from saved screenshots of build `XH_oOqBftWO8em8L7m4E6`; I did not run the app. The original review is unchanged.

## Verdict: PASS. Both medium findings are closed.

No remaining visual or accessibility blocker is visible in the images I viewed. Robot click activation is a known open technical fault outside this review and is not passed here.

## The two repaired findings

| # | Original finding | Status | What the image shows |
| --- | --- | --- | --- |
| 1 | Focused heading looked like a second text field | **Closed** | `browser-viewport-v02/desktop-open.png`: the box is gone. A short brown bar sits at the left of "Ask about Owen's work". The heading reads as a heading and the question field is the only boxed input. In `desktop-sources.png` the heading has no mark and the field keeps its ring |
| 2 | No passage text visible on phones after a search | **Closed** | `mobile-390-sources.png`: title at about y=656, three lines of passage and "SHOW PASSAGE 1" all visible. `mobile-320-sources.png`: title at about y=693, three full passage lines ending "from July 2025 to…", and "SHOW PASSAGE 1" at about y=829, just inside the 844 viewport. The field is one line at 390 and two at 320; the repeated question is gone |

Low residual on finding 1, not blocking: the bar touches the "A" (about 2 px gap), so at a glance it can read as a text caret or a stray "I". Moving it 6 to 8 px further into the left gutter would remove that. Optional.

At 320 the fit is exact with little to spare. A longer first title or a third question line would push "Show passage" below the fold, but passage text would still be visible, which is what the finding asked for.

## Edited draft

`mobile-320-edited-draft.png`: the field holds different text at 600/600, and "YOU ASKED / What has Owen worked on at LexisNexis?" is back above the four chips, with the same results below. The visitor can still see which question the results belong to. Verified as designed. The cost, as the author stated, is that sources move down while editing; here the first title is at about y=777 and passage text starts at the bottom edge. Acceptable.

## Closed phone entry

`mobile-390-closed.png`, `mobile-320-closed.png`: the robot is off-frame, as accepted. "Ask about Owen's work" is a labelled button at lower right with a light outline, above the look controls and clear of the Projects button. It is the most prominent control on screen and I judge it discoverable at both widths. At 320 the "Drag to look" hint moves below it and fits.

Both captures show the button with a highlight ring, so I cannot tell its unfocused appearance on phones from these images.

## Previously unseen desktop states

Robot crops are in `evidence/robot-idle-pending-selected4-nomatch-error-3x-nearest.png`.

| State | Image | What I saw |
| --- | --- | --- |
| Idle | `lifecycle-keyboard/desktop-idle.png` | Neutral robot, level empty tray, nothing focused. Clear and calm. This fills the idle gap from my first review |
| Pending (fixture) | `lifecycle-keyboard/desktop-pending.png` | "Sending your question…", question echoed, no stale results. Robot in the attentive pose with a level empty tray |
| Sources, source 4 selected | `lifecycle-keyboard/desktop-selected-source-4.png` | Row 04 has a left bar and tinted background, full passage shown, "HIDE PASSAGE 4" focused with a visible ring. Clear in the sheet. Rows 2 and 3 confirm the list scrolls cleanly |
| No-match (real request) | `lifecycle-navigation/desktop-no-match.png` | "NO MATCHING SOURCES. Owen's portfolio sources don't support an answer to this, so the assistant won't guess." plus a contact line. Tray is tilted toward the viewer and visibly empty; head turned toward the sheet |
| Error (fixture) | `lifecycle-keyboard/desktop-error-fixture.png` | Red-barred message, "Nothing is shown from the earlier search.", "Try again" button, suggestions offered. No stale data |
| Project takeover | `lifecycle-history/desktop-project-takeover.png` | Project sheet replaces the Ask sheet; no cards on the tray; robot neutral and half covered by the wider sheet |

Evidence-led reading of sources versus no-match versus pending: the three are distinguishable on the robot. Pending is a level empty tray, sources is a tilted tray with four tiles, no-match is a tilted tray with nothing on it. The sheet text agrees in each case. I could not make out a distinct mitten gesture in no-match at this size; the empty tilted tray carries it.

Low notes, none blocking and none to be patched by preference:

1. **Tray selection cue.** With source 4 selected, the rightmost tile looks slightly larger, but so does tile 1 by design. At this size the tray does not tell me which source is selected. The sheet does, so nothing false is shown. If the tray cue is meant to be read, the taller first card works against it.
2. **Status wording.** "Finished in 0 ms · not supported." could be read as "this feature is not supported". The panel heading below it is clear. Optional: reuse "no matching sources".
3. **Error and pending look the same on the robot.** Both show the attentive pose and a level empty tray. Root should confirm that is intended; the text separates them.
4. **Project heading focus.** The project sheet still draws the input-like box round "TypeForge". There is no input beside it and project styling was to stay intact, so I do not ask for a change.

## Limits

- Screenshots only, Chromium, emulated phone widths. No physical device, software keyboard, screen reader or forced-colours view. The author notes the heading bar is not painted in forced-colours mode; unseen here.
- Pending and error are controlled fixtures, not live failures.
- Not seen: phone no-match, pending or error; chips' selected styling in the chip row itself; measured hit sizes; the full pose and interruption sweep; other camera angles.
- Robot click activation, the two cleanup paths and the runtime repair are Codex's and are not assessed.
- Anchor, scale and art were not reopened. Card tint, scrollbar shift and row inset from the first review remain deferred.

## Viewed

All opened at full size. Paths under `integration/verification-g4-v02/`.

| File | SHA-256 |
| --- | --- |
| `browser-viewport-v02/desktop-open.png` | `ee44158362d45ad97e8db5bd967f26cf36ab35f4ec406bd81f058288869eb04b` |
| `browser-viewport-v02/desktop-sources.png` | `b2a0be88c3464f778d6229f64ca571d6abd71ebf209f2fb6862bcb609336e071` |
| `browser-viewport-v02/mobile-390-sources.png` | `77e67dbf1f558a2d3ac0659274b30d14d86b95526b96d3f7a0a2b334620f51e6` |
| `browser-viewport-v02/mobile-320-sources.png` | `0bedd502c4579892b4c7556693028c2da1eae0d9f15e76cf9723c2d5bd80f32e` |
| `browser-viewport-v02/mobile-320-edited-draft.png` | `48cf5cc76a1d44cf17ad71f1dcf79be27cbf999f7577b2c030dab3b8862a7852` |
| `browser-viewport-v02/mobile-390-closed.png` | `b05d61db5f188e6a38fd1ba7dcb25e4325514be1abd525e247a9e808cb16b4c3` |
| `browser-viewport-v02/mobile-320-closed.png` | `dad0cd3c0587005d562fdbeb3081d21acae32a4d03954acda9b1c31a0e6d1e4a` |
| `lifecycle-keyboard/desktop-idle.png` | `c98b66c4eb6884e81d7b66704dd538295f14d1cbeb30e36f1c51016ab2344735` |
| `lifecycle-keyboard/desktop-selected-source-4.png` | `91202765fb72809174b4f00b98e7eafa2c5b348e4d219d6f2f541bc91a5ddbc5` |
| `lifecycle-keyboard/desktop-pending.png` | `64c34edcc359d56e190d4a48a6fe8a8603ad06ddf705cf6a9f4d3c8cb26ef4a1` |
| `lifecycle-keyboard/desktop-error-fixture.png` | `9bf286a2ca1eacce29d730211b2185c9a4f1a86a6f00ca9d3df26e7082a00e51` |
| `lifecycle-navigation/desktop-no-match.png` | `eee4a8ead27a0b6ad3d698a254165176368495ade8bb989c7b47b0283caab44c` |
| `lifecycle-history/desktop-project-takeover.png` | `90d86a99dbb9f424d5f2416ca9c661198c4ea068715cf7db8eb65690ff81707a` |

Read: `integration/ui-repair-g4-v02/README.md` (to its limits section) and the lifecycle paragraphs of `verification-g4-v02/README.md`. Not opened: the JSON receipts, `browser-viewport-v02/desktop-closed.png`, the sibling `browser/` folder, the `failure.png` files and `workbench-repairs/`.

Evidence made here, in `evidence/`: `heading-focus-bar-4x-nearest.png`, `robot-idle-pending-selected4-nomatch-error-3x-nearest.png` (unsmoothed enlargements).
