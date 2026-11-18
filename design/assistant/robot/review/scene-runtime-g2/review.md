# G2 runtime source review — REVISE

Independent Codex review, 18 November 2026. Scope is the delivered optional robot runtime and its CPU/source handoff. Two P2 exception-cleanup defects remain. Normal parsing, disposal, current-source presentation, lifecycle fencing and the targeted interaction controls pass. This is not a deployment, appearance, placement, browser or device approval.

Only this new review directory was written. The previous G4/G3/asset reviews, application files and durable tests were preserved. Root's `components/studio/StudioExperience.tsx` and `tests/assistant/studio-experience.test.cjs` remain outside immutable-input claims and were not evaluated as repaired candidates here.

## Ranked findings

### P2 / R1 — detachment exception bypasses the imported resource owner

**Location:** `components/studio/scene/robot/load-robot.ts:129`; caller `components/studio/scene/controller.ts:119–131`.

The returned asset's disposal executes `root.removeFromParent()` before `owner.dispose()`, without a `finally` or independent guard. Installed Three dispatches the root's `removed` event during detachment. If a listener throws, the root is detached but the geometry/material owner is never drained. The controller catches the error, forgets the asset and continues rendering the room, so its outer guard cannot finish the skipped releases.

**Reproduction:** `node --test --test-name-pattern="throwing root removal" design/assistant/robot/review/scene-runtime-g2/probe.test.mjs`.

The probe loads the actual pinned GLB, attaches it through the actual controller, registers a throwing `removed` listener, then removes the optional assistant input. Observed: root detached, assistant registration removed, room renderer still live, **0/28 imported geometry/material identities received disposal**. Expected: all 28 independent releases attempted. The assertion exits 1. See `probe.test.mjs:223` and `ROOT_RELEASE_EVIDENCE` in [the captured run](independent-probes.txt).

**Repair recommendation:** guarantee the imported owner is drained even when detachment throws, preserving generation invalidation and the existing independent release guards. Add this failure control to the appropriate durable test. No repair was made in this review.

### P2 / R2 — one card release exception skips the other owned resources

**Location:** `components/studio/scene/robot/cards.ts:42–47`; `components/studio/scene/robot/presentation.ts:127`; caller `components/studio/scene/controller.ts:129`.

The card owner sets `disposed = true`, removes all cards, then calls three resource disposals in one unguarded sequence. A throw from the first geometry skips the second geometry and material. The presentation/controller catches only outside that sequence; subsequent disposal cannot retry because the presentation/card owners are already marked disposed.

**Reproduction:** `node --test --test-name-pattern="generated-card release exception" design/assistant/robot/review/scene-runtime-g2/probe.test.mjs`.

With actual imported geometry and actual generated cards, a throwing first-geometry `dispose` listener followed by optional-input removal yields **1/3 card resource disposal notifications**, while all 28 imported resources release and the room remains live. The assertion exits 1. See `probe.test.mjs:203` and `CARD_RELEASE_EVIDENCE` in [the captured run](independent-probes.txt). The separate normal-removal control releases all **31/31** identities.

**Repair recommendation:** guard each owned card resource release independently, and ensure a card-detachment exception cannot bypass those releases either. Preserve single ownership and idempotence.

Both findings use deliberate exception injection; neither asserts a leak during the tested ordinary path or measures retained GPU memory. They expose incomplete failure isolation under the existing disposal contract (`integration/state-contract.md:157`) and the handoff's once-per-private-resource claim. They are narrow source repair requests, not a request for a new framework or additional runtime owner.

## Pinned inputs and payload evidence

[Before](source-before.json) and [after](source-after.json) record every exact SHA256 and byte count: **24 delivered owned inputs + 11 read-only references + 5 profile inputs, all 40 matching before/after**. The authored `source-pins.json` itself remains SHA256 `1e28ce86ee9f1a72b05cdfd8d9598f5c3daea16227d817ec33e0c4ea5dfce28d`. The ledger includes all 24 entries rather than only the files named below.

| Reviewed input | SHA256 |
| --- | --- |
| `controller.ts` | `88f24c7ac899c1639ec2596d3545f92dbe845473d901c6d805ca28b33ebb6ffd` |
| `picking.ts` | `cefc0ca653b44ea4892fe54e82d5676a700741f5e6766cc841453795216fddc9` |
| `StudioScene.tsx` | `bed95661809ae444829c0daaf30222a84c8c16e6bef721b417f342a5ef4a31b1` |
| `robot/load-robot.ts` | `33d2cd75b3e146a76a744023d25d2bc80158336c5f121a40ffc4cd6656829fca` |
| `robot/resources.ts` | `375fdf233e6128c613c64aa52ffa762d941b47090af990a20652b6ffae0f687f` |
| `robot/cards.ts` | `6c37eb87147aaf4d290dce4e5bbefe46c361c30b86c55fe4f4a7080ee9b45f58` |
| `robot/presentation.ts` | `733e0885712fdb23f6103146e74de8f8c9faff389bdeac28524d51601f8847a3` |
| `robot/runtime-profile.json` | `102cfdd0178f4cb9e301ce2feaeb82df0b9701ab60f9379f8cdaac18e208a447` |
| Public v03 GLB | `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12` |
| Installed r187 `GLTFLoader.js` | `532ac726e120039acbcd6cf54328c57acbf7b438176afaa6951257126d11bff1` |

