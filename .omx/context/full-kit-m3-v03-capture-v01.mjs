async (page) => {
  const selected={revision:'v03',glbSha256:'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf',manifestSha256:'060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405'};
  const artifactDir='C:/Users/Owenc/orca/Portfolio/.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m3-v03';
  const assertIdentity=identity=>{
    const candidate=identity.candidates?.proposal, base='design/studio-v2/asset-pipeline/full-kit', stem=`studio-full-kit-m3-proposal-${selected.revision}`;
    if(identity.stage!=='M3'||identity.tag!==selected.revision||identity.revision!==selected.revision||candidate?.glbPath!==`${base}/exports/${stem}.glb`||candidate?.manifestPath!==`${base}/manifests/${stem}.manifest.json`||candidate?.sha256!==selected.glbSha256||identity.sources?.[candidate?.glbPath]?.sha256!==selected.glbSha256||identity.sources?.[candidate?.manifestPath]?.sha256!==selected.manifestSha256||candidate?.manifest?.glbSha256!==selected.glbSha256)throw new Error('Harness provenance does not match pinned M3 v03 pair');
  };
  const verifyCurrent=async p=>{const response=await p.request.get('http://127.0.0.1:4182/provenance.json');if(!response.ok())throw new Error(`Provenance request failed: ${response.status()}`);const value=await response.json();assertIdentity(value);if(provenance.length && JSON.stringify(value)!==JSON.stringify(provenance[0]))throw new Error('Harness provenance changed during capture');};
  const records=[],composites=[],failures=[],provenance=[];
  const jobs=[{width:1440,height:900,kind:'desktop'},{width:1024,height:768,kind:'home'},{width:390,height:844,kind:'phone'},{width:320,height:844,kind:'phone'}];
  const settle=p=>p.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  await page.goto('about:blank');
  for(const job of jobs) {
    const context=await page.context().browser().newContext({viewport:{width:job.width,height:job.height},deviceScaleFactor:1,reducedMotion:'reduce'});
    const p=await context.newPage();
    const errors=[],warnings=[],responses=[],requestFailures=[];
    p.on('pageerror',e=>errors.push(String(e)));
    p.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push({type:m.type(),text:m.text(),location:m.location()});});
    p.on('response',r=>responses.push({url:r.url(),status:r.status(),type:r.request().resourceType()}));
    p.on('requestfailed',r=>requestFailures.push({url:r.url(),type:r.resourceType(),failure:r.failure()}));
    try {
      const mobile=job.width<=640;
      await p.goto('http://127.0.0.1:4182/?variant=proposal'+(mobile?'&fov=74':''));
      await p.waitForFunction(()=>['ready','error'].includes(document.documentElement.dataset.status),{},{timeout:45000});
      const ready=await p.evaluate(()=>({status:document.documentElement.dataset.status,error:window.m1PreviewError}));
      if(ready.status!=='ready')throw new Error(ready.error||ready.status);
      const identity=await p.evaluate(()=>window.m1Preview.snapshot().provenance);
      assertIdentity(identity);
      if(provenance.length && JSON.stringify(identity)!==JSON.stringify(provenance[0]))throw new Error('Harness provenance changed during capture');
      const poses=job.kind==='desktop' ? [['home',{yaw:-4,pitch:-6}],['left-down',{yaw:-38,pitch:-16}],['right-down',{yaw:58,pitch:-16}],['music',{yaw:44,pitch:-8}],['mid-right',{yaw:30,pitch:-6}]] : job.kind==='home' ? [['home',{yaw:-4,pitch:-6}]] : [['home',{yaw:-13.5,pitch:-7}],['music',{yaw:44,pitch:-8}],['left-down',{yaw:-38,pitch:-16}]];
      const compositeImages=[];
      for(const [name,pose] of poses) {
        await p.evaluate(value=>window.m1Preview.setPose(value),pose);
        await settle(p);
        const s=await p.evaluate(()=>window.m1Preview.snapshot());
        const sourceText=JSON.stringify(s.provenance);
        let sourceIndex=provenance.findIndex(entry=>JSON.stringify(entry)===sourceText);
        if(sourceIndex<0){sourceIndex=provenance.length;provenance.push(s.provenance);}
        delete s.provenance;
        const retained=/^(headphones__|kb_case__|kb_keycaps__|mic_boom__|mouse_native__|mug_coaster__|notebook_pen__|speaker_nearfield__|desk_frame__|desk_mat__|desk_top__|mon_|target_|border_|display_|pc_tower__|drum_cymbals__)/;
        s.meshBounds=Object.fromEntries(Object.entries(s.meshBounds).filter(([name])=>retained.test(name)));
        s.meshBoundsScope='Diagnostic subset: nearfield, desk/mat, monitors/targets/borders/displays, PC and cymbals; not visible pixels, occlusion or key pitch.';
        const filename=`scene-${name}-${job.width}x${job.height}-f${s.fov}.png`;
        await verifyCurrent(p);
        const png=await p.screenshot({path:`${artifactDir}/${filename}`,fullPage:false});
        records.push({filename,bytes:png.length,provenanceIndex:sourceIndex,...s,errors:[...errors],warnings:[...warnings],responses:[...responses],requestFailures:[...requestFailures]});
        compositeImages.push({name,filename,dataURL:'data:image/png;base64,'+png.toString('base64')});
      }
      await p.evaluate(()=>window.m1Preview.dispose());
      if(!compositeImages.length)continue;
      await p.goto('http://127.0.0.1:4181/studio');
      await p.locator('[data-scene-status="ready"]').waitFor({timeout:45000});
      await settle(p);
      for(const image of compositeImages) {
        const alignment=await p.evaluate(async input=>{
          const canvas=document.querySelector('#studio canvas');
          const layer=canvas?.closest('[class*="sceneLayer"]');
          if(!canvas||!layer)throw new Error('Actual product scene layer unavailable');
          const r=layer.getBoundingClientRect();
          if(Math.abs(r.x)>.5||Math.abs(r.y)>.5||Math.abs(r.width-innerWidth)>.5||Math.abs(r.height-innerHeight)>.5)throw new Error('Product scene does not match viewport-sized render');
          let img=layer.querySelector('[data-m2-composite]');
          if(!img){for(const child of [...layer.children])child.style.visibility='hidden';img=document.createElement('img');img.dataset.m2Composite='true';img.alt='';Object.assign(img.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',pointerEvents:'none',visibility:'visible'});layer.appendChild(img);}
          img.src=input.dataURL;await img.decode();
          if(img.naturalWidth!==innerWidth||img.naturalHeight!==innerHeight)throw new Error('Composite image dimensions differ');
          return {x:r.x,y:r.y,width:r.width,height:r.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight};
        },image);
        const toggle=p.getByRole('button',{name:'Projects',exact:true});
        if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')==='true')await toggle.click();
        const states=mobile ? (image.name==='home' ? ['closed','open'] : ['closed']) : ['default'];
        for(const state of states) {
          if(state==='open')await toggle.click();
          await settle(p);
          const ui=await p.evaluate(()=>{
            const rect=element=>{if(!element)return null;const r=element.getBoundingClientRect(),style=getComputedStyle(element);return {x:r.x,y:r.y,width:r.width,height:r.height,display:style.display,visibility:style.visibility,opacity:style.opacity};};
            const selectors={header:'#studio > header',projects:'#studio-projects',toggle:'[aria-controls="studio-projects"]',look:'[aria-label="Look around the studio"]',hint:'#studio [role="status"]'};
            return {url:location.href,viewport:[innerWidth,innerHeight],documentWidth:document.documentElement.scrollWidth,sceneStatus:document.querySelector('[data-scene-status]')?.dataset.sceneStatus,projectsOpen:document.querySelector('[aria-controls="studio-projects"]')?.getAttribute('aria-expanded'),rectangles:Object.fromEntries(Object.entries(selectors).map(([name,selector])=>[name,rect(document.querySelector(selector))])),stylesheets:[...document.styleSheets].map(sheet=>sheet.href),scope:'Static 1:1 M3 scene image beneath real authored product DOM/CSS. Not M3 product integration, picking or interaction evidence.'};
          });
          const filename=`chrome-${image.name}-${state}-${job.width}x${job.height}.png`;
          await verifyCurrent(p);
          const png=await p.screenshot({path:`${artifactDir}/${filename}`,fullPage:false});
          composites.push({filename,bytes:png.length,sceneImage:image.filename,alignment,ui,errors:[...errors],warnings:[...warnings],responses:[...responses],requestFailures:[...requestFailures]});
        }
      }
    } catch(error) {failures.push({job,error:String(error),errors,warnings,responses,requestFailures});}
    finally {await context.close();}
    if(failures.length)break;
  }
  return {capturedAt:new Date().toISOString(),selected,artifactDir,sceneCaptures:records.length,chromeComposites:composites.length,failures,records,composites,provenance,scope:'Actual pinned M3 proposal loader/binder/builder renders with provisional lighting and remaining proxies; focused nearfield views. Separately labelled static authored-chrome composites; no production integration, trusted-input, lifecycle or device-performance acceptance. Hash saved images separately and retain the returned evidence.'};
}
