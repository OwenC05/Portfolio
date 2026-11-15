# U independent visual critique (Claude)

14 November 2026. Provider: Claude (Claude Code worker), independent of U's Claude visual performer and Codex behavior performer. Task `task_5d47e0507580`, dispatch `ctx_705ac112f869`, worker terminal `term_ecf3c8a4-5fa2-4178-a64c-e72ed7f1e002`, coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. No helpers or subagents. No browser, build, server or preview was launched or driven. Only this file was written.

## Verdict

**Interface visual acceptance: FAIL at 320px. PASS at 1440×900 and 390×844 for the early gate, with listed corrections. Evidence is limited** to root's early dev-preview captures.

| Viewport / state | Verdict | Reason |
| --- | --- | --- |
| 1440×900 closed (home, right, corners) | PASS | Room fills the viewport; chrome is four compact plates; no hero column or scene card |
| 1440×900 project open | PASS | Readable paper sheet, visible Close, room still recognisable around it |
| 390×844 closed | PASS | One top bar and one bottom row; room and central screen dominate |
| 390×844 Projects list open | PASS with correction | Status pill collides with the open list (finding 3) |
| 390×844 and 320×844 project open | PASS | Near-full-height sheet, visible Close, body text reads comfortably, no clipped text |
| 320×844 closed | **FAIL** | Bottom row controls overlap; name wraps into the role line (findings 1 and 2) |

Two blockers, both in Claude's visual files (`app/studio/studio.module.css`, possibly `StudioShell.tsx` markup). No blocker is assigned to Codex mechanics. Two scene observations are flagged to root for S, not judged here.

## Blockers

### 1. 320px bottom row: look controls overlap the Projects toggle

Screenshots: `top-320.png`, `left-up-320.png`, `right-down-320.png` (same in every 320 closed capture).

The look plate sits on top of the Projects toggle. The toggle's chevron is hidden entirely and the look plate's left edge cuts into the word "Projects"; the left arrow sits almost against the label. The toggle loses its open/closed affordance and part of its hit area, and the row reads as broken. The performer's estimate of "roughly 10px spare" did not hold in a real render.

Fix (Claude visual performer, `studio.module.css`, `max-width: 22.49rem` block): stop forcing six controls into one row. The art direction allows two compact rows at 320. Preferred: put the toggle and the status hint on one row and the five look buttons on their own full-width row beneath, so chrome height stays close to today's (the hint row already exists). Do not shrink any button below 44px and do not drop the visible "Projects" label. Re-verify at 320 that the toggle shows label and chevron with clear space before the first arrow.

### 2. 320px top bar: name wraps and crowds the role line

Screenshots: `top-320.png`, `left-up-320.png`, `right-down-320.png`.

"Owen Cheung" breaks onto two lines. "Owen" is pushed against the top edge of the plate and "Cheung" sits directly on the mono role line, with no breathing room. The identity, the one piece of branding on the screen, looks like an overflow accident. At 390 (`top-390.png`) the same bar is clean.

Fix (Claude visual performer, same file): keep the name on one line at 320 (`white-space: nowrap` on `.name`, then recover the width from name size, link padding or link size until it fits without squeezing link targets under 44px). If it cannot fit honestly, move the three section links to their own row instead of letting the name wrap. Verify in a real 320 render; the source arithmetic was already wrong once.

## Corrections wanted, not blocking the early gate

### 3. 390px list open: status hint collides with the list

Screenshot: `right-390.png`. With Projects unfolded, the "Drag to look · Select a screen" pill sits flush on the list's top edge and over the mug. The hint is irrelevant while the list is open and it adds a third stacked layer. Fix (Claude, CSS): hide the status pill while `data-projects-open='true'` on compact layouts, keeping the failure-state notice unaffected. The open list plus bottom row then covers roughly the lower third of the screen, which is acceptable for a transient menu.

### 4. Heading focus ring reads as a text field

Screenshots: `panel-1440.png`, `panel-390.png`, `panel-320.png`. The focused project title carries a full rounded 2px box. Visible focus is correct and should stay, but a bordered box around the largest text on the sheet looks like an editable input and is the loudest element in the panel. Fix (Claude, CSS): keep a visible indicator but make it read as focus, for example a left rule or an underline in the same `--focus` colour, or reserve the full box for `:focus-visible` with a quieter treatment for programmatic focus. Codex focus behavior does not change.

### 5. Desktop project plate is the heaviest chrome and sits on the keyboard

Screenshots: `initial-1440.png`, `right-1440.png`. The bottom-left "Selected work" plate is the largest plate and at home covers the left part of the keyboard and desk mat, the foreground the art direction calls the memorable object. It does not touch the central project screen, so the gate holds. In `right-1440.png` keycaps ghost through the plate behind the label; text stays legible. Suggested (Claude, CSS): tighten the plate (narrower, less vertical padding, or drop the "Selected work" eyebrow that the monitors already carry). Optional polish, designer's call.

### 6. Identity plate clips the pendant light at home

Screenshot: `initial-1440.png`. The lit strip emerges from directly under the identity plate's right edge, so the brightest object in the frame is cut by chrome. Minor. Either owner could resolve it; flagged to root rather than assigned.

## What works (actual images)

