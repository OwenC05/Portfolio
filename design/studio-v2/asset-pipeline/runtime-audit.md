# Asset pipeline runtime audit

Audited 2026-11-14 at approximately 23:00 UTC. Technical readiness only; design and asset authoring remain with actual Claude. No product files, scenes, servers, browser sessions, provider accounts or generation jobs were changed.

## Blender runtime and connection

- Installed executable: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`.
- Executing `blender.exe --version` returned **Blender 5.2.3 LTS**, build hash `e13b728c6880`, build date `2026-10-22`. Exit code 0. This proves executable startup, not rendering or export success.
- `Get-CimInstance Win32_Process -Filter "name = 'blender.exe'"` and `Get-Process blender -ErrorAction SilentlyContinue` returned no Blender processes before diagnostics. No active local document or window title was exposed.
- `mcp__blender__get_host_status({})` returned `blr:false` and text **Blender: not connected**. The other reported creative hosts were also disconnected. Blender tools being listed is not live connection proof. No scene query was issued against the disconnected host.
- Do not infer that a remotely running or subsequently opened document is safe to replace. Recheck host and document identity immediately before any future live scene mutation. If using the connector, its documented recovery is opening Blender's Higgsfield panel and connecting; that recovery was not attempted here.

## Isolated authoring/export route

Use a separate local Blender background process with factory startup for the future approved authoring script, instead of clearing or opening a file through the implicit connected host. Local `--help` confirms `--background`, `--factory-startup` (skips the user's startup.blend), `--disable-autoexec`, and `--python-exit-code`.

Candidate invocation, **not executed**:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --disable-autoexec --python-exit-code 1 --python '<absolute path to approved authoring script>'
```

Run through the existing execution tool; any future Start-Process helper must use `-WindowStyle Hidden`. The script should use absolute repository-scoped paths, refuse accidental overwrite of existing deliverables, save only its own new scene, and report its actual output paths. A separate process isolates Blender data from another open process; it does not isolate shared GPU resources.

Candidate editable file: `C:\Users\Owenc\orca\Portfolio\design\studio-v2\asset-pipeline\studio-v2.blend`.

Candidate review export: `C:\Users\Owenc\orca\Portfolio\design\studio-v2\asset-pipeline\exports\studio-v2.glb`.

Candidate approved web artifact: `C:\Users\Owenc\orca\Portfolio\public\studio\studio-v2.glb`, served as `/studio/studio-v2.glb`. None of these artifacts was created or exported in this audit.

The installed exporter source exists at `C:\Program Files\Blender Foundation\Blender 5.2\5.2\scripts\addons_core\io_scene_gltf2\__init__.py`: GLB format at line 327, Draco switch at 462, materials at 522, and `export_yup` at 673 with default true. Source availability is not an executed exporter test. A future export should use glTF 2.0 GLB, normal PNG/JPEG textures, and no Draco/Meshopt/KTX2 compression until decoder delivery is implemented and tested.

## Existing Three.js integration surface

- Root package and installed package both resolve `three` **0.187.0**. Node import smoke check returned `{"revision":"187","loader":"function","parseAsync":"function"}` for `three/addons/loaders/GLTFLoader.js`; no dependency installation is required for that importer.
- No GLTFLoader/DRACOLoader/KTX2Loader/Meshopt loader call exists in `components`, `lib`, or `app` at audit time. `public` currently contains only favicon.ico. Thus GLB support is available in the dependency but is **not integrated** into this application.
- `components/studio/scene/controller.ts:374` calls synchronous `createStudio(resources)`. Imported assets will require an explicit asynchronous readiness/failure path, safe disposal if loading finishes after unmount, and a first visible render before ready is reported. Existing controller behavior already handles render failure and disposal; preserve it.
- `components/studio/scene/resources.ts` owns geometry, material, texture and instance disposal. Imported geometries/materials/textures must enter this ownership model; importing a scene alone does not register those resources. Loader image-bitmap ownership also needs consideration when closing downloaded image resources.
- `components/studio/scene/types.ts` requires scene, targets and occluders. `build-studio.ts:281` marks interactive surfaces/borders and attaches `projectId`; `picking.ts:116` resolves targets and opaque occluders. A GLB needs an explicit adapter preserving these project mappings, border materials and occlusion behavior; replacing the scene wholesale would not provide them.
- Static batching in `resources.ts` handles repeated ordinary meshes. Do not apply it blindly to skinned, animated or morph-target assets; its current logic was written for the procedural static scene.
- `view-config.ts` documents **two world units per metre**, a Y-up view and heading zero toward -Z. Blender is Z-up; the installed glTF exporter defaults to Y-up conversion. The importing adapter must reconcile metre-authored assets with this existing scene scale and approved origin/placement without adding a second axis conversion.
- Renderer uses sRGB output, ACES filmic tone mapping with exposure 1.2, and manually invalidated PCF shadows (`controller.ts:367-373`). Imported lighting/materials must be checked in that actual renderer. Loading a GLB does not reproduce a Blender render automatically. Animated geometry would additionally require frame scheduling and shadow invalidation; current rendering is on demand.
- Installed `GLTFLoader.js:481` rejects asset versions below glTF 2; line 1532 requires KTX2Loader for KTX2 textures, 1675 requires MeshoptDecoder for required meshopt compression, and 2004 requires DRACOLoader for Draco geometry. No decoder is configured in current application code.

## Remaining proof and blockers

1. Live Blender connector is disconnected; there is no verified active document. The isolated CLI route avoids relying on that connection but has not yet run a build/export script.
2. No approved asset, .blend, export or GLB round-trip exists from this audit. Geometry counts, texture sizes, materials, bounds, compression extensions and browser performance remain unmeasured.
3. Application import/lifecycle/resource/picking integration is still implementation work after asset approval, not an existing supported app feature.
4. Higgsfield and Meshy generation, balance, upload, purchase and credential checks were deliberately left to the lead. This document establishes no provider readiness.

Verification was limited to process inspection, connector status, installed source inspection, Blender version/help and a Node module import. No render, image generation, model generation, upload, package installation, server start/stop or scene mutation occurred.
