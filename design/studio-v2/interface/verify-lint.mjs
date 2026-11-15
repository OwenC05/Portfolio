// Supplemental installed Next/React-hooks rules over in-memory transpilation.
// This does not replace configured TypeScript ESLint (its plugin is missing).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { Linter } = require('eslint')
const next = require('@next/eslint-plugin-next')
const hooks = require('eslint-plugin-react-hooks')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const linter = new Linter()
for (const [name, rule] of Object.entries(next.rules)) linter.defineRule(`@next/next/${name}`, rule)
for (const [name, rule] of Object.entries(hooks.rules)) linter.defineRule(`react-hooks/${name}`, rule)
const files = ['components/studio/StudioExperience.tsx', 'components/studio/ProjectEvidence.tsx', 'app/studio/panel-navigation.ts', 'app/studio/panel-scroll.ts', 'app/studio/StudioShell.tsx']
let findings = 0
for (const file of files) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    fileName: file,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve },
  }).outputText
  const messages = linter.verify(source, {
    parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
    rules: {
      ...next.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': ['error', { additionalHooks: '(useCommitEffect)' }],
    },
  }, file.replace(/\.tsx?$/, '.jsx'))
  for (const message of messages) console.error(JSON.stringify({ file, transpiledLine: message.line, ...message }))
  findings += messages.length
}
console.log(`${findings ? 'FAIL' : 'PASS'} supplemental Next/React-hooks lint: ${files.length} files, ${findings} findings; configured TS ESLint remains unavailable`)
process.exitCode = findings ? 1 : 0
