# M4 v04 diagnostic art review: the 299 contact pairs and the phone H1 framing

**Reviewer:** actual Claude Fable 5.2 (`claude-fable-5-2`, `--effort high`), the retained independent critic session, PID 11168, under Orca. Task `task_578397972a46`, dispatch `ctx_0fdd7d725ec4`. Root request `msg_a52e093151c4`; S continuation `msg_3f2fc2cdc4db`. Coordinator S `term_34bea5af…`.

This is an interpretation of existing evidence. I ran no measurement, changed no source, camera, geometry or contract, and approve nothing visually. All fourteen image gates stay open.

## Summary

**The 299 unclassified pairs.** Every one is inside a single row, and I can name the joint for each from the pinned source:

| Reading | Pairs |
|---|---|
| Clearly intended assembled joint (part seated in, stacked on, butted against or passed through its neighbour) | 276 |
| Intended joint with one thing to look at in an inspection export | 8 |
| Unresolved in intent: the 15 cable pairs | 15 |

- **The 15 cable pairs are one construction, not 15 routing collisions.** They are exactly the 15 pairings of the six pad and pedal cables that leave the module's cable snake. All six are drawn from the same start point along the same first 25 mm, so six tubes occupy one tube's space there. Whether that shorthand is intended is not stated anywhere. It is small on screen and does not block an inspection export.
- **I recommend no blanket within-row exemption and no new criteria.** The family table in section 3 is a record of what each contact is, not an approval of how it looks.
- **The contact list is silent about joints that do not touch.** One looks like a real float: the module's holder arm records no contact with anything (section 4.4).

**Phone H1.** The adopted H1 wording asks for 29 white and 20 black keys countable at music-320 and music-390. With 10 of 29 key centres in frame, that cannot be met at music-320 if the real preview matches the planning camera. My reading:

- The cause is framing, not the keyboard. The music look aims at the drum kit, and the keyboard sits to its right.
- The smallest way to get phone H1 evidence inside the existing constraints is to capture the existing `right-down` look at 390 and 320 as well as `music`. Nothing closer to the keyboard exists within the look bounds.
- At 320 even that look probably leaves about two far-end keys out of frame. That is a rough hand estimate; the Codex critic's projection governs. Whether a full count is then required at 320 is root's decision. I do not waive it.

**Blockers.** I found no concrete inspection-export blocker in this evidence. Sections 6 and 7 separate what an inspection export can settle from what needs actual images.

Evidence tags: **[R]** read in the producer report or CPU receipt, **[S]** read in the pinned helper source, **[J]** my judgement, **[E]** my rough hand estimate (not a measurement).

## 1. Pins

Paths are relative to `design/studio-v2/`. I hashed each file before reading it, and re-hashed all of them when I finished.

