// Read-only outside this package. Run deliberately to create a dated source snapshot.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const here = path.dirname(fileURLToPath(import.meta.url));
const roots = { assistant: path.resolve(here, '../../../..'), studio: 'C:/Users/Owenc/orca/Portfolio', blender: 'C:/Program Files/Blender Foundation/Blender 5.2' };
const sha = b => createHash('sha256').update(b).digest('hex');
const previous = JSON.parse(fs.readFileSync(path.join(roots.assistant, 'design/assistant/robot/engineering/source-snapshot.json'), 'utf8'));
const sourcePaths = {
  studio: [
    'components/studio/scene/view-config.ts', 'components/studio/scene/controller.ts',
    'components/studio/scene/load-full-kit.ts', 'components/studio/scene/build-full-studio.ts',
    'package.json', 'package-lock.json', 'node_modules/three/package.json',
    'design/studio-v2/asset-pipeline/full-kit/full-kit-profile-v1.json',
    'design/studio-v2/asset-pipeline/full-kit/technical/profile-core.mjs',
    'design/studio-v2/asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v02.glb',
    'design/studio-v2/scene-coordination/m4-v02-assembled-audit.json',
    'design/studio-v2/scene-coordination/m4-v02-forecast-review.md',
    'design/studio-v2/scene-coordination/m4-v02-restoration-root-disposition.md',
    'design/studio-v2/scene-coordination/m4-v02-preview-hold-and-skill-routing.md',
    'design/studio-v2/scene-coordination/m4-v03-preparation-task.md',
    'design/studio-v2/scene-coordination/production-static-js-budget-20261115.json',
    'design/studio-v2/scene-coordination/full-kit-ledger-v01-root-disposition.md',
    'design/studio-v2/scene-coordination/m3-v03-stage-disposition-and-m4-release.md',
    '.omx/plans/test-spec-immersive-studio-v2.md',
    'design/studio-v2/browser-verification/README.md',
    '.omx/context/studio-pilot-runtime-capture-v02.json',
    '.omx/context/full-kit-m3-v03-runtime-capture-v01.json'
  ],
  assistant: [
    '.omx/plans/studio-apprentice-robot.md', 'design/assistant/robot/brief.md',
    'design/assistant/robot/engineering-constraints.md', 'design/assistant/robot/engineering/source-snapshot.json',
    'design/assistant/robot/apprentice/design-spec.md',
    'design/assistant/robot/apprentice/blockout/README.md',
    'design/assistant/robot/apprentice/blockout/build_apprentice_blockout.py',
    'design/assistant/robot/apprentice/blockout/apprentice-blockout.blend',
    'design/assistant/robot/review/blockout-v01/review.md'
  ],
  blender: ['5.2/scripts/addons_core/io_scene_gltf2/__init__.py']
};
const files = Object.entries(sourcePaths).flatMap(([root, paths]) => paths.map(relative => {
  const bytes = fs.readFileSync(path.join(roots[root], relative));
  const digest = sha(bytes);
  const old = previous.files.find(x => x.root === root && x.path === relative);
  return { root, path: relative, bytes: bytes.length, sha256: digest,
    earlierEngineeringSha256: old?.sha256 ?? null,
    changedSinceEngineeringSnapshot: old ? old.sha256 !== digest : null };
}));
const git = (root, ...args) => execFileSync('git', ['-C', roots[root], ...args], { encoding: 'utf8', windowsHide: true }).trim();
const audit = JSON.parse(fs.readFileSync(path.join(roots.studio, 'design/studio-v2/scene-coordination/m4-v02-assembled-audit.json'), 'utf8'));
const version = execFileSync(path.join(roots.blender, 'blender.exe'), ['--version'], { encoding: 'utf8', windowsHide: true }).split(/\r?\n/).slice(0,9);
const result = {
  checkedAt: new Date().toISOString(),
  scope: 'Read-only source/hash/version discovery; no scene, app, build, render or generation run.',
  roots, revisions: Object.fromEntries(['assistant','studio'].map(root => [root, { head: git(root, 'rev-parse', 'HEAD'), branch: git(root, 'branch', '--show-current') }])),
  priorSnapshotTime: previous.checkedAt, files, blenderVersionOutput: version,
  threeInstalled: JSON.parse(fs.readFileSync(path.join(roots.studio, 'node_modules/three/package.json'), 'utf8')).version,
  priorReceiptNotNewMeasurement: { compression: audit.compression.candidate, transfer: audit.transferForecast.options.A_current_images },
  arithmetic: {
    pointForecast: 644603 + 12531 + 414144 + 391334,
    pointMargin: 1500000 - 1462612,
    sensitivityForecast: Math.round(644603 * 1.15) + 12531 + 414144 + 391334,
    sensitivityMargin: 1500000 - 1559302,
    conditionalAssetTarget: 780000 + 200000 + 90000,
    assetPointOverTarget: 1071278 - 1070000,
    designMainMargin: 120 - 111, designRefreshMargin: 165 - 141,
    designWeightedTriangleMargin: 140000 - 85788,
    planningMarginsAreAllocation: false
  }
};
fs.writeFileSync(path.join(here, 'evidence-snapshot.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ checkedAt: result.checkedAt, files: files.length, revisions: result.revisions, arithmetic: result.arithmetic }, null, 2));
