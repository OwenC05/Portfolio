# M4 v04 coordinator recovery, 16 November 2026

This root handoff supersedes stale initial task text for the retry of `task_0f8c639b4873`. Continue the existing portfolio work; do not rebuild completed stages or create duplicate tasks. Actual Claude owns all art/design/Blender work. Actual Codex owns technical implementation and verification. No new paid generation, dependencies, production deployment or main merge.

## Observed recovery

The previous S coordinator `ctx_364aa588fd58`, terminal `term_d778dd3c-3d00-45ad-b8a3-c9fdcaee8e94`, received three error escalations with provider `Bad Request`. A send to continue in place also failed before any ACK. Fresh inspection showed the same live but idle agent, not a lost process.

Root used documented guarded stop after these concrete errors. Stop request `18d7ae2c-0bff-4f57-b6a0-ddd70947e185` returned `state: stopped`, `processAction: closed_agent_terminal`, `ptyKilled: true`. Despite keep-open receipts for the two active performers, the stop cascaded to both: `ctx_5996dc215cff` and `ctx_a0c96415e68d` each reported `outcome: stopped`, `state: stopped`. Do not describe those sessions as still running. Files were not reset or deleted. Retained terminal state is not agent liveness. Confirm each exact dispatch with worker-show before retrying its SAME Task. Never infer exit from silence.

Root retries this SAME coordinator Task in parent run `run_1f8ad467ed73`. Existing child run is `run_63fe6fcaad85`; use the documented run-use path to resume coordination, preserving its tasks and history. If custody refuses, report the exact refusal to root rather than inventing authority, resetting state, or creating a replacement run. Use explicit run IDs on commands.

## Immediate next actions

1. ACK this handoff and report actual model/effort from launch evidence. Read `m4-v04-internal-contract.md` and `m4-v04-combined-repair-disposition.md` before any task handoff. Do not edit artist/producer source yourself.
2. Restore the two stopped original performer tasks after fresh exact-state verification. Author: task `task_23314c669e03`, retry-of `ctx_5996dc215cff`, actual Claude `claude-opus-5-5`, high. Producer: task `task_2cf416822c8f`, retry-of `ctx_a0c96415e68d`, actual Codex `gpt-6-astra`, high. Current shared workspace, retained sessions preferred when proven safely reusable. Stopped processes require fresh attempts; preserve partial files. Read the existing author/producer task briefs, then send current scope promptly so no stale original text is executed.
3. Resume partial preparation, not a clean restart. Claude owns four new v04 geometry/builder/declaration/report files. Codex owns nine new v04 measurement/producer/test/receipt/report files. Existing task briefs and internal contract enumerate exact paths. Do not stage or freeze incomplete files. Root retains Git/integration ownership.
4. Relay approved verifier successor to Codex: `m4-v03-verifier-v3r1.py` SHA256 `3f32c40e4eca885219b0cb34e8737a318f8fff803b4dfa1950b3857cd956307d`. API `audit_m4_v3`, interface/schema 3 unchanged. Root adopted independent report `m4-v03-verifier-v3r1-independent-review.md`, SHA256 `f32e1bd445dbeb141db6df7e237877347ef9b50b2b8ec8784435a287d946650f`: two implementation blockers closed, 7 independent checks plus all 67 writer tests pass. Do not repeat this review or suite absent a new change or concern. This does not approve the candidate or producer.
5. Continue dependency order: author publishes exact interface/source/declaration pins and at most 24 explicit pose options; Codex compares once in the sole heavy CPU lane; Claude chooses; Codex runs full selected-pose measurement once after new exact pins and produces faithful rows/declaration plus source-to-payload reproduction evidence. No automatic art inference. Source review, export provenance/guard release, Blender and actual image gates remain downstream.

## Current evidence and boundaries

Approved root decisions include spur contact/attachment fixes, kick-ring bevel, continuous round-run normals, corrected edge classes/reasons, exact scoped inlays and one bounded pose comparison. The combined repair disposition and final Claude focused review are authoritative. No camera, 30-degree requirement, scope or export waiver is granted. V03 and all failed probes/reports remain immutable. Do not replace frozen failing evidence with corrected results.

Current exported asset remains M4 v02, not unfinished v04. No v04 candidate freeze, full verification, export, browser capture, artistic approval or M4 acceptance exists. No Blender/browser/paid job is released by this recovery. Check fresh memory/resource availability before later heavy work; one heavy lane only.

Latest confirmed pushed commit is `870f59dd9caa0ccfd2a8865277cdc6cbea8efb5a` on `feature/studio-v2-after-hours`; draft PR 2 records bounded verifier approval and pending candidate acceptance. Root Git helper verified remote head and empty index, without rerunning tests. Active S reports, v04 sources/tasks, user-installed skill trees/lock, caches and old blocked marker files remain unstaged. Do not modify or remove user work, old evidence or unrelated processes. All Git mutations remain root-owned/delegated.

Root terminal is `term_d47ddfe4-5e6b-403b-bdaa-3e34d286d27f`. Send bounded progress/blockers there. Retained independent Claude reviewer `ctx_0759ccb535bb` already settled its focused art review with REQUEST CHANGES; reuse later only for newly ready closure. Native root critic already approved v3r1 and is idle. Do not launch duplicate reviews or recursively spawn more coordinators. End the turn after independent handoffs when no own work remains; Orca wakes on actual messages.
