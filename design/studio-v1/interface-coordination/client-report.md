# Studio interface client and CSS report

Completed 14 November 2026 for task `task_bf0ceac63e9b`, dispatch `ctx_7b8f33a7405f`.

## Owned changes

- `components/studio/StudioExperience.tsx`
- `app/studio/studio.module.css`
- This report.

No server, scene, content, contract, package, global CSS, runtime-state or preview-host edits were made. The server sibling and real scene imports landed during implementation and were consumed as written. No helpers, additional dependencies, commits or deployment.

## Implementation

- The client follows the exact slot structure: root delegated anchor enhancement; labelled, focusable `section#studio`; introduction; scene frame; all server children after the landing section. Neither server slot is inside an error boundary or an `aria-hidden` subtree.
- Real `StudioScene` is imported with `next/dynamic` and `ssr: false`. The boundary encloses only that scene and marks it unavailable on lazy/render errors. A labelled, static CSS sketch and ordinary work link remain available during loading, unavailable graphics and no-JS operation; the caption changes honestly with scene status. No scene stub, spinner, fake progress or media controls.
- Both scene selection and same-document links call the same navigation function. The frozen helpers resolve the project and its existing heading; hash writes preserve current history metadata, skip identical entries, and focus/scroll that heading. Initial hashes and hashchange/popstate use the same location application path; native history events coalesce through one animation frame. Return and skip links target `#studio` and `#work`. Unknown/external destinations remain native.
- Enhancement preserves already-prevented, modified, non-primary, download and non-self-target clicks. No keyboard handler replaces native link activation.
- Reduced motion starts true, reads and subscribes to `matchMedia`, and cleans up its listener. Enhanced scroll is explicitly instant while reduced or during history/reload synchronization; only deliberate navigation can request smooth scroll. The parent-owned global media override already exists in `app/globals.css`; this slice does not modify it.
- Charcoal/cream/amber landing, large system-serif name, substantial desktop scene, cream evidence rows with facts/prose columns, and a contact footer. Every one of the 32 server-contract classes is defined. Breakpoints at 1020, 640 and 360 pixels provide stacked narrow layouts; scene viewport minimum heights are 480px at 390px width and 448px at 320px width. The fallback drawing scales within that space. All links inherit intended minimum 44px width and height, with visible focus. All fonts are system stacks.

## Verification

All commands ran in `C:/Users/Owenc/orca/Portfolio` without starting a browser, preview, build or hidden helper.

1. `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` — exit 0, no diagnostics, with actual server and scene imports present. No incremental output written.
2. `.\node_modules\.bin\next.cmd lint --file components/studio/StudioExperience.tsx` — exit 1 at configuration load: missing `@typescript-eslint/eslint-plugin`, matching the recorded foundation baseline. No lint configuration or package repair attempted.
3. Isolated installed `next/core-web-vitals` lint — exit 0, **0 errors / 0 warnings**. This covers the owned TSX using available Next/React/hooks/accessibility rules, but does not claim the missing TypeScript ESLint plugin ran. Exact PowerShell invocation:

```powershell
@'
const { ESLint } = require('eslint');
(async () => {
  const lint = new ESLint({ useEslintrc: false, overrideConfig: { extends: ['next/core-web-vitals'] } });
  const results = await lint.lintFiles(['components/studio/StudioExperience.tsx']);
  console.log((await lint.loadFormatter('stylish')).format(results));
  const errors = results.reduce((n, result) => n + result.errorCount, 0);
  const warnings = results.reduce((n, result) => n + result.warningCount, 0);
  console.log(JSON.stringify({ errors, warnings, config: 'isolated next/core-web-vitals; repository configuration unchanged' }));
  process.exitCode = errors ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
'@ | node -
```

4. Static CSS parse/class coverage/colour calculation — exit 0: 89 top-level CSS nodes, all 32 required server classes and all actual client/server TSX class references covered. Initial colour calculation identified insufficient muted-label contrast at the lightest fallback gradient colour; the label was changed to cream and the check rerun successfully. This is source-colour calculation, not computed browser contrast. Exact successful command:

```powershell
@'
const fs = require('node:fs');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const css = fs.readFileSync('app/studio/studio.module.css', 'utf8');
const parsed = postcss.parse(css);
const classes = new Set([...css.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map(match => match[1]));
const contract = fs.readFileSync('design/studio-v1/interface-coordination/shared.md', 'utf8');
const names = contract.split('Server-owned class names')[1].split('\n')[0];
const required = [...names.matchAll(/`([^`]+)`/g)].map(match => match[1]);
for (const name of required) assert(classes.has(name), 'Missing contract CSS: ' + name);
for (const path of ['app/studio/page.tsx','components/studio/ProjectEvidence.tsx','components/studio/StudioExperience.tsx']) {
  const source = fs.readFileSync(path, 'utf8');
  for (const match of source.matchAll(/styles\.([A-Za-z0-9_]+)/g)) assert(classes.has(match[1]), path + ' missing CSS: ' + match[1]);
}
const luminance = hex => {
  const channels = hex.match(/[0-9a-f]{2}/g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
for (const [text, background] of [['c1b6a6','1b1a18'],['e9b77d','1b1a18'],['494136','f2eadc'],['705135','f2eadc'],['c1b6a6','211e1a'],['f4ead8','61452c']]) {
  const values = [luminance(text), luminance(background)].sort((a,b) => b-a);
  const ratio = (values[0] + 0.05) / (values[1] + 0.05);
  assert(ratio >= 4.5, 'Contrast below 4.5 for ' + text + '/' + background);
  console.log(text + '/' + background + ': ' + ratio.toFixed(2) + ':1');
}
console.log('PASS: CSS parses (' + parsed.nodes.length + ' top-level nodes); all ' + required.length + ' server contract classes and all TSX class references exist.');
'@ | node -
```

Ratios in command order: **8.70, 9.55, 8.40, 6.03, 8.31, 7.35:1**.

5. `.\node_modules\.bin\prettier.cmd --write components/studio/StudioExperience.tsx app/studio/studio.module.css` formatted only owned sources. Final `.\node_modules\.bin\prettier.cmd --check components/studio/StudioExperience.tsx app/studio/studio.module.css` — exit 0, all matched files use Prettier code style.
6. `git diff --stat` and `git status --short` were read before/after. Other lanes' package/global/untracked work remains present. Studio source files are new/untracked, so the tracked diff stat alone does not enumerate this slice.

## Initial parent/root handoff and limits

The client/CSS slice is authored and type-valid. Final integrated build, normal configured lint after baseline repair, visual judgement, actual 1440/390/320 layouts, computed contrast/hit areas, no-JS screenshots, pointer/keyboard/hash/reload/back-forward journeys, reduced-motion toggles, lazy-chunk/WebGL/context-loss failure injection, scene lifecycle/performance and homepage regression checks remain with the parent/root. No browser, runtime interaction, GPU, physical-mobile or pixel-match claim is made here.

Root's preview ownership was received through Orca and respected. No unresolved file-ownership conflict or contract change is required.

## Mobile composition correction — task `task_0af9bd518b68`

Dispatch `ctx_9043c34622ef`, 14 November 2026. This follow-up supersedes the initial no-browser limitation only for the checks below: parent explicitly granted exclusive isolated-browser ownership via Orca, using its existing `http://127.0.0.1:4180` development server. No server, build, helper or package change was made.

### Change

Only `app/studio/studio.module.css`, this report and the authorized screenshots changed in this follow-up. `StudioExperience.tsx` and all siblings remain untouched. The server sibling's new plain header Work anchor was consumed as written.

At widths up to 640px, `introduction` uses `display: contents` so the existing grid displays topbar, eyebrow, name, scene, intro, project navigation and personal note in that sequence. The name is a compact, readable single line; the mobile header fits Work plus all three contact links at 320px. All supplied prose, project entries and links remain rendered. The scene viewport is 352px tall at both tested mobile widths, reducing excess empty space while retaining the whole room and right-side controller/drums. Fallback drawing and caption spacing fit the compact frame. Desktop rules are unchanged.

### Fresh browser evidence

Browser-emulated viewports, not physical-device results. These PNGs were saved in this report's folder; both first-viewport images, the no-JS image and the desktop image were visually inspected.

| Artifact | Observed result |
| --- | --- |
| [corrected-mobile-first-390.png](corrected-mobile-first-390.png) | 390x844: scene viewport starts at y203.625, down from root's prior approximately y794; complete room and right instruments visible in the first viewport. |
| [corrected-mobile-scene-390.png](corrected-mobile-scene-390.png) | Figure detail: scene is 348x352; full figure ends at y624.328. Intro starts below at y652.328. |
| [corrected-mobile-first-320.png](corrected-mobile-first-320.png) | 320x844: scene starts at y197.047; name, Work/contacts, entire room and right instruments visible. |
| [corrected-mobile-scene-320.png](corrected-mobile-scene-320.png) | Figure detail: scene is 286x352; full figure height is 440.297 with wrapped caption. |
| [corrected-mobile-nojs-320.png](corrected-mobile-nojs-320.png) | Separate temporary JavaScript-disabled context: stable sketch and link fit, all three evidence sections remain present, no horizontal overflow. Context closed after verification. |
| [corrected-desktop-1440.png](corrected-desktop-1440.png) | 1440x900: original two-column composition retained; introduction display remains block, title at x64.797, scene at x615.141 with 759.063x667.828 viewport, no horizontal overflow. |

At both mobile widths, `document.documentElement.scrollWidth <= innerWidth`; all visible links measured at least 44x44px. At 320px the Work link is 44x44, Email Owen 73.313x44, GitHub 44x44, and LinkedIn 51.422x44; all four share the same y52 row without overlap.

Keyboard test at 320px: Tab reached skip link, studio identity, Work, Email Owen, GitHub, LinkedIn, then the project links, each with a solid focus outline. Enter on Work produced `#work` and focused `main#work`; Enter on the first evidence return link produced `#studio` and focused `section#studio`, with normal smooth scrolling returning to the top. An initial exact-accessible-name lookup for the return link did not match; the rerun used its actual `main a[href="#studio"]` selector and keyboard activation and passed.

Fresh-navigation console capture attached immediately before `page.goto`, then removed its listeners after the scene became ready. It contained only the React DevTools informational message, no warnings or page errors, and **no PCFSoftShadowMap removal warning**. A second fresh navigation during keyboard testing again contained only that informational message. This does not reuse earlier console history.

### Reading/focus-order caveat for parent review

CSS ordering does not change source or assistive-technology reading order: introduction prose, project navigation and the personal note still precede the figure in the DOM. The loaded scene is presentation-only with no tab stops, so the tested loaded-page keyboard sequence moves forward from header controls to the project links below the figure.

In the no-JS fallback, however, the redundant "Explore the work" link is still after those project links in DOM order despite appearing above them visually. This was measured: the final project link is at page y974.078, then Tab moves back to the fallback link at page y485.047. The link remains usable with a 141.813x44 target entirely inside the 352px viewport; there is no trap or missing content, but the spatial jump should be reviewed. If strict visual/source focus-order alignment is required, recommend a parent-approved slot/DOM restructuring, or replacing the redundant mobile fallback CTA with noninteractive guidance while retaining the header Work and project links. Do not repair this with positive tabindex. No shared-contract change or hidden navigation was introduced in this leaf fix.

### Bounded static validation and handoff

- `.\node_modules\.bin\prettier.cmd --check app/studio/studio.module.css` — exit 0.
- `node -` via a PowerShell here-string parsed the final CSS with installed PostCSS, asserted `display: contents`, asserted the seven mobile grid orders (0 through 6), asserted `22rem` scene minimum height, and checked all actual client/server TSX class references — exit 0. This complements the actual browser measurements above.
- No new TypeScript edits; the parent-reported fresh typecheck remains the type evidence for this CSS-only follow-up.
- Shared-workspace status was inspected; siblings' global/package/scene/server work remains present.

Exclusive isolated-browser ownership is released back to parent/root with completion. The existing page is left at `/studio`, viewport 390x844, scene ready; no temporary browser context remains. Final integrated build, broader failure/lifecycle/performance checks and acceptance of the documented source/visual-order caveat remain with parent/root.
