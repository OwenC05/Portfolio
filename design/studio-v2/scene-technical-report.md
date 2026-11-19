# Studio v2 scene technical performer report

Status: bounded S-T1/S-T2 repairs ready for independent re-review; 54/54 targeted CPU tests pass, scene-rooted TypeScript passes, supplemental installed Next lint passes. The original independent verdict was REQUEST CHANGES; the repaired delta awaits its verdict through S. Root has preserved the visual prototype and explicitly permitted these technical repairs; no visual, asset or product scope is added. Earlier evidence below remains historical; the repair section gives the current hashes and results.

## Identity and ownership

- Actual Orca provider: codex, with no model/effort override, as recorded in scene-coordination/dispatch-receipts.md.
- Task task_e9f6c6456600; dispatch ctx_126044f79bb6; worker term_3971dddc-c073-4cd9-ac6c-5892ef518403; S coordinator term_d778dd3c-3d00-45ad-b8a3-c9fdcaee8e94; S Run run_63fe6fcaad85.
- Performed directly without helpers. Followed common.md, routing addendum, approved PRD/test spec, A1 review, technical evidence handoff and S frozen contract.
- Changed: components/studio/scene/controller.ts and verify-controller.mjs. Added: scene/picking.ts and scene/verify-types.mjs. Added only design/studio-v2/scene-technical*.md evidence/report files.
- StudioScene.tsx required no source change: its existing whole-props update and current-callback refs already forward both additive fields without a remount. Extended its CPU hook fixture to prove viewCommand and interactionEnabled propagation with unchanged selection. The controller update type now consumes both fields independently.
- No lib contract, types, resources, art/config/model/texture, UI/CSS/content/package, runtime-state or unrelated-file edits. No build, server, browser, dependency, paid-media, commit or deploy actions.

## Behavior

The camera is PerspectiveCamera with a position copied once from Claude's STUDIO_VIEW. All art values (eye, homes, bounds, FOV, near/far) remain in the art-owned config. Heading zero faces -Z; positive yaw is +X and positive pitch is +Y. The first usable viewport chooses the immutable reset home. Resize can change FOV/aspect/DPR but never the stored pose or reset target. Selection, panel disable/enable, visibility resume and reduced-motion changes never change the pose.

Commands use a finite strictly increasing sequence within one controller lifetime. A high-water mark ignores duplicates and older/out-of-order deliveries; null does not reset it. Disabled updates consume newer sequences without applying them, clear pending pre-ready commands, gestures, qualified activation and hover, and release owned capture immediately. No replay occurs on re-enable. Enabled commands arriving before the first usable viewport queue until home exists. This is a documented caller monotonicity assumption, with no extra public fields. Direction commands move 10 degrees and clamp; direct drag uses 0.12 degrees per CSS pixel with no interpolation, inertia or camera translation.

Mouse/pen primary drag owns capture only after the 8px threshold and changes yaw/pitch directly. Touch decides its axis first; horizontal ownership changes yaw only, while vertical remains native and cannot later become look. Canvas touch-action is pan-y pinch-zoom. The listeners are passive and no keyboard/scroll preventDefault or page-wide key handling is installed. Release/cancel paths include pointerup/cancel, capture loss, no-held-button moves, second pointer, blur, resize, hidden/offscreen and dispose. Pointerup qualifies selection, but only a matching trusted canvas click after trusted compatibility mousedown commits it. Completed non-hover pen/touch out/leave is preserved only for the same identity, with no active gesture and zero held buttons. Selection invokes the UI callback synchronously from click and does not change orientation.

The new nonvisual picker reads live matrices and the post-batch model.occluders list. Exact hits consider opaque foreground blockers, target order, effective ancestor/material visibility, material side, physical front side and camera-space near/far clipping. A rendered back of another double-sided target cannot expose a deeper target. Touch uses actual projected triangles clipped to the viewport/far plane, rejects nonfinite or near/camera-plane-crossing surfaces conservatively, rejects zero-area clipped projections, and derives a bounded minimum 44 CSS pixel footprint. A fresh ray must prove a nearby point on the target is visible, and foreground under the actual finger cannot be bypassed by expansion. Mouse and pen stay exact. Target ties are canonical and independent of model array order.

