import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as core from '../asset-pipeline/full-kit/technical/profile-core.mjs';
import {profile,inventory,candidateManifest,validateFullKit} from '../asset-pipeline/full-kit/technical/validate-full-kit.mjs';
import {fixture as makeFixture,encodeGlb} from '../asset-pipeline/full-kit/technical/synthetic-fixture.mjs';

const base='design/studio-v2/asset-pipeline/full-kit/';
const coord='design/studio-v2/scene-coordination/';
const hash=v=>createHash('sha256').update(v).digest('hex');
const hashFile=p=>hash(readFileSync(p));
const old=JSON.parse(readFileSync(coord+'full-kit-review-probes.json','utf8'));
const preserved=readdirSync(coord).filter(n=>n.startsWith('full-kit-review-')).map(n=>coord+n);
const tracked=[...Object.keys(old.sourcesAfter),...preserved,'design/studio-v2/scene-full-kit-technical-critique.md'];
const before=Object.fromEntries(tracked.map(f=>[f,hashFile(f)]));
const expectedRepair={
 'components/studio/scene/load-full-kit.ts':'37549d60af2eb7f5e1feaf0914fd0da496ec38441ebe088ce445d2914b5ad68f',
 'components/studio/scene/verify-full-kit.mjs':'ea836ba70da71020ba78b70b78311b46d2eacec798da4f8163e7b03a54b3b531',
 [base+'technical/profile-core.mjs']:'02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71',
 [base+'technical/validate-full-kit.mjs']:'66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75'
};
const results=[];
async function probe(name,fn){try{results.push({name,passed:true,evidence:await fn()});}catch(e){results.push({name,passed:false,error:e.message});}}

// Same instrumentation boundary as the original review; no author cases imported.
const harnessUrl=pathToFileURL(resolve('components/studio/scene/verify-full-kit.mjs'));
let harness=readFileSync(harnessUrl,'utf8').split("test('synthetic bytes:")[0];
harness=harness.replaceAll('new URL(file, import.meta.url)',`new URL(file,${JSON.stringify(harnessUrl.href)})`);
harness=harness.replace(/from '([^']+)'/g,(_,n)=>`from '${n.startsWith('.')?new URL(n,harnessUrl).href:import.meta.resolve(n)}'`);
const coreEntry="'@/design/studio-v2/asset-pipeline/full-kit/technical/profile-core.mjs': core,";
assert.ok(harness.includes(coreEntry));
harness=harness.replace(coreEntry,coreEntry.replace(': core,',': options.reviewCore ?? core,'));
harness+='\nexport {fixture,binder,resourcesModule,settle};';
const hlib=await import(`data:text/javascript;base64,${Buffer.from(harness).toString('base64')}`);

// Independently implement the canonical serializer; do not derive expected pins
// from the implementation export and feed them back as the trusted expectation.
function independentCanonical(v){
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return '['+v.map(independentCanonical).join(',')+']';
 return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+independentCanonical(v[k])).join(',')+'}';
}
await probe('held repair hashes and preserved old FKT-1 failures',()=>{
 for(const [f,h]of Object.entries(expectedRepair))assert.equal(before[f],h);
 const changed=Object.keys(old.sourcesAfter).filter(f=>old.sourcesAfter[f]!==before[f]);
 assert.deepEqual(changed.sort(),Object.keys(expectedRepair).sort());
 const failures=old.results.filter(r=>r.name.startsWith('runtime/offline manifest parity'));
 assert.equal(failures.length,2);assert.ok(failures.every(r=>r.evidence.runtimeAccepted));
 return {changedFiles:changed,originalFailures:failures};
});
await probe('raw and canonical pins independently match frozen source',()=>{
 const raw=readFileSync(base+'asset-inventory.json');
 const rawExpected='eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87';
 assert.equal(hash(raw),rawExpected);assert.equal(core.artInventorySha256,rawExpected);
 const canonicalHash=hash(independentCanonical(JSON.parse(raw)));
 assert.equal(core.artInventoryCanonicalSha256,canonicalHash);
 assert.equal(core.canonical(JSON.parse(raw)),independentCanonical(JSON.parse(raw)));
 return {rawSha256:rawExpected,canonicalSha256:canonicalHash,expectedOrigin:'raw hash preserved in original review; canonical serialization independently computed from actual file'};
});

