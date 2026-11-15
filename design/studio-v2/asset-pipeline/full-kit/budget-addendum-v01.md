# Full-kit budget addendum v01

15 November 2026. Claude (actual), task `task_e0a4ef11c0ca`, dispatch `ctx_c777d3962014`. Companion data: [`export-ledger-v01.json`](export-ledger-v01.json).

This is a proposal that needs root's decision before M3 execution. It supersedes no frozen file:

- `asset-inventory.json` (`eddc33b5…1c87`), `full-kit-profile-v1.json` (`7d2892ae…a052`), `art-direction.md` and `render-gates.md` stay unchanged as evidence.
- It implements no geometry, batching or export.
- It waives nothing. The art-direction forecast of **70 main passes and 130 peak calls is rejected**, together with every zero-draw and `linkedInstances` multiplication behind it, and **replaced** by the per-leaf ledger below.

## Basis

- **Accounting.** I used the independent technical review's model and its exact per-leaf data for the retained stages (`full-kit-budget-technical-review.json`). Per leaf, `p = 2` for a double-sided BLEND material (three r187 renders those twice) and `1` otherwise. `s = 1` for a caster under the one directional PCF shadow.
  - Main calls = Σp.
  - Refresh calls = Σ(p + s).
  - Refresh triangles = Σ placed × (p + s).
  - No culling credit. No extra renderer passes exist for this rig.
- **Retained stages.** The 63 retained M1 and M2 leaves are byte-identical in v02 and the v03 material repair.
- **Cross-check.** The review's current candidate is 169 calls and 37,440 triangles. Retained M1/M2 is 77 calls and 35,376 triangles, of which the M1 switch proxy is 1 call and 12 triangles.
- **Replace, not add.** Each of the 51 proxies and the three provisional contact planes is replaced by its final row. Nothing is added on top of a proxy. All 54 are listed in the ledger under `replacedProxyAndProvisionalLeaves`.
- **Status of every row.**
  - `exported`: 63 leaves, the hash-bound M1/M2.
  - `bounded-proposal`: 44 leaves. Each is my ceiling as the author for its decomposition, flags and triangles, and an overrun means an immediate re-forecast.
  - Unknowns are listed at the end.

## Export decomposition rules (author's choices)

1. **One leaf per asset per material partition.** Same-asset parts are baked into that leaf. That covers the 67 keycaps, 49 keys, 10 clamps, 3 cymbals, 9 books, 9 leaves, 2 bindings, 3 panels and 5 wall lights. There is no runtime instancing and no cross-asset merge. This duplicates geometry in bytes (13,370 unique triangles over the linked plan) to keep draws flat.
2. **Material partitions collapse into palette cells where a texture adds nothing at viewing size.** This applies to:
   - the mug coaster;
   - the controller's oak cheeks;
   - the nearfield speaker, shelf speaker, stool, throne and kick-tower cloth;
   - the print frame.

   Two new palette cells are needed: oak tone and dark oak. Existing cells and their pixels are untouched. This saves eight leaves against a literal reading of the inventory's materials.
3. **Small parts covered by a larger caster do not cast.** Keycaps, controller keys, pedals, drum heads, sticks, cables, wall and shelf dressing and all glow and BLEND leaves are nocast. Under a 2048 map spanning about 13 m, a texel is about 6 mm. Their shadows would be sub-texel, or duplicate the silhouette of the case, plate, body or shell that does cast. Contact decals ground them.
4. **`lib_frost` will be single-sided when it is first exported in M3**, so the keyboard case takes one main pass. It is a closed shell seen from outside, and culling its back faces also avoids self-sorting artefacts. This does not change any exported material.

## Whole-room forecast (conservative, no culling)

