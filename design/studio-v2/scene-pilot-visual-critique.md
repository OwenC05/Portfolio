# Right-limit pilot v03 — independent visual critique (Claude)

15 November 2026. Task `task_3486b45c55ed`, dispatch `ctx_dd5df6fc7f1b`, actual Claude, no helpers or overrides. Reviewer is distinct from the pilot artist (`task_a8910075c00f`). Report only: no asset, source, config or other report was edited; no render, browser, server, build or paid tool was run.

**Verdict: APPROVE FOR BOUNDED RUNTIME COMPARISON.**

This means the door and lamp are worth loading into the real renderer and capturing beside the prototype. It is not runtime acceptance, not a claim that the right limit is fixed, and not product approval. Blender stills cannot establish how the assets look in Three.js; the two baseline blockers stay open until root's runtime captures are reviewed.

## Images inspected

All opened at native size. SHA256 computed by me; all six v03 hashes equal the values in `pilot-report.md`.

| Image | Size | SHA256 |
| --- | --- | --- |
| `renders/v03-right-up.png` | 1440×900 | `acbbb1b18dd9e641308b4462cf8ee17a707258e657ef4ed62dca2c61cf480494` |
| `renders/v03-right-down.png` | 1440×900 | `724aad5c4a1905b6ed2a56c4e14dc401592d73a35751797c31b732a94612873b` |
| `renders/v03-music.png` | 1440×900 | `714c0259bff2a2304180e3aa2ea9a3fbe80e299cdaf525d1423cbcaf31cad61b` |
| `renders/v03-iso-door.png` | 600×800 | `b74b81e6f15647fcb1bf29447512d228e184f135b8cbd4e867e4ec8e897356c4` |
| `renders/v03-iso-door-detail.png` | 600×800 | `534bf453d729cfa45980e9d95d3ca549b8436efcd30a413274e8e383d5b7c1e8` |
| `renders/v03-iso-lamp.png` | 600×800 | `aa239fef01bed0bac6374da987dcc547ebb20d593fb87f40ffb48ba85dc1ed2d` |

Baseline, re-opened or re-measured from `.omx/artifacts/visual-ralph/portfolio-immersive-v2/early/`: `right-up-1440.png` (re-opened), `right-down-1440.png` and `right-1440.png` (opened in my prior review, re-measured now).

Not opened: any `v02-*`, `early01-*` or `v03probe-*` still. `v03-iso-lamp-shade.png` does not exist; the superseded v02 close-up was not used.

Other hashes I computed, matching the author's report: GLB `2b9a4182…c4063e` (585,536 bytes), v03 blend `0fb02682…86410b`, `build_pilot.py` `22bb0abc…30d1dc`, three textures. I did not open or parse the GLB or the blend.

## Binding limits

1. **The stills show the Blender scene, not the exported GLB.** Nothing I saw proves the GLB contains what was rendered. That is for Codex's validation and the runtime load.
2. **The script that rendered the stills is not on disk.** The report says they came from `build_pilot.py` at `95a72bbb…`; the file now hashes `22bb0abc…`. I cannot confirm the two differ only by a `norender` flag.
3. **Timestamps show a gap inside the v03 stills.** `right-up` and `right-down` were written at 23:30 and 23:32; the other four at 23:58–23:59. The report describes one render run killed after six stills. A 25-minute stall under memory pressure would explain it, but I cannot tell from the files whether all six came from the same script state. Worth a one-line confirmation from the author.

## Measurements

Luminance 0–255 from the PNGs. Crops are approximate and the framings differ slightly, so treat these as magnitudes.

| Region | Baseline | v03 (Blender) |
| --- | --- | --- |
| Door, `right-up` | mean 5.7; 84% below 10 | mean 33; 1.8% below 10 |
| Door, `right-down` | mean 5.1; 86% below 10 | mean 33; 2.3% below 10 |
| Right ceiling, `right-up` | mean 7.3; 78% below 10 | mean 28; 12% below 10 |
| Whole frame below 10, `right-up` | 23% | 4.4% |
| Shade, all channels ≥250 | 21% | 0% in all three room views and in the isolated view |
| Shade range, room views | 163–255 (5th–95th percentile) | about 130–227 |
| Wall between window and door | not separately measured | mean 24–25; up to 10% below 10 in `right-down` |
| Wall below sill | not separately measured | mean 24–25 |

The plan's own pass figure for the door is the left wall's range, about 25. The Blender stills exceed it, but under path-traced bounce and stand-in lights that the runtime does not have.

## Findings, ranked

### What works

