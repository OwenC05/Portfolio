# Independent full-kit budget review

15 November 2026. Technical review only. Actual Claude retains all appearance, material and geometry choices. This review writes only this note and its [arithmetic evidence](full-kit-budget-technical-review.json); no art, runtime, inventory, profile, Git, browser or Blender changes.

**REJECT the unchanged complete-room budget forecast. Recommend retaining the exact M1/M2 candidates as explicitly provisional stage exceptions, with the budget gate still open, for non-expanding material repair only.** Their current cost does not require discarding the work, but neither the 70-instance design ceiling nor the original stage allocations is satisfied. Before M3 execution, actual Claude must supply the revised per-asset primitive/caster/transparent-pass/triangle/texture forecast through coordination and root must record its disposition. This is no visual verdict or final performance approval.

## Verified basis

Read the stage reconciliation, frozen contract/profile, all 59 inventory entries, art-direction budgets and render gates, paired M2 manifest, current full builder/resources/loader/binder, renderer/controller implementation and root capture receipt. Independently parsed the actual GLB JSON/accessors, aggregated every mesh leaf by inventory asset ID, and compared the resulting counts to the paired manifest. The JSON includes every leaf and source hash; all 19 source hashes listed in the capture provenance still match disk. No test-suite or runtime capture was repeated.

Key SHA256 identities:

| Input | SHA256 |
| --- | --- |
| M2 v02 GLB | `2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411` |
| Paired M2 manifest | `a3bd983a582d58875ed024e6815fa891f511b51e72b4d3b835c50692a9a48c51` |
| Frozen inventory | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |
| Root capture receipt | `1da664b90227c9869801f7f0b950b59c64c24cc52f84bb584e197a4a6add49b2` |
| Full builder | `5a4e8296e04d66cfeaedf59bedee8c633b378c84126de52b78eaabe421c0f02f` |

The [contract](full-kit-contract.md), reconciled decisions 3 and 7, explicitly distinguishes shared meshes from batching and estimates from renderer gates. [Art direction section 9](../asset-pipeline/full-kit/art-direction.md) retains 70 main-pass groups and 130 peak design calls; [render gates](../asset-pipeline/full-kit/render-gates.md), lines 68 and 84, require stage and whole-room ledgers within their design ceilings. Passing the profile's 512-instance parser guard does not satisfy either requirement.

## Recomputed representation and pass accounting

| Stage | Planned / ceiling instances | Actual instances | Casting meshes | Placed triangles | Casting triangles | Extra transparent main passes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| M1 | 10 / 12 | 41 | 3 | 5,890 | 996 | 0 |
| M2 | 19 / 20 | 23 | 9 | 17,716 | 10,772 | 1 |
| M3 | 7 / 9 | 11 | 11 | 180 | 180 | 0 |
| M4 | 14 / 16 | 23 | 22 | 708 | 696 | 0 |
| M5 | 8 / 10 | 16 | 3 | 192 | 36 | 0 |
| M6 | 3 / 3 | 3 | 0 | 36 | 0 | 3 |
| Total | 61 / 70 | **117** | **48** | **24,722** | **12,680** | **4** |

There are 53 unique exported meshes containing 22,658 unique triangles, and 57 of 59 asset IDs. Missing: `music_cables`, `wall_cable_run`. The 51 proxy leaves are **50 in M3–M5 plus `arch_switches__proxy_switch_door` in M1**; the three M6 contacts are additional provisional leaves. M1 must not be treated as immutable final geometry. M2 includes all seven binding planes: 17,702 authored triangles plus 14 binding triangles leaves only **284 triangles** below its 18,000 stage ceiling.

M1's excess versus plan is cornice +4, skirting +3, beams +4, window +6, blind +9, door +1, switches +1 and lamp +3: **+31**. M2's is portrait housing +1, monitor cables +1, subwoofer +1 and under-desk power +1: **+4**. Shared portrait geometry remains two submissions. The seven binding planes remain seven meshes after material replacement.

Sixteen inventory IDs were allocated zero draws, assuming cross-asset merge groups: cornice, beams, window, switches, monitor cables, under-desk power, native mouse, notebook/pen, sustain pedal, hi-hat pedal, drum throne, music cables, shelf plant, shelf speaker, snowboard bindings and wall cable run. All require nonzero explicit representation under the current per-leaf asset identity contract. Multiplying `drawsMainPass` by `linkedInstances` is also invalid: e.g. PC `linkedInstances: 3` describes repetitions inside an asset, whereas its actual three leaves are case, fan rings and glass. Claude must specify the exported decomposition per asset.