| Stage | Leaves | Main calls | Casters | Refresh calls | Placed tris | Unique tris | Refresh tris | Original plan / ceiling (main) | Proposed design ceiling (main / refresh / placed) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| M1 (retained + switch completion) | 41 | 41 | 3 | 44 | 6,118 | 5,818 | 7,114 | 10 / 12 | 41 / 44 / 20,000 |
| M2 (retained, incl. 7 binding planes) | 23 | 24 | 9 | 33 | 17,716 | 16,696 | 28,490 | 19 / 20 | 24 / 33 / 18,000 |
| M3 nearfield | 9 | 9 | 7 | 16 | 14,100 | 14,100 | 22,800 | 7 / 9 | 10 / 18 / 15,500 |
| M4 music (incl. `music_cables`) | 18 | 18 | 9 | 27 | 19,270 | 19,270 | 33,560 | 14 / 16 | 20 / 30 / 22,500 |
| M5 walls (incl. `wall_cable_run`) | 13 | 13 | 2 | 15 | 7,920 | 7,920 | 10,820 | 8 / 10 | 14 / 17 / 10,000 |
| M6 contact decals (double-sided as today) | 3 | 6 | 0 | 6 | 300 | 300 | 600 | 3 / 3 | 6 / 6 / 500 |
| **Room forecast** | **107** | **111** | **30** | **141** | **65,424** | **64,104** | **103,384** | 61 / 70 | 120 / 165 / 86,500 |
| Contingency held by root | | | | **+20** | | | **+25,000** | | |
| **Forecast + contingency** | | | | **161** | | | **128,384** | | |
| Hard gate | | | | 200 | | | 200,000 | | |

- **Gate check.** At 39 calls and 71,616 triangles below the hard gate after contingency, the forecast meets both gates without counting on culling.
- **Peak design ceilings.** The proposed peak design ceilings are 165 calls and 140,000 rendered triangles. The art direction's triangle ceiling was 138,500, so the triangle ceiling stays essentially where it was. The call ceiling rises to 165 because shadows are now accounted per caster (30) instead of as a 60-call allowance, and because the current per-leaf identity contract has no zero-draw merges.
- **Instance floor.** The review's minimum was 98 instances; the forecast is 107, because some assets need a second material partition (glow indicators and displays, frost, drum heads, shelf board and brackets, panel fabric, wall-light diffusers).
- **Contingency covers:**
  - `lib_frost` having to stay double-sided (+1 call, +700 triangles);
  - a leaf split during authoring;
  - a glow leaf kept as a separate partition;
  - render-path surprises.

  It is held by root, not inside any stage figure.

### Zero-draw assumptions, resolved

All 16 inventory assets that had `drawsMainPass: 0` get explicit nonzero rows:

| Assets | Refresh calls each |
| --- | --- |
| Cornice | 4 (retained) |
| Beams | 4 (retained) |
| Window | 6 (retained) |
| Switches, monitor cables, under-desk power, sustain pedal, hi-hat pedal, music cables, shelf plant, shelf speaker, wall cable run | 1 |
| Mouse, notebook, throne, bindings | 2 (they cast) |

Linked families no longer multiply anything. Each is either the exported shared mesh (`mon_side`, cornice, skirting, beams and window boxes, blind slats) or one baked leaf. The ledger's `linkedFamilies` table gives the final unique and placed triangles for each.

### Completion items folded in

- **M1 switches.** `arch_switches__plates` replaces the proxy: plate plus two sockets, 240 triangles, nocast, 1 call.
- **Missing groups.** `music_cables__runs` (800) and `wall_cable_run__run` (200), both nocast. They are new; no candidate has them yet.
- **M6 changes to earlier stages.** These are kept out of the forecast unless marked:

