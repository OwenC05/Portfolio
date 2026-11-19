// CPU only: executes source in memory; no generated files, server, or browser.
// The commit harness below simulates hooks/DOM ports; it is not a browser test.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
)
function loader(react = React) {
  const cache = new Map()
  const fakeScene = () => null
  const load = (name, from = root) => {
    if (name === 'react') return react
    if (name === 'next/dynamic') return () => fakeScene
    if (name.endsWith('.css'))
      return {
        __esModule: true,
        default: new Proxy({}, { get: (_, key) => key }),
      }
    if (
      !name.startsWith('.') &&
      !name.startsWith('@/') &&
      !path.isAbsolute(name)
    )
      return require(name)
    const base = name.startsWith('@/')
      ? path.join(root, name.slice(2))
      : path.resolve(from, name)
    const file = [base, `${base}.ts`, `${base}.tsx`].find(
      (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    )
    assert.ok(file, `Source module exists: ${base}`)
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }
    cache.set(file, module)
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText
    new Function('require', 'module', 'exports', output)(
      (id) => load(id, path.dirname(file)),
      module,
      module.exports
    )
    return module.exports
  }
  return load
}
const load = loader()
const { createPanelNavigation } = load('@/app/studio/panel-navigation')
const { lockPanelScroll } = load('@/app/studio/panel-scroll')
const { studioProjects, studioProfile } = load('@/lib/studio-content')
const ProjectEvidence = load('@/components/studio/ProjectEvidence').default
let passes = 0
function check(name, run) {
  run()
  passes++
  console.log(`PASS ${name}`)
}

function historyModel(
  hash = '',
  state = { __NA: true, tree: ['route'], custom: { value: 7 } }
) {
  const entries = [
    {
      href: `https://portfolio.test/studio?preview=1${hash}`,
      state: structuredClone(state),
      restoration: 'auto',
    },
  ]
  let index = 0
  let pending = 0
  let scrollPort
  const savePosition = () => {
    if (scrollPort)
      entries[index].position = { x: scrollPort.scrollX, y: scrollPort.scrollY }
  }
  const calls = []
  const location = {
    get href() {
      return entries[index].href
    },
  }
  const history = {
    get state() {
      return entries[index].state
    },
    get scrollRestoration() {
      return entries[index].restoration
    },
    set scrollRestoration(value) {
      entries[index].restoration = value
    },
    pushState(value, _, url) {
      savePosition()
      calls.push('push')
      entries.splice(index + 1)
      entries.push({
        href: new URL(url, location.href).href,
        state: structuredClone(value),
        restoration: entries[index].restoration,
        position: entries[index].position,
      })
      index++
    },
    replaceState(value, _, url) {
      calls.push('replace')
      entries[index] = {
        ...entries[index],
        href: new URL(url, location.href).href,
        state: structuredClone(value),
      }
    },
    back() {
      calls.push('back')
      pending = -1
    },
  }
  return {
    location,
    history,
    calls,
    entries,
    back() {
      pending = -1
    },
    forward() {
      pending = 1
    },
    go(delta) {
      pending = delta
    },
    settle() {
      savePosition()
      index = Math.max(0, Math.min(entries.length - 1, index + pending))
      pending = 0
    },
    connectScroll(port) {
      scrollPort = port
      savePosition()
    },
    restorePosition() {
      const entry = entries[index]
      if (scrollPort && entry.restoration === 'auto' && entry.position) {
        scrollPort.scrollX = entry.position.x
        scrollPort.scrollY = entry.position.y
      }
    },
    hash() {
      return new URL(location.href).hash
    },
  }
}

