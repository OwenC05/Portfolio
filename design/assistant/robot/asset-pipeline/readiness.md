# Apprentice authoring readiness

15 November 2026. Package B, preparation only. Exact file hashes and the capture time are in [evidence-snapshot.json](evidence-snapshot.json). No generation, import, render, scene mutation, installation or server change was performed. A `blender --version` process exited without opening a project; the active authoring process was not addressed.

## Checked surfaces

| Surface | Fresh evidence | Meaning / remaining gap |
| --- | --- | --- |
| Windows Blender | `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe --version`: **5.2.3 LTS**, build hash `e13b728c6880`, release branch `blender-v5.2-release`, built 2026-10-22 01:37:16 | A local executable is usable for version discovery. It is not on PATH. Rendering, import and export have not been exercised by B. |
| Active Blender | `Get-Process blender`: PID **27384**, same executable | A process exists. Coordinator identifies the background authoring session as A-owned. No attach, scene query, file open, shutdown or signal sent. PID is a dated observation, not ownership proof. |
| Cloud connected-app bridge | `mcp__blender.get_host_status`: `blr:false`, `3d_bs:false` (other host flags also false) | This bridge cannot presently drive local Blender. It is distinct from A's background server. |
| Higgsfield use Blender local server | Fresh `/use-blender` instructions describe stdio `fnf-blender-mcp`, separate in-memory scene per MCP session. No `bl_health`, `bl_open_project` or local importer tool is exposed to this worker | A's [blockout passport](../apprentice/blockout/README.md) reports `bl_health` 5.2.3 and 25 renders; that is A's receipt, not a B health check. Server package version, registration and worker access remain unverified. Do not reconnect or reinstall over A. |
| Hosted 3D Jutsu | `/3d-jutsu` instructions successfully read; `scene_builder_3d_*` tools are exposed; documented headless `bpy` API **5.2** | Service documentation, not an executed runtime-version probe. No project selected, queried or created. Custom/Meshy GLB import is **unsupported**: imports must use catalog search/import arguments. No network, embedded mesh bytes or Python download workaround. |
| Meshy connector | Read-only `meshy_check_balance` succeeded; image/multi-image/status/download/remesh schemas exposed | Authenticated read works. Generation access, completion time and quality are untested. Balance observed **70 credits = 65 monthly + 5 permanent**, reset 2026-12-01; this is neither an allowance nor permission to spend, and can change concurrently. No history/private media enumerated. |
| CLI | `orca.exe` file version **1.4.259.0**; Node **24.21.0**; `meshy`, `higgsfield`, `blender` not resolved by `Get-Command` | Meshy/Higgsfield connector availability does not imply a CLI is installed. WindowsApps `python.exe` is an alias, not verified Python readiness. No package installation is needed for this report. |
| Local exporter/importer source | Installed `5.2/scripts/addons_core/io_scene_gltf2/__init__.py` contains `import_scene.gltf` and `export_scene.gltf`; selected-object/Y-up/animation/skin/morph/light/camera/compression options inspected | Exact source is hash-pinned in snapshot. Operator execution and external-image handling await the separate cleanup process. Do not infer hosted imports from local Blender capability. |

The installed `threejs-asset-pipeline` and `threejs-loaders` skills informed measurement and ownership only. They target r186; this repository declares/installs r187. Generic instructions to fit, flatten, join, create a render loop, add lights or install compression decoders do not override this task or the existing room contract.

## Safe isolated route

1. Root assigns an exact new candidate directory, author and bounded resource slot. Do not infer spare resources from an installed executable or an idle UI; the main Studio's M4 receipts currently hold resource-heavy authoring. Do not stop another process to free resources.
2. A hands off an immutable copy of the approved robot-only `.blend`, script and input views with hashes. B's future cleanup lane reads that copy, never A's live file or the main room `.blend`.
3. Preferred local execution is a **new** `blender.exe --background --factory-startup --disable-autoexec --python-exit-code 1 --python <reviewed-cleanup-script> -- ...` process. The script imports the versioned downloaded GLB with `bpy.ops.import_scene.gltf(filepath=...)`, or opens the assigned robot-only copy with auto-execution disabled, and writes only a new candidate directory. It asserts the expected input hashes, allowed output root and collection before mutation. See [production-runbook.md](production-runbook.md) for export settings. This route is planned, not exercised.
4. For a background helper use PowerShell `Start-Process -WindowStyle Hidden` with explicit argument array, logs inside that candidate directory and `-PassThru`; record its PID and exit code. Direct execution through the existing terminal is also suitable. No extra terminal window or shared-app takeover.
5. If root prefers the Higgsfield local server, root must expose a **separate** supported MCP session and obtain its own `bl_health` identity before authoring. The cloud bridge's `blr:false` cannot verify or access A's local server. No reinstall is justified by that flag.

Root handoff: executable/version evidence is sufficient to plan isolated cleanup; missing checks are fresh slot/resource ownership, independent process health, installed importer/exporter execution, and the approved candidate/profile. Hosted Jutsu can remain the concept source, but the Meshy result must go to local Blender. These are production prerequisites, not failure of preparation.

## Source references

- Live tool instructions: `get_preset_instructions('/3d-jutsu')`, `get_preset_instructions('/use-blender')`; schemas summarized in [provider-schema-notes.json](provider-schema-notes.json).
- [Official Blender glTF manual](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html), retrieved through Context7: Y-up export and object-transform animation support; arbitrary material/light animation is not part of that export path. The older `addons/import_export/scene_gltf2.html` URL failed to fetch; local installed source supplies exact option names.
- [Meshy models](https://docs.meshy.ai/en/api/models), [pricing](https://docs.meshy.ai/en/api/pricing), [image API](https://docs.meshy.ai/en/api/image-to-3d): checked 15 November, recheck at quote time.

Worker model/effort: not supplied as dispatch/argv evidence in this task; no value inferred.
