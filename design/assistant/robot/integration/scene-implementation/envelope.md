# Interrupted-motion and card enclosure

18 November 2026. [verify-envelope.mjs](../../../../../components/studio/scene/robot/verify-envelope.mjs) reproduces [envelope.json](envelope.json) using the real pinned export and production presentation code. This is a positional enclosure, not continuous mesh nonintersection or room clearance.

## Implemented policy

All ten moving nodes use one common 250 ms smoothstep parameter, translation lerp and normalized shortest quaternion slerp from their current local transforms to one of five authored endpoints. No scale, gaze, lid, overshoot, emission or independent node-clock embellishment is added. A close can traverse dismissal then neutral, at most two 250 ms segments; a new semantic target or epoch during dismissal invalidates that continuation. Done/selection revisions do not replay robot poses, even if a caller advances epoch. Selection has its own bounded 120 ms scalar, driven by the same controller RAF; it affects only that card's 0..6 mm lift and 1..1.15 scale. New/replaced card data adopts the new identity and selection immediately.

Late load, reduced-motion ON and suspension adopt the newest settled target. OFF starts no frame. Hidden/offscreen/zero-size discards remaining motion. No animation callback mutates root state.

## Continuous bound, including arbitrary repeated interruption

For each node, translations remain in the componentwise interval spanned by the five endpoints, including arbitrary repeated current-to-third-target lerps. Every authored neutral rotation is identity. The largest endpoint rotation is 0.558505279 rad (right mitten), below pi/2; the head cap is 0.227462252 rad and tray cap 0.244346137 rad. Each identity-centred quaternion cap is geodesically convex: its positive-w representatives have positive mutual dot products, and shortest slerp remains in the cap. Induction therefore includes any finite number of interruptions. This is broader than the author/independent review's common-parameter endpoint-pair envelope.

For any vector in a node's child enclosure, `|R v - v| <= 2 sin(theta/2) |v|`. The verifier recursively unions actual local geometry boxes and child enclosures, expands each coordinate by this displacement using the farthest box corner, then adds translation intervals. It adds 1e-7 m per node for numerical tolerance. Generated card geometry is included at the extrema of scale/lift before tray rotation is enclosed. The exact single wrapper then transforms the local box. This deliberately drops inter-node and axis correlations; it is conservative rather than an optimized silhouette bound.

| Bound | Minimum | Maximum |
| --- | --- | --- |
| glTF local metres | [-0.203774843, -0.299963209, -0.198377040] | [0.200617255, 0.419151173, 0.200305320] |
| Placed world units | [0.375774083, 2.320058865, -0.618388935] | [1.218375762, 3.470641877, 0.219293680] |

The independent analytic eye check here is more conservative than the coupled author-pair result: it combines the lowest pupil vertex/translation with each lid vertex's maximum Y over the full local-X angular interval, including interior derivative roots. Both eyes retain **0.349014 mm** vertical separation even under those independent extremes. The script asserts fixed lid pivots, local-X-only rotation and identity pupil rotations. This is a head-local vertical gap, not a camera appearance or all-surface collision claim.

## Cards

Use the approved matte `#F4E8CC` rounded paper vocabulary, no emission, source text or scores. Width/height are 34x46 mm for rank1 and 30x36 mm for ranks2..4; thickness5 mm, corner6 mm, lean10 degrees. The APA tray adaptation uses 90 mm slot radius at -56/-18/+18/+56 degrees, with negative X rank1 (viewer-left in the facing view), and local baseY -2 mm, just above the actual floor. The actual inner tray radius is117.558196 mm. Across all vertices and selection scales the radial support is112.274828 mm, leaving **5.283368 mm**. Lift is vertical in the tray frame and does not change that radial margin. This certifies card radial support within the tray, not card/body nonintersection or projected readability.

## Discrete probes and room residuals

The verifier records **5,000 states** through all125 ordered pose triples at interruption fractions .17/.49/.83, plus a500-step deterministic repeated-interruption chain. It uses the actual presentation owner, all four cards, selection changes and closed dismissal. At each sampled state transformed mesh AABBs lie inside the continuous enclosure and quaternion length error is at most2.22e-16. These sampled enclosures are checks on implementation, not the derivation of the continuous bound and not collision tests.

The new conservative world-box angular enclosure against P2's approximate neighbour angles gives TypeForge **-1.972639 degrees**, wall lights **-3.415179 degrees**, speaker **-0.714601 degrees**. These use the actual fixed eye[-0.7,2.8,3.4] and the nearest horizontal point of the world box for conservative elevation. Negative values are overlap warnings; they do not demonstrate silhouette intersections. The older author-pair-only wall-light margin **-0.986454511 degrees** remains a separate, narrower result. The five static clear endpoint images cannot settle interrupted clearance. Anchor, actual silhouettes/cards, phone visibility, backdrop readability, combined transfer/draw cost and performance remain root browser/Claude gates. Nothing was moved or shrunk to hide these residuals.
