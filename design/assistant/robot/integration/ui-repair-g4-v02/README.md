# Ask sheet: two repairs from the integrated visual review (G4, v02)

18 November 2026. Claude (controlled-UI author), `task_42ca81f867b1`.

Fixes medium findings 1 and 2 of `design/assistant/robot/review/integrated-visual-g4/review.md`. Findings 3 to 7 are untouched. Nothing here was checked in a browser: the pixel figures below are estimates from the saved captures, and the fresh captures and the reviewer's recheck decide whether the result is acceptable.

## Files and pins (SHA-256)

| File | Before | After |
| --- | --- | --- |
| `components/studio/assistant/StudioAssistantPanel.tsx` | `103327ed46ee44cb7364873cd72daa7d271c086bcee75d6a5bef4446dabd5511` | `174d06c105483718298e674b4fe2f034f20ada0117cc8baa4a0ae8bf3df35619` |
| `components/studio/assistant/assistant.module.css` | `bd3e77104680db29d09bef5e4abd8314a6de5de33b26ee1d40dca9769c2f5452` | `42605b4b98542d322e94d67d3657733f5563899df8768c55967c55ccce98fbf5` |

No other file was written. `AssistantEntry.tsx` is unchanged (`065d4115…53a9`).

## 1. Heading focus

`.heading:focus` no longer draws the 2 px rounded brown outline. It now draws a 0.2rem accent bar in the left gutter, inset 0.5rem from the top and bottom of the heading (`outline: none` plus one `box-shadow`).

- The heading keeps `tabIndex={-1}` and its ref, so root's focus-on-open is unchanged.
- The question field's 3 px ring and every button, chip, link and toggle focus style are unchanged.
- In forced-colours mode a box-shadow is not painted, so the heading shows no indicator there. It is not a control and cannot be reached with Tab.

## 2. Phone widths with sources

All three rules sit inside the existing `max-width: 47.99rem` block and apply only under `.sheet[data-assistant-result='sources']`. Desktop, the empty sheet, pending, no-match, cancelled and error states are unchanged.

**Question field.** Height drops from three lines (about 94 px) to two (4.4rem, about 70 px). Where the browser supports `field-sizing: content`, the field follows its text instead: one line minimum (2.95rem, about 47 px), two lines maximum.

**"You asked".** The paragraph is still rendered whenever it was before. It now carries `data-repeats-draft`, which is `true` only when `run.question.trim() === draft.trim()`. On phone widths with sources, CSS hides the paragraph while that attribute is `true`.

### How an edited draft keeps the searched question

The comparison runs on every render from the two controlled values. As soon as the visitor changes the draft by anything other than leading or trailing whitespace, the attribute becomes `false` and "You asked" with the searched question returns above the sources. If they type the original question back, it hides again. Nothing else reacts to the edit: no focus call, no scroll call, no submit, no draft change, no action on the run.

The reappearing paragraph does push the sources down by its own height while the visitor types in the field above it. The field itself does not move.

### How long drafts stay usable

The textarea, its `maxLength` of 600, the counter and Ctrl/Cmd + Enter are unchanged. Text beyond two lines scrolls inside the field with the browser's own textarea scrolling, and the caret stays in view while typing. Once a new search leaves the sources state (pending, no-match, error), the field returns to its three-line height.

### Expected effect (estimates from the saved captures, not measured)

| Width | First source title before | Removed above it | Expected after |
| --- | --- | --- | --- |
| 390 | about y=762 | about 59 px (repeat) + 24 to 47 px (field) | title near y=655 to 680, passage text from about y=715 to 740 |
| 320 | about y=800 | about 83 px (two-line repeat) + 24 px (field holds two lines) | title near y=693, passage text from about y=750 |

At 320 the margin is thin: roughly three passage lines should fit above y=844, but only a fresh capture can confirm it.

## Preserved

Labels, the scope sentence, the sources caveat, the status line, run/key/revision guards, chip arrows, the three-line preview with full-passage toggle, both persistent buttons with `aria-disabled`, the contact line, and the single controlled interface (no new state, effect, timer or fetch).

## Checks run

| Check | Result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | exit 0 |
| `node node_modules/eslint/bin/eslint.js components/studio/assistant --max-warnings 0` | exit 0 |
| `node node_modules/prettier/bin/prettier.cjs --check` on both changed files | pass |
| `node --test tests/assistant/studio-panel.test.cjs tests/assistant/studio-experience.test.cjs` | 46 of 46 pass, test files not edited (`studio-panel.test.cjs` at `2b464d96…777a`) |

No server, build, `.next` write, browser, Git or paid action.

## Limits and scenarios for root

1. **No visual or phone pass.** The heading bar, field height and first-viewport passage text all need the fresh 390 and 320 captures.
2. **`field-sizing` support varies.** Browsers without it get the fixed two-line field. I did not check which path the capture browser takes.
3. **Hidden repeat and assistive technology.** While hidden on phones, "You asked" is also absent from the accessibility tree; the same text is in the labelled field. Not checked with a screen reader.
4. **No new test was added** (the test files are root's). Scenarios worth covering:
   - sources shown, draft equal to `run.question` (also with surrounding whitespace): the "You asked" paragraph has `data-repeats-draft="true"`;
   - draft edited: attribute is `false`, the paragraph still shows the original `run.question`, and no action was called;
   - draft restored: attribute returns to `true`;
   - at 390 and 320 with sources, the paragraph's computed `display` is `none` only in the first case, and the field is no taller than 4.4rem;
   - a 600-character draft with sources at 320 scrolls inside the field and stays editable.
