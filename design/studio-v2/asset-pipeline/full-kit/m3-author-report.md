# M3 nearfield: author report (Claude, task_f514e48085e4 / ctx_4ebc25a81194)

15 November 2026. Author: Claude Opus 5.5, effort high. This is the retained session from task_d31f70e55a5d (argv `--model claude-opus-5-5 --effort high`, inherited, no override).

This report covers my authoring: the art decisions, the source chain, the runs and the measured results. It is not acceptance. Three gates are still open:
- S's v03 restoration candidate and its validation;
- root's technical review and runtime captures;
- the independent Claude appearance review.

Nothing in this report waives a visual gate. `m3-preparation-report.md` is historical; where the two differ, this report holds.

## 1. Source chain and run history

| Step | Source SHA256 | Result |
| --- | --- | --- |
| Prepared and frozen | `7138fed9…` | Handed to S, guard sections only |
| S guard correction, approved 44/44 | `8829c741…` | Lease returned to me (`m3-guard-root-disposition.md`) |
| My art refinement, first dry run | `99f30d42…` | Failed in my frost pre-check: an M2 mesh has an empty material slot, so `m.name` hit None. Fixed (`if m`). |
| Second dry run | (later edit) | Failed the accepted-geometry assert: `kb_case__plate_cable x mon_cables__grommet`, 24 overlaps. Fixed by rerouting the cable (§3). |
| Third dry run | `194c4cd3…` | Passed. Nothing written. |
| v01 save + export | `194c4cd3…` | `source/fk-30-nearfield-proposal-v01.blend` saved (`ab5c93a2…`, 675,118 B). The export crashed in **my** join step: the second part list was built after the first `join()` had already removed the `CABLES` objects (ReferenceError). No GLB. Fixed to v04's exact order (both lists built first, v04 lines 293–296); tag moved to v02. |
| v02 save + export | **`dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209`** (62,171 B) | Outputs listed below. **The reviewed guard rejected the raw export correctly**; no candidate GLB was written. |

v02 outputs:

| File | SHA256 |
| --- | --- |
| `source/fk-30-nearfield-proposal-v02.blend` (675,022 B) | `46c52922…` |
| `exports/studio-full-kit-m3-proposal-v02.raw-export.glb` (1,628,664 B) | `71b39b5c242278408092d3ee95ab4e996df47014eb30ef57383b88f3e526fd18` |
| `manifests/m3-v02-author-measurements.json` | `d10621b3…` |

Each Blender run was a single hidden process (7–12 s), with no other Blender running. Interlock: `FK_M3_PARENT_RELEASE` was set to the v05 SHA `4b2f7b8f…` only for the released save/export runs, per root's written release. The source is frozen at `dccfa288…` while S restores the candidate.

**v02 guard rejection.**
- Three of the four named words recurred with exactly their pinned v04 values, and the script restored them to v05 bytes: `desk_top__top_mesh.002` TEXCOORD_0 (197, 1), (199, 0) and (274, 1).
- The fourth word, `sub_woofer__cabinet_mesh.001` (85, 1), did not recur; it equals v05.
- One new 1-ULP word appeared: `desk_top__top_mesh.002` TEXCOORD_0 vertex 258, component 0. v03/v04/v05 hold `20858b3e` = 0.27250003814697266; the M3 raw export holds `21858b3e` = 0.27250006794929504.
- Exporter float noise is therefore not deterministic across runs.
- I did not edit the guard or the NOISE list; I escalated (msg_5d68688c08b9). S's audit confirmed the finding. Root then released S's separate restorer (msg_b489404fc151, `m3-v02-raw-root-disposition.md`), which produces the v03 candidate from the raw v02 export. I am not duplicating that work.

**Offset-label correction.** `exportReadback.namedNoiseRestorations[].binOffset` in `m3-v02-author-measurements.json` is mislabelled: the values (487532, 487544, 488148) are **whole-file** offsets, not BIN-chunk offsets. The code computes them as the accessor start plus the BIN start. The same words sit at BIN offsets 411384, 411396 and 412000 in the raw export (at 411436, 411448 and 412052 in v05). The file is kept as it was written; this report is the correction.

## 2. Art-only delta from `8829c741` to `dccfa288`

S's reviewed guard helpers, call sites, hierarchy/texture/palette checks and the NOISE list are untouched. The whole diff is:
1. Docstring status text.
2. The mouse intent comment (§4). Dimensions unchanged.
3. Speaker position (0.36, 0.12) → (0.34, 0.14) (§5).
4. Keyboard cable route at the grommet (§3).
5. A `home-1440WidthInPitches` measurement.
6. The frost pre-check now skips empty material slots.
7. The v04-exact join order.
8. TAG v01 → v02.

## 3. Placements (Blender metres) and clearances

