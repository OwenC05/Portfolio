# Independent technical recheck: selected A build v02

18 November 2026. Codex reviewer, task `task_c0a7846b26ad`, dispatch `ctx_763d432509e1`. I authored neither asset. All writes are in this new technical review directory; v01, its review, the candidate, application, shared Blender and build/browser resources remain untouched.

**PASS for the exact v02 bytes' mechanical import and adapter handoff.** The installed GLTFLoader imports the candidate, its saved Blender source independently reproduces those bytes, and its hierarchy, angular lid contract, geometry, emission products and bounded pose envelope agree. **The reusable validator still needs revision before its PASS alone qualifies future changed payloads.** One prior P2 finding closes; the other remains open in narrower form below. Neither remaining mutant defect occurs in the pinned candidate.

This verdict does not approve appearance, placement, production deployment or the complete runtime adapter. Actual Claude retains visual authority; root owns integration and final checks. In references below, `A/` means `design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v02/`.

## Findings and disposition of the two original P2s

### P2 retained, narrowed: the GLB gate still accepts a payload its actual loader cannot import

**Locations:** `A/validate_asset.mjs:19`, `:36`; `A/validate_contract.mjs:14`, `:15`, `:18`; `asset-pipeline/asset-contract.md:45`, `:46`. Affected test node: `APA_body_cap` for omitted POSITION bounds; `APA_body_cap` for the dangling skin reference. These are private mutated copies, not defects found on the actual node.

All four original GLB mutations now reject: nonunit root quaternion, undeclared nested light, incorrect POSITION min/max, and unexpected attribute. However, two bounded follow-up probes expose remaining bypasses of the same promised GLB surface:

1. Set the first mesh node's `skin` to `0` while leaving the skin table absent. The validator exits **0**, writes PASS and a fresh manifest. `assert.ok(!n.skin)` accepts the valid index value zero as falsy; the zero-length top-level-table check does not reject a dangling node reference. The actual installed GLTFLoader rejects the same mutated bytes with `TypeError: Cannot read properties of undefined (reading '0')`. See `node_modules/three/examples/jsm/loaders/GLTFLoader.js:4135`. This demonstrates a real false import-readiness result, not just a theoretical schema concern.
2. Delete both POSITION `min` and `max`. The new accessor comparison runs only `if(a[key])`, and the primitive guard does not require these bounds. The validator again exits **0**. GLTFLoader accepts with `THREE.GLTFLoader: Missing min/max properties for accessor POSITION.` (`GLTFLoader.js:4847`), so this is the lower-impact contract omission within the same P2, not an import crash.

Evidence: [probe-validator.mjs](probe-validator.mjs), [validator-probes.json](validator-probes.json). Both probes modify only one field pair/reference, run a private copy of the actual validator/helper, then pass accepted mutants to the installed loader. The private directory is restored to the valid input after probing. Follow-up for the validator owner: reject node skin references by presence for this no-skin variant, and require POSITION bounds before comparing their decoded values. No repair was performed here. This is a bounded twelve-case challenge, not exhaustive glTF fuzzing.

### Original P2 closed: pose/envelope validation now checks the runtime handoff

**Locations:** `A/validate_contract.mjs:20`, `:25`, `:28`, `:30`, `:34`, `:36`, `:39`, `:54`; `A/validate_asset.mjs:94`, `:109`. The previous finding is at `review/build-v01/technical/review.md:13`.

The new guard fixes the demonstrated failure mechanism: named parents and moving bindings are checked, both complete TRS tables are validated and basis-compared, nonmoving local poses stay neutral, endpoint and sampled bounds are recomputed from exported vertices using the glTF pose table, and pupil/lid/highlight checks use actual geometry. The three old pose mutations now reject. Independent dense transforms, an independent chain-speed bound and an analytic angular-lid calculation support the exact delivered data. Closure is limited to the stated five-pose, common-parameter interpolation contract; it is not certification of every possible future metadata change.

