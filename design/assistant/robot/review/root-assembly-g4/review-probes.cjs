'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const root = path.resolve(__dirname, '../../../../..')
const filename = path.join(root, 'tests/assistant/studio-experience.test.cjs')
const source = fs.readFileSync(filename, 'utf8')
const firstTest = source.indexOf('\ntest(')
if (firstTest < 0) throw Error('Host boundary not found')
const mod = { exports: {} }
new Function('require', 'module', '__dirname', source.slice(0, firstTest) + '\nmodule.exports = {mount,receive};')(createRequire(filename), mod, path.dirname(filename))
async function run() {
  const t = { after() {} }
  const m = mod.exports.mount(t)
  let attention
  try {
    m.scene.onAssistantHoverChange(true); m.flush()
    const qualified = { ...m.scene.assistant, snapshot: undefined }
    m.scene.onSelectProject('copilot'); m.flush()
    attention = { qualified, project: m.props.selectedProjectId, sceneInteractionEnabled: m.scene.interactionEnabled, attentionRequested: m.scene.assistant.attentionRequested, panelOpen: m.scene.assistant.panelOpen, presentationEpoch: m.scene.assistant.presentationEpoch }
    m.scene.onAssistantHoverChange(false); m.flush()
    attention.afterDownstreamHoverReset = m.scene.assistant.attentionRequested
  } finally { m.unmount() }
  const n = mod.exports.mount(t, { nativeFocusRestore: true })
  let focus
  try {
    n.elements.get('ask-entry').focus(); n.flush(); n.open()
    const request = await mod.exports.receive(n, 1)
    n.focusLog.length = 0
    const before = n.document.activeElement.id
    const event = n.click('/work/typeforge')
    const abortedBeforeCommit = request.signal.aborted
    n.flush()
    focus = { before, afterCloseCommit: n.document.activeElement.id, rootPreventedNavigation: event.defaultPrevented, abortedBeforeCommit, clearedHits: n.owner.getSnapshot().run.hits.length, dialogOpen: n.dialog.open, focusMoves: n.focusLog, model: 'WHATWG close-the-dialog step 12 restores the previously focused element for a modal before queuing close; this is an explicit native-behavior port, not a real browser or React scheduling observation', source: 'https://html.spec.whatwg.org/multipage/interactive-elements.html#close-the-dialog' }
  } finally { n.unmount() }
  const result = { attention, focus }
  fs.writeFileSync(path.join(__dirname, 'findings-evidence.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result, null, 2))
}
run().catch(error => { console.error(error); process.exitCode = 1 })
