'use strict'
// Recheck-only: hash-prove the delta, reuse the original simulated hook host,
// and execute current app modules. All written evidence stays beside this file.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const root = path.resolve(__dirname, '../../../../../..')
const previous = JSON.parse(fs.readFileSync(path.join(__dirname, '../source-before.json'), 'utf8').replace(/^\uFEFF/, ''))
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
const expectedHash = relative => previous.files.find(file => file.path === relative).sha256
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8')
const delta = []

const componentPath = 'components/assistant/AssistantWorkbench.tsx'
const currentComponent = read(componentPath)
const componentEol = currentComponent.includes('\r\n') ? '\r\n' : '\n'
const repairedRetry = 'onClick={() => void ask(question)}' + componentEol + '                  disabled={!question.trim()}'
assert.equal(currentComponent.split(repairedRetry).length, 2)
const originalComponent = currentComponent
  .replace("'0 passages; response pending'", "'0 passages ? response pending'")
  .replace(repairedRetry, 'onClick={() => void ask(run.question)}')
assert.equal(hash(originalComponent), expectedHash(componentPath))
delta.push({ path: componentPath, currentSha256: hash(currentComponent), reconstructedOriginalSha256: hash(originalComponent), originalHashMatched: true,
  exactChanges: [
    { currentLine: 189, before: "'0 passages ? response pending'", after: "'0 passages; response pending'" },
    { currentLine: 468, before: 'onClick={() => void ask(run.question)}', after: 'onClick={() => void ask(question)}' },
    { currentLine: 469, before: null, after: 'disabled={!question.trim()}' },
  ] })

const testPath = 'tests/assistant/run-transport.test.cjs'
const currentTests = read(testPath)
const testEol = currentTests.includes('\r\n') ? '\r\n' : '\n'
let originalTests = currentTests.replace(/\r\n/g, '\n')
const addedStart = originalTests.indexOf("for (const phase of ['error', 'cancelled']) {")
const addedEnd = originalTests.indexOf('const { createAssistantRunOwner, ASSISTANT_TIMEOUT_MS }')
assert.ok(addedStart > 0 && addedEnd > addedStart)
const addedRegressions = originalTests.slice(addedStart, addedEnd)
originalTests = originalTests.slice(0, addedStart) + originalTests.slice(addedEnd)
const helper = "  function edit(value) {\n    nodes()\n      .find((node) => node.type === 'textarea')\n      .props.onChange({ target: { value } })\n    render()\n  }\n"
assert.equal(originalTests.split(helper).length, 2)
originalTests = originalTests.replace(helper, '').replace('    edit,\n', '')
originalTests = originalTests.replace('      edit(value)\n',
  "      nodes()\n        .find((node) => node.type === 'textarea')\n        .props.onChange({ target: { value } })\n      render()\n")
if (testEol === '\r\n') originalTests = originalTests.replace(/\n/g, '\r\n')
assert.equal(hash(originalTests), expectedHash(testPath))
delta.push({ path: testPath, currentSha256: hash(currentTests), reconstructedOriginalSha256: hash(originalTests), originalHashMatched: true,
  exactChanges: ['Extract existing submit draft editing into edit(value), expose edit, call edit(value) from submit', 'Add five regressions at current lines 303-450'],
  addedRegressions })
fs.writeFileSync(path.join(__dirname, 'verified-delta.json'), JSON.stringify({ checkedAt: new Date().toISOString(), method: 'Reverse only the listed edits in memory and match the full original SHA-256; no Git or application writes', files: delta }, null, 2) + '\n')

// This is the original test harness, proven byte-identical above, with updated assertions below.
const filename = path.join(root, testPath)
const firstTest = originalTests.indexOf("test('Workbench preserves source content")
const fixtureModule = { exports: {} }
vm.runInThisContext('(function(require,module,__dirname){\n' + originalTests.slice(0, firstTest) +
  '\nmodule.exports={workbench,events,wire,question,tick};\n})', { filename })(
  createRequire(filename), fixtureModule, path.dirname(filename))
const { workbench, events, wire, question, tick } = fixtureModule.exports
async function until(check) {
  for (let n = 0; n < 80; n++) { if (check()) return; await tick() }
  throw new Error('Expected completion did not arrive')
}
const button = (ui, text) => ui.nodes().find(node => node.type === 'button' && ui.text(node) === text)
const edit = (ui, value) => {
  ui.nodes().find(node => node.type === 'textarea').props.onChange({ target: { value } })
  ui.render()
}
const output = { checkedAt: new Date().toISOString(), actualAppModules: true, host: 'Hash-verified original simulated React hook harness; not browser/StrictMode', results: [] }

