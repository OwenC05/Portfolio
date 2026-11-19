# Accidental worker closure reconciliation

User reported accidentally closing several workers. This is recovery steering, not cancellation of the portfolio goal. Root read the installed Orca recovery guide and inspected exact handles plus all workers in root Run `run_1f8ad467ed73`, S Run `run_63fe6fcaad85` and U Run `run_9e2c28f2f96d`.

- Both existing parent coordinators remained live/running: S `ctx_364aa588fd58`; U `ctx_fb9f5e79f23d`. They were not replaced.
- Most closed leaf attempts already reported succeeded. Saved reports/source remain authoritative artifacts; no unnecessary restart was made.
- U repair `ctx_0e9a4174cb64` was failed/exited. Its coordinator verified exact exit/reclaimability, released the exited resource and preserved partial edits. An initial retry-of was refused because the same task was already ready; after inspection the coordinator resumed that same `task_1028a39cc004` as actual Codex `ctx_64f321e54538`. Root independently observed replacement ready/input_accepted/live, then received coordinator receipt `msg_1e84061f8ab4`. Repair correctness still needs completion and independent re-review.
- New S follow-up `ctx_dacb90594fdc` / `task_a8910075c00f` was initially starting/unverifiable and then independently observed ready/input_accepted/live/working. Root did not treat the initial uncertainty as exit or start a duplicate.
- Historical S technical `ctx_126044f79bb6` still carries start_unknown, but exact worker-show reports live/active/idle and earlier execution evidence exists. Its stale startup label does not authorize recovery or termination; S retains ownership.
- Preview port4181 remains listening on observed PID34212. No preview restart or stop was needed.

Root informed the two live coordinators of the accidental closures and left child recovery to their owning Run. No orchestration reset, task duplication, terminal steering, broad shutdown or source rollback occurred. The aggregate goal and all unfinished validation remain active.
