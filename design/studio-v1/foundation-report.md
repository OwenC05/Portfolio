# Studio v1 foundation report

Date: 14 November 2026. Worker F; task `task_33773885e9a9`, dispatch `ctx_62e2d88acfef`.

## Result and handoff

Foundation implementation is complete. `lib/studio-contract.ts` is frozen to the approved PRD and available to content, scene and interface workers. Exact `three@0.187.0` and development `@types/three@0.187.0` are installed. Contract checks and the full project typecheck pass. The production build exits successfully, but reports the existing ESLint configuration failure; **lint does not pass**. This is foundation evidence, not integrated `/studio` acceptance.

The remaining baseline issue is the existing `.eslintrc.json` referencing `@typescript-eslint/eslint-plugin`, which is absent from the original manifest/lockfile and installed tree. No extra package was added to repair it and the existing config was retained unchanged, as instructed. Dependency audit findings remain open; no blanket upgrades or `npm audit fix` were run. The coordinator owns any separately scoped lint repair and later integrated validation.

## Ownership and inputs

Changed only these authored files:

- `package.json`: exact runtime Three and development types entries.
- `package-lock.json`: those packages and the types package's required transitive dependencies.
- `lib/studio-contract.ts`: the PRD's exact exported IDs, types, interfaces and two helpers.
- `design/studio-v1/foundation-report.md`: this report and raw audit evidence.

Existing `.eslintrc.json` was inspected and reused without edits. Installation populated `node_modules`; the requested build generated ignored `.next` output. No application, scene, content, existing draft, planning/runtime record or browser changes were made by F. No commit or deployment was performed.

Read `.omx/specs/studio-v1/common.md`, the approved PRD/test specification, the current context and reference findings, and the recorded approved implementation handoff. Dependency evidence in `.omx/context/after-hours-studio-v1-20261114.md` names the same exact packages. The installed types manifest requires TypeScript 5.6 or later; locked 5.9.2 satisfies that baseline.

## Workspace snapshots and attribution

Commands: `git status --short`, `git diff --stat`, `rg --files lib app components`, and `Get-FileHash` for the package files, existing ESLint config, homepage, site config and new contract.

- Before installation, tracked files had no changes. `.omx/`, `.playwright-mcp/` and `design/` were already untracked. Root `node_modules` was absent.
- At 19:14:37 UTC immediately before lint, at 19:15:07 UTC immediately before build, and at 19:15:28 UTC before the full typecheck, the app/lib/component inventory was the list below. Content worker C had not yet added `lib/studio-content.ts` at those snapshots; no `/studio` route or scene files were present.
- These are **concurrent-workspace baseline observations**, not a claim of a pristine isolated checkout: the new contract and package changes were already present, and C was authorized to write independently.
- After the checks, the only changed tracked files were `package.json` and `package-lock.json`. `git diff -- app components lib/site.config.ts .eslintrc.json` was empty. The ESLint config, homepage and site config hashes were identical to their pre-installation snapshots.
- At final reporting, `lib/studio-content.ts` had appeared as C's independent work. F did not edit or revert it, and the earlier build/typecheck results do not claim to cover that later file. `git diff --check` passed for the tracked package changes.

Inventory during the checks:

```text
app/globals.css
app/layout.tsx
app/page.tsx
components/Footer.tsx
components/Hero.tsx
components/Navbar.tsx
components/ProjectsTeaser.tsx
components/Skills.tsx
components/ThemeToggle.tsx
lib/site.config.ts
lib/studio-contract.ts
lib/utils.ts
```

Unchanged SHA-256 evidence:

```text
.eslintrc.json      3448EE6D1528D25B0DBB4003B1489CC2FDEBDA1C64509C7D64DFB5506FF4FF5D
app/page.tsx       1355DE8BE21A12FAD889DAE7B9BD20CC2B5BF3B3F5943EC05BBD8B64B3A170EF
lib/site.config.ts 26948B0EC5BDEA027148E7F704BFB26351AE4E99D0616F793BCB03F2B6314006
```

## Dependency installation and lockfile

Host: native Windows PowerShell, Node `v24.21.0`, npm `11.19.0`.

| Exact command | Exit | Result |
| --- | --- | --- |
| `node --version` | 0 | `v24.21.0` |
| `npm.cmd --version` | 0 | `11.19.0` |
| `npm.cmd install --save-exact three@0.187.0` | 0 | Added 386 packages, audited 387, about 1 minute |
| `npm.cmd install --save-dev --save-exact @types/three@0.187.0` | 0 | Added 7 packages, audited 394, about 5 seconds |
| `npm.cmd ls three @types/three react next typescript` | 0 | Exact Three/types 0.187.0; React 18.3.1, Next 14.0.4, TypeScript 5.9.2 |

Neither install used `--force` or `--legacy-peer-deps`. Both reported 16 audit findings (3 moderate, 12 high, 1 critical). Existing tooling deprecation warnings included inflight, rimraf, glob, ESLint and the humanwhocodes packages. npm also reported that the existing `unrs-resolver@1.11.1` postinstall was not covered by `allowScripts`; no install-script approval was changed. Both installs exited 0 and build/typecheck ran successfully despite that notice.

The initial baseline lockfile extraction via inline `node -e` hit PowerShell argument quoting and failed before reading data; retrying with a PowerShell here-string piped to Node succeeded. This was an inspection-command failure, not an install or source failure.

