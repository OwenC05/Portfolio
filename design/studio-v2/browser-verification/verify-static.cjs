const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { Linter } = require('eslint');
const files = ['dev-lifecycle-validation.mjs', 'failure-validation.mjs', 'performance-validation.mjs'];
const results = files.map(file => {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const expression = new vm.Script(`(${source})`, { filename: file });
  assert.equal(typeof expression.runInNewContext(), 'function');
  assert.equal(source.match(/\/\* STUDIO_V2_CONFIG \*\//g)?.length, 1);
  assert(!/127\.0\.0\.1:|portfolio-after-hours-v1|264\.1042|348\.7986/.test(source));
  const messages = new Linter().verify(source, {
    env: { browser: true, es2022: true },
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: { 'no-undef': 'error', 'no-unused-vars': 'error', 'no-unreachable': 'error', 'no-constant-condition': 'error' },
  });
  assert.deepEqual(messages, [], `${file}: ${JSON.stringify(messages)}`);
  return { file, expressionParsed: true, staticMessages: messages };
});
let pngMutation = 'Not run: optionally pass a local GLB path for CPU mutation checks';
if (process.argv[2]) {
  const source = fs.readFileSync(path.join(__dirname, 'failure-validation.mjs'), 'utf8');
  const functionSource = source.split('// BEGIN PNG MUTATOR (also extracted by the CPU-only static check)')[1].split('// END PNG MUTATOR')[0];
  const mutate = new vm.Script(`(()=>{${functionSource};return corruptEmbeddedPNG;})()`).runInNewContext({ TextDecoder });
  const original = fs.readFileSync(process.argv[2]), preserved = Buffer.from(original);
  const { bytes, evidence } = mutate(original);
  assert.deepEqual(original, preserved, 'source bytes must not be mutated');
  assert.equal(bytes.length, original.length);
  assert(evidence.containerAndJSONUnchanged && evidence.pngSignatureIHDRAndChunkHeadersUnchanged);
  const idats = evidence.pngChunks.filter(chunk => chunk.type === 'IDAT');
  const compressed = buffer => Buffer.concat(idats.map(chunk => Buffer.from(buffer.subarray(chunk.offset + 8, chunk.offset + 8 + chunk.length))));
  const zlib = require('node:zlib');
  const changedChunk = idats.find(chunk => chunk.offset + 8 === evidence.changedOffset);
  const changedCRC = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(evidence.crcOffset);
  assert.equal(zlib.crc32(bytes.subarray(changedChunk.offset + 4, evidence.crcOffset)), changedCRC, 'mutated IDAT CRC remains valid');
  assert(zlib.inflateSync(compressed(original)).length > 0, 'original PNG stream inflates');
  assert.throws(() => zlib.inflateSync(compressed(bytes)), 'mutated PNG stream must reject');
  assert.throws(() => mutate(original.subarray(0, original.length - 1)), /blocked/, 'truncated GLB must be blocked');
  pngMutation = { localInput: process.argv[2], evidence, sourceUnchanged: true, mutatedIDATCRCValid: true, originalStreamInflates: true, mutatedStreamRejects: true, truncatedContainerBlocked: true, limitation: 'CPU zlib validation only; no browser image decoder or application loader executed' };
}
console.log(JSON.stringify({ preparationOnly: true, results, pngMutation }, null, 2));
