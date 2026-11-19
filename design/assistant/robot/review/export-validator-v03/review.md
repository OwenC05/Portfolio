# Export-validator v03 repair recheck — bounded PASS

18 November 2026. Independent Codex review of root's repair; I did not author it. **PASS for the two known export-validator false accepts and the documented adjacent accessor guards.** No new blocking defect was found in this bounded change. This is not a general glTF-validator certification, new asset export, renewed asset/appearance acceptance or production approval.

Only this new `review/export-validator-v03/` directory received writes. Root's scripts/receipts, the frozen v02 scripts/asset/evidence, the previous independent review and the published v03 GLB remain unchanged. No root `verify.mjs` or old review probe was run in place.

## Findings disposition

The retained P2 in `review/build-v02/technical/review.md:13` demonstrated two malformed private GLBs being accepted. Both are **closed for these repaired scripts**. The frozen v02 scripts still exhibit the historical defects and remain frozen.

| Original defect / location in repaired source | Independent result |
| --- | --- |
| Dangling `skin:0`; `validate_contract.mjs:14`, `validate_asset.mjs:36` | The all-node guard and binding guard require `skin === undefined`; zero, null and other present falsy references cannot bypass them. A full private GLB with `APA_body_cap.skin=0` rejects with the intended `Skin references are not allowed` assertion. |
| Missing POSITION min/max; `validate_contract.mjs:19–20`, decoded comparison at `:25` | Every primitive's POSITION accessor must have finite three-component bounds with min ≤ max on every axis, before decoded extrema comparison. Deleting both bounds from the body-cap POSITION accessor rejects with the intended `finite vector 3` assertion. |
| Adjacent optional bounds; `validate_contract.mjs:25` | Changing the old truthy test to `!== undefined` ensures supplied null/zero/false/empty-string bounds are checked and rejected. Absent optional NORMAL bounds and exact one-sided/both-sided bounds remain valid. Supplied malformed or incorrect extrema reject. |

The validator's asset logic differs from frozen v02 only in its skin-reference assertion. The helper definitions and entire runtime/pose guard are unchanged; document changes add all-node skin absence and required POSITION bounds, and accessor comparison changes the presence condition. [source-comparison.json](source-comparison.json) records these comparisons. The numerical geometry, material and pose checks were not refactored.

## Independent controls and old-source sensitivity

The private [probe.mjs](probe.mjs) uses the same actual `APA_body_cap` mutations documented in the frozen independent review. The old review's runner writes to its own historical directory, so I did not execute it; this probe instead copies the paired inputs and **byte-identical actual old/current scripts** into newly created directories under this review. Each full case has a fresh directory and cannot inherit a prior PASS report. Valid controls use the exact original v02 bytes; malformed copies change JSON metadata while preserving BIN bytes.

| Full validator input | Frozen v02 exit / output | Repaired exit / output |
| --- | --- | --- |
| Exact valid v02 GLB | **0**, offline PASS | **0**, offline PASS |
| Body-cap node `skin:0`, no skin table | **0**, false offline PASS | **1**, skin-reference assertion; no validation report generated |
| Body-cap POSITION min/max omitted | **0**, false offline PASS | **1**, finite-vector assertion; no validation report generated |

All six observations match their specified roles. The two old invalid accepts are **sensitivity evidence**, not acceptance of malformed assets. The two current nonzero child exits are expected rejections, not command failures. [full-results.json](full-results.json) pins every private input and executed script, records exact child argv and duration, and links the captured stdout/stderr. Private generated profiles/manifests/validation reports remain in the named private directories for inspection.

The additional **34 document/accessor checks** all match expectations: 33 current controls plus one old optional-null false-accept sensitivity control. They use actual GLB metadata and independently decoded NORMAL floats. Current cases cover valid metadata; skin values `0`, `null`, `false`, empty string and `1`; missing/single-null/short/long/nonfinite/inverted POSITION bounds; optional NORMAL bounds absent or exactly supplied; and each optional min/max supplied as null, zero, false, empty string, short array, nonfinite vector or incorrect extrema. [guard-results.json](guard-results.json). Nonfinite direct-object tests check the guard surface; ordinary JSON cannot encode NaN/Infinity.