| Evidence | SHA-256 |
|---|---|
| `scene-m4-v04-producer-report.md` (final, with contact appendix) | `635572bf32854fa274f2445645a0604ba29a77d951abb4cd23880483340f4ac7` |
| `asset-pipeline/full-kit/manifests/m4-v04-cpu-measurements.json` (CPU receipt) | `be6c205db283f86ce8a8048c0dde58ae11e0cdb38ff326e1a4c62d26a9265bea` |
| `asset-pipeline/full-kit/manifests/m4-v04-rows.json` (group names only) | `1fa5fdd3f267896a76743aca986af9cadd1dd84610395e6049fc799009489992` |
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` (helper) | `8d814874ee0ac1317827297d2a729b34f4789fffd891212ae03e2c440a73b792` |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` | `8ce8db34b40a3ce053d037c5152fec8c8ed19d586b0968439abf64e3308f32bb` |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` (held builder) | `0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826` |
| `scene-m4-v04-preparation-report.md` as committed in `e684190` (frozen original author report) | `6b2a62a31ab086a5a72c880ecad04332576a5ae14c31ab882f6421aa6f51c6be` |

The three source files are the source-closed bytes of commit `e684190`. The producer report and CPU receipt are unmodified since commit `8a6addb`, which was HEAD when I finished.

The author report on disk is now a prose-only successor (`71139a40e60aaf38859b53512d79bfb5a84179783544b11fa53f0fa5796c2c92`); S told me it corrects locator names only. The frozen original remains readable in commit `e684190` and is my audit context, as read in my source closure. I did not review the successor.

Framing context, read only:

| Document | SHA-256 |
|---|---|
| `scene-m4-v03-focused-art-closure.md` (section 8, H1 gate wording) | `4157a176701d2697e44cd39cc3de0b0b3a4d2101d36a46bf8212ff01361401af` |
| `scene-art-direction.md` (fixed eye, yaw and pitch bounds) | `0691d9f67cdb2baffab317f936fa546a54046c914d83065e64fd188ce831ef83` |
| `asset-pipeline/full-kit/render-gates.md` (capture camera list) | `15f10d9d9e8ba2b9e4cf938263b66b481267f824422f12ce63982862858f5fb3` |

Optional machine-readable record: `scene-coordination/m4-v04-diagnostic-art-review.json` (every one of the 299 pairs with its family and reading).

## 2. What the contact figures can and cannot say

The receipt tests triangle surfaces against each other and reports, per pair of parts, two counts **[R]**. Neither count separates touching from penetrating:

- **"Noncoplanar"** counts triangle pairs where an edge of one meets the other. A tangent touch and a deep crossing land in the same count. Example: by the source constants the kick beater's tip point lies exactly in the head's front plane, a pure touch, and scores 24. The declared 4 mm footboard seat scores 21 **[S][R]**.
- **"Coplanar"** counts same-plane triangle pairs that share an edge, a point or an area. A rubber end butted onto a tube end and two surfaces drawn on top of each other both land here.
- **Counts follow tessellation, not depth.** A 16-sided tube against its end cap scores 300 and 244; that is a butt joint between two finely divided discs, not a large overlap.
- **No depth, volume or facing.** The figures cannot tell a hidden back-to-back seat from two same-facing surfaces that could flicker against each other in a render.
- **No contact is recorded for a part wholly inside another, or for a part that stops short.** The kit's convention is a 0.3 mm resting gap between rows, so every correctly seated cross-row joint shows nothing, and so does a part that floats.

So the list can sort pairs by identity. Why each pair touches comes from the source, which I read for each family below. How each joint looks is an image question.

## 3. The 299 pairs by joint family

Counts are from the receipt **[R]**; reasons are from the pinned helper **[S]**. "Intended" means the source builds the part into its neighbour on purpose. It is not a visual approval.

| Row | Joint family | Pairs | Why they touch | Reading |
|---|---|---|---|---|
| `ctl_body__shell` | Casing blocks: slab, panel, two bays, two cheeks | 9 | Panel and bays stand on the slab at key-bed height and end on the cheek inner faces | Intended |
| | Controls on the panel: 8 pads, 8 knobs, bezel, 4 transport keys | 21 | Each is seated 2 mm into the sloped panel top | Intended |
| | Wheels: slab, left bay, slot and wheel, twice | 8 | Each wheel sits in its slot through the bay top and dips into the slab | Intended |
| `ctl_keys__keys` | White key front block to its own stem | 29 | Each white key is two blocks that overlap by 0.2 mm | Intended |
| `ctl_stand__frame` | Rubber ends on arm and foot tubes | 8 | Same-radius end pieces butted onto the tube ends | Intended |
| | X-frame tube ends into arms and feet | 8 | Tube ends run into the arm and foot tubes | Intended |
| | The two tubes of each X | 2 | They cross through each other at the pivot | Intended |
| | Pivot hardware: plates, teeth, bolt, knob | 17 | Plates and teeth sit on the tubes; the bolt runs through tubes and plates; the knob butts onto the bolt end | Intended |
| `ctl_sustain_pedal__pedal` | Hinge to base and to plate | 2 | Hinge barrel seated 2 mm in the base top and holding the plate's back edge | Intended |
| `stool_keys__stool` | Seat, post, collar, hub, legs, feet | 11 | Seat on post; post through collar into hub; legs into hub and feet | Intended |
| `drum_rack__rack` | Tube T-joints: uprights to feet, side bars, crossbar | 6 | Each bar ends on the axis of the tube it joins | Intended |
| | Rubber ends on feet and side bars | 6 | Same-section end pieces butted onto tube ends | Intended |
| | Clamp blocks round tubes | 20 | Each clamp block is drawn round the tube it grips | Intended |
| | Clamp bolts and wings | 28 | Bolt base on the block face; wing on the bolt end | Intended |
| | Mount stubs and cymbal booms | 13 | Stubs start on the tube axis inside their clamp; booms start on the clamp face | Intended |
| `drum_pads__shells` | Lugs on shells | 18 | Each lug sits 2 mm into the shell wall | Intended |
| | Mount block under each shell | 4 | Block top is 0.5 mm into the shell bottom | Intended |
| | Arm into each mount block | 4 | The arm ends inside the block | Intended |
| | **Arm against the shell itself** | 4 | The arm also meets the shell, by differing amounts | **Look (4.2)** |
| `drum_cymbals__cymbals` | Per cymbal: rod, felt, tilter end, nut body and wings, disc | 24 | Rod through the bell; felt, tilter end and nut on the rod; nut on the bell top | Intended |
| `drum_kick__tower` | Tower on base; head and pad ring on the tower face | 3 | Tower stands on the base; head and ring backs are 2 mm into the tower face | Intended |
| | Beater mechanism: posts, axle, cam, chain, shaft, beater | 7 | Axle through the post tops; cam and shaft on the axle; chain to the cam; beater on the shaft | Intended |
| | Beater on the head | 1 | The beater's tip point touches the head's front plane | Intended |
| | **Pedal root at the base front:** plate, two posts, spring into the base; spring against a post | 5 | The plate runs 20 mm into the base front; posts and spring stand more than half inside that face; the spring overlaps one post by up to about 1 mm | Plate: intended. **Other four: look (4.3)** |
| `drum_hihat_pedal__pedal` | Housing and heel rubber on the base | 2 | Both stand on the base top | Intended |
| `drum_module__body` | Knob, six buttons, holder plate, snake on the case | 9 | Knob and buttons seated 2 mm into the front; plate 0.5 mm into the back; snake starts inside the lower edge | Intended |
| `drum_throne__throne` | Seat, post, memory lock, hub, legs, braces, collar, feet | 15 | Same construction as the stool, plus three braces into the legs and collar | Intended |
| `music_cables__runs` | **Six pad and pedal cables against each other** | 15 | All six share one start point and first segment | **Unresolved (4.1)** |
| | **Total** | **299** | | 276 intended, 8 look, 15 unresolved |

## 4. Flagged cases

### 4.1 The 15 cable pairs: one shared lead, drawn six times

**What they are.** The six cables `tom1`, `tom2`, `snare`, `tom3`, `kick` and `hihat_pedal` each start at the end of the module's cable snake **[S]**. The receipt gives all six the same start centre **[R]**. Six cables make exactly 15 pairings, and those are the 15 pairs. The other two music cables, `controller` and `module_power`, record no cable-to-cable contact **[R]**.

**What the source does [S].**
- All six runs begin with the same two points, 25 mm apart, then go their own ways. So six 6 mm tubes are drawn in the same place for the first 25 mm and overlap further while they fan apart.
- Every pair scores exactly 9 coplanar triangle pairs except one **[R]**. Nine is what two identical five-sided end caps drawn in the same place would give (three triangles each), which fits the shared start **[J]**.
- `tom1` and `tom2` also share their third point, about 46 mm further on. That is why this pair alone scores 255 and 32 **[R]**.
- `tom1` then steps back about 3 mm before turning to its jack **[E]**: its fourth point sits just behind its third. A cosmetic kink in a 6 mm tube.
- After the fan-out, `tom2` and `tom3` are routed along the crossbar 10 mm apart in height, which looks like deliberate dressing.

**Reading [J].** This is a bundle shorthand: one visible cable leaves the snake and splits into six. It is not six cables colliding somewhere along their routes. But the intent is not written down, and it is physically odd for an 18 mm snake to hand off to a single 6 mm lead. Two limits on my reading:
- The counts cannot separate fan-out overlap from a later crossing. The source paths head in different directions after the split, but I did not measure downstream clearances.
- On screen the shared lead is a few pixels long and about 2 px thick at the 1440 music view **[E]**. I expect it to be invisible, and identical black tubes on top of each other should not flicker. Gate F1 ("cables do not sparkle") is where it would show.

**Not a blocker.** Root can either name the shared lead as a known construction or ask the author to separate the six starts in a later bounded pass (recommendation R2).

### 4.2 Pad mount arms meet the shells, not only the mount blocks

Each pad's arm ends inside its mount block, which is intended. The same arm also contacts the shell, with counts of 8 (`tom2`), 34 (`tom1`), 38 (`tom3`) and 52 (`snare`) **[R]**.

The arm is a 20 mm tube whose end is centred 12 mm below the shell bottom **[S]**. Unless it arrives from straight below, part of the tube rises through the shell's underside on the way in **[J]**. The differing counts suggest differing amounts, but they cannot say whether this is a graze at the block or a cut through the shell's lower edge.

The entry is under and behind each pad, away from the fixed eye, so I expect it to be hidden in every planned view **[J]**. It should be looked at once from below in an inspection export.

### 4.3 Kick pedal root: posts and spring half inside the base front

The pedal plate runs 20 mm into the front of the kick base, and the two posts and the spring stand on the plate exactly at that front face **[S]**. The declared criteria already confirm they rest on the plate at zero gap **[R]**. The unclassified contacts record the rest of the picture:

- Each post (16 mm) and the spring (12 mm) stand more than half inside the base's front face for their lowest 29 mm **[S]**. This reads as posts rising against the base front, not as a gap.
- The spring overlaps the right post by up to about 1 mm along its length **[S]**, as a spring hooked tight beside its post.

Both look deliberate to me **[J]**, and neither opens a gap of the kind K1 guards against. They are unstated in the author's report, which describes the posts and spring only as standing inside the plate. Gate K1 and one close inspection view will settle how the root reads.

### 4.4 What the list cannot show: parts with no recorded contact

Because a part that stops short records nothing, I checked the receipt for authored parts that touch no other opaque part at all **[R]**. Most are the resting-gap convention at work: the 20 black keys, four pad heads, both display faces, both sticks, the rug, and three cable runs whose ends stop within about a millimetre of what they plug into. Two are not:

- **`module.arm` touches nothing.** The source ends the arm 12 mm behind the module case, but the holder plate it should meet is only 6 mm thick **[S]**. For the four pads the same construction ends inside a 20 mm block, and the receipt records that contact every time. So the module's arm probably stops up to 6 mm short of its plate **[J]**. I did not measure the gap. It is on the back of the module, which faces away from the fixed eye, so I expect no planned view to show it. It matters for an inspection export viewed from behind and for any claim that the kit is fully assembled.
- **Two stand teeth touch nothing.** Each X frame has three small height teeth (8 × 12 × 10 mm). The receipt records a tube contact for the first two on each frame; the third (`stand.tooth#2`, `#5`) touches no part, and all six start 2 mm clear of the pivot plate **[S][R]**. At the planned views this is a speck of a few pixels **[E]**.

