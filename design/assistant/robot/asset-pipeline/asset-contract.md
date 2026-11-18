# Apprentice asset contract, draft 0

Preparation contract, 15 November 2026. Claude owns appearance, dimensions and gesture choices. Root reconciles A/B/C and freezes a candidate-specific revision before production. [profile.example.json](profile.example.json) and [manifest.example.json](manifest.example.json) are deliberately **not production manifests**: unresolved fields are `null`, not zero, and `productionReady:false` prevents an example being mistaken for acceptance.

## Identity and coordinate boundary

One robot-only self-contained GLB 2.0, one scene, one root `APR_root` (provisional A name), with a finite acyclic single-parent hierarchy and unique node names. Do not add it to `studio_full_kit` or run the static-room validator as if it certified the robot. `studio-full-kit-v1` remains animation/skin/morph-free and unchanged.

Author in metres, right-handed Blender Z-up, neutral character forward **-Y**. Export once to right-handed glTF Y-up, forward **+Z**: `g = C b = [b.x, b.z, -b.y]`. The local hover root is the centre of the head/body gap at `[0,0,0]`; neutral root rotation is identity and scale is one. The world placement wrapper applies `world = anchorWorld + Rplacement * (2 * g)` exactly once. The local robot receives **no extra +0.11Y room offset**. Room placement already uses that offset for room-authored coordinates; a world anchor includes its own intended height. No runtime auto-centering or fit-to-view scaling.

Transform rotation axes with the same basis; use `Rg = C * Rb * inverse(C)`, then derive glTF `[x,y,z,w]` quaternion. Do not copy Blender Euler component order into runtime Euler angles. Preserve nonzero child translations that encode hinges. Bake negative scale, shear and mesh-scale corrections into geometry before freeze without moving pivots; authored neutral TRS has unit positive scales and normalized quaternions. Prefer TRS throughout for a future transform-animation variant. The wrapper orientation is pending room composition; a head-on proxy does not establish facing at zone A.

Validate three independent basis probes: `[1,0,0] -> [1,0,0]`, `[0,1,0] -> [0,0,-1]`, `[0,0,1] -> [0,1,0]`; compare neutral/swept bounds and a fin hinge before/after export. Compare in metres before multiplying by two. A-confirmed measurement tolerance belongs in the frozen profile; it is not supplied as an arbitrary approved budget here.

## Parts and pivots requiring A confirmation

The table transcribes the inspected **v01** proposal, not final names or dimensions. The exact spec/script/blend hashes are in the snapshot; the [independent v01 review](../review/blockout-v01/review.md) says REVISE and A is making v02. Reconcile the new version before using numeric transforms.

| Semantic role | v01 name / parent | v01 pivot in parent Blender metres | Export/runtime boundary |
| --- | --- | --- | --- |
| Hover root | `APR_root` / wrapper | `[0,0,0]` | One placement wrapper, finite event-driven lift only if selected |
| Head | `APR_head` / root | `[0,0,0.018]` at head base | Independent rotation pivot; static shell/ears/visor can share rigid geometry where visual/material boundaries permit |
| Body | `APR_body` / root | `[0,0,-0.018]` at top | Independent follow rotation; static badge may join body |
| Fin pair | `APR_fin_L`, `APR_fin_R` / body | `[+/-0.102,0,-0.028]` | Separate hinge pivots; L means character's left (+X), viewer's right in frontal view |
| Tray | `APR_tray` / root | `[0,0,-0.215]` | Independent of body sway; dynamic marks attach here |
| Gaze | `APR_eyes` / head | head centre `[0,0,0.08]` | A chooses technique; v01 is a transform pivot |
| Rings | `APR_eye_L/R` / eyes | `[+/-0.0433,-0.0755,0]` | Separate ring geometry, not painted permanently onto shell; spacing remains disputed by review |
| Lids | `APR_lid_upper/lower` / eyes | head centre in their hierarchy; numeric local origins must be read from frozen source | v01 rigid X rotation is an A proposal, not mandated by the room profile |
| Tray emission | `APR_tray_glow` / tray | tray centre | Runtime material scalar for dim/lit; no baked source semantics |
| Source marks | v01 `APR_card_1..4` / tray | A-authored slots | **Exclude from GLB**; runtime creates 0-4 from current validated hits |

Preserve required semantic pivots even if their mesh children are joined. Never flatten across a moving boundary. Freeze an exhaustive node list with parent names, local TRS, mesh/material indices and semantic role; the provisional role table is not that final list. A must resolve eye spacing, open-eye seam/occlusion, fin/panel direction, tray/body clearance, nine-moving-node claim, actual material count, and a final facing/swept-volume map. The v01 prose says five/six materials while the review found seven including glow variants; none is a final draw allocation.

## Eyes, marks and motion

The initial engineering proposal is a neutral mesh plus runtime pose interpolation. Export **no clips** for this variant, even though the design `.blend` contains a demonstration timeline. Ring/lid/gaze values and tray brightness are controlled independently; no blink, baked card reveal or material animation can substitute for live state. Rigid lids may be retained if A accepts their appearance. A shader, morph or other eye technique remains available through an explicit robot-profile revision, measured JS/texture/geometry cost and loader tests; it does not require weakening the room profile.

