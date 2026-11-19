# G4 v04: renderer-density candidate verification

18 November 2026. Root reviewed the Codex-authored one-expression WebGL density policy and its focused regression delta. The production change caps renderer DPR at 1.5; it preserves lower native values, the existing mobile camera choice, CSS-space picking and HTML rendering. No art, asset, camera, generation or acceptance threshold changed. Root found no blocking source defect in that small delta. The author's fresh 14-case focused suite, direct TypeScript and scoped lint passed; root did not repeat unrelated suites.

**Performance acceptance remains open.** The fresh candidate passes one desktop sample and fails its repeat. Both observations are retained; there was no rerun to replace the failure.

## Build and ownership

Production build `KEhdfJ0NJBO2q0ASaHcHN` passed, including its type and lint checks. `source-before.json` verifies the candidate pins and explicit two-file delta against v03; `source-after.json` confirms all 83 application/config/public inputs stayed unchanged through the build. Root reverified these pins after the browser run. Only the new controller/test hashes supersede the earlier source baseline; old evidence remains frozen.

Root matched the old preview's recorded PID, executable, command and creation time before stopping it. `preview-process.json` records new hidden PID 68808, created 2026-11-18T20:24:00.3716470Z, serving port 4193. Main application source and port 4181 were untouched.

The ordinary Playwright connector refused startup because its configured Moodle profile was already in use; root did not close or alter that browser/profile. The supported isolated connector provided Chromium 157.0.8103.79 and the same reported ANGLE Intel UHD Direct3D11 GPU family. Its filename API allows the main workspace's designated `.playwright-mcp` artifact folder, not the assistant checkout. Root put only this task's helper/captures in `.playwright-mcp/root-g4-v04/` and copied resulting evidence here. No application files there changed. The first unsupported filename call ran no browser code. The helper is retained as `measure.run.mjs`.

## Fresh native-density measurements

`browser-results.json` contains the exact original ten-second alternating native mouse Look left/right scenario, every tenth click resizing by 60 CSS pixels and every twentieth restoring it, with 650 ms after readiness and a 150 ms drain. Fresh contexts were used. Screenshots and functional smoke occurred after timing windows. Native desktop DPR stays 2 while the canvas uses 1.5; small native DPR is 1.5. Documents were visible and focused at recorded boundaries. This run does not provide per-frame ownership/visibility or contemporaneous host-load profiling beyond the existing reference wrapper.

| Sample | Request-to-RAF-start p95 | Callback p95 | 33 ms request-delay gate |
| --- | ---: | ---: | --- |
| Desktop first | 10.9 ms | 9.9 ms | Pass |
| Small | 11.7 ms | 4.2 ms | Pass |
| Desktop repeat | 41.6 ms | 13.3 ms | **Fail** |

The highest raw first/sample/smoke frame observed was 125 calls / 98,876 triangles, under the unchanged limits. The current candidate's transfer closure was not remeasured, so v03's 1,191,788-byte receipt is historical evidence, not an exact v04 byte verdict. CPU callback spans and request delay are not GPU FPS. The current user agent reports HeadlessChrome, while the earlier connector reported Chrome, and scrollbar space differs. Cross-run improvements alone do not establish causation or universal device performance.

## Functional and visual evidence

The desktop-first context also verified a trusted native head click at CSS (1130,310) opening Ask with heading focus, a real LexisNexis query yielding four matching chip/row keys and four tray cards, and Escape closing/clearing. These relevant checks passed after the density change; the previous full 15-check lifecycle run remains v03 evidence.

`capture-manifest.json` binds two stable 2880x1800 PNGs to before/after states and SHA256: neutral home and four sources. Both preserve native browser DPR 2 with renderer DPR 1.5 and an actual 2160x1350 canvas buffer. This isolated context has a 1440 CSS-pixel canvas, unlike the prior context's approximately 1424.7 pixels with scrollbar space; the expected buffer follows the measured CSS rectangle. Home eye, yaw/pitch and vertical FOV match the contract. Render counts remain unchanged across each image. The neutral frame has closed sheet, zero cards and BODY focus. Root viewed it; actual Claude retains the final density-quality verdict.

All three task-owned isolated contexts closed; the connector inventory returned to its original about:blank context. The owned Orca page was returned to clean `/studio`, explicitly 1440x900 scale 1. The preview remains available.

## Disposition

The candidate is built and functionally usable. Its specific performance gate remains failed on the desktop repeat. Request a bounded analysis of this new measurement and exact source, without another open-ended benchmark loop or a lower quality cap unsupported by evidence. Claude should separately review the two final source-build PNGs. Physical devices, assistive technology, continuous-motion clearance and development StrictMode retain their previously recorded limits. No final production acceptance, commit, push or deployment occurred here.
