/* eslint-disable @typescript-eslint/no-require-imports -- Existing Node/TypeScript test-loader convention. */
// Provenance: first 13 cases and fake-host foundation adapted from Claude's
// panel-check.cjs, preserved byte-for-byte under review/controlled-ui-g3.
// Independent cases below extend behavior, use the real transport where needed,
// and restore the DOM stub. No CSS layout, real React DOM, or StrictMode claims.
// Controlled-panel checks with a fake React host (same approach as
// tests/assistant/run-transport.test.cjs). Real panel, real reducer; no DOM.
// Usage: node --test tests/assistant/studio-panel.test.cjs
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../..')
const ts = require(path.join(root, 'node_modules/typescript'))

function host() {
  const slots = []
  const effects = []
  const updates = []
  const cache = new Map()
  let cursor = 0
  let dirty = false
  const same = (a, b) =>
    a && b && a.length === b.length && a.every((x, i) => Object.is(x, b[i]))
  const react = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = initial
      return [
        slots[i],
        (value) => {
          updates.push(() => {
            slots[i] = typeof value === 'function' ? value(slots[i]) : value
          })
          dirty = true
        },
      ]
    },
    useRef(initial) {
      const i = cursor++
      return (slots[i] ??= { current: initial })
    },
    useId() {
      const i = cursor++
      return (slots[i] ??= 'uid')
    },
    useLayoutEffect(fn, deps) {
      const i = cursor++
      if (!same(slots[i]?.deps, deps))
        effects.push(() => {
          slots[i] = { deps }
          fn()
        })
    },
  }
  const jsx = (type, props) => ({ type, props })
  function read(filename) {
    if (!path.extname(filename))
      filename += fs.existsSync(`${filename}.ts`) ? '.ts' : '.tsx'
    if (cache.has(filename)) return cache.get(filename).exports
    const mod = { exports: {} }
    cache.set(filename, mod)
    const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: filename,
    }).outputText
    const req = (id) => {
      if (id === 'react') return react
      if (id === 'react/jsx-runtime')
        return { jsx, jsxs: jsx, Fragment: 'frag' }
      if (id.endsWith('.css'))
        return { default: new Proxy({}, { get: (_, k) => String(k) }) }
      if (id.startsWith('@/')) return read(path.join(root, id.slice(2)))
      if (id.startsWith('.'))
        return read(path.resolve(path.dirname(filename), id))
      return require(id)
    }
    new Function('require', 'module', 'exports', out)(req, mod, mod.exports)
    return mod.exports
  }
  return {
    react,
    read,
    effects,
    updates,
    reset: () => (cursor = 0),
    isDirty: () => dirty,
    clean: () => (dirty = false),
  }
}

