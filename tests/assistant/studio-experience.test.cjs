/* eslint-disable @typescript-eslint/no-require-imports -- Existing Node/TypeScript test-loader convention. */
// Actual StudioExperience, useAssistantRun, request owner, reducer, navigation
// and scroll-lock helpers on a small synchronous hook/DOM port. Children and the
// dynamic scene are opaque JSX. No React DOM, native dialog, browser, GPU or
// StrictMode certification is implied. Effects may be replayed explicitly.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../..')
const ts = require(path.join(root, 'node_modules/typescript'))

function mount(t, options = {}) {
  const saved = Object.fromEntries(
    [
      'window',
      'document',
      'Element',
      'HTMLElement',
      'HTMLAnchorElement',
      'fetch',
    ].map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)])
  )
  const slots = [],
    updates = [],
    cache = new Map(),
    owners = []
  const requests = [],
    nativeEvents = [],
    historyEvents = [],
    focusLog = [],
    scrollLog = [],
    commits = []
  const listeners = new Map(),
    mediaListeners = new Set(),
    elements = new Map()
  let cursor = 0,
    dirty = true,
    mounted = true,
    props,
    showCalls = 0,
    closeCalls = 0
  const same = (a, b) =>
    a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  const schedule = (fn, deps, kind) => {
    const i = cursor++,
      old = slots[i]
    slots[i] = {
      ...old,
      kind,
      create: fn,
      deps,
      pending: !old || !same(old.deps, deps),
    }
  }
  const memo = (fn, deps) => {
    const i = cursor++
    if (!slots[i] || !same(slots[i].deps, deps))
      slots[i] = { deps, value: fn() }
    return slots[i].value
  }
  const react = {
    Component: class {
      constructor(props) {
        this.props = props
      }
    },
    useState(initial) {
      const i = cursor++
      if (!(i in slots))
        slots[i] = {
          value: typeof initial === 'function' ? initial() : initial,
        }
      return [
        slots[i].value,
        (value) => {
          updates.push(() => {
            slots[i].value =
              typeof value === 'function' ? value(slots[i].value) : value
          })
          dirty = true
        },
      ]
    },
    useRef(initial) {
      const i = cursor++
      return (slots[i] ??= { current: initial })
    },
    useMemo: memo,
    useCallback: (fn, deps) => memo(() => fn, deps),
    useLayoutEffect: (fn, deps) => schedule(fn, deps, 'layout'),
    useEffect: (fn, deps) => schedule(fn, deps, 'passive'),
  }
  const jsx = (type, props) => ({ type, props })
  function read(filename) {
    if (!path.extname(filename))
      filename += fs.existsSync(filename + '.ts') ? '.ts' : '.tsx'
    if (cache.has(filename)) return cache.get(filename).exports
    const mod = { exports: {} }
    cache.set(filename, mod)
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText
    const req = (id) => {
      if (id === 'react') return react
      if (id === 'react/jsx-runtime')
        return { jsx, jsxs: jsx, Fragment: 'fragment' }
      if (id === 'next/dynamic')
        return { default: () => 'opaque-dynamic-scene' }
      if (id.endsWith('.css'))
        return { default: new Proxy({}, { get: (_, k) => String(k) }) }
      if (id.startsWith('@/')) return read(path.join(root, id.slice(2)))
      if (id.startsWith('.'))
        return read(path.resolve(path.dirname(filename), id))
      return require(id)
    }
    new Function('require', 'module', 'exports', code)(req, mod, mod.exports)
    if (filename.endsWith(path.join('assistant', 'run-transport.ts'))) {
      const create = mod.exports.createAssistantRunOwner
      mod.exports.createAssistantRunOwner = (settings) => {
        const actual = create(settings)
        const record = {
          actual,
          disposed: false,
          generationEnabled: settings.generationEnabled,
        }
        owners.push(record)
        return {
          ...actual,
          dispose() {
            record.disposed = true
            actual.dispose()
          },
        }
      }
    }
    return mod.exports
  }
  const emit = (name) => {
    for (const listener of [...(listeners.get(name) ?? [])]) listener()
  }
  class ElementPort {
    constructor(id, inside = false) {
      this.id = id
      this.inside = inside
      this.isConnected = true
      this.offsetParent = {}
      this.listeners = new Map()
      this.scrollTop = 19
    }
    addEventListener(name, fn) {
      if (!this.listeners.has(name)) this.listeners.set(name, new Set())
      this.listeners.get(name).add(fn)
    }
    removeEventListener(name, fn) {
      this.listeners.get(name)?.delete(fn)
    }
    dispatch(name) {
      for (const fn of [...(this.listeners.get(name) ?? [])]) fn()
    }
    focus() {
      // Optional inertness models rejection of background focus while modal.
      const blocked = options.inertFocus && dialog.open && !this.inside
      focusLog.push({
        id: this.id,
        blocked: !!blocked,
        dialogOpen: dialog.open,
      })
      if (blocked) return
      const previous = documentPort.activeElement
      documentPort.activeElement = this
      if (previous !== this) {
        previous?.dispatch('blur')
        this.dispatch('focus')
      }
    }
    blur() {
      if (documentPort.activeElement !== this) return
      documentPort.activeElement = documentPort.body
      this.dispatch('blur')
    }
    contains(node) {
      return node === this
    }
    closest() {
      return null
    }
    getBoundingClientRect() {
      return { top: 100 }
    }
    scrollIntoView(options) {
      scrollLog.push({ element: this.id, ...options })
    }
  }
  class AnchorPort extends ElementPort {
    constructor(href, attributes = {}) {
      super('source-link', true)
      this.href = new URL(href, location.href).href
      Object.assign(this, attributes)
    }
    closest() {
      return this
    }
    hasAttribute(name) {
      return !!this[name]
    }
  }
  const element = (id, inside = false) => {
    if (!elements.has(id)) elements.set(id, new ElementPort(id, inside))
    return elements.get(id)
  }
  const style = () => {
    const values = new Map()
    return {
      getPropertyValue: (k) => values.get(k)?.value ?? '',
      getPropertyPriority: (k) => values.get(k)?.priority ?? '',
      setProperty(k, value, priority = '') {
        values.set(k, { value, priority })
      },
      removeProperty(k) {
        values.delete(k)
      },
    }
  }
  const documentPort = {
    activeElement: null,
    documentElement: { style: style() },
    // A body with no tabindex is the active-element fallback after blur, but
    // focusing it through dialog restoration does not focus a control.
    body: { id: 'body', style: style(), focus() {}, dispatch() {} },
    getElementById: (id) => elements.get(id) ?? null,
  }
  let url = new URL(options.url ?? 'https://portfolio.test/studio')
  const assigned = [],
    historyCalls = [],
    entries = [{ url: url.href, state: { next: 'preserved' } }]
  let entryIndex = 0
  const location = {
    get href() {
      return url.href
    },
    get origin() {
      return url.origin
    },
    get pathname() {
      return url.pathname
    },
    get search() {
      return url.search
    },
    get hash() {
      return url.hash
    },
    set hash(value) {
      url.hash = value
    },
    assign(value) {
      assigned.push(value)
    },
  }
  const history = {
    get state() {
      return entries[entryIndex].state
    },
    scrollRestoration: 'auto',
    pushState(state, _, value) {
      url = new URL(value, url)
      entries.splice(entryIndex + 1)
      entries.push({ url: url.href, state })
      entryIndex++
      historyCalls.push(['push', url.href])
    },
    replaceState(state, _, value) {
      url = new URL(value, url)
      entries[entryIndex] = { url: url.href, state }
      historyCalls.push(['replace', url.href])
    },
    back() {
      historyCalls.push(['back'])
      historyEvents.push(() => traverse(-1))
    },
  }
  function traverse(step) {
    const next = entryIndex + step
    if (next < 0 || next >= entries.length) return
    entryIndex = next
    url = new URL(entries[entryIndex].url)
    emit('popstate')
    emit('hashchange')
  }
  const windowPort = {
    location,
    history,
    scrollX: 4,
    scrollY: 280,
    scrollTo(position) {
      this.scrollX = position.left
      this.scrollY = position.top
      scrollLog.push({ ...position })
    },
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name).add(fn)
    },
    removeEventListener(name, fn) {
      listeners.get(name)?.delete(fn)
    },
    matchMedia() {
      return {
        matches: false,
        addEventListener: (_, fn) => mediaListeners.add(fn),
        removeEventListener: (_, fn) => mediaListeners.delete(fn),
      }
    },
  }
  const dialog = element('native-dialog', true)
  dialog.open = false
  let previousFocus = null
  dialog.showModal = options.noDialog
    ? undefined
    : () => {
        showCalls++
        if (options.failShow?.()) throw Error('showModal failed')
        previousFocus = documentPort.activeElement
        dialog.open = true
      }
  dialog.close = () => {
    if (!dialog.open) return
    closeCalls++
    dialog.open = false
    // Optional explicit standards model, not a browser observation:
    // https://html.spec.whatwg.org/multipage/interactive-elements.html#close-the-dialog
    // A previously modal dialog restores its stored previously focused element
    // before the queued close event. Root's own return-focus flag cannot stop it.
    if (options.nativeFocusRestore) previousFocus?.focus()
    previousFocus = null
    nativeEvents.push(() => props.onDialogClose({ currentTarget: dialog }))
  }
  for (const id of ['studio', 'studio-projects', 'studio-projects-toggle'])
    element(id)
  for (const id of ['dissertation', 'copilot', 'typeforge']) {
    element(`studio-shortcut-${id}`)
    element(`project-${id}-heading`)
  }
  const fetcher = async (endpoint, init) => {
    const request = { endpoint, ...init, cancelled: 0 }
    requests.push(request)
    const stream = new ReadableStream({
      start(c) {
        request.controller = c
      },
      cancel() {
        request.cancelled++
      },
    })
    return new Response(stream, {
      headers: { 'content-type': 'application/x-ndjson' },
    })
  }
  Object.assign(globalThis, {
    window: windowPort,
    document: documentPort,
    Element: ElementPort,
    HTMLElement: ElementPort,
    HTMLAnchorElement: AnchorPort,
    fetch: fetcher,
  })
  const Experience = read(
    path.join(root, 'components/studio/StudioExperience.tsx')
  ).default
  const Shell = read(path.join(root, 'app/studio/StudioShell.tsx')).default
  function effects(kind, force = false) {
    for (const slot of slots)
      if (slot?.kind === kind && (slot.pending || force)) {
        slot.cleanup?.()
        slot.cleanup = undefined
        slot.pending = false
        slot.cleanup = slot.create()
      }
  }
  const flatten = (node) =>
    !node || typeof node !== 'object'
      ? []
      : Array.isArray(node)
        ? node.flatMap(flatten)
        : [node, ...flatten(node.props?.children)]
  function bind() {
    props.dialogRef.current = dialog
    props.panelScrollRef.current = element('panel-scroll', true)
    props.projectsToggleRef.current = element('studio-projects-toggle')
    if (props.assistantEntry)
      props.assistantEntry.props.buttonRef.current = element('ask-entry')
    if (props.assistantContent)
      props.assistantContent.props.headingRef.current = element(
        props.assistantContent.props.headingId,
        true
      )
    if (props.projectContent)
      element(
        `panel-project-${props.projectContent.props.project.id}-heading`,
        true
      )
    const nodes = flatten(Shell(props))
    assert.equal(nodes.filter((n) => n.type === 'dialog').length, 1)
    commits.push({
      html: props.assistantContent?.props.snapshot,
      scene: props.scene.props.children.props.assistant?.snapshot,
      project: props.selectedProjectId,
      panelOpen: props.scene.props.children.props.assistant?.panelOpen,
      interactionEnabled: props.scene.props.children.props.interactionEnabled,
    })
  }
  function flush() {
    for (let n = 0; dirty || n === 0; n++) {
      assert.ok(n < 25, 'Host render did not settle')
      dirty = false
      updates.splice(0).forEach((fn) => fn())
      cursor = 0
      props = Experience({
        evidence: 'SSR EVIDENCE',
        children: 'SSR CHILDREN',
      }).props
      bind()
      effects('layout')
      effects('passive')
    }
  }
  function unmount() {
    if (!mounted) return
    mounted = false
    for (const kind of ['layout', 'passive'])
      for (const slot of slots)
        if (slot?.kind === kind) {
          slot.cleanup?.()
          slot.cleanup = undefined
        }
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
  t.after(unmount)
  flush()
  return {
    get props() {
      return props
    },
    get scene() {
      return props.scene.props.children.props
    },
    get panel() {
      return props.assistantContent?.props
    },
    get owner() {
      return owners.at(-1).actual
    },
    owners,
    requests,
    dialog,
    document: documentPort,
    window: windowPort,
    elements,
    assigned,
    focusLog,
    scrollLog,
    commits,
    historyCalls,
    get showCalls() {
      return showCalls
    },
    get closeCalls() {
      return closeCalls
    },
    flush,
    unmount,
    open() {
      props.assistantEntry.props.onOpen()
      flush()
    },
    flushNative() {
      nativeEvents.splice(0).forEach((fn) => fn())
      flush()
    },
    flushHistory() {
      historyEvents.splice(0).forEach((fn) => fn())
      flush()
    },
    forward() {
      traverse(1)
      flush()
    },
    externalHash(hash) {
      url.hash = hash
      emit('hashchange')
      flush()
    },
    click(href, attributes = {}, overrides = {}) {
      const anchor = new AnchorPort(href, attributes)
      const event = {
        target: anchor,
        currentTarget: { contains: () => true },
        button: 0,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true
        },
        ...overrides,
      }
      props.onNavigate(event)
      return event
    },
    replayEffects() {
      for (const kind of ['layout', 'passive'])
        for (const slot of slots)
          if (slot?.kind === kind) {
            slot.cleanup?.()
            slot.cleanup = undefined
          }
      effects('layout', true)
      effects('passive', true)
      flush()
    },
    listenerCounts() {
      return {
        popstate: listeners.get('popstate')?.size ?? 0,
        hashchange: listeners.get('hashchange')?.size ?? 0,
        media: mediaListeners.size,
      }
    },
  }
}