Demand rendering, desktop DPR <=2 / small DPR <=1.5, one static shadow pass, terminal failure status, per-resource release attempts and idempotent teardown are retained. Canvas datasets expose studioYaw, studioPitch, studioEye, studioFov and studioInteractionEnabled alongside existing DPR/render/drawcall/triangle/resource counters for root's factual capture.

## Verification and retained failures

| Command / scope | Result | Evidence |
| --- | --- | --- |
| node --test components/studio/scene/verify-controller.mjs | Exit 0; 51 tests, 51 pass, zero fail/skip | scene-technical-tests-final.md |
| node components/studio/scene/verify-types.mjs | Exit 0; zero diagnostics | scene-technical-types-final.md |
| node node_modules/eslint/bin/eslint.js components/studio/scene/controller.ts components/studio/scene/picking.ts components/studio/StudioScene.tsx | Exit 2; inherited missing @typescript-eslint/eslint-plugin before linting | scene-technical-lint-initial.md |
| Installed ESLint API with useEslintrc:false, cache:false, extends next/core-web-vitals, installed TypeScript parser; controller, picker, adapter and two verification scripts | Exit 0; five files, zero errors/warnings | scene-technical-lint-supplemental.md |

verify-types.mjs reads the existing tsconfig and checks controller/adapter roots plus imported dependencies with noEmit:true and incremental:false. It performs no Next build and writes no generated Next/types/tsbuildinfo files. This is scene-scoped validation, not the integrated full-project typecheck owned by I.

Supplemental lint invocation, supplied to node on stdin (no config file or dependency edits):

```js
const { ESLint } = require('eslint');
(async () => {
  const lint = new ESLint({ useEslintrc: false, cache: false, overrideConfig: {
    extends: ['next/core-web-vitals'], parser: require.resolve('@typescript-eslint/parser')
  } });
  const results = await lint.lintFiles([
    'components/studio/scene/controller.ts', 'components/studio/scene/picking.ts',
    'components/studio/StudioScene.tsx', 'components/studio/scene/verify-controller.mjs',
    'components/studio/scene/verify-types.mjs'
  ]);
  console.log(JSON.stringify(results.map(({ filePath, errorCount, warningCount, messages }) =>
    ({ filePath, errorCount, warningCount, messages })), null, 2));
  process.exitCode = results.some((result) => result.errorCount || result.warningCount) ? 1 : 0;
})().catch((error) => { console.error(error); process.exitCode = 1; });
```

The original failures remain on disk:

- scene-technical-tests-initial.md: first adapted run recorded a coincident-target ordering defect plus art model assembly without occluders. The former was fixed by canonical target ray order; the latter resolved when Claude supplied the final post-batch list. The first shell wrapper returned Get-Content's success rather than preserving node's exit, so only the failing test summary is authoritative for that run; subsequent wrappers explicitly record and return the node exit.
- scene-technical-tests-second.md: exit 1, 47/48 pass; sole failure was the still-assembling art model lacking occluders.
- scene-technical-types-initial.md: exit 1, the same missing model.occluders field. No technical-owned source diagnostic was reported.
- scene-technical-tests-third.md: exit 1, 49/50 pass; newly added tangent fixture assumed a decimal endpoint of 0.05, while PlaneGeometry stores Float32 endpoints. That created a real, tiny visible sliver. The fixture now uses the actual geometry bounding endpoint and independently asserts its projected tangent before expecting zero area. No production tolerance was loosened to make it pass.

Preserved regressions cover partial renderer/model/render failures, context loss during and after render, throwing disposal handlers, resource ledgers, five mount/cleanup cycles, canceled stale callbacks, observer/listener/RAF cleanup, demand coalescing, shadow pass count, trusted compatibility-focus ordering and non-hover pen boundaries. New tests assert camera direction/position, command high-water behavior with unchanged selection, disabled consumption, first-usable-size home, pose retention, captured drags and cancellation, horizontal/vertical touch ownership and held-button loss.

