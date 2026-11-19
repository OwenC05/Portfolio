// Dependency-free test loader: TypeScript already belongs to the application toolchain.
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function createLoader() {
  const cache = new Map()
  function load(filename) {
    filename = path.resolve(filename)
    if (!path.extname(filename)) filename += '.ts'
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    })
    const localRequire = id => id.startsWith('.') ? load(path.resolve(path.dirname(filename), id)) : require(id)
    new Function('require', 'module', 'exports', result.outputText)(localRequire, module, module.exports)
    return module.exports
  }
  return load
}
module.exports = { createLoader }