Independent [payload inspection](payload-evidence.json), reproduced by `node design/assistant/robot/review/scene-runtime-g2/payload-evidence.mjs`, confirms:

- v03: **673144 raw bytes**, gzip level 9 **482957**, Brotli quality 11 **334311**, using Node `v24.21.0`. These are asset-only measurements with explicit encoders.
- Installed GLTFLoader imports **21 meshes / 21 geometry identities / 7 materials / 37676 triangles**. An independent decoded-array walk finds finite positions/normals and integral, nonnegative, in-range indices. The production validator also verifies 22 bindings and their parent/neutral transforms, opaque materials and the frozen moving-node profile.
- Compared with v02 SHA256 `bc1a4d6d968dd53eda3480936959d0ebf292e76652a6bbdd201e15f4cd665270`, the BIN payload and node/mesh/accessor/buffer/scene metadata are identical. BIN SHA256 is `2deb2f9dc668b3dd6c2937e9b3ee7c1c01887df69124fcb9723f88721dab6db0`. Only the eye material changes: its emissive-strength extension of 4 is removed, yielding actual runtime intensity 1; the tray material/product is unchanged and distinct from the eye material. Geometry and poses were not rebuilt for this review.
- The two previously accepted-invalid generic-validator inputs are **rejected by this runtime**: `skin:0` on a mesh node and missing POSITION `min`, `max`, or both. Valid definitions and the valid pinned GLB pass. Existing guard-removal sensitivity cases also pass. This closes those guard gaps for this runtime only; frozen generic asset validators are not rewritten or newly approved.

## Behavioral evidence and limits

| Area | Evidence from source and targeted execution |
| --- | --- |
| Absent optional input | Dynamic import is reached only from `startRobot` after an assistant input and room model exist (`controller.ts:146–169`). The existing absent-input control observes zero robot imports/loads/status callbacks; ordinary room picking survives removal. |
| Request/generation ownership | Generation increments before abort (`controller.ts:119–122`), and import/load continuations check the same generation, signal and mounted lifetime. New independent remove/readd cases deliver both old success and old rejection after the replacement is already ready; neither changes its root, cards, render count or statuses. |
| Parser allocations | The real installed parser is delayed in an asynchronous `afterRoot` continuation, then aborted. It rejects and disposes all 28 imported identities once. Existing post-allocation failure/abort/material-policy controls also pass. The cleanup exceptions in R1/R2 remain exceptions to the broader claim. |
| One finite clock | Controller owns the sole RAF; presentation only advances transforms. Targeted scheduler tests exercise finite completion, reduced-motion ON/OFF, hidden/offscreen/zero-size suspension and settled resumption. No permanent timer or mixer was introduced. |
| Source identity/clearing | Real G1 reducer snapshots drive the actual controller/presentation. Ordered keys and selection are retained; submit, cancel, fail and panel close erase visibility and card `userData` immediately before the next frame, while old snapshots remain unchanged. Cards keep only run/key/rank/identity, never passages or scores. |
| Snapshot/callback adapter | The existing adapter host observes exact snapshot object identity and latest callbacks after commit without controller remount. Current root wiring is excluded from this review, so this is not a claim that root's active repair has passed. |
| Opaque blockers | All 21 imported meshes and four generated cards are registered. Independent real-geometry controls make each of the 25 meshes block a project behind it. Existing sensitivity cases separately cover touch expansion's original-finger ray and sampled ray; deleting the blocker/original-ray protections admits the invalid case. |
| Activation | Only the reviewed head/body surfaces are eligible; tray, mittens, bookmark and cards block without activation. Targeted actual-controller/real-geometry cases preserve qualified mouse/pen/touch activation, compatibility mousedown and modal cancellation. Native trust is simulated in the host. |
| Mount lifetime | A cleanup/remount analogue on the same host ignores retained old RAF/observer callbacks and late robot resolution while the new controller remains ready. This exercises actual controller lifetimes, **not actual React StrictMode** or browser event ordering. |

