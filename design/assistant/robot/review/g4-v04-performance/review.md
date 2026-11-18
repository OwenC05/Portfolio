# G4 v04 performance measurement review

18 November 2026. **The measurement arithmetic and recorded candidate behavior pass this bounded audit; desktop performance acceptance remains open because the repeat fails the unchanged 33 ms gate. No further production correction is justified by this dataset.** This reviews root's fresh evidence, not independent approval of the DPR policy I authored. Root retains integration and acceptance; Claude retains visual judgment.

## Disposition and recalculated results

Build `KEhdfJ0NJBO2q0ASaHcHN`. All numbers below were recalculated from root's recorded frames, without running a browser or another benchmark.

| Window | Frames / trusted clicks / resizes | Request delay p95 / max, ms | Callback p95 / max, ms | Delays >33 ms | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| Desktop first | 189 / 159 / 15 | 10.9 / 132.6 | 9.9 / 150.7 | 7 (3.70%) | PASS |
| Small | 253 / 225 / 22 | 11.7 / 17.8 | 4.2 / 7.4 | 0 | PASS |
| Desktop repeat | 215 / 185 / 18 | **41.6 / 110.9** | 13.3 / 101.0 | **11 (5.12%)** | **FAIL** |

The repeat's nearest-rank p95 is the 205th sorted value: the 204th is 14.0 ms and the 205th is 41.6 ms. Its threshold crossing is tail-sensitive, but valid. It is not a rounding error, a single startup frame, or permission to average the two desktop windows. The first desktop pass also contains seven substantial delays; it does not erase its repeat or the historical failure.

## Harness correctness and scope

`integration/verification-g4-v04/measure.run.mjs:13` captures each request timestamp in the callback's own closure; `:27-29` uses `started-requested` and nearest rank, correctly. The native RAF `time` field is not substituted into the latency calculation. All 657 sample frames have finite values, nonnegative delays, and unique recorded request timestamps. Callback spans include per-draw wrappers; post-callback array insertion is outside the recorded duration. Instrumentation overhead is not independently quantified in this new browser. The earlier light-instrumentation failures show that per-draw wrappers were not the sole historical cause, not that their cost is zero here.

At `:22-25`, the sample is selected by a frame index after readiness and the 650 ms wait, followed by the ten-second action loop and 150 ms drain. The start time/index object is not serialized in the result, so its exact page-clock start cannot be recovered; the frame index can be recovered independently. Each sample is exactly the contiguous slice of `allFrames` beginning at index 2, and equals the change in `studioRenderCount`: 189, 253 and 215. The excluded first callback durations are 943.7 / 926.9 / 1249.2 ms. They remain startup evidence, not steady-state p95. Sample elapsed times are 10.212 / 10.209 / 10.179 seconds; final awaited actions and drain explain the longer-than-ten-second population. All repeat late starts occur before ten seconds after its first click. Screenshots and functional smoke start at `:30-42`, after sample serialization.

This is real intended scene work, not an inert input loop. Every recorded click is trusted and action order alternates left/right; the source path is `app/studio/StudioShell.tsx:251` → `StudioExperience.tsx:425` → `StudioScene.tsx:12` → `scene/controller.ts:285` (view command), then `:172-182` (one scheduled frame while dirty). Raw draw counts change with view and match scene render-counter deltas. The source registers only that scene RAF site. The harness does not retain callback owner IDs, no-draw callbacks or maximum outstanding requests, so count agreement is strong aggregate evidence rather than a new ownership/lifecycle proof.

The workload remains the original alternating control scenario, not a fixed-rate input or full camera-envelope benchmark. Action throughput differs across windows. It measures closed-sheet, zero-card look/resize work; four-source state is exercised afterward. Recorded overall peaks, including startup/smoke, are **125 draws / 98,876 triangles**; timed desktop peaks are 94 / 94,512. Current transfer closure, GPU frame time and continuous-motion clearance are not established by these numbers.

## What the failing repeat localizes

Exact per-frame evidence is in [late-repeat.csv](late-repeat.csv), with full data in [analysis.json](analysis.json) and [frames.csv](frames.csv).

- The 11 late frames are spread from 0.632 to 9.869 seconds after the first click, across eight of the ten one-second bins. This is not solely initial warmup or final drain.
- Five fall between the click immediately preceding a resize and the next click. Six are requested after one of the first two clicks following a resize. **All 11 are within two clicks of a resize**, a useful temporal association. Those intervals are derived from browser click timestamps, not a guessed alignment of host `Date.now()` with page `performance.now()`.
- None of those 11 request-to-start intervals overlaps a recorded long task. Their eventual callback durations are only 1.6–5.2 ms; preceding callback durations are 1.5–8.9 ms. The recorded delayed intervals are not explained by a simultaneously recorded long application callback.
- Separately, nine callbacks exceed 33 ms (maximum 101 ms), all inside resize click brackets. The eight recorded in-sample long tasks overlap those resize-adjacent callbacks. Callback stalls and subsequent scheduling delays remain distinct observations.