Compared parsed `git show HEAD:package-lock.json` with the resulting lockfile using Node. **No existing package versions or metadata changed; no package entries were removed.** Eight entries were added:

| Added package | Version | Why present |
| --- | --- | --- |
| `three` | 0.187.0 | Requested runtime dependency |
| `@types/three` | 0.187.0 | Requested development dependency |
| `@dimforge/rapier3d-compat` | 0.12.0 | Required by the types package |
| `@tweenjs/tween.js` | 23.1.3 | Required by the types package |
| `@types/stats.js` | 0.17.4 | Required by the types package |
| `@types/webxr` | 0.5.24 | Required by the types package |
| `fflate` | 0.8.3 | Required by the types package |
| `meshoptimizer` | 1.1.1 | Required by the types package |

These transitive packages are development dependencies; no physics/animation adapter was deliberately adopted or imported into the application. npm removed the pre-existing leading blank line in `package.json`. Tracked package diff: 69 insertions and 3 deletions across the two package files (lockfile 67 changed lines); there was no unrelated version churn.

## Contract verification

`PROJECT_IDS` is exactly `['dissertation', 'copilot', 'typeforge']`. All PRD exports and readonly array shapes match. `projectAnchor` produces the corresponding `#project-*` anchor. `projectIdFromHash` compares exact strings against those IDs and returns `null` for every other string; it performs no decoding or permissive prefix matching. There are no imports, including no Three runtime import.

Exact targeted command, exit 0 with no diagnostics:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit --strict --skipLibCheck --target es5 --lib dom,dom.iterable,es6 --module esnext --moduleResolution bundler --isolatedModules lib/studio-contract.ts
```

A Node stdin smoke check transpiled the contract in memory with the installed TypeScript compiler and evaluated it in `node:vm` without providing `require`. It checked the exact ID list, all three anchor outputs, all three accepted hashes and 20 rejected hashes. Output:

```text
PASS: 3 exact project IDs; 3 anchor outputs and accepted hashes; 20 rejected hashes; no runtime imports or require.
```

Rejected inputs included empty/missing fragments, `#studio`, unknown/case-changed IDs, prefixes/suffixes, query strings, repeated fragments, whitespace/newline, percent encoding, object-prototype names and a full URL. The exact check was:

```powershell
@'
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const source = fs.readFileSync('lib/studio-contract.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2015 } }).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(js, sandbox);
const { PROJECT_IDS, projectAnchor, projectIdFromHash } = sandbox.exports;
const ids = ['dissertation', 'copilot', 'typeforge'];
assert.deepEqual(Array.from(PROJECT_IDS), ids);
for (const id of ids) {
  assert.equal(projectAnchor(id), '#project-' + id);
  assert.equal(projectIdFromHash('#project-' + id), id);
}
const rejected = ['', '#', '#studio', 'dissertation', 'project-dissertation', '#project-', '#project-unknown', '#project-Dissertation', '#PROJECT-dissertation', '#project-copilot-extra', '#project-typeforge/', '#project-dissertation?x=1', '#project-dissertation#extra', ' #project-copilot', '#project-copilot ', '#project-copilot\n', '#project-%64issertation', '#project-__proto__', '#project-constructor', 'https://example.test/studio#project-dissertation'];
for (const value of rejected) assert.equal(projectIdFromHash(value), null, JSON.stringify(value));
assert.equal(/\b(?:import|require)\b/.test(source), false);
console.log('PASS: 3 exact project IDs; 3 anchor outputs and accepted hashes; 20 rejected hashes; no runtime imports or require.');
'@ | node
```

## Baseline lint, build and full typecheck

| Exact command | Exit | Observed result |
| --- | --- | --- |
| `npm.cmd run lint` | 1 | Noninteractive failure loading the existing missing ESLint plugin |
| `npm.cmd run build` | 0 | Compiled, typechecked, prerendered 4 pages and finalized build traces; emitted the same ESLint error |
| `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` | 0 | Full project typecheck after build; no diagnostics |

Lint output:

```text
Failed to load plugin '@typescript-eslint' declared in '.eslintrc.json': Cannot find module '@typescript-eslint/eslint-plugin'
Require stack:
- C:\Users\Owenc\orca\Portfolio\__placeholder__.js
Referenced from: C:\Users\Owenc\orca\Portfolio\.eslintrc.json
```

Attribution: `.eslintrc.json` is tracked and unchanged; the original manifest/lockfile did not contain `@typescript-eslint/eslint-plugin`, and no existing dependency entries changed during installation. This missing existing tooling dependency predates F. A successful build exit is not evidence that ESLint passed.

The build warned that caniuse-lite/Browserslist data was outdated. No unrelated database update was run. Build route output:

```text
Route (app)                              Size     First Load JS
 /                                      2.04 kB        83.9 kB
 /_not-found                            869 B          82.7 kB
 First Load JS shared by all                           81.8 kB
```

No `/studio` implementation was present during this build. Integrated scene, content, interface, accessibility, rendering and browser/performance verification remain for their assigned lanes and the coordinator.

## Dependency audit

`npm.cmd audit --json` exited 1 because it reported vulnerabilities: **16 total, comprising 3 moderate, 12 high and 1 critical**. It was captured again to retain complete, untruncated JSON in this report. Audit-reported fix suggestions are evidence only, not applied upgrades or a claim that a suggested target resolves every advisory. Severity and affected-version information below are npm registry output at this check time, not an independent exploit assessment.

