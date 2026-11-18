// Preparation-package verification only. This does not parse or certify a robot GLB.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const here = path.dirname(fileURLToPath(import.meta.url));
const sha = b => createHash('sha256').update(b).digest('hex');
const readJson = name => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const failures = [], warnings = [], checks = [];
function check(name, fn) {
  try { fn(); checks.push(name); } catch (error) { failures.push({ name, error: error.message }); }
}
for (const name of fs.readdirSync(here).filter(name => name.endsWith('.json') && name !== 'validation.json')) {
  check(`JSON parse: ${name}`, () => readJson(name));
}
const profile = readJson('profile.example.json');
const manifest = readJson('manifest.example.json');
const snapshot = readJson('evidence-snapshot.json');
check('Examples cannot claim production acceptance', () => {
  assert.equal(profile.productionReady, false);
  assert.equal(manifest.productionReady, false);
  assert.equal(manifest.status, 'template-not-exported');
  assert.equal(manifest.provider.status, 'not-submitted');
  assert.equal(profile.allocation.approved, false);
  assert.equal(profile.roomProfile.modify, false);
  assert.equal(manifest.profile.id, profile.profileId);
  assert.ok(Object.values(manifest.files).every(value => value === null));
  assert.equal(profile.coordinates.placement.anchorWorld, null);
  assert.equal(profile.runtime.marks.overflowPolicy, null);
});
check('Neutral variant and dynamic marks agree', () => {
  assert.equal(profile.format.animations, false);
  assert.equal(profile.format.skins, false);
  assert.equal(profile.format.morphs, false);
  assert.deepEqual(manifest.clips, []);
  assert.deepEqual(profile.format.compressionDecoders, []);
  assert.equal(profile.runtime.marks.baked, false);
  assert.equal(profile.runtime.marks.min, 0);
  assert.equal(profile.runtime.marks.max, 4);
});
check('Coordinate basis and one-time metre scale', () => {
  const C = profile.coordinates.blenderToGltf;
  const map = v => C.map(row => row.reduce((sum, n, i) => sum + n * v[i], 0));
  assert.deepEqual(map([1,0,0]), [1,0,0]);
  assert.deepEqual(map([0,1,0]), [0,0,-1]);
  assert.deepEqual(map([0,0,1]), [0,1,0]);
  assert.deepEqual(map([2,3,4]), [2,4,-3]);
  assert.equal(profile.coordinates.placement.worldUnitsPerMetre, 2);
  assert.equal(profile.coordinates.placement.applications, 1);
  assert.equal(profile.coordinates.placement.addRoomFloorOffset, false);
});
check('Hard gates and all quoted forecast arithmetic', () => {
  assert.deepEqual(profile.wholeSceneHardGates, { encodedSceneJsAndAssetsBytes:1500000, peakCalls:200, peakRenderedTriangles:200000, shadowLights:1 });
  assert.deepEqual(snapshot.arithmetic, {
    pointForecast:1462612, pointMargin:37388, sensitivityForecast:1559302,
    sensitivityMargin:-59302, conditionalAssetTarget:1070000,
    assetPointOverTarget:1278, designMainMargin:9, designRefreshMargin:24,
    designWeightedTriangleMargin:54212, planningMarginsAreAllocation:false
  });
  assert.equal(644603 + 12531 + 414144 + 391334, 1462612);
  assert.equal(Math.round(644603 * 1.15) + 12531 + 414144 + 391334, 1559302);
  assert.equal(snapshot.priorReceiptNotNewMeasurement.transfer.assetPlusHostedJsGzip, 1462612);
  assert.equal(snapshot.priorReceiptNotNewMeasurement.transfer.geometryPlus15PercentGzipWithHostedJs, 1559302);
});
const sourceFreshness = [];
for (const entry of snapshot.files) {
  check(`Source exists: ${entry.root}/${entry.path}`, () => {
    const absolute = path.join(snapshot.roots[entry.root], entry.path);
    const bytes = fs.readFileSync(absolute);
    const current = sha(bytes);
    const equal = current === entry.sha256 && bytes.length === entry.bytes;
    sourceFreshness.push({ root: entry.root, path: entry.path, sameAsSnapshot: equal, currentSha256: current });
    if (!equal) warnings.push(`Shared source changed after dated snapshot: ${entry.root}/${entry.path}; re-pin before production.`);
  });
}
check('Exact staged room candidate hash matches independent receipt', () => {
  const entry = snapshot.files.find(x => x.path.endsWith('studio-full-kit-m4-proposal-v02.glb'));
  assert.equal(entry.sha256, 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f');
  assert.equal(entry.bytes, 2206200);
});
let localLinkCount = 0;
for (const name of fs.readdirSync(here).filter(name => name.endsWith('.md'))) {
  check(`Local Markdown links: ${name}`, () => {
    const text = fs.readFileSync(path.join(here, name), 'utf8');
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].replace(/^<|>$/g, '').split('#')[0];
      if (!target || /^https?:\/\//.test(target)) continue;
      assert.ok(fs.existsSync(path.resolve(here, decodeURIComponent(target))), `${name}: ${target}`);
      localLinkCount++;
    }
  });
}
const artifacts = fs.readdirSync(here).filter(name => name !== 'validation.json').map(name => {
  const bytes = fs.readFileSync(path.join(here, name));
  return { path: name, bytes: bytes.length, sha256: sha(bytes) };
});
const result = {
  checkedAt: new Date().toISOString(), command:'node design/assistant/robot/asset-pipeline/verify-package.mjs',
  node: process.version, scope:'JSON/examples/local links/source freshness/coordinate probes/arithmetic only; no app tests, build, render or GLB acceptance.',
  passed:failures.length === 0, checks, failures, warnings, localLinkCount,
  sourceFreshness, artifacts,
  remaining:'A repair/profile freeze; Studio owner integrated baseline/allocation; isolated authoring slot; paid request authority; future robot validator/loader and actual browser/visual acceptance.'
};
fs.writeFileSync(path.join(here, 'validation.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ passed:result.passed, checks:checks.length, failures, warnings, localLinkCount, sourceFiles:sourceFreshness.length }, null, 2));
process.exitCode = result.passed ? 0 : 1;
