# M4 v04 bounded art review: three questions

**Status: final for this dispatch.** 16 November 2026. Independent critic: actual Claude Fable 5.2 (`claude-fable-5-2`, `--effort high`, observed in my own process argv, PID 11168), the retained session that wrote the focused review `4157a176`. Task `task_5f8b2d7069c3`, dispatch `ctx_029da9f53b67`, routed by root `msg_e699e7141d16` / reply `msg_a55cff891919`. ACK `msg_199bfb3c1f9f`.

**Scope.** Only the three questions root routed, answered against the frozen author checkpoint. This is not a visual approval, not a candidate acceptance and not a measurement of record. Root decides every exemption and release; nothing below grants one. The prior review `4157a176` and root's `m4-v04-combined-repair-disposition.md` stay authoritative, and all fourteen image gates stay open.

Evidence file: `scene-coordination/m4-v04-bounded-art-review.json`.

## 1. Answers at a glance

| Question | Disposition I recommend | Geometry change needed | Other correction needed |
|---|---|---|---|
| **Q1** spur arm roots 6 mm into `kick.base` | Sound, bounded K1 attachment correction. Root should confirm the author's reading | None | Two text items: say what `depthM` measures, and report the arm height change |
| **Q2a** `ctl.cheeks.front_corner` | **Correct it:** casing bevel on the cheek nose, about +32 triangles | Yes, small | The set also holds 8 underside mitre edges its reason does not describe |
| **Q2b** `cymbal.edge` | Keep sharp; root may accept it by name, for the whole edge band | None | The band's upper corner is filed under a wrong reason in another set |
| **Q2c** `pad.rim_lower` | Split in two. Rim lower outer corner: keep sharp under an image gate. Shell bottom corner: a hidden-edge reason, no exemption | None | Split the set; note the bevel fallback does not fit the row ceiling |
| **Q2d** `rug.binding_shoulder` | Keep sharp; root may accept it by name | None | None |
| **Q3** footboard in heel block | Intentional seating, and the right joint for an inclined board. No correction | None | Replace "inherited, reported" with a scoped seating statement |

No blanket exemption is proposed anywhere. Source intent and image or export requirements are kept apart in each section.

## 2. What I reviewed

Frozen bytes only, read with `git show 191a4c90cdb4d629a4eeff07549ab3e1e17e41b6:<path>`. All four hashes match the pins in the task.

| File at commit `191a4c90` | SHA256 |
|---|---|
| `asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py` (helper) | `83e1445f324159935571a350ea0b501a62f8286be3cee0a0903c11046225e0a3` |
| `asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json` | `f62a5850d8f3071011fc51c568801e0a8b02294e9ac8a2b5a789eeec70aa9abd` |
| `asset-pipeline/full-kit/source/build_fullkit_m4_v04.py` (held builder, not executed, not read in detail) | `eb0af482fed07fa8f3c9383019dbd982b3259d0ed25048fb45e118b9ba5c2333` |
| `scene-m4-v04-preparation-report.md` (sections 3, 6 and 7 are the subject) | `1af15373598043e8b686f70b4b989bb50a2a9a038838df7c80a60234071935ac` |

Authorities read: `scene-m4-v03-focused-art-closure.md` (`4157a176…01af`), `m4-v04-combined-repair-disposition.md` (`24e9b32c…1890`), `m4-v04-internal-contract.md` (`a2afc8a3…b5ae`). For the "unchanged since v01" claim I read three lines each of the frozen v01 helper (`c7ce9d8e…`) and v03 helper (`3b220b1d…`).

**The working tree has moved on.** `HEAD` is now `98eed1e` ("Record Claude P14 pose selection"), and the working helper hashes `4bb40946…`. By a read-only diff the helper differs from the checkpoint only in the two pose lines. I did not review those bytes. Every figure below is at the checkpoint's provisional pose P00; the kick, pads, cymbals and rug do not move with the pose, and the cheek edges are local to the controller.

Evidence tags: **[S]** fact read from the frozen source; **[M]** my own small check; **[A]** author claim; **[R]** recommendation; **[X]** image or export requirement.

