// Local payload preparation only. No network, credentials, or paid operation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
const mode = process.argv[2] ?? '--check';
if (!['--check', '--write'].includes(mode) || process.argv.length > 3) fail('Use --check or --write only');
const request = JSON.parse(fs.readFileSync(path.join(here, 'request.example.json'), 'utf8'));
const input = path.resolve(repo, request.input.path);
const canonical = path.join(repo, 'design/assistant/robot/higgsfield-concepts/selected-a-v01/outputs/02-front.png');
if (input !== canonical) fail('This request is pinned to the reviewed front image');
const bytes = fs.readFileSync(input);
if (sha(bytes) !== request.input.sha256 || bytes.length !== request.input.bytes) fail('Input receipt mismatch');
if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') fail('Expected PNG');
const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
if (width !== request.input.width || height !== request.input.height) fail('PNG dimensions changed');
if (bytes.length > 20000000 || Math.min(width, height) < 32 || width * height > 178956970) fail('Image exceeds documented API limits');
const expected = { image_url: null, model_type: 'smart-topology', ai_model: 'meshy-t2.5', topology: 'triangle', target_polycount: 8000, should_texture: false, enable_pbr: false, target_formats: ['glb'], auto_size: false };
if (JSON.stringify(request.body) !== JSON.stringify(expected)) fail('Settings changed; align the reviewed request before preparation');
if (request.quote.candidateLimit !== 1 || request.quote.automaticCreateRetries !== 0) fail('One candidate and no create retry required');
const body = { ...request.body, image_url: 'data:image/png;base64,' + bytes.toString('base64') };
const payload = Buffer.from(JSON.stringify(body, null, 2) + '\n');
const roundtrip = Buffer.from(JSON.parse(payload.toString()).image_url.slice('data:image/png;base64,'.length), 'base64');
if (sha(roundtrip) !== request.input.sha256) fail('Embedded image round trip failed');
if (mode === '--write') {
  const candidate = path.join(here, 'candidate-001');
  if (fs.existsSync(candidate) && fs.realpathSync(candidate) !== candidate) fail('Candidate path must not redirect outside this directory');
  fs.mkdirSync(candidate, { recursive: true });
  fs.writeFileSync(path.join(candidate, 'create-request.json'), payload, { flag: 'wx' });
}
console.log(JSON.stringify({ mode, inputSha256: sha(bytes), width, height, pixels: width * height, imageBytes: bytes.length, base64Characters: bytes.toString('base64').length, createRequestBytes: payload.length, createRequestSha256: sha(payload), wrotePayload: mode === '--write', networkRequests: 0 }, null, 2));
