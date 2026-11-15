import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as THREE from 'three';
import * as core from '../asset-pipeline/full-kit/technical/profile-core.mjs';
import {profile,inventory} from '../asset-pipeline/full-kit/technical/validate-full-kit.mjs';

const base='design/studio-v2/asset-pipeline/full-kit/';
const prefix='design/studio-v2/scene-coordination/m2-technical-';
const candidatePath=base+'exports/studio-full-kit-m2-proposal-v02.glb';
const manifestPath=base+'manifests/studio-full-kit-m2-proposal-v02.manifest.json';
const bytes=readFileSync(candidatePath),manifest=JSON.parse(readFileSync(manifestPath));
const previous=JSON.parse(readFileSync('design/studio-v2/scene-coordination/full-kit-fkt1-rereview-cli.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const paths=[...Object.keys(previous.hashes),candidatePath,manifestPath];
const snapshot=()=>Object.fromEntries(paths.map(p=>[p,hash(readFileSync(p))]));
const before=snapshot(),results=[];
async function probe(name,fn){try{results.push({name,passed:true,evidence:await fn()});}catch(error){results.push({name,passed:false,error:error.message,stack:error.stack});}}

await probe('held candidate and approved source identities',()=>{
 assert.equal(before[candidatePath],'2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411');
 assert.equal(before[manifestPath],'a3bd983a582d58875ed024e6815fa891f511b51e72b4d3b835c50692a9a48c51');
 for(const [path,expected]of Object.entries(previous.hashes))assert.equal(before[path],expected,path);
 assert.equal(manifest.variant,'proposal');assert.equal(manifest.stage,'M2');
 assert.equal(manifest.artInventorySha256,hash(readFileSync(base+'asset-inventory.json')));
 // These outputs were already produced when the narrowed instruction was read;
 // compare the completed receipt only, without repeating export or validation.
 const recomputed=JSON.parse(readFileSync(prefix+'recomputed.manifest.json'));
 assert.deepEqual(recomputed,manifest);
 const m1=JSON.parse(readFileSync(base+'manifests/studio-full-kit-m1-proposal-v02.manifest.json'));
 assert.deepEqual(manifest.targetWorldCorners,m1.targetWorldCorners);
 const priorMaterials=new Map(m1.materials.map(m=>[m.name,m.definition]));
 for(const material of manifest.materials)if(priorMaterials.has(material.name))assert.deepEqual(material.definition,priorMaterials.get(material.name));
 const newlyUsedMaterials=manifest.materials.filter(m=>!priorMaterials.has(m.name)).map(m=>m.name);
 assert.deepEqual(newlyUsedMaterials,['lib_glass']);assert.deepEqual(manifest.textures,m1.textures);
 const proxies=manifest.nodes.filter(n=>n.extras.proxy||n.name.includes('__proxy'));
 const present=new Set(manifest.nodes.map(n=>n.extras.assetId));
 const stageIds=new Set(inventory.assets.filter(a=>a.stage==='M2').map(a=>a.id));
 const stageNodes=manifest.nodes.filter(n=>stageIds.has(n.extras.assetId)&&!Object.keys(manifest.targetWorldCorners).includes(n.name));
 assert.equal(proxies.length,51);assert.equal(present.size-Number(present.has(undefined)),57);
 assert.equal(stageNodes.length,16);assert.ok(stageNodes.every(n=>!proxies.includes(n)));
 const missing=inventory.assets.filter(a=>!present.has(a.id)).map(a=>a.id);
 assert.deepEqual(missing.sort(),['music_cables','wall_cable_run']);
 return {exactManifestMatch:true,recomputedFileHash:hash(readFileSync(prefix+'recomputed.manifest.json')),
  unchangedReservedPlanes:Object.keys(manifest.targetWorldCorners),existingMaterialDefinitionsAndTexturesUnchanged:true,newlyUsedMaterials,
  presentIds:57,missing,stageLeaves:stageNodes.map(n=>n.name),laterProxyLeaves:proxies.map(n=>n.name)};
});

// Reuse the existing allocation and CPU image/Canvas2D boundary instrumentation,
// not any author test cases. Candidate bytes/manifest are substituted in memory.
const harnessUrl=pathToFileURL(resolve('components/studio/scene/verify-full-kit.mjs'));
let harness=readFileSync(harnessUrl,'utf8').split("test('synthetic bytes:")[0];
harness=harness.replaceAll('new URL(file, import.meta.url)',`new URL(file,${JSON.stringify(harnessUrl.href)})`);
harness=harness.replace(/from '([^']+)'/g,(_,n)=>`from '${n.startsWith('.')?new URL(n,harnessUrl).href:import.meta.resolve(n)}'`);
harness+='\nexport {fixture,loadTs,binder,resourcesModule,texturesModule,settle};';
const hlib=await import(`data:text/javascript;base64,${Buffer.from(harness).toString('base64')}`);
const builder=hlib.loadTs('./build-full-studio.ts',{three:THREE,'./bind-full-kit':hlib.binder,'./textures':hlib.texturesModule});

await probe('exact M2 installed loader, full builder, private ownership and disposal',async()=>{
 const h=hlib.fixture({bytes,manifest}),runtime=new hlib.resourcesModule.SceneResources();
 let first,second,model;
 try{
  first=await h.load(new AbortController().signal);
  const imported={geometry:new Set(h.owned.geometry),material:new Set(h.owned.material),texture:new Set(h.owned.texture)};
  const firstImages=[...h.images],original=new Set(),meshSet=new Set();
  first.root.traverse(o=>{original.add(o);if(o.isMesh)meshSet.add(o);});
  // The existing harness observes final material clones on disposal, whereas
  // loadMaterial only observes their base materials. Include the actual final
  // tree identities before rebinding so those clones are checked explicitly too.
  for(const mesh of meshSet){
   imported.geometry.add(mesh.geometry);
   for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
    imported.material.add(material);
    for(const slot of Object.values(material))if(slot?.isTexture)imported.texture.add(slot);
   }
  }
  assert.equal(meshSet.size,117);
  assert.deepEqual(first.root.position.toArray(),[0,0.11,0]);assert.deepEqual(first.root.scale.toArray(),[2,2,2]);
  const sideA=first.root.getObjectByName('mon_side__copilot'),sideB=first.root.getObjectByName('mon_side__typeforge');
  assert.equal(sideA.geometry,sideB.geometry);assert.equal(sideA.material,sideB.material);
  const uniqueGeometry=new Set([...meshSet].map(o=>o.geometry));
  const tris=o=>(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3;
  const placed=[...meshSet].reduce((sum,o)=>sum+tris(o),0);
  const unique=[...uniqueGeometry].reduce((sum,g)=>sum+(g.index?.count??g.getAttribute('position').count)/3,0);
  const casting=[...meshSet].filter(o=>o.castShadow),shadowTris=casting.reduce((sum,o)=>sum+tris(o),0);
  assert.equal(placed,24722);assert.equal(unique,22658);assert.equal(shadowTris,12680);assert.equal(casting.length,48);
  const stageIds=new Set(inventory.assets.filter(a=>a.stage==='M2').map(a=>a.id));
  const stageMeshes=[...meshSet].filter(o=>stageIds.has(o.userData.assetId)&&!Object.keys(manifest.targetWorldCorners).includes(o.name));
  const stageTriangles=stageMeshes.reduce((sum,o)=>sum+tris(o),0);assert.equal(stageTriangles,17702);
  const expected=core.expectedBindings(inventory,'proposal');
  for(const [name,spec]of Object.entries(expected)){
   const mesh=first.root.getObjectByName(name),p=mesh.geometry.getAttribute('position');
   const points=Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld));
   assert.ok(spec.corners.every(c=>points.some(v=>v.distanceTo(new THREE.Vector3(...c))<0.0002)),name);
   assert.equal(tris(mesh),2);assert.equal(mesh.castShadow,false);assert.equal(mesh.receiveShadow,false);
  }
  const placeholders=new Set([...meshSet].filter(o=>Object.keys(manifest.targetWorldCorners).includes(o.name)).map(o=>o.material));
  const dusk=first.root.getObjectByName('rt_window_dusk');
  model=builder.createFullStudio(runtime,first.root);
  assert.equal(model.scene.children.filter(o=>o===first.root).length,1);
  model.scene.traverse(o=>{if(o.isMesh){assert.ok(original.has(o));assert.equal(o.isInstancedMesh,undefined);}});
  assert.deepEqual(new Set(model.targets.map(t=>t.id)),new Set(['dissertation','copilot','typeforge']));
  assert.equal(new Set(model.targets.map(t=>t.border)).size,3);
  for(const target of model.targets){
   assert.equal(target.surface,first.root.getObjectByName('target_'+target.id));
   assert.equal(target.border,first.root.getObjectByName('border_'+target.id).material);
   assert.ok(runtime.materials.has(target.border));assert.ok(runtime.materials.has(target.surface.material));
   assert.ok(target.surface.material.map.isCanvasTexture);assert.equal(target.surface.material.toneMapped,false);
  }
  assert.deepEqual(new Set(model.occluders),new Set([...meshSet].filter(o=>o.userData.occluder)));
  const excluded=new Set([...profile.bindings.surfaces,...profile.bindings.borders]);
  assert.deepEqual(new Set(model.occluders),new Set([...meshSet].filter(o=>!excluded.has(o.name)&&!o.userData.transparent)));
  assert.ok(model.occluders.includes(dusk));assert.equal(dusk.material.transparent,false);
  assert.ok(model.occluders.includes(first.root.getObjectByName('display_studio')));
  for(const name of ['mon_cables__runs','under_desk_power__strip_loom']){
   const mesh=first.root.getObjectByName(name);assert.equal(mesh.castShadow,false);assert.ok(model.occluders.includes(mesh));
  }
  const glass=first.root.getObjectByName('pc_tower__glass');
  assert.equal(glass.material.transparent,true);assert.equal(glass.material.depthWrite,false);assert.equal(glass.renderOrder,2);
  assert.ok(!model.occluders.includes(glass));assert.equal(glass.castShadow,false);
  assert.throws(()=>hlib.binder.bindFullKit(runtime,first.root),/unbound validated/);
  const lights=[];model.scene.traverse(o=>{if(o.isLight)lights.push(o);});assert.equal(lights.filter(o=>o.castShadow).length,1);
  assert.equal(runtime.materials.size,8);assert.equal(runtime.textures.size,5);
  for(const r of [...runtime.materials,...runtime.textures])assert.ok(!imported.material.has(r)&&!imported.texture.has(r));
  for(const r of placeholders)assert.ok(imported.material.has(r)&&!h.disposed.has(r));
  let runtimeReleases=0;for(const r of [...runtime.materials,...runtime.textures])r.addEventListener('dispose',()=>runtimeReleases++);
  second=await h.load(new AbortController().signal);
  const secondMesh=second.root.getObjectByName('mon_side__copilot');
  assert.notEqual(sideA.geometry,secondMesh.geometry);assert.notEqual(sideA.material,secondMesh.material);
  const secondImages=h.images.slice(firstImages.length);assert.equal(firstImages.length,5);assert.equal(secondImages.length,5);
  assert.ok(secondImages.every(image=>!firstImages.includes(image)));
  first.dispose();first.dispose();assert.equal(runtimeReleases,0);
  for(const values of Object.values(imported))for(const r of values)assert.equal(h.disposed.get(r),1);
  assert.ok(firstImages.every(image=>image.closes===1));assert.ok(secondImages.every(image=>image.closes===0));
  assert.equal(h.disposed.get(secondMesh.geometry),undefined);assert.equal(h.disposed.get(secondMesh.material),undefined);
  runtime.dispose();runtime.dispose();assert.equal(runtimeReleases,13);
  second.dispose();second.dispose();await hlib.settle();h.assertReleased();
  return {meshLeaves:meshSet.size,uniqueGeometry:uniqueGeometry.size,uniqueTriangles:unique,placedTriangles:placed,
   shadowCasters:casting.length,shadowTriangles:shadowTris,stageLeaves:stageMeshes.length,stagePlacedTriangles:stageTriangles,
   targets:3,borders:3,occluders:model.occluders.length,occluderNames:model.occluders.map(o=>o.name),
   sharedMonSideGeometryAndMaterial:true,privateResourcesAcrossTwoLoads:true,
   importedUniqueResourcesPerLoad:Object.fromEntries(Object.entries(imported).map(([kind,set])=>[kind,set.size])),
   runtimeResourcesReleased:runtimeReleases,bitmapsPerLoad:firstImages.length,allOwnedReleasedExactlyOnce:true,
   runtimeReplacementOwnershipSeparate:true,shadowCastingLights:lights.filter(o=>o.castShadow).length,
   imageDecode:'ImageBitmap/Canvas2D CPU shims only',browserGpuDrawProof:false};
 }finally{first?.dispose();second?.dispose();runtime.dispose();model?.scene.traverse(o=>o.shadow?.dispose());h.restore();}
});
const after=snapshot(),changed=paths.filter(p=>before[p]!==after[p]);
writeFileSync(prefix+'probes.json',JSON.stringify({task:'task_86d1e13cbf86',dispatch:'ctx_b7590cf4506a',atUtc:new Date().toISOString(),
 node:process.version,sourceHashesBefore:before,sourceHashesAfter:after,changed,results},null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,total:results.length,changed,
 results:results.map(({name,passed,error,evidence})=>({name,passed,error,evidence}))},null,2));
process.exitCode=changed.length||results.some(r=>!r.passed)?1:0;
