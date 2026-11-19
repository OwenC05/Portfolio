# One resize-wait trace

18 November 2026. **The single diagnostic did not reproduce the failing p95: 10.4 ms across 193 rendered callbacks. It did reproduce eight 46.8–113.0 ms waits, and the trace localizes their dominant overlap to Chromium's Windows presentation path. The earlier 41.6 ms candidate failure remains open. No production patch or performance acceptance is proposed.** This is evidence collection by the runtime/DPR author, not independent source approval.

## Exact run and retained evidence

Build `KEhdfJ0NJBO2q0ASaHcHN`; root preview PID 68808, created `2026-11-18T20:24:00.3716470Z`, unchanged and running. Native desktop DPR 2, renderer DPR 1.5, CSS canvas 1440×900, backing 2160×1350; resizes alternate 1380/1440 (2070/2160 backing width). HeadlessChrome 157.0.8103.79, ANGLE Intel UHD Direct3D11, 16 reported logical processors. Reduced motion off, closed sheet, empty run, zero cards. Every sampled callback reports visible/focused before and after.

Exactly one fresh private isolated context ran the original alternating native mouse Look left/right loop, with 650 ms after readiness, resizing every tenth click and restoring every twentieth, then 150 ms drain. It produced 161 trusted clicks and 16 resizes. No screenshots, recordings or alternative scenarios ran. Page sample time is **2320.800–12516.600 ms**, timeOrigin **1795034776353.2 ms**, UTC **20:46:18.674–20:46:28.869**; duration 10.1958 seconds includes the awaited final action/drain. The saved start/end indices are 4/197; the earlier callbacks remain outside the timed population.

- [browser-result.json](browser-result.json): full page-clock request/start/end, owner/native RAF IDs, actual setter/observer/window-resize events, dimensions, visibility, trusted actions and UTC alignment.
- [chromium-trace.json](chromium-trace.json): **98,562,463 raw bytes**, SHA256 `57a9ec45ae4eabd556bd1b94cf601bc91e1c9be3120d8c64d702ca146d8c6a57`, 396,119 parsed trace events; no screenshot category or image capture. Event inventory and exact artifact SHA256 are in [trace-event-inventory.json](trace-event-inventory.json) and [artifact-index.json](artifact-index.json).
- [analysis.json](analysis.json), [late-frames.csv](late-frames.csv), [presentation-spans.json](presentation-spans.json): derived results and exact matching spans. The presentation rows identify raw trace PID/TID and page marker names for reproduction.

| Metric | Observed diagnostic result |
| --- | ---: |
| Request-to-start p95 / max | 10.4 / 113.0 ms |
| Callback p95 / max | 7.8 / 116.5 ms |
| Requests above 33 ms | 8/193 = 4.15% |
| Timed peak raw calls / triangles | 94 / 94,512 |
| Application RAF owners / maximum outstanding | 1 / 1 |

These timings include additional instrumentation and are not a replacement acceptance benchmark. No frames were removed to improve the percentile.

## What the trace establishes

Each late request follows an actual backing-width change. Six are requested from inside the resulting ResizeObserver delivery, 0–0.2 ms after its start and 3.0–4.5 ms after the changed setter finished. Two are later input-driven requests, 33.6/50.6 ms after the changed setter. Every late callback starts with the buffer already at its new width and leaves that width unchanged.

All eight wait intervals overlap a `DXGISwapChainImageBacking::Present` event on **GPU-process PID 66644 / CrGpuMain TID 6868**, nested under `SkiaOutputDeviceDComp::BeginOverlayAccess` and `SkiaOutputSurfaceImplOnGpu::SwapBuffers`. These are literal trace event names, not a guessed GPU label.

| App callback ID | RAF wait | Present overlap | Recorded renderer-main spans during wait |
| --- | ---: | ---: | ---: |
| 28 | 75.4 ms | 69.7 ms | 5.8 ms |
| 40 | 53.9 ms | 47.5 ms | 5.7 ms |
| 100 | 113.0 ms | 105.1 ms | 6.5 ms |
| 113 | 46.8 ms | 45.3 ms | 5.1 ms |
| 125 | 49.5 ms | 48.6 ms | 3.4 ms |
| 160 | 81.2 ms | 73.5 ms | 7.7 ms |
| 172 | 78.5 ms | 73.2 ms | 4.3 ms |
| 196 | 102.7 ms | 90.5 ms | 8.6 ms |

Presentation spans overlap **88.1–98.2%** of each wait; application callbacks start **0.9–3.5 ms after those spans end**. Their reported thread-duration fields are only 0.323–1.313 ms across 47.5–105.1 ms wall spans. The renderer-main values above union overlapping trace spans to avoid double counting nesting; they are not CPU utilization. No recorded LongTask overlaps these request waits. Event/page-clock alignment across matching user-timing markers varies by at most **0.196 ms**.

This is stronger localization than the prior resize-click association: long waits coexist with browser presentation activity while the page's recorded main-thread work is short. Confidence is **high in the observed timing, moderate in presentation completion gating subsequent delivery**. The trace does not establish why Present waits internally, hardware GPU execution time, driver/kernel cause, memory-pressure causation or general device performance. A GPU-process wall span is not proof of GPU saturation.

