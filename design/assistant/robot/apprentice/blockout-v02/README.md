# Apprentice blockout v02: scene passport and render recipe

15 November 2026. Claude design lane, package A, repair task `task_a15de6eea874`. Primitive blockout for design review. It is not a production asset and not approved. The later independent recheck passed v02 as an isolated concept only: [../../review/blockout-v02/review.md](../../review/blockout-v02/review.md).

v02 answers the review of v01 at [../../review/blockout-v01/review.md](../../review/blockout-v01/review.md). The v01 file, script, passport and 25 renders are untouched in [../blockout/](../blockout/README.md).

## What was actually done

- **Tool:** the Higgsfield "use Blender" local server, which runs its own background Blender, version 5.2.3 LTS.
- **Ownership check before writing:** I did not assume the session was still mine. `bl_health` and the scene summary showed an untitled startup file, not dirty, holding only the default Cube, Light and Camera, so the v01 scene was no longer loaded and no one else's work was in it. I read the server's scene, modeling, lookdev, animation, lighting-camera and volatile modules again before the first change.
- **Isolation:** the robot was rebuilt in that untitled file from the v02 script and saved only to this directory. I did not open, change or save any other project. The v01 `.blend` was not opened.
- **Not done:** no hosted 3D scene, no image or model generation, no credits, no room geometry, no change to the Studio or the application.

| File | SHA-256 |
| --- | --- |
| [apprentice-blockout-v02.blend](apprentice-blockout-v02.blend) | `ac48061fa08e53008be541e14f9e970c1bef9710089804c9fac17a683e1d7e1c` |
| [build_apprentice_blockout_v02.py](build_apprentice_blockout_v02.py) | `2fd5ecdf58dd9d0298eddee2beea5af613189bbe2836dbe87f1b73b26fc6709b` |

After saving I read the open file back: path is this `.blend`, not dirty, 165 objects, tray and eye positions equal to the script's values, no upper-lid object. A rebuild gives the same scene but a different file hash.

v01 hashes, rechecked after the v02 work and unchanged: `.blend` `a580620f…b047b`, script `19cadc39…7b90`, passport `a4f2955a…330c`.

## Rebuild

```sh
blender -b --factory-startup -P build_apprentice_blockout_v02.py -- --out <output directory>
```

Add `--no-render` to build and save only. I ran the script through the background session, not this command line, so the command-line entry is syntax-checked (`python -m py_compile`) but not executed. It needs the `BLENDER_EEVEE` engine id (true for 5.2.3).

## Changes from v01

