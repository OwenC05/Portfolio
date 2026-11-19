'use strict'
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../../../../..')
const ts = require(path.join(root, 'node_modules/typescript'))
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
if (config.error) throw Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'))
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const options = { ...parsed.options, noEmit: true, incremental: false }
delete options.tsBuildInfoFile
const host = ts.createCompilerHost(options)
const original = host.getSourceFile.bind(host)
const scene = path.resolve(root, 'components/studio/StudioScene.tsx')
host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => {
  if (path.resolve(filename) === scene) return ts.createSourceFile(filename,
    "import type { StudioSceneProps } from '@/lib/studio-contract'; export default function StudioScene(_props: StudioSceneProps) { return null }", languageVersion, true)
  return original(filename, languageVersion, onError, shouldCreateNewSourceFile)
}
const roots = ['components/studio/StudioExperience.tsx', 'node_modules/next/types/global.d.ts']
const program = ts.createProgram(roots.map(p => path.join(root, p)), options, host)
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)]
const details = ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: f => f, getCurrentDirectory: () => root, getNewLine: () => '\n' })
const result = { roots, diagnostics: diagnostics.length, noEmit: true, incremental: false, sceneImplementationExcluded: true, boundary: 'Actual root and fixed imports; StudioScene implementation replaced only in memory by a component using its published StudioSceneProps interface; current public contract types checked but not frozen as G2 implementation evidence', details }
fs.writeFileSync(path.join(__dirname, 'typescript-result.json'), JSON.stringify(result, null, 2) + '\n')
console.log(details || 'PASS: actual root and imports against optional scene props; active scene implementation excluded; no emit/typegen.')
if (diagnostics.length) process.exitCode = 1
