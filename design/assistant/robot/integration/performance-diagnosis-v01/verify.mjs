import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const dir=fileURLToPath(new URL('.',import.meta.url)),checks=[];
const read=f=>JSON.parse(readFileSync(join(dir,f),'utf8').replace(/^\uFEFF/,''));
for(const name of readdirSync(dir).filter(n=>n.endsWith('.mjs'))){execFileSync(process.execPath,['--check',join(dir,name)],{windowsHide:true,shell:false});checks.push({command:`node --check ${name}`,passed:true});}
const pins=execFileSync(process.execPath,[join(dir,'pin.mjs'),'after'],{encoding:'utf8',windowsHide:true,shell:false});checks.push({command:'node pin.mjs after',passed:true,output:pins.trim()});
assert.deepEqual(read('preview-before.json'),read('preview-after.json'));checks.push({name:'Root preview PID/creation/command unchanged',passed:true});
const analysis=read('analysis.json');assert.equal(analysis.matrix.length,8);assert.ok(analysis.matrix.every(r=>r.settled&&r.allVisibleFocused&&r.maxOutstanding===1&&r.uniqueIds===r.summary.sceneFrameCount&&r.negativeLatencies===0));checks.push({name:'All eight timing populations settled, visible, single-owner and internally consistent',passed:true});
assert.ok(read('attention.json').captures.length===2&&read('attention.json').captures.every(c=>c.passed));checks.push({name:'Exactly two requested attention states meet camera/focus/data/settle conditions',passed:true});
const restore=read('restoration.json').value;assert.ok(restore.width===1440&&restore.height===900&&Math.abs(restore.dpr-1)<1e-6&&!restore.dialogOpen&&!restore.probePresent&&restore.fetchNative);assert.deepEqual(read('contexts-after.json').contexts,[{i:0,default:true,pages:['about:blank']}]);checks.push({name:'Leased page restored and all private contexts closed',passed:true});
for(const entry of read('image-manifest.json').images)assert.equal(createHash('sha256').update(readFileSync(join(dir,entry.path))).digest('hex'),entry.sha256);checks.push({name:'Five image hashes match manifest',passed:true});
writeFileSync(join(dir,'verification.json'),JSON.stringify({at:new Date().toISOString(),checks,limit:'Evidence/harness consistency checks; not production performance acceptance or independent implementation review.'},null,2));
const files=readdirSync(dir).filter(n=>n!=='artifact-index.json').map(name=>{const bytes=readFileSync(join(dir,name));return{path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};});writeFileSync(join(dir,'artifact-index.json'),JSON.stringify({at:new Date().toISOString(),files},null,2));console.log(JSON.stringify({passed:checks.length,files:files.length,handoff:files.find(f=>f.path==='handoff.md')}));
