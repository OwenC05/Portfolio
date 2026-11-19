# M4 transition guard: bounded repair handoff

**Both authorized corrections are implemented and frozen for focused independent re-review.** The repaired helper passes 81 focused synthetic CPU checks. This is implementer evidence; it does not close the independent review's blockers, approve an actual M4 export or authorize another art/export run.

Task `task_ba7ebcde2181`, dispatch `ctx_2fabb9f58634`; ACK `msg_21e3e13f5b40`, configuration receipt `msg_77fbe268cd53`, repair-ready handoff `msg_1291da7c7bc4`. Root authorization: `msg_71991aa019dc` / [root decision](scene-coordination/m4-guard-repair-root-decision.md). Retained executable remains `C:/Users/Owenc/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe`, no model/effort override in argv, local inherited configuration `gpt-6-astra` / `xhigh`; backend resolution is not independently observable. No helpers or restart.

## Exact repair

The helper pins S's separately versioned [M4 v01 provenance amendment](scene-coordination/m4-scene-provenance-amendment-v01.json), verifies its mapping/parent/manifest identities, and validates the complete accepted parent extras object. It then compares the candidate's complete normalized scene against that parent scene with **only** the amendment's exact after-object substituted for `extras`:

- Required changes: `fk_tag: m4-v01`, `fk_stage: M4`, and added `fk_m4_tag: v01`.
- Required inherited values: `fk_variant: proposal`, `fk_profile: studio-full-kit-v1`, `fk_m2_tag: v04-pc`, `fk_m3_tag: v02`.
- Exactly one scene named `Scene`, semantic root `studio_full_kit`, all other scene/document fields and exact Blender generator/version remain protected. No missing/extra tag, wildcard revision or stale M3-only label is admitted. The parent is never rewritten.

The public `audit_m4_transition(parent_bytes: bytes, candidate_bytes: bytes) -> dict` signature is unchanged. The existing malformed-input boundary now also converts `AttributeError` into `valid:false` with `errors[].code: malformedInput`. The three reported null scene/image/texture records therefore preserve the promised result instead of escaping. Hash fields retain their existing meaning; the receipt adds the amendment hash as diagnostic provenance.

No retained geometry, accessor, palette, material, texture, reference-sharing, flag or budget logic changed. No numeric tolerance, restoration or new GLB write path was added. The CLI's implementation is AST-identical to v1.

## Frozen identities and concrete diff

| Artifact | SHA256 |
| --- | --- |
| Repaired [helper](scene-coordination/m4-transition-guard.py) | `ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b` |
| Repaired [tests](scene-coordination/m4-transition-guard-tests.py) | `d17413ab80c0da964926f46c97cfc61f21f832fc25cddd521e8a49e19badf1c9` |
| New [v2 test receipt](scene-coordination/m4-transition-guard-tests-v2.json) | `4b84d112964c0d1aa671aebab511f4ff250d8c0feb268531e1cc36fa29434b46` |
| S-owned amendment | `3b3a011d5d2f599dc63a4bf31aacd115513eb06c31267ddee0201209cebb2229` |
| Unchanged geometry mapping | `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98` |
| [Concrete v2 diff](scene-coordination/m4-transition-guard-v2.diff) | `59f16120771211f964509554f71e6fdf06cb53b489604831c995a8c37759bcfb` |

The [change receipt](scene-coordination/m4-transition-guard-v2-change-receipt.json) records read-only retrieval of both preimages from commit `fbe08dae8bbf3f565382d804adafc7dec162563a`, verifies their original complete SHA256 values (`32673405…e1b6a` helper; `48cf26ce…cd108` tests), and binds the full diff to the repaired files. No Git mutation occurred. Fourteen helper functions, including parsing, accessors, image/material normalization and CLI, are AST-identical; `_audit` from the retained-node checks through all row/stage/global limits is also AST-identical.

Original v1 receipt `6a90cc5c69c79ec676ebdd08db96b5ac80be97cee6b0e2154692ff9f7afc3134`, original writer report, independent review `f46c07f30991c0e65b0bd104e381c1b1b6919e772058d27b7e641c437f58dcac`, independent probes/rerun/first-attempt evidence, mapping, accepted parent/manifest and earlier sources remain unchanged. Test receipts include protected before/after hashes. The original REQUEST CHANGES and failure evidence remain historical evidence, not overwritten by this report.

## Focused checks

```text
python -B design/studio-v2/scene-coordination/m4-transition-guard-tests.py --report design/studio-v2/scene-coordination/m4-transition-guard-tests-v2.json
```

**Exit 0; 81/81 checks passed.** The existing synthetic geometry fixture and checks are retained, with the exact authorized provenance supplied from a separate literal seven-key object. The old unauthorized-stage negative now uses M5 instead of its formerly invalid M4 value, so it remains an actual mutation.

New coverage checks the complete before/after objects; stale M3 provenance; missing complete extras and every individual required key; added tags; wrong stage, revision, variant, profile and inherited values; null/newline tag values; changed scene name/additional scene/unrelated fields; and changed generator/version or other asset/document metadata. Semantic node/reference relocation continues to pass with the precise new provenance.

All three public-API regressions (`scenes[0]`, `images[0]`, `textures[0]` set to null) return JSON-round-trippable invalid results with `malformedInput`, correct complete input hashes and unchanged input bytes. A fresh malformed-scene CLI test produces an invalid receipt and exit 1. Existing passing/invalid CLI and exclusive-path checks still return 0/1/2 as expected; no candidate is modified, including when its path is supplied as the receipt path.

Retained-byte and prior-noise negatives, material/image/palette/wiring checks, row/flag/triangle limits and input immutability still pass. Existing outer-cap sensitivity cases remain explicitly labelled test-only in-memory cap reductions; frozen caps were not changed. All test geometry is synthetic copied proxy geometry, not actual M4 modelling evidence. There was no broad runtime suite, build, browser, server, Blender or package operation.

## Remaining boundary

The repaired helper/test hashes are held for the same root critic's writer-separated focused re-review. Only after that gate and S's actual raw/manifest/structural checks can a real M4 candidate be considered. Root retains visual, runtime and budget acceptance; Claude retains art/source ownership. Later provenance revisions still require a precise new authorization. No actual M4 candidate acceptance or M5 release is claimed.
