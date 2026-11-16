# M4 v04 producer preparation: active writer checkpoint

**One coarse comparison complete; waiting for actual-Claude selection and fresh source pins.** Earlier checkpoints below are retained as history; the latest comparison section supersedes their dependency status. This is not completion, an independently frozen candidate or an integrated verification pass. Task `task_2cf416822c8f`, recovered dispatch `ctx_55fd1ff42d3b`; recovery ownership ACK `msg_a733b75b550a` (prior dispatch `ctx_a0c96415e68d`, prior ACK `msg_35abd6f56bd4`). Only assigned new Codex paths are writable. No v04 author file has been read, imported or measured at this checkpoint. No coarse or full candidate run has occurred.

The root/S priority verifier substep is handed off separately in `scene-m4-v03-verifier-correctness-repair-report.md`: four additive v3r1 files, one run with 67/67 controls, status message `msg_7053ea5e45a5`. Recovery message `msg_4d94335015dc` relays root approval of v3r1 following 7 independent checks and all 67 writer controls. Successor SHA256 `3f32c40e4eca885219b0cb34e8737a318f8fff803b4dfa1950b3857cd956307d` and independent report SHA256 `f32e1bd445dbeb141db6df7e237877347ef9b50b2b8ec8784435a287d946650f` were freshly matched without rerunning either suite. This approves the verifier implementation only; no candidate audit or independent expected-digest freeze has occurred here.

## Prepared technical boundary

`produce_fullkit_m4_v04.py` has no source execution on import. Its hash-gated loader executes the captured helper bytes only after comparison to the externally supplied exact ready pin; it cannot silently reread changed bytes. The author JSON parser rejects duplicate keys and nonfinite/unencodable data. The pose-table guard accepts only the explicitly supplied at-most-24 poses in root's bounds, requires the old reference, and does not expand, rank or select them.

`snapshot_rows(parts, authored_rows, corner_normals)` accepts the v3-compatible row declarations directly, retaining exact stable author group identities/ranges, raw helper group labels, raw face classes, UV rules and authored normal correspondence. It checks complete row/group/vertex/face coverage and fails rather than assigning missing intent. A helper raw null class can be paired only with the author's explicit out_of_scope class and group reason; raw nulls remain visible in the payload. Actual JSON key placement will be connected after the author-ready schema handoff, not guessed from partial files.

`provisional_product` records helper/author/producer byte hashes, complete canonical rows digest, exact entrypoint/pose invocation and invocation digest. Its declaration and provenance explicitly say independent freeze false and candidate acceptance false. Root/S must review and freeze expected digests separately before an accepted verifier call. Identity generation alone is not proof of source derivation or approval.

`measure_fullkit_m4_v04.py` currently provides tested pure diagnostic primitives: binder candidate eligibility from transparent === false and target/border exclusions; picker visibility/material/layer filtering; labelled target/opaque-blocker/other-project-target/no-hit ray outcomes; transparent exclusion counts; a true vertex cap; deterministic uniform surface-area sampling; exact four-pair indicator scope; signed plane seating offsets; and separate attachment height/footprint diagnostics. Its new raw edge measurement separates convex 40-to-80 and at-least-80 degree bands, concave edges at least 40 degrees, lower angles, boundary/non-manifold edges and invalid/ambiguous orientation. It reports middle-seam length without assigning semantic edge status or cap/lengthwise intent. These are CPU measurements, not rendered pixels, contiguous visible span or runtime interaction certification. Retained-loader metadata and visibility assumptions will be recorded with live measurements. General intersection, author edge-set binding, budget and selected-pose orchestration remain to connect after the declared interface is settled.

## Writer fixture evidence

`python -B design/studio-v2/scene-coordination/m4-v04-producer-tests.py` returned **21/21 passing, exit 0, 0.094 seconds**. No candidate source import, no receipt overwrite and no heavy lane use. The test driver compares 53 immutable input hashes before/after, all matching. It leaves the fresh assigned JSON receipt unwritten until the producer suite is ready for the full handoff.

Recovery first matched all three preserved source/test checkpoint hashes. After adding two analytic edge fixtures, the same command returned **23/23 passing, exit 0, 0.078 seconds**, with all 53 protected before/after hashes still matching. Analytic two-face wedges cover 39, 40, 79, 80 and 90 degrees plus a concave fold; a separate control checks inconsistent winding, an exactly one-metre middle seam and absence of inferred exemptions. This run updates the active dispatch identifier in future fixture receipts; it does not overwrite the prior recorded 21-test evidence or create a candidate receipt.