const tick = () => new Promise((resolve) => setImmediate(resolve))
async function receive(m, count = 4) {
  const question = 'Current question'
  m.panel.setDraft('Draft retained after leaving Ask')
  m.panel.actions.submit(question)
  m.flush()
  const request = m.requests.at(-1)
  const hits = Array.from({ length: count }, (_, i) => ({
    sourceId: `s${i}`,
    chunkId: `c${i}`,
    title: `Source ${i}`,
    heading: '',
    text: `Exact passage ${i}`,
    href: `/work/item-${i}`,
    score: 1,
  }))
  request.controller.enqueue(
    new TextEncoder().encode(
      JSON.stringify({ type: 'retrieval-start', question }) +
        '\n' +
        JSON.stringify({ type: 'retrieval', hits, durationMs: 7 }) +
        '\n'
    )
  )
  for (
    let i = 0;
    i < 30 && m.owner.getSnapshot().run.hits.length !== count;
    i++
  )
    await tick()
  m.flush()
  assert.equal(m.panel.snapshot.run.hits.length, count)
  return request
}

test('G4: one actual request owner supplies the identical current snapshot to HTML and scene', async (t) => {
  const m = mount(t)
  assert.equal(m.owners.length, 1)
  assert.equal(m.owners[0].generationEnabled, false)
  assert.equal(m.props.enhanced, true)
  m.open()
  assert.equal(m.document.activeElement.id, 'studio-ask-heading')
  const request = await receive(m)
  assert.equal(m.requests.length, 1)
  assert.equal(request.endpoint, '/api/assistant')
  assert.equal(m.panel.snapshot, m.scene.assistant.snapshot)
  assert.equal(m.panel.snapshot, m.owner.getSnapshot())
  assert.ok(m.commits.filter((c) => c.html).every((c) => c.html === c.scene))
  assert.equal(m.scene.interactionEnabled, false)
})

