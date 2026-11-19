import assert from 'node:assert/strict';
import {createReadStream,readFileSync,writeFileSync} from 'node:fs';
import {createInterface} from 'node:readline';
const dir='design/assistant/robot/integration/resize-wait-trace-v01';
const result=JSON.parse(readFileSync(`${dir}/browser-result.json`,'utf8'));
assert.equal(result.failure,undefined);assert.equal(result.traceStarted,true);assert.equal(result.contextClosed,true);
const frames=result.probe.frames.slice(result.start.index,result.end.index).filter(f=>f.rendered);
const stats=v=>{v=[...v].sort((a,b)=>a-b);return{count:v.length,p50:v[Math.ceil(v.length*.5)-1]??null,p95:v[Math.ceil(v.length*.95)-1]??null,max:v.at(-1)??null};};
const overlap=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
const write=(name,value)=>writeFileSync(`${dir}/${name}`,JSON.stringify(value,null,2));
async function* events(){
  const lines=createInterface({input:createReadStream(`${dir}/chromium-trace.json`),crlfDelay:Infinity});
  let eventsClosed=false;
  for await(const line of lines){
    if(eventsClosed)continue;
    if(!line.startsWith('{')||line.startsWith('{"traceEvents":'))continue;
    // The last event shares its line with the trace array/document terminator.
    // Locate the complete object without interpreting braces inside strings.
    let depth=0,quoted=false,escaped=false,end=-1;
    for(let i=0;i<line.length;i++){
      const c=line[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}
      else if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end=i+1;break;}
    }
    assert.ok(end>0,'Incomplete trace event');
    const tail=line.slice(end);
    if(tail==='],"metadata":')eventsClosed=true;
    else assert.match(tail,/^[,\]\s}]*$/,'Unexpected content after trace event');
    let parsed;try{parsed=JSON.parse(line.slice(0,end));}catch(error){throw Error(`Trace event parse failed: ${String(error)} ${line.slice(0,100)}`);}
    if(parsed.ph)yield parsed;
  }
}
const marks=new Map(),threads=new Map(),processes=new Map(),counts=new Map(),phases=new Map();let eventCount=0;
for await(const e of events()){
  eventCount++;phases.set(e.ph,(phases.get(e.ph)||0)+1);counts.set(e.name,(counts.get(e.name)||0)+1);
  if(e.ph==='M'&&e.name==='thread_name')threads.set(`${e.pid}:${e.tid}`,e.args.name);
  if(e.ph==='M'&&e.name==='process_name')processes.set(e.pid,e.args.name);
  if(e.name?.startsWith('rw:'))marks.set(e.name,e);
}
const startMark=marks.get(result.start.mark),endMark=marks.get(result.end.mark);
assert.ok(startMark&&endMark);const renderer={pid:startMark.pid,tid:startMark.tid,name:threads.get(`${startMark.pid}:${startMark.tid}`)};
const offset=startMark.ts/1000-result.start.at;
const markerOffsets=result.probe.markers.filter(m=>marks.has(m.name)).map(m=>marks.get(m.name).ts/1000-m.at);
const toPage=t=>t/1000-offset;
const mainEvents=[],otherEvents=[],flowEvents=[],begins=new Map();
for await(const e of events()){
  const isMain=e.pid===renderer.pid&&e.tid===renderer.tid;
  if(e.ph==='X'){
    if(isMain)mainEvents.push(e);
    else if(e.dur>=1000)otherEvents.push(e);
  }else if(e.ph==='B'){
    const key=`${e.pid}:${e.tid}`;if(!begins.has(key))begins.set(key,[]);begins.get(key).push(e);
  }else if(e.ph==='E'){
    const b=begins.get(`${e.pid}:${e.tid}`)?.pop();
    if(b){const complete={...b,ph:'X',dur:e.ts-b.ts,derivedFromBE:true};if(isMain)mainEvents.push(complete);else if(complete.dur>=1000)otherEvents.push(complete);}
  }else if(isMain&&['RequestAnimationFrame','FireAnimationFrame','BeginFrame','BeginMainThreadFrame','ScheduleStyleRecalculation'].includes(e.name))flowEvents.push(e);
}
const unionMs=spans=>{spans.sort((a,b)=>a[0]-b[0]);let sum=0,end=-Infinity;for(const [a,b]of spans){if(b>end){sum+=b-Math.max(a,end);end=b;}}return sum;};
const eventView=(e,a,b)=>({name:e.name,category:e.cat,pid:e.pid,tid:e.tid,thread:threads.get(`${e.pid}:${e.tid}`),process:processes.get(e.pid),at:toPage(e.ts),duration:e.dur/1000,threadDuration:e.tdur===undefined?null:e.tdur/1000,overlap:overlap(a,b,toPage(e.ts),toPage(e.ts+e.dur)),args:e.args});
const changedWrites=result.probe.writes.filter(w=>w.at>=result.start.at&&w.ended<=result.end.at&&w.old!==w.value);
const late=frames.filter(f=>f.started-f.requested>33).map(f=>{
  const precedingWrite=changedWrites.findLast(w=>w.ended<=f.requested);
  const precedingResize=result.actions.filter(a=>a.kind==='viewport-resize').findLast(a=>a.issue.at<=f.requested);
  const observer=result.probe.markers.filter(m=>m.kind==='observer-start'&&m.at<=f.requested).at(-1);
  const main=mainEvents.filter(e=>overlap(f.requested,f.started,toPage(e.ts),toPage(e.ts+e.dur))>0).map(e=>eventView(e,f.requested,f.started)).sort((a,b)=>b.overlap-a.overlap);
  const other=otherEvents.filter(e=>overlap(f.requested,f.started,toPage(e.ts),toPage(e.ts+e.dur))>0).map(e=>eventView(e,f.requested,f.started)).sort((a,b)=>b.overlap-a.overlap);
  return{id:f.id,owner:f.owner,requested:f.requested,started:f.started,delay:f.started-f.requested,duration:f.duration,beforeBuffer:f.beforeBuffer,afterBuffer:f.afterBuffer,precedingWrite,msAfterWrite:precedingWrite?f.requested-precedingWrite.ended:null,precedingResize,observer,requestToObserver:observer?f.requested-observer.at:null,requestLongTasks:result.probe.longTasks.filter(t=>overlap(f.requested,f.started,t.start,t.start+t.duration)>0),mainTraceUnionMs:unionMs(main.map(e=>[Math.max(f.requested,e.at),Math.min(f.started,e.at+e.duration)])),mainTrace:main,otherTrace:other.slice(0,25)};
});
const host=readFileSync(`${dir}/host-load.jsonl`,'utf8').trim().split(/\r?\n/).map(JSON.parse);
const sampleEpoch=[result.start.timeOrigin+result.start.at,result.start.timeOrigin+result.end.at];
const hostOverlap=host.filter(h=>!h.error&&overlap(sampleEpoch[0],sampleEpoch[1],Date.parse(h.at),Date.parse(h.completed))>0);
const hostInside=host.filter(h=>!h.error&&Date.parse(h.at)>=sampleEpoch[0]&&Date.parse(h.at)<=sampleEpoch[1]);
const changedFrames=frames.filter(f=>changedWrites.some(w=>w.frameId===f.id));
const unchangedWrites=result.probe.writes.filter(w=>w.at>=result.start.at&&w.ended<=result.end.at&&w.old===w.value);
const summary={buildId:result.buildId,singleScenario:true,frames:frames.length,requestDelay:stats(frames.map(f=>f.started-f.requested)),callback:stats(frames.map(f=>f.duration)),late:late.length,changedWrites:stats(changedWrites.map(w=>w.duration)),unchangedWrites:stats(unchangedWrites.map(w=>w.duration)),resizeCallback:stats(changedFrames.map(f=>f.duration)),setterTotal:changedWrites.reduce((n,w)=>n+w.duration,0),changedCallbackTotal:changedFrames.reduce((n,f)=>n+f.duration,0),allVisibleFocused:frames.every(f=>!f.hidden&&!f.hiddenAfter&&f.focused&&f.focusedAfter),maxPending:result.probe.maxPending,owners:result.probe.owners,markers:result.probe.markers.length,requestWrapperCost:stats(result.probe.requests.slice(result.start.requestIndex).map(r=>r.wrapperMs)),callbackPreApplicationCost:stats(frames.map(f=>f.applicationStarted-f.started)),trace:{eventCount,renderer,offset,markerOffsetSpreadMs:Math.max(...markerOffsets)-Math.min(...markerOffsets),matchedMarkers:markerOffsets.length,phases:Object.fromEntries(phases),topNames:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,45),threads:[...threads].map(([id,name])=>({id,name})),startMark,endMark,mainEvents:mainEvents.length,otherEvents:otherEvents.length,flowEvents:flowEvents.slice(0,20)},host:{sampleEpoch,overlappingQueries:hostOverlap,queryStartsInside:hostInside.length,cpuPercent:stats(hostInside.map(h=>h.cpuPercent)),availableMB:stats(hostInside.map(h=>h.availableMB)),queryWallMs:stats(hostInside.map(h=>h.queryDurationMs)),allSamplerQueries:host.length},lateFrames:late};
assert.equal(summary.requestDelay.p95,result.summary.requestToStart.p95);
assert.equal(summary.callback.p95,result.summary.callback.p95);
assert.equal(Number(result.after.canvas.studioRenderCount)-Number(result.initial.canvas.studioRenderCount),frames.length);
assert.ok(hostOverlap.length>0);assert.equal(result.probe.owners.length,1);assert.equal(result.probe.maxPending,1);
write('analysis.json',summary);
const presentation=late.map(f=>{
  const event=f.otherTrace.find(e=>e.name==='DXGISwapChainImageBacking::Present');
  assert.ok(event,'Expected overlapping presentation span');
  const frame=frames.find(x=>x.id===f.id);
  const observer=result.probe.markers.find(m=>m.kind==='observer-start'&&m.at<=f.requested&&result.probe.markers.some(end=>end.kind==='observer-end'&&end.start===m.name&&end.at>=f.requested));
  return{id:f.id,delayMs:f.delay,callbackMs:f.duration,requestInsideObserver:!!observer,msAfterChangedSetter:f.msAfterWrite,mainTraceSpanUnionMs:f.mainTraceUnionMs,presentStartPageMs:event.at,presentWallMs:event.duration,presentThreadDurationMs:event.threadDuration,presentOverlapMs:event.overlap,presentOverlapPercent:100*event.overlap/f.delay,presentEndToCallbackMs:f.started-event.at-event.duration,presentPid:event.pid,presentTid:event.tid,requestMark:frame.requestMark,startMark:frame.startMark};
});
write('presentation-spans.json',presentation);
const columns=Object.keys(presentation[0]);
writeFileSync(`${dir}/presentation-spans.csv`,[columns.join(','),...presentation.map(row=>columns.map(c=>row[c]).join(','))].join('\n'));
write('trace-event-inventory.json',{eventCount,phases:Object.fromEntries(phases),names:[...counts].sort((a,b)=>b[1]-a[1]),threads:[...threads],processes:[...processes]});
writeFileSync(`${dir}/late-frames.csv`,['id,delayMs,callbackMs,msAfterChangedSetter,observerToRequestMs,mainTraceOccupiedMs,recordedLongTasks',...late.map(f=>[f.id,f.delay,f.duration,f.msAfterWrite,f.requestToObserver,f.mainTraceUnionMs,f.requestLongTasks.length].join(','))].join('\n'));
console.log(JSON.stringify({frames:summary.frames,delay:summary.requestDelay,callback:summary.callback,late:summary.late,changedWrites:summary.changedWrites,setterTotal:summary.setterTotal,changedCallbackTotal:summary.changedCallbackTotal,traceEvents:eventCount,markerOffsetSpreadMs:summary.trace.markerOffsetSpreadMs,host:summary.host,lateFrames:late.map(({id,delay,duration,msAfterWrite,requestToObserver,mainTraceUnionMs,mainTrace,otherTrace})=>({id,delay,duration,msAfterWrite,requestToObserver,mainTraceUnionMs,mainTop:mainTrace.slice(0,5),otherTop:otherTrace.slice(0,3)}))},null,2));
