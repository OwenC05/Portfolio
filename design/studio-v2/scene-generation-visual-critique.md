# Generated look frame and raw mouse mesh — independent visual critique (Claude)

15 November 2026. Task `task_eb74d812c258`, dispatch `ctx_6e1169fc72ac`. Reviewer is distinct from the generation author (`task_a76f963ea118`). Read-only: no generation, upload, render, model edit or tool call to either service. My earlier approval of the v03 pilot for bounded runtime comparison is separate and unchanged.

## Verdicts

| Output | Verdict |
| --- | --- |
| Higgsfield look frame | **Useful as a material and light reference, with one correction: do not copy its overall colour cast.** Not a layout, camera or style-finish reference. |
| Meshy mouse base mesh | **Recommend hand-modelling in Blender; keep the raw mesh as a proportion reference only.** Root decides. |

Neither verdict is runtime evidence. I make no claim that the raw mesh is web-ready or that cleanup has been tested.

## Files inspected

SHA256 computed by me; all three match `generation-execution-receipts.json`.

| File | Detail | SHA256 |
| --- | --- | --- |
| `pilot-right-limit/look-frames/frame-c-right-limit.png` | 1920×1200 RGB, opened at full size | `cb203101bf61dd3e99deb5b8f149b789f694b3c706fbf56671b110aeebd4997b` |
| `pilot-right-limit/meshy-raw/mouse-base-preview.png` | 512×512 RGBA, opened at full size and enlarged on grey | `fac5af23bbe50f9a94bb1e9d331d163a19d9ff17193b1a3802c32c31c1928dc3` |
| `pilot-right-limit/meshy-raw/mouse-base.glb` | Hashed only; **not opened or parsed** | `6a92281bfb768af3fc40e0e6555bd047919da3da2ad9b2554e59033ed2e3ca5b` |

Read: `generation-execution-report.md` (`51577b4d…928dc3`) and the receipts file. Comparison material is from my two earlier reviews: the six v03 stills and `early/right-up-1440.png`, not re-reviewed here.

## Look frame

### Three-way comparison

Luminance 0–255, approximate crops. The three images use different renderers, lights and framings, so only the relationships between regions are meaningful.

| | Prototype `right-up` | v03 Blender | Look frame |
| --- | --- | --- | --- |
| Door | mean 5.7, black panels | mean 33, range 20–41 | mean 96, range 59–129 |
| Door relative to nearby wall | far darker | slightly brighter (33 vs 25) | about equal (96 vs 92–110) |
| Shade clipped (all channels ≥250) | 21% | 0% | 0% |
| Shade range | 163–255 | 130–227 | 93–205 |
| Darkest wall | below 10 over most of the right side | 24–25 | 58 (far left wall); nothing in frame below 20 beyond 0.9% |

### What it is good for

1. **Moulding contrast on the door.** Each panel has a lit edge and a shadowed edge, so the raised fields read as depth, not as lines. This is exactly what v03 lacks: its door spans only 20–41. Target for the runtime: panel edges should produce a visible light-and-dark pair at normal size.
2. **Two-tone timber.** A honey leaf inside a clearly darker architrave, with the window frame, skirting and beams in the same dark timber. This answers the colour-coherence risk I raised on v03 (pale pink leaf, grey-brown architrave without grain, red-brown prototype window frame): one dark timber for all trim, one lighter timber for the door leaf.
3. **Shade construction.** Dark trim bands at both rims that frame the glow, a visible weave, a brighter core falling toward the rims, and no clipped pixels. The enlarged crop shows a **distinct vertical seam** right of centre; the author reported not finding one. v03's shade is paler and flatter, with trims close to the body colour. Darker trims and weave contrast in the emissive texture are the transferable changes.
4. **Wall light pooling.** A soft lobe above and below the shade with a gradual falloff, and warm light on the lower faces of the beams. Useful as the target shape for a baked or faked pool on the right wall.
5. **Door brightness target.** The door is as bright as the wall beside it. That is a usable rule for the runtime fill: door roughly equal to adjacent wall.