async function runtime(bytes,manifest,options={},bind=false){
 const h=hlib.fixture({bytes,manifest,...options}),r=new hlib.resourcesModule.SceneResources();let asset,error,bindings;
 try{
  try{asset=await h.load(new AbortController().signal);if(bind)bindings=hlib.binder.bindFullKit(r,asset.root);}catch(e){error=e.message;}
  const result={accepted:!!asset,error,parserAllocated:!!h.parser,images:h.images.length,targets:bindings?.targets.length,blockers:bindings?.occluders.length};
  asset?.dispose();asset?.dispose();r.dispose();await hlib.settle();h.assertReleased();
  return {...result,cleanupPassed:true};
 }finally{asset?.dispose();r.dispose();h.restore();}
}
async function parity(bytes,manifest,reason){
 const offline=validateFullKit(bytes,manifest),live=await runtime(bytes,manifest);
 assert.equal(manifest.glbSha256,hash(bytes));
 assert.equal(offline.valid,false);assert.match(offline.errors[0],reason);
 assert.equal(live.accepted,false);assert.equal(live.error,offline.errors[0]);
 assert.equal(live.parserAllocated,false);assert.equal(live.images,0);
 return {byteHash:hash(bytes),offlineReason:offline.errors[0],runtime:live};
}
const synthetic=makeFixture();
const candidates=[{label:'original synthetic',...synthetic}];
for(const variant of ['baseline','proposal']){
 const path=base+`exports/studio-full-kit-m1-${variant}-v02.glb`;
 const bytes=readFileSync(path),manifest=JSON.parse(readFileSync(base+`manifests/studio-full-kit-m1-${variant}-v02.manifest.json`));
 candidates.push({label:`actual ${variant} v02`,bytes,manifest});
}
for(const c of candidates){
 await probe(c.label+' positive retained',async()=>{
  assert.equal(validateFullKit(c.bytes,c.manifest).valid,true);
  const live=await runtime(c.bytes,c.manifest,{},true);assert.equal(live.accepted,true);assert.equal(live.targets,3);
  assert.equal(live.blockers,c.manifest.nodes.filter(n=>n.extras.occluder).length);
  return {byteHash:hash(c.bytes),stage:c.manifest.stage,runtime:live};
 });
 for(const mode of ['wrongInventoryHash','incompleteFinal'])await probe(c.label+' repaired '+mode,async()=>{
  const m=structuredClone(c.manifest);
  if(mode==='wrongInventoryHash')m.artInventorySha256='0'.repeat(64);else m.stage='final';
  return parity(c.bytes,m,mode==='wrongInventoryHash'?/art inventory hash mismatch/:/final inventory incomplete/);
 });
}
for(const [field,value]of [['stage','M7'],['stage','final\n'],['stage',['M1']],['variant','proposal\n'],['variant',['baseline']]])await probe(`exact ${field} ${JSON.stringify(value)}`,async()=>{
 const m=structuredClone(synthetic.manifest);m[field]=value;
 return parity(synthetic.bytes,m,field==='stage'?/manifest identity\/stage/:/explicit baseline\/proposal required/);
});

