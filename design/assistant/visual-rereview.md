# Assistant mobile rereview

Backend: local Claude CLI. Requested claude-opus-5-5 / medium effort. Reported models: claude-opus-5-5. CLI exit: 0.

## Scope

Perform a focused independent rereview of the portfolio assistant UI in C:/Users/Owenc/orca/Portfolio-assistant. Read design/assistant/visual-review.md for the prior verdict, then the newly captured design/assistant/mobile-trace.png and mobile-passage.png (both 320x844 viewport captures). The prior sole blocker was SVG labels rendered at about 7.8px. Root changed mobile map labels and ranks to 16 SVG units (about 11.3 rendered px), made section headings primary in source rows, used consistent score precision, added 44px mobile passage controls, moved focus to the source row when revealed, and labelled source-only results accurately. Read components/assistant/assistant.module.css and AssistantWorkbench.tsx only if needed. User explicitly chose generation off; evaluate this as a source-search preview. No edits and no tools except Read. Decide APPROVE or REQUEST CHANGES for the prior blocker and any new consequential regression visible in these images. Keep optional refinements separate. Do not claim live-model quality, full accessibility compliance, or desktop validation from this limited review. Under 500 words.

## Advisor verdict

# Rereview: APPROVE (with one small follow-up)

I reviewed only `visual-review.md` and the two new 320×844 captures. I didn't need to open the CSS or TSX files.

## Prior blocker: resolved

In both `mobile-trace.png` and `mobile-passage.png`, the ranks 1–4 and the labels "retrieved passages", "question" and "answer" are now clearly readable. Their size looks consistent with the reported ~11.3px. No labels overlap each other or the nodes:
- each rank sits just right of its node;
- "retrieved passages" clears node 1.

Ranks now visibly link the graph to the numbered rows 01–03. That restores the graph's purpose of explaining retrieval.

## Other claimed changes, as far as the images show

- **Headings are now the primary line in source rows.** "Placement and continuing work", "Evidence and disclosure" and "From demonstration to internal pilot" lead each row, with "LexisNexis Risk Solutions" below as the secondary line. Rows no longer look interchangeable.
- **Score precision is consistent.** The list and the expanded passage both show 6.24.
- **Labels are accurate for source-only results.** The heading reads "How these sources were found", the GENERATE step shows "not used", the ANSWER step shows "sources only", and the status line reads "Finished in 27 ms · sources only." That is honest for a source-search preview with generation off.
- **Expanded state is clear.** In `mobile-passage.png`, the selected node 1 and its edges are highlighted, the row is tinted, and the passage panel is visibly attached to the row.

## New regression: minor, not blocking

**The "question" label is clipped at the left edge.** It renders as "uestion" in both captures. This is a side effect of the larger font: the text now runs past the SVG viewBox or its container.
- **Why it doesn't block:** the meaning is still obvious and nothing overlaps.
- **Why fix it anyway:** it looks unfinished on the feature this page exists to show.
- **Smallest repair:** in the mobile rule, either give the label `text-anchor: start` at the node's x position, or add about 10–12 units of horizontal padding to the viewBox or node x positions. Then recapture at 320px to confirm "question" and "answer" both fit.

## Optional refinements (separate, not blocking)

1. Rows 02 and 03 still both show relevance 3.41. The prior review's tie suggestion still applies if you want it.
2. Rank "1" sits tight against its enlarged selected node in `mobile-passage.png`. A 1–2 unit nudge would help.
3. The passage meta line ("PASSAGE 1 · … · RELEVANCE SCORE 6.24") wraps to three uppercase lines at 320px. A shorter mobile form, such as "Passage 1 · 6.24", would cut noise.

## What this review cannot establish

- **Focus moving to the revealed row.** That needs keyboard or interaction testing.
- **The 44px passage controls.** No "Show passage" button is visible in these crops, so I can't measure the touch targets.
- **Contrast, screen-reader output, tab order, reduced motion or hover states.** This is not an accessibility compliance check.
- **Desktop layout.** No new desktop capture was provided.
- **Live model answer quality.** Generation is off, so this evaluates the source-search preview only.
- **The rest of the page.** These are two scrolled viewport crops, not full pages.

**Verdict:** the prior blocker is resolved and I saw no consequential new regression. APPROVE the source-search preview. Fixing the clipped "question" label is recommended before it ships.
