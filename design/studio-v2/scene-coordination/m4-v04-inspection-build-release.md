# M4 v04 single inspection build: conditional release

18 November 2026. Root accepts the completed preparation for one inspection build and its two sequential technical checks. Execution is currently held by available memory, not by a missing user approval. This release becomes executable only when the fresh resource preflight below passes. It is not candidate, visual or product acceptance.

## Reviewed package

Root read both final preparation reports, checked their file hashes, inspected the builder's complete diff from the frozen predecessor, and read the existing synthetic receipts (31/31 transition and 35/35 correspondence). No suite, source audit, producer or full measurement was repeated.

Paths below are relative to `design/studio-v2/`:

| Prepared input | SHA256 |
| --- | --- |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04_inspection.py` | `2f887453a928020eb9c0ce701afaa97d75ca47ae866b2c986c49576522b6c7f9` |
| `scene-m4-v04-inspection-author-preparation.md` | `ddb72039e872e497dc61eadba521c6e116c02e0534ca156666732f0d0c39d85e` |
| `scene-m4-v04-inspection-technical-preparation.md` | `af222d5d3163d6359088dceb0dd301558cabda0ed8d451c8f373256078d97b7e` |
| `scene-coordination/m4-v04-inspection-transition-guard.py` | `b79fca8ae91c97a8d817154a948e4b7388664e1ddbc5b11c1ffc744de513524c` |
| `scene-coordination/m4-v04-export-correspondence.py` | `a343bd2e8764bd26d8d1060ed78bb300922a3f620554316c738d4401dc17b378` |
| `scene-coordination/m4-v04-inspection-provenance-proposal.json` | `8004a15019e3dcb8a522d01c4026679b639ea05e92bda45de166b507ee91bd6f` |
| `scene-coordination/m4-v04-inspection-export-contract.md` | `baa9dad00bfb21e6d11aef841216364c9c1286d9b5c4d6a5a8a829e5e8c90e21` |

The exact complete before/after scene extras and asset metadata in the proposal are adopted for this one inspection export. The proposal itself stays unchanged as historical preparation evidence. All source, parent, mapping and numerical identities remain those in the root freeze and this package. The source-binding audit already passed; its `candidateAcceptance: false` remains unchanged.

## Resource and execution preflight

The existing `asset-pipeline/full-kit/art-direction.md:225` requires at least 5 GB free before one hidden, factory-startup Blender process. The fresh root sample at `2026-11-18T18:06:57.8108961+00:00` was 1,763,729,408 available physical bytes (1.64 GiB): it does not pass. No Blender peak is known. Do not substitute CPython peaks for a Blender estimate, terminate unrelated processes, restart WSL or add a memory-polling loop. Resume the preflight on an actual continuation/resource update.

Before any release edit or process launch, confirm sufficient available physical memory, the sole heavy-work lane is free, every prepared input pin matches, and all six reserved outputs remain absent. Root also observed `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`, file version 5.2, length 113,041,880 bytes, without starting it. At launch record its actual path, version and SHA256; the builder separately enforces the exact glTF add-on version. A missing/changed executable or failed preflight is reported, not bypassed.

After a passing preflight, actual Claude may make exactly this one-line release change in its inspection builder (the frozen predecessor remains untouched):

```python
# Replace the unique unconditional raise at prepared line 97 with this exact comment:
# RELEASED: one inspection build under scene-coordination/m4-v04-inspection-build-release.md; resource preflight required.
```

The removed line is `raise SystemExit('M4 v04 inspection builder is HELD: preparation only; no Blender execution is released.')`. Preserve every other byte. Root computed the resulting SHA256 in memory without writing or executing it: `7aacb6ab2470a1bb15ce44396677b4be9d7b47f391e3adfb658c940d6a3da9ab`. Verify that exact released hash before launch and use it as the correspondence checker's expected builder hash. If it differs, stop before execution. This is an orchestration release, not an artistic/source change.

Actual Claude runs one hidden Blender process from the repository root with `FK_M4_PARENT_RELEASE=dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` and this argument vector:

```text
--background --factory-startup --disable-autoexec --python-exit-code 1 --python design/studio-v2/asset-pipeline/full-kit/source/build_fullkit_m4_v04_inspection.py -- blend glb
```

The prepared builder writes only its reserved editable `.blend`, raw `.glb` and author-measurement witness. No render, browser, final packaging, repair, source redesign or repeated run is included. S may capture stdout, stderr, exit code, start/end time, preflight memory, peak process working set, executable/released-script/input/output hashes in new exclusive `m4-v04-inspection-run.stdout.log`, `m4-v04-inspection-run.stderr.log` and `m4-v04-inspection-run-receipt.json` under `scene-coordination/`. A failed or partial build remains evidence; do not delete/overwrite outputs or rerun automatically.

## Raw evidence and stop condition

After Blender exits and outputs/provenance are captured, actual Codex runs the exact transition guard, then the exact POSITION/topology/NORMAL correspondence checker, using the final report's invocations and the independently captured raw, witness and released-builder hashes. Run sequentially with fresh available memory appropriate to their stated 128/192 MiB process estimates. Preserve exclusive receipts and raw bytes. A transition failure does not suppress the independent correspondence diagnostic when its inputs are valid. Nonzero diagnostic results are reported honestly and are not converted to acceptance.

Historical retained UV drift and possible strict-normal encoding differences are known diagnostic risks, not pre-build source-repair requirements. No slot whitelist, epsilon, automatic restoration or automatic rerun is authorized. Root dispositions actual measured differences before any final packaging or inspection-preview release. Stop after the one build and two checks with their exact outputs and remaining limits. All fourteen image gates, literal H1 counting, transfer/runtime checks and artistic acceptance remain open; no merge or production deployment is included.
