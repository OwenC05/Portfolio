# Independent M4 v02 restoration review

**APPROVE the exact-restoration implementation and actual v02 output. No blocking issues found within this scope.** The three authorized desk-UV words now equal the accepted corrected M3 parent, with exactly three individual raw bytes changed. This approves technical restoration and paired-manifest correctness only; it is not art, stage-budget, transfer or final performance acceptance.

15 November 2026. Independent reviewer, separate from Codex S's implementation. Read the [root authorization](m4-v01-raw-root-disposition.md), [restoration request](m4-v01-raw-disposition-request.md), [raw-word audit source](m4-v01-raw-word-audit.py), [restorer](m4-v02-restore.py), writer tests/receipts, actual frozen bytes, approved transition guard and unchanged validator/manifest path. Ran bounded CPU checks only. No Blender, browser, build, package, artist/source/guard/contract change or Git mutation occurred. Only this report and `m4-v02-independent-*` evidence were written; no temporary candidate files or cleanup operations were needed.

## Verified identities

| Artifact | SHA256 |
| --- | --- |
| Accepted corrected M3 parent | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| Frozen M4 v01 raw | `c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906` |
| Exact restorer | `9f5cb2f5ec5ab2395d254bf32e828a9a89a6473a244284871f931046373fc12b` |
| Actual M4 v02 output | `baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f` |
| Paired M4 v02 manifest | `42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82` |
| Writer restoration receipt | `29194ca093280a5113f3aaa91e30d2594b9be7d651bba10a03825520886895a1` |
| Approved transition guard | `ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b` |

M4 source `aa9724dc…04dc22`, geometry helper `c7ce9d8e…3ab1c0`, editable v01 `0ae40460…8c4665`, author measurements `22039aa1…194782`, failed author guard receipt `b31e17bf…250fcd`, original mapping `8f0474aa…3f2d98` and provenance amendment `3b3a011d…bb2229` match the root/restorer pins. Full identities and unchanged before/after hashes, including old review/failure evidence, are recorded in the independent [byte/probe receipt](m4-v02-independent-probes.json).

## Implementation and actual byte proof

`m4-v02-restore.py:58–83` requires unique desk mesh/node ownership, one primitive, exact UV accessor identity and exclusive accessor/view ownership. It requires precisely FLOAT VEC2, 292 entries, packed eight-byte elements and a 2,336-byte view. `:86–117` first requires complete parent/raw hashes, validates chunk starts and both layouts, derives every BIN/file offset from vertex/component and checks exact raw and replacement words before editing an in-memory copy. The final check permits only the three authorized individual byte offsets and requires complete desk-UV equality. No numeric tolerance, inherited noise rule or generalized repair exists.

Independently parsing the actual files, identifying the semantic desk UV accessor and scanning every retained component derives this complete raw difference set:

| Vertex.component | Parent accessor/view | Raw accessor/view | Parent BIN / file | Raw BIN / file | Raw → output/parent word |
| --- | --- | --- | --- | --- | --- |
| 199.0 | 64 / 67 | 75 / 78 | 411396 / 487544 | 580196 / 662880 | `5d8f72bf` → `5b8f72bf` |
| 258.0 | 64 / 67 | 75 / 78 | 411868 / 488016 | 580668 / 663352 | `21858b3e` → `20858b3e` |
| 274.1 | 64 / 67 | 75 / 78 | 412000 / 488148 | 580800 / 663484 | `3789213f` → `3689213f` |

Parent BIN starts at 76,148; raw/output BIN starts at 82,684. Both raw and output are **2,206,200 bytes**. The three four-byte slots address 12 byte positions, but only **three bytes actually change**, at **662880, 663352 and 663484**. Their same-sign float32 word distances are respectively 2, 1 and 1 ULP; exact bytes govern the repair. The earlier 197.1/subwoofer slots are untouched.

The entire header, JSON chunk and every other raw byte are identical. The independently invoked pure `restore` function reproduces the existing actual output byte-for-byte without writing it. The writer receipt agrees with independently derived offsets and words. Embedded provenance remains honest M4 v01: `fk_tag: m4-v01`, `fk_stage: M4`, `fk_m4_tag: v01`, with inherited M2/M3 tags preserved. The v02 filename identifies this separate technical correction, not another authored revision.

## Retained data and paired manifest

Independent full logical-payload comparison finds **92 retained leaves / 368 retained accessor comparisons / zero differences** against the accepted corrected parent, including every POSITION, NORMAL, TEXCOORD_0 and index payload and normalized accessor metadata. The raw scan finds only the three authorized desk words above.

The unchanged approved transition API independently accepts the actual output with no errors. This exercises the exact 23-proxy-to-18-leaf substitution, semantic hierarchy/reference sharing, retained transforms/extras/flags, material definitions/assignments, all image and palette encoded bytes, texture/sampler graph, exact M4 provenance and binding row limits. The structural validator remains separate and unchanged.

The independent [manifest probe](m4-v02-independent-manifest.mjs) verifies the existing validator/profile-core/profile/inventory hashes, then validates the actual output with its supplied manifest: **valid, no errors**. Recomputing and serializing `candidateManifest(bytes, 'proposal', 'M4')` yields a **byte-identical paired manifest**. All **eight reserved world-corner arrays** exactly equal the hash-pinned parent manifest. No profile, guard or target tolerance was relaxed. Evidence is in [the manifest receipt](m4-v02-independent-manifest.json).

## Focused sensitivity and immutability

Both independent commands exited 0:

- `python -B design/studio-v2/scene-coordination/m4-v02-independent-probes.py`: actual full-file/retained-payload comparisons, approved transition pass and **17 negative checks**, all passing. Checks cover wrong parent/raw hashes, reuse of corrected output as raw, duplicate semantic mesh identity, shared UV accessor/view, wrong count/stride, incorrect expected BIN/file offsets and words, changed actual raw/parent words, and pre-existing output/receipt paths.
- `node design/studio-v2/scene-coordination/m4-v02-independent-manifest.mjs`: actual manifest validation/recomputation, reserved corners and **two negative manifest checks**, both rejected—wrong GLB hash and changed reserved corner.

Deeper word checks bypass only the initial hash precondition through explicitly test-local in-memory mocks; no production pin or source changes. Exclusive-output tests use in-memory paths whose `open` would fail the test: either pre-existing path prevents both opens and preserves sentinels. `write_fresh` at `:121–127` and `main` at `:130–152` also use actual exclusive `xb` creation and verify provenance before writing. The writer's 26 bounded checks were read, not rerun; they include exclusive-creation race cases. A receipt-creation race may leave an empty newly created output, as disclosed by the writer. It cannot overwrite either existing file, and the implementation does not silently retry. This operational limit does not affect the already verified complete actual output/receipt pair.

All protected artifacts, source/provenance files and old receipts were rehashed unchanged after the independent probes. Prior 81/32-check helper suites were not repeated. Evidence SHA256: byte/probe receipt `6556f9a429214960ab408aa70830eb3c7f619121146d459d33154c7558f5167f`; manifest receipt `606461b900bfd3b4855b8d9a3a2215ddb9e829e37827f62aaf8cbb8248130670`.

## Limits and handoff

This exact restoration and actual-output review is complete. S owns the separate actual per-row/caster/pass/weighted/unique/placed and whole-room transfer reconciliation; this review does not duplicate or approve that forecast. Root owns capture and stage disposition, and actual Claude owns independent visual acceptance. Controller azimuth, key/pedal readability, cymbal clearance, runtime measurements, source/editable regeneration and final product/transfer gates remain outside this technical verdict. No M5 release is implied.
