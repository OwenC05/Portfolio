# Independent implementation review: M4 verifier v3

**REQUEST CHANGES — two bounded correctness gaps.** The externally pinned complete-payload binding resolves the prior interface finding, and the writer's V1–V3 regressions pass. However, the receiver validator accepts a non-simple backtracking polygon, including a complete API false pass, and malformed deep declarations can escape the promised JSON-safe result. These require narrow technical repairs before implementation approval. Neither finding is a new artistic requirement or a claim that the current authored rug has this topology.

16 November 2026. Reviewed the complete v3 implementation, inherited v2 predicates, complete test source and receipt, binding report, v3 declaration contract, root binding disposition and prior contract/normal recommendations. No unfinished artist implementation, placement search, Blender, browser, server/build, Git, dependency installation or delegation was used. Only this report and new `m4-v03-verifier-v3-independent-*` evidence were written.

## Frozen identities

| Artifact | Verified SHA256 |
| --- | --- |
| v3 module | `0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc` |
| Writer tests | `d638fba2f657df9b88a6d4f85ce2906481c642ea54e5784f03a1b26022257659` |
| Writer receipt | `eac31cf2e41c24b20de348672b0e74111d11d447bf1e504977a7dce6d1143533` |
| v3 interface | `5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97` |
| Binding report | `c76449289e38a5fee2f569eb1d001fc1639b8499a1d7be02c5983a6a88d59cd7` |

## 1. Non-simple receiver outline can pass

`m4-v03-verifier-v3.py:109–126`, `convex_boundary`, checks unique vertices, nonzero edges, nonnegative turns and equality with convex-hull area. Those conditions do not exclude collinear edge backtracking/overlap. The ordered boundary

`[(0,0), (2,0), (1,0), (3,0), (3,3), (0,3)]`

contains overlapping bottom-edge segments and reverses direction along that edge. It is not a simple polygon, yet `convex_boundary` accepts it. The hull-area equality is 9 m² and the collinear turns are zero, so both current checks pass.

The independently frozen **`backtracking-floor`** fixture supplies this actual boundary face as the bare-floor rug outline, plus a disjoint support footprint `[4,4.1] × [1,1.1]` at Z=0.0003. The complete API returns **`coverage.valid: true`, `supportGeometry.valid: true`, `normalValidity.valid: true`, `valid: true`**. This violates the explicit contract that only horizontal **simple convex** receiver polygons are supported. Its declaration/payload/source hashes are valid frozen fixture inputs; it reaches the geometric predicates, not a hash mismatch.

**Smallest correction:** explicitly reject backward collinear adjacent edges and overlapping/intersecting nonadjacent boundary segments, or establish equivalent monotone traversal of the convex-hull boundary. Continue accepting harmless forward collinear subdivisions and either winding. Keep the existing invalid-boundary failure in `coverage`; do not silently replace a malformed actual polygon with its hull. Add the provided negative alongside a forward-collinear positive and retain the rounded-field/edge-crossing/enclosure regressions.

The indoor variant also passes coverage, but then misclassifies an ordinary interior foot as outside because of the reversed edge. Its final `valid: false` is not proof that the required boundary gate works. Both observations are preserved; the bare-floor variant establishes the full false pass.

## 2. Deep malformed declarations escape the API

`validate_coverage` at `m4-v03-verifier-v3.py:187` serializes the declaration before checking its full shape. A declaration with the expected schema, `scope: fixture`, and an extra list nested 1,100 levels deep raises **`RecursionError`** in declaration hashing. `audit_m4_v3`'s coverage exception boundary at `:366` catches several malformed-input exceptions but omits `RecursionError`; the call therefore returns no structured result. No valid declaration pin is necessary to trigger this precondition failure.

The rows-encoding path already converts recursion failures into `invalidRowsEncoding`. **Smallest correction:** similarly bound/validate declaration nesting or include recursion failure in the existing coverage `malformedInput` conversion. Return `valid: false`, JSON-safe errors and `candidateAcceptance: false`, with support/normal sections unrun. Add a direct public-API regression. No art/source, digest policy or downstream geometry rule needs to change.