test('G4: ordinary close aborts and clears before commit, retains draft and rejects queued close after reopening', async (t) => {
  const m = mount(t)
  m.open()
  const request = await receive(m)
  m.panel.actions.select(
    m.panel.snapshot.run.runId,
    m.panel.snapshot.run.hits[0].key
  )
  m.flush()
  request.controller.enqueue(
    new TextEncoder().encode(
      JSON.stringify({
        type: 'answer',
        answer: {
          mode: 'sources',
          text: 'A source-only answer queued before close',
          citations: m.panel.snapshot.run.hits.map(({ hit }) => ({
            sourceId: hit.sourceId,
            chunkId: hit.chunkId,
            title: hit.title,
            href: hit.href,
            quote: hit.text,
          })),
        },
      }) + '\n'
    )
  )
  for (let i = 0; i < 30 && m.owner.getSnapshot().run.phase !== 'answered'; i++)
    await tick()
  assert.equal(m.owner.getSnapshot().run.phase, 'answered')
  // Leave that real transport snapshot update queued in React's simulated host.
  const staleClose = m.props.onDialogClose
  const epoch = m.scene.assistant.presentationEpoch
  const previousCommits = m.commits.length
  m.props.onRequestClose()
  assert.equal(request.signal.aborted, true)
  assert.equal(m.owner.getSnapshot().run.hits.length, 0)
  assert.equal(m.owner.getSnapshot().run.runId, null)
  assert.equal(m.owner.getSnapshot().run.answer, undefined)
  assert.equal(m.owner.getSnapshot().run.selectedKey, null)
  assert.equal(m.owner.getSnapshot().run.retrievalMs, undefined)
  m.flush()
  for (const commit of m.commits.slice(previousCommits)) {
    assert.equal(commit.scene.run.hits.length, 0)
    assert.equal(commit.scene.run.answer, undefined)
    if (commit.html) assert.equal(commit.html, commit.scene)
  }
  assert.equal(m.dialog.open, false)
  assert.equal(m.document.activeElement.id, 'ask-entry')
  assert.equal(m.document.body.style.getPropertyValue('position'), '')
  m.open()
  assert.equal(m.panel.draft, 'Draft retained after leaving Ask')
  assert.equal(m.panel.snapshot.run.hits.length, 0)
  assert.ok(m.scene.assistant.presentationEpoch > epoch)
  m.flushNative()
  staleClose({ currentTarget: m.dialog })
  m.flush()
  assert.equal(m.dialog.open, true)
  assert.equal(m.scene.assistant.panelOpen, true)
  assert.equal(m.requests.length, 1)
})

