# Desktop scheduling diagnosis v01

18 November 2026. **The desktop failure is reproduced with light instrumentation and a visible, focused page.** Native canvas resizing explains the long resize callbacks, but does not fully explain delayed RAF starts. A desktop DPR cap of1.5 is a supported **candidate mitigation**, not an approved repair: both corresponding samples passed the33 ms request-to-start gate, while substantial resize callback stalls remain. No production code or cap was changed. This is diagnosis by the earlier runtime author, not independent approval.

## Candidate and evidence integrity

Production build `cFKSWm6Bayf__QstZY2CC`, preview `http://127.0.0.1:4193/studio`, PID52772 created2026-11-18T19:08:59.9054640Z. [pins-before.json](pins-before.json) and [pins-after.json](pins-after.json) verify all83 root source/config/public entries and BUILD_ID. They also hash all91 files of the original `final-browser-v01` evidence and the installed r187 WebGLRenderer source. Nothing in the original evidence was rewritten. Robot SHA256 remains `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12`.

## Controlled matrix

All cases used1440×900, the same loaded pilot/robot, closed sheet, empty run/cards, no reduced motion, and native alternating Look left/right mouse clicks for ten seconds. Every tenth click resized1440→1380; every twentieth restored1440. A four-click/one resize-pair warmup and measured settled interval precede the sample; startup and warmup are retained but excluded. Original150 ms drain is retained. Second pass reverses condition order. No screenshots, video, screencast or CPU profiler ran inside these eight samples.

| Condition | RAF delay p95, runs1 /2 (ms) | RAF max1 /2 | Callback p95 1 /2 | Scene samples1 /2 |
| --- | ---: | ---: | ---: | ---: |
| DPR2, original per-draw counters | **177.3 /63.3** | 272.8 /134.9 | 161.4 /171.9 | 102 /112 |
| DPR2, light RAF only | **180.9 /45.9** | 255.1 /266.0 | 28.1 /63.8 | 107 /123 |
| DPR1.5, light RAF only | 17.2 /10.3 | 130.5 /168.3 | 95.4 /161.8 | 153 /133 |
| DPR1, light RAF only | **38.0** /11.1 | 118.8 /130.8 | 7.9 /27.9 | 201 /186 |

The33 ms gate is unchanged. The original215.5 ms desktop failure remains valid adverse evidence; a passing five-second diagnostic below is not a replacement acceptance sample. DPR1's mixed result and the range across repeated DPR2 runs caution against a universal or monotonic performance claim.

Raw receipts: [matrix-first.json](matrix-first.json), [matrix-reverse.json](matrix-reverse.json). Derived tables, historical recalculation and resize grouping: [analysis.json](analysis.json). Each row retains actual backing sizes, timestamps, action issue/completion times, trusted click counts, current scene state, visibility and callback owner. At full width the backing buffers were2849×1800,2137×1350 and1424×900 at the three densities; the canvas is narrower than the1440 viewport because the page has scrollbar/layout space. Native DPR reports contain approximately1e-8 floating-point noise. The fixed eye and projection did not change.

## What the controls establish

**High confidence: arithmetic and scene ownership are sound.** Historical p95 recomputes exactly using nearest rank `sorted[ceil(n*.95)-1]`. Each request timestamp is captured in its own callback closure; the native RAF frame timestamp is retained but is not used as request time. That frame timestamp may precede registration and is not a negative-latency defect. The old reference's `phase` string stayed `first-load`, a misleading label, but its population was selected by an index saved after load—not by that string.

Across all1,117 new matrix scene callbacks, IDs were unique, delays nonnegative, document visibility `visible`, `document.hidden=false`, and focus true. There was one scene callback owner (`eh`, compiled controller chunk703), at most one outstanding main-world RAF, and full-mode draw/no-draw classification agreed with the actual canvas render-counter change. There were957 trusted sample clicks and no untrusted sample clicks. Automatic control-action throughput varied with browser responsiveness, as in the original scenario; this is not a fixed-rate input benchmark.

**High confidence: per-draw instrumentation is not the sole cause.** Removing it still failed DPR2 twice. Timing bookkeeping was otherwise the same, with callback duration measured before post-callback metadata collection. Numerical overhead is not isolated precisely under variable host load; the claim is narrower than “instrumentation has no effect.” No permanent animation or additional rendering loop was introduced.

**High confidence: actual backing-width changes dominate long resize callbacks.** Ordinary unchanged-buffer callback p95 was3.6–5.9 ms across the matrix (see per-run exact values in analysis); resize callbacks reached388 ms. A separate five-second diagnostic used a supported [CDP Profiler](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/) session and transparent native canvas width/height setter timing. Five changed-width setters took206.0,167.5,191.4,167.4 and40.3 ms. Together setter time was772.7 of787.0 ms in those callbacks, about98.2%. The sampled CPU profile independently attributes773.6 ms to native `set width`. Files: [resize-attribution.json](resize-attribution.json), [resize-cpu-profile.json](resize-cpu-profile.json), runnable [probe](resize-attribution.run.mjs).

This locates synchronous browser work, **not its internal GPU/driver/allocator cause**. CPU-profile `(idle)` and `(program)` buckets do not prove a GPU bottleneck or explain all RAF waiting. No GPU timer, GPU trace, kernel stack or memory-reclamation measurement was performed.