Controls include changed helper bytes rejected before execution; exact class/group/normal correspondence; duplicate author JSON keys; identity changes for payload/source/entrypoint substitutions; no self-freeze; <=24 explicit pose limits; semantic occluder=false still being a blocker when runtime metadata says opaque; transparent contact exclusion; hidden ancestor/layer/material rules; explicit no-hit categories; project border exclusion and other-target reporting; area weighting at 1:3 versus equal vertex counts; a hard 150-sample cap; only the four exact inlay pairs; and independent floating/outside attachment negatives.

One read-only retained-GLB inspection initially raised StopIteration because it assumed an opaque node name `desk_frame__frame`; a subsequent bounded metadata listing identified the actual `desk_frame__steel`. No measurement or source write occurred in that failed inspection. This will not be used as an inferred runtime identity.

## Checkpoint source hashes

| Assigned preparation file | SHA256 |
| --- | --- |
| `asset-pipeline/full-kit/source/produce_fullkit_m4_v04.py` | `e302a953caf9b1aa8e3bd24b7cc801cf8c95a153bbb77355c544fbc68eafe2fe` |
| `asset-pipeline/full-kit/source/measure_fullkit_m4_v04.py` | `04c269ca38ad2d7e8dc156c52fcc2ffc9f7c5290f16c9999becb814044d626a6` |
| `scene-coordination/m4-v04-producer-tests.py` | `c7549563fca96e9d6543392c3ba0f8da89b27b3ae328abb424bbf1c1ce16ae68` |

These are preparation checkpoint identities, not final candidate/producer freeze values. This owned report will be updated through the authorized sequence with final source/receipt/payload/declaration identities and any failed attempts retained honestly.

Preserved previous checkpoint identities were measurement `eea6c88d83f26d6d27d3c6940b8bca6ae63a0d0e00c99ca29c78462dc02482de` and tests `d3ec2cddf22d15fa498fbe5e981f5adb0f2b36ecfb609242f68b0bd311254c65`; the producer source remains unchanged. A PowerShell `rg` path glob used during read-only picker lookup returned OS error 123; retrying with the directory and `-g` filters found the intended source. No tests or candidate measurement failed during this recovered turn.

## Next dependencies and stop condition

S/author must publish exact helper/declaration ready hashes, declaration key layout and the explicit poseOptions table. The producer will check those pins before consuming source, run one bounded coarse comparison, and return it through S for actual-Claude pose selection. Only a fresh selected-pose source handoff releases the one full geometry/support/cable/target measurement. The accepted verifier plus separate independent expected digest freeze is an additional gate for any candidate audit.

No placement search, art decision, geometry modification, Blender, export, browser, Git, dependency, helper, model/config change or other process action is released or performed. Recovery launch evidence supplied by S specifies gpt-6-astra/high; local configuration reads gpt-6-astra/xhigh and is not proof of the launch override or server-effective routing. S message `msg_5e5501978224` relays author-observed free RAM of only 0.52 GiB; only lightweight preparation was performed, and a fresh resource check is required before any heavy comparison. All fourteen image gates remain open. The worker stays retained and awaits a normal dependency wake rather than polling.

## Interface-ready comparison checkpoint (recovered dispatch)

S handoff `msg_809914d67f98` released exactly the four author pins below. All matched before consumption; helper and declaration matched again after measurement. No author file was edited.

| Input | SHA256 |
| --- | --- |
| Author helper | `83e1445f324159935571a350ea0b501a62f8286be3cee0a0903c11046225e0a3` |
| Author declarations | `f62a5850d8f3071011fc51c568801e0a8b02294e9ac8a2b5a789eeec70aa9abd` |
| Held builder (not executed) | `eb0af482fed07fa8f3c9383019dbd982b3259d0ed25048fb45e118b9ba5c2333` |
| Author report | `1af15373598043e8b686f70b4b989bb50a2a9a038838df7c80a60234071935ac` |
| Producer | `3c9fe150d859087050fed73d3fed54d3a97a5998774c455203e6a00462dc08d1` |
| Measurement | `76a0fbb5fce5145acbea2fddf5ea148ad2288f23b3fd6e0afe396b602819e180` |
| Writer tests at comparison | `a83dd8399b2005379b108a4843d96660fa2693844b2d34b5fe29b89e0e36e702` |