| Item | Final |
| --- | --- |
| Keyboard | Centre (−0.795, −0.33) on the mat. 0.52 × 0.18 case, 20 → 30 mm sheared typing angle. 67 caps, pitch 30.5 mm (tier D). |
| Keyboard cable | Coil on the mat, over the mat rim, across the desk. It **rises over the grommet rim** (top 0.7383, r 0.026–0.040) and drops vertically at y 0.200: 20 mm from the hole centre, inside the 26 mm sleeve, 13.6 mm from the central monitor cables at y 0.22. It ends on the tray floor. Measured gap to the grommet: 0.3 mm (resting). |
| Mouse | (−0.395, −0.34) on the mat, 160 × 99 × 56 mm, ivory. Black split grooves, a seam, a rubber/black-metal wheel and rubber feet. |
| Mug + coaster | (0.04, −0.44): blue mug, cream inner wall, coffee surface; oak_tone coaster. |
| Notebook + pen | (−1.45, −0.30), yaw 6°. |
| Microphone | End clamp at x −1.905…−1.842, y 0.17, clear of the side rail (15 mm gap to the frame). Two-section sprung boom. Capsule centre (−1.60, −0.36, 1.10) with a shock-mount ring. |
| Headphones | Dark-oak stand at (0.30, −0.22), yaw 45°. |
| Speaker | (0.34, 0.14), yaw −22°, tier ×1.25 (231 × 263 × 356 mm on a 19 mm pad). |

Measured, all from v02:
- **Resting gaps:** every resting gap is 0.3 mm.
- **Clearances:** speaker to TypeForge stand 67 mm; headphones to TypeForge stand 112 mm; mug to headphones 197 mm; keyboard cable to the central monitor 51 mm.
- **Intersections:** none with accepted M1/M2, architecture or targets. Only overlaps with the later-stage `contact_decals__desk_gear` are recorded: plate/cable 14, notebook 18. Contact decals belong to a later stage.
- **Target rays:** 81/81 for dissertation, copilot and typeforge.

## 4. Mouse: explicit reading of the G3 criterion

G3 (render-gates.md) says "keyboard, mouse and mug sit at one scale (mouse spans three to four key pitches)". The wording comes from art-direction §2 item 1: *"In `home-1440` the mouse is two keycaps wide and the mug a little over two; real ones span three to four."* The criterion was written as the mouse's lateral span measured in key pitches across the home view, as a test of hand-scale coherence.

**My stated reading: the span is the mouse's width across the home view.** I keep the length on the reference 10 : 6 : 3.5 profile, so the mouse is not shrunk below hand scale. A real mouse is about 6.2 real key pitches long; a 3–4-pitch length would make it about 0.6× real relative to the keys.

| Measure | Value |
| --- | ---: |
| Width, world | 99 mm = **3.25** pitches |
| Length, world | 160 mm = 5.25 pitches |
| Height | 56 mm |
| home-1440 projected width | 56.9 px = **3.43** projected key pitches (pitch 16.6 px) |

This is an explicit reading for the independent reviewer, not an exception and not a new threshold. If the reviewer reads G3 as length, the bounded remedy is L 0.12 m and W 0.075 m at the same profile, with the same triangle count. That would make width about 2.5 pitches, failing the width reading.

## 5. Speaker and cymbal readability

The intent is kept: a smaller nearfield speaker (×1.25) that reveals the left cymbal.
- I moved it 20 mm left and 20 mm back.
- **Fixed-eye exact ray result (v02):** 61 of 64 sample points on the top of `drum_cymbals__proxy_cymbal_1` are hit first by the cymbal; **3 (about 5%) are blocked by `speaker_nearfield__cabinet`**, at the cymbal's near-left edge. The pre-move box-model planning estimate was about 11%.
- These are sample-point ray results against the later-stage cymbal **proxy**. They do not prove actual cymbal readability in any frame. Root's actual images decide. I make no music-390 or mid-right claim.

## 6. Rows: measured triangles against ceilings

Counts are after evaluation, from the in-memory mesh, with no modifiers. The exported counts are S's audit.

| Leaf | Triangles | Ceiling | Casts | Main | Refresh | Refresh tris |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| kb_case__frost_shell | 284 | 700 | no | 1 | 1 | 284 |
| kb_case__plate_cable | 648 | 700 | yes | 1 | 2 | 1,296 |
| kb_keycaps__caps | 2,680 | 4,700 | no | 1 | 1 | 2,680 |
| mouse_native__body | 754 | 900 | yes | 1 | 2 | 1,508 |
| mug_coaster__mug_coaster | 720 | 800 | yes | 1 | 2 | 1,440 |
| notebook_pen__set | 208 | 400 | yes | 1 | 2 | 416 |
| mic_boom__assembly | 1,724 | 2,600 | yes | 1 | 2 | 3,448 |
| headphones__on_stand | 1,756 | 2,200 | yes | 1 | 2 | 3,512 |
| speaker_nearfield__cabinet | 884 | 1,100 | yes | 1 | 2 | 1,768 |
| **M3** | **9,658** | stage 15,500 | 7 casters | **9** | **16** | **16,352** |

