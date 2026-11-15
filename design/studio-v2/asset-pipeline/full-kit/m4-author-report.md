# M4 music equipment: author report (Claude, task_23314c669e03 / ctx_569e786e8807)

15 November 2026. Author: Claude Opus 5.5, effort high. This is the retained actual-Claude session, with inherited settings and no override.

This report covers my authoring: art decisions, source chain, the single guarded run and the measured geometry. It is not acceptance. Four gates are still open:
- S's exact three-word restoration, its guard/validator pass and the paired final manifest (§9);
- S's independent assembled audit, compression and full-room forecast;
- root's technical review and actual runtime captures;
- the independent actual-Claude Fable review of the music, right-down, phone and desktop views.

Every number below is Blender or offline-numpy geometry evidence from builder cameras. None is a screenshot, and none waives a visual gate. No M5 or T1 work.

## 1. Source chain and run history

| Step | Identity (SHA256) | Result |
| --- | --- | --- |
| Frozen mapping | `scene-coordination/m4-model-contract.json` `8f0474aa…2d98` | 23 proxy removals, 18 rows with fixed assets, materials, ceilings and flags |
| Parent | accepted corrected M3 v03 GLB `dc9c6a78…6baf`, manifest `060bab9a…6405` | Not edited |
| Editable chain | frozen `build_fullkit_m3.py` `dccfa288…a209` run dry via `runpy` | Yields editable M3 v02; v03 = raw v02 + root's exact four-word restoration |
| Provenance | amendment `m4-scene-provenance-amendment-v01.json` `3b3a011d…2229` | Scene extras `fk_tag m4-v01`, `fk_stage M4`, `fk_m4_tag v01` appended; other tags unchanged |
| Geometry helper | `source/build_fullkit_m4_geometry.py` **`c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0`** | Pure math + numpy, no bpy, writes nothing |
| Builder | `source/build_fullkit_m4.py` **`aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22`** | Pins the M3 script, helper, contract and parent hashes; interlock `FK_M4_PARENT_RELEASE` = parent SHA |
| Dry run 1 | builder before the EYE fix | Failed in 10 s at my own assertion `tuple(EYE) == (...)`: EYE is a float32 `Vector`. Nothing written. Fixed to a 1e-6 tolerance and reported to root. |
| Dry run 2 | `aa9724dc…` | Passed every in-Blender assertion. Nothing written. |
| v01 save + export | `aa9724dc…` | Outputs below. The frozen guard rejected the raw (§9). |

Each Blender run was a single hidden `--background --factory-startup --disable-autoexec` process of Blender 5.2.3. Before each launch I checked that no other Blender was running. There were no renders and no preview batches. The exporter printed one warning, "More than one shader node tex image used for a texture"; the M3 v02 export printed the same one.

v01 outputs, all preserved unchanged:

| File | Bytes | SHA256 |
| --- | ---: | --- |
| `source/fk-40-music-proposal-v01.blend` | 816,017 | `0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665` |
| `exports/studio-full-kit-m4-proposal-v01.raw-export.glb` | 2,206,200 | `c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906` |
| `manifests/m4-v01-author-measurements.json` | 37,617 | `22039aa167938fea67554bf42158b8d66eae2b4a244ddf1ee63486a93b194782` |
| `manifests/m4-v01-transition-guard-receipt.json` (guard CLI) | — | `b31e17bfd8782ce5625f80222e28dd836a0cb5930f07cd4d5b6e990e7d250fcd` |

**Stale docstring.** The helper docstring still says the controller is "centred at the proxy, yaw −0.35 rad". That describes the first plan. The built placement is in §2: (1.20, −0.80), yaw −0.60 rad = −34.38°. The source is frozen, so this report is the correction.

## 2. Placements (Blender metres, Z up) and material assignments

The layout keeps the accepted right-side music corner: the controller in front, toward the room, and the drum kit around the proxy rack line at y 0.56. Root confirmed three moves as within scope, as an authored proposal only (msg_66414bee28f0). Each is needed so a real part can be seen:
- **Controller:** moved from the proxy (1.0, −0.675, yaw −0.35) to (1.20, −0.80, yaw −0.60). At the proxy pose it hid the kick pedal (0/64 samples) and most of the throne.
- **Module:** moved to (0.85, 0.40, 0.78). It was behind the M3 headphones.
- **Hi-hat pedal:** moved to (1.00, 0.10). It was behind a desk leg.

