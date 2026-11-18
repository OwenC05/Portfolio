// Independent analytic eye/lid check of exported vertex geometry, not author helpers.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {Matrix4,Quaternion,Vector3} from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
const out=path.dirname(fileURLToPath(import.meta.url))
const base=path.resolve(out,'../../../asset-pipeline/selected-a-v01/candidate-001/build-v02')
const read=n=>JSON.parse(fs.readFileSync(path.join(base,n)))
const profile=read('profile.json'),poses=read('poses.json').poses
const bytes=fs.readFileSync(path.join(base,'selected-a.glb'))
const loaded=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
const near=(a,b)=>{assert.equal(a.length,b.length);a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<2e-6,`${a} / ${b}`))}
const vertices=name=>{const a=loaded.scene.getObjectByName(name).geometry.attributes.position;return Array.from({length:a.count},(_,i)=>[a.getX(i),a.getY(i),a.getZ(i)])}
const angle=q=>2*Math.atan2(q[0],q[3])
const materialChecks=[]
for(const [role,{binding}] of Object.entries(profile.materials.roles)){
 let actual
 loaded.scene.traverse(o=>{if(o.isMesh&&o.material.name===binding)actual=o.material})
 const p=profile.materials.finalPbrValues[role]
 assert.ok(actual);near(actual.color.toArray(),p.baseColorLinear.slice(0,3))
 near([actual.metalness,actual.roughness],[p.metallic,p.roughness])
 const product=actual.emissive.toArray().map(v=>v*actual.emissiveIntensity)
 near(product,p.baseColorLinear.slice(0,3).map(v=>v*p.emissionStrength))
 materialChecks.push({role,name:binding,loadedColor:actual.color.toArray(),loadedEmissive:actual.emissive.toArray(),loadedIntensity:actual.emissiveIntensity,product})
}
for(const pose of poses)assert.equal(pose.trayEmissionStrength,.10)
near(profile.poseContract.trayPresentedTRS.translation,poses.find(p=>p.name==='sources').localBlenderTRS.APA_tray.translation)
near(profile.poseContract.trayPresentedTRS.rotationXyzw,poses.find(p=>p.name==='sources').localBlenderTRS.APA_tray.rotationXyzw)
const sides=[]
for(const side of ['L','R']){
 const en='APA_eye_'+side,pn='APA_pupil_'+side,ln='APA_lid_lower_'+side,hn='APA_highlight_'+side
 const ev=vertices(en),pv=vertices(pn),lv=vertices(ln),hv=vertices(hn)
 const rx=Math.max(...ev.map(v=>Math.abs(v[0]))),ry=Math.max(...ev.map(v=>Math.abs(v[1])))
 const pr=Math.max(...pv.map(v=>Math.hypot(v[0],v[1]))),pBottom=Math.min(...pv.map(v=>v[1]))
 const neutral=poses[0].localGltfTRS
 let maxEllipse=0,minAnalyticGap=Infinity,minDenseGap=Infinity,where=null,maxAngularSpeed=0
 const endpoints=[]
 for(const p of poses){
  const t=p.localGltfTRS
  near(t[en].translation,neutral[en].translation);near(t[en].rotationXyzw,[0,0,0,1])
  near(t[pn].rotationXyzw,[0,0,0,1]);near(t[ln].translation,neutral[ln].translation)
  near(t[ln].rotationXyzw.slice(1,3),[0,0]);near(t[hn].translation,neutral[hn].translation)
  near(t[hn].rotationXyzw,neutral[hn].rotationXyzw)
  for(const n of [en,pn,ln,hn])near(t[n].scale,[1,1,1])
  for(const v of pv)maxEllipse=Math.max(maxEllipse,((v[0]+t[pn].translation[0])/rx)**2+((v[1]+t[pn].translation[1])/ry)**2)
  const theta=angle(t[ln].rotationXyzw)
  const lidTop=Math.max(...lv.map(v=>v[1]*Math.cos(theta)-v[2]*Math.sin(theta)))+t[ln].translation[1]-t[en].translation[1]
  // Centre-line top vertices provide the centre occlusion fraction. This is not
  // the fraction of eye area hidden, nor a camera-specific visible silhouette.
  const central=lv.filter(v=>Math.abs(v[0])<1e-7)
  assert.ok(central.length)
  const centreTop=Math.max(...central.map(v=>v[1]*Math.cos(theta)-v[2]*Math.sin(theta)))+t[ln].translation[1]-t[en].translation[1]
  endpoints.push({pose:p.name,angleRadians:theta,verticalGapMetres:pBottom+t[pn].translation[1]-lidTop,centreOcclusionFraction:(centreTop+ry)/(2*ry)})
 }
 for(const a of poses)for(const b of poses){
  const aa=a.localGltfTRS,bb=b.localGltfTRS,theta0=angle(aa[ln].rotationXyzw),omega=angle(bb[ln].rotationXyzw)-theta0
  assert.ok(Math.abs(omega)<Math.PI,'no branch crossing: linear X angle equals shortest slerp')
  const c0=pBottom+aa[pn].translation[1]-aa[ln].translation[1]+aa[en].translation[1]
  const c1=bb[pn].translation[1]-aa[pn].translation[1]
  maxAngularSpeed=Math.max(maxAngularSpeed,Math.abs(c1)+Math.abs(omega)*Math.max(...lv.map(v=>Math.hypot(v[1],v[2]))))
  // min over time of pupil bottom minus every lid vertex. Vertex y is sinusoidal
  // under pure X rotation; include endpoints and all derivative roots on [0,1].
  for(let vi=0;vi<lv.length;vi++){
   const [,y,z]=lv[vi],radius=Math.hypot(y,z),ts=[0,1]
   if(Math.abs(omega)>1e-14&&radius>0){
    const value=-c1/(omega*radius)
    if(Math.abs(value)<=1){
     const phase=Math.atan2(z,y),alpha=Math.asin(value)
     for(const root of [alpha,Math.PI-alpha])for(let turn=-2;turn<=2;turn++){
      const t=(root+turn*2*Math.PI-phase-theta0)/omega
      if(t>0&&t<1)ts.push(t)
     }
    }
   }
   for(const t of ts){const theta=theta0+omega*t,gap=c0+c1*t-y*Math.cos(theta)+z*Math.sin(theta)
    if(gap<minAnalyticGap){minAnalyticGap=gap;where={from:a.name,to:b.name,t,lidVertex:vi}}
   }
  }
  for(let step=0;step<=160;step++){
   const t=step/160,theta=theta0+omega*t
   const top=Math.max(...lv.map(v=>v[1]*Math.cos(theta)-v[2]*Math.sin(theta)))
   minDenseGap=Math.min(minDenseGap,c0+c1*t-top)
  }
 }
 const h=neutral[hn],hm=new Matrix4().compose(new Vector3(...h.translation),new Quaternion(...h.rotationXyzw).normalize(),new Vector3(1,1,1))
 const maxHighlightRadius=Math.max(...hv.map(v=>{const p=new Vector3(...v).applyMatrix4(hm);return Math.hypot(p.x,p.y)}))
 assert.ok(maxEllipse<1);assert.ok(maxHighlightRadius<pr)
 assert.ok(minAnalyticGap>0);assert.ok(minDenseGap>=minAnalyticGap-1e-12)
 assert.ok(Math.abs(minDenseGap-minAnalyticGap)<1e-6)
 sides.push({side,eyeRadiiMetres:[rx,ry],pupilRadiusMetres:pr,maxEllipseNormalizedRadiusSquared:maxEllipse,maxHighlightRadiusMetres:maxHighlightRadius,minAnalyticGapMetres:minAnalyticGap,minDenseGapMetres:minDenseGap,where,maxVerticalGapSpeed:maxAngularSpeed,conservative40StepPadding:maxAngularSpeed/80+1e-6,endpoints,hingeNeutralGltfTRS:neutral[ln]})
}
const report={status:'PASS-independent-angular-geometry-and-emission',assetSha256:createHash('sha256').update(bytes).digest('hex'),materialChecks,sides,proofBoundary:'Actual exported vertices; coupled five-pose endpoint pairs, local translation lerp and normalized shortest slerp with one common nonovershooting parameter; fixed eye/hinge translations; pure X lid rotations. Analytic vertical pupil/lid gap evaluates endpoints and all derivative roots. Convex ellipse contains translated pupil triangles throughout each pair because each fixed vertex has a convex quadratic along the linear path. Highlight geometry is fixed relative to pupil. This does not certify visible 3D silhouettes, all eye/face surface intersections, intermediate-to-third interruptions, extra offsets, room placement or runtime cards.'}
fs.writeFileSync(path.join(out,'angular-eyes.json'),JSON.stringify(report,null,2)+'\n')
const gs=new Set(),ms=new Set();loaded.scene.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material)}});for(const g of gs)g.dispose();for(const m of ms)m.dispose()
console.log(JSON.stringify({status:report.status,sides},null,2))
