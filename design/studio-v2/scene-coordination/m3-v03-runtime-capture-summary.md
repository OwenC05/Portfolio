# M3 v03 real-renderer capture evidence

15 November 2026. Root captured 12 raw scenes and 14 static composites under actual portfolio UI. The [full receipt](../../../.omx/context/full-kit-m3-v03-runtime-capture-v01.json) hashes all 26 PNGs and the selected candidate pair. Receipt SHA256: `641328d42c029b00979d41324df213190e168526af5447689cb50713652098b0`.

The real loader/certificate, binder, authored builder and renderer decoded the pinned M3 v03 proposal. All capture jobs completed: no page errors, no capture failures, no drift across 24 unique source/candidate/UI inputs. Raw scenes cover 1440x900, 1024x768, 390x844 and 320x844; exact poses/FOV and renderer observations are in the receipt.

Observed settled calls range 46-101 and triangles 11586-29470. First-render counts at the initial pose of each viewport range 92-126 calls / 40790-47386 triangles. Those first-render values are retained across that viewport's later poses; they are not newly forced-shadow-refresh measurements for every view. CPU no-culling forecasts and actual culled observations remain distinct. These measurements are not device performance or final full-room acceptance.

The capture records an isolated-server favicon 404 and aborted pilot GLB fetches during actual UI preparation. All required scene/UI ready checks succeeded; no cause is asserted for the aborted fetches. Console/network cleanliness is not claimed.

The isolated browser contexts/page were closed. Root verified its Node server PID8264 and exact M3 command before stopping it. The existing product server on4181 remains available. A redundant start attempt returned EADDRINUSE and exited without replacing that server. No Blender, build, product source or camera change occurred during capture.

Actual Claude visual review is pending under [the review task](m3-v03-visual-review-task.md). Static composites establish placement only, not integrated M3 interaction, picking, focus or lifecycle behavior. M4 remains unreleased.
