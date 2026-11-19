async (page) => {
  // Root must explicitly fill this after independent candidate approval and harness pinning.
  const selected={revision:'v05',glbSha256:'4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735',manifestSha256:'aaa0c2628810152c165f7e2564c0524394057241ce1f43ec6c94042c5f3ba5e7',artifactDir:'C:/Users/Owenc/orca/Portfolio/.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v05'};
  if (!/^v\d+$/.test(selected.revision ?? '') || !/^[0-9a-f]{64}$/.test(selected.glbSha256 ?? '') || !/^[0-9a-f]{64}$/.test(selected.manifestSha256 ?? '') || !selected.artifactDir) throw new Error('Set explicit approved revision, lowercase GLB/manifest SHA-256 and artifactDir in selected before capture');
  const artifactDir=selected.artifactDir;
  const records=[],composites=[],failures=[],provenance=[];
  const jobs=[{width:1440,height:900,kind:'desktop'},{width:1024,height:768,kind:'home'},{width:390,height:844,kind:'phone'}];
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
      const candidate=identity.candidates?.proposal;
      const stem=`studio-full-kit-m2-proposal-${selected.revision}`;
      const base='design/studio-v2/asset-pipeline/full-kit';
      if (identity.stage!=='M2' || identity.tag!==selected.revision || identity.revision!==selected.revision || candidate?.glbPath!==`${base}/exports/${stem}.glb` || candidate?.manifestPath!==`${base}/manifests/${stem}.manifest.json` || candidate?.sha256!==selected.glbSha256 || identity.sources?.[candidate?.glbPath]?.sha256!==selected.glbSha256 || identity.sources?.[candidate?.manifestPath]?.sha256!==selected.manifestSha256 || candidate?.manifest?.glbSha256!==selected.glbSha256) throw new Error('Harness provenance does not match explicitly selected M2 revision and paired hashes');
      const poses=job.kind==='desktop' ? [['home',{yaw:-4,pitch:-6}],['mid-right',{yaw:30,pitch:-6}],['music',{yaw:44,pitch:-8}]] : job.kind==='home' ? [['home',{yaw:-4,pitch:-6}]] : [['music',{yaw:44,pitch:-8}]];
      const compositeImages=[];
      for(const [name,pose] of poses) {
        await p.evaluate(value=>window.m1Preview.setPose(value),pose);
        await settle(p);
        const s=await p.evaluate(()=>window.m1Preview.snapshot());
        const sourceText=JSON.stringify(s.provenance);
        let sourceIndex=provenance.findIndex(entry=>JSON.stringify(entry)===sourceText);
        if(sourceIndex<0){sourceIndex=provenance.length;provenance.push(s.provenance);}
        delete s.provenance;
        const filename=`scene-${name}-${job.width}x${job.height}-f${s.fov}.png`;
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
        const states=[mobile?'closed':'default'];
        for(const state of states) {
          if(state==='open')await toggle.click();
          await settle(p);
          const ui=await p.evaluate(()=>{
            const rect=element=>{if(!element)return null;const r=element.getBoundingClientRect(),style=getComputedStyle(element);return {x:r.x,y:r.y,width:r.width,height:r.height,display:style.display,visibility:style.visibility,opacity:style.opacity};};
            const selectors={header:'#studio > header',projects:'#studio-projects',toggle:'[aria-controls="studio-projects"]',look:'[aria-label="Look around the studio"]',hint:'#studio [role="status"]'};
            return {url:location.href,viewport:[innerWidth,innerHeight],documentWidth:document.documentElement.scrollWidth,sceneStatus:document.querySelector('[data-scene-status]')?.dataset.sceneStatus,projectsOpen:document.querySelector('[aria-controls="studio-projects"]')?.getAttribute('aria-expanded'),rectangles:Object.fromEntries(Object.entries(selectors).map(([name,selector])=>[name,rect(document.querySelector(selector))])),stylesheets:[...document.styleSheets].map(sheet=>sheet.href),scope:'Static 1:1 M2 scene image beneath real authored product DOM/CSS. Not M2 product integration, picking or interaction evidence.'};
          });
          const filename=`chrome-${image.name}-${state}-${job.width}x${job.height}.png`;
          const png=await p.screenshot({path:`${artifactDir}/${filename}`,fullPage:false});
          composites.push({filename,bytes:png.length,sceneImage:image.filename,alignment,ui,errors:[...errors],warnings:[...warnings],responses:[...responses],requestFailures:[...requestFailures]});
        }
      }
    } catch(error) {failures.push({job,error:String(error),errors,warnings,responses,requestFailures});}
    finally {await context.close();}
    if(failures.length)break;
  }
  return {capturedAt:new Date().toISOString(),selected,artifactDir,sceneCaptures:records.length,chromeComposites:composites.length,failures,records,composites,provenance,scope:'Actual explicitly selected M2 proposal loader/binder/builder renders with provisional lighting and remaining proxies; focused PC repair views. Separately labelled static authored-chrome composites; no production integration, trusted-input, lifecycle or device-performance acceptance. Hash saved images separately and retain the returned evidence.'};
}
