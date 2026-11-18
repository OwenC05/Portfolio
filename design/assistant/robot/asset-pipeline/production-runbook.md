# Apprentice production runbook

15 November 2026. Planned work after root reconciles A/B/C; **no job or authoring run was submitted by B**. Preserve Owen's selected Higgsfield/Blender -> Meshy -> separate Blender cleanup -> GLB sequence. A owns design and root owns acceptance and spending authority. An unavailable host is a recorded prerequisite, not permission to replace tools or take over a scene.

## 1. Freeze the concept input

Required: A's repaired version, independent review disposition, root/Owen concept decision, exact names/pivots, neutral pose, eye method, source-mark slots, final material intent and swept bounds. v01 is REVISE; its master has 13,132 reported unoptimised triangles and its card geometry/timeline are demonstrations. Do not feed the stock reference with its watermark directly into final asset production. Use A's own approved clean rendered object views.

Concept can come from the already authored isolated local Higgsfield use Blender scene. If a hosted 3D Jutsu project is chosen later, read its current revision/sceneSequence, inspect and render there; save project/operation/artifact IDs, source and render hashes. Custom Meshy GLB return into hosted Jutsu is unsupported. The documented hosted API is 5.2 and has a roughly five-minute operation deadline; that is neither a timing promise nor an account credit quote. Optional AI image-angle/video calls spend credits and require their own explicit selected settings and live quote. No such enhancement is needed just to use Blender renders.

Inputs to Meshy: one clean silhouette-readable view for single-image, or 1-4 consistent views of the **same neutral object** for multi-image. Use front/three-quarter/side/back as appropriate, with consistent proportions/materials and no different gesture states mixed together. Render the complete shape, deliberate gaps and fin attachments against a simple background; avoid UI labels, card text, grid/sheet duplicates, lights/cameras or room objects. Keep layered `.blend` as the authoritative design rather than trusting generated unseen geometry. For the dynamic eye route, A supplies a plain visor or explicitly marked removable eye guide; generated luminous eye paint is not final expressive geometry.

## 2. Choose and quote the exact Meshy request

