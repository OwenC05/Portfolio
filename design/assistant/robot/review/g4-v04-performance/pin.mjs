import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'design/assistant/robot/review/g4-v04-performance';
const base = 'design/assistant/robot/integration';
const stage = process.argv[2];
assert.ok(['before', 'after'].includes(stage));
const hash = path => {
  const bytes = readFileSync(path);
  return { path: path.replaceAll('\\', '/'), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
};
const source = JSON.parse(readFileSync(`${base}/verification-g4-v04/source-after.json`, 'utf8')).files;
assert.equal(source.length, 83);
for (const item of source) assert.equal(hash(item.path).sha256, item.sha256, `Source drift: ${item.path}`);
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const inputs = [...new Set([...source.map(f => f.path), ...['verification-g4-v04', 'performance-diagnosis-v01', 'dpr-candidate-v01'].flatMap(d => walk(`${base}/${d}`))])].sort().map(hash);
const result = { at: new Date().toISOString(), stage, sourceCount: source.length, inputs };
if (stage === 'after') assert.deepEqual(inputs, JSON.parse(readFileSync(`${out}/pins-before.json`, 'utf8')).inputs, 'Reviewed inputs changed');
writeFileSync(`${out}/pins-${stage}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ stage, sourceCount: source.length, pinnedFiles: inputs.length, unchanged: stage === 'after' }));
