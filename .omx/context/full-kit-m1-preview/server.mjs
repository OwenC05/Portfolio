import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const require = createRequire(path.join(repo, 'package.json'));
const ts = require('typescript');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const tag = option('--tag', 'v02');
const stage = option('--stage', 'M1');
if (!['M1', 'M2'].includes(stage) || (stage === 'M2' && tag !== 'v02')) throw new Error('Use M1 or the pinned M2 v02 candidate');
if (!/^v\d+$/.test(tag)) throw new Error('Use a version tag such as v02');
const port = Number(option('--port', '4182'));
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 4181) throw new Error('Invalid isolated preview port');
const check = args.includes('--check');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const routes = new Map();
const sources = {};
const read = relative => {
  const bytes = fs.readFileSync(path.join(repo, relative));
  sources[relative] = { sha256: sha(bytes), bytes: bytes.length };
  return bytes;
};
const compile = (name, source) => {
  const result = ts.transpileModule(source, { fileName: name, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, isolatedModules: true } });
  const errors = (result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {getCanonicalFileName:x=>x,getCurrentDirectory:()=>repo,getNewLine:()=> '\n'}));
  return result.outputText;
};
const add = (url, body, type = 'text/javascript') => routes.set(url, {body, type});
const controllerPath = 'components/studio/scene/controller.ts';
const controller = read(controllerPath).toString();
// Bind renderer extraction to the accepted controller, not a moving file.
if (sources[controllerPath].sha256 !== 'cc76055ea4bfe596e0d3ab49c84ca55c55b8a9bad3b33627e08adeb78f0969f0') throw new Error('Accepted renderer source changed; root must review extraction');
const between = (source, start, end) => {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  if (a < 0 || b < a || source.indexOf(start, a + 1) !== -1) throw new Error(`Extraction anchors changed: ${start}`);
  return source.slice(a, b);
};
const renderer = between(controller, '    renderer = new THREE.WebGLRenderer', '    host.appendChild(canvas);').replace('renderer =', 'const renderer =');
const authored = `import * as THREE from 'three';
export function acceptedRenderer(canvas: HTMLCanvasElement) {\n${renderer}\nreturn renderer; }`;
add('/authored.js', compile('accepted-authored-fragments.ts', authored));
const base = 'design/studio-v2/asset-pipeline/full-kit';
const modulePaths = new Map([
  ...['resources','textures','view-config','full-kit-types','bind-full-kit','load-full-kit','build-full-studio'].map(name => [`components/studio/scene/${name}.ts`, `/source/${name}.js`]),
  ['lib/studio-contract.ts','/source/studio-contract.js'],
  [`${base}/technical/profile-core.mjs`,'/source/profile-core.js'],
]);
const replacements = {
  "@/lib/studio-contract":'/source/studio-contract.js',
  [`@/${base}/full-kit-profile-v1.json`]:'/data/profile.js',
  [`@/${base}/asset-inventory.json`]:'/data/inventory.js',
  [`@/${base}/technical/fixtures/baseline.manifest.json`]:'/data/candidate-manifest.js',
  [`@/${base}/technical/profile-core.mjs`]:'/source/profile-core.js',
};
for (const name of ['resources','textures','view-config','full-kit-types','bind-full-kit','load-full-kit','build-full-studio']) replacements[`./${name}`]=`/source/${name}.js`;
const originalCandidate = "const candidate = { url: '/studio/full-kit-uninstalled-synthetic-baseline.glb', manifest: fixtureManifest };";
const injectedCandidate = "const candidate = { url: '/asset/' + (new URLSearchParams(location.search).get('variant') ?? 'baseline') + '.glb', manifest: fixtureManifest };";
for (const [relative,url] of modulePaths) {
  let source=read(relative).toString();
  const requiredHashes = {
    'components/studio/scene/load-full-kit.ts':'37549d60af2eb7f5e1feaf0914fd0da496ec38441ebe088ce445d2914b5ad68f',
    [`${base}/technical/profile-core.mjs`]:'02b65feddb651f41a4a9d5eab4f55e41ae15c321d850a26fba00b3a92889ae71',
  };
  if (stage === 'M2' && requiredHashes[relative] && sources[relative].sha256 !== requiredHashes[relative]) throw new Error(`M2 reviewed source changed: ${relative}`);
  if(relative.endsWith('/build-full-studio.ts') && sources[relative].sha256 !== '5a4e8296e04d66cfeaedf59bedee8c633b378c84126de52b78eaabe421c0f02f') throw new Error('Authored full builder changed; root must review new snapshot');
  if(relative.endsWith('/bind-full-kit.ts') && sources[relative].sha256 !== '0ee8bbe6e0fb83ab4bf219343655c4260a8f5193f5624dc69fb802634a2294eb') throw new Error('Reviewed binder changed; root must review new snapshot');
  if(relative.endsWith('/load-full-kit.ts')) {
    if(source.split(originalCandidate).length!==2)throw new Error('Loader candidate injection anchor changed');
    source=source.replace(originalCandidate,injectedCandidate);
  }
  let javascript=relative.endsWith('.ts')?compile(relative,source):source;
  javascript=javascript.replace(/\bfrom\s+(['"])([^'"]+)\1/g,(match,quote,specifier)=>replacements[specifier]?`from ${quote}${replacements[specifier]}${quote}`:match);
  add(url,javascript);
}
for(const [name,file] of [['profile','full-kit-profile-v1.json'],['inventory','asset-inventory.json']]) {
  add(`/data/${name}.js`,`export default ${JSON.stringify(JSON.parse(read(`${base}/${file}`)))};`);
}
const candidates = {};
for (const variant of (stage === 'M2' ? ['proposal'] : ['baseline', 'proposal'])) {
  const stem = `studio-full-kit-${stage.toLowerCase()}-${variant}-${tag}`;
  const manifestPath = `${base}/manifests/${stem}.manifest.json`;
  const manifest = JSON.parse(read(manifestPath));
  const technicalManifestPath = stage === 'M2' ? manifestPath : `${base}/technical/evidence/m1-${variant}-${tag}.manifest.json`;
  const technicalManifest = stage === 'M2' ? manifest : JSON.parse(read(technicalManifestPath));
  const glbPath = `${base}/exports/${stem}.glb`;
  const bytes = read(glbPath);
  if (manifest.variant !== variant || manifest.stage !== stage || manifest.profileId !== 'studio-full-kit-v1' || sha(bytes) !== manifest.glbSha256.toLowerCase()) throw new Error(`Candidate provenance mismatch: ${variant}`);
  if(technicalManifest.variant!==variant || technicalManifest.profileId!=='studio-full-kit-v1' || technicalManifest.glbSha256!==sha(bytes))throw new Error(`Technical manifest mismatch: ${variant}`);
  if (stage === 'M2' && (sha(bytes) !== '2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411' || sources[manifestPath].sha256 !== 'a3bd983a582d58875ed024e6815fa891f511b51e72b4d3b835c50692a9a48c51')) throw new Error('M2 exact candidate pin mismatch');
  candidates[variant] = {manifest, manifestPath, technicalManifest, technicalManifestPath, glbPath, sha256:sha(bytes), bytes:bytes.length};
  add(`/asset/${variant}.glb`, bytes, 'model/gltf-binary');
  add(`/data/manifest-${variant}.js`,`export default ${JSON.stringify(technicalManifest)};`);
}
if (stage === 'M2') add('/data/candidate-manifest.js', "import proposal from '/data/manifest-proposal.js'; if(new URLSearchParams(location.search).get('variant')!=='proposal')throw new Error('M2 requires proposal'); export default proposal;");
else add('/data/candidate-manifest.js',"import baseline from '/data/manifest-baseline.js'; import proposal from '/data/manifest-proposal.js'; const variant=new URLSearchParams(location.search).get('variant') ?? 'baseline'; if(!['baseline','proposal'].includes(variant))throw new Error('Invalid candidate variant'); export default variant==='proposal'?proposal:baseline;");
read('design/studio-v2/asset-pipeline/full-kit/full-kit-profile-v1.json');
read('design/studio-v2/scene-coordination/full-kit-contract.md');
const client = fs.readFileSync(path.join(here, 'preview.mjs'));
sources['.omx/context/full-kit-m1-preview/preview.mjs'] = {sha256:sha(client), bytes:client.length};
read('.omx/context/full-kit-m1-preview/server.mjs');
const threePackage = JSON.parse(read('node_modules/three/package.json'));
if (threePackage.version !== '0.187.0') throw new Error('Expected installed Three 0.187.0');
add('/preview.js', client);
if (stage === 'M2') {
  const validator = `${base}/technical/validate-full-kit.mjs`;
  read(validator);
  if (sources[validator].sha256 !== '66ee9d342cbded31994e6e8655e385c5b7945916b5ec68ad3404af9beda8bd75') throw new Error('M2 reviewed validator changed');
}
const provenance = {tag, stage, mode:'actual-full-kit-loader-builder', threeVersion:threePackage.version, sources, candidates, scope:`${stage} isolated actual loader/binder/builder assembly; authored lights provisional; no product controls/UI, production lifecycle/performance or final appearance acceptance`, authoredLighting:'actual createFullStudio, unchanged source', authoredRenderer:'accepted controller configuration', rendererFragmentSha256:sha(renderer), loaderInjection:{originalCandidate,injectedCandidate,manifestImportReplacement:replacements[`@/${base}/technical/fixtures/baseline.manifest.json`]}, compiledModules:Object.fromEntries([...routes].filter(([,entry])=>entry.type==='text/javascript').map(([url,entry])=>[url,sha(entry.body)]))};
add('/provenance.json', JSON.stringify(provenance), 'application/json');
add('/', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>M1 technical capture harness</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}canvas{display:block;width:100%;height:100%}</style><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script></head><body><canvas></canvas><script type="module" src="/preview.js"></script></body></html>`, 'text/html');

if (check) {
  // Validate syntax and installed import destinations without a server or browser.
  for (const [url, entry] of routes) {
    if (entry.type !== 'text/javascript') continue;
    const parsed = ts.createSourceFile(url, entry.body.toString(), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    if (parsed.parseDiagnostics.length) throw new Error(`Invalid generated JS ${url}`);
    for(const statement of parsed.statements) {
      if(!ts.isImportDeclaration(statement))continue;
      const specifier=statement.moduleSpecifier.text;
      if(specifier==='three'||specifier.startsWith('three/addons/'))continue;
      if(!routes.has(specifier))throw new Error(`Unresolved browser import ${url} -> ${specifier}`);
    }
  }
  for (const relative of ['build/three.module.js','build/three.core.js','examples/jsm/loaders/GLTFLoader.js','examples/jsm/utils/BufferGeometryUtils.js','examples/jsm/utils/SkeletonUtils.js','examples/jsm/geometries/RoundedBoxGeometry.js']) {
    if (!fs.existsSync(path.join(repo,'node_modules/three',relative))) throw new Error(`Missing Three module ${relative}`);
  }
  console.log(JSON.stringify({ok:true,tag,stage,candidates:Object.keys(candidates),generatedModules:[...routes.keys()].filter(p=>p.endsWith('.js')),scope:'syntax, source bindings and installed module existence only; server/browser not launched'},null,2));
} else {
  const threeRoot = path.join(repo, 'node_modules/three');
  const server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      let entry = routes.get(url.pathname);
      if (!entry && url.pathname.startsWith('/three/')) {
        const relative = decodeURIComponent(url.pathname.slice(7));
        const filename = path.resolve(threeRoot, relative);
        if (!filename.startsWith(threeRoot + path.sep) || !filename.endsWith('.js') || !(relative.startsWith('build/') || relative.startsWith('examples/jsm/'))) throw new Error('Module path rejected');
        entry = {body:fs.readFileSync(filename),type:'text/javascript'};
      }
      if (!entry) {response.writeHead(404); response.end(); return;}
      response.writeHead(200, {'Content-Type':entry.type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      response.end(entry.body);
    } catch (error) {response.writeHead(400,{'Content-Type':'text/plain'});response.end(String(error));}
  });
  server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({url:`http://127.0.0.1:${port}/?variant=${stage === 'M2' ? 'proposal' : 'baseline'}`,tag,stage,pid:process.pid,scope:provenance.scope})));
  process.on('SIGTERM',()=>server.close());
  process.on('SIGINT',()=>server.close());
}
