# G3 / P6: controlled Studio Ask interface, implementation handoff

17 November 2026. Claude UI lane, `task_7ab9eaee385b`. Implements [ask-interface.md](../placement-selected-a/ask-interface.md) under [coordinator-decisions.md](../placement-selected-a/coordinator-decisions.md).

**Status.** The entry, the sheet and the `StudioShell` seam are written, typed, linted and formatted. Nothing is wired: `StudioExperience.tsx` is root's and is unchanged, so the current app renders no Ask entry and behaves as before. **No browser was used.** Layout, wrapping, the native dialog, real focus and the phone keyboard are unverified.

**Revision, 18 November 2026** (`task_bab87fb0658d`). Two findings from the independent review, [review/controlled-ui-g3/review.md](../review/controlled-ui-g3/review.md), are repaired: source chips now have left and right arrow navigation, and the close and takeover focus instructions below are separated. Only `StudioAssistantPanel.tsx` and this file changed.

## Files

| File | Change | SHA-256 |
| --- | --- | --- |
| `app/studio/StudioShell.tsx` | Three optional props; one slot in the dock; variant on the existing dialog | `ef637b1d61f39fd0cddc34f2697ce35546735f05219acb435d9e7d7c314c6738` |
| `app/studio/studio.module.css` | `ask` grid area at the three breakpoints; assistant-only dialog rules | `81bd8787a6259212d7244702ffeb14ce0815aa9a1a51f5f47bb2d3ef4b0549ea` |
| `components/studio/assistant/AssistantEntry.tsx` | New | `065d4115428f0dc042a6a3c7e599179ddd7b5aa88495eaed90f9c546c60853a9` |
| `components/studio/assistant/StudioAssistantPanel.tsx` | New; revised 18 November | `103327ed46ee44cb7364873cd72daa7d271c086bcee75d6a5bef4446dabd5511` |
| `components/studio/assistant/assistant.module.css` | New | `bd3e77104680db29d09bef5e4abd8314a6de5de33b26ee1d40dca9769c2f5452` |

Before my edits: `StudioShell.tsx` `03b735a3…d82306`, `studio.module.css` `ce72d40a…bf1432`. The panel as first reviewed was `9af87603…90bfa`.

Read, not changed: `components/studio/StudioExperience.tsx` `4e8628d8…891e16`, `lib/assistant/run-state.ts` `1b804c6b…9e5df7`, `components/assistant/useAssistantRun.ts` `b6149c54…bad96c7`.

## Contract for root

### `StudioShell` (all three new props are optional)

```ts
export type StudioDialogVariant = 'project' | 'assistant'

interface StudioShellProps {
  // ...existing props unchanged...
  dialogVariant?: StudioDialogVariant // default 'project'
  assistantContent?: ReactNode // shown in the dialog when variant is 'assistant'
  assistantEntry?: ReactNode // dock slot; nothing renders while undefined
}
```

- `dialogVariant` sets `data-panel-variant` on the existing `<dialog>`, switches the bar label to "Ask · source search", and chooses which content fills the existing `panelScrollRef` element.
- The shell adds no dialog, `showModal` call, history, scroll lock or focus move. Close, Escape and `onDialogClose` still go to root's existing handlers.
- With the defaults the rendered output differs from before only by `data-panel-variant="project"` on the dialog.

### `AssistantEntry`

```ts
interface AssistantEntryProps {
  onOpen: () => void
  buttonRef?: Ref<HTMLButtonElement>
}
```

A plain `<button aria-haspopup="dialog">` labelled "Ask about Owen's work". It holds no state.

### `StudioAssistantPanel`

```ts
interface StudioAssistantPanelProps {
  snapshot: PresentationSnapshot
  actions: AssistantActions
  draft: string
  setDraft: (value: string) => void
  headingId: string
  headingRef?: Ref<HTMLHeadingElement>
}
export const ASSISTANT_DRAFT_LIMIT = 600
```

The heading is an `<h2 id={headingId} tabIndex={-1}>`. The panel never calls `actions.close()`; that is root's.

### Wiring sketch

```tsx
const { snapshot, actions } = useAssistantRun() // once, in StudioExperience
const [draft, setDraft] = useState('')
const askEntryRef = useRef<HTMLButtonElement>(null)
const askHeadingRef = useRef<HTMLHeadingElement>(null)

<StudioShell
  /* existing props */
  dialogVariant={askOpen ? 'assistant' : 'project'}
  dialogTitleId={askOpen ? 'studio-ask-title' : projectTitleId}
  assistantEntry={
    enhanced ? <AssistantEntry onOpen={openAsk} buttonRef={askEntryRef} /> : undefined
  }
  assistantContent={
    askOpen ? (
      <StudioAssistantPanel
        snapshot={snapshot}
        actions={actions}
        draft={draft}
        setDraft={setDraft}
        headingId="studio-ask-title"
        headingRef={askHeadingRef}
      />
    ) : null
  }
/>
```

