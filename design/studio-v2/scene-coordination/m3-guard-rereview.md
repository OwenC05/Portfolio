# Independent M3 guard correction rereview

**APPROVE the technical guard delta. No blocking issues found.** This clears the identified source-guard blocker only. It does not accept an M3 export, its geometry, visual quality, performance or transfer budget, and does not replace S's eventual assembled-manifest audit.

15 November 2026. Writer/reviewer separation retained: Codex S wrote the correction; this independent reviewer inspected the exact delta and ran only CPU AST-extracted guard checks. No authoring script, Blender, browser, build or package operation ran; no source, art or Git mutation occurred. Only this report and `m3-guard-rereview-*` evidence were written.

## Exact scope and ownership evidence

The author's [preparation report](../asset-pipeline/full-kit/m3-preparation-report.md) records the frozen source and explicit guard-only lease to S, consistent with ACK `msg_1e0a5f50d7e7` and settled preparation `msg_7b4eb4ad5ea0` supplied in the review handoff. The [correction report](m3-guard-correction.md) identifies the same scope. No further authority was inferred from file location or an environment marker.

| Artifact | Verified SHA256 |
| --- | --- |
| Author-frozen preimage, 54,142 bytes | `7138fed965bb145febec3865d704a3cce80d394a23687972ff9cd1c536814ec2` |
| Corrected `build_fullkit_m3.py` | `8829c741ee25bbb32da8328e4d56eb43fcd40ad9eac931a49bc0bb7192d22954` |
| S's original final preflight receipt | `956ae2d1ebfe8472d2ec8d27ff53694c13992b7df5024875ac512a859fc108da` |

The preimage is explicitly **reconstructed by reversing the guard patch**, not represented as an original backup. This reviewer independently reconstructed it and verified the entire frozen SHA, then rehashed S's supplied [preimage](m3-source-preimage-7138fed9.py), read its [reconstruction script](m3-guard-preimage.py), and confirmed both preimages are byte-identical. The exact [full-source diff](m3-guard-rereview-delta.diff) contains only three added guard helpers, their export-branch calls, replacement of the incorrect raw-node comparison, and replacement of the incomplete palette comparison.

There are no changes to geometry or placement code, ROWS/budget values, T2 colours or roughness/metallic values, material choices, frost order 1.5, parent pins, export settings, or the named four-word noise restoration. The latter still accepts only the exact listed v04 float values at the exact mesh/attribute/vertex/component identities, restores parent bytes and rejects any other difference. No broad numeric tolerance was added.

## Correctness and sensitivity

- `retained_hierarchy_problems` at source line 721 now accepts the intended 11-proxy-to-9-leaf substitution (117 to 115 root children), independently of numeric node ordering. It checks exact named additions/removals, direct root leaves, retained parentage/children, all other retained node fields and mesh presence, unique names, valid child references, single rooted reachability, scene roots and default scene. The old blocker is removed without excluding hierarchy from validation.
- `retained_texture_problems` at line 788 checks image identities/metadata, exact non-palette encoded image bytes, sampler definitions and texture/image/sampler relationships. Buffer-view relocation is not confused with content mutation. Existing retained-material comparison continues to protect material slot assignments.
- `palette_pixel_problems` at line 832 checks complete RGBA outside T2, treats RGB as alpha 255, checks exact declared new-cell colour/ORM/alpha values and requires both cells to exist. The real export branch calls these helpers at lines 970–971 and 1014. Actual exported PNGs and final material/texture behavior remain future evidence.

Ran `python design/studio-v2/scene-coordination/m3-guard-rereview-probes.py`, exit 0. The [independent runner](m3-guard-rereview-probes.py) AST-extracts the actual pure functions through S's documented preflight method, redirects its output to a separate [25-check receipt](m3-guard-rereview-preflight.json), and adds [19 independent probes](m3-guard-rereview-probes.json). **44/44 checks passed.** No bpy import or top-level authoring execution occurred.

The added probes cover cycles, unreachable nodes, retained mesh-presence/casting mutations, image metadata and texture/sampler changes, semantic image renumbering, RGB/RGBA equivalence, missing T2 cells, dimension changes, actual PNG decoding for RGB/RGBA with filters 0–4, and helper calls inside the actual `glb` conditional. The original suite exercises valid node renumbering and the exact old-failure fixture alongside invalid hierarchy, metadata, pixel and ORM mutations. These are behavioral/sensitivity checks rather than merely checking source strings.

S's initial 24-pass/1-fail receipt is preserved: its negative fixture assigned the target's existing false value, so it was a no-op. The final fixture inverts the existing boolean and now detects the mutation. Neither original receipt was overwritten; the final receipt's hash still matches the handoff.

## Remaining gates and stop condition

Source-guard review is complete and the guard-only lease can return through coordination. Root/Claude's existing release and ownership process still governs the next run. The actual candidate must prove its retained v05 bytes/flags, T2 pixels and image graph, nine row ceilings, weighted counts, frost metadata/order, actual compression and whole-room reforecast. S owns that separate assembled audit; root owns captures and acceptance.

Mouse proportions and cymbal readability remain Claude-owned design issues. This technical approval makes no decision about them, changes no acceptance threshold and claims no completed M3 candidate.
