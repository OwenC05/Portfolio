# Studio v2 full kit — M2 workstation author report

15 November 2026. Claude (actual), task `task_faeb10e3a287`, dispatch `ctx_b719fd151cfc`. Profile `studio-full-kit-v1`, variant `proposal`, stage `M2`.

Requested `claude-opus-5-5` at `high`. Observed: process argv `--model claude-opus-5-5 --effort high`; `CLAUDE_CODE_EFFORT_LEVEL` absent at process, user and machine scope. Server-side routing is not observable from here.

This is the author's account, not a look verdict. I do not approve my own work. The stage stops at the artifact and capture handoff; root's runtime capture and an independent Claude critique come next.

## Candidate (hold through root capture)

All paths are under `design/studio-v2/asset-pipeline/full-kit/`.

| File | sha256 |
| --- | --- |
| `exports/studio-full-kit-m2-proposal-v02.glb` (1,228,272 B) | `2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411` |
| `manifests/studio-full-kit-m2-proposal-v02.manifest.json` (from `technical/export-manifest.mjs … proposal M2`) | `a3bd983a582d58875ed024e6815fa891f511b51e72b4d3b835c50692a9a48c51` |
| `manifests/studio-full-kit-m2-proposal-v02.validator-report.json` | `66daefe5e76da1a55ed12bcaf4e955235d475848537ba5a74b46b4a1ba9d2587` |
| `manifests/studio-full-kit-m2-proposal-v02.author-measurements.json` | `0269fd341008d7cfbfb19c639ca67bc5e98907a9d035f6e59c97f6e712ae52bd` |
| `source/fk-20-workstation-proposal-v02.blend` (editable) | `c6addde2b76b06929caa5068c084c9528c530d8a51f99a91cdce08cf84c3c7d9` |
| `source/build_fullkit_m2.py` | `63b10ad1d4099933b56066a381ec5fb57eb3b5ef9335ecbad8bc4e33a6da1743` |
| `renders/m2-proposal-v02_home-1440_half.png` | see below |

Validator: `valid: true`, no errors, against `validate-full-kit.mjs` `66ee9d34…`, `profile-core.mjs` `02b65fed…`, profile `7d2892ae…`, inventory `eddc33b5…`. Those were the hashes on disk when I ran it. Codex's FKT-1 repair is changing these files in parallel, so the candidate needs revalidating against the repaired validator.

### Preserved, not used

- `source/fk-20-workstation-proposal-v01.blend` `19a36e903d21ca76c9b7b20c6ba2d8456d3bd73be962e5b69aa969241717e002`. The blend was saved, then my export step crashed: it read the cable list after deleting those objects. There is no v01 GLB. v02 only reorders that code; the geometry is the same.
- Every M1 file is unchanged. `build_fullkit.py` `1a66c8be…`, M1 blends, GLBs and manifests match the M1 author report. The M2 script asserts the M1 script hash before importing it.
- `components/studio/scene/build-full-studio.ts` is unchanged at `5a4e8296…`, so the hash delta is none. The pendant stays at its M1 position, so no light move is needed.

## How it is built

`build_fullkit_m2.py` runs the unchanged M1 script with variant `proposal` and no save or export flags. That rebuilds the library, architecture, pilot door and lamp, the seven binding planes and all M1 proxies. The M2 script then deletes only the 11 grey proxies whose asset belongs to M2, and authors those assets as native meshes.

- **Editable state, saved first.** Bevel modifiers stay live. They are weight-limited to chosen edges and use hardened normals. Cables are live Bezier curves with a bevelled round profile.
- **Export state, made in memory after the save.** Modifiers and curves are baked. `mon_side` keeps one mesh shared by two nodes. The eight monitor cables, the grommet, the neck clips and the pole ties join into one leaf, `mon_cables__runs`. The power strip, plugs, leads and loom join into `under_desk_power__strip_loom`.
- **Unchanged.** Target, border, display and dusk quads are the M1 objects, untouched. Library materials and textures are unchanged: 11 materials, 5 images. No new swatch, image or node or asset ID was added. Leaf names follow `assetId__part`.