check(
  'owned open/repeat/switch/close/Forward preserves Next and custom metadata',
  () => {
    const m = historyModel()
    const nav = createPanelNavigation(m.history, m.location)
    nav.open('copilot')
    nav.open('copilot')
    nav.open('typeforge')
    assert.deepEqual(m.calls, ['push', 'replace'])
    assert.equal(m.entries.length, 2)
    assert.deepEqual(m.history.state.tree, ['route'])
    assert.deepEqual(m.history.state.custom, { value: 7 })
    assert.equal(m.history.state.__NA, true)
    nav.close()
    nav.close()
    assert.deepEqual(m.calls, ['push', 'replace', 'back'])
    m.settle()
    assert.equal(nav.read(), null)
    m.forward()
    m.settle()
    assert.equal(nav.read(), 'typeforge')
    nav.close()
    m.settle()
    assert.equal(nav.read(), null)
  }
)
check(
  'fresh fragment and forged/reloaded ownership never Back off-site',
  () => {
    for (const id of ['copilot', 'dissertation', 'typeforge']) {
      const m = historyModel(`#project-${id}`, {
        __NA: true,
        tree: ['safe'],
        __studioPanelEntry: 'forged',
      })
      const before = structuredClone(m.history.state)
      const nav = createPanelNavigation(m.history, m.location)
      assert.equal(nav.read(), id)
      nav.close()
      assert.equal(m.hash(), '#studio')
      assert.deepEqual(m.calls, ['replace'])
      assert.deepEqual(m.history.state, before)
    }
    const m = historyModel()
    createPanelNavigation(m.history, m.location).open('copilot')
    createPanelNavigation(m.history, m.location).close()
    assert.deepEqual(m.calls, ['push', 'replace'])
  }
)
check(
  'unowned switches stay unowned; external metadata replacement invalidates ownership',
  () => {
    const m = historyModel('#project-copilot')
    const nav = createPanelNavigation(m.history, m.location)
    nav.open('dissertation')
    nav.close()
    assert.deepEqual(m.calls, ['replace', 'replace'])
    nav.open('typeforge')
    m.history.replaceState(
      { __NA: true, tree: ['new-router-state'] },
      '',
      m.location.href
    )
    nav.close()
    assert.equal(m.hash(), '#studio')
    assert.ok(!m.calls.includes('back'))
    assert.deepEqual(m.history.state.tree, ['new-router-state'])
  }
)
check(
  'rapid reopen during asynchronous Back settles to the requested project',
  () => {
    const m = historyModel()
    const nav = createPanelNavigation(m.history, m.location)
    nav.open('copilot')
    nav.close()
    nav.open('typeforge')
    m.settle()
    assert.equal(nav.read(), 'typeforge')
    assert.deepEqual(m.calls, ['push', 'back', 'push'])
    assert.equal(m.entries.length, 2)
    nav.close()
    m.settle()
    assert.equal(nav.read(), null)
  }
)

function style() {
  const values = new Map()
  return {
    getPropertyValue: (key) => values.get(key)?.[0] ?? '',
    getPropertyPriority: (key) => values.get(key)?.[1] ?? '',
    setProperty: (key, value, priority = '') =>
      values.set(key, [value, priority]),
    removeProperty: (key) => values.delete(key),
  }
}
check(
  'scroll lock restores existing inline values, priorities and exact position once',
  () => {
    const document = {
      documentElement: { style: style() },
      body: { style: style() },
    }
    document.body.style.setProperty('position', 'relative', 'important')
    document.documentElement.style.setProperty('overflow', 'scroll')
    const scrolls = []
    const release = lockPanelScroll(document, {
      scrollX: 3,
      scrollY: 45,
      scrollTo: (value) => scrolls.push(value),
    })
    assert.equal(document.body.style.getPropertyValue('top'), '-45px')
    assert.equal(document.body.style.getPropertyValue('position'), 'fixed')
    release()
    release()
    assert.equal(document.body.style.getPropertyValue('position'), 'relative')
    assert.equal(
      document.body.style.getPropertyPriority('position'),
      'important'
    )
    assert.equal(document.body.style.getPropertyValue('top'), '')
    assert.equal(
      document.documentElement.style.getPropertyValue('overflow'),
      'scroll'
    )
    assert.deepEqual(scrolls, [{ left: 3, top: 45, behavior: 'instant' }])
  }
)