### Limits and corrections

1. **Overall colour cast is wrong for this room.** The whole frame is graded amber: mean colour is about (108, 67, 32), and the walls near the lamp measure about (162, 102, 37). The plaster reads brown-ochre, not olive. The author's report passes "olive plaster"; by eye and by measurement I disagree. The prototype's olive walls and warm/cool split are things my baseline review said to keep. Take relative brightness and form from this frame, not hue.
2. **The door is lit by nothing in the picture.** The lamp stands to its left on another wall, yet the door is evenly front-lit. The frame therefore confirms that a dedicated fill is needed at the door end; lamp light alone will not produce this.
3. **Finish is more photographic than the target.** Cathedral grain on the panels, heavy grain on the beams, mottled plaster and a glossy floor reflection go beyond the matte stylised look and beyond what the shared material library should carry. Use grain direction and tonal steps, not grain density.
4. **Layout and camera differ.** Level view, lamp between window and door, door around a corner, wide low ceiling band. None of this is geometry guidance.
5. **Saturation of the door.** At about (165, 88, 23) the leaf is strongly orange. Beside the ivory, sage and pastel palette of the desk it would be loud. Aim lower in saturation.

## Mouse base mesh

### What the preview shows

One three-quarter side view, grey, untextured. I cannot see the top, front, underside, buttons or centre wheel.

- A low, arched body with a believable overall profile.
- **Asymmetric, sculpted side** with a waist, in the manner of a right-handed office mouse. The room needs a simple ivory mouse beside a custom keyboard.
- **Irregular flat facets and creases across the side surface**, visible as patchy shading. This reads as mesh noise, not design.
- **A large notched disc on the side**, about a quarter of the body height, reading as a dial. It is the most prominent feature in the view.
- **A cable** leaving the front.
- A seam line running over the back and down to the disc.

### Recommendation: hand-model

Based on the preview plus the author's documented static read (2,839 triangles in eight separate pieces; 326 boundary edges and 4 non-manifold edges; no normals, UVs or materials; normalised scale; oversized centre wheel). I did not verify those geometry figures.

- The wanted object is a small symmetric pebble with two button splits and a wheel: a few hundred triangles and a short job in Blender.
- The listed cleanup is longer than that job: delete cable and disc, rebuild the wheel, close and weld open shells, fix the faceted side, restore symmetry, recalculate normals, unwrap, rescale and reduce to under 1,500 triangles. Whether deleting the disc leaves a hole or recess in the shell is unknown.
- The asymmetric sculpt is a design mismatch, not a defect that cleanup removes.
- At the fixed eye the mouse is roughly 60 px wide at 1440. Fine surface detail from a generated mesh would not be seen.

The mesh is still worth keeping as a reference for the side profile and proportions (the author measures 10 : 6.0 : 3.3 against a target of 10 : 6 : 3.5).

This also bears on the plan's remaining Meshy candidates: simple hard-surface props are likely better hand-modelled; the organic ones (plant, headphones, bindings) are where a base mesh may still pay. That is an inference from one result, not a tested finding.

## Limits of this review

- One generated frame and one preview view. No top, front or underside view of the mouse.
- The GLB was hashed, not opened. Geometry statements are the author's, quoted.
- Still images only; nothing here is Three.js evidence.
- I did not verify charges, balances or job records beyond reading the receipts.

## Recommended bounded next step

No further spend is needed for either item.

1. Carry three look-frame lessons into the shared material library when root runs the bounded runtime comparison of v03: darker shade trims with weave contrast; one dark trim timber plus a lighter, less saturated door leaf; a door-end fill set so the door matches the adjacent wall. Keep the olive plaster and the cool counterpoint.
2. Hand-model the mouse in Blender from the raw mesh's profile, and judge it with one isolated grey still before it goes near the runtime.
3. Leave `mouse-base.glb` untouched as the record of the paid result.