Root's part:

1. `openAsk`: set the variant, `showModal()`, reset `panelScrollRef` scroll, focus `askHeadingRef`.
2. **Ordinary Close or Escape:** `actions.close()` first, then close the dialog. Return focus to whatever opened Ask if it is still valid; otherwise, and always when the open came from the character on the canvas, return it to the HTML entry (`askEntryRef`).
3. **Source navigation or project takeover:** `actions.close()` first, so the run is cleared and aborted, then switch the dialog or navigate. The destination receives focus: the project heading for a takeover. Do **not** return focus to the Ask entry in between.
4. Pass `assistantEntry` only when enhanced. It should stay present when the scene is unavailable.
5. Hand the same `snapshot` object to the scene in the same commit.
6. Keep the variant as `assistant` until the dialog has actually closed, or the sheet will flash the project width.

## What is implemented

- **Entry.** Dark plate in a new `ask` grid row: above the hint pill on desktop, above the Projects and look row on phones. 48 px high on desktop and at 320 px wide, 44 px between.
- **Sheet.** Desktop: `min(38rem, 100% - 3rem)` wide, left edge at `max(1.5rem, 50% - 28rem)`, 0.32 backdrop. Under 48rem it inherits the existing bottom-sheet rule. The project sheet's rules are untouched.
- **Question.** Label, textarea with a 600 limit, live count. Enter is a new line; Ctrl or Cmd + Enter submits the current draft.
- **Buttons.** "Search sources" and "Cancel" are always mounted and never `disabled`. They use `aria-disabled`, enforced in the handlers. In the error state the first button reads "Try again" and submits the current draft.
- **Status.** One `role="status"` line built from the snapshot, with real `retrievalMs` and `totalMs`. In the error state that line is empty and one `role="alert"` block carries `run.notice`, so nothing is announced twice.
- **Zero retrieved** reads "Retrieved 0 passages in X. Waiting for the response to finish." The no-match text appears only when `snapshot.result` is `no-match`.
- **Sources.** One chip and one row per `run.hits` entry, in the given order, keyed by `view.key`. Row: rank, title link to `hit.href`, heading when it differs from the title, the passage, and a Show or Hide button.
- **Passage.** The full `hit.text` is always in the document. Closed rows clamp it to three lines with CSS only; open rows show it all. Nothing is cut in state.
- **Selection.** Chips have `aria-pressed` and `aria-controls` (the row). Row buttons have `aria-expanded` and `aria-controls` (the passage). Both call `actions.select(run.runId, key)`, or with `null` to clear.
- **Notes.** The sources caution shows when `result` is `sources`. The contact line shows for `sources` and `no-match`, using the mailto link already in `studioProfile.links`.
- **Examples.** The three existing questions show while there is no run in flight and no results.
- **No** fetch, parser, timer, store, spinner, skeleton or step tracker.

### Focus rules as built

| Moment | What the panel does |
| --- | --- |
| Visitor presses Cancel during a run | `actions.cancel()`, then focus "Search sources" |
| Cancel pressed with no run | Nothing |
| Chip pressed | Select, then focus that row's Show/Hide button in the commit that shows the selection |
| Chip pressed on the selected source | Clear the selection; focus stays on the chip |
| Left or right arrow on a chip | Focus moves to the previous or next chip, wrapping at the ends. Nothing is selected, expanded or submitted |
| Row button pressed | Toggle; focus stays on the button |
| Example pressed | Fill the draft, focus "Search sources", submit |
| Run completes, fails or is replaced | Nothing |
| Root closes or takes over | Nothing |

The chip's focus request names the run id, the key and the revision the selection will produce. It is dropped unless all three match the committed snapshot and the row's own `data-run-id` and `data-hit-key` agree. There is no delayed callback.

**Chip arrow keys.**

- Only unmodified ArrowLeft and ArrowRight are handled, and their default is prevented. With Alt, Ctrl, Cmd or Shift held, and for every other key, the panel does nothing.
- Every chip stays in the ordinary Tab order. Enter and Space still select and reveal the row as before.
- With one chip the key is handled and focus stays where it is.
- Focus moves inside the key event itself, so no request is left waiting for a later commit. The target must still be found by id and carry the current run id and that hit's key on its own `data-run-id` and `data-hit-key`; otherwise nothing is focused. A handler left over from a replaced, cancelled, closed or failed run therefore focuses nothing.
- Chips now carry an id (`…-chip-<rank>`), `data-run-id` and `data-hit-key`.