test('G4: assistant-to-project takeover clears once, retains the dialog and focuses only the destination', async (t) => {
  const m = mount(t)
  m.open()
  const request = await receive(m)
  m.focusLog.length = 0
  const scrollOperations = m.scrollLog.length
  const event = m.click('#project-typeforge')
  assert.equal(event.defaultPrevented, true)
  assert.equal(request.signal.aborted, true)
  assert.equal(m.owner.getSnapshot().run.hits.length, 0)
  m.flush()
  assert.equal(m.props.selectedProjectId, 'typeforge')
  assert.equal(m.scene.interactionEnabled, false)
  assert.equal(m.scene.assistant.panelOpen, false)
  assert.equal(m.showCalls, 1)
  assert.equal(m.closeCalls, 0)
  assert.equal(m.scrollLog.length, scrollOperations)
  assert.equal(m.document.body.style.getPropertyValue('position'), 'fixed')
  assert.deepEqual(
    m.focusLog.map((f) => f.id),
    ['panel-project-typeforge-heading']
  )
  assert.equal(m.window.location.hash, '#project-typeforge')
  assert.equal(m.window.history.state.next, 'preserved')
})

test('G4: project activation wins both orders in the same uncommitted batch', (t) => {
  for (const order of ['ask-first', 'project-first']) {
    const m = mount(t)
    const ask = m.props.assistantEntry.props.onOpen
    const project = m.scene.onSelectProject
    if (order === 'ask-first') {
      ask()
      project('copilot')
    } else {
      project('copilot')
      ask()
    }
    m.flush()
    assert.equal(m.props.selectedProjectId, 'copilot', order)
    assert.equal(m.scene.assistant.panelOpen, false)
    assert.equal(m.scene.interactionEnabled, false)
    assert.equal(m.owner.getSnapshot().run.hits.length, 0)
    assert.equal(m.window.location.hash, '#project-copilot')
    assert.equal(m.historyCalls.filter((c) => c[0] === 'push').length, 1)
    m.unmount()
  }
})

