# Studio v1 preliminary independent reviews

14 November 2026. This source pass was brought forward while the bounded touch repair was in progress. It is **not final approval**; root must provide a frozen-source and completed integration-evidence handoff to both same independent lanes for re-review.

## Code review

Actual native agent `/root/studio_final_code_review`, role `code-reviewer`, clean context, no model or reasoning overrides. Preliminary recommendation **COMMENT**. Reviewed16scoped source/package files and relevant verification scripts/reports. No additional confirmed runtime defect. One MEDIUM evidence finding:

- `design/studio-v1/browser-validation.mjs:28`: expanded-region mouse/pen assertions dispatch untrusted pointerdown/up without click. Repaired controller rejects untrusted gestures and requires matching click, so these assertions cannot establish real-browser precision. I was assigned trusted complete mouse/CDP-pen gestures or accurate limitation labelling in message `msg_4b2f2080d56e`.

Independent fresh checks: full noEmit typecheck passed;30controller CPU tests passed; supplemental installed Next lint11TS/TSX files0errors/0warnings; git diff whitespace check passed. Configured lint still fails before linting because the baseline TS ESLint plugin is absent. These checks do not certify real touch focus, GPU release or final production build.

## Architecture review

Actual native agent `/root/studio_final_architecture`, role `architect`, clean context, no model or reasoning overrides. Preliminary status **BLOCK pending final repair evidence**. Stable SSR/lazy/error separation, controlled selection, explicit resource ownership, demand rendering, frozen dependencies and truthful content boundaries are sound. No redesign recommended. One additional MEDIUM acceptance finding:

- Test-spec failure/lifecycle section requires controlled context restoration or a reload instruction. Controller intentionally terminates on loss, while `StudioExperience.tsx:240-244` lacked recovery guidance and `failure-validation.mjs:18-22` did not assert it. Root assigned I exclusive ownership of the unavailable-caption string plus failure assertion, message `msg_29e52ebd887c`; U is settled. No automatic retry or restoration machinery is required.

The known I-1 touch defect remains open until repaired-build trusted input evidence exists. Click-phase activation source addresses the event-order cause, but source alone is not acceptance. Strongest architectural counterargument: custom graphics carry maintenance and initial-render cost for a portfolio whose evidence is HTML. The agreed synthesis remains optional, lazy, fixed, measured graphics with independent HTML navigation. Existing startup151.1ms callback and physical-device/GPU/OS-visibility measurement limits remain visible.

## Provisional fingerprints and next gate

Both lanes observed controller `65BE133FC5B2E7D6716AC9C262883FF40D6A9FCDA71360A1E13852BD4E99BE79`, harness `ABE8CBCAD65121F3BACB72C0B680FA9E5267E39F4D44598982DCF62092565077`; architect observed UI `75B57B83F0D8F93EDFFBDDC5F2CB26457F227F6D7A9643A8167487C62C2CB3E3` before caption correction. These are provisional, not a freeze.

Await S independent repair/cleaner delta critique, I repaired production/lifecycle/failure/core evidence and independent evidence critique, then final follow-up to both native reviewers with exact hashes. No native goal completion or final quality-gate approval is authorized by this document.