function mount(options = {}) {
  const h = host()
  const state = h.read(path.join(root, 'lib/assistant/run-state.ts'))
  const Panel = h.read(
    path.join(root, 'components/studio/assistant/StudioAssistantPanel.tsx')
  ).default
  const ui = {
    run: state.INITIAL_RUN,
    draft: '',
    focused: null,
    scrolled: 0,
    calls: [],
    nodes: [],
    byId: new Map(),
  }
  let runSeq = 0
  const dispatch = (action) => {
    ui.run = state.reduceAssistantRun(ui.run, action)
  }
  const owner = options.fetcher
    ? h
        .read(path.join(root, 'lib/assistant/run-transport.ts'))
        .createAssistantRunOwner({
          fetcher: options.fetcher,
          onChange(snapshot) {
            ui.run = snapshot.run
          },
        })
    : null
  const actions = {
    submit(question) {
      ui.calls.push(['submit', question])
      if (owner) owner.actions.submit(question)
      else
        dispatch({
          type: 'submit',
          runId: `run-${++runSeq}`,
          question: question.trim(),
        })
    },
    cancel() {
      ui.calls.push(['cancel'])
      if (owner) owner.actions.cancel()
      else if (ui.run.runId) dispatch({ type: 'cancel', runId: ui.run.runId })
    },
    close() {
      ui.calls.push(['close'])
      if (owner) owner.actions.close()
      else dispatch({ type: 'close' })
    },
    select(runId, key) {
      ui.calls.push(['select', runId, key])
      if (owner) owner.actions.select(runId, key)
      else dispatch({ type: 'select', runId, key })
    },
  }
  global.document = {
    getElementById: (id) => ui.byId.get(id) ?? null,
  }
  function flatten(node, out) {
    if (node === null || node === undefined || typeof node === 'boolean') return
    if (Array.isArray(node)) return node.forEach((n) => flatten(n, out))
    if (typeof node !== 'object') return out.push({ text: String(node) })
    out.push(node)
    flatten(node.props?.children, out)
  }
  function render() {
    do {
      h.clean()
      h.updates.splice(0).forEach((u) => u())
      h.reset()
      const tree = Panel({
        snapshot: state.presentAssistantRun(ui.run),
        actions,
        draft: ui.draft,
        setDraft: (v) => (ui.draft = v),
        headingId: 'ask-heading',
      })
      ui.nodes = []
      flatten(tree, ui.nodes)
      ui.byId = new Map()
      for (const n of ui.nodes) {
        if (!n.props) continue
        const el = {
          id: n.props.id,
          dataset: {
            runId: n.props['data-run-id'],
            hitKey: n.props['data-hit-key'],
          },
          focus: () => (ui.focused = n.props.id ?? n),
          scrollIntoView() {
            ui.scrolled++
          },
        }
        if (n.props.id) ui.byId.set(n.props.id, el)
        if (n.props.ref && typeof n.props.ref === 'object') {
          n.props.ref.current = {
            ...el,
            focus: () => (ui.focused = 'search-button'),
          }
        }
      }
      options.beforeEffects?.(ui)
      h.effects.splice(0).forEach((e) => e())
    } while (h.isDirty())
  }
  const text = (n) => {
    const out = []
    flatten(n.props?.children, out)
    return out
      .filter((x) => 'text' in x)
      .map((x) => x.text)
      .join('')
  }
  const find = (pred) => ui.nodes.filter((n) => n.props && pred(n))
  const button = (label) =>
    find((n) => n.type === 'button' && text(n).trim() === label)[0]
  const allText = () =>
    ui.nodes
      .filter((n) => 'text' in n)
      .map((n) => n.text)
      .join(' ')
  const hits = (n) =>
    Array.from({ length: n }, (_, i) => ({
      sourceId: `s${i}`,
      chunkId: `c${i}`,
      title: `Title ${i + 1}`,
      heading: `Heading ${i + 1}`,
      text: `Passage text ${i + 1}`,
      href: `/work#${i}`,
      score: 1 - i / 10,
    }))
  const ev = (event) => dispatch({ type: 'event', runId: ui.run.runId, event })
  function complete(n) {
    const h2 = hits(n)
    ev({ type: 'retrieval-start', question: ui.run.question })
    ev({ type: 'retrieval', hits: h2, durationMs: 3 })
    ev({
      type: 'answer',
      answer: n
        ? {
            mode: 'sources',
            text: '',
            citations: h2.map((x) => ({
              sourceId: x.sourceId,
              chunkId: x.chunkId,
              title: x.title,
              href: x.href,
              quote: x.text,
            })),
          }
        : { mode: 'abstained', text: '', citations: [] },
    })
    ev({ type: 'done', durationMs: 7 })
    dispatch({ type: 'eof', runId: ui.run.runId })
  }
  render()
  return {
    ui,
    render,
    find,
    button,
    text,
    allText,
    ev,
    hits,
    complete,
    dispatch,
    actions,
    state,
    owner,
    pendingWork: () => ({ updates: h.updates.length, effects: h.effects.length }),
  }
}

const previousDocument = globalThis.document
test.afterEach(() => {
  globalThis.document = previousDocument
})

const status = (m) => m.text(m.find((n) => n.props.role === 'status')[0])

test('idle: heading, examples, disabled-by-aria buttons that stay mounted', () => {
  const m = mount()
  const heading = m.find((n) => n.type === 'h2')[0]
  assert.equal(heading.props.id, 'ask-heading')
  assert.equal(heading.props.tabIndex, -1)
  assert.equal(m.button('Search sources').props['aria-disabled'], true)
  assert.equal(m.button('Search sources').props.disabled, undefined)
  assert.equal(m.button('Cancel').props['aria-disabled'], true)
  assert.equal(m.button('Cancel').props.disabled, undefined)
  assert.equal(m.find((n) => n.props.className === 'example').length, 3)
  assert.match(status(m), /^Ready\./)
  // aria-disabled is enforced: neither handler does anything.
  m.find((n) => n.type === 'form')[0].props.onSubmit({ preventDefault() {} })
  m.button('Cancel').props.onClick()
  assert.deepEqual(m.ui.calls, [])
  assert.equal(m.ui.focused, null)
})

test('enter is a newline; ctrl/cmd+enter submits the current draft', () => {
  const m = mount()
  m.ui.draft = '  How was TypeForge evaluated?  '
  m.render()
  const area = m.find((n) => n.type === 'textarea')[0]
  assert.equal(area.props.maxLength, 600)
  let prevented = 0
  area.props.onKeyDown({ key: 'Enter', preventDefault: () => prevented++ })
  assert.deepEqual(m.ui.calls, [])
  assert.equal(prevented, 0)
  area.props.onKeyDown({
    key: 'Enter',
    metaKey: true,
    preventDefault: () => prevented++,
  })
  assert.deepEqual(m.ui.calls, [['submit', '  How was TypeForge evaluated?  ']])
  assert.equal(prevented, 1)
  area.props.onChange({ target: { value: 'x'.repeat(700) } })
  assert.equal(m.ui.draft.length, 600)
})

