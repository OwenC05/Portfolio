import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const page = process.argv[2]
if (!page) throw new Error('Supply an owned local preview page')
const expression = `(()=>{
  const prior = document.activeElement;
  const button = document.createElement('button');
  button.id = 'g4-probe-invoker'; button.textContent = 'Focus probe';
  const dialog = document.createElement('dialog');
  const heading = document.createElement('h2');
  heading.id = 'g4-probe-heading'; heading.tabIndex = -1; heading.textContent = 'Focus probe';
  dialog.append(heading); document.body.append(button,dialog);
  const events=[]; const listener=e=>events.push(e.target.id||e.target.tagName);
  document.addEventListener('focusin',listener,true);
  const result={userAgent:navigator.userAgent, location:location.href};
  try {
    button.focus(); dialog.showModal(); heading.focus(); events.length=0; dialog.close();
    result.nativeControl={events:[...events],returned:document.activeElement===button};
    button.focus(); button.blur(); dialog.showModal(); heading.focus(); events.length=0; dialog.close();
    result.navigationPolicy={events:[...events],returned:document.activeElement===button,active:document.activeElement.tagName};
    button.focus({preventScroll:true});
    result.explicitOrdinaryReturn=document.activeElement===button;
    return JSON.stringify(result);
  } finally {
    document.removeEventListener('focusin',listener,true);
    if(dialog.open)dialog.close(); dialog.remove();button.remove();
    if(prior instanceof HTMLElement && prior.isConnected)prior.focus({preventScroll:true});
  }
})()`
const reply=JSON.parse(execFileSync('orca',['eval','--page',page,'--expression',expression,'--json'],{encoding:'utf8',windowsHide:true,shell:false,timeout:25000}))
if(!reply.ok)throw Error(JSON.stringify(reply.error))
const result=JSON.parse(reply.result.result)
writeFileSync(new URL('./native-dialog-probe.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),result,limit:'Isolated real native dialog primitive on the owned Chromium page, not a rebuilt application route/focus verification.'},null,2))
assert.equal(result.nativeControl.returned,true)
assert.equal(result.navigationPolicy.returned,false)
assert.deepEqual(result.navigationPolicy.events,[])
assert.equal(result.explicitOrdinaryReturn,true)
console.log(JSON.stringify(result))
