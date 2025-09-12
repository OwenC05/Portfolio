#!/usr/bin/env node
/*
  Repo prune utility for Next.js (App Router) + TS + Tailwind + R3F, etc.
  - Default: dry-run. Writes prune-report.json and prune-report.md
  - --apply: deletes candidates (confidence >= 0.9) and moves 0.8–0.89 to __trash__/
  - Respects guardrails and Next.js conventions; scans import graph + strings.
*/

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const cp = require('child_process');

// Lazy require for optional deps
let esbuild;
let fastGlob;

const cwd = process.cwd();
const repoRoot = cwd;

const ARGS = new Set(process.argv.slice(2));
const APPLY = ARGS.has('--apply');
const FORCE = ARGS.has('--force');
const INCLUDE_TESTS = ARGS.has('--include-tests');
const REPORT_JSON = path.join(repoRoot, 'prune-report.json');
const REPORT_MD = path.join(repoRoot, 'prune-report.md');
const KEEP_FILE = path.join(repoRoot, 'scripts', 'prune-keep.yml');

function posix(p) {
  return p.split(path.sep).join('/');
}

function toRepoRel(abs) {
  return posix(path.relative(repoRoot, abs));
}

function fromRepoRel(rel) {
  return path.join(repoRoot, rel);
}

function humanBytes(bytes) {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = ['KB', 'MB', 'GB', 'TB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

async function fileExists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

function readJSON(p, def = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return def; }
}

function readText(p, def = '') {
  try { return fs.readFileSync(p, 'utf8'); } catch { return def; }
}

function unique(arr) { return Array.from(new Set(arr)); }

function globSync(patterns, options = {}) {
  if (!fastGlob) fastGlob = require('fast-glob');
  return fastGlob.sync(patterns, { cwd: repoRoot, dot: true, onlyFiles: true, ...options });
}

function loadKeepRules() {
  const rules = [];
  if (fs.existsSync(KEEP_FILE)) {
    const text = fs.readFileSync(KEEP_FILE, 'utf8');
    // Minimal YAML parser for list under keep:
    // keep:\n  //   - pattern1\n  //   - pattern2
    const lines = text.split(/\r?\n/);
    let inKeep = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      if (line.startsWith('keep:')) { inKeep = true; continue; }
      if (inKeep) {
        const m = line.match(/^-\s+(.+)$/);
        if (m) rules.push(m[1].trim());
        else if (!raw.startsWith(' ') && !raw.startsWith('\t')) inKeep = false;
      }
    }
  }
  return rules;
}

function matchesAny(relPath, patterns) {
  if (!patterns.length) return false;
  const micromatch = require('micromatch');
  return micromatch.isMatch(posix(relPath), patterns, { dot: true });
}

function guardrailPatterns() {
  return [
    '.next/**',
    '.git/**',
    '.vscode/**',
    'node_modules/**',
    'prune-report.*',
    'scripts/prune-keep.yml',
    // Configs
    '.env*', 'next.config.*', 'tsconfig.*', 'postcss.config.*', 'tailwind.config.*',
    '.eslintrc*', '.prettierrc*', 'prettier.config.*', '.prettier*', '.stylelintrc*',
    'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
    // Public must-keep
    'public/favicon.*', 'public/favicon.ico', 'public/robots.txt', 'public/manifest.*',
    'public/apple-*', 'public/opengraph*', 'public/twitter*', 'public/icon.*',
    // Next route framework files
    'app/**/layout.*', 'app/**/template.*', 'app/**/page.*', 'app/**/route.*',
    'app/**/loading.*', 'app/**/error.*', 'app/**/not-found.*', 'middleware.*',
  ];
}

function testLikePatterns() {
  return [
    '**/*.test.*', '**/*.spec.*', '**/*.stories.*', '__tests__/**',
  ];
}

function isCommentLine(filename, line) {
  const ext = path.extname(filename).toLowerCase();
  const t = line.trim();
  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return t.startsWith('//') || t.startsWith('/*') || t.endsWith('*/');
  }
  if (['.md', '.mdx'].includes(ext)) {
    return t.startsWith('<!--') || t.endsWith('-->');
  }
  if (['.css', '.scss'].includes(ext)) {
    return t.startsWith('/*') || t.endsWith('*/');
  }
  return false;
}