test('zero retrieved stays pending, then valid abstention shows no-match', () => {
  const m = mount()
  m.ui.draft = 'q'
  m.actions.submit('q')
  m.ev({ type: 'retrieval-start', question: 'q' })
  m.ev({ type: 'retrieval', hits: [], durationMs: 2 })
  m.render()
  assert.equal(
    status(m),
    'Retrieved 0 passages in 2 ms. Waiting for the response to finish.'
  )
  assert.doesNotMatch(m.allText(), /don’t support/)
  assert.equal(m.button('Cancel').props['aria-disabled'], false)
  assert.equal(m.find((n) => n.props.className === 'chip').length, 0)
  m.ev({
    type: 'answer',
    answer: { mode: 'abstained', text: '', citations: [] },
  })
  m.ev({ type: 'done', durationMs: 5 })
  m.dispatch({ type: 'eof', runId: m.ui.run.runId })
  m.render()
  assert.equal(status(m), 'Finished in 5 ms · not supported.')
  assert.match(m.allText(), /don’t support an answer/)
  assert.match(m.allText(), /email Owen at/)
})

for (const n of [1, 2, 3, 4])
  test(`${n} hit(s): exact order, chips and rows, full passages`, () => {
    const m = mount()
    m.ui.draft = 'q'
    m.actions.submit('q')
    m.complete(n)
    m.render()
    const chips = m.find((x) => x.props.className === 'chip')
    const rows = m.find((x) => x.props.className === 'row')
    assert.equal(chips.length, n)
    assert.equal(rows.length, n)
    assert.deepEqual(
      rows.map((r) => r.props['data-hit-key']),
      m.ui.run.hits.map((v) => v.key)
    )
    const passages = m.find((x) => x.props.className === 'passage')
    assert.deepEqual(
      passages.map((p) => m.text(p)),
      m.hits(n).map((x) => x.text)
    )
    assert.equal(status(m), 'Finished in 7 ms · sources only.')
    assert.match(m.allText(), /They do not confirm a premise/)
    for (const [i, chip] of chips.entries()) {
      assert.equal(chip.props['aria-pressed'], false)
      assert.equal(chip.props['aria-controls'], rows[i].props.id)
    }
  })

test('chip selects by current runId/key and focuses that row; toggle hides', () => {
  const m = mount()
  m.ui.draft = 'q'
  m.actions.submit('q')
  m.complete(4)
  m.render()
  const key = m.ui.run.hits[1].key
  m.find((x) => x.props.className === 'chip')[1].props.onClick()
  m.render()
  assert.deepEqual(m.ui.calls.at(-1), ['select', m.ui.run.runId, key])
  assert.equal(m.ui.focused, 'uid-toggle-2')
  const toggle = m.button('Hide passage 2')
  assert.equal(toggle.props['aria-expanded'], true)
  assert.equal(toggle.props['aria-controls'], 'uid-passage-2')
  assert.equal(
    m.find((x) => x.props.className === 'chip')[1].props['aria-pressed'],
    true
  )
  assert.equal(
    m.find((x) => x.props.className === 'row')[1].props['data-selected'],
    true
  )
  m.ui.focused = null
  toggle.props.onClick()
  m.render()
  assert.deepEqual(m.ui.calls.at(-1), ['select', m.ui.run.runId, null])
  assert.equal(m.ui.focused, null)
})

test('a chip press superseded before commit never focuses a new run row', () => {
  const m = mount()
  m.ui.draft = 'q'
  m.actions.submit('q')
  m.complete(4)
  m.render()
  m.find((x) => x.props.className === 'chip')[2].props.onClick()
  m.actions.submit('q') // new run replaces the old one before the commit
  m.complete(4)
  m.render()
  assert.equal(m.ui.focused, null)
  assert.equal(m.ui.run.selectedKey, null)
})

test('user cancel clears results and focuses Search sources; completion does not', () => {
  const m = mount()
  m.ui.draft = 'q'
  m.actions.submit('q')
  m.ev({ type: 'retrieval-start', question: 'q' })
  m.ev({ type: 'retrieval', hits: m.hits(2), durationMs: 2 })
  m.render()
  assert.equal(m.find((x) => x.props.className === 'chip').length, 2)
  m.button('Cancel').props.onClick()
  m.render()
  assert.equal(m.ui.focused, 'search-button')
  assert.equal(m.find((x) => x.props.className === 'chip').length, 0)
  assert.equal(status(m), 'Cancelled. Your question is still in the box.')
  assert.equal(m.button('Cancel').props['aria-disabled'], true)
  m.ui.focused = null
  m.actions.submit('q')
  m.complete(1)
  m.render()
  assert.equal(m.ui.focused, null)
})

test('error: one alert, empty status, results cleared, Try again uses the draft', () => {
  const m = mount()
  m.ui.draft = 'first'
  m.actions.submit('first')
  m.ev({ type: 'retrieval-start', question: 'first' })
  m.ev({ type: 'retrieval', hits: m.hits(3), durationMs: 2 })
  m.dispatch({
    type: 'fail',
    runId: m.ui.run.runId,
    failure: 'http',
    notice: 'HTTP 500',
  })
  m.ui.draft = 'edited draft'
  m.render()
  assert.equal(status(m), '')
  const alerts = m.find((x) => x.props.role === 'alert')
  assert.equal(alerts.length, 1)
  assert.match(m.text(alerts[0]), /HTTP 500/)
  assert.equal(m.find((x) => x.props.className === 'chip').length, 0)
  assert.equal(m.button('Search sources'), undefined)
  m.find((n) => n.type === 'form')[0].props.onSubmit({ preventDefault() {} })
  assert.deepEqual(m.ui.calls.at(-1), ['submit', 'edited draft'])
})