One wording note: the slab's edge-set reason says its ends are "hidden inside the cheeks". The source stops the slab 0.2 mm short of each cheek **[S]**, which is why no slab-to-cheek pair appears. The slit is far below a pixel and I raise no concern.

## 5. H1 at phone width

### 5.1 What the evidence says

- H1 as root adopted it: at music-1440, and at music-320 and 390, key fronts show one continuous lip and 29 white and 20 black keys are countable. I wrote that view list in the v03 closure.
- At the planning phone camera (320 × 844, yaw 44, pitch −8, vertical FOV 74) only 10 of 29 white-key centres project inside the frame **[R]**. All 29 are unoccluded from the eye; they are simply outside the rectangle.
- At both 1440 views all 29 are in frame, at 12 to 15 px per key **[R]**.

### 5.2 Why it happens

The fixed eye never moves, so framing is purely a matter of look direction and lens.

- A 320 × 844 frame at vertical FOV 74 is only about 32° wide; at 390 it is about 38° **[E, arithmetic from the stated settings]**.
- The controller alone spans 30.7° from the eye **[R]**. It nearly fills a 320-wide frame even when centred.
- The music look (yaw 44) is centred on the drum kit. The keyboard sits well to its right: by my rough hand estimate from the pose constants, the white keys run from about 51° to about 76° of azimuth **[E]**. So the music look on a phone holds the kit and the near third of the keyboard.

