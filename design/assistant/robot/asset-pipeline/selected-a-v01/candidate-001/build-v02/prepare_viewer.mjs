import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const base=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(base,'../../../../../../..');
const require=createRequire(path.join(repo,'package.json'));const ts=require('typescript');
const out=path.join(base,'viewer');fs.mkdirSync(out,{recursive:true});
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const inputs=[];
for(const name of ['build-studio','resources','textures']){
 const source=path.join(repo,`components/studio/scene/${name}.ts`);
 let result=ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 result=result.replaceAll("'./resources'","'./resources.js'").replaceAll("'./textures'","'./textures.js'");
 fs.writeFileSync(path.join(out,name+'.js'),result);inputs.push({path:path.relative(repo,source),sha256:sha(source)});
}
for(const file of ['components/studio/scene/controller.ts','components/studio/scene/load-pilot.ts','design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json','public/studio/pilot-right-limit-v03.glb','node_modules/three/build/three.module.js','node_modules/three/build/three.core.js','node_modules/three/examples/jsm/loaders/GLTFLoader.js'])inputs.push({path:file,sha256:sha(path.join(repo,file))});
fs.copyFileSync(path.join(repo,'design/studio-v2/asset-pipeline/integration-contract/pilot-profile.json'),path.join(out,'pilot-profile.json'));
fs.writeFileSync(path.join(out,'source-receipt.json'),JSON.stringify({observedAt:new Date().toISOString(),threeVersion:JSON.parse(fs.readFileSync(path.join(repo,'node_modules/three/package.json'),'utf8')).version,typescriptVersion:ts.version,method:'transpile three current room TS modules into owned viewer directory; no app build or application edits',inputs},null,2));
console.log({repo,inputs:inputs.length});