test('example fills the draft, submits it and keeps focus on a persistent control', () => {
  const m = mount()
  m.find((n) => n.props.className === 'example')[1].props.onClick()
  m.render()
  assert.equal(m.ui.draft, 'How was TypeForge evaluated?')
  assert.deepEqual(m.ui.calls.at(-1), [
    'submit',
    'How was TypeForge evaluated?',
  ])
  assert.equal(m.ui.focused, 'search-button')
  assert.equal(m.find((n) => n.props.className === 'example').length, 0)
})

test('root close returns the sheet to idle without moving focus', () => {
  const m = mount()
  m.ui.draft = 'q'
  m.actions.submit('q')
  m.complete(2)
  m.render()
  m.find((x) => x.props.className === 'chip')[0].props.onClick()
  m.actions.close()
  m.render()
  assert.equal(m.ui.focused, null)
  assert.match(status(m), /^Ready\./)
  assert.equal(m.find((x) => x.props.className === 'chip').length, 0)
})

// Independent reviewer assertions: focused behavior beyond the inherited 13.
const chips = (m) =>
  m.find((n) => n.type === 'button' && 'aria-pressed' in n.props)
const rows = (m) => m.find((n) => n.type === 'li' && 'data-hit-key' in n.props)
const form = (m) => m.find((n) => n.type === 'form')[0]
const area = (m) => m.find((n) => n.type === 'textarea')[0]
const tick = () => new Promise((resolve) => setImmediate(resolve))
async function until(check) {
  for (let n = 0; n < 80; n++) {
    if (check()) return
    await tick()
  }
  assert.fail('Expected asynchronous completion did not arrive')
}
function retrieved(m, items = m.hits(4)) {
  m.actions.submit('q')
  m.ev({ type: 'retrieval-start', question: 'q' })
  m.ev({ type: 'retrieval', hits: items, durationMs: 731 })
  m.render()
}
function answer(m) {
  m.ev({
    type: 'answer',
    answer: {
      mode: 'sources',
      text: 'Source-only reply',
      citations: m.ui.run.hits.map(({ hit }) => ({
        sourceId: hit.sourceId,
        chunkId: hit.chunkId,
        title: hit.title,
        href: hit.href,
        quote: hit.text,
      })),
    },
  })
}

test('independent: same-source chunks retain exact order, full Unicode excerpts, links and controls', () => {
  const m = mount()
  const items = m
    .hits(4)
    .map((hit, i) => ({
      ...hit,
      sourceId: 'same-source',
      chunkId: `chunk-${[3, 1, 4, 2][i]}`,
      score: [1, 9, 2, 7][i],
      text: `${'A café passage — '.repeat(70)}END-${i}`,
      title: 'Shared title',
    }))
  retrieved(m, items)
  const before = m.ui.run
  assert.deepEqual(
    rows(m).map((row) => row.props['data-hit-key']),
    before.hits.map((view) => view.key)
  )
  assert.deepEqual(
    m.find((n) => n.type === 'p' && 'data-open' in n.props).map(m.text),
    items.map((hit) => hit.text)
  )
  assert.deepEqual(
    m.find((n) => n.type === 'a').map((n) => n.props.href),
    items.map((hit) => hit.href)
  )
  for (const [i, chip] of chips(m).entries()) {
    assert.equal(chip.props['aria-controls'], rows(m)[i].props.id)
    assert.equal(chip.props['aria-label'], `Source ${i + 1}: Shared title`)
    assert.equal(chip.props.tabIndex, undefined) // Ordinary native button Tab access is retained.
  }
  chips(m)[2].props.onClick()
  m.render()
  assert.equal(m.ui.run.selectedKey, before.hits[2].key)
  assert.equal(before.selectedKey, null)
  assert.equal(m.ui.focused, 'uid-toggle-3')
  assert.equal(m.ui.scrolled, 1)
  const toggle = m.button('Hide passage 3')
  assert.ok(m.ui.byId.has(toggle.props['aria-controls']))
  m.ui.focused = null
  chips(m)[2].props.onClick()
  m.render()
  assert.equal(m.ui.run.selectedKey, null)
  assert.equal(m.ui.focused, null)
})

test('independent: pending chip focus is rejected after cancel, close, failure, replacement or a new revision', () => {
  for (const transition of ['cancel', 'close', 'fail', 'replace', 'revision']) {
    const m = mount()
    retrieved(m)
    chips(m)[1].props.onClick()
    if (transition === 'fail')
      m.dispatch({
        type: 'fail',
        runId: m.ui.run.runId,
        failure: 'protocol',
        notice: 'Bad stream',
      })
    else if (transition === 'replace') {
      m.actions.submit('q')
      m.complete(4)
    } else if (transition === 'revision') answer(m)
    else m.actions[transition]()
    m.render()
    assert.equal(m.ui.focused, null, transition)
    assert.equal(m.ui.scrolled, 0, transition)
  }
})

