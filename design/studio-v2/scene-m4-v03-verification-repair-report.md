# M4 v03 verifier repair: writer handoff

**Implementation ready for independent review; author integration remains held.** The new verifier and focused tests implement V1–V3 without changing the five author inputs or prior evidence. All50 writer regressions pass. The unchanged v03 is still invalid: the two author-confirmed kick-spur contacts remain5.025064731 mm above the intended resting height, and a complete approved candidate declaration is unavailable. No candidate or implementation approval is claimed.

Task `task_3085b11eda21`, dispatch `ctx_ad552ec9aaf5`; ACK `msg_74490b63ba2e`. Retained actual Codex, no model override/restart/helpers. Local configuration was rechecked as `gpt-6-astra` / `xhigh`; server-effective routing is unobservable. This is the implementation-writer lane; root/S assigns a different independent reviewer.

## Interface and behavior

The [declaration contract](scene-coordination/m4-v03-verifier-declaration-contract.json) was sent early to S as `msg_f80d06087d57`, SHA256 `71eb54107e54ae94856ea3461471a1afe3e3a27b7de97bfe5a331fe91c8e5293`. S acknowledged it in `msg_68a55627902b` and announced its separate static review in `msg_79cbee29a3af`. **Its meaning and bytes have not changed.** That review's file was not edited or relied upon as an approval.

Pure API in [m4-v03-verifier-v2.py](scene-coordination/m4-v03-verifier-v2.py):

```python
audit_m4_v2(rows, declaration,
            expected_declaration_sha256=frozen_digest,
            source_bytes=actual_source_bytes)
```

The module performs no file I/O, source execution or input mutation. It hashes the supplied source bytes itself and checks an externally frozen canonical declaration digest. Live row IDs, group identities/ranges/counts and face-class arrays must match the expected declaration. Duplicate IDs/ranges, uncovered vertices/faces, unknown groups/classes, missing declarations/pins and unpinned reclassification fail closed. Results separate `coverage`, `supportGeometry` and `normalValidity`; coverage failure leaves geometry/normal checks `not_run`. `candidateAcceptance` is always false.

- **V1:** each explicitly declared support references one unique primitive and receiving surface. Every vertex in that primitive contributes to its projected footprint. Height uses that primitive's minimum Z relative to the actual field height or bare-floor Z=0, then subtracts0.0003 m. Both lift and penetration beyond0.000001 m reject. Mixed receiving surfaces within a row reject. No row-minimum selector or inferred decorative status remains.
- **V2:** field/outline boundaries come from actual authored polygon references in the supplied geometry. The footprint is the conservative convex hull of the complete primitive projection. Polygon-to-polygon distance includes edges, crossings and enclosed area: a floor footprint whose vertices are outside but edges cross the rug, or which encloses the rug entirely, rejects. Clearance must be at least0.020 m, with1e-9 m numerical comparison tolerance. Horizontal simple convex boundaries are the supported scope; concave/crossed/nonhorizontal receivers fail closed.
- **V3:** full-length valid classes and exactly-one group ownership precede normal checks. Required rows need one supplied normal per source polygon corner, finite and unit within1e-6. Every source fan triangle must be nondegenerate; declared planar polygons must be planar within1e-9 m. Every planar triangle corner uses `dot(normalized supplied normal, oriented geometric normal) >= cos(2°)`, irrespective of area. Bevel/round faces retain validity checks and are excluded only from the flat assertion. The verifier does not replace authored normals, average failures or use absolute dot products.

## Fresh validation evidence

[Regression driver](scene-coordination/m4-v03-verifier-v2-tests.py) and [exclusive receipt](scene-coordination/m4-v03-verifier-v2-tests.json). Commands used `python -B`; only the pure frozen geometry helper was imported, with one cheap geometry build per driver run. No measurement script, builder or placement search was run.

1. `python -B design/studio-v2/scene-coordination/m4-v03-verifier-v2-tests.py` —47 initial checks passed; after adding derived-overflow JSON safety and boundary/zero-normal controls,50 passed.
2. `python -B design/studio-v2/scene-coordination/m4-v03-verifier-v2-tests.py --write` —50/50 passed, exit0,0.75 seconds; exclusively created the fresh receipt. Existing receipts cannot be overwritten by this driver. Full placement-search runs:0.

Key evidence:

