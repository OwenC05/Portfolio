# Independent S technical critique

**Verdict: REQUEST CHANGES.** One reproduced A1 correctness gap and one meaningful input-test gap require the technical performer's attention. The border exclusion is a separate nonblocking contract recommendation. No critical/high-severity issue was established; two medium findings and one low recommendation are ranked below. This is a completed bounded review of the preserved Three.js prototype, not final product, visual or browser acceptance.

Independent reviewer: actual Orca `codex`, task `task_788766abc9dc`, dispatch `ctx_212467b7a346`, terminal `term_2b3875c7-ea64-457b-84e6-e89b6487492a`. No model/effort override or helpers. Neither performer authored this critique. Coordinator message `msg_494db02d8b4f` preserves this technical review while deferring further art refinement to asset authoring. Repairs go through S to the owning performer; this review makes no product edits.

Reviewed `lib/studio-contract.ts`, `StudioScene.tsx`, every file in `components/studio/scene/`, common/routing/approved PRD/test spec, clarified brief, technical handoff/A1 review, frozen contracts, performer report, art direction and retained verification records. Exact hashes, including the input documents, are in [technical-critique-hashes.json](scene-coordination/technical-critique-hashes.json).

## Ranked findings

### S-T1 — MEDIUM, blocking A1: expansion bypasses another target's rendered back under the finger

**Location:** `components/studio/scene/picking.ts:130-146` and `:169-175`; missing combined case in `verify-controller.mjs:1204-1239` / `:1259-1274`.

The exact path correctly rejects a foreground target's rendered back at line 137. After that rejection, expansion remembers only `opaqueHits()[0]` from `model.occluders`; selectable surfaces are excluded from that list. If the back-facing foreground target covers the finger but leaves the expansion sample on a rear target clear, the later visibility ray sees the rear target and the input-depth check has no blocker. This violates the stated rule that foreground geometry under the actual finger cannot be bypassed.

Independent probe `other-target-back-under-expanded-finger` in [technical-critique-probes.mjs](scene-coordination/technical-critique-probes.mjs) constructs a 0.1-unit front-facing rear plane at z=-5 and a narrow opaque double-sided, back-facing *other target* at z=-3. At CSS (270,250) in a 500x500 viewport, independent Three rays establish the foreground hit at distance **3.003198295151354**, camera depth **3**, inside near/far; the central ray independently reaches the rear plane at distance **5**. Exact picking returns null, but expanded picking returns **dissertation**, where null is required. The clear rear exact hit and unobstructed expanded hit both remain positive controls. Including the same foreground plane as an opaque blocker makes the expanded result null.

**Scope:** demonstrated synthetic contract failure, not a claim that the current fixed-eye, front-sided monitors exhibit this overlap. Current real-model samples below found no exact occlusion violation. The synthetic case matters because A1 explicitly requires back-face and foreground-safe expansion, and the implementation already promises this behavior for other targets.

**Repair owner:** technical performer (`picking.ts`, `verify-controller.mjs`). Preserve the nearest rendered opaque target intersection on the original finger ray as a potential blocker, including when that face is ineligible for selection; use its actual depth together with ordinary occluders when considering another target's expansion. Add the combined narrow-back-under-finger case with independent ray/normal/depth preconditions and clear exact/expanded positives. Keep target eligibility separate from its ability to occlude. Do not disable expansion globally.

### S-T2 — MEDIUM, verification repair: click-negative cases never satisfy the mousedown prerequisite

**Location:** `components/studio/scene/verify-controller.mjs:415-438`, versus `controller.ts:282-297`.

The test named “unrelated, programmatic and stale clicks consume no selection and cannot be retried” sends pointerdown/up, then click, without a trusted compatibility mousedown. Consequently `completed.mouseDown` remains false, and the early guard at controller line 293 rejects every attempt before the pointer identity and coordinate checks are reached. Its wrong-id, wrong-type, wrong-position and other negative expectations therefore provide misleading coverage for the guards they name. Production currently has those guards; this is a test defect, not evidence that current trusted clicks ignore identity.

The independent `click-negative-test-guard-sensitivity` probe executes **only that named existing test**, removing the click identity and displacement guards **in memory**. All ten existing variants still pass. Supplying a trusted mousedown before the candidate click makes the same mutated controller fail immediately on `wrong-id`, selecting dissertation. Neither the product file nor the performer's suite was modified. The final JSON records the pass/fail details; the qualified mutation failure is expected evidence, not a failure of the review runner.

**Repair owner:** technical performer. Qualify an otherwise valid completed gesture with trusted mousedown before varying one click property at a time; retain a valid positive control and the separate absent/untrusted-mousedown test at lines 1089-1100. Re-run those bounded tests and confirm removal of the relevant guard now causes the intended failure.

### S-T3 — LOW, nonblocking: separate batching exclusion from occluder exclusion