Installed Three r187 `WebGLRenderer.js:2178` renders double-sided transparent materials twice when `forceSinglePass` is false; `Material.js:431` defaults it to false. `GLTFLoader.js:3745` preserves double-sidedness; the full loader does not override that flag. The PC glass and three contact leaves therefore contribute four extra main submissions and 38 extra triangles in an all-visible accounting. Opaque double-sided leaves do not get that extra pass. No material-side or pass change is proposed here.

The builder has one **directional** shadow light and five non-shadow point lights (`build-full-studio.ts:43` onward). The controller uses PCF shadows and updates on demand (`controller.ts:381`). The installed shadow renderer submits each visible, light-frustum-intersecting caster once (`WebGLShadowMap.js:528` and `:564`); one shadow light does not mean one shadow draw. Receiving PCF shadows adds shading work, not a second receiver geometry pass. VSM blur, point-light cube shadows and future extra passes are outside this bound.

With no culling credit, today's candidate therefore has a conservative **121 main submissions + 48 shadow submissions = 169 calls**, and **24,722 + 38 + 12,680 = 37,440 triangles** for a shadow-refresh render under this exact rig. This is a static ceiling for the current incomplete candidate, not a measurement or a final allocation. Hidden surfaces still submit when in the frustum; ordinary depth occlusion is not draw elimination.

## What the receipt proves

The 23 settled captures peak at **101 calls / 21,876 triangles**, at `scene-mid-right-1440x900-f58.png`. Recorded initialization peaks are **131 / 31,382**. `preview.mjs` stores `firstRender` once at initial home and reuses it in subsequent snapshots; those entries are not 23 distinct shadow-refresh poses. The initial desktop sample decomposes exactly as 83 settled home calls + 48 casters, and 18,702 + 12,680 triangles. Do not add another shadow allowance to it.

The 69-call difference between 131 and 200 is not final headroom. For illustration, that same candidate's largest settled sample plus its current full shadow cost would be 149 calls / 34,556 triangles; this is arithmetic, not a captured refresh at that pose. The all-visible bound is 169. Proxy replacement, final materials and different culling can change all of these numbers. Capture DPR is 1; the receipt explicitly excludes device-performance and production acceptance.

## Credible revision path

**Retaining current M1/M2 consumes 64 primitive instances.** The remaining stages contain 34 asset IDs, so even one leaf per remaining ID requires at least **98** total instances, or **100** if the three planned contact groups remain. Thus the unchanged 70-instance completion forecast is impossible for this retained representation, independently of camera culling. A design-budget addendum is necessary unless Claude chooses a different representation. The hard 200-call, 200,000-rendered-triangle and 1,500,000-byte combined gates remain unchanged.

The smallest useful next deliverable is an owner-authored export ledger, with one row per intended leaf or repeated leaf family, covering all 59 IDs. Each row needs: stage and asset ID; material identity; separate geometry parts versus shared mesh copies; instance count; unique/placed triangles; opaque/BLEND, sidedness and effective pass count; cast/receive flags; target/contact ordering exceptions; planned consolidation; and whether the row is exported, bounded by an owner commitment, or still unknown. Include the M1 switch/socket completion and any M6 changes to M1/M2, not just M3–M5.

For each final primitive instance `i`, use `p_i = 2` for the current double-sided BLEND path and `1` otherwise; `s_i = 1` for a caster under the current single directional PCF pass and `0` otherwise. With `t_i` placed triangles:

```text
main calls bound       = sum(p_i)
refresh calls bound    = sum(p_i + s_i) + explicitly identified extra renderer passes
refresh triangles     = sum(t_i * (p_i + s_i)) + triangles in those extra passes
```

Unique geometry is counted once for byte forecasting, while repeated geometry is counted at every placement for draw/triangle forecasting. Do not retain proxy cost and then add replacement geometry on top; replace its ledger row. Keep a separately visible contingency selected by root, rather than hiding it in material or shadow estimates.

An exact constraint can be given without inventing future counts: current M1/M2 contribute **77 refresh calls / 35,376 rendered triangles** in this conservative model. If those parts are retained, the final remainder must satisfy **`future M3–M6 cost + M1/M2 completion delta + extra passes + contingency <= 123 calls`**, and the analogous triangle remainder must be at most **164,624**. These are residual constraints, not promised capacity or revised design ceilings. The old 60-call shadow allowance is replaced by actual per-leaf caster accounting, not added on top. Unknown future leaf/material counts currently prevent a complete forecast.

### Same-asset consolidation candidates, for Claude's decision

Current opaque leaves with matching material and shadow/blocker flags offer these source-export candidates:

| Same asset | Current leaves → potential leaves | Nominal instance reduction |
| --- | ---: | ---: |
| Cornice | 4 → 1 | 3 |
| Skirting | 4 → 1 | 3 |
| Beams | 4 → 1 | 3 |
| Window timber | 6 → 1 | 5 |
| Blind | 10 → 1 | 9 |
| Floor-lamp casting palette parts | 3 → 1; other three parts retained | 2 |
| Portrait housings | 2 → 1 | 1 |

