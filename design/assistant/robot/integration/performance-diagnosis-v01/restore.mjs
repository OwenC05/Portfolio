import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const dir=fileURLToPath(new URL('.',import.meta.url)),page='0c891a8f-5ffd-4c83-a292-da00ef2ccf26';
const records=[];
function call(command,...args){const r=JSON.parse(execFileSync('orca',[command,...args,'--page',page,'--json'],{encoding:'utf8',windowsHide:true,shell:false,timeout:30000}));records.push({command,args,result:r});if(!r.ok)throw Error(JSON.stringify(r));return r.result;}
call('goto','--url','http://127.0.0.1:4193/studio');call('viewport','--width','1440','--height','900','--scale','1');call('wait','--selector','canvas[data-assistant-revision]');
const raw=call('eval','--expression',"JSON.stringify({url:location.href,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,dialogOpen:document.querySelector('dialog')?.open,canvas:{...document.querySelector('canvas')?.dataset},probePresent:!!(window.__diagnosis||window.__attentionFocus),fetchNative:Function.prototype.toString.call(fetch).includes('[native code]')})").result;
const value=typeof raw==='string'?JSON.parse(raw):raw;writeFileSync(join(dir,'restoration.json'),JSON.stringify({records,value},null,2));
if(value.url!=='http://127.0.0.1:4193/studio'||value.width!==1440||value.height!==900||Math.abs(value.dpr-1)>1e-6||value.dialogOpen||value.probePresent||!value.fetchNative||value.canvas.assistantRunId||value.canvas.assistantCardCount!=='0')throw Error('Restoration mismatch');
console.log(JSON.stringify(value));
