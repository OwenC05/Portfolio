// Usage: node .github/scripts/measure-studio-js-budget.mjs [static-directory]
// Default: .next/static. The optional directory supports isolated fixture checks.
// Each generated .js file is counted once; source maps and server code are excluded.
import { appendFileSync, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';

if (process.argv.length > 3) throw new Error('Expected at most one static-directory argument');
const root = realpathSync(path.resolve(process.argv[2] ?? '.next/static'));
if (!lstatSync(root).isDirectory()) throw new Error('Static root must be a directory');
const paths = [];
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, realpathSync(absolute));
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Out-of-root static path: ${absolute}`);
    }
    // Reject links rather than following aliases, cycles, or double-counting files.
    if (entry.isSymbolicLink()) throw new Error(`Symbolic link in static output: ${absolute}`);
    if (entry.isDirectory()) visit(absolute);
    else if (entry.isFile() && entry.name.endsWith('.js')) paths.push(relative);
  }
}
visit(root);
paths.sort();
if (!paths.length) throw new Error('Static output contains no JavaScript files');

const files = paths.map((relative) => {
  const bytes = readFileSync(path.join(root, relative));
  return {
    path: relative.split(path.sep).join('/'),
    rawBytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
    brotliBytes: brotliCompressSync(bytes).length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
});
const scope = 'ALL-ROUTE static JavaScript: conservative upper bound for studio generated static chunks. This is not actual network transfer or an exact route graph; not all files load in studio. Excludes dynamic runtime external code and future full-kit integration.';
const report = {
  schemaVersion: 1,
  scope,
  sourceRevision: process.env.GITHUB_SHA ?? null,
  compression: {
    method: 'Each file compressed independently with Node gzipSync and brotliCompressSync default settings; totals sum per-file byte counts.',
    node: process.versions.node,
    zlib: process.versions.zlib,
    brotli: process.versions.brotli ?? null,
  },
  fileCount: files.length,
  totals: files.reduce((total, file) => ({
    rawBytes: total.rawBytes + file.rawBytes,
    gzipBytes: total.gzipBytes + file.gzipBytes,
    brotliBytes: total.brotliBytes + file.brotliBytes,
  }), { rawBytes: 0, gzipBytes: 0, brotliBytes: 0 }),
  files,
};
console.log('BEGIN_STUDIO_STATIC_JS_BUDGET_JSON');
console.log(JSON.stringify(report, null, 2));
console.log('END_STUDIO_STATIC_JS_BUDGET_JSON');

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    '### Studio static JavaScript ceiling', '', scope, '',
    `Files: ${report.fileCount}. Raw: ${report.totals.rawBytes} bytes. Gzip: ${report.totals.gzipBytes} bytes. Brotli: ${report.totals.brotliBytes} bytes.`, '',
    report.compression.method,
    `Node ${report.compression.node}; zlib ${report.compression.zlib}; Brotli ${report.compression.brotli ?? 'version unavailable'}.`, '',
    'The sorted per-file inventory and SHA-256 hashes are in the job log between BEGIN_STUDIO_STATIC_JS_BUDGET_JSON and END_STUDIO_STATIC_JS_BUDGET_JSON.', '',
  ].join('\n'));
}