| Asset | Leaves (material) | What is modelled |
| --- | --- | --- |
| `desk_top` | `__top` (oak) | 2.45 × 0.875 × 0.040 m, top 0.735. 5 mm three-segment eased edge. Grain runs along the length on the top and edges. The end faces use separate compressed end-grain UVs. 65 mm grommet hole cut by boolean, then baked. |
| `desk_frame` | `__steel` (palette) | Four 40 mm square legs inset from the corners, side rails, back beam, levelling feet with rubber pads. A 1.2 m U-channel cable tray hangs from the beam. |
| `desk_mat` | `__felt` (weave) | 0.90 × 0.40 × 0.009 m, rounded bevel. A 10 mm raised border reads as the stitched edge. |
| `mon_central` | `__body` (palette) | Slab with a 17.5 mm lip flush with the face plane. Recess floor 4 mm behind the border. Tapered rear housing, hinge, neck, rounded foot, rubber pads. Outer 0.975 × 0.565 m. |
| `mon_side` | `__copilot`, `__typeforge` (one shared mesh) | Same family at 0.435 × 0.705 m outer, with ±0.3 rad toe-in kept. |
| `mon_top` | `__body` (palette) | Same family at 0.68 × 0.40 m. VESA plate, arm and collar. 32 mm pole, offset 0.30 m right so it clears the central foot. C-clamp on the desk's back edge: top plate, jaw, lower jaw, screw, pad, knob. |
| `mon_cables` | `__runs` (palette, no shadow) | Two 8 mm cables per monitor. Central: down beside the neck, a clip, a sag over the foot, then through the grommet into the tray. Sides: a neck clip, along the desk, over the back edge, under the beam, into the tray ends. Top display: tied twice to the pole, round the clamp, into the tray. |
| `pc_tower` | `__case` (palette), `__glass` (glass, blend, renderOrder 2), `__glow` (glow) | Hollow white shell 0.275 × 0.59 × 0.56 m with an ivory liner. White front frame round a dark mesh panel with three fan rings, hubs and blades. Inside: board, graphics card, cooler, memory, PSU shroud, rear fan. A thin warm light bar sits on the shroud. Feet, top I/O and a power button. |
| `sub_woofer` | `__cabinet` (palette), `__grille` (weave) | 0.37 × 0.39 × 0.36 m. Recessed cloth grille, rubber feet, rear amplifier plate and knob. |
| `under_desk_power` | `__strip_loom` (palette, no shadow) | 0.40 m ivory strip in the tray: sockets, three plugs, switch. Leads join a 16 mm loom that drops off the tray end to the floor, toward the future M5 wall run, with a tie on the drop. Separate PC and subwoofer leads run into the tray. |
| `fix_pendant` | `__body` (palette), `__lens` (glow), no shadow | 0.95 m dark body with a bottom recess and metal end caps. Lens recessed 1.5 mm. Two cables with grips and two ceiling canopies. |

## Measured (exact geometry, from the evaluated editable state)

Sources are `author-measurements.json` (Blender ray casts from eye `(-0.35, -1.70, 1.345)` m and BVH tests) and the validator report.

- **Targets.** 81 of 81 eye rays reach the face first on `dissertation`, `copilot` and `typeforge`.
- **Monitor planes, local.** Face and lip front at −27 mm. Border at −23 mm, which is 4 mm behind the face, with 10 mm overhang per side. Recess floor at −19 mm. The lip inner edge clears the border edge by 0.5 mm, so no opaque part lies in front of or touches a face or border. Border separation and target corners are recomputed from the bytes in the manifest and checked by the validator.
- **Intersections.** None between any M2 part and another M2 part, architecture or binding plane. Same-asset parts are excluded from this check.
- **Cable clearances.** Smallest gap from any cable to the desk, frame, monitors, PC or subwoofer is 0.3 mm. Cables at rest sit 0.3 mm above their support, and their handles are flattened so they cannot dip through it. The top-display cables run 3 mm off the pole.
- **PC tower (root condition C2).**
  - The front is 167.5 mm behind the desk's front edge. The analytic minimum for a hidden top, including the 1.5 mm I/O, is 154.9 mm.
  - The top is 90 mm below the desk underside.
  - 75 mm to the right leg. Back beam 62.5 mm behind.
  - Top: 0 of 121 samples visible from the eye; the first hit is the desk top, or the notebook proxy.
  - Front: 105 of 105 samples visible. Glass side: 45 of 63.
- **PC under chrome, home-1440.** Projected with no chrome: 28 front samples are in frame, at x 1047–1217 and y 818–896 px. 16 of those fall outside the bottom-right chrome rectangle (1125–1416 × 730–876), and all 19 in-frame glass samples do. Only the top fan centre is in frame, at about (1130, 876), on the chrome rectangle's corner. **Most of the PC's home-1440 presence is at or under the eventual panel.** This is arithmetic on an empty frame, not UI proof. In `right-down` 78 front and 33 glass samples are in frame; in `music-1440`, 49 and 20.
- **Subwoofer.** Top 153 mm below the frame (tray bottom). Clear of the legs.
- **Clamp.** The jaws clear the back beam by 7.5 mm and the central foot by more than 100 mm. The central foot's back edge is 7.5 mm inside the desk's back edge.
- **Costs.**
  - Validator: 117 leaves, placed 24,722 triangles, unique 22,658, shadow 12,680 triangles over 48 casters.
  - Compression: gzip estimate 586,950 B, brotli 483,718 B, of which 325,195 B is the three M1 pilot textures.
  - M2 alone: 16 leaves, 17,702 placed, 16,682 unique, 10,772 casting triangles. The stage ceiling is 18,000 placed; the plan was 11,900 casting.
  - Over plan per asset: cables 3,908 (plan 1,200), frame and tray 2,512 (plan 1,400), power and loom 1,644 (plan 900). The stage total is still under the ceiling.
  - Draws: 16 M2 leaves plus 7 binding planes = 23, against the stage ceiling of 20. The plan merged cables into other groups, which the one-asset-per-leaf contract does not allow.
