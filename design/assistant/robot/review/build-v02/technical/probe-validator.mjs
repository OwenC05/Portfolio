// Runs a COPY of the author validator with all inputs and outputs in this review.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const out=path.dirname(fileURLToPath(import.meta.url))
const base=path.resolve(out,'../../../asset-pipeline/selected-a-v01/candidate-001/build-v02')
const sandbox=path.join(out,'validator-copy')
fs.mkdirSync(sandbox,{recursive:true})
const names=['validate_contract.mjs','validate_asset.mjs','profile.json','poses.json','build-summary.json','selected-a.glb','selected-a.blend','build_asset.py']
const originals=new Map(names.map(n=>[n,fs.readFileSync(path.join(base,n))]))
const hash=b=>createHash('sha256').update(b).digest('hex')
function editJson(name,fn){const p=path.join(sandbox,name),o=JSON.parse(fs.readFileSync(p));fn(o);fs.writeFileSync(p,JSON.stringify(o))}
function editGlb(fn){
  const source=originals.get('selected-a.glb'),length=source.readUInt32LE(12)
  const doc=JSON.parse(source.subarray(20,20+length)),bin=source.subarray(28+length)
  fn(doc)
  const text=Buffer.from(JSON.stringify(doc)),json=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(json)
  const result=Buffer.alloc(12+8+json.length+8+bin.length)
  result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8)
  result.writeUInt32LE(json.length,12);result.writeUInt32LE(0x4e4f534a,16);json.copy(result,20)
  result.writeUInt32LE(bin.length,20+json.length);result.writeUInt32LE(0x004e4942,24+json.length);bin.copy(result,28+json.length)
  fs.writeFileSync(path.join(sandbox,'selected-a.glb'),result)
}
const probes=[
 ['control-unmodified',()=>{},'accept'],
 ['wrong-gltf-pose',()=>editJson('poses.json',p=>{p.poses.find(p=>p.name==='sources').localGltfTRS.APA_tray.translation=[20,30,40]}),'reject'],
 ['fabricated-sampled-envelope',()=>editJson('poses.json',p=>{p.sampledSweptBoundsBlenderMetres={min:[0,0,0],max:[0,0,0]}}),'reject'],
 ['wrong-moving-binding-list',()=>editJson('profile.json',p=>{p.requiredMovingNodes=[]}),'reject'],
 ['invalid-root-quaternion',()=>editGlb(d=>{d.nodes.find(n=>n.name==='APA_root').rotation=[0,0,0,2]}),'reject'],
 ['undeclared-node-light',()=>editGlb(d=>{d.nodes.find(n=>n.name==='APA_root').extensions={KHR_lights_punctual:{light:0}};d.extensions={KHR_lights_punctual:{lights:[{type:'point'}]}}}),'reject'],
 ['wrong-position-minmax',()=>editGlb(d=>{const a=d.accessors[d.meshes[0].primitives[0].attributes.POSITION];a.min=[0,0,0];a.max=[0,0,0]}),'reject'],
 ['unknown-extra-vertex-attribute',()=>editGlb(d=>{const p=d.meshes[0].primitives[0];p.attributes._UNREVIEWED=p.attributes.POSITION}),'reject'],
 ['missing-position-minmax',()=>editGlb(d=>{const a=d.accessors[d.meshes[0].primitives[0].attributes.POSITION];delete a.min;delete a.max}),'reject'],
 ['dangling-zero-skin',()=>editGlb(d=>{d.nodes.find(n=>n.mesh!==undefined).skin=0}),'reject'],
 ['double-sided-material-control',()=>editGlb(d=>{d.materials[0].doubleSided=true}),'reject'],
 ['out-of-range-position-buffer-control',()=>editGlb(d=>{const a=d.accessors[d.meshes[0].primitives[0].attributes.POSITION];a.byteOffset=1e8}),'reject'],
]
const results=[]
for(const [name,mutate,expected]of probes){
  for(const [name,data]of originals)fs.writeFileSync(path.join(sandbox,name),data)
  mutate()
  const result=spawnSync(process.execPath,[path.join(sandbox,'validate_asset.mjs')],{encoding:'utf8',windowsHide:true,timeout:30000})
  assert.equal(result.error,undefined)
  const actual=result.status===0?'accept':'reject'
  const rec={name,expected,actual,exitCode:result.status,guardCaught:expected===actual,stdout:result.stdout,stderr:result.stderr}
  if(expected==='reject' && actual==='accept'){
    const payload=fs.readFileSync(path.join(sandbox,'selected-a.glb')),warnings=[],previous=console.warn;console.warn=(...a)=>warnings.push(a.join(' '));
    try{const loaded=await new GLTFLoader().parseAsync(payload.buffer.slice(payload.byteOffset,payload.byteOffset+payload.byteLength),'');rec.installedLoader={accepted:true,warnings};const gs=new Set(),ms=new Set();loaded.scene.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material)}});for(const g of gs)g.dispose();for(const m of ms)m.dispose()}
    catch(error){rec.installedLoader={accepted:false,error:String(error),warnings}}
    finally{console.warn=previous}
  }
  results.push(rec)
}
for(const [name,data]of originals)assert.equal(hash(fs.readFileSync(path.join(base,name))),hash(data),'source mutated')
// Leave the copied directory at the unmodified control input, not a misleading mutant.
for(const [name,data]of originals)fs.writeFileSync(path.join(sandbox,name),data)
const control=spawnSync(process.execPath,[path.join(sandbox,'validate_asset.mjs')],{encoding:'utf8',windowsHide:true,timeout:30000})
assert.equal(control.status,0)
fs.writeFileSync(path.join(out,'validator-probes.json'),JSON.stringify({sourceValidatorSha256:hash(originals.get('validate_asset.mjs')),sourceContractGuardSha256:hash(originals.get('validate_contract.mjs')),candidateUnchanged:true,scope:'exact copied validator; no execution or writes in source build directory',results},null,2)+'\n')
console.log(JSON.stringify(results.map(({name,expected,actual,exitCode})=>({name,expected,actual,exitCode})),null,2))