**My check [M].** One read-only script imports the frozen helper copy, calls `build_all()` once at P00 and reads vertices and `edge_records()`. Plain CPython 3.11.9 with `-B`, run from my session scratchpad, under a second. The script and its full output are embedded in the evidence JSON. It is a reviewer spot check. Codex owns measurement.

## 3. Q1: spur arm roots embedded 6 mm into `kick.base`

**Verdict: sound and bounded. I recommend root confirm it as part of the K1 attachment remedy.** It needs no geometry correction.

### What changed

| | v03 (line 756) | v04 checkpoint (lines 868–870, `SPUR`) |
|---|---|---|
| Root centre | on the frame's side face, x = cx ± 0.125, y 0.51, 18 mm above resting height | 6 mm inside that face, x = cx ± 0.119, y 0.51, **22 mm** above |
| Tip centre | (cx ± 0.175, 0.56), 12 mm above | same plan position, **14 mm** above, inside the new foot |
| Arm | 71.0 mm, 45.0° to the side face normal in plan | 75.5 mm, 41.8° |
| Triangles | 28 per arm | 28 per arm; kick 1,040 of 1,500 |

**[S]** The arm's end disc is square to its axis. In v03 the axis left the face at 45°, with the disc centre on the face plane, so half the disc stood outside the frame.
**[M]** By the v03 constants that half was up to 4.97 mm proud (the author says 4.9). It is the same kind of defect as the spring in K1: an attached member that visibly does not meet its parent. My review `4157a176` listed the spur tips and the spring, not the roots, so the author is right that this goes beyond the literal list.

### What the v04 root does [M]

Identical on both sides:

- All eight root-ring vertices are inside the frame: 1.34 to 10.66 mm inside the side face, 24.8 mm inside the back face, 15.0 mm above the frame underside and 2.9 mm below the start of the top bevel band.
- The arm leaves the frame through the flat part of that side face only: y 0.5060 to 0.5247, 14.1 to 28.2 mm above resting height. That is 12.1 mm clear of the back plan-corner bevel and 3.7 mm clear of the top bevel band.
- The tip ring is inside the foot: at least 1.25 mm inside its wall and 1.04 mm below its top. The foot underside is 0.3 mm above the rug field.

### Why it is sound

1. **Same part, same defect class.** It closes a visible gap on a K1 member with the remedy root already released for the spring: seat the member in its parent.
2. **Support is untouched.** The tip's plan position is unchanged, so the foot stands where the v03 tip stood.
3. **No knock-on.** No triangle, class, edge-set or N1 effect. The base frame mesh is not cut; the crossing lies on a flat face, clear of the bevel bands, so the flat-panel normals are unaffected. The buried disc is oblique, so no faces are coplanar.
4. **Declared.** Both pairs are in `attachments` as `embedded`.

### Conditions [R]

1. **Scope.** Exactly two pairs: `kick.spur_arm.L` and `kick.spur_arm.R` into `kick.base`. Like I1, this is not a within-row overlap allowance.
2. **Criterion for Codex's attachment check** (separate from the support minimum-Z test): all eight root-ring vertices lie inside the `kick.base` solid, at least 1.0 mm inside the own-side face; and the arm's lengthwise edges cross the frame boundary only on the flat part of that side face, not through a bevel band, the top or the back.
3. **Say what `depthM` measures (text only).** `depthM: 0.006` is the inset of the root *centre*. The ring is buried 1.3 to 10.7 mm, so a penetration measurement will not return 6 mm. In the footboard entry (Q3) the same field means maximum depth. One field, two meanings.
4. **Report the height change (text only).** Section 3 mentions the 6 mm inset but not that the root rose from 18 to 22 mm and the tip from 12 to 14 mm. Both are in `SPUR`; the report should say so.
5. **Margins are thin by design.** The 1.0 to 1.3 mm margins are exact at source. Any later change to `SPUR` or `KICK` must re-check them.

**[X] Images and export.** Gate K1 is unchanged and still open: contact under both spur feet, and each arm reading as growing out of the frame with no wedge or disc at its root. The exported positions should confirm the root ring is still inside the frame after any quantisation.

