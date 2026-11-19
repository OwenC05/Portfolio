# M4 transition guard implementation handoff

**Implemented and frozen for separate review.** The pure transition API and receipt-only CLI pass 51 focused synthetic CPU checks against the accepted M3 parent. No actual M4 raw export exists in this handoff, and this implementer does not independently approve the helper, artwork or stage.

Task `task_ab4f0d628e39`, dispatch `ctx_be8703637ecd`; ACK `msg_158ef90288e8`, helper-ready handoff `msg_450fd6e47618`. Observed retained executable: `C:/Users/Owenc/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe`; no model/effort override in argv, local inherited config `gpt-6-astra` / `xhigh`, backend resolution not independently observable. No restart, helper, Blender, browser, build, Git, dependency/configuration or art/source/runtime edits. Other owners' work is preserved.

## Frozen deliverables and dependencies

| Artifact | SHA256 |
| --- | --- |
| [m4-transition-guard.py](scene-coordination/m4-transition-guard.py) | `32673405c0f07e248899e3b4a855081cfb8a98b0ef2077e00e558892481e1b6a` |
| [Focused tests](scene-coordination/m4-transition-guard-tests.py) | `48cf26cee1c47a451bf90e5f42db6b842afddc2f9f0cdeead95daa71cb3cd108` |
| Frozen M4 mapping | `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98` |
| Accepted corrected M3 v03 parent | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| Parent manifest | `060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405` |
| Frozen M3 helper source | `dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209` |
| Full-kit profile | `7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052` |
| Inventory | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |

Import checks the frozen read-only dependencies and extracts **only** `retained_hierarchy_problems` from the pinned M3 source AST. It does not import or execute the authoring module, `bpy` or `bmesh`. This preserves the reviewed named-substitution/root/parentage behavior documented in `m3-guard-rereview.md` and `m3-v03-restoration-review.md`; the old helper remains unchanged. The additional retained-data and M4-row checks are new implementer work awaiting independent review.

## API and CLI

```python
audit_m4_transition(parent_bytes: bytes, candidate_bytes: bytes) -> dict
```

The API performs no I/O and does not mutate inputs. Its result contains `valid`, `parentSha256`, `candidateSha256`, `errors`, frozen dependency hashes and diagnostic metrics. Errors are JSON objects with a stable `code` and relevant identities. Neither successful nor unsuccessful calls produce rewritten GLB bytes.

```text
python -B design/studio-v2/scene-coordination/m4-transition-guard.py raw.glb --report fresh-report.json
```

The CLI reads the pinned parent and candidate, writes only a fresh receipt using exclusive creation, and returns 0 for a passing transition or 1 for an invalid candidate. An existing receipt is refused with exit 2; using the candidate itself as receipt also refuses without changing it. Frozen dependency/import or unreadable-input errors fail before receipt creation. No output GLB option, restoration operation, epsilon or prior noise exception exists.

## Guard coverage

- Exact 23 retired names and 18 new names, **including** `music_cables__runs`; direct root-leaf substitution, unique identities, parentage, reachability, scene roots/default scene, exact retained transforms/extras/flags and mesh presence.
- Exact retained mesh and primitive definitions, material assignments, attribute sets, normalized accessor metadata and packed logical attribute/index bytes. Storage indices, buffer origins, accessor offsets and stride placement can relocate while content stays identical. Retained mesh/accessor sharing relationships remain one-to-one.
- Existing material names/definitions and texture-slot assignments; image names/metadata and **all encoded image bytes, including both palettes**; sampler definitions and texture/image/sampler relationships. Semantic array reindexing is accepted. No inherited T2 permission.
- All eight reserved target/border/display/dusk geometries are retained under those exact node/geometry checks. New rows have exact ledger identities, material/alpha/sidedness, role and boolean flags; opaque `nocast` rows remain occluders. Each has one primitive/material and bounded per-row triangles/calls before the outer 20-main / 30-refresh / 22,500-placed stage ceilings.
- Result counts: 110 leaves, 58 current asset IDs, 17 remaining proxy leaves and three provisional contact leaves; `wall_cable_run` remains absent. Existing profile raw-byte/placed-triangle/primitive-instance guards remain unchanged. New camera/light or unexpected node/document data is rejected.

Byte mismatch receipts identify node, mesh, primitive, attribute/index semantic, vertex/component, both accessor indices, both BIN-relative offsets, both full-file offsets and exact before/after component hex. Up to 128 component differences are detailed, with the total and omitted count preserved; excess differences still fail. The former desk UV noise word is explicitly rejected, not repaired.

## Focused verification

Ran on Python 3.11.9:

```text
python -B design/studio-v2/scene-coordination/m4-transition-guard-tests.py --report design/studio-v2/scene-coordination/m4-transition-guard-tests-v1.json
```

**Exit 0, 51/51 checks passed.** The [receipt](scene-coordination/m4-transition-guard-tests-v1.json) records exact helper/test/dependency hashes before and after; they match. The CLI checks use a verified isolated directory under the owned prefix, remove only their temporary fixtures, and verify both candidate byte streams remain unchanged. No test writes an artist artifact or imports the Blender authoring module.

The positive fixture performs the exact substitution on the actual pinned parent using copied 12-triangle proxy geometry for each new row. It is deliberately **synthetic**, with 216 stage triangles, not M4 modelling evidence. It preserves 92 retained leaves and passes 368 retained accessor comparisons with zero component differences. A second positive reverses node/mesh/accessor/view/material/image/texture/sampler arrays and relocates BIN storage while updating references.

Negatives cover wrong additions/retirements and a nineteenth leaf; reparenting, root/retained transforms, flags, cycles and duplicate children; default scene and scene extras; cameras/unexpected data; target position/UV, retained indices, the old noise word, accessor metadata, primitive/mesh changes and shared-reference drift; material/alpha/sidedness; both palettes, a nonpalette image, image metadata, image/sampler wiring; new-row flags, split primitives and per-row limits; wrong parent hash; API immutability and exclusive CLI behavior. The diagnostic test independently checks the word bytes and both offset spaces.

The fixed row commitments sum to ceilings below the outer stage limits, so candidate violations normally fail at a row first. Three explicitly labelled test-only in-memory cap reductions verify the outer main/refresh/placed branches; they do not modify the frozen mapping or claim a valid-contract candidate can exceed an outer cap while all rows pass.

## Known limitation and remaining handoff

**Scene metadata is currently stricter than the inherited hierarchy helper.** The new `sceneMetadata` comparison preserves the parent's inherited M3 scene extras exactly, including `fk_stage` and tag fields; changing them to M4 currently rejects. This was disclosed in helper-ready handoff. S's reply `msg_14c35fe2c774` requires this exact helper/test snapshot remain frozen while Claude supplies the intended precise provenance delta and root decides any allowlist. No speculative exception was added. Any future authorized metadata amendment requires a new hash and separate review.

This transition guard supplements the unchanged full-kit structural validator. It does not certify arbitrary glTF validity, visual geometry quality, screen readability, actual image decode, runtime picking/lifecycle, compressed scene-JS transfer or GPU draws. Main/shadow/refresh figures are static accounting estimates, never renderer measurements. Separate independent technical review, the first actual raw M4 audit, structural validation, Claude visual critique and root stage acceptance remain outstanding. No M5 release is implied.
