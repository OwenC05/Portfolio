# M3 source guard correction

15 November 2026. Actual Codex S owns this technical correction; actual Claude retains art, geometry, materials and placement. Author handed over only guard sections in msg_1e0a5f50d7e7, froze `build_fullkit_m3.py` at SHA256 `7138FED965BB145FEBEC3865D704A3CCE80D394A23687972FF9CD1C536814EC2`, and completed source preparation as msg_7b4eb4ad5ea0. No shared edits overlapped.

The preflight blocker is corrected and25 targeted CPU checks pass. This is source readiness, not an exported M3 candidate or visual approval. Root's existing technical reviewer receives the exact correction for independent scrutiny; no duplicate assembled-stage audit is claimed.

Exact preimage for independent review: [m3-source-preimage-7138fed9.py](m3-source-preimage-7138fed9.py),54142bytes, SHA256 `7138FED965BB145FEBEC3865D704A3CCE80D394A23687972FF9CD1C536814EC2`. It was reconstructed by reversing only the literal guard patch, not claimed as an original backup; [m3-guard-preimage.py](m3-guard-preimage.py) writes nothing unless the reconstructed bytes match that previously recorded author hash exactly. It ran exit0 and left the current8829C741 source untouched. This supports an exact guard-only diff despite the previously untracked source having no Git baseline.

## Change

The previous node comparison treated root child indices as immutable, necessarily rejecting replacement of11 M3 proxy leaves by9 authored leaves (117 root children to115). `retained_hierarchy_problems` now validates that exact name-based substitution and direct parentage. It checks unique names, valid nonduplicated child references, a single unparented root, full rooted reachability, scene roots/default scene, all retained parent/child relationships and every other retained-node field. Numeric glTF node indices may reorder; hierarchy cannot be omitted, reparented or widened. Mesh attributes continue through the existing retained-byte guard.

`retained_texture_problems` preserves the image-name set and image metadata, all nonpalette encoded bytes, sampler definitions and texture-to-image/sampler wiring. Buffer-view relocation does not masquerade as a content change. Existing retained material comparisons preserve their texture-slot assignments.

`palette_pixel_problems` compares full decoded RGBA outside the two T2 cells (RGB images have implicit alpha255). It verifies every authorized new-cell RGBA value against the unchanged author declarations: oak_tone `#a47c55`, roughness0.62; dark_oak `#5e4130`, roughness0.55; metallic0 and alpha255. It also checks both cells exist. No palette colour, geometry, row budget, frost ordering or material value was selected or changed by Codex. Existing named, value-pinned noise restoration remains unchanged; no general numerical tolerance was introduced.

## Evidence

Command: `python design/studio-v2/scene-coordination/m3-guard-preflight.py`, exit0,25passed/0failed. The runner AST-extracts the actual pure functions from the production authoring script without importing bpy. It uses the hash-pinned accepted v05 hierarchy/texture graph, a synthetic exact11-to9 substitution, and explicit negative mutations. Coverage includes index renumbering, wrong children/parents/scene roots, duplicate or unreachable nodes, retained metadata, texture rewiring, sampler/image mutation, RGB/alpha preservation and exact new-cell colour/roughness. It also verifies the tested helpers are called by the actual export branch.

The fixture reproduces the original failure: old raw retained-root JSON equality rejects the valid117-to115 replacement. This does not constitute an actual M3 export or a Blender run.

Initial test receipt [m3-guard-preflight-initial.json](m3-guard-preflight-initial.json) is preserved:24passed/1failed because the negative target-occluder fixture wrote its already-existing false value. The fixture was corrected to invert the actual boolean, without changing the implementation. The final mutation now fails closed as intended.

| Artifact | SHA256 |
| --- | --- |
| Corrected `build_fullkit_m3.py` | `8829C741EE25BBB32DA8328E4D56EB43FCD40AD9EAC931A49BC0BB7192D22954` |
| Preflight runner | `0218B471DF4649C126E32D60848FB7AB9F498665DB2CFDFAB15CB8E3CB8AA726` |
| Final preflight receipt | `956AE2D1EBFE8472D2EC8D27FF53694C13992B7DF5024875AC512A859FC108DA` |

## Remaining handoff

No Blender, M3 save/export, browser, server, build, package or Git operation ran. Actual exported T2 pixels, retained bytes, nine row/weighted counts, frost behavior, first compressed export and full-room reforecast remain mandatory assembled checks. Source stays frozen for independent technical feedback, then S returns its guard lease and dispatches the existing actual-Claude author under the accepted v05 parent. The author's mouse-size and cymbal-readability concerns remain artistic follow-ups; Codex did not resolve them by changing geometry or thresholds.