function allInventoryFixture(proxy){
 const f=makeFixture();const template=f.doc.nodes.find(n=>n.name==='arch_shell__linked0');
 const ids=new Set(f.doc.nodes.map(n=>n.extras?.assetId));
 for(const a of inventory.assets)if(!ids.has(a.id)){
  const n=structuredClone(template);n.name=`${a.id}__review_completion`;n.extras.assetId=a.id;
  f.doc.nodes[0].children.push(f.doc.nodes.length);f.doc.nodes.push(n);
 }
 if(proxy==='flag')template.extras.proxy=true;
 if(proxy==='name')template.name='arch_shell__proxy_review_completion';
 const bytes=encodeGlb(f.doc,f.binary),manifest=candidateManifest(bytes,'baseline','final');
 assert.equal(new Set(manifest.nodes.map(n=>n.extras.assetId).filter(Boolean)).size,59);
 assert.ok(inventory.assets.every(a=>manifest.nodes.some(n=>n.extras.assetId===a.id)));
 return {bytes,manifest};
}
for(const proxy of [null,'flag','name'])await probe(`all59 final ${proxy??'positive'}`,async()=>{
 const f=allInventoryFixture(proxy);
 if(proxy)return {representedAssets:59,...await parity(f.bytes,f.manifest,/final contains proxy/)};
 assert.equal(validateFullKit(f.bytes,f.manifest).valid,true);const live=await runtime(f.bytes,f.manifest);assert.equal(live.accepted,true);
 return {representedAssets:59,runtime:live,scope:'structural semantic control; not final art'};
});
const changedInventory=structuredClone(inventory);changedInventory.assets[0].notes+=' [review-only content drift]';
await probe('bundled JSON semantic drift blocked despite unchanged candidate bytes/manifest',async()=>{
 const live=await runtime(synthetic.bytes,synthetic.manifest,{inventory:changedInventory});
 assert.equal(live.accepted,false);assert.match(live.error,/bundled art inventory identity mismatch/);assert.equal(live.parserAllocated,false);
 return {runtime:live,changed:'nonstructural asset note; IDs and candidate identity unchanged'};
});

// Single-guard mutants run only in memory, with the same independently pinned
// source inventory. Acceptance demonstrates that each negative reaches its guard.
async function mutatedCore(needle,replacement){
 let s=readFileSync(base+'technical/profile-core.mjs','utf8');assert.ok(s.includes(needle));
 s=s.replace(needle,replacement).replace("from 'three'",`from '${import.meta.resolve('three')}'`);
 return import(`data:text/javascript;base64,${Buffer.from(s).toString('base64')}`);
}
for(const mode of ['rawHash','finalCoverage','finalProxy','canonicalPin'])await probe('guard sensitivity '+mode,async()=>{
 let c=synthetic,options={},needle,replacement;
 if(mode==='rawHash'){
  c={bytes:synthetic.bytes,manifest:{...synthetic.manifest,artInventorySha256:'0'.repeat(64)}};
  needle="check(manifest.artInventorySha256 === artInventorySha256, 'art inventory hash mismatch');";replacement='';
 }else if(mode==='finalCoverage'){
  c={bytes:synthetic.bytes,manifest:{...synthetic.manifest,stage:'final'}};
  needle="check(inventory.assets.every((a) => ids.has(a.id)), 'final inventory incomplete');";replacement='';
 }else if(mode==='finalProxy'){
  c=allInventoryFixture('flag');
  needle="check(inspection.snapshot.nodes.every((n) => !n.extras.proxy && !n.name.includes('__proxy')), 'final contains proxy');";replacement='';
 }else{
  options.inventory=changedInventory;
  needle="check(canonicalSha256 === artInventoryCanonicalSha256, 'bundled art inventory identity mismatch');";replacement='';
 }
 const original=await runtime(c.bytes,c.manifest,options);assert.equal(original.accepted,false);
 const mutant=await runtime(c.bytes,c.manifest,{...options,reviewCore:await mutatedCore(needle,replacement)});assert.equal(mutant.accepted,true);
 return {original,mutant,singleGuardRemoved:needle};
});
const after=Object.fromEntries(tracked.map(f=>[f,hashFile(f)]));
const changedDuringRun=tracked.filter(f=>before[f]!==after[f]);
const report={task:'task_970928fa77f8',dispatch:'ctx_9621515e57ff',atUtc:new Date().toISOString(),node:process.version,scope:'FKT-1 only; real installed loader; author instrumentation reused; image/Canvas2D shims; no browser/GPU',sourcesBefore:before,sourcesAfter:after,changedDuringRun,results};
writeFileSync(coord+'full-kit-fkt1-rereview-probes.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,total:results.length,changedDuringRun,results},null,2));
process.exitCode=changedDuringRun.length||results.some(r=>!r.passed)?1:0;