const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      })[char]
  )
function assertEvidence(html) {
  for (const project of studioProjects) {
    for (const value of [
      project.title,
      project.eyebrow,
      project.summary,
      ...project.facts.flatMap((fact) => [fact.label, fact.value]),
      ...project.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
      ]),
      ...project.links.flatMap((link) => [link.label, link.href]),
    ]) {
      assert.ok(
        html.includes(escape(value)),
        `Content preserved: ${value.slice(0, 55)}`
      )
    }
  }
}
function assertIds(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
  assert.equal(new Set(ids).size, ids.length, 'Unique DOM IDs')
  for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    for (const id of match[1].split(' '))
      assert.ok(ids.includes(id), `Label exists: ${id}`)
  }
}
check(
  'real React SSR preserves complete project content and unique prefixed labels',
  () => {
    const evidence = studioProjects.flatMap((project, index) =>
      ['', 'panel-'].map((idPrefix) =>
        React.createElement(ProjectEvidence, {
          key: `${idPrefix}${project.id}`,
          project,
          index,
          idPrefix,
        })
      )
    )
    const html = renderToStaticMarkup(
      React.createElement(React.Fragment, null, evidence)
    )
    assertEvidence(html)
    assertIds(html)
    for (const project of studioProjects)
      assert.ok(html.includes(`id="panel-project-${project.id}-heading"`))
  }
)
check(
  'full page SSR exposes evidence, profile, About/contact and original Next metadata',
  () => {
    const page = load('@/app/studio/page')
    const html = renderToStaticMarkup(React.createElement(page.default))
    assertEvidence(html)
    assertIds(html)
    assert.ok(html.includes('data-enhanced="false"'))
    assert.ok(!html.includes('hidden=""'))
    assert.ok(!/<dialog[^>]*\sopen(?:=|\s|>)/.test(html))
    for (const id of ['studio', 'work', 'about', 'contact'])
      assert.ok(html.includes(`id="${id}"`))
    for (const value of [
      studioProfile.name,
      studioProfile.role,
      studioProfile.intro,
      studioProfile.personalNote,
    ])
      assert.ok(html.includes(escape(value)))
    assert.equal(
      page.metadata.title,
      `${studioProfile.name} — After-hours Studio`
    )
    assert.equal(page.metadata.description, studioProfile.intro)
  }
)

