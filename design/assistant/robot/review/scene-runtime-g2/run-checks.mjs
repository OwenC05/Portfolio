import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../../../../', import.meta.url));
const directory = new URL('./', import.meta.url);
const sourcePins = new URL('../../integration/scene-implementation/source-pins.json', import.meta.url);
const before = JSON.parse(readFileSync(new URL('./source-before.json', import.meta.url), 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const results = [];
function command(name, args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 5 * 1024 * 1024 });
  const log = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  writeFileSync(new URL(`${name}.txt`, directory), log);
  results.push({ command: ['node', ...args].join(' '), argv: args, exitCode: result.status, error: result.error?.message, log: `${name}.txt` });
  console.log(`${name}: exit ${result.status}`);
}
command('independent-probes', ['--test', '--test-reporter=tap', 'design/assistant/robot/review/scene-runtime-g2/probe.test.mjs']);
command('targeted-existing', ['--test', '--test-reporter=tap', '--test-name-pattern=G2 |React adapter|format mutations|real installed parser|robot/card foreground',
  'components/studio/scene/verify-controller.mjs', 'components/studio/scene/robot/verify-robot.mjs']);
command('profile-check', ['components/studio/scene/robot/derive-profile.mjs', '--check']);
command('payload-check', ['design/assistant/robot/review/scene-runtime-g2/payload-evidence.mjs']);
command('scoped-lint', ['node_modules/eslint/bin/eslint.js',
  'components/studio/StudioScene.tsx', 'components/studio/scene/controller.ts', 'components/studio/scene/picking.ts',
  'components/studio/scene/types.ts', 'lib/studio-contract.ts', 'components/studio/scene/robot',
  'design/assistant/robot/review/scene-runtime-g2/probe.test.mjs', 'design/assistant/robot/review/scene-runtime-g2/run-checks.mjs',
  'design/assistant/robot/review/scene-runtime-g2/payload-evidence.mjs', '--ext', '.ts,.mjs']);

// TypeScript API: explicit G2 roots + their imports only, no Next generation,
// no emit, no incremental cache, and no root StudioExperience inclusion.
const pins = JSON.parse(readFileSync(sourcePins, 'utf8'));
const owned = Object.values(pins).find((value) => Array.isArray(value) && value.length === 24);
assert.ok(owned, '24 owned pin entries');
const configFile = ts.readConfigFile(`${root}/tsconfig.json`, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const options = { ...config.options, noEmit: true, incremental: false };
const program = ts.createProgram(owned.filter(({ path }) => /\.tsx?$/.test(path)).map(({ path }) => `${root}/${path}`), options);
const diagnostics = ts.getPreEmitDiagnostics(program);
const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: (name) => name, getCurrentDirectory: () => root, getNewLine: () => '\n' });
writeFileSync(new URL('scoped-types.txt', directory), formatted || '0 TypeScript diagnostics; explicit G2 roots and imported dependencies only.\n');
results.push({ command: 'TypeScript createProgram; pinned G2 TS/TSX roots; noEmit=true incremental=false', diagnostics: diagnostics.length,
  sourceFiles: program.getSourceFiles().filter((source) => !source.fileName.includes('node_modules')).map((source) => source.fileName), log: 'scoped-types.txt' });
console.log(`scoped-types: ${diagnostics.length} diagnostics`);

const after = { checkedAt: new Date().toISOString(), sourcePinsSha256: hash(readFileSync(sourcePins)), ownedCount: 24,
  records: before.records.map((record) => {
    const bytes = readFileSync(new URL(record.path, new URL('../../../../../', import.meta.url)));
    return { ...record, actualBytes: bytes.length, actualSha256: hash(bytes), matches: bytes.length === record.bytes && hash(bytes) === record.sha256 };
  }), excluded: ['components/studio/StudioExperience.tsx', 'tests/assistant/studio-experience.test.cjs'] };
writeFileSync(new URL('source-after.json', directory), JSON.stringify(after, null, 2) + '\n');
const pinsUnchanged = before.sourcePinsSha256 === after.sourcePinsSha256 && after.records.every((record) => record.matches);
results.push({ check: '40 pinned inputs before/after including 24 owned', pinsUnchanged, immutableClaimsExclude: after.excluded });
writeFileSync(new URL('checks.json', directory), JSON.stringify({ checkedAt: after.checkedAt, node: process.version, results,
  probeDevelopmentCorrections: ['Initial probe used Card rather than actual Mark node names; corrected private probe.',
    'Initial G1 comparison encountered arrays from separate VM realms; normalized with Array.from.',
    'Final failure action uses actual G1 fail/network action shape.'],
  expectedFailure: 'independent-probes: generated card disposal exception skips remaining geometry/material releases; root detach exception skips all imported releases; source left unchanged' }, null, 2) + '\n');
assert.ok(pinsUnchanged, 'source pins changed during review');
assert.equal(diagnostics.length, 0, formatted);
