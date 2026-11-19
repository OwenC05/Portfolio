# Server interface slice

Implemented on 14 November 2026 for task `task_0070b4c6488b`, dispatch `ctx_581cbe7fd6e0`.

## Delivered

- `app/studio/page.tsx`: server route with profile-derived metadata, studio identity, complete contact navigation, supplied role/name/intro/personal note, ordinary project links and the agreed introduction/children slots.
- `components/studio/ProjectEvidence.tsx`: all supplied project summaries, facts, section headings, paragraphs and repository links, with ordinary return anchors.
- This report is the only other owned file changed. No package, scene, content, contract, stylesheet or client-component edits; no helpers, browser, preview or build host launched.

The page uses the agreed `StudioExperience({ introduction, children })` contract. The child slot contains focusable `main#work`, a labelled work introduction, all projects, then a labelled contact footer. Exact project IDs are `project-dissertation`, `project-copilot`, `project-typeforge`; their corresponding h2 IDs append `-heading` and each has `tabIndex={-1}`. Return links remain plain `href="#studio"`. Only contract-listed CSS classes are used. Copy is read from the shared content module; professional and evaluation qualifications are preserved.

## Verification

- `.\node_modules\.bin\prettier.cmd --write app/studio/page.tsx components/studio/ProjectEvidence.tsx`: formatted the two owned source files after the initial check requested formatting.
- `.\node_modules\.bin\prettier.cmd --check app/studio/page.tsx components/studio/ProjectEvidence.tsx`: final exit 0, both owned source files passed formatting.
- `.\node_modules\.bin\tsc.cmd --noEmit --incremental false --pretty false`: exit 1 while sibling implementations were incomplete. The page reported the missing `@/components/studio/StudioExperience` import. Other diagnostics were in sibling `components/studio/scene/controller.ts`: missing `./build-studio`, spread-tuple error at line 20, and possibly-null `model` at lines 245, 248, 249, 257 and 259. No other diagnostics named either owned source file. This is not an integrated typecheck pass.
- `.\node_modules\.bin\next.cmd lint --file app/studio/page.tsx --file components/studio/ProjectEvidence.tsx`: exit 1 before linting because `.eslintrc.json` references missing `@typescript-eslint/eslint-plugin`. This matches the documented baseline blocker; no dependency repair attempted.
- Isolated React server render, invoked by the complete PowerShell command below: **PASS**, 3 projects, 9 facts, 16 paragraphs, 23 unique IDs; supplied profile/project text, all links, exact anchors, focusable headings, label references, metadata and server-only sources checked. TypeScript transpile syntax checks passed for the loaded modules.
- The first harness attempt had a CommonJS default-import marker mismatch; the harness was corrected and rerun successfully. It required no application-code change.

The SSR harness imports the actual server-owned modules/content and renders only the actual introduction and children slots. The unrendered client-boundary marker and CSS-name mapping exist only in memory for this test; it does not render or replace a scene, exercise Next's full page pipeline, or prove the sibling's client/styling behavior.

## Mobile-header followup

Task `task_d2837027fc06`, dispatch `ctx_a33ad72a6be3`: added the plain `<a href="#work">Work</a>` as the first header navigation link, followed by the unchanged supplied profile links. The navigation label is now `Work and contact` to describe its contents. The existing server-rendered `main#work` remains the destination. Only the server page and this report changed in this followup; mobile layout remains the client worker's responsibility.

The reproducible SSR check below now asserts that the header navigation begins with the exact Work anchor and that its complete link order is Work followed by the supplied profile links. Followup result: PASS (exit 0), including all existing content checks: 3 projects, 9 facts, 16 paragraphs and 23 unique IDs. `.\node_modules\.bin\prettier.cmd --write app/studio/page.tsx` formatted the changed navigation tag; the subsequent `.\node_modules\.bin\prettier.cmd --check app/studio/page.tsx` passed (exit 0). No build, browser or server was run; earlier full-project diagnostics above remain historical, not refreshed claims.

## Handoff and limits

Parent/root should run the final integrated lint/typecheck/build after sibling files settle and resolve the recorded baseline lint blocker within their authority. Browser ownership remains with root: check actual no-JS HTML and plain-anchor behavior, mobile layout/contrast/target sizes, skip/return focus, hash reload/back/forward, scene selection, reduced motion and failure fallback. No screenshot, browser result, visual approval, integrated build or scene-resilience claim is made by this leaf.

The client contract must render the introduction inside `section#studio[tabindex="-1"][aria-labelledby="studio-title"]` and the evidence/footer children after that landing section; the server intentionally does not duplicate that client-owned landing wrapper.

## Reproduce isolated server-slot verification

Run in the repository root, using existing dependencies; this writes no files:

```powershell
@'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = process.cwd();
const clientBoundary = 'unrendered-client-boundary';
const cache = new Map();
function load(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  const mod = new Module(filename);
  cache.set(filename, mod);
  const nativeRequire = Module.createRequire(filename);
  mod.require = (request) => {
    if (request === '@/components/studio/StudioExperience') return { __esModule: true, default: clientBoundary };
    if (request.endsWith('.module.css')) {
      return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    }
    if (request.startsWith('@/') || request.startsWith('.')) {
      const base = request.startsWith('@/') ? path.join(root, request.slice(2)) : path.resolve(path.dirname(filename), request);
      const resolved = ['.tsx', '.ts'].map(extension => base + extension).find(file => fs.existsSync(file));
      if (resolved) return load(resolved);
    }
    return nativeRequire(request);
  };
  mod._compile(output.outputText, filename);
  return mod.exports;
}
const { studioProfile, studioProjects } = load('lib/studio-content.ts');
const { projectAnchor } = load('lib/studio-contract.ts');
const pageModule = load('app/studio/page.tsx');
const page = pageModule.default();
assert.equal(page.type, clientBoundary);
const introduction = renderToStaticMarkup(page.props.introduction);
const children = renderToStaticMarkup(page.props.children);
const headerNavigation = introduction.match(/<nav class="contactNavigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
assert.ok(headerNavigation, 'Header navigation rendered on server');
assert.ok(headerNavigation.startsWith('<a href="#work">Work</a>'), 'Work is the first plain header anchor');
assert.deepEqual([...headerNavigation.matchAll(/href="([^"]+)"/g)].map(match => match[1]), ['#work', ...studioProfile.links.map(link => link.href)], 'Header link order preserves all profile links');
const html = introduction + children;
const text = value => renderToStaticMarkup(React.createElement(React.Fragment, null, value));
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.ok(html.includes('<h1 id="studio-title"'));
assert.ok(children.includes('<main id="work" class="evidence" tabindex="-1" aria-labelledby="work-title">'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'No duplicate IDs');
const labels = [...html.matchAll(/\baria-labelledby="([^"]+)"/g)].flatMap(match => match[1].split(' '));
labels.forEach(id => assert.ok(ids.includes(id), 'Label target: ' + id));
for (const value of [studioProfile.name, studioProfile.role, studioProfile.intro, studioProfile.personalNote]) {
  assert.ok(introduction.includes(text(value)), 'Profile: ' + value);
}
let paragraphCount = 0;
let factCount = 0;
for (const project of studioProjects) {
  const id = projectAnchor(project.id).slice(1);
  assert.ok(introduction.includes('href="#' + id + '"'), 'Direct project anchor: ' + id);
  assert.ok(children.includes('<section id="' + id + '" class="project" aria-labelledby="' + id + '-heading">'));
  assert.ok(children.includes('<h2 id="' + id + '-heading" class="projectTitle" tabindex="-1">' + text(project.title) + '</h2>'));
  for (const value of [project.eyebrow, project.summary]) assert.ok(children.includes(text(value)));
  for (const fact of project.facts) {
    assert.ok(children.includes('<dt>' + text(fact.label) + '</dt><dd>' + text(fact.value) + '</dd>'));
    factCount++;
  }
  for (const section of project.sections) {
    assert.ok(children.includes(text(section.heading)));
    for (const paragraph of section.paragraphs) {
      assert.ok(children.includes('<p>' + text(paragraph) + '</p>'), 'Evidence paragraph preserved');
      paragraphCount++;
    }
  }
  for (const link of project.links) {
    assert.ok(children.includes('<a href="' + link.href + '">' + text(link.label) + '</a>'));
  }
}
for (const link of studioProfile.links) {
  const anchor = '<a href="' + link.href + '">' + text(link.label) + '</a>';
  assert.ok(introduction.includes(anchor));
  assert.ok(children.includes(anchor));
}
assert.equal((children.match(/href="#studio"/g) || []).length, studioProjects.length + 1);
assert.ok(pageModule.metadata.title.includes(studioProfile.name));
assert.equal(pageModule.metadata.description, studioProfile.intro);
assert.ok(!html.includes('aria-hidden="true"><main'));
for (const filename of ['app/studio/page.tsx', 'components/studio/ProjectEvidence.tsx']) {
  const source = fs.readFileSync(filename, 'utf8');
  assert.ok(!/^['"]use client['"]/m.test(source), 'Server component: ' + filename);
}
console.log(JSON.stringify({
  result: 'PASS',
  boundary: 'Only actual server-owned slots rendered; client/scene not rendered',
  projects: studioProjects.length,
  facts: factCount,
  paragraphs: paragraphCount,
  uniqueIds: ids.length,
  checks: ['profile', 'all supplied evidence', 'normal links', 'exact anchors', 'focusable headings', 'semantic labels', 'metadata', 'server-only sources'],
}, null, 2));
'@ | node
```

