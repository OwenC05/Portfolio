async (page) => {
  const out='C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/final-browser-v01';
  const results=[];
  for(const mode of ['robot-transport','robot-malformed','context-loss']) {
    const context=await page.context().browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'}),p=await context.newPage();
    const result={mode,contextIdentity:`task_bc61c9989863-${mode}`,interceptions:[],checks:[],console:[],errors:[]};
    p.on('pageerror',e=>result.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')result.console.push(m.text());});
    await p.addInitScript(()=>{window.__documentToken=crypto.randomUUID();window.__clicks=[];document.addEventListener('click',e=>window.__clicks.push({trusted:e.isTrusted,x:e.clientX,y:e.clientY,target:e.target.tagName}),true);});
    if(mode!=='context-loss')await context.route('**/studio/assistant-apprentice-v03.glb',async route=>{result.interceptions.push({url:route.request().url(),mode});if(mode==='robot-transport')await route.abort('failed');else await route.fulfill({status:200,contentType:'model/gltf-binary',body:Buffer.from('malformed GLB fixture; exact pinned hash cannot match')});});
    const state=()=>p.evaluate(()=>({token:window.__documentToken,canvas:{...document.querySelector('canvas')?.dataset},hasCanvas:!!document.querySelector('canvas'),status:document.querySelector('[data-scene-status]')?.getAttribute('data-scene-status'),dialog:document.querySelector('dialog')?.open,focus:document.activeElement?.id,chips:document.querySelectorAll('dialog button[data-hit-key]').length,links:[...document.querySelectorAll('dialog a')].map(e=>({text:e.textContent,href:e.getAttribute('href')})),clicks:window.__clicks}));
    const check=(name,passed,evidence)=>result.checks.push({name,passed,evidence});
    const open=async()=>{await p.getByRole('button',{name:/^Ask about Owen/}).press('Enter');await p.waitForFunction(()=>document.querySelector('dialog')?.open);};
    const ask=async q=>{await p.getByRole('textbox',{name:/question/i}).fill(q);await p.getByRole('textbox',{name:/question/i}).press('Control+Enter');};
    try {
      await p.goto('http://127.0.0.1:4193/studio');await p.waitForSelector('[data-scene-status="ready"]');
      if(mode!=='context-loss'){
        await p.waitForFunction(()=>document.querySelector('canvas')?.dataset.studioRenderCount>=2);await p.mouse.click(1130,310);const unloaded=await state();
        check('Robot unavailable while room stays ready and former head position has no target',result.interceptions.length===1&&!unloaded.canvas.assistantRevision&&unloaded.status==='ready'&&!unloaded.dialog&&unloaded.clicks.at(-1)?.trusted,unloaded);
        await open();await ask('What did Owen do at LexisNexis?');await p.waitForSelector('dialog button[data-hit-key]');const html=await state();check('Named Ask, exact source results and contact link remain available',html.chips===4&&html.links.some(l=>l.href?.startsWith('/work/lexisnexis'))&&html.links.some(l=>l.href==='#contact'),html);await p.screenshot({path:`${out}/${mode}.png`});
        await p.locator('dialog a[href^="/work/lexisnexis"]').first().press('Enter');await p.waitForURL('**/work/lexisnexis*');result.sourceNavigation=p.url();
        await p.goto('http://127.0.0.1:4193/studio');await p.setViewportSize({width:1440,height:900});await p.waitForSelector('[data-scene-status="ready"]');await open();await ask('Neptune quantum bakery qualifications');await p.waitForSelector('[data-assistant-result="no-match"]');await p.locator('dialog a[href="#contact"]').press('Enter');await p.waitForURL('**/studio#contact');result.contactNavigation={url:p.url(),state:await state()};
      }else{
        await p.waitForSelector('canvas[data-assistant-revision]');await open();
        await p.evaluate(()=>{window.__realFetch=fetch;window.fetch=(input,init)=>{if(!String(input).includes('/api/assistant'))return window.__realFetch(input,init);const question=JSON.parse(init.body).question;window.__pendingQuestion=question;return Promise.resolve(new Response(new ReadableStream({start(c){window.__pendingController=c;c.enqueue(new TextEncoder().encode(JSON.stringify({type:'retrieval-start',question})+'\n'));}}),{headers:{'Content-Type':'application/x-ndjson'}}));};});
        await ask('Pending during actual WebGL context loss');await p.waitForSelector('button:has-text("Cancel")');const before=await state();
        result.extension=await p.evaluate(()=>{const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2'),ext=gl.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});
        if(result.extension){await p.waitForSelector('[data-scene-status="unavailable"]');await p.getByRole('button',{name:'Close',exact:true}).press('Enter');await open();const after=await state();check('Real context loss removes scene; HTML close/reopen survives without document reload',!after.hasCanvas&&after.dialog&&before.token===after.token, {before,after});await p.screenshot({path:`${out}/context-loss-reopened.png`});await p.evaluate(()=>{window.fetch=window.__realFetch;});await ask('What did Owen do at LexisNexis?');await p.waitForSelector('dialog button[data-hit-key]');const recovered=await state();check('HTML retrieval still works after context loss',recovered.chips===4&&recovered.token===before.token,recovered);}else result.unrun='WEBGL_lose_context unavailable';
      }
    }catch(e){result.failure=String(e);result.failureState=await state().catch(()=>null);await p.screenshot({path:`${out}/${mode}-attempt-failure.png`}).catch(()=>{});}finally{await context.close();result.closed=true;}results.push(result);
  }
  return {results,limits:['Malformed bytes fail the pinned-byte import boundary; this does not bypass the SHA guard to exercise every GLTFLoader branch.','Context closure removes local routes and fetch overrides. Browser GPU reclamation and dev StrictMode are not established.']};
}
