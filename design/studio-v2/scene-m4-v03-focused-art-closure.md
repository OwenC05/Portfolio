# M4 v03: focused art closure at source and plan level

**Review verdict: REQUEST CHANGES (bounded).** Two findings stay open (K1, A1), one needs a wording fix (R2), and the pose search should take one more step before root settles a candidate. N1, H1 and R1 are addressed at source level and wait on export and images. This is not a visual approval: no GLB, blend or image exists.

**Status: final.** Written 15 November 2026 under dispatch ctx_fb0a0d443f54, which stopped at a usage limit before `worker_done`. Finalised 16 November 2026 under dispatch ctx_0759ccb535bb of the same task (task_1dc141d6856b), after reconciling with Codex's final numerical report and root's verification repair release. Section 0 lists every change from the interrupted text. No verdict changed. The interruption snapshots in `scene-coordination/m4-v03-art-closure-interrupted-20261115/` are untouched.

Reviewer: retained actual Claude Fable 5.2 / high. Follow-up to my critique `scene-m4-correction-plan-critique.md` (`323c52c0…03e1`). I did not author the art. Root alone settles candidate, variance and export decisions.

## 0. What changed on resume

The interrupted text was complete except for `worker_done`: the evidence JSON already carried the report's hash. On resume I rehashed every input (all unchanged), re-read the source lines behind K1 and I1, and read three documents the interrupted text did not use:

- Codex's final numerical report `scene-m4-v03-cpu-verification.md` (`815edfab…f174`), tagged **[C]** below;
- root's `m4-v03-verification-repair-release.md` (`625d41f6…26e2`);
- root's `m4-v03-verifier-binding-disposition.md` (`4ac02bc7…0acd`), which does not touch any art finding.

| Item | Interrupted text | Final text |
|---|---|---|
| K1 spurs | 5.03 mm by my scan | Agrees with Codex G1 (5.0251 mm over the resting gap). Author confirms they are supports |
| K1 coverage method | "Codex's and the author's to repair" | Root has released V1–V3 to Codex in new files. Removed from my decision list |
| K1 spring | Position stated loosely | Wording tightened to the source numbers. Codex did not test this; it remains my finding |
| K1 fix | "no triangle change expected" | True for lowering the spurs and widening the plate. A flat tip adds a few tens of triangles |
| N1 | Cited a relayed message | Cites Codex V3 directly. Codex: 1,060 planar triangles pass at source |
| H1 | Conditional on Codex reproduction and images | Codex reproduced the counts, lips and pitch. Conditional on export and images only |
| R1 margins | 255 and 230 mm at the sides | Both readings given: 269 and 244 mm by Codex's foot footprints; mine include low clamp bodies |
| P2 | My finding alone | Codex states the same two limits independently, and two more (section 3). Gate AZ1 reworded |
| A1 | Three corrections | Codex V4 agrees on the cables. One more reporting note added (bevel length metric) |
| I1 | Not present | New and narrow: art reading of Codex's 32 shell/indicator overlaps (section 5f) |
| Evidence | Four checks, run once | All four re-executed from the JSON under this dispatch (section 10) |

## How to read the evidence

| Tag | Meaning |
|---|---|
| **[S]** | Source fact: I read it in the v03 helper, builder or measure script |
| **[M]** | My own small read-only check (four short Python runs, scripts and results embedded in the JSON) |
| **[A]** | Author claim from the receipt or report that I did not reproduce |
| **[C]** | Codex's final numerical report (`815edfab…f174`). I did not reproduce it and did not read its probe or JSON |
| **[R]** | My recommendation |
| **[X]** | Decided only by the final export or by images |

My checks import the author's helper and measure module with bytecode writing off. They do not repeat the 156-second run: no search grid, no intersections, no gap tests. Codex owns numerical reproduction.

## 1. Verdict by finding

| Finding | Verdict | What remains |
|---|---|---|
| **N1** flat panels | **Addressed at source; not closed** | Class-completeness enforcement (Codex V3, repair released to Codex), exported NORMAL check, images. One low class-intent note (section 7) |
| **K1** ground contact | **Retained** | Both kick spurs float 5.0 mm above resting height (Codex G1 agrees). One unattached spring foot. Support coverage method is being repaired by Codex |
| **H1** key fronts | **Closed at source, conditional** | Codex reproduced counts, lips and pitch. Export and images remain |
| **A1** script master | **Retained (bounded)** | Conditions 1 and 5 met at source. Conditions 2 and 4 need the label split and a second edge band. Condition 3 waits on export |
| **R1** rug variance | **Closed at plan level, conditional** | Root's allowance conditions: K1 (open), 150 mm margins (met), images |
| **R2** rug wording | **Retained (wording only)** | Replace the "50 mm avoidance" sentence (section 6). No rug move |
| **P1** pose | **Correction recommended before settling** | One more refinement step; then an image gate either way |
| **P2** visibility figures | **Correction to the measure and the report** | Contact decals are counted as occluders; fractions are vertex-weighted |
| **B1** rack back foot | **Accept** | Image gate only |
| **E1** unnamed hard edges | **Per-set recommendation** (section 5) | One edge should be bevelled; the rest need root's per-set decision |
| **I1** indicator strips | **Intended seating; declare it** (section 5f) | A scoped author declaration. No geometry change |

