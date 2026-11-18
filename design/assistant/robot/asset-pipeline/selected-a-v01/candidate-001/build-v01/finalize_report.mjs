import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const base=path.dirname(fileURLToPath(import.meta.url));
const lane=path.resolve(base,'../..'),robot=path.resolve(base,'../../../..');
const read=n=>JSON.parse(fs.readFileSync(path.join(base,n),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const hashFile=p=>sha(fs.readFileSync(p));
const p=read('profile.json'),v=read('validation.json'),r=read('reimport-validation.json'),m=read('manifest.json'),retain=read('retained-mesh.json'),cal=read('projection-calibration.json');
assert.equal(v.assetSha256,m.export.sha256);assert.equal(r.sourceGlbSha256,m.export.sha256);assert.equal(r.status,'PASS-reimport-structure');
assert.equal(hashFile(path.join(base,'selected-a.glb')),m.export.sha256);
assert.equal(hashFile(path.join(base,'selected-a.blend')),m.editable.sha256);
assert.equal(hashFile(path.join(base,'profile.json')),m.profile.sha256);
assert.equal(hashFile(path.join(base,'build_asset.py')),m.script.sha256);
const prior=JSON.parse(fs.readFileSync(path.join(lane,'validation.json'),'utf8'));
for(const pin of prior.files)assert.equal(hashFile(path.join(lane,pin.path)),pin.sha256,'Historical B preflight changed: '+pin.path);
const inputs=[
 '../raw/model.glb','../cleanup-v01/selected-a-cleanup-start.blend','../cleanup-v01/raw-inspection.json','../production-receipt.json',
 '../../preflight.md','../../profile.example.json','../../../../selected-a-build-decisions.md','../../../../review/selected-a-v01/review.md',
 '../../../../higgsfield-concepts/selected-a-v01/outputs/02-front.png','../../../../higgsfield-concepts/selected-a-v01/outputs/03-side.png',
 '../../../../integration/state-contract.md','../../../../integration/baseline-2026-11-16/source-receipt.json'
].map(relativePath=>{const file=path.resolve(base,relativePath);return{relativePath,bytes:fs.statSync(file).size,sha256:hashFile(file)};});
assert.equal(inputs[0].sha256,'412c0c213e0c6adc6baa80fa0686b6cbd9a1d259348bb96c571ef28b2f59bec7');
const measurement=v.measurements, dimensions=v.neutralBoundsGltfMetres.max.map((x,i)=>x-v.neutralBoundsGltfMetres.min[i]);
const fmt=xs=>'['+xs.map(x=>Number(x.toFixed(6))).join(', ')+']';
const bounds=v.sweep.conservativeContinuousBoundsBlenderMetres;
const rows=retain.retained.map(x=>'| '+x.node+' | '+x.componentId+' | '+x.sourceVertices+' / '+x.sourceTriangles+' | '+x.afterRepairVertices+' / '+x.afterRepairTriangles+' |').join('\n');
const hashes=['selected-a.glb','selected-a.blend','build_asset.py','profile.json','poses.json'].map(name=>'| ['+name+']('+name+') | `'+hashFile(path.join(base,name))+'` |').join('\n');
const report=`# Selected A candidate 001 — build v01

**Articulated review candidate; productionReady remains false.** Local build, export and reimport completed in independent factory-startup Blender **5.2.3 LTS / e13b728c6880** processes. No paid calls, shared Blender/browser, application changes, main-checkout access or deployment occurred.

Open [neutral views](neutral-contact-sheet.png), [five finite poses](five-poses.png), [editable Blender file](selected-a.blend) or [GLB](selected-a.glb). Numeric handoff: [profile](profile.json), [poses](poses.json), [manifest](manifest.json), [offline validation](validation.json), [reimport checks](reimport-validation.json).

## Raw diagnosis and actual retention

The raw GLB is one mesh object but **seven vertex/edge-connected islands**, not one fused character: head 0, body 1, post 2, left/right mittens 3/4, tray 5, ribbon 6. All five major masses were present with useful gaps; no background slab was found. I viewed the four isolated [raw clay views](raw-contact-sheet.png) before editing. Their component indices and complete original vertex/face membership are in [raw-components.json](raw-components.json).

| Retained Meshy-derived part | Island | Raw vertices / triangles | After repair vertices / triangles |
| --- | --- | --- | --- |
${rows}

The head needed more than a material change: generated face/border ridges produced overlapping edges. Its rear-shell sample positions were retained, smoothed and radially faired to the reviewed stretched-ball envelope, then locally retopologized to remove folded seam faces. **${retain.headOriginalVerticesRetainedBeforeLoft} original rear-shell vertices** pass the plane cut before retopology; maximum additional radial fairing was **${(retain.maxRearFairingDisplacementRaw*p.physicalScale.metresPerRawUnit*1000).toFixed(2)} mm**. Six front-band rings connect the ${retain.headCutBoundaryVertices}-vertex cut boundary to a clean inset face opening. This is explicitly a repaired Meshy head, not a claim that its original front topology survived.

The body keeps the generated teardrop below the collar cut; both mitten meshes retain their source topology with smoothing. The generated post, ribbon and tray were discarded. Native rebuilt parts are the opaque curved face/rim, warm eye discs, pupils/highlights, soft lower lids, coronal seam, rigid left-crown bookmark, closed domed brass collar/cap and empty shallow dish. Back porcelain is plain; no glass, upper brow, source cards, photographic textures or baked reflections. [retained-mesh.json](retained-mesh.json) records the repair operations. Imported normals were reset after geometry edits; export materials were made explicitly one-sided.

## Numeric asset contract

There are **22 semantic nodes, 10 moving bindings**, exactly matching the proposed A hierarchy. Every local position, quaternion, unit scale and Blender/glTF basis is populated in the candidate profile. Pupil highlights are children of pupils; they add no separate wandering control. Seven named simple opaque materials keep eye and tray emission independently bound; no texture, skin, morph, camera, light or animation clip is exported.

Physical scale is **provisional**, derived from a nominal 0.28 m raw-head width, not v02 measurements or a room allocation: **${p.physicalScale.metresPerRawUnit.toFixed(9)} metres per raw unit**. The root is the exact midpoint between the final head bottom and closed cap top; those measured endpoints are recorded in the profile. Author axes are +Z up / -Y forward; glTF conversion is [X,Z,-Y]. Apply the eventual external room scale of 2 once, with no extra floor offset or baked world anchor.

| Measured export field | Result |
| --- | --- |
| Vertices / triangles | ${measurement.exportedVertexRecords} serialized vertex records / ${measurement.triangles} triangles |
| Nodes / meshes / primitives / materials | ${measurement.nodes} / ${measurement.meshes} / ${measurement.primitives} / ${measurement.materials} |
| Raw / gzip level 9 / Brotli quality 11 | ${measurement.rawGlbBytes} / ${measurement.gzipBytes} / ${measurement.brotliBytes} bytes |
| Neutral glTF dimensions, X/Y/Z metres | ${fmt(dimensions)} |
| Neutral glTF minimum / maximum | ${fmt(v.neutralBoundsGltfMetres.min)} / ${fmt(v.neutralBoundsGltfMetres.max)} |
| Conservative five-pose sweep, Blender minimum / maximum | ${fmt(bounds.min)} / ${fmt(bounds.max)} |

Primitive count is not a measured WebGL draw count. Combined room/assistant JS, runtime marker cost, shadows and performance remain unallocated.

Neutral, attention, sources, no-match and dismissal are **finite pose metadata only**, with complete local Blender and converted glTF TRS. Sources raises the tray 18 mm and pitches it 16 degrees; no-match raises it 12 mm and pitches it 12 degrees, with no fake marks. Attention uses a small head turn and gaze shift; dismissal settles back to neutral, and reduced motion snaps directly. The single future presentation controller owns transforms/emission; live source identity/count clears immediately and never waits for interpolation. Text generation remains disabled.

All 25 ordered pose pairs were sampled at 41 points. The continuous envelope expands those samples by a computed **${(v.sweep.paddingMetres*1000).toFixed(3)} mm** per side using a translation/angular-speed bound along each hierarchy chain. This covers only the declared nonovershooting lerp/slerp transitions; **runtime marks are excluded**, and their eventual clearance is still pending. Pupil boundary tests remain inside the discs, highlights remain inside pupils, and minimum pupil/lid clearance across these endpoints is **${(v.pupilChecks.minPupilToLidClearanceMetres*1000).toFixed(2)} mm**.

## Verification and visual evidence

Offline checks passed exact names/parents/neutral TRS, valid binary accessor ranges and indices, finite positions/unit normals, zero degenerate triangles, opaque one-sided materials, allowed extensions only and zero animation/texture/external dependencies. Reimport into an empty independent scene recovered all 22 nodes and seven materials with maximum translation error **${r.maxLocalTranslationErrorMetres} m**. Forty-five endpoint/intermediate checks found no triangle intersections between the five major mass groups; these samples do not prove arbitrary motion clearance. The head's intentional opening is covered by the separate opaque face/rim; this is an articulated visual asset, not a watertight printing claim.

I viewed the raw clay, final neutral front/three-quarter/side/back, five-pose contact sheet, reimport front and isolated mobile projection. The four-view and pose renders are local Cycles CPU renders at 32 samples, with evidence-only studio lighting excluded from the asset. [Reimport front](renders/reimport-front.png) confirms exported neutral appearance.

The [current room baseline](../../../../integration/baseline-2026-11-16/baseline.md) is the procedural room plus pilot v03, not a full-kit room. Its fixed eye is [-0.7,2.8,3.4] world units, with 58-degree desktop / 64-degree mobile vertical FOV. The [320 x 568 isolated projection](renders/isolated-mobile-fov64-at-2m.png) uses the actual fixed eye, mobile home yaw/pitch and 64-degree FOV, placing the asset centre **provisionally two metres along the viewing ray** solely for sensitivity evidence. No room is drawn and that position is not a selected anchor. Estimated central pupil/highlight diameters are **${cal.pixelEstimatesAtImageCentre.pupilDiameter.toFixed(1)} / ${cal.pixelEstimatesAtImageCentre.highlightDiameter.toFixed(1)} pixels**; highlight legibility is fragile at that size. [Calibration](projection-calibration.json) records the exact baseline hash and assumptions.

## Reproduce and review

From this directory, run the following sequentially with the installed executable; each Blender invocation is a separate background process:

~~~powershell
$blender = 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe'
& $blender --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python inspect_raw.py
& $blender --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python build_asset.py -- --renders final
node validate_asset.mjs
& $blender --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python reimport_validate.py
./make_sheets.ps1
node finalize_report.mjs
~~~

Generation is not part of these commands. Scripts confine writes to this build folder. The report/final hash pass checks the historical preflight files byte-for-byte against their existing receipt. The finalizer must follow successful fresh validation and reimport, and renewed author inspection if the build changed.

| Handoff file | SHA-256 |
| --- | --- |
${hashes}

Raw Meshy SHA-256: **412c0c213e0c6adc6baa80fa0686b6cbd9a1d259348bb96c571ef28b2f59bec7**. [files.json](files.json) pins all deliverables and read-only inputs.

**Remaining:** independent Claude visual review of likeness, lids/eye warmth, bookmark, finish and poses; independent Codex technical review; eventual runtime material/projection fidelity and combined resource allocation; room/phone placement, occlusion and marker clearance. No app tests/build, browser/runtime acceptance or production deployment is claimed.
`;
fs.writeFileSync(path.join(base,'README.md'),report);
const files=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,ent.name);if(ent.isDirectory())walk(full);else if(ent.name!=='files.json'&&!ent.name.endsWith('.blend1'))files.push({path:path.relative(base,full).replaceAll('\\','/'),bytes:fs.statSync(full).size,sha256:hashFile(full)});}}
walk(base);
fs.writeFileSync(path.join(base,'files.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:'build-v01 only',rawSourceUnchanged:true,historicalPreflightFilesUnchanged:true,inputs,files,independentReviewPending:true},null,2)+'\n');
console.log(JSON.stringify({files:files.length,inputs:inputs.length,assetSha256:m.export.sha256,validation:v.status,reimport:r.status},null,2));
