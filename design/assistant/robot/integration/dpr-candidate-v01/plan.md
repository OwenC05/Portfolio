# Render-density candidate plan

Verify the two supplied hashes and preserve exact before copies, root baseline pins and prior measurement evidence before editing. Run the existing affected controller cases first. Change the old desktop cap expectation to1.5 and add one missing behavioral boundary: low native density, a native-DPR2 renderer-only cap, and CSS-space ray selection across desktop/small resizes. Capture the expected old-source failures before changing production.

Then replace only the render-density expression with `Math.min(window.devicePixelRatio || 1, 1.5)`. Keep CSS, camera, picking, native DPR, resize sequencing, art, budgets and generation policy unchanged. Re-run the focused controller cases, direct nonincremental TypeScript and scoped ESLint. Pin exact deltas and all protected inputs. This is a mitigation candidate; root owns a fresh build/native-DPR2 browser validation and Claude owns the image tradeoff review.
