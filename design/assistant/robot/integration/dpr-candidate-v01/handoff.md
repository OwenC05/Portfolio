# Renderer DPR candidate v01

18 November 2026. **Implemented the bounded renderer-density candidate; performance and design acceptance remain open.** Codex authored this change. Root owns independent delta review, the next build/browser measurement and disposition; actual Claude owns the visual tradeoff review.

## Exact change

`components/studio/scene/controller.ts:196` changes one expression:

```diff
- const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
+ const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
```

The desktop renderer maximum is now 1.5, matching the existing small-screen maximum. Native ratios below 1.5 retain their value and the existing falsy-value fallback remains 1. The `mobile` calculation still selects camera home/FOV as before. `setPixelRatio`/`setSize` ordering is unchanged. No CSS, layout, breakpoint, native window DPR, HTML, picking coordinates, camera, robot asset/anchor/pose/material, budget, 33 ms gate or generation setting was changed.

| File | Before SHA256 | After SHA256 |
| --- | --- | --- |
| `components/studio/scene/controller.ts` | `dbc91da47931fbbd592278ef5e82fe9db8c40d02fc29806b050161585f822afc` | `3061a5644f7c1281e12dcb1032d186238aa83047090960d6ef3555d7d0657687` |
| `components/studio/scene/verify-controller.mjs` | `cc58de1b838a67a452481a9b9e750f578c95c570de8c04d4fe634db91a7283b0` | `a182b86ebcbc5a940a72705c08f4684e09229a16fa9a14005e67cfb0356d6293` |

Exact before/after copies use `.txt` suffixes here so they do not enter TypeScript's source glob. [pins-before.json](pins-before.json) and [pins-after.json](pins-after.json) record all 83 root baseline inputs: only the two explicitly leased files differ, while the other 81 remain identical. All 123 files in the frozen `final-browser-v01` and `performance-diagnosis-v01` evidence directories also remain identical. The published v03 GLB remains SHA256 `65f1dea3b1d35a748bdfc2089dea0feed1d054cc8b0eb957645ea2d669578a12` through the protected baseline. No earlier report or source-pin receipt was rewritten.

## Focused regression evidence

The test change updates the old desktop-cap expectation at `verify-controller.mjs:725` from 2 to 1.5, then adds one behavioral boundary case at 731. That case runs the actual transpiled controller with installed Three raycasting and the existing fake host/renderer. It exercises native 1.25 desktop, native 0.75 small, return to native 1.25 desktop, and native 2 desktop with renderer 1.5. It verifies that native DPR and CSS dimensions stay unchanged, fixed eye/look survive resizing, desktop projected CSS coordinates remain identical across density changes, and mouse/pen/touch select the correct real Three surface. This is CPU host evidence, not actual native-browser input or WebGL allocation proof.

| Command/result | Evidence |
| --- | --- |
| Existing targeted suite on original source: **13/13 pass** | [existing-before.log](existing-before.log) |
| Updated tests against original source: **12 pass, 2 expected failures**, both exactly `2 !== 1.5` | [candidate-tests-old-source.log](candidate-tests-old-source.log) |
| Updated tests against candidate: **14/14 pass** | [candidate-after.log](candidate-after.log) |
| Direct `tsc --noEmit --incremental false`: **exit 0** | [typescript.json](typescript.json), [log](typescript.log) |
| Scoped ESLint on the two leased files: **exit 0** | [eslint.json](eslint.json), [log](eslint.log) |

The failing control proves sensitivity to the intended desktop policy; low-native-density and resize/picking steps execute before its final high-DPR assertion. The focused pattern additionally covers existing offset-canvas rays, 44 CSS-pixel touch regions at 390/320, fixed desktop/mobile cameras, retained camera pose, mouse/pen/touch gestures, and robot input/root-feedback guards. No broad assistant, asset-validator or full-room suite was repeated.

Exact executable arguments and exit status are in the adjacent JSON receipts. Reproduction from repository root:

```text
node design/assistant/robot/integration/dpr-candidate-v01/check.mjs candidate-after tests
node design/assistant/robot/integration/dpr-candidate-v01/check.mjs typescript tsc
node design/assistant/robot/integration/dpr-candidate-v01/check.mjs eslint lint
node design/assistant/robot/integration/dpr-candidate-v01/pin.mjs after
```

The wrapper invokes the existing Node test runner with the recorded name pattern, local TypeScript binary directly, and local ESLint with only the two changed paths. It does not invoke `npm run typecheck` or type generation. Existing generated types were available; there is no TypeScript validation gap. Logs are retained, including the intentional pre-change failures. [verification.json](verification.json) confirms the production delta is exactly the authorized expression and the test delta is only the expectation plus the new boundary case. [artifact-index.json](artifact-index.json) pins the handoff artifacts.

## Gates remaining with root and Claude

The diagnosis's page-local DPR 1.5 runs passed request-to-RAF p95 at 17.2/10.3 ms, but resize callback stalls remain, and GPU/compositor/host attribution is incomplete. The one-expression candidate is a supported mitigation, not a cure or a fresh performance PASS.

Those experiments lowered **whole-browser density**. This source change caps **only renderer density**. Root's fresh production build must run at native desktop DPR 2 and verify renderer DPR 1.5/backing dimensions while HTML remains at native density, CSS-space controls and projection remain unchanged, and the original ten-second mouse look/resize scenario meets the unchanged 33 ms gate. Recheck the measured peaks and relevant current-source states under that candidate; the previous build is not proof of this change. Actual Claude's matched density/attention-image review is a separate lane and cannot be inferred from these tests.

No browser, server, `.next`, build/typegen, Git, dependency/configuration, paid service, main Portfolio or port 4181 operation occurred. The old preview remains root-owned; this worker neither rebuilt nor restarted it. No final performance/design acceptance, deployment approval or independent approval of this authored candidate is claimed.
