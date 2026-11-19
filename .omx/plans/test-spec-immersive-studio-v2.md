# Immersive Studio v2 — verification specification

Paired PRD: `prd-immersive-studio-v2.md`; clarified brief: `.omx/specs/deep-interview-immersive-studio-v2.md`. Reports under `design/studio-v2/`; screenshots/JSON under `.omx/artifacts/visual-ralph/portfolio-immersive-v2/`. Preserve historical v1 failures/evidence; no invented pixel-match score.

## Early visual gate (before broad verification)

Inspect actual1440x900 and390x844 screenshots and320px edge, plus a right-look and open-project view. Initial view must be from human eye level inside the studio; no external floor slab, exposed dollhouse walls, full-model fit or dominant side editorial column. Room occupies main viewport. Desktop shows desk/screens as immediate focus with instrument corner visibly reachable on right. Camera drag reveals well-made interior views, no unmodelled backs/wall voids/clipping. Materials show controlled warm light, timber/metal/plastic distinction, bevel/profile/key/pad/stand detail; avoid flat uniform boxes or lighting that crushes gear into black. Personal required gear remains recognisable and art direction intentional. Compare v1 and v2 explicitly for immersion and authored detail. A technically passing but similarly basic scene fails this gate.

## New functional checks

- Initial camera is perspective at fixed eye point. Drag yaw/pitch changes view within bounds, eye position unchanged. Extreme/control-reset poses stay credible and reset returns expected framing. All3targets still work after looking/resizing/reset.
- Visibility-safe picking: at the rightmost music view, a touch/click on instruments or empty space must not select a monitor behind the viewer. Independently verify behind-camera/near-plane-crossing, clipped-away, back-facing and foreground-occluded targets do not activate through exact or expanded picking. Expansion remains finite and bounded to eligible visible regions. Retain positive visible-screen hits and eligible edge expansion after look/resize/reset; do not prove safety by disabling all touch selection.
- Orientation survives resize/visibility resume/panel-induced resizing/selection changes. HTML direction commands with unchanged project selection work once per new sequence; repeated sequences and disable/re-enable do not replay. In-article#studio links close through the same history/focus path.
- Complete trusted click/touch/pen gesture opens exactly one matching immediate readable HTML panel. No camera transform changes, automatic approach, forced page scroll, camera timing dependency or loading wait. Selection during pending drag/cancel does not open.
- Mouse/pen drag does not click; pointercancel/blur/second pointer/pinch/resize/unmount clear pending gesture/candidate. Preserve full trusted compatibility-mousedown final-focus regression and non-hover-pen modeled release ordering; mark injected boundaries separately from hardware proof.
- Touch horizontal look works at390/320; vertical scroll works for page/fallback and open panel; orientation/resize produces a ready current drawingbuffer before targeted gestures. Label emulator versus physical device.
- Named focusable HTML direction/reset controls work and show visible focus; ordinary page arrows/typing are not hijacked. At least44px intended control hits. No canvas-only project route.
- Panel has labelled heading, full project content, sensible focus, Escape/close and return focus (clickedHTMLtrigger or equivalentprojectshortcut forcanvas). Scene interactions suspended while open. Close keeps orientation. Panel scroll remains readable at320 and no horizontal overflow.
- Direct fragment/reload opens matching project; Back/Forward restores open/closed state. Fresh deep-link close remains onstudio; same-document open/close does not navigate externally or duplicate history. Modified-click/external links remain native. Opening a different project uses same content source and no duplicateDOMIDs.
- WithJSdisabled all3completeprojectarticles/qualifications/contactanchors available. Enhanced mode exposes only intended reading surface; hidden fallback does not create competing accessible duplicate content.
- NoJS/WebGL/lazychunk/contextloss each retain work navigation and evidence. Reuse failure injection only against actual finalchunks; captions explicit. Contextlosswhilepanelopen leaves reading/close usable.
- Reducedmotionbeforeload and livetoggle: no implicit camera movement/inertia/smoothscroll, direct look and reset stillwork. No audio/media construction, autoplay or fabricated player.

## Lifecycle, rendering and regression

Targeted CPU tests protect orientation/clamp/resize/commandsequence, drag-vs-click and cancellation, resource/adapter lifecycle. Do not merely mirror implementation; use independent expectedposes/raycast geometry and observable callbacks. Adapt obsolete orthographic-fit assumptions honestly rather than weakening unrelated input/resource tests.

Real React StrictMode enter/leave cycles verify onecanvas and teardown baseline forlisteners/observers/pendingRAF after new look listeners. Probe5cycles when affected; no need repeat unchanged externalcontent audits. Idle/offscreen/hidden branch remains demand-driven; rendering resumes correctly. Testpanelopen suspension and focus restoration. Report actualinstrumentationlimits; physicalGPU/heap reclamation notproved by counts.

Keep initial budgets scenecompressedtransfer<=1.5MB, peakdrawcalls<=200,triangles<=200k, DPR<=2desktop/1.5small,<=1shadowcaster. If authored scene requires an exception, record visual/measurement justification and root review before acceptance. Measure initial/settledactualcounts and a10second deliberate look/resize sample with requestedRAF p95target<=33ms, startup and interactionlongtasks. These are localbrowserobservations, not portableFPSclaims. No idleloop/no mandatory postprocessing dependency.

Singlebuild/browserowner. Record exact sourcehashes, commands/exitcodes, previewmode/browser/viewports and transfer counts. Run fullTypeScript, productionbuild, configuredlint and installed supplementalNextlint. Baseline missingTypeScriptESLintplugin is explicitly failed, not a reason to changepackages/rules. Finalbrowserchecksbindcurrentbuild. Smokeunchangedhomepage; snapshotv1/unrelatedartifacts beforeedits. Rootvisuallyinspectsfinalimagesandindependentcode/architectureapprovals beforecompletion. Leave workinglocalpreviewavailable; no commit/deploy.

