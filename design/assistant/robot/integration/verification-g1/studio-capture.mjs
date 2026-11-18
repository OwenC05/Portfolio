async (page) => {
  const origin = 'http://127.0.0.1:4193';
  const out = 'C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/verification-g1/studio';
  const captures = [], checks = [], sessions = [];
  const inputDprs = /* INPUT_DPRS */ [1, 3];
  const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 844 }, { width: 320, height: 568 }];
  const check = (name, pass, evidence) => checks.push({ name, pass: !!pass, evidence });
  for (const inputDpr of inputDprs) for (const viewport of viewports) {
    const context = await page.context().browser().newContext({ viewport, deviceScaleFactor: inputDpr, reducedMotion: 'reduce' });
    const p = await context.newPage(), errors = [], responses = [];
    p.on('pageerror', error => errors.push(String(error)));
    p.on('response', r => responses.push({ url: r.url(), status: r.status(), encoding: r.headers()['content-encoding'] ?? null }));
    const key = `${viewport.width}x${viewport.height}-dpr${inputDpr}`;
    const flush = () => p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const details = () => p.evaluate(() => {
      const canvas = document.querySelector('canvas'), host = canvas.parentElement;
      const rect = e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; };
      return { viewport: [innerWidth, innerHeight], devicePixelRatio, scroll: [scrollX,scrollY], documentWidth: document.documentElement.scrollWidth,
        canvas: { ...canvas.dataset }, canvasRect:rect(canvas), hostRect:rect(host), buffer:[canvas.width,canvas.height],
        sceneStatus:document.querySelector('[data-scene-status]').dataset.sceneStatus,
        projectsExpanded:document.querySelector('#studio-projects-toggle')?.getAttribute('aria-expanded') ?? [...document.querySelectorAll('button')].find(b=>b.textContent.includes('Projects'))?.getAttribute('aria-expanded'),
        dialogOpen:!!document.querySelector('dialog[open]'), focusedId:document.activeElement?.id, userAgent:navigator.userAgent };
    });
    const capture = async pose => { await flush(); const filename=`${key}-${pose}.png`; await p.screenshot({path:`${out}/${filename}`}); const data=await details(); captures.push({filename,path:`${out}/${filename}`,pose,capturedAt:new Date().toISOString(),...data}); check(`${key}/${pose} no overflow`,data.documentWidth<=viewport.width,data.documentWidth); return data; };
    const clicks = async (name,count) => { for(let i=0;i<count;i++) await p.getByRole('button',{name,exact:true}).click(); await flush(); };
    try {
      await p.goto(`${origin}/studio`);
      await p.locator('[data-scene-status="ready"]').waitFor({timeout:20000}); await flush();
      const home=await capture('home');
      const mobile=viewport.width<=640||home.hostRect.width/home.hostRect.height<0.9;
      check(`${key} source camera matches`,home.canvas.studioEye==='-0.7,2.8,3.4'&&Number(home.canvas.studioFov)===(mobile?64:58)&&Number(home.canvas.studioYaw)===(mobile?-13:-4)&&Number(home.canvas.studioPitch)===(mobile?-8:-6),home.canvas);
      check(`${key} DPR cap matches`,Number(home.canvas.studioDpr)===Math.min(inputDpr,mobile?1.5:2),home.canvas.studioDpr);
      if(inputDpr===1){
        await clicks('Look left',10);await clicks('Look up',4);const lu=await capture('left-up');
        await clicks('Look down',4);const ld=await capture('left-down');
        await clicks('Look right',10);const rd=await capture('right-down');
        await clicks('Look up',4);const ru=await capture('right-up');
        check(`${key} all look bounds`,lu.canvas.studioYaw==='-38'&&lu.canvas.studioPitch==='12'&&ld.canvas.studioPitch==='-16'&&rd.canvas.studioYaw==='58'&&rd.canvas.studioPitch==='-16'&&ru.canvas.studioPitch==='12',[lu.canvas,ld.canvas,rd.canvas,ru.canvas]);
        await clicks('Reset view',1);
      }
      const projectToggle=p.getByRole('button',{name:/^Projects/});
      if(await projectToggle.isVisible())await projectToggle.click();
      await capture('projects-open');
      if(inputDpr===1){
        for(const id of ['dissertation','copilot','typeforge']){
          const link=p.locator(`#studio-shortcut-${id}`);
          await link.click();await p.locator('dialog[open]').waitFor();await flush();
          const detail=await details();check(`${key} named ${id} activation and heading focus`,detail.dialogOpen&&detail.focusedId===`panel-project-${id}-heading`,detail);
          if(id==='dissertation')await capture('project-dialog');
          await p.keyboard.press('Escape');await p.locator('dialog[open]').waitFor({state:'hidden'});await flush();
          check(`${key} ${id} return focus`,(await details()).focusedId===`studio-shortcut-${id}`,(await details()).focusedId);
        }
        // Project-screen centers come from the pinned source, projected through the live camera.
        if(viewport.width===1440){
          for(const target of [{id:'dissertation',position:[-1.61,2.38,-0.27],yaw:0},{id:'copilot',position:[-3.11,2.44,-0.13],yaw:0.3},{id:'typeforge',position:[-0.11,2.44,-0.13],yaw:-0.3}]){
            await p.getByRole('button',{name:'Reset view',exact:true}).click();await flush();
            const point=await p.evaluate(target=>{
              const canvas=document.querySelector('canvas'),d=canvas.dataset,r=canvas.getBoundingClientRect(),eye=d.studioEye.split(',').map(Number),yaw=Number(d.studioYaw)*Math.PI/180,pitch=Number(d.studioPitch)*Math.PI/180;
              const q=[target.position[0]+Math.sin(target.yaw)*0.054-eye[0],target.position[1]-eye[1],target.position[2]+Math.cos(target.yaw)*0.054-eye[2]];
              const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),depth=dot(q,[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)]),tan=Math.tan(Number(d.studioFov)*Math.PI/360);
              const x=dot(q,[Math.cos(yaw),0,Math.sin(yaw)])/depth/tan/(r.width/r.height),y=dot(q,[-Math.sin(pitch)*Math.sin(yaw),Math.cos(pitch),Math.sin(pitch)*Math.cos(yaw)])/depth/tan;
              return{x:r.x+(x+1)*r.width/2,y:r.y+(1-y)*r.height/2};
            },target);
            await p.mouse.click(point.x,point.y);await p.locator('dialog[open]').waitFor({timeout:2500});
            check(`Desktop canvas ${target.id} trusted picking`,(await details()).focusedId===`panel-project-${target.id}-heading`,{point,state:await details()});
            await p.keyboard.press('Escape');await p.locator('dialog[open]').waitFor({state:'hidden'});
          }
        }
      }
      const resources=await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>({url:r.name,initiator:r.initiatorType,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,decodedBodySize:r.decodedBodySize})));
      sessions.push({key,viewport,inputDpr,errors,responses,resources,final:await details()});
      check(`${key} no runtime page errors`,errors.length===0,errors);
    }catch(error){check(`${key} capture session`,false,{error:String(error),errors});sessions.push({key,viewport,inputDpr,errors,responses,error:String(error)});}
    finally{await context.close();}
  }
  return{origin,capturedAt:new Date().toISOString(),captures,checks,sessions,limits:['Actual production pilot room, no robot.','Emulated viewports/DPR, no physical-device validation.','Canvas counters are sampled renderer counters, not exhaustive GPU or forced-shadow-refresh peaks.']};
}
