// Post-repair acceptance probes. Historical defect probes remain unchanged.
// Runs source in memory through the performer's explicit CPU ports, then adds
// independently selected checks. This is not native browser/React scheduling.
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
    '\nexport { experienceHarness };\n',
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }
).outputText
const fixture = { exports: {} }
new Function('require', 'module', 'exports', output)(require, fixture, fixture.exports)
const { experienceHarness } = fixture.exports
let criticGroups = 0
function check(name, run) {
  run()
  criticGroups++
  console.log(`PASS critic ${name}`)
}
function withHarness(run) {
  const h = experienceHarness()
  try { run(h) } finally { h.dispose() }
}

check('TC-01 original room/About/Back path permits native x/y restoration', () => {
  withHarness((h) => {
    h.window.scrollX = 13
    h.window.scrollY = 65
    h.m.connectScroll(h.window)
    assert.equal(h.click('#about').e.defaultPrevented, false)
    h.m.history.pushState(h.m.history.state, '', '#about')
    h.window.scrollX = 0
    h.window.scrollY = 900
    h.emit('hashchange')
    h.m.back()
    h.m.settle()
    h.emit('popstate', false)
    assert.equal(h.window.history.scrollRestoration, 'auto')
    h.m.restorePosition()
    h.flush()
    h.emit('hashchange')
    assert.equal(h.m.hash(), '')
    assert.deepEqual([h.window.scrollX, h.window.scrollY], [13, 65])
    assert.equal(h.window.scrolls.length, 0)
  })
})

check('TC-01 Next-like token loss uses safe replacement, then ordinary restoration still works', () => {
  withHarness((h) => {
    const tree = ['', { children: ['studio', {}] }]
    h.m.history.replaceState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: tree, custom: 'keep' }, '', h.m.location.href)
    h.m.connectScroll(h.window)
    const background = [h.window.scrollX, h.window.scrollY]
    h.click('#project-copilot')
    assert.equal(h.m.entries[0].restoration, 'auto')
    assert.equal(h.m.history.scrollRestoration, 'manual')
    h.m.back()
    h.m.settle()
    h.emit('popstate', false)
    assert.equal(h.document.body.style.getPropertyValue('position'), '')
    h.m.restorePosition()
    h.flush()
    h.emit('hashchange')
    h.m.forward()
    h.m.settle()
    h.emit('popstate')
    h.m.restorePosition()
    h.emit('hashchange')
    // Root observed this metadata rewrite on actual Next Forward. Model it as
    // an external consumer write, preserving all remaining metadata.
    const state = { ...h.m.history.state }
    delete state.__studioPanelEntry
    h.m.history.replaceState(state, '', h.m.location.href)
    const beforeClose = h.m.calls.length
    h.props.onRequestClose()
    h.flush()
    assert.deepEqual(h.m.calls.slice(beforeClose), ['replace'])
    assert.equal(h.m.hash(), '#studio')
    assert.equal(h.m.history.scrollRestoration, 'auto')
    assert.deepEqual(h.m.history.state, state)
    assert.equal(h.dialog.open, false)
    assert.equal(h.active.id, 'studio-shortcut-copilot')
    assert.equal(h.scene.interactionEnabled, true)
    assert.deepEqual([h.window.scrollX, h.window.scrollY], background)
    const scriptScrolls = h.window.scrolls.length
    h.m.history.pushState(h.m.history.state, '', '#contact')
    h.window.scrollY = 1400
    h.emit('hashchange')
    h.m.back()
    h.m.settle()
    h.emit('popstate', false)
    h.m.restorePosition()
    h.flush()
    h.emit('hashchange')
    assert.equal(h.m.hash(), '#studio')
    assert.deepEqual([h.window.scrollX, h.window.scrollY], background)
    assert.equal(h.window.scrolls.length, scriptScrolls)
  })
})

const collapse = {
  toggle: (h) => h.props.onToggleProjects(),
  escape: (h) => h.props.onProjectsKeyDown(h.event({ key: 'Escape' })),
  scene: (h) => h.props.onScenePointerDown(h.event()),
}
check('TC-02 all collapse paths preserve expansion on failed focus, then recover', () => {
  for (const focusedId of ['studio-projects', 'studio-shortcut-typeforge']) {
    for (const action of Object.values(collapse)) {
      withHarness((h) => {
        const nav = h.elements.get('studio-projects')
        const focused = h.elements.get(focusedId)
        focused.focus({ preventScroll: true })
        h.props.onFocusProjects()
        h.flush()
        const focus = h.toggle.focus.bind(h.toggle)
        h.toggle.focus = () => {}
        action(h)
        h.flush()
        assert.equal(h.props.projectsOpen, true)
        assert.equal(h.active, focused)
        h.toggle.focus = (options) => {
          assert.equal(h.props.projectsOpen, true)
          focus(options)
        }
        action(h)
        h.flush()
        assert.equal(h.props.projectsOpen, false)
        assert.equal(h.active, h.toggle)
        assert.equal(nav.contains(h.active), false)
        assert.equal(h.window.scrolls.length, 0)
      })
    }
  }
})

check('TC-02 a missing fallback target cannot hide focused links', () => {
  for (const action of [collapse.toggle, collapse.scene]) {
    withHarness((h) => {
      h.click('#work')
      h.toggle.offsetParent = null
      h.elements.delete('studio')
      action(h)
      h.flush()
      assert.equal(h.props.projectsOpen, true)
      assert.equal(h.active.id, 'studio-projects')
      assert.equal(h.window.scrolls.length, 0)
    })
  }
})

console.log(`PASS ${criticGroups} additional critic groups; historical defect assertions were not changed or executed`)