async function retryCase(phase, draft) {
  const originalFetch = globalThis.fetch, originalWindow = globalThis.window
  let ui
  const requests = []
  try {
    globalThis.window = globalThis
    globalThis.fetch = async (_url, init) => {
      const submitted = JSON.parse(init.body).question
      requests.push(submitted)
      if (requests.length === 1) {
        if (phase === 'error') return Response.json({ error: 'Initial probe error' }, { status: 503 })
        return new Response(new ReadableStream({ start(controller) {
          controller.enqueue(new TextEncoder().encode(wire(events().slice(0, 2)) + '\n'))
        } }))
      }
      const responseEvents = events()
      responseEvents[0].question = submitted.trim()
      return new Response(wire(responseEvents))
    }
    ui = workbench()
    ui.submit(question)
    if (phase === 'cancelled') {
      await until(() => { ui.render(); return ui.state().phase === 'retrieved' })
      button(ui, 'Cancel').props.onClick()
    }
    await until(() => { ui.render(); return ui.state().phase === phase })
    const previousId = ui.state().runId
    const blankResults = []
    for (const blank of ['', ' \t\n ']) {
      edit(ui, blank)
      const retry = button(ui, 'Try again')
      assert.equal(retry.props.disabled, true)
      retry.props.onClick() // Exercise the transport guard despite disabled UI.
      ui.render()
      assert.equal(requests.length, 1)
      assert.equal(ui.state().runId, previousId)
      assert.equal(ui.state().phase, phase)
      blankResults.push({ draft: blank, disabled: true, noFetchOrNewRun: true })
    }
    edit(ui, draft)
    assert.equal(button(ui, 'Try again').props.disabled, false)
    button(ui, 'Try again').props.onClick()
    ui.render()
    const retryId = ui.state().runId
    assert.notEqual(retryId, previousId)
    await until(() => { ui.render(); return ui.state().cursor === 'sealed' })
    assert.deepEqual(requests, [question, draft.trim().slice(0, 600)])
    assert.equal(ui.state().completion, 'complete')
    assert.equal(ui.state().question, draft.trim().slice(0, 600).trim())
    assert.equal(ui.nodes().find(node => node.type === 'textarea').props.value, draft)
    output.results.push({ name: 'current-draft-retry', phase, draftLength: draft.length, wireQuestion: requests[1], wireLength: requests[1].length, blankResults,
      previousId, retryId, distinctRunId: true, completion: ui.state().completion, draftPreserved: true })
  } finally { ui?.dispose(); globalThis.fetch = originalFetch; globalThis.window = originalWindow }
}

async function captionCase() {
  const originalFetch = globalThis.fetch, originalWindow = globalThis.window
  let ui, controller
  try {
    globalThis.window = globalThis
    globalThis.fetch = async () => new Response(new ReadableStream({ start(value) { controller = value } }))
    ui = workbench()
    ui.submit(question)
    controller.enqueue(new TextEncoder().encode(wire(events([]).slice(0, 2)) + '\n'))
    await until(() => { ui.render(); return ui.state().phase === 'retrieved' })
    assert.equal(ui.state().answer, undefined)
    const graph = ui.nodes().find(node => node.type?.name === 'Constellation')
    const svg = graph.type(graph.props)
    assert.equal(svg.type, 'svg')
    const caption = ui.text(ui.nodes(svg).find(node => node.type === 'text' && node.props.y === 20))
    assert.equal(caption, '0 passages; response pending')
    assert.ok(!ui.text(svg).includes('no passages matched'))
    controller.enqueue(new TextEncoder().encode(wire(events([]).slice(2))))
    controller.close()
    await until(() => { ui.render(); return ui.state().cursor === 'sealed' })
    assert.equal(ui.state().answer.mode, 'abstained')
    assert.equal(ui.state().completion, 'complete')
    output.results.push({ name: 'actual-nested-svg-caption', caption, pendingBeforeAnswer: true, validAbstentionAfter: true })
  } finally { ui?.dispose(); globalThis.fetch = originalFetch; globalThis.window = originalWindow }
}

;(async () => {
  for (const phase of ['error', 'cancelled']) {
    await retryCase(phase, ' \tIndependent edited draft\n ')
    await retryCase(phase, '  ' + 'x '.repeat(400))
  }
  await captionCase()
  fs.writeFileSync(path.join(__dirname, 'probe-results.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(JSON.stringify(output, null, 2))
})().catch(error => { console.error(error); process.exitCode = 1 })
