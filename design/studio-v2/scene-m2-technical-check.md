# Exact M2 technical handoff

**MATCHED: the held M2 proposal v02 loads, binds and releases its owned resources through the repaired adapter and unchanged full builder.** No mechanical capture blocker was found in this bounded check. This is not M2 visual acceptance, whole-room completion, production integration or browser/performance approval.

15 November 2026. Retained actual Codex reviewer, task `task_86d1e13cbf86`, dispatch `ctx_b7590cf4506a`, ACK `msg_b48974f587a4`. No helper, restart or model override. Matched handoff sent to S as `msg_c7721ac51d1e`. Only this report and `scene-coordination/m2-technical-*` evidence were written; source, artist files and earlier adverse evidence remain intact.

## Evidence

[Probe source](scene-coordination/m2-technical-probes.mjs) and [passing receipt](scene-coordination/m2-technical-probes.json) contain two bounded checks: exact identity/inventory comparisons, and real installed-loader/full-builder binding plus two-load ownership/disposal. They reuse existing allocation instrumentation with explicit candidate/manifest substitution in memory. ImageBitmap and Canvas2D are CPU shims; no pixel, browser or GPU proof is claimed. No full 72-case rerun was performed.

S's [accepted preflight](scene-coordination/m2-v02-preflight.json) passes. Scope correction `msg_7d6ef1b2189d` narrowed this assignment to binding/private ownership and said not to repeat validation. The mailbox check, CLI and manifest export had already been submitted together; the latter two finished before the correction was read. Their [CLI receipt](scene-coordination/m2-technical-cli.json) and [recomputed manifest](scene-coordination/m2-technical-recomputed.manifest.json) are preserved, and neither operation was repeated. The recomputed manifest is byte-for-byte identical to the author manifest, SHA256 `a3bd983a582d58875ed024e6815fa891f511b51e72b4d3b835c50692a9a48c51`.

Commands, from repository root (completed exit 0):

```text
node design/studio-v2/asset-pipeline/full-kit/technical/validate-full-kit.mjs design/studio-v2/asset-pipeline/full-kit/exports/studio-full-kit-m2-proposal-v02.glb design/studio-v2/asset-pipeline/full-kit/manifests/studio-full-kit-m2-proposal-v02.manifest.json --report design/studio-v2/scene-coordination/m2-technical-cli.json
node design/studio-v2/asset-pipeline/full-kit/technical/export-manifest.mjs design/studio-v2/asset-pipeline/full-kit/exports/studio-full-kit-m2-proposal-v02.glb proposal M2 design/studio-v2/scene-coordination/m2-technical-recomputed.manifest.json
node design/studio-v2/scene-coordination/m2-technical-probes.mjs
```

## Actual candidate findings

| Area | Independent evidence |
| --- | --- |
| Identity | Exact `proposal` / `M2`, frozen raw inventory pin, and source hashes match. All eight reserved-plane world-corner arrays equal accepted M1 proposal v02, including dusk. Runtime binding corners match frozen proposal coordinates within 0.0002 world units. |
| Assembly | 117 original mesh identities retained, attached once under the existing scale-2 / +0.11 adapter; no extra procedural mesh or instancing introduced. |
| Binding | Three exact target surfaces, three distinct dedicated border materials, existing runtime canvas textures, and second-bind rejection. Four display surfaces plus dusk and border replacements stay separately owned by SceneResources. |
| Blockers | Exactly 107 opaque non-target/non-border meshes. Dusk and decorative display remain blockers; no-shadow monitor cables and under-desk power remain blockers. The three contact decals and PC glass are excluded as transparent. |
| Glass | `pc_tower__glass` is transparent, depthWrite false, renderOrder 2, and casts no shadow. |
| Reuse | `mon_side__copilot` and `mon_side__typeforge` share one geometry and one material within a load. Two independent loads have different geometry/material identities and five distinct image objects each. |
| Ownership | Per-load observed import: 53 geometries, 22 materials including loader base/final variants, five textures and five bitmap shims. Disposing the first import twice leaves the second import and all runtime replacements alive. All imported resources release exactly once; bitmaps close after their texture consumers. |
| Runtime cleanup | Eight runtime materials and five textures release exactly once, separately from imported placeholders; repeated disposal is safe. One shadow-casting light remains in the unchanged builder. |

