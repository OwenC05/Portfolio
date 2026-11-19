// S assembly evidence, separate from root's independent technical/art acceptance.
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
const here = new URL('./', import.meta.url), kit = new URL('../asset-pipeline/full-kit/', here);
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = name => fs.readFileSync(new URL(name, kit));
const pinned = (name, expected) => { const b = read(name); if (sha(b) !== expected) throw Error('Input hash: ' + name); return b; };
const candidate = pinned('exports/studio-full-kit-m4-proposal-v02.glb', 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f');
const parent = pinned('exports/studio-full-kit-m3-proposal-v03.glb', 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf');
const raw = pinned('exports/studio-full-kit-m4-proposal-v01.raw-export.glb', 'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906');
const ledger = JSON.parse(pinned('export-ledger-v01.json', '26b4c143f64f6880f012c316e81f124fe899b69312b61866531e6bf884320775'));
const inventory = JSON.parse(pinned('asset-inventory.json', 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87'));
const mappingBytes = fs.readFileSync(new URL('m4-model-contract.json', here));
if (sha(mappingBytes) !== '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98') throw Error('Mapping hash');
const mapping = JSON.parse(mappingBytes);
const split = b => { const length = b.readUInt32LE(12); return {doc:JSON.parse(b.subarray(20, 20 + length)), start:28 + length, rawJson:b.subarray(20, 20 + length)}; };
const c = split(candidate), p = split(parent), r = split(raw);
const failures = [], check = (ok, label) => { if (!ok) failures.push(label); };
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const delta = [];
for (let i = 0; i < raw.length; i++) if (raw[i] !== candidate[i]) delta.push(i);
check(raw.length === candidate.length && equal(delta, [662880,663352,663484]), 'exact three individually changed bytes');
check(candidate.subarray(0,c.start).equals(raw.subarray(0,r.start)), 'complete raw header/JSON preserved');
const nodeMap = doc => new Map(doc.nodes.map(n => [n.name,n]));
const cn = nodeMap(c.doc), pn = nodeMap(p.doc);
check(cn.size === c.doc.nodes.length && pn.size === p.doc.nodes.length, 'unique node names');
const added = [...cn.keys()].filter(name => !pn.has(name)).sort();
const removed = [...pn.keys()].filter(name => !cn.has(name)).sort();
const m4RowNames = ledger.rows.filter(row => row.stage === 'M4').map(row => row.leaf).sort();
check(equal(added,m4RowNames), 'exact 18 M4 leaves added');
check(equal(removed,mapping.retiredParentLeaves.map(row=>row.name).sort()), 'exact 23 M4 proxies removed');
function accessorBytes(doc, bytes, start, index) {
  const a = doc.accessors[index], view = doc.bufferViews[a.bufferView];
  const size = ({5121:1,5123:2,5125:4,5126:4})[a.componentType];
  const width = ({SCALAR:1,VEC2:2,VEC3:3,VEC4:4})[a.type];
  if (!size || !width || a.sparse) throw Error('Unsupported accessor layout');
  const length = size*width, offset = start+(view.byteOffset??0)+(a.byteOffset??0);
  return Buffer.concat(Array.from({length:a.count}, (_,i)=>bytes.subarray(offset+i*(view.byteStride??length),offset+i*(view.byteStride??length)+length)));
}
let retainedLeaves = 0, retainedAccessors = 0;
for (const [name,before] of pn) {
  const after = cn.get(name);
  if (!after || before.mesh === undefined) continue;
  retainedLeaves++;
  const omitMesh = n => Object.fromEntries(Object.entries(n).filter(([key])=>key!=='mesh'));
  check(equal(omitMesh(before),omitMesh(after)), name+' retained transform/flags');
  const bm = p.doc.meshes[before.mesh], am = c.doc.meshes[after.mesh];
  check(bm.name === am.name && bm.primitives.length === 1 && am.primitives.length === 1, name+' retained primitive/name');
  const bp = bm.primitives[0], ap = am.primitives[0];
  check(equal(p.doc.materials[bp.material],c.doc.materials[ap.material]),name+' retained material');
  check(equal(Object.keys(bp.attributes).sort(),Object.keys(ap.attributes).sort()),name+' retained attribute names');
  for (const key of [...Object.keys(bp.attributes),'indices']) {
    const bi = key==='indices'?bp.indices:bp.attributes[key], ai = key==='indices'?ap.indices:ap.attributes[key];
    check(accessorBytes(p.doc,parent,p.start,bi).equals(accessorBytes(c.doc,candidate,c.start,ai)),name+' retained '+key);
    retainedAccessors++;
  }
}
check(retainedLeaves === 92 && retainedAccessors === 368,'retained comparison counts');
const seen = new Set();
const rows = c.doc.nodes.filter(n=>n.mesh!==undefined).map(n=>{
  const mesh = c.doc.meshes[n.mesh]; check(mesh.primitives.length===1,n.name+' single primitive');
  const primitive = mesh.primitives[0], material = c.doc.materials[primitive.material];
  const triangles = c.doc.accessors[primitive.indices??primitive.attributes.POSITION].count/3;
  const alphaMode = material.alphaMode??'OPAQUE', doubleSided = material.doubleSided??false;
  const main = alphaMode==='BLEND' && doubleSided?2:1, shadow = Number(!n.extras.nocast);
  const row = {leaf:n.name,assetId:n.extras.assetId,stage:inventory.assets.find(a=>a.id===n.extras.assetId)?.stage,
    material:material.name,alphaMode,doubleSided,castShadow:!!shadow,receiveShadow:n.extras.receiveShadow,role:n.extras.role,
    nodeInstances:1,mainCalls:main,shadowCalls:shadow,refreshCalls:main+shadow,uniqueTriangles:seen.has(n.mesh)?0:triangles,
    placedTriangles:triangles,mainTriangles:triangles*main,shadowTriangles:triangles*shadow,refreshTriangles:triangles*(main+shadow)};
  seen.add(n.mesh); return row;
});
const metrics = ['nodeInstances','mainCalls','shadowCalls','refreshCalls','uniqueTriangles','placedTriangles','mainTriangles','shadowTriangles','refreshTriangles'];
const sum = items => Object.fromEntries(metrics.map(key=>[key,items.reduce((s,row)=>s+row[key],0)]));
const m3 = rows.filter(row=>row.stage==='M3'), m4 = rows.filter(row=>row.stage==='M4');
for (const row of [...m3,...m4]) {
  const planned = ledger.rows.find(p=>p.leaf===row.leaf);
  check(!!planned,row.leaf+' ledger row exists');
  if (!planned) continue;
  for (const key of ['assetId','material','alphaMode','doubleSided','castShadow','receiveShadow','role','mainCalls','shadowCalls','refreshCalls']) check(row[key]===planned[key],row.leaf+' ledger '+key);
  check(row.placedTriangles<=planned.placedTriangles && row.uniqueTriangles===row.placedTriangles,row.leaf+' triangle ceiling/unique mesh');
}
check(m3.length===9 && equal(m4.map(r=>r.leaf).sort(),m4RowNames),'completed M3/M4 row sets');
const m4Totals=sum(m4), current=sum(rows);
check(m4Totals.mainCalls<=20 && m4Totals.refreshCalls<=30 && m4Totals.placedTriangles<=22500,'M4 outer stage caps');
check(current.mainCalls<=120 && current.refreshCalls<=165 && current.refreshTriangles<=140000,'current weighted design caps');
// The original ledger contains planned M3 AND M4. Replace both by actual rows.
const completedRows = [...m3,...m4];
const forecastRows = ledger.rows.map(row=>completedRows.find(actual=>actual.leaf===row.leaf)??row);
const forecast=sum(forecastRows);
check(forecast.mainCalls<=120 && forecast.refreshCalls<=165 && forecast.refreshTriangles<=140000,'full-room weighted design forecast');
const inventoryIds=inventory.assets.map(a=>a.id).sort(), ids=[...new Set(rows.map(row=>row.assetId))].sort();
const parentIds=[...new Set(p.doc.nodes.filter(n=>n.mesh!==undefined).map(n=>n.extras.assetId))].sort();
const absentIds=inventoryIds.filter(id=>!ids.includes(id));
check(equal(ids,[...parentIds,'music_cables'].sort()),'only music_cables extends current ID coverage');
check(equal(absentIds,['wall_cable_run']),'only future M5 wall cable ID absent');
check(equal([...new Set(forecastRows.map(r=>r.assetId))].sort(),inventoryIds),'all 59 IDs in full-room forecast');
const proxies=rows.filter(row=>row.leaf.includes('__proxy')), contacts=rows.filter(row=>row.assetId==='contact_decals');
check(rows.length===110 && ids.length===58 && proxies.length===17 && contacts.length===3,'current inventory/proxy counts');
const imageViews=new Set(c.doc.images.map(image=>image.bufferView));
const geometry=Buffer.concat(c.doc.bufferViews.filter((v,i)=>!imageViews.has(i)).map(v=>candidate.subarray(c.start+(v.byteOffset??0),c.start+(v.byteOffset??0)+v.byteLength)));
const imageBytes=c.doc.images.reduce((n,image)=>n+c.doc.bufferViews[image.bufferView].byteLength,0);
const compression=b=>({raw:b.length,gzip:zlib.gzipSync(b).length,brotli:zlib.brotliCompressSync(b).length});
const measured={candidate:compression(candidate),parent:compression(parent),geometry:compression(geometry),json:compression(c.rawJson),imageEncodedBytes:imageBytes,node:process.version,zlib:process.versions.zlib};
const hostedBytes=fs.readFileSync(new URL('production-static-js-budget-20261115.json',here)),hosted=JSON.parse(hostedBytes);
const gzipPerTriangle=measured.geometry.gzip/current.uniqueTriangles, brotliPerTriangle=measured.geometry.brotli/current.uniqueTriangles;
const futureImages=ledger.bytes.images.optionA_keepPilotPngs_addPlanned.total-ledger.bytes.images.current.total;
const options={};
for (const [name,images] of [['A_current_images',imageBytes+futureImages],['B_conditional_T1',ledger.bytes.images.optionB_recommended_libraryImagesReplacePilot.total]]) {
  const geometryGzip=Math.round(gzipPerTriangle*forecast.uniqueTriangles),geometryBrotli=Math.round(brotliPerTriangle*forecast.uniqueTriangles);
  const jsonGzip=Math.max(ledger.bytes.jsonGzipApprox,measured.json.gzip),jsonBrotli=Math.max(ledger.bytes.jsonBrotliApprox,measured.json.brotli);
  const assetGzip=geometryGzip+jsonGzip+images,assetBrotli=geometryBrotli+jsonBrotli+images;
  options[name]={geometryGzip,geometryBrotli,jsonGzip,jsonBrotli,images,assetGzip,assetBrotli,
    assetPlusHostedJsGzip:assetGzip+hosted.totals.gzipBytes,assetPlusHostedJsBrotli:assetBrotli+hosted.totals.brotliBytes,
    geometryPlus15PercentGzipWithHostedJs:Math.round(geometryGzip*1.15)+jsonGzip+images+hosted.totals.gzipBytes};
}
const report={scope:'S writer/assembly evidence; not independent approval, rendered draw measurement or final transfer proof.',failures,
  inputs:{candidate:sha(candidate),parent:sha(parent),raw:sha(raw),mapping:sha(mappingBytes),ledger:sha(read('export-ledger-v01.json')),hostedJsReceipt:sha(hostedBytes),auditScript:sha(fs.readFileSync(new URL(import.meta.url)))},
  exactRawDelta:{changedByteOffsets:delta,addressedWordSlots:3,addressedByteSlots:12,actuallyChangedBytes:delta.length,headerJsonPreserved:true},
  retainedParentEquality:{leaves:retainedLeaves,accessors:retainedAccessors,failures:failures.filter(f=>f.includes('retained'))},
  m4Rows:m4,m4Totals,preservedM3Rows:m3,preservedM3Totals:sum(m3),currentCompleteExport:current,fullRoomUpdatedForecast:forecast,
  reserve:{refreshedTriangleDelta:forecast.refreshTriangles-ledger.wholeRoom.forecast.refreshTriangles,
    positiveTriangleReserveConsumed:Math.max(0,forecast.refreshTriangles-ledger.wholeRoom.forecast.refreshTriangles),rootCallReserveConsumed:0,
    basis:'107 frozen ledger rows; M3/M4 actual replacements. No other row budgets changed. 148 stage refresh ceilings plus17 root reserve;120main/140000weighted caps remain.'},
  inventory:{currentlyRepresentedIds:ids.length,fullInventoryIds:inventoryIds.length,forecastIds:59,absentFutureIds:absentIds,proxyCount:proxies.length,proxies:proxies.map(r=>r.leaf),provisionalContacts:contacts.map(r=>r.leaf)},
  compression:measured,transferForecast:{method:'Same component-density method as M3, refreshed from actual M4 geometry. Both M3/M4 actual unique counts replace ledger ceilings; image bytes approximated1:1. +15percent is sensitivity, not measured bound.',gzipBytesPerUniqueTriangle:gzipPerTriangle,brotliBytesPerUniqueTriangle:brotliPerTriangle,options,hostedJs:hosted.totals,
    limitations:'Future geometry/texture density, route-specific JS and final production chunks remain unknown. T1 is not implemented; conditional savings are not credited. Whole-file compression differs from component sums.'},
  remaining:'Root independent restorer/output review; author frozen-blend G2-G5 evidence; root actual runtime captures; independent Claude art critique; M5/M6, integration and final budgets.'};
fs.writeFileSync(new URL('m4-v02-assembled-audit.json',here),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({failures,m4Totals,current,forecast,retainedLeaves,retainedAccessors,compression:measured,options}));
if(failures.length) process.exitCode=1;
