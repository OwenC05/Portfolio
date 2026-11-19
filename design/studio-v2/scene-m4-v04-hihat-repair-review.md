# M4 v04 hi-hat repair: selected construction

**Status: final for this dispatch.** 16 November 2026. Critic: actual Claude Fable 5.2 (`claude-fable-5-2`, `--effort high`, observed in my own process argv, PID 11168), the retained session behind reviews `4157a176` and `1af11ba5`. Task `task_6e9285291cc1`, dispatch `ctx_7107a0b44854`. ACK `msg_9ec4298dd0e3`.

**What this is.** Root's release `m4-v04-hihat-repair-release.md` (`038dc8af…dc68`) delegates one construction choice for two connected hi-hat defects. This report makes that choice and gives the author the exact parts and criteria. It is a source recommendation only: not visual, export or candidate acceptance. All fourteen image gates stay open.

**The remedy fits every bound in the release, so S can relay section 3 to the author directly. Nothing here needs a new root decision.**

Evidence file: `scene-coordination/m4-v04-hihat-repair-review.json`.

## 1. The choice

1. **Hinge: seat the barrel in the base.** Lower the hinge axis 6.0 mm so the barrel sits 3.0 mm into the flat top of `hihat.base`. The board's pivot moves with it.
2. **Toe: rest the board on the housing lip.** Re-aim the board about the lowered pivot so its underside rests on the front edge of the housing's top, with the kit's usual 0.3 mm resting gap and no overlap.

Both are changes to authored numbers only. No part is added, removed or renamed.

| | Checkpoint `005955c6` | Selected remedy |
|---|---|---|
| Barrel axis above the base top | 12.0 mm | **6.0 mm** |
| Barrel against the base | 3.0 mm clear: touches nothing but the board | **seated 3.0 mm** into the top cap |
| Board pitch | 12.265° | **13.981°** (derived, see 3.1) |
| Board against the housing | six housing vertices up to 0.57 mm inside the board | **rests 0.30 mm** above the lip; no vertex inside |
| Row triangles | 300 of 600 | **300 of 600** |
| Groups, vertex and face indices, classes, round runs, edge sets | | **all unchanged** |
| Vertices that move | | 24 barrel + 32 board; base, housing and heel rubber: none |

The right-hand column is my own what-if, built in a scratch script with the helper's primitives **[M]**. It is not the author's implementation and not a measurement.

## 2. Why this construction

### Hinge options