## What is verified positively

- **Writer suite:** ran `python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3-tests.py` **once, without `--write`**: exit 0, **58/58**, approximately 1.406 seconds. No 209-second search or old broad suite ran. Inspection confirms `check_result` requires coverage to pass and the intended support/normal section to be checked before accepting geometric negatives. Deliberate finite negative fixtures have separate literal frozen identities; the live verification caller does not manufacture expected pins from its candidate.
- **V1:** the complete 25-support source fixture still rejects exactly the two confirmed kick spurs, each +5.025064731369289 mm relative to the intended gap. The separate 23-support positive is honestly scoped. Per-primitive full-vertex footprints and signed minimum-Z checks replace the previous whole-row-minimum omission. Explicit support/source/surface identities, duplicate primitive rejection and one receiving surface per supported row are enforced. Semantic completeness still requires the author's declaration; geometry cannot prove it.
- **V2 except finding 1:** clearance uses the actual horizontal field/outline face, convex footprint edges and enclosed area. Rounded-corner, crossing, enclosure, floor-positive, lift and penetration controls reach their predicates. Nonhorizontal and ordinary crossed receiver tests reject. Geometry tolerance and convex-hull conservatism are explicit.
- **V3:** exact group identities/ranges/counts, one-time vertex/face coverage, class arrays and scope compatibility are checked. Missing, duplicate, unknown and changed scope/class fixtures reject. Required rows check supplied finite unit corner normals, source-fan degeneracy, planar polygon geometry and every oriented planar-corner dot product. No area selector or absolute dot is used; the long smooth bevel positive and tiny planar negative remain meaningful. These are source checks, not exported-normal evidence.
- **Binding:** the complete rows payload is hashed after recursive finite JSON-native validation, including extra fields. Its expected digest sits inside the separately pinned declaration. Source identity is recomputed from actual bytes. Same-topology vertex/normal substitution rejects under unchanged pins; independent substitution also returned `rowsPinMismatch` with geometric sections unrun. Key order, numeric spelling, invalid types and nonfinite values have explicit tests. `candidateAcceptance` remains false on successful and unsuccessful structured results.

AST comparison independently confirms **15 inherited helper/class/predicate definitions are identical to v2**, including support, normal and polygon predicates; `validate_coverage` contains the new binding checks. This was their first independent implementation review, not merely approval by inheritance.

## Independent evidence and limits

The [small independent runner](m4-v03-verifier-v3-independent-probes.py) and [final receipt](m4-v03-verifier-v3-independent-probes-v2.json) contain two positive controls and three unmet expectations corresponding to the two findings: ordered receiver accepted, frozen-payload substitution rejected, backtracking receiver accepted at coverage in two contexts, and deep declaration escape. Fixture hashes were prepared with standard-library canonical JSON/SHA before verifier invocation and are literal expectations. The earlier [observation receipt](m4-v03-verifier-v3-independent-probes.json) is preserved; the follow-up adds the separately frozen bare-floor case rather than changing earlier pins. A successful probe-runner exit records observations and is not implementation approval.

All immutable protected hashes, including interrupted Claude snapshots, remained unchanged. The separately authorized live Claude review pair was measured separately and did not change during these small probes; no claim is made that concurrent owners must keep their live files frozen. The writer's original receipts were not overwritten.

The complete candidate declaration and independently reviewed producing-source → exact rows-payload reproduction remain **UNSATISFIED**. Matching digests establish identity, not source derivation or artistic truth. Actual v03 still lacks complete approved candidate declarations and retains the two spur defects; fixture success does not accept it. G1 geometry repair, V4 edge reasons, embedding intent, final GLB triangle/group correspondence and actual normals, independent images and runtime acceptance remain with their owners.

**Stop condition:** this bounded implementation review is complete. Return the two narrow verifier repairs and focused regressions for independent rereview; no artist integration, export or candidate acceptance is released by this report.