The pinned JSON layout was connected faithfully, including separate pose IDs, stable group IDs, raw face roles and raw round-run IDs. The complete rows producer now preserves the new raw fields; no final rows/declaration artifact has been published and no candidate audit has run. The named selected-pose producer is `produce_fullkit_m4_v04.produce_selected`, still held pending actual selection and fresh pins.

**Targeted writer tests:** 28/28 passed, exit 0, 0.079 seconds; all 53 protected hashes matched before and after. Four new controls cover raw roles/runs/IDs, rectangle/front-face target prerequisites, lifted declared supports and the actual rounded boundary, and retained GLB metadata/transforms. An additional explicit-pose-ID adapter control covers the recovered helper interface. The tests use approved pure polygon utilities, not `audit_m4_v3`; its 67-test suite was not repeated. The final assigned fixture JSON remains unwritten until the complete measurement/producer handoff is ready.

**Failure history:** the first quick interface preflight rejected with `PreparationError: helper/declaration explicit pose interface differs`, before building candidate geometry or casting rays. My adapter had compared helper options containing `id` with the JSON plain-pose list; it now reconstructs the explicitly supplied ID/pose pairs and checks selection status too. This was a producer adapter defect, not author geometry failure. The corrected zero-ray preflight built P00 once for shape and memory sizing: 18 rows, 47,428 scene triangles, 5,501,672 bytes in scene arrays, 69.5 MiB observed working set. No coarse rerun occurred.

**Single coarse run:** `measure_fullkit_m4_v04.py --coarse` with the four pins above; 24 poses, in author order P00-P23, one pose and one ray at a time, 117.828 seconds, exit 0. Receipt `asset-pipeline/full-kit/manifests/m4-v04-pose-comparison.json` SHA256 `fc4af9e7e8842f315aa7ff3a3ff916e3f27977265e0544c4da7473643aa0eb04`. The receipt records the full invocation, all source hashes, metadata/eligibility, per-pose categories, supports, source ledgers and resource samples. No ranking, winner selection, full selected-pose run, digest freeze or candidate acceptance.

**Resource evidence:** before heavy work, free physical memory was 2,165,776,384 bytes (2.02 GiB), above the conservative 256 MiB process estimate plus 512 MiB reserved headroom. Peak observed working set was 75,702,272 bytes (72.2 MiB); the smallest post-pose free-memory sample was 1,421.8 MiB. No other heavy worker or process intervention was used.

**Sampling:** throne upper-roof faces 72-119 in the authored `throne.seat` group, wholly at/above `seat - 0.020m`, include the shoulder and shallow dome. Their 0.101236106945 m2 actual surface area is sampled uniformly with 384 deterministic strata. This is not the prior review's projected top-disc sampling, so percentages are not directly interchangeable. Vertex feature diagnostics use the disclosed source selectors with a real 150-vertex cap; the throne selector contains 73 vertices. Controller envelope uses at most 360 actual own-row vertex hits, excluding no-hit. All figures are source diagnostics, not visible pixels, a contiguous span, or image approval.

**Runtime eligibility:** decoded retained leaf `extras.transparent` and material opacity/sidedness agree with loader behavior; project target/border meshes are excluded as blockers, and binder replacement materials are represented. Transparent contact decals are excluded and their ray intersections separately counted by label. Ancestor visibility, material visibility and layer matches are explicit offline defaults; camera clipping and touch expansion are not certified. All three target meshes pass rectangle, coverage and front-face prerequisites.

**Shared measured constraints:** every option has 81/81 actual own-target hits on each of the three project targets, 25 declared supports within the signed 0.3 mm resting-gap and actual polygon >=20 mm clearance limits, unchanged controller/stand size within 3%, 29 white/20 black keys, and source ledger 18 main contributions / 9 casters / 27 refresh contributions / 13,936 placed triangles / 24,772 refresh-weighted triangles. These counts are source estimates, not measured renderer calls or final transfer acceptance. Minimum support clearance across the table is 33.9378 mm. P15, P18, P21 and P22 have actual-hit angular envelopes below 30 degrees; even envelopes above 30 do not establish contiguous visible span.

### Unranked author pose table

