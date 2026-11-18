# Candidate-v02 asset handoff

15 November 2026. This version replaces the **v01 binding table for implementation planning**, while preserving the original B package. [Profile](profile.example.json), [manifest](manifest.example.json) and [source receipt](source-receipt.json) pin the current v02 design, script and `.blend` by exact SHA-256. `productionReady:false`: the independent verdict is **PASS for the isolated concept only**; Owen's appearance/placement decision, export, allocation and runtime acceptance remain open. No provider, room or readiness evidence was refreshed.

## Bindings and axes

The script's `build_robot` and `KEYED` declarations agree on **eight moving nodes**. `APR_lid_upper` is absent from object construction, not merely hidden; unused upper-lid helper constants do not create a node. There are 19 authored master objects including four illustrative cards; the source inventory excluding those cards has 15 nodes, including the root and gaze empties. These are source-structure counts, not GLB node, face or draw measurements.

| Moving node | Parent | Source-local pivot, Blender metres | Signed authored motion -> glTF axis |
| --- | --- | --- | --- |
| `APR_root` | none in asset; external placement wrapper | `[0,0,0]` | +Z lift -> +Y |
| `APR_head` | `APR_root` | `[0,0,0.018]` | X pitch / Y roll / Z yaw -> X / -Z / Y |
| `APR_eyes` | `APR_head` | `[0,0,0.08]` | X pitch only -> X; no sideways gaze |
| `APR_lid_lower` | `APR_eyes` | `[0,0,0]` | Smile uses negative X -> negative X |
| `APR_body` | `APR_root` | `[0,0,-0.018]` | X pitch / Z yaw -> X / Y |
| `APR_fin_L` | `APR_body` | `[0.102,0,-0.028]` | Forward -X, splay -Y -> -X, +Z |
| `APR_fin_R` | `APR_body` | `[-0.102,0,-0.028]` | Forward -X, splay +Y -> -X, -Z |
| `APR_tray` | `APR_root` | `[0,0,-0.228]` before pose delta | X tilt -> X; author Y/Z translation -> glTF -Z/Y |

Static bindings remain `APR_visor`, `APR_ear_L/R` under head; `APR_eye_L/R` under eyes; `APR_badge` under body; `APR_tray_glow` under tray. The JSON gives all parents and source pivots. Preserve these bindings for the candidate; any cleanup merge needs an explicit updated map. Do not infer exported transforms from the unexported `.blend`.

Eye origins from `shell_point` are X=`+/-0.0342048`, Y≈`-0.077158`, Z=0 in gaze space, giving **0.0684096 m** centre spacing. A's 0.068 m and +/-0.0342 are rounded descriptions, not a new spacing conflict. The lower lid's zero local pivot is already at the head centre through its parent; adding another 0.08 would be wrong.

Keep B's conversion `g=[X,Z,-Y]`, then `world=anchor+R*(2*g)` once. Forward -Y becomes +Z; L is the character's +X. Transform rotations by basis conjugation, not Euler component shuffling. Anchor and wrapper rotation stay `null`: root-facing-eye is R1's placement assumption, not a baked world transform, appearance approval or room/camera movement authority.

## Runtime boundary and material scope

D1 selects **neutral articulated geometry plus finite runtime poses**, with no demonstration clips, source-card meshes, sheet copies, lights or cameras exported. Imported ring/lid geometry and materials remain loader-owned; the presentation owner controls their transforms and glow scalar, and owns generated marker resources and scheduling. No second owner disposes imported resources. A later eye-technique change requires a revised profile; the room's animation-free profile is untouched.

Carried tray: local `[0,0,-0.228]`, X=6 degrees. Presented tray: local `[0,-0.03,-0.242]`, X=20 degrees; root lift is separate. Waiting/resubmit/zero-hit retrieval remain carried; a current 1-4-hit retrieval presents all N marks together; zero hits present empty only after valid abstained answer. Contradictory answers or >4 hits fail and clear all views. Marks are display-only, selected through HTML by current run/source/chunk identity, and clear on the next visible rendered frame without an exit tween. Selected-card lift/scale remains an unresolved optional cue, not baked motion or clickable geometry. See [D1](../../integration-decisions.md) and [state contract](../../integration/state-contract.md).

A specifies **five intended imported materials**: shell, ink, accent, eye emission and one runtime-adjusted tray glow; all opaque, no textures. The script actually creates eight datablocks: those first four, separate glow-dim/glow-lit, runtime-card material and review backdrop. Cleanup must consolidate the two glow variants to the intended `MAT_APR_tray_glow`; that final name/material is not yet present in the source. Exclude card/backdrop materials and retain no count claim about the eventual export. Emission tuning and single-sided lid finish still need the real-room check.

## Held clearance arithmetic

The proposed **0.42 x 0.28 x 0.52 m** box at Blender centre `[0,-0.012,-0.04]` spans X `[-0.21,0.21]`, Y `[-0.152,0.128]`, Z `[-0.30,0.22]`. In glTF its centre is `[0,-0.04,0.012]`, dimensions `[0.42,0.52,0.28]`, min `[-0.21,-0.30,-0.128]`, max `[0.21,0.22,0.152]`; these are converted proposal bounds, not measured export bounds.

Using the source tray radius 0.118 and half-thickness 0.004, half-depth is `r*cos(tilt)+halfThickness*sin(tilt)`. Carried is ±0.117771698; presented is `[-0.142251810,0.082251810]`. Their union is **[-0.142251810,0.117771698]**, agreeing with A's rounded -0.142..+0.118. The chosen box leaves **9.748 mm front / 10.228 mm rear**; a -0.03 centre would cut the carried rear by 7.772 mm. Reported fin X=-0.192 leaves 18 mm; reported Z extrema -0.286/+0.206 leave 14 mm each. Those extrema are A's held-pose evidence, not a new Blender measurement. Full swept bounds, easing overshoot and optional selected-mark enlargement remain `null`/unverified.

## Exact remaining alignment notes

- **Author text cleanup, nonblocking:** `design-spec.md:208,282` still calls pose blending/cards a future step-D choice, and `apprentice/README.md:79` retains “baked or runtime cards”. D1 decision 5 already selects runtime poses and generated marks. This handoff follows D1; A owns correcting those residual lines. It does not reopen the isolated concept verdict.
- **Production cleanup, not a source defect:** glow-dim/glow-lit are intentionally separate blockout materials; the five-material export intent needs an explicit consolidation. The single-sided lid and clean visor outline remain finish requirements.
- **Root/author decisions:** appearance, R1/anchor and panel relationship, optional selected-card cue, exact export candidate/profile freeze, measured assistant allocation and full swept bounds. Provider production and real-room/browser validation remain later work.

[Validation receipt](validation.json) checks JSON, local references, source/passport hashes, the script's node/parent and moving-node declarations, arithmetic and preservation of all 11 original B files. It does not open Blender, validate a GLB, run the app or certify motion/visual/performance behavior. Reproduce with `node design/assistant/robot/asset-pipeline/v02/verify-v02.mjs`.
