# G2 scene runtime handoff

18 November 2026. **G2a/G2b implemented; bounded CPU/static checks pass.** This is a staged optional runtime, not production, visual, placement or performance acceptance. Root owns application activation, build/preview, browser checks and Git. See [interface](interface.md), [checkpoints](checkpoints.md), [verification](verification.json), [source pins](source-pins.json) and [motion enclosure](envelope.md).

## Public seam and ownership

`assistant?: {snapshot: PresentationSnapshot; panelOpen: boolean; presentationEpoch: number; attentionRequested?: boolean}` and optional `onActivateAssistant`, `onAssistantHoverChange`, `onRobotStatusChange(SceneStatus)` are frozen in `lib/studio-contract.ts`. Existing `reducedMotion`/`interactionEnabled` remain authoritative. Root passes the same immutable snapshot object to panel and scene; StudioScene forwards current callbacks and delivers props with layout effects, before the next painted canvas frame. Root's later assembly changes are separate from G2; no caller was edited here.

Absent assistant input performs **no robot dynamic import, asset request, allocation or behavior**. Add/remove input creates/aborts its own generation. Robot failure preserves the room and HTML; a draw failure retries the room once after removing the optional attachment. A room/WebGL context failure still uses the existing room failure boundary. There is no automatic robot retry; removing/readding the optional input creates a new lifetime. Root's HTML remains available during loading/failure and when the avatar is outside the camera view.

`ready` means validated attachment included in a successful render of a visible/in-view, nonzero canvas. It is not an appearance verdict or a claim that the avatar is in the camera frustum on every view. Diagnostics after successful render are `canvas.dataset.assistantRunId`, `assistantRevision`, `assistantCardCount`; existing scene draw/triangle/resource/render counters remain. Browser checks can correlate those with root's committed snapshot.

## Exact owned changes

- `components/studio/StudioScene.tsx`: layout-phase delivery and current optional callbacks.
- `lib/studio-contract.ts`: optional typed input and callbacks; type-only G1 snapshot reference.
- `components/studio/scene/controller.ts`: optional dynamic import/lifetime, successful-render readiness, current snapshot delivery, one finite RAF clock, suspension and composed activation.
- `components/studio/scene/picking.ts`, `types.ts`: discriminated project/assistant targets; all live opaque robot parts/cards block both project rays, including the original expanded-touch finger ray. Only rendered head/body surface pieces activate; tray/hands/bookmark/cards only block. Existing project44px expansion and mouse/pen precision remain.
- `components/studio/scene/verify-controller.mjs`: preserved controls plus G2 integrated CPU fixtures using the actual exported asset.
- New `components/studio/scene/robot/`: loader/resource owner, presentation/cards, small profile and derivation/verification helpers. No request transport, parser, store or source-selection action.
- `public/studio/assistant-apprentice-v03.glb`: byte-identical pinned candidate.
- This new evidence directory only.

No room/camera/light/profile edits, imported material clones/appearance changes, new dependencies, servers, browser helpers, Blender work, paid operations, builds, `.next` writes or Git mutations were performed.

## Asset, data and motion

GLB SHA256 `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12`, **673144 bytes**; reported source compression is482957 gzip /334311 Brotli bytes, not measured network transfer. Runtime profile is14212 bytes, SHA256 `102cfdd0178f4cb9e301ce2feaeb82df0b9701ab60f9379f8cdaac18e208a447`. `derive-profile.mjs --check` reproduces it from hashed v03 profile/poses/export and v02 validation/technical handoff. The authoring/evidence corpus is not imported by the browser.

The loader verifies exact size/SHA before parsing and enforces the narrow texture-free single-scene format,22 semantic nodes,10 moving bindings,21 unique geometries/seven materials,37676 triangles, finite transforms/geometry, named parents/materials and preserved opaque/noncasting policy. Both independent-review reusable-validator gaps have explicit guards and sensitivity probes: reject `skin:0` by presence and require finite POSITION min/max. Existing frozen validators remain untouched. Installed r187 parser hooks own allocations through failures/late resolution; each private geometry/material identity disposes once. Generated cards have a separate two-geometry/one-material owner. Eye intensity1 and the imported tray emission product remain constant.

Wrapper is position[0.80,2.80,-0.20], normalized quaternion[0,-0.19612,0,0.98058], scale1.6 exactly once, no floor offset. Five target poses use actual APA glTF metadata, including angular lower lids. Finite250 ms nonovershooting transforms and at most one dismissal-return segment replace the historical demonstration beats; selection uses the approved6 mm/1.15 cue over120 ms. Done/selection revisions do not replay presentation. Reduced motion, hidden/offscreen/zero size and late arrival settle the newest target without replay.

Every valid hit is a simultaneous display-only marker in current run/key order; no fake cards, source text/scores, fades, stagger or minimum-stage timer. Data replaces/clears before the next render even when the pose stays attention. New source identities reset selection transforms; only matching current keys lift. Empty retrieval stays attention until G1 supplies validated no-match. Panel-open disables scene activation even if a caller mistakenly leaves interactionEnabled true; project modals still depend on root's shared interaction flag. The existing trusted pointer/down/up/compatibility-mousedown/click pipeline remains the only activation path, with HTML Ask providing accessible access.

## Validation and remaining gates

82 targeted tests passed against real installed Three objects, the actual GLB and real G1 reducer snapshots. Fresh direct nonincremental TypeScript and scoped ESLint passed; no Next typegen/build ran. `verify-envelope.mjs` passed5000 deterministic trajectory observations plus a separate analytic continuous enclosure and card/eye bounds. Details and exact commands are in verification.json. DOM/renderer test shims do not prove browser focus, trusted native input, GPU disposal, frame presentation, FPS or device behavior.

Expected robot-only primary pass ceiling is21 imported draws +0..4 card draws; all four cards add304 triangles (37980 total), two geometries and one material, no textures/shadows. These are structural CPU counts, not measured renderer or combined-room allocations. Runtime JS/chunk sizes, actual transfer, startup cost, frame times and mobile budget remain unmeasured.

The interruption/card enclosure retains negative conservative P2 margins: wall lights-3.415179 degrees, TypeForge-1.972639, speaker-0.714601. Root must resolve actual in-room silhouettes/cards, interruption behavior, desktop/modal readability, phone-home off-frame discovery, combined costs and browser lifecycle/input checks with exact built bytes. Independent G2 technical review and actual Claude in-room review remain. V03 isolated visual PASS and the independent v02 import PASS do not close those gates.

Implementation references: installed `node_modules/three/examples/jsm/loaders/GLTFLoader.js` r187 parser hooks were checked alongside upstream [GLTFLoader documentation](https://threejs.org/docs/#GLTFLoader) and [resource cleanup guidance](https://threejs.org/manual/en/cleanup.html). No unfamiliar loader API was inferred from a different room schema.
