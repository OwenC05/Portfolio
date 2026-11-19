# Independent M3 v03 restoration review

**APPROVE the exact-restoration implementation and actual v03 output. No blocking issues found within this scope.** The four authorized retained-UV words now match accepted M2 v05, and no other raw byte changed. This is technical restoration/manifest approval, not M3 visual, stage-budget or whole-room acceptance.

15 November 2026. Independent reviewer, separate from Codex S's implementation. Read the [root authorization](m3-v02-raw-root-disposition.md), [raw audit source](m3-v02-raw-audit.py) and [receipt](m3-v02-raw-audit.json), [restorer](m3-v03-restore.py), its [receipt](../asset-pipeline/full-kit/manifests/m3-v03-restoration-receipt.json), actual input/output bytes, paired manifest, current reviewed source guards and unchanged validator. Ran bounded CPU checks only. No Blender, browser, build, package, source/art change or Git mutation occurred. Read-only Git retrieval verified the previously reviewed guard baseline. Frozen inputs, outputs and old receipts remain unchanged.

## Exact identities

| Artifact | Independently verified SHA256 |
| --- | --- |
| Accepted M2 v05 parent | `4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735` |
| Frozen M3 v02 raw GLB | `71b39b5c242278408092d3ee95ab4e996df47014eb30ef57383b88f3e526fd18` |
| Restorer | `e6c7a3ea4cca8539e6b04f8d65dc50c8b2b00cd5e4e32745febf8bb90d4158a3` |
| Actual M3 v03 GLB | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| Paired M3 v03 manifest | `060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405` |
| Writer's restoration receipt | `4db3ed948889218411f3182e36e3a543b1e06661b3edba65267e95c9233dfb5a` |
| Frozen M3 source | `dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209` |

The editable v02 blend, author measurements and raw-audit receipt also match the recorded pins; full hashes are in the independent [byte/probe receipt](m3-v03-review-probes.json).

## Implementation and actual delta

`m3-v03-restore.py:49` checks unique desk mesh/node ownership, a single primitive, exact TEXCOORD_0 accessor 64, exact float32 VEC2 layout and packed bufferView 67. `:70` first requires both complete input hashes, then checks chunk starts, independently derived parent/raw BIN offsets, raw file offsets and exact raw/replacement words. `:103` checks frozen source/editable/measurement provenance, refuses either existing output and uses exclusive `xb` creation for both files. The implementation is specific to this exact raw/parent pair; no generalized tolerance or author-source NOISE extension was introduced.

Independent full-file comparison finds exactly these **four individual byte offsets changed**, each within one authorized four-byte word slot:

| Vertex.component | Raw BIN offset | Raw/output file offset | Raw word → output/parent word |
| --- | ---: | ---: | --- |
| 197.1 | 411384 | 487532 | `dec4203f` → `ddc4203f` |
| 199.0 | 411396 | 487544 | `5d8f72bf` → `5b8f72bf` |
| 258.0 | 411868 | 488016 | `21858b3e` → `20858b3e` |
| 274.1 | 412000 | 488148 | `3789213f` → `3689213f` |

Thus four word slots address 16 byte positions, but only **four bytes actually change**. Raw and output are both 1,628,664 bytes. The header, full JSON chunk and every other raw byte are identical. Embedded labels honestly remain `fk_tag: m3-v02`, `fk_m3_tag: v02`, with the inherited `fk_m2_tag: v04-pc`; v03 is the separate canonical restoration result. The independently invoked pure restoration function produces bytes identical to the existing v03 candidate without writing it.

## Retained-parent and manifest evidence

Compared **all 106 retained meshes and 424 retained accessor payloads** against accepted v05: zero differences after restoration. This includes positions, normals, UVs and indices; normalized accessor metadata, mesh/primitive definitions and retained materials also match. Reviewed hierarchy semantics preserve the exact 11-proxy removal/9-leaf addition, retained parentage, transforms, extras, flags and reserved bindings.

The four reviewed guard functions and source `NOISE`, `ROWS`, `T2`, and `FROST_RENDER_ORDER` declarations are AST-identical to the independently reviewed `8829c741…22954` baseline. Applied those reviewed guards to the actual candidate: hierarchy, complete T2 RGBA with exact new cells, non-palette encoded images, image metadata and texture/sampler graph all pass. The palette check uses the established 8×8 grid with 16-pixel cells. Frost is the only newly used material, single-sided BLEND with transparent/non-occluding/nocast/no-receive metadata and numeric renderOrder 1.5.

The [independent manifest check](m3-v03-review-manifest.json) pins the unchanged validator, profile-core, frozen profile and inventory. `validateFullKit` returns valid with no errors. Independently recomputing and serializing the `proposal`/`M3` manifest produces **byte-identical** output to the supplied manifest. All **eight reserved world-corner arrays** equal the accepted parent manifest. No guard or profile was relaxed.

## Meaningful bounded tests

- [Python probe source](m3-v03-review-probes.py): actual whole-file and retained-parent comparisons plus **14 negative checks**, all passing. These reject mutated raw/parent bytes, reuse of corrected output as raw input, duplicate mesh/node identities, wrong accessor count/stride/view origin, wrong authorized offset/value/replacement, and pre-existing output or receipt. Overwrite checks use only fresh isolated marker files; their content remains intact and no candidate was written there.
- [Node manifest probe](m3-v03-review-manifest.mjs): actual paired-manifest acceptance and **two negative manifest checks**, both rejected as expected—wrong GLB hash and changed target corner. This is not a repeated broad test suite.

All protected input/output/source/receipt hashes were rechecked unchanged after the CPU probes. The original writer receipts and failed author evidence were neither overwritten nor reinterpreted as independent approval.

**Cleanup blocker:** root requested removal of the isolated test directory. Its resolved absolute workspace path and exact marker contents were verified, but automatic approval review rejected both recursive cleanup and narrower exact-file non-recursive deletion as “blocked by policy,” before execution. No bypass was attempted. The [cleanup receipt](m3-v03-review-temp-cleanup.json) identifies the remaining `m3-v03-review-isolated-hhuarwvz` directory and its two tiny text markers, not real candidate data. Exclude that exact directory from commit and leave supported cleanup to root; technical approval above is unaffected.

## Limits and handoff

This review stops at exact correction, retained-parent equality and paired-manifest validity. S retains the separate actual per-row/weighted-count and whole-room byte-forecast audit. Actual browser decoding, first-refresh/settled renderer measurements, final transfer, source-editable regeneration, independent Claude visual verdict and root stage acceptance remain their respective gates. No conclusion is made about mouse proportions, phone key pitch, speaker/cymbal readability or other art choices.
