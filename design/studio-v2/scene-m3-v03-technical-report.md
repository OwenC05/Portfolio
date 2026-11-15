# M3 v03 assembled technical handoff

15 November 2026. Corrected M3 v03 has passed root's independent technical restoration review, and root released actual capture in msg_40f149cdc684. S performed the root-authorized technical restoration; this report remains writer/assembly evidence. The separate [independent review](scene-coordination/m3-v03-restoration-review.md) approves the exact output,106 retained meshes/424 accessors, exact manifest replay and16 negative probes. No Blender, browser, server, build, package or product-runtime operation was performed by S. Actual Claude completed its bounded authoring task as msg_43b6ee68e6f5; M4 is not released.

## Frozen candidate and provenance

| Artifact | SHA256 |
| --- | --- |
| `exports/studio-full-kit-m3-proposal-v03.glb` | `DC9C6A78A704880DB92678908BF7171329F6A80C86B96E2143E44E85E3F36BAF` |
| `manifests/studio-full-kit-m3-proposal-v03.manifest.json` | `060BAB9AF5DD23B4258E03AEF10DE21FAA7C32AA0A6010CD4E09B35089026405` |
| [Separate restorer](scene-coordination/m3-v03-restore.py) | `E6C7A3EA4CCA8539E6B04F8D65DC50C8B2B00CD5E4E32745FEBF8BB90D4158A3` |
| `manifests/m3-v03-restoration-receipt.json` | `4DB3ED948889218411F3182E36E3A543B1E06661B3EDBA65267E95C9233DFB5A` |
| [Assembly audit](scene-coordination/m3-v03-assembled-audit.mjs) | `878235A77C4F1095B6EDEC6B8EDC32FC72CD1A432E5C77976242330FF6243505` |
| [Claude author report](asset-pipeline/full-kit/m3-author-report.md) | `8BDB07B80C154114CF7451FD923ECA5107158B9B4CFF8CF88A10C2E12C918B46` |

Kit-relative paths are under `design/studio-v2/asset-pipeline/full-kit`. Editable provenance remains sourceDCCFA288, v02blend46C52922 and raw71B39B5C. Failed v01 join and v02 guarded export remain preserved. The [root decision](scene-coordination/m3-v02-raw-root-disposition.md) permits only this exact raw/parent pair. The separate restorer pins both complete hashes, unique node/mesh/accessor identity, exact packed layout, derived BIN/file offsets and word bytes. It writes fresh files exclusively and leaves the Claude source/NOISE table untouched.

Four word slots (16 addressed byte slots) restore to parent v05; **four individual bytes actually change**, at full-file offsets487532,487544,488016,488148. Header, JSON, every other raw byte and embedded v02 labels remain verbatim. The v03 label denotes this technical canonicalization, not a new editable Blender revision. Pure replay reproduces the output, altered raw and parent hashes reject, and an existing output rejects before writing: [four bounded guard checks](scene-coordination/m3-v03-restorer-guard-check.json), all pass.

## Assembled checks

The frozen validator passes the new paired manifest: [profile receipt](scene-coordination/m3-v03-profile-check.json). The separate [assembly receipt](scene-coordination/m3-v03-assembled-audit.json) has no failures. It checks the four-byte-only raw delta, complete retained parent attribute/index equality, retained transforms/flags/material definitions, exact11-proxy-to9-row substitution, row budgets and inventory/forecast reconciliation. The earlier [raw audit](scene-coordination/m3-v02-raw-audit.json) directly verifies hierarchy, texture graph/nonpalette bytes and full T2 RGBA; those bytes remain unchanged in v03. Root's separate reviewer must independently validate actual output and implementation before capture.

| M3 leaf | Placed triangles | Row ceiling | Refresh calls | Weighted triangles |
| --- | ---: | ---: | ---: | ---: |
| frost shell | 284 | 700 | 1 | 284 |
| plate/cable | 648 | 700 | 2 | 1296 |
| keycaps | 2680 | 4700 | 1 | 2680 |
| mouse | 754 | 900 | 2 | 1508 |
| mug/coaster | 720 | 800 | 2 | 1440 |
| notebook/pen | 208 | 400 | 2 | 416 |
| microphone | 1724 | 2600 | 2 | 3448 |
| headphones | 1756 | 2200 | 2 | 3512 |
| speaker | 884 | 1100 | 2 | 1768 |
| **M3 total** | **9658** | **15500 stage** | **16** | **16352** |

