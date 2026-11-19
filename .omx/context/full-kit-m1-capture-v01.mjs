async (page) => {
  const artifactDir = 'C:/Users/Owenc/orca/Portfolio/.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m1-v02';
  const evidencePath = 'C:/Users/Owenc/orca/Portfolio/.omx/context/full-kit-m1-runtime-capture-v01.json';
  const records = [], failures = [], provenance = [];
  const jobs = [
    { variant: 'baseline', width: 1440, height: 900, extended: true },
    { variant: 'proposal', width: 1440, height: 900, extended: true },
    { variant: 'baseline', width: 1024, height: 768 },
    { variant: 'proposal', width: 1024, height: 768 },
    { variant: 'baseline', width: 320, height: 844 },
    { variant: 'proposal', width: 320, height: 844, fov: 70 },
    { variant: 'proposal', width: 320, height: 844, fov: 74 },
    { variant: 'proposal', width: 320, height: 844, fov: 76 },
    { variant: 'baseline', width: 390, height: 844 },
    { variant: 'proposal', width: 390, height: 844, fov: 74 },
    { variant: 'proposal', width: 390, height: 844, fov: 76 },
    { variant: 'baseline', width: 320, height: 568 },
    { variant: 'proposal', width: 320, height: 568, fov: 74 },
    { variant: 'proposal', width: 320, height: 568, fov: 76 },
  ];
  // The tool page is root-owned; release the previous preview before creating one capture context.
  await page.goto('about:blank');
  for (const job of jobs) {
    const context = await page.context().browser().newContext({viewport: {width:job.width,height:job.height},deviceScaleFactor:1,reducedMotion:'reduce'});
    const p = await context.newPage();
    const errors=[], warnings=[], responses=[];
    p.on('pageerror', error => errors.push(String(error)));
    p.on('console', message => { if (['warning','error'].includes(message.type())) warnings.push({type:message.type(),text:message.text()}); });
    p.on('response', response => { if (response.url().includes('/asset/') || response.status() >= 400) responses.push({url:response.url(),status:response.status()}); });
    try {
      const query = new URLSearchParams({variant:job.variant});
      if (job.fov) query.set('fov',String(job.fov));
      await p.goto(`http://127.0.0.1:4182/?${query}`);
      await p.waitForFunction(() => ['ready','error'].includes(document.documentElement.dataset.status),{},{timeout:30000});
      const state = await p.evaluate(() => ({status:document.documentElement.dataset.status,error:window.m1PreviewError}));
      if (state.status !== 'ready') throw new Error(state.error || state.status);
      const poses=[['home',null]];
      if(job.extended) poses.push(['music',{yaw:44,pitch:-8}],['right-up',{yaw:58,pitch:12}],['right-down',{yaw:58,pitch:-16}],['left-down',{yaw:-38,pitch:-16}]);
      for(const [name,pose] of poses) {
        if(pose) await p.evaluate(value => window.m1Preview.setPose(value),pose);
        await p.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
        const snapshot=await p.evaluate(()=>window.m1Preview.snapshot());
        const sourceText=JSON.stringify(snapshot.provenance);
        let sourceIndex=provenance.findIndex(entry=>JSON.stringify(entry)===sourceText);
        if(sourceIndex<0){sourceIndex=provenance.length;provenance.push(snapshot.provenance);}
        delete snapshot.provenance;
        const filename=`${job.variant}-${name}-${job.width}x${job.height}-f${snapshot.fov}.png`;
        const bytes=await p.screenshot({path:`${artifactDir}/${filename}`,fullPage:false});
        records.push({filename,bytes:bytes.length,provenanceIndex:sourceIndex,...snapshot,errors:[...errors],warnings:[...warnings],responses:[...responses]});
      }
      await p.evaluate(()=>window.m1Preview.dispose());
    } catch(error) {
      failures.push({job,error:String(error),errors,warnings,responses});
    } finally {
      await context.close();
    }
    if(failures.length) break;
  }
  return {capturedAt:new Date().toISOString(),evidencePath,artifactDir,captures:records.length,failures,records,provenance,scope:'Actual M1 isolated loader/binder/builder capture; no production UI, trusted-input, lifecycle, device-performance or final visual acceptance. Image hashes added from saved files immediately after capture.'};
}
