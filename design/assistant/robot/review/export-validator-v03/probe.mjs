// Independent bounded review. Only this new review directory receives writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../../..');
const repaired = 'design/assistant/robot/asset-pipeline/validator-v03/';
const original = 'design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v02/';
const oldReview = 'design/assistant/robot/review/build-v02/technical/';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const read = (filename) => fs.readFileSync(path.join(root, filename));
const write = (filename, value) => fs.writeFileSync(path.join(here, filename), JSON.stringify(value, null, 2) + '\n');
const expected = {
  [repaired + 'validate_asset.mjs']: 'ba1990472d6697c3efc89b3930c37ba123313c4340ff2af9a0460ceb028e8e59',
  [repaired + 'validate_contract.mjs']: '7331dbc75d24aeae8553922f50a4ebcd31bd3ed945d3617bbfbb2422b5e32c8e',
  [repaired + 'verify.mjs']: '4e359632c83bc6699d0c485978c8af3afaf63cec5f6a122a6a0c3195abb4f430',
  [original + 'validate_asset.mjs']: 'dc1231aa8c824a184582a69fd6b7d7603c2de979ff5e05e6421a3e2ace5ea0ad',
  [original + 'validate_contract.mjs']: 'b65ea4dbf9dcd034791b53203d41c98de5d94abaccffef0fb0aca3e4b13b3a87',
  [original + 'selected-a.glb']: 'bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270',
  'public/studio/assistant-apprentice-v03.glb': '65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12',
};
for (const [filename, hash] of Object.entries(expected)) assert.equal(sha(read(filename)), hash, `STOP: unexpected source ${filename}`);
const inputs = ['validate_asset.mjs', 'validate_contract.mjs', 'selected-a.glb', 'selected-a.blend', 'profile.json', 'poses.json', 'build-summary.json', 'build_asset.py'];
const tracked = [...new Set([
  ...Object.keys(expected),
  ...inputs.map((name) => original + name),
  ...['manifest.json', 'validation.json', 'README.md'].map((name) => original + name),
  ...['repair-plan.md', 'README.md', 'before-checks.json', 'after-checks.json'].map((name) => repaired + name),
  ...['review.md', 'probe-validator.mjs', 'validator-probes.json'].map((name) => oldReview + name),
])];
const pins = () => tracked.map((filename) => { const bytes = read(filename); return { path: filename, bytes: bytes.length, sha256: sha(bytes) }; });
const before = pins(); write('source-before.json', { at: new Date().toISOString(), files: before });

const text = (filename) => read(filename).toString().replaceAll('\r\n', '\n');
const oldAsset = text(original + 'validate_asset.mjs'), newAsset = text(repaired + 'validate_asset.mjs');
assert.equal(newAsset, oldAsset.replace('assert.ok(!n.skin);', "assert.equal(n.skin,undefined,'Skin references are not allowed');"));
const oldContract = text(original + 'validate_contract.mjs'), newContract = text(repaired + 'validate_contract.mjs');
assert.equal(oldContract.slice(oldContract.indexOf('export function checkRuntime')), newContract.slice(newContract.indexOf('export function checkRuntime')), 'runtime/pose guard unchanged');
assert.equal(oldContract.slice(0, oldContract.indexOf('export function checkDocument')), newContract.slice(0, newContract.indexOf('export function checkDocument')), 'helper definitions unchanged');
write('source-comparison.json', { assetOnlyChange: 'binding skin falsy check becomes undefined check', unchangedRuntimeGuard: true,
  unchangedHelperDefinitions: true, documentChanges: 'all-node skin reference absence; required finite ordered POSITION bounds',
  accessorChange: 'optional bounds checked when !== undefined instead of truthy' });