**Location:** `components/studio/scene/build-studio.ts:278-283`, `:550-560`; `scene/types.ts:14-15`; `scene-coordination/contracts.md`, internal camera/model agreement.

The collector traverses the live scene after batching, correctly retaining InstancedMesh objects. It nevertheless excludes all `userData.interactive`, which includes three opaque border planes as well as the selectable surfaces. The written contract excludes the surfaces only. The independent live-scene inventory found **78 registered blockers, 55 instanced**, and exactly **three omitted opaque non-target meshes**, all the dedicated borders. No detached blocker was found.

The borders lie at local z=0.049, behind their target faces at z=0.054, with a slightly larger footprint. Re-evaluating **3,023** in-viewport points on/near the actual rotated screen edges, over three viewports (1440x900, 390x844, 320x568), six yaw choices and three pitch choices, with the complete opaque non-target list produced **zero changed touch results**. There were **1,034 exact positive results**, **1,177 expanded-only positives**, and **zero independent exact-ray foreground violations**. This is finite sampling, not an exhaustive safety proof; it does show that this narrow exclusion is not the reproduced S-T1 cause.

**Recommendation to S/art owner:** collect blockers by excluding explicit target surface identities instead of using the broader anti-batching flag. That includes borders without altering their rendering or dedicated material ownership. Alternatively, explicitly document and test a narrowly justified border exception; do not silently generalize `interactive` to future opaque decorations. Material-array and `depthWrite:false` exclusions also narrow the general wording, but the current independent inventory found no additional opaque omissions attributable to them. No aesthetic change is proposed.

## Findings that passed the scoped source/evidence review

These are specific source conclusions supported by the retained CPU evidence, not browser certification:

- **Fixed eye, bounds and retained home:** `controller.ts:26-27,124-133,171-194` writes camera position only on construction, applies bounded yaw/pitch, chooses home at first usable size, and changes projection on resize. Selection changes border styling only. Existing tests at `verify-controller.mjs:723-765,931-1015` check perspective directions/eye, increasing commands, immutable reset home and pose through selection, panel disable/resize/enable, visibility and offscreen changes.
- **Independent command handling and cancellation:** `controller.ts:197-207,346-356` processes commands and interaction flags before the selection comparison. Finite strictly increasing sequence numbers are consumed once; null does not reset the high-water mark; disabled delivery advances it without applying, clears queued pre-ready commands and cancels gesture/activation/capture. This is a controller-lifetime monotonicity contract. The adapter at `StudioScene.tsx:12-28` forwards the additive fields and current callbacks without remounting on selection updates.
- **Pointer qualification and release boundaries:** `controller.ts:224-334` requires trusted primary matching down/up, an unchanged hit, threshold containment and a later matching trusted click after mousedown. It consumes activation on click, preserves only matching touch/pen zero-button post-release leaves, and cancels active leaves, drags, second pointers, blur, resize, hidden/offscreen and teardown. Mouse/pen held-button loss cancels capture. Tests at `verify-controller.mjs:353-413,441-509,951-978,1018-1100,1242-1255` exercise meaningful positive and cancellation behavior; S-T2 qualifies the separate click-negative matrix.
- **Native input ownership:** canvas `touchAction` is `pan-y pinch-zoom`; touch chooses its axis before horizontal capture and cannot turn a vertical gesture into look (`controller.ts:61,247-257`). Subscriptions are passive, there is no keyboard listener, and the global scroll listener only cancels candidates. Source and modeled events do not establish physical pinch/scroll behavior.
- **Most A1 coverage is independently grounded:** signed camera-space corner depths, raw Three rays, Float32 tangent endpoints, material/ancestor visibility and depth-sorted ordinary/instanced blocker hits establish fixture preconditions independently of the picker. Exact and expanded positive controls are present. Real rotated screens are reachable under the controller, and independent music-view rays establish monitor misses. S-T1 is a missing combination of otherwise tested conditions, not a reason to discard those tests.
- **Demand rendering and resources:** one pending RAF is coalesced and suspended while hidden/offscreen (`controller.ts:63-153`); DPR caps remain 2/1.5. Renderer shadows use `autoUpdate=false`, with exactly one casting light validated (`:370-388`; actual art at `build-studio.ts:528-547`). Cleanup attempts subscriptions, shadow maps, all resource ledger entries and renderer releases independently, and disposal is idempotent (`controller.ts:68-94`; `resources.ts:28-46`). Retained tests cover partial construction/render/context failures, throwing release handlers and five modeled mount/cleanup cycles. No additional failure-semantic regression was found. Actual GPU reclamation is outside this evidence.

## Commands, evidence and limits