// Minimal deterministic hook/commit runner. Executes the actual component and
// event handlers against explicit DOM/history ports; no browser behavior assumed.
function experienceHarness({
  hash = '',
  unavailable = false,
  throws = false,
} = {}) {
  const previousGlobals = new Map(
    ['window', 'document', 'Element', 'HTMLAnchorElement'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ])
  )
  const m = historyModel(hash)
  const elements = new Map()
  const events = new Map()
  let activeElement = null
  class Element {
    isConnected = true
    scrollTop = 0
    focus(options) {
      activeElement = this
      assert.equal(options.preventScroll, true)
    }
    scrollIntoView(options) {
      this.scrolled = options
    }
    getBoundingClientRect() {
      return { top: -window.scrollY }
    }
    closest() {
      return this
    }
    contains(node) {
      for (let current = node; current; current = current.parentElement) {
        if (current === this) return true
      }
      return false
    }
  }
  class Anchor extends Element {
    constructor(href, options = {}) {
      super()
      this.href = new URL(href, m.location.href).href
      this.target = ''
      Object.assign(this, options)
    }
    hasAttribute(key) {
      return Boolean(this[key])
    }
  }
  for (const id of [
    'studio',
    'studio-projects',
    ...studioProjects.flatMap(({ id }) => [
      `studio-shortcut-${id}`,
      `panel-project-${id}-heading`,
      `project-${id}-heading`,
    ]),
  ])
    elements.set(id, Object.assign(new Element(), { id }))
  for (const project of studioProjects) {
    elements.get(`studio-shortcut-${project.id}`).parentElement =
      elements.get('studio-projects')
  }
  const dialog = Object.assign(new Element(), {
    open: false,
    shown: 0,
    closed: 0,
    showModal: unavailable
      ? undefined
      : function () {
          if (throws) throw Error('native showModal failed')
          this.open = true
          this.shown++
        },
    close() {
      this.open = false
      this.closed++
    },
  })
  const panelScroll = new Element()
  const toggle = Object.assign(new Element(), { offsetParent: {} })
  const mediaListeners = new Set()
  const media = {
    matches: false,
    addEventListener: (_, fn) => mediaListeners.add(fn),
    removeEventListener: (_, fn) => mediaListeners.delete(fn),
  }
  const window = {
    history: m.history,
    location: {
      get href() {
        return m.location.href
      },
      get hash() {
        return m.hash()
      },
      set hash(value) {
        m.history.pushState(m.history.state, '', value)
      },
      get origin() {
        return new URL(m.location.href).origin
      },
      get pathname() {
        return new URL(m.location.href).pathname
      },
      get search() {
        return new URL(m.location.href).search
      },
    },
    scrollX: 2,
    scrollY: 65,
    scrolls: [],
    scrollTo(value) {
      this.scrolls.push(value)
      this.scrollX = value.left
      this.scrollY = value.top
    },
    matchMedia: () => media,
    addEventListener(type, fn) {
      if (!events.has(type)) events.set(type, new Set())
      events.get(type).add(fn)
    },
    removeEventListener: (type, fn) => events.get(type)?.delete(fn),
  }
  const document = {
    get activeElement() {
      return activeElement
    },
    documentElement: { style: style() },
    body: { style: style() },
    getElementById: (id) => elements.get(id) ?? null,
  }
  Object.assign(globalThis, {
    window,
    document,
    Element,
    HTMLAnchorElement: Anchor,
  })
  const hooks = []
  let cursor = 0,
    dirty = true,
    pending = [],
    output
  const same = (a, b) =>
    a &&
    b &&
    a.length === b.length &&
    a.every((value, index) => Object.is(value, b[index]))
  const useEffect = (effect, deps) => {
    const index = cursor++,
      old = hooks[index]
    if (!old || !same(old.deps, deps)) {
      const slot = (hooks[index] = { deps, cleanup: old?.cleanup, effect })
      pending.push(() => {
        slot.cleanup?.()
        slot.cleanup = effect()
      })
    }
  }
  const react = {
    ...React,
    useEffect,
    useLayoutEffect: useEffect,
    useState(initial) {
      const index = cursor++
      if (!(index in hooks))
        hooks[index] = {
          value: typeof initial === 'function' ? initial() : initial,
        }
      return [
        hooks[index].value,
        (next) => {
          const value =
            typeof next === 'function' ? next(hooks[index].value) : next
          if (!Object.is(value, hooks[index].value)) {
            hooks[index].value = value
            dirty = true
          }
        },
      ]
    },
    useRef(value) {
      const index = cursor++
      return (hooks[index] ??= { current: value })
    },
    useCallback(fn, deps) {
      const index = cursor++
      if (!same(hooks[index]?.deps, deps)) hooks[index] = { deps, fn }
      return hooks[index].fn
    },
  }
  const Experience = loader(react)(
    '@/components/studio/StudioExperience'
  ).default
  const flush = () => {
    let commits = 0
    while (dirty || pending.length) {
      assert.ok(++commits < 15, 'Commit converges without timer')
      if (dirty) {
        dirty = false
        cursor = 0
        output = Experience({
          evidence: 'SSR evidence',
          children: 'About/contact',
        }).props
        output.dialogRef.current = dialog
        output.panelScrollRef.current = panelScroll
        output.projectsToggleRef.current = toggle
      }
      const effects = pending
      pending = []
      effects.forEach((effect) => effect())
    }
  }
  flush()
  const event = (extra = {}) => ({
    button: 0,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
    stopPropagation() {
      this.stopped = true
    },
    ...extra,
  })
  return {
    m,
    dialog,
    panelScroll,
    document,
    window,
    media,
    mediaListeners,
    elements,
    toggle,
    flush,
    event,
    get props() {
      return output
    },
    get active() {
      return activeElement
    },
    get scene() {
      return output.scene.props.children.props
    },
    click(href, flags = {}, anchorOptions = {}) {
      const anchor = new Anchor(href, anchorOptions)
      const e = event({
        target: anchor,
        currentTarget: { contains: () => true },
        ...flags,
      })
      output.onNavigate(e)
      flush()
      return { e, anchor }
    },
    emit(type, commit = true) {
      events.get(type)?.forEach((fn) => fn())
      if (commit) flush()
    },
    replayEffects() {
      hooks.filter((h) => h.effect).forEach((h) => h.cleanup?.())
      hooks
        .filter((h) => h.effect)
        .forEach((h) => {
          h.cleanup = h.effect()
        })
      flush()
    },
    dispose() {
      hooks.filter((h) => h.effect).forEach((h) => h.cleanup?.())
      assert.equal(mediaListeners.size, 0)
      assert.ok([...events.values()].every((listeners) => listeners.size === 0))
      assert.equal(window.history.scrollRestoration, 'auto')
      assert.equal(document.body.style.getPropertyValue('position'), '')
      for (const [key, descriptor] of previousGlobals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else delete globalThis[key]
      }
    },
  }
}
function withHarness(options, run) {
  const h = experienceHarness(options)
  try {
    run(h)
  } finally {
    h.dispose()
  }
}

