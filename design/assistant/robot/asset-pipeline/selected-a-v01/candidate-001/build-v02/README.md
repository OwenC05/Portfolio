# Selected A / candidate 001 / build v02

16-17 November 2026. Repaired candidate for independent Claude visual and Codex technical review. productionReady remains false. All authored files and outputs are confined here; v01's 37 files and frozen upstream inputs match their hashes. No paid call, application/public asset, shared Blender, preview4193, dependency or Git change.

[Review response](review-response.md) maps every named repair. [Neutral sheet](neutral-contact-sheet.png), [five poses](five-poses.png), [browser face](viewer/webgl-neutral-face.png), [browser side](viewer/webgl-neutral-side.png) and [real room harness](viewer/webgl-room-desktop-home.png) are the quickest review path.

## Asset and binding result

GLB SHA-256 **bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270**. Editable blend SHA-256 **80704c8f2989683dffa59f9616b1ef146eab944f7d05ae0e0bf55e1964bc508e**. Full output/input hashes are in [files.json](files.json); manifest pins source, profile, poses and exporter.

| Measured exported cost | Result |
| --- | ---: |
| Triangles / serialized vertex records | 37676 / 19131 |
| Semantic nodes / moving bindings | 22 / 10 |
| Meshes / primitives / materials | 21 / 21 / 7 |
| Raw / gzip level9 / Brotli q11 bytes | 673268 / 483001 / 335697 |
| Textures / clips / skins / cameras / lights | 0 / 0 / 0 / 0 / 0 |

These are asset costs, not a room allocation or renderer draw-call budget. V01 was 18330 triangles / 328960 raw bytes; smoother head/face, detailed integrated lids and bookmark repairs increase cost. No allocation has been invented.

All 22 names and parents remain. Both lower-lid pivots now lie at the face ellipsoid's YZ centre for an independent local-X hinge; they no longer use translation. Numeric local Blender/glTF TRS and angles are in [profile.json](profile.json) and [poses.json](poses.json). Neutral coverage is 20%; dismissal centre coverage 33.39%. Head/body gap root, metres, +Z up/-Y forward and glTF [X,Z,-Y] remain; uniform source scale 0.6029863301787592 m/raw unit is provisional. No placement or floor offset is baked in.

Meshy provenance is unchanged for the body and two mitten sources; the head retains its fitted Meshy rear samples, repaired front loft and one smoothing subdivision. Native face/eyes/lids/rim/seam/post/ribbon/cap/tray repairs are disclosed in [retained-mesh.json](retained-mesh.json). Raw island diagnosis is the frozen v01 receipt, not a newly invented segmentation claim.

## Fresh validation

[validation.json](validation.json) checks the binary, allowed attributes/extensions, accessor bounds, finite unit TRS, named hierarchy/poses, materials, basis conversion and actual exported pupil/highlight geometry. It independently recomputes 1025 runtime-glTF samples and rejects contradictory declared bounds. [validator-probes.json](validator-probes.json) records **1 accepted valid control + 9 rejected invalid cases**, including all seven previously missed cases. [Editable parity](editable-validation.json) reexports byte-identically from the saved blend; [reimport](reimport-validation.json) verifies names, parents, materials and transforms with max translation error 0 m, and 45 major-mass samples with zero triangle intersections. Blender 5.2.3 LTS, build e13b728c6880.

Neutral glTF AABB metres: min [-0.139278, -0.235997, -0.13388], max [0.13788, 0.345654, 0.126339]. Conservative continuous **Blender** sweep: min [-0.156112, -0.153851, -0.277455], max [0.157246, 0.135787, 0.357072], sample padding 1.394 mm. Actual pupil projected ellipse max 0.475301 < 1; sampled lid gap 5.776 mm and conservative gap 5.575 mm. Highlights remain inside pupils.

The sweep covers one common interpolation parameter between each authored endpoint pair, using translation lerp and shortest quaternion slerp. It excludes intermediate-to-third interruption, independent node clocks, added gaze/lid offsets, scale changes and runtime cards. BVH samples do not certify continuous collision clearance or visual gaps. G2 must bound its implemented interruption/marker policy separately.

## Viewed evidence and material check

Final source neutral front/three-quarter/side/back, source/no-match tray gaps, five-pose sheet and reimport front were viewed. Cycles uses the exact v01 cameras, 640x800, orthographic .67, same three studio lights and AgX. [Browser receipt](viewer/webgl-evidence.json) pins the actual GLB, Three r187/GLTFLoader identities, Intel UHD ANGLE WebGL renderer, sRGB, ACESFilmic exposure1.2, each camera, room lights and private geometry/material IDs. It uses three locally transpiled current room source modules plus the real pilot/adapter; no app build. No bloom or environment map. Eye cream is visibly brighter than sampled porcelain; ribbon is red, the floor brass, and pupils/highlights remain legible in closeups. These are author observations awaiting independent visual recheck.

The viewer uses root's **provisional** P2 anchor [0.80,2.80,-0.20], normalized yaw quaternion, and one wrapper1.6 = 2 world-units/metre times .8 art scale. Inspection cameras are labelled; the 1440x900 room view uses the actual fixed eye and desktop-home orientation. No mobile, UI/backdrop, transport, interaction or main-app acceptance follows. [Source receipt](viewer/source-receipt.json) pins the room modules and renderer sources. The owned loopback4195 process PID 22076 closed at 2026-11-17T14:00:48.7605572Z; [lease](viewer/lease.json) and [port/process check](viewer/lease-release.json) hand the slot back.

## Runtime handoff and remaining work

Opaque meshes block picking; neither cast nor receive shadows. Dispose the private 21 geometry identities and seven material identities once; runtime markers/clones belong to their own owner. Eye discs share a material, highlights share another, tray emission is separate. The tray imports with emissive colour already multiplied by .10 and intensity1: preserve that product, or use base linear colour times target authored strength. Never assign .10 directly to the imported intensity. Its decorative strength is constant in every pose. Live 0..4 source marks remain unbaked and immediate from the shared validated snapshot; no generation or permanent idle loop is introduced.

[Placement check](placement-check.json) recomputes the new conservative box: wall-light angular margin **-0.986 degrees**, TypeForge 1.749, speaker 0.509. The negative light margin is a conservative overlap warning, not proven silhouette collision; no anchor acceptance or room adjustment is made. Root/G2 must resolve actual swept silhouette, runtime cards, combined costs and phone discovery. Claude must independently recheck the repairs; technical review must assess the changed geometry, hinge contract and validator.

## Reproduce inside this directory

Use the installed executable C:/Program Files/Blender Foundation/Blender 5.2/blender.exe with --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python build_asset.py -- --renders final. Then run node validate_asset.mjs, node probe-validator.mjs, the same isolated Blender command with reimport_validate.py and check_editable.py, make_sheets.ps1, and node placement_check.mjs. Viewer: node prepare_viewer.mjs, verify4195 free, node viewer-server.mjs, open one owned isolated tab, capture actual GLB; send stop on that process stdin and verify lease closure. No install is needed. Run node finalize_report.mjs only after fresh browser/lease receipts are present. JSON/scripts and output links are validated in the final receipt.
