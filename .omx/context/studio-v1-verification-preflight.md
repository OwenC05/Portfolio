# Verification environment preflight

Root read-only check during S/U work, 14 November 2026. No browser session or new preview started.

- Existing previews: 127.0.0.1:4174 owned by process37852 and 127.0.0.1:4175 by process24336. Preserve them; they serve older drafts. Ports3000/4180/4181 were not listening at this observation, but recheck immediately before binding.
- Root node_modules/playwright and design/portfolio-draft/node_modules/playwright are absent. Do not assume local Playwright is installed or add a dependency merely to run browser checks.
- Available isolated MCP tools include browser_navigate, browser_resize, browser_evaluate, browser_take_screenshot and browser_run_code_unsafe. The latter runs an async(page) function with the Playwright page object and accepts a filename relative to workspace root. It can support a reusable verification script without adding a repository package. Inspect actual tool schema before invoking. Tool availability is not a tested GPU/browser capability claim.
- Existing design/portfolio-draft/browser-tests.mjs targets its separate UI SDK app and is not coverage of /studio. New integrated assertions need to match the actual React scene/interface.
- Full root ESLint cannot load @typescript-eslint/eslint-plugin; it was missing in the original manifest/lockfile. Foundation build exits0 despite printing that ESLint error; never call that lint success. Existing baseline gap is explicitly documented in foundation/content reports. No package upgrade or rule removal has been authorized to hide it. New code still needs targeted available lint/type/build/browser evidence, with coverage limits stated.
- Foundation report contains a long raw audit appendix. Read its summary/check sections first; avoid loading all raw JSON unless investigating a particular finding.

Browser ownership is exclusive. As of the corrected mobile review, U dispatch `ctx_73cee9d71b51` owns the isolated browser for its independent interface reviewer. I must receive U's explicit release before taking it. Root owns the preview process; other reviewers may inspect saved screenshots/source independently.

## Live development preview

Root subsequently started a managed foreground execution session40052 with `npm.cmd run dev -- --hostname 127.0.0.1 --port 4180`. Next14.0.4 reported ready in2.9s at http://127.0.0.1:4180. A detached Start-Process launch was rejected by automatic approval review (no specific reason supplied); the safer foreground tool-managed session succeeded. There is no detached process created by the rejected call.

Root owns the first browser render and this development preview. Do not start a duplicate server or run a production build concurrently against .next. Coordinate stopping this exact owned session before final production build/timings. The old4174/4175 previews remain untouched. At readiness, scene model/controller and server page existed, while StudioExperience and its CSS were still being authored; server readiness alone is not a successful /studio render.

After I reported five real Next router development StrictMode route cycles complete, root stopped exact managed session40052 with Ctrl-C. The session exited, and a fresh Get-NetTCPConnection check found no listener on4180. Root replied to Orca question msg_32f392511614 releasing preview ownership to I for production build/start. Old4174/4175 were not touched. The development URL is temporarily down until I starts the production preview; do not treat old readiness as current service availability.

The question reply receipt was msg_6f4d6d448431, but I later reported it had not reached child Run run_31c4f1454a2d. Root rechecked that4180 still had no listener and sent the explicit release directly to dispatch ctx_e911f6147d12; receipt msg_1911902619b7 confirms routing to that child Run. No second server stop or replacement process was performed.

## Supplemental lint without changing repository configuration

Root confirmed the installed ESLint8 API supports useEslintrc, overrideConfig, extensions, lintFiles and loadFormatter by reading node_modules/eslint/lib/eslint/eslint.js. A CLI attempt with --extends failed because that flag is unsupported; no files changed.

An in-memory ESLint instance with useEslintrc:false, extensions:['.ts','.tsx'], overrideConfig:{extends:['next/core-web-vitals'],parser:require.resolve('@typescript-eslint/parser')} successfully linted app/studio, components/studio, lib/studio-contract.ts and lib/studio-content.ts:11files,0errors,0warnings, exit0. No fix option, source/config change or dependency installation was used. The result is supplemental coverage of installed Next/React/accessibility rules only; it DOES NOT replace the blocked repository TypeScript-plugin configuration or establish that full npm run lint passes. Rerun against final files after pending fixes.

## Corrected layout and targeted integration checks

Root inspected `design/studio-v1/interface-coordination/corrected-mobile-first-390.png` and `corrected-desktop-1440.png`. The complete warm studio is visible near the top of the mobile viewport and the right-side instruments remain visible. Bounded visual findings are recorded in `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/corrected-layout-review.md`. Final full-page/project-state screenshots still belong to I.

The scene lane reports 20 CPU checks after expanding touch hit regions to 44 CSS pixels and isolating disposal failures. CPU evidence is not browser evidence. Specifically test taps near portrait-monitor edges/corners at 390 and 320px, repeat after resize, verify deterministic overlap and cancellation on scroll/drag, and confirm mouse/pen remain precise. Re-review must inspect final source rather than the earlier 13-test revision.

The interface lead removed a redundant fallback CTA after its no-JS tab order conflicted with the mobile visual order. Verify the final keyboard/no-JS journey rather than relying on screenshots taken before that last edit.

The independent U review then found a separate P2: selecting a project from bare `/studio`, then pressing Back, restored landing scroll but left focus on an offscreen evidence heading; the next Tab jumped deep into the page. U has applied a transition-only focus restoration with preventScroll and is independently retesting it. I must include this exact bare-route Back -> Tab regression at desktop and mobile, distinguish it from explicit `#studio` history, and confirm fresh no-fragment loads do not steal focus or add history entries. See `design/studio-v1/interface-coordination/critique-report.md` and its final disposition before relying on the fix.

Final evidence must separate: actual browser navigation and WebGL behavior; CPU mock tests; source/static review; software-GPU timing limitations; and unavailable physical-device testing. In particular, five full-page reloads alone do not demonstrate React setup/teardown cleanup, settled renderer counts alone do not measure the first shadow-render peak, and a build exit0 does not override its printed ESLint failure.