A1 tests independently establish ray misses, hit distances, signed camera-space corner depths, front/back geometry, viewport boundaries and actual Float32 tangent conditions before asserting selection results. They include visible exact/expanded positive controls; behind/camera/near/far cases; full and partial viewport clipping; effective visibility; double-sided backs; ordinary and InstancedMesh blockers; foreground located only under the expanded finger; and synthetic right-view grids. The real Claude model test reaches and selects all three monitors through the controller at desktop and portrait sizes with its actual live occluders. Additional actual-art right-limit probes independently miss monitor geometry and reject both mouse and touch selection at 18 music-view points across those sizes.

Obsolete v1 orthographic fixtures were deliberately replaced: whole-room bounding-box containment contradicts an interior eye view; world-to-CSS placement now uses perspective depth/FOV; the small-screen 44px cases now use explicitly sized synthetic surfaces rather than assuming the art must shrink to fit; and the old unrelated-mesh-can-never-block premise is replaced by explicit live opaque blocker tests. Existing failure/resource/cancellation assertions were retained. The adapter fixture remains a minimal hook scheduler, not real React StrictMode browser proof.

## Integration handoff and limits

Early assembled-ready sent to S as msg_230881c53248 before exhaustive tests. At that time STUDIO_VIEW/model were still assembling; final CPU/type evidence now includes the delivered art model/config. Root owns early actual screenshot inspection and browser/build leases. No source-side assertion substitutes for those images, immersion/art review, physical touch/pen behavior, full browser compatibility-focus traces, modal focus/history correctness, performance timings, transfer budgets or physical GPU/heap reclamation. CPU event trust and propagation are modeled deliberately; Canvas2D/WebGL are inert in the model harness, while Three geometry/matrices/raycasting are real.

For root capture: record canvas.dataset studioYaw/studioPitch/studioEye/studioFov/studioInteractionEnabled and studioRenderCount/studioDpr before/after look, opening/closing a project, resize, visibility and reset. Wait for the resize render to publish current DPR/drawing buffer before targeted input. Use actual trusted full mouse/pen/touch sequences, not isolated dispatchEvent or pointerup-only selection. Capture home/right-look/open-project at 1440x900, 390x844 and 320px; confirm no camera dataset change on selection/close, and inspect the resulting images at normal size. Direction commands must increase sequence; repeated values intentionally do nothing, including after null/disable.

Independent verdict: pending S's independent Codex technical reviewer. Root render feedback: pending through S; any technical corrections remain with this performer. No worker_done has been sent yet because the requested review/feedback handoff is outstanding.

## Source snapshot after targeted checks (SHA256)

The final test script hash below includes a subsequent comment-only clarification that the offset CSS fixture is synthetic; executable test code is the 51-pass run. Root/I must bind final integrated evidence to their own frozen source snapshot if art or interface changes afterward.

| File | SHA256 |
| --- | --- |
| components/studio/scene/controller.ts | F04F7E9F2B4CA082C81A5447343D825B34602CA6BE2B09B3EDD5610EFA6B4847 |
| components/studio/scene/picking.ts | 31F4546ED1480C8D5FD99CE0ED42F64387E6002199AC7D506F73649211E35B60 |
| components/studio/scene/verify-controller.mjs | 0A8C66647CDCFA27F46EBD2DEAB3682CFC7AA569AF402D3EC27C5B6F007D8020 |
| components/studio/scene/verify-types.mjs | 7A684D6E38384C80B57FECB63D24DB6FCF6E8EAC24CDB6F4918C451EBE066947 |
| components/studio/StudioScene.tsx (unchanged) | 29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC |
| components/studio/scene/view-config.ts (Claude) | 1FEA7ADBCFD730A56920389C8AC4ECF8323C9739FD4882C15F3E134A11F1A450 |
| components/studio/scene/build-studio.ts (Claude) | 364DA680F5111138207A03A72579D7E6491A5E4FC09F8786B5DE794D69FB1EC3 |
| components/studio/scene/types.ts (S) | 090288AA14EFBE6AD6C2E95FD38202D2E86CC5530785DA40DC272390FB18200A |
| components/studio/scene/resources.ts (unchanged) | 756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509 |
| lib/studio-contract.ts (S) | 64F88FD30B896C88C87A5631349BBB2BB9A3BC8676C0A1A816F1E5720902C84D |