The current connector schema and [official model guidance](https://docs.meshy.ai/en/api/models) distinguish a bounded game asset from multi-view reconstruction. Prefer discussing single-image Smart Topology (`meshy-t2.5`, or `meshy-t2` when its separated-part behavior is useful) against the multi-image quality tradeoff. This is a proposed tool setting, not a selected model or guaranteed named articulation. Neither model replaces pivot cleanup. No humanoid rig/T-pose or auto-rig request is appropriate for this floating head/body/fins design.

| Proposed option, not submitted | Current public API price | Implication |
| --- | ---: | --- |
| Single-image `meshy-t2.5` or `meshy-t2`, `model_type:smart-topology`, no textures | 5 credits | Rebuild flat A-owned materials/eyes in Blender; choose only if A accepts this production path |
| Same with 2K texture | 15 credits | Candidate texture resolution, **not** permission to ship a 2K map |
| Multi-image `meshy-7.1`, no textures / 2K textures | 20 / 30 credits | 1-4 views; Smart Topology is not available on this endpoint |
| Optional remesh / UV unwrap | 5 each | Separate task, only if required and quoted; not automatic retries |

Prices checked against [Meshy pricing](https://docs.meshy.ai/en/api/pricing) on 15 November. Balance read returned 70, but no portion is allocated to this task. No automatic use of all available credits, monthly renewal or unlimited/free-generation assumption. No monetary exchange rate was inferred. Connector descriptions estimate single-image generation around 2-3 minutes; treat that only as a service estimate. Queue time, cleanup labour and total delivery time remain unknown. Record actual submission/completion timestamps later; do not present these estimates as measured duration.

The reviewed request skeleton for **single-image geometry only** is below. It is pseudodata, not an executable submission: replace `TARGET` with an approved measured face target and the path with the approved input; do not send unresolved values.

```json
{
  "file_path": "<absolute approved render path>",
  "model_type": "smart-topology",
  "ai_model": "meshy-t2.5",
  "target_polycount": "TARGET",
  "topology": "triangle",
  "should_texture": false,
  "auto_size": false,
  "target_formats": ["glb"],
  "response_format": "json"
}
```

Current [image API](https://docs.meshy.ai/en/api/image-to-3d) limits the target to 100-30,000 for t2.5 and 100-15,000 for t2. Targets are approximate faces, never the export allocation. Smart Topology accepts triangle topology, ignores its remesh options, and rejects some standard-only image options: omit `image_enhancement`, `remove_lighting`, `pose_mode`, deprecated `symmetry_mode` and unused standard-model controls. A textured proposal adds explicit compatible `texture_model`/`texture_resolution`/`should_texture`; N1 means 2K base colour only, no PBR-map request. Multi-image requires a different schema/request and a separately quoted budget; do not silently switch when single-image fails. Always reread the actual schema at submission because provider options can change.

Root presents the concrete selected request, input hashes, per-job and aggregate cost, retry limit and cleanup route to resolve any still-missing paid authority. Preparation does not authorize a create call. Do not invoke the skill's install/setup instructions merely because they were read for readiness.

## 3. Submit once, preserve receipts

Under later paid-job authority, call the selected create tool once and immediately save a redacted receipt with candidate ID, tool name, exact settings, input hashes, task ID/type and UTC submission time. Version directories should follow `candidates/apprentice-<candidate>-vNN/` under the newly assigned production ownership, with `inputs/`, `provider/`, `source/`, `exports/`, `validation/` and `renders/`. These directories are a proposed layout, not files claimed to exist.

Poll the returned ID through `meshy_get_task_status`; use `wait:false` for bounded checks or the documented wait. A timeout is not task failure or permission to recreate. After ambiguous create/network/5xx, list tasks of the exact task type and reconcile time/input/config before any retry. A failed job gets its own retained receipt and explicit next decision. A retry is a new version, not overwrite of the rejected candidate.

On SUCCEEDED, download GLB with `meshy_download_model` using the returned real task type and a new `save_to` path. Record download time, SHA-256 and raw bytes immediately; save source outputs before provider URLs expire. Keep signed URLs and credentials out of Git. If no task ID or output URL can be reconciled, stop that paid branch and report the exact uncertainty; do not issue a duplicate. No provider retry budget is invented here.

## 4. Separate local Blender cleanup

Prerequisites: a new assigned process/resource slot, version/hash of the importer/exporter, read-only input pair and output namespace. Use the installed 5.2.3 LTS executable from [readiness.md](readiness.md). A's running background server stays untouched. The planned command shape is:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --disable-autoexec --python-exit-code 1 --python '<reviewed cleanup-export.py>' -- --input '<downloaded.glb>' --output '<new candidate directory>'
```

The cleanup script is a **future production deliverable**, not an existing tested executable. It must constrain all writes to the assigned candidate directory and refuse unknown input hashes or a reused output version. Import with `bpy.ops.import_scene.gltf(filepath=input_path)` in the clean process. Save a new editable `.blend`; never open/overwrite the Studio or A's active source. Preserve provider raw bytes.

Inspect object names, connected islands, material slots, triangulated evaluated counts, normals, transforms, UVs, image sizes and neutral silhouette. Delete generated background/supports and hidden detail; keep an audit of changes. Do not confuse disconnected mesh islands with useful articulation. For fused output:

1. Separate existing loose islands if they correspond to approved parts; otherwise select faces at intended part boundaries, split them into named objects, repair open seams/inner caps and remove bridges between head/body/fins/tray. Recheck geometry and normals after each split.
2. Rebuild hidden attachment surfaces and hinges locally, establish A's origins, then parent with world placement preserved and verify local neutral transforms. Decimate/re-topologise each rigid region independently; do not collapse gaps, fin silhouettes, eye rings or tray openings.
3. If separation requires destroying the silhouette or excessive repair, preserve that rejected candidate and make the fallback concrete: either one specifically quoted new Meshy input/version, or direct Blender reconstruction of the simple masses from A's design. Explain the quality/cost evidence to root/Owen before replacing the chosen Meshy step. Do not chain paid remesh/auto-split/rig tools speculatively. Meshy's print-oriented auto-split does not establish animation pivots.
4. Remove baked eye/mark decoration where dynamic geometry replaces it. Rebuild eyes/lids only against A's selected technique. Build runtime marker slots/pose metadata without exporting the example cards. Consolidate material duplicates only within intended visual and resource boundaries. Bake necessary procedural appearance to approved embedded images, not lights or runtime state.

## 5. Export exact neutral variant

Before export: select **only** the approved robot root and descendants, remove timeline effects by restoring the measured neutral pose, and validate that all transforms and dimensions match the frozen manifest. Do not export `APR_sheet_*`, environment, cameras, lights, source cards or timeline copies. Apply triangulation/mesh modifiers in the candidate copy as reviewed; preserve editable source and pivots. No automatic joining/flattening/centering.

These option names were checked in the installed Blender exporter source. The future script must check RNA availability before calling; it must not silently drop unsupported options:

```python
bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format='GLB', use_selection=True, use_active_scene=True,
    export_yup=True, export_animations=False, export_skins=False,
    export_morph=False, export_cameras=False, export_lights=False,
    export_draco_mesh_compression_enable=False,
    export_meshopt_compression_enable=False,
    export_materials='EXPORT', export_image_format='AUTO',
    export_extras=True, export_apply=False,
)
```

`AUTO` only preserves already approved PNG/JPEG inputs; validate exported MIME and embedded bufferViews rather than assuming the switch enforces the profile. `export_apply:false` assumes intentional modifiers were handled before this step. Populate approved extras from an allowlist, never arbitrary private custom properties. Record every effective setting and local addon-source hash. If A/C choose a clip or morph variant, freeze different settings/profile before export; do not turn on all animations from the demonstration timeline.

## 6. Validate, render and hand off

Recompute the manifest from actual GLB bytes; validate against the separate frozen robot profile, including all slots and local bounds. Decode embedded images and then verify browser texture slots. Compare imported neutral pose and hinge sweeps against source; sample transition extrema with A's easing, not just endpoints. Count exact raw/encoded sizes, unique/placed/pass-weighted triangles and primitives. No full-room safety cap becomes a robot budget.

Independent Claude review checks both eyes at frontal/three-quarter/actual room angles, no open-eye seam, visible head/body and body/tray gaps, fin direction and 0/1/4 readable marks. Root/C validate actual selected room/camera, 320/390/desktop/DPR, project visibility/picking, finite/reduced-motion and lifecycle behavior. Stand-in renders, parser passes and master triangle counts do not establish these gates.

Deliver immutable source/script/export/manifest/profile/receipt hashes, failed-version history, exact tools/settings, offline validation and actual-browser evidence linked to the same candidate, plus unresolved exceptions. Root and the Studio owner allocate combined capacity using [budget-and-validation.md](budget-and-validation.md) before final acceptance. No production upload/deploy, shared-room mutation or assumed credit allowance follows from this runbook.
