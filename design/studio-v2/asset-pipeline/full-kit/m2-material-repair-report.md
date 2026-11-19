# M2 material repair v03: author report

15 November 2026. Claude (actual), task `task_e0a4ef11c0ca`, dispatch `ctx_c777d3962014`. Profile `studio-full-kit-v1`, variant `proposal`, stage `M2`.

Model and effort: the task requested `claude-opus-5-5` at `high`. The process argv shows `--model claude-opus-5-5 --effort high`. `CLAUDE_CODE_EFFORT_LEVEL` and every model override variable are absent from the process environment. The runtime reports itself as `claude-opus-5-5`. The ACK is `msg_436bae9ec685`.

This is the author's account of a remedy. It is not an acceptance. The independent reviewer owns acceptance after root captures. I made no camera, UI, runtime, light, shader or production-source change.

## Inputs

- Final independent critique `scene-m2-visual-critique.md` (Fable, `task_5437cd5dfec3`). Finding 1, pendant lens clipping (24.1–26.7% of lens pixels clipped against a 2% gate), is the only blocking item. Finding 2, PC front and glow, is recommended.
- Root scope in `msg_033cce95deab` and `m2-root-visual-disposition.md`. It forbids relocating glow geometry, remapping UVs, curving cables, consolidating leaves and changing runtime lights. It allows existing material-response changes.
- Candidate v02: GLB `2089a4f0…5411` and builder `build_fullkit_m2.py` `63b10ad1…1743`, both unchanged. M1 builder `1a66c8be…a5`, also unchanged.

## What changed

There is one change: the response values of the library material `lib_glow`. Leaves, meshes, UVs, images, textures, sidedness, alpha mode, render order, shadow and receive flags, lights and the material count are all unchanged.

| `lib_glow` | v02 | v03 |
| --- | --- | --- |
| Base colour | `#ffdb9e`, linear (1, 0.708, 0.342) | black (0, 0, 0) |
| Metallic / roughness | 0 / 0.6 | 1 / 1.0 (glTF defaults, so the exporter omits both factors) |
| Emissive factor | `#ffc27a`, linear (1, 0.539, 0.195) | `#ffd29a`, linear (1, 0.644, 0.323) |
| `KHR_materials_emissive_strength` | 1.1 | 1.2 |

### Why this remedy

- **Cause.** The v02 lens was a light-coloured dielectric. In three r187 it took full diffuse and specular light from the pendant practical, which is intensity 12 at world (−1.6, 3.85, 0.3), only 0.125 world units under the lens. That light was added to its own emission, and its centre-peaked falloff produced the white bar the critic measured.
- **Fix.** With a black base and metallic 1, the material has no diffuse term and a specular F0 of 0. The only remaining reflection is the Schlick f90 tail at grazing half-angles. At roughness 1 and the eye's roughly 75° view-to-light geometry, that tail is negligible. No environment map exists to reflect. The lens therefore shows its own emission, with no gradient from the light under it.
- **Expected appearance (arithmetic, not captured).** Through three's ACES filmic curve at exposure 1.2 with sRGB output, emission (1, 0.644, 0.323) × 1.2 maps to about sRGB **(237, 225, 201)**. That is a warm white whose highest channel is 237. The critique's clipping definition requires all three channels at 250 or above, and an emissive-only surface at this level cannot reach it. Anti-aliasing only mixes it with darker pixels.
- **Brightness.** The critic asked that the ends stay luminous; they read about 225. The new value is brighter than that at every point along the lens. The critic's v02 end reading of (248, 235, 204) included scene light, so the lens loses its bright centre bar and stays a uniformly bright strip. The dark body (palette `black_metal` and `black`, unchanged) keeps the body-to-lens edge.
- **Colour.** I moved the hue from amber `#ffc27a` to `#ffd29a`. That matches the pendant practical's colour `#ffd2a0`, so the fixture and the light it casts agree.

### Not done, and why

- **No core-to-rim ramp.** The critic's step 2, the planned `fk_glow_ramps` image, is not authored. Mapping it would require the lens UVs to move off their single point (0.5, 0.5), which is a UV remap root has excluded. It would also add a sixth image of about 8 kB budget. That would push embedded images further past the 300,000-byte texture allocation (already 325,195 B) and add a texture slot to `lib_glow`, a material shared by eight leaves. I report it as a future M6 option in `budget-addendum-v01.md`, not as free budget. The flat lens is a known limit.
- **PC front panel and glow (finding 2): unchanged.** The concrete dependency is set out below.

## Shared-material impact