const originalBytes = read(original + 'selected-a.glb');
const jsonSize = originalBytes.readUInt32LE(12);
const definition = JSON.parse(originalBytes.subarray(20, 20 + jsonSize));
const bin = originalBytes.subarray(28 + jsonSize);
const node = (doc) => doc.nodes.find((n) => n.name === 'APA_body_cap');
const primitive = (doc) => doc.meshes[node(doc).mesh].primitives[0];
const accessor = (doc, role = 'POSITION') => doc.accessors[primitive(doc).attributes[role]];
function glb(doc) {
  const text = Buffer.from(JSON.stringify(doc)), json = Buffer.alloc(Math.ceil(text.length / 4) * 4, 32); text.copy(json);
  const bytes = Buffer.alloc(28 + json.length + bin.length);
  bytes.writeUInt32LE(0x46546c67, 0); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(bytes.length, 8);
  bytes.writeUInt32LE(json.length, 12); bytes.writeUInt32LE(0x4e4f534a, 16); json.copy(bytes, 20);
  bytes.writeUInt32LE(bin.length, 20 + json.length); bytes.writeUInt32LE(0x004e4942, 24 + json.length); bin.copy(bytes, 28 + json.length);
  return bytes;
}
const results = [];
const cases = [
  ['valid-exact-v02', null, null],
  ['body-cap-skin-zero', (doc) => { node(doc).skin = 0; }, /Skin references are not allowed/],
  ['body-cap-missing-position-bounds', (doc) => { delete accessor(doc).min; delete accessor(doc).max; }, /finite vector 3/],
];
// Actual unchanged scripts in fresh private candidate directories. Their own
// profile/manifest/validation outputs cannot touch original or root receipts.
for (const version of ['old', 'current']) for (const [name, mutate, diagnostic] of cases) {
  const directory = fs.mkdtempSync(path.join(here, `${version}-${name}-`));
  for (const filename of inputs) fs.writeFileSync(path.join(directory, filename), read(original + filename));
  if (version === 'current') for (const filename of ['validate_asset.mjs', 'validate_contract.mjs']) fs.writeFileSync(path.join(directory, filename), read(repaired + filename));
  const doc = structuredClone(definition); mutate?.(doc);
  const bytes = mutate ? glb(doc) : originalBytes; fs.writeFileSync(path.join(directory, 'selected-a.glb'), bytes);
  const start = Date.now();
  const run = spawnSync(process.execPath, [path.join(directory, 'validate_asset.mjs')], { cwd: root, windowsHide: true, shell: false,
    encoding: 'utf8', timeout: 120000, maxBuffer: 2 * 1024 * 1024 });
  const stdout = `${version}-${name}.stdout.txt`, stderr = `${version}-${name}.stderr.txt`;
  fs.writeFileSync(path.join(here, stdout), run.stdout ?? ''); fs.writeFileSync(path.join(here, stderr), run.stderr ?? '');
  const expectedExit = version === 'current' && mutate ? 1 : 0;
  const matchedDiagnostic = expectedExit === 0 || diagnostic.test(run.stderr);
  const report = path.join(directory, 'validation.json');
  const record = { version, name, node: 'APA_body_cap', argv: [path.join(directory, 'validate_asset.mjs')],
    inputSha256: sha(bytes), binaryUnchanged: true, directory: path.relative(here, directory),
    validatorSha256: sha(fs.readFileSync(path.join(directory, 'validate_asset.mjs'))),
    contractSha256: sha(fs.readFileSync(path.join(directory, 'validate_contract.mjs'))),
    expectedExit, exitCode: run.status, error: run.error?.message, elapsedMs: Date.now() - start,
    matchedDiagnostic, passed: !run.error && run.status === expectedExit && matchedDiagnostic,
    role: version === 'old' && mutate ? 'reproduce historical false accept, not current acceptance' : 'current rejection or valid control',
    generatedStatus: fs.existsSync(report) ? JSON.parse(fs.readFileSync(report)).status : null, stdout, stderr };
  results.push(record); write('full-results.json', results);
  console.log(JSON.stringify({ version, name, exitCode: run.status, passed: record.passed, elapsedMs: record.elapsedMs }));
}