- **Room dominance.** In every closed capture the canvas reaches all four edges behind the chrome. No hero column, no bordered scene card, no caption frame. Against `final-first-1440.png` and `final-first-390.png` (large name, intro column, boxed diorama) this is a clear change of kind, not degree. Compared with the Jesse captures only for authored depth and lighting; the interior fixed-eye target is met and nothing reads as an exterior orbit.
- **Compact chrome.** Desktop: identity top left, Work/About/Contact top right, project list bottom left, hint and look controls bottom right. Eyeballed from the image, closed chrome is around a tenth of 1440×900 and around a sixth of 390×844, inside the 20% and 25% gates. These are visual estimates, not DOM measurements.
- **Plates stay legible** over the brightest content available in these captures (pendant light, triangle lamps, window, white keys).
- **Central project screen is clear of chrome** at desktop home and 390 home.
- **Reading sheet.** Desktop sheet is a comfortable measure on paper with a clear type hierarchy (mono eyebrow, Georgia title, sans body, fact row). The backdrop dims the room but the monitors, window and desk remain recognisable. Close is a visible labelled pill top right in all three widths. On phones the sheet takes nearly the full height with a thin strip of room above; titles wrap cleanly and no text is clipped or overflowing at 390 or 320.
- **Look controls** render as a quiet five-button group with a visible pressed state (`right-1440.png`, `right-down-320.png`), not a game HUD.

## 44px controls

Source (`studio.module.css`) sets 44px minimums on anchors, look buttons, the Close button and the toggle (58px tall), and in the images the look buttons and Close appear at about that size. I cannot certify hit sizes from screenshots. Root should measure rendered boxes, in particular the compact top-bar links (their container drops its min-height on phones) and the 320 toggle after the fix for finding 1, whose usable area is currently reduced by the overlap.

## Flags to root for S (scene scope, not judged here)

- `top-320.png`: at 320 home the central project monitor is wider than the viewport; both edges are cropped and the "Selected work" eyebrow starts at the left screen edge. Mobile framing may need a wider field of view or adjusted yaw at 320.
- `top-320.png` and `initial-390.png` are visibly hazier and lower in contrast than `top-390.png` and the 320 corner captures. This looks like a capture taken during the canvas fade-in, not a settled frame. Please recapture `top-320.png` after settle before anyone judges 320 scene atmosphere from it.

## Evidence inspected

Early captures under `.omx/artifacts/visual-ralph/portfolio-immersive-v2/early/`, viewed at native size (SHA-256 prefix):

| File | SHA-256 (first 16) |
| --- | --- |
| `initial-1440.png` | `cc1d6a2ad7371dcd` |
| `right-1440.png` | `6cafc2bd202c43ff` |
| `panel-1440.png` | `a08c9bd98e01b7f6` |
| `top-390.png` | `6efbbf629113ce4a` |
| `right-390.png` | `569fcbb1ac01b70c` |
| `panel-390.png` | `1fb6101f355ed323` |
| `top-320.png` | `9349f505b91eb20e` |
| `panel-320.png` | `ba5f2c4559ed26cc` |
| `initial-390.png` (superseded, context only) | `18f1723d03dfaef4` |
| `left-down-1440.png` (corner, interface overlap only) | `c522c9249ec259d7` |
| `left-up-320.png` (corner, interface overlap only) | `6c4975c89f81c8ca` |
| `right-down-320.png` (corner, interface overlap only) | `d1453bb17f7a61db` |

Baselines and references: `.omx/artifacts/visual-ralph/portfolio-after-hours-v1/final-first-1440.png`, `final-first-390.png`; `.omx/context/jesse-reference-entry-20261114.png`, `jesse-reference-look-20261114.png`.

Not inspected: the other five corner captures (`left-up-1440`, `right-up-1440`, `right-down-1440`, `left-down-320`, `right-up-320`); enclosure across the look cone is S critique scope.

Documents read: `.omx/specs/studio-v2/common.md`, `.omx/plans/prd-immersive-studio-v2.md`, `test-spec-immersive-studio-v2.md`, `immersive-v2-art-direction.md`, `immersive-v2-agent-routing.md`, `.omx/context/immersive-v2-early-render.md`, `design/studio-v2/interface/contract.md`, `visual-critique-spec.md`, `visual-performer.md`.

Source reviewed read-only (compact-layout and control-size rules only), hashes computed by me and matching root's `early/source-hashes.json`:

| File | SHA-256 |
| --- | --- |
| `app/studio/studio.module.css` | `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a` |
| `app/studio/StudioShell.tsx` | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |
| `app/studio/page.tsx` | `f811dc5eca892e911650eb61cf3f859fe9ceba2b725cd95d3ac39a546f4d7314` |
| `components/studio/StudioExperience.tsx` | `e4a2207e8664a1f755d81fbf00442223f99c55bf5b93ca22cb0063a9a7a30ed6` |
| `components/studio/ProjectEvidence.tsx` | `7242983f72892b81591848fbb5d81d39d61a4e6ae8f9ee3a7333e0a4b54b4e91` |

## Limits

- All images are from a Next dev preview in a desktop browser resized to 390 and 320 at DPR 1. No production build, touch emulation, physical phone, safe-area inset or iOS Safari evidence.
- Not seen in any image, so not judged: keyboard focus rings on plates and look buttons, hover states, the 320 Projects list open, the mobile sheet scrolled to its end and its links, the desktop sheet scrolled, the no-JS page, the pre-hydration frame and list fold flash, the graphics-failure notice, loading/still backdrop, reduced motion, About and Contact sections below the room, short-landscape layout.
- Root's reported facts (panel width equals viewport at 390/320, no horizontal overflow, pose unchanged on open/close) are taken as reported; the images are consistent with them but I did not measure.
- A fresh 320 closed capture after fixes 1 and 2, plus a 320 list-open capture, is needed before 320 can pass.