| Option | Verdict | Reason |
|---|---|---|
| Lower the axis 3 mm so the barrel rests on the base (author's a) | Not as stated | The barrel is 12-sided with a ridge at the bottom, so it would touch along one line at zero depth. That is not a mount, and its only criterion would be an exact equality |
| **Lower the axis 6 mm so the barrel is seated 3 mm** (a, made positive) | **Selected** | A hinge knuckle sunk in the base plate. It is the construction root already accepted twice in this kit: the spur arm in `kick.base` and the footboard in `kick.heel`. A named pair, a bounded depth, entry through one flat face. Zero triangles, no new part, no new edge |
| Two end brackets (author's b) | Rejected | The board is 104 mm wide and the barrel 90 mm, so the board's heel corners overhang each barrel end by up to 7 mm. Brackets at the barrel ends would cut those corners. Avoiding that means lengthening the barrel and fitting the brackets into 9.9 mm strips beside the board. Each bracket is also a new small sharp-edged part that no existing grant covers, which would be a new scope decision. And brackets leave the pivot where it is, so they do nothing for the toe |
| Accept the gap (author's c) | Excluded by root | |

### Toe options

| Option | Verdict | Reason |
|---|---|---|
| Designed clearance only | Rejected | A board held by its hinge alone, hovering over the housing, has nothing visible carrying its toe |
| Constructed seat in the housing | Rejected | The board rises toward the toe and overhangs the housing's front edge, so it cannot enter through one flat face. It is also 4 mm wider than the housing. A seat would cut the bevel band and both plan corners, which is what the 0.57 mm defect already does |
| Added stop pad | Rejected | A new part with new edges, for no gain over the lip |
| **Rest on the housing lip, 0.3 mm resting gap** | **Selected** | It is what the pedal already depicts, made exact. 0.3 mm is the kit's resting gap (`EPS`), the same relation as the display face on its bezel. No overlap at all, so no overlap allowance is needed |

### Why the two go together

Lowering the pivot with the old pitch would drive the toe further into the housing. So the pitch is not chosen: it is derived from the two contacts. The underside plane passes through the barrel axis at the heel and lies 0.3 mm above the housing lip. Fixing the hinge and the toe is one adjustment.

## 3. Relay to the author

All coordinates are in the **pedal frame**: `M = T(cx, cy, ON_RUG) @ Rz(yaw)`, as `hihat_pedal()` already builds it. Local x runs across the pedal, y from heel to toe, z up from the resting height. `HIHAT_PEDAL` is unchanged.

### 3.1 Geometry: two authored values, one derived

1. **Hinge axis height:** local z 0.022 → **0.016**. Stated as intent: `axis_z = base top (0.010) + barrel radius (0.009) − seat (0.003)`. The barrel's x extent (±0.045), y (−0.135), radius, 12 sides and material are unchanged.
2. **Board origin:** the same point. The board's heel edge stays on the barrel axis.
3. **Board pitch (derived):** with the lip at local (y, z) = (0.083125, 0.070), the front edge of the housing's top cap:
   - Δy = 0.083125 − (−0.135) = 0.218125; Δz = 0.070 − 0.016 = 0.054
   - `rise = atan2(Δz, Δy) + asin(EPS / hypot(Δy, Δz))` = **13.9813°** (was 12.2648°)
   - The plan run stays 0.23, so the toe tip stays at local y 0.095. The lift over that run becomes 57.27 mm (was 50.0).

The lip's y is `l/2 − 0.085 + bev('casing')`. Please derive it from those terms, not from a literal.

**Not to change:** `hihat.base`, `hihat.housing`, `hihat.heel`, the board's outline and thickness, the barrel's size, `HIHAT_PEDAL`, the hi-hat cable jack, P14, the cheeks and every other row.

### 3.2 Exact identities (row `drum_hihat_pedal__pedal`, 160 vertices, 114 faces)

These are the checkpoint's indices **[M]**. The remedy keeps the topology, so they stay valid.

| Group | Vertices | Faces | Triangles |
|---|---|---|---|
| `hihat.base` | 0–47 | 0–37 | 92 |
| `hihat.housing` | 48–95 | 38–75 | 92 |
| `hihat.footboard` | 96–127 | 76–93 | 60 |
| `hihat.hinge` | 128–151 | 94–107 | 44 |
| `hihat.heel` | 152–159 | 108–113 | 12 |

Both ends of each range above are inclusive. In the declaration, write every locator below as an explicit list.

- **Base receiving surface:** top cap = face **1**, vertices `[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]`, outward normal +z, 10.0 mm above the underside cap (face 0). In plan it spans ±61.875 by ±161.875 mm.
- **Barrel:** ring 0 = `[128 … 139]`, ring 1 = `[140 … 151]`, side faces `[94 … 105]`, end discs `[106, 107]`.
- **Board:** underside face **76**, vertices `[111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96]`; top face **77**; side faces `[78 … 93]`; heel-axis vertices `[107, 108]`; toe-tip underside vertices `[99, 100]`.
- **Housing:** vertices `[48 … 95]`; top cap = face **39**, vertices `[84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95]`; **lip vertices `[86, 87]`**, at local (∓46.038, 83.125, 70.0) mm.

### 3.3 Meanings to state in the metadata

- **Axis:** the line through the centroids of ring 0 and ring 1.
- **Radius:** the vertex radius, 9.0 mm. The inscribed radius is 8.693 mm.
- **Seat depth:** the greatest perpendicular distance of a barrel vertex below the plane of face 1. It is not the axis drop (6 mm) and not the width of the trough.
- **Axis height:** the perpendicular height of each ring centroid above that plane. It equals radius minus seat depth.
- **Thickness:** the distance between two parallel cap planes. Board: faces 76 and 77, 8.0 mm. Base: faces 0 and 1, 10.0 mm.
- **Clearance (toe):** the signed perpendicular distance from a housing vertex to the plane of face 76, positive on that face's outward (lower) side.
- **Frame:** say whether each coordinate is in the pedal frame or in Blender world metres.

### 3.4 Criterion A: supported hinge (new pair)

Declare `hihat.hinge` into `hihat.base`, relation `embedded`. This is the artist's intent: **the hinge barrel is a knuckle seated in the base plate.**

1. Exactly this pair. It is not a same-row overlap allowance.
2. **Seated vertices:** exactly `[133, 134, 135, 145, 146, 147]` are below the plane of face 1. Every other barrel vertex is at least 1.0 mm above it (1.5 mm by the 12-gon's geometry; my script did not print this figure).
3. **Seat depth:** 3.0 mm ± 0.05, reached by vertices 134 and 146. The other four are 1.79 mm deep.
4. **Through the top cap only:** every seated vertex lies inside the outline of face 1 in plan by at least 10 mm (what-if: 16.9 mm). No barrel vertex is less than 5 mm above the base underside (what-if: 7.0 mm). So the barrel does not cross a bevel band, a side or the underside.
5. **Level:** both ring centroids are 6.0 mm ± 0.05 above the plane of face 1.
6. **Designed clearance to the heel rubber:** no barrel vertex is closer than 2.5 mm to `hihat.heel` (what-if: 3.0 mm). The heel rubber is a separate stop standing on the base. With the barrel carried by the base, this gap is a clearance, not a defect.

### 3.5 Criterion B: board on the barrel (existing pair, updated)

`hihat.footboard_in_hinge` keeps its kind and its four conditions. They hold at any pitch, because the board only turns about the axis. Update:

- the axis coordinates (world z 0.0306 → 0.0246) and the "no change" wording;
- condition 4's observation: the board is now 6.0 mm above the base top (was 12.0);
- remove `barrelMountingNote`;
- replace the two ranges with explicit lists. `sideFaceRange: [94, 105]` is inclusive and `vertexRange: [96, 128]` is half-open, in the same criterion.

### 3.6 Criterion C: toe at rest (new pair)

Declare `hihat.footboard` onto `hihat.housing`, relation `rests_on`, `gapM` 0.0003. Intent: **the board's toe rests on the front lip of the sensor housing. It does not enter the housing.**

1. Exactly this pair.
2. **No intersection:** every housing vertex `[48 … 95]` has clearance of at least 0.25 mm. Both solids are convex and the board lies wholly on the other side of its own underside plane, so that plane separates them.
3. **Rest:** vertices 86 and 87 have clearance 0.30 mm ± 0.05. Every other housing vertex has more clearance than those two (what-if: the next is 0.374 mm).
4. **Under the board:** the feet of the perpendiculars from 86 and 87 fall inside the outline of face 76 by at least 5.0 mm (what-if: 5.84 mm). So the lip is under the board, not beside it.
5. **Reported, not a criterion:** beyond the lip the board overhangs about 12 mm, and its tip (vertices 99, 100) stands 3.27 mm above the housing top.

### 3.7 What the author reports back

- New helper, declaration, builder and report hashes.
- Row count (expected 300) and row bounds. My what-if moves the row's top from z 0.0884 to 0.0896 and nothing else.
- Observed values for every number in criteria A, B and C, from the author's own source check.
- Section 7 items 1 and 2 rewritten as repaired by construction, pending Codex's measurement. Keep the defect history.
- The thin-margins list gains two entries: the 0.30 mm lip rest, and the 0.374 mm next clearance.

## 4. Bounds check against the release

| Release bound | Remedy |
|---|---|
| Geometry limited to the existing hi-hat assembly and small mounts | Two existing groups move. No mount is added |
| 600-triangle row ceiling | 300, unchanged |
| Global placement, base support and rug footprint | `hihat.base` does not move; `HIHAT_PEDAL` unchanged |
| Material family | No material changes |
| Parent contracts, camera, P14, cheek fix, other assets | Untouched |
| Hinge mechanically supported | Board → barrel (criterion B) → base (criterion A) → rug (existing support) |
| Toe: clearance, contact or seat, declared with positive criteria | Contact at rest, criterion C |
| Overlap limited to named pairs and bounds | One new overlap pair (barrel in base, 3.0 mm). The toe has none |
| Hinge and toe evaluated together | The pitch is derived from both contacts |
| Recognisable form and HH1 readability | Heel 6 mm lower, pitch 1.7° steeper, toe top 1.2 mm higher. Same parts, same outline |
| Four author files; schema, API and builder refusal intact | Additive attachment metadata only |
| Identities, criteria, classes, runs, edge reasons updated where affected | Criteria A, B and C. Classes, round runs and edge sets are not affected **[M]** |

**No bound is at risk, so there is no escalation.**

## 5. What my check covers [M]

One read-only script, plain CPython 3.11.9 with `-B`, run from my session scratchpad in under a second. It is embedded with its output in the evidence JSON.

- **Part A** reads the frozen helper (`5d01ed7c…`). It reproduces the author's section 7 figures: barrel 3.0 mm above the base top and 3.0 mm from the heel rubber; six housing top-cap vertices (84–89) inside the board by 0.39 to 0.57 mm.
- **Part B** rebuilds the hi-hat row in the script with the helper's own primitives and the section 3.1 numbers. It confirms identical topology, group identities, classes, roles and round runs; 300 triangles; the same hard edges in the same five sets. The footboard's edge length grows 6.6 mm because the board is 1.6 mm longer.

Limits of that check:

- Part B is my construction, not the author's edit. The author's source and Codex's measurement decide.
- "No intersection" rests on the separating-plane argument in criterion C. I ran no mesh intersection test.
- I did not assess how the seated barrel looks. From the planning eye the heel rubber stands in front of the barrel, which now shows 7 mm above it (was 13 mm).

## 6. Images and export [X]

- Gates **K1** (nothing floats), **HH1** (footboard and heel identifiable beside the desk leg) and **E1b** (the footboard must not read as a flat card) apply to this assembly and are open, with the other eleven.
- Exported positions must show the 0.30 mm lip gap still positive, and the barrel still seated, after any quantisation.

## 7. Pins and session record

Frozen bytes read with `git show 005955c6b2b01c694b3b771b7028682ffa731abd:<path>`. All four match the release.

| File | SHA256 |
|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` | `5d01ed7c094d2983d9a597a6b7271eedfa662cfdcfa435929fa258898caca20a` |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` | `476a17e3acbf4e50a1fcec5d7cac33fcf6b123e43253630dffe704d4875bd5d6` |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` (hi-hat references only) | `74476be0316cee121436ceb7c06308bc159e046bbab71677c566b16c5374f524` |
| `scene-m4-v04-preparation-report.md` (sections 3b and 7) | `f8f5342ce3b2e6452119f8fc43e6ce4beb0841201d97d26bbd3a7e76b3f42c82` |
| `scene-coordination/m4-v04-hihat-repair-release.md` | `038dc8afe9ab795539c57c3dba120f7f33232909a48f5d846d5f22db1498dc68` |

- I wrote only this report and its evidence JSON. No source, declaration, builder, report or coordination file was changed.
- No Blender, browser, render, export, image tool, helper worker, pose search or prior-review rerun.
- Git was read-only: `git show`, `git rev-parse`, `git log`, `git status`.
- One observation outside this task, for S: the kick criteria mix range conventions in the same way (`boardVertexRange` half-open, `boardSideFaceRange` inclusive). It is metadata only and I make no recommendation on it.