## 4. Q2: the four proposed sharp sets

The four tallies reproduce the author's section 6 to its rounding: 0.0647, 3.5712, 6.9668 and 7.7385 m **[M]**. Three of the four sets do not contain quite what their reason says. That matters, because root's decision attaches to the reason.

### 4a. `ctl.cheeks.front_corner`: correct it

**What is in the set [M]:** 12 edges, 0.0647 m.

| Edges | Turn | Length | What they are |
|---|---|---|---|
| 2 | 51.3° | 37.7 mm | The cheek nose across each cheek's main band: where the top run meets the flat front |
| 2 | 44.1° | 4.7 mm | The same corner in the first bevel band |
| 4 | 75.5° | 10.2 mm | Bevel-band mitres at the two unbevelled 90° underside corners |
| 4 | 41.4° | 12.1 mm | The same mitres in the second bevel band |

Only the first four edges (42.4 mm) are the nose. The other eight (22.3 mm) sit at the cheek's underside and match the set only because its rule takes every `along` edge in the 40–80 band. The author is right that the nose is a genuine profile corner, not a mid-run break. My v03 note (N1 class-intent, "12 edges, 0.065 m") described it wrongly; I withdraw that description.

**[R] Bevel the nose with the shared `casing` class.** I agree with the author's remedy and would not leave it to a later pass:

- It is an exposed casing edge on the hero prop. Root's grant says its permissions "do not cover … exposed casing edges". Every other exposed cheek edge (outer perimeter, back-top corner) is already bevelled.
- The controller front faces the planning eye almost square-on (about 14° off at P00 by my arithmetic), so both noses are in plain view.
- Cost by my arithmetic: two more profile points per cheek, 68 → 84 triangles each, shell 1,260 → 1,292 of 2,500. The author's count governs.
- The bevel only removes material. The 0.095 height and 0.32 depth envelope, the keys and the key-to-cheek fit do not change.

Conditions on that edit:

1. One bounded helper edit, before Codex's single full selected-pose measurement if that has not run, so the measurement covers the final shell. Root and S own the sequencing.
2. State the round-run result. `rounds` is built from membership in `top_chain`, so bevelling the nose vertex drops the last 19 mm top segment from the run. The bevelled back-top corner already drops the 140 mm rear segment the same way; each cheek's run has three faces today **[S][M]**. Either outcome can be right; it must be intended and declared.
3. Afterwards no hard `along` edge in the 40–80 band remains at the nose, and the `proposed` set is removed.
4. The eight underside mitres move to `ctl.cheeks.contact`, with a reason that names them.

**If root declines the geometry now:** keep the set `proposed` and decide it under gate **N1a**, which is the cheek shading gate. The author names N1b, which covers the module and pedal-base rounded corners. It fails if either cheek front shows a hard line or a facet break across the nose.

### 4b. `cymbal.edge`: keep sharp, and name the whole band

**What is in the set [M]:** 72 edges, 3.571 m, turn 108.5°: the lower outer corner of the edge band, at radius 190 mm on all three cymbals.

**What is missing [S][M]:** the band's upper corner, 70.0°, another 72 edges and 3.496 m. It sits in `faceted_round.profiles`, whose reason calls the cymbal entries "bell-to-bow transitions". By the profile the bell-to-bow turn is 39.6°, under the split, so no bell-to-bow edge is hard. The only cymbal edges that set catches are these rim corners. The edge band is one 8.9 mm face with two hard corners, 7.07 m in all, and half of it is filed under a wrong reason.

**[R] Keep both corners sharp; no geometry.** Root may accept the band by name. The reasons are the ones root already used for thin plates:

- The band is 8.9 mm wide, under the 12 mm floor. A 3.125 mm two-segment bevel would use most of it.
- It is dark, matte rubber.
- It does not fit the row: 96 triangles per corner per cymbal against 138 of headroom (1,812 of 1,950).

**Required correction (declaration only):** move the 70° corner into the cymbal edge set, state both turns and the 8.9 mm band in the reason, and drop "cymbal bell-to-bow transitions" from the profiles reason. Otherwise root's decision covers half the band.

