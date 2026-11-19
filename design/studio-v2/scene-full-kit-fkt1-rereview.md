# Independent FKT-1 repair re-review

**APPROVE the repaired bounded adapter/validator at the hashes below; close FKT-1.** Both original metadata-only failures now reject in runtime and CLI for the intended reasons, while the exact baseline/proposal v02 candidates remain accepted. This verdict does not approve production integration, full-room appearance/completeness, browser behavior or device/performance budgets.

15 November 2026. Retained actual Codex reviewer, task `task_970928fa77f8`, dispatch `ctx_9621515e57ff`, ACK `msg_410bb51d3869`; no helpers, restart or model override. Implementation writer was the separate task `task_0c3dd6b3f781`. Reviewer writes are limited to this report and `scene-coordination/full-kit-fkt1-rereview-*` evidence. No implementation, art, profile, configuration or dependency edits; no Git, browser, server, build or Blender operations.

## Evidence and repair closure

[Independent probes](scene-coordination/full-kit-fkt1-rereview-probes.mjs) produced [24/24 passing checks](scene-coordination/full-kit-fkt1-rereview-probes.json). [Separate CLI process checks](scene-coordination/full-kit-fkt1-rereview-cli.mjs) produced [9/9 expected exits and results](scene-coordination/full-kit-fkt1-rereview-cli.json), including negative exit 1. Run from repository root with `node` followed by either script path.

The reviewer reused only the author's instrumentation preamble, with the installed GLTFLoader and image/Canvas2D shims. No author test cases were imported. The reviewer supplied the cases, independent assertions, canonical serializer and single-guard mutants; candidate injection supplies paired exact bytes/manifests to the isolated loader. These are CPU/source proofs, not browser image-decode or GPU measurements.

| Check | Fresh result |
| --- | --- |
| Original valid synthetic bytes with all-zero `artInventorySha256` | Runtime and validator reject `art inventory hash mismatch`; real CLI exit 1. |
| Same incomplete synthetic bytes relabelled `final` | Runtime and validator reject `final inventory incomplete`; real CLI exit 1. |
| Both mutations on each unchanged actual v02 GLB | Same reasons and runtime/CLI parity; the correct GLB hash remains intact. |
| Exact synthetic and both actual M1 author manifests | Runtime, validator and CLI pass; binder returns three targets, with 4/113/129 blockers respectively; repeated disposal and owned-resource cleanup pass. Each actual candidate allocates five image shims. |
| Stage `M7`, `final` with trailing newline, array-valued stage; newline/array-valued variant | Both paths reject for exact stage/variant reasons before parser allocation. |
| Synthetic structural fixture containing all 59 inventory IDs | `final` control passes; proxy flag and proxy name each fail `final contains proxy`, so incomplete inventory cannot mask that guard. This fixture duplicates test geometry and does not prove final art. |
| Changed nonstructural bundled inventory note, unchanged candidate bytes/manifest | Runtime rejects `bundled art inventory identity mismatch` before parser allocation. |
| Four separate in-memory guard removals | Removing raw-hash equality, final coverage, final proxy exclusion or canonical pin individually makes its corresponding rejected runtime input pass. All controls clean up; product source stays intact. |

All metadata rejections in these probes occur before parser allocation, with zero image allocations and passing cleanup. There were no new blocking findings within the repair scope.

## What the repaired source now guarantees

`load-full-kit.ts:236–239` hashes the canonical bundled inventory, checks the frozen canonical identity, then passes the inventory to shared `checkManifest` before constructing the loader. `profile-core.mjs:332–341` admits exact stage/variant values, binds the manifest's inventory hash to the frozen raw-byte pin, and enforces all inventory IDs plus no proxies for `final`. `validate-full-kit.mjs:24–28` retains actual GLB/raw-inventory hash comparisons and uses the same canonical and manifest checks. The prior CLI-only final checks now live in the shared checker.

The reviewer compared these current blocks with the preserved original findings and verified that exactly the four implementation/test files below changed among the original review's tracked sources. The old review, its exploratory failure, both original FKT-1 runtime acceptances, and all v01/v02 assets/manifests remain unchanged. Full before/after hashes are in the new probe receipt; the CLI receipt confirms the same hashes afterward.

The pins establish identity relative to the **trusted compiled bundle and frozen source inventory**. The raw pin was checked against both the original review's recorded SHA256 and current inventory bytes; a separate serializer recomputed the canonical hash. Expectations were not copied from the implementation and fed back as their own proof. Runtime cannot reconstruct source whitespace from bundled JSON; the raw pin preserves that authoring contract while the canonical pin checks semantic content. Neither proves external authorship/provenance, resists trusted code changing pins, nor establishes artistic completeness. Future inventory changes require intentional review of both pins and matching manifests.

## Reviewed identities

| File | SHA256 |
| --- | --- |
| `components/studio/scene/load-full-kit.ts` | `37549d60af2eb7f5e1feaf0914fd0da496ec38441ebe088ce445d2914b5ad68f` |
| `components/studio/scene/verify-full-kit.mjs` | `ea836ba70da71020ba78b70b78311b46d2eacec798da4f8163e7b03a54b3b531` |
| `asset-pipeline/full-kit/technical/profile-core.mjs` | `02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71` |
| `asset-pipeline/full-kit/technical/validate-full-kit.mjs` | `66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75` |
| Baseline v02 GLB | `04994845f62236c6230dce1ba8af7d9811e21fc1e45c0fff6a89be7f06777093` |
| Baseline v02 author manifest | `fab5ed35086773ee380103014a7c05760953fcea3437f71b0e20da9d1d858b3f` |
| Proposal v02 GLB | `bdc997b45917be0c72480af9738362e9940e5159b07781eac2bfa6b86b01fe76` |
| Proposal v02 author manifest | `8c290bbe555b8d0737e07639b2b34ee289a0b6d903c91380e13f133b074773aa` |
| Frozen inventory raw bytes | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |
| Independently serialized canonical inventory | `4c654f241a29a3ce83229132bdbf085798690af56beaca388e1b5fb3e361b8d2` |

The frozen profile, contract, pilot profile, binder, types, builder, controller, picking, textures and resource sources also match the original review's hashes. No tracked source or preserved evidence changed during either independent run.

## Retained limits and remaining gates

The earlier [nonblocking pre-bind mutable-root limitation](scene-full-kit-technical-critique.md) remains: the certificate is an internal coordination mechanism, not a security boundary or proof of original allocation identity. Equivalent shared geometry/material clones and target draw-range edits can survive revalidation; caller-created clones require caller ownership. The current builder binds first. This repair neither claims nor adds support for arbitrary pre-bind customization. The reserved-name/asset-ID diagnostic limit also remains unchanged.

The writer's retained TAP receipts show 18/27 passing before repair (nine intended failures) and 72/72 after; typecheck and supplemental lint receipts pass. These are inspected writer evidence, not fresh independent full-suite runs. Configured lint remains exit 2 because `@typescript-eslint/eslint-plugin` is missing. No dependency/configuration repair was attempted. The original broader technical review is preserved rather than silently rerun or superseded beyond FKT-1.

Both actual v02 candidates are M1 blockouts, not final kits. Root retains preview/browser integration, actual decoder/render lifecycle, visibility/input/picking regressions, production transfer/draw/triangle/DPR/shadow budgets and final captures; Claude retains art decisions and visual review. This completed re-review closes only the inventory/final-stage runtime–CLI parity finding.
