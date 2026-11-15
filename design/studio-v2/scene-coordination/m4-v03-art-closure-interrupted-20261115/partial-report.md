# M4 v03: focused art closure at source and plan level

**Review verdict: REQUEST CHANGES (bounded).** Two findings stay open (K1, A1), one needs a wording fix (R2), and the pose search should take one more step before root settles a candidate. N1, H1 and R1 are addressed at source level and wait on export and images. This is not a visual approval: no GLB, blend or image exists.

15 November 2026. Reviewer: retained actual Claude Fable 5.2 / high (task_1dc141d6856b, ctx_fb0a0d443f54). Follow-up to my critique `scene-m4-correction-plan-critique.md` (`323c52c0…03e1`). I did not author the art. Root alone settles candidate, variance and export decisions.

## How to read the evidence

| Tag | Meaning |
|---|---|
| **[S]** | Source fact: I read it in the v03 helper, builder or measure script |
| **[M]** | My own small read-only check (four short Python runs, scripts and results embedded in the JSON) |
| **[A]** | Author claim from the receipt or report that I did not reproduce |
| **[R]** | My recommendation |
| **[X]** | Decided only by the final export or by images |

My checks import the author's helper and measure module with bytecode writing off. They do not repeat the 156-second run: no search grid, no intersections, no gap tests. Codex owns numerical reproduction.

## 1. Verdict by finding

| Finding | Verdict | What remains |
|---|---|---|
| **N1** flat panels | **Addressed at source; not closed** | Class-completeness enforcement (Codex found it missing), exported NORMAL check, images. One low class-intent note (section 7) |
| **K1** ground contact | **Retained** | Both kick spurs float 5.0 mm above resting height. Support coverage method is incomplete. One unattached spring foot |
| **H1** key fronts | **Closed at source, conditional** | Codex count and pitch reproduction; images |
| **A1** script master | **Retained (bounded)** | Conditions 1 and 5 met at source. Conditions 2 and 4 need the label split and a second edge band. Condition 3 waits on export |
| **R1** rug variance | **Closed at plan level, conditional** | Root's allowance conditions: K1 (open), 150 mm margins (met), images |
| **R2** rug wording | **Retained (wording only)** | Replace the "50 mm avoidance" sentence (section 6). No rug move |
| **P1** pose | **Correction recommended before settling** | One more refinement step; then an image gate either way |
| **P2** visibility figures | **Correction to the measure and the report** | Contact decals are counted as occluders; fractions are vertex-weighted |
| **B1** rack back foot | **Accept** | Image gate only |
| **E1** unnamed hard edges | **Per-set recommendation** (section 5) | One edge should be bevelled; the rest need root's per-set decision |

## 2. N1, K1, H1, R1 in detail

### N1: flat casing panels