Against the forecast:

| Measure | Forecast | Measured |
| --- | ---: | ---: |
| Leaves | 9 | 9 |
| Main | 9 | 9 |
| Casters | 7 | 7 |
| Refresh | 16 | 16 |
| Placed triangles | 14,100 | 9,658 |
| Refresh triangles | 22,800 | 16,352 |

No splits, no new casters and no reserve spend. All rows are unique meshes (placed = unique). There is no opaque nocast gear: the only nocast leaves are the frost shell (transparent) and the keycaps, which were planned nocast.

**Frost.** The measured flags are as agreed:
- single-sided (`doubleSided: false`);
- BLEND alpha 0.42;
- `transparent: true`, `occluder: false`, `nocast: true`, `receiveShadow: false`;
- `renderOrder: 1.5`.

The loader disables depth writes.

**T2.** index 19 oak_tone #a47c55 (roughness 0.62) is used by the coaster; index 20 dark_oak #5e4130 (roughness 0.55) by the headphone base. The script checked in memory that every other pixel was unchanged. Exported PNG RGBA verification is part of S's candidate validation.

## 7. Builder-camera estimates and the phone keycap risk

These are builder-camera estimates; root's capture is the authority.

| View | Keycap pitch |
| --- | ---: |
| home-1440 | 16.6 px |
| home-320-f74 | **10.7 px** |
| home-390-f74 | **10.7 px** |

- **R5 risk.** R5 asks for at least 16 px at 1440 and at least 11 px at 320 in the M3 runtime capture. The phone estimate is 0.3 px short.
- **Why I left the layout.** Moving the keyboard 25–50 mm forward would reach only about 10.9–11.0 px by Blender's measure, and it would push the keyboard further into the 1440 project list.
- **R5's own remedy** if the capture confirms the shortfall: P2 reopens for the keyboard alone. That is root's decision, not waived here.

Other builder-camera results:
- **Mug against TypeForge foot (home-1440):** zero projected overlap.
- **Visibility estimates:**
  - The mic, headphones and speaker are entirely outside the 1440 chrome rectangles.
  - The notebook is about half under the project list at 1440.
  - The mug, mic, headphones and speaker fall outside the phone builder frames; the mug was not required to fit the tall phone.

## 8. Bytes and complete-room reforecast (raw v02; the S candidate differs by 16 addressed bytes)

| File | Raw | gzip -9 | Brotli q11 |
| --- | ---: | ---: | ---: |
| v05 parent | 1,228,192 | 585,488 | 483,317 |
| M3 raw v02 | 1,628,664 | 706,368 | 564,514 |
| Delta | +400,472 | **+120,880** | +81,197 |

All measured with Node zlib (gzip level 9, Brotli quality 11).

**Bytes.**
- The ledger forecast M3 at 14,100 unique triangles × 10.96, about 154,500 gzip.
- The measured whole-file delta (which also removes 11 proxies and re-encodes the two palette PNGs) is 120,880.
- Updating ledger option A (1,127,270 asset gzip): 1,127,270 − 154,536 + 120,880 ≈ **1,093,600 asset gzip**.
- With the current all-route JS bound (391,334): about **1,484,900**, under the 1,500,000 hard gate by about 15 KB. This is not a fitting margin to rely on. T1 savings are not counted.
- Option B (T1) remains the planning path. Its condition is unchanged.

**Draw and triangle budget.**
- Main calls stay 111/120 and refresh 141/165 (148 stage + 17 root reserve).
- Refresh triangles: 103,384 − 22,800 + 16,352 = **96,936**, against 140,000 weighted and 200,000 hard.
- The 25,000-triangle reserve is untouched.

Remaining proxies, 59-ID coverage and the exact candidate bytes are S's audit.

## 9. Remaining gates

1. S: exact four-word restoration of raw v02 into the v03 candidate, receipt, manifest, profile/validator run, and the assembled audit (retained v05 bytes, T2 RGBA, image graph, rows, weighted counts, proxies and IDs, compressed bytes).
2. Root: independent technical review, then runtime captures (desktop, phone, nearfield).
3. Independent Claude review of appearance, including:
   - gear identity and material quality;
   - seating and clearances, and UI overlap;
   - the **mouse width reading** and the **10.7 px phone keycap pitch (R5)**;
   - actual **cymbal readability**.
4. Root stage acceptance. No M4. I keep the terminal open for review-driven corrections.