1. **Door: the black slabs are gone.** `v03-right-up` and `v03-right-down` show a frame-and-panel door: stiles, lock rail, two raised fields with a moulding strip, an architrave with a head cap, a brass knob on a rose and a keyhole plate. It reads as a door at normal size without brightening. The isolated views confirm real geometry with soft bevels and no shading faults, stretched corners or visible faceting.
2. **Lamp: the clipped patch is gone and the shade has form.** A tapered shade with a trim band at each rim, one vertical seam, a finial, a visible bulb neck, a thin pole and a weighted base that sits on the floor with a contact shadow. In the room views the shade is brighter at the lower centre and darker toward the top, with no pixel at the clip threshold.
3. **Geometry quality is adequate for the fixed eye.** 5,528 triangles for both objects; silhouettes are round where they should be at the sizes the camera sees.

### Risks to check in the runtime comparison (none blocks loading it)

4. **Door tonal range is narrow.** The door sits between luminance 20 and 41 in `right-up`. Mouldings read mainly as thin edge lines that path-traced soft shadow provides. Under one directional light that does not reach this wall, plus non-shadowing point lights, the panels may flatten into a single brown plane. This is the most likely way the pilot fails in the runtime.
5. **Timber colour does not obviously match the room.** Isolated, the door is a pale pinkish beech and the architrave a flat grey-brown with no grain, which reads as paint rather than dark oak. The prototype's window frame and beams are a saturated red-brown. In the dim room stills the door looks acceptably warm, but a door, window frame and beams in three different timbers would look unplanned. Judge side by side in the runtime; adjust the shared material if needed, not the mesh.
6. **Shade gradient is mild and lighting-dependent.** In the room it is a soft peach with modest core-to-rim change; in `v03-iso-lamp` under neutral fill it is near-white (mean 216) with almost no gradient. The author flagged this and I agree. Emissive strength 2.2 was tuned under AgX; ACES at exposure 1.2 may push it back toward clipping. The plan's threshold (under 2% of the crop at all channels ≥250) is the right test and can only be measured in the runtime.
7. **Right wall and ceiling readability is not a property of the assets.** They read in the stills because of bounce light, stand-in fixtures and an empty shell. The GLB carries no lights. Baseline blocker 1 is therefore untouched by this pilot and needs the runtime fill the author already lists as open. The ceiling beam side faces are still black in `right-up` even in Blender.
8. **Metals.** Brass and brushed metal are fully metallic. The knob reads as brass in Blender; without an environment map in the runtime it may go dark. The pole is two to three pixels wide at 1440 and may alias.
9. **Seam reads as a drawn box rather than a fabric join.** With the upper trim line it forms a rectangle on the shade. Visible only on close inspection; polish.
10. **Small omissions.** No hinges or threshold; the keyhole is a plain disc; grain is faint. All fine at this camera distance.

### Cannot be judged from this evidence

- **Shade close-up.** No v03 close-up exists, so linen weave, trim construction and the seam at close range are unresolved. Because the eye is fixed and never gets nearer than the room views, this does not block a runtime comparison. It stays a real gap for any isolated-asset sign-off.
- **Composition with the room.** The shell is bare, the window is a flat blue card, and nothing stands in front of the door or lamp. `v03-music` shows the lamp but none of the keyboard, kit or rug, so it says nothing about the music view.
- **Any other width or pose.** Only three 1440×900 poses were rendered.

## Position on the author's two noted weaknesses

- **Dim wall between window and door:** not blocking. At mean 24–25 it already sits at the baseline left wall's level in Blender, and in any case it is a lighting question for the runtime, not an asset defect.
- **Shade near-white under neutral fill:** not blocking. The room never has neutral fill. It becomes blocking only if the runtime capture clips.

## What the bounded runtime comparison should establish

For root and S; I am not requesting edits from anyone now.

1. GLB loaded in the real renderer with the procedural prototype left intact; captures at `right-up`, `right-down` and the music view, 1440×900, beside the matching `early/` captures.
2. Door mean luminance against the plan's target, and whether panels and mouldings still read without brightening (finding 4).
3. Shade clipping fraction against the 2% threshold (finding 6).
4. Door timber beside the window frame and beams (finding 5); knob and pole legibility (finding 8).
5. Whether right wall and ceiling are readable once a fill is designed (finding 7). Without that, baseline blocker 1 remains regardless of the assets.

A failure on 2 or 3 should return to the author through S as a material or light adjustment. I see no reason to remodel either object.

## Status of baseline blockers after this pilot

| Baseline blocker | After v03 |
| --- | --- |
| Right limit near-black | Open; needs runtime lighting |
| Door panels black | Asset direction approved; runtime proof pending |
| Lamp shade clipped | Asset direction approved; runtime proof pending |
| Wall triangles featureless | Not in pilot scope; open |
| 320 framing, missing captures | Not in pilot scope; open |