`lib_glow` is shared. The build log lists all its consumers in the exported scene. Each changes in the same way: it no longer receives light and shows warm-white emission.

| Consumer | Stage | Expected effect |
| --- | --- | --- |
| `fix_pendant__lens` | M2 | Intended repair |
| `fix_floor_lamp__bulb` (440 triangles) | M1 | It sits inside the shade beside the floor-lamp practical (intensity 9). It loses light-driven brightening, which was very likely clipping as well. Its emission colour is now warm white instead of amber. Only the right-limit and music views show it. Root's capture should include one of those views. |
| `pc_tower__glow` | M2 | Hidden behind the front panel in every captured view (critique finding 2), so no visible effect |
| `fix_wall_triangles__proxy_light_1…5` | M5 proxies | These are grey-box proxies that M5 replaces. They lose their lit component (critic peak 247) and show (237, 225, 201): slightly less amber, still bright. The M5 author re-decides their final material. |

Texture impact: none. `lib_glow` has no texture slot, and all five embedded images are byte-identical.

## Candidate files (all new; v02 and earlier untouched)

| File (under `design/studio-v2/asset-pipeline/full-kit/`) | SHA256 |
| --- | --- |
| `exports/studio-full-kit-m2-proposal-v03.glb` (1,228,192 B) | `7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752` |
| `manifests/studio-full-kit-m2-proposal-v03.manifest.json` (`technical/export-manifest.mjs … proposal M2`) | `5e1cb075b377c3ce3d7656601eef55afdd5d59aeef5be6d3c4b28500f83228d9` |
| `manifests/m2-material-v03-validator-report.json` | `48c33553325c3b31023ae0e1493368d2cd878993fde5273b22c17602b029b881` |
| `manifests/m2-material-v03-author-measurements.json` | `9f835034b9fb1a7aa4dc5462d528de54d1b922a2a6035a743418f5f2f6a15923` |
| `source/fk-20-workstation-material-v03.blend` (editable, live modifiers and curves) | `3c65ec79a43e5c1ec43f13c1777ff47ae49a0b3ec6b90dcf1494d46c34338b2b` |
| `source/build_fullkit_m2_material_v03.py` | `b4218d03094766ee30de7874afe42a55273ef27b95e34ee9d6a8db6c9d49574a` |

How it is built:

1. The v03 script asserts the hashes of `build_fullkit_m2.py` and the v02 GLB.
2. It runs the unchanged M2 builder in dry mode, which also runs the unchanged M1 builder. That reproduces the exact editable state of v02, and neither builder writes anything.
3. It edits `lib_glow`, sets the scene provenance extras to `fk_tag 'm2base-v03'` and `fk_m2_tag 'v03-material'`, and saves the blend.
4. It bakes and exports using a verbatim copy of the v02 bake, join and export code, with the same exporter options. This keeps the v02 deliverable names untouched.
5. It refuses to overwrite any existing file.

Validator: `valid: true`, no errors. Checked against `validate-full-kit.mjs` `66ee9d34…bd75`, `profile-core.mjs` `02b65fed…ae71`, profile `7d2892ae…a052` and inventory `eddc33b5…1c87`, the hashes on disk at run time. No validator, profile or inventory file was edited or relaxed.

## Paired identity with v02 (measured from bytes)

- **BIN chunk.** Byte-identical, 1,155,932 B. That means every position, normal, UV, index and embedded image.
- **Identical JSON sections.** `nodes` (names, transforms, extras: `assetId`, `role`, `occluder`, `transparent`, `nocast`, `receiveShadow`, `renderOrder`), `meshes`, `accessors`, `bufferViews`, `images`, `textures`, `samplers` and `extensionsUsed`.
- **Scenes.** Identical except the provenance tag extras.
- **Materials.** Eleven in the same order. Only `lib_glow` differs.
- **Manifest diff (field walk).** Only `materials[8]` (the `lib_glow` definition) and `glbSha256` change. The node list, flags, binding planes, bounds, counts and all per-leaf records are identical.
- **Bindings and placement unchanged.** These are the three `target_*`, the three `border_*`, `display_studio` and `rt_window_dusk`, the single `studio-full-kit-placement` node (scale 2, +Y 0.11) and every occluder flag.

