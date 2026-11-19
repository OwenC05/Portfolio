# G4 repaired UI/root candidate: integrated checks

18 November 2026. Build **XH_oOqBftWO8em8L7m4E6**, with repaired root1c1af8cc...923ca and Claude UI174d06c1...5619 /42605b4b...8bf5, plus the original delivered G2 runtime. All82 source records were unchanged during checks/build; all24 G2 and two UI pins matched. Source receipts contain full hashes.

The owned v01 preview was identity-checked and stopped before the sole .next writer ran. New owned preview PID12112, creationUTC2026-11-18T18:34:42.8724100Z, serves127.0.0.1:4193. See preview-process.json. Main Studio remains untouched.

## Build/source checks

checks.json records passing Next type generation, nonincremental TypeScript,113 assistant tests, offline assistant evaluation,160 scene tests (controller/pilot/full-kit), lint and production build. These are the repository's required local commands. The offline runner explicitly does not call a model or assess semantic entailment; generation remains off. Existing Browserslist data warns that it is old; no dependency refresh was introduced for this feature.

## Bounded browser evidence

browser-viewport-v02/ is the canonical comparable capture set: explicit1440x900 desktop and390/320x844 phone emulation. Its23 assertions pass for real source search, exact HTML/card count and current run identity, heading/ordinary-close focus, retained draft, both phone sheet bounds and first visible passage line, compact field/hidden duplicate query, long edited draft preserving the searched question without a request, whitespace-equivalent draft handling, and visible44px closed-phone Ask entry. Root viewed refreshed desktop and320 captures. The sibling browser/ also passed23 assertions, but navigation reset its initial desktop viewport to882x716; that is why the explicit-viewport run was necessary. Its two phone captures are still measured at the stated sizes.

The smoke JSON's older generic limits sentence predates the added phone layout assertions: basic emulated phone layouts ARE checked; physical touch/software keyboard/screen-reader certification is not. No appearance verdict is inferred from numeric assertions; actual Claude independently rechecks the saved images.

Lifecycle evidence is split to preserve failures rather than overwrite them:

- lifecycle/ records one passing settled-idle check and a failing trusted robot-head activation. native-click-diagnostic.json shows correct1130,310 CSS coordinates onCANVAS, trusted mouse events, primary down/up, pointerId1/type mouse, compatibility mousedown and click detail1. The dialog remains closed while room interaction is enabled. This is a real integration failure requiring a runtime repair, unlike v01's off-page coordinate injection.
- lifecycle-keyboard/ deliberately excludes that known failing activation. Nine checks pass through native heading focus/Tab containment, real four-source retrieval, wrapping chip focus without selection, source4 selection/disclosure focus, immediate clearing on new work, cancellation/abort/Search focus, and a single error alert with no stale data. It then stops on a test-harness wait: the mixed-case label did not match the uppercase rendered NO MATCHING SOURCES. Snapshot inspection confirmed the real no-match response was already present.
- lifecycle-navigation/ resumes at that real no-match response and passes its no-source/contact assertions. It then hits another harness wait mistake: waiting for a closed dialog to be visible. The native hash navigation had already closed the dialog. lifecycle-history/ continues only the remaining cases from that retained focus trace, avoiding a broad repeat of passed work. All five remaining assertions pass: hash navigation closes/unlocks without Ask return; keyboard reopening focuses the heading; project takeover aborts, reuses the dialog, clears cards and focuses only its heading; reopening remains usable; keyboard source navigation reaches the correct Lexis article/fragment with no intermediate Ask return. Native hash and article navigation end with BODY focused; project takeover focuses its H2.

Controlled pending/error responses are labelled fixtures, not live provider tests. Real Lexis and unsupported-topic queries use the app's source-only endpoint. Browser scripts are scripts/verify-studio-assistant-browser.mjs and verify-studio-assistant-lifecycle.mjs.

The earlier G1 Workbench repairs now have fresh browser evidence in workbench-repairs/checks.json: all9 targeted checks pass after both error and cancellation (blank Retry disabled/no blank request; edited draft submitted and retained), actual pending zero-hit SVG caption, and validated final abstention. scripts/verify-assistant-workbench-repairs.mjs uses explicitly controlled transport fixtures. This closes the old pre-fix-build browser gap for those two repairs, without claiming model quality or screen-reader coverage. The owned tab was returned to the Studio after testing.

## Open acceptance

The independently reviewed G2 has two exception-cleanup defects, documented in review/scene-runtime-g2/review.md. A bounded Codex repair will also diagnose the newly observed trusted-click failure. Those changed runtime bytes require a later fresh build; this candidate is not final acceptance. Full pose/interruption/card clearance, complete camera/budget measurements, actual React StrictMode, hardware/assistive-technology and final independent review remain distinct open gates. Observed98 draws/94816 triangles in one four-card view and a stable idle render counter do not prove peak scene budget or FPS.