test('independent: DOM identity mismatches suppress selected-row focus and scroll', () => {
  for (const mismatch of ['runId', 'hitKey', 'missing']) {
    const m = mount({
      beforeEffects(ui) {
        if (!ui.run.selectedKey) return
        const row = ui.byId.get('uid-row-2')
        if (mismatch === 'missing') ui.byId.delete('uid-row-2')
        else row.dataset[mismatch] = 'obsolete'
      },
    })
    retrieved(m)
    chips(m)[1].props.onClick()
    m.render()
    assert.equal(m.ui.focused, null, mismatch)
    assert.equal(m.ui.scrolled, 0, mismatch)
  }
})

test('independent: every clearing transition removes source content, selection and old timing together', () => {
  for (const transition of ['cancel', 'close', 'fail', 'submit']) {
    const m = mount()
    m.ui.draft = 'Retained edited draft'
    retrieved(m)
    answer(m)
    chips(m)[1].props.onClick()
    m.render()
    m.ui.focused = null
    if (transition === 'fail')
      m.dispatch({
        type: 'fail',
        runId: m.ui.run.runId,
        failure: 'network',
        notice: 'Network stopped',
      })
    else if (transition === 'submit') m.actions.submit('new question')
    else m.actions[transition]()
    m.render()
    assert.equal(chips(m).length, 0, transition)
    assert.equal(rows(m).length, 0, transition)
    assert.equal(m.ui.run.selectedKey, null, transition)
    assert.equal(m.ui.draft, 'Retained edited draft', transition)
    assert.doesNotMatch(m.allText(), /Passage text|731 ms|No matching sources/)
    assert.equal(m.ui.focused, null, transition)
    if (transition === 'fail') {
      assert.equal(status(m), '')
      const alerts = m.find((n) => n.props.role === 'alert')
      assert.equal(alerts.length, 1)
      assert.match(m.text(alerts[0]), /Network stopped/)
    }
  }
})

test('independent: real transport normalizes repeated keyboard submission and edited or blank Retry', async (t) => {
  const requests = []
  const m = mount({
    fetcher: async (_url, init) => {
      requests.push({ body: JSON.parse(init.body), signal: init.signal })
      return Response.json({ error: 'Try later (HTTP 503)' }, { status: 503 })
    },
  })
  t.after(() => m.owner.dispose())
  m.ui.draft = ' \t\n '
  m.render()
  form(m).props.onSubmit({ preventDefault() {} })
  area(m).props.onKeyDown({ key: 'Enter', ctrlKey: true, preventDefault() {} })
  assert.equal(requests.length, 0)
  const raw = '  ' + 'x '.repeat(400)
  m.ui.draft = raw // Root-provided programmatic draft, beyond textarea's normal cap.
  m.render()
  let prevented = 0
  area(m).props.onKeyDown({
    key: 'Enter',
    preventDefault() {
      prevented++
    },
  })
  assert.equal(prevented, 0)
  const ids = []
  for (const modifier of ['ctrlKey', 'metaKey']) {
    area(m).props.onKeyDown({
      key: 'Enter',
      [modifier]: true,
      preventDefault() {
        prevented++
      },
    })
    ids.push(m.ui.run.runId)
    m.render()
  }
  assert.equal(requests.length, 2)
  assert.equal(prevented, 2)
  assert.notEqual(ids[0], ids[1])
  assert.equal(requests[0].signal.aborted, true)
  assert.deepEqual(
    requests.map((r) => r.body.question),
    [raw.trim().slice(0, 600), raw.trim().slice(0, 600)]
  )
  await until(() => {
    m.render()
    return m.ui.run.phase === 'error'
  })
  const errorId = m.ui.run.runId
  for (const blank of ['', ' \t\n ']) {
    m.ui.draft = blank
    m.render()
    assert.equal(m.button('Try again').props['aria-disabled'], true)
    assert.equal(m.button('Try again').props.disabled, undefined)
    form(m).props.onSubmit({ preventDefault() {} })
    assert.equal(requests.length, 2)
    assert.equal(m.ui.run.runId, errorId)
  }
  m.ui.draft = '  Edited retry  '
  m.render()
  form(m).props.onSubmit({ preventDefault() {} })
  assert.equal(requests[2].body.question, 'Edited retry')
  assert.notEqual(m.ui.run.runId, errorId)
  m.render()
  m.button('Cancel').props.onClick()
  m.render()
  const cancelledId = m.ui.run.runId
  assert.equal(m.ui.run.phase, 'cancelled')
  assert.equal(m.ui.focused, 'search-button')
  m.ui.draft = ' '
  m.render()
  form(m).props.onSubmit({ preventDefault() {} })
  assert.equal(requests.length, 3)
  assert.equal(m.ui.run.runId, cancelledId)
  m.ui.draft = 'After cancellation'
  m.render()
  form(m).props.onSubmit({ preventDefault() {} })
  assert.equal(requests[3].body.question, 'After cancellation')
  assert.notEqual(m.ui.run.runId, cancelledId)
  await tick()
})