All colours are existing `lib_palette` swatches or the unchanged `lib_weave`, `lib_oak` and `lib_glow` library mappings. I added no new material, texture or image. Triangle counts per swatch are in brackets.

| Row | Placement and form | Swatches (triangles) |
| --- | --- | --- |
| `ctl_body__shell` | 49-key controller, 0.99 × 0.32 × 0.095, base at z 0.573. White, unbranded body. Sloped rear panel with 8 pads (2 × 4), 8 knobs, display bezel and 4 transport keys. Wheel bay with pitch and mod wheels. Rounded oak-tone end cheeks. | white_pc (46, large faces), black key bed/knobs/bezel/slots (518), fabric pads/transport (400), oak_tone cheeks (48), rubber wheels (120) |
| `ctl_body__indicators` | Display face plus four pad-column strips | lib_glow (60) |
| `ctl_keys__keys` | 29 white keys: front block plus stem, pitch 29.4 mm, gap 3.4 mm, 170 mm long. 20 black keys: tapered 14.5 → 11 mm, 105 mm long, 11.3 mm proud. The black bed shows through every gap. | ivory (696), black (240) |
| `ctl_stand__frame` | Double-braced X stand: pivot plates, height teeth, pivot bolt and knob, rubber feet | black_metal (248), rubber (352), metal (116), black (60) |
| `ctl_sustain_pedal__pedal` | At controller-local (0.42, −0.04). Base plate plus a hinged pedal at −7°. Its cable leaves the back, runs along the rug and rises behind the stand to the rear jack; the last segment is horizontal into the body. | black (172), metal (44) |
| `stool_keys__stool` | At controller-local (0.25, −0.40). Round seat r 0.165 at 0.50, post, height collar, hub, 4 legs (span 0.17) | fabric seat (168), black_metal, metal, rubber, black |
| `rug__rug` | x 0.56–2.215, y −1.36–0.89, 8 mm thick, 26 mm bound edge 10.5 mm high, r 0.04 corners | lib_weave (156) |
| `drum_rack__rack` | Uprights at x 0.82 / 1.98, y 0.56. Tubes r 0.021: top 0.80, crossbar 0.66, side arms 0.48 at y 0.20. Feet at y 0.40 / 0.78. 14 clamps with wing bolts; stubs and booms for pads, cymbals and module. | metal tubes (1228), black clamps (560), rubber feet/caps (296) |
| `drum_pads__shells` | tom1 (1.18, 0.47, 0.79) and tom2 (1.60, 0.47, 0.80): r 0.135, tilt 16°. Snare (1.06, 0.25, 0.555): r 0.16, 6 lugs, tilt 6°. tom3 (1.80, 0.27, 0.56): tilt 9°. Each has a mount block and an arm to its rack stub. | black shells (672), metal rims/lugs (984), black_metal mounts (272) |
| `drum_pads__heads` | Mesh heads inset 0.3 mm inside each rim | lib_weave (384) |
| `drum_cymbals__cymbals` | Hi-hat (0.85, 0.62, 1.00) r 0.19, tilt 3°. Crash (1.68, 0.67, 1.06) r 0.20, tilt 12°. Ride (1.98, 0.445, 0.95) r 0.20, tilt 9°. Lathed profile with a raised bell and a turned-down edge lip. Each has a rod, felt, wing nut and tilter. | fabric bell and edge zones (792), black_metal bow and underside (648), metal rods (168), rubber felts (84), black wing nuts (120) |
| `drum_kick__tower` | Tower 0.21 × 0.11 × 0.45 at (1.42, 0.455). Round pad r 0.078 at 0.235. Beater and footboard, heel y 0.10, toe y 0.33. | black, black_metal, metal, fabric pad (92), cream beater (96), rubber |
| `drum_hihat_pedal__pedal` | Separate hi-hat controller pedal 0.11 × 0.30 at (1.00, 0.10), yaw 0.12 | black, black_metal, rubber |
| `drum_module__body` | 0.20 × 0.13 × 0.05 at (0.85, 0.40, 0.78) on a rack boom, facing azimuth 165°, tilted up 35°. Snake and power sockets. | black, black_metal, metal, fabric |
| `drum_module__display` | Display face | lib_glow (12) |
| `drum_sticks__pair` | Pair resting on the snare/tom pads | lib_oak (120) |
| `drum_throne__throne` | (1.425, 0.0), round seat r 0.175 at 0.48, legs span 0.20 | fabric seat (168), black_metal, metal, rubber, black |
| `music_cables__runs` | r 3.2 mm. Snake from the module to all four pad jacks: tom runs go below the crossbar, and every jack sits between lugs on the shell side. Kick and hi-hat pedal leads also run from the snake. The controller lead and the module power cross the rug's bound edge (`to_wall`) to the back wall at x 0.62 / 0.70. | black (588) |

