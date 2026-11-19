/* eslint-disable @typescript-eslint/no-require-imports -- Node test-loader convention. */
// Execute the unchanged durable assertions with a read-only source substitution.
// This runs in its own Node process; no test/app file or global module cache changes.
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const { createHash } = require('node:crypto')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '../../../../../..')
const testPath = path.join(root, 'tests/assistant/studio-experience.test.cjs')
const currentRoot = path.join(root, 'components/studio/StudioExperience.tsx')
const oldRoot = path.join(root, 'design/assistant/robot/integration/root-repair-v02/StudioExperience.tsx.before.txt')
const source = fs.readFileSync(testPath, 'utf8')
const sha = (value) => createHash('sha256').update(value).digest('hex')
assert.equal(sha(source), '4678443279847c541c63a163461b106a58cf524f73c5f71561f1ccda79c70812')
assert.equal(sha(fs.readFileSync(oldRoot)), 'd65b4aeb2f00af40700ebb90e42087a267d6135c520c37582a12f4ffc39f3403')
const requireAtTest = createRequire(testPath)
const readPort = { ...fs, readFileSync(filename, ...args) {
  return fs.readFileSync(path.resolve(String(filename)) === currentRoot ? oldRoot : filename, ...args)
} }
const localModule = { exports: {} }
vm.compileFunction(source, ['require', '__dirname', '__filename', 'module', 'exports'], { filename: testPath })(
  (name) => name === 'node:fs' ? readPort : requireAtTest(name),
  path.dirname(testPath), testPath, localModule, localModule.exports
)