## Bounded independent-review repairs: S-T1, S-T2 and S-T3 inventory support

Authorization: S message msg_f092c5e601a1, relaying the completed independent Codex critique and root's explicit bounded-repair direction. Same performer/task/dispatch identity as above. Changed only picking.ts and verify-controller.mjs in this repair; controller, adapter, model, config, resources, types, textures and lib contract retain the hashes from the reviewed snapshot. No helper, browser, server, build, model/art/asset or package work was performed.

**S-T1 repaired:** the original finger-ray blocker query now includes opaque intersections from target surfaces as well as model.occluders. This deliberately includes a rendered target back even though that face cannot select. Existing effective visibility, material/side, opacity and camera clipping checks still apply; the nearest actual intersection depth gates expansion. The sample ray still has to prove a visible target, and clear exact/expanded controls stay positive. The exact selection path and controller behavior were not changed.

The new combined regression uses the critic's 0.1-unit rear face at z=-5 and narrow 0.04-by-0.2 double-sided target back at z=-3 under CSS (270,250). Independent Three intersections establish the other target is first under the finger, its normal faces away, its camera depth is approximately 3 within near/far, and the center ray still reaches the rear target. It asserts clear exact selection, no exact selection of the back, an unobstructed expanded positive when the foreground is hidden, rejection when opaque foreground returns, and an expanded positive when that foreground is translucent. This failed on the old picker and passes after the small blocker-query change.

**S-T2 repaired:** every click-negative matrix case now first proves a valid trusted selection, then completes a fresh pointer gesture with trusted compatibility mousedown before varying the candidate click. The missing and untrusted mousedown cases remain separately exercised. The new in-memory sensitivity test executes only that qualified matrix twice: removing the identity guard must fail at wrong-id; separately removing the displacement guard must fail at wrong-position. Both failures must be deepStrictEqual selection failures with actual dissertation versus expected empty, not VM/setup failures. No product file is mutated by these probes; the outer test passes only when both intended mutant failures occur.

**S-T3 narrow exception support:** the actual-model inventory independently traverses live effectively visible meshes and checks opaque materials, including arrays and regardless of the broad interactive batching flag. All registered blockers must still be live. Exactly six opaque omissions exist: the three exact selectable surface objects and one dedicated border-material mesh per target. Each border shares its target's parent and remains behind its selectable face in that shared local frame. The test rejects any other opaque omitted decoration. This supports S documenting only the present dedicated-border exception; it does not authorize an arbitrary interactive-geometry exclusion. No model/collector change was made.

### Repair commands and retained evidence

| Command / evidence | Exit and result |
| --- | --- |
| node --test --test-name-pattern 'S-T1\|S-T2\|S-T3\|unrelated, programmatic\|trusted canvas click' components/studio/scene/verify-controller.mjs; scene-technical-repair-before.md | Exit 1. First regression-harness run: S-T1's strict floating-point depth equality and S-T2's whole-message equality failed. These are preserved fixture/assertion mistakes; depth now uses 1e-12 tolerance and mutation matching uses the named first message line plus exact operator/actual/expected checks. |
| Same bounded command; scene-technical-repair-reproduced.md | Exit 1, 4/5 pass. Before changing picking.ts, all fixture preconditions and S-T2/S-T3 passed; the sole failure reproduced S-T1, selecting dissertation through the foreground back instead of null. |
| node --test components/studio/scene/verify-controller.mjs; scene-technical-repair-tests.md | Exit 0, 54/54 pass, zero failures/skips. Includes both expected in-memory guard-removal failures and the real-model inventory. |
| node components/studio/scene/verify-types.mjs; scene-technical-repair-types.md | Exit 0, zero scene/import-root TypeScript diagnostics, no emitted/generated files. |
| Same installed ESLint API invocation documented above, scoped to picking.ts and verify-controller.mjs; scene-technical-repair-lint.md | Exit 0, two files, zero errors/warnings. The inherited configured-lint missing-plugin failure remains explicit and was not redundantly rerun. |

The test-name pattern above uses literal regex alternation pipes inside the shell-quoted argument (the Markdown table escapes those pipes for display). All repair wrappers capture node's LASTEXITCODE, append it to the evidence file, and return it. The pre-repair logs and original independent critique remain untouched.

