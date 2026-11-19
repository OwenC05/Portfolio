'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '../../../../..')
const cases = [
  ['integration-tests', ['--test', '--test-reporter=tap', 'tests/assistant/studio-experience.test.cjs']],
  ['scoped-typescript', [path.join(__dirname, 'static-check.cjs')]],
  ['scoped-lint', ['node_modules/eslint/bin/eslint.js', 'components/studio/StudioExperience.tsx', 'tests/assistant/studio-experience.test.cjs', '--max-warnings', '0']],
]
const results = cases.map(([name, args]) => {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000 })
  const log = result.stdout + result.stderr
  fs.writeFileSync(path.join(__dirname, name + '.log'), log)
  return { name, command: ['node', ...args], exitCode: result.status, error: result.error?.message, pass: Number(log.match(/# pass (\d+)/)?.[1]) || undefined, fail: Number(log.match(/# fail (\d+)/)?.[1]) || undefined }
})
fs.writeFileSync(path.join(__dirname, 'check-results.json'), JSON.stringify(results, null, 2) + '\n')
console.log(JSON.stringify(results, null, 2))
if (results.some(r => r.exitCode !== 0)) process.exitCode = 1