Nine main calls and seven casters stay within the10-main/18-refresh stage ceilings, without new splits or flags. Frost is single-sided BLEND, transparent/nonoccluding/nocast/noreceive, order1.5. Existing loader behavior disables depth writes; actual ordering and appearance remain renderer checks.

The current assembled export contains115 leaves,119 conservative main passes,44 casters and163 forced-refresh calls, with34200 placed /53432 weighted triangles. Counts assume no culling and account for double-sided BLEND passes. They are CPU forecasts, not observed renderer statistics.

There are40 remaining proxy leaves and three provisional contact leaves. **57 of59 IDs are currently represented**, exactly as in accepted parent v05; `music_cables`(M4) and `wall_cable_run`(M5) are still absent. All59 remain explicitly represented in the final ledger. The initial audit incorrectly required59 in the M3 proposal and failed; [initial receipt](scene-coordination/m3-v03-assembled-audit-initial.json) is preserved. The corrected check requires unchanged parent coverage, no missing current-stage ID and all59 in the forecast. Final59-ID acceptance remains open.

Replacing M3's forecast rows with measured values gives full-room107leaves/111main/30casters/141refresh,59662unique /60982placed /96936weighted triangles. Relative to the adopted base, weighted triangles decrease6448; no positive triangle reserve or root call reserve is consumed. Stage caps,17 root-reserve calls and the independent120main/165refresh/140000weighted ceilings remain unchanged.

## Measured bytes and complete-room risk

Node24.21.0 zlib defaults, each complete file compressed independently:

| Artifact | Raw | gzip | Brotli |
| --- | ---: | ---: | ---: |
| Accepted M2 parent | 1228192 | 586955 | 483317 |
| Corrected M3 candidate | 1628664 | 708057 | 563489 |
| Difference | 400472 | 121102 | 80172 |

Actual M3 geometry buffer views compress to369429 gzip /230910 Brotli over32232 unique triangles; JSON compresses to11053/8600, and encoded image bytes total325144. Following the ledger's per-unique-triangle method with these measured inputs and the updated full-room unique count:

| Forecast | Asset gzip | Plus current all-route JS391334 | With +15% geometry sensitivity and JS |
| --- | ---: | ---: | ---: |
| A: retain current textures, add planned images | 1109017 | **1500351** | **1602924** |
| B: conditional later T1 replacement | 863873 | 1255207 | 1357780 |

Option A is351 bytes above the1.5MB hard gate at this point estimate; **no safe gzip headroom or final transfer pass is established**. This is an approximate planning model, not proof of actual production transfer failure. The hosted JS bound includes unrelated routes and excludes later integration changes; future mesh density and image compression remain unknown. Component compression sums differ from final whole-file compression. Option B remains conditional: no unimplemented T1 savings are counted as capacity.

Claude's approximately1.485MB delta-based estimate uses gzip level9 and substitutes a whole-file stage delta into the original default-level component forecast; it is a different approximation, not a verified margin. S's estimate consistently refreshes the existing ledger method with default-level measurements. T1 remains the already authorized separate versioned art task with independent retained-consumer visual parity, and final complete export/network recompression remains mandatory.

## Visual and remaining gates

No M3 screenshot has been inspected by S or approved here. Author builder-camera rays/clearances are explicitly author evidence: target81/81 samples each, speaker/cymbal61/64 and no accepted geometry intersections are not substituted for root's real renderer or independent geometry review. Actual Claude's mouse-width reading (3.25 world key pitches,3.43 projected), phone key-pitch estimate10.7px versus11px proposal, keyboard/UI overlap, frost appearance and cymbal readability must be judged by independent Claude on actual captures. No camera, geometry or art threshold was changed by Codex.

Root's retained independent Codex review passed and root accepted the measured assembly findings as capture prerequisites in [the capture-only release](scene-coordination/m3-v03-root-capture-release.md). Root is capturing12 raw views and14 static actual-UI composites; source/candidate remain frozen, with no Blender overlap. The independent actual-Claude Fable reviewer is confirmed succeeded/settled/live/idle/retained on ctx_a8a774ce3d8a, ready for exact capture evidence when delivered. Actual images, independent Claude review, stage disposition and later M4/M5/M6 work remain open. Production still uses the accepted pilot; no full-room product completion is claimed.