test('independent: measured zero timing and clean missing-done warning are retained without invented totals', () => {
  const m = mount()
  m.actions.submit('q')
  m.ev({ type: 'retrieval-start', question: 'q' })
  m.ev({ type: 'retrieval', hits: m.hits(1), durationMs: 0 })
  m.render()
  assert.equal(
    status(m),
    'Retrieved 1 passage in 0 ms. Waiting for the response to finish.'
  )
  answer(m)
  m.dispatch({ type: 'eof', runId: m.ui.run.runId })
  m.render()
  assert.match(status(m), /Response received.*closed before the final event/)
  assert.doesNotMatch(status(m), /Finished in/)
  assert.equal(rows(m).length, 1)
  assert.equal(m.ui.focused, null)
})

test('independent: Shell defaults and assistant variant retain one controlled native dialog and existing project actions', () => {
  const h = host()
  const Shell = h.read(path.join(root, 'app/studio/StudioShell.tsx')).default
  const Entry = h.read(
    path.join(root, 'components/studio/assistant/AssistantEntry.tsx')
  ).default
  const { studioProjects } = h.read(path.join(root, 'lib/studio-content.ts'))
  const { projectAnchor } = h.read(path.join(root, 'lib/studio-contract.ts'))
  const flatten = (node) =>
    !node || typeof node !== 'object'
      ? []
      : Array.isArray(node)
        ? node.flatMap(flatten)
        : [node, ...flatten(node.props?.children)]
  let closeCalls = 0,
    openCalls = 0
  const props = {
    enhanced: true,
    selectedProjectId: null,
    sceneStatus: 'ready',
    scene: null,
    evidence: 'EVIDENCE',
    children: 'CHILDREN',
    projectContent: 'PROJECT',
    dialogRef: { current: null },
    panelScrollRef: { current: null },
    projectsToggleRef: { current: null },
    dialogTitleId: 'project-title',
    projectsOpen: false,
    onNavigate() {},
    onViewCommand() {},
    onRequestClose() {
      closeCalls++
    },
    onDialogCancel() {},
    onDialogClose() {},
    onToggleProjects() {},
    onFocusProjects() {},
    onProjectsKeyDown() {},
    onScenePointerDown() {},
    onLookKeyDown() {},
  }
  for (const enhanced of [false, true]) {
    for (const selectedProjectId of [null, studioProjects[0].id]) {
      const nodes = flatten(Shell({ ...props, enhanced, selectedProjectId }))
      const dialogs = nodes.filter((n) => n.type === 'dialog')
      assert.equal(dialogs.length, 1)
      assert.equal(dialogs[0].props['data-panel-variant'], 'project')
      assert.equal(dialogs[0].props.onCancel, props.onDialogCancel)
      assert.equal(dialogs[0].props.onClose, props.onDialogClose)
      assert.equal(dialogs[0].props['aria-labelledby'], 'project-title')
      assert.equal(dialogs[0].props.open, undefined)
      assert.equal(
        nodes.find((n) => n.props.ref === props.panelScrollRef).props.children,
        'PROJECT'
      )
      assert.equal(nodes.filter((n) => n.props.className === 'ask').length, 0)
      assert.deepEqual(
        nodes
          .filter((n) => n.props.className === 'projectLink')
          .map((n) => n.props.href),
        studioProjects.map((p) => projectAnchor(p.id))
      )
      assert.ok(
        nodes
          .filter((n) => n.props.className?.includes('lookButton'))
          .every(
            (n) =>
              n.props.disabled === (!enhanced || selectedProjectId !== null)
          )
      )
    }
  }
  const entry = Entry({
    onOpen() {
      openCalls++
    },
    buttonRef: { current: null },
  })
  assert.equal(entry.type, 'button')
  assert.equal(entry.props.type, 'button')
  assert.equal(entry.props['aria-haspopup'], 'dialog')
  entry.props.onClick()
  assert.equal(openCalls, 1)
  const nodes = flatten(
    Shell({
      ...props,
      sceneStatus: 'unavailable',
      dialogVariant: 'assistant',
      dialogTitleId: 'ask-title',
      assistantEntry: entry,
      assistantContent: 'ASSISTANT',
    })
  )
  assert.equal(nodes.filter((n) => n.type === 'dialog').length, 1)
  assert.equal(
    nodes.find((n) => n.type === 'dialog').props['aria-labelledby'],
    'ask-title'
  )
  assert.equal(
    nodes.find((n) => n.props.ref === props.panelScrollRef).props.children,
    'ASSISTANT'
  )
  assert.equal(nodes.filter((n) => n.props.className === 'ask').length, 1)
  nodes.find((n) => n.props.className === 'panelClose').props.onClick()
  assert.equal(closeCalls, 1)
})

