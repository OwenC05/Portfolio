# Studio v2 full-room kit — render gates

15 November 2026. Claude (actual), task `task_069e146abc59`, dispatch `ctx_8446c84f0a28`. Plan only; no image named below exists yet. Companion to `art-direction.md` and `asset-inventory.json`.

## Rules for every gate

- A gate passes only on images someone opened at normal size. Triangle counts, source review, validator output and my own opinion of my own assets are not look evidence.
- **Blender gates (G0–G6)** show direction and catch modelling faults. They never establish how anything looks in the site.
- **Runtime gates (R1–R4)** are root's captures of the real renderer. Only these can pass material, light and framing.
- Look verdicts come from an independent Claude critic, not the kit's author. Structure, picking, lifecycle and measured budgets are Codex's.
- Every image is recorded with path, size, sha256 and Blender's own `RenderTime`. A failed or superseded image is kept and labelled, not deleted.
- Luminance figures are 0–255 means over a named crop; "clipped" means all three channels at 250 or above.
- One camera per Blender process, previews before full size, as set out in `art-direction.md` section 10.

## Baseline these gates compare against

Root's development captures in `.omx/artifacts/visual-ralph/portfolio-immersive-v2/pilot-runtime-v01/`, taken at `build-studio.ts` `d8abf67f…`: `home`, `music`, `right-up`, `right-down` at 1440, 390 and 320 (hashes in `art-direction.md` section 1). They are not product acceptance. When root recaptures the tuned source (`e23588e2…` or later), that set replaces these as the "before" images, and the gate that uses them names the hash.

## Cameras

All at the frozen eye, Blender `(-0.35, -1.70, 1.345)` m, vertical sensor fit.

| Name | Yaw, pitch | FOV | Size |
| --- | --- | --- | --- |
| `home-1440` | −4, −6 | 58 | 1440×900 |
| `home-1024` | −4, −6 | 58 | 1024×768 |
| `music-1440` | 44, −8 | 58 | 1440×900 |
| `left-up`, `left-down`, `right-up`, `right-down` | ±limits | 58 | 1440×900 |
| `home-390`, `home-320` | −13, −8 | 64 | 390×844, 320×844 |
| `home-320-f70`, `-f74`, `-f76` | −14, −7 | 70, 74, 76 | 320×844 |
| `home-390-f74` | −14, −7 | 74 | 390×844 |
| `music-390`, `music-320` | 44, −8 | as decided in P1 | phone sizes |
| `pano-eye` | equirectangular from the eye | — | 1024×512 |

## Blender gates

### G0 — library (after M0)

| Image | Pass |
| --- | --- |
| `fk-00/renders/swatch-board.png`, 720×450: every library material on a bevelled tile and a sphere, under the light reference rig | All eleven materials present; one dark and one honey timber only; plaster reads olive, not ochre; no emitter tile clipped over more than 2% of its area |
| `fk-00/renders/bevel-card.png`: the four bevel classes on one block beside a 1 m rule | Each class shows a distinct highlight; no faceting |

Stop if the plaster or timber tones cannot be told apart from the look frame's amber grade.

### G1 — enclosure, blockout, and the two decisions (after M1)

| Image | Pass |
| --- | --- |
| `fk-10/renders/pano-eye.png` with the coverage envelope drawn (azimuth −95 to +115, elevation −55 to +50) | No void, backface or unfinished surface inside the envelope; pixels under luminance 10 are less than 5% of the envelope area |
| `home-320`, `home-320-f70`, `-f74`, `-f76`, `home-390`, `home-390-f74`, half size, proxies for furniture | Decision P1. For the chosen case: whole central bezel inside the frame with at least 12 px each side at 320 and 20 px at 390, measured on the full-size frame |
| `home-1440`, `home-390-f74`, `home-320-f74` twice each: prototype sizes and tier sizes | Decision P2. Chosen set keeps keyboard, mouse and mug inside the 320 frame |
| `home-1440`, `music-1440`, `left-down`, `right-down` blockout with chrome rectangles overlaid | Every required item in `art-direction.md` section 4.4 has an unobstructed appearance of at least 40% of its silhouette in one of its listed poses |
| `right-up` at 1440×900, one full-size still | Door, architrave, window frame and beams read as the same two timbers; ceiling crop mean at least 20 |
| Byte ledger (not an image): stage GLB size, gzip size, bytes per triangle | Recorded. Above 12 gzip bytes per triangle triggers the ceiling cut in `art-direction.md` section 9 |

G1 is the only gate that can change the plan. Nothing in M2–M5 starts until P1 and P2 are recorded by root.

### G2–G5 — one per asset stage

Each stage delivers the same four things:

| Image | Pass |
| --- | --- |
| Isolated grey turnaround of each new asset family beside a 1 m rule and its prototype counterpart from the baseline captures | Identifying features present (listed per asset in the inventory notes); library materials only; bevel class correct; tier size within 3% |
| The stage's two hero cameras at 720×450, then at most three full-size stills | Nothing floats, intersects or z-fights; every supported object shows contact |
| One phone camera, half size | Stage's required gear still identifiable at 320 |
| Stage ledger: unique and placed triangles, mesh groups, casters | Within the stage ceilings in `asset-inventory.json` |

