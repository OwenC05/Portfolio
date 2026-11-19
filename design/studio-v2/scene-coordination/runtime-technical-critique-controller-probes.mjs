// Bounded review of the new async branch and sensitivity of its stale guard.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const root = new URL('../../../', import.meta.url);
const suiteURL = new URL('components/studio/scene/verify-controller.mjs', root);
const controllerURL = new URL('components/studio/scene/controller.ts', root);
const sha = (url) => createHash('sha256').update(readFileSync(url)).digest('hex').toUpperCase();
const suite = readFileSync(suiteURL, 'utf8').replace(/^import .*;\r?\n/gm, '').replaceAll('import.meta.url', JSON.stringify(suiteURL.href));
const names = [
  'async pilot keeps loading until resolution and the first visible nonzero successful render',
  'latest selection, queued commands and disabled consumption survive a pending pilot',
  'unmount aborts pending load; late resolution disposes without model attachment, render or callbacks',
  'pilot load rejection and post-load attachment/render failures never silently build procedural fallback',
  'remount gets a separate generation and pilot; a previous late success cannot affect the current controller',
];
const results = { controllerHash: sha(controllerURL), suiteHash: sha(suiteURL), task: 'task_73fa4e160358', dispatch: 'ctx_e14be999996e', baselines: [] };
async function execute(name, mutant = false) {
  let selected, changedLoads = 0, failure = null;
  vm.runInNewContext(suite, {
    assert, ts, THREE, RoundedBoxGeometry, vm, URL, EventTarget, Event, AbortController, existsSync,
    readFileSync(url, encoding) {
      const source = readFileSync(url, encoding);
      if (!mutant || !url.href.endsWith('/controller.ts')) return source;
      const guard = 'if (disposed || token !== generation) {';
      assert.equal(source.split(guard).length, 2); changedLoads++;
      return source.replace(guard, 'if (false) {');
    },
    test(testName, options, callback) { if (testName === name) { assert.equal(selected, undefined); selected = typeof options === 'function' ? options : callback; } },
  }, { filename: mutant ? 'review-stale-guard-removed' : 'review-async-baseline' });
  assert.equal(typeof selected, 'function');
  try { await selected(); } catch (error) { failure = { message: error.message, operator: error.operator, actual: error.actual, expected: error.expected }; }
  return { name, mutant, changedLoads, passed: failure === null, failure };
}
for (const name of names) { const outcome = await execute(name); assert.equal(outcome.passed, true, JSON.stringify(outcome.failure)); results.baselines.push(outcome); }
const mutation = await execute(names[2], true);
assert.equal(mutation.changedLoads, 1); assert.equal(mutation.passed, false);
assert.equal(mutation.failure.operator, 'strictEqual'); assert.equal(mutation.failure.actual, 1); assert.equal(mutation.failure.expected, 0);
results.staleGuardMutation = mutation;
assert.equal(sha(controllerURL), results.controllerHash); assert.equal(sha(suiteURL), results.suiteHash);
results.sourceStable = true;
console.log(JSON.stringify(results, null, 2));
