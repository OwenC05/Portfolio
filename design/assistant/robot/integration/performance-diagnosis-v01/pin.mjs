import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
const root=process.cwd(),dir='design/assistant/robot/integration/performance-diagnosis-v01';
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const baseline=JSON.parse(readFileSync('design/assistant/robot/integration/verification-g4-v03/source-after.json','utf8').replace(/^\uFEFF/,''));
const files=baseline.files.map(f=>({path:f.path,bytes:readFileSync(f.path).length,sha256:sha(f.path),matches:sha(f.path)===f.sha256&&readFileSync(f.path).length===f.bytes}));
const buildId=readFileSync('.next/BUILD_ID','utf8').trim();
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const evidence=walk('design/assistant/robot/integration/final-browser-v01').map(p=>({path:relative(root,join(root,p)).replaceAll('\\','/'),sha256:sha(p),bytes:readFileSync(p).length}));
const stage=process.argv[2];if(!['before','after'].includes(stage))throw Error('before/after required');
const result={at:new Date().toISOString(),buildId,files,frozenPriorEvidence:evidence,renderer:{path:'node_modules/three/src/renderers/WebGLRenderer.js',sha256:sha('node_modules/three/src/renderers/WebGLRenderer.js')}};
writeFileSync(join(dir,`pins-${stage}.json`),JSON.stringify(result,null,2));
if(files.some(f=>!f.matches)||buildId!=='cFKSWm6Bayf__QstZY2CC')throw Error('SOURCE OR BUILD DRIFT');
if(stage==='after'){const before=JSON.parse(readFileSync(join(dir,'pins-before.json'),'utf8'));if(JSON.stringify(evidence)!==JSON.stringify(before.frozenPriorEvidence))throw Error('FROZEN EVIDENCE DRIFT');if(result.renderer.sha256!==before.renderer.sha256)throw Error('INSTALLED RENDERER DRIFT');}
console.log(JSON.stringify({stage,sourceCount:files.length,priorEvidenceFiles:evidence.length,allMatch:true,buildId}));