| Control | Result |
| --- | --- |
| Frozen actual25-support fixture, including both intended spurs | Rejects exactly the two spur height errors; coverage passes |
| Separate narrow actual23 ordinary-support fixture | Passes; explicitly excludes spurs from this positive fixture, never from the failing25-support fixture |
| Raise actual rack rubber foot5 mm / lower it1 mm | Both reject independently of other feet |
| Missing/unknown/duplicate support, same primitive under two IDs, absent/mixed surfaces | Reject |
| Rounded corner `(0.606,-1.314)` | Actual clearance19.318516526 mm; rejects the rectangle's20 mm claim |
| Bare-floor whole footprint / edge crossing / enclosing rug | Valid disjoint footprint passes; crossing and enclosure reject |
| Actual authored shell-slab class/normal fixture | Passes |
| Actual corner tilted3° /1.99° / reversed | Reject / pass / reject |
| Missing/null/unknown/reclassified classes; missing/duplicate/overlapping groups; wrong ranges/counts | Reject |
| Degenerate triangle; missing/nonfinite/nonunit/zero normal | Reject |
| Long smooth bevel above the obsolete area threshold | Passes as bevel; forced-planar negative rejects |
| Tiny planar triangle with wrong normal | Rejects despite area below the obsolete threshold |
| Null arrays or nonfinite derived measurements | JSON-safe rejection |

Fixture declarations are intentionally limited test expectations grounded in inspected source, the author's confirmed spur intent, or clearly synthetic geometry. Support-only fixtures explicitly make no N1 assertion. The normal fixture selects an already fully classified source primitive. **No complete artistic candidate classification was invented.** Tests freeze their fixture expectations locally to exercise mutation detection; production must use root/S's independently frozen expected declaration digest, never a freshly repinned candidate.

Before/after hashes match for all protected inputs recorded in the receipt: the five author906b7d6 inputs, prior probe/report/receipt, mapping/profile/ledger, guards, protected v01/v02 artifacts, and interrupted art review/partial evidence. The previous failure history remains unchanged. Only the five newly assigned files were written. No Blender/browser/render/build/Git/dependencies/process action, provider-limit workaround or helper worker was used. The [Orca orchestration skill](C:/Users/Owenc/.agents/skills/orchestration/SKILL.md) supplied the dispatched-worker communication protocol.

## Exact handoff identities

| New file | SHA256 |
| --- | --- |
| `scene-coordination/m4-v03-verifier-v2.py` | `12658d50605c9bc7fe625151adf05a8b9faa993c4f378cc99a502402ebf24710` |
| `scene-coordination/m4-v03-verifier-v2-tests.py` | `af71947a0647259ce22eed99a17193f3f8072f63bad3f494a0341d53b7aea00a` |
| `scene-coordination/m4-v03-verifier-declaration-contract.json` | `71eb54107e54ae94856ea3461471a1afe3e3a27b7de97bfe5a331fe91c8e5293` |
| `scene-coordination/m4-v03-verifier-v2-tests.json` | `31648785e1d4fa93b1a16daa9f941af0de8418d4eefe74db0d3fecc41899246c` |

This report's hash is supplied in the Orca completion message rather than embedded self-referentially.

## Remaining dependency and limits

Root/S must obtain independent interface/implementation review, then explicitly release actual-Claude geometry and complete semantic declarations with one owner per file. G1 geometry, V4 edge reasons, embedding intent and70/10 mm contact wording remain held for their owners. The author must enumerate every independently contacting primitive, including the kick spurs; group several feet under one identity only by changing the reviewed contract, not as a way to hide a lifted foot. The verifier cannot infer completeness of physical support intent or authenticate an author's semantic choices from geometry: the independently frozen declaration is that boundary.

The caller must capture live arrays from the pinned sources; source-byte hashes do not independently prove that arbitrary supplied arrays came from those sources. Snapshot/group correspondence and the declaration freeze must be reviewed at integration. Conservative hulls can reject concave support primitives; no generic collision engine or automatic split is provided. Source fan triangulation is not assumed to match Blender/exporter triangulation. Final GLB needs the separate hash-bound triangle/group correspondence plus actual POSITION/NORMAL/index checks. Retained-data guards, actual images, production transfer and lifecycle budgets remain downstream.

The implementation handoff is complete. A green writer regression suite is not approval of this verifier or the invalid v03 geometry.
