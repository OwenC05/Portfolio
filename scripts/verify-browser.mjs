// Optional local QA helper. Uses an already-running, approved Chromium CDP endpoint.
// node scripts/verify-browser.mjs http://127.0.0.1:3000 http://127.0.0.1:9222
import { mkdir, writeFile } from 'node:fs/promises'

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3000')
const cdp = new URL(process.argv[3] ?? 'http://127.0.0.1:9222')
for (const url of [base, cdp]) if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Local endpoints only')
const out = new URL('../.omx/reports/browser/', import.meta.url)
await mkdir(out, { recursive: true })
const fetchJson = async (path, options) => (await fetch(new URL(path, cdp), { ...options, signal: AbortSignal.timeout(10000) })).json()
const schema = await fetchJson('/json/protocol')
const supported = new Map(schema.domains.flatMap(domain => (domain.commands ?? []).map(command => [`${domain.domain}.${command.name}`, command])))
const version = await fetchJson('/json/version')
const target = await fetchJson('/json/new?about:blank', { method: 'PUT' })
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
let nextId = 0
const pending = new Map()
const listeners = new Map()
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const request = pending.get(message.id)
    if (!request) return
    clearTimeout(request.timer)
    pending.delete(message.id)
    if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`))
    else request.resolve(message.result)
  } else for (const listener of listeners.get(message.method) ?? []) listener(message.params)
}
function send(method, params = {}) {
  const command = supported.get(method)
  if (!command) throw new Error(`Unsupported runtime protocol method: ${method}`)
  for (const parameter of command.parameters ?? []) if (!parameter.optional && !(parameter.name in params)) throw new Error(`Missing protocol parameter ${method}.${parameter.name}`)
  const id = ++nextId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} exceeded 40 seconds`)) }, 40000)
    pending.set(id, { resolve, reject, timer, method })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
