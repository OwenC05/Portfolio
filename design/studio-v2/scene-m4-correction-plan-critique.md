# M4 correction plan: independent critique

15 November 2026. Independent plan review for task_e044ad370b4e / ctx_5cc24f4c7395, by the retained actual-Claude reviewer. I did not write the plan and I am not the M4 artist.

This reviews the frozen plan `scene-m4-correction-plan.md` (`6d249f28…e37de9`) and matrix `scene-coordination/m4-correction-matrix.json` (`59fa954f…fa2d77`) against the art direction, render gates, inventory, root's disposition and S's handoff (`3595800a…183e1`). The author's v03 source now in preparation was not read and is not assessed.

## Verdict

**REQUEST CHANGES, bounded.** The plan's direction is right: correct the sizes, raise the stand, bevel the casings, and ask for a rug variance instead of forcing the target. Five items need a change or an explicit condition before root settles any variance or a v03 candidate is frozen.

This is a plan critique. It approves no variance, no image, no stage and no M4 acceptance. I made and viewed no image.

### Decisions in priority order

| # | Finding | What is needed | Owner |
|---|---|---|---|
| 1 | **N1.** The casing bevels will bend the flat faces unless normals are face-weighted. | Custom normals in the v03 builder, and a measured check on the export. This affects source being written now. | Author; S measures |
| 2 | **K1.** One stool foot already floats beyond the rug. Placement D makes it worse, and the proposed +0.04 shift does not fix it. | A contact rule in the combined check, and a stool position that meets it. | Root sets the rule; author places |
| 3 | **A1.** No documented exception to the live-modifier requirement exists. | A narrow authoring-method amendment before export. | Root |
| 4 | **H1.** Keys cannot be exempted wholesale. The white-key front lip needs authored shape, and it fits the row ceiling. | Remove keys from the blanket variance; name the rest. | Root; author |
| 5 | **R2.** The rug variance text omits the music-corner decal and mixes the physical limit with chosen clearances. | Rewritten scope and invalidation list. | Root; S records |

I separate four kinds of statement below. **Measured** means I measured it from the frozen GLBs or read it in frozen source at the cited line. **Author claim** means the plan states it and I did not re-measure it. **Recommendation** is my judgment. **Needs images** means only rendered pixels can settle it.

## 1. C11 rug variance

**Recommendation (R1): a width variance is justified in kind. Approve it only with the two conditions below.**

### What is physically established (measured)

- The desk frame ends at x 0.490 and the lamp base starts at x 2.235, both at floor level inside the rug's depth. The span between them is **1.745 m, which is 5.68% under the 1.85 m target** before any clearance. Both are retained, frozen, non-M4 geometry.
- **No rectangle within 3% of the target fits at any rotation I tested.** I searched rotations from −40° to +40° for a rectangle of at least 1.7945 × 2.1825 m that holds the rug-bound feet and misses the lamp base and desk frame. There were none. Turning the rug does not rescue the target.
- **The target was only ever met by passing through retained geometry.** The blockout proxy rug in the accepted M3 parent is 1.85 × 2.25 m at x 0.450–2.300. It overlaps the lamp base by 65 mm and the desk frame by 40 mm.

### What is a choice, not a constraint

The plan's 10.54% shortfall has four parts:

| Part | Width given up | Points |
|---|---|---|
| Physical span between desk frame and lamp base | 105 mm | 5.68 |
| Clearance to the lamp base | 20 mm | 1.08 |
| Clearance to the desk frame | 20 mm | 1.08 |
| Staying off the under-desk shadow decal | 50 mm | 2.70 |

The rectangular form, the alignment to the walls and the exact 2.25 m depth are also choices. I agree with all of them. A rug squared to the room reads as intended, and a notch at the lamp would read as a mistake in the right-down view. The 50 mm for the decal is reasonable: a rug laid over a shadow decal would cut the desk's shadow off at the rug edge. Widening to 1.705 m would still fail the gate and adds nothing visible.

I agree with the three rejected alternatives. The only route that meets the target is to run the rug under the lamp base or the desk foot. That is ordinary in a real room, but it lifts retained assets by the rug's thickness and reopens accepted stages for 65 mm of rug. I do not recommend it.

### Conditions before approval

1. **K1, stool contact (detail in section 3).** The plan's own third invalidation condition is "any rug-bound M4 item leaving the rug". That condition is already true in the frozen geometry: one stool foot is beyond the rug. A variance cannot be approved while its own invalidation condition holds.
2. **R2, name the music-corner decal.** The retained `contact_decals__music_corner` spans x 0.525–2.225 at height 0.0205 m. It overhangs the proposed rug by 35 mm on the left and 10 mm on the right, and it sits 12 mm above the rug's flat field. It was sized for the wider and thicker proxy rug. M4 cannot change it, because it is an M6 asset. The variance must list it as a dependency, and M4 images must be read with it in mind.

