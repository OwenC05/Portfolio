# Studio apprentice: UI and state spec, v02

15 November 2026. Claude design lane, package A. v02 repair after the [v01 review](../review/blockout-v01/review.md). Proposal for the Studio page only. No application code was changed. The [v02 recheck](../review/blockout-v02/review.md) returned PASS for the isolated concept only; appearance, the room, runtime behaviour and budgets are not approved or verified. The v01 text is kept in [v01-docs/](v01-docs/README.md).

**Changed in v02:** one rule for when cards, chips and the list appear and disappear (section 3); a robot entry in every state row, with waiting and no match told apart by tray position (section 4); reduced motion changing mid-gesture (section 7).

**Aligned after the recheck (text only):** no match now starts on the abstained answer, not on a zero-hit retrieval; more than four hits and abstained-with-hits are errors that clear everything; cards in the room are display only; focus goes to the heading on every screen size; the panel is a controlled view inside root's single modal (sections 2 to 6 and 10).

This reuses what is already in the worktree: the dock, status line and native dialog in `app/studio/StudioShell.tsx`, and the form, status text and source list in `components/assistant/AssistantWorkbench.tsx`. It is not a chat window. There are no message bubbles, no avatar column, no typing dots and no transcript: one question, one result, the same as `/ask` today. Generation stays off.

