import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'design/studio-v1/cleanup-coordination';
const stage = process.argv[2];
if (!['before', 'after'].includes(stage)) throw new Error('Expected before or after');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex').toUpperCase();
const inventory = JSON.parse(readFileSync(path.join(base, 'inventory-hashes.json'), 'utf8'));
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = `${dir}/${entry.name}`;
  return entry.isDirectory() ? walk(file) : [file];
});
const currentFiles = [...walk('app/studio'), ...walk('components/studio'),
  'lib/studio-contract.ts', 'lib/studio-content.ts', 'app/globals.css'].sort();
const expected = new Map(inventory.sources.map((item) => [item.file, item.sha256]));
const sources = currentFiles.map((file) => {
  const bytes = readFileSync(file);
  const digest = sha256(bytes);
  return { file, bytes: bytes.length, sha256: digest, inventorySha256: expected.get(file) ?? null,
    matchesInventory: digest === expected.get(file) };
});
const globals = readFileSync('app/globals.css', 'utf8');
const lines = globals.match(/[^\n]*\n|[^\n]+$/g) ?? [];
const addition = lines.slice(13, 19).join('');
const globalsAddition = { startLine: 14, lineCount: 6, text: addition, sha256: sha256(addition),
  inventorySha256: inventory.globalsAddition.sha256,
  matchesInventory: sha256(addition) === inventory.globalsAddition.sha256 };
const inputs = [...inventory.inputReportsAndPlans.map((item) => item.file),
  `${base}/inventory.md`, `${base}/inventory-checks.json`, `${base}/inventory-hashes.json`]
  .map((file) => ({ file, sha256: sha256(readFileSync(file)) }));
const missingFiles = [...expected.keys()].filter((file) => !currentFiles.includes(file));
const result = { capturedAtUtc: new Date().toISOString(), root, stage,
  method: 'Independent SHA-256 of exact file bytes; globals whole-file hash is identity only, review limited to lines 14-19.',
  sources, missingFiles, globalsAddition, inputs };
if (stage === 'after') {
  const before = JSON.parse(readFileSync(`${base}/critique-hashes-before.json`, 'utf8'));
  result.changedSinceCritiqueStarted = sources.filter((item) =>
    before.sources.find((old) => old.file === item.file)?.sha256 !== item.sha256).map((item) => item.file);
  result.inputsChangedSinceCritiqueStarted = inputs.filter((item) =>
    before.inputs.find((old) => old.file === item.file)?.sha256 !== item.sha256).map((item) => item.file);
}
writeFileSync(`${base}/critique-hashes-${stage}.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ capturedAtUtc: result.capturedAtUtc, sources: sources.length,
  changedFromInventory: sources.filter((item) => !item.matchesInventory).map((item) => item.file),
  missingFiles, globalsAdditionMatches: globalsAddition.matchesInventory,
  changedSinceCritiqueStarted: result.changedSinceCritiqueStarted,
  inputsChangedSinceCritiqueStarted: result.inputsChangedSinceCritiqueStarted }, null, 2));
