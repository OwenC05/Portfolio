import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
const [page,output]=process.argv.slice(2)
if(!page||!output)throw Error('Pass owned page and new evidence directory')
mkdirSync(output,{recursive:true});const checks=[]
function call(command,...args){const r=JSON.parse(execFileSync('orca',[command,...args,'--page',page,'--json'],{encoding:'utf8',windowsHide:true,shell:false,timeout:25000}));if(!r.ok)throw Error(JSON.stringify(r.error));return r.result}
function evaluate(code){const r=call('eval','--expression',code).result;return typeof r==='string'?JSON.parse(r):r}
function check(name,passed){checks.push({name,passed:!!passed});assert.ok(passed,name);console.log(name)}
function tree(){return call('snapshot','--interactive')}
function ref(s,role,name){const p=Object.entries(s.refs).find(([,v])=>v.role===role&&name.test(v.name));assert.ok(p,`${role} ${name}`);return `@${p[0]}`}
function fill(value){call('fill','--element',ref(tree(),'textbox',/your question/i),'--value',value)}
function activate(name){call('focus','--element',ref(tree(),'button',name));call('keypress','--key','Enter')}
function ask(value){fill(value);call('keypress','--key','Control+Enter')}
function capture(name){copyFileSync(call('screenshot').path,`${output}/${name}.png`)}
function successFixture(){evaluate(`window.fetch=async(_url,options)=>{const q=JSON.parse(options.body).question;window.__repairCalls.push(q);return new Response([{type:'retrieval-start',question:q},{type:'retrieval',hits:[],durationMs:1},{type:'answer',answer:{mode:'abstained',text:'Controlled retry result',citations:[]}},{type:'done',durationMs:2}].map(e=>JSON.stringify(e)).join('\\n'))};JSON.stringify(true)`)}
try{
 call('goto','--url','http://127.0.0.1:4193/ask');call('viewport','--width','1440','--height','900','--scale','1')
 evaluate(`window.__repairRealFetch=window.fetch;window.__repairCalls=[];JSON.stringify(true)`)
 for(const mode of ['error','cancel']){
  if(mode==='error')evaluate(`window.fetch=async(_url,options)=>{window.__repairCalls.push(JSON.parse(options.body).question);return Response.json({error:'Controlled repair error'},{status:429})};JSON.stringify(true)`)
  else evaluate(`window.__repairAborted=false;window.fetch=(_url,options)=>{window.__repairCalls.push(JSON.parse(options.body).question);return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{window.__repairAborted=true;reject(new DOMException('aborted','AbortError'))},{once:true}))};JSON.stringify(true)`)
  ask(`Original ${mode} question`)
  if(mode==='error')call('wait','--text','Controlled repair error')
  else {activate(/^Cancel$/i);call('wait','--text','Cancelled.');check('Workbench Cancel aborts its pending request',evaluate(`JSON.stringify(window.__repairAborted)`))}
  const calls=evaluate(`JSON.stringify(window.__repairCalls.length)`)
  fill('   ')
  check(`${mode}: blank draft disables Retry`,evaluate(`JSON.stringify([...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Try again').disabled)`))
  call('keypress','--key','Control+Enter')
  check(`${mode}: blank submission sends no request`,evaluate(`JSON.stringify(window.__repairCalls.length)` )===calls)
  const edited=`Updated ${mode} draft`
  fill(`  ${edited}  `);successFixture();activate(/^Try again$/i);call('wait','--text','Finished in')
  const result=evaluate(`JSON.stringify({calls:window.__repairCalls,draft:document.querySelector('textarea').value,article:document.querySelector('article').textContent})`)
  check(`${mode}: Retry sends edited draft and preserves the field`,result.calls.at(-1)===edited&&result.calls.length===calls+1&&result.draft===`  ${edited}  `&&result.article.includes(edited))
 }
 evaluate(`window.fetch=async(_url,options)=>{const q=JSON.parse(options.body).question;return new Response(new ReadableStream({start(c){window.__repairStream=c;c.enqueue(new TextEncoder().encode([{type:'retrieval-start',question:q},{type:'retrieval',hits:[],durationMs:1}].map(e=>JSON.stringify(e)).join('\\n')+'\\n'))}}))};JSON.stringify(true)`)
 ask('Pending empty retrieval');call('wait','--text','0 passages; response pending')
 check('Actual pending SVG caption is explicit while no answer is present',evaluate(`JSON.stringify([...document.querySelectorAll('svg text')].some(t=>t.textContent==='0 passages; response pending'))`))
 capture('pending-empty-retrieval')
 evaluate(`window.__repairStream.enqueue(new TextEncoder().encode([{type:'answer',answer:{mode:'abstained',text:'Controlled final abstention',citations:[]}},{type:'done',durationMs:2}].map(e=>JSON.stringify(e)).join('\\n')));window.__repairStream.close();JSON.stringify(true)`)
 call('wait','--text','Finished in')
 check('Pending empty retrieval completes as validated abstention',evaluate(`JSON.stringify(document.querySelector('article').textContent.includes('Controlled final abstention')&&![...document.querySelectorAll('svg text')].some(t=>t.textContent==='0 passages; response pending'))`))
 writeFileSync(`${output}/checks.json`,JSON.stringify({buildId:readFileSync('.next/BUILD_ID','utf8').trim(),checks,limits:['Controlled transport fixtures validate the previous Workbench repairs in Chromium; no live model or screen-reader testing.']},null,2))
 console.log(JSON.stringify({passed:checks.length,output}))
}catch(error){writeFileSync(`${output}/failure.json`,JSON.stringify({checks,error:String(error)},null,2));try{capture('failure')}catch{};throw error}
finally{try{evaluate(`if(window.__repairRealFetch)window.fetch=window.__repairRealFetch;JSON.stringify(true)`)}catch{}}
