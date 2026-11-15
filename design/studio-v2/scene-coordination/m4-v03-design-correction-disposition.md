# M4 v03: independent review decisions

15 November 2026. Root adopts the bounded REQUEST CHANGES in actual-Claude review `scene-m4-correction-plan-critique.md` (`323c52c02a353fe6a3f88e72a21060e6d0842c3c6fd81716c118d907810f03e1`) and its evidence JSON (`240297df262507a7d1a1e46af412092d3e21aacf5df4c77c0a562615dd73d6a7`). This supplements `m4-correction-plan-root-disposition.md`. It releases the following changes to the new CPU-only source preparation; it does not release Blender or export.

## Required corrections

- **N1, flat panels:** implement the reviewer's custom-normal remedy so flat casing faces retain their geometric face normals and the transition occurs across bevels. Codex verifies normals in a consistent coordinate space. A separate bounded Codex check is clarifying the proposed area-only test: long bevel strips may exceed 4 square centimetres and must not accidentally be tested as flat panels. Preserve explicit semantic face/edge classes so verification can distinguish planar panels from bevel and round surfaces. The intended appearance is unchanged.
- **K1, ground contact:** for every floor-supported M4 object, all its support footprints must lie on one receiving surface: either the rug's flat field or the bare floor. Keep the complete support footprints at least 20 mm from the binding, on the appropriate side. Use the existing 0.3 mm intended resting gap and report signed support-height errors; absence of triangle intersections is insufficient. The stool may be repositioned/reoriented within the music area or placed wholly on the floor at floor height, as the actual-Claude author recommends after measuring alternatives. Do not lower the stand to fallback E. Recheck stand clearance, throne, kick and sustain visibility, and project-target occlusion together.
- **H1, key fronts:** add a front-top edge treatment of approximately 3 mm or greater to each of the 29 white keys, following the independent art recommendation. The author chooses the appropriate segment count within the unchanged 1,540-triangle key-row ceiling. Assert actual counts and preserve key count, pitch, gaps and body fit. Full key bevels are not required.
- **S3, rack dimensions:** the 1.16 m target applies to the frame including its clamps. Inventory assigns boom arms to the cymbals. Continue reporting boom-inclusive bounds separately; moving the ride is a composition/clearance decision, not a way to satisfy the frame-width definition.

The preferred raised stand remains the starting point. The author may refine its position, yaw and height within the existing size tolerance while satisfying the combined checks. No camera change or azimuth waiver is granted. If the combined solution cannot meet the requirements, report the precise conflict rather than silently weakening a gate.

## Candidate-specific art allowances

**Rug C11:** root permits the proposed 1.655 by 2.25 m rectangle for the candidate under preparation, at x 0.56-2.215 and y -1.36-0.89. Record the physical span of 1.745 m separately from the chosen 20 mm lamp clearance, 20 mm desk-frame clearance and 50 mm avoidance of the under-desk decal. Keep the inventory target unchanged. This allowance requires the corrected support checks, at least 150 mm of rug beyond the outermost rack foot on each side, and later independent image review showing that the rug fits the kit and does not appear to touch the lamp base.

The allowance must be reconsidered after any change to the rug outline/position/rotation, camera, lamp, desk frame, PC tower or either contact decal; any unsupported rug-bound foot; or an image that contradicts the intended fit. The retained `contact_decals__music_corner` currently overhangs the rug by 35/10 mm and sits 12 mm above its field. Carry this explicitly into M6 contact work. M4 must not edit that retained leaf, and this dependency is not final approval of its appearance. A later M6 correction must revalidate the rug/contact relationship.

**C13 sharp details:** allow the reviewer's named sharp-edge exceptions for this candidate: other white-key edges, black-key edges, knobs, panel pads, transport keys, pad lugs and mount blocks, clamp caps and wing bolts, stand pivot plates and teeth, cymbal wing nuts, pedal hinges, pad-rim inner corners and the rug's inner binding step. White-key front lips and the specified casing edges are excluded. Record the reason per edge set. Reconsider an exception after a closer camera, narrower lens, zoom, larger approved viewport, material/environment/light change, or a rendered part that reads as an unfinished block. There is no blanket bevel exemption or automatic permission to cut black casing bevels for bytes.

These allowances let the candidate be prepared; they do not replace its eventual visual review or authorize export before technical prerequisites are ready.

## Narrow editable-source amendment A1

For script-authored M3/M4 only, the live-modifier clauses in `art-direction.md` sections 5 and `technical-plan.md:54` may be satisfied by a hash-pinned parametric build script and geometry helper as the editable master; the saved Blender file is a reproducible snapshot. This amendment changes the editing method, not required exported shape, materials, reuse or performance.

For the new M4 v03 source and any later retuning under this amendment:

1. Centralize bevel class, tier-adjusted radius and segment count in one named table used by bevel-aware primitives.
2. Declare affected edge sets and sharp exemptions with reasons. Avoid literal bevel radii scattered at call sites.
3. Write appropriate face-weighted/custom normals and verify them independently.
4. Record per-row triangles, bounds, bevelled edge length by class, and remaining hard-edge length by reason. A rerun from pinned inputs must reproduce counts and bounds.
5. Preserve versioned stage files, source, linked library materials and the existing row/reuse contract.

For accepted M3 this records permission for the disclosed script-based editing method; it does not retrospectively claim that the new v03 receipts exist or that M3 passed an unperformed authoring audit. Its accepted geometry and appearance remain unchanged. A future M3 retune must meet the requirements above. Hand edits to the saved blend invalidate script-master reproducibility; a stage returning to live modifiers follows the original method. Any M6 bevel-class retune must rerun and revalidate the affected builder.

## N1 technical clarification adopted

Root adopts the verification correction in `m4-v03-normal-check-contract-review.md` (`cc7812bd57027365bb6e61064eabea6564c7c20aa7eec8c2f9d3b8e07312a3fc`). Triangle area must not select flat panels: a long intentional bevel strip can exceed the proposed 4 square centimetre cutoff. Test every author-declared planar casing-panel triangle, regardless of area, with each exported corner normal within 2 degrees of its oriented geometric normal. Explicit bevel/round groups are excluded from that flat-panel assertion, not from existing normal validity checks.

Codex must verify complete, unambiguous source-to-export group correspondence against the final GLB. A hash-bound offline sidecar/receipt can record this without changing public glTF attributes, extras, leaves or materials. Do not infer classes from the normals being tested. Use matching mesh-local exported positions and normals, account for indexed seam splits, and report group coverage and failures. Check the final exported accessors because any intermediate mesh reconstruction can discard custom normals. This narrows the verification predicate to the reviewed artistic intent; it adds no new art direction or runtime behavior.

## Next evidence

Actual Claude owns the shape and placement changes. S/Codex owns numerical/export verification. Complete durable combined geometry/contact/visibility/count evidence, then return it for root disposition and a focused independent closure of N1/K1/H1/A1/R1-R2. Original critique and all prior candidate files stay unchanged. Exact provenance/guard preparation, new export, grey and runtime images, refreshed compression, M4 acceptance and M5 release remain downstream. The existing render resource hold remains in force.
