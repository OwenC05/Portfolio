import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const page = process.argv[2]
if (!page) throw new Error('Pass the observed Orca browser page ID')
const cli = process.env.ORCA_BIN || 'orca'
const evidence = process.argv[3] || 'design/assistant'
mkdirSync(evidence, { recursive: true })
const results = []
function orca(command, ...args) {
  const raw = execFileSync(cli, [command, '--page', page, ...args, '--json'], { windowsHide: true, shell: false, encoding: 'utf8', timeout: 20000 })
  const response = JSON.parse(raw)
  if (!response.ok) throw new Error(JSON.stringify(response.error))
  return response.result
}
function evaluate(code) {
  const result = orca('eval', '--expression', code).result
  return typeof result === 'string' ? JSON.parse(result) : result
}
function check(name, value) { assert.ok(value, name); results.push({ name, passed: true }) }
const initialSnapshot = orca('snapshot', '--interactive').snapshot
const questionRef = initialSnapshot.match(/textbox "YOUR QUESTION" \[ref=(e\d+)\]/)?.[1]
const cancelRef = initialSnapshot.match(/button "CANCEL"[^\n]*ref=(e\d+)/)?.[1]
assert.ok(questionRef && cancelRef, 'Start with the assistant page open and ready')
function ask(question) {
  orca('fill', '--element', `@${questionRef}`, '--value', question)
  orca('keypress', '--key', 'Control+Enter')
}
function status() { return evaluate("JSON.stringify(document.querySelector('[role=status]').textContent)") }
function capture(name, target = 'top') {
  evaluate(`document.documentElement.style.scrollBehavior='auto'; document.body.style.scrollBehavior='auto'; ${target === 'top' ? "window.scrollTo({top:0,behavior:'instant'})" : `document.querySelector(${JSON.stringify(target)}).scrollIntoView({behavior:'instant',block:'start'})`}; JSON.stringify(true)`)
  const shot = orca('screenshot')
  copyFileSync(shot.path, `${evidence}/${name}.png`)
  return evaluate('JSON.stringify({width:innerWidth,height:innerHeight,scrollY,scrollWidth:document.documentElement.scrollWidth})')
}

evaluate(`window.__qaRealFetch=window.fetch; window.__qaEvents=[]; window.fetch=async (...args)=>{const response=await window.__qaRealFetch(...args); if(String(args[0])==='/api/assistant') response.clone().text().then(text=>window.__qaEvents=text.trim().split('\\n').map(JSON.parse)); return response}; JSON.stringify(true)`)
ask('What has Owen worked on at LexisNexis?')
orca('wait', '--text', 'Finished in')
const real = evaluate(`JSON.stringify({events:window.__qaEvents,graph:document.querySelector('svg title').textContent,quotes:Array.from(document.querySelectorAll('blockquote')).map(x=>x.textContent),buttons:document.querySelectorAll('button[aria-controls]').length})`)
const hits = real.events.find(e=>e.type==='retrieval').hits
check('Real same-origin request on 127.0.0.1 completes', real.events.at(-1).type === 'done')
check('Graph and disclosures agree with retrieved passages', real.buttons === hits.length && real.graph.includes(`${hits.length} retrieved passage`))
check('Source quotes are exact retrieved passages', real.quotes.every(q=>hits.some(h=>h.text===q)) && real.quotes.length===hits.length)
check('Disabled generation produces no model stage', !real.events.some(e=>e.type==='generation'))
writeFileSync(`${evidence}/real-source-trace.json`, JSON.stringify(real.events, null, 2))
const captures = { desktop: capture('desktop-sources') }
orca('viewport', '--width', '320', '--height', '844', '--mobile')
captures.mobileTop = capture('mobile-top')
captures.mobileAnswer = capture('mobile-answer', 'article')
captures.mobileTrace = capture('mobile-trace', 'section[aria-labelledby$="-map"]')
check('320px viewport has no horizontal overflow', captures.mobileTop.scrollWidth === 320)
evaluate("document.querySelector('button[aria-controls]').click(); JSON.stringify(true)")
check('Source disclosure opens its passage', evaluate("JSON.stringify(document.querySelector('button[aria-controls]').getAttribute('aria-expanded')==='true' && !document.getElementById(document.querySelector('button[aria-controls]').getAttribute('aria-controls')).hidden)"))
captures.mobilePassage = capture('mobile-passage', 'section[aria-labelledby$="-map"]')
ask('Which submarines explored Neptune?')
orca('wait', '--text', 'No matching published passages')
check('Unsupported topic abstains and offers contact', evaluate("JSON.stringify(document.querySelector('article').innerText.includes('contact Owen') && document.querySelectorAll('blockquote').length===0)"))