test('G4: project Back/reopen arbitration and Forward use the actual navigation helper', (t) => {
  const m = mount(t, { url: 'https://portfolio.test/studio#about' })
  m.scene.onSelectProject('dissertation')
  m.flush()
  m.props.onRequestClose()
  m.flush()
  m.props.assistantEntry.props.onOpen()
  m.flush() // Back has not yet changed the project URL.
  assert.equal(m.scene.assistant.panelOpen, false)
  m.flushHistory()
  assert.equal(m.window.location.hash, '#about')
  assert.equal(m.window.history.scrollRestoration, 'auto')
  m.open()
  m.forward()
  assert.equal(m.props.selectedProjectId, 'dissertation')
  assert.equal(m.window.history.scrollRestoration, 'manual')
  assert.equal(
    m.document.activeElement.id,
    'panel-project-dissertation-heading'
  )
})

test('G4: route links clear before native navigation while modifiers and new-tab links stay native', async (t) => {
  const m = mount(t)
  m.open()
  const request = await receive(m, 1)
  for (const input of [
    { attributes: { target: '_blank' } },
    { overrides: { ctrlKey: true } },
    { attributes: { download: true } },
  ]) {
    assert.equal(
      m.click('/work/typeforge', input.attributes, input.overrides)
        .defaultPrevented,
      false
    )
    assert.equal(request.signal.aborted, false)
    assert.equal(m.owner.getSnapshot().run.hits.length, 1)
  }
  m.focusLog.length = 0
  assert.equal(m.click('/work/typeforge').defaultPrevented, false)
  assert.equal(request.signal.aborted, true)
  assert.equal(m.owner.getSnapshot().run.hits.length, 0)
  assert.equal(m.document.body.style.getPropertyValue('position'), '')
  m.flush()
  assert.equal(m.dialog.open, false)
  assert.equal(
    m.focusLog.some((f) => f.id === 'ask-entry'),
    false
  )
  assert.equal(m.historyCalls.length, 0)
})

