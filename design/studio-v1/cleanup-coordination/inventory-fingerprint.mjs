import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Evidence only: reads the assigned source scope and writes this leaf's manifest.
const root = process.cwd();
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex').toUpperCase();
const sourcePaths = [...walk('app/studio'), ...walk('components/studio'), 'lib/studio-contract.ts', 'lib/studio-content.ts', 'app/globals.css'].map((file) => file.replaceAll('\\', '/')).sort();
const initial = {
  'app/studio/page.tsx': '7A3E95A799A27041229ED70F496607B376D9097BB5A0D0194C186F0DD1A66152',
  'app/studio/studio.module.css': '30BA6D8C4AC62F3F7A9120D41D7774B531E53891A504634ED91E2EF62DF052AC',
  'components/studio/ProjectEvidence.tsx': '078C749B8BAD50D88DCD47EC29CD9CF97A5C3621B3E98D21FAD455B3420905C5',
  'components/studio/StudioExperience.tsx': '75B57B83F0D8F93EDFFBDDC5F2CB26457F227F6D7A9643A8167487C62C2CB3E3',
  'components/studio/StudioScene.tsx': '29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC',
  'components/studio/scene/build-studio.ts': 'DBAF86527A207C09DB45F19125316FD8C929B97CFE16B14E52CC25B6D386DDEE',
  'components/studio/scene/controller.ts': 'BD46EDE4D8CD0525AC89A8A491866BBC065554918D663A4830D5DB51FFC9FB63',
  'components/studio/scene/resources.ts': '756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509',
  'components/studio/scene/textures.ts': 'EF7E5E025D21DEB88350B79A994DFB5AB1D9A1296D57EB0000CFDE813FB2BC84',
  'components/studio/scene/types.ts': 'F5A0A0F6F174124FF6C0ABBFD6C9BEF46E6FB6BCC4900404719B4928C4FEF5C6',
  'components/studio/scene/verify-controller.mjs': '7F9F21EE10458B676D548AFEDCEFFCEF84A21892CE42DE80D6677310EB325A6F',
  'lib/studio-contract.ts': '7F00624980E4E89ECFF7E90ABF371595FE8A0DDF3CDC0401DB4B679A872A9097',
  'lib/studio-content.ts': '36E08B40CFB779F3F05CC17623766F1A2FB7B8F876CAC73AC9B12DB381764662',
  'app/globals.css': '38A5427299238E2BE46AD5062E798EF3C68D13DFA884A1272BFDB2C55946F13F',
};
const sources = sourcePaths.map((file) => {
  const bytes = readFileSync(file);
  const sha256 = hash(bytes);
  const text = bytes.toString('utf8');
  return { file, bytes: bytes.length, lines: text.split(/\r?\n/).length - (text.endsWith('\n') ? 1 : 0), sha256, initialSha256: initial[file], unchangedSinceInitialRead: sha256 === initial[file] };
});
const globalText = readFileSync('app/globals.css', 'utf8');
const addition = globalText.match(/^@media \(prefers-reduced-motion: reduce\) \{\r?\n  html \{\r?\n    scroll-behavior: auto;\r?\n  \}\r?\n\}\r?\n\r?\n/m);
if (!addition) throw new Error('Expected six-line reduced-motion addition not found');
const inputs = [
  '.omx/specs/studio-v1/common.md', '.omx/specs/studio-v1/cleanup-review.md',
  '.omx/plans/prd-after-hours-studio-v1.md', '.omx/plans/test-spec-after-hours-studio-v1.md',
  'design/studio-v1/cleanup-coordination/plan.md',
  ...['foundation', 'content', 'scene', 'interface'].map((lane) => `design/studio-v1/${lane}-report.md`),
  'design/studio-v1/interface-coordination/critique-report.md',
].map((file) => ({ file, sha256: hash(readFileSync(file)) }));
const manifest = {
  capturedAtUtc: new Date().toISOString(), root,
  method: 'SHA-256 over file bytes; initial values copied from first Get-FileHash inspection in this inventory turn. Whole globals.css hash is a container fingerprint, not expanded source-review authority.',
  sources,
  globalsAddition: { startLine: globalText.slice(0, addition.index).split(/\r?\n/).length, lineCount: 6, sha256: hash(Buffer.from(addition[0], 'utf8')), text: addition[0], method: 'Exact six-line UTF-8 substring including blank sixth line; preserves original line endings.' },
  inputReportsAndPlans: inputs,
};
writeFileSync('design/studio-v1/cleanup-coordination/inventory-hashes.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ capturedAtUtc: manifest.capturedAtUtc, sourceFiles: sources.length, changedSinceInitialRead: sources.filter((file) => !file.unchangedSinceInitialRead).map((file) => file.file), globalsAddition: manifest.globalsAddition }, null, 2));
