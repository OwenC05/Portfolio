import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const out = 'design/assistant/robot/review/g4-v04-performance';
const input = 'design/assistant/robot/integration/verification-g4-v04/browser-results.json';
const raw = JSON.parse(readFileSync(input, 'utf8'));
assert.equal(raw.buildId, 'KEhdfJ0NJBO2q0ASaHcHN');
const percentile = (values, p) => [...values].sort((a,b)=>a-b)[Math.ceil(values.length*p)-1] ?? null;
const stats = values => ({ count: values.length, p50: percentile(values,.5), p90: percentile(values,.9), p95: percentile(values,.95), p99: percentile(values,.99), max: values.length ? Math.max(...values) : null });
const overlap = (a,b,c,d) => Math.max(0,Math.min(b,d)-Math.max(a,c));
const reports = raw.results.map(result => {
  assert.equal(result.failure, undefined);
  const frames = result.sample.frames, trusted = result.sample.trusted;
  const clicks = result.actions.filter(a=>a.kind==='trusted-look-button');
  assert.equal(clicks.length, trusted.length);
  assert.ok(trusted.every(c=>c.trusted));
  assert.ok(clicks.every((c,i)=>c.direction === (i%2 ? 'Look right' : 'Look left')));
  assert.equal(new Set(frames.map(f=>f.requested)).size,frames.length);
  assert.ok(frames.every(f=>Object.values(f).every(Number.isFinite) && f.requested<=f.started && f.duration>=0 && f.calls>0));
  const startIndex = result.allFrames.findIndex(f=>JSON.stringify(f)===JSON.stringify(frames[0]));
  assert.deepEqual(result.allFrames.slice(startIndex,startIndex+frames.length),frames);
  assert.equal(startIndex,2);
  assert.equal(Number(result.after.canvas.studioRenderCount)-Number(result.initial.canvas.studioRenderCount),frames.length);
  const delay = f=>f.started-f.requested;
  const request = stats(frames.map(delay)), callback=stats(frames.map(f=>f.duration));
  assert.equal(request.p95,result.summary.rafRequestToStartP95);
  assert.equal(callback.p95,result.summary.callbackDurationP95);
  assert.equal(request.p95<=33,result.summary.requestDelayGatePassed);
  // Browser timestamps of click #10 and #11 safely enclose the intervening
  // resize command. They do NOT identify the exact resize observer callback.
  const resizeBrackets=[];
  let ordinal=0;
  for(const action of result.actions) {
    if(action.kind==='trusted-look-button') ordinal++;
    else {
      assert.equal(ordinal%10,0);
      assert.ok(trusted[ordinal]);
      resizeBrackets.push({resize:resizeBrackets.length+1,afterClick:ordinal,width:action.width,from:trusted[ordinal-1].at,to:trusted[ordinal].at,hostCompletionElapsed:action.elapsed});
    }
  }
  const rows=frames.map((f,i)=>{
    const lastClick=trusted.findLastIndex(c=>c.at<=f.requested);
    const previousResize=resizeBrackets.findLast(b=>b.from<=f.requested);
    const brackets=resizeBrackets.filter(b=>overlap(f.requested,f.started+f.duration,b.from,b.to)>0);
    const requestTasks=result.sample.longTasks.filter(t=>overlap(f.requested,f.started,t.start,t.start+t.duration)>0);
    const callbackTasks=result.sample.longTasks.filter(t=>overlap(f.started,f.started+f.duration,t.start,t.start+t.duration)>0);
    return {index:i,allIndex:startIndex+i,...f,delay:delay(f),relativeToFirstClick:f.started-trusted[0].at,lastClick:lastClick+1,requestedAfterClickMs:lastClick<0?null:f.requested-trusted[lastClick].at,resizeBracket:brackets.map(b=>b.resize),priorResize:previousResize?.resize??null,clicksSincePriorResize:previousResize?lastClick+1-previousResize.afterClick:null,requestLongTasks:requestTasks,requestLongTaskOverlapMs:requestTasks.reduce((sum,t)=>sum+overlap(f.requested,f.started,t.start,t.start+t.duration),0),callbackLongTasks:callbackTasks,previousCallbackGapMs:i?f.requested-(frames[i-1].started+frames[i-1].duration):null,previousCallbackDuration:i?frames[i-1].duration:null};
  });
  const late=rows.filter(f=>f.delay>33);
  const noBracket=rows.filter(f=>f.resizeBracket.length===0);
  const observedTasks=result.sample.longTasks.filter(t=>overlap(frames[0].requested,frames.at(-1).started+frames.at(-1).duration,t.start,t.start+t.duration)>0);
  const bins=Array.from({length:10},(_,i)=>{const f=rows.filter(f=>f.relativeToFirstClick>=i*1000&&f.relativeToFirstClick<(i+1)*1000);return{second:i+1,frames:f.length,late:f.filter(f=>f.delay>33).length,delay:stats(f.map(f=>f.delay))};});
  return {
    name:result.config.name,config:result.config,graphics:result.graphics,request,callback,
    p95Rank:Math.ceil(frames.length*.95),p95RankNeighborhood:[...frames].map(delay).sort((a,b)=>a-b).slice(Math.ceil(frames.length*.95)-3,Math.ceil(frames.length*.95)+2),
    lateCount:late.length,latePercent:late.length/frames.length*100,delaysAbove50:late.filter(f=>f.delay>50).length,delaysAbove100:late.filter(f=>f.delay>100).length,
    initial:result.initial,after:result.after,sampleElapsed:result.sample.elapsed,startIndex,initialFrames:result.allFrames.slice(0,startIndex),
    trustedClicks:trusted.length,resizeCommands:resizeBrackets.length,actions:result.actions.length,lastAction:result.actions.at(-1),
    firstLastClick:[trusted[0].at,trusted.at(-1).at],clickIntervals:stats(trusted.slice(1).map((c,i)=>c.at-trusted[i].at)),
    resizeBrackets,lateFrames:late,
    lateInsideResizeBrackets:late.filter(f=>f.resizeBracket.length).length,
    lateWithinTwoClicksOfResize:late.filter(f=>f.clicksSincePriorResize!==null && f.clicksSincePriorResize<=2).length,
    lateWithRequestLongTaskOverlap:late.filter(f=>f.requestLongTasks.length).length,
    lateWithCallbackLongTaskOverlap:late.filter(f=>f.callbackLongTasks.length).length,
    sampleLongTasks:observedTasks,
    diagnosticOnlyOutsideResizeBrackets:{delay:stats(noBracket.map(f=>f.delay)),callback:stats(noBracket.map(f=>f.duration)),late: noBracket.filter(f=>f.delay>33).length},
    longCallbacks:rows.filter(f=>f.duration>33),bins,
    bounds:{sampleCalls:Math.max(...frames.map(f=>f.calls)),sampleTriangles:Math.max(...frames.map(f=>f.triangles)),allCalls:Math.max(...result.allFrames.map(f=>f.calls)),allTriangles:Math.max(...result.allFrames.map(f=>f.triangles))},
    allFramesCount:result.allFrames.length,framesWithNativeTimestampBeforeRequest:frames.filter(f=>f.time<f.requested).length,
    sampleRows:rows,
  };
});
const historical=[];
for(const file of ['matrix-first.json','matrix-reverse.json']) {
  const prior=JSON.parse(readFileSync(`design/assistant/robot/integration/performance-diagnosis-v01/${file}`,'utf8'));
  for(const r of prior.results) {
    const frames=r.probe.all.slice(r.sample.start.index).filter(f=>f.rendered);
    const delay=stats(frames.map(f=>f.started-f.requested));
    const callback=stats(frames.map(f=>f.duration));
    assert.equal(delay.p95,r.summary.requestToStart.p95);
    assert.equal(callback.p95,r.summary.callback.p95);
    historical.push({file,config:r.config,delay,callback,dimensions:r.summary.dimensions,loaded:r.loaded});
  }
}
const desktop=raw.results[0];
assert.equal(desktop.robotActivation.heading,'studio-ask-heading');
assert.equal(desktop.robotActivation.click.trusted,true);
assert.equal(desktop.robotActivation.click.target,'CANVAS');
assert.equal(desktop.sourceKeys.chips.length,4);
assert.deepEqual(desktop.sourceKeys.chips,desktop.sourceKeys.rows);
assert.equal(desktop.closed.dialogOpen,false);
assert.equal(desktop.closed.canvas.assistantCardCount,'0');
writeFileSync(`${out}/analysis.json`,JSON.stringify({input,buildId:raw.buildId,method:'Nearest-rank p95 over recorded draw-bearing RAF callbacks; resize click brackets are association only, not exact resize callback labels.',reports,historical,rootFunctionalReceiptsConsistent:true},null,2));
const csv=['sample,index,requested,started,delay,duration,lastClick,resizeBrackets,requestLongTaskOverlapMs',...reports.flatMap(r=>r.sampleRows.map(f=>[r.name,f.index,f.requested,f.started,f.delay,f.duration,f.lastClick,f.resizeBracket.join('|'),f.requestLongTaskOverlapMs].join(',')))].join('\n');
writeFileSync(`${out}/frames.csv`,csv);
const fmt=n=>n.toFixed(1);
writeFileSync(`${out}/late-repeat.csv`,['frameIndex,secondsAfterFirstClick,delayMs,callbackMs,precedingClick,priorResize,clicksSinceResize,insideResizeBracket,recordedLongTaskOverlapMs',...reports[2].lateFrames.map(f=>[f.index,fmt(f.relativeToFirstClick/1000),fmt(f.delay),fmt(f.duration),f.lastClick,f.priorResize,f.clicksSincePriorResize,Boolean(f.resizeBracket.length),f.requestLongTaskOverlapMs].join(','))].join('\n'));
console.log(JSON.stringify(reports.map(({name,request,callback,p95Rank,lateCount,latePercent,trustedClicks,resizeCommands,lateInsideResizeBrackets,lateWithRequestLongTaskOverlap,lateWithCallbackLongTaskOverlap,diagnosticOnlyOutsideResizeBrackets,bounds})=>({name,request,callback,p95Rank,lateCount,latePercent,trustedClicks,resizeCommands,lateInsideResizeBrackets,lateWithRequestLongTaskOverlap,lateWithCallbackLongTaskOverlap,diagnosticOnlyOutsideResizeBrackets,bounds})),null,2));