Marks are presentation of actual current source identities, not baked decorative evidence. They share the same current-run hit list as HTML; create exactly 0, 1, 2, 3 or 4 marks as applicable, and never placeholder hits. Clear old marks and invalidate the canvas on submit/cancel/failure/close as C's final lifecycle contract specifies. Do not keep stale marks during an exit animation. No on-tray source text is the only readable source; HTML remains authoritative. C must settle the >4-hit policy before acceptance; the asset slot count is not permission to silently drop data.

If later selecting baked transform clips, issue a new profile revision. Record exact clip names, seconds/frame range/fps, target node and TRS path, key count, interpolation, loop policy (default no loop), neutral/settled poses, event binding, interruption policy and swept bounds. Export sampled supported object transforms; bake constraints/drivers in the separate source. Validate finite strictly increasing input times, normalized quaternion output, legal cardinality and no unsupported targets. Shape-key or skeletal clips need a different explicit variant. [Blender's export documentation](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html) identifies object transforms, pose bones and shape keys as supported animation types; material animation requires a runtime implementation rather than an assumed export.

## Permitted GLB surface for draft neutral variant

- glTF 2.0/GLB, a single BIN payload with embedded PNG/JPEG `bufferView` images; no network/file/data URI dependencies. All scene nodes reachable exactly once. No cameras, lights, unused scene copies, review environment, source-card stand-ins, skins, morphs or animations in this variant.
- Triangle primitives only (`mode:4`), finite float POSITION/NORMAL; unsigned indices if present; matching accessor counts, correct min/max/bounds, in-range indices and valid buffer offsets/strides. UV0 is required only for textured primitives. Optional finite UV0 and normalized colour attributes must be declared per primitive. No unexpected tangents, UV sets, points, lines, sparse accessors or extension attributes without profile review.
- Core metallic-roughness PBR, opaque single-sided by default; material factors and required texture slots enumerated. Base/emissive maps are colour data; metal/roughness/normal/occlusion are linear data. Do not bake scene lights/highlights or source text into albedo. Palette and brightness stay A-owned. Normal-map tangents or special materials require an explicit, tested profile entry rather than silent exporter output.
- Draft extension allowlist: `KHR_materials_emissive_strength` only, contingent on the actual selected materials and loader review. `extensionsUsed` and `extensionsRequired` must be subsets, with no undeclared nested extension. Remove incidental IOR/specular extensions or revise the robot allowlist deliberately after checking actual material use; the exporter options alone do not prove this. No Draco, Meshopt, KTX2, WebP/AVIF, quantization or GPU-instancing extension in this draft. No new decoder dependency.
- Transparent/alpha-tested/double-sided surfaces are not approved by default. If A needs them, state material, flags, sort/pass behavior and depth/occlusion semantics and remeasure. Existing room BLEND exceptions do not apply automatically to the robot.
- Every mesh leaf records role, occluder, nocast and receiveShadow. Proposal: no added caster, existing room lights only, ordinary opaque robot surfaces remain occluders even when `nocast:true`. Picking treatment belongs to C; no broad invisible hit region or click-through exception.

These are conservative draft implementation choices, not restrictions inferred from the character's personality. [glTF's specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) supplies the underlying axis, accessor, TRS, material and animation rules; candidate validation must inspect exported bytes, not trust metadata.

## Manifest and ownership

Freeze `profileId/revision/hash`, candidate/version/parent, A-design snapshot hash, exact room/camera baseline, and an export input/output chain. Each source/script/view/raw/provider-output/cleanup-blend/export/manifest/evidence file gets path, bytes and SHA-256; the manifest itself is hashed in the external handoff receipt to avoid self-reference. Provider records contain tool/API/model/texture model, exact non-secret options, task ID/type/status/timestamps, quotation and accepted limit, actual charged receipt if available, plus input hashes. Do not save tokens, signed download URLs, private media listings or an invented provider model/effort.

Record GLB raw bytes and separately gzip/Brotli bytes with tool versions/settings; retain the exact encoded file hashes when shipping those encodings. Record whole-file compression independently of geometry/JSON/image diagnostics. Image metadata includes MIME, dimensions, encoded bytes/hash, unique pixel totals and referenced slots; required slots must decode and exist in the browser. Geometry counts distinguish unique stored triangles, placed triangles, primitive instances, material instances, cast/pass-weighted counts and measured renderer counters. Record decoded texture estimates separately from GPU measurements. Neutral and swept local bounds must include eyes/fins/tray and 0-4 runtime marks in the combined measurement.

The future robot loader privately owns imported geometries/materials/textures/bitmaps and temporary URLs per load; the runtime controller separately owns generated marks, eye resources if generated, pose scheduling and any cloned materials. Shared resources are released once by identity; do not dispose the room's library resources. Register allocations before asynchronous failure, drain late dependencies, close bitmaps after textures and fence stale/aborted completion. `load-full-kit.ts`'s `FullKitResources` class (line 20), allocation hooks and final `dispose()` are relevant r187 source evidence, not a ready robot loader. Static batching must not absorb articulated parts. A late successful load adopts current settled state without replay. Readiness follows validated decode plus the first successful visible render; failures preserve HTML access.

Unresolved allocations remain `null`. Production acceptance requires all required fields, limits, pivots and hashes resolved and the checks in [budget-and-validation.md](budget-and-validation.md); no template, master `.blend` count or parser safety limit proves that gate.