- **Inventory.** 57 of 59 IDs present. Missing: `music_cables` (M4) and `wall_cable_run` (M5). The M2 groups `mon_cables` and `under_desk_power` are now restored.

## Preview (one image; root asked me to hold the rest)

`renders/m2-proposal-v02_home-1440_half.png`: Cycles, 16 samples, 40 s limit, M1 reference lights. Screens show the Blender placeholder, not runtime content.

- I saw thin dark bezels with recessed faces, and stands, necks and feet sitting on the desk. The central cables drape to the grommet right of the central foot. The pole shows between the central and top displays.
- The desk reads 40 mm thick with an eased edge. The pendant has a shaded body and a bright recessed lens. Nothing floats or z-fights in this frame.
- **Weakness I can see: from home the PC reads as a dark square with one fan ring at the bottom-right corner. The white shell barely shows**, because the setback that hides the top also puts the white frame in desk shadow. Whether that is acceptable, or the front needs a whiter frame or brighter ring material, is for the critic and root's runtime capture.

I did not render `left-down` or the phone frame. Root's runtime images replace them for the independent gate.

A process note: render_cam.py was given a relative output path, and Blender wrote to `C:\renders\m2-proposal-v02_home-1440_half.png`. I copied it into `renders/`. The stray `C:\renders` folder still exists; deleting it was blocked by a safety check and is left for the user.

## Commands and resources

All Blender runs used `blender.exe --background --factory-startup --disable-autoexec --python-exit-code 1`, Blender 5.2.3, one process at a time, nothing killed.

| Run | Result |
| --- | --- |
| Inspect M1 proposal v02 blend | exit 0 |
| `build_fullkit_m2.py -- dry1…dry8`, which write nothing | Two exit 1 (a Blender 5.2 bevel property name; my own placeholder edit). Then exit 0. Fixes across these runs: half-extent bug (monitors were twice size), cable dips, cables through the necks, cables grazing the pole, loom crossing |
| `-- v01 blend glb` | exit 1 after the blend was saved: join-order bug. Blend preserved |
| `-- v02 blend glb` | exit 0 |
| `node technical/export-manifest.mjs …v02.glb proposal M2 …`, then `validate-full-kit.mjs … --report …` | exit 0, exit 0 |
| `render_cam.py` home-1440, 50 % | exit 0 |

Free memory: about 0.57–0.94 GB available at each check. vmmemWSL was about 5.3 GB.

## Remaining gates and later-stage conditions

1. **Root runtime capture** of v02 through the real loader and builder, after the FKT-1 repair and revalidation. Representative home, left-down and phone views, with actual chrome.
   - The phone candidate FOV 74 at −13.5/−7 is for root confirmation only; I made no production change. I added a Blender-only camera `home-320-f74-y135` to the blend.
2. **Independent Claude critique.** Questions I cannot settle myself:
   - Whether the PC reads as a white PC from home.
   - Whether its presence under the bottom-right panel is enough.
   - Bezel thinness and cable visibility.
3. **Known limits**
   - The pendant lens has no core-to-rim glow ramp (that needs a new texture).
   - Cable, frame and loom triangles are over per-asset plan.
   - 23 draws against the stage ceiling of 20.
   - In the editable blend, cables render with an untextured palette cell, near black, until export assigns the black swatch.
4. **M3 (nearfield).**
   - The headphones proxy intersects the TypeForge monitor stand and cables.
   - Mug, notebook, mouse, mic clamp, speaker and keyboard proxies touch or sink into the new desk top or mat by under 1 mm.
   - The mic clamp proxy intersects the left side rail.
   - Also: C1 cabinet size and the mug clear of the TypeForge stand.
5. **M4 (music).** C3 plan-view gaps for controller, stand and stool against the desk corner and PC. The PC's right face is at x 0.375 m and the right legs at x 0.45–0.49 m. Plus `music_cables`.
6. **M5 / M6.**
   - `wall_cable_run` starts where the loom ends, on the floor near (−1.98, 0.48) m in Blender.
   - Contact decals still overlap the feet by design.
   - The 51 remaining `__proxy` leaves, all M3–M5, are listed in `author-measurements.json`.

No final room or product claim.