| Private mutation/control | Expected | Observed validator exit |
| --- | --- | --- |
| Unmodified v02 | accept | 0 |
| Sources glTF tray translation `[20,30,40]` | reject | 1 |
| Fabricated zero sampled envelope | reject | 1 |
| Empty required-moving list | reject | 1 |
| Root quaternion `[0,0,0,2]` | reject | 1 |
| Undeclared nested node light | reject | 1 |
| POSITION min/max replaced by zeros | reject | 1 |
| `_UNREVIEWED` vertex attribute | reject | 1 |
| Double-sided material sensitivity control | reject | 1 |
| POSITION offset `1e8` sensitivity control | reject | 1 |
| Missing POSITION min/max, additional probe | reject | **0** |
| Dangling `skin:0`, additional probe | reject | **0**, loader fails |

## Exact payload and receipt agreement

| File in A | SHA-256 |
| --- | --- |
| selected-a.glb | `bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270` |
| selected-a.blend | `80704c8f2989683dffa59f9616b1ef146eab944f7d05ae0e0bf55e1964bc508e` |
| profile.json | `f5dbf7f2a9e3e57332c62c21e27013d6ce05d11085fac94ec979631e4728e33e` |
| poses.json | `6dd7ce35a027352b4f2cffbe673081910837e69d56c9f4ec866e970381c6e96d` |
| manifest.json | `5ab01dc63a952d618877e150729b443ecb4cf9922cd3bdf1df7a985e6f6f7423` |
| files.json | `4724ffa328e9f647eb8893c1dc9a83274accee3947448f7b1658593169ce8db6` |
| validate_asset.mjs | `dc1231aa8c824a184582a69fd6b7d7603c2de979ff5e05e6421a3e2ace5ea0ad` |
| validate_contract.mjs | `b65ea4dbf9dcd034791b53203d41c98de5d94abaccffef0fb0aca3e4b13b3a87` |

[inspection.json](inspection.json) verifies all **72** files listed in `A/files.json` plus **17** upstream inputs against size and SHA-256. [receipts.json](receipts.json) also verifies the **37** frozen v01 files, all **7** profile source pins, manifest/profile/pose/validation agreement and actual installed viewer-source hashes. It records further exact hashes for the builder, validation and browser evidence. The v01 review is unchanged. Manifest and profile remain production-unapproved; no room allocation has been inferred.

Node **v24.21.0**, installed Three **r187**, and Blender **5.2.3 LTS / e13b728c6880** were used. `independent-export.glb`, exported from the saved blend with scripts disabled, is exactly byte-equal to the candidate. No author builder or candidate-writing script ran in A. [blender-inspection.json](blender-inspection.json) records the saved-source object transforms, re-export and actual GLB reimport checks.

## Import, pivots, materials and ownership

