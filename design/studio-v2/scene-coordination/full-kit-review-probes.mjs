import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import * as core from '../asset-pipeline/full-kit/technical/profile-core.mjs';
import { profile, inventory, candidateManifest, validateFullKit } from '../asset-pipeline/full-kit/technical/validate-full-kit.mjs';
import { fixture as makeFixture, encodeGlb } from '../asset-pipeline/full-kit/technical/synthetic-fixture.mjs';

// Reuse the author's loader/image-boundary instrumentation, not its test cases.
// All assertions below are reviewer-authored. ImageBitmap and Canvas2D remain shims.
const harnessUrl = pathToFileURL(resolve('components/studio/scene/verify-full-kit.mjs'));
let harness = readFileSync(harnessUrl, 'utf8');
harness = harness.slice(0, harness.indexOf("test('synthetic bytes:"));
assert.ok(harness.endsWith('\n'));
harness = harness.replaceAll('new URL(file, import.meta.url)', `new URL(file, ${JSON.stringify(harnessUrl.href)})`);
harness = harness.replace(/from '([^']+)'/g, (_, name) => `from '${name.startsWith('.') ? new URL(name, harnessUrl).href : import.meta.resolve(name)}'`);
harness += '\nexport {fixture, loadTs, binder, resourcesModule, texturesModule, state, deferred, settle};';
const hlib = await import(`data:text/javascript;base64,${Buffer.from(harness).toString('base64')}`);
const base = 'design/studio-v2/asset-pipeline/full-kit/';
const sources = [
 'components/studio/scene/full-kit-types.ts','components/studio/scene/load-full-kit.ts','components/studio/scene/bind-full-kit.ts',
 'components/studio/scene/build-full-studio.ts','components/studio/scene/verify-full-kit.mjs','components/studio/scene/resources.ts',
 'components/studio/scene/picking.ts','components/studio/scene/textures.ts','components/studio/scene/controller.ts',
 `${base}full-kit-profile-v1.json`,`${base}asset-inventory.json`,`${base}technical/profile-core.mjs`,
 `${base}technical/validate-full-kit.mjs`,`${base}technical/export-manifest.mjs`,`${base}technical/synthetic-fixture.mjs`,
 'design/studio-v2/scene-coordination/full-kit-contract.md',
 'design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json',
 ...['baseline','proposal'].flatMap(v => ['v01','v02'].flatMap(n => [`${base}exports/studio-full-kit-m1-${v}-${n}.glb`,`${base}manifests/studio-full-kit-m1-${v}-${n}.manifest.json`]))
];
const hash = f => createHash('sha256').update(readFileSync(f)).digest('hex');
const before = Object.fromEntries(sources.map(f => [f,hash(f)]));
const results = [];
async function probe(name, fn) {
 try { const evidence = await fn(); results.push({name,executed:true,evidence}); }
 catch(error) { results.push({name,executed:false,error:error.message}); }
}
const builder = hlib.loadTs('./build-full-studio.ts', {three:THREE,'./bind-full-kit':hlib.binder,'./textures':hlib.texturesModule});

for (const variant of ['baseline','proposal']) {
 await probe(`actual ${variant} v02 validator, loader, full builder and disposal`, async () => {
  const path = `${base}exports/studio-full-kit-m1-${variant}-v02.glb`, bytes = readFileSync(path);
  const manifest = JSON.parse(readFileSync(`${base}manifests/studio-full-kit-m1-${variant}-v02.manifest.json`));
  const report = validateFullKit(bytes,manifest); assert.equal(report.valid,true);
  const h = hlib.fixture({bytes,manifest}), runtime = new hlib.resourcesModule.SceneResources();
  let asset;
  try {
   asset = await h.load(new AbortController().signal);
   const original = new Set(); asset.root.traverse(o => original.add(o));
   const dusk = asset.root.getObjectByName('rt_window_dusk'), placeholder = dusk.material;
   const model = builder.createFullStudio(runtime,asset.root);
   assert.equal(model.scene.children.filter(o => o===asset.root).length,1);
   const meshSet = new Set(); model.scene.traverse(o => {if(o.isMesh){meshSet.add(o);assert.ok(original.has(o));}});
   assert.equal(meshSet.size,report.metrics.primitiveInstances);
   assert.deepEqual(new Set(model.occluders),new Set([...meshSet].filter(o => o.userData.occluder)));
   assert.ok(model.occluders.includes(dusk)); assert.equal(dusk.material.transparent,false);
   assert.notEqual(dusk.material,placeholder); assert.ok(runtime.materials.has(dusk.material));
   assert.equal(new Set(model.targets.map(t => t.border)).size,3);
   const lights=[];model.scene.traverse(o=>{if(o.isLight)lights.push(o);});
   assert.equal(lights.filter(o=>o.castShadow).length,1);assert.equal(lights.filter(o=>o.isPointLight).length,5);
   assert.throws(()=>hlib.binder.bindFullKit(runtime,asset.root),/unbound validated/);
   let runtimeReleased=0; for(const r of [...runtime.materials,...runtime.textures])r.addEventListener('dispose',()=>runtimeReleased++);
   asset.dispose();asset.dispose();h.assertReleased();assert.equal(runtimeReleased,0);
   runtime.dispose();assert.equal(runtimeReleased,13);
   for(const l of lights)l.shadow?.dispose();
   return {valid:true,sha256:hash(path),metrics:report.metrics,blockers:model.occluders.length,meshes:meshSet.size,runtimeResourcesReleased:runtimeReleased,imageDecode:'shim-only',allImportedReleasedOnce:true};
  } finally {asset?.dispose();runtime.dispose();h.restore();}
 });
 await probe(`actual ${variant} v01 intended UV rejection preserved`, () => {
  const path=`${base}exports/studio-full-kit-m1-${variant}-v01.glb`,bytes=readFileSync(path);
  let reason;try{core.inspectFullKit(bytes,profile,inventory,variant);}catch(e){reason=e.message;}
  assert.match(reason,/upright UV/);return {sha256:hash(path),reason};
 });
}

