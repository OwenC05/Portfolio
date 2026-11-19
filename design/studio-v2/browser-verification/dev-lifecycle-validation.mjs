async (page) => {

  const config = /* STUDIO_V2_CONFIG */ null;
  if (!config?.baseURL || !['development','production'].includes(config.previewMode) || !config.hashes || !config.sceneJS?.length || !config.glbs?.length) throw new Error('Supply final v2 config; see README.md');
  const absolute = value => new URL(value, config.baseURL).href;
  if (config.previewMode !== 'development') throw new Error('StrictMode lifecycle requires development preview');
  // Run with isolated browser_run_code_unsafe filename. No application hook/files are changed.
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  page = await context.newPage();
  await page.addInitScript(() => {
    const probe = window.__studioProbe = { listeners: [], observers: [], pending: new Map(), frames: [], contexts: [], audio: 0, documentToken: Math.random() };
    const owned = () => /components[\\/]studio[\\/]/.test(new Error().stack || '');
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function(type, fn, options) {
      const capture = typeof options === 'boolean' ? options : !!options?.capture;
      if (owned() && !probe.listeners.some(x => x.active && x.target === this && x.type === type && x.fn === fn && x.capture === capture)) probe.listeners.push({target:this,type,fn,capture,active:true});
      return add.call(this,type,fn,options);
    };
    EventTarget.prototype.removeEventListener = function(type,fn,options) {
      const capture = typeof options === 'boolean' ? options : !!options?.capture;
      probe.listeners.forEach(x => {if(x.target === this && x.type === type && x.fn === fn && x.capture === capture)x.active=false;});
      return remove.call(this,type,fn,options);
    };
    for(const kind of ['ResizeObserver','IntersectionObserver']) {
      const Original = window[kind];
      window[kind] = class extends Original {
        constructor(callback){super(callback);this.record={kind,owned:owned(),active:false};probe.observers.push(this.record);}
        observe(...args){this.record.active=true;return super.observe(...args);}
        disconnect(){this.record.active=false;return super.disconnect();}
      };
    }
    const raf=requestAnimationFrame.bind(window), cancel=cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => {
      const sceneOwned=owned();
      const id=raf(time=>{probe.pending.delete(id);const frame={time,owned:sceneOwned,calls:0,triangles:0};probe.current=frame;try{callback(time);}finally{probe.current=null;if(frame.calls)probe.frames.push(frame);}});
      probe.pending.set(id,sceneOwned);return id;
    };
    window.cancelAnimationFrame=id=>{probe.pending.delete(id);return cancel(id);};
    const getContext=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      const gl=getContext.call(this,type,...args);
      if(type!=='webgl2'||!gl||probe.contexts.some(x=>x.gl===gl))return gl;
      const record={gl,canvas:this,created:{},deleted:{},lost:false};probe.contexts.push(record);
      for(const kind of ['Buffer','Texture','Framebuffer','Renderbuffer','Program','Shader','VertexArray']) {
        record.created[kind]=0;record.deleted[kind]=0;
        const create=gl['create'+kind].bind(gl),del=gl['delete'+kind].bind(gl);
        gl['create'+kind]=(...a)=>{const value=create(...a);if(value)record.created[kind]++;return value;};
        gl['delete'+kind]=value=>{if(value)record.deleted[kind]++;return del(value);};
      }
      for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']) {
        const original=gl[name].bind(gl);
        gl[name]=(...a)=>{if(probe.current){probe.current.calls++;const count=name.startsWith('drawElements')?a[1]:a[2];const instances=name.endsWith('Instanced')?a[a.length-1]:1;if(a[0]===gl.TRIANGLES)probe.current.triangles+=count/3*instances;}return original(...a);};
      }
      const getExtension=gl.getExtension.bind(gl);
      gl.getExtension=name=>{const extension=getExtension(name);if(name==='WEBGL_lose_context'&&extension&&!extension.__wrapped){const lose=extension.loseContext.bind(extension);extension.loseContext=()=>{record.lost=true;return lose();};extension.__wrapped=true;}return extension;};
      return gl;
    };
    for(const name of ['AudioContext','webkitAudioContext','Audio'])if(window[name]){const Original=window[name];window[name]=class extends Original{constructor(...args){super(...args);probe.audio++;}};}
    probe.snapshot=()=>({documentToken:probe.documentToken,canvases:document.querySelectorAll('canvas').length,activeListeners:probe.listeners.filter(x=>x.active).map(x=>x.type),activeObservers:probe.observers.filter(x=>x.owned&&x.active).map(x=>x.kind),pendingOwnedRAF:[...probe.pending.values()].filter(Boolean).length,contexts:probe.contexts.map(x=>({connected:x.canvas.isConnected,contextLossRequested:x.lost,isContextLost:x.gl.isContextLost(),created:x.created,deleted:x.deleted})),frames:probe.frames,audio:probe.audio});
  });
  try {
  await page.setViewportSize({width:1440,height:900});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(absolute('/'));
  await page.waitForFunction(()=>!!window.next?.router);
  const baseline=await page.evaluate(()=>window.__studioProbe.snapshot());
  const cycles=[];
  for(let i=0;i<5;i++){
    await page.evaluate(()=>window.next.router.push('/studio'));
    await page.locator('[data-scene-status="ready"]').waitFor();
    await page.waitForTimeout(250);
    const mounted=await page.evaluate(()=>window.__studioProbe.snapshot());
    await page.evaluate(()=>window.next.router.push('/'));
    await page.locator('#studio').waitFor({state:'detached'});
    await page.waitForTimeout(250);
    const unmounted=await page.evaluate(()=>window.__studioProbe.snapshot());
    cycles.push({cycle:i+1,mounted,unmounted});
  }
  const checks=cycles.map(({cycle,mounted,unmounted})=>({cycle,pass:mounted.canvases===1 && unmounted.canvases===baseline.canvases && unmounted.documentToken===baseline.documentToken && unmounted.activeListeners.length===baseline.activeListeners.length && unmounted.activeObservers.length===baseline.activeObservers.length && unmounted.pendingOwnedRAF===baseline.pendingOwnedRAF && unmounted.contexts.every(c=>!c.connected && (c.isContextLost || Object.keys(c.created).every(k=>c.created[k]===c.deleted[k])))}));
  const result={config,checks,kind:'Actual development Next App Router transitions with React StrictMode double effect',url:page.url(),baseline,cycles,errors,limitations:'Stack ownership matching is development-only; once/AbortSignal listener expiry and observer unobserve are not inferred. Context loss or balanced delete calls is only an API teardown observation. StrictMode replay must be confirmed from context records, not assumed from preview mode. Injected instrumentation retains references for counting; this measures removal/cancellation/disconnect/delete/context-loss, not heap collection or physical GPU memory.'};
  return result;
  } finally { await context.close(); }
}
