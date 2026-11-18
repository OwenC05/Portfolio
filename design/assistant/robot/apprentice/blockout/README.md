# Apprentice blockout: scene passport and render recipe

15 November 2026. Claude design lane, package A. Primitive blockout for design review. It is not a production asset, not approved and not independently reviewed.

## What was actually done

- **Rendered, and viewed by me:** yes. All 25 PNGs in [renders/](renders/) came from this file in one final run, and I looked at each of them.
- **Tool:** the Higgsfield "use Blender" local server, which runs its own background Blender. `bl_health` reported Blender 5.2.3 LTS, an untitled startup file, not dirty, holding only the default Cube, Light and Camera.
- **Isolation:** I read the server's scene, scene-spec, modeling, lookdev, animation, lighting-camera and volatile modules before the first change. I removed the three default objects from that untitled file and built the robot there. I did not open, change or save any other project, and no desktop Blender window or other team's scene was involved.
- **Saved:** only to this directory, under root's authorisation for my assigned output paths.
- **Not done:** no hosted Higgsfield 3D scene, no image or model generation, no credits, no room geometry, no Studio camera or asset changed.

| File | SHA-256 |
| --- | --- |
| [apprentice-blockout.blend](apprentice-blockout.blend) | `a580620ffbcc23449738bb2ef7ee8db7b2b2f82dd4af3b06babc45f8933b047b` |
| [build_apprentice_blockout.py](build_apprentice_blockout.py) | `19cadc39e8f2e722ef6ffbdc76e698499778a2a465d8070d73641562a3eb7b90` |

The `.blend` was built by exactly this version of the script. A rebuild gives the same scene but a different file hash.

## Rebuild

Headless, no add-ons, no network:

```sh
blender -b --factory-startup -P build_apprentice_blockout.py -- --out <output directory>
```

Add `--no-render` to build and save only. I ran the script through the background session, not this command line, so the command-line entry is syntax-checked (`python -m py_compile`) but not executed. The script refuses to run if a different saved project is open.

It needs Blender with the `BLENDER_EEVEE` engine id (true for 5.2.3; some 4.x builds name it `BLENDER_EEVEE_NEXT`).

## Scene passport

```text
SCENE
- intent: single-character blockout of the Studio apprentice for shape, pose and legibility review
- deliverable: .blend, authoring script, still renders
- units: metres; right-handed Z up; character faces -Y; L = +X (character's own left)
- render: BLENDER_EEVEE, 32 samples, Standard view transform, PNG; 30 fps; frames 0-230
- dynamic: yes. Keyed blocking on APR_master only; sheet copies are static

HIERARCHY
- naming: APR_<part> for the master; APR_<part>.<pose> for sheet copies; CAM_, LGT_, ENV_, MAT_ prefixes
- collections: APR_master, APR_sheet_<pose> x7, APR_env_standin, APR_cameras
- parents: see design-spec.md section 4
- protected existing objects: none (new file)

ASSETS (all route BLOCK, fidelity blockout)
- APR_root      empty, hover root at 0,0,0
- APR_head      0.21 x 0.16 x 0.16, origin at head base, +0.018
- APR_visor, APR_ear_L/R, APR_eyes (empty), APR_eye_L/R, APR_lid_upper/lower
- APR_body      0.15 x 0.12 x 0.15, origin at body top, -0.018
- APR_badge, APR_fin_L/R (hinge origins at +/-0.102, 0, -0.028 in body space)
- APR_tray      0.236 outer, origin at centre, -0.215
- APR_tray_glow, APR_card_1..4 (stand-ins for runtime-generated marks)
- sheet copies at y = -20, 0.46 apart; ENV_backdrop_* are flat stand-ins, not Studio geometry

SHOT
- CAM_turn_front, CAM_turn_side   orthographic, scale 0.56
- CAM_turn_34                     perspective, 22 degrees, slightly above
- CAM_sheet                       6.2 degrees from 7 m, 0.10 below the hover root
- CAM_pose                        20 degrees from 1.6 m, moved to each sheet copy
- CAM_proxy_desktop_58            58 degrees vertical, 2.441 m in front, 0.125 below
- CAM_proxy_phone_64              64 degrees vertical, same position

LOOK
- six flat Principled materials, no textures; palette in design-spec.md section 5
- backdrop #7C7350 matte, a guess at the lit acoustic panels
- world #B8AE9A at 0.45

LIGHTING
- LGT_key   sun 2.6, warm, from upper front-left of the viewer; casts shadows
- LGT_fill  sun 0.6, cool, from front-right; no shadows
- review lighting only; it is not the Studio's lighting

MOTION
- 30 fps; markers: idle 1, attention_greet 20, attention 35, sources_glance 56, sources 66,
  dismissal 108, idle_return 126, attention_b 150, empty_glance 156, no_match_shrug 170, no_match 182
- keyed: root location; head, eyes, lids, body, fins rotation; tray location and rotation; card scale
- not keyed: tray glow level (two materials, assigned per render)

ACCEPTANCE (this pass)
- structural: named parts, parents and origins match design-spec.md section 4  -> checked by readback
- motion: sampled frames 15, 25, 57, 62, 104, 176                              -> viewed
- visual: eyes, gap, fins and tray read at the phone proxy size                -> viewed; see findings
```

## Renders

| Files | Camera | Size | Shows |
| --- | --- | --- | --- |
| `turnaround-front.png`, `-side.png`, `-three-quarter.png` | `CAM_turn_*` | 900x900 | Neutral pose, frame 0 |
| `state-sheet-five-poses.png` | `CAM_sheet` | 2400x760 | Idle, attention, sources, no match, dismissal |
| `pose-<name>.png` x7 | `CAM_pose` | 800x1000 | Each sheet copy, including one-hit and glance |
| `proxy-desktop-1440x900-fov58-<state>-crop240.png` x4 | `CAM_proxy_desktop_58` | 240x240 crop of a 1440x900 frame | Robot at computed desktop size |
| `proxy-phone-390x844-fov64-<state>-crop240.png` x4 | `CAM_proxy_phone_64` | 240x240 crop of a 390x844 frame | Robot at computed phone size |
| `timeline-f<frame>.png` x6 | `CAM_turn_34` | 500x500 | Parts in transit on the keyed timeline |

The proxy crops are made by Blender's render border at native resolution. No image was resized or edited afterwards.

**What the proxies are and are not.** They use production's two lenses and a distance of 2.441 m, which I computed from the fixed eye and an estimated zone A anchor. They contain no room, no UI, no real lighting and no occlusion. They show how big the robot's features are in pixels, not how it looks in the Studio.

## Findings from viewing

- The three masses, the gap, the ring eyes and the tray read at both proxy sizes.
- Four cards can be counted at phone size. The larger first card cannot be told apart there.
- The no-match pointing fin reads at both sizes. The fin angled toward the tray in the sources pose is faint.
- The idle half-lid reads slightly stern at proxy size.
- Lid plates show as a faint step on the visor in close-ups, and the visor edge is slightly faceted. Both are blockout artefacts.
- Measured: neutral bounds 0.264 x 0.231 x 0.425 m; widest pose 0.342 m; tallest 0.462 m; 13,132 triangles on the master, not optimised.

## Build history

Three things failed on the way and were fixed in the script: the state-sheet camera first framed the master instead of the sheet row; flat eye rings poked through the lids; and with a flatter head the rotating lids cut into the eyes, which is why head depth now equals head height.
