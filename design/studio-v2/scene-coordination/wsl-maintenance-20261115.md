# WSL memory-cap maintenance

15 November 2026. User explicitly approved restarting WSL after preflight. Portfolio work was checkpointed at `b55957e`; S acknowledged zero active assignments and no memory save in flight. A retained independent reviewer was succeeded/idle. Ubuntu showed agentmemory, its keepalive and normal system services plus an idle login shell; no separate compute workload was observed. The agentmemory API had no active TCP connection at the final pre-stop check.

## Completed and verified

- Existing `.wslconfig`: memory6GB, swap2GB, autoMemoryReclaim=gradual. No additional memory-config change made.
- Graceful `systemctl --user stop agentmemory.service` exited0 after about25 seconds; service became inactive/dead with Result=success. The observed state, engine, compose and node worker PIDs exited.
- Copied the stopped `state_store.db` directory to a unique backup. All481 files /947458600 bytes matched SHA256 inventories; the source remained unchanged during verification. Inventory digest: `6b15c3d3ea0b04169e4aefabbc5569cdb7773b9e92df988917302f28fe482e8a`.
- `wsl --shutdown` completed; `wsl --list --running` reported no running distros. The verified hidden Startup `AgentMemory.vbs` relaunched the existing keepalive/service at12:34:28UTC.
- Ubuntu now reports6065816KiB total memory (5923MiB usable, consistent with the6GB VM cap) and2GiB swap. Service is active/exited, its expected oneshot state; Result=success.
- Public loopback liveness and authenticated expanded REST recall returned200. Known observation `obs_mwh4nuxe_47ad4586c123` matched pre-restart ID, title, narrative, facts, session and timestamp. No memory was created as a test.
- Root's actual agentmemory MCP `memory_sessions` call succeeded after restart. Other sessions need reconnect only if their own connection fails; no blanket agent-session restart was performed.
- The exact temporary backup was rechecked and removed only after recall verification, as requested. The live store remains present.

## Completed memory measurements

| Observation | State worker RSS | Node worker RSS |
| --- | --- | --- |
| Immediately before graceful stop |4589840KiB (~4.38GiB)|861624KiB (~0.82GiB)|
| State worker age17s after restart |3307180KiB (~3.15GiB)|603052KiB (~0.58GiB)|
| 12:36:51UTC, age134s, after known recall |3281004KiB (~3.13GiB)|747112KiB (~0.71GiB)|
| 13:04:30UTC, 30-minute follow-up |4437412KiB (~4.23GiB)|720444KiB (~704MiB)|
| 13:34:29UTC, 60-minute follow-up |3690312KiB (~3.52GiB)|833604KiB (~814MiB)|

The worker returned to multi-gigabyte RSS during startup and remained there at both follow-ups. This does not establish a leak or the cause of the in-memory footprint. Do not lower the cap to4GB based on a hoped-for1-1.5GB settling point; that settling point was not observed. No pruning, consolidation, secret/config changes or cache-reclaim mode change was performed.

A hidden, root-owned Node monitor (PID23624 at launch) recorded both scheduled follow-ups and sent Orca notifications to the existing root Run. Its completion event was written at13:34:29UTC, and root verified the process had exited. The monitor did not start Ubuntu if the distro was not running.

At30 minutes, service remained active, available guest RAM was482852KiB (~472MiB), and swap usage was892656KiB (~872MiB). State RSS increased about1.10GiB from the post-recall startup sample. This shows the restart did not resolve the high memory footprint; it does not distinguish normal loaded/cache growth from a leak. Keep the6GB cap. A4GB cap is not supported by the observed resident workload and current swap use. A separate Windows check shortly after the sample found about1.17GiB physical RAM free. No pruning or automatic cap/reclaim changes were made.

At60 minutes, service was still active. Available guest RAM was797348KiB (~779MiB), with1018072KiB (~994MiB) of swap in use. State RSS fell from its30-minute sample but remained about3.52GiB; Node RSS was about814MiB. A lower RSS with more swap does not establish that the workload needs less memory. Retain the6GB cap. Diagnosing the engine's allocation/cache behavior is separate work; these samples do not justify a4GB cap or deleting/consolidating stored memories.

Local machine-operation scripts, backup/recall receipts and raw metrics are under `C:/Users/Owenc/.codex/tmp/agentmemory-restart-20261115/`. Credentials and recalled memory contents are not copied into this repository.

## Portfolio continuation

Maintenance release sent as `msg_1f3e25453d49`. Resume FKT-1 with new Codex Astra/high and M2 workstation art with new Claude Opus5.5/high. Preserve actual inherited settings for the retained technical reviewer. One Blender process at a time and bounded previews remain necessary under the current memory limit. Final asset, integration and acceptance work remains open.
