# M2 stage budget reconciliation

15 November 2026. S coordination evidence, not artistic approval or a budget waiver. The held M2 candidate has **23 primitive instances versus 19 planned and a 20-instance stage ceiling**. The discrepancy is accounted for below; the ceiling has not been met or changed.

Sources: frozen `asset-inventory.json` SHA256 `EDDC33B5A1C4B05184745C70AC71D25CB37BEF295638F0B3ECAAA440A4001C87`; M2 v02 GLB `2089A4F0B955C2730D167A8EE4258F7939B29F51057D9944678B44B4F2555411`; independently recomputed identical manifest `A3BD983A582D58875ED024E6815FA891F511B51E72B4D3B835C50692A9A48C51`; root capture receipt `.omx/context/full-kit-m2-runtime-capture-v01.json` SHA256 `1DA664B90227C9869801F7F0B950B59C64C24CC52F84BB584E197A4A6ADD49B2`. See [independent technical check](../scene-m2-technical-check.md) for installed-loader/binder and ownership evidence. This reconciliation reads those artifacts; it does not repeat the 72-test suite or mutate the inventory/profile.

## Exact M2 accounting

Each exported mesh leaf has one primitive/material. Counts include the seven runtime binding planes, whose placeholder materials are replaced without removing their mesh instances. Sharing glTF geometry or material does not batch separate nodes.

| Asset ID | Planned main-pass draws | Current primitive instances | Difference |
| --- | ---: | ---: | ---: |
| desk_top | 1 | 1 | 0 |
| desk_frame | 1 | 1 | 0 |
| desk_mat | 1 | 1 | 0 |
| mon_central | 1 | 1 | 0 |
| mon_side | 1 | 2 | +1 |
| mon_top | 1 | 1 | 0 |
| target_faces | 3 | 3 | 0 |
| target_borders | 3 | 3 | 0 |
| display_studio | 1 | 1 | 0 |
| mon_cables | 0 | 1 | +1 |
| pc_tower | 3 | 3 | 0 |
| sub_woofer | 1 | 2 | +1 |
| under_desk_power | 0 | 1 | +1 |
| fix_pendant | 2 | 2 | 0 |
| **Total** | **19** | **23** | **+4** |

The portrait housings share geometry/material but remain two draws when both render. The inventory assigned zero to assets assumed merged into another asset's group; the later frozen per-leaf `assetId` contract and no-global-batching implementation preserve cable and power groups separately. The subwoofer uses cabinet and grille leaves. These are representation differences, not missing content or a validator failure. PC and pendant meet their planned primitive allocations.

The 16 authored M2 leaves contain 17,702 placed triangles; seven two-triangle binding planes bring the stage to **17,716 against its 18,000 ceiling**, with 284 remaining. The earlier 17,702 figure excluded those planes. Authored shadow geometry is 10,772 triangles. Unique and placed counts remain separate.

## Whole-scene implications

M2 is not the only difference between the original merging estimate and the current representation:

| Stage | Planned main-pass draws | Design ceiling | Current primitive instances | Current status |
| --- | ---: | ---: | ---: | --- |
| M1 | 10 | 12 | 41 | Architecture and right-limit content |
| M2 | 19 | 20 | 23 | Workstation plus seven bindings |
| M3 | 7 | 9 | 11 | Proxies |
| M4 | 14 | 16 | 23 | Proxies; music cables absent |
| M5 | 8 | 10 | 16 | Proxies; wall cable run absent |
| M6 | 3 | 3 | 3 | Provisional contact planes |
| **Total** | **61** | **70** | **117** | **Incomplete room** |

M1 differences: cornice 4 vs planned 0, skirting 4 vs 1, beams 4 vs 0, window 6 vs 0, blind 10 vs 1, door 3 vs 2, switches 1 vs 0, floor lamp 6 vs 3; shell, floor and dusk match their one each. Earlier M1 composition approval does not establish approval of these budget differences.

Root's 23 captured views report a **settled maximum of 101 calls / 21,876 triangles**. The receipt's `firstRender` records report **131 calls / 31,382 triangles**; those initialization samples do not prove shadow-refresh cost at every final view. Do not add them to settled samples: they already include their render work. Relative to the hard 200-call gate, these recorded samples leave 99 and 69 calls respectively, **not a reserved allowance for future stages**. Frustum culling, transparent passes, shadows, replacement of proxies and future geometry prevent equating 117 primitive instances with either measured number.

For scale only, current M1/M2 counts plus the other original stage ceilings give 102 nominal main-pass instances; adding the original unmeasured 60-call shadow allowance gives 162. This is hypothetical arithmetic, **not a validated forecast**: later stages contain the same linked-node/merge assumptions and their proxies already exceed several ceilings. It cannot establish 38 calls of available final capacity.

Candidate-only transfer estimates are gzip 586,950 B / Brotli 483,718 B, excluding scene JS and actual delivery. The 1,500,000-byte combined transfer gate, 200-call / 200,000-triangle renderer gates, one shadow-casting light and DPR/demand-render constraints remain unchanged.

## Required disposition

Recommend root explicitly record whether to retain the current M2 representation as a staged exception while requiring an amended per-primitive whole-room forecast before further authoring. That forecast must account for M1 as well as M2, linked nodes and every zero-draw merge assumption; existing hard product gates remain. The frozen inventory must not be silently edited because runtime and CLI pin its exact hash. A separate approved budget addendum can preserve provenance until root deliberately versions any contract change.

Alternatively, root can require an owner-authored reduction to the original stage ceilings. Same-asset consolidation or explicitly approved runtime instancing needs material/visibility/occlusion/resource evidence; cross-asset merging or bypassing the frozen batcher contract is not an authorized shortcut. Claude decides material/geometry tradeoffs. S has made no appearance choice and has not authorized a ceiling increase.

Independent Claude M2/P1 visual review is separate. Root's production integration, picking, final camera coverage, first shadow refresh, compressed scene-plus-asset transfer and device/performance gates remain open. This report resolves the accounting discrepancy and exposes the remaining decision; it does not mark G2 or the full room accepted.
