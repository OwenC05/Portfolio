# U 320px shell repair — Claude visual performer

15 November 2026. Provider: Claude (Claude Code worker, model `claude-fable-5-2`). Task `task_f5f789f6baed`, dispatch `ctx_cd29096f7c3a`, worker terminal `term_bc2e7c69-0c51-4eb6-806a-6aebf3e46eed`, coordinator `term_ae45b53b-074c-420f-aae1-e93e92acadfb`. No helpers or subagents. No server, build, browser or preview was launched. No paid tools.

**Status: source ready, not rendered.** The repair has not been seen in a browser. Root must capture 320/390/1440 and an independent Claude critic must judge it. This report does not claim visual or product acceptance.

## Scope

Blockers 1 and 2 of `visual-critique.md` only: the 320px look-controls/Projects overlap and the 320px name/role crowding. Findings 3 to 6 were not touched.

## Files

| File | Change | SHA256 |
| --- | --- | --- |
| `app/studio/studio.module.css` | Edited, `max-width: 22.49rem` block only | before `04b55c973d556b8a4c2fe396f3a7f4ccbb422a3e9577e55d373cdc608582691a`, after `ce72d40af43223b33bc77dbdfd810ac38caaadb50af30916b25f1e3907bf1432` |
| `app/studio/StudioShell.tsx` | **Not changed** (markup, props, IDs, data attributes, callbacks frozen) | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |
| `design/studio-v2/interface/320-repair-performer.md` | This report | n/a |

Every changed rule sits inside the existing `@media (max-width: 22.49rem)` block (viewports up to 359px). Rules that apply at 390px and 1440px are byte-identical to before. No class was added, renamed or removed.

## Evidence read before deciding

Viewed at native size: `top-320.png`, `left-up-320.png`, `right-down-320.png`, `top-390.png`, `initial-1440.png` under `.omx/artifacts/visual-ralph/portfolio-immersive-v2/early/`. Both defects are visible in all three 320 captures; 390 and 1440 are clean and were treated as the reference to preserve.

## Changes and why

### Blocker 1: look controls over the Projects toggle

Cause: at 320 the dock has 304px. The look plate needs about 244px and the toggle about 91px plus an 8px gap, about 343px in total, so the right-aligned look plate ran left over the toggle.

Repair: two control rows in the working room.

- Row 1: Projects toggle on the left, the status hint on the right, vertically centred on the toggle.
- Row 2: the five look buttons on their own full-width row. The plate stretches to the dock width and each button grows equally, so targets become roughly 56×44 instead of 44×44. Nothing shrinks.
- The toggle keeps its visible "Projects" label and chevron. Its height goes from 58px to 48px (still above 44px) so bottom chrome grows by about 27px, from roughly 103px to roughly 130px of an 844px screen.
- The project list still unfolds directly above the toggle row. As a side effect the hint no longer sits between the list and the toggle at 320.
- The hint gets a 0.8rem radius and balanced wrapping at this width, so the longer loading message can wrap to two lines beside the toggle without becoming a distorted pill.

The new row arrangement is scoped to `data-enhanced='true'` and not `data-room-state='unavailable'`. The no-JS page and the graphics-failure layout hide both the toggle and the look controls, so they had no overlap and keep their previous stacked order unchanged.

### Blocker 2: name wraps onto the role line

Cause: the name column had about 105.6px and "Owen Cheung" in 17.6px Georgia needs about 106px, so it broke by a fraction of a pixel.

Repair:

- `.name` is `white-space: nowrap` at 1rem (was 1.1rem), about 97px in Georgia.
- Section links lose 1px of side padding each (0.42rem to 0.36rem). The narrowest link, Work, stays about 47px wide and 44px tall.
- Estimated spare width on the name line is now about 13px.
- The bar switches from grid to wrapping flex at this width only. Normal result is the same picture as 390: name left, links right, role beneath. If a device substitutes a wider serif and the name still cannot fit, the links move to their own line. The name never folds onto the role and never runs under the links. In that fallback the visual order is name, links, role.

Native dialog rules, focus rules, scene, camera, content and global CSS were not touched.

## Validation (source only)

Run from the repository root.

| Command | Exit | Result |
| --- | --- | --- |
| `npx prettier --check app/studio/studio.module.css` | 0 | Formatted |
| `node <scratchpad>/check.cjs` (PostCSS parse of the CSS; every `styles.*` name in `StudioShell.tsx` and all 13 frozen ProjectEvidence classes must be defined) | 0 | Parse ok; 31 shell classes, none missing; frozen classes all present |
| `sha256sum app/studio/studio.module.css app/studio/StudioShell.tsx` | 0 | Hashes as in the table above |
| `npx prettier --check app/studio/studio.module.css app/studio/StudioShell.tsx` | 1 | CSS passes; `StudioShell.tsx` reports a style warning. The file is unchanged at the frozen hash, so the warning predates this task and was left alone |

An earlier inline version of the class check exited 1 because of a shell-escaping mistake in my own one-liner; it was replaced by the script file above. The check script lives in the session scratchpad and is not part of the repository.

No behavior tests, type check, lint, build or browser run were executed.

## Unrendered limits

- All widths above are arithmetic from font metrics. The previous performer's arithmetic was wrong once at this exact width, so treat every number as an estimate until root measures it.
- Needed captures at 320×844: closed home, Projects list open, and the loading hint ("Setting up the studio · Projects are ready to open"), which is expected to wrap to two lines beside the toggle.
- Needed regression captures: 390 closed and 1440 closed, expected unchanged.
- Not verified: rendered hit sizes of the toggle, look buttons and section links at 320; Android or other devices without Georgia, where the links-on-own-line fallback may engage; safe-area insets; widths between 320 and 359; short-landscape windows narrower than 360px.
- The scene flags in the critique (monitor cropped at 320, hazy capture) belong to S and are unaffected.
