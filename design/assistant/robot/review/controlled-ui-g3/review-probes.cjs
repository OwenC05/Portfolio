'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '../../../../..')
const filename = path.join(root, 'tests/assistant/studio-panel.test.cjs')
const text = fs.readFileSync(filename, 'utf8')
const firstTest = text.indexOf("test('idle:")
const mod = { exports: {} }
// Load the host without registering tests; suppress its cleanup registration here.
const fixture = text.slice(0, firstTest).replace(/test\.afterEach\([^\n]+\)\r?\n/, '')
vm.runInThisContext('(function(require,module,__dirname){\n' + fixture +
  '\nmodule.exports={mount};\n})', {filename})(createRequire(filename), mod, path.dirname(filename))
const oldDocument = globalThis.document
let arrowEvidence
try {
  const m = mod.exports.mount()
  m.actions.submit('q')
  m.complete(4)
  m.render()
  const chip = m.find(node => node.type === 'button' && node.props['aria-label'] === 'Source 1: Title 1')[0]
  function findPath(node, target, ancestors = []) {
    if (!node || typeof node !== 'object') return null
    if (Array.isArray(node)) {
      for (const child of node) { const found = findPath(child, target, ancestors); if(found) return found }
      return null
    }
    const next = [...ancestors, node]
    return node === target ? next : findPath(node.props?.children, target, next)
  }
  const ancestors = findPath(m.ui.nodes[0], chip)
  assert.ok(ancestors)
  const results = []
  for (const key of ['ArrowRight', 'ArrowLeft']) {
    const beforeCalls = m.ui.calls.length
    m.ui.focused = 'source-chip-1'
    let prevented = false, stopped = false, handlers = 0
    const event = { key, target: chip, currentTarget: null,
      preventDefault() { prevented = true }, stopPropagation() { stopped = true },
    }
    for (const node of [...ancestors].reverse()) {
      if (typeof node.props?.onKeyDown === 'function') {
        handlers++; event.currentTarget = node; node.props.onKeyDown(event)
      }
      if (stopped) break
    }
    m.render()
    results.push({key, keydownHandlersOnChipOrAncestors: handlers, prevented,
      newActionCalls: m.ui.calls.slice(beforeCalls), focused: m.ui.focused,
      selectedKey: m.ui.run.selectedKey})
  }
  arrowEvidence = { requirement: 'state-contract.md:145 requires chip arrow navigation while preserving Tab access',
    observations: results, interpretation: 'No application arrow navigation is attached to chips or their panel ancestors; this is a missing contract feature, not a browser or WCAG verdict.' }
} finally { globalThis.document = oldDocument }
fs.writeFileSync(path.join(__dirname, 'chip-keyboard-probe.json'), JSON.stringify(arrowEvidence, null, 2) + '\n')

const hash = data => crypto.createHash('sha256').update(data).digest('hex')
function lineDelta(before, after) {
  const a=before.split(/\r?\n/), b=after.split(/\r?\n/)
  const lengths=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1))
  for(let i=a.length-1;i>=0;i--) for(let j=b.length-1;j>=0;j--)
    lengths[i][j]=a[i]===b[j]?1+lengths[i+1][j+1]:Math.max(lengths[i+1][j],lengths[i][j+1])
  const changes=[]
  let i=0,j=0
  while(i<a.length || j<b.length) {
    if(i<a.length && j<b.length && a[i]===b[j]) {i++;j++;continue}
    const change={oldLine:i+1,newLine:j+1,removed:[],added:[]}
    while((i<a.length||j<b.length) && !(i<a.length&&j<b.length&&a[i]===b[j])) {
      if(j<b.length && (i===a.length || lengths[i][j+1]>=lengths[i+1][j])) change.added.push(b[j++])
      else change.removed.push(a[i++])
    }
    changes.push(change)
  }
  return changes
}
const baselineRoot='C:/Users/Owenc/orca/Portfolio'
const cssRelative='app/studio/studio.module.css'
const originalCss=fs.readFileSync(path.join(baselineRoot,cssRelative),'utf8')
assert.equal(hash(originalCss),'ce72d40af43223b33bc77dbdfd810ac38caaadb50af30916b25f1e3907bf1432')
const currentCss=fs.readFileSync(path.join(root,cssRelative),'utf8')
// The main Shell differs only in three nullable ref types from this branch's
// known pre-G3 Shell; verify the reconstructed bytes before relying on them.
const shellRelative='app/studio/StudioShell.tsx'
const mainShell=fs.readFileSync(path.join(baselineRoot,shellRelative),'utf8')
const baselineShell=mainShell.replaceAll('RefObject<HTMLDialogElement>','RefObject<HTMLDialogElement | null>')
  .replaceAll('RefObject<HTMLButtonElement>','RefObject<HTMLButtonElement | null>')
  .replaceAll('RefObject<HTMLDivElement>','RefObject<HTMLDivElement | null>')
const baselineShellHash=hash(baselineShell)
const knownShellHash='03b735a31b74ace0ee22d41acbc7b82ab0d70ba1cb1dbed9f11a65df23d82306'
assert.equal(baselineShellHash,knownShellHash)
const currentShell=fs.readFileSync(path.join(root,shellRelative),'utf8')
const delta={checkedAt:new Date().toISOString(), baselineMethod:'Read-only main CSS byte-identical to pre-G3 pin; three nullable ref annotations reconstruct pre-G3 Shell and match its exact pin; no copies into application paths',
  files:[{path:cssRelative,beforeSha256:hash(originalCss),afterSha256:hash(currentCss),changes:lineDelta(originalCss,currentCss)},
    {path:shellRelative,beforeSha256:baselineShellHash,afterSha256:hash(currentShell),changes:lineDelta(baselineShell,currentShell)}]}
fs.writeFileSync(path.join(__dirname,'shell-delta.json'),JSON.stringify(delta,null,2)+'\n')
console.log(JSON.stringify({arrowEvidence,cssChanges:delta.files[0].changes,shellChanges:delta.files[1].changes},null,2))