Behaviour, focus rules and transport are decided by [root's checkpoint D1](../integration-decisions.md) and Codex's [state contract](../integration/state-contract.md). This document follows them; where they and this text ever differ, they win. Where this document names a file or class, it is to show which existing pattern to reuse, not to assign code.

## 1. Entry points

There are two ways in, and they open the same panel.

| Entry | Who it serves | Behaviour |
| --- | --- | --- |
| **Ask button (HTML)** | Everyone: keyboard, touch, screen reader, phone, no WebGL | A real `<button>` in the Studio dock. Always present, whatever the camera shows |
| **The robot (3D)** | Pointer and touch users who can see it | Hover shows the label; click or tap opens the panel, when no panel is open. Never the only way in |

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

A controlled panel view with the same chrome as the project panel: `panel`, `panelBar`, `panelClose`, `panelScroll`. Bar label: `Ask · source search`.

**One modal, owned by root.** Root owns the single native dialog lifecycle: which panel is showing, opening and closing, history, focus and scroll locking. This panel receives its content, state and handlers from root. It does not open a dialog of its own, does not hold a second request flow, and does not fetch or parse anything itself.

**Layout.**

- Desktop: a side sheet about 420 px wide on the **left**, so the robot in zone A on the right stays in view while results show. The robot's no-match fin points to the viewer's left, toward this sheet, assuming the robot is turned to face the fixed eye ([design-spec.md section 2](design-spec.md)). This depends on final placement; if the robot moves, the sheet side and the pointing fin flip together.
- Phone: a bottom sheet, like the Projects list, up to about 70% of the height. It may cover the robot. That is acceptable because the tray strip below repeats the tray in HTML.
- Only one reading surface at a time. Opening Ask closes the Projects list; a project panel and the Ask panel are never open together, and root arbitrates between them. Room look controls and all scene input are disabled while it is open, as they are for project panels.

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
| What | Cards standing on the robot's tray, display only | The tray strip: one row of numbered chips |
| Count | One card per real hit, 0 to 4 | One chip per real hit, 0 to 4 |
| Order | Rank 1 on the viewer's left | Rank 1 on the left |
| Rank cue | Position only. Rank 1 is also drawn slightly larger, as decoration; it does not read at phone size | Number `1` to `4` on each chip |
| No match | Tray presented (lowered, forward, tilted) and empty | Text: `Tray empty. No passages matched.` |
| Before any result, and while waiting, including zero retrieved with the response pending | Tray carried flat under the body, empty | No strip at all |

**One hit list.** Cards, chips and the source list all render from the one current-run snapshot (D1 decisions 1 and 2). They are never updated separately.

- **Clearing.** A new submit, a superseded request, cancel, any failure including a protocol error, close and unmount empty the list in one state update, and that update asks the scene for a render. On the first frame rendered after it, no card, chip or list row from the previous request is drawn. There is no exit animation.
- **Showing.** When `retrieval` arrives for the current request, all N cards, chips and rows appear together on the first frame rendered after it. There is no entry animation and no stagger, with reduced motion on or off.
- **Only the robot's pose eases afterwards.**
- **Testable form:** on the first rendered frame after the state change, cards drawn = chips drawn = current hit count, and none belongs to an earlier request.

The card images in this pack are static illustrations from the blockout script. Nothing in the blockout is bound to real retrieval.

**Tray strip.** A single row under the status line. Each chip shows the rank number and the source title, cut short with an ellipsis. Chips are buttons. No placeholder chips: the row has exactly as many chips as hits, so it never implies four were expected.

**Where selection lives.** In the shared run snapshot, set only from HTML. One selection, shown in three places:

- Activating a chip selects that hit, expands its passage in the source list and scrolls it into view.
- Expanding a passage in the list selects the same hit and marks its chip (`aria-pressed`).
- Cards on the tray cannot be clicked or tapped. While the panel is open the room behind it takes no input, and the scene has no source-card target.
- The selected card lifts 6 mm and grows to 1.15, purely as a mirror of the HTML selection. The selected chip gets a border and `aria-pressed="true"`. Neither relies on colour alone.
- Selecting again clears it.

**Where details live.** Only in HTML: the source list holds heading, title, passage text, relevance score and the link. The 3D layer never shows text, scores or links. At phone size a card is about 8 px wide.

**Honesty rules.**

- Cards and chips appear when the real `retrieval` event arrives, never earlier, and never outlive the request they came from.
- The count is always the real hit count. No decorative extras.
- The status line uses the real numbers, for example `4 passages · 9 ms` and then `Finished in 9 ms · sources only`.
- Scores are labelled relevance scores. Nothing in the room encodes the score.
- Nothing shows a matched passage as verified or correct. The robot presents; it does not confirm.
- There is no generation step to draw, so none is drawn.

## 4. State map

Every row has a robot entry. "Carried" and "presented" are the tray's two positions ([design-spec.md section 6](design-spec.md)). Triggers follow the [state contract](../integration/state-contract.md).

| Condition | Robot | Tray strip | Status line | Other panel content |
| --- | --- | --- | --- | --- |
| Panel closed | Idle, tray carried and dim; attention on hover or focus | n/a | n/a | n/a |
| Panel open, nothing asked | Attention, tray carried and lit | Hidden | `Ready. Ask a question to search Owen's published sources.` | Form, examples |
| Sent, no event yet | Attention, unchanged | Hidden | `Sending your question…` | Cancel enabled |
| `retrieval-start` | Attention, unchanged | Hidden | `Searching published sources…` | |
| `retrieval`, 1 to 4 hits | Sources, tray presented, N cards | N chips | `N passages · X ms` | Source list |
| `retrieval`, 0 hits: zero retrieved, response pending | Attention, unchanged, tray carried and lit. No no-match gesture | Hidden | `0 passages · X ms. Waiting for the response…` | No contact emphasis yet |
| Valid abstained `answer` after a zero-hit `retrieval` | No match, tray presented and empty, fin pointing to the panel | `Tray empty. No passages matched.` | The server's message | Contact line moves up, directly under the strip |
| `answer` in sources mode after hits | Unchanged | Unchanged | Unchanged | Unchanged |
| `done` | Unchanged | Unchanged | `Finished in X ms · sources only` | |
| New question while a result shows | Cards gone on the next frame; eases to attention with the tray carried and lit | Hidden on the same frame | `Sending your question…` | Source list and selection cleared on the same frame |
| Cancelled | Cards gone on the next frame; attention, tray carried and dim | Hidden | Existing cancel notice | Source list and selection cleared; `Try again` |
| Timeout, connection error, 429, malformed stream, including after a result was shown | Cards gone on the next frame; attention, tray carried and dim | Hidden | Existing error notice | Source list and selection cleared; `Try again` |
| Protocol error: more than four hits, abstained with hits, sources without hits, or citations that do not match the hits | Same as any failure: every view cleared, attention, tray carried and dim | Hidden | Error notice | Source list and selection cleared; `Try again` |
| Close or Escape | Cards gone on the next frame; dismissal, then idle | Cleared | Cleared | Focus returns to whichever control opened the panel |

**Waiting is not no match.** While a response is pending the tray is carried: flat and close under the body. That includes the time after a `retrieval` with 0 hits and before its answer. Only the valid abstained answer presents the empty tray. The two differ in tray height, depth and tilt and in head pose, not only in glow or fin position.

**Contradictory data is an error, not a display choice.** The server's cap is four hits. If more than four arrive, or an abstained answer arrives with hits, nothing is truncated, trimmed or shown in part: cards, chips, list, answer and selection all clear together and the notice offers Try again.

A failed or cancelled request is not shown as "no match" either: the tray returns to carried and dims, and the strip is hidden.

The `0 passages` status wording is my suggestion; the exact string belongs to the shared run state.

## 5. Keyboard

- `Tab` reaches the Ask button in the dock. `Enter` or `Space` opens the panel.
- Focus moves to the panel heading, on desktop and phone. The question box is next in order.
- `Ctrl` or `⌘` plus `Enter` in the box asks, as today.
- Tray chips are ordinary buttons in tab order, between the status line and the source list. Left and right arrows move between chips.
- `Escape` or `Close` closes the panel and returns focus to the invoking control. If the robot was clicked, focus returns to the Ask button.
- The 3D cards and the robot are never tab stops, and the cards are never pointer targets. The canvas stays `aria-hidden`.
- Screen readers get the result from the status line and the list. The robot's pose is not announced.

## 6. Phone and touch

- Entry is the Ask button; tapping the robot also works when it is in frame. A drag that starts on the robot is a look gesture, not an activation.
- The sheet rises from the bottom. Focus lands on the heading, the same as on desktop, so the keyboard does not cover the sheet before the visitor has seen it.
- Chips are at least 44 px tall and wrap to two rows of two at 320 wide.
- Cards on the 3D tray are not tap targets on any screen size. Chips and the list are the selection controls.
- Closing the sheet returns to the same room view and scroll position.

## 7. Reduced motion

- The robot swaps between still poses in one frame (see [design-spec.md section 9](design-spec.md)).
- Cards and chips already appear together in every mode. The sheet opens without a slide.
- **Turned on while a gesture is running:** the gesture is cancelled, including any remaining glance, shrug or smile, and the next rendered frame shows the settled still for the current state.
- **Turned off:** nothing moves because of the change. The next real state change animates normally.
- Closing with reduced motion on goes straight to the idle still, with no goodbye gesture.
- Nothing is lost: every state is also text in the status line.

## 8. When the scene is unavailable

If WebGL fails, is still loading or the robot asset fails to load, the Ask button, panel, tray strip, source list and contact line all work exactly the same. Only the 3D robot is missing. If the robot finishes loading while a state is current, it appears in that state's settled still, with no gesture. The label then reads `Searches Owen's published sources` with no reference to the robot.

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

## 10. Alignment with root and Codex

[root's checkpoint D1](../integration-decisions.md) and Codex's [state contract](../integration/state-contract.md) decide behaviour. Where an earlier version of this document proposed something different, the decision below replaces it. Codex's packages are at [integration handoff](../integration/integration-handoff.md), [implementation plan](../integration/implementation-plan.md), [verification matrix](../integration/verification-matrix.md), [asset contract](../asset-pipeline/asset-contract.md) and [asset readiness](../asset-pipeline/readiness.md).

| Point | Decision this document follows |
| --- | --- |
| One source for both views | One immutable run snapshot. Cards, chips and source list all derive from it (section 3) |
| Request identity | Each submit gets a run id. Events for an older run are ignored and change nothing on screen |
| Zero retrieval | Stays waiting and pending. No match starts only on the valid abstained answer (section 4) |
| More than four hits; abstained with hits | Recoverable protocol errors. Every view clears. No truncation and no partial display |
| Failure after a result was shown | Cards, chips, list, answer, selection and timings clear together |
| Panel closed during a request | The request is invalidated and aborted. Late events are ignored. Reopening is empty, with the draft kept and no automatic request |
| Reduced motion changed mid-gesture | Section 7 |
| Stale cards | Zero on the first rendered frame after the change (section 3) |
| Selection | Through HTML chips and the list only. Keyed by run and source identity, not by position. Cleared on every new request, cancel, failure and close |
| Cards in the room | Display only. The selected card may mirror the HTML selection; it is never a scene input target |
| Focus | The panel heading, on desktop and phone |
| Modal | Root owns the one modal lifecycle. This panel is a controlled view inside it |
| Robot asset loads late | It appears in the current state's settled still, with no replay |
| Hidden tab | On return, the robot shows the current state's settled still. Gestures missed while hidden are not replayed |

## 11. Open items

| Item | Who decides |
| --- | --- |
| Ask button position on phones at 320 and 390 | Interface owner, tested in the real layout |
| Desktop sheet on the left, and the robot turned to face the eye | Owen and placement; both flip or change if the robot is not in zone A |
| Whether the selected card keeps its lift as a display-only mirror | Root and Codex. The reviewer notes it is undecided; nothing in the stills depends on it |
| Exact status strings versus the existing `statusText` | Codex, when the shared run state is extracted |
| Tray strip visual styling | Later UI design pass (plan step G3) |
