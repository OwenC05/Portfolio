# Immersive portfolio work log

## Checkpoint: 15 November 2026

The work is an eye-level, fixed-position after-hours studio portfolio. Projects open from monitor surfaces into immediate accessible HTML reading panels. The warm room incorporates the user's compact pastel keyboard, audio equipment, coffee, snowboard, white PC, and right-side music controller/electronic drums.

This checkpoint preserves the implementation, editable asset sources, generation provenance, failed and accepted pilot versions, plans, technical tests, actual screenshots and independent reviews. It is work in progress, not a finished-product release.

### Verified state

- The Blender door/lamp pilot and bounded runtime tuning received independent technical and Claude visual approval.
- Full-room M1 baseline and proposal v02 GLBs fix the rejected v01 UV inversion. The real loader/binder/builder rendered 22 isolated desktop/mobile captures with zero recorded page errors or warnings and stable source hashes. These images use provisional lighting and many equipment proxies; they omit product chrome.
- Independent Claude accepted M1 direction with explicit geometry/visibility conditions. Root choices are in `scene-coordination/full-kit-m1-root-decisions.md`.
- Independent technical review found FKT-1: runtime/CLI inventory-hash and final-stage validation parity. The repair passed72 author checks and independent rereview with24 focused probes plus9 CLI checks. Root verified the four current implementation/test hashes against the APPROVE report; FKT-1 is closed. Browser/production/full-room acceptance remains open.
- M2 workstation proposal v02 now includes editable Blender sources, its authoring script, the exported GLB, paired manifest and independent technical handoff. The exact installed loader/binder/builder passed bounded identity, binding and two-load cleanup checks; see `scene-m2-technical-check.md`.
- Root captured 23 M2 scene images and 10 static composites using the actual portfolio UI. There were no capture failures, page errors or source-hash drift. One unresolved console 404 recurred in eight raw capture records; these are not clean-console or production-integration acceptance. Evidence is `.omx/context/full-kit-m2-runtime-capture-v01.json` and `.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v02/`.
- Worker model/effort selection now follows `.omx/plans/portfolio-worker-model-routing.md`, as explicitly requested by the user. Claude owns design; Codex owns technical work.

### Next work

1. Independent Claude review of the held M2 workstation and captured phone candidate (FOV74, yaw -13.5, pitch -7), including PC visibility beneath actual UI chrome. Resolve the stage planning discrepancy of 23 primitive instances against a ceiling of 20; the final renderer budget is unchanged.
2. Finish M3-M6 equipment and assembly; 51 proxy leaves and two missing inventory IDs remain. Retain the independent critic's C1-C3 and visibility conditions.
3. Integrate the approved full room, then run final browser/input/lifecycle/performance/production and independent review gates. The current production scene is still the pilot path.

The user-approved WSL/agentmemory maintenance completed with a verified stopped-store backup and matching known-memory recall. The6GB cap is active and the worker hold is released; see `scene-coordination/wsl-maintenance-20261115.md`. State RSS was about3.13GiB shortly after restart,4.23GiB at30 minutes and3.52GiB at60 minutes. Swap usage reached994MiB at60 minutes; the service remained active and the monitor exited. Keep the6GB cap: the hoped-for1-1.5GB settling point was not observed. Global machine credentials, raw recalled memory data, runtime caches and service state are not portfolio source artifacts.

### Tracking policy

Keep implementation, dependency lockfile, task plans, asset-authoring scripts, editable `.blend` sources, runtime `.glb` exports, provenance, relevant screenshots and review evidence in Git. Keep generated compiler caches, browser console scratch logs, hook/session runtime state, dependencies and environment secrets ignored.

The user requested visible commits and pushes on 15 November 2026. Four commits had accumulated only on local `main`: `b55957e` (initial studio checkpoint), `711c7ba` (verified WSL restart), `a137adc` (FKT-1 fix and independent approval), and `c767267` (30-minute memory measurement). Work now continues on `feature/studio-v2-after-hours`, preserving those commits without rewriting them. Push coherent checkpoints to that branch and maintain a draft PR against `main`; only merge after the outstanding product and review gates pass. Root owns the shared Git index, commits, branch changes and pushes. See `CONTRIBUTING.md` for the workflow.

Pre-publication checks for this checkpoint: independent bounded secret/path/ignore audit found no material blocker; TypeScript checking passed with incremental output disabled; all 153 controller/pilot/full-kit CPU tests passed; M2 capture scripts passed syntax checks and the pinned M2 harness preparation check. All 33 runtime/composite images match their recorded SHA-256 hashes. A fresh `npm run lint` fails because `@typescript-eslint/eslint-plugin` is missing; do not treat supplemental checks as a replacement. No final production build or full-room acceptance is claimed.

GitHub Actions now defines separate TypeScript, studio CPU tests, configured ESLint and production-build results for PRs targeting `main` and pushes to `main`. It uses the committed lockfile, Node24, immutable action revisions and read-only repository permissions. The build skips its duplicate lint phase because ESLint has its own failing gate. First hosted run43719483101 at commit8d54193 passed TypeScript, studio CPU tests and the production build; ESLint failed on the same missing plugin. See `scene-coordination/ci-checkpoint-20261115.md`. The overall CI run is not green, and branch-protection enforcement has not been configured or verified.

The M2 budget reconciliation also identified M1 and later-stage representation mismatches with the original merge-based estimates. `scene-coordination/m2-stage-budget-reconciliation.md` accounts for them. An independent Codex technical review is preparing a whole-room forecast revision path; the hard200-call/200k-triangle/1.5MB gates remain unchanged and no stage exception has yet been approved.