for (const [name,mutate,pattern] of [
 ['shared parent',d=>d.nodes[0].children.push(d.nodes.findIndex(n=>n.name==='arch_shell__linked0')),/cycle\/multiple parent/],
 ['non-affine matrix',d=>{d.nodes[1].matrix[3]=0.1;},/non-affine/],
 ['unapproved extension',d=>{d.extensionsUsed=['EXT_mesh_gpu_instancing'];},/extension declaration/],
 ['target role asset identity',d=>{d.nodes.find(n=>n.name==='target_dissertation').extras.assetId='mouse_native';},null],
]) await probe(name,()=>{
 const f=makeFixture();mutate(f.doc);const bytes=encodeGlb(f.doc,f.binary);let rejected=false,reason;
 try{core.inspectFullKit(bytes,profile,inventory,'baseline');}catch(e){rejected=true;reason=e.message;}
 if(pattern)assert.match(reason,pattern);
 return {rejected,reason,expectedRejection:!!pattern};
});

for(const mode of ['wrongInventoryHash','incompleteFinal']) await probe(`runtime/offline manifest parity ${mode}`,async()=>{
 const f=makeFixture();const manifest=structuredClone(f.manifest);
 if(mode==='wrongInventoryHash')manifest.artInventorySha256='0'.repeat(64);else manifest.stage='final';
 const offline=validateFullKit(f.bytes,manifest);assert.equal(offline.valid,false);
 const h=hlib.fixture({bytes:f.bytes,manifest});let asset,error;
 try{try{asset=await h.load(new AbortController().signal);}catch(e){error=e.message;}
  return {offlineErrors:offline.errors,runtimeAccepted:!!asset,runtimeError:error};
 }finally{asset?.dispose();await hlib.settle();h.assertReleased();h.restore();}
});

for(const mode of ['geometryClone','materialClone','drawRange'])await probe(`validated root altered before binding ${mode}`,async()=>{
 const h=hlib.fixture(),runtime=new hlib.resourcesModule.SceneResources();let asset,replacement;
 try{
  asset=await h.load(new AbortController().signal);
  const a=asset.root.getObjectByName('arch_shell__linked0'),b=asset.root.getObjectByName('arch_shell__linked1');
  let releases=0;
  if(mode==='geometryClone'){replacement=a.geometry.clone();a.geometry=b.geometry=replacement;}
  if(mode==='materialClone'){replacement=a.material.clone();a.material=b.material=replacement;}
  if(mode==='drawRange')asset.root.getObjectByName('target_dissertation').geometry.setDrawRange(0,0);
  replacement?.addEventListener('dispose',()=>releases++);
  let accepted=false,error;try{hlib.binder.bindFullKit(runtime,asset.root);accepted=true;}catch(e){error=e.message;}
  asset.dispose();runtime.dispose();
  const releasedByOwners=releases;
  // Reviewer-created replacements are outside the original allocation ledger.
  // Release them explicitly before checking all observed original allocations.
  replacement?.dispose();replacement=undefined;h.assertReleased();
  return {bindingAccepted:accepted,error,replacementReleasedByOwners:releasedByOwners,precondition:mode==='drawRange'?'target drawRange.count=0':'both linked nodes replaced with a single equivalent clone; shared identity preserved'};
 }finally{asset?.dispose();runtime.dispose();replacement?.dispose();h.restore();}
});

await probe('unvalidated root fails before allocation',()=>{
 const r=new hlib.resourcesModule.SceneResources();
 assert.throws(()=>hlib.binder.bindFullKit(r,new THREE.Group()),/unbound validated/);
 assert.equal(r.materials.size,0);assert.equal(r.textures.size,0);return {rejected:true};
});

