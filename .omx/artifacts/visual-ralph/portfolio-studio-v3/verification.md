# Working table reference — review evidence

2026-11-14. This is a proposed visual reference, awaiting user approval. It is not a production implementation, deployment, or an approved-reference pixel match.

## Deliverables

- `concept/the-working-table.html`: self-contained responsive reference with local image and fonts; asset licences included.
- `concept/brand-spec.md`: proposed typography, palette, composition and provenance.
- `hero-1440.png`: opening viewport at 1440 x 1000.
- `desktop-1440.png`: full page at a 1440 x 1000 browser viewport.
- `mobile-390.png`: full page at a 390 x 844 browser viewport.
- `generated-original.html`, `desktop-initial.png`, `mobile-initial.png`: original candidate before review refinements.
- `brief.md`, prompts, request and run-status files retain generation context. Higgsfield material-study job completed; Local Codex composition run succeeded.

## Browser checks

Fresh Chromium checks through Playwright isolated on the local rendered reference:

- No horizontal page overflow at 1440, 768, 390 or 320 pixels.
- At 390 x 844, the three-project work index ends at y=667, before the material photograph.
- Navigation and wordmark targets are at least 44 x 44 at 390 and 320 pixels.
- Substantive research, inspection-flow, qualification and TypeForge detail paragraphs are 16px at desktop and mobile.
- At 768px the vertical experiment diagram is visible at 460px width; the compressed desktop diagram is hidden.
- Local image loads, local fonts load, heading text has readable word separation, and internal hash destinations exist.
- Keyboard Enter changes the TypeForge specimen to AA and aria-pressed=true; Space returns it to mixed case and aria-pressed=false.
- Key focus has a visible 2px graphite outline. Reduced-motion emulation yields a 0s transition.
- Clicking the TypeForge work-index link reaches the correct section.
- Sampled contrast ratios: intro 11.9:1; orange role 4.9:1; research lead 7.73:1; Copilot/qualification/TypeForge detail text 6.54:1.
- No page console errors after the final reload. The one warning came from the review's canvas-based color measurement, not site code.

These are targeted concept checks, not a complete accessibility certification or cross-browser test.

## Independent visual review

Designer review judged the candidate ready for visual-direction approval: a substantial improvement over v2 through the identity-led opening, meaningful material study, coherent palette and different project compositions. This is not a numerical match score.

Two content improvements remain for the subsequent portfolio implementation: show a verified research excerpt or representative recorded trace, and give the dissertation a visible detailed-evidence destination. Do not invent artifacts or broken evidence links to fill those gaps.

## Scope and reproduction

No tracked production application files or dependencies changed. `design/portfolio-draft` and its UI SDK interactions remain preserved. Main Next.js build/tests were not run because this turn produced a separate reference. `git diff --check` passed for tracked changes; git status shows the existing untracked design/artifact directories.

Current preview: http://127.0.0.1:4175/the-working-table.html (served from the matching Local Codex project files). To reproduce from the saved repository copy, from the repository root use an available port:

```powershell
python -m http.server 4176 --bind 127.0.0.1 --directory .omx/artifacts/visual-ralph/portfolio-studio-v3/concept
```

Open `http://127.0.0.1:4176/the-working-table.html`, wait for `document.fonts.ready`, capture at 1440 x 1000 and 390 x 844 with fullPage=true and CSS scale. No remote image/font request is needed.

The session-local MCP bridge repaired access for this run without editing global configuration, restarting user apps, or cancelling a generation. Only the bridge subprocesses created for this task were closed. The standalone preview remains running for user review.
