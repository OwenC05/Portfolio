# Studio apprentice: character design spec

15 November 2026. Claude design lane, package A, `task_eb9bf20f2b46`.

**Status.** Owen selected the eager apprentice personality. Everything else here is my proposal: shape, sizes, colours, poses and timing are not approved, and nobody independent has reviewed the renders. Values marked **T** are tunable. Items marked **P** depend on final placement.

**What I looked at.** I viewed [the reference](../reference/robot-inspiration.png) (a stock wireframe illustration: rounded head, dark face band, two ring eyes, ear caps, tapered body, two leaf fins, glowing ring below). I viewed the earlier [placement sheet](../claude/placement-zones.png); its phone frames use the staged 74-degree lens, not production's 64 degrees. Every render linked below came from the blockout in [blockout/](blockout/README.md), and I viewed each one I cite.

![Five poses](blockout/renders/state-sheet-five-poses.png)

Left to right: idle, attention, sources (4 real hits), no match, dismissal. Primitive blockout, stand-in backdrop, not the Studio room.

## 1. Character in one paragraph

A junior archivist that carries a card tray. It keeps the reference's four features (ring eyes on a dark visor, a head that floats apart from the body, two small fins, a ring underneath) and drops the wireframe. The ring becomes its tray; whatever the search really returned stands on it as index cards. It is warm: it perks up when addressed, smiles when it greets you and when you leave, and hands things over keenly. It never signals that a passage is right. Its pleasure is about the visitor and the errand, and it is the same for one card or four.

## 2. Silhouette and proportions

Three light masses on a dark-ish wall, stacked: wide head, shield body, tray. The head is the widest and tallest mass, which is what makes it read as young and keen.

| Measure | Value (m) | Note |
| --- | --- | --- |
| Overall, neutral | 0.264 W x 0.231 D x 0.425 H | Measured from the blockout |
| Largest pose envelope | 0.342 W x 0.234 D x 0.462 H | No match (fin out), sources (tray tilted) |
| Clearance volume to reserve | 0.40 W x 0.28 D x 0.50 H | **T**, **P**. Centre it 0.03 below the hover root |
| Head | 0.21 W x 0.16 D x 0.16 H | 49% of body-plus-head height |
| Head/body gap | 0.036 | Must stay open in every pose |
| Body | 0.15 W x 0.12 D x 0.15 H | Round shoulder, tapers to a soft point |
| Fin | 0.090 long x 0.038 wide x 0.013 thick | Floats 0.008 off the body |
| Tray | 0.236 outer, 0.172 inner, 0.008 thick | Centre 0.215 below the hover root |
| Eye ring | 0.046 outer, 0.026 inner, 0.084 apart | 22% of head width; larger than the reference |

Scale in the Studio is 2 scene units per metre, applied once by a placement wrapper outside this asset.

**Expected size on screen (computed, P).** I assumed an anchor of about `[2.1, 3.05, -0.6]` scene units, which is 2.44 m from the fixed eye. I derived that from the pilot speaker position at `components/studio/scene/build-studio.ts:374` in the read-only Studio checkout, not from the M3 room, so treat it as an estimate. On axis, the robot is about 140 px tall at 1440x900 with the 58-degree lens and about 118 px tall at 390x844 with production's 64-degree lens. At phone size that gives eye rings about 13 px across, a head/body gap of about 10 px and cards about 8 px wide.

Scale proxies at those exact lenses and distance, robot alone, cropped at native resolution (no room, no UI):

| | Idle | Attention | Sources | No match |
| --- | --- | --- | --- | --- |
| Desktop 58 degrees | ![](blockout/renders/proxy-desktop-1440x900-fov58-idle-crop240.png) | ![](blockout/renders/proxy-desktop-1440x900-fov58-attention-crop240.png) | ![](blockout/renders/proxy-desktop-1440x900-fov58-sources-crop240.png) | ![](blockout/renders/proxy-desktop-1440x900-fov58-no-match-crop240.png) |
| Phone 64 degrees | ![](blockout/renders/proxy-phone-390x844-fov64-idle-crop240.png) | ![](blockout/renders/proxy-phone-390x844-fov64-attention-crop240.png) | ![](blockout/renders/proxy-phone-390x844-fov64-sources-crop240.png) | ![](blockout/renders/proxy-phone-390x844-fov64-no-match-crop240.png) |