Separately, the 16 necessary changed-width setters take **594.6 ms of 635.2 ms** in their associated callbacks (93.6%), with individual setter times 3.2–114.7 ms. The 112 unchanged dimension writes take at most 0.1 ms each. This supports the earlier distinction between expensive resize callbacks and later queued-frame waiting. It does not support changing setter ordering as a fix.

## Application contract and disposition

The observed application owner is compiled controller `eh` in chunk `703.4dfe8c9ab28805fd.js`; its recorded function prefix contains the DPR-1.5 policy. The main-world wrapper observes one owner and at most one outstanding RAF. Frame count equals the canvas render-counter delta, and requests are serviced without hidden-state replay. Source `controller.ts:172` schedules immediately when dirty; `:515` and `:519` invalidate on window resize and ResizeObserver respectively. Six extra observer-driven resize callbacks are consistent with those paths, not evidence of two animation loops. The browser trace also contains automation/browser callbacks outside this main-world owner; raw trace RAF totals must not be called application-loop counts.

**No contract violation or precise production correction is established.** Suppressing a redundant observer callback would not remove the two delayed input-driven requests or demonstrate removal of the underlying presentation wait. The trace provides no justification for lower DPR, changed art, a relaxed 33 ms gate, or a source-level timing workaround.

The smallest next action is root disposition of this now-localized but unresolved browser/platform limit: preserve the candidate and the failed gate, and use this saved trace for any separately authorized platform investigation. This handoff does not request another benchmark or automatically start another worker. Claude's exact-v04 still-image PASS remains separate and unchanged; there was no new image request.

## Instrumentation, host observations and commands

[trace.run.mjs](trace.run.mjs) ran through `mcp__playwright_isolated__browser_run_code_unsafe({filename: <absolute owned helper path>})`. It uses the documented [Playwright Chromium startTracing/stopTracing API](https://playwright.dev/docs/api/class-browser#browser-start-tracing) with screenshots false and selected main-thread/compositor/GPU/user-timing categories, not a guessed debugging endpoint. Browser inventory before trace was only the original blank page and this private context. The API saved the trace directly in this evidence directory.

Page-local wrappers preserve callback arguments and native return values, wrap the actual ResizeObserver delivery rather than adding an observer, and add no render loop. Resize issue/return markers add two page-evaluation round trips per resize. There are 1,421 markers; measured request-wrapper p95 is 0.2 ms and callback pre-application bookkeeping p95 is 0.3 ms. These figures exclude much of tracing, per-draw/setter/observer instrumentation and automation cost. Total perturbation is unquantified; no control run was added.

The hidden native PowerShell sampler was **PID 58304**, started **20:45:33.127Z**, with a fixed **20:46:48.127Z** deadline. It finished naturally at **20:46:48.310Z**, before the later stop-marker write; no process was terminated. It recorded total CPU and available memory only, no user-process inventory/arguments. Six query intervals overlap the sample: **20–41% total CPU, 582–914 MB available memory**. Query wall times are **573–608 ms**, plus one second between queries, so this is coarse approximately 1.6-second observation, not frame-level load. CIM/helper/tracing cost is part of the shared host workload and is not proven negligible. These observations cannot assign a cause to individual waits.

Local commands/helpers:

```text
node design/assistant/robot/integration/resize-wait-trace-v01/pin.mjs before
node --check design/assistant/robot/integration/resize-wait-trace-v01/trace.run.mjs
powershell.exe -NoProfile -NonInteractive -File <owned folder>/host-sample.ps1
node design/assistant/robot/integration/resize-wait-trace-v01/analyze.mjs
node design/assistant/robot/integration/resize-wait-trace-v01/verify.mjs
```

The sampler was launched with `Start-Process -WindowStyle Hidden`; identity, deadline, stdout/stderr and all samples are retained. The first filename call used root's previously allowed main-workspace artifact path and was refused **before executing browser code** because this connector now permits the assistant checkout. [filename-denial.json](filename-denial.json) preserves the error. The helper was then run from this authorized evidence directory; this was the sole executed scenario/trace. The unused helper copy under the uniquely permitted main `.playwright-mcp/robot-resize-wait-trace-v01/` folder is pinned in verification. Two offline parser attempts failed on the trace footer format; [analysis-first-attempt-error.txt](analysis-first-attempt-error.txt) records both, and the corrected parser generated the derived evidence without modifying or rerunning the trace.

## Cleanup and immutable inputs

All page-local overrides died with the private context; inventory returned to the original `about:blank` context. Root's separate leased Orca page was verified clean `/studio`, closed sheet, no run/cards/probe, then explicitly restored to **1440×900 scale 1**. [root-page-restored.json](root-page-restored.json) and [root-viewport-restored.json](root-viewport-restored.json) retain that evidence. The sampler ended; the preview's exact PID/creation time remain unchanged.

All **83 current source pins** and **171 total source/prior-evidence files** match before/after. Controller SHA256 remains `3061a5644f7c1281e12dcb1032d186238aa83047090960d6ef3555d7d0657687`; test SHA256 remains `a182b86ebcbc5a940a72705c08f4684e09229a16fa9a14005e67cfb0356d6293`. Exact reviewed hashes are in [pins-before.json](pins-before.json)/[pins-after.json](pins-after.json); new artifact hashes and checks are in [artifact-index.json](artifact-index.json)/[verification.json](verification.json). No application, test, asset, build, server, Git, dependency or configuration changed. No final prototype/production acceptance is claimed.
