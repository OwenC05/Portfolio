# `@next/eslint-plugin-next`

Documentation for `@next/eslint-plugin-next` can be found at:
https://nextjs.org/docs/app/api-reference/config/eslint

## Portfolio security maintenance patch

This is the official `@next/eslint-plugin-next` **16.3.8** npm distribution,
not a reduced or replacement rule implementation. `upstream-provenance.json`
records the official tarball URL, SHA-512 integrity and SHA-1 checksum, verified
before extraction. `upstream-files.json` records each original file's SHA-256.
The MIT license is preserved from the official Next.js `v16.3.8` tag.

The only runtime change is in `dist/utils/get-root-dirs.js`: use
`tinyglobby@0.2.17`'s `globSync` instead of `fast-glob@3.3.1`'s `globSync`, with
`onlyDirectories: true` **and `expandDirectories: false`**. The latter preserves
literal-root behavior instead of returning children. The helper also explicitly
preserves absolute-vs-relative paths, upstream `./` prefixes and trailing-slash
conventions, since tinyglobby defaults to relative, slash-suffixed directories.
For an exact filesystem-root pattern, `cwd` is set to that root: tinyglobby
otherwise resolves `/` to the process directory instead of the filesystem root. The package dependency is
changed correspondingly. This removes the vulnerable `fast-glob` → `micromatch`
→ `braces` chain without aliasing incompatible packages, weakening lint rules,
or suppressing audit findings.

Terminal recursive globstars are rewritten to `**/*` so they exclude the base
root like upstream. Trailing separators are preserved for literal and brace-
literal roots but stripped for wildcard roots; `./` remains `./`. The documented
`fs` adapter wraps only the three synchronous operations used by the glob walker.
It records the first non-`ENOENT` filesystem error and rethrows that original
object after globbing, preserving upstream error propagation despite fdir's
suppression. This includes `ENOTDIR`, `EACCES`, `EPERM` and `EIO`; error state is
local to each resolution call.

All 22 upstream rules, four configurations, utility files (other than that
single helper), and type declarations remain byte-for-byte upstream. The npm
tarball contains compiled JavaScript and declarations, not source files or
source maps; no synthetic sources/maps are added. Extra files are this note,
the license, and the integrity manifests. See `lib/eslintPlugin.test.ts` for
root-resolution and real ESLint internal-link regression coverage, including
literal, wildcard, brace, array, unmatched and normalized backslash patterns.
Backslash tests exercise the upstream separator normalization; they do not
claim to run a Windows drive/UNC filesystem on Linux.

The root manifest declares this existing lint plugin as a local development
dependency and uses npm's `$@next/eslint-plugin-next` override reference so
`eslint-config-next` selects the same patched package. Keep both entries in
sync; verify a clean `npm ci` after changing either.

### Removal condition

Replace this local npm override with the matching official Next.js plugin
release when upstream removes or fixes the affected dependency chain. Verify
`npm audit` is clean, run the root-resolution/rule-retention tests and full
lint/test/build checks, then remove this directory, its direct development dependency and its override. Do not
silently upgrade the vendored compiled files independently of Next.js and
`eslint-config-next`; refresh provenance and preservation tests when updating.
