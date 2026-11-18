// Narrow static-source/example verification. Never imports bpy, opens Blender or parses a GLB.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.resolve(here, name));
const json = name => JSON.parse(read(name));
const sha = b => createHash('sha256').update(b).digest('hex');
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-12, `${a} != ${b}`);
const checks=[], failures=[];
const check=(name,fn)=>{try{fn(); checks.push(name);}catch(e){failures.push({name,error:e.message});}};
for(const name of ['profile.example.json','manifest.example.json','source-receipt.json']) check(`JSON: ${name}`,()=>json(name));
const p=json('profile.example.json'), m=json('manifest.example.json'), r=json('source-receipt.json');
for(const [key,value] of Object.entries(r.sources)) check(`Pinned source: ${key}`,()=>{
  const b=read(value.relativePath); assert.equal(sha(b),value.sha256); assert.equal(b.length,value.bytes);
});
for(const value of r.preservedOriginalB) check(`Original B preserved: ${value.relativePath}`,()=>{
  const b=read(value.relativePath); assert.equal(sha(b),value.sha256); assert.equal(b.length,value.bytes);
});
const script=read(r.sources.script.relativePath).toString();
const passport=read(r.sources.passport.relativePath).toString();
const spec=read(r.sources.spec.relativePath).toString();
check('Passport matches exact v02 source and script',()=>{
  for(const key of ['blend','script']) assert.ok(passport.includes(r.sources[key].sha256));
  assert.equal(r.sources.blend.sha256,'ac48061fa08e53008be541e14f9e970c1bef9710089804c9fac17a683e1d7e1c');
  assert.equal(r.sources.script.sha256,'2fd5ecdf58dd9d0298eddee2beea5af613189bbe2836dbe87f1b73b26fc6709b');
  assert.equal(m.design.sha256,r.sources.spec.sha256);
  assert.deepEqual(p.sourcePins,r.sources);
  assert.equal(m.profile.sha256,sha(read('profile.example.json')));
  assert.equal(m.profile.id,p.profileId);
});
// Extract only literal constructor declarations from build_robot; no Python evaluation.
const build=script.split('def build_robot(tag, origin, coll, mats):')[1]?.split('def apply_pose(')[0]??'';
const sourceNodes=[];
for(const match of build.matchAll(/P\[([^\]]+)\]\s*=\s*(empty|mesh_obj)\(([\s\S]*?)\)\r?\n/g)){
  const key=match[1].match(/"([^"]+)"/)[1];
  const name=match[3].match(/^"([^"]+)"/)[1];
  const parentKey=match[3].match(/P\["([^"]+)"\]/)?.[1]??null;
  const expanded=name.includes('%s%s')?['L','R']:name.includes('%d%s')?[1,2,3,4]:[null];
  for(const value of expanded) sourceNodes.push({
    key:value===null?key:typeof value==='number'?key.replace('%d',value):key+value,
    name:value===null?name:name.replace(/%s%s|%d%s/,value), parentKey,
    kind:match[2]==='empty'?'empty':'mesh'
  });
}
const keyToName=new Map(sourceNodes.map(n=>[n.key,n.name]));
const keyedBlock=script.match(/KEYED = \{([\s\S]*?)\}\r?\n/)?.[1]??'';
const moving=[...keyedBlock.matchAll(/"([^"]+)"\s*:/g)].map(x=>keyToName.get(x[1])).sort();
check('Source constructor inventory and parent identities',()=>{
  assert.equal(sourceNodes.length,19);
  assert.equal(new Set(sourceNodes.map(n=>n.name)).size,19);
  const asset=sourceNodes.filter(n=>!n.name.startsWith('APR_card_'));
  assert.equal(asset.length,15);
  assert.equal(p.sourceBindings.length,15);
  const normalize=n=>({name:n.name,parent:n.parent,kind:n.kind});
  const source=asset.map(n=>({name:n.name,parent:keyToName.get(n.parentKey)??null,kind:n.kind}));
  assert.deepEqual(p.sourceBindings.map(normalize).sort((a,b)=>a.name.localeCompare(b.name)),source.sort((a,b)=>a.name.localeCompare(b.name)));
  assert.deepEqual(m.expectedBindingNodes,p.sourceBindings.map(({name,parent,moving})=>({name,parent,moving})));
  assert.ok(!sourceNodes.some(n=>n.name==='APR_lid_upper'));
  for(const node of p.sourceBindings) assert.ok(spec.includes('`'+node.name+'`') || /APR_(ear|eye|fin)_[LR]/.test(node.name));
});
check('Exactly eight moving bindings and forbidden demo data',()=>{
  assert.equal(moving.length,8);
  assert.deepEqual([...p.requiredMovingNodes].sort(),moving);
  assert.deepEqual(p.sourceBindings.filter(n=>n.moving).map(n=>n.name).sort(),moving);
  assert.deepEqual(p.rejectExportedNodes,['APR_lid_upper','APR_card_1','APR_card_2','APR_card_3','APR_card_4']);
  assert.equal(p.format.animations,false); assert.equal(p.format.skins,false); assert.equal(p.format.morphs,false);
  assert.deepEqual(m.clips,[]); assert.deepEqual(m.nodes,[]);
});
const tuple=names=>{
  const escaped=names.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const line=script.match(new RegExp('^'+escaped+'\\s*=\\s*([^#\\r\\n]+)','m'))?.[1];
  assert.ok(line,`Missing literal ${names}`);
  return line.replace(/[()]/g,'').split(',').map(s=>Number(s.trim()));
};
check('Eye origins, source neutral pivots and tray pose values',()=>{
  const [rx,ry,rz]=tuple('HEAD_RX, HEAD_RY, HEAD_RZ');
  const [xu,zu]=tuple('EYE_XU, EYE_ZU');
  const [,scale]=tuple('VIS_S, EYE_S, LID_S');
  const eye=[xu*rx*scale,-Math.sqrt(1-xu*xu-zu*zu)*ry*scale,zu*rz*scale];
  const byName=new Map(p.sourceBindings.map(n=>[n.name,n]));
  byName.get('APR_eye_L').sourceLocalPivotBlenderMetres.forEach((v,i)=>close(v,eye[i]));
  byName.get('APR_eye_R').sourceLocalPivotBlenderMetres.forEach((v,i)=>close(v,i===0?-eye[i]:eye[i]));
  close(p.runtime.eyeOriginSpacingMetres,2*eye[0]); close(2*eye[0],0.0684096);
  assert.deepEqual(byName.get('APR_lid_lower').sourceLocalPivotBlenderMetres,[0,0,0]);
  assert.deepEqual(tuple('REST'),[6,0,0]); assert.deepEqual(tuple('PRESENT'),[20,-0.014,-0.03]);
  close(tuple('TRAY_Z')[0],-0.228);
  assert.deepEqual(p.runtime.trayStates.carried.sourceLocalTranslationBlenderMetres,[0,0,-0.228]);
  p.runtime.trayStates.presented.sourceLocalTranslationBlenderMetres.forEach((v,i)=>close(v,[0,-0.03,-0.228-0.014][i]));
});
check('Held-depth arithmetic and coordinate-box conversion',()=>{
  const [radius,,thickness]=tuple('TRAY_RO, TRAY_RI, TRAY_T');
  const [a]=tuple('REST'),[b,,y]=tuple('PRESENT');
  const depth=degrees=>radius*Math.cos(degrees*Math.PI/180)+thickness/2*Math.sin(degrees*Math.PI/180);
  const min=y-depth(b),max=depth(a), s=r.arithmetic;
  close(s.carriedHalfDepth,depth(a)); close(s.presentedHalfDepth,depth(b));
  close(s.presentedMin,min); close(s.presentedMax,y+depth(b));
  close(s.heldTrayMin,min); close(s.heldTrayMax,max); close(s.heldTrayDepth,max-min); close(s.heldTrayMidpoint,(min+max)/2);
  close(s.boxFrontMargin,min+0.152); close(s.boxRearMargin,0.128-max);
  close(s.centreMinus003RearOverrun,max-0.11); close(s.centreZeroFrontOverrun,-0.14-min);
  close(s.reportedFinMargin,0.018); close(s.reportedLowMargin,0.014); close(s.reportedHighMargin,0.014);
  assert.equal(min.toFixed(3),'-0.142'); assert.equal(max.toFixed(3),'0.118');
  assert.ok(s.boxFrontMargin>0 && s.boxRearMargin>0);
  const box=p.heldClearanceProposal;
  box.centreBlenderMetres.forEach((v,i)=>{close(box.minBlenderMetres[i],v-box.dimensionsBlenderMetres[i]/2);close(box.maxBlenderMetres[i],v+box.dimensionsBlenderMetres[i]/2);});
  const C=p.coordinates.blenderToGltf, map=v=>C.map(row=>row.reduce((sum,x,i)=>sum+x*v[i],0));
  assert.deepEqual(C,[[1,0,0],[0,0,1],[0,-1,0]]);
  assert.deepEqual(map(box.centreBlenderMetres),box.centreGltfMetres);
  const corners=[];
  for(const x of [0,1])for(const y of [0,1])for(const z of [0,1])corners.push(map([x?box.maxBlenderMetres[0]:box.minBlenderMetres[0],y?box.maxBlenderMetres[1]:box.minBlenderMetres[1],z?box.maxBlenderMetres[2]:box.minBlenderMetres[2]]));
  for(let i=0;i<3;i++){close(Math.min(...corners.map(v=>v[i])),box.minGltfMetres[i]);close(Math.max(...corners.map(v=>v[i])),box.maxGltfMetres[i]);close(box.maxGltfMetres[i]-box.minGltfMetres[i],box.dimensionsGltfMetres[i]);}
  assert.equal(p.coordinates.placement.applications,1); assert.equal(p.coordinates.placement.worldUnitsPerMetre,2);assert.equal(p.coordinates.placement.addRoomFloorOffset,false);
});
check('Material source scope and unresolved production fields',()=>{
  const names=[...script.matchAll(/material\("([^"]+)"/g)].map(x=>x[1]).sort();
  assert.deepEqual(names,[...p.materialScope.sourceDatablocks].sort()); assert.equal(names.length,8);
  assert.equal(p.materialScope.intendedImportedNames.length,5);
  assert.ok(!names.includes('MAT_APR_tray_glow'));
  assert.equal(p.materialScope.pendingConsolidation.performed,false);
  assert.equal(p.productionReady,false);assert.equal(m.productionReady,false);assert.equal(p.allocation.approved,false);
  for(const [key,value] of Object.entries(p.allocation)) if(key!=='approved') assert.equal(value,null);
  for(const value of Object.values(m.counts)) assert.equal(value,null);
  for(const key of ['providerRawGlb','cleanupBlend','exportGlb']) assert.equal(m.files[key],null);
  assert.equal(m.sizes.rawGlbBytes,null); assert.equal(m.coordinates.neutralBoundsGltfMetres,null);
  assert.equal(p.heldClearanceProposal.fullSweptBoundsGltfMetres,null);
  assert.equal(p.runtime.marks.selectedLiftAndScaleApproval,null);
  assert.equal(p.runtime.marks.baked,false); assert.equal(p.runtime.marks.pickable,false);
  assert.equal(p.runtime.marks.overflowPolicy,'protocol-error-clear-all-views-no-truncation');
  assert.equal(p.coordinates.placement.anchorWorld,null);assert.equal(p.coordinates.placement.rotationXyzw,null);
  assert.equal(p.roomProfile.modify,false);
});
let localLinks=0;
check('Local Markdown references',()=>{
  for(const match of read('alignment.md').toString().matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].split('#')[0];
    if(target==='validation.json'){localLinks++;continue;} // this run writes it below
    assert.ok(fs.existsSync(path.resolve(here,target)),target);localLinks++;
  }
});
const artifacts=fs.readdirSync(here).filter(n=>n!=='validation.json').map(name=>({path:name,bytes:read(name).length,sha256:sha(read(name))}));
const result={checkedAt:new Date().toISOString(),command:'node design/assistant/robot/asset-pipeline/v02/verify-v02.mjs',node:process.version,scope:'v02 static source/example/hash/link/arithmetic validation only; no Blender/app/runtime/GLB acceptance',passed:failures.length===0,checks,failures,sourceFiles:Object.keys(r.sources).length,preservedOriginalBFiles:r.preservedOriginalB.length,sourceMasterObjects:sourceNodes.length,sourceBindings:p.sourceBindings.length,movingNodes:moving.length,localLinks,artifacts,remainingAuthorTextNotes:r.authorTextConflicts,remaining:'Appearance and placement, allocation, cleanup/export/profile freeze, full swept bounds and optional selection cue; future runtime/browser validation'};
fs.writeFileSync(path.join(here,'validation.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failures,sourceFiles:result.sourceFiles,preservedOriginalBFiles:result.preservedOriginalBFiles,sourceBindings:result.sourceBindings,movingNodes:result.movingNodes,localLinks},null,2));
process.exitCode=result.passed?0:1;