## 3. G4 measurements (exact Blender ray casts from the frozen eye)

| Gate | Measured |
| --- | --- |
| Key counts | 29 white + 20 black. All 29 white key tops are the first hit from the eye. |
| Desktop music azimuth | **30.96°** from unobstructed samples (43.89 → 74.85°); 32.14° over all vertices. Eye-to-controller distance 1.932 m. Above the 30° gate, with a thin margin. |
| White-key pitch in builder cameras | music-1440: 12.2–14.3 px · right-down: 10.0–14.1 px · music-320-f74: **8.4–9.9 px** |
| Kick pedal | 169/190 unobstructed; in frame in music-1440, right-down and music-320 (169 each) |
| Kick tower upper | 158/160 |
| Hi-hat pedal | 60/96 unobstructed (blocked by `contact_decals__music_corner` 18, `desk_frame__steel` 18); 60 in frame in all three music cameras |
| Sustain pedal | 57/80 unobstructed (contact decal 16, stool 6, rug 1). In frame: music-1440 52, right-down 57, **music-320 0** |
| Cymbal bell / edge | Hi-hat: bell 16/16, edge **25/32** (7 blocked by `speaker_nearfield__cabinet`). Crash 16/16, 32/32. Ride 16/16, 32/32. |
| Cymbal vs. M3 nearfield speaker | Minimum clearance 0.349 m; no overlap |
| Throne seat / stool seat | 54/73 (controller shell blocks 19) / 110/110. The stool is out of frame in music-320. |
| Module display | 6/8; in frame in all four builder cameras including home-1440 |
| Rack / pads / heads / sticks | 57/167 / 129/153 / 90/200 / 64/64 unobstructed. The rack is mostly hidden by the pads and desk top, as designed. |

## 4. Contacts, clearances, intersections and targets

- **Targets:** dissertation, copilot and typeforge are each 81/81 clear, with no blockers.
- **Intersections:** none between any M4 row and any retained or other M4 asset, by the in-Blender BVH check and an independent offline tri-tri check.
- **Contact decal:** the provisional `contact_decals__music_corner` leaf is crossed by stand 64, sustain 44, rack 84, hi-hat pedal 16, kick 92, throne 60 and cables 44 triangles. These are recorded, not resolved: the decal is a frozen retained provisional contact leaf outside my ownership. It also blocks some pedal samples (above). How it renders over the rug is unknown until actual captures.
- **Resting gaps:** 0.3 mm for rug–floor, stand/pedals/stool/rack/kick/throne–rug, keys–body, pads/cymbals/module–rack and cables–module. Cables–rug 0.4 mm; sticks–pads 1.6 mm. The controller–stand vertex-sampled gap reads 5 mm, but the true face clearance is 0.3 mm because no vertex lies over the contact line.
- **Retained clearances:** rug–floor-lamp base 0.020 m; rug–desk frame 0.070 m; controller–desk top 0.190 m.

## 5. Flags, counts and bytes

Rows, materials, ceilings and flags equal the frozen mapping; the builder asserts this. Every row is opaque, an occluder and receives shadows. The no-cast rows are indicators, keys, sustain pedal, heads, hi-hat pedal, display, sticks, rug and cables; they still block as opaque.

