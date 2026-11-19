import {checkDocument,checkAccessor,checkRuntime} from './validate_contract.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import zlib from 'node:zlib';
const base=path.dirname(fileURLToPath(import.meta.url));
const read=n=>JSON.parse(fs.readFileSync(path.join(base,n),'utf8'));
const write=(n,o)=>fs.writeFileSync(path.join(base,n),JSON.stringify(o,null,2)+'\n');
const sha=b=>createHash('sha256').update(b).digest('hex');
const p=read('profile.json'), poses=read('poses.json'), summary=read('build-summary.json');
const bytes=fs.readFileSync(path.join(base,'selected-a.glb'));
assert.equal(bytes.toString('ascii',0,4),'glTF'); assert.equal(bytes.readUInt32LE(4),2); assert.equal(bytes.readUInt32LE(8),bytes.length);
const chunks=[]; for(let i=12;i<bytes.length;){const size=bytes.readUInt32LE(i),kind=bytes.readUInt32LE(i+4);assert.equal(size%4,0);assert.ok(i+8+size<=bytes.length);chunks.push({kind,bytes:bytes.subarray(i+8,i+8+size)});i+=8+size;}
assert.equal(chunks.length,2); assert.equal(chunks[0].kind,0x4e4f534a); assert.equal(chunks[1].kind,0x004e4942);
const doc=JSON.parse(chunks[0].bytes.toString()),bin=chunks[1].bytes;
assert.equal(doc.asset.version,'2.0'); checkDocument(doc);
for(const key of ['animations','skins','cameras','images','textures']) assert.equal(doc[key]?.length??0,0,key);
assert.deepEqual(doc.extensionsRequired??[],[]);
assert.ok((doc.extensionsUsed??[]).every(x=>x==='KHR_materials_emissive_strength'));
assert.equal(doc.buffers.length,1);assert.ok(!doc.buffers[0].uri);assert.ok(doc.buffers[0].byteLength<=bin.length);
assert.equal(doc.scenes.length,1);assert.equal(doc.scenes[0].nodes.length,1);
const names=doc.nodes.map(n=>n.name);assert.equal(new Set(names).size,22);assert.equal(names.length,22);
assert.equal(doc.nodes[doc.scenes[0].nodes[0]].name,'APA_root');
const parents=new Map();
doc.nodes.forEach((n,i)=>(n.children??[]).forEach(j=>{assert.ok(!parents.has(j));parents.set(j,i);}));
const len=a=>Math.hypot(...a), sub=(a,b)=>a.map((v,i)=>v-b[i]), add=(a,b)=>a.map((v,i)=>v+b[i]);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const rotate=(q,v)=>{const a=q.slice(0,3),uv=cross(a,v),uuv=cross(a,uv);return v.map((x,i)=>x+2*(q[3]*uv[i]+uuv[i]));};
const trs=n=>({translation:n.translation??[0,0,0],rotationXyzw:n.rotation??[0,0,0,1],scale:n.scale??[1,1,1]});
const near=(a,b,tol=1e-6)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<=tol,`${x} != ${b[i]}`));};
for(const binding of p.bindings){
 const i=names.indexOf(binding.name);assert.ok(i>=0);const n=doc.nodes[i];
 assert.equal(parents.has(i)?names[parents.get(i)]:null,binding.parent);assert.ok(!n.matrix);assert.ok(!n.skin);
 const actual=trs(n),want=binding.neutralGltfTRS;near(actual.translation,want.translation);near(actual.scale,want.scale);
 assert.ok(Math.abs(dot(actual.rotationXyzw,want.rotationXyzw))>1-1e-6);
}
const layout={5121:[1,'readUInt8'],5123:[2,'readUInt16LE'],5125:[4,'readUInt32LE'],5126:[4,'readFloatLE']};
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
function accessor(i){
 const a=doc.accessors[i];assert.ok(a&&!a.sparse);const v=doc.bufferViews[a.bufferView];assert.equal(v.buffer??0,0);
 const [size,method]=layout[a.componentType];const width=widths[a.type];assert.ok(size&&width);
 const stride=v.byteStride??size*width;assert.ok(stride>=size*width);
 const start=(v.byteOffset??0)+(a.byteOffset??0);const end=start+(a.count-1)*stride+width*size;
 assert.ok(end<=(v.byteOffset??0)+v.byteLength&&end<=bin.length);
 const decoded = Array.from({length:a.count},(_,j)=>Array.from({length:width},(_,k)=>{const x=bin[method](start+j*stride+k*size);assert.ok(Number.isFinite(x));return x;})); checkAccessor(a,decoded); return decoded;
}
function worldPoint(index,v){
 let current=index,point=v.slice(),seen=new Set();
 while(current!==undefined){assert.ok(!seen.has(current));seen.add(current);const t=trs(doc.nodes[current]);
 point=add(rotate(t.rotationXyzw,point.map((x,i)=>x*t.scale[i])),t.translation);current=parents.get(current);}
 return point;
}
let triangles=0,vertexRecords=0,primitiveCount=0,degenerate=0,maxNormalError=0;
const points=[],radii={},meshRecords=[];
for(let ni=0;ni<doc.nodes.length;ni++){
 const n=doc.nodes[ni];if(n.mesh===undefined)continue;
 const m=doc.meshes[n.mesh];let nodeTriangles=0,nodeVertices=0,nodeRadius=0;
 for(const prim of m.primitives){
  primitiveCount++;assert.equal(prim.mode??4,4);assert.ok(!prim.targets&&!prim.extensions);assert.ok(Number.isInteger(prim.material));
  const binding=p.bindings.find(item=>item.name===n.name);
  const allowedMaterials=binding.materialRoles.map(role=>p.materials.roles[role].binding);
  assert.ok(allowedMaterials.includes(doc.materials[prim.material]?.name),'Material role mismatch on '+n.name);
  assert.ok(doc.materials[prim.material]);const pos=accessor(prim.attributes.POSITION),norm=accessor(prim.attributes.NORMAL);
  assert.equal(pos.length,norm.length);const ids=accessor(prim.indices).flat();assert.equal(ids.length%3,0);
  for(const normal of norm){maxNormalError=Math.max(maxNormalError,Math.abs(len(normal)-1));assert.ok(Math.abs(len(normal)-1)<1e-3);}
  for(const id of ids)assert.ok(id>=0&&id<pos.length);
  for(let j=0;j<ids.length;j+=3){const a=pos[ids[j]],b=pos[ids[j+1]],c=pos[ids[j+2]];if(len(cross(sub(b,a),sub(c,a)))<1e-12)degenerate++;}
  for(const v of pos){points.push(worldPoint(ni,v));nodeRadius=Math.max(nodeRadius,len(v));}
  nodeVertices+=pos.length;nodeTriangles+=ids.length/3;
 }
 vertexRecords+=nodeVertices;triangles+=nodeTriangles;radii[n.name]=nodeRadius;
 meshRecords.push({name:n.name,vertices:nodeVertices,triangles:nodeTriangles,primitives:m.primitives.length});
}
assert.equal(degenerate,0,'Degenerate exported triangles');
assert.equal(doc.meshes.length,21);assert.equal(doc.materials.length,7);assert.equal(primitiveCount,21);
for(const m of doc.materials){assert.equal(m.alphaMode??'OPAQUE','OPAQUE');assert.equal(m.doubleSided??false,false);assert.ok(!JSON.stringify(m).includes('Texture')); }
for(const [role,contract] of Object.entries(p.materials.roles)){
 const actual=doc.materials.find(material=>material.name===contract.binding);assert.ok(actual);
 const expected=p.materials.finalPbrValues[role],pbr=actual.pbrMetallicRoughness??{};
 near(pbr.baseColorFactor??[1,1,1,1],expected.baseColorLinear);
 assert.ok(Math.abs((pbr.metallicFactor??1)-expected.metallic)<1e-6);
 assert.ok(Math.abs((pbr.roughnessFactor??1)-expected.roughness)<1e-6);
 const strength=actual.extensions?.KHR_materials_emissive_strength?.emissiveStrength??1;
 near((actual.emissiveFactor??[0,0,0]).map(value=>value*strength),expected.baseColorLinear.slice(0,3).map(value=>value*expected.emissionStrength));
}
const box={min:[0,1,2].map(k=>Math.min(...points.map(v=>v[k]))),max:[0,1,2].map(k=>Math.max(...points.map(v=>v[k])))};
const blenderBox=summary.neutralBoundsBlenderMetres;
near(box.min,[blenderBox.min[0],blenderBox.min[2],-blenderBox.max[1]]);
near(box.max,[blenderBox.max[0],blenderBox.max[2],-blenderBox.min[1]]);
const runtimeChecks=checkRuntime(doc,p,poses,accessor);
const byName=new Map(p.bindings.map(b=>[b.name,b]));
// Lipschitz speed bound over each chain: translation speed + angular speed * enclosing radius.
let maxSpeed=0;
for(const a of poses.poses)for(const b of poses.poses)for(const leaf of Object.keys(radii)){
 let radius=radii[leaf],name=leaf,speed=0;
 while(name){
  const aa=a.localBlenderTRS[name],bb=b.localBlenderTRS[name];
  const angle=2*Math.acos(Math.min(1,Math.abs(dot(aa.rotationXyzw,bb.rotationXyzw))));
  speed+=len(sub(aa.translation,bb.translation))+angle*radius;
  radius+=Math.max(len(aa.translation),len(bb.translation));name=byName.get(name).parent;
 }
 maxSpeed=Math.max(maxSpeed,speed);
}
const padding=maxSpeed/80+1e-6, sampled=poses.sampledSweptBoundsBlenderMetres;
const conservative={min:sampled.min.map(x=>x-padding),max:sampled.max.map(x=>x+padding)};
const pupilMaxEllipse=runtimeChecks.geometryEyeChecks.maxEllipseNormalizedRadiusSquared,minimumPupilLidGap=runtimeChecks.geometryEyeChecks.conservativeContinuousGapMetres;
const gzip=zlib.gzipSync(bytes,{level:9});
const brotli=zlib.brotliCompressSync(bytes,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11}});
const measurements={rawGlbBytes:bytes.length,gzipBytes:gzip.length,brotliBytes:brotli.length,triangles,exportedVertexRecords:vertexRecords,nodes:doc.nodes.length,meshes:doc.meshes.length,materials:doc.materials.length,primitives:primitiveCount,textures:0,animations:0};
p.productionMeasurements={...p.productionMeasurements,...measurements,localBoundsMetres:box,fullSweptBoundsMetres:{basis:'Blender',...conservative},sourceBlendSha256:sha(fs.readFileSync(path.join(base,'selected-a.blend'))),exportSha256:sha(bytes)};
p.materials.exportedMaterialCount=7;p.materials.exportedTextureCount=0;p.appearanceConstraints.absoluteDimensionsMetres=box.max.map((v,k)=>v-box.min[k]);
write('profile.json',p);
const result={checkedAt:new Date().toISOString(),status:'PASS-offline-asset-structure-not-production-acceptance',assetSha256:sha(bytes),measurements,meshRecords,neutralBoundsGltfMetres:box,degenerateTriangles:degenerate,maxNormalLengthError:maxNormalError,
 hierarchyAndNeutralTRSMatch:true,materialsOpaqueAndUntextured:true,animationFree:true,requiredBindings:runtimeChecks.requiredBindings,movingBindings:runtimeChecks.movingBindings,runtimeChecks,
 pupilChecks:{maxEllipseNormalizedRadiusSquared:pupilMaxEllipse,minPupilToLidClearanceMetres:minimumPupilLidGap,highlightContained:true},
 sweep:{sampleCount:1025,scope:poses.sweepScope,paddingMetres:padding,maxVertexSpeedBoundMetresPerNormalizedTransition:maxSpeed,conservativeContinuousBoundsBlenderMetres:conservative,method:'41 samples per ordered pose pair; expand each side by max chain speed / 80 plus 1 micrometre; lerp translation and shortest quaternion slerp only',runtimeMarksIncluded:false},
 compression:{gzipLevel:9,brotliQuality:11,gzipSha256:sha(gzip),brotliSha256:sha(brotli)},
 limitations:['Isolated WebGL evidence is separate; no app integration/mobile acceptance/transport test','Source marks unbuilt; their bounds and resources remain unallocated','Independent visual and technical review pending']};
write('validation.json',result);
write('manifest.json',{candidateId:'selected-a-v01-candidate-001-build-v02',productionReady:false,status:'for-independent-review',rawSource:{path:'../raw/model.glb',sha256:'412c0c213e0c6adc6baa80fa0686b6cbd9a1d259348bb96c571ef28b2f59bec7'},export:{path:'selected-a.glb',sha256:sha(bytes),...measurements},editable:{path:'selected-a.blend',sha256:p.productionMeasurements.sourceBlendSha256},profile:{path:'profile.json',sha256:sha(fs.readFileSync(path.join(base,'profile.json')))},poses:{path:'poses.json',sha256:sha(fs.readFileSync(path.join(base,'poses.json')))},script:{path:'build_asset.py',sha256:sha(fs.readFileSync(path.join(base,'build_asset.py')))},neutralBoundsGltfMetres:box,sweptBoundsBlenderMetres:conservative,externalRoomScale:2,floorOffset:0,worldPlacement:null,allocationApproved:false,independentReview:null});
console.log(JSON.stringify({status:result.status,measurements,bounds:box,sweepPadding:padding,pupilMaxEllipse,minimumPupilLidGap},null,2));