What I can and cannot read in the phone crops I viewed (idle and sources): the eyes, the gap, the tray and a count of four cards read. The larger first card does not read as larger. The fin pointing at the tray is faint. So at phone size, count and pose carry the meaning; rank order has to come from the HTML list.

## 3. Face and eyes

The face must change shape without morph targets, skins, transparency or texture swaps, because the existing asset profile rejects the first three. So the face is built from rigid parts that only rotate.

- **Visor.** A dark inset band on the front of the head: a rounded rectangle 0.168 wide and 0.099 tall, wrapped on the head surface.
- **Eyes.** Two emissive rings that sit 2.4 mm proud of the visor. They never change shape themselves.
- **Lids.** Two visor-coloured plates, one above the eyes and one below, 5 mm proud. They are invisible against the visor until they slide over a ring.
  - Upper lid down 11.5 degrees: the top 28% of each ring is covered. This is the idle "flattened top" look: settled, watching the desk.
  - Lower lid up 15 degrees: the bottom half is covered, leaving two arches. This is the smile.
- **Gaze.** One pivot at the head centre (`APR_eyes`) carries both rings and both lids. Yaw up to 9 degrees and pitch up to 7 degrees slides the whole set across the visor. **T**
- **Why the head is this shape.** Depth equals height (0.16). That makes the head a surface of revolution about the ear axis, so the lids stay exactly on the surface as they rotate. My first build used a flatter head and the lids cut into the eyes; the fixed render is what you see above. Keep this constraint if the head is restyled.
- **Lid edge.** The upper lid's lower edge rises slightly toward the nose. Seen from below, a straight edge read as a frown.

Open risk: at phone size the idle half-lid can still read a little stern. If Owen sees it that way, reduce idle lid to 6 degrees or drop it and let the head turn alone carry idle. **T**

## 4. Parts, parents and origins

Metres, Blender Z up, character faces -Y. L and R are the character's own sides: L is +X, the viewer's right. Positions are relative to the parent. Names match the blockout file exactly.

| Part | Parent | Origin (x, y, z) | Moves | Notes |
| --- | --- | --- | --- | --- |
| `APR_root` | placement wrapper | hover root, centre of the gap | z lift up to 0.012 | The only node the world wrapper scales and places |
| `APR_head` | `APR_root` | 0, 0, +0.018 (head base) | pitch, roll, yaw | Base pivot makes a roll read as a cocked head |
| `APR_visor` | `APR_head` | head centre 0, 0, +0.08 | none | Can be merged into the head |
| `APR_ear_L`, `APR_ear_R` | `APR_head` | head centre | none | Accent discs, 0.052 across. Can be merged |
| `APR_eyes` | `APR_head` | head centre | pitch, yaw (gaze) | Empty pivot |
| `APR_eye_L`, `APR_eye_R` | `APR_eyes` | +/-0.0433, -0.0755, 0 | none | Emissive rings |
| `APR_lid_upper`, `APR_lid_lower` | `APR_eyes` | head centre | rotate about X only | |
| `APR_body` | `APR_root` | 0, 0, -0.018 (body top) | yaw, small pitch | Hangs from the gap, follows the head late |
| `APR_badge` | `APR_body` | 0, -0.0594, -0.039 | none | Accent dot that shows which way the body faces. Can be merged |
| `APR_fin_L`, `APR_fin_R` | `APR_body` | +/-0.102, 0, -0.028 (hinge at fin top) | forward swing, outward splay | |
| `APR_tray` | `APR_root` | 0, 0, -0.215 (centre) | tilt about X, small z and y | Child of the root so body sway does not swing it |
| `APR_tray_glow` | `APR_tray` | centre | none | Emissive strip; brightness has two levels |
| `APR_card_1` to `_4` | `APR_tray` | on the band at -56, -18, +18, +56 degrees from front | scale in and out | **Stand-ins.** In the product these are generated at runtime from real hits, not baked |

Minimum moving set for the asset: root, head, eyes pivot, two lids, body, two fins, tray. Nine transform nodes. Everything else is static.

## 5. Materials and palette

The room is warm and dim; earlier review found that light shapes read, dark shapes merge and blue accents go grey. So the body is light, and blue is used only where it is self-lit or decorative.

