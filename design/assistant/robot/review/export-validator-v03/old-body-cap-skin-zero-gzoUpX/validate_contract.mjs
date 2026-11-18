import assert from 'node:assert/strict';
import {Matrix4,Quaternion,Vector3} from 'three';
const finite=(a,n)=>assert.ok(Array.isArray(a)&&a.length===n&&a.every(Number.isFinite),'finite vector '+n);
const near=(a,b,t=2e-6)=>{finite(a,b.length);a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<t,`mismatch ${a} / ${b}`));};
function valid(t){assert.deepEqual(Object.keys(t).sort(),['rotationXyzw','scale','translation']);finite(t.translation,3);finite(t.rotationXyzw,4);near(t.scale,[1,1,1]);assert.ok(Math.abs(Math.hypot(...t.rotationXyzw)-1)<2e-6,'unit quaternion');}
const convert=t=>{const c=new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-Math.PI/2);return {translation:[t.translation[0],t.translation[2],-t.translation[1]],rotationXyzw:c.clone().multiply(new Quaternion(...t.rotationXyzw)).multiply(c.clone().invert()).toArray(),scale:[1,1,1]};};
const compare=(a,b)=>{valid(a);valid(b);near(a.translation,b.translation);assert.ok(Math.abs(new Quaternion(...a.rotationXyzw).dot(new Quaternion(...b.rotationXyzw)))>1-2e-6);};
export function checkDocument(doc){
 function visit(o,where=''){
  if(!o||typeof o!=='object')return;
  if(o.extensions){assert.match(where,/^materials\/\d+$/,'extension location');assert.deepEqual(Object.keys(o.extensions),['KHR_materials_emissive_strength']);const e=o.extensions.KHR_materials_emissive_strength;assert.deepEqual(Object.keys(e),['emissiveStrength']);assert.ok(Number.isFinite(e.emissiveStrength)&&e.emissiveStrength>=0);}
  for(const [k,v]of Object.entries(o))visit(v,where?where+'/'+k:k);
 }visit(doc);
 for(const n of doc.nodes)valid({translation:n.translation??[0,0,0],rotationXyzw:n.rotation??[0,0,0,1],scale:n.scale??[1,1,1]});
 for(const mesh of doc.meshes)for(const p of mesh.primitives){assert.deepEqual(Object.keys(p.attributes).sort(),['NORMAL','POSITION']);for(const key of ['NORMAL','POSITION']){const a=doc.accessors[p.attributes[key]];assert.equal(a.type,'VEC3');assert.equal(a.componentType,5126);assert.ok(!a.normalized);}const a=doc.accessors[p.indices];assert.equal(a.type,'SCALAR');assert.ok([5121,5123,5125].includes(a.componentType));assert.ok(!a.normalized);}
}
export function checkAccessor(a,values){
 for(const key of ['min','max'])if(a[key]){const actual=Array.from({length:values[0].length},(_,k)=>values.reduce((s,v)=>key==='min'?Math.min(s,v[k]):Math.max(s,v[k]),key==='min'?Infinity:-Infinity));near(a[key],actual,1e-6);}
}
export function checkRuntime(doc,p,poses,accessor){
 const parentContract={APA_root:null,APA_head:'APA_root',APA_body:'APA_root',APA_tray:'APA_root',APA_seam:'APA_head',APA_face_rim:'APA_head',APA_face:'APA_head',APA_bookmark_post:'APA_head',APA_bookmark_ribbon:'APA_bookmark_post',APA_collar:'APA_body',APA_body_cap:'APA_body',APA_mitten_L:'APA_body',APA_mitten_R:'APA_body',APA_tray_glow:'APA_tray'};
 for(const side of ['L','R'])Object.assign(parentContract,{['APA_eye_'+side]:'APA_head',['APA_pupil_'+side]:'APA_eye_'+side,['APA_highlight_'+side]:'APA_pupil_'+side,['APA_lid_lower_'+side]:'APA_head'});
 const expected=Object.keys(parentContract).sort(),bindings=new Map(p.bindings.map(b=>[b.name,b]));
 assert.deepEqual(p.bindings.map(b=>b.name).sort(),expected);assert.deepEqual(doc.nodes.map(n=>n.name).sort(),expected);
 const moving=['APA_root','APA_head','APA_body','APA_tray','APA_mitten_L','APA_mitten_R','APA_pupil_L','APA_pupil_R','APA_lid_lower_L','APA_lid_lower_R'].sort();
 const derived=p.bindings.filter(b=>b.moving).map(b=>b.name).sort();assert.deepEqual(derived,moving);assert.deepEqual([...p.requiredMovingNodes].sort(),derived);
 const actualParents=new Map();for(const n of doc.nodes)for(const i of n.children??[]){assert.ok(Number.isInteger(i)&&doc.nodes[i]);assert.ok(!actualParents.has(doc.nodes[i].name));actualParents.set(doc.nodes[i].name,n.name);}
 for(const b of p.bindings){assert.equal(typeof b.moving,'boolean');assert.equal(b.parent,parentContract[b.name]);assert.equal(actualParents.get(b.name)??null,b.parent);const n=doc.nodes.find(n=>n.name===b.name);assert.equal(n.extras.movingBinding,b.moving);assert.equal(n.extras.semanticBinding,b.name);let name=b.name,seen=new Set();while(name){assert.ok(!seen.has(name));seen.add(name);name=parentContract[name];}const t={translation:b.neutralTranslationBlenderMetres,rotationXyzw:b.neutralRotationXyzw,scale:b.neutralScale};compare(b.neutralGltfTRS,convert(t));}
 assert.deepEqual(poses.poses.map(x=>x.name),['neutral','attention','sources','no-match','dismissal']);assert.deepEqual(p.poseContract.finitePoses,poses.poses.map(x=>x.name));
 for(const pose of poses.poses){assert.deepEqual(Object.keys(pose.localBlenderTRS).sort(),expected);assert.deepEqual(Object.keys(pose.localGltfTRS).sort(),expected);assert.equal(pose.trayEmissionStrength,.10);for(const name of expected){const b=pose.localBlenderTRS[name],g=pose.localGltfTRS[name];valid(b);compare(g,convert(b));if(!bindings.get(name).moving)compare(g,poses.poses[0].localGltfTRS[name]);}}
 for(const b of p.bindings)compare(b.neutralGltfTRS,poses.poses[0].localGltfTRS[b.name]);
 const vertices=new Map();for(const n of doc.nodes)if(n.mesh!==undefined){const prim=doc.meshes[n.mesh].primitives;vertices.set(n.name,prim.flatMap(p=>accessor(p.attributes.POSITION)));}
 function matrices(a,b,t){const world=new Map(),local=new Map();for(const name of expected){const aa=a.localGltfTRS[name],bb=b.localGltfTRS[name];local.set(name,new Matrix4().compose(new Vector3(...aa.translation).lerp(new Vector3(...bb.translation),t),new Quaternion(...aa.rotationXyzw).slerp(new Quaternion(...bb.rotationXyzw),t),new Vector3(1,1,1)));}function get(name){if(world.has(name))return world.get(name);const m=local.get(name).clone(),parent=parentContract[name];if(parent)m.premultiply(get(parent));world.set(name,m);return m;}expected.forEach(get);return world;}
 for(const pose of poses.poses){const w=matrices(pose,pose,0),box={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};for(const [name,verts]of vertices)for(const point of verts){const v=new Vector3(...point).applyMatrix4(w.get(name)),bp=[v.x,-v.z,v.y];for(let k=0;k<3;k++){box.min[k]=Math.min(box.min[k],bp[k]);box.max[k]=Math.max(box.max[k],bp[k]);}}const declared=poses.poseBounds.find(x=>x.pose===pose.name)?.boundsBlenderMetres;assert.ok(declared);near(declared.min,box.min);near(declared.max,box.max);}
 const sampled={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};const v=new Vector3();let sampleCount=0;
 for(const a of poses.poses)for(const b of poses.poses)for(let i=0;i<=40;i++){const world=matrices(a,b,i/40);sampleCount++;for(const [name,verts]of vertices)for(const point of verts){v.fromArray(point).applyMatrix4(world.get(name));const bp=[v.x,-v.z,v.y];for(let k=0;k<3;k++){sampled.min[k]=Math.min(sampled.min[k],bp[k]);sampled.max[k]=Math.max(sampled.max[k],bp[k]);}}}
 near(poses.sampledSweptBoundsBlenderMetres.min,sampled.min);near(poses.sampledSweptBoundsBlenderMetres.max,sampled.max);assert.equal(poses.sweepSamples,sampleCount);
 let maxEllipse=0,minGap=Infinity,maxHighlightRadius=0,maxGapSpeed=0;const eyes=[];
 for(const side of ['L','R']){
  const eyeName='APA_eye_'+side,pupilName='APA_pupil_'+side,lidName='APA_lid_lower_'+side,highlightName='APA_highlight_'+side;
  const ev=vertices.get(eyeName),pv=vertices.get(pupilName),rx=Math.max(...ev.map(v=>Math.abs(v[0]))),ry=Math.max(...ev.map(v=>Math.abs(v[1]))),pr=Math.max(...pv.map(v=>Math.hypot(v[0],v[1])));
  near([rx,ry],poses.eyeConstraints[side].radiiRaw.map(x=>x*poses.physicalScale));assert.ok(Math.abs(pr-poses.eyeConstraints[side].pupilRadiusRaw*poses.physicalScale)<2e-6);
  const lr=Math.max(...vertices.get(lidName).map(v=>Math.hypot(...v)));
  const lidAngles=poses.poses.map(p=>{const q=p.localGltfTRS[lidName].rotationXyzw;near([q[1],q[2]],[0,0]);return 2*Math.atan2(q[0],q[3]);});
  near([Math.min(...lidAngles),Math.max(...lidAngles)],p.poseContract.lidLimits.angleRadians);
  for(const a of poses.poses)for(const b of poses.poses){
   const aa=a.localGltfTRS,bb=b.localGltfTRS;near(aa[pupilName].rotationXyzw,[0,0,0,1]);near(aa[eyeName].rotationXyzw,[0,0,0,1]);near(aa[lidName].translation,bb[lidName].translation);
   const angle=2*Math.acos(Math.min(1,Math.abs(new Quaternion(...aa[lidName].rotationXyzw).dot(new Quaternion(...bb[lidName].rotationXyzw)))));
   maxGapSpeed=Math.max(maxGapSpeed,Math.abs(aa[pupilName].translation[1]-bb[pupilName].translation[1])+angle*lr);
   for(let i=0;i<=40;i++){const w=matrices(a,b,i/40),eyeInverse=w.get(eyeName).clone().invert();function inEye(name){const transform=eyeInverse.clone().multiply(w.get(name));return vertices.get(name).map(pt=>new Vector3(...pt).applyMatrix4(transform));}const pup=inEye(pupilName),lid=inEye(lidName);for(const v of pup)maxEllipse=Math.max(maxEllipse,(v.x/rx)**2+(v.y/ry)**2);minGap=Math.min(minGap,Math.min(...pup.map(v=>v.y))-Math.max(...lid.map(v=>v.y)));const hm=w.get(pupilName).clone().invert().multiply(w.get(highlightName));for(const point of vertices.get(highlightName)){const v=new Vector3(...point).applyMatrix4(hm);const radius=Math.hypot(v.x,v.y);maxHighlightRadius=Math.max(maxHighlightRadius,radius);assert.ok(radius<pr-1e-6,'actual highlight geometry containment');}}
  }
  eyes.push({side,eyeRadiiMetres:[rx,ry],pupilRadiusMetres:pr});
 }
 const gapPadding=maxGapSpeed/80+1e-6;assert.ok(maxEllipse<1,'actual exported pupil containment');assert.ok(minGap-gapPadding>0,'actual exported continuous pupil/lid clearance');
 return {requiredBindings:expected.length,movingBindings:derived.length,runtimeSampleCount:sampleCount,recomputedSampledBoundsBlenderMetres:sampled,geometryEyeChecks:{sampleCount:1025,maxEllipseNormalizedRadiusSquared:maxEllipse,minPupilToLidClearanceMetres:minGap,continuousGapPaddingMetres:gapPadding,conservativeContinuousGapMetres:minGap-gapPadding,maxHighlightRadiusMetres:maxHighlightRadius,eyes},scope:'actual exported geometry; five endpoints/common-parameter pairwise lerp and shortest slerp; excludes intermediate-to-third interruption, independent easing clocks, extra gaze/lid offsets and runtime cards'};
}
