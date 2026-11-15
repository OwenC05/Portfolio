# M3 source-preparation technical handoff

15 November 2026. Independent native Codex critic reviewed the in-progress `asset-pipeline/full-kit/source/build_fullkit_m3.py`, SHA256 `feabd772302acd9511096c350561d8fc510f10db06df83cfc00903679c747720`, against accepted PC v05 and the adopted ledger. Read-only inspection: no source edit, Blender, export, browser or build. This is a source-readiness finding, not a failed assembled candidate or a visual review.

## Correct before export

At lines827-831, the retained-node check compares node JSON excluding only `mesh`, including the root `studio_full_kit.children` array. The intended replacement of11 proxy children by9 M3 leaves changes117 children to115 and therefore triggers this check even for a correct export.

Compare the retained hierarchy by node names with exactly the authorized11-to9 substitution, preserving all other node fields, parent relationships and bindings. Do not waive hierarchy validation or merely exclude `children`. S coordinates a narrow Codex-owned guard fix with the source author so shared writes do not overlap, then preflights the expected accepted/rejected cases before the first Blender export.

## Verified preparation and downstream checks

- Lines93-100 pin v05 and its editable v04 source chain. Lines823-885 narrowly restore named exporter-noise words to exact parent bytes and reject other differences. Preserve that behavior through the hierarchy fix; no general numerical tolerance.
- The nine row ceilings are encoded and asserted at line250. Frost has explicit render order1.5 with the required sidedness and flags. Actual exported counts and material behavior still need independent validation.
- The palette comparison at line866 currently checks exported RGB outside the two new cells. Complete independent T2 validation against the actual export: expected authorized cell values, unchanged remaining RGBA including alpha, unchanged other images, texture/sampler references and retained UV meanings. RGB-only preservation is insufficient evidence for the whole authorization.
- The script reports stage counts and raw bytes. Independent compression and a revised whole-room byte/weighted-count forecast remain required under `full-kit-ledger-v01-root-disposition.md`; do not infer final capacity from this source review.

Root accepted the PC parent in `m2-v05-root-disposition-and-m3-release.md`. That resolves the artistic parent dependency; this concrete technical preflight correction remains part of completing M3 preparation. No extra design, optimization, dependency or paid-generation scope follows.