const current = await import(pathToFileURL(path.join(root, repaired, 'validate_contract.mjs')));
const old = await import(pathToFileURL(path.join(root, original, 'validate_contract.mjs')));
const guardResults = [];
function check(name, action, rejection) {
  let error = null; try { action(); } catch (caught) { error = String(caught); }
  guardResults.push({ name, expectedReject: rejection, rejected: error !== null, passed: (error !== null) === rejection, error });
}
check('valid current document', () => current.checkDocument(structuredClone(definition)), false);
for (const value of [0, null, false, '', 1]) check(`current present skin ${JSON.stringify(value)}`, () => {
  const doc = structuredClone(definition); node(doc).skin = value; current.checkDocument(doc);
}, true);
for (const [name, mutation] of [
  ['missing min', (a) => { delete a.min; }], ['missing max', (a) => { delete a.max; }],
  ['null min', (a) => { a.min = null; }], ['null max', (a) => { a.max = null; }],
  ['two components', (a) => { a.min = [0, 0]; }], ['four components', (a) => { a.max = [0, 0, 0, 0]; }],
  ['NaN component', (a) => { a.min[0] = NaN; }], ['Infinity component', (a) => { a.max[1] = Infinity; }],
  ['inverted axis', (a) => { a.min[2] = a.max[2] + 1; }],
]) check(`current POSITION ${name}`, () => { const doc = structuredClone(definition); mutation(accessor(doc)); current.checkDocument(doc); }, true);

// Real NORMAL data: absent bounds stay valid; present optional bounds must be
// shape/finite/value checked. This part was not covered by root's 11 assertions.
const normal = accessor(definition, 'NORMAL'), view = definition.bufferViews[normal.bufferView];
const offset = (view.byteOffset ?? 0) + (normal.byteOffset ?? 0), stride = view.byteStride ?? 12;
const values = Array.from({ length: normal.count }, (_, i) => [0, 1, 2].map((k) => bin.readFloatLE(offset + i * stride + k * 4)));
const extrema = (fn) => [0, 1, 2].map((k) => values.reduce((v, row) => fn(v, row[k]), fn === Math.min ? Infinity : -Infinity));
const min = extrema(Math.min), max = extrema(Math.max);
check('optional NORMAL bounds absent', () => current.checkAccessor({}, values), false);
check('optional NORMAL exact min only', () => current.checkAccessor({ min }, values), false);
check('optional NORMAL exact max only', () => current.checkAccessor({ max }, values), false);
check('optional NORMAL exact both', () => current.checkAccessor({ min, max }, values), false);
for (const key of ['min', 'max']) for (const [label, value] of [['null', null], ['zero', 0], ['false', false], ['empty string', ''], ['short', [0, 0]], ['nonfinite', [NaN, 0, 0]], ['wrong extrema', [10, 10, 10]]]) {
  check(`current optional ${key} ${label}`, () => current.checkAccessor({ [key]: value }, values), true);
}
check('old optional null bound false-accept sensitivity', () => old.checkAccessor({ min: null }, values), false);
write('guard-results.json', guardResults);
const after = pins(); write('source-after.json', { at: new Date().toISOString(), files: after, unchanged: JSON.stringify(before) === JSON.stringify(after) });
assert.deepEqual(after, before, 'Frozen input changed');
const failed = [...results, ...guardResults].filter((record) => !record.passed);
write('summary.json', { fullCases: results.length, fullPassed: results.filter((r) => r.passed).length,
  documentAccessorCases: guardResults.length, documentAccessorPassed: guardResults.filter((r) => r.passed).length,
  failures: failed, protectedInputCount: before.length, protectedInputsUnchanged: true,
  limits: ['actual candidate-directory scripts; no Blender or runtime/browser execution', 'old false accepts are sensitivity evidence only',
    'six required full-validator controls include their existing pose checks, not a new independent resampling campaign'] });
console.log(JSON.stringify({ fullCases: results.length, guards: guardResults.length, failed: failed.length, protectedInputsUnchanged: true }));
assert.equal(failed.length, 0, JSON.stringify(failed));
