// Bounded CPU review evidence. No browser, server, build, generated Next files,
// product edits, or performer-test edits. Extends the performer's explicit ports.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const directory = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(directory, 'verify-behavior.mjs')
const fixtureSource = fs.readFileSync(fixturePath, 'utf8')
const output = ts.transpileModule(
  fixtureSource
    .replace('const require = createRequire(import.meta.url)', '')
    .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(fixturePath).href)) +
    '\nexport { experienceHarness, loader, historyModel };\n',
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }
).outputText
const fixture = { exports: {} }
new Function('require', 'module', 'exports', output)(require, fixture, fixture.exports)
const { experienceHarness } = fixture.exports

const observations = []
const h = experienceHarness()
try {
  const priorScrollY = h.window.scrollY
  const aboutClick = h.click('#about')
  assert.equal(aboutClick.e.defaultPrevented, false)
  // The real page delegates About to native fragment navigation. Model its
  // history entry and landing position, then deliver traversal notifications.
  h.m.history.pushState(h.m.history.state, '', '#about')
  h.window.scrollY = 900
  h.emit('hashchange')
  h.m.back()
  h.m.settle()
  h.emit('popstate')
  h.emit('hashchange')
  const finding = {
    id: 'TC-01',
    scope: 'CPU component handlers plus explicit native-navigation port',
    restorationMode: h.window.history.scrollRestoration,
    hashAfterBack: h.m.hash(),
    priorScrollY,
    scrollYAfterHandlers: h.window.scrollY,
    scriptedScrollRestorations: h.window.scrolls.length,
  }
  assert.equal(finding.restorationMode, 'manual')
  assert.equal(finding.hashAfterBack, '')
  assert.equal(finding.scrollYAfterHandlers, 900)
  assert.equal(finding.scriptedScrollRestorations, 0)
  observations.push(finding)
} finally {
  h.dispose()
}

const disclosure = experienceHarness()
try {
  const nav = disclosure.elements.get('studio-projects')
  nav.focus({ preventScroll: true })
  disclosure.props.onFocusProjects()
  disclosure.flush()
  // Button activation need not itself move DOM focus (e.g. AT activation).
  disclosure.props.onToggleProjects()
  disclosure.flush()
  assert.equal(disclosure.props.projectsOpen, false)
  assert.equal(disclosure.active, nav)
  observations.push({
    id: 'TC-02',
    scope: 'CPU focus-retaining activation; CSS selector inspected separately',
    expandedState: disclosure.props.projectsOpen,
    focusedElement: disclosure.active.id,
    implication: 'The projects:not(:focus-within) folding selector does not match while navigation retains focus.',
  })
} finally {
  disclosure.dispose()
}

console.log(JSON.stringify({
  result: 'REPRODUCED review observations; exit zero means the evidence assertions passed, not product acceptance',
  observations,
  limits: 'Performer hook/DOM ports are reused; no native browser scroll restoration, assistive technology, Next hydration or rendering exercised.',
}, null, 2))