These are **26 potential nominal reductions**, not implemented savings or visual recommendations. They leave M1 at 16 and M2 at 22; the original 12/20 ceilings still would not be met. Even these aggressive current-compatible merges plus one leaf for each remaining ID yield at least 72, or 74 with three contact groups. More changes would require a new owner decision rather than assuming free consolidation.

Baking disconnected parts into one single-material primitive can preserve their asset ID and transforms, but expands unique vertex data, changes bounding volumes/culling and may increase per-view triangles. Shared beams/monitors particularly trade storage reuse for fewer calls. Validate UVs/normals, exact target clearance, blocker ray intersections, bounds and ownership after any such change. Never merge the reserved target/border planes, different asset IDs, different material/opacity/shadow partitions, or transparent sort groups merely because placeholders or textures are shared. Subwoofer cabinet/grille currently use different materials; reducing them is an art choice. Runtime instancing/global batching remains separately deferred by the freeze.

### Transfer constraint

Reproduced with Node v24.21.0, zlib `1.3.2.1-motley-8002e91`, default `gzipSync`/`brotliCompressSync`: candidate raw **1,228,272 B**, gzip **586,950 B**, Brotli **483,718 B**. These match the prior receipt. Compressor/settings matter; these are not actual delivery measurements. The five embedded PNGs already total **325,195 B**, above the nominal 300,000-byte texture allocation, although embedded image bytes and compressed HTTP payload are different measures. This allocation discrepancy also needs explicit reconciliation, not a claim that the hard combined gate failed.

Measure production scene-JS chunks plus the final asset under the same stated delivery encoding. The 330 kB JS reserve remains unmeasured. Do not forecast final bytes from raw GLB size, from placed triangles, or from the proxy-heavy candidate's average bytes/triangle. Record new unique geometry, images and consolidation duplication, then recompress each actual export. The art-direction bytes/triangle trigger needs a reproducible denominator and image accounting; this review does not declare it satisfied.

## Disposition, pre-mortem and verification

Recommended root record: “Retain the hash-bound M1/M2 candidates for non-expanding material repair only, with M1 41/12 and M2 23/20 discrepancies open. This does not pass G2/G6 budgets, waive the 70/130 design ceilings or authorize a production performance claim. Actual Claude supplies the revised per-asset primitive, caster, transparent-pass, triangle and texture ledger and proposed design-budget addendum through coordination; root records its disposition before M3 execution. Inventory/profile pins and hard product limits remain unchanged.”

Root's subsequent steering identifies independent visual findings on pendant exposure and PC material readability. Those findings are not independently judged in this technical review. The permitted repair path keeps the existing leaves, geometry, light count, material sidedness/alpha/pass behavior and shadow flags; it adds no light or geometry. Appearance values belong to actual Claude. Retain the original candidate and give repaired exports new hashes/manifests and fresh relevant visual/technical evidence. Any requested expansion returns to the budget decision instead of inheriting this provisional exception.

| Likely failure | Required evidence before closing the risk |
| --- | --- |
| Linked keys/pads/slats or zero-draw assets multiply leaf and shadow counts | Claude's complete decomposition with explicit unknowns resolved; independent byte-derived per-stage ledger; actual proxy removal and all 59 IDs present at final. |
| A merge lowers instances but worsens culling, bytes or picking | Before/after compressed sizes, exact geometry/flag and binding checks, blocker/picking regression evidence, same camera matrix with forced shadow refresh and settled counts. Actual Claude judges appearance. |
| Final transparency, contacts, textures or JS consumes apparent reserve | Per-material pass ledger; actual combined transfer under declared encoding; hash-bound production renderer captures including first refresh, refreshed limit/mid views, settled views and agreed DPR/device checks. |

Verification sequence: approve the reconciled ledger/addendum; verify each subsequent export against its bounded allocation; reforecast remaining assets immediately on drift; then run the full render-gate camera matrix with forced shadow refresh at each pose and the production integration/picking/lifecycle checks. Record fresh hashes after any geometry, light, material or renderer change. The forecast is a planning guard; measured final gates remain mandatory. If a conservative no-culling bound exceeds a hard gate, obtain a bounded revision or stronger complete runtime coverage before acceptance; a loose bound alone is not proof of measured failure.

**Stop condition for this review:** arithmetic and decision gaps are explicit, source identities match, and a concrete owner handoff exists. **Stop condition for the budget issue:** an approved achievable whole-room ledger/addendum followed by complete, hash-bound final measurements. Current status: representation accounting verified; final leaf structure, design-budget revision, combined transfer and production performance remain open.
