# Compatible lint repair proposal

15 November 2026. Dependency-expert review, read-only. Implementation is pending the user's answer to the dependency question; no package or lint configuration change is authorized by this document alone.

## Evidence and proposed change

The configured `plugin:@typescript-eslint/recommended` cannot load because its plugin is missing. Current lock: ESLint8.57.1, Next/eslint-config-next14.0.4, TypeScript5.9.2, transitive parser6.21.0. Adding only plugin6.21.0 would restore module resolution while leaving TypeScript outside parser6's supported range (`>=4.3.5 <5.4.0`), so that is not the recommended quality fix.

Proposed exact dev dependencies:

```sh
npm install --save-dev --save-exact @typescript-eslint/parser@8.72.2 @typescript-eslint/eslint-plugin@8.72.2
```

The compatible pair supports ESLint `^8.57.0 || ^9.0.0 || ^10.0.0`, TypeScript `>=4.8.4 <6.1.0`, and Node `^18.18.0 || ^20.9.0 || >=21.1.0`. Both are MIT. Official evidence: [8.72.2 release](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v8.72.2), [parser manifest](https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/v8.72.2/packages/parser/package.json), [plugin manifest](https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/v8.72.2/packages/eslint-plugin/package.json). Version8.39.0 first added TypeScript5.9.2 support;8.72.2 was the current stable pair when checked on15 November2026.

## Bounded implementation after approval

1. Add only the exact pair and review the lockfile delta for unrelated changes. Keep Next, React, Three.js, TypeScript and ESLint versions unchanged. Do not force an audit fix, dedupe or transitive override.
2. Next14 legitimately keeps its own parser6 dependency nested. Verify that the root ESLint `parser` selects parser8, and inspect `settings['import/parsers']`: Next's absolute parser mapping can otherwise send imported TypeScript back through parser6. The proposed bounded correction is `settings: { 'import/parsers': null }`, which lets import analysis fall back to the active parser. Verify this against effective configuration; do not remove import rules. Evidence: [Next14 configuration](https://raw.githubusercontent.com/vercel/next.js/v14.0.4/packages/eslint-config-next/index.js) and [import plugin parser selection](https://raw.githubusercontent.com/import-js/eslint-plugin-import/v2.32.0/utils/parse.js).
3. Inspect the version8 recommended preset changes. Preserve the configured unused-vars warning override and equivalent existing protections; the removed TypeScript precision extension may require checking core `no-loss-of-precision`. Do not assume the v6 and v8 presets are identical. [Migration reference](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/).
4. Run `npm ls` for the two packages, ESLint and TypeScript, then uncached configured lint. Fix actual code findings within established ownership; route visual-code changes to its Claude owner rather than changing appearance. Do not weaken rules or suppress failures to obtain green CI.
5. Run typecheck, the existing relevant CPU tests and hosted clean-install/build checks. Record exact source hashes if a change invalidates prior evidence. Commit the focused repair and push the feature branch.

The current16 dependency advisories require separate triage. This proposal is not a framework migration, vulnerability remediation approval or final portfolio acceptance.
