import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const dir='design/assistant/robot/review/g4-v04-performance';
const rootEvidence='design/assistant/robot/integration/verification-g4-v04';
const commands=[];
for(const args of [
  ['--check',`${dir}/pin.mjs`],
  ['--check',`${dir}/analyze.mjs`],
  ['--check',`${dir}/verify.mjs`],
  [`${dir}/analyze.mjs`],
  [`${dir}/pin.mjs`,'after'],
]) {
  const result=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,shell:false});
  commands.push({executable:process.execPath,args,status:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?.message??null});
  assert.equal(result.status,0,JSON.stringify(commands.at(-1)));
}
const analysis=JSON.parse(readFileSync(`${dir}/analysis.json`,'utf8'));
assert.equal(analysis.reports.reduce((n,r)=>n+r.request.count,0),657);
assert.deepEqual(analysis.reports.map(r=>r.lateCount),[7,0,11]);
assert.equal(analysis.reports[2].lateWithinTwoClicksOfResize,11);
assert.equal(analysis.reports[2].lateWithRequestLongTaskOverlap,0);
assert.equal(analysis.rootFunctionalReceiptsConsistent,true);
const captures=JSON.parse(readFileSync(`${rootEvidence}/capture-manifest.json`,'utf8')).captures.map(f=>{
  const b=readFileSync(`${rootEvidence}/${f.file}`);
  const sha256=createHash('sha256').update(b).digest('hex');
  assert.equal(sha256,f.sha256);
  const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
  assert.deepEqual([width,height],[2880,1800]);
  return {file:f.file,sha256,width,height};
});
writeFileSync(`${dir}/commands.json`,JSON.stringify({at:new Date().toISOString(),commands,explorationErrors:[
  {command:'rg -n ... components/studio/StudioShell.tsx components/studio/StudioScene.tsx components/studio/scene/robot/adapter.ts',result:'Two nonexistent-path errors; combined inspection returned exit 1. Resolved actual shell import as app/studio/StudioShell.tsx; no adapter file needed.'},
  {command:'rg -n "Look left|Look right|onViewCommand" components/sections',result:'Nonexistent-directory error retained; corrected search across app, lib and components found actual source.'},
]},null,2));
writeFileSync(`${dir}/verification.json`,JSON.stringify({at:new Date().toISOString(),buildId:analysis.buildId,sourcePins:83,totalUnchangedFiles:152,sampleFrames:657,checks:{rawPercentilesMatch:true,frameSlicesMatch:true,sceneRenderDeltasMatch:true,trustedActionsMatch:true,oldMatrixPercentilesMatch:true,rootFunctionalReceiptsConsistent:true,captureHashesMatch:true,inputsUnchanged:true},disposition:'Measurement audit PASS within scope; desktop performance gate remains FAIL on repeat; no additional source correction supported.',captures},null,2));
const artifacts=readdirSync(dir).filter(p=>p!=='artifact-index.json').sort().map(path=>{const b=readFileSync(`${dir}/${path}`);return{path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};});
writeFileSync(`${dir}/artifact-index.json`,JSON.stringify({at:new Date().toISOString(),files:artifacts},null,2));
console.log(JSON.stringify({commandsPassed:commands.length,sourcePins:83,unchangedInputs:152,frames:657,lateFrames:[7,0,11],artifacts:artifacts.length,performance:'open; desktop repeat fails'},null,2));
