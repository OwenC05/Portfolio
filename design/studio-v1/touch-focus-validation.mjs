async(page)=>{
 const browser=page.context().browser(),results=[];
 for(const isMobile of [false,true])for(const reducedMotion of ['reduce','no-preference']){
  const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile,reducedMotion}),p=await c.newPage();
  await p.goto('http://127.0.0.1:4181/studio');await p.locator('[data-scene-status="ready"]').waitFor();
  await p.evaluate(()=>{window.__touchTrace=[];for(const type of ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click','focusin','focusout'])document.addEventListener(type,event=>window.__touchTrace.push({type,target:event.target.tagName,id:event.target.id,trusted:event.isTrusted,pointerType:event.pointerType,active:document.activeElement.id||document.activeElement.tagName,hash:location.hash,scrollY,time:performance.now()}),true);});
  const rect=await p.locator('canvas').boundingBox();await p.touchscreen.tap(rect.x+116.3410,rect.y+178.5642);await p.waitForTimeout(700);
  results.push({isMobile,reducedMotion,...await p.evaluate(()=>({focus:document.activeElement.id||document.activeElement.tagName,hash:location.hash,selected:document.querySelector('[data-selected-project]')?.dataset.selectedProject,trace:window.__touchTrace}))});
  await c.close();
 }
 return{results,failures:results.filter(r=>r.focus!=='project-dissertation-heading'),note:'Fresh production contexts with no focus/scroll wrappers; trusted touchscreen.tap. Expected final focus is existing project-dissertation-heading.'};
}
