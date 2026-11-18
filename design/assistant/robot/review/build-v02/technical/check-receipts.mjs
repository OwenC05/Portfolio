import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
const out=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(out,'../../../../../..')
const base=path.resolve(out,'../../../asset-pipeline/selected-a-v01/candidate-001/build-v02')
const hash=b=>createHash('sha256').update(b).digest('hex')
const read=n=>JSON.parse(fs.readFileSync(path.join(base,n)))
const inspection=JSON.parse(fs.readFileSync(path.join(out,'inspection.json'))),profile=read('profile.json'),poses=read('poses.json'),manifest=read('manifest.json'),validation=read('validation.json')
const frozenV01=Object.entries(read('frozen-v01.json')).map(([name,pin])=>{const actual=hash(fs.readFileSync(path.join(base,'../build-v01',name)));return {name,actual,expected:typeof pin==='string'?pin:pin.sha256}})
assert.ok(frozenV01.every(r=>r.actual===r.expected))
const sourcePins=Object.entries(profile.sourcePins).map(([name,pin])=>{const b=fs.readFileSync(path.join(root,pin.path));return{name,path:pin.path,actual:hash(b),expected:pin.sha256,bytes:b.length,expectedBytes:pin.bytes}})
assert.ok(sourcePins.every(r=>r.actual===r.expected&&r.bytes===r.expectedBytes))
const viewerInputs=read('viewer/source-receipt.json').inputs.map(pin=>({path:pin.path,pinned:pin.sha256,current:hash(fs.readFileSync(path.join(root,pin.path)))}))
const viewer=read('viewer/webgl-evidence.json')
assert.equal(viewer.assetSha256,inspection.assetSha256)
assert.equal(viewer.threeRevision,inspection.threeRevision)
assert.ok(viewer.pageErrors.length===0)
for(const [key,value] of Object.entries(inspection.compression))assert.equal(manifest.export[{raw:'rawGlbBytes',gzip9:'gzipBytes',brotli11:'brotliBytes'}[key]],value)
for(const [key,value] of Object.entries({triangles:37676,nodes:22,meshes:21,primitives:21,materials:7,exportedVertexRecords:19131}))assert.equal(manifest.export[key],value)
for(const name of ['editable-validation.json','reimport-validation.json','placement-check.json']){const r=read(name);assert.equal(r.assetSha256??r.candidateSha256??r.sourceGlbSha256,inspection.assetSha256)}
assert.equal(manifest.externalRoomScale,2);assert.equal(manifest.floorOffset,0);assert.equal(manifest.worldPlacement,null);assert.equal(manifest.allocationApproved,false)
assert.equal(profile.coordinates.placement.worldUnitsPerMetre,2);assert.equal(profile.coordinates.placement.applications,1);assert.equal(profile.coordinates.placement.addRoomFloorOffset,false)
const rootMidpointError=profile.physicalScale.rootRaw.map((v,i)=>Math.abs(v-(profile.physicalScale.gapEndpointsRaw.headBottom[i]+profile.physicalScale.gapEndpointsRaw.bodyCapTop[i])/2))
assert.ok(rootMidpointError.every(v=>v<1e-7),'float32 Blender midpoint agrees within 0.1 microunit')
assert.deepEqual(manifest.sweptBoundsBlenderMetres,validation.sweep.conservativeContinuousBoundsBlenderMetres)
for(const node of inspection.nodes){assert.equal(node.extras.castShadow,false);assert.equal(node.extras.receiveShadow,false);assert.equal(node.extras.opaquePickingBlocker,node.mesh!==undefined)}
const glb=p=>{const b=fs.readFileSync(p),n=b.readUInt32LE(12);return {doc:JSON.parse(b.subarray(20,20+n)),bin:b.subarray(28+n)}}
const old=glb(path.join(base,'../build-v01/selected-a.glb')),now=glb(path.join(base,'selected-a.glb'))
assert.equal(old.doc.meshes.reduce((sum,m)=>sum+m.primitives.reduce((n,p)=>n+old.doc.accessors[p.indices].count/3,0),0),18330)
function attributes(g,name){const p=g.doc.meshes[g.doc.nodes.find(n=>n.name===name).mesh].primitives[0];return Object.fromEntries(Object.entries({...p.attributes,indices:p.indices}).map(([k,i])=>{const a=g.doc.accessors[i],v=g.doc.bufferViews[a.bufferView];return[k,hash(g.bin.subarray((v.byteOffset??0)+(a.byteOffset??0),(v.byteOffset??0)+v.byteLength))]}))}
const unchangedMassGeometry=['APA_body','APA_mitten_L','APA_mitten_R'].map(name=>({name,v01:attributes(old,name),v02:attributes(now,name)}))
for(const r of unchangedMassGeometry)assert.deepEqual(r.v02,r.v01)
const pinNames=['selected-a.glb','selected-a.blend','profile.json','poses.json','manifest.json','files.json','validate_asset.mjs','validate_contract.mjs','validator-probes.json','build_asset.py','validation.json','viewer/webgl-evidence.json']
const exactPins=pinNames.map(name=>{const b=fs.readFileSync(path.join(base,name));return{name,bytes:b.length,sha256:hash(b)}})
const oldSize=fs.statSync(path.join(base,'../build-v01/selected-a.glb')).size
const report={status:'PASS-receipt-agreement',exactPins,frozenV01,sourcePins,viewerInputs,viewerInputsCurrentlyMatch:viewerInputs.every(r=>r.current===r.pinned),rootMidpointErrorRaw:rootMidpointError,unchangedMassGeometry,costChange:{oldRaw:oldSize,newRaw:inspection.compression.raw,increaseRaw:inspection.compression.raw-oldSize,oldTriangles:18330,newTriangles:inspection.counts.triangles,increaseTriangles:inspection.counts.triangles-18330},placement:read('placement-check.json'),scope:'Read-only agreement checks; author browser evidence is reviewed, not independently recaptured; no final placement or total room/assistant budget acceptance.'}
fs.writeFileSync(path.join(out,'receipts.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,frozenV01:frozenV01.length,sourcePins:sourcePins.length,viewerInputsCurrentlyMatch:report.viewerInputsCurrentlyMatch,unchangedMassGeometry:unchangedMassGeometry.map(r=>r.name),exactPins,costChange:report.costChange},null,2))