Stage-specific checks:

- **G2 workstation** (`home-1440`, `left-down`): each target face and border is a single flat quad with the stated gaps, confirmed from the export, not the picture; bezels read as thin frames; cables sag; the white PC's front and fan rings are visible in `home-1440` outside the chrome rectangles.
- **G3 nearfield** (`home-1440`, `home-320` as decided): keyboard, mouse and mug sit at one scale (mouse spans three to four key pitches); the mouse is symmetric with two button splits and a wheel, with no cable, side disc or facets; the mic no longer reads as stacked dark blobs; headphones are visible outside the project-list rectangle.
- **G4 music** (`music-1440`, `right-down`, `music-320`): 29 white and 20 black keys countable, body white, no branding; controller spans at least 30° of azimuth in `music-1440`; cymbals show bell and edge; kick pedal, hi-hat pedal and sustain pedal each identifiable in `right-down`.
- **G5 walls** (`left-up`, `left-down`, `music-1440`): at least 40% of the snowboard silhouette visible in `left-down`, bindings readable as bindings; wall triangles show a core and a falloff with under 2% clipped; book spines blank.

### G6 — assembly (after M6, before any runtime load)

| Image | Pass |
| --- | --- |
| `pano-eye` of the full room | As G1, with final geometry |
| `home-1440`, `music-1440`, `right-up`, `left-down` full size, one process each | Direction check against G1–G5; no regressions |
| `home-390`, `home-320`, `music-320` at the agreed lens | Bezel margins as agreed in P1 |
| Full ledger and validator result | Planned totals within the design ceilings; Codex's full-kit validator exits 0 |

## Runtime gates (root captures, real renderer)

Captured with the procedural room still available as rollback, any transition veil cleared, and the source and GLB hashes bound in the receipt.

### R1 — capture matrix

`home`, `music`, `left-up`, `left-down`, `right-up`, `right-down`, mid-left and mid-right at 1440×900; `home` at 1024×768; `home`, `music`, left limit, `right-up`, `right-down` at 390×844 and 320×844; `home` at 320×568; one project open at each width.

### R2 — measurable look checks

| Check | Image | Pass |
| --- | --- | --- |
| Central bezel margin | `home-320`, `home-390` | At least 12 px and 20 px each side |
| Central screen legible | `home-1440`, `home-320` | Screen at least 400 px and 270 px wide |
| Keycap read | `home-1440`, `home-320` | Pitch at least 16 px and 11 px; pastel accents distinguishable |
| Right limit not black | `right-up-1440` | Door within 15% of the adjacent wall's mean; ceiling crop mean at least 20; under 5% of the frame below 10 |
| Emitters hold form | Any view with shade, pendant or triangles | Under 2% of each emitter's crop clipped |
| One trim timber | `right-up-1440`, `right-down-1440` | Beam, window frame and architrave crops within 15% of each other in mean hue and value |
| Walls not flat | `home-1440`, `home-390` | Wall above the screens shows a visible gradient: 10th to 90th percentile spread of at least 25 |
| Palette | `home-1440` | Wall mean stays olive (green channel not below red by more than 10%); no amber cast |
| Required gear | Poses in `art-direction.md` section 4.4 | Each item visible outside chrome in a listed pose at each listed width |
| No voids | Whole matrix | No exterior, backface, gap, floating object or z-fighting in any frame |

### R3 — technical measurements (Codex and root, listed so the look gates do not stand in for them)

Compressed transfer of scene JavaScript and assets at most 1.5 MB with encoding stated; peak draws at most 200 and triangles at most 200k from the renderer at initial and settled views; DPR within caps; one shadow caster; picking on all three targets from home, and no selection of a hidden screen from the music view; failure and context-loss fallbacks unchanged.

### R4 — independent verdict and reconciliation

- An independent Claude critic reviews R1 at normal size against R2 and the baseline, and names any view that fails.
- The runtime artist's override table is listed with the capture. For final acceptance it is empty, with its values folded into the library and re-exported.
- The receipt names the `build-studio.ts`, `view-config.ts` and GLB hashes current at capture. Any lighting change after this plan's snapshot is reconciled here, once, not chased during authoring.

## What is not evidence

Blender stills for any runtime claim; the generated look frame for layout, colour cast or finish; the raw mouse mesh for anything but proportion; development captures for product acceptance; a passing validator for appearance.

## Open at the time of writing

- No gate has been run. This file defines them.
- P1 and P2 thresholds (12 px, 20 px, 16 px, 11 px, 30°) are my proposals and can be changed by root before G1.
- The 320×844 viewport is taller than any 320-wide device I know of; `home` at 320×568 is included so the lens choice is also judged on a realistic small phone.
