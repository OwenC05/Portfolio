async(page)=>{
 const results=[],browser=page.context().browser();
 for(const reducedMotion of ['reduce','no-preference'])for(const boundaryInstrumentation of [false,true]){
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion}),p=await c.newPage();
  await p.goto('http://127.0.0.1:4181/studio');await p.locator('[data-scene-status="ready"]').waitFor();await p.waitForTimeout(100);
  await p.evaluate(instrument=>{
   window.__penTrace=[];window.__penPushes=0;const original=history.pushState.bind(history);history.pushState=(...args)=>{window.__penPushes++;return original(...args);};
   for(const type of ['pointerdown','pointerup','pointerout','pointerleave','mousedown','click','focusin'])document.addEventListener(type,e=>window.__penTrace.push({type,target:e.target.tagName,id:e.target.id,trusted:e.isTrusted,pointerType:e.pointerType,pointerId:e.pointerId,buttons:e.buttons,focus:document.activeElement.id||document.activeElement.tagName}),true);
   if(instrument)document.addEventListener('pointerup',e=>{
    if(e.pointerType!=='pen'||e.target.tagName!=='CANVAS')return;
    // Document bubble runs after the controller's trusted canvas pointerup.
    // Only boundary events are synthetic; down/up and subsequent click come from CDP.
    for(const type of ['pointerout','pointerleave'])e.target.dispatchEvent(new PointerEvent(type,{bubbles:type==='pointerout',pointerType:'pen',pointerId:e.pointerId,isPrimary:true,buttons:0,button:-1,clientX:e.clientX,clientY:e.clientY}));
   });
  },boundaryInstrumentation);
  const r=await p.locator('canvas').boundingBox(),x=r.x+116.3410,y=r.y+178.5642,session=await c.newCDPSession(p);
  await session.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1,pointerType:'pen'});
  await session.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1,pointerType:'pen'});
  await p.waitForTimeout(100);const result=await p.evaluate(()=>({hash:location.hash,focus:document.activeElement.id||document.activeElement.tagName,selected:document.querySelector('[data-selected-project]')?.dataset.selectedProject,pushes:window.__penPushes,trace:window.__penTrace}));
  const trusted=['pointerdown','pointerup','click'].every(type=>result.trace.some(e=>e.type===type&&e.pointerType==='pen'&&e.trusted));
  results.push({reducedMotion,boundaryInstrumentation,pass:trusted&&result.focus==='project-dissertation-heading'&&result.hash==='#project-dissertation'&&result.selected==='dissertation'&&result.pushes===1,...result});await c.close();
 }
 return{results,failures:results.filter(x=>!x.pass),limitations:'Trusted CDP pen down/up/click; when indicated, post-up out/leave are explicitly untrusted boundary instrumentation to model non-hover pen release order. This is not real non-hover pen hardware evidence.'};
}
