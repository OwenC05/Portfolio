# 320px shell repair — independent visual critique (Claude)

15 November 2026. Provider: Claude (Claude Code worker, model `claude-fable-5-2`), distinct from the original shell author and from the 320px repair performer (`task_f5f789f6baed`). Task `task_99f96a35b445`, dispatch `ctx_3eeb1435e372`, worker terminal `term_fd2e3ab9-32cf-485a-93d5-1216e953d3b3`, coordinator `term_46e0ad40c09a2219361e1f5fa285112b`. No helpers or subagents. No browser, server, build or preview was used. Product source was read only. Files written: this report and `320-repair-visual-critique-evidence.json`.

## Verdict

| Item | Verdict | Reason |
| --- | --- | --- |
| Blocker 1: look controls over the Projects toggle at 320 | **PASS** | Toggle and look controls are on separate rows with clear space in closed, list-open and loading states |
| Blocker 2: name wraps and crowds the role at 320 | **PASS** | "Owen Cheung" is on one line, clear of the links and the role line, nothing clipped |
| 390 shell preservation | **PASS, with an evidence caveat** | `closed-390.png` is byte-identical to `early/top-390.png` |
| 1440 shell preservation | **PASS, with an evidence caveat** | `closed-1440.png` is byte-identical to `early/initial-1440.png` |
| New blocking findings | **None** | Two small non-blocking notes below |

No repair is requested. This is bounded visual approval of the 320px shell repair in these five images only. It is not acceptance of the final product, scene, behavior, performance, production build or any physical device.

## Blocker 1 — resolved

Seen in `closed-320.png`, `projects-open-320.png` and `loading-320.png`, each at native size and in 3× crops of the dock.

- **Closed.** The Projects plate sits alone at the left of the upper row with its full label and chevron visible. The hint pill is on the same row at the right, with a gap of roughly 25px between them. The five look buttons are on their own full-width row beneath, with about 8px of room showing between the two rows. Nothing touches or overlaps. In `early/top-320.png` the look plate covered the chevron and the end of "Projects"; that is gone.
- **List open.** The list unfolds directly above the toggle row as one plate. The toggle label turns amber and the chevron flips down, so the open state is legible. The three project titles read cleanly, the longest wraps to two tidy lines, and each row keeps its number and arrow. The list does not touch the toggle, the hint or the look row.
- **Loading.** The longer message wraps to two centred lines in a rounded plate beside the toggle, about 8px from it, and stays inside the right margin. It is fully readable. Toggle and look row are unchanged.
- **Look row.** Four arrows, a divider and reset are evenly spaced across the full width and read as one quiet group, consistent with 390.

Root measured Projects at y722/h48/w≈91 and the look buttons at y785/h44/w56 with document width equal to viewport width at 320. Those are root's measurements, not mine. The images are consistent with them: the two rows do not intersect and nothing reaches the screen edge. Screenshots cannot certify physical hit areas or assistive-technology behavior.

## Blocker 2 — resolved

Seen in all three 320 images (the top bar is the same in each) and in a 3× crop.

- The name is on one line in the serif, with about 23px of clear space before "Work".
- The mono role line sits on its own line beneath with comfortable leading. No letter touches the plate edge, the links or the role.
- Work, About and Contact are all fully visible inside the plate, with "Contact" clear of the right edge.
- The bar now reads as the same picture as 390, slightly smaller. The name is visibly a little smaller than at 390; that is the intended trade and it still reads as the identity.

The links-on-their-own-line fallback for wider substitute fonts did not engage here and so was not seen.

## 390 and 1440 preservation

`closed-390.png` and `closed-1440.png` have the same SHA-256 as `early/top-390.png` and `early/initial-1440.png` respectively. I viewed both pairs and they are the same picture: 390 keeps the single top bar, hint pill above a single row with the 58px-tall toggle and 44px look buttons; 1440 keeps the four compact plates.

**Caveat.** Byte identity means zero pixel change, which is the strongest preservation result possible if these are fresh renders. I cannot tell from the files alone whether they are fresh renders or copies of the early files. Supporting a fresh render: the new files carry capture-time timestamps (00:21 UTC on 15 November, ten minutes after the CSS was last written), and root's capture record lists per-capture pose and control rectangles for both. A deterministic scene at DPR 1 with reduced motion can plausibly reproduce the same bytes. Root should confirm in one line that both were re-rendered against CSS `ce72d40a…`. If they were copied, this row has no rendered evidence and rests on source only.