| Material | Hex | Finish | Used on |
| --- | --- | --- | --- |
| `MAT_APR_shell` | `#EFE7D6` | Matte, roughness 0.5 | Head, body, fins |
| `MAT_APR_ink` | `#151B26` | Satin, roughness 0.3 | Visor, lids, tray band |
| `MAT_APR_accent` | `#2F66D0` | Matte, roughness 0.45 | Ear discs, chest dot |
| `MAT_APR_eye_emit` | `#7FE3FF` emissive | Strength 3 in Blender | Eye rings |
| `MAT_APR_tray_glow` | `#7FE3FF` emissive | Dim 0.5, lit 2.5 | Tray strip |
| `MAT_APR_card_emit` | `#FFF3D6`, faint warm emission | Matte | Source cards |

All **T**. Five opaque materials, no textures, no transparency. Emissive strengths are Blender values and will need re-tuning in three.js under the room's final lighting. No state is carried by colour alone: every state also differs in pose, lid or card count.

The cards are cream, not cyan, on purpose: cyan is the robot, cream is paper from the archive.

## 6. Five poses

Angles in degrees. Head: pitch + nods down, roll + tips the crown to the character's left, yaw - turns to the viewer's left. Fin: forward swing, outward splay. All **T**.

| | Idle | Attention | Sources | No match | Dismissal |
| --- | --- | --- | --- | --- | --- |
| Render | [idle](blockout/renders/pose-idle.png) | [attention](blockout/renders/pose-attention.png) | [4 hits](blockout/renders/pose-sources.png), [1 hit](blockout/renders/pose-sources-1.png) | [no match](blockout/renders/pose-no-match.png) | [dismissal](blockout/renders/pose-dismissal.png) |
| Meaning | Minding the desk | "Yes? I'm listening" | "Here is what I fetched" | "Nothing on the tray. Owen is that way" | "Bye!" then back to the desk |
| Root lift | 0 | +0.008 | +0.006 | 0 | 0 |
| Head | 2, 0, -22 **P** | -3, 10, 0 | 5, 4, 0 | 0, -8, 0 | 10, 0, 0 |
| Gaze | 3 down, 6 to viewer left **P** | centred | centred | centred | centred |
| Lids | upper 11.5 | open | open | open, rings stay round | lower 15 (smile) |
| Body yaw | -8 | 0 | 0 | 0 | 0 |
| Fin L | 0, 6 | 0, 22 | 0, 30 | 10, 70 **P** | 0, 12 |
| Fin R | 0, 6 | 0, 22 | 25, -12 (toward the tray) | 0, 20 | 0, 12 |
| Tray tilt | 14 | 16 | 26, moved 0.02 toward viewer | 26, same | 14 |
| Tray glow | dim | lit | lit | lit | dim |
| Cards | none | none | one per real hit | none | none |

Passing beats, not held states:

- **Greeting** (inside attention): lower lid 15 and fins 26 for about 300 ms, then the settled attention pose.
- **Glance** (inside sources and no match): head 14 down and gaze 7 down at the tray, then back to the visitor. [Render](blockout/renders/pose-sources-glance.png).
- **Shrug** (inside no match): both fins out to 40 once before the L fin points.

Placement dependencies: idle head yaw and gaze point at Owen's screens, which are to the viewer's left of zone A. The no-match fin points toward wherever the panel's contact link sits. Both flip if placement or panel side changes. The tray rests at 14 degrees because at the assumed anchor the eye is about level with the robot, and a flat ring would be seen edge-on.

## 7. Timing and easing

Runtime timings in milliseconds. All **T**. Search itself takes about 9 ms, so nothing here waits on or dramatises the search; each gesture starts when the real event arrives.

| Transition | Trigger | Beats | Total |
| --- | --- | --- | --- |
| Idle to attention | Hover or focus on the robot or the Ask button; panel opens | Head and eyes 330; body follows 90 late over 380; greeting smile holds 300, releases 200 | about 830, readable at 330 |
| Attention to sources | `retrieval` with 1 to 4 hits | Glance down 200; cards rise 200 each, 67 apart, rank 1 first, starting 100 in; look back up 270 | about 530 for 4 cards |
| Attention to no match | `retrieval` with 0 hits | Glance down 200; hold 70; look up with head tilt 270; shrug 200; point 400 | about 1070 |
| Any to dismissal to idle | Panel closes | Cards drop together 130; nod and smile 270; hold 200; return to idle 400 | about 870 |
| Stopped | Cancel, timeout, error, 429 | Cards drop together 130; tray dims; pose returns to attention 250 | 250 |
| Card selected | Selection changes in the panel or on the tray | That card lifts 0.006 and grows to 1.15 over 120 | 120 |

