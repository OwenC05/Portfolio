// S's assembled technical evidence. Restorer writer; independent approval remains root-owned.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const kit = path.resolve(here, '../asset-pipeline/full-kit');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = name => fs.readFileSync(path.join(kit, name));
const json = name => JSON.parse(read(name));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pinned = (name, hash) => { const b = read(name); if (sha(b) !== hash) throw Error('Input hash: ' + name); return b; };
const candidate = pinned('exports/studio-full-kit-m3-proposal-v03.glb', 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf');
const parent = pinned('exports/studio-full-kit-m2-proposal-v05.glb', '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735');
const raw = pinned('exports/studio-full-kit-m3-proposal-v02.raw-export.glb', '71b39b5c242278408092d3ee95ab4e996df47014eb30ef57383b88f3e526fd18');
const ledger = JSON.parse(pinned('export-ledger-v01.json', '26b4c143f64f6880f012c316e81f124fe899b69312b61866531e6bf884320775'));
const inventory = json('asset-inventory.json');
const split = b => { const jlen = b.readUInt32LE(12); return { doc: JSON.parse(b.subarray(20, 20 + jlen)), start: 28 + jlen, rawJson: b.subarray(20, 20 + jlen) }; };
const c = split(candidate), p = split(parent), r = split(raw);
const delta = [];
for (let i = 0; i < raw.length; i++) if (raw[i] !== candidate[i]) delta.push(i);
check(raw.length === candidate.length && equal(delta, [487532, 487544, 488016, 488148]), 'exact four individually changed bytes');
check(candidate.subarray(0, c.start).equals(raw.subarray(0, r.start)), 'raw header/JSON preserved');
const nodeMap = doc => new Map(doc.nodes.map(n => [n.name, n]));
const cn = nodeMap(c.doc), pn = nodeMap(p.doc);
const rowNames = ledger.rows.filter(x => x.stage === 'M3').map(x => x.leaf).sort();
const added = [...cn.keys()].filter(n => !pn.has(n)).sort();
const removed = [...pn.keys()].filter(n => !cn.has(n)).sort();
check(equal(added, rowNames) && removed.length === 11, 'exact M3 leaf substitution');
function accessorBytes(doc, bytes, start, index) {
  const a = doc.accessors[index], v = doc.bufferViews[a.bufferView];
  const size = ({5121:1,5123:2,5125:4,5126:4})[a.componentType];
  const width = ({SCALAR:1,VEC2:2,VEC3:3,VEC4:4})[a.type];
  if (!size || !width || a.sparse) throw Error('Unsupported accessor layout');
  const length = size * width, offset = start + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
  return Buffer.concat(Array.from({length:a.count}, (_, i) => bytes.subarray(offset + i * (v.byteStride ?? length), offset + i * (v.byteStride ?? length) + length)));
}
let retainedLeaves = 0, retainedAccessors = 0;
for (const [name, before] of pn) {
  const after = cn.get(name);
  if (!after || before.mesh === undefined) continue;
  retainedLeaves++;
  const noMesh = node => Object.fromEntries(Object.entries(node).filter(([k]) => k !== 'mesh'));
  check(equal(noMesh(before), noMesh(after)), name + ' retained transform/flags');
  const bm = p.doc.meshes[before.mesh], am = c.doc.meshes[after.mesh];
  check(bm.name === am.name && bm.primitives.length === 1 && am.primitives.length === 1, name + ' primitive/name');
  const bp = bm.primitives[0], ap = am.primitives[0];
  check(equal(p.doc.materials[bp.material], c.doc.materials[ap.material]), name + ' material definition');
  check(equal(Object.keys(bp.attributes).sort(), Object.keys(ap.attributes).sort()), name + ' attribute names');
  for (const key of [...Object.keys(bp.attributes), 'indices']) {
    const bi = key === 'indices' ? bp.indices : bp.attributes[key];
    const ai = key === 'indices' ? ap.indices : ap.attributes[key];
    check(accessorBytes(p.doc, parent, p.start, bi).equals(accessorBytes(c.doc, candidate, c.start, ai)), name + ' exact retained ' + key);
    retainedAccessors++;
  }
}
const seen = new Set();
const actualRows = c.doc.nodes.filter(n => n.mesh !== undefined).map(n => {
  const mesh = c.doc.meshes[n.mesh]; check(mesh.primitives.length === 1, n.name + ' single primitive');
  const primitive = mesh.primitives[0], material = c.doc.materials[primitive.material];
  const triangles = c.doc.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3;
  const alphaMode = material.alphaMode ?? 'OPAQUE', doubleSided = material.doubleSided ?? false;
  const main = alphaMode === 'BLEND' && doubleSided ? 2 : 1, shadow = Number(!n.extras.nocast);
  const row = { leaf:n.name, assetId:n.extras.assetId, stage:inventory.assets.find(a => a.id === n.extras.assetId)?.stage,
    material:material.name, alphaMode, doubleSided, castShadow:!!shadow, receiveShadow:n.extras.receiveShadow,
    role:n.extras.role, nodeInstances:1, mainCalls:main, shadowCalls:shadow, refreshCalls:main+shadow,
    uniqueTriangles:seen.has(n.mesh)?0:triangles, placedTriangles:triangles, mainTriangles:triangles*main,
    shadowTriangles:triangles*shadow, refreshTriangles:triangles*(main+shadow) };
  seen.add(n.mesh); return row;
});
const metrics = ['nodeInstances','mainCalls','shadowCalls','refreshCalls','uniqueTriangles','placedTriangles','mainTriangles','shadowTriangles','refreshTriangles'];
const sum = rows => Object.fromEntries(metrics.map(k => [k, rows.reduce((n,r) => n+r[k],0)]));
const m3 = actualRows.filter(row => row.stage === 'M3');
check(equal(m3.map(r=>r.leaf).sort(), rowNames), 'nine M3 rows without remaining M3 proxies');
for (const row of m3) {
  const planned = ledger.rows.find(r => r.leaf === row.leaf);
  for (const key of ['assetId','material','alphaMode','doubleSided','castShadow','receiveShadow','role','mainCalls','shadowCalls','refreshCalls'])
    check(row[key] === planned[key], row.leaf + ' ledger ' + key);
  check(row.placedTriangles <= planned.placedTriangles && row.uniqueTriangles === row.placedTriangles, row.leaf + ' triangle ceiling/unique mesh');
}
const m3Totals = sum(m3);
check(m3Totals.mainCalls <= 10 && m3Totals.refreshCalls <= 18 && m3Totals.placedTriangles <= 15500, 'M3 outer stage limits');
const frost = cn.get('kb_case__frost_shell').extras;
check(frost.transparent === true && frost.occluder === false && frost.nocast === true && frost.receiveShadow === false && frost.renderOrder === 1.5, 'frost flags and sort order');
const forecastRows = ledger.rows.map(row => m3.find(actual => actual.leaf === row.leaf) ?? row);
const forecast = sum(forecastRows);
check(forecast.mainCalls <= 120 && forecast.refreshCalls <= 165 && forecast.refreshTriangles <= 140000, 'weighted design forecast');
const ids = [...new Set(actualRows.map(r=>r.assetId))].sort();
const parentIds = [...new Set(p.doc.nodes.filter(n=>n.mesh!==undefined).map(n=>n.extras.assetId))].sort();
const inventoryIds = inventory.assets.map(a=>a.id).sort();
const absentIds = inventoryIds.filter(id=>!ids.includes(id));
check(equal(ids,parentIds), 'same current inventory coverage as accepted parent');
check(equal([...new Set(forecastRows.map(r=>r.assetId))].sort(),inventoryIds), 'all59 IDs represented in full-room forecast');
check(absentIds.every(id=>['M4','M5'].includes(inventory.assets.find(a=>a.id===id).stage)), 'no missing current-stage asset ID');
const proxies = actualRows.filter(r=>r.leaf.includes('__proxy'));
const provisional = actualRows.filter(r=>r.assetId === 'contact_decals');
const imageViews = new Set(c.doc.images.map(image=>image.bufferView));
const geometry = Buffer.concat(c.doc.bufferViews.filter((v,i)=>!imageViews.has(i)).map(v=>candidate.subarray(c.start+(v.byteOffset??0),c.start+(v.byteOffset??0)+v.byteLength)));
const imageBytes = c.doc.images.reduce((n,i)=>n+c.doc.bufferViews[i.bufferView].byteLength,0);
const compression = b => ({ raw:b.length, gzip:zlib.gzipSync(b).length, brotli:zlib.brotliCompressSync(b).length });
const measured = { candidate:compression(candidate), parent:compression(parent), geometry:compression(geometry), json:compression(c.rawJson), imageEncodedBytes:imageBytes, node:process.version, zlib:process.versions.zlib };
const hosted = JSON.parse(fs.readFileSync(path.join(here,'production-static-js-budget-20261115.json'),'utf8'));
const geomGzipPerTri = measured.geometry.gzip / sum(actualRows).uniqueTriangles;
const geomBrotliPerTri = measured.geometry.brotli / sum(actualRows).uniqueTriangles;
const futureImageAdditions = ledger.bytes.images.optionA_keepPilotPngs_addPlanned.total-ledger.bytes.images.current.total;
const options = {};
for (const [name,images] of [['A_current_images',imageBytes+futureImageAdditions],['B_conditional_T1',ledger.bytes.images.optionB_recommended_libraryImagesReplacePilot.total]]) {
  const geometryGzip = Math.round(geomGzipPerTri*forecast.uniqueTriangles);
  const geometryBrotli = Math.round(geomBrotliPerTri*forecast.uniqueTriangles);
  const jsonGzip = Math.max(ledger.bytes.jsonGzipApprox,measured.json.gzip);
  const jsonBrotli = Math.max(ledger.bytes.jsonBrotliApprox,measured.json.brotli);
  const assetGzip = geometryGzip+jsonGzip+images, assetBrotli = geometryBrotli+jsonBrotli+images;
  options[name] = {geometryGzip,geometryBrotli,jsonGzip,jsonBrotli,images,assetGzip,assetBrotli,
    assetPlusHostedJsGzip:assetGzip+hosted.totals.gzipBytes,
    assetPlusHostedJsBrotli:assetBrotli+hosted.totals.brotliBytes,
    geometryPlus15PercentGzipWithHostedJs:Math.round(geometryGzip*1.15)+jsonGzip+images+hosted.totals.gzipBytes};
}
const report = { scope:'S technical writer/assembly evidence, not independent approval, renderer capture or final transfer proof.', failures,
  inputs:{candidate:sha(candidate),parent:sha(parent),raw:sha(raw),ledger:sha(read('export-ledger-v01.json'))},
  exactRawDelta:{changedByteOffsets:delta,addressedWordSlots:4,addressedByteSlots:16,actuallyChangedBytes:delta.length,headerJsonPreserved:true},
  retainedParentEquality:{leaves:retainedLeaves,accessors:retainedAccessors,failures:failures.filter(f=>f.includes('retained'))},
  priorRawAudit:'m3-v02-raw-audit.json: direct raw hierarchy/material/texture/T2 checks; unchanged raw/output bytes preserve those results, four corrected UV slots now equal parent. Root independently rereviews actual output.',
  m3Rows:m3,m3Totals,currentCompleteExport:sum(actualRows),fullRoomUpdatedForecast:forecast,
  reserve:{refreshedTriangleDelta:forecast.refreshTriangles-ledger.wholeRoom.forecast.refreshTriangles,positiveTriangleReserveConsumed:Math.max(0,forecast.refreshTriangles-ledger.wholeRoom.forecast.refreshTriangles),rootCallReserveConsumed:0,stageSlackAndRootReserve:'148 stage ceilings plus17 root calls;120main and140000weighted caps remain separate'},
  inventory:{currentlyRepresentedIds:ids.length,fullInventoryIds:inventoryIds.length,forecastIds:59,absentFutureIds:absentIds,
    coverageSameAsAcceptedParent:true,proxyCount:proxies.length,proxies:proxies.map(r=>r.leaf),provisionalContacts:provisional.map(r=>r.leaf),
    auditCorrection:'Initial audit incorrectly required all59 IDs in this proposal; accepted parent and M3 both contain57. music_cables(M4) and wall_cable_run(M5) are still absent, explicitly represented in final ledger; final59-ID gate remains open. Initial failure receipt preserved.'},
  compression:measured,transferForecast:{method:'Same ledger per-unique-triangle extrapolation, refreshed from actual M3 geometry compression and updated unique count; images count1:1 approximately. +15% remains sensitivity, not a measured bound.',gzipBytesPerUniqueTriangle:geomGzipPerTri,brotliBytesPerUniqueTriangle:geomBrotliPerTri,options,hostedJs:hosted.totals,
    limitations:'Future geometry density/texture encoding and production route chunks unknown; T1 not implemented and no savings accepted. Whole-file recompression differs from component sums. Author delta-method forecast is a different approximation and mixes gzip level9 with original default-level ledger.'},
  remaining:'Independent Codex restorer/output approval; root actual-image capture; independent Claude gear/mouse/pitch/cymbal review; final room/runtime/global transfer gates.'};
fs.writeFileSync(path.join(here,'m3-v03-assembled-audit.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({failures,m3Totals,current:report.currentCompleteExport,forecast,proxies:proxies.length,compression:measured,options}));
if(failures.length) process.exitCode=1;