### Recommended variance text (not approved)

- **Scope:** this candidate only; leaf `rug__rug`; built outline 1.655 × 2.25 m at x 0.56–2.215, y −1.36–0.89; rectangle with bound edge, squared to the room.
- **Recorded as:** a variance against inventory line 1795 and `render-gates.md:65`. The inventory target is not edited.
- **States:** physical limit 1.745 m; chosen allowances 20 + 20 + 50 mm.
- **Invalidated by:**
  - any move or resize of the floor lamp, desk frame, PC tower, under-desk decal or music-corner decal;
  - any change of the rug's outline, depth, position or rotation;
  - any rug-bound floor contact outside the flat field;
  - less than 150 mm of rug beyond the outermost rack foot on either side (now 234 and 209 mm);
  - any change of eye, lens or pose bounds;
  - root restating the target;
  - an actual image in which the rug reads as too small for the kit, or the lamp base reads as touching the rug edge.

**Severity:** medium. **Locators:** `asset-inventory.json` id `rug` (line 1795), `render-gates.md:65`, plan lines 95–99, matrix row C11.

**Needs images:** both rug side edges in right-down-1440 and music-1440. The 20 mm gap to the lamp base is only a few pixels wide there, so it may read as a near-touch. That is a look call, and I cannot make it from numbers.

## 2. C13 hand-scale bevel exemption

**Recommendation: no blanket exemption. One item needs authored shape, the rest may stay sharp by name, and the casing bevels need a normals fix.**

### N1. Normals (high, required change)

The plan says a two-segment bevel "steps at 30°/60° faces, below the split, so it shades as a rounded highlight" (line 135). That is half of the art direction's rule. Line 129 asks for bevels "with weighted normals so bevels shade without doubling vertices".

**Measured in source:** the frozen builder marks every face smooth, splits edges only above 40°, and writes no custom normals (`build_fullkit_m4.py:110, 120–132`). With that method, a flat casing face joins the same smooth group as the 30° bevel face beside it, so the flat face's corner normals tilt toward the bevel. A large flat face then shades as a soft dome.

The risk is greatest on the white controller shell. It is the one large light surface in M4, about a metre long, and its flat panels are single faces.

**Required:** the v03 builder writes custom normals so that each flat casing face keeps its own face normal at the vertices it shares with a bevel. The turn then happens only across the bevel faces. This adds no triangles.

**Check for S:** on every casing triangle larger than 4 cm², each exported vertex normal is within 2° of the triangle's own normal.

**Needs images:** how visible the doming would be. The cause is certain from the source; its size on screen is not.

### H1. Keys (medium, required change)

The plan exempts all 49 keys because full bevels would exceed the row ceiling (936 + about 2,496 > 1,540). That argument rules out full bevels only.

The inventory names "key fronts and gaps modelled so keys are not flat slabs" as the identifying feature of this row, and root asked that key fronts be preserved. The front top edges of the 29 white keys form one line 0.85 m long, facing the eye. It is the most visible edge on the instrument.

**Required:** one edge treatment on the front top edge of each white key, exaggerated to about 3 mm or more. The detail floor (`art-direction.md:140`) says small features are "omitted or exaggerated to that size". For an identifying edge the right reading is exaggerate. By the plan's own pixel scale, 3 mm is about 1.3 px at music-1440.

**Cost (my arithmetic, to be asserted by the builder):** about 4 triangles per white key with one segment, or 8 with two. That is 1,052 or 1,168 of 1,540.

### Which parts may stay sharp

A part may stay sharp when the part itself is at or under the detail floor, or when it is dark and there is no environment map, so a bevel cannot show. A sub-pixel bevel estimate alone is not a reason.

| Class | Parts | Why |
|---|---|---|
| **Needs authored shape** | White-key front lip | Identifying feature; light colour; long continuous edge facing the eye |
| **May stay sharp for this candidate** | Other white-key edges; black-key edges; knobs; panel pads; transport keys; pad lugs and mount blocks; clamp caps and wing bolts; stand pivot plates and teeth; cymbal wing nuts; pedal hinges; pad-rim inner corner; rug inner binding step | Each part is small or dark. Black keys already taper, panel pads are already rounded in plan, and clamps are already octagonal in plan |
| **Corrected by the plan as casings** | Controller shell and cheeks; kick; module; hi-hat pedal; sustain; pad-rim outer corner | Agreed, subject to N1 |

