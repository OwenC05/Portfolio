import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fixture} from '../asset-pipeline/full-kit/technical/synthetic-fixture.mjs';

const base = 'design/studio-v2/asset-pipeline/full-kit/';
const prefix = 'design/studio-v2/scene-coordination/full-kit-fkt1-rereview-';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const original = JSON.parse(readFileSync(prefix+'probes.json', 'utf8'));
const synthetic = fixture();
const syntheticPath = prefix+'synthetic.bin';
writeFileSync(syntheticPath, synthetic.bytes); // Test fixture only, never an art export.
const candidates = [{label:'synthetic', path:syntheticPath, manifest:synthetic.manifest}];
for (const variant of ['baseline','proposal']) candidates.push({
  label:variant+' v02', path:base+`exports/studio-full-kit-m1-${variant}-v02.glb`,
  manifest:JSON.parse(readFileSync(base+`manifests/studio-full-kit-m1-${variant}-v02.manifest.json`))
});
const results = [];
for (const candidate of candidates) for (const mode of ['positive','wrongInventoryHash','incompleteFinal']) {
  const manifest = structuredClone(candidate.manifest);
  if (mode==='wrongInventoryHash') manifest.artInventorySha256='0'.repeat(64);
  if (mode==='incompleteFinal') manifest.stage='final';
  const input = prefix+'cli-input.json';
  writeFileSync(input, JSON.stringify(manifest, null, 2)+'\n');
  const args=[base+'technical/validate-full-kit.mjs',candidate.path,input];
  const child=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,timeout:30000});
  const record={candidate:candidate.label,mode,command:process.execPath,args,manifest,
    byteHash:sha(readFileSync(candidate.path)),exit:child.status,stdout:child.stdout,stderr:child.stderr};
  try {
    assert.ifError(child.error);
    const report=JSON.parse(child.stdout);
    assert.equal(manifest.glbSha256,record.byteHash);
    assert.equal(child.status,mode==='positive'?0:1);
    assert.equal(report.valid,mode==='positive');
    if(mode!=='positive') assert.deepEqual(report.errors,[`Studio full kit: ${mode==='wrongInventoryHash'?'art inventory hash mismatch':'final inventory incomplete'}`]);
    record.passed=true;
  } catch(error) {record.passed=false;record.error=error.message;}
  results.push(record);
}
const hashes=Object.fromEntries(Object.keys(original.sourcesAfter).map(path=>[path,sha(readFileSync(path))]));
const changed=Object.keys(hashes).filter(path=>hashes[path]!==original.sourcesAfter[path]);
writeFileSync(prefix+'cli.json',JSON.stringify({atUtc:new Date().toISOString(),results,changed,hashes},null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,total:results.length,changed,
  results:results.map(({candidate,mode,exit,passed,error})=>({candidate,mode,exit,passed,error}))},null,2));
process.exitCode=results.some(r=>!r.passed)||changed.length?1:0;