- **22 named nodes, 10 moving bindings, 21 meshes/primitives, 7 materials, 19,131 vertex records, 37,676 triangles.** Positions/normals are finite; normals' maximum length error is `1.517522e-7`; indices and buffer ranges are valid; declared POSITION bounds agree with decoded data; no degenerate triangles. The actual loader creates 21 unique geometry identities and seven shared-by-role material identities.
- Root has identity neutral TRS. Head/body/tray descend from root; mittens from body; eyes/lids/bookmark post from head; pupils from eyes; highlights from pupils; ribbon from post; glow from tray. Every neutral scale is one and quaternions are unit. Full parent/transform records are in inspection.json. All five poses' 22 transforms agree under **`C * BlenderTRS * inverse(C)`, `[X,Z,-Y]`**, maximum matrix discrepancy `4.927306e-8`.
- New lid origins are the face-centred X hinges, not translating lower-lid origins. Neutral glTF L/R translations are approximately `[+/-0.05065085, 0, -0.002411946]`; rotations are identity and translations remain fixed in every pose. Local X angles range **-0.08148861 to +0.01565313 radians**. See `A/profile.json:511`, `:707`, `:1220`, `A/build_asset.py:220`, `:305`. An adapter must consume v02's complete local glTF TRS and must not apply the old lid lift logic.
- External **2 world units per metre exactly once**, zero added room-floor offset and external placement remain explicit. No wrapper placement is baked into the neutral root. Root midpoint differs from the arithmetic midpoint of float32 endpoint records by only `3.725291e-9` raw units (about `2.25e-9` metres), consistent with Blender float rounding. The authoring scale is provisional, not a room allocation.
- All loaded surfaces are opaque, single-sided. Every mesh carries `opaquePickingBlocker:true`, `castShadow:false`, `receiveShadow:false`; the root empty is not a blocker. These are metadata that G2 must apply to live picking/resource ownership, not an already implemented adapter.
- The two eyes share **MAT_APA_eye_emit**, separate from **MAT_APA_tray_emit**. Warm cream eye linear colour is `[1,0.8713670969,0.5972017646]`, imported intensity **4**. Tray emission is constant **0.10** in all poses, with imported emissive colour `[0.05647115195,0.03324515273,0.00802198213]` and imported intensity **1**. Assigning intensity `.10` again would dim the exported product tenfold. Preserve the imported product or use profile base colour times authored strength; tray brightness is not result-count evidence. All seven material colour/metal/roughness/emission products were independently compared with profile values in [angular-eyes.json](angular-eyes.json).
- Dispose unique identities once: 21 geometries, seven materials, no textures. Eyes share one role material; face/lids/pupils share ink; highlights share another material. Independent left/right material changes would require deliberate cloning and ownership, whereas tray and eye emission are already independent. Runtime markers have a separate owner.
- No cameras, skins, textures/images, imported lights, morph targets, demo clips, source markers or embedded ambient animation are present. No decoder is needed.

The raw/cleanup pins and prior provenance findings remain frozen. V02's body and both mittens have byte-identical POSITION/NORMAL/index payloads to v01. The head is explicitly changed by one subdivision (`A/build_asset.py:116`); its saved-source/export agreement is verified, but this recheck does not pretend the final head retains the pre-subdivision vertex identities. `A/retained-mesh.json` records the Meshy-derived head repair and native rebuild boundaries. I did not repeat unrelated raw-island reconstruction from the v01 review.

## Pose bounds, angular eyes and collision limits

Neutral glTF bounds in metres are min `[-0.139278249,-0.235996591,-0.133880447]`, max `[0.137879919,0.345654480,0.126338701]`. Independent 81-step sampling of all 25 ordered pose pairs (**2,025 samples**) agrees with the published envelope. An independent hierarchy chain-speed bound is **0.111450001 m per normalized transition**. Expanding the denser sampled box by half a sample interval's speed plus one micrometre yields an independent continuous bound entirely inside the author's published bound. The author's 40-interval padding, **1.394126 mm**, is conservative for these exact poses.

This is a continuous positional enclosure only under unit scale, translation lerp, normalized shortest quaternion slerp, and one common nonovershooting parameter between complete authored endpoints. It is not continuous collision proof. It excludes arbitrary intermediate-to-third interruptions, independent clocks, additional gaze/lid offsets, different scale and runtime cards. Those remain **G2 gates**, because the actual lifecycle permits interruption from the current transform (`integration/state-contract.md:133`).

The angular eye check is independent of the author helper. It expresses each lid vertex's Y under X rotation as a sine/cosine function, subtracts it from the linearly moving pupil bottom, and evaluates endpoints plus all derivative roots for each pose pair. It also checks 161 time samples per pair as a numeric cross-check. On both sides:

| Quantity | Independently measured |
| --- | --- |
| Eye half-width / half-height | 31.355295 / 35.576198 mm |
| Pupil radius | 15.074664 mm |
| Maximum pupil normalized ellipse radius squared | 0.475300873, below 1 |
| Maximum highlight radius in pupil frame | 11.571109 mm, below pupil radius |
| Minimum continuous vertical pupil/lid gap | **5.775891 mm**, at dismissal |
| Neutral centre-line lid occlusion | 0.200000016 |
| Dismissal centre-line lid occlusion | 0.333898439 |

