# Independent focused rereview: verifier v3r1

**APPROVE the two bounded implementation repairs. No blocking issues found in the reviewed delta.** Both findings in the [v3 implementation review](m4-v03-verifier-v3-independent-review.md) are closed for the exact successor below. This is implementation readiness only, not source-integrated candidate, producer, export or artistic acceptance.

16 November 2026. Read the [root repair release](m4-verifier-v3-correctness-repair-release.md), writer repair report, actual changed branches and added test/category assertions. Independently compared the entire module AST against frozen v3: **only `convex_boundary` and `audit_m4_v3` change**; replacing those two definitions with their preimages reproduces the old module AST exactly. No declaration/interface, binding, support-height, footprint, normal or other predicate change is hidden in this successor.

| Artifact | Verified SHA256 |
| --- | --- |
| Repaired module | `3f32c40e4eca885219b0cb34e8737a318f8fff803b4dfa1950b3857cd956307d` |
| Repaired writer tests | `ee285af8df5e9e5b37a0e1f58b951e03da9cae8fda0563ce7c98344a608c3c33` |
| Writer receipt | `dc7f06b6f674bd03014f43beb6fe5ce6447f0bd050b54e1227b7e6e213c00ea8` |
| Repair report | `606939a3cebb1b9fbbc7222e1a9c2de72eb911ccb6db4f3449ec6dd79a1e0363` |
| Unchanged interface | `5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97` |
| Preserved old v3 module | `0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc` |

**Simple boundary fixed.** `m4-v03-verifier-v3r1.py:114–126` rejects backward collinear adjacent traversal and contact/intersection/overlap between nonadjacent boundary segments before the existing hull/convexity checks. Adjacent common endpoints are allowed. The actual ordered boundary is retained, with winding normalization only; its hull is not substituted. Original independently frozen `backtracking` and `backtracking-floor` inputs now fail specifically as coverage `nonConvexOrCrossedBoundary`, with support/normal sections `not_run`. The original ordered full-API control passes, and direct independent forward-collinear controls in both windings return the expected actual boundary.

**Malformed declaration fixed.** The coverage exception boundary now includes `RecursionError`. Independent 1,100-level and cyclic declarations return `valid: false`, coverage `malformedInput`, JSON-safe results, `candidateAcceptance: false` and geometric sections unrun. No digest check was bypassed or weakened.

Ran the [independent focused runner](m4-v03-verifier-v3r1-independent-probes.py), exit 0: **7/7 independent checks passed**. It extracts only the original fixture definitions/constants, preserving their literal row/declaration pins, and never executes or edits the earlier probe. Its [receipt](m4-v03-verifier-v3r1-independent-probes.json) includes actual results, unchanged protected hashes and the full module diff.

The runner invokes `python -B .../m4-v03-verifier-v3r1-tests.py` **once without `--write`**: **67/67 passed, exit 0**. The first 58 test names/order match the original receipt. The nine added tests assert the intended boundary/malformed categories and downstream `not_run`, rather than accepting hash-gate rejection. Original support, two-spur rejection, rounded-field, signed-height, normal/class coverage and payload-binding regressions remain passing. No heavy placement search or unrelated suite ran.

All protected old/new files and immutable interrupted snapshots were rehashed unchanged. No prior failed probe/receipt was edited. Unfinished v04 geometry and producer files were neither read nor frozen; no Blender, browser, Git, build or dependency operation occurred. Only this new report and its small probe/receipt were written.

**Implementation rereview is complete.** The original candidate's complete author declarations, settled producer sources and independently reviewed reproduction of the exact frozen rows payload remain separate prerequisites. Digests establish identity, not artistic meaning or source derivation. Final glTF correspondence/normals, retained-data checks, actual images and stage acceptance remain downstream. This approval changes none of those gates.
