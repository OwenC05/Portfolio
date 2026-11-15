# M4 guard repair: exact provenance and structured failures

15 November 2026. Root authorizes the two bounded technical corrections identified in the independent [guard review](m4-transition-guard-independent-review.md), SHA256 `f46c07f30991c0e65b0bd104e381c1b1b6919e772058d27b7e641c437f58dcac`. Current helper is not approved. Its exact pre-change bytes and tests are recoverable from pushed commit `fbe08dae8bbf3f565382d804adafc7dec162563a`.

## Exact first M4 v01 provenance amendment

Root accepts actual Claude's authored intent in [the request](m4-scene-provenance-request.json), author message `msg_73ae299f6383`. Root read `scenes[0].extras` directly from the accepted corrected M3 parent and verified the complete before-object matches the request.

Authorize a **new separately versioned and hash-pinned internal amendment** for this exact parent and first M4 v01 only. Keep original geometry mapping `m4-model-contract.json`, SHA256 `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98`, unchanged. S owns the amendment; the Codex helper pins and consumes it. No new public runtime field or API parameter is needed.

| `scenes[0].extras` key | Parent | Required M4 v01 |
|---|---|---|
| `fk_tag` | `m3-v02` | `m4-v01` |
| `fk_stage` | `M3` | `M4` |
| `fk_m4_tag` | absent | `v01` |
| `fk_variant` | `proposal` | unchanged |
| `fk_profile` | `studio-full-kit-v1` | unchanged |
| `fk_m2_tag` | `v04-pc` | unchanged |
| `fk_m3_tag` | `v02` | unchanged |

Pin the complete before and after objects, not merely these changed keys. Preserve exactly one scene named `Scene`, its single `studio_full_kit` root through semantic index remapping, other scene/document data, and asset metadata `{generator: "Khronos glTF Blender I/O v5.2.41", version: "2.0"}`. Reject extra, missing or wrong provenance keys/values and stale M3-only labels. No wildcard revision, whole-`extras` exemption, false relabelling of the parent, epsilon tolerance or earlier UV-noise allowance is authorized. Later revisions require their own concrete evidence/decision.

## Structured malformed-input correction

The independent review found that `scenes[0]=null`, `images[0]=null` and `textures[0]=null` escape as `AttributeError`. The technical writer may add appropriate shape checks or narrowly include these malformed-record failures in the existing `malformedInput` conversion. The public helper must return `valid:false` with a JSON-safe `errors` list and the existing hash fields. It must never return a false pass, patch a GLB or alter the frozen M3 hierarchy source.

Keep all retained hierarchy/reference-sharing/accessor-byte/material/image/palette/flag checks and row/stage/global limits unchanged. The unchanged structural validator remains a separate downstream requirement.

## Ownership, tests and rereview

S supplies the new amendment and confirms its pin; the existing actual-Codex technical performer owns only the helper/tests and a new v2 receipt/report. Preserve original mapping, writer v1 receipt, independent review/probes and first-attempt evidence. Do not overwrite failed evidence or silently edit another owner's source.

Test the exact approved synthetic metadata as positive; stale M3 labels, wrong/missing approved tags and unrelated scene/document mutations as negatives. Regress all three malformed records through the public API, preserving inputs and structured results. Run the relevant existing transition tests against the changed fixture/helper; any CLI receipt check remains bounded and exclusive. These remain synthetic helper tests, not actual M4 art or final acceptance.

Return exact amendment/helper/test/receipt hashes and the concrete diff to root. The retained independent Codex reviewer then performs a focused rereview of both corrections and unchanged invariants. Final candidate acceptance remains held until that approval and the actual assembled checks. Claude may continue its disjoint new M4 source planning/preparation; no new Blender retry, retained-art modification or final export acceptance follows merely from this repair authorization.
