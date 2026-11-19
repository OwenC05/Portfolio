# Portfolio draft v2 — UI SDK refinement

Date: 2026-11-14. Scope: install the requested UI SDK and refine the reviewable draft. This is a standalone interactive design reference; the existing Next.js homepage has not been replaced or deployed. The user has not yet approved a final visual baseline for production integration.

## Installed

- Global Codex skill: `C:/Users/Owenc/.codex/skills/ui-sdk`, complete skill directory installed by the skill-installer helper from `vercel-labs/ui/packages/core/skills/ui-sdk` (exit 0). Read and applied in this turn; automatic discovery is available on the next turn.
- Draft packages: `@ui-sdk/core@0.1.0-beta.1` and `@ui-sdk/web@0.1.0-beta.1`, under `design/portfolio-draft`, exact versions and lockfile. npm install and npm ls exited 0; install audit reported 0 vulnerabilities.
- React adapter metadata requires React/React DOM >=19 and @types/react >=19.2.10. The existing portfolio is React 18. The standalone Web Components draft avoids an unrelated framework migration.
- API evidence: installed package docs and types; https://github.com/vercel-labs/ui and npm package metadata. Context7 did not find the correct library, so unrelated results were not used.

## Review result

Ivory/ink/cobalt direction and project hierarchy retained. Typography and spacing refined; diagram labels and mobile captions enlarged. The mobile heading retains a space when its desktop line break is hidden. Research paths distinguish plain inference from retrieval-augmented inference. Three real SDK dialogs expose concise engineering summaries and qualification limits. SDK tabs switch among Compare, Plain model and With retrieval. Missing CV download omitted; existing contact/repository destinations reused.

Root inspected actual desktop, mobile and dialog screenshots. All three projects appear once, with no clipping or horizontal overflow in the verified viewports. The original generated reference remains untouched as v1. No pixel-match score is claimed: v2 is a requested refinement awaiting visual review, not an implementation matched to an approved baseline.

## Fresh checks

- `npm run check --prefix design/portfolio-draft` — exit 0; syntax checks app.mjs, server.mjs and browser-tests.mjs.
- `git diff --check` — exit 0.
- HTML/CSS static checks by the implementation agent — exit 0; balanced markup, unique IDs, valid internal anchors, paired tab values and hidden dialog defaults.
- Browser integration: `import('/browser-tests.mjs').then(m => m.runDraftChecks())` — 40 assertions passed at 1440x1000 and 390x844 in Chromium. Covers component names, discoverable choices, all tab panels, agent change provenance, all project dialog open/close paths and focus return, no placeholder project/CV links, no horizontal overflow and mobile heading word spacing.
- Real keyboard input through Orca: ArrowRight selects Plain model, ArrowLeft returns to Compare. Enter opens all 3 project dialogs; Tab stays in each; Escape closes each and returns focus to its trigger. All passed.
- 320px reflow probe — no document overflow and no clipped heading, research figure, tab list or header.
- Computed text contrast samples at desktop: cobalt hero and model labels 5.89:1; body 16.54:1; project description 8.72:1; figure caption 9.31:1; selected tab 16.31:1; development status 5.64:1. These are representative sampled states, not a complete accessibility audit.
- Orca console after module-map repair: no entries. The initial bare `#dev` package-import failure was fixed by translating declared package imports into scoped browser import maps. Components and agent bridge share the same installed core.

## Reproduce and view

Run `npm ci` then `npm start` in `design/portfolio-draft`. Open http://127.0.0.1:4174. The preview server is left running for review, bound to loopback. Source/run instructions: `design/portfolio-draft/README.md`.

Screenshots use the Playwright isolated browser because Orca's full-page mobile capture repeated tiles despite a correct single-page DOM. Final screenshots were visually inspected and replace those faulty captures:

- `desktop-1440.png`: viewport 1440x1000, compare tab selected, dialogs closed, full-page CSS-pixel screenshot.
- `mobile-390.png`: viewport 390x844, same state, full-page CSS-pixel screenshot.
- `project-details.png`: viewport 1440x1000, Application Copilot dialog open.

Equivalent screenshot sequence: navigate to the preview; `page.setViewportSize({width:1440,height:1000})`; ensure Compare selected and dialogs closed; blur the focused test control; `page.screenshot({path:'desktop-1440.png',fullPage:true,scale:'css'})`. Repeat at 390x844 for mobile. Tests run before capture; screenshots are not generated artwork.

## Limits

The SDK is beta and this preview is not a deployed portfolio. Contact freshness, CV supply, full case-study evidence/assets and integration into the main app remain separate work. Main Next.js build/typecheck was not run because its code/dependencies were unchanged. This draft has no TypeScript compilation step.

An optional attempt to move/remove the generated `.playwright-mcp/page-2026-11-14T16-35-55-471Z.yml` log was rejected by automatic approval review with `blocked by policy`. That temporary log is retained; no cleanup was retried through another tool. It does not affect the draft or validation.