**The sharp list is invalidated by:**

- any closer eye, narrower lens, zoom or larger viewport than the approved set;
- an environment map or a new light that makes dark hardware reflective;
- any material change that makes a listed dark part light;
- an actual image in which a listed part reads as a cut block.

### If bytes force a cut

The handoff shows no transfer margin, and the casing bevels add about 940 triangles (author estimate). Only the controller shell, its oak cheeks and the keys are light-coloured (measured from the author's swatch table). The kick, module, hi-hat pedal and sustain casings are black, and with no environment map their bevels will show least.

If S's re-forecast forces a cut, keep them in this order: white shell and cheeks, then the key lip, then the metal pad rims. Cut the black casings first, each by an explicit variance. This is a recommendation on priority and changes no constraint.

**Locators:** `art-direction.md:127, 129, 136–140`; `render-gates.md:65, 74`; inventory id `ctl_keys`; plan lines 100–103 and 135; root disposition line 20.

**Needs images:** the key row at music-1440 and on the phone music view; the controller shell's flat faces; an isolated grey turnaround of controller and keys beside the 1 m rule.

## 3. C2 stand: raised placement against the low fallback

**Recommendation (S1): the raised stand is the right art choice. Do not grant fallback E. Placement D is not yet a workable candidate, because of the stool.**

### Why raised

The stand is 17% low. It is the largest size failure in the plan, and it is in the tier that exists to fix inconsistent scale (`art-direction.md:43, 68`).

The eye cannot measure 0.68 m. What it reads is the keyboard against the stool beside it. Today the key tops are 127 mm above the stool seat, and the controller's underside is 73 mm above it. Raised, the key tops are 242 mm above the seat (author figures). The low version reads as a keyboard on a low table. The raised one reads as an instrument someone sits at.

Fallback E has nothing in its favour except that its numbers are already known. It also is not defect-free, as the next finding shows.

### K1. The stool (high, required change; measured)

The helper places the four stool feet at rug height without testing the rug outline (`build_fullkit_m4_geometry.py:223, 386–391`).

| Case | Stool feet against the rug outline |
|---|---|
| Frozen v02 geometry (also fallback E) | One foot is 63–94 mm beyond the rug's front edge. Its underside is 8.6 mm above the bare floor. |
| D, stool unchanged | The seat centre lands on the rug edge (y −1.367 against −1.36). One foot is 161–192 mm off, and two straddle the edge. |
| D with the plan's +0.04 shift | One foot is still 130–161 mm off, and one straddles the edge. |
| D, all feet inside the outline | Needs about +0.26. |
| D, all feet clear of the binding | Needs about +0.30. The seat then sits under the keyboard and inside the stand's footprint. |

So the +0.04 shift removes triangle intersections with the binding, but it does not put the stool on the rug. The gate is "nothing floats… every supported object shows contact" (`render-gates.md:66`). The plan reports "no intersections" for the base and for E. That is true, and it misses the floating foot.

**Required rule for the combined check:** every foot of a supported object rests on one surface. Either all feet are inside the rug's flat field, or all are on the bare floor at floor height. At least 20 mm separates any foot from the binding.

The author owns the solution. Two routes look workable from the geometry:

- **Recentre the stool on the keyboard and turn its legs 45° to the rug edge.** At D's yaw, moving the stool along the keyboard moves it back onto the rug. Stand-leg clearance must be checked.
- **Pull the stool wholly off the rug onto the floor,** as if someone had just stood up. It needs to drop to floor height.

Either one changes what the stool hides, so throne, kick-pedal and sustain-pedal visibility must be re-measured with it.

**S4 (low).** Under D the sustain pedal's lowest vertices come within 7 mm of the binding. Include it in the same check.

### S2. The azimuth margin (medium)

**Measured:** my unoccluded envelope of the controller is 32.14° at the base and 31.53° at D. That is a constant 1.17° above the author's visible-sample figures (30.96° and 30.36°), with the same differences between variants, so the sensitivities carry over.

At D the span changes by:

- −0.153° per 10 mm moved in +x;
- −0.059° per 10 mm moved in +y;
- +0.026° per 0.01 rad of yaw toward the eye.

The 0.36° margin therefore equals about 24 mm of sideways placement. On screen that is a 2% change in the controller's width, which nobody will see. It is a measurement risk, not a look risk.

**Recommendations:**

- Pin the author's visible-sample method as a durable script, and measure the built candidate with it.
- The author may test a little more yaw toward the eye. About 0.1 rad buys roughly 0.26°.
- The stand passes the size gate anywhere from 0.6596 to 0.7004 m. A height near the lower bound hides up to 20 mm less of the throne. Height does not change azimuth.
- If the combined solution misses 30° by a few tenths, return to root with images. Do not distort the layout or drop the stand to save tenths of a degree. In my judgment a correct stand, a grounded stool and a readable throne matter more than that threshold. No variance is implied by this.

### S3. Rack and ride (low, root decision)

The handoff asks root to keep explicit target semantics for the 1.16 m rack width. **Measured from the inventory titles:** `drum_rack` lists "uprights, crossbar, wing clamps, feet", and `drum_cymbals` lists "boom arms". The booms belong with the cymbals.

I recommend root record that the rack width means the frame with its clamps, which is 1.170 m after C4 (author claim). The ride is then moved, or not, on composition and not to rescue a number.

**Locators:** `art-direction.md:43, 68, 120`; inventory ids `ctl_stand`, `stool_keys`, `drum_rack`, `drum_cymbals`; `render-gates.md:66, 74, 126`; plan lines 80–91; matrix row C2.

**Needs images:** music-1440, right-down-1440 and the phone music view of the raised controller with throne and stool. A sample count of the throne seat (50 of 73) is not readability.

## 4. Editable source: bevel shape against the live-modifier requirement

**Finding (A1): no documented exception exists. Root needs to record a narrow amendment before any export.**

### Two separate questions

- **Is the bevel shape in the exported geometry?** Explicit vertices can carry it. The plan is right that the gate "bevel class correct" (`render-gates.md:65`) does not require a modifier.
- **Does the editable file meet the authoring contract?** That is a different requirement, and the plan's line 110 ("A modifier is therefore not required") does not address it.

### What the contract says

- `art-direction.md:129`: "One bevel family, live as modifiers in the editable files and applied only on export, with weighted normals".
- `art-direction.md:144`: "Arrays, curves, bevels and mirrors stay live in the stage files."
- `technical-plan.md:54`: "keep modifiers/material library/linked duplicates editable".
- Inventory stage M0 produces "bevel and normal modifier presets".

### What I searched and found

- The explicit-vertex method is **disclosed by the author** in `m3-preparation-report.md:34`, and in `m4-author-report.md:140` and `:216`, which calls it "the M3 rule".
- I found **no root document** that names these lines and waives them. Root's M3 dispositions accept candidate hashes and an appearance review.
- `m4-v03-preparation-task.md:19` says in terms that explicit geometry is not "an already approved exception".
- My own M3 and M2 reviews did not assess bevel class or authoring method. They cannot be cited as an exception.

This is the result of a search. It does not prove that no such text exists anywhere.

### Recommended amendment for root to consider

The purpose of "live" was that a bevel class can be retuned later without remodelling, and that the editable source stays the truth. A parametric script can serve both purposes, if the following are written down:

1. **Scope.** Script-authored full-kit stages M3 and M4 only. It replaces only the live-modifier clauses at `art-direction.md:129` and `:144` and `technical-plan.md:54` for those stages.
2. **Master.** The hash-pinned build script and geometry helper are the editable master. The saved Blender file is a snapshot. A re-run from the pinned inputs reproduces each row with the same triangle count and bounds.
3. **One bevel table.** Class, radius after tier factor and segment count live in one named place in the helper and are used by bevel-aware primitives. No literal bevel sizes appear at call sites.
4. **Declared edges.** Each bevelled edge set and each sharp exemption is declared in source with a reason: contact face, screen face, or a named variance.
5. **Normals.** The builder writes face-weighted custom normals in place of the Weighted Normal modifier (N1).
6. **Receipts.** Per row, the builder records triangles, bevelled edge length by class, and remaining hard edge length by reason.

**Not waived:** versioned stage files that are never overwritten; the build script kept with its stage; linked library materials; the row and reuse contract.

**Invalidated by:** a hand edit to a saved Blender file; a bevel-class change at M6 made without re-running the builders; or a later stage that returns to modifiers, where the original rule applies again.

Because M3 was built the same way, the amendment should cover it as a record of method. That does not reopen M3's accepted appearance.

**Severity:** medium. It is a process gap that blocks export, by root's own sequence.

## Missing pixels

Nothing in this review replaces these. Each is needed before any look decision.

| View | What it must show |
|---|---|
| music-1440 | Controller shell with bevels (flat faces read flat); key row with front lip; throne seat behind the raised controller |
| right-down-1440 | Stool feet and rug front edge; sustain pedal; lamp base against the rug's right edge; rug's left edge against the desk leg and under-desk shadow; music-corner decal over the rug edges |
| music-320-f74, music-390-f74 | Key row countability; raised controller against the throne |
| right-down at 320 and 390 | Stool and rug front edge, if in frame |
| Grey turnaround with 1 m rule | Controller and keys (gate G4, first row) |

## Skills consulted

All four target r186. Installed three is 0.187.0. I propose no API or dependency change, so no version-sensitive advice is used.

| Skill | What applies | What conflicts |
|---|---|---|
| threejs-geometry | Normals drive lighting. Shading follows the exported normal attribute, which supports N1. | Runtime bevels, merging and instancing conflict with the frozen named-leaf and draw contracts. Not adopted. |
| threejs-materials | Roughness and environment response decide whether an edge highlight shows. With no environment map, bevels on black parts show little. This supports the cut order in section 2. | Any material or environment-map change conflicts with the frozen library. None proposed. |
| threejs-lighting | Its shadow-bias guidance suggests offsets larger than the 8 mm rug and the 8.6 mm float. The shadow pass will not reliably hide or reveal the floating foot, so contact must be right in geometry. | Its fake contact-shadow recipes conflict with the imported-decal contract. Runtime-owned; no change requested. |
| webgl-landing-steering | Only its principle that readability comes before added detail. | Its orbit-camera, post-processing and compression lanes conflict with the fixed-eye, demand-render and dependency contracts. Not adopted. |

## Limits

- The rotated-rectangle search treats the desk frame's bounding box as solid at floor level. That is conservative, and it relies on the author's statement that the floor runner occupies x 0.45–0.49 across the desk depth.
- My azimuth figures are an unoccluded envelope, not the author's visible-sample method.
- I applied placement D as a rigid move of the frozen v01 shapes. It does not include the other corrections, so it is not the combined check that root asked S and the author for.
- Triangle counts for the key lip are arithmetic, not built geometry.
- I viewed no image. The corrected v02 pair was used as technical geometry evidence only.

## Evidence and hashes

`scene-coordination/m4-correction-plan-critique.json` holds the findings, the complete check script as text, and its results. The script reads the two frozen GLBs, verifies their hashes, and writes nothing.

| File | SHA256 |
|---|---|
| `scene-coordination/m4-correction-plan-critique.json` | `240297df262507a7d1a1e46af412092d3e21aacf5df4c77c0a562615dd73d6a7` |
| Check script (embedded as text in the JSON) | `e1bef4e7c8c536a4390fa6fa72b4d431e374408f766c3bf22116311a52079ad6` |

Frozen inputs, rehashed after the review and unchanged:

| Input | SHA256 |
|---|---|
| `scene-m4-correction-plan.md` | `6d249f2800f6201ccb6abab99341b3a03e493a1ba238f0047683f4ceffe37de9` |
| `scene-coordination/m4-correction-matrix.json` | `59fa954fdc61df8f1f9343dc93c384ed681666ce482d044d4f5986ddcffa2d77` |
| `scene-coordination/m4-correction-plan-root-disposition.md` | `25a9cc25afe911acf120e30b2182c01da49282ac6751a7bf0fa1ffffeb1679e1` |
| `scene-coordination/m4-correction-plan-handoff.md` | `3595800aee5e06e8f431f111402a76c4843fc6be91bd7bb9c35b7b1a31d183e1` |
| `asset-pipeline/full-kit/art-direction.md` | `fd1c6d0edc96b7736b32de6397957ce8c549a838aabf67631adc52a0011a68bb` |
| `asset-pipeline/full-kit/render-gates.md` | `15f10d9d9e8ba2b9e4cf938263b66b481267f824422f12ce63982862858f5fb3` |
| `asset-pipeline/full-kit/asset-inventory.json` | `eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87` |
| M4 source `build_fullkit_m4.py` | `aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22` |
| M4 helper `build_fullkit_m4_geometry.py` | `c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0` |
| M3 v03 parent GLB | `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` |
| M4 v02 pair GLB | `baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f` |

The JSON lists the rest, including the pair manifest, the technical plan, the author reports and the four skill files.

## Session

I acknowledged the task before reviewing (msg_02c9aede63c9). The observable launch is `claude.exe --model claude-fable-5-2 --effort high`, with no model, effort, provider or base-URL override in the environment, and I changed no setting. I cannot observe which model or effort the server applied.

I used no helpers, Blender, browser, renderer, build, server, Git, dependency, paid service or polling. I wrote only this report and the JSON.
