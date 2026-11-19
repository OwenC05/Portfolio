# Independent M4 guard focused rereview

**APPROVE the two bounded guard repairs. No blocking issues found.** The exact first-M4-v01 provenance transition is enforced, and the three malformed-record failures now return structured invalid results. This clears the earlier helper-readiness blockers only; it does not approve an actual M4 artifact, art, stage budget or M5 release.

15 November 2026. Writer/reviewer separation retained. Read the [root repair decision](m4-guard-repair-root-decision.md), [authored provenance request](m4-scene-provenance-request.json), [separate amendment](m4-scene-provenance-amendment-v01.json), [repair task](m4-guard-repair-task.md), actual helper/test delta and v2 change/test receipts. Only this report and the `m4-focused-rereview-*` runner/receipt were written. No artist/source/helper/test/contract edits, Blender, browser, server, build, dependencies, Git mutation or delegation occurred. Read-only Git retrieval verified the exact preimages.

## Exact reviewed identities

| Artifact | Verified SHA256 |
| --- | --- |
| Repaired helper | `ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b` |
| Repaired writer tests | `d17413ab80c0da964926f46c97cfc61f21f832fc25cddd521e8a49e19badf1c9` |
| Separate provenance amendment | `3b3a011d5d2f599dc63a4bf31aacd115513eb06c31267ddee0201209cebb2229` |
| Writer v2 receipt | `4b84d112964c0d1aa671aebab511f4ff250d8c0feb268531e1cc36fa29434b46` |
| Complete helper/test diff | `59f16120771211f964509554f71e6fdf06cb53b489604831c995a8c37759bcfb` |
| Unchanged original M4 mapping | `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98` |
| Accepted corrected M3 parent | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| Accepted parent manifest | `060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405` |

Retrieved helper/test preimages from `fbe08dae8bbf3f565382d804adafc7dec162563a` and independently verified their full hashes against the earlier reviewed `32673405…481e1b6a` / `48cf26ce…cb3cd108` snapshots. Reconstructed the **entire** helper-and-test unified diff and matched the supplied diff exactly after normalizing line endings for text comparison. Every protected current file and old receipt listed in the v2 test receipt was rehashed before and after the independent probes and remains unchanged.

## Findings resolved

**Exact provenance.** The amendment's full before-object matches the accepted parent's actual `scenes[0].extras`; its full after-object matches actual Claude's request and root's explicit values. The request SHA also matches the amendment's pin. Precisely two existing values change, `fk_tag: m3-v02 → m4-v01` and `fk_stage: M3 → M4`, and one key is added, `fk_m4_tag: v01`. `fk_variant`, `fk_profile`, `fk_m2_tag` and `fk_m3_tag` remain exact. The single `Scene`, semantic `studio_full_kit` root and exact Blender generator/version match all three evidence sources.

`m4-transition-guard.py:19` and `:38–42` pin the separately versioned amendment and verify its mapping/parent/manifest identities. At `:194–209`, the guard checks the complete parent extras, required scene identity/root and asset metadata, then derives expected candidate scenes by replacing **only** that extras object with the exact approved after-object. Every other scene field is inherited for exact comparison, and the existing document comparison remains at `:198`. This accepts honest first-M4-v01 labels while rejecting stale M3 labels, missing/extra/wrong values and unapproved future suffixes. There is no whole-extras exemption or parent relabelling.

**Structured malformed-input handling.** At `:374–375`, the existing public-API failure boundary now includes `AttributeError` and converts it into `malformedInput`. Independent tests of `scenes[0]=null`, `images[0]=null` and `textures[0]=null` each return `valid: false`, a nonempty JSON-safe error list and correct parent/candidate hashes. Parent and candidate bytes remain unchanged. The exception conversion does not permit an invalid candidate to pass and does not modify the frozen M3 hierarchy source.

## Independent verification and unchanged scope

Ran `python -B design/studio-v2/scene-coordination/m4-focused-rereview-probes.py`, **exit 0; 32/32 focused probes passed**. The [runner](m4-focused-rereview-probes.py) and [receipt](m4-focused-rereview-probes.json) record:

- Exact approved metadata acceptance; stale complete M3 metadata, wrong stage/revisions, each of seven missing keys, each of four changed inherited values, an extra key, unrelated scene/document fields, wrong scene name and changed asset generator/version all reject.
- All three formerly escaping null records now reject through the public API, serialize safely and preserve input bytes/hash fields.
- Semantic node/resource index remapping and BIN relocation still pass, as does independent retained-UV repacking into strided storage.
- An exact formerly exempt desk UV word mutation, retained boolean type drift, wrong new-row occluder flag, palette-byte mutation and material-definition mutation all still reject.

AST comparison independently establishes that only `_audit` and `audit_m4_transition` changed among existing function/class definitions. Within `_audit`, the entire retained-node comparison through texture/material/reference-sharing/accessor checks and all row/stage/global limits is AST-identical to the prior reviewed helper. All other functions/classes, including parsing, accessor extraction and the exclusive receipt-only `main`, are AST-identical. Thus no art value, mapping, budget, target, texture, retained-byte rule or numeric-noise tolerance changed in this repair.

The synthetic positive still has 92 retained leaves, 368 retained accessor comparisons and zero component differences; its new geometry is copied proxy test data, not actual M4 modelling. The writer's **81/81** v2 receipt was inspected and hash-verified, including its null-scene CLI result: fresh invalid receipt, exit 1 and unchanged candidate bytes. That suite and filesystem CLI fixture were **not** independently rerun. The CLI implementation is unchanged and the corrected public API was independently exercised, so an additional filesystem test would not add material evidence here. Earlier independent 50-check and supplemental evidence, original v1 receipt and failed first-attempt records remain preserved.

## Stop condition and handoff

The focused helper rereview is complete and both findings in the [original REQUEST CHANGES](m4-transition-guard-independent-review.md) are closed for the exact identities above. Root/S may treat this helper as technically ready within the existing bounded M4 authorization. Later provenance revisions require a separately approved exact amendment; this approval does not authorize wildcard tags or retained-data repairs.

The unchanged full-kit validator, actual raw/assembled retained-data audit and paired manifest, per-row/weighted/global/transfer reconciliation, root capture and independent actual-Claude visual verdict remain separate gates. No actual M4 artifact or final performance evidence was evaluated here.