| Row | Placed | Ceiling | Casts | Row | Placed | Ceiling | Casts |
| --- | ---: | ---: | :-: | --- | ---: | ---: | :-: |
| ctl_body__shell | 1132 | 2500 | ✓ | drum_pads__heads | 384 | 900 | – |
| ctl_body__indicators | 60 | 60 | – | drum_cymbals__cymbals | 1812 | 1950 | ✓ |
| ctl_keys__keys | 936 | 1540 | – | drum_kick__tower | 696 | 1500 | ✓ |
| ctl_stand__frame | 776 | 1300 | ✓ | drum_hihat_pedal__pedal | 172 | 600 | – |
| ctl_sustain_pedal__pedal | 216 | 500 | – | drum_module__body | 320 | 640 | ✓ |
| stool_keys__stool | 548 | 700 | ✓ | drum_module__display | 12 | 60 | – |
| rug__rug | 156 | 400 | – | drum_sticks__pair | 120 | 120 | – |
| drum_rack__rack | 2084 | 2400 | ✓ | drum_throne__throne | 588 | 700 | ✓ |
| drum_pads__shells | 1928 | 2600 | ✓ | music_cables__runs | 588 | 800 | – |

**Stage:** 18 main / 9 casters / 27 refresh / **12,528 placed** / 22,412 refresh triangles. Forecast was 18 / 9 / 27 / 19,270 / 33,560; limits are 20 main / 30 refresh / 22,500 placed. There are no extra splits, casters or passes.

