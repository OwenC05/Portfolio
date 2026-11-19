'use strict'
const path = require('node:path')
const fs = require('node:fs')
const root = path.resolve(__dirname, '../../../../..')
const ts = require(path.join(root, 'node_modules/typescript'))
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'))
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const roots = ['app/studio/StudioShell.tsx', 'components/studio/assistant/AssistantEntry.tsx',
  'components/studio/assistant/StudioAssistantPanel.tsx', 'components/studio/StudioExperience.tsx']
// Supply installed Next ambient CSS declarations without loading next-env.d.ts's
// generated .next/routes reference or writing any typegen/build artifacts.
const ambient = 'node_modules/next/types/global.d.ts'
const options = { ...parsed.options, noEmit: true, incremental: false }
delete options.tsBuildInfoFile
const program = ts.createProgram([...roots, ambient].map(file => path.join(root, file)), options)
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)]
const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n',
})
fs.writeFileSync(path.join(__dirname, 'typescript-result.json'), JSON.stringify({
  checkedAt: new Date().toISOString(), roots, ambient, diagnostics: diagnostics.length,
  noEmit: true, incremental: false, details: formatted,
}, null, 2) + '\n')
console.log(formatted || 'PASS: four scoped TSX roots and their imports; no diagnostics, no emit/typegen/incremental output.')
if (diagnostics.length) process.exitCode = 1
