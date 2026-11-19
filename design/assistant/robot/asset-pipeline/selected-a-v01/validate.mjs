// Bounded preflight validation; no provider calls, app tests, or Blender execution.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const p = read('profile.example.json'), r = read('request.example.json'), e = read('evidence.json');
const verifiedPins = e.files.map(pin => {
  const bytes = fs.readFileSync(path.isAbsolute(pin.path) ? pin.path : path.join(repo, pin.path));
  assert.equal(bytes.length, pin.bytes, pin.path);
  assert.equal(sha(bytes), pin.sha256, pin.path);
  return pin.path;
});
for (const pin of Object.values(p.sourcePins)) {
  assert.deepEqual(pin, e.files.find(item => item.path === pin.path));
}
assert.deepEqual(r.input.sha256, p.sourcePins.canonicalImage.sha256);
assert.equal(r.quote.apiCreditsPerCandidate, 5);
assert.equal(r.quote.candidateLimit, 1);
assert.equal(r.quote.automaticCreateRetries, 0);
assert.equal(r.submitted, false);
assert.equal(r.quote.liveAccountBalance, null);
assert.equal(p.productionReady, false);
assert.equal(p.allocation.approved, false);
assert.ok(Object.values(p.productionMeasurements).every(value => value === null));
assert.ok(Object.entries(p.allocation).every(([key, value]) => key === 'approved' || value === null));
assert.equal(p.bindings.length, 22);
const names = new Set(p.bindings.map(node => node.name));
assert.equal(names.size, p.bindings.length);
assert.equal(p.bindings.filter(node => node.parent === null).length, 1);
assert.deepEqual(p.requiredMovingNodes, p.bindings.filter(node => node.moving).map(node => node.name));
assert.equal(p.requiredMovingNodes.length, 10);
for (const node of p.bindings) {
  assert.ok(node.name.startsWith('APA_') && !/upper|card|fin/.test(node.name));
  for (const material of node.materialRoles) assert.ok(p.materials.roles[material]);
  const seen = new Set([node.name]);
  let current = node;
  while (current.parent !== null) {
    assert.ok(names.has(current.parent));
    assert.ok(!seen.has(current.parent));
    seen.add(current.parent);
    current = p.bindings.find(item => item.name === current.parent);
  }
}
for (const side of ['L', 'R']) {
  const highlight = p.bindings.find(node => node.name === 'APA_highlight_' + side);
  assert.equal(highlight.parent, 'APA_pupil_' + side);
  assert.equal(highlight.moving, false);
}
assert.deepEqual(p.coordinates.blenderToGltf, [[1, 0, 0], [0, 0, 1], [0, -1, 0]]);
assert.equal(p.coordinates.placement.applications, 1);
assert.equal(p.coordinates.placement.addRoomFloorOffset, false);
for (const key of ['animations', 'skins', 'morphs', 'textures', 'lights', 'cameras']) assert.equal(p.format[key], false);
assert.equal(p.runtime.marks.baked, false);
assert.equal(p.runtime.marks.max, 4);
assert.equal(p.runtime.textGenerationEnabled, false);
assert.equal(p.runtime.idleLoops, false);
const prepared = spawnSync(process.execPath, [path.join(here, 'prepare-request.mjs'), '--check'], { encoding: 'utf8', windowsHide: true });
assert.equal(prepared.status, 0, prepared.stderr);
const payload = JSON.parse(prepared.stdout);
assert.equal(payload.pixels, 1792 * 2240);
assert.equal(payload.base64Characters, 4 * Math.ceil(r.input.bytes / 3));
assert.equal(payload.wrotePayload, false);
const python = 'C:/Program Files/Blender Foundation/Blender 5.2/5.2/python/bin/python.exe';
const syntax = spawnSync(python, ['-c', 'import ast,pathlib,sys; ast.parse(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))', path.join(here, 'stage-cleanup.py')], { encoding: 'utf8', windowsHide: true });
assert.equal(syntax.status, 0, syntax.stderr);
const markdown = fs.readFileSync(path.join(here, 'preflight.md'), 'utf8');
const localLinks = [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]).filter(link => !link.startsWith('https:'));
for (const link of localLinks) if (link !== 'validation.json') assert.ok(fs.existsSync(path.resolve(here, link)), link);
const files = fs.readdirSync(here).filter(name => name !== 'validation.json' && fs.statSync(path.join(here, name)).isFile()).map(name => {
  const bytes = fs.readFileSync(path.join(here, name));
  return { path: name, bytes: bytes.length, sha256: sha(bytes) };
});
const result = { checkedAt: new Date().toISOString(), result: 'PASS-preflight-static-only', verifiedPins,
  checks: { jsonExamples: 3, proposedNodes: names.size, independentlyControlledNodes: p.requiredMovingNodes.length, parentsAcyclic: true, materialReferencesResolve: true, relativeLinksResolve: true, budgetsRemainUnallocated: true, historicalSourceHashesUnchanged: true, pythonAst: 'PASS-without-importing-bpy' },
  preparedPayload: payload, files, providerCreates: 0, blenderProcesses: 0, appTestsOrBuilds: 0,
  unresolved: ['Live Meshy connector schema/instructions and billing surface unavailable here', 'Current account balance unavailable', 'Raw candidate and cleanup execution pending', 'Final dimensions, pivots, pose limits, swept bounds, export bytes/topology and combined runtime allocation unmeasured'],
  reproduce: 'node design/assistant/robot/asset-pipeline/selected-a-v01/validate.mjs' };
fs.writeFileSync(path.join(here, 'validation.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ result: result.result, pinnedFiles: verifiedPins.length, nodes: names.size, movingNodes: p.requiredMovingNodes.length, inputSha256: r.input.sha256, rawPayloadBytes: payload.createRequestBytes, paidCalls: 0, blenderExecuted: false }, null, 2));