**High confidence: resize alone is insufficient to explain scheduling.** One additional same-DPR2 look-only control, with no buffer dimension writes, still had RAF p95 **52.3 ms**, although callback p95 fell to5.7 ms (max10.3). The profiled resize diagnostic itself had RAF p95 13.2 ms and callback p95 169.1 ms; it is deliberately retained rather than relabelled a final pass. Callback cost and scheduling delay are distinct populations.

**Host contention remains a contributor candidate, not a proven explanation.** The coarse sampler recorded2–3 observations per matrix window: total CPU ranged14–82%, and available memory about1005–2153 MB during those windows. Other workloads continued untouched. Raw process-name/PID/CPU summaries are in [host-load.jsonl](host-load.jsonl); per-process percentages can exceed100 across cores, and the WMI sampler contributes its own activity. These observations cannot separate browser/GPU/compositor work from host contention. The bounded five-minute sampler ended before the separate attribution trace, so no contemporaneous host-load claim is made for that trace.

## Smallest supported next change

**Recommend a separately leased candidate patch at `components/studio/scene/controller.ts:196`: cap desktop DPR at1.5 instead of2, leaving the existing small-screen cap1.5.** In equivalent form the cap becomes `Math.min(window.devicePixelRatio || 1, 1.5)`. This is one policy expression, approximately44% fewer backing pixels at high-DPR desktop sizes, with softer 3D raster detail as the tradeoff. Both page-local DPR1.5 matrix runs passed the specified RAF-delay gate; confidence is moderate that it is a useful mitigation on this host, not that it cures every stall or certifies other devices. Root must decide whether to create that candidate, actual Claude must assess the visual tradeoff, and a fresh production build must be measured before acceptance.

The source also calls `setPixelRatio` then `setSize` on each size update (`controller.ts:197-198`). Installed r187 `WebGLRenderer.js:642-648` makes `setPixelRatio` call `setSize`, and `setSize` writes canvas dimensions at685-686. This produces redundant same-value writes and a cheap follow-up observer frame. However, those unchanged native writes measured0–0.1 ms, while the *necessary changed width* dominated the trace. Skipping redundant writes may be reasonable cleanup but is **not supported as the fix for this failure**. No robot suppression control or asset reduction is justified by these results; no art, room reserve or transfer gate was reopened.

## Images for actual Claude

[image-manifest.json](image-manifest.json) pins five PNGs with exact before/after state and SHA256:

- `normal-dpr2.png`, `normal-dpr1.5.png`, `normal-dpr1.png`: settled closed-sheet neutral view, home[-4,-6], eye[-0.7,2.8,3.4], FOV58,1440×900 CSS viewport. Compare at equal CSS display size; output pixel dimensions differ with density. These are experiments, not design acceptance.
- Exactly two requested attention additions: `attention-home-dpr2.png` (SHA256 `59d5a502c263cdb4ab73f1ee43938563c5129d4c1e28075491857c785bffab2b`) and `attention-neighbour-dpr2.png` (`ce1db3418ad08936ee273feb4a2048a23e0f507a169224a81a708963a021ac78`). Native Shift+Tab from the first look button focused Ask; the sheet remained closed, run empty and cards0, at DPR2. Home[-4,-6] stayed at render count11 before/after; neighbour[26,4] stayed at28. Eye/FOV and viewport match the request. [attention.json](attention.json) includes trusted focus events and settled-count intervals. These screenshots were taken after all timing windows, with no forced pose or source change.

Claude's previous visual judgment was supplied by root; this task makes no new independent aesthetic, motion-clearance or continuous-nonintersection verdict.

## Reproduction, cleanup and limits

Execute the `.run.mjs` files through the installed `mcp__playwright__browser_run_code_unsafe({filename:<absolute path>})` API; they are browser expressions, not Node executables. `matrix-first.run.mjs` and `matrix-reverse.run.mjs` contain the full ordered conditions. `resize-attribution.run.mjs` is the single additional diagnostic/control pair. `attention.run.mjs` captures the two requested stills. All create uniquely labelled private contexts and close them in `finally`; no shared profile or guessed debug endpoint is used. Installed Three source and the previously loaded Three.js performance skill guided measurement; no example animation loop was copied.

Local commands: `node pin.mjs before/after`, `powershell -NoProfile -File host-sample.ps1`, `node summarize.mjs`, `node restore.mjs`, and `node --check` on each owned `.mjs`. Paths are relative to this directory except pin script execution, which uses repository cwd. The host sampler self-terminated at its five-minute deadline; no unrelated process was changed or stopped. One orchestration read initially used unsupported `check --from`; it was retried successfully with `check --terminal` to receive root's two-image addendum. All browser harnesses completed; performance failures are retained above. No package was installed or application test/build/typegen run.

[restoration.json](restoration.json) verifies the leased Orca page returned to clean `/studio`,1440×900 scale1, closed dialog, empty run/cards, native fetch and no task instrumentation. [contexts-after.json](contexts-after.json) confirms only the original Playwright about:blank context remains. The root preview is unchanged and running. All83 application pins and91 prior evidence files remain identical; the artifact index pins this new handoff and measurements.

Remaining uncertainty: the exact source of long RAF waits in a shared-host desktop browser; GPU versus compositor/driver/host waiting; performance after any proposed source change; Claude's density and new-attention-image assessment; all previously unrun physical-device/AT/StrictMode/GPU certification gates. The original failure stays open until root accepts a validated repair. No source repair, build, commit, push, deployment or final approval occurred in this task.
