# Final browser evidence v01

18 November 2026. **Evidence collection completed; hold performance acceptance.** The agreed desktop look/resize check fails the unchanged 33 ms requested-RAF p95 limit. This is Codex's measurement handoff, not independent approval of its earlier G2 implementation. Root owns acceptance/repairs; actual Claude owns visual and clearance judgment.

## Frozen running candidate

- Production preview `http://127.0.0.1:4193/studio`, build `cFKSWm6Bayf__QstZY2CC`.
- All **83** source/config/public pins match `verification-g4-v03/source-after.json` before and after this work: [before](source-before.json), [after](source-after.json).
- Robot SHA256 `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12` remains unchanged.
- Root PID **52772**, creation **2026-11-18T19:08:59.9054640Z**, remains running. No application, asset, test, dependency, configuration, Git, server or build changes were made. All new files are in this directory.
- Browser: Chromium 157 / Windows, ANGLE Intel UHD Graphics Direct3D11, reported hardwareConcurrency16. These host measurements do not establish physical phone performance or GPU timing.

## Current integrated cost

| Measurement | Desktop 1440×900 DPR2 | Small 390×844 DPR1.5 | Disposition |
| --- | ---: | ---: | --- |
| Raw peak GL draw calls | 125 | 106 | Under200 |
| Raw peak rendered triangles | 98,876 | 92,258 | Under200,000 |
| Reference mouse look/resize RAF request-to-start p95 | **215.5 ms** | 12.5 ms | Desktop fails33 ms |
| Reference callback duration p95 | 155 ms | 3.7 ms | Separate CPU span, not GPU time |
| Broader keyboard/look/resize RAF p95 | **262.5 ms** | 15.6 ms | Adverse evidence retained |
| Broader keyboard callback p95 | 22.2 ms | 8.3 ms | Variable host workload; no causal isolation |
| Observed uploaded geometry/texture counter maximum | 43 /16 | 41 /16 | Counts, not VRAM bytes |

[performance.json](performance.json) retains initial raw shadow-inclusive frames, cold/warm inventory, idle/attention/four-card states, look limits, resizing, every measured frame and long-task spans. [look-resize-reference.json](look-resize-reference.json) separately implements the original ten-second alternating native mouse clicks on Look left/right, resizing by60 CSS pixels every tenth click and restoring every twentieth. The first harness used a broader four-direction native keyboard stress sequence; its failure was not discarded or substituted for the reference scenario. Mouse clicks and keyboard actions were trusted. Canvas DPR caps were2 and1.5; native devicePixelRatio has approximately1e-8 floating-point noise.

The first desktop callback took1,424.1 ms; the small callback took656.3 ms. These include startup work on this host. The measured desktop failure is scheduling latency, accompanied by long callback spans in the reference run; its cause has **not** been isolated to JavaScript, shader/driver work, GPU backpressure or host contention. Root options are a controlled profiler pass and separately reviewed cost/DPR policy changes followed by a fresh build/check. Limits remain unchanged; no art reduction, room reserve use or optimization was performed here.

Whole-frame probes wrapped real WebGL draw entry points before navigation and did not add a render loop. Installed r187 `WebGLRenderer.js:1744` resets info before the shadow pass; raw probes avoid relying on a single final canvas counter. `build-studio.ts:574-577` creates the one casting directional light; point/hemisphere lights do not cast, and `controller.ts:556-558` checks exactly one caster. Initial shadow work was measured; no separate forced-refresh production hook exists or was added. Later captures also recorded four-card home/right-high/neighbour frames; those supplementary main-pass counts did not exceed the measured initial peak.

[transfer-inventory.json](transfer-inventory.json) records a complete deduplicated closure of **12 JavaScript URLs and2 GLBs**, with positive encoded-body sizes and actual response encoding headers in both scenarios. Cold total: **1,191,788 encoded bytes**, below1,500,000. JS contributes316,316; pilot GLB392,354; robot GLB483,118. All use gzip except the557-byte identity-encoded main-app chunk. The actual room URL is `/studio/pilot-right-limit-v03.glb`; the robot URL is `/studio/assistant-apprentice-v03.glb`. Ask and real four-source completion fetched no further JavaScript. Warm reload retained the same entity sizes with cached JS transferSize0 and revalidated GLBs300 each; zero *transferSize* here is cache evidence, not free asset size. Raw resources also retain CSS/fonts/document-adjacent requests and the5,088-byte API response; these are outside the specified scene-JS-plus-assets calculation. This is current pilot integration evidence, **not** future full-kit budget allocation or an assertion about all page/network bytes.

## Behavior evidence

[lifecycle-v02.json](lifecycle-v02.json) passes7 focused checks: reduced-motion ON during a measured finite attention interval; OFF without replay and with source data retained; later semantic animation; matching one-hit chip/list key and run plus canvas run/revision/card count; native select/deselect; actual offscreen geometry; and zero-sized host suspension. Results completed while suspended, resumed in at most two renders and then stopped. Native IntersectionObserver/ResizeObserver handled page-local host changes. Document.hidden was not spoofed and its branch was not tested. Idle, attention and completed-result render counts remained fixed in650/700 ms observation windows. Existing CPU evidence is separate from these browser observations.

