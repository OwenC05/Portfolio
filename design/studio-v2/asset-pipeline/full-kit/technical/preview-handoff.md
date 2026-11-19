# Isolated M1 preview handoff

The public signatures are frozen and implemented:

```ts
const asset = await loadFullKit(signal);
try {
  const model = createFullStudio(resources, asset.root);
  // Root-owned preview measures/renders model.scene and uses model.targets/occluders.
} catch (error) {
  asset.dispose();
  resources.dispose();
  throw error;
}
// Teardown must release both owners independently, even if one release throws.
```

`createFullStudio` is Claude-owned. It calls `bindFullKit(resources, root)` **before** replacing dusk appearance, then returns the existing `StudioModel` shape. Dusk stays the same mesh in returned blockers. Imported contacts already have renderOrder 1, transparent depthWrite false and no shadows. Do not add procedural contacts, construct a procedural room, or run `instanceStaticMeshes` over imports.

`load-full-kit.ts` currently selects the uninstalled synthetic fixture internally. A root-owned isolated preview can compile a virtual copy of that module with exactly these two candidate selection substitutions; do not add a query parameter or new public loader arguments:

1. Replace its `fixtureManifest` import with `@/design/studio-v2/asset-pipeline/full-kit/manifests/studio-full-kit-m1-baseline-v02.manifest.json` (or proposal counterpart).
2. Replace `candidate.url` with the root preview's route serving **exactly** the corresponding `exports/studio-full-kit-m1-baseline-v02.glb` (or proposal counterpart).

The preview route is root-owned and is not a public installation. Candidate URL and manifest must move together; the loader rejects a hash mismatch before parsing. Baseline SHA256: `04994845f62236c6230dce1ba8af7d9811e21fc1e45c0fff6a89be7f06777093`; proposal SHA256: `bdc997b45917be0c72480af9738362e9940e5159b07781eac2bfa6b86b01fe76`.

Do not select a production FOV/geometry from a validator result. The full builder supplies appearance; root owns same-pose preview and decision. `bindFullKit` accepts only a fresh loader-issued root and may be called once. If binding/assembly fails, dispose the two owners and start a fresh load.

Actual installed r187 parsed both exact candidates in CPU checks. Those checks deliberately replace `createImageBitmap`/Canvas2D with tracked boundary stubs, proving parser allocations, geometry, required slot rejection and disposal, not browser decoding or rendered appearance. Separate `decode-images.py` evidence uses actual installed Pillow for the five embedded PNG payloads; root browser decode/WebGL remains required.
