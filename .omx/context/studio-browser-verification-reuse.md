# Browser verification reuse map

Read-only native Codex explore audit completed on 15 November 2026. No tests, browser, server, build or product changes were performed by that audit. Root has separately assigned a bounded Codex adaptation under `design/studio-v2/browser-verification/`; root/I retains execution and acceptance.

Existing v1 files contain bare `async(page)=>{...}` expressions for the isolated browser runner, not executable Node CLI test bodies. Do not run them as `node file.mjs` or overwrite their historical evidence.

| Existing helper under design/studio-v1 | Useful coverage | Required v2 adaptation / limits |
| --- | --- | --- |
| dev-lifecycle-validation.mjs | Five real Next `/studio` to `/` cycles, stable document token, StrictMode contexts, listener/observer/RAF and WebGL resource accounting | Port4180; add actual asset late completion/unmount. Instrumentation retains references; not heap/GPU reclamation proof. |
| failure-validation.mjs | Actual lazy chunk abort, WebGL2 failure and context loss with complete project journey | Port4181 and v1 selectors; add GLB network/decode failures. Chunk discovery by studioDpr expects one result. |
| performance-validation.mjs | Raw WebGL first-frame/shadow draws, renderer counters, DPR, idle/offscreen, transfer, long tasks,10-second work sample | Replace v1 synthetic hover with trusted v2 look/resize; include GLB/textures plus JS. CPU timing is not GPU timing; freeze is not hidden-document proof. |
| browser-validation.mjs | Trusted mouse/touch/CDP pen, keyboard/history/fragments, reduced motion/no-JS/overflow | Orthographic coordinates and v1 focus/history assumptions obsolete. |
| touch-focus-validation.mjs | Minimal trusted compatibility-event and final heading-focus trace | Update perspective coordinates/port; no physical-device claim. |
| touch-repair-validation.mjs and pen-release-validation.mjs | Input edge cases and cancellation | Preserve distinction between trusted CDP input and explicitly untrusted modeled release cases. |
| verification-manifest.mjs | Historical v1 evidence indexing | Do not run unchanged: writes v1 manifest and fixed preview ownership metadata. |

Current v2 native-browser receipt: `.omx/context/immersive-v2-interface-browser-repair.json`. It is evidence, not a runner. Preserve its raw projectHistory false flag and explain the permitted #studio fallback rather than erasing the failed expectation.

CPU/model helpers remain useful but do not establish native browser behavior: `design/studio-v2/interface/verify-behavior.mjs` uses modeled hooks/DOM/history plus real SSR; `components/studio/scene/verify-controller.mjs` uses real Three geometry/rays with inert WebGL and modeled events. The pilot validator checks its frozen offline profile, not image decode or the later full-room contract.

Final execution order: freeze source/GLB/build identity; actual loader/image/picking/modal smoke; real lifecycle with delayed assets; failure modes; performance with complete scene transfer accounting; independent visual review and final source reviews. Existing canvas datasets expose pose, FOV, DPR, draw/triangle/resource counts and interaction state without added production instrumentation.

Budgets remain compressed scene JS/assets <=1,500,000bytes; peak draws<=200, rendered triangles<=200,000; DPR<=2 desktop/1.5 small; requested-frame p95 target<=33ms. Physical touch/pen, actual AT, heap and physical GPU reclamation require separate evidence or explicit limitations.
