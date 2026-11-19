# Bounded export-validator repair

18 November 2026. Root owns this new folder only. The runtime worker independently owns controller/robot cleanup repairs. Frozen build-v01/v02/v03 assets, scripts, receipts, profiles and independent review evidence stay unchanged. No Blender, asset generation, build/server/browser, dependency or production change is needed.

The independent build-v02 technical review demonstrated two false accepts: a mesh node's dangling skin:0 reference, and missing POSITION min/max. These do not exist in the approved pinned payload. The current app loader already rejects them; this task fixes the reusable export check for future candidate directories.

1. Preserve the v02 validator and contract guard as versioned copies here. Capture regression-first results against the same valid v02 bytes and the two privately mutated GLBs; invalid inputs must reject, so the initial assertions are expected to fail.
2. Replace the falsy skin check with an explicit absent-reference check. Require finite three-component POSITION bounds before decoded-value comparison, leaving the existing geometry, pose, material and envelope checks intact.
3. Re-run valid/invalid full-validator controls in a private .omx/artifacts copy, plus focused document-guard cases for single missing/null/inverted/nonfinite bounds. Verify every original input hash before/after. Keep output receipts out of the frozen candidate.
4. Document exact pins, commands, limits and safe future use. Independent Codex recheck remains separate; this repair is not a new export or production-acceptance verdict.

The existing validator writes profile/validation/manifest beside itself. Preserve that established candidate-directory interface in this bounded change: copy these two scripts only into a NEW candidate directory with its paired inputs before running. Do not run them inside a frozen historical directory. No general CLI or new abstraction is introduced.
