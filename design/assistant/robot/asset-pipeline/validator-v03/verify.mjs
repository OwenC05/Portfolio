import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {checkDocument} from './validate_contract.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../../..');
const base=path.resolve(here,'../selected-a-v01/candidate-001/build-v02');
const mode=process.argv[2];
assert.ok(['before','after'].includes(mode),'Pass before or after');
const artifacts=path.join(root,'.omx/artifacts');fs.mkdirSync(artifacts,{recursive:true});
const sandbox=fs.mkdtempSync(path.join(artifacts,'robot-validator-v03-'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const names=['validate_asset.mjs','validate_contract.mjs','selected-a.glb','selected-a.blend','profile.json','poses.json','build-summary.json','build_asset.py'];
const original=new Map(names.map(name=>[name,fs.readFileSync(path.join(base,name))]));
const sourcePins=Object.fromEntries([...original].map(([name,bytes])=>[name,hash(bytes)]));
const source=original.get('selected-a.glb'),length=source.readUInt32LE(12);
const definition=JSON.parse(source.subarray(20,20+length)),binary=source.subarray(28+length);
const firstPosition=doc=>doc.accessors[doc.meshes[0].primitives[0].attributes.POSITION];
function writeGlb(doc){
 const text=Buffer.from(JSON.stringify(doc));const json=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(json);
 const bytes=Buffer.alloc(28+json.length+binary.length);
 bytes.writeUInt32LE(0x46546c67,0);bytes.writeUInt32LE(2,4);bytes.writeUInt32LE(bytes.length,8);
 bytes.writeUInt32LE(json.length,12);bytes.writeUInt32LE(0x4e4f534a,16);json.copy(bytes,20);
 bytes.writeUInt32LE(binary.length,20+json.length);bytes.writeUInt32LE(0x004e4942,24+json.length);binary.copy(bytes,28+json.length);
 fs.writeFileSync(path.join(sandbox,'selected-a.glb'),bytes);
}
const fullCases=[
 ['valid-v02',()=>{},0],
 ['missing-POSITION-bounds',doc=>{delete firstPosition(doc).min;delete firstPosition(doc).max},1],
 ['dangling-zero-skin',doc=>{doc.nodes.find(node=>node.mesh!==undefined).skin=0},1],
];
const results=[];
for(const [name,mutate,expected]of fullCases){
 for(const [file,bytes]of original)fs.writeFileSync(path.join(sandbox,file),bytes);
 for(const file of ['validate_asset.mjs','validate_contract.mjs'])fs.copyFileSync(path.join(here,file),path.join(sandbox,file));
 const doc=structuredClone(definition);mutate(doc);writeGlb(doc);
 const result=spawnSync(process.execPath,[path.join(sandbox,'validate_asset.mjs')],{encoding:'utf8',windowsHide:true,shell:false,timeout:120000,maxBuffer:2*1024*1024});
 assert.equal(result.error,undefined);
 const passed=expected===0?result.status===0:result.status===1;
 results.push({name,kind:'actual full validator on private GLB',expectedExit:expected,exitCode:result.status,passed,diagnostic:result.stderr?.slice(0,1800)});
 console.log(JSON.stringify({name,expectedExit:expected,exitCode:result.status,passed}));
}
const guardCases=[
 ['valid-document',()=>{},false],
 ['missing-min',doc=>{delete firstPosition(doc).min},true],
 ['missing-max',doc=>{delete firstPosition(doc).max},true],
 ['null-bounds',doc=>{firstPosition(doc).min=null;firstPosition(doc).max=null},true],
 ['short-bounds',doc=>{firstPosition(doc).min=[0,0]},true],
 ['inverted-bounds',doc=>{firstPosition(doc).min=[1,1,1];firstPosition(doc).max=[0,0,0]},true],
 ['nonfinite-bounds',doc=>{firstPosition(doc).min=[NaN,0,0]},true],
 ['null-skin-reference',doc=>{doc.nodes.find(node=>node.mesh!==undefined).skin=null},true],
];
for(const [name,mutate,reject]of guardCases){
 const doc=structuredClone(definition);mutate(doc);let threw=false,diagnostic;
 try{checkDocument(doc)}catch(error){threw=true;diagnostic=String(error)}
 results.push({name,kind:'document guard on actual candidate metadata',expectedReject:reject,rejected:threw,passed:threw===reject,diagnostic});
}
for(const [name,sha256]of Object.entries(sourcePins))assert.equal(hash(fs.readFileSync(path.join(base,name))),sha256,`Frozen input changed: ${name}`);
const newPins=Object.fromEntries(['validate_asset.mjs','validate_contract.mjs','verify.mjs'].map(name=>[name,hash(fs.readFileSync(path.join(here,name)))]));
fs.writeFileSync(path.join(here,`${mode}-checks.json`),JSON.stringify({at:new Date().toISOString(),mode,sourcePins,newPins,originalInputsUnchanged:true,results,limits:['Two known format gaps plus bounded adjacent document guards; not comprehensive glTF fuzzing or asset/runtime acceptance.']},null,2)+'\n');
// Delete only this exact generated sandbox after checking its resolved boundary.
const relative=path.relative(fs.realpathSync(artifacts),fs.realpathSync(sandbox));
assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(sandbox).startsWith('robot-validator-v03-'));
fs.rmSync(sandbox,{recursive:true,force:true});
console.log(JSON.stringify({passed:results.filter(item=>item.passed).length,total:results.length,sourceUnchanged:true,temporaryCopyRemoved:true}));
if(results.some(item=>!item.passed))process.exitCode=1;
