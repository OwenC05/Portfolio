# Independent assistant visual review

Original task: build a personal source-grounded portfolio assistant with real retrieval visualisation.

Backend: local Claude CLI, requested claude-opus-5-5 / high effort. Reported models: claude-opus-5-5. CLI exit: 0.

## Final prompt

Independently review the implemented portfolio assistant, not your own earlier proposal. User wants a polished personal assistant with a visualisation of REAL retrieval; source-only behavior is intentionally labelled while free model eligibility is pending. Use Read to inspect these actual viewport PNGs in C:/Users/Owenc/orca/Portfolio-assistant/design/assistant: desktop-sources.png (1440x1100), mobile-top.png, mobile-answer.png, mobile-trace.png and mobile-passage.png (320x844). Do not read mobile-sources.png: its stitched capture was invalid. Read components/assistant/AssistantWorkbench.tsx and assistant.module.css only as needed to explain visual/accessibility findings. No edits or other tools. Evaluate hierarchy, legibility, responsive fit, graph usefulness, discoverability of sources, keyboard-equivalent controls, honest states and unnecessary friction. Images are separate scrolled viewport captures, NOT full pages. Root verified 12 browser interaction/state checks, but do not infer a screen-reader/WCAG audit or live model quality. Give a bounded APPROVE or REQUEST CHANGES for this source-search preview UI. List only concrete consequential issues with evidence and precise smallest repairs. Separate optional refinements from blockers, and say what images cannot establish. Keep the answer under 1000 words.

## Raw advisor response

# Verdict: REQUEST CHANGES (one small blocker)

The preview UI is honest, well organised and fits a 320px screen. One mobile legibility defect weakens the feature the assistant is built around, which is showing real retrieval. A single CSS rule fixes it. Everything else below is optional.

## Blocker

**On mobile, the graph labels and rank numbers can't be read.**

- **Evidence:** In `mobile-trace.png` and `mobile-passage.png`, the node ranks 1–4 and the labels "question", "answer" and "retrieved passages" render at roughly 7–8px. In `assistant.module.css`, `.mapLabel, .rank` are set to `font-size: 11px` inside a `viewBox="0 0 360 280"`. At 320px the SVG is about 254px wide, a scale of about 0.705, so the text ends up about 7.8px tall. On desktop the same rule renders at about 18px, which is why the problem only shows on mobile. The `@media (max-width: 480px)` block makes no adjustment for the graph.
- **Why it matters:** The rank numbers are the only visual link between graph nodes and the numbered source rows. If you can't read them on mobile, the graph is decoration rather than an explanation.
- **Smallest repair:** add this inside the existing `@media (max-width: 480px)` block:
  ```css
  .mapLabel, .rank { font-size: 16px; }
  ```
  That renders at about 11.3px. If "retrieved passages" then collides with the nodes, hide only that caption on mobile; the steps panel already gives the same context.
- **Verify:** re-capture `mobile-trace` at 320×844 and confirm ranks 1–4 are readable and no labels overlap.

## Optional refinements (not blockers)

1. **The source rows repeat the same title.** In `mobile-trace.png`, rows 01–03 all read "LexisNexis Risk Solutions", so the rows look interchangeable. Make `h.heading` the main line and show `h.title` as the secondary line.
2. **Scores use different precision in two places.** The list shows `toFixed(2)` (6.24), but the expanded passage shows `toFixed(3)` ("relevance score 6.243"). Use `toFixed(2)` in both.
3. **Tied scores look like duplicated data.** Rows 02 and 03 both show 3.41. Either show more precision in both places, or rely on the rank number alone and leave the score in the expanded passage.
4. **The "Show passage N" button is a small touch target.** `.linkButton` is 0.72rem with no padding and no minimum height. On mobile, add `min-height: 2.75rem` and some vertical padding.
5. **Clicking a graph node doesn't move focus.** `reveal()` scrolls the matching row into view but leaves focus where it was. Calling `.focus()` on the row's button afterwards would let keyboard and screen-reader users continue from what they picked. The node `<g>` elements are mouse-only, which is acceptable because the list buttons provide the same function. Just don't add tabindex to the nodes inside `role="img"`.
6. **The headings say "answer" when there isn't one.** In sources-only mode the headings still read "Answer" and "How this answer was found". The SOURCES ONLY banner mitigates this, but "Results" and "How these sources were found" would be more accurate when `mode === 'sources'`.
7. **The same passage appears twice.** On mobile, a passage quoted in the answer card appears again in the sources list. Consider showing it in only one place.
8. **The disabled Cancel button adds clutter.** It is correctly `disabled={!busy}` at 0.45 opacity, so this is not a defect. Hiding it when nothing is running would just reduce visual noise.

## Strengths worth keeping

- **Honest states:**
  - the amber preview notice;
  - the dashed GENERATE step marked "not used";
  - the SOURCES ONLY banner, with a caveat that matching passages don't confirm the question's premise;
  - a note that scores aren't probabilities;
  - a contact fallback;
  - explicit idle, busy, empty, error and cancelled states, with "Try again".
- **Desktop hierarchy:** the eye moves from the notice to the input, then the answer card, then the trace, and the answer stays the main focus.
- **Mobile fit:** the 320px layout doesn't overflow. The steps sit in a 2×2 grid and the hint wraps.
- **The graph reflects real retrieval:** node size reflects the score, edges go only to cited passages, and expanding a row highlights that node's path.
- **Keyboard parity in the code:**
  - the source rows are buttons with `aria-expanded` and `aria-controls`;
  - Ctrl/⌘+Enter submits;
  - Ask is disabled when the question is empty;
  - focus-visible outlines are defined;
  - the live status region uses `aria-live="polite"`;
  - reduced motion turns off the edge, node and pulse animations.

## What these images cannot establish

- How focus-visible outlines actually look, and the tab order.
- Screen-reader output and announcement timing. This is not a WCAG audit.
- Measured contrast. The muted `#bcab95` text at 0.68rem on the walnut background is the main candidate for a contrast check.
- Hover states, animation and reduced-motion behaviour.
- The loading, error, empty, abstained ("not supported") and generated-answer states. Only the sources-only result was captured.
- Continuity between captures. These are separate viewport screenshots, not full pages, and the invalid `mobile-sources.png` was excluded.
- Retrieval correctness, ranking quality and live model behaviour. The 12 browser checks confirm interaction and state wiring, not answer quality.

## Summary and next steps

Root must review the verdict, repair any blocking findings, and retain explicit limits on provider and accessibility validation.
