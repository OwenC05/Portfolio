# M1 standalone capture harness

Prepared technical harness, revised to actual loader/binder/builder assembly. No server, browser, Blender, build or production change was made by this worker. The v01 candidates were rejected for inverted binding UVs; do not capture or accept them. The default tag is v02 and can be changed explicitly for a later version with both art and recomputed technical manifests.

## Root launch and scope

From the repository, first run:

```powershell
node .omx/context/full-kit-m1-preview/server.mjs --check --tag v02
```

Then root can run the lightweight server in its existing execution surface:

```powershell
node .omx/context/full-kit-m1-preview/server.mjs --port 4182 --tag v02
```

This binds 127.0.0.1 only and refuses the existing preview port4181. If using PowerShell Start-Process, use -WindowStyle Hidden, -PassThru and explicit redirected log files under this harness directory; retain that exact returned PID for later shutdown. No separate terminal window is needed. The server prints its PID and URL. Stop only that owned process after captures. No node_modules, dependencies, assets or application files are written; .next is untouched.

- Baseline: `http://127.0.0.1:4182/?variant=baseline`.
- Proposal: `http://127.0.0.1:4182/?variant=proposal&fov=74` on a mobile viewport.
- Additional authored mobile candidates: `fov=70` or `fov=76` at the same proposal home yaw−14/pitch−7. A FOV override on desktop or baseline is rejected. Use `?variant=proposal` for desktop58/home−4/−6.
- Baseline mobile64/home−13/−8; mobile means width≤640 or aspect<0.9, matching the controller.
- Suggested root matrix inputs, without a verdict:1440×900,1024×768,390×844,320×844,320×568. DPR1 throughout; create one context/page at a time and close it before the next.

## Capture contract

Wait for `html[data-status="ready"]`; an error sets `html[data-status="error"]` and `window.m1PreviewError`. Collect pageerror/console/response failures. Then:

```js
const home = await page.evaluate(() => window.m1Preview.snapshot());
await page.screenshot({ path: '.../home.png' });
const rightUp = await page.evaluate(() => window.m1Preview.setPose({ yaw: 58, pitch: 12 }));
await page.screenshot({ path: '.../right-up.png' });
```

Other bounded poses include right-down58/−16 and music44/−8. These are explicit harness pose injection, NOT trusted product input/interaction acceptance. API returns exact camera, projected target vertices/extents, viewport/canvas/DPR, renderer counters, initial-shadow counters, source and GLB hashes, full manifests and scope. Persist snapshot alongside each image, then hash the saved image separately. `/provenance.json` is the launch-time source snapshot. Server verifies each GLB against both manifests and the actual loader hashes received bytes again. Compare hashes to S's expected v02 handoff before capture. Changing source/assets requires a new server process; assets and compiled local modules are read and held at startup. Snapshot contains full manifests; save it without printing the full payload into chat.

## Appearance and evidence limits

This revision calls actual `loadFullKit(signal)` and then actual Claude `createFullStudio(resources, asset.root)`, which calls the actual `bindFullKit`. The loader creates and checks its own identity certificate; the harness does not forge or bypass it. Startup enforces builder5A4E8296E04D66CFEAEDF59BEDEE8C633B378C84126DE52B78EAABE421C0F02F and binder0EE8BBE6E0FB83AB4BF219343655C4260A8F5193F5624DC69FB802634A2294EB. Exact CC76055 controller renderer settings are still extracted and hash-enforced. No procedural room is constructed. All lighting, materials, dusk/screen content and background come from these sources; the harness only applies the exact existing controller unselected border color after binding. The actual Claude builder labels its lights provisional, so actual assembly is not final art acceptance.

The server snapshots/compiles the actual loader, builder, binder, types/resources/textures/view-config, project IDs and browser-safe profile-core. Explicit relative and @/ import rewrites map them to local ESM routes; profile/inventory/manifest JSON becomes ESM default exports. Compiled-module hashes and source hashes are in provenance. No product file is edited. No raw-loader compatibility mode is retained.

The only loader source-statement replacement in the in-memory compile snapshot is:

```js
// Original:
const candidate = { url: '/studio/full-kit-uninstalled-synthetic-baseline.glb', manifest: fixtureManifest };
// Harness:
const candidate = { url: '/asset/' + (new URLSearchParams(location.search).get('variant') ?? 'baseline') + '.glb', manifest: fixtureManifest };
```

The fixtureManifest import is explicitly redirected to `/data/candidate-manifest.js`, which selects the matching frozen `technical/evidence/m1-baseline-v02.manifest.json` or `m1-proposal-v02.manifest.json` from the same variant query. Their bytes/hashes remain in provenance alongside the art manifest. All byte inspection, checkManifest, parser allocation ownership, actual decode, loaded-scene validation, certificate issuance, placement and disposal run unchanged in the real loader.

This isolated assembly does not waive production integration, unavailable/failure handling, interaction, UI overlap, performance or lifecycle gates. It supplies no HTML overlays; screenshot composition must be compared with actual production UI later. The real loader owns imported placeholders/resources and applies exact manifest transparency/order. The real SceneResources owns bound runtime materials/textures. The harness aborts pending load and calls both owners plus light-shadow, renderer and context cleanup on pagehide/dispose. Closing the isolated context after each capture remains required; no production lifecycle claim is made.

Mechanical verification: both scripts pass `node --check`; `server.mjs --check --tag v02` passes16 generated module syntax checks, all local import-route resolutions, accepted source bindings, both GLB/art+technical manifest hash checks and installed Three0.187 module existence. No actual renderer or browser has run in this worker.

Root selects images and routes them to actual Claude for visual critique. This task stops at prepared, mechanically checked harness and handoff.
