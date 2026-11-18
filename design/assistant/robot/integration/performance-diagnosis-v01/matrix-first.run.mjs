async(page)=>{
 const out='C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/performance-diagnosis-v01';
 const configs=[{mode:'full',dpr:2,replicate:1},{mode:'light',dpr:2,replicate:1},{mode:'light',dpr:1.5,replicate:1},{mode:'light',dpr:1,replicate:1}];
 const results=[];
 for(const config of configs){
  const context=await page.context().browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:config.dpr,reducedMotion:'no-preference'}),p=await context.newPage();
  const result={config,identity:`task_aa4db155162f-${config.mode}-${config.dpr}-r${config.replicate}`,wallStart:new Date().toISOString(),errors:[]};
  p.on('pageerror',e=>result.errors.push(String(e)));
  await p.addInitScript(({mode})=>{
   const probe=window.__diagnosis={all:[],longTasks:[],trusted:[],visibility:[],owners:[],contexts:[],phase:'startup',nextId:0,pending:0,maxPending:0};
   const owners=new WeakMap(),requests=new Map(),raf=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window);
   new PerformanceObserver(list=>{for(const e of list.getEntries())probe.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
   document.addEventListener('click',e=>probe.trusted.push({at:performance.now(),trusted:e.isTrusted,text:e.target.textContent?.slice(0,60),x:e.clientX,y:e.clientY}),true);
   document.addEventListener('visibilitychange',()=>probe.visibility.push({at:performance.now(),hidden:document.hidden,state:document.visibilityState}),true);
   window.requestAnimationFrame=callback=>{
    let owner=owners.get(callback);if(owner===undefined){owner=probe.owners.length;owners.set(callback,owner);probe.owners.push({id:owner,name:callback.name,callbackPrefix:String(callback).slice(0,500),registration:new Error().stack});}
    const requested=performance.now(),id=++probe.nextId;probe.pending++;probe.maxPending=Math.max(probe.maxPending,probe.pending);
    const nativeId=raf(time=>{
     requests.delete(nativeId);probe.pending--;
     const canvas=document.querySelector('canvas'),before=canvas?.dataset.studioRenderCount;
     const f={id,owner,requested,time,started:performance.now(),phase:probe.phase,calls:0,triangles:0};probe.current=f;
     try{callback(time);}finally{f.duration=performance.now()-f.started;probe.current=null;Object.assign(f,{rendered:!!canvas&&canvas.dataset.studioRenderCount!==before,beforeCount:before,afterCount:canvas?.dataset.studioRenderCount,hidden:document.hidden,visibility:document.visibilityState,focused:document.hasFocus(),viewportWidth:innerWidth,viewportHeight:innerHeight,bufferWidth:canvas?.width,bufferHeight:canvas?.height,dpr:canvas?.dataset.studioDpr,runId:canvas?.dataset.assistantRunId,revision:canvas?.dataset.assistantRevision,cards:canvas?.dataset.assistantCardCount});probe.all.push(f);}
    });requests.set(nativeId,id);return nativeId;
   };
   window.cancelAnimationFrame=id=>{if(requests.delete(id))probe.pending--;cancel(id);};
   if(mode==='full'){
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=original.call(this,type,...args);if(type!=='webgl2'||!gl||probe.contexts.includes(gl))return gl;probe.contexts.push(gl);for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const draw=gl[name].bind(gl);gl[name]=(...a)=>{const f=probe.current;if(f){f.calls++;if(a[0]===gl.TRIANGLES)f.triangles+=(name.startsWith('drawElements')?a[1]:a[2])/3*(name.endsWith('Instanced')?a.at(-1):1);}return draw(...a);};}return gl;};
   }
  },config);
  const state=()=>p.evaluate(()=>({at:performance.now(),timeOrigin:performance.timeOrigin,hidden:document.hidden,visibility:document.visibilityState,focused:document.hasFocus(),viewport:{width:innerWidth,height:innerHeight},devicePixelRatio,canvas:{...document.querySelector('canvas')?.dataset},buffer:{width:document.querySelector('canvas')?.width,height:document.querySelector('canvas')?.height},pending:window.__diagnosis.pending,frames:window.__diagnosis.all.length}));
  try{
   await p.goto('http://127.0.0.1:4193/studio');await p.setViewportSize({width:1440,height:900});await p.waitForSelector('canvas[data-assistant-revision]');result.loaded=await state();
   result.graphics=await p.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),e=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:gl.getParameter(e?e.UNMASKED_RENDERER_WEBGL:gl.RENDERER),vendor:gl.getParameter(e?e.UNMASKED_VENDOR_WEBGL:gl.VENDOR),userAgent:navigator.userAgent};});
   await p.evaluate(()=>{window.__diagnosis.phase='warmup';});
   for(const name of ['Look left','Look right','Look left','Look right'])await p.getByRole('button',{name,exact:true}).click();
   await p.setViewportSize({width:1380,height:900});await p.waitForFunction(()=>document.querySelector('canvas').width<1440*Number(document.querySelector('canvas').dataset.studioDpr));await p.setViewportSize({width:1440,height:900});
   await p.waitForTimeout(650);const settledBefore=await state();await p.waitForTimeout(250);const settledAfter=await state();result.settle={before:settledBefore,after:settledAfter,passed:settledBefore.canvas.studioRenderCount===settledAfter.canvas.studioRenderCount&&settledAfter.pending===0};
   const start=await p.evaluate(()=>{window.__diagnosis.phase='sample';return{at:performance.now(),index:window.__diagnosis.all.length,clickIndex:window.__diagnosis.trusted.length,epoch:Date.now()};});result.sampleWallStart=new Date().toISOString();
   const begin=Date.now(),actions=[];let step=0;
   while(Date.now()-begin<10000){const direction=step++%2===0?'Look left':'Look right';const issued=Date.now();await p.getByRole('button',{name:direction,exact:true}).click();actions.push({kind:'trusted-look-button',direction,issuedEpoch:issued,completedEpoch:Date.now(),elapsed:Date.now()-begin});if(step%10===0){const width=step%20===0?1440:1380;const issued=Date.now();await p.setViewportSize({width,height:900});actions.push({kind:'viewport-resize',width,issuedEpoch:issued,completedEpoch:Date.now(),elapsed:Date.now()-begin});}}
   await p.waitForTimeout(150);const end=await state();result.sampleWallEnd=new Date().toISOString();result.sample={start,end,actions,elapsed:end.at-start.at};
   result.probe=await p.evaluate(()=>({all:window.__diagnosis.all,longTasks:window.__diagnosis.longTasks,trusted:window.__diagnosis.trusted,visibility:window.__diagnosis.visibility,owners:window.__diagnosis.owners,maxPending:window.__diagnosis.maxPending}));
   const f=result.probe.all.slice(start.index).filter(f=>f.rendered),q=values=>{const v=[...values].sort((a,b)=>a-b);return{p50:v[Math.ceil(v.length*.5)-1],p95:v[Math.ceil(v.length*.95)-1],max:v.at(-1),count:v.length};};
   result.summary={requestToStart:q(f.map(f=>f.started-f.requested)),callback:q(f.map(f=>f.duration)),allCallbackCount:result.probe.all.length-start.index,sceneFrameCount:f.length,drawVsCountAgreement:config.mode==='full'?result.probe.all.slice(start.index).every(f=>!!f.calls===f.rendered):null,sceneOwners:[...new Set(f.map(f=>f.owner))],hiddenFrames:f.filter(f=>f.hidden).length,trustedSampleClicks:result.probe.trusted.slice(start.clickIndex).filter(c=>c.trusted).length,untrustedClicks:result.probe.trusted.slice(start.clickIndex).filter(c=>!c.trusted).length,dimensions:[...new Set(f.map(f=>JSON.stringify({vw:f.viewportWidth,vh:f.viewportHeight,bw:f.bufferWidth,bh:f.bufferHeight,dpr:f.dpr})))].map(JSON.parse)};
   if(config.replicate===1&&(config.mode==='full'||config.dpr!==2)){await p.setViewportSize({width:1440,height:900});await p.getByRole('button',{name:'Reset view',exact:true}).click();await p.mouse.move(0,0);await p.evaluate(()=>document.activeElement?.blur());await p.waitForTimeout(650);const before=await state();const path=out+'/normal-dpr'+config.dpr+'.png';await p.screenshot({path});result.capture={path,before,after:await state()};}
  }catch(e){result.failure=String(e);}finally{await context.close();result.closed=true;result.wallEnd=new Date().toISOString();}results.push(result);
 }
 return{conditionOrder:configs,results,definitions:{population:'Callbacks that changed the actual scene render counter; full instrumentation also cross-checks actual draw calls. Startup/warmup excluded by saved index; includes the original 150 ms drain after actions.',latency:'performance.now at callback entry minus timestamp immediately before native RAF registration; native RAF timestamp is retained but not subtracted.',callback:'CPU wall span around actual callback; no GPU timer query.',scenario:'Ten seconds alternating trusted Look left/right mouse clicks; resize1440->1380 every tenth click and back on twentieth; same semantic idle state and projection across densities.'}};
}