test('G4: history navigation clears Ask and unlocks before the commit without Ask return', async (t) => {
  const m = mount(t)
  m.open()
  const request = await receive(m, 1)
  m.focusLog.length = 0
  m.externalHash('#contact')
  assert.equal(request.signal.aborted, true)
  assert.equal(m.scene.assistant.panelOpen, false)
  assert.equal(m.dialog.open, false)
  assert.equal(
    m.focusLog.some((f) => f.id === 'ask-entry'),
    false
  )
  assert.equal(m.document.body.style.getPropertyValue('position'), '')
})

test('G4: failed scene leaves Ask and the single root owner available; successful scene stays mounted under modals', (t) => {
  const m = mount(t)
  const sceneType = m.props.scene.props.children.type
  m.scene.onStatusChange('unavailable')
  m.flush()
  assert.ok(m.props.assistantEntry)
  m.open()
  assert.equal(m.props.scene.props.children.type, sceneType)
  assert.equal(m.props.sceneStatus, 'unavailable')
  assert.equal(m.scene.interactionEnabled, false)
  const Boundary = m.props.scene.type
  const boundary = new Boundary(m.props.scene.props)
  boundary.state = Boundary.getDerivedStateFromError()
  boundary.componentDidCatch()
  m.flush()
  assert.equal(boundary.render(), null)
  assert.equal(m.owners.length, 1)
  assert.ok(m.props.assistantContent)
  assert.equal(m.dialog.open, true)
})