Fresh review command: `node design/studio-v2/scene-coordination/technical-critique-probes.mjs` — **exit 0**, Node **v24.21.0**, final output [technical-critique-probes.json](scene-coordination/technical-critique-probes.json). Exit 0 means the probe completed with its independently asserted preconditions; the JSON explicitly records both reproduced findings. The earlier geometry-only revision also exited 0. The first test-sensitivity revision exited 1 because the review VM omitted the `EventTarget` global (selected-test count was 0); adding `EventTarget`/`Event` to that review-only VM fixed the harness. No product fix or weaker geometric expectation was used to obtain the final exit.

Existing performer commands were **read and hash-bound, not redundantly rerun**:

| Command | Recorded result | Evidence |
| --- | --- | --- |
| `node --test components/studio/scene/verify-controller.mjs` | Exit 0; 51 pass, 0 fail/skip | `scene-technical-tests-final.md` |
| `node components/studio/scene/verify-types.mjs` | Exit 0; scene/import roots, zero diagnostics, no emit/incremental writes | `scene-technical-types-final.md` |
| `node node_modules/eslint/bin/eslint.js components/studio/scene/controller.ts components/studio/scene/picking.ts components/studio/StudioScene.tsx` | Exit 2; configured missing `@typescript-eslint/eslint-plugin` | `scene-technical-lint-initial.md` |
| Installed ESLint API with `useEslintrc:false`, `next/core-web-vitals`, installed TypeScript parser; five scoped files | Exit 0; 0 errors/warnings | `scene-technical-lint-supplemental.md`; exact invocation in performer report |

Read-only inspection used `git status --short`, `git diff --stat`, scoped `git diff -- ...`, `git rev-parse HEAD`, `rg`, numbered `Get-Content`, and `Get-FileHash -Algorithm SHA256`. Git/reads/hash commands completed successfully; relevant scene sources are **untracked**, so the empty scoped Git diff is not evidence of unchanged baseline implementation. HEAD is `e42b010d61736511e4257249dacb2954658ebe9f`. An initial `orca orchestration check --from ...` was rejected as `invalid_argument`; the documented recovery `orca orchestration check --terminal term_2b3875c7-ea64-457b-84e6-e89b6487492a --json` succeeded and supplied the steering above. An `rg` memory lookup and repository AGENTS lookup returned no matches; no historical memory claim is used.

No build/server/browser/UI/package/source changes, no art judgment, no helper agents. Fresh probes use real installed Three geometry, matrices and raycasts with inert Canvas2D; event trust/propagation and React effects in retained tests are modeled. Real React StrictMode cleanup, trusted compatibility-focus traces, physical pen/touch, scrolling/pinch, GPU/heap reclamation, actual draw/triangle/transfer/timing budgets and visual acceptance remain root-owned and unproved here.

## Exact reviewed source snapshot (SHA256)

The closing hashes match the initially reviewed sources and the performer report's listed hashes. Paths below beginning `scene/` are under `components/studio/`.

| File | SHA256 |
| --- | --- |
| `lib/studio-contract.ts` | `64F88FD30B896C88C87A5631349BBB2BB9A3BC8676C0A1A816F1E5720902C84D` |
| `components/studio/StudioScene.tsx` | `29586D8A880AD079627E9E8D670F46A60C4614B221B17BBCEFEB54112327E5AC` |
| `scene/build-studio.ts` | `364DA680F5111138207A03A72579D7E6491A5E4FC09F8786B5DE794D69FB1EC3` |
| `scene/controller.ts` | `F04F7E9F2B4CA082C81A5447343D825B34602CA6BE2B09B3EDD5610EFA6B4847` |
| `scene/picking.ts` | `31F4546ED1480C8D5FD99CE0ED42F64387E6002199AC7D506F73649211E35B60` |
| `scene/resources.ts` | `756A26FBA1840696FD7B8F0A24DFA588A50488A55FBC99BEC60CA3C0E14CB509` |
| `scene/textures.ts` | `09F6FF6CC7BB8910F09838566DFCF840D85A0D2CE1BE8D064DEAFB0989C63AA6` |
| `scene/types.ts` | `090288AA14EFBE6AD6C2E95FD38202D2E86CC5530785DA40DC272390FB18200A` |
| `scene/verify-controller.mjs` | `0A8C66647CDCFA27F46EBD2DEAB3682CFC7AA569AF402D3EC27C5B6F007D8020` |
| `scene/verify-types.mjs` | `7A684D6E38384C80B57FECB63D24DB6FCF6E8EAC24CDB6F4918C451EBE066947` |
| `scene/view-config.ts` | `1FEA7ADBCFD730A56920389C8AC4ECF8323C9739FD4882C15F3E134A11F1A450` |

Review-owned outputs are this report and `scene-coordination/technical-critique-{probes.mjs,probes.json,hashes.json}` only. **Next owner action:** S routes S-T1/S-T2 to the technical performer and resolves the nonblocking S-T3 recommendation with the model owner; then obtain a bounded re-review of those deltas. Current critique is complete; no repair, visual refinement, asset integration or root acceptance is performed by this worker.
