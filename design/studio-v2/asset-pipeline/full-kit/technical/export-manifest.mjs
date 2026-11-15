#!/usr/bin/env node
// Technical serialization helper only; does not author or modify Blender/GLB art.
import { readFileSync, writeFileSync } from 'node:fs';
import { candidateManifest } from './validate-full-kit.mjs';
const [glb, variant, stage, output] = process.argv.slice(2);
if (!glb || !variant || !stage || !output) throw new Error('Usage: node export-manifest.mjs candidate.glb baseline|proposal M1|final output.json');
writeFileSync(output, `${JSON.stringify(candidateManifest(readFileSync(glb), variant, stage), null, 2)}\n`);
