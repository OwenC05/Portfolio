# Selected A build v03: eye emission only

17 November 2026. Candidate for Claude's narrow eye-material recheck; productionReady:false. [The v02 visual PASS](../../../../review/build-v02/visual/review.md) remains bounded to isolated appearance. Its optional low findings are deferred.

**Selected strength: 1.0**, down from 4.0 on MAT_APA_eye_emit. The linear base colour remains [1, 0.8713670969, 0.5972017646]. Pupils, highlights, geometry, poses, cameras, lights and placement are unchanged.

## Browser comparison and final captures

All three requested scalars were applied to the actual imported frozen v02 GLB in the same viewer, before exporting the chosen value. [Comparison sheet](viewer/emission-comparison.png), [receipt](viewer/comparison.json) and full-size eye-strength images retain the evidence. Representative sRGB pixels at the same face-camera coordinates:

| Strength | Left eye RGB | Right eye RGB |
| --- | --- | --- |
| 4, v02 baseline | 252,251,248 | 252,251,248 |
| **1, selected** | **244,239,228** | **243,239,229** |
| 1.25 | 245,241,233 | 245,242,233 |
| 1.5 | 246,243,236 | 246,243,236 |

Strength 1 is the warmest of the tested values and retains bright readable eyes and clear pupils/highlights. It is still paler than the illustration and does not hit the suggested RGB exactly; no unassigned colour or lighting change was made. Claude must judge whether this degree of warmth is sufficient.

Fresh captures load the **delivered v03 GLB**, with its native imported intensity1 and no comparison override: [face closeup](viewer/webgl-neutral-face.png), [room neutral](viewer/webgl-room-neutral.png), and [five room-pose crops](viewer/room-pose-crops.png). The five full 1440x900 room images are retained separately. All five were inspected in the crop sheet; the face and full attention frame were also inspected at useful size. No visible wall-light silhouette overlap appears at these five static endpoints. The existing negative conservative swept-box margin remains unresolved; these images do not certify between-pose or interrupted motion.

[WebGL receipt](viewer/webgl-evidence.json) records asset hash, cameras, current lights, imported materials and resource identities. Three r187, Intel UHD ANGLE, sRGB, ACESFilmic exposure1.2; current room modules, pilot and renderer sources have the same hashes as v02. [Source pins](viewer/source-receipt.json) and finalize.mjs verify those identities, unchanged camera/lighting/placement and every non-eye material field. Anchor [0.80,2.80,-0.20], normalized yaw [0,-0.19612,0,0.98058], wrapper1.6 = 2 times provisional .8 remain. No floor offset or room movement.

## Narrow identity and validation

- GLB SHA-256: **65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12**.
- Blend SHA-256: **0668d1492f34b9b4488a0118bb90339aefaa2551d818ff56db3f407ae33aea46**.
- [Delta receipt](delta-validation.json): every binary buffer byte is identical to v02, including all vertex, normal and index payloads; per-payload hashes are included. Every GLB JSON field is identical except the eye-strength extension (4 to default1) and removal of its now-unused top-level extension declaration. Hierarchy, transforms, accessors, other materials and geometry are unchanged.
- [poses.json](poses.json) is byte-identical to v02, SHA-256 6dd7ce35a027352b4f2cffbe673081910837e69d56c9f4ec866e970381c6e96d. Profile differences are limited to version/status, eye strength and updated file identities/encoded-size measurements.
- [Editable validation](editable-validation.json): saved v03 blend reexports byte-for-byte to delivered GLB using Blender 5.2.3 LTS, e13b728c6880. [Manifest](manifest.json) references are verified against actual bytes.

Measured export: **673144 raw / 482957 gzip9 / 334311 Brotli11 bytes**; 37676 triangles, 19131 serialized vertex records, 22 nodes / 10 moving bindings, 21 meshes/primitives, seven materials, no textures or animation. The 124-byte raw reduction is JSON extension metadata, not geometry optimization.

Geometry, pupil/lid, collision, pose-envelope and negative-probe tests were **not rerun or relabelled**. Their immutable v02 paths/hashes are explicitly carried in delta-validation.json and manifest.json, justified by exact geometry, hierarchy and pose identity. This is an emission-only delta validator PASS, not new broad technical acceptance. No old Cycles renders were copied or passed off as fresh v03 evidence.

## Reproduce and handoff

From this directory, run the installed Blender executable with --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python build_eye.py; it opens the pinned v02 blend, changes only Emission Strength, saves/exports v03 and updates the eye baseline in the profile. Run node validate_delta.mjs and the same isolated Blender flags with check_editable.py. No full regeneration or package installation is needed. The comparison selection is pinned in viewer/comparison.json; poses stay byte-identical.

Viewer reproduction uses prepare_viewer.mjs and viewer-server.mjs after checking4195 free; /?baseline=1 loads frozen v02 for scalar comparisons and / loads actual v03. Capture code uses only finite poses. Fresh evidence and report completion are verified by node finalize.mjs. [Input receipt](input-receipt.json) freezes 77 upstream files, including all v02 files, and [files.json](files.json) pins this handoff.

Owned viewer PID 37052 and its tab are closed; [release evidence](viewer/lease-release.json) confirms no listener on4195 and no owned process. No application/public assets, .next, shared Blender, dependencies, Git or paid tool were changed. The isolated viewer does not establish UI, mobile, cards, motion/interruption, combined scene cost, final placement or runtime approval.