**Confidence:** high in arithmetic and the temporal association; low in causal attribution. No exact resize-event/observer timestamps or per-frame backing-size/visibility records were saved. A bracket can contain the preceding look frame, resize work and follow-up frame, so it cannot identify which callback actually reallocates the buffer. Lack of a recorded long task does not prove an idle main thread or exclude shorter tasks, rendering/compositor work, driver waiting or host scheduling. There is no contemporaneous host profile or GPU timing here. Calling this merely a shared-host artifact, or specifically a GPU defect, would go beyond the evidence.

The earlier trace attributed long resize callbacks to changed canvas-width setters, while its look-only DPR-2 control also failed request-delay p95. That remains historical evidence at a different native density/browser condition. It does not prove the same internal cause for this candidate's late starts, or support changing `setPixelRatio`/`setSize` sequencing. Removing resize-adjacent rows to get a passing percentile would change the gate population; the diagnostic subgroup in `analysis.json` is not an acceptance result.

## Candidate correctness and next action

The new desktop boundaries show native DPR **2**, renderer DPR **1.5**, CSS canvas **1440×900** and buffer **2160×1350**; the reduced-width boundary is 1380→2070. Both pinned desktop PNGs are 2880×1800, consistent with native screenshot density. Small boundaries show native/render DPR 1.5 and 390→585. This supports the renderer-only policy under the fresh build, alongside root's trusted head activation, four matching chip/row keys and Escape clearing receipts, which this audit also checks. Root's successful build and the author's 14 focused tests/TypeScript/lint are existing evidence, not reruns or independent code approval here.

The old page-local DPR-1.5 results recalculate to 17.2/10.3 ms, but are not an old/new causal speedup comparison: old Chrome versus new HeadlessChrome, old CSS width about 1424.7 versus new 1440, different instrumentation/warmup and shared-host conditions. Matching Chromium/ANGLE family does not remove those confounders. The cap expression itself does not alter CSS.

**Smallest useful next action:** retain the candidate and mark performance unaccepted; do not patch another source expression from these results. If root authorizes further diagnosis, collect one bounded trace of the unchanged original scenario in the same isolated native-DPR-2 configuration, with browser-clock resize issue/event/observer markers, scene request/callback identity and backing dimensions, plus contemporaneous coarse host load. Its purpose is to distinguish resize-related browser waiting from application work, not to replace this failed window. Preserve a passing/nonreproducing trace as inconclusive rather than rerunning until green. No DPR-1 recommendation or threshold relaxation is supported; Claude's visual verdict is separate.

## Pins, commands and limits

| Reviewed input | SHA256 |
| --- | --- |
| `verification-g4-v04/measure.run.mjs` | `0c1c39dfec356035268b199f9dc6b3c04c0ed9bf5a79ed62791baddbff86c9f9` |
| `verification-g4-v04/browser-results.json` | `cd5c533e1ac78864f34bfb9c893d85cefcc2662b54be4c531bf773649b0afa9e` |
| `verification-g4-v04/source-after.json` | `22251e3b16f3f9331e8a1e54c02963c850005411c97a961982bc64db1b972918` |
| `verification-g4-v04/capture-manifest.json` | `b3ba20a5f17ec33fc677405eac37e89084c971920005adec7dcb652f43fadb3d` |
| `components/studio/scene/controller.ts` | `3061a5644f7c1281e12dcb1032d186238aa83047090960d6ef3555d7d0657687` |
| `components/studio/scene/verify-controller.mjs` | `a182b86ebcbc5a940a72705c08f4684e09229a16fa9a14005e67cfb0356d6293` |

[pins-before.json](pins-before.json) and [pins-after.json](pins-after.json) cover all **83** current source/config/public inputs and all files in the three reviewed evidence directories: **152 unchanged files total**. Capture hashes were checked against the manifest. Build identity is root's pinned receipt; no build/server/browser operation was performed by this reviewer. Only this new review directory was written.

From repository root:

```text
node design/assistant/robot/review/g4-v04-performance/pin.mjs before
node design/assistant/robot/review/g4-v04-performance/analyze.mjs
node design/assistant/robot/review/g4-v04-performance/verify.mjs
```

`verify.mjs` syntax-checks the private scripts, reruns only deterministic JSON analysis, verifies receipts/capture pins and after-pins, and writes command results plus an artifact index. No application suite or benchmark was repeated. Two exploratory searches used nonexistent source paths and returned errors; the actual shell path was then resolved from the import and repo search. This did not affect the analysis; diagnostics are retained in `commands.json`.

Per-frame visibility/focus, GPU timings, host attribution, new transfer closure, physical devices, assistive technology, development StrictMode and Claude's source-build image judgment remain outside this review. There is no final prototype/production acceptance or new source repair recommendation.
