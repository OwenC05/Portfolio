import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const B=path.dirname(fileURLToPath(import.meta.url)),V=path.resolve(B,'../build-v02'),repo=path.resolve(B,'../../../../../../..');
const read=(dir,n)=>JSON.parse(fs.readFileSync(path.join(dir,n))),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const d=read(B,'delta-validation.json'),e=read(B,'editable-validation.json'),w=read(B,'viewer/webgl-evidence.json'),oldW=read(V,'viewer/webgl-evidence.json'),m=read(B,'manifest.json'),lease=read(B,'viewer/lease.json'),release=read(B,'viewer/lease-release.json');
assert.equal(w.assetSha256,d.exportSha256);assert.equal(e.candidateSha256,d.exportSha256);assert.ok(e.exactBytesEqual);assert.equal(lease.status,'closed');assert.ok(release.listenerAbsentAfter&&release.processAbsentAfter);
assert.deepEqual(w.lights,oldW.lights);for(const key of ['outputColorSpace','toneMapping','exposure','anchorWorld','anchorQuaternion','effectiveWrapperScale','worldUnitsPerMetre','provisionalArtScale'])assert.deepEqual(w[key],oldW[key],key);
assert.equal(w.materials.find(x=>x.name==='MAT_APA_eye_emit').emissiveIntensity,1);
for(const x of w.materials){const old=oldW.materials.find(y=>y.name===x.name);const normalized=structuredClone(x);if(x.name==='MAT_APA_eye_emit')normalized.emissiveIntensity=4;assert.deepEqual(normalized,old);}
const face=w.captures.find(x=>x.view==='face'),oldFace=oldW.captures.find(x=>x.view==='face');for(const key of ['camera','cameraQuaternion','fov','viewport'])assert.deepEqual(face[key],oldFace[key]);
const oldRoom=oldW.captures.find(x=>x.view==='room');for(const capture of w.captures.filter(x=>x.view==='room'))for(const key of ['camera','cameraQuaternion','fov','viewport'])assert.deepEqual(capture[key],oldRoom[key]);
assert.deepEqual(w.pageErrors,[]);assert.equal(w.captures.length,6);
const sources=read(B,'viewer/source-receipt.json'),oldSources=read(V,'viewer/source-receipt.json');assert.deepEqual(sources.inputs,oldSources.inputs);
for(const input of sources.inputs)assert.equal(sha(path.join(repo,input.path)),input.sha256);
for(const input of read(B,'input-receipt.json').files)assert.equal(sha(path.resolve(B,input.path)),input.sha256,'Frozen input changed');
for(const key of ['export','editable','profile','poses','script','delta'])assert.equal(sha(path.join(B,m[key].path)),m[key].sha256);
const values=d.measurements;
const text=`# Selected A build v03: eye emission only

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

- GLB SHA-256: **${d.exportSha256}**.
- Blend SHA-256: **${e.sourceBlendSha256}**.
- [Delta receipt](delta-validation.json): every binary buffer byte is identical to v02, including all vertex, normal and index payloads; per-payload hashes are included. Every GLB JSON field is identical except the eye-strength extension (4 to default1) and removal of its now-unused top-level extension declaration. Hierarchy, transforms, accessors, other materials and geometry are unchanged.
- [poses.json](poses.json) is byte-identical to v02, SHA-256 ${d.posesSha256}. Profile differences are limited to version/status, eye strength and updated file identities/encoded-size measurements.
- [Editable validation](editable-validation.json): saved v03 blend reexports byte-for-byte to delivered GLB using Blender 5.2.3 LTS, e13b728c6880. [Manifest](manifest.json) references are verified against actual bytes.

Measured export: **${values.rawGlbBytes} raw / ${values.gzipBytes} gzip9 / ${values.brotliBytes} Brotli11 bytes**; ${values.triangles} triangles, ${values.exportedVertexRecords} serialized vertex records, 22 nodes / 10 moving bindings, 21 meshes/primitives, seven materials, no textures or animation. The 124-byte raw reduction is JSON extension metadata, not geometry optimization.

Geometry, pupil/lid, collision, pose-envelope and negative-probe tests were **not rerun or relabelled**. Their immutable v02 paths/hashes are explicitly carried in delta-validation.json and manifest.json, justified by exact geometry, hierarchy and pose identity. This is an emission-only delta validator PASS, not new broad technical acceptance. No old Cycles renders were copied or passed off as fresh v03 evidence.

## Reproduce and handoff

From this directory, run the installed Blender executable with --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python build_eye.py; it opens the pinned v02 blend, changes only Emission Strength, saves/exports v03 and updates the eye baseline in the profile. Run node validate_delta.mjs and the same isolated Blender flags with check_editable.py. No full regeneration or package installation is needed. The comparison selection is pinned in viewer/comparison.json; poses stay byte-identical.

Viewer reproduction uses prepare_viewer.mjs and viewer-server.mjs after checking4195 free; /?baseline=1 loads frozen v02 for scalar comparisons and / loads actual v03. Capture code uses only finite poses. Fresh evidence and report completion are verified by node finalize.mjs. [Input receipt](input-receipt.json) freezes 77 upstream files, including all v02 files, and [files.json](files.json) pins this handoff.

Owned viewer PID ${lease.pid} and its tab are closed; [release evidence](viewer/lease-release.json) confirms no listener on4195 and no owned process. No application/public assets, .next, shared Blender, dependencies, Git or paid tool were changed. The isolated viewer does not establish UI, mobile, cards, motion/interruption, combined scene cost, final placement or runtime approval.
`;
fs.writeFileSync(path.join(B,'README.md'),text);
const files=[];function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name!=='files.json')files.push({path:path.relative(B,full).replaceAll('\\','/'),bytes:fs.statSync(full).size,sha256:sha(full)});}}walk(B);
for(const file of files.filter(x=>x.path.endsWith('.json')))JSON.parse(fs.readFileSync(path.join(B,file.path)));
for(const match of text.matchAll(/\]\(([^)]+)\)/g))assert.ok(match[1]==='files.json'||fs.existsSync(path.resolve(B,match[1])),match[1]);
fs.writeFileSync(path.join(B,'files.json'),JSON.stringify({checkedAt:new Date().toISOString(),assetSha256:d.exportSha256,emissionStrength:1,upstreamPinsVerified:77,geometryTestsCarriedNotRerun:true,browserCameraLightsAndPlacementMatchV02:true,leaseReleased:true,files},null,2));
console.log(JSON.stringify({files:files.length,asset:d.exportSha256,delta:'PASS',editableParity:true,browserIdentity:true,leaseReleased:true}));
