# Portfolio presentation draft

Interactive refinement of the editorial reference, for review before integrating into the portfolio application.

## Run

```powershell
cd C:\Users\Owenc\orca\Portfolio\design\portfolio-draft
npm ci
npm start
```

Open http://127.0.0.1:4174. The server binds to loopback only. It serves the version-pinned SDK modules directly from node_modules and generates a browser import map from their package exports, with no external runtime requests or bundler. This also gives the components and agent bridge one shared SDK instance; the prebuilt beta.1 browser bundle does not include the agent entry.

## SDK and scope

- `@ui-sdk/core` and `@ui-sdk/web`: 0.1.0-beta.1, pinned in package.json and package-lock.json.
- The agent skill is installed at `C:/Users/Owenc/.codex/skills/ui-sdk` and was read in this session. Automatic skill discovery will pick it up on the next turn.
- The React adapter requires React 19. This draft uses Web Components so the existing Next.js 14 / React 18 application does not need a migration just to review the design.
- Tabs and dialogs use real SDK behaviors, including keyboard navigation, dismissal and focus return. `app.mjs` exports an SDK agent bridge for testing component names and actions; it does not run an AI model or send data anywhere.
- The production homepage is not replaced or deployed. Project graphics are labelled illustrations, and case-study summaries distinguish experiments, current capabilities and open qualification work.

## Verification

Run `npm run check` for JavaScript syntax checks. In the browser, `import('/browser-tests.mjs').then(m => m.runDraftChecks())` runs the SDK integration checks. Keyboard navigation, focus return, responsive layout and screenshots are also checked in a real browser; see the verification record alongside the reference artifacts.

Upstream: https://github.com/vercel-labs/ui. API documentation is installed under `node_modules/@ui-sdk/web/docs/`; use the installed version when extending this draft.