[faults-v02.json](faults-v02.json) passes robot transport-abort and malformed-byte fallback: room remains ready, a trusted click at the former head position has no robot target, named HTML Ask yields four real passages, source navigation reaches the actual LexisNexis route, the mailto contact is focusable, and the normal Contact link reaches `#contact`. No mail client was launched. Malformed bytes test the pinned-byte import rejection boundary; it does not bypass the hash guard to cover every GLTFLoader parser branch. This robot has no textures.

The context-loss case in [faults.json](faults.json) used supported `WEBGL_lose_context` while Ask and a controlled request were active. The canvas was removed, close/reopen remained usable, and a subsequent real retrieval returned four passages with the same document token—no reload loop. It does not prove GPU reclamation.

## Capture handoff to Claude

Use [capture-manifest.json](capture-manifest.json) for hashes, viewport/DPR, camera, before/after state/run/revision/count and timing. Start with:

- `desktop-one-source.png`, `desktop-one-selected.png`, `desktop-one-deselected.png`, `desktop-four-sources.png` for stable source count and selection evidence.
- `phone-home.png`, `phone-pending.png`, `phone-no-match.png`, `phone-error.png` for actual390×844 DPR1.5 browser renders; software keyboard is absent.
- `desktop-{home,left-low,right-high,robot-neighbour}-{idle,no-match-settled}.png` for exact fixed-camera context. Eye[-0.7,2.8,3.4], desktop FOV58; yaw/pitch pairs[-4,-6],[-38,-16],[58,12],[26,4]. The last view includes the wall-light/TypeForge/speaker warning region.
- `desktop-*-motion-*.jpg` and the explicitly supplemental `desktop-dpr1-*-motion-*.jpg` for delivered compositor samples during interrupted requests/close/reopen. Source traces are [captures-v02.json](captures-v02.json) and [captures-dpr1.json](captures-dpr1.json).

**Motion capture precision remains limited.** Native actions and protocol releases interrupted finite transitions, but screencast delivery was sparse and visible compositor lag was observed. Requested phase filenames are not certified depicted phases; some selected timestamps reuse the same frame. The manifest identifies duplicates and records requested/actual times plus adjacent CPU states **without asserting exact image/run association**. DPR1 captured additional samples at unchanged projection/geometry; it does not replace failed DPR2 cost evidence. Stable PNGs provide exact0/1/4 state evidence. The available images are for actual-Claude assessment, not proof of continuous clearance or of every intermediate pose. Negative conservative envelope margins remain warnings, not established collisions.

All controlled streams are labelled fixtures, echo the actual normalized question, preserve source-only start→retrieval→answer→done order, and use exact real retrieved passages/citations. They establish presentation behavior, not retrieval relevance for the arbitrary fixture questions. No generation/provider was enabled.

## Failures, commands and restoration

Browser harnesses were executed through installed `mcp__playwright__browser_run_code_unsafe({filename:<absolute path>})`, using private task-labelled contexts and supported `newContext`, `addInitScript`, route, media, trusted input and `newCDPSession` APIs. No guessed debugging endpoint or shared browser profile was used. The [official Page protocol](https://chromedevtools.github.io/devtools-protocol/tot/Page/) documents the screencast/ack interface used after video proved unavailable.

Retained failed attempts: [lifecycle.json](lifecycle.json) records a harness-only Fetch Response `status()` typo; [faults.json](faults.json) records the incorrect expectation that the panel contact URL was `#contact` instead of its actual `mailto:` link; [capture-video-failure.json](capture-video-failure.json) records missing `ffmpeg-1011/ffmpeg-win64.exe`. Nothing was installed. The uniquely identified empty context left by failed video setup was closed; final Playwright inventory contains only its original about:blank context. A dynamic-import capability probe was unsupported; no filesystem escape was attempted. A PowerShell replacement quoting attempt, a quoted Orca eval and an exact floating-point DPR comparison also failed in the harness; corrected implementations use structured Node arguments and1e-6 DPR tolerance. The original failed receipts remain.

Commands: `node --check` on this directory's harnesses; `node design/assistant/robot/integration/final-browser-v01/finalize.mjs`; PowerShell SHA256 verification of all83 baseline entries and read-only BUILD_ID/PID checks. No broad suite, build, typegen, server or application lint run was needed for this evidence-only task. [commands-and-failures.json](commands-and-failures.json) identifies attempts and limitations; [artifact-index.json](artifact-index.json) pins the resulting files.

The leased Orca page `0c891a8f-5ffd-4c83-a292-da00ef2ccf26` was navigated to clean `/studio` and explicitly reset to1440×900 scale1 after navigation. [restored-page-v02.json](restored-page-v02.json) confirms closed dialog, empty current run/cards, native fetch, no task probes and expected viewport (reported DPR1.0000000149). All task-owned Playwright contexts, routes, media changes and instrumentation ended with their contexts; other tabs were untouched. Root preview remains running.

Remaining gates: root disposition/repair of the measured desktop scheduling failure; independent actual-Claude visual/motion/clearance review and any additional precisely associated intermediate captures; actual dev StrictMode in a root-owned slot; real document-hidden behavior if separately required; GPU timing/reclamation; physical touch/pen, phone keyboard and screen reader. No final room allocation, all-gates acceptance, commit, push or deployment is claimed.
