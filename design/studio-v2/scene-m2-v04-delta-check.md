# M2 PC v04 exact-delta rejection

15 November 2026. **FAIL: four unrelated UV words exceed root's exact repair scope.** The structural validator passes; this is an independent source-delta failure, not a claimed visual defect. Root holds capture under msg_4eaa59de3ed1 and requires owner restoration in a new candidate identity.

Command: `node design/studio-v2/scene-coordination/m2-v04-delta-check.mjs`, exit1. [Machine evidence](scene-coordination/m2-v04-delta-check.json) preserves the candidate hash `560ACB2F2FA1AE36598A5D63AB484F842766AD344D88B065ABAD82286B560EA0` and paired manifest `5CDDBF0F75AC9AFBF92862A7EBDF44BD4D71AED2DF588ABE0D943F3198D28B23`, compared with accepted v03 `7C0D3042...7752`.

The intended delta is present: four PCfront TEXCOORD_0 float words change from0.0625 to0.3125;72 PCglow POSITION words translate the existing strip. Only glow accessor154 min/max and two provenance labels change in JSON. Nodes, material values, images, render flags and counts remain unchanged; the paired manifest differs only by GLB hash.

Four additional float32 words change outside the allowed PC accessors:

| BIN byte offset | Accessor / object | Vertex / component | Absolute change |
| --- | --- | --- | ---: |
| 411436 | 64 / desk_top__top UV | 197 / V | 5.96e-8 |
| 411448 | 64 / desk_top__top UV | 199 / U | 1.19e-7 |
| 412052 | 64 / desk_top__top UV | 274 / V | 5.96e-8 |
| 1074960 | 165 / sub_woofer__cabinet UV | 85 / V | 5.96e-8 |

The artist disclosed these as exporter noise under a local2^-20 tolerance. Root did not authorize that tolerance. The earlier v03 failed probe also recorded numerical noise, but the accepted final v03 BIN was byte-identical; that history granted no exception.

The actual Claude owner received exact byte/accessor locations and the root requirement to restore those four words from pinned v03 in a reproducible new v05 candidate, preserving original v04 and all failed evidence. No broad suite, source guard relaxation, art redesign or numerical blanket allowance is requested. S will repeat the narrow identity-bound comparison on the corrected bytes; root then captures and independent Claude judges the actual PC appearance. M3 source preparation may continue, but its assembled export still needs the reviewed parent.