This is a property of the portrait frame and the selected pose, not a defect in the keys.

### 5.3 Artistic judgement

- **The partial keyboard at music-320 can still read well [J].** Ten white keys is more than an octave, enough to show the two-and-three grouping of black keys that makes a keyboard recognisable. A keyboard running off the right edge of a drum-centred frame is an ordinary crop. What must be judged in the actual image is where the cut falls and whether the visible keys keep a clean lip.
- **Counting 49 keys in one 320-wide frame is not what makes the corner convincing [J].** What H1 protects is that the key bed reads as real keys, with a continuous front lip and a regular rhythm, and not as a striped slab.
- **Pixel size is the real phone risk [E].** At 9 to 10.6 px per white key, the 3.4 mm gaps between white keys are about one pixel wide and a black key is about 4 to 5 px. At one device pixel per CSS pixel the white gaps can shimmer or vanish. Counting is only fair at the pixel ratio the runtime really uses on a phone.
- **The gate wording stands until root changes it.** As written, H1 at music-320 cannot pass with 10 of 29 keys in frame. I named that view without checking keyboard coverage on phones, and the pose has since moved to P14. I can say what the gate was meant to protect; I cannot waive it.

### 5.4 Smallest actual-preview framing approach

All of this uses the existing fixed eye, the existing look presets and the art-owned lens. It needs no camera, geometry or contract edit.