const on = (event, listener) => listeners.set(event, [...(listeners.get(event) ?? []), listener])
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error('Browser evaluation failed')
  return result.result.value
}
const results = { browser: version.Browser, protocol: version['Protocol-Version'], baseUrl: base.origin, conditions: 'Headless Chromium, local production server, unthrottled, deviceScaleFactor 1. Browser cache disabled for cold desktop and mobile homepage loads. Not Lighthouse or field INP.', checks: [], screenshots: [], errors: [], gaps: ['Lighthouse executable unavailable; no Lighthouse score claimed.', '200% layout zoom is emulated with CSS zoom, not native browser UI zoom.'] }
let recording = false
let scriptsDisabled = false
const requests = new Map()
const runtimeErrors = []
on('Network.responseReceived', event => { if (recording) requests.set(event.requestId, { url: event.response.url, type: event.type, status: event.response.status, bytes: 0, cache: event.response.fromDiskCache === true }) })
on('Network.loadingFinished', event => { if (recording && requests.has(event.requestId)) requests.get(event.requestId).bytes = event.encodedDataLength })
on('Network.loadingFailed', event => { if (!event.canceled && !event.blockedReason) runtimeErrors.push({ type: 'network', text: event.errorText }) })
on('Runtime.exceptionThrown', event => runtimeErrors.push({ type: 'exception', text: event.exceptionDetails.text }))
on('Runtime.consoleAPICalled', event => { if (event.type === 'error') runtimeErrors.push({ type: 'console', text: event.args.map(arg => arg.value ?? arg.description ?? '').join(' ').slice(0, 400) }) })
function check(label, pass, details) { results.checks.push({ label, pass: Boolean(pass), ...(details === undefined ? {} : { details }) }) }
async function navigate(path) {
  let listener
  let timer
  const loaded = new Promise((resolve, reject) => {
    listener = () => { clearTimeout(timer); resolve() }
    timer = setTimeout(() => reject(new Error('Page load exceeded 35 seconds')), 35000)
    on('Page.loadEventFired', listener)
  })
  try {
    await send('Page.navigate', { url: new URL(path, base).href })
    await loaded
  } finally {
    clearTimeout(timer)
    listeners.set('Page.loadEventFired', (listeners.get('Page.loadEventFired') ?? []).filter(item=>item!==listener))
  }
  if (!scriptsDisabled) await evaluate(`new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('page readiness timeout')), 35000);
    const ready = async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); clearTimeout(timer); resolve(true); };
    if (document.readyState === 'complete') ready(); else addEventListener('load', ready, {once:true});
  })`)
}
async function viewport(width, height) { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }) }
async function screenshot(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const width = Math.ceil(metrics.cssContentSize.width)
  const height = Math.ceil(metrics.cssContentSize.height)
  const picture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } })
  const file = `${name}.png`
  await writeFile(new URL(file, out), Buffer.from(picture.data, 'base64'))
  results.screenshots.push({ file, width, height })
  console.log(JSON.stringify({ screenshot: `.omx/reports/browser/${file}`, width, height }))
}
async function inspect(label) {
  const info = await evaluate(`(() => {
    const visible = e => { const r=e.getBoundingClientRect(), s=getComputedStyle(e); return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; };
    const links = [...document.querySelectorAll('a')].filter(visible);
    return { title: document.title, h1: [...document.querySelectorAll('h1')].map(e=>e.innerText), main: document.querySelectorAll('main').length,
      overflow: document.documentElement.scrollWidth > innerWidth+1,
      overflowElements: [...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>e.tagName+'.'+e.className),
      current: [...document.querySelectorAll('[aria-current]')].map(e=>({text:e.innerText,value:e.getAttribute('aria-current')})),
      unnamedLinks: links.filter(e=>!e.innerText.trim()&&!e.getAttribute('aria-label')).length,
      smallTargets: links.filter(e=>{const r=e.getBoundingClientRect();return r.width<24||r.height<24}).map(e=>({text:e.innerText,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),
      firstViewport: { name: [...document.querySelectorAll('a,h1,p,span')].some(e=>/owen\\s+cheung/i.test(e.innerText)&&visible(e)&&e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().top<innerHeight), work: links.some(e=>/work/i.test(e.innerText)&&e.getBoundingClientRect().top<innerHeight),contact: links.some(e=>/contact/i.test(e.innerText)&&e.getBoundingClientRect().top<innerHeight) },
      text: document.querySelector('main')?.innerText, skillAnchors: [...document.querySelectorAll('[data-alpine-stop]')].map(a=>({href:a.getAttribute('href'),target:Boolean(document.querySelector(a.getAttribute('href')))})), animations: document.getAnimations().length };
  })()`)
  check(`${label}: no horizontal overflow`, !info.overflow, info.overflowElements)
  check(`${label}: one main and H1`, info.main === 1 && info.h1.length === 1, { main: info.main, h1: info.h1 })
  check(`${label}: named links`, info.unnamedLinks === 0)
  if (label.endsWith('/about')) check(`${label}: current navigation`, info.current.some(item=>/about/i.test(item.text)))
  if (/\/projects(?:\/|$)/.test(label)) check(`${label}: current navigation`, info.current.some(item=>/work/i.test(item.text)))
  results.checks.push({ label: `${label}: navigation/target observations`, observation: { current: info.current, smallTargets: info.smallTargets, firstViewport: info.firstViewport } })
  if (label.includes('home')) check(`${label}: first viewport name/work/contact`, Object.values(info.firstViewport).every(Boolean), info.firstViewport)
  return info
}
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Network.setCacheDisabled', { cacheDisabled: true })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__lab={lcp:0,cls:0}; new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true}); new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__lab.cls+=e.value}).observe({type:'layout-shift',buffered:true});` })
  await viewport(1440, 900)
  recording = true
  await navigate('/')
  await inspect('desktop home')
  await screenshot('home-desktop')
  const navigation = await evaluate(`({lab:window.__lab,navigation:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(r=>({name:r.name,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,initiatorType:r.initiatorType}))})`)
  recording = false
  const network = [...requests.values()]
  const firstParty = network.filter(r => new URL(r.url).origin === base.origin)
  const javascriptBytes = firstParty.filter(r => r.type === 'Script').reduce((sum, r) => sum + r.bytes, 0)
  const totalBytes = firstParty.reduce((sum, r) => sum + r.bytes, 0)
  results.performance = { javascriptBytes, totalBytes, navigation, network }
  check('Cold homepage first-party JS <=200 KiB', javascriptBytes <= 200*1024, javascriptBytes)
  check('Cold homepage first-party transfer <=750 KiB', totalBytes <= 750*1024, totalBytes)
  check('Homepage no failed HTTP requests', network.every(r=>r.status<400), network.filter(r=>r.status>=400))
  check('Homepage no named game/Three/R3F chunks', !network.some(r=>/three|react-three|r3f|postprocessing|RunCanvas|RunScene|RunExperience/i.test(r.url)))
  results.contrast = await evaluate(`(() => {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const rgba = value => {ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v)};
    const blend = (front,back) => [0,1,2].map(i=>front[i]*front[3]+back[i]*(1-front[3]));
    const luminance = rgb => rgb.map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
    const samples = new Map();
    for(const e of document.querySelectorAll('body *')) {
      if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||['SCRIPT','STYLE'].includes(e.tagName))continue;
      const s=getComputedStyle(e),r=e.getBoundingClientRect();if(!r.width||!r.height||s.visibility==='hidden')continue;
      let bg=[255,255,255], chain=[];for(let p=e;p;p=p.parentElement)chain.unshift(p);
      for(const p of chain){const c=rgba(getComputedStyle(p).backgroundColor);if(c)bg=blend(c,bg)}
      const c=rgba(s.color);if(!c)continue;const fg=blend(c,bg),l1=luminance(fg),l2=luminance(bg),ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
      const size=parseFloat(s.fontSize),weight=parseInt(s.fontWeight)||400,required=size>=24||(size>=18.66&&weight>=700)?3:4.5;
      const key=[s.color,bg.join(','),required].join('|'); if(!samples.has(key))samples.set(key,{text:e.textContent.trim().slice(0,60),foreground:s.color,background:bg,ratio,required,pass:ratio>=required});
    } return [...samples.values()];
  })()`)
  check('Homepage computed text contrast (solid backgrounds)', results.contrast.every(item=>item.pass), results.contrast.filter(item=>!item.pass))
  await viewport(390, 844)
  requests.clear(); recording = true
  await navigate('/'); await inspect('mobile home'); await screenshot('home-mobile')
  recording = false
  const mobileNetwork = [...requests.values()].filter(r => new URL(r.url).origin === base.origin)
  results.mobilePerformance = {
    javascriptBytes: mobileNetwork.filter(r => r.type === 'Script').reduce((sum,r)=>sum+r.bytes,0),
    totalBytes: mobileNetwork.reduce((sum,r)=>sum+r.bytes,0),
    network: mobileNetwork,
  }
  check('Cold mobile homepage first-party JS <=200 KiB', results.mobilePerformance.javascriptBytes <= 200*1024, results.mobilePerformance.javascriptBytes)
  check('Cold mobile homepage first-party transfer <=750 KiB', results.mobilePerformance.totalBytes <= 750*1024, results.mobilePerformance.totalBytes)
  for (const [width,height,name] of [[1440,900,'desktop'],[390,844,'mobile']]) {
    await viewport(width,height)
    for (const path of ['/projects','/about','/contact','/agents','/projects/lexisnexis-applied-ai','/projects/typeforge','/projects/lexisnexis-ml','/not-a-real-page']) {
      await navigate(path); await inspect(`${name} ${path}`); await screenshot(`${name}-${path.slice(1).replaceAll('/','-')}`)
    }
  }
  for (const [width,height,name] of [[768,1024,'tablet'],[320,844,'narrow']]) {
    await viewport(width,height)
    for (const path of ['/','/projects','/about','/contact','/agents','/projects/typeforge']) { await navigate(path); await inspect(`${name} ${path==='/'?'home':path}`); if(path==='/') await screenshot(`home-${name}`) }
  }
  await viewport(1440,900); await navigate('/')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  const skip = await evaluate(`({text:document.activeElement.innerText,href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle,rect:document.activeElement.getBoundingClientRect().toJSON()})`)
  check('Keyboard first tab exposes skip link', /skip/i.test(skip.text) && skip.rect.top>=0 && skip.rect.width>0, skip)
  await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 }); await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 })
  check('Skip link activates main target', await evaluate(`location.hash==='#main-content' || document.activeElement.tagName==='MAIN'`))
  results.keyboard = []
  for(let index=0;index<10;index++) {
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    results.keyboard.push(await evaluate(`({text:document.activeElement.innerText.slice(0,80),tag:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outlineStyle,outlineWidth:getComputedStyle(document.activeElement).outlineWidth})`))
  }
  check('Keyboard links show focus indicator', results.keyboard.filter(item=>item.tag==='A').every(item=>item.outline!=='none'&&parseFloat(item.outlineWidth)>0),results.keyboard)
  await navigate('/')
  const click = await evaluate(`(()=>{const a=[...document.querySelectorAll('a')].find(e=>e.getAttribute('href')==='/projects');const r=a.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`)
  const started=performance.now()
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:click.x,y:click.y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:click.x,y:click.y,button:'left',clickCount:1})
  await evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+10000;function poll(){if(location.pathname==='/projects'&&/work/i.test(document.querySelector('h1')?.innerText??''))return requestAnimationFrame(()=>resolve(true));if(performance.now()>end)return reject(new Error('navigation timeout'));requestAnimationFrame(poll)}poll()})`)
  results.navigationInteractionMs=performance.now()-started
  check('Observed navigation click-to-render <=200ms (local lab, not INP)',results.navigationInteractionMs<=200,results.navigationInteractionMs)
  await send('Emulation.setEmulatedMedia', { features:[{name:'prefers-reduced-motion',value:'reduce'}] }); await navigate('/')
  check('Reduced motion matched and no active animations', await evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches && document.getAnimations().length===0`))
  await send('Emulation.setScriptExecutionDisabled', { value:true }); scriptsDisabled=true; await navigate('/'); await screenshot('home-no-javascript')
  const noJs = await inspect('no-JavaScript home')
  check('JavaScript-disabled identity and evidence readable', /Applied AI/i.test(noJs.h1.join(' ')) && /Owen\s+Cheung/i.test(noJs.text) && /Human-governed/i.test(noJs.text) && /senior stakeholders/i.test(noJs.text) && /Multimodal contrastive learning \(study\)/i.test(noJs.text))
  check('JavaScript-disabled skill links target evidence', noJs.skillAnchors.length===3 && noJs.skillAnchors.every(a=>a.target), noJs.skillAnchors)
  await navigate('/projects/typeforge'); await inspect('no-JavaScript TypeForge'); await screenshot('typeforge-no-javascript')
  await send('Emulation.setScriptExecutionDisabled', { value:false }); scriptsDisabled=false; await send('Emulation.setEmulatedMedia', { features:[] }); await navigate('/')
  await evaluate(`document.documentElement.style.zoom='200%'`); await inspect('200% CSS zoom home'); await screenshot('home-zoom-200')
  results.runtimeErrors = runtimeErrors
  check('No browser runtime/hydration/network errors', runtimeErrors.length===0, runtimeErrors)
} catch (error) { results.errors.push(error instanceof Error ? error.message : 'Unknown browser check failure') }
finally {
  results.passed = results.errors.length===0 && results.checks.every(item=>item.pass!==false)
  await writeFile(new URL('report.json',out), JSON.stringify(results,null,2))
  console.log(JSON.stringify({report:'.omx/reports/browser/report.json',screenshots:results.screenshots.length,checks:results.checks.length,failed:results.checks.filter(item=>item.pass===false),errors:results.errors,passed:results.passed},null,2))
  socket.close()
  await fetch(new URL(`/json/close/${target.id}`,cdp)).catch(()=>{})
}
process.exitCode=results.passed?0:1