// G3 repair regressions: invoke actual rendered chip handlers. This host records
// synchronous decisions and simulated commit work; it does not dispatch native
// keyboard defaults, mount React DOM, or prove browser focus/Tab behavior.
function chipKey(chip, key, modifiers = {}) {
  let prevented = 0
  assert.equal(typeof chip.props.onKeyDown, 'function', 'Chip key handler exists')
  chip.props.onKeyDown({
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    currentTarget: document.getElementById(chip.props.id),
    ...modifiers,
    preventDefault() {
      prevented++
    },
  })
  return prevented
}

test('G3 arrows: four current ordered chips wrap both ways synchronously without actions or queued focus', () => {
  const m = mount()
  retrieved(m, m.hits(4).reverse())
  const run = m.ui.run
  const calls = [...m.ui.calls]
  const current = chips(m)
  assert.deepEqual(
    current.map((chip) => chip.props['data-hit-key']),
    run.hits.map((view) => view.key)
  )
  for (const [from, key, to] of [
    [0, 'ArrowRight', 1],
    [1, 'ArrowRight', 2],
    [2, 'ArrowRight', 3],
    [3, 'ArrowRight', 0],
    [0, 'ArrowLeft', 3],
    [3, 'ArrowLeft', 2],
    [2, 'ArrowLeft', 1],
    [1, 'ArrowLeft', 0],
  ]) {
    m.ui.focused = current[from].props.id
    assert.equal(chipKey(current[from], key), 1)
    assert.equal(m.ui.focused, current[to].props.id, `${from} ${key}`)
    assert.equal(m.ui.run, run)
    assert.deepEqual(m.ui.calls, calls)
    assert.equal(m.ui.scrolled, 0)
    assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
  }
  m.ui.focused = 'another-control'
  m.render()
  assert.equal(m.ui.focused, 'another-control')
  assert.equal(m.ui.run, run)
  assert.ok(rows(m).every((row) => row.props['data-selected'] === false))
})

test('G3 arrows: one hit consumes either arrow without moving focus, selecting or submitting', () => {
  const m = mount()
  retrieved(m, m.hits(1))
  const chip = chips(m)[0]
  const run = m.ui.run
  const calls = [...m.ui.calls]
  let focusCalls = 0
  m.ui.byId.get(chip.props.id).focus = () => focusCalls++
  m.ui.focused = chip.props.id
  for (const key of ['ArrowLeft', 'ArrowRight']) {
    assert.equal(chipKey(chip, key), 1)
    assert.equal(m.ui.focused, chip.props.id)
    assert.equal(focusCalls, 0)
    assert.equal(m.ui.run, run)
    assert.deepEqual(m.ui.calls, calls)
    assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
  }
})

test('G3 arrows: focus navigation preserves existing selection and passage disclosure', () => {
  const m = mount()
  retrieved(m)
  chips(m)[2].props.onClick()
  m.render()
  const run = m.ui.run
  const calls = [...m.ui.calls]
  const scrolled = m.ui.scrolled
  const selected = rows(m).map((row) => row.props['data-selected'])
  assert.deepEqual(selected, [false, false, true, false])
  for (const key of ['ArrowLeft', 'ArrowRight']) {
    assert.equal(chipKey(chips(m)[2], key), 1)
    assert.equal(m.ui.run, run)
    assert.deepEqual(m.ui.calls, calls)
    assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
    m.render()
    assert.deepEqual(rows(m).map((row) => row.props['data-selected']), selected)
    assert.equal(m.button('Hide passage 3').props['aria-expanded'], true)
    assert.equal(m.ui.scrolled, scrolled)
  }
})

test('G3 arrows: modified arrows and other keys leave focus, defaults, state and actions untouched', () => {
  const m = mount()
  retrieved(m)
  const chip = chips(m)[1]
  const run = m.ui.run
  const calls = [...m.ui.calls]
  const inputs = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].flatMap((modifier) =>
    ['ArrowLeft', 'ArrowRight'].map((key) => [key, { [modifier]: true }])
  )
  inputs.push(
    ...['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'].map(
      (key) => [key, {}]
    ),
    ['Enter', { ctrlKey: true }],
    ['Enter', { metaKey: true }],
    ['Tab', { shiftKey: true }]
  )
  m.ui.focused = chip.props.id
  for (const [key, modifiers] of inputs) {
    assert.equal(chipKey(chip, key, modifiers), 0, `${key} ${JSON.stringify(modifiers)}`)
    assert.equal(m.ui.focused, chip.props.id)
    assert.equal(m.ui.run, run)
    assert.deepEqual(m.ui.calls, calls)
    assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
  }
  assert.equal(m.ui.scrolled, 0)
})

