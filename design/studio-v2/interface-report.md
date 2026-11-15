# Studio v2 interface lane report

14–15 November 2026; finalized 15 November. U child Run `run_9e2c28f2f96d`, parent task `task_98c5bfadef16` / dispatch `ctx_fb9f5e79f23d`, coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`.

**Current disposition: preserved prototype source and bounded technical work complete; independent post-repair technical verdict PASS, with TC-01 and TC-02 resolved. Independent visual verdict remains FAIL at 320px, with desktop and 390px early interface PASS. Final product acceptance is withheld.**

Root's later user steering (`msg_943f0b398c66`) preserves this working room/interface as prototype while Higgsfield, Blender and Meshy asset authoring is planned before further Three.js refinement. U completed the already bounded technical work and report-only visual critique; no further broad visual polish was started. The 320px findings remain explicit baseline defects, not waived acceptance criteria.

## Ownership and actual providers

The interface was frozen before parallel writing in `interface/contract.md`. Actual dispatch receipts are in `interface/provider-receipts.json`; no model or effort overrides were used, and leaf workers had no helpers.

| Slice | Actual provider | Task / dispatch | Exact product ownership |
| --- | --- | --- | --- |
| Visual performer | Claude | `task_00060a30659b` / `ctx_508665017830` | `app/studio/page.tsx`, `app/studio/StudioShell.tsx`, `app/studio/studio.module.css` |
| Behavior performer | Codex | `task_af20e209be36` / `ctx_6def74944874` | `components/studio/StudioExperience.tsx`, `components/studio/ProjectEvidence.tsx`, `app/studio/panel-navigation.ts`, `app/studio/panel-scroll.ts`, bounded checks |
| Serial shell wiring | Codex, after explicit Claude release | Same behavior dispatch; release receipt `msg_993e2e5beda2` | Only callbacks/refs/state wiring in StudioShell; Claude DOM/CSS/design preserved |
| Independent technical critic | Codex | `task_04013a2c4f28` / `ctx_03cb188aa6c1` | Report/probes only; two P2 mechanics findings |
| Independent actual-image critic | Claude | `task_5d47e0507580` / `ctx_705ac112f869` | Report only; desktop/390 early PASS, 320 FAIL |
| Technical repair | Codex | `task_1028a39cc004` / `ctx_64f321e54538` | StudioExperience, panel-navigation and behavioral regressions only |
| Scoped technical re-review | Codex | `task_c55e30985f95` / `ctx_3aa540fbbb15` | Independent report/probes only; PASS, both findings resolved |

The first repair attempt `ctx_0e9a4174cb64` was accidentally closed before reporting. Exact inspection proved failed/exited; its resource was released and partial files preserved. Same-task replacement `ctx_64f321e54538` completed with fresh tests. A temporary uncertain critic follow-up delivery also settled normally without duplicate dispatch. All outcomes, including the failed attempt, remain in provider receipts.

U edited no shared content/contract, scene, global CSS, package/config, planning/runtime/goal files, or v1 evidence. S's additive `viewCommand?: StudioViewCommand | null` and `interactionEnabled?: boolean` contract was consumed unchanged. Root retained browser/build/preview ownership throughout; U ran no server, production build or browser session.

## Delivered behavior

- Claude's room viewport shell replaces the hero/scene-card layout, with compact identity, Work/About/Contact, text project shortcuts, look/reset controls and native reading sheet.
- Codex opens the complete shared ProjectEvidence in a native modal during the React commit, without camera/timer/readiness gating. The scene stays mounted and receives interactionEnabled=false while selected; no selection-induced view command is issued.
- Article heading receives focus; explicit Close, Escape and article #studio share a safe close path. Invoker/equivalent shortcut focus, panel scrolling, reduced motion, failure fallback and body-lock cleanup are implemented.
- Ownership-tagged history preserves Next metadata, avoids duplicate repeat entries, switches the current project entry, handles Back/Forward and safely replaces fresh deep-link close instead of blindly navigating Back.
- Full server-rendered articles remain available without JS. Enhanced mode hides that fallback and reuses the same data/component with prefixed panel IDs; there is one accessible reading surface, no copied truth strings and no duplicate IDs in SSR checks. About/contact remain server content.
- Independent TC-01 repair scopes manual restoration to panel entries and releases the modal lock synchronously before native ordinary-section restoration. TC-02 repair moves retained navigation focus before collapse for toggle/Escape/scene input, and preserves expanded state if focus cannot leave.

## Validation and verdicts

Performer commands and exact exits are recorded in `interface/behavior-performer.md` and `interface/visual-performer.md`:

| Evidence | Result | Boundary |
| --- | --- | --- |
| `node design/studio-v2/interface/verify-behavior.mjs` after repairs | Exit 0; 18 groups | CPU history/DOM ports, simulated commit scheduling, real React SSR; not a native browser |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0 | Existing generated types read; no build or incremental writes |
| `node design/studio-v2/interface/verify-lint.mjs` | Exit 0 | Installed supplemental Next/React-hooks rules, five files, zero findings |
| Configured ESLint on owned files | Exit 1 | Existing missing `@typescript-eslint/eslint-plugin`; no package/config repair authorized or performed |
| Scoped formatting checks | Exit 0 | Owned source/check files only |
| Initial independent technical critique | FAIL, TC-01/TC-02 | Original report and probes preserved; zero probe exit meant defects reproduced |
| Historical defect probe after repair | Exit 1 at obsolete expected-manual assertion | Preserved negative evidence, not a post-repair acceptance check |
| `node design/studio-v2/interface/technical-critique-post-repair-probes.mjs` | Exit 0; independent PASS | 18 performer groups plus 4 additional critic groups; TC-01/TC-02 resolved |
| Independent Claude actual-image review | 320 FAIL; 1440/390 early PASS | Root's early dev screenshots only |

The 320 blockers are overlapping Projects/look controls and the identity name wrapping into its role line. Source ownership is Claude, and no Codex restyling was performed. Other visual suggestions (status collision with expanded menu, focus-ring treatment, desktop plate weight) are documented, with scene observations routed to root/S. See `interface/visual-critique.md` for inspected image hashes and exact limitations.

Root's early source-bound captures under `.omx/artifacts/visual-ralph/portfolio-immersive-v2/early/` include desktop home/right/panel, top-390/right-390/panel-390, top-320/panel-320 and bounded corners. Root reports unchanged desktop yaw/pitch/eye through panel open/close, heading focus, interaction suspension, and no panel horizontal overflow at 390/320.

Root subsequently supplied fresh repair-specific browser evidence in `.omx/context/immersive-v2-interface-browser-repair.json` (`msg_f3ce981ae0cf`), bound to the exact repaired StudioExperience/panel-navigation and protected shell/CSS hashes below. In isolated dev Chromium at 1440x900 and 390x844 with reduced motion, ordinary section Back/Forward restored measured prior positions; panel Escape/Forward/reclose retained camera pose and expected focus/interaction; and compact Projects click/Tab/Escape returned toggle focus with collapsed aria/clip state. Next removed the panel ownership marker on Forward, so the tested safe close replaced with #studio as designed. The receipt preserves initial harness expectation failures and explains Playwright scrolling the header before Contact; it does not misreport the stored About position. This is attributed root evidence, forwarded to the independent critic, not a U-owned browser run or final production/device/AT/performance/visual acceptance.

The raw browser record's `projectHistory.passed` remains **false** after a timeout waiting for an empty hash; its final recorded state is the permitted #studio safe-close fallback with dialog closed, automatic restoration, shortcut focus and Y0. The independent critic distinguishes the obsolete harness expectation from the observed conforming state and does not rewrite the raw failure. See `interface/technical-critique-post-repair.md` for the complete bounded verdict and root evidence attribution.

## Current source hashes

SHA256 values from the final repair performer, independently checked and re-read by U at handoff, with protected visual sources unchanged. U's final hash command exited 0 and confirmed all nine source/check digests match this report; machine-readable values are in `interface/source-hashes-final.json`.

| File | SHA256 |
| --- | --- |
| `app/studio/page.tsx` | `f811dc5eca892e911650eb61cf3f859fe9ceba2b725cd95d3ac39a546f4d7314` |
| `app/studio/StudioShell.tsx` | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |
| `app/studio/studio.module.css` | `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a` |
| `components/studio/StudioExperience.tsx` | `4e8628d8b91c840a494174d559e30b7967bc062f773aa37d74f53f3094891e16` |
| `components/studio/ProjectEvidence.tsx` | `7242983f72892b81591848fbb5d81d39d61a4e6ae8f9ee3a7333e0a4b54b4e91` |
| `app/studio/panel-navigation.ts` | `e67abf654d6fd286edc536ec3f29290ca5a6f2e67daeb91ca596ae3fd976e347` |
| `app/studio/panel-scroll.ts` | `ef13a9d34aec31eb245232ada5675bc1cf010dd41bdd352ecbefc72fe0daa188` |
| `design/studio-v2/interface/verify-behavior.mjs` | `0a213d7f9bca63594b60ee3d39a83eb7d37ef76829ec8f3f7655ff2c973c4bd9` |
| `design/studio-v2/interface/verify-lint.mjs` | `0ad5d73cd235946f4cadcfdafce52fc0ae087e2562e9e7466520cfb53991f636` |

## Remaining handoff

All child assignments have settled, including the failed/exited repair predecessor and successful same-task replacement. Independent post-repair approval is recorded in `msg_19fb2e902a3c`; no technical source edit or local review remains active. Final visual acceptance remains blocked at 320 and deferred under the asset-authoring steering. Root/I retain broader native browser, production build, performance, physical-device and actual-AT validation. Keep this prototype and existing failure records available; no commit/deployment or paid asset action was performed.