## Checks run

| Check | Result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0. Includes the unchanged `StudioExperience.tsx` caller |
| `eslint` on `StudioShell.tsx` and the two new `.tsx` files | Exit 0, no warnings |
| `prettier --check` on all five files | Pass |
| `node --test tests/assistant/*.test.cjs lib/knowledge/catalog.test.mjs` | 67 of 67 pass (unchanged suite) |
| Controlled-panel checks, 13 cases | 13 of 13 pass |

No `next typegen`, build, server or `.next` write was run.

**After the 18 November revision:**

| Check | Result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0 |
| `eslint --max-warnings 0` on `StudioAssistantPanel.tsx` | Exit 0 |
| `prettier --check` on `StudioAssistantPanel.tsx` | Pass |
| `node --test tests/assistant/studio-panel.test.cjs` (the reviewer's durable suite, unchanged) | 20 of 20 pass |
| My earlier 13 scratch cases | 13 of 13 pass |
| Five new scratch cases for the arrow keys | 5 of 5 pass |

The five arrow cases use the same fake host and are not a browser proof. They cover: moving and wrapping across four chips with no action call and no `tabIndex` change; one chip; modified arrows and seven other keys being ignored; an existing selection surviving an arrow press while click still selects and reveals; and a stale handler after replace, cancel, close and failure focusing nothing. They are in the same temporary folder as `arrow-check.cjs`. Durable regression tests and the independent recheck belong to Codex and root. The reviewer's frozen probe that found zero key handlers on a chip will now find one; I did not touch that evidence.

**The 13 controlled-panel cases** run the real panel against the real `reduceAssistantRun` and `presentAssistantRun`, on a fake React host like the one in `tests/assistant/run-transport.test.cjs`. They are not a DOM or browser proof. They cover:

- idle state, and that both buttons stay mounted with `aria-disabled` enforced;
- Enter against Ctrl or Cmd + Enter, and the 600 limit;
- zero retrieved staying pending, then a valid abstention;
- 1, 2, 3 and 4 hits in exact order with full passage text;
- chip selection by run id and key with row focus, then Hide;
- a chip press overtaken by a new run, which focuses nothing;
- user cancel focusing "Search sources", and automatic completion not moving focus;
- an error showing one alert, an empty status line, cleared results and "Try again" using the edited draft;
- an example question;
- root's `close()` moving no focus.

The script is outside my write lease, so it is not in the repository. It is at `C:\Users\Owenc\AppData\Local\Temp\claude\35497c20f539117c\abb5577c-1140-423e-9b0d-61ad42a93f2b\scratchpad\panel-check.cjs`, which is a temporary folder. Root can copy it into `tests/` and run it with `node --test` from the repository root.

## Pending for root's integration pass

1. Wire the props above and confirm the existing project flow is unchanged.
2. Entry position and size at 1440x900, 390x844, 320x844 and 320x568, with Projects open and closed, and with the scene unavailable.
3. Desktop sheet offset and the 0.32 backdrop; project sheet backdrop still 0.56.
4. Heading focus on open. Ordinary Close and Escape return focus to the invoker or the HTML entry, including after character activation. Source navigation and project takeover give focus to the destination with no stop at the Ask entry.
5. Cancel by keyboard during a real delayed request: focus lands on "Search sources", not the body.
6. Chip to row focus and scroll inside the dialog's scroller, and left and right arrows between chips with real focus.
7. Screen-reader output for the status line and the error alert.
8. Text wrapping at 320 px, the three-line clamp, and the textarea with the phone keyboard open on a 568 px screen.
9. Reduced motion: the sheet adds no animation of its own.

## Known limits and choices

- **Tab order on phones.** The entry comes after the Projects list in the document, but sits above the Projects button on screen. On desktop the order matches the layout.
- **Projects list height on phones.** I did not change its `max-height`. The new row takes about 52 px more; three projects still fit at 320x568 by my arithmetic, not by test.
- **`aria-expanded` on the row button** describes the visual clamp. Assistive technology can read the whole passage either way.
- **Generated answers.** If a `generated` answer ever reached this sheet, its text would not be shown. Root mounts the hook in its default source-only mode, where the reducer rejects generation events.
- **Contact line** is omitted if `studioProfile.links` ever has no mailto link.
- **Short screens** (height 34rem or less) get the one-line scope note, a smaller heading and a two-line textarea.
