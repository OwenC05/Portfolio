import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const out='design/assistant/robot/integration/dpr-candidate-v01',stage=process.argv[2];
assert.ok(['before','after'].includes(stage));
const owned=['components/studio/scene/controller.ts','components/studio/scene/verify-controller.mjs'];
const expected=['dbc91da47931fbbd592278ef5e82fe9db8c40d02fc29806b050161585f822afc','cc58de1b838a67a452481a9b9e750f578c95c570de8c04d4fe634db91a7283b0'];
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
if(stage==='before')for(const [i,p] of owned.entries()){assert.equal(hash(p),expected[i],`Starting source mismatch: ${p}`);copyFileSync(p,join(out,i===0?'controller.before.ts.txt':'verify-controller.before.mjs.txt'));}
const baseline=JSON.parse(readFileSync('design/assistant/robot/integration/verification-g4-v03/source-after.json','utf8').replace(/^\uFEFF/,''));
const files=baseline.files.map(f=>({path:f.path,bytes:readFileSync(f.path).length,sha256:hash(f.path),matchesBaseline:hash(f.path)===f.sha256,owned:owned.includes(f.path)}));
assert.ok(files.every(f=>f.matchesBaseline||(stage==='after'&&f.owned)),'Protected baseline drift');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const priorEvidence=['design/assistant/robot/integration/final-browser-v01','design/assistant/robot/integration/performance-diagnosis-v01'].flatMap(walk).map(p=>({path:p.replaceAll('\\','/'),bytes:readFileSync(p).length,sha256:hash(p)}));
if(stage==='after'){
 const before=JSON.parse(readFileSync(join(out,'pins-before.json'),'utf8'));assert.deepEqual(priorEvidence,before.priorEvidence,'Frozen prior evidence drift');
 const sourceBefore=readFileSync(join(out,'controller.before.ts.txt'),'utf8'),sourceAfter=readFileSync(owned[0],'utf8');assert.equal(sourceAfter,sourceBefore.replace('Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)','Math.min(window.devicePixelRatio || 1, 1.5)'),'Production delta must be exactly the authorized expression');
 for(const [i,p] of owned.entries())copyFileSync(p,join(out,i===0?'controller.after.ts.txt':'verify-controller.after.mjs.txt'));
}
writeFileSync(join(out,`pins-${stage}.json`),JSON.stringify({at:new Date().toISOString(),files,priorEvidence},null,2));
console.log(JSON.stringify({stage,baselineFiles:files.length,protected:files.filter(f=>!f.owned).length,priorEvidenceFiles:priorEvidence.length,owned:files.filter(f=>f.owned)}));