These tests exercise the actual exported functions and full candidate-directory scripts, not a duplicate validator. They do not exhaust every malformed glTF field, accessor layout, numeric tolerance edge or future candidate shape.

## Root tests and documented scope

Root's frozen receipts accurately record **2/11 assertions passing before** and **11/11 after**, including a valid full-GLB control, both malformed full-GLB controls, and nearby document guards. The original eight input hashes match between receipts and match the files read here; the after receipt's three source pins also match the expected current scripts. The valid control prevents an unrelated universal failure from masquerading as successful rejection. This review additionally verifies the intended rejection messages and extends coverage to optional bounds, which the root runner's eleven cases do not directly test.

`verify.mjs` uses the scripts currently beside it: its `before` argument labels an output receipt and **does not restore old code**. I used the actual frozen old sources for sensitivity, and never overwrote either root receipt.

The README's reference-validator scope is accurate. `validate_asset.mjs:8–12` reads paired files beside itself and writes candidate receipts there; `:123` retains selected-A/v02 identity, provenance and builder metadata. This inherited metadata is not evidence for an arbitrary future asset. As documented at `README.md:24`, future reuse requires a **new candidate directory**, paired inputs and versioned candidate identity/provenance/builder metadata as well as its profile. Merely swapping a GLB is not the documented workflow. No general CLI, new export or production-acceptance claim was introduced.

## Exact pins and commands

[source-before.json](source-before.json) and [source-after.json](source-after.json) record **22 tracked inputs, all byte-identical before/after**, including current scripts/docs/receipts, all eight paired original inputs, original manifest/validation/README, the prior independent review/probe/evidence, and the published GLB.

| Source / payload | SHA256 |
| --- | --- |
| Current `validate_asset.mjs` | `ba1990472d6697c3efc89b3930c37ba123313c4340ff2af9a0460ceb028e8e59` |
| Current `validate_contract.mjs` | `7331dbc75d24aeae8553922f50a4ebcd31bd3ed945d3617bbfbb2422b5e32c8e` |
| Current `verify.mjs` | `4e359632c83bc6699d0c485978c8af3afaf63cec5f6a122a6a0c3195abb4f430` |
| Frozen v02 `validate_asset.mjs` | `dc1231aa8c824a184582a69fd6b7d7603c2de979ff5e05e6421a3e2ace5ea0ad` |
| Frozen v02 `validate_contract.mjs` | `b65ea4dbf9dcd034791b53203d41c98de5d94abaccffef0fb0aca3e4b13b3a87` |
| Tested v02 GLB | `bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270` |
| Unchanged published v03 GLB | `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12` |

From the repository root:

```powershell
node design/assistant/robot/review/export-validator-v03/probe.mjs
node node_modules/eslint/bin/eslint.js design/assistant/robot/asset-pipeline/validator-v03/validate_asset.mjs design/assistant/robot/asset-pipeline/validator-v03/validate_contract.mjs design/assistant/robot/asset-pipeline/validator-v03/verify.mjs design/assistant/robot/review/export-validator-v03/probe.mjs --max-warnings 0
```

Both commands exit **0** under Node `v24.21.0`; ESLint emits no diagnostics. [checks.json](checks.json) records commands/results; [summary.json](summary.json) reports six full controls and 34 guard controls with no unmet expectations. A rerun creates additional private case directories only here. The full-validator controls necessarily execute the existing unchanged pose checks on their private inputs; no separate broad resampling campaign was performed.

No application or durable test changes, old evidence edits, Blender, asset generation, build/server/browser, Git, dependency/config/hook operation, credential use or full assistant/scene suite was performed. Root retains future candidate reuse, any further repairs and final integration; actual Claude retains design/visual authority. This review closes only the bounded validator repair described above.