| Count (whole candidate) | v02 | v03 |
| --- | ---: | ---: |
| Primitive instances (leaves) | 117 | 117 |
| Shadow casters / casting triangles | 48 / 12,680 | 48 / 12,680 |
| Placed / unique triangles | 24,722 / 22,658 | 24,722 / 22,658 |
| Double-sided BLEND leaves (extra main passes) | 4 | 4 |
| Conservative all-visible refresh (independent review method) | 169 calls / 37,440 tris | 169 calls / 37,440 tris |
| M2 leaves incl. 7 binding planes | 23 | 23 |
| Materials / images / image bytes | 11 / 5 / 325,195 | 11 / 5 / 325,195 |
| Raw GLB / gzip / Brotli (Node `zlib` defaults, validator) | 1,228,272 / 586,950 / 483,718 | 1,228,192 / 586,943 / 483,798 |

The raw size shrinks by 80 B, because two factors fall back to their defaults and the tag is shorter. The Brotli estimate grows by 80 B. These are compressor estimates, not delivery measurements.

## PC front and glow: dependency (finding 2, recommended, not done)

Neither half can be reached with a material-response change alone:

1. **Front panel.** The dark mesh panel is a face of `pc_tower__case`. Its UVs point at the palette swatch `black` (`#202725`). `lib_palette` and that swatch are shared by the subwoofer cabinet, both cable leaves, the pendant cables, monitor parts and many proxies. Recolouring the swatch would change all of them. The only bounded remedy:
   - reassign that one panel floor face's UVs to the existing `ivory` swatch (`#e3e1d2`);
   - keep hubs and blades on `black_metal`, so the fan rings read against a pale mesh;
   - leave the vertex and index count unchanged; this changes 4 to 8 `TEXCOORD_0` values in one accessor.

   That is a UV remap, which root has excluded.
2. **Glow.** `pc_tower__glow` (12 triangles) sits on the PSU shroud behind the front panel, and no eye ray reaches it. Making it visible means moving that quad, for example as a vertical strip on the inner front frame, seen through the glass side at home-1440 x 963–1038. Its triangle count and flags would not change. That is a glow-geometry relocation, which root has excluded.

If root releases both, they fit inside the current leaf, material, pass and flag set with zero count change. Note that the glow leaf shares `lib_glow`, so it would show the v03 emissive-only warm white. The C2 top-hidden clearance would be unaffected, because no case vertex moves. Findings 3 (under-desk lead segments) and 5 (pole swatch) are likewise geometry or UV work and are not done.

## Failed attempts and process

All runs were `blender.exe --background --factory-startup --disable-autoexec --python-exit-code 1`, Blender 5.2, one process at a time. Nothing was killed. Free memory before the runs was about 950 MB of 16 GB.

| Run | Result |
| --- | --- |
| Probe export to the session scratchpad, outside the repo (`FK_V03_PROBE_GLB`) | exit 1, by design. My paired check rejected it: two `TEXCOORD_0` floats (`desk_top__top`, `sub_woofer__cabinet`) differed from v02 by one float32 ULP (≤6e-8), and the scene tag read `v03dry`. I fixed the tag. The check now permits only `TEXCOORD_0` deltas ≤2⁻²⁰ and records them. |
| Real run with a relative script path | exit 1. Blender resolved the path against the wrong directory, and nothing was written. |
| Real run `-- blend glb` | exit 0. The BIN chunk is byte-identical to v02 (`binWordDifferences: []`), so the probe's ULP noise did not recur. |
| `export-manifest.mjs`, then `validate-full-kit.mjs --report` | exit 0, exit 0 |

I rendered no preview, so root's capture is the first image of v03. Nothing was written outside the owned repo paths and the session scratchpad.

## Validation limits

- The expected lens colour comes from ACES arithmetic only. Real-renderer clipping, the visibility of the body edge and the collateral bulb and wall-proxy appearance all need root's capture under the actual loader and builder.
- Pass criterion from the critique: under 2% of lens pixels clipped in the seven views, ends still luminous, and the body edge still readable.
- No browser, runtime, test-suite or 72-test rerun was done by me.
- The paired-delta check is mine. The independent Codex bounded check is still required.
- PC finding 2 is unaddressed pending a root scope decision.

## Remaining gates

1. Root captures v03 in `home-1440`, `home-1024`, `mid-left-1440`, `left-up-1440`, `home-320×844`, `home-390` and `home-320×568`, plus `left-up-390` and one view showing the floor-lamp bulb, with the same method as the v02 capture.
2. Independent Codex runs the paired-delta check against v02.
3. The independent Fable reviewer rereviews.
4. Root decides whether to release the PC UV and glow dependency.
5. M3 stays held on the budget addendum (`budget-addendum-v01.md`, `export-ledger-v01.json`).

No room or product completion is claimed.
