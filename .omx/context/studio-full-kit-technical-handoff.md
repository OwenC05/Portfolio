# Full-kit technical handoff

15 November 2026. Native Codex explore `/root/full_kit_contract_map`, read-only current-source lookup; no product, art, test, browser or server changes. This maps integration gaps for S and actual Claude, not an artistic proposal or runtime acceptance. The pilot's independent code/visual gates remain open.

## Current interfaces and monitor invariants

- `components/studio/scene/types.ts:4`: each StudioTarget requires one project ID, a concrete THREE.Mesh surface, and independently mutable MeshBasicMaterial border; StudioModel contains scene, targets and live occluders.
- `controller.ts:431` requires exactly one target for each PROJECT_IDS entry. `picking.ts:116` uses mesh identity and target ID, not node names or userData alone. Three project targets remain dissertation/copilot/typeforge.
- `build-studio.ts:265`: `${id} monitor` names the group, while face/border meshes are unnamed. Face metadata has interactive/projectId; border has interactive. An explicit imported-node mapping is therefore required.
- Face is a local +Z-facing XY unit plane at localZ0.054; border is at0.049 and width/height+0.055. They receive no shadow. Preserve UV/front-face orientation, physical separation and transformed projected geometry.
- `textures.ts:12` and `build-studio.ts:271`: screenTexture generates owned sRGB canvas textures at construction; face is unlit and toneMapped=false. Controller does not replace screen textures; `controller.ts:168` only changes border colour for selection/hover.
- Decorative fourth `studio` display receives texture but no target/border (`build-studio.ts:278`); it remains eligible opaque occlusion geometry.

Current root-group transforms (`build-studio.ts:296`):

| ID | Position | Width x height | Y rotation, radians |
| --- | --- | --- | --- |
| dissertation | [-1.61,2.38,-0.27] | 1.88 x 1.06 | 0 |
| copilot | [-3.11,2.44,-0.13] | 0.8 x 1.34 | 0.3 |
| typeforge | [-0.11,2.44,-0.13] | 0.8 x 1.34 | -0.3 |
| studio | [-1.61,3.52,-0.64] | 1.29 x 0.73 | 0 |

Fixed eye remains [-0.7,2.8,3.4], two world units/metre, heading0 toward-Z. This records current facts, not authorization to change framing.

## Batching, blockers and ownership

- `resources.ts:92` batches repeated geometry/material/shadow combinations into root-level instances and detaches originals. It excludes interactive meshes/material arrays, but has no imported-root exemption or preservation of arbitrary node names/userData/ancestor visibility. Pilot survives because its9geometry combinations are unique.
- `build-studio.ts:568` collects live blockers after batching. It excludes interactive, material arrays, transparency, opacity<1 and depthWrite=false. Full-kit multi-material meshes would currently be omitted even though picker can examine per-face materials.
- Imported owner and procedural SceneResources are separate. Adapter-created faces/materials/textures need explicit ownership, and replaced imported materials still require disposal.
- Existing pilotRoot suppresses only old door/lamp geometry. A full room passed through the same branch would duplicate every other room/equipment component.
- Contacts are distributed across scene/desk/monitor groups; lamp decal stays at[4.72,0.118,-0.02], monitor contacts depend on postBottom. Transparent decals use depthWrite=false/renderOrder1.
- Hemisphere, one directional shadow light with fixed frustum, and4point lights are constructed independently after equipment (`build-studio.ts:535`). Their positions are hardcoded; asset replacement does not relocate them.

## Pilot assumptions requiring a separately agreed full-kit contract

`load-pilot.ts` is deliberately restricted to9unique direct roots with baked identity transforms, exact names/materials, right-limit opaque blocker metadata, limited attributes/extensions and pilot budgets. It classifies bounds as door or lamp only; URL and scale2/Y+0.11 are explicit. These checks must not silently be loosened and presented as the same approved profile.

S must agree with the actual Claude author and Codex adapter owner before full-kit integration:

1. Named nodes for3faces/3borders/decorative display and ownership of runtime screen/border materials.
2. Hierarchy, shared meshes, instancing and multi-material export policy; corresponding batching and blocker handling.
3. Exact procedural components retained for lighting, contacts and content, with no duplicate room/equipment.
4. Common origin, units, axes, floor offset and full-room bounds. Preserve single placement rather than stacking pilot and full-kit transforms.
5. Explicit ownership of new profile/interface/adapter and isolated writes; preserve current pilot profile, sources and failed evidence.

Existing provider split remains: Claude artistic source/material/light/composition; Codex technical adapter/resources/tests; S integration contracts; root browser/build/final acceptance. No new dependencies or paid jobs. All required personal equipment and coherent editable Blender source remain in G003 scope.
