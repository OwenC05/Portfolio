# Right-limit pilot — author report (Claude)

15 November 2026. Task `task_a8910075c00f`, dispatch `ctx_dacb90594fdc`. Door and floor lamp authored in local Blender, no credits spent.

**Claim: pilot authoring complete.** Not claimed: runtime visual parity, independent visual approval, or product acceptance. No product source was edited; the prototype is untouched (`build-studio.ts` `364da680…`, `textures.ts` `09f6ff6c…`, `view-config.ts` `1fea7adb…`, re-hashed after the last run).

## Runs

Executable: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`, Blender 5.2.3 LTS, hash `e13b728c6880`. Every run: `--background --factory-startup --disable-autoexec --python-exit-code 1 --python <abs>\build_pilot.py -- <args>`, through the current terminal, no window. Cycles CPU, 8 threads, denoised, AgX view transform.

| Tag | Args | Result |
| --- | --- | --- |
| early01 | `720 450 32 only-up` | exit 0, 30 s, one still |
| v02 | `1440 900 64 iso glb blend` | exit 0, 9 min 20 s, seven stills, blend, GLB |
| v03probe | `720 450 32 only-up` | exit 0, 35 s, one still |
| v03 (render) | `1440 900 64 iso glb blend` | **killed by the Claude Code harness for low system memory** after six of seven stills; no blend or GLB written. Not a script error. |
| v03 (export) | `1440 900 64 norender glb blend` | exit 0, 10 s, blend and GLB. Run only after root's explicit authorisation. |

Version binding: the six v03 stills were rendered by `build_pilot.py` at `95a72bbb…5214a`. The v03 blend and GLB were written by `22bb0abc…30d1dc`, which differs only by the added `norender` flag that skips rendering. Geometry, materials, textures and metadata code are identical, and the inventory printed by both runs matches line for line.

### Provenance note (added 15 November 2026, task `task_2edb4878f56c`)

Added in answer to the two provenance gaps in `scene-pilot-visual-critique.md`. Report-only: no asset, render or script was changed, nothing was rerendered and Blender was not launched. All checks below were read-only; the reconstruction was done in memory and no historical file was recreated on disk.

**The 25-minute gap inside the six v03 stills.** It is one slow frame inside a single run, not two runs.

- Each PNG carries Blender's own `Date` and `RenderTime` text chunks. Read from the files as they are now:

| Still | `Date` | `RenderTime` |
| --- | --- | --- |
| `v03-right-up` | 23:30:09 | 02:12.46 |
| `v03-right-down` | 23:32:53 | 02:41.32 |
| `v03-music` | 23:58:13 | **25:19.51** |
| `v03-iso-door` | 23:58:44 | 00:30.52 |
| `v03-iso-door-detail` | 23:59:19 | 00:34.88 |
| `v03-iso-lamp` | 23:59:52 | 00:32.56 |

- `v03-music` began right after `right-down` finished and took 25 min 19 s by Blender's own clock, which accounts for the whole gap. The same view took about two minutes in the v02 run.
- The session log (`c0716a8a-….jsonl`, Claude Code transcript, outside the repo) shows one Blender launch for this run at 23:27:49 (background task `bhjt3kt3m`) and the harness's kill notice for that same task at 00:00:18, "stopped because the system is running low on memory". There is no second launch between them.
- Not proven: why that frame was slow. Memory pressure is my inference from the kill notice and from the harness itself stalling over the same period; nothing measured memory at the time. The run's own console output is not recoverable (its output file holds 10 bytes).

**Render script `95a72bbb…` versus export script `22bb0abc…`.** The earlier bytes are recoverable from the session log, and the difference is confirmed to be the `norender` flag only.

- 00:00:29, after the kill and before any edit: `sha256sum build_pilot.py` returned `95a72bbb68e3…` (logged tool result).
- 00:01:07: one logged edit to `build_pilot.py`, replacing the two lines
  `    if 'only-up' in FLAGS and name != 'right-up':` / `        continue`
  with a comment line plus
  `    if 'norender' in FLAGS or ('only-up' in FLAGS and name != 'right-up'):` / `        continue`.
- 00:01:15: `sha256sum` returned `22bb0abc…30d1dc`, the hash on disk now.
- Check made today: reversing that one logged edit on the current file, in memory, gives 27,218 bytes with sha256 `95a72bbb68e3ffb32f51a74db93edd9e5a20223dcaf8863f745708d8aaf5214a`. So the exact earlier bytes are the current file with those three lines put back to two, and anyone with the current file can repeat the check. This rests on the log and a hash match, not on my recollection.
- The log shows no write to `build_pilot.py` between the last pre-run patch (23:27:02) and that edit; the only file I wrote in between was `generation-prompts.md`.
- Limit: `95a72bbb…` was measured after the run ended, not at launch. That the run executed those bytes rests on the absence of any edit in my session log during the run. The log cannot rule out a change by another process, though the directory was exclusively mine and I know of none.
- The original file was never saved as a separate copy and I have not written one now.

**Correction to the "Version binding" paragraph above.** It says the inventory "printed by both runs" matches. The killed render run's inventory was never captured. The comparison that does hold is between the `v03probe` run (23:27:42, same script state as the render run) and the export run (00:04:47): nine inventory lines, identical in triangle counts, materials and bounds, re-compared today from the log.

This edit changes `pilot-report.md`'s own hash; every other hash in this report is unchanged.

## Deliverables

All under `design/studio-v2/asset-pipeline/pilot-right-limit/`.

| File | sha256 |
| --- | --- |
| `build_pilot.py` (authoring source) | `22bb0abc504f29b9ae8a9f1a88e4ec9dc7437415ecbffc663f1d6bed8030d1dc` |
| `pilot-right-limit-v03.blend` (editable, modifiers live) | `0fb0268202980f392de4f6331de0fde37c224215287408f3959c6db63186410b` |
| `exports/pilot-right-limit-v03.glb` (**author-final candidate**) | `2b9a4182c3024485680c1e066c8a22ef0dc0f541acca4bd958486bced2c4063e` |
| `textures/pilot_timber_albedo.png` 1024×256 | `ab1b820b394d7fa97125b92a384a29633117bcceef9cbd8214a1ca31245b0429` |
| `textures/pilot_linen_albedo.png` 256×256 | `47eeaa04e00157247fd99e475947ab9c74a3d3196a119df1ac27568e65136809` |
| `textures/pilot_linen_emissive.png` 256×256 | `ad2cfc3d67e0e2e975fe1464c9e3ecdbedf1e455e7219ebcdd17babce1bd9ff0` |
| `renders/v03-right-up.png` 1440×900 | `acbbb1b18dd9e641308b4462cf8ee17a707258e657ef4ed62dca2c61cf480494` |
| `renders/v03-right-down.png` | `724aad5c4a1905b6ed2a56c4e14dc401592d73a35751797c31b732a94612873b` |
| `renders/v03-music.png` | `714c0259bff2a2304180e3aa2ea9a3fbe80e299cdaf525d1423cbcaf31cad61b` |
| `renders/v03-iso-door.png` 600×800 | `b74b81e6f15647fcb1bf29447512d228e184f135b8cbd4e867e4ec8e897356c4` |
| `renders/v03-iso-door-detail.png` | `534bf453d729cfa45980e9d95d3ca549b8436efcd30a413274e8e383d5b7c1e8` |
| `renders/v03-iso-lamp.png` | `aa239fef01bed0bac6374da987dcc547ebb20d593fb87f40ffb48ba85dc1ed2d` |
| `generation-prompts.md` | `534f379cf53a236bca0439ef31c140e411358002a70093f7d2dc491ff28bdd54` |

Kept as history, not candidates: `renders/early01-right-up.png`, all `v02-*` stills, `v03probe-right-up.png`, `pilot-right-limit-v02.blend`, and `exports/pilot-right-limit-v02.glb` (`a4e2e741…`), which fails the validator on `pilot_lamp_bulb` `occluder=false` and has faceted normals.

**Gap:** `v03-iso-lamp-shade.png` was never rendered. The v02 shade close-up shows the superseded faceted shade and stepped seam and must not be used to judge v03.

## Candidate inventory

Nine mesh nodes at identity under the scene root, world placement baked in metres, 5,528 triangles total.

| Node | Material | Tris |
| --- | --- | --- |
| `pilot_door_leaf` | `lib_oak` (base colour texture) | 1,836 |
| `pilot_door_architrave` | `lib_dark_oak` | 432 |
| `pilot_door_hardware` | `lib_brass` | 652 |
| `pilot_lamp_base` | `lib_black_metal` | 204 |
| `pilot_lamp_pole` | `lib_brushed_metal` | 60 |
| `pilot_lamp_fittings` | `lib_brass` | 732 |
| `pilot_lamp_shade` | `lib_linen_shade` (base colour + emissive textures, strength 2.2) | 384 |
| `pilot_lamp_shade_trim` | `lib_linen_trim` | 788 |
| `pilot_lamp_bulb` | `lib_bulb` (emissive, strength 6) | 440 |

Extras on every node: `pilot: "right-limit"`, `occluder: true`. `nocast: true` on shade, trim and bulb. No lights, cameras, animation or compression. Three embedded PNGs. Only extension: `KHR_materials_emissive_strength`.

Validator: `node integration-contract/validate-glb.mjs pilot-right-limit/exports/pilot-right-limit-v03.glb` → exit 0, `"valid": true`, `errors: []`, profile `right-limit-pilot-v1` (`02a9b364…`), 585,536 bytes against a 1,500,000 ceiling. Offline structure check only; it defers image decode, browser loading and appearance.

## What I saw in the renders

Opened at full size: `early01-right-up`, `v02-right-up`, `v02-right-down`, `v02-iso-door-detail`, `v02-iso-lamp-shade`, `v03probe-right-up`, and all six v03 stills. Before images: prototype `early/right-up-1440.png` and `right-down-1440.png`.

- **Door.** A frame-and-panel oak door with two raised fields, bolection strips, lock rail, dark oak architrave with head cap, round brass knob and keyhole. Where the prototype showed two black slabs, grain and panel edges now read in `v03-right-up` and `v03-right-down`. Edges are softly bevelled. Grain is subtle; in the grey isolated views the oak looks pale and slightly pink, warmer in the room light.
- **Lamp.** Tapered linen shade with a warm core fading to darker head and foot, trim band at each rim, one vertical seam, brass collar and finial, weighted base. No flat white patch in the room views. In `v03-iso-lamp` under strong neutral fill the shade reads near-white with little gradient, so its emissive balance is only shown to work in the dim room.
- **Right wall and ceiling.** Readable in all three room views, with a visible light pool around the lamp and beams catching light on their lower edges.
- **Weak points.** The wall strip between window and door and the area below the sill are the dimmest parts and still fairly dark. The door's lower right in `right-up` is dim. The context window pane is a flat blue card, not the prototype's skyline; it is context, not a pilot asset. The shell is bare, so these frames say nothing about how the door and lamp sit with the keyboard, kit and rug in front.

## Blender versus runtime

These stills are path-traced with bounce light and AgX. The site renders with one shadow-casting sun, non-shadowing point lights, no bounce, and ACES at exposure 1.2. Consequences I expect and have not tested:

- The prototype's key light travels away from the right wall, so in the runtime the door gets no key light at all. It will need an explicit fill near the door or a longer-reaching lamp light; the lighter oak alone will not fix blocker 1.
- Emissive strengths 2.2 and 6 were judged under AgX and may clip under ACES 1.2.
- Brass and brushed metal are fully metallic and will look dark without an environment map.
- The Blender scene's stand-in pendant and wall-triangle lights exist only so the room is not judged in isolation; they are not exported.

## Contract notes for S

- I followed the frozen `right-limit-pilot-v1` profile without changes and request none.
- Border-plane exception: I agree with documenting the narrow exception for the three unlit target-border planes, with model source unchanged.

## Open

- Independent Claude visual critique of the v03 stills.
- Loading the GLB in the real renderer and capturing `right-up`, `right-down` and the music view at 1440×900 beside the prototype captures; my plan's pass criteria (door luminance in the left wall's range, shade under 2% clipped) can only be measured there.
- Runtime fill light for the door end, to be designed once a runtime capture exists.
- Optional: the missing shade close-up, one small render when memory allows.
- Higgsfield frame and Meshy mouse remain unsubmitted drafts awaiting approval and a current quote.
