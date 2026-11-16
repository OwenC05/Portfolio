# M4 verifier v3r1: bounded correctness repair

Writer substep ready for independent rereview; no self-approval or candidate integration claim. This is part of active producer task `task_2cf416822c8f` / dispatch `ctx_a0c96415e68d`, not completion of that larger task. ACK `msg_16c64b0982ed`; scope from `m4-verifier-v3-correctness-repair-release.md` and `m4-v03-verifier-correctness-repair-task.md`. Independent review `26951c0ee6dd005f8526148c276c8f784880aff567afaa4a4fd4910b91a4247a` supplied the two reproduced failures and original frozen fixtures.

Only the four assigned successor files were written for this substep. The pure API remains `audit_m4_v3`; declaration/interface schema 3, meanings and bytes are unchanged. All support, normal, payload/source/declaration binding predicates are preserved.

The ordered boundary check now explicitly rejects backward collinear adjacent traversal and any intersecting, touching or overlapping nonadjacent segments before the existing convexity/hull-area checks. It uses the existing segment-distance function and 1e-14 geometric comparison scale. Adjacent shared endpoints and forward collinear subdivisions remain allowed. The returned boundary is the actual ordered polygon (reversed only for winding normalization); it is never replaced by its hull. Invalid boundaries use the existing `nonConvexOrCrossedBoundary` coverage category.

The coverage exception boundary now catches `RecursionError` alongside the existing malformed-input exceptions, yielding `malformedInput`, `valid: false`, `candidateAcceptance: false`, and support/normal `not_run`. Digest checks are unchanged.

## One focused run

`python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3r1-tests.py --write`

**67/67 passed, exit 0, 1.563 seconds**, one suite run, no failed validation attempt or targeted rerun. The fresh exclusive receipt cannot overwrite an existing receipt. The first 58 named controls match the original v3 receipt exactly in name/order; all passed against v3r1, including original 25-support spur rejection, narrow 23-support positive, rounded field/crossing/enclosure, oriented normal/class/coverage and payload substitution controls.

Nine additional checks:

| Fixture | Required observed result |
| --- | --- |
| Independent `ordered` forward-collinear receiver | Full API passes |
| Independent `backtracking` inside variant | Coverage `nonConvexOrCrossedBoundary`; support/normal `not_run` |
| Independent `backtracking-floor` full false-pass counterexample | Same coverage rejection; no downstream run |
| Independently frozen clockwise forward-collinear receiver | Full API passes |
| Independently frozen clockwise backtracking receiver | Same coverage rejection |
| Separately frozen nonadjacent overlap | Same coverage rejection |
| Separately frozen nonadjacent crossing | Same coverage rejection |
| 1,100-level deep declaration | JSON-safe coverage `malformedInput`; downstream `not_run` |
| Cyclic declaration | JSON-safe coverage `malformedInput`; downstream `not_run` |

The original independent fixture row/declaration pins are copied exactly from the protected probe and recorded in the new receipt. Additional finite variants were frozen with stdlib canonical JSON/SHA before the repaired verifier was invoked; expectations are literal test data, not caller-generated live expectations. No hash mismatch substitutes for an intended boundary rejection. The cyclic/deep inputs deliberately cannot have valid finite serialized pins; they exercise malformed-input handling, not acceptance.

Static AST comparison changes exactly `convex_boundary` and `audit_m4_v3`; all other definitions are identical to old v3. The test source and repaired module parse. Receipt implementation/test/interface hashes match current bytes. No extra candidate/source run, search, old broad suite, Blender/export/browser/build/Git/dependency/helper/model action occurred. The inherited fixture driver makes its one lightweight pinned v03 helper snapshot, without running measurement/search.

## Protected inputs and exact identities

48 immutable before/after hashes match, including completed v2/v3 files, artist inputs and prior evidence, all independent review/probe receipts, frozen interrupted snapshots, and controlling release/task files. Current Claude-owned v04 files are neither read nor frozen by this substep. The separately recorded live v03 review pair was not edited. Prior failed evidence is preserved.

| Artifact | SHA256 |
| --- | --- |
| Old v3 module | `0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc` |
| Old v3 tests | `d638fba2f657df9b88a6d4f85ce2906481c642ea54e5784f03a1b26022257659` |
| Old v3 receipt | `eac31cf2e41c24b20de348672b0e74111d11d447bf1e504977a7dce6d1143533` |
| Unchanged interface | `5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97` |
| `scene-coordination/m4-v03-verifier-v3r1.py` | `3f32c40e4eca885219b0cb34e8737a318f8fff803b4dfa1950b3857cd956307d` |
| `scene-coordination/m4-v03-verifier-v3r1-tests.py` | `ee285af8df5e9e5b37a0e1f58b951e03da9cae8fda0563ce7c98344a608c3c33` |
| `scene-coordination/m4-v03-verifier-v3r1-tests.json` | `dc7f06b6f674bd03014f43beb6fe5ce6447f0bd050b54e1227b7e6e213c00ea8` |

This report's final hash is supplied in the status handoff to avoid self-reference.

## Narrow implementation diff

```diff
--- m4-v03-verifier-v3.py
+++ m4-v03-verifier-v3r1.py
@@ -109,6 +109,21 @@
 def convex_boundary(points, location):
     p = np.asarray(points, dtype=float)
     require(p.ndim == 2 and p.shape[1] == 2 and len(p) >= 3 and np.isfinite(p).all(), 'invalidBoundary', location)
+    # Validate the ordered polygon before the convexity/area checks. Unique
+    # vertices and hull-area equality alone allow collinear backtracking.
+    edges = polygon_edges(p)
+    for i, (a, b) in enumerate(edges):
+        preceding = p[i] - p[i-1]
+        following = b - a
+        require(not (abs(cross2(preceding, following)) <= 1e-14 and
+                     float(np.dot(preceding, following)) < 0),
+                'nonConvexOrCrossedBoundary', location)
+        for j in range(i+1, len(edges)):
+            if j == i+1 or (i == 0 and j == len(edges)-1):
+                continue  # Adjacent edges may share their common endpoint.
+            c, d = edges[j]
+            require(segment_distance(a, b, c, d) > 1e-14,
+                    'nonConvexOrCrossedBoundary', location)
     hull = convex_hull(p)
     require(len(hull) >= 3 and len({tuple(x) for x in p}) == len(p), 'degenerateBoundary', location)
     # Comparing the actual boundary to its hull rejects concavity and crossed
@@ -363,7 +378,7 @@
     except CoverageError as error:
         result['coverage']['errors'].append({'code': error.code, 'location': error.location})
         return result
-    except (TypeError, ValueError, KeyError, IndexError, OverflowError):
+    except (TypeError, ValueError, KeyError, IndexError, OverflowError, RecursionError):
         result['coverage']['errors'].append({'code': 'malformedInput', 'location': 'declaration_or_rows'})
         return result
     result['coverage']['valid'] = True
```

Root's retained independent critic owns focused rereview of these repairs. Actual-author complete declarations, settled source pins, producer reproduction and a separate independently reviewed expected digest freeze remain required before any source-integrated candidate pass. The worker returns to the released pure v04 producer preparation; pose comparison and the single selected-pose measurement still wait for their prescribed author handoffs.