| Package reported by audit | Severity | All affected lockfile nodes pre-existing and unchanged |
| --- | --- | --- |
| @typescript-eslint/parser | high | Yes |
| @typescript-eslint/typescript-estree | high | Yes |
| ajv | moderate | Yes |
| brace-expansion | high | Yes |
| browserslist | high | Yes |
| flatted | high | Yes |
| glob | high | Yes |
| js-yaml | high | Yes |
| minimatch | high | Yes |
| nanoid | high | Yes |
| next | critical | Yes |
| picomatch | high | Yes |
| postcss | high | Yes |
| postcss-selector-parser | moderate | Yes |
| source-map-js | high | Yes |
| yaml | moderate | Yes |

## Complete npm audit output

The JSON below is the command's raw output, preserved for coordinator review. A first PowerShell attribution pass could not parse the lockfile's empty root key; Node parsed the retained JSON and both lockfiles successfully, then verified and corrected all table rows above. Every affected node is pre-existing and unchanged; none of the eight added packages appears in the audit findings.


<details>
<summary>Raw audit JSON; command exit 1</summary>

```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "@typescript-eslint/parser": {
      "name": "@typescript-eslint/parser",
      "severity": "high",
      "isDirect": false,
      "via": [
        "@typescript-eslint/typescript-estree"
      ],
      "effects": [],
      "range": "6.16.0 - 7.5.0",
      "nodes": [
        "node_modules/@typescript-eslint/parser"
      ],
      "fixAvailable": true
    },
    "@typescript-eslint/typescript-estree": {
      "name": "@typescript-eslint/typescript-estree",
      "severity": "high",
      "isDirect": false,
      "via": [
        "minimatch"
      ],
      "effects": [
        "@typescript-eslint/parser"
      ],
      "range": "6.16.0 - 7.5.0",
      "nodes": [
        "node_modules/@typescript-eslint/typescript-estree"
      ],
      "fixAvailable": true
    },
    "ajv": {
      "name": "ajv",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1113714,
          "name": "ajv",
          "dependency": "ajv",
          "title": "ajv has ReDoS when using `$data` option",
          "url": "https://github.com/advisories/GHSA-2g4f-4pwh-qvx6",
          "severity": "moderate",
          "cwe": [
            "CWE-400",
            "CWE-1333"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": "<6.14.0"
        }
      ],
      "effects": [],
      "range": "<6.14.0",
      "nodes": [
        "node_modules/ajv"
      ],
      "fixAvailable": true
    },
    "brace-expansion": {
      "name": "brace-expansion",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1115540,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: Zero-step sequence causes process hang and memory exhaustion",
          "url": "https://github.com/advisories/GHSA-f886-m6hf-6m8v",
          "severity": "moderate",
          "cwe": [
            "CWE-400"
          ],
          "cvss": {
            "score": 6.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:N/A:H"
          },
          "range": "<1.1.13"
        },
        {
          "source": 1115541,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: Zero-step sequence causes process hang and memory exhaustion",
          "url": "https://github.com/advisories/GHSA-f886-m6hf-6m8v",
          "severity": "moderate",
          "cwe": [
            "CWE-400"
          ],
          "cvss": {
            "score": 6.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:N/A:H"
          },
          "range": ">=2.0.0 <2.0.3"
        },
        {
          "source": 1123896,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups",
          "url": "https://github.com/advisories/GHSA-3jxr-9vmj-r5cp",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": ">=2.0.0 <2.1.2"
        },
        {
          "source": 1123897,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups",
          "url": "https://github.com/advisories/GHSA-3jxr-9vmj-r5cp",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": "<1.1.16"
        },
        {
          "source": 1130588,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash",
          "url": "https://github.com/advisories/GHSA-mh99-v99m-4gvg",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<1.1.17"
        },
        {
          "source": 1130589,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash",
          "url": "https://github.com/advisories/GHSA-mh99-v99m-4gvg",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=2.0.0 <2.1.3"
        },
        {
          "source": 1130736,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation",
          "url": "https://github.com/advisories/GHSA-rgw5-rvv9-x895",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=2.0.0 <2.1.4"
        },
        {
          "source": 1130737,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation",
          "url": "https://github.com/advisories/GHSA-rgw5-rvv9-x895",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<1.1.18"
        },
        {
          "source": 1240100,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service",
          "url": "https://github.com/advisories/GHSA-q2hr-2g5m-vwhr",
          "severity": "moderate",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": "<1.1.21"
        },
        {
          "source": 1240101,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service",
          "url": "https://github.com/advisories/GHSA-q2hr-2g5m-vwhr",
          "severity": "moderate",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": ">=2.0.0 <2.1.7"
        },
        {
          "source": 1240104,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion",
          "url": "https://github.com/advisories/GHSA-qhr7-859c-m2p7",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-674"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<1.1.20"
        },
        {
          "source": 1240105,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion",
          "url": "https://github.com/advisories/GHSA-qhr7-859c-m2p7",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-674"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=2.0.0 <2.1.6"
        },
        {
          "source": 1240108,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion",
          "url": "https://github.com/advisories/GHSA-6j4f-fj2g-mc7p",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-674"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<1.1.19"
        },
        {
          "source": 1240109,
          "name": "brace-expansion",
          "dependency": "brace-expansion",
          "title": "brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion",
          "url": "https://github.com/advisories/GHSA-6j4f-fj2g-mc7p",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-674"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=2.0.0 <2.1.5"
        }
      ],
      "effects": [],
      "range": "<=1.1.20 || 2.0.0 - 2.1.6",
      "nodes": [
        "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion",
        "node_modules/brace-expansion",
        "node_modules/sucrase/node_modules/brace-expansion"
      ],
      "fixAvailable": true
    },
    "browserslist": {
      "name": "browserslist",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1153171,
          "name": "browserslist",
          "dependency": "browserslist",
          "title": "Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM",
          "url": "https://github.com/advisories/GHSA-c83g-rgw3-j3cx",
          "severity": "high",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<=4.28.6"
        },
        {
          "source": 1153172,
          "name": "browserslist",
          "dependency": "browserslist",
          "title": "Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)",
          "url": "https://github.com/advisories/GHSA-73wf-gq98-2v4g",
          "severity": "high",
          "cwe": [
            "CWE-248",
            "CWE-1321"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<=4.28.6"
        }
      ],
      "effects": [],
      "range": "<=4.28.6",
      "nodes": [
        "node_modules/browserslist"
      ],
      "fixAvailable": true
    },
    "flatted": {
      "name": "flatted",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1114526,
          "name": "flatted",
          "dependency": "flatted",
          "title": "flatted vulnerable to unbounded recursion DoS in parse() revive phase",
          "url": "https://github.com/advisories/GHSA-25h7-pfq9-p65f",
          "severity": "high",
          "cwe": [
            "CWE-674"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<3.4.0"
        },
        {
          "source": 1241196,
          "name": "flatted",
          "dependency": "flatted",
          "title": "Prototype Pollution via parse() in NodeJS flatted",
          "url": "https://github.com/advisories/GHSA-rf6f-7fwh-wjgh",
          "severity": "high",
          "cwe": [
            "CWE-915",
            "CWE-1321"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": "<=3.4.1"
        }
      ],
      "effects": [],
      "range": "<=3.4.1",
      "nodes": [
        "node_modules/flatted"
      ],
      "fixAvailable": true
    },
    "glob": {
      "name": "glob",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1109842,
          "name": "glob",
          "dependency": "glob",
          "title": "glob CLI: Command injection via -c/--cmd executes matches with shell:true",
          "url": "https://github.com/advisories/GHSA-5j98-mcp5-4vw2",
          "severity": "high",
          "cwe": [
            "CWE-78"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H"
          },
          "range": ">=10.2.0 <10.5.0"
        },
        {
          "source": 1244013,
          "name": "glob",
          "dependency": "glob",
          "title": "Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal",
          "url": "https://github.com/advisories/GHSA-3g3m-2fjr-6pw4",
          "severity": "moderate",
          "cwe": [
            "CWE-400"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=9.0.0 <=14.0.1"
        }
      ],
      "effects": [],
      "range": "9.0.0 - 14.0.1",
      "nodes": [
        "node_modules/sucrase/node_modules/glob"
      ],
      "fixAvailable": true
    },
    "js-yaml": {
      "name": "js-yaml",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1112715,
          "name": "js-yaml",
          "dependency": "js-yaml",
          "title": "js-yaml has prototype pollution in merge (<<)",
          "url": "https://github.com/advisories/GHSA-mh29-5h37-fv8m",
          "severity": "moderate",
          "cwe": [
            "CWE-1321"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N"
          },
          "range": ">=4.0.0 <4.1.1"
        },
        {
          "source": 1121860,
          "name": "js-yaml",
          "dependency": "js-yaml",
          "title": "JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases",
          "url": "https://github.com/advisories/GHSA-h67p-54hq-rp68",
          "severity": "moderate",
          "cwe": [
            "CWE-407"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": ">=4.0.0 <=4.1.1"
        },
        {
          "source": 1123911,
          "name": "js-yaml",
          "dependency": "js-yaml",
          "title": "js-yaml: YAML merge-key chains can force quadratic CPU consumption",
          "url": "https://github.com/advisories/GHSA-52cp-r559-cp3m",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=4.0.0 <4.3.0"
        },
        {
          "source": 1138115,
          "name": "js-yaml",
          "dependency": "js-yaml",
          "title": "JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported",
          "url": "https://github.com/advisories/GHSA-5p4m-2wfm-xmqj",
          "severity": "high",
          "cwe": [
            "CWE-407"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=4.0.0 <4.3.1"
        },
        {
          "source": 1193727,
          "name": "js-yaml",
          "dependency": "js-yaml",
          "title": "js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources",
          "url": "https://github.com/advisories/GHSA-2883-xcg3-v3hh",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=4.0.0 <4.3.2"
        }
      ],
      "effects": [],
      "range": "4.0.0 - 4.3.1",
      "nodes": [
        "node_modules/js-yaml"
      ],
      "fixAvailable": true
    },
    "minimatch": {
      "name": "minimatch",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1113459,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern",
          "url": "https://github.com/advisories/GHSA-3ppc-4f35-3m26",
          "severity": "high",
          "cwe": [
            "CWE-1333"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": "<3.1.3"
        },
        {
          "source": 1113465,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern",
          "url": "https://github.com/advisories/GHSA-3ppc-4f35-3m26",
          "severity": "high",
          "cwe": [
            "CWE-1333"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=9.0.0 <9.0.6"
        },
        {
          "source": 1113538,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments",
          "url": "https://github.com/advisories/GHSA-7r86-cg39-jmmj",
          "severity": "high",
          "cwe": [
            "CWE-407"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<3.1.3"
        },
        {
          "source": 1113544,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments",
          "url": "https://github.com/advisories/GHSA-7r86-cg39-jmmj",
          "severity": "high",
          "cwe": [
            "CWE-407"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=9.0.0 <9.0.7"
        },
        {
          "source": 1113546,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions",
          "url": "https://github.com/advisories/GHSA-23c5-xmqv-rm74",
          "severity": "high",
          "cwe": [
            "CWE-1333"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<3.1.4"
        },
        {
          "source": 1113552,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions",
          "url": "https://github.com/advisories/GHSA-23c5-xmqv-rm74",
          "severity": "high",
          "cwe": [
            "CWE-1333"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=9.0.0 <9.0.7"
        },
        {
          "source": 1244623,
          "name": "minimatch",
          "dependency": "minimatch",
          "title": "minimatch has potential denial of service via globparts amplification",
          "url": "https://github.com/advisories/GHSA-g3hv-75wg-m249",
          "severity": "moderate",
          "cwe": [
            "CWE-405"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=7.0.0 <11.0.1"
        }
      ],
      "effects": [
        "@typescript-eslint/typescript-estree"
      ],
      "range": "<=3.1.3 || 7.0.0 - 11.0.0",
      "nodes": [
        "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch",
        "node_modules/minimatch",
        "node_modules/sucrase/node_modules/minimatch"
      ],
      "fixAvailable": true
    },
    "nanoid": {
      "name": "nanoid",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1138811,
          "name": "nanoid",
          "dependency": "nanoid",
          "title": "nanoid: non-secure generators can loop indefinitely with negative size",
          "url": "https://github.com/advisories/GHSA-28wg-ghj8-5hjv",
          "severity": "high",
          "cwe": [
            "CWE-835"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<3.3.16"
        },
        {
          "source": 1139427,
          "name": "nanoid",
          "dependency": "nanoid",
          "title": "nanoid: custom generators can loop indefinitely when size is zero",
          "url": "https://github.com/advisories/GHSA-2v37-7h3g-55p8",
          "severity": "high",
          "cwe": [
            "CWE-835"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<3.3.18"
        },
        {
          "source": 1153189,
          "name": "nanoid",
          "dependency": "nanoid",
          "title": "nanoid: Integer Overflow or Wraparound",
          "url": "https://github.com/advisories/GHSA-xwg4-73v4-xw9w",
          "severity": "high",
          "cwe": [
            "CWE-190"
          ],
          "cvss": {
            "score": 7.4,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N"
          },
          "range": "<3.3.12"
        }
      ],
      "effects": [],
      "range": "<=3.3.17",
      "nodes": [
        "node_modules/nanoid"
      ],
      "fixAvailable": true
    },
    "next": {
      "name": "next",
      "severity": "critical",
      "isDirect": true,
      "via": [
        {
          "source": 1097295,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Server-Side Request Forgery in Server Actions",
          "url": "https://github.com/advisories/GHSA-fr5h-rqp8-mj6g",
          "severity": "high",
          "cwe": [
            "CWE-918"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": ">=13.4.0 <14.1.1"
        },
        {
          "source": 1099638,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Cache Poisoning",
          "url": "https://github.com/advisories/GHSA-gp8f-8m3g-qvj9",
          "severity": "high",
          "cwe": [
            "CWE-349",
            "CWE-639"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=14.0.0 <14.2.10"
        },
        {
          "source": 1100421,
          "name": "next",
          "dependency": "next",
          "title": "Denial of Service condition in Next.js image optimization",
          "url": "https://github.com/advisories/GHSA-g77x-44xx-532m",
          "severity": "moderate",
          "cwe": [
            "CWE-674"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=10.0.0 <14.2.7"
        },
        {
          "source": 1101438,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Allows a Denial of Service (DoS) with Server Actions",
          "url": "https://github.com/advisories/GHSA-7m27-7ghc-44w9",
          "severity": "moderate",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": ">=14.0.0 <14.2.21"
        },
        {
          "source": 1105461,
          "name": "next",
          "dependency": "next",
          "title": "Information exposure in Next.js dev server due to lack of origin verification",
          "url": "https://github.com/advisories/GHSA-3h52-269p-cp9r",
          "severity": "low",
          "cwe": [
            "CWE-1385"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0 <14.2.30"
        },
        {
          "source": 1107226,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Affected by Cache Key Confusion for Image Optimization API Routes",
          "url": "https://github.com/advisories/GHSA-g5qg-72qw-gw5v",
          "severity": "moderate",
          "cwe": [
            "CWE-524"
          ],
          "cvss": {
            "score": 6.2,
            "vectorString": "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": ">=0.9.9 <14.2.31"
        },
        {
          "source": 1107420,
          "name": "next",
          "dependency": "next",
          "title": "Next.js authorization bypass vulnerability",
          "url": "https://github.com/advisories/GHSA-7gfc-8cq8-jh5f",
          "severity": "high",
          "cwe": [
            "CWE-285",
            "CWE-863"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": ">=9.5.5 <14.2.15"
        },
        {
          "source": 1107512,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Improper Middleware Redirect Handling Leads to SSRF",
          "url": "https://github.com/advisories/GHSA-4342-x723-ch2f",
          "severity": "moderate",
          "cwe": [
            "CWE-918"
          ],
          "cvss": {
            "score": 6.5,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:L/A:N"
          },
          "range": ">=0.9.9 <14.2.32"
        },
        {
          "source": 1107513,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Content Injection Vulnerability for Image Optimization",
          "url": "https://github.com/advisories/GHSA-xv57-4mr9-wg8v",
          "severity": "moderate",
          "cwe": [
            "CWE-20"
          ],
          "cvss": {
            "score": 4.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N"
          },
          "range": ">=0.9.9 <14.2.31"
        },
        {
          "source": 1108291,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Race Condition to Cache Poisoning",
          "url": "https://github.com/advisories/GHSA-qpjv-v59x-3qc4",
          "severity": "low",
          "cwe": [
            "CWE-362"
          ],
          "cvss": {
            "score": 3.7,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N"
          },
          "range": ">=0.9.9 <14.2.24"
        },
        {
          "source": 1111391,
          "name": "next",
          "dependency": "next",
          "title": "Next Vulnerable to Denial of Service with Server Components",
          "url": "https://github.com/advisories/GHSA-mwv6-3258-q52c",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-502",
            "CWE-1395"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=13.3.0 <14.2.34"
        },
        {
          "source": 1112182,
          "name": "next",
          "dependency": "next",
          "title": "Next has a Denial of Service with Server Components - Incomplete Fix Follow-Up",
          "url": "https://github.com/advisories/GHSA-5j59-xgg2-r9c4",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-502",
            "CWE-1395"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=13.3.1-canary.0 <14.2.35"
        },
        {
          "source": 1112593,
          "name": "next",
          "dependency": "next",
          "title": "Next.js self-hosted applications vulnerable to DoS via Image Optimizer remotePatterns configuration",
          "url": "https://github.com/advisories/GHSA-9g9p-9gw9-jx7f",
          "severity": "moderate",
          "cwe": [
            "CWE-400",
            "CWE-770"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=10.0.0 <15.5.10"
        },
        {
          "source": 1112653,
          "name": "next",
          "dependency": "next",
          "title": "Next.js HTTP request deserialization can lead to DoS when using insecure React Server Components",
          "url": "https://github.com/advisories/GHSA-h25m-26qc-wcjf",
          "severity": "high",
          "cwe": [
            "CWE-400",
            "CWE-502"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=13.0.0 <15.0.8"
        },
        {
          "source": 1113689,
          "name": "next",
          "dependency": "next",
          "title": "Authorization Bypass in Next.js Middleware",
          "url": "https://github.com/advisories/GHSA-f82v-jwr5-mffw",
          "severity": "critical",
          "cwe": [
            "CWE-285",
            "CWE-863"
          ],
          "cvss": {
            "score": 9.1,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"
          },
          "range": ">=14.0.0 <14.2.25"
        },
        {
          "source": 1114897,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: HTTP request smuggling in rewrites",
          "url": "https://github.com/advisories/GHSA-ggv3-7p47-pfv8",
          "severity": "moderate",
          "cwe": [
            "CWE-444"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=9.5.0 <15.5.13"
        },
        {
          "source": 1114940,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Unbounded next/image disk cache growth can exhaust storage",
          "url": "https://github.com/advisories/GHSA-3x4c-7xq6-9pq8",
          "severity": "moderate",
          "cwe": [
            "CWE-400"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=10.0.0 <15.5.14"
        },
        {
          "source": 1116376,
          "name": "next",
          "dependency": "next",
          "title": "Next.js has a Denial of Service with Server Components",
          "url": "https://github.com/advisories/GHSA-q4gf-8mx6-v5v3",
          "severity": "high",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=13.0.0 <15.5.15"
        },
        {
          "source": 1117931,
          "name": "next",
          "dependency": "next",
          "title": "Next.js Vulnerable to Denial of Service with Server Components",
          "url": "https://github.com/advisories/GHSA-8h8q-6873-q5fj",
          "severity": "high",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=13.0.0 <15.5.16"
        },
        {
          "source": 1118942,
          "name": "next",
          "dependency": "next",
          "title": "Next.js's Middleware / Proxy redirects can be cache-poisoned",
          "url": "https://github.com/advisories/GHSA-3g8h-86w9-wvmq",
          "severity": "low",
          "cwe": [
            "CWE-349"
          ],
          "cvss": {
            "score": 3.7,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": ">=12.2.0 <15.5.16"
        },
        {
          "source": 1118944,
          "name": "next",
          "dependency": "next",
          "title": "Next.js vulnerable to cross-site scripting in App Router applications using CSP nonces",
          "url": "https://github.com/advisories/GHSA-ffhc-5mcf-pf4q",
          "severity": "moderate",
          "cwe": [
            "CWE-79"
          ],
          "cvss": {
            "score": 4.7,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:C/C:L/I:L/A:N"
          },
          "range": ">=13.4.0 <15.5.16"
        },
        {
          "source": 1118946,
          "name": "next",
          "dependency": "next",
          "title": "Next.js vulnerable to cache poisoning via collisions in React Server Component cache-busting",
          "url": "https://github.com/advisories/GHSA-vfv6-92ff-j949",
          "severity": "low",
          "cwe": [
            "CWE-328"
          ],
          "cvss": {
            "score": 3.7,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N"
          },
          "range": ">=13.4.6 <15.5.16"
        },
        {
          "source": 1118948,
          "name": "next",
          "dependency": "next",
          "title": "Next.js has cross-site scripting in beforeInteractive scripts with untrusted input",
          "url": "https://github.com/advisories/GHSA-gx5p-jg67-6x7h",
          "severity": "moderate",
          "cwe": [
            "CWE-79"
          ],
          "cvss": {
            "score": 6.1,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N"
          },
          "range": ">=13.0.0 <15.5.16"
        },
        {
          "source": 1118952,
          "name": "next",
          "dependency": "next",
          "title": "Next.js has a Denial of Service in the Image Optimization API",
          "url": "https://github.com/advisories/GHSA-h64f-5h5j-jqjh",
          "severity": "moderate",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=10.0.0 <15.5.16"
        },
        {
          "source": 1118954,
          "name": "next",
          "dependency": "next",
          "title": "Next.js vulnerable to server-side request forgery in applications using WebSocket upgrades",
          "url": "https://github.com/advisories/GHSA-c4j6-fc7j-m34r",
          "severity": "high",
          "cwe": [
            "CWE-918"
          ],
          "cvss": {
            "score": 8.6,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N"
          },
          "range": ">=13.4.13 <15.5.16"
        },
        {
          "source": 1118962,
          "name": "next",
          "dependency": "next",
          "title": "Next.js has a Middleware / Proxy bypass in Pages Router applications using i18n",
          "url": "https://github.com/advisories/GHSA-36qx-fr4f-26g5",
          "severity": "high",
          "cwe": [
            "CWE-863"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": ">=12.2.0 <15.5.16"
        },
        {
          "source": 1124172,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Denial of Service in App Router using Server Actions",
          "url": "https://github.com/advisories/GHSA-m99w-x7hq-7vfj",
          "severity": "high",
          "cwe": [
            "CWE-834"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0.0 <15.5.21"
        },
        {
          "source": 1124187,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Cache confusion of response bodies for requests with bodies",
          "url": "https://github.com/advisories/GHSA-68g3-v927-f742",
          "severity": "moderate",
          "cwe": [
            "CWE-524"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0.0 <15.5.21"
        },
        {
          "source": 1124189,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Cache confusion of response bodies for requests with bodies containing invalid UTF-8 byte sequences",
          "url": "https://github.com/advisories/GHSA-4633-3j49-mh5q",
          "severity": "moderate",
          "cwe": [
            "CWE-116"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0.0 <15.5.21"
        },
        {
          "source": 1124191,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Unbounded Server Action payload in Edge runtime",
          "url": "https://github.com/advisories/GHSA-4c39-4ccg-62r3",
          "severity": "moderate",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0.0 <15.5.21"
        },
        {
          "source": 1124193,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Server-Side Request Forgery in rewrites via attacker-controlled destination hostname",
          "url": "https://github.com/advisories/GHSA-p9j2-gv94-2wf4",
          "severity": "high",
          "cwe": [
            "CWE-918"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=12.0.0 <15.5.21"
        },
        {
          "source": 1124197,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Unauthenticated disclosure of internal Server Function endpoints",
          "url": "https://github.com/advisories/GHSA-955p-x3mx-jcvp",
          "severity": "moderate",
          "cwe": [
            "CWE-201"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0.0 <15.5.21"
        },
        {
          "source": 1193677,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Unauthenticated Remote Code Execution on windows-hosted servers",
          "url": "https://github.com/advisories/GHSA-p293-qw3h-jr36",
          "severity": "critical",
          "cwe": [
            "CWE-22"
          ],
          "cvss": {
            "score": 9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H"
          },
          "range": ">=13.4.0 <15.5.24"
        },
        {
          "source": 1193733,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used",
          "url": "https://github.com/advisories/GHSA-2xp9-vwfh-vxw4",
          "severity": "critical",
          "cwe": [
            "CWE-1395"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=10.0.0 <15.5.24"
        },
        {
          "source": 1242817,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Unauthenticated Remote Code Execution in Image Optimization API when SVG files are used",
          "url": "https://github.com/advisories/GHSA-2464-fhr4-w9xw",
          "severity": "critical",
          "cwe": [
            "CWE-1395"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=10.0.0 <=15.5.27"
        },
        {
          "source": 1242819,
          "name": "next",
          "dependency": "next",
          "title": "Next.js: Denial of Service in App Router using Server Actions",
          "url": "https://github.com/advisories/GHSA-p3m5-59mp-jv5r",
          "severity": "high",
          "cwe": [
            "CWE-770"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": ">=13.0.0 <=15.5.27"
        },
        "postcss"
      ],
      "effects": [],
      "range": "0.9.9 - 16.3.0-preview.10",
      "nodes": [
        "node_modules/next"
      ],
      "fixAvailable": {
        "name": "next",
        "version": "14.2.35",
        "isSemVerMajor": false
      }
    },
    "picomatch": {
      "name": "picomatch",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1115549,
          "name": "picomatch",
          "dependency": "picomatch",
          "title": "Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching",
          "url": "https://github.com/advisories/GHSA-3v7f-55p6-f55p",
          "severity": "moderate",
          "cwe": [
            "CWE-1321"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N"
          },
          "range": "<2.3.2"
        },
        {
          "source": 1115551,
          "name": "picomatch",
          "dependency": "picomatch",
          "title": "Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching",
          "url": "https://github.com/advisories/GHSA-3v7f-55p6-f55p",
          "severity": "moderate",
          "cwe": [
            "CWE-1321"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N"
          },
          "range": ">=4.0.0 <4.0.4"
        },
        {
          "source": 1115552,
          "name": "picomatch",
          "dependency": "picomatch",
          "title": "Picomatch has a ReDoS vulnerability via extglob quantifiers",
          "url": "https://github.com/advisories/GHSA-c2c7-rcm5-vvqj",
          "severity": "high",
          "cwe": [
            "CWE-1333"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<2.3.2"
        },
        {
          "source": 1115554,
          "name": "picomatch",
          "dependency": "picomatch",
          "title": "Picomatch has a ReDoS vulnerability via extglob quantifiers",
          "url": "https://github.com/advisories/GHSA-c2c7-rcm5-vvqj",
          "severity": "high",
          "cwe": [
            "CWE-1333"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=4.0.0 <4.0.4"
        }
      ],
      "effects": [],
      "range": "<=2.3.1 || 4.0.0 - 4.0.3",
      "nodes": [
        "node_modules/picomatch",
        "node_modules/tinyglobby/node_modules/picomatch"
      ],
      "fixAvailable": true
    },
    "postcss": {
      "name": "postcss",
      "severity": "high",
      "isDirect": true,
      "via": [
        {
          "source": 1117015,
          "name": "postcss",
          "dependency": "postcss",
          "title": "PostCSS has XSS via Unescaped </style> in its CSS Stringify Output",
          "url": "https://github.com/advisories/GHSA-qx2v-qp2m-jg93",
          "severity": "moderate",
          "cwe": [
            "CWE-79"
          ],
          "cvss": {
            "score": 6.1,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N"
          },
          "range": "<8.5.10"
        },
        {
          "source": 1124252,
          "name": "postcss",
          "dependency": "postcss",
          "title": "PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments",
          "url": "https://github.com/advisories/GHSA-6g55-p6wh-862q",
          "severity": "high",
          "cwe": [
            "CWE-22",
            "CWE-200"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": "<=8.5.11"
        },
        {
          "source": 1130709,
          "name": "postcss",
          "dependency": "postcss",
          "title": "PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset",
          "url": "https://github.com/advisories/GHSA-fxqj-rqcc-2cmp",
          "severity": "moderate",
          "cwe": [
            "CWE-22",
            "CWE-200"
          ],
          "cvss": {
            "score": 0,
            "vectorString": null
          },
          "range": "<=8.5.22"
        },
        {
          "source": 1139510,
          "name": "postcss",
          "dependency": "postcss",
          "title": "PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure",
          "url": "https://github.com/advisories/GHSA-r28c-9q8g-f849",
          "severity": "high",
          "cwe": [
            "CWE-22"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
          },
          "range": "<=8.5.17"
        }
      ],
      "effects": [
        "next"
      ],
      "range": "<=8.5.22",
      "nodes": [
        "node_modules/next/node_modules/postcss",
        "node_modules/postcss"
      ],
      "fixAvailable": {
        "name": "next",
        "version": "14.2.35",
        "isSemVerMajor": false
      }
    },
    "postcss-selector-parser": {
      "name": "postcss-selector-parser",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1153170,
          "name": "postcss-selector-parser",
          "dependency": "postcss-selector-parser",
          "title": "postcss-selector-parser allows denial of service through uncontrolled AST recursion",
          "url": "https://github.com/advisories/GHSA-w9m9-85wc-3x92",
          "severity": "low",
          "cwe": [
            "CWE-404"
          ],
          "cvss": {
            "score": 4.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:N/A:L"
          },
          "range": ">=6.1.0 <6.1.3"
        },
        {
          "source": 1243379,
          "name": "postcss-selector-parser",
          "dependency": "postcss-selector-parser",
          "title": "PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion",
          "url": "https://github.com/advisories/GHSA-rj75-hqrm-r3gf",
          "severity": "moderate",
          "cwe": [
            "CWE-400",
            "CWE-407"
          ],
          "cvss": {
            "score": 5.9,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": "<6.1.5"
        }
      ],
      "effects": [],
      "range": "<=6.1.4",
      "nodes": [
        "node_modules/postcss-selector-parser"
      ],
      "fixAvailable": true
    },
    "source-map-js": {
      "name": "source-map-js",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1241209,
          "name": "source-map-js",
          "dependency": "source-map-js",
          "title": "source-map-js allows event-loop denial of service through indexed source-map section offsets",
          "url": "https://github.com/advisories/GHSA-68fv-2mgg-jv7q",
          "severity": "high",
          "cwe": [
            "CWE-1284"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
          },
          "range": ">=1.0.0 <1.2.2"
        }
      ],
      "effects": [],
      "range": "1.0.0 - 1.2.1",
      "nodes": [
        "node_modules/source-map-js"
      ],
      "fixAvailable": true
    },
    "yaml": {
      "name": "yaml",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1115556,
          "name": "yaml",
          "dependency": "yaml",
          "title": "yaml is vulnerable to Stack Overflow via deeply nested YAML collections",
          "url": "https://github.com/advisories/GHSA-48c2-rrv3-qjmp",
          "severity": "moderate",
          "cwe": [
            "CWE-674"
          ],
          "cvss": {
            "score": 4.3,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L"
          },
          "range": ">=2.0.0 <2.8.3"
        }
      ],
      "effects": [],
      "range": "2.0.0 - 2.8.2",
      "nodes": [
        "node_modules/yaml"
      ],
      "fixAvailable": true
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 3,
      "high": 12,
      "critical": 1,
      "total": 16
    },
    "dependencies": {
      "prod": 23,
      "dev": 394,
      "optional": 35,
      "peer": 0,
      "peerOptional": 0,
      "total": 425
    }
  }
}
```

</details>
