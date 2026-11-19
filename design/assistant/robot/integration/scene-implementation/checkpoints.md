# G2 review checkpoints

18 November 2026. Both checkpoints are implemented in this working tree. These are review cuts, not Git commits or independent acceptance. Root owns Git and the final integrated application.

| Checkpoint | Review surface | Completion evidence |
| --- | --- | --- |
| G2a optional attachment and activation | `lib/studio-contract.ts`, `StudioScene.tsx`, controller lifetime/import/status functions, `picking.ts`/`types.ts`, `robot/load-robot.ts`, `robot/resources.ts`, generated profile and pinned public GLB | Absent-input control performs zero dynamic imports/loads/status callbacks; actual installed r187 imports pinned bytes; 28 private resource identities dispose once; stale load/rejection fences; robot request and draw failures preserve the room; actual mesh activation uses the existing pointer pipeline |
| G2b current data and finite motion | `robot/presentation.ts`, `robot/cards.ts`, controller update/render/suspension integration | Exact G1 snapshots, 0..4 ordered marks, immediate replacement/clearing, selection identity, late-load settled adoption, reduced-motion ON/OFF, hidden/offscreen/zero-size resumption, finite stopped scheduling, interrupted dismissal epochs, original-finger opaque blockers |

The early public interface was sent to root as `msg_0b43a2c1936b`. Root subsequently confirmed its independently owned StudioExperience assembly consumes that interface. G2 never edited that caller, UI, hook, transport, room, camera, lighting, authoring/review inputs, package/config files, `.next`, preview or Git state. The absent-prop control remains supported even though root has now enabled its own assembly.

The final targeted suite has 82 passing cases: 61 retained controller/picker controls, seven controller integration cases and 14 robot/loader/presentation/picker cases. The latter include direct guard sensitivity probes; removing skin presence, POSITION bounds, marker clearing, robot blockers or the original-finger check admits the corresponding invalid control. Two old controller input-qualification mutations remain covered. See [verification](verification.json), [envelope](envelope.md) and [handoff](handoff.md).