1. **Capture `music-320` and `music-390` in the actual preview, as already planned.** Do this first: the planning projection ignores the runtime's real responsive camera, so the real frame may differ. Judge the kit composition and the visible part of the keyboard (lip, rhythm, where the crop falls).
2. **Also capture the existing `right-down` look (yaw 58, pitch −16) at 390 and 320.** Root's baseline capture set already took this look at 1440, 390 and 320. It is the corner of the look bounds nearest the keyboard, and its pitch roughly matches the keyboard's height below the eye **[E]**. No reachable look is closer, because the documented yaw bound is +58 and the keyboard is centred further right.
3. **Record the device pixel ratio of each phone capture,** and judge countability at the ratio the runtime really uses.
4. **Expect, and check, the following [E].** At 390 `right-down` should hold all 29 white keys with a thin margin on the right. At 320 it probably leaves about two far-end keys outside the frame even at the look limit. These are hand estimates, not projections. The Codex critic owns the projection figures, and the actual capture decides.

**If the 320 capture confirms that the far end never enters the frame,** root has a choice that I can frame but not make:

- **Option A (my recommendation):** take the full 29 + 20 count from `right-down-390` and music-1440, and judge 320 on the keys that are in frame (continuous lip, clean rhythm, no shimmer, acceptable crop). This keeps H1's purpose and changes only which existing views carry the count. It is a root decision on the gate's view list, not something I can grant.
- **Option B:** keep the literal wording at 320. The gate then cannot pass without widening the look bounds or moving the controller, both outside this task and much larger than the problem.

The already-measured fallback poses P08 and P13 would not change this: they move the controller by 25 mm or 0.05 rad, far less than the frame is short by **[J]**.

## 6. Blockers and image concerns, kept apart

**Concrete inspection-export blockers: none found in this evidence.** No contact pair and nothing in the phone diagnostic prevents exporting for inspection. The H1 item is a capture-plan and gate-wording question, not an export question.

**Decidable by root now, without images:**
- Whether the shared cable lead (4.1) is an accepted shorthand.
- Whether the module arm (4.4) should be looked at before or after export.
- Which views carry the phone H1 count (5.4).

**Needs an inspection export, viewed freely (not from the fixed eye):**
- Under and behind each pad: how far the arm enters the shell (4.2).
- Behind the module: whether the arm reaches the plate (4.4).
- The kick pedal root at the base front, and the spring beside its post (4.3).
- The stand pivot: the floating third teeth (4.4).
- The snake end: the six-into-one cable lead and the `tom1` kink (4.1).

**Needs actual fixed-eye images (existing gates):**
- H1: lip and count at music-1440; lip, rhythm, crop and shimmer at the phone views (section 5).
- K1: contact at the kick base, pedal and spurs; hi-hat barrel seat and toe rest.
- F1: cables do not sparkle, including at the snake end.
- E1b and HH1 as already listed in the author report.

## 7. Recommendations

- **R1. Keep the 299 as interpreted, not exempted.** Record the family table as the reading of the existing receipt. Add no within-row exemption and no new attachment criteria by default. The 15 pairs that already have criteria show the bar a joint must clear to be called verified; the other 276 are only identified.
- **R2. Decide the cable lead by name.** Either accept "six pad and pedal cables share one 25 mm lead out of the snake" as a known construction for the inspection export, or schedule the author to separate the starts later. I recommend accepting it for inspection and deciding after the inspection view and gate F1.
- **R3. Add five free-view looks to the inspection review** (the list in section 6). They cost nothing at source and answer every open point in section 4.
- **R4. Treat the module arm as the one probable float.** It needs a measured answer from the Codex lane or an inspection view before anyone states that every part is attached. It does not affect the planned images.
- **R5. Capture phone H1 as in 5.4,** and let root choose Option A or B only if the 320 capture confirms the crop.

## 8. Method and limits

- I read the producer report's current sections and contact appendix in full (not its preserved historical record), the CPU receipt's contact, cable and view sections, and the pinned helper source for each joint family.
- I grouped the receipt's 299 pairs by part name with a short read-only script and checked that the families sum to 299. A second read-only query listed parts with no recorded opaque contact. Both read existing files only.
- I ran no build, measurement, projection, pose comparison, Blender, browser or render step, used no helper, and made no Git change. Git use was read-only (`rev-parse`, `log`, `status`).
- Figures tagged **[E]** are hand arithmetic from published settings and source constants. They are not measurements of record, and the Codex critic's projection and measurement work governs wherever they differ.
- Every "intended" reading rests on source text. None of it is evidence of how a joint renders.
