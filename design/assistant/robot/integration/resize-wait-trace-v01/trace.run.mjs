async (page) => {
  const artifact='C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/resize-wait-trace-v01';
  const browser=page.context().browser();
  const inventory=()=>browser.contexts().map((c,index)=>({index,pages:c.pages().map(p=>p.url())}));
  const original=browser.contexts();
  if(original.length!==1||original[0].pages().length!==1||original[0].pages()[0].url()!=='about:blank')throw Error('Unrelated browser pages; refusing browser-wide trace');
  const result={identity:'task_d767ba985f09-single-trace',buildId:'KEhdfJ0NJBO2q0ASaHcHN',browser:browser.version(),inventoryBefore:inventory(),wallStart:new Date().toISOString(),config:{width:1440,height:900,nativeDpr:2,rendererDpr:1.5,reducedMotion:'no-preference',serviceWorkers:'block'}};
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'no-preference',serviceWorkers:'block'});
  const p=await context.newPage(); let tracing=false;
  const state=()=>p.evaluate(()=>{const c=document.querySelector('canvas');return{at:performance.now(),epoch:Date.now(),timeOrigin:performance.timeOrigin,hidden:document.hidden,focused:document.hasFocus(),nativeDpr:devicePixelRatio,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,viewport:[innerWidth,innerHeight],buffer:[c?.width,c?.height],rect:c?.getBoundingClientRect().toJSON(),canvas:{...c?.dataset},dialogOpen:document.querySelector('dialog')?.open};});
  await p.addInitScript(()=>{
    const probe=window.__resizeWait={frames:[],owners:[],requests:[],cancellations:[],markers:[],writes:[],longTasks:[],trusted:[],contexts:[],nextId:0,nextMarker:0,pending:0,maxPending:0,current:null};
    let mainCanvas=null;
    const ownerIds=new WeakMap(),pending=new Map();
    const mark=(kind,data={})=>{const name=`rw:${kind}:${++probe.nextMarker}`;const entry=performance.mark(name);const marker={kind,name,at:entry.startTime,...data};probe.markers.push(marker);return marker;};
    probe.mark=mark;
    const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
    const getContext=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      const gl=getContext.call(this,type,...args);if(type!=='webgl2'||!gl||probe.contexts.includes(gl))return gl;
      mainCanvas=this;probe.contexts.push(gl);
      for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
        const draw=gl[name].bind(gl);gl[name]=(...a)=>{const f=probe.current;if(f){f.calls++;if(a[0]===gl.TRIANGLES)f.triangles+=(name.startsWith('drawElements')?a[1]:a[2])/3*(name.endsWith('Instanced')?a.at(-1):1);}return draw(...a);};
      }return gl;
    };
    window.requestAnimationFrame=callback=>{
      let owner=ownerIds.get(callback);if(owner===undefined){owner=probe.owners.length;ownerIds.set(callback,owner);probe.owners.push({id:owner,name:callback.name,prefix:String(callback).slice(0,500),registration:new Error().stack});}
      const id=++probe.nextId,requested=performance.now();
      const requestMark=mark('request',{id,owner});
      const nativeCalled=performance.now();
      const nativeId=raf(time=>{
        const started=performance.now();pending.delete(nativeId);probe.pending--;
        const canvas=mainCanvas,before=canvas?.dataset.studioRenderCount;
        const frame={id,nativeId,owner,requested,nativeCalled,requestMark:requestMark.name,time,started,calls:0,triangles:0,beforeBuffer:[canvas?.width,canvas?.height],beforeCount:before,hidden:document.hidden,visibility:document.visibilityState,focused:document.hasFocus(),viewport:[innerWidth,innerHeight]};
        frame.startMark=mark('callback-start',{id,owner}).name;
        const prior=probe.current;probe.current=frame;
        frame.applicationStarted=performance.now();
        try{return callback(time);}finally{
          const end=performance.now();frame.duration=end-started;frame.applicationDuration=end-frame.applicationStarted;frame.ended=end;probe.current=prior;
          frame.endMark=mark('callback-end',{id,owner}).name;
          Object.assign(frame,{rendered:!!canvas&&canvas.dataset.studioRenderCount!==before,afterCount:canvas?.dataset.studioRenderCount,afterBuffer:[canvas?.width,canvas?.height],dpr:canvas?.dataset.studioDpr,runId:canvas?.dataset.assistantRunId,revision:canvas?.dataset.assistantRevision,cards:canvas?.dataset.assistantCardCount,hiddenAfter:document.hidden,focusedAfter:document.hasFocus()});
          probe.frames.push(frame);
        }
      });
      pending.set(nativeId,id);probe.pending++;probe.maxPending=Math.max(probe.maxPending,probe.pending);
      probe.requests.push({id,nativeId,owner,requested,nativeCalled,wrapperMs:performance.now()-requested});return nativeId;
    };
    window.cancelAnimationFrame=id=>{const ownId=pending.get(id);if(pending.delete(id))probe.pending--;probe.cancellations.push({at:performance.now(),id,ownId});return cancel(id);};
    for(const property of ['width','height']){
      const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,property);
      if(!descriptor?.get||!descriptor?.set||!descriptor.configurable)throw Error('Native canvas setter instrumentation unavailable');
      Object.defineProperty(HTMLCanvasElement.prototype,property,{...descriptor,set(value){
        const old=descriptor.get.call(this),main=this===mainCanvas,frameId=probe.current?.id??null;
        const begin=main?mark('setter-start',{property,old,value,frameId}):null;
        const at=performance.now();
        try{return descriptor.set.call(this,value);}finally{const ended=performance.now();if(main){const end=mark('setter-end',{property,frameId});probe.writes.push({property,old,value,at,ended,duration:ended-at,frameId,startMark:begin.name,endMark:end.name});}}
      }});
    }
    const NativeRO=window.ResizeObserver;
    window.ResizeObserver=class extends NativeRO {
      constructor(callback){super(function(entries,observer){
        const start=mark('observer-start',{entries:entries.map(e=>({tag:e.target.tagName,width:e.contentRect.width,height:e.contentRect.height,mainHost:e.target===mainCanvas?.parentElement}))});
        try{return callback.call(this,entries,observer);}finally{mark('observer-end',{start:start.name});}
      });}
    };
    window.addEventListener('resize',()=>mark('window-resize',{width:innerWidth,height:innerHeight,buffer:[mainCanvas?.width,mainCanvas?.height]}),true);
    for(const event of ['focus','blur'])window.addEventListener(event,()=>mark(event,{focused:document.hasFocus(),hidden:document.hidden}),true);
    document.addEventListener('visibilitychange',()=>mark('visibility',{hidden:document.hidden,state:document.visibilityState}),true);
    document.addEventListener('click',e=>{const m=mark('trusted-click',{trusted:e.isTrusted,x:e.clientX,y:e.clientY});probe.trusted.push({...m,target:e.target.tagName});},true);
    new PerformanceObserver(list=>{for(const e of list.getEntries())probe.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
  });
  try {
    await p.goto('http://127.0.0.1:4193/studio');
    await p.setViewportSize({width:1440,height:900});
    await p.waitForSelector('canvas[data-assistant-revision]');
    await p.waitForTimeout(650);
    result.initial=await state();
    result.graphics=await p.evaluate(()=>{const gl=window.__resizeWait.contexts[0],ext=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:gl.getParameter(ext?ext.UNMASKED_RENDERER_WEBGL:gl.RENDERER),userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,contexts:window.__resizeWait.contexts.length};});
    if(result.initial.nativeDpr!==2||result.initial.canvas.studioDpr!=='1.5'||result.initial.canvas.assistantCardCount!=='0'||result.initial.dialogOpen||result.initial.hidden||!result.initial.focused||result.initial.reducedMotion)throw Error('Initial condition mismatch');
    result.inventoryAtTraceStart=inventory();
    if(browser.contexts().length!==2||original[0].pages().some(p=>p.url()!=='about:blank')||context.pages().length!==1)throw Error('Browser inventory changed; refusing trace');
    result.traceCategories=['toplevel','devtools.timeline','blink.user_timing','renderer.scheduler','cc','viz','gpu','v8','v8.execute','input','latencyInfo','disabled-by-default-devtools.timeline','disabled-by-default-devtools.timeline.frame','disabled-by-default-cc.debug.scheduler'];
    try{await browser.startTracing(undefined,{path:artifact+'/chromium-trace.json',screenshots:false,categories:result.traceCategories});tracing=true;result.traceStarted=true;}catch(error){result.traceUnavailable=String(error);}
    result.start=await p.evaluate(()=>{const q=window.__resizeWait,m=q.mark('sample-start');return{at:m.at,mark:m.name,index:q.frames.length,requestIndex:q.requests.length,writeIndex:q.writes.length,markerIndex:q.markers.length-1,clickIndex:q.trusted.length,timeOrigin:performance.timeOrigin,epoch:Date.now(),utc:new Date().toISOString()};});
    result.sampleWallStart=new Date().toISOString();const begin=Date.now();let step=0;result.actions=[];
    while(Date.now()-begin<10000){
      const direction=step++%2===0?'Look left':'Look right';
      await p.getByRole('button',{name:direction,exact:true}).click();
      result.actions.push({kind:'trusted-look-button',step,direction,elapsed:Date.now()-begin});
      if(step%10===0){
        const width=step%20===0?1440:1380;
        const issue=await p.evaluate(({width,step})=>window.__resizeWait.mark('resize-issue',{width,step}),{width,step});
        await p.setViewportSize({width,height:900});
        const returned=await p.evaluate(({width,step})=>window.__resizeWait.mark('resize-return',{width,step,actualWidth:innerWidth}),{width,step});
        result.actions.push({kind:'viewport-resize',step,width,issue,returned,elapsed:Date.now()-begin});
      }
    }
    await p.waitForTimeout(150);
    result.end=await p.evaluate(()=>{const q=window.__resizeWait,m=q.mark('sample-end');return{at:m.at,mark:m.name,index:q.frames.length,epoch:Date.now(),utc:new Date().toISOString()};});
    result.sampleWallEnd=new Date().toISOString();
    if(tracing){const buffer=await browser.stopTracing();tracing=false;result.traceBytes=buffer.length;result.traceFile='chromium-trace.json';}
    result.after=await state();
    result.probe=await p.evaluate(()=>{const {contexts,current,mark,...data}=window.__resizeWait;return data;});
    const frames=result.probe.frames.slice(result.start.index,result.end.index).filter(f=>f.rendered);
    const stats=values=>{const v=[...values].sort((a,b)=>a-b);return{count:v.length,p95:v[Math.ceil(v.length*.95)-1],max:v.at(-1)};};
    result.summary={requestToStart:stats(frames.map(f=>f.started-f.requested)),callback:stats(frames.map(f=>f.duration)),late:frames.filter(f=>f.started-f.requested>33).length,peakCalls:Math.max(...frames.map(f=>f.calls)),peakTriangles:Math.max(...frames.map(f=>f.triangles)),elapsed:result.end.at-result.start.at};
    result.summary.diagnosticGatePassed=result.summary.requestToStart.p95<=33;
  } catch(error) {result.failure=String(error);result.failureState=await state().catch(()=>null);result.probe=await p.evaluate(()=>{const {contexts,current,mark,...data}=window.__resizeWait;return data;}).catch(()=>null);}
  finally {
    if(tracing){try{const buffer=await browser.stopTracing();result.traceBytes=buffer.length;result.traceFile='chromium-trace.json';}catch(error){result.traceStopError=String(error);}}
    await context.close();result.contextClosed=true;result.inventoryAfter=inventory();result.wallEnd=new Date().toISOString();
  }
  return result;
}