Source check, read only: every rule in the performer's description sits inside the single `@media (max-width: 22.49rem)` block (lines 551–631 of `studio.module.css`), which cannot apply at 390 or 1440. I have no copy of the pre-repair file, so I did not diff the rest of the stylesheet; the U coordinator's hash record and the identical renders cover that.

## New narrow-layout regressions

None blocking. Two notes for the designer's discretion, no action required for this gate:

1. `loading-320.png`: the first line of the wrapped hint ends in a dangling "·" separator ("Setting up the studio ·" / "Projects are ready to open"). It reads fine but the dot is redundant once the line breaks. Optional polish in the performer's CSS or copy slot; not worth a repair cycle on its own.
2. `projects-open-320.png`: the "Drag to look · Select a screen" hint stays visible beside the toggle while the list is open. At 320 it no longer collides with the list, so this is better than the 390 situation in original finding 3, which remains open and out of scope here.

**Room area.** Bottom chrome is two rows, about 115px tall, against one row of about 60px before. With the top bar, closed chrome still covers under a quarter of the 844px height by eye. The central monitor, upper monitor, keyboard and desk edge are all clear of chrome in `closed-320.png`. With the list open, chrome covers the keyboard and lower third, which is acceptable for a transient menu and matches the earlier 390 judgment.

**Controls intact.** All six bottom controls and three section links are present and legible in every 320 image.

## Not judged

- Scene appearance. `closed-320.png` is crisper and higher in contrast than `early/top-320.png`; the earlier capture was flagged as hazy, probably mid fade-in. That difference is scene and capture timing, not this CSS repair. The central monitor is still cropped at both edges at 320; that flag stays with S.
- Whether the look buttons should appear or be inert while the scene loads. They are visible in `loading-320.png`; that is behavior, owned by Codex.
- Original findings 3 to 6, focus rings, the reading sheet, the no-JS and graphics-failure layouts.

## Evidence limits

- Images are from a development preview in isolated Chromium at DPR 1 with reduced motion, using the procedural scene. They are not final authored-asset, production or device screenshots.
- `loading-320.png` was captured by root holding the real StudioScene chunk. After capture, release and unroute, root's harness hit `route.continue: Route is already handled!`. Root's separate live read then found ready status and exactly one canvas. This is recorded as a harness cleanup failure. I saw no sign of a product error in the image and do not infer one.
- Not seen, so not judged: widths between 321 and 359px, short landscape, safe-area insets, touch emulation, real phones, fonts other than the ones rendered here, keyboard focus on the new rows, hover and pressed states at 320, and the list-open state while loading.
- Rendered box sizes, document widths and pose values are root's. I measured nothing in a browser.

## Evidence inspected

Images, all viewed at native size, under `.omx/artifacts/visual-ralph/portfolio-immersive-v2/`. Full hashes are in `320-repair-visual-critique-evidence.json`.

| File | Size | SHA-256 (first 16) |
| --- | --- | --- |
| `interface-320-repair/closed-320.png` | 320×844 | `2867e36a4f5084cf` |
| `interface-320-repair/projects-open-320.png` | 320×844 | `d8997228f645e7fd` |
| `interface-320-repair/loading-320.png` | 320×844 | `2498fc388f3275c3` |
| `interface-320-repair/closed-390.png` | 390×844 | `6efbbf629113ce4a` |
| `interface-320-repair/closed-1440.png` | 1440×900 | `cc1d6a2ad7371dcd` |
| `early/top-320.png` (baseline) | 320×844 | `9349f505b91eb20e` |
| `early/top-390.png` (baseline) | 390×844 | `6efbbf629113ce4a` |
| `early/initial-1440.png` (baseline) | 1440×900 | `cc1d6a2ad7371dcd` |

I also made 3× enlargements of the 320 top bar and dock in a temporary scratch folder to check edges and gaps. They are derived from the files above and were not kept.

Source hashes computed by me, matching root's binding:

| File | SHA-256 |
| --- | --- |
| `app/studio/studio.module.css` | `ce72d40af43223b33bc77dbdfd810ac38caaadb50af30916b25f1e3907bf1432` |
| `app/studio/StudioShell.tsx` | `bcae10c0b983b1295b4d13e4ff1777c25fe9af224ebf2aee865c146fdb62eca8` |

Documents read: `.omx/plans/immersive-v2-agent-routing.md`, `visual-critique.md`, `320-repair-performer.md`, `320-repair-coordination.md`, `320-repair-visual-critique-spec.md`, `.omx/context/studio-320-repair-capture.json`.
