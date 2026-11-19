# M3 v03 phone mid-right capture handoff

15 November 2026. Technical evidence handoff only; independent Claude F8 review remains pending. No M4 release, production integration or final acceptance follows.

## Selected evidence

The successful v02 receipt is [full-kit-m3-v03-phone-mid-right-capture-v02.json](full-kit-m3-v03-phone-mid-right-capture-v02.json), SHA256 `cb9524663b7e30e47d1e5529cd8f591a8d78cf6d8c02ddf8956fc17a2246ad4f`. Its matching runner and the output directory `../artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m3-v03-phone-mid-right-v02/` preserve two raw scenes, two static actual-UI composites and preflight evidence.

The original isolated MCP browser (`mcp__playwright_isolated`, version `157.0.8103.52`) captured 320x844 and 390x844 at FOV74, yaw30/pitch-6, fixed eye and Projects closed. Composite scene widths are exactly 320 and 390 pixels, matching their natural image widths at 1:1. No capture-only CSS override was applied. The receipt records 27 checked inputs with zero drift, zero page errors and zero capture failures. Favicon404 and pilot GLB `net::ERR_ABORTED` warnings remain recorded.

The earlier v01 receipt is [full-kit-m3-v03-phone-mid-right-capture-v01.json](full-kit-m3-v03-phone-mid-right-capture-v01.json), SHA256 `2af374c647850d856c6172891b091e050427ec1f769de86dcdff6d60723b4083`. Its runner and output directory `../artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m3-v03-phone-mid-right/` preserve two raw scenes, two unmodified product diagnostics and preflight evidence. These diagnostics are not composites. That attempt used the nonisolated `mcp__playwright` surface and reserved approximately 15.2 pixels for a scrollbar. Its unsuccessful composite alignment is preserved rather than masked with CSS.

Both attempts select candidate SHA256 `dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf` and manifest SHA256 `060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405`. The initial 26-image receipt remains unchanged at SHA256 `641328d42c029b00979d41324df213190e168526af5447689cb50713652098b0`.

## Verification and limits

Checkpoint verification independently checked both receipt hashes, all eight image hashes and sizes, input hashes and no-drift records, v02 1:1 alignment, and runner syntax. It did not rerun captures or assess appearance. The supported CLI ledger's single `goal_resumed` event records the approved handoff recovery; it is not proof that native goal mode is active.

Root reports stopping its owned isolated server PID12776 after command verification, retaining the existing product server on4181 and closing capture contexts. No additional process action was taken for this checkpoint.

The browser-mode difference does not establish a source regression; exact browser-mode coverage remains a final integration item. Static composites show captured scene pixels beneath actual product DOM/CSS, not live full-kit integration, picking, lifecycle or device-performance proof. The retained independent Claude reviewer must inspect the four v02 images for F8 discoverability and UI interference. The initial phone-pitch exception remains unchanged, and full-room size has no safe headroom established.