## 2. N1, K1, H1, R1 in detail

### N1: flat casing panels

- **[S]** Each face gets its class from the primitive that makes it (`prism`, `bevel_corners`, `rrect`, the pad lathe's `strip_cls`). Nothing is derived from normals. `corner_normals()` gives a smooth fan the angle-weighted normal of its highest class only: planar, then round, then bevel (helper lines 1018–1079).
- **[S]** The builder maps normals per (polygon, vertex), asserts each polygon's vertex set, orients to the recalculated winding, calls `normals_split_custom_set`, then asserts the 2° predicate on an in-memory readback (builder lines 124–158). It says itself that this is not an export check.
- **[A][C]** Seven classified rows; authored maximum 0.00° on every planar triangle; 0 failures. Codex counts 1,060 planar triangles in those rows and passes every corner on the oriented 2° predicate, whatever the area.
- **[S]** The receipt carries per-group class runs and hashes of the class array and corner normals (`classes_repr`). That is the right raw material for Codex's hash-bound sidecar.
- **Not closed because [C]:** Codex V3 shows class completeness is not enforced. Deleting the class on one shell face drops the checked count from 112 to 108 with no failure reported. The author accepts this in `m4-v03-author-clarifications.md`, and root has released the repair to Codex in new verification files. The exported accessor check is also Codex's. **[X]**

The intended appearance in my critique is met by this design: flat faces keep their own normals and the turn happens across the bevel.

### K1: ground contact

**Fixed [S][M]:** the v01 stool defect is gone. `stool()` raises on mixed or binding support. My low-point scan finds every primary footprint at exactly the resting height: four stool feet, stand ends, sustain base, rack feet and rubber ends, kick base and pedal plate, hi-hat base, three throne feet.

**Still open:**

1. **Kick spurs float [M][S][C].** Both spur tips (helper lines 755–757, label `kick.hardware`) end 5.03 mm above the resting height, at about (1.245, 0.560) and (1.595, 0.560). Codex G1 measures the same error independently (5.0251 mm over the 0.3 mm resting gap). The author declares them intended supports and asks for no exemption. I agree: they are the kick's anti-creep feet and must touch.
2. **Spring foot is unattached [M][S].** The kick pedal's spring (line 779) has its axis at x 1.478 and a 6 mm radius. The base plate's edge is at x 1.465 (line 763), so the spring's nearest side is 7 mm outside the plate. Its lower end is 6.0 mm above the resting height with nothing under it. The two posts (line 770) are centred on the plate's edges, half on and half off. This is inherited from v01 and small, but `render-gates.md:66` says nothing floats. Codex did not test this; a per-primitive support inventory will not catch it either unless the spring is declared, because the spring is not a support. It is an attachment defect.
3. **Coverage method [C].** Codex V1 and V2 show that the row-minimum selector and the rectangular rug classifier can pass a raised foot and overstate corner clearance. Root has released that repair to Codex in new verification files; it is not an art decision. One art-side fact: by my scan no M4 support is nearer than about 0.30 m to a rug corner **[M]**, so the rounded-corner error cannot change the present placements. Codex reaches the same conclusion: against the real rounded field its positive control passes all 23 ordinary supports, the tightest at 49.9 mm (sustain pedal).

**[R] Bounded owner correction** (author, same `kick()` function):
- Lower both spur tips to the resting height. Prefer a flat-bottomed tip so the spur has a footprint, not a single low vertex.
- Widen the pedal base plate to carry the posts and the spring (half-width 0.045 to about 0.066), or move the spring inboard.
- Triangles: lowering the spurs and widening the plate change none (the author predicts 856 of 1,500 unchanged). A flat tip adds a few tens. Either way the revised kick must be measured again.

Do not close K1 on the receipt's `pass` booleans. Codex's 23-support positive control excludes the two spurs, so it is not an all-support pass either **[C]**.

### H1: white-key front lips

- **[S]** One table entry, `white_key_lip`, 3.125 mm × 2 segments, applied to the front-top corner of each white key's front block (`bevel_corners(..., 'white_key_lip', which={3})`). Stems and black keys stay sharp, which root allows.
- **[A][C]** 29 lips of 3.13 × 3.12 mm; keys 1,168 of 1,540; pitch 0.0294 and gap 0.0034 preserved. Codex measures from the vertices: 29 white and 20 black keys, 29 front lips of 3.125 mm in both directions with 2 facets, pitch 29.4 mm, width 26.0 mm, gap 3.4 mm, keys inside the cheeks.
- **[M]** At the authored pose all 29 key tops are first hits and key pitch is 13.6–14.7 px at music-1440 (author's functions, my run).

This is the treatment I asked for. Closed at source. The Codex condition is met; the export and the images remain. **[X]**

### R1: rug variance

Root granted the allowance. Its conditions stand as follows.

| Condition | State |
|---|---|
| Corrected support checks | **Open** (K1) |
| 150 mm of rug beyond the outermost rack foot | **Met on both readings.** Mine **[M]**: left 255, right 230, back 155, front 1,740 mm to the rug's outer edge, taking everything within 30 mm of the rack's lowest point, which includes low clamp bodies. Codex's **[C]**: 269, 244, 155 and 1,740 mm for the support tubes and rubber ends alone. To the flat field these are 26 mm less; the tightest is 129 mm at the back on both readings |
| Image review of fit and lamp base | **[X]** |

## 3. Pose and visibility

### P2: the reported fractions need correcting first

**[M]** The measure script's ray caster takes the nearest hit on any retained mesh, including contact decals. The parent GLB flags all three decals `occluder: false`, `transparent: true`, alpha mode BLEND. `contact_decals__music_corner` is a blended quad at z 0.0205–0.0215, which is 12 mm above the rug field and above the tops of the low pedal parts. A first hit on it is not occlusion.

| Feature | Author method v01 → v03 | Decals not occluders v01 → v03 | What actually changed |
|---|---|---|---|
| Hi-hat pedal | 63/96 → 73/160 (0.656 → 0.456) | 77/96 → 101/160 (0.802 → 0.631) | Not the pose. See below |
| Kick pedal | 169/190 → 188/210 (0.889 → 0.895) | 182/190 → 202/210 (0.958 → 0.962) | Nothing material |
| Sustain pedal | 55/80 → 103/116 (0.688 → 0.888) | 72/80 → 103/116 (0.900 → 0.888) | Level. The reported gain was the decal |
| Throne seat | 54/73 → 45/73 (0.740 → 0.616) | same | Real: the controller shell blocks it |

**The hi-hat pedal figure is not a pose trade-off [S][M].** The pedal has not moved (cx 1.00, cy 0.10, yaw 0.12 in both helpers). No moved M4 object blocks it: the blockers are the retained desk frame (58) and the decal (29). The drop comes from three things:
- the larger C8/C9 pedal (0.114 × 0.33 against 0.11 × 0.30);
- the bevelled housing, which now carries 48 vertices instead of 8, most of them behind the desk leg (12 of 48 clear);
- the decal.

By label, with decals excluded: footboard, heel hinge and heel rubber 56/64 clear; base plate 33/48; housing 12/48. The part that identifies the pedal is 0.875 clear.

**[R] Bounded correction (Codex owns the measure; the author owns the report erratum):**
- Exclude leaves flagged `occluder: false` from the ray occluders, or report their hits separately.
- Report each feature by label as well as in total. A vertex fraction changes when bevels add vertices.
- Correct the report's item "hi-hat pedal drops from 0.656 to 0.456" and the sustain comparison.

The search itself is not affected: in every v03 candidate I re-read, the sustain pedal's blocker is the stool, which is real.

**Codex's report agrees and adds two limits [C].** It reproduces the four selected fractions and says independently that the rays include transparent and decal geometry, unlike the runtime's opaque-occluder contract, and that the fractions depend on the changed sample sets. It adds:
- A ray that hits nothing is counted as unobstructed: 25 of 210 kick-pedal samples, 14 of 116 sustain, 7 of 73 throne, 3 of 160 hi-hat.
- The 30.67° azimuth is the angular envelope of the visible samples (354 of 358), not a continuous unobscured span.

Neither changes a verdict here. Both are further reasons to decide readability from images (gates T1, HH1, SP1, AZ1).

### P1: the selected pose sits on a corner of the search box

**[A][M]** The refinement box was cx 1.275–1.325, cy −0.825 to −0.775, yaw −0.85 to −0.75. The selected pose (1.325, −0.825, −0.85) is at its limit in all three. The author flagged the yaw edge only. I reproduced the selected row exactly with the author's `evaluate()`: azimuth 30.6701°, throne 45/73, sustain 103/116, kick 188/210, targets 81.

Codex's full run reproduces the author's search and the selected pose exactly **[C]**. It did not look outside the box, so what follows is my probe alone.

**[M]** I then probed 18 placements just outside the box with the author's own `placement_ok()` and `evaluate()`. All nine at cy −0.85 fail the K1 prefilter, so cy is bound by K1, not by the box. The nine at cy −0.825:

| cx | yaw | Azimuth | Throne (vertices) | Throne top, area visible | Sustain | Key pitch min, music-320 |
|---|---|---|---|---|---|---|
| **1.325** | **−0.85** (author) | **30.67°** | **45/73** | **0.667** | **103/116** | **9.40 px** |
| 1.325 | −0.90 | 31.04° | 46/73 | 0.639 | 104/116 | 9.31 |
| 1.325 | −0.95 | 31.33° | 46/73 | 0.611 | 108/116 | 9.20 |
| 1.35 | −0.85 | 30.25° | 49/73 | 0.764 | 102/116 | 9.32 |
| 1.35 | −0.90 | 30.63° | 50/73 | 0.730 | 104/116 | 9.23 |
| 1.35 | −0.95 | 30.92° | 52/73 | 0.699 | 109/116 | 9.12 |
| 1.375 | −0.85 | 29.84° | 54/73 | 0.850 | 102/116 | 9.23 |
| 1.375 | −0.90 | 30.22° | 53/73 | 0.816 | 101/116 | 9.15 |
| 1.375 | −0.95 | 30.52° | 54/73 | 0.790 | 109/116 | 9.05 |

All nine keep targets 81/81, 29/29 key tops and every support at least 34 mm from the binding. "Throne top, area visible" is my own measure: 864 points spread evenly over the seat's top disc. In v01 it was 1.000.

Reading the table:
- Moving the controller 25–50 mm in +x opens the throne. Turning it further restores the azimuth that +x costs.
- (1.35, −0.825, −0.95) beats the author's pose on azimuth, throne count and sustain together.
- (1.375, −0.825, −0.95) returns the throne vertex count to v01's 54/73 with azimuth 30.52°.
- The two throne measures disagree about yaw. More turn raises the vertex count slightly and lowers the visible top area. This is one reason a ray fraction is not readability.

**[R] Decision: a concrete plan correction, then an image gate.**

1. Before root settles a candidate, the author extends the refinement one step past the corner: cx 1.325–1.40, yaw −0.85 to −1.00, cy −0.825 and −0.80, same rule. Add the area measure of the seat top next to the vertex count.
2. Art guard: do not go past yaw −0.95 without images. Each step turns the keyboard further from the wall line and lowers the smallest phone key pitch (9.40 to 9.05 px in the probe).
3. Any new pose needs the full CPU set again (intersections, gaps, dimensions, supports, key rows, the controller and sustain cable runs) and Codex's reproduction. My probe covers the search metrics only.
4. If root prefers not to reopen the pose, the author's pose passes every numeric gate and may go forward under image gate T1 (section 8). It is not wrong; it is not yet converged.

No source geometry is at fault here. The azimuth margin (0.67° over the 30° gate, by vertex samples) is thin in every option and needs measuring from the capture. **[X]**

### What the throne will look like at the author's pose

**[M]** Pinhole estimate with the author's cameras: the seat top is about 92 × 31 px in music-1440. The controller's far end hides its right-hand third (visible to about 63% of the width). The cut is a clear overlap, not a near-tangent, so the seat should still read as a round seat behind the keyboard. That is a judgment about a number, and only the image decides.

## 4. B1: the shortened rack back foot

- **[S]** v01 foot rod y 0.40–0.78, rubber end to 0.80. v03 rod 0.40–0.715, rubber end to 0.735. The upright is at y 0.56.
- **[M]** Reach from the upright is now 180 mm forward and 175 mm back (v01: 180 and 240). Back margin to the rug's outer edge rises from 90 to 155 mm. The foot ends 0.30 m from the skirting.

**Intent.** My critique's 150 mm figure was about the left and right margins ("on either side (now 234 and 209 mm)"). I did not ask for it at the back. Root's "each side" can be read either way, and the author took the stricter reading and said so.

**Judgment [R]: accept; no correction.**
- Stability: the pads and booms hang toward the player, so the forward reach resists tipping, and it is unchanged.
- Silhouette: a near-symmetric T-foot is the common form. The back foot lies behind the uprights and kick from the eye and is foreshortened.
- It also moves the back rubber ends from 64 to 129 mm inside the flat field.

Root should state which reading of "each side" it means, so a later retune does not have to guess. Image gate RK1 applies.

## 5. E1: remaining hard-edge sets

**No blanket exemption.** The rule is the one in my critique: a part may stay sharp when the part itself is at or under the detail floor (12 mm across the room, `art-direction.md:140`), or when it is dark and there is no environment map. A sub-pixel bevel estimate alone is not a reason. Casings, pad-rim outer corners and white-key lips are excluded from every row below.

Lengths are hard convex edges of 80° or more, split by connected component **[M]**. They sum to the receipt's label totals exactly.

### 5a. Already covered by root's named list (needs its own label and status `named`)

| Label today | Set | Length | Root's term |
|---|---|---|---|
| `kick.hardware` | Pedal axle ends | 0.06 m | Pedal hinges |
| `hihat.hardware` | Heel hinge ends | 0.11 m | Pedal hinges |
| `ctl.controls` | 8 panel pads, 4 transport keys | 3.15 m | Panel pads, transport keys |
| `stand` | 2 pivot plates, 6 teeth | 1.98 m | Stand pivot plates and teeth |
| `rack.*` | 14 clamp bodies, 14 wing bolts and shafts | 8.21 m | Clamp caps and wing bolts |
| `pad.*.mount` | 4 mount blocks | 1.86 m | Mount blocks |
| `cymbal.*` | 3 wing nuts | 0.91 m | Cymbal wing nuts |
| `module.controls`, `stand` | Module volume knob 0.20 m; stand pivot knob 0.27 m | 0.47 m | Knobs, **if** root reads the list by kind of part and not by row. That is my reading; root should confirm |

### 5b. Not an exception: bevel it

| Label today | Set | Length | Why |
|---|---|---|---|
| `kick.hardware` | Kick pad ring, outer front corner (Ø176 mm) | 0.55 m | It is a pad rim's outer corner. The plan corrected that edge as a casing edge on the four rack pads, and root excluded the specified casing edges from the sharp list. The same edge on the kick should match |

**[R]** Bevel it with the `casing` class in the same `kick()` edit as the spurs. My arithmetic: two more profile points × 24 segments × 2 triangles = 96, so kick 952 of 1,500. If root reads "pad rims" as the four rack pads only, it may name this edge instead; then image gate E1a applies.

### 5c. Hidden or contact edges (reason, not exception)

| Label today | Set | Length | Reason |
|---|---|---|---|
| `kick.hardware` | Fabric head rims | 0.98 m | Front rim sits under the ring's 4 mm lip; back rim against the tower |

### 5d. Genuinely new exceptions: I recommend root grant these four, by name

| Proposed name | Sets and lengths | Reason | Reconsider if |
|---|---|---|---|
| **Round-member ends** | Stand tube ends, rubber ends and pivot bolt 2.59 m; rack tube, foot, stub and boom ends 3.72 m; pad mount-arm ends 0.51 m; cymbal rod, felt and tilter rims 1.58 m; kick posts, spurs, spring, shaft, chain and cam 0.81 m; stool 2.31 m; throne 2.75 m; module mount-arm ends 0.12 m; snake and cable end caps 0.54 m | The rim is the end of a round section that the art direction already reduces to 8–16 sides at this distance. Most rims butt against another part, so there is no free edge to soften. The free ends I identified are at most 64 mm across and dark | A free bright-metal end wider than 12 mm reads as a cut-off stub |
| **Thin plates** | Kick pedal base plate 1.50 m (6 mm); kick footboard 1.20 m (8 mm); hi-hat footboard 1.31 m (8 mm); module holder plate 0.67 m (6.5 mm); 2 wheel slots 0.72 m (2 mm); display bezel 0.71 m (9 mm) | Thickness is under the 12 mm floor. The 3.125 mm × 2 bevel would use up most of a 6–8 mm plate. All are black or black metal; the footboards are already rounded in plan | A footboard reads as a flat card |
| **Small dark blocks** | Kick heel block 0.62 m; hi-hat heel rubber 0.44 m; 6 module buttons 0.77 m | Rubber or fabric, dark, 6–20 mm; the buttons are the same kind as root's transport keys | Any reads as an unfinished block |
| **Controller wheels** | 2 pitch/mod wheels 0.52 m | About 40 mm, dark, recessed in slots | The wheels do not read as wheels at music-1440 |

Material colours in this table are from the helper's swatch names **[S]**; I did not check every free end exhaustively, hence "the ones I identified".

### 5e. Bounded owner correction to the labels

**[R]** Split each mixed label so one tallied set has one status and one reason. A workable set: `kick.padring`, `kick.plates`, `kick.hinge`, `kick.ends`; `hihat.footboard`, `hihat.hinge`, `hihat.heel`; `ctl.pads_keys`, `ctl.wheels`, `ctl.bezel_slots`; `stand.pivot`, `stand.knob`, `stand.ends`; `rack.clamps`, `rack.ends`; `pad.*.block`, `pad.*.arm`; `cymbal.*.nut`, `cymbal.*.ends`; `module.knob`, `module.buttons`, `module.plate`. Add a status such as `proposed` for sets awaiting root, so `named` means only what root named.

Codex V4 and root's repair release say the same from the technical side: a `named` label that also carries "ALSO" parts is not an exemption for those parts **[C]**.

### 5f. I1: indicator strips seated in the panel

Codex reports 32 triangle overlaps between `ctl_body__shell` and `ctl_body__indicators` and asks for a scoped explanation **[C]**. Root carried this to the art pass. This is the art reading; I did not run an intersection test.

- **[S]** Helper line 467 makes the four pad-column strips as 30 × 5 mm boxes running from 1.0 mm below the panel plane (the helper's `on_panel` frame) to 2.5 mm above it. Each is sunk 1 mm into the panel. Four strips × four side faces × two triangles is 32, which would equal Codex's count if it counts indicator triangles. That is my arithmetic, not a measurement.
- **[S]** Helper line 465 sets the display glow face on top of the bezel with the usual small gap. It does not overlap the shell.
- **[S]** The pads, knobs, bezel and transport keys in the shell row are sunk 2 mm into the same panel in the same way (lines 453–461). Neither the author's test nor Codex's follow-up looks inside a row, so those are not counted.

**Judgment [R]: intended seating, not a defect.** A lit strip that only rested on the panel could show a dark line or a light gap under it; sinking it 1 mm is the ordinary way to seat an inlay. No geometry change.

**[R] Bounded owner declaration** (author): "the four `ctl.indicators` pad-column strips are seated 1.0 mm into `ctl.panel` and stand 2.5 mm proud; the display face rests on the bezel." Scope it to those four primitives against the panel. It is not a general allowance for overlaps inside the `ctl_body` asset. The strips fall under image gate E1b.

## 6. R2: rug and decal wording

**Facts [M], from the parent GLB through the author's loader:**
- Lamp base minimum x 2.235. Desk-frame floor runner maximum x 0.49. Span 1.745 m.
- Rug x 0.56–2.215. So: 20 mm to the lamp base, **70 mm** to the desk-frame runner.
- Under-desk contact decal maximum x 0.55. So: **10 mm** from decal to rug.
- 1.745 − 0.020 − 0.020 − 0.050 = 1.655 m. The "50 mm" is a width-budget term.

Root's sentence, "20 mm desk-frame clearance and 50 mm avoidance of the under-desk decal", can be read as a 50 mm gap to the decal. There is none. Codex measures the same 10 mm **[C]**, and root's repair release now records 70 mm and 10 mm and asks for the wording to be reconciled without repeating a direct 50 mm gap. The text below is my proposal for that.

**[R] Proposed replacement wording (no geometry change):**

> Rug C11: the rug stays at x 0.56–2.215, y −1.36–0.89 (1.655 × 2.25 m). The physical span between the desk-frame floor runner (x 0.49) and the lamp base (x 2.235) is 1.745 m. Actual clearances are 20 mm to the lamp base, 70 mm to the desk-frame runner and 10 mm to the edge of the retained under-desk contact decal (x 0.55). The 70 mm is a 20 mm frame clearance plus a further 50 mm of width given up so that the rug's edge clears that decal. "50 mm" is width budget, not a gap to the decal.

Add to the reconsideration list: the under-desk decal growing or moving more than 10 mm toward +x.

The 10 mm is not a visual risk in itself: the decal lies on the floor and would pass under the rug's edge. The wording matters because the next person will otherwise budget against a gap that is not there.

**M6 dependency, one addition [M].** The music-corner decal's plane (z 0.0205) is above the hi-hat base plate's top (0.0186), the kick pedal base plate, the cables on the rug and the lower part of every rubber foot inside its outline. M6 must lower it to the field or cut it around those footprints. M4 does not edit it.

## 7. A1: the authoring method

| Condition | State | Evidence |
|---|---|---|
| 1. One bevel table | **Met [S]** | `BEVEL_CLASSES` with `bev()`; the only radius uses are helper lines 223, 263 and 697. No literal bevel radius at a call site |
| 2. Edge sets and sharp exemptions with reasons | **Retained** | `SHARP_REASONS` exists and the author flagged its own gaps. See the four points below |
| 3. Custom normals verified independently | **Pending [X]** | Codex, on the exported accessors |
| 4. Per-row triangles, bounds, edge lengths; rerun reproduces | **Retained** | My rebuild reproduces every hard-edge label total in the receipt **[M]**. Codex's full rerun matches every receipt field except elapsed time **[C]**. The definition is too narrow (below) |
| 5. Stage files, source, materials, row contract | **Met at source [S]**; builder not run | SHA pins and row-contract asserts in the builder |

**What to correct under conditions 2 and 4 (bounded, no geometry change):**

1. **The receipt counts only convex edges of 80° or more [S].** The builder splits at 40°. By my count **[M]** the split edges are: 124.70 m convex ≥ 80° (reported), **139.10 m convex 40–80° (no length or reason reported)** and 24.82 m concave. The unreported band is mostly the lengthwise edges of low-sided round members: stand tubes 39.1 m (8 sides), music cables 35.6 m (5 sides), stool 7.8 m, throne 7.7 m, rack 7.5 m, kick hardware 7.2 m, pad-shell underside corners 7.0 m, sticks 6.3 m (6 sides), sustain cable 5.5 m. Add this band by label with a declared reason, for example `faceted-round` with the side count. The art direction asks for 8 sides under 12 px, so the side counts are right; what is missing is the declaration that these members are flat-shaded.
2. **`cable.*` says "end caps" but is mostly run edges [M][C].** Caps are 0.32 m of the 2.69 m. The other 2.37 m are lengthwise edges that exceed 80° where a 5-sided run is skewed at a bend (one edge is 0.65 m long). Codex V4 finds the same on the controller cable: four side edges totalling 0.929 m of its 0.964 m, one of them 0.647 m at 80.01°. Fold them into `faceted-round`.
3. **Mixed labels and two wrong statuses.** Split labels as in 5e. `sticks` and `pad.*.head` carry status `casing` but are not bevelled casings; give them a status that says what they are.
4. **Name the bevel length for what it is [C].** Codex notes that the receipt's bevel length is the sum of the shared edges between same-class bevel faces (the middle seam), not the length of the original treated edges. Condition 4 asks for "bevelled edge length by class". With a 2-segment bevel the seam runs parallel to the treated edge, so the figure is close for straight edges. Label it as the seam length, or report the treated length beside it. I have not measured the difference.

**N1 class-intent note (low) [S][M].** A 2-segment rounded plan corner steps 45°, which is over the 40° split. So each `round` corner on these casing groups has a hard break at mid-arc: `module.case` (4 edges, 0.175 m), `sustain.base` (4, 0.060 m), `hihat.base` (4, 0.028 m), `sustain.plate` (4, 0.022 m) and the cheek profile in `ctl.cheeks` (12, 0.065 m). The planar predicate is unaffected. The corners are 12–14 mm in radius, so this may never show. Bounded owner fix at zero triangles: keep edges between two faces of one declared round run smooth, in both `corner_normals()` and the builder's edge marking. Otherwise leave it to image gate N1b.

## 8. Image gates for the next evidence

| Gate | View | Passes when |
|---|---|---|
| **N1a** | Grey turnaround; music-1440 | Shell top and front, cheeks, kick tower front and module face shade evenly edge to edge; the highlight stays in the bevel band |
| **N1b** | right-down, 1440 | Rounded corners of the module case and pedal bases show no mid-corner crease |
| **H1** | music-1440; music-320 and 390 | Key fronts show one continuous lip; 29 white and 20 black keys countable |
| **K1** | right-down; music-1440 | Contact visible under four stool feet, stand ends, sustain base, rack feet, kick base, both spurs, hi-hat base, three throne feet. No gap under the kick spring |
| **T1** throne | music-1440; right-down | Reads as a round seat on a post behind the controller. The controller's far end cuts it cleanly and hides no more than about a third of the seat top. No near-tangent with the controller's back edge |
| **HH1** | right-down | Hi-hat footboard and heel identifiable beside the desk leg (G4). A hidden housing is acceptable only if the footboard reads |
| **SP1** | right-down | Sustain pedal identifiable; the stool leg does not merge with it |
| **AZ1** | music-1440 | Controller azimuth measured from the capture is at least 30°. The plan margin is 0.67°, roughly 10 px, and the plan figure is an envelope of visible samples, so measure the continuous visible span |
| **RUG1** | music-1440; right-down | Rug does not appear to touch the lamp base; desk-side edge reads clear of the desk frame; the rug reads as carrying the kit |
| **RK1** | right-down | Rack feet read as feet front and back; the rack does not look ready to tip backward |
| **E1a** | right-down | Kick pad ring does not look cheaper than the tom rims (only if root names it instead of bevelling) |
| **E1b** | music-1440; right-down | No allowed sharp set reads as an unfinished block: wheels, bezel, stool and throne hubs, pedal footboards. The four indicator strips read as lit inlays, not stuck-on bars (I1) |
| **F1** | music-1440 | Stand tubes and sticks do not read as faceted; cables do not sparkle |
| **M6** | carried | Music-corner decal does not veil pedal bases |

## 9. Decisions for root

1. Release the bounded K1 geometry fix to the author: spurs, spring and plate. The support coverage repair is already released to Codex and is not repeated here.
2. Pose: one more refinement step (my recommendation), or keep the author's pose under T1. A new pose needs Codex's reproduction.
3. Kick pad ring: bevel (my recommendation), or name it.
4. Grant or refuse each of the four new sharp sets in 5d.
5. Confirm whether "knobs" and "pedal hinges" are read by kind of part.
6. Adopt the label split, the 40–80° band, the seam-length label and the decal-is-not-an-occluder rule.
7. Adopt the R2 wording. Root's repair release already asks for this reconciliation; section 6 is my proposed text.
8. State whether "each side" means left and right, or all four.
9. Accept the scoped I1 declaration for the four indicator strips.

Items 1, 3, 6 and 9 and the K1 and A1 corrections can go into the single combined author pass that root's release describes.

## 10. Limits, session and hashes

**Not done, by instruction:** no Blender, browser, render, software sheet, image generation, build, server, dependency or process action; no Git write (two read-only listing commands on resume, noted below); no helper or subagent; no source, asset, artist-file or snapshot edit. I wrote only this report and its JSON.

**Done outside the listed inputs, first attempt (15 November, ctx_fb0a0d443f54):**
- Four read-only Python checks (about 12, 40, 44 and under 5 seconds), written to my scratchpad. The source `__pycache__` timestamps are unchanged.
- One `orca orchestration check` at the user's instruction, which delivered `msg_1a3621b770bb`.
- Read `m4-v03-author-clarifications.md`, named in that message. I did not read Codex's in-progress verification files.
- Stopped at a provider usage limit after writing the report and JSON, before `worker_done`.

**Done on resume (16 November, ctx_0759ccb535bb):**
- One `orca orchestration check`, which delivered `msg_7700163a5a6f`: resume the same task from the preserved partials, reconcile narrowly, no full search.
- Read Codex's final report, root's repair release and binding disposition, the interruption note and the snapshot manifest. I did not read Codex's probe, its JSON receipt or any verifier v2 or v3 file.
- Re-read helper lines 436–471 and 745–780.
- Re-executed the four check scripts exactly as embedded in the evidence JSON, one after another (19, 58, 87 and under 1 seconds, Python 3.11.9). Script hashes match the recorded ones. Every recorded result reproduces with zero differences apart from elapsed time. This is not the author's search: the largest is the 18-placement probe.
- The two snapshot files were read for hashing only and still match the interrupted bytes (`c0f67365…c207`, `8322d1cd…f307`). The source `__pycache__` timestamps are still unchanged.
- Read-only `git status` and `git ls-files` were used to list files and find the Codex report by hash. No Git write of any kind.
- No new geometry measurement was made on resume. Every new number in this final text is Codex's **[C]** or a source reading **[S]**.

**Skills:** threejs-geometry, threejs-materials, threejs-lighting and webgl-landing-steering as consulted for the critique (r186 guidance against installed three 0.187.0). Not reloaded on resume; the orchestration skill was loaded for the worker commands. No API or dependency change is proposed.

**Session:** first attempt `claude.exe` argv `--model claude-fable-5-2 --effort high`, ACK `msg_38eb4ec06c77`. Resume: a new `claude.exe` process (pid 11168) with the same argv, ACK `msg_58ee8f5c6c02`. No model, effort or provider override in the environment in either. The server-effective model and effort are not observable from here. The resumed session did not carry the first attempt's working memory; it worked from the preserved report, the evidence JSON and the sources.

**Inputs, rehashed unchanged at the end (sha256):**

| File | sha256 |
|---|---|
| `source/build_fullkit_m4_geometry_v03.py` | `3b220b1d4614a8111247270b21771c5f2280493c16e3ab986603a24efcffaf37` |
| `source/build_fullkit_m4_v03.py` | `53fa310f1144c46916b0ce63f05188818861e63fe9c32abbf4fb3f1596872b84` |
| `source/measure_fullkit_m4_v03.py` | `9a3a098195e99b889ecee8b2213c9acc6a9dc50af68e1ae35e507e09b1b0bff5` |
| `manifests/m4-v03-cpu-preparation.json` | `d7196145a8665abefdf41b3235f3be8ec91aa7474b3c71fed2186d7537e20253` |
| `scene-m4-v03-preparation-report.md` | `b21b6f2b7b6b97786b4da8a34d59b114e2daf6fe5ffb5ae7d49c4117ecc3abc3` |
| `m4-v03-design-correction-disposition.md` | `8641fc89bd44b4bdf4fa5301962cca5de204b880305dcf9b7b627fdc6c311d50` |
| `m4-v03-normal-check-contract-review.md` | `cc7812bd57027365bb6e61064eabea6564c7c20aa7eec8c2f9d3b8e07312a3fc` |
| `m4-v03-focused-art-closure-task.md` | `614e8acb0aa03f6fdf41d17dcb91b8c664c9ae63d1e46a80de1ef3c1081492e4` |
| `m4-v03-author-clarifications.md` | `7742bb23d3e1f35a396df69177bcc4434c0c13afd4ea2884c6e4a477fbec8998` |
| `scene-m4-v03-cpu-verification.md` (Codex, read on resume) | `815edfabfb41fde8c3cd21e4a9429c1cf8be6d33f1a16ae2e008a23f5f2af174` |
| `m4-v03-verification-repair-release.md` (read on resume) | `625d41f636758be395400a9a7cfe05022201252d0d1fcbd2a368800587d626e2` |
| `m4-v03-verifier-binding-disposition.md` (read on resume) | `4ac02bc7a2ec2f09f38545270b9ff47c7c1e43d08d032ba5a8fdf79597800acd` |
| `m4-v03-art-review-interruption.md` (read on resume) | `7f78ad65ecb95584211bdd79c7a6ee734349f4eabff4982258b2d73b2bebf1b0` |
| Snapshot `partial-report.md` (not modified) | `c0f673655f2daa99adea3019935e1294ef098927b1ac307d83a128f692cac207` |
| Snapshot `partial-evidence.json` (not modified) | `8322d1cd0b11cd27af16ac9dfc990b6e279639469f263fb15cc4de98451bf307` |
| Snapshot `snapshot-manifest.json` (not modified) | `483c601a7c470d0a81221f780048568bb9e6dd41b7df1675fa5d16e462282b68` |
| `scene-m4-correction-plan-critique.md` (mine) | `323c52c02a353fe6a3f88e72a21060e6d0842c3c6fd81716c118d907810f03e1` |
| `m4-correction-plan-critique.json` (mine) | `240297df262507a7d1a1e46af412092d3e21aacf5df4c77c0a562615dd73d6a7` |
| `scene-m4-correction-plan.md` | `6d249f2800f6201ccb6abab99341b3a03e493a1ba238f0047683f4ceffe37de9` |
| `m4-correction-matrix.json` | `59fa954fdc61df8f1f9343dc93c384ed681666ce482d044d4f5986ddcffa2d77` |
| `m4-model-contract.json` | `8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98` |
| `art-direction.md` | `fd1c6d0edc96b7736b32de6397957ce8c549a838aabf67631adc52a0011a68bb` |
| `render-gates.md` | `15f10d9d9e8ba2b9e4cf938263b66b481267f824422f12ce63982862858f5fb3` |
| `asset-inventory.json` | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |
| Parent GLB `studio-full-kit-m3-proposal-v03.glb` | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| `studio-full-kit-m4-proposal-v02.glb` | `baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f` |
| v01 helper `build_fullkit_m4_geometry.py` | `c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0` |
| v01 builder `build_fullkit_m4.py` | `aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22` |

Structured findings, the four check scripts, their full results and the resume record are in `scene-coordination/m4-v03-focused-art-closure.json`. That file carries this report's final hash; its own hash is in the `worker_done` message.
