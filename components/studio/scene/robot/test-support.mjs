import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const bytes = readFileSync(new URL('../../../../public/studio/assistant-apprentice-v03.glb', import.meta.url));
export const profile = JSON.parse(readFileSync(new URL('./runtime-profile.json', import.meta.url)));
export function loadTs(file, modules, globals = {}, transform = (source) => source) {
  const code = ts.transpileModule(transform(readFileSync(new URL(file, import.meta.url), 'utf8')), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require(name) { assert.ok(name in modules, `Unexpected import ${name}`); return modules[name]; },
    AbortController, DOMException, crypto, ...globals }, { filename: file });
  return exports;
}
export const resources = loadTs('./resources.ts', { three: THREE });
export const cardsModule = loadTs('./cards.ts', { three: THREE });
export const presentationModule = loadTs('./presentation.ts', { three: THREE, './runtime-profile.json': profile, './cards': cardsModule });
export function loaderModule(globals = {}, transform, Loader = GLTFLoader) {
  return loadTs('./load-robot.ts', { three: THREE, 'three/addons/loaders/GLTFLoader.js': { GLTFLoader: Loader }, './runtime-profile.json': profile, './resources': resources }, {
    fetch: async () => ({ ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) }), ...globals,
  }, transform);
}
export async function realAsset() { return loaderModule().loadRobot(new AbortController().signal); }
export function input({ count = 0, phase = count ? 'retrieved' : 'requesting', pose = count ? 'sources' : 'attention', runId = 'run-a', selected = null, epoch = 1, panelOpen = true, revision = 1, attentionRequested = false } = {}) {
  const hits = Object.freeze(Array.from({ length: count }, (_, i) => Object.freeze({ key: `key-${i}`, rank: i + 1, hit: Object.freeze({}) })));
  return Object.freeze({ panelOpen, presentationEpoch: epoch, attentionRequested,
    snapshot: Object.freeze({ run: Object.freeze({ runId, revision, phase, hits, selectedKey: selected }), count, pose,
      tray: count ? 'hits' : pose === 'no-match' ? 'empty' : ['error', 'cancelled', 'idle'].includes(phase) ? 'hidden' : 'waiting',
      result: count ? 'sources' : pose === 'no-match' ? 'no-match' : 'pending' }) });
}
