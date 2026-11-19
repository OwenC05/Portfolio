# Independent technical review — selected A / candidate 001 / build v01

16 November 2026. Codex reviewer, task `task_4db14338707f`, dispatch `ctx_eefab21f9c98`. I did not author the asset. All review writes are confined to this directory. Root clarified that the misrouted G1 application-repair message was not this assignment; no application files were changed.

**Verdict: PASS, bounded to mechanical import and the exact v01 asset/profile/pose bytes below.** The saved Blender source exports byte-for-byte to the supplied GLB; the installed Three.js r187 loader imports it; hierarchy, neutral transforms, finite geometry, material identities and the declared five-endpoint pose envelope independently check out. This is sufficient evidence for loader/interface work, not final Studio acceptance. The reusable author validator has concrete gaps described below and should be revised before its PASS is used to qualify changed assets or pose metadata.

Claude's separate visual **REVISE** remains authoritative for appearance. This technical pass does not approve installing v01 as the final visual candidate, waive those repairs or preapprove build-v02. I did not inspect v02. Root owns later integration, renderer/browser checks, placement and deployment.

In file references below, `A/` means `design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v01/`. All lines refer to the frozen source reviewed here.

## Prioritized findings

### P2 — Pose and envelope validation can certify a contradictory runtime handoff

**Locations:** `A/validate_asset.mjs:95`, `:105`, `:109`, `:122`, `:130`, `:136`; `A/profile.json:86`; node `APA_tray`, pose `sources`.

The validator computes a speed bound from `localBlenderTRS`, trusts `sampledSweptBoundsBlenderMetres`, and does not cross-check `localGltfTRS`. It also prints `movingBindings:10` without validating `requiredMovingNodes`. Its pupil checks use declared radii and offsets, and the highlight test is a hard-coded constant rather than a check of exported geometry.

Reproducible mutations in [validator-probes.json](validator-probes.json) show author-validator **exit 0 / PASS** after each of these independent changes:

- Set `sources.localGltfTRS.APA_tray.translation` to `[20,30,40]`, leaving the Blender pose unchanged.
- Replace the sampled envelope with a zero-size box at the origin. The validator publishes a roughly ±0.816 mm “conservative” box around it despite the actual 536 mm-tall asset.
- Set `requiredMovingNodes` to `[]`; its output still claims ten moving bindings.

**Consequence:** a future metadata edit can silently move the runtime tray outside the validated envelope or break the binding handoff while generating a fresh manifest hash. A checksum identifies that inconsistency; it does not validate it.

**Requested follow-up, not performed:** validate the complete named pose/binding schema, normalized finite TRS and unit scales; compare every glTF pose with `C * BlenderTRS * inverse(C)`; recompute sampled bounds from exported vertices and the actual runtime pose table; derive moving counts and eye/highlight constraints from the frozen data. Keep a negative fixture for each accepted mutation. There is no evidence this defect occurs in the current pinned payload: this independent review checks its actual glTF poses and recomputes a denser envelope successfully.

### P2 — The GLB validator omits several guards promised by the candidate contract

**Locations:** `A/validate_asset.mjs:18`, `:20`, `:37`, `:41`, `:61`; `asset-pipeline/asset-contract.md:45`, `:47`.

The same isolated probes return **exit 0 / PASS** for:

- Root quaternion `[0,0,0,2]`. A dot-product alignment test does not establish unit length.
- An undeclared root-node `KHR_lights_punctual` light and matching top-level light definition. Checking only `extensionsUsed` misses nested extension content.
- POSITION accessor min/max replaced by zero vectors. The vertex bounds are measured, but accessor min/max are never compared with them.
- An extra `_UNREVIEWED` vertex attribute. The validator reads POSITION/NORMAL but never checks the full attribute allowlist.

The two sensitivity controls do fail as expected: a double-sided material and a grossly out-of-range POSITION offset each produce exit 1. Thus these seven accepted mutants are specific missing checks, not a broken probe that always reports success.

**Requested follow-up, not performed:** add narrow guards for unit quaternions, allowed nested extension locations/content, attribute names/types and declared-versus-decoded bounds. The current actual file has normalized quaternions, only POSITION/NORMAL, correct finite bounds and no light; it does not require asset geometry repairs for these findings. Do not treat the current validator as a complete future-export gate.

## Integration details that must remain explicit

These are concrete adapter requirements, not additional offline blockers or unimplemented repairs assigned to this reviewer.

