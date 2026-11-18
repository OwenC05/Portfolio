async(page)=>{
 const out='C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/integration/performance-diagnosis-v01',c=await page.context().browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'no-preference'}),p=await c.newPage();
 const result={identity:'task_aa4db155162f-settled-attention',buildId:'cFKSWm6Bayf__QstZY2CC',captures:[],errors:[]};p.on('pageerror',e=>result.errors.push(String(e)));
 await p.addInitScript(()=>{window.__attentionFocus=[];document.addEventListener('focusin',e=>window.__attentionFocus.push({at:performance.now(),trusted:e.isTrusted,text:e.target.textContent}),true);});
 const state=()=>p.evaluate(()=>{const canvas=document.querySelector('canvas'),ask=[...document.querySelectorAll('button')].find(e=>e.textContent?.startsWith('Ask about Owen'));return{at:performance.now(),viewport:{width:innerWidth,height:innerHeight},devicePixelRatio,hidden:document.hidden,dialogOpen:document.querySelector('dialog')?.open,focusedAsk:document.activeElement===ask,activeText:document.activeElement?.textContent,canvas:{...canvas.dataset},hostRect:canvas.parentElement.getBoundingClientRect().toJSON(),buffer:{width:canvas.width,height:canvas.height},focusTrace:window.__attentionFocus};});
 try{
  await p.goto('http://127.0.0.1:4193/studio');await p.setViewportSize({width:1440,height:900});await p.waitForSelector('canvas[data-assistant-revision]');
  for(const view of ['home','neighbour']){
   await p.getByRole('button',{name:'Reset view',exact:true}).click();if(view==='neighbour'){for(let i=0;i<3;i++)await p.getByRole('button',{name:'Look right',exact:true}).click();await p.getByRole('button',{name:'Look up',exact:true}).click();}await p.mouse.move(0,0);
   // Native backwards Tab from the first look control reaches Ask in the real DOM order.
   await p.getByRole('button',{name:'Look left',exact:true}).focus();await p.keyboard.press('Shift+Tab');
   await p.waitForFunction(()=>document.activeElement?.textContent?.startsWith('Ask about Owen'));await p.waitForTimeout(650);const settleStart=await state();await p.waitForTimeout(300);const before=await state();const path=out+'/attention-'+view+'-dpr2.png';await p.screenshot({path});const after=await state();
   const expected=view==='home'?{yaw:'-4',pitch:'-6'}:{yaw:'26',pitch:'4'};
   result.captures.push({view,path,settleStart,before,after,passed:before.viewport.width===1440&&before.viewport.height===900&&before.canvas.studioDpr==='2'&&!before.dialogOpen&&before.focusedAsk&&after.focusedAsk&&before.canvas.assistantRunId===''&&before.canvas.assistantCardCount==='0'&&before.canvas.studioYaw===expected.yaw&&before.canvas.studioPitch===expected.pitch&&before.canvas.studioEye==='-0.7,2.8,3.4'&&before.canvas.studioFov==='58'&&settleStart.canvas.studioRenderCount===before.canvas.studioRenderCount&&before.canvas.studioRenderCount===after.canvas.studioRenderCount});
  }
 }catch(e){result.failure=String(e);}finally{await c.close();result.closed=true;}
 return result;
}
