'use strict'
// Private source copies only: never swap or write the actual application file.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '../../../../../..')
const panelPath = path.join(root, 'components/studio/assistant/StudioAssistantPanel.tsx')
const testPath = path.join(root, 'tests/assistant/studio-panel.test.cjs')
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
const current = fs.readFileSync(panelPath, 'utf8')
const tests = fs.readFileSync(testPath, 'utf8')
assert.equal(hash(current), '103327ed46ee44cb7364873cd72daa7d271c086bcee75d6a5bef4446dabd5511')
const eol = current.includes('\r\n') ? '\r\n' : '\n'
let original = current.replace(`  const chipId = (rank: number) => \`${'${uid}'}-chip-${'${rank}'}\`${eol}`, '')
const start = original.indexOf('  // Left and right arrows move focus')
const end = original.indexOf('  const showExamples', start)
assert.ok(start > 0 && end > start)
original = original.slice(0, start) + eol + original.slice(end)
for (const line of [
  '                    id={chipId(view.rank)}',
  '                    data-run-id={run.runId ?? undefined}',
  '                    data-hit-key={view.key}',
  '                    onKeyDown={(event) => onChipKeyDown(event, view.key)}',
]) {
  assert.ok(original.includes(line + eol))
  original = original.replace(line + eol, '')
}
assert.equal(hash(original), '9af87603bfe18017e86a254457e33a3dba8064069ed94c2d90436b3162290bfa', 'Reconstruction must be exact frozen pre-repair bytes')
const beforeTests = fs.readFileSync(path.join(__dirname, 'tests-before.cjs'), 'utf8')
assert.equal(hash(beforeTests), 'd69a3613c4679d427a650089fab8e05122d34ed82da688792e024a82d6c33a7c')
const oldPart = tests.slice(0, tests.indexOf('// G3 repair regressions:'))
  .replace('    pendingWork: () => ({ updates: h.updates.length, effects: h.effects.length }),\n', '')
// apply_patch may normalize newlines; compare original test content independent of EOL.
assert.equal(oldPart.trimEnd().replace(/\r\n/g, '\n'), beforeTests.trimEnd().replace(/\r\n/g, '\n'), 'All twenty original tests and original host logic preserved')
const privateTests = tests.replace("const root = path.resolve(__dirname, '../..')", "const root = path.resolve(__dirname, '../../../../../..')")
  .replace("path.join(root, 'components/studio/assistant/StudioAssistantPanel.tsx')", "path.join(__dirname, 'panel-probe.tsx')")
fs.writeFileSync(path.join(__dirname, 'counterfactual-tests.cjs'), privateTests)
const variants = [
  { name: 'exact-pre-repair', source: original, expectedFailures: 8 },
  { name: 'remove-arrow-run-identity-guard', source: current.replace(`      chip.dataset.runId !== run.runId ||${eol}`, ''), expectedFailures: 2 },
  { name: 'remove-arrow-hit-key-guard', source: current.replace(`      chip.dataset.runId !== run.runId ||${eol}      chip.dataset.hitKey !== target.key`, '      chip.dataset.runId !== run.runId'), expectedFailures: 1 },
]
const results = []
for (const variant of variants) {
  assert.notEqual(variant.source, current)
  const file = path.join(__dirname, variant.name + '.tsx')
  fs.writeFileSync(file, variant.source)
  fs.writeFileSync(path.join(__dirname, 'panel-probe.tsx'), variant.source)
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--test-name-pattern=^G3 arrows:', path.join(__dirname, 'counterfactual-tests.cjs')], { encoding: 'utf8', windowsHide: true, timeout: 30000 })
  assert.equal(run.error, undefined)
  const log = run.stdout + run.stderr
  fs.writeFileSync(path.join(__dirname, variant.name + '.log'), log)
  const failures = Number(log.match(/# fail (\d+)/)?.[1])
  results.push({ name: variant.name, sha256: hash(variant.source), exitCode: run.status, failures, expectedFailures: variant.expectedFailures, failedAssertions: [...log.matchAll(/^not ok \d+ - (.+)$/gm)].map(m => m[1]) })
  assert.equal(run.status, 1)
  assert.equal(failures, variant.expectedFailures, variant.name)
}
fs.writeFileSync(path.join(__dirname, 'panel-probe.tsx'), current)
assert.equal(hash(fs.readFileSync(panelPath)), hash(current))
assert.equal(hash(fs.readFileSync(testPath)), hash(tests))
fs.writeFileSync(path.join(__dirname, 'counterfactual-results.json'), JSON.stringify({ originalTestsPreserved: 20, applicationUnchanged: true, preRepairHashVerified: true, results }, null, 2) + '\n')
console.log(JSON.stringify(results, null, 2))