- **Emission values are author strengths, not directly the imported Three intensity field.** `A/profile.json:1359` describes tray base colour and neutral strength ~0.35; `A/poses.json:803` and `:2403` use 0.35 and 0.8. GLTFLoader imports the tray with emissive colour `[0.2824332785,0.1718572975,0.0524859248]` and intensity **1**, because export baked the sub-one neutral strength into the colour. Assigning `emissiveIntensity = 0.35` would dim neutral to 35% of its exported product. Use the profile's linear emission base with the authored strength, or scale the imported intensity by `targetStrength / authoredNeutralStrength`. The eyes instead import with the full colour and `emissiveIntensity=2.5`. [inspection.json](inspection.json), `emissionMapping` and `loaderNodes`, records both actual products; installed `GLTFLoader.js:885` and `:3800` explain the independent intensity/colour fields. No renderer brightness or aesthetic acceptance is inferred from these numbers.
- **Opaque meshes remain blockers.** The general asset contract at line 49 asks for role/occluder/nocast/receiveShadow data per mesh. This candidate supplies role bindings and `extras.castShadow:false`, but no explicit occluder or receiveShadow flags. The actual loader defaults both shadow flags to false; extras are user data, not a picking policy. Root/G2 should freeze the candidate-wide opaque-blocker/no-caster and receive-shadow policy explicitly before wiring picking. Do not interpret “does not cast” as “does not occlude.” This is a handoff-policy gap, not proof of click-through in an unimplemented robot loader.
- **Emission is shared deliberately.** Left/right eye discs share one material, left/right highlights share one, and tray emission has a different material from both eyes and brass. Pairwise eye brightness and tray brightness can vary independently without clones. Independent left/right eye brightness would need an explicitly owned clone; it is not a required current control. Face, pupils and lids share ink; moving their geometry does not require material cloning.
- **Own resources by identity.** The loaded asset contains 21 unique BufferGeometry identities, seven unique materials and no textures. The private import owner can dispose those once; generated marker resources and any later cloned materials belong to their separate owner. Do not static-batch across articulated nodes or share these private materials with the room. The review disposes its own loaded geometry/material sets; it does not prove future asynchronous loader cleanup, first-visible-render readiness or context-loss behavior.

## Independently verified payload

| Check | Evidence / result |
| --- | --- |
| Source/export parity | Isolated Blender 5.2.3 LTS, build `e13b728c6880`, opened the saved `.blend` with auto-execution disabled and exported only into this directory. `independent-export.glb` is exactly 328960 bytes and SHA-256-identical to the candidate. The candidate GLB was separately reimported for geometry probes. |
| Hierarchy and moving bindings | All 22 semantic nodes are unique and reachable once from `APA_root`, with an acyclic single-parent hierarchy; 21 are meshes. The actual profile contains exactly ten moving bindings, consistent with node extras and neutral local transforms. Highlights inherit pupils; tray glow inherits tray; mittens inherit body; face/lids/eyes/bookmark/seam inherit the intended head branches. |
| Pivots and neutral TRS | Saved source, exported GLB and profile agree. All neutral scales are positive unit scales and all neutral rotations identity. Nonzero child translations are preserved. The saved source has no live constraints, modifiers or animation data; no actions were present. The local root is identity with no baked placement or doubled room scale. |
| Coordinate conversion | Independent matrix comparison of all 22 nodes × 5 poses gives maximum element error `4.431706457364015e-8` for `C * R * inverse(C)` with `C:[x,y,z]→[x,z,-y]`; translations and unit scales agree. This also covers the independent axes, not swapped Euler components. |
| Root/scale boundary | `A/profile.json:78`, `:1491` and the measured head-bottom/body-cap-top values define provisional `0.6029863301787592` metres per raw unit and the exact gap midpoint. External scale **2 once**, no extra `+0.11Y`, no baked world anchor. Numeric scale is not a selected room placement or approved allocation. |
| Geometry | 9341 serialized vertex records, 18330 triangles, 21 meshes/primitives; POSITION/NORMAL float VEC3, unsigned scalar indices; counts, byte ranges/alignment, finite values, min/max and index ranges all check. Zero degenerate triangles; maximum unit-normal error `1.2521518732988568e-7`. |
| Actual loader | The installed Three.js r187 `GLTFLoader.parseAsync` succeeds in Node with no browser or renderer. All 21 meshes are ordinary opaque, one-sided meshes. This establishes parser compatibility and resource identity, not WebGL draw cost or appearance. |
| Materials/absence | Seven named simple PBR/emission materials. No textures/images, external URI, camera, light, skin, morph target, demo animation, baked source marker or decoder requirement. The sole used extension is `KHR_materials_emissive_strength`. Blender's log mentioning available Draco/Meshopt libraries does not mean either was exported. |
| Byte counts | Independently reproduced raw **328960**, gzip level 9 **214023**, Brotli quality 11 **149706** bytes. These are asset-only encoded sizes; 21 primitives are not a renderer draw-count receipt. No total budget is asserted from the room baseline plus this GLB: assistant/runtime JS, marks, passes and peak draw cost are missing. |
| Integrity | All 36 deliverable pins and 12 input pins in `files.json` match bytes/hash. Manifest references to export, editable source, profile, poses and builder match independently. Raw and cleanup inputs remain unchanged; production receipt pins the same raw GLB. |