Area and vertex fractions below count actual first hits only. All throne area/vertex samples in this run had zero no-hit outcomes; other categories and per-label blockers/exclusions remain in the JSON. Sustain, hi-hat and kick vertex diagnostics also had zero no-hits. Hi-hat was 95/150 and kick pedal 145/150 at every option; finite vertex subsampling differs from v03.

| ID | cx | cy | yaw | Throne area hits/384 | Throne vertices/73 | Actual-hit azimuth envelope deg | Sustain hits/116 | Min support clearance mm | Min phone key pitch px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P00 | 1.325 | -0.825 | -0.85 | 245 | 45 | 30.910423 | 104 | 49.9013 | 9.4005 |
| P01 | 1.325 | -0.825 | -0.9 | 232 | 46 | 31.245973 | 104 | 41.3351 | 9.3094 |
| P02 | 1.325 | -0.825 | -0.95 | 226 | 46 | 31.499029 | 116 | 33.9378 | 9.1962 |
| P03 | 1.325 | -0.8 | -0.85 | 210 | 44 | 30.798526 | 104 | 74.9013 | 9.2982 |
| P04 | 1.325 | -0.8 | -0.9 | 199 | 45 | 31.113130 | 104 | 66.3351 | 9.2043 |
| P05 | 1.325 | -0.8 | -0.95 | 196 | 44 | 31.345668 | 116 | 58.9378 | 9.0885 |
| P06 | 1.35 | -0.825 | -0.85 | 276 | 49 | 30.493218 | 104 | 49.9013 | 9.3163 |
| P07 | 1.35 | -0.825 | -0.9 | 265 | 50 | 30.835165 | 104 | 41.3351 | 9.2308 |
| P08 | 1.35 | -0.825 | -0.95 | 261 | 52 | 31.095505 | 116 | 33.9378 | 9.1231 |
| P09 | 1.35 | -0.8 | -0.85 | 244 | 46 | 30.389080 | 104 | 74.9013 | 9.2159 |
| P10 | 1.35 | -0.8 | -0.9 | 235 | 47 | 30.710438 | 104 | 66.3351 | 9.1275 |
| P11 | 1.35 | -0.8 | -0.95 | 229 | 50 | 30.950599 | 116 | 58.9378 | 9.0172 |
| P12 | 1.375 | -0.825 | -0.85 | 305 | 54 | 30.084410 | 104 | 49.9013 | 9.2337 |
| P13 | 1.375 | -0.825 | -0.9 | 295 | 53 | 30.432354 | 104 | 41.3351 | 9.1536 |
| P14 | 1.375 | -0.825 | -0.95 | 292 | 54 | 30.699574 | 116 | 33.9378 | 9.0512 |
| P15 | 1.375 | -0.8 | -0.85 | 277 | 51 | 29.987621 | 104 | 74.9013 | 9.1350 |
| P16 | 1.375 | -0.8 | -0.9 | 266 | 53 | 30.315331 | 104 | 66.3351 | 9.0519 |
| P17 | 1.375 | -0.8 | -0.95 | 266 | 55 | 30.562711 | 116 | 58.9378 | 8.9470 |
| P18 | 1.4 | -0.825 | -0.85 | 333 | 57 | 29.696330 | 104 | 49.9013 | 9.1524 |
| P19 | 1.4 | -0.825 | -0.9 | 326 | 58 | 30.037413 | 104 | 41.3351 | 9.0775 |
| P20 | 1.4 | -0.825 | -0.95 | 320 | 58 | 30.311126 | 116 | 33.9378 | 8.9804 |
| P21 | 1.4 | -0.8 | -0.85 | 302 | 56 | 29.594022 | 104 | 74.9013 | 9.0555 |
| P22 | 1.4 | -0.8 | -0.9 | 300 | 56 | 29.927703 | 104 | 66.3351 | 8.9776 |
| P23 | 1.4 | -0.8 | -0.95 | 301 | 58 | 30.181911 | 116 | 58.9378 | 8.8778 |

**Pending:** actual Claude selects through S, then publishes fresh helper/declaration/builder/report pins before one full selected-pose geometry/support/cable/target run and exact payload reproduction. Four proposed edge sets, spur-root 6 mm embedding and inherited footboard overlap remain root decisions; this comparison grants no exception. Full attachment/inlay/edge/normal/intersection/budget diagnostics and final fixture receipt remain to finish. Approved verifier implementation is available, but an independently reviewed expected-digest freeze is still absent. All fourteen image gates and export/browser release remain open. The worker remains retained and will resume on a normal dependency wake.