The author's 82 cases are substantive CPU tests rather than 82 branch mirrors: they include real Three parsing/raycasting, G1 reducer state, delayed completions, failure controls and several guard-removal sensitivity checks. However, 61 are retained room/controller controls, seven are G2 controller cases and 14 are robot cases; their combined count is not 82 new robot acceptance claims. This review reran **11 relevant existing cases**, not the unchanged full suite. Those cases omitted the two disposal-exception paths exposed here.

The new probes reuse the established host setup, transpiling actual source without changing it. DOM, observers, RAF queue, renderer and event trust are simulated. Geometry, parser, controller logic, presentation and G1 reducer are actual. The 25-mesh test checks occlusion with the expansion flag both off/on at an exact ray; the separate existing original-finger test supplies the actual expanded-touch evidence. Neither fixture proves physical native input or GPU disposal.

## Envelope and pending acceptance

The continuous bound in `robot/verify-envelope.mjs:17–47` encloses translation intervals and identity-centred quaternion caps below pi/2, then recursively expands child bounds. Under normalized shortest-slerp, nonovershooting interpolation, unit scales and the unchanged placement wrapper, the cap argument also covers repeated current-to-target interruptions. That is a conservative **positional enclosure**, not continuous mesh nonintersection. The reported 5000 trajectory observations are the author's discrete observations; they were inspected, not rerun as fresh independent samples here.

The separate lid/pupil bound considers all endpoint pupil translation extrema and analytical local-X lid vertex extrema; its **0.349014 mm** gap is in the shared head coordinate frame under those stated axes/pose assumptions. It is not a gaze-offset or arbitrary-expression guarantee. This review independently recomputes actual card support radius **0.1122748281 m**, leaving **0.0052833681 m** radial margin against the stated tray radius through allowed scale endpoints; radial support does not prove clearance from every other mesh.

The authored conservative placement comparisons still report negative margins: wall lights **−3.415179°**, TypeForge **−1.972639°**, speaker **−0.714601°**. These AABB/angular comparisons are not silhouette intersections, but they do not establish final placement clearance. Interruption/marker mesh clearance, integrated placement, frame presentation and actual Claude's visual acceptance remain separate gates. No room budget acceptance is inferred from asset bytes plus an old room baseline; assistant/runtime JS, actual draw work, frame time and devices remain to be measured by root.

## Commands and completion boundary

Exact commands, exit codes and scoped TypeScript source roots are in [checks.json](checks.json).

The existing-test command uses one regex argument (quote it when invoking from a shell):

```powershell
node --test --test-reporter=tap --test-name-pattern='G2 |React adapter|format mutations|real installed parser|robot/card foreground' components/studio/scene/verify-controller.mjs components/studio/scene/robot/verify-robot.mjs
```

- `node --test --test-reporter=tap design/assistant/robot/review/scene-runtime-g2/probe.test.mjs`: **10 tests, 8 pass, 2 fail; exit 1**, deliberately retaining R1/R2's expected-behavior assertions. [Output](independent-probes.txt).
- The recorded `--test-name-pattern` invocation against existing controller/robot tests: **11/11 pass; exit 0**. [Output](targeted-existing.txt).
- `derive-profile.mjs --check`: byte-exact regenerated subset agrees, **exit 0**. [Output](profile-check.txt). The writing variant was not run.
- Independent payload inspection: **exit 0**, [results](payload-evidence.json).
- Scoped production/probe ESLint: **exit 0**, including the final updated probe files. [Production-scope output](scoped-lint.txt), [final probe output](review-probe-lint.txt).
- TypeScript `createProgram` with explicit delivered G2 TS/TSX roots and their imports, `noEmit: true`, `incremental: false`: **0 diagnostics**. [Output](scoped-types.txt). No root Experience, Next type generation or build was included.

Initial private-probe development failures were corrected: the source names markers `AssistantSourceMark`, and VM arrays require host-realm normalization for deep comparison. The final G1 failure fixture uses its actual `fail`/`network` action. Those fixture mistakes are not application findings. Final retained failures are only R1/R2; application source was never temporarily replaced to obtain them.

New files, all under `design/assistant/robot/review/scene-runtime-g2/`: `review.md`, `probe.test.mjs`, `run-checks.mjs`, `payload-evidence.mjs`, `payload-evidence.json`, `source-before.json`, `source-after.json`, `checks.json`, `independent-probes.txt`, `targeted-existing.txt`, `profile-check.txt`, `scoped-lint.txt`, `scoped-types.txt`, and `review-probe-lint.txt`. No other files were written.

**Bounded verdict: REVISE for runtime-source readiness**, limited to the two cleanup repairs and their focused recheck. No new blocking asset-art finding was identified. Root retains repairs, integrated build/browser/StrictMode/accessibility/trusted-input and GPU/device checks; actual Claude retains visual acceptance. No deployment or final combined-scene approval is given.