test('G4: missing native dialog enhancement keeps SSR and routes character fallback to ask', (t) => {
  const m = mount(t, { noDialog: true })
  assert.equal(m.props.enhanced, false)
  assert.equal(m.props.assistantEntry, undefined)
  assert.equal(m.scene.assistant, undefined)
  assert.equal(m.props.evidence, 'SSR EVIDENCE')
  m.scene.onActivateAssistant()
  assert.deepEqual(m.assigned, ['/ask'])
  assert.equal(m.requests.length, 0)
})

test('G4: showModal failure clears and falls back for Ask; projects retain the SSR article destination', (t) => {
  for (const kind of ['assistant', 'project']) {
    const m = mount(t, { failShow: () => true })
    if (kind === 'assistant') m.props.assistantEntry.props.onOpen()
    else m.scene.onSelectProject('typeforge')
    m.flush()
    assert.equal(m.props.enhanced, false)
    assert.equal(m.owner.getSnapshot().run.runId, null)
    assert.equal(m.document.body.style.getPropertyValue('position'), '')
    assert.equal(m.listenerCounts().hashchange, 0)
    if (kind === 'assistant') assert.deepEqual(m.assigned, ['/ask'])
    else {
      assert.deepEqual(m.assigned, [])
      assert.equal(m.window.location.hash, '#project-typeforge')
      assert.equal(m.document.activeElement.id, 'project-typeforge-heading')
      assert.equal(m.scrollLog.at(-1).element, 'project-typeforge-heading')
    }
    m.unmount()
  }
})

test('G4: setup-cleanup-setup creates one live owner and one listener set, then unmount aborts and unlocks', async (t) => {
  const m = mount(t)
  m.replayEffects()
  assert.equal(m.owners.length, 2)
  assert.equal(m.owners.filter((o) => !o.disposed).length, 1)
  assert.deepEqual(m.listenerCounts(), { popstate: 1, hashchange: 1, media: 1 })
  m.open()
  const request = await receive(m, 1)
  m.unmount()
  assert.equal(request.signal.aborted, true)
  assert.equal(m.owners.filter((o) => !o.disposed).length, 0)
  assert.equal(m.dialog.open, false)
  assert.equal(m.document.body.style.getPropertyValue('position'), '')
  assert.deepEqual(m.listenerCounts(), { popstate: 0, hashchange: 0, media: 0 })
})

test('G4: native cancel and unexpected current close clear Ask while old close notifications cannot close an open project', async (t) => {
  const m = mount(t)
  m.open()
  const request = await receive(m, 1)
  let prevented = false
  m.props.onDialogCancel({
    preventDefault() {
      prevented = true
    },
  })
  m.flush()
  assert.equal(prevented, true)
  assert.equal(request.signal.aborted, true)
  m.scene.onSelectProject('copilot')
  m.flush()
  m.flushNative()
  assert.equal(m.dialog.open, true)
  assert.equal(m.props.selectedProjectId, 'copilot')
  m.props.onDialogClose({ currentTarget: m.dialog })
  m.flush()
  assert.equal(m.props.selectedProjectId, 'copilot')
  m.props.onRequestClose()
  m.flush()
  m.flushHistory()
  m.flushNative()
  m.open()
  m.dialog.close()
  m.flushNative()
  assert.equal(m.scene.assistant.panelOpen, false)
})