- **[S]** Each face gets its class from the primitive that makes it (`prism`, `bevel_corners`, `rrect`, the pad lathe's `strip_cls`). Nothing is derived from normals. `corner_normals()` gives a smooth fan the angle-weighted normal of its highest class only: planar, then round, then bevel (helper lines 1018–1079).
- **[S]** The builder maps normals per (polygon, vertex), asserts each polygon's vertex set, orients to the recalculated winding, calls `normals_split_custom_set`, then asserts the 2° predicate on an in-memory readback (builder lines 124–158). It says itself that this is not an export check.
- **[A]** Seven classified rows; authored maximum 0.00° on every planar triangle; 0 failures.
- **[S]** The receipt carries per-group class runs and hashes of the class array and corner normals (`classes_repr`). That is the right raw material for Codex's hash-bound sidecar.
- **Not closed because:** the coordinator relays (`msg_1a3621b770bb`) that Codex found class completeness is not enforced, and the author accepts this in `m4-v03-author-clarifications.md`. That repair and the exported accessor check are Codex's. **[X]**

The intended appearance in my critique is met by this design: flat faces keep their own normals and the turn happens across the bevel.

### K1: ground contact

**Fixed [S][M]:** the v01 stool defect is gone. `stool()` raises on mixed or binding support. My low-point scan finds every primary footprint at exactly the resting height: four stool feet, stand ends, sustain base, rack feet and rubber ends, kick base and pedal plate, hi-hat base, three throne feet.

**Still open:**

1. **Kick spurs float [M][S].** Both spur tips (helper lines 755–757, label `kick.hardware`) end 5.03 mm above the resting height, at about (1.245, 0.560) and (1.595, 0.560). The author declares them intended supports and asks for no exemption. I agree: they are the kick's anti-creep feet and must touch.
2. **Spring foot is unattached [M][S].** The kick pedal's spring (line 779) is at x 1.478, 7 mm outside the base plate's edge at 1.465. Its lower end sits 6.0 mm above the rug with nothing under it. The two posts (line 770) straddle the same plate edges, half on and half off. This is inherited from v01 and small, but `render-gates.md:66` says nothing floats.
3. **Coverage method.** The row-minimum selector and the rectangular rug classifier are Codex's and the author's to repair. One art-side fact that may help: by my scan no M4 support is nearer than about 0.30 m to a rug corner **[M]**, so the rounded-corner error cannot change the present placements.

**[R] Bounded owner correction** (author, same `kick()` function, no triangle change expected):
- Lower both spur tips to the resting height. Prefer a flat-bottomed tip so the spur has a footprint, not a point.
- Widen the pedal base plate to carry the posts and the spring (half-width 0.045 to about 0.066), or move the spring inboard.

Do not close K1 on the receipt's `pass` booleans.

### H1: white-key front lips

- **[S]** One table entry, `white_key_lip`, 3.125 mm × 2 segments, applied to the front-top corner of each white key's front block (`bevel_corners(..., 'white_key_lip', which={3})`). Stems and black keys stay sharp, which root allows.
- **[A]** 29 lips of 3.13 × 3.12 mm; keys 1,168 of 1,540; pitch 0.0294 and gap 0.0034 preserved.
- **[M]** At the authored pose all 29 key tops are first hits and key pitch is 13.6–14.7 px at music-1440 (author's functions, my run).

This is the treatment I asked for. Closed at source, conditional on Codex and on images.

### R1: rug variance

Root granted the allowance. Its conditions stand as follows.

| Condition | State |
|---|---|
| Corrected support checks | **Open** (K1) |
| 150 mm of rug beyond the outermost rack foot | **Met [M]:** left 255, right 230, back 155, front 1,740 mm to the rug's outer edge. To the flat field these are 26 mm less (229, 204, 129) |
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

### P1: the selected pose sits on a corner of the search box

**[A][M]** The refinement box was cx 1.275–1.325, cy −0.825 to −0.775, yaw −0.85 to −0.75. The selected pose (1.325, −0.825, −0.85) is at its limit in all three. The author flagged the yaw edge only. I reproduced the selected row exactly with the author's `evaluate()`: azimuth 30.6701°, throne 45/73, sustain 103/116, kick 188/210, targets 81.

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

## 6. R2: rug and decal wording

**Facts [M], from the parent GLB through the author's loader:**
- Lamp base minimum x 2.235. Desk-frame floor runner maximum x 0.49. Span 1.745 m.
- Rug x 0.56–2.215. So: 20 mm to the lamp base, **70 mm** to the desk-frame runner.
- Under-desk contact decal maximum x 0.55. So: **10 mm** from decal to rug.
- 1.745 − 0.020 − 0.020 − 0.050 = 1.655 m. The "50 mm" is a width-budget term.

Root's sentence, "20 mm desk-frame clearance and 50 mm avoidance of the under-desk decal", can be read as a 50 mm gap to the decal. There is none.

**[R] Proposed replacement wording (no geometry change):**

> Rug C11: the rug stays at x 0.56–2.215, y −1.36–0.89 (1.655 × 2.25 m). The physical span between the desk-frame floor runner (x 0.49) and the lamp base (x 2.235) is 1.745 m. Actual clearances are 20 mm to the lamp base, 70 mm to the desk-frame runner and 10 mm to the edge of the retained under-desk contact decal (x 0.55). The 70 mm is a 20 mm frame clearance plus a further 50 mm of width given up so that the rug's edge clears that decal. "50 mm" is width budget, not a gap to the decal.

Add to the reconsideration list: the under-desk decal growing or moving more than 10 mm toward +x.

The 10 mm is not a visual risk in itself: the decal lies on the floor and would pass under the rug's edge. The wording matters because the next person will otherwise budget against a gap that is not there.

**M6 dependency, one addition [M].** The music-corner decal's plane (z 0.0205) is above the hi-hat base plate's top (0.0186), the kick pedal base plate, the cables on the rug and the lower part of every rubber foot inside its outline. M6 must lower it to the field or cut it around those footprints. M4 does not edit it.

## 7. A1: the authoring method

| Condition | State | Evidence |
|---|---|---|
| 1. One bevel table | **Met [S]** | `BEVEL_CLASSES` with `bev()`; the only radius uses are helper lines 223, 263 and 697. No literal bevel radius at a call site |
| 2. Edge sets and sharp exemptions with reasons | **Retained** | `SHARP_REASONS` exists and the author flagged its own gaps. See the three points below |
| 3. Custom normals verified independently | **Pending [X]** | Codex, on the exported accessors |
| 4. Per-row triangles, bounds, edge lengths; rerun reproduces | **Retained** | My rebuild reproduces every hard-edge label total in the receipt **[M]**. The definition is too narrow (below) |
| 5. Stage files, source, materials, row contract | **Met at source [S]**; builder not run | SHA pins and row-contract asserts in the builder |

**What to correct under conditions 2 and 4 (bounded, no geometry change):**

1. **The receipt counts only convex edges of 80° or more [S].** The builder splits at 40°. By my count **[M]** the split edges are: 124.70 m convex ≥ 80° (reported), **139.10 m convex 40–80° (no length or reason reported)** and 24.82 m concave. The unreported band is mostly the lengthwise edges of low-sided round members: stand tubes 39.1 m (8 sides), music cables 35.6 m (5 sides), stool 7.8 m, throne 7.7 m, rack 7.5 m, kick hardware 7.2 m, pad-shell underside corners 7.0 m, sticks 6.3 m (6 sides), sustain cable 5.5 m. Add this band by label with a declared reason, for example `faceted-round` with the side count. The art direction asks for 8 sides under 12 px, so the side counts are right; what is missing is the declaration that these members are flat-shaded.
2. **`cable.*` says "end caps" but is mostly run edges [M].** Caps are 0.32 m of the 2.69 m. The other 2.37 m are lengthwise edges that exceed 80° where a 5-sided run is skewed at a bend (one edge is 0.65 m long). Fold them into `faceted-round`.
3. **Mixed labels and two wrong statuses.** Split labels as in 5e. `sticks` and `pad.*.head` carry status `casing` but are not bevelled casings; give them a status that says what they are.

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
| **AZ1** | music-1440 | Controller azimuth measured from the capture is at least 30°. The plan margin is 0.67°, roughly 10 px |
| **RUG1** | music-1440; right-down | Rug does not appear to touch the lamp base; desk-side edge reads clear of the desk frame; the rug reads as carrying the kit |
| **RK1** | right-down | Rack feet read as feet front and back; the rack does not look ready to tip backward |
| **E1a** | right-down | Kick pad ring does not look cheaper than the tom rims (only if root names it instead of bevelling) |
| **E1b** | music-1440; right-down | No allowed sharp set reads as an unfinished block: wheels, bezel, stool and throne hubs, pedal footboards |
| **F1** | music-1440 | Stand tubes and sticks do not read as faceted; cables do not sparkle |
| **M6** | carried | Music-corner decal does not veil pedal bases |

## 9. Decisions for root

1. Release the bounded K1 fix: spurs, spring and plate, and the support coverage repair, one owner per file.
2. Pose: one more refinement step (my recommendation), or keep the author's pose under T1.
3. Kick pad ring: bevel (my recommendation), or name it.
4. Grant or refuse each of the four new sharp sets in 5d.
5. Confirm whether "knobs" and "pedal hinges" are read by kind of part.
6. Adopt the label split, the 40–80° band and the decal-is-not-an-occluder rule.
7. Adopt the R2 wording.
8. State whether "each side" means left and right, or all four.

## 10. Limits, session and hashes

**Not done, by instruction:** no Blender, browser, render, software sheet, image generation, build, server, Git, dependency or process action; no helper or subagent; no source, asset or artist-file edit. I wrote only this report and its JSON.

**Done outside the listed inputs:**
- Four read-only Python checks (about 12, 40, 44 and under 5 seconds), written to my scratchpad. The source `__pycache__` timestamps are unchanged.
- One `orca orchestration check` at the user's instruction, which delivered `msg_1a3621b770bb`.
- Read `m4-v03-author-clarifications.md`, named in that message. I did not read Codex's in-progress verification files.

**Skills:** threejs-geometry, threejs-materials, threejs-lighting and webgl-landing-steering as consulted for the critique (r186 guidance against installed three 0.187.0). No API or dependency change is proposed.

**Session:** `claude.exe` argv `--model claude-fable-5-2 --effort high`; no model, effort or provider override in the environment. The server-effective model and effort are not observable from here. ACK `msg_38eb4ec06c77`.

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

Structured findings, the four check scripts and their full results are in `scene-coordination/m4-v03-focused-art-closure.json`.