test('G3 arrows: missing target and target DOM run/key mismatches cannot receive focus', () => {
  for (const mismatch of ['missing', 'runId', 'hitKey', 'noIdentity']) {
    const m = mount()
    retrieved(m)
    const current = chips(m)
    const target = m.ui.byId.get(current[1].props.id)
    if (mismatch === 'missing') m.ui.byId.delete(current[1].props.id)
    else if (mismatch === 'noIdentity') target.dataset = {}
    else if (mismatch === 'runId') target.dataset.runId = 'other-run'
    else target.dataset.hitKey = m.ui.run.hits[2].key // Another current hit is not this target.
    const run = m.ui.run
    const calls = [...m.ui.calls]
    m.ui.focused = current[0].props.id
    assert.equal(chipKey(current[0], 'ArrowRight'), 1)
    assert.equal(m.ui.focused, current[0].props.id, mismatch)
    assert.equal(m.ui.run, run)
    assert.deepEqual(m.ui.calls, calls)
    assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
    m.ui.focused = 'another-control'
    m.render() // Restoring matching DOM must not complete rejected arrow work.
    assert.equal(m.ui.focused, 'another-control', mismatch)
    assert.equal(m.ui.scrolled, 0)
  }
})

test('G3 arrows: old handlers cannot focus cleared or replacement chips after supersession, cancel, close or failure', () => {
  for (const transition of ['supersession', 'cancel', 'close', 'failure']) {
    const m = mount()
    retrieved(m)
    const stale = chips(m)
    const oldId = m.ui.run.runId
    if (transition === 'supersession') m.actions.submit('replacement')
    else if (transition === 'failure')
      m.dispatch({ type: 'fail', runId: oldId, failure: 'protocol', notice: 'Bad stream' })
    else m.actions[transition]()
    m.render()
    assert.equal(chips(m).length, 0)
    const invokeOld = () => {
      const run = m.ui.run
      const calls = [...m.ui.calls]
      m.ui.focused = 'persistent-control'
      chipKey(stale[0], 'ArrowRight')
      chipKey(stale[3], 'ArrowLeft')
      assert.equal(m.ui.focused, 'persistent-control', transition)
      assert.equal(m.ui.run, run)
      assert.deepEqual(m.ui.calls, calls)
      assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
      assert.equal(m.ui.scrolled, 0)
    }
    invokeOld()
    if (transition !== 'supersession') m.actions.submit('replacement')
    m.complete(4) // Reuse the exact old ranks and hit keys under a new run ID.
    m.render()
    assert.notEqual(m.ui.run.runId, oldId)
    assert.equal(chips(m)[1].props.id, stale[1].props.id)
    assert.equal(chips(m)[1].props['data-hit-key'], stale[1].props['data-hit-key'])
    invokeOld()
    assert.equal(chipKey(chips(m)[0], 'ArrowRight'), 1) // Positive current-handler control.
    assert.equal(m.ui.focused, chips(m)[1].props.id)
  }
})

test('G3 arrows: synchronous focus remains valid across a same-run selection revision', () => {
  const m = mount()
  retrieved(m)
  const oldChip = chips(m)[0]
  const revision = m.ui.run.revision
  chips(m)[3].props.onClick()
  m.render()
  assert.ok(m.ui.run.revision > revision)
  const run = m.ui.run
  const calls = [...m.ui.calls]
  const scrolled = m.ui.scrolled
  assert.equal(chipKey(oldChip, 'ArrowRight'), 1)
  assert.equal(m.ui.focused, chips(m)[1].props.id)
  assert.equal(m.ui.run, run)
  assert.deepEqual(m.ui.calls, calls)
  assert.equal(m.ui.scrolled, scrolled)
  assert.deepEqual(m.pendingWork(), { updates: 0, effects: 0 })
})

test('G3 arrows: ordinary Tab and native button activation remain available with guarded select-and-reveal', () => {
  for (const key of ['Enter', ' ']) {
    const m = mount()
    retrieved(m)
    for (const chip of chips(m)) {
      assert.equal(chip.type, 'button')
      assert.equal(chip.props.type, 'button')
      assert.equal(chip.props.tabIndex, undefined)
      assert.equal(chip.props.disabled, undefined)
      assert.equal(chip.props.role, undefined)
      assert.equal(chipKey(chip, 'Tab'), 0)
      assert.equal(chipKey(chip, 'Tab', { shiftKey: true }), 0)
    }
    const chip = chips(m)[3]
    const calls = [...m.ui.calls]
    assert.equal(chipKey(chip, key), 0)
    assert.deepEqual(m.ui.calls, calls)
    // Explicitly simulate the native button's subsequent click, not the browser
    // default-action machinery. Real Enter/Space/Tab behavior is a browser gate.
    chip.props.onClick()
    assert.deepEqual(m.ui.calls.slice(calls.length), [
      ['select', m.ui.run.runId, m.ui.run.hits[3].key],
    ])
    assert.equal(m.ui.focused, null)
    m.render()
    assert.equal(m.ui.focused, 'uid-toggle-4')
    assert.equal(m.ui.scrolled, 1)
    assert.equal(m.button('Hide passage 4').props['aria-expanded'], true)
    assert.equal(chips(m)[3].props['aria-pressed'], true)
  }
})
