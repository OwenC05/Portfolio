import { afterAll, describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, parse, relative, resolve } from 'node:path'
import { Linter } from 'eslint'

const require = createRequire(import.meta.url)
const vendorDir = resolve('vendor/next-eslint-plugin')
const plugin = require(join(vendorDir, 'dist/index.js')).default
const { getRootDirs } = require(join(vendorDir, 'dist/utils/get-root-dirs.js'))
const fixture = mkdtempSync(join(tmpdir(), 'next-eslint-roots-'))
for (const name of ['alpha', 'beta', 'nested/child'])
  mkdirSync(join(fixture, name), { recursive: true })
mkdirSync(join(fixture, 'alpha/pages'), { recursive: true })
writeFileSync(
  join(fixture, 'alpha/pages/about.tsx'),
  'export default function Page() { return null }'
)
writeFileSync(join(fixture, 'not-a-directory.txt'), 'fixture')
afterAll(() => rmSync(fixture, { recursive: true, force: true }))
const roots = (rootDir?: unknown) =>
  getRootDirs({
    cwd: fixture,
    settings: rootDir === undefined ? {} : { next: { rootDir } },
  })

describe('Next lint root directory resolution', () => {
  it.each(['EACCES', 'ENOENT', 'ENOTDIR'])(
    'preserves upstream %s filesystem error behavior in an isolated process',
    (code) => {
      const child = spawnSync(
        process.execPath,
        [
          '-e',
          `
      const fs = require('node:fs');
      const original = fs.readdirSync;
      const failure = new Error('mock filesystem failure'); failure.code = ${JSON.stringify(code)};
      fs.readdirSync = function(path, ...args) {
        if (String(path).startsWith(${JSON.stringify(fixture)})) {
          throw failure;
        }
        return original.call(this, path, ...args);
      };
      const { getRootDirs } = require(${JSON.stringify(join(vendorDir, 'dist/utils/get-root-dirs.js'))});
      try { console.log(JSON.stringify({ roots: getRootDirs({ cwd: process.cwd(), settings: { next: { rootDir: ${JSON.stringify(`${fixture}/*`)} } } }) })); }
      catch (error) { console.log(JSON.stringify({ error: error.code, original: error === failure })); }
    `,
        ],
        { encoding: 'utf8', windowsHide: true }
      )
      expect(child.status, child.stderr).toBe(0)
      expect(JSON.parse(child.stdout)).toEqual(
        code === 'ENOENT' ? { roots: [] } : { error: code, original: true }
      )
    }
  )
  it('preserves all three synchronous adapter errors and never leaks them between calls', () => {
    const child = spawnSync(
      process.execPath,
      [
        '-e',
        `
      const assert = require('node:assert/strict');
      const fs = require('node:fs');
      const vendorRequire = require('node:module').createRequire(${JSON.stringify(join(vendorDir, 'package.json'))});
      const tinyglobby = vendorRequire('tinyglobby');
      const { getRootDirs } = vendorRequire('./dist/utils/get-root-dirs.js');
      const context = { cwd: process.cwd(), settings: { next: { rootDir: '/mock-root/*' } } };
      for (const method of ['readdirSync', 'realpathSync', 'statSync']) {
        const original = fs[method];
        // Simulate fdir swallowing a synchronous adapter failure.
        tinyglobby.globSync = (_pattern, options) => {
          try { options.fs[method]('/mock-root'); } catch {}
          return [];
        };
        for (const code of ['EACCES', 'EPERM', 'EIO', 'ENOTDIR', 'ENOENT']) {
          const failure = new Error('mock filesystem failure'); failure.code = code;
          fs[method] = () => { throw failure; };
          if (code === 'ENOENT') assert.deepEqual(getRootDirs(context), []);
          else assert.throws(() => getRootDirs(context), error => error === failure);
          fs[method] = () => undefined;
          assert.deepEqual(getRootDirs(context), []);
        }
        fs[method] = original;
      }
    `,
      ],
      { encoding: 'utf8', windowsHide: true }
    )
    expect(child.status, child.stderr).toBe(0)
  })
  it('defaults to the lint context cwd', () =>
    expect(roots()).toEqual([fixture]))
  it('resolves literal directories without expanding their children', () =>
    expect(roots(join(fixture, 'nested'))).toEqual([join(fixture, 'nested')]))
  it('preserves the filesystem-root separator', () => {
    const filesystemRoot = parse(fixture).root.replaceAll('\\', '/')
    expect(roots(filesystemRoot)).toEqual([filesystemRoot])
  })
  it('preserves relative, explicit dot-prefix and trailing-slash roots', () => {
    const relativeRoot = relative(
      process.cwd(),
      join(fixture, 'alpha')
    ).replaceAll('\\', '/')
    expect(roots(relativeRoot)).toEqual([relativeRoot])
    expect(roots(`./${relativeRoot}`)).toEqual([`./${relativeRoot}`])
    expect(roots(`${relativeRoot}/`)).toEqual([`${relativeRoot}/`])
    expect(roots('.')).toEqual(['.'])
  })
  it('resolves wildcard directories and excludes files', () =>
    expect(roots(`${fixture}/*`).sort()).toEqual(
      ['alpha', 'beta', 'nested'].map((name) => join(fixture, name)).sort()
    ))
  it('excludes the recursive glob base directory', () => {
    const expected = ['alpha', 'alpha/pages', 'beta', 'nested', 'nested/child']
      .map((name) => join(fixture, name))
      .sort()
    expect(roots(`${fixture}/**`).sort()).toEqual(expected)
    expect(roots(`${fixture}/**/**`).sort()).toEqual(expected)
  })
  it('strips trailing separators from wildcard roots but preserves literal and brace-literal roots', () => {
    expect(roots(`${fixture}/*/`).sort()).toEqual(
      ['alpha', 'beta', 'nested'].map((name) => join(fixture, name)).sort()
    )
    expect(roots(`${fixture}/{alpha,beta}/`).sort()).toEqual(
      ['alpha', 'beta'].map((name) => `${join(fixture, name)}/`).sort()
    )
  })
  it('preserves the explicit current-directory root', () =>
    expect(roots('./')).toEqual(['./']))
  it('resolves brace roots', () =>
    expect(roots(`${fixture}/{alpha,beta}`).sort()).toEqual(
      ['alpha', 'beta'].map((name) => join(fixture, name)).sort()
    ))
  it('returns no roots for unmatched patterns or files', () => {
    expect(roots(`${fixture}/missing-*`)).toEqual([])
    expect(roots(join(fixture, 'not-a-directory.txt'))).toEqual([])
  })
  it('flattens arrays and ignores non-string members', () =>
    expect(
      roots([join(fixture, 'alpha'), false, join(fixture, 'beta')])
    ).toEqual([join(fixture, 'alpha'), join(fixture, 'beta')]))
  it('normalizes backslash separators before globbing', () =>
    expect(roots(join(fixture, 'alpha').replaceAll('/', '\\'))).toEqual([
      join(fixture, 'alpha'),
    ]))
})

describe('retained Next lint rules', () => {
  it('selects the patched plugin from the actual eslint-config-next dependency', () => {
    const root = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
    expect(root.devDependencies['@next/eslint-plugin-next']).toBe(
      'file:vendor/next-eslint-plugin'
    )
    expect(root.overrides['@next/eslint-plugin-next']).toBe(
      '$@next/eslint-plugin-next'
    )
    const configRequire = createRequire(require.resolve('eslint-config-next'))
    const selectedPackage = configRequire.resolve(
      '@next/eslint-plugin-next/package.json'
    )
    const selectedRequire = createRequire(selectedPackage)
    const selected = JSON.parse(
      readFileSync(realpathSync(selectedPackage), 'utf8')
    )
    expect(selected.dependencies).toEqual(
      JSON.parse(readFileSync(join(vendorDir, 'package.json'), 'utf8'))
        .dependencies
    )
    const selectedHelper = configRequire.resolve(
      '@next/eslint-plugin-next/dist/utils/get-root-dirs.js'
    )
    expect(readFileSync(realpathSync(selectedHelper), 'utf8')).toBe(
      readFileSync(join(vendorDir, 'dist/utils/get-root-dirs.js'), 'utf8')
    )
    expect(selectedRequire('tinyglobby/package.json').version).toBe('0.2.17')
    expect(selected.dependencies).not.toHaveProperty('fast-glob')
  })
  it('keeps the vendored version aligned with Next and eslint-config-next', () => {
    const root = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
    const vendor = JSON.parse(
      readFileSync(join(vendorDir, 'package.json'), 'utf8')
    )
    expect(vendor.version).toBe(root.devDependencies['eslint-config-next'])
    expect(vendor.version).toBe(root.dependencies.next)
    expect(vendor.dependencies).toEqual({
      '@eslint-community/eslint-utils': '4.9.1',
      tinyglobby: '0.2.17',
    })
  })
  it('retains every upstream rule, type declaration and configuration byte-for-byte', () => {
    const files = JSON.parse(
      readFileSync(join(vendorDir, 'upstream-files.json'), 'utf8')
    ) as Record<string, string>
    for (const [file, hash] of Object.entries(files)) {
      if (
        ['package.json', 'README.md', 'dist/utils/get-root-dirs.js'].includes(
          file
        )
      )
        continue
      expect(
        createHash('sha256')
          .update(readFileSync(join(vendorDir, file)))
          .digest('hex'),
        file
      ).toBe(hash)
    }
    expect(Object.keys(plugin.rules)).toHaveLength(22)
    expect(Object.keys(plugin.configs).sort()).toEqual([
      'core-web-vitals',
      'core-web-vitals-legacy',
      'recommended',
      'recommended-legacy',
    ])
    expect(
      plugin.configs['core-web-vitals'].rules[
        '@next/next/no-html-link-for-pages'
      ]
    ).toBe('error')
  })
  it.each(['literal', 'wildcard', 'brace', 'backslash', 'default'])(
    'still flags internal plain anchors with %s root settings',
    (kind) => {
      const rootDir =
        kind === 'literal'
          ? join(fixture, 'alpha')
          : kind === 'wildcard'
            ? `${fixture}/*`
            : kind === 'brace'
              ? `${fixture}/{alpha,beta}`
              : kind === 'backslash'
                ? join(fixture, 'alpha').replaceAll('/', '\\')
                : undefined
      const linter = new Linter({ cwd: join(fixture, 'alpha') })
      const config = {
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { '@next/next': plugin },
        settings: rootDir ? { next: { rootDir } } : {},
        rules: { '@next/next/no-html-link-for-pages': 'error' as const },
      }
      const messages = linter.verify(
        'const x = <a href="/about">About</a>',
        config
      )
      expect(messages).toHaveLength(1)
      expect(messages[0].ruleId).toBe('@next/next/no-html-link-for-pages')
      expect(
        linter.verify('const x = <Link href="/about">About</Link>', config)
      ).toEqual([])
      expect(
        linter.verify(
          'const x = <a href="https://example.com/about">External</a>',
          config
        )
      ).toEqual([])
    }
  )
})