function collectEntryPoints() {
  const entries = unique([
    ...globSync(['app/**/page.{ts,tsx,js,jsx}', 'app/**/layout.{ts,tsx,js,jsx}', 'app/**/template.{ts,tsx,js,jsx}', 'app/**/loading.{ts,tsx,js,jsx}', 'app/**/error.{ts,tsx,js,jsx}', 'app/**/not-found.{ts,tsx,js,jsx}', 'app/**/route.{ts,tsx,js,jsx}']),
    ...globSync(['app/**/*.mdx']),
    ...globSync(['middleware.{ts,js}'])
  ]);
  return entries.map((r) => path.join(repoRoot, r));
}

async function buildEsbuildGraph(entryAbsPaths) {
  if (!esbuild) esbuild = require('esbuild');
  const loaders = {
    '.ts': 'ts', '.tsx': 'tsx', '.js': 'js', '.jsx': 'jsx', '.css': 'css',
    '.json': 'json', '.mdx': 'text', '.glsl': 'text', '.gltf': 'file', '.glb': 'file',
    '.hdr': 'file', '.png': 'file', '.jpg': 'file', '.jpeg': 'file', '.webp': 'file',
    '.svg': 'file', '.gif': 'file', '.mp4': 'file', '.mov': 'file', '.ttf': 'file',
    '.otf': 'file', '.mp3': 'file', '.wav': 'file', '.jsonc': 'json',
  };
  const externals = [
    'next', 'next/*', 'react', 'react-dom', 'three', '@react-three/*', 'framer-motion', 'next-themes', 'zustand', '@react-three/postprocessing', '@react-three/rapier'
  ];
  const result = await esbuild.build({
    entryPoints: entryAbsPaths,
    bundle: true,
    metafile: true,
    write: false,
    outdir: 'repo-prune-tmp',
    format: 'esm',
    platform: 'neutral',
    absWorkingDir: repoRoot,
    loader: loaders,
    external: externals,
    logLevel: 'silent',
  });
  const inputs = result.metafile ? Object.keys(result.metafile.inputs) : [];
  const used = new Set();
  for (const input of inputs) {
    const abs = path.isAbsolute(input) ? input : path.join(repoRoot, input);
    used.add(posix(path.relative(repoRoot, abs)));
  }
  // Also include the entries themselves
  for (const abs of entryAbsPaths) used.add(posix(path.relative(repoRoot, abs)));
  return used;
}