### Current repaired source snapshot

| Changed file | SHA256 |
| --- | --- |
| components/studio/scene/picking.ts | C427B0553DD2403500F7AC0E306A42C5B1476A6A8AB3175186704261D638261C |
| components/studio/scene/verify-controller.mjs | 3CAC02D52E2B36F57CAD0AE53486DA8FDF289A1AFA6CDF2B978B45B7C983CE44 |

Fresh hashes verified controller F04F7E9F2B4CA082C81A5447343D825B34602CA6BE2B09B3EDD5610EFA6B4847, model 364DA680F5111138207A03A72579D7E6491A5E4FC09F8786B5DE794D69FB1EC3, config 1FEA7ADBCFD730A56920389C8AC4ECF8323C9739FD4882C15F3E134A11F1A450, adapter, resources, types, verification helper and contract all unchanged from the earlier snapshot. Texture SHA256 is 09F6FF6CC7BB8910F09838566DFCF840D85A0D2CE1BE8D064DEAFB0989C63AA6, also matching the independent review snapshot.

Independent re-review verdict is pending through S. No worker_done is sent until that verdict arrives, per the latest coordinator instruction. CPU/modelled event and no-browser/device/performance limits above still apply; the repaired prototype is not promoted to visual/product acceptance.

### S-T3 model-owner confirmation after repair-ready

S message msg_1997366ba81d confirms Claude model-owner approval of the precise three-border exception (owner receipt msg_c3afbb1cc9b3). S updated only the contract prose and the StudioModel.occluders comment; I read the current files and verified that no fields or runtime behavior changed. The new scene/types.ts SHA256 is 0085B8D6B3ACF8E545B38EF58463D1A1BD82AF4F5CAA2E88002F40EC6E271104; scene-coordination/contracts.md is 4C3237391ED2245FE1FF8DA5F073B92F127B937DDD7FA5B7D808A78B045E9B39. These supersede the earlier comment/document hashes only. The model remains 364DA680F5111138207A03A72579D7E6491A5E4FC09F8786B5DE794D69FB1EC3, picker C427B0553DD2403500F7AC0E306A42C5B1476A6A8AB3175186704261D638261C, and test script 3CAC02D52E2B36F57CAD0AE53486DA8FDF289A1AFA6CDF2B978B45B7C983CE44. No redundant runtime rerun was needed for this comment-only owner change; the existing S-T3 inventory enforces the exact approved exception. Independent re-review remains pending.

## Final bounded technical approval — 15 November 2026

**Complete: independent repaired-source verdict APPROVE.** This closing entry supersedes the pending-review status above. S authorized closure in msg_b59da19f1e9f after the independent Codex re-review, task task_1707db15bd3d / dispatch ctx_b7c401f35669, recorded in [scene-technical-re-review.md](scene-technical-re-review.md). No unresolved finding remains in the bounded technical slice.

The reviewer independently proved S-T1 against original and mirrored foreground-back geometry with clear exact/expanded positives and an in-memory repair reversal; S-T2 against separate pointer-ID, pointer-type, displacement and mousedown mutations; and S-T3 by showing an extra opaque interactive omission causes the inventory regression to fail. Its probe exited 0 after asserting those expected mutation failures. The 54/54 CPU, scene TypeScript and scoped supplemental lint records were read and hash-bound; the configured lint missing-plugin limit remains unchanged.

I read the approval and freshly confirmed the approved picker hash C427B0553DD2403500F7AC0E306A42C5B1476A6A8AB3175186704261D638261C and test hash 3CAC02D52E2B36F57CAD0AE53486DA8FDF289A1AFA6CDF2B978B45B7C983CE44. This closure appends documentation only; no source was changed after approval. Original task task_e9f6c6456600 / dispatch ctx_126044f79bb6 is ready for its single succeeded worker_done.

The approval is limited to this controller/input/picking and regression-test work. Asset-validator review, loader/runtime integration, browser/device/performance evidence, art quality and final product acceptance remain separately gated. S explicitly directs that no loader/product integration begin until a new bounded dispatch and internal contract freeze; this performer starts none.
