# Selected A: concrete Meshy preflight

16 November 2026. **Recommend one geometry-only Meshy T2.5 candidate from the full canonical front image, quoted at 5 API credits.** No job was submitted. Owen's selected route continues through Meshy, then separate local Blender cleanup. The [root build decisions](../../selected-a-build-decisions.md) carry the independent [visual-build PASS](../../review/selected-a-v01/review.md); no repeated artist approval or extra artwork is needed.

## Exact candidate

| Item | Proposed request |
| --- | --- |
| Input | `C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/higgsfield-concepts/selected-a-v01/outputs/02-front.png` |
| SHA-256 | `9b94d861e18d5c95f439847e30a81aa7a036110f0105585a8914126bfc9c8cc7` |
| Verified file | PNG, 1792 × 2240, 4,037,510 bytes |
| Endpoint | `POST https://api.meshy.ai/openapi/v1/image-to-3d` |
| Model | `model_type: smart-topology`, `ai_model: meshy-t2.5` |
| Output | Triangle topology; approximate target **8,000** faces; GLB only; textures/PBR maps/automatic real-world sizing off |
| Spending boundary | One candidate, **zero automatic create retries or regeneration**; no remesh, retexture, rig or image job bundled |
| Current quote | **5 API credits**, public pricing checked 16 November; actual charged amount pending |
| Current account balance | **Unknown in this worker**; the 15 November balance of 70 in historical B is not fresh, an allocation, or necessarily the same billing surface |

[Request example](request.example.json) separates metadata from the REST body. The body template is **not directly executable** while `image_url` is null. [prepare-request.mjs](prepare-request.mjs) verifies the pinned PNG and materializes only the exact REST body with its base64 data URI:

```powershell
node design/assistant/robot/asset-pipeline/selected-a-v01/prepare-request.mjs --check
# Future production preparation only; writes a fresh local JSON, sends nothing:
node design/assistant/robot/asset-pipeline/selected-a-v01/prepare-request.mjs --write
```