test('G4: project modality suppresses a previously qualified robot attention hint', (t) => {
  const m = mount(t)
  m.scene.onAssistantHoverChange(true)
  m.flush()
  assert.equal(m.scene.assistant.attentionRequested, true)
  m.scene.onSelectProject('copilot')
  m.flush()
  assert.equal(m.scene.interactionEnabled, false)
  assert.equal(m.scene.assistant.attentionRequested, false)
})

test('G4: source navigation must not restore Ask through the native dialog close algorithm', async (t) => {
  const m = mount(t, { nativeFocusRestore: true })
  m.elements.get('ask-entry').focus()
  m.flush()
  m.open()
  const request = await receive(m, 1)
  m.focusLog.length = 0
  const event = m.click('/work/typeforge')
  assert.equal(event.defaultPrevented, false)
  assert.equal(request.signal.aborted, true)
  m.flush()
  assert.equal(m.dialog.open, false)
  // This port deliberately stops before native route navigation. The contract
  // forbids an intermediate Ask return as well as a later destination focus yank.
  assert.equal(
    m.focusLog.some((f) => f.id === 'ask-entry'),
    false
  )
})

test('G4: fresh project deep links close by replacement and project switches retain one owned history entry', (t) => {
  const direct = mount(t, {
    url: 'https://portfolio.test/studio#project-typeforge',
  })
  assert.equal(direct.props.selectedProjectId, 'typeforge')
  assert.equal(
    direct.document.activeElement.id,
    'panel-project-typeforge-heading'
  )
  direct.props.onRequestClose()
  direct.flush()
  assert.equal(direct.window.location.hash, '#studio')
  assert.equal(direct.historyCalls.filter((c) => c[0] === 'back').length, 0)
  direct.unmount()
  const m = mount(t)
  m.scene.onSelectProject('copilot')
  m.flush()
  m.scene.onSelectProject('typeforge')
  m.flush()
  assert.deepEqual(
    m.historyCalls.map((c) => c[0]),
    ['push', 'replace']
  )
  m.props.onRequestClose()
  m.flush()
  m.flushHistory()
  assert.equal(m.window.location.hash, '')
  assert.equal(m.window.history.state.next, 'preserved')
})

test('G4: native focus-restoration model permits ordinary Ask return and keeps project takeover open', (t) => {
  const m = mount(t, { nativeFocusRestore: true })
  m.elements.get('ask-entry').focus()
  m.flush()
  m.open()
  m.props.onRequestClose()
  m.flush()
  m.flushNative()
  assert.equal(m.document.activeElement.id, 'ask-entry')
  m.open()
  m.focusLog.length = 0
  const closes = m.closeCalls
  m.click('#project-copilot')
  m.flush()
  assert.equal(m.closeCalls, closes)
  assert.equal(m.document.activeElement.id, 'panel-project-copilot-heading')
  assert.equal(
    m.focusLog.some((f) => f.id === 'ask-entry'),
    false
  )
})

test('G4: native history close does not return Ask and leaves the entry reusable', (t) => {
  const m = mount(t, { nativeFocusRestore: true })
  const entry = m.elements.get('ask-entry')
  entry.focus()
  m.flush()
  m.open()
  m.focusLog.length = 0
  m.externalHash('#contact')
  assert.equal(m.dialog.open, false)
  assert.equal(
    m.focusLog.some((f) => f.id === 'ask-entry'),
    false
  )
  entry.focus()
  assert.equal(m.document.activeElement, entry)
  m.open()
  m.props.onRequestClose()
  m.flush()
  assert.equal(m.document.activeElement, entry)
})

test('G4: Ask owns its close focus even when opened with another room control focused', (t) => {
  const m = mount(t, { nativeFocusRestore: true })
  m.elements.get('studio-projects').focus()
  m.open()
  assert.equal(m.document.activeElement.id, 'studio-ask-heading')
  m.focusLog.length = 0
  m.props.onRequestClose()
  m.flush()
  assert.deepEqual(
    m.focusLog.map((f) => f.id),
    ['ask-entry']
  )
})
