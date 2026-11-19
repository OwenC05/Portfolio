import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const page = process.argv[2]
if (!page) throw new Error('Pass the owned Orca browser page ID')
const output = process.argv[3] || 'design/assistant/robot/integration/verification-g4-v01/browser-pointer-corrected'
mkdirSync(output, { recursive: true })
const cli = process.env.ORCA_BIN || 'orca'
const checks = []
function call(command, ...args) {
  const reply = JSON.parse(execFileSync(cli, [command, ...args, '--page', page, '--json'], {
    windowsHide: true, shell: false, encoding: 'utf8', timeout: 25000,
  }))
  if (!reply.ok) throw new Error(JSON.stringify(reply.error))
  return reply.result
}
function evaluate(source) {
  const result = call('eval', '--expression', source).result
  return typeof result === 'string' ? JSON.parse(result) : result
}
function snapshot() { return call('snapshot', '--interactive') }
function ref(tree, role, name) {
  const match = Object.entries(tree.refs).find(([, item]) => item.role === role && name.test(item.name))
  assert.ok(match, `Missing ${role}: ${name}`)
  return `@${match[0]}`
}
function check(name, value) {
  checks.push({ name, passed: Boolean(value) })
  assert.ok(value, name)
}
function capture(name) {
  const shot = call('screenshot')
  copyFileSync(shot.path, `${output}/${name}.png`)
}
function clickAsk() {
  // This Orca desktop host scales injected coordinates 2.5x despite DPR=1.
  // Observe two trusted moves afresh; do not assume that scale on other hosts.
  evaluate(`window.__studioQAMoves=[];window.__studioQAMove=e=>window.__studioQAMoves.push({x:e.clientX,y:e.clientY,trusted:e.isTrusted});document.addEventListener('pointermove',window.__studioQAMove,true);JSON.stringify(true)`)
  call('mouse', 'move', '--x', '100', '--y', '100')
  call('mouse', 'move', '--x', '200', '--y', '150')
  const points = evaluate(`document.removeEventListener('pointermove',window.__studioQAMove,true);JSON.stringify(window.__studioQAMoves)`)
  assert.ok(points.length >= 2 && points.every(point => point.trusted), 'Trusted coordinate calibration')
  const [first, second] = points.slice(-2)
  const scaleX = (second.x - first.x) / 100
  const scaleY = (second.y - first.y) / 50
  assert.ok(scaleX > 0 && scaleY > 0, 'Positive injection scale')
  const offsetX = first.x - 100 * scaleX
  const offsetY = first.y - 100 * scaleY
  const center = evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('Ask about Owen'));const r=b.getBoundingClientRect();window.__studioQAClick=null;b.addEventListener('click',e=>window.__studioQAClick={trusted:e.isTrusted,x:e.clientX,y:e.clientY},{once:true});return JSON.stringify({x:r.x+r.width/2,y:r.y+r.height/2})})()`)
  call('mouse', 'move', '--x', String((center.x-offsetX)/scaleX), '--y', String((center.y-offsetY)/scaleY))
  call('mouse', 'down', '--button', 'left')
  call('mouse', 'up', '--button', 'left')
  const click = evaluate(`JSON.stringify(window.__studioQAClick)`)
  check('Corrected native pointer click reaches the Ask button', click?.trusted && Math.abs(click.x-center.x)<2 && Math.abs(click.y-center.y)<2)
  writeFileSync(`${output}/pointer-calibration.json`, JSON.stringify({points,scaleX,scaleY,offsetX,offsetY,center,click},null,2))
}

try {
  // Navigation resets this host's emulation; establish the desktop explicitly.
  call('viewport', '--width', '1440', '--height', '900', '--scale', '1')
  const baseline = evaluate(`JSON.stringify({url:location.href,canvas:document.querySelector('canvas')?.dataset,dialogs:document.querySelectorAll('dialog').length,viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth})`)
  check('Studio has one canvas and one native dialog', baseline.canvas && baseline.dialogs === 1)
  check('Desktop has no horizontal overflow', !baseline.overflow)
  writeFileSync(`${output}/baseline.json`, JSON.stringify(baseline, null, 2))
  capture('desktop-closed')
  evaluate(`window.__studioQARealFetch=window.fetch; window.__studioQAFetchCount=0; window.__studioQATrace=[]; window.fetch=async(...args)=>{if(String(args[0])==='/api/assistant')window.__studioQAFetchCount++;const response=await window.__studioQARealFetch(...args); if(String(args[0])==='/api/assistant') response.clone().text().then(text=>window.__studioQATrace=text.trim().split('\\n').filter(Boolean).map(JSON.parse)); return response;}; JSON.stringify(true)`)
  clickAsk()
  const opening = evaluate(`JSON.stringify({open:document.querySelector('dialog').open,variant:document.querySelector('dialog').dataset.panelVariant,focus:document.activeElement.id,url:location.href})`)
  check('Ask opens the assistant variant and focuses the heading', opening.open && opening.variant === 'assistant' && opening.focus === 'studio-ask-heading')
  check('Ask does not add a URL or history fragment', opening.url === baseline.url)
  capture('desktop-open')
  // This CLI action does not return refs on every host; obtain current controls.
  let tree = snapshot()
  call('fill', '--element', ref(tree, 'textbox', /question/i), '--value', 'What has Owen worked on at LexisNexis?')
  call('keypress', '--key', 'Control+Enter')
  call('wait', '--text', 'Finished in')
  const sources = evaluate(`JSON.stringify({trace:window.__studioQATrace,status:document.querySelector('dialog [role=status]')?.textContent,rows:[...document.querySelectorAll('dialog li[data-hit-key]')].map(row=>({key:row.dataset.hitKey,run:row.dataset.runId,text:row.innerText})),chips:document.querySelectorAll('dialog button[data-hit-key]').length,canvas:document.querySelector('canvas')?.dataset,focus:document.activeElement.tagName})`)
  const hits = sources.trace.find((event) => event.type === 'retrieval')?.hits
  check('Real same-origin source-only request completes', hits && sources.trace.at(-1)?.type === 'done' && !sources.trace.some((event) => event.type === 'generation'))
  check('HTML rows, chips and rendered cards have the same real count', sources.rows.length === hits.length && sources.chips === hits.length && Number(sources.canvas.assistantCardCount) === hits.length)
  check('Rendered cards and source rows use the same current run', sources.rows.every((row) => row.run === sources.canvas.assistantRunId))
  check('All retrieved passage text appears in the source rows', hits.every((hit, index) => sources.rows[index].text.includes(hit.text)))
  writeFileSync(`${output}/real-sources.json`, JSON.stringify(sources, null, 2))
  capture('desktop-sources')
  for (const width of [390, 320]) {
    call('viewport', '--width', String(width), '--height', '844', '--scale', '1', '--mobile')
    const layout = evaluate(`(()=>{const passage=document.querySelector('dialog li[data-hit-key] p[data-open]');const field=document.querySelector('dialog textarea');return JSON.stringify({viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth,dialog:document.querySelector('dialog').getBoundingClientRect().toJSON(),canvas:document.querySelector('canvas')?.dataset,passage:passage.getBoundingClientRect().toJSON(),lineHeight:parseFloat(getComputedStyle(passage).lineHeight),askedDisplay:getComputedStyle(document.querySelector('dialog [data-repeats-draft]')).display,fieldHeight:field.getBoundingClientRect().height,rootFont:parseFloat(getComputedStyle(document.documentElement).fontSize),fieldSizing:getComputedStyle(field).fieldSizing})})()`)
    check(`${width}px source sheet stays within viewport`, !layout.overflow && layout.dialog.x>=-1 && layout.dialog.right<=width+1)
    check(`${width}px first passage has a visible text line without scrolling`, layout.passage.top+layout.lineHeight<=Math.min(layout.dialog.bottom,844))
    check(`${width}px matching query repeat is hidden and field is compact`, layout.askedDisplay==='none' && layout.fieldHeight<=4.4*layout.rootFont+1)
    writeFileSync(`${output}/mobile-${width}.json`, JSON.stringify(layout,null,2))
    capture(`mobile-${width}-sources`)
  }
  tree = snapshot()
  const question = ref(tree, 'textbox', /question/i)
  call('fill', '--element', question, '--value', 'An edited question about project evidence. '.repeat(15).slice(0,600))
  const edited = evaluate(`(()=>{const field=document.querySelector('dialog textarea');const asked=document.querySelector('dialog [data-repeats-draft]');return JSON.stringify({draft:field.value,scrollHeight:field.scrollHeight,clientHeight:field.clientHeight,asked:asked.textContent,display:getComputedStyle(asked).display,requests:window.__studioQAFetchCount,rows:document.querySelectorAll('dialog li[data-hit-key]').length,run:document.querySelector('canvas').dataset.assistantRunId,focus:document.activeElement===field})})()`)
  check('Edited long phone draft preserves searched question and current results without submitting', edited.draft.length===600 && edited.scrollHeight>edited.clientHeight && edited.display!=='none' && edited.asked.includes('What has Owen worked on at LexisNexis?') && edited.requests===1 && edited.rows===hits.length && edited.run===sources.canvas.assistantRunId && edited.focus)
  writeFileSync(`${output}/mobile-edited-draft.json`, JSON.stringify(edited,null,2))
  capture('mobile-320-edited-draft')
  call('fill', '--element', question, '--value', '  What has Owen worked on at LexisNexis?  ')
  check('Whitespace-only draft edits still suppress the redundant query', evaluate(`JSON.stringify(getComputedStyle(document.querySelector('dialog [data-repeats-draft]')).display==='none'&&window.__studioQAFetchCount===1)`))
  call('fill', '--element', question, '--value', 'What has Owen worked on at LexisNexis?')
  call('viewport', '--width', '1440', '--height', '900', '--scale', '1')
  call('keypress', '--key', 'Escape')
  for (const width of [390, 320]) {
    call('viewport', '--width', String(width), '--height', '844', '--scale', '1', '--mobile')
    const entry = evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('Ask about Owen'));return JSON.stringify({rect:button.getBoundingClientRect().toJSON(),viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth})})()`)
    check(`${width}px closed Studio keeps a visible 44px HTML Ask entry`, !entry.overflow && entry.rect.x>=-1 && entry.rect.right<=width+1 && entry.rect.top>=0 && entry.rect.bottom<=844 && entry.rect.height>=44)
    writeFileSync(`${output}/mobile-${width}-closed.json`, JSON.stringify(entry,null,2))
    capture(`mobile-${width}-closed`)
  }
  call('viewport', '--width', '1440', '--height', '900', '--scale', '1')
  const closed = evaluate(`JSON.stringify({open:document.querySelector('dialog').open,focus:document.activeElement.textContent,url:location.href,cards:document.querySelector('canvas')?.dataset.assistantCardCount})`)
  check('Escape closes and returns focus to the HTML Ask entry', !closed.open && /^Ask about Owen/.test(closed.focus))
  check('Closing clears rendered cards and preserves the URL', closed.cards === '0' && closed.url === baseline.url)
  clickAsk()
  const reopened = evaluate(`JSON.stringify({draft:document.querySelector('dialog textarea')?.value,rows:document.querySelectorAll('dialog li[data-hit-key]').length,focus:document.activeElement.id})`)
  check('Reopening retains the draft with no previous result', reopened.draft === 'What has Owen worked on at LexisNexis?' && reopened.rows === 0 && reopened.focus === 'studio-ask-heading')
  call('keypress', '--key', 'Escape')
  writeFileSync(`${output}/smoke-checks.json`, JSON.stringify({ buildId: readFileSync('.next/BUILD_ID', 'utf8').trim(), checks, limits: ['Initial desktop source-search smoke only; full failure, keyboard, mobile, placement and lifecycle matrix remains.'] }, null, 2))
  console.log(JSON.stringify({ checks: checks.length, passed: checks.length, output }))
} catch (error) {
  writeFileSync(`${output}/smoke-failure.json`, JSON.stringify({ checks, error: String(error) }, null, 2))
  try { capture('failure') } catch { /* Preserve the original failure. */ }
  throw error
} finally {
  try { evaluate(`if(window.__studioQARealFetch)window.fetch=window.__studioQARealFetch; JSON.stringify(true)`) } catch { /* A navigation may have replaced this test context. */ }
}
