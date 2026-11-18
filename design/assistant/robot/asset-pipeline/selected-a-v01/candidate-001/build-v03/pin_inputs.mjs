import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const B=path.dirname(fileURLToPath(import.meta.url)),V=path.resolve(B,'../build-v02');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sha(path.join(V,'selected-a.glb')),'bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270');
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push({path:path.relative(B,p).replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:sha(p)});}}walk(V);
for(const p of ['../build-v01/files.json','../raw/model.glb','../cleanup-v01/selected-a-cleanup-start.blend','../../../../review/build-v02/visual/review.md'])files.push({path:p,bytes:fs.statSync(path.resolve(B,p)).size,sha256:sha(path.resolve(B,p))});
fs.writeFileSync(path.join(B,'input-receipt.json'),JSON.stringify({checkedAt:new Date().toISOString(),files},null,2));console.log({pinned:files.length});
