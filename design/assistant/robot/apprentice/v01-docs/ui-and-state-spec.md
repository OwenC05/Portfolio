# Studio apprentice: UI and state spec

15 November 2026. Claude design lane, package A. Proposal for the Studio page only. No application code was changed.

This reuses what is already in the worktree: the dock, status line and native dialog in `app/studio/StudioShell.tsx`, and the form, status text and source list in `components/assistant/AssistantWorkbench.tsx`. It is not a chat window. There are no message bubbles, no avatar column, no typing dots and no transcript: one question, one result, the same as `/ask` today. Generation stays off.

Behaviour, focus rules and transport belong to Codex's integration plan. Where this document names a file or class, it is to show which existing pattern to reuse, not to assign code.

## 1. Entry points

There are two ways in, and they open the same panel.

| Entry | Who it serves | Behaviour |
| --- | --- | --- |
| **Ask button (HTML)** | Everyone: keyboard, touch, screen reader, phone, no WebGL | A real `<button>` in the Studio dock. Always present, whatever the camera shows |
| **The robot (3D)** | Pointer and touch users who can see it | Hover shows the label; click or tap opens the panel. Never the only way in |

**Ask button.**

- Visible text: `Ask`. Accessible name: `Ask about Owen's work. Searches published sources.`
- Styled like `projectsToggle`, with a small two-ring glyph (the robot's eyes) in place of the chevron. Minimum 44 px target.
- Tab order: after the Projects toggle and project links, before the look controls.
- Desktop: sits in the dock row between the project list and the look group.
- Phone: shares the row of the existing "Drag to look · Select a screen" status pill, to its right. The bottom row (Projects plus look buttons) is already full, and is two rows at 320. **Not tested** at 320 or 390 in the real layout; if it does not fit, the fallback is to shorten the hint to "Drag to look" at narrow widths.
- It does not pulse, bounce or badge itself.

**Robot label.** On hover or when the Ask button has focus, a small HTML label appears beside the Ask button (not floating in the scene): `Searches Owen's published sources`. It says "searches", never "knows".

**Robot hit target.** The whole head-and-body silhouette, depth-tested like project screens. It must not create an invisible clickable region and must not steal clicks from a project screen behind or near it.

**When the robot is off screen.** On phone home it is out of frame in zone A. The Ask button still works and the panel carries everything. The camera does not turn by itself.

## 2. Panel

A second native `<dialog>` with the same chrome as the project panel: `panel`, `panelBar`, `panelClose`, `panelScroll`. Bar label: `Ask · source search`.

**Layout.**

- Desktop: a side sheet about 420 px wide on the **left**, so the robot in zone A on the right stays in view while results show. This depends on final placement; if the robot moves, the sheet side flips.
- Phone: a bottom sheet, like the Projects list, up to about 70% of the height. It may cover the robot. That is acceptable because the tray strip below repeats the tray in HTML.
- Only one reading surface at a time. Opening Ask closes the Projects list; a project panel and the Ask panel are never open together. Room look controls are disabled while it is open, as they are for project panels.

**Content, top to bottom.**

| # | Block | Source |
| --- | --- | --- |
| 1 | Heading `Ask about Owen's work` (focus lands here on open) | Existing title text |
| 2 | Note `Source search. Generated answers are off.` | Shortened from the existing preview note |
| 3 | Question box, `Ask`, `Cancel`, character count | Existing form, unchanged |
| 4 | `Try asking` examples; collapses to one line after the first question | Existing examples |
| 5 | Status line, `role="status"` | Existing status text |
| 6 | **Tray strip** | New, section 3 |
| 7 | Source list with expandable passages and links | Existing `sourceList`, without the "cited" tag |
| 8 | Score note `Relevance scores rank passages for this question; they aren't probabilities.` | Existing |
| 9 | Contact line with the email link | Existing |

**Left out on purpose.**

- The constellation map and the pipeline step list from `/ask`. The Studio's centre screen already shows a QUESTION, RETRIEVAL, QWEN diagram for the dissertation; a second pipeline next to it would suggest the robot runs a model. The tray is the Studio's retrieval picture.
- The "cited" tag. In source-only mode every hit is cited, so it says nothing.
- The separate "Cited passages" quote list. It repeats the source list in this mode.
- Any generated-answer area. If generation is ever enabled, that is a new design task.

## 3. Retrieval visualisation: the tray, twice

The same real hits are shown in two places that always agree.

| | In the room | In the panel |
| --- | --- | --- |
| What | Cards standing on the robot's tray | The tray strip: one row of numbered chips |
| Count | One card per real hit, 0 to 4 | One chip per real hit, 0 to 4 |
| Order | Rank 1 on the viewer's left | Rank 1 on the left |
| Rank cue | Rank 1 card slightly larger | Number `1` to `4` on each chip |
| Empty | Lit empty tray | Text: `Tray empty. No passages matched.` |
| Before any search | Empty tray | No strip at all |

**Tray strip.** A single row under the status line. Each chip shows the rank number and the source title, cut short with an ellipsis. Chips are buttons. No placeholder chips: the row has exactly as many chips as hits, so it never implies four were expected.

**Where selection lives.** In the panel's existing `selected` state. One selection, three views of it:

- Activating a chip selects that hit, expands its passage in the source list and scrolls it into view.
- Expanding a passage in the list selects the same hit and marks its chip (`aria-pressed`).
- Clicking a card on the tray (pointer only, where the robot is visible) does the same as its chip.
- The selected card lifts 6 mm and grows to 1.15. The selected chip gets a border and `aria-pressed="true"`. Neither relies on colour alone.
- Selecting again clears it.

**Where details live.** Only in HTML: the source list holds heading, title, passage text, relevance score and the link. The 3D layer never shows text, scores or links. At phone size a card is about 8 px wide.

**Honesty rules.**

- Cards and chips appear when the real `retrieval` event arrives, never earlier.
- The count is always the real hit count. No decorative extras.
- The status line uses the real numbers, for example `4 passages · 9 ms` and then `Finished in 9 ms · sources only`.
- Scores are labelled relevance scores. Nothing in the room encodes the score.
- Nothing shows a matched passage as verified or correct. The robot presents; it does not confirm.
- There is no generation step to draw, so none is drawn.

## 4. State map

| Condition | Robot | Tray strip | Status line | Other panel content |
| --- | --- | --- | --- | --- |
| Panel closed | Idle; attention on hover or focus | n/a | n/a | n/a |
| Panel open, nothing asked | Attention | Hidden | `Ready. Ask a question to search Owen's published sources.` | Form, examples |
| Sent, no event yet | Attention, unchanged | Hidden | `Sending your question…` | Cancel enabled |
| `retrieval-start` | Attention, unchanged | Hidden | `Searching published sources…` | |
| `retrieval`, 1 to 4 hits | Sources, N cards | N chips | `N passages · X ms` | Source list |
| `retrieval`, 0 hits; `answer: abstained` | No match | `Tray empty. No passages matched.` | The server's message | Contact line moves up, directly under the strip |
| `done` | Unchanged | Unchanged | `Finished in X ms · sources only` | |
| Cancelled | Attention, tray dim and empty | Hidden | Existing cancel notice | `Try again` |
| Timeout, connection error, 429, malformed stream | Attention, tray dim and empty | Hidden | Existing error notice | `Try again` |
| New question while a result shows | Old cards and chips go at once; then as above | | | |
| Close or Escape | Dismissal, then idle | Cleared | Cleared | Focus returns to whichever control opened the panel |

A failed or cancelled request is not shown as "no match": the tray dims rather than presenting itself empty, and the strip is hidden rather than saying nothing matched.

## 5. Keyboard

- `Tab` reaches the Ask button in the dock. `Enter` or `Space` opens the panel.
- Focus moves to the panel heading, then the question box is next in order.
- `Ctrl` or `⌘` plus `Enter` in the box asks, as today.
- Tray chips are ordinary buttons in tab order, between the status line and the source list. Left and right arrows move between chips.
- `Escape` or `Close` closes the panel and returns focus to the invoking control. If the robot was clicked, focus returns to the Ask button.
- The 3D cards and the robot are never tab stops. The canvas stays `aria-hidden`.
- Screen readers get the result from the status line and the list. The robot's pose is not announced.

## 6. Phone and touch

- Entry is the Ask button; tapping the robot also works when it is in frame. A drag that starts on the robot is a look gesture, not an activation.
- The sheet rises from the bottom. The question box is not focused automatically, so the keyboard does not cover the sheet before the visitor has seen it. **This differs from desktop and needs the interface owner's agreement.**
- Chips are at least 44 px tall and wrap to two rows of two at 320 wide.
- Cards on the 3D tray are not tap targets on phones; they are too small. Chips are the selection control.
- Closing the sheet returns to the same room view and scroll position.

## 7. Reduced motion

- The robot swaps between still poses in one frame (see [design-spec.md section 9](design-spec.md)).
- Chips appear together, without a stagger. The sheet opens without a slide.
- The preference can change while the page is open; the next state change follows the new setting.
- Nothing is lost: every state is also text in the status line.

## 8. When the scene is unavailable

If WebGL fails, is still loading or the robot asset fails to load, the Ask button, panel, tray strip, source list and contact line all work exactly the same. Only the 3D robot is missing. The label then reads `Searches Owen's published sources` with no reference to the robot.

## 9. Copy

| Place | Text |
| --- | --- |
| Button | `Ask` |
| Button accessible name | `Ask about Owen's work. Searches published sources.` |
| Hover or focus label | `Searches Owen's published sources` |
| Panel bar | `Ask · source search` |
| Heading | `Ask about Owen's work` |
| Note | `Source search. Generated answers are off.` |
| Empty strip | `Tray empty. No passages matched.` |
| Chip accessible name | `Passage 2 of 4: {title}` |

The robot has no name in any copy. "Apprentice" is a working label for the team.

## 10. Open items

| Item | Who decides |
| --- | --- |
| Ask button position on phones at 320 and 390 | Interface owner, tested in the real layout |
| Desktop sheet on the left | Owen and placement; flips if the robot is not in zone A |
| Whether the phone sheet skips auto-focus of the question box | Interface owner and Codex (focus contract) |
| Whether a 3D card click is worth its picking cost on desktop | Codex, step D. Dropping it loses nothing: chips do the same |
| Exact status strings versus the existing `statusText` | Codex, when the shared run state is extracted |
| Tray strip visual styling | Later UI design pass (plan step G3) |
