async(page)=>{
 const browser=page.context().browser(),base='http://127.0.0.1:4181',folder='C:/Users/Owenc/orca/Portfolio/.omx/artifacts/visual-ralph/portfolio-after-hours-v1/';
 const c=await browser.newContext(),p=await c.newPage(),chunks=[];const reads=[];
 p.on('response',response=>{if(response.url().includes('/_next/')&&response.url().endsWith('.js'))reads.push(response.text().then(text=>{if(text.includes('studioDpr'))chunks.push(response.url());}));});
 await p.goto(base+'/studio');await p.locator('[data-scene-status="ready"]').waitFor();await Promise.all(reads);await c.close();
 const checks=[];
 for(const mode of ['lazy-chunk','webgl-creation','context-loss']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),test=await context.newPage(),errors=[],consoleErrors=[];
  test.on('pageerror',e=>errors.push(String(e)));test.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  if(mode==='lazy-chunk'){if(chunks.length!==1)throw new Error('Expected exactly one scene chunk: '+chunks);await context.route(chunks[0],r=>r.abort('failed'));}
  if(mode==='webgl-creation')await test.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
  await test.goto(base+'/studio');
  let loss;
  if(mode==='context-loss'){
   await test.locator('[data-scene-status="ready"]').waitFor();
   loss=await test.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),extension=gl.getExtension('WEBGL_lose_context');window.__lostContext=gl;if(!extension)return{supported:false};extension.loseContext();return{supported:true};});
  }
  await test.locator('[data-scene-status="unavailable"]').waitFor();
  const fallback=await test.evaluate(()=>({status:document.querySelector('[data-scene-status]').dataset.sceneStatus,canvas:document.querySelectorAll('canvas').length,caption:document.querySelector('[role="status"]').textContent,sketchVisible:[...document.querySelectorAll('span')].find(e=>e.textContent==='The studio / a still sketch')?.checkVisibility(),sections:document.querySelectorAll('#work > section').length,lost:window.__lostContext?.isContextLost()}));
  await test.screenshot({path:folder+mode+'-390.png'});
  await test.locator('nav[aria-label="Selected projects"] a').first().click();const evidence=await test.evaluate(()=>({hash:location.hash,focus:document.activeElement.id,text:document.getElementById('project-dissertation').textContent}));await test.locator('#project-dissertation a[href="#studio"]').click();const back=await test.evaluate(()=>({hash:location.hash,focus:document.activeElement.id}));
  checks.push({mode,pass:fallback.status==='unavailable'&&fallback.canvas===0&&fallback.sketchVisible&&fallback.sections===3&&fallback.caption.includes('Reload to try again')&&evidence.focus==='project-dissertation-heading'&&back.focus==='studio'&&(mode!=='context-loss'||fallback.lost===true),fallback,journey:{hash:evidence.hash,focus:evidence.focus,evidenceCharacters:evidence.text.length,back},loss,errors,consoleErrors});await context.close();
 }
 return{sceneChunks:chunks,checks,failures:checks.filter(x=>!x.pass),note:'Injected lazy-load failures are logged by the React boundary as expected; full HTML survives. WebGL creation and context loss are tested separately in fresh contexts.'};
}
