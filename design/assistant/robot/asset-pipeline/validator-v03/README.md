# Export-validator repair v03

18 November 2026. Root-authored repair of the two false accepts in the independent [v02 technical review](../../review/build-v02/technical/review.md). This folder contains versioned validator copies, not a new asset export or an asset-acceptance verdict. Independent Codex recheck remains pending.

The validator now rejects every present node skin reference, including `skin: 0`, and requires finite, ordered three-component POSITION bounds. The existing geometry, pose, material and envelope checks remain intact. The approved asset did not contain either malformed input.

## Evidence

`before-checks.json` records the regression-first run: 2/11 assertions passed; both malformed GLBs were incorrectly accepted. `after-checks.json` records 11/11 passing assertions: the valid v02 GLB still passes, both malformed GLBs reject, and the adjacent missing/null/short/inverted/nonfinite bounds and null-skin document checks reject. Both receipts confirm all eight original inputs stayed byte-identical. Private test copies were removed.

The after receipt pins both repaired scripts and the test runner. Scoped ESLint completed with exit 0 on all three files. These checks cover the two known format defects and nearby guards, not comprehensive glTF validation, GPU behavior, visual acceptance or production readiness.

Run from the assistant checkout:

```powershell
node design/assistant/robot/asset-pipeline/validator-v03/verify.mjs after
node node_modules/eslint/bin/eslint.js design/assistant/robot/asset-pipeline/validator-v03/validate_asset.mjs design/assistant/robot/asset-pipeline/validator-v03/validate_contract.mjs design/assistant/robot/asset-pipeline/validator-v03/verify.mjs --max-warnings 0
```

The runner uses private copies under `.omx/artifacts`; it does not write into frozen candidate directories. `before` labels a receipt using the scripts currently present; it does not restore historical code. Preserve the existing before receipt.

## Future candidate use

This remains a selected-A/v02-derived reference validator. Its established interface reads paired candidate files and writes profile, validation and manifest files beside itself. Copy the two validator scripts only into a **new candidate directory** with its paired inputs. The asset author must version candidate identity, provenance and builder metadata alongside the profile before reuse. Do not run it in a frozen historical directory or treat its inherited candidate metadata as the identity of a different asset.

Runtime interaction and resource cleanup are a separate active Codex task; this repair changes no application files, approved GLB, Blender source, pose data or public asset.
