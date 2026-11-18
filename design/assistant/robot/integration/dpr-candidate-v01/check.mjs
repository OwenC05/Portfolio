import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const out='design/assistant/robot/integration/dpr-candidate-v01';
const stage=process.argv[2];
const pattern='loading precedes|real Three raycasting|renderer density|desktop and mobile cameras|perspective 390px|first usable viewport|pose survives|mouse, pen and touch commit|mouse and pen claim|touch horizontal|G2 robot uses|G2 feedback';
const commands={
 tests:['--test',`--test-name-pattern=${pattern}`,'components/studio/scene/verify-controller.mjs'],
 tsc:['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'],
 lint:['node_modules/eslint/bin/eslint.js','components/studio/scene/controller.ts','components/studio/scene/verify-controller.mjs'],
};
const kind=process.argv[3]??'tests';if(!commands[kind]||!/^[a-z0-9-]+$/.test(stage??''))throw Error('Pass receipt stage and tests/tsc/lint');
const result=spawnSync(process.execPath,commands[kind],{encoding:'utf8',windowsHide:true,shell:false});
writeFileSync(`${out}/${stage}.log`,(result.stdout??'')+(result.stderr??''));
writeFileSync(`${out}/${stage}.json`,JSON.stringify({at:new Date().toISOString(),command:[process.execPath,...commands[kind]],status:result.status,signal:result.signal,error:result.error?.message,log:`${stage}.log`},null,2));
console.log(JSON.stringify({stage,kind,status:result.status,log:`${stage}.log`}));process.exitCode=result.status??1;