| ID | Change | Calls | Triangles / bytes | Disposition |
| --- | --- | ---: | --- | --- |
| C1 | `lib_contact` single-sided | −3 | −300 | Option, recommended |
| C2 | `lib_glass` single-sided (M2 PC glass seen from −X only) | −1 | −2 | Option; touches frozen M2 |
| T1 | Planned library images replace the three pilot PNGs: door/oak timber, linen shade albedo and emissive | 0 | images 414,195 → 169,000 B | **Recommended**; M1 door and lamp need a visual parity check |
| T2 | Two new palette cells | 0 | about +100 B | In forecast |
| D1 | PC front UV to ivory, glow quad behind the glass (critique finding 2) | 0 | 0 | Dependency awaiting root release |
| D2 | `fk_glow_ramps` image and lens UV span | 0 | +8,000 B image | Only if the v03 flat lens is rejected |
| R1 | Same-asset consolidation reserve (cornice, skirting, beams, window, blind, lamp casting parts, portrait housings) | −26 | 0 | **Reserve only, not proposed**: re-export, re-validation of bounds, blockers and picking, and recapture of accepted stages |
| R2 | Trim unseen M2 cable, loom and tray geometry (critique finding 4) | 0 | up to about −4,000 placed, about −44 kB gzip | Byte reserve |
| L1 | Runtime light reconciliation; override table emptied | 0 | 0 | Runtime artist; still 1 directional shadow light and 5 points |

With C1 and C2, the forecast becomes 137 refresh calls and 103,082 triangles.

## Bytes

Measured basis: every non-image bufferView of the v03 GLB compresses to **11.0 gzip / 6.7 Brotli bytes per unique triangle** (830,728 → 248,434 / 151,594 B, Node v24 zlib defaults). The authored M2 meshes alone measure 10.2 gzip. Nothing is extrapolated from proxy or placed-triangle averages. I apply a ±15% band until the first M3 export is measured, then recompress every export.

| Asset transfer line | Option A (keep pilot PNGs) | Option B (T1 library images) |
| --- | ---: | ---: |
| Geometry, 64,104 unique tris (incl. 13,370 baked duplication) | 702,869 gzip / 428,890 Brotli | same |
| JSON (v03 measured, 117 leaves) | about 10,206 gzip / 8,002 Brotli | same |
| Embedded images (do not recompress) | 414,195 (current 325,195 plus planned plaster, floor, weave, contact) | 169,000 (inventory budgets) |
| **GLB forecast** | **1,127,270 gzip / 851,087 Brotli** | **882,075 gzip / 605,892 Brotli** |
| Largest scene-JS that still fits 1,500,000 (gzip) | 372,730 | 617,925 |

- **Scene-JS transfer is unknown.** Root measures it on the production chunks under the declared encoding. I have not filled it with the unmeasured 330,000 B reserve. The combined gate is shown only as the JS ceiling each option leaves.
- **Texture allocation.** Embedded images are 325,195 B today, against a nominal 300,000. Under option A they become 414,195. Option B brings them to 169,000, inside the allocation, and is the only option that leaves a comfortable JS margin.
- **Proposed byte allocation**, replacing 720k / 300k / 150k / 330k-unmeasured:

  | Line | Bytes |
  | --- | ---: |
  | Geometry and JSON (gzip) | 780,000 |
  | Encoded textures (assumes T1) | 200,000 |
  | Asset contingency | 90,000 |
  | Asset total | 1,070,000 |

  The gate then holds if the measured scene JS is ≤430,000 B gzip.

## What root needs to decide before M3

1. Record or reject this ledger as the replacement design forecast:
   - stage ceilings 41 / 24 / 10 / 20 / 14 / 6 main calls;
   - peak 165 refresh calls and 140,000 rendered triangles;
   - a 20-call and 25,000-triangle contingency held by root.

   The hard gates are unchanged.
2. Release or hold T1 (recommended), C1, C2 and D1. Note that R1 is a reserve lever, not a request.
3. Supply the measured production scene-JS transfer when available.

## Unknowns and verification still owed

- Actual triangles and bytes of each M3–M6 leaf until exported. The rows are ceilings.
- Real renderer counts at forced shadow refresh over the full camera matrix. This ledger is a static no-culling bound, not a measurement.
- Whether non-kit runtime draws stay at zero. The current 131-call first render decomposes exactly into 83 settled calls plus 48 casters.
- Device, DPR and transfer measurements, final visual acceptance, and independent technical verification of this ledger's arithmetic.

No room or product completion is claimed. M3 remains held.