Counts recomputed from loaded indexed geometry agree with the byte validator: **22,658 unique / 24,722 placed triangles**, **12,680 casting triangles across 48 casting meshes**. The 16 authored M2 leaves contribute **17,702 placed triangles**, below the 18,000 stage geometry ceiling. There are 57 of 59 inventory IDs; only `music_cables` and `wall_cable_run` are absent. All 51 remaining proxy leaves and all 16 authored M2 leaf names are listed in the receipt.

Material reporting needs one qualification: actual M1 proposal v02 has **10 exported material definitions**, while M2 has **11**, newly using the already-permitted `lib_glass`. All ten existing definitions and all five image/texture records match M1. Therefore the author's phrase that the exported material inventory is unchanged at 11 is not literally true; no profile change or new material permission is needed.

The 16 M2 leaves plus seven target/border/display planes give 23 static primitive instances, above the author's stated stage planning ceiling of 20. This is an unresolved planning/budget reconciliation for root and Claude, not a measured renderer draw count or a format rejection. Whole-kit 117 leaves and 48 casters likewise do not prove draw-call or shadow-pass totals. Asset-only estimates remain gzip 586,950 B / Brotli 483,718 B, raw 1,228,272 B; they exclude scene JS, transfer headers and actual browser delivery. Root retains the production budget gate.

## Exact held hashes

| File | SHA256 |
| --- | --- |
| M2 proposal v02 GLB | `2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411` |
| M2 proposal v02 author manifest | `a3bd983a582d58875ed024e6815fa891f511b51e72b4d3b835c50692a9a48c51` |
| `components/studio/scene/load-full-kit.ts` | `37549d60af2eb7f5e1feaf0914fd0da496ec38441ebe088ce445d2914b5ad68f` |
| `components/studio/scene/bind-full-kit.ts` | `0ee8bbe6e0fb83ab4bf219343655c4260a8f5193f5624dc69fb802634a2294eb` |
| `components/studio/scene/build-full-studio.ts` | `5a4e8296e04d66cfeaedf59bedee8c633b378c84126de52b78eaabe421c0f02f` |
| `components/studio/scene/verify-full-kit.mjs` | `ea836ba70da71020ba78b70b78311b46d2eacec798da4f8163e7b03a54b3b531` |
| `asset-pipeline/full-kit/technical/profile-core.mjs` | `02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71` |
| `asset-pipeline/full-kit/technical/validate-full-kit.mjs` | `66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75` |
| Frozen inventory | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |

The receipt contains full before/after hashes, including unchanged profile, contract, pilot, scene sources, all tracked M1 candidates and earlier review evidence. No tracked file changed during the final run.

## Preserved exploratory failures and limits

The [initial probe receipt](scene-coordination/m2-technical-probes-initial.json) and matching script preserve two reviewer-assumption failures: demanding identical material arrays despite newly used permitted glass, and including the seven binding planes (14 triangles) in the 16-leaf authored M2 count. The [second receipt](scene-coordination/m2-technical-probes-second.json) and script preserve an instrumentation assumption: the author harness observes final loader material clones on disposal, so its pre-disposal loadMaterial set is not the complete import inventory. The final probe explicitly snapshots actual final mesh/material/texture identities before rebinding and verifies their eventual disposal as well as the base allocations. These corrections changed only reviewer evidence; no candidate guard or source was weakened.

Author Blender claims of 81 clear rays per target, PC-top hiding, intersections and cable clearances were **not independently ray-tested here**. The PC's appearance under chrome is a root visual gate. Actual browser decoding, target visibility/picking with current input/chrome, mobile layout, lifecycle and GPU/performance captures remain root work. The earlier nonblocking trusted pre-bind mutable-root limitation remains unchanged. Source/candidate hold continues through capture; this handoff claims neither complete room inventory nor final M2/product acceptance.
