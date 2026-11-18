async(page)=>{
 const config={mode:'light',dpr:2},context=await page.context().browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'no-preference'}),p=await context.newPage(),cdp=await context.newCDPSession(p);
 const result={identity:'task_aa4db155162f-resize-attribution',config,wallStart:new Date().toISOString(),conditions:[]};
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
 await p.addInitScript(()=>{
  window.__diagnosis.dimensionWrites=[];
  for(const property of ['width','height']){const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,property);if(!descriptor?.set||!descriptor?.get||!descriptor.configurable)throw Error('Canvas dimension timing unsupported');Object.defineProperty(HTMLCanvasElement.prototype,property,{...descriptor,set(value){const old=descriptor.get.call(this),at=performance.now();descriptor.set.call(this,value);const duration=performance.now()-at;window.__diagnosis.dimensionWrites.push({property,old,value,at,duration,callbackId:window.__diagnosis.current?.id,phase:window.__diagnosis.phase,main:this===document.querySelector('canvas')});}});}
 });
 try{
  await p.goto('http://127.0.0.1:4193/studio');await p.setViewportSize({width:1440,height:900});await p.waitForSelector('canvas[data-assistant-revision]');
  for(const name of ['Look left','Look right','Look left','Look right'])await p.getByRole('button',{name,exact:true}).click();await p.setViewportSize({width:1380,height:900});await p.waitForTimeout(100);await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(900);
  for(const condition of [{name:'resize-with-cpu-profile',resize:true,duration:5000},{name:'look-only-control',resize:false,duration:10000}]){
   await p.setViewportSize({width:1440,height:900});await p.getByRole('button',{name:'Reset view',exact:true}).click();await p.waitForTimeout(650);
   if(condition.resize){await cdp.send('Profiler.enable');await cdp.send('Profiler.start');}
   const start=await p.evaluate(name=>{window.__diagnosis.phase=name;return{at:performance.now(),index:window.__diagnosis.all.length,epoch:Date.now()};},condition.name),begin=Date.now(),actions=[];let step=0;
   while(Date.now()-begin<condition.duration){const direction=step++%2===0?'Look left':'Look right';await p.getByRole('button',{name:direction,exact:true}).click();actions.push({direction,at:Date.now()});if(condition.resize&&step%10===0){const width=step%20===0?1440:1380;await p.setViewportSize({width,height:900});actions.push({resize:width,at:Date.now()});}}
   await p.waitForTimeout(150);if(condition.resize){result.cpuProfile=(await cdp.send('Profiler.stop')).profile;await cdp.send('Profiler.disable');}
   const data=await p.evaluate(start=>({start,end:performance.now(),all:window.__diagnosis.all.slice(start.index),dimensionWrites:window.__diagnosis.dimensionWrites.filter(w=>w.at>=start.at),canvas:{...document.querySelector('canvas').dataset},hidden:document.hidden,focused:document.hasFocus()}),start);
   const frames=data.all.filter(f=>f.rendered),q=v=>{v.sort((a,b)=>a-b);return{n:v.length,p95:v[Math.ceil(v.length*.95)-1],max:v.at(-1)}};
   result.conditions.push({condition,actions,...data,summary:{raf:q(frames.map(f=>f.started-f.requested)),callback:q(frames.map(f=>f.duration)),mainDimensionWrites:data.dimensionWrites.filter(w=>w.main).length}});
  }
 }catch(e){result.failure=String(e);}finally{await cdp.detach().catch(()=>{});await context.close();result.closed=true;result.wallEnd=new Date().toISOString();}
 return result;
}
