async (page) => {
 const output='C:/Users/Owenc/orca/Portfolio/.playwright-mcp/root-g4-v04';
 const results=[];
 for(const config of [{name:'desktop-first',width:1440,height:900,dpr:2},{name:'small',width:390,height:844,dpr:1.5},{name:'desktop-repeat',width:1440,height:900,dpr:2}]){
  const context=await page.context().browser().newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:config.dpr,reducedMotion:'no-preference',serviceWorkers:'block'});
  const p=await context.newPage(),result={config,identity:'root-g4-v04-'+config.name};
  const state=()=>p.evaluate(()=>({at:performance.now(),nativeDpr:devicePixelRatio,viewport:{width:innerWidth,height:innerHeight},hidden:document.hidden,focused:document.hasFocus(),canvas:{...document.querySelector('canvas')?.dataset},buffer:{width:document.querySelector('canvas')?.width,height:document.querySelector('canvas')?.height},rect:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),dialogOpen:document.querySelector('dialog')?.open,active:{tag:document.activeElement?.tagName,id:document.activeElement?.id},bodyText:document.body.textContent?.includes('Ask about Owen')}));
  await p.addInitScript(()=>{
   const probe=window.__candidateProbe={frames:[],longTasks:[],contexts:[],trusted:[]};
   document.addEventListener('click',e=>probe.trusted.push({trusted:e.isTrusted,text:e.target.textContent?.slice(0,70),target:e.target.tagName,x:e.clientX,y:e.clientY,at:performance.now()}),true);
   new PerformanceObserver(list=>{for(const e of list.getEntries())probe.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=callback=>{const requested=performance.now();return raf(time=>{const f={time,requested,started:performance.now(),calls:0,triangles:0};probe.current=f;try{callback(time);}finally{f.duration=performance.now()-f.started;probe.current=null;if(f.calls)probe.frames.push(f);}});};
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=original.call(this,type,...args);if(type!=='webgl2'||!gl||probe.contexts.includes(gl))return gl;probe.contexts.push(gl);for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const draw=gl[name].bind(gl);gl[name]=(...a)=>{const f=probe.current;if(f){f.calls++;if(a[0]===gl.TRIANGLES)f.triangles+=(name.startsWith('drawElements')?a[1]:a[2])/3*(name.endsWith('Instanced')?a.at(-1):1);}return draw(...a);};}return gl;};
  });
  try{
   await p.goto('http://127.0.0.1:4193/studio');await p.setViewportSize({width:config.width,height:config.height});await p.waitForSelector('canvas[data-assistant-revision]');await p.waitForTimeout(650);
   result.initial=await state();
   result.graphics=await p.evaluate(()=>{const gl=window.__candidateProbe.contexts[0],e=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:gl.getParameter(e?e.UNMASKED_RENDERER_WEBGL:gl.RENDERER),userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency};});
   if(Math.abs(result.initial.nativeDpr-config.dpr)>1e-6||Number(result.initial.canvas.studioDpr)!==1.5)throw Error('Native and renderer DPR contract failed');
   const start=await p.evaluate(()=>({time:performance.now(),index:window.__candidateProbe.frames.length})),begin=Date.now(),actions=[];let step=0;
   while(Date.now()-begin<10000){const direction=step++%2===0?'Look left':'Look right';await p.getByRole('button',{name:direction,exact:true}).click();actions.push({kind:'trusted-look-button',direction,elapsed:Date.now()-begin});if(step%10===0){const width=step%20===0?config.width:config.width-60;await p.setViewportSize({width,height:config.height});actions.push({kind:'viewport-resize',width,elapsed:Date.now()-begin});}}
   await p.waitForTimeout(150);
   result.sample=await p.evaluate(start=>({elapsed:performance.now()-start.time,frames:window.__candidateProbe.frames.slice(start.index),longTasks:window.__candidateProbe.longTasks,trusted:window.__candidateProbe.trusted}),start);
   result.actions=actions;result.after=await state();
   const percentile=v=>v.sort((a,b)=>a-b)[Math.ceil(v.length*.95)-1];
   result.summary={rafRequestToStartP95:percentile(result.sample.frames.map(f=>f.started-f.requested)),callbackDurationP95:percentile(result.sample.frames.map(f=>f.duration)),peakCalls:Math.max(...result.sample.frames.map(f=>f.calls)),peakTriangles:Math.max(...result.sample.frames.map(f=>f.triangles)),frames:result.sample.frames.length};
   result.summary.requestDelayGatePassed=result.summary.rafRequestToStartP95<=33;
   // Screenshots and functional smoke occur AFTER all timed sample work.
   if(config.name==='desktop-first'){
    await p.setViewportSize({width:1440,height:900});await p.getByRole('button',{name:'Reset view',exact:true}).click();await p.mouse.move(0,0);await p.evaluate(()=>document.activeElement?.blur());await p.waitForTimeout(650);
    const before=await state();await p.screenshot({path:output+'/native-dpr2-neutral.png'});const after=await state();result.neutralCapture={file:'native-dpr2-neutral.png',before,after};
    if(before.dialogOpen||before.canvas.assistantCardCount!=='0'||before.canvas.studioRenderCount!==after.canvas.studioRenderCount)throw Error('Neutral capture not stable');
    await p.mouse.move(1130,310);await p.waitForTimeout(650);await p.mouse.click(1130,310);await p.waitForSelector('dialog[open][data-panel-variant="assistant"]');
    result.robotActivation=await p.evaluate(()=>({heading:document.activeElement.id,click:window.__candidateProbe.trusted.at(-1)}));
    if(result.robotActivation.heading!=='studio-ask-heading'||!result.robotActivation.click.trusted||result.robotActivation.click.target!=='CANVAS')throw Error('Native robot activation failed');
    const field=p.getByRole('textbox',{name:/question/i});await field.fill('What has Owen worked on at LexisNexis?');await field.press('Control+Enter');await p.waitForFunction(()=>document.querySelector('canvas')?.dataset.assistantCardCount==='4');await p.waitForTimeout(650);
    const sourceBefore=await state();await p.screenshot({path:output+'/native-dpr2-four-sources.png'});const sourceAfter=await state();result.sourcesCapture={file:'native-dpr2-four-sources.png',before:sourceBefore,after:sourceAfter};
    result.sourceKeys=await p.evaluate(()=>({chips:[...document.querySelectorAll('dialog button[data-hit-key]')].map(e=>e.dataset.hitKey),rows:[...document.querySelectorAll('dialog li[data-hit-key]')].map(e=>e.dataset.hitKey)}));
    if(result.sourceKeys.chips.length!==4||JSON.stringify(result.sourceKeys.chips)!==JSON.stringify(result.sourceKeys.rows)||sourceBefore.canvas.studioRenderCount!==sourceAfter.canvas.studioRenderCount)throw Error('Four-source capture mismatch');
    await p.keyboard.press('Escape');result.closed=await state();if(result.closed.dialogOpen||result.closed.canvas.assistantCardCount!=='0')throw Error('Close did not clear');
   }
   result.allFrames=await p.evaluate(()=>window.__candidateProbe.frames);result.peakCalls=Math.max(...result.allFrames.map(f=>f.calls));result.peakTriangles=Math.max(...result.allFrames.map(f=>f.triangles));
  }catch(error){result.failure=String(error);result.failureState=await state().catch(()=>null);await p.screenshot({path:output+'/'+config.name+'-failure.png'}).catch(()=>{});}
  finally{await context.close();result.contextClosed=true;}
  results.push(result);
 }
 return{buildId:'KEhdfJ0NJBO2q0ASaHcHN',browser:page.context().browser().version(),results,scenario:'Original ten-second native mouse look/resize with 650ms post-ready settle and 150ms drain; fresh contexts; native desktop DPR2, renderer cap1.5; no screenshot inside timed windows.',limits:['CPU request delay and callback spans, not GPU FPS.','Two desktop windows and one small window, shared host; earlier adverse evidence remains.','Isolated browser tool because ordinary tool reported existing profile busy; same Chromium157, graphics identity recorded.']};
}
