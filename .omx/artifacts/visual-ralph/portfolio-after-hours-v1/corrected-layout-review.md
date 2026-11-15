# Corrected layout review

Root visually inspected the saved interface screenshots on 2026-11-14:

- `design/studio-v1/interface-coordination/corrected-mobile-first-390.png`
- `design/studio-v1/interface-coordination/corrected-desktop-1440.png`
- `design/studio-v1/interface-coordination/corrected-mobile-first-320.png`

The 390px first view now presents identity followed by the complete studio before the longer introduction. The warm lighting, monitor arrangement, desk keyboard, coffee, snowboard and right-side music instruments are visible. Desktop preserves a clear identity and direct project/contact links beside the larger room. This passes the bounded first-view composition check for v1.

At 320px, the complete room and music corner remain visible, the name and header links fit, and the caption wraps within its frame. The room necessarily renders smaller; tiny scene labels are not the required navigation path. This saved image supports the narrow-layout visual check, not a live overflow or touch assertion.

This is visual inspection of saved images, not evidence of touch sizing, live navigation, no-JS behavior, actual GPU lifecycle, performance or a reference pixel-match. Those remain with integrated verification. The scene worker reports 20 passing CPU checks for touch tolerance and disposal exceptions; independent re-review and browser near-edge touch checks remain required.

## Root project-view inspection after U release

Root captured and inspected `root-project-dissertation-1440.png` and `root-project-dissertation-390.png` in this directory against the actual development preview. The cream evidence surface has readable headings, scope facts and substantive prose at both widths, with no observed horizontal overflow. Desktop direct navigation and mobile full reload focused the existing dissertation heading; the mobile heading top was approximately40px.

A preceding mobile `page.goto` to the already-current fragment after viewport resize timed out waiting for heading focus. Inspection found selection dissertation, scene ready and BODY focused. A full reload then passed immediately. This same-document-navigation observation is retained for I to classify; it is not counted as a passed direct-load test or hidden as a successful assertion. Root released the browser to I after these captures.

## Production first-view confirmation

After the production build, root inspected I's saved `production-first-1440.png` and `production-first-390.png`. The substantial warm studio, recognisable monitor/keyboard/PC details, right-side music corner and clear HTML identity/work/contact navigation remain present. Mobile retains the full room near the top of the view. No new visual regression was observed relative to the corrected development composition. This confirms those saved production images only; interaction and measurement results remain separately recorded by I.
# Root production visual review continuation

14 November 2026: inspected actual `production-first-320.png`, `production-project-390.png` and the complete `production-1440.png`. At 320px the complete workstation, triangular lights, compact keyboard, white PC and right-side controller/drum silhouette remain visible before the introduction. Desktop has a substantial warm scene alongside the identity and direct project links. The full-page cream evidence area maintains readable hierarchy, facts, qualifications and return links through all three projects and contact. The 390px project state has a clear visible heading focus outline, readable copy and no overlapping text or horizontal clipping. These are named-criteria visual observations, not pixel-match scores or exact manufacturer-fidelity claims.

Root also read the real-browser failure evidence: separately blocked lazy chunk, failed WebGL creation and lost WebGL context each retain the fallback, three sections and the project/return HTML journey. Ten development contexts are explicitly observed lost and disconnected after route teardown; physical GPU-memory reclamation is not measured. The production trusted-touch records currently show correct destinations but `focus=work`; root sent `msg_9e0ff3f32291` to the integrator for investigation before final acceptance. These observations do not close integration or independent review gates.

