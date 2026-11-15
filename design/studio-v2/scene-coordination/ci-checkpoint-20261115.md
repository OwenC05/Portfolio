# First hosted CI checkpoint

15 November 2026. [Draft PR #2](https://github.com/OwenC05/Portfolio/pull/2), source commit `8d541937a80cff129a96c42b5955e633f0fdc25e`, [GitHub Actions run 43719483101](https://github.com/OwenC05/Portfolio/actions/runs/43719483101).

| Check | Hosted result |
| --- | --- |
| TypeScript | Passed |
| Studio controller, pilot and full-kit CPU tests | Passed |
| Production build | Passed; duplicate built-in lint step disabled because lint runs separately |
| Configured ESLint | Failed: cannot load `@typescript-eslint/eslint-plugin` referenced by `.eslintrc.json` |

Root read the actual hosted job results and the ESLint failure log. Each job installed the committed dependencies with `npm ci`; no local dependency state was assumed. The same three-suite command passed153 tests locally with zero failures or skips. Passing the production build establishes compilation for the current pilot implementation, not completed full-room integration or final browser/performance acceptance.

The missing plugin is an existing manifest/configuration mismatch. Preserve the configured rules and failing result while preparing the smallest compatible dependency repair. Do not hide it with a reduced configuration or a successful supplemental check. The repository's explicit-addition rule applies before changing dependencies.

The hosted install also reported16 dependency advisories (3 moderate,12 high,1 critical). Those aggregate counts do not identify production exploitability. Dependency triage remains separate from the minimal lint repair; no forced audit fix or package upgrade was performed.

Branch protection has not been configured or verified. The PR remains a draft; a workflow file alone does not enforce merge policy. All further project checkpoints continue on the feature branch and are pushed without changing `main`.
