async (page) => {
  const base = 'http://127.0.0.1:4193';
  const results = [];
  for (const config of [{name:'desktop',width:1440,height:900,dpr:2},{name:'small',width:390,height:844,dpr:1.5}]) {
    const context = await page.context().browser().newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:config.dpr,reducedMotion:'no-preference',serviceWorkers:'block'});
    const p = await context.newPage(), responses=[], errors=[];
    const result = {config,contextIdentity:`task_bc61c9989863-performance-${config.name}`,responses,errors};
    p.on('response',r=>responses.push({url:r.url(),status:r.status(),encoding:r.headers()['content-encoding']??null,type:r.request().resourceType()}));
    p.on('pageerror',e=>errors.push(String(e)));
    await p.addInitScript(()=>{
      performance.setResourceTimingBufferSize(2000);
      const probe=window.__finalProbe={frames:[],longTasks:[],contexts:[],phase:'first-load',trusted:[]};
      document.addEventListener('click',e=>probe.trusted.push({trusted:e.isTrusted,text:e.target.textContent?.slice(0,70),at:performance.now()}),true);
      new PerformanceObserver(list=>{for(const e of list.getEntries())probe.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=callback=>{const requested=performance.now();return raf(time=>{const f={time,requested,started:performance.now(),phase:probe.phase,calls:0,triangles:0};probe.current=f;try{callback(time);}finally{f.duration=performance.now()-f.started;probe.current=null;if(f.calls)probe.frames.push(f);}});};
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=original.call(this,type,...args);if(type!=='webgl2'||!gl||probe.contexts.includes(gl))return gl;probe.contexts.push(gl);for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const draw=gl[name].bind(gl);gl[name]=(...a)=>{const f=probe.current;if(f){f.calls++;if(a[0]===gl.TRIANGLES)f.triangles+=(name.startsWith('drawElements')?a[1]:a[2])/3*(name.endsWith('Instanced')?a.at(-1):1);}return draw(...a);};}return gl;};
    });
    const state=()=>p.evaluate(()=>({canvas:{...document.querySelector('canvas')?.dataset},dpr:devicePixelRatio,width:innerWidth,height:innerHeight,buffer:{width:document.querySelector('canvas')?.width,height:document.querySelector('canvas')?.height},at:performance.now()}));
    const resources=()=>p.evaluate(()=>performance.getEntriesByType('resource').map(r=>({url:r.name,initiator:r.initiatorType,encodedBodySize:r.encodedBodySize,decodedBodySize:r.decodedBodySize,transferSize:r.transferSize,duration:r.duration})));
    const mark=phase=>p.evaluate(v=>{window.__finalProbe.phase=v;},phase);
    const control=async name=>{const el=p.getByRole('button',{name,exact:true});await el.focus();await el.press('Enter');};
    const windowCount=async()=>{const before=await state();await p.waitForTimeout(700);return{before,after:await state()};};
    try {
      await p.goto(`${base}/studio`);await p.waitForSelector('canvas[data-assistant-revision]');
      result.initial=await state();
      result.graphics=await p.evaluate(()=>{const gl=window.__finalProbe.contexts[0],e=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:gl.getParameter(e?e.UNMASKED_RENDERER_WEBGL:gl.RENDERER),vendor:gl.getParameter(e?e.UNMASKED_VENDOR_WEBGL:gl.VENDOR),userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency};});
      result.beforeAsk=await resources();result.idle=await windowCount();
      await mark('attention');await p.getByRole('button',{name:/^Ask about Owen/}).focus();await p.waitForTimeout(350);result.attention=await windowCount();
      await mark('four-card');await p.keyboard.press('Enter');await p.getByRole('textbox',{name:/question/i}).fill('What did Owen do at LexisNexis?');await p.getByRole('textbox',{name:/question/i}).press('Control+Enter');
      await p.waitForFunction(()=>document.querySelector('canvas')?.dataset.assistantCardCount==='4');await p.waitForTimeout(350);result.fourCard=await windowCount();
      result.afterAsk=await resources();await p.getByRole('button',{name:'Close',exact:true}).press('Enter');
      await p.evaluate(()=>document.activeElement?.blur());await p.waitForTimeout(550);
      await mark('look-resize-10s');const start=await p.evaluate(()=>({time:performance.now(),index:window.__finalProbe.frames.length}));const begin=Date.now(),actions=[];
      let i=0;while(Date.now()-begin<10000){const name=['Look left','Look right','Look up','Look down'][i%4];await control(name);actions.push({name,elapsed:Date.now()-begin});if(++i%10===0){const width=config.width-(i%20===0?0:20);await p.setViewportSize({width,height:config.height});actions.push({resize:width,elapsed:Date.now()-begin});}}
      await p.waitForTimeout(100);const end=await p.evaluate(start=>({duration:performance.now()-start.time,frames:window.__finalProbe.frames.slice(start.index)}),start);result.tenSeconds={...end,actions};
      await p.setViewportSize({width:config.width,height:config.height});await mark('camera-extremes');result.extremes=[];
      for(const [name,times] of [['Look left',14],['Look down',6],['Look right',24],['Look up',8]]){for(let j=0;j<times;j++)await control(name);result.extremes.push({name,state:await state()});}
      await control('Reset view');await p.evaluate(()=>document.activeElement?.blur());
      result.allFrames=await p.evaluate(()=>window.__finalProbe.frames);result.longTasks=await p.evaluate(()=>window.__finalProbe.longTasks);result.trusted=await p.evaluate(()=>window.__finalProbe.trusted);
      result.coldResources=await resources();result.coldResponseEnd=responses.length;
      await p.reload();await p.setViewportSize({width:config.width,height:config.height});await p.waitForSelector('canvas[data-assistant-revision]');await p.getByRole('button',{name:/^Ask about Owen/}).press('Enter');
      result.warmResources=await resources();result.warmState=await state();
      const percentile=values=>values.sort((a,b)=>a-b)[Math.ceil(values.length*.95)-1];
      result.summary={peakCalls:Math.max(...result.allFrames.map(f=>f.calls)),peakTriangles:Math.max(...result.allFrames.map(f=>f.triangles)),firstFrames:result.allFrames.filter(f=>f.phase==='first-load'),requestedRafP95:percentile(end.frames.map(f=>f.started-f.requested)),callbackP95:percentile(end.frames.map(f=>f.duration)),sampleFrameCount:end.frames.length};
    } catch(e){result.failure=String(e);result.failureState=await state().catch(()=>null);} finally {await context.close();result.closed=true;}
    results.push(result);
  }
  return {buildId:'cFKSWm6Bayf__QstZY2CC',results,limits:{drawCalls:200,triangles:200000,encodedBytes:1500000,requestedRafP95:33},notes:['Fresh isolated contexts are cold; same-context reload is warm. No request routing during measurement.','All loaded JavaScript and GLB/image URLs form a conservative integrated closure; common framework JS is included once.','Raw WebGL draw entry points count whole RAF work including first shadow pass. Counters and CPU durations do not measure GPU time or VRAM.','Finite fixed windows are observation windows, not readiness tests. Trusted keyboard activation drives native controls.']};
}