The author uses a more conservative radius-based Lipschitz padding, reporting **5.575348 mm** remaining gap; the analytic minimum supports it. Because pupils translate with identity local rotation, the ellipse quadratic is convex along each pair, so endpoint containment covers their interpolated vertices and triangles. Highlights stay fixed in the pupil frame. Centre-line occlusion is not eye-area coverage or camera-specific silhouette. These results do not certify every intentional eye/face surface contact or appearance from every viewing angle.

Independent Blender reimport BVH tests check five endpoint states and nine interior states for each of ten unordered pairs: **95 states, 950 cross-group tests, zero triangle intersections** between head assembly, body assembly, each mitten and tray. These are sampled surface-intersection checks, not containment tests or continuous nonintersection proof. Intentional within-assembly overlaps are excluded. The author's 45-sample receipt therefore has independent, denser support without being promoted into a stronger guarantee.

## Asset cost and residual integration gates

| Asset-only measure | v01 | v02 |
| --- | ---: | ---: |
| Raw bytes | 328,960 | **673,268** |
| Triangles | 18,330 | **37,676** |
| v02 gzip level 9 | — | **483,001** |
| v02 Brotli quality 11 | — | **335,697** |

Raw bytes increase **344,308** and triangles **19,346**. Counts and current compression were independently computed, including the old GLB's triangle count. This does not establish total room budget acceptance: runtime/assistant JS, card/marker allocations, live draw cost and integrated device evidence remain missing. Adding the baseline 703,643 bytes to this asset is not a complete budget.

The author's pinned WebGL evidence uses actual r187, sRGB, ACES exposure 1.2 and room source inputs whose current hashes match its receipt; nine captures and no recorded page errors are present. This is reviewed author evidence, not a new independent browser run or aesthetic approval. Its provisional wrapper `2 * .8 = 1.6`, anchor `[.8,2.8,-.2]`, and wall-light AABB margin **-0.986454511 degrees** remain unaccepted. The warning is not proof of triangle occlusion and was not silently resolved by shrinking the robot. Root/placement owners must settle placement with actual runtime cards, phone coverage and interrupted-motion bounds.

G2 also owns immediate marker/count clearing and shared-snapshot delivery, reduced-motion and hidden-tab settling, live occlusion/picking and unique-resource teardown. No animation or emission can invent retrieval evidence. These pending runtime checks do not block this exact offline import handoff; they prevent calling it final integration acceptance.

## Reproduction and command results

Run from the repository root; every executable below writes only under this review directory:

```powershell
node design/assistant/robot/review/build-v02/technical/inspect-glb.mjs
node design/assistant/robot/review/build-v02/technical/check-angular-eyes.mjs
node design/assistant/robot/review/build-v02/technical/probe-validator.mjs
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --disable-autoexec --threads 2 --python-exit-code 1 --python design/assistant/robot/review/build-v02/technical/inspect-blender.py
node design/assistant/robot/review/build-v02/technical/check-receipts.mjs
```

All five final commands exit **0**. The probe runner deliberately records both false accepts; its own exit 0 means the experiment completed, not that all invalid inputs rejected. Nine expected negative validator children exit 1; the two retained false-PASS cases exit 0. The loader rejects the dangling-skin mutant as recorded, including a skin-attribute diagnostic. One initial review-script run of `check-receipts.mjs` exited 1 because I used exact double equality for a Blender float32 midpoint; it was corrected to a documented `1e-7` raw-unit tolerance, retaining the measured `3.725291e-9` discrepancy. No candidate changed to satisfy a check. There are no unresolved tool failures.

Evidence files: [inspection.json](inspection.json), [angular-eyes.json](angular-eyes.json), [validator-probes.json](validator-probes.json), [blender-inspection.json](blender-inspection.json), [blender-command.log](blender-command.log), [receipts.json](receipts.json), and the byte-identical [independent-export.glb](independent-export.glb). The five scripts above and this report are new. `validator-copy/` contains only the private validator/helper, copied valid inputs and generated private outputs. [review-files.json](review-files.json) lists every produced file and hash except itself. No self-assigned fixes, deployment approval, application integration or independent visual approval are included.
