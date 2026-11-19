# Verifier v3 correctness repair: priority substep for retained Codex

Root release `m4-verifier-v3-correctness-repair-release.md`, message `msg_bcdc700633a6`, supersedes the earlier no-verifier-edit hold only for this four-file additive substep. Read that release and final independent review `m4-v03-verifier-v3-independent-review.md`, SHA256 `26951C0EE6DD005F8526148C276C8F784880AFF567AFAA4A4FD4910B91A4247A`.

The retained actual Codex performer currently owns v04 producer task_2cf416822c8f / ctx_a0c96415e68d. Prioritize this small repair before further producer implementation. No other owner touches these new files. You are not alone: preserve all other edits, original v2/v3 files, independent probes and artist files. The concurrent Claude v04 lane continues; do not require its actively owned new files to stay frozen.

## Exclusive additional files

Write only these four new files for this substep, relative to `design/studio-v2/`:

- `scene-coordination/m4-v03-verifier-v3r1.py`
- `scene-coordination/m4-v03-verifier-v3r1-tests.py`
- `scene-coordination/m4-v03-verifier-v3r1-tests.json`
- `scene-m4-v03-verifier-correctness-repair-report.md`

Keep the existing `audit_m4_v3` API and interface/declaration schema 3 unchanged. The `v3r1` filename denotes the repaired implementation; no new semantic contract is introduced. Do not edit the contract or existing modules/tests/receipts/reviews. The report includes the narrow diff and is the change receipt.

## Required changes and checks

Reject backward collinear traversal and overlapping/intersecting nonadjacent edges in the ordered receiving polygon, preserving forward collinear subdivisions and either winding. Never replace the malformed boundary with its convex hull. Use the independent probe's exact frozen `backtracking-floor` and inside fixtures; assert boundary/coverage rejection with downstream checks unrun rather than accepting a digest mismatch or a later geometry failure.

Convert malformed declaration nesting/serialization recursion failure to the existing JSON-safe invalid-coverage result, `valid: false`, `candidateAcceptance: false`, support/normal checks unrun. Keep this local to input handling and preserve source/declaration/row digest policy.

Retain all 58 existing meaningful regression controls, add the independent negative fixtures and forward-collinear/either-winding positives with category assertions. Run one focused repaired suite after the changes; no placement search. If a run fails, preserve the failure and use a specifically justified targeted rerun. No geometry redesign, class/semantic change, dependency or broad validation framework.

## Handoff and return to producer work

ACK this additive scope and priority. Send S a status handoff when the four files are complete: exact old/new hashes, test count and intended categories, protected-input evidence and narrow diff. This is a substep of the active producer assignment, so do not prematurely settle that larger task. Root's separate retained critic owns focused rereview; no self-approval. After the repair handoff, continue the already assigned pure producer preparation while awaiting approved verifier and exact artist inputs. Do not run source-integrated verification until root supplies acceptance and independent digest freeze.

No helper, Blender, browser, rendering, full build/server, Git, dependency, paid work, model/config or unrelated process action. No artist-file changes, candidate freeze, integration pass or export release.