### Meshy retention and native rebuild

The raw import independently has **seven connected islands**, with exact vertex/face membership matching the author diagnosis. Source head/body/mittens are present; the other islands correspond to the discarded generated post, tray and ribbon.

The review independently applies the documented four-iteration smoothing to the raw island data, then compares actual saved-source geometry after undoing the one authoring scale/root offset:

- Both mitten meshes retain all **416/412** smoothed source vertices, with maximum comparison error about **2.01e-8 m**. Their source topology counts agree with the raw islands and retained report.
- All **705** tested body samples strictly below the collar cut survive within **5.40e-8 m**; the collar/top repair is explicit rather than hidden as original geometry.
- The head's documented fairing/cut produces **544 pre-retopology samples**. **475** match final head vertices within the probe tolerance; the other 69 do not survive the subsequent convex retopology. `A/build_asset.py:94–96` explicitly deletes unused hull vertices. Therefore “544” must stay labelled **before retopology**, as the README does; it is not a count of unchanged final source vertices. The final head is materially rebuilt at the front, with retained rear samples, a cut boundary and native loft rings. This is consistent with the disclosed repair, not evidence of an entirely substituted primitive head.

The face/rim, eyes/pupils/highlights/lids, coronal seam, bookmark, collar/cap and tray/glow are explicitly native rebuilt nodes. The source metadata and geometry check support the disclosed provenance boundary; they do not promise preservation of all original front topology. Full numeric comparisons are in [blender-inspection.json](blender-inspection.json).

## Pose envelopes, pupils and nonintersection

Independent evaluation used the actual exported vertex positions and **glTF** pose table, rather than copying author Blender bounds. All **2025 samples** (25 ordered pairs × 81 points) lie inside the published continuous envelope. Recomputed chain-speed bound is `0.06522331325217298 m` per normalized transition; the corresponding original-40-interval padding is **0.0008162914156521623 m**, agreeing with the author's **0.0008162916443605818 m** to sub-nanometre numerical error.

The continuous argument is sound **for these inputs and assumptions**: unit scale; each local translation follows lerp; each quaternion follows its shortest slerp; one common nonovershooting transition parameter traverses a pair of the five authored endpoints. For any point, each ancestor contributes translation displacement plus angular displacement times an enclosing radius; the nearest 1/40 sample is at most 1/80 away in parameter space. Expanding sample bounds by that speed/80 plus 1 µm therefore bounds the unsampled path. A monotonic easing function that stays on the same path changes timing, not this spatial result.

It does **not** prove a complete future runtime envelope for interruption from an arbitrary composite intermediate pose to a third target, independent per-node easing clocks, added gaze/lid offsets, scale changes, overshoot or runtime marks. The state contract requires interruption handling, so G2 must bound its implemented motion policy or conservatively enlarge the envelope. This is already an explicitly scoped five-pose receipt, not a reason to invent an offline marker allocation.

The separate isolated Blender reimport sampled **95** endpoint/intermediate states across the five major groups: head assembly, body/collar/cap, left mitten, right mitten and tray/glow. It found **zero cross-group triangle intersections**. This extends the author's 45 samples but remains a sample test: no continuous collision certification, no containment/clearance-distance proof, and no claim about intentional within-assembly overlaps. Claude's reported body/tray overlap in the image is a visual-projection criterion; zero intersecting triangles does not refute it.

Actual pupil and highlight vertices, not just declared circles, were checked at all five endpoints. Maximum projected pupil ellipse value is **0.3442656800839017 < 1**; minimum pupil-to-lid vertical gap is **0.008080005645751953 m**; maximum highlight radius about its pupil is **0.011571120221842115 m**, below the pupil radius **0.013265699263932703 m**. With the present pure relative translations, fixed child highlight offsets and common interpolation parameter, the ellipse is convex and the lid-gap extrema are linear, so those planar containment/vertical-gap bounds also hold between each pair of endpoints. This does not establish full 3D silhouette visibility, shading quality or pupil comfort after pose/geometry edits. Fresh relevant bounds are required for v02.