**Assembled raw** (guard metrics and S's profile check `m4-v01-raw-profile-check.json`, a diagnostic only):
- Structure: 110 leaves, 58 asset ids, 17 remaining proxies, 3 provisional contacts.
- Geometry: 46,020 placed, 44,544 unique, 28,382 shadow triangles. 31 shadow instances, 12 materials, 5 textures.
- Bytes: raw 2,206,200 B (+577,536 vs. the 1,628,664 B parent). S measured 882,584 B gzip, 683,073 B Brotli and 325,144 B encoded images.

These are not final transfer numbers. S owns the assembled audit and the full-room forecast against the 1,500,351 B gzip forecast, which has no margin.

## 6. Proxies

**Removed** (23, equal to the contract RETIRE list):
- Controller and keys: `ctl_body__proxy_body`, `ctl_keys__proxy_key_bed`, `ctl_stand__proxy_leg_1/2`, `ctl_sustain_pedal__proxy_pedal`
- Cymbals and pedals: `drum_cymbals__proxy_cymbal_1/2/3`, `drum_hihat_pedal__proxy_pedal`, `drum_kick__proxy_tower_pedal`
- Module and pads: `drum_module__proxy_module`, `drum_pads__proxy_pad_1/2/3/4`
- Rack: `drum_rack__proxy_crossbar`, `drum_rack__proxy_upright_1/2`
- Sticks, throne, rug, stool: `drum_sticks__proxy_pair`, `drum_throne__proxy_seat`, `rug__proxy_rug`, `stool_keys__proxy_post/seat`

**Remaining** (17, all for later stages):
- Acoustic panels: `acoustic_panels__proxy_panel_1/2/3`
- Switches and wall lights: `arch_switches__proxy_switch_door`, `fix_wall_triangles__proxy_light_1…5`
- Shelf: `shelf_books__proxy_row`, `shelf_plant__proxy_plant`, `shelf_speaker__proxy_cabinet`
- Snowboard: `snowboard_bindings__proxy_binding_1/2`, `snowboard_deck__proxy_deck`
- Wall: `wall_print__proxy_frame`, `wall_shelf__proxy_board`

## 7. Deliberate stylization

- The controller is an original, unbranded design. It has no logo, text or screen content; the display and pad strips are flat `lib_glow`.
- The cymbals are electronic rubber-zone cymbals, not brass. The bell and edge playing zones are matte `fabric` (0x454b47, roughness 0.98), and the bow is `black_metal` (0x23282a, 0.45 / 0.5). The bell and edge are meant to read through shape (raised bell, turned-down lip) and through this roughness and value contrast. The contrast is low by design, which is a review risk (§8).
- The kit is low-poly. Pads are 24-segment lathes and tubes have 10–16 sides, with no modifiers, so every triangle count is exact. Mesh heads use the shared weave texture tinted by the library, not a separate mesh texture.
- The cables are simplified 5-sided sweeps along planned waypoints, routed to avoid pads, the crossbar and the rug's bound edge. There are no loose coils.

## 8. Actual-render unknowns and risks for independent review

1. **Phone key legibility.** White-key pitch is 8.4–9.9 px in music-320-f74, so individual keys may blur at phone width. M3's phone-pitch exception is unchanged and does not cover this automatically.
2. **Azimuth margin.** 30.96° against the 30° gate. A runtime FOV or crop difference could take it below the gate.
3. **Sustain pedal and stool on phone.** Both are out of frame in music-320-f74. They are visible in music-1440 and right-down.
4. **Hi-hat edge.** 7 of 32 edge samples are behind the M3 nearfield speaker from the eye. The bell is clear, and the crash and ride are fully clear.
5. **Cymbal reading.** Rubber-zone fabric against the black_metal bow may read as one dark disc under the runtime lighting.
6. **Contact decal.** The provisional music-corner decal crosses several feet and pedals and blocks some pedal samples. Its runtime appearance on top of the rug is unknown.
7. **Rack visibility.** Only 57/167 rack samples are unobstructed. The kit should still read as a kit through the pads and cymbals.
8. **Transfer.** The raw grew by 577,536 B. Final transfer acceptance belongs to S and root.
9. The controller, module and hi-hat moves are author proposals pending actual images.

## 9. Guard rejection and disposition

The frozen approved guard `m4-transition-guard.py` (`ad62627f…da6b`) was run unchanged on the actual raw. It returned `valid: false`, 3 errors, exit 1, recorded in receipt `b31e17bf…0fcd`. Every other check passed: 368 retained accessor comparisons, 92 retained leaves and all 18 row identities and metrics.

All three errors are `retainedAccessorBytes` in `desk_top__top_mesh.002`, TEXCOORD_0, parent accessor 64 / raw accessor 75:

| Vertex.component | Parent BIN / file | Raw BIN / file | Parent word | Raw word | Difference |
| --- | --- | --- | --- | --- | --- |
| 199.0 | 411396 / 487544 | 580196 / 662880 | `5b8f72bf` | `5d8f72bf` | **2 ULP** |
| 258.0 | 411868 / 488016 | 580668 / 663352 | `20858b3e` | `21858b3e` | 1 ULP |
| 274.1 | 412000 / 488148 | 580800 / 663484 | `3689213f` | `3789213f` | 1 ULP |

The earlier M3 word (197, 1) did not recur, and there is no subwoofer delta. My escalation (msg_ac1b0d292799) called all three 1 ULP. Root corrected 199.0 to 2 ULP, and the exact bytes govern.

On the guard failure I did not retry, re-export, patch or restore UVs, and I wrote no final pair. Root's `scene-coordination/m4-v01-raw-root-disposition.md` (msg_4abbeff01768) authorizes S's separate exact restorer `m4-v02-restore.py`. It changes exactly three bytes of this raw/parent pair and writes `studio-full-kit-m4-proposal-v02.glb` plus a receipt. The embedded M4 v01 provenance stays unchanged, and v02 names a technical canonicalization, not another Blender revision. My source, helper, editable file, raw, measurements and failed receipt stay frozen.

**Technical v02 pair (S, msg_fe581367a4ec).** I re-hashed the files below on disk on 15 November 2026:

| File | Bytes | SHA256 |
| --- | ---: | --- |
| `exports/studio-full-kit-m4-proposal-v02.glb` | 2,206,200 | `baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f` |
| `manifests/studio-full-kit-m4-proposal-v02.manifest.json` | — | `42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82` |
| `manifests/m4-v02-restoration-receipt.json` | — | `29194ca093280a5113f3aaa91e30d2594b9be7d651bba10a03825520886895a1` |

The restorer is `9f5cb2f5…`. As reported by S and the receipt:
- exactly 3 bytes changed from raw v01;
- source, editable, raw, header JSON and the honest v01 scene tags stay frozen;
- the approved guard AD62627F passes on the actual output, and the unchanged profile validator passes;
- the writer passed 26 checks, and the independent root critic is still pending;
- S's measurement: 2,206,200 B raw, 882,581 B gzip, 683,040 B Brotli.

This is a technical canonicalization, not an art revision and not art or capture acceptance. All geometry in §§2–8 is unchanged by it.

The independent root Codex critic later approved the actual restorer and output (`011d1ebb…`). Root adopted `scene-coordination/m4-v02-restoration-root-disposition.md` (msg_4c1365deae94). That adds no art approval. The v02 GLB `baa1a43b…`, the manifest `42597f1b…` and all sources stay frozen.

## 10. G2–G5 evidence (root request msg_18416833135e / msg_d3da2a888957)

**What existed before this request.** No stage (M2, M3 or M4) has the `render-gates.md` G2–G5 isolated grey turnarounds with a 1 m rule and a prototype comparison. The only earlier Blender stills are the M1 baseline previews and one M2 `home-1440` half-size image. M4 had only the stage ledger (§5) and the geometry and ray measurements (§§3–4).

**Tier-size ledger, done without Blender.** File: `manifests/m4-v01-tier-ledger.json`, SHA256 `63848642fde09d4d5762c9c5054129c22df51f0838bcc8f1b7c450fd80ffae63`. It compares the frozen helper geometry with the `asset-inventory.json` target sizes and with the M1 baseline v02 proxies, which are the prototype sizes. Units: Blender metres = glTF metres; runtime world units = ×2.

| Asset | Target (m) | M4 v01 (m) | Within 3%? |
| --- | --- | --- | --- |
| ctl_body | 0.99 × 0.32 × 0.095 | 0.99 × 0.32; slab 0.095, cheeks 0.099, knobs to 0.104 | width and depth yes; overall height +9.4% |
| ctl_keys | 29.4 mm pitch | 29.4 mm, 3.4 mm gap, 29 + 20 | yes |
| ctl_stand | 0.68 high | 0.564 (ends under the 0.573 controller base) | **no, −17%** |
| ctl_sustain_pedal | 0.10 × 0.26 | 0.10 × 0.26 base | yes |
| stool_keys | 0.50 seat | 0.50 | yes |
| drum_rack | 1.16 wide, 0.75 high | 1.16 between uprights; top bar 0.80; booms to 1.00 | width yes; **height +6.7%** |
| drum_pads | 0.25–0.31 dia | toms 0.27 head / 0.282 rim; snare 0.32 / 0.332 | toms yes; **snare +3–7%** |
| drum_cymbals | 0.38 dia | hi-hat 0.38; crash and ride 0.40 | hi-hat yes; **crash/ride +5.3%** |
| drum_hihat_pedal | 0.13 × 0.33 | 0.126 × 0.30 | width −3.1% (at the limit); **length −9.1%** |
| drum_kick | 0.45 tower | 0.45 | yes |
| drum_module | 0.20 × 0.15 | 0.20 × 0.13 × 0.05 | **height −13.3%** |
| drum_sticks | 0.41 × 1.25 = 0.5125 | 0.51 | yes |
| drum_throne | 0.48 seat | 0.48 (top 0.482) | yes |
| rug | 1.85 × 2.25 | 1.655 × 2.25 (x0 moved off the under-desk decal) | **width −10.5%** |
| music_cables | 6 mm | 6.4 mm | **+6.7%** |

The bold entries are my own design deviations. I report them; I do not pass them. S has granted no waiver, and root is escalating them.

**Bevel class.** Not met as written. M4 follows the M3 rule of explicit vertices with no modifiers, so triangle counts are exact. Edges are split sharp above 40°, and there is no live bevel family.

**Images: not rendered (blocked).** I prepared the M4-only evidence script `source/render_m4_v01_evidence.py`. It opens the frozen `0ae40460` blend and changes it only in memory: it isolates the M4 assets, renders them in grey (Workbench), puts linked copies at 0, 90, 180 and 270 degrees beside a 1 m rule and the imported M1 baseline v02 proxies, and adds a low contact camera. It never saves or exports and refuses to overwrite an output. With the unchanged `render_cam.py`, it was meant to produce:
- two turnaround sheets;
- one contact still;
- three Cycles previews (`music-1440` and `right-down` at 720×450, `music-320-f74` at half size);
- at most two full-size stills.

None has been run. Free RAM was 2.9 of 15.7 GB, below the 5 GB rule in `art-direction.md` §10. Root ended the wait (msg_4c1365deae94) and is escalating a bounded preview scope or a memory exception. No Blender process has started since the v01 export, no other process was touched, and the script is untested. I resume only on root-backed preview guidance.

## 11. Status

Author artifacts are settled, and the v02 pair is recorded in §9. Root's request for G2–G5 evidence (msg_18416833135e / msg_d3da2a888957) is bounded and drawn from the frozen v01 blend; it is in §10. `worker_done` follows once that evidence is finished or blocked. After that I stay retained for review-driven corrections only.