**[X]** The cymbals sit at 0.91 to 1.09 m against an eye at 1.345 m, so they are seen close to edge-on and this band is most of what identifies them. Gate E1b must look at it. It fails if a cymbal reads as a slab or the band shows a bright line.

### 4c. `pad.rim_lower`: two different edges; split them

**What is in the set [M]:** 192 edges, 6.967 m, two rings on each of the four pads.

| Ring | Turn | Length | Material | Where |
|---|---|---|---|---|
| Rim lower outer corner | 71.4° | 3.609 m | bright metal | bottom of the 8.9 mm rim wall, above a 6.3 mm step |
| Shell bottom corner | 52.8° | 3.358 m | black | 4 mm above the shell underside |

The reason names both, but they are different cases and the A1 rule is one set, one status, one reason.

**Rim lower outer corner [R]: keep sharp under an image gate; root may accept it by name.** The top outer corner, which catches the light, is already bevelled. The step under this corner faces about 72° below horizontal, so from an eye above every pad it is hidden or seen at grazing angle. The corner works as the lower end of the bright rim band against the black shell. The risk is real, because bright metal is the one material here where a hard edge can flash. So E1b must check it: it fails if the lower boundary of any rim shows a bright line, or the rim reads as a flat cut strip beside its bevelled top.

Root should know one thing before choosing the gate. **The obvious fallback does not fit.** A casing bevel costs 96 triangles per pad, 384 for four, against 288 of headroom (2,312 of 2,600) **[M]**. If the gate fails, the fix needs a ceiling decision or a different profile.

**Shell bottom corner [R]: a hidden-edge reason, not an exemption.** One of its two faces is the shell's bottom ring. That face points at least 63° below horizontal at every authored tilt (79.2° less the largest tilt, 16°), and the planning eye is above every pad (pads 0.44 to 0.85 m). The edge is where a visible black facet meets an unseen black underside. I recommend the author's `contact` status ("hidden or contact edges: a reason, not an exception"), reconsidered if any planned eye drops below the pad bottoms.

### 4d. `rug.binding_shoulder`: keep sharp

**What is in the set [M]:** 16 edges, 7.7385 m, at 8.2 mm above the floor: four straight runs at 62.3° (7.490 m) and twelve corner edges at 61.5° (0.249 m). The reason matches the content.

**[S]** The shoulder is already a one-facet chamfer, 5 mm in and 2.6 mm up. Its upper edge turns 27.7° and is smooth. The proposed set is only the remaining break at the foot of that facet.

**[R] Keep; no geometry.** Root may accept it by name. The binding is 10.5 mm tall, under the 12 mm floor; it is matte weave, already chamfered. I agree with the author.

**[X]** Gates RUG1 and E1b. It fails if the rug edge reads as a hard slab or a bright outline. If it does, the fix is cheap: one more ring, +32 triangles by my arithmetic (156 → 188 of 400).

## 5. Q3: footboard seated in the heel block

**Verdict: intentional seating is the right reading, and it is the right joint. No correction is needed.**

**Unchanged since v01: confirmed [S].** The footboard and heel-block expressions are identical in v01 (lines 540–542), v03 (765–767) and v04 (888–892).

**The joint [M]:**

- The footboard is 75 mm wide and 8 mm thick, and rises 12.27°. The heel block is 76 mm wide; its top is 26 mm above resting height.
- Six footboard vertices are below the block top, at depths of 4.0, 4.0, 3.25, 3.25, 1.45 and 1.45 mm. All six are inside the block's outline, 0.5 mm inside each side face.
- The board's underside leaves the block through its top face at y 0.1184, 1.6 mm before the block's toe-side face.
- The heel end stands 3.8 mm proud of the block top, with 38.3 mm of block top showing behind it.

So the buried part is a wedge wholly inside the block, entering and leaving through the top face. Half the board's thickness is seated and half shows.

**Why seating is right.** The board is inclined. Resting it on the block at zero depth would give a line contact with an open wedge under the board: the floating-heel look, and the same defect Q1 cures at the spur root. Seating the heel end 4 mm into the rubber reads as a board hinged at a heel plate, with no gap and nothing coplanar.

