# Immersive v2 technical evidence

Read-only researcher `/root/immersive_v2_docs`,14November2026. Caller stack: Three0.187.0/Next14/React18. Context7 consulted; explicit version list endedr186 and moving-dev examples were not treated as pinnedr187proof. Verify changed Three APIs against installedsource during implementation.

- Fixed-point PerspectiveCamera yaw/pitch fits the chosen inside-room experience. OrbitControls orbits a target even with pan/zoom disabled; it is a bundledaddon, not an extra-package argument. https://threejs.org/docs/pages/OrbitControls.html
- Demand rendering: coalesce camera/hover/selection/resize changes to onependingRAF; no damping/inertia needed, so idle stops. https://threejs.org/manual/pages/rendering-on-demand.html
- Touch-action pan-y pinch-zoom permits horizontal look while browser retains verticalscroll/zoom. Gesture takeover producespointercancel; touch-action must be established before gesture. HTMLpitchcontrols avoid competition for verticalgestures. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action
- Native dialog showModal supplies modality, inertbackground and Escape; openattributealone is nonmodal. Synchronize nativeclose/cancel with controlledhistory. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- Focus substantialarticle headingtabindex-1, labeldialog, keep visibleclose, restoreinvoker/logicalHTMLcontrol aftercanvasselection, no giantaria-describedby. https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

Root reconciliation: research gesture suggestion is a general pattern, not permission to regress the locally proved touch-focus repair. Qualify a click onpointerup, but commit only matchingtrustedclick aftercompatibilitymousedown; drag suppresses thatactivation. Preserve penpost-upboundary exception and cancellations. No camera/renderer/timer wait gates opening. DirectHTMLcontrols and fullserverrendered evidence persist withoutgraphics/JS. These are planninginputs, not implementation or device-certification claims.

