#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectFullKit, checkManifest, requireFullKit, canonical, checkInventoryIdentity } from './profile-core.mjs';

export const profileBytes = readFileSync(new URL('../full-kit-profile-v1.json', import.meta.url));
export const inventoryBytes = readFileSync(new URL('../asset-inventory.json', import.meta.url));
export const profile = JSON.parse(profileBytes);
export const inventory = JSON.parse(inventoryBytes);
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function candidateManifest(bytes, variant, stage) {
  const inspection = inspectFullKit(bytes, profile, inventory, variant);
  return { profileId: profile.profileId, variant, stage, glbSha256: sha256(bytes), artInventorySha256: sha256(inventoryBytes), ...inspection.snapshot };
}

export function validateFullKit(bytes, manifest) {
  const report = { valid: false, profileId: profile.profileId, profileSha256: sha256(profileBytes), glbSha256: sha256(bytes), errors: [],
    deferred: ['Actual browser PNG/JPEG decode', 'Runtime renderer first-refresh/settled draws and triangles', 'Scene JS plus assets transfer', 'Root visual gate and independent review'] };
  try {
    requireFullKit(manifest.glbSha256 === sha256(bytes), 'GLB hash mismatch');
    requireFullKit(manifest.artInventorySha256 === sha256(inventoryBytes), 'art inventory hash mismatch');
    checkInventoryIdentity(sha256(canonical(inventory)));
    const inspection = inspectFullKit(bytes, profile, inventory, manifest.variant);
    checkManifest(manifest, inspection, profile, inventory);
    report.valid = true;
    report.metrics = { ...inspection.snapshot.counts, rawBytes: bytes.length, gzipBytesEstimate: gzipSync(bytes).length, brotliBytesEstimate: brotliCompressSync(bytes).length, textureEncodedBytes: inspection.images.reduce((sum, image) => sum + image.bytes, 0), rawRgbaBytesBeforeMipmaps: inspection.snapshot.counts.imagePixels * 4 };
    report.boundsGltfMetres = inspection.snapshot.boundsGltfMetres;
  } catch (error) { report.errors.push(error.message); }
  return report;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [glb, manifestPath, flag, output] = process.argv.slice(2);
  if (!glb || !manifestPath || (flag && (flag !== '--report' || !output)) || process.argv.length > 6) throw new Error('Usage: node validate-full-kit.mjs candidate.glb manifest.json [--report report.json]');
  const report = validateFullKit(readFileSync(glb), JSON.parse(readFileSync(manifestPath, 'utf8')));
  const text = `${JSON.stringify(report, null, 2)}\n`;
  if (output) writeFileSync(output, text);
  process.stdout.write(text);
  process.exitCode = report.valid ? 0 : 1;
}