The [current image API](https://docs.meshy.ai/en/api/image-to-3d) verifies these fields, PNG/data-URI input and T2.5's 100–30,000 target range. Remesh controls are ignored for Smart Topology; omit them, pose controls, texture options, deprecated symmetry controls and unsupported image-enhancement/lighting-removal fields. This payload has no humanoid-rig assumption. **8,000 is a candidate-generation setting**, chosen for several broad curved masses plus expendable details; it is neither a ceiling nor approved room capacity.

## Why this input and model

I inspected the actual hero and front. Both show complete separate masses, a plain background and an empty tray. The front has the reviewed neutral level head, symmetric hands and clearer centered gaze. Full-image input is practical: discard generated expression/detail geometry during cleanup. No stripped input is required merely because those expendable details appear. The hero has no demonstrated provider advantage sufficient to outweigh its tilt, gaze and stronger reflections.

T2.5 favours silhouette/detail fidelity; T2's documented separate-part behaviour is useful but does not guarantee semantic names, pivots or articulation. T2.5 has a documented median mesh time of 15 seconds, **not** measured job/queue/cleanup time. Separate parts must still be inspected. [Model evidence](https://docs.meshy.ai/en/api/models).

Multi-image cannot use Smart Topology. The only visually permitted pair is front + side: it adds depth evidence but also the side's transparent dome, rear ribbon and overlapping hand. The review already settles depth and assigns those conflicts to native repair, so the pair adds insufficient value for this candidate. Multi-image 6-lite mesh-only costs 5 credits; 6/7.1 costs 20. Four staged views are not four consistent observations: exclude back entirely and never combine tilted hero with front. [Multi-image requirements](https://docs.meshy.ai/en/api/multi-image-to-3d), [current prices](https://docs.meshy.ai/en/api/pricing).

If canonical authority changes **before submission**, substitute the newly pinned input in a new request version and rerun local preparation; retain one candidate total. Hero is the existing alternative only with a concrete provider reason. Front + side requires a standard-model request and updated quote, not a silent fallback or additional job. No regeneration is planned.

## Native cleanup and proposed binding changes

[profile.example.json](profile.example.json) is a **PROPOSED A contract**, with 22 semantic nodes and 10 independently controlled nodes. It preserves D1 and historical B/v02 unchanged. Meshy supplies a candidate head shell, teardrop body and two mitten masses; Blender repairs/separates these and rebuilds precision surfaces:

| Root decision | Cleanup/binding consequence |
| --- | --- |
| 1 Head | Level stretched ball, about 1.1:1 width:height and 1:1 depth:height; head pivot at volume centre |
| 2 Seam | One coronal brass ring over crown/under chin, behind face; plain back |
| 3 Face | Curved opaque inset dark panel and thin rim; remove glass/dome/cavity |
| 4 Eyes | Separate warm discs, pupils and pupil-child highlights; rest gaze centered or slightly high |
| 5 Lids | Independent soft lower lids, roughly one-fifth rest occlusion; no upper lid/brow |
| 6 Bookmark | Left-crown outward post, rigid notched red ribbon on outer side; solid thickness, no sway |
| 7 Body | Native collar and solid slightly domed brass cap; no dark opening/recess |
| 8 Finish | Plain warm-white material, soft sheen; remove photographic reflections/craze and generated textures |
| 9 Tray | Rebuild level shallow brass dish about 0.9 head width, empty; glow separate from geometry/result count |
| 10 Separation | Maintain gaps between five masses; split fused bridges and reconstruct only damaged local surfaces |

Pupils translate within authored eye-surface limits; highlights inherit pupil transforms without an extra moving channel. Imported eye geometry belongs to the private asset owner; the existing presentation controller owns gaze/lid transforms and emission. Tray emission is independently bound. Runtime creates only 0–4 real current-source marks from the same HTML snapshot; no baked cards or demo clips. Motion remains finite, reduced motion snaps, suspended scenes do not replay, and assistant text generation remains disabled.

Use B's metre basis conversion `[X,Y,Z] -> [X,Z,-Y]`, root at the head/body gap, one external ×2 room scale, and **no additional floor offset**. No world placement is baked. Numeric dimensions/pivots, pose travel, bounds, palette/PBR numbers, exported counts, byte sizes and resource allocation remain null. Do not reuse v02's bounds, eye spacing or eight-node inventory.

## Isolated staging and stop conditions

Current read-only discovery found `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe` (113,041,880 bytes; file metadata **5.2**) and the installed glTF importer/exporter. Its exporter source hash still matches B. Historical executable output was **5.2.3 LTS / e13b728c6880**, checked 15 November; no new Blender process or live scene call verified that exact version today. [Evidence](evidence.json) distinguishes these checks.

After production saves the immutable task receipt and raw download at `candidate-001/raw/model.glb`, use a separate background process; never the shared Blender connector:

```powershell
# Fill this from the task's download receipt, not an untrusted filename:
$rawHash = (Get-Content -Raw 'C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/production-receipt.json' | ConvertFrom-Json).rawGlbSha256
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --disable-autoexec --python-exit-code 1 --python 'C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/asset-pipeline/selected-a-v01/stage-cleanup.py' -- --raw-sha256 $rawHash
```

The [template](stage-cleanup.py) checks the hash/basic GLB contents, imports into an empty independent process, records raw counts/bounds and saves a **new** cleanup-start blend. It refuses an existing output directory and does not perform artistic cleanup or final export. Syntax was checked; Blender execution remains untested.

Production records exact request hash, provider task ID, effective model/settings, timestamps/status, charged credits and downloaded GLB hash/bytes. Redact credentials and expiring signed download URLs. Persist the task ID before polling; on an ambiguous create response inspect task history through the available provider surface, never automatically repeat POST. Download success is not model acceptance.

Stop on failed/missing output, malformed or unexpected textured/rigged payload, lost mass, background slab, unusable depth or fused geometry whose repair would destroy A's silhouette. Preserve the candidate and report the concrete repair limit; do not automatically regenerate, purchase cleanup jobs or replace Meshy with a complete native build. Otherwise clean locally, then measure final topology, materials, raw/gzip/Brotli sizes, bindings and full swept bounds including gaze, lids and runtime marks. Room/phone performance and combined assistant JS allocation require later evidence; no spare scene budget is asserted.

## Root handoff and verification boundary

Meshy tools and required-instruction endpoints are absent from this worker's live tool catalog; plugin discovery returned no Meshy match and no Meshy CLI was found. Consequently **live connector schema/instructions, connector quote and account balance are unavailable**. The official REST schema and price above are current; older connector receipts are not substituted. Root's production lane should read whichever connector's current mandatory instructions it actually uses and map this exact candidate without silently changing defaults or billing surface. This is a tooling gap, not a new artist/spending approval requirement.

[validation.json](validation.json) records local JSON, source pins, request encoding, proposed node consistency and Python syntax checks. No provider submission, Blender execution, GLB acceptance, application build/test, room render or performance measurement occurred.
