# M2 material v03 bounded technical check

15 November 2026. **PASS for the permitted material-only delta**, checked by S (actual Codex), independently of the Claude author. This is capture readiness, not visual or product acceptance.

Command: `node design/studio-v2/scene-coordination/m2-v03-delta-check.mjs`, exit0. The [machine receipt](scene-coordination/m2-v03-delta-check.json), SHA256 `7951594A5EECDFF6E87D3CC21E8F798162736492804987814DB531C0272612C6`, records exact inputs and all changed JSON paths. The existing full-kit validator independently accepts the new paired candidate; no guard changed and no broad suite was repeated.

| Input | SHA256 |
| --- | --- |
| Preserved M2 v02 GLB | `2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411` |
| Material v03 GLB | `7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752` |
| Material v03 manifest | `5e1cb075b377c3ce3d7656601eef55afdd5d59aeef5be6d3c4b28500f83228d9` |

The complete 1,155,932-byte BIN chunk is identical. Every geometry, UV and embedded-image byte, node, mesh, accessor, buffer view, material assignment, binding plane, transform, occluder/shadow flag and alpha/sidedness/sort behavior remains unchanged. Only `lib_glow` response values and two scene provenance labels changed. The paired manifest changes only its GLB hash and material8 definition. Export omits the new metallic/roughness values because they equal1; installed `GLTFLoader.js:3721` and `:3722` explicitly default both absent fields to1.0.

Shared consumers are the pendant lens, floor-lamp bulb, PC glow and five wall-triangle proxies. Their visual response needs new evidence. This check does not infer that the lens is below the clipping threshold or that the PC glow is visible.

Counts remain117 primitive instances,48 casting meshes,24,722 placed triangles,12,680 shadow triangles,11 materials and5 images. Main/refresh pass accounting is therefore unchanged from the independent budget review. Encoded image bytes remain325,195; candidate raw bytes1,228,192, gzip586,943 and Brotli483,798. These are candidate compression estimates, not combined production transfer measurements.

The receipt's eight runtime/profile/inventory/validator hashes match the earlier freeze. Prior geometry, binding and resource evidence is carried only for those unchanged inputs; no new runtime loader/resource exercise or appearance approval is claimed. Root owns actual recapture, shared-material collateral checks and later integration. Independent Fable rereview, the complete59-asset ledger/addendum, budget disposition and final product gates remain outstanding. Root's capture hold was delivered to the author: CPU ledger/report work only, no Blender/export or source change during capture.