| Change | Value | Review item |
| --- | --- | --- |
| Upper lid removed | No `APR_lid_upper` object. Idle shows two whole rings | 1, lid seam |
| Idle head turn | 12 degrees, was 22 | 1 |
| Eyes closer together | Centres 0.068 apart, was 0.087 | 1 |
| Visor wider | Half-width 0.84 of the head's, was narrower | 1 |
| Eye rig pitch only | No sideways slide | 1 |
| No-match pose mirrored | Fin R (viewer's left) points; head roll +8 | 2 |
| Tray has two positions | Carried: z -0.228, tilt 6. Presented: z -0.242, 0.03 forward, tilt 20 | 5, 6 |
| Cards switch in one frame | All on at frame 51, all off at frame 101. No scale tween, no stagger | 3 |
| Tray glow strip on the inner edge; cards a matte cream | Cards no longer merge with the glow or outshine the eyes | Lower-priority note |
| Sources pose | Two open fins. The "fin toward the tray" gesture is dropped | Lower-priority note |
| Two oblique cameras | 35 degrees toward the character's right, phone lens and close | Evidence gap |
| Fins-hidden phone renders | Attention and no match | 5 |

A few constants for the removed upper lid remain in the script, unused.

## Scene passport

```text
SCENE
- intent: single-character blockout of the Studio apprentice for shape, pose and legibility review
- deliverable: .blend, authoring script, still renders
- units: metres; right-handed Z up; character faces -Y; L = +X (character's own left, viewer's right)
- render: BLENDER_EEVEE, Standard view transform, PNG; 30 fps; frames 0-230
- dynamic: keyed blocking on APR_master only; sheet copies are static

HIERARCHY
- APR_<part> for the master (19 objects); APR_<part>.<pose> for sheet copies
- parents and origins: design-spec.md section 4

SHOT
- CAM_turn_front, CAM_turn_side   orthographic
- CAM_turn_34                     perspective three-quarter, slightly above
- CAM_sheet, CAM_pose             state sheet and single poses
- CAM_proxy_desktop_58            58 degrees vertical, 2.441 m in front, 0.125 below the root
- CAM_proxy_phone_64              64 degrees vertical, same position
- CAM_oblique35_phone_64          same distance and height, 35 degrees round toward the character's right
- CAM_oblique35_close             same direction at 0.66 of the distance, 20-degree lens

LOOK
- materials: shell, ink, accent, eye emissive, tray glow dim, tray glow lit, card, backdrop stand-in
- backdrop #7C7350 matte, a guess at the lit acoustic panels; review lighting only

MOTION
- keys: 0 neutral; 1-10 idle; 20-29 greeting; 35-50 attention (waiting); 51 cards on;
  56-58 glance; 64-100 sources; 101 cards off; 108-114 dismissal; 126-140 idle;
  150 attention; 156-158 glance at empty tray; 166-172 shrug; 184-230 no match
- tray glow level is not keyed (two materials, assigned per render)
```

## Renders

49 PNGs in [renders/](renders/), all from the final build.

| Files | Size | Shows |
| --- | --- | --- |
| `state-sheet-five-poses.png` | 2400x760 | Idle, attention, sources, no match, dismissal |
| `turnaround-front.png`, `-side.png`, `-three-quarter.png` | 900x900 | Neutral pose |
| `pose-<name>.png` x7 | 800x1000 | idle, attention, sources, sources-1, sources-glance, no-match, dismissal |
| `front-<state>.png` x5 | 700x700 | Each state, orthographic front |
| `three-quarter-<state>.png` x5 | 700x700 | Each state from the three-quarter camera |
| `proxy-phone-390x844-fov64-<state>-crop240.png` x5 | 240x240 crop of 390x844 | Robot at computed phone size, head-on |
| `proxy-desktop-1440x900-fov58-<state>-crop240.png` x5 | 240x240 crop of 1440x900 | Robot at computed desktop size, head-on |
| `oblique35-phone-390x844-fov64-<state>-crop240.png` x5 | 240x240 crop of 390x844 | Phone size, 35 degrees oblique |
| `oblique35-close-<state>.png` x5 | 700x800 | Same direction, close |
| `diag-fins-hidden-phone-attention-crop240.png`, `-no-match-` | 240x240 crop | Phone size with both fins hidden |
| `timeline-f015`, `f025`, `f051`, `f057`, `f101`, `f176` | 500x500 | Keyed timeline samples |

`<state>` is idle, attention, sources, dismissal, no-match. Crops are made by Blender's render border at native resolution. No image was resized or edited afterwards.

**What the proxies are and are not.** They use production's two lenses and a distance of 2.441 m, computed from the fixed eye and an estimated zone A anchor. The robot is at frame centre. They contain no room, no UI, no real lighting and no occlusion.

## Measured, from the saved file

Gap between the body's lowest point and the tray beneath it, projected through each camera:

| Pose | Phone head-on | Phone oblique | Desktop head-on | Three-quarter (700 px) |
| --- | --- | --- | --- | --- |
| Idle, attention, dismissal (tray carried) | 11.0 px | 11.4 px | 13.3 px | 11.7 to 12.5 px |
| Sources | 7.7 px | 8.1 px | 9.3 px | 9.5 px |
| No match | 7.7 px | 8.0 px | 9.2 px | 9.1 px |

Bounds: neutral 0.264 W x 0.236 D x 0.422 H. Widest pose 0.342 (no match). Tallest 0.477 (sources). 12,852 triangles on the master, counted at the first v02 build; later changes moved the tray only. Not optimised; not a budget claim.

## Viewed

I looked at these after the final build: the state sheet; three turnarounds; all seven pose renders; all five phone proxies; all five oblique phone proxies; both fins-hidden renders; three-quarter idle, sources and no-match; oblique-close idle, sources and no-match; the desktop sources proxy; all six timeline frames.

**Not viewed:** the five `front-*` renders; desktop proxies for idle, attention, dismissal and no-match; three-quarter attention and dismissal; oblique-close attention and dismissal.

What I saw:

- Idle shows two whole rings from the front, three-quarter and oblique views. No lid edge crosses the eyes. It reads as neutral and friendly to me.
- The no-match fin points to the viewer's left in the head-on and oblique views.
- Backdrop is visible between the body and the tray in every pose I viewed.
- With the fins hidden, waiting (thin flat hoop) and no match (open empty oval, lower) are easy to tell apart at phone size.
- The goodbye smile reads at phone size.
- Four cards can be counted head-on at phone size. They no longer merge with the glow.

## Limitations

- **Oblique sources view:** the two cards on the far side overlap, so the count is unclear from 35 degrees. This matters if the robot is not turned to face the eye.
- **Far eye in three-quarter views:** whole, but a narrow oval.
- **Visor highlight** from the review lights is still there. Visor lower edge is slightly ragged in close-ups.
- **Eyes are closer set** than v01. This changes the face and is a judgement for Owen.
- **Stills only.** No motion, app, runtime or browser test. The timeline is a blocking reference. The resubmit and stopped transitions are not keyed.
- **Cards are static illustrations** placed by the script. Nothing is bound to real retrieval.
- **Stand-in backdrop and lighting**, estimated anchor, robot at frame centre. Not the Studio.
- **Lid** is a single-sided sheet.
