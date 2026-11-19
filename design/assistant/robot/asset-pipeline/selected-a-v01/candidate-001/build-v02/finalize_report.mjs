import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const B=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(B,'../../../../../../..');
assert.equal(path.basename(B),'build-v02');const read=n=>JSON.parse(fs.readFileSync(path.join(B,n)));const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const v=read('validation.json'),p=read('profile.json'),poses=read('poses.json'),m=read('manifest.json'),r=read('reimport-validation.json'),e=read('editable-validation.json'),w=read('viewer/webgl-evidence.json'),lease=read('viewer/lease.json'),place=read('placement-check.json'),probes=read('validator-probes.json');
for(const record of [r,e,w,place])assert.equal(record.assetSha256??record.sourceGlbSha256??record.candidateSha256,v.assetSha256);
assert.equal(v.assetSha256,hash(path.join(B,'selected-a.glb')));assert.equal(hash(path.join(B,m.script.path)),m.script.sha256);assert.equal(hash(path.join(B,m.profile.path)),m.profile.sha256);assert.equal(hash(path.join(B,m.poses.path)),m.poses.sha256);assert.equal(e.exactBytesEqual,true);assert.equal(r.crossMassOverlaps.length,0);assert.equal(lease.status,'closed');
assert.equal(w.resourceIdentities.geometries.length,21);assert.equal(w.resourceIdentities.materials.length,7);assert.equal(w.pageErrors.length,0);
assert.ok(probes.results.every(x=>x.guardCaught));assert.equal(probes.results.length,10);
const frozen=read('frozen-v01.json');for(const [name,sha]of Object.entries(frozen))assert.equal(hash(path.join(B,'../build-v01',name)),sha,'Frozen v01 changed: '+name);
const previous=read('../build-v01/files.json');const inputs=previous.inputs.filter(x=>!/state-contract|baseline/.test(x.relativePath)).map(x=>{const absolute=path.resolve(B,x.relativePath);assert.equal(hash(absolute),x.sha256);return {path:path.relative(repo,absolute).replaceAll('\\','/'),sha256:x.sha256,bytes:fs.statSync(absolute).size};});
for(const relative of ['design/assistant/robot/review/build-v01/visual/review.md','design/assistant/robot/review/build-v01/visual/evidence/face-reference-vs-build-vs-side.png','design/assistant/robot/review/build-v01/visual/evidence/sources-tray-closeup.png','design/assistant/robot/review/build-v01/technical/review.md','design/assistant/robot/review/build-v01/technical/probe-validator.mjs','design/assistant/robot/placement-selected-a/coordinator-decisions.md','design/assistant/robot/placement-selected-a/placement.md'])inputs.push({path:relative,sha256:hash(path.join(repo,relative)),bytes:fs.statSync(path.join(repo,relative)).size});
const sourceReceipt=read('viewer/source-receipt.json');for(const input of sourceReceipt.inputs)assert.equal(hash(path.join(repo,input.path)),input.sha256,'Viewer source drift: '+input.path);
const num=n=>Number(n.toFixed(6)),vec=a=>a.map(num).join(', '),mm=n=>(n*1000).toFixed(3);const metrics=v.measurements,eye=v.runtimeChecks.geometryEyeChecks,sw=v.sweep.conservativeContinuousBoundsBlenderMetres;
const response=`# V02 response to independent review

Candidate for independent recheck; the author does not approve appearance or deployment. The unchanged v01 review remains historical evidence.

| Finding | V02 repair and evidence | Boundary |
| --- | --- | --- |
| Pill lids / side snout | Shallow apron geometry meets the opaque face below the eyes; width equals the eye. Local X hinges follow the curved face, replacing linear lift that exposed eye slivers in an intermediate draft. Neutral front and side plus WebGL face/side viewed. | Hinge pivot and angular range changed; use v02 profile, never old lid translation logic. |
| Peach/orange eyes | Authored warm cream FFF0CB at strength 4; pupil radius .025 raw (48.1% of eye width). Actual exported GLB loaded with room lighting/ACES 1.2. Representative eye pixels [252,251,248], porcelain [232,218,194]; pupils/highlights remain distinct. | Near-white cream without bloom; Claude decides visual warmth. |
| Indistinct poses | Attention head [-7,0,11] degrees, 9 mm lift, 24-degree mittens; dismissal head [2,0,-12], 17-degree mittens and 33.39% centre lid occlusion versus 20% neutral. Five-pose sheet viewed. | Finite paired poses only; reduced motion settles immediately. No ambient loop or animation clips. |
| Tray overlap / filled plate / streak | Sources forward 28 mm/down 14 mm/14-degree tilt; no-match forward 26 mm/down 12 mm/10-degree tilt. Closed flat floor caps remove the shading streak; brass floor roughness .65, constant decorative emission .10 in every pose. Same-camera source/no-match gap inspected. | Runtime cards/counts, never brightness, carry retrieval evidence. |
| Bookmark too small | Turned post including rounded cap remains one binding, ~41% of head height; rigid notched ribbon ~38%. Front/side/browser red accent inspected. | Enlarges new sweep; no shrink-to-fit adjustment. |
| Broken/wavy coronal seam | Twice the previous tube radius, smoothed coronal radial profile in one plane, continuous crown-to-chin. | Plain rear shell; no equatorial seam. |
| Front facets | One head subdivision and denser curved opaque face improve the front shading while retaining the Meshy-derived rear/body/mittens. | Retained masses and native repair boundary remain explicit; vertex/byte cost increased. |
| Seven accepted-invalid validator probes | All seven now reject; valid control accepts and both existing invalid sensitivity controls still reject. | Exact 10-case receipt in validator-probes.json; no claim of exhaustive malformed-file fuzzing. |
| Runtime handoff gaps | Explicit opaque-picking blocker, no cast/receive shadows, private identity disposal, sub-one emission mapping; actual GLTFLoader resource IDs recorded. | Policy metadata only; G2 owns implementation. |

The intermediate linear-lid drafts and rougher source assumptions were superseded; all delivered render/GLB/pose receipts are pinned to the final asset. No source image or v01 byte changed.
`;
fs.writeFileSync(path.join(B,'review-response.md'),response);
const report=`# Selected A / candidate 001 / build v02

16-17 November 2026. Repaired candidate for independent Claude visual and Codex technical review. productionReady remains false. All authored files and outputs are confined here; v01's ${Object.keys(frozen).length} files and frozen upstream inputs match their hashes. No paid call, application/public asset, shared Blender, preview4193, dependency or Git change.

[Review response](review-response.md) maps every named repair. [Neutral sheet](neutral-contact-sheet.png), [five poses](five-poses.png), [browser face](viewer/webgl-neutral-face.png), [browser side](viewer/webgl-neutral-side.png) and [real room harness](viewer/webgl-room-desktop-home.png) are the quickest review path.

## Asset and binding result

GLB SHA-256 **${v.assetSha256}**. Editable blend SHA-256 **${e.sourceBlendSha256}**. Full output/input hashes are in [files.json](files.json); manifest pins source, profile, poses and exporter.

| Measured exported cost | Result |
| --- | ---: |
| Triangles / serialized vertex records | ${metrics.triangles} / ${metrics.exportedVertexRecords} |
| Semantic nodes / moving bindings | ${v.requiredBindings} / ${v.movingBindings} |
| Meshes / primitives / materials | ${metrics.meshes} / ${metrics.primitives} / ${metrics.materials} |
| Raw / gzip level9 / Brotli q11 bytes | ${metrics.rawGlbBytes} / ${metrics.gzipBytes} / ${metrics.brotliBytes} |
| Textures / clips / skins / cameras / lights | 0 / 0 / 0 / 0 / 0 |

These are asset costs, not a room allocation or renderer draw-call budget. V01 was 18330 triangles / 328960 raw bytes; smoother head/face, detailed integrated lids and bookmark repairs increase cost. No allocation has been invented.

All 22 names and parents remain. Both lower-lid pivots now lie at the face ellipsoid's YZ centre for an independent local-X hinge; they no longer use translation. Numeric local Blender/glTF TRS and angles are in [profile.json](profile.json) and [poses.json](poses.json). Neutral coverage is 20%; dismissal centre coverage 33.39%. Head/body gap root, metres, +Z up/-Y forward and glTF [X,Z,-Y] remain; uniform source scale ${p.physicalScale.metresPerRawUnit} m/raw unit is provisional. No placement or floor offset is baked in.

Meshy provenance is unchanged for the body and two mitten sources; the head retains its fitted Meshy rear samples, repaired front loft and one smoothing subdivision. Native face/eyes/lids/rim/seam/post/ribbon/cap/tray repairs are disclosed in [retained-mesh.json](retained-mesh.json). Raw island diagnosis is the frozen v01 receipt, not a newly invented segmentation claim.

## Fresh validation

[validation.json](validation.json) checks the binary, allowed attributes/extensions, accessor bounds, finite unit TRS, named hierarchy/poses, materials, basis conversion and actual exported pupil/highlight geometry. It independently recomputes ${v.runtimeChecks.runtimeSampleCount} runtime-glTF samples and rejects contradictory declared bounds. [validator-probes.json](validator-probes.json) records **1 accepted valid control + 9 rejected invalid cases**, including all seven previously missed cases. [Editable parity](editable-validation.json) reexports byte-identically from the saved blend; [reimport](reimport-validation.json) verifies names, parents, materials and transforms with max translation error ${r.maxLocalTranslationErrorMetres} m, and ${r.crossMassOverlapSamples} major-mass samples with zero triangle intersections. Blender ${e.blenderVersion}, build ${e.blenderBuildHash}.

Neutral glTF AABB metres: min [${vec(v.neutralBoundsGltfMetres.min)}], max [${vec(v.neutralBoundsGltfMetres.max)}]. Conservative continuous **Blender** sweep: min [${vec(sw.min)}], max [${vec(sw.max)}], sample padding ${mm(v.sweep.paddingMetres)} mm. Actual pupil projected ellipse max ${eye.maxEllipseNormalizedRadiusSquared.toFixed(6)} < 1; sampled lid gap ${mm(eye.minPupilToLidClearanceMetres)} mm and conservative gap ${mm(eye.conservativeContinuousGapMetres)} mm. Highlights remain inside pupils.

The sweep covers one common interpolation parameter between each authored endpoint pair, using translation lerp and shortest quaternion slerp. It excludes intermediate-to-third interruption, independent node clocks, added gaze/lid offsets, scale changes and runtime cards. BVH samples do not certify continuous collision clearance or visual gaps. G2 must bound its implemented interruption/marker policy separately.

## Viewed evidence and material check

Final source neutral front/three-quarter/side/back, source/no-match tray gaps, five-pose sheet and reimport front were viewed. Cycles uses the exact v01 cameras, 640x800, orthographic .67, same three studio lights and AgX. [Browser receipt](viewer/webgl-evidence.json) pins the actual GLB, Three r187/GLTFLoader identities, Intel UHD ANGLE WebGL renderer, sRGB, ACESFilmic exposure1.2, each camera, room lights and private geometry/material IDs. It uses three locally transpiled current room source modules plus the real pilot/adapter; no app build. No bloom or environment map. Eye cream is visibly brighter than sampled porcelain; ribbon is red, the floor brass, and pupils/highlights remain legible in closeups. These are author observations awaiting independent visual recheck.

The viewer uses root's **provisional** P2 anchor [0.80,2.80,-0.20], normalized yaw quaternion, and one wrapper1.6 = 2 world-units/metre times .8 art scale. Inspection cameras are labelled; the 1440x900 room view uses the actual fixed eye and desktop-home orientation. No mobile, UI/backdrop, transport, interaction or main-app acceptance follows. [Source receipt](viewer/source-receipt.json) pins the room modules and renderer sources. The owned loopback4195 process PID ${lease.pid} closed at ${lease.closedAt}; [lease](viewer/lease.json) and [port/process check](viewer/lease-release.json) hand the slot back.

## Runtime handoff and remaining work

Opaque meshes block picking; neither cast nor receive shadows. Dispose the private 21 geometry identities and seven material identities once; runtime markers/clones belong to their own owner. Eye discs share a material, highlights share another, tray emission is separate. The tray imports with emissive colour already multiplied by .10 and intensity1: preserve that product, or use base linear colour times target authored strength. Never assign .10 directly to the imported intensity. Its decorative strength is constant in every pose. Live 0..4 source marks remain unbaked and immediate from the shared validated snapshot; no generation or permanent idle loop is introduced.

[Placement check](placement-check.json) recomputes the new conservative box: wall-light angular margin **${place.marginsAgainstP2ApproximateAngles.wallLightsDegrees.toFixed(3)} degrees**, TypeForge ${place.marginsAgainstP2ApproximateAngles.typeforgeDegrees.toFixed(3)}, speaker ${place.marginsAgainstP2ApproximateAngles.speakerDegrees.toFixed(3)}. The negative light margin is a conservative overlap warning, not proven silhouette collision; no anchor acceptance or room adjustment is made. Root/G2 must resolve actual swept silhouette, runtime cards, combined costs and phone discovery. Claude must independently recheck the repairs; technical review must assess the changed geometry, hinge contract and validator.

## Reproduce inside this directory

Use the installed executable C:/Program Files/Blender Foundation/Blender 5.2/blender.exe with --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python build_asset.py -- --renders final. Then run node validate_asset.mjs, node probe-validator.mjs, the same isolated Blender command with reimport_validate.py and check_editable.py, make_sheets.ps1, and node placement_check.mjs. Viewer: node prepare_viewer.mjs, verify4195 free, node viewer-server.mjs, open one owned isolated tab, capture actual GLB; send stop on that process stdin and verify lease closure. No install is needed. Run node finalize_report.mjs only after fresh browser/lease receipts are present. JSON/scripts and output links are validated in the final receipt.
`;
fs.writeFileSync(path.join(B,'README.md'),report);
const files=[];function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name!=='files.json')files.push({path:path.relative(B,full).replaceAll('\\','/'),bytes:fs.statSync(full).size,sha256:hash(full)});}}walk(B);
for(const file of files.filter(f=>f.path.endsWith('.json')))JSON.parse(fs.readFileSync(path.join(B,file.path)));
for(const markdown of ['README.md','review-response.md'])for(const match of fs.readFileSync(path.join(B,markdown),'utf8').matchAll(/\]\(([^)]+)\)/g))assert.ok(match[1]==='files.json'||fs.existsSync(path.resolve(B,match[1])),match[1]);
fs.writeFileSync(path.join(B,'files.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:'build-v02 only',assetSha256:v.assetSha256,frozenV01FilesVerified:Object.keys(frozen).length,upstreamInputsUnchanged:true,inputs,files,independentReviewPending:true,productionReady:false},null,2));
console.log(JSON.stringify({files:files.length,inputs:inputs.length,frozenV01:Object.keys(frozen).length,asset:v.assetSha256,allChecks:true}));