await probe('late decode sibling failure drains only after pending bitmap consumer settles',async()=>{
 const gate=hlib.deferred(),h=hlib.fixture({decodeGate:gate,decodeFailure:true});
 const pending=h.load(new AbortController().signal);let rejected=false;
 const observed=pending.catch(e=>{rejected=true;return e.message;});
 try{
  await h.decodeStarted;await hlib.settle();await hlib.settle();
  const before={rejected,bitmapCloses:h.images.map(i=>i.closes),releases:h.released.length};
  assert.equal(before.releases,0);gate.resolve();
  const reason=await observed;assert.match(reason,/required decoded slot/);await hlib.settle();h.assertReleased();
  return {beforePendingSiblingSettled:before,reason,afterReleaseCount:h.released.length,allAcquiredResourcesReleasedOnce:true};
 }finally{gate.resolve();await observed;h.restore();}
});

await probe('required extension texture decode failure is not hidden by null slot',async()=>{
 const f=makeFixture();delete f.doc.materials[2].pbrMetallicRoughness.baseColorTexture;
 f.doc.materials[1].extensions={KHR_materials_specular:{specularFactor:1,specularTexture:{index:2}}};
 f.doc.extensionsUsed=['KHR_materials_specular'];
 const bytes=encodeGlb(f.doc,f.binary),manifest=candidateManifest(bytes,'baseline','synthetic');
 assert.equal(validateFullKit(bytes,manifest).valid,true);
 const h=hlib.fixture({bytes,manifest,decodeFailure:true});
 try{let reason;try{await h.load(new AbortController().signal);}catch(e){reason=e.message;}
  assert.match(reason,/lib_plaster.specularIntensityMap missing/);await hlib.settle();h.assertReleased();
  return {validPreflight:true,reason,allAcquiredReleasedOnce:true};
 }finally{h.restore();}
});

await probe('shared bitmap across distinct texture consumers closes once after all texture releases',async()=>{
 const h=hlib.fixture({sharedBitmap:true});let asset;
 try{asset=await h.load(new AbortController().signal);assert.equal(h.images[0],h.images[1]);
  asset.dispose();asset.dispose();h.assertReleased();
  return {uniqueBitmaps:new Set(h.images).size,closeCount:h.images[0].closes,textureConsumers:[...h.owned.texture].filter(t=>t.image===h.images[0]).length};
 }finally{asset?.dispose();h.restore();}
});

await probe('duplicate-binding guard mutation sensitivity',async()=>{
 const file='components/studio/scene/bind-full-kit.ts';
 const source=readFileSync(file,'utf8');
 assert.ok(source.includes('!certificate || certificate.bound'));
 // Remove only the duplicate-binding branch and intact revalidation in memory:
 // the latter would otherwise reject already replaced materials first.
 const mutated=source.replace('!certificate || certificate.bound','!certificate').replace('certificate.assertIntact();','');
 const output=ts.transpileModule(mutated,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 const exports={},modules={three:THREE,'@/lib/studio-contract':{PROJECT_IDS:['dissertation','copilot','typeforge']},'./textures':hlib.texturesModule,'./full-kit-types':hlib.state};
 vm.runInNewContext(output,{exports,require:n=>modules[n]},{filename:'reviewer-in-memory-binder-mutant'});
 const h=hlib.fixture(),runtime=new hlib.resourcesModule.SceneResources();let asset;
 try{
  asset=await h.load(new AbortController().signal);hlib.binder.bindFullKit(runtime,asset.root);
  assert.throws(()=>hlib.binder.bindFullKit(runtime,asset.root),/unbound validated/);
  const second=exports.bindFullKit(runtime,asset.root);assert.equal(second.targets.length,3);
  return {originalRejects:true,mutantAccepts:true,mutant:'duplicate-bound guard and post-import integrity revalidation removed in memory only',runtimeTextures:runtime.textures.size};
 }finally{asset?.dispose();runtime.dispose();h.assertReleased();h.restore();}
});

const after=Object.fromEntries(sources.map(f=>[f,hash(f)]));
const sourceStable=sources.every(f=>before[f]===after[f]);
const report={task:'task_b2b62a79af12',dispatch:'ctx_70b616d3a242',atUtc:new Date().toISOString(),node:process.version,three:THREE.REVISION,
 scope:'independent assertions; author harness reused for loader instrumentation; actual installed loader; image/Canvas2D shims; no browser or GPU',sourcesBefore:before,sourcesAfter:after,sourceStable,results};
writeFileSync(new URL('./full-kit-review-probes.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceStable,results},null,2));
process.exitCode=sourceStable&&results.every(r=>r.executed)?0:1;