Easing: arrivals use ease-out `cubic-bezier(0.22, 1, 0.36, 1)`. Returns to idle use ease-in-out `cubic-bezier(0.65, 0, 0.35, 1)`. Fins on the greeting may overshoot by up to 10%. Nothing loops. Nothing bobs: idle is completely still, because the Studio renders only when something changes.

The blockout file holds a 30 fps keyed version of these beats on `APR_master` (frames 0 to 230, named markers). It is a blocking reference. I recommend the runtime blends between named pose targets rather than playing baked clips, because interruption needs blending from wherever the parts are; that choice belongs to reconciliation step D.

## 8. Interruption

A new state always wins over an older gesture. Priority, highest first:

1. **Dismissal or unmount.** Cards are removed at once.
2. **Stopped** (cancel, timeout, error, superseded request).
3. **Result** (sources or no match) for the current request only.
4. **Attention.**
5. **Idle.**

Rules:

- **Tray truth is instant.** Cards for an old result are removed in the same frame the state changes. Only the pose blends.
- **Blend, do not restart.** A new target is reached from the current part positions over 160 to 200 ms. No gesture replays from its beginning.
- **Passing beats are skippable.** If a result arrives during the greeting, skip the rest of the greeting. If a second result arrives during a glance, skip the glance and go to the settled pose.
- **Hover does not interrupt a result.** While the panel is open, hover and focus changes do not change the pose.
- **Stale results never show.** A late `retrieval` for a superseded request changes nothing.

## 9. Reduced motion

With reduced motion on, the robot swaps between stills in one frame. The preference can change while the page is open, and the next state change must respect it.

| State | Still |
| --- | --- |
| Idle | Idle pose |
| Attention | Settled attention pose, no smile beat, no lift |
| Sources | Settled sources pose with all real cards already standing |
| No match | Settled no-match pose with the L fin already pointing; no glance, no shrug |
| Stopped | Attention pose, empty dim tray |
| Dismissal | Straight to the idle pose; no nod |
| Card selected | Card at 1.15 scale without the lift tween |

## 10. Warmth without overclaiming

- Allowed and wanted: the perk-up, the greeting smile, the eager hand-over, the goodbye smile, the helpful point toward Owen.
- The hand-over looks the same for one hit as for four. Nothing scales with hit count or score.
- No smile, nod or tick is tied to a result arriving. The smile belongs to hello and goodbye.
- No thinking act: no upward look, spinning tray or pulsing eyes.
- The tray never shows more or fewer cards than real hits, and never shows cards before a real search.
- Rank 1 is slightly larger and stands first on the viewer's left. Card size encodes rank order only, in two steps, not the score. I recommend this over sizing by score, because a score-sized mark reads as a confidence meter. This is for step D to confirm.
- No voice, name or speech bubble is assumed.

## 11. Gaps and what each one waits on

| Gap | Waits on |
| --- | --- |
| Appearance is not approved | Owen's review of the blockout renders |
| No independent visual review | A Claude reviewer who is not the author (plan step H2) |
| Robot has not been seen in the room | Pinned room revision and camera, then a composition proof (plan step E). My size figures use an estimated anchor |
| Zone A is a proposal | Owen; and what the M4 drums and controller put behind it |
| Idle and no-match directions | Final placement and which side the panel opens on |
| Whether cards, eyes and lids are baked or generated at runtime | Step D with Codex. My proposal: cards at runtime, eyes and lids in the asset |
| Colours under real room light; emissive strength in three.js | M6 lighting; a browser test |
| Triangle, byte and draw budgets | Codex measurement. The blockout is 13,132 triangles at unoptimised density and is not a budget claim |
| Lids are single-sided sheets in the blockout | Cleanup: give them thickness or mark the material double-sided |
| Phone legibility of rank and fin pointing | Accept as secondary, or enlarge after the room proof |