Neutral glTF bounds independently recovered:

```text
min = [-0.14062344492413104, -0.2358040977269411, -0.1354877119883895]
max = [ 0.1372770096641034,   0.30068186298012733, 0.1254333845572546]
```

Runtime 0–4 source marks remain unbuilt and excluded, as the manifest/poses say. No motion or geometry can fabricate a hit; future markers still derive from the same validated current-run snapshot as HTML and clear immediately on terminal failure/cancel/close/supersession.

## Reproduction and evidence

From the repository root, the following write only under this review directory:

```powershell
node design/assistant/robot/review/build-v01/technical/inspect-glb.mjs
node design/assistant/robot/review/build-v01/technical/probe-validator.mjs
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --disable-autoexec --threads 2 --python-exit-code 1 --python design/assistant/robot/review/build-v01/technical/inspect-blender.py
```

- [inspect-glb.mjs](inspect-glb.mjs) → [inspection.json](inspection.json): independent binary/accessor/hierarchy checks, real installed loader, material identity, hashes, compression and denser pose bounds. Exit 0.
- [probe-validator.mjs](probe-validator.mjs) → [validator-probes.json](validator-probes.json): ten cases, including seven accepted-invalid cases, two rejected-invalid sensitivity controls and an accepted unmodified control. Exit 0 means the probe receipt was recorded, not that all author guards passed. `validator-copy/` contains the exact copied validator and private inputs; it is reset to the unmodified control after probing. The original author validator was never executed in or allowed to write into `A/`.
- [inspect-blender.py](inspect-blender.py) → [blender-inspection.json](blender-inspection.json), [blender-log.txt](blender-log.txt), [independent-export.glb](independent-export.glb): isolated source inspection, provenance sample comparison, exact re-export and independent candidate reimport. Final exit 0. Initial reviewer-script run failed because Blender Quaternion has no `.length` attribute; the reviewer probe was corrected to check the sum of squared components and rerun successfully. That failure made no candidate changes.

No author builder/finalizer was rerun, no shared/live Blender connection was used, and no browser, `.next`, server, paid tool, dependency/config, Git or application operation was performed. Fresh integrity verification after all probes still passes all 48 source/input pins.

## Reviewed identities

| Input | SHA-256 |
| --- | --- |
| `A/selected-a.glb` and independent re-export | `775733a18559d7f52dd6bd71e7ec518a9783ef3c9e95dd753b3072e553587232` |
| `A/selected-a.blend` | `23c6fdf90d48bee4f3a82fd811f312b6eb798dd40712544fa7afa6bdb67a22fc` |
| `A/profile.json` | `3c8d967715892f5ee2430b252bafdc3d1a55c767fb949cf55f6475b260c6f550` |
| `A/poses.json` | `6e32e89bd68e47ea2638302211e0d45da38f078e9201e6c71b903ca4c05aacc6` |
| `A/manifest.json` | `c6c53f0748d228e159ea6e883dd0624ced59e832096c09f72c0f01c91c5d1e68` |
| `A/validate_asset.mjs` | `dc0383731656d792f99af43879e2c2cca53cca3868b1f31e27fbafc6b77f5ea9` |
| `A/build_asset.py` | `f03b30650b0eff3389bfd0d830b58e4f5ada4608832bd09bb2e2f8240d26572c` |
| `A/files.json` | `4557842973bdc5b32c22e96e87641d6c98403703bb3a97d5dd823620372d159f` |
| Raw Meshy GLB | `412c0c213e0c6adc6baa80fa0686b6cbd9a1d259348bb96c571ef28b2f59bec7` |
| Cleanup input `.blend` | `1506ea45bd007cfd6855770348969fb36ab379a26a9e1de9690dbd78c4f586b1` |
| Production receipt | `6e9a50de02f91c3a90e894af5c3f69cf2f094e90af9a82009b3963339218a277` |
| Root selected-A build decisions | `face0b2be9557a6f55d3a2106a7a2ebf5a0617b14701c5d3e7de9c9408e27a11` |
| Runtime state contract | `e9c1916fd9a0529b6f3a11bdc7a1829b67c1e3b29ccdc5b58d6c05d970f9b26d` |

All other input/deliverable hashes are in `inspection.json`. The reviewed production receipt records one successful task, five charged credits and the same raw hash; this review makes no new provider/account verification or production authorization claim.