// Controlled transport fixtures below test UI state, not live model quality.
evaluate("window.fetch=async()=>Response.json({error:'Too many requests. Please try again in a minute.'},{status:429}); JSON.stringify(true)")
ask('Who is Owen?')
orca('wait', '--text', 'Too many requests')
check('Rate limit has retryable error state', status().includes('Too many requests'))
evaluate("window.fetch=async()=>new Response('not-json\\n'); JSON.stringify(true)")
ask('Who is Owen?')
orca('wait', '--text', 'could not read')
check('Malformed stream is reported', status().includes('could not read'))
evaluate("window.fetch=(_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true})); JSON.stringify(true)")
ask('Who is Owen?')
orca('focus', '--element', `@${cancelRef}`)
orca('keypress', '--key', 'Enter')
orca('wait', '--text', 'Cancelled.')
check('Keyboard cancellation restores usable state', status().startsWith('Cancelled.'))

evaluate("window.fetch=async()=>new Response(JSON.stringify({type:'retrieval',durationMs:1})+'\\n'); JSON.stringify(true)")
ask('Who is Owen?')
orca('wait', '--text', 'could not read')
check('Valid JSON with missing hits shows a recoverable error', status().includes('could not read') && evaluate("JSON.stringify(!!document.querySelector('textarea') && Array.from(document.querySelectorAll('button')).some(button=>button.textContent.trim()==='Try again'))"))

evaluate(`window.__qaCalls=0; window.fetch=async()=>{const n=++window.__qaCalls; if(n===1) await new Promise(r=>setTimeout(r,7000)); const text=[{type:'retrieval-start',question:'fixture'},{type:'retrieval',hits:[],durationMs:1},{type:'answer',answer:{mode:'abstained',text:n===1?'STALE RESULT':'FRESH RESULT',citations:[]}},{type:'done',durationMs:2}].map(x=>JSON.stringify(x)).join('\\n'); const bytes=new TextEncoder().encode(text); return new Response(new ReadableStream({start(c){c.enqueue(bytes.slice(0,23));c.enqueue(bytes.slice(23));c.close()}}))}; JSON.stringify(true)`)
ask('Old question')
ask('New question')
orca('wait', '--text', 'FRESH RESULT')
evaluate("new Promise(resolve=>setTimeout(()=>resolve(JSON.stringify(true)),7500))")
check('Superseded response cannot overwrite latest answer', evaluate("JSON.stringify(document.querySelector('article').innerText.includes('FRESH RESULT')&&!document.querySelector('article').innerText.includes('STALE RESULT'))"))
check('Split NDJSON and final unterminated line finish', status().startsWith('Finished in'))
evaluate('window.fetch=window.__qaRealFetch; JSON.stringify(true)')
ask('What has Owen worked on at LexisNexis?')
orca('wait', '--text', 'Finished in')
const mediaResult = JSON.parse(execFileSync(cli, ['set','media','--page',page,'--reduced-motion','reduce','--json'], {windowsHide:true,shell:false,encoding:'utf8'}))
assert.ok(mediaResult.ok)
check('Reduced motion disables graph animation', evaluate("JSON.stringify(matchMedia('(prefers-reduced-motion: reduce)').matches && Array.from(document.querySelectorAll('svg *')).every(node=>getComputedStyle(node).animationName==='none'))"))
orca('viewport', '--width', '390', '--height', '844', '--mobile')
check('390px viewport has no horizontal overflow', evaluate('JSON.stringify(document.documentElement.scrollWidth===390)'))
const files = ['components/assistant/AssistantWorkbench.tsx','components/assistant/assistant.module.css','lib/assistant/events.ts','lib/assistant/handler.ts','lib/assistant/retrieval.ts','lib/knowledge/catalog.ts']
writeFileSync(`${evidence}/browser-checks.json`, JSON.stringify({buildId:readFileSync('.next/BUILD_ID','utf8').trim(),testedAt:new Date().toISOString(),base:'http://127.0.0.1:4193',results,captures,sourceHashes:Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')])),limits:['Controlled transport fixtures do not test live model quality.','Screenshots are viewport captures; full-page stitching was unreliable.','No screen-reader or full WCAG audit.']}, null, 2))
console.log(JSON.stringify({passed:results.length,captures:Object.keys(captures),report:`${evidence}/browser-checks.json`}))
