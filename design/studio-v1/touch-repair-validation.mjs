async(page)=>{
 const browser=page.context().browser(),checks=[],errors=[];
 const check=(name,pass,details)=>checks.push({name,pass,details});
 const state=p=>p.evaluate(()=>({hash:location.hash,focus:document.activeElement.id||document.activeElement.tagName,selected:document.querySelector('[data-selected-project]')?.dataset.selectedProject,history:history.length,pushes:window.__touchAudit.pushes.length,trace:window.__touchAudit.events.slice(-15),scrollY}));
 const projection=p=>p.locator('canvas').evaluate(canvas=>{
  const r=canvas.getBoundingClientRect(),mobile=innerWidth<=640||r.width/r.height<.9,eye=mobile?[-4,7,12]:[-8,6.5,11.5],target=[.3,1.8,0];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),norm=a=>a.map(v=>v/Math.hypot(...a)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x),view=p=>[dot(sub(p,eye),x),dot(sub(p,eye),y)];
  const corners=[];for(const a of [-4.6,5.2])for(const b of [0,4.6])for(const c of [-2.3,2.5])corners.push(view([a,b,c]));
  const min=[0,1].map(i=>Math.min(...corners.map(p=>p[i]))),max=[0,1].map(i=>Math.max(...corners.map(p=>p[i]))),center=min.map((v,i)=>(v+max[i])/2),aspect=r.width/r.height,hh=Math.max(max[1]-min[1],(max[0]-min[0])/aspect)*.53;
  return{rect:r.toJSON(),targets:[['dissertation',[-1.61,2.35,-.216]],['copilot',[-3.03,2.41,-.116]],['typeforge',[-.19,2.41,-.116]]].map(([id,p])=>{const q=view(p);return{id,x:(q[0]-center[0]+hh*aspect)/(2*hh*aspect)*r.width,y:(center[1]+hh-q[1])/(2*hh)*r.height};})};
 });
 for(const width of [390,320])for(const reducedMotion of ['reduce','no-preference']){
  const c=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion}),p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(()=>{window.__touchAudit={pushes:[],events:[]};const push=history.pushState.bind(history);history.pushState=(...args)=>{window.__touchAudit.pushes.push(String(args[2]));return push(...args);};for(const type of ['pointerdown','pointerup','mousedown','click','focusin'])document.addEventListener(type,e=>window.__touchAudit.events.push({type,target:e.target.tagName,id:e.target.id,pointerType:e.pointerType,trusted:e.isTrusted,focus:document.activeElement.id||document.activeElement.tagName}),true);});
  await p.goto('http://127.0.0.1:4181/studio');await p.locator('[data-scene-status="ready"]').waitFor();await p.waitForTimeout(150);
  const reset=async()=>{await p.locator('#project-dissertation a[href="#studio"]').click();await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(120);};
  const tap=async(id,dx=0,dy=0,label='center')=>{await p.locator('canvas').scrollIntoViewIfNeeded();await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const points=await projection(p),t=points.targets.find(t=>t.id===id),before=await state(p);await p.touchscreen.tap(points.rect.x+t.x+dx,points.rect.y+t.y+dy);await p.waitForTimeout(100);const after=await state(p);check(`${width} ${reducedMotion} ${label} ${id}`,after.hash==='#project-'+id&&after.focus==='project-'+id+'-heading'&&after.selected===id&&after.pushes-before.pushes===(before.hash===after.hash?0:1),{before:{hash:before.hash,pushes:before.pushes},geometry:points,after});};
  for(const id of ['dissertation','copilot','typeforge']){await tap(id);await reset();}
  for(const [label,dx,dy] of [['outer top corner',-21.5,-21.5],['outer bottom corner',-21.5,21.5],['outer edge',-21.5,0]]){await tap('copilot',dx,dy,label);await reset();}
  await tap('dissertation');await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(120);await tap('dissertation',0,0,'repeat destination');await reset();
  const rect=(await projection(p)).rect,client=await c.newCDPSession(p),position=(await projection(p)).targets[0],tx=rect.x+position.x,ty=rect.y+position.y;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx,y:ty-90}]});await p.waitForTimeout(80);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(100);const scrolled=await state(p);check(`${width} ${reducedMotion} normal touch scrolling`,scrolled.hash==='#studio'&&scrolled.scrollY>0,scrolled);await client.detach();await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await p.setViewportSize({width:844,height:width});await p.waitForTimeout(160);check(`${width} landscape no overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await tap('dissertation',0,0,'landscape after resize');await reset();
  await p.setViewportSize({width,height:844});await p.waitForTimeout(160);await tap('copilot',-21.5,0,'portrait after orientation return');
  await c.close();
 }
 return{checks,failures:checks.filter(c=>!c.pass),errors,method:'Trusted touchscreen gestures in fresh isMobile contexts; matching heading focus sampled after compatibility click; both motion settings at320/390 plus landscape/portrait resize. History spy only records and forwards calls. Canvas-relative coordinates independently projected from authored camera/plane geometry.'};
}