check(
  'commit opens while scene loading; switch resets real reading scroller and heading',
  () =>
    withHarness({}, (h) => {
      const sceneType = h.props.scene.props.children.type
      const { anchor } = h.click('#project-copilot')
      assert.equal(h.props.sceneStatus, 'loading')
      assert.equal(h.dialog.open, true)
      assert.equal(h.dialog.shown, 1)
      assert.equal(h.active.id, 'panel-project-copilot-heading')
      assert.equal(h.scene.interactionEnabled, false)
      assert.equal(h.window.scrolls.length, 0)
      h.panelScroll.scrollTop = 900
      h.scene.onSelectProject('dissertation')
      h.flush()
      assert.equal(h.panelScroll.scrollTop, 0)
      assert.equal(h.active.id, 'panel-project-dissertation-heading')
      assert.equal(h.dialog.shown, 1)
      assert.equal(h.props.scene.props.children.type, sceneType)
      assert.deepEqual(h.props.projectContent.props.project, studioProjects[0])
      assert.equal(h.props.projectContent.props.idPrefix, 'panel-')
      h.props.onRequestClose()
      h.flush()
      assert.equal(h.dialog.open, false)
      assert.equal(h.active.id, 'studio-shortcut-dissertation')
      assert.notEqual(h.active, anchor)
      assert.equal(h.scene.interactionEnabled, true)
    })
)
check(
  'Escape/article #studio/close share safe history and invoker focus return',
  () => {
    for (const method of ['escape', 'article', 'button'])
      withHarness({}, (h) => {
        const { anchor } = h.click('#project-typeforge')
        if (method === 'escape') {
          const e = h.event()
          h.props.onDialogCancel(e)
          assert.equal(e.defaultPrevented, true)
        }
        if (method === 'article') h.click('#studio')
        if (method === 'button') h.props.onRequestClose()
        h.flush()
        assert.equal(h.active, anchor)
        assert.equal(h.dialog.open, false)
        assert.deepEqual(h.m.calls, ['push', 'back'])
        h.m.settle()
        h.emit('popstate')
        h.emit('hashchange')
        h.m.forward()
        h.m.settle()
        h.emit('popstate')
        h.emit('hashchange')
        assert.equal(h.dialog.open, true)
        assert.equal(h.props.selectedProjectId, 'typeforge')
        assert.deepEqual(h.m.calls, ['push', 'back'])
      })
  }
)
check(
  'fresh deep link opens at hydration and closes without Back; stale close event is harmless',
  () =>
    withHarness({ hash: '#project-dissertation' }, (h) => {
      assert.equal(h.dialog.open, true)
      assert.equal(h.window.scrollY, 0)
      assert.equal(h.active.id, 'panel-project-dissertation-heading')
      h.props.onDialogClose()
      h.flush()
      assert.equal(h.dialog.open, true)
      h.props.onRequestClose()
      h.flush()
      assert.deepEqual(h.m.calls, ['replace'])
      assert.equal(h.m.hash(), '#studio')
    })
)
check(
  'modified/nonprimary/download/external/target/query links retain native behavior',
  () =>
    withHarness({}, (h) => {
      for (const flags of [
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
        { defaultPrevented: true },
      ]) {
        const { e } = h.click('#project-copilot', flags)
        assert.equal(e.defaultPrevented, Boolean(flags.defaultPrevented))
      }
      for (const options of [{ download: true }, { target: '_blank' }])
        assert.equal(
          h.click('#project-copilot', {}, options).e.defaultPrevented,
          false
        )
      for (const url of [
        'https://elsewhere.test/#project-copilot',
        '/other#project-copilot',
        '/studio?other=1#project-copilot',
        '#about',
        '#contact',
      ])
        assert.equal(h.click(url).e.defaultPrevented, false)
      assert.deepEqual(h.m.calls, [])
    })
)
check(
  'Work/disclosure focus and scoped keyboard commands have no document scrolling',
  () =>
    withHarness({}, (h) => {
      assert.equal(h.click('#work').e.defaultPrevented, true)
      assert.equal(h.active.id, 'studio-projects')
      assert.equal(h.props.projectsOpen, true)
      const escape = h.event({ key: 'Escape' })
      h.props.onProjectsKeyDown(escape)
      h.flush()
      assert.equal(h.active, h.toggle)
      assert.equal(h.props.projectsOpen, false)
      const key = h.event({ key: 'ArrowRight' })
      h.props.onLookKeyDown(key)
      h.flush()
      assert.deepEqual(h.scene.viewCommand, { action: 'right', sequence: 1 })
      h.props.onViewCommand('reset')
      h.flush()
      assert.deepEqual(h.scene.viewCommand, { action: 'reset', sequence: 2 })
      const modified = h.event({ key: 'ArrowLeft', ctrlKey: true })
      h.props.onLookKeyDown(modified)
      h.flush()
      assert.equal(modified.defaultPrevented, false)
      h.click('#project-copilot')
      h.props.onViewCommand('left')
      h.flush()
      assert.equal(h.scene.viewCommand.sequence, 2)
    })
)
check(
  'live reduced motion and graphics failure never gate project reading',
  () =>
    withHarness({}, (h) => {
      assert.equal(h.scene.reducedMotion, false)
      h.media.matches = true
      h.mediaListeners.forEach((fn) => fn())
      h.flush()
      assert.equal(h.scene.reducedMotion, true)
      h.scene.onStatusChange('unavailable')
      h.flush()
      h.click('#project-copilot')
      assert.equal(h.dialog.open, true)
      assert.equal(h.props.sceneStatus, 'unavailable')
      h.media.matches = false
      h.mediaListeners.forEach((fn) => fn())
      h.flush()
      assert.equal(h.scene.reducedMotion, false)
      assert.equal(h.dialog.open, true)
    })
)
check(
  'missing or failing native dialog leaves server evidence available',
  () => {
    withHarness({ unavailable: true }, (h) => {
      assert.equal(h.props.enhanced, false)
      assert.equal(h.click('#project-copilot').e.defaultPrevented, false)
      assert.equal(h.props.projectContent, null)
    })
    withHarness({ throws: true }, (h) => {
      h.click('#project-copilot')
      assert.equal(h.props.enhanced, false)
      assert.equal(h.props.projectContent, null)
      assert.equal(h.active.id, 'project-copilot-heading')
      assert.equal(h.document.body.style.getPropertyValue('position'), '')
      assert.equal(h.window.history.scrollRestoration, 'auto')
      h.emit('hashchange')
      assert.equal(h.props.selectedProjectId, null)
    })
  }
)
check(
  'TC-01 ordinary room/About/Contact history retains native saved positions around a panel round trip',
  () => {
    for (const commitBeforeRestoration of [true, false])
      withHarness({}, (h) => {
        // Explicit browser port: save positions on departure, restore between
        // popstate and hashchange. This models history, not layout or native timing.
        h.m.connectScroll(h.window)
        const visitSection = (hash, y) => {
          assert.equal(h.click(hash).e.defaultPrevented, false)
          h.m.history.pushState(h.m.history.state, '', hash)
          h.window.scrollY = y
          h.emit('hashchange')
        }
        const traverse = (direction, hash, y) => {
          if (typeof direction === 'number') h.m.go(direction)
          else h.m[direction]()
          h.m.settle()
          h.emit('popstate', commitBeforeRestoration)
          assert.equal(
            h.window.history.scrollRestoration,
            hash.startsWith('#project-') ? 'manual' : 'auto'
          )
          h.m.restorePosition()
          h.flush()
          h.emit('hashchange')
          assert.equal(h.m.hash(), hash)
          assert.equal(h.window.scrollY, y)
        }
        const roomY = h.window.scrollY
        visitSection('#about', 900)
        visitSection('#contact', 1350)
        traverse('back', '#about', 900)
        traverse('back', '', roomY)
        traverse('forward', '#about', 900)
        traverse('forward', '#contact', 1350)
        assert.equal(
          h.window.scrolls.length,
          0,
          'No app scroll for ordinary sections'
        )
        traverse('back', '#about', 900)
        h.click('#project-copilot')
        assert.equal(h.dialog.open, true)
        assert.equal(h.active.id, 'panel-project-copilot-heading')
        assert.equal(h.window.scrollY, 900)
        assert.equal(
          h.m.entries.at(-2).restoration,
          'auto',
          'Opening never disables the base entry'
        )
        assert.equal(h.m.history.scrollRestoration, 'manual')
        // A fixed body can expose zero as the window scroll position. A browser
        // traversal saves it on the panel entry; Forward must not restore it.
        h.window.scrollY = 0
        traverse('back', '#about', 900)
        assert.equal(h.m.entries.at(-1).position.y, 0)
        traverse('forward', '#project-copilot', 900)
        assert.equal(h.document.body.style.getPropertyValue('top'), '-900px')
        assert.equal(h.active.id, 'panel-project-copilot-heading')
        h.props.onRequestClose()
        h.flush()
        h.m.settle()
        h.emit('popstate')
        h.m.restorePosition()
        h.emit('hashchange')
        assert.equal(h.m.hash(), '#about')
        assert.equal(h.window.scrollY, 900)
        traverse('back', '', roomY)
        traverse('forward', '#about', 900)
        traverse('forward', '#project-copilot', 900)
        assert.equal(h.dialog.open, true)
        assert.equal(h.active.id, 'panel-project-copilot-heading')
        h.window.scrollY = 0
        traverse(-2, '', roomY)
        assert.equal(h.dialog.open, false)
        traverse('forward', '#about', 900)
      })
  }
)
check(
  'TC-02 toggle/Escape/scene collapse move retained nav or descendant focus before folding',
  () => {
    for (const focusedId of ['studio-projects', 'studio-shortcut-copilot']) {
      for (const action of ['toggle', 'escape', 'scene'])
        withHarness({}, (h) => {
          h.elements.get(focusedId).focus({ preventScroll: true })
          h.props.onFocusProjects()
          h.flush()
          assert.equal(h.props.projectsOpen, true)
          if (action === 'toggle') h.props.onToggleProjects()
          if (action === 'escape')
            h.props.onProjectsKeyDown(h.event({ key: 'Escape' }))
          if (action === 'scene') h.props.onScenePointerDown(h.event())
          h.flush()
          assert.equal(h.props.projectsOpen, false)
          assert.equal(h.active, h.toggle)
          assert.equal(
            h.elements.get('studio-projects').contains(h.active),
            false
          )
          assert.equal(h.window.scrolls.length, 0)
        })
    }
    withHarness({}, (h) => {
      h.props.onToggleProjects()
      h.flush()
      h.elements.get('studio').focus({ preventScroll: true })
      h.props.onScenePointerDown(h.event())
      h.flush()
      assert.equal(h.props.projectsOpen, false)
      assert.equal(h.active.id, 'studio', 'Do not move unrelated focus')
      h.click('#work')
      assert.equal(h.props.projectsOpen, true)
      assert.equal(h.active.id, 'studio-projects')
      h.toggle.offsetParent = null
      h.props.onScenePointerDown(h.event())
      h.flush()
      assert.equal(h.props.projectsOpen, false)
      assert.equal(
        h.active.id,
        'studio',
        'Use room when compact toggle is absent'
      )
    })
  }
)
check(
  'TC-02 focus moves before collapse; failed focus retains expansion and panel return unfolds',
  () =>
    withHarness({}, (h) => {
      const nav = h.elements.get('studio-projects')
      h.click('#work')
      const focus = h.toggle.focus.bind(h.toggle)
      h.toggle.focus = (options) => {
        assert.equal(
          h.props.projectsOpen,
          true,
          'Move focus before committing collapsed state'
        )
        focus(options)
      }
      h.props.onToggleProjects()
      h.flush()
      assert.equal(h.props.projectsOpen, false)
      assert.equal(h.active, h.toggle)
      h.click('#work')
      h.toggle.focus = () => {}
      h.props.onScenePointerDown(h.event())
      h.flush()
      assert.equal(h.active, nav)
      assert.equal(
        h.props.projectsOpen,
        true,
        'Failed focus must not contradict visible focus-within state'
      )
      h.toggle.focus = focus
      h.props.onScenePointerDown(h.event())
      h.flush()
      h.scene.onSelectProject('typeforge')
      h.flush()
      h.props.onRequestClose()
      h.flush()
      assert.equal(h.active.id, 'studio-shortcut-typeforge')
      assert.equal(h.props.projectsOpen, true)
      h.m.settle()
      h.emit('popstate')
      h.emit('hashchange')
      h.props.onScenePointerDown(h.event())
      h.flush()
      assert.equal(h.props.projectsOpen, false)
      assert.equal(h.active, h.toggle)
      h.elements.get('studio-shortcut-copilot').focus({ preventScroll: true })
      h.props.onFocusProjects()
      h.flush()
      assert.equal(
        h.props.projectsOpen,
        true,
        'Tab/focus reveal remains available'
      )
    })
)
check(
  'simulated StrictMode effect cleanup/replay retains one dialog and cleans listeners',
  () =>
    withHarness({ hash: '#project-typeforge' }, (h) => {
      h.replayEffects()
      assert.equal(h.dialog.open, true)
      assert.equal(h.active.id, 'panel-project-typeforge-heading')
      assert.equal(h.mediaListeners.size, 1)
    })
)

console.log(
  `PASS ${passes} CPU/history/SSR/commit-harness groups; browser/native dialog/Next hydration/layout not exercised`
)