function scanStringRefs() {
  const patterns = ['**/*.{ts,tsx,js,jsx,md,mdx,css,scss}'];
  const files = globSync(patterns, { ignore: ['node_modules/**', '.next/**', '.git/**'] });
  const hits = new Map(); // relPath -> { lines: number[], commentOnly: bool }
  const referenced = new Set(); // repo-relative paths
  const assetExt = /(\.glb|\.gltf|\.hdr|\.png|\.jpg|\.jpeg|\.webp|\.svg|\.gif|\.mp4|\.mov|\.ttf|\.otf)/i;

  function addRef(targetRel, srcFile, lineNo, isComment) {
    const rel = posix(targetRel);
    if (!hits.has(rel)) hits.set(rel, { occurrences: [], commentOnly: true });
    const h = hits.get(rel);
    h.occurrences.push({ file: posix(srcFile), line: lineNo, comment: isComment });
    if (!isComment) h.commentOnly = false;
    referenced.add(rel);
  }

  for (const rel of files) {
    const abs = fromRepoRel(rel);
    const content = readText(abs);
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isComment = isCommentLine(rel, line);
      // Next/Image and generic src="/..."
      const reSrc = /\bsrc\s*=\s*(["'])(\/[^"']+)\1/g;
      let m;
      while ((m = reSrc.exec(line))) {
        const p = m[2];
        const target = p.startsWith('/') ? path.join('public', p.slice(1)) : p;
        addRef(target, rel, i + 1, isComment);
      }
      // url(...)
      const reUrl = /url\(([^)]+)\)/g;
      let mu;
      while ((mu = reUrl.exec(line))) {
        let val = mu[1].trim().replace(/^['"]|['"]$/g, '');
        if (val.startsWith('/')) val = path.join('public', val.slice(1));
        if (assetExt.test(val)) addRef(val, rel, i + 1, isComment);
      }
      // Plain string mentions of assets (e.g., loaders)
      const reAny = /(["'])([^"']+\.(?:glb|gltf|hdr|png|jpg|jpeg|webp|svg|gif|mp4|mov|ttf|otf))\1/gi;
      let ma;
      while ((ma = reAny.exec(line))) {
        let val = ma[2];
        if (val.startsWith('/')) val = path.join('public', val.slice(1));
        addRef(val, rel, i + 1, isComment);
      }
      // next/font/local paths
      const reFontLocal = /path\s*:\s*(["'])([^"']+\.(?:ttf|otf|woff2?))\1/g;
      let mf;
      while ((mf = reFontLocal.exec(line))) {
        let val = mf[2];
        if (val.startsWith('/')) val = path.join('public', val.slice(1));
        addRef(val, rel, i + 1, isComment);
      }
    }
  }
  return { referenced, hits };
}

function collectRouteRoots() {
  const roots = new Set();
  const patterns = ['app/**/page.*', 'app/**/route.*', 'app/**/layout.*'];
  for (const r of globSync(patterns)) {
    const dir = posix(path.dirname(r));
    roots.add(dir);
  }
  return roots;
}

function collectPkgScriptRefs() {
  const pkg = readJSON(path.join(repoRoot, 'package.json'), {});
  const scripts = pkg && pkg.scripts ? Object.values(pkg.scripts) : [];
  const refs = new Set();
  const re = /(?:^|\s)([\w./\\:-]+\.(?:js|ts|mjs|cjs|sh|ps1|bat))(?:\s|$)/g;
  for (const s of scripts) {
    if (typeof s !== 'string') continue;
    let m;
    while ((m = re.exec(s))) {
      let pth = m[1].replace(/^[.][\/]/, ''); // strip leading ./
      pth = posix(pth.replace(/\\/g, '/'));
      if (!(pth.startsWith('http://') || pth.startsWith('https://'))) {
        refs.add(pth);
      }
    }
  }
  return refs;
}

async function main() {
  const start = Date.now();
  const keepRules = loadKeepRules();
  const guard = guardrailPatterns();
  const tests = testLikePatterns();

  // List all files in repo (excluding obvious ignores)
  const allFiles = globSync(['**/*'], {
    ignore: ['node_modules/**', '.next/**', '.git/**', '__trash__/**'],
  });

  const entryAbs = collectEntryPoints();
  const usedFromEsbuild = entryAbs.length ? await buildEsbuildGraph(entryAbs) : new Set();
  const { referenced: stringRefs, hits: stringHits } = scanStringRefs();
  const routeRoots = collectRouteRoots();
  const pkgScriptRefs = collectPkgScriptRefs();

  // Build used set
  const used = new Set([...usedFromEsbuild, ...stringRefs]);
  for (const ref of pkgScriptRefs) used.add(ref);

  // Always mark guardrails and keep rules as used
  for (const rel of allFiles) {
    if (matchesAny(rel, guard)) used.add(posix(rel));
    if (keepRules.length && matchesAny(rel, keepRules)) used.add(posix(rel));
    if (!INCLUDE_TESTS && matchesAny(rel, tests)) used.add(posix(rel));
  }

  // Special: keep Next colocation files that are auto-loaded
  for (const rel of allFiles) {
    if (rel.startsWith('app/')) {
      const base = path.basename(rel);
      if (['icons.ts', 'metadata.ts'].includes(base)) used.add(posix(rel));
    }
  }

  // Special: keep fonts referenced via @font-face
  for (const rel of globSync(['**/*.css', '**/*.scss'])) {
    const content = readText(fromRepoRel(rel));
    const re = /url\(([^)]+\.(?:ttf|otf|woff2?))\)/gi;
    let m;
    while ((m = re.exec(content))) {
      let val = m[1].trim().replace(/^['"]|['"]$/g, '');
      if (val.startsWith('/')) val = path.join('public', val.slice(1));
      used.add(posix(val));
    }
  }

  // Build candidates list
  const candidates = [];
  let totalSize = 0n;
  const byFolder = new Map();

  function reasonFor(rel) {
    const hit = stringHits.get(rel);
    if (hit && hit.commentOnly) return { reason: 'Only referenced in comments', confidence: 0.8 };
    return { reason: 'No references across graph and scans', confidence: 1.0 };
  }

  for (const relRaw of allFiles) {
    const rel = posix(relRaw);
    if (used.has(rel)) continue;
    // Never delete directories via this tool; only files are enumerated anyway
    // Skip files that are parents of route roots (we aren't deleting dirs, but stay safe)
    const dir = posix(path.dirname(rel));
    if (routeRoots.has(dir)) {
      // Files colocated under a route root can still be deleted if unused,
      // but keep framework files and metadata handled above.
    }

    // Determine size
    const st = fs.statSync(fromRepoRel(rel));
    if (!st.isFile()) continue;
    const size = BigInt(st.size);

    const { reason, confidence } = reasonFor(rel);
    candidates.push({ path: rel, size: Number(size), humanSize: humanBytes(Number(size)), reason, confidence });
    totalSize += size;

    // Folder grouping (top-level folder)
    const top = rel.includes('/') ? rel.split('/')[0] + '/' : './';
    if (!byFolder.has(top)) byFolder.set(top, { count: 0, size: 0n });
    const agg = byFolder.get(top);
    agg.count += 1;
    agg.size += size;
  }

  // Sort by size desc for top N
  const top20 = [...candidates].sort((a, b) => b.size - a.size).slice(0, 20);

  const summary = {
    totalFiles: candidates.length,
    totalSizeBytes: Number(totalSize),
    totalSizeHuman: humanBytes(Number(totalSize)),
    byFolder: Array.from(byFolder.entries()).map(([folder, v]) => ({ folder, count: v.count, sizeBytes: Number(v.size), sizeHuman: humanBytes(Number(v.size)) })),
  };

  const report = {
    mode: APPLY ? 'apply' : 'dry-run',
    generatedAt: new Date().toISOString(),
    candidates: candidates.map(({ path: p, size, reason, confidence }) => ({ path: p, size, reason, confidence })),
    summary,
  };

  // Write JSON report
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));

  // Write Markdown report
  const md = [];
  md.push('# Prune Report');
  md.push('');
  md.push(`Mode: ${APPLY ? 'apply' : 'dry-run'}`);
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push('');
  md.push('## Summary');
  md.push(`- Candidates: ${summary.totalFiles}`);
  md.push(`- Total size: ${summary.totalSizeHuman}`);
  md.push('');
  md.push('### By folder');
  for (const row of summary.byFolder.sort((a, b) => b.sizeBytes - a.sizeBytes)) {
    md.push(`- ${row.folder}: ${row.count} files, ${row.sizeHuman}`);
  }
  md.push('');
  md.push('### Top 20 largest candidates');
  for (const c of top20) {
    md.push(`- ${c.path} — ${c.humanSize} — ${c.reason} (conf ${c.confidence})`);
  }
  md.push('');
  md.push('---');
  md.push('');
  md.push('Generated by scripts/repo-prune.js');
  fs.writeFileSync(REPORT_MD, md.join(os.EOL));

  // Apply mode (deletions/moves) — not executed in this run unless --apply
  if (APPLY) {
    const trashRoot = path.join(repoRoot, '__trash__');
    if (!fs.existsSync(trashRoot)) fs.mkdirSync(trashRoot);
    const toDelete = candidates.filter((c) => c.confidence >= 0.9 || FORCE);
    const toQuarantine = candidates.filter((c) => c.confidence >= 0.8 && c.confidence < 0.9 && !FORCE);

    // Delete high-confidence
    for (const c of toDelete) {
      const abs = fromRepoRel(c.path);
      try { fs.unlinkSync(abs); } catch {}
    }
    // Move medium-confidence
    for (const c of toQuarantine) {
      const abs = fromRepoRel(c.path);
      const dest = path.join(trashRoot, c.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      try { fs.renameSync(abs, dest); } catch {}
    }

    // Try building to validate; if fails, restore
    function runCmd(cmd, args, opts = {}) {
      try {
        cp.execFileSync(cmd, args, { stdio: 'inherit', cwd: repoRoot, ...opts });
        return true;
      } catch (e) { return false; }
    }
    // Prefer pnpm, fallback npm
    const okBuild = runCmd('pnpm', ['build']) || runCmd('npm', ['run', 'build']);
    const okLint = runCmd('pnpm', ['lint']) || runCmd('npm', ['run', 'lint']);
    const okType = runCmd('pnpm', ['typecheck']) || true; // optional if not present

    if (!(okBuild && okLint && okType)) {
      // Restore from trash
      for (const c of toQuarantine) {
        const dest = path.join(trashRoot, c.path);
        const back = fromRepoRel(c.path);
        fs.mkdirSync(path.dirname(back), { recursive: true });
        if (fs.existsSync(dest)) fs.renameSync(dest, back);
      }
      console.error('Build/lint/typecheck failed — restored quarantined files. Aborting.');
      process.exit(1);
    }
  }

  const ms = Date.now() - start;
  console.log(`Prune ${APPLY ? 'apply' : 'dry-run'} completed in ${ms}ms. Reports written to prune-report.json and prune-report.md.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
