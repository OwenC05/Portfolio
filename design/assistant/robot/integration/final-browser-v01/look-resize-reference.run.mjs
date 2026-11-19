async(page)=>{
 const results=[];
 for(const config of [{name:'desktop',width:1440,height:900,dpr:2},{name:'small',width:390,height:844,dpr:1.5}]){
  const c=await page.context().browser().newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:config.dpr,reducedMotion:'no-preference'}),p=await c.newPage();
  const result={config,identity:'task_bc61c9989863-reference-'+config.name};
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
  try{await p.goto('http://127.0.0.1:4193/studio');await p.setViewportSize({width:config.width,height:config.height});await p.waitForSelector('canvas[data-assistant-revision]');await p.waitForTimeout(650);
   const start=await p.evaluate(()=>({time:performance.now(),index:window.__finalProbe.frames.length})),begin=Date.now(),actions=[];let step=0;
   while(Date.now()-begin<10000){const direction=step++%2===0?'Look left':'Look right';await p.getByRole('button',{name:direction,exact:true}).click();actions.push({kind:'trusted-look-button',direction,elapsed:Date.now()-begin});if(step%10===0){const width=step%20===0?config.width:config.width-60;await p.setViewportSize({width,height:config.height});actions.push({kind:'viewport-resize',width,elapsed:Date.now()-begin});}}
   await p.waitForTimeout(150);result.sample=await p.evaluate(start=>({elapsed:performance.now()-start.time,frames:window.__finalProbe.frames.slice(start.index),longTasks:window.__finalProbe.longTasks,canvas:{...document.querySelector('canvas').dataset},trusted:window.__finalProbe.trusted,devicePixelRatio,viewport:{width:innerWidth,height:innerHeight}}),start);result.actions=actions;
   const percentile=v=>v.sort((a,b)=>a-b)[Math.ceil(v.length*.95)-1];result.summary={rafRequestToStartP95:percentile(result.sample.frames.map(f=>f.started-f.requested)),callbackDurationP95:percentile(result.sample.frames.map(f=>f.duration)),peakCalls:Math.max(...result.sample.frames.map(f=>f.calls)),peakTriangles:Math.max(...result.sample.frames.map(f=>f.triangles)),frames:result.sample.frames.length};
  }catch(e){result.failure=String(e);}finally{await c.close();result.closed=true;}results.push(result);
 }
 return{results,scenario:'Original performance-validation.mjs ten-second alternating trusted Look left/right mouse clicks; every tenth click resizes by 60 CSS pixels, then back on twentieth. Current requested desktop/small DPR instead of old DPR3.',limits:'Scheduling and callback CPU measurements, not GPU FPS; original broader four-direction keyboard stress result remains retained.'};
}
