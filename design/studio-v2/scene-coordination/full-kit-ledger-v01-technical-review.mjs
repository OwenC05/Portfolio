// Independent, read-only source audit. Writes only its adjacent review evidence JSON.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = path.resolve(here, '../asset-pipeline/full-kit');
const read = name => JSON.parse(fs.readFileSync(path.join(kit, name), 'utf8').replace(/^\uFEFF/, ''));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const ledger = read('export-ledger-v01.json');
const inventory = read('asset-inventory.json');
const profile = read('full-kit-profile-v1.json');
const bytes = fs.readFileSync(path.join(kit, 'exports/studio-full-kit-m2-proposal-v03.glb'));
const jsonLength = bytes.readUInt32LE(12);
const rawJson = bytes.subarray(20, 20 + jsonLength);
const gltf = JSON.parse(rawJson);
const binary = bytes.subarray(28 + jsonLength);
const failures = [];
const check = (condition, detail) => { if (!condition) failures.push(detail); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const metrics = ['nodeInstances', 'mainCalls', 'shadowCalls', 'refreshCalls', 'uniqueTriangles', 'placedTriangles', 'mainTriangles', 'shadowTriangles', 'refreshTriangles'];
const sum = (rows, key) => rows.reduce((n, r) => n + r[key], 0);
const aggregate = rows => Object.fromEntries(metrics.map(k => [k, sum(rows, k)]));
const rows = ledger.rows;
const inputHashes = Object.fromEntries(Object.entries(ledger.inputs).map(([name, expected]) => {
  const file = name === 'full-kit-budget-technical-review.json' ? path.join(here, name) : path.join(kit, name);
  const actual = sha(file); check(actual === expected, `input hash ${name}`);
  return [name, { expected, actual }];
}));
check(sha(path.join(kit, 'export-ledger-v01.json')) === '26b4c143f64f6880f012c316e81f124fe899b69312b61866531e6bf884320775', 'requested ledger hash');
const ids = inventory.assets.map(a => a.id).sort();
check(equal([...new Set(rows.map(r => r.assetId))].sort(), ids), 'all 59 inventory IDs');
check(new Set(rows.map(r => r.leaf)).size === rows.length, 'unique leaf names');
const reserved = [...profile.bindings.surfaces, ...profile.bindings.borders, profile.bindings.decorative, profile.bindings.dusk];
for (const r of rows) {
  const p = r.alphaMode === 'BLEND' && r.doubleSided ? 2 : 1;
  const s = Number(r.castShadow), n = r.nodeInstances, t = r.placedTriangles;
  const calc = { effectiveMainPasses: p, mainCalls: n * p, shadowCalls: n * s, refreshCalls: n * (p + s), mainTriangles: t * p, shadowTriangles: t * s, refreshTriangles: t * (p + s) };
  for (const [k, v] of Object.entries(calc)) check(r[k] === v, `${r.leaf}: ${k}`);
  check(n === 1, `${r.leaf}: one instance per listed leaf`);
  check(inventory.assets.find(a => a.id === r.assetId)?.stage === r.stage, `${r.leaf}: stage`);
  check(reserved.includes(r.leaf) || r.leaf.startsWith(r.assetId + '__'), `${r.leaf}: naming`);
  check(profile.materials.names.includes(r.material), `${r.leaf}: allowed material`);
  check((r.alphaMode === 'BLEND') === profile.materials.blendNames.includes(r.material), `${r.leaf}: alpha/material`);
  if (r.alphaMode === 'BLEND') check(!r.castShadow && !r.receiveShadow && r.role === 'transparent', `${r.leaf}: blend flags`);
}
const stageRecomputed = Object.fromEntries(Object.keys(ledger.stageTotals).map(stage => [stage, aggregate(rows.filter(r => r.stage === stage))]));
for (const [stage, values] of Object.entries(stageRecomputed)) for (const k of metrics) check(values[k] === ledger.stageTotals[stage][k], `${stage}: aggregate ${k}`);
for (const a of ledger.perAsset) for (const k of ['mainCalls', 'shadowCalls', 'refreshCalls', 'uniqueTriangles', 'placedTriangles', 'refreshTriangles']) check(a[k] === sum(rows.filter(r => r.assetId === a.assetId), k), `${a.assetId}: aggregate ${k}`);
const wholeRecomputed = aggregate(rows);
for (const k of metrics) check(wholeRecomputed[k] === ledger.wholeRoom.forecast[k], `whole: ${k}`);
for (const family of ledger.linkedFamilies) {
  const rr = rows.filter(r => r.assetId === family.assetId);
  check(equal(rr.map(r => r.leaf).sort(), [...family.finalLeaves].sort()), `${family.assetId}: family leaves`);
  for (const [k, rkey] of [['finalUnique', 'uniqueTriangles'], ['finalPlaced', 'placedTriangles'], ['finalMainCalls', 'mainCalls']]) check(family[k] === sum(rr, rkey), `${family.assetId}: family ${k}`);
}
const nodes = new Map(gltf.nodes.map(n => [n.name, n]));
const seenMeshes = new Set();
for (const r of rows.filter(r => r.status === 'exported')) {
  const n = nodes.get(r.leaf), primitive = gltf.meshes[n.mesh].primitives[0], material = gltf.materials[primitive.material];
  const triangles = gltf.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3;
  const actual = { assetId: n.extras.assetId, material: material.name, alphaMode: material.alphaMode ?? 'OPAQUE', doubleSided: material.doubleSided ?? false, castShadow: !n.extras.nocast, receiveShadow: n.extras.receiveShadow, placedTriangles: triangles, uniqueTriangles: seenMeshes.has(n.mesh) ? 0 : triangles, role: n.extras.role };
  seenMeshes.add(n.mesh);
  for (const [k, v] of Object.entries(actual)) check(r[k] === v, `${r.leaf}: actual v03 ${k}`);
}
check(equal(reserved.sort(), rows.filter(r => reserved.includes(r.leaf)).map(r => r.leaf).sort()), 'reserved bindings preserved');
const actualReplaced = gltf.nodes.filter(n => n.mesh !== undefined && (n.name.includes('__proxy') || n.extras.assetId === 'contact_decals')).map(n => n.name).sort();
check(equal(actualReplaced, ledger.replacedProxyAndProvisionalLeaves.map(r => r.leaf).sort()), '54 proxy/provisional replacements');
for (const r of ledger.replacedProxyAndProvisionalLeaves) for (const name of [r.replacedBy].flat()) check(rows.some(x => x.leaf === name && x.assetId === r.assetId), `replacement ${r.leaf} -> ${name}`);
const imageViews = new Set(gltf.images.map(i => i.bufferView));
const geometry = Buffer.concat(gltf.bufferViews.filter((v, i) => !imageViews.has(i)).map(v => binary.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength)));
const compressionBasis = { raw: geometry.length, gzip: zlib.gzipSync(geometry).length, brotli: zlib.brotliCompressSync(geometry).length, jsonGzip: zlib.gzipSync(rawJson).length, jsonBrotli: zlib.brotliCompressSync(rawJson).length, node: process.version, zlib: process.versions.zlib };
const uniqueCurrent = gltf.meshes.reduce((v, m) => { const p = m.primitives[0]; return v + gltf.accessors[p.indices ?? p.attributes.POSITION].count / 3; }, 0);
check(Math.round(compressionBasis.gzip / uniqueCurrent * wholeRecomputed.uniqueTriangles) === ledger.bytes.geometryGzip, 'geometry gzip forecast reproduces basis');
check(Math.round(compressionBasis.brotli / uniqueCurrent * wholeRecomputed.uniqueTriangles) === ledger.bytes.geometryBrotli, 'geometry Brotli forecast reproduces basis');
const stageCeilingSums = Object.fromEntries(['main', 'refresh', 'placed'].map(k => [k, Object.values(ledger.stageTotals).reduce((n, s) => n + s.proposedDesignCeiling[k], 0)]));
const gzipUpperSensitivity = Object.fromEntries([['A', 414195], ['B', 169000]].map(([option, images]) => {
  const asset = Math.round(ledger.bytes.geometryGzip * 1.15 + ledger.bytes.jsonGzipApprox + images);
  return [option, { assetEstimate: asset, remainingForSceneJs: 1500000 - asset }];
}));
const report = {
  scope: 'Static independent ledger audit only; planned geometry is not a validated export or measured performance.',
  reviewedAt: new Date().toISOString(),
  sourceHashes: Object.fromEntries(['export-ledger-v01.json', 'budget-addendum-v01.md', 'm2-material-repair-report.md', 'technical/profile-core.mjs'].map(name => [name, sha(path.join(kit, name))])),
  inputHashes, arithmeticAndIdentityFailures: failures, rowCount: rows.length, inventoryIds: ids,
  statusCounts: Object.fromEntries([...new Set(rows.map(r => r.status))].map(s => [s, rows.filter(r => r.status === s).length])),
  stageRecomputed, wholeRecomputed, replacedLeafCount: actualReplaced.length, stageCeilingSums,
  proposedReserveNotApproved: ledger.wholeRoom.contingencyHeldByRoot,
  additiveStageCeilingsAndReserveCalls: stageCeilingSums.refresh + 20,
  compressionBasis, gzipUpperSensitivity,
  corrections: {
    reserveOwnership: '20 calls / 25000 triangles are author proposals, not an accepted root reserve.',
    reserveSharing: '148 stage refresh ceilings + 20 separately additive reserve = 168, above proposed 165; adoption must define shared headroom or revise ceilings.',
    optionalConsolidationR1: '26 main-call reductions plus 3 caster reductions = 29 refresh-call reduction, not 26; no reduction included in base forecast.',
    duplicationNotes: { drumPads: { stated: 1600, ledgerUniqueMinusInventoryUnique: 2400 }, wallTriangles: { stated: 560, ledgerUniqueMinusInventoryUnique: 880 } },
    rawPayloadLanguage: 'Geometry/flags and image bytes retained across v02/v03; lib_glow material definition differs, so full retained representation is not byte-identical.',
    compressionLanguage: 'Image 1:1 transfer treatment is an approximation; complete export/delivery recompression remains required.'
  },
  finalGeometryUnknown: true, productionSceneJsUnknown: true, finalGatePassClaim: false
};
fs.writeFileSync(path.join(here, 'full-kit-ledger-v01-technical-review.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ failures, rowCount: rows.length, wholeRecomputed, stageCeilingSums, compressionBasis, gzipUpperSensitivity }));
if (failures.length) process.exitCode = 1;