### Exact scoped criterion [R]

Accept the declared entry `kick.footboard_on_heel` as intended seating if, and only if:

1. It is this one pair: `kick.footboard` into `kick.heel`, in `drum_kick__tower`.
2. Every footboard vertex below the heel block's top plane lies inside the block's plan outline, and the board crosses the block's boundary only through its top face: never a side, the back or the toe-side face.
3. The greatest depth below the top plane is 4.0 mm (the declared `depthM: 0.004`) and no more than half the board's 8 mm thickness, so at least 3.8 mm of the heel end stays proud.
4. No footboard vertex is below the block's underside.

It is not a general same-row overlap allowance.

**Minimal correction (text only):** the entry's intent reads "INHERITED (v01, unchanged) … reported, not new". If root accepts the seating, it should become a positive statement of the seat with this criterion.

**One thing outside the three questions, not assessed.** The hi-hat pedal has a joint of the same kind and it is not in `attachments`: four footboard vertices lie on the axis of the 9 mm hinge barrel **[M]**. Whoever scopes the kick criterion should decide whether the hi-hat pair needs its own entry. I make no finding on it.

**[X] Images and export.** Gate K1 (nothing floats; the pedal reads as joined) and the thin-plates condition under E1b (a footboard must not read as a flat card). The 0.5 mm side margin is the smallest in this review; the exported positions should confirm it.

## 6. The fourteen image gates: all preserved, none passed

No gate is added, removed, renamed or passed. The three questions touch these existing gates:

| Gate | Touched by |
|---|---|
| N1a | Q2a cheek nose, if the bevel is not released; and after it, the nose highlight staying in the bevel band |
| K1 | Q1 spur roots and feet; Q3 footboard seat |
| RUG1 | Q2d binding shoulder |
| E1b | Q2b cymbal band, Q2c rim lower corner, Q2d shoulder, Q3 footboard |
| N1b, H1, T1 (throne), HH1, SP1, AZ1, RK1, E1a, F1, M6 | not touched; open as recorded |

## 7. Decisions for root

Root alone settles these. My recommendation is in brackets.

1. Confirm the spur-root embed as part of K1, for exactly the two declared pairs, with the section 3 criterion. [confirm]
2. Require two text corrections from the author: what `depthM` measures, and the spur height change. [require]
3. Cheek nose: release a casing bevel in one bounded helper edit, or hold it under gate N1a. [release the bevel]
4. Cheek underside mitres: move the eight edges to `ctl.cheeks.contact` with a reason that names them. [require]
5. Cymbal edge band: accept both corners sharp by name, and require the declaration fix that puts the 70° corner in the same set. [accept; require]
6. Pad rim lower outer corner: accept sharp by name under E1b, knowing the bevel fallback does not fit the ceiling. Pad shell bottom corner: hidden-edge reason. Split the set. [accept; require the split]
7. Rug binding shoulder: accept sharp by name under RUG1 and E1b. [accept]
8. Footboard seat: accept as declared seating under the section 5 criterion, with the reworded intent. [accept]
9. Decide whether the hi-hat footboard and hinge pair needs its own attachment entry. [no recommendation; outside my three questions]

## 8. Limits and session record

- I did not run Blender, a browser, a render, an export, a build or any image tool. No helper workers. No prior review was rerun and no pose was searched or compared.
- I wrote only this report and its evidence JSON. No source, declaration, builder, report or coordination file was changed.
- Git was read-only: `git show` for the frozen bytes, and `git rev-parse`, `git log`, `git status`, `git ls-tree` and `git diff` to pin and compare. No Git write of any kind.
- I did not read the held builder beyond its hash, Codex's producer, measurement or pose-comparison files, or the author's post-checkpoint report.
- My figures are a spot check on source vertices at P00. They are not Codex's measurement, not verifier evidence and not image evidence.
- Visibility statements (what the planning eye can see) are geometric arguments from face directions and heights, not ray or pixel results.
- The cheek-bevel and rug-ring triangle increments are my arithmetic, not built geometry.
